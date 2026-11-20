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

  let _savedVisualMode = 'photo';
  try {
    if (typeof localStorage !== 'undefined' && localStorage.getItem('remo_ftv_mode') === 'neon') {
      _savedVisualMode = 'neon';
    }
  } catch (e) {}

  const state = {
    isOpen: false,
    cityId: 'montreal',
    prevCityId: '',
    citySwitchTs: 0,
    visualMode: _savedVisualMode,
    parallaxX: 0,
    parallaxY: 0,
    targetParallaxX: 0,
    targetParallaxY: 0,
    rafId: null,
    particles: [],
    glassDrops: [],
    bokehOrbs: [],
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
    roomPopoverOpen: false,
    chatPopoverOpen: false,
    unreadChatCount: 0,
    chatPeekTimerId: null,
    _lastSeenChatMsgId: '',
    _chatSnapshotPrimedKey: '',
    _lastSelfMsgId: '',
    _joinedRoomTs: 0,
    zenMode: false,
    obsMode: false,
    zenIntervalId: null,
    lightningAlpha: 0,
    lightningCooldown: 0,
    ambientNodes: {},
    pomodoroActive: false,
    pomodoroRemainingSec: 25 * 60,
    pomodoroTimerId: null,
    clockIntervalId: null,
    room: {
      active: false,
      id: '',
      durMin: 25,
      selectedDurMin: 25,
      startEpochSec: 0,
      lastAwardedCycle: -1,
      peerId: 'ftvp_' + Math.random().toString(36).slice(2, 9),
      peers: new Map(),
      messages: [],
      bc: null,
      heartbeatId: null,
      fsUnsub: null
    }
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

  function _cityCountry(city) {
    if (typeof window.getCityCountry === 'function') return window.getCityCountry(city, _lang());
    return _lang() === 'fr' ? (city.country_fr || city.country_en || '') : (city.country_en || city.country_fr || '');
  }

  function _flagHtml(iconOrObj, fallback, w, h) {
    if (window.REMO_FLAGS && typeof window.REMO_FLAGS.renderFlagOrIconHtml === 'function') {
      return window.REMO_FLAGS.renderFlagOrIconHtml(iconOrObj, fallback, w, h);
    }
    if (typeof iconOrObj === 'object' && iconOrObj) {
      return _escapeHtml(iconOrObj.flag || iconOrObj.icon || fallback || '📻');
    }
    return _escapeHtml(iconOrObj || fallback || '📻');
  }

  function _setTextIfChanged(el, txt) {
    if (!el) return;
    const next = String(txt ?? '');
    if (el.textContent !== next) el.textContent = next;
  }

  function _setHtmlIfChanged(el, html) {
    if (!el) return;
    const next = String(html ?? '');
    if (el._lastHtmlCache !== next || (next && !el.firstChild)) {
      el._lastHtmlCache = next;
      el.innerHTML = next;
    }
  }

  const _cityPhotoCache = {};
  function _getCityPhotoImg(city) {
    if (!city || !city.id) return null;
    const cid = String(city.id).toLowerCase();
    let src = '';
    if (typeof window.resolveCityRealPhotoUrl === 'function') {
      src = window.resolveCityRealPhotoUrl(city);
    } else {
      src = city.cardImageUrl || city.imageUrl || '';
      if (!src && typeof window.getDefaultCityCardImageUrl === 'function') {
        src = window.getDefaultCityCardImageUrl(cid);
      } else if (!src && window.REMO_BUNDLED_CITY_IMAGE_IDS && typeof window.REMO_BUNDLED_CITY_IMAGE_IDS.has === 'function' && window.REMO_BUNDLED_CITY_IMAGE_IDS.has(cid)) {
        src = `./img/cities/${cid}.jpg`;
      }
    }
    if (!src || src.startsWith('data:image/svg')) return null;

    const cached = _cityPhotoCache[cid];
    if (cached && cached._requestedSrc === src) return cached;
    if (typeof Image === 'undefined') return null;

    const img = new Image();
    img._requestedSrc = src;
    img.crossOrigin = 'anonymous';
    img.decoding = 'async';
    img.onerror = () => {
      if (img.crossOrigin && !img._retriedNoCors && /^https?:\/\//i.test(src)) {
        img._retriedNoCors = true;
        img._taintedNoCors = true;
        img.removeAttribute('crossorigin');
        img.crossOrigin = null;
        img.src = src;
      }
    };
    img.src = src;
    _cityPhotoCache[cid] = img;
    return img;
  }

  function _drawCoverPhoto(ctx, img, w, h, zoom, panX, panY) {
    if (!img || !img.complete || !(img.naturalWidth > 0 && img.naturalHeight > 0)) return false;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const scale = Math.max(w / iw, h / ih) * (zoom || 1);
    const dw = iw * scale;
    const dh = ih * scale;
    const dx = (w - dw) * 0.5 + (panX || 0);
    const dy = (h - dh) * 0.5 + (panY || 0);
    ctx.drawImage(img, dx, dy, dw, dh);
    return true;
  }

  function _syncVisualModeBtn() {
    const btn = document.getElementById('ftvVisualModeBtn');
    if (!btn) return;
    const isPhoto = state.visualMode !== 'neon';
    btn.classList.toggle('active', isPhoto);
    btn.setAttribute('data-i18n', isPhoto ? 'ftv_view_real' : 'ftv_view_neon');
    btn.textContent = _t(isPhoto ? 'ftv_view_real' : 'ftv_view_neon');
  }

  window.toggleFocusTvVisualMode = function (forceMode) {
    if (forceMode === 'photo' || forceMode === 'neon') {
      state.visualMode = forceMode;
    } else {
      state.visualMode = state.visualMode === 'neon' ? 'photo' : 'neon';
    }
    try {
      if (typeof localStorage !== 'undefined') localStorage.setItem('remo_ftv_mode', state.visualMode);
    } catch (e) {}
    _syncVisualModeBtn();
    if (typeof window.remoToast === 'function') {
      window.remoToast(_t(state.visualMode === 'neon' ? 'ftv_mode_neon_toast' : 'ftv_mode_photo_toast'), 'info');
    }
  };

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
            <button type="button" class="ftv-hud-btn ftv-fly-btn" id="ftvFlyRandomBtn" onclick="focusTvFlyRandom()" data-i18n="ftv_fly_random">
              ✈️ Fly Random
            </button>
          </div>

          <div class="ftv-top-actions">
            <div class="ftv-weather-pill" id="ftvWeatherPill">🕒 --:-- · 🌤️ --°C</div>
            <button type="button" class="ftv-hud-btn" id="ftvPomodoroBtn" onclick="toggleFocusTvPomodoro()">
              ⏱️ 25:00
            </button>
            <div class="ftv-room-wrap" id="ftvRoomWrap">
              <button type="button" class="ftv-hud-btn ftv-invite-btn" id="ftvInviteRoomBtn" onclick="toggleFocusTvRoomPopover()" data-i18n="ftv_invite_btn">
                👥 Invite
              </button>
              <div class="ftv-room-popover" id="ftvRoomPopover" aria-hidden="true">
                <div class="ftv-room-pop-title" data-i18n="ftv_room_title">👥 Focus Together Room</div>
                <div class="ftv-room-pop-sub" data-i18n="ftv_room_sub">Share this link — friends get the same 4D city, radio &amp; synced timer.</div>
                <label class="ftv-room-lbl" for="ftvRoomCodeInput" data-i18n="ftv_room_code_lbl">Room Code</label>
                <input type="text" id="ftvRoomCodeInput" class="ftv-room-input" maxlength="24" placeholder="tokyo-7k2m" />
                <div class="ftv-room-dur-row">
                  <span class="ftv-room-lbl" data-i18n="ftv_room_dur_lbl">Synced Sprint</span>
                  <div class="ftv-room-dur-pills">
                    <button type="button" class="ftv-amb-btn active" id="ftvRoomDur25" onclick="selectFocusTvRoomDur(25)">25m</button>
                    <button type="button" class="ftv-amb-btn" id="ftvRoomDur50" onclick="selectFocusTvRoomDur(50)">50m</button>
                  </div>
                </div>
                <button type="button" class="ftv-room-copy-btn" id="ftvRoomCopyBtn" onclick="copyFocusTvRoomInvite()" data-i18n="ftv_room_copy_btn">📋 Copy Room Invite Link</button>
                <div class="ftv-room-net-row" id="ftvRoomNetRow">
                  <button type="button" class="ftv-amb-btn" onclick="shareFocusTvRoomTo('whatsapp')">🟢 WA</button>
                  <button type="button" class="ftv-amb-btn" onclick="shareFocusTvRoomTo('telegram')">✈️ TG</button>
                  <button type="button" class="ftv-amb-btn" onclick="shareFocusTvRoomTo('facebook')">📘 FB</button>
                  <button type="button" class="ftv-amb-btn" onclick="shareFocusTvRoomTo('x')">𝕏</button>
                  <button type="button" class="ftv-amb-btn" onclick="shareFocusTvRoomTo('reddit')">👽 RD</button>
                  <button type="button" class="ftv-amb-btn" onclick="shareFocusTvRoomTo('native')">📲</button>
                </div>
                <div class="ftv-room-pop-actions">
                  <button type="button" class="ftv-amb-btn ftv-room-leave" id="ftvRoomLeaveBtn" onclick="leaveFocusTvRoom()" style="display:none;width:100%;justify-content:center;" data-i18n="ftv_room_leave_btn">🚪 Leave Room</button>
                </div>
              </div>
            </div>
            <div class="ftv-chat-wrap" id="ftvChatWrap">
              <button type="button" class="ftv-hud-btn ftv-chat-toggle-btn" id="ftvChatToggleBtn" onclick="toggleFocusTvChatPopover()" aria-expanded="false" aria-controls="ftvChatPopover">
                <span class="ftv-chat-btn-lbl" data-i18n="ftv_chat_btn">💬 Chat</span>
                <span class="ftv-chat-btn-sep">·</span>
                <span class="ftv-chat-btn-meta ftv-chat-btn-listeners" id="ftvBtnListeners">🎧 12</span>
                <span class="ftv-chat-btn-sep">·</span>
                <span class="ftv-chat-btn-meta ftv-chat-btn-coins" id="ftvBtnCoins">🪙 0/30</span>
                <span class="ftv-chat-unread-badge" id="ftvChatUnreadBadge" hidden></span>
              </button>
              <button type="button" class="ftv-chat-peek" id="ftvChatPeekToast" onclick="toggleFocusTvChatPopover(true)" aria-hidden="true"></button>
              <div class="ftv-chat-popover" id="ftvChatPopover" aria-hidden="true">
                <div class="ftv-chat-pop-head">
                  <div class="ftv-chat-pop-title" id="ftvChatPopTitle" data-i18n="ftv_chat_title">💬 Live City Chat</div>
                  <button type="button" class="ftv-chat-pop-close" onclick="toggleFocusTvChatPopover(false)" aria-label="Close">✕</button>
                </div>
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
            </div>
            <button type="button" class="ftv-hud-btn ftv-mode-btn active" id="ftvVisualModeBtn" onclick="toggleFocusTvVisualMode()" data-i18n="ftv_view_real">
              📷 4D Real
            </button>
            <button type="button" class="ftv-hud-btn ftv-zen-btn" id="ftvZenBtn" onclick="toggleFocusTvZenMode()" data-i18n="ftv_zen_btn">
              🕰️ Zen
            </button>
            <button type="button" class="ftv-hud-btn ftv-obs-btn" id="ftvObsBtn" onclick="toggleFocusTvObsMode()" data-i18n="ftv_obs_btn" title="OBS Browser Source Mode">
              🎥 OBS
            </button>
            <button type="button" class="ftv-hud-btn ftv-obs-copy-btn" id="ftvObsCopyBtn" onclick="copyFocusTvObsUrl()" data-i18n-title="ftv_obs_copy_btn" title="Copy OBS Browser Source URL">
              🔗 OBS
            </button>
            <button type="button" class="ftv-hud-btn ftv-share-btn" onclick="shareFocusTvVibe()" data-i18n="ftv_share_vibe">
              📲 Share Vibe
            </button>
            <button type="button" class="ftv-hud-btn ftv-exit-btn" onclick="closeFocusTvModal()" data-i18n="ftv_exit">
              ✕ Exit TV
            </button>
          </div>
        </div>

        <!-- CENTER FLOATING CITY HERO CALLOUT & ZEN SCREENSAVER CLOCK -->
        <div class="ftv-center-title">
          <div class="ftv-center-flag" id="ftvHeroCityName">
            <canvas id="ftvHeroFlagCanvas" class="ftv-waving-flag-cv" width="76" height="52"></canvas>
            <span id="ftvHeroCityLabel">MONTRÉAL</span>
          </div>
          <div class="ftv-center-sub" id="ftvHeroCitySub">Canada · Cyber-Creative Capital</div>
          <div class="ftv-zen-clock-wrap" id="ftvZenClockWrap">
            <div class="ftv-zen-time" id="ftvZenTime">--:--:--</div>
            <div class="ftv-zen-meta" id="ftvZenMeta">📻 REMO Cyber-LoFi</div>
          </div>
        </div>
        <button type="button" class="ftv-zen-exit-pill" id="ftvZenExitPill" onclick="toggleFocusTvZenMode(false)" data-i18n="ftv_zen_exit">
          ✨ Show Controls (Esc)
        </button>
        <div class="ftv-obs-watermark" id="ftvObsWatermark" onclick="toggleFocusTvObsMode(false)" title="remoworld.com/study-room">
          <span class="ftv-obs-live-dot"></span>
          <span>REMO 4D · <span data-i18n="ftv_obs_wm">remoworld.com/study-room</span></span>
        </div>

        <!-- BOTTOM CONTROL DECK -->
        <div class="ftv-bottom-dock">
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
      if (state.audioCtx && state.audioCtx.state === 'suspended') {
        state.audioCtx.resume().catch(() => {});
      }
      if (state.zenMode && e.target && (e.target.id === 'ftvSceneCanvas' || e.target.classList.contains('ftv-vignette') || e.target.classList.contains('ftv-hud'))) {
        window.toggleFocusTvZenMode(false);
        return;
      }
      if (state.fxPopoverOpen && e.target && !e.target.closest('#ftvAmbientGroup')) {
        state.fxPopoverOpen = false;
        _syncAmbientButtons();
      }
      if (state.roomPopoverOpen && e.target && !e.target.closest('#ftvRoomWrap')) {
        state.roomPopoverOpen = false;
        _syncRoomPopoverUI();
      }
      if (state.chatPopoverOpen && e.target && !e.target.closest('#ftvChatWrap')) {
        state.chatPopoverOpen = false;
        _syncChatPopoverUI();
      }
    });

    const roomCodeInp = wrap.querySelector('#ftvRoomCodeInput');
    if (roomCodeInp) {
      roomCodeInp.addEventListener('input', () => _syncRoomPopoverUI());
    }

    wrap.addEventListener('mousemove', (e) => {
      if (!state.isOpen) return;
      const w = window.innerWidth || 1280;
      const h = window.innerHeight || 720;
      state.targetParallaxX = ((e.clientX / w) - 0.5) * 26;
      state.targetParallaxY = ((e.clientY / h) - 0.5) * 16;
    });
    wrap.addEventListener('mouseleave', () => {
      state.targetParallaxX = 0;
      state.targetParallaxY = 0;
    });

    document.body.appendChild(wrap);
    _syncVisualModeBtn();
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
    if (state.fxPopoverOpen) {
      state.roomPopoverOpen = false;
      state.chatPopoverOpen = false;
      _syncRoomPopoverUI();
      _syncChatPopoverUI();
    }
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

    state.glassDrops = Array.from({ length: 28 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 2.2 + Math.random() * 3.4,
      vy: 0.00035 + Math.random() * 0.0009,
      trail: 14 + Math.random() * 28,
      stall: Math.floor(Math.random() * 45)
    }));

    state.bokehOrbs = Array.from({ length: 22 }, () => ({
      x: Math.random(),
      y: 0.42 + Math.random() * 0.45,
      r: 8 + Math.random() * 26,
      sp: 0.00025 + Math.random() * 0.00045,
      ph: Math.random() * Math.PI * 2,
      warm: Math.random() > 0.4
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
    if (!state.stars.length || !state.glassDrops.length || !state.bokehOrbs.length) _initSceneParticles();

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

      state.parallaxX += (state.targetParallaxX - state.parallaxX) * 0.06;
      state.parallaxY += (state.targetParallaxY - state.parallaxY) * 0.06;

      const condLow = String(wx.cond_en || '').toLowerCase();
      const showStorm = Boolean(state.ambient.storm || condLow.includes('thunder') || condLow.includes('storm'));
      const showLightning = Boolean(state.ambient.storm);
      const showSnow = Boolean(state.ambient.snow || condLow.includes('snow') || Number(wx.tempC) <= 0);
      const showRain = Boolean(state.ambient.rain || showStorm || wx.naturalStorm || condLow.includes('rain') || condLow.includes('drizzle'));
      const showOcean = Boolean(state.ambient.ocean);
      const showFire = Boolean(state.ambient.fire);
      const showPetals = Boolean(state.ambient.petals);
      const showCyber = Boolean(state.ambient.cyber);
      const showStars = hr < 7 || hr >= 18;
      const isDawn = hr >= 6 && hr <= 8;
      const isDusk = hr >= 17 && hr <= 19;
      const isNight = hr < 6 || hr >= 20;
      const horizonY = h * 0.68;

      const photoImg = state.visualMode !== 'neon' ? _getCityPhotoImg(city) : null;
      const hasPhoto = Boolean(photoImg && photoImg.complete && photoImg.naturalWidth > 0);

      if (hasPhoto) {
        const kbZoom = 1.07 + 0.028 * Math.sin(state.phase * 0.22) + (isPlaying ? 0.01 * Math.sin(state.phase * 0.85) : 0);
        const kbPanX = Math.sin(state.phase * 0.16) * (w * 0.015) - state.parallaxX;
        const kbPanY = Math.cos(state.phase * 0.13) * (h * 0.012) - state.parallaxY;

        ctx.fillStyle = '#030712';
        ctx.fillRect(0, 0, w, h);

        let drawnFade = false;
        if (state.prevCityId && state.prevCityId !== city.id && state.citySwitchTs) {
          const elapsed = Date.now() - state.citySwitchTs;
          if (elapsed < 850) {
            const prevImg = _getCityPhotoImg(_getCity(state.prevCityId));
            if (prevImg && prevImg.complete && prevImg.naturalWidth > 0) {
              _drawCoverPhoto(ctx, prevImg, w, h, kbZoom, kbPanX, kbPanY);
              const tNorm = Math.min(1, Math.max(0, elapsed / 850));
              const smooth = tNorm * tNorm * (3 - 2 * tNorm);
              ctx.save();
              ctx.globalAlpha = smooth;
              _drawCoverPhoto(ctx, photoImg, w, h, kbZoom, kbPanX, kbPanY);
              ctx.restore();
              drawnFade = true;
            }
          }
        }
        if (!drawnFade) {
          _drawCoverPhoto(ctx, photoImg, w, h, kbZoom, kbPanX, kbPanY);
        }

        // Time-of-day atmospheric light grading synced to live city hour
        if (isDawn) {
          const dawnG = ctx.createLinearGradient(0, 0, w * 0.6, h);
          dawnG.addColorStop(0, 'rgba(251, 146, 60, 0.24)');
          dawnG.addColorStop(0.5, 'rgba(56, 189, 248, 0.10)');
          dawnG.addColorStop(1, 'rgba(15, 23, 42, 0.34)');
          ctx.fillStyle = dawnG;
          ctx.fillRect(0, 0, w, h);
        } else if (isDusk) {
          const duskG = ctx.createLinearGradient(0, 0, 0, h);
          duskG.addColorStop(0, 'rgba(109, 40, 217, 0.28)');
          duskG.addColorStop(0.55, 'rgba(244, 114, 182, 0.16)');
          duskG.addColorStop(1, 'rgba(245, 158, 11, 0.18)');
          ctx.fillStyle = duskG;
          ctx.fillRect(0, 0, w, h);
        } else if (isNight) {
          ctx.fillStyle = 'rgba(2, 6, 23, 0.44)';
          ctx.fillRect(0, 0, w, h);

          // Twinkling upper-sky stars over night cities
          for (let i = 0; i < state.stars.length; i++) {
            const st = state.stars[i];
            if (st.y > 0.38) continue;
            st.tw += st.sp;
            const alpha = 0.18 + 0.55 * (0.5 + 0.5 * Math.sin(st.tw));
            ctx.fillStyle = `rgba(226, 232, 240, ${alpha.toFixed(2)})`;
            ctx.beginPath();
            ctx.arc(st.x * w, st.y * h, st.r * 0.9, 0, Math.PI * 2);
            ctx.fill();
          }

          // Music-reactive soft foreground bokeh lights
          for (let i = 0; i < state.bokehOrbs.length; i++) {
            const b = state.bokehOrbs[i];
            b.y -= b.sp;
            if (b.y < 0.35) b.y = 0.92;
            const pulse = 0.72 + 0.28 * Math.sin(state.phase * 1.4 + b.ph);
            const bx = (b.x * w + Math.sin(state.phase * 0.5 + b.ph) * 14);
            const by = b.y * h;
            const br = b.r * (0.85 + 0.32 * energy) * pulse;
            const bGrad = ctx.createRadialGradient(bx, by, 0, bx, by, br);
            const col = b.warm ? '253, 224, 71' : `${rgb.r}, ${rgb.g}, ${rgb.b}`;
            bGrad.addColorStop(0, `rgba(${col}, ${(0.12 + 0.1 * energy).toFixed(2)})`);
            bGrad.addColorStop(1, `rgba(${col}, 0)`);
            ctx.fillStyle = bGrad;
            ctx.beginPath();
            ctx.arc(bx, by, br, 0, Math.PI * 2);
            ctx.fill();
          }
        } else {
          ctx.fillStyle = 'rgba(6, 12, 28, 0.16)';
          ctx.fillRect(0, 0, w, h);
        }

        // Top & bottom contrast framing gradient (keeps center city crystal-clear)
        const frameVig = ctx.createLinearGradient(0, 0, 0, h);
        frameVig.addColorStop(0, 'rgba(2, 6, 20, 0.58)');
        frameVig.addColorStop(0.18, 'rgba(2, 6, 20, 0.16)');
        frameVig.addColorStop(0.55, 'rgba(2, 6, 20, 0.08)');
        frameVig.addColorStop(0.8, 'rgba(2, 6, 20, 0.52)');
        frameVig.addColorStop(1, 'rgba(2, 6, 20, 0.78)');
        ctx.fillStyle = frameVig;
        ctx.fillRect(0, 0, w, h);
      } else {
        // Sky Gradient synced to real city local hour (4D Neon Mode / Fallback)
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
      }

      // Render Real Waving National Flag next to Hero City Name
      const flagCv = document.getElementById('ftvHeroFlagCanvas');
      if (flagCv && window.REMO_FLAGS && typeof window.REMO_FLAGS.drawWavingFlag === 'function') {
        const fctx = flagCv.getContext && flagCv.getContext('2d');
        if (fctx) {
          fctx.clearRect(0, 0, flagCv.width, flagCv.height);
          const wind = showStorm ? 1.85 : (showRain || showOcean ? 1.35 : 0.92);
          window.REMO_FLAGS.drawWavingFlag(fctx, city, 3, 4, flagCv.width - 6, flagCv.height - 8, state.phase, wind, true);
        }
      }

      // Low-Profile Bottom Stereo Spectrum Equalizer (keeps center monument/photo clear)
      const visBaseY = state.zenMode ? h - 22 : Math.max(h * 0.72, h - (w <= 760 ? 236 : 196));
      const bars = 48;
      const barSpan = Math.min(w * 0.78, 760);
      const startX = (w - barSpan) * 0.5;
      const step = barSpan / bars;
      ctx.save();
      ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.22)`;
      ctx.fillRect(startX, visBaseY, barSpan, 1.5);
      for (let b = 0; b < bars; b++) {
        const centerDist = Math.abs(b - (bars - 1) / 2) / ((bars - 1) / 2);
        const envelope = 1 - centerDist * 0.52;
        const wave =
          0.45 +
          0.3 * Math.sin(state.phase * 2.4 + b * 0.45) +
          0.25 * Math.cos(state.phase * 3.8 - b * 0.68);
        const bh = Math.max(3, wave * envelope * 28 * energy);
        const bx = startX + b * step + step * 0.22;
        const bw = Math.max(2.5, step * 0.56);

        const grad = ctx.createLinearGradient(bx, visBaseY - bh, bx, visBaseY);
        grad.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.92)`);
        grad.addColorStop(1, 'rgba(56, 189, 248, 0.35)');
        ctx.fillStyle = grad;
        ctx.fillRect(bx, visBaseY - bh, bw, bh);
      }
      ctx.restore();

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

      // Subtle distant upper-sky lightning glow only when user toggles Storm FX
      if (showLightning) {
        if (state.lightningCooldown > 0) {
          state.lightningCooldown -= 1;
        } else if (Math.random() < 0.015) {
          state.lightningAlpha = 0.18;
          state.lightningCooldown = 160 + Math.floor(Math.random() * 160);
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
          const lg = ctx.createRadialGradient(w * 0.5, 0, 10, w * 0.5, h * 0.14, Math.max(w, h) * 0.58);
          lg.addColorStop(0, `rgba(186, 230, 253, ${state.lightningAlpha.toFixed(3)})`);
          lg.addColorStop(0.55, `rgba(147, 197, 253, ${(state.lightningAlpha * 0.35).toFixed(3)})`);
          lg.addColorStop(1, 'rgba(186, 230, 253, 0)');
          ctx.fillStyle = lg;
          ctx.fillRect(0, 0, w, h * 0.5);
          ctx.restore();
          state.lightningAlpha *= 0.85;
        }
      } else {
        state.lightningAlpha = 0;
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

      // Foreground Window-Glass Condensation & Sliding Raindrops (when Rain / Storm active)
      if (showRain && state.glassDrops.length) {
        ctx.save();
        for (let i = 0; i < state.glassDrops.length; i++) {
          const d = state.glassDrops[i];
          if (d.stall > 0) {
            d.stall -= 1;
          } else {
            d.y += d.vy * (showStorm ? 1.85 : 1.05);
            d.x += Math.sin(state.phase * 1.5 + i) * 0.00018;
            if (Math.random() < 0.014) d.stall = 18 + Math.floor(Math.random() * 36);
            if (d.y > 1.04) {
              d.y = -0.03;
              d.x = Math.random();
              d.stall = Math.floor(Math.random() * 35);
            }
          }
          const gx = d.x * w;
          const gy = d.y * h;
          const dr = d.r;

          // Faint vertical water trail behind sliding drop
          ctx.strokeStyle = 'rgba(203, 213, 225, 0.14)';
          ctx.lineWidth = Math.max(0.9, dr * 0.45);
          ctx.beginPath();
          ctx.moveTo(gx, gy - d.trail);
          ctx.lineTo(gx, gy);
          ctx.stroke();

          // Dark refraction rim under droplet + soft translucent glass bead
          ctx.fillStyle = 'rgba(15, 23, 42, 0.28)';
          ctx.beginPath();
          ctx.arc(gx + 0.6, gy + 1.0, dr * 1.06, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = 'rgba(224, 242, 254, 0.24)';
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.42)';
          ctx.lineWidth = 0.7;
          ctx.beginPath();
          ctx.arc(gx, gy, dr, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Crisp white window highlight glint
          ctx.fillStyle = 'rgba(255, 255, 255, 0.78)';
          ctx.beginPath();
          ctx.arc(gx - dr * 0.3, gy - dr * 0.3, Math.max(0.7, dr * 0.32), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      ctx.restore();
      state.rafId = requestAnimationFrame(renderFrame);
    };

    state.rafId = requestAnimationFrame(renderFrame);
  }

  /* ── 4. POMODORO & FOCUS TOGETHER SYNC ENGINE (+15 🪙 REWARD) ── */
  function _sanitizeRoomCode(raw) {
    const clean = String(raw || '').toLowerCase().replace(/[^a-z0-9_-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 24);
    return clean;
  }

  function _defaultRoomCode() {
    const rnd = Math.floor(100 + Math.random() * 900);
    return `${(state.cityId || 'remo').slice(0, 10)}-${rnd}`;
  }

  function _getRoomSelfMeta() {
    const u = window.REMO_STORE && typeof window.REMO_STORE.getCurrentUser === 'function'
      ? window.REMO_STORE.getCurrentUser()
      : null;
    const city = _getCity((u && u.homeCity) || state.cityId);
    return {
      peerId: state.room.peerId,
      name: (u && u.name) ? String(u.name).slice(0, 20) : (_lang() === 'fr' ? 'Citoyen' : 'Citizen'),
      cityFlag: (city && city.flag) || '🌍',
      ts: Date.now()
    };
  }

  function _awardPomodoroCoins() {
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

  function _syncRoomTimerFromClock() {
    if (!state.room.active || !state.room.startEpochSec) return;
    const durSec = Math.max(60, (state.room.durMin || 25) * 60);
    const nowSec = Math.floor(Date.now() / 1000);
    const elapsed = Math.max(0, nowSec - state.room.startEpochSec);
    const cycleIdx = Math.floor(elapsed / durSec);
    state.pomodoroRemainingSec = durSec - (elapsed % durSec);
    if (state.room.lastAwardedCycle >= 0 && cycleIdx > state.room.lastAwardedCycle) {
      state.room.lastAwardedCycle = cycleIdx;
      _awardPomodoroCoins();
    } else if (state.room.lastAwardedCycle < 0) {
      state.room.lastAwardedCycle = cycleIdx;
    }
  }

  function _broadcastRoomEvent(type, extra = {}) {
    if (!state.room.bc || !state.room.active) return;
    try {
      state.room.bc.postMessage({
        type,
        roomId: state.room.id,
        peer: _getRoomSelfMeta(),
        startEpochSec: state.room.startEpochSec,
        durMin: state.room.durMin,
        ...extra
      });
    } catch (e) {}
  }

  function _syncRoomFirestorePeer(isLeaving = false) {
    const db = window.REMO_STORE && window.REMO_STORE.fbDb;
    if (!db || !state.room.id) return;
    try {
      const selfMeta = _getRoomSelfMeta();
      const docRef = db.collection('remo_focus_rooms').doc(state.room.id);
      if (isLeaving) {
        docRef.set({
          peers: { [state.room.peerId]: null },
          lastActiveAt: Date.now()
        }, { merge: true }).catch(() => {});
        return;
      }
      docRef.set({
        id: state.room.id,
        cityId: state.cityId,
        startEpochSec: state.room.startEpochSec,
        durMin: state.room.durMin,
        peers: { [state.room.peerId]: selfMeta },
        lastActiveAt: Date.now()
      }, { merge: true }).catch(() => {});
    } catch (e) {}
  }

  function _pruneStalePeers() {
    const cutoff = Date.now() - 95000;
    for (const [pid, meta] of state.room.peers.entries()) {
      if (pid === state.room.peerId) continue;
      if (!meta || Number(meta.ts || 0) < cutoff) state.room.peers.delete(pid);
    }
  }

  function _syncRoomPopoverUI() {
    const pop = document.getElementById('ftvRoomPopover');
    const btn = document.getElementById('ftvInviteRoomBtn');
    const codeInp = document.getElementById('ftvRoomCodeInput');
    const leaveBtn = document.getElementById('ftvRoomLeaveBtn');
    const d25 = document.getElementById('ftvRoomDur25');
    const d50 = document.getElementById('ftvRoomDur50');

    if (pop) {
      pop.classList.toggle('open', state.roomPopoverOpen);
      pop.setAttribute('aria-hidden', state.roomPopoverOpen ? 'false' : 'true');
    }
    if (btn) {
      btn.classList.toggle('active', state.room.active || state.roomPopoverOpen);
      if (state.room.active) {
        btn.removeAttribute('data-i18n');
        btn.textContent = `👥 #${state.room.id}`;
      } else {
        btn.setAttribute('data-i18n', 'ftv_invite_btn');
        btn.textContent = _t('ftv_invite_btn');
      }
    }
    if (codeInp && !codeInp.value) {
      codeInp.value = state.room.id || _defaultRoomCode();
    }
    const selDur = state.room.active ? state.room.durMin : state.room.selectedDurMin;
    if (d25) d25.classList.toggle('active', Number(selDur) === 25);
    if (d50) d50.classList.toggle('active', Number(selDur) === 50);
    if (leaveBtn) leaveBtn.style.display = state.room.active ? 'inline-flex' : 'none';
  }

  window.shareFocusTvRoomTo = async function (platform) {
    const codeInp = document.getElementById('ftvRoomCodeInput');
    const selDur = state.room.active ? state.room.durMin : state.room.selectedDurMin;
    const roomId = _sanitizeRoomCode(codeInp ? codeInp.value : '') || state.room.id || _defaultRoomCode();
    const startSec = state.room.active ? state.room.startEpochSec : Math.floor(Date.now() / 1000);
    const previewUrl = _buildRoomShareUrl(roomId, startSec, selDur);
    const city = _getCity(state.cityId);
    const isFr = _lang() === 'fr';
    const msg = isFr
      ? `Rejoins ma salle Focus 4D (${selDur}m synchro) à ${city.flag} ${_cityName(city)} sur REMO World :`
      : `Join my synced ${selDur}m 4D Focus Room in ${city.flag} ${_cityName(city)} on REMO World:`;
    if (window.REMO_SHARE_HUB && typeof window.REMO_SHARE_HUB.shareToNetwork === 'function') {
      await window.REMO_SHARE_HUB.shareToNetwork(platform || 'whatsapp', {
        url: previewUrl,
        title: `REMO Focus Room — ${city.flag} ${_cityName(city)}`,
        shareText: msg,
        isFr,
        context: 'focus'
      });
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(`${msg}\n${previewUrl}`)}`, '_blank', 'noopener,noreferrer');
    }
  };

  function _leaveFocusRoom(clearUrlState = true) {
    if (state.room.active) {
      _broadcastRoomEvent('LEAVE');
      _syncRoomFirestorePeer(true);
    }
    clearInterval(state.room.heartbeatId);
    state.room.heartbeatId = null;
    if (typeof state.room.fsUnsub === 'function') {
      try { state.room.fsUnsub(); } catch (e) {}
      state.room.fsUnsub = null;
    }
    if (state.room.bc) {
      try { state.room.bc.close(); } catch (e) {}
      state.room.bc = null;
    }
    state.room.active = false;
    state.room.id = '';
    state.room.startEpochSec = 0;
    state.room.lastAwardedCycle = -1;
    state.room.peers.clear();
    state.room.messages = [];
    if (clearUrlState) {
      state.pomodoroActive = false;
      clearInterval(state.pomodoroTimerId);
      state.pomodoroTimerId = null;
      state.pomodoroRemainingSec = 25 * 60;
      _renderPomodoroBtn();
      _renderChatStrip();
      _syncRoomPopoverUI();
      _updateZenClockDisplay();
    }
  }

  function _joinFocusRoom(roomSlug, explicitStartSec = 0, explicitDurMin = 25) {
    const cleanId = _sanitizeRoomCode(roomSlug) || _defaultRoomCode();
    _leaveFocusRoom(false);

    const durMin = Number(explicitDurMin) === 50 ? 50 : 25;
    const durSec = durMin * 60;
    const nowSec = Math.floor(Date.now() / 1000);
    const hasExplicitStart = Number(explicitStartSec) > 1600000000;
    const startSec = hasExplicitStart ? Math.floor(Number(explicitStartSec)) : (nowSec - (nowSec % durSec));

    state.room.active = true;
    state.room.id = cleanId;
    state.room.durMin = durMin;
    state.room.selectedDurMin = durMin;
    state.room.startEpochSec = startSec;
    state.room.lastAwardedCycle = -1;
    state.room.peers.set(state.room.peerId, _getRoomSelfMeta());

    // Local cross-tab realtime sync
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        const bc = new BroadcastChannel('remo_focus_rooms_v1');
        bc.onmessage = (ev) => {
          const msg = ev && ev.data;
          if (!msg || msg.roomId !== state.room.id || !state.room.active) return;
          if (msg.peer && msg.peer.peerId && msg.peer.peerId !== state.room.peerId) {
            if (msg.type === 'LEAVE') {
              state.room.peers.delete(msg.peer.peerId);
            } else {
              state.room.peers.set(msg.peer.peerId, { ...msg.peer, ts: Date.now() });
            }
          }
          if (msg.type === 'PING' && !hasExplicitStart && msg.startEpochSec) {
            state.room.startEpochSec = msg.startEpochSec;
            state.room.durMin = Number(msg.durMin) === 50 ? 50 : 25;
          }
          if (msg.type === 'CHAT' && msg.chatItem && !state.room.messages.some((m) => m.id === msg.chatItem.id)) {
            state.room.messages.push(msg.chatItem);
            if (state.room.messages.length > 20) state.room.messages = state.room.messages.slice(-20);
          }
          _renderChatStrip();
        };
        state.room.bc = bc;
        _broadcastRoomEvent('PING');
      } catch (e) {}
    }

    // Best-effort Firestore cross-device sync
    const db = window.REMO_STORE && window.REMO_STORE.fbDb;
    if (db) {
      try {
        state.room.fsUnsub = db.collection('remo_focus_rooms').doc(cleanId).onSnapshot((docSnap) => {
          if (!state.room.active || !docSnap || !docSnap.exists) return;
          const data = docSnap.data() || {};
          if (!hasExplicitStart && data.startEpochSec && Number(data.startEpochSec) > 1600000000) {
            state.room.startEpochSec = Number(data.startEpochSec);
            state.room.durMin = Number(data.durMin) === 50 ? 50 : 25;
            _syncRoomTimerFromClock();
            _renderPomodoroBtn();
          }
          if (data.peers && typeof data.peers === 'object') {
            Object.entries(data.peers).forEach(([pid, pMeta]) => {
              if (pMeta && pid !== state.room.peerId) {
                state.room.peers.set(pid, pMeta);
              } else if (!pMeta) {
                state.room.peers.delete(pid);
              }
            });
            _pruneStalePeers();
          }
          if (Array.isArray(data.messages)) {
            data.messages.forEach((m) => {
              if (m && m.id && !state.room.messages.some((x) => x.id === m.id)) {
                state.room.messages.push(m);
              }
            });
            state.room.messages.sort((a, b) => Number(a.ts || 0) - Number(b.ts || 0));
            if (state.room.messages.length > 20) state.room.messages = state.room.messages.slice(-20);
          }
          _renderChatStrip();
        }, () => {});
        _syncRoomFirestorePeer(false);
      } catch (e) {}
    }

    state.room.heartbeatId = setInterval(() => {
      if (!state.room.active || !state.isOpen) return;
      state.room.peers.set(state.room.peerId, _getRoomSelfMeta());
      _pruneStalePeers();
      _broadcastRoomEvent('PING');
      _syncRoomFirestorePeer(false);
      _renderChatStrip();
    }, 20000);

    // Start synchronized countdown automatically
    _syncRoomTimerFromClock();
    state.pomodoroActive = true;
    clearInterval(state.pomodoroTimerId);
    state.pomodoroTimerId = setInterval(() => {
      if (!state.pomodoroActive) return;
      _syncRoomTimerFromClock();
      _renderPomodoroBtn();
      _updateZenClockDisplay();
    }, 1000);

    state._joinedRoomTs = Date.now();
    state._chatSnapshotPrimedKey = '';
    state.unreadChatCount = 0;
    const codeInp = document.getElementById('ftvRoomCodeInput');
    if (codeInp) codeInp.value = cleanId;
    _renderPomodoroBtn();
    _renderChatStrip();
    _syncRoomPopoverUI();
    _syncChatPopoverUI();
    _updateZenClockDisplay();
  }

  window.toggleFocusTvRoomPopover = function () {
    state.roomPopoverOpen = !state.roomPopoverOpen;
    if (state.roomPopoverOpen) {
      state.fxPopoverOpen = false;
      state.chatPopoverOpen = false;
      _syncChatPopoverUI();
    }
    _syncAmbientButtons();
    _syncRoomPopoverUI();
  };

  window.selectFocusTvRoomDur = function (min) {
    state.room.selectedDurMin = Number(min) === 50 ? 50 : 25;
    if (state.room.active) {
      state.room.durMin = state.room.selectedDurMin;
      state.room.startEpochSec = Math.floor(Date.now() / 1000);
      state.room.lastAwardedCycle = 0;
      _syncRoomTimerFromClock();
      _broadcastRoomEvent('PING');
      _syncRoomFirestorePeer(false);
      _renderPomodoroBtn();
    }
    _syncRoomPopoverUI();
  };

  window.leaveFocusTvRoom = function () {
    state.roomPopoverOpen = false;
    _leaveFocusRoom(true);
  };

  window.copyFocusTvRoomInvite = async function () {
    const codeInp = document.getElementById('ftvRoomCodeInput');
    const desiredSlug = _sanitizeRoomCode(codeInp ? codeInp.value : '') || state.room.id || _defaultRoomCode();
    const dur = state.room.selectedDurMin || 25;
    if (!state.room.active || state.room.id !== desiredSlug) {
      _joinFocusRoom(desiredSlug, Math.floor(Date.now() / 1000), dur);
    }
    const url = _buildRoomShareUrl(state.room.id, state.room.startEpochSec, state.room.durMin);
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const ta = document.createElement('textarea');
        ta.value = url;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
    } catch (e) {}
    state.roomPopoverOpen = false;
    _syncRoomPopoverUI();
    if (typeof window.remoToast === 'function') {
      window.remoToast(_t('ftv_room_copied_toast'), 'fanfare');
    }
  };

  function _renderPomodoroBtn() {
    const btn = document.getElementById('ftvPomodoroBtn');
    if (!btn) return;
    const mins = String(Math.floor(state.pomodoroRemainingSec / 60)).padStart(2, '0');
    const secs = String(state.pomodoroRemainingSec % 60).padStart(2, '0');
    btn.classList.toggle('active', state.pomodoroActive);
    if (state.room.active) {
      btn.textContent = `⏱️ ${mins}:${secs} · 🔗`;
    } else {
      btn.textContent = state.pomodoroActive ? `⏸️ ${mins}:${secs}` : `⏱️ ${mins}:${secs}`;
    }
  }

  window.toggleFocusTvPomodoro = function () {
    if (state.room.active) {
      window.toggleFocusTvRoomPopover();
      return;
    }
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
      if (state.room.active) {
        _syncRoomTimerFromClock();
        _renderPomodoroBtn();
        _updateZenClockDisplay();
        return;
      }
      state.pomodoroRemainingSec -= 1;
      if (state.pomodoroRemainingSec <= 0) {
        state.pomodoroActive = false;
        clearInterval(state.pomodoroTimerId);
        state.pomodoroTimerId = null;
        state.pomodoroRemainingSec = 25 * 60;
        _awardPomodoroCoins();
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
    if (listenersEl) {
      if (state.room.active) {
        _pruneStalePeers();
        const peerCount = Math.max(1, state.room.peers.size);
        _setTextIfChanged(listenersEl, `👥 ${peerCount} ${_t('ftv_room_focusing')} · #${state.room.id}`);
        listenersEl.classList.add('in-room');
      } else {
        const onlineCount = (store && typeof store.getOnlineCitizensList === 'function')
          ? Math.max(12, store.getOnlineCitizensList().length + 11)
          : 18;
        _setTextIfChanged(listenersEl, `🎧 ${onlineCount} ${_t('ftv_listeners_lbl')}`);
        listenersEl.classList.remove('in-room');
      }
    }

    if (l2eEl && window.REMO_RADIO && typeof window.REMO_RADIO._loadL2EState === 'function') {
      const l2e = window.REMO_RADIO._loadL2EState();
      const minsLeft = Math.max(1, Math.ceil((600 - (l2e.secProgress || 0)) / 60));
      _setTextIfChanged(l2eEl, `🪙 +5 / ${minsLeft}m (${l2e.coinsToday || 0}/30)`);
    }

    const btnListeners = document.getElementById('ftvBtnListeners');
    if (btnListeners) {
      if (state.room && state.room.active) {
        const peerCountBtn = Math.max(1, (state.room.peers && state.room.peers.size) || 1);
        _setTextIfChanged(btnListeners, `👥 ${peerCountBtn}`);
        btnListeners.classList.add('in-room');
      } else {
        const lm = listenersEl && (listenersEl.textContent || '').match(/🎧\s*\d+/);
        _setTextIfChanged(btnListeners, lm ? lm[0] : '🎧 12');
        btnListeners.classList.remove('in-room');
      }
    }
    const btnCoins = document.getElementById('ftvBtnCoins');
    if (btnCoins && window.REMO_RADIO && typeof window.REMO_RADIO._loadL2EState === 'function') {
      const l2eBtn = window.REMO_RADIO._loadL2EState();
      const minsLeftBtn = Math.max(1, Math.ceil((600 - (l2eBtn.secProgress || 0)) / 60));
      _setTextIfChanged(btnCoins, `🪙 ${l2eBtn.coinsToday || 0}/30 · ${minsLeftBtn}m`);
    }
    const popTitleEl = document.getElementById('ftvChatPopTitle');
    if (popTitleEl) {
      const nextPopTitle = state.room && state.room.active
        ? `👥 ${_t('ftv_chat_room_title')} · #${state.room.id}`
        : _t('ftv_chat_title');
      _setTextIfChanged(popTitleEl, nextPopTitle);
    }
    const btnLblEl = document.querySelector('#ftvChatToggleBtn .ftv-chat-btn-lbl');
    if (btnLblEl) _setTextIfChanged(btnLblEl, _t('ftv_chat_btn'));

    if (!feed) return;
    const renderMsgLines = (msgs) => msgs.map((m) => `
      <div class="ftv-chat-line">
        <span class="ftv-chat-author">${_flagHtml(m.cityFlag || city.flag || '🌍', '🌍', 16, 11)} @${_escapeHtml(m.author || 'Citizen')}:</span>
        <span class="ftv-chat-text">${_escapeHtml(m.text || '')}</span>
      </div>
    `).join('');

    let nextHtml = '';
    let latestRealMsg = null;
    if (state.room.active) {
      const recentRoomMsgs = state.room.messages.slice(-8);
      latestRealMsg = recentRoomMsgs.length ? recentRoomMsgs[recentRoomMsgs.length - 1] : null;
      if (!recentRoomMsgs.length) {
        const roomWelcome = _t('ftv_room_welcome', { room: state.room.id, dur: state.room.durMin });
        nextHtml = `<div class="ftv-chat-line ftv-chat-welcome">${_escapeHtml(roomWelcome)}</div>`;
      } else {
        nextHtml = renderMsgLines(recentRoomMsgs);
      }
    } else {
      const allRooms = (store && store.state && store.state.chatMessages) || {};
      const cityMsgs = Array.isArray(allRooms[state.cityId]) ? allRooms[state.cityId] : [];
      const globalMsgs = Array.isArray(allRooms.global) ? allRooms.global : [];
      const merged = cityMsgs.length ? cityMsgs : globalMsgs;
      const recent = merged.slice(-8);
      latestRealMsg = recent.length ? recent[recent.length - 1] : null;

      if (!recent.length) {
        const fallback = lang === 'fr'
          ? `Fenêtre ouverte sur ${_cityName(city)} — écoutez en direct et laissez un mot.`
          : `Tuned into ${_cityName(city)} — enjoy the live atmosphere and drop a hello.`;
        nextHtml = `<div class="ftv-chat-line ftv-chat-welcome">${_flagHtml(city.flag || '🌍', '🌍', 16, 11)} ${_escapeHtml(fallback)}</div>`;
      } else {
        nextHtml = renderMsgLines(recent);
      }
    }
    _setHtmlIfChanged(feed, nextHtml);
    if (state.chatPopoverOpen) {
      feed.scrollTop = feed.scrollHeight;
    }

    const streamKey = (state.room && state.room.active) ? ('room:' + state.room.id) : ('city:' + state.cityId);
    const latestKey = _getChatMsgKey(latestRealMsg);
    if (state._chatSnapshotPrimedKey !== streamKey) {
      state._chatSnapshotPrimedKey = streamKey;
      state._lastSeenChatMsgId = latestKey;
    } else if (latestKey && latestKey !== state._lastSeenChatMsgId) {
      state._lastSeenChatMsgId = latestKey;
      const isSelf = Boolean(state._lastSelfMsgId && latestRealMsg && latestRealMsg.id === state._lastSelfMsgId);
      const isFreshInRoom = !(state.room && state.room.active) || !latestRealMsg.ts || Number(latestRealMsg.ts) >= ((state._joinedRoomTs || 0) - 5000);
      if (!state.chatPopoverOpen && !isSelf && isFreshInRoom) {
        state.unreadChatCount = (state.unreadChatCount || 0) + 1;
        _syncChatPopoverUI();
        _showChatPeekToast(latestRealMsg, city);
      }
    }
  }

  function _getChatMsgKey(m) {
    if (!m) return '';
    return String(m.id || `${m.author || ''}|${m.ts || ''}|${m.text || ''}`);
  }

  function _positionChatOverlayEl(el) {
    if (!el) return;
    const wrap = document.getElementById('ftvChatWrap');
    if (!wrap || typeof wrap.getBoundingClientRect !== 'function') return;
    try {
      const vw = window.innerWidth || 1280;
      if (vw <= 600) {
        el.classList.remove('align-right');
        return;
      }
      const rect = wrap.getBoundingClientRect();
      const panelW = el.classList.contains('ftv-chat-peek') ? 350 : 390;
      const alignsRight = (rect.left + panelW > vw - 12) && (rect.right - panelW >= 12);
      el.classList.toggle('align-right', alignsRight);
    } catch (e) {}
  }

  function _hideChatPeekToast() {
    if (state.chatPeekTimerId) {
      clearTimeout(state.chatPeekTimerId);
      state.chatPeekTimerId = null;
    }
    const toast = document.getElementById('ftvChatPeekToast');
    if (toast) {
      toast.classList.remove('visible');
      toast.setAttribute('aria-hidden', 'true');
    }
  }

  function _showChatPeekToast(msg, city) {
    if (!msg || !state.isOpen || state.zenMode || state.chatPopoverOpen) return;
    const toast = document.getElementById('ftvChatPeekToast');
    if (!toast) return;
    const author = _escapeHtml(msg.author || (_lang() === 'fr' ? 'Citoyen' : 'Citizen'));
    const text = _escapeHtml(msg.text || '');
    const flag = _flagHtml(msg.cityFlag || (city && city.flag) || '🌍', '🌍', 14, 10);
    toast.innerHTML = `<span class="ftv-chat-peek-dot"></span><span class="ftv-chat-peek-author">${flag} @${author}:</span> <span class="ftv-chat-peek-text">${text}</span>`;
    _positionChatOverlayEl(toast);
    toast.classList.add('visible');
    toast.setAttribute('aria-hidden', 'false');
    clearTimeout(state.chatPeekTimerId);
    state.chatPeekTimerId = setTimeout(() => {
      _hideChatPeekToast();
    }, 4000);
  }

  function _syncChatPopoverUI() {
    const pop = document.getElementById('ftvChatPopover');
    const btn = document.getElementById('ftvChatToggleBtn');
    const badge = document.getElementById('ftvChatUnreadBadge');
    const isOpen = Boolean(state.chatPopoverOpen && !state.zenMode);
    if (pop) {
      if (isOpen) _positionChatOverlayEl(pop);
      pop.classList.toggle('open', isOpen);
      pop.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
    }
    if (btn) {
      btn.classList.toggle('active', isOpen);
      btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    }
    if (badge) {
      const cnt = Math.max(0, Number(state.unreadChatCount || 0));
      badge.hidden = cnt <= 0 || isOpen;
      _setTextIfChanged(badge, cnt > 9 ? '9+' : (cnt > 0 ? String(cnt) : ''));
    }
  }

  window.toggleFocusTvChatPopover = function (forceVal) {
    const nextOpen = typeof forceVal === 'boolean' ? forceVal : !state.chatPopoverOpen;
    state.chatPopoverOpen = nextOpen;
    if (nextOpen) {
      state.roomPopoverOpen = false;
      state.fxPopoverOpen = false;
      state.unreadChatCount = 0;
      _hideChatPeekToast();
      _syncRoomPopoverUI();
      _syncAmbientButtons();
    }
    _syncChatPopoverUI();
    if (nextOpen) {
      const feed = document.getElementById('ftvChatFeed');
      if (feed) feed.scrollTop = feed.scrollHeight;
      const inp = document.getElementById('ftvChatInput');
      if (inp && typeof inp.focus === 'function') {
        try { inp.focus({ preventScroll: true }); } catch (e) {}
      }
    }
  };

  window.sendFocusTvChatMessage = function () {
    const inp = document.getElementById('ftvChatInput');
    if (!inp) return;
    const txt = inp.value.trim();
    if (!txt) return;

    const store = window.REMO_STORE;
    const u = store && store.getCurrentUser
      ? (store.getCurrentUser() || store.ensureGuestOrCitizen('Focus Citizen', '', state.cityId))
      : null;
    const myCity = _getCity((u && u.homeCity) || state.cityId);
    const msgObj = {
      id: 'ftv_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      uid: (u && u.uid) || state.room.peerId,
      author: (u && u.name) || (_lang() === 'fr' ? 'Citoyen' : 'Citizen'),
      cityFlag: myCity.flag || '🌍',
      text: txt,
      ts: Date.now()
    };
    state._lastSelfMsgId = msgObj.id;

    if (state.room.active) {
      state.room.messages.push(msgObj);
      if (state.room.messages.length > 20) state.room.messages = state.room.messages.slice(-20);
      _broadcastRoomEvent('CHAT', { chatItem: msgObj });
      const db = store && store.fbDb;
      if (db && state.room.id) {
        try {
          db.collection('remo_focus_rooms').doc(state.room.id).set({
            messages: state.room.messages.slice(-15),
            lastActiveAt: Date.now()
          }, { merge: true }).catch(() => {});
        } catch (e) {}
      }
      inp.value = '';
      _renderChatStrip();
      return;
    }

    if (store && store.state) {
      store.state.chatMessages = store.state.chatMessages || {};
      store.state.chatMessages[state.cityId] = store.state.chatMessages[state.cityId] || [];
      store.state.chatMessages[state.cityId].push(msgObj);
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
        return `<button type="button" class="ftv-star-chip ${active}" onclick="focusTvSwitchCity('${cid}')">${_flagHtml(c.flag, '🌍', 16, 11)} ${_escapeHtml(_cityName(c))}</button>`;
      }).join('');
    }

    if (sel && cities.length) {
      const wetGroup = [];
      const nightGroup = [];
      const dayGroup = [];

      cities.forEach((c) => {
        const name = typeof window.getCityName === 'function' ? window.getCityName(c, lang) : c.name_en;
        const wx = _getLiveWx(c);
        const condLow = String(wx.cond_en || '').toLowerCase();
        const isWet = Boolean(wx.naturalStorm) || condLow.includes('rain') || condLow.includes('drizzle') || condLow.includes('storm') || condLow.includes('snow') || Number(wx.tempC) <= 0;
        const hr = typeof wx.hour === 'number' ? wx.hour : 12;
        const isNight = Boolean(wx.isNight) || hr >= 20 || hr < 6;
        const label = `${c.flag} ${_escapeHtml(name)} · ${wx.timeStr || '--:--'} ${wx.icon || '🌤️'} ${wx.tempC ?? 20}°C`;
        const opt = `<option value="${c.id}" ${c.id === state.cityId ? 'selected' : ''}>${label}</option>`;
        if (isWet) wetGroup.push(opt);
        else if (isNight) nightGroup.push(opt);
        else dayGroup.push(opt);
      });

      let html = '';
      if (wetGroup.length) html += `<optgroup label="${_escapeHtml(_t('ftv_grp_weather'))}">${wetGroup.join('')}</optgroup>`;
      if (nightGroup.length) html += `<optgroup label="${_escapeHtml(_t('ftv_grp_night'))}">${nightGroup.join('')}</optgroup>`;
      if (dayGroup.length) html += `<optgroup label="${_escapeHtml(_t('ftv_grp_day'))}">${dayGroup.join('')}</optgroup>`;
      sel.innerHTML = html || cities.map((c) => `<option value="${c.id}" ${c.id === state.cityId ? 'selected' : ''}>${c.flag} ${_escapeHtml(_cityName(c))}</option>`).join('');
    }
  }

  function _updateZenClockDisplay() {
    const timeEl = document.getElementById('ftvZenTime');
    const metaEl = document.getElementById('ftvZenMeta');
    const city = _getCity(state.cityId);
    const wx = _getLiveWx(city);
    const secs = String(new Date().getSeconds()).padStart(2, '0');
    if (timeEl) {
      _setTextIfChanged(timeEl, `${wx.timeStr || '--:--'}:${secs}`);
    }
    if (metaEl) {
      const st = window.REMO_RADIO && window.REMO_RADIO.currentStation;
      const stName = st ? `${st.flag || st.icon || '📻'} ${st.name}` : '📻 REMO Cyber-LoFi';
      let extraRoom = '';
      if (state.room && state.room.active) {
        const rm = String(Math.floor(state.pomodoroRemainingSec / 60)).padStart(2, '0');
        const rs = String(state.pomodoroRemainingSec % 60).padStart(2, '0');
        extraRoom = `  ·  👥 #${state.room.id} · ⏱️ ${rm}:${rs}`;
      } else if (state.pomodoroActive) {
        const rm = String(Math.floor(state.pomodoroRemainingSec / 60)).padStart(2, '0');
        const rs = String(state.pomodoroRemainingSec % 60).padStart(2, '0');
        extraRoom = `  ·  ⏱️ ${rm}:${rs}`;
      }
      _setTextIfChanged(metaEl, `${wx.icon || '🌤️'} ${wx.tempC ?? 20}°C  ·  ${stName}${extraRoom}`);
    }
  }

  function _updateCityHeroAndWeather() {
    const city = _getCity(state.cityId);
    const wx = _getLiveWx(city);
    const lang = _lang();

    const wp = document.getElementById('ftvWeatherPill');
    if (wp) {
      const cond = lang === 'fr' ? (wx.cond_fr || wx.cond_en || '') : (wx.cond_en || '');
      _setTextIfChanged(wp, `🕒 ${wx.timeStr || '--:--'} · ${wx.icon || '🌤️'} ${wx.tempC ?? 20}°C ${cond}`);
    }

    const heroLabel = document.getElementById('ftvHeroCityLabel');
    const heroName = document.getElementById('ftvHeroCityName');
    const heroSub = document.getElementById('ftvHeroCitySub');
    if (heroLabel) {
      _setTextIfChanged(heroLabel, _cityName(city).toUpperCase());
    } else if (heroName) {
      _setTextIfChanged(heroName, _cityName(city).toUpperCase());
    }
    if (heroSub) {
      const country = _cityCountry(city);
      const tag = lang === 'fr' ? (city.tagline_fr || city.tagline_en || '') : (city.tagline_en || '');
      _setTextIfChanged(heroSub, country && tag ? `${country} · ${tag}` : (tag || country || ''));
    }
    _updateZenClockDisplay();
  }

  window.focusTvFlyRandom = function () {
    const cities = _getCities();
    if (!cities.length) return;
    const candidates = cities.filter((c) => c.id !== state.cityId);
    const pool = candidates.length ? candidates : cities;
    const picked = pool[Math.floor(Math.random() * pool.length)];
    if (!picked) return;

    const wasPlaying = Boolean(window.REMO_RADIO && window.REMO_RADIO.isPlaying);
    window.focusTvSwitchCity(picked.id);
    if (!wasPlaying && window.REMO_RADIO && typeof window.REMO_RADIO.tuneToCity === 'function') {
      window.REMO_RADIO.tuneToCity(picked.id, true);
      syncFocusTvUI();
    }
    const wx = _getLiveWx(picked);
    if (typeof window.remoToast === 'function') {
      window.remoToast(`✈️ ${picked.flag} ${_cityName(picked)} · ${wx.icon || '🌤️'} ${wx.tempC ?? 20}°C`, 'info');
    }
  };

  window.toggleFocusTvZenMode = function (forceVal) {
    state.zenMode = typeof forceVal === 'boolean' ? forceVal : !state.zenMode;
    if (state.zenMode && state.obsMode) {
      state.obsMode = false;
      const ovObs = document.getElementById('remoFocusTvOverlay');
      const obsBtn = document.getElementById('ftvObsBtn');
      if (ovObs) ovObs.classList.remove('ftv-obs-mode');
      if (obsBtn) obsBtn.classList.remove('active');
    }
    const overlay = document.getElementById('remoFocusTvOverlay');
    const zenBtn = document.getElementById('ftvZenBtn');
    if (overlay) overlay.classList.toggle('ftv-zen-mode', state.zenMode);
    if (zenBtn) zenBtn.classList.toggle('active', state.zenMode);

    clearInterval(state.zenIntervalId);
    state.zenIntervalId = null;
    if (state.zenMode || state.obsMode) {
      state.fxPopoverOpen = false;
      state.roomPopoverOpen = false;
      state.chatPopoverOpen = false;
      _hideChatPeekToast();
      _syncAmbientButtons();
      _syncRoomPopoverUI();
      _syncChatPopoverUI();
      _updateZenClockDisplay();
      state.zenIntervalId = setInterval(() => {
        if (state.isOpen && (state.zenMode || state.obsMode)) _updateZenClockDisplay();
      }, 1000);
    }
  };

  window.toggleFocusTvObsMode = function (forceVal, silent) {
    const nextObs = typeof forceVal === 'boolean' ? forceVal : !state.obsMode;
    state.obsMode = nextObs;
    if (state.obsMode && state.zenMode) {
      state.zenMode = false;
      const ovZen = document.getElementById('remoFocusTvOverlay');
      const zenBtn = document.getElementById('ftvZenBtn');
      if (ovZen) ovZen.classList.remove('ftv-zen-mode');
      if (zenBtn) zenBtn.classList.remove('active');
    }
    const overlay = document.getElementById('remoFocusTvOverlay');
    const obsBtn = document.getElementById('ftvObsBtn');
    if (overlay) overlay.classList.toggle('ftv-obs-mode', state.obsMode);
    if (obsBtn) obsBtn.classList.toggle('active', state.obsMode);

    clearInterval(state.zenIntervalId);
    state.zenIntervalId = null;
    if (state.obsMode || state.zenMode) {
      state.fxPopoverOpen = false;
      state.roomPopoverOpen = false;
      state.chatPopoverOpen = false;
      _hideChatPeekToast();
      _syncAmbientButtons();
      _syncRoomPopoverUI();
      _syncChatPopoverUI();
      _updateZenClockDisplay();
      state.zenIntervalId = setInterval(() => {
        if (state.isOpen && (state.zenMode || state.obsMode)) _updateZenClockDisplay();
      }, 1000);
      if (state.obsMode && !silent && typeof window.remoToast === 'function') {
        window.remoToast(_t('ftv_obs_on_toast'), 'info');
      }
    }
  };

  function _buildObsShareUrl() {
    const base = _buildVibeShareUrl();
    return base + (base.includes('?') ? '&' : '?') + 'obs=1';
  }
  window.getFocusTvObsShareUrl = _buildObsShareUrl;

  window.copyFocusTvObsUrl = async function () {
    const obsUrl = _buildObsShareUrl();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(obsUrl);
      } else {
        const ta = document.createElement('textarea');
        ta.value = obsUrl;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
    } catch (e) {}
    if (typeof window.remoToast === 'function') {
      window.remoToast(_t('ftv_obs_copied_toast'), 'fanfare');
    }
    return obsUrl;
  };

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
      if (stIcon) {
        stIcon.innerHTML = _flagHtml(st, st.icon || '📻', 26, 18);
        stIcon.classList.toggle('is-live', Boolean(radio && radio.isPlaying));
      }
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
    _syncRoomPopoverUI();
    _syncChatPopoverUI();
  }
  window.syncFocusTvUI = syncFocusTvUI;

  /* ── 7. RADIO BRIDGE CONTROLS ── */
  window.focusTvSwitchCity = function (cityId) {
    const nextId = String(cityId || 'montreal').toLowerCase();
    if (nextId !== state.cityId) {
      state.prevCityId = state.cityId;
      state.citySwitchTs = Date.now();
      state.unreadChatCount = 0;
      _hideChatPeekToast();
      _syncChatPopoverUI();
    }
    state.cityId = nextId;
    _getCityPhotoImg(_getCity(state.cityId));
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

  /* ── 8. SHARE CUSTOM VIBE LINK & 9:16 CARD SNAPSHOT ── */
  function _buildVibeShareUrl() {
    const city = _getCity(state.cityId);
    const activeFx = AMBIENT_EFFECT_KEYS.filter((k) => Boolean(state.ambient[k]));
    const st = window.REMO_RADIO && window.REMO_RADIO.currentStation;
    let shareUrl = `${window.location.origin}${window.location.pathname}?tv=${encodeURIComponent(city.id)}`;
    if (activeFx.length) shareUrl += `&fx=${encodeURIComponent(activeFx.join(','))}`;
    if (st && st.id) shareUrl += `&st=${encodeURIComponent(st.id)}`;
    if (state.room && state.room.active && state.room.id) {
      shareUrl += `&room=${encodeURIComponent(state.room.id)}`;
      if (state.room.startEpochSec) shareUrl += `&rt=${Math.floor(state.room.startEpochSec)}`;
      shareUrl += `&rd=${state.room.durMin === 50 ? 50 : 25}`;
    }
    return shareUrl;
  }

  function _buildRoomShareUrl(roomId, startEpochSec, durMin) {
    const city = _getCity(state.cityId);
    const activeFx = AMBIENT_EFFECT_KEYS.filter((k) => Boolean(state.ambient[k]));
    const st = window.REMO_RADIO && window.REMO_RADIO.currentStation;
    let url = `${window.location.origin}${window.location.pathname}?tv=${encodeURIComponent(city.id)}`;
    if (activeFx.length) url += `&fx=${encodeURIComponent(activeFx.join(','))}`;
    if (st && st.id) url += `&st=${encodeURIComponent(st.id)}`;
    const slug = _sanitizeRoomCode(roomId) || state.room.id || _defaultRoomCode();
    const rt = Math.floor(Number(startEpochSec) || Math.floor(Date.now() / 1000));
    const rd = Number(durMin) === 50 ? 50 : 25;
    url += `&room=${encodeURIComponent(slug)}&rt=${rt}&rd=${rd}`;
    return url;
  }

  window.getFocusTvVibeUrl = _buildVibeShareUrl;
  window.getFocusTvRoomUrl = _buildRoomShareUrl;

  function _drawFocusVibeCanvas(c, city, wx, st, shareUrl, animT = 0) {
    if (!c) return;
    c.width = 540;
    c.height = 960;
    const ctx = c.getContext('2d');
    const rgb = _hexToRgb(city.themeColor || '#38bdf8');
    const isFr = _lang() === 'fr';

    const vPhoto = state.visualMode !== 'neon' ? _getCityPhotoImg(city) : null;
    const hasVPhoto = Boolean(vPhoto && vPhoto.complete && vPhoto.naturalWidth > 0);
    if (hasVPhoto) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(14, 14, 512, 932);
      ctx.clip();
      const vScale = animT > 0 ? (1.05 + 0.03 * Math.sin(animT * 2)) : 1.05;
      _drawCoverPhoto(ctx, vPhoto, 540, 960, vScale, 0, 0);
      const pv = ctx.createLinearGradient(0, 0, 0, 960);
      pv.addColorStop(0, 'rgba(4, 8, 24, 0.72)');
      pv.addColorStop(0.28, 'rgba(4, 8, 24, 0.25)');
      pv.addColorStop(0.7, 'rgba(4, 8, 24, 0.28)');
      pv.addColorStop(1, 'rgba(5, 8, 22, 0.85)');
      ctx.fillStyle = pv;
      ctx.fillRect(0, 0, 540, 960);
      ctx.restore();
    } else {
      const grad = ctx.createLinearGradient(0, 0, 0, 960);
      grad.addColorStop(0, '#040818');
      grad.addColorStop(0.55, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.42)`);
      grad.addColorStop(1, '#050816');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 540, 960);
    }

    const glow = animT > 0 ? (0.55 + 0.35 * Math.sin(animT * 3)) : 0.65;
    ctx.strokeStyle = `rgba(56, 189, 248, ${glow.toFixed(2)})`;
    ctx.lineWidth = 4;
    ctx.strokeRect(14, 14, 512, 932);

    if (!hasVPhoto) {
      const pulseSize = animT > 0 ? (256 + Math.sin(animT * 3.2) * 12) : 260;
      if (typeof window.drawCityLandmark === 'function') {
        window.drawCityLandmark(ctx, city.id, city.themeColor || '#38bdf8', 270, 465, pulseSize);
      }
    }

    ctx.textAlign = 'center';
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 20px Orbitron, sans-serif';
    ctx.fillText('REMO 4D FOCUS TV · LIVE', 270, 82);

    const cityUpper = _cityName(city).toUpperCase();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 38px Orbitron, sans-serif';
    if (window.REMO_FLAGS && typeof window.REMO_FLAGS.drawWavingFlag === 'function' && window.REMO_FLAGS.getCountryCode(city)) {
      const tw = typeof ctx.measureText === 'function' ? ctx.measureText(cityUpper).width : cityUpper.length * 22;
      const fw = 48;
      const gap = 12;
      const startX = Math.max(24, 270 - (fw + gap + tw) * 0.5);
      window.REMO_FLAGS.drawWavingFlag(ctx, city, startX, 114, fw, 34, animT * 4, 1.0, true);
      ctx.textAlign = 'left';
      ctx.fillText(cityUpper, startX + fw + gap, 145);
      ctx.textAlign = 'center';
    } else {
      ctx.fillText(`${city.flag} ${cityUpper}`, 270, 146);
    }

    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText(`🕒 ${wx.timeStr || '--:--'}  ·  ${wx.icon || '🌤️'} ${wx.tempC ?? 20}°C`, 270, 190);

    // Bottom CTA Panel with QR
    ctx.fillStyle = 'rgba(15, 23, 42, 0.78)';
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') ctx.roundRect(28, 764, 484, 152, 18);
    else ctx.rect(28, 764, 484, 152);
    ctx.fill();
    ctx.stroke();

    const textCx = 205;
    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 19px sans-serif';
    const stLabel = `🎧 ${st.name}`.slice(0, 26);
    ctx.fillText(stLabel, textCx, 808);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 20px Orbitron, sans-serif';
    ctx.fillText('REMOWORLD.COM', textCx, 846);

    ctx.fillStyle = '#7dd3fc';
    ctx.font = '700 13px sans-serif';
    ctx.fillText(isFr ? '📻 Radio Live + Météo 4D' : '📻 Live Radio + 4D Weather', textCx, 882);

    if (window.REMO_SHARE_HUB && typeof window.REMO_SHARE_HUB.drawQrOnCanvas === 'function') {
      window.REMO_SHARE_HUB.drawQrOnCanvas(ctx, shareUrl, 378, 780, 118);
    }
  }

  window.shareFocusTvVibe = async function () {
    const city = _getCity(state.cityId);
    const wx = _getLiveWx(city);
    const st = (window.REMO_RADIO && window.REMO_RADIO.currentStation) || { name: 'REMO Cyber-LoFi', flag: '📻' };
    const shareUrl = _buildVibeShareUrl();
    const isFr = _lang() === 'fr';
    const shareText = isFr
      ? `🎧 En direct sur REMO 4D Focus TV à ${city.flag} ${_cityName(city)} (${wx.tempC ?? 20}°C) avec ${st.name} :`
      : `🎧 Vibing live on REMO 4D Focus TV in ${city.flag} ${_cityName(city)} (${wx.tempC ?? 20}°C) with ${st.name}:`;
    const title = `REMO 4D Focus TV — ${city.flag} ${_cityName(city)}`;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      }
    } catch (e) {}

    const overlay = document.getElementById('remoFocusTvOverlay');
    if (!overlay) return;
    let sheet = document.getElementById('ftvVibeShareSheet');
    if (!sheet) {
      sheet = document.createElement('div');
      sheet.id = 'ftvVibeShareSheet';
      sheet.className = 'ftv-vibe-share-sheet';
      sheet.innerHTML = `
        <div class="ftv-vibe-share-card">
          <div class="ftv-vibe-share-hdr">
            <b data-i18n="ftv_vibe_title">📲 4D Focus Vibe Story</b>
            <button type="button" class="ftv-vibe-close" id="ftvVibeShareCloseBtn">✕</button>
          </div>
          <canvas id="ftvVibeShareCanvas" width="540" height="960" class="ftv-vibe-canvas"></canvas>
          <div class="ftv-vibe-primary-row">
            <button type="button" class="ftv-hud-btn ftv-share-btn" id="ftvVibeNativeBtn" style="flex:1;justify-content:center;">📲 TikTok / IG / Native</button>
            <button type="button" class="ftv-hud-btn" id="ftvVibeVideoBtn" style="justify-content:center;background:linear-gradient(135deg,#7c3aed,#db2777);color:#fff;border:none;">🎬 5s Video</button>
            <button type="button" class="ftv-hud-btn" id="ftvVibePngBtn" style="justify-content:center;border-color:#fbbf24;color:#fde047;">📥 PNG</button>
          </div>
          <div class="remo-net-grid" id="ftvVibeNetGrid">
            <button type="button" class="remo-net-btn net-wa" data-ftv-net="whatsapp">🟢 WhatsApp</button>
            <button type="button" class="remo-net-btn net-tg" data-ftv-net="telegram">✈️ Telegram</button>
            <button type="button" class="remo-net-btn net-fb" data-ftv-net="facebook">📘 Facebook</button>
            <button type="button" class="remo-net-btn net-x" data-ftv-net="x">𝕏 Share</button>
            <button type="button" class="remo-net-btn net-tt" data-ftv-net="tiktok">🎵 TikTok</button>
            <button type="button" class="remo-net-btn net-ig" data-ftv-net="instagram">📸 Instagram</button>
            <button type="button" class="remo-net-btn net-rd" data-ftv-net="reddit">👽 Reddit</button>
            <button type="button" class="remo-net-btn net-li" data-ftv-net="linkedin">💼 LinkedIn</button>
          </div>
        </div>
      `;
      sheet.addEventListener('click', (e) => {
        if (e.target === sheet) sheet.classList.remove('open');
      });
      overlay.appendChild(sheet);
      document.getElementById('ftvVibeShareCloseBtn').onclick = () => sheet.classList.remove('open');
    }

    const cv = document.getElementById('ftvVibeShareCanvas');
    _drawFocusVibeCanvas(cv, city, wx, st, shareUrl, 0);
    sheet.classList.add('open');

    const getPng = () => cv.toDataURL('image/png');
    const netShare = (net) => {
      if (window.REMO_SHARE_HUB && typeof window.REMO_SHARE_HUB.shareToNetwork === 'function') {
        window.REMO_SHARE_HUB.shareToNetwork(net, {
          url: shareUrl,
          title,
          shareText,
          isFr,
          context: 'focus',
          fileName: `REMO_4D_FocusTV_${city.id}`,
          getDataUrlFn: getPng
        });
      }
    };

    document.getElementById('ftvVibeNativeBtn').onclick = () => netShare('native');
    document.getElementById('ftvVibePngBtn').onclick = () => {
      if (window.REMO_SHARE_HUB && typeof window.REMO_SHARE_HUB.downloadDataUrl === 'function') {
        window.REMO_SHARE_HUB.downloadDataUrl(getPng(), `REMO_4D_FocusTV_${city.id}.png`);
      }
      if (typeof window.remoToast === 'function') window.remoToast(_t('ftv_share_ready'), 'fanfare');
    };
    document.getElementById('ftvVibeVideoBtn').onclick = () => {
      if (window.REMO_SHARE_HUB && typeof window.REMO_SHARE_HUB.recordCanvasVideoLoop === 'function') {
        window.REMO_SHARE_HUB.recordCanvasVideoLoop(
          cv,
          (tVal) => _drawFocusVibeCanvas(cv, city, wx, st, shareUrl, tVal),
          { isFr, durationMs: 4500, fileName: `REMO_4D_FocusTV_${city.id}.webm` }
        );
      }
    };
    sheet.querySelectorAll('[data-ftv-net]').forEach((b) => {
      b.onclick = () => netShare(b.getAttribute('data-ftv-net'));
    });

    if (typeof window.remoToast === 'function') {
      window.remoToast(_t('ftv_share_ready'), 'fanfare');
    }
  };

  /* ── 9. OPEN / CLOSE PUBLIC ENTRYPOINTS ── */
  window.openFocusTvModal = function (preferredCityId, autoPlayStation = true, options = {}) {
    ensureFocusTvDom();
    const overlay = document.getElementById('remoFocusTvOverlay');
    if (!overlay) return;

    if (preferredCityId) {
      state.cityId = String(preferredCityId).toLowerCase();
    } else if (window.REMO_STORE) {
      const u = window.REMO_STORE.getCurrentUser();
      if (u && u.homeCity) state.cityId = u.homeCity;
    }

    _getCityPhotoImg(_getCity(state.cityId));
    state.isOpen = true;
    overlay.classList.add('open');
    document.body.classList.add('ftv-active');

    if (window.REMO_I18N && typeof window.REMO_I18N.applyDOM === 'function') {
      window.REMO_I18N.applyDOM(overlay);
    }
    _syncVisualModeBtn();

    const opts = options && typeof options === 'object' ? options : {};
    if (window.REMO_RADIO) {
      if (opts.stationId && typeof window.REMO_RADIO.selectStation === 'function' &&
          Array.isArray(window.REMO_RADIO.stations) &&
          window.REMO_RADIO.stations.some((s) => s.id === opts.stationId)) {
        window.REMO_RADIO.selectStation(opts.stationId, autoPlayStation);
      } else if (preferredCityId && typeof window.REMO_RADIO.tuneToCity === 'function') {
        window.REMO_RADIO.tuneToCity(state.cityId, autoPlayStation);
      } else if (autoPlayStation && !window.REMO_RADIO.isPlaying) {
        window.REMO_RADIO.play();
      }
    }

    if (opts.fx) {
      const fxList = Array.isArray(opts.fx) ? opts.fx : String(opts.fx).split(',');
      fxList.forEach((raw) => {
        const k = String(raw || '').trim().toLowerCase();
        if (AMBIENT_EFFECT_KEYS.includes(k)) {
          state.ambient[k] = true;
          _startAmbientChannel(k);
        }
      });
    }

    state.roomPopoverOpen = false;
    state.fxPopoverOpen = false;
    state.chatPopoverOpen = false;
    state.unreadChatCount = 0;
    state._chatSnapshotPrimedKey = '';
    state._lastSeenChatMsgId = '';
    state._lastSelfMsgId = '';
    _hideChatPeekToast();
    if (opts.obs) {
      window.toggleFocusTvObsMode(true, true);
    } else {
      window.toggleFocusTvObsMode(false, true);
      window.toggleFocusTvZenMode(Boolean(opts.zen));
    }
    _renderCitySelectors();
    if (opts.room) {
      _joinFocusRoom(opts.room, opts.roomStartSec, opts.roomDurMin);
    } else if (state.room.active) {
      _leaveFocusRoom(false);
    }
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
    state.roomPopoverOpen = false;
    state.fxPopoverOpen = false;
    state.chatPopoverOpen = false;
    state.unreadChatCount = 0;
    _hideChatPeekToast();
    _syncChatPopoverUI();
    window.toggleFocusTvZenMode(false);
    window.toggleFocusTvObsMode(false, true);
    if (overlay) overlay.classList.remove('open');
    document.body.classList.remove('ftv-active');

    _leaveFocusRoom(true);
    _syncAmbientButtons();

    if (state.rafId) {
      cancelAnimationFrame(state.rafId);
      state.rafId = null;
    }
    clearInterval(state.clockIntervalId);
    state.clockIntervalId = null;
    clearInterval(state.zenIntervalId);
    state.zenIntervalId = null;
    _stopAllAmbient();
  };

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && state.isOpen) {
      if (state.obsMode) {
        window.toggleFocusTvObsMode(false);
      } else if (state.zenMode) {
        window.toggleFocusTvZenMode(false);
      } else if (state.chatPopoverOpen || state.roomPopoverOpen || state.fxPopoverOpen) {
        state.chatPopoverOpen = false;
        state.roomPopoverOpen = false;
        state.fxPopoverOpen = false;
        _syncChatPopoverUI();
        _syncRoomPopoverUI();
        _syncAmbientButtons();
      } else {
        window.closeFocusTvModal();
      }
    }
  });

  window.addEventListener('remo:langchange', () => {
    if (!document.getElementById('remoFocusTvOverlay')) return;
    _renderCitySelectors();
    _syncVisualModeBtn();
    syncFocusTvUI();
    _updateZenClockDisplay();
  });

  window.addEventListener('beforeunload', () => {
    if (state.room && state.room.active) _leaveFocusRoom(false);
  });
})();
