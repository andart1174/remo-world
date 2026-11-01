/* ════════════════════════════════════════════════════════════════════
   REMO WORLD RADIO ENGINE™ — Live World Cities & Chill Vibe Streams
   Continuous-Play Audio Streaming + Anti-Pause Watchdog & MediaSession
   Strict Bilingual (EN / FR Only)
   ════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const REMO_RADIO_STATIONS = [
    // 🎧 VIBES & CHILL STATIONS
    {
      id: 'capital_chill',
      category: 'vibe',
      name: 'Capital Chill UK',
      desc_fr: 'Downtempo, Chillhop & Lofi Beats 24/7',
      desc_en: 'Downtempo, Chillhop & Chilled Beats 24/7',
      icon: '☕',
      streamUrl: 'https://media-ssl.musicradio.com/CapitalChill',
      badge: 'LOFI & CHILL',
      cityId: null
    },
    {
      id: 'somafm_groove',
      category: 'vibe',
      name: 'SomaFM Groove Salad',
      desc_fr: 'Ambient, Downtempo & Chillout Électronique',
      desc_en: 'Ambient, Downtempo & Chilled Electronica',
      icon: '🥗',
      streamUrl: 'https://ice1.somafm.com/groovesalad-128-mp3',
      badge: 'AMBIENT CHILL',
      cityId: null
    },
    {
      id: 'somafm_defcon',
      category: 'vibe',
      name: 'DEF CON Cyber Radio',
      desc_fr: 'Cyberpunk, Synthwave & Underground Beats',
      desc_en: 'Cyberpunk, Synthwave & Underground Beats',
      icon: '⚡',
      streamUrl: 'https://ice2.somafm.com/defcon-128-mp3',
      badge: 'CYBERPUNK',
      cityId: null
    },
    {
      id: 'nightwave_plaza',
      category: 'vibe',
      name: 'Nightwave Plaza',
      desc_fr: 'Vaporwave, Synthwave & Électronique Rétro',
      desc_en: 'Vaporwave, Synthwave & Retro Electronic',
      icon: '🌆',
      streamUrl: 'https://radio.plaza.one/mp3',
      badge: 'VAPORWAVE',
      cityId: null
    },
    {
      id: 'record_chillout',
      category: 'vibe',
      name: 'Deep Sunset Lounge',
      desc_fr: 'Ambiance Café Del Mar & Sunset Relax',
      desc_en: 'Café Del Mar Sunset & Chill Lounge',
      icon: '🌙',
      streamUrl: 'https://radiorecord.hostingradio.ru/chil96.aacp',
      badge: 'DEEP LOUNGE',
      cityId: null
    },
    {
      id: 'remo_synth_offline',
      category: 'vibe',
      name: 'Cyber-Lofi REMO (Zero-Fail)',
      desc_fr: 'Synthétiseur d’accords en temps réel (Am7/Fmaj7/G6)',
      desc_en: 'Live Real-Time Chord Synthesizer (Am7/Fmaj7/G6)',
      icon: '🤖',
      streamUrl: 'internal://synth',
      badge: 'OFFLINE SYNTH',
      cityId: null
    },

    // 🌍 LIVE WORLD CITIES STATIONS
    {
      id: 'paris_fip',
      category: 'city',
      name: 'FIP Radio France Paris',
      desc_fr: 'Paris • Jazz, Chanson, Électro & Monde',
      desc_en: 'Paris • Eclectic Jazz, Chanson & World',
      icon: '🇫🇷',
      streamUrl: 'https://icecast.radiofrance.fr/fip-midfi.mp3',
      badge: 'PARIS',
      cityId: 'paris'
    },
    {
      id: 'paris_mouv',
      category: 'city',
      name: 'Mouv’ Radio Paris',
      desc_fr: 'Paris • Hip-Hop, Rap, RnB & Électro Urbain',
      desc_en: 'Paris • Hip-Hop, Rap, RnB & Urban Beats',
      icon: '🎧',
      streamUrl: 'https://icecast.radiofrance.fr/mouv-midfi.mp3',
      badge: 'PARIS URBAN',
      cityId: 'paris'
    },
    {
      id: 'nrj_france',
      category: 'city',
      name: 'NRJ Paris Hits',
      desc_fr: 'Paris • Hit Music Only & Top 40 Mondial',
      desc_en: 'Paris • Hit Music Only & Global Top 40',
      icon: '🔥',
      streamUrl: 'https://scdn.nrjaudio.fm/audio1/fr/30001/mp3_128.mp3',
      badge: 'PARIS HITS',
      cityId: 'paris'
    },
    {
      id: 'skyrock_paris',
      category: 'city',
      name: 'Skyrock FM Paris',
      desc_fr: 'Paris • Premier sur le Rap & Musique Urbaine',
      desc_en: 'Paris • Leading French Rap & Urban Hits',
      icon: '🎙️',
      streamUrl: 'https://icecast.skyrock.net/s/natio_aac_64k',
      badge: 'SKYROCK',
      cityId: 'paris'
    },
    {
      id: 'montreal_cbc',
      category: 'city',
      name: 'CBC Radio One Montréal',
      desc_fr: 'Montréal • Musique & Culture Urbaine QC',
      desc_en: 'Montréal • Urban Culture & Music QC',
      icon: '🇨🇦',
      streamUrl: 'https://27033.live.streamtheworld.com/CBMEFM_CBC_SC',
      badge: 'MONTRÉAL',
      cityId: 'montreal'
    },
    {
      id: 'montreal_ckac',
      category: 'city',
      name: 'Montréal Direct Stream',
      desc_fr: 'Montréal • Actualités Urbaines & Culture Locale',
      desc_en: 'Montréal • Urban News & Local Montreal Life',
      icon: '⚜️',
      streamUrl: 'https://playerservices.streamtheworld.com/api/livestream-redirect/CKACAM.mp3',
      badge: 'MONTRÉAL QC',
      cityId: 'montreal'
    },
    {
      id: 'newyork_wnyc',
      category: 'city',
      name: 'WNYC 93.9 FM New York',
      desc_fr: 'New York • NPR, Jazz & Culture Indie',
      desc_en: 'New York • NPR, Jazz & Indie Culture',
      icon: '🇺🇸',
      streamUrl: 'https://fm939.wnyc.org/wnycfm.mp3',
      badge: 'NEW YORK',
      cityId: 'newyork'
    },
    {
      id: 'london_capital',
      category: 'city',
      name: 'Capital FM London',
      desc_fr: 'Londres • Top 40 UK & Hits Mondiaux',
      desc_en: 'London • The UK\'s No.1 Hit Music Station',
      icon: '🇬🇧',
      streamUrl: 'https://media-ice.musicradio.com/CapitalMP3',
      badge: 'LONDRES',
      cityId: 'londres'
    },
    {
      id: 'swiss_pop',
      category: 'city',
      name: 'Radio Swiss Pop',
      desc_fr: 'Genève • Les Meilleurs Hits Pop & Doux Classiques',
      desc_en: 'Geneva • Best Pop Hits & Soft Classics 24/7',
      icon: '🇨🇭',
      streamUrl: 'https://stream.srg-ssr.ch/m/rsp/mp3_128',
      badge: 'SUISSE',
      cityId: null
    },
    {
      id: 'tokyo_jpop',
      category: 'city',
      name: 'Tokyo J-Pop Live',
      desc_fr: 'Tokyo • J-Pop, Shibuya Beats & Anime',
      desc_en: 'Tokyo • J-Pop, Shibuya Beats & Anime Sound',
      icon: '🇯🇵',
      streamUrl: 'https://kathy.torontocast.com:3340/stream',
      badge: 'TOKYO',
      cityId: 'tokyo'
    },
    {
      id: 'dubai_dj',
      category: 'city',
      name: 'DJ Radio Dubai',
      desc_fr: 'Dubaï • Desert Club & Deep Lounge Beats',
      desc_en: 'Dubai • Desert Club & Deep Lounge Beats',
      icon: '🇦🇪',
      streamUrl: 'https://listen.radioking.com/radio/623812/stream/685903',
      badge: 'DUBAÏ',
      cityId: 'dubai'
    },
    {
      id: 'chisinau_kiss',
      category: 'city',
      name: 'Kiss FM Moldova',
      desc_fr: 'Chișinău • Hits En Direct, Musique & Énergie',
      desc_en: 'Chișinău • Live Hits & Fresh Energy',
      icon: '🇲🇩',
      streamUrl: 'https://live.kissfm.ro/kissfm.aacp',
      badge: 'CHIȘINĂU',
      cityId: 'chisinau'
    },
    {
      id: 'bucarest_magic',
      category: 'city',
      name: 'Magic FM Bucarest',
      desc_fr: 'Bucarest • Grands Classiques & Meilleurs Hits',
      desc_en: 'Bucarest • Always Great Classics & Hits',
      icon: '🇷🇴',
      streamUrl: 'https://live.magicfm.ro/magicfm.aacp',
      badge: 'BUCAREST',
      cityId: 'bucarest'
    }
  ];

  class RemoRadioEngine {
    constructor() {
      this.stations = REMO_RADIO_STATIONS;
      this.audioEl = new Audio();
      this.audioEl.preload = 'none';
      this.audioEl.crossOrigin = 'anonymous';
      this.currentCategory = 'vibe'; // 'vibe' or 'city'

      // Persistent preferences
      const savedStationId = localStorage.getItem('remo_radio_current_station') || 'capital_chill';
      this.currentStation = this.stations.find((s) => s.id === savedStationId) || this.stations[0];
      const savedVol = parseFloat(localStorage.getItem('remo_radio_volume'));
      this.volume = !isNaN(savedVol) ? Math.max(0, Math.min(1, savedVol)) : 0.65;
      this.audioEl.volume = this.volume;

      // Robust Continuous Playback State
      this.isPlaying = false;
      this.isLoading = false;
      this.isSynthMode = false;
      this.userWantsPlaying = false; // Source of truth: did user click Play?
      this.isReconnecting = false;
      this.reconnectAttempts = 0;
      this._reconnectTimer = null;
      this._watchdogTimer = null;

      this._bindAudioEvents();
      this._initMediaSessionHandlers();
      this._startAntiPauseWatchdog();
      this._bindVisibilityWatchdog();
    }

    _bindAudioEvents() {
      this.audioEl.addEventListener('playing', () => {
        this.isLoading = false;
        this.isPlaying = true;
        this.isReconnecting = false;
        this.reconnectAttempts = 0;
        this._updateMediaSession();
        this._updateUI();
      });

      this.audioEl.addEventListener('waiting', () => {
        if (this.userWantsPlaying) {
          this.isLoading = true;
          this._updateUI();
        }
      });

      this.audioEl.addEventListener('loadstart', () => {
        if (this.userWantsPlaying) {
          this.isLoading = true;
          this._updateUI();
        }
      });

      this.audioEl.addEventListener('pause', () => {
        if (this.isSynthMode) return;

        // CRITICAL FIX: If audio paused unexpectedly (buffer underrun, OS sleep, stream glitch)
        // while the user WANTED music playing, do NOT treat it as user pause! Auto-resume!
        if (this.userWantsPlaying) {
          console.warn('[REMO Radio] Stream paused unexpectedly while userWantsPlaying=true. Triggering auto-recovery...');
          this._scheduleAutoReconnect('pause_event');
        } else {
          this.isPlaying = false;
          this.isLoading = false;
          this._updateMediaSession();
          this._updateUI();
        }
      });

      this.audioEl.addEventListener('stalled', () => {
        if (this.userWantsPlaying && !this.isSynthMode) {
          console.warn('[REMO Radio] Stream stalled, scheduling reconnect...');
          this._scheduleAutoReconnect('stalled');
        }
      });

      this.audioEl.addEventListener('ended', () => {
        // Live streams should never end normally; if browser fires ended, stream dropped
        if (this.userWantsPlaying && !this.isSynthMode) {
          console.warn('[REMO Radio] Stream ended event fired, auto-reconnecting live stream...');
          this._scheduleAutoReconnect('ended');
        }
      });

      this.audioEl.addEventListener('error', (err) => {
        console.warn('[REMO Radio] Stream error encountered:', err);
        if (this.userWantsPlaying && !this.isSynthMode) {
          this._scheduleAutoReconnect('error');
        } else {
          this.isLoading = false;
          this.isPlaying = false;
          this._updateUI();
        }
      });
    }

    /* ── 🛡️ ANTI-PAUSE RECONNECT WATCHDOG ── */
    _scheduleAutoReconnect(reason = 'unknown') {
      if (!this.userWantsPlaying || this.isSynthMode) return;
      if (this.isReconnecting) return;

      this.isReconnecting = true;
      this.isLoading = true;
      this._updateUI();

      if (this._reconnectTimer) clearTimeout(this._reconnectTimer);

      const delay = Math.min(6000, 1000 * Math.pow(1.4, this.reconnectAttempts));
      this.reconnectAttempts++;

      this._reconnectTimer = setTimeout(() => {
        if (!this.userWantsPlaying || this.isSynthMode) {
          this.isReconnecting = false;
          return;
        }
        this._reconnectStream(reason);
      }, delay);
    }

    _reconnectStream(reason = '') {
      if (!this.currentStation || !this.currentStation.streamUrl) {
        this.isReconnecting = false;
        return;
      }

      const rawUrl = this.currentStation.streamUrl;
      if (rawUrl === 'internal://synth') {
        this.isReconnecting = false;
        return;
      }

      console.log(`[REMO Radio] Reconnecting to ${this.currentStation.name} (${reason}, try ${this.reconnectAttempts})...`);

      // Bust stale TCP / Icecast buffer
      const sep = rawUrl.includes('?') ? '&' : '?';
      const freshUrl = `${rawUrl}${sep}_r=${Date.now()}`;

      try {
        this.audioEl.pause();
        this.audioEl.removeAttribute('src');
        this.audioEl.load();
      } catch (e) {}

      this.audioEl.src = freshUrl;
      this.audioEl.volume = this.volume;

      const p = this.audioEl.play();
      if (p && typeof p.then === 'function') {
        p.then(() => {
          this.isPlaying = true;
          this.isLoading = false;
          this.isReconnecting = false;
          this.reconnectAttempts = 0;
          this._updateMediaSession();
          this._updateUI();
        }).catch((err) => {
          console.warn('[REMO Radio] Reconnect play rejected:', err);
          this.isReconnecting = false;
          if (this.userWantsPlaying && this.reconnectAttempts < 6) {
            this._scheduleAutoReconnect('retry_after_reject');
          } else {
            this.isLoading = false;
            this._updateUI();
          }
        });
      }
    }

    _startAntiPauseWatchdog() {
      if (this._watchdogTimer) clearInterval(this._watchdogTimer);
      // Run every 4 seconds to guarantee music NEVER silently pauses after 5-10 minutes
      this._watchdogTimer = setInterval(() => {
        if (this.userWantsPlaying && !this.isSynthMode) {
          if (this.audioEl.paused && !this.isReconnecting) {
            console.log('[REMO Radio Watchdog] Stream unexpectedly halted. Reviving stream immediately...');
            this._scheduleAutoReconnect('watchdog_revive');
          }
        }
      }, 4000);
    }

    _bindVisibilityWatchdog() {
      // When screen turns on or user switches back to REMO tab, ensure audio is alive
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden && this.userWantsPlaying && !this.isSynthMode) {
          if (this.audioEl.paused) {
            console.log('[REMO Radio] Tab visible, reviving paused stream...');
            this._reconnectStream('visibility_revive');
          }
        }
      });
      window.addEventListener('focus', () => {
        if (this.userWantsPlaying && !this.isSynthMode && this.audioEl.paused) {
          this._reconnectStream('window_focus');
        }
      });
    }

    /* ── 📱 MEDIASESSION API (Mobile Lockscreen Controls & OS High-Priority Audio) ── */
    _initMediaSessionHandlers() {
      if (!('mediaSession' in navigator)) return;
      try {
        navigator.mediaSession.setActionHandler('play', () => this.play());
        navigator.mediaSession.setActionHandler('pause', () => this.pause());
        navigator.mediaSession.setActionHandler('stop', () => this.stop());
        navigator.mediaSession.setActionHandler('nexttrack', () => this.nextStation());
        navigator.mediaSession.setActionHandler('previoustrack', () => this.prevStation());
      } catch (e) {
        console.warn('MediaSession handler error:', e);
      }
    }

    _updateMediaSession() {
      if (!('mediaSession' in navigator) || !this.currentStation) return;
      try {
        const lang = (window.REMO_I18N && window.REMO_I18N.getLang) ? window.REMO_I18N.getLang() : 'fr';
        const desc = lang === 'fr' ? this.currentStation.desc_fr : this.currentStation.desc_en;
        navigator.mediaSession.metadata = new MediaMetadata({
          title: this.currentStation.name,
          artist: 'REMO World Radio 4D 🌐',
          album: `${this.currentStation.badge} • ${desc}`,
          artwork: [
            { src: 'img/remo_icon_192.png', sizes: '192x192', type: 'image/png' },
            { src: 'img/remo_icon_512.png', sizes: '512x512', type: 'image/png' }
          ]
        });
        navigator.mediaSession.playbackState = this.isPlaying ? 'playing' : 'paused';
      } catch (e) {}
    }

    selectStation(stationId, autoPlay = true) {
      const st = this.stations.find((s) => s.id === stationId);
      if (!st) return;

      this.currentStation = st;
      localStorage.setItem('remo_radio_current_station', st.id);

      this.stop();

      if (autoPlay) {
        this.play();
      } else {
        this._updateUI();
      }
    }

    nextStation() {
      const curIdx = this.stations.findIndex((s) => s.id === this.currentStation.id);
      const nextIdx = (curIdx + 1) % this.stations.length;
      this.selectStation(this.stations[nextIdx].id, this.userWantsPlaying);
    }

    prevStation() {
      const curIdx = this.stations.findIndex((s) => s.id === this.currentStation.id);
      const prevIdx = (curIdx - 1 + this.stations.length) % this.stations.length;
      this.selectStation(this.stations[prevIdx].id, this.userWantsPlaying);
    }

    play() {
      if (!this.currentStation) return;
      this.userWantsPlaying = true;
      this.reconnectAttempts = 0;

      if (this.currentStation.streamUrl === 'internal://synth') {
        this.isSynthMode = true;
        if (window.RemoAudio && typeof window.RemoAudio.toggleCyberLofiRadio === 'function') {
          if (!window.RemoAudio.radioPlaying) {
            window.RemoAudio.toggleCyberLofiRadio();
          }
        }
        this.isPlaying = true;
        this.isLoading = false;
        this._updateMediaSession();
        this._updateUI();
        return;
      }

      this.isSynthMode = false;
      if (window.RemoAudio && window.RemoAudio.radioPlaying) {
        window.RemoAudio.stopRadio();
      }

      this.isLoading = true;
      this._updateUI();

      this.audioEl.src = this.currentStation.streamUrl;
      this.audioEl.volume = this.volume;

      const p = this.audioEl.play();
      if (p && typeof p.then === 'function') {
        p.then(() => {
          this.isPlaying = true;
          this.isLoading = false;
          this._updateMediaSession();
          this._updateUI();
        }).catch((err) => {
          console.warn('Playback error (often autoplay restrictions):', err);
          this.isLoading = false;
          this.isPlaying = false;
          this._updateUI();
        });
      }
    }

    pause() {
      this.userWantsPlaying = false; // User explicitly initiated pause
      if (this._reconnectTimer) clearTimeout(this._reconnectTimer);

      if (this.isSynthMode) {
        if (window.RemoAudio && window.RemoAudio.radioPlaying) {
          window.RemoAudio.stopRadio();
        }
        this.isPlaying = false;
        this._updateMediaSession();
        this._updateUI();
        return;
      }

      this.audioEl.pause();
      this.isPlaying = false;
      this.isLoading = false;
      this._updateMediaSession();
      this._updateUI();
    }

    stop() {
      this.userWantsPlaying = false;
      if (this._reconnectTimer) clearTimeout(this._reconnectTimer);

      if (window.RemoAudio && window.RemoAudio.radioPlaying) {
        window.RemoAudio.stopRadio();
      }
      this.isSynthMode = false;
      this.audioEl.pause();
      this.audioEl.removeAttribute('src');
      this.audioEl.load();
      this.isPlaying = false;
      this.isLoading = false;
      this._updateMediaSession();
      this._updateUI();
    }

    toggle() {
      if (this.isPlaying) {
        this.pause();
      } else {
        this.play();
      }
    }

    setVolume(val) {
      const v = Math.max(0, Math.min(1, parseFloat(val)));
      this.volume = v;
      this.audioEl.volume = v;
      localStorage.setItem('remo_radio_volume', String(v));
      this._updateUI();
    }

    tuneToCity(cityId) {
      if (!cityId) return;
      const match = this.stations.find((s) => s.cityId === cityId);
      if (match) {
        this.selectStation(match.id, this.isPlaying);
      }
    }

    _updateUI() {
      const lang = (window.REMO_I18N && window.REMO_I18N.getLang) ? window.REMO_I18N.getLang() : 'fr';
      const st = this.currentStation;

      // 1. Update Header Button (#btnRadioToggle)
      const btn = document.getElementById('btnRadioToggle');
      if (btn) {
        if (this.isPlaying) {
          btn.style.borderColor = '#10b981';
          btn.style.boxShadow = '0 0 12px rgba(16,185,129,0.45)';
          btn.style.color = '#34d399';
          btn.innerHTML = `
            <span class="radio-eq-bars">
              <span class="bar b1"></span>
              <span class="bar b2"></span>
              <span class="bar b3"></span>
            </span>
            <span>${st.icon} ${st.name}</span>
          `;
        } else if (this.isLoading) {
          btn.style.borderColor = '#fbbf24';
          btn.style.boxShadow = '0 0 10px rgba(251,191,36,0.3)';
          btn.style.color = '#fbbf24';
          btn.innerHTML = `<span>⏳ ${lang === 'fr' ? 'Connexion...' : 'Tuning...'}</span>`;
        } else {
          btn.style.borderColor = '';
          btn.style.boxShadow = '';
          btn.style.color = '';
          btn.innerHTML = `📻 Radio`;
        }
      }

      // 2. Update Mobile Hub Button
      const mbTxt = document.getElementById('mbRadioBtnTxt');
      if (mbTxt) {
        mbTxt.innerHTML = this.isPlaying
          ? `🟢 ${st.icon} ${st.name}`
          : (lang === 'fr' ? `📻 Radio du Monde` : `📻 World Radio`);
      }

      // 3. Update Modal Now-Playing Section
      const npIcon = document.getElementById('radioNpIcon');
      const npName = document.getElementById('radioNpName');
      const npDesc = document.getElementById('radioNpDesc');
      const npBadge = document.getElementById('radioNpBadge');
      const playBtn = document.getElementById('radioMainPlayBtn');
      const volSlider = document.getElementById('radioVolumeSlider');
      const volValue = document.getElementById('radioVolumeVal');

      if (npIcon) npIcon.textContent = st.icon || '📻';
      if (npName) npName.textContent = st.name || 'REMO Radio';
      if (npDesc) npDesc.textContent = lang === 'fr' ? st.desc_fr : st.desc_en;
      if (npBadge) {
        npBadge.textContent = this.isPlaying
          ? (lang === 'fr' ? '🟢 EN DIRECT' : '🟢 ON AIR')
          : (this.isLoading ? (lang === 'fr' ? '⏳ CONNEXION' : '⏳ BUFFERING') : (lang === 'fr' ? '⏸️ PAUSE' : '⏸️ PAUSED'));
        npBadge.style.color = this.isPlaying ? '#10b981' : (this.isLoading ? '#fbbf24' : '#94a3b8');
      }

      if (playBtn) {
        playBtn.innerHTML = this.isPlaying
          ? `<span>⏸️</span> <span>${lang === 'fr' ? 'Pause' : 'Pause'}</span>`
          : (this.isLoading ? `<span>⏳</span> <span>${lang === 'fr' ? 'Chargement...' : 'Connecting...'}</span>` : `<span>▶️</span> <span>${lang === 'fr' ? 'Écouter' : 'Play Live'}</span>`);
        playBtn.classList.toggle('btn-gold', !this.isPlaying);
      }

      if (volSlider) volSlider.value = Math.round(this.volume * 100);
      if (volValue) volValue.textContent = `${Math.round(this.volume * 100)}%`;

      // 4. Update Station Cards Active State
      document.querySelectorAll('.radio-station-card').forEach((card) => {
        const sId = card.getAttribute('data-station-id');
        const isActive = sId === st.id;
        card.classList.toggle('active', isActive);
        const stStatus = card.querySelector('.st-status');
        if (stStatus) {
          if (isActive && this.isPlaying) {
            stStatus.innerHTML = '<span class="pulse-dot"></span> ' + (lang === 'fr' ? 'En direct' : 'Playing');
            stStatus.style.color = '#10b981';
          } else if (isActive && this.isLoading) {
            stStatus.textContent = lang === 'fr' ? 'Connexion...' : 'Connecting...';
            stStatus.style.color = '#fbbf24';
          } else {
            stStatus.textContent = '';
          }
        }
      });
    }
  }

  // Instantiate singleton
  const radioEngine = new RemoRadioEngine();
  window.REMO_RADIO = radioEngine;

  // Global UI helper functions
  window.openRemoRadioModal = function () {
    const modal = document.getElementById('remoRadioModal');
    if (!modal) return;
    renderRadioStationsList();
    radioEngine._updateUI();
    modal.classList.add('open');
  };

  window.closeRemoRadioModal = function () {
    const modal = document.getElementById('remoRadioModal');
    if (modal) modal.classList.remove('open');
  };

  window.toggleRadioPlayPause = function () {
    radioEngine.toggle();
  };

  window.selectRadioStation = function (stationId) {
    radioEngine.selectStation(stationId, true);
  };

  window.setRadioVolume = function (sliderEl) {
    if (!sliderEl) return;
    const val = Number(sliderEl.value) / 100;
    radioEngine.setVolume(val);
  };

  window.setRadioCategoryTab = function (cat, btnEl) {
    radioEngine.currentCategory = cat;
    document.querySelectorAll('#radioCategoryTabs .fchip').forEach((b) => b.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');
    renderRadioStationsList();
  };

  window.toggleHeaderRadio = function () {
    window.openRemoRadioModal();
  };

  function renderRadioStationsList() {
    const grid = document.getElementById('radioStationsGrid');
    if (!grid) return;
    const lang = (window.REMO_I18N && window.REMO_I18N.getLang) ? window.REMO_I18N.getLang() : 'fr';
    const cat = radioEngine.currentCategory;
    const filtered = radioEngine.stations.filter((s) => s.category === cat);

    grid.innerHTML = filtered.map((s) => {
      const isActive = radioEngine.currentStation && radioEngine.currentStation.id === s.id;
      const desc = lang === 'fr' ? s.desc_fr : s.desc_en;
      return `
        <div class="radio-station-card ${isActive ? 'active' : ''}" data-station-id="${s.id}" onclick="selectRadioStation('${s.id}')">
          <div style="display:flex;align-items:center;gap:12px;">
            <div class="st-icon">${s.icon}</div>
            <div style="flex:1;min-width:0;">
              <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                <b style="color:#fff;font-size:0.92rem;">${s.name}</b>
                <span class="st-badge">${s.badge}</span>
              </div>
              <div style="font-size:0.75rem;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:2px;">
                ${desc}
              </div>
            </div>
            <div class="st-status" style="font-size:0.75rem;font-weight:800;white-space:nowrap;">
              ${isActive && radioEngine.isPlaying ? '<span class="pulse-dot"></span> ' + (lang === 'fr' ? 'En direct' : 'Playing') : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  window.renderRadioStationsList = renderRadioStationsList;
})();
