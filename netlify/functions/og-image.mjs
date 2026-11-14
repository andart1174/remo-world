/**
 * Netlify Serverless Function: Dynamic 1200x630 Open Graph PNG Generator
 * Renders crisp anti-aliased social preview cards for Text Cards, City Duels,
 * Guess-My-City challenges, Time Capsules, and decodes inline uploaded photos.
 */
import zlib from 'node:zlib';
import {
  REMO_CITIES_META,
  TEXT_CARD_THEMES_OG,
  TEXT_CARD_BADGE_LABELS,
  getCityMeta,
  getCityDisplayName,
  fetchFirestorePost,
  isPostTimeLocked,
  getTextCardFirstPage,
  truncateClean
} from '../shared/og-meta.mjs';
import { getOgFontAtlas } from './og-font-data.mjs';

const OG_W = 1200;
const OG_H = 630;

// Precompute CRC32 table once per warm instance for fast PNG chunk encoding
const CRC_TABLE = (() => {
  const tbl = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    tbl[n] = c >>> 0;
  }
  return tbl;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const len = data ? data.length : 0;
  const out = Buffer.allocUnsafe(12 + len);
  out.writeUInt32BE(len, 0);
  out.write(type, 4, 4, 'ascii');
  if (len > 0) data.copy(out, 8);
  const crc = crc32(out.subarray(4, 8 + len));
  out.writeUInt32BE(crc, 8 + len);
  return out;
}

export function encodeRgbaToPng(rgba, width, height) {
  const stride = width * 4;
  const raw = Buffer.allocUnsafe((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    const dstOff = y * (stride + 1);
    raw[dstOff] = 0; // Filter type 0 (None)
    rgba.copy(raw, dstOff + 1, y * stride, (y + 1) * stride);
  }
  const compressed = zlib.deflateSync(raw, { level: 4 });
  const ihdr = Buffer.allocUnsafe(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', compressed),
    pngChunk('IEND', Buffer.alloc(0))
  ]);
}

function hexToRgb(hex, fallback = [56, 189, 248]) {
  const clean = String(hex || '').replace('#', '').trim();
  if (clean.length === 3) {
    return [
      parseInt(clean[0] + clean[0], 16) || 0,
      parseInt(clean[1] + clean[1], 16) || 0,
      parseInt(clean[2] + clean[2], 16) || 0
    ];
  }
  if (clean.length === 6) {
    const n = parseInt(clean, 16);
    if (!Number.isNaN(n)) {
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    }
  }
  return fallback;
}

function lerpRgb(c1, c2, t) {
  const u = t < 0 ? 0 : (t > 1 ? 1 : t);
  return [
    Math.round(c1[0] + (c2[0] - c1[0]) * u),
    Math.round(c1[1] + (c2[1] - c1[1]) * u),
    Math.round(c1[2] + (c2[2] - c1[2]) * u)
  ];
}

function mixColors(c1, c2, c3, t) {
  if (t <= 0.52) return lerpRgb(c1, c2, t / 0.52);
  return lerpRgb(c2, c3, (t - 0.52) / 0.48);
}

function fillGradientRect(buf, W, H, x0, y0, w, h, stop0, stop1, stop2) {
  const c0 = hexToRgb(stop0);
  const c1 = hexToRgb(stop1);
  const c2 = hexToRgb(stop2);
  const xEnd = Math.min(W, x0 + w);
  const yEnd = Math.min(H, y0 + h);
  for (let y = Math.max(0, y0); y < yEnd; y++) {
    const ny = (y - y0) / Math.max(1, h);
    for (let x = Math.max(0, x0); x < xEnd; x++) {
      const nx = (x - x0) / Math.max(1, w);
      const t = nx * 0.52 + ny * 0.48;
      const [r, g, b] = mixColors(c0, c1, c2, t);
      const i = (y * W + x) * 4;
      buf[i] = r;
      buf[i + 1] = g;
      buf[i + 2] = b;
      buf[i + 3] = 255;
    }
  }
}

function blendPixel(buf, idx, r, g, b, a01) {
  if (a01 <= 0.002) return;
  const a = a01 > 1 ? 1 : a01;
  const inv = 1 - a;
  buf[idx] = Math.round(buf[idx] * inv + r * a);
  buf[idx + 1] = Math.round(buf[idx + 1] * inv + g * a);
  buf[idx + 2] = Math.round(buf[idx + 2] * inv + b * a);
}

function blendRadialGlow(buf, W, H, cx, cy, radius, rgb, maxAlpha) {
  const [r, g, b] = rgb;
  const r2 = radius * radius;
  const xStart = Math.max(0, Math.floor(cx - radius));
  const xEnd = Math.min(W, Math.ceil(cx + radius));
  const yStart = Math.max(0, Math.floor(cy - radius));
  const yEnd = Math.min(H, Math.ceil(cy + radius));
  for (let y = yStart; y < yEnd; y++) {
    const dy = y - cy;
    const dy2 = dy * dy;
    for (let x = xStart; x < xEnd; x++) {
      const dx = x - cx;
      const d2 = dx * dx + dy2;
      if (d2 >= r2) continue;
      const f = 1 - Math.sqrt(d2) / radius;
      blendPixel(buf, (y * W + x) * 4, r, g, b, f * f * maxAlpha);
    }
  }
}

function drawRoundedBox(buf, W, H, x, y, w, h, radius, fillRgba, strokeRgba = null, strokeW = 2) {
  const r = Math.min(radius, w / 2, h / 2);
  const hw = w / 2;
  const hh = h / 2;
  const cx = x + hw;
  const cy = y + hh;
  const pad = Math.ceil(strokeW) + 2;
  const x0 = Math.max(0, Math.floor(x - pad));
  const x1 = Math.min(W, Math.ceil(x + w + pad));
  const y0 = Math.max(0, Math.floor(y - pad));
  const y1 = Math.min(H, Math.ceil(y + h + pad));

  for (let py = y0; py < y1; py++) {
    const qy = Math.abs(py + 0.5 - cy) - (hh - r);
    for (let px = x0; px < x1; px++) {
      const qx = Math.abs(px + 0.5 - cx) - (hw - r);
      const ax = qx > 0 ? qx : 0;
      const ay = qy > 0 ? qy : 0;
      const dist = Math.sqrt(ax * ax + ay * ay) + Math.min(Math.max(qx, qy), 0) - r;
      const idx = (py * W + px) * 4;
      if (fillRgba && dist < 0.75) {
        const cov = Math.max(0, Math.min(1, 0.5 - dist));
        blendPixel(buf, idx, fillRgba[0], fillRgba[1], fillRgba[2], fillRgba[3] * cov);
      }
      if (strokeRgba) {
        const band = Math.abs(dist) - strokeW * 0.5;
        if (band < 0.75) {
          const cov = Math.max(0, Math.min(1, 0.5 - band));
          blendPixel(buf, idx, strokeRgba[0], strokeRgba[1], strokeRgba[2], strokeRgba[3] * cov);
        }
      }
    }
  }
}

function drawFilledCircle(buf, W, H, cx, cy, r, fillRgba, strokeRgba = null, strokeW = 3) {
  drawRoundedBox(buf, W, H, cx - r, cy - r, r * 2, r * 2, r, fillRgba, strokeRgba, strokeW);
}

/**
 * Strips variation selectors and pictograph emojis outside the embedded font atlas,
 * while normalizing helpful symbols cleanly so zero broken boxes render in PNGs.
 */
function sanitizeTextForAtlas(text, atlasSet) {
  const normalized = String(text || '')
    .replace(/\uFE0F|\u200D/g, '')
    .replace(/\r\n/g, '\n');
  let out = '';
  for (const ch of normalized) {
    const cp = ch.codePointAt(0);
    if (ch === '\n') {
      out += ch;
    } else if (atlasSet.map.has(cp)) {
      out += ch;
    } else if (cp === 0x2018 || cp === 0x2019) {
      out += "'";
    } else if (cp === 0x201C || cp === 0x201D) {
      out += '"';
    } else if (cp >= 0x2600) {
      // Skip color emojis cleanly rather than printing tofu boxes
      out += '';
    }
  }
  return out.replace(/[^\S\n]+/g, ' ').replace(/^ +| +$/gm, '').trim();
}

function measureAtlasText(text, fontSet) {
  let w = 0;
  for (const ch of String(text || '')) {
    const cp = ch.codePointAt(0);
    const g = fontSet.map.get(cp);
    w += g ? g.adv : fontSet.spaceAdv;
  }
  return w;
}

function wrapAtlasLines(text, fontSet, maxWidth, maxLines = 8) {
  const clean = sanitizeTextForAtlas(text, fontSet);
  if (!clean) return [];
  const out = [];

  const pushLongWord = (word) => {
    let chunk = '';
    for (const ch of Array.from(word)) {
      const test = chunk + ch;
      if (chunk && measureAtlasText(test, fontSet) > maxWidth) {
        out.push(chunk);
        chunk = ch;
      } else {
        chunk = test;
      }
    }
    if (chunk) out.push(chunk);
  };

  for (const para of clean.split('\n')) {
    const t = para.trim();
    if (!t) {
      if (out.length > 0 && out[out.length - 1] !== '') out.push('');
      continue;
    }
    let line = '';
    for (const word of t.split(/\s+/)) {
      const candidate = line ? `${line} ${word}` : word;
      if (measureAtlasText(candidate, fontSet) <= maxWidth) {
        line = candidate;
      } else {
        if (line) {
          out.push(line);
          line = '';
        }
        if (measureAtlasText(word, fontSet) <= maxWidth) {
          line = word;
        } else {
          pushLongWord(word);
        }
      }
    }
    if (line) out.push(line);
  }

  while (out.length && out[out.length - 1] === '') out.pop();
  if (out.length > maxLines) {
    const trimmed = out.slice(0, maxLines);
    let last = trimmed[maxLines - 1] || '';
    while (last.length > 1 && measureAtlasText(last + '…', fontSet) > maxWidth) {
      last = last.slice(0, -1).trimEnd();
    }
    trimmed[maxLines - 1] = (last || '').trimEnd() + '…';
    return trimmed;
  }
  return out;
}

function drawAtlasText(buf, W, H, text, x, y, fontSet, rgb, align = 'left', shadowAlpha = 0.42, opacity = 1) {
  const s = String(text || '');
  if (!s) return;
  const totalW = measureAtlasText(s, fontSet);
  let cursorX = align === 'center' ? Math.round(x - totalW / 2) : (align === 'right' ? Math.round(x - totalW) : Math.round(x));
  const [r, g, b] = rgb;

  const drawPass = (dx, dy, colR, colG, colB, alphaScale) => {
    let cx = cursorX;
    for (const ch of s) {
      const cp = ch.codePointAt(0);
      const gl = fontSet.map.get(cp);
      if (!gl) {
        cx += fontSet.spaceAdv;
        continue;
      }
      if (gl.alpha && gl.w > 0 && gl.h > 0) {
        const gx0 = cx + gl.xOff + dx;
        const gy0 = Math.round(y) + gl.yOff + dy;
        for (let py = 0; py < gl.h; py++) {
          const destY = gy0 + py;
          if (destY < 0 || destY >= H) continue;
          const rowOff = py * gl.w;
          for (let px = 0; px < gl.w; px++) {
            const destX = gx0 + px;
            if (destX < 0 || destX >= W) continue;
            const ga = gl.alpha[rowOff + px];
            if (ga < 4) continue;
            blendPixel(buf, (destY * W + destX) * 4, colR, colG, colB, (ga / 255) * alphaScale);
          }
        }
      }
      cx += gl.adv;
    }
  };

  if (shadowAlpha > 0) {
    drawPass(0, 3, 0, 0, 0, shadowAlpha * opacity);
  }
  drawPass(0, 0, r, g, b, opacity);
}

function drawPill(buf, W, H, atlasSm, label, xLeft, yCenter, fillRgba, textRgb, rightEdgeX = null) {
  const clean = sanitizeTextForAtlas(label, atlasSm);
  if (!clean) return;
  const tw = measureAtlasText(clean, atlasSm);
  const padX = 24;
  const pillW = tw + padX * 2;
  const pillH = 44;
  const px = rightEdgeX != null ? (rightEdgeX - pillW) : xLeft;
  const py = Math.round(yCenter - pillH / 2);
  drawRoundedBox(buf, W, H, px, py, pillW, pillH, pillH / 2, fillRgba, [255, 255, 255, 0.24], 1.5);
  drawAtlasText(buf, W, H, clean, px + padX, py + 7, atlasSm, textRgb, 'left', 0.28);
}

function chooseBestFontAndLines(text, atlas, maxWidth, maxHeight) {
  const candidates = [
    { set: atlas.lg, maxLines: Math.max(1, Math.floor(maxHeight / atlas.lg.lineHeight)) },
    { set: atlas.md, maxLines: Math.max(1, Math.floor(maxHeight / atlas.md.lineHeight)) },
    { set: atlas.sm, maxLines: Math.max(1, Math.floor(maxHeight / atlas.sm.lineHeight)) }
  ];
  for (let i = 0; i < candidates.length; i++) {
    const { set, maxLines } = candidates[i];
    const lines = wrapAtlasLines(text, set, maxWidth, 99);
    if (lines.length <= maxLines || i === candidates.length - 1) {
      return {
        fontSet: set,
        lines: lines.length > maxLines ? wrapAtlasLines(text, set, maxWidth, maxLines) : lines
      };
    }
  }
  return { fontSet: atlas.md, lines: [] };
}

export function renderPostOgPngBuffer(post, lang = 'en', nowMs = Date.now()) {
  const atlas = getOgFontAtlas();
  const buf = Buffer.allocUnsafe(OG_W * OG_H * 4);
  const isFr = lang === 'fr';
  const locked = isPostTimeLocked(post, nowMs);
  const mystery = Boolean(post && post.mysteryCity && !post.versus);
  const city = getCityMeta(post && post.cityId);
  const cityName = getCityDisplayName(city, isFr ? 'fr' : 'en');
  const author = (post && post.authorName) ? `@${post.authorName}` : '@REMO Citizen';

  // ── 1. Background & Layout by Post Kind ──
  if (post && post.versus && !locked) {
    const v = post.versus;
    const cA = getCityMeta(v.leftCityId || 'montreal');
    const cB = getCityMeta(v.rightCityId || 'paris');
    const nA = getCityDisplayName(cA, isFr ? 'fr' : 'en').toUpperCase();
    const nB = getCityDisplayName(cB, isFr ? 'fr' : 'en').toUpperCase();
    const lv = Number(v.leftVotes || 0);
    const rv = Number(v.rightVotes || 0);
    const tot = lv + rv;
    const pA = tot > 0 ? Math.round((lv / tot) * 100) : 50;
    const pB = 100 - pA;

    fillGradientRect(buf, OG_W, OG_H, 0, 0, OG_W / 2, OG_H, '#050816', cA.themeColor, '#0b132b');
    fillGradientRect(buf, OG_W, OG_H, OG_W / 2, 0, OG_W / 2, OG_H, '#0b132b', cB.themeColor, '#050816');
    blendRadialGlow(buf, OG_W, OG_H, OG_W / 2, OG_H / 2, 340, [251, 191, 36], 0.20);

    // Inner glass frame & center divider cleanly stopping above vote bar
    drawRoundedBox(buf, OG_W, OG_H, 36, 30, OG_W - 72, OG_H - 60, 30, [5, 8, 22, 0.42], [56, 189, 248, 0.45], 2);
    drawRoundedBox(buf, OG_W, OG_H, OG_W / 2 - 2, 110, 4, 275, 2, [251, 191, 36, 0.90]);
    drawFilledCircle(buf, OG_W, OG_H, OG_W / 2, 248, 44, [5, 8, 22, 0.96], [251, 191, 36, 1], 4);
    drawAtlasText(buf, OG_W, OG_H, 'VS', OG_W / 2, 223, atlas.md, [253, 224, 71], 'center', 0.4);

    // Top badge
    drawPill(
      buf, OG_W, OG_H, atlas.sm,
      isFr ? 'DUEL OFFICIEL DES VILLES' : 'LIVE WORLD CITY DUEL',
      74, 82, [15, 23, 42, 0.72], [253, 224, 71]
    );
    drawPill(buf, OG_W, OG_H, atlas.sm, 'REMOWORLD.COM', 0, 82, [15, 23, 42, 0.72], [56, 189, 248], OG_W - 74);

    // City titles & vote percentages
    drawAtlasText(buf, OG_W, OG_H, truncateClean(nA, 15), 300, 190, atlas.lg, [255, 255, 255], 'center', 0.55);
    drawAtlasText(buf, OG_W, OG_H, `${pA}%`, 300, 275, atlas.lg, [56, 189, 248], 'center', 0.55);

    drawAtlasText(buf, OG_W, OG_H, truncateClean(nB, 15), 900, 190, atlas.lg, [255, 255, 255], 'center', 0.55);
    drawAtlasText(buf, OG_W, OG_H, `${pB}%`, 900, 275, atlas.lg, [244, 63, 94], 'center', 0.55);

    // Vote bar
    const barW = 920;
    const barX = (OG_W - barW) / 2;
    drawRoundedBox(buf, OG_W, OG_H, barX, 410, barW, 20, 10, [244, 63, 94, 0.92]);
    drawRoundedBox(buf, OG_W, OG_H, barX, 410, Math.max(24, Math.round((barW * pA) / 100)), 20, 10, [56, 189, 248, 0.96]);

    const footerCta = isFr ? `QUELLE VILLE GAGNE ? (${tot} VOTES)` : `WHICH CITY WINS? (${tot} VOTES)`;
    drawAtlasText(buf, OG_W, OG_H, footerCta, OG_W / 2, 488, atlas.md, [248, 250, 252], 'center', 0.4);
    drawAtlasText(buf, OG_W, OG_H, '24 CITIES  •  LIVE RADIO  •  4D FOCUS TV', OG_W / 2, 545, atlas.sm, [125, 211, 252], 'center', 0.3);

    return encodeRgbaToPng(buf, OG_W, OG_H);
  }

  // Determine theme & card text for Text Card or Standard / Mystery / Time-Capsule post
  const isTextCard = Boolean(post && post.mediaType === 'text_card' && post.textCard && !locked);
  const themeId = isTextCard ? (post.textCard.theme || 'aurora') : 'aurora';
  const theme = TEXT_CARD_THEMES_OG[themeId] || TEXT_CARD_THEMES_OG.aurora;

  if (!post) {
    fillGradientRect(buf, OG_W, OG_H, 0, 0, OG_W, OG_H, '#050816', '#1e1b4b', '#0f172a');
    blendRadialGlow(buf, OG_W, OG_H, 320, 180, 480, [56, 189, 248], 0.22);
  } else if (isTextCard) {
    if (themeId === 'city' && !mystery) {
      fillGradientRect(buf, OG_W, OG_H, 0, 0, OG_W, OG_H, '#050816', city.themeColor, '#050816');
    } else {
      fillGradientRect(buf, OG_W, OG_H, 0, 0, OG_W, OG_H, theme.stops[0], theme.stops[1], theme.stops[2]);
    }
    blendRadialGlow(buf, OG_W, OG_H, 300, 140, 500, [255, 255, 255], 0.14);
  } else {
    const tint = (mystery || locked) ? '#6366f1' : (city.themeColor || '#38bdf8');
    fillGradientRect(buf, OG_W, OG_H, 0, 0, OG_W, OG_H, '#050816', '#0f172a', '#1e1b4b');
    blendRadialGlow(buf, OG_W, OG_H, 280, 150, 540, hexToRgb(tint), 0.28);
    blendRadialGlow(buf, OG_W, OG_H, 980, 480, 440, [236, 72, 153], 0.14);
  }

  // Glass outer frame
  drawRoundedBox(buf, OG_W, OG_H, 38, 30, OG_W - 76, OG_H - 60, 32, [255, 255, 255, 0.03], [255, 255, 255, 0.22], 2);

  // Top-left & Top-right pills
  let badgeLabel = isFr ? 'REMO WORLD 4D' : 'REMO WORLD 4D';
  let pagePill = 'REMOWORLD.COM';
  let mainText = isFr
    ? 'Ouvrez une fenêtre 4D sur 24 villes du monde, 56 radios live et quiz quotidiens.'
    : 'Open a live 4D city window across 24 world cities, 56 radios & daily blitz trivia.';
  let align = 'center';

  if (locked) {
    badgeLabel = isFr ? 'CAPSULE TEMPORELLE' : 'MYSTERY TIME-CAPSULE';
    const teaser = isFr ? (post.capsuleTeaser_fr || post.capsuleTeaser_en || '') : (post.capsuleTeaser_en || post.capsuleTeaser_fr || '');
    mainText = teaser || (isFr ? 'Surprise mystère bientôt révélée en direct sur REMO !' : 'Mystery drop unsealing live soon on REMO World!');
  } else if (isTextCard) {
    const badgeInfo = TEXT_CARD_BADGE_LABELS[post.textCard.badgeType];
    badgeLabel = badgeInfo ? (isFr ? badgeInfo.fr : badgeInfo.en).toUpperCase() : (isFr ? 'CARTE TEXTE' : 'TEXT CARD');
    const pageCount = Array.isArray(post.textCard.pages) && post.textCard.pages.length ? post.textCard.pages.length : 1;
    if (pageCount > 1) pagePill = `PAGE 1 / ${pageCount}`;
    mainText = getTextCardFirstPage(post) || mainText;
    align = post.textCard.align === 'left' ? 'left' : 'center';
  } else if (post) {
    const cap = isFr ? (post.caption_fr || post.caption_en || '') : (post.caption_en || post.caption_fr || '');
    if (mystery) {
      badgeLabel = isFr ? 'DEVINEZ LA VILLE' : 'GUESS MY CITY';
      mainText = cap || (isFr ? 'Saurez-vous deviner de quelle ville vient ce moment ?' : 'Can you guess which world city this moment comes from?');
    } else if (post.mediaType === 'html_app') {
      badgeLabel = isFr ? 'MINI-APP 4D LIVE' : 'LIVE 4D MINI-APP';
      mainText = cap || `${cityName} Interactive 4D Experience`;
    } else if (post.mediaType === 'video' || post.mediaType === 'video_link') {
      badgeLabel = isFr ? 'VIDÉO EN DIRECT' : 'LIVE CITY VIDEO';
      mainText = cap || `${cityName} • ${author}`;
    } else {
      badgeLabel = isFr ? `EN DIRECT • ${cityName.toUpperCase()}` : `LIVE • ${cityName.toUpperCase()}`;
      mainText = cap || `${cityName} — Live Moment on REMO World`;
    }
  }

  drawPill(buf, OG_W, OG_H, atlas.sm, badgeLabel, 82, 84, [15, 23, 42, 0.58], [253, 230, 138]);
  drawPill(buf, OG_W, OG_H, atlas.sm, pagePill, 0, 84, [15, 23, 42, 0.58], [125, 211, 252], OG_W - 82);

  // Body Text in Safe Middle Zone (Y: 155 .. 485)
  const textMaxW = OG_W - 190;
  const safeTop = 158;
  const safeH = 326;
  const { fontSet, lines } = chooseBestFontAndLines(mainText, atlas, textMaxW, safeH);
  const textColorRgb = hexToRgb(isTextCard ? theme.textColor : '#ffffff', [255, 255, 255]);
  const totalBlockH = lines.length * fontSet.lineHeight;
  const startY = safeTop + Math.max(0, Math.round((safeH - totalBlockH) / 2));
  const textX = align === 'left' ? 95 : OG_W / 2;

  lines.forEach((ln, idx) => {
    if (!ln) return;
    drawAtlasText(buf, OG_W, OG_H, ln, textX, startY + idx * fontSet.lineHeight, fontSet, textColorRgb, align, 0.46);
  });

  // Bottom signature row (Y: 530)
  const locFooter = mystery
    ? (isFr ? 'Devinez la Ville' : 'Guess This City')
    : (post ? cityName : (isFr ? '24 Villes du Monde' : '24 World Cities'));
  const accentRgb = hexToRgb(isTextCard ? theme.accent : '#38bdf8', [56, 189, 248]);

  drawAtlasText(buf, OG_W, OG_H, locFooter, 84, 526, atlas.sm, [226, 232, 240], 'left', 0.35);
  const rightSign = post ? `${truncateClean(author, 26)}  •  REMOWORLD.COM` : 'REMOWORLD.COM';
  drawAtlasText(buf, OG_W, OG_H, rightSign, OG_W - 84, 526, atlas.sm, accentRgb, 'right', 0.35);

  return encodeRgbaToPng(buf, OG_W, OG_H);
}

export const handler = async (event, _context, deps = {}) => {
  const params = (event && event.queryStringParameters) || {};
  const postId = String(params.post || '').trim();
  const lang = String(params.lang || '').toLowerCase() === 'fr' ? 'fr' : 'en';
  const fetcher = deps.fetchPost || ((id) => fetchFirestorePost(id, { timeoutMs: 2500 }));

  const post = postId ? await fetcher(postId) : null;
  const locked = isPostTimeLocked(post);

  // If post is a direct inline base64 photo (and not locked/text_card), serve exact image binary
  if (
    post &&
    !locked &&
    ['image', 'carousel', 'before_after'].includes(post.mediaType) &&
    typeof post.mediaUrl === 'string' &&
    post.mediaUrl.startsWith('data:image/')
  ) {
    const match = /^data:(image\/(?:jpeg|jpg|png|webp));base64,([A-Za-z0-9+/=]+)$/i.exec(post.mediaUrl);
    if (match && match[2].length < 4500000) {
      const mime = match[1].toLowerCase() === 'image/jpg' ? 'image/jpeg' : match[1].toLowerCase();
      return {
        statusCode: 200,
        headers: {
          'Content-Type': mime,
          'Cache-Control': 'public, max-age=300, s-maxage=900',
          'Access-Control-Allow-Origin': '*'
        },
        body: match[2],
        isBase64Encoded: true
      };
    }
  }

  const pngBuf = renderPostOgPngBuffer(post, lang);
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=180, s-maxage=600',
      'Access-Control-Allow-Origin': '*'
    },
    body: pngBuf.toString('base64'),
    isBase64Encoded: true
  };
};
