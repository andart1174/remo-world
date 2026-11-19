/* ═══════════════════════════════════════════════════════════════════════════
   REMO WORLD: 4D Compass Odyssey — Master Database (24 Edition-1 Cities)
   Strictly Bilingual: English (EN) & French (FR) · Crisp Graphic Flags
   100% Compatible with remoworld.com IDs, Elements, Coordinates & Landmarks
   ═══════════════════════════════════════════════════════════════════════════ */

(function (global) {
  'use strict';

  const REMO_ELEMENTS = {
    neon:    { id: 'neon',    icon: '⚡', name_en: 'Neon',    name_fr: 'Néon',    color: '#38bdf8', glow: 'rgba(56,189,248,0.55)', beats: 'void' },
    void:    { id: 'void',    icon: '🔮', name_en: 'Void',    name_fr: 'Vide',    color: '#a855f7', glow: 'rgba(168,85,247,0.55)', beats: 'cyber' },
    cyber:   { id: 'cyber',   icon: '🌌', name_en: 'Cyber',   name_fr: 'Cyber',   color: '#10b981', glow: 'rgba(16,185,129,0.55)', beats: 'crystal' },
    crystal: { id: 'crystal', icon: '💎', name_en: 'Crystal', name_fr: 'Cristal', color: '#fbbf24', glow: 'rgba(251,191,36,0.55)', beats: 'plasma' },
    plasma:  { id: 'plasma',  icon: '🔥', name_en: 'Plasma',  name_fr: 'Plasma',  color: '#f43f5e', glow: 'rgba(244,63,94,0.55)',  beats: 'neon' }
  };

  const REMO_CITIES = [
    {
      id: 'chisinau', code: 'KIV', countryIso: 'MD', flag: '🇲🇩', continent: 'Europe',
      name_en: 'Chișinău', name_fr: 'Chișinău',
      tagline_en: 'City Gates & Triumphal Arch', tagline_fr: 'Portes de la Ville & Arc de Triomphe',
      lat: 47.0105, lng: 28.8638, themeColor: '#fbbf24', skyTop: '#160d29', skyBot: '#31122f',
      element: 'plasma', weather: 'gold_dusk', rarity: 'Mythic 4D'
    },
    {
      id: 'bucharest', code: 'BUH', countryIso: 'RO', flag: '🇷🇴', continent: 'Europe',
      name_en: 'Bucharest', name_fr: 'Bucarest',
      tagline_en: 'Romanian Athenaeum & Cyber Pulse', tagline_fr: 'Athénée Roumain & Pôle Cyber',
      lat: 44.4268, lng: 26.1025, themeColor: '#38bdf8', skyTop: '#041226', skyBot: '#0f2847',
      element: 'cyber', weather: 'neon_grid', rarity: 'Legendary Gold'
    },
    {
      id: 'montreal', code: 'MTL', countryIso: 'CA', flag: '🇨🇦', continent: 'North America',
      name_en: 'Montréal', name_fr: 'Montréal',
      tagline_en: 'Geodesic Biosphere & Mount Royal', tagline_fr: 'Biosphère & Sommet du Mont-Royal',
      lat: 45.5017, lng: -73.5673, themeColor: '#8b5cf6', skyTop: '#0b0824', skyBot: '#1f1647',
      element: 'neon', weather: 'snow', rarity: 'Mythic 4D'
    },
    {
      id: 'paris', code: 'PAR', countryIso: 'FR', flag: '🇫🇷', continent: 'Europe',
      name_en: 'Paris', name_fr: 'Paris',
      tagline_en: 'Eiffel Tower & Crystal Rain', tagline_fr: 'Tour Eiffel & Pluie de Cristal',
      lat: 48.8566, lng: 2.3522, themeColor: '#f59e0b', skyTop: '#0f1026', skyBot: '#291f3d',
      element: 'crystal', weather: 'rain', rarity: 'Mythic 4D'
    },
    {
      id: 'tokyo', code: 'TYO', countryIso: 'JP', flag: '🇯🇵', continent: 'Asia',
      name_en: 'Tokyo', name_fr: 'Tokyo',
      tagline_en: 'Shibuya Hyper-Neon & Mt. Fuji', tagline_fr: 'Shibuya Hyper-Néon & Mont Fuji',
      lat: 35.6762, lng: 139.6503, themeColor: '#ec4899', skyTop: '#140620', skyBot: '#2e0d36',
      element: 'cyber', weather: 'rain', rarity: 'Mythic 4D'
    },
    {
      id: 'newyork', code: 'NYC', countryIso: 'US', flag: '🇺🇸', continent: 'North America',
      name_en: 'New York', name_fr: 'New York',
      tagline_en: 'Manhattan Skyline & Times Square', tagline_fr: 'Gratte-ciels de Manhattan',
      lat: 40.7128, lng: -74.0060, themeColor: '#06b6d4', skyTop: '#040b1f', skyBot: '#0e2240',
      element: 'neon', weather: 'neon_grid', rarity: 'Mythic 4D'
    },
    {
      id: 'london', code: 'LON', countryIso: 'GB', flag: '🇬🇧', continent: 'Europe',
      name_en: 'London', name_fr: 'Londres',
      tagline_en: 'Big Ben & London Eye', tagline_fr: 'Big Ben & London Eye',
      lat: 51.5072, lng: -0.1276, themeColor: '#6366f1', skyTop: '#07091e', skyBot: '#181e42',
      element: 'void', weather: 'rain', rarity: 'Legendary Gold'
    },
    {
      id: 'dubai', code: 'DXB', countryIso: 'AE', flag: '🇦🇪', continent: 'Middle East',
      name_en: 'Dubai', name_fr: 'Dubaï',
      tagline_en: 'Burj Khalifa & Desert Gold', tagline_fr: 'Burj Khalifa & Oasis du Futur',
      lat: 25.2048, lng: 55.2708, themeColor: '#eab308', skyTop: '#170f08', skyBot: '#36220c',
      element: 'plasma', weather: 'gold_dusk', rarity: 'Legendary Gold'
    },
    {
      id: 'rome', code: 'ROM', countryIso: 'IT', flag: '🇮🇹', continent: 'Europe',
      name_en: 'Rome', name_fr: 'Rome',
      tagline_en: 'Colosseum & Eternal Glory', tagline_fr: 'Colisée & Ville Éternelle',
      lat: 41.9028, lng: 12.4964, themeColor: '#d97706', skyTop: '#170d16', skyBot: '#381e1c',
      element: 'crystal', weather: 'gold_dusk', rarity: 'Legendary Gold'
    },
    {
      id: 'cairo', code: 'CAI', countryIso: 'EG', flag: '🇪🇬', continent: 'Africa',
      name_en: 'Cairo', name_fr: 'Le Caire',
      tagline_en: 'Giza Pyramids & Orion Stars', tagline_fr: 'Pyramides de Gizeh & Nil',
      lat: 30.0444, lng: 31.2357, themeColor: '#f59e0b', skyTop: '#140c1c', skyBot: '#312014',
      element: 'void', weather: 'stars', rarity: 'Legendary Gold'
    },
    {
      id: 'sydney', code: 'SYD', countryIso: 'AU', flag: '🇦🇺', continent: 'Oceania',
      name_en: 'Sydney', name_fr: 'Sydney',
      tagline_en: 'Opera Sails & Emerald Harbour', tagline_fr: 'Voiles de l’Opéra & Port',
      lat: -33.8688, lng: 151.2093, themeColor: '#0ea5e9', skyTop: '#041424', skyBot: '#0b2c3f',
      element: 'neon', weather: 'stars', rarity: 'Epic'
    },
    {
      id: 'miami', code: 'MIA', countryIso: 'US', flag: '🇺🇸', continent: 'North America',
      name_en: 'Miami', name_fr: 'Miami',
      tagline_en: 'Ocean Drive & Neon Palms', tagline_fr: 'Ocean Drive & Palmiers Néon',
      lat: 25.7617, lng: -80.1918, themeColor: '#f43f5e', skyTop: '#1a0826', skyBot: '#42123c',
      element: 'plasma', weather: 'neon_grid', rarity: 'Legendary Gold'
    },
    {
      id: 'barcelona', code: 'BCN', countryIso: 'ES', flag: '🇪🇸', continent: 'Europe',
      name_en: 'Barcelona', name_fr: 'Barcelone',
      tagline_en: 'Gaudí Spires & Mediterranean', tagline_fr: 'Sagrada Família & Soleil',
      lat: 41.3874, lng: 2.1686, themeColor: '#f97316', skyTop: '#1a0c1b', skyBot: '#3d1c16',
      element: 'plasma', weather: 'gold_dusk', rarity: 'Epic'
    },
    {
      id: 'toronto', code: 'YYZ', countryIso: 'CA', flag: '🇨🇦', continent: 'North America',
      name_en: 'Toronto', name_fr: 'Toronto',
      tagline_en: 'CN Tower & Lake Ontario', tagline_fr: 'CN Tower & Lac Ontario',
      lat: 43.6532, lng: -79.3832, themeColor: '#3b82f6', skyTop: '#050c24', skyBot: '#0f234a',
      element: 'cyber', weather: 'snow', rarity: 'Epic'
    },
    {
      id: 'monaco', code: 'MCM', countryIso: 'MC', flag: '🇲🇨', continent: 'Europe',
      name_en: 'Monaco', name_fr: 'Monaco',
      tagline_en: 'Monte Carlo & Grand Prix', tagline_fr: 'Monte Carlo & Prestige',
      lat: 43.7384, lng: 7.4246, themeColor: '#fde047', skyTop: '#0c0b24', skyBot: '#292218',
      element: 'crystal', weather: 'stars', rarity: 'Mythic 4D'
    },
    {
      id: 'losangeles', code: 'LAX', countryIso: 'US', flag: '🇺🇸', continent: 'North America',
      name_en: 'Los Angeles', name_fr: 'Los Angeles',
      tagline_en: 'Cinema Capital & Pacific Glow', tagline_fr: 'Hollywood & Crépuscule',
      lat: 34.0522, lng: -118.2437, themeColor: '#a855f7', skyTop: '#160929', skyBot: '#381845',
      element: 'neon', weather: 'gold_dusk', rarity: 'Legendary Gold'
    },
    {
      id: 'seoul', code: 'SEL', countryIso: 'KR', flag: '🇰🇷', continent: 'Asia',
      name_en: 'Seoul', name_fr: 'Séoul',
      tagline_en: 'E-Sports Arena & Gangnam', tagline_fr: 'E-Sports & Tours Gangnam',
      lat: 37.5665, lng: 126.9780, themeColor: '#14b8a6', skyTop: '#04141c', skyBot: '#0c3038',
      element: 'cyber', weather: 'neon_grid', rarity: 'Legendary Gold'
    },
    {
      id: 'geneva', code: 'GVA', countryIso: 'CH', flag: '🇨🇭', continent: 'Europe',
      name_en: 'Geneva', name_fr: 'Genève',
      tagline_en: 'Jet d’Eau & Quantum Precision', tagline_fr: 'Jet d’Eau & Science Quantique',
      lat: 46.2044, lng: 6.1432, themeColor: '#22d3ee', skyTop: '#051126', skyBot: '#0f2842',
      element: 'crystal', weather: 'snow', rarity: 'Epic'
    },
    {
      id: 'singapore', code: 'SIN', countryIso: 'SG', flag: '🇸🇬', continent: 'Asia',
      name_en: 'Singapore', name_fr: 'Singapour',
      tagline_en: 'Solar Supertrees & SkyPark', tagline_fr: 'Supertrees & Jardin Cyber',
      lat: 1.3521, lng: 103.8198, themeColor: '#10b981', skyTop: '#031614', skyBot: '#09342d',
      element: 'cyber', weather: 'rain', rarity: 'Legendary Gold'
    },
    {
      id: 'rio', code: 'RIO', countryIso: 'BR', flag: '🇧🇷', continent: 'South America',
      name_en: 'Rio de Janeiro', name_fr: 'Rio de Janeiro',
      tagline_en: 'Corcovado & Carnival Fire', tagline_fr: 'Corcovado & Carnaval',
      lat: -22.9068, lng: -43.1729, themeColor: '#eab308', skyTop: '#160d1c', skyBot: '#332412',
      element: 'plasma', weather: 'gold_dusk', rarity: 'Epic'
    },
    {
      id: 'istanbul', code: 'IST', countryIso: 'TR', flag: '🇹🇷', continent: 'Europe',
      name_en: 'Istanbul', name_fr: 'Istanbul',
      tagline_en: 'Bridge Across the Bosphorus', tagline_fr: 'Deux Continents sur le Bosphore',
      lat: 41.0082, lng: 28.9784, themeColor: '#f59e0b', skyTop: '#120a24', skyBot: '#2e1d2e',
      element: 'void', weather: 'stars', rarity: 'Epic'
    },
    {
      id: 'berlin', code: 'BER', countryIso: 'DE', flag: '🇩🇪', continent: 'Europe',
      name_en: 'Berlin', name_fr: 'Berlin',
      tagline_en: 'Brandenburg & Techno Pulse', tagline_fr: 'Brandebourg & Techno',
      lat: 52.5200, lng: 13.4050, themeColor: '#a3e635', skyTop: '#08120c', skyBot: '#15291c',
      element: 'void', weather: 'neon_grid', rarity: 'Epic'
    },
    {
      id: 'amsterdam', code: 'AMS', countryIso: 'NL', flag: '🇳🇱', continent: 'Europe',
      name_en: 'Amsterdam', name_fr: 'Amsterdam',
      tagline_en: 'Golden Canals & Night Bridges', tagline_fr: 'Canaux Dorés & Ponts',
      lat: 52.3676, lng: 4.9041, themeColor: '#fb923c', skyTop: '#0c0c20', skyBot: '#261a24',
      element: 'neon', weather: 'rain', rarity: 'Rare'
    },
    {
      id: 'lisbon', code: 'LIS', countryIso: 'PT', flag: '🇵🇹', continent: 'Europe',
      name_en: 'Lisbon', name_fr: 'Lisbonne',
      tagline_en: 'Seven Hills & Atlantic Winds', tagline_fr: 'Sept Collines & Atlantique',
      lat: 38.7223, lng: -9.1393, themeColor: '#fbbf24', skyTop: '#120f24', skyBot: '#2b2420',
      element: 'crystal', weather: 'gold_dusk', rarity: 'Rare'
    }
  ];

  const CITY_LIVE_META = {
    chisinau:   { tz: 'Europe/Chisinau',      utcOff: 2,  radio: { id: 'chisinau_kiss',      name: 'Kiss FM Chișinău',            url: 'https://live.kissfm.ro/kissfm.aacp',                                      fallback: 'https://live.magicfm.ro/magicfm.aacp' } },
    bucharest:  { tz: 'Europe/Bucharest',     utcOff: 2,  radio: { id: 'bucarest_dancefm',   name: 'Dance FM 89.5 Bucharest',     url: 'https://edge126.rdsnet.ro:84/profm/dancefm.mp3',                          fallback: 'https://live.onefm.ro/onefm.aacp' } },
    montreal:   { tz: 'America/Toronto',      utcOff: -5, radio: { id: 'montreal_cbc',       name: 'CBC Radio One Montréal',      url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/CBMEFM_CBC.mp3', fallback: 'https://icecast.radiofrance.fr/fip-midfi.mp3' } },
    paris:      { tz: 'Europe/Paris',         utcOff: 1,  radio: { id: 'paris_fip_electro',  name: 'FIP Electro French Touch',    url: 'https://icecast.radiofrance.fr/fipelectro-midfi.mp3',                     fallback: 'https://icecast.radiofrance.fr/fip-midfi.mp3' } },
    tokyo:      { tz: 'Asia/Tokyo',           utcOff: 9,  radio: { id: 'tokyo_jpop',         name: 'Tokyo J-Pop & Shibuya Live',  url: 'https://kathy.torontocast.com:3340/stream',                               fallback: 'https://radio.plaza.one/mp3' } },
    newyork:    { tz: 'America/New_York',     utcOff: -5, radio: { id: 'newyork_wnyc',       name: 'WNYC 93.9 FM New York',       url: 'https://fm939.wnyc.org/wnycfm.mp3',                                       fallback: 'https://ice1.somafm.com/seventies-128-mp3' } },
    london:     { tz: 'Europe/London',        utcOff: 0,  radio: { id: 'london_capital',     name: 'Capital FM London',           url: 'https://media-ice.musicradio.com/CapitalMP3',                             fallback: 'https://media-ssl.musicradio.com/HeartDanceMP3' } },
    dubai:      { tz: 'Asia/Dubai',           utcOff: 4,  radio: { id: 'dubai_dj',           name: 'Dubai Desert Lounge & Club',  url: 'https://listen.radioking.com/radio/623812/stream/685903',                 fallback: 'https://ice1.somafm.com/suburbsofgoa-128-mp3' } },
    rome:       { tz: 'Europe/Rome',          utcOff: 1,  radio: { id: 'roma_italia',        name: 'Roma Italia Pop',             url: 'https://icy.unitedradio.it/Subasio.mp3',                                  fallback: 'https://stream.srg-ssr.ch/m/rsi_r3/mp3_128' } },
    cairo:      { tz: 'Africa/Cairo',         utcOff: 2,  radio: { id: 'cairo_hits',         name: 'Radio Hits 88.2 Cairo',       url: 'https://radiohits882.radioca.st/;',                                       fallback: 'https://9090streaming.mobtada.com/9090FMEGYPT' } },
    sydney:     { tz: 'Australia/Sydney',     utcOff: 11, radio: { id: 'sydney_fbi',         name: 'FBi 94.5 Sydney',             url: 'https://streamer.fbiradio.com/stream',                                    fallback: 'https://sbs-ice.streamguys1.com/sbs-popasia-sbs-web' } },
    miami:      { tz: 'America/New_York',     utcOff: -5, radio: { id: 'miami_reggaeton',    name: 'Miami Latin & Reggaeton',     url: 'https://icecast.radiofrance.fr/fipworld-midfi.mp3',                       fallback: 'https://scdn.nrjaudio.fm/audio1/fr/30001/mp3_128.mp3' } },
    barcelona:  { tz: 'Europe/Madrid',        utcOff: 1,  radio: { id: 'ibiza_sunset',       name: 'Ibiza & Barcelona House',     url: 'https://radiorecord.hostingradio.ru/deep96.aacp',                         fallback: 'https://ice1.somafm.com/beatblender-128-mp3' } },
    toronto:    { tz: 'America/Toronto',      utcOff: -5, radio: { id: 'toronto_cbc',        name: 'CBC Music Toronto',           url: 'https://27033.live.streamtheworld.com/CBLFM_CBC_SC',                      fallback: 'https://ice1.somafm.com/indiepop-128-mp3' } },
    monaco:     { tz: 'Europe/Monaco',        utcOff: 1,  radio: { id: 'swiss_pop',          name: 'Monaco Riviera Pop',          url: 'https://stream.srg-ssr.ch/m/rsp/mp3_128',                                 fallback: 'https://stream.srg-ssr.ch/m/rsj/mp3_128' } },
    losangeles: { tz: 'America/Los_Angeles',  utcOff: -8, radio: { id: 'losangeles_kcrw',    name: 'KCRW Eclectic 24 L.A.',       url: 'https://streams.kcrw.com/e24_mp3',                                        fallback: 'https://streams.kcrw.com/kcrw_aac' } },
    seoul:      { tz: 'Asia/Seoul',           utcOff: 9,  radio: { id: 'seoul_kpop',         name: 'Seoul K-Pop 24/7',            url: 'https://listen.moe/kpop/stream',                                          fallback: 'https://kathy.torontocast.com:3340/stream' } },
    geneva:     { tz: 'Europe/Zurich',        utcOff: 1,  radio: { id: 'geneva_onefm',       name: 'One FM Genève',               url: 'https://onefm.ice.infomaniak.ch/onefm-high.mp3',                          fallback: 'https://radiolac.ice.infomaniak.ch/radiolac-high.mp3' } },
    singapore:  { tz: 'Asia/Singapore',       utcOff: 8,  radio: { id: 'singapore_987fm',    name: 'Singapore 987FM Live',        url: 'https://22393.live.streamtheworld.com/987FM_PREM.aac',                    fallback: 'https://ice1.somafm.com/groovesalad-128-mp3' } },
    rio:        { tz: 'America/Sao_Paulo',    utcOff: -3, radio: { id: 'rio_bossa',          name: 'Rio Bossa & Ipanema',         url: 'https://ice1.somafm.com/bossa-128-mp3',                                   fallback: 'https://icecast.radiofrance.fr/fipworld-midfi.mp3' } },
    istanbul:   { tz: 'Europe/Istanbul',      utcOff: 3,  radio: { id: 'istanbul_fenomen',   name: 'Radyo Fenomen Istanbul',      url: 'https://live.radyofenomen.com/fenomen/128/icecast.audio',                 fallback: 'https://icecast.radiofrance.fr/fipworld-midfi.mp3' } },
    berlin:     { tz: 'Europe/Berlin',        utcOff: 1,  radio: { id: 'berlin_techno',      name: 'Berlin Melodic Club',         url: 'https://streams.fluxfm.de/klubradio/mp3-128/audio/',                      fallback: 'https://ice1.somafm.com/cliqhop-128-mp3' } },
    amsterdam:  { tz: 'Europe/Amsterdam',     utcOff: 1,  radio: { id: 'amsterdam_sublime',  name: 'Sublime Amsterdam',           url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/SUBLIME.mp3', fallback: 'https://ice1.somafm.com/groovesalad-128-mp3' } },
    lisbon:     { tz: 'Europe/Lisbon',        utcOff: 0,  radio: { id: 'lisbon_comercial',   name: 'Rádio Comercial Lisboa',      url: 'https://stream-icy.bauermedia.pt/comercial.mp3',                          fallback: 'https://radiocast.rtp.pt/antena380a.mp3' } }
  };

  REMO_CITIES.forEach((c) => {
    const m = CITY_LIVE_META[c.id];
    if (m) {
      c.tz = m.tz;
      c.utcOff = m.utcOff;
      c.radio = m.radio;
    }
  });

  function getCityLocalClock(city, nowDate) {
    const d = nowDate instanceof Date ? nowDate : new Date();
    let hour = 21, minute = 0;
    try {
      if (city && city.tz && typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
        const parts = new Intl.DateTimeFormat('en-GB', {
          timeZone: city.tz,
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }).formatToParts(d);
        const hh = Number((parts.find((p) => p.type === 'hour') || {}).value);
        const mm = Number((parts.find((p) => p.type === 'minute') || {}).value);
        if (!Number.isNaN(hh) && !Number.isNaN(mm)) {
          hour = hh % 24;
          minute = mm;
        }
      } else {
        throw new Error('fallback');
      }
    } catch (e) {
      const off = (city && typeof city.utcOff === 'number') ? city.utcOff : 0;
      hour = ((d.getUTCHours() + off) % 24 + 24) % 24;
      minute = d.getUTCMinutes();
    }
    const clockStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    let period = 'night', icon = '🌙';
    if (hour >= 7 && hour < 17) { period = 'day'; icon = '☀️'; }
    else if ((hour >= 5 && hour < 7) || (hour >= 17 && hour < 20)) { period = 'sunset'; icon = '🌇'; }
    return { hour, minute, clockStr, period, icon };
  }

  function getCityById(id) {
    return REMO_CITIES.find((c) => c.id === id) || REMO_CITIES[0];
  }

  function getCityLabel(city, lang) {
    if (!city) return 'REMO';
    return lang === 'fr' ? (city.name_fr || city.name_en) : (city.name_en || city.name_fr);
  }

  function getCityTagline(city, lang) {
    if (!city) return '';
    return lang === 'fr' ? (city.tagline_fr || city.tagline_en) : (city.tagline_en || city.tagline_fr);
  }

  function haversineKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  }

  function hashStr(str) {
    let h = 2166136261 >>> 0;
    const s = String(str || 'REMO');
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function mulberry32(seed) {
    let a = (typeof seed === 'string' ? hashStr(seed) : Number(seed)) >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ── Crisp Graphic Country Flags (Canvas + Inline Data-URI SVG) ── */
  const V3 = {
    MD: ['#0046AE', '#FFD200', '#CC092F'],
    RO: ['#002B7F', '#FCD116', '#CE1126'],
    FR: ['#0055A4', '#FFFFFF', '#EF4135'],
    IT: ['#009246', '#FFFFFF', '#CE2B37']
  };
  const H3 = {
    DE: ['#000000', '#DD0000', '#FFCC00'],
    NL: ['#AE1C28', '#FFFFFF', '#21468B'],
    EG: ['#CE1126', '#FFFFFF', '#000000'],
    ES: ['#AA151B', '#F1BF00', '#AA151B']
  };

  function drawCountryFlag(ctx, cityOrIso, x, y, w, h) {
    const iso = typeof cityOrIso === 'string'
      ? cityOrIso.toUpperCase()
      : (cityOrIso && cityOrIso.countryIso ? cityOrIso.countryIso : 'MD');

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, Math.max(2, h * 0.18));
    ctx.clip();

    if (V3[iso]) {
      const cols = V3[iso];
      cols.forEach((c, i) => {
        ctx.fillStyle = c;
        ctx.fillRect(x + (w / 3) * i, y, w / 3 + 0.6, h);
      });
      if (iso === 'MD') {
        ctx.fillStyle = '#78350f';
        ctx.fillRect(x + w * 0.44, y + h * 0.34, w * 0.12, h * 0.32);
      }
    } else if (H3[iso]) {
      const cols = H3[iso];
      const heights = iso === 'ES' ? [0.25, 0.5, 0.25] : [0.334, 0.334, 0.334];
      let cy = y;
      cols.forEach((c, i) => {
        const hh = h * heights[i];
        ctx.fillStyle = c;
        ctx.fillRect(x, cy, w, hh + 0.6);
        cy += hh;
      });
      if (iso === 'EG') {
        ctx.fillStyle = '#c09300';
        ctx.fillRect(x + w * 0.44, y + h * 0.38, w * 0.12, h * 0.24);
      }
    } else if (iso === 'CA') {
      ctx.fillStyle = '#FF0000';
      ctx.fillRect(x, y, w * 0.25, h);
      ctx.fillRect(x + w * 0.75, y, w * 0.25, h);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(x + w * 0.25, y, w * 0.5, h);
      ctx.fillStyle = '#FF0000';
      ctx.beginPath();
      ctx.arc(x + w * 0.5, y + h * 0.5, h * 0.22, 0, Math.PI * 2);
      ctx.fill();
    } else if (iso === 'JP') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = '#BC002D';
      ctx.beginPath();
      ctx.arc(x + w * 0.5, y + h * 0.5, h * 0.30, 0, Math.PI * 2);
      ctx.fill();
    } else if (iso === 'US') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = '#B22234';
      for (let i = 0; i < 7; i += 2) ctx.fillRect(x, y + (h / 7) * i, w, h / 7 + 0.5);
      ctx.fillStyle = '#3C3B6E';
      ctx.fillRect(x, y, w * 0.45, h * 0.57);
    } else if (iso === 'GB' || iso === 'AU') {
      ctx.fillStyle = '#012169';
      ctx.fillRect(x, y, w, h);
      const uw = iso === 'AU' ? w * 0.48 : w;
      const uh = iso === 'AU' ? h * 0.52 : h;
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = Math.max(1.6, uh * 0.2);
      ctx.beginPath();
      ctx.moveTo(x, y); ctx.lineTo(x + uw, y + uh);
      ctx.moveTo(x + uw, y); ctx.lineTo(x, y + uh);
      ctx.moveTo(x + uw / 2, y); ctx.lineTo(x + uw / 2, y + uh);
      ctx.moveTo(x, y + uh / 2); ctx.lineTo(x + uw, y + uh / 2);
      ctx.stroke();
      ctx.strokeStyle = '#C8102E';
      ctx.lineWidth = Math.max(1, uh * 0.11);
      ctx.beginPath();
      ctx.moveTo(x + uw / 2, y); ctx.lineTo(x + uw / 2, y + uh);
      ctx.moveTo(x, y + uh / 2); ctx.lineTo(x + uw, y + uh / 2);
      ctx.stroke();
      if (iso === 'AU') {
        ctx.fillStyle = '#FFFFFF';
        [[0.75, 0.28], [0.65, 0.5], [0.85, 0.45], [0.75, 0.72]].forEach(([sx, sy]) => {
          ctx.beginPath(); ctx.arc(x + w * sx, y + h * sy, 1.3, 0, Math.PI * 2); ctx.fill();
        });
      }
    } else if (iso === 'AE') {
      ctx.fillStyle = '#00732F'; ctx.fillRect(x, y, w, h * 0.34);
      ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x, y + h * 0.33, w, h * 0.34);
      ctx.fillStyle = '#000000'; ctx.fillRect(x, y + h * 0.66, w, h * 0.34);
      ctx.fillStyle = '#FF0000'; ctx.fillRect(x, y, w * 0.26, h);
    } else if (iso === 'MC') {
      ctx.fillStyle = '#CE1126'; ctx.fillRect(x, y, w, h * 0.5);
      ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x, y + h * 0.5, w, h * 0.5);
    } else if (iso === 'CH') {
      ctx.fillStyle = '#D52B1E'; ctx.fillRect(x, y, w, h);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(x + w * 0.42, y + h * 0.22, w * 0.16, h * 0.56);
      ctx.fillRect(x + w * 0.28, y + h * 0.40, w * 0.44, h * 0.20);
    } else if (iso === 'KR') {
      ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x, y, w, h);
      ctx.fillStyle = '#CD2E3A';
      ctx.beginPath(); ctx.arc(x + w * 0.5, y + h * 0.5, h * 0.26, Math.PI, 0); ctx.fill();
      ctx.fillStyle = '#0047A0';
      ctx.beginPath(); ctx.arc(x + w * 0.5, y + h * 0.5, h * 0.26, 0, Math.PI); ctx.fill();
    } else if (iso === 'SG') {
      ctx.fillStyle = '#EF3340'; ctx.fillRect(x, y, w, h * 0.5);
      ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x, y + h * 0.5, w, h * 0.5);
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath(); ctx.arc(x + w * 0.25, y + h * 0.25, h * 0.15, 0, Math.PI * 2); ctx.fill();
    } else if (iso === 'BR') {
      ctx.fillStyle = '#009C3B'; ctx.fillRect(x, y, w, h);
      ctx.fillStyle = '#FFDF00';
      ctx.beginPath();
      ctx.moveTo(x + w * 0.5, y + h * 0.14); ctx.lineTo(x + w * 0.85, y + h * 0.5);
      ctx.lineTo(x + w * 0.5, y + h * 0.86); ctx.lineTo(x + w * 0.15, y + h * 0.5);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#002776';
      ctx.beginPath(); ctx.arc(x + w * 0.5, y + h * 0.5, h * 0.19, 0, Math.PI * 2); ctx.fill();
    } else if (iso === 'TR') {
      ctx.fillStyle = '#E30A17'; ctx.fillRect(x, y, w, h);
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath(); ctx.arc(x + w * 0.4, y + h * 0.5, h * 0.24, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#E30A17';
      ctx.beginPath(); ctx.arc(x + w * 0.45, y + h * 0.5, h * 0.19, 0, Math.PI * 2); ctx.fill();
    } else if (iso === 'PT') {
      ctx.fillStyle = '#006600'; ctx.fillRect(x, y, w * 0.4, h);
      ctx.fillStyle = '#FF0000'; ctx.fillRect(x + w * 0.4, y, w * 0.6, h);
      ctx.fillStyle = '#FFCC00';
      ctx.beginPath(); ctx.arc(x + w * 0.4, y + h * 0.5, h * 0.2, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.fillStyle = '#38bdf8'; ctx.fillRect(x, y, w, h);
    }

    ctx.restore();
    // Crisp border around flag badge
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.45)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, Math.max(2, h * 0.18));
    ctx.stroke();
    ctx.restore();
  }

  /* ── Siluete Vectoriale Bogate pentru Monumentele Orașelor ── */
  function drawCityLandmark(ctx, cityId, themeColor, cx, baseY, sz, alpha) {
    ctx.save();
    const col = themeColor || '#38bdf8';
    ctx.globalAlpha = alpha !== undefined ? alpha : 0.78;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = col;
    ctx.shadowBlur = 16;

    switch (cityId) {
      case 'chisinau': {
        ctx.strokeStyle = '#ffffffdd';
        ctx.lineWidth = 2.2;
        for (let step = 0; step < 4; step++) {
          const w = sz * 0.11;
          const h = sz * (0.35 + step * 0.16);
          const xL = cx - sz * 0.65 + step * (w * 0.85);
          const xR = cx + sz * 0.65 - w - step * (w * 0.85);
          ctx.fillStyle = col + '3a';
          ctx.fillRect(xL, baseY - h, w, h);
          ctx.strokeRect(xL, baseY - h, w, h);
          ctx.fillRect(xR, baseY - h, w, h);
          ctx.strokeRect(xR, baseY - h, w, h);
        }
        const archW = sz * 0.42, archH = sz * 0.56;
        const ax = cx - archW / 2, ay = baseY - archH;
        ctx.fillStyle = '#fbbf2438';
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2.8;
        ctx.fillRect(ax, ay, archW, archH);
        ctx.strokeRect(ax, ay, archW, archH);
        ctx.strokeRect(ax - 5, ay - sz * 0.08, archW + 10, sz * 0.08);
        ctx.fillStyle = '#070b18';
        ctx.beginPath();
        ctx.moveTo(cx - archW * 0.24, baseY);
        ctx.lineTo(cx - archW * 0.24, baseY - archH * 0.48);
        ctx.arc(cx, baseY - archH * 0.48, archW * 0.24, Math.PI, 0, false);
        ctx.lineTo(cx + archW * 0.24, baseY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
      }

      case 'bucharest': {
        const w = sz * 0.92;
        const pedY = baseY - sz * 0.48;
        ctx.fillStyle = col + '3a';
        ctx.strokeStyle = col;
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.arc(cx, pedY, sz * 0.34, Math.PI, 0, false);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx, pedY - sz * 0.34);
        ctx.lineTo(cx, pedY - sz * 0.50);
        ctx.stroke();
        ctx.fillStyle = '#0b132b';
        ctx.strokeStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.moveTo(cx - w / 2, pedY);
        ctx.lineTo(cx, pedY - sz * 0.22);
        ctx.lineTo(cx + w / 2, pedY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        for (let i = 0; i < 6; i++) {
          const colX = (cx - w * 0.38) + i * (w * 0.76 / 5);
          ctx.beginPath();
          ctx.moveTo(colX, pedY);
          ctx.lineTo(colX, baseY);
          ctx.stroke();
        }
        break;
      }

      case 'montreal': {
        ctx.strokeStyle = col;
        ctx.lineWidth = 2.4;
        const domeR = sz * 0.44;
        ctx.beginPath();
        ctx.arc(cx - sz * 0.08, baseY - domeR * 0.12, domeR, Math.PI * 1.05, -Math.PI * 0.05, false);
        ctx.stroke();
        ctx.lineWidth = 1.3;
        ctx.strokeStyle = '#ffffff99';
        for (let i = -2; i <= 2; i++) {
          ctx.beginPath();
          ctx.ellipse(cx - sz * 0.08, baseY - domeR * 0.12, Math.abs(i) * domeR * 0.34 + 6, domeR * 0.9, 0, Math.PI, Math.PI * 2);
          ctx.stroke();
        }
        const crossX = cx + sz * 0.44;
        const hillY = baseY - sz * 0.25;
        ctx.strokeStyle = col;
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.moveTo(cx + sz * 0.12, baseY);
        ctx.quadraticCurveTo(crossX, hillY - sz * 0.1, cx + sz * 0.68, baseY);
        ctx.stroke();
        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(crossX, hillY);
        ctx.lineTo(crossX, hillY - sz * 0.56);
        ctx.moveTo(crossX - sz * 0.16, hillY - sz * 0.40);
        ctx.lineTo(crossX + sz * 0.16, hillY - sz * 0.40);
        ctx.stroke();
        break;
      }

      case 'paris': {
        const topY = baseY - sz * 1.18;
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 3.2;
        ctx.beginPath();
        ctx.moveTo(cx - sz * 0.42, baseY);
        ctx.quadraticCurveTo(cx - sz * 0.12, baseY - sz * 0.52, cx - sz * 0.03, topY + sz * 0.12);
        ctx.lineTo(cx + sz * 0.03, topY + sz * 0.12);
        ctx.quadraticCurveTo(cx + sz * 0.12, baseY - sz * 0.52, cx + sz * 0.42, baseY);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx, baseY, sz * 0.22, Math.PI, 0, false);
        ctx.stroke();
        ctx.lineWidth = 3.2;
        ctx.beginPath();
        ctx.moveTo(cx - sz * 0.28, baseY - sz * 0.34);
        ctx.lineTo(cx + sz * 0.28, baseY - sz * 0.34);
        ctx.moveTo(cx - sz * 0.16, baseY - sz * 0.68);
        ctx.lineTo(cx + sz * 0.16, baseY - sz * 0.68);
        ctx.moveTo(cx, topY + sz * 0.12);
        ctx.lineTo(cx, topY - sz * 0.10);
        ctx.stroke();
        break;
      }

      case 'tokyo': {
        ctx.strokeStyle = '#ffffff88';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - sz * 0.72, baseY);
        ctx.quadraticCurveTo(cx - sz * 0.22, baseY - sz * 0.78, cx - sz * 0.08, baseY - sz * 0.92);
        ctx.lineTo(cx + sz * 0.08, baseY - sz * 0.92);
        ctx.quadraticCurveTo(cx + sz * 0.22, baseY - sz * 0.78, cx + sz * 0.72, baseY);
        ctx.stroke();
        ctx.fillStyle = '#f43f5e55';
        ctx.beginPath();
        ctx.arc(cx, baseY - sz * 0.62, sz * 0.25, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ec4899';
        ctx.lineWidth = 5;
        const ty = baseY - sz * 0.66;
        ctx.beginPath();
        ctx.moveTo(cx - sz * 0.46, ty - sz * 0.06);
        ctx.quadraticCurveTo(cx, ty + sz * 0.06, cx + sz * 0.46, ty - sz * 0.06);
        ctx.moveTo(cx - sz * 0.36, ty + sz * 0.14);
        ctx.lineTo(cx + sz * 0.36, ty + sz * 0.14);
        ctx.moveTo(cx - sz * 0.25, ty);
        ctx.lineTo(cx - sz * 0.29, baseY);
        ctx.moveTo(cx + sz * 0.25, ty);
        ctx.lineTo(cx + sz * 0.29, baseY);
        ctx.stroke();
        break;
      }

      case 'newyork': {
        const towers = [
          [-0.52, 0.18, 0.55], [-0.30, 0.20, 0.82], [-0.08, 0.22, 1.08],
          [0.18, 0.18, 0.74], [0.40, 0.18, 0.52]
        ];
        towers.forEach(([ox, tw, th], idx) => {
          const x = cx + ox * sz, w = tw * sz, h = th * sz;
          ctx.fillStyle = idx === 2 ? col + '44' : col + '28';
          ctx.strokeStyle = idx === 2 ? '#ffffff' : col;
          ctx.lineWidth = idx === 2 ? 2.8 : 2;
          ctx.fillRect(x, baseY - h, w, h);
          ctx.strokeRect(x, baseY - h, w, h);
        });
        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx + sz * 0.03, baseY - sz * 1.08);
        ctx.lineTo(cx + sz * 0.03, baseY - sz * 1.32);
        ctx.stroke();
        break;
      }

      case 'dubai': {
        ctx.strokeStyle = '#fde047';
        ctx.fillStyle = col + '36';
        ctx.lineWidth = 2.4;
        [
          [-0.18, 0.36, 0.32], [-0.13, 0.26, 0.58], [-0.09, 0.18, 0.84], [-0.045, 0.09, 1.08]
        ].forEach(([ox, w, h]) => {
          ctx.fillRect(cx - sz * 0.12 + ox * sz, baseY - h * sz, w * sz, h * sz);
          ctx.strokeRect(cx - sz * 0.12 + ox * sz, baseY - h * sz, w * sz, h * sz);
        });
        ctx.beginPath();
        ctx.moveTo(cx - sz * 0.12, baseY - sz * 1.08);
        ctx.lineTo(cx - sz * 0.12, baseY - sz * 1.35);
        ctx.stroke();
        ctx.strokeStyle = '#ffffffcc';
        ctx.beginPath();
        ctx.moveTo(cx + sz * 0.24, baseY);
        ctx.lineTo(cx + sz * 0.24, baseY - sz * 0.65);
        ctx.quadraticCurveTo(cx + sz * 0.56, baseY - sz * 0.38, cx + sz * 0.28, baseY);
        ctx.stroke();
        break;
      }

      case 'london': {
        const eyeX = cx + sz * 0.22, eyeY = baseY - sz * 0.42, eyeR = sz * 0.36;
        ctx.strokeStyle = col;
        ctx.lineWidth = 2.4;
        ctx.beginPath(); ctx.arc(eyeX, eyeY, eyeR, 0, Math.PI * 2); ctx.stroke();
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
          ctx.beginPath();
          ctx.moveTo(eyeX, eyeY);
          ctx.lineTo(eyeX + Math.cos(a) * eyeR, eyeY + Math.sin(a) * eyeR);
          ctx.stroke();
        }
        const bx = cx - sz * 0.38, bw = sz * 0.24, bh = sz * 0.88;
        ctx.fillStyle = '#0c1328';
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2.6;
        ctx.fillRect(bx, baseY - bh, bw, bh);
        ctx.strokeRect(bx, baseY - bh, bw, bh);
        ctx.beginPath();
        ctx.moveTo(bx, baseY - bh);
        ctx.lineTo(bx + bw / 2, baseY - bh - sz * 0.30);
        ctx.lineTo(bx + bw, baseY - bh);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        ctx.beginPath();
        ctx.arc(bx + bw / 2, baseY - bh + sz * 0.14, sz * 0.06, 0, Math.PI * 2);
        ctx.stroke();
        break;
      }

      case 'rome': {
        const w = sz * 1.1, h = sz * 0.62;
        const x0 = cx - w / 2, y0 = baseY - h;
        ctx.fillStyle = col + '2e';
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.moveTo(x0, baseY); ctx.lineTo(x0, y0);
        ctx.lineTo(x0 + w * 0.72, y0);
        ctx.lineTo(x0 + w * 0.78, y0 + h * 0.28);
        ctx.lineTo(x0 + w, y0 + h * 0.28);
        ctx.lineTo(x0 + w, baseY);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#070a16';
        for (let row = 0; row < 2; row++) {
          for (let c = 0; c < 4; c++) {
            const ax = x0 + sz * 0.14 + c * (sz * 0.22);
            const ay = y0 + sz * 0.20 + row * (sz * 0.22);
            ctx.beginPath();
            ctx.arc(ax, ay, sz * 0.055, Math.PI, 0, false);
            ctx.lineTo(ax + sz * 0.055, ay + sz * 0.08);
            ctx.lineTo(ax - sz * 0.055, ay + sz * 0.08);
            ctx.closePath();
            ctx.fill(); ctx.stroke();
          }
        }
        break;
      }

      case 'cairo': {
        [[-0.36, 0.44], [0.02, 0.68], [0.38, 0.38]].forEach(([ox, ps], idx) => {
          const px = cx + ox * sz, ph = ps * sz;
          ctx.fillStyle = idx === 1 ? '#fbbf243e' : col + '30';
          ctx.strokeStyle = idx === 1 ? '#fde047' : col;
          ctx.lineWidth = 2.6;
          ctx.beginPath();
          ctx.moveTo(px - ph * 0.85, baseY);
          ctx.lineTo(px, baseY - ph);
          ctx.lineTo(px + ph * 0.85, baseY);
          ctx.closePath();
          ctx.fill(); ctx.stroke();
        });
        break;
      }

      case 'sydney': {
        ctx.fillStyle = '#ffffff30';
        ctx.strokeStyle = '#ffffffdd';
        ctx.lineWidth = 2.8;
        [[-0.45, 0.42], [-0.18, 0.62], [0.14, 0.52]].forEach(([ox, sh]) => {
          const sx = cx + ox * sz;
          ctx.beginPath();
          ctx.moveTo(sx, baseY);
          ctx.quadraticCurveTo(sx + sz * 0.05, baseY - sh * sz, sx + sz * 0.34, baseY - sh * sz * 0.85);
          ctx.quadraticCurveTo(sx + sz * 0.26, baseY - sh * sz * 0.2, sx + sz * 0.28, baseY);
          ctx.closePath();
          ctx.fill(); ctx.stroke();
        });
        break;
      }

      default: {
        const bars = [
          [-0.50, 0.14, 0.45], [-0.33, 0.15, 0.68], [-0.14, 0.28, 0.92],
          [0.17, 0.15, 0.72], [0.35, 0.14, 0.48]
        ];
        bars.forEach(([ox, bw, bh], i) => {
          const bx = cx + ox * sz;
          ctx.fillStyle = i === 2 ? col + '40' : col + '24';
          ctx.strokeStyle = i === 2 ? '#fbbf24' : col;
          ctx.lineWidth = i === 2 ? 2.8 : 2;
          ctx.fillRect(bx, baseY - bh * sz, bw * sz, bh * sz);
          ctx.strokeRect(bx, baseY - bh * sz, bw * sz, bh * sz);
        });
        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx, baseY - sz * 0.92);
        ctx.lineTo(cx, baseY - sz * 1.15);
        ctx.stroke();
        break;
      }
    }

    ctx.restore();
  }

  global.REMO_DATA = {
    REMO_ELEMENTS,
    REMO_CITIES,
    getCityById,
    getCityLabel,
    getCityTagline,
    getCityLocalClock,
    haversineKm,
    mulberry32,
    hashStr,
    drawCountryFlag,
    drawCityLandmark
  };
})(window);
