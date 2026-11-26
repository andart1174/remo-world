/**
 * Netlify Serverless Function: REMO Economy, Anti-Teleport GPS & Rate-Limit Engine
 * Server-authoritative validation for high-value REMO Coin claims & transfers:
 * - claim_geovault: server Haversine distance + anti-teleport speed check (< 950 km/h) + deduplication
 * - claim_flash_drop: server-side active event check + deduplication (immune to localStorage reset)
 * - tip_user: atomic server-side debit + credit (eliminates infinite coin printing)
 * - claim_action_reward: deduplicated, rate-limited rewards (duel vote, guess city, add city)
 */
const {
  FIREBASE_PROJECT_ID,
  parseServiceAccount,
  getGoogleAccessToken,
  httpsRequest,
  verifyFirebaseUserBearer,
  resolveSafeCorsHeaders,
  checkMemoryRateLimit,
  getClientIp,
  isValidSafePostId
} = require('../shared/html-vault-core');

const CLAIMS_COLLECTION = 'remo_security_claims';
const MAX_REALISTIC_SPEED_KMH = 950;
const MIN_GPS_CLAIM_GAP_MS = 15000;

function jsonRes(statusCode, payload, corsHeaders = {}) {
  return {
    statusCode,
    headers: Object.assign({
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate, private',
      'X-Robots-Tag': 'noindex, nofollow'
    }, corsHeaders),
    body: JSON.stringify(payload)
  };
}

function getProjectId() {
  const sa = parseServiceAccount();
  return (sa && sa.project_id) || FIREBASE_PROJECT_ID;
}

function docUrl(collection, docId) {
  return `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(getProjectId())}/databases/(default)/documents/${encodeURIComponent(collection)}/${encodeURIComponent(docId)}`;
}

function decodeVal(v) {
  if (!v || typeof v !== 'object') return null;
  if ('stringValue' in v) return v.stringValue;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return Number(v.doubleValue);
  if ('booleanValue' in v) return Boolean(v.booleanValue);
  if ('nullValue' in v) return null;
  if ('arrayValue' in v) {
    const arr = (v.arrayValue && Array.isArray(v.arrayValue.values)) ? v.arrayValue.values : [];
    return arr.map(decodeVal);
  }
  if ('mapValue' in v) {
    return decodeFields(v.mapValue && v.mapValue.fields);
  }
  return null;
}

function decodeFields(fields) {
  if (!fields || typeof fields !== 'object') return {};
  const out = {};
  for (const [k, v] of Object.entries(fields)) out[k] = decodeVal(v);
  return out;
}

function encodeVal(v) {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (typeof v === 'number') {
    if (Number.isInteger(v)) return { integerValue: String(v) };
    return { doubleValue: v };
  }
  if (typeof v === 'string') return { stringValue: v };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(encodeVal) } };
  if (typeof v === 'object') {
    const fields = {};
    for (const [k, val] of Object.entries(v)) {
      if (val !== undefined) fields[k] = encodeVal(val);
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(v) };
}

async function fsGetDoc(collection, docId, accessToken) {
  const res = await httpsRequest(docUrl(collection, docId), {
    method: 'GET',
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (res.statusCode === 404) return null;
  if (res.statusCode !== 200) throw new Error(`Firestore GET ${collection}/${docId} failed (${res.statusCode})`);
  const json = JSON.parse(res.body || '{}');
  return decodeFields(json.fields || {});
}

async function fsPatchFields(collection, docId, fieldsObj, accessToken) {
  const fieldPaths = Object.keys(fieldsObj);
  const maskQs = fieldPaths.map((f) => `updateMask.fieldPaths=${encodeURIComponent(f)}`).join('&');
  const fields = {};
  for (const k of fieldPaths) fields[k] = encodeVal(fieldsObj[k]);
  const res = await httpsRequest(`${docUrl(collection, docId)}?${maskQs}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  }, JSON.stringify({ fields }));
  if (res.statusCode < 200 || res.statusCode >= 300) {
    throw new Error(`Firestore PATCH ${collection}/${docId} failed (${res.statusCode})`);
  }
  return true;
}

async function fsCreateClaimOnce(claimId, dataObj, accessToken) {
  const fields = {};
  for (const [k, v] of Object.entries(dataObj)) fields[k] = encodeVal(v);
  const url = `${docUrl(CLAIMS_COLLECTION, claimId)}?currentDocument.exists=false`;
  const res = await httpsRequest(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  }, JSON.stringify({ fields }));
  if (res.statusCode === 409 || res.statusCode === 412 || res.statusCode === 400) {
    // 412 FAILED_PRECONDITION means document already exists -> duplicate claim blocked atomically!
    if (res.body && /ALREADY_EXISTS|FAILED_PRECONDITION|exists/i.test(res.body)) {
      return { created: false };
    }
  }
  if (res.statusCode < 200 || res.statusCode >= 300) {
    throw new Error(`Claim lock failed (${res.statusCode})`);
  }
  return { created: true };
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function resolveUserDoc(auth, accessToken) {
  const candidates = auth.isAdmin ? ['u_admin_founder', 'u_fb_' + auth.uid, auth.uid] : ['u_fb_' + auth.uid, auth.uid];
  for (const docId of candidates) {
    const doc = await fsGetDoc('remo_users', docId, accessToken);
    if (doc) return { docId, doc };
  }
  return { docId: auth.isAdmin ? 'u_admin_founder' : ('u_fb_' + auth.uid), doc: null };
}

async function checkAndRecordGpsAntiTeleport(uid, lat, lng, isAdminBypass, accessToken) {
  if (isAdminBypass) return { ok: true };
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return { ok: false, statusCode: 400, reason: 'invalid_gps' };
  }
  const gpsDocId = 'gps_' + uid.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64);
  const prev = await fsGetDoc(CLAIMS_COLLECTION, gpsDocId, accessToken);
  const now = Date.now();
  if (prev && Number.isFinite(prev.lat) && Number.isFinite(prev.lng) && Number(prev.ts) > 0) {
    const elapsedMs = Math.max(1, now - Number(prev.ts));
    const distKm = haversineKm(Number(prev.lat), Number(prev.lng), lat, lng);
    if (elapsedMs < MIN_GPS_CLAIM_GAP_MS) {
      return {
        ok: false,
        statusCode: 429,
        reason: 'cooldown',
        waitSec: Math.ceil((MIN_GPS_CLAIM_GAP_MS - elapsedMs) / 1000)
      };
    }
    const speedKmh = distKm / (elapsedMs / 3600000);
    if (distKm > 5 && speedKmh > MAX_REALISTIC_SPEED_KMH) {
      return {
        ok: false,
        statusCode: 403,
        reason: 'anti_teleport',
        distanceKm: Math.round(distKm),
        speedKmh: Math.round(speedKmh)
      };
    }
  }
  await fsPatchFields(CLAIMS_COLLECTION, gpsDocId, { uid, lat, lng, ts: now }, accessToken);
  return { ok: true };
}

exports.handler = async (event) => {
  const method = String((event && event.httpMethod) || 'POST').toUpperCase();
  const cors = resolveSafeCorsHeaders(event, { allowNullOrigin: false });
  if (!cors.ok) {
    return jsonRes(403, { ok: false, error: cors.reason || 'Forbidden origin' });
  }
  if (method === 'OPTIONS') {
    return { statusCode: 204, headers: Object.assign({ 'Allow': 'POST, OPTIONS', 'Cache-Control': 'no-store' }, cors.headers), body: '' };
  }
  if (method !== 'POST') {
    return jsonRes(405, { ok: false, error: 'Method not allowed' }, cors.headers);
  }

  const auth = await verifyFirebaseUserBearer(event);
  if (!auth.ok) {
    return jsonRes(auth.statusCode || 401, { ok: false, error: auth.error || 'Unauthorized' }, cors.headers);
  }

  // Per-UID & Per-IP rate limiting (prevents automated farming scripts)
  const ip = getClientIp(event);
  const rlUid = checkMemoryRateLimit('econ_uid:' + auth.uid, 20, 60000);
  const rlIp = checkMemoryRateLimit('econ_ip:' + ip, 40, 60000);
  if (!rlUid.allowed || !rlIp.allowed) {
    const retryAfter = Math.max(rlUid.retryAfterSec, rlIp.retryAfterSec);
    return jsonRes(429, { ok: false, reason: 'rate_limited', retryAfterSec: retryAfter }, Object.assign({}, cors.headers, { 'Retry-After': String(retryAfter) }));
  }

  if (!parseServiceAccount()) {
    return jsonRes(200, { ok: false, configured: false, reason: 'server_not_configured' }, cors.headers);
  }

  let body = {};
  try {
    body = JSON.parse(event.body || '{}');
  } catch (e) {
    return jsonRes(400, { ok: false, error: 'Invalid JSON body' }, cors.headers);
  }

  const action = String(body.action || '').trim().toLowerCase();
  try {
    const accessToken = await getGoogleAccessToken();
    const { docId: userDocId, doc: userDoc } = await resolveUserDoc(auth, accessToken);
    if (userDoc && userDoc.banned === true && !auth.isAdmin) {
      return jsonRes(403, { ok: false, reason: 'banned', error: 'Account suspended' }, cors.headers);
    }

    // 1. CLAIM GEO-VAULT (Server Haversine + Anti-Teleport + Atomic Deduplication)
    if (action === 'claim_geovault') {
      const vaultId = String(body.vaultId || '').trim();
      if (!isValidSafePostId(vaultId)) {
        return jsonRes(400, { ok: false, reason: 'invalid_vault' }, cors.headers);
      }
      const isAdminSim = Boolean(body.isSimulated && auth.isAdmin);
      const lat = Number(body.lat);
      const lng = Number(body.lng);

      const liveState = await fsGetDoc('remo_ecosystem', 'live_state', accessToken);
      const vaults = (liveState && Array.isArray(liveState.geoVaults)) ? liveState.geoVaults : [];
      const vault = vaults.find((v) => v && v.id === vaultId);
      if (!vault) {
        return jsonRes(404, { ok: false, reason: 'not_found' }, cors.headers);
      }

      const gpsCheck = await checkAndRecordGpsAntiTeleport(auth.uid, lat, lng, isAdminSim, accessToken);
      if (!gpsCheck.ok) {
        return jsonRes(gpsCheck.statusCode || 403, Object.assign({ ok: false }, gpsCheck), cors.headers);
      }

      const distKm = isAdminSim ? 0 : haversineKm(lat, lng, Number(vault.lat), Number(vault.lng));
      const radiusM = Math.max(50, Math.min(2000, Number(vault.radiusMeters || 350)));
      if (!isAdminSim && distKm > radiusM / 1000) {
        return jsonRes(403, { ok: false, reason: 'too_far', distanceKm: distKm, radiusMeters: radiusM }, cors.headers);
      }

      const claimId = `vault_${vaultId}_${auth.uid}`.slice(0, 120);
      const lock = await fsCreateClaimOnce(claimId, {
        type: 'geovault',
        vaultId,
        uid: auth.uid,
        lat: isAdminSim ? Number(vault.lat) : lat,
        lng: isAdminSim ? Number(vault.lng) : lng,
        ts: Date.now()
      }, accessToken);
      if (!lock.created) {
        return jsonRes(409, { ok: false, reason: 'already_claimed' }, cors.headers);
      }

      const coinsReward = Math.max(10, Math.min(500, Math.round(Number(vault.coinsReward || 250))));
      const nextCoins = Number((userDoc && userDoc.coins) || 0) + coinsReward;
      const nextLifetime = Number((userDoc && userDoc.lifetimeCoins) || nextCoins) + coinsReward;
      if (userDoc) {
        await fsPatchFields('remo_users', userDocId, { coins: nextCoins, lifetimeCoins: nextLifetime }, accessToken);
      }

      return jsonRes(200, {
        ok: true,
        configured: true,
        coinsWon: coinsReward,
        newBalance: nextCoins,
        distanceKm: distKm,
        vaultId
      }, cors.headers);
    }

    // 2. CLAIM FLASH SUPER DROP (Server Deduplication — Immune to localStorage Reset)
    if (action === 'claim_flash_drop') {
      const pubCfg = await fsGetDoc('remo_public_settings', 'config', accessToken);
      const liveState = await fsGetDoc('remo_ecosystem', 'live_state', accessToken);
      const fd = (pubCfg && pubCfg.flashDrop) || (liveState && liveState.settings && liveState.settings.flashDrop) || null;
      if (!fd || !fd.active || Number(fd.expiresAt || 0) <= Date.now()) {
        return jsonRes(400, { ok: false, reason: 'expired_or_inactive' }, cors.headers);
      }
      const eventKey = String(Math.floor(Number(fd.expiresAt)));
      const claimId = `flash_${eventKey}_${auth.uid}`.slice(0, 120);
      const lock = await fsCreateClaimOnce(claimId, {
        type: 'flash_drop',
        eventKey,
        uid: auth.uid,
        ts: Date.now()
      }, accessToken);
      if (!lock.created) {
        return jsonRes(409, { ok: false, reason: 'already_claimed' }, cors.headers);
      }

      const coinsWon = Math.max(10, Math.min(500, Math.round(Number(fd.coins || 300))));
      const nextCoins = Number((userDoc && userDoc.coins) || 0) + coinsWon;
      const nextLifetime = Number((userDoc && userDoc.lifetimeCoins) || nextCoins) + coinsWon;
      if (userDoc) {
        await fsPatchFields('remo_users', userDocId, { coins: nextCoins, lifetimeCoins: nextLifetime }, accessToken);
      }
      return jsonRes(200, {
        ok: true,
        configured: true,
        coinsWon,
        newBalance: nextCoins,
        bonusCardCityId: String(fd.bonusCardCityId || '')
      }, cors.headers);
    }

    // 3. ATOMIC USER-TO-USER TIP (Debits Sender + Credits Recipient Server-Side)
    if (action === 'tip_user') {
      const toUid = String(body.toUid || '').trim();
      const amount = Math.floor(Number(body.amount || 0));
      if (!isValidSafePostId(toUid) || toUid === userDocId || toUid === auth.uid) {
        return jsonRes(400, { ok: false, reason: 'invalid_recipient' }, cors.headers);
      }
      if (!Number.isFinite(amount) || amount < 1 || amount > 10000) {
        return jsonRes(400, { ok: false, reason: 'invalid_amount' }, cors.headers);
      }
      if (!userDoc) {
        return jsonRes(404, { ok: false, reason: 'sender_not_found' }, cors.headers);
      }
      const senderCoins = Number(userDoc.coins || 0);
      if (senderCoins < amount) {
        return jsonRes(400, { ok: false, reason: 'insufficient_coins', balance: senderCoins }, cors.headers);
      }
      const recipientDoc = await fsGetDoc('remo_users', toUid, accessToken);
      if (!recipientDoc) {
        return jsonRes(404, { ok: false, reason: 'recipient_not_found' }, cors.headers);
      }
      const nextSenderCoins = senderCoins - amount;
      const nextRecipCoins = Number(recipientDoc.coins || 0) + amount;
      const nextRecipLifetime = Number(recipientDoc.lifetimeCoins || nextRecipCoins) + amount;

      await fsPatchFields('remo_users', userDocId, { coins: nextSenderCoins }, accessToken);
      await fsPatchFields('remo_users', toUid, { coins: nextRecipCoins, lifetimeCoins: nextRecipLifetime }, accessToken);

      return jsonRes(200, {
        ok: true,
        configured: true,
        amount,
        senderBalance: nextSenderCoins,
        recipientBalance: nextRecipCoins
      }, cors.headers);
    }

    // 4. DEDUPLICATED ACTION REWARD (Duel Vote, Guess City, Add City)
    if (action === 'claim_action_reward') {
      const rewardType = String(body.rewardType || '').trim().toLowerCase();
      const targetId = String(body.targetId || '').trim();
      const REWARD_CAPS = {
        duel_vote: 20,
        guess_city: 15,
        add_city: 75,
        daily_streak: 50
      };
      if (!(rewardType in REWARD_CAPS) || !isValidSafePostId(targetId)) {
        return jsonRes(400, { ok: false, reason: 'invalid_reward_request' }, cors.headers);
      }
      const claimId = `act_${rewardType}_${targetId}_${auth.uid}`.slice(0, 120);
      const lock = await fsCreateClaimOnce(claimId, {
        type: rewardType,
        targetId,
        uid: auth.uid,
        ts: Date.now()
      }, accessToken);
      if (!lock.created) {
        return jsonRes(409, { ok: false, reason: 'already_claimed' }, cors.headers);
      }
      const rewardAmt = REWARD_CAPS[rewardType];
      const nextCoins = Number((userDoc && userDoc.coins) || 0) + rewardAmt;
      const nextLifetime = Number((userDoc && userDoc.lifetimeCoins) || nextCoins) + rewardAmt;
      if (userDoc) {
        await fsPatchFields('remo_users', userDocId, { coins: nextCoins, lifetimeCoins: nextLifetime }, accessToken);
      }
      return jsonRes(200, {
        ok: true,
        configured: true,
        rewardType,
        coinsWon: rewardAmt,
        newBalance: nextCoins
      }, cors.headers);
    }

    return jsonRes(400, { ok: false, error: 'Unknown economy action' }, cors.headers);
  } catch (err) {
    return jsonRes(500, { ok: false, error: (err && err.message) || 'Economy operation failed' }, cors.headers);
  }
};
