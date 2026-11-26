/* ════════════════════════════════════════════════════════════════════
   🌍 REMO VIRAL STUDIOS (v168) — Strictly Bilingual EN / FR
   1. My Travel Score (X/24 World Cities Checklist + 9:16 Story PNG)
   2. Which World City Matches Your Soul? (5-Question Quiz + 9:16 Story)
   Zero modifications to existing REMO core stores or views.
   ════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const CITIES_24 = [
    { id: 'montreal',   code: 'YUL', en: 'Montréal',       fr: 'Montréal',       c_en: 'Canada',         c_fr: 'Canada',         vibe: ['creative', 'autumn', 'indie', 'food'] },
    { id: 'paris',      code: 'CDG', en: 'Paris',          fr: 'Paris',          c_en: 'France',         c_fr: 'France',         vibe: ['romantic', 'cafe', 'historic', 'sunset'] },
    { id: 'chisinau',   code: 'RMO', en: 'Chișinău',       fr: 'Chișinău',       c_en: 'Moldova',        c_fr: 'Moldavie',       vibe: ['cozy', 'historic', 'acoustic', 'food'] },
    { id: 'bucharest',  code: 'OTP', en: 'Bucharest',      fr: 'Bucarest',       c_en: 'Romania',        c_fr: 'Roumanie',       vibe: ['historic', 'indie', 'cafe', 'autumn'] },
    { id: 'newyork',    code: 'JFK', en: 'New York',       fr: 'New York',       c_en: 'USA',            c_fr: 'États-Unis',     vibe: ['neon', 'skyline', 'tech', 'lofi'] },
    { id: 'tokyo',      code: 'HND', en: 'Tokyo',          fr: 'Tokyo',          c_en: 'Japan',          c_fr: 'Japon',          vibe: ['neon', 'rain', 'lofi', 'tech'] },
    { id: 'london',     code: 'LHR', en: 'London',         fr: 'Londres',        c_en: 'UK',             c_fr: 'Royaume-Uni',    vibe: ['rain', 'historic', 'indie', 'cafe'] },
    { id: 'rome',       code: 'FCO', en: 'Rome',           fr: 'Rome',           c_en: 'Italy',          c_fr: 'Italie',         vibe: ['historic', 'sunset', 'food', 'romantic'] },
    { id: 'dubai',      code: 'DXB', en: 'Dubai',          fr: 'Dubaï',          c_en: 'UAE',            c_fr: 'Émirats',        vibe: ['luxury', 'skyline', 'beach', 'tech'] },
    { id: 'miami',      code: 'MIA', en: 'Miami',          fr: 'Miami',          c_en: 'USA',            c_fr: 'États-Unis',     vibe: ['beach', 'neon', 'ocean', 'luxury'] },
    { id: 'barcelona',  code: 'BCN', en: 'Barcelona',      fr: 'Barcelone',      c_en: 'Spain',          c_fr: 'Espagne',        vibe: ['beach', 'sunset', 'acoustic', 'food'] },
    { id: 'toronto',    code: 'YYZ', en: 'Toronto',        fr: 'Toronto',        c_en: 'Canada',         c_fr: 'Canada',         vibe: ['skyline', 'autumn', 'tech', 'indie'] },
    { id: 'monaco',     code: 'MCM', en: 'Monaco',         fr: 'Monaco',         c_en: 'Monaco',         c_fr: 'Monaco',         vibe: ['luxury', 'ocean', 'sunset', 'romantic'] },
    { id: 'losangeles', code: 'LAX', en: 'Los Angeles',    fr: 'Los Angeles',    c_en: 'USA',            c_fr: 'États-Unis',     vibe: ['beach', 'sunset', 'creative', 'ocean'] },
    { id: 'seoul',      code: 'ICN', en: 'Seoul',          fr: 'Séoul',          c_en: 'South Korea',    c_fr: 'Corée du Sud',   vibe: ['neon', 'rain', 'tech', 'lofi'] },
    { id: 'geneva',     code: 'GVA', en: 'Geneva',         fr: 'Genève',         c_en: 'Switzerland',    c_fr: 'Suisse',         vibe: ['luxury', 'cozy', 'autumn', 'romantic'] },
    { id: 'singapore',  code: 'SIN', en: 'Singapore',      fr: 'Singapour',      c_en: 'Singapore',      c_fr: 'Singapour',      vibe: ['skyline', 'tech', 'luxury', 'rain'] },
    { id: 'sydney',     code: 'SYD', en: 'Sydney',         fr: 'Sydney',         c_en: 'Australia',      c_fr: 'Australie',      vibe: ['ocean', 'beach', 'skyline', 'creative'] },
    { id: 'rio',        code: 'GIG', en: 'Rio de Janeiro', fr: 'Rio de Janeiro', c_en: 'Brazil',         c_fr: 'Brésil',         vibe: ['beach', 'ocean', 'acoustic', 'sunset'] },
    { id: 'istanbul',   code: 'IST', en: 'Istanbul',       fr: 'Istanbul',       c_en: 'Türkiye',        c_fr: 'Turquie',        vibe: ['historic', 'sunset', 'food', 'cozy'] },
    { id: 'berlin',     code: 'BER', en: 'Berlin',         fr: 'Berlin',         c_en: 'Germany',        c_fr: 'Allemagne',      vibe: ['creative', 'indie', 'rain', 'neon'] },
    { id: 'amsterdam',  code: 'AMS', en: 'Amsterdam',      fr: 'Amsterdam',      c_en: 'Netherlands',    c_fr: 'Pays-Bas',       vibe: ['cozy', 'cafe', 'autumn', 'creative'] },
    { id: 'lisbon',     code: 'LIS', en: 'Lisbon',         fr: 'Lisbonne',       c_en: 'Portugal',       c_fr: 'Portugal',       vibe: ['sunset', 'ocean', 'acoustic', 'historic'] },
    { id: 'cairo',      code: 'CAI', en: 'Cairo',          fr: 'Le Caire',       c_en: 'Egypt',          c_fr: 'Égypte',         vibe: ['historic', 'sunset', 'cozy', 'food'] }
  ];

  const SOUL_QUESTIONS = [
    {
      q_en: '1/5 · Your ideal Saturday night?',
      q_fr: '1/5 · Votre samedi soir idéal ?',
      opts: [
        { en: '🌃 Neon rooftops & skyline views', fr: '🌃 Toits néon & gratte-ciels', tags: ['neon', 'skyline'] },
        { en: '☕ Candlelit café & live jazz',    fr: '☕ Café tamisé & jazz en direct', tags: ['cafe', 'romantic'] },
        { en: '🍷 Cozy old town & hidden gems',   fr: '🍷 Vieille ville & lieux secrets', tags: ['cozy', 'historic'] },
        { en: '🌊 Ocean breeze & beach sunset',   fr: '🌊 Brise marine & coucher de soleil', tags: ['beach', 'ocean'] }
      ]
    },
    {
      q_en: '2/5 · Pick your focus soundtrack:',
      q_fr: '2/5 · Choisissez votre bande-son :',
      opts: [
        { en: '🎧 Rainy Cyber Lo-Fi beats',       fr: '🎧 Rythmes Cyber Lo-Fi & pluie', tags: ['lofi', 'rain'] },
        { en: '🎹 Classic piano & cinema scores', fr: '🎹 Piano classique & cinéma',      tags: ['romantic', 'luxury'] },
        { en: '🎸 Indie pulse & creative vibes',  fr: '🎸 Indie moderne & créativité',    tags: ['indie', 'creative'] },
        { en: '🎶 Warm acoustic & sunset lounge', fr: '🎶 Acoustique & lounge d’été',     tags: ['acoustic', 'sunset'] }
      ]
    },
    {
      q_en: '3/5 · Architecture that gives you chills:',
      q_fr: '3/5 · L’architecture qui vous fascine :',
      opts: [
        { en: '🏙️ Futuristic glass towers',       fr: '🏙️ Tours de verre futuristes',    tags: ['skyline', 'tech'] },
        { en: '🏛️ Timeless Belle Époque & arches',fr: '🏛️ Boulevards & arches historiques',tags: ['historic', 'romantic'] },
        { en: '🏡 Colorful streets & cozy canals',fr: '🏡 Rues colorées & canaux',         tags: ['cozy', 'creative'] },
        { en: '🛥️ Riviera luxury & marinas',      fr: '🛥️ Luxe Riviera & marinas',       tags: ['luxury', 'ocean'] }
      ]
    },
    {
      q_en: '4/5 · Weather that inspires you most:',
      q_fr: '4/5 · La météo qui vous inspire le plus :',
      opts: [
        { en: '🌧️ Electric midnight rain',        fr: '🌧️ Pluie électrique de minuit',   tags: ['rain', 'neon'] },
        { en: '🌅 Golden-hour Mediterranean sun', fr: '🌅 Soleil doré de fin de journée',tags: ['sunset', 'beach'] },
        { en: '🍂 Crisp autumn coffee air',       fr: '🍂 Air frais d’automne & café',   tags: ['autumn', 'cafe'] },
        { en: '✨ Clear starlit sky over water',  fr: '✨ Ciel étoilé au bord de l’eau', tags: ['ocean', 'luxury'] }
      ]
    },
    {
      q_en: '5/5 · Your #1 travel superpower:',
      q_fr: '5/5 · Votre super-pouvoir de voyage :',
      opts: [
        { en: '🍜 Finding the best local food',   fr: '🍜 Dénicher la meilleure cuisine',tags: ['food', 'cozy'] },
        { en: '📸 Capturing iconic skylines',     fr: '📸 Capturer des skylines épiques',tags: ['skyline', 'neon'] },
        { en: '🕰️ Exploring 100-year history',    fr: '🕰️ Explorer 100 ans d’histoire',  tags: ['historic', 'cafe'] },
        { en: '⚡ Discovering future-tech hubs',  fr: '⚡ Découvrir les pôles tech',     tags: ['tech', 'creative'] }
      ]
    }
  ];

  const ARCHETYPES = {
    neon:     { en: 'NEON VISIONARY',      fr: 'VISIONNAIRE NÉON',       bio_en: 'Energized by electric nights, innovation & midnight skylines.', bio_fr: 'Inspiré par les nuits électriques, l’innovation et les skylines.' },
    romantic: { en: 'MIDNIGHT ROMANTIC',   fr: 'ROMANTIQUE DE MINUIT',   bio_en: 'Drawn to timeless beauty, art, cafés & golden avenues.',        bio_fr: 'Attiré par l’élégance intemporelle, l’art et les avenues dorées.' },
    historic: { en: 'TIMELESS STORYTELLER',fr: 'CONTEUR INTEMPOREL',     bio_en: 'You feel the soul of a city through its architecture & heritage.',bio_fr: 'Vous ressentez l’âme d’une ville à travers son histoire.' },
    beach:    { en: 'HORIZON CHASER',      fr: 'CHASSEUR D’HORIZONS',    bio_en: 'Fueled by ocean light, warmth, music & effortless freedom.',    bio_fr: 'Nourri par la lumière marine, la chaleur et la liberté.' },
    luxury:   { en: 'SOVEREIGN AESTHETE',  fr: 'ESTHÈTE SOUVERAIN',      bio_en: 'Refined taste for elegance, panoramas & world-class craft.',    bio_fr: 'Goût raffiné pour l’élégance, les panoramas et l’excellence.' },
    creative: { en: 'CREATIVE NOMAD',      fr: 'NOMADE CRÉATIF',         bio_en: 'Thriving where culture, indie music & bold ideas collide.',     bio_fr: 'Épanoui là où la culture, la musique et les idées se rencontrent.' }
  };

  function getLang() {
    return (typeof REMO_I18N !== 'undefined' && REMO_I18N.getLang) ? REMO_I18N.getLang() : 'en';
  }

  function cityName(c, lang) {
    return lang === 'fr' ? c.fr : c.en;
  }

  function cityCountry(c, lang) {
    return lang === 'fr' ? c.c_fr : c.c_en;
  }

  function getCachedImg(url, onLoad) {
    if (!window._remoViralImgCache) window._remoViralImgCache = {};
    const cache = window._remoViralImgCache;
    if (cache[url]) {
      const e = cache[url];
      if (e.loaded && e.img.naturalWidth > 0) return e.img;
      if (!e.failed && onLoad) e.cbs.push(onLoad);
      return null;
    }
    const img = new Image();
    const e = { img, loaded: false, failed: false, cbs: onLoad ? [onLoad] : [] };
    cache[url] = e;
    img.onload = () => { e.loaded = true; e.cbs.splice(0).forEach((fn) => { try { fn(); } catch (_) {} }); };
    img.onerror = () => { e.failed = true; e.cbs.length = 0; };
    img.src = url;
    return null;
  }

  function drawCover(ctx, img, dx, dy, dw, dh) {
    if (!img || !img.naturalWidth) return;
    const s = Math.max(dw / img.naturalWidth, dh / img.naturalHeight);
    const sw = dw / s, sh = dh / s;
    ctx.drawImage(img, (img.naturalWidth - sw) / 2, (img.naturalHeight - sh) / 2, sw, sh, dx, dy, dw, dh);
  }

  function ensureRoundRect(ctx) {
    if (typeof ctx.roundRect !== 'function') {
      ctx.roundRect = function (x, y, w, h, radii) {
        const r = Array.isArray(radii) ? radii[0] : (radii || 0);
        this.moveTo(x + r, y); this.lineTo(x + w - r, y);
        this.quadraticCurveTo(x + w, y, x + w, y + r);
        this.lineTo(x + w, y + h - r);
        this.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        this.lineTo(x + r, y + h);
        this.quadraticCurveTo(x, y + h, x, y + h - r);
        this.lineTo(x, y + r);
        this.quadraticCurveTo(x, y, x + r, y);
      };
    }
  }

  function getUserRefMeta() {
    const u = (typeof REMO_STORE !== 'undefined' && REMO_STORE.getCurrentUser) ? REMO_STORE.getCurrentUser() : null;
    const code = (u && u.referralCode) ? u.referralCode : 'REMO-0001';
    const name = (u && u.name && !/^Guest/i.test(u.name)) ? u.name : '';
    return { code, name };
  }

  function saveCanvasPng(cv, filename) {
    if (typeof downloadCanvasAsPNG === 'function') {
      downloadCanvasAsPNG(cv, filename);
      return;
    }
    const a = document.createElement('a');
    a.download = filename;
    a.href = cv.toDataURL('image/png');
    a.click();
  }

  async function shareCanvasStory(cv, filename, title, text, url) {
    saveCanvasPng(cv, filename);
    if (typeof copyTextToClipboard === 'function') copyTextToClipboard(url);
    if (navigator.share) {
      try {
        const blob = await new Promise((res) => cv.toBlob(res, 'image/png'));
        if (blob) {
          const file = new File([blob], filename, { type: 'image/png' });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({ files: [file], title, text: `${text} ${url}` });
            return;
          }
        }
        await navigator.share({ title, text, url });
        return;
      } catch (err) {
        if (err && err.name === 'AbortError') return;
      }
    }
    if (typeof remoToast === 'function') {
      remoToast(getLang() === 'fr' ? '📥 Story HD téléchargée & lien copié !' : '📥 HD Story saved & link copied!', 'fanfare');
    }
  }

  /* ══════════════════════════════════════════════════════════════════
     1. 🌍 MY TRAVEL SCORE (X / 24 WORLD CITIES) — STORY GENERATOR
     ══════════════════════════════════════════════════════════════════ */
  const TS_KEY = 'remo_visited_cities_v1';
  let tsVisited = new Set();
  let tsDream = 'tokyo';

  function loadTravelState() {
    try {
      const saved = JSON.parse(localStorage.getItem(TS_KEY) || 'null');
      if (saved && Array.isArray(saved.visited)) tsVisited = new Set(saved.visited);
      else tsVisited = new Set(['montreal', 'paris', 'chisinau']);
      if (saved && saved.dream) tsDream = saved.dream;
    } catch (_) {
      tsVisited = new Set(['montreal', 'paris', 'chisinau']);
    }
  }
  function saveTravelState() {
    try {
      localStorage.setItem(TS_KEY, JSON.stringify({ visited: Array.from(tsVisited), dream: tsDream }));
    } catch (_) {}
  }

  function getTravelRank(count, lang) {
    if (count >= 20) return lang === 'fr' ? 'LÉGENDE PLANÉTAIRE' : 'PLANETARY LEGEND';
    if (count >= 12) return lang === 'fr' ? 'EXPLORATEUR ÉLITE' : 'ELITE GLOBETROTTER';
    if (count >= 6)  return lang === 'fr' ? 'NOMADE MONDIAL'    : 'WORLD NOMAD';
    if (count >= 3)  return lang === 'fr' ? 'VOYAGEUR 4D'       : '4D EXPLORER';
    return lang === 'fr' ? 'DÉCOLLAGE IMMINENT' : 'READY FOR TAKEOFF';
  }

  function ensureTravelModal() {
    if (document.getElementById('travelScoreModal')) return;
    const wrap = document.createElement('div');
    wrap.className = 'remo-modal-backdrop';
    wrap.id = 'travelScoreModal';
    wrap.onclick = (e) => { if (e.target === wrap) closeTravelScoreModal(); };
    wrap.innerHTML = `
      <div class="remo-modal" style="max-width:480px;text-align:center;">
        <div class="modal-hdr">
          <b id="tsModalTitle" style="font-family:'Orbitron',sans-serif;color:#38bdf8;font-size:0.95rem;">🌍 My Travel Score (24 World Cities)</b>
          <button class="modal-close" onclick="closeTravelScoreModal()">✕</button>
        </div>
        <p id="tsModalSub" style="font-size:0.78rem;color:var(--muted);margin-bottom:10px;"></p>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;">
          <input type="text" id="tsNameInput" maxlength="22" class="remo-input" style="padding:7px 10px;font-size:0.8rem;width:100%;" oninput="drawTravelScoreCanvas()">
          <select id="tsDreamSelect" class="remo-input" style="padding:7px 10px;font-size:0.8rem;width:100%;" onchange="onTravelDreamChanged(this.value)"></select>
        </div>

        <div id="tsChecklistGrid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:5px;margin-bottom:10px;max-height:175px;overflow-y:auto;padding:2px;"></div>

        <div style="display:flex;justify-content:center;margin-bottom:11px;">
          <canvas id="tsCanvasPreview" style="width:100%;max-width:230px;aspect-ratio:9/16;border-radius:16px;border:2px solid rgba(56,189,248,0.5);box-shadow:0 14px 36px rgba(0,0,0,0.85);"></canvas>
        </div>

        <div style="display:flex;flex-direction:column;gap:7px;">
          <button type="button" id="tsShareBtn" class="btn-cyber" style="width:100%;justify-content:center;padding:10px;background:linear-gradient(135deg,#0284c7,#06b6d4);color:#fff;" onclick="shareTravelScoreStory()"></button>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;">
            <button type="button" id="tsDlBtn" class="btn-cyber btn-gold" style="justify-content:center;padding:8px 6px;font-size:0.75rem;" onclick="downloadTravelScorePNG()"></button>
            <button type="button" class="btn-cyber" style="justify-content:center;padding:8px 6px;font-size:0.75rem;background:linear-gradient(135deg,#16a34a,#22c55e);color:#fff;" onclick="shareTravelScoreWhatsApp()">💬 WhatsApp</button>
            <button type="button" id="tsCopyBtn" class="btn-ghost" style="justify-content:center;padding:8px 6px;font-size:0.75rem;border-color:#38bdf8;color:#7dd3fc;" onclick="copyTravelScoreLink()"></button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(wrap);
  }

  function renderTravelControls() {
    const lang = getLang();
    document.getElementById('tsModalTitle').textContent = lang === 'fr' ? '🌍 Mon Score Voyage (24 Villes)' : '🌍 My Travel Score (24 Cities)';
    document.getElementById('tsModalSub').textContent = lang === 'fr'
      ? 'Cochez les villes déjà visitées et générez votre Story 9:16 pour Instagram, TikTok & WhatsApp !'
      : 'Check the cities you’ve visited & generate your HD 9:16 Story for Instagram, TikTok & WhatsApp!';
    document.getElementById('tsNameInput').placeholder = lang === 'fr' ? '✍️ Votre nom (optionnel)...' : '✍️ Your name (optional)...';
    document.getElementById('tsShareBtn').textContent = lang === 'fr' ? '📲 Partager ma Story (Insta / TikTok)' : '📲 Share My Story (Insta / TikTok)';
    document.getElementById('tsDlBtn').textContent = '📥 HD (.PNG)';
    document.getElementById('tsCopyBtn').textContent = lang === 'fr' ? '🔗 Lien' : '🔗 Link';

    const sel = document.getElementById('tsDreamSelect');
    sel.innerHTML = CITIES_24.map((c) =>
      `<option value="${c.id}" ${c.id === tsDream ? 'selected' : ''}>${lang === 'fr' ? '✨ Rêve : ' : '✨ Dream: '}${cityName(c, lang)}</option>`
    ).join('');

    const grid = document.getElementById('tsChecklistGrid');
    grid.innerHTML = CITIES_24.map((c) => {
      const on = tsVisited.has(c.id);
      return `<button type="button" onclick="toggleTravelCity('${c.id}')" style="padding:5px 6px;border-radius:9px;font-size:0.72rem;font-weight:800;cursor:pointer;border:1px solid ${on ? '#10b981' : 'rgba(255,255,255,0.14)'};background:${on ? 'rgba(16,185,129,0.22)' : 'rgba(15,23,42,0.85)'};color:${on ? '#6ee7b7' : '#cbd5e1'};text-align:left;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${on ? '✓ ' : '+ '}${cityName(c, lang)}</button>`;
    }).join('');
  }

  function drawTravelScoreCanvas() {
    const cv = document.getElementById('tsCanvasPreview');
    if (!cv) return;
    cv.width = 1080;
    cv.height = 1920;
    const ctx = cv.getContext('2d');
    ensureRoundRect(ctx);

    const lang = getLang();
    const count = tsVisited.size;
    const pct = Math.round((count / 24) * 100);
    const dreamCity = CITIES_24.find((c) => c.id === tsDream) || CITIES_24[5];
    const meta = getUserRefMeta();
    const inp = document.getElementById('tsNameInput');
    const who = (inp && inp.value.trim()) ? inp.value.trim().toUpperCase() : (meta.name ? `@${meta.name}` : (lang === 'fr' ? 'EXPLORATEUR 4D' : '4D EXPLORER'));

    const seq = (cv._tsSeq = (cv._tsSeq || 0) + 1);
    const dreamImg = getCachedImg(`img/cities/${dreamCity.id}.jpg`, () => {
      if (cv._tsSeq === seq) drawTravelScoreCanvas();
    });

    // Dark luxury gradient background
    const bg = ctx.createLinearGradient(0, 0, 1080, 1920);
    bg.addColorStop(0, '#040814');
    bg.addColorStop(0.5, '#0b1633');
    bg.addColorStop(1, '#030712');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 1080, 1920);

    // Outer frame
    ctx.strokeStyle = 'rgba(56,189,248,0.55)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(42, 42, 996, 1836, 40);
    ctx.stroke();

    // Header pill
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(250,204,21,0.16)';
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(230, 86, 620, 54, 27);
    ctx.fill();
    ctx.stroke();
    ctx.font = '900 22px "Orbitron", sans-serif';
    ctx.fillStyle = '#fde047';
    ctx.fillText('REMO WORLD · 2026 TRAVEL SCORE', 540, 121);

    ctx.font = '900 48px "Orbitron", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(who.slice(0, 20), 540, 205);

    // Circular Progress Gauge
    const cx = 540, cy = 375, r = 128;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 18;
    ctx.stroke();

    const startA = -Math.PI / 2;
    const endA = startA + Math.PI * 2 * (count / 24);
    const arcGrad = ctx.createLinearGradient(cx - r, cy, cx + r, cy);
    arcGrad.addColorStop(0, '#38bdf8');
    arcGrad.addColorStop(0.5, '#10b981');
    arcGrad.addColorStop(1, '#facc15');
    ctx.beginPath();
    ctx.arc(cx, cy, r, startA, Math.max(startA + 0.08, endA));
    ctx.strokeStyle = arcGrad;
    ctx.lineWidth = 18;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.lineCap = 'butt';

    ctx.font = '900 68px "Orbitron", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${count}/24`, cx, cy + 14);
    ctx.font = '800 24px "Outfit", sans-serif';
    ctx.fillStyle = '#10b981';
    ctx.fillText(`${pct}% ${lang === 'fr' ? 'EXPLORÉ' : 'EXPLORED'}`, cx, cy + 54);

    ctx.font = '900 24px "Orbitron", sans-serif';
    ctx.fillStyle = '#fde047';
    ctx.fillText(`★ ${getTravelRank(count, lang)} ★`, 540, 552);

    // 24-City Checklist Grid (3 columns x 8 rows)
    const gx0 = 78, gy0 = 590, colW = 296, gapX = 18, rowH = 66, gapY = 12;
    CITIES_24.forEach((c, idx) => {
      const col = idx % 3;
      const row = Math.floor(idx / 3);
      const x = gx0 + col * (colW + gapX);
      const y = gy0 + row * (rowH + gapY);
      const on = tsVisited.has(c.id);

      ctx.fillStyle = on ? 'rgba(16,185,129,0.22)' : 'rgba(15,23,42,0.72)';
      ctx.strokeStyle = on ? '#10b981' : 'rgba(148,163,184,0.22)';
      ctx.lineWidth = on ? 2.5 : 1.5;
      ctx.beginPath();
      ctx.roundRect(x, y, colW, rowH, 16);
      ctx.fill();
      ctx.stroke();

      ctx.textAlign = 'left';
      ctx.font = '800 22px "Outfit", sans-serif';
      ctx.fillStyle = on ? '#6ee7b7' : '#64748b';
      ctx.fillText(on ? '✓' : '○', x + 18, y + 41);

      ctx.fillStyle = on ? '#ffffff' : '#94a3b8';
      ctx.font = on ? '800 22px "Outfit", sans-serif' : '600 21px "Outfit", sans-serif';
      ctx.fillText(cityName(c, lang).slice(0, 13), x + 48, y + 41);

      ctx.textAlign = 'right';
      ctx.font = '700 16px monospace';
      ctx.fillStyle = on ? '#fde047' : '#475569';
      ctx.fillText(c.code, x + colW - 14, y + 40);
    });

    // Dream Next City Real Photo Banner
    const dy = 1236, dw = 924, dh = 290, dx = 78;
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(dx, dy, dw, dh, 26);
    ctx.clip();
    if (dreamImg) {
      drawCover(ctx, dreamImg, dx, dy, dw, dh);
    } else {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(dx, dy, dw, dh);
    }
    const dg = ctx.createLinearGradient(0, dy, 0, dy + dh);
    dg.addColorStop(0, 'rgba(4,8,20,0.45)');
    dg.addColorStop(1, 'rgba(4,8,20,0.88)');
    ctx.fillStyle = dg;
    ctx.fillRect(dx, dy, dw, dh);
    ctx.restore();

    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(dx, dy, dw, dh, 26);
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.font = '800 20px "Orbitron", sans-serif';
    ctx.fillStyle = '#fde047';
    ctx.fillText(lang === 'fr' ? '✈️ PROCHAINE DESTINATION DE RÊVE' : '✈️ DREAM NEXT DESTINATION', 540, dy + 178);
    ctx.font = '900 54px "Orbitron", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${cityName(dreamCity, lang).toUpperCase()} (${dreamCity.code})`, 540, dy + 244);

    // Footer CTA + QR
    const fy = 1564;
    const shareUrl = `https://remoworld.com/?open=travelmap&ref=${encodeURIComponent(meta.code)}`;
    if (typeof RemoQREngine !== 'undefined' && RemoQREngine.toCanvas) {
      try {
        ctx.drawImage(RemoQREngine.toCanvas(shareUrl, 230), 102, fy, 230, 230);
      } catch (_) {}
    }

    ctx.textAlign = 'left';
    ctx.font = '900 30px "Orbitron", sans-serif';
    ctx.fillStyle = '#fde047';
    ctx.fillText(lang === 'fr' ? 'ET VOUS ? COMBIEN / 24 ?' : 'HOW MANY HAVE YOU VISITED?', 372, fy + 64);
    ctx.font = '800 26px "Outfit", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('remoworld.com/?open=travelmap', 372, fy + 122);
    ctx.font = '700 22px "Outfit", sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(lang === 'fr' ? 'Gratuit · 24 Villes 4D · 56 Radios Live' : 'Free · 24 World Cities 4D · 56 Live Radios', 372, fy + 174);
    ctx.fillStyle = '#10b981';
    ctx.fillText(lang === 'fr' ? '✓ +150 🪙 bonus de bienvenue' : '✓ +150 🪙 welcome bonus', 372, fy + 216);
  }

  function openTravelScoreModal() {
    loadTravelState();
    ensureTravelModal();
    renderTravelControls();
    const m = document.getElementById('travelScoreModal');
    if (m) m.classList.add('open');
    drawTravelScoreCanvas();
  }

  function closeTravelScoreModal() {
    const m = document.getElementById('travelScoreModal');
    if (m) m.classList.remove('open');
  }

  function toggleTravelCity(id) {
    if (tsVisited.has(id)) tsVisited.delete(id);
    else tsVisited.add(id);
    saveTravelState();
    renderTravelControls();
    drawTravelScoreCanvas();
  }

  function onTravelDreamChanged(id) {
    tsDream = id;
    saveTravelState();
    drawTravelScoreCanvas();
  }

  function downloadTravelScorePNG() {
    const cv = document.getElementById('tsCanvasPreview');
    if (cv) saveCanvasPng(cv, `REMO_Travel_Score_${tsVisited.size}of24.png`);
  }

  function shareTravelScoreStory() {
    const cv = document.getElementById('tsCanvasPreview');
    const lang = getLang();
    const meta = getUserRefMeta();
    const url = `https://remoworld.com/?open=travelmap&ref=${encodeURIComponent(meta.code)}`;
    const txt = lang === 'fr'
      ? `🌍 Mon Score Voyage REMO : ${tsVisited.size}/24 villes visitées ! Et toi, combien sur 24 ? Crée ta Story gratuite :`
      : `🌍 My REMO World Travel Score: ${tsVisited.size}/24 cities visited! How many have you been to? Make your free Story:`;
    if (cv) shareCanvasStory(cv, `REMO_Travel_Score_${tsVisited.size}of24.png`, 'REMO Travel Score', txt, url);
  }

  function shareTravelScoreWhatsApp() {
    const lang = getLang();
    const meta = getUserRefMeta();
    const url = `https://remoworld.com/?open=travelmap&ref=${encodeURIComponent(meta.code)}`;
    const msg = lang === 'fr'
      ? `🌍 Mon Score Voyage REMO : ${tsVisited.size}/24 villes du monde visitées ! Combien en as-tu visité ? Fais ton card gratuit ici : ${url}`
      : `🌍 My REMO World Travel Score: ${tsVisited.size}/24 world cities visited! Beat my score & make your free card here: ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
  }

  function copyTravelScoreLink() {
    const meta = getUserRefMeta();
    const url = `https://remoworld.com/?open=travelmap&ref=${encodeURIComponent(meta.code)}`;
    if (typeof copyTextToClipboard === 'function') copyTextToClipboard(url);
    else if (navigator.clipboard) navigator.clipboard.writeText(url).catch(() => {});
    if (typeof remoToast === 'function') remoToast(getLang() === 'fr' ? '🔗 Lien copié !' : '🔗 Link copied!', 'coin');
  }

  /* ══════════════════════════════════════════════════════════════════
     2. 🧠 WHICH WORLD CITY MATCHES YOUR SOUL? (5-Q QUIZ + 9:16 STORY)
     ══════════════════════════════════════════════════════════════════ */
  let soulStep = 0;
  let soulPickedTags = [];
  let soulResult = null;

  function ensureSoulModal() {
    if (document.getElementById('soulCityModal')) return;
    const wrap = document.createElement('div');
    wrap.className = 'remo-modal-backdrop';
    wrap.id = 'soulCityModal';
    wrap.onclick = (e) => { if (e.target === wrap) closeSoulCityModal(); };
    wrap.innerHTML = `
      <div class="remo-modal" style="max-width:460px;text-align:center;">
        <div class="modal-hdr">
          <b id="soulModalTitle" style="font-family:'Orbitron',sans-serif;color:#facc15;font-size:0.95rem;">🧠 Which City Matches Your Soul?</b>
          <button class="modal-close" onclick="closeSoulCityModal()">✕</button>
        </div>
        <div id="soulQuizStage"></div>
        <div id="soulResultStage" style="display:none;">
          <input type="text" id="soulNameInput" maxlength="22" class="remo-input" style="padding:7px 10px;font-size:0.8rem;width:100%;margin-bottom:10px;" oninput="drawSoulCityCanvas()">
          <div style="display:flex;justify-content:center;margin-bottom:11px;">
            <canvas id="soulCanvasPreview" style="width:100%;max-width:240px;aspect-ratio:9/16;border-radius:16px;border:2px solid rgba(250,204,21,0.55);box-shadow:0 16px 38px rgba(0,0,0,0.85);"></canvas>
          </div>
          <div style="display:flex;flex-direction:column;gap:7px;">
            <button type="button" id="soulShareBtn" class="btn-cyber" style="width:100%;justify-content:center;padding:10px;background:linear-gradient(135deg,#0284c7,#06b6d4);color:#fff;" onclick="shareSoulCityStory()"></button>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;">
              <button type="button" class="btn-cyber btn-gold" style="justify-content:center;padding:8px 6px;font-size:0.75rem;" onclick="downloadSoulCityPNG()">📥 HD (.PNG)</button>
              <button type="button" class="btn-cyber" style="justify-content:center;padding:8px 6px;font-size:0.75rem;background:linear-gradient(135deg,#16a34a,#22c55e);color:#fff;" onclick="shareSoulCityWhatsApp()">💬 WhatsApp</button>
              <button type="button" id="soulRetakeBtn" class="btn-ghost" style="justify-content:center;padding:8px 6px;font-size:0.75rem;border-color:#facc15;color:#fde047;" onclick="restartSoulCityQuiz()">↺ Retake</button>
            </div>
          </div>
        </div>
      </div>`;
    document.body.appendChild(wrap);
  }

  function renderSoulQuestion() {
    const lang = getLang();
    document.getElementById('soulModalTitle').textContent = lang === 'fr' ? '🧠 Quelle Ville Est Votre Âme Sœur ?' : '🧠 Which City Matches Your Soul?';
    const qStage = document.getElementById('soulQuizStage');
    const rStage = document.getElementById('soulResultStage');
    qStage.style.display = 'block';
    rStage.style.display = 'none';

    const q = SOUL_QUESTIONS[soulStep];
    const pct = Math.round(((soulStep) / SOUL_QUESTIONS.length) * 100);
    qStage.innerHTML = `
      <div style="height:6px;background:rgba(255,255,255,0.08);border-radius:99px;overflow:hidden;margin-bottom:14px;">
        <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,#38bdf8,#facc15);transition:width .25s;"></div>
      </div>
      <div style="font-size:1.05rem;font-weight:900;color:#fff;margin-bottom:14px;">${lang === 'fr' ? q.q_fr : q.q_en}</div>
      <div style="display:flex;flex-direction:column;gap:9px;margin-bottom:8px;">
        ${q.opts.map((o, idx) => `
          <button type="button" onclick="pickSoulOption(${idx})" style="padding:13px 14px;border-radius:14px;background:rgba(15,23,42,0.92);border:1px solid rgba(56,189,248,0.35);color:#f8fafc;font-weight:800;font-size:0.9rem;text-align:left;cursor:pointer;transition:.15s;">
            ${lang === 'fr' ? o.fr : o.en}
          </button>`).join('')}
      </div>
      <div style="font-size:0.74rem;color:var(--muted);margin-top:8px;">${lang === 'fr' ? '20 secondes · Résultat HD Story 9:16 gratuit' : '20 seconds · Free HD 9:16 Story result'}</div>`;
  }

  function computeSoulMatch() {
    const tagCounts = {};
    soulPickedTags.forEach((t) => { tagCounts[t] = (tagCounts[t] || 0) + 1; });

    let bestCity = CITIES_24[5];
    let bestScore = -1;
    CITIES_24.forEach((c, idx) => {
      let sc = 0;
      c.vibe.forEach((v, vi) => {
        if (tagCounts[v]) sc += tagCounts[v] * (vi === 0 ? 3.2 : 2.1);
      });
      // Deterministic tiny tie-breaker from picked tag signature so all 24 cities are reachable
      const sig = soulPickedTags.reduce((acc, s, k) => acc + s.charCodeAt(0) * (k + 3), 0);
      sc += ((sig + idx * 7) % 13) * 0.04;
      if (sc > bestScore) { bestScore = sc; bestCity = c; }
    });

    const primaryTag = bestCity.vibe[0];
    const archKey = ARCHETYPES[primaryTag] ? primaryTag : (primaryTag === 'skyline' ? 'neon' : (primaryTag === 'cozy' ? 'historic' : (primaryTag === 'ocean' ? 'beach' : 'creative')));
    const matchPct = Math.min(98, Math.max(89, Math.round(88 + Math.min(10, bestScore * 0.9))));
    return { city: bestCity, archetype: ARCHETYPES[archKey], matchPct };
  }

  function pickSoulOption(optIdx) {
    const q = SOUL_QUESTIONS[soulStep];
    if (q && q.opts[optIdx]) soulPickedTags.push(...q.opts[optIdx].tags);
    soulStep++;
    if (soulStep < SOUL_QUESTIONS.length) {
      renderSoulQuestion();
    } else {
      soulResult = computeSoulMatch();
      showSoulResult();
    }
  }

  function showSoulResult() {
    const lang = getLang();
    document.getElementById('soulQuizStage').style.display = 'none';
    document.getElementById('soulResultStage').style.display = 'block';
    document.getElementById('soulNameInput').placeholder = lang === 'fr' ? '✍️ Votre nom sur la Story (optionnel)...' : '✍️ Your name on Story (optional)...';
    document.getElementById('soulShareBtn').textContent = lang === 'fr' ? '📲 Partager ma Ville Âme Sœur' : '📲 Share My Soul City Story';
    document.getElementById('soulRetakeBtn').textContent = lang === 'fr' ? '↺ Refaire' : '↺ Retake';
    drawSoulCityCanvas();
  }

  function drawSoulCityCanvas() {
    const cv = document.getElementById('soulCanvasPreview');
    if (!cv || !soulResult) return;
    cv.width = 1080;
    cv.height = 1920;
    const ctx = cv.getContext('2d');
    ensureRoundRect(ctx);

    const lang = getLang();
    const { city, archetype, matchPct } = soulResult;
    const meta = getUserRefMeta();
    const inp = document.getElementById('soulNameInput');
    const who = (inp && inp.value.trim()) ? inp.value.trim().toUpperCase() : (meta.name ? `@${meta.name}` : '');

    const seq = (cv._soulSeq = (cv._soulSeq || 0) + 1);
    const cityImg = getCachedImg(`img/cities/${city.id}.jpg`, () => {
      if (cv._soulSeq === seq) drawSoulCityCanvas();
    });

    // Full-bleed real city photography background!
    ctx.fillStyle = '#050914';
    ctx.fillRect(0, 0, 1080, 1920);
    if (cityImg) drawCover(ctx, cityImg, 0, 0, 1080, 1920);

    // Rich top & bottom cinematic vignettes
    const topG = ctx.createLinearGradient(0, 0, 0, 560);
    topG.addColorStop(0, 'rgba(4,8,20,0.92)');
    topG.addColorStop(1, 'rgba(4,8,20,0)');
    ctx.fillStyle = topG;
    ctx.fillRect(0, 0, 1080, 560);

    const botG = ctx.createLinearGradient(0, 860, 0, 1920);
    botG.addColorStop(0, 'rgba(4,8,20,0)');
    botG.addColorStop(0.42, 'rgba(4,8,20,0.88)');
    botG.addColorStop(1, 'rgba(4,8,20,0.97)');
    ctx.fillStyle = botG;
    ctx.fillRect(0, 860, 1080, 1060);

    // Luxury border
    ctx.strokeStyle = 'rgba(250,204,21,0.75)';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.roundRect(42, 42, 996, 1836, 42);
    ctx.stroke();

    // Header badge
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(8,14,32,0.86)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(210, 96, 660, 58, 29);
    ctx.fill();
    ctx.stroke();
    ctx.font = '900 24px "Orbitron", sans-serif';
    ctx.fillStyle = '#7dd3fc';
    ctx.fillText(lang === 'fr' ? 'REMO WORLD · TEST VILLE ÂME SŒUR' : 'REMO WORLD · SOUL CITY MATCH', 540, 134);

    if (who) {
      ctx.font = '800 32px "Orbitron", sans-serif';
      ctx.fillStyle = '#fde047';
      ctx.fillText(who.slice(0, 22), 540, 224);
    }

    // Center Match Percentage Medallion
    const my = 1045;
    ctx.save();
    ctx.shadowColor = 'rgba(250,204,21,0.55)';
    ctx.shadowBlur = 32;
    ctx.fillStyle = 'rgba(6,12,28,0.92)';
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(540, my, 114, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    ctx.font = '900 66px "Orbitron", sans-serif';
    ctx.fillStyle = '#fde047';
    ctx.fillText(`${matchPct}%`, 540, my + 12);
    ctx.font = '800 20px "Orbitron", sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('SOUL MATCH', 540, my + 52);

    // City Result Title
    ctx.font = '900 92px "Orbitron", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(cityName(city, lang).toUpperCase(), 540, 1264);

    ctx.font = '800 32px "Orbitron", sans-serif';
    ctx.fillStyle = '#fde047';
    ctx.fillText(`${cityCountry(city, lang).toUpperCase()}  •  ${city.code}`, 540, 1322);

    // Archetype Glass Card
    ctx.fillStyle = 'rgba(10,18,38,0.88)';
    ctx.strokeStyle = 'rgba(56,189,248,0.6)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(88, 1364, 904, 152, 26);
    ctx.fill();
    ctx.stroke();

    ctx.font = '900 30px "Orbitron", sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`✨ ${lang === 'fr' ? archetype.fr : archetype.en} ✨`, 540, 1418);

    ctx.font = '600 26px "Outfit", sans-serif';
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText(lang === 'fr' ? archetype.bio_fr : archetype.bio_en, 540, 1474);

    // Footer QR & CTA
    const fy = 1560;
    const shareUrl = `https://remoworld.com/?open=soulcity&ref=${encodeURIComponent(meta.code)}`;
    if (typeof RemoQREngine !== 'undefined' && RemoQREngine.toCanvas) {
      try { ctx.drawImage(RemoQREngine.toCanvas(shareUrl, 232), 100, fy, 232, 232); } catch (_) {}
    }

    ctx.textAlign = 'left';
    ctx.font = '900 29px "Orbitron", sans-serif';
    ctx.fillStyle = '#fde047';
    ctx.fillText(lang === 'fr' ? 'QUELLE EST VOTRE VILLE ?' : 'FIND YOUR SOUL CITY (20s)', 372, fy + 64);
    ctx.font = '800 26px "Outfit", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('remoworld.com/?open=soulcity', 372, fy + 120);
    ctx.font = '700 22px "Outfit", sans-serif';
    ctx.fillStyle = '#7dd3fc';
    ctx.fillText(lang === 'fr' ? '5 questions · 24 Villes · 100% Gratuit' : '5 Questions · 24 World Cities · 100% Free', 372, fy + 172);
    ctx.fillStyle = '#10b981';
    ctx.fillText(lang === 'fr' ? '✓ +150 🪙 bonus de bienvenue' : '✓ +150 🪙 welcome bonus', 372, fy + 216);
  }

  function openSoulCityModal() {
    ensureSoulModal();
    soulStep = 0;
    soulPickedTags = [];
    soulResult = null;
    renderSoulQuestion();
    const m = document.getElementById('soulCityModal');
    if (m) m.classList.add('open');
  }

  function closeSoulCityModal() {
    const m = document.getElementById('soulCityModal');
    if (m) m.classList.remove('open');
  }

  function restartSoulCityQuiz() {
    soulStep = 0;
    soulPickedTags = [];
    soulResult = null;
    renderSoulQuestion();
  }

  function downloadSoulCityPNG() {
    const cv = document.getElementById('soulCanvasPreview');
    if (cv && soulResult) saveCanvasPng(cv, `REMO_SoulCity_${soulResult.city.id}_${soulResult.matchPct}pct.png`);
  }

  function shareSoulCityStory() {
    const cv = document.getElementById('soulCanvasPreview');
    if (!cv || !soulResult) return;
    const lang = getLang();
    const meta = getUserRefMeta();
    const url = `https://remoworld.com/?open=soulcity&ref=${encodeURIComponent(meta.code)}`;
    const cName = cityName(soulResult.city, lang);
    const txt = lang === 'fr'
      ? `🧠 Ma Ville Âme Sœur sur REMO World : ${cName} (${soulResult.matchPct}% Match) ! Fais le test en 20s :`
      : `🧠 My REMO World Soul City is ${cName} (${soulResult.matchPct}% Match)! Take the 20s quiz:`;
    shareCanvasStory(cv, `REMO_SoulCity_${soulResult.city.id}.png`, 'REMO Soul City Quiz', txt, url);
  }

  function shareSoulCityWhatsApp() {
    if (!soulResult) return;
    const lang = getLang();
    const meta = getUserRefMeta();
    const url = `https://remoworld.com/?open=soulcity&ref=${encodeURIComponent(meta.code)}`;
    const cName = cityName(soulResult.city, lang);
    const msg = lang === 'fr'
      ? `🧠 Ma Ville Âme Sœur est ${cName} (${soulResult.matchPct}% Match) ! Découvre la tienne en 20 secondes (gratuit) : ${url}`
      : `🧠 My Soul City is ${cName} (${soulResult.matchPct}% Match)! Find yours in 20 seconds (free): ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
  }

  // Expose cleanly on window
  window.openTravelScoreModal = openTravelScoreModal;
  window.closeTravelScoreModal = closeTravelScoreModal;
  window.toggleTravelCity = toggleTravelCity;
  window.onTravelDreamChanged = onTravelDreamChanged;
  window.drawTravelScoreCanvas = drawTravelScoreCanvas;
  window.downloadTravelScorePNG = downloadTravelScorePNG;
  window.shareTravelScoreStory = shareTravelScoreStory;
  window.shareTravelScoreWhatsApp = shareTravelScoreWhatsApp;
  window.copyTravelScoreLink = copyTravelScoreLink;

  window.openSoulCityModal = openSoulCityModal;
  window.closeSoulCityModal = closeSoulCityModal;
  window.pickSoulOption = pickSoulOption;
  window.restartSoulCityQuiz = restartSoulCityQuiz;
  window.drawSoulCityCanvas = drawSoulCityCanvas;
  window.downloadSoulCityPNG = downloadSoulCityPNG;
  window.shareSoulCityStory = shareSoulCityStory;
  window.shareSoulCityWhatsApp = shareSoulCityWhatsApp;
})();
