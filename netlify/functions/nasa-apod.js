/**
 * Netlify Serverless Function: NASA Space Birthday & APOD Cached Proxy
 * - Protects optional process.env.NASA_API_KEY (falls back gracefully to DEMO_KEY + keyless NASA Images API)
 * - Smart birthday date normalization: dates before 1995-06-16 map deterministically to the same month/day
 *   in the APOD archive so every birthday produces a real cosmic masterpiece without errors.
 * - Automatic server-to-server fallback to images-api.nasa.gov (zero API key, high quota) if APOD is busy or returns video.
 */
const https = require('https');

const _cache = new Map(); // cacheKey -> { data, exp }
const APOD_START = '1995-06-16';
const COSMIC_TOPICS = [
  'nebula hubble',
  'galaxy james webb',
  'supernova remnant',
  'saturn cassini rings',
  'pillars of creation',
  'aurora borealis iss',
  'jupiter juno storm',
  'andromeda galaxy',
  'crab nebula',
  'orion nebula',
  'eagle nebula',
  'sombrero galaxy'
];

function getJson(urlStr, timeoutMs = 7500) {
  return new Promise((resolve, reject) => {
    const req = https.get(urlStr, {
      headers: {
        'User-Agent': 'REMO-World-SpaceBirthday/1.0 (+https://remoworld.com)',
        'Accept': 'application/json'
      },
      timeout: timeoutMs
    }, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (c) => { body += c; });
      res.on('end', () => {
        if (res.statusCode !== 200) {
          const err = new Error(`HTTP ${res.statusCode}`);
          err.statusCode = res.statusCode;
          return reject(err);
        }
        try { resolve(JSON.parse(body)); } catch (e) { reject(e); }
      });
    });
    req.on('timeout', () => { req.destroy(new Error('timeout')); });
    req.on('error', reject);
  });
}

function respond(statusCode, payload, maxAgeSec = 3600) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Cache-Control': `public, max-age=${maxAgeSec}`
    },
    body: JSON.stringify(payload)
  };
}

function getTodayIsoUtc() {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = String(now.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function normalizeRequestedDate(rawDate) {
  const today = getTodayIsoUtc();
  if (!rawDate || !/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
    return { requested: today, queryDate: today, matchedMode: 'today' };
  }
  const [yStr, mStr, dStr] = rawDate.split('-');
  const y = Number(yStr);
  const m = Math.min(12, Math.max(1, Number(mStr)));
  const d = Math.min(28, Math.max(1, Number(dStr)));
  const safeDay = (m === 2 && Number(dStr) === 29) ? '28' : String(Math.min(31, Math.max(1, Number(dStr)))).padStart(2, '0');
  const safeMonth = String(m).padStart(2, '0');
  const normalized = `${yStr}-${safeMonth}-${safeDay}`;

  if (normalized > today) {
    return { requested: normalized, queryDate: today, matchedMode: 'today' };
  }
  if (normalized < APOD_START) {
    // Map pre-1995 birthday deterministically to same Month/Day in 1998..2023
    const mappedYear = 1998 + (Math.abs(y * 7 + m * 3 + d) % 26);
    const mappedDay = (m === 2 && Number(safeDay) > 28) ? '28' : safeDay;
    return {
      requested: normalized,
      queryDate: `${mappedYear}-${safeMonth}-${mappedDay}`,
      matchedMode: 'birthday_anniversary'
    };
  }
  return { requested: normalized, queryDate: normalized, matchedMode: 'exact_date' };
}

function hashDateSeed(dateStr) {
  let h = 2166136261;
  for (let i = 0; i < dateStr.length; i++) {
    h ^= dateStr.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

async function fetchNasaImagesFallback(dateInfo) {
  const seed = hashDateSeed(dateInfo.requested);
  const topic = COSMIC_TOPICS[seed % COSMIC_TOPICS.length];
  const url = `https://images-api.nasa.gov/search?q=${encodeURIComponent(topic)}&media_type=image&page=1`;
  const data = await getJson(url, 7500);
  const items = ((data && data.collection && data.collection.items) || [])
    .filter((it) => it && Array.isArray(it.links) && it.links[0] && it.links[0].href && Array.isArray(it.data) && it.data[0]);
  if (!items.length) throw new Error('No NASA image results');
  const picked = items[seed % items.length];
  const meta = picked.data[0];
  const imgUrl = picked.links[0].href;
  const rawDesc = String(meta.description || meta.description_508 || '').replace(/<[^>]*>/g, '').trim();
  return {
    ok: true,
    source: 'nasa_images',
    matchedMode: dateInfo.matchedMode === 'today' ? 'today' : 'cosmic_archive',
    requestedDate: dateInfo.requested,
    apodDate: String(meta.date_created || dateInfo.queryDate).slice(0, 10),
    title: String(meta.title || 'NASA Deep Space Archive').trim(),
    explanation: rawDesc.length > 420 ? rawDesc.slice(0, 417).trim() + '…' : rawDesc,
    imageUrl: imgUrl,
    hdUrl: imgUrl,
    credit: String(meta.center || meta.photographer || 'NASA / JPL / STScI').trim()
  };
}

exports.handler = async (event) => {
  if (String((event && event.httpMethod) || 'GET').toUpperCase() === 'OPTIONS') {
    return respond(204, {}, 60);
  }

  const qs = (event && event.queryStringParameters) || {};
  const rawDate = String(qs.date || '').trim();
  const dateInfo = normalizeRequestedDate(rawDate);
  const cacheKey = `${dateInfo.requested}|${dateInfo.queryDate}`;

  const cached = _cache.get(cacheKey);
  if (cached && Date.now() < cached.exp) {
    return respond(200, cached.data, dateInfo.matchedMode === 'today' ? 1800 : 86400);
  }

  const apiKey = String(process.env.NASA_API_KEY || 'DEMO_KEY').trim() || 'DEMO_KEY';
  let result = null;

  try {
    const apodUrl = `https://api.nasa.gov/planetary/apod?api_key=${encodeURIComponent(apiKey)}&date=${encodeURIComponent(dateInfo.queryDate)}&thumbs=true`;
    const d = await getJson(apodUrl, 7000);
    const mediaUrl = d.media_type === 'image' ? (d.url || d.hdurl) : (d.thumbnail_url || '');
    if (d && d.title && mediaUrl && /^https?:\/\//i.test(mediaUrl)) {
      const expTxt = String(d.explanation || '').trim();
      result = {
        ok: true,
        source: 'nasa_apod',
        matchedMode: dateInfo.matchedMode,
        requestedDate: dateInfo.requested,
        apodDate: String(d.date || dateInfo.queryDate),
        title: String(d.title).trim(),
        explanation: expTxt.length > 420 ? expTxt.slice(0, 417).trim() + '…' : expTxt,
        imageUrl: mediaUrl,
        hdUrl: d.hdurl || mediaUrl,
        credit: String(d.copyright || 'NASA APOD').trim()
      };
    }
  } catch (e) {
    // Fall through cleanly to keyless NASA Images API
  }

  if (!result) {
    try {
      result = await fetchNasaImagesFallback(dateInfo);
    } catch (e2) {
      return respond(502, { ok: false, error: 'NASA upstream temporarily busy' }, 30);
    }
  }

  const ttlMs = dateInfo.matchedMode === 'today' ? (6 * 3600 * 1000) : (24 * 3600 * 1000);
  _cache.set(cacheKey, { data: result, exp: Date.now() + ttlMs });
  if (_cache.size > 400) _cache.clear();
  return respond(200, result, dateInfo.matchedMode === 'today' ? 1800 : 86400);
};
