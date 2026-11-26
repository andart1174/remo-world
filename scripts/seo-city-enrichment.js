/* ════════════════════════════════════════════════════════════════════
   🌍 REMO WORLD — Rich Bilingual SEO Data (EN & FR) for 24 Cities + 12 Duels
   Used by scripts/build-seo-pages.js to generate unique historical 1910 vs 2026
   content, verified city facts, official IATA codes, and versus verdicts.
   Strict Bilingual Output: English (EN) & French (FR) ONLY.
   ════════════════════════════════════════════════════════════════════ */

const SEO_CITY_EXTRA = {
  montreal: {
    iata: 'YUL',
    seoCode: 'MTL',
    history_en: 'In 1910, Montréal was Canada’s commercial powerhouse, where electric streetcars clattered down Saint-Catherine Street beneath the neo-Gothic twin towers of Notre-Dame Basilica and the stone facades of Old Montréal. By 2026, the city has fused that European stone heritage with one of the world’s premier AI research ecosystems, illuminated winter festivals, and the 33 km RÉSO underground pedestrian network beneath Mount Royal.',
    history_fr: 'En 1910, Montréal était la grande métropole commerciale du Canada, rythmée par les tramways électriques de la rue Sainte-Catherine au pied des tours néogothiques de la basilique Notre-Dame et des façades en pierre du Vieux-Montréal. En 2026, la ville marie ce patrimoine européen à un pôle mondial d’intelligence artificielle, ses grands festivals lumineux et les 33 km du réseau souterrain RÉSO sous le mont Royal.',
    facts_en: [
      'Home to RÉSO — a 33 km climate-controlled underground pedestrian city beneath winter snow.',
      'Second-largest French-speaking metropolis in the world after Paris, celebrated for bilingual culture.',
      'Municipal bylaws protect the silhouette of Mount Royal so no skyscraper rises above its summit cross.'
    ],
    facts_fr: [
      'Abrite le RÉSO, une ville souterraine chauffée de 33 km reliant métros, universités et galeries sous la neige.',
      'Deuxième plus grande métropole francophone au monde après Paris, reconnue pour son énergie bilingue.',
      'Un règlement municipal protège la silhouette du mont Royal : aucun gratte-ciel ne peut dépasser son sommet.'
    ]
  },
  paris: {
    iata: 'CDG',
    seoCode: 'PAR',
    history_en: 'In 1910, Belle Époque Paris gleamed with freshly opened Art Nouveau Métro entrances, horse-drawn carriages circling the Arc de Triomphe, and a 21-year-old Eiffel Tower anchoring the skyline. In 2026, the City of Light preserves Haussmann’s golden limestone symmetry while pioneering bikeable Seine riverbanks, green urban corridors, and world-leading haute gastronomy and art.',
    history_fr: 'En 1910, le Paris de la Belle Époque brillait par ses toutes nouvelles bouches de métro Art nouveau, ses calèches autour de l’Arc de Triomphe et une Tour Eiffel âgée de 21 ans. En 2026, la Ville Lumière préserve l’harmonie haussmannienne tout en réinventant les berges cyclables de la Seine, ses jardins urbains et son rayonnement gastronomique et artistique.',
    facts_en: [
      'Spanned by 37 historic bridges across the Seine River, with Pont Neuf ironically being the oldest (1607).',
      'Contains more than 450 public parks, botanical gardens, and hidden courtyard squares across 20 arrondissements.',
      'Thermal expansion makes the iron Eiffel Tower grow up to 15 cm taller during hot summer afternoons.'
    ],
    facts_fr: [
      'La Seine est traversée par 37 ponts historiques, dont le Pont-Neuf qui est paradoxalement le plus ancien (1607).',
      'Paris compte plus de 450 parcs, jardins botaniques et squares cachés répartis dans ses 20 arrondissements.',
      'Sous l’effet de la dilatation thermique en été, la Tour Eiffel peut grandir jusqu’à 15 cm.'
    ]
  },
  chisinau: {
    iata: 'RMO',
    seoCode: 'RMO',
    history_en: 'In 1910, Chișinău was an elegant limestone capital designed with wide neoclassical boulevards by architect Alexander Bernardazzi, anchored by the 1841 Triumphal Arch and lush central gardens. By 2026, Chișinău (IATA: RMO) pairs its iconic white-stone City Gates and park-lined avenues with a rapidly expanding European IT park, boutique specialty coffee culture, and world-record wine tourism.',
    history_fr: 'En 1910, Chișinău séduisait déjà par ses larges avenues néoclassiques en pierre blanche signées Alexander Bernardazzi, son Arc de Triomphe de 1841 et ses jardins centraux. En 2026, Chișinău (IATA : RMO) associe ses célèbres Portes de la Ville et ses parcs verdoyants à un secteur IT en plein essor, des cafés de spécialité et un œnotourisme unique au monde.',
    facts_en: [
      'Minutes from Mileștii Mici & Cricova — over 200 km of subterranean limestone wine tunnels holding world-record collections.',
      'Ranks among Europe’s greenest capitals, dotted with 23+ tranquil lakes, botanical parks, and tree-lined boulevards.',
      'Chișinău’s 1841 Triumphal Arch houses a monumental clock cast from historic bronze bells that still chimes every hour.'
    ],
    facts_fr: [
      'À quelques minutes de Mileștii Mici et Cricova, plus de 200 km de galeries viticoles souterraines uniques au monde.',
      'L’une des capitales les plus vertes d’Europe avec plus de 23 lacs, parcs boisés et boulevards ombragés.',
      'L’Arc de Triomphe de 1841 abrite une horloge monumentale dont les carillons résonnent encore chaque heure.'
    ]
  },
  bucharest: {
    iata: 'OTP',
    seoCode: 'OTP',
    history_en: 'In 1910, Bucharest earned its nickname "Little Paris of the East" as French-trained architects lined Calea Victoriei with the Romanian Athenaeum, ornate Belle Époque palaces, and literary cafés. In 2026, Bucharest fuses those neoclassical landmarks with one of Europe’s fastest fiber-optic tech scenes, creative studios, and the electric late-night pulse of Lipscani Old Town.',
    history_fr: 'En 1910, Bucarest s’imposait comme le « Petit Paris de l’Est », parée de l’Athénée roumain, de palais Belle Époque sur Calea Victoriei et de cafés littéraires. En 2026, la capitale mêle ces joyaux néoclassiques à l’une des connexions fibre les plus rapides d’Europe, une scène tech dynamique et les nuits vibrantes du Centre Ancien de Lipscani.',
    facts_en: [
      'The Palace of the Parliament is the heaviest building ever constructed on Earth, using millions of tons of marble and steel.',
      'Earned the title "Little Paris" in the early 20th century for its Arcul de Triumf and Parisian-inspired boulevards.',
      'Consistently ranks among Europe’s fastest gigabit fiber-optic capitals and top emerging software hubs.'
    ],
    facts_fr: [
      'Le Palais du Parlement est le bâtiment le plus lourd jamais construit sur Terre, riche en marbre et en cristal.',
      'Surnommée « le Petit Paris » dès la Belle Époque pour son Arc de Triomphe et ses grands boulevards élégants.',
      'Figure régulièrement parmi les capitales européennes dotées d’Internet fibre gigabit les plus rapides.'
    ]
  },
  newyork: {
    iata: 'JFK',
    seoCode: 'NYC',
    history_en: 'In 1910, New York City’s skyline was entering the skyscraper era with the newly completed Flatiron and Singer buildings while ferries and subway lines connected Manhattan’s five rising boroughs. In 2026, NYC’s supertall glass towers, glowing Times Square marquees, and greenway waterfronts form the world’s most linguistically diverse 24/7 cultural crossroads.',
    history_fr: 'En 1910, New York entrait dans l’ère des gratte-ciels avec le Flatiron Building tandis que le métro neuf et les ferries reliaient les cinq arrondissements en pleine effervescence. En 2026, ses tours vertigineuses, les néons de Times Square et ses promenades sur l’Hudson forment le carrefour culturel le plus cosmopolite de la planète.',
    facts_en: [
      'More than 800 languages are spoken across New York City’s five boroughs — the highest linguistic diversity on Earth.',
      'Central Park spans 341 hectares in the heart of Manhattan — larger than the entire principality of Monaco.',
      'The NYC Subway operates 24 hours a day, 365 days a year across 472 stations.'
    ],
    facts_fr: [
      'Plus de 800 langues sont parlées dans les cinq arrondissements de New York, un record mondial de diversité.',
      'Central Park couvre 341 hectares au cœur de Manhattan, soit une superficie supérieure à toute la principauté de Monaco.',
      'Le métro de New York circule 24h/24 et 365 jours par an à travers 472 stations emblématiques.'
    ]
  },
  tokyo: {
    iata: 'HND',
    seoCode: 'TYO',
    history_en: 'In 1910, late-Meiji Tokyo combined wooden Edo neighborhoods, rickshaws, and tranquil temple grounds with brand-new red-brick Western avenues around Marunouchi and Ginza. By 2026, Tokyo is a luminous masterpiece of quiet Shinto shrines standing beside Shibuya’s neon canyons, precision bullet trains, and unmatched culinary artistry.',
    history_fr: 'En 1910, le Tokyo de la fin de l’ère Meiji mêlait quartiers en bois d’Edo, pousse-pousse et sanctuaires paisibles aux nouvelles avenues de briques rouges de Ginza et Marunouchi. En 2026, la mégapole fait cohabiter temples shinto séculaires, néons futuristes de Shibuya, trains à grande vitesse et sommets de la gastronomie mondiale.',
    facts_en: [
      'Shibuya Scramble Crossing sees up to 3,000 pedestrians cross simultaneously during a single peak green light.',
      'Holds more Michelin-starred restaurants than any other city on Earth, alongside legendary late-night ramen counters.',
      'Features roughly one high-tech vending machine for every 30 residents, serving everything from hot coffee to umbrellas.'
    ],
    facts_fr: [
      'Le célèbre carrefour de Shibuya voit jusqu’à 3 000 piétons traverser simultanément lors d’un seul feu vert.',
      'Tokyo détient le record mondial du plus grand nombre de restaurants étoilés au guide Michelin.',
      'On y recense environ un distributeur automatique pour 30 habitants, proposant café chaud, boissons et parapluies.'
    ]
  },
  london: {
    iata: 'LHR',
    seoCode: 'LON',
    history_en: 'In 1910, Edwardian London buzzed with iconic red omnibuses, steam trains beneath Victorian iron stations, and the unmistakable silhouette of Big Ben and Tower Bridge over the Thames. In 2026, glass architectural icons like The Shard reflect centuries of royal stone heritage, 170+ world-class museums, and a vibrant global FinTech and music capital.',
    history_fr: 'En 1910, le Londres édouardien vibrait au rythme des premiers bus rouges, des gares victoriennes et de la silhouette légendaire de Big Ben et du Tower Bridge sur la Tamise. En 2026, des tours de verre comme The Shard dialoguent avec l’histoire royale, plus de 170 musées majeurs et une scène FinTech et musicale mondiale.',
    facts_en: [
      'The London Underground opened in 1863, making the Tube the oldest subterranean metro network in the world.',
      'Home to over 170 world-class museums and galleries — including the British Museum and Tate Modern — many with free entry.',
      'With over 8 million trees across parks and boulevards, London meets the UN definition of an urban forest.'
    ],
    facts_fr: [
      'Inauguré en 1863, le métro de Londres (« the Tube ») est le plus ancien réseau ferroviaire souterrain du monde.',
      'La capitale abrite plus de 170 musées de renommée internationale, dont beaucoup sont accessibles gratuitement.',
      'Avec plus de 8 millions d’arbres dans ses parcs et rues, Londres répond aux critères d’une forêt urbaine.'
    ]
  },
  dubai: {
    iata: 'DXB',
    seoCode: 'DXB',
    history_en: 'In 1910, Dubai was a bustling Persian Gulf creek settlement of wind-tower coral houses, wooden dhow sailboats, and traditional pearl diving souks in Deira and Al Fahidi. By 2026, that trading heritage has skyrocketed into an architectural marvel of the 828-meter Burj Khalifa, Palm islands, autonomous transit, and a crossroads linking East and West.',
    history_fr: 'En 1910, Dubaï était un port animé de la crique du Golfe composé de maisons à tours à vent, de boutres en bois et de souks dédiés à la pêche aux perles. En 2026, cette tradition marchande s’est métamorphosée en prodige futuriste dominé par le Burj Khalifa (828 m), les îles Palm et un carrefour mondial entre Orient et Occident.',
    facts_en: [
      'At 828 meters, Burj Khalifa is so tall you can watch the sunset twice in one evening by taking the elevator from base to top.',
      'Dubai Metro is one of the longest fully automated, driverless urban rail networks on the planet.',
      'Transformed from a coastal pearl-trading creek town into a global aviation and design capital in under 60 years.'
    ],
    facts_fr: [
      'Du haut de ses 828 mètres, le Burj Khalifa permet d’observer deux couchers de soleil le même soir en montant en ascenseur.',
      'Le métro de Dubaï figure parmi les réseaux ferrés urbains entièrement automatisés les plus longs du monde.',
      'Passée en moins de 60 ans d’un port perlier traditionnel à l’un des grands pôles mondiaux d’architecture et d’aviation.'
    ]
  },
  miami: {
    iata: 'MIA',
    seoCode: 'MIA',
    history_en: 'In 1910, Miami was a young 14-year-old tropical railroad outpost along Biscayne Bay surrounded by palm groves, wooden bungalows, and turquoise shallows. By 2026, pastel Art Deco hotels along Ocean Drive glow beside sleek Brickell waterfront skyscrapers, Wynwood street art murals, and an unmistakable Latin-Atlantic rhythm.',
    history_fr: 'En 1910, Miami n’était encore qu’une jeune cité tropicale de 14 ans le long de la baie de Biscayne, entourée de palmiers et de villas en bois. En 2026, les façades Art déco pastel d’Ocean Drive illuminent le front de mer aux côtés des tours de Brickell, des fresques de Wynwood et d’une énergie latino-atlantique unique.',
    facts_en: [
      'Miami is the only major American metropolis founded by a woman — pioneer businesswoman Julia Tuttle in 1896.',
      'Miami Beach’s Historic District preserves the world’s largest concentration of 1920s–1930s Art Deco architecture.',
      'Surrounded by over 800 city parks and the only living tropical coral barrier reef in the continental United States.'
    ],
    facts_fr: [
      'Miami est la seule grande métropole américaine fondée par une femme, la pionnière Julia Tuttle en 1896.',
      'South Beach abrite la plus grande collection mondiale d’immeubles Art déco des années 1920 et 1930.',
      'La région compte plus de 800 parcs ainsi que l’unique récif corallien tropical vivant des États-Unis continentaux.'
    ]
  },
  barcelona: {
    iata: 'BCN',
    seoCode: 'BCN',
    history_en: 'In 1910, Barcelona was in the full bloom of Catalan Modernisme as Antoni Gaudí sculpted Casa Milà and raised the stone spires of the Sagrada Família above the sunny octagonal Eixample grid. In 2026, Mediterranean beach promenades, nine UNESCO heritage treasures, and smart-city superblocks make Barcelona one of Europe’s most magnetic coastal capitals.',
    history_fr: 'En 1910, Barcelone rayonnait en plein âge d’or du modernisme catalan, alors qu’Antoni Gaudí achevait la Casa Milà et élevait les flèches de la Sagrada Família au cœur de l’Eixample. En 2026, plages méditerranéennes, neuf sites UNESCO et îlots piétons (« superilles ») en font l’une des capitales côtières les plus fascinantes d’Europe.',
    facts_en: [
      'Antoni Gaudí’s Sagrada Família basilica has been continuously under construction since 1882.',
      'Barcelona contains nine separate UNESCO World Heritage sites within a single compact coastal city.',
      'Ildefons Cerdà designed the Eixample district with chamfered octagonal street corners to maximize sunlight and sea breezes.'
    ],
    facts_fr: [
      'La basilique de la Sagrada Família d’Antoni Gaudí est en construction continue depuis 1882.',
      'Barcelone réunit à elle seule neuf sites inscrits au patrimoine mondial de l’UNESCO.',
      'Les carrefours octogonaux de l’Eixample ont été pensés au XIXe siècle pour laisser entrer la lumière et la brise marine.'
    ]
  },
  rome: {
    iata: 'FCO',
    seoCode: 'ROM',
    history_en: 'In 1910, Rome was preparing the gleaming white Vittoriano monument beside ancient Imperial forums, where horse-drawn carriages rolled past the Colosseum and lively Piazza Navona markets. By 2026, the Eternal City remains an unmatched open-air museum where 2,000-year-old marble domes frame espresso bars, golden evening passeggiata, and timeless Roman cuisine.',
    history_fr: 'En 1910, Rome inaugurait le monument blanc du Vittoriano face aux forums impériaux, tandis que les calèches longeaient le Colisée et les marchés de la Piazza Navona. En 2026, la Ville Éternelle demeure un musée à ciel ouvert inégalé où coupoles bimillénaires, terrasses d’espresso et trattorias de Trastevere célèbrent la dolce vita.',
    facts_en: [
      'Over 2,000 ornate and drinking fountains flow continuously across Rome, many fed by ancient Roman aqueduct routes.',
      'Completed nearly 1,900 years ago, the Pantheon still holds the world’s largest unreinforced concrete dome.',
      'Coins tossed by visitors into the Trevi Fountain raise over €1.5 million every year for local community charities.'
    ],
    facts_fr: [
      'Plus de 2 000 fontaines coulent dans Rome, certaines encore alimentées par le tracé d’anciens aqueducs romains.',
      'Achevé il y a près de 1 900 ans, le Panthéon possède toujours la plus grande coupole en béton non armé au monde.',
      'Les pièces lancées dans la fontaine de Trevi financent chaque année plus de 1,5 million d’euros d’œuvres caritatives.'
    ]
  },
  toronto: {
    iata: 'YYZ',
    seoCode: 'YYZ',
    history_en: 'In 1910, Toronto was an industrious Great Lakes port city defined by Victorian red-brick mansions, the Romanesque Old City Hall clocktower, and streetcars along Yonge Street. In 2026, the iconic CN Tower anchors a shimmering Lake Ontario skyline celebrated as one of the world’s most multicultural financial, film, and technology capitals.',
    history_fr: 'En 1910, Toronto était un port actif des Grands Lacs marqué par ses demeures victoriennes en brique rouge, l’ancien hôtel de ville roman et les tramways de Yonge Street. En 2026, la tour CN domine une skyline spectaculaire au bord du lac Ontario, au cœur d’une capitale multiculturelle majeure de la finance, du cinéma et de la tech.',
    facts_en: [
      'The 553-meter CN Tower stood as the world’s tallest freestanding structure for 32 consecutive years (1975–2007).',
      'Toronto’s PATH links over 30 km of underground walkways, shops, and transit hubs beneath the downtown core.',
      'More than half of Toronto’s residents were born outside Canada, uniting over 200 distinct cultural communities.'
    ],
    facts_fr: [
      'Haute de 553 mètres, la tour CN a détenu pendant 32 ans le record de la plus haute structure autoportante au monde.',
      'Le réseau souterrain PATH relie plus de 30 km de galeries marchandes, bureaux et stations au centre-ville.',
      'Plus de la moitié des habitants de Toronto sont nés hors du Canada, réunissant plus de 200 communautés.'
    ]
  },
  monaco: {
    iata: 'MCM',
    seoCode: 'MCM',
    history_en: 'In 1910, Monaco celebrated the opening of the cliffside Oceanographic Museum under Prince Albert I while Belle Époque visitors strolled the manicured terraces of Monte-Carlo Casino overlooking the Mediterranean. In 2026, the sun-drenched principality pairs that Riviera glamour with the legendary Formula 1 street circuit, eco-engineered waterfront extensions, and Port Hercule superyachts.',
    history_fr: 'En 1910, Monaco inaugurait le musée Océanographique à flanc de falaise sous le prince Albert Ier, tandis que la Belle Époque admirait les jardins du Casino de Monte-Carlo. En 2026, la principauté conjugue prestige azuréen, légendaire Grand Prix de Formule 1 en ville, extensions maritimes durables et superyachts du port Hercule.',
    facts_en: [
      'At roughly 2.08 km², Monaco is smaller than New York’s Central Park yet hosts the iconic Formula 1 Monaco Grand Prix.',
      'Boasts one of the highest concentrations of superyachts per kilometer of coastline anywhere on Earth.',
      'Enjoys more than 300 days of sparkling Mediterranean Riviera sunshine every year.'
    ],
    facts_fr: [
      'Avec environ 2,08 km², Monaco est plus petite que Central Park mais accueille chaque année le mythique Grand Prix de F1.',
      'La principauté concentre l’une des plus fortes densités de superyachts par kilomètre de littoral au monde.',
      'Monaco bénéficie de plus de 300 jours d’ensoleillement méditerranéen par an sur la Côte d’Azur.'
    ]
  },
  losangeles: {
    iata: 'LAX',
    seoCode: 'LAX',
    history_en: 'In 1910, Los Angeles was a sun-washed landscape of orange groves, Pacific Electric Red Cars, and the earliest silent film studios arriving in Hollywood for year-round daylight. By 2026, LA stretches from Santa Monica pier sunsets and Griffith Observatory hills to global cinema, aerospace, music, and culinary creativity.',
    history_fr: 'En 1910, Los Angeles s’étendait entre vergers d’orangers, tramways Pacific Electric et tout premiers studios de cinéma muet attirés à Hollywood par la lumière constante. En 2026, la Cité des Anges rayonne de la jetée de Santa Monica à l’observatoire Griffith comme capitale mondiale du cinéma, de la musique et du design.',
    facts_en: [
      'When erected in 1923, the legendary hillside Hollywood Sign originally spelled "HOLLYWOODLAND" as a real estate landmark.',
      'Los Angeles County hosts more museums, galleries, and live performance theaters per capita than almost any US metro.',
      'In winter and spring, you can surf Pacific Ocean swells in the morning and ski the San Gabriel Mountains the same afternoon.'
    ],
    facts_fr: [
      'Érigé en 1923, le célèbre panneau Hollywood affichait à l’origine « HOLLYWOODLAND » pour un projet immobilier.',
      'Le comté de Los Angeles compte l’une des plus fortes concentrations de musées et théâtres des États-Unis.',
      'En hiver, il est possible de surfer dans le Pacifique le matin et de skier dans les montagnes voisines l’après-midi.'
    ]
  },
  seoul: {
    iata: 'ICN',
    seoCode: 'SEL',
    history_en: 'In 1910, Seoul’s tiled hanok courtyard roofs and five grand Joseon royal palaces nestled inside fortress mountains along the Han River. By 2026, Seoul seamlessly blends restored 600-year-old Gyeongbokgung Palace with futuristic Gangnam towers, Cheonggyecheon’s illuminated urban stream, K-culture innovation, and gigabit smart-city energy.',
    history_fr: 'En 1910, les toits recourbés des maisons hanok et les cinq palais royaux de la dynastie Joseon s’étendaient entre montagnes fortifiées et fleuve Han. En 2026, Séoul marie le palais Gyeongbokgung vieux de 600 ans aux gratte-ciels futuristes de Gangnam, au ruisseau illuminé de Cheonggyecheon et à l’avant-garde K-culture.',
    facts_en: [
      'Five 500-to-600-year-old Joseon royal palaces stand right beside gleaming cyberpunk skyscrapers and LED avenues.',
      'Over 10,000 themed and specialty coffee shops make Seoul one of the undisputed café capitals of the world.',
      'Consistently ranked among Earth’s safest, cleanest, and fastest hyper-connected megacities.'
    ],
    facts_fr: [
      'Cinq palais royaux vieux de plus de 500 ans côtoient directement des gratte-ciels futuristes et avenues lumineuses.',
      'Avec plus de 10 000 cafés de spécialité et à thème, Séoul est l’une des capitales mondiales du café.',
      'Régulièrement classée parmi les mégapoles les plus sûres et les mieux connectées de la planète.'
    ]
  },
  geneva: {
    iata: 'GVA',
    seoCode: 'GVA',
    history_en: 'In 1910, Geneva was already an alpine beacon of Swiss precision watchmaking, lakeside grand hotels, and humanitarian diplomacy beside the original harbor Jet d’Eau. In 2026, sparkling Lake Geneva frames Mont Blanc views, United Nations diplomacy, CERN’s frontier particle physics, and serene waterfront promenades.',
    history_fr: 'En 1910, Genève rayonnait déjà par sa haute horlogerie suisse, ses grands hôtels au bord du lac et son rôle humanitaire face au premier Jet d’Eau. En 2026, le lac Léman reflète le mont Blanc, la diplomatie internationale, la recherche scientifique du CERN et des promenades lacustres paisibles.',
    facts_en: [
      'The iconic Jet d’Eau pumps 500 liters of water per second up to 140 meters above Lake Geneva at 200 km/h.',
      'Birthplace of the International Red Cross, European headquarters of the UN, and home to CERN’s particle physics lab.',
      'More than 40% of Geneva’s residents hold international passports, creating a deeply cosmopolitan alpine city.'
    ],
    facts_fr: [
      'Le célèbre Jet d’Eau propulse 500 litres d’eau par seconde à 140 mètres au-dessus du lac Léman à 200 km/h.',
      'Berceau de la Croix-Rouge internationale, siège européen de l’ONU et foyer voisin du CERN.',
      'Plus de 40 % des habitants de Genève possèdent une nationalité étrangère, reflétant son âme cosmopolite.'
    ]
  },
  singapore: {
    iata: 'SIN',
    seoCode: 'SIN',
    history_en: 'In 1910, colonial Singapore thrived as a bustling maritime crossroads of pastel shophouses, wooden bumboats along the Singapore River, and spice-scented docks. By 2026, it has blossomed into the world’s prototype "City in Nature" — crowned by Marina Bay Sands, solar-harvesting Supertree groves, UNESCO hawker gastronomy, and lush vertical forests.',
    history_fr: 'En 1910, Singapour prospérait comme grand carrefour maritime bordé de maisons-boutiques pastel et de barques traditionnelles sur la rivière Singapour. En 2026, la cité-État incarne la « Ville dans la Nature » avec Marina Bay Sands, les Supertrees solaires, ses hawker centres classés à l’UNESCO et ses gratte-ciels végétalisés.',
    facts_en: [
      'Gardens by the Bay’s towering Supertrees act as living vertical gardens that harvest solar energy and rainwater.',
      'Changi Airport features the Jewel Rain Vortex — a breathtaking 40-meter indoor waterfall surrounded by terraced rainforest.',
      'Nearly half of this sovereign island metropolis is shaded by parks, nature reserves, and skyrise green canopy.'
    ],
    facts_fr: [
      'Les Supertrees géants de Gardens by the Bay sont des jardins verticaux qui captent l’énergie solaire et l’eau de pluie.',
      'L’aéroport de Changi abrite le Jewel Rain Vortex, une cascade intérieure de 40 mètres au cœur d’une forêt tropicale.',
      'Près de la moitié du territoire de la cité-État est couverte de parcs, réserves naturelles et jardins suspendus.'
    ]
  },
  sydney: {
    iata: 'SYD',
    seoCode: 'SYD',
    history_en: 'In 1910, Sydney’s sandstone Circular Quay bustled with wooden steam ferries crossing the untouched harbor decades before the Harbour Bridge or Opera House sails existed. In 2026, those two architectural icons frame sparkling Pacific coves, Bondi coastal walks, vibrant laneway coffee roasters, and year-round outdoor harbor living.',
    history_fr: 'En 1910, les quais en grès de Circular Quay s’animaient au rythme des ferries à vapeur, bien avant la construction du Harbour Bridge et des voiles de l’Opéra. En 2026, ces deux icônes architecturales surplombent des criques turquoise, le sentier côtier de Bondi et un art de vivre maritime ensoleillé.',
    facts_en: [
      'The Sydney Opera House’s sculpted white sails are covered by over 1 million self-cleaning Swedish ceramic tiles.',
      'Greater Sydney boasts more than 100 natural ocean and harbor beaches, from Bondi to Manly.',
      'On hot Australian summer days, steel expansion causes the Sydney Harbour Bridge arch to rise up to 18 cm higher.'
    ],
    facts_fr: [
      'Les célèbres voiles blanches de l’Opéra de Sydney sont recouvertes de plus d’un million de tuiles céramiques suédoises.',
      'La région de Sydney compte plus de 100 plages naturelles océaniques et portuaires, de Bondi à Manly.',
      'Lors des fortes chaleurs d’été, la dilatation de l’acier fait s’élever l’arche du Sydney Harbour Bridge jusqu’à 18 cm.'
    ]
  },
  rio: {
    iata: 'GIG',
    seoCode: 'RIO',
    history_en: 'In 1910, Rio de Janeiro had just unveiled the grand Belle Époque Avenida Central and Theatro Municipal beneath the dramatic granite peaks of Sugarloaf and Corcovado (twenty-one years before Christ the Redeemer stood atop it). In 2026, golden Copacabana mosaic promenades, samba rhythms, and lush Tijuca rainforest cliffs make Rio one of Earth’s most breathtaking coastal vistas.',
    history_fr: 'En 1910, Rio de Janeiro venait d’inaugurer la majestueuse Avenida Central et le Théâtre Municipal sous le Pain de Sucre et le Corcovado, vingt et un ans avant l’érection du Christ Rédempteur. En 2026, les mosaïques de Copacabana, les rythmes de samba et la forêt de Tijuca composent l’un des plus beaux décors côtiers du monde.',
    facts_en: [
      'Standing atop Mount Corcovado since 1931, Christ the Redeemer was voted one of the New Seven Wonders of the World.',
      'Tijuca National Park inside Rio is among the largest hand-replanted urban rainforests anywhere on Earth.',
      'Copacabana Beach’s black-and-white wave-patterned Portuguese pavement stretches along 4 km of Atlantic shoreline.'
    ],
    facts_fr: [
      'Dressé au sommet du Corcovado depuis 1931, le Christ Rédempteur figure parmi les sept nouvelles merveilles du monde.',
      'Le parc national de Tijuca au cœur de Rio est l’une des plus vastes forêts tropicales urbaines de la planète.',
      'La célèbre promenade en mosaïque ondulée de Copacabana s’étire sur 4 kilomètres face à l’océan Atlantique.'
    ]
  },
  istanbul: {
    iata: 'IST',
    seoCode: 'IST',
    history_en: 'In 1910, Istanbul’s Golden Horn silhouette shimmered with Ottoman domes, minarets, Galata Bridge ferries, and lively spice bazaars bridging Europe and Asia. By 2026, modern suspension bridges and undersea Bosphorus rail tunnels link 1,500-year-old Hagia Sophia and Karaköy cafés with dynamic contemporary design and gastronomy.',
    history_fr: 'En 1910, la silhouette de la Corne d’Or d’Istanbul étincelait de coupoles ottomanes, de minarets, de ferries au pont de Galata et de bazars parfumés entre Europe et Asie. En 2026, ponts suspendus et tunnels sous le Bosphore relient Sainte-Sophie aux cafés créatifs de Karaköy et à une gastronomie effervescente.',
    facts_en: [
      'Istanbul is the world’s most famous transcontinental megacity, straddling both Europe and Asia across the Bosphorus Strait.',
      'Founded in 1461, the covered Grand Bazaar houses over 4,000 shops weaving through 61 historic vaulted streets.',
      'Served sequentially as the imperial capital of the Roman, Byzantine, and Ottoman empires for over 1,600 years.'
    ],
    facts_fr: [
      'Istanbul est la grande métropole transcontinentale reliant l’Europe et l’Asie de part et d’autre du détroit du Bosphore.',
      'Fondé en 1461, le Grand Bazar abrite plus de 4 000 boutiques réparties le long de 61 ruelles couvertes.',
      'Elle fut successivement la capitale impériale des empires romain, byzantin et ottoman pendant plus de 1 600 ans.'
    ]
  },
  berlin: {
    iata: 'BER',
    seoCode: 'BER',
    history_en: 'In 1910, Imperial Berlin’s grand Unter den Linden boulevards led past the Brandenburg Gate and Museum Island’s neoclassical domes amid bustling tramways and cabarets. Reborn and reunited, 2026 Berlin radiates underground electronic music, world-renowned contemporary art, green lakes, and one of Europe’s leading creative startup scenes.',
    history_fr: 'En 1910, l’avenue Unter den Linden menait de la Porte de Brandebourg aux coupoles néoclassiques de l’Île aux Musées dans une métropole vibrante de tramways et de cabarets. Réunifiée et réinventée, le Berlin de 2026 rayonne par sa scène électronique, son art contemporain, ses lacs boisés et son écosystème créatif et start-up.',
    facts_en: [
      'Berlin spans more than 1,700 bridges over its rivers and canals — far more bridges than Venice itself.',
      'Home to over 180 museums (including UNESCO-listed Museum Island) plus 2,500+ public parks and gardens.',
      'Roughly 30% of Berlin’s total metropolitan area is covered by forests, lakes, rivers, and leafy green spaces.'
    ],
    facts_fr: [
      'Berlin compte plus de 1 700 ponts enjambant ses rivières et canaux, soit bien davantage que Venise.',
      'La capitale réunit plus de 180 musées — dont l’Île aux Musées classée à l’UNESCO — et plus de 2 500 parcs.',
      'Environ 30 % du territoire berlinois est recouvert de forêts, de lacs, de cours d’eau et d’espaces verts.'
    ]
  },
  amsterdam: {
    iata: 'AMS',
    seoCode: 'AMS',
    history_en: 'In 1910, Amsterdam’s iconic 17th-century stepped-gable canal ring echoed with barge horns, early bicycles, and bustling flower markets near Centraal Station. In 2026, those UNESCO waterways remain wonderfully intact while the city leads global cycling culture, sustainable design, golden-age museums, and cozy canal-side cafés.',
    history_fr: 'En 1910, la ceinture de canaux du XVIIe siècle d’Amsterdam résonnait du passage des péniches, des premiers vélos et des marchés aux fleurs près de Centraal Station. En 2026, ces canaux classés à l’UNESCO sont intacts au cœur de la capitale mondiale du vélo, du design durable et des musées du Siècle d’or.',
    facts_en: [
      'Amsterdam has more bicycles than human residents, gliding safely across more than 400 km of dedicated bike lanes.',
      'Its UNESCO-listed canal network features 165 picturesque waterways crossed by 1,281 historic bridges.',
      'Centuries-old gabled canal houses stand firmly supported by millions of wooden foundation piles driven deep into sandy earth.'
    ],
    facts_fr: [
      'Amsterdam compte davantage de vélos que d’habitants, circulant sur plus de 400 km de pistes cyclables dédiées.',
      'Son réseau classé à l’UNESCO comprend 165 canaux pittoresques franchis par 1 281 ponts historiques.',
      'Les maisons à pignons historiques reposent sur des millions de pilotis en bois enfouis sous la ville.'
    ]
  },
  lisbon: {
    iata: 'LIS',
    seoCode: 'LIS',
    history_en: 'In 1910, Lisbon’s pastel azulejo-tiled hills rang with the bells of newly electrified wooden yellow trams climbing from Rossio Square toward Alfama’s Moorish alleys overlooking the Tagus River. In 2026, Tram 28 still glides along those sunlit slopes beside Atlantic sunset miradouros, fado nights, and thriving digital-nomad tech studios.',
    history_fr: 'En 1910, les collines revêtues d’azulejos pastel de Lisbonne résonnaient déjà des cloches des tramways jaunes électriques montant du Rossio vers les ruelles d’Alfama face au Tage. En 2026, le mythique Tram 28 grimpe toujours ces pentes ensoleillées entre belvédères dorés, soirées de fado et studios créatifs.',
    facts_en: [
      'Older than Rome by centuries, Lisbon is one of Western Europe’s oldest continuously inhabited capitals.',
      'The iconic vintage yellow Tram 28 climbs historic narrow cobblestone hills with gradients reaching 13.5%.',
      'Blessed with around 2,800 hours of golden Atlantic sunshine per year — Europe’s sunniest mainland capital.'
    ],
    facts_fr: [
      'Fondée des siècles avant Rome, Lisbonne est l’une des plus anciennes capitales d’Europe occidentale.',
      'Le mythique Tram 28 jaune gravit des ruelles pavées historiques affichant des pentes jusqu’à 13,5 %.',
      'Avec près de 2 800 heures de soleil atlantique par an, c’est la capitale continentale la plus ensoleillée d’Europe.'
    ]
  },
  cairo: {
    iata: 'CAI',
    seoCode: 'CAI',
    history_en: 'In 1910, Belle Époque Downtown Cairo combined Parisian-style boulevards, Nile felucca sailboats, and centuries-old Khan el-Khalili bazaars gazing out toward the timeless Giza plateau. In 2026, the Grand Egyptian Museum and bustling modern Nile skyline honor 4,500 years of pharaonic and Islamic architectural grandeur.',
    history_fr: 'En 1910, le centre Belle Époque du Caire mêlait boulevards élégants, felouques glissant sur le Nil et souks séculaires de Khan el-Khalili face au plateau éternel de Gizeh. En 2026, le Grand Musée égyptien et la skyline moderne du Nil perpétuent 4 500 ans de splendeur pharaonique et islamique.',
    facts_en: [
      'The Great Pyramid of Giza on Cairo’s edge stood as the tallest human-made structure on Earth for over 3,800 years.',
      'Founded in 970 AD, Cairo’s Al-Azhar University is among the oldest continuously operating universities in the world.',
      'Celebrated across history as the "City of a Thousand Minarets" rising along the fertile banks of the Nile River.'
    ],
    facts_fr: [
      'La Grande Pyramide de Gizeh, aux portes du Caire, a été le plus haut monument bâti par l’homme pendant 3 800 ans.',
      'Fondée en 970, l’université Al-Azhar du Caire compte parmi les plus anciennes universités en activité au monde.',
      'Surnommée à travers les siècles la « Ville aux mille minarets » le long des rives mythiques du Nil.'
    ]
  }
};

/* ── 12 Curated City-vs-City Rivalry Pages (Covers ALL 24 REMO Cities!) ── */
const SEO_VERSUS_DUELS = [
  {
    slug: 'montreal-vs-paris',
    a: 'montreal',
    b: 'paris',
    theme_en: 'The Francophone Crown',
    theme_fr: 'Le Choc Francophone',
    verdict_en: 'Paris reigns supreme in timeless Haussmann architecture, world museums, and Michelin haute cuisine. Montréal fires back with North America’s coolest creative festivals, bilingual warmth, affordable neighborhood cafés, and thriving AI innovation.',
    verdict_fr: 'Paris règne par son architecture haussmannienne, ses musées légendaires et sa haute gastronomie étoilée. Montréal répond par ses grands festivals créatifs, sa chaleur bilingue nord-américaine, ses cafés de quartier et son écosystème IA.'
  },
  {
    slug: 'chisinau-vs-bucharest',
    a: 'chisinau',
    b: 'bucharest',
    theme_en: 'Eastern European Titans',
    theme_fr: 'Le Duel des Capitales de l’Est',
    verdict_en: 'Chișinău captivates with lush green lakes and parks, white-stone neoclassical charm, soulful hospitality, and the world’s largest underground wine cellars. Bucharest ("Little Paris") answers with grand Belle Époque palaces, electric Old Town nightlife, and gigabit tech energy.',
    verdict_fr: 'Chișinău séduit par ses parcs boisés et ses lacs, son charme néoclassique en pierre blanche, son hospitalité et ses caves viticoles souterraines uniques. Bucarest (« le Petit Paris ») réplique par ses grands palais Belle Époque, la vie nocturne de Lipscani et sa vitalité tech.'
  },
  {
    slug: 'newyork-vs-london',
    a: 'newyork',
    b: 'london',
    theme_en: 'Transatlantic Capitals of the World',
    theme_fr: 'Les Deux Capitales Transatlantiques',
    verdict_en: 'New York City delivers nonstop 24/7 skyscraper drama, Broadway energy, and 800-language street food diversity. London counters with royal Thames landmarks, 170+ free world-class museums, West End culture, and iconic historic pubs and parks.',
    verdict_fr: 'New York fascine par ses gratte-ciels 24h/24, l’énergie de Broadway et sa cuisine cosmopolite aux 800 langues. Londres oppose ses monuments royaux sur la Tamise, plus de 170 musées gratuits, le West End et ses parcs verdoyants.'
  },
  {
    slug: 'tokyo-vs-seoul',
    a: 'tokyo',
    b: 'seoul',
    theme_en: 'Asia’s Neon & Heritage Superpowers',
    theme_fr: 'Les Géants Néon & Patrimoine d’Asie',
    verdict_en: 'Tokyo dazzles with ultra-refined culinary mastery, serene Shinto shrines, and the iconic Shibuya crossing. Seoul rivals it with 500-year-old Joseon palaces framed by futuristic towers, 10,000+ designer cafés, and nonstop K-culture energy.',
    verdict_fr: 'Tokyo éblouit par sa gastronomie d’exception, ses sanctuaires shinto paisibles et Shibuya. Séoul rivalise avec ses palais Joseon vieux de 500 ans, plus de 10 000 cafés tendance et une scène K-culture électrisante.'
  },
  {
    slug: 'barcelona-vs-rome',
    a: 'barcelona',
    b: 'rome',
    theme_en: 'Mediterranean Soul & Sunlit Art',
    theme_fr: 'L’Âme Méditerranéenne & le Soleil',
    verdict_en: 'Barcelona fuses Gaudí’s surreal Sagrada Família with urban Mediterranean beaches and sunlit tapas squares. Rome answers as Earth’s grandest open-air museum, where the Colosseum, 2,000 fountains, and Trastevere trattorias embody timeless la dolce vita.',
    verdict_fr: 'Barcelone marie l’architecture onirique de Gaudí, les plages urbaines et les tapas ensoleillées. Rome répond en véritable musée à ciel ouvert où le Colisée, 2 000 fontaines et Trastevere incarnent la dolce vita.'
  },
  {
    slug: 'miami-vs-dubai',
    a: 'miami',
    b: 'dubai',
    theme_en: 'Sun, Skylines & Luxury Waterfronts',
    theme_fr: 'Soleil, Skylines & Prestige Maritime',
    verdict_en: 'Miami glows with pastel Ocean Drive Art Deco, turquoise Atlantic beaches, and vibrant Latin-fusion nightlife. Dubai pushes the skyline into the future with the 828m Burj Khalifa, desert luxury resorts, and architectural islands.',
    verdict_fr: 'Miami rayonne par l’Art déco pastel d’Ocean Drive, ses plages turquoise et sa vie nocturne latino. Dubaï repousse les frontières du futur avec le Burj Khalifa (828 m), le luxe du désert et ses îles architecturales.'
  },
  {
    slug: 'toronto-vs-losangeles',
    a: 'toronto',
    b: 'losangeles',
    theme_en: 'North America’s Cinema & Skyline Rivals',
    theme_fr: 'Les Rivales Nord-Américaines du Cinéma',
    verdict_en: 'Toronto pairs its gleaming CN Tower lakeside skyline with 200+ multicultural neighborhoods, walkable urban transit, and the renowned TIFF film scene. Los Angeles counters with year-round California sunshine, Hollywood cinema history, and Pacific surf canyons.',
    verdict_fr: 'Toronto associe sa skyline au bord du lac Ontario à plus de 200 cultures, un centre dynamique et le festival TIFF. Los Angeles répond par le soleil californien toute l’année, l’histoire d’Hollywood et les plages du Pacifique.'
  },
  {
    slug: 'berlin-vs-amsterdam',
    a: 'berlin',
    b: 'amsterdam',
    theme_en: 'Europe’s Creative & Cycling Capitals',
    theme_fr: 'Les Capitales Créatives & Vélo d’Europe',
    verdict_en: 'Berlin thrills with monumental 20th-century history, unmatched electronic nightlife, leafy lakes, and bold avant-garde art. Amsterdam charms with 165 UNESCO golden-age canals, 400+ km of cycling lanes, and world-famous Dutch master museums.',
    verdict_fr: 'Berlin passionne par son histoire contemporaine, sa scène électronique légendaire, ses lacs et son art d’avant-garde. Amsterdam enchante avec ses 165 canaux UNESCO, ses pistes cyclables et ses musées du Siècle d’or.'
  },
  {
    slug: 'lisbon-vs-istanbul',
    a: 'lisbon',
    b: 'istanbul',
    theme_en: 'Golden Hills & Maritime Crossroads',
    theme_fr: 'Collines Dorées & Carrefours Maritimes',
    verdict_en: 'Lisbon enchants with Atlantic sunshine, vintage yellow Tram 28 hills, azulejo tiles, and soulful Fado evenings. Istanbul astounds as a transcontinental bridge between Europe and Asia, uniting imperial domes, Bosphorus ferries, and the 1461 Grand Bazaar.',
    verdict_fr: 'Lisbonne charme par son soleil atlantique, son Tram 28, ses azulejos et ses soirées de fado. Istanbul fascine entre Europe et Asie par ses coupoles impériales, ses ferries sur le Bosphore et le Grand Bazar de 1461.'
  },
  {
    slug: 'monaco-vs-geneva',
    a: 'monaco',
    b: 'geneva',
    theme_en: 'Riviera Glamour vs Alpine Elegance',
    theme_fr: 'Prestige Azuréen vs Élégance Alpine',
    verdict_en: 'Monaco sparkles on the sunlit French Riviera with Port Hercule superyachts, Monte-Carlo elegance, and the Formula 1 Grand Prix. Geneva counters with serene Alpine luxury, Lake Geneva’s 140m Jet d’Eau, haute horlogerie, and global diplomacy.',
    verdict_fr: 'Monaco étincelle sur la Côte d’Azur grâce au port Hercule, Monte-Carlo et le Grand Prix de Formule 1. Genève répond par l’élégance alpine du lac Léman, son Jet d’Eau de 140 m, la haute horlogerie et la diplomatie internationale.'
  },
  {
    slug: 'sydney-vs-singapore',
    a: 'sydney',
    b: 'singapore',
    theme_en: 'Indo-Pacific Harbor & Garden Icons',
    theme_fr: 'Icônes Portuaires & Jardins d’Asie-Pacifique',
    verdict_en: 'Sydney captivates with the Opera House sails, 100+ golden ocean beaches, and effortless coastal outdoor life. Singapore dazzles as a futuristic "City in Nature" with solar Supertrees, Marina Bay Sands, and UNESCO hawker gastronomy.',
    verdict_fr: 'Sydney séduit par les voiles de son Opéra, plus de 100 plages océaniques et son art de vivre en plein air. Singapour émerveille comme « Ville dans la Nature » entre Supertrees solaires, Marina Bay et gastronomie UNESCO.'
  },
  {
    slug: 'rio-vs-cairo',
    a: 'rio',
    b: 'cairo',
    theme_en: 'Wonders of the Ancient & Modern World',
    theme_fr: 'Merveilles du Monde Antique & Moderne',
    verdict_en: 'Rio de Janeiro blends Christ the Redeemer’s mountaintop panorama, Copacabana beaches, and lush urban rainforests with unstoppable samba joy. Cairo awes travelers with the 4,500-year-old Great Pyramids of Giza, Nile feluccas, and vibrant millennia-old bazaars.',
    verdict_fr: 'Rio de Janeiro unit le panorama du Christ Rédempteur, les plages de Copacabana, la forêt de Tijuca et l’énergie de la samba. Le Caire émerveille avec les pyramides millénaires de Gizeh, le Nil et ses souks historiques.'
  }
];

module.exports = { SEO_CITY_EXTRA, SEO_VERSUS_DUELS };
