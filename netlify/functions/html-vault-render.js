/**
 * Netlify Serverless Function: Protected HTML Vault Renderer
 * - Verifies ephemeral 25s HMAC ticket + Sec-Fetch-Dest: iframe + remoworld.com Referer
 * - Fetches raw HTML from private `remo_html_vault` (never public Firestore!)
 * - Compiles a per-request randomized encrypted envelope with Domain-Lock & Anti-Copy Shield
 * - Serves with strict no-store, SAMEORIGIN & frame-ancestors headers
 */
const {
  isServerVaultConfigured,
  isAllowedRequestOrigin,
  verifyVaultTicket,
  firestoreVaultGet,
  buildProtectedHtmlEnvelope,
  buildBlockedHtmlPage
} = require('../shared/html-vault-core');

const SECURITY_HEADERS = {
  'Content-Type': 'text/html; charset=utf-8',
  'Cache-Control': 'no-store, no-cache, must-revalidate, private',
  'Pragma': 'no-cache',
  'Expires': '0',
  'X-Frame-Options': 'SAMEORIGIN',
  'Content-Security-Policy': "frame-ancestors 'self' https://remoworld.com https://www.remoworld.com",
  'X-Robots-Tag': 'noindex, nofollow, noarchive',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
};

exports.handler = async (event) => {
  const method = String((event && event.httpMethod) || 'GET').toUpperCase();
  if (method !== 'GET') {
    return { statusCode: 405, headers: SECURITY_HEADERS, body: buildBlockedHtmlPage('Method not allowed') };
  }

  const originCheck = isAllowedRequestOrigin(event, { requireIframeDest: true });
  if (!originCheck.ok) {
    return { statusCode: 403, headers: SECURITY_HEADERS, body: buildBlockedHtmlPage('Protected by REMO World™ — Direct access denied') };
  }

  const cfg = isServerVaultConfigured();
  if (!cfg.ok) {
    return { statusCode: 503, headers: SECURITY_HEADERS, body: buildBlockedHtmlPage('Vault server not configured') };
  }

  const qs = (event && event.queryStringParameters) || {};
  const ticketRes = verifyVaultTicket(qs.t || '');
  if (!ticketRes.ok) {
    return { statusCode: 403, headers: SECURITY_HEADERS, body: buildBlockedHtmlPage('Session expired — reload post on REMO World') };
  }

  const { p: postId, c: cityId, l: lang, g: arcadeFlag } = ticketRes.payload;
  try {
    const doc = await firestoreVaultGet(postId);
    if (!doc || !doc.htmlCode) {
      return { statusCode: 404, headers: SECURITY_HEADERS, body: buildBlockedHtmlPage('Mini-app unavailable') };
    }
    const envelope = buildProtectedHtmlEnvelope(doc.htmlCode, {
      postId,
      cityId,
      lang,
      isArcadeGame: Boolean(arcadeFlag) || Boolean(doc.isArcadeGame)
    });
    return {
      statusCode: 200,
      headers: SECURITY_HEADERS,
      body: envelope
    };
  } catch (err) {
    return { statusCode: 500, headers: SECURITY_HEADERS, body: buildBlockedHtmlPage('Temporary vault error') };
  }
};
