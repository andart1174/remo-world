/* ════════════════════════════════════════════════════════════════════
   REMO WORLD RADIO ENGINE™ — Live World Cities & Chill Vibe Streams
   High-Fidelity Audio Streaming + City-Adaptive Audio System
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
      id: 'nightwave_plaza',
      category: 'vibe',
      name: 'Nightwave Plaza',
      desc_fr: 'Vaporwave, Synthwave & Cyber Electronica',
      desc_en: 'Vaporwave, Synthwave & Cyber Electronic',
      icon: '⚡',
      streamUrl: 'https://radio.plaza.one/mp3',
      badge: 'SYNTHWAVE',
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
      id: 'chisinau_kiss',
      category: 'city',
      name: 'Kiss FM Moldova',
      desc_fr: 'Chișinău • Muzică Vie, Hituri & Energie',
      desc_en: 'Chișinău • Live Hits & Fresh Vibes',
      icon: '🇲🇩',
      streamUrl: 'https://live.kissfm.ro/kissfm.aacp',
      badge: 'CHIȘINĂU',
      cityId: 'chisinau'
    },
    {
      id: 'bucarest_magic',
      category: 'city',
      name: 'Magic FM Bucarest',
      desc_fr: 'București • Cele mai frumoase melodii',
      desc_en: 'Bucarest • Always Great Classics & Hits',
      icon: '🇷🇴',
      streamUrl: 'https://live.magicfm.ro/magicfm.aacp',
      badge: 'BUCAREST',
      cityId: 'bucarest'
    },
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
      id: 'newyork_wnyc',
      category: 'city',
      name: 'WNYC 93.9 FM New York',
      desc_fr: 'New York • NPR, Jazz & Indie Culture',
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
      desc_fr: 'Londres • Top 40 UK & World Hits',
      desc_en: 'London • The UK\'s No.1 Hit Music Station',
      icon: '🇬🇧',
      streamUrl: 'https://media-ice.musicradio.com/CapitalMP3',
      badge: 'LONDRES',
      cityId: 'londres'
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
    }
  ];

  class RemoRadioEngine {
    constructor() {
      this.stations = REMO_RADIO_STATIONS;
      this.audioEl = new Audio();
      this.audioEl.preload = 'none';
      this.currentCategory = 'vibe'; // 'vibe' or 'city'

      // Load preferences from localStorage
      const savedStationId = localStorage.getItem('remo_radio_current_station') || 'capital_chill';
      this.currentStation = this.stations.find((s) => s.id === savedStationId) || this.stations[0];
      const savedVol = parseFloat(localStorage.getItem('remo_radio_volume'));
      this.volume = !isNaN(savedVol) ? Math.max(0, Math.min(1, savedVol)) : 0.65;
      this.audioEl.volume = this.volume;

      this.isPlaying = false;
      this.isLoading = false;
      this.isSynthMode = false;

      this._bindAudioEvents();
    }

    _bindAudioEvents() {
      this.audioEl.addEventListener('playing', () => {
        this.isLoading = false;
        this.isPlaying = true;
        this._updateUI();
      });

      this.audioEl.addEventListener('waiting', () => {
        this.isLoading = true;
        this._updateUI();
      });

      this.audioEl.addEventListener('pause', () => {
        if (!this.isSynthMode) {
          this.isPlaying = false;
          this.isLoading = false;
          this._updateUI();
        }
      });

      this.audioEl.addEventListener('error', (err) => {
        console.warn('RemoRadio stream error:', err);
        this.isLoading = false;
        this.isPlaying = false;
        this._updateUI();
        const lang = (window.REMO_I18N && window.REMO_I18N.getLang) ? window.REMO_I18N.getLang() : 'fr';
        if (typeof window.remoToast === 'function') {
          window.remoToast(
            lang === 'fr'
              ? `⚠️ Flux temporairement indisponible pour ${this.currentStation.name}. Essayez un autre canal !`
              : `⚠️ Stream temporarily unavailable for ${this.currentStation.name}. Try another station!`
          );
        }
      });
    }

    selectStation(stationId, autoPlay = true) {
      const st = this.stations.find((s) => s.id === stationId);
      if (!st) return;

      this.currentStation = st;
      localStorage.setItem('remo_radio_current_station', st.id);

      // Stop any existing stream / synth
      this.stop();

      if (autoPlay) {
        this.play();
      } else {
        this._updateUI();
      }
    }

    play() {
      if (!this.currentStation) return;

      if (this.currentStation.streamUrl === 'internal://synth') {
        this.isSynthMode = true;
        if (window.RemoAudio && typeof window.RemoAudio.toggleCyberLofiRadio === 'function') {
          if (!window.RemoAudio.radioPlaying) {
            window.RemoAudio.toggleCyberLofiRadio();
          }
        }
        this.isPlaying = true;
        this.isLoading = false;
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
      if (this.isSynthMode) {
        if (window.RemoAudio && window.RemoAudio.radioPlaying) {
          window.RemoAudio.stopRadio();
        }
        this.isPlaying = false;
        this._updateUI();
        return;
      }

      this.audioEl.pause();
      this.isPlaying = false;
      this.isLoading = false;
      this._updateUI();
    }

    stop() {
      if (window.RemoAudio && window.RemoAudio.radioPlaying) {
        window.RemoAudio.stopRadio();
      }
      this.isSynthMode = false;
      this.audioEl.pause();
      this.audioEl.removeAttribute('src');
      this.audioEl.load();
      this.isPlaying = false;
      this.isLoading = false;
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
        mbTxt.innerHTML = this.isPlaying ? `🟢 ${st.icon} ${st.name}` : `📻 Radio du Monde`;
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
    // Single-click opens the radio console to pick any vibe/city stream or pause
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
