/**
 * Shared Open Graph & Firestore metadata utilities for REMO World.
 * Pure standard JavaScript (compatible with Node 20+ Netlify Functions & Deno Edge Functions).
 */

export const REMO_ORIGIN = 'https://remoworld.com';
export const FIREBASE_PROJECT_ID = 'remo-world';
export const FIRESTORE_COLLECTION = 'remo_posts';
export const FIRESTORE_ROOMS_COLLECTION = 'remo_focus_rooms';

export const REMO_CITIES_META = {
  montreal:   { id: 'montreal',   name_en: 'Montréal',       name_fr: 'Montréal',       flag: '⚜️', themeColor: '#8b5cf6' },
  paris:      { id: 'paris',      name_en: 'Paris',          name_fr: 'Paris',          flag: '🗼', themeColor: '#f59e0b' },
  chisinau:   { id: 'chisinau',   name_en: 'Chișinău',       name_fr: 'Chișinău',       flag: '🇲🇩', themeColor: '#fbbf24' },
  bucharest:  { id: 'bucharest',  name_en: 'Bucharest',      name_fr: 'Bucarest',       flag: '🇷🇴', themeColor: '#38bdf8' },
  newyork:    { id: 'newyork',    name_en: 'New York',       name_fr: 'New York',       flag: '🗽', themeColor: '#06b6d4' },
  tokyo:      { id: 'tokyo',      name_en: 'Tokyo',          name_fr: 'Tokyo',          flag: '🏯', themeColor: '#ec4899' },
  london:     { id: 'london',     name_en: 'London',         name_fr: 'Londres',        flag: '🏰', themeColor: '#6366f1' },
  dubai:      { id: 'dubai',      name_en: 'Dubai',          name_fr: 'Dubaï',          flag: '🌆', themeColor: '#eab308' },
  miami:      { id: 'miami',      name_en: 'Miami',          name_fr: 'Miami',          flag: '🌴', themeColor: '#f43f5e' },
  barcelona:  { id: 'barcelona',  name_en: 'Barcelona',      name_fr: 'Barcelone',      flag: '☀️', themeColor: '#f97316' },
  rome:       { id: 'rome',       name_en: 'Rome',           name_fr: 'Rome',           flag: '🏛️', themeColor: '#d97706' },
  toronto:    { id: 'toronto',    name_en: 'Toronto',        name_fr: 'Toronto',        flag: '🍁', themeColor: '#3b82f6' },
  monaco:     { id: 'monaco',     name_en: 'Monaco',         name_fr: 'Monaco',         flag: '🏎️', themeColor: '#fde047' },
  losangeles: { id: 'losangeles', name_en: 'Los Angeles',    name_fr: 'Los Angeles',    flag: '🎬', themeColor: '#a855f7' },
  seoul:      { id: 'seoul',      name_en: 'Seoul',          name_fr: 'Séoul',          flag: '⚡', themeColor: '#14b8a6' },
  geneva:     { id: 'geneva',     name_en: 'Geneva',         name_fr: 'Genève',         flag: '⌚', themeColor: '#22d3ee' },
  singapore:  { id: 'singapore',  name_en: 'Singapore',      name_fr: 'Singapour',      flag: '🦁', themeColor: '#10b981' },
  sydney:     { id: 'sydney',     name_en: 'Sydney',         name_fr: 'Sydney',         flag: '⛵', themeColor: '#0ea5e9' },
  rio:        { id: 'rio',        name_en: 'Rio de Janeiro', name_fr: 'Rio de Janeiro', flag: '🎭', themeColor: '#eab308' },
  istanbul:   { id: 'istanbul',   name_en: 'Istanbul',       name_fr: 'Istanbul',       flag: '🕌', themeColor: '#f59e0b' },
  berlin:     { id: 'berlin',     name_en: 'Berlin',         name_fr: 'Berlin',         flag: '🎧', themeColor: '#a3e635' },
  amsterdam:  { id: 'amsterdam',  name_en: 'Amsterdam',      name_fr: 'Amsterdam',      flag: '🚲', themeColor: '#fb923c' },
  lisbon:     { id: 'lisbon',     name_en: 'Lisbon',         name_fr: 'Lisbonne',       flag: '🚋', themeColor: '#fbbf24' },
  cairo:      { id: 'cairo',      name_en: 'Cairo',          name_fr: 'Le Caire',       flag: '🔺', themeColor: '#f59e0b' }
};

export const TEXT_CARD_THEMES_OG = {
  aurora:    { stops: ['#1e1b4b', '#312e81', '#831843'], textColor: '#ffffff', accent: '#38bdf8' },
  sunset:    { stops: ['#7c2d12', '#c2410c', '#be123c'], textColor: '#ffffff', accent: '#fde047' },
  parchment: { stops: ['#27211a', '#443829', '#1c1917'], textColor: '#fef3c7', accent: '#fbbf24' },
  emerald:   { stops: ['#064e3b', '#0f3d3e', '#0e7490'], textColor: '#ffffff', accent: '#34d399' },
  velvet:    { stops: ['#020617', '#1e1b4b', '#3b0764'], textColor: '#ffffff', accent: '#c084fc' },
  ruby:      { stops: ['#4c0519', '#9f1239', '#311042'], textColor: '#ffffff', accent: '#fda4af' },
  ocean:     { stops: ['#082f49', '#0369a1', '#1e1b4b'], textColor: '#ffffff', accent: '#7dd3fc' },
  city:      { stops: ['#050816', '#0f172a', '#050816'], textColor: '#ffffff', accent: '#38bdf8' }
};

export const TEXT_CARD_BADGE_LABELS = {
  proverb: { en: 'Proverb',   fr: 'Proverbe', icon: '📜' },
  wish:    { en: 'Good Wish', fr: 'Bon Vœu',  icon: '✨' },
  thought: { en: 'Thought',   fr: 'Pensée',   icon: '💭' },
  story:   { en: 'Story',     fr: 'Histoire', icon: '📖' }
};

export function getCityMeta(cityId) {
  return REMO_CITIES_META[String(cityId || '').toLowerCase()] || REMO_CITIES_META.montreal;
}

export function getCityDisplayName(city, lang = 'en') {
  if (!city) return 'World';
  return lang === 'fr' ? (city.name_fr || city.name_en) : (city.name_en || city.name_fr);
}

export function escapeHtmlAttr(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function truncateClean(str, maxLen) {
  const clean = String(str || '').replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLen) return clean;
  return clean.slice(0, Math.max(1, maxLen - 1)).trimEnd() + '…';
}

export function decodeFirestoreValue(val) {
  if (!val || typeof val !== 'object') return null;
  if ('stringValue' in val) return val.stringValue;
  if ('integerValue' in val) return Number(val.integerValue);
  if ('doubleValue' in val) return Number(val.doubleValue);
  if ('booleanValue' in val) return Boolean(val.booleanValue);
  if ('timestampValue' in val) return val.timestampValue;
  if ('nullValue' in val) return null;
  if ('arrayValue' in val) {
    const arr = (val.arrayValue && Array.isArray(val.arrayValue.values)) ? val.arrayValue.values : [];
    return arr.map(decodeFirestoreValue);
  }
  if ('mapValue' in val) {
    return decodeFirestoreFields(val.mapValue && val.mapValue.fields);
  }
  return null;
}

export function decodeFirestoreFields(fields) {
  if (!fields || typeof fields !== 'object') return {};
  const out = {};
  for (const [k, v] of Object.entries(fields)) {
    out[k] = decodeFirestoreValue(v);
  }
  return out;
}

export function decodeFirestoreDoc(docJson) {
  if (!docJson || !docJson.fields) return null;
  const decoded = decodeFirestoreFields(docJson.fields);
  if (!decoded.id && typeof docJson.name === 'string') {
    const parts = docJson.name.split('/');
    decoded.id = parts[parts.length - 1] || '';
  }
  return decoded;
}

export function isValidPostId(postId) {
  return typeof postId === 'string' && /^[a-zA-Z0-9_-]{3,120}$/.test(postId);
}

export async function fetchFirestorePost(postId, opts = {}) {
  if (!isValidPostId(postId)) return null;
  const fetchImpl = opts.fetchImpl || globalThis.fetch;
  if (typeof fetchImpl !== 'function') return null;

  const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/${FIRESTORE_COLLECTION}/${encodeURIComponent(postId)}`;
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), opts.timeoutMs || 2200) : null;

  try {
    const res = await fetchImpl(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller ? controller.signal : undefined
    });
    if (!res || !res.ok) return null;
    const json = await res.json();
    return decodeFirestoreDoc(json);
  } catch (e) {
    return null;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export function isPostTimeLocked(post, nowMs = Date.now()) {
  return Boolean(post && post.wasTimeCapsule && Number(post.unlockAt || 0) > nowMs);
}

export function getTextCardFirstPage(post) {
  const tc = post && post.textCard;
  if (!tc) return '';
  if (Array.isArray(tc.pages) && tc.pages.length && String(tc.pages[0] || '').trim()) {
    return String(tc.pages[0]).trim();
  }
  return String(tc.raw || '').split(/\n\s*(?:---|===)\s*\n/)[0].trim();
}

export function sanitizeRecipientName(raw) {
  return String(raw || '').replace(/[\r\n<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 32);
}

export function isValidRoomId(roomId) {
  return typeof roomId === 'string' && /^[a-zA-Z0-9_-]{2,48}$/.test(roomId);
}

function decodeBase64UrlUtf8(raw) {
  const clean = String(raw || '').trim();
  if (!clean || clean.length > 320) return '';
  const padLen = (4 - (clean.length % 4)) % 4;
  const b64 = clean.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat(padLen);
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    bytes[i] = bin.charCodeAt(i);
  }
  return new TextDecoder('utf-8').decode(bytes);
}

export function decodeBlitzVsToken(raw) {
  const clean = String(raw || '').trim();
  if (!clean || clean.length > 320) return null;
  try {
    const parsed = JSON.parse(decodeBase64UrlUtf8(clean));
    if (!parsed || typeof parsed !== 'object') return null;
    const s = Number(parsed.s);
    const t = Number(parsed.t);
    if (!Number.isInteger(s) || s < 0 || s > 5) return null;
    if (!Number.isFinite(t) || t < 0.1 || t > 3600) return null;
    const n = String(parsed.n || '').replace(/[\r\n<>]/g, '').trim().slice(0, 24) || 'Citizen';
    const g = typeof parsed.g === 'string' && /^[GR]{5}$/.test(parsed.g) ? parsed.g : ('G'.repeat(s) + 'R'.repeat(5 - s));
    const d = typeof parsed.d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(parsed.d) ? parsed.d : '';
    const bNum = Number(parsed.b);
    const b = Number.isInteger(bNum) && bNum >= 1 ? bNum : 1;
    return { n, s, t: Number(t.toFixed(1)), g, d, b };
  } catch (e) {
    return null;
  }
}

export async function fetchFocusRoomDoc(roomId, opts = {}) {
  const cleanRoom = String(roomId || '').trim().replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 48);
  if (!isValidRoomId(cleanRoom)) return null;
  const fetchImpl = opts.fetchImpl || globalThis.fetch;
  if (typeof fetchImpl !== 'function') return null;

  const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/${FIRESTORE_ROOMS_COLLECTION}/${encodeURIComponent(cleanRoom)}`;
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), opts.timeoutMs || 1800) : null;

  try {
    const res = await fetchImpl(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller ? controller.signal : undefined
    });
    if (!res || !res.ok) return null;
    const json = await res.json();
    return decodeFirestoreDoc(json);
  } catch (e) {
    return null;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export function countActiveRoomPeers(roomDoc, nowMs = Date.now()) {
  if (!roomDoc || !roomDoc.peers || typeof roomDoc.peers !== 'object') return 0;
  let count = 0;
  for (const val of Object.values(roomDoc.peers)) {
    if (!val || typeof val !== 'object') continue;
    const ts = Number(val.ts || 0);
    if (!ts || nowMs - ts <= 180000) count++;
  }
  return Math.min(99, count);
}

export function buildBlitzOgMeta(vsData, vsToken = '', lang = 'en') {
  const isFr = lang === 'fr';
  const langParam = isFr ? '&lang=fr' : '';
  const cleanTok = String(vsToken || '').trim();
  const hasVs = Boolean(vsData && cleanTok);
  const canonicalUrl = hasVs
    ? `${REMO_ORIGIN}/?open=blitz&vs=${encodeURIComponent(cleanTok)}`
    : `${REMO_ORIGIN}/?open=blitz`;
  const ogImage = hasVs
    ? `${REMO_ORIGIN}/.netlify/functions/og-image?mode=blitz&vs=${encodeURIComponent(cleanTok)}${langParam}`
    : `${REMO_ORIGIN}/.netlify/functions/og-image?mode=blitz${langParam}`;

  let title = isFr
    ? '⚡ Daily World Blitz 60s — Duel Géographique 1v1 | REMO World'
    : '⚡ Daily World Blitz 60s — 1v1 World Trivia Duel | REMO World';
  let description = isFr
    ? '5 villes du monde en 60 secondes ! Jouez gratuitement et défiez vos amis sur la même graine quotidienne.'
    : 'Guess 5 world cities in 60 seconds! Play the daily global challenge free and duel friends 1v1.';

  if (vsData) {
    const gridEmoji = String(vsData.g || '')
      .split('')
      .map((c) => (c === 'G' ? '🟩' : '🟥'))
      .join('');
    title = isFr
      ? `⚡ World Blitz #${vsData.b} : Bats ${vsData.s}/5 (${vsData.t}s) de ${vsData.n} ! — REMO World`
      : `⚡ World Blitz #${vsData.b}: Beat ${vsData.n}'s ${vsData.s}/5 in ${vsData.t}s! — REMO World`;
    description = isFr
      ? `${gridEmoji} Score de ${vsData.n} : ${vsData.s}/5 en ${vsData.t}s. Vous pensez pouvoir le battre sur les mêmes 5 villes ?`
      : `${gridEmoji} ${vsData.n} scored ${vsData.s}/5 in ${vsData.t}s. Think you can beat them on the exact same 5 cities?`;
  }

  return {
    canonicalUrl,
    ogImage,
    imageWidth: '1200',
    imageHeight: '630',
    title,
    description,
    imageAlt: title
  };
}

export function buildOdysseyOgMeta(opts = {}, lang = 'en') {
  const isFr = lang === 'fr';
  const vs = sanitizeRecipientName(opts.vs || '').slice(0, 22);
  const target = Math.floor(Number(opts.target || 0));
  const startId = String(opts.start || '').trim().toLowerCase();
  const city = startId && REMO_CITIES_META[startId] ? REMO_CITIES_META[startId] : null;
  const cityName = city ? getCityDisplayName(city, isFr ? 'fr' : 'en') : '';
  const hasDuel = Boolean(vs && target > 0);
  const ogImage = hasDuel
    ? `${REMO_ORIGIN}/.netlify/functions/og-image?mode=odyssey&vs=${encodeURIComponent(vs)}&target=${target}${city ? '&start=' + encodeURIComponent(city.id) : ''}${isFr ? '&lang=fr' : ''}`
    : `${REMO_ORIGIN}/img/remo_odyssey_og_cover.jpg`;
  const basePath = isFr ? '/fr/odyssey.html' : '/odyssey.html';
  const qs = new URLSearchParams();
  if (opts.seed) qs.set('seed', String(opts.seed).slice(0, 40));
  if (city) qs.set('start', city.id);
  if (target > 0) qs.set('target', String(target));
  if (vs) qs.set('vs', vs);
  const canonicalUrl = qs.toString() ? `${REMO_ORIGIN}${basePath}?${qs.toString()}` : `${REMO_ORIGIN}${basePath}`;

  let title = isFr
    ? '🧭 REMO ODYSSEY — Jeu Officiel 4D & Duels 1v1 des 24 Villes | REMO World'
    : '🧭 REMO ODYSSEY — Official 4D World Game & 1v1 City Duels | REMO World';
  let description = isFr
    ? 'Courez et surfez en Hover-Coin 4B à travers 24 vraies villes avec météo en direct, 56 radios FM, boss élémentaires et duels Fantôme 1v1. Gratuit PC & Mobile !'
    : 'Sprint & Hover-Coin surf across 24 real world cities with live weather surges, 56 city FM radios, elemental bosses & 1v1 Ghost duels. Free on PC & Mobile!';

  if (hasDuel) {
    const scoreStr = target.toLocaleString(isFr ? 'fr-FR' : 'en-US');
    const locSuffix = city ? ` (${city.flag} ${cityName})` : '';
    title = isFr
      ? `⚔️ Bats le score de ${scoreStr} PTS de @${vs} dans REMO ODYSSEY${locSuffix} !`
      : `⚔️ Beat @${vs}'s ${scoreStr} PTS in REMO ODYSSEY${locSuffix}!`;
    description = isFr
      ? `@${vs} te défie en duel 1v1 sur le même tracé REMO ODYSSEY ! Affronte son Fantôme en direct, vole la Couronne de Ville et joue gratuitement sur PC & Mobile.`
      : `@${vs} challenged you to a 1v1 REMO ODYSSEY Ghost Duel! Race their live Ghost on the exact same city seed, steal the City King Crown & play free now.`;
  }

  return {
    canonicalUrl,
    ogImage,
    imageWidth: '1200',
    imageHeight: '630',
    title,
    description,
    imageAlt: title
  };
}

export function buildStudyRoomOgMeta(opts = {}, lang = 'en') {
  const isFr = lang === 'fr';
  const cleanRoom = String(opts.roomId || '').trim().replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 48);
  const roomDoc = opts.roomDoc || null;
  const effCityId = String((roomDoc && roomDoc.cityId) || opts.cityId || 'montreal').toLowerCase();
  const city = getCityMeta(effCityId);
  const cityName = getCityDisplayName(city, isFr ? 'fr' : 'en');
  const dur = Number((roomDoc && roomDoc.durMin) || opts.durMin) === 50 ? 50 : 25;
  const fx = String(opts.fx || '').trim().replace(/[^a-zA-Z0-9,_-]/g, '').slice(0, 48);
  const peers = opts.peers != null ? Math.max(0, Number(opts.peers) || 0) : countActiveRoomPeers(roomDoc);

  let canonicalUrl = `${REMO_ORIGIN}/?tv=${encodeURIComponent(city.id)}`;
  if (fx) canonicalUrl += `&fx=${encodeURIComponent(fx)}`;
  if (cleanRoom) canonicalUrl += `&room=${encodeURIComponent(cleanRoom)}&rd=${dur}`;

  const langParam = isFr ? '&lang=fr' : '';
  const ogImage = `${REMO_ORIGIN}/.netlify/functions/og-image?mode=room&room=${encodeURIComponent(cleanRoom || 'focus')}&city=${encodeURIComponent(city.id)}&rd=${dur}&peers=${peers}${fx ? '&fx=' + encodeURIComponent(fx) : ''}${langParam}`;

  const peerLabel = peers > 0
    ? (isFr ? ` • 👥 ${peers} en direct` : ` • 👥 ${peers} online`)
    : '';
  const title = isFr
    ? `👥 Salle d'Étude "${cleanRoom || 'Focus'}" (${city.flag} ${cityName} · ${dur}m) — REMO World`
    : `👥 Study Together "${cleanRoom || 'Focus'}" (${city.flag} ${cityName} · ${dur}m) — REMO World`;
  const description = isFr
    ? `Rejoignez la session Pomodoro synchronisée (${dur} min)${peerLabel} avec fenêtre 4D sur ${cityName} & radio LoFi live.`
    : `Join the synced ${dur}-min Pomodoro coworking session${peerLabel} with a live 4D ${cityName} window & Lofi radio.`;

  return {
    canonicalUrl,
    ogImage,
    imageWidth: '1200',
    imageHeight: '630',
    title,
    description,
    imageAlt: title
  };
}

export function buildInviteOgMeta(opts = {}, lang = 'en') {
  const isFr = lang === 'fr';
  const rawCity = String(opts.city || 'montreal').trim().toLowerCase();
  const city = getCityMeta(rawCity);
  const cityName = getCityDisplayName(city, isFr ? 'fr' : 'en');
  const cleanRef = String(opts.ref || opts.invite || opts.promo || 'REMO2026')
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .toUpperCase()
    .slice(0, 24) || 'REMO2026';

  const qs = new URLSearchParams();
  if (opts.ref || opts.invite) qs.set('ref', cleanRef);
  if (opts.city && REMO_CITIES_META[rawCity]) qs.set('city', city.id);
  if (opts.promo) qs.set('promo', String(opts.promo).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 20));
  const basePath = (opts.pathname && opts.pathname.startsWith('/fr/')) ? '/fr/' : '/';
  const canonicalUrl = qs.toString() ? `${REMO_ORIGIN}${basePath}?${qs.toString()}` : `${REMO_ORIGIN}${basePath}`;

  const langParam = isFr ? '&lang=fr' : '';
  const ogImage = `${REMO_ORIGIN}/.netlify/functions/og-image?mode=invite&city=${encodeURIComponent(city.id)}&ref=${encodeURIComponent(cleanRef)}${langParam}`;

  const title = isFr
    ? `🎁 Coffre VIP pour ${city.flag} ${cityName} (+150 🪙 Pièces d'Or + 1 Carte 4D Gratuite) — REMO World`
    : `🎁 Free VIP Welcome Chest for ${city.flag} ${cityName} (+150 🪙 Gold Coins & 1 4D City Card) — REMO World`;
  const description = isFr
    ? `Soutenez ${city.flag} ${cityName} dans le Classement Mondial des Villes 2026 ! Ouvrez votre Coffre VIP gratuit (+150 🪙, 1 Carte 4D & +50 PTS Ville) avec le code ${cleanRef} sur REMO World.`
    : `Support ${city.flag} ${cityName} in the 2026 World Cities Live Ranking! Claim your free VIP Welcome Chest (+150 🪙, 1 Free 4D Card & +50 City PTS) with code ${cleanRef} on REMO World.`;

  return {
    canonicalUrl,
    ogImage,
    imageWidth: '1200',
    imageHeight: '630',
    title,
    description,
    imageAlt: title
  };
}

export function buildPostOgMeta(post, lang = 'en', nowMs = Date.now(), recipientOverride = '') {
  if (!post || !post.id) return null;
  const isFr = lang === 'fr';
  const city = getCityMeta(post.cityId);
  const cityName = getCityDisplayName(city, isFr ? 'fr' : 'en');
  const author = post.authorName ? `@${post.authorName}` : '@REMO Citizen';
  const locked = isPostTimeLocked(post, nowMs);
  const mystery = Boolean(post.mysteryCity && !post.versus);
  const cap = isFr
    ? (post.caption_fr || post.caption_en || '')
    : (post.caption_en || post.caption_fr || '');
  const dedicatedTo = (!locked && post.mediaType === 'text_card')
    ? sanitizeRecipientName(recipientOverride || (post.textCard && post.textCard.dedicatedTo) || '')
    : '';

  const encodedId = encodeURIComponent(post.id);
  const langParam = isFr ? '&lang=fr' : '';
  const toParam = dedicatedTo ? `&to=${encodeURIComponent(dedicatedTo)}` : '';
  const canonicalUrl = `${REMO_ORIGIN}/?post=${encodedId}${toParam}`;
  const dynamicImgUrl = `${REMO_ORIGIN}/.netlify/functions/og-image?post=${encodedId}${toParam}${langParam}`;

  let ogImage = dynamicImgUrl;
  let imageWidth = '1200';
  let imageHeight = '630';

  const directHttpImg = !locked &&
    ['image', 'carousel', 'before_after'].includes(post.mediaType) &&
    typeof post.mediaUrl === 'string' &&
    post.mediaUrl.startsWith('https://');

  if (directHttpImg) {
    ogImage = post.mediaUrl;
    imageWidth = '';
    imageHeight = '';
  } else if (!locked && post.mediaType === 'image' && typeof post.mediaUrl === 'string' && post.mediaUrl.startsWith('data:image/')) {
    ogImage = `${REMO_ORIGIN}/.netlify/functions/og-image?post=${encodedId}`;
    imageWidth = '';
    imageHeight = '';
  }

  let title = `REMO World 🌐 ${city.flag} ${cityName}`;
  let description = isFr
    ? 'Découvrez cette publication en direct sur REMO World — Réseau social 4D de 24 villes.'
    : 'Explore this live post on REMO World — The 4D Social Network for 24 world cities.';

  if (locked) {
    const teaser = isFr ? (post.capsuleTeaser_fr || post.capsuleTeaser_en || '') : (post.capsuleTeaser_en || post.capsuleTeaser_fr || '');
    title = isFr
      ? `⏳ Capsule Temporelle Mystère (${author}) — REMO World`
      : `⏳ Live Time-Capsule Mystery (${author}) — REMO World`;
    description = teaser
      ? `⏳ "${truncateClean(teaser, 140)}" — REMO World`
      : (isFr ? '⏳ Compte à rebours en direct sur REMO World !' : '⏳ Mystery countdown unlocking live on REMO World!');
  } else if (post.versus) {
    const v = post.versus;
    const cA = getCityMeta(v.leftCityId || 'montreal');
    const cB = getCityMeta(v.rightCityId || 'paris');
    const nA = getCityDisplayName(cA, isFr ? 'fr' : 'en');
    const nB = getCityDisplayName(cB, isFr ? 'fr' : 'en');
    const lv = Number(v.leftVotes || 0);
    const rv = Number(v.rightVotes || 0);
    const tot = lv + rv;
    const pA = tot > 0 ? Math.round((lv / tot) * 100) : 50;
    const pB = 100 - pA;
    title = isFr
      ? `⚔️ Duel en direct : ${cA.flag} ${nA} vs ${cB.flag} ${nB} — REMO World`
      : `⚔️ Live City Duel: ${cA.flag} ${nA} vs ${cB.flag} ${nB} — REMO World`;
    description = isFr
      ? `Score actuel : ${nA} ${pA}% vs ${nB} ${pB}% (${tot} votes). Votez pour votre ville sur REMO World !`
      : `Current score: ${nA} ${pA}% vs ${nB} ${pB}% (${tot} votes). Cast your vote now on REMO World!`;
  } else if (post.mediaType === 'text_card' && post.textCard) {
    const badgeInfo = TEXT_CARD_BADGE_LABELS[post.textCard.badgeType];
    const badgeTxt = badgeInfo ? `${badgeInfo.icon} ${isFr ? badgeInfo.fr : badgeInfo.en}` : (isFr ? '✍️ Carte Texte' : '✍️ Text Card');
    const page1 = getTextCardFirstPage(post);
    const pageCount = Array.isArray(post.textCard.pages) && post.textCard.pages.length ? post.textCard.pages.length : 1;
    const locTxt = mystery
      ? (isFr ? '🕵️ Devinez la Ville' : '🕵️ Guess This City')
      : `${city.flag} ${cityName}`;

    title = dedicatedTo
      ? (isFr
          ? `🎁 Pour ${dedicatedTo} · ${badgeTxt} (${author}) — REMO World`
          : `🎁 For ${dedicatedTo} · ${badgeTxt} (${author}) — REMO World`)
      : `${badgeTxt} · ${locTxt} (${author}) — REMO World`;
    const quoteSnippet = truncateClean(page1, 145);
    const pagesSuffix = pageCount > 1 ? ` [${pageCount} pages]` : '';
    const toLead = dedicatedTo
      ? (isFr ? `✨ Dédicacé à ${dedicatedTo} — ` : `✨ Dedicated to ${dedicatedTo} — `)
      : '';
    description = quoteSnippet
      ? `${toLead}"${quoteSnippet}"${pagesSuffix}${cap ? ` — ${truncateClean(cap, 60)}` : ''}`
      : (dedicatedTo
          ? (isFr ? `✨ Vœu personnalisé de ${author} pour ${dedicatedTo} sur REMO World.` : `✨ Personalized REMO card from ${author} for ${dedicatedTo}.`)
          : (isFr ? 'Lisez cette carte texte sur REMO World.' : 'Read this Text Card on REMO World.'));
  } else if (mystery) {
    title = isFr
      ? `🕵️ Devinez cette Ville ! (${author}) — REMO World`
      : `🕵️ Guess My City Challenge! (${author}) — REMO World`;
    description = cap
      ? `"${truncateClean(cap, 140)}" — ${isFr ? 'Saurez-vous deviner la ville ?' : 'Can you guess the secret city?'}`
      : (isFr ? 'Saurez-vous trouver de quelle ville vient ce moment ?' : 'Can you guess which world city this moment is from?');
  } else {
    const mediaTag = post.mediaType === 'html_app'
      ? '💻 4D Mini-App'
      : (post.mediaType === 'video' || post.mediaType === 'video_link')
        ? '🎬 Video'
        : `${city.flag} ${cityName}`;
    title = `${mediaTag} • ${author} — REMO World`;
    description = cap
      ? truncateClean(cap, 165)
      : (isFr
          ? `${city.flag} En direct de ${cityName} sur REMO World — Radio Live, Focus TV & Passeport 4D.`
          : `${city.flag} Live from ${cityName} on REMO World — Live Radio, Focus TV & 4D Passport.`);
  }

  return {
    title: truncateClean(title, 110),
    description: truncateClean(description, 220),
    ogImage,
    imageWidth,
    imageHeight,
    imageAlt: truncateClean(title, 120),
    canonicalUrl
  };
}
