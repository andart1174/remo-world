/* ════════════════════════════════════════════════════════════════════
   🌍 REMO — World Cities Master Database & Pure-Canvas Vector Landmarks
   24 Edition-1 Cities (incl. Montréal, Paris, Chișinău, București, NYC,
   Tokyo, Dubai...) + Dynamic Admin City Overrides & Vector Art Engine
   ════════════════════════════════════════════════════════════════════ */

const REMO_DEFAULT_CITIES = [
  {
    id: 'montreal', code: 'MTL', flag: '⚜️', continent: 'North America',
    name_en: 'Montréal', name_fr: 'Montréal',
    country_en: 'Canada', country_fr: 'Canada',
    tagline_en: 'Cyber-Creative Capital & Mount Royal Summit',
    tagline_fr: 'Capitale Cyber-Créative & Sommet du Mont-Royal',
    desc_en: 'Bilingual hub of AI innovation, festival lights, geodesic architecture, and iconic midnight gastronomy.',
    desc_fr: 'Métropole bilingue d’innovation IA, festivals lumineux, dôme géodésique et gastronomie nocturne.',
    lat: 45.5017, lng: -73.5673, themeColor: '#8b5cf6', themeId: 1,
    element: 'neon', rarity: 'Mythic 4D', baseValue: 9500,
    stats: { culture: 95, nightlife: 92, tech: 96, gastronomy: 94 }
  },
  {
    id: 'paris', code: 'PAR', flag: '🗼', continent: 'Europe',
    name_en: 'Paris', name_fr: 'Paris',
    country_en: 'France', country_fr: 'France',
    tagline_en: 'City of Light, Haute Couture & Golden Horizon',
    tagline_fr: 'Ville Lumière, Haute Couture & Horizon Doré',
    desc_en: 'Timeless elegance crowned by the Iron Lady, avant-garde galleries, Seine nights, and Michelin artistry.',
    desc_fr: 'Élégance éternelle couronnée par la Dame de Fer, galeries d’avant-garde et gastronomie étoilée.',
    lat: 48.8566, lng: 2.3522, themeColor: '#f59e0b', themeId: 0,
    element: 'crystal', rarity: 'Mythic 4D', baseValue: 9800,
    stats: { culture: 99, nightlife: 90, tech: 88, gastronomy: 99 }
  },
  {
    id: 'chisinau', code: 'KIV', flag: '🇲🇩', continent: 'Europe',
    name_en: 'Chișinău', name_fr: 'Chișinău',
    country_en: 'Moldova', country_fr: 'Moldavie',
    tagline_en: 'Green Capital of Moldova • Triumphal Arch & Wine Vaults',
    tagline_fr: 'Capitale Verte de Moldavie • Arc de Triomphe & Caves Royales',
    desc_en: 'Vibrant Eastern European capital famed for its white-stone City Gates, Triumphal Arch, underground wine cities, and rising IT talent.',
    desc_fr: 'Capitale dynamique célèbre pour ses Portes de la Ville en pierre blanche, son Arc de Triomphe, ses cités viticoles et son essor tech.',
    lat: 47.0105, lng: 28.8638, themeColor: '#fbbf24', themeId: 0,
    element: 'plasma', rarity: 'Mythic 4D', baseValue: 9400,
    stats: { culture: 94, nightlife: 89, tech: 91, gastronomy: 96 }
  },
  {
    id: 'bucharest', code: 'BUH', flag: '🇷🇴', continent: 'Europe',
    name_en: 'Bucharest', name_fr: 'Bucarest',
    country_en: 'Romania', country_fr: 'Roumanie',
    tagline_en: 'Little Paris of the East & Fiber-Speed Cyber Hub',
    tagline_fr: 'Petit Paris de l’Est & Pôle Cyber Ultra-Rapide',
    desc_en: 'Grand Belle Époque boulevards, the neoclassical Athenaeum, Old Town electric nights, and gigabit tech energy.',
    desc_fr: 'Grands boulevards Belle Époque, Athénée néoclassique, nuits électriques du Centre Ancien et énergie tech.',
    lat: 44.4268, lng: 26.1025, themeColor: '#38bdf8', themeId: 2,
    element: 'cyber', rarity: 'Legendary Gold', baseValue: 8800,
    stats: { culture: 91, nightlife: 95, tech: 94, gastronomy: 90 }
  },
  {
    id: 'newyork', code: 'NYC', flag: '🗽', continent: 'North America',
    name_en: 'New York', name_fr: 'New York',
    country_en: 'United States', country_fr: 'États-Unis',
    tagline_en: 'The Sleepless Metropolis & Neon Skyline',
    tagline_fr: 'La Métropole Qui Ne Dort Jamais',
    desc_en: 'Skyscraper canyons of Manhattan, Times Square voltage, Broadway icons, and global cultural gravity.',
    desc_fr: 'Gratte-ciels de Manhattan, énergie électrique de Times Square, Broadway et capitale culturelle mondiale.',
    lat: 40.7128, lng: -74.0060, themeColor: '#06b6d4', themeId: 5,
    element: 'neon', rarity: 'Mythic 4D', baseValue: 9700,
    stats: { culture: 96, nightlife: 98, tech: 95, gastronomy: 95 }
  },
  {
    id: 'tokyo', code: 'TYO', flag: '🏯', continent: 'Asia',
    name_en: 'Tokyo', name_fr: 'Tokyo',
    country_en: 'Japan', country_fr: 'Japon',
    tagline_en: 'Hyper-Neon Shibuya & Ancient Shinto Harmony',
    tagline_fr: 'Hyper-Néon de Shibuya & Harmonie Millénaire',
    desc_en: 'Where futuristic robotics, holographic crossings, and serene Torii shrines merge in dazzling precision.',
    desc_fr: 'Où la robotique futuriste, les carrefours holographiques et les sanctuaires Torii fusionnent.',
    lat: 35.6762, lng: 139.6503, themeColor: '#ec4899', themeId: 2,
    element: 'cyber', rarity: 'Mythic 4D', baseValue: 9900,
    stats: { culture: 97, nightlife: 95, tech: 99, gastronomy: 98 }
  },
  {
    id: 'london', code: 'LON', flag: '🏰', continent: 'Europe',
    name_en: 'London', name_fr: 'Londres',
    country_en: 'United Kingdom', country_fr: 'Royaume-Uni',
    tagline_en: 'Royal Thames Skyline & Global FinTech Crown',
    tagline_fr: 'Horizon Royal de la Tamise & Couronne FinTech',
    desc_en: 'Big Ben chimes beside futuristic glass towers, underground soundwaves, and world-leading museums.',
    desc_fr: 'Big Ben résonne face aux tours de verre futuristes, scènes musicales et musées légendaires.',
    lat: 51.5072, lng: -0.1276, themeColor: '#6366f1', themeId: 4,
    element: 'void', rarity: 'Legendary Gold', baseValue: 9200,
    stats: { culture: 96, nightlife: 92, tech: 94, gastronomy: 89 }
  },
  {
    id: 'dubai', code: 'DXB', flag: '🌆', continent: 'Middle East',
    name_en: 'Dubai', name_fr: 'Dubaï',
    country_en: 'UAE', country_fr: 'Émirats Arabes Unis',
    tagline_en: 'Oasis of the Future & Sky-Piercing Spires',
    tagline_fr: 'Oasis du Futur & Flèches Célestes',
    desc_en: 'Home to the Burj Khalifa, desert luxury, palm archipelagos, and ultra-modern architectural marvels.',
    desc_fr: 'Berceau du Burj Khalifa, luxe du désert, îles palmiers et prouesses architecturales futuristes.',
    lat: 25.2048, lng: 55.2708, themeColor: '#eab308', themeId: 3,
    element: 'plasma', rarity: 'Legendary Gold', baseValue: 9300,
    stats: { culture: 86, nightlife: 94, tech: 96, gastronomy: 92 }
  },
  {
    id: 'miami', code: 'MIA', flag: '🌴', continent: 'North America',
    name_en: 'Miami', name_fr: 'Miami',
    country_en: 'United States', country_fr: 'États-Unis',
    tagline_en: 'Ocean Drive Art Deco & Tropical Neon Nights',
    tagline_fr: 'Art Déco d’Ocean Drive & Nuits Néon Tropicales',
    desc_en: 'Turquoise Atlantic waves, pastel neon palms, superyacht marinas, and electric Latin-fusion nights.',
    desc_fr: 'Vagues turquoise, palmiers néon pastel, marinas prestigieuses et nuits électriques.',
    lat: 25.7617, lng: -80.1918, themeColor: '#f43f5e', themeId: 1,
    element: 'plasma', rarity: 'Legendary Gold', baseValue: 8600,
    stats: { culture: 88, nightlife: 99, tech: 85, gastronomy: 90 }
  },
  {
    id: 'barcelona', code: 'BCN', flag: '☀️', continent: 'Europe',
    name_en: 'Barcelona', name_fr: 'Barcelone',
    country_en: 'Spain', country_fr: 'Espagne',
    tagline_en: 'Gaudí’s Dreamscape & Mediterranean Pulse',
    tagline_fr: 'Rêve de Gaudí & Pulsation Méditerranéenne',
    desc_en: 'Sagrada Família spires, sunlit beaches, Gothic Quarter tapas, and smart-city Mediterranean innovation.',
    desc_fr: 'Flèches de la Sagrada Família, plages dorées, quartier Gothique et innovation méditerranéenne.',
    lat: 41.3874, lng: 2.1686, themeColor: '#f97316', themeId: 0,
    element: 'plasma', rarity: 'Epic', baseValue: 8400,
    stats: { culture: 96, nightlife: 94, tech: 87, gastronomy: 96 }
  },
  {
    id: 'rome', code: 'ROM', flag: '🏛️', continent: 'Europe',
    name_en: 'Rome', name_fr: 'Rome',
    country_en: 'Italy', country_fr: 'Italie',
    tagline_en: 'The Eternal City & Imperial Marble Glory',
    tagline_fr: 'La Ville Éternelle & Gloire Impériale',
    desc_en: 'Two millennia of Colosseum grandeur, sunlit piazzas, espresso culture, and immortal artistry.',
    desc_fr: 'Deux millénaires de grandeur autour du Colisée, piazzas ensoleillées et art immortel.',
    lat: 41.9028, lng: 12.4964, themeColor: '#d97706', themeId: 3,
    element: 'crystal', rarity: 'Legendary Gold', baseValue: 8900,
    stats: { culture: 100, nightlife: 86, tech: 80, gastronomy: 99 }
  },
  {
    id: 'toronto', code: 'YYZ', flag: '🍁', continent: 'North America',
    name_en: 'Toronto', name_fr: 'Toronto',
    country_en: 'Canada', country_fr: 'Canada',
    tagline_en: 'CN Tower Horizon & Multicultural Powerhouse',
    tagline_fr: 'Horizon CN Tower & Métropole Multiculturelle',
    desc_en: 'Soaring Lake Ontario skyline, AI research corridors, film festivals, and 200 world cuisines.',
    desc_fr: 'Silhouette élancée sur le lac Ontario, corridor de recherche IA et 200 cuisines du monde.',
    lat: 43.6532, lng: -79.3832, themeColor: '#3b82f6', themeId: 4,
    element: 'cyber', rarity: 'Epic', baseValue: 8200,
    stats: { culture: 90, nightlife: 88, tech: 94, gastronomy: 92 }
  },
  {
    id: 'monaco', code: 'MCM', flag: '🏎️', continent: 'Europe',
    name_en: 'Monaco', name_fr: 'Monaco',
    country_en: 'Monaco', country_fr: 'Monaco',
    tagline_en: 'Riviera Crown Jewel & Grand Prix Prestige',
    tagline_fr: 'Joyau de la Riviera & Prestige Grand Prix',
    desc_en: 'Monte Carlo glamour, cliffside Mediterranean palaces, supercar hairpins, and ultra-rare collector status.',
    desc_fr: 'Glamour de Monte-Carlo, palais méditerranéens, virages de Formule 1 et prestige absolu.',
    lat: 43.7384, lng: 7.4246, themeColor: '#fde047', themeId: 0,
    element: 'crystal', rarity: 'Mythic 4D', baseValue: 10000,
    stats: { culture: 91, nightlife: 96, tech: 88, gastronomy: 97 }
  },
  {
    id: 'losangeles', code: 'LAX', flag: '🎬', continent: 'North America',
    name_en: 'Los Angeles', name_fr: 'Los Angeles',
    country_en: 'United States', country_fr: 'États-Unis',
    tagline_en: 'Cinema Capital, Sunset Palms & Pacific Glow',
    tagline_fr: 'Capitale du Cinéma & Crépuscule du Pacifique',
    desc_en: 'Hollywood hills, Griffith Observatory stars, Venice Beach skate culture, and entertainment studios.',
    desc_fr: 'Collines d’Hollywood, observatoire Griffith, plages du Pacifique et studios légendaires.',
    lat: 34.0522, lng: -118.2437, themeColor: '#a855f7', themeId: 5,
    element: 'neon', rarity: 'Legendary Gold', baseValue: 8700,
    stats: { culture: 93, nightlife: 94, tech: 91, gastronomy: 91 }
  },
  {
    id: 'seoul', code: 'SEL', flag: '⚡', continent: 'Asia',
    name_en: 'Seoul', name_fr: 'Séoul',
    country_en: 'South Korea', country_fr: 'Corée du Sud',
    tagline_fr: ' Capitale K-Wave, E-Sports & Palais Royaux',
    tagline_en: 'K-Wave Megacity, E-Sports Arena & Royal Palaces',
    desc_en: '24-hour Hongdae energy, Gangnam futuristic towers, Gyeongbokgung heritage, and hyper-connected culture.',
    desc_fr: 'Énergie 24h/24 de Hongdae, tours futuristes de Gangnam, palais royaux et culture hyper-connectée.',
    lat: 37.5665, lng: 126.9780, themeColor: '#14b8a6', themeId: 2,
    element: 'cyber', rarity: 'Legendary Gold', baseValue: 9100,
    stats: { culture: 95, nightlife: 96, tech: 99, gastronomy: 95 }
  },
  {
    id: 'geneva', code: 'GVA', flag: '⌚', continent: 'Europe',
    name_en: 'Geneva', name_fr: 'Genève',
    country_en: 'Switzerland', country_fr: 'Suisse',
    tagline_en: 'Alpine Precision, Jet d’Eau & Quantum Science',
    tagline_fr: 'Précision Alpine, Jet d’Eau & Science Quantique',
    desc_en: 'Crystal alpine lake, master horology, diplomatic summits, and particle physics frontier.',
    desc_fr: 'Lac alpin cristallin, haute horlogerie, sommets diplomatiques et recherche quantique.',
    lat: 46.2044, lng: 6.1432, themeColor: '#22d3ee', themeId: 4,
    element: 'crystal', rarity: 'Epic', baseValue: 8500,
    stats: { culture: 90, nightlife: 80, tech: 96, gastronomy: 92 }
  },
  {
    id: 'singapore', code: 'SIN', flag: '🦁', continent: 'Asia',
    name_en: 'Singapore', name_fr: 'Singapour',
    country_en: 'Singapore', country_fr: 'Singapour',
    tagline_en: 'Solar Supertrees & SkyPark Cyber Garden',
    tagline_fr: 'Supertrees Solaires & Jardin Cyber Céleste',
    desc_en: 'Bioluminescent Gardens by the Bay, Marina Bay SkyPark, hawker Michelin stars, and smart island design.',
    desc_fr: 'Jardins bioluminescents, Marina Bay SkyPark, gastronomie étoilée et île futuriste.',
    lat: 1.3521, lng: 103.8198, themeColor: '#10b981', themeId: 1,
    element: 'cyber', rarity: 'Legendary Gold', baseValue: 9200,
    stats: { culture: 91, nightlife: 90, tech: 98, gastronomy: 97 }
  },
  {
    id: 'sydney', code: 'SYD', flag: '⛵', continent: 'Oceania',
    name_en: 'Sydney', name_fr: 'Sydney',
    country_en: 'Australia', country_fr: 'Australie',
    tagline_en: 'Opera Sails, Emerald Harbour & Bondi Surf',
    tagline_fr: 'Voiles de l’Opéra, Port Émeraude & Bondi',
    desc_en: 'Iconic white Opera House shells gleaming beside the Harbour Bridge and golden Pacific waves.',
    desc_fr: 'Voiles blanches iconiques de l’Opéra face au Harbour Bridge et aux vagues dorées du Pacifique.',
    lat: -33.8688, lng: 151.2093, themeColor: '#0ea5e9', themeId: 1,
    element: 'neon', rarity: 'Epic', baseValue: 8300,
    stats: { culture: 90, nightlife: 89, tech: 89, gastronomy: 91 }
  },
  {
    id: 'rio', code: 'RIO', flag: '🎭', continent: 'South America',
    name_en: 'Rio de Janeiro', name_fr: 'Rio de Janeiro',
    country_en: 'Brazil', country_fr: 'Brésil',
    tagline_en: 'Corcovado Summit, Copacabana & Carnival Fire',
    tagline_fr: 'Sommet du Corcovado, Copacabana & Feu du Carnaval',
    desc_en: 'Dramatic granite peaks, samba rhythms, oceanfront promenades, and unforgettable tropical sunsets.',
    desc_fr: 'Pics granitiques spectaculaires, rythmes de samba, plages mythiques et couchers de soleil.',
    lat: -22.9068, lng: -43.1729, themeColor: '#eab308', themeId: 3,
    element: 'plasma', rarity: 'Epic', baseValue: 8100,
    stats: { culture: 95, nightlife: 98, tech: 81, gastronomy: 90 }
  },
  {
    id: 'istanbul', code: 'IST', flag: '🕌', continent: 'Europe',
    name_en: 'Istanbul', name_fr: 'Istanbul',
    country_en: 'Türkiye', country_fr: 'Turquie',
    tagline_en: 'Where Two Continents Meet Across the Bosphorus',
    tagline_fr: 'Là Où Deux Continents Se Rencontrent sur le Bosphore',
    desc_en: 'Majestic domes, Grand Bazaar treasures, Bosphorus ferries at dusk, and bridge between East and West.',
    desc_fr: 'Dômes majestueux, trésors du Grand Bazar, traversées du Bosphore et pont entre Orient et Occident.',
    lat: 41.0082, lng: 28.9784, themeColor: '#f59e0b', themeId: 3,
    element: 'void', rarity: 'Epic', baseValue: 8400,
    stats: { culture: 98, nightlife: 90, tech: 85, gastronomy: 97 }
  },
  {
    id: 'berlin', code: 'BER', flag: '🎧', continent: 'Europe',
    name_en: 'Berlin', name_fr: 'Berlin',
    country_en: 'Germany', country_fr: 'Allemagne',
    tagline_en: 'Brandenburg Heritage & Underground Techno Pulse',
    tagline_fr: 'Porte de Brandebourg & Pulsation Techno',
    desc_en: 'Avant-garde street art, legendary clubbing temples, startup factories, and fearless creative freedom.',
    desc_fr: 'Art urbain d’avant-garde, clubs légendaires, startups créatives et liberté artistique.',
    lat: 52.5200, lng: 13.4050, themeColor: '#a3e635', themeId: 2,
    element: 'void', rarity: 'Epic', baseValue: 8300,
    stats: { culture: 94, nightlife: 100, tech: 92, gastronomy: 86 }
  },
  {
    id: 'amsterdam', code: 'AMS', flag: '🚲', continent: 'Europe',
    name_en: 'Amsterdam', name_fr: 'Amsterdam',
    country_en: 'Netherlands', country_fr: 'Pays-Bas',
    tagline_en: 'Golden Canals, Night Bridges & Design Avant-Garde',
    tagline_fr: 'Canaux Dorés, Ponts Illuminés & Design',
    desc_en: 'Reflections on historic canals, master art museums, sustainable innovation, and electronic music festivals.',
    desc_fr: 'Reflets sur les canaux historiques, grands musées, éco-innovation et festivals électroniques.',
    lat: 52.3676, lng: 4.9041, themeColor: '#fb923c', themeId: 5,
    element: 'neon', rarity: 'Rare', baseValue: 7900,
    stats: { culture: 94, nightlife: 93, tech: 91, gastronomy: 87 }
  },
  {
    id: 'lisbon', code: 'LIS', flag: '🚋', continent: 'Europe',
    name_en: 'Lisbon', name_fr: 'Lisbonne',
    country_en: 'Portugal', country_fr: 'Portugal',
    tagline_en: 'Seven Sunlit Hills, Atlantic Winds & Digital Nomads',
    tagline_fr: 'Sept Collines Dorées, Atlantique & Nomades Tech',
    desc_en: 'Yellow vintage trams, azulejo tiles, Tagus river viewpoints, and Europe’s warmest Web & AI summit hub.',
    desc_fr: 'Tramways jaunes iconiques, azulejos, belvédères sur le Tage et capitale des créateurs numériques.',
    lat: 38.7223, lng: -9.1393, themeColor: '#fbbf24', themeId: 0,
    element: 'crystal', rarity: 'Rare', baseValue: 7800,
    stats: { culture: 93, nightlife: 90, tech: 89, gastronomy: 94 }
  },
  {
    id: 'cairo', code: 'CAI', flag: '🔺', continent: 'Africa',
    name_en: 'Cairo', name_fr: 'Le Caire',
    country_en: 'Egypt', country_fr: 'Égypte',
    tagline_en: 'Eternal Giza Pyramids & Golden Nile Horizon',
    tagline_fr: 'Pyramides Éternelles de Gizeh & Horizon du Nil',
    desc_en: 'Ancient wonders aligned with the stars beside the bustling Nile metropolis and Grand Egyptian Museum.',
    desc_fr: 'Merveilles antiques alignées sur les étoiles face au Nil et au Grand Musée Égyptien.',
    lat: 30.0444, lng: 31.2357, themeColor: '#f59e0b', themeId: 3,
    element: 'void', rarity: 'Legendary Gold', baseValue: 8700,
    stats: { culture: 99, nightlife: 85, tech: 82, gastronomy: 90 }
  }
];

const REMO_ELEMENTS = {
  neon:    { id: 'neon',    icon: '⚡', name_en: 'Neon',    name_fr: 'Néon',    color: '#38bdf8', beats: 'void' },
  void:    { id: 'void',    icon: '🔮', name_en: 'Void',    name_fr: 'Vide',    color: '#a855f7', beats: 'cyber' },
  cyber:   { id: 'cyber',   icon: '🌌', name_en: 'Cyber',   name_fr: 'Cyber',   color: '#10b981', beats: 'crystal' },
  crystal: { id: 'crystal', icon: '💎', name_en: 'Crystal', name_fr: 'Cristal', color: '#fbbf24', beats: 'plasma' },
  plasma:  { id: 'plasma',  icon: '🔥', name_en: 'Plasma',  name_fr: 'Plasma',  color: '#f43f5e', beats: 'neon' }
};

function getRemoCities() {
  try {
    const customRaw = localStorage.getItem('remo_cities_override');
    if (customRaw) {
      const parsed = JSON.parse(customRaw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return REMO_DEFAULT_CITIES.map((c) => ({ ...c, stats: { ...c.stats } }));
}

function saveRemoCities(citiesArr) {
  localStorage.setItem('remo_cities_override', JSON.stringify(citiesArr));
  window.dispatchEvent(new CustomEvent('remo:citieschange'));
}

function getCityById(cityId) {
  const list = getRemoCities();
  return list.find((c) => c.id === cityId) || list[0];
}

function getCityName(city, lang) {
  const l = lang || (window.REMO_I18N ? window.REMO_I18N.getLang() : 'en');
  if (!city) return 'World';
  return l === 'fr' ? (city.name_fr || city.name_en) : (city.name_en || city.name_fr);
}

function getCityCountry(city, lang) {
  const l = lang || (window.REMO_I18N ? window.REMO_I18N.getLang() : 'en');
  if (!city) return '';
  return l === 'fr' ? (city.country_fr || city.country_en) : (city.country_en || city.country_fr);
}

function getCityTagline(city, lang) {
  const l = lang || (window.REMO_I18N ? window.REMO_I18N.getLang() : 'en');
  if (!city) return '';
  return l === 'fr' ? (city.tagline_fr || city.tagline_en) : (city.tagline_en || city.tagline_fr);
}

function getCityDesc(city, lang) {
  const l = lang || (window.REMO_I18N ? window.REMO_I18N.getLang() : 'en');
  if (!city) return '';
  return l === 'fr' ? (city.desc_fr || city.desc_en) : (city.desc_en || city.desc_fr);
}

function computeCityPvPStats(city, rarityOverride, verifiedGps = false) {
  const s = (city && city.stats) || { culture: 85, nightlife: 85, tech: 85, gastronomy: 85 };
  const rar = (rarityOverride || (city && city.rarity) || 'Epic').toLowerCase();
  let mult = 1.0;
  if (rar.includes('founder') || rar.includes('1-of-1')) mult = 1.35;
  else if (rar.includes('mythic')) mult = 1.22;
  else if (rar.includes('legendary')) mult = 1.14;
  else if (rar.includes('epic')) mult = 1.06;
  if (verifiedGps) mult *= 1.25; // +25% GPS Proof-of-Presence boost!

  return {
    atk: Math.round(((s.tech * 0.6) + (s.nightlife * 0.4)) * mult),
    def: Math.round(((s.culture * 0.65) + (s.gastronomy * 0.35)) * mult),
    spd: Math.round(((s.nightlife * 0.55) + (s.tech * 0.45)) * mult),
    hp:  Math.round((220 + (s.culture + s.gastronomy + s.tech + s.nightlife) * 0.65) * mult),
    element: (city && city.element) || 'neon'
  };
}

/* ════════════════════════════════════════════════════════════════════
   🎨 PURE-CANVAS ARCHITECTURAL VECTOR LANDMARK ENGINE (TAINT-FREE)
   Draws iconic glowing neon-gold silhouettes for every world city!
   ════════════════════════════════════════════════════════════════════ */
function drawCityLandmark(ctx, cityId, themeColor, cx, cy, sz) {
  ctx.save();
  const col = themeColor || '#38bdf8';

  // Ambient halo ring behind landmark
  const halo = ctx.createRadialGradient(cx, cy, sz * 0.1, cx, cy, sz * 0.95);
  halo.addColorStop(0, col + '44');
  halo.addColorStop(0.65, col + '14');
  halo.addColorStop(1, 'transparent');
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(cx, cy, sz * 0.95, 0, Math.PI * 2);
  ctx.fill();

  // Horizon baseline
  ctx.strokeStyle = col;
  ctx.shadowColor = col;
  ctx.shadowBlur = 18;
  ctx.lineWidth = 3;
  const baseY = cy + sz * 0.58;
  ctx.beginPath();
  ctx.moveTo(cx - sz * 0.72, baseY);
  ctx.lineTo(cx + sz * 0.72, baseY);
  ctx.stroke();

  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  switch (cityId) {
    case 'chisinau': {
      // Chișinău: Stepped Twin "City Gates" (Porțile Orașului) + Central Triumphal Arch (Arcul de Triumf)
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.8;
      // Left stepped gate tower
      for (let step = 0; step < 4; step++) {
        const w = sz * 0.11;
        const h = sz * (0.35 + step * 0.16);
        const x = cx - sz * 0.62 + step * (w * 0.85);
        ctx.fillStyle = col + '33';
        ctx.fillRect(x, baseY - h, w, h);
        ctx.strokeRect(x, baseY - h, w, h);
      }
      // Right stepped gate tower (mirrored)
      for (let step = 0; step < 4; step++) {
        const w = sz * 0.11;
        const h = sz * (0.35 + step * 0.16);
        const x = cx + sz * 0.62 - w - step * (w * 0.85);
        ctx.fillStyle = col + '33';
        ctx.fillRect(x, baseY - h, w, h);
        ctx.strokeRect(x, baseY - h, w, h);
      }
      // Central Triumphal Arch (Arcul de Triumf)
      const archW = sz * 0.42, archH = sz * 0.54;
      const ax = cx - archW / 2, ay = baseY - archH;
      ctx.fillStyle = '#fbbf2433';
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 3.5;
      ctx.fillRect(ax, ay, archW, archH);
      ctx.strokeRect(ax, ay, archW, archH);
      // Cornice & Attic
      ctx.strokeRect(ax - 6, ay - sz * 0.08, archW + 12, sz * 0.08);
      // Inner Archway cutout glow
      ctx.fillStyle = '#070b18';
      ctx.beginPath();
      ctx.moveTo(cx - archW * 0.24, baseY);
      ctx.lineTo(cx - archW * 0.24, baseY - archH * 0.48);
      ctx.arc(cx, baseY - archH * 0.48, archW * 0.24, Math.PI, 0, false);
      ctx.lineTo(cx + archW * 0.24, baseY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Mechanical Clock circle on Triumphal Arch + Star above
      ctx.beginPath();
      ctx.arc(cx, ay + archH * 0.22, sz * 0.06, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#fde047';
      ctx.font = `900 ${Math.round(sz * 0.22)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('★', cx, ay - sz * 0.16);
      break;
    }

    case 'montreal': {
      // Montréal: Biosphère Geodesic Dome + Mount Royal Illuminated Cross + Olympic Tower
      // Geodesic Biosphere Dome
      ctx.strokeStyle = col;
      ctx.lineWidth = 2.6;
      const domeR = sz * 0.46;
      ctx.beginPath();
      ctx.arc(cx - sz * 0.08, baseY - domeR * 0.15, domeR, Math.PI * 1.08, -Math.PI * 0.08, false);
      ctx.stroke();
      // Geodesic lattice lines
      ctx.lineWidth = 1.4;
      ctx.strokeStyle = '#ffffffaa';
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.ellipse(cx - sz * 0.08, baseY - domeR * 0.15, Math.abs(i) * domeR * 0.34 + 8, domeR * 0.92, 0, Math.PI, Math.PI * 2);
        ctx.stroke();
      }
      // Illuminated Mount Royal Cross on Summit
      const crossX = cx + sz * 0.42;
      const hillY = baseY - sz * 0.25;
      ctx.strokeStyle = col;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx + sz * 0.12, baseY);
      ctx.quadraticCurveTo(crossX, hillY - sz * 0.1, cx + sz * 0.68, baseY);
      ctx.stroke();
      ctx.strokeStyle = '#fde047';
      ctx.shadowColor = '#fde047';
      ctx.shadowBlur = 22;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(crossX, hillY);
      ctx.lineTo(crossX, hillY - sz * 0.56);
      ctx.moveTo(crossX - sz * 0.16, hillY - sz * 0.40);
      ctx.lineTo(crossX + sz * 0.16, hillY - sz * 0.40);
      ctx.stroke();
      break;
    }

    case 'paris': {
      // Paris: Iconic Eiffel Tower Lattice + Light Beacon
      const topY = cy - sz * 0.72;
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 3.5;
      // Left & right curved legs
      ctx.beginPath();
      ctx.moveTo(cx - sz * 0.42, baseY);
      ctx.quadraticCurveTo(cx - sz * 0.12, cy + sz * 0.05, cx - sz * 0.03, topY + sz * 0.12);
      ctx.lineTo(cx + sz * 0.03, topY + sz * 0.12);
      ctx.quadraticCurveTo(cx + sz * 0.12, cy + sz * 0.05, cx + sz * 0.42, baseY);
      ctx.stroke();
      // Base arch
      ctx.beginPath();
      ctx.arc(cx, baseY, sz * 0.22, Math.PI, 0, false);
      ctx.stroke();
      // Observation decks
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cx - sz * 0.28, baseY - sz * 0.34);
      ctx.lineTo(cx + sz * 0.28, baseY - sz * 0.34);
      ctx.moveTo(cx - sz * 0.16, baseY - sz * 0.68);
      ctx.lineTo(cx + sz * 0.16, baseY - sz * 0.68);
      // Spire
      ctx.moveTo(cx, topY + sz * 0.12);
      ctx.lineTo(cx, topY - sz * 0.08);
      ctx.stroke();
      // Searchlight rays
      ctx.strokeStyle = '#ffffff88';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, topY); ctx.lineTo(cx - sz * 0.65, topY - sz * 0.12);
      ctx.moveTo(cx, topY); ctx.lineTo(cx + sz * 0.65, topY - sz * 0.12);
      ctx.stroke();
      break;
    }

    case 'bucharest': {
      // Bucharest: Neoclassical Romanian Athenaeum Dome & 6 Columns
      const w = sz * 0.88;
      const pedY = baseY - sz * 0.48;
      // Dome behind pediment
      ctx.fillStyle = col + '33';
      ctx.strokeStyle = col;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, pedY, sz * 0.34, Math.PI, 0, false);
      ctx.fill();
      ctx.stroke();
      // Spire finial
      ctx.beginPath();
      ctx.moveTo(cx, pedY - sz * 0.34);
      ctx.lineTo(cx, pedY - sz * 0.50);
      ctx.stroke();
      // Triangular Pediment
      ctx.fillStyle = '#0b1124';
      ctx.strokeStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(cx - w / 2, pedY);
      ctx.lineTo(cx, pedY - sz * 0.22);
      ctx.lineTo(cx + w / 2, pedY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // 6 Classical Columns
      for (let i = 0; i < 6; i++) {
        const colX = (cx - w * 0.4) + i * (w * 0.8 / 5);
        ctx.beginPath();
        ctx.moveTo(colX, pedY);
        ctx.lineTo(colX, baseY);
        ctx.stroke();
      }
      break;
    }

    case 'newyork': {
      // New York: Empire State Spire + Manhattan Towers + Liberty Torch Crown
      const towers = [
        [-0.52, 0.18, 0.55], [-0.30, 0.20, 0.82], [-0.08, 0.22, 1.08],
        [0.18, 0.18, 0.74], [0.40, 0.18, 0.52]
      ];
      towers.forEach(([ox, tw, th], idx) => {
        const x = cx + ox * sz;
        const w = tw * sz;
        const h = th * sz;
        ctx.fillStyle = idx === 2 ? col + '44' : col + '22';
        ctx.strokeStyle = idx === 2 ? '#ffffff' : col;
        ctx.lineWidth = idx === 2 ? 3.2 : 2.2;
        ctx.fillRect(x, baseY - h, w, h);
        ctx.strokeRect(x, baseY - h, w, h);
      });
      // Empire spire needle
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(cx + sz * 0.03, baseY - sz * 1.08);
      ctx.lineTo(cx + sz * 0.03, baseY - sz * 1.32);
      ctx.stroke();
      break;
    }

    case 'tokyo': {
      // Tokyo: Mt Fuji Backdrop + Iconic Shinto Torii Gate
      ctx.strokeStyle = '#ffffff88';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(cx - sz * 0.7, baseY);
      ctx.quadraticCurveTo(cx - sz * 0.22, cy - sz * 0.35, cx - sz * 0.08, cy - sz * 0.48);
      ctx.lineTo(cx + sz * 0.08, cy - sz * 0.48);
      ctx.quadraticCurveTo(cx + sz * 0.22, cy - sz * 0.35, cx + sz * 0.7, baseY);
      ctx.stroke();
      // Rising Neon Sun
      ctx.fillStyle = '#f43f5e55';
      ctx.beginPath();
      ctx.arc(cx, cy - sz * 0.28, sz * 0.26, 0, Math.PI * 2);
      ctx.fill();
      // Torii Gate
      ctx.strokeStyle = '#ec4899';
      ctx.lineWidth = 6;
      const ty = baseY - sz * 0.68;
      ctx.beginPath();
      ctx.moveTo(cx - sz * 0.48, ty - sz * 0.06);
      ctx.quadraticCurveTo(cx, ty + sz * 0.06, cx + sz * 0.48, ty - sz * 0.06);
      ctx.moveTo(cx - sz * 0.38, ty + sz * 0.14);
      ctx.lineTo(cx + sz * 0.38, ty + sz * 0.14);
      ctx.moveTo(cx - sz * 0.26, ty);
      ctx.lineTo(cx - sz * 0.30, baseY);
      ctx.moveTo(cx + sz * 0.26, ty);
      ctx.lineTo(cx + sz * 0.30, baseY);
      ctx.stroke();
      break;
    }

    case 'dubai': {
      // Dubai: Burj Khalifa Stepped Needle + Burj Al Arab Sail
      ctx.strokeStyle = '#fde047';
      ctx.fillStyle = col + '33';
      ctx.lineWidth = 2.8;
      const steps = [
        [-0.18, 0.36, 0.32], [-0.13, 0.26, 0.58], [-0.09, 0.18, 0.84], [-0.045, 0.09, 1.08]
      ];
      steps.forEach(([ox, w, h]) => {
        ctx.fillRect(cx - sz * 0.12 + ox * sz, baseY - h * sz, w * sz, h * sz);
        ctx.strokeRect(cx - sz * 0.12 + ox * sz, baseY - h * sz, w * sz, h * sz);
      });
      ctx.beginPath();
      ctx.moveTo(cx - sz * 0.12, baseY - sz * 1.08);
      ctx.lineTo(cx - sz * 0.12, baseY - sz * 1.34);
      ctx.stroke();
      // Sail hotel on right
      ctx.strokeStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(cx + sz * 0.24, baseY);
      ctx.lineTo(cx + sz * 0.24, baseY - sz * 0.65);
      ctx.quadraticCurveTo(cx + sz * 0.56, baseY - sz * 0.38, cx + sz * 0.28, baseY);
      ctx.stroke();
      break;
    }

    case 'london': {
      // London: Big Ben Clock Tower + London Eye Ferris Wheel
      // London Eye
      const eyeX = cx + sz * 0.22, eyeY = baseY - sz * 0.42, eyeR = sz * 0.36;
      ctx.strokeStyle = col;
      ctx.lineWidth = 2.6;
      ctx.beginPath(); ctx.arc(eyeX, eyeY, eyeR, 0, Math.PI * 2); ctx.stroke();
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
        ctx.beginPath();
        ctx.moveTo(eyeX, eyeY);
        ctx.lineTo(eyeX + Math.cos(a) * eyeR, eyeY + Math.sin(a) * eyeR);
        ctx.stroke();
      }
      // Big Ben Tower
      const bx = cx - sz * 0.38, bw = sz * 0.24, bh = sz * 0.88;
      ctx.fillStyle = '#0c1328';
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 3;
      ctx.fillRect(bx, baseY - bh, bw, bh);
      ctx.strokeRect(bx, baseY - bh, bw, bh);
      ctx.beginPath();
      ctx.moveTo(bx, baseY - bh);
      ctx.lineTo(bx + bw / 2, baseY - bh - sz * 0.32);
      ctx.lineTo(bx + bw, baseY - bh);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.beginPath();
      ctx.arc(bx + bw / 2, baseY - bh + sz * 0.14, sz * 0.07, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }

    case 'rome': {
      // Rome: Colosseum Tiered Arches
      const w = sz * 1.15, h = sz * 0.66;
      const x0 = cx - w / 2, y0 = baseY - h;
      ctx.fillStyle = col + '28';
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x0, baseY);
      ctx.lineTo(x0, y0);
      ctx.lineTo(x0 + w * 0.72, y0);
      ctx.lineTo(x0 + w * 0.78, y0 + h * 0.28);
      ctx.lineTo(x0 + w, y0 + h * 0.28);
      ctx.lineTo(x0 + w, baseY);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      // 3 rows of Roman arches
      ctx.fillStyle = '#070a16';
      for (let row = 0; row < 3; row++) {
        const colsCount = row === 0 ? 4 : 5;
        for (let c = 0; c < colsCount; c++) {
          const ax = x0 + sz * 0.10 + c * (sz * 0.20);
          const ay = y0 + sz * 0.18 + row * (sz * 0.20);
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
      // Cairo: Three Pyramids of Giza + Orion Stars
      const pyrs = [[-0.36, 0.44], [0.02, 0.68], [0.38, 0.38]];
      pyrs.forEach(([ox, ps], idx) => {
        const px = cx + ox * sz;
        const ph = ps * sz;
        ctx.fillStyle = idx === 1 ? '#fbbf2444' : col + '33';
        ctx.strokeStyle = idx === 1 ? '#fde047' : col;
        ctx.lineWidth = 3;
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
      // Sydney: Opera House Sails
      ctx.fillStyle = '#ffffff28';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3.2;
      const sails = [[-0.45, 0.42], [-0.18, 0.62], [0.14, 0.52]];
      sails.forEach(([ox, sh]) => {
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
      // Universal Futuristic Metropolis Crest + Flag/Code Medallion (works for Miami, Barcelona, Monaco, Custom Cities...)
      const bars = [
        [-0.50, 0.14, 0.45], [-0.33, 0.15, 0.68], [-0.14, 0.28, 0.92],
        [0.17, 0.15, 0.72], [0.35, 0.14, 0.48]
      ];
      bars.forEach(([ox, bw, bh], i) => {
        const bx = cx + ox * sz;
        ctx.fillStyle = i === 2 ? col + '40' : col + '22';
        ctx.strokeStyle = i === 2 ? '#fbbf24' : col;
        ctx.lineWidth = i === 2 ? 3.2 : 2.2;
        ctx.fillRect(bx, baseY - bh * sz, bw * sz, bh * sz);
        ctx.strokeRect(bx, baseY - bh * sz, bw * sz, bh * sz);
      });
      // Spire + Crest Star
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(cx, baseY - sz * 0.92);
      ctx.lineTo(cx, baseY - sz * 1.16);
      ctx.stroke();
      const cityObj = getCityById(cityId);
      ctx.font = `900 ${Math.round(sz * 0.26)}px "Orbitron", sans-serif`;
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText(cityObj ? cityObj.code : 'REMO', cx, baseY - sz * 0.42);
      break;
    }
  }

  ctx.restore();
}

const REMO_BUNDLED_CITY_IMAGE_IDS = new Set([
  'montreal', 'paris', 'chisinau', 'bucharest', 'newyork', 'tokyo',
  'london', 'dubai', 'miami', 'barcelona', 'rome', 'toronto',
  'monaco', 'losangeles', 'seoul', 'geneva', 'singapore', 'sydney',
  'rio', 'istanbul', 'berlin', 'amsterdam', 'lisbon', 'cairo'
]);

function getDefaultCityCardImageUrl(cityId) {
  const id = String(cityId || '').trim().toLowerCase();
  if (!REMO_BUNDLED_CITY_IMAGE_IDS.has(id)) return '';
  const prefix = (typeof location !== 'undefined' && /\/fr\//i.test(String(location.pathname || '')))
    ? '../img/cities/'
    : './img/cities/';
  return prefix + id + '.jpg';
}

function resolveCityRealPhotoUrl(cityOrId) {
  const city = (cityOrId && typeof cityOrId === 'object') ? cityOrId : getCityById(cityOrId);
  const cid = String((city && city.id) || (typeof cityOrId === 'string' ? cityOrId : '') || '').trim().toLowerCase();
  if (city) {
    const custom = city.cardImageUrl || city.imageUrl || city.photoUrl || '';
    if (custom && typeof custom === 'string' && !custom.startsWith('data:image/svg')) {
      return custom;
    }
  }
  return cid ? getDefaultCityCardImageUrl(cid) : '';
}

async function fetchCityPhotoFromWikipedia(cityName, countryName) {
  if (typeof fetch !== 'function') return '';
  const cleanCity = String(cityName || '').trim();
  const cleanCountry = String(countryName || '').trim();
  if (!cleanCity) return '';

  const candidates = [];
  if (cleanCountry && cleanCountry.toLowerCase() !== 'world') {
    candidates.push(`${cleanCity}, ${cleanCountry}`);
  }
  candidates.push(cleanCity);

  const hosts = ['en.wikipedia.org', 'fr.wikipedia.org'];
  for (let hIdx = 0; hIdx < hosts.length; hIdx++) {
    const host = hosts[hIdx];
    for (let cIdx = 0; cIdx < candidates.length; cIdx++) {
      const title = candidates[cIdx];
      let timer = null;
      try {
        const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
        if (ctrl) timer = setTimeout(() => { try { ctrl.abort(); } catch (e) {} }, 5000);
        const url = `https://${host}/w/api.php?action=query&prop=pageimages&piprop=thumbnail&pithumbsize=960&redirects=1&format=json&origin=*&titles=${encodeURIComponent(title)}`;
        const resp = await fetch(url, ctrl ? { signal: ctrl.signal } : undefined);
        if (!resp || !resp.ok) continue;
        const json = await resp.json();
        const pages = json && json.query && json.query.pages;
        if (!pages || typeof pages !== 'object') continue;
        const pageIds = Object.keys(pages);
        for (let pIdx = 0; pIdx < pageIds.length; pIdx++) {
          const pg = pages[pageIds[pIdx]];
          const src = pg && pg.thumbnail && pg.thumbnail.source ? String(pg.thumbnail.source) : '';
          if (src && /^https:\/\//i.test(src) && !/\.(svg|pdf)(\?|$)/i.test(src)) {
            return src;
          }
        }
      } catch (e) {
      } finally {
        if (timer) clearTimeout(timer);
      }
    }
  }
  return '';
}

function updateRemoCityMedia(cityId, patch = {}) {
  const cid = String(cityId || '').trim().toLowerCase();
  if (!cid || !patch || typeof patch !== 'object') return null;
  const list = getRemoCities();
  const idx = list.findIndex((c) => c && String(c.id).toLowerCase() === cid);
  if (idx === -1) return null;
  const target = Object.assign({}, list[idx]);
  ['imageUrl', 'cardImageUrl', 'radioStreamUrl', 'radioName', 'radioBadge', 'tagline_en', 'tagline_fr'].forEach((k) => {
    if (patch[k] !== undefined) {
      const val = String(patch[k] || '').trim();
      if (val) target[k] = val;
      else delete target[k];
    }
  });
  list[idx] = target;
  saveRemoCities(list);
  return target;
}

const _REMO_DEFAULT_CITY_IDS = new Set(REMO_DEFAULT_CITIES.map((c) => c.id));
function getCustomRemoCitiesPatch() {
  return getRemoCities().filter((c) => {
    if (!c || !c.id) return false;
    if (!_REMO_DEFAULT_CITY_IDS.has(c.id)) return true;
    return Boolean(c.imageUrl || c.cardImageUrl || c.radioStreamUrl);
  }).slice(-80);
}

function mergeCustomRemoCitiesFromCloud(cloudCities) {
  if (!Array.isArray(cloudCities) || !cloudCities.length) return false;
  const current = getRemoCities();
  const byId = new Map(current.map((c) => [c.id, c]));
  let changed = false;

  cloudCities.forEach((cc) => {
    if (!cc || !cc.id || !cc.name_en) return;
    const existing = byId.get(cc.id);
    if (!existing) {
      current.push(cc);
      byId.set(cc.id, cc);
      changed = true;
    } else {
      let updated = false;
      ['imageUrl', 'cardImageUrl', 'radioStreamUrl', 'radioName', 'radioBadge'].forEach((k) => {
        if (cc[k] && !existing[k]) {
          existing[k] = cc[k];
          updated = true;
        }
      });
      if (updated) changed = true;
    }
  });

  if (changed) {
    saveRemoCities(current);
  }
  return changed;
}

/* Crisp heraldic / architectural emblem watermark rendered inside the card artwork corner */
function drawCityCrestWatermark(ctx, city, x, y, r = 19, color = '#fbbf24') {
  if (!ctx || !city) return;
  const cid = String(city.id || '').toLowerCase();
  ctx.save();
  ctx.translate(x, y);

  // Translucent obsidian glass seal + rarity metallic ring
  ctx.fillStyle = 'rgba(5, 8, 22, 0.78)';
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = color;
  ctx.lineWidth = 1.8;
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.arc(0, 0, r - 3.2, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = '#fef3c7';
  ctx.fillStyle = color;
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const s = r * 0.52;
  if (cid === 'montreal') {
    // Stylized Fleur-de-lis crest
    ctx.beginPath();
    ctx.moveTo(0, -s * 1.05);
    ctx.quadraticCurveTo(s * 0.42, -s * 0.25, 0, s * 0.35);
    ctx.quadraticCurveTo(-s * 0.42, -s * 0.25, 0, -s * 1.05);
    ctx.moveTo(0, s * 0.28);
    ctx.quadraticCurveTo(s * 0.85, -s * 0.35, s * 0.78, s * 0.22);
    ctx.quadraticCurveTo(s * 0.45, s * 0.42, 0, s * 0.28);
    ctx.quadraticCurveTo(-s * 0.85, -s * 0.35, -s * 0.78, s * 0.22);
    ctx.quadraticCurveTo(-s * 0.45, s * 0.42, 0, s * 0.28);
    ctx.moveTo(-s * 0.52, s * 0.48);
    ctx.lineTo(s * 0.52, s * 0.48);
    ctx.moveTo(0, s * 0.48);
    ctx.lineTo(0, s * 0.92);
    ctx.stroke();
  } else if (cid === 'paris') {
    // Minimalist Eiffel crest
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.lineTo(s * 0.58, s * 0.85);
    ctx.moveTo(0, -s);
    ctx.lineTo(-s * 0.58, s * 0.85);
    ctx.moveTo(-s * 0.35, s * 0.15);
    ctx.lineTo(s * 0.35, s * 0.15);
    ctx.moveTo(-s * 0.72, s * 0.85);
    ctx.lineTo(s * 0.72, s * 0.85);
    ctx.stroke();
  } else if (cid === 'chisinau' || cid === 'bucharest' || cid === 'rome' || cid === 'berlin') {
    // Neoclassical Triumphal Arch / Colonnade crest
    ctx.beginPath();
    ctx.moveTo(-s * 0.85, -s * 0.35);
    ctx.lineTo(0, -s * 0.95);
    ctx.lineTo(s * 0.85, -s * 0.35);
    ctx.closePath();
    ctx.stroke();
    [-0.55, 0, 0.55].forEach((px) => {
      ctx.beginPath();
      ctx.moveTo(s * px, -s * 0.32);
      ctx.lineTo(s * px, s * 0.75);
      ctx.stroke();
    });
    ctx.beginPath();
    ctx.moveTo(-s * 0.9, s * 0.78);
    ctx.lineTo(s * 0.9, s * 0.78);
    ctx.stroke();
  } else if (cid === 'london' || cid === 'monaco') {
    // Sovereign Crown emblem
    ctx.beginPath();
    ctx.moveTo(-s * 0.82, s * 0.65);
    ctx.lineTo(-s * 0.9, -s * 0.35);
    ctx.lineTo(-s * 0.38, s * 0.1);
    ctx.lineTo(0, -s * 0.75);
    ctx.lineTo(s * 0.38, s * 0.1);
    ctx.lineTo(s * 0.9, -s * 0.35);
    ctx.lineTo(s * 0.82, s * 0.65);
    ctx.closePath();
    ctx.stroke();
  } else if (cid === 'newyork' || cid === 'miami' || cid === 'losangeles') {
    // Radiant Art Deco / Torch Crown crest
    ctx.beginPath();
    ctx.arc(0, s * 0.18, s * 0.45, Math.PI, 0);
    ctx.stroke();
    for (let i = -2; i <= 2; i++) {
      const a = -Math.PI / 2 + i * 0.42;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * s * 0.45, s * 0.18 + Math.sin(a) * s * 0.45);
      ctx.lineTo(Math.cos(a) * s * 1.0, s * 0.18 + Math.sin(a) * s * 1.0);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(-s * 0.7, s * 0.65);
    ctx.lineTo(s * 0.7, s * 0.65);
    ctx.stroke();
  } else if (cid === 'tokyo' || cid === 'seoul' || cid === 'singapore') {
    // Torii / Rising Sun emblem
    ctx.beginPath();
    ctx.moveTo(-s * 0.92, -s * 0.55);
    ctx.quadraticCurveTo(0, -s * 0.35, s * 0.92, -s * 0.55);
    ctx.moveTo(-s * 0.72, -s * 0.12);
    ctx.lineTo(s * 0.72, -s * 0.12);
    ctx.moveTo(-s * 0.45, -s * 0.45);
    ctx.lineTo(-s * 0.52, s * 0.78);
    ctx.moveTo(s * 0.45, -s * 0.45);
    ctx.lineTo(s * 0.52, s * 0.78);
    ctx.stroke();
  } else if (cid === 'dubai' || cid === 'cairo') {
    // Twin Pyramid / Spire crest
    ctx.beginPath();
    ctx.moveTo(-s * 0.9, s * 0.72);
    ctx.lineTo(-s * 0.12, -s * 0.85);
    ctx.lineTo(s * 0.65, s * 0.72);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(s * 0.25, s * 0.72);
    ctx.lineTo(s * 0.62, -s * 0.25);
    ctx.lineTo(s * 0.95, s * 0.72);
    ctx.stroke();
  } else if (cid === 'toronto') {
    // Maple Leaf + Tower spire crest
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.lineTo(s * 0.22, -s * 0.38);
    ctx.lineTo(s * 0.85, -s * 0.48);
    ctx.lineTo(s * 0.42, s * 0.08);
    ctx.lineTo(s * 0.72, s * 0.42);
    ctx.lineTo(0, s * 0.3);
    ctx.lineTo(-s * 0.72, s * 0.42);
    ctx.lineTo(-s * 0.42, s * 0.08);
    ctx.lineTo(-s * 0.85, -s * 0.48);
    ctx.lineTo(-s * 0.22, -s * 0.38);
    ctx.closePath();
    ctx.stroke();
  } else if (cid === 'geneva') {
    // Helvetic Precision Cross crest
    ctx.fillStyle = '#fef3c7';
    ctx.fillRect(-s * 0.18, -s * 0.72, s * 0.36, s * 1.44);
    ctx.fillRect(-s * 0.72, -s * 0.18, s * 1.44, s * 0.36);
  } else if (cid === 'istanbul') {
    // Crescent & Star dome crest
    ctx.beginPath();
    ctx.arc(-s * 0.08, 0, s * 0.72, 0.65, Math.PI * 2 - 0.65);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(s * 0.42, 0, s * 0.14, 0, Math.PI * 2);
    ctx.fill();
  } else if (cid === 'sydney' || cid === 'lisbon' || cid === 'amsterdam') {
    // Sails / Maritime Crest
    ctx.beginPath();
    ctx.arc(s * 0.1, s * 0.55, s * 0.85, Math.PI * 1.05, Math.PI * 1.75);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(-s * 0.35, s * 0.55, s * 0.58, Math.PI * 1.08, Math.PI * 1.78);
    ctx.closePath();
    ctx.stroke();
  } else if (cid === 'rio') {
    // Radiant Skyline Cross / Peak
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.92);
    ctx.lineTo(0, s * 0.82);
    ctx.moveTo(-s * 0.72, -s * 0.38);
    ctx.lineTo(s * 0.72, -s * 0.38);
    ctx.moveTo(-s * 0.85, s * 0.82);
    ctx.lineTo(0, s * 0.2);
    ctx.lineTo(s * 0.85, s * 0.82);
    ctx.stroke();
  } else {
    // Compass Rose / Barcelona Star Emblem
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      const rad = i % 2 === 0 ? s * 0.95 : s * 0.38;
      const px = Math.cos(a) * rad, py = Math.sin(a) * rad;
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();
  }

  ctx.restore();
}

window.REMO_DEFAULT_CITIES = REMO_DEFAULT_CITIES;
window.REMO_ELEMENTS = REMO_ELEMENTS;
window.REMO_BUNDLED_CITY_IMAGE_IDS = REMO_BUNDLED_CITY_IMAGE_IDS;
window.getDefaultCityCardImageUrl = getDefaultCityCardImageUrl;
window.resolveCityRealPhotoUrl = resolveCityRealPhotoUrl;
window.fetchCityPhotoFromWikipedia = fetchCityPhotoFromWikipedia;
window.updateRemoCityMedia = updateRemoCityMedia;
window.getCustomRemoCitiesPatch = getCustomRemoCitiesPatch;
window.mergeCustomRemoCitiesFromCloud = mergeCustomRemoCitiesFromCloud;
window.drawCityCrestWatermark = drawCityCrestWatermark;
window.getRemoCities = getRemoCities;
window.saveRemoCities = saveRemoCities;
window.getCityById = getCityById;
window.getCityName = getCityName;
window.getCityCountry = getCityCountry;
window.getCityTagline = getCityTagline;
window.getCityDesc = getCityDesc;
window.computeCityPvPStats = computeCityPvPStats;
window.drawCityLandmark = drawCityLandmark;

/* ── 5. REMO WORLD COUNTRY FLAGS (CRISP GRAPHIC SVG + 3D WAVING CANVAS) ── */
(function () {
  const CITY_COUNTRY_ISO = {
    montreal: 'CA',
    toronto: 'CA',
    paris: 'FR',
    chisinau: 'MD',
    bucharest: 'RO',
    newyork: 'US',
    miami: 'US',
    losangeles: 'US',
    tokyo: 'JP',
    london: 'GB',
    dubai: 'AE',
    barcelona: 'ES',
    rome: 'IT',
    monaco: 'MC',
    seoul: 'KR',
    geneva: 'CH',
    singapore: 'SG',
    sydney: 'AU',
    rio: 'BR',
    istanbul: 'TR',
    berlin: 'DE',
    amsterdam: 'NL',
    lisbon: 'PT',
    cairo: 'EG'
  };

  function isRegionalEmoji(str) {
    if (typeof str !== 'string') return false;
    const cps = Array.from(str.trim());
    if (cps.length !== 2) return false;
    const c0 = cps[0].codePointAt(0);
    const c1 = cps[1].codePointAt(0);
    return c0 >= 0x1f1e6 && c0 <= 0x1f1ff && c1 >= 0x1f1e6 && c1 <= 0x1f1ff;
  }

  function decodeRegionalEmoji(str) {
    if (!isRegionalEmoji(str)) return null;
    const cps = Array.from(str.trim());
    return (
      String.fromCharCode(65 + cps[0].codePointAt(0) - 0x1f1e6) +
      String.fromCharCode(65 + cps[1].codePointAt(0) - 0x1f1e6)
    );
  }

  function getCountryCode(input) {
    if (!input) return null;
    if (typeof input === 'string') {
      const s = input.trim();
      if (/^[A-Za-z]{2}$/.test(s)) return s.toUpperCase();
      const iso = decodeRegionalEmoji(s);
      if (iso) return iso;
      if (CITY_COUNTRY_ISO[s.toLowerCase()]) return CITY_COUNTRY_ISO[s.toLowerCase()];
      return null;
    }
    if (typeof input === 'object') {
      if (input.countryIso && /^[A-Za-z]{2}$/.test(input.countryIso)) return input.countryIso.toUpperCase();
      if (input.flag && isRegionalEmoji(input.flag)) return decodeRegionalEmoji(input.flag);
      if (input.icon && isRegionalEmoji(input.icon)) return decodeRegionalEmoji(input.icon);
      if (input.cityId && CITY_COUNTRY_ISO[input.cityId]) return CITY_COUNTRY_ISO[input.cityId];
      if (input.id && CITY_COUNTRY_ISO[input.id]) return CITY_COUNTRY_ISO[input.id];
    }
    return null;
  }

  function _drawStarC(ctx, cx, cy, outerR, points, innerRatio) {
    const innerR = outerR * (innerRatio || 0.42);
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const a = -Math.PI / 2 + (i * Math.PI) / points;
      if (i === 0) ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      else ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    }
    ctx.closePath();
    ctx.fill();
  }

  function _drawMapleLeafC(ctx, cx, cy, s) {
    const pts = [
      [0, -0.44], [0.09, -0.22], [0.22, -0.27], [0.16, -0.08],
      [0.4, -0.14], [0.33, 0.0], [0.43, 0.08], [0.18, 0.14],
      [0.2, 0.27], [0.04, 0.21], [0.04, 0.43], [-0.04, 0.43],
      [-0.04, 0.21], [-0.2, 0.27], [-0.18, 0.14], [-0.43, 0.08],
      [-0.33, 0.0], [-0.4, -0.14], [-0.16, -0.08], [-0.22, -0.27],
      [-0.09, -0.22]
    ];
    ctx.beginPath();
    pts.forEach((p, idx) => {
      const px = cx + p[0] * s;
      const py = cy + p[1] * s;
      if (idx === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.closePath();
    ctx.fill();
  }

  function _drawUnionJackC(ctx, x, y, w, h) {
    ctx.fillStyle = '#012169';
    ctx.fillRect(x, y, w, h);
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    const lwW = Math.max(2, h * 0.22);
    const lwR = Math.max(1.2, h * 0.12);
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = lwW;
    ctx.beginPath();
    ctx.moveTo(x, y); ctx.lineTo(x + w, y + h);
    ctx.moveTo(x + w, y); ctx.lineTo(x, y + h);
    ctx.stroke();

    ctx.strokeStyle = '#C8102E';
    ctx.lineWidth = lwR;
    ctx.beginPath();
    ctx.moveTo(x, y); ctx.lineTo(x + w, y + h);
    ctx.moveTo(x + w, y); ctx.lineTo(x, y + h);
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x + w * 0.5 - lwW * 0.72, y, lwW * 1.44, h);
    ctx.fillRect(x, y + h * 0.5 - lwW * 0.72, w, lwW * 1.44);

    ctx.fillStyle = '#C8102E';
    ctx.fillRect(x + w * 0.5 - lwW * 0.42, y, lwW * 0.84, h);
    ctx.fillRect(x, y + h * 0.5 - lwW * 0.42, w, lwW * 0.84);
    ctx.restore();
  }

  function drawFlagToCanvas(ctx, isoInput, x, y, w, h) {
    const iso = getCountryCode(isoInput) || 'CA';
    ctx.save();

    const v3 = (c1, c2, c3) => {
      ctx.fillStyle = c1; ctx.fillRect(x, y, w / 3 + 0.5, h);
      ctx.fillStyle = c2; ctx.fillRect(x + w / 3, y, w / 3 + 0.5, h);
      ctx.fillStyle = c3; ctx.fillRect(x + (w * 2) / 3, y, w / 3 + 0.5, h);
    };
    const h3 = (c1, c2, c3) => {
      ctx.fillStyle = c1; ctx.fillRect(x, y, w, h / 3 + 0.5);
      ctx.fillStyle = c2; ctx.fillRect(x, y + h / 3, w, h / 3 + 0.5);
      ctx.fillStyle = c3; ctx.fillRect(x, y + (h * 2) / 3, w, h / 3 + 0.5);
    };

    switch (iso) {
      case 'FR': v3('#0055A4', '#FFFFFF', '#EF4135'); break;
      case 'IT': v3('#009246', '#FFFFFF', '#CE2B37'); break;
      case 'RO': v3('#002B7F', '#FCD116', '#CE1126'); break;
      case 'MD':
        v3('#0046AE', '#FFD200', '#CC092F');
        ctx.fillStyle = '#7C4D1E';
        ctx.beginPath();
        ctx.ellipse(x + w * 0.5, y + h * 0.52, w * 0.085, h * 0.21, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#B91C1C';
        ctx.fillRect(x + w * 0.465, y + h * 0.42, w * 0.07, h * 0.16);
        ctx.fillStyle = '#FACC15';
        _drawStarC(ctx, x + w * 0.5, y + h * 0.25, h * 0.06, 5, 0.45);
        break;
      case 'CA':
        ctx.fillStyle = '#D80621'; ctx.fillRect(x, y, w * 0.25, h);
        ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x + w * 0.248, y, w * 0.504, h);
        ctx.fillStyle = '#D80621'; ctx.fillRect(x + w * 0.75, y, w * 0.25, h);
        ctx.fillStyle = '#D80621';
        _drawMapleLeafC(ctx, x + w * 0.5, y + h * 0.5, h * 0.78);
        break;
      case 'US': {
        for (let i = 0; i < 13; i++) {
          ctx.fillStyle = i % 2 === 0 ? '#B22234' : '#FFFFFF';
          ctx.fillRect(x, y + (i * h) / 13, w, h / 13 + 0.6);
        }
        ctx.fillStyle = '#3C3B6E';
        ctx.fillRect(x, y, w * 0.42, h * (7 / 13));
        ctx.fillStyle = '#FFFFFF';
        for (let r = 0; r < 4; r++) {
          for (let c = 0; c < 5; c++) {
            const sx = x + w * (0.045 + c * 0.08 + (r % 2) * 0.02);
            const sy = y + h * (0.07 + r * 0.125);
            ctx.beginPath();
            ctx.arc(sx, sy, Math.max(0.8, h * 0.024), 0, Math.PI * 2);
            ctx.fill();
          }
        }
        break;
      }
      case 'JP':
        ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x, y, w, h);
        ctx.fillStyle = '#BC002D';
        ctx.beginPath();
        ctx.arc(x + w * 0.5, y + h * 0.5, h * 0.3, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'GB':
        _drawUnionJackC(ctx, x, y, w, h);
        break;
      case 'AE':
        h3('#00732F', '#FFFFFF', '#000000');
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(x, y, w * 0.26, h);
        break;
      case 'ES':
        ctx.fillStyle = '#AA151B'; ctx.fillRect(x, y, w, h * 0.25);
        ctx.fillStyle = '#F1BF00'; ctx.fillRect(x, y + h * 0.25, w, h * 0.5);
        ctx.fillStyle = '#AA151B'; ctx.fillRect(x, y + h * 0.75, w, h * 0.25);
        ctx.fillStyle = '#991B1B';
        ctx.fillRect(x + w * 0.24, y + h * 0.36, w * 0.1, h * 0.28);
        ctx.fillStyle = '#D97706';
        ctx.fillRect(x + w * 0.255, y + h * 0.31, w * 0.07, h * 0.06);
        break;
      case 'MC':
        ctx.fillStyle = '#CE1126'; ctx.fillRect(x, y, w, h * 0.5 + 0.5);
        ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x, y + h * 0.5, w, h * 0.5 + 0.5);
        break;
      case 'KR':
        ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x, y, w, h);
        ctx.save();
        ctx.translate(x + w * 0.5, y + h * 0.5);
        ctx.rotate(-0.45);
        const krR = h * 0.24;
        ctx.fillStyle = '#CD2E3A';
        ctx.beginPath(); ctx.arc(0, 0, krR, Math.PI, 0); ctx.fill();
        ctx.fillStyle = '#0047A0';
        ctx.beginPath(); ctx.arc(0, 0, krR, 0, Math.PI); ctx.fill();
        ctx.fillStyle = '#CD2E3A';
        ctx.beginPath(); ctx.arc(-krR * 0.5, 0, krR * 0.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#0047A0';
        ctx.beginPath(); ctx.arc(krR * 0.5, 0, krR * 0.5, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        ctx.fillStyle = '#111827';
        [[-0.28, -0.25, -0.58], [0.28, -0.25, 0.58], [-0.28, 0.25, 0.58], [0.28, 0.25, -0.58]].forEach((bar) => {
          ctx.save();
          ctx.translate(x + w * (0.5 + bar[0]), y + h * (0.5 + bar[1]));
          ctx.rotate(bar[2]);
          ctx.fillRect(-w * 0.06, -h * 0.06, w * 0.12, h * 0.03);
          ctx.fillRect(-w * 0.06, -h * 0.015, w * 0.12, h * 0.03);
          ctx.fillRect(-w * 0.06, h * 0.03, w * 0.12, h * 0.03);
          ctx.restore();
        });
        break;
      case 'CH':
        ctx.fillStyle = '#D52B1E'; ctx.fillRect(x, y, w, h);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x + w * 0.42, y + h * 0.2, w * 0.16, h * 0.6);
        ctx.fillRect(x + w * 0.3, y + h * 0.38, w * 0.4, h * 0.24);
        break;
      case 'SG':
        ctx.fillStyle = '#EF3340'; ctx.fillRect(x, y, w, h * 0.5 + 0.5);
        ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x, y + h * 0.5, w, h * 0.5 + 0.5);
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath(); ctx.arc(x + w * 0.21, y + h * 0.25, h * 0.16, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#EF3340';
        ctx.beginPath(); ctx.arc(x + w * 0.25, y + h * 0.25, h * 0.145, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        for (let s = 0; s < 5; s++) {
          const a = -Math.PI / 2 + (s * Math.PI * 2) / 5;
          _drawStarC(ctx, x + w * 0.29 + Math.cos(a) * h * 0.1, y + h * 0.25 + Math.sin(a) * h * 0.1, h * 0.032, 5, 0.42);
        }
        break;
      case 'AU':
        ctx.fillStyle = '#00008B'; ctx.fillRect(x, y, w, h);
        _drawUnionJackC(ctx, x, y, w * 0.48, h * 0.5);
        ctx.fillStyle = '#FFFFFF';
        _drawStarC(ctx, x + w * 0.24, y + h * 0.74, h * 0.12, 7, 0.45);
        [[0.73, 0.22], [0.85, 0.42], [0.62, 0.46], [0.73, 0.78], [0.79, 0.57]].forEach((p, idx) => {
          _drawStarC(ctx, x + w * p[0], y + h * p[1], idx === 4 ? h * 0.04 : h * 0.06, 5, 0.42);
        });
        break;
      case 'BR':
        ctx.fillStyle = '#009B3A'; ctx.fillRect(x, y, w, h);
        ctx.fillStyle = '#FEDF00';
        ctx.beginPath();
        ctx.moveTo(x + w * 0.5, y + h * 0.14);
        ctx.lineTo(x + w * 0.86, y + h * 0.5);
        ctx.lineTo(x + w * 0.5, y + h * 0.86);
        ctx.lineTo(x + w * 0.14, y + h * 0.5);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#002776';
        ctx.beginPath(); ctx.arc(x + w * 0.5, y + h * 0.5, h * 0.22, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = Math.max(1.2, h * 0.045);
        ctx.beginPath();
        ctx.arc(x + w * 0.45, y + h * 0.64, h * 0.28, -1.95, -0.82);
        ctx.stroke();
        break;
      case 'TR':
        ctx.fillStyle = '#E30A17'; ctx.fillRect(x, y, w, h);
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath(); ctx.arc(x + w * 0.4, y + h * 0.5, h * 0.25, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#E30A17';
        ctx.beginPath(); ctx.arc(x + w * 0.46, y + h * 0.5, h * 0.2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        _drawStarC(ctx, x + w * 0.64, y + h * 0.5, h * 0.12, 5, 0.4);
        break;
      case 'DE': h3('#000000', '#DD0000', '#FFCC00'); break;
      case 'NL': h3('#AE1C28', '#FFFFFF', '#21468B'); break;
      case 'PT':
        ctx.fillStyle = '#006600'; ctx.fillRect(x, y, w * 0.4, h);
        ctx.fillStyle = '#FF0000'; ctx.fillRect(x + w * 0.398, y, w * 0.602, h);
        ctx.fillStyle = '#FFCC00';
        ctx.beginPath(); ctx.arc(x + w * 0.4, y + h * 0.5, h * 0.22, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#DC2626';
        ctx.fillRect(x + w * 0.35, y + h * 0.38, w * 0.1, h * 0.24);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x + w * 0.37, y + h * 0.41, w * 0.06, h * 0.18);
        break;
      case 'EG':
        h3('#CE1126', '#FFFFFF', '#000000');
        ctx.fillStyle = '#C09300';
        ctx.fillRect(x + w * 0.44, y + h * 0.38, w * 0.12, h * 0.24);
        _drawStarC(ctx, x + w * 0.5, y + h * 0.44, h * 0.08, 4, 0.5);
        break;
      default:
        v3('#38BDF8', '#0F172A', '#8B5CF6');
        break;
    }

    ctx.restore();
  }

  const _flatFlagCache = {};

  function _getFlatFlagCanvas(iso) {
    if (typeof document === 'undefined') return null;
    if (_flatFlagCache[iso]) return _flatFlagCache[iso];
    const c = document.createElement('canvas');
    c.width = 160;
    c.height = 104;
    const fctx = c.getContext && c.getContext('2d');
    if (!fctx) return null;
    drawFlagToCanvas(fctx, iso, 0, 0, c.width, c.height);
    _flatFlagCache[iso] = c;
    return c;
  }

  function drawWavingFlag(ctx, isoInput, x, y, w, h, phase, windStrength, withPole) {
    const iso = getCountryCode(isoInput);
    if (!iso) return;
    const wind = typeof windStrength === 'number' ? windStrength : 1;
    const showPole = withPole !== false;
    const poleW = showPole ? Math.max(3, w * 0.065) : 0;
    const fx = x + (showPole ? poleW + 1 : 0);
    const fw = Math.max(18, w - (showPole ? poleW + 3 : 0));
    const fh = Math.max(12, h * 0.8);
    const fy = y + h * 0.12;

    ctx.save();

    if (showPole) {
      const px = x + poleW * 0.45;
      const poleGrad = ctx.createLinearGradient(px, y, px + poleW * 0.8, y);
      poleGrad.addColorStop(0, '#94a3b8');
      poleGrad.addColorStop(0.5, '#f8fafc');
      poleGrad.addColorStop(1, '#475569');
      ctx.fillStyle = poleGrad;
      ctx.fillRect(px, y + 3, poleW * 0.65, h - 2);
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(px + poleW * 0.32, y + 3, poleW * 0.65, 0, Math.PI * 2);
      ctx.fill();
    }

    const flat = _getFlatFlagCanvas(iso);
    const strips = 28;
    const stripW = fw / strips;
    const freq = 1.9 + wind * 0.75;
    const amp = fh * 0.11 * (0.65 + wind * 0.45);

    if (flat) {
      const sw = flat.width / strips;
      for (let i = 0; i < strips; i++) {
        const t = i / strips;
        const angle = (phase || 0) * freq - t * 5.2;
        const waveY = Math.sin(angle) * amp * Math.pow(t, 1.15);
        const shade = Math.cos(angle);
        const dx = fx + i * stripW;
        const dy = fy + waveY;
        ctx.drawImage(flat, i * sw, 0, sw, flat.height, dx, dy, stripW + 0.85, fh);
        if (shade > 0.06) {
          ctx.fillStyle = `rgba(255,255,255,${(shade * 0.17).toFixed(3)})`;
          ctx.fillRect(dx, dy, stripW + 0.85, fh);
        } else if (shade < -0.06) {
          ctx.fillStyle = `rgba(0,0,0,${((-shade) * 0.25).toFixed(3)})`;
          ctx.fillRect(dx, dy, stripW + 0.85, fh);
        }
      }
    } else {
      drawFlagToCanvas(ctx, iso, fx, fy, fw, fh);
    }

    ctx.restore();
  }

  function _svgStar(cx, cy, r, fill) {
    const pts = [];
    for (let i = 0; i < 10; i++) {
      const rr = i % 2 === 0 ? r : r * 0.42;
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      pts.push(`${(cx + Math.cos(a) * rr).toFixed(1)},${(cy + Math.sin(a) * rr).toFixed(1)}`);
    }
    return `<polygon points="${pts.join(' ')}" fill="${fill}"/>`;
  }

  function _svgFlagBody(iso) {
    const v3 = (a, b, c) =>
      `<rect x="0" y="0" width="10.2" height="20" fill="${a}"/><rect x="10" y="0" width="10.2" height="20" fill="${b}"/><rect x="20" y="0" width="10" height="20" fill="${c}"/>`;
    const h3 = (a, b, c) =>
      `<rect x="0" y="0" width="30" height="6.8" fill="${a}"/><rect x="0" y="6.66" width="30" height="6.8" fill="${b}"/><rect x="0" y="13.33" width="30" height="6.8" fill="${c}"/>`;
    const uj = (w, h) => {
      const mx = (w / 2).toFixed(1);
      const my = (h / 2).toFixed(1);
      return `<rect x="0" y="0" width="${w}" height="${h}" fill="#012169"/>` +
        `<line x1="0" y1="0" x2="${w}" y2="${h}" stroke="#fff" stroke-width="${(h * 0.2).toFixed(1)}"/>` +
        `<line x1="${w}" y1="0" x2="0" y2="${h}" stroke="#fff" stroke-width="${(h * 0.2).toFixed(1)}"/>` +
        `<line x1="0" y1="0" x2="${w}" y2="${h}" stroke="#C8102E" stroke-width="${(h * 0.1).toFixed(1)}"/>` +
        `<line x1="${w}" y1="0" x2="0" y2="${h}" stroke="#C8102E" stroke-width="${(h * 0.1).toFixed(1)}"/>` +
        `<rect x="${(mx - w * 0.14).toFixed(1)}" y="0" width="${(w * 0.28).toFixed(1)}" height="${h}" fill="#fff"/>` +
        `<rect x="0" y="${(my - h * 0.18).toFixed(1)}" width="${w}" height="${(h * 0.36).toFixed(1)}" fill="#fff"/>` +
        `<rect x="${(mx - w * 0.08).toFixed(1)}" y="0" width="${(w * 0.16).toFixed(1)}" height="${h}" fill="#C8102E"/>` +
        `<rect x="0" y="${(my - h * 0.1).toFixed(1)}" width="${w}" height="${(h * 0.2).toFixed(1)}" fill="#C8102E"/>`;
    };

    switch (iso) {
      case 'FR': return v3('#0055A4', '#FFFFFF', '#EF4135');
      case 'IT': return v3('#009246', '#FFFFFF', '#CE2B37');
      case 'RO': return v3('#002B7F', '#FCD116', '#CE1126');
      case 'MD': return v3('#0046AE', '#FFD200', '#CC092F') +
        `<ellipse cx="15" cy="10.4" rx="2.5" ry="4.2" fill="#7C4D1E"/><rect x="13.8" y="8.6" width="2.4" height="3.2" fill="#B91C1C"/>${_svgStar(15, 5.2, 1.3, '#FACC15')}`;
      case 'CA': return `<rect x="0" y="0" width="7.5" height="20" fill="#D80621"/><rect x="7.4" y="0" width="15.2" height="20" fill="#FFFFFF"/><rect x="22.5" y="0" width="7.5" height="20" fill="#D80621"/><polygon points="15,4.2 16.3,7.3 18.2,6.5 17.3,9.2 20.8,8.2 19.8,10.2 21.2,11.4 17.6,12.2 17.9,14 15.6,13.1 15.6,16.5 14.4,16.5 14.4,13.1 12.1,14 12.4,12.2 8.8,11.4 10.2,10.2 9.2,8.2 12.7,9.2 11.8,6.5 13.7,7.3" fill="#D80621"/>`;
      case 'US': {
        let out = '';
        for (let i = 0; i < 13; i++) out += `<rect x="0" y="${(i * 20 / 13).toFixed(2)}" width="30" height="1.7" fill="${i % 2 === 0 ? '#B22234' : '#FFFFFF'}"/>`;
        out += `<rect x="0" y="0" width="12.8" height="10.8" fill="#3C3B6E"/>`;
        for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) out += `<circle cx="${(1.8 + c * 2.9 + (r % 2) * 1.1).toFixed(1)}" cy="${(1.8 + r * 2.4).toFixed(1)}" r="0.65" fill="#fff"/>`;
        return out;
      }
      case 'JP': return `<rect x="0" y="0" width="30" height="20" fill="#FFFFFF"/><circle cx="15" cy="10" r="6" fill="#BC002D"/>`;
      case 'GB': return uj(30, 20);
      case 'AE': return h3('#00732F', '#FFFFFF', '#000000') + `<rect x="0" y="0" width="8" height="20" fill="#FF0000"/>`;
      case 'ES': return `<rect x="0" y="0" width="30" height="5" fill="#AA151B"/><rect x="0" y="5" width="30" height="10" fill="#F1BF00"/><rect x="0" y="15" width="30" height="5" fill="#AA151B"/><rect x="7.5" y="7" width="3.4" height="6" rx="1" fill="#991B1B"/><rect x="8.1" y="5.8" width="2.2" height="1.4" fill="#D97706"/>`;
      case 'MC': return `<rect x="0" y="0" width="30" height="10.2" fill="#CE1126"/><rect x="0" y="10" width="30" height="10" fill="#FFFFFF"/>`;
      case 'KR': return `<rect x="0" y="0" width="30" height="20" fill="#FFFFFF"/><circle cx="15" cy="10" r="4.8" fill="#CD2E3A"/><path d="M10.2,10 A4.8,4.8 0 0,0 19.8,10 A2.4,2.4 0 0,0 15,10 A2.4,2.4 0 0,1 10.2,10 Z" fill="#0047A0"/><g stroke="#111827" stroke-width="1.2"><line x1="4.5" y1="5.5" x2="7.5" y2="3"/><line x1="22.5" y1="3" x2="25.5" y2="5.5"/><line x1="4.5" y1="14.5" x2="7.5" y2="17"/><line x1="22.5" y1="17" x2="25.5" y2="14.5"/></g>`;
      case 'CH': return `<rect x="0" y="0" width="30" height="20" fill="#D52B1E"/><rect x="12.6" y="4" width="4.8" height="12" fill="#FFFFFF"/><rect x="9" y="7.6" width="12" height="4.8" fill="#FFFFFF"/>`;
      case 'SG': return `<rect x="0" y="0" width="30" height="10.2" fill="#EF3340"/><rect x="0" y="10" width="30" height="10" fill="#FFFFFF"/><circle cx="6.2" cy="5" r="3.2" fill="#FFFFFF"/><circle cx="7.4" cy="5" r="2.9" fill="#EF3340"/>${_svgStar(9.5, 3.6, 0.9, '#fff')}${_svgStar(10.6, 5.5, 0.9, '#fff')}${_svgStar(8.8, 6.8, 0.9, '#fff')}`;
      case 'AU': return `<rect x="0" y="0" width="30" height="20" fill="#00008B"/>${uj(14.5, 10)}${_svgStar(7.2, 15, 2.3, '#fff')}${_svgStar(22, 4.5, 1.3, '#fff')}${_svgStar(25.5, 8.5, 1.3, '#fff')}${_svgStar(18.5, 9.2, 1.3, '#fff')}${_svgStar(22, 15.5, 1.3, '#fff')}`;
      case 'BR': return `<rect x="0" y="0" width="30" height="20" fill="#009B3A"/><polygon points="15,2.8 26,10 15,17.2 4,10" fill="#FEDF00"/><circle cx="15" cy="10" r="4.4" fill="#002776"/><path d="M10.8,9.8 Q15,8 19.2,10.8" fill="none" stroke="#FFFFFF" stroke-width="1"/>`;
      case 'TR': return `<rect x="0" y="0" width="30" height="20" fill="#E30A17"/><circle cx="12" cy="10" r="5" fill="#FFFFFF"/><circle cx="13.7" cy="10" r="4" fill="#E30A17"/>${_svgStar(19.2, 10, 2.4, '#FFFFFF')}`;
      case 'DE': return h3('#000000', '#DD0000', '#FFCC00');
      case 'NL': return h3('#AE1C28', '#FFFFFF', '#21468B');
      case 'PT': return `<rect x="0" y="0" width="12" height="20" fill="#006600"/><rect x="11.9" y="0" width="18.1" height="20" fill="#FF0000"/><circle cx="12" cy="10" r="4.3" fill="#FFCC00"/><rect x="10.4" y="7.8" width="3.2" height="4.4" rx="0.6" fill="#DC2626"/><rect x="11" y="8.4" width="2" height="3.2" fill="#fff"/>`;
      case 'EG': return h3('#CE1126', '#FFFFFF', '#000000') + `<rect x="13.4" y="7.6" width="3.2" height="4.8" fill="#C09300"/>`;
      default: return v3('#38BDF8', '#0F172A', '#8B5CF6');
    }
  }

  function renderFlagSvg(isoInput, w, h) {
    const iso = getCountryCode(isoInput);
    if (!iso) return '';
    const rw = w || 22;
    const rh = h || 15;
    return `<svg class="remo-flag-svg" viewBox="0 0 30 20" width="${rw}" height="${rh}" role="img" aria-label="${iso}">${_svgFlagBody(iso)}</svg>`;
  }

  function renderFlagOrIconHtml(iconOrObj, fallback, w, h) {
    const esc = (s) => String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    if (!iconOrObj) return esc(fallback || '📻');
    if (typeof iconOrObj === 'string') {
      const trimmed = iconOrObj.trim();
      if (isRegionalEmoji(trimmed) || /^[A-Za-z]{2}$/.test(trimmed)) {
        return renderFlagSvg(trimmed, w, h);
      }
      return esc(trimmed);
    }
    if (typeof iconOrObj === 'object') {
      const rawFlag = iconOrObj.flag || iconOrObj.icon || '';
      if (rawFlag && isRegionalEmoji(rawFlag)) return renderFlagSvg(rawFlag, w, h);
      if (rawFlag) return esc(rawFlag);
      const iso = getCountryCode(iconOrObj);
      if (iso) return renderFlagSvg(iso, w, h);
    }
    return esc(fallback || '📻');
  }

  window.REMO_FLAGS = {
    CITY_COUNTRY_ISO,
    isRegionalEmoji,
    decodeRegionalEmoji,
    getCountryCode,
    drawFlagToCanvas,
    drawWavingFlag,
    renderFlagSvg,
    renderFlagOrIconHtml
  };
})();
