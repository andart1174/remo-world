/**
 * Netlify Serverless Function: Admin HTML Vault Publisher & Manager
 * - GET: Admin checks whether Level 2 Server Vault env vars are configured
 * - POST (action: 'save' | 'get_source' | 'delete'): Admin-only CRUD on private `remo_html_vault`
 */
const {
  isValidSafePostId,
  isServerVaultConfigured,
  verifyFirebaseAdminBearer,
  firestoreVaultGet,
  firestoreVaultSet,
  firestoreVaultDelete
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
  const cfg = isServerVaultConfigured();

  if (method === 'OPTIONS') {
    return { statusCode: 204, headers: { 'Cache-Control': 'no-store' }, body: '' };
  }

  // Always verify genuine Firebase Admin Bearer token first!
  const auth = await verifyFirebaseAdminBearer(event);
  if (!auth.ok) {
    return jsonRes(auth.statusCode || 401, { ok: false, error: auth.error || 'Unauthorized' });
  }

  if (method === 'GET') {
    return jsonRes(200, {
      ok: true,
      configured: cfg.ok,
      hasServiceAccount: cfg.hasServiceAccount,
      hasVaultSecret: cfg.hasVaultSecret
    });
  }

  if (method !== 'POST') {
    return jsonRes(405, { ok: false, error: 'Method not allowed' });
  }

  if (!cfg.ok) {
    return jsonRes(200, {
      ok: false,
      configured: false,
      hasServiceAccount: cfg.hasServiceAccount,
      hasVaultSecret: cfg.hasVaultSecret,
      error: 'Level 2 Server Vault env vars not yet configured on Netlify.'
    });
  }

  let body = {};
  try {
    body = JSON.parse(event.body || '{}');
  } catch (e) {
    return jsonRes(400, { ok: false, error: 'Invalid JSON body' });
  }

  const action = String(body.action || 'save').toLowerCase();
  const postId = String(body.postId || '').trim();
  if (!isValidSafePostId(postId)) {
    return jsonRes(400, { ok: false, error: 'Invalid postId' });
  }

  try {
    if (action === 'save') {
      const htmlCode = String(body.htmlCode || '');
      if (!htmlCode.trim()) {
        return jsonRes(400, { ok: false, error: 'Missing htmlCode' });
      }
      const isArcadeGame = Boolean(body.isArcadeGame);
      const saved = await firestoreVaultSet(postId, htmlCode, isArcadeGame, auth.email);
      return jsonRes(200, {
        ok: true,
        configured: true,
        vaultMode: 'server',
        postId: saved.postId,
        updatedAt: saved.updatedAt
      });
    }

    if (action === 'get_source') {
      const doc = await firestoreVaultGet(postId, { skipCache: true });
      if (!doc || !doc.htmlCode) {
        return jsonRes(404, { ok: false, error: 'Vault item not found' });
      }
      return jsonRes(200, {
        ok: true,
        postId,
        htmlCode: doc.htmlCode,
        isArcadeGame: Boolean(doc.isArcadeGame)
      });
    }

    if (action === 'delete') {
      await firestoreVaultDelete(postId);
      return jsonRes(200, { ok: true, postId, deleted: true });
    }

    return jsonRes(400, { ok: false, error: 'Unknown action' });
  } catch (err) {
    return jsonRes(500, { ok: false, error: err && err.message ? err.message : 'Vault operation failed' });
  }
};
