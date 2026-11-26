/**
 * Netlify Serverless Function: Live Flight Radar CORS Proxy
 * Fetches live ADS-B aircraft overhead from api.adsb.lol (primary) or OpenSky (fallback)
 * server-to-server (avoiding browser CORS blocks) and returns clean normalized JSON.
 */
const https = require('https');
const { resolveSafeCorsHeaders, checkMemoryRateLimit } = require('../shared/html-vault-core');

const _cache = new Map(); // gridKey -> { data, exp }

function getJson(urlStr, timeoutMs = 6500) {
  return new Promise((resolve, reject) => {
    const req = https.get(urlStr, {
      headers: {
        'User-Agent': 'REMO-World-FlightRadar/1.0 (+https://remoworld.com)',
        'Accept': 'application/json'
      },
      timeout: timeoutMs
    }, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (c) => { body += c; });
      res.on('end', () => {
        if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
        try { resolve(JSON.parse(body)); } catch (e) { reject(e); }
      });
    });
    req.on('timeout', () => { req.destroy(new Error('timeout')); });
    req.on('error', reject);
  });
}

function respond(statusCode, payload, corsHeaders = {}) {
  return {
    statusCode,
    headers: Object.assign({
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=8'
    }, corsHeaders),
    body: JSON.stringify(payload)
  };
}

exports.handler = async (event) => {
  const cors = resolveSafeCorsHeaders(event, { allowNullOrigin: true });
  if (!cors.ok) {
    return respond(403, { ok: false, error: cors.reason || 'Forbidden origin' });
  }
  if (String(event.httpMethod || 'GET').toUpperCase() === 'OPTIONS') {
    return respond(204, {}, cors.headers);
  }
  const ip = String((event.headers && (event.headers['x-nf-client-connection-ip'] || event.headers['x-forwarded-for'])) || 'unknown').split(',')[0].trim();
  const rl = checkMemoryRateLimit('flight_radar:' + ip, 45, 60000);
  if (!rl.allowed) {
    return respond(429, { ok: false, error: 'Rate limit exceeded' }, Object.assign({}, cors.headers, { 'Retry-After': String(rl.retryAfterSec) }));
  }
  const qs = (event && event.queryStringParameters) || {};
  const lat = Number(qs.lat);
  const lng = Number(qs.lng);
  const distNm = Math.min(120, Math.max(25, Number(qs.dist) || 80));

  if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return respond(400, { ok: false, error: 'Invalid lat/lng' }, cors.headers);
  }

  const gridKey = `${lat.toFixed(2)},${lng.toFixed(2)},${Math.round(distNm)}`;
  const cached = _cache.get(gridKey);
  if (cached && Date.now() < cached.exp) {
    return respond(200, cached.data, cors.headers);
  }

  let planes = [];
  let total = 0;
  let source = 'adsb.lol';

  // Primary: api.adsb.lol (fast, reliable live ADS-B community feed)
  try {
    const d = await getJson(`https://api.adsb.lol/v2/point/${lat.toFixed(4)}/${lng.toFixed(4)}/${Math.round(distNm)}`);
    const ac = Array.isArray(d && d.ac) ? d.ac : [];
    const airborne = ac.filter((a) => a && a.lat != null && a.lon != null && a.alt_baro !== 'ground');
    total = airborne.length;
    planes = airborne.slice(0, 24).map((a) => ({
      call: String(a.flight || a.r || a.hex || 'FLT').trim() || 'FLT',
      type: String(a.t || a.desc || 'Jet').trim(),
      reg: String(a.r || '').trim(),
      lat: Number(a.lat),
      lng: Number(a.lon),
      altM: Math.round((Number(a.alt_baro || a.alt_geom || 0)) * 0.3048),
      spdKmh: Math.round((Number(a.gs || 0)) * 1.852),
      hdg: Math.round(Number(a.track || 0))
    }));
  } catch (e1) {
    // Fallback: OpenSky server-to-server
    source = 'opensky';
    try {
      const dLat = 0.9;
      const dLng = 1.25;
      const d = await getJson(
        `https://opensky-network.org/api/states/all?lamin=${(lat - dLat).toFixed(3)}&lomin=${(lng - dLng).toFixed(3)}&lamax=${(lat + dLat).toFixed(3)}&lomax=${(lng + dLng).toFixed(3)}`
      );
      const raw = (Array.isArray(d && d.states) ? d.states : []).filter((s) => s[5] != null && s[6] != null && !s[8]);
      total = raw.length;
      planes = raw.slice(0, 24).map((s) => ({
        call: String(s[1] || 'FLT').trim() || 'FLT',
        type: String(s[2] || 'Intl').trim(),
        reg: '',
        lat: Number(s[6]),
        lng: Number(s[5]),
        altM: Math.round(Number(s[7] || s[13] || 0)),
        spdKmh: Math.round(Number(s[9] || 0) * 3.6),
        hdg: Math.round(Number(s[10] || 0))
      }));
    } catch (e2) {
      return respond(502, { ok: false, error: 'Live radar upstream busy' }, cors.headers);
    }
  }

  const payload = { ok: true, source, total, planes, ts: Date.now() };
  _cache.set(gridKey, { data: payload, exp: Date.now() + 8000 });
  if (_cache.size > 80) _cache.clear();
  return respond(200, payload, cors.headers);
};
