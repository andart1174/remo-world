/**
 * Netlify Edge Function: Dynamic Open Graph Meta Injection
 * Intercepts /?post=<id>[&to=<name>], /?open=blitz[&vs=<tok>], and /?room=<slug>
 * requests (WhatsApp, Facebook, Telegram, X, Discord, iMessage) and injects tailored
 * og:title, og:description, and og:image without delaying homepage loads.
 */
import {
  isValidPostId,
  isValidRoomId,
  fetchFirestorePost,
  fetchFocusRoomDoc,
  decodeBlitzVsToken,
  buildPostOgMeta,
  buildBlitzOgMeta,
  buildOdysseyOgMeta,
  buildStudyRoomOgMeta,
  buildInviteOgMeta,
  sanitizeRecipientName,
  escapeHtmlAttr
} from '../shared/og-meta.mjs';

export function detectRequestLang(url, request) {
  const qLang = (url.searchParams.get('lang') || '').toLowerCase();
  if (qLang === 'fr' || qLang === 'en') return qLang;
  if (url.pathname && url.pathname.startsWith('/fr/')) return 'fr';
  const accept = (request && request.headers && request.headers.get('accept-language')) || '';
  if (accept.toLowerCase().trim().startsWith('fr')) return 'fr';
  return 'en';
}

function replaceMetaContent(html, attrName, attrVal, newContent) {
  const safeVal = escapeHtmlAttr(newContent);
  const re = new RegExp(`(<meta\\s+${attrName}=["']${attrVal}["']\\s+content=["'])[^"']*(["'][^>]*>)`, 'i');
  return html.replace(re, (_, pre, post) => `${pre}${safeVal}${post}`);
}

function removeMetaTag(html, attrName, attrVal) {
  const re = new RegExp(`\\s*<meta\\s+${attrName}=["']${attrVal}["'][^>]*>\\r?\\n?`, 'i');
  return html.replace(re, '\n');
}

export function injectPostOgIntoHtml(html, meta) {
  if (!html || !meta) return html;
  let out = html;

  const safeTitle = escapeHtmlAttr(meta.title);
  const safeUrl = escapeHtmlAttr(meta.canonicalUrl);

  out = out.replace(/<title>[\s\S]*?<\/title>/i, () => `<title>${safeTitle}</title>`);
  out = replaceMetaContent(out, 'name', 'description', meta.description);
  out = out.replace(/(<link\s+rel=["']canonical["']\s+href=["'])[^"']*(["'][^>]*>)/i, (_, pre, post) => `${pre}${safeUrl}${post}`);

  out = replaceMetaContent(out, 'property', 'og:url', meta.canonicalUrl);
  out = replaceMetaContent(out, 'property', 'og:title', meta.title);
  out = replaceMetaContent(out, 'property', 'og:description', meta.description);
  out = replaceMetaContent(out, 'property', 'og:image', meta.ogImage);
  out = replaceMetaContent(out, 'property', 'og:image:alt', meta.imageAlt);

  if (meta.imageWidth && meta.imageHeight) {
    out = replaceMetaContent(out, 'property', 'og:image:width', meta.imageWidth);
    out = replaceMetaContent(out, 'property', 'og:image:height', meta.imageHeight);
  } else {
    out = removeMetaTag(out, 'property', 'og:image:width');
    out = removeMetaTag(out, 'property', 'og:image:height');
  }

  out = replaceMetaContent(out, 'name', 'twitter:title', meta.title);
  out = replaceMetaContent(out, 'name', 'twitter:description', meta.description);
  out = replaceMetaContent(out, 'name', 'twitter:image', meta.ogImage);

  return out;
}

export default async (request, context) => {
  const method = String(request.method || 'GET').toUpperCase();
  if (method !== 'GET' && method !== 'HEAD') {
    return context.next();
  }

  const url = new URL(request.url);
  const postId = (url.searchParams.get('post') || '').trim();
  const roomId = (url.searchParams.get('room') || '').trim();
  const openTarget = (url.searchParams.get('open') || '').trim().toLowerCase();
  const vsToken = (url.searchParams.get('vs') || '').trim();
  const targetScore = Number(url.searchParams.get('target') || 0);
  const isOdysseyPath = url.pathname === '/odyssey.html' || url.pathname === '/fr/odyssey.html';

  const wantsPost = isValidPostId(postId);
  const wantsRoom = !wantsPost && isValidRoomId(roomId);
  const wantsOdyssey = !wantsPost && !wantsRoom && (
    openTarget === 'odyssey' ||
    (isOdysseyPath && Boolean(vsToken) && targetScore > 0)
  );
  const wantsBlitz = !wantsPost && !wantsRoom && !wantsOdyssey && (openTarget === 'blitz' || openTarget === 'worldblitz' || Boolean(decodeBlitzVsToken(vsToken)));
  const wantsInvite = !wantsPost && !wantsRoom && !wantsOdyssey && !wantsBlitz && (
    url.searchParams.has('ref') ||
    url.searchParams.has('invite') ||
    url.searchParams.has('promo') ||
    url.searchParams.has('city')
  );

  if (!wantsPost && !wantsRoom && !wantsOdyssey && !wantsBlitz && !wantsInvite) {
    return context.next();
  }

  const lang = detectRequestLang(url, request);
  let meta = null;
  let originRes = null;

  if (wantsPost) {
    const toName = sanitizeRecipientName(url.searchParams.get('to') || '');
    const [res, post] = await Promise.all([
      context.next(),
      fetchFirestorePost(postId, { timeoutMs: 2000 })
    ]);
    originRes = res;
    if (post) {
      meta = buildPostOgMeta(post, lang, Date.now(), toName);
    }
  } else if (wantsRoom) {
    const [res, roomDoc] = await Promise.all([
      context.next(),
      fetchFocusRoomDoc(roomId, { timeoutMs: 1600 })
    ]);
    originRes = res;
    meta = buildStudyRoomOgMeta({
      roomId,
      cityId: (url.searchParams.get('tv') || '').trim().toLowerCase(),
      durMin: url.searchParams.get('rd'),
      fx: url.searchParams.get('fx') || '',
      roomDoc
    }, lang);
  } else if (wantsOdyssey) {
    originRes = await context.next();
    meta = buildOdysseyOgMeta({
      vs: vsToken,
      target: targetScore,
      start: (url.searchParams.get('start') || url.searchParams.get('city') || '').trim().toLowerCase(),
      seed: (url.searchParams.get('seed') || '').trim()
    }, lang);
  } else if (wantsBlitz) {
    originRes = await context.next();
    const vsData = decodeBlitzVsToken(vsToken);
    meta = buildBlitzOgMeta(vsData, vsData ? vsToken : '', lang);
  } else if (wantsInvite) {
    originRes = await context.next();
    meta = buildInviteOgMeta({
      ref: url.searchParams.get('ref') || '',
      invite: url.searchParams.get('invite') || '',
      promo: url.searchParams.get('promo') || '',
      city: url.searchParams.get('city') || 'montreal',
      pathname: url.pathname
    }, lang);
  }

  if (!meta || !originRes || !originRes.ok) {
    return originRes;
  }

  const ctype = (originRes.headers.get('content-type') || '').toLowerCase();
  if (!ctype.includes('text/html')) {
    return originRes;
  }

  const origHtml = await originRes.text();
  const nextHtml = injectPostOgIntoHtml(origHtml, meta);

  const headers = new Headers(originRes.headers);
  headers.delete('content-length');
  headers.delete('content-encoding');
  headers.set('content-type', 'text/html; charset=utf-8');
  headers.set('cache-control', 'public, max-age=60, s-maxage=300');

  return new Response(nextHtml, {
    status: originRes.status,
    statusText: originRes.statusText,
    headers
  });
};
