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

function isBadCityStockImageUrl(url) {
  const u = String(url || '').trim();
  if (!u) return false;
  return /(\.(svg|pdf)(\?|$)|\.svg\.png(\?|$)|\/svg\/|flag_of_|drapeau_|coat_of_arms|blason|armoiries|seal_of_|locator_map|location_map|map_of_|blank_map|wikimedia-logo|commons-logo)/i.test(u);
}

function resolveCityRealPhotoUrl(cityOrId) {
  const city = (cityOrId && typeof cityOrId === 'object') ? cityOrId : getCityById(cityOrId);
  const cid = String((city && city.id) || (typeof cityOrId === 'string' ? cityOrId : '') || '').trim().toLowerCase();
  if (city) {
    const custom = city.cardImageUrl || city.imageUrl || city.photoUrl || '';
    if (custom && typeof custom === 'string' && !custom.startsWith('data:image/svg') && !isBadCityStockImageUrl(custom)) {
      return custom;
    }
  }
  return cid ? getDefaultCityCardImageUrl(cid) : '';
}

function _pickValidWikiThumb(pages) {
  if (!pages || typeof pages !== 'object') return '';
  const list = Object.values(pages).sort((a, b) => Number(a?.index || 999) - Number(b?.index || 999));
  for (let i = 0; i < list.length; i++) {
    const pg = list[i];
    const src = pg && pg.thumbnail && pg.thumbnail.source ? String(pg.thumbnail.source) : '';
    if (src && /^https:\/\//i.test(src) && !isBadCityStockImageUrl(src)) {
      return src;
    }
  }
  return '';
}

async function fetchCityPhotoFromWikipedia(cityName, countryName) {
  if (typeof fetch !== 'function') return '';
  const cleanCity = String(cityName || '').trim();
  const cleanCountry = String(countryName || '').trim();
  if (!cleanCity) return '';
  const hasCountry = Boolean(cleanCountry && cleanCountry.toLowerCase() !== 'world');
  const hasCityWord = /\b(city|ville)\b/i.test(cleanCity);

  const hosts = [
    {
      host: 'en.wikipedia.org',
      titles: [
        ...(hasCountry ? [`${cleanCity}, ${cleanCountry}`] : []),
        ...(!hasCityWord && hasCountry ? [`${cleanCity} City, ${cleanCountry}`] : []),
        ...(!hasCityWord ? [`${cleanCity} City`, `${cleanCity} (city)`] : []),
        cleanCity
      ],
      searchQuery: `${cleanCity}${hasCountry ? ' ' + cleanCountry : ''} city`
    },
    {
      host: 'fr.wikipedia.org',
      titles: [
        ...(!hasCityWord ? [`${cleanCity} (ville)`, `Ville de ${cleanCity}`] : []),
        ...(hasCountry ? [`${cleanCity}, ${cleanCountry}`] : []),
        cleanCity
      ],
      searchQuery: `${cleanCity}${hasCountry ? ' ' + cleanCountry : ''} ville`
    }
  ];

  const fetchWikiJson = async (url) => {
    let timer = null;
    try {
      const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
      if (ctrl) timer = setTimeout(() => { try { ctrl.abort(); } catch (e) {} }, 5000);
      const resp = await fetch(url, ctrl ? { signal: ctrl.signal } : undefined);
      if (!resp || !resp.ok) return null;
      return await resp.json();
    } catch (e) {
      return null;
    } finally {
      if (timer) clearTimeout(timer);
    }
  };

  for (let hIdx = 0; hIdx < hosts.length; hIdx++) {
    const spec = hosts[hIdx];
    const seen = new Set();
    for (let tIdx = 0; tIdx < spec.titles.length; tIdx++) {
      const title = String(spec.titles[tIdx] || '').trim();
      if (!title || seen.has(title.toLowerCase())) continue;
      seen.add(title.toLowerCase());
      const url = `https://${spec.host}/w/api.php?action=query&prop=pageimages&piprop=thumbnail&pithumbsize=960&redirects=1&format=json&origin=*&titles=${encodeURIComponent(title)}`;
      const json = await fetchWikiJson(url);
      const found = _pickValidWikiThumb(json && json.query && json.query.pages);
      if (found) return found;
    }

    const searchUrl = `https://${spec.host}/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(spec.searchQuery)}&gsrlimit=4&prop=pageimages&piprop=thumbnail&pithumbsize=960&format=json&origin=*`;
    const searchJson = await fetchWikiJson(searchUrl);
    const searchFound = _pickValidWikiThumb(searchJson && searchJson.query && searchJson.query.pages);
    if (searchFound) return searchFound;
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
  let touchedMedia = false;
  ['imageUrl', 'cardImageUrl', 'radioStreamUrl', 'radioName', 'radioBadge', 'tagline_en', 'tagline_fr', 'flag', 'countryIso', 'country_en', 'country_fr'].forEach((k) => {
    if (patch[k] !== undefined) {
      let val = String(patch[k] || '').trim();
      if (k === 'countryIso' && /^[A-Za-z]{2}$/.test(val)) val = val.toUpperCase();
      if (val) target[k] = val;
      else delete target[k];
      if (!k.startsWith('tagline_') && k !== 'country_en' && k !== 'country_fr') touchedMedia = true;
    }
  });
  if (touchedMedia && !patch._preserveTimestamp) {
    target.mediaUpdatedAt = Date.now();
  }
  list[idx] = target;
  saveRemoCities(list);
  return target;
}

const _REMO_DEFAULT_CITY_IDS = new Set(REMO_DEFAULT_CITIES.map((c) => c.id));
function getCustomRemoCitiesPatch() {
  return getRemoCities().filter((c) => {
    if (!c || !c.id) return false;
    if (!_REMO_DEFAULT_CITY_IDS.has(c.id)) return true;
    return Boolean(c.imageUrl || c.cardImageUrl || c.radioStreamUrl || c.mediaUpdatedAt);
  }).slice(-80);
}

/**
 * Self-heal custom cities whose flag is empty, generic, raw 2-letter ISO, or stuck on the old Austria default (`🇦🇹`) while belonging to another country.
 */
function healCityCountryFlags(options = {}) {
  const flagsApi = (typeof window !== 'undefined' && window.REMO_FLAGS) || null;
  if (!flagsApi || typeof flagsApi.resolveCountryNameToIso !== 'function' || typeof flagsApi.isoToFlagEmoji !== 'function') {
    return false;
  }
  const list = getRemoCities();
  const healedByCityId = new Map();
  let changed = false;

  for (let i = 0; i < list.length; i++) {
    const c = list[i];
    if (!c || !c.id || _REMO_DEFAULT_CITY_IDS.has(c.id)) continue;
    const rawCountry = c.country_en || c.country_fr || c.country || '';
    const resolvedIso = flagsApi.resolveCountryNameToIso(rawCountry) ||
      (c.countryIso && /^[A-Za-z]{2}$/.test(c.countryIso) ? String(c.countryIso).toUpperCase() : '');
    if (!resolvedIso) continue;

    const expectedFlag = flagsApi.isoToFlagEmoji(resolvedIso);
    if (!expectedFlag) continue;

    const currentFlag = String(c.flag || '').trim();
    const isGenericFlag = !currentFlag || currentFlag === '🏙️' || currentFlag === '🌍' || currentFlag === '🏙';
    const isStaleAustria = currentFlag === '🇦🇹' && resolvedIso !== 'AT';
    const isRawIso = /^[A-Za-z]{2}$/.test(currentFlag);

    if (isGenericFlag || isStaleAustria || isRawIso) {
      c.flag = expectedFlag;
      c.countryIso = resolvedIso;
      c.mediaUpdatedAt = Math.max(Number(c.mediaUpdatedAt || 0) + 1, Date.now());
      healedByCityId.set(c.id, expectedFlag);
      changed = true;
    } else if (currentFlag === expectedFlag && c.countryIso !== resolvedIso) {
      c.countryIso = resolvedIso;
      changed = true;
    }
  }

  if (changed) {
    saveRemoCities(list);
  }

  let radioChanged = false;
  if (typeof REMO_RADIO !== 'undefined' && Array.isArray(REMO_RADIO.stations)) {
    const cityMap = new Map(list.map((c) => [c.id, c]));
    REMO_RADIO.stations.forEach((st) => {
      if (!st || !st.cityId) return;
      const city = cityMap.get(st.cityId);
      if (!city || !city.flag) return;
      const shouldSync = healedByCityId.has(st.cityId) ||
        (!_REMO_DEFAULT_CITY_IDS.has(st.cityId) && flagsApi.isRegionalEmoji(city.flag) && (st.flag !== city.flag || st.icon !== city.flag));
      if (shouldSync) {
        st.flag = city.flag;
        st.icon = city.flag;
        radioChanged = true;
      }
    });
    if (radioChanged && typeof REMO_RADIO._saveDiscoveredStationsCache === 'function') {
      REMO_RADIO._saveDiscoveredStationsCache();
    }
  }

  if (healedByCityId.size > 0 && typeof REMO_STORE !== 'undefined' && REMO_STORE.state && Array.isArray(REMO_STORE.state.cards)) {
    REMO_STORE.state.cards.forEach((card) => {
      if (card && healedByCityId.has(card.cityId) && card.flag && card.flag !== healedByCityId.get(card.cityId)) {
        card.flag = healedByCityId.get(card.cityId);
      }
    });
  }

  if (changed || radioChanged) {
    if (!options.silentSync && typeof REMO_STORE !== 'undefined' && typeof REMO_STORE.syncToFirestore === 'function') {
      REMO_STORE.syncToFirestore('city_flag_heal', false);
    }
    if (typeof window !== 'undefined') {
      if (typeof renderAdminCitiesPanel === 'function') renderAdminCitiesPanel();
      if (typeof window.syncFocusTvUI === 'function') window.syncFocusTvUI();
      if (typeof renderSocialFeed === 'function') renderSocialFeed();
      if (radioChanged) {
        if (typeof REMO_RADIO !== 'undefined' && typeof REMO_RADIO._updateUI === 'function') REMO_RADIO._updateUI();
        if (typeof window.renderRadioStationsList === 'function') window.renderRadioStationsList();
      }
    }
  }

  return changed;
}

const _healedBadPhotoCityIds = new Set();
let _healBrokenCitiesInFlight = null;

function healBrokenCityPhotos(onUpdated) {
  healCityCountryFlags();
  if (_healBrokenCitiesInFlight) return _healBrokenCitiesInFlight;
  if (typeof fetch !== 'function') return Promise.resolve(false);

  const list = getRemoCities();
  const targets = list.filter((c) => {
    if (!c || !c.id || _healedBadPhotoCityIds.has(c.id)) return false;
    return isBadCityStockImageUrl(c.imageUrl) || isBadCityStockImageUrl(c.cardImageUrl);
  });
  if (!targets.length) return Promise.resolve(false);

  _healBrokenCitiesInFlight = (async () => {
    let anyHealed = false;
    for (let i = 0; i < targets.length; i++) {
      const c = targets[i];
      _healedBadPhotoCityIds.add(c.id);
      const freshUrl = await fetchCityPhotoFromWikipedia(
        c.name_en || c.name_fr || c.id,
        typeof getCityCountry === 'function' ? getCityCountry(c, 'en') : (c.country_en || c.country || '')
      );
      updateRemoCityMedia(c.id, {
        imageUrl: freshUrl || '',
        cardImageUrl: freshUrl || ''
      });
      if (freshUrl && typeof REMO_STORE !== 'undefined' && REMO_STORE.state && Array.isArray(REMO_STORE.state.cards)) {
        REMO_STORE.state.cards.forEach((card) => {
          if (card && card.cityId === c.id && isBadCityStockImageUrl(card.imageUrl)) {
            card.imageUrl = freshUrl;
          }
        });
      }
      anyHealed = true;
    }
    if (anyHealed) {
      if (typeof REMO_STORE !== 'undefined' && typeof REMO_STORE.syncToFirestore === 'function') {
        REMO_STORE.syncToFirestore('city_media_heal', false);
      }
      if (typeof renderAdminCitiesPanel === 'function') renderAdminCitiesPanel();
      if (typeof window.syncFocusTvUI === 'function') window.syncFocusTvUI();
      if (typeof renderSocialFeed === 'function') renderSocialFeed();
      if (typeof onUpdated === 'function') onUpdated();
    }
    return anyHealed;
  })().catch(() => false).finally(() => {
    _healBrokenCitiesInFlight = null;
  });
  return _healBrokenCitiesInFlight;
}

function _sanitizeCityStr(val, maxLen = 80) {
  return String(val || '').replace(/[<>]/g, '').trim().slice(0, maxLen);
}

function mergeCustomRemoCitiesFromCloud(cloudCities) {
  if (!Array.isArray(cloudCities) || !cloudCities.length) return false;
  const current = getRemoCities();
  const byId = new Map(current.map((c) => [c.id, c]));
  let changed = false;
  const MEDIA_KEYS = ['imageUrl', 'cardImageUrl', 'radioStreamUrl', 'radioName', 'radioBadge'];
  const META_KEYS = ['flag', 'countryIso', 'country_en', 'country_fr'];

  cloudCities.forEach((cc) => {
    if (!cc || !cc.id || !cc.name_en) return;
    const cleanId = String(cc.id).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 48);
    if (!cleanId) return;
    const existing = byId.get(cleanId);
    if (!existing) {
      const cloned = Object.assign({}, cc, {
        id: cleanId,
        code: _sanitizeCityStr(cc.code || 'CTY', 6),
        flag: _sanitizeCityStr(cc.flag || '🏙️', 16),
        name_en: _sanitizeCityStr(cc.name_en, 60),
        name_fr: _sanitizeCityStr(cc.name_fr || cc.name_en, 60),
        country_en: _sanitizeCityStr(cc.country_en || 'World', 60),
        country_fr: _sanitizeCityStr(cc.country_fr || cc.country_en || 'World', 60),
        tagline_en: _sanitizeCityStr(cc.tagline_en, 120),
        tagline_fr: _sanitizeCityStr(cc.tagline_fr || cc.tagline_en, 120),
        desc_en: _sanitizeCityStr(cc.desc_en, 240),
        desc_fr: _sanitizeCityStr(cc.desc_fr || cc.desc_en, 240)
      });
      if (isBadCityStockImageUrl(cloned.imageUrl)) delete cloned.imageUrl;
      if (isBadCityStockImageUrl(cloned.cardImageUrl)) delete cloned.cardImageUrl;
      current.push(cloned);
      byId.set(cloned.id, cloned);
      changed = true;
    } else {
      let updated = false;
      const cloudTs = Number(cc.mediaUpdatedAt || 0);
      const localTs = Number(existing.mediaUpdatedAt || 0);
      if (cloudTs > localTs) {
        MEDIA_KEYS.forEach((k) => {
          const val = cc[k];
          if (val && !isBadCityStockImageUrl(val)) {
            if (existing[k] !== val) {
              existing[k] = val;
              updated = true;
            }
          } else if (existing[k]) {
            delete existing[k];
            updated = true;
          }
        });
        META_KEYS.forEach((k) => {
          const val = cc[k];
          if (val && existing[k] !== val) {
            if (k === 'flag' && val === '🇦🇹' && existing.flag && existing.flag !== '🇦🇹') return;
            existing[k] = val;
            updated = true;
          }
        });
        existing.mediaUpdatedAt = cloudTs;
        updated = true;
      } else {
        MEDIA_KEYS.forEach((k) => {
          if (cc[k] && (!existing[k] || isBadCityStockImageUrl(existing[k])) && !isBadCityStockImageUrl(cc[k])) {
            existing[k] = cc[k];
            updated = true;
          }
        });
        META_KEYS.forEach((k) => {
          if (cc[k] && !existing[k]) {
            existing[k] = cc[k];
            updated = true;
          }
        });
      }
      if (updated) changed = true;
    }
  });

  if (changed) {
    saveRemoCities(current);
  }
  const healedFlags = healCityCountryFlags();
  if (healedFlags) changed = true;
  if (typeof setTimeout === 'function') {
    setTimeout(() => { healBrokenCityPhotos(); }, 60);
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
window.isBadCityStockImageUrl = isBadCityStockImageUrl;
window.resolveCityRealPhotoUrl = resolveCityRealPhotoUrl;
window.fetchCityPhotoFromWikipedia = fetchCityPhotoFromWikipedia;
window.updateRemoCityMedia = updateRemoCityMedia;
window.healCityCountryFlags = healCityCountryFlags;
window.healBrokenCityPhotos = healBrokenCityPhotos;
window.getCustomRemoCitiesPatch = getCustomRemoCitiesPatch;
window.mergeCustomRemoCitiesFromCloud = mergeCustomRemoCitiesFromCloud;

if (typeof setTimeout === 'function' && typeof window !== 'undefined') {
  setTimeout(() => { healCityCountryFlags(); healBrokenCityPhotos(); }, 900);
}
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
    quebec: 'CA',
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
    madrid: 'ES',
    rome: 'IT',
    milan: 'IT',
    monaco: 'MC',
    seoul: 'KR',
    geneva: 'CH',
    zurich: 'CH',
    singapore: 'SG',
    sydney: 'AU',
    rio: 'BR',
    istanbul: 'TR',
    berlin: 'DE',
    amsterdam: 'NL',
    lisbon: 'PT',
    cairo: 'EG',
    moscow: 'RU',
    vienna: 'AT',
    kyiv: 'UA',
    kiev: 'UA',
    warsaw: 'PL',
    athens: 'GR',
    prague: 'CZ',
    budapest: 'HU',
    brussels: 'BE',
    dublin: 'IE',
    stockholm: 'SE',
    oslo: 'NO',
    copenhagen: 'DK',
    helsinki: 'FI',
    bangkok: 'TH',
    beijing: 'CN',
    shanghai: 'CN',
    mumbai: 'IN',
    delhi: 'IN',
    mexicocity: 'MX',
    buenosaires: 'AR'
  };

  const COUNTRY_ALIASES = {
    russia: 'RU', russie: 'RU', 'russian federation': 'RU', 'federation de russie': 'RU', rossiya: 'RU', rf: 'RU',
    uk: 'GB', 'u k': 'GB', 'united kingdom': 'GB', 'royaume uni': 'GB', 'great britain': 'GB', 'grande bretagne': 'GB',
    britain: 'GB', england: 'GB', angleterre: 'GB', scotland: 'GB', ecosse: 'GB', wales: 'GB',
    us: 'US', usa: 'US', 'u s a': 'US', 'united states': 'US', 'united states of america': 'US',
    'etats unis': 'US', 'etats unis d amerique': 'US', america: 'US',
    uae: 'AE', 'u a e': 'AE', 'united arab emirates': 'AE', 'emirats arabes unis': 'AE', dubai: 'AE',
    'south korea': 'KR', 'coree du sud': 'KR', 'republic of korea': 'KR', 'republique de coree': 'KR', korea: 'KR',
    'north korea': 'KP', 'coree du nord': 'KP',
    moldova: 'MD', moldavie: 'MD', 'republic of moldova': 'MD', 'republique de moldavie': 'MD',
    romania: 'RO', roumanie: 'RO',
    france: 'FR',
    canada: 'CA', quebec: 'CA',
    italy: 'IT', italie: 'IT',
    spain: 'ES', espagne: 'ES',
    germany: 'DE', allemagne: 'DE', deutschland: 'DE',
    austria: 'AT', autriche: 'AT', osterreich: 'AT',
    switzerland: 'CH', suisse: 'CH',
    netherlands: 'NL', 'the netherlands': 'NL', 'pays bas': 'NL', holland: 'NL', hollande: 'NL',
    belgium: 'BE', belgique: 'BE',
    portugal: 'PT',
    greece: 'GR', grece: 'GR',
    turkey: 'TR', turkiye: 'TR', turquie: 'TR',
    ukraine: 'UA',
    poland: 'PL', pologne: 'PL',
    'czech republic': 'CZ', czechia: 'CZ', tchequie: 'CZ', 'republique tcheque': 'CZ',
    hungary: 'HU', hongrie: 'HU',
    bulgaria: 'BG', bulgarie: 'BG',
    serbia: 'RS', serbie: 'RS',
    croatia: 'HR', croatie: 'HR',
    ireland: 'IE', irlande: 'IE',
    sweden: 'SE', suede: 'SE',
    norway: 'NO', norvege: 'NO',
    denmark: 'DK', danemark: 'DK',
    finland: 'FI', finlande: 'FI',
    iceland: 'IS', islande: 'IS',
    japan: 'JP', japon: 'JP',
    china: 'CN', chine: 'CN',
    india: 'IN', inde: 'IN',
    vietnam: 'VN', 'viet nam': 'VN',
    thailand: 'TH', thailande: 'TH',
    indonesia: 'ID', indonesie: 'ID',
    malaysia: 'MY', malaisie: 'MY',
    philippines: 'PH',
    singapore: 'SG', singapour: 'SG',
    australia: 'AU', australie: 'AU',
    'new zealand': 'NZ', 'nouvelle zelande': 'NZ',
    brazil: 'BR', bresil: 'BR',
    argentina: 'AR', argentine: 'AR',
    mexico: 'MX', mexique: 'MX',
    colombia: 'CO', colombie: 'CO',
    chile: 'CL', chili: 'CL',
    peru: 'PE', perou: 'PE',
    egypt: 'EG', egypte: 'EG',
    morocco: 'MA', maroc: 'MA',
    tunisia: 'TN', tunisie: 'TN',
    algeria: 'DZ', algerie: 'DZ',
    'south africa': 'ZA', 'afrique du sud': 'ZA',
    nigeria: 'NG',
    israel: 'IL',
    'saudi arabia': 'SA', 'arabie saoudite': 'SA',
    qatar: 'QA',
    bahrain: 'BH', bahrein: 'BH',
    georgia: 'GE', georgie: 'GE',
    armenia: 'AM', armenie: 'AM',
    azerbaijan: 'AZ', azerbaidjan: 'AZ',
    kazakhstan: 'KZ',
    monaco: 'MC',
    luxembourg: 'LU',
    'ivory coast': 'CI', 'cote d ivoire': 'CI',
    taiwan: 'TW',
    'hong kong': 'HK',
    belarus: 'BY', bielorussie: 'BY',
    slovakia: 'SK', slovaquie: 'SK',
    slovenia: 'SI', slovenie: 'SI',
    estonia: 'EE', estonie: 'EE',
    latvia: 'LV', lettonie: 'LV',
    lithuania: 'LT', lituanie: 'LT',
    albania: 'AL', albanie: 'AL',
    cyprus: 'CY', chypre: 'CY',
    malta: 'MT', malte: 'MT',
    pakistan: 'PK',
    bangladesh: 'BD',
    ecuador: 'EC', equateur: 'EC',
    'costa rica': 'CR',
    botswana: 'BW',
    bolivia: 'BO', bolivie: 'BO',
    yemen: 'YE',
    gabon: 'GA',
    'sierra leone': 'SL',
    mali: 'ML',
    guinea: 'GN', guinee: 'GN',
    chad: 'TD', tchad: 'TD'
  };

  let _displayCountryMap = null;

  function _normCountryText(str) {
    return String(str || '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/['’`.\-,()]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function _getDisplayCountryMap() {
    if (_displayCountryMap) return _displayCountryMap;
    _displayCountryMap = Object.create(null);
    if (typeof Intl === 'undefined' || typeof Intl.DisplayNames !== 'function') {
      return _displayCountryMap;
    }
    const SKIP_CODES = new Set(['EU', 'UN', 'EZ', 'XA', 'XB', 'QO', 'ZZ']);
    ['en', 'fr'].forEach((loc) => {
      try {
        const dn = new Intl.DisplayNames([loc], { type: 'region' });
        for (let a = 65; a <= 90; a++) {
          for (let b = 65; b <= 90; b++) {
            const code = String.fromCharCode(a, b);
            if (SKIP_CODES.has(code)) continue;
            const label = dn.of(code);
            if (label && label !== code) {
              const norm = _normCountryText(label);
              if (norm && !_displayCountryMap[norm]) {
                _displayCountryMap[norm] = code;
              }
            }
          }
        }
      } catch (_) {}
    });
    return _displayCountryMap;
  }

  function isoToFlagEmoji(iso) {
    const clean = String(iso || '').trim().toUpperCase();
    if (!/^[A-Z]{2}$/.test(clean)) return '';
    return String.fromCodePoint(0x1f1e6 + clean.charCodeAt(0) - 65) +
      String.fromCodePoint(0x1f1e6 + clean.charCodeAt(1) - 65);
  }

  function resolveCountryNameToIso(name) {
    const raw = String(name || '').trim();
    if (!raw) return '';
    const norm = _normCountryText(raw);
    if (!norm || norm === 'world' || norm === 'monde' || norm === 'global' || norm === 'international' || norm === 'earth' || norm === 'terre' || norm === 'none' || norm === 'unknown') {
      return '';
    }
    if (Object.prototype.hasOwnProperty.call(COUNTRY_ALIASES, norm)) {
      return COUNTRY_ALIASES[norm];
    }
    if (/^[a-z]{2}$/.test(norm)) {
      const up = norm.toUpperCase();
      return up === 'UK' ? 'GB' : up;
    }
    const dMap = _getDisplayCountryMap();
    if (dMap[norm]) return dMap[norm];
    if (/[.,/|]/.test(raw)) {
      const parts = raw.split(/[.,/|]+/).map((p) => _normCountryText(p)).filter(Boolean);
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        if (Object.prototype.hasOwnProperty.call(COUNTRY_ALIASES, p)) return COUNTRY_ALIASES[p];
        if (dMap[p]) return dMap[p];
      }
    }
    return '';
  }

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
      if (!s) return null;
      if (s.toLowerCase() === 'uk') return 'GB';
      if (/^[A-Za-z]{2}$/.test(s)) return s.toUpperCase();
      const iso = decodeRegionalEmoji(s);
      if (iso) return iso;
      if (CITY_COUNTRY_ISO[s.toLowerCase()]) return CITY_COUNTRY_ISO[s.toLowerCase()];
      const fromName = resolveCountryNameToIso(s);
      return fromName || null;
    }
    if (typeof input === 'object') {
      const nameIso = resolveCountryNameToIso(input.country_en || input.country_fr || input.country || '');
      const emojiIso = (input.flag && isRegionalEmoji(input.flag))
        ? decodeRegionalEmoji(input.flag)
        : ((input.icon && isRegionalEmoji(input.icon)) ? decodeRegionalEmoji(input.icon) : '');

      if (emojiIso === 'AT' && nameIso && nameIso !== 'AT') return nameIso;
      if (input.countryIso && /^[A-Za-z]{2}$/.test(input.countryIso)) {
        const cIso = input.countryIso.toUpperCase();
        return (cIso === 'AT' && nameIso && nameIso !== 'AT') ? nameIso : cIso;
      }
      if (emojiIso) return emojiIso;
      if (input.cityId && CITY_COUNTRY_ISO[input.cityId]) return CITY_COUNTRY_ISO[input.cityId];
      if (input.id && CITY_COUNTRY_ISO[input.id]) return CITY_COUNTRY_ISO[input.id];
      if (nameIso) return nameIso;
    }
    return null;
  }

  /* ── Shared Declarative Flag Tables (Canvas + SVG use identical definitions) ── */
  const H3_FLAGS = {
    RU: ['#FFFFFF', '#0039A6', '#D52B1E'],
    AT: ['#ED2939', '#FFFFFF', '#ED2939'],
    DE: ['#000000', '#DD0000', '#FFCC00'],
    NL: ['#AE1C28', '#FFFFFF', '#21468B'],
    LU: ['#ED2939', '#FFFFFF', '#00A1DE'],
    BG: ['#FFFFFF', '#00966E', '#D62612'],
    HU: ['#CE2939', '#FFFFFF', '#477050'],
    EE: ['#0072CE', '#000000', '#FFFFFF'],
    LT: ['#FDB913', '#006A44', '#C1272D'],
    AM: ['#D90012', '#0033A0', '#F2A800'],
    YE: ['#CE1126', '#FFFFFF', '#000000'],
    BO: ['#D52B1E', '#F9E300', '#007934'],
    GA: ['#009E60', '#FCD116', '#3A75C4'],
    SL: ['#1EB53A', '#FFFFFF', '#0072C6'],
    BY: ['#C8313E', '#C8313E', '#4AA657']
  };

  const H2_FLAGS = {
    UA: ['#0057B7', '#FFD700'],
    PL: ['#FFFFFF', '#DC143C'],
    MC: ['#CE1126', '#FFFFFF'],
    ID: ['#CE1126', '#FFFFFF']
  };

  const H_BANDS = {
    LV: [[0.4, '#9E3039'], [0.2, '#FFFFFF'], [0.4, '#9E3039']],
    CO: [[0.5, '#FCD116'], [0.25, '#003893'], [0.25, '#CE1126']],
    EC: [[0.5, '#FFD100'], [0.25, '#0033A0'], [0.25, '#CE1126']],
    TH: [[0.167, '#A51931'], [0.167, '#F4F5F8'], [0.333, '#2D2A4A'], [0.167, '#F4F5F8'], [0.167, '#A51931']],
    CR: [[0.167, '#002B7F'], [0.167, '#FFFFFF'], [0.333, '#CE1126'], [0.167, '#FFFFFF'], [0.167, '#002B7F']],
    BW: [[0.375, '#75AADB'], [0.05, '#FFFFFF'], [0.15, '#000000'], [0.05, '#FFFFFF'], [0.375, '#75AADB']]
  };

  const V3_FLAGS = {
    FR: ['#0055A4', '#FFFFFF', '#EF4135'],
    IT: ['#009246', '#FFFFFF', '#CE2B37'],
    RO: ['#002B7F', '#FCD116', '#CE1126'],
    BE: ['#000000', '#FAE042', '#ED2939'],
    IE: ['#169B62', '#FFFFFF', '#FF883E'],
    CI: ['#F77F00', '#FFFFFF', '#009E60'],
    NG: ['#008751', '#FFFFFF', '#008751'],
    PE: ['#D91023', '#FFFFFF', '#D91023'],
    ML: ['#14B53A', '#FCD116', '#CE1126'],
    GN: ['#CE1126', '#FCD116', '#009460'],
    TD: ['#002664', '#FECB00', '#C60C30']
  };

  const NORDIC_FLAGS = {
    SE: { bg: '#006AA7', cross: '#FECC00' },
    DK: { bg: '#C60C30', cross: '#FFFFFF' },
    FI: { bg: '#FFFFFF', cross: '#003580' },
    NO: { bg: '#BA0C2F', cross: '#FFFFFF', inner: '#00205B' },
    IS: { bg: '#02529C', cross: '#FFFFFF', inner: '#DC1E35' }
  };

  const SPECIAL_CODES = new Set([
    'MD', 'CA', 'US', 'JP', 'GB', 'AE', 'ES', 'KR', 'CH', 'SG', 'AU', 'NZ',
    'BR', 'TR', 'PT', 'EG', 'GR', 'CZ', 'CN', 'IN', 'VN', 'MX', 'AR', 'CL',
    'IL', 'MA', 'TN', 'DZ', 'SA', 'PK', 'BD', 'ZA', 'GE', 'AZ', 'KZ', 'HR',
    'RS', 'SK', 'SI', 'QA', 'BH', 'PH', 'TW', 'HK', 'AL', 'CY', 'MT'
  ]);

  function _hasNativeFlag(iso) {
    return Boolean(H3_FLAGS[iso] || H2_FLAGS[iso] || H_BANDS[iso] || V3_FLAGS[iso] || NORDIC_FLAGS[iso] || SPECIAL_CODES.has(iso));
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

    const v3 = (cols) => {
      ctx.fillStyle = cols[0]; ctx.fillRect(x, y, w / 3 + 0.5, h);
      ctx.fillStyle = cols[1]; ctx.fillRect(x + w / 3, y, w / 3 + 0.5, h);
      ctx.fillStyle = cols[2]; ctx.fillRect(x + (w * 2) / 3, y, w / 3 + 0.5, h);
    };
    const h3 = (cols) => {
      ctx.fillStyle = cols[0]; ctx.fillRect(x, y, w, h / 3 + 0.5);
      ctx.fillStyle = cols[1]; ctx.fillRect(x, y + h / 3, w, h / 3 + 0.5);
      ctx.fillStyle = cols[2]; ctx.fillRect(x, y + (h * 2) / 3, w, h / 3 + 0.5);
    };

    if (H3_FLAGS[iso]) { h3(H3_FLAGS[iso]); ctx.restore(); return; }
    if (H2_FLAGS[iso]) {
      ctx.fillStyle = H2_FLAGS[iso][0]; ctx.fillRect(x, y, w, h * 0.5 + 0.5);
      ctx.fillStyle = H2_FLAGS[iso][1]; ctx.fillRect(x, y + h * 0.5, w, h * 0.5 + 0.5);
      ctx.restore();
      return;
    }
    if (H_BANDS[iso]) {
      let cy = y;
      H_BANDS[iso].forEach((b) => {
        const bh = h * b[0];
        ctx.fillStyle = b[1];
        ctx.fillRect(x, cy, w, bh + 0.6);
        cy += bh;
      });
      ctx.restore();
      return;
    }
    if (V3_FLAGS[iso]) { v3(V3_FLAGS[iso]); ctx.restore(); return; }
    if (NORDIC_FLAGS[iso]) {
      const n = NORDIC_FLAGS[iso];
      ctx.fillStyle = n.bg; ctx.fillRect(x, y, w, h);
      ctx.fillStyle = n.cross;
      ctx.fillRect(x + w * 0.3, y, w * 0.14, h);
      ctx.fillRect(x, y + h * 0.4, w, h * 0.2);
      if (n.inner) {
        ctx.fillStyle = n.inner;
        ctx.fillRect(x + w * 0.33, y, w * 0.08, h);
        ctx.fillRect(x, y + h * 0.44, w, h * 0.12);
      }
      ctx.restore();
      return;
    }

    switch (iso) {
      case 'MD':
        v3(['#0046AE', '#FFD200', '#CC092F']);
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
        h3(['#00732F', '#FFFFFF', '#000000']);
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
      case 'NZ':
        ctx.fillStyle = iso === 'NZ' ? '#00247D' : '#00008B'; ctx.fillRect(x, y, w, h);
        _drawUnionJackC(ctx, x, y, w * 0.48, h * 0.5);
        if (iso === 'AU') {
          ctx.fillStyle = '#FFFFFF';
          _drawStarC(ctx, x + w * 0.24, y + h * 0.74, h * 0.12, 7, 0.45);
          [[0.73, 0.22], [0.85, 0.42], [0.62, 0.46], [0.73, 0.78], [0.79, 0.57]].forEach((p, idx) => {
            _drawStarC(ctx, x + w * p[0], y + h * p[1], idx === 4 ? h * 0.04 : h * 0.06, 5, 0.42);
          });
        } else {
          [[0.74, 0.2], [0.85, 0.42], [0.64, 0.45], [0.74, 0.78]].forEach((p) => {
            ctx.fillStyle = '#FFFFFF';
            _drawStarC(ctx, x + w * p[0], y + h * p[1], h * 0.075, 5, 0.42);
            ctx.fillStyle = '#CC142B';
            _drawStarC(ctx, x + w * p[0], y + h * p[1], h * 0.052, 5, 0.42);
          });
        }
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
        h3(['#CE1126', '#FFFFFF', '#000000']);
        ctx.fillStyle = '#C09300';
        ctx.fillRect(x + w * 0.44, y + h * 0.38, w * 0.12, h * 0.24);
        _drawStarC(ctx, x + w * 0.5, y + h * 0.44, h * 0.08, 4, 0.5);
        break;
      case 'GR':
        for (let i = 0; i < 9; i++) {
          ctx.fillStyle = i % 2 === 0 ? '#0D5EAF' : '#FFFFFF';
          ctx.fillRect(x, y + (i * h) / 9, w, h / 9 + 0.5);
        }
        ctx.fillStyle = '#0D5EAF';
        ctx.fillRect(x, y, w * 0.38, h * (5 / 9));
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x + w * 0.152, y, w * 0.076, h * (5 / 9));
        ctx.fillRect(x, y + h * (2 / 9), w * 0.38, h * (1 / 9));
        break;
      case 'CZ':
        ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x, y, w, h * 0.5 + 0.5);
        ctx.fillStyle = '#D7141A'; ctx.fillRect(x, y + h * 0.5, w, h * 0.5 + 0.5);
        ctx.fillStyle = '#11457E';
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w * 0.48, y + h * 0.5); ctx.lineTo(x, y + h); ctx.closePath(); ctx.fill();
        break;
      case 'PH':
        ctx.fillStyle = '#0038A8'; ctx.fillRect(x, y, w, h * 0.5 + 0.5);
        ctx.fillStyle = '#CE1126'; ctx.fillRect(x, y + h * 0.5, w, h * 0.5 + 0.5);
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w * 0.44, y + h * 0.5); ctx.lineTo(x, y + h); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#FCD116';
        ctx.beginPath(); ctx.arc(x + w * 0.16, y + h * 0.5, h * 0.12, 0, Math.PI * 2); ctx.fill();
        break;
      case 'CN':
        ctx.fillStyle = '#DE2910'; ctx.fillRect(x, y, w, h);
        ctx.fillStyle = '#FFDE00';
        _drawStarC(ctx, x + w * 0.17, y + h * 0.27, h * 0.15, 5, 0.4);
        [[0.31, 0.12], [0.37, 0.24], [0.37, 0.38], [0.31, 0.49]].forEach((p) => {
          _drawStarC(ctx, x + w * p[0], y + h * p[1], h * 0.052, 5, 0.4);
        });
        break;
      case 'VN':
        ctx.fillStyle = '#DA251D'; ctx.fillRect(x, y, w, h);
        ctx.fillStyle = '#FFFF00';
        _drawStarC(ctx, x + w * 0.5, y + h * 0.5, h * 0.28, 5, 0.4);
        break;
      case 'IN':
        h3(['#FF9933', '#FFFFFF', '#138808']);
        ctx.strokeStyle = '#000080';
        ctx.lineWidth = Math.max(1.2, h * 0.045);
        ctx.beginPath(); ctx.arc(x + w * 0.5, y + h * 0.5, h * 0.13, 0, Math.PI * 2); ctx.stroke();
        break;
      case 'AR':
        h3(['#74ACDF', '#FFFFFF', '#74ACDF']);
        ctx.fillStyle = '#F6B40E';
        ctx.beginPath(); ctx.arc(x + w * 0.5, y + h * 0.5, h * 0.12, 0, Math.PI * 2); ctx.fill();
        break;
      case 'MX':
        v3(['#006847', '#FFFFFF', '#CE1126']);
        ctx.fillStyle = '#8B5A2B';
        ctx.beginPath(); ctx.arc(x + w * 0.5, y + h * 0.5, h * 0.11, 0, Math.PI * 2); ctx.fill();
        break;
      case 'CL':
        ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x, y, w, h * 0.5 + 0.5);
        ctx.fillStyle = '#D52B1E'; ctx.fillRect(x, y + h * 0.5, w, h * 0.5 + 0.5);
        ctx.fillStyle = '#0039A6'; ctx.fillRect(x, y, w * 0.34, h * 0.5 + 0.5);
        ctx.fillStyle = '#FFFFFF';
        _drawStarC(ctx, x + w * 0.17, y + h * 0.25, h * 0.14, 5, 0.4);
        break;
      case 'IL':
        ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x, y, w, h);
        ctx.fillStyle = '#0038B8';
        ctx.fillRect(x, y + h * 0.14, w, h * 0.14);
        ctx.fillRect(x, y + h * 0.72, w, h * 0.14);
        ctx.strokeStyle = '#0038B8';
        ctx.lineWidth = Math.max(1, h * 0.045);
        ctx.beginPath();
        ctx.moveTo(x + w * 0.5, y + h * 0.33); ctx.lineTo(x + w * 0.61, y + h * 0.58); ctx.lineTo(x + w * 0.39, y + h * 0.58); ctx.closePath();
        ctx.moveTo(x + w * 0.5, y + h * 0.67); ctx.lineTo(x + w * 0.61, y + h * 0.42); ctx.lineTo(x + w * 0.39, y + h * 0.42); ctx.closePath();
        ctx.stroke();
        break;
      case 'MA':
        ctx.fillStyle = '#C1272D'; ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = '#006233'; ctx.lineWidth = Math.max(1.4, h * 0.055);
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = -Math.PI / 2 + (i * 4 * Math.PI) / 5;
          const px = x + w * 0.5 + Math.cos(a) * h * 0.24;
          const py = y + h * 0.5 + Math.sin(a) * h * 0.24;
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke();
        break;
      case 'TN':
        ctx.fillStyle = '#E70013'; ctx.fillRect(x, y, w, h);
        ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(x + w * 0.5, y + h * 0.5, h * 0.25, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#E70013';
        ctx.beginPath(); ctx.arc(x + w * 0.5, y + h * 0.5, h * 0.16, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath(); ctx.arc(x + w * 0.54, y + h * 0.5, h * 0.13, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#E70013';
        _drawStarC(ctx, x + w * 0.57, y + h * 0.5, h * 0.08, 5, 0.4);
        break;
      case 'DZ':
        ctx.fillStyle = '#006233'; ctx.fillRect(x, y, w * 0.5, h);
        ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x + w * 0.5, y, w * 0.5, h);
        ctx.fillStyle = '#D21034';
        ctx.beginPath(); ctx.arc(x + w * 0.5, y + h * 0.5, h * 0.24, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath(); ctx.arc(x + w * 0.55, y + h * 0.5, h * 0.19, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#D21034';
        _drawStarC(ctx, x + w * 0.59, y + h * 0.5, h * 0.09, 5, 0.4);
        break;
      case 'SA':
        ctx.fillStyle = '#006C35'; ctx.fillRect(x, y, w, h);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x + w * 0.24, y + h * 0.34, w * 0.52, h * 0.16);
        ctx.fillRect(x + w * 0.24, y + h * 0.62, w * 0.5, h * 0.07);
        break;
      case 'PK':
        ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x, y, w * 0.26, h);
        ctx.fillStyle = '#01411C'; ctx.fillRect(x + w * 0.258, y, w * 0.742, h);
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath(); ctx.arc(x + w * 0.62, y + h * 0.5, h * 0.24, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#01411C';
        ctx.beginPath(); ctx.arc(x + w * 0.67, y + h * 0.45, h * 0.2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        _drawStarC(ctx, x + w * 0.71, y + h * 0.4, h * 0.09, 5, 0.4);
        break;
      case 'BD':
        ctx.fillStyle = '#006A4E'; ctx.fillRect(x, y, w, h);
        ctx.fillStyle = '#F42A41';
        ctx.beginPath(); ctx.arc(x + w * 0.45, y + h * 0.5, h * 0.28, 0, Math.PI * 2); ctx.fill();
        break;
      case 'ZA':
        ctx.fillStyle = '#001489'; ctx.fillRect(x, y, w, h);
        ctx.fillStyle = '#E03C31'; ctx.fillRect(x, y, w, h * 0.42);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x, y + h * 0.34, w, h * 0.32);
        ctx.fillStyle = '#007749';
        ctx.fillRect(x, y + h * 0.39, w, h * 0.22);
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w * 0.48, y + h * 0.5); ctx.lineTo(x, y + h); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#FFB81C';
        ctx.beginPath(); ctx.moveTo(x, y + h * 0.12); ctx.lineTo(x + w * 0.35, y + h * 0.5); ctx.lineTo(x, y + h * 0.88); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#000000';
        ctx.beginPath(); ctx.moveTo(x, y + h * 0.2); ctx.lineTo(x + w * 0.27, y + h * 0.5); ctx.lineTo(x, y + h * 0.8); ctx.closePath(); ctx.fill();
        break;
      case 'GE':
        ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x, y, w, h);
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(x + w * 0.42, y, w * 0.16, h);
        ctx.fillRect(x, y + h * 0.38, w, h * 0.24);
        [[0.21, 0.2], [0.79, 0.2], [0.21, 0.8], [0.79, 0.8]].forEach((p) => {
          ctx.fillRect(x + w * p[0] - h * 0.08, y + h * p[1] - h * 0.025, h * 0.16, h * 0.05);
          ctx.fillRect(x + w * p[0] - h * 0.025, y + h * p[1] - h * 0.08, h * 0.05, h * 0.16);
        });
        break;
      case 'AZ':
        h3(['#00B5E2', '#EF3340', '#509E2F']);
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath(); ctx.arc(x + w * 0.48, y + h * 0.5, h * 0.13, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#EF3340';
        ctx.beginPath(); ctx.arc(x + w * 0.51, y + h * 0.5, h * 0.1, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        _drawStarC(ctx, x + w * 0.57, y + h * 0.5, h * 0.06, 8, 0.45);
        break;
      case 'KZ':
        ctx.fillStyle = '#00AFCA'; ctx.fillRect(x, y, w, h);
        ctx.fillStyle = '#FEC50C';
        ctx.beginPath(); ctx.arc(x + w * 0.52, y + h * 0.48, h * 0.18, 0, Math.PI * 2); ctx.fill();
        ctx.fillRect(x + w * 0.06, y + h * 0.08, w * 0.04, h * 0.84);
        break;
      case 'HR':
        h3(['#FF0000', '#FFFFFF', '#171796']);
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(x + w * 0.42, y + h * 0.3, w * 0.16, h * 0.36);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x + w * 0.46, y + h * 0.36, w * 0.08, h * 0.1);
        break;
      case 'RS':
        h3(['#C6363C', '#0C4076', '#FFFFFF']);
        ctx.fillStyle = '#FACC15';
        ctx.fillRect(x + w * 0.28, y + h * 0.3, w * 0.12, h * 0.34);
        break;
      case 'SK':
        h3(['#FFFFFF', '#0B4EA2', '#EE1C25']);
        ctx.fillStyle = '#EE1C25';
        ctx.fillRect(x + w * 0.25, y + h * 0.3, w * 0.14, h * 0.38);
        break;
      case 'SI':
        h3(['#FFFFFF', '#003DA5', '#ED1C24']);
        ctx.fillStyle = '#003DA5';
        ctx.fillRect(x + w * 0.24, y + h * 0.24, w * 0.12, h * 0.24);
        break;
      case 'QA':
      case 'BH':
        ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x, y, w * 0.32, h);
        ctx.fillStyle = iso === 'QA' ? '#8D1B3D' : '#CE1126'; ctx.fillRect(x + w * 0.3, y, w * 0.7, h);
        break;
      case 'TW':
        ctx.fillStyle = '#FE0000'; ctx.fillRect(x, y, w, h);
        ctx.fillStyle = '#000095'; ctx.fillRect(x, y, w * 0.48, h * 0.5);
        ctx.fillStyle = '#FFFFFF'; _drawStarC(ctx, x + w * 0.24, y + h * 0.25, h * 0.15, 12, 0.52);
        break;
      case 'HK':
        ctx.fillStyle = '#DE2910'; ctx.fillRect(x, y, w, h);
        ctx.fillStyle = '#FFFFFF'; _drawStarC(ctx, x + w * 0.5, y + h * 0.5, h * 0.22, 5, 0.38);
        break;
      case 'AL':
        ctx.fillStyle = '#E41E20'; ctx.fillRect(x, y, w, h);
        ctx.fillStyle = '#000000';
        ctx.beginPath(); ctx.ellipse(x + w * 0.5, y + h * 0.5, w * 0.14, h * 0.26, 0, 0, Math.PI * 2); ctx.fill();
        break;
      case 'CY':
        ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x, y, w, h);
        ctx.fillStyle = '#D57800';
        ctx.beginPath(); ctx.ellipse(x + w * 0.5, y + h * 0.45, w * 0.18, h * 0.16, -0.2, 0, Math.PI * 2); ctx.fill();
        break;
      case 'MT':
        ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x, y, w * 0.5, h);
        ctx.fillStyle = '#CF142B'; ctx.fillRect(x + w * 0.5, y, w * 0.5, h);
        ctx.fillStyle = '#CBD5E1'; ctx.fillRect(x + w * 0.08, y + h * 0.1, w * 0.1, h * 0.16);
        break;
      default: {
        // Clean dark-navy & gold ISO crest fallback for rarer countries until CDN PNG loads
        ctx.fillStyle = '#0F172A'; ctx.fillRect(x, y, w, h);
        ctx.fillStyle = '#1E293B'; ctx.fillRect(x + w * 0.04, y + h * 0.06, w * 0.92, h * 0.88);
        ctx.strokeStyle = '#FBBF24';
        ctx.lineWidth = Math.max(1.5, h * 0.045);
        ctx.strokeRect(x + w * 0.04, y + h * 0.06, w * 0.92, h * 0.88);
        ctx.fillStyle = '#F8FAFC';
        ctx.font = `800 ${Math.max(10, Math.round(h * 0.42))}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(iso, x + w * 0.5, y + h * 0.52);
        break;
      }
    }

    ctx.restore();
  }

  const _flatFlagCache = {};
  const _cdnLoadedOrPending = new Set();

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

    if (!_hasNativeFlag(iso) && !_cdnLoadedOrPending.has(iso) && typeof Image === 'function') {
      _cdnLoadedOrPending.add(iso);
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          fctx.clearRect(0, 0, c.width, c.height);
          fctx.drawImage(img, 0, 0, c.width, c.height);
          fctx.getImageData(0, 0, 1, 1);
        } catch (_) {
          drawFlagToCanvas(fctx, iso, 0, 0, c.width, c.height);
        }
      };
      img.src = `https://flagcdn.com/w160/${iso.toLowerCase()}.png`;
    }
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
    const v3 = (c) =>
      `<rect x="0" y="0" width="10.2" height="20" fill="${c[0]}"/><rect x="10" y="0" width="10.2" height="20" fill="${c[1]}"/><rect x="20" y="0" width="10" height="20" fill="${c[2]}"/>`;
    const h3 = (c) =>
      `<rect x="0" y="0" width="30" height="6.8" fill="${c[0]}"/><rect x="0" y="6.66" width="30" height="6.8" fill="${c[1]}"/><rect x="0" y="13.33" width="30" height="6.8" fill="${c[2]}"/>`;
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

    if (H3_FLAGS[iso]) return h3(H3_FLAGS[iso]);
    if (H2_FLAGS[iso]) return `<rect x="0" y="0" width="30" height="10.2" fill="${H2_FLAGS[iso][0]}"/><rect x="0" y="10" width="30" height="10" fill="${H2_FLAGS[iso][1]}"/>`;
    if (H_BANDS[iso]) {
      let yAcc = 0;
      return H_BANDS[iso].map((b) => {
        const bh = 20 * b[0];
        const rect = `<rect x="0" y="${yAcc.toFixed(2)}" width="30" height="${(bh + 0.3).toFixed(2)}" fill="${b[1]}"/>`;
        yAcc += bh;
        return rect;
      }).join('');
    }
    if (V3_FLAGS[iso]) return v3(V3_FLAGS[iso]);
    if (NORDIC_FLAGS[iso]) {
      const n = NORDIC_FLAGS[iso];
      return `<rect x="0" y="0" width="30" height="20" fill="${n.bg}"/>` +
        `<rect x="9" y="0" width="4.2" height="20" fill="${n.cross}"/><rect x="0" y="8" width="30" height="4" fill="${n.cross}"/>` +
        (n.inner ? `<rect x="10" y="0" width="2.2" height="20" fill="${n.inner}"/><rect x="0" y="9" width="30" height="2" fill="${n.inner}"/>` : '');
    }

    switch (iso) {
      case 'MD': return v3(['#0046AE', '#FFD200', '#CC092F']) +
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
      case 'AE': return h3(['#00732F', '#FFFFFF', '#000000']) + `<rect x="0" y="0" width="8" height="20" fill="#FF0000"/>`;
      case 'ES': return `<rect x="0" y="0" width="30" height="5" fill="#AA151B"/><rect x="0" y="5" width="30" height="10" fill="#F1BF00"/><rect x="0" y="15" width="30" height="5" fill="#AA151B"/><rect x="7.5" y="7" width="3.4" height="6" rx="1" fill="#991B1B"/><rect x="8.1" y="5.8" width="2.2" height="1.4" fill="#D97706"/>`;
      case 'KR': return `<rect x="0" y="0" width="30" height="20" fill="#FFFFFF"/><circle cx="15" cy="10" r="4.8" fill="#CD2E3A"/><path d="M10.2,10 A4.8,4.8 0 0,0 19.8,10 A2.4,2.4 0 0,0 15,10 A2.4,2.4 0 0,1 10.2,10 Z" fill="#0047A0"/><g stroke="#111827" stroke-width="1.2"><line x1="4.5" y1="5.5" x2="7.5" y2="3"/><line x1="22.5" y1="3" x2="25.5" y2="5.5"/><line x1="4.5" y1="14.5" x2="7.5" y2="17"/><line x1="22.5" y1="17" x2="25.5" y2="14.5"/></g>`;
      case 'CH': return `<rect x="0" y="0" width="30" height="20" fill="#D52B1E"/><rect x="12.6" y="4" width="4.8" height="12" fill="#FFFFFF"/><rect x="9" y="7.6" width="12" height="4.8" fill="#FFFFFF"/>`;
      case 'SG': return `<rect x="0" y="0" width="30" height="10.2" fill="#EF3340"/><rect x="0" y="10" width="30" height="10" fill="#FFFFFF"/><circle cx="6.2" cy="5" r="3.2" fill="#FFFFFF"/><circle cx="7.4" cy="5" r="2.9" fill="#EF3340"/>${_svgStar(9.5, 3.6, 0.9, '#fff')}${_svgStar(10.6, 5.5, 0.9, '#fff')}${_svgStar(8.8, 6.8, 0.9, '#fff')}`;
      case 'AU': return `<rect x="0" y="0" width="30" height="20" fill="#00008B"/>${uj(14.5, 10)}${_svgStar(7.2, 15, 2.3, '#fff')}${_svgStar(22, 4.5, 1.3, '#fff')}${_svgStar(25.5, 8.5, 1.3, '#fff')}${_svgStar(18.5, 9.2, 1.3, '#fff')}${_svgStar(22, 15.5, 1.3, '#fff')}`;
      case 'NZ': return `<rect x="0" y="0" width="30" height="20" fill="#00247D"/>${uj(14.5, 10)}${_svgStar(22, 4, 1.4, '#CC142B')}${_svgStar(25.5, 8.5, 1.4, '#CC142B')}${_svgStar(19, 9, 1.4, '#CC142B')}${_svgStar(22, 15.5, 1.4, '#CC142B')}`;
      case 'BR': return `<rect x="0" y="0" width="30" height="20" fill="#009B3A"/><polygon points="15,2.8 26,10 15,17.2 4,10" fill="#FEDF00"/><circle cx="15" cy="10" r="4.4" fill="#002776"/><path d="M10.8,9.8 Q15,8 19.2,10.8" fill="none" stroke="#FFFFFF" stroke-width="1"/>`;
      case 'TR': return `<rect x="0" y="0" width="30" height="20" fill="#E30A17"/><circle cx="12" cy="10" r="5" fill="#FFFFFF"/><circle cx="13.7" cy="10" r="4" fill="#E30A17"/>${_svgStar(19.2, 10, 2.4, '#FFFFFF')}`;
      case 'PT': return `<rect x="0" y="0" width="12" height="20" fill="#006600"/><rect x="11.9" y="0" width="18.1" height="20" fill="#FF0000"/><circle cx="12" cy="10" r="4.3" fill="#FFCC00"/><rect x="10.4" y="7.8" width="3.2" height="4.4" rx="0.6" fill="#DC2626"/><rect x="11" y="8.4" width="2" height="3.2" fill="#fff"/>`;
      case 'EG': return h3(['#CE1126', '#FFFFFF', '#000000']) + `<rect x="13.4" y="7.6" width="3.2" height="4.8" fill="#C09300"/>`;
      case 'GR': {
        let out = '';
        for (let i = 0; i < 9; i++) out += `<rect x="0" y="${(i * 20 / 9).toFixed(2)}" width="30" height="2.4" fill="${i % 2 === 0 ? '#0D5EAF' : '#FFFFFF'}"/>`;
        return out + `<rect x="0" y="0" width="11.2" height="11.1" fill="#0D5EAF"/><rect x="4.5" y="0" width="2.2" height="11.1" fill="#fff"/><rect x="0" y="4.4" width="11.2" height="2.2" fill="#fff"/>`;
      }
      case 'CZ': return `<rect x="0" y="0" width="30" height="10.2" fill="#FFFFFF"/><rect x="0" y="10" width="30" height="10" fill="#D7141A"/><polygon points="0,0 14.5,10 0,20" fill="#11457E"/>`;
      case 'PH': return `<rect x="0" y="0" width="30" height="10.2" fill="#0038A8"/><rect x="0" y="10" width="30" height="10" fill="#CE1126"/><polygon points="0,0 13,10 0,20" fill="#FFFFFF"/><circle cx="4.8" cy="10" r="2.2" fill="#FCD116"/>`;
      case 'CN': return `<rect x="0" y="0" width="30" height="20" fill="#DE2910"/>${_svgStar(5, 5.4, 2.8, '#FFDE00')}${_svgStar(9.5, 2.4, 1, '#FFDE00')}${_svgStar(11.2, 4.8, 1, '#FFDE00')}${_svgStar(11.2, 7.6, 1, '#FFDE00')}${_svgStar(9.5, 9.8, 1, '#FFDE00')}`;
      case 'VN': return `<rect x="0" y="0" width="30" height="20" fill="#DA251D"/>${_svgStar(15, 10, 5.4, '#FFFF00')}`;
      case 'IN': return h3(['#FF9933', '#FFFFFF', '#138808']) + `<circle cx="15" cy="10" r="2.5" fill="none" stroke="#000080" stroke-width="0.9"/>`;
      case 'AR': return h3(['#74ACDF', '#FFFFFF', '#74ACDF']) + `<circle cx="15" cy="10" r="2.3" fill="#F6B40E"/>`;
      case 'MX': return v3(['#006847', '#FFFFFF', '#CE1126']) + `<circle cx="15" cy="10" r="2.1" fill="#8B5A2B"/>`;
      case 'CL': return `<rect x="0" y="0" width="30" height="10.2" fill="#FFFFFF"/><rect x="0" y="10" width="30" height="10" fill="#D52B1E"/><rect x="0" y="0" width="10.2" height="10.2" fill="#0039A6"/>${_svgStar(5.1, 5.1, 2.5, '#FFFFFF')}`;
      case 'IL': return `<rect x="0" y="0" width="30" height="20" fill="#FFFFFF"/><rect x="0" y="2.8" width="30" height="2.8" fill="#0038B8"/><rect x="0" y="14.4" width="30" height="2.8" fill="#0038B8"/><polygon points="15,6.5 18.2,11.6 11.8,11.6" fill="none" stroke="#0038B8" stroke-width="0.9"/><polygon points="15,13.5 18.2,8.4 11.8,8.4" fill="none" stroke="#0038B8" stroke-width="0.9"/>`;
      case 'MA': return `<rect x="0" y="0" width="30" height="20" fill="#C1272D"/>${_svgStar(15, 10, 4.4, '#006233')}`;
      case 'TN': return `<rect x="0" y="0" width="30" height="20" fill="#E70013"/><circle cx="15" cy="10" r="5" fill="#fff"/><circle cx="14.8" cy="10" r="3.2" fill="#E70013"/><circle cx="15.8" cy="10" r="2.6" fill="#fff"/>${_svgStar(16.8, 10, 1.5, '#E70013')}`;
      case 'DZ': return `<rect x="0" y="0" width="15" height="20" fill="#006233"/><rect x="15" y="0" width="15" height="20" fill="#fff"/><circle cx="15" cy="10" r="4.6" fill="#D21034"/><circle cx="16.4" cy="10" r="3.7" fill="#fff"/>${_svgStar(17.2, 10, 1.7, '#D21034')}`;
      case 'SA': return `<rect x="0" y="0" width="30" height="20" fill="#006C35"/><rect x="7.5" y="7" width="15" height="3" rx="0.8" fill="#fff"/><rect x="7.5" y="12.2" width="14.5" height="1.3" fill="#fff"/>`;
      case 'PK': return `<rect x="0" y="0" width="8" height="20" fill="#FFFFFF"/><rect x="7.9" y="0" width="22.1" height="20" fill="#01411C"/><circle cx="18.6" cy="10" r="4.8" fill="#fff"/><circle cx="20.1" cy="9" r="4" fill="#01411C"/>${_svgStar(21.2, 8.1, 1.8, '#fff')}`;
      case 'BD': return `<rect x="0" y="0" width="30" height="20" fill="#006A4E"/><circle cx="13.5" cy="10" r="5.5" fill="#F42A41"/>`;
      case 'ZA': return `<rect x="0" y="0" width="30" height="20" fill="#001489"/><rect x="0" y="0" width="30" height="8.4" fill="#E03C31"/><rect x="0" y="6.8" width="30" height="6.4" fill="#fff"/><rect x="0" y="7.8" width="30" height="4.4" fill="#007749"/><polygon points="0,0 14,10 0,20" fill="#007749"/><polygon points="0,2.5 10.5,10 0,17.5" fill="#FFB81C"/><polygon points="0,4.2 8.2,10 0,15.8" fill="#000"/>`;
      case 'GE': return `<rect x="0" y="0" width="30" height="20" fill="#FFFFFF"/><rect x="12.6" y="0" width="4.8" height="20" fill="#FF0000"/><rect x="0" y="7.6" width="30" height="4.8" fill="#FF0000"/>`;
      case 'AZ': return h3(['#00B5E2', '#EF3340', '#509E2F']) + `<circle cx="14.4" cy="10" r="2.5" fill="#fff"/><circle cx="15.2" cy="10" r="2" fill="#EF3340"/>${_svgStar(17, 10, 1.2, '#fff')}`;
      case 'KZ': return `<rect x="0" y="0" width="30" height="20" fill="#00AFCA"/><circle cx="15.5" cy="9.5" r="3.4" fill="#FEC50C"/><rect x="1.8" y="1.6" width="1.2" height="16.8" fill="#FEC50C"/>`;
      case 'HR': return h3(['#FF0000', '#FFFFFF', '#171796']) + `<rect x="12.5" y="6" width="5" height="7" fill="#FF0000"/>`;
      case 'RS': return h3(['#C6363C', '#0C4076', '#FFFFFF']) + `<rect x="8.5" y="6" width="3.5" height="6.5" fill="#FACC15"/>`;
      case 'SK': return h3(['#FFFFFF', '#0B4EA2', '#EE1C25']) + `<rect x="7.5" y="6" width="4.2" height="7.4" fill="#EE1C25"/>`;
      case 'SI': return h3(['#FFFFFF', '#003DA5', '#ED1C24']) + `<rect x="7.2" y="4.8" width="3.6" height="4.8" fill="#003DA5"/>`;
      case 'QA': case 'BH': return `<rect x="0" y="0" width="9.5" height="20" fill="#FFFFFF"/><rect x="9.3" y="0" width="20.7" height="20" fill="${iso === 'QA' ? '#8D1B3D' : '#CE1126'}"/>`;
      case 'TW': return `<rect x="0" y="0" width="30" height="20" fill="#FE0000"/><rect x="0" y="0" width="14.4" height="10" fill="#000095"/><circle cx="7.2" cy="5" r="2.8" fill="#FFFFFF"/>`;
      case 'HK': return `<rect x="0" y="0" width="30" height="20" fill="#DE2910"/>${_svgStar(15, 10, 4.2, '#FFFFFF')}`;
      case 'AL': return `<rect x="0" y="0" width="30" height="20" fill="#E41E20"/><ellipse cx="15" cy="10" rx="4.2" ry="5" fill="#000"/>`;
      case 'CY': return `<rect x="0" y="0" width="30" height="20" fill="#FFFFFF"/><ellipse cx="15" cy="9" rx="5.2" ry="3.1" fill="#D57800"/>`;
      case 'MT': return `<rect x="0" y="0" width="15" height="20" fill="#FFFFFF"/><rect x="15" y="0" width="15" height="20" fill="#CF142B"/><rect x="2.4" y="2" width="3" height="3.2" fill="#CBD5E1"/>`;
      default: return `<rect x="0" y="0" width="30" height="20" fill="#0F172A"/><rect x="1" y="1" width="28" height="18" rx="1.5" fill="#1E293B" stroke="#FBBF24" stroke-width="1"/><text x="15" y="13.2" text-anchor="middle" font-family="sans-serif" font-size="8.5" font-weight="800" fill="#F8FAFC">${iso}</text>`;
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
      const iso = getCountryCode(iconOrObj);
      if (iso) return renderFlagSvg(iso, w, h);
      const rawFlag = iconOrObj.flag || iconOrObj.icon || '';
      if (rawFlag) return esc(rawFlag);
    }
    return esc(fallback || '📻');
  }

  window.REMO_FLAGS = {
    CITY_COUNTRY_ISO,
    isRegionalEmoji,
    decodeRegionalEmoji,
    isoToFlagEmoji,
    resolveCountryNameToIso,
    getCountryCode,
    drawFlagToCanvas,
    drawWavingFlag,
    renderFlagSvg,
    renderFlagOrIconHtml
  };

  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    healCityCountryFlags({ silentSync: true });
  }
})();
