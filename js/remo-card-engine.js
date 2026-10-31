/* ════════════════════════════════════════════════════════════════════
   🎴 REMO — 300 DPI World City Collectible Card Engine v1.0
   750 × 1050 px (63.5 × 88.9 mm) · 6 Spatial 4D Themes · Offline QR
   Front & Back Rendering · 9:16 Story · A4 Certificate · Duplex Print
   Strictly Bilingual: English (EN) & French (FR) ONLY
   ════════════════════════════════════════════════════════════════════ */

const CARD_W = 750;
const CARD_H = 1050;

const REMO_CARD_THEMES = [
  { id: 0, name_en: 'Prism Crystal 4D',      name_fr: 'Cristal Prisme 4D',     bg1: '#07091c', bg2: '#1a103d', accent: '#fbbf24' },
  { id: 1, name_en: 'Aurora Borealis 4D',    name_fr: 'Aurore Boréale 4D',     bg1: '#04121f', bg2: '#0b2b3c', accent: '#2dd4bf' },
  { id: 2, name_en: 'Cyber Matrix Neon',     name_fr: 'Matrice Cyber Néon',    bg1: '#030d0a', bg2: '#07241c', accent: '#10b981' },
  { id: 3, name_en: 'Deep Space Supernova',  name_fr: 'Supernova Cosmique',    bg1: '#12061c', bg2: '#2d0c2e', accent: '#f43f5e' },
  { id: 4, name_en: 'Liquid Chrome 4D',      name_fr: 'Chrome Liquide 4D',     bg1: '#0b1120', bg2: '#1e293b', accent: '#38bdf8' },
  { id: 5, name_en: 'Quantum Tunnel 3D',     name_fr: 'Tunnel Quantique 3D',   bg1: '#09061f', bg2: '#1e1b4b', accent: '#a855f7' }
];

/* ── 1. Multi-Version Offline Scannable QR Code Engine (Up to Type 10) ── */
const RemoQREngine = (function () {
  function QR8bitByte(data) {
    this.mode = 4;
    this.bytes = [];
    for (let i = 0; i < data.length; i++) {
      const code = data.charCodeAt(i);
      if (code < 0x80) this.bytes.push(code);
      else if (code < 0x800) this.bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
      else this.bytes.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
    }
  }
  QR8bitByte.prototype = {
    getLength() { return this.bytes.length; },
    write(buf) { for (let i = 0; i < this.bytes.length; i++) buf.put(this.bytes[i], 8); }
  };

  const EXP = new Array(256), LOG = new Array(256);
  for (let i = 0; i < 8; i++) EXP[i] = 1 << i;
  for (let i = 8; i < 256; i++) EXP[i] = EXP[i - 4] ^ EXP[i - 5] ^ EXP[i - 6] ^ EXP[i - 8];
  for (let i = 0; i < 255; i++) LOG[EXP[i]] = i;
  const glog = (n) => LOG[n];
  const gexp = (n) => { while (n < 0) n += 255; while (n >= 256) n -= 255; return EXP[n]; };

  function QRPoly(num, shift) {
    let off = 0;
    while (off < num.length && num[off] === 0) off++;
    this.num = new Array(num.length - off + shift);
    for (let i = 0; i < num.length - off; i++) this.num[i] = num[i + off];
  }
  QRPoly.prototype = {
    get(i) { return this.num[i]; },
    len() { return this.num.length; },
    multiply(e) {
      const n = new Array(this.len() + e.len() - 1).fill(0);
      for (let i = 0; i < this.len(); i++)
        for (let j = 0; j < e.len(); j++)
          n[i + j] ^= gexp(glog(this.get(i)) + glog(e.get(j)));
      return new QRPoly(n, 0);
    },
    mod(e) {
      if (this.len() - e.len() < 0) return this;
      const ratio = glog(this.get(0)) - glog(e.get(0));
      const n = this.num.slice();
      for (let i = 0; i < e.len(); i++) n[i] ^= gexp(glog(e.get(i)) + ratio);
      return new QRPoly(n, 0).mod(e);
    }
  };

  // Level L (errorCorrectLevel = 1) capacities for versions 1..10: [count, totalCodewords, dataCodewords]
  const RS_L_TABLE = [
    null,
    [[1, 26, 19]],
    [[1, 44, 34]],
    [[1, 70, 55]],
    [[1, 100, 80]],
    [[1, 134, 108]],
    [[2, 86, 68]],
    [[2, 98, 78]],
    [[2, 121, 97]],
    [[2, 146, 116]],
    [[2, 86, 68], [2, 87, 69]]
  ];
  const ALIGN_POS = [
    [], [], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34],
    [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50]
  ];

  function getBCHDigit(d) { let n = 0; while (d !== 0) { n++; d >>>= 1; } return n; }
  function getBCHTypeInfo(data) {
    const G15 = 0x537, MASK = 0x5412;
    let d = data << 10;
    while (getBCHDigit(d) - getBCHDigit(G15) >= 0) d ^= (G15 << (getBCHDigit(d) - getBCHDigit(G15)));
    return ((data << 10) | d) ^ MASK;
  }
  function getBCHTypeNumber(data) {
    const G18 = 0x1f25;
    let d = data << 12;
    while (getBCHDigit(d) - getBCHDigit(G18) >= 0) d ^= (G18 << (getBCHDigit(d) - getBCHDigit(G18)));
    return (data << 12) | d;
  }

  function BitBuf() { this.buffer = []; this.length = 0; }
  BitBuf.prototype = {
    put(num, len) { for (let i = 0; i < len; i++) this.putBit(((num >>> (len - i - 1)) & 1) === 1); },
    putBit(bit) {
      const idx = Math.floor(this.length / 8);
      if (this.buffer.length <= idx) this.buffer.push(0);
      if (bit) this.buffer[idx] |= (0x80 >>> (this.length % 8));
      this.length++;
    }
  };

  function pickTypeNumber(byteLen) {
    const caps = [0, 17, 32, 53, 78, 106, 134, 154, 192, 230, 271];
    for (let v = 2; v <= 10; v++) {
      if (byteLen <= caps[v]) return v;
    }
    return 10;
  }

  function buildMatrix(text) {
    const seg = new QR8bitByte(text);
    const ver = pickTypeNumber(seg.getLength());
    const count = ver * 4 + 17;
    const mods = Array.from({ length: count }, () => new Array(count).fill(null));

    const probe = (r, c) => {
      for (let row = -1; row <= 7; row++) {
        if (r + row < 0 || r + row >= count) continue;
        for (let col = -1; col <= 7; col++) {
          if (c + col < 0 || c + col >= count) continue;
          mods[r + row][c + col] =
            (row >= 0 && row <= 6 && (col === 0 || col === 6)) ||
            (col >= 0 && col <= 6 && (row === 0 || row === 6)) ||
            (row >= 2 && row <= 4 && col >= 2 && col <= 4);
        }
      }
    };
    probe(0, 0); probe(count - 7, 0); probe(0, count - 7);

    const pos = ALIGN_POS[ver] || [];
    for (let i = 0; i < pos.length; i++) {
      for (let j = 0; j < pos.length; j++) {
        const r = pos[i], c = pos[j];
        if (mods[r][c] !== null) continue;
        for (let dr = -2; dr <= 2; dr++)
          for (let dc = -2; dc <= 2; dc++)
            mods[r + dr][c + dc] = (Math.abs(dr) === 2 || Math.abs(dc) === 2 || (dr === 0 && dc === 0));
      }
    }

    for (let i = 8; i < count - 8; i++) {
      if (mods[i][6] === null) mods[i][6] = (i % 2 === 0);
      if (mods[6][i] === null) mods[6][i] = (i % 2 === 0);
    }

    const maskPattern = 2;
    const typeBits = getBCHTypeInfo((1 << 3) | maskPattern);
    for (let i = 0; i < 15; i++) {
      const bit = ((typeBits >> i) & 1) === 1;
      if (i < 6) mods[i][8] = bit;
      else if (i < 8) mods[i + 1][8] = bit;
      else mods[count - 15 + i][8] = bit;

      if (i < 8) mods[8][count - i - 1] = bit;
      else if (i < 9) mods[8][15 - i] = bit;
      else mods[8][14 - i] = bit;
    }
    mods[count - 8][8] = true;

    if (ver >= 7) {
      const vBits = getBCHTypeNumber(ver);
      for (let i = 0; i < 18; i++) {
        const bit = ((vBits >> i) & 1) === 1;
        mods[Math.floor(i / 3)][(i % 3) + count - 11] = bit;
        mods[(i % 3) + count - 11][Math.floor(i / 3)] = bit;
      }
    }

    // Encode RS blocks
    const blockDefs = RS_L_TABLE[ver];
    const rsBlocks = [];
    blockDefs.forEach(([cnt, tot, dat]) => {
      for (let k = 0; k < cnt; k++) rsBlocks.push({ totalCount: tot, dataCount: dat });
    });
    const totalData = rsBlocks.reduce((s, b) => s + b.dataCount, 0);
    const buf = new BitBuf();
    buf.put(4, 4);
    buf.put(seg.getLength(), ver < 10 ? 8 : 16);
    seg.write(buf);
    if (buf.length + 4 <= totalData * 8) buf.put(0, 4);
    while (buf.length % 8 !== 0) buf.putBit(false);
    while (buf.length < totalData * 8) {
      buf.put(0xec, 8);
      if (buf.length >= totalData * 8) break;
      buf.put(0x11, 8);
    }

    let offset = 0, maxDc = 0, maxEc = 0;
    const dcdata = [], ecdata = [];
    rsBlocks.forEach((b, r) => {
      const dc = b.dataCount, ec = b.totalCount - dc;
      maxDc = Math.max(maxDc, dc); maxEc = Math.max(maxEc, ec);
      dcdata[r] = buf.buffer.slice(offset, offset + dc);
      offset += dc;
      let rsPoly = new QRPoly([1], 0);
      for (let i = 0; i < ec; i++) rsPoly = rsPoly.multiply(new QRPoly([1, gexp(i)], 0));
      const modPoly = new QRPoly(dcdata[r], rsPoly.len() - 1).mod(rsPoly);
      ecdata[r] = new Array(ec);
      for (let i = 0; i < ec; i++) {
        const mi = i + modPoly.len() - ec;
        ecdata[r][i] = mi >= 0 ? modPoly.get(mi) : 0;
      }
    });

    const dataBytes = [];
    for (let i = 0; i < maxDc; i++)
      for (let r = 0; r < rsBlocks.length; r++)
        if (i < dcdata[r].length) dataBytes.push(dcdata[r][i]);
    for (let i = 0; i < maxEc; i++)
      for (let r = 0; r < rsBlocks.length; r++)
        if (i < ecdata[r].length) dataBytes.push(ecdata[r][i]);

    let inc = -1, row = count - 1, bitIdx = 7, byteIdx = 0;
    for (let col = count - 1; col > 0; col -= 2) {
      if (col === 6) col--;
      while (true) {
        for (let c = 0; c < 2; c++) {
          if (mods[row][col - c] === null) {
            let dark = byteIdx < dataBytes.length ? (((dataBytes[byteIdx] >>> bitIdx) & 1) === 1) : false;
            if ((col - c) % 3 === 0) dark = !dark; // maskPattern 2
            mods[row][col - c] = dark;
            bitIdx--;
            if (bitIdx === -1) { byteIdx++; bitIdx = 7; }
          }
        }
        row += inc;
        if (row < 0 || row >= count) { row -= inc; inc = -inc; break; }
      }
    }
    return { mods, count };
  }

  return {
    toCanvas(text, size = 180) {
      const cv = document.createElement('canvas');
      cv.width = size; cv.height = size;
      const ctx = cv.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);
      try {
        const { mods, count } = buildMatrix(String(text || 'https://remo.world').slice(0, 220));
        const quiet = 2;
        const cell = size / (count + quiet * 2);
        ctx.fillStyle = '#050814';
        for (let r = 0; r < count; r++) {
          for (let c = 0; c < count; c++) {
            if (mods[r][c]) {
              ctx.fillRect(
                Math.floor((c + quiet) * cell),
                Math.floor((r + quiet) * cell),
                Math.ceil(cell),
                Math.ceil(cell)
              );
            }
          }
        }
      } catch (e) {
        ctx.strokeStyle = '#050814';
        ctx.lineWidth = 4;
        ctx.strokeRect(12, 12, size - 24, size - 24);
      }
      return cv;
    }
  };
})();

/* ── 2. Canvas Drawing Helpers & 4D Spatial Backgrounds ── */
function remoRoundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function remoFitText(ctx, text, x, y, maxW, startPx, weight, family, color, align = 'center') {
  let sz = startPx;
  ctx.textAlign = align;
  ctx.fillStyle = color;
  ctx.font = `${weight} ${sz}px ${family}`;
  while (ctx.measureText(text).width > maxW && sz > 11) {
    sz -= 1;
    ctx.font = `${weight} ${sz}px ${family}`;
  }
  ctx.fillText(text, x, y);
}

function remoWrapText(ctx, text, x, y, maxW, lineH, maxLines = 4) {
  const words = String(text || '').split(' ');
  let line = '', curY = y, lines = 0;
  for (let i = 0; i < words.length; i++) {
    const test = line + words[i] + ' ';
    if (ctx.measureText(test).width > maxW && i > 0) {
      ctx.fillText(line.trim(), x, curY);
      line = words[i] + ' ';
      curY += lineH;
      lines++;
      if (lines >= maxLines - 1) break;
    } else {
      line = test;
    }
  }
  if (line.trim()) ctx.fillText(line.trim(), x, curY);
}

function remoPseudoSHA256(seedStr) {
  let h1 = 0x811c9dc5, h2 = 0x01000193, h3 = 0x9e3779b9, h4 = 0x85ebca6b;
  for (let i = 0; i < seedStr.length; i++) {
    const c = seedStr.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 16777619);
    h2 = Math.imul(h2 ^ (c << 1), 2246822519);
    h3 = Math.imul(h3 ^ (c + i), 3266489917);
    h4 = Math.imul(h4 ^ c, 668265263);
  }
  return [h1, h2, h3, h4].map((x) => (x >>> 0).toString(16).padStart(8, '0')).join('').toUpperCase();
}

function draw4DThemeBackdrop(ctx, themeId, cityColor) {
  const th = REMO_CARD_THEMES[themeId] || REMO_CARD_THEMES[0];
  const grad = ctx.createLinearGradient(0, 0, CARD_W, CARD_H);
  grad.addColorStop(0, th.bg1);
  grad.addColorStop(0.5, th.bg2);
  grad.addColorStop(1, '#040610');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  ctx.save();
  const accent = cityColor || th.accent;

  if (themeId === 0) {
    // Prism Crystal 4D facets
    for (let i = 0; i < 14; i++) {
      ctx.fillStyle = i % 2 === 0 ? accent + '12' : '#ffffff08';
      ctx.beginPath();
      ctx.moveTo((i * 97) % CARD_W, (i * 151) % CARD_H);
      ctx.lineTo(((i + 2) * 140) % CARD_W, ((i + 1) * 210) % CARD_H);
      ctx.lineTo(((i + 4) * 85) % CARD_W, ((i + 3) * 180) % CARD_H);
      ctx.closePath();
      ctx.fill();
    }
  } else if (themeId === 1) {
    // Aurora Borealis 4D ribbons
    for (let band = 0; band < 4; band++) {
      const ag = ctx.createLinearGradient(0, 120 + band * 180, CARD_W, 280 + band * 180);
      ag.addColorStop(0, 'transparent');
      ag.addColorStop(0.5, band % 2 === 0 ? accent + '26' : '#2dd4bf22');
      ag.addColorStop(1, 'transparent');
      ctx.fillStyle = ag;
      ctx.beginPath();
      ctx.moveTo(0, 150 + band * 180);
      ctx.bezierCurveTo(CARD_W * 0.35, 60 + band * 180, CARD_W * 0.65, 260 + band * 180, CARD_W, 140 + band * 180);
      ctx.lineTo(CARD_W, 260 + band * 180);
      ctx.lineTo(0, 260 + band * 180);
      ctx.closePath();
      ctx.fill();
    }
  } else if (themeId === 2) {
    // Cyber Matrix Neon streams
    ctx.strokeStyle = accent + '24';
    ctx.lineWidth = 2;
    for (let x = 35; x < CARD_W; x += 38) {
      const len = 140 + ((x * 17) % 420);
      const y0 = (x * 29) % (CARD_H - len);
      ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y0 + len); ctx.stroke();
    }
  } else if (themeId === 3) {
    // Deep Space Supernova
    const rg = ctx.createRadialGradient(CARD_W / 2, CARD_H * 0.38, 10, CARD_W / 2, CARD_H * 0.38, 420);
    rg.addColorStop(0, accent + '36');
    rg.addColorStop(0.5, '#f59e0b18');
    rg.addColorStop(1, 'transparent');
    ctx.fillStyle = rg;
    ctx.fillRect(0, 0, CARD_W, CARD_H);
  } else if (themeId === 4) {
    // Liquid Chrome 4D metallic waves
    ctx.strokeStyle = '#e2e8f020';
    ctx.lineWidth = 3;
    for (let y = 60; y < CARD_H; y += 34) {
      ctx.beginPath();
      for (let x = 0; x <= CARD_W; x += 25) {
        const wy = y + Math.sin(x * 0.018 + y * 0.02) * 14;
        x === 0 ? ctx.moveTo(x, wy) : ctx.lineTo(x, wy);
      }
      ctx.stroke();
    }
  } else {
    // Quantum Tunnel 3D perspective rings
    ctx.strokeStyle = accent + '26';
    ctx.lineWidth = 1.8;
    for (let r = 60; r <= 480; r += 46) {
      ctx.beginPath();
      ctx.arc(CARD_W / 2, CARD_H * 0.42, r, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawSecurityGuilloche(ctx, color) {
  ctx.save();
  ctx.strokeStyle = (color || '#6366f1') + '14';
  ctx.lineWidth = 1;
  const cx = CARD_W / 2, cy = CARD_H / 2;
  for (let r = 40; r < 480; r += 22) {
    ctx.beginPath();
    for (let a = 0; a <= Math.PI * 2; a += 0.06) {
      const rad = r + Math.sin(a * 8) * 11 + Math.cos(a * 12) * 5;
      const px = cx + Math.cos(a) * rad, py = cy + Math.sin(a) * rad;
      a === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();
  }
  ctx.restore();
}

function drawMicrotextBorder(ctx, cityCode) {
  ctx.save();
  const txt = `REMO OFFICIAL WORLD CITY COLLECTIBLE • ${cityCode} AUTHENTIC • `;
  ctx.font = 'bold 7.5px monospace';
  ctx.fillStyle = 'rgba(255,255,255,0.42)';
  let x = 28;
  while (x < CARD_W - 40) {
    ctx.fillText(txt, x, 20);
    ctx.fillText(txt, x, CARD_H - 12);
    x += ctx.measureText(txt).width;
  }
  ctx.restore();
}

function drawNFCGoldChip(ctx) {
  ctx.save();
  const x = CARD_W - 106, y = 92, w = 54, h = 42;
  const g = ctx.createLinearGradient(x, y, x + w, y + h);
  g.addColorStop(0, '#fef08a');
  g.addColorStop(0.5, '#f59e0b');
  g.addColorStop(1, '#78350f');
  ctx.fillStyle = g;
  remoRoundRect(ctx, x, y, w, h, 8);
  ctx.fill();
  ctx.strokeStyle = '#ffffffcc';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(0,0,0,0.55)';
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y); ctx.lineTo(x + w / 2, y + h);
  ctx.moveTo(x, y + h / 2); ctx.lineTo(x + w, y + h / 2);
  ctx.stroke();
  // Contactless arcs
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 2;
  for (let r = 7; r <= 15; r += 4) {
    ctx.beginPath();
    ctx.arc(x - 12, y + h / 2, r, -Math.PI / 3, Math.PI / 3);
    ctx.stroke();
  }
  ctx.restore();
}

function getRemoBaseUrl(spec = {}) {
  const custom = spec.qrBaseUrl || localStorage.getItem('remo_custom_domain');
  if (custom && custom.trim()) return custom.trim().replace(/\/$/, '');
  if (window.location.origin && window.location.origin !== 'null' && window.location.protocol.startsWith('http')) {
    return window.location.origin.replace(/\/$/, '');
  }
  return 'https://remo.world';
}

function getRarityColor(rarity) {
  const r = String(rarity || '').toLowerCase();
  if (r.includes('founder') || r.includes('1-of-1')) return '#f43f5e';
  if (r.includes('mythic')) return '#fbbf24';
  if (r.includes('legendary')) return '#f59e0b';
  if (r.includes('epic')) return '#a855f7';
  if (r.includes('rare')) return '#38bdf8';
  return '#94a3b8';
}

/* ── 3. FRONT CARD RENDERER (750 × 1050 px @ 300 DPI) ── */
function renderCityCardFront(canvas, spec = {}, langOverride) {
  if (!canvas) return;
  if (spec.customPhotoDataUrl && !spec._loadedPhotoImg && !spec._loadingPhoto) {
    spec._loadingPhoto = true;
    const loadImgFromSrc = (srcUrl) => {
      if (!srcUrl) { spec._loadingPhoto = false; return; }
      const im = new Image();
      im.onload = () => {
        spec._loadedPhotoImg = im;
        spec._loadingPhoto = false;
        renderCityCardFront(canvas, spec, langOverride);
      };
      im.onerror = () => {
        spec._loadingPhoto = false;
        spec._photoFailed = true;
        renderCityCardFront(canvas, spec, langOverride);
      };
      im.src = srcUrl;
    };
    if (String(spec.customPhotoDataUrl).startsWith('idb://') && window.RemoMediaDB) {
      window.RemoMediaDB.getObjectUrl(spec.customPhotoDataUrl).then(loadImgFromSrc);
    } else {
      loadImgFromSrc(spec.customPhotoDataUrl);
    }
  }
  canvas.width = CARD_W;
  canvas.height = CARD_H;
  const ctx = canvas.getContext('2d');
  const lang = langOverride || (window.REMO_I18N ? window.REMO_I18N.getLang() : 'en');

  const city = getCityById(spec.cityId || 'montreal');
  const sec = spec.security || {
    guilloche: true, microtext: true, nfcChip: true,
    psaSlab: false, goldStamp: true, founderSig: false, redLensSecret: ''
  };
  const rarity = spec.rarity || city.rarity || 'Legendary Gold';
  const rarColor = getRarityColor(rarity);
  const themeId = spec.themeId !== undefined ? Number(spec.themeId) : (city.themeId || 0);
  const accent = spec.themeColor || city.themeColor || '#6366f1';
  const serial = String(spec.serial || '0001').padStart(4, '0');
  const maxSupply = spec.maxSupply || 1000;
  const fullSerial = `REMO-${city.code}-${serial}`;
  const stats = spec.stats || city.stats || { culture: 90, nightlife: 90, tech: 90, gastronomy: 90 };
  const pvp = computeCityPvPStats({ ...city, stats }, rarity, !!spec.verifiedGps);
  const elem = REMO_ELEMENTS[pvp.element] || REMO_ELEMENTS.neon;

  // 1. 4D Spatial Backdrop + Security Layers
  draw4DThemeBackdrop(ctx, themeId, accent);
  if (sec.guilloche) drawSecurityGuilloche(ctx, accent);
  if (sec.microtext) drawMicrotextBorder(ctx, fullSerial);

  // Outer Holographic Double Frame
  ctx.save();
  ctx.strokeStyle = rarColor;
  ctx.lineWidth = 8;
  ctx.shadowColor = rarColor;
  ctx.shadowBlur = 18;
  remoRoundRect(ctx, 24, 26, CARD_W - 48, CARD_H - 52, 26);
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = accent + 'aa';
  ctx.lineWidth = 2;
  remoRoundRect(ctx, 34, 36, CARD_W - 68, CARD_H - 72, 20);
  ctx.stroke();
  ctx.restore();

  let topOffset = 0;
  if (sec.psaSlab) {
    // REMO 10 GEM MINT Slab Header
    ctx.save();
    ctx.fillStyle = '#0f172a';
    remoRoundRect(ctx, 38, 40, CARD_W - 76, 62, 12);
    ctx.fill();
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.font = '900 18px "Orbitron", sans-serif';
    ctx.fillStyle = '#fbbf24';
    ctx.textAlign = 'left';
    ctx.fillText('REMO GRADING', 56, 66);
    ctx.font = 'bold 13px "Outfit", sans-serif';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText(`CERT ${fullSerial} · WORLD CITIES`, 56, 88);
    ctx.fillStyle = '#dc2626';
    remoRoundRect(ctx, CARD_W - 196, 48, 144, 46, 8);
    ctx.fill();
    ctx.font = '900 17px "Orbitron", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('GEM MINT 10', CARD_W - 124, 77);
    ctx.restore();
    topOffset = 54;
  }

  // 2. Top Brand & Rarity Strip
  const hdrY = 74 + topOffset;
  ctx.save();
  ctx.font = '900 22px "Orbitron", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.fillText('🌐 REMO', 54, hdrY);

  // Rarity Pill
  ctx.fillStyle = rarColor + '28';
  ctx.strokeStyle = rarColor;
  ctx.lineWidth = 2;
  remoRoundRect(ctx, 200, hdrY - 22, 230, 30, 15);
  ctx.fill(); ctx.stroke();
  ctx.font = '900 13px "Orbitron", sans-serif';
  ctx.fillStyle = rarColor;
  ctx.textAlign = 'center';
  ctx.fillText(`✦ ${rarity.toUpperCase()} ✦`, 315, hdrY - 2);

  // Element Badge
  const elemName = lang === 'fr' ? elem.name_fr : elem.name_en;
  ctx.fillStyle = elem.color + '26';
  ctx.strokeStyle = elem.color;
  remoRoundRect(ctx, 444, hdrY - 22, 136, 30, 15);
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.font = '800 13px "Outfit", sans-serif';
  ctx.fillText(`${elem.icon} ${elemName.toUpperCase()}`, 512, hdrY - 2);
  ctx.restore();

  if (sec.nfcChip) drawNFCGoldChip(ctx);

  // 3. Central City Artwork Window
  const artX = 56, artY = 104 + topOffset, artW = CARD_W - 112, artH = 385 - (topOffset ? 32 : 0);
  ctx.save();
  remoRoundRect(ctx, artX, artY, artW, artH, 20);
  ctx.fillStyle = '#050814';
  ctx.fill();
  ctx.clip();

  let photoRendered = false;
  const hasValidPhoto = Boolean(
    spec._loadedPhotoImg &&
    spec._loadedPhotoImg.width > 0 &&
    spec._loadedPhotoImg.height > 0 &&
    !spec._photoFailed
  );

  if (hasValidPhoto) {
    try {
      // Draw custom uploaded or post photo with cover fit
      const img = spec._loadedPhotoImg;
      const scale = Math.max(artW / img.width, artH / img.height);
      const dw = img.width * scale, dh = img.height * scale;
      if (isFinite(dw) && isFinite(dh) && dw > 0 && dh > 0) {
        ctx.drawImage(img, artX + (artW - dw) / 2, artY + (artH - dh) / 2, dw, dh);
        const vig = ctx.createLinearGradient(0, artY + artH * 0.55, 0, artY + artH);
        vig.addColorStop(0, 'transparent');
        vig.addColorStop(1, 'rgba(4,6,16,0.88)');
        ctx.fillStyle = vig;
        ctx.fillRect(artX, artY, artW, artH);
        photoRendered = true;
      }
    } catch (e) {
      photoRendered = false;
    }
  }

  if (!photoRendered) {
    // Starfield + Cyber Grid + Pure-Canvas City Vector Landmark
    const sky = ctx.createLinearGradient(0, artY, 0, artY + artH);
    sky.addColorStop(0, '#050818');
    sky.addColorStop(0.7, accent + '24');
    sky.addColorStop(1, '#070b19');
    ctx.fillStyle = sky;
    ctx.fillRect(artX, artY, artW, artH);

    for (let s = 0; s < 28; s++) {
      const sx = artX + ((s * 73 + 19) % artW);
      const sy = artY + ((s * 47 + 13) % (artH * 0.65));
      ctx.fillStyle = s % 4 === 0 ? '#fde047' : '#ffffffaa';
      ctx.beginPath(); ctx.arc(sx, sy, (s % 3) * 0.8 + 0.8, 0, Math.PI * 2); ctx.fill();
    }
    drawCityLandmark(ctx, city.id, accent, CARD_W / 2, artY + artH * 0.52, Math.min(artW, artH) * 0.40);
  }

  // GPS Coordinates Pill inside artwork bottom
  const latStr = `${Math.abs(city.lat).toFixed(4)}° ${city.lat >= 0 ? 'N' : 'S'}`;
  const lngStr = `${Math.abs(city.lng).toFixed(4)}° ${city.lng >= 0 ? 'E' : 'W'}`;
  ctx.fillStyle = 'rgba(5, 8, 20, 0.82)';
  remoRoundRect(ctx, artX + 16, artY + artH - 42, 260, 28, 14);
  ctx.fill();
  ctx.font = 'bold 12px monospace';
  ctx.fillStyle = '#38bdf8';
  ctx.textAlign = 'left';
  ctx.fillText(`🧭 ${latStr} · ${lngStr}`, artX + 30, artY + artH - 24);

  // City Code Pill bottom-right of artwork
  ctx.fillStyle = 'rgba(5, 8, 20, 0.86)';
  remoRoundRect(ctx, artX + artW - 134, artY + artH - 42, 118, 28, 14);
  ctx.fill();
  ctx.font = '900 13px "Orbitron", sans-serif';
  ctx.fillStyle = '#fbbf24';
  ctx.textAlign = 'center';
  ctx.fillText(`${city.flag} ${city.code}`, artX + artW - 75, artY + artH - 23);

  ctx.restore();

  // Artwork Frame Border
  ctx.save();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2.5;
  remoRoundRect(ctx, artX, artY, artW, artH, 20);
  ctx.stroke();
  ctx.restore();

  // Optional Verified Local GPS Stamp
  if (spec.verifiedGps) {
    ctx.save();
    ctx.translate(CARD_W - 145, artY + 56);
    ctx.rotate(0.14);
    ctx.fillStyle = 'rgba(16, 185, 129, 0.92)';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    remoRoundRect(ctx, -95, -20, 190, 40, 20);
    ctx.fill(); ctx.stroke();
    ctx.font = '900 12px "Orbitron", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(lang === 'fr' ? '📍 GPS LOCAL VÉRIFIÉ' : '📍 VERIFIED GPS LOCAL', 0, 5);
    ctx.restore();
  }

  // 4. City Title, Country & Subtitle
  const titleY = artY + artH + 54;
  const displayTitle = (spec.title && spec.title.trim()) || getCityName(city, lang).toUpperCase();
  const countryStr = getCityCountry(city, lang).toUpperCase();
  const subStr = (spec.subtitle && spec.subtitle.trim()) ||
    (lang === 'fr' ? REMO_DICT.fr.card_edition_default : REMO_DICT.en.card_edition_default);

  ctx.save();
  ctx.shadowColor = accent;
  ctx.shadowBlur = 18;
  remoFitText(ctx, `${city.flag} ${displayTitle}`, CARD_W / 2, titleY, CARD_W - 120, 44, '900', '"Orbitron", sans-serif', '#ffffff');
  ctx.shadowBlur = 0;

  ctx.font = '800 16px "Outfit", sans-serif';
  ctx.fillStyle = rarColor;
  ctx.textAlign = 'center';
  ctx.fillText(`${countryStr}  ·  ${subStr}`, CARD_W / 2, titleY + 28);

  remoFitText(ctx, getCityTagline(city, lang), CARD_W / 2, titleY + 54, CARD_W - 130, 15, '600', '"Outfit", sans-serif', '#cbd5e1');
  ctx.restore();

  // 5. 4 City Vibe Stat Bars
  const barsY = titleY + 78;
  const statItems = [
    { label: lang === 'fr' ? 'CULTURE' : 'CULTURE', val: stats.culture, col: '#fbbf24' },
    { label: lang === 'fr' ? 'NUIT' : 'NIGHTLIFE',  val: stats.nightlife, col: '#ec4899' },
    { label: lang === 'fr' ? 'TECH & IA' : 'TECH & AI', val: stats.tech, col: '#38bdf8' },
    { label: lang === 'fr' ? 'GASTRO' : 'GASTRONOMY', val: stats.gastronomy, col: '#10b981' }
  ];
  const colW = (CARD_W - 136) / 2;
  statItems.forEach((st, i) => {
    const cIdx = i % 2, rIdx = Math.floor(i / 2);
    const bx = 56 + cIdx * (colW + 24);
    const by = barsY + rIdx * 48;

    ctx.font = '800 12px "Orbitron", sans-serif';
    ctx.fillStyle = '#e2e8f0';
    ctx.textAlign = 'left';
    ctx.fillText(st.label, bx, by);
    ctx.fillStyle = st.col;
    ctx.textAlign = 'right';
    ctx.fillText(`${st.val}/100`, bx + colW, by);

    ctx.fillStyle = 'rgba(255,255,255,0.09)';
    remoRoundRect(ctx, bx, by + 7, colW, 11, 5.5);
    ctx.fill();

    ctx.fillStyle = st.col;
    remoRoundRect(ctx, bx, by + 7, Math.max(12, colW * (st.val / 100)), 11, 5.5);
    ctx.fill();
  });

  // 6. PvP Combat Strip (ATK / DEF / SPD / HP)
  const pvpY = barsY + 108;
  ctx.save();
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.strokeStyle = accent + '88';
  ctx.lineWidth = 1.8;
  remoRoundRect(ctx, 56, pvpY, CARD_W - 112, 54, 14);
  ctx.fill(); ctx.stroke();

  const combatCols = [
    `⚔️ ATK ${pvp.atk}`,
    `🛡️ DEF ${pvp.def}`,
    `⚡ SPD ${pvp.spd}`,
    `❤️ HP ${pvp.hp}`
  ];
  const segW = (CARD_W - 112) / 4;
  ctx.font = '900 16px "Orbitron", sans-serif';
  ctx.textAlign = 'center';
  combatCols.forEach((txt, idx) => {
    ctx.fillStyle = idx === 0 ? '#f43f5e' : idx === 1 ? '#38bdf8' : idx === 2 ? '#fbbf24' : '#10b981';
    ctx.fillText(txt, 56 + segW * idx + segW / 2, pvpY + 33);
  });
  ctx.restore();

  // 7. Bottom Valuation & Serial Foil Stamp
  const footY = CARD_H - 64;
  const valCoins = Number(spec.coinValue || city.baseValue || 8500);
  ctx.save();
  ctx.font = '900 20px "Orbitron", sans-serif';
  ctx.fillStyle = '#fbbf24';
  ctx.textAlign = 'left';
  ctx.fillText(`🪙 ${valCoins.toLocaleString()} REMO`, 56, footY);

  if (spec.ownerName) {
    ctx.font = '700 13px "Outfit", sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`👤 ${spec.ownerName}`, 56, footY + 22);
  }

  if (sec.goldStamp) {
    const bw = 228, bh = 38, bx = CARD_W - bw - 54, by = footY - 26;
    const gg = ctx.createLinearGradient(bx, by, bx + bw, by + bh);
    gg.addColorStop(0, '#d97706');
    gg.addColorStop(0.5, '#fde047');
    gg.addColorStop(1, '#b45309');
    ctx.fillStyle = gg;
    remoRoundRect(ctx, bx, by, bw, bh, 10);
    ctx.fill();
    ctx.font = '900 13px "Orbitron", monospace';
    ctx.fillStyle = '#050814';
    ctx.textAlign = 'center';
    ctx.fillText(`${fullSerial} / ${maxSupply}`, bx + bw / 2, by + 24);
  }
  ctx.restore();
}

/* ── 4. BACK CARD RENDERER (750 × 1050 px @ 300 DPI) ── */
function renderCityCardBack(canvas, spec = {}, langOverride) {
  if (!canvas) return;
  canvas.width = CARD_W;
  canvas.height = CARD_H;
  const ctx = canvas.getContext('2d');
  const lang = langOverride || (window.REMO_I18N ? window.REMO_I18N.getLang() : 'en');

  const city = getCityById(spec.cityId || 'montreal');
  const sec = spec.security || { guilloche: true, microtext: true, founderSig: true, redLensSecret: '' };
  const rarity = spec.rarity || city.rarity || 'Legendary Gold';
  const rarColor = getRarityColor(rarity);
  const themeId = spec.themeId !== undefined ? Number(spec.themeId) : (city.themeId || 0);
  const accent = spec.themeColor || city.themeColor || '#6366f1';
  const serial = String(spec.serial || '0001').padStart(4, '0');
  const fullSerial = `REMO-${city.code}-${serial}`;
  const stats = spec.stats || city.stats || { culture: 90, nightlife: 90, tech: 90, gastronomy: 90 };

  draw4DThemeBackdrop(ctx, themeId, accent);
  if (sec.guilloche) drawSecurityGuilloche(ctx, accent);
  if (sec.microtext) drawMicrotextBorder(ctx, fullSerial);

  // Outer Frame
  ctx.save();
  ctx.strokeStyle = rarColor;
  ctx.lineWidth = 8;
  remoRoundRect(ctx, 24, 26, CARD_W - 48, CARD_H - 52, 26);
  ctx.stroke();
  ctx.restore();

  // DNA Helix Security Strip along Left Margin
  ctx.save();
  for (let y = 70; y < CARD_H - 70; y += 14) {
    const x1 = 48 + Math.sin(y * 0.05) * 8;
    const x2 = 48 - Math.sin(y * 0.05) * 8;
    ctx.fillStyle = accent + '88';
    ctx.beginPath(); ctx.arc(x1, y, 2.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fbbf2488';
    ctx.beginPath(); ctx.arc(x2, y, 2.2, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();

  // Top Header
  ctx.save();
  ctx.font = '900 28px "Orbitron", sans-serif';
  ctx.fillStyle = '#fbbf24';
  ctx.textAlign = 'center';
  ctx.fillText('🌐 REMO WORLD CITIES', CARD_W / 2, 86);
  ctx.font = '700 14px "Outfit", sans-serif';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText(
    lang === 'fr' ? REMO_DICT.fr.card_verified_authentic : REMO_DICT.en.card_verified_authentic,
    CARD_W / 2, 114
  );
  ctx.restore();

  // Radar Diamond / Hexagon Stats Chart
  const cx = CARD_W / 2, cy = 265, maxR = 98;
  ctx.save();
  [0.35, 0.7, 1.0].forEach((ring) => {
    ctx.strokeStyle = 'rgba(255,255,255,0.14)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      const a = (Math.PI / 2) * i - Math.PI / 2;
      const rx = cx + Math.cos(a) * maxR * ring;
      const ry = cy + Math.sin(a) * maxR * ring;
      i === 0 ? ctx.moveTo(rx, ry) : ctx.lineTo(rx, ry);
    }
    ctx.closePath(); ctx.stroke();
  });

  const axes = [
    { val: stats.culture / 100,    lbl: lang === 'fr' ? 'CULTURE' : 'CULTURE' },
    { val: stats.tech / 100,       lbl: lang === 'fr' ? 'TECH' : 'TECH' },
    { val: stats.gastronomy / 100, lbl: lang === 'fr' ? 'GASTRO' : 'GASTRO' },
    { val: stats.nightlife / 100,  lbl: lang === 'fr' ? 'NUIT' : 'NIGHTLIFE' }
  ];
  ctx.fillStyle = accent + '55';
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 3;
  ctx.beginPath();
  axes.forEach((ax, i) => {
    const a = (Math.PI / 2) * i - Math.PI / 2;
    const px = cx + Math.cos(a) * maxR * Math.max(0.2, ax.val);
    const py = cy + Math.sin(a) * maxR * Math.max(0.2, ax.val);
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  });
  ctx.closePath();
  ctx.fill(); ctx.stroke();

  ctx.font = '800 13px "Orbitron", sans-serif';
  ctx.fillStyle = '#e2e8f0';
  ctx.textAlign = 'center';
  ctx.fillText(axes[0].lbl, cx, cy - maxR - 14);
  ctx.fillText(axes[1].lbl, cx + maxR + 48, cy + 5);
  ctx.fillText(axes[2].lbl, cx, cy + maxR + 24);
  ctx.fillText(axes[3].lbl, cx - maxR - 54, cy + 5);
  ctx.restore();

  // City Lore / Description Box
  const loreY = 410;
  ctx.save();
  ctx.fillStyle = 'rgba(15, 23, 42, 0.78)';
  ctx.strokeStyle = accent + '66';
  ctx.lineWidth = 2;
  remoRoundRect(ctx, 72, loreY, CARD_W - 144, 155, 18);
  ctx.fill(); ctx.stroke();

  ctx.font = '900 18px "Orbitron", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText(`${city.flag} ${getCityName(city, lang).toUpperCase()} (${fullSerial})`, CARD_W / 2, loreY + 34);

  ctx.font = '500 16px "Outfit", sans-serif';
  ctx.fillStyle = '#cbd5e1';
  remoWrapText(ctx, spec.customLore || getCityDesc(city, lang), CARD_W / 2, loreY + 68, CARD_W - 190, 24, 3);
  ctx.restore();

  // Optional Red Lens Secret Decoder Box
  if (sec.redLensSecret && sec.redLensSecret.trim()) {
    ctx.save();
    const ry = 582;
    for (let x = 80; x < CARD_W - 80; x += 5) {
      ctx.strokeStyle = 'rgba(0, 195, 255, 0.22)';
      ctx.beginPath(); ctx.moveTo(x, ry); ctx.lineTo(x + 4, ry + 36); ctx.stroke();
    }
    ctx.font = '900 16px "Orbitron", monospace';
    ctx.fillStyle = 'rgba(255, 0, 85, 0.86)';
    ctx.textAlign = 'center';
    ctx.fillText(`🔴 SECRET: ${sec.redLensSecret.toUpperCase()}`, CARD_W / 2, ry + 24);
    ctx.restore();
  }

  // Bottom Scannable QR Code + Barcode + SHA-256 Verification Panel
  const qrPanelY = 636;
  ctx.save();
  ctx.fillStyle = 'rgba(7, 11, 24, 0.92)';
  ctx.strokeStyle = '#fbbf2488';
  ctx.lineWidth = 2;
  remoRoundRect(ctx, 72, qrPanelY, CARD_W - 144, 290, 20);
  ctx.fill(); ctx.stroke();

  const baseDomain = getRemoBaseUrl(spec);
  const qrTarget = `${baseDomain}/index.html?city=${city.id}&verify=${fullSerial}`;
  const qrCv = RemoQREngine.toCanvas(qrTarget, 190);
  ctx.drawImage(qrCv, 96, qrPanelY + 26, 190, 190);

  ctx.font = '900 12px "Orbitron", sans-serif';
  ctx.fillStyle = '#fbbf24';
  ctx.textAlign = 'center';
  ctx.fillText(
    lang === 'fr' ? REMO_DICT.fr.card_scan_verify : REMO_DICT.en.card_scan_verify,
    191, qrPanelY + 240
  );

  // Right side of QR box: Serial, Mint Date, Barcode & SHA-256
  const rx = 312;
  ctx.textAlign = 'left';
  ctx.font = '900 20px "Orbitron", monospace';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(fullSerial, rx, qrPanelY + 54);

  ctx.font = '700 14px "Outfit", sans-serif';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText(`${lang === 'fr' ? 'Rareté' : 'Rarity'}: ${rarity}`, rx, qrPanelY + 84);
  ctx.fillStyle = '#10b981';
  ctx.fillText(`✓ ${lang === 'fr' ? 'AUTHENTIFIÉ SUR REMO' : 'REMO AUTHENTICATED'}`, rx, qrPanelY + 110);

  // Security Barcode
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(rx, qrPanelY + 128, 336, 44);
  ctx.fillStyle = '#050814';
  let bSeed = 4219;
  for (let i = 0; i < fullSerial.length; i++) bSeed += fullSerial.charCodeAt(i) * (i + 3);
  let bx = rx + 8;
  while (bx < rx + 326) {
    bSeed = (bSeed * 9301 + 49297) % 233280;
    const bw = (bSeed % 3) + 1;
    if (bSeed % 2 === 0) ctx.fillRect(bx, qrPanelY + 133, bw, 34);
    bx += bw + 1.5;
  }

  const sha = remoPseudoSHA256(fullSerial + rarity);
  ctx.font = 'bold 11px monospace';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(`SHA-256: ${sha.slice(0, 26)}...`, rx, qrPanelY + 196);

  if (sec.founderSig !== false) {
    ctx.font = 'italic bold 22px Georgia, serif';
    ctx.fillStyle = '#fbbf24';
    ctx.fillText('REMO Executive Seal', rx, qrPanelY + 238);
  }
  ctx.restore();

  // Footer
  ctx.font = '700 13px "Orbitron", sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.textAlign = 'center';
  ctx.fillText('✦ REMO GLOBAL NETWORK · 63.5 × 88.9 MM · 300 DPI ✦', CARD_W / 2, CARD_H - 48);
}

/* ── 5. EXPORTERS: PNG, 9:16 STORY, 16:9 VS BATTLE, A4 CERTIFICATE & DUPLEX PRINT ── */
function downloadCanvasAsPNG(canvas, filename) {
  if (!canvas) return;
  const a = document.createElement('a');
  a.href = canvas.toDataURL('image/png');
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => a.remove(), 150);
}

function exportCityStory916(frontCanvas, spec = {}, langOverride) {
  const lang = langOverride || (window.REMO_I18N ? window.REMO_I18N.getLang() : 'en');
  const city = getCityById(spec.cityId || 'montreal');
  const serial = String(spec.serial || '0001').padStart(4, '0');
  const fullSerial = `REMO-${city.code}-${serial}`;

  const W = 1080, H = 1920;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d');

  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#040611');
  bg.addColorStop(0.5, '#111633');
  bg.addColorStop(1, '#040611');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  ctx.font = '900 48px "Orbitron", sans-serif';
  ctx.fillStyle = '#fbbf24';
  ctx.textAlign = 'center';
  ctx.fillText(`🌐 REMO · ${city.flag} ${getCityName(city, lang).toUpperCase()}`, W / 2, 130);

  ctx.font = '700 24px "Outfit", sans-serif';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText(
    lang === 'fr' ? '✦ CARTE OFFICIELLE VILLES DU MONDE ✦' : '✦ OFFICIAL WORLD CITY COLLECTIBLE CARD ✦',
    W / 2, 180
  );

  // Center Front Card
  const cw = 680, ch = 952;
  ctx.save();
  ctx.shadowColor = city.themeColor || '#6366f1';
  ctx.shadowBlur = 55;
  ctx.drawImage(frontCanvas, (W - cw) / 2, 235, cw, ch);
  ctx.restore();

  // Scannable QR CTA
  const baseDomain = getRemoBaseUrl(spec);
  const qrUrl = `${baseDomain}/index.html?city=${city.id}&ref=${fullSerial}`;
  const qrCv = RemoQREngine.toCanvas(qrUrl, 210);
  ctx.drawImage(qrCv, W / 2 - 105, 1255, 210, 210);

  ctx.font = '900 34px "Outfit", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(
    lang === 'fr' ? 'SCANNEZ & RÉCLAMEZ +100 🪙 SUR REMO !' : 'SCAN & CLAIM +100 🪙 ON REMO!',
    W / 2, 1535
  );

  ctx.font = '700 22px "Outfit", sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(`#REMO #${getCityName(city, 'en').replace(/\s+/g, '')} #CityCards #CityWars`, W / 2, 1600);

  downloadCanvasAsPNG(cv, `REMO_Story_9x16_${fullSerial}.png`);
}

function exportCityBattleVS16x9(frontCanvas, spec = {}, langOverride) {
  const lang = langOverride || (window.REMO_I18N ? window.REMO_I18N.getLang() : 'en');
  const city = getCityById(spec.cityId || 'montreal');
  const W = 1920, H = 1080;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d');

  ctx.fillStyle = '#050816';
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = 'rgba(244,63,94,0.14)';
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(W * 0.52, 0); ctx.lineTo(W * 0.46, H); ctx.lineTo(0, H); ctx.fill();
  ctx.fillStyle = 'rgba(56,189,248,0.14)';
  ctx.beginPath(); ctx.moveTo(W * 0.52, 0); ctx.lineTo(W, 0); ctx.lineTo(W, H); ctx.lineTo(W * 0.46, H); ctx.fill();

  const ch = 820, cw = Math.round(ch * (750 / 1050));
  ctx.save();
  ctx.shadowColor = city.themeColor || '#fbbf24';
  ctx.shadowBlur = 45;
  ctx.drawImage(frontCanvas, 170, 150, cw, ch);
  ctx.restore();

  // VS Medallion
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath(); ctx.arc(W / 2, H / 2, 86, 0, Math.PI * 2); ctx.fill();
  ctx.font = '900 60px "Orbitron", sans-serif';
  ctx.fillStyle = '#050816';
  ctx.textAlign = 'center';
  ctx.fillText('VS', W / 2, H / 2 + 20);

  // Opponent Placeholder
  const rx = W - 170 - cw;
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 4;
  remoRoundRect(ctx, rx, 150, cw, ch, 24);
  ctx.stroke();
  ctx.font = '900 30px "Orbitron", sans-serif';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText(lang === 'fr' ? '? VOTRE VILLE ICI ?' : '? YOUR CITY CARD ?', rx + cw / 2, H / 2);

  ctx.font = '900 44px "Orbitron", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(
    lang === 'fr' ? '⚔️ GUERRE DES VILLES REMO — QUI GAGNE ?' : '⚔️ REMO CITY CARD BATTLE — WHO WINS?',
    W / 2, 82
  );

  downloadCanvasAsPNG(cv, `REMO_VS_Battle_${city.code}.png`);
}

function downloadCityCertificateA4(spec = {}, langOverride) {
  const lang = langOverride || (window.REMO_I18N ? window.REMO_I18N.getLang() : 'en');
  const city = getCityById(spec.cityId || 'montreal');
  const serial = String(spec.serial || '0001').padStart(4, '0');
  const fullSerial = `REMO-${city.code}-${serial}`;
  const rarity = spec.rarity || city.rarity || 'Legendary Gold';
  const sha = remoPseudoSHA256(fullSerial + rarity);

  const W = 2480, H = 1754; // High-res A4 Landscape
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d');

  ctx.fillStyle = '#050816';
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 20;
  remoRoundRect(ctx, 36, 36, W - 72, H - 72, 32);
  ctx.stroke();

  ctx.font = '900 56px "Orbitron", sans-serif';
  ctx.fillStyle = '#fbbf24';
  ctx.textAlign = 'center';
  ctx.fillText(lang === 'fr' ? REMO_DICT.fr.cert_header : REMO_DICT.en.cert_header, W / 2, 160);

  ctx.font = '700 28px "Outfit", sans-serif';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText(lang === 'fr' ? REMO_DICT.fr.cert_sub : REMO_DICT.en.cert_sub, W / 2, 215);

  const rows = [
    [lang === 'fr' ? 'VILLE OFFICIELLE :' : 'OFFICIAL CITY:', `${city.flag} ${getCityName(city, lang)} (${getCityCountry(city, lang)})`],
    [lang === 'fr' ? 'NUMÉRO DE SÉRIE :' : 'SERIAL NUMBER:', fullSerial],
    [lang === 'fr' ? 'RARETÉ :' : 'COLLECTOR RARITY:', rarity.toUpperCase()],
    [lang === 'fr' ? 'COORDONNÉES GPS :' : 'GPS COORDINATES:', `${city.lat.toFixed(4)}, ${city.lng.toFixed(4)}`],
    [lang === 'fr' ? 'VALEUR CERTIFIÉE :' : 'CERTIFIED VALUATION:', `${(spec.coinValue || city.baseValue).toLocaleString()} REMO COINS`],
    ['SHA-256:', sha],
    [lang === 'fr' ? 'DATE D’ÉMISSION :' : 'MINT DATE:', new Date().toISOString().split('T')[0]]
  ];

  let ry = 360;
  rows.forEach(([k, v]) => {
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(140, ry + 26); ctx.lineTo(W - 560, ry + 26); ctx.stroke();
    ctx.font = '700 26px "Outfit", sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'left';
    ctx.fillText(k, 150, ry);
    ctx.font = '800 28px "Orbitron", monospace';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'right';
    ctx.fillText(v, W - 570, ry);
    ry += 165;
  });

  const baseDomain = getRemoBaseUrl(spec);
  const qrCv = RemoQREngine.toCanvas(`${baseDomain}/index.html?city=${city.id}&verify=${fullSerial}`, 300);
  ctx.drawImage(qrCv, W - 450, 360, 300, 300);

  ctx.fillStyle = '#fbbf24';
  ctx.beginPath(); ctx.arc(W - 300, 920, 120, 0, Math.PI * 2); ctx.fill();
  ctx.font = '900 28px "Orbitron", sans-serif';
  ctx.fillStyle = '#050816';
  ctx.textAlign = 'center';
  ctx.fillText('REMO', W - 300, 910);
  ctx.fillText('OFFICIAL SEAL', W - 300, 950);

  downloadCanvasAsPNG(cv, `REMO_Certificate_A4_${fullSerial}.png`);
}

function openCityPrintSuite(specsList, side = 'front', langOverride) {
  const lang = langOverride || (window.REMO_I18N ? window.REMO_I18N.getLang() : 'en');
  const tempCv = document.createElement('canvas');
  const renderedCards = specsList.map((sp) => {
    if (side === 'front') renderCityCardFront(tempCv, sp, lang);
    else renderCityCardBack(tempCv, sp, lang);
    return { url: tempCv.toDataURL('image/png'), code: sp.cityId };
  });

  // For Duplex Back printing, mirror each row of 3 horizontally (2, 1, 0) so Front & Back align!
  const ordered = [];
  for (let i = 0; i < renderedCards.length; i += 3) {
    const row = renderedCards.slice(i, i + 3);
    if (side === 'back') {
      while (row.length < 3) row.push({ url: '', empty: true });
      row.reverse();
    }
    ordered.push(...row);
  }

  const pages = [];
  for (let i = 0; i < ordered.length; i += 9) pages.push(ordered.slice(i, i + 9));

  const w = window.open('', '_blank');
  if (!w) {
    alert(lang === 'fr' ? 'Veuillez autoriser les pop-ups pour imprimer.' : 'Please allow pop-ups to open the print suite.');
    return;
  }

  const dict = lang === 'fr' ? REMO_DICT.fr : REMO_DICT.en;
  const pagesHtml = (cls) => pages.map((pg) => `
    <div class="sheet">
      <div class="${cls}">
        ${pg.map((c) => `<div class="cbox">${c.url ? `<img src="${c.url}">` : ''}</div>`).join('')}
      </div>
    </div>
  `).join('');

  w.document.write(`<!DOCTYPE html>
  <html lang="${lang}">
  <head>
    <meta charset="UTF-8">
    <title>${dict.print_suite_title}</title>
    <style>
      @page { size: A4 portrait; margin: 0; }
      * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      body { margin: 0; background: #0b1020; color: #f8fafc; font-family: system-ui, sans-serif; }
      .bar { position: sticky; top: 0; z-index: 99; background: #131c36; padding: 16px 24px; border-bottom: 2px solid #f59e0b; }
      .btns { display: flex; gap: 10px; flex-wrap: wrap; margin: 10px 0; }
      button { padding: 10px 16px; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; }
      .b-gold { background: #f59e0b; color: #000; }
      .b-cyan { background: #0284c7; color: #fff; }
      .b-purp { background: #7c3aed; color: #fff; }
      .guide { font-size: 13px; background: rgba(0,0,0,0.35); padding: 10px 14px; border-radius: 8px; line-height: 1.5; }
      .sheet { width: 210mm; height: 297mm; background: #fff; margin: 18px auto; padding: 8mm 9.75mm; page-break-after: always; }
      .grid-std { display: grid; grid-template-columns: repeat(3, 63.5mm); grid-auto-rows: 88.9mm; justify-content: center; }
      .grid-std .cbox, .grid-std img { width: 63.5mm; height: 88.9mm; display: block; }
      .grid-comp { display: grid; grid-template-columns: repeat(3, 67.3mm); grid-auto-rows: 94.2mm; justify-content: center; }
      .grid-comp .cbox, .grid-comp img { width: 67.3mm; height: 94.2mm; display: block; }
      .cbox { border: 0.3mm dashed #cbd5e1; }
      #vComp, #vSingle { display: none; }
      .single-card { width: 63.5mm; height: 88.9mm; margin: 14px auto; page-break-after: always; }
      .single-card img { width: 63.5mm; height: 88.9mm; display: block; }
      @media print { .bar { display: none !important; } body { background: #fff !important; } .sheet { margin: 0 !important; } }
    </style>
  </head>
  <body>
    <div class="bar">
      <div style="font-weight:900;font-size:18px;color:#fbbf24;">${dict.print_suite_title} — ${side.toUpperCase()}</div>
      <div class="btns">
        <button class="b-gold" onclick="showV('vStd')">${dict.print_mode_std}</button>
        <button class="b-purp" onclick="showV('vComp')">${dict.print_mode_comp}</button>
        <button class="b-cyan" onclick="showV('vSingle')">${dict.print_mode_single}</button>
        <button class="b-gold" onclick="window.print()">${dict.print_btn_now}</button>
      </div>
      <div class="guide">${dict.print_guide_html}</div>
    </div>
    <div id="vStd">${pagesHtml('grid-std')}</div>
    <div id="vComp">${pagesHtml('grid-comp')}</div>
    <div id="vSingle">${renderedCards.map((c) => `<div class="single-card"><img src="${c.url}"></div>`).join('')}</div>
    <script>
      function showV(id){ ['vStd','vComp','vSingle'].forEach(k=>document.getElementById(k).style.display=(k===id?'block':'none')); }
    <\/script>
  </body>
  </html>`);
  w.document.close();
}

window.REMO_CARD_THEMES = REMO_CARD_THEMES;
window.RemoQREngine = RemoQREngine;
window.renderCityCardFront = renderCityCardFront;
window.renderCityCardBack = renderCityCardBack;
window.downloadCanvasAsPNG = downloadCanvasAsPNG;
window.exportCityStory916 = exportCityStory916;
window.exportCityBattleVS16x9 = exportCityBattleVS16x9;
window.downloadCityCertificateA4 = downloadCityCertificateA4;
window.openCityPrintSuite = openCityPrintSuite;
