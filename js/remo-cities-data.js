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

window.REMO_DEFAULT_CITIES = REMO_DEFAULT_CITIES;
window.REMO_ELEMENTS = REMO_ELEMENTS;
window.getRemoCities = getRemoCities;
window.saveRemoCities = saveRemoCities;
window.getCityById = getCityById;
window.getCityName = getCityName;
window.getCityCountry = getCityCountry;
window.getCityTagline = getCityTagline;
window.getCityDesc = getCityDesc;
window.computeCityPvPStats = computeCityPvPStats;
window.drawCityLandmark = drawCityLandmark;
