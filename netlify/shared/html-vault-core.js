/**
 * REMO World — Level 2 HTML Vault Core (Zero-Dependency Node.js)
 * - Private Firestore collection `remo_html_vault` via Google Service Account RS256 OAuth2
 * - Firebase Admin ID Token verification (for Admin-only publish / source read / delete)
 * - Ephemeral HMAC-SHA256 tickets (25s TTL) + strict iframe/origin enforcement
 * - Per-request randomized encrypted HTML envelope + Domain-Lock + Anti-Copy/Anti-Inspect Shield
 * - Safe read-only REMO_CONTEXT injection (city, GPS coords, EN/FR lang)
 */
const https = require('https');
const crypto = require('crypto');

const FIREBASE_PROJECT_ID = 'remo-world';
const VAULT_COLLECTION = 'remo_html_vault';
const ADMIN_EMAIL = 'andart1174@gmail.com';
const GOOGLE_CERTS_URL = 'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const TICKET_TTL_MS = 25000;
const MAX_HTML_BYTES = 450 * 1024;

const REMO_CITIES_COORDS = {
  montreal:   { id: 'montreal',   name_en: 'Montréal',       name_fr: 'Montréal',       flag: '⚜️', lat: 45.5017,  lng: -73.5673 },
  paris:      { id: 'paris',      name_en: 'Paris',          name_fr: 'Paris',          flag: '🗼', lat: 48.8566,  lng: 2.3522 },
  chisinau:   { id: 'chisinau',   name_en: 'Chișinău',       name_fr: 'Chișinău',       flag: '🇲🇩', lat: 47.0105,  lng: 28.8638 },
  bucharest:  { id: 'bucharest',  name_en: 'Bucharest',      name_fr: 'Bucarest',       flag: '🇷🇴', lat: 44.4268,  lng: 26.1025 },
  newyork:    { id: 'newyork',    name_en: 'New York',       name_fr: 'New York',       flag: '🗽', lat: 40.7128,  lng: -74.0060 },
  tokyo:      { id: 'tokyo',      name_en: 'Tokyo',          name_fr: 'Tokyo',          flag: '🏯', lat: 35.6762,  lng: 139.6503 },
  london:     { id: 'london',     name_en: 'London',         name_fr: 'Londres',        flag: '🏰', lat: 51.5074,  lng: -0.1278 },
  dubai:      { id: 'dubai',      name_en: 'Dubai',          name_fr: 'Dubaï',          flag: '🌆', lat: 25.2048,  lng: 55.2708 },
  miami:      { id: 'miami',      name_en: 'Miami',          name_fr: 'Miami',          flag: '🌴', lat: 25.7617,  lng: -80.1918 },
  barcelona:  { id: 'barcelona',  name_en: 'Barcelona',      name_fr: 'Barcelone',      flag: '☀️', lat: 41.3874,  lng: 2.1686 },
  rome:       { id: 'rome',       name_en: 'Rome',           name_fr: 'Rome',           flag: '🏛️', lat: 41.9028,  lng: 12.4964 },
  toronto:    { id: 'toronto',    name_en: 'Toronto',        name_fr: 'Toronto',        flag: '🍁', lat: 43.6532,  lng: -79.3832 },
  monaco:     { id: 'monaco',     name_en: 'Monaco',         name_fr: 'Monaco',         flag: '🏎️', lat: 43.7384,  lng: 7.4246 },
  losangeles: { id: 'losangeles', name_en: 'Los Angeles',    name_fr: 'Los Angeles',    flag: '🎬', lat: 34.0522,  lng: -118.2437 },
  seoul:      { id: 'seoul',      name_en: 'Seoul',          name_fr: 'Séoul',          flag: '⚡', lat: 37.5665,  lng: 126.9780 },
  geneva:     { id: 'geneva',     name_en: 'Geneva',         name_fr: 'Genève',         flag: '⌚', lat: 46.2044,  lng: 6.1432 },
  singapore:  { id: 'singapore',  name_en: 'Singapore',      name_fr: 'Singapour',      flag: '🦁', lat: 1.3521,   lng: 103.8198 },
  sydney:     { id: 'sydney',     name_en: 'Sydney',         name_fr: 'Sydney',         flag: '⛵', lat: -33.8688, lng: 151.2093 },
  rio:        { id: 'rio',        name_en: 'Rio de Janeiro', name_fr: 'Rio de Janeiro', flag: '🎭', lat: -22.9068, lng: -43.1729 },
  istanbul:   { id: 'istanbul',   name_en: 'Istanbul',       name_fr: 'Istanbul',       flag: '🕌', lat: 41.0082,  lng: 28.9784 },
  berlin:     { id: 'berlin',     name_en: 'Berlin',         name_fr: 'Berlin',         flag: '🎧', lat: 52.5200,  lng: 13.4050 },
  amsterdam:  { id: 'amsterdam',  name_en: 'Amsterdam',      name_fr: 'Amsterdam',      flag: '🚲', lat: 52.3676,  lng: 4.9041 },
  lisbon:     { id: 'lisbon',     name_en: 'Lisbon',         name_fr: 'Lisbonne',       flag: '🚋', lat: 38.7223,  lng: -9.1393 },
  cairo:      { id: 'cairo',      name_en: 'Cairo',          name_fr: 'Le Caire',       flag: '🔺', lat: 30.0444,  lng: 31.2357 }
};

let _cachedCerts = null;
let _cachedCertsExp = 0;
let _cachedSaToken = '';
let _cachedSaTokenExp = 0;
const _warmVaultCache = new Map(); // postId -> { doc, exp }

function isValidSafePostId(id) {
  return typeof id === 'string' && /^[a-zA-Z0-9_-]{3,90}$/.test(id);
}

function getHeader(headers, name) {
  if (!headers || typeof headers !== 'object') return '';
  const target = name.toLowerCase();
  for (const [k, v] of Object.entries(headers)) {
    if (k.toLowerCase() === target) return String(v || '');
  }
  return '';
}

function parseServiceAccount() {
  const raw = String(process.env.FIREBASE_SERVICE_ACCOUNT || '').trim();
  if (!raw) return null;
  let candidate = raw;
  if (!candidate.startsWith('{')) {
    try {
      candidate = Buffer.from(candidate, 'base64').toString('utf8').trim();
    } catch (e) {
      return null;
    }
  }
  try {
    const parsed = JSON.parse(candidate);
    if (!parsed || !parsed.client_email || !parsed.private_key) return null;
    parsed.private_key = String(parsed.private_key).replace(/\\n/g, '\n');
    return parsed;
  } catch (e) {
    return null;
  }
}

function getVaultSecret() {
  return String(process.env.REMO_VAULT_SECRET || '').trim();
}

function isServerVaultConfigured() {
  const hasServiceAccount = Boolean(parseServiceAccount());
  const hasVaultSecret = getVaultSecret().length >= 16;
  return {
    ok: hasServiceAccount && hasVaultSecret,
    hasServiceAccount,
    hasVaultSecret
  };
}

function isAllowedHost(hostname) {
  const h = String(hostname || '').toLowerCase().trim();
  if (!h) return false;
  return (
    h === 'remoworld.com' ||
    h === 'www.remoworld.com' ||
    h.endsWith('.remoworld.com') ||
    h.endsWith('.netlify.app') ||
    h === 'localhost' ||
    h === '127.0.0.1'
  );
}

function isAllowedRequestOrigin(event, opts = {}) {
  const headers = (event && event.headers) || {};
  const origin = getHeader(headers, 'origin');
  const referer = getHeader(headers, 'referer');
  const secDest = getHeader(headers, 'sec-fetch-dest').toLowerCase();
  const secSite = getHeader(headers, 'sec-fetch-site').toLowerCase();

  if (opts.requireIframeDest) {
    if (secDest && secDest !== 'iframe') {
      return { ok: false, reason: 'Direct navigation blocked' };
    }
    if (secSite === 'cross-site') {
      return { ok: false, reason: 'Cross-site embed blocked' };
    }
  } else {
    if (secSite === 'cross-site') {
      return { ok: false, reason: 'Cross-site request blocked' };
    }
  }

  const checkUrl = origin || referer;
  if (!checkUrl) {
    return { ok: false, reason: 'Missing origin/referer' };
  }
  try {
    const u = new URL(checkUrl);
    if (!isAllowedHost(u.hostname)) {
      return { ok: false, reason: 'Unauthorized host' };
    }
    return { ok: true, host: u.hostname };
  } catch (e) {
    return { ok: false, reason: 'Invalid origin URL' };
  }
}

function httpsRequest(urlStr, options = {}, bodyStr = null) {
  return new Promise((resolve, reject) => {
    const u = new URL(urlStr);
    const reqOpts = {
      hostname: u.hostname,
      port: u.port || 443,
      path: u.pathname + u.search,
      method: options.method || 'GET',
      headers: Object.assign({}, options.headers || {})
    };
    if (bodyStr !== null) {
      reqOpts.headers['Content-Length'] = Buffer.byteLength(bodyStr, 'utf8');
    }
    const req = https.request(reqOpts, (res) => {
      let data = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({ statusCode: res.statusCode || 0, headers: res.headers, body: data });
      });
    });
    req.setTimeout(9000, () => {
      req.destroy(new Error('Upstream request timeout'));
    });
    req.on('error', reject);
    if (bodyStr !== null) req.write(bodyStr);
    req.end();
  });
}

async function fetchGoogleCerts() {
  if (_cachedCerts && Date.now() < _cachedCertsExp) return _cachedCerts;
  const res = await httpsRequest(GOOGLE_CERTS_URL);
  if (res.statusCode !== 200) throw new Error('Failed to load Google public certs');
  _cachedCerts = JSON.parse(res.body);
  _cachedCertsExp = Date.now() + 3600000;
  return _cachedCerts;
}

async function verifyFirebaseAdminBearer(event) {
  const headers = (event && event.headers) || {};
  const authHeader = getHeader(headers, 'authorization');
  if (!authHeader.startsWith('Bearer ')) {
    return { ok: false, statusCode: 401, error: 'Missing admin Authorization Bearer token.' };
  }
  const token = authHeader.slice(7).trim();
  const parts = token.split('.');
  if (parts.length !== 3) {
    return { ok: false, statusCode: 401, error: 'Malformed Bearer token.' };
  }
  try {
    const headerJson = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
    const payloadJson = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
    if (headerJson.alg !== 'RS256' || !headerJson.kid) {
      return { ok: false, statusCode: 401, error: 'Unsupported token algorithm.' };
    }
    const certs = await fetchGoogleCerts();
    const certPem = certs && certs[headerJson.kid];
    if (!certPem) {
      return { ok: false, statusCode: 401, error: 'Unknown signing key.' };
    }
    const verifier = crypto.createVerify('RSA-SHA256');
    verifier.update(`${parts[0]}.${parts[1]}`);
    verifier.end();
    if (!verifier.verify(certPem, Buffer.from(parts[2], 'base64url'))) {
      return { ok: false, statusCode: 401, error: 'Invalid token signature.' };
    }
    const nowSec = Math.floor(Date.now() / 1000);
    if (payloadJson.aud !== FIREBASE_PROJECT_ID) {
      return { ok: false, statusCode: 401, error: 'Invalid token audience.' };
    }
    if (payloadJson.iss !== `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`) {
      return { ok: false, statusCode: 401, error: 'Invalid token issuer.' };
    }
    if (!payloadJson.exp || Number(payloadJson.exp) <= nowSec) {
      return { ok: false, statusCode: 401, error: 'Expired admin session token.' };
    }
    const email = String(payloadJson.email || '').toLowerCase();
    const isAdminUser = (email === ADMIN_EMAIL && payloadJson.email_verified === true) || payloadJson.admin === true;
    if (!isAdminUser) {
      return { ok: false, statusCode: 403, error: 'Admin privileges required.' };
    }
    return { ok: true, uid: payloadJson.sub || payloadJson.user_id || '', email };
  } catch (e) {
    return { ok: false, statusCode: 401, error: 'Admin authentication failed.' };
  }
}

async function getGoogleAccessToken() {
  if (_cachedSaToken && Date.now() < _cachedSaTokenExp) return _cachedSaToken;
  const sa = parseServiceAccount();
  if (!sa) throw new Error('FIREBASE_SERVICE_ACCOUNT is not configured.');

  const nowSec = Math.floor(Date.now() / 1000);
  const headerB64 = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const claimB64 = Buffer.from(JSON.stringify({
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/datastore',
    aud: GOOGLE_TOKEN_URL,
    iat: nowSec,
    exp: nowSec + 3500
  })).toString('base64url');

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(`${headerB64}.${claimB64}`);
  signer.end();
  const sigB64 = signer.sign(sa.private_key).toString('base64url');
  const assertion = `${headerB64}.${claimB64}.${sigB64}`;

  const body = `grant_type=${encodeURIComponent('urn:ietf:params:oauth:grant-type:jwt-bearer')}&assertion=${encodeURIComponent(assertion)}`;
  const res = await httpsRequest(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  }, body);

  if (res.statusCode !== 200) {
    throw new Error(`Google OAuth2 failed (${res.statusCode})`);
  }
  const parsed = JSON.parse(res.body);
  if (!parsed.access_token) throw new Error('Missing access_token in OAuth2 response');
  _cachedSaToken = parsed.access_token;
  _cachedSaTokenExp = Date.now() + Math.max(60000, (Number(parsed.expires_in || 3600) - 300) * 1000);
  return _cachedSaToken;
}

function getVaultDocUrl(postId) {
  const sa = parseServiceAccount();
  const projectId = (sa && sa.project_id) || FIREBASE_PROJECT_ID;
  return `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents/${VAULT_COLLECTION}/${encodeURIComponent(postId)}`;
}

async function firestoreVaultGet(postId, opts = {}) {
  if (!isValidSafePostId(postId)) return null;
  if (!opts.skipCache) {
    const cached = _warmVaultCache.get(postId);
    if (cached && Date.now() < cached.exp) return cached.doc;
  }
  const accessToken = await getGoogleAccessToken();
  const res = await httpsRequest(getVaultDocUrl(postId), {
    method: 'GET',
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (res.statusCode === 404) return null;
  if (res.statusCode !== 200) throw new Error(`Vault read failed (${res.statusCode})`);
  const json = JSON.parse(res.body);
  const f = json.fields || {};
  const doc = {
    postId,
    htmlCode: f.htmlCode && typeof f.htmlCode.stringValue === 'string' ? f.htmlCode.stringValue : '',
    isArcadeGame: Boolean(f.isArcadeGame && f.isArcadeGame.booleanValue),
    updatedAt: Number((f.updatedAt && (f.updatedAt.integerValue || f.updatedAt.doubleValue)) || 0)
  };
  if (doc.htmlCode) {
    _warmVaultCache.set(postId, { doc, exp: Date.now() + 30000 });
  }
  return doc;
}

async function firestoreVaultSet(postId, htmlCode, isArcadeGame, adminEmail) {
  if (!isValidSafePostId(postId)) throw new Error('Invalid postId');
  const codeStr = String(htmlCode || '');
  if (!codeStr.trim()) throw new Error('Empty HTML code');
  if (Buffer.byteLength(codeStr, 'utf8') > MAX_HTML_BYTES) {
    throw new Error('HTML payload exceeds maximum allowed size (450 KB).');
  }
  const accessToken = await getGoogleAccessToken();
  const now = Date.now();
  const payload = JSON.stringify({
    fields: {
      postId: { stringValue: postId },
      htmlCode: { stringValue: codeStr },
      isArcadeGame: { booleanValue: Boolean(isArcadeGame) },
      updatedBy: { stringValue: String(adminEmail || ADMIN_EMAIL) },
      updatedAt: { integerValue: String(now) }
    }
  });
  const res = await httpsRequest(getVaultDocUrl(postId), {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  }, payload);
  if (res.statusCode < 200 || res.statusCode >= 300) {
    throw new Error(`Vault write failed (${res.statusCode})`);
  }
  _warmVaultCache.set(postId, {
    doc: { postId, htmlCode: codeStr, isArcadeGame: Boolean(isArcadeGame), updatedAt: now },
    exp: Date.now() + 30000
  });
  return { ok: true, postId, updatedAt: now };
}

async function firestoreVaultDelete(postId) {
  if (!isValidSafePostId(postId)) return { ok: false };
  _warmVaultCache.delete(postId);
  const accessToken = await getGoogleAccessToken();
  const res = await httpsRequest(getVaultDocUrl(postId), {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  return { ok: res.statusCode === 200 || res.statusCode === 404 };
}

function signVaultTicket({ postId, cityId = 'montreal', lang = 'en', isArcadeGame = false }) {
  const secret = getVaultSecret();
  if (!secret || secret.length < 16) throw new Error('REMO_VAULT_SECRET not configured');
  const payload = {
    p: String(postId),
    c: String(cityId || 'montreal').toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 32) || 'montreal',
    l: lang === 'fr' ? 'fr' : 'en',
    g: isArcadeGame ? 1 : 0,
    e: Date.now() + TICKET_TTL_MS,
    n: crypto.randomBytes(6).toString('base64url')
  };
  const bodyB64 = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const sigB64 = crypto.createHmac('sha256', secret).update(bodyB64).digest('base64url');
  return `${bodyB64}.${sigB64}`;
}

function verifyVaultTicket(ticketStr) {
  const secret = getVaultSecret();
  if (!secret || secret.length < 16) return { ok: false, reason: 'Vault secret missing' };
  const raw = String(ticketStr || '').trim();
  const parts = raw.split('.');
  if (parts.length !== 2) return { ok: false, reason: 'Malformed ticket' };
  const [bodyB64, sigB64] = parts;
  const expectedSig = crypto.createHmac('sha256', secret).update(bodyB64).digest('base64url');
  const a = Buffer.from(sigB64);
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return { ok: false, reason: 'Invalid signature' };
  }
  try {
    const payload = JSON.parse(Buffer.from(bodyB64, 'base64url').toString('utf8'));
    if (!payload || !isValidSafePostId(payload.p)) return { ok: false, reason: 'Invalid postId' };
    if (!payload.e || Date.now() > Number(payload.e)) return { ok: false, reason: 'Ticket expired' };
    return { ok: true, payload };
  } catch (e) {
    return { ok: false, reason: 'Corrupt payload' };
  }
}

function buildShieldedInnerHtml(rawHtml, ctx = {}) {
  let html = String(rawHtml || '');
  if (!html) return '';

  const cityMeta = REMO_CITIES_COORDS[String(ctx.cityId || 'montreal').toLowerCase()] || REMO_CITIES_COORDS.montreal;
  const lang = ctx.lang === 'fr' ? 'fr' : 'en';
  const safePid = String(ctx.postId || '').replace(/[^a-zA-Z0-9_-]/g, '');
  const contextPayload = JSON.stringify({
    postId: safePid,
    cityId: cityMeta.id,
    cityName: lang === 'fr' ? cityMeta.name_fr : cityMeta.name_en,
    cityNameEn: cityMeta.name_en,
    cityNameFr: cityMeta.name_fr,
    cityFlag: cityMeta.flag,
    lat: cityMeta.lat,
    lng: cityMeta.lng,
    lang
  });

  const shieldStyle = '<style id="r-sh-s">' +
    'html,body{scrollbar-width:none!important;-ms-overflow-style:none!important;}' +
    'html::-webkit-scrollbar,body::-webkit-scrollbar{display:none!important;}' +
    '*:not(input):not(textarea):not([contenteditable]){user-select:none!important;-webkit-user-select:none!important;-webkit-touch-callout:none!important;}' +
    '</style>';

  const contextScript = `<script>(function(){try{Object.defineProperty(window,"REMO_CONTEXT",{value:Object.freeze(${contextPayload}),writable:false,configurable:false});}catch(e){window.REMO_CONTEXT=${contextPayload};}if(document.currentScript)document.currentScript.remove();})();</script>`;

  const shieldAndFitScript = '<script>(function(){' +
    'var editable=function(t){return t&&(t.tagName==="INPUT"||t.tagName==="TEXTAREA"||t.isContentEditable);};' +
    'document.addEventListener("contextmenu",function(e){if(!editable(e.target))e.preventDefault();},true);' +
    'document.addEventListener("dragstart",function(e){e.preventDefault();},true);' +
    'document.addEventListener("selectstart",function(e){if(!editable(e.target))e.preventDefault();},true);' +
    'document.addEventListener("copy",function(e){if(!editable(e.target))e.preventDefault();},true);' +
    'document.addEventListener("cut",function(e){if(!editable(e.target))e.preventDefault();},true);' +
    'document.addEventListener("keydown",function(e){' +
      'var k=(e.key||"").toLowerCase(),m=e.ctrlKey||e.metaKey;' +
      'if(e.key==="F12"||(m&&e.shiftKey&&(k==="i"||k==="j"||k==="c"))||(m&&(k==="u"||k==="s"||k==="p"))||(m&&k==="c"&&!editable(e.target))){' +
        'e.preventDefault();e.stopPropagation();return false;' +
      '}' +
    '},true);' +
    'try{var noop=function(){};if(window.console){["log","debug","info","dir","table","trace"].forEach(function(fn){try{console[fn]=noop;}catch(e){}});}}catch(e){}' +
    'function fit(){var b=document.body,d=document.documentElement;if(!b)return;' +
      'b.style.transform="";b.style.transformOrigin="";b.style.overflow="";d.style.overflow="";' +
      'try{window.scrollTo(0,0);}catch(e){}' +
      'var W=window.innerWidth,H=window.innerHeight;if(!W||!H)return;' +
      'var L=0,T=0,R=Math.max(d.scrollWidth,b.scrollWidth),B=Math.max(d.scrollHeight,b.scrollHeight);' +
      'function acc(el,depth){if(!el)return;var tn=el.tagName;if(tn==="SCRIPT"||tn==="STYLE"||tn==="LINK"||tn==="META")return;' +
      'var cs=getComputedStyle(el);if(cs.display==="none"||cs.visibility==="hidden"||cs.position==="fixed")return;' +
      'var r=el.getBoundingClientRect();if(r.width<1||r.height<1)return;' +
      'L=Math.min(L,r.left);T=Math.min(T,r.top);R=Math.max(R,r.right);B=Math.max(B,r.bottom);' +
      'if(depth<1){for(var i=0;i<el.children.length&&i<80;i++)acc(el.children[i],depth+1);}}' +
      'for(var i=0;i<b.children.length;i++)acc(b.children[i],0);' +
      'var bw=R-L,bh=B-T;if(bw<=W+2&&bh<=H+2)return;' +
      'var s=Math.min(W/bw,H/bh);var br=b.getBoundingClientRect();' +
      'var tx=(W-bw*s)/2-br.left-s*(L-br.left);var ty=(H-bh*s)/2-br.top-s*(T-br.top);' +
      'd.style.overflow="hidden";b.style.overflow="visible";b.style.transformOrigin="0 0";' +
      'b.style.transform="translate("+tx+"px,"+ty+"px) scale("+s+")";}' +
    'var tm=null;function later(){clearTimeout(tm);tm=setTimeout(fit,120);}' +
    'if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",fit);}else{fit();}' +
    'window.addEventListener("load",function(){fit();setTimeout(fit,300);setTimeout(fit,1200);});' +
    'setTimeout(fit,60);setTimeout(fit,700);window.addEventListener("resize",later);' +
    'if(document.currentScript)document.currentScript.remove();' +
    '})();</script>';

  const scoreBridgeScript = (ctx.isArcadeGame && safePid) ? (
    '<script>(function(){' +
    'var pid="' + safePid + '",best=0;' +
    'function emit(v){var n=Math.floor(Number(v||0));if(!isFinite(n)||n<=best||n<=0||n>9999999)return;best=n;' +
    'try{parent.postMessage({type:"REMO_HTML_SCORE",postId:pid,score:best},"*");}catch(e){}}' +
    'window.remoSubmitScore=emit;' +
    'function scan(){try{' +
    'var els=document.querySelectorAll("#score,.score,[id*=score i],[class*=score i],#st,#fl,#pts,.hud");' +
    'for(var i=0;i<els.length;i++){var t=els[i].textContent||"";' +
    'var m=t.match(/(?:score|pts|points|floor|🪙|🏆)\\s*[:=·]?\\s*(\\d{1,7})/i)||t.match(/^\\s*(\\d{1,7})\\s*$/);' +
    'if(m&&m[1])emit(parseInt(m[1],10));}' +
    '}catch(e){}}' +
    'setInterval(scan,900);' +
    'if(document.currentScript)document.currentScript.remove();' +
    '})();</script>'
  ) : '';

  if (/<head[^>]*>/i.test(html)) {
    html = html.replace(/<head([^>]*)>/i, `<head$1>${shieldStyle}${contextScript}`);
  } else if (/<\/head>/i.test(html)) {
    html = html.replace(/<\/head>/i, `${shieldStyle}${contextScript}</head>`);
  } else {
    html = `${shieldStyle}${contextScript}${html}`;
  }

  const tailScripts = shieldAndFitScript + scoreBridgeScript;
  const lower = html.toLowerCase();
  const bodyEnd = lower.lastIndexOf('</body>');
  if (bodyEnd !== -1) {
    html = html.slice(0, bodyEnd) + tailScripts + html.slice(bodyEnd);
  } else {
    html = html + tailScripts;
  }
  return html;
}

function buildProtectedHtmlEnvelope(rawHtml, ctx = {}) {
  const inner = buildShieldedInnerHtml(rawHtml, ctx);
  const utf8 = Buffer.from(inner, 'utf8');
  const key = crypto.randomBytes(16);
  const enc = Buffer.alloc(utf8.length);
  for (let i = 0; i < utf8.length; i++) {
    enc[i] = utf8[i] ^ key[i & 15] ^ ((i * 31 + 17) & 255);
  }
  const b64 = enc.toString('base64');
  const keyHex = Array.from(key);

  // Split base64 payload into shuffled indexed chunks so static inspection sees zero structure
  const chunkSize = Math.max(180, Math.ceil(b64.length / 12));
  const chunks = [];
  for (let i = 0; i < b64.length; i += chunkSize) {
    chunks.push([chunks.length, b64.slice(i, i + chunkSize)]);
  }
  for (let i = chunks.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    const tmp = chunks[i];
    chunks[i] = chunks[j];
    chunks[j] = tmp;
  }

  const vK = '_0x' + crypto.randomBytes(3).toString('hex');
  const vC = '_0x' + crypto.randomBytes(3).toString('hex');
  const vF = '_0x' + crypto.randomBytes(3).toString('hex');

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><style>html,body{margin:0;height:100%;background:#050816;color:#94a3b8;font-family:system-ui,sans-serif;overflow:hidden;user-select:none;}</style></head><body><script>(function(){try{var rf=String(document.referrer||"");var ok=window.top!==window.self&&/(^https?:\\/\\/(www\\.)?remoworld\\.com(\\/|$)|\\.netlify\\.app(\\/|$)|^https?:\\/\\/(localhost|127\\.0\\.0\\.1)(:|\\/|$))/i.test(rf);if(!ok){document.body.innerHTML='<div style="height:100vh;display:flex;align-items:center;justify-content:center;text-align:center;padding:24px;color:#38bdf8;font-weight:800;">🔒 Protected by REMO World™</div>';return;}var ${vK}=${JSON.stringify(keyHex)};var ${vC}=${JSON.stringify(chunks)};${vC}.sort(function(a,b){return a[0]-b[0];});var s="";for(var i=0;i<${vC}.length;i++)s+=${vC}[i][1];var bin=atob(s);var out=new Uint8Array(bin.length);for(var j=0;j<bin.length;j++){out[j]=bin.charCodeAt(j)^${vK}[j&15]^((j*31+17)&255);}var ${vF}=new TextDecoder("utf-8").decode(out);if(document.currentScript)document.currentScript.remove();document.open();document.write(${vF});document.close();}catch(e){document.body.innerHTML='<div style="height:100vh;display:flex;align-items:center;justify-content:center;color:#f87171;font-weight:700;">⚠️ Vault Error</div>';}})();</script></body></html>`;
}

function buildBlockedHtmlPage(reason = 'Protected by REMO World™') {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><style>html,body{margin:0;height:100%;background:#050816;color:#e2e8f0;font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;text-align:center;user-select:none;}.box{padding:24px 28px;border:1px solid rgba(56,189,248,0.3);border-radius:16px;background:rgba(15,23,42,0.85);max-width:340px;}h3{margin:0 0 8px;color:#38bdf8;font-size:1rem;}p{margin:0;color:#94a3b8;font-size:0.82rem;}</style></head><body><div class="box"><h3>🔒 REMO Vault Protected</h3><p>${String(reason).replace(/[<>&"]/g, '')}</p></div></body></html>`;
}

module.exports = {
  FIREBASE_PROJECT_ID,
  VAULT_COLLECTION,
  ADMIN_EMAIL,
  TICKET_TTL_MS,
  REMO_CITIES_COORDS,
  isValidSafePostId,
  getHeader,
  parseServiceAccount,
  getVaultSecret,
  isServerVaultConfigured,
  isAllowedHost,
  isAllowedRequestOrigin,
  verifyFirebaseAdminBearer,
  firestoreVaultGet,
  firestoreVaultSet,
  firestoreVaultDelete,
  signVaultTicket,
  verifyVaultTicket,
  buildShieldedInnerHtml,
  buildProtectedHtmlEnvelope,
  buildBlockedHtmlPage
};
