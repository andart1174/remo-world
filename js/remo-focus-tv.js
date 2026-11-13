/* ════════════════════════════════════════════════════════════════════
   📺 REMO 4D FOCUS TV / AMBIENT CITY WINDOW ENGINE
   Fullscreen Cyber-LoFi Radio + Live Weather + 4D Landmarks + Pomodoro
   Zero-Login Friendly · Strictly Bilingual (EN / FR)
   ════════════════════════════════════════════════════════════════════ */

(function () {
  if (typeof window === 'undefined') return;

  const STAR_CITY_IDS = ['montreal', 'paris', 'newyork', 'tokyo'];

  const AMBIENT_EFFECT_KEYS = ['rain', 'storm', 'snow', 'ocean', 'fire', 'petals', 'cyber', 'cafe', 'vinyl'];
  const AMBIENT_BTN_MAP = {
    rain: 'ftvAmbRainBtn',
    storm: 'ftvAmbStormBtn',
    snow: 'ftvAmbSnowBtn',
    ocean: 'ftvAmbOceanBtn',
    fire: 'ftvAmbFireBtn',
    petals: 'ftvAmbPetalsBtn',
    cyber: 'ftvAmbCyberBtn',
    cafe: 'ftvAmbCafeBtn',
    vinyl: 'ftvAmbVinylBtn'
  };

  const state = {
    isOpen: false,
    cityId: 'montreal',
    rafId: null,
    particles: [],
    stars: [],
    phase: 0,
    ambient: {
      rain: false,
      storm: false,
      snow: false,
      ocean: false,
      fire: false,
      petals: false,
      cyber: false,
      cafe: false,
      vinyl: false
    },
    audioCtx: null,
    fxGain: null,
    fxVolume: 0.75,
    fxPopoverOpen: false,
    lightningAlpha: 0,
    lightningCooldown: 0,
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
              <button type="button" class="ftv-local-fm-btn" id="ftvLocalFmBtn" onclick="focusTvCycleLocalStation()" style="display:none;">🔀 1/2</button>
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

            <div class="ftv-ambient-group" id="ftvAmbientGroup">
              <button type="button" class="ftv-amb-btn" id="ftvAmbRainBtn" onclick="toggleFocusTvAmbient('rain')" data-i18n="ftv_amb_rain">🌧️ Rain</button>
              <button type="button" class="ftv-amb-btn" id="ftvAmbSnowBtn" onclick="toggleFocusTvAmbient('snow')" data-i18n="ftv_amb_snow">❄️ Snow</button>
              <button type="button" class="ftv-amb-btn" id="ftvAmbFireBtn" onclick="toggleFocusTvAmbient('fire')" data-i18n="ftv_amb_fire">🔥 Fire</button>
              <button type="button" class="ftv-amb-btn ftv-fx-more-btn" id="ftvMoreFxBtn" onclick="toggleFocusTvFxPopover()" data-i18n="ftv_more_fx">✨ More FX ▾</button>
              <button type="button" class="ftv-amb-btn ftv-console-btn" onclick="openRadioConsoleFromFocusTv()" data-i18n="ftv_all_stations">🎛️ Radio Console</button>

              <div class="ftv-fx-popover" id="ftvFxPopover" aria-hidden="true">
                <div class="ftv-fx-grid">
                  <button type="button" class="ftv-amb-btn" id="ftvAmbStormBtn" onclick="toggleFocusTvAmbient('storm')" data-i18n="ftv_amb_storm">⛈️ Storm</button>
                  <button type="button" class="ftv-amb-btn" id="ftvAmbOceanBtn" onclick="toggleFocusTvAmbient('ocean')" data-i18n="ftv_amb_ocean">🌊 Ocean</button>
                  <button type="button" class="ftv-amb-btn" id="ftvAmbPetalsBtn" onclick="toggleFocusTvAmbient('petals')" data-i18n="ftv_amb_petals">🌸 Petals</button>
                  <button type="button" class="ftv-amb-btn" id="ftvAmbCyberBtn" onclick="toggleFocusTvAmbient('cyber')" data-i18n="ftv_amb_cyber">💾 Cyber</button>
                  <button type="button" class="ftv-amb-btn" id="ftvAmbCafeBtn" onclick="toggleFocusTvAmbient('cafe')" data-i18n="ftv_amb_cafe">☕ Café</button>
                  <button type="button" class="ftv-amb-btn" id="ftvAmbVinylBtn" onclick="toggleFocusTvAmbient('vinyl')" data-i18n="ftv_amb_vinyl">📼 Vinyl</button>
                </div>
                <div class="ftv-fx-vol-row">
                  <span data-i18n="ftv_fx_vol">🎚️ FX Mix</span>
                  <input type="range" id="ftvFxVolSlider" min="0" max="100" value="75" oninput="setFocusTvFxVolume(this.value)" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    wrap.addEventListener('click', (e) => {
      if (state.fxPopoverOpen && e.target && !e.target.closest('#ftvAmbientGroup')) {
        state.fxPopoverOpen = false;
        _syncAmbientButtons();
      }
    });

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

  function _ensureFxBus(ctx) {
    if (!state.fxGain) {
      state.fxGain = ctx.createGain();
      state.fxGain.gain.value = state.fxVolume;
      state.fxGain.connect(ctx.destination);
    }
    return state.fxGain;
  }

  function _spawnFilteredNoise(ctx, bus, sec, filterType, freq, q, gainVal) {
    const src = ctx.createBufferSource();
    src.buffer = _createPinkNoiseBuffer(ctx, sec);
    src.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.value = freq;
    if (typeof q === 'number') filter.Q.value = q;
    const gain = ctx.createGain();
    gain.gain.value = gainVal;
    src.connect(filter);
    filter.connect(gain);
    gain.connect(bus);
    src.start();
    return { src, filter, gain };
  }

  function _startAmbientChannel(kind) {
    const ctx = _ensureAudioCtx();
    if (!ctx) return;
    _stopAmbientChannel(kind);
    const bus = _ensureFxBus(ctx);

    if (kind === 'rain') {
      const ch = _spawnFilteredNoise(ctx, bus, 3, 'bandpass', 1150, 0.6, 0.24);
      state.ambientNodes.rain = { sources: [ch.src], nodes: [ch.filter, ch.gain] };
    } else if (kind === 'storm') {
      const heavy = _spawnFilteredNoise(ctx, bus, 3.5, 'bandpass', 680, 0.55, 0.26);
      const rumble = _spawnFilteredNoise(ctx, bus, 4, 'lowpass', 145, null, 0.28);
      state.ambientNodes.storm = {
        sources: [heavy.src, rumble.src],
        nodes: [heavy.filter, heavy.gain, rumble.filter, rumble.gain],
        rumbleGain: rumble.gain
      };
    } else if (kind === 'snow') {
      const breeze = _spawnFilteredNoise(ctx, bus, 3.5, 'bandpass', 2400, 1.2, 0.08);
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 587.33;
      const shimmerGain = ctx.createGain();
      shimmerGain.gain.value = 0.012;
      osc.connect(shimmerGain);
      shimmerGain.connect(bus);
      osc.start();
      state.ambientNodes.snow = { sources: [breeze.src, osc], nodes: [breeze.filter, breeze.gain, shimmerGain] };
    } else if (kind === 'ocean') {
      const surf = _spawnFilteredNoise(ctx, bus, 4, 'lowpass', 520, null, 0.19);
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 0.14;
      const lfoDepth = ctx.createGain();
      lfoDepth.gain.value = 0.15;
      lfo.connect(lfoDepth);
      lfoDepth.connect(surf.gain.gain);
      lfo.start();
      state.ambientNodes.ocean = { sources: [surf.src, lfo], nodes: [surf.filter, surf.gain, lfoDepth] };
    } else if (kind === 'fire') {
      const warmth = _spawnFilteredNoise(ctx, bus, 3.5, 'lowpass', 310, null, 0.20);
      const len = Math.floor(ctx.sampleRate * 2.5);
      const cBuf = ctx.createBuffer(1, len, ctx.sampleRate);
      const cData = cBuf.getChannelData(0);
      for (let i = 0; i < len; i++) {
        cData[i] = Math.random() < 0.0038 ? (Math.random() * 2 - 1) * 0.68 : (Math.random() * 2 - 1) * 0.008;
      }
      const cSrc = ctx.createBufferSource();
      cSrc.buffer = cBuf;
      cSrc.loop = true;
      const cFilter = ctx.createBiquadFilter();
      cFilter.type = 'bandpass';
      cFilter.frequency.value = 2100;
      cFilter.Q.value = 0.9;
      const cGain = ctx.createGain();
      cGain.gain.value = 0.14;
      cSrc.connect(cFilter);
      cFilter.connect(cGain);
      cGain.connect(bus);
      cSrc.start();
      state.ambientNodes.fire = { sources: [warmth.src, cSrc], nodes: [warmth.filter, warmth.gain, cFilter, cGain] };
    } else if (kind === 'petals') {
      const wind = _spawnFilteredNoise(ctx, bus, 4, 'bandpass', 820, 1.0, 0.075);
      const osc1 = ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.value = 528;
      const padGain = ctx.createGain();
      padGain.gain.value = 0.011;
      osc1.connect(padGain);
      padGain.connect(bus);
      osc1.start();
      state.ambientNodes.petals = { sources: [wind.src, osc1], nodes: [wind.filter, wind.gain, padGain] };
    } else if (kind === 'cyber') {
      const hum = ctx.createOscillator();
      hum.type = 'triangle';
      hum.frequency.value = 55;
      const humFilter = ctx.createBiquadFilter();
      humFilter.type = 'lowpass';
      humFilter.frequency.value = 180;
      const humGain = ctx.createGain();
      humGain.gain.value = 0.04;
      hum.connect(humFilter);
      humFilter.connect(humGain);
      humGain.connect(bus);
      hum.start();
      const dataAir = _spawnFilteredNoise(ctx, bus, 3, 'bandpass', 3200, 1.6, 0.025);
      state.ambientNodes.cyber = { sources: [hum, dataAir.src], nodes: [humFilter, humGain, dataAir.filter, dataAir.gain] };
    } else if (kind === 'cafe') {
      const ch = _spawnFilteredNoise(ctx, bus, 4, 'lowpass', 420, null, 0.24);
      state.ambientNodes.cafe = { sources: [ch.src], nodes: [ch.filter, ch.gain] };
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
      gain.connect(bus);
      src.start();
      state.ambientNodes.vinyl = { sources: [src], nodes: [filter, gain] };
    }
  }

  function _stopAmbientChannel(kind) {
    const entry = state.ambientNodes[kind];
    if (entry) {
      (entry.sources || []).forEach((s) => {
        try { s.stop(); } catch (e) {}
        try { s.disconnect(); } catch (e) {}
      });
      (entry.nodes || []).forEach((n) => {
        try { n.disconnect(); } catch (e) {}
      });
      delete state.ambientNodes[kind];
    }
  }

  function _stopAllAmbient() {
    AMBIENT_EFFECT_KEYS.forEach((k) => {
      state.ambient[k] = false;
      _stopAmbientChannel(k);
    });
    state.fxPopoverOpen = false;
    state.lightningAlpha = 0;
    _syncAmbientButtons();
  }

  function _syncAmbientButtons() {
    Object.keys(AMBIENT_BTN_MAP).forEach((k) => {
      const el = document.getElementById(AMBIENT_BTN_MAP[k]);
      if (el) el.classList.toggle('active', Boolean(state.ambient[k]));
    });
    const moreBtn = document.getElementById('ftvMoreFxBtn');
    const pop = document.getElementById('ftvFxPopover');
    const hasSubActive = ['storm', 'ocean', 'petals', 'cyber', 'cafe', 'vinyl'].some((k) => Boolean(state.ambient[k]));
    if (moreBtn) {
      moreBtn.classList.toggle('active', state.fxPopoverOpen || hasSubActive);
    }
    if (pop) {
      pop.classList.toggle('open', Boolean(state.fxPopoverOpen));
      pop.setAttribute('aria-hidden', state.fxPopoverOpen ? 'false' : 'true');
    }
    const fxSlider = document.getElementById('ftvFxVolSlider');
    if (fxSlider) {
      fxSlider.value = Math.round((state.fxVolume ?? 0.75) * 100);
    }
  }

  window.toggleFocusTvFxPopover = function () {
    state.fxPopoverOpen = !state.fxPopoverOpen;
    _syncAmbientButtons();
  };

  window.setFocusTvFxVolume = function (val) {
    state.fxVolume = Math.max(0, Math.min(1, Number(val) / 100));
    if (state.fxGain && state.audioCtx) {
      try { state.fxGain.gain.setValueAtTime(state.fxVolume, state.audioCtx.currentTime); } catch (e) {
        state.fxGain.gain.value = state.fxVolume;
      }
    }
  };

  window.toggleFocusTvAmbient = function (kind) {
    if (!AMBIENT_EFFECT_KEYS.includes(kind)) return;
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
      sx: Math.random(),
      sy: Math.random(),
      fy: Math.random(),
      py: Math.random(),
      cy: Math.random(),
      px: Math.random(),
      cx: Math.random(),
      fx: Math.random(),
      ang: Math.random() * Math.PI * 2,
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

      // Live Real-Weather & 4D Atmospheric Effects (Rain, Storm, Snow, Ocean, Fire, Petals, Cyber)
      const condLow = String(wx.cond_en || '').toLowerCase();
      const showStorm = Boolean(state.ambient.storm || condLow.includes('thunder') || condLow.includes('storm'));
      const showSnow = Boolean(state.ambient.snow || condLow.includes('snow') || Number(wx.tempC) <= 0);
      const showRain = Boolean(state.ambient.rain || showStorm || wx.naturalStorm || condLow.includes('rain') || condLow.includes('drizzle'));
      const showOcean = Boolean(state.ambient.ocean);
      const showFire = Boolean(state.ambient.fire);
      const showPetals = Boolean(state.ambient.petals);
      const showCyber = Boolean(state.ambient.cyber);
      const particleCap = w <= 860 ? Math.min(55, state.particles.length) : state.particles.length;

      // Aurora Borealis northern lights ribbon during Snow
      if (showSnow) {
        ctx.save();
        const aurora = ctx.createLinearGradient(0, h * 0.08, w, h * 0.34);
        aurora.addColorStop(0, 'rgba(16, 185, 129, 0.04)');
        aurora.addColorStop(0.5, 'rgba(56, 189, 248, 0.14)');
        aurora.addColorStop(1, 'rgba(167, 139, 250, 0.06)');
        ctx.fillStyle = aurora;
        ctx.beginPath();
        ctx.moveTo(0, h * 0.24);
        for (let ax = 0; ax <= w; ax += Math.max(40, w / 10)) {
          const ay = h * 0.18 + Math.sin(state.phase * 0.7 + ax * 0.006) * 28;
          ctx.lineTo(ax, ay);
        }
        ctx.lineTo(w, h * 0.36);
        ctx.lineTo(0, h * 0.36);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      // Ocean neon horizon water shimmer
      if (showOcean) {
        ctx.save();
        const oceanGlow = ctx.createLinearGradient(0, horizonY, 0, h);
        oceanGlow.addColorStop(0, 'rgba(6, 182, 212, 0.22)');
        oceanGlow.addColorStop(1, 'rgba(15, 23, 42, 0.04)');
        ctx.fillStyle = oceanGlow;
        ctx.fillRect(0, horizonY, w, h - horizonY);
        ctx.strokeStyle = 'rgba(103, 232, 249, 0.36)';
        ctx.lineWidth = 1.4;
        for (let r = 0; r < 14; r++) {
          const ry = horizonY + 8 + (r / 14) * (h - horizonY - 12);
          const span = 50 + r * 22;
          const cx = w * 0.5 + Math.sin(state.phase * 1.1 + r * 0.9) * (35 + r * 4);
          ctx.beginPath();
          ctx.moveTo(cx - span, ry);
          ctx.lineTo(cx + span, ry);
          ctx.stroke();
        }
        ctx.restore();
      }

      // Warm fireplace floor glow
      if (showFire) {
        ctx.save();
        const fGlow = ctx.createRadialGradient(w * 0.5, h * 1.02, 20, w * 0.5, h * 1.0, Math.max(w, h) * 0.55);
        fGlow.addColorStop(0, 'rgba(251, 146, 60, 0.28)');
        fGlow.addColorStop(0.55, 'rgba(234, 88, 12, 0.1)');
        fGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = fGlow;
        ctx.fillRect(0, h * 0.45, w, h * 0.55);
        ctx.restore();
      }

      // Periodic lightning flash & thunder pulse during Storm
      if (showStorm) {
        if (state.lightningCooldown > 0) {
          state.lightningCooldown -= 1;
        } else if (Math.random() < 0.015) {
          state.lightningAlpha = 0.52;
          state.lightningCooldown = 135 + Math.floor(Math.random() * 140);
          if (state.ambientNodes.storm && state.ambientNodes.storm.rumbleGain && state.audioCtx) {
            const rg = state.ambientNodes.storm.rumbleGain.gain;
            const nowT = state.audioCtx.currentTime;
            try {
              rg.cancelScheduledValues(nowT);
              rg.setValueAtTime(0.45, nowT);
              rg.exponentialRampToValueAtTime(0.24, nowT + 1.4);
            } catch (e) {}
          }
        }
        if (state.lightningAlpha > 0.01) {
          ctx.save();
          ctx.fillStyle = `rgba(224, 242, 254, ${state.lightningAlpha.toFixed(3)})`;
          ctx.fillRect(0, 0, w, h * 0.65);
          ctx.restore();
          state.lightningAlpha *= 0.85;
        }
      }

      if (showRain || showSnow || showFire || showPetals || showCyber) {
        ctx.save();
        for (let i = 0; i < particleCap; i++) {
          const p = state.particles[i];

          // Rain & Storm Rain Streaks
          if (showRain) {
            p.y += p.vy * (showStorm ? 2.15 : 1.45);
            p.x += p.vx * (showStorm ? 2.2 : 1);
            if (p.y > 1) { p.y = -0.02; p.x = Math.random(); }
            if (p.x < 0) p.x = 1;
            if (p.x > 1) p.x = 0;
            const rx = p.x * w;
            const ry = p.y * h;
            ctx.strokeStyle = showStorm ? 'rgba(147, 197, 253, 0.56)' : 'rgba(125, 211, 252, 0.42)';
            ctx.lineWidth = showStorm ? 1.5 : 1.2;
            ctx.beginPath();
            ctx.moveTo(rx, ry);
            ctx.lineTo(rx - (showStorm ? 5.5 : 2.5), ry + p.len * (showStorm ? 1.35 : 1));
            ctx.stroke();
          }

          // Falling Snowflakes
          if (showSnow) {
            p.sy += p.vy * 0.3;
            p.sx += Math.sin(state.phase + i) * 0.00075;
            if (p.sy > 1) { p.sy = -0.02; p.sx = Math.random(); }
            if (p.sx < 0) p.sx = 1;
            if (p.sx > 1) p.sx = 0;
            ctx.fillStyle = 'rgba(241, 245, 249, 0.76)';
            ctx.beginPath();
            ctx.arc(p.sx * w, p.sy * h, p.size, 0, Math.PI * 2);
            ctx.fill();
          }

          // Rising Fire Embers
          if (showFire) {
            p.fy -= p.vy * 0.42;
            p.fx += Math.sin(state.phase * 1.8 + i) * 0.0009;
            if (p.fy < 0.15) { p.fy = 1.02; p.fx = Math.random(); }
            if (p.fx < 0) p.fx = 1;
            if (p.fx > 1) p.fx = 0;
            const alpha = Math.max(0.15, Math.min(0.9, (p.fy - 0.15) * 1.1));
            ctx.fillStyle = i % 3 === 0 ? `rgba(253, 224, 71, ${alpha})` : `rgba(251, 146, 60, ${alpha})`;
            ctx.beginPath();
            ctx.arc(p.fx * w, p.fy * h, Math.max(1.2, p.size * 0.85), 0, Math.PI * 2);
            ctx.fill();
          }

          // Floating Sakura Cherry-Blossom Petals
          if (showPetals) {
            p.py += p.vy * 0.36;
            p.px += 0.0008 + Math.sin(state.phase * 1.3 + i) * 0.0011;
            p.ang += 0.025;
            if (p.py > 1.02) { p.py = -0.03; p.px = Math.random(); }
            if (p.px > 1.02) p.px = -0.02;
            ctx.save();
            ctx.translate(p.px * w, p.py * h);
            ctx.rotate(p.ang);
            ctx.fillStyle = i % 2 === 0 ? 'rgba(244, 114, 182, 0.72)' : 'rgba(251, 207, 232, 0.75)';
            ctx.beginPath();
            ctx.ellipse(0, 0, p.size * 1.9, p.size * 0.95, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }

          // Vertical Cyber Neon Data Laser Streaks
          if (showCyber) {
            p.cy += p.vy * 0.95;
            if (p.cy > 1.05) { p.cy = -0.08; p.cx = Math.random(); }
            const lx = p.cx * w;
            const ly = p.cy * h;
            ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.52)`;
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            ctx.moveTo(lx, ly);
            ctx.lineTo(lx, ly + p.len * 1.8);
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
      const activeCity = _getCity(state.cityId);
      const localList = typeof radio.getStationsForCity === 'function'
        ? radio.getStationsForCity(state.cityId)
        : radio.stations.filter((s) => s.cityId === state.cityId);
      const otherList = radio.stations.filter((s) => s.cityId !== state.cityId);
      const optHtml = (s) => `<option value="${s.id}" ${s.id === curId ? 'selected' : ''}>${s.flag || s.icon || '📻'} ${_escapeHtml(s.name)}</option>`;

      let html = '';
      if (localList.length) {
        const localLbl = `${_t('ftv_local_group')} · ${_cityName(activeCity)}`;
        html += `<optgroup label="${_escapeHtml(localLbl)}">${localList.map(optHtml).join('')}</optgroup>`;
      }
      html += `<optgroup label="${_escapeHtml(_t('ftv_global_group'))}">${otherList.map(optHtml).join('')}</optgroup>`;
      stSel.innerHTML = html;

      const localBtn = document.getElementById('ftvLocalFmBtn');
      if (localBtn) {
        if (localList.length >= 2) {
          const curIdx = localList.findIndex((s) => s.id === curId);
          const pos = curIdx >= 0 ? curIdx + 1 : 1;
          localBtn.style.display = 'inline-flex';
          localBtn.textContent = `${_t('ftv_local_fm')} ${pos}/${localList.length}`;
          localBtn.classList.toggle('active', curIdx >= 0);
        } else {
          localBtn.style.display = 'none';
        }
      }
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

  window.focusTvCycleLocalStation = function () {
    if (window.REMO_RADIO && typeof window.REMO_RADIO.cycleCityStation === 'function') {
      window.REMO_RADIO.cycleCityStation(state.cityId, true);
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
