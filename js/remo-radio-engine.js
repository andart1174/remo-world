/* ════════════════════════════════════════════════════════════════════
   REMO WORLD RADIO ENGINE™ 2.0 (v60) — 38+ Live World & Vibe Streams
   Zero-Stutter Direct Streaming, Smart 20% Audio Ducking, Listen-to-Earn,
   Inline Header Mini-Controls & Weekly City Jukebox
   Strict Bilingual (EN / FR Only)
   ════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const REMO_RADIO_STATIONS = [
    // 🎧 1. VIBES & CHILL STATIONS (12 CURATED STREAMS)
    {
      id: 'capital_chill',
      category: 'vibe',
      name: 'Capital Chill UK',
      desc_fr: 'Downtempo, Chillhop & Lofi Beats 24/7',
      desc_en: 'Downtempo, Chillhop & Chilled Beats 24/7',
      icon: '☕',
      streamUrl: 'https://media-ssl.musicradio.com/CapitalChill',
      fallbackUrl: 'https://ice1.somafm.com/groovesalad-128-mp3',
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
      fallbackUrl: 'https://ice2.somafm.com/groovesalad-128-mp3',
      badge: 'AMBIENT CHILL',
      cityId: null
    },
    {
      id: 'lofi_study_box',
      category: 'vibe',
      name: 'Lush Lofi & Focus',
      desc_fr: 'Beats doux, voix aériennes & concentration',
      desc_en: 'Mellow beats, dreamy vocals & study flow',
      icon: '📚',
      streamUrl: 'https://ice1.somafm.com/lush-128-mp3',
      fallbackUrl: 'https://ice2.somafm.com/lush-128-mp3',
      badge: 'STUDY LOFI',
      cityId: null
    },
    {
      id: 'rainy_jazz_piano',
      category: 'vibe',
      name: 'Rainy Night Jazz & Piano',
      desc_fr: 'Jazz feutré, piano nocturne & soul 24/7',
      desc_en: 'Velvet midnight jazz, piano & soul 24/7',
      icon: '🎷',
      streamUrl: 'https://stream.srg-ssr.ch/m/rsj/mp3_128',
      fallbackUrl: 'https://ice1.somafm.com/sonicuniverse-128-mp3',
      badge: 'NIGHT JAZZ',
      cityId: null
    },
    {
      id: 'nightwave_plaza',
      category: 'vibe',
      name: 'Nightwave Plaza',
      desc_fr: 'Vaporwave, Future Funk & Électro Rétro',
      desc_en: 'Vaporwave, Future Funk & Retro Electronic',
      icon: '🌆',
      streamUrl: 'https://radio.plaza.one/mp3',
      fallbackUrl: 'https://ice1.somafm.com/vaporwaves-128-mp3',
      badge: 'VAPORWAVE',
      cityId: null
    },
    {
      id: 'synthwave_nightdrive',
      category: 'vibe',
      name: 'Midnight Synthwave Drive',
      desc_fr: 'Synthwave 80s, Outrun & Autoroute Néon',
      desc_en: '80s Synthwave, Outrun & Neon Nightdrive',
      icon: '🏎️',
      streamUrl: 'https://ice1.somafm.com/u80s-128-mp3',
      fallbackUrl: 'https://ice2.somafm.com/spacestation-128-mp3',
      badge: 'NIGHTDRIVE',
      cityId: null
    },
    {
      id: 'somafm_defcon',
      category: 'vibe',
      name: 'DEF CON Cyber Radio',
      desc_fr: 'Cyberpunk, Synthé & Beats Underground',
      desc_en: 'Cyberpunk, Synth & Underground Hacker Beats',
      icon: '⚡',
      streamUrl: 'https://ice2.somafm.com/defcon-128-mp3',
      fallbackUrl: 'https://ice1.somafm.com/defcon-128-mp3',
      badge: 'CYBERPUNK',
      cityId: null
    },
    {
      id: 'gym_phonk_energy',
      category: 'vibe',
      name: 'Gym Phonk & Bass Boost',
      desc_fr: 'Drift Phonk, Electro Bass & Haute Énergie',
      desc_en: 'Drift Phonk, Club Bass & High Workout Energy',
      icon: '💪',
      streamUrl: 'https://radiorecord.hostingradio.ru/phonk96.aacp',
      fallbackUrl: 'https://ice1.somafm.com/beatblender-128-mp3',
      badge: 'PHONK & GYM',
      cityId: null
    },
    {
      id: 'record_chillout',
      category: 'vibe',
      name: 'Deep Sunset Lounge',
      desc_fr: 'Ambiance Café Del Mar & Sunset Relax',
      desc_en: 'Café Del Mar Sunset & Balearic Lounge',
      icon: '🌙',
      streamUrl: 'https://radiorecord.hostingradio.ru/chil96.aacp',
      fallbackUrl: 'https://ice1.somafm.com/fluid-128-mp3',
      badge: 'DEEP LOUNGE',
      cityId: null
    },
    {
      id: 'somafm_deepspace',
      category: 'vibe',
      name: 'Deep Space Cosmos 4D',
      desc_fr: 'Exploration spatiale & Ambient atmosphérique',
      desc_en: 'Deep ambient space & atmospheric soundscapes',
      icon: '🪐',
      streamUrl: 'https://ice1.somafm.com/deepspaceone-128-mp3',
      fallbackUrl: 'https://ice2.somafm.com/dronezone-128-mp3',
      badge: 'SPACE 4D',
      cityId: null
    },
    {
      id: 'classical_symphony',
      category: 'vibe',
      name: 'Grand Cinema & Classical',
      desc_fr: 'Symphonies, Piano & Musiques de Prestige',
      desc_en: 'Timeless Symphonies, Piano & Prestige Strings',
      icon: '🎻',
      streamUrl: 'https://stream.srg-ssr.ch/m/rsc_fr/mp3_128',
      fallbackUrl: 'https://stream.srg-ssr.ch/m/rsc_de/mp3_128',
      badge: 'CLASSICAL',
      cityId: null
    },
    {
      id: 'remo_synth_offline',
      category: 'vibe',
      name: 'Cyber-Lofi REMO (Zero-Fail)',
      desc_fr: 'Synthétiseur d’accords en temps réel (100% Hors-Ligne)',
      desc_en: 'Live Real-Time Chord Synthesizer (100% Offline)',
      icon: '🤖',
      streamUrl: 'internal://synth',
      badge: 'OFFLINE SYNTH',
      cityId: null
    },

    // 🌍 2. LIVE WORLD CITIES STATIONS (26 GLOBAL STREAMS)
    {
      id: 'paris_fip',
      category: 'city',
      name: 'FIP Radio France Paris',
      desc_fr: 'Paris • Jazz, Chanson, Électro & Monde',
      desc_en: 'Paris • Eclectic Jazz, Chanson & World',
      icon: '🇫🇷',
      streamUrl: 'https://icecast.radiofrance.fr/fip-midfi.mp3',
      fallbackUrl: 'https://icecast.radiofrance.fr/fipgroove-midfi.mp3',
      badge: 'PARIS',
      cityId: 'paris'
    },
    {
      id: 'paris_fip_electro',
      category: 'city',
      name: 'FIP Electro French Touch',
      desc_fr: 'Paris • French Touch, House & Électro Chic',
      desc_en: 'Paris • French Touch, House & Chic Electronica',
      icon: '🗼',
      streamUrl: 'https://icecast.radiofrance.fr/fipelectro-midfi.mp3',
      fallbackUrl: 'https://icecast.radiofrance.fr/fip-midfi.mp3',
      badge: 'FRENCH TOUCH',
      cityId: 'paris'
    },
    {
      id: 'paris_mouv',
      category: 'city',
      name: 'Mouv’ Radio Paris',
      desc_fr: 'Paris • Hip-Hop, Rap, RnB & Urbain',
      desc_en: 'Paris • Hip-Hop, Rap, RnB & Urban Beats',
      icon: '🎧',
      streamUrl: 'https://icecast.radiofrance.fr/mouv-midfi.mp3',
      fallbackUrl: 'https://icecast.skyrock.net/s/natio_aac_64k',
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
      fallbackUrl: 'https://icecast.radiofrance.fr/mouv-midfi.mp3',
      badge: 'PARIS HITS',
      cityId: 'paris'
    },
    {
      id: 'skyrock_paris',
      category: 'city',
      name: 'Skyrock FM Paris',
      desc_fr: 'Paris • Premier sur le Rap & Urbain',
      desc_en: 'Paris • Leading French Rap & Urban Hits',
      icon: '🎙️',
      streamUrl: 'https://icecast.skyrock.net/s/natio_aac_64k',
      fallbackUrl: 'https://icecast.radiofrance.fr/mouv-midfi.mp3',
      badge: 'SKYROCK',
      cityId: 'paris'
    },
    {
      id: 'montreal_cbc',
      category: 'city',
      name: 'CBC Radio One Montréal',
      desc_fr: 'Montréal • Culture Urbaine & Direct QC',
      desc_en: 'Montréal • Urban Culture & Live Montreal',
      icon: '🇨🇦',
      streamUrl: 'https://playerservices.streamtheworld.com/api/livestream-redirect/CBMEFM_CBC.mp3',
      fallbackUrl: 'https://27033.live.streamtheworld.com/CBMEFM_CBC_SC',
      badge: 'MONTRÉAL',
      cityId: 'montreal'
    },
    {
      id: 'montreal_francophonie',
      category: 'city',
      name: 'Montréal Francophonie Pop',
      desc_fr: 'Montréal • Chanson Franco, Indie & Pop QC',
      desc_en: 'Montréal • Francophone Pop, Indie & QC Vibes',
      icon: '⚜️',
      streamUrl: 'https://playerservices.streamtheworld.com/api/livestream-redirect/CBF_2FM_SRC.mp3',
      fallbackUrl: 'https://icecast.radiofrance.fr/fip-midfi.mp3',
      badge: 'MONTRÉAL QC',
      cityId: 'montreal'
    },
    {
      id: 'chisinau_kiss',
      category: 'city',
      name: 'Kiss FM Chișinău',
      desc_fr: 'Chișinău • Hits En Direct, Dance & Énergie',
      desc_en: 'Chișinău • Live Top Hits, Dance & Fresh Energy',
      icon: '🇲🇩',
      streamUrl: 'https://live.kissfm.ro/kissfm.aacp',
      fallbackUrl: 'https://live.magicfm.ro/magicfm.aacp',
      badge: 'CHIȘINĂU',
      cityId: 'chisinau'
    },
    {
      id: 'chisinau_onefm',
      category: 'city',
      name: 'One FM Dance Moldova & RO',
      desc_fr: 'Chișinău • Clubbing, Dancefloor & Électro',
      desc_en: 'Chișinău • Non-Stop Dancefloor & Club Hits',
      icon: '💃',
      streamUrl: 'https://live.onefm.ro/onefm.aacp',
      fallbackUrl: 'https://live.kissfm.ro/kissfm.aacp',
      badge: 'CLUB MD/RO',
      cityId: 'chisinau'
    },
    {
      id: 'bucarest_magic',
      category: 'city',
      name: 'Magic FM Bucarest',
      desc_fr: 'Bucarest • Grands Classiques & Soft Hits',
      desc_en: 'Bucharest • Timeless Classics & Soft Hits',
      icon: '🇷🇴',
      streamUrl: 'https://live.magicfm.ro/magicfm.aacp',
      fallbackUrl: 'https://stream.srg-ssr.ch/m/rsp/mp3_128',
      badge: 'BUCHAREST',
      cityId: 'bucharest'
    },
    {
      id: 'bucarest_dancefm',
      category: 'city',
      name: 'Dance FM 89.5 Bucharest',
      desc_fr: 'Bucarest • House, Deep & Clubbing 24/7',
      desc_en: 'Bucharest • House, Deep & Club Mixes 24/7',
      icon: '🪩',
      streamUrl: 'https://edge126.rdsnet.ro:84/profm/dancefm.mp3',
      fallbackUrl: 'https://live.onefm.ro/onefm.aacp',
      badge: 'DANCE 89.5',
      cityId: 'bucharest'
    },
    {
      id: 'bucarest_rockfm',
      category: 'city',
      name: 'Rock FM Classics',
      desc_fr: 'Bucarest • Légendes du Rock & Alternative',
      desc_en: 'Bucharest • Classic Rock Legends & Anthems',
      icon: '🎸',
      streamUrl: 'https://live.rockfm.ro/rockfm.aacp',
      fallbackUrl: 'https://ice1.somafm.com/indiepop-128-mp3',
      badge: 'ROCK FM',
      cityId: 'bucharest'
    },
    {
      id: 'newyork_wnyc',
      category: 'city',
      name: 'WNYC 93.9 FM New York',
      desc_fr: 'New York • Culture Urbaine, Jazz & Indie',
      desc_en: 'New York • Urban Culture, NPR & Indie',
      icon: '🇺🇸',
      streamUrl: 'https://fm939.wnyc.org/wnycfm.mp3',
      fallbackUrl: 'https://ice1.somafm.com/indiepop-128-mp3',
      badge: 'NEW YORK',
      cityId: 'newyork'
    },
    {
      id: 'newyork_jazz88',
      category: 'city',
      name: 'NYC Manhattan Groove',
      desc_fr: 'New York • Funk, Soul, Nu-Jazz & Brooklyn Vibes',
      desc_en: 'New York • Funk, Soul, Nu-Jazz & Brooklyn Vibes',
      icon: '🗽',
      streamUrl: 'https://ice1.somafm.com/seventies-128-mp3',
      fallbackUrl: 'https://icecast.radiofrance.fr/fipgroove-midfi.mp3',
      badge: 'NYC GROOVE',
      cityId: 'newyork'
    },
    {
      id: 'london_capital',
      category: 'city',
      name: 'Capital FM London',
      desc_fr: 'Londres • Top 40 UK & Hits Mondiaux',
      desc_en: 'London • The UK’s No.1 Hit Music Station',
      icon: '🇬🇧',
      streamUrl: 'https://media-ice.musicradio.com/CapitalMP3',
      fallbackUrl: 'https://media-ssl.musicradio.com/HeartLondonMP3',
      badge: 'LONDON',
      cityId: 'london'
    },
    {
      id: 'london_heart',
      category: 'city',
      name: 'Heart Dance London',
      desc_fr: 'Londres • Club Classics & Feel-Good Dance',
      desc_en: 'London • Feel-Good Club Classics & Dance',
      icon: '💓',
      streamUrl: 'https://media-ssl.musicradio.com/HeartDanceMP3',
      fallbackUrl: 'https://media-ice.musicradio.com/CapitalMP3',
      badge: 'UK DANCE',
      cityId: 'london'
    },
    {
      id: 'ibiza_sunset',
      category: 'city',
      name: 'Ibiza & Barcelona Sunset House',
      desc_fr: 'Barcelone & Ibiza • Deep House & Plage',
      desc_en: 'Barcelona & Ibiza • Balearic Deep House',
      icon: '🏖️',
      streamUrl: 'https://radiorecord.hostingradio.ru/deep96.aacp',
      fallbackUrl: 'https://ice1.somafm.com/beatblender-128-mp3',
      badge: 'IBIZA HOUSE',
      cityId: 'barcelona'
    },
    {
      id: 'berlin_techno',
      category: 'city',
      name: 'Berlin Melodic Club',
      desc_fr: 'Berlin • Melodic Techno, House & Underground',
      desc_en: 'Berlin • Melodic Techno, House & Club Pulse',
      icon: '🇩🇪',
      streamUrl: 'https://streams.fluxfm.de/klubradio/mp3-128/audio/',
      fallbackUrl: 'https://ice1.somafm.com/cliqhop-128-mp3',
      badge: 'BERLIN',
      cityId: 'berlin'
    },
    {
      id: 'roma_italia',
      category: 'city',
      name: 'Roma Italia Pop & Dolce Vita',
      desc_fr: 'Rome • Grands Hits Italiens & Pop Méditerranéenne',
      desc_en: 'Rome • Italian Pop Hits & Mediterranean Vibes',
      icon: '🇮🇹',
      streamUrl: 'https://icy.unitedradio.it/Subasio.mp3',
      fallbackUrl: 'https://stream.srg-ssr.ch/m/rsi_r3/mp3_128',
      badge: 'ROMA',
      cityId: 'rome'
    },
    {
      id: 'tokyo_jpop',
      category: 'city',
      name: 'Tokyo J-Pop & Shibuya Live',
      desc_fr: 'Tokyo • J-Pop, City Pop, Shibuya & Anime',
      desc_en: 'Tokyo • J-Pop, City Pop, Shibuya & Anime Sound',
      icon: '🇯🇵',
      streamUrl: 'https://kathy.torontocast.com:3340/stream',
      fallbackUrl: 'https://radio.plaza.one/mp3',
      badge: 'TOKYO',
      cityId: 'tokyo'
    },
    {
      id: 'seoul_kpop',
      category: 'city',
      name: 'Seoul K-Pop Global 24/7',
      desc_fr: 'Séoul • K-Pop, K-HipHop & Hits de Gangnam',
      desc_en: 'Seoul • Non-Stop K-Pop, K-R&B & Gangnam Hits',
      icon: '🇰🇷',
      streamUrl: 'https://listen.moe/kpop/stream',
      fallbackUrl: 'https://kathy.torontocast.com:3340/stream',
      badge: 'SEOUL K-POP',
      cityId: 'seoul'
    },
    {
      id: 'miami_reggaeton',
      category: 'city',
      name: 'Miami Latin & Reggaeton',
      desc_fr: 'Miami • Reggaeton, Latin Hits & Ocean Drive',
      desc_en: 'Miami • Reggaeton, Urban Latin & Ocean Drive',
      icon: '🌴',
      streamUrl: 'https://icecast.radiofrance.fr/fipworld-midfi.mp3',
      fallbackUrl: 'https://scdn.nrjaudio.fm/audio1/fr/30001/mp3_128.mp3',
      badge: 'MIAMI LATIN',
      cityId: 'miami'
    },
    {
      id: 'rio_bossa',
      category: 'city',
      name: 'Rio Bossa & Ipanema Breeze',
      desc_fr: 'Rio • Bossa Nova, Samba Soul & Plage d’Ipanema',
      desc_en: 'Rio • Bossa Nova, Samba Soul & Ipanema Sunset',
      icon: '🇧🇷',
      streamUrl: 'https://ice1.somafm.com/bossa-128-mp3',
      fallbackUrl: 'https://icecast.radiofrance.fr/fipworld-midfi.mp3',
      badge: 'RIO BOSSA',
      cityId: null
    },
    {
      id: 'lagos_afrobeats',
      category: 'city',
      name: 'Afrobeats & Amapiano Pulse',
      desc_fr: 'Lagos & Monde • Afrobeats, Amapiano & Groove',
      desc_en: 'Lagos & World • Afrobeats, Amapiano & Warm Groove',
      icon: '🌍',
      streamUrl: 'https://icecast.radiofrance.fr/fipgroove-midfi.mp3',
      fallbackUrl: 'https://ice1.somafm.com/suburbsofgoa-128-mp3',
      badge: 'AFROBEATS',
      cityId: null
    },
    {
      id: 'dubai_dj',
      category: 'city',
      name: 'Dubai Desert Lounge & Club',
      desc_fr: 'Dubaï • Oriental Deep House & Rooftop Lounge',
      desc_en: 'Dubai • Oriental Deep House & Marina Lounge',
      icon: '🇦🇪',
      streamUrl: 'https://listen.radioking.com/radio/623812/stream/685903',
      fallbackUrl: 'https://ice1.somafm.com/suburbsofgoa-128-mp3',
      badge: 'DUBAI',
      cityId: 'dubai'
    },
    {
      id: 'swiss_pop',
      category: 'city',
      name: 'Monaco & Geneva Riviera Pop',
      desc_fr: 'Monaco & Genève • Pop Chic & Doux Classiques',
      desc_en: 'Monaco & Geneva • Riviera Pop & Chic Classics',
      icon: '🇲🇨',
      streamUrl: 'https://stream.srg-ssr.ch/m/rsp/mp3_128',
      fallbackUrl: 'https://stream.srg-ssr.ch/m/rsj/mp3_128',
      badge: 'RIVIERA',
      cityId: 'monaco'
    }
  ];

  const L2E_MAX_DAILY_COINS = 30;
  const L2E_COINS_PER_CYCLE = 5;
  const L2E_SECONDS_PER_CYCLE = 600; // 10 minutes active listening = +5 Coins

  function escHtml(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  class RemoRadioEngine {
    constructor() {
      this.stations = REMO_RADIO_STATIONS;
      this.audioEl = new Audio();
      this.audioEl.preload = 'none';
      // IMPORTANT: Never set crossOrigin='anonymous' on live radio <audio> —
      // Icecast/Shoutcast CDN redirects drop or fail CORS when crossOrigin is set!
      this.currentCategory = 'vibe'; // 'vibe' | 'city' | 'jukebox'
      this.searchQuery = '';

      const savedStationId = localStorage.getItem('remo_radio_current_station') || 'capital_chill';
      this.currentStation = this.stations.find((s) => s.id === savedStationId) || this.stations[0];
      const savedVol = parseFloat(localStorage.getItem('remo_radio_volume'));
      this.volume = !isNaN(savedVol) ? Math.max(0, Math.min(1, savedVol)) : 0.65;
      this.audioEl.volume = this.volume;

      // Continuous Playback & Freeze Detection State
      this.isPlaying = false;
      this.isLoading = false;
      this.isSynthMode = false;
      this.userWantsPlaying = false;
      this.isReconnecting = false;
      this.reconnectAttempts = 0;
      this._usingFallbackUrl = false;
      this._reconnectTimer = null;
      this._watchdogTimer = null;
      this._l2eTimer = null;
      this._lastProgressTs = 0;
      this._lastCurrentTime = -1;

      // Smart Audio Ducking State
      this._activeExternalMediaEls = new Set();
      this._externalSynthActive = false;
      this._isDucked = false;

      this._bindAudioEvents();
      this._initMediaSessionHandlers();
      this._startAntiPauseWatchdog();
      this._bindVisibilityWatchdog();
      this._bindSmartAudioDucking();
      this._startListenToEarnTicker();
    }

    _applyEffectiveVolume() {
      const target = this._isDucked ? Math.max(0.05, this.volume * 0.2) : this.volume;
      try {
        this.audioEl.volume = Math.max(0, Math.min(1, target));
      } catch (e) {}
    }

    _recomputeDuckingState() {
      // Prune ended/paused elements
      Array.from(this._activeExternalMediaEls).forEach((el) => {
        if (!el || el.paused || el.ended || el.muted || !document.contains(el)) {
          this._activeExternalMediaEls.delete(el);
        }
      });
      const shouldDuck = this._externalSynthActive || this._activeExternalMediaEls.size > 0;
      if (this._isDucked !== shouldDuck) {
        this._isDucked = shouldDuck;
        this._applyEffectiveVolume();
      }
    }

    setExternalSynthActive(active) {
      this._externalSynthActive = Boolean(active);
      this._recomputeDuckingState();
    }

    _bindSmartAudioDucking() {
      if (typeof document === 'undefined') return;
      const checkTarget = (ev) => {
        const el = ev && ev.target;
        if (!el || el === this.audioEl) return;
        const tag = el.tagName ? el.tagName.toUpperCase() : '';
        if (tag !== 'VIDEO' && tag !== 'AUDIO') return;
        if (!el.paused && !el.ended && !el.muted && el.volume > 0.02) {
          this._activeExternalMediaEls.add(el);
        } else {
          this._activeExternalMediaEls.delete(el);
        }
        this._recomputeDuckingState();
      };
      document.addEventListener('play', checkTarget, true);
      document.addEventListener('playing', checkTarget, true);
      document.addEventListener('pause', checkTarget, true);
      document.addEventListener('ended', checkTarget, true);
      document.addEventListener('volumechange', checkTarget, true);
    }

    _bindAudioEvents() {
      this.audioEl.addEventListener('playing', () => {
        this.isLoading = false;
        this.isPlaying = true;
        this.isReconnecting = false;
        this.reconnectAttempts = 0;
        this._lastProgressTs = Date.now();
        this._lastCurrentTime = this.audioEl.currentTime || 0;
        this._applyEffectiveVolume();
        this._updateMediaSession();
        this._updateUI();
      });

      this.audioEl.addEventListener('timeupdate', () => {
        const ct = this.audioEl.currentTime || 0;
        if (ct !== this._lastCurrentTime) {
          this._lastCurrentTime = ct;
          this._lastProgressTs = Date.now();
        }
        if (this.userWantsPlaying && (this.isLoading || !this.isPlaying)) {
          this.isLoading = false;
          this.isPlaying = true;
          this._updateUI();
        }
      });

      this.audioEl.addEventListener('waiting', () => {
        if (this.userWantsPlaying && !this.isSynthMode) {
          this.isLoading = true;
          this._updateUI();
        }
      });

      // NOTE: Do NOT reconnect on 'stalled'! Browsers emit 'stalled' routinely when their
      // network read pauses because the audio buffer is full while playback is healthy!

      this.audioEl.addEventListener('pause', () => {
        if (this.isSynthMode) return;
        if (this.userWantsPlaying && !this.isReconnecting) {
          // Try gentle resume first before tearing down the socket
          setTimeout(() => {
            if (!this.userWantsPlaying || this.isSynthMode || !this.audioEl.paused || this.isReconnecting) return;
            const resumeAttempt = this.audioEl.play();
            if (resumeAttempt && typeof resumeAttempt.catch === 'function') {
              resumeAttempt.catch(() => {
                this._scheduleAutoReconnect('unexpected_pause');
              });
            }
          }, 350);
        } else if (!this.userWantsPlaying) {
          this.isPlaying = false;
          this.isLoading = false;
          this._updateMediaSession();
          this._updateUI();
        }
      });

      this.audioEl.addEventListener('ended', () => {
        if (this.userWantsPlaying && !this.isSynthMode) {
          this._scheduleAutoReconnect('ended');
        }
      });

      this.audioEl.addEventListener('error', () => {
        if (this.userWantsPlaying && !this.isSynthMode) {
          if (!this._usingFallbackUrl && this.currentStation && this.currentStation.fallbackUrl) {
            this._usingFallbackUrl = true;
          }
          this._scheduleAutoReconnect('error');
        } else {
          this.isLoading = false;
          this.isPlaying = false;
          this._updateUI();
        }
      });
    }

    _scheduleAutoReconnect(reason = 'unknown') {
      if (!this.userWantsPlaying || this.isSynthMode) return;
      if (this.isReconnecting) return;

      this.isReconnecting = true;
      this.isLoading = true;
      this._updateUI();

      if (this._reconnectTimer) clearTimeout(this._reconnectTimer);
      const delay = Math.min(5500, 900 * Math.pow(1.4, this.reconnectAttempts));
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= 2 && !this._usingFallbackUrl && this.currentStation && this.currentStation.fallbackUrl) {
        this._usingFallbackUrl = true;
      }

      this._reconnectTimer = setTimeout(() => {
        if (!this.userWantsPlaying || this.isSynthMode) {
          this.isReconnecting = false;
          return;
        }
        this._reconnectStream(reason);
      }, delay);
    }

    _getActiveStreamUrl() {
      if (!this.currentStation) return '';
      if (this._usingFallbackUrl && this.currentStation.fallbackUrl) {
        return this.currentStation.fallbackUrl;
      }
      return this.currentStation.streamUrl || '';
    }

    _reconnectStream(reason = '') {
      const rawUrl = this._getActiveStreamUrl();
      if (!rawUrl || rawUrl === 'internal://synth') {
        this.isReconnecting = false;
        return;
      }

      const sep = rawUrl.includes('?') ? '&' : '?';
      const freshUrl = `${rawUrl}${sep}_r=${Date.now()}`;

      try {
        this.audioEl.pause();
        this.audioEl.removeAttribute('src');
        this.audioEl.load();
      } catch (e) {}

      this.audioEl.src = freshUrl;
      this._applyEffectiveVolume();

      const p = this.audioEl.play();
      if (p && typeof p.then === 'function') {
        p.then(() => {
          this.isPlaying = true;
          this.isLoading = false;
          this.isReconnecting = false;
          this.reconnectAttempts = 0;
          this._lastProgressTs = Date.now();
          this._updateMediaSession();
          this._updateUI();
        }).catch(() => {
          this.isReconnecting = false;
          if (this.userWantsPlaying && this.reconnectAttempts < 5) {
            this._scheduleAutoReconnect('retry_' + reason);
          } else if (this.userWantsPlaying) {
            // Ultimate zero-fail fallback: Cyber-Lofi WebAudio synth never drops!
            this.selectStation('remo_synth_offline', true);
          } else {
            this.isLoading = false;
            this._updateUI();
          }
        });
      }
    }

    _startAntiPauseWatchdog() {
      if (this._watchdogTimer) clearInterval(this._watchdogTimer);
      this._watchdogTimer = setInterval(() => {
        this._recomputeDuckingState();
        if (!this.userWantsPlaying || this.isSynthMode || this.isReconnecting) return;

        const now = Date.now();
        const frozenMs = this._lastProgressTs > 0 ? (now - this._lastProgressTs) : 0;
        if (this.audioEl.paused) {
          this._scheduleAutoReconnect('watchdog_paused');
        } else if (frozenMs > 9500 && this.audioEl.readyState < 3) {
          this._lastProgressTs = now;
          this._scheduleAutoReconnect('watchdog_frozen');
        }
      }, 4500);
    }

    _bindVisibilityWatchdog() {
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden && this.userWantsPlaying && !this.isSynthMode && this.audioEl.paused) {
          this._reconnectStream('visibility_revive');
        }
      });
    }

    /* ── 🪙 LISTEN-TO-EARN ENGINE (+5 Coins / 10 min, max 30 Coins/day) ── */
    _getTodayL2EKey() {
      const d = new Date();
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `remo_radio_l2e_${yyyy}-${mm}-${dd}`;
    }

    _loadL2EState() {
      try {
        const raw = JSON.parse(localStorage.getItem(this._getTodayL2EKey()) || '{}');
        return {
          sec: Math.max(0, Number(raw.sec || 0)),
          coins: Math.max(0, Math.min(L2E_MAX_DAILY_COINS, Number(raw.coins || 0)))
        };
      } catch (e) {
        return { sec: 0, coins: 0 };
      }
    }

    _saveL2EState(st) {
      try {
        localStorage.setItem(this._getTodayL2EKey(), JSON.stringify(st));
      } catch (e) {}
    }

    _startListenToEarnTicker() {
      if (this._l2eTimer) clearInterval(this._l2eTimer);
      this._l2eTimer = setInterval(() => {
        if (!this.isPlaying) return;
        const st = this._loadL2EState();
        if (st.coins >= L2E_MAX_DAILY_COINS) {
          this._updateL2EBarDOM(st);
          return;
        }
        st.sec += 1;
        if (st.sec >= L2E_SECONDS_PER_CYCLE) {
          st.sec = 0;
          st.coins = Math.min(L2E_MAX_DAILY_COINS, st.coins + L2E_COINS_PER_CYCLE);
          this._saveL2EState(st);
          const u = (window.REMO_STORE && window.REMO_STORE.getCurrentUser) ? window.REMO_STORE.getCurrentUser() : null;
          if (u && u.uid) {
            window.REMO_STORE.addCoins(u.uid, L2E_COINS_PER_CYCLE, 3);
            window.REMO_STORE.save(true, 'radio_l2e');
            if (typeof window.syncHeaderAndSidebars === 'function') window.syncHeaderAndSidebars();
          }
          if (typeof window.remoToast === 'function') {
            const msg = (window.t && window.t('radio_l2e_toast')) || '📻 +5 🪙 Listen-to-Earn Radio Bonus!';
            window.remoToast(msg, 'coin');
          }
        } else if (st.sec % 5 === 0) {
          this._saveL2EState(st);
        }
        this._updateL2EBarDOM(st);
      }, 1000);
    }

    _updateL2EBarDOM(forcedState) {
      const txtEl = document.getElementById('radioL2EText');
      const fillEl = document.getElementById('radioL2EFill');
      if (!txtEl && !fillEl) return;
      const st = forcedState || this._loadL2EState();
      if (st.coins >= L2E_MAX_DAILY_COINS) {
        if (txtEl) txtEl.textContent = (window.t && window.t('radio_l2e_maxed')) || '✓ Daily Listen Bonus Maxed (30/30 🪙)!';
        if (fillEl) fillEl.style.width = '100%';
      } else {
        const pct = Math.min(100, Math.round((st.sec / L2E_SECONDS_PER_CYCLE) * 100));
        if (txtEl) {
          txtEl.textContent = (window.t && window.t('radio_l2e_lbl', { cur: st.coins, max: L2E_MAX_DAILY_COINS }))
            || `🪙 Listen-to-Earn: ${st.coins}/${L2E_MAX_DAILY_COINS} 🪙 today (+5 🪙 / 10m)`;
        }
        if (fillEl) fillEl.style.width = `${pct}%`;
      }
    }

    /* ── 📱 MEDIASESSION API ── */
    _initMediaSessionHandlers() {
      if (!('mediaSession' in navigator)) return;
      try {
        navigator.mediaSession.setActionHandler('play', () => this.play());
        navigator.mediaSession.setActionHandler('pause', () => this.pause());
        navigator.mediaSession.setActionHandler('stop', () => this.stop());
        navigator.mediaSession.setActionHandler('nexttrack', () => this.nextStation());
        navigator.mediaSession.setActionHandler('previoustrack', () => this.prevStation());
      } catch (e) {}
    }

    _updateMediaSession() {
      if (!('mediaSession' in navigator) || !this.currentStation) return;
      try {
        const lang = (window.REMO_I18N && window.REMO_I18N.getLang) ? window.REMO_I18N.getLang() : 'en';
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
      this._usingFallbackUrl = false;
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
      this.selectStation(this.stations[nextIdx].id, true);
    }

    prevStation() {
      const curIdx = this.stations.findIndex((s) => s.id === this.currentStation.id);
      const prevIdx = (curIdx - 1 + this.stations.length) % this.stations.length;
      this.selectStation(this.stations[prevIdx].id, true);
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
      this._lastProgressTs = Date.now();
      this._updateUI();

      this.audioEl.src = this._getActiveStreamUrl();
      this._applyEffectiveVolume();

      const p = this.audioEl.play();
      if (p && typeof p.then === 'function') {
        p.then(() => {
          this.isPlaying = true;
          this.isLoading = false;
          this._lastProgressTs = Date.now();
          this._updateMediaSession();
          this._updateUI();
        }).catch(() => {
          if (!this._usingFallbackUrl && this.currentStation.fallbackUrl) {
            this._usingFallbackUrl = true;
            this._reconnectStream('initial_fallback');
          } else {
            this.isLoading = false;
            this.isPlaying = false;
            this._updateUI();
          }
        });
      }
    }

    pause() {
      this.userWantsPlaying = false;
      this.isReconnecting = false;
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
      this.isReconnecting = false;
      if (this._reconnectTimer) clearTimeout(this._reconnectTimer);

      if (window.RemoAudio && window.RemoAudio.radioPlaying) {
        window.RemoAudio.stopRadio();
      }
      this.isSynthMode = false;
      try {
        this.audioEl.pause();
        this.audioEl.removeAttribute('src');
        this.audioEl.load();
      } catch (e) {}
      this.isPlaying = false;
      this.isLoading = false;
      this._updateMediaSession();
      this._updateUI();
    }

    toggle() {
      if (this.isPlaying || this.userWantsPlaying) {
        this.pause();
      } else {
        this.play();
      }
    }

    setVolume(val) {
      const v = Math.max(0, Math.min(1, parseFloat(val)));
      this.volume = v;
      this._applyEffectiveVolume();
      localStorage.setItem('remo_radio_volume', String(v));
      this._updateUI();
    }

    tuneToCity(cityId, forcePlay = false) {
      if (!cityId) return false;
      const match = this.stations.find((s) => s.cityId === cityId);
      if (match) {
        this.selectStation(match.id, forcePlay ? true : this.isPlaying);
        return true;
      }
      return false;
    }

    _updateUI() {
      const lang = (window.REMO_I18N && window.REMO_I18N.getLang) ? window.REMO_I18N.getLang() : 'en';
      const st = this.currentStation;

      // 1. Zero-Clutter Header Pill (#btnRadioToggle) with inline 1-click Pause & Next!
      const btn = document.getElementById('btnRadioToggle');
      if (btn) {
        if (this.isPlaying) {
          btn.style.borderColor = '#10b981';
          btn.style.boxShadow = '0 0 12px rgba(16,185,129,0.45)';
          btn.style.color = '#34d399';
          btn.style.padding = '5px 8px';
          btn.innerHTML = `
            <span class="hdr-radio-capsule">
              <span class="radio-eq-bars">
                <span class="bar b1"></span>
                <span class="bar b2"></span>
                <span class="bar b3"></span>
              </span>
              <span class="hdr-radio-st-lbl">${st.icon} ${escHtml(st.name)}</span>
              <span class="hdr-radio-mini-act" onclick="headerRadioPlayPauseInline(event)" title="Pause">⏸️</span>
              <span class="hdr-radio-mini-act" onclick="headerRadioNextInline(event)" title="Next">⏭️</span>
            </span>
          `;
        } else if (this.isLoading) {
          btn.style.borderColor = '#fbbf24';
          btn.style.boxShadow = '0 0 10px rgba(251,191,36,0.3)';
          btn.style.color = '#fbbf24';
          btn.style.padding = '';
          btn.innerHTML = `<span>⏳ ${lang === 'fr' ? 'Connexion...' : 'Tuning...'}</span>`;
        } else {
          btn.style.borderColor = '';
          btn.style.boxShadow = '';
          btn.style.color = '';
          btn.style.padding = '';
          btn.innerHTML = `📻 Radio`;
        }
      }

      // 2. Mobile Hub Button
      const mbTxt = document.getElementById('mbRadioBtnTxt');
      if (mbTxt) {
        mbTxt.innerHTML = this.isPlaying
          ? `🟢 ${st.icon} ${escHtml(st.name)}`
          : (lang === 'fr' ? `📻 Radio & Jukebox` : `📻 Radio & Jukebox`);
      }

      // 3. Modal Now-Playing Card
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
          : (this.isLoading ? (lang === 'fr' ? '⏳ CONNEXION' : '⏳ BUFFERING') : (lang === 'fr' ? '⏸️ EN PAUSE' : '⏸️ PAUSED'));
        npBadge.style.color = this.isPlaying ? '#10b981' : (this.isLoading ? '#fbbf24' : '#94a3b8');
      }

      if (playBtn) {
        playBtn.innerHTML = this.isPlaying
          ? `<span>⏸️</span> <span>${lang === 'fr' ? 'Pause' : 'Pause'}</span>`
          : (this.isLoading ? `<span>⏳</span> <span>${lang === 'fr' ? 'Connexion...' : 'Tuning...'}</span>` : `<span>▶️</span> <span>${lang === 'fr' ? 'Écouter' : 'Play Live'}</span>`);
        playBtn.classList.toggle('btn-gold', !this.isPlaying);
      }

      if (volSlider) volSlider.value = Math.round(this.volume * 100);
      if (volValue) volValue.textContent = `${Math.round(this.volume * 100)}%`;

      this._updateL2EBarDOM();
      if (typeof window.syncActivePostAudioDOM === 'function') window.syncActivePostAudioDOM();

      // 4. Station Cards Active State
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
            stStatus.textContent = lang === 'fr' ? 'Connexion...' : 'Tuning...';
            stStatus.style.color = '#fbbf24';
          } else {
            stStatus.textContent = '';
          }
        }
      });
    }
  }

  const radioEngine = new RemoRadioEngine();
  window.REMO_RADIO = radioEngine;

  /* ── GLOBAL RADIO & JUKEBOX UI CONTROLLERS ── */
  window.headerRadioPlayPauseInline = function (ev) {
    if (ev) ev.stopPropagation();
    radioEngine.toggle();
  };

  window.headerRadioNextInline = function (ev) {
    if (ev) ev.stopPropagation();
    radioEngine.nextStation();
  };

  window.openRemoRadioModal = function () {
    const modal = document.getElementById('remoRadioModal');
    if (!modal) return;
    populateJukeboxCitySelect();
    if (radioEngine.currentCategory === 'jukebox') {
      renderRadioJukeboxView();
    } else {
      renderRadioStationsList();
    }
    radioEngine._updateUI();
    modal.classList.add('open');
  };

  window.closeRemoRadioModal = function () {
    const modal = document.getElementById('remoRadioModal');
    if (modal) modal.classList.remove('open');
  };

  window.openBeatStudioFromRadio = function () {
    window.closeRemoRadioModal();
    if (typeof window.openCreatePostModal === 'function') {
      window.openCreatePostModal('#RemoBeat');
      if (typeof window.switchCreateStudioTab === 'function') {
        window.switchCreateStudioTab('beat');
      }
    }
  };

  window.toggleRadioPlayPause = function () {
    radioEngine.toggle();
  };

  window.selectRadioStation = function (stationId) {
    radioEngine.selectStation(stationId, true);
  };

  window.setRadioVolume = function (sliderEl) {
    if (!sliderEl) return;
    radioEngine.setVolume(Number(sliderEl.value) / 100);
  };

  window.filterRadioStationsByQuery = function (q) {
    radioEngine.searchQuery = String(q || '').trim().toLowerCase();
    renderRadioStationsList();
  };

  window.setRadioCategoryTab = function (cat, btnEl) {
    radioEngine.currentCategory = cat;
    document.querySelectorAll('#radioCategoryTabs .fchip').forEach((b) => b.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');

    const grid = document.getElementById('radioStationsGrid');
    const searchWrap = document.getElementById('radioStationSearchWrap');
    const jukeboxWrap = document.getElementById('radioJukeboxWrap');

    if (cat === 'jukebox') {
      if (grid) grid.style.display = 'none';
      if (searchWrap) searchWrap.style.display = 'none';
      if (jukeboxWrap) jukeboxWrap.classList.add('active');
      populateJukeboxCitySelect();
      renderRadioJukeboxView();
    } else {
      if (grid) grid.style.display = '';
      if (searchWrap) searchWrap.style.display = 'block';
      if (jukeboxWrap) jukeboxWrap.classList.remove('active');
      renderRadioStationsList();
    }
  };

  window.toggleHeaderRadio = function () {
    window.openRemoRadioModal();
  };

  function renderRadioStationsList() {
    const grid = document.getElementById('radioStationsGrid');
    if (!grid) return;
    const lang = (window.REMO_I18N && window.REMO_I18N.getLang) ? window.REMO_I18N.getLang() : 'en';
    const cat = radioEngine.currentCategory === 'city' ? 'city' : 'vibe';
    const q = radioEngine.searchQuery || '';

    // When user types a search query, search across ALL 38 stations so they find any city or genre immediately!
    const pool = q
      ? radioEngine.stations.filter((s) =>
          s.name.toLowerCase().includes(q) ||
          s.badge.toLowerCase().includes(q) ||
          s.desc_en.toLowerCase().includes(q) ||
          s.desc_fr.toLowerCase().includes(q) ||
          (s.cityId && s.cityId.toLowerCase().includes(q))
        )
      : radioEngine.stations.filter((s) => s.category === cat);

    grid.innerHTML = pool.map((s) => {
      const isActive = radioEngine.currentStation && radioEngine.currentStation.id === s.id;
      const desc = lang === 'fr' ? s.desc_fr : s.desc_en;
      return `
        <div class="radio-station-card ${isActive ? 'active' : ''}" data-station-id="${s.id}" onclick="selectRadioStation('${s.id}')">
          <div style="display:flex;align-items:center;gap:12px;">
            <div class="st-icon">${s.icon}</div>
            <div style="flex:1;min-width:0;">
              <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                <b style="color:#fff;font-size:0.9rem;">${escHtml(s.name)}</b>
                <span class="st-badge">${escHtml(s.badge)}</span>
              </div>
              <div style="font-size:0.74rem;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:2px;">
                ${escHtml(desc)}
              </div>
            </div>
            <div class="st-status" style="font-size:0.74rem;font-weight:800;white-space:nowrap;">
              ${isActive && radioEngine.isPlaying ? '<span class="pulse-dot"></span> ' + (lang === 'fr' ? 'En direct' : 'Playing') : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }
  window.renderRadioStationsList = renderRadioStationsList;

  /* ── 🏆 TAB #3: WEEKLY CITY JUKEBOX (CITIZEN NOMINATIONS & FIRE VOTES) ── */
  function populateJukeboxCitySelect() {
    const sel = document.getElementById('jukeboxCitySel');
    if (!sel || typeof window.getRemoCities !== 'function') return;
    const lang = (window.REMO_I18N && window.REMO_I18N.getLang) ? window.REMO_I18N.getLang() : 'en';
    const u = (window.REMO_STORE && window.REMO_STORE.getCurrentUser) ? window.REMO_STORE.getCurrentUser() : null;
    const prefCity = (u && u.homeCity) || 'montreal';
    sel.innerHTML = window.getRemoCities().map((c) => {
      const cname = typeof window.getCityName === 'function' ? window.getCityName(c, lang) : (c.name_en || c.id);
      return `<option value="${c.id}" ${c.id === prefCity ? 'selected' : ''}>${c.flag} ${escHtml(cname)}</option>`;
    }).join('');
  }

  window.toggleJukeboxAddForm = function () {
    const f = document.getElementById('jukeboxAddForm');
    if (!f) return;
    f.classList.toggle('open');
  };

  window.renderRadioJukeboxView = function () {
    const listEl = document.getElementById('jukeboxTracksList');
    if (!listEl || !window.REMO_STORE || !window.REMO_STORE.state) return;
    const lang = (window.REMO_I18N && window.REMO_I18N.getLang) ? window.REMO_I18N.getLang() : 'en';
    const u = window.REMO_STORE.getCurrentUser();
    const voterKey = (u && u.uid) || localStorage.getItem('remo_guest_vid') || 'guest';
    const tracks = (window.REMO_STORE.state.jukeboxTracks || []).slice().sort((a, b) => (Number(b.votes || 0) - Number(a.votes || 0)));

    if (!tracks.length) {
      listEl.innerHTML = `<div style="text-align:center;padding:20px;font-size:0.8rem;color:var(--muted);">${escHtml((window.t && window.t('jukebox_empty')) || 'No tracks yet.')}</div>`;
      return;
    }

    const medals = ['🥇', '🥈', '🥉'];
    listEl.innerHTML = tracks.map((tr, idx) => {
      const c = (typeof window.getCityById === 'function' && window.getCityById(tr.cityId)) || { flag: '🌍', name_en: tr.cityId, name_fr: tr.cityId };
      const cname = typeof window.getCityName === 'function' ? window.getCityName(c, lang) : (c.name_en || '');
      const hasVoted = (Array.isArray(tr.voters) && tr.voters.includes(voterKey)) || localStorage.getItem('remo_jb_vote_' + tr.id) === '1';
      const isPreviewing = Boolean(window.RemoAudio && window.RemoAudio.activeSoundtrackPostId === ('jb_' + tr.id));
      const cleanUrl = (tr.url && /^https?:\/\//i.test(tr.url)) ? tr.url : '';

      return `
        <div class="jukebox-card ${idx === 0 ? 'rank-1' : ''}">
          <div style="min-width:0;flex:1;">
            <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
              <span style="font-weight:900;color:#fbbf24;">${medals[idx] || `#${idx + 1}`}</span>
              <b style="color:#fff;font-size:0.87rem;">${escHtml(tr.title)}</b>
              <span class="st-badge">${c.flag} ${escHtml(cname)}</span>
            </div>
            <div style="font-size:0.74rem;color:#94a3b8;margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
              🎤 ${escHtml(tr.artist || 'Artist')} · @${escHtml(tr.addedBy || 'Citizen')}
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
            ${cleanUrl
              ? `<a href="${escHtml(cleanUrl)}" target="_blank" rel="noopener noreferrer" class="btn-ghost" style="padding:5px 9px;font-size:0.72rem;text-decoration:none;">${escHtml((window.t && window.t('jukebox_listen_btn')) || '🔗 Open')}</a>`
              : `<button type="button" class="btn-ghost" style="padding:5px 9px;font-size:0.72rem;${isPreviewing ? 'border-color:#10b981;color:#6ee7b7;' : ''}" onclick="previewJukeboxTrackVibe('${tr.id}')">${isPreviewing ? '⏹️' : escHtml((window.t && window.t('jukebox_preview_btn')) || '▶️ Vibe')}</button>`}
            <button type="button" class="jukebox-fire-btn ${hasVoted ? 'voted' : ''}" onclick="voteJukeboxTrack('${tr.id}')">
              🔥 <span>${Number(tr.votes || 0)}</span>
            </button>
          </div>
        </div>
      `;
    }).join('');
  };

  window.previewJukeboxTrackVibe = function (trackId) {
    if (!window.REMO_STORE || !window.RemoAudio) return;
    const tr = (window.REMO_STORE.state.jukeboxTracks || []).find((x) => x.id === trackId);
    if (!tr) return;
    window.RemoAudio.playSoundtrackLoop(tr.soundPreset || 'sunset_house', 'jb_' + tr.id);
    window.renderRadioJukeboxView();
  };

  window.voteJukeboxTrack = function (trackId) {
    if (!window.REMO_STORE || !window.REMO_STORE.state) return;
    const tr = (window.REMO_STORE.state.jukeboxTracks || []).find((x) => x.id === trackId);
    if (!tr) return;
    const u = window.REMO_STORE.getCurrentUser();
    let voterKey = u && u.uid ? u.uid : localStorage.getItem('remo_guest_vid');
    if (!voterKey) {
      voterKey = 'g_' + Date.now().toString(36);
      localStorage.setItem('remo_guest_vid', voterKey);
    }
    if (!Array.isArray(tr.voters)) tr.voters = [];
    if (tr.voters.includes(voterKey) || localStorage.getItem('remo_jb_vote_' + tr.id) === '1') {
      if (typeof window.remoToast === 'function') {
        window.remoToast((window.t && window.t('jukebox_already_voted')) || '✓ Already voted!');
      }
      return;
    }

    tr.voters.push(voterKey);
    localStorage.setItem('remo_jb_vote_' + tr.id, '1');
    tr.votes = Number(tr.votes || 0) + 1;
    if (tr.cityId && typeof window.REMO_STORE.addCityScore === 'function') {
      window.REMO_STORE.addCityScore(tr.cityId, 2);
    }
    if (window.RemoAudio) window.RemoAudio.play('coin');
    window.REMO_STORE.save(true, 'jukebox_vote');
    window.renderRadioJukeboxView();
    if (typeof window.remoToast === 'function') {
      window.remoToast((window.t && window.t('jukebox_vote_toast', { title: tr.title })) || '🔥 +1 Vote!', 'coin');
    }
  };

  window.submitJukeboxTrack = function () {
    if (!window.REMO_STORE || !window.REMO_STORE.state) return;
    const titleEl = document.getElementById('jukeboxTitleInp');
    const artistEl = document.getElementById('jukeboxArtistInp');
    const cityEl = document.getElementById('jukeboxCitySel');
    const urlEl = document.getElementById('jukeboxUrlInp');
    const title = (titleEl && titleEl.value.trim()) || '';
    const artist = (artistEl && artistEl.value.trim()) || '';
    const cityId = (cityEl && cityEl.value) || 'montreal';
    const rawUrl = (urlEl && urlEl.value.trim()) || '';

    if (!title || !artist) return;
    const cleanUrl = /^https?:\/\//i.test(rawUrl) ? rawUrl : '';
    const u = window.REMO_STORE.getCurrentUser() || window.REMO_STORE.ensureGuestOrCitizen('Citizen', '', cityId);
    const presets = ['sunset_house', 'shibuya_neon', 'lofi_rain', 'afro_groove', 'french_cafe', 'cyber_pulse'];
    const pickPreset = presets[title.length % presets.length];

    if (!Array.isArray(window.REMO_STORE.state.jukeboxTracks)) {
      window.REMO_STORE.state.jukeboxTracks = [];
    }
    window.REMO_STORE.state.jukeboxTracks.unshift({
      id: 'jb_' + Date.now().toString(36),
      title,
      artist,
      cityId,
      url: cleanUrl,
      soundPreset: pickPreset,
      addedBy: u.name || 'Citizen',
      votes: 1,
      voters: [u.uid || 'creator'],
      createdAt: Date.now()
    });
    window.REMO_STORE.state.jukeboxTracks = window.REMO_STORE.state.jukeboxTracks.slice(0, 30);

    if (u && u.uid) {
      window.REMO_STORE.addCoins(u.uid, 5, 5);
    }
    if (titleEl) titleEl.value = '';
    if (artistEl) artistEl.value = '';
    if (urlEl) urlEl.value = '';
    document.getElementById('jukeboxAddForm')?.classList.remove('open');

    window.REMO_STORE.save(true, 'jukebox_add');
    if (typeof window.syncHeaderAndSidebars === 'function') window.syncHeaderAndSidebars();
    window.renderRadioJukeboxView();
    if (typeof window.remoToast === 'function') {
      window.remoToast((window.t && window.t('jukebox_added_toast', { title })) || '🎵 Added to Jukebox (+5 🪙)!', 'fanfare');
    }
  };

  window.addEventListener('remo:langchange', () => {
    radioEngine._updateUI();
    if (document.getElementById('remoRadioModal')?.classList.contains('open')) {
      if (radioEngine.currentCategory === 'jukebox') window.renderRadioJukeboxView();
      else renderRadioStationsList();
    }
  });
})();
