/**
 * Netlify Serverless Function: Official IndexNow Batch Proxy
 * Avoids browser CORS restrictions by posting JSON server-to-server to IndexNow
 * and returning the genuine upstream HTTP status code (200/202 vs 4xx/5xx).
 */
const https = require('https');
const crypto = require('crypto');

const HOST = 'remoworld.com';
const FIREBASE_PROJECT_ID = 'remo-world';
const ADMIN_EMAIL = String(process.env.REMO_ADMIN_EMAIL || 'andart1174@gmail.com').toLowerCase().trim();
const GOOGLE_CERTS_URL = 'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';
let _cachedCerts = null;
let _cachedCertsExpiresAt = 0;

function fetchGoogleCerts(requestImpl) {
  if (_cachedCerts && Date.now() < _cachedCertsExpiresAt) {
    return Promise.resolve(_cachedCerts);
  }
  return new Promise((resolve, reject) => {
    const req = https.request(GOOGLE_CERTS_URL, { method: 'GET' }, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        if (res.statusCode !== 200) return reject(new Error(`Certs HTTP ${res.statusCode}`));
        try {
          _cachedCerts = JSON.parse(body);
          _cachedCertsExpiresAt = Date.now() + 3600000;
          resolve(_cachedCerts);
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function verifyAdminAuth(event, requestImpl) {
  const headers = (event && event.headers) || {};
  const secretHeader = headers['x-indexnow-secret'] || headers['X-Indexnow-Secret'] || '';
  const envSecret = process.env.INDEXNOW_ADMIN_SECRET || '';
  if (envSecret && typeof secretHeader === 'string' && secretHeader.length === envSecret.length) {
    try {
      if (crypto.timingSafeEqual(Buffer.from(secretHeader), Buffer.from(envSecret))) {
        return { ok: true, mode: 'secret' };
      }
    } catch (e) {}
  }

  const authHeader = String(headers.authorization || headers.Authorization || '');
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
    const certs = await fetchGoogleCerts(requestImpl);
    const certPem = certs && certs[headerJson.kid];
    if (!certPem) {
      return { ok: false, statusCode: 401, error: 'Unknown signing key id.' };
    }
    const verifier = crypto.createVerify('RSA-SHA256');
    verifier.update(`${parts[0]}.${parts[1]}`);
    verifier.end();
    const sigValid = verifier.verify(certPem, Buffer.from(parts[2], 'base64url'));
    if (!sigValid) {
      return { ok: false, statusCode: 401, error: 'Invalid token signature.' };
    }
    const nowSec = Math.floor(Date.now() / 1000);
    if (payloadJson.aud !== FIREBASE_PROJECT_ID || payloadJson.iss !== `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`) {
      return { ok: false, statusCode: 403, error: 'Invalid Firebase project claim.' };
    }
    if (!payloadJson.exp || Number(payloadJson.exp) <= nowSec || !payloadJson.sub) {
      return { ok: false, statusCode: 401, error: 'Expired Firebase token.' };
    }
    const email = String(payloadJson.email || '').toLowerCase();
    const isAdminUser = (email === ADMIN_EMAIL && payloadJson.email_verified === true) || payloadJson.admin === true;
    if (!isAdminUser) {
      return { ok: false, statusCode: 403, error: 'Admin privileges required.' };
    }
    return { ok: true, mode: 'firebase', email };
  } catch (err) {
    return { ok: false, statusCode: 401, error: 'Token verification failed.' };
  }
}
const KEY = 'remoindexnow2026key8f4a2b9c1d7e3a5f';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const SITEMAP_URL = `https://${HOST}/sitemap.xml`;
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';
const MAX_URLS = 500;

function sanitizeUrlList(rawList) {
  if (!Array.isArray(rawList)) return [];
  const seen = new Set();
  const clean = [];
  for (const raw of rawList) {
    if (typeof raw !== 'string') continue;
    const trimmed = raw.trim();
    if (!trimmed) continue;
    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol === 'https:' && parsed.hostname === HOST) {
        const canonical = parsed.toString();
        if (!seen.has(canonical)) {
          seen.add(canonical);
          clean.push(canonical);
          if (clean.length >= MAX_URLS) break;
        }
      }
    } catch (e) {
      // Ignore malformed URLs
    }
  }
  return clean;
}

function httpsRequest(url, options = {}, bodyStr = '') {
  return new Promise((resolve, reject) => {
    const req = https.request(url, { timeout: 12000, ...options }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve({ status: res.statusCode || 500, body: data }));
    });
    req.on('error', reject);
    req.on('timeout', () => req.destroy(new Error('Request timed out')));
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

async function fetchLiveSitemapUrls(requestImpl = httpsRequest) {
  const res = await requestImpl(SITEMAP_URL, { method: 'GET' });
  if (res.status < 200 || res.status >= 300 || !res.body) {
    throw new Error(`Unable to read live sitemap.xml (HTTP ${res.status})`);
  }
  const found = [];
  const re = /<loc>([^<]+)<\/loc>/g;
  let m;
  while ((m = re.exec(res.body)) !== null) {
    found.push(m[1].trim());
  }
  return sanitizeUrlList(found);
}

function jsonResponse(statusCode, payload) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    },
    body: JSON.stringify(payload)
  };
}

exports.handler = async (event, _context, deps = {}) => {
  const requestImpl = deps.httpsRequest || httpsRequest;
  const method = String((event && event.httpMethod) || 'GET').toUpperCase();

  if (method === 'OPTIONS') {
    return { statusCode: 204, headers: { 'Allow': 'POST, OPTIONS' }, body: '' };
  }
  if (method !== 'POST') {
    return jsonResponse(405, { ok: false, error: 'Method Not Allowed. Use POST.' });
  }

  const authCheck = typeof deps.verifyAdminAuth === 'function'
    ? await deps.verifyAdminAuth(event, requestImpl)
    : await verifyAdminAuth(event, requestImpl);
  if (!authCheck || !authCheck.ok) {
    return jsonResponse((authCheck && authCheck.statusCode) || 401, {
      ok: false,
      error: (authCheck && authCheck.error) || 'Unauthorized.'
    });
  }

  let bodyObj = {};
  if (event && event.body) {
    try {
      const rawBody = event.isBase64Encoded
        ? Buffer.from(event.body, 'base64').toString('utf8')
        : String(event.body);
      bodyObj = JSON.parse(rawBody || '{}');
    } catch (e) {
      return jsonResponse(400, { ok: false, error: 'Invalid JSON request body.' });
    }
  }

  let urlList = sanitizeUrlList(bodyObj.urlList);
  if (urlList.length === 0) {
    try {
      urlList = await fetchLiveSitemapUrls(requestImpl);
    } catch (err) {
      return jsonResponse(502, { ok: false, error: err.message });
    }
  }

  if (urlList.length === 0) {
    return jsonResponse(400, { ok: false, error: `No valid https://${HOST}/ URLs to submit.` });
  }

  const indexNowPayload = {
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList
  };
  const payloadStr = JSON.stringify(indexNowPayload);

  try {
    const upstream = await requestImpl(
      INDEXNOW_ENDPOINT,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Content-Length': Buffer.byteLength(payloadStr)
        }
      },
      payloadStr
    );

    const isSuccess = upstream.status >= 200 && upstream.status < 300;
    return jsonResponse(isSuccess ? 200 : 502, {
      ok: isSuccess,
      status: upstream.status,
      submittedCount: urlList.length,
      key: KEY,
      keyLocation: KEY_LOCATION,
      upstreamBody: (upstream.body || '').trim().slice(0, 300),
      error: isSuccess ? '' : `IndexNow API returned HTTP ${upstream.status}`
    });
  } catch (err) {
    return jsonResponse(502, {
      ok: false,
      status: 0,
      submittedCount: urlList.length,
      key: KEY,
      keyLocation: KEY_LOCATION,
      error: err.message || 'IndexNow network request failed'
    });
  }
};

exports._internals = {
  HOST,
  KEY,
  KEY_LOCATION,
  sanitizeUrlList,
  fetchLiveSitemapUrls,
  verifyAdminAuth
};
