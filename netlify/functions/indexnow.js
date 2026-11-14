/**
 * Netlify Serverless Function: Official IndexNow Batch Proxy
 * Avoids browser CORS restrictions by posting JSON server-to-server to IndexNow
 * and returning the genuine upstream HTTP status code (200/202 vs 4xx/5xx).
 */
const https = require('https');

const HOST = 'remoworld.com';
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
  fetchLiveSitemapUrls
};
