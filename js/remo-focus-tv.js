/* ════════════════════════════════════════════════════════════════════
   📺 REMO 4D FOCUS TV / AMBIENT CITY WINDOW ENGINE
   Fullscreen Cyber-LoFi Radio + Live Weather + 4D Landmarks + Pomodoro
   Zero-Login Friendly · Strictly Bilingual (EN / FR)
   ════════════════════════════════════════════════════════════════════ */

(function () {
  if (typeof window === 'undefined') return;

  const STAR_CITY_IDS = ['montreal', 'paris', 'newyork', 'tokyo'];

  const state = {
    isOpen: false,
    cityId: 'montreal',
    rafId: null,
    particles: [],
    stars: [],
    phase: 0,
    ambient: { rain: false, cafe: false, vinyl: false },
    audioCtx: null,
    ambientNodes: {},
    pomodoroActive: false,
    pomodoroRemainingSec: 25 * 60,
    pomodoroTimerId: null,
    clockIntervalId: null
  };

  function _lang() {
    return (window.REMO_I18N && window.REMO_I18N.getLang()) || 'en';
  }

  function _t(key, vars) {
    if (window.REMO_I18N && typeof window.REMO_I18N.t === 'function') {
      return window.REMO_I18N.t(key, vars);
    }
    return key;
  }

  function _escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function _getCities() {
    if (typeof window.getRemoCities === 'function') return window.getRemoCities();
    return [];
  }

  function _getCity(cid) {
    const id = String(cid || state.cityId || 'montreal').toLowerCase();
    if (typeof window.getCityById === 'function') return window.getCityById(id);
    return { id: 'montreal', flag: '⚜️', name_en: 'Montréal', name_fr: 'Montréal', themeColor: '#8b5cf6' };
  }

  function _cityName(city) {
    if (typeof window.getCityName === 'function') return window.getCityName(city, _lang());
    return _lang() === 'fr' ? (city.name_fr || city.name_en) : (city.name_en || city.name_fr);
  }

  function _hexToRgb(hex) {
    const clean = String(hex || '#38bdf8').replace('#', '');
    if (clean.length !== 6) return { r: 56, g: 189, b: 248 };
    const n = parseInt(clean, 16);
    if (isNaN(n)) return { r: 56, g: 189, b: 248 };
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }

  /* ── 1. INJECT OVERLAY DOM (SINGLETON) ── */
  function ensureFocusTvDom() {
    if (document.getElementById('remoFocusTvOverlay')) return;

    const wrap = document.createElement('div');
    wrap.id = 'remoFocusTvOverlay';
    wrap.className = 'ftv-overlay';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-modal', 'true');
    wrap.setAttribute('aria-label', 'REMO 4D Focus TV');

    wrap.innerHTML = `
      <canvas id="ftvSceneCanvas" class="ftv-canvas"></canvas>
      <div class="ftv-vignette"></div>

      <div class="ftv-hud">
        <!-- TOP BAR -->
        <div class="ftv-topbar">
          <div class="ftv-brand-cluster">
            <span class="ftv-live-pill">
              <span class="ftv-live-dot"></span>
              <span data-i18n="ftv_badge">4D CITY WINDOW · LIVE</span>
            </span>
            <div class="ftv-star-cities" id="ftvStarCitiesBar"></div>
            <select id="ftvCitySelect" class="ftv-city-select" aria-label="Select City" onchange="focusTvSwitchCity(this.value)"></select>
          </div>

          <div class="ftv-top-actions">
            <div class="ftv-weather-pill" id="ftvWeatherPill">🕒 --:-- · 🌤️ --°C</div>
            <button type="button" class="ftv-hud-btn" id="ftvPomodoroBtn" onclick="toggleFocusTvPomodoro()">
              ⏱️ 25:00
            </button>
            <button type="button" class="ftv-hud-btn ftv-share-btn" onclick="shareFocusTvVibe()" data-i18n="ftv_share_vibe">
              📲 Share Vibe
            </button>
            <button type="button" class="ftv-hud-btn ftv-exit-btn" onclick="closeFocusTvModal()" data-i18n="ftv_exit">
              ✕ Exit TV
            </button>
          </div>
        </div>

        <!-- CENTER FLOATING CITY HERO CALLOUT -->
        <div class="ftv-center-title">
          <div class="ftv-center-flag" id="ftvHeroCityName">⚜️ MONTRÉAL</div>
          <div class="ftv-center-sub" id="ftvHeroCitySub">Cyber-Creative Capital</div>
        </div>

        <!-- BOTTOM CONTROL DECK & DISCREET CHAT -->
        <div class="ftv-bottom-dock">
          <!-- Listener Chat Strip -->
          <div class="ftv-chat-strip">
            <div class="ftv-chat-header">
              <span class="ftv-listeners-chip" id="ftvListenersChip">🎧 18 listening</span>
              <span class="ftv-l2e-chip" id="ftvL2eChip">🪙 +5 / 10m</span>
            </div>
            <div class="ftv-chat-feed" id="ftvChatFeed"></div>
            <form class="ftv-chat-form" onsubmit="event.preventDefault(); sendFocusTvChatMessage();">
              <input type="text" id="ftvChatInput" class="ftv-chat-input" maxlength="140" data-i18n-placeholder="ftv_chat_ph" placeholder="Say hi or share what you are working on..." />
              <button type="submit" class="ftv-chat-send" data-i18n="ftv_chat_send">Send</button>
            </form>
          </div>

          <!-- Radio + Ambient Controls Bar -->
          <div class="ftv-deck">
            <div class="ftv-station-info">
              <div class="ftv-st-icon" id="ftvStationIcon">☕</div>
              <div class="ftv-st-meta">
                <div class="ftv-st-name" id="ftvStationName">Capital Chill UK</div>
                <div class="ftv-st-desc" id="ftvStationDesc">Downtempo &amp; Lo-Fi 24/7</div>
              </div>
              <select id="ftvStationSelect" class="ftv-station-select" aria-label="Radio Station" onchange="focusTvSelectStation(this.value)"></select>
            </div>

            <div class="ftv-transport">
              <button type="button" class="ftv-ctrl-btn" onclick="focusTvPrevStation()" title="Previous">⏮</button>
              <button type="button" class="ftv-play-btn" id="ftvPlayBtn" onclick="focusTvTogglePlay()">▶</button>
              <button type="button" class="ftv-ctrl-btn" onclick="focusTvNextStation()" title="Next">⏭</button>
              <div class="ftv-vol-wrap">
                <span>🔊</span>
                <input type="range" id="ftvVolSlider" min="0" max="100" value="70" oninput="focusTvSetVolume(this.value)" />
              </div>
            </div>

            <div class="ftv-ambient-group">
              <button type="button" class="ftv-amb-btn" id="ftvAmbRainBtn" onclick="toggleFocusTvAmbient('rain')" data-i18n="ftv_amb_rain">🌧️ Rain</button>
              <button type="button" class="ftv-amb-btn" id="ftvAmbCafeBtn" onclick="toggleFocusTvAmbient('cafe')" data-i18n="ftv_amb_cafe">☕ Café</button>
              <button type="button" class="ftv-amb-btn" id="ftvAmbVinylBtn" onclick="toggleFocusTvAmbient('vinyl')" data-i18n="ftv_amb_vinyl">📼 Vinyl</button>
              <button type="button" class="ftv-amb-btn ftv-console-btn" onclick="openRadioConsoleFromFocusTv()" data-i18n="ftv_all_stations">🎛️ Radio Console</button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(wrap);
  }

  /* ── 2. SAFE WEBAUDIO LOCAL AMBIENT SYNTHESIZER (NO CORS TOUCH ON RADIO) ── */
  function _ensureAudioCtx() {
    if (!state.audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      state.audioCtx = new AC();
    }
    if (state.audioCtx.state === 'suspended') {
      state.audioCtx.resume().catch(() => {});
    }
    return state.audioCtx;
  }

  function _createPinkNoiseBuffer(ctx, sec) {
    const len = Math.floor(ctx.sampleRate * sec);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.06;
      b6 = white * 0.115926;
    }
    return buf;
  }

  function _startAmbientChannel(kind) {
    const ctx = _ensureAudioCtx();
    if (!ctx) return;
    _stopAmbientChannel(kind);

    if (kind === 'rain') {
      const src = ctx.createBufferSource();
      src.buffer = _createPinkNoiseBuffer(ctx, 3);
      src.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1150;
      filter.Q.value = 0.6;
      const gain = ctx.createGain();
      gain.gain.value = 0.22;
      src.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      src.start();
      state.ambientNodes.rain = { src, gain };
    } else if (kind === 'cafe') {
      const src = ctx.createBufferSource();
      src.buffer = _createPinkNoiseBuffer(ctx, 4);
      src.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 420;
      const gain = ctx.createGain();
      gain.gain.value = 0.24;
      src.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      src.start();
      state.ambientNodes.cafe = { src, gain };
    } else if (kind === 'vinyl') {
      const len = Math.floor(ctx.sampleRate * 2.5);
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) {
        data[i] = Math.random() < 0.0022 ? (Math.random() * 2 - 1) * 0.55 : (Math.random() * 2 - 1) * 0.012;
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 1800;
      const gain = ctx.createGain();
      gain.gain.value = 0.14;
      src.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      src.start();
      state.ambientNodes.vinyl = { src, gain };
    }
  }

  function _stopAmbientChannel(kind) {
    const node = state.ambientNodes[kind];
    if (node) {
      try { node.src.stop(); } catch (e) {}
      try { node.src.disconnect(); } catch (e) {}
      try { node.gain.disconnect(); } catch (e) {}
      delete state.ambientNodes[kind];
    }
  }

  function _stopAllAmbient() {
    ['rain', 'cafe', 'vinyl'].forEach((k) => {
      state.ambient[k] = false;
      _stopAmbientChannel(k);
    });
    _syncAmbientButtons();
  }

  function _syncAmbientButtons() {
    const map = { rain: 'ftvAmbRainBtn', cafe: 'ftvAmbCafeBtn', vinyl: 'ftvAmbVinylBtn' };
    Object.keys(map).forEach((k) => {
      const el = document.getElementById(map[k]);
      if (el) el.classList.toggle('active', Boolean(state.ambient[k]));
    });
  }

  window.toggleFocusTvAmbient = function (kind) {
    if (!['rain', 'cafe', 'vinyl'].includes(kind)) return;
    state.ambient[kind] = !state.ambient[kind];
    if (state.ambient[kind]) {
      _startAmbientChannel(kind);
    } else {
      _stopAmbientChannel(kind);
    }
    _syncAmbientButtons();
  };

  /* ── 3. 4D CANVAS SCENE & PROCEDURAL VISUALIZER ── */
  function _initSceneParticles() {
    state.stars = Array.from({ length: 75 }, () => ({
      x: Math.random(),
      y: Math.random() * 0.58,
      r: 0.6 + Math.random() * 1.6,
      tw: Math.random() * Math.PI * 2,
      sp: 0.015 + Math.random() * 0.03
    }));

    state.particles = Array.from({ length: 90 }, () => ({
      x: Math.random(),
      y: Math.random(),
      len: 8 + Math.random() * 14,
      vy: 0.008 + Math.random() * 0.014,
      vx: -0.001 - Math.random() * 0.0015,
      size: 1.5 + Math.random() * 2.5
    }));
  }

  function _getLiveWx(city) {
    if (window.REMO_WEATHER && typeof window.REMO_WEATHER.getCityLiveStatus === 'function') {
      return window.REMO_WEATHER.getCityLiveStatus(city);
    }
    return { timeStr: '20:00', hour: 20, isNight: true, tempC: 16, icon: '🌙', cond_en: 'Clear', cond_fr: 'Clair', naturalStorm: false, isSurge: false };
  }

  function _startCanvasLoop() {
    if (state.rafId) cancelAnimationFrame(state.rafId);
    if (!state.stars.length) _initSceneParticles();

    const canvas = document.getElementById('ftvSceneCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const renderFrame = () => {
      if (!state.isOpen) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      const city = _getCity(state.cityId);
      const rgb = _hexToRgb(city.themeColor || '#38bdf8');
      const wx = _getLiveWx(city);
      const hr = typeof wx.hour === 'number' ? wx.hour : 21;
      const isPlaying = Boolean(window.REMO_RADIO && window.REMO_RADIO.isPlaying);
      const vol = (window.REMO_RADIO && typeof window.REMO_RADIO.volume === 'number') ? window.REMO_RADIO.volume : 0.7;
      const energy = isPlaying ? Math.max(0.35, 0.45 + vol * 0.55) : 0.14;
      state.phase += isPlaying ? 0.045 : 0.014;

      // Sky Gradient synced to real city local hour
      const sky = ctx.createLinearGradient(0, 0, 0, h);
      if (hr >= 6 && hr <= 9) {
        sky.addColorStop(0, '#0f172a');
        sky.addColorStop(0.55, '#4c1d95');
        sky.addColorStop(1, '#9d174d');
      } else if (hr >= 10 && hr <= 16) {
        sky.addColorStop(0, '#040b1f');
        sky.addColorStop(0.5, '#0c234b');
        sky.addColorStop(1, '#1e1b4b');
      } else if (hr >= 17 && hr <= 19) {
        sky.addColorStop(0, '#09091f');
        sky.addColorStop(0.52, '#581c87');
        sky.addColorStop(1, '#be185d');
      } else {
        sky.addColorStop(0, '#02040d');
        sky.addColorStop(0.58, '#0b1029');
        sky.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.24)`);
      }
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);

      // Night Stars & Celestial Moon/Sun Orb
      const showStars = hr < 7 || hr >= 18;
      if (showStars) {
        for (let i = 0; i < state.stars.length; i++) {
          const st = state.stars[i];
          st.tw += st.sp;
          const alpha = 0.25 + 0.65 * (0.5 + 0.5 * Math.sin(st.tw));
          ctx.fillStyle = `rgba(226, 232, 240, ${alpha.toFixed(2)})`;
          ctx.beginPath();
          ctx.arc(st.x * w, st.y * h, st.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Cyberpunk Neon Horizon Aura behind Landmark
      const horizonY = h * 0.68;
      const auraR = Math.min(w, h) * (0.34 + 0.04 * Math.sin(state.phase * 1.4) * energy);
      const aura = ctx.createRadialGradient(w * 0.5, horizonY - 60, 10, w * 0.5, horizonY - 60, auraR);
      aura.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${(0.42 * energy + 0.16).toFixed(2)})`);
      aura.addColorStop(0.6, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`);
      aura.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = aura;
      ctx.fillRect(0, 0, w, h);

      // Perspective 4D Synthwave Horizon Grid
      ctx.save();
      ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`;
      ctx.lineWidth = 1;
      for (let i = -8; i <= 8; i++) {
        ctx.beginPath();
        ctx.moveTo(w * 0.5 + i * 24, horizonY);
        ctx.lineTo(w * 0.5 + i * 155, h);
        ctx.stroke();
      }
      const gridShift = (state.phase * 14) % 32;
      for (let g = 0; g < 9; g++) {
        const t = (g * 32 + gridShift) / 288;
        const gy = horizonY + Math.pow(t, 1.8) * (h - horizonY);
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(w, gy);
        ctx.stroke();
      }
      ctx.restore();

      // Draw Authentic City Landmark Silhouette
      if (typeof window.drawCityLandmark === 'function') {
        const lmkSize = Math.max(150, Math.min(280, Math.min(w, h) * 0.34));
        ctx.save();
        ctx.globalAlpha = 0.92;
        window.drawCityLandmark(ctx, city.id, city.themeColor || '#38bdf8', w * 0.5, horizonY - lmkSize * 0.28, lmkSize);
        ctx.restore();
      }

      // Safe Procedural 3D Stereo Audio Spectrum Visualizer
      const bars = 42;
      const barSpan = Math.min(w * 0.72, 680);
      const startX = (w - barSpan) * 0.5;
      const step = barSpan / bars;
      for (let b = 0; b < bars; b++) {
        const centerDist = Math.abs(b - (bars - 1) / 2) / ((bars - 1) / 2);
        const envelope = 1 - centerDist * 0.58;
        const wave =
          0.5 +
          0.28 * Math.sin(state.phase * 2.3 + b * 0.48) +
          0.22 * Math.cos(state.phase * 3.7 - b * 0.72);
        const bh = Math.max(4, wave * envelope * 78 * energy);
        const bx = startX + b * step + step * 0.2;
        const bw = Math.max(3, step * 0.6);

        const grad = ctx.createLinearGradient(bx, horizonY - bh, bx, horizonY + bh * 0.32);
        grad.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.92)`);
        grad.addColorStop(1, 'rgba(244, 114, 182, 0.25)');
        ctx.fillStyle = grad;
        ctx.fillRect(bx, horizonY - bh, bw, bh);
        ctx.globalAlpha = 0.24;
        ctx.fillRect(bx, horizonY + 2, bw, bh * 0.32);
        ctx.globalAlpha = 1;
      }

      // Live Real-Weather Atmospheric Particles (Rain or Snow or Cyber Embers)
      const condLow = String(wx.cond_en || '').toLowerCase();
      const isSnow = condLow.includes('snow') || Number(wx.tempC) <= 0;
      const isRain = state.ambient.rain || Boolean(wx.naturalStorm) || condLow.includes('rain') || condLow.includes('drizzle') || condLow.includes('storm');

      if (isRain || isSnow) {
        ctx.save();
        for (let i = 0; i < state.particles.length; i++) {
          const p = state.particles[i];
          if (isSnow) {
            p.y += p.vy * 0.32;
            p.x += Math.sin(state.phase + i) * 0.0007;
          } else {
            p.y += p.vy * 1.45;
            p.x += p.vx;
          }
          if (p.y > 1) { p.y = -0.02; p.x = Math.random(); }
          if (p.x < 0) p.x = 1;
          if (p.x > 1) p.x = 0;

          const px = p.x * w;
          const py = p.y * h;
          if (isSnow) {
            ctx.fillStyle = 'rgba(241, 245, 249, 0.72)';
            ctx.beginPath();
            ctx.arc(px, py, p.size, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.strokeStyle = 'rgba(125, 211, 252, 0.42)';
            ctx.lineWidth = 1.25;
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(px - 2.5, py + p.len);
            ctx.stroke();
          }
        }
        ctx.restore();
      }

      ctx.restore();
      state.rafId = requestAnimationFrame(renderFrame);
    };

    state.rafId = requestAnimationFrame(renderFrame);
  }

  /* ── 4. POMODORO FOCUS TIMER (+15 🪙 REWARD) ── */
  function _renderPomodoroBtn() {
    const btn = document.getElementById('ftvPomodoroBtn');
    if (!btn) return;
    const mins = String(Math.floor(state.pomodoroRemainingSec / 60)).padStart(2, '0');
    const secs = String(state.pomodoroRemainingSec % 60).padStart(2, '0');
    btn.classList.toggle('active', state.pomodoroActive);
    btn.textContent = state.pomodoroActive ? `⏸️ ${mins}:${secs}` : `⏱️ ${mins}:${secs}`;
  }

  window.toggleFocusTvPomodoro = function () {
    if (state.pomodoroActive) {
      state.pomodoroActive = false;
      clearInterval(state.pomodoroTimerId);
      state.pomodoroTimerId = null;
      _renderPomodoroBtn();
      return;
    }

    state.pomodoroActive = true;
    if (state.pomodoroRemainingSec <= 0) state.pomodoroRemainingSec = 25 * 60;
    _renderPomodoroBtn();

    clearInterval(state.pomodoroTimerId);
    state.pomodoroTimerId = setInterval(() => {
      if (!state.pomodoroActive) return;
      state.pomodoroRemainingSec -= 1;
      if (state.pomodoroRemainingSec <= 0) {
        state.pomodoroActive = false;
        clearInterval(state.pomodoroTimerId);
        state.pomodoroTimerId = null;
        state.pomodoroRemainingSec = 25 * 60;

        try {
          const store = window.REMO_STORE;
          if (store) {
            const u = store.getCurrentUser() || store.ensureGuestOrCitizen('Focus Citizen', '', state.cityId);
            if (u && u.uid) {
              store.addCoins(u.uid, 15, 10);
              store.save(true, 'focus_pomodoro');
            }
          }
          if (typeof window.spawnRemoCoinsFX === 'function') window.spawnRemoCoinsFX(12);
          if (typeof window.remoToast === 'function') window.remoToast(_t('ftv_focus_done'), 'fanfare');
          if (typeof window.syncHeaderAndSidebars === 'function') window.syncHeaderAndSidebars();
        } catch (e) {}
      }
      _renderPomodoroBtn();
    }, 1000);
  };

  /* ── 5. DISCREET CITY CHAT & LISTENERS ── */
  function _renderChatStrip() {
    const feed = document.getElementById('ftvChatFeed');
    const listenersEl = document.getElementById('ftvListenersChip');
    const l2eEl = document.getElementById('ftvL2eChip');
    const lang = _lang();
    const city = _getCity(state.cityId);

    const store = window.REMO_STORE;
    const onlineCount = (store && typeof store.getOnlineCitizensList === 'function')
      ? Math.max(12, store.getOnlineCitizensList().length + 11)
      : 18;
    if (listenersEl) {
      listenersEl.textContent = `🎧 ${onlineCount} ${_t('ftv_listeners_lbl')}`;
    }

    if (l2eEl && window.REMO_RADIO && typeof window.REMO_RADIO._loadL2EState === 'function') {
      const l2e = window.REMO_RADIO._loadL2EState();
      const minsLeft = Math.max(1, Math.ceil((600 - (l2e.secProgress || 0)) / 60));
      l2eEl.textContent = `🪙 +5 / ${minsLeft}m (${l2e.coinsToday || 0}/30)`;
    }

    if (!feed) return;
    const allRooms = (store && store.state && store.state.chatMessages) || {};
    const cityMsgs = Array.isArray(allRooms[state.cityId]) ? allRooms[state.cityId] : [];
    const globalMsgs = Array.isArray(allRooms.global) ? allRooms.global : [];
    const merged = cityMsgs.length ? cityMsgs : globalMsgs;
    const recent = merged.slice(-3);

    if (!recent.length) {
      const fallback = lang === 'fr'
        ? `${city.flag || '🌍'} Fenêtre ouverte sur ${_cityName(city)} — écoutez en direct et laissez un mot.`
        : `${city.flag || '🌍'} Tuned into ${_cityName(city)} — enjoy the live atmosphere and drop a hello.`;
      feed.innerHTML = `<div class="ftv-chat-line ftv-chat-welcome">${_escapeHtml(fallback)}</div>`;
      return;
    }

    feed.innerHTML = recent.map((m) => `
      <div class="ftv-chat-line">
        <span class="ftv-chat-author">${_escapeHtml(m.cityFlag || city.flag || '🌍')} @${_escapeHtml(m.author || 'Citizen')}:</span>
        <span class="ftv-chat-text">${_escapeHtml(m.text || '')}</span>
      </div>
    `).join('');
  }

  window.sendFocusTvChatMessage = function () {
    const inp = document.getElementById('ftvChatInput');
    if (!inp) return;
    const txt = inp.value.trim();
    if (!txt) return;

    const store = window.REMO_STORE;
    if (store && store.state) {
      const u = store.getCurrentUser() || store.ensureGuestOrCitizen('Focus Citizen', '', state.cityId);
      const myCity = _getCity(u.homeCity || state.cityId);
      store.state.chatMessages = store.state.chatMessages || {};
      store.state.chatMessages[state.cityId] = store.state.chatMessages[state.cityId] || [];
      store.state.chatMessages[state.cityId].push({
        id: 'ftv_' + Date.now(),
        uid: u.uid,
        author: u.name,
        cityFlag: myCity.flag || '🌍',
        text: txt,
        ts: Date.now()
      });
      store.save(true, 'focus_tv_chat');
    }
    inp.value = '';
    _renderChatStrip();
  };

  /* ── 6. SYNC UI WITH REMO_RADIO & CITY SELECTORS ── */
  function _renderCitySelectors() {
    const starBar = document.getElementById('ftvStarCitiesBar');
    const sel = document.getElementById('ftvCitySelect');
    const cities = _getCities();
    const lang = _lang();

    if (starBar) {
      starBar.innerHTML = STAR_CITY_IDS.map((cid) => {
        const c = _getCity(cid);
        const active = state.cityId === cid ? 'active' : '';
        return `<button type="button" class="ftv-star-chip ${active}" onclick="focusTvSwitchCity('${cid}')">${c.flag} ${_escapeHtml(_cityName(c))}</button>`;
      }).join('');
    }

    if (sel && cities.length) {
      sel.innerHTML = cities.map((c) => {
        const name = typeof window.getCityName === 'function' ? window.getCityName(c, lang) : c.name_en;
        return `<option value="${c.id}" ${c.id === state.cityId ? 'selected' : ''}>${c.flag} ${_escapeHtml(name)}</option>`;
      }).join('');
    }
  }

  function _updateCityHeroAndWeather() {
    const city = _getCity(state.cityId);
    const wx = _getLiveWx(city);
    const lang = _lang();

    const wp = document.getElementById('ftvWeatherPill');
    if (wp) {
      const cond = lang === 'fr' ? (wx.cond_fr || wx.cond_en || '') : (wx.cond_en || '');
      wp.textContent = `🕒 ${wx.timeStr || '--:--'} · ${wx.icon || '🌤️'} ${wx.tempC ?? 20}°C ${cond}`;
    }

    const heroName = document.getElementById('ftvHeroCityName');
    const heroSub = document.getElementById('ftvHeroCitySub');
    if (heroName) heroName.textContent = `${city.flag || '🌍'} ${_cityName(city).toUpperCase()}`;
    if (heroSub) heroSub.textContent = lang === 'fr' ? (city.tagline_fr || city.tagline_en || '') : (city.tagline_en || '');
  }

  function syncFocusTvUI() {
    if (!state.isOpen) return;
    const radio = window.REMO_RADIO;
    const lang = _lang();

    const st = radio && radio.currentStation;
    const stIcon = document.getElementById('ftvStationIcon');
    const stName = document.getElementById('ftvStationName');
    const stDesc = document.getElementById('ftvStationDesc');
    const stSel = document.getElementById('ftvStationSelect');
    const playBtn = document.getElementById('ftvPlayBtn');
    const volSlider = document.getElementById('ftvVolSlider');

    if (st) {
      if (stIcon) stIcon.textContent = st.flag || st.icon || '📻';
      if (stName) stName.textContent = st.name || 'REMO Radio';
      if (stDesc) {
        stDesc.textContent = (lang === 'fr'
          ? (st.desc_fr || st.genre_fr || st.desc_en || st.genre_en)
          : (st.desc_en || st.genre_en || st.desc_fr || st.genre_fr)) || '24/7 Live Stream';
      }
    }

    if (stSel && radio && Array.isArray(radio.stations)) {
      const curId = st ? st.id : '';
      stSel.innerHTML = radio.stations.map((s) =>
        `<option value="${s.id}" ${s.id === curId ? 'selected' : ''}>${s.flag || s.icon || '📻'} ${_escapeHtml(s.name)}</option>`
      ).join('');
    }

    if (playBtn && radio) {
      playBtn.textContent = radio.isLoading ? '⏳' : (radio.isPlaying ? '⏸' : '▶');
      playBtn.classList.toggle('playing', Boolean(radio.isPlaying));
    }

    if (volSlider && radio) {
      volSlider.value = Math.round((radio.volume ?? 0.7) * 100);
    }

    _updateCityHeroAndWeather();
    _renderChatStrip();
    _syncAmbientButtons();
  }
  window.syncFocusTvUI = syncFocusTvUI;

  /* ── 7. RADIO BRIDGE CONTROLS ── */
  window.focusTvSwitchCity = function (cityId) {
    state.cityId = String(cityId || 'montreal').toLowerCase();
    _renderCitySelectors();
    _updateCityHeroAndWeather();
    _renderChatStrip();
    if (window.REMO_RADIO && typeof window.REMO_RADIO.tuneToCity === 'function') {
      const wasPlaying = Boolean(window.REMO_RADIO.isPlaying);
      window.REMO_RADIO.tuneToCity(state.cityId, wasPlaying);
    }
    syncFocusTvUI();
  };

  window.focusTvSelectStation = function (stationId) {
    if (window.REMO_RADIO && typeof window.REMO_RADIO.selectStation === 'function') {
      window.REMO_RADIO.selectStation(stationId, true);
    }
    syncFocusTvUI();
  };

  window.focusTvTogglePlay = function () {
    if (window.REMO_RADIO) window.REMO_RADIO.toggle();
    syncFocusTvUI();
  };

  window.focusTvPrevStation = function () {
    if (window.REMO_RADIO) window.REMO_RADIO.prevStation();
    syncFocusTvUI();
  };

  window.focusTvNextStation = function () {
    if (window.REMO_RADIO) window.REMO_RADIO.nextStation();
    syncFocusTvUI();
  };

  window.focusTvSetVolume = function (val) {
    if (window.REMO_RADIO) window.REMO_RADIO.setVolume(Math.max(0, Math.min(1, Number(val) / 100)));
  };

  window.openRadioConsoleFromFocusTv = function () {
    if (typeof window.openRemoRadioModal === 'function') {
      window.openRemoRadioModal();
    }
  };

  /* ── 8. SHARE 9:16 VIBE CARD SNAPSHOT ── */
  window.shareFocusTvVibe = async function () {
    const city = _getCity(state.cityId);
    const wx = _getLiveWx(city);
    const st = (window.REMO_RADIO && window.REMO_RADIO.currentStation) || { name: 'REMO Cyber-LoFi', flag: '📻' };
    const shareUrl = `${window.location.origin}${window.location.pathname}?tv=${encodeURIComponent(city.id)}`;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      }
    } catch (e) {}

    // Render sleek 9:16 Vibe Story card on offscreen canvas & download PNG
    try {
      const c = document.createElement('canvas');
      c.width = 540;
      c.height = 960;
      const ctx = c.getContext('2d');
      const rgb = _hexToRgb(city.themeColor || '#38bdf8');

      const grad = ctx.createLinearGradient(0, 0, 0, 960);
      grad.addColorStop(0, '#040818');
      grad.addColorStop(0.55, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.42)`);
      grad.addColorStop(1, '#050816');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 540, 960);

      if (typeof window.drawCityLandmark === 'function') {
        window.drawCityLandmark(ctx, city.id, city.themeColor || '#38bdf8', 270, 490, 260);
      }

      ctx.textAlign = 'center';
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 20px Orbitron, sans-serif';
      ctx.fillText('REMO 4D FOCUS TV · LIVE', 270, 90);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 42px Orbitron, sans-serif';
      ctx.fillText(`${city.flag} ${_cityName(city).toUpperCase()}`, 270, 155);

      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText(`🕒 ${wx.timeStr || '--:--'}  ·  ${wx.icon || '🌤️'} ${wx.tempC ?? 20}°C`, 270, 200);

      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText(`🎧 ${st.name}`, 270, 820);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '18px monospace';
      ctx.fillText('remoworld.com/?tv=' + city.id, 270, 875);

      const link = document.createElement('a');
      link.download = `REMO_4D_FocusTV_${city.id}.png`;
      link.href = c.toDataURL('image/png');
      link.click();
    } catch (e) {}

    if (typeof window.remoToast === 'function') {
      window.remoToast(_t('ftv_share_ready'), 'fanfare');
    }
  };

  /* ── 9. OPEN / CLOSE PUBLIC ENTRYPOINTS ── */
  window.openFocusTvModal = function (preferredCityId, autoPlayStation = true) {
    ensureFocusTvDom();
    const overlay = document.getElementById('remoFocusTvOverlay');
    if (!overlay) return;

    if (preferredCityId) {
      state.cityId = String(preferredCityId).toLowerCase();
    } else if (window.REMO_STORE) {
      const u = window.REMO_STORE.getCurrentUser();
      if (u && u.homeCity) state.cityId = u.homeCity;
    }

    state.isOpen = true;
    overlay.classList.add('open');
    document.body.classList.add('ftv-active');

    if (window.REMO_I18N && typeof window.REMO_I18N.applyDOM === 'function') {
      window.REMO_I18N.applyDOM(overlay);
    }

    if (window.REMO_RADIO) {
      if (preferredCityId && typeof window.REMO_RADIO.tuneToCity === 'function') {
        window.REMO_RADIO.tuneToCity(state.cityId, autoPlayStation);
      } else if (autoPlayStation && !window.REMO_RADIO.isPlaying) {
        window.REMO_RADIO.play();
      }
    }

    _renderCitySelectors();
    syncFocusTvUI();
    _renderPomodoroBtn();
    _startCanvasLoop();

    clearInterval(state.clockIntervalId);
    state.clockIntervalId = setInterval(() => {
      if (!state.isOpen) return;
      _updateCityHeroAndWeather();
      _renderChatStrip();
    }, 10000);
  };

  window.closeFocusTvModal = function () {
    const overlay = document.getElementById('remoFocusTvOverlay');
    state.isOpen = false;
    if (overlay) overlay.classList.remove('open');
    document.body.classList.remove('ftv-active');

    if (state.rafId) {
      cancelAnimationFrame(state.rafId);
      state.rafId = null;
    }
    clearInterval(state.clockIntervalId);
    state.clockIntervalId = null;
    _stopAllAmbient();
  };

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && state.isOpen) {
      window.closeFocusTvModal();
    }
  });
})();
