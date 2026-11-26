/**
 * Netlify Serverless Function: Verified Admin Session Check
 * Cryptographically verifies Firebase Auth RS256 Bearer ID Token on the server
 * and returns admin status without exposing plaintext admin credentials in client JS.
 */
const {
  verifyFirebaseAdminBearer,
  resolveSafeCorsHeaders
} = require('../shared/html-vault-core');

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

exports.handler = async (event) => {
  const method = String((event && event.httpMethod) || 'GET').toUpperCase();
  const cors = resolveSafeCorsHeaders(event, { allowNullOrigin: false });
  if (!cors.ok) {
    return jsonRes(403, { ok: false, isAdmin: false, error: cors.reason || 'Forbidden origin' });
  }
  if (method === 'OPTIONS') {
    return { statusCode: 204, headers: Object.assign({ 'Allow': 'GET, POST, OPTIONS', 'Cache-Control': 'no-store' }, cors.headers), body: '' };
  }
  if (method !== 'GET' && method !== 'POST') {
    return jsonRes(405, { ok: false, isAdmin: false, error: 'Method not allowed' }, cors.headers);
  }

  const auth = await verifyFirebaseAdminBearer(event);
  if (!auth.ok) {
    return jsonRes(auth.statusCode || 401, { ok: false, isAdmin: false, error: auth.error || 'Unauthorized' }, cors.headers);
  }

  return jsonRes(200, {
    ok: true,
    isAdmin: true,
    uid: auth.uid || '',
    verifiedAt: Date.now()
  }, cors.headers);
};
