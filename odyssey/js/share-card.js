/* ═══════════════════════════════════════════════════════════════════════════
   REMO WORLD: 4D Compass Odyssey — 9:16 Viral Story Card, QR Code & 1v1 Duel
   Strictly Bilingual: English (EN) & French (FR) · Crisp Graphic Flags
   Includes Offline ISO Scannable QR Generator (Zero External Requests)
   ═══════════════════════════════════════════════════════════════════════════ */

(function (global) {
  'use strict';

  /* ── Compact Offline ISO QR Code Generator (Level L, Versions 2..10) ── */
  const RemoOdysseyQR = (function () {
    function QRBytes(data) {
      this.bytes = [];
      for (let i = 0; i < data.length; i++) {
        const c = data.charCodeAt(i);
        if (c < 0x80) this.bytes.push(c);
        else if (c < 0x800) this.bytes.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f));
        else this.bytes.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
      }
    }
    const EXP = new Array(256), LOG = new Array(256);
    for (let i = 0; i < 8; i++) EXP[i] = 1 << i;
    for (let i = 8; i < 256; i++) EXP[i] = EXP[i - 4] ^ EXP[i - 5] ^ EXP[i - 6] ^ EXP[i - 8];
    for (let i = 0; i < 255; i++) LOG[EXP[i]] = i;
    const glog = (n) => LOG[n];
    const gexp = (n) => { while (n < 0) n += 255; while (n >= 256) n -= 255; return EXP[n]; };

    function Poly(num, shift) {
      let off = 0;
      while (off < num.length && num[off] === 0) off++;
      this.num = new Array(num.length - off + shift);
      for (let i = 0; i < num.length - off; i++) this.num[i] = num[i + off];
    }
    Poly.prototype = {
      get(i) { return this.num[i]; },
      len() { return this.num.length; },
      mul(e) {
        const n = new Array(this.len() + e.len() - 1).fill(0);
        for (let i = 0; i < this.len(); i++)
          for (let j = 0; j < e.len(); j++)
            n[i + j] ^= gexp(glog(this.get(i)) + glog(e.get(j)));
        return new Poly(n, 0);
      },
      mod(e) {
        if (this.len() - e.len() < 0) return this;
        const ratio = glog(this.get(0)) - glog(e.get(0));
        const n = this.num.slice();
        for (let i = 0; i < e.len(); i++) n[i] ^= gexp(glog(e.get(i)) + ratio);
        return new Poly(n, 0).mod(e);
      }
    };

    const RS_L = [
      null,
      [[1, 26, 19]], [[1, 44, 34]], [[1, 70, 55]], [[1, 100, 80]], [[1, 134, 108]],
      [[2, 86, 68]], [[2, 98, 78]], [[2, 121, 97]], [[2, 146, 116]], [[2, 86, 68], [2, 87, 69]]
    ];
    const ALIGN = [
      [], [], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34],
      [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50]
    ];
    const bchDig = (d) => { let n = 0; while (d !== 0) { n++; d >>>= 1; } return n; };
    const bchType = (data) => {
      let d = data << 10;
      while (bchDig(d) - bchDig(0x537) >= 0) d ^= (0x537 << (bchDig(d) - bchDig(0x537)));
      return ((data << 10) | d) ^ 0x5412;
    };
    const bchVer = (data) => {
      let d = data << 12;
      while (bchDig(d) - bchDig(0x1f25) >= 0) d ^= (0x1f25 << (bchDig(d) - bchDig(0x1f25)));
      return (data << 12) | d;
    };

    function BitBuf() { this.buffer = []; this.length = 0; }
    BitBuf.prototype = {
      put(num, len) { for (let i = 0; i < len; i++) this.bit(((num >>> (len - i - 1)) & 1) === 1); },
      bit(b) {
        const idx = Math.floor(this.length / 8);
        if (this.buffer.length <= idx) this.buffer.push(0);
        if (b) this.buffer[idx] |= (0x80 >>> (this.length % 8));
        this.length++;
      }
    };

    function buildMatrix(text) {
      const seg = new QRBytes(text);
      const caps = [0, 17, 32, 53, 78, 106, 134, 154, 192, 230, 271];
      let ver = 10;
      for (let v = 2; v <= 10; v++) { if (seg.bytes.length <= caps[v]) { ver = v; break; } }
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

      const pos = ALIGN[ver] || [];
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

      const typeBits = bchType((1 << 3) | 2);
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
        const vBits = bchVer(ver);
        for (let i = 0; i < 18; i++) {
          const bit = ((vBits >> i) & 1) === 1;
          mods[Math.floor(i / 3)][(i % 3) + count - 11] = bit;
          mods[(i % 3) + count - 11][Math.floor(i / 3)] = bit;
        }
      }

      const rsBlocks = [];
      RS_L[ver].forEach(([cnt, tot, dat]) => {
        for (let k = 0; k < cnt; k++) rsBlocks.push({ totalCount: tot, dataCount: dat });
      });
      const totalData = rsBlocks.reduce((s, b) => s + b.dataCount, 0);
      const buf = new BitBuf();
      buf.put(4, 4);
      buf.put(seg.bytes.length, ver < 10 ? 8 : 16);
      seg.bytes.forEach((b) => buf.put(b, 8));
      if (buf.length + 4 <= totalData * 8) buf.put(0, 4);
      while (buf.length % 8 !== 0) buf.bit(false);
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
        let rsPoly = new Poly([1], 0);
        for (let i = 0; i < ec; i++) rsPoly = rsPoly.mul(new Poly([1, gexp(i)], 0));
        const modPoly = new Poly(dcdata[r], rsPoly.len() - 1).mod(rsPoly);
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
              if ((col - c) % 3 === 0) dark = !dark;
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

    function toCanvas(text, size = 108) {
      const cv = document.createElement('canvas');
      cv.width = size; cv.height = size;
      const c2 = cv.getContext('2d');
      c2.fillStyle = '#ffffff';
      c2.fillRect(0, 0, size, size);
      try {
        const { mods, count } = buildMatrix(String(text || 'https://remoworld.com').slice(0, 220));
        const quiet = 2;
        const cell = size / (count + quiet * 2);
        c2.fillStyle = '#050816';
        for (let r = 0; r < count; r++) {
          for (let c = 0; c < count; c++) {
            if (mods[r][c]) {
              c2.fillRect(Math.floor((c + quiet) * cell), Math.floor((r + quiet) * cell), Math.ceil(cell), Math.ceil(cell));
            }
          }
        }
      } catch (e) {
        c2.strokeStyle = '#050816';
        c2.lineWidth = 3;
        c2.strokeRect(8, 8, size - 16, size - 16);
      }
      return cv;
    }

    return { toCanvas, buildMatrix };
  })();

  function buildPublicShareUrl(summary) {
    try {
      const href = String((global.location && global.location.href) || '');
      const isPublic = /^https?:\/\/(?!localhost|127\.0\.0\.1)/i.test(href);
      let base = 'https://remoworld.com/odyssey.html';
      if (isPublic) {
        const parsed = new URL(href);
        base = `${parsed.origin}/odyssey.html`;
      }
      const url = new URL(base);
      url.searchParams.set('seed', summary.seed || 'REMO2026');
      url.searchParams.set('start', summary.startCityId || 'chisinau');
      url.searchParams.set('target', String(summary.score || 0));
      url.searchParams.set('vs', summary.playerName || 'REMO');
      return url.toString();
    } catch (e) {
      return `https://remoworld.com/odyssey.html?seed=${encodeURIComponent(summary.seed || 'REMO2026')}&start=${encodeURIComponent(summary.startCityId || 'chisinau')}&target=${Number(summary.score || 0)}`;
    }
  }

  function renderStoryCardCanvas(summary, lang) {
    const isFr = lang === 'fr';
    const W = 540;
    const H = 960;
    const cv = document.createElement('canvas');
    cv.width = W;
    cv.height = H;
    const ctx = cv.getContext('2d');

    const startCity = REMO_DATA.getCityById(summary.startCityId || 'chisinau');
    const col = (startCity && startCity.themeColor) || '#38bdf8';

    // Cosmic Midnight Background
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#040714');
    bg.addColorStop(0.45, '#111132');
    bg.addColorStop(1, '#050816');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Ambient radial glow
    const rad = ctx.createRadialGradient(W / 2, 340, 20, W / 2, 340, 320);
    rad.addColorStop(0, col + '48');
    rad.addColorStop(0.5, 'rgba(168, 85, 247, 0.22)');
    rad.addColorStop(1, 'transparent');
    ctx.fillStyle = rad;
    ctx.fillRect(0, 0, W, H);

    // Starry sky
    for (let i = 0; i < 70; i++) {
      const sx = ((i * 137.5) % W);
      const sy = ((i * 73.1) % (H * 0.72));
      ctx.fillStyle = i % 3 === 0 ? '#fde047aa' : '#ffffffaa';
      ctx.beginPath();
      ctx.arc(sx, sy, (i % 3) * 0.7 + 0.8, 0, Math.PI * 2);
      ctx.fill();
    }

    // Outer Holographic Border
    const borderG = ctx.createLinearGradient(0, 0, W, H);
    borderG.addColorStop(0, '#38bdf8');
    borderG.addColorStop(0.5, '#fbbf24');
    borderG.addColorStop(1, '#ec4899');
    ctx.strokeStyle = borderG;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(14, 14, W - 28, H - 28, 28);
    ctx.stroke();

    // Top Header Pill
    ctx.fillStyle = 'rgba(251, 191, 36, 0.14)';
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(90, 38, W - 180, 34, 17);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fde047';
    ctx.font = '800 13px "Orbitron", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('★ REMO WORLD · OFFICIAL GAME ★', W / 2, 60);

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 30px "Orbitron", system-ui, sans-serif';
    ctx.fillText('REMO ODYSSEY', W / 2, 108);

    ctx.fillStyle = '#7dd3fc';
    ctx.font = '700 14px system-ui, sans-serif';
    ctx.fillText(`@${summary.playerName || 'REMO_Explorer'} · ${summary.vipLabel || 'SOVEREIGN 4D'}`, W / 2, 134);

    // Optional Citizen Real Profile Photo Medallion (Feature #7)
    if (summary.showPhotoOnCard && summary.playerAvatarImg && summary.playerAvatarImg.complete && summary.playerAvatarImg.naturalWidth > 0) {
      const ax = 68, ay = 104, ar = 28;
      ctx.save();
      ctx.beginPath();
      ctx.arc(ax, ay, ar, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(summary.playerAvatarImg, ax - ar, ay - ar, ar * 2, ar * 2);
      ctx.restore();
      ctx.save();
      ctx.strokeStyle = '#fbbf24';
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 12;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(ax, ay, ar + 1, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Live City King Stamp if crowned during run!
    if (summary.stoleCityKing || summary.isCityKing) {
      ctx.save();
      ctx.fillStyle = 'rgba(251, 191, 36, 0.22)';
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.roundRect(W / 2 - 110, 148, 220, 26, 13);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#fde047';
      ctx.font = '900 11px "Orbitron", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(isFr ? `👑 ROI DE ${startCity.code}` : `👑 CITY KING OF ${startCity.code}`, W / 2, 165);
      ctx.restore();
    }

    // City Landmark Backdrop behind Hero
    REMO_DATA.drawCityLandmark(ctx, startCity.id, col, W / 2, 412, 142, 0.45);

    // Sculpted Hero 4B Hover-Coin Surfer Centerpiece
    REMO_AVATAR.drawRemoHero(ctx, {
      x: W / 2,
      y: 376,
      scale: 2.30,
      time: 1.25,
      mode: 'fly',
      morph: 1,
      vy: 0,
      crystals: Math.max(1, Math.min(4, summary.crystalsLeft || 4)),
      elementColor: col,
      vipFrame: summary.vipFrame || 'gold_fire',
      auraStyle: summary.vipFrame || 'gold_fire',
      hoverSkin: summary.hoverSkin || 'gold',
      hasCrown: Boolean(summary.stoleCityKing || summary.isCityKing),
      showPowers: true
    });

    // Big Score Box
    ctx.fillStyle = 'rgba(8, 13, 30, 0.90)';
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.48)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(38, 444, W - 76, 114, 22);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '800 12px "Orbitron", system-ui, sans-serif';
    ctx.fillText(isFr ? 'SCORE FINAL 4D' : 'FINAL 4D SCORE', W / 2, 470);

    ctx.fillStyle = '#fbbf24';
    ctx.font = '900 48px "Orbitron", system-ui, sans-serif';
    ctx.fillText(Number(summary.score || 0).toLocaleString(), W / 2, 526);

    // 3 KPI Pills
    const kpis = [
      { lbl: isFr ? 'VILLES' : 'CITIES', val: `${summary.citiesCount || 1}` },
      { lbl: 'KM 4D', val: `${Number(summary.kmFlown || 0).toLocaleString()}` },
      { lbl: isFr ? 'PIÈCES' : 'COINS', val: `+${summary.coinsEarned || 0}` }
    ];
    const kW = 144;
    const kGap = 16;
    const startX = (W - (kW * 3 + kGap * 2)) / 2;
    kpis.forEach((k, idx) => {
      const kx = startX + idx * (kW + kGap);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(kx, 576, kW, 78, 16);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.font = '700 12px system-ui, sans-serif';
      ctx.fillText(k.lbl, kx + kW / 2, 600);

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 21px "Orbitron", system-ui, sans-serif';
      ctx.fillText(k.val, kx + kW / 2, 634);
    });

    // Connected Route Chain with Graphic Country Flags
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.42)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(38, 672, W - 76, 114, 20);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#c4b5fd';
    ctx.font = '800 11px "Orbitron", system-ui, sans-serif';
    ctx.fillText(isFr ? 'ITINÉRAIRE CONNECTÉ' : 'CONNECTED ROUTE', W / 2, 695);

    const routeCities = (summary.routeIds || [startCity.id]).slice(0, 5).map((cid) => REMO_DATA.getCityById(cid));
    const slotW = 78;
    const totalRW = routeCities.length * slotW;
    const rStartX = (W - totalRW) / 2;
    routeCities.forEach((c, idx) => {
      const sx = rStartX + idx * slotW + 10;
      REMO_DATA.drawCountryFlag(ctx, c, sx, 712, 26, 18);
      ctx.fillStyle = '#ffffff';
      ctx.font = '800 12px "Orbitron", system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(c.code, sx + 31, 725);
      if (idx < routeCities.length - 1) {
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('→', sx + 60, 725);
      }
    });

    ctx.textAlign = 'center';
    ctx.fillStyle = '#38bdf8';
    ctx.font = '700 12px system-ui, sans-serif';
    const warPts = Number(summary.cityWarPoints || 0);
    const warTxt = warPts > 0
      ? ` · ⚔️ +${warPts} WAR PTS (${startCity.code})`
      : '';
    ctx.fillText(`COMBO x${summary.maxCombo || 1} · MULT x${summary.maxMult || 1}${warTxt}`, W / 2, 766);

    // Bottom Viral Duel Strip + Offline Scannable QR Code!
    const qrUrl = buildPublicShareUrl(summary);
    const qrCanvas = RemoOdysseyQR.toCanvas(qrUrl, 104);

    ctx.fillStyle = 'rgba(11, 18, 40, 0.92)';
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.52)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(38, 804, W - 76, 122, 22);
    ctx.fill();
    ctx.stroke();

    // Left CTA Copy
    ctx.textAlign = 'left';
    ctx.fillStyle = '#fbbf24';
    ctx.font = '900 16px "Orbitron", system-ui, sans-serif';
    ctx.fillText(isFr ? 'BATS MON SCORE 1v1 !' : 'BEAT MY SCORE 1v1!', 56, 839);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '700 12px system-ui, sans-serif';
    ctx.fillText(
      isFr ? 'Scanne le QR pour affronter mon Fantôme' : 'Scan QR to race my live 4D Ghost',
      56, 864
    );

    const pillG = ctx.createLinearGradient(56, 878, 360, 910);
    pillG.addColorStop(0, '#f59e0b');
    pillG.addColorStop(1, '#38bdf8');
    ctx.fillStyle = pillG;
    ctx.beginPath();
    ctx.roundRect(56, 878, 250, 32, 12);
    ctx.fill();
    ctx.fillStyle = '#050816';
    ctx.font = '900 12px "Orbitron", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🧭 remoworld.com/odyssey', 181, 899);

    // Right Scannable White QR Frame
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(386, 813, 104, 104, 12);
    ctx.fill();
    ctx.drawImage(qrCanvas, 386, 813, 104, 104);

    return cv;
  }

  function buildChallengeUrl(summary) {
    return buildPublicShareUrl(summary);
  }

  global.REMO_SHARE = {
    renderStoryCardCanvas,
    buildChallengeUrl,
    buildPublicShareUrl,
    buildQrCanvas: RemoOdysseyQR.toCanvas
  };
})(window);
