/**
 * Shared Open Graph & Firestore metadata utilities for REMO World.
 * Pure standard JavaScript (compatible with Node 20+ Netlify Functions & Deno Edge Functions).
 */

export const REMO_ORIGIN = 'https://remoworld.com';
export const FIREBASE_PROJECT_ID = 'remo-world';
export const FIRESTORE_COLLECTION = 'remo_posts';

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

export function buildPostOgMeta(post, lang = 'en', nowMs = Date.now()) {
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

  const encodedId = encodeURIComponent(post.id);
  const langParam = isFr ? '&lang=fr' : '';
  const canonicalUrl = `${REMO_ORIGIN}/?post=${encodedId}`;
  const dynamicImgUrl = `${REMO_ORIGIN}/.netlify/functions/og-image?post=${encodedId}${langParam}`;

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

    title = `${badgeTxt} · ${locTxt} (${author}) — REMO World`;
    const quoteSnippet = truncateClean(page1, 145);
    const pagesSuffix = pageCount > 1 ? ` [${pageCount} pages]` : '';
    description = quoteSnippet
      ? `"${quoteSnippet}"${pagesSuffix}${cap ? ` — ${truncateClean(cap, 60)}` : ''}`
      : (isFr ? 'Lisez cette carte texte sur REMO World.' : 'Read this Text Card on REMO World.');
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
