/* ════════════════════════════════════════════════════════════════════
   🧠 REMO DAILY WORLD BLITZ — 60s Deterministic Global City Challenge
   Zero External Photos · Same 5 Daily Cities Worldwide (UTC Seeded)
   Strictly Bilingual (EN / FR) · Zero Account Required
   ════════════════════════════════════════════════════════════════════ */

(function () {
  if (typeof window === 'undefined') return;

  const STORAGE_KEY = 'remo_world_blitz_v1';
  const GUEST_COINS_KEY = 'remo_guest_blitz_coins';
  const ROUNDS_COUNT = 5;
  const HINT_PENALTY_MS = 3000;
  // Launch anchor UTC midnight: 2026-11-12 = Blitz #1
  const EPOCH_DAY_INDEX = Math.floor(Date.UTC(2026, 10, 12) / 86400000);

  const CUSTOM_LANDMARK_IDS = new Set([
    'chisinau', 'montreal', 'paris', 'bucharest', 'newyork',
    'tokyo', 'dubai', 'london', 'rome', 'cairo', 'sydney'
  ]);

  const CONTINENT_FR = {
    'Europe': 'Europe',
    'North America': 'Amérique du Nord',
    'Asia': 'Asie',
    'Middle East': 'Moyen-Orient',
    'South America': 'Amérique du Sud',
    'Oceania': 'Océanie',
    'Africa': 'Afrique'
  };

  const state = {
    isOpen: false,
    dateKey: '',
    blitzNumber: 1,
    challenge: null,       // [{ city, options }]
    roundIdx: 0,
    results: [],           // ['G' | 'R']
    pickedIds: [],
    hintUsedInRound: false,
    hintsCount: 0,
    accumulatedMs: 0,
    roundStartedAt: 0,
    penaltyMs: 0,
    revealLock: false,
    phase: 'idle',         // 'playing' | 'done'
    finalResult: null,
    timerIntervalId: null,
    countdownIntervalId: null,
    rafId: null,
    stars: [],
    pulsePhase: 0,
    copiedRecently: false
  };

  /* ── 1. DETERMINISTIC DAILY SEED & UTILS ── */
  function getUtcDateKey(dateObj = new Date()) {
    const y = dateObj.getUTCFullYear();
    const m = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function getPrevUtcDateKey(dateKey) {
    const [y, m, d] = String(dateKey || getUtcDateKey()).split('-').map(Number);
    const prev = new Date(Date.UTC(y, m - 1, d) - 86400000);
    return getUtcDateKey(prev);
  }

  function getBlitzNumber(dateKey) {
    const [y, m, d] = String(dateKey || getUtcDateKey()).split('-').map(Number);
    const dayIdx = Math.floor(Date.UTC(y, m - 1, d) / 86400000);
    return Math.max(1, dayIdx - EPOCH_DAY_INDEX + 1);
  }

  function hashStr(str) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function shuffleWithRng(arr, rng) {
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      const tmp = copy[i];
      copy[i] = copy[j];
      copy[j] = tmp;
    }
    return copy;
  }

  function getCanonicalPool() {
    if (Array.isArray(window.REMO_DEFAULT_CITIES) && window.REMO_DEFAULT_CITIES.length >= ROUNDS_COUNT) {
      return window.REMO_DEFAULT_CITIES;
    }
    if (typeof window.getRemoCities === 'function') {
      return window.getRemoCities();
    }
    return [];
  }

  function buildDailyChallenge(dateKey) {
    const pool = getCanonicalPool();
    if (!pool.length) return [];
    const dk = dateKey || getUtcDateKey();
    const rng = mulberry32(hashStr(`remoworld-blitz::${dk}`));
    const shuffledPool = shuffleWithRng(pool, rng);
    const targets = shuffledPool.slice(0, Math.min(ROUNDS_COUNT, shuffledPool.length));

    return targets.map((target, rIdx) => {
      const rRng = mulberry32(hashStr(`${dk}::round-${rIdx}::${target.id}`));
      const others = pool.filter((c) => c.id !== target.id);
      const sameCont = shuffleWithRng(others.filter((c) => c.continent === target.continent), rRng);
      // Pair at least one same-continent distractor when available so clues matter
      const distractors = [];
      if (sameCont.length) distractors.push(sameCont[0]);
      const restPool = shuffleWithRng(others.filter((c) => !distractors.some((d) => d.id === c.id)), rRng);
      while (distractors.length < 3 && restPool.length) {
        distractors.push(restPool.shift());
      }
      const options = shuffleWithRng([target, ...distractors], rRng);
      return { city: target, options };
    });
  }

  function _lang() {
    return (window.REMO_I18N && window.REMO_I18N.getLang()) || 'en';
  }

  function _t(key, vars) {
    if (window.REMO_I18N && typeof window.REMO_I18N.t === 'function') {
      return window.REMO_I18N.t(key, vars);
    }
    return key;
  }

  function _esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function _cityName(city, lang) {
    if (typeof window.getCityName === 'function') return window.getCityName(city, lang);
    return lang === 'fr' ? (city.name_fr || city.name_en) : (city.name_en || city.name_fr);
  }

  function _cityCountry(city, lang) {
    if (typeof window.getCityCountry === 'function') return window.getCityCountry(city, lang);
    return lang === 'fr' ? (city.country_fr || city.country_en) : (city.country_en || city.country_fr);
  }

  function _cityTagline(city, lang) {
    if (typeof window.getCityTagline === 'function') return window.getCityTagline(city, lang);
    return lang === 'fr' ? (city.tagline_fr || city.tagline_en) : (city.tagline_en || city.tagline_fr);
  }

  function _continentName(continent, lang) {
    if (lang === 'fr') return CONTINENT_FR[continent] || continent;
    return continent;
  }

  function _getLiveWx(city) {
    if (window.REMO_WEATHER && typeof window.REMO_WEATHER.getCityLiveStatus === 'function') {
      return window.REMO_WEATHER.getCityLiveStatus(city);
    }
    return { icon: '🌙', tempC: 16, timeStr: '20:00', cond_en: 'Clear', cond_fr: 'Clair', isNight: true };
  }

  /* ── 2. PERSISTENCE & REWARDS ── */
  function loadSavedStore() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch (e) {}
    return { lastCompletedDate: '', streak: 0, bestTimeSec: null, playedCount: 0, todayResult: null };
  }

  function saveStore(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {}
  }

  function computeCoinsReward(score) {
    if (!score || score <= 0) return 0;
    return score * 5 + (score === ROUNDS_COUNT ? 5 : 0);
  }

  function _getElapsedMs() {
    const active = (state.phase === 'playing' && !state.revealLock && state.roundStartedAt > 0)
      ? Math.max(0, performance.now() - state.roundStartedAt)
      : 0;
    return state.accumulatedMs + active + state.penaltyMs;
  }

  function _formatSeconds(ms, oneDecimal = true) {
    const sec = Math.max(0.1, ms / 1000);
    return oneDecimal ? sec.toFixed(1) + 's' : Math.max(1, Math.round(sec)) + 's';
  }

  function buildShareText(resultObj, lang = _lang()) {
    const res = resultObj || state.finalResult;
    if (!res) return '';
    const score = (res.results || []).filter((r) => r === 'G').length;
    const grid = (res.results || []).map((r) => (r === 'G' ? '🟩' : '🟥')).join('');
    const roundedSec = Math.max(1, Math.round(Number(res.timeSec || 1)));
    const beatTxt = lang === 'fr' ? 'Bats mon chrono' : 'Beat my time';
    const url = 'https://remoworld.com/?open=blitz';
    return `🌐 REMO World Blitz #${res.num} — ${score}/${ROUNDS_COUNT} (${roundedSec}s)\n${grid}\n⚡ ${beatTxt}: ${url}`;
  }

  function _awardDailyCoins(rewardCoins) {
    if (!rewardCoins) return false;
    const u = window.REMO_STORE && typeof window.REMO_STORE.getCurrentUser === 'function'
      ? window.REMO_STORE.getCurrentUser()
      : null;
    if (u && u.uid && typeof window.REMO_STORE.addCoins === 'function') {
      window.REMO_STORE.addCoins(u.uid, rewardCoins, rewardCoins);
      if (typeof window.spawnRemoCoinsFX === 'function') window.spawnRemoCoinsFX(Math.min(12, Math.max(5, Math.round(rewardCoins / 2))));
      if (typeof window.syncHeaderAndSidebars === 'function') window.syncHeaderAndSidebars();
      return true;
    }
    try {
      const prevPending = Number(localStorage.getItem(GUEST_COINS_KEY) || 0);
      localStorage.setItem(GUEST_COINS_KEY, String(Math.min(150, prevPending + rewardCoins)));
    } catch (e) {}
    return false;
  }

  /* ── 3. CANVAS VECTOR SILHOUETTES (24/24 CITIES WITHOUT SPOILERS) ── */
  function _drawExtraBlitzLandmark(ctx, city, cx, cy, sz) {
    ctx.save();
    const col = city.themeColor || '#38bdf8';
    const halo = ctx.createRadialGradient(cx, cy, sz * 0.1, cx, cy, sz * 0.95);
    halo.addColorStop(0, col + '44');
    halo.addColorStop(0.65, col + '14');
    halo.addColorStop(1, 'transparent');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(cx, cy, sz * 0.95, 0, Math.PI * 2);
    ctx.fill();

    const baseY = cy + sz * 0.58;
    ctx.strokeStyle = col;
    ctx.shadowColor = col;
    ctx.shadowBlur = 18;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(cx - sz * 0.72, baseY);
    ctx.lineTo(cx + sz * 0.72, baseY);
    ctx.stroke();

    switch (city.id) {
      case 'toronto': {
        // CN Tower needle + SkyPod bulb + antenna
        ctx.fillStyle = col + '33';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        ctx.moveTo(cx - sz * 0.08, baseY);
        ctx.lineTo(cx - sz * 0.032, baseY - sz * 0.84);
        ctx.lineTo(cx + sz * 0.032, baseY - sz * 0.84);
        ctx.lineTo(cx + sz * 0.08, baseY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // Main Pod doughnut + upper pod
        ctx.fillStyle = '#0c1328';
        ctx.strokeStyle = '#fbbf24';
        ctx.beginPath();
        ctx.ellipse(cx, baseY - sz * 0.86, sz * 0.21, sz * 0.085, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(cx, baseY - sz * 1.00, sz * 0.09, sz * 0.04, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Tall antenna mast
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx, baseY - sz * 1.04);
        ctx.lineTo(cx, baseY - sz * 1.32);
        ctx.stroke();
        // Rogers Dome silhouette
        ctx.strokeStyle = col;
        ctx.beginPath();
        ctx.arc(cx + sz * 0.34, baseY, sz * 0.22, Math.PI, 0, false);
        ctx.stroke();
        break;
      }
      case 'barcelona': {
        // Sagrada Familia 4 tapered Gothic spires + central cross spire
        const spires = [
          [-0.40, 0.78], [-0.20, 0.94], [0.20, 0.94], [0.40, 0.78]
        ];
        ctx.fillStyle = col + '30';
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2.8;
        spires.forEach(([ox, sh]) => {
          const sx = cx + ox * sz;
          ctx.beginPath();
          ctx.moveTo(sx - sz * 0.075, baseY);
          ctx.quadraticCurveTo(sx - sz * 0.04, baseY - sz * sh * 0.65, sx, baseY - sz * sh);
          ctx.quadraticCurveTo(sx + sz * 0.04, baseY - sz * sh * 0.65, sx + sz * 0.075, baseY);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        });
        // Tall central spire + cross
        ctx.fillStyle = '#0d1428';
        ctx.strokeStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(cx - sz * 0.11, baseY);
        ctx.lineTo(cx - sz * 0.05, baseY - sz * 1.10);
        ctx.lineTo(cx + sz * 0.05, baseY - sz * 1.10);
        ctx.lineTo(cx + sz * 0.11, baseY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = '#fde047';
        ctx.beginPath();
        ctx.moveTo(cx, baseY - sz * 1.10);
        ctx.lineTo(cx, baseY - sz * 1.26);
        ctx.moveTo(cx - sz * 0.07, baseY - sz * 1.20);
        ctx.lineTo(cx + sz * 0.07, baseY - sz * 1.20);
        ctx.stroke();
        break;
      }
      case 'singapore': {
        // Marina Bay Sands: 3 slanted hotel towers + crowning SkyPark boat
        const towersX = [-0.36, 0, 0.36];
        ctx.fillStyle = col + '32';
        ctx.strokeStyle = col;
        ctx.lineWidth = 2.8;
        towersX.forEach((ox) => {
          const tx = cx + ox * sz;
          ctx.beginPath();
          ctx.moveTo(tx - sz * 0.10, baseY);
          ctx.lineTo(tx - sz * 0.06, baseY - sz * 0.86);
          ctx.lineTo(tx + sz * 0.06, baseY - sz * 0.86);
          ctx.lineTo(tx + sz * 0.10, baseY);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        });
        // Iconic curved rooftop SkyPark boat deck
        ctx.fillStyle = '#fde04733';
        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 3.2;
        ctx.beginPath();
        ctx.moveTo(cx - sz * 0.62, baseY - sz * 0.90);
        ctx.quadraticCurveTo(cx, baseY - sz * 0.82, cx + sz * 0.64, baseY - sz * 0.96);
        ctx.lineTo(cx + sz * 0.56, baseY - sz * 0.84);
        ctx.quadraticCurveTo(cx, baseY - sz * 0.74, cx - sz * 0.54, baseY - sz * 0.80);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
      }
      case 'rio': {
        // Corcovado hill + Christ the Redeemer silhouette + Sugarloaf
        ctx.fillStyle = col + '26';
        ctx.strokeStyle = col;
        ctx.beginPath();
        ctx.moveTo(cx - sz * 0.68, baseY);
        ctx.quadraticCurveTo(cx - sz * 0.08, baseY - sz * 0.58, cx + sz * 0.25, baseY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // Sugarloaf side peak
        ctx.beginPath();
        ctx.moveTo(cx + sz * 0.20, baseY);
        ctx.quadraticCurveTo(cx + sz * 0.46, baseY - sz * 0.52, cx + sz * 0.68, baseY);
        ctx.stroke();
        // Christ the Redeemer on summit
        const rx = cx - sz * 0.10;
        const feetY = baseY - sz * 0.36;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(rx, feetY);
        ctx.lineTo(rx, feetY - sz * 0.68);
        ctx.moveTo(rx - sz * 0.34, feetY - sz * 0.54);
        ctx.lineTo(rx + sz * 0.34, feetY - sz * 0.54);
        ctx.stroke();
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(rx, feetY - sz * 0.74, sz * 0.065, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'seoul': {
        // Namsan Hill + N Seoul Tower + Korean curved roof silhouette
        ctx.strokeStyle = col;
        ctx.beginPath();
        ctx.moveTo(cx - sz * 0.65, baseY);
        ctx.quadraticCurveTo(cx, baseY - sz * 0.35, cx + sz * 0.65, baseY);
        ctx.stroke();
        const hillTop = baseY - sz * 0.18;
        ctx.fillStyle = col + '35';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.fillRect(cx - sz * 0.04, hillTop - sz * 0.68, sz * 0.08, sz * 0.68);
        ctx.strokeRect(cx - sz * 0.04, hillTop - sz * 0.68, sz * 0.08, sz * 0.68);
        // Observation pod & beacon mast
        ctx.fillStyle = '#0d1428';
        ctx.strokeStyle = '#ec4899';
        ctx.fillRect(cx - sz * 0.15, hillTop - sz * 0.80, sz * 0.30, sz * 0.13);
        ctx.strokeRect(cx - sz * 0.15, hillTop - sz * 0.80, sz * 0.30, sz * 0.13);
        ctx.strokeStyle = '#fde047';
        ctx.beginPath();
        ctx.moveTo(cx, hillTop - sz * 0.80);
        ctx.lineTo(cx, hillTop - sz * 1.08);
        ctx.stroke();
        // Sweeping hanok gable beside base
        ctx.strokeStyle = col;
        ctx.beginPath();
        ctx.moveTo(cx - sz * 0.52, baseY - sz * 0.16);
        ctx.quadraticCurveTo(cx - sz * 0.32, baseY - sz * 0.08, cx - sz * 0.14, baseY - sz * 0.18);
        ctx.stroke();
        break;
      }
      case 'istanbul': {
        // Ottoman Grand Mosque cascade domes + twin slender minarets
        ctx.fillStyle = col + '30';
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 3;
        // Central grand dome
        ctx.beginPath();
        ctx.arc(cx, baseY - sz * 0.40, sz * 0.32, Math.PI, 0, false);
        ctx.lineTo(cx + sz * 0.32, baseY);
        ctx.lineTo(cx - sz * 0.32, baseY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // Side half-domes
        [-0.32, 0.32].forEach((ox) => {
          ctx.beginPath();
          ctx.arc(cx + ox * sz, baseY - sz * 0.22, sz * 0.16, Math.PI, 0, false);
          ctx.stroke();
        });
        // Twin needle minarets
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.6;
        [-0.50, 0.50].forEach((ox) => {
          const mx = cx + ox * sz;
          ctx.fillRect(mx - sz * 0.032, baseY - sz * 0.96, sz * 0.064, sz * 0.96);
          ctx.strokeRect(mx - sz * 0.032, baseY - sz * 0.96, sz * 0.064, sz * 0.96);
          ctx.beginPath();
          ctx.moveTo(mx - sz * 0.04, baseY - sz * 0.96);
          ctx.lineTo(mx, baseY - sz * 1.18);
          ctx.lineTo(mx + sz * 0.04, baseY - sz * 0.96);
          ctx.stroke();
        });
        break;
      }
      case 'berlin': {
        // Brandenburg Gate (6 columns + attic + chariot silhouette) + Fernsehturm sphere
        const gx = cx - sz * 0.10;
        const gateW = sz * 0.86;
        const beamY = baseY - sz * 0.48;
        ctx.fillStyle = col + '2e';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.6;
        for (let i = 0; i < 6; i++) {
          const px = gx - gateW / 2 + i * (gateW / 5);
          ctx.fillRect(px - sz * 0.025, beamY, sz * 0.05, sz * 0.48);
          ctx.strokeRect(px - sz * 0.025, beamY, sz * 0.05, sz * 0.48);
        }
        ctx.fillRect(gx - gateW / 2 - sz * 0.04, beamY - sz * 0.12, gateW + sz * 0.08, sz * 0.12);
        ctx.strokeRect(gx - gateW / 2 - sz * 0.04, beamY - sz * 0.12, gateW + sz * 0.08, sz * 0.12);
        // Quadriga crown
        ctx.strokeStyle = '#fbbf24';
        ctx.strokeRect(gx - sz * 0.14, beamY - sz * 0.24, sz * 0.28, sz * 0.12);
        // Fernsehturm sphere on right
        const fx = cx + sz * 0.48;
        ctx.strokeStyle = col;
        ctx.beginPath();
        ctx.moveTo(fx, baseY);
        ctx.lineTo(fx, baseY - sz * 1.24);
        ctx.stroke();
        ctx.fillStyle = '#fde04755';
        ctx.beginPath();
        ctx.arc(fx, baseY - sz * 0.92, sz * 0.12, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        break;
      }
      case 'amsterdam': {
        // 3 Traditional Dutch canal step-gable houses + arched bridge
        const houses = [
          [-0.44, 0.24, 0.58], [-0.14, 0.26, 0.72], [0.18, 0.24, 0.62]
        ];
        ctx.fillStyle = col + '2b';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.4;
        houses.forEach(([ox, hw, hh], idx) => {
          const hx = cx + ox * sz;
          const hy = baseY - hh * sz;
          ctx.fillRect(hx, hy, hw * sz, hh * sz);
          ctx.strokeRect(hx, hy, hw * sz, hh * sz);
          // Stepped / bell gable peak
          ctx.strokeStyle = idx === 1 ? '#fbbf24' : col;
          ctx.beginPath();
          ctx.moveTo(hx, hy);
          ctx.lineTo(hx + hw * sz * 0.25, hy - sz * 0.10);
          ctx.lineTo(hx + hw * sz * 0.5, hy - sz * 0.20);
          ctx.lineTo(hx + hw * sz * 0.75, hy - sz * 0.10);
          ctx.lineTo(hx + hw * sz, hy);
          ctx.stroke();
          ctx.strokeStyle = '#ffffff';
        });
        // Canal bridge arch in front
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(cx + sz * 0.36, baseY, sz * 0.24, Math.PI, 0, false);
        ctx.stroke();
        break;
      }
      case 'geneva': {
        // Alpine peaks + Towering Jet d'Eau water plume
        ctx.strokeStyle = col;
        ctx.fillStyle = col + '20';
        ctx.beginPath();
        ctx.moveTo(cx - sz * 0.68, baseY);
        ctx.lineTo(cx - sz * 0.36, baseY - sz * 0.42);
        ctx.lineTo(cx - sz * 0.12, baseY - sz * 0.20);
        ctx.lineTo(cx + sz * 0.22, baseY - sz * 0.48);
        ctx.lineTo(cx + sz * 0.68, baseY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // Jet d'Eau soaring plume
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(cx, baseY);
        ctx.lineTo(cx, baseY - sz * 1.18);
        ctx.stroke();
        ctx.strokeStyle = '#7dd3fc';
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(cx, baseY - sz * 1.18);
        ctx.quadraticCurveTo(cx - sz * 0.16, baseY - sz * 0.85, cx - sz * 0.22, baseY - sz * 0.45);
        ctx.moveTo(cx, baseY - sz * 1.18);
        ctx.quadraticCurveTo(cx + sz * 0.16, baseY - sz * 0.85, cx + sz * 0.22, baseY - sz * 0.45);
        ctx.stroke();
        break;
      }
      case 'lisbon': {
        // Iconic 25 de Abril Red Suspension Bridge towers + cables + Tagus arches
        const p1 = cx - sz * 0.34;
        const p2 = cx + sz * 0.34;
        const deckY = baseY - sz * 0.36;
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 3.5;
        // Deck
        ctx.beginPath();
        ctx.moveTo(cx - sz * 0.68, deckY);
        ctx.lineTo(cx + sz * 0.68, deckY);
        ctx.stroke();
        // Twin towers
        [p1, p2].forEach((px) => {
          ctx.beginPath();
          ctx.moveTo(px - sz * 0.05, baseY);
          ctx.lineTo(px - sz * 0.03, baseY - sz * 0.96);
          ctx.lineTo(px + sz * 0.03, baseY - sz * 0.96);
          ctx.lineTo(px + sz * 0.05, baseY);
          ctx.stroke();
        });
        // Suspension catenary
        ctx.strokeStyle = '#fda4af';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(cx - sz * 0.68, deckY);
        ctx.quadraticCurveTo(p1 - sz * 0.15, deckY - sz * 0.20, p1, baseY - sz * 0.96);
        ctx.quadraticCurveTo(cx, deckY - sz * 0.05, p2, baseY - sz * 0.96);
        ctx.quadraticCurveTo(p2 + sz * 0.15, deckY - sz * 0.20, cx + sz * 0.68, deckY);
        ctx.stroke();
        break;
      }
      case 'miami': {
        // Art Deco skyline + dual curved oceanfront palm trees + sunset halo
        ctx.fillStyle = '#ec489944';
        ctx.beginPath();
        ctx.arc(cx, baseY - sz * 0.48, sz * 0.32, Math.PI, 0, false);
        ctx.fill();
        ctx.fillStyle = col + '33';
        ctx.strokeStyle = '#ffffff';
        ctx.fillRect(cx - sz * 0.22, baseY - sz * 0.66, sz * 0.18, sz * 0.66);
        ctx.strokeRect(cx - sz * 0.22, baseY - sz * 0.66, sz * 0.18, sz * 0.66);
        ctx.fillRect(cx + sz * 0.02, baseY - sz * 0.84, sz * 0.20, sz * 0.84);
        ctx.strokeRect(cx + sz * 0.02, baseY - sz * 0.84, sz * 0.20, sz * 0.84);
        // Silhouetted palms
        [-0.46, 0.46].forEach((ox) => {
          const px = cx + ox * sz;
          const dir = ox < 0 ? -1 : 1;
          const topX = px + dir * sz * 0.08;
          const topY = baseY - sz * 0.62;
          ctx.strokeStyle = '#34d399';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(px, baseY);
          ctx.quadraticCurveTo(px + dir * sz * 0.06, baseY - sz * 0.34, topX, topY);
          ctx.stroke();
          for (let a = -2; a <= 2; a++) {
            ctx.beginPath();
            ctx.moveTo(topX, topY);
            ctx.quadraticCurveTo(topX + a * sz * 0.09, topY - sz * 0.08, topX + a * sz * 0.14, topY + sz * 0.08);
            ctx.stroke();
          }
        });
        break;
      }
      case 'losangeles': {
        // Twin hills + Griffith Observatory triple dome + tall California palms
        ctx.strokeStyle = col;
        ctx.fillStyle = col + '25';
        ctx.beginPath();
        ctx.moveTo(cx - sz * 0.68, baseY);
        ctx.quadraticCurveTo(cx - sz * 0.15, baseY - sz * 0.58, cx + sz * 0.35, baseY);
        ctx.fill();
        ctx.stroke();
        // Observatory dome on hill
        const ox = cx - sz * 0.15;
        const oy = baseY - sz * 0.30;
        ctx.fillStyle = '#ffffff30';
        ctx.strokeStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(ox, oy, sz * 0.16, Math.PI, 0, false);
        ctx.fill();
        ctx.stroke();
        // Tall slender palm silhouettes on right
        [0.28, 0.44].forEach((pxOff, i) => {
          const px = cx + pxOff * sz;
          const th = sz * (0.94 - i * 0.18);
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 2.8;
          ctx.beginPath();
          ctx.moveTo(px, baseY);
          ctx.lineTo(px + sz * 0.04, baseY - th);
          ctx.stroke();
          for (let k = -2; k <= 2; k++) {
            ctx.beginPath();
            ctx.moveTo(px + sz * 0.04, baseY - th);
            ctx.lineTo(px + sz * 0.04 + k * sz * 0.08, baseY - th + sz * 0.05);
            ctx.stroke();
          }
        });
        break;
      }
      case 'monaco': {
        // Monte Carlo Casino Belle-Epoque Twin Domes + Superyacht mast on harbour
        ctx.fillStyle = col + '33';
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2.8;
        ctx.fillRect(cx - sz * 0.46, baseY - sz * 0.36, sz * 0.66, sz * 0.36);
        ctx.strokeRect(cx - sz * 0.46, baseY - sz * 0.36, sz * 0.66, sz * 0.36);
        // Central & flank domes
        ctx.beginPath();
        ctx.arc(cx - sz * 0.13, baseY - sz * 0.36, sz * 0.17, Math.PI, 0, false);
        ctx.fill();
        ctx.stroke();
        [-0.36, 0.10].forEach((dx) => {
          ctx.beginPath();
          ctx.arc(cx + dx * sz, baseY - sz * 0.36, sz * 0.09, Math.PI, 0, false);
          ctx.stroke();
        });
        // Harbour Yacht Sail & Hull
        ctx.strokeStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(cx + sz * 0.36, baseY - sz * 0.08);
        ctx.lineTo(cx + sz * 0.36, baseY - sz * 0.88);
        ctx.lineTo(cx + sz * 0.60, baseY - sz * 0.18);
        ctx.closePath();
        ctx.stroke();
        break;
      }
      default: {
        // Clean anonymous geometric skyline without city code text
        const bars = [[-0.46, 0.14, 0.42], [-0.28, 0.16, 0.68], [-0.08, 0.20, 0.90], [0.16, 0.16, 0.64], [0.36, 0.14, 0.46]];
        bars.forEach(([ox, bw, bh]) => {
          ctx.fillStyle = col + '30';
          ctx.strokeStyle = col;
          ctx.fillRect(cx + ox * sz, baseY - bh * sz, bw * sz, bh * sz);
          ctx.strokeRect(cx + ox * sz, baseY - bh * sz, bw * sz, bh * sz);
        });
        break;
      }
    }
    ctx.restore();
  }

  function _drawBlitzLandmark(ctx, city, cx, cy, sz) {
    if (!city) return;
    if (CUSTOM_LANDMARK_IDS.has(city.id) && typeof window.drawCityLandmark === 'function') {
      window.drawCityLandmark(ctx, city.id, city.themeColor || '#38bdf8', cx, cy, sz);
    } else {
      _drawExtraBlitzLandmark(ctx, city, cx, cy, sz);
    }
  }

  /* ── 4. CANVAS ANIMATION STAGE ── */
  function _ensureStars(w, h) {
    if (state.stars.length) return;
    for (let i = 0; i < 42; i++) {
      state.stars.push({
        x: Math.random() * w,
        y: Math.random() * h * 0.72,
        r: 0.7 + Math.random() * 1.4,
        phase: Math.random() * Math.PI * 2,
        speed: 0.02 + Math.random() * 0.03
      });
    }
  }

  function _renderCanvasFrame() {
    const canvas = document.getElementById('blitzCanvas');
    if (!canvas || !state.isOpen) {
      state.rafId = null;
      return;
    }
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(260, Math.round(rect.width || 460));
    const h = Math.max(150, Math.round(rect.height || 185));
    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
    }
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    _ensureStars(w, h);

    state.pulsePhase += 0.035;
    const round = state.challenge && state.challenge[state.roundIdx];
    const city = round ? round.city : null;
    const col = (city && city.themeColor) || '#38bdf8';

    // Sky backdrop
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#040817');
    bg.addColorStop(0.75, '#0b1430');
    bg.addColorStop(1, '#101d3f');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Subtle twinkling starfield
    for (const s of state.stars) {
      s.phase += s.speed;
      const alpha = 0.28 + 0.52 * (0.5 + 0.5 * Math.sin(s.phase));
      ctx.fillStyle = `rgba(226, 232, 240, ${alpha.toFixed(2)})`;
      ctx.beginPath();
      ctx.arc((s.x / 460) * w, (s.y / 185) * h, s.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Horizon grid glow
    const cy = h * 0.60;
    const sz = Math.min(w * 0.48, h * 0.50);
    ctx.save();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.14)';
    ctx.lineWidth = 1;
    const baseY = cy + sz * 0.58;
    for (let i = -5; i <= 5; i++) {
      ctx.beginPath();
      ctx.moveTo(w / 2 + i * 28, baseY);
      ctx.lineTo(w / 2 + i * 74, h);
      ctx.stroke();
    }
    ctx.restore();

    if (city) {
      const pulseScale = 1 + 0.015 * Math.sin(state.pulsePhase);
      _drawBlitzLandmark(ctx, city, w / 2, cy, sz * pulseScale);
    }

    state.rafId = requestAnimationFrame(_renderCanvasFrame);
  }

  function _startCanvasLoop() {
    if (state.rafId) cancelAnimationFrame(state.rafId);
    state.rafId = requestAnimationFrame(_renderCanvasFrame);
  }

  /* ── 5. LAZY MODAL DOM & RENDERING ── */
  function ensureBlitzDom() {
    if (document.getElementById('remoBlitzBackdrop')) return;
    const wrap = document.createElement('div');
    wrap.id = 'remoBlitzBackdrop';
    wrap.className = 'blitz-backdrop';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-modal', 'true');
    wrap.setAttribute('aria-labelledby', 'blitzModalTitle');
    wrap.innerHTML = `
      <div class="blitz-modal" onclick="event.stopPropagation()">
        <div class="blitz-hdr">
          <div class="blitz-title-wrap">
            <span class="blitz-edition-pill" id="blitzEditionPill">#1</span>
            <div>
              <h3 id="blitzModalTitle" data-i18n="blitz_title">Daily World Blitz</h3>
              <p class="blitz-sub" data-i18n="blitz_subtitle">Same 5 world cities today for everyone. Beat the clock!</p>
            </div>
          </div>
          <div class="blitz-hdr-right">
            <div class="blitz-timer-chip" id="blitzTimerChip" aria-live="off">⏱️ 0.0s</div>
            <button type="button" class="blitz-close-btn" id="blitzCloseBtn" aria-label="Close" onclick="closeWorldBlitzModal()">✕</button>
          </div>
        </div>
        <div class="blitz-progress-row" id="blitzProgressRow"></div>
        <div id="blitzBody"></div>
      </div>
    `;
    wrap.addEventListener('click', (e) => {
      if (e.target === wrap) window.closeWorldBlitzModal();
    });
    document.body.appendChild(wrap);
  }

  function _renderProgressPills() {
    const row = document.getElementById('blitzProgressRow');
    if (!row) return;
    const html = [];
    for (let i = 0; i < ROUNDS_COUNT; i++) {
      const r = state.results[i];
      let cls = 'blitz-step-pill';
      let txt = String(i + 1);
      if (r === 'G') {
        cls += ' win';
        txt = '✓';
      } else if (r === 'R') {
        cls += ' lose';
        txt = '✕';
      } else if (state.phase === 'playing' && i === state.roundIdx) {
        cls += ' active';
      }
      html.push(`<div class="${cls}">${txt}</div>`);
    }
    row.innerHTML = html.join('');
  }

  function _renderPlayingStage() {
    const body = document.getElementById('blitzBody');
    const timerEl = document.getElementById('blitzTimerChip');
    const edEl = document.getElementById('blitzEditionPill');
    if (!body || !state.challenge || !state.challenge[state.roundIdx]) return;

    const lang = _lang();
    const round = state.challenge[state.roundIdx];
    const city = round.city;
    const wx = _getLiveWx(city);
    const condText = lang === 'fr' ? (wx.cond_fr || wx.cond_en || '') : (wx.cond_en || wx.cond_fr || '');
    const continentText = _continentName(city.continent, lang);
    const roundNumLabel = _t('blitz_round_of', { n: state.roundIdx + 1 });

    if (edEl) edEl.textContent = `#${state.blitzNumber}`;
    if (timerEl) {
      timerEl.style.display = 'inline-flex';
      timerEl.textContent = `⏱️ ${_formatSeconds(_getElapsedMs())}`;
    }

    const picked = state.revealLock ? state.pickedIds[state.roundIdx] : null;
    const isWin = picked && picked === city.id;

    body.innerHTML = `
      <div class="blitz-stage-card ${state.revealLock ? (isWin ? 'flash-win' : 'flash-lose') : ''}">
        <canvas id="blitzCanvas" class="blitz-canvas"></canvas>
        <div class="blitz-round-badge">${_esc(roundNumLabel)}</div>
        ${state.revealLock ? `
          <div class="blitz-reveal-banner ${isWin ? 'win' : 'lose'}">
            ${_esc(city.flag)} ${_esc(_cityName(city, lang))} · ${_esc(_cityCountry(city, lang))}
          </div>
        ` : ''}
      </div>

      <div class="blitz-clue-bar">
        <div class="blitz-clue-pill">🌍 ${_esc(continentText)}</div>
        <div class="blitz-clue-pill">${_esc(wx.icon || '🌤️')} ${_esc(String(wx.tempC ?? 18))}°C${condText ? ` · ${_esc(condText)}` : ''}</div>
        <button type="button" class="blitz-hint-btn ${state.hintUsedInRound ? 'used' : ''}" id="blitzHintBtn" ${state.hintUsedInRound || state.revealLock ? 'disabled' : ''}>
          ${_esc(state.hintUsedInRound ? _t('blitz_hint_used') : _t('blitz_hint_btn'))}
        </button>
      </div>

      ${state.hintUsedInRound ? `
        <div class="blitz-hint-reveal">
          ✈️ <b>${_esc(city.code)}</b> · ${_esc(_cityTagline(city, lang))}
        </div>
      ` : ''}

      <div class="blitz-options-grid">
        ${round.options.map((opt, idx) => {
          let cls = 'blitz-opt-btn';
          if (state.revealLock) {
            if (opt.id === city.id) cls += ' correct';
            else if (opt.id === picked) cls += ' wrong';
          }
          return `
            <button type="button" class="${cls}" data-city-id="${_esc(opt.id)}" ${state.revealLock ? 'disabled' : ''}>
              <span class="blitz-opt-key">${idx + 1}</span>
              <span class="blitz-opt-flag">${_esc(opt.flag)}</span>
              <span class="blitz-opt-meta">
                <span class="blitz-opt-name">${_esc(_cityName(opt, lang))}</span>
                <span class="blitz-opt-country">${_esc(_cityCountry(opt, lang))}</span>
              </span>
            </button>
          `;
        }).join('')}
      </div>
    `;

    const hintBtn = document.getElementById('blitzHintBtn');
    if (hintBtn) hintBtn.onclick = _triggerHint;

    body.querySelectorAll('.blitz-opt-btn[data-city-id]').forEach((btn) => {
      btn.onclick = () => _submitAnswer(btn.getAttribute('data-city-id'));
    });

    _renderProgressPills();
    _startCanvasLoop();
  }

  function _getUtcCountdownStr() {
    const now = new Date();
    const nextMid = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0);
    const diffSec = Math.max(0, Math.floor((nextMid - now.getTime()) / 1000));
    const h = String(Math.floor(diffSec / 3600)).padStart(2, '0');
    const m = String(Math.floor((diffSec % 3600) / 60)).padStart(2, '0');
    const s = String(diffSec % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  }

  function _renderDoneStage() {
    const body = document.getElementById('blitzBody');
    const timerEl = document.getElementById('blitzTimerChip');
    const edEl = document.getElementById('blitzEditionPill');
    if (!body || !state.finalResult) return;

    if (state.rafId) {
      cancelAnimationFrame(state.rafId);
      state.rafId = null;
    }

    const lang = _lang();
    const store = loadSavedStore();
    const res = state.finalResult;
    const score = res.results.filter((r) => r === 'G').length;
    const isPerfect = score === ROUNDS_COUNT;
    const grid = res.results.map((r) => (r === 'G' ? '🟩' : '🟥')).join('');
    const rewardCoins = Number(res.rewardCoins || 0);
    const u = window.REMO_STORE && typeof window.REMO_STORE.getCurrentUser === 'function'
      ? window.REMO_STORE.getCurrentUser()
      : null;

    if (edEl) edEl.textContent = `#${res.num}`;
    if (timerEl) {
      timerEl.style.display = 'inline-flex';
      timerEl.textContent = `⏱️ ${Number(res.timeSec).toFixed(1)}s`;
    }

    const shareTxt = buildShareText(res, lang);
    const encodedShare = encodeURIComponent(shareTxt);
    const routeCities = (res.cityIds || []).map((id) => {
      return getCanonicalPool().find((c) => c.id === id) || (typeof window.getCityById === 'function' ? window.getCityById(id) : null);
    }).filter(Boolean);

    body.innerHTML = `
      <div class="blitz-result-card">
        <div class="blitz-result-title">${_esc(isPerfect ? _t('blitz_perfect_title') : _t('blitz_done_title'))}</div>
        <div class="blitz-result-grid-emojis" aria-label="Blitz Result Grid">${grid}</div>
        <p class="blitz-result-sub">${_esc(_t('blitz_already_played'))}</p>

        <div class="blitz-stats-row">
          <div class="blitz-stat-box">
            <div class="blitz-stat-val">${score}/${ROUNDS_COUNT}</div>
            <div class="blitz-stat-lbl">${_esc(_t('blitz_score_lbl'))}</div>
          </div>
          <div class="blitz-stat-box">
            <div class="blitz-stat-val">${Number(res.timeSec).toFixed(1)}s</div>
            <div class="blitz-stat-lbl">${_esc(_t('blitz_time_lbl'))}</div>
          </div>
          <div class="blitz-stat-box">
            <div class="blitz-stat-val">🔥 ${store.streak || 1}d</div>
            <div class="blitz-stat-lbl">${_esc(_t('blitz_streak_lbl'))}</div>
          </div>
          ${store.bestTimeSec ? `
            <div class="blitz-stat-box">
              <div class="blitz-stat-val">⚡ ${Number(store.bestTimeSec).toFixed(1)}s</div>
              <div class="blitz-stat-lbl">${_esc(_t('blitz_best_lbl'))}</div>
            </div>
          ` : ''}
        </div>

        ${rewardCoins > 0 ? `
          <div class="blitz-reward-banner ${u ? 'credited' : 'guest'}">
            <span>${_esc(_t(u ? 'blitz_reward_earned' : 'blitz_reward_guest', { coins: rewardCoins }))}</span>
            ${!u ? `
              <button type="button" class="btn-cyber btn-gold" id="blitzClaimPassportBtn" style="padding:5px 11px;font-size:0.74rem;">
                ${_esc(_t('blitz_claim_passport', { coins: rewardCoins }))}
              </button>
            ` : ''}
          </div>
        ` : ''}

        <div class="blitz-share-actions">
          <button type="button" class="blitz-share-main-btn ${state.copiedRecently ? 'copied' : ''}" id="blitzCopyShareBtn">
            ${_esc(state.copiedRecently ? _t('blitz_copied_btn') : _t('blitz_copy_share'))}
          </button>
          <div class="blitz-share-quick-row">
            <a class="blitz-social-link" href="https://wa.me/?text=${encodedShare}" target="_blank" rel="noopener noreferrer">${_esc(_t('blitz_wa_share'))}</a>
            <a class="blitz-social-link" href="https://twitter.com/intent/tweet?text=${encodedShare}" target="_blank" rel="noopener noreferrer">${_esc(_t('blitz_x_share'))}</a>
          </div>
        </div>

        ${routeCities.length ? `
          <div class="blitz-route-wrap">
            <div class="blitz-route-lbl">${_esc(_t('blitz_today_route'))}</div>
            <div class="blitz-route-pills">
              ${routeCities.map((c) => `
                <button type="button" class="blitz-route-city-btn" data-tv-city="${_esc(c.id)}">
                  ${_esc(c.flag)} ${_esc(_cityName(c, lang))}
                </button>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <div class="blitz-footer-row">
          <span class="blitz-countdown-lbl" id="blitzCountdownLbl">${_esc(_t('blitz_next_in'))} <b>${_getUtcCountdownStr()}</b></span>
          <button type="button" class="blitz-tv-cta-btn" id="blitzWatchTvBtn">${_esc(_t('blitz_watch_tv'))}</button>
        </div>
      </div>
    `;

    _renderProgressPills();

    const copyBtn = document.getElementById('blitzCopyShareBtn');
    if (copyBtn) copyBtn.onclick = _copyShareResult;

    const claimBtn = document.getElementById('blitzClaimPassportBtn');
    if (claimBtn) {
      claimBtn.onclick = () => {
        window.closeWorldBlitzModal();
        if (typeof window.openAuthModal === 'function') window.openAuthModal();
      };
    }

    const tvBtn = document.getElementById('blitzWatchTvBtn');
    if (tvBtn) {
      const targetId = routeCities[0] ? routeCities[0].id : 'montreal';
      tvBtn.onclick = () => {
        window.closeWorldBlitzModal();
        if (typeof window.openFocusTvModal === 'function') window.openFocusTvModal(targetId, true);
      };
    }

    body.querySelectorAll('.blitz-route-city-btn[data-tv-city]').forEach((btn) => {
      btn.onclick = () => {
        const cid = btn.getAttribute('data-tv-city');
        window.closeWorldBlitzModal();
        if (typeof window.openFocusTvModal === 'function') window.openFocusTvModal(cid, true);
      };
    });

    clearInterval(state.countdownIntervalId);
    state.countdownIntervalId = setInterval(() => {
      if (!state.isOpen || state.phase !== 'done') return;
      const cdEl = document.getElementById('blitzCountdownLbl');
      if (cdEl) cdEl.innerHTML = `${_esc(_t('blitz_next_in'))} <b>${_getUtcCountdownStr()}</b>`;
    }, 1000);
  }

  /* ── 6. GAMEPLAY ACTIONS ── */
  function _triggerHint() {
    if (state.phase !== 'playing' || state.revealLock || state.hintUsedInRound) return;
    state.hintUsedInRound = true;
    state.hintsCount += 1;
    state.penaltyMs += HINT_PENALTY_MS;
    _renderPlayingStage();
  }

  function _submitAnswer(cityId) {
    if (state.phase !== 'playing' || state.revealLock) return;
    const round = state.challenge && state.challenge[state.roundIdx];
    if (!round) return;

    // Pause stopwatch cleanly during feedback reveal so transition animation never hurts time
    if (state.roundStartedAt > 0) {
      state.accumulatedMs += Math.max(0, performance.now() - state.roundStartedAt);
      state.roundStartedAt = 0;
    }
    state.revealLock = true;
    const isCorrect = cityId === round.city.id;
    state.pickedIds[state.roundIdx] = cityId;
    state.results[state.roundIdx] = isCorrect ? 'G' : 'R';

    _renderPlayingStage();

    setTimeout(() => {
      if (!state.isOpen && state.phase !== 'playing') return;
      state.revealLock = false;
      state.hintUsedInRound = false;
      if (state.roundIdx + 1 < state.challenge.length) {
        state.roundIdx += 1;
        state.roundStartedAt = state.isOpen ? performance.now() : 0;
        if (state.isOpen) _renderPlayingStage();
      } else {
        _completeDailyBlitz();
      }
    }, 750);
  }

  function _completeDailyBlitz() {
    clearInterval(state.timerIntervalId);
    state.timerIntervalId = null;
    state.phase = 'done';

    const totalSec = Number(Math.max(0.5, _getElapsedMs() / 1000).toFixed(1));
    const score = state.results.filter((r) => r === 'G').length;
    const rewardCoins = computeCoinsReward(score);
    const cityIds = (state.challenge || []).map((r) => r.city.id);

    const prevStore = loadSavedStore();
    const alreadySavedToday = prevStore.lastCompletedDate === state.dateKey && prevStore.todayResult;
    const prevDate = getPrevUtcDateKey(state.dateKey);
    const newStreak = alreadySavedToday
      ? (prevStore.streak || 1)
      : (prevStore.lastCompletedDate === prevDate ? (prevStore.streak || 0) + 1 : 1);

    let bestTimeSec = prevStore.bestTimeSec || null;
    if (score === ROUNDS_COUNT && (!bestTimeSec || totalSec < bestTimeSec)) {
      bestTimeSec = totalSec;
    }

    const resultObj = {
      date: state.dateKey,
      num: state.blitzNumber,
      results: state.results.slice(),
      timeSec: totalSec,
      hintsUsed: state.hintsCount,
      rewardCoins,
      cityIds
    };

    if (!alreadySavedToday) {
      saveStore({
        lastCompletedDate: state.dateKey,
        streak: newStreak,
        bestTimeSec,
        playedCount: (prevStore.playedCount || 0) + 1,
        todayResult: resultObj
      });
      _awardDailyCoins(rewardCoins);
    }

    state.finalResult = resultObj;
    syncBlitzEntryBadges();
    window.dispatchEvent(new CustomEvent('remo:blitzdone', { detail: resultObj }));
    if (state.isOpen) _renderDoneStage();
  }

  async function _copyShareResult() {
    if (!state.finalResult) return;
    const txt = buildShareText(state.finalResult, _lang());
    let ok = false;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(txt);
        ok = true;
      }
    } catch (e) {}

    if (!ok) {
      try {
        const ta = document.createElement('textarea');
        ta.value = txt;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        ok = document.execCommand('copy');
        document.body.removeChild(ta);
      } catch (e) {}
    }

    state.copiedRecently = true;
    const btn = document.getElementById('blitzCopyShareBtn');
    if (btn) {
      btn.classList.add('copied');
      btn.textContent = _t('blitz_copied_btn');
    }
    if (typeof window.remoToast === 'function') {
      window.remoToast(_t('blitz_copied_toast'), ok ? 'fanfare' : 'info');
    }
    setTimeout(() => {
      state.copiedRecently = false;
      const b = document.getElementById('blitzCopyShareBtn');
      if (b && state.isOpen && state.phase === 'done') {
        b.classList.remove('copied');
        b.textContent = _t('blitz_copy_share');
      }
    }, 2600);
  }

  /* ── 7. ENTRY BADGES & PUBLIC CONTROLS ── */
  function syncBlitzEntryBadges() {
    const todayKey = getUtcDateKey();
    const store = loadSavedStore();
    const doneToday = store.lastCompletedDate === todayKey && store.todayResult;
    const score = doneToday ? (store.todayResult.results || []).filter((r) => r === 'G').length : 0;

    const feedPill = document.getElementById('feedWorldBlitzPill');
    const feedStatus = document.getElementById('feedBlitzPillStatus');
    if (feedPill && feedStatus) {
      feedPill.classList.toggle('completed', Boolean(doneToday));
      feedStatus.textContent = doneToday ? `✓ ${score}/5` : '5/5';
    }

    const appBadge = document.getElementById('appLauncherBlitzBadge');
    if (appBadge) {
      if (doneToday) {
        appBadge.removeAttribute('data-i18n');
        appBadge.textContent = `✓ ${score}/5`;
      } else {
        appBadge.setAttribute('data-i18n', 'blitz_badge_daily');
        appBadge.textContent = _t('blitz_badge_daily');
      }
    }
  }

  window.openWorldBlitzModal = function () {
    ensureBlitzDom();
    const backdrop = document.getElementById('remoBlitzBackdrop');
    if (!backdrop) return;

    const todayKey = getUtcDateKey();
    const saved = loadSavedStore();
    state.dateKey = todayKey;
    state.blitzNumber = getBlitzNumber(todayKey);
    state.isOpen = true;
    state.copiedRecently = false;
    backdrop.classList.add('open');

    if (window.REMO_I18N && typeof window.REMO_I18N.applyDOM === 'function') {
      window.REMO_I18N.applyDOM(backdrop);
    }

    if (saved.lastCompletedDate === todayKey && saved.todayResult) {
      state.phase = 'done';
      state.finalResult = saved.todayResult;
      state.results = (saved.todayResult.results || []).slice();
      _renderDoneStage();
      return;
    }

    // Initialize today's challenge or resume paused mid-round session from same UTC day
    if (!state.challenge || state.challengeDate !== todayKey || state.phase !== 'playing') {
      state.challengeDate = todayKey;
      state.challenge = buildDailyChallenge(todayKey);
      state.roundIdx = 0;
      state.results = [];
      state.pickedIds = [];
      state.hintUsedInRound = false;
      state.hintsCount = 0;
      state.accumulatedMs = 0;
      state.penaltyMs = 0;
      state.revealLock = false;
      state.finalResult = null;
      state.phase = 'playing';
    }

    if (!state.revealLock) state.roundStartedAt = performance.now();

    clearInterval(state.timerIntervalId);
    state.timerIntervalId = setInterval(() => {
      if (!state.isOpen || state.phase !== 'playing') return;
      const chip = document.getElementById('blitzTimerChip');
      if (chip) chip.textContent = `⏱️ ${_formatSeconds(_getElapsedMs())}`;
    }, 100);

    _renderPlayingStage();
  };

  window.closeWorldBlitzModal = function () {
    if (state.phase === 'playing' && !state.revealLock && state.roundStartedAt > 0) {
      state.accumulatedMs += Math.max(0, performance.now() - state.roundStartedAt);
      state.roundStartedAt = 0;
    }
    state.isOpen = false;
    const backdrop = document.getElementById('remoBlitzBackdrop');
    if (backdrop) backdrop.classList.remove('open');

    if (state.rafId) {
      cancelAnimationFrame(state.rafId);
      state.rafId = null;
    }
    clearInterval(state.timerIntervalId);
    state.timerIntervalId = null;
    clearInterval(state.countdownIntervalId);
    state.countdownIntervalId = null;
  };

  document.addEventListener('keydown', (e) => {
    if (!state.isOpen) return;
    if (e.key === 'Escape') {
      window.closeWorldBlitzModal();
      return;
    }
    if (state.phase !== 'playing' || state.revealLock) return;
    if (e.key === 'h' || e.key === 'H') {
      _triggerHint();
      return;
    }
    const idx = Number(e.key) - 1;
    if (idx >= 0 && idx < 4 && state.challenge && state.challenge[state.roundIdx]) {
      const opt = state.challenge[state.roundIdx].options[idx];
      if (opt) _submitAnswer(opt.id);
    }
  });

  window.addEventListener('remo:langchange', () => {
    syncBlitzEntryBadges();
    if (!state.isOpen) return;
    const backdrop = document.getElementById('remoBlitzBackdrop');
    if (backdrop && window.REMO_I18N && typeof window.REMO_I18N.applyDOM === 'function') {
      window.REMO_I18N.applyDOM(backdrop);
    }
    if (state.phase === 'playing') _renderPlayingStage();
    else if (state.phase === 'done') _renderDoneStage();
  });

  window.addEventListener('DOMContentLoaded', syncBlitzEntryBadges);

  window.REMO_BLITZ = {
    getUtcDateKey,
    getBlitzNumber,
    buildDailyChallenge,
    buildShareText,
    computeCoinsReward,
    syncBlitzEntryBadges,
    drawBlitzLandmark: _drawBlitzLandmark,
    CUSTOM_LANDMARK_IDS: Array.from(CUSTOM_LANDMARK_IDS)
  };
})();
