/**
 * Netlify Serverless Function: Ephemeral 25-Second HTML Vault Ticket Issuer
 * - Issues short-lived HMAC-signed iframe render URLs strictly for requests from remoworld.com
 * - Zero Firestore reads; fast <5ms signing
 */
const {
  isValidSafePostId,
  isServerVaultConfigured,
  isAllowedRequestOrigin,
  signVaultTicket,
  TICKET_TTL_MS
} = require('../shared/html-vault-core');

function jsonRes(statusCode, payload) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate, private',
      'X-Robots-Tag': 'noindex, nofollow'
    },
    body: JSON.stringify(payload)
  };
}

exports.handler = async (event) => {
  const method = String((event && event.httpMethod) || 'GET').toUpperCase();
  if (method === 'OPTIONS') {
    return { statusCode: 204, headers: { 'Cache-Control': 'no-store' }, body: '' };
  }
  if (method !== 'POST' && method !== 'GET') {
    return jsonRes(405, { ok: false, error: 'Method not allowed' });
  }

  const originCheck = isAllowedRequestOrigin(event, { requireIframeDest: false });
  if (!originCheck.ok) {
    return jsonRes(403, { ok: false, error: originCheck.reason || 'Forbidden' });
  }

  const cfg = isServerVaultConfigured();
  if (!cfg.ok) {
    return jsonRes(200, { ok: false, configured: false });
  }

  let postId = '';
  let cityId = 'montreal';
  let lang = 'en';
  let isArcadeGame = false;

  if (method === 'POST') {
    try {
      const body = JSON.parse(event.body || '{}');
      postId = String(body.postId || '').trim();
      cityId = String(body.cityId || 'montreal').trim();
      lang = body.lang === 'fr' ? 'fr' : 'en';
      isArcadeGame = Boolean(body.isArcadeGame);
    } catch (e) {
      return jsonRes(400, { ok: false, error: 'Invalid JSON body' });
    }
  } else {
    const qs = (event && event.queryStringParameters) || {};
    postId = String(qs.postId || '').trim();
    cityId = String(qs.cityId || 'montreal').trim();
    lang = qs.lang === 'fr' ? 'fr' : 'en';
    isArcadeGame = qs.g === '1' || qs.isArcadeGame === 'true';
  }

  if (!isValidSafePostId(postId)) {
    return jsonRes(400, { ok: false, error: 'Invalid postId' });
  }

  try {
    const ticket = signVaultTicket({ postId, cityId, lang, isArcadeGame });
    return jsonRes(200, {
      ok: true,
      configured: true,
      renderUrl: `/.netlify/functions/html-vault-render?t=${encodeURIComponent(ticket)}`,
      expiresInMs: TICKET_TTL_MS
    });
  } catch (err) {
    return jsonRes(500, { ok: false, error: 'Failed to sign ticket' });
  }
};
