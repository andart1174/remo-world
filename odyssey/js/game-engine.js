/* ═══════════════════════════════════════════════════════════════════════════
   REMO WORLD: 4D Compass Odyssey — V5 Signature Complete Edition
   - Strictly Bilingual EN & FR (Instant Live Switch)
   - Fire & Lightning Combat + Elemental Counters (2X CRIT) + 5 Boss Variants
   - 4D Ascended Crystal Orbit + 4D Phase Blink (Q) + Chrono-Rift 3X Gravity
   - Dual Portals, Ghost Racer, Daily Wordle Odyssey, Vault Shop & 4D Passport
   - Skyline Neon Equalizer synced to Procedural Elemental Synthwave & Live City FM
   ═══════════════════════════════════════════════════════════════════════════ */

(function (global) {
  'use strict';

  const VW = 960;
  const VH = 540;
  const GROUND_Y = 446;
  const STORAGE_KEY = 'remo_odyssey_save_v3';
  const LANG_KEY = 'remo_odyssey_lang';
  const DAILY_EPOCH = Math.floor(Date.UTC(2026, 10, 16) / 86400000); // 2026-11-16 = Odyssey #1

  const VAULT_SHOP_ITEMS = [
    {
      id: 'up_blaster', kind: 'upgrade', key: 'blasterLv', maxLv: 3, prices: [120, 280, 600],
      icon: '🔥', name_en: 'FireBlast Overclock', name_fr: 'Surcharge Tir Feu/Foudre',
      desc_en: 'Faster Fire & Lightning recharge', desc_fr: 'Recharge Tir plus rapide'
    },
    {
      id: 'up_blink', kind: 'upgrade', key: 'blinkLv', maxLv: 3, prices: [120, 280, 600],
      icon: '🌀', name_en: '4D Blink & Magnet', name_fr: 'Phase 4D & Aimant',
      desc_en: 'Faster Blink (Q) + longer Magnet', desc_fr: 'Phase (Q) rapide + Aimant long'
    },
    {
      id: 'up_shield', kind: 'upgrade', key: 'shieldLv', maxLv: 1, prices: [320],
      icon: '💎', name_en: '4th Crystal Mastery', name_fr: 'Maîtrise 4e Cristal',
      desc_en: 'Start every run with 4/4 Shields', desc_fr: 'Départ avec 4/4 Boucliers'
    },
    {
      id: 'coin_gold', kind: 'skin', cat: 'hoverSkin', val: 'gold', price: 0,
      icon: '🪙', name_en: '24K REMO Coin (4B)', name_fr: 'Pièce REMO 24K (4B)',
      desc_en: 'Classic Gold & Cyan thrusters', desc_fr: 'Propulseurs Or & Cyan'
    },
    {
      id: 'coin_cyber', kind: 'skin', cat: 'hoverSkin', val: 'cyber', price: 160,
      icon: '💠', name_en: 'Cyber Emerald Coin', name_fr: 'Pièce Cyber Émeraude',
      desc_en: 'Emerald cyber pulse thrusters', desc_fr: 'Flux Cyber Émeraude 4B'
    },
    {
      id: 'coin_diamond', kind: 'skin', cat: 'hoverSkin', val: 'diamond', price: 340,
      icon: '💎', name_en: 'Royal Diamond Coin', name_fr: 'Pièce Diamant Royal',
      desc_en: 'Prismatic diamond-pink plasma', desc_fr: 'Plasma Diamant Prismatique'
    },
    {
      id: 'coin_galaxy', kind: 'skin', cat: 'hoverSkin', val: 'galaxy', price: 650,
      icon: '🌌', name_en: 'Galaxy Core Coin', name_fr: 'Pièce Cœur Galactique',
      desc_en: 'Cosmic nebula warp jets', desc_fr: 'Jets Nébuleuse Cosmique'
    },
    {
      id: 'aura_gold_fire', kind: 'skin', cat: 'aura', val: 'gold_fire', price: 0,
      icon: '✨', name_en: 'Solar Crown Aura', name_fr: 'Aura Couronne Solaire',
      desc_en: 'Warm golden 4D battle glow', desc_fr: 'Halo doré de combat 4D'
    },
    {
      id: 'aura_cyber', kind: 'skin', cat: 'aura', val: 'cyber_matrix', price: 150,
      icon: '⚡', name_en: 'Cyber Matrix Aura', name_fr: 'Aura Matrice Cyber',
      desc_en: 'Emerald-cyan matrix aura', desc_fr: 'Aura Matrice Émeraude-Cyan'
    },
    {
      id: 'aura_diamond', kind: 'skin', cat: 'aura', val: 'diamond_vip', price: 320,
      icon: '👑', name_en: 'Diamond VIP Aura', name_fr: 'Aura VIP Diamant',
      desc_en: 'Royal prism crystal aura', desc_fr: 'Aura Cristal Prisme Royal'
    },
    {
      id: 'aura_rainbow', kind: 'skin', cat: 'aura', val: 'rainbow_4d', price: 750,
      icon: '🌈', name_en: 'Rainbow 4D Halo', name_fr: 'Halo 4D Arc-en-ciel',
      desc_en: 'Spinning chromatic 4D ring', desc_fr: 'Anneau chromatique rotatif 4D'
    }
  ];

  const I18N = {
    en: {
      brandSub: 'REMO World Official 4D Game · 4A↔4B',
      hudScore: 'SCORE',
      hudCoins: 'COINS',
      hudCities: 'CITIES',
      hudDistance: 'DISTANCE',
      hudMult: 'MULT',
      title: 'REMO ODYSSEY',
      subtitle: 'REMO WORLD · 4D COMPASS',
      desc: 'Sprint through 24 real cities, use FireBlast (F) with Elemental 2X CRIT, Phase Blink (Q) through lasers, trigger 4D Ascended & Chrono-Rift 3X modes, spend Coins in the Vault Shop & collect all 24 Relics!',
      tabPlay: '🌍 PLAY & PASSPORT',
      tabShop: '🪙 VAULT SHOP',
      modeTour: '🌍 WORLD TOUR',
      modeDaily: '📅 DAILY ODYSSEY #{num}',
      dailyRoutePreview: 'TODAY’S 5-CITY ROUTE:',
      pickCity: '4D World Passport (24 Cities)',
      vipStyle: 'VIP Avatar Aura',
      startBtn: '🚀 LAUNCH REMO ODYSSEY',
      challengeBanner: '⚔️ 1v1 DUEL from @{vs} · Target: {target} pts!',
      controlsHint: 'JUMP: Space/↑ · BLINK: Q · SLIDE: ↓ · FIREBLAST: F/Right-Click · NOVA: E',
      jumpBtn: '⬆️ JUMP / UP',
      blinkBtnReady: '🌀 BLINK (Q)',
      blinkBtnCd: '🌀 {s}s',
      blastBtnReady: '🔥 BLAST (F)',
      blastBtnCd: '🔥 {s}s',
      dashBtn: '⬇️ DASH / DOWN',
      novaReady: '⚡ 4D NOVA (E)',
      novaChargeLbl: '⚡ NOVA ({pct}%)',
      cityModeTag: '4A CITY RUN',
      flyModeTag: '4B HOVER-COIN',
      portalToast: '🎫 BOARDING PASS! → {code} ({km} km)',
      landedToast: '🏙️ CONNECTED: {city}! +{pts} pts',
      surgeToast: '⚡ 2X WEATHER SURGE ACTIVE!',
      novaToast: '✨ 4D COMPASS NOVA!',
      blinkToast: '🌀 4D PHASE BLINK!',
      ascendedToast: '🌟 4D ASCENDED! AUTO-LIGHTNING ORBIT (10s)!',
      chronoToast: '⏳ 4D CHRONO-RIFT! 3X COINS & 4D GRAVITY!',
      critToast: '⚡ ELEMENTAL 2X CRIT!',
      relicToast: '👑 CITY RELIC EARNED: {code}!',
      shieldLost: '💎 CRYSTAL SHIELD SAVED YOU!',
      shieldGained: '💎 +1 CRYSTAL SHIELD RESTORED!',
      bossWarning: '👾 {name} ({hp} HP)! PRESS F TO FIREBLAST!',
      bossDefeated: '💥 {name} SHATTERED! +400 pts!',
      bossName_void: 'VOID SENTINEL',
      bossName_cyber: 'CYBER DRONE SWARM',
      bossName_plasma: 'PLASMA SOLAR CORE',
      bossName_crystal: 'CRYSTAL PRISM TITAN',
      bossName_neon: 'NEON TEMPEST',
      powerMagnet: '🧲 CYAN MAGNET PULSE!',
      powerBlitz: '🔥 PLASMA HYPER-BLITZ!',
      powerPrism: '💎 2X PRISM OVERDRIVE!',
      geovaultToast: '🎁 GEOVAULT UNLOCKED! +10 🪙 & OVERDRIVE!',
      feverToast: '🌈 15x COMBO · PRISM FEVER!',
      launchPadToast: '🚀 HYPER LAUNCH BOOST!',
      compassPrompt: '🧭 COMPASS LOCK! TAP / SPACE IN GOLD ZONE!',
      compassPerfect: '⚡ PERFECT COMPASS LOCK! +350 pts & SHOCKWAVE!',
      compassSafe: '🧭 SAFE LANDING IN {city}!',
      paused: 'PAUSED',
      resumeBtn: '▶ RESUME ODYSSEY',
      quitBtn: '🏠 MAIN MENU',
      gameOverTitle: 'ODYSSEY COMPLETE!',
      dailyVictoryTitle: '👑 DAILY ODYSSEY CONQUERED!',
      newBest: '🏆 NEW PERSONAL RECORD!',
      bestPrefix: 'PERSONAL BEST',
      challengeWon: '👑 YOU BEAT @{vs}’S RECORD!',
      challengeLost: '⚔️ Need {diff} more pts to beat @{vs}!',
      overCitiesLbl: 'CITIES',
      overDistLbl: 'DISTANCE',
      overCoinsLbl: 'REMO COINS',
      playAgain: '🔄 PLAY AGAIN',
      changeCityBtn: '🏠 MAIN MENU',
      shareCardBtn: '📲 9:16 STORY CARD',
      copyDuelBtn: '⚔️ 1v1 DUEL LINK',
      copyDailyBtn: '📋 COPY DAILY SCORE',
      duelCopied: '🔗 Copied to clipboard!',
      downloadBtn: '⬇️ DOWNLOAD 9:16 PNG',
      closeBtn: 'CLOSE',
      leaderboardTitle: '🏆 LOCAL HIGH SCORES',
      stampsTitle: '🎫 PASSPORT',
      relicsTitle: '👑 RELICS',
      vaultBankTitle: '🪙 VAULT COINS',
      shopHeadline: 'Spend saved REMO Coins on upgrades & 4D styles',
      shopBuy: 'BUY',
      shopEquip: 'EQUIP',
      shopEquipped: 'EQUIPPED',
      shopMax: 'MAX LV',
      contAll: 'ALL 24',
      contEU: 'EUROPE',
      contAM: 'AMERICAS',
      contAS: 'ASIA',
      contMEAF: 'ME·AF·OC',
      noRunsYet: 'No runs yet — be the first!',
      artTag4A: '4A · CITY',
      artTag4B: '4B · FLIGHT',
      ghostOn: '👻 ON',
      ghostOff: '👻 OFF',
      ghostLbl: '👻 BEST',
      fmOn: '📻 FM ON',
      fmOff: '📻 FM',
      fmNowPlaying: '📻 LIVE FM: {name}',
      fmEnabledToast: '📻 LIVE CITY FM ON! Real radio in every city!',
      fmDisabledToast: '🎵 Procedural Synthwave 4D Restored',
      blitzGatePrompt: '🧠 BLITZ GATE: {clue}',
      blitzGateCorrect: '🧠 BLITZ CORRECT! +500 pts & FULL 4D NOVA!',
      blitzGateWrong: '🧠 BLITZ ANSWER: {city}!',
      liveWeatherSurge: '🌦️ LIVE WEATHER IN {city} ({temp}°C) · 2X SURGE!',
      torchJackpotToast: '🔥 4D TORCH RELAY CITY! 3X JACKPOT!',
      cardChampToast: '👑 CARD CHAMPION BUFF (+15% SCORE)!',
      cityWarBanner: '⚔️ +{pts} CITY WAR POWER ADDED FOR {city}!',
      dropFeedBtn: '🌐 DROP CHALLENGE & CLAIM +150 🪙 ON REMO WORLD',
      dropFeedBtnLoggedIn: '📣 POST 1v1 CHALLENGE TO REMO FEED (+15 🪙)',
      feedChallengeDropped: '🚀 Challenge sent to REMO World Feed!'
    },
    fr: {
      brandSub: 'Jeu Officiel 4D REMO World · 4A↔4B',
      hudScore: 'SCORE',
      hudCoins: 'PIÈCES',
      hudCities: 'VILLES',
      hudDistance: 'DISTANCE',
      hudMult: 'MULT',
      title: 'REMO ODYSSEY',
      subtitle: 'REMO WORLD · BOUSSOLE 4D',
      desc: 'Courez dans 24 vraies villes, utilisez Tir Feu/Foudre (F) avec CRIT Élémentaire 2X, Phase Blink (Q) à travers les lasers, activez 4D Transcendé & Faille Chrono 3X, puis débloquez la Boutique Vault !',
      tabPlay: '🌍 JOUER & PASSEPORT',
      tabShop: '🪙 BOUTIQUE VAULT',
      modeTour: '🌍 TOUR DU MONDE',
      modeDaily: '📅 ODYSSÉE DU JOUR #{num}',
      dailyRoutePreview: 'ITINÉRAIRE DU JOUR (5 VILLES) :',
      pickCity: 'Passeport Mondial 4D (24 Villes)',
      vipStyle: 'Aura VIP Avatar',
      startBtn: '🚀 LANCER REMO ODYSSEY',
      challengeBanner: '⚔️ DÉFI 1v1 de @{vs} · Objectif : {target} pts !',
      controlsHint: 'SAUT : Espace/↑ · PHASE : Q · GLISSER : ↓ · TIR : F/Clic Droit · NOVA : E',
      jumpBtn: '⬆️ SAUT / MONTER',
      blinkBtnReady: '🌀 PHASE (Q)',
      blinkBtnCd: '🌀 {s}s',
      blastBtnReady: '🔥 TIR (F)',
      blastBtnCd: '🔥 {s}s',
      dashBtn: '⬇️ DASH / DESC.',
      novaReady: '⚡ 4D NOVA (E)',
      novaChargeLbl: '⚡ NOVA ({pct}%)',
      cityModeTag: 'MODE 4A · COURSE',
      flyModeTag: 'MODE 4B · HOVER-COIN',
      portalToast: '🎫 BOARDING PASS ! → {code} ({km} km)',
      landedToast: '🏙️ CONNECTÉE : {city} ! +{pts} pts',
      surgeToast: '⚡ 2X WEATHER SURGE ACTIF !',
      novaToast: '✨ 4D COMPASS NOVA !',
      blinkToast: '🌀 PHASE QUANTIQUE 4D !',
      ascendedToast: '🌟 MODE 4D TRANSCENDÉ ! FOUDRE AUTO (10s) !',
      chronoToast: '⏳ FAILLE CHRONO 4D ! 3X PIÈCES & GRAVITÉ 4D !',
      critToast: '⚡ CRIT ÉLÉMENTAIRE 2X !',
      relicToast: '👑 RELIQUE GAGNÉE : {code} !',
      shieldLost: '💎 BOUCLIER CRISTAL ACTIVÉ !',
      shieldGained: '💎 +1 BOUCLIER CRISTAL RESTAURÉ !',
      bossWarning: '👾 {name} ({hp} PV) ! APPUYEZ SUR F !',
      bossDefeated: '💥 {name} DÉTRUIT ! +400 pts !',
      bossName_void: 'SENTINELLE DU VIDE',
      bossName_cyber: 'ESSAIM CYBER',
      bossName_plasma: 'CŒUR SOLAIRE PLASMA',
      bossName_crystal: 'TITAN PRISME CRISTAL',
      bossName_neon: 'TEMPÊTE NÉON',
      powerMagnet: '🧲 AIMANT CYAN ACTIVÉ !',
      powerBlitz: '🔥 HYPER-BLITZ PLASMA !',
      powerPrism: '💎 SURCHARGE PRISME 2X !',
      geovaultToast: '🎁 COFFRE GEOVAULT ! +10 🪙 & SURCHARGE !',
      feverToast: '🌈 COMBO 15x · FIÈVRE PRISMATIQUE !',
      launchPadToast: '🚀 PROPULSION HYPER-SAUT !',
      compassPrompt: '🧭 VERROU BOUSSOLE ! ESPACE / TAP DANS L’OR !',
      compassPerfect: '⚡ ATTERRISSAGE PARFAIT ! +350 pts & ONDE DE CHOC !',
      compassSafe: '🧭 ATTERRISSAGE RÉUSSI À {city} !',
      paused: 'PAUSE',
      resumeBtn: '▶ CONTINUER',
      quitBtn: '🏠 MENU PRINCIPAL',
      gameOverTitle: 'ODYSSÉE TERMINÉE !',
      dailyVictoryTitle: '👑 ODYSSÉE DU JOUR CONQUISE !',
      newBest: '🏆 NOUVEAU RECORD PERSONNEL !',
      bestPrefix: 'MEILLEUR SCORE',
      challengeWon: '👑 VOUS AVEZ BATTU @{vs} !',
      challengeLost: '⚔️ Il manque {diff} pts pour battre @{vs} !',
      overCitiesLbl: 'VILLES',
      overDistLbl: 'DISTANCE',
      overCoinsLbl: 'PIÈCES REMO',
      playAgain: '🔄 REJOUER',
      changeCityBtn: '🏠 MENU PRINCIPAL',
      shareCardBtn: '📲 CARTE STORY 9:16',
      copyDuelBtn: '⚔️ LIEN DUEL 1v1',
      copyDailyBtn: '📋 COPIER SCORE DU JOUR',
      duelCopied: '🔗 Copié dans le presse-papiers !',
      downloadBtn: '⬇️ TÉLÉCHARGER PNG 9:16',
      closeBtn: 'FERMER',
      leaderboardTitle: '🏆 RECORDS LOCAUX',
      stampsTitle: '🎫 PASSEPORT',
      relicsTitle: '👑 RELIQUES',
      vaultBankTitle: '🪙 COFFRE',
      shopHeadline: 'Améliorez vos pouvoirs & styles 4D avec vos Pièces',
      shopBuy: 'ACHETER',
      shopEquip: 'ÉQUIPER',
      shopEquipped: 'ÉQUIPÉ',
      shopMax: 'NIV MAX',
      contAll: 'TOUTES 24',
      contEU: 'EUROPE',
      contAM: 'AMÉRIQUES',
      contAS: 'ASIE',
      contMEAF: 'MO·AF·OC',
      noRunsYet: 'Aucune partie jouée !',
      artTag4A: '4A · VILLE',
      artTag4B: '4B · VOL',
      ghostOn: '👻 ON',
      ghostOff: '👻 OFF',
      ghostLbl: '👻 RECORD',
      fmOn: '📻 FM ON',
      fmOff: '📻 FM',
      fmNowPlaying: '📻 RADIO LIVE : {name}',
      fmEnabledToast: '📻 RADIO LIVE ACTIVÉE ! Une station par ville !',
      fmDisabledToast: '🎵 Mode Synthwave 4D Restauré',
      blitzGatePrompt: '🧠 PORTE BLITZ : {clue}',
      blitzGateCorrect: '🧠 BLITZ EXACT ! +500 pts & NOVA 4D PLEINE !',
      blitzGateWrong: '🧠 RÉPONSE BLITZ : {city} !',
      liveWeatherSurge: '🌦️ MÉTÉO LIVE À {city} ({temp}°C) · SURGE 2X !',
      torchJackpotToast: '🔥 VILLE FLAMME 4D ! JACKPOT 3X !',
      cardChampToast: '👑 BONUS CHAMPION CARTE 4D (+15% SCORE) !',
      cityWarBanner: '⚔️ +{pts} PUISSANCE DE GUERRE POUR {city} !',
      dropFeedBtn: '🌐 PUBLIER LE DÉFI & RÉCLAMER +150 🪙 SUR REMO WORLD',
      dropFeedBtnLoggedIn: '📣 PUBLIER CE DÉFI DANS LE FIL REMO (+15 🪙)',
      feedChallengeDropped: '🚀 Défi publié sur le Fil REMO World !'
    }
  };

  function getInitialLang() {
    try {
      const p = new URLSearchParams(global.location.search || '');
      const ql = p.get('lang');
      if (ql === 'fr' || ql === 'en') return ql;
      const saved = localStorage.getItem(LANG_KEY);
      if (saved === 'fr' || saved === 'en') return saved;
    } catch (e) {}
    return 'en';
  }

  function tr(key, vars) {
    const lang = state.lang === 'fr' ? 'fr' : 'en';
    let s = (I18N[lang] && I18N[lang][key]) || I18N.en[key] || key;
    if (vars) {
      Object.keys(vars).forEach((k) => {
        s = s.replace(new RegExp(`\\{${k}\\}`, 'g'), String(vars[k]));
      });
    }
    return s;
  }

  /* ── Daily UTC Odyssey Route Generator (Wordle Style) ── */
  function getDailyInfo() {
    const now = new Date();
    const y = now.getUTCFullYear();
    const m = String(now.getUTCMonth() + 1).padStart(2, '0');
    const d = String(now.getUTCDate()).padStart(2, '0');
    const dateKey = `${y}-${m}-${d}`;
    const dayIdx = Math.floor(Date.UTC(y, now.getUTCMonth(), now.getUTCDate()) / 86400000);
    const num = Math.max(1, dayIdx - DAILY_EPOCH + 1);
    const rng = REMO_DATA.mulberry32('REMO_DAILY_' + dateKey);
    const pool = REMO_DATA.REMO_CITIES.slice();
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      const tmp = pool[i];
      pool[i] = pool[j];
      pool[j] = tmp;
    }
    return { dateKey, num, seed: 'DAILY_' + dateKey, route: pool.slice(0, 5) };
  }

  /* ── City Photo Preloader ── */
  const _cityPhotoCache = {};
  function getCityPhoto(cityId) {
    if (!cityId || typeof Image !== 'function') return null;
    if (!_cityPhotoCache[cityId]) {
      const img = new Image();
      const base = (typeof global.REMO_CITY_IMG_BASE === 'string' && global.REMO_CITY_IMG_BASE)
        ? global.REMO_CITY_IMG_BASE
        : 'assets/cities/';
      img.src = `${base}${cityId}.jpg`;
      _cityPhotoCache[cityId] = img;
    }
    const im = _cityPhotoCache[cityId];
    return (im && im.complete && im.naturalWidth > 0) ? im : null;
  }

  /* ── Persistent Save Data & Migration ── */
  function normalizeSave(raw) {
    const s = raw || {};
    if (!Array.isArray(s.unlockedCities)) s.unlockedCities = ['chisinau', 'bucharest', 'montreal'];
    if (!Array.isArray(s.history)) s.history = [];
    if (!Array.isArray(s.unlockedItems)) s.unlockedItems = ['aura_gold_fire', 'coin_gold'];
    if (!s.equippedAura) s.equippedAura = s.vipFrame || 'gold_fire';
    if (!s.vipFrame) s.vipFrame = s.equippedAura || 'gold_fire';
    if (!s.equippedHoverSkin) s.equippedHoverSkin = 'gold';
    if (!s.upgrades) s.upgrades = { blasterLv: 0, blinkLv: 0, shieldLv: 0 };
    if (!Array.isArray(s.relics)) s.relics = [];
    if (!s.cityBest) s.cityBest = {};
    if (!s.playerName) s.playerName = 'REMO_Explorer';
    if (!s.startCityId) s.startCityId = 'chisinau';
    if (typeof s.totalCoins !== 'number') s.totalCoins = 0;
    if (typeof s.totalKm !== 'number') s.totalKm = 0;
    if (typeof s.bestScore !== 'number') s.bestScore = 0;
    return s;
  }

  function loadSave() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return normalizeSave(JSON.parse(raw));
    } catch (e) {}
    return normalizeSave({});
  }

  function getMaxBlastCd() {
    const lv = (state.save && state.save.upgrades && state.save.upgrades.blasterLv) || 0;
    return [1.45, 1.15, 0.85, 0.60][Math.min(3, lv)];
  }

  function getMaxBlinkCd() {
    const lv = (state.save && state.save.upgrades && state.save.upgrades.blinkLv) || 0;
    return [6.0, 4.8, 3.6, 2.5][Math.min(3, lv)];
  }

  function getMagnetDuration() {
    const lv = (state.save && state.save.upgrades && state.save.upgrades.blinkLv) || 0;
    return 8.5 + lv * 2.0;
  }

  function writeSave(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {}
  }

  const _flagDataUriCache = {};
  function getFlagDataUri(city) {
    const iso = (city && city.countryIso) || 'MD';
    if (_flagDataUriCache[iso]) return _flagDataUriCache[iso];
    try {
      const c = document.createElement('canvas');
      c.width = 30;
      c.height = 20;
      const cx = c.getContext('2d');
      REMO_DATA.drawCountryFlag(cx, iso, 0, 0, 30, 20);
      const uri = c.toDataURL('image/png');
      _flagDataUriCache[iso] = uri;
      return uri;
    } catch (e) {
      return '';
    }
  }

  /* ── Game State ── */
  const state = {
    lang: getInitialLang(),
    gameMode: 'tour', // 'tour' | 'daily'
    menuTab: 'play',  // 'play' | 'shop'
    passportContinent: 'ALL',
    dailyInfo: null,
    phase: 'menu', // 'menu' | 'run' | 'fly' | 'landing' | 'paused' | 'gameover'
    prevPlayMode: 'run',
    save: loadSave(),
    seed: 'REMO2026',
    rng: Math.random,
    duelChallenge: null,

    time: 0,
    score: 0,
    coins: 0,
    kmFlown: 0,
    multiplier: 1,
    maxMult: 1,
    combo: 0,
    maxCombo: 1,
    feverActive: false,
    crystals: 3,
    novaCharge: 45,
    blastCooldown: 0,
    blinkCooldown: 0,
    speedMult: 1.0,
    surgeActive: false,
    dailyWon: false,
    heroElement: 'neon',
    visitedContinents: [],
    visitedElements: [],
    ascendedTimer: 0,
    ascendedAutoZapTimer: 0,
    autoZapBeams: [],
    chronoRiftTimer: 0,

    magnetTimer: 0,
    blitzTimer: 0,
    prismTimer: 0,

    startCityId: 'chisinau',
    currentCity: null,
    nextCity: null,
    routeIds: [],
    sectorProgress: 0,
    portalSpawned: false,
    safeGraceTimer: 0,
    legKm: 0,
    boss: null,
    bossTriggeredInSector: false,

    // Slow-Mo Compass Lock Landing
    compassLock: null, // { timer, maxTimer, needleAng, resolved, sweetMin, sweetMax }

    // V6: Blitz Sky-Gate Trivia (4B Flight), Live Weather, Live City FM, Torch & Host Bridge
    blitzGate: null,
    blitzGateSpawned: false,
    blitzGatesWon: 0,
    liveWeatherMap: {},
    cityFmEnabled: false,
    fmAudio: null,
    activeFmStation: '',
    torchCityId: '',
    torchActive: false,
    ownedCardCities: [],
    cardChampionBuff: false,
    hostContext: null,

    // Ghost Racer Recording & Playback
    ghostEnabled: true,
    ghostSamplesRec: [],
    ghostNextSampleT: 0,
    activeGhostTrack: null,

    hero: {
      x: 195,
      y: GROUND_Y,
      vy: 0,
      jumpsLeft: 2,
      runPhase: 0,
      morph: 0,
      slideTimer: 0,
      dashTimer: 0,
      invulnTimer: 0,
      onPlatform: false,
      targetFlyY: VH * 0.48
    },

    platforms: [],
    obstacles: [],
    projectiles: [],
    items: [],
    rings: [],
    particles: [],
    popups: [],
    stars: [],
    weatherDrops: [],
    trafficStreaks: [],
    spawnTimer: 0,
    ringTimer: 0,
    shakeTimer: 0,
    shakeAmt: 0,
    flashAlpha: 0,
    flashColor: '#38bdf8',
    toastText: '',
    toastTimer: 0,
    toastColor: '#fbbf24',

    keys: {},
    pointerActive: false,
    pointerY: VH * 0.48,
    touchStartY: null,
    lastSummary: null
  };

  let canvas, ctx, rafId = null, lastTs = 0;

  /* ── V6 REMO Ecosystem: Live Weather, Local Clock, City FM, Blitz Gate & Host Bridge ── */
  function getTorchCityId() {
    if (state.hostContext && state.hostContext.torchCityId) return state.hostContext.torchCityId;
    if (!state.dailyInfo) state.dailyInfo = getDailyInfo();
    const list = REMO_DATA.REMO_CITIES;
    return list[(state.dailyInfo.num * 7) % list.length].id;
  }

  function getEffectiveWeather(city) {
    if (!city) return { kind: 'stars', tempC: null, live: false };
    const lw = state.liveWeatherMap[city.id];
    if (lw && lw.kind) return lw;
    return { kind: city.weather || 'stars', tempC: null, live: false };
  }

  const _weatherFetchedIds = {};
  function fetchLiveCityWeather(city) {
    if (!city || _weatherFetchedIds[city.id] || typeof global.fetch !== 'function') return;
    _weatherFetchedIds[city.id] = true;
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(city.lat)}&longitude=${encodeURIComponent(city.lng)}&current=weather_code,temperature_2m`;
      global.fetch(url)
        .then((r) => (r && r.ok ? r.json() : null))
        .then((data) => {
          if (!data || !data.current) return;
          const code = Number(data.current.weather_code || 0);
          const tempC = Math.round(Number(data.current.temperature_2m));
          let kind = 'clear';
          if ((code >= 71 && code <= 77) || code === 85 || code === 86) kind = 'snow';
          else if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82) || code >= 95) kind = 'rain';
          state.liveWeatherMap[city.id] = { kind, tempC: Number.isNaN(tempC) ? null : tempC, live: true };
          if (state.currentCity && state.currentCity.id === city.id && (kind === 'rain' || kind === 'snow')) {
            state.surgeActive = true;
            if (state.phase === 'run') {
              showToast(tr('liveWeatherSurge', {
                city: REMO_DATA.getCityLabel(city, state.lang),
                temp: Number.isNaN(tempC) ? '--' : tempC
              }), '#38bdf8', 2.8);
            }
          }
        })
        .catch(() => {});
    } catch (e) {}
  }

  function postToHost(payload) {
    try {
      if (global.parent && global.parent !== global && typeof global.parent.postMessage === 'function') {
        global.parent.postMessage(payload, '*');
        return true;
      }
    } catch (e) {}
    return false;
  }

  function tuneCityFmForCity(city) {
    if (!state.cityFmEnabled || !city || !city.radio) return;
    state.activeFmStation = city.radio.name || city.code;
    const sentToHost = postToHost({
      type: 'REMO_GAME_TUNE_CITY_RADIO',
      cityId: city.id,
      stationId: city.radio.id,
      stationName: city.radio.name
    });
    if (sentToHost) {
      REMO_SFX.stopPulse();
      return;
    }
    if (typeof global.Audio !== 'function' || REMO_SFX.muted) return;
    try {
      if (!state.fmAudio) {
        state.fmAudio = new global.Audio();
        state.fmAudio.crossOrigin = 'anonymous';
        state.fmAudio.volume = 0.42;
      }
      const a = state.fmAudio;
      a.onerror = () => {
        if (city.radio.fallback && a.src !== city.radio.fallback) {
          a.src = city.radio.fallback;
          a.play().catch(() => {
            if (state.phase === 'run' || state.phase === 'fly') REMO_SFX.startPulse(getAudioContextState);
          });
        } else if (state.phase === 'run' || state.phase === 'fly') {
          REMO_SFX.startPulse(getAudioContextState);
        }
      };
      if (a.src !== city.radio.url) a.src = city.radio.url;
      REMO_SFX.stopPulse();
      const p = a.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => {
          if (state.phase === 'run' || state.phase === 'fly') REMO_SFX.startPulse(getAudioContextState);
        });
      }
    } catch (e) {}
  }

  function stopCityFm() {
    state.activeFmStation = '';
    postToHost({ type: 'REMO_GAME_STOP_CITY_RADIO' });
    if (state.fmAudio) {
      try { state.fmAudio.pause(); } catch (e) {}
    }
  }

  function toggleCityFm() {
    state.cityFmEnabled = !state.cityFmEnabled;
    state.save.cityFmEnabled = state.cityFmEnabled;
    writeSave(state.save);
    const btn = document.getElementById('btnCityFmToggle');
    if (btn) {
      btn.textContent = state.cityFmEnabled ? tr('fmOn') : tr('fmOff');
      btn.classList.toggle('fm-on', state.cityFmEnabled);
    }
    if (state.cityFmEnabled) {
      showToast(tr('fmEnabledToast'), '#fde047', 2.4);
      if (state.phase === 'run' || state.phase === 'fly') {
        tuneCityFmForCity(state.phase === 'fly' ? (state.nextCity || state.currentCity) : state.currentCity);
      }
    } else {
      stopCityFm();
      showToast(tr('fmDisabledToast'), '#7dd3fc', 1.8);
      if (!REMO_SFX.muted && (state.phase === 'run' || state.phase === 'fly')) {
        REMO_SFX.startPulse(getAudioContextState);
      }
    }
  }

  function spawnBlitzSkyGate() {
    if (!state.nextCity) return;
    state.blitzGateSpawned = true;
    state.obstacles = state.obstacles.filter((o) => o.x < VW - 160);
    const correctCity = state.nextCity;
    const decoys = pickTwoDistinctCities(correctCity.id);
    const decoyCity = decoys.find((c) => !state.currentCity || c.id !== state.currentCity.id) || decoys[0];
    const correctIsTop = state.rng() > 0.5;
    state.blitzGate = {
      x: VW + 170,
      clue: REMO_DATA.getCityTagline(correctCity, state.lang),
      correctIsTop,
      topCity: correctIsTop ? correctCity : decoyCity,
      bottomCity: correctIsTop ? decoyCity : correctCity,
      resolved: false
    };
  }

  function resolveBlitzSkyGate(pickedTop) {
    const g = state.blitzGate;
    if (!g || g.resolved) return;
    g.resolved = true;
    const ok = Boolean(pickedTop) === Boolean(g.correctIsTop);
    state.blitzGate = null;
    if (ok) {
      state.blitzGatesWon++;
      const pts = addScore(500);
      state.coins += state.chronoRiftTimer > 0 ? 30 : 10;
      state.novaCharge = 100;
      state.sectorProgress = Math.min(0.95, state.sectorProgress + 0.12);
      state.flashAlpha = 0.65;
      state.flashColor = '#10b981';
      REMO_SFX.perfectLock();
      emitParticles(state.hero.x + 20, state.hero.y - 30, '#10b981', 28, 280);
      emitParticles(state.hero.x + 20, state.hero.y - 30, '#fde047', 24, 240);
      addPopup(state.hero.x + 30, state.hero.y - 75, `🧠 +${pts} NOVA!`, '#6ee7b7', 21);
      showToast(tr('blitzGateCorrect'), '#6ee7b7', 2.4);
    } else {
      REMO_SFX.dash();
      emitParticles(state.hero.x, state.hero.y - 30, '#a855f7', 16, 180);
      showToast(tr('blitzGateWrong', { city: REMO_DATA.getCityLabel(state.nextCity, state.lang) }), '#c084fc', 2.1);
    }
  }

  function applyHostContext(ctxData) {
    if (!ctxData || typeof ctxData !== 'object') return;
    state.hostContext = ctxData;
    if (ctxData.lang === 'en' || ctxData.lang === 'fr') setLanguage(ctxData.lang);
    if (ctxData.playerName) {
      state.save.playerName = String(ctxData.playerName).slice(0, 20);
      const inp = document.getElementById('playerNickInput');
      if (inp) inp.value = state.save.playerName;
    }
    if (Array.isArray(ctxData.ownedCardCities)) {
      state.ownedCardCities = ctxData.ownedCardCities.slice();
    }
    if (ctxData.torchCityId) {
      state.torchCityId = ctxData.torchCityId;
    }
    if (ctxData.weatherMap && typeof ctxData.weatherMap === 'object') {
      Object.assign(state.liveWeatherMap, ctxData.weatherMap);
    }
    if (!state.duelChallenge && ctxData.homeCityId && REMO_DATA.REMO_CITIES.some((c) => c.id === ctxData.homeCityId)) {
      state.save.startCityId = ctxData.homeCityId;
    }
    const badge2x = document.getElementById('hudEvent2xBadge');
    if (badge2x) {
      badge2x.style.display = (ctxData.odyssey2x || ctxData.happyHour2x) ? 'inline-flex' : 'none';
    }
    writeSave(state.save);
    renderCityPicker();
  }

  function dropChallengeToRemoWorld() {
    if (!state.lastSummary) return;
    const shareUrl = REMO_SHARE.buildPublicShareUrl(state.lastSummary);
    const posted = postToHost({
      type: 'REMO_ODYSSEY_DROP_FEED_CHALLENGE',
      summary: state.lastSummary,
      url: shareUrl
    });
    if (posted) {
      const toast = document.getElementById('duelCopiedMsg');
      if (toast) {
        toast.textContent = tr('feedChallengeDropped');
        toast.style.opacity = '1';
        setTimeout(() => { toast.style.opacity = '0'; }, 2800);
      }
      return;
    }
    copyTextWithFallback(shareUrl);
    try {
      const target = `https://remoworld.com/?open=odyssey&seed=${encodeURIComponent(state.lastSummary.seed || 'REMO2026')}&start=${encodeURIComponent(state.lastSummary.startCityId || 'chisinau')}&target=${encodeURIComponent(state.lastSummary.score)}&vs=${encodeURIComponent(state.lastSummary.playerName)}`;
      if (typeof global.open === 'function') global.open(target, '_blank', 'noopener');
    } catch (e) {}
  }

  function initBackdropEntities() {
    state.stars = [];
    for (let i = 0; i < 95; i++) {
      state.stars.push({
        x: Math.random() * VW,
        y: Math.random() * (GROUND_Y - 120),
        r: 0.6 + Math.random() * 1.8,
        speed: 6 + Math.random() * 20,
        tw: Math.random() * Math.PI * 2
      });
    }
    state.weatherDrops = [];
    for (let i = 0; i < 54; i++) {
      state.weatherDrops.push({
        x: Math.random() * VW,
        y: Math.random() * VH,
        len: 9 + Math.random() * 14,
        spd: 260 + Math.random() * 240
      });
    }
    state.trafficStreaks = [];
    for (let i = 0; i < 10; i++) {
      state.trafficStreaks.push({
        x: Math.random() * VW,
        y: 230 + Math.random() * 165,
        len: 28 + Math.random() * 55,
        spd: 150 + Math.random() * 220,
        col: i % 2 === 0 ? '#38bdf8' : '#ec4899'
      });
    }
  }

  function showToast(text, color = '#fbbf24', dur = 2.4) {
    state.toastText = text;
    state.toastColor = color;
    state.toastTimer = dur;
  }

  function addPopup(x, y, text, color = '#fde047', size = 16) {
    state.popups.push({ x, y, text, color, size, life: 1.0, vy: -58 });
  }

  function emitParticles(x, y, color, count = 14, speed = 190) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = (0.3 + Math.random() * 0.9) * speed;
      state.particles.push({
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        r: 2 + Math.random() * 3.8,
        color,
        life: 0.5 + Math.random() * 0.45,
        maxLife: 1
      });
    }
  }

  function pickTwoDistinctCities(excludeId) {
    const pool = REMO_DATA.REMO_CITIES.filter((c) => c.id !== excludeId);
    const i1 = Math.floor(state.rng() * pool.length);
    const c1 = pool[i1] || REMO_DATA.REMO_CITIES[0];
    const pool2 = pool.filter((c) => c.id !== c1.id);
    const i2 = Math.floor(state.rng() * pool2.length);
    const c2 = pool2[i2] || c1;
    return [c1, c2];
  }

  /* ── Start Odyssey (Tour or Daily Global Odyssey) ── */
  function startRun(customCityId) {
    REMO_SFX.unlock();
    state.dailyInfo = getDailyInfo();
    const isDaily = state.gameMode === 'daily';

    const urlParams = new URLSearchParams(global.location.search || '');
    const duelSeed = state.duelChallenge ? state.duelChallenge.seed : urlParams.get('seed');
    const seedStr = isDaily
      ? state.dailyInfo.seed
      : (duelSeed || ('REMO_' + Date.now().toString(36) + '_' + Math.floor(Math.random() * 9999)));

    state.seed = seedStr;
    state.rng = REMO_DATA.mulberry32(seedStr);

    let startCity;
    if (isDaily) {
      startCity = state.dailyInfo.route[0];
      state.nextCity = state.dailyInfo.route[1];
    } else {
      const chosenId = customCityId || state.save.startCityId || 'chisinau';
      state.save.startCityId = chosenId;
      writeSave(state.save);
      startCity = REMO_DATA.getCityById(chosenId);
      state.nextCity = pickTwoDistinctCities(startCity.id)[0];
    }

    state.startCityId = startCity.id;
    state.currentCity = startCity;
    getCityPhoto(startCity.id);
    getCityPhoto(state.nextCity.id);

    state.routeIds = [startCity.id];
    state.legKm = REMO_DATA.haversineKm(startCity.lat, startCity.lng, state.nextCity.lat, state.nextCity.lng);

    state.phase = 'run';
    state.time = 0;
    state.score = 0;
    state.coins = 0;
    state.kmFlown = 0;
    state.multiplier = 1;
    state.maxMult = 1;
    state.combo = 0;
    state.maxCombo = 1;
    state.feverActive = false;
    state.crystals = (state.save.upgrades && state.save.upgrades.shieldLv > 0) ? 4 : 3;
    state.novaCharge = 45;
    state.blastCooldown = 0;
    state.blinkCooldown = 0;
    state.speedMult = 1.0;
    const startW = getEffectiveWeather(startCity);
    state.surgeActive = startW.kind === 'rain' || startW.kind === 'snow' || (!isDaily && state.rng() > 0.65);
    state.dailyWon = false;
    state.heroElement = startCity.element || 'neon';
    state.visitedContinents = [startCity.continent || 'Europe'];
    state.visitedElements = [startCity.element || 'neon'];
    state.ascendedTimer = 0;
    state.ascendedAutoZapTimer = 0;
    state.autoZapBeams = [];
    state.chronoRiftTimer = 0;
    state.blitzGate = null;
    state.blitzGateSpawned = false;
    state.blitzGatesWon = 0;
    state.torchCityId = getTorchCityId();
    state.torchActive = startCity.id === state.torchCityId;
    state.cardChampionBuff = state.ownedCardCities.includes(startCity.id) || (state.save.relics || []).includes(startCity.id);
    fetchLiveCityWeather(startCity);
    fetchLiveCityWeather(state.nextCity);
    state.magnetTimer = 0;
    state.blitzTimer = 0;
    state.prismTimer = 0;
    state.sectorProgress = 0;
    state.portalSpawned = false;
    state.bossTriggeredInSector = false;
    state.boss = null;
    state.compassLock = null;
    state.safeGraceTimer = 1.0;

    // Ghost Racer setup
    state.ghostSamplesRec = [];
    state.ghostNextSampleT = 0;
    state.ghostEnabled = state.save.ghostEnabled !== false;
    state.activeGhostTrack = isDaily
      ? (state.save.dailyBestDate === state.dailyInfo.dateKey ? state.save.dailyBestGhost : null)
      : state.save.bestGhost;

    state.hero = {
      x: 195,
      y: GROUND_Y,
      vy: 0,
      jumpsLeft: 2,
      runPhase: 0,
      morph: 0,
      slideTimer: 0,
      dashTimer: 0,
      blinkTimer: 0,
      invulnTimer: 0,
      onPlatform: false,
      targetFlyY: VH * 0.48
    };

    state.platforms = [];
    state.obstacles = [];
    state.projectiles = [];
    state.items = [];
    state.rings = [];
    state.particles = [];
    state.popups = [];
    state.spawnTimer = 0.85;
    state.ringTimer = 0.9;
    state.shakeTimer = 0;
    state.flashAlpha = 0.35;
    state.flashColor = startCity.themeColor;

    if (state.torchActive) {
      showToast(tr('torchJackpotToast'), '#fbbf24', 2.8);
    } else if (state.cardChampionBuff) {
      showToast(tr('cardChampToast'), '#fde047', 2.4);
    } else if (state.surgeActive) {
      showToast(tr('surgeToast'), '#fde047', 2.4);
    } else {
      showToast(`${REMO_DATA.getCityLabel(startCity, state.lang).toUpperCase()} · ${tr('cityModeTag')}`, startCity.themeColor, 2.2);
    }

    syncOverlays();
    if (state.cityFmEnabled) {
      tuneCityFmForCity(startCity);
    } else {
      REMO_SFX.startPulse(getAudioContextState);
    }
  }

  /* ── Player Controls & Active Combat ── */
  function actionJump() {
    if (state.phase === 'menu' || state.phase === 'gameover') return;
    if (state.phase === 'paused') { togglePause(); return; }
    if (state.phase === 'landing') {
      resolveCompassLock(true);
      return;
    }
    REMO_SFX.unlock();

    if (state.phase === 'fly') {
      state.hero.targetFlyY = Math.max(78, state.hero.targetFlyY - 70);
      emitParticles(state.hero.x - 10, state.hero.y + 8, '#38bdf8', 5, 90);
      return;
    }

    if (state.hero.jumpsLeft > 0) {
      const isDouble = state.hero.jumpsLeft === 1 && state.hero.y < GROUND_Y - 4 && !state.hero.onPlatform;
      state.hero.vy = isDouble ? -645 : -695;
      state.hero.jumpsLeft--;
      state.hero.onPlatform = false;
      state.hero.slideTimer = 0;
      REMO_SFX.jump(isDouble);
      emitParticles(state.hero.x, state.hero.y + 2, isDouble ? '#a855f7' : '#38bdf8', isDouble ? 16 : 10, 150);
    }
  }

  function actionDashOrSlide() {
    if (state.phase === 'landing') {
      resolveCompassLock(true);
      return;
    }
    if (state.phase !== 'run' && state.phase !== 'fly') return;
    REMO_SFX.unlock();

    if (state.phase === 'fly') {
      state.hero.targetFlyY = Math.min(VH - 64, state.hero.targetFlyY + 72);
      return;
    }

    if (state.hero.y < GROUND_Y - 12 && !state.hero.onPlatform) {
      state.hero.vy = Math.max(state.hero.vy, 790);
      state.hero.dashTimer = 0.35;
      REMO_SFX.dash();
      emitParticles(state.hero.x, state.hero.y - 30, '#fbbf24', 12, 160);
    } else {
      state.hero.slideTimer = 0.58;
      state.hero.dashTimer = 0.48;
      REMO_SFX.dash();
      emitParticles(state.hero.x - 16, state.hero.y - 8, '#38bdf8', 14, 170);
    }
  }

  function actionBlink() {
    if (state.phase === 'landing') {
      resolveCompassLock(true);
      return;
    }
    if (state.phase !== 'run' && state.phase !== 'fly') return;
    if (state.blinkCooldown > 0) return;
    REMO_SFX.unlock();

    state.blinkCooldown = getMaxBlinkCd();
    state.hero.blinkTimer = 0.50;
    state.hero.invulnTimer = Math.max(state.hero.invulnTimer, 0.55);
    state.hero.dashTimer = Math.max(state.hero.dashTimer, 0.36);
    REMO_SFX.blink();
    emitParticles(state.hero.x, state.hero.y - 45, '#38bdf8', 18, 220);
    emitParticles(state.hero.x, state.hero.y - 45, '#a855f7', 14, 180);
    showToast(tr('blinkToast'), '#7dd3fc', 1.4);
  }

  function actionBlast() {
    if (state.phase !== 'run' && state.phase !== 'fly') return;
    if (state.blastCooldown > 0) return;
    REMO_SFX.unlock();

    const isCrit = Boolean(
      state.boss &&
      state.boss.active &&
      REMO_DATA.REMO_ELEMENTS[state.heroElement] &&
      REMO_DATA.REMO_ELEMENTS[state.heroElement].beats === state.boss.element
    );
    state.blastCooldown = getMaxBlastCd();
    REMO_SFX.blast(isCrit);
    const py = state.hero.y - (state.hero.slideTimer > 0 ? 32 : 54);
    const elObj = REMO_DATA.REMO_ELEMENTS[state.heroElement] || REMO_DATA.REMO_ELEMENTS.neon;
    state.projectiles.push({
      x: state.hero.x + 52,
      y: py,
      vx: 980,
      r: isCrit ? 22 : 18,
      life: 1.2,
      element: state.heroElement,
      color: elObj.color,
      dmg: isCrit ? 2 : 1,
      isCrit
    });
    emitParticles(state.hero.x + 48, py, '#fbbf24', 8, 150);
    emitParticles(state.hero.x + 48, py, elObj.color || '#38bdf8', 8, 150);
  }

  function actionNova() {
    if (state.phase !== 'run' && state.phase !== 'fly') return;
    if (state.novaCharge < 100) return;
    REMO_SFX.unlock();

    state.novaCharge = 0;
    state.flashAlpha = 0.72;
    state.flashColor = '#fbbf24';
    state.shakeTimer = 0.36;
    state.shakeAmt = 11;
    REMO_SFX.nova();
    showToast(tr('novaToast'), '#fde047', 2.0);
    emitParticles(state.hero.x, state.hero.y - 38, '#fbbf24', 36, 360);
    emitParticles(state.hero.x, state.hero.y - 38, '#38bdf8', 24, 300);

    let cleared = 0;
    state.obstacles.forEach((o) => {
      cleared++;
      emitParticles(o.x, o.y, '#a855f7', 12, 210);
      addPopup(o.x, o.y - 20, '+50 ⚡', '#7dd3fc', 15);
    });
    state.obstacles = [];
    if (cleared > 0) addScore(cleared * 50);

    if (state.boss && state.boss.active) {
      damageBoss(3, false);
    }

    state.items.forEach((it) => {
      if (it.kind !== 'portal_high' && it.kind !== 'portal_low') it.magnet = true;
    });
  }

  function togglePause() {
    if (state.phase === 'run' || state.phase === 'fly') {
      state.prevPlayMode = state.phase;
      state.phase = 'paused';
    } else if (state.phase === 'paused') {
      state.phase = state.prevPlayMode || 'run';
    }
    syncOverlays();
  }

  function activateChronoRift(dur = 10.0) {
    state.chronoRiftTimer = Math.max(state.chronoRiftTimer, dur);
    state.flashAlpha = 0.55;
    state.flashColor = '#a855f7';
    REMO_SFX.ascended();
    showToast(tr('chronoToast'), '#e879f9', 2.8);
  }

  function registerCityResonance(city) {
    if (!city) return;
    const prevContBuckets = Math.floor(state.visitedContinents.length / 3);
    const prevElBuckets = Math.floor(state.visitedElements.length / 3);
    if (city.continent && !state.visitedContinents.includes(city.continent)) {
      state.visitedContinents.push(city.continent);
    }
    if (city.element && !state.visitedElements.includes(city.element)) {
      state.visitedElements.push(city.element);
    }
    const nowContBuckets = Math.floor(state.visitedContinents.length / 3);
    const nowElBuckets = Math.floor(state.visitedElements.length / 3);
    if (nowContBuckets > prevContBuckets || nowElBuckets > prevElBuckets) {
      state.ascendedTimer = Math.max(state.ascendedTimer, 10.0);
      REMO_SFX.ascended();
      emitParticles(state.hero.x, state.hero.y - 50, '#fbbf24', 30, 280);
      showToast(tr('ascendedToast'), '#fde047', 2.8);
    }
  }

  function addScore(basePts) {
    const surgeBoost = state.surgeActive ? 2 : 1;
    const prismBoost = state.prismTimer > 0 ? 2 : 1;
    const feverBoost = state.feverActive ? 1.5 : 1;
    const chronoBoost = state.chronoRiftTimer > 0 ? 3 : 1;
    const torchBoost = state.torchActive ? 3 : 1;
    const cardBoost = state.cardChampionBuff ? 1.15 : 1;
    const pts = Math.round(basePts * state.multiplier * surgeBoost * prismBoost * feverBoost * chronoBoost * torchBoost * cardBoost);
    state.score += pts;
    if (typeof global.remoSubmitScore === 'function') {
      try { global.remoSubmitScore(state.score); } catch (e) {}
    }
    return pts;
  }

  function triggerGeoVaultChest(x, y) {
    state.coins += state.chronoRiftTimer > 0 ? 30 : 10;
    state.novaCharge = Math.min(100, state.novaCharge + 25);
    const pts = addScore(150);
    const roll = state.rng();
    if (roll < 0.30) state.magnetTimer = Math.max(state.magnetTimer, getMagnetDuration());
    else if (roll < 0.58) state.blitzTimer = Math.max(state.blitzTimer, 5.5);
    else if (roll < 0.85) state.prismTimer = Math.max(state.prismTimer, 10.0);
    else activateChronoRift(9.0);

    REMO_SFX.chest();
    emitParticles(x, y, '#fbbf24', 28, 280);
    emitParticles(x, y, '#38bdf8', 22, 240);
    addPopup(x, y - 28, `🎁 +10 🪙 +${pts}`, '#fde047', 19);
    showToast(tr('geovaultToast'), '#fde047', 2.4);
  }

  /* ── Spawning: Obstacles, GeoVault Chests, Dual Portals, Boss ── */
  function spawnPowerUp(x, y) {
    const kinds = ['power_magnet', 'power_blitz', 'power_prism'];
    const kind = kinds[Math.floor(state.rng() * kinds.length)];
    state.items.push({ kind, x, y, r: 17 });
  }

  function spawnRunPattern() {
    const r = state.rng();

    if (r < 0.16) {
      state.obstacles.push({ kind: 'laser_low', x: VW + 50, y: GROUND_Y, w: 48, h: 58, breakable: false });
      for (let i = -2; i <= 2; i++) {
        state.items.push({ kind: 'coin', x: VW + 74 + i * 38, y: GROUND_Y - 128 + Math.abs(i) * 18, r: 13 });
      }
    } else if (r < 0.31) {
      state.obstacles.push({ kind: 'laser_high', x: VW + 55, y: GROUND_Y - 56, w: 72, h: 44, breakable: false });
      for (let i = 0; i < 3; i++) {
        state.items.push({ kind: 'coin', x: VW + 50 + i * 44, y: GROUND_Y - 24, r: 13 });
      }
    } else if (r < 0.44) {
      state.obstacles.push({ kind: 'prism_gate', x: VW + 50, y: GROUND_Y, w: 38, h: 80, breakable: true });
      state.items.push({ kind: 'coin', x: VW + 135, y: GROUND_Y - 32, r: 13 });
    } else if (r < 0.58) {
      state.obstacles.push({ kind: 'drone', x: VW + 60, y: GROUND_Y - 76, w: 64, h: 34, bob: state.rng() * 6.28 });
      for (let i = 0; i < 3; i++) {
        state.items.push({ kind: 'coin', x: VW + 48 + i * 44, y: GROUND_Y - 24, r: 13 });
      }
    } else if (r < 0.71) {
      state.obstacles.push({ kind: 'speeder', x: VW + 140, y: GROUND_Y - 6, w: 94, h: 42, speedExtra: 185 });
      for (let i = -1; i <= 1; i++) {
        state.items.push({ kind: 'coin', x: VW + 95 + i * 42, y: GROUND_Y - 122, r: 13 });
      }
    } else if (r < 0.82) {
      const dropX = VW - 160;
      state.obstacles.push({
        kind: 'meteor',
        x: VW + 140,
        y: -50,
        targetX: dropX,
        targetY: GROUND_Y,
        r: 22,
        warnTimer: 0.95,
        impacted: false
      });
      state.obstacles.push({ kind: 'spike_double', x: VW + 45, y: GROUND_Y, w: 68, h: 48, breakable: false });
    } else {
      const pW = 240 + state.rng() * 80;
      const pY = GROUND_Y - 118;
      const hasPad = state.rng() > 0.45;
      state.platforms.push({ x: VW + 50, y: pY, w: pW, h: 16, hasLaunchPad: hasPad });
      state.obstacles.push({ kind: 'spike_double', x: VW + 135, y: GROUND_Y, w: 64, h: 48, breakable: false });
      for (let i = 0; i < 4; i++) {
        state.items.push({ kind: 'coin', x: VW + 80 + i * 42, y: pY - 30, r: 13 });
      }
      if (hasPad) {
        for (let i = 0; i < 5; i++) {
          state.items.push({ kind: 'coin', x: VW + 50 + pW + 30 + i * 46, y: pY - 110 + Math.abs(i - 2) * 20, r: 13 });
        }
      }
      // Spawn GeoVault Chest or PowerUp on Sky-Bridge!
      if (state.rng() > 0.62) {
        state.items.push({ kind: 'geovault', x: VW + 50 + pW * 0.55, y: pY - 26, r: 22 });
      } else if (state.rng() > 0.45) {
        spawnPowerUp(VW + 50 + pW * 0.5, pY - 70);
      }
    }

    if (state.rng() > 0.72) {
      if (state.crystals < 4) {
        state.items.push({ kind: 'crystal', x: VW + 235, y: GROUND_Y - 130 - state.rng() * 45, r: 15, cIdx: Math.floor(state.rng() * 4) });
      } else {
        spawnPowerUp(VW + 235, GROUND_Y - 125);
      }
    }

    state.spawnTimer = Math.max(0.75, 1.32 - state.routeIds.length * 0.04) * (0.86 + state.rng() * 0.28);
  }

  function spawnBossSentinel() {
    const curCity = state.currentCity || REMO_DATA.getCityById(state.startCityId);
    const el = curCity ? curCity.element : 'void';
    const maxHp = 4 + Math.min(4, Math.floor(state.routeIds.length / 2));
    state.boss = {
      active: true,
      element: el,
      variant: el,
      name: tr('bossName_' + el),
      x: VW + 120,
      targetX: VW - 145,
      y: GROUND_Y - 125,
      timer: 11.5,
      fireTimer: 1.15,
      beamTimer: 2.8,
      beamWarn: 0,
      beamActive: 0,
      beamY: GROUND_Y - 40,
      hp: maxHp,
      maxHp,
      hitFlash: 0
    };
    showToast(tr('bossWarning', { name: state.boss.name, hp: maxHp }), '#c084fc', 2.8);
    REMO_SFX.hit(true);
  }

  function damageBoss(dmg = 1, isCrit = false) {
    if (!state.boss || !state.boss.active) return;
    state.boss.hp = Math.max(0, state.boss.hp - dmg);
    state.boss.hitFlash = 0.18;
    state.shakeTimer = 0.14;
    state.shakeAmt = isCrit ? 8 : 5;
    emitParticles(state.boss.x, state.boss.y, isCrit ? '#38bdf8' : '#fde047', isCrit ? 24 : 16, 230);
    addPopup(state.boss.x, state.boss.y - 45, isCrit ? `⚡-${dmg} CRIT!` : `-${dmg} HP 🔥`, isCrit ? '#38bdf8' : '#fbbf24', isCrit ? 19 : 16);
    if (isCrit) showToast(tr('critToast'), '#38bdf8', 1.2);
    if (state.boss.hp <= 0) {
      defeatBoss();
    } else {
      REMO_SFX.hit(true);
    }
  }

  function defeatBoss() {
    if (!state.boss || !state.boss.active) return;
    const bossName = state.boss.name || tr('bossName_void');
    state.boss.active = false;
    const pts = addScore(400);
    state.coins += 12;

    const cur = state.currentCity;
    if (cur && !state.save.relics.includes(cur.id)) {
      state.save.relics.push(cur.id);
      writeSave(state.save);
      addPopup(state.boss.x, state.boss.y - 68, tr('relicToast', { code: cur.code }), '#fbbf24', 15);
    }

    REMO_SFX.crystal();
    emitParticles(state.boss.x, state.boss.y, '#c084fc', 36, 320);
    emitParticles(state.boss.x, state.boss.y, '#fbbf24', 24, 260);
    addPopup(state.boss.x, state.boss.y - 30, `BOSS +${pts}`, '#fde047', 22);
    showToast(tr('bossDefeated', { name: bossName }), '#6ee7b7', 2.4);
    state.boss = null;
  }

  function spawnDualPortals() {
    state.portalSpawned = true;
    state.obstacles = state.obstacles.filter((o) => o.x < VW - 180);

    let cityHigh, cityLow;
    if (state.gameMode === 'daily' && state.dailyInfo) {
      const nextDaily = state.dailyInfo.route[state.routeIds.length];
      cityHigh = nextDaily || state.nextCity;
      cityLow = nextDaily || state.nextCity;
    } else {
      [cityHigh, cityLow] = pickTwoDistinctCities(state.currentCity.id);
    }
    getCityPhoto(cityHigh.id);
    getCityPhoto(cityLow.id);

    // Also spawn a Cyber Sky-Bridge ramp leading up to High Portal so players can easily jump up!
    state.platforms.push({ x: VW - 60, y: GROUND_Y - 118, w: 170, h: 16, hasLaunchPad: false });

    state.items.push({
      kind: 'portal_high',
      x: VW + 120,
      y: GROUND_Y - 210,
      r: 44,
      targetCity: cityHigh,
      perk: 'surge'
    });
    state.items.push({
      kind: 'portal_low',
      x: VW + 120,
      y: GROUND_Y - 72,
      r: 44,
      targetCity: cityLow,
      perk: 'shield'
    });
  }

  function spawnFlyPattern() {
    const pattern = state.rng();
    const laneY = 110 + state.rng() * (VH - 240);

    if (pattern < 0.50) {
      state.rings.push({
        x: VW + 70,
        y: laneY,
        rx: 22,
        ry: 58,
        passed: false,
        color: state.nextCity ? state.nextCity.themeColor : '#38bdf8'
      });
      for (let i = -1; i <= 2; i++) {
        state.items.push({ kind: 'coin', x: VW + 70 + i * 44, y: laneY + Math.sin(i * 0.7) * 16, r: 13 });
      }
    } else if (pattern < 0.78) {
      for (let i = 0; i < 6; i++) {
        state.items.push({ kind: 'coin', x: VW + 40 + i * 44, y: laneY + Math.sin(i * 0.85) * 46, r: 13 });
      }
      if (state.rng() > 0.6) spawnPowerUp(VW + 170, laneY);
    } else {
      state.rings.push({
        x: VW + 70,
        y: laneY,
        rx: 24,
        ry: 60,
        passed: false,
        isTurbo: true,
        color: '#fde047'
      });
      spawnPowerUp(VW + 70, laneY);
    }

    const hazRoll = state.rng();
    const hazY = laneY > VH * 0.5 ? 105 + state.rng() * 130 : VH - 105 - state.rng() * 130;
    if (hazRoll < 0.45) {
      state.obstacles.push({ kind: 'void_mine', x: VW + 95 + state.rng() * 75, y: hazY, r: 22, pulse: state.rng() * 6.28 });
    } else if (hazRoll < 0.75) {
      state.obstacles.push({ kind: 'pinwheel', x: VW + 115, y: hazY, r: 42, angle: state.rng() * Math.PI });
    } else {
      state.obstacles.push({ kind: 'storm_cloud', x: VW + 90, y: hazY - 18, w: 120, h: 38 });
    }

    state.ringTimer = Math.max(0.75, 1.10 - state.routeIds.length * 0.03);
  }

  /* ── Portal Warp 4A -> 4B & Compass Lock Landing 4B -> 4A ── */
  function enterSkyFlightMode(chosenPortal) {
    if (chosenPortal && chosenPortal.targetCity) {
      state.nextCity = chosenPortal.targetCity;
      state.heroElement = chosenPortal.targetCity.element || state.heroElement;
      state.legKm = REMO_DATA.haversineKm(state.currentCity.lat, state.currentCity.lng, state.nextCity.lat, state.nextCity.lng);
      if (chosenPortal.perk === 'surge') {
        state.surgeActive = true;
        showToast(tr('surgeToast'), '#fde047', 2.2);
      } else if (chosenPortal.perk === 'shield') {
        if (state.crystals < 4) {
          state.crystals++;
          showToast(tr('shieldGained'), '#6ee7b7', 2.2);
        } else {
          addScore(150);
        }
      }
    }

    state.phase = 'fly';
    state.sectorProgress = 0;
    state.portalSpawned = false;
    state.blitzGate = null;
    state.blitzGateSpawned = false;
    state.platforms = [];
    state.obstacles = [];
    state.projectiles = [];
    state.items = [];
    state.rings = [];
    state.boss = null;
    fetchLiveCityWeather(state.nextCity);
    state.hero.y = Math.min(VH * 0.55, state.hero.y);
    state.hero.targetFlyY = VH * 0.46;
    state.hero.vy = 0;
    state.hero.slideTimer = 0;
    state.hero.dashTimer = 0;
    state.hero.onPlatform = false;
    state.flashAlpha = 0.72;
    state.flashColor = '#38bdf8';
    state.shakeTimer = 0.25;
    state.shakeAmt = 6;
    state.ringTimer = 0.4;

    getCityPhoto(state.nextCity.id);
    REMO_SFX.portalWarp();
    emitParticles(state.hero.x, state.hero.y - 35, '#fbbf24', 28, 280);
    emitParticles(state.hero.x, state.hero.y - 35, '#38bdf8', 24, 240);

    showToast(tr('portalToast', { code: state.nextCity.code, km: state.legKm.toLocaleString() }), '#38bdf8', 2.6);
  }

  function startCompassLockLanding() {
    state.phase = 'landing';
    state.compassLock = {
      timer: 1.85,
      maxTimer: 1.85,
      needleAng: -1.4,
      resolved: false,
      sweetMin: -0.38,
      sweetMax: 0.38
    };
    showToast(tr('compassPrompt'), '#fde047', 1.8);
  }

  function resolveCompassLock(userTriggered) {
    if (state.phase !== 'landing' || !state.compassLock || state.compassLock.resolved) return;
    state.compassLock.resolved = true;
    const ang = state.compassLock.needleAng;
    const isPerfect = userTriggered && ang >= state.compassLock.sweetMin && ang <= state.compassLock.sweetMax;
    state.compassLock = null;
    landInNextCity(isPerfect);
  }

  function landInNextCity(perfectLock = false) {
    const arrived = state.nextCity;
    state.currentCity = arrived;
    state.routeIds.push(arrived.id);
    state.kmFlown += state.legKm;

    if (!state.save.unlockedCities.includes(arrived.id)) {
      state.save.unlockedCities.push(arrived.id);
    }
    registerCityResonance(arrived);

    const pts = addScore(perfectLock ? 600 : 250);
    state.coins += (perfectLock ? 18 : 10) * (state.chronoRiftTimer > 0 ? 3 : 1);

    if (perfectLock) {
      REMO_SFX.perfectLock();
      state.hero.invulnTimer = 2.6;
      state.flashAlpha = 0.8;
      state.flashColor = '#fde047';
      showToast(tr('compassPerfect'), '#6ee7b7', 2.6);
    } else {
      REMO_SFX.landCity();
      showToast(tr('landedToast', { city: REMO_DATA.getCityLabel(arrived, state.lang), pts }), arrived.themeColor, 2.4);
    }

    // Every 3rd city triggers a 4D Chrono-Rift Gravity & 3X Coins Window!
    if (state.routeIds.length % 3 === 0) {
      activateChronoRift(10.0);
    }

    // Check Daily Global Odyssey 5-City Victory!
    if (state.gameMode === 'daily' && state.dailyInfo && state.routeIds.length >= 5) {
      addScore(1500);
      state.dailyWon = true;
      endRun(true);
      return;
    }

    if (state.gameMode === 'daily' && state.dailyInfo) {
      state.nextCity = state.dailyInfo.route[state.routeIds.length] || arrived;
    } else {
      state.nextCity = pickTwoDistinctCities(arrived.id)[0];
    }
    getCityPhoto(state.nextCity.id);
    state.legKm = REMO_DATA.haversineKm(arrived.lat, arrived.lng, state.nextCity.lat, state.nextCity.lng);

    state.speedMult = Math.min(1.85, 1.0 + (state.routeIds.length - 1) * 0.075);
    const arrW = getEffectiveWeather(arrived);
    state.torchActive = arrived.id === state.torchCityId;
    if (state.torchActive) {
      showToast(tr('torchJackpotToast'), '#fbbf24', 2.8);
    }
    if (!state.surgeActive) {
      state.surgeActive = (state.routeIds.length % 3 === 0) || arrW.kind === 'rain' || arrW.kind === 'snow';
    }
    fetchLiveCityWeather(state.nextCity);
    if (state.cityFmEnabled) {
      tuneCityFmForCity(arrived);
    }

    state.phase = 'run';
    state.sectorProgress = 0;
    state.portalSpawned = false;
    state.bossTriggeredInSector = false;
    state.boss = null;
    state.platforms = [];
    state.obstacles = [];
    state.projectiles = [];
    state.items = [];
    state.rings = [];
    state.safeGraceTimer = 1.25;
    state.spawnTimer = 0.85;
    state.hero.y = GROUND_Y;
    state.hero.vy = 0;
    state.hero.jumpsLeft = 2;
    state.hero.onPlatform = false;
    state.flashAlpha = 0.65;
    state.flashColor = arrived.themeColor;
    state.shakeTimer = 0.28;
    state.shakeAmt = 7;

    emitParticles(state.hero.x, GROUND_Y, arrived.themeColor, 30, 260);
    addPopup(state.hero.x + 25, GROUND_Y - 110, `+${pts}`, '#fbbf24', 22);
  }

  function takeDamage() {
    if (state.hero.invulnTimer > 0 || state.blitzTimer > 0 || state.hero.blinkTimer > 0) return;

    if (state.crystals > 0) {
      state.crystals--;
      state.multiplier = Math.max(1, state.multiplier - 1);
      state.combo = 0;
      state.feverActive = false;
      state.hero.invulnTimer = 1.45;
      state.shakeTimer = 0.35;
      state.shakeAmt = 11;
      state.flashAlpha = 0.45;
      state.flashColor = '#f43f5e';
      REMO_SFX.hit(true);
      emitParticles(state.hero.x, state.hero.y - 38, '#f43f5e', 24, 250);
      showToast(tr('shieldLost'), '#fda4af', 1.8);
      return;
    }

    endRun(false);
  }

  function endRun(isVictory = false) {
    if (isVictory) REMO_SFX.chest();
    else {
      REMO_SFX.hit(false);
      REMO_SFX.gameOver();
    }
    REMO_SFX.stopPulse();
    stopCityFm();
    state.phase = 'gameover';

    const isDaily = state.gameMode === 'daily';
    let isNewBest = false;
    if (isDaily && state.dailyInfo) {
      const sameDay = state.save.dailyBestDate === state.dailyInfo.dateKey;
      const prevDailyBest = sameDay ? Number(state.save.dailyBestScore || 0) : 0;
      if (state.score > prevDailyBest) {
        isNewBest = true;
        state.save.dailyBestScore = state.score;
        state.save.dailyBestDate = state.dailyInfo.dateKey;
        state.save.dailyBestGhost = state.ghostSamplesRec.slice(0, 2400);
      }
    }
    if (state.score > (state.save.bestScore || 0)) {
      isNewBest = true;
      state.save.bestScore = state.score;
      if (!isDaily) state.save.bestGhost = state.ghostSamplesRec.slice(0, 2400);
    }

    if (!state.save.cityBest) state.save.cityBest = {};
    state.save.cityBest[state.startCityId] = Math.max(state.save.cityBest[state.startCityId] || 0, state.score);
    state.save.totalCoins = (state.save.totalCoins || 0) + state.coins;
    state.save.totalKm = (state.save.totalKm || 0) + state.kmFlown;

    const cityWarPoints = Math.max(10, Math.round(state.score / 80) + state.routeIds.length * 25 + state.blitzGatesWon * 20);
    const summary = {
      score: state.score,
      coinsEarned: state.coins,
      kmFlown: state.kmFlown,
      citiesCount: state.routeIds.length,
      routeIds: state.routeIds.slice(),
      startCityId: state.startCityId,
      cityWarPoints,
      blitzGatesWon: state.blitzGatesWon,
      maxCombo: state.maxCombo,
      maxMult: state.maxMult,
      crystalsLeft: state.crystals,
      seed: state.seed,
      playerName: state.save.playerName || 'REMO_Explorer',
      vipFrame: state.save.equippedAura || state.save.vipFrame || 'gold_fire',
      vipLabel: getVipLabel(state.save.equippedAura || state.save.vipFrame),
      hoverSkin: state.save.equippedHoverSkin || 'gold',
      isNewBest,
      isDaily,
      dailyNum: state.dailyInfo ? state.dailyInfo.num : 1,
      dailyWon: state.dailyWon,
      ts: Date.now()
    };
    state.lastSummary = summary;

    state.save.history = [
      {
        score: summary.score,
        cities: summary.citiesCount,
        km: summary.kmFlown,
        startId: summary.startCityId,
        ts: summary.ts
      },
      ...(state.save.history || [])
    ].slice(0, 8);
    writeSave(state.save);

    if (typeof global.remoSubmitScore === 'function') {
      try { global.remoSubmitScore(state.score); } catch (e) {}
    }
    postToHost({
      type: 'REMO_ODYSSEY_RUN_COMPLETE',
      score: summary.score,
      coinsEarned: summary.coinsEarned,
      kmFlown: summary.kmFlown,
      citiesCount: summary.citiesCount,
      routeIds: summary.routeIds,
      startCityId: summary.startCityId,
      cityWarPoints,
      relics: (state.save.relics || []).slice(),
      blitzGatesWon: summary.blitzGatesWon,
      isDaily,
      dailyWon: summary.dailyWon,
      summary
    });

    renderGameOverModal(summary);
    syncOverlays();
  }

  function getVipLabel(frame) {
    switch (frame) {
      case 'gold_fire': return '🔥 SOLAR CROWN';
      case 'cyber_matrix': return '⚡ CYBER MATRIX';
      case 'diamond_vip': return '💎 DIAMOND PRISM';
      case 'tricolor_crest': return '👑 IMPERIAL CREST';
      case 'rainbow_4d': return '🌈 RAINBOW 4D HALO';
      default: return '🛡️ REMO SOVEREIGN';
    }
  }

  /* ── Update Physics (Normalized Delta-Time) ── */
  function update(dt) {
    state.time += dt;
    if (state.toastTimer > 0) state.toastTimer = Math.max(0, state.toastTimer - dt);
    if (state.flashAlpha > 0) state.flashAlpha = Math.max(0, state.flashAlpha - dt * 1.4);
    if (state.shakeTimer > 0) state.shakeTimer = Math.max(0, state.shakeTimer - dt);

    for (let i = state.particles.length - 1; i >= 0; i--) {
      const pt = state.particles[i];
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.life -= dt;
      if (pt.life <= 0) state.particles.splice(i, 1);
    }
    for (let i = state.popups.length - 1; i >= 0; i--) {
      const pp = state.popups[i];
      pp.y += pp.vy * dt;
      pp.life -= dt * 1.15;
      if (pp.life <= 0) state.popups.splice(i, 1);
    }

    // Slow-Mo Compass Lock Landing phase
    if (state.phase === 'landing' && state.compassLock) {
      const cl = state.compassLock;
      cl.timer -= dt;
      cl.needleAng = Math.sin((cl.maxTimer - cl.timer) * 4.4) * 1.25;
      if (cl.timer <= 0) {
        resolveCompassLock(false);
      }
      return;
    }

    if (state.phase !== 'run' && state.phase !== 'fly') return;

    const h = state.hero;
    if (h.invulnTimer > 0) h.invulnTimer = Math.max(0, h.invulnTimer - dt);
    if (h.slideTimer > 0) h.slideTimer = Math.max(0, h.slideTimer - dt);
    if (h.dashTimer > 0) h.dashTimer = Math.max(0, h.dashTimer - dt);
    if (h.blinkTimer > 0) h.blinkTimer = Math.max(0, h.blinkTimer - dt);
    if (state.safeGraceTimer > 0) state.safeGraceTimer = Math.max(0, state.safeGraceTimer - dt);
    if (state.blastCooldown > 0) state.blastCooldown = Math.max(0, state.blastCooldown - dt);
    if (state.blinkCooldown > 0) state.blinkCooldown = Math.max(0, state.blinkCooldown - dt);
    if (state.magnetTimer > 0) state.magnetTimer = Math.max(0, state.magnetTimer - dt);
    if (state.blitzTimer > 0) state.blitzTimer = Math.max(0, state.blitzTimer - dt);
    if (state.prismTimer > 0) state.prismTimer = Math.max(0, state.prismTimer - dt);
    if (state.ascendedTimer > 0) state.ascendedTimer = Math.max(0, state.ascendedTimer - dt);
    if (state.chronoRiftTimer > 0) state.chronoRiftTimer = Math.max(0, state.chronoRiftTimer - dt);

    for (let i = state.autoZapBeams.length - 1; i >= 0; i--) {
      state.autoZapBeams[i].life -= dt;
      if (state.autoZapBeams[i].life <= 0) state.autoZapBeams.splice(i, 1);
    }

    // 4D Ascended Crystal Orbit Auto-Lightning!
    if (state.ascendedTimer > 0) {
      state.ascendedAutoZapTimer -= dt;
      if (state.ascendedAutoZapTimer <= 0) {
        state.ascendedAutoZapTimer = 0.85;
        const targetIdx = state.obstacles.findIndex((o) =>
          o.x > h.x + 15 && o.x < VW - 20 &&
          ['drone', 'meteor', 'void_mine', 'pinwheel', 'boss_orb', 'prism_gate'].includes(o.kind)
        );
        if (targetIdx >= 0) {
          const o = state.obstacles[targetIdx];
          const ox = o.x + (o.w ? o.w * 0.5 : 0);
          const oy = o.y - (o.h ? o.h * 0.5 : 0);
          state.autoZapBeams.push({ x1: h.x + 10, y1: h.y - 68, x2: ox, y2: oy, color: '#38bdf8', life: 0.24 });
          emitParticles(ox, oy, '#38bdf8', 16, 220);
          const pts = addScore(95);
          addPopup(ox, oy - 22, `⚡+${pts}`, '#7dd3fc', 16);
          state.obstacles.splice(targetIdx, 1);
        } else if (state.boss && state.boss.active) {
          state.autoZapBeams.push({ x1: h.x + 10, y1: h.y - 68, x2: state.boss.x, y2: state.boss.y, color: '#fbbf24', life: 0.24 });
          damageBoss(1, false);
        }
      }
    }

    // Record Ghost Racer Trajectory at 10 Hz (capped 2400 samples)
    if (state.time >= state.ghostNextSampleT && state.ghostSamplesRec.length < 2400) {
      state.ghostNextSampleT = state.time + 0.1;
      state.ghostSamplesRec.push([
        Number(state.time.toFixed(2)),
        Math.round(h.y),
        state.phase === 'fly' ? 1 : 0,
        h.slideTimer > 0 ? 1 : 0,
        Number(h.runPhase.toFixed(2))
      ]);
    }

    const blitzFactor = state.blitzTimer > 0 ? 1.42 : 1.0;
    const blinkFactor = h.blinkTimer > 0 ? 1.28 : 1.0;
    const chronoSlow = state.chronoRiftTimer > 0 ? 0.85 : 1.0;
    const worldSpeed = (state.phase === 'fly' ? 470 : 390) * state.speedMult * (h.dashTimer > 0 ? 1.30 : 1) * blitzFactor * blinkFactor * chronoSlow;

    state.stars.forEach((st) => {
      st.x -= (st.speed + worldSpeed * 0.06) * dt;
      if (st.x < -5) { st.x = VW + 5; st.y = Math.random() * (GROUND_Y - 120); }
    });
    state.weatherDrops.forEach((wd) => {
      wd.x -= (worldSpeed * 0.42) * dt;
      wd.y += wd.spd * dt;
      if (wd.y > VH) { wd.y = -20; wd.x = Math.random() * (VW + 200); }
      if (wd.x < -40) wd.x = VW + 40;
    });
    state.trafficStreaks.forEach((trf) => {
      trf.x -= (trf.spd + worldSpeed * 0.35) * dt;
      if (trf.x + trf.len < -20) {
        trf.x = VW + 40 + Math.random() * 140;
        trf.y = 230 + Math.random() * 160;
      }
    });

    const targetMorph = state.phase === 'fly' ? 1 : 0;
    h.morph += (targetMorph - h.morph) * Math.min(1, dt * 8.5);

    if (Math.floor((state.time - dt) * 10) !== Math.floor(state.time * 10)) {
      addScore(3);
    }

    if (state.phase === 'run') {
      const prevFrame = Math.floor(h.runPhase * 1.55) % 6;
      h.runPhase += dt * (7.8 * state.speedMult);
      const curFrame = Math.floor(h.runPhase * 1.55) % 6;
      const isGrounded = Math.abs(h.vy) < 10 && (h.y >= GROUND_Y - 2 || h.onPlatform);
      if (isGrounded && prevFrame !== curFrame && (curFrame === 0 || curFrame === 3)) {
        state.particles.push({
          x: h.x - 16, y: h.y - 3,
          vx: -140 - Math.random() * 80, vy: -25 - Math.random() * 45,
          r: 2.2 + Math.random() * 1.8, color: '#38bdf8', life: 0.28, maxLife: 0.28
        });
      }
      if (h.slideTimer > 0 && Math.random() < 0.75) {
        state.particles.push({
          x: h.x - 28, y: h.y - 6,
          vx: -200 - Math.random() * 90, vy: -15 - Math.random() * 35,
          r: 2.6 + Math.random() * 2, color: Math.random() > 0.45 ? '#fbbf24' : '#38bdf8',
          life: 0.30, maxLife: 0.30
        });
      }

      const prevY = h.y;
      const gravity = state.chronoRiftTimer > 0 ? 1240 : 1780;
      h.vy += gravity * dt;
      h.y += h.vy * dt;
      h.onPlatform = false;

      for (let i = state.platforms.length - 1; i >= 0; i--) {
        const pl = state.platforms[i];
        pl.x -= worldSpeed * dt;
        if (h.vy >= 0 && h.x >= pl.x - 18 && h.x <= pl.x + pl.w + 18 && prevY <= pl.y + 10 && h.y >= pl.y) {
          h.y = pl.y;
          h.vy = 0;
          h.jumpsLeft = 2;
          h.onPlatform = true;
          if (pl.hasLaunchPad && !pl.launched && h.x >= pl.x + pl.w - 58) {
            pl.launched = true;
            h.vy = -860;
            h.jumpsLeft = 2;
            h.onPlatform = false;
            REMO_SFX.jump(true);
            emitParticles(h.x, pl.y, '#fde047', 20, 240);
            showToast(tr('launchPadToast'), '#fde047', 1.4);
          }
        }
        if (pl.x + pl.w < -80) state.platforms.splice(i, 1);
      }

      if (h.y >= GROUND_Y) {
        h.y = GROUND_Y;
        h.vy = 0;
        h.jumpsLeft = 2;
      }

      const isBossSector = (state.routeIds.length % 2 === 0);
      if (isBossSector && state.sectorProgress >= 0.62 && !state.bossTriggeredInSector) {
        state.bossTriggeredInSector = true;
        spawnBossSentinel();
      }

      if (state.boss && state.boss.active) {
        const b = state.boss;
        b.x += (b.targetX - b.x) * Math.min(1, dt * 3.5);
        const speedWave = b.variant === 'neon' ? 5.0 : 3.5;
        b.y = GROUND_Y - 102 + Math.sin(state.time * speedWave) * 34;
        if (b.hitFlash > 0) b.hitFlash = Math.max(0, b.hitFlash - dt);
        b.timer -= dt;
        b.fireTimer -= dt;
        if (b.fireTimer <= 0) {
          b.fireTimer = b.variant === 'cyber' ? 0.95 : 1.32;
          state.obstacles.push({
            kind: b.variant === 'cyber' ? 'drone' : 'boss_orb',
            x: b.x - 30,
            y: b.y + 10,
            w: 58,
            h: 32,
            bob: 0,
            r: 16,
            vx: worldSpeed * 0.28,
            vy: b.variant === 'cyber' ? 0 : (h.y - 38 - b.y) * 0.45
          });
        }
        // Plasma & Crystal Boss Alternating Solar Laser Sweep!
        if (b.variant === 'plasma' || b.variant === 'crystal') {
          if (b.beamActive > 0) {
            b.beamActive -= dt;
            if (Math.abs((h.y - 44) - b.beamY) < 24 && h.blinkTimer <= 0 && h.invulnTimer <= 0 && state.blitzTimer <= 0) {
              b.beamActive = 0;
              takeDamage();
              if (state.phase === 'gameover') return;
            }
          } else if (b.beamWarn > 0) {
            b.beamWarn -= dt;
            if (b.beamWarn <= 0) b.beamActive = 0.48;
          } else {
            b.beamTimer -= dt;
            if (b.beamTimer <= 0) {
              b.beamTimer = 3.2;
              b.beamWarn = 0.95;
              b.beamY = Math.random() > 0.5 ? GROUND_Y - 38 : GROUND_Y - 120;
            }
          }
        }
        if (b.timer <= 0) defeatBoss();
      } else {
        state.sectorProgress += dt / 16.5;
      }

      if (state.sectorProgress >= 0.94 && !state.portalSpawned && !(state.boss && state.boss.active)) {
        spawnDualPortals();
      }

      if (state.safeGraceTimer <= 0 && !state.portalSpawned && !(state.boss && state.boss.active)) {
        state.spawnTimer -= dt;
        if (state.spawnTimer <= 0) spawnRunPattern();
      }
    } else if (state.phase === 'fly') {
      if (state.keys.ArrowUp || state.keys.KeyW) h.targetFlyY = Math.max(78, h.targetFlyY - 390 * dt);
      if (state.keys.ArrowDown || state.keys.KeyS) h.targetFlyY = Math.min(VH - 64, h.targetFlyY + 390 * dt);
      if (state.pointerActive) h.targetFlyY = Math.max(78, Math.min(VH - 64, state.pointerY));

      const prevY = h.y;
      h.y += (h.targetFlyY - h.y) * Math.min(1, dt * 10);
      h.vy = (h.y - prevY) / Math.max(0.001, dt);

      if (Math.random() < 0.72) {
        state.particles.push({
          x: h.x - 24, y: h.y + 10,
          vx: -170 - Math.random() * 90, vy: (Math.random() - 0.5) * 40,
          r: 2.5 + Math.random() * 2.5,
          color: state.feverActive ? '#fbbf24' : (Math.random() > 0.5 ? '#38bdf8' : '#a855f7'),
          life: 0.36, maxLife: 0.36
        });
      }

      state.sectorProgress += dt / 10.5;
      if (state.sectorProgress >= 0.38 && !state.blitzGateSpawned) {
        spawnBlitzSkyGate();
      }
      if (state.blitzGate && !state.blitzGate.resolved) {
        state.blitzGate.x -= worldSpeed * 0.82 * dt;
        if (state.blitzGate.x <= h.x + 28) {
          resolveBlitzSkyGate(h.y < VH * 0.52);
        }
      }
      if (state.sectorProgress < 0.86 && !state.blitzGate) {
        state.ringTimer -= dt;
        if (state.ringTimer <= 0) spawnFlyPattern();
      }
      if (state.sectorProgress >= 1.0) {
        state.blitzGate = null;
        startCompassLockLanding();
        return;
      }
    }

    // Update Fire & Lightning Projectiles!
    for (let i = state.projectiles.length - 1; i >= 0; i--) {
      const pr = state.projectiles[i];
      pr.x += pr.vx * dt;
      pr.life -= dt;

      if (Math.random() < 0.85) {
        state.particles.push({
          x: pr.x - 10, y: pr.y + (Math.random() - 0.5) * 10,
          vx: -120, vy: (Math.random() - 0.5) * 40,
          r: 2.8, color: Math.random() > 0.5 ? '#fbbf24' : '#38bdf8',
          life: 0.22, maxLife: 0.22
        });
      }

      let consumed = false;
      // Hit Boss Sentinel (with Elemental 2X CRIT if counter matches!)
      if (state.boss && state.boss.active && Math.hypot(pr.x - state.boss.x, pr.y - state.boss.y) < 64) {
        damageBoss(pr.dmg || 1, Boolean(pr.isCrit));
        consumed = true;
      }

      // Destroy shootable obstacles (drone, meteor, void_mine, pinwheel, boss_orb, prism_gate)
      if (!consumed) {
        for (let j = state.obstacles.length - 1; j >= 0; j--) {
          const o = state.obstacles[j];
          const shootable = ['drone', 'meteor', 'void_mine', 'pinwheel', 'boss_orb', 'prism_gate'].includes(o.kind);
          if (!shootable) continue;
          const oy = o.y - (o.h ? o.h * 0.5 : 0);
          const ox = o.x + (o.w ? o.w * 0.5 : 0);
          if (Math.hypot(pr.x - ox, pr.y - oy) < (o.r || 36) + 22) {
            const pts = addScore(110);
            REMO_SFX.crystal();
            emitParticles(ox, oy, '#fbbf24', 18, 240);
            emitParticles(ox, oy, '#38bdf8', 14, 210);
            addPopup(ox, oy - 25, `+${pts} 🔥`, '#fde047', 17);
            state.obstacles.splice(j, 1);
            consumed = true;
            break;
          }
        }
      }

      // Open GeoVault Chest from afar!
      if (!consumed) {
        for (let k = state.items.length - 1; k >= 0; k--) {
          const it = state.items[k];
          if (it.kind === 'geovault' && Math.hypot(pr.x - it.x, pr.y - it.y) < 38) {
            triggerGeoVaultChest(it.x, it.y);
            state.items.splice(k, 1);
            consumed = true;
            break;
          }
        }
      }

      if (consumed || pr.x > VW + 40 || pr.life <= 0) {
        state.projectiles.splice(i, 1);
      }
    }

    // Hero Hitbox
    const isSliding = h.slideTimer > 0 && state.phase === 'run';
    const heroBox = {
      x: h.x - 20,
      y: state.phase === 'fly' ? h.y - 84 : (isSliding ? h.y - 44 : h.y - 96),
      w: 40,
      h: state.phase === 'fly' ? 82 : (isSliding ? 42 : 94)
    };

    // Update & Check Obstacles
    for (let i = state.obstacles.length - 1; i >= 0; i--) {
      const o = state.obstacles[i];
      if (o.kind === 'meteor') {
        o.targetX -= worldSpeed * dt;
        if (!o.impacted) {
          o.warnTimer -= dt;
          if (o.warnTimer <= 0) {
            o.y += 960 * dt;
            o.x = o.targetX + Math.max(0, (GROUND_Y - o.y) * 0.35);
            if (o.y >= GROUND_Y - 10) {
              o.y = GROUND_Y - 10;
              o.impacted = true;
              emitParticles(o.targetX, GROUND_Y, '#f43f5e', 18, 220);
              state.shakeTimer = 0.16;
              state.shakeAmt = 5;
            }
          } else {
            o.x = o.targetX + 180;
            o.y = -40;
          }
        } else {
          o.x -= worldSpeed * dt;
        }
      } else {
        o.x -= (worldSpeed + (o.speedExtra || 0) + (o.vx || 0)) * dt;
      }

      if (o.vy) o.y += o.vy * dt;
      if (o.kind === 'drone') o.bob += dt * 4;
      else if (o.kind === 'void_mine') o.pulse += dt * 5;
      else if (o.kind === 'pinwheel') o.angle += dt * 3.1;

      let hit = false;
      if (o.kind === 'void_mine' || o.kind === 'boss_orb') {
        hit = Math.hypot(h.x - o.x, (h.y - 44) - o.y) < (o.r + 20);
      } else if (o.kind === 'meteor') {
        hit = o.warnTimer <= 0 && Math.hypot(h.x - o.x, (h.y - 44) - o.y) < (o.r + 22);
      } else if (o.kind === 'pinwheel') {
        const dy = (h.y - 44) - o.y;
        const dx = h.x - o.x;
        const d = Math.hypot(dx, dy);
        if (d < o.r + 18) {
          const angDiff = Math.abs(Math.sin(Math.atan2(dy, dx) - o.angle));
          if (angDiff < 0.38 || d < 20) hit = true;
        }
      } else {
        const oy = o.kind === 'drone' ? (o.y + Math.sin(o.bob) * 5 - o.h) : (o.y - o.h);
        hit = (
          heroBox.x < o.x + o.w &&
          heroBox.x + heroBox.w > o.x &&
          heroBox.y < oy + o.h &&
          heroBox.y + heroBox.h > oy
        );
      }

      if (hit) {
        if (h.blinkTimer > 0) {
          if (!o._blinkScored) {
            o._blinkScored = true;
            const pts = addScore(80);
            emitParticles(h.x, h.y - 44, '#38bdf8', 14, 210);
            addPopup(h.x, h.y - 98, `🌀 +${pts}`, '#7dd3fc', 17);
          }
          continue;
        }
        if (state.blitzTimer > 0 || (o.breakable && (h.dashTimer > 0 || h.slideTimer > 0))) {
          const pts = addScore(state.blitzTimer > 0 ? 120 : 100);
          REMO_SFX.crystal();
          emitParticles(o.x + (o.w || 0) * 0.5, o.y - (o.h || 0) * 0.5, '#38bdf8', 24, 290);
          addPopup(o.x, o.y - 85, `+${pts} 💥`, '#7dd3fc', 19);
          state.obstacles.splice(i, 1);
          continue;
        } else {
          state.obstacles.splice(i, 1);
          takeDamage();
          if (state.phase === 'gameover') return;
          continue;
        }
      }

      if (o.x < -150) state.obstacles.splice(i, 1);
    }

    // Update & Check 4B Sky Rings
    for (let i = state.rings.length - 1; i >= 0; i--) {
      const rg = state.rings[i];
      rg.x -= worldSpeed * dt;
      if (!rg.passed && Math.abs(rg.x - h.x) < 34 && Math.abs(rg.y - (h.y - 42)) < rg.ry + 16) {
        rg.passed = true;
        state.multiplier = Math.min(5, state.multiplier + 1);
        state.maxMult = Math.max(state.maxMult, state.multiplier);
        const pts = addScore(rg.isTurbo ? 140 : 85);
        state.novaCharge = Math.min(100, state.novaCharge + 15);
        if (rg.isTurbo) state.sectorProgress = Math.min(0.95, state.sectorProgress + 0.08);
        REMO_SFX.ring(state.multiplier);
        emitParticles(rg.x, rg.y, rg.color, 20, 230);
        addPopup(rg.x, rg.y - 38, `x${state.multiplier} RING +${pts}`, '#fde047', 17);
      }
      if (rg.x < -90) state.rings.splice(i, 1);
    }

    // Update & Check Items (Coins, Crystals, GeoVault, Dual Portals)
    for (let i = state.items.length - 1; i >= 0; i--) {
      const it = state.items[i];
      const isPortal = it.kind === 'portal_high' || it.kind === 'portal_low';
      const magnetActive = !isPortal && (it.magnet || (state.magnetTimer > 0 && it.kind === 'coin' && Math.hypot(h.x - it.x, (h.y - 44) - it.y) < 340));
      if (magnetActive) {
        const dx = h.x - it.x;
        const dy = (h.y - 44) - it.y;
        const dist = Math.max(1, Math.hypot(dx, dy));
        it.x += (dx / dist) * 820 * dt;
        it.y += (dy / dist) * 820 * dt;
      } else {
        it.x -= worldSpeed * dt;
      }

      if (isPortal && it.x <= h.x + 34) {
        // Choose High Portal if hero is jumping/on Sky-Bridge (above GROUND_Y - 125), else Low Portal!
        const allPortals = state.items.filter((x) => x.kind === 'portal_high' || x.kind === 'portal_low');
        const picked = (h.y < GROUND_Y - 115)
          ? (allPortals.find((x) => x.kind === 'portal_high') || it)
          : (allPortals.find((x) => x.kind === 'portal_low') || it);
        state.items = state.items.filter((x) => x.kind !== 'portal_high' && x.kind !== 'portal_low');
        enterSkyFlightMode(picked);
        return;
      }

      const dist = Math.hypot(h.x - it.x, (h.y - 44) - it.y);
      if (dist < 48) {
        if (it.kind === 'coin') {
          state.coins += state.chronoRiftTimer > 0 ? 3 : 1;
          state.combo++;
          state.maxCombo = Math.max(state.maxCombo, state.combo);
          if (state.blastCooldown > 0) state.blastCooldown = Math.max(0, state.blastCooldown - 0.25);
          if (state.combo === 15 && !state.feverActive) {
            state.feverActive = true;
            showToast(tr('feverToast'), '#ec4899', 2.4);
          }
          state.novaCharge = Math.min(100, state.novaCharge + 5);
          const pts = addScore(15);
          REMO_SFX.coin(state.combo);
          emitParticles(it.x, it.y, '#fbbf24', 7, 130);
          addPopup(it.x, it.y - 14, `+${pts}`, '#fde047', 14);
          state.items.splice(i, 1);
          continue;
        } else if (it.kind === 'crystal') {
          if (state.crystals < 4) state.crystals++;
          state.novaCharge = Math.min(100, state.novaCharge + 28);
          state.blinkCooldown = Math.max(0, state.blinkCooldown - 1.0);
          const pts = addScore(75);
          REMO_SFX.crystal();
          emitParticles(it.x, it.y, '#a855f7', 18, 190);
          addPopup(it.x, it.y - 16, `💎 +${pts}`, '#c084fc', 17);
          state.items.splice(i, 1);
          continue;
        } else if (it.kind === 'geovault') {
          triggerGeoVaultChest(it.x, it.y);
          state.items.splice(i, 1);
          continue;
        } else if (it.kind === 'power_magnet') {
          state.magnetTimer = getMagnetDuration();
          REMO_SFX.crystal();
          showToast(tr('powerMagnet'), '#38bdf8', 2.2);
          emitParticles(it.x, it.y, '#38bdf8', 20, 220);
          state.items.splice(i, 1);
          continue;
        } else if (it.kind === 'power_blitz') {
          state.blitzTimer = 5.5;
          REMO_SFX.nova();
          showToast(tr('powerBlitz'), '#fbbf24', 2.2);
          emitParticles(it.x, it.y, '#fbbf24', 22, 240);
          state.items.splice(i, 1);
          continue;
        } else if (it.kind === 'power_prism') {
          state.prismTimer = 10.0;
          REMO_SFX.crystal();
          showToast(tr('powerPrism'), '#ec4899', 2.2);
          emitParticles(it.x, it.y, '#ec4899', 20, 220);
          state.items.splice(i, 1);
          continue;
        }
      }

      if (it.x < -80) state.items.splice(i, 1);
    }
  }

  /* ── Ghost Interpolation Helper ── */
  function sampleGhostAtTime(t) {
    const trk = state.activeGhostTrack;
    if (!trk || trk.length < 2) return null;
    const idx = Math.floor(t * 10);
    if (idx < 0 || idx >= trk.length - 1) return null;
    const a = trk[idx];
    const b = trk[idx + 1];
    const f = Math.max(0, Math.min(1, (t - a[0]) / Math.max(0.01, b[0] - a[0])));
    return {
      x: 195 + 14, // slightly offset ahead/behind visually
      y: a[1] + (b[1] - a[1]) * f,
      mode: a[2] ? 'fly' : 'run',
      morph: a[2] ? 1 : 0,
      sliding: Boolean(a[3]),
      runPhase: a[4] + (b[4] - a[4]) * f,
      time: t,
      scale: 1.42
    };
  }

  /* ── Render Real City Skybox, Entities, Combat Projectiles, Ghost & Compass Lock ── */
  function drawRealCityBackdrop(city, nextCity) {
    const photo = getCityPhoto(state.phase === 'fly' || state.phase === 'landing' ? nextCity.id : city.id);
    if (state.phase !== 'fly' && state.phase !== 'landing') {
      if (photo) {
        const aspect = photo.naturalWidth / Math.max(1, photo.naturalHeight);
        const drawH = 340;
        const drawW = Math.max(VW * 0.72, drawH * aspect);
        const yTop = GROUND_Y - drawH + 14;
        const cycleW = drawW * 2;
        const off = (state.time * 48 * state.speedMult) % cycleW;

        ctx.save();
        ctx.globalAlpha = 0.68;
        for (let sx = -off; sx < VW + drawW; sx += cycleW) {
          ctx.drawImage(photo, sx, yTop, drawW + 1, drawH);
          ctx.save();
          ctx.translate(sx + drawW * 2, yTop);
          ctx.scale(-1, 1);
          ctx.drawImage(photo, 0, 0, drawW + 1, drawH);
          ctx.restore();
        }
        ctx.restore();

        const maskTop = ctx.createLinearGradient(0, yTop - 10, 0, yTop + 125);
        maskTop.addColorStop(0, city.skyTop || '#050816');
        maskTop.addColorStop(0.55, (city.skyTop || '#050816') + 'bb');
        maskTop.addColorStop(1, 'transparent');
        ctx.fillStyle = maskTop;
        ctx.fillRect(0, yTop - 10, VW, 140);

        const wash = ctx.createLinearGradient(0, GROUND_Y - 170, 0, GROUND_Y);
        wash.addColorStop(0, 'transparent');
        wash.addColorStop(1, 'rgba(5, 8, 22, 0.58)');
        ctx.fillStyle = wash;
        ctx.fillRect(0, GROUND_Y - 170, VW, 175);
      }

      const lmX = VW - ((state.time * 58) % (VW + 440)) + 220;
      REMO_DATA.drawCityLandmark(ctx, city.id, city.themeColor, lmX, GROUND_Y, 175, photo ? 0.36 : 0.72);

      state.trafficStreaks.forEach((trf) => {
        ctx.strokeStyle = trf.col + '77';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(trf.x, trf.y);
        ctx.lineTo(trf.x + trf.len, trf.y);
        ctx.stroke();
      });

      const lampGap = 240;
      const lampOff = (state.time * 165 * state.speedMult) % lampGap;
      for (let lx = -lampOff; lx < VW + 80; lx += lampGap) {
        ctx.strokeStyle = 'rgba(255,255,255,0.28)';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(lx, GROUND_Y); ctx.lineTo(lx, GROUND_Y - 76); ctx.lineTo(lx + 14, GROUND_Y - 76);
        ctx.stroke();

        const lg = ctx.createRadialGradient(lx + 14, GROUND_Y - 74, 2, lx + 14, GROUND_Y - 25, 62);
        lg.addColorStop(0, 'rgba(254, 240, 138, 0.35)');
        lg.addColorStop(1, 'transparent');
        ctx.fillStyle = lg;
        ctx.beginPath();
        ctx.moveTo(lx + 14, GROUND_Y - 74);
        ctx.lineTo(lx - 28, GROUND_Y);
        ctx.lineTo(lx + 56, GROUND_Y);
        ctx.closePath();
        ctx.fill();
      }

      const roadG = ctx.createLinearGradient(0, GROUND_Y, 0, VH);
      roadG.addColorStop(0, '#0d152e');
      roadG.addColorStop(1, '#03050e');
      ctx.fillStyle = roadG;
      ctx.fillRect(0, GROUND_Y, VW, VH - GROUND_Y);

      if (photo) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, GROUND_Y, VW, VH - GROUND_Y);
        ctx.clip();
        ctx.globalAlpha = 0.22;
        const aspect = photo.naturalWidth / Math.max(1, photo.naturalHeight);
        const drawH = 120;
        const drawW = Math.max(VW * 0.72, drawH * aspect);
        const off = (state.time * 48 * state.speedMult) % (drawW * 2);
        for (let sx = -off; sx < VW + drawW; sx += drawW * 2) {
          ctx.save();
          ctx.translate(sx, GROUND_Y + drawH);
          ctx.scale(1, -1);
          ctx.drawImage(photo, 0, 0, drawW + 1, drawH);
          ctx.restore();
        }
        ctx.restore();
      }

      ctx.strokeStyle = city.themeColor + '66';
      ctx.lineWidth = 1.6;
      const gOff = (state.time * 390 * state.speedMult) % 64;
      for (let gx = -64; gx < VW + 120; gx += 64) {
        ctx.beginPath();
        ctx.moveTo(gx - gOff, GROUND_Y);
        ctx.lineTo(gx - gOff - 72, VH);
        ctx.stroke();
      }
      // Live Procedural Synthwave Horizon Equalizer!
      const beatPulse = typeof REMO_SFX.getBeatPulse === 'function' ? REMO_SFX.getBeatPulse() : 0.4;
      const eqBars = 28;
      const eqW = VW / eqBars;
      ctx.save();
      for (let bi = 0; bi < eqBars; bi++) {
        const wave = 0.35 + 0.65 * Math.abs(Math.sin(state.time * 5.2 + bi * 0.45));
        const bh = 10 + (18 + beatPulse * 24) * wave;
        ctx.fillStyle = bi % 2 === 0 ? (city.themeColor + '2e') : 'rgba(56, 189, 248, 0.16)';
        ctx.fillRect(bi * eqW + 3, GROUND_Y - bh, eqW - 6, bh);
      }
      ctx.restore();

      if (state.chronoRiftTimer > 0) {
        ctx.save();
        ctx.fillStyle = 'rgba(168, 85, 247, 0.14)';
        ctx.fillRect(0, 0, VW, VH);
        ctx.strokeStyle = 'rgba(232, 121, 249, 0.55)';
        ctx.lineWidth = 4;
        ctx.strokeRect(2, 2, VW - 4, VH - 4);
        ctx.restore();
      }

      ctx.strokeStyle = city.themeColor;
      ctx.shadowColor = city.themeColor;
      ctx.shadowBlur = 14;
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(0, GROUND_Y); ctx.lineTo(VW, GROUND_Y);
      ctx.stroke();
      ctx.shadowBlur = 0;

      state.platforms.forEach((pl) => {
        ctx.save();
        ctx.fillStyle = 'rgba(11, 19, 44, 0.94)';
        ctx.strokeStyle = '#38bdf8';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 12;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(pl.x, pl.y, pl.w, pl.h, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#7dd3fc';
        ctx.font = '800 10px "Orbitron", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('>>> CYBER SKY-BRIDGE >>>', pl.x + pl.w / 2 - (pl.hasLaunchPad ? 22 : 0), pl.y + 11.5);

        if (pl.hasLaunchPad) {
          ctx.fillStyle = '#fbbf24';
          ctx.shadowColor = '#fbbf24';
          ctx.beginPath();
          ctx.roundRect(pl.x + pl.w - 56, pl.y - 6, 52, 8, 4);
          ctx.fill();
        }
        ctx.restore();
      });
    } else {
      if (photo && (state.sectorProgress > 0.45 || state.phase === 'landing')) {
        const t = state.phase === 'landing' ? 1 : Math.min(1, (state.sectorProgress - 0.45) / 0.55);
        ctx.save();
        ctx.globalAlpha = t * 0.60;
        ctx.drawImage(photo, 0, VH - 260, VW, 260);
        const fade = ctx.createLinearGradient(0, VH - 260, 0, VH - 140);
        fade.addColorStop(0, '#040714');
        fade.addColorStop(1, 'transparent');
        ctx.fillStyle = fade;
        ctx.fillRect(0, VH - 260, VW, 130);
        ctx.restore();
      }
      ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
      const cOff = (state.time * 240) % 320;
      for (let cx = -160; cx < VW + 320; cx += 320) {
        ctx.beginPath();
        ctx.ellipse(cx - cOff, VH - 36, 185, 34, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      if (state.sectorProgress > 0.68 || state.phase === 'landing') {
        const t = state.phase === 'landing' ? 1 : (state.sectorProgress - 0.68) / 0.32;
        REMO_DATA.drawCityLandmark(ctx, nextCity.id, nextCity.themeColor, VW - t * 320, VH - 26, 185, Math.min(0.9, t * 1.15));
      }
    }
  }

  function render() {
    if (!ctx) return;
    const city = state.currentCity || REMO_DATA.getCityById(state.startCityId);
    const nextCity = state.nextCity || REMO_DATA.getCityById('paris');
    const elInfo = REMO_DATA.REMO_ELEMENTS[city.element] || REMO_DATA.REMO_ELEMENTS.neon;

    ctx.save();
    if (state.shakeTimer > 0) {
      ctx.translate((Math.random() - 0.5) * state.shakeAmt * 2, (Math.random() - 0.5) * state.shakeAmt * 2);
    }

    const localClock = REMO_DATA.getCityLocalClock ? REMO_DATA.getCityLocalClock(city) : { period: 'night', icon: '🌙', clockStr: '21:00' };
    const effW = getEffectiveWeather(city);
    const sky = ctx.createLinearGradient(0, 0, 0, VH);
    if (state.phase === 'fly' || state.phase === 'landing') {
      sky.addColorStop(0, '#040714');
      sky.addColorStop(0.55, '#130e34');
      sky.addColorStop(1, nextCity.skyBot || '#1e1b4b');
    } else if (localClock.period === 'day') {
      sky.addColorStop(0, '#0c2348');
      sky.addColorStop(0.58, '#173866');
      sky.addColorStop(1, city.skyBot || '#1e3a5f');
    } else if (localClock.period === 'sunset') {
      sky.addColorStop(0, '#1c1038');
      sky.addColorStop(0.58, '#4a1d4c');
      sky.addColorStop(1, '#7c2d12');
    } else {
      sky.addColorStop(0, city.skyTop || '#050816');
      sky.addColorStop(1, city.skyBot || '#111936');
    }
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, VW, VH);

    const starVis = localClock.period === 'day' && state.phase === 'run' ? 0.25 : 1.0;
    state.stars.forEach((st) => {
      const tw = (0.45 + 0.55 * Math.sin(state.time * 3 + st.tw)) * starVis;
      ctx.fillStyle = `rgba(255, 255, 255, ${tw})`;
      ctx.beginPath();
      ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.save();
    const mG = ctx.createRadialGradient(800, 96, 6, 800, 96, 40);
    mG.addColorStop(0, localClock.period === 'day' ? '#ffffff' : '#fef08a');
    mG.addColorStop(0.65, localClock.period === 'sunset' ? '#fb923caa' : (city.themeColor + 'aa'));
    mG.addColorStop(1, 'transparent');
    ctx.fillStyle = mG;
    ctx.beginPath();
    ctx.arc(800, 96, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.22)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(800, 96, 58, 14, -0.25, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    drawRealCityBackdrop(city, nextCity);

    if (effW.kind === 'rain' || state.surgeActive) {
      ctx.strokeStyle = state.surgeActive ? 'rgba(251, 191, 36, 0.30)' : 'rgba(125, 211, 252, 0.28)';
      ctx.lineWidth = 1.5;
      state.weatherDrops.forEach((wd) => {
        ctx.beginPath(); ctx.moveTo(wd.x, wd.y); ctx.lineTo(wd.x - 6, wd.y + wd.len); ctx.stroke();
      });
    } else if (effW.kind === 'snow') {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      state.weatherDrops.forEach((wd) => {
        ctx.beginPath(); ctx.arc(wd.x, wd.y, 2.4, 0, Math.PI * 2); ctx.fill();
      });
    }

    // 🧠 4B Blitz Sky-Gate Trivia Dual Portals!
    if (state.phase === 'fly' && state.blitzGate && !state.blitzGate.resolved) {
      const bgGate = state.blitzGate;
      const drawGateOption = (gCity, cy, isUpper) => {
        const gCol = isUpper ? '#38bdf8' : '#fbbf24';
        ctx.save();
        ctx.translate(bgGate.x, cy);
        ctx.fillStyle = 'rgba(5, 8, 22, 0.80)';
        ctx.strokeStyle = gCol;
        ctx.shadowColor = gCol;
        ctx.shadowBlur = 18;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(-24, -68, 48, 136, 16);
        ctx.fill();
        ctx.stroke();

        ctx.shadowBlur = 0;
        ctx.fillStyle = '#050816';
        ctx.beginPath();
        ctx.roundRect(-62, -24, 124, 48, 12);
        ctx.fill();
        ctx.stroke();
        REMO_DATA.drawCountryFlag(ctx, gCity, -50, -9, 24, 16);
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 13px "Orbitron", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(gCity.code, -18, 5);
        ctx.fillStyle = gCol;
        ctx.font = '800 9px "Orbitron", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(isUpper ? '▲ UP' : '▼ DOWN', 0, -34);
        ctx.restore();
      };
      drawGateOption(bgGate.topCity, 168, true);
      drawGateOption(bgGate.bottomCity, 382, false);

      // Floating Trivia Clue Banner below Compass Bar!
      ctx.save();
      const promptTxt = tr('blitzGatePrompt', { clue: bgGate.clue });
      ctx.font = '800 12px "Orbitron", system-ui, sans-serif';
      const pw = Math.min(VW - 64, ctx.measureText(promptTxt).width + 44);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect((VW - pw) / 2, 68, pw, 32, 16); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#fde047';
      ctx.textAlign = 'center';
      ctx.fillText(promptTxt, VW / 2, 88);
      ctx.restore();
    }

    // 4B Sky Rings
    state.rings.forEach((rg) => {
      ctx.save();
      ctx.strokeStyle = rg.passed ? '#10b981' : rg.color;
      ctx.shadowColor = rg.passed ? '#10b981' : rg.color;
      ctx.shadowBlur = 18;
      ctx.lineWidth = rg.isTurbo ? 6.5 : 5;
      ctx.beginPath();
      ctx.ellipse(rg.x, rg.y, rg.rx, rg.ry, 0, 0, Math.PI * 2);
      ctx.stroke();
      if (rg.isTurbo && !rg.passed) {
        ctx.fillStyle = '#fde047';
        ctx.font = '900 11px "Orbitron", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('TURBO', rg.x, rg.y - rg.ry - 8);
      }
      ctx.restore();
    });

    // Collectibles, GeoVault Chests & Dual Boarding Pass Portals
    state.items.forEach((it) => {
      if (it.kind === 'coin') {
        const spinRx = Math.max(4, Math.abs(Math.cos(state.time * 4 + it.x * 0.02)) * it.r);
        REMO_AVATAR.drawRemoCoinDisc(ctx, it.x, it.y, spinRx, it.r, state.time, state.time, false);
      } else if (it.kind === 'crystal') {
        const cd = REMO_AVATAR.CRYSTAL_DEFS[it.cIdx % 4];
        REMO_AVATAR.drawCrystalShard(ctx, it.x, it.y + Math.sin(state.time * 5) * 5, 11, cd.color, cd.glow, true, 0.9);
      } else if (it.kind === 'geovault') {
        // Glowing 24K Gold & Diamond GeoVault Mystery Chest!
        ctx.save();
        const cy = it.y + Math.sin(state.time * 5) * 4;
        const g = ctx.createRadialGradient(it.x, cy, 2, it.x, cy, 34);
        g.addColorStop(0, 'rgba(254, 240, 138, 0.75)');
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(it.x, cy, 34, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = '#1e1b4b';
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.roundRect(it.x - 18, cy - 14, 36, 28, 6);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(it.x, cy, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (it.kind.startsWith('power_')) {
        const pCol = it.kind === 'power_magnet' ? '#38bdf8' : it.kind === 'power_blitz' ? '#fbbf24' : '#ec4899';
        const pIcon = it.kind === 'power_magnet' ? '🧲' : it.kind === 'power_blitz' ? '🔥' : '2X';
        ctx.save();
        const py = it.y + Math.sin(state.time * 6) * 5;
        const g = ctx.createRadialGradient(it.x, py, 2, it.x, py, 24);
        g.addColorStop(0, '#ffffff');
        g.addColorStop(0.5, pCol);
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(it.x, py, 24, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(it.x, py, 14, 0, Math.PI * 2); ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#050816';
        ctx.font = '900 11px "Orbitron", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(pIcon, it.x, py);
        ctx.restore();
      } else if (it.kind === 'portal_high' || it.kind === 'portal_low') {
        const isHigh = it.kind === 'portal_high';
        const tCity = it.targetCity || nextCity;
        const pCol = isHigh ? '#fbbf24' : '#10b981';
        ctx.save();
        ctx.translate(it.x, it.y);
        const pulse = 1 + Math.sin(state.time * 7) * 0.07;
        const gP = ctx.createRadialGradient(0, 0, 6, 0, 0, 58 * pulse);
        gP.addColorStop(0, '#ffffff');
        gP.addColorStop(0.32, pCol);
        gP.addColorStop(1, 'transparent');
        ctx.fillStyle = gP;
        ctx.beginPath(); ctx.arc(0, 0, 58 * pulse, 0, Math.PI * 2); ctx.fill();

        ctx.strokeStyle = pCol;
        ctx.lineWidth = 3.8;
        ctx.beginPath();
        ctx.ellipse(0, 0, 24 * pulse, 48 * pulse, 0, 0, Math.PI * 2);
        ctx.stroke();

        // City + Element + Perk Tag above portal!
        const tEl = REMO_DATA.REMO_ELEMENTS[tCity.element] || REMO_DATA.REMO_ELEMENTS.neon;
        ctx.fillStyle = '#050816';
        ctx.strokeStyle = pCol;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.roundRect(-72, -78, 144, 24, 12);
        ctx.fill();
        ctx.stroke();
        REMO_DATA.drawCountryFlag(ctx, tCity, -64, -73, 20, 14);
        ctx.fillStyle = '#ffffff';
        ctx.font = '800 10px "Orbitron", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`${tCity.code} ${tEl.icon} ${isHigh ? '⚡2X' : '💎+1'}`, -40, -62);
        ctx.restore();
      }
    });

    // Obstacles
    state.obstacles.forEach((o) => {
      ctx.save();
      if (o.kind === 'laser_low' || o.kind === 'barrier') {
        ctx.fillStyle = '#1e293b'; ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2;
        ctx.fillRect(o.x, o.y - o.h, 10, o.h); ctx.strokeRect(o.x, o.y - o.h, 10, o.h);
        ctx.fillRect(o.x + o.w - 10, o.y - o.h, 10, o.h); ctx.strokeRect(o.x + o.w - 10, o.y - o.h, 10, o.h);
        ctx.strokeStyle = '#f43f5e'; ctx.shadowColor = '#f43f5e'; ctx.shadowBlur = 16; ctx.lineWidth = 5;
        for (let b = 0; b < 3; b++) {
          const ly = o.y - o.h + 12 + b * 16;
          ctx.beginPath(); ctx.moveTo(o.x + 8, ly); ctx.lineTo(o.x + o.w - 8, ly); ctx.stroke();
        }
      } else if (o.kind === 'laser_high') {
        ctx.fillStyle = '#1e1b4b'; ctx.strokeStyle = '#ec4899'; ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(o.x, o.y - o.h, 14, o.h, 4);
        ctx.roundRect(o.x + o.w - 14, o.y - o.h, 14, o.h, 4);
        ctx.fill(); ctx.stroke();
        ctx.strokeStyle = '#f472b6'; ctx.shadowColor = '#ec4899'; ctx.shadowBlur = 18; ctx.lineWidth = 6;
        ctx.beginPath(); ctx.moveTo(o.x + 12, o.y - o.h * 0.5); ctx.lineTo(o.x + o.w - 12, o.y - o.h * 0.5); ctx.stroke();
      } else if (o.kind === 'spike_double') {
        ctx.fillStyle = '#9f1239'; ctx.strokeStyle = '#fda4af'; ctx.shadowColor = '#f43f5e'; ctx.shadowBlur = 14; ctx.lineWidth = 2;
        [0, o.w * 0.52].forEach((sx) => {
          ctx.beginPath();
          ctx.moveTo(o.x + sx, o.y); ctx.lineTo(o.x + sx + o.w * 0.24, o.y - o.h); ctx.lineTo(o.x + sx + o.w * 0.48, o.y);
          ctx.closePath(); ctx.fill(); ctx.stroke();
        });
      } else if (o.kind === 'prism_gate') {
        const pg = ctx.createLinearGradient(o.x, o.y - o.h, o.x + o.w, o.y);
        pg.addColorStop(0, 'rgba(125, 211, 252, 0.78)');
        pg.addColorStop(0.5, 'rgba(56, 189, 248, 0.38)');
        pg.addColorStop(1, 'rgba(168, 85, 247, 0.58)');
        ctx.fillStyle = pg; ctx.strokeStyle = '#bae6fd'; ctx.shadowColor = '#38bdf8'; ctx.shadowBlur = 16; ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(o.x + o.w * 0.5, o.y - o.h - 8); ctx.lineTo(o.x + o.w, o.y - o.h * 0.72);
        ctx.lineTo(o.x + o.w - 2, o.y); ctx.lineTo(o.x + 2, o.y); ctx.lineTo(o.x, o.y - o.h * 0.72);
        ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = '#ffffffcc'; ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(o.x + o.w * 0.3, o.y - o.h * 0.6); ctx.lineTo(o.x + o.w * 0.7, o.y - o.h * 0.42); ctx.lineTo(o.x + o.w * 0.4, o.y - o.h * 0.22);
        ctx.stroke();
      } else if (o.kind === 'speeder') {
        const sy = o.y - o.h;
        const hl = ctx.createLinearGradient(o.x, sy + 18, o.x - 110, sy + 18);
        hl.addColorStop(0, 'rgba(56, 189, 248, 0.55)'); hl.addColorStop(1, 'transparent');
        ctx.fillStyle = hl;
        ctx.beginPath(); ctx.moveTo(o.x, sy + 16); ctx.lineTo(o.x - 110, sy - 6); ctx.lineTo(o.x - 110, sy + 36); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#0f172a'; ctx.strokeStyle = '#38bdf8'; ctx.shadowColor = '#38bdf8'; ctx.shadowBlur = 14; ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(o.x, sy + 24); ctx.lineTo(o.x + 24, sy + 4); ctx.lineTo(o.x + 68, sy + 2);
        ctx.lineTo(o.x + o.w, sy + 18); ctx.lineTo(o.x + o.w - 6, o.y - 4); ctx.lineTo(o.x + 10, o.y - 4);
        ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = Math.floor(state.time * 10) % 2 === 0 ? '#f43f5e' : '#38bdf8';
        ctx.fillRect(o.x + 42, sy - 2, 14, 5);
      } else if (o.kind === 'meteor') {
        if (o.warnTimer > 0) {
          ctx.strokeStyle = Math.floor(state.time * 14) % 2 === 0 ? '#f43f5e' : '#fbbf24';
          ctx.lineWidth = 2.5;
          ctx.beginPath(); ctx.ellipse(o.targetX, GROUND_Y - 3, 28, 8, 0, 0, Math.PI * 2); ctx.stroke();
          ctx.setLineDash([6, 6]);
          ctx.beginPath(); ctx.moveTo(o.targetX + 120, 0); ctx.lineTo(o.targetX, GROUND_Y - 4); ctx.stroke();
          ctx.setLineDash([]);
        } else {
          const mg = ctx.createRadialGradient(o.x, o.y, 4, o.x, o.y, o.r * 1.6);
          mg.addColorStop(0, '#fef08a'); mg.addColorStop(0.5, '#f43f5e'); mg.addColorStop(1, 'transparent');
          ctx.fillStyle = mg; ctx.beginPath(); ctx.arc(o.x, o.y, o.r * 1.6, 0, Math.PI * 2); ctx.fill();
        }
      } else if (o.kind === 'drone') {
        const dy = o.y + Math.sin(o.bob) * 5;
        const cx = o.x + o.w / 2, cy = dy - o.h / 2;
        const coneG = ctx.createLinearGradient(cx, dy, cx, GROUND_Y);
        coneG.addColorStop(0, 'rgba(244, 63, 94, 0.34)'); coneG.addColorStop(1, 'rgba(244, 63, 94, 0)');
        ctx.fillStyle = coneG;
        ctx.beginPath(); ctx.moveTo(cx - 10, dy); ctx.lineTo(cx + 10, dy); ctx.lineTo(cx + 32, GROUND_Y); ctx.lineTo(cx - 32, GROUND_Y); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#0f172a'; ctx.strokeStyle = '#c084fc'; ctx.shadowColor = '#a855f7'; ctx.shadowBlur = 16; ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(o.x, cy); ctx.lineTo(o.x + 18, dy - o.h); ctx.lineTo(o.x + o.w, cy - 4);
        ctx.lineTo(o.x + o.w - 8, cy + 8); ctx.lineTo(o.x + 18, dy);
        ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#f43f5e'; ctx.beginPath(); ctx.arc(o.x + 16, cy, 6, 0, Math.PI * 2); ctx.fill();
      } else if (o.kind === 'pinwheel') {
        ctx.translate(o.x, o.y); ctx.rotate(o.angle);
        ctx.strokeStyle = '#f43f5e'; ctx.shadowColor = '#f43f5e'; ctx.shadowBlur = 18; ctx.lineWidth = 7;
        ctx.beginPath(); ctx.moveTo(-o.r, 0); ctx.lineTo(o.r, 0); ctx.stroke();
        ctx.fillStyle = '#fbbf24'; ctx.beginPath(); ctx.arc(0, 0, 11, 0, Math.PI * 2); ctx.fill();
      } else if (o.kind === 'storm_cloud') {
        ctx.fillStyle = 'rgba(126, 34, 206, 0.45)'; ctx.strokeStyle = '#e879f9'; ctx.shadowColor = '#a855f7'; ctx.shadowBlur = 16; ctx.lineWidth = 2.4;
        ctx.beginPath(); ctx.roundRect(o.x, o.y, o.w, o.h, 18); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#fde047'; ctx.font = '900 18px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('⚡ ⚡ ⚡', o.x + o.w / 2, o.y + 25);
      } else if (o.kind === 'void_mine' || o.kind === 'boss_orb') {
        const pr = o.r + Math.sin(o.pulse || state.time * 6) * 2.5;
        const mG = ctx.createRadialGradient(o.x, o.y, 4, o.x, o.y, pr * 1.45);
        mG.addColorStop(0, '#f43f5e'); mG.addColorStop(0.55, '#7e22ce'); mG.addColorStop(1, 'transparent');
        ctx.fillStyle = mG; ctx.beginPath(); ctx.arc(o.x, o.y, pr * 1.45, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#fda4af'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(o.x, o.y, pr * 0.72, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.restore();
    });

    // Fire & Lightning Combat Projectiles!
    state.projectiles.forEach((pr) => {
      ctx.save();
      const pg = ctx.createRadialGradient(pr.x, pr.y, 2, pr.x, pr.y, pr.r * 1.55);
      pg.addColorStop(0, '#ffffff');
      pg.addColorStop(0.35, pr.isCrit ? '#38bdf8' : '#fbbf24');
      pg.addColorStop(0.7, pr.color || '#38bdf8');
      pg.addColorStop(1, 'transparent');
      ctx.fillStyle = pg;
      ctx.beginPath(); ctx.arc(pr.x, pr.y, pr.r * 1.55, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    });

    // 4D Ascended Crystal Auto-Lightning Bolts!
    state.autoZapBeams.forEach((bm) => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, bm.life * 4);
      ctx.strokeStyle = bm.color || '#38bdf8';
      ctx.shadowColor = bm.color || '#38bdf8';
      ctx.shadowBlur = 14;
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(bm.x1, bm.y1);
      ctx.lineTo((bm.x1 + bm.x2) * 0.5, (bm.y1 + bm.y2) * 0.5 - 16);
      ctx.lineTo(bm.x2, bm.y2);
      ctx.stroke();
      ctx.restore();
    });

    // Unique Elemental City Boss Guardians + Live HP Bar + Solar Laser!
    if (state.boss && state.boss.active) {
      const b = state.boss;
      const bEl = REMO_DATA.REMO_ELEMENTS[b.element] || REMO_DATA.REMO_ELEMENTS.void;
      const isCritWeak = REMO_DATA.REMO_ELEMENTS[state.heroElement] && REMO_DATA.REMO_ELEMENTS[state.heroElement].beats === b.element;

      // Plasma / Crystal Alternating Laser Sweep
      if (b.beamWarn > 0) {
        ctx.save();
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.7)';
        ctx.setLineDash([10, 8]);
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(0, b.beamY); ctx.lineTo(b.x, b.beamY); ctx.stroke();
        ctx.restore();
      } else if (b.beamActive > 0) {
        ctx.save();
        ctx.strokeStyle = '#f43f5e';
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 22;
        ctx.lineWidth = 14;
        ctx.beginPath(); ctx.moveTo(0, b.beamY); ctx.lineTo(b.x, b.beamY); ctx.stroke();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(0, b.beamY); ctx.lineTo(b.x, b.beamY); ctx.stroke();
        ctx.restore();
      }

      ctx.save();
      ctx.translate(b.x, b.y);
      const bGlow = ctx.createRadialGradient(0, 0, 12, 0, 0, 76);
      bGlow.addColorStop(0, b.hitFlash > 0 ? 'rgba(255,255,255,0.9)' : (bEl.glow || 'rgba(244,63,94,0.65)'));
      bGlow.addColorStop(0.6, 'rgba(168,85,247,0.35)');
      bGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = bGlow; ctx.beginPath(); ctx.arc(0, 0, 76, 0, Math.PI * 2); ctx.fill();

      if (b.variant === 'cyber') {
        // 3 Synchronized Cyber Drones Swarm
        [0, 2.1, 4.2].forEach((aOff) => {
          const a = state.time * 4 + aOff;
          const dx = Math.cos(a) * 32, dy = Math.sin(a) * 26;
          ctx.fillStyle = b.hitFlash > 0 ? '#fff' : '#064e3b';
          ctx.strokeStyle = '#10b981'; ctx.lineWidth = 2.4;
          ctx.beginPath(); ctx.roundRect(dx - 16, dy - 12, 32, 24, 8); ctx.fill(); ctx.stroke();
          ctx.fillStyle = '#38bdf8'; ctx.beginPath(); ctx.arc(dx, dy, 6, 0, Math.PI * 2); ctx.fill();
        });
      } else if (b.variant === 'plasma' || b.variant === 'neon') {
        // Solar Plasma Core with rotating outer corona
        ctx.rotate(state.time * 2.4);
        ctx.fillStyle = b.hitFlash > 0 ? '#fff' : '#450a0a';
        ctx.strokeStyle = bEl.color; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(0, 0, 36, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#fde047'; ctx.beginPath(); ctx.arc(0, 0, 16, 0, Math.PI * 2); ctx.fill();
      } else {
        // Void Sentinel / Crystal Titan Diamond Core
        ctx.rotate(Math.sin(state.time * 3) * 0.14);
        ctx.fillStyle = b.hitFlash > 0 ? '#ffffff' : '#090d1e';
        ctx.strokeStyle = bEl.color; ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, -46); ctx.lineTo(44, 0); ctx.lineTo(0, 46); ctx.lineTo(-44, 0);
        ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = bEl.color; ctx.beginPath(); ctx.arc(-5, 0, 14, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();

      // Boss Name + Element + Weak Tag + HP Bar
      ctx.save();
      const bw = 112;
      ctx.fillStyle = 'rgba(5, 8, 22, 0.88)';
      ctx.strokeStyle = isCritWeak ? '#38bdf8' : bEl.color;
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(b.x - bw / 2, b.y - 68, bw, 10, 5); ctx.fill(); ctx.stroke();
      ctx.fillStyle = isCritWeak ? '#38bdf8' : '#fbbf24';
      ctx.beginPath(); ctx.roundRect(b.x - bw / 2 + 2, b.y - 66, Math.max(0, (bw - 4) * (b.hp / b.maxHp)), 6, 3); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = '800 10px "Orbitron", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${bEl.icon} ${b.name}${isCritWeak ? ' (2X WEAK)' : ''}`, b.x, b.y - 75);
      ctx.restore();
    }

    // Ghost Racer Hologram (behind Player!)
    if (state.ghostEnabled && (state.phase === 'run' || state.phase === 'fly')) {
      const gp = sampleGhostAtTime(state.time);
      if (gp && typeof REMO_AVATAR.drawGhostHero === 'function') {
        REMO_AVATAR.drawGhostHero(ctx, gp, tr('ghostLbl'));
      }
    }

    // PLAYER HERO (4A <-> 4B) + Equipped Vault Auras & Skins!
    REMO_AVATAR.drawRemoHero(ctx, {
      x: state.hero.x,
      y: state.hero.y,
      scale: 1.44,
      time: state.time,
      mode: state.phase === 'fly' || state.phase === 'landing' ? 'fly' : 'run',
      morph: state.hero.morph,
      runPhase: state.hero.runPhase,
      vy: state.hero.vy,
      sliding: state.hero.slideTimer > 0,
      dashing: state.hero.dashTimer > 0,
      blinkActive: state.hero.blinkTimer > 0,
      ascendedActive: state.ascendedTimer > 0,
      invuln: state.hero.invulnTimer > 0,
      magnetActive: state.magnetTimer > 0,
      blitzActive: state.blitzTimer > 0,
      crystals: state.crystals,
      elementColor: elInfo.color,
      vipFrame: state.save.vipFrame,
      auraStyle: state.save.equippedAura || state.save.vipFrame,
      hoverSkin: state.save.equippedHoverSkin || 'gold'
    });

    // Slow-Mo Compass Lock Overlay Ring!
    if (state.phase === 'landing' && state.compassLock) {
      const cl = state.compassLock;
      const cx = VW * 0.5, cy = VH * 0.45, rad = 112;
      ctx.save();
      ctx.fillStyle = 'rgba(4, 7, 20, 0.55)';
      ctx.fillRect(0, 0, VW, VH);

      // Outer Compass Ring
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.45)';
      ctx.lineWidth = 14;
      ctx.beginPath(); ctx.arc(cx, cy, rad, -Math.PI * 0.85, -Math.PI * 0.15); ctx.stroke();

      // Glowing Emerald-Gold Sweet Zone!
      ctx.strokeStyle = '#10b981';
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 18;
      ctx.lineWidth = 18;
      ctx.beginPath();
      ctx.arc(cx, cy, rad, -Math.PI * 0.5 + cl.sweetMin, -Math.PI * 0.5 + cl.sweetMax);
      ctx.stroke();

      // Sweeping Golden Needle
      const nAng = -Math.PI * 0.5 + cl.needleAng;
      ctx.strokeStyle = '#fde047';
      ctx.shadowColor = '#fbbf24';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(nAng) * (rad + 14), cy + Math.sin(nAng) * (rad + 14));
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 18px "Orbitron", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(tr('compassPrompt'), cx, cy + 48);
      ctx.restore();
    }

    // Particles & Popups
    state.particles.forEach((pt) => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);
      ctx.fillStyle = pt.color;
      ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    });
    state.popups.forEach((pp) => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, pp.life);
      ctx.fillStyle = pp.color;
      ctx.font = `900 ${pp.size}px "Orbitron", system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(pp.text, pp.x, pp.y);
      ctx.restore();
    });

    if (state.flashAlpha > 0) {
      ctx.fillStyle = state.flashColor;
      ctx.globalAlpha = state.flashAlpha * 0.35;
      ctx.fillRect(0, 0, VW, VH);
      ctx.globalAlpha = 1;
    }

    if (state.phase === 'run' || state.phase === 'fly') {
      drawInCanvasCompassBar(city, nextCity, elInfo);
      drawActivePowerBadges();
    }

    if (state.toastTimer > 0 && state.toastText) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, state.toastTimer * 2);
      ctx.font = '800 13px "Orbitron", system-ui, sans-serif';
      ctx.fillStyle = 'rgba(5, 8, 22, 0.90)';
      ctx.strokeStyle = state.toastColor;
      ctx.lineWidth = 2;
      const tw = Math.min(VW - 80, ctx.measureText(state.toastText).width + 64);
      ctx.beginPath(); ctx.roundRect((VW - tw) / 2, 74, tw, 36, 18); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText(state.toastText, VW / 2, 97);
      ctx.restore();
    }

    ctx.restore();
  }

  function drawInCanvasCompassBar(city, nextCity, elInfo) {
    ctx.save();
    const barW = 468;
    const barX = (VW - barW) / 2;
    const barY = 14;

    ctx.fillStyle = 'rgba(5, 8, 22, 0.84)';
    ctx.strokeStyle = state.phase === 'fly' ? '#38bdf8' : 'rgba(251, 191, 36, 0.5)';
    ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.roundRect(barX, barY, barW, 44, 22); ctx.fill(); ctx.stroke();

    REMO_DATA.drawCountryFlag(ctx, city, barX + 16, barY + 14, 24, 16);
    ctx.font = '800 12px "Orbitron", system-ui, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.fillText(city.code, barX + 46, barY + 27);

    REMO_DATA.drawCountryFlag(ctx, nextCity, barX + barW - 76, barY + 14, 24, 16);
    ctx.textAlign = 'right';
    ctx.fillStyle = state.phase === 'fly' ? '#7dd3fc' : '#fde047';
    ctx.fillText(nextCity.code, barX + barW - 14, barY + 27);

    const tX = barX + 102, tW = barW - 204, tY = barY + 29;
    ctx.fillStyle = 'rgba(255,255,255,0.14)';
    ctx.fillRect(tX, tY, tW, 5);
    const prog = Math.max(0, Math.min(1, state.sectorProgress));
    const fillG = ctx.createLinearGradient(tX, tY, tX + tW, tY);
    fillG.addColorStop(0, elInfo.color); fillG.addColorStop(1, '#fbbf24');
    ctx.fillStyle = fillG;
    ctx.fillRect(tX, tY, tW * prog, 5);

    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(tX + tW * prog, tY + 2.5, 5, 0, Math.PI * 2); ctx.fill();

    ctx.textAlign = 'center';
    ctx.font = '800 10px "Orbitron", system-ui, sans-serif';
    ctx.fillStyle = state.phase === 'fly' ? '#38bdf8' : elInfo.color;
    const dailyTag = state.gameMode === 'daily' ? ` (${state.routeIds.length}/5)` : '';
    const ck = REMO_DATA.getCityLocalClock ? REMO_DATA.getCityLocalClock(city) : null;
    const lw = getEffectiveWeather(city);
    const liveInfo = ck
      ? ` · ${ck.icon}${ck.clockStr}${lw && lw.tempC !== null ? ` ${lw.tempC}°C` : ''}`
      : '';
    const tag = state.phase === 'fly'
      ? `✈️ ${state.legKm.toLocaleString()} KM · ${tr('flyModeTag')}${dailyTag}`
      : `${elInfo.icon} ${REMO_DATA.getCityLabel(city, state.lang).toUpperCase()}${dailyTag}${liveInfo}`;
    ctx.fillText(tag, VW / 2, barY + 17);
    ctx.restore();
  }

  function drawActivePowerBadges() {
    const badges = [];
    const hEl = REMO_DATA.REMO_ELEMENTS[state.heroElement];
    if (hEl) badges.push({ lbl: `${hEl.icon} ${(state.lang === 'fr' ? hEl.name_fr : hEl.name_en).toUpperCase()}`, col: hEl.color });
    if (state.torchActive) badges.push({ lbl: `🔥 TORCH 3X`, col: '#fbbf24' });
    if (state.cardChampionBuff) badges.push({ lbl: `👑 +15%`, col: '#fde047' });
    if (state.ascendedTimer > 0) badges.push({ lbl: `🌟 4D ${state.ascendedTimer.toFixed(0)}s`, col: '#fde047' });
    if (state.chronoRiftTimer > 0) badges.push({ lbl: `⏳ 3X ${state.chronoRiftTimer.toFixed(0)}s`, col: '#e879f9' });
    if (state.magnetTimer > 0) badges.push({ lbl: `🧲 ${state.magnetTimer.toFixed(0)}s`, col: '#38bdf8' });
    if (state.blitzTimer > 0) badges.push({ lbl: `🔥 ${state.blitzTimer.toFixed(0)}s`, col: '#fbbf24' });
    if (state.prismTimer > 0) badges.push({ lbl: `💎 2X ${state.prismTimer.toFixed(0)}s`, col: '#ec4899' });
    if (state.feverActive) badges.push({ lbl: `🌈 FEVER`, col: '#a855f7' });

    ctx.save();
    badges.slice(0, 4).forEach((b, idx) => {
      const bx = 18 + idx * 88, by = 16;
      ctx.fillStyle = 'rgba(5, 8, 22, 0.85)';
      ctx.strokeStyle = b.col; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(bx, by, 80, 26, 13); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.font = '800 10px "Orbitron", sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(b.lbl, bx + 40, by + 17);
    });

    if (state.cityFmEnabled && state.activeFmStation) {
      const fmTxt = tr('fmNowPlaying', { name: state.activeFmStation });
      ctx.font = '800 10px "Orbitron", sans-serif';
      const fw = Math.min(300, ctx.measureText(fmTxt).width + 26);
      ctx.fillStyle = 'rgba(5, 8, 22, 0.82)';
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.roundRect(18, VH - 38, fw, 24, 12); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#fde68a';
      ctx.textAlign = 'left';
      ctx.fillText(fmTxt, 30, VH - 22);
    }
    ctx.restore();
  }

  /* ── HUD & Bilingual UI Synchronization ── */
  function updateHudDom() {
    const scEl = document.getElementById('hudScore');
    const cnEl = document.getElementById('hudCoins');
    const kmEl = document.getElementById('hudKm');
    const ctEl = document.getElementById('hudCities');
    const mlEl = document.getElementById('hudMult');
    const nvBar = document.getElementById('hudNovaFill');
    const nvBtn = document.getElementById('btnNovaTouch');
    const nvTxt = document.getElementById('btnNovaTouchTxt');
    const blBtn = document.getElementById('btnBlastTouch');
    const bkBtn = document.getElementById('btnBlinkTouch');

    if (scEl) scEl.textContent = state.score.toLocaleString();
    if (cnEl) cnEl.textContent = `${state.coins} 🪙`;
    if (kmEl) kmEl.textContent = `${state.kmFlown.toLocaleString()} km`;
    if (ctEl) ctEl.textContent = state.gameMode === 'daily' ? `${state.routeIds.length}/5` : `${state.routeIds.length}`;
    if (mlEl) mlEl.textContent = `x${state.multiplier}${state.surgeActive ? '⚡2' : ''}${state.chronoRiftTimer > 0 ? '·3X' : ''}`;
    if (nvBar) nvBar.style.width = `${Math.min(100, Math.round(state.novaCharge))}%`;
    if (nvBtn) {
      nvBtn.classList.toggle('ready', state.novaCharge >= 100);
      nvBtn.disabled = state.novaCharge < 100;
    }
    if (nvTxt) {
      nvTxt.textContent = state.novaCharge >= 100
        ? tr('novaReady')
        : tr('novaChargeLbl', { pct: Math.round(state.novaCharge) });
    }
    if (blBtn) {
      const ready = state.blastCooldown <= 0;
      blBtn.classList.toggle('ready', ready);
      blBtn.textContent = ready ? tr('blastBtnReady') : tr('blastBtnCd', { s: state.blastCooldown.toFixed(1) });
    }
    if (bkBtn) {
      const ready = state.blinkCooldown <= 0;
      bkBtn.classList.toggle('ready', ready);
      bkBtn.textContent = ready ? tr('blinkBtnReady') : tr('blinkBtnCd', { s: state.blinkCooldown.toFixed(1) });
    }

    for (let i = 0; i < 4; i++) {
      const pip = document.getElementById('hudCrystal_' + i);
      if (pip) pip.classList.toggle('active', i < state.crystals);
    }
  }

  function syncOverlays() {
    const startOv = document.getElementById('menuOverlay');
    const pauseOv = document.getElementById('pauseOverlay');
    const overOv = document.getElementById('gameoverOverlay');
    const touchBar = document.getElementById('mobileControlsBar');

    if (startOv) startOv.classList.toggle('open', state.phase === 'menu');
    if (pauseOv) pauseOv.classList.toggle('open', state.phase === 'paused');
    if (overOv) overOv.classList.toggle('open', state.phase === 'gameover');
    if (touchBar) touchBar.style.display = (state.phase === 'run' || state.phase === 'fly' || state.phase === 'landing') ? 'flex' : 'none';
  }

  function setMenuTab(tab) {
    state.menuTab = tab === 'shop' ? 'shop' : 'play';
    const playPane = document.getElementById('menuTabPlay');
    const shopPane = document.getElementById('menuTabShop');
    document.getElementById('tabBtnPlay')?.classList.toggle('active', state.menuTab === 'play');
    document.getElementById('tabBtnShop')?.classList.toggle('active', state.menuTab === 'shop');
    if (playPane) playPane.style.display = state.menuTab === 'play' ? 'flex' : 'none';
    if (shopPane) shopPane.style.display = state.menuTab === 'shop' ? 'flex' : 'none';
    if (state.menuTab === 'shop') renderVaultShop();
  }

  function buyOrEquipShopItem(itemId) {
    const item = VAULT_SHOP_ITEMS.find((x) => x.id === itemId);
    if (!item) return;
    const s = state.save;
    if (item.kind === 'upgrade') {
      const lv = (s.upgrades && s.upgrades[item.key]) || 0;
      if (lv >= item.maxLv) return;
      const cost = item.prices[lv];
      if ((s.totalCoins || 0) < cost) return;
      s.totalCoins -= cost;
      s.upgrades[item.key] = lv + 1;
      REMO_SFX.shopBuy();
    } else {
      const owned = (s.unlockedItems || []).includes(item.id) || item.price === 0;
      if (!owned) {
        if ((s.totalCoins || 0) < item.price) return;
        s.totalCoins -= item.price;
        s.unlockedItems.push(item.id);
        REMO_SFX.shopBuy();
      } else {
        REMO_SFX.coin(2);
      }
      if (item.cat === 'hoverSkin') s.equippedHoverSkin = item.val;
      else if (item.cat === 'aura') {
        s.equippedAura = item.val;
        s.vipFrame = item.val;
        const vipSel = document.getElementById('vipFrameSelect');
        if (vipSel) vipSel.value = item.val;
      }
    }
    writeSave(s);
    renderVaultShop();
    renderLocalProgressBoard();
  }

  function renderVaultShop() {
    const grid = document.getElementById('shopItemsGrid');
    const bal = document.getElementById('shopCoinBalance');
    if (bal) bal.textContent = `${Number(state.save.totalCoins || 0).toLocaleString()} 🪙`;
    if (!grid) return;

    const coins = Number(state.save.totalCoins || 0);
    grid.innerHTML = VAULT_SHOP_ITEMS.map((item) => {
      const title = state.lang === 'fr' ? item.name_fr : item.name_en;
      const desc = state.lang === 'fr' ? item.desc_fr : item.desc_en;
      if (item.kind === 'upgrade') {
        const lv = (state.save.upgrades && state.save.upgrades[item.key]) || 0;
        const isMax = lv >= item.maxLv;
        const cost = isMax ? 0 : item.prices[lv];
        const canBuy = !isMax && coins >= cost;
        return `
          <div class="shop-card">
            <div class="shop-card-top"><span>${item.icon} ${title}</span><b style="color:var(--cyan);">Lv.${lv}/${item.maxLv}</b></div>
            <div class="shop-card-desc">${desc}</div>
            <button type="button" class="shop-action-btn ${isMax ? 'equipped' : ''}" data-shop-id="${item.id}" ${!canBuy && !isMax ? 'disabled' : ''}>
              ${isMax ? tr('shopMax') : `${tr('shopBuy')} · ${cost} 🪙`}
            </button>
          </div>
        `;
      }
      const owned = (state.save.unlockedItems || []).includes(item.id) || item.price === 0;
      const equipped = item.cat === 'hoverSkin'
        ? (state.save.equippedHoverSkin || 'gold') === item.val
        : (state.save.equippedAura || state.save.vipFrame) === item.val;
      const canBuy = owned || coins >= item.price;
      const cls = equipped ? 'equipped' : (owned ? 'equip' : '');
      const lbl = equipped ? tr('shopEquipped') : (owned ? tr('shopEquip') : `${tr('shopBuy')} · ${item.price} 🪙`);
      return `
        <div class="shop-card ${equipped ? 'equipped' : ''}">
          <div class="shop-card-top"><span>${item.icon} ${title}</span></div>
          <div class="shop-card-desc">${desc}</div>
          <button type="button" class="shop-action-btn ${cls}" data-shop-id="${item.id}" ${!canBuy || equipped ? 'disabled' : ''}>
            ${lbl}
          </button>
        </div>
      `;
    }).join('');

    grid.querySelectorAll('.shop-action-btn').forEach((btn) => {
      btn.addEventListener('click', () => buyOrEquipShopItem(btn.dataset.shopId));
    });
  }

  function matchContinentFilter(city, filter) {
    if (!filter || filter === 'ALL') return true;
    if (filter === 'EU') return city.continent === 'Europe';
    if (filter === 'AM') return city.continent === 'North America' || city.continent === 'South America';
    if (filter === 'AS') return city.continent === 'Asia';
    return ['Middle East', 'Africa', 'Oceania'].includes(city.continent);
  }

  function applyFullLanguageRefresh() {
    document.documentElement.lang = state.lang;
    if (!state.dailyInfo) state.dailyInfo = getDailyInfo();
    const set = (id, txt) => {
      const el = document.getElementById(id);
      if (el) el.textContent = txt;
    };

    set('hudBrandSub', tr('brandSub'));
    set('lblHudScore', tr('hudScore'));
    set('lblHudCoins', tr('hudCoins'));
    set('lblHudCities', tr('hudCities'));
    set('lblHudDistance', tr('hudDistance'));
    set('lblHudMult', tr('hudMult'));
    set('btnGhostToggle', state.ghostEnabled ? tr('ghostOn') : tr('ghostOff'));
    const fmBtn = document.getElementById('btnCityFmToggle');
    if (fmBtn) {
      fmBtn.textContent = state.cityFmEnabled ? tr('fmOn') : tr('fmOff');
      fmBtn.classList.toggle('fm-on', state.cityFmEnabled);
    }

    set('menuTitle', tr('title'));
    set('menuSubtitle', tr('subtitle'));
    set('menuDesc', tr('desc'));
    set('tabBtnPlay', tr('tabPlay'));
    set('tabBtnShop', tr('tabShop'));
    set('btnModeTour', tr('modeTour'));
    set('btnModeDaily', tr('modeDaily', { num: state.dailyInfo.num }));
    set('lblPickCity', tr('pickCity'));
    set('lblVipAura', tr('vipStyle'));
    set('btnStartOdyssey', tr('startBtn'));
    set('lblControlsHint', tr('controlsHint'));
    set('lblLeaderboardTitle', tr('leaderboardTitle'));
    set('lblStampsTitle', tr('stampsTitle'));
    set('lblRelicsTitle', tr('relicsTitle'));
    set('lblVaultBankTitle', tr('vaultBankTitle'));
    set('lblShopHeadline', tr('shopHeadline'));
    set('artTag4A', tr('artTag4A'));
    set('artTag4B', tr('artTag4B'));

    set('pauseTitle', tr('paused'));
    set('btnResumeGame', tr('resumeBtn'));
    set('btnQuitToMenu', tr('quitBtn'));

    set('btnJumpTouch', tr('jumpBtn'));
    set('btnDashTouch', tr('dashBtn'));

    set('overKpiCitiesLbl', tr('overCitiesLbl'));
    set('overKpiDistLbl', tr('overDistLbl'));
    set('overKpiCoinsLbl', tr('overCoinsLbl'));
    set('btnPlayAgain', tr('playAgain'));
    set('btnBackMenu', tr('changeCityBtn'));
    set('btnOpenShareCard', tr('shareCardBtn'));
    set('btnCopyDuelLink', tr('copyDuelBtn'));
    set('btnCopyDailyWordle', tr('copyDailyBtn'));
    const isLoggedHost = Boolean(state.hostContext && state.hostContext.isGuest === false);
    set('btnDropFeedChallenge', tr(isLoggedHost ? 'dropFeedBtnLoggedIn' : 'dropFeedBtn'));

    const duelBox = document.getElementById('menuDuelBanner');
    if (duelBox) {
      if (state.duelChallenge) {
        duelBox.style.display = 'block';
        duelBox.textContent = tr('challengeBanner', {
          vs: state.duelChallenge.vs,
          target: Number(state.duelChallenge.target || 0).toLocaleString()
        });
      } else {
        duelBox.style.display = 'none';
      }
    }

    document.querySelectorAll('.lang-pill').forEach((b) => {
      b.classList.toggle('active', b.dataset.lang === state.lang);
    });

    syncModeSelectorUI();
    renderCityPicker();
    renderVaultShop();
    renderLocalProgressBoard();
    if (state.lastSummary && state.phase === 'gameover') {
      renderGameOverModal(state.lastSummary);
    }
    updateHudDom();
  }

  function syncModeSelectorUI() {
    const isDaily = state.gameMode === 'daily';
    document.getElementById('btnModeTour')?.classList.toggle('active', !isDaily);
    document.getElementById('btnModeDaily')?.classList.toggle('active', isDaily);
    const pickerWrap = document.getElementById('cityPickerWrap');
    const dailyPrev = document.getElementById('dailyRoutePreview');
    if (pickerWrap) pickerWrap.style.display = isDaily ? 'none' : 'block';
    if (dailyPrev && state.dailyInfo) {
      dailyPrev.style.display = isDaily ? 'flex' : 'none';
      const itemsHtml = state.dailyInfo.route.map((c) => {
        const f = getFlagDataUri(c);
        return `<span style="display:inline-flex;align-items:center;gap:4px;">${f ? `<img class="flag-img" src="${f}" alt="${c.countryIso}">` : ''}${c.code}</span>`;
      }).join(' ➔ ');
      dailyPrev.innerHTML = `<span style="color:#fff;">${tr('dailyRoutePreview')}</span> ${itemsHtml}`;
    }
  }

  function renderCityPicker() {
    const contBar = document.getElementById('passportContinentBar');
    if (contBar) {
      const tabs = [
        ['ALL', tr('contAll')],
        ['EU', tr('contEU')],
        ['AM', tr('contAM')],
        ['AS', tr('contAS')],
        ['MEAF', tr('contMEAF')]
      ];
      contBar.innerHTML = tabs.map(([id, lbl]) => `
        <button type="button" class="cont-pill ${state.passportContinent === id ? 'active' : ''}" data-cont="${id}">${lbl}</button>
      `).join('');
      contBar.querySelectorAll('.cont-pill').forEach((b) => {
        b.addEventListener('click', () => {
          state.passportContinent = b.dataset.cont;
          renderCityPicker();
        });
      });
    }

    const grid = document.getElementById('cityPickerGrid');
    if (!grid) return;
    const selId = state.save.startCityId || 'chisinau';
    const relics = state.save.relics || [];
    const torchId = getTorchCityId();
    const list = REMO_DATA.REMO_CITIES.filter((c) => matchContinentFilter(c, state.passportContinent));
    grid.innerHTML = list.map((c) => {
      const el = REMO_DATA.REMO_ELEMENTS[c.element];
      const active = c.id === selId;
      const unlocked = (state.save.unlockedCities || []).includes(c.id);
      const hasRelic = relics.includes(c.id);
      const isTorch = c.id === torchId;
      const flagUri = getFlagDataUri(c);
      return `
        <button type="button" class="city-chip ${active ? 'selected' : ''}" data-city="${c.id}" style="--c:${c.themeColor};">
          ${flagUri ? `<img class="flag-img" src="${flagUri}" alt="${c.countryIso}">` : ''}
          <span class="cn">${REMO_DATA.getCityLabel(c, state.lang)}</span>
          <span class="ce">${isTorch ? '🔥' : ''}${el.icon}${hasRelic ? '👑' : (unlocked ? '' : ' 🔒')}</span>
        </button>
      `;
    }).join('');
    grid.querySelectorAll('.city-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.save.startCityId = btn.dataset.city;
        writeSave(state.save);
        renderCityPicker();
        getCityPhoto(state.save.startCityId);
        REMO_SFX.coin(1);
      });
    });
  }

  function renderLocalProgressBoard() {
    const lb = document.getElementById('localBestList');
    if (lb) {
      const hist = state.save.history || [];
      lb.innerHTML = hist.length
        ? hist.slice(0, 5).map((h, i) => {
            const c = REMO_DATA.getCityById(h.startId || 'chisinau');
            const fUri = getFlagDataUri(c);
            const cLbl = state.lang === 'fr' ? 'villes' : 'cities';
            return `
              <div class="lb-row">
                <span style="display:flex;align-items:center;gap:5px;">
                  ${['🥇', '🥈', '🥉', '4.', '5.'][i]}
                  ${fUri ? `<img class="flag-img" src="${fUri}" alt="${c.countryIso}">` : ''}
                  ${h.cities} ${cLbl} · ${h.km} km
                </span>
                <b>${Number(h.score).toLocaleString()}</b>
              </div>
            `;
          }).join('')
        : `<div class="lb-empty">${tr('noRunsYet')}</div>`;
    }

    const stEl = document.getElementById('unlockedStampsCount');
    if (stEl) {
      stEl.textContent = `${(state.save.unlockedCities || []).length} / ${REMO_DATA.REMO_CITIES.length}`;
    }
    const relEl = document.getElementById('menuRelicsCount');
    if (relEl) {
      relEl.textContent = `${(state.save.relics || []).length} / ${REMO_DATA.REMO_CITIES.length}`;
    }
    const walEl = document.getElementById('menuWalletCoins');
    if (walEl) {
      walEl.textContent = `${Number(state.save.totalCoins || 0).toLocaleString()} 🪙`;
    }
  }

  function buildWordleDailyText(summary) {
    const route = (state.dailyInfo && state.dailyInfo.route) || [];
    const blocks = route.map((c, idx) => (idx < summary.citiesCount ? '🟩' : '🟥')).join(' ');
    const codes = summary.routeIds.map((id) => REMO_DATA.getCityById(id).code).join(' → ');
    const header = state.lang === 'fr'
      ? `🧭 REMO ODYSSEY · Odyssée du Jour #${summary.dailyNum}`
      : `🧭 REMO ODYSSEY · Daily Odyssey #${summary.dailyNum}`;
    const line2 = state.lang === 'fr'
      ? `Score : ${summary.score.toLocaleString()} pts · ${summary.citiesCount}/5 Villes · ${summary.kmFlown.toLocaleString()} km`
      : `Score: ${summary.score.toLocaleString()} pts · ${summary.citiesCount}/5 Cities · ${summary.kmFlown.toLocaleString()} km`;
    return `${header}\n${line2}\n${blocks} (${codes})\nhttps://remoworld.com/odyssey.html`;
  }

  function renderGameOverModal(summary) {
    const set = (id, txt) => {
      const el = document.getElementById(id);
      if (el) el.textContent = txt;
    };
    set('overTitle', summary.dailyWon ? tr('dailyVictoryTitle') : tr('gameOverTitle'));
    set('overScore', Number(summary.score).toLocaleString());
    set('overCities', summary.isDaily ? `${summary.citiesCount}/5` : `${summary.citiesCount}`);
    set('overKm', `${summary.kmFlown.toLocaleString()} km`);
    set('overCoins', `+${summary.coinsEarned} 🪙`);
    set('btnPlayAgain', tr('playAgain'));
    set('btnOpenShareCard', tr('shareCardBtn'));
    set('btnCopyDuelLink', tr('copyDuelBtn'));

    const badge = document.getElementById('overBadgeRow');
    if (badge) {
      if (state.duelChallenge) {
        const won = summary.score > state.duelChallenge.target;
        badge.textContent = won
          ? tr('challengeWon', { vs: state.duelChallenge.vs })
          : tr('challengeLost', { vs: state.duelChallenge.vs, diff: (state.duelChallenge.target - summary.score + 1).toLocaleString() });
        badge.className = 'over-badge ' + (won ? 'win' : 'duel');
      } else if (summary.isNewBest) {
        badge.textContent = tr('newBest');
        badge.className = 'over-badge win';
      } else {
        badge.textContent = `${tr('bestPrefix')}: ${Number(state.save.bestScore || 0).toLocaleString()} pts`;
        badge.className = 'over-badge';
      }
    }

    const chain = document.getElementById('overRouteChain');
    if (chain) {
      chain.innerHTML = summary.routeIds.map((id) => {
        const c = REMO_DATA.getCityById(id);
        const fUri = getFlagDataUri(c);
        return `<span class="route-pill" style="border-color:${c.themeColor};">${fUri ? `<img class="flag-img" src="${fUri}" alt="${c.countryIso}">` : ''} ${c.code}</span>`;
      }).join('<span class="route-arr">➔</span>');
    }

    const warBanner = document.getElementById('overCityWarBanner');
    if (warBanner) {
      const sCity = REMO_DATA.getCityById(summary.startCityId);
      const fUri = getFlagDataUri(sCity);
      warBanner.style.display = 'flex';
      warBanner.innerHTML = `${fUri ? `<img class="flag-img" src="${fUri}" alt="${sCity.countryIso}">` : ''}<span>${tr('cityWarBanner', { pts: summary.cityWarPoints || 0, city: REMO_DATA.getCityLabel(sCity, state.lang).toUpperCase() })}</span>`;
    }
    const isLoggedHost = Boolean(state.hostContext && state.hostContext.isGuest === false);
    set('btnDropFeedChallenge', tr(isLoggedHost ? 'dropFeedBtnLoggedIn' : 'dropFeedBtn'));

    // Daily Wordle Box & Button
    const wBox = document.getElementById('dailyWordleBox');
    const wBtn = document.getElementById('btnCopyDailyWordle');
    if (wBox && wBtn) {
      if (summary.isDaily && state.dailyInfo) {
        const blocks = state.dailyInfo.route.map((c, idx) => (idx < summary.citiesCount ? '🟩' : '🟥')).join(' ');
        wBox.style.display = 'flex';
        wBox.textContent = `📅 #${summary.dailyNum} · ${blocks}`;
        wBtn.style.display = 'inline-block';
      } else {
        wBox.style.display = 'none';
        wBtn.style.display = 'none';
      }
    }

    renderLocalProgressBoard();
  }

  function openShareCardModal() {
    if (!state.lastSummary) return;
    const modal = document.getElementById('shareCardModal');
    const preview = document.getElementById('shareCardPreviewImg');
    const dlBtn = document.getElementById('btnDownloadStoryPng');
    const clBtn = document.getElementById('btnCloseShareModal');
    if (!modal || !preview) return;

    const cardCv = REMO_SHARE.renderStoryCardCanvas(state.lastSummary, state.lang);
    const dataUrl = cardCv.toDataURL('image/png');
    preview.src = dataUrl;
    if (dlBtn) {
      dlBtn.textContent = tr('downloadBtn');
      dlBtn.onclick = () => {
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `REMO-Odyssey-${state.lastSummary.score}.png`;
        a.click();
      };
    }
    if (clBtn) clBtn.textContent = tr('closeBtn');
    modal.classList.add('open');
  }

  function copyTextWithFallback(txt) {
    const showCopied = () => {
      const toast = document.getElementById('duelCopiedMsg');
      if (toast) {
        toast.textContent = tr('duelCopied');
        toast.style.opacity = '1';
        setTimeout(() => { toast.style.opacity = '0'; }, 2800);
      }
    };
    const fallbackCopy = () => {
      try {
        const ta = document.createElement('textarea');
        ta.value = txt;
        ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        showCopied();
      } catch (e) {
        if (typeof global.prompt === 'function') global.prompt('Copy:', txt);
      }
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).then(showCopied).catch(fallbackCopy);
    } else {
      fallbackCopy();
    }
  }

  function copyDuelLink() {
    if (!state.lastSummary) return;
    copyTextWithFallback(REMO_SHARE.buildChallengeUrl(state.lastSummary));
  }

  function copyDailyWordle() {
    if (!state.lastSummary) return;
    copyTextWithFallback(buildWordleDailyText(state.lastSummary));
  }

  function loop(ts) {
    if (!lastTs) lastTs = ts;
    const dt = Math.min(0.05, Math.max(0.001, (ts - lastTs) / 1000));
    lastTs = ts;

    update(dt);
    render();
    updateHudDom();

    rafId = global.requestAnimationFrame(loop);
  }

  function getAudioContextState() {
    return {
      phase: state.phase,
      fever: state.feverActive,
      fly: state.phase === 'fly',
      ascended: state.ascendedTimer > 0,
      chrono: state.chronoRiftTimer > 0,
      element: state.currentCity ? state.currentCity.element : 'neon'
    };
  }

  function bindEvents() {
    global.addEventListener('keydown', (e) => {
      state.keys[e.code] = true;
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        if (state.phase === 'run' || state.phase === 'fly' || state.phase === 'landing') {
          e.preventDefault();
          actionJump();
        }
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        if (state.phase === 'run' || state.phase === 'fly' || state.phase === 'landing') {
          e.preventDefault();
          actionDashOrSlide();
        }
      } else if (e.code === 'KeyQ') {
        if (state.phase === 'run' || state.phase === 'fly' || state.phase === 'landing') {
          e.preventDefault();
          actionBlink();
        }
      } else if (e.code === 'KeyF') {
        if (state.phase === 'run' || state.phase === 'fly') {
          e.preventDefault();
          actionBlast();
        }
      } else if (e.code === 'KeyE' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        if (state.phase === 'run' || state.phase === 'fly') {
          e.preventDefault();
          actionNova();
        }
      } else if (e.code === 'KeyP' || e.code === 'Escape') {
        if (state.phase === 'run' || state.phase === 'fly' || state.phase === 'paused') {
          togglePause();
        }
      }
    });

    global.addEventListener('keyup', (e) => { state.keys[e.code] = false; });

    if (canvas) {
      const toVirtualY = (clientY) => {
        const rect = canvas.getBoundingClientRect();
        return ((clientY - rect.top) / Math.max(1, rect.height)) * VH;
      };
      canvas.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        actionBlast();
      });
      canvas.addEventListener('pointerdown', (e) => {
        if (e.button === 2) {
          actionBlast();
          return;
        }
        state.pointerActive = true;
        state.pointerY = toVirtualY(e.clientY);
        state.touchStartY = e.clientY;
        if (state.phase === 'run' || state.phase === 'landing') actionJump();
      });
      canvas.addEventListener('pointermove', (e) => {
        state.pointerY = toVirtualY(e.clientY);
        if (state.phase === 'run' && state.touchStartY !== null && e.clientY - state.touchStartY > 36) {
          state.touchStartY = null;
          actionDashOrSlide();
        }
      });
      global.addEventListener('pointerup', () => {
        state.pointerActive = false;
        state.touchStartY = null;
      });
    }

    global.addEventListener('message', (e) => {
      if (!e || !e.data || typeof e.data !== 'object') return;
      if (e.data.type === 'REMO_GYRO_TILT' && state.phase === 'fly') {
        const g = Number(e.data.gamma || 0);
        state.hero.targetFlyY = Math.max(78, Math.min(VH - 64, VH * 0.48 + g * 5.2));
      } else if (e.data.type === 'REMO_SET_LANG' && (e.data.lang === 'en' || e.data.lang === 'fr')) {
        setLanguage(e.data.lang);
      } else if (e.data.type === 'REMO_HOST_CONTEXT') {
        applyHostContext(e.data.context || e.data);
      } else if (e.data.type === 'REMO_WEATHER_SYNC' && e.data.weatherMap) {
        Object.assign(state.liveWeatherMap, e.data.weatherMap);
      } else if (e.data.type === 'REMO_ODYSSEY_PAUSE') {
        REMO_SFX.stopPulse();
        stopCityFm();
        if (state.phase === 'run' || state.phase === 'fly') {
          state.phaseBeforePause = state.phase;
          state.phase = 'paused';
          syncOverlays();
        }
      }
    });
  }

  function setLanguage(lang) {
    state.lang = lang === 'fr' ? 'fr' : 'en';
    try { localStorage.setItem(LANG_KEY, state.lang); } catch (e) {}
    applyFullLanguageRefresh();
  }

  function init() {
    canvas = document.getElementById('remoGameCanvas');
    if (!canvas) return;
    canvas.width = VW;
    canvas.height = VH;
    ctx = canvas.getContext('2d');

    state.dailyInfo = getDailyInfo();
    state.torchCityId = getTorchCityId();
    state.ghostEnabled = state.save.ghostEnabled !== false;
    state.cityFmEnabled = Boolean(state.save.cityFmEnabled);
    initBackdropEntities();

    const params = new URLSearchParams(global.location.search || '');
    const pTarget = Number(params.get('target') || 0);
    const pVs = params.get('vs');
    const pSeed = params.get('seed');
    const pStart = params.get('start');
    const pMode = params.get('mode');
    if (pMode === 'daily') {
      state.gameMode = 'daily';
    }
    if (pTarget > 0 && pSeed) {
      state.duelChallenge = {
        vs: pVs || 'Champion',
        target: pTarget,
        seed: pSeed,
        start: pStart || 'chisinau'
      };
      state.save.startCityId = state.duelChallenge.start;
    } else if (pStart && REMO_DATA.REMO_CITIES.some((c) => c.id === pStart)) {
      state.save.startCityId = pStart;
    }

    document.getElementById('tabBtnPlay')?.addEventListener('click', () => setMenuTab('play'));
    document.getElementById('tabBtnShop')?.addEventListener('click', () => setMenuTab('shop'));

    document.getElementById('btnModeTour')?.addEventListener('click', () => {
      state.gameMode = 'tour';
      syncModeSelectorUI();
    });
    document.getElementById('btnModeDaily')?.addEventListener('click', () => {
      state.gameMode = 'daily';
      syncModeSelectorUI();
    });

    document.getElementById('btnCityFmToggle')?.addEventListener('click', toggleCityFm);
    document.getElementById('btnGhostToggle')?.addEventListener('click', () => {
      state.ghostEnabled = !state.ghostEnabled;
      state.save.ghostEnabled = state.ghostEnabled;
      writeSave(state.save);
      const b = document.getElementById('btnGhostToggle');
      if (b) b.textContent = state.ghostEnabled ? tr('ghostOn') : tr('ghostOff');
    });

    document.getElementById('btnStartOdyssey')?.addEventListener('click', () => startRun());
    document.getElementById('btnPlayAgain')?.addEventListener('click', () => startRun());
    document.getElementById('btnBackMenu')?.addEventListener('click', () => {
      state.phase = 'menu';
      syncOverlays();
      applyFullLanguageRefresh();
    });
    document.getElementById('btnPauseHud')?.addEventListener('click', togglePause);
    document.getElementById('btnResumeGame')?.addEventListener('click', togglePause);
    document.getElementById('btnQuitToMenu')?.addEventListener('click', () => {
      REMO_SFX.stopPulse();
      stopCityFm();
      state.phase = 'menu';
      syncOverlays();
      applyFullLanguageRefresh();
    });

    document.getElementById('btnOpenShareCard')?.addEventListener('click', openShareCardModal);
    document.getElementById('btnCopyDuelLink')?.addEventListener('click', copyDuelLink);
    document.getElementById('btnCopyDailyWordle')?.addEventListener('click', copyDailyWordle);
    document.getElementById('btnDropFeedChallenge')?.addEventListener('click', dropChallengeToRemoWorld);
    document.getElementById('btnCloseShareModal')?.addEventListener('click', () => {
      document.getElementById('shareCardModal')?.classList.remove('open');
    });

    document.getElementById('btnJumpTouch')?.addEventListener('pointerdown', (e) => { e.stopPropagation(); actionJump(); });
    document.getElementById('btnBlinkTouch')?.addEventListener('pointerdown', (e) => { e.stopPropagation(); actionBlink(); });
    document.getElementById('btnBlastTouch')?.addEventListener('pointerdown', (e) => { e.stopPropagation(); actionBlast(); });
    document.getElementById('btnDashTouch')?.addEventListener('pointerdown', (e) => { e.stopPropagation(); actionDashOrSlide(); });
    document.getElementById('btnNovaTouch')?.addEventListener('pointerdown', (e) => { e.stopPropagation(); actionNova(); });

    document.querySelectorAll('.lang-pill').forEach((btn) => {
      btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
    });

    const vipSel = document.getElementById('vipFrameSelect');
    if (vipSel) {
      vipSel.value = state.save.equippedAura || state.save.vipFrame || 'gold_fire';
      vipSel.addEventListener('change', () => {
        state.save.vipFrame = vipSel.value;
        state.save.equippedAura = vipSel.value;
        writeSave(state.save);
      });
    }

    const nameInp = document.getElementById('playerNickInput');
    if (nameInp) {
      nameInp.value = state.save.playerName || 'REMO_Explorer';
      nameInp.addEventListener('input', () => {
        state.save.playerName = nameInp.value.trim().slice(0, 20) || 'REMO_Explorer';
        writeSave(state.save);
      });
    }

    const muteBtn = document.getElementById('btnMuteHud');
    if (muteBtn) {
      muteBtn.addEventListener('click', () => {
        REMO_SFX.setMuted(!REMO_SFX.muted);
        muteBtn.textContent = REMO_SFX.muted ? '🔇' : '🔊';
        if (REMO_SFX.muted) {
          stopCityFm();
        } else if (state.phase === 'run' || state.phase === 'fly' || state.phase === 'landing') {
          if (state.cityFmEnabled) tuneCityFmForCity(state.currentCity);
          else REMO_SFX.startPulse(getAudioContextState);
        }
      });
    }

    state.currentCity = REMO_DATA.getCityById(state.save.startCityId);
    state.nextCity = pickTwoDistinctCities(state.currentCity.id)[0];
    getCityPhoto(state.currentCity.id);
    applyFullLanguageRefresh();
    syncOverlays();
    bindEvents();
    postToHost({ type: 'REMO_ODYSSEY_READY', lang: state.lang });

    if (!rafId) rafId = global.requestAnimationFrame(loop);
  }

  global.addEventListener('DOMContentLoaded', init);
  global.REMO_ODYSSEY = {
    state, startRun, actionJump, actionDashOrSlide, actionBlink, actionBlast, actionNova,
    setLanguage, setMenuTab, buyOrEquipShopItem, buildWordleDailyText,
    toggleCityFm, spawnBlitzSkyGate, applyHostContext, getEffectiveWeather, dropChallengeToRemoWorld
  };
})(window);
