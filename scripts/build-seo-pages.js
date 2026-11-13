/* ════════════════════════════════════════════════════════════════════
   🌐 REMO WORLD — Static Programmatic SEO, Sitemap, Widget & AI Search Builder (v61)
   Generates 58 crawlable EN/FR static HTML landing pages, widget.html,
   sitemap.xml (with hreflang), robots.txt, llms.txt, llms-full.txt & IndexNow key.
   Strict Bilingual Output: English (EN) & French (FR) ONLY.
   ════════════════════════════════════════════════════════════════════ */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const DOMAIN = 'https://remoworld.com';
const TODAY = '2026-11-12';
const INDEXNOW_KEY = 'remoindexnow2026key8f4a2b9c1d7e3a5f';

/* ── 1. Load Canonical Cities & Radio Stations Directly from Source ── */
function loadCitiesAndStations() {
  const citiesSrc = fs.readFileSync(path.join(ROOT, 'js', 'remo-cities-data.js'), 'utf8');
  const citySandbox = {
    window: {},
    localStorage: { getItem: () => null, setItem: () => {} },
    document: { createElement: () => ({ getContext: () => null }) }
  };
  vm.createContext(citySandbox);
  vm.runInContext(citiesSrc + '\nwindow.__CITIES = REMO_DEFAULT_CITIES; window.__ELEMENTS = REMO_ELEMENTS;', citySandbox);

  const radioSrc = fs.readFileSync(path.join(ROOT, 'js', 'remo-radio-engine.js'), 'utf8');
  const match = radioSrc.match(/const\s+REMO_RADIO_STATIONS\s*=\s*(\[[\s\S]*?\n\s*\]);/);
  if (!match) throw new Error('Could not parse REMO_RADIO_STATIONS from js/remo-radio-engine.js');
  const stationSandbox = {};
  vm.createContext(stationSandbox);
  const stations = vm.runInContext('(' + match[1] + ')', stationSandbox);

  return {
    cities: citySandbox.window.__CITIES,
    elements: citySandbox.window.__ELEMENTS,
    stations
  };
}

const CITY_TIMEZONES = {
  montreal: 'America/Toronto',
  paris: 'Europe/Paris',
  chisinau: 'Europe/Chisinau',
  bucharest: 'Europe/Bucharest',
  newyork: 'America/New_York',
  tokyo: 'Asia/Tokyo',
  london: 'Europe/London',
  dubai: 'Asia/Dubai',
  miami: 'America/New_York',
  barcelona: 'Europe/Madrid',
  rome: 'Europe/Rome',
  toronto: 'America/Toronto',
  monaco: 'Europe/Monaco',
  losangeles: 'America/Los_Angeles',
  seoul: 'Asia/Seoul',
  geneva: 'Europe/Zurich',
  singapore: 'Asia/Singapore',
  sydney: 'Australia/Sydney',
  rio: 'America/Sao_Paulo',
  istanbul: 'Europe/Istanbul',
  berlin: 'Europe/Berlin',
  amsterdam: 'Europe/Amsterdam',
  lisbon: 'Europe/Lisbon',
  cairo: 'Africa/Cairo'
};

const CONTINENT_FR = {
  'Europe': 'Europe',
  'North America': 'Amérique du Nord',
  'Asia': 'Asie',
  'Middle East': 'Moyen-Orient',
  'South America': 'Amérique du Sud',
  'Oceania': 'Océanie',
  'Africa': 'Afrique'
};

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function getStationsForCity(city, allStations) {
  const direct = allStations.filter((s) => s.cityId === city.id);
  if (direct.length > 0) return direct;
  const fallbackMap = {
    toronto: ['montreal_cbc', 'capital_chill'],
    losangeles: ['synthwave_nightdrive', 'nightwave_plaza'],
    geneva: ['swiss_pop', 'rainy_jazz_piano'],
    singapore: ['somafm_groove', 'tokyo_jpop'],
    sydney: ['capital_chill', 'london_capital'],
    rio: ['rio_bossa', 'miami_reggaeton'],
    istanbul: ['dubai_dj', 'lagos_afrobeats'],
    amsterdam: ['berlin_techno', 'ibiza_sunset'],
    lisbon: ['ibiza_sunset', 'rio_bossa'],
    cairo: ['dubai_dj', 'lagos_afrobeats']
  };
  const ids = fallbackMap[city.id] || ['capital_chill', 'somafm_groove'];
  return ids.map((id) => allStations.find((s) => s.id === id)).filter(Boolean);
}

/* ── 2. Shared Lightweight SEO Stylesheet (Inline for 100/100 Speed) ── */
const SHARED_CSS = `
*{box-sizing:border-box;margin:0;padding:0}
:root{--bg:#050816;--card:rgba(15,23,42,0.86);--border:rgba(56,189,248,0.24);--gold:#fbbf24;--cyan:#38bdf8;--violet:#8b5cf6;--txt:#f8fafc;--muted:#94a3b8}
body{font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;background:radial-gradient(circle at 15% 0%,rgba(99,102,241,0.22),transparent 45%),radial-gradient(circle at 85% 10%,rgba(56,189,248,0.16),transparent 45%),var(--bg);color:var(--txt);line-height:1.6;min-height:100vh}
a{color:var(--cyan);text-decoration:none}a:hover{text-decoration:underline}
.wrap{max-width:1040px;margin:0 auto;padding:18px 16px 64px}
.topbar{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:12px 16px;background:var(--card);border:1px solid var(--border);border-radius:16px;margin-bottom:22px;backdrop-filter:blur(12px)}
.brand{display:flex;align-items:center;gap:10px;font-weight:900;font-size:1.05rem;color:#fff;text-decoration:none}
.brand img{width:34px;height:34px;border-radius:50%;box-shadow:0 0 12px rgba(251,191,36,0.45)}
.top-links{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.pill{display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:999px;font-size:0.8rem;font-weight:700;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.14);color:#e2e8f0;text-decoration:none;transition:0.2s}
.pill:hover{border-color:var(--cyan);color:#fff;text-decoration:none;transform:translateY(-1px)}
.pill.gold{background:linear-gradient(135deg,#f59e0b,#fbbf24);color:#0f172a;border:none;font-weight:900;box-shadow:0 0 18px rgba(251,191,36,0.35)}
.hero{background:linear-gradient(145deg,rgba(15,23,42,0.94),rgba(30,27,75,0.78));border:1px solid rgba(251,191,36,0.32);border-radius:24px;padding:28px 24px;margin-bottom:22px;box-shadow:0 18px 45px rgba(0,0,0,0.45)}
.eyebrow{display:inline-flex;align-items:center;gap:6px;font-size:0.76rem;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:var(--gold);background:rgba(251,191,36,0.12);border:1px solid rgba(251,191,36,0.3);padding:4px 12px;border-radius:999px;margin-bottom:12px}
h1{font-size:clamp(1.6rem,4vw,2.35rem);line-height:1.2;font-weight:900;margin-bottom:10px;color:#fff}
.lead{font-size:1.02rem;color:#cbd5e1;max-width:780px;margin-bottom:18px}
.cta-row{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
.btn-primary{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:13px 22px;border-radius:14px;font-weight:900;font-size:0.95rem;background:linear-gradient(135deg,#f59e0b,#fbbf24);color:#090d16;border:none;cursor:pointer;text-decoration:none;box-shadow:0 8px 25px rgba(245,158,11,0.4);transition:0.2s}
.btn-primary:hover{transform:translateY(-2px);text-decoration:none;box-shadow:0 12px 30px rgba(245,158,11,0.58)}
.btn-sec{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:12px 18px;border-radius:14px;font-weight:800;font-size:0.9rem;background:rgba(56,189,248,0.13);border:1px solid rgba(56,189,248,0.45);color:#e0f2fe;cursor:pointer;text-decoration:none;transition:0.2s}
.btn-sec:hover{background:rgba(56,189,248,0.24);text-decoration:none}
.grid-2{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:18px;margin-bottom:22px}
.grid-3{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;margin-bottom:22px}
.card{background:var(--card);border:1px solid var(--border);border-radius:20px;padding:20px}
.card h2{font-size:1.18rem;font-weight:800;margin-bottom:10px;color:#fff;display:flex;align-items:center;gap:8px}
.stat-row{display:flex;align-items:center;justify-content:space-between;font-size:0.86rem;margin-bottom:6px;color:#e2e8f0}
.bar{height:8px;background:rgba(255,255,255,0.08);border-radius:99px;overflow:hidden;margin-bottom:12px}
.bar > i{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,var(--cyan),var(--violet),var(--gold))}
.radio-item{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:11px 13px;border-radius:14px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);margin-bottom:9px}
.radio-btn{padding:8px 14px;border-radius:999px;border:none;font-weight:900;font-size:0.8rem;cursor:pointer;background:linear-gradient(135deg,#0ea5e9,#6366f1);color:#fff;white-space:nowrap}
.radio-btn.playing{background:linear-gradient(135deg,#10b981,#059669)}
.live-strip{display:flex;gap:12px;flex-wrap:wrap;margin:14px 0}
.kpi{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:14px;padding:10px 14px;min-width:130px}
.kpi small{display:block;font-size:0.72rem;color:var(--muted);text-transform:uppercase;font-weight:700}
.kpi b{font-size:1.05rem;color:var(--gold)}
details.faq{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.1);border-radius:14px;padding:13px 16px;margin-bottom:10px}
details.faq summary{cursor:pointer;font-weight:800;color:#fff;font-size:0.95rem}
details.faq p{margin-top:8px;color:#cbd5e1;font-size:0.9rem}
.city-link{display:flex;align-items:center;gap:9px;padding:10px 12px;background:rgba(255,255,255,0.035);border:1px solid rgba(255,255,255,0.09);border-radius:13px;color:#f1f5f9;font-weight:700;font-size:0.86rem;text-decoration:none;transition:0.18s}
.city-link:hover{border-color:var(--gold);background:rgba(251,191,36,0.08);text-decoration:none;transform:translateY(-1px)}
.embed-code{width:100%;background:#020617;color:#7dd3fc;border:1px solid rgba(56,189,248,0.35);border-radius:10px;padding:9px;font-family:monospace;font-size:0.76rem;resize:none;margin:8px 0}
footer{margin-top:34px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.1);display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px;font-size:0.82rem;color:var(--muted)}
`;

const INLINE_RADIO_PLAYER_JS = `
<script>
(function(){
  var audio = new Audio();
  audio.preload = 'none';
  var activeId = '';
  window.playSeoStream = function(id, url, fallback, btn){
    if(activeId === id && !audio.paused){
      audio.pause();
      activeId = '';
      document.querySelectorAll('[data-seo-rbtn]').forEach(function(b){ b.classList.remove('playing'); b.textContent = b.getAttribute('data-play-lbl'); });
      return;
    }
    activeId = id;
    document.querySelectorAll('[data-seo-rbtn]').forEach(function(b){ b.classList.remove('playing'); b.textContent = b.getAttribute('data-play-lbl'); });
    btn.classList.add('playing');
    btn.textContent = btn.getAttribute('data-stop-lbl');
    var triedFallback = false;
    audio.onerror = function(){
      if(!triedFallback && fallback && fallback !== url){
        triedFallback = true;
        audio.src = fallback;
        audio.play().catch(function(){});
      }
    };
    audio.src = url;
    audio.play().catch(function(){
      if(!triedFallback && fallback){ triedFallback = true; audio.src = fallback; audio.play().catch(function(){}); }
    });
  };
})();
</script>
`;

function renderSocialMeta(title, desc, url) {
  const img = `${DOMAIN}/img/remo_og_cover.jpg`;
  return `<meta property="og:type" content="website">
  <meta property="og:site_name" content="REMO World">
  <meta property="og:url" content="${url}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:image" content="${img}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(desc)}">
  <meta name="twitter:image" content="${img}">`;
}

function renderTopbar(lang, prefix, altUrl) {
  const isFr = lang === 'fr';
  const base = prefix || './';
  const langDir = isFr ? `${prefix}fr/` : prefix;
  const dirHref = `${langDir}cities/index.html`;
  const focusHref = `${langDir}focus-tv.html`;
  const studyHref = `${langDir}study-room.html`;
  const radioHref = `${langDir}world-radio.html`;
  const blitzHref = `${langDir}world-blitz.html`;
  const appHref = isFr ? `${base}?lang=fr&from=seo` : `${base}?from=seo`;
  const homeHref = isFr ? `${prefix}fr/` : base;
  return `
  <header class="topbar">
    <a class="brand" href="${homeHref}">
      <img src="${prefix}img/remo_brand_coin.png" alt="REMO World Coin Logo" width="34" height="34">
      <span>REMO World 🌐</span>
    </a>
    <nav class="top-links" aria-label="${isFr ? 'Navigation Principale' : 'Primary Navigation'}">
      <a class="pill" href="${dirHref}">🌍 ${isFr ? '24 Villes' : '24 Cities'}</a>
      <a class="pill" href="${focusHref}">📺 ${isFr ? 'Focus TV' : 'Focus TV'}</a>
      <a class="pill" href="${studyHref}">👥 ${isFr ? 'Study Room' : 'Study Room'}</a>
      <a class="pill" href="${radioHref}">📻 ${isFr ? 'Radio Monde' : 'World Radio'}</a>
      <a class="pill" href="${blitzHref}">⚡ ${isFr ? 'World Blitz' : 'World Blitz'}</a>
      <a class="pill" href="${altUrl}" hreflang="${isFr ? 'en' : 'fr'}">${isFr ? '🇬🇧 EN' : '🇫🇷 FR'}</a>
      <a class="pill gold" href="${appHref}">🚀 ${isFr ? 'Ouvrir l’App' : 'Launch App'}</a>
    </nav>
  </header>`;
}

function renderFooter(lang, prefix, stationCount = 56) {
  const isFr = lang === 'fr';
  const base = prefix || './';
  const langDir = isFr ? `${prefix}fr/` : prefix;
  const homeHref = isFr ? `${prefix}fr/` : base;
  return `
  <footer>
    <div>© 2026 <strong>REMO World</strong> — ${isFr ? 'Réseau Social Urbain 4D, Focus TV & Radio Mondiale.' : 'The 4D City Social Network, Focus TV & Live World Radio.'}</div>
    <div style="display:flex;gap:14px;flex-wrap:wrap;">
      <a href="${homeHref}">${isFr ? 'Accueil REMO' : 'REMO Home'}</a>
      <a href="${langDir}focus-tv.html">${isFr ? 'Focus TV 4D' : '4D Focus TV'}</a>
      <a href="${langDir}study-room.html">${isFr ? 'Salles d’Étude' : 'Study Rooms'}</a>
      <a href="${langDir}world-blitz.html">${isFr ? 'World Blitz 60s' : 'World Blitz 60s'}</a>
      <a href="${langDir}cities/index.html">${isFr ? 'Annuaire des Villes' : '24 Cities Directory'}</a>
      <a href="${langDir}world-radio.html">${isFr ? `${stationCount} Radios en Direct` : `${stationCount} Live Radios`}</a>
      <a href="${langDir}guess-the-city.html">${isFr ? 'Deviner la Ville' : 'Guess City'}</a>
      <a href="${langDir}boarding-pass.html">${isFr ? 'Billet 4D' : 'Boarding Pass'}</a>
      <a href="${langDir}world-ranking.html">${isFr ? 'Classement 2026' : 'World Ranking 2026'}</a>
      <a href="${langDir}city-versus.html">${isFr ? 'Duels Villes' : 'City Duels'}</a>
      <a href="${prefix}llms.txt">AI / LLMs</a>
      <a href="${prefix}sitemap.xml">Sitemap</a>
    </div>
  </footer>`;
}

/* ── 3. Build City Landing Page (EN & FR) ── */
function buildCityPage(city, lang, cities, elements, stations) {
  const isFr = lang === 'fr';
  const cName = isFr ? city.name_fr : city.name_en;
  const country = isFr ? city.country_fr : city.country_en;
  const tagline = isFr ? city.tagline_fr : city.tagline_en;
  const desc = isFr ? city.desc_fr : city.desc_en;
  const continent = isFr ? (CONTINENT_FR[city.continent] || city.continent) : city.continent;
  const elInfo = elements[city.element] || elements.neon;
  const elName = isFr ? elInfo.name_fr : elInfo.name_en;
  const tz = CITY_TIMEZONES[city.id] || 'UTC';
  const cityStations = getStationsForCity(city, stations);

  const enUrl = `${DOMAIN}/cities/${city.id}.html`;
  const frUrl = `${DOMAIN}/fr/cities/${city.id}.html`;
  const canonical = isFr ? frUrl : enUrl;
  const altLangUrl = isFr ? `../../cities/${city.id}.html` : `../fr/cities/${city.id}.html`;
  const prefix = isFr ? '../../' : '../';

  const title = isFr
    ? `${city.flag} ${cName} (${country}) — Radio en Direct, Heure, Météo & Hub 4D | REMO World`
    : `${city.flag} ${cName} (${country}) — Live Radio, Local Time, Weather & 4D City Hub | REMO World`;

  const metaDesc = isFr
    ? `Explorez ${cName} (${country}) en direct sur REMO World : écoutez la radio locale sans publicité, consultez l’heure et la météo live, réclamez votre Passeport 4D (${city.code}) et gagnez +25 Pièces d’Or.`
    : `Explore ${cName} (${country}) live on REMO World: stream free local city radio, check live local time & weather, claim your ${city.code} 4D Citizen Passport, and earn +25 Gold Coins.`;

  const faqs = isFr
    ? [
        {
          q: `Comment écouter la radio de ${cName} en direct gratuitement ?`,
          a: `Cliquez simplement sur le bouton « Écouter » ci-dessus sur REMO World pour écouter les stations liées à ${cName} (${cityStations.map((s) => s.name).join(', ')}) gratuitement, sans compte requis et sans coupure.`
        },
        {
          q: `Comment obtenir le Passeport Citoyen 4D et la Carte ${cName} (${city.code}) ?`,
          a: `Ouvrez le Hub interactif ${cName} sur REMO World. En un clic, vous recevez un Passeport Citoyen officiel +25 Pièces d’Or REMO et pouvez collectionner la carte ${city.rarity} de ${cName}.`
        },
        {
          q: `Quels jeux et outils gratuits sont disponibles pour ${cName} ?`,
          a: `Vous pouvez jouer à « Deviner la Ville » en photo, participer aux Guerres de Villes en direct pour ${cName}, partager des vidéos et des liens web ou générer un Billet d’Embarquement Story 9:16 vers ${cName}.`
        },
        {
          q: `Puis-je intégrer l’horloge, la météo et la radio live de ${cName} sur mon site ou blog ?`,
          a: `Oui ! Copiez gratuitement le code HTML du Widget Live ${cName} présent sur cette page pour afficher l’heure locale (${tz}), la météo en °C et la radio en direct sur votre blog ou site web.`
        }
      ]
    : [
        {
          q: `How can I listen to live ${cName} radio online for free?`,
          a: `Press the instant "Listen Live" button right on this page to stream curated ${cName} & regional radio (${cityStations.map((s) => s.name).join(', ')}) 24/7 in your browser with zero sign-up required.`
        },
        {
          q: `How do I claim an official ${cName} (${city.code}) 4D Citizen Passport & Card?`,
          a: `Click "Enter Live ${cName} Hub" to open REMO World filtered to ${cName}. New citizens instantly receive +25 Gold Coins, a numbered 4D Citizen Passport, and daily packs featuring ${city.rarity} city cards.`
        },
        {
          q: `What free online city games can I play for ${cName}?`,
          a: `Citizens represent ${cName} in the live World City Clicker Cup, test their geography in the "Guess My City" photo game, share videos and web links, and generate 9:16 Story Boarding Passes flying to ${city.code}.`
        },
        {
          q: `Can I embed a free live ${cName} clock, weather, and radio widget on my website?`,
          a: `Yes! Copy the 1-click HTML iframe snippet below to display ${cName}'s live local clock (${tz}), current °C temperature, and 1-click radio stream on any blog, forum, or personal website.`
        }
      ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': canonical,
        'url': canonical,
        'name': title,
        'description': metaDesc,
        'inLanguage': lang,
        'isPartOf': { '@id': `${DOMAIN}/#website` },
        'about': {
          '@type': 'City',
          'name': cName,
          'containedInPlace': { '@type': 'Country', 'name': country },
          'geo': { '@type': 'GeoCoordinates', 'latitude': city.lat, 'longitude': city.lng }
        }
      },
      {
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'REMO World', 'item': `${DOMAIN}/` },
          { '@type': 'ListItem', 'position': 2, 'name': isFr ? 'Villes du Monde' : 'World Cities', 'item': isFr ? `${DOMAIN}/fr/cities/index.html` : `${DOMAIN}/cities/index.html` },
          { '@type': 'ListItem', 'position': 3, 'name': cName, 'item': canonical }
        ]
      },
      {
        '@type': 'FAQPage',
        'mainEntity': faqs.map((f) => ({
          '@type': 'Question',
          'name': f.q,
          'acceptedAnswer': { '@type': 'Answer', 'text': f.a }
        }))
      }
    ]
  };

  const embedSnippet = `<iframe src="${DOMAIN}/widget.html?city=${city.id}&lang=${lang}" width="320" height="156" style="border:0;border-radius:16px;overflow:hidden;" loading="lazy" title="${cName} Live Time, Weather & Radio — REMO World"></iframe>\n<div style="font-size:12px;margin-top:4px;"><a href="${canonical}" target="_blank" rel="noopener">🌐 ${cName} ${isFr ? 'en direct sur REMO World' : 'Live on REMO World'}</a></div>`;

  const otherCities = cities.filter((c) => c.id !== city.id);

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(metaDesc)}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <link rel="canonical" href="${canonical}">
  <link rel="alternate" hreflang="en" href="${enUrl}">
  <link rel="alternate" hreflang="fr" href="${frUrl}">
  <link rel="alternate" hreflang="x-default" href="${enUrl}">
  ${renderSocialMeta(title, metaDesc, canonical)}
  <link rel="icon" type="image/png" sizes="32x32" href="${prefix}img/favicon-32x32.png">
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
  <style>${SHARED_CSS}</style>
</head>
<body>
  <div class="wrap">
    ${renderTopbar(lang, prefix, altLangUrl)}

    <main>
      <section class="hero">
        <div class="eyebrow">${city.flag} ${esc(continent)} • ${esc(country)} • IATA ${esc(city.code)} • ${esc(city.rarity)}</div>
        <h1>${city.flag} ${esc(cName)} — ${esc(tagline)}</h1>
        <p class="lead">${esc(desc)}</p>

        <div class="live-strip">
          <div class="kpi">
            <small>${isFr ? 'Heure Locale Live' : 'Live Local Time'}</small>
            <b id="cityClockVal">--:--:--</b>
          </div>
          <div class="kpi">
            <small>${isFr ? 'Météo Actuelle' : 'Live Weather'}</small>
            <b id="cityWeatherVal">${isFr ? 'Chargement...' : 'Loading...'}</b>
          </div>
          <div class="kpi">
            <small>${isFr ? 'Élément 4D' : '4D Element'}</small>
            <b>${elInfo.icon} ${esc(elName)}</b>
          </div>
          <div class="kpi">
            <small>${isFr ? 'Valeur de Base' : 'Base Card Value'}</small>
            <b>🪙 ${city.baseValue.toLocaleString('en-US')}</b>
          </div>
        </div>

        <div class="cta-row">
          <a class="btn-primary" href="${prefix}?tv=${city.id}&lang=${lang}&from=seo">
            📺 ${isFr ? `Ouvrir Focus TV 4D · ${esc(cName)}` : `Launch 4D Focus TV · ${esc(cName)}`}
          </a>
          <a class="btn-sec" href="${prefix}?tv=${city.id}&fx=rain&lang=${lang}&from=seo">
            🌧️ ${isFr ? `Ambiance Pluie Lofi · ${esc(cName)}` : `Rain Lofi Window · ${esc(cName)}`}
          </a>
          <a class="btn-sec" href="${prefix}?city=${city.id}&lang=${lang}&from=seo">
            🚀 ${isFr ? `Hub Live de ${esc(cName)} (+25 🪙)` : `Enter Live ${esc(cName)} Hub (+25 🪙)`}
          </a>
          <a class="btn-sec" href="${prefix}?open=boardingpass&city=${city.id}&lang=${lang}&from=seo">
            🎫 ${isFr ? `Billet 4D vers ${esc(city.code)}` : `4D Boarding Pass to ${esc(city.code)}`}
          </a>
        </div>
      </section>

      <div class="grid-2">
        <section class="card">
          <h2>📻 ${isFr ? `Radio ${esc(cName)} en Direct (Gratuit & Sans Pub)` : `Live ${esc(cName)} Radio Stream (Free, Zero Ads)`}</h2>
          <p style="font-size:0.86rem;color:var(--muted);margin-bottom:12px;">
            ${isFr
              ? `Écoutez instantanément l’ambiance sonore de ${esc(cName)} directement dans votre navigateur — ou ouvrez l’application complète pour gagner +5 Pièces d’Or toutes les 10 minutes d’écoute !`
              : `Stream ${esc(cName)} live in one click right here — or open the full REMO Radio player to earn +5 Gold Coins for every 10 minutes of active listening!`}
          </p>
          ${cityStations.map((st) => `
          <div class="radio-item">
            <div>
              <strong style="color:#fff;font-size:0.92rem;">${st.icon} ${esc(st.name)}</strong>
              <div style="font-size:0.78rem;color:var(--muted);">${esc(isFr ? st.desc_fr : st.desc_en)}</div>
            </div>
            <button type="button" class="radio-btn" data-seo-rbtn="1"
              data-play-lbl="▶️ ${isFr ? 'Écouter' : 'Listen Live'}"
              data-stop-lbl="⏸️ ${isFr ? 'Pause' : 'Pause'}"
              onclick="playSeoStream('${esc(st.id)}','${esc(st.streamUrl)}','${esc(st.fallbackUrl || '')}',this)">
              ▶️ ${isFr ? 'Écouter' : 'Listen Live'}
            </button>
          </div>`).join('')}
          <div style="margin-top:12px;">
            <a href="../world-radio.html" style="font-size:0.84rem;font-weight:800;">
              🎧 ${isFr ? `Explorer les ${stations.length} Stations Radio du Monde →` : `Explore All ${stations.length} World Radio Stations →`}
            </a>
          </div>
        </section>

        <section class="card">
          <h2>📊 ${isFr ? `Indice Urbain 4D — ${esc(cName)}` : `${esc(cName)} 4D Urban Pulse Ratings`}</h2>
          <div class="stat-row"><span>🎭 ${isFr ? 'Culture & Patrimoine' : 'Culture & Heritage'}</span><b>${city.stats.culture}/100</b></div>
          <div class="bar"><i style="width:${city.stats.culture}%"></i></div>
          <div class="stat-row"><span>🌙 ${isFr ? 'Vie Nocturne & Énergie' : 'Nightlife & Energy'}</span><b>${city.stats.nightlife}/100</b></div>
          <div class="bar"><i style="width:${city.stats.nightlife}%"></i></div>
          <div class="stat-row"><span>⚡ ${isFr ? 'Innovation & Tech' : 'Tech & Innovation'}</span><b>${city.stats.tech}/100</b></div>
          <div class="bar"><i style="width:${city.stats.tech}%"></i></div>
          <div class="stat-row"><span>🍽️ ${isFr ? 'Gastronomie' : 'Gastronomy & Street Food'}</span><b>${city.stats.gastronomy}/100</b></div>
          <div class="bar"><i style="width:${city.stats.gastronomy}%"></i></div>
          <p style="font-size:0.8rem;color:var(--muted);margin-top:6px;">
            📍 ${isFr ? 'Localité' : 'Location'}: ${esc(cName)} (${esc(city.code || '')}) • ${esc(tz)}
          </p>
        </section>
      </div>

      <section class="card" style="margin-bottom:22px;border-color:rgba(251,191,36,0.35);">
        <h2>🧲 ${isFr ? `Widget Gratuit ${esc(cName)} pour Votre Site ou Blog` : `Free Live ${esc(cName)} Badge for Your Blog or Website`}</h2>
        <p style="font-size:0.88rem;color:#cbd5e1;margin-bottom:8px;">
          ${isFr
            ? `Affichez gratuitement l’heure en direct de ${esc(cName)}, la météo °C et un bouton Radio Live sur votre site web, forum ou blog en copiant ce code HTML :`
            : `Display ${esc(cName)}’s live local clock, °C weather, and 1-click City Radio on your blog, travel guide, or community website — 100% free, zero ads:`}
        </p>
        <textarea class="embed-code" rows="3" readonly id="embedCodeBox">${esc(embedSnippet)}</textarea>
        <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;">
          <button type="button" class="btn-sec" onclick="navigator.clipboard.writeText(document.getElementById('embedCodeBox').value);this.textContent='✓ ${isFr ? 'Code Copié !' : 'HTML Copied!'}';">
            📋 ${isFr ? 'Copier le Code HTML' : 'Copy Embed HTML'}
          </button>
          <a class="pill" href="${prefix}widget.html?city=${city.id}&lang=${lang}" target="_blank" rel="noopener">
            👁️ ${isFr ? 'Aperçu du Widget en Direct ↗' : 'Preview Live Widget ↗'}
          </a>
        </div>
      </section>

      <section class="card" style="margin-bottom:22px;">
        <h2>❓ ${isFr ? `Questions Fréquentes sur ${esc(cName)}` : `Frequently Asked Questions — ${esc(cName)}`}</h2>
        ${faqs.map((f, i) => `
        <details class="faq" ${i === 0 ? 'open' : ''}>
          <summary>${esc(f.q)}</summary>
          <p>${esc(f.a)}</p>
        </details>`).join('')}
      </section>

      <section class="card">
        <h2>🌍 ${isFr ? 'Explorer les Autres Métropoles 4D REMO World' : 'Explore More Live World Cities on REMO'}</h2>
        <div class="grid-3">
          ${otherCities.map((oc) => `
          <a class="city-link" href="${oc.id}.html">
            <span>${oc.flag}</span>
            <span>${esc(isFr ? oc.name_fr : oc.name_en)} <small style="color:var(--muted);">(${oc.code})</small></span>
          </a>`).join('')}
        </div>
      </section>
    </main>

    ${renderFooter(lang, prefix)}
  </div>

  ${INLINE_RADIO_PLAYER_JS}
  <script>
  (function(){
    var tz = ${JSON.stringify(tz)};
    var clk = document.getElementById('cityClockVal');
    function tick(){
      try {
        clk.textContent = new Intl.DateTimeFormat('${isFr ? 'fr-FR' : 'en-GB'}', { timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date());
      } catch(e) { clk.textContent = new Date().toUTCString().slice(17,25) + ' UTC'; }
    }
    tick(); setInterval(tick, 1000);
    fetch('https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lng}&current_weather=true')
      .then(function(r){ return r.json(); })
      .then(function(d){
        if(d && d.current_weather && typeof d.current_weather.temperature === 'number'){
          document.getElementById('cityWeatherVal').textContent = Math.round(d.current_weather.temperature) + '°C • ' + Math.round(d.current_weather.windspeed) + ' km/h';
        }
      }).catch(function(){ document.getElementById('cityWeatherVal').textContent = '✨ Live Hub'; });
  })();
  </script>
</body>
</html>`;
}

/* ── 4. Build World Cities Directory Index (cities/index.html & fr/cities/index.html) ── */
function buildDirectoryPage(lang, cities, stationCount = 56) {
  const isFr = lang === 'fr';
  const enUrl = `${DOMAIN}/cities/index.html`;
  const frUrl = `${DOMAIN}/fr/cities/index.html`;
  const canonical = isFr ? frUrl : enUrl;
  const altUrl = isFr ? '../../cities/index.html' : '../fr/cities/index.html';
  const prefix = isFr ? '../../' : '../';

  const title = isFr
    ? '🌍 Les 24 Villes du Monde en Direct — Radio, Météo, Cartes 4D & Jeux | REMO World'
    : '🌍 All 24 Live World Cities — Free City Radio, Weather, 4D Cards & Games | REMO World';
  const desc = isFr
    ? 'Annuaire officiel des 24 métropoles REMO World (Montréal, Paris, Chișinău, Bucarest, Tokyo, New York, Londres, Dubaï...). Radio en direct, heure locale, météo et Passeport 4D gratuit.'
    : 'Official directory of all 24 REMO World cities (Montréal, Paris, Chișinău, Bucharest, Tokyo, New York, London, Dubai...). Stream live local radio, check city time & claim your 4D Citizen Passport.';

  const continents = {};
  cities.forEach((c) => {
    if (!continents[c.continent]) continents[c.continent] = [];
    continents[c.continent].push(c);
  });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    'name': title,
    'description': desc,
    'url': canonical,
    'inLanguage': lang,
    'mainEntity': {
      '@type': 'ItemList',
      'numberOfItems': cities.length,
      'itemListElement': cities.map((c, idx) => ({
        '@type': 'ListItem',
        'position': idx + 1,
        'name': `${c.flag} ${isFr ? c.name_fr : c.name_en} (${isFr ? c.country_fr : c.country_en})`,
        'url': isFr ? `${DOMAIN}/fr/cities/${c.id}.html` : `${DOMAIN}/cities/${c.id}.html`
      }))
    }
  };

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <link rel="canonical" href="${canonical}">
  <link rel="alternate" hreflang="en" href="${enUrl}">
  <link rel="alternate" hreflang="fr" href="${frUrl}">
  <link rel="alternate" hreflang="x-default" href="${enUrl}">
  ${renderSocialMeta(title, desc, canonical)}
  <link rel="icon" type="image/png" sizes="32x32" href="${prefix}img/favicon-32x32.png">
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
  <style>${SHARED_CSS}</style>
</head>
<body>
  <div class="wrap">
    ${renderTopbar(lang, prefix, altUrl)}
    <main>
      <section class="hero">
        <div class="eyebrow">🌐 REMO WORLD • 24 EDITION-1 METROPOLISES</div>
        <h1>${isFr ? 'Explorez les 24 Métropoles Connectées de REMO World' : 'Explore All 24 Connected World Cities on REMO'}</h1>
        <p class="lead">${esc(desc)}</p>
        <div class="cta-row">
          <a class="btn-primary" href="${prefix}?tv=montreal&lang=${lang}&from=seo">📺 ${isFr ? 'Ouvrir Focus TV 4D (Direct)' : 'Open 4D Focus TV (Live)'}</a>
          <a class="btn-sec" href="${prefix}?lang=${lang}&from=seo">🚀 ${isFr ? 'Flux Social (+25 🪙)' : 'Live World Feed (+25 🪙)'}</a>
          <a class="btn-sec" href="../world-radio.html">📻 ${isFr ? `${stationCount} Radios en Direct` : `Stream ${stationCount} World Radios`}</a>
          <a class="btn-sec" href="../focus-tv.html">🌆 ${isFr ? 'Guide Focus TV 4D' : 'Focus TV Guide'}</a>
          <a class="btn-sec" href="../world-blitz.html">⚡ ${isFr ? 'World Blitz 60s' : 'World Blitz 60s'}</a>
          <a class="btn-sec" href="../guess-the-city.html">🕵️ ${isFr ? 'Deviner la Ville' : 'Play Guess The City'}</a>
        </div>
      </section>

      ${Object.keys(continents).map((cont) => `
      <section class="card" style="margin-bottom:18px;">
        <h2>🗺️ ${esc(isFr ? (CONTINENT_FR[cont] || cont) : cont)} (${continents[cont].length})</h2>
        <div class="grid-3">
          ${continents[cont].map((c) => `
          <a class="city-link" href="${c.id}.html">
            <span style="font-size:1.35rem;">${c.flag}</span>
            <div>
              <div>${esc(isFr ? c.name_fr : c.name_en)} <small style="color:var(--gold);">(${c.code})</small></div>
              <small style="color:var(--muted);font-weight:500;">${esc(isFr ? c.country_fr : c.country_en)} • ${esc(c.rarity)}</small>
            </div>
          </a>`).join('')}
        </div>
      </section>`).join('')}
    </main>
    ${renderFooter(lang, prefix)}
  </div>
</body>
</html>`;
}

/* ── 5. Build 4 High-Intent Feature Hubs (EN & FR = 8 Pages) ── */
function buildWorldRadioHubPage(lang, stations, cities) {
  const isFr = lang === 'fr';
  const enUrl = `${DOMAIN}/world-radio.html`;
  const frUrl = `${DOMAIN}/fr/world-radio.html`;
  const canonical = isFr ? frUrl : enUrl;
  const altUrl = isFr ? '../world-radio.html' : 'fr/world-radio.html';
  const prefix = isFr ? '../' : '';

  const stCount = stations.length;
  const title = isFr
    ? `📻 Radio du Monde en Direct Gratuit — ${stCount} Stations Sans Pub (Paris, Montréal, Chișinău, Tokyo) | REMO World`
    : `📻 Free Live World Cities Radio Online — ${stCount} Ad-Free Streams (Lofi, Paris, Montréal, Chișinău, Tokyo) | REMO World`;
  const desc = isFr
    ? `Écoutez ${stCount} radios du monde et ambiances Lofi, Jazz, Synthwave, K-Pop et Hits urbains gratuitement dans votre navigateur. Zéro inscription requise + gagnez des pièces d’or sur REMO World.`
    : `Listen to ${stCount} live world city radio stations, Lofi Beats, Night Jazz, Synthwave, French Touch, Chisinau, Montreal, NYC, Tokyo & Seoul K-Pop free online in your browser. Zero sign-up required.`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        'name': isFr ? `REMO World Radio 2.0 (${stCount} Stations en Direct)` : `REMO World Radio 2.0 (${stCount} Live Stations)`,
        'url': canonical,
        'applicationCategory': 'MultimediaApplication',
        'operatingSystem': 'All',
        'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' },
        'description': desc
      },
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': isFr ? `Puis-je écouter les ${stCount} stations radio gratuitement sans créer de compte ?` : `Can I stream all ${stCount} world radio stations for free without signing up?`,
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': isFr ? 'Oui ! Cliquez sur n’importe quelle station ci-dessous pour lancer le flux audio en direct instantanément sur téléphone ou ordinateur.' : 'Yes! Click Listen on any station below to stream live audio immediately on mobile or desktop with zero registration.'
            }
          },
          {
            '@type': 'Question',
            'name': isFr ? 'Comment fonctionne le mode Listen-to-Earn sur REMO World ?' : 'How does Listen-to-Earn work on REMO World Radio?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': isFr ? 'Dans l’application REMO World, chaque tranche de 10 minutes d’écoute active vous rapporte automatiquement +5 Pièces d’Or REMO (jusqu’à 30 pièces par jour).' : 'Inside the REMO World app, every 10 minutes of active radio listening automatically awards +5 Gold Coins to your Citizen Passport (up to 30 Coins daily).'
            }
          }
        ]
      }
    ]
  };

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <link rel="canonical" href="${canonical}">
  <link rel="alternate" hreflang="en" href="${enUrl}">
  <link rel="alternate" hreflang="fr" href="${frUrl}">
  <link rel="alternate" hreflang="x-default" href="${enUrl}">
  ${renderSocialMeta(title, desc, canonical)}
  <link rel="icon" type="image/png" sizes="32x32" href="${prefix}img/favicon-32x32.png">
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
  <style>${SHARED_CSS}</style>
</head>
<body>
  <div class="wrap">
    ${renderTopbar(lang, prefix, altUrl)}
    <main>
      <section class="hero">
        <div class="eyebrow">📻 ${stCount} LIVE STREAMS • ZERO SIGN-UP • LISTEN-TO-EARN</div>
        <h1>${isFr ? `Radio Mondiale en Direct — ${stCount} Stations Urbaines & Lofi` : `Free Live World Cities Radio — ${stCount} Curated Global Stations`}</h1>
        <p class="lead">${esc(desc)}</p>
        <div class="cta-row">
          <a class="btn-primary" href="${prefix || './'}?tv=montreal&lang=${lang}&from=seo">📺 ${isFr ? 'Ouvrir Focus TV 4D (+5 🪙 / 10 min)' : 'Launch 4D Focus TV (+5 🪙 / 10m)'}</a>
          <input type="search" id="stSearch" placeholder="🔍 ${isFr ? 'Filtrer par ville ou style (ex: Chișinău, Paris, Lofi, Jazz)...' : 'Filter by city or genre (e.g. Chisinau, Paris, Lofi, Jazz)...'}"
            oninput="filterSt(this.value)" style="padding:12px 16px;border-radius:14px;border:1px solid rgba(56,189,248,0.45);background:rgba(2,6,23,0.85);color:#fff;min-width:270px;flex:1;">
        </div>
      </section>

      <section class="card" style="margin-bottom:22px;">
        <h2>🌍 ${isFr ? `Toutes les ${stCount} Stations en Direct (1-Click Play)` : `All ${stCount} Live Stations — Click Any Stream to Listen Instantly`}</h2>
        <div id="stList">
          ${stations.map((st) => `
          <div class="radio-item" data-q="${esc((st.name + ' ' + st.badge + ' ' + st.desc_en + ' ' + st.desc_fr).toLowerCase())}">
            <div>
              <strong style="color:#fff;">${st.icon} ${esc(st.name)}</strong>
              <span class="pill" style="padding:2px 8px;font-size:0.68rem;margin-left:6px;">${esc(st.badge)}</span>
              <div style="font-size:0.8rem;color:var(--muted);">${esc(isFr ? st.desc_fr : st.desc_en)}</div>
            </div>
            <button type="button" class="radio-btn" data-seo-rbtn="1"
              data-play-lbl="▶️ ${isFr ? 'Écouter' : 'Listen'}"
              data-stop-lbl="⏸️ ${isFr ? 'Pause' : 'Pause'}"
              onclick="playSeoStream('${esc(st.id)}','${esc(st.streamUrl)}','${esc(st.fallbackUrl || '')}',this)">
              ▶️ ${isFr ? 'Écouter' : 'Listen'}
            </button>
          </div>`).join('')}
        </div>
      </section>

      <section class="card">
        <h2>🏙️ ${isFr ? 'Radios par Ville' : 'Browse Live City Hubs'}</h2>
        <div class="grid-3">
          ${cities.slice(0, 12).map((c) => `
          <a class="city-link" href="${isFr ? 'cities/' : 'cities/'}${c.id}.html">${c.flag} ${esc(isFr ? c.name_fr : c.name_en)}</a>`).join('')}
        </div>
      </section>
    </main>
    ${renderFooter(lang, prefix)}
  </div>
  ${INLINE_RADIO_PLAYER_JS}
  <script>
  function filterSt(q){
    q = (q || '').toLowerCase().trim();
    document.querySelectorAll('#stList .radio-item').forEach(function(el){
      el.style.display = (!q || el.getAttribute('data-q').indexOf(q) !== -1) ? 'flex' : 'none';
    });
  }
  </script>
</body>
</html>`;
}

function buildGuessCityHubPage(lang, cities) {
  const isFr = lang === 'fr';
  const enUrl = `${DOMAIN}/guess-the-city.html`;
  const frUrl = `${DOMAIN}/fr/guess-the-city.html`;
  const canonical = isFr ? frUrl : enUrl;
  const altUrl = isFr ? '../guess-the-city.html' : 'fr/guess-the-city.html';
  const prefix = isFr ? '../' : '';

  const title = isFr
    ? '🕵️ Jeu Deviner la Ville en Ligne Gratuit — Quiz Photo & Géographie | REMO World'
    : '🕵️ Guess The City Game Online Free — Mystery Photo & Geography Challenge | REMO World';
  const desc = isFr
    ? 'Jouez gratuitement à « Deviner la Ville » dans votre navigateur ! Identifiez les villes mystères publiées par de vrais citoyens autour du monde et gagnez +10 Pièces d’Or par bonne réponse.'
    : 'Play Guess The City free in your browser! Identify real mystery city photos shared by citizens worldwide, test your world geography skills, and win +10 Gold Coins per correct guess.';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    'name': isFr ? 'REMO Guess My City! — Jeu Deviner la Ville' : 'REMO Guess My City! — Free Geography Photo Game',
    'url': canonical,
    'gamePlatform': ['Web Browser', 'Mobile Web'],
    'applicationCategory': 'Game',
    'genre': ['Trivia', 'Geography', 'Puzzle'],
    'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' },
    'description': desc
  };

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <link rel="canonical" href="${canonical}">
  <link rel="alternate" hreflang="en" href="${enUrl}">
  <link rel="alternate" hreflang="fr" href="${frUrl}">
  <link rel="alternate" hreflang="x-default" href="${enUrl}">
  ${renderSocialMeta(title, desc, canonical)}
  <link rel="icon" type="image/png" sizes="32x32" href="${prefix}img/favicon-32x32.png">
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
  <style>${SHARED_CSS}</style>
</head>
<body>
  <div class="wrap">
    ${renderTopbar(lang, prefix, altUrl)}
    <main>
      <section class="hero">
        <div class="eyebrow">🕵️ FREE BROWSER GEOGRAPHY GAME • NO SIGN-UP TO TRY</div>
        <h1>${isFr ? '🕵️ Deviner la Ville — Le Défi Géographique Gratuit en Direct' : '🕵️ Guess The City — Free Online Mystery City Trivia Game'}</h1>
        <p class="lead">${esc(desc)}</p>
        <div class="cta-row">
          <a class="btn-primary" href="${prefix}index.html?open=guess&lang=${lang}&from=seo">🕵️ ${isFr ? 'Jouer aux Défis Photos Live (+10 🪙)' : 'Play Live Photo Challenges (+10 🪙)'}</a>
          <a class="btn-sec" href="${isFr ? 'cities/index.html' : 'cities/index.html'}">🌍 ${isFr ? 'Réviser les 24 Villes' : 'Study All 24 Cities'}</a>
        </div>
      </section>

      <section class="card" style="margin-bottom:22px;border-color:rgba(56,189,248,0.45);">
        <h2>🎯 ${isFr ? 'Mini-Défi Instantané : Pouvez-vous trouver ces 3 villes ?' : 'Instant Warm-Up Round: Can You Guess All 3 Mystery Cities?'}</h2>
        <div id="quizBox" style="margin-top:12px;"></div>
      </section>

      <section class="card">
        <h2>🏆 ${isFr ? 'Pourquoi les joueurs adorent Guess My City sur REMO' : 'Why Players Love REMO Guess My City'}</h2>
        <div class="grid-2" style="margin-top:12px;margin-bottom:0;">
          <div>
            <strong style="color:var(--gold);">📸 ${isFr ? 'Vraies Photos Citoyennes' : 'Real Citizen Street Moments'}</strong>
            <p style="font-size:0.88rem;color:#cbd5e1;">${isFr ? 'Contrairement aux cartes statiques, les citoyens publient leurs propres photos de rues, cafés et couchers de soleil en mode Ville Mystère.' : 'Unlike static Street View clones, real citizens mask their city badge on street photos, cafés, and skylines for the world to solve.'}</p>
          </div>
          <div>
            <strong style="color:var(--gold);">🪙 ${isFr ? 'Récompenses Doublées' : 'Win +10 Gold Coins Instantly'}</strong>
            <p style="font-size:0.88rem;color:#cbd5e1;">${isFr ? 'Trouvez la bonne ville parmi 4 choix pour débloquer le badge caché et gagner +10 Pièces d’Or REMO (et +3 🪙 pour le créateur !).' : 'Pick the right city among 4 choices to reveal the hidden flag and earn +10 Gold Coins (+3 🪙 bonus for the photographer)!'}</p>
          </div>
        </div>
      </section>
    </main>
    ${renderFooter(lang, prefix)}
  </div>
  <script>
  (function(){
    var isFr = ${isFr ? 'true' : 'false'};
    var rounds = [
      {
        clue: isFr ? 'Indice #1 : Portes de la Ville en pierre blanche, Arc de Triomphe et plus grandes caves à vin souterraines d’Europe.' : 'Clue #1: Famous white-stone City Gates, Triumphal Arch & the largest underground wine cellars in Europe.',
        opts: ['Chișinău 🇲🇩', 'Prague 🇨🇿', 'Vienna 🇦🇹', 'Geneva ⌚'],
        ans: 0
      },
      {
        clue: isFr ? 'Indice #2 : Métropole bilingue d’Amérique du Nord, dôme géodésique Biosphère et sommet du Mont-Royal.' : 'Clue #2: Bilingual North American AI hub crowned by Mount Royal and a geodesic Biosphere dome.',
        opts: ['Toronto 🍁', 'Montréal ⚜️', 'Boston 🇺🇸', 'Lyon 🇫🇷'],
        ans: 1
      },
      {
        clue: isFr ? 'Indice #3 : Carrefour piéton néon légendaire de Shibuya, sanctuaires Torii paisibles et haute robotique.' : 'Clue #3: Neon Shibuya scramble crossing, tranquil Shinto Torii gates, and futuristic robotics.',
        opts: ['Seoul ⚡', 'Singapore 🦁', 'Tokyo 🏯', 'Hong Kong 🇭🇰'],
        ans: 2
      }
    ];
    var box = document.getElementById('quizBox');
    box.innerHTML = rounds.map(function(r, idx){
      return '<div style="padding:14px;border-radius:14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.09);margin-bottom:10px;">' +
        '<div style="font-weight:800;margin-bottom:8px;color:#e0f2fe;">' + r.clue + '</div>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;" id="qrow_'+idx+'">' +
        r.opts.map(function(o, oi){
          return '<button type="button" class="pill" style="cursor:pointer;" onclick="ansQuiz('+idx+','+oi+','+r.ans+',this)">' + o + '</button>';
        }).join('') +
        '</div></div>';
    }).join('');
    window.ansQuiz = function(ri, oi, ans, btn){
      var ok = oi === ans;
      btn.style.background = ok ? '#10b981' : '#ef4444';
      btn.style.color = '#fff';
      btn.textContent += ok ? (isFr ? ' ✓ Bravo !' : ' ✓ Correct!') : ' ✕';
    };
  })();
  </script>
</body>
</html>`;
}

function buildBeatMakerHubPage(lang) {
  const isFr = lang === 'fr';
  const enUrl = `${DOMAIN}/beat-maker.html`;
  const frUrl = `${DOMAIN}/fr/beat-maker.html`;
  const canonical = isFr ? frUrl : enUrl;
  const altUrl = isFr ? '../beat-maker.html' : 'fr/beat-maker.html';
  const prefix = isFr ? '../' : '';

  const title = isFr
    ? '🎛️ Créer un Beat en Ligne Gratuit — Séquenceur 8 Temps & Synthé WebAudio | REMO World'
    : '🎛️ Free Online Beat Maker & 8-Step Synth Sequencer in Browser | REMO World';
  const desc = isFr
    ? 'Composez un beat électronique, Lofi ou House gratuitement dans votre navigateur avec le studio REMO Beat-Pad 4D (4 pistes × 8 temps, 0 téléchargement). Publiez et remixez en 1 clic !'
    : 'Make beats online free in your browser with the REMO 4D Beat-Pad Studio! Tap a 4×8 WebAudio drum & synth step sequencer (Kick, Clap, Hi-Hat, Cyber Lead) with zero downloads.';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    'name': 'REMO Beat-Pad 4D — Free Online Step Sequencer',
    'url': canonical,
    'applicationCategory': 'MultimediaApplication',
    'operatingSystem': 'All',
    'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' },
    'description': desc
  };

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <link rel="canonical" href="${canonical}">
  <link rel="alternate" hreflang="en" href="${enUrl}">
  <link rel="alternate" hreflang="fr" href="${frUrl}">
  <link rel="alternate" hreflang="x-default" href="${enUrl}">
  ${renderSocialMeta(title, desc, canonical)}
  <link rel="icon" type="image/png" sizes="32x32" href="${prefix}img/favicon-32x32.png">
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
  <style>${SHARED_CSS}
  .seq-grid{display:grid;grid-template-columns:80px repeat(8,1fr);gap:6px;margin:14px 0}
  .pad{height:38px;border-radius:9px;border:1px solid rgba(255,255,255,0.16);background:rgba(255,255,255,0.05);cursor:pointer;transition:0.12s}
  .pad.on{background:linear-gradient(135deg,#38bdf8,#8b5cf6);border-color:#fde047;box-shadow:0 0 12px rgba(56,189,248,0.45)}
  .pad.head{outline:2px solid #fbbf24}
  </style>
</head>
<body>
  <div class="wrap">
    ${renderTopbar(lang, prefix, altUrl)}
    <main>
      <section class="hero">
        <div class="eyebrow">🎛️ WEBAUDIO STEP SEQUENCER • ZERO DOWNLOAD • INSTANT REMIX</div>
        <h1>${isFr ? '🎛️ Beat Maker en Ligne Gratuit — Studio Séquenceur 4×8' : '🎛️ Free Online Beat Maker — Instant 4×8 Synth & Drum Sequencer'}</h1>
        <p class="lead">${esc(desc)}</p>
        <div class="cta-row">
          <a class="btn-primary" href="${prefix}index.html?open=beatpad&lang=${lang}&from=seo">🚀 ${isFr ? 'Ouvrir le Studio Complet & Publier (+10 🪙 Remix)' : 'Open Full 4D Beat Studio & Publish (+10 🪙 Remix)'}</a>
        </div>
      </section>

      <section class="card">
        <h2>🎹 ${isFr ? 'Testez le Séquenceur Directement Ici (Cliquez sur les Pads !)' : 'Try the Live Beat Sequencer Right Here (Tap Pads & Press Play!)'}</h2>
        <div style="display:flex;gap:10px;margin:10px 0;flex-wrap:wrap;">
          <button type="button" class="btn-primary" id="seqPlayBtn" onclick="toggleSeq()">▶️ ${isFr ? 'Jouer la Boucle (120 BPM)' : 'Play Beat Loop (120 BPM)'}</button>
          <button type="button" class="btn-sec" onclick="randSeq()">🎲 ${isFr ? 'Rythme Aléatoire' : 'Randomize Groove'}</button>
        </div>
        <div id="seqMount" class="seq-grid"></div>
      </section>
    </main>
    ${renderFooter(lang, prefix)}
  </div>
  <script>
  (function(){
    var labels = ['🥁 Kick','👏 Clap','✨ Hat','🎹 Synth'];
    var grid = [[1,0,0,0,1,0,0,0],[0,0,1,0,0,0,1,0],[1,1,1,1,1,1,1,1],[1,0,0,1,0,1,0,0]];
    var mount = document.getElementById('seqMount');
    var ac = null, timer = null, step = 0;
    function render(){
      var html = '';
      for(var r=0;r<4;r++){
        html += '<div style="display:flex;align-items:center;font-size:0.8rem;font-weight:800;color:#cbd5e1;">'+labels[r]+'</div>';
        for(var c=0;c<8;c++){
          html += '<button type="button" class="pad '+(grid[r][c]?'on':'')+'" data-c="'+c+'" onclick="togPad('+r+','+c+',this)" aria-label="Step '+(c+1)+'"></button>';
        }
      }
      mount.innerHTML = html;
    }
    window.togPad = function(r,c,el){ grid[r][c] = grid[r][c]?0:1; el.classList.toggle('on', !!grid[r][c]); };
    window.randSeq = function(){
      for(var r=0;r<4;r++) for(var c=0;c<8;c++) grid[r][c] = Math.random() < (r===2?0.75:0.38) ? 1 : 0;
      grid[0][0] = 1; render();
    };
    function hit(r){
      if(!ac) ac = new (window.AudioContext || window.webkitAudioContext)();
      if(ac.state === 'suspended') ac.resume();
      var now = ac.currentTime, o = ac.createOscillator(), g = ac.createGain();
      o.connect(g); g.connect(ac.destination);
      if(r===0){ o.frequency.setValueAtTime(140,now); o.frequency.exponentialRampToValueAtTime(42,now+0.14); g.gain.setValueAtTime(0.35,now); g.gain.exponentialRampToValueAtTime(0.001,now+0.16); o.start(now); o.stop(now+0.17); }
      else if(r===1){ o.type='triangle'; o.frequency.setValueAtTime(280,now); g.gain.setValueAtTime(0.18,now); g.gain.exponentialRampToValueAtTime(0.001,now+0.09); o.start(now); o.stop(now+0.1); }
      else if(r===2){ o.type='square'; o.frequency.setValueAtTime(1200,now); g.gain.setValueAtTime(0.06,now); g.gain.exponentialRampToValueAtTime(0.001,now+0.04); o.start(now); o.stop(now+0.05); }
      else { var notes=[261.6,311.1,349.2,392,466.2,523.2]; o.type='sawtooth'; o.frequency.setValueAtTime(notes[step%notes.length],now); g.gain.setValueAtTime(0.11,now); g.gain.exponentialRampToValueAtTime(0.001,now+0.18); o.start(now); o.stop(now+0.19); }
    }
    window.toggleSeq = function(){
      var btn = document.getElementById('seqPlayBtn');
      if(timer){ clearInterval(timer); timer = null; btn.textContent = '▶️ ${isFr ? 'Jouer la Boucle (120 BPM)' : 'Play Beat Loop (120 BPM)'}'; document.querySelectorAll('.pad').forEach(function(p){p.classList.remove('head');}); return; }
      step = 0;
      btn.textContent = '⏹️ Stop';
      timer = setInterval(function(){
        document.querySelectorAll('.pad').forEach(function(p){ p.classList.toggle('head', Number(p.getAttribute('data-c'))===step); });
        for(var r=0;r<4;r++) if(grid[r][step]) hit(r);
        step = (step + 1) % 8;
      }, 250);
    };
    render();
  })();
  </script>
</body>
</html>`;
}

function buildBoardingPassHubPage(lang, cities) {
  const isFr = lang === 'fr';
  const enUrl = `${DOMAIN}/boarding-pass.html`;
  const frUrl = `${DOMAIN}/fr/boarding-pass.html`;
  const canonical = isFr ? frUrl : enUrl;
  const altUrl = isFr ? '../boarding-pass.html' : 'fr/boarding-pass.html';
  const prefix = isFr ? '../' : '';

  const title = isFr
    ? '🎫 Générateur de Billet d’Embarquement 4D & Passeport Story 9:16 Gratuit | REMO World'
    : '🎫 Free 4D Virtual Boarding Pass & Story Generator (9:16 PNG) | REMO World';
  const desc = isFr
    ? 'Créez et téléchargez gratuitement un Billet d’Embarquement holographique 4D (format Story 9:16 TikTok, Instagram & WhatsApp) entre Montréal, Paris, Chișinău, Tokyo, New York et 24 villes.'
    : 'Generate and download a free 9:16 holographic 4D Boarding Pass & Citizen Passport for TikTok, Instagram Stories, and WhatsApp between Montréal, Paris, Chișinău, Tokyo, NYC & 24 cities.';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    'name': 'REMO 4D Boarding Pass & Citizen Passport Generator',
    'url': canonical,
    'applicationCategory': 'DesignApplication',
    'operatingSystem': 'All',
    'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' },
    'description': desc
  };

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <link rel="canonical" href="${canonical}">
  <link rel="alternate" hreflang="en" href="${enUrl}">
  <link rel="alternate" hreflang="fr" href="${frUrl}">
  <link rel="alternate" hreflang="x-default" href="${enUrl}">
  ${renderSocialMeta(title, desc, canonical)}
  <link rel="icon" type="image/png" sizes="32x32" href="${prefix}img/favicon-32x32.png">
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
  <style>${SHARED_CSS}</style>
</head>
<body>
  <div class="wrap">
    ${renderTopbar(lang, prefix, altUrl)}
    <main>
      <section class="hero">
        <div class="eyebrow">✈️ 9:16 HD STORY EXPORT • TIKTOK / INSTAGRAM / WHATSAPP</div>
        <h1>${isFr ? '🎫 Générateur Gratuit de Billet de Vol 4D & Passeport Citoyen' : '🎫 Free 4D Holographic Boarding Pass & Story Ticket Maker'}</h1>
        <p class="lead">${esc(desc)}</p>
        <div class="cta-row">
          <a class="btn-primary" href="${prefix}index.html?open=boardingpass&lang=${lang}&from=seo">✈️ ${isFr ? 'Créer & Télécharger mon Billet 4D HD (Gratuit)' : 'Create & Download HD 9:16 Boarding Pass (Free)'}</a>
        </div>
      </section>

      <section class="card" style="margin-bottom:22px;">
        <h2>🛫 ${isFr ? 'Itinéraires Populaires Prêts en 1 Clic' : 'Popular 1-Click Cyber Flight Routes'}</h2>
        <div class="grid-3" style="margin-top:12px;">
          <a class="city-link" href="${prefix}index.html?open=boardingpass&city=chisinau&lang=${lang}&from=seo">⚜️ MTL ✈️ 🇲🇩 KIV (Montréal → Chișinău)</a>
          <a class="city-link" href="${prefix}index.html?open=boardingpass&city=tokyo&lang=${lang}&from=seo">🗼 PAR ✈️ 🏯 TYO (Paris → Tokyo)</a>
          <a class="city-link" href="${prefix}index.html?open=boardingpass&city=london&lang=${lang}&from=seo">🗽 NYC ✈️ 🏰 LON (New York → London)</a>
          <a class="city-link" href="${prefix}index.html?open=boardingpass&city=dubai&lang=${lang}&from=seo">🇷🇴 BUH ✈️ 🌆 DXB (Bucharest → Dubai)</a>
          <a class="city-link" href="${prefix}index.html?open=boardingpass&city=paris&lang=${lang}&from=seo">⚜️ MTL ✈️ 🗼 PAR (Montréal → Paris)</a>
          <a class="city-link" href="${prefix}index.html?open=boardingpass&city=miami&lang=${lang}&from=seo">☀️ BCN ✈️ 🌴 MIA (Barcelona → Miami)</a>
        </div>
      </section>

      <section class="card">
        <h2>🌍 ${isFr ? 'Choisir Votre Ville de Destination' : 'Pick Your Destination City'}</h2>
        <div class="grid-3">
          ${cities.map((c) => `
          <a class="city-link" href="cities/${c.id}.html">${c.flag} ${esc(isFr ? c.name_fr : c.name_en)} (${c.code})</a>`).join('')}
        </div>
      </section>
    </main>
    ${renderFooter(lang, prefix)}
  </div>
</body>
</html>`;
}

function buildFocusTvHubPage(lang, cities, stations) {
  const isFr = lang === 'fr';
  const enUrl = `${DOMAIN}/focus-tv.html`;
  const frUrl = `${DOMAIN}/fr/focus-tv.html`;
  const canonical = isFr ? frUrl : enUrl;
  const altUrl = isFr ? '../focus-tv.html' : 'fr/focus-tv.html';
  const prefix = isFr ? '../' : '';
  const baseApp = prefix || './';

  const title = isFr
    ? '📺 Focus TV 4D — Fenêtre Ambiante Villes du Monde, Radio Lofi & Horloge Zen | REMO World'
    : '📺 4D Focus TV — Live Ambient World City Windows, Lofi Radio & Zen Clock | REMO World';
  const desc = isFr
    ? `Ouvrez une fenêtre 4D animée sur ${cities.length} villes du monde avec pluie, neige, météo en direct, ${stations.length} radios Cyber-LoFi et mode Horloge Bureau Zen. 100% gratuit, sans inscription.`
    : `Open a living 4D ambient window across ${cities.length} world cities with rain/snow FX, live weather, ${stations.length} ad-free Lofi & city radio streams, and fullscreen Zen Desk Clock. Free, zero sign-up.`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        'name': isFr ? 'REMO 4D Focus TV — Fenêtre Ambiante & Horloge Zen' : 'REMO 4D Focus TV — Ambient City Window & Zen Clock',
        'url': canonical,
        'applicationCategory': 'LifestyleApplication',
        'operatingSystem': 'All',
        'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' },
        'description': desc
      },
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': isFr ? 'Qu’est-ce que REMO 4D Focus TV ?' : 'What is REMO 4D Focus TV?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': isFr
                ? 'Focus TV 4D est un écran d’ambiance gratuit combinant silhouettes 4D de 24 villes, heure locale en direct, météo réelle, effets visuels (pluie, neige, feu, néon), 56 radios Lofi/mondiales et un mode Horloge Bureau Zen.'
                : 'REMO 4D Focus TV is a free ambient city window combining 4D architectural skylines for 24 cities, live local clocks, real-time weather, ambient FX (rain, snow, neon, fireplace), 56 radio streams, and a fullscreen Zen Desk Clock mode.'
            }
          },
          {
            '@type': 'Question',
            'name': isFr ? 'Comment partager mon lien d’ambiance personnalisé (Custom Vibe Link) ?' : 'How do Custom Vibe Links and Fly Random work?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': isFr
                ? 'Chaque combinaison de ville, effets et station radio génère un lien URL direct (ex. ?tv=tokyo&fx=rain). Cliquez aussi sur Fly Random ou filtrez les villes où il pleut ou fait nuit en ce moment.'
                : 'Every city, effect, and station choice updates your shareable Custom Vibe Link (e.g. ?tv=tokyo&fx=rain). You can also teleport with Fly Random or filter cities where it is currently raining or nighttime live.'
            }
          }
        ]
      }
    ]
  };

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <link rel="canonical" href="${canonical}">
  <link rel="alternate" hreflang="en" href="${enUrl}">
  <link rel="alternate" hreflang="fr" href="${frUrl}">
  <link rel="alternate" hreflang="x-default" href="${enUrl}">
  ${renderSocialMeta(title, desc, canonical)}
  <link rel="icon" type="image/png" sizes="32x32" href="${prefix}img/favicon-32x32.png">
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
  <style>${SHARED_CSS}</style>
</head>
<body>
  <div class="wrap">
    ${renderTopbar(lang, prefix, altUrl)}
    <main>
      <section class="hero">
        <div class="eyebrow">📺 4D AMBIENT WINDOW • ${cities.length} CITIES • ${stations.length} LIVE RADIOS • ZEN CLOCK</div>
        <h1>${isFr ? '📺 Focus TV 4D — Fenêtre Ambiante, Horloge Zen & Radio Lofi' : '📺 4D Focus TV — Living City Windows, Zen Desk Clock & Lofi Radio'}</h1>
        <p class="lead">${esc(desc)}</p>
        <div class="cta-row">
          <a class="btn-primary" href="${baseApp}?tv=tokyo&fx=rain&lang=${lang}&from=seo">🏯 ${isFr ? 'Tokyo Sous la Pluie (Live)' : 'Tokyo Rain Window (Live)'}</a>
          <a class="btn-sec" href="${baseApp}?tv=paris&lang=${lang}&from=seo">🗼 ${isFr ? 'Paris Direct' : 'Paris Live'}</a>
          <a class="btn-sec" href="${baseApp}?tv=montreal&fx=snow&lang=${lang}&from=seo">⚜️ ${isFr ? 'Neige à Montréal' : 'Montréal Snow'}</a>
          <a class="btn-sec" href="study-room.html">👥 ${isFr ? 'Salles Study Together' : 'Study Together Rooms'}</a>
        </div>
      </section>

      <section class="card" style="margin-bottom:22px;border-color:rgba(56,189,248,0.45);">
        <h2>🔗 ${isFr ? 'Créateur de Lien Ambiance (Custom Vibe Link)' : 'Instant Custom Vibe Link Builder'}</h2>
        <p style="font-size:0.86rem;color:var(--muted);margin-bottom:12px;">
          ${isFr ? 'Choisissez une ville et des effets 4D pour ouvrir ou partager votre fenêtre exacte :' : 'Pick a world city and ambient FX below to generate your shareable 4D window URL:'}
        </p>
        <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:12px;">
          <select id="ftvCitySel" onchange="updateVibe()" style="padding:10px 14px;border-radius:12px;background:#090d1f;color:#fff;border:1px solid rgba(255,255,255,0.2);font-weight:700;">
            ${cities.map((c) => `<option value="${c.id}">${c.flag} ${esc(isFr ? c.name_fr : c.name_en)} (${c.code})</option>`).join('')}
          </select>
          <label class="pill" style="cursor:pointer;"><input type="checkbox" value="rain" class="ftvFxChk" onchange="updateVibe()" checked> 🌧️ ${isFr ? 'Pluie' : 'Rain'}</label>
          <label class="pill" style="cursor:pointer;"><input type="checkbox" value="snow" class="ftvFxChk" onchange="updateVibe()"> ❄️ ${isFr ? 'Neige' : 'Snow'}</label>
          <label class="pill" style="cursor:pointer;"><input type="checkbox" value="neon" class="ftvFxChk" onchange="updateVibe()"> 💜 ${isFr ? 'Néon' : 'Neon'}</label>
          <label class="pill" style="cursor:pointer;"><input type="checkbox" value="fire" class="ftvFxChk" onchange="updateVibe()"> 🔥 ${isFr ? 'Cheminée' : 'Fireplace'}</label>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;">
          <a id="ftvLaunchLink" class="btn-primary" href="${baseApp}?tv=montreal&fx=rain&lang=${lang}&from=seo">🚀 ${isFr ? 'Ouvrir cette Fenêtre 4D' : 'Open This 4D Window'}</a>
          <button type="button" class="btn-sec" id="ftvCopyBtn" onclick="copyVibe()">📋 ${isFr ? 'Copier le Vibe Link' : 'Copy Vibe Link'}</button>
          <span id="ftvUrlPreview" style="font-family:monospace;font-size:0.8rem;color:#7dd3fc;"></span>
        </div>
      </section>

      <section class="card" style="margin-bottom:22px;">
        <h2>✨ ${isFr ? 'Fonctionnalités Incluses Sans Compte' : 'Built Into Every 4D Focus TV Window'}</h2>
        <div class="grid-3">
          <div>
            <strong style="color:var(--gold);">🕰️ ${isFr ? 'Mode Horloge Bureau Zen' : 'Minimal Zen Desk Clock'}</strong>
            <p style="font-size:0.85rem;color:#cbd5e1;margin-top:4px;">${isFr ? 'Masquez les menus en 1 clic pour transformer votre écran secondaire ou TV en horloge futuriste avec musique.' : 'Hide UI panels in 1 click to turn a second monitor or TV into a living ambient screensaver with clock and audio.'}</p>
          </div>
          <div>
            <strong style="color:var(--gold);">✈️ ${isFr ? 'Fly Random & Filtres Live' : 'Fly Random & Live Weather Filters'}</strong>
            <p style="font-size:0.85rem;color:#cbd5e1;margin-top:4px;">${isFr ? 'Téléportez-vous vers une ville aléatoire ou filtrez les métropoles où il pleut ou fait nuit en ce moment.' : 'Teleport instantly anywhere on Earth or filter for cities currently experiencing live rain or nighttime.'}</p>
          </div>
          <div>
            <strong style="color:var(--gold);">📻 ${isFr ? `${stations.length} Radios & Pomodoro` : `${stations.length} Live Radios & Pomodoro`}</strong>
            <p style="font-size:0.85rem;color:#cbd5e1;margin-top:4px;">${isFr ? 'Flux Cyber-LoFi, Jazz et radios locales avec minuterie de concentration 25/50 min.' : 'Stream Cyber-LoFi, Chillstep, Jazz, or local stations alongside an integrated 25/50m focus timer.'}</p>
          </div>
        </div>
      </section>

      <section class="card">
        <h2>🌍 ${isFr ? 'Lancer Focus TV par Ville' : 'Launch 4D Focus TV by City'}</h2>
        <div class="grid-3">
          ${cities.map((c) => `
          <a class="city-link" href="${baseApp}?tv=${c.id}&lang=${lang}&from=seo">${c.flag} ${esc(isFr ? c.name_fr : c.name_en)} <small style="color:var(--gold);">4D TV →</small></a>`).join('')}
        </div>
      </section>
    </main>
    ${renderFooter(lang, prefix, stations.length)}
  </div>
  <script>
  (function(){
    var baseApp = ${JSON.stringify(baseApp)};
    var lang = ${JSON.stringify(lang)};
    function buildRelUrl(){
      var c = document.getElementById('ftvCitySel').value;
      var fx = Array.prototype.slice.call(document.querySelectorAll('.ftvFxChk:checked')).map(function(i){ return i.value; }).join(',');
      return baseApp + '?tv=' + encodeURIComponent(c) + (fx ? '&fx=' + encodeURIComponent(fx) : '') + '&lang=' + lang + '&from=seo';
    }
    window.updateVibe = function(){
      var rel = buildRelUrl();
      document.getElementById('ftvLaunchLink').setAttribute('href', rel);
      var clean = rel.replace(/^\\.\\.\\//, '').replace(/^\\.\\//, '');
      document.getElementById('ftvUrlPreview').textContent = 'remoworld.com/' + clean;
    };
    window.copyVibe = function(){
      var rel = buildRelUrl().replace(/^\\.\\.\\//, '').replace(/^\\.\\//, '');
      var full = 'https://remoworld.com/' + rel;
      if(navigator.clipboard) navigator.clipboard.writeText(full);
      document.getElementById('ftvCopyBtn').textContent = '✓ ' + (${isFr ? '"Lien Copié !"' : '"Vibe Link Copied!"'});
    };
    updateVibe();
  })();
  </script>
</body>
</html>`;
}

function buildStudyRoomHubPage(lang, cities, stations) {
  const isFr = lang === 'fr';
  const enUrl = `${DOMAIN}/study-room.html`;
  const frUrl = `${DOMAIN}/fr/study-room.html`;
  const canonical = isFr ? frUrl : enUrl;
  const altUrl = isFr ? '../study-room.html' : 'fr/study-room.html';
  const prefix = isFr ? '../' : '';
  const baseApp = prefix || './';

  const title = isFr
    ? '👥 Salle d’Étude Lofi Synchronisée & Pomodoro Gratuit (Study Together) | REMO World'
    : '👥 Free Synced Lofi Study Room & Online Pomodoro Co-Working | REMO World';
  const desc = isFr
    ? `Créez un lien de salle Focus Together (?room=...) en 1 seconde : minuterie Pomodoro synchronisée, ambiance 4D (${cities.length} villes), pluie/neige et ${stations.length} radios Lofi gratuites pour étudier entre amis.`
    : `Create a synced Focus Together Study Room link in 1 click: shared Pomodoro timer, 4D rainy window (${cities.length} cities), and ${stations.length} Lofi radio stations for students and remote workers.`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        'name': isFr ? 'REMO Focus Together — Salle d’Étude Pomodoro Synchronisée' : 'REMO Focus Together — Synced Study Room & Co-Working',
        'url': canonical,
        'applicationCategory': 'ProductivityApplication',
        'operatingSystem': 'All',
        'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' },
        'description': desc
      },
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': isFr ? 'Comment fonctionne une salle Focus Together sur REMO World ?' : 'How does a REMO Focus Together Study Room stay in sync?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': isFr
                ? 'Chaque salle utilise un identifiant dans l’URL (ex. ?tv=tokyo&fx=rain&room=study42). Toute personne ouvrant ce lien rejoint instantanément la même ville 4D, la même ambiance Lofi et la même minuterie Pomodoro synchronisée.'
                : 'Every room shares an instant link parameter (?tv=tokyo&fx=rain&room=study42). Friends who open your link join the same 4D window, ambient Lofi station, and synchronized Pomodoro session timer.'
            }
          }
        ]
      }
    ]
  };

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <link rel="canonical" href="${canonical}">
  <link rel="alternate" hreflang="en" href="${enUrl}">
  <link rel="alternate" hreflang="fr" href="${frUrl}">
  <link rel="alternate" hreflang="x-default" href="${enUrl}">
  ${renderSocialMeta(title, desc, canonical)}
  <link rel="icon" type="image/png" sizes="32x32" href="${prefix}img/favicon-32x32.png">
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
  <style>${SHARED_CSS}</style>
</head>
<body>
  <div class="wrap">
    ${renderTopbar(lang, prefix, altUrl)}
    <main>
      <section class="hero">
        <div class="eyebrow">👥 STUDY WITH ME • SYNCED POMODORO • LOFI CO-WORKING</div>
        <h1>${isFr ? '👥 Salles d’Étude Synchronisées — Étudiez Ensemble en 4D' : '👥 Focus Together Rooms — Free Synced Lofi Study & Co-Working'}</h1>
        <p class="lead">${esc(desc)}</p>
        <div class="cta-row">
          <a class="btn-primary" href="${baseApp}?tv=tokyo&fx=rain&room=study25&lang=${lang}&from=seo">🌧️ ${isFr ? 'Salle Tokyo Pluie (25 min)' : 'Join Tokyo Rain Study Room'}</a>
          <a class="btn-sec" href="${baseApp}?tv=paris&fx=neon&room=paris-cafe&lang=${lang}&from=seo">🗼 ${isFr ? 'Café Paris Focus' : 'Paris Midnight Café'}</a>
          <a class="btn-sec" href="${baseApp}?tv=montreal&fx=snow&room=deepwork&lang=${lang}&from=seo">⚜️ ${isFr ? 'Montréal Deep Work' : 'Montréal Snow Deep Work'}</a>
        </div>
      </section>

      <section class="card" style="margin-bottom:22px;border-color:rgba(16,185,129,0.45);">
        <h2>🚀 ${isFr ? 'Créer Votre Lien de Salle d’Étude Personnalisé' : 'Create Your Own Synced Study Room Link'}</h2>
        <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin:12px 0;">
          <select id="srCity" onchange="updateRoomLink()" style="padding:10px 14px;border-radius:12px;background:#090d1f;color:#fff;border:1px solid rgba(255,255,255,0.2);font-weight:700;">
            ${cities.map((c) => `<option value="${c.id}" ${c.id === 'tokyo' ? 'selected' : ''}>${c.flag} ${esc(isFr ? c.name_fr : c.name_en)}</option>`).join('')}
          </select>
          <select id="srFx" onchange="updateRoomLink()" style="padding:10px 14px;border-radius:12px;background:#090d1f;color:#fff;border:1px solid rgba(255,255,255,0.2);font-weight:700;">
            <option value="rain">🌧️ ${isFr ? 'Pluie Lofi' : 'Lofi Rain'}</option>
            <option value="snow">❄️ ${isFr ? 'Neige Douce' : 'Soft Snow'}</option>
            <option value="neon">💜 ${isFr ? 'Néon Nuit' : 'Cyber Night'}</option>
            <option value="fire">🔥 ${isFr ? 'Cheminée Cosy' : 'Cozy Fire'}</option>
          </select>
          <input type="text" id="srName" value="focus-crew" oninput="updateRoomLink()" maxlength="24"
            placeholder="${isFr ? 'Nom de la salle...' : 'Room code...'}"
            style="padding:10px 14px;border-radius:12px;background:#090d1f;color:#fff;border:1px solid rgba(56,189,248,0.45);font-weight:700;">
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;">
          <a id="srLaunchBtn" class="btn-primary" href="${baseApp}?tv=tokyo&fx=rain&room=focus-crew&lang=${lang}&from=seo">👥 ${isFr ? 'Lancer la Salle Synchronisée' : 'Open Synced Study Room'}</a>
          <button type="button" id="srCopyBtn" class="btn-sec" onclick="copyRoomLink()">📋 ${isFr ? 'Copier le Lien d’Invitation' : 'Copy Invite Link'}</button>
          <span id="srPreview" style="font-family:monospace;font-size:0.8rem;color:#a7f3d0;"></span>
        </div>
      </section>

      <section class="card">
        <h2>🎓 ${isFr ? 'Pourquoi utiliser REMO Study Rooms ?' : 'Ideal for Students, Remote Teams & Solo Makers'}</h2>
        <div class="grid-3">
          <div>
            <strong style="color:var(--gold);">⏱️ ${isFr ? 'Pomodoro Partagé' : 'Zero-Setup Synced Timer'}</strong>
            <p style="font-size:0.85rem;color:#cbd5e1;margin-top:4px;">${isFr ? 'Pas d’inscription ni de téléchargement : un seul lien met tout le groupe au même rythme.' : 'No accounts or downloads required—one URL aligns everyone on the same focus block and city ambiance.'}</p>
          </div>
          <div>
            <strong style="color:var(--gold);">🎧 ${isFr ? '56 Flux Audio Calmes' : 'Curated Deep-Work Audio'}</strong>
            <p style="font-size:0.85rem;color:#cbd5e1;margin-top:4px;">${isFr ? 'Lofi Beats, Piano Nocturne, Jazz et radios locales sans coupures publicitaires.' : 'Blend Chill Lofi, Night Jazz, Synthwave, or regional stations ad-free in your browser.'}</p>
          </div>
          <div>
            <strong style="color:var(--gold);">🪙 ${isFr ? 'Récompenses d’Écoute' : 'Listen-to-Earn Gold Coins'}</strong>
            <p style="font-size:0.85rem;color:#cbd5e1;margin-top:4px;">${isFr ? 'Cumulez des Pièces d’Or REMO toutes les 10 minutes tout en révisant ou en codant.' : 'Collect REMO Gold Coins automatically every 10 minutes while you study, write, or code.'}</p>
          </div>
        </div>
      </section>
    </main>
    ${renderFooter(lang, prefix, stations.length)}
  </div>
  <script>
  (function(){
    var baseApp = ${JSON.stringify(baseApp)};
    var lang = ${JSON.stringify(lang)};
    function getRoomRel(){
      var c = document.getElementById('srCity').value;
      var fx = document.getElementById('srFx').value;
      var rm = (document.getElementById('srName').value || 'study').toLowerCase().replace(/[^a-z0-9_-]/g, '') || 'study';
      return baseApp + '?tv=' + encodeURIComponent(c) + '&fx=' + encodeURIComponent(fx) + '&room=' + encodeURIComponent(rm) + '&lang=' + lang + '&from=seo';
    }
    window.updateRoomLink = function(){
      var rel = getRoomRel();
      document.getElementById('srLaunchBtn').setAttribute('href', rel);
      document.getElementById('srPreview').textContent = 'remoworld.com/' + rel.replace(/^\\.\\.\\//, '').replace(/^\\.\\//, '');
    };
    window.copyRoomLink = function(){
      var rel = getRoomRel().replace(/^\\.\\.\\//, '').replace(/^\\.\\//, '');
      if(navigator.clipboard) navigator.clipboard.writeText('https://remoworld.com/' + rel);
      document.getElementById('srCopyBtn').textContent = '✓ ' + (${isFr ? '"Invitation Copiée !"' : '"Invite Copied!"'});
    };
    updateRoomLink();
  })();
  </script>
</body>
</html>`;
}

function buildWorldBlitzHubPage(lang, cities) {
  const isFr = lang === 'fr';
  const enUrl = `${DOMAIN}/world-blitz.html`;
  const frUrl = `${DOMAIN}/fr/world-blitz.html`;
  const canonical = isFr ? frUrl : enUrl;
  const altUrl = isFr ? '../world-blitz.html' : 'fr/world-blitz.html';
  const prefix = isFr ? '../' : '';
  const baseApp = prefix || './';

  const title = isFr
    ? '⚡ Daily World Blitz 60s — Jeu Géographie Quotidien & Duel 1v1 en Ligne | REMO World'
    : '⚡ Daily World Blitz 60s — Free Daily Geography Trivia & 1v1 Friend Duels | REMO World';
  const desc = isFr
    ? 'Devinez 5 villes mondiales en 60 secondes dans le défi quotidien REMO Daily World Blitz ! Partagez votre score style Wordle et lancez un lien de duel 1v1 à vos amis.'
    : 'Solve the same 5 world cities as the whole planet in 60 seconds! Play Daily World Blitz free in your browser, copy your Wordle-style result card, and send a 1v1 challenge link to friends.';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'VideoGame',
        'name': 'REMO Daily World Blitz — 60s Global City Trivia & 1v1 Duels',
        'url': canonical,
        'gamePlatform': ['Web Browser', 'Mobile Web'],
        'applicationCategory': 'Game',
        'genre': ['Trivia', 'Geography', 'Daily Puzzle'],
        'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' },
        'description': desc
      },
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': isFr ? 'Comment fonctionnent les duels 1v1 dans Daily World Blitz ?' : 'How do 1v1 Friend Duels work in Daily World Blitz?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': isFr
                ? 'Après votre manche de 60 secondes (5 villes), générez un lien ?open=blitz&vs=... encodant votre score et votre chrono. Vos amis jouent le même tirage mondial du jour et obtiennent un verdict instantané.'
                : 'After finishing your 5-city 60s round, generate a personal ?open=blitz&vs=... link carrying your score and time. When friends open it, they play the exact same daily seed and get a head-to-head verdict.'
            }
          }
        ]
      }
    ]
  };

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <link rel="canonical" href="${canonical}">
  <link rel="alternate" hreflang="en" href="${enUrl}">
  <link rel="alternate" hreflang="fr" href="${frUrl}">
  <link rel="alternate" hreflang="x-default" href="${enUrl}">
  ${renderSocialMeta(title, desc, canonical)}
  <link rel="icon" type="image/png" sizes="32x32" href="${prefix}img/favicon-32x32.png">
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
  <style>${SHARED_CSS}</style>
</head>
<body>
  <div class="wrap">
    ${renderTopbar(lang, prefix, altUrl)}
    <main>
      <section class="hero">
        <div class="eyebrow">⚡ DAILY GLOBAL SEED • 5 CITIES IN 60 SECONDS • 1V1 DUELS</div>
        <h1>${isFr ? '⚡ Daily World Blitz — Le Défi Géographie 60s & Duel 1v1' : '⚡ Daily World Blitz — 60-Second Daily City Trivia & 1v1 Duels'}</h1>
        <p class="lead">${esc(desc)}</p>
        <div class="cta-row">
          <a class="btn-primary" href="${baseApp}?open=blitz&lang=${lang}&from=seo">⚡ ${isFr ? 'Jouer au Blitz du Jour (Gratuit)' : 'Play Today’s World Blitz (Free)'}</a>
          <a class="btn-sec" href="guess-the-city.html">🕵️ ${isFr ? 'Jeu Deviner la Ville (Photos)' : 'Guess The City Photo Game'}</a>
          <a class="btn-sec" href="cities/index.html">🌍 ${isFr ? 'Réviser les 24 Villes' : 'Explore All 24 Cities'}</a>
        </div>
      </section>

      <section class="card" style="margin-bottom:22px;border-color:rgba(251,191,36,0.45);">
        <h2>🧠 ${isFr ? 'Échauffement Express (1 Question Blitz)' : 'Quick Blitz Practice Round'}</h2>
        <div id="blitzPracticeBox" style="margin-top:12px;"></div>
      </section>

      <section class="card">
        <h2>⚔️ ${isFr ? 'Comment gagner chaque duel World Blitz' : 'How the 60s Daily Challenge & 1v1 Mode Works'}</h2>
        <div class="grid-3">
          <div>
            <strong style="color:var(--gold);">🌐 ${isFr ? 'Même Tirage Mondial' : 'Same 5 Cities Planet-Wide'}</strong>
            <p style="font-size:0.85rem;color:#cbd5e1;margin-top:4px;">${isFr ? 'Tout le monde affronte les mêmes 5 villes chaque jour à partir d’indices de silhouettes, fuseaux et météo.' : 'Every player worldwide gets the exact same daily seed of 5 cities powered by skylines, flags, and clues.'}</p>
          </div>
          <div>
            <strong style="color:var(--gold);">🟩 ${isFr ? 'Carte Partage & Duel 1v1' : 'Shareable Grid & 1v1 Link'}</strong>
            <p style="font-size:0.85rem;color:#cbd5e1;margin-top:4px;">${isFr ? 'Copiez votre résultat 🟩🟩🟩🟩🟩 ou défiez un ami directement sur WhatsApp, Discord ou X.' : 'Copy your score card for Discord/WhatsApp or send a custom 1v1 Duel URL encoding your exact score & seconds.'}</p>
          </div>
          <div>
            <strong style="color:var(--gold);">🪙 ${isFr ? 'Bonus Pièces d’Or REMO' : 'Win REMO Gold Coins'}</strong>
            <p style="font-size:0.85rem;color:#cbd5e1;margin-top:4px;">${isFr ? 'Complétez votre manche quotidienne sans inscription pour remporter des récompenses urbaines.' : 'No account needed to play—beat the daily clock to earn Gold Coins and boost your Citizen standing.'}</p>
          </div>
        </div>
      </section>
    </main>
    ${renderFooter(lang, prefix, 56)}
  </div>
  <script>
  (function(){
    var isFr = ${isFr ? 'true' : 'false'};
    var box = document.getElementById('blitzPracticeBox');
    var q = isFr
      ? 'Indice Blitz #1 : Ville européenne célèbre pour ses caves souterraines de Cricova/Mileștii Mici, son Arc de Triomphe blanc et le code IATA KIV :'
      : 'Blitz Clue #1: European capital famous for its white-stone City Gates, monumental underground wine cities, and IATA code KIV:';
    var opts = ['Chișinău 🇲🇩', 'Lisbon 🇵🇹', 'Vienna 🇦🇹', 'Montreal ⚜️'];
    box.innerHTML = '<div style="font-weight:800;color:#e0f2fe;margin-bottom:10px;">' + q + '</div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
      opts.map(function(o, i){
        return '<button type="button" class="pill" style="cursor:pointer;" onclick="chkBlitz(' + i + ',this)">' + o + '</button>';
      }).join('') + '</div>';
    window.chkBlitz = function(i, btn){
      var ok = i === 0;
      btn.style.background = ok ? '#10b981' : '#ef4444';
      btn.style.color = '#fff';
      btn.textContent += ok ? (isFr ? ' ✓ Exact !' : ' ✓ Correct!') : ' ✕';
    };
  })();
  </script>
</body>
</html>`;
}

/* ── 6. Build Free Embeddable Live City Widget (/widget.html) ── */
function buildWidgetHtml(cities, stations) {
  const compactCities = {};
  cities.forEach((c) => {
    const st = getStationsForCity(c, stations)[0];
    compactCities[c.id] = {
      flag: c.flag,
      code: c.code,
      en: c.name_en,
      fr: c.name_fr,
      country_en: c.country_en,
      country_fr: c.country_fr,
      lat: c.lat,
      lng: c.lng,
      tz: CITY_TIMEZONES[c.id] || 'UTC',
      stream: st ? st.streamUrl : 'https://media-ssl.musicradio.com/CapitalChill',
      fallback: st ? (st.fallbackUrl || '') : '',
      stName: st ? st.name : 'REMO Live Radio'
    };
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>REMO World — Live City Clock, Weather &amp; Radio Widget</title>
  <meta name="robots" content="noindex, follow">
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:system-ui,-apple-system,sans-serif;background:transparent;color:#f8fafc;overflow:hidden}
    .wcard{background:linear-gradient(145deg,#090d1f,#161b3a);border:1px solid rgba(56,189,248,0.42);border-radius:16px;padding:12px 14px;height:152px;display:flex;flex-direction:column;justify-content:space-between;box-shadow:0 8px 24px rgba(0,0,0,0.45)}
    .top{display:flex;align-items:center;justify-content:space-between;gap:8px}
    .cname{font-weight:900;font-size:0.96rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .sub{font-size:0.72rem;color:#94a3b8}
    .mid{display:flex;align-items:center;justify-content:space-between;gap:8px;background:rgba(255,255,255,0.05);border-radius:11px;padding:8px 10px}
    .clk{font-family:monospace;font-size:1.12rem;font-weight:900;color:#fbbf24}
    .wx{font-size:0.84rem;font-weight:800;color:#38bdf8}
    .rbtn{padding:6px 12px;border-radius:99px;border:none;font-weight:900;font-size:0.75rem;cursor:pointer;background:linear-gradient(135deg,#0ea5e9,#6366f1);color:#fff}
    .rbtn.on{background:linear-gradient(135deg,#10b981,#059669)}
    .bot{display:flex;align-items:center;justify-content:space-between;font-size:0.71rem;color:#cbd5e1}
    .bot a{color:#fde047;text-decoration:none;font-weight:800}
    .bot a:hover{text-decoration:underline}
  </style>
</head>
<body>
  <div class="wcard">
    <div class="top">
      <div>
        <div class="cname" id="wTitle">⚜️ Montréal (MTL)</div>
        <div class="sub" id="wSub">Canada • Live Radio</div>
      </div>
      <button type="button" class="rbtn" id="wPlayBtn">▶️ Radio</button>
    </div>
    <div class="mid">
      <span class="clk" id="wClock">--:--:--</span>
      <span class="wx" id="wTemp">✨ Live</span>
    </div>
    <div class="bot">
      <span id="wStName">📻 Live Stream</span>
      <a id="wBacklink" href="${DOMAIN}/cities/montreal.html" target="_blank" rel="noopener">🌐 REMO World ↗</a>
    </div>
  </div>
  <script>
  (function(){
    var DB = ${JSON.stringify(compactCities)};
    var p = new URLSearchParams(location.search);
    var cid = (p.get('city') || 'montreal').toLowerCase();
    var lang = p.get('lang') === 'fr' ? 'fr' : 'en';
    var c = DB[cid] ? DB[cid] : DB.montreal;
    if(!DB[cid]) cid = 'montreal';
    document.documentElement.lang = lang;
    var name = lang === 'fr' ? c.fr : c.en;
    var country = lang === 'fr' ? c.country_fr : c.country_en;
    document.getElementById('wTitle').textContent = c.flag + ' ' + name + ' (' + c.code + ')';
    document.getElementById('wSub').textContent = country;
    document.getElementById('wStName').textContent = '📻 ' + c.stName;
    var link = document.getElementById('wBacklink');
    link.href = '${DOMAIN}/' + (lang === 'fr' ? 'fr/' : '') + 'cities/' + cid + '.html';
    link.textContent = lang === 'fr' ? '🌐 En direct sur REMO ↗' : '🌐 Live on REMO World ↗';

    function tick(){
      try {
        document.getElementById('wClock').textContent = new Intl.DateTimeFormat(lang === 'fr' ? 'fr-FR' : 'en-GB', { timeZone: c.tz, hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date());
      } catch(e){}
    }
    tick(); setInterval(tick, 1000);

    fetch('https://api.open-meteo.com/v1/forecast?latitude=' + c.lat + '&longitude=' + c.lng + '&current_weather=true')
      .then(function(r){ return r.json(); })
      .then(function(d){
        if(d && d.current_weather) document.getElementById('wTemp').textContent = Math.round(d.current_weather.temperature) + '°C';
      }).catch(function(){});

    var audio = new Audio(); audio.preload = 'none';
    var btn = document.getElementById('wPlayBtn');
    btn.textContent = lang === 'fr' ? '▶️ Radio' : '▶️ Radio';
    btn.onclick = function(){
      if(!audio.paused){ audio.pause(); btn.classList.remove('on'); btn.textContent = '▶️ Radio'; return; }
      btn.classList.add('on'); btn.textContent = '⏸️ Live';
      var fb = false;
      audio.onerror = function(){ if(!fb && c.fallback){ fb = true; audio.src = c.fallback; audio.play().catch(function(){}); } };
      audio.src = c.stream;
      audio.play().catch(function(){});
    };
  })();
  </script>
</body>
</html>`;
}

/* ── 6B. Build French Root Hub Page (/fr/index.html) to eliminate /fr/ 404 & hreflang conflict ── */
function buildFrenchHomePage(cities, stations) {
  const canonical = `${DOMAIN}/fr/`;
  const title = 'REMO World 🌐 Focus TV 4D, Réseau Social des Villes & 56 Radios Live (FR)';
  const desc = `Ouvrez votre fenêtre 4D Focus TV sur ${cities.length} villes du monde (Montréal, Paris, New York, Tokyo, Chișinău), écoutez ${stations.length} radios sans pub, collectionnez les Cartes 4D et gagnez des Pièces d’Or.`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${DOMAIN}/fr/#website`,
    'url': canonical,
    'name': 'REMO World (FR)',
    'inLanguage': 'fr',
    'description': desc
  };

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <link rel="canonical" href="${canonical}">
  <link rel="alternate" hreflang="en" href="${DOMAIN}/">
  <link rel="alternate" hreflang="fr" href="${canonical}">
  <link rel="alternate" hreflang="x-default" href="${DOMAIN}/">
  ${renderSocialMeta(title, desc, canonical)}
  <link rel="icon" type="image/png" sizes="32x32" href="../img/favicon-32x32.png">
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
  <style>${SHARED_CSS}</style>
</head>
<body>
  <div class="wrap">
    ${renderTopbar('fr', '../', '../')}
    <main>
      <section class="hero">
        <div class="eyebrow">🌐 ÉDITION FRANÇAISE • FOCUS TV 4D • ${stations.length} RADIOS LIVE</div>
        <h1>Explorez 24 Villes du Monde en 4D — Radio Lofi, Météo Réelle &amp; Réseau Social</h1>
        <p class="lead">${esc(desc)}</p>
        <div class="cta-row">
          <a class="btn-primary" href="../?tv=paris&lang=fr">📺 Ouvrir Focus TV 4D — Paris</a>
          <a class="btn-sec" href="../?tv=montreal&lang=fr">⚜️ Focus TV — Montréal</a>
          <a class="btn-sec" href="../?lang=fr">🚀 Lancer l’App Complète (FR)</a>
        </div>
      </section>

      <div class="grid-2">
        <section class="card">
          <h2>🛠️ Outils &amp; Expériences REMO World</h2>
          <div style="display:flex;flex-direction:column;gap:10px;">
            <a class="city-link" href="focus-tv.html">📺 Focus TV 4D — Fenêtre Ambiante &amp; Horloge Zen</a>
            <a class="city-link" href="study-room.html">👥 Salles d’Étude Lofi Synchronisées (Pomodoro)</a>
            <a class="city-link" href="world-blitz.html">⚡ Daily World Blitz 60s — Quiz Villes &amp; Duel 1v1</a>
            <a class="city-link" href="world-radio.html">📻 Radio Mondiale Gratuite — ${stations.length} Stations (${cities.length}/${cities.length} Villes)</a>
            <a class="city-link" href="world-ranking.html">🏆 Classement Mondial des 24 Villes 2026</a>
            <a class="city-link" href="city-versus.html">⚔️ Comparateur &amp; Duels de Villes (Montréal vs Paris…)</a>
            <a class="city-link" href="guess-the-city.html">🕵️ Jeu Photo : Deviner la Ville en Direct</a>
            <a class="city-link" href="boarding-pass.html">🎫 Générateur de Billet d’Embarquement 4D (Stories 9:16)</a>
            <a class="city-link" href="cities/index.html">🌍 Annuaire Complet des 24 Métropoles Connectées</a>
          </div>
        </section>

        <section class="card">
          <h2>⭐ Villes Vedettes &amp; Accès Direct Focus TV</h2>
          <div class="grid-3">
            ${cities.slice(0, 12).map((c) => `<a class="city-link" href="cities/${c.id}.html">${c.flag} ${esc(c.name_fr)}</a>`).join('\n            ')}
          </div>
          <div style="margin-top:12px;">
            <a href="cities/index.html" style="font-size:0.86rem;font-weight:800;">Voir toutes les 24 villes en français →</a>
          </div>
        </section>
      </div>
    </main>
    ${renderFooter('fr', '../', stations.length)}
  </div>
</body>
</html>`;
}

/* ── 7. Build Sitemap.xml (All Canonical Bilingual URLs + hreflang) & Robots.txt ── */
function buildSitemapXml(cities) {
  const pairs = [
    { en: `${DOMAIN}/`, fr: `${DOMAIN}/fr/`, prio: '1.0', freq: 'daily' },
    { en: `${DOMAIN}/focus-tv.html`, fr: `${DOMAIN}/fr/focus-tv.html`, prio: '0.96', freq: 'daily' },
    { en: `${DOMAIN}/study-room.html`, fr: `${DOMAIN}/fr/study-room.html`, prio: '0.94', freq: 'daily' },
    { en: `${DOMAIN}/world-blitz.html`, fr: `${DOMAIN}/fr/world-blitz.html`, prio: '0.94', freq: 'daily' },
    { en: `${DOMAIN}/world-ranking.html`, fr: `${DOMAIN}/fr/world-ranking.html`, prio: '0.95', freq: 'daily' },
    { en: `${DOMAIN}/city-versus.html`, fr: `${DOMAIN}/fr/city-versus.html`, prio: '0.95', freq: 'daily' },
    { en: `${DOMAIN}/cities/index.html`, fr: `${DOMAIN}/fr/cities/index.html`, prio: '0.95', freq: 'daily' },
    { en: `${DOMAIN}/world-radio.html`, fr: `${DOMAIN}/fr/world-radio.html`, prio: '0.95', freq: 'daily' },
    { en: `${DOMAIN}/guess-the-city.html`, fr: `${DOMAIN}/fr/guess-the-city.html`, prio: '0.90', freq: 'weekly' },
    { en: `${DOMAIN}/boarding-pass.html`, fr: `${DOMAIN}/fr/boarding-pass.html`, prio: '0.88', freq: 'weekly' }
  ];

  cities.forEach((c) => {
    pairs.push({
      en: `${DOMAIN}/cities/${c.id}.html`,
      fr: `${DOMAIN}/fr/cities/${c.id}.html`,
      prio: '0.85',
      freq: 'weekly'
    });
  });

  pairs.push(
    { en: `${DOMAIN}/privacy.html`, fr: `${DOMAIN}/fr/privacy.html`, prio: '0.60', freq: 'monthly' },
    { en: `${DOMAIN}/terms.html`, fr: `${DOMAIN}/fr/terms.html`, prio: '0.60', freq: 'monthly' }
  );

  const urlNodes = [];
  pairs.forEach((p) => {
    urlNodes.push(`  <url>
    <loc>${p.en}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${p.freq}</changefreq>
    <priority>${p.prio}</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${p.en}"/>
    <xhtml:link rel="alternate" hreflang="fr" href="${p.fr}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${p.en}"/>
  </url>`);
    if (p.fr !== p.en) {
      urlNodes.push(`  <url>
    <loc>${p.fr}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${p.freq}</changefreq>
    <priority>${p.prio}</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${p.en}"/>
    <xhtml:link rel="alternate" hreflang="fr" href="${p.fr}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${p.en}"/>
  </url>`);
    }
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlNodes.join('\n')}
</urlset>
`;
}

function buildRobotsTxt() {
  return `User-agent: *
Allow: /
Disallow: /admin.html

User-agent: Googlebot
Allow: /
Disallow: /admin.html

User-agent: Bingbot
Allow: /
Disallow: /admin.html

User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Google-Extended
Allow: /

Sitemap: ${DOMAIN}/sitemap.xml
`;
}

/* ── 8. Build AI Search Discovery Files (/llms.txt & /llms-full.txt) ── */
function buildLlmsFiles(cities, stations) {
  const llmsShort = `# REMO World (${DOMAIN})

> REMO World is a free bilingual (English & French) 4D Focus TV City Window, Synced Lofi Study Room platform, 4D City Social Network, Live World Radio Player (${stations.length} ad-free global & Lofi stations across 24/24 cities), Daily World Blitz 60s Geography Trivia with 1v1 Friend Duels, Guess My City photo game, and 9:16 Virtual Boarding Pass Generator connecting 24 world cities in real time.

## Key Free Features (Zero Sign-Up Required to Explore)
- [REMO World Live Social App](${DOMAIN}/): Real-time cross-city social feed, live City Wars, Citizen Passports, and collectible 4D City Cards.
- [4D Focus TV — Ambient City Windows & Zen Clock](${DOMAIN}/focus-tv.html): Fullscreen 4D Focus TV window with rain/snow/neon/fireplace FX, Fly Random teleportation, Live Rain/Night city filters, Custom Vibe Links (\`?tv=city&fx=rain\`), and Minimal Zen Desk Clock mode.
- [Synced Study Together Rooms](${DOMAIN}/study-room.html): Shareable Focus Together Room URLs (\`?tv=tokyo&fx=rain&room=study42\`) with synchronized Pomodoro sessions and ad-free Lofi radio.
- [Daily World Blitz 60s & 1v1 Duels](${DOMAIN}/world-blitz.html): 5 daily world cities solved in 60 seconds with shareable Wordle-style result cards and URL-encoded 1v1 challenge links (\`?open=blitz&vs=...\`).
- [Free Live World Cities Radio (${stations.length} Stations)](${DOMAIN}/world-radio.html): Stream live radio from Paris, Montréal, Chișinău (8 live stations), Bucharest, New York, London, Tokyo, Seoul, Berlin, Dubai, Lisbon, Amsterdam, Sydney, Rio, Singapore & Cairo + Lofi, Jazz & Synthwave.
- [Guess The City Photo Game](${DOMAIN}/guess-the-city.html): Free browser geography & skyline photo guessing game created by real citizens worldwide.
- [4D Holographic Boarding Pass Generator](${DOMAIN}/boarding-pass.html): Create & download 9:16 Story Boarding Passes between any two world cities for TikTok, Instagram & WhatsApp.
- [Top 24 World Cities Live Ranking & Duels](${DOMAIN}/world-ranking.html): Real-time city standings and interactive city-vs-city comparison tool ([City Versus](${DOMAIN}/city-versus.html)).
- [All 24 Connected World Cities Directory](${DOMAIN}/cities/index.html): Live local time, weather, radio streams & urban stats for every Edition-1 metropolis.

## Edition-1 Connected Cities (EN & FR)
${cities.map((c) => `- [${c.flag} ${c.name_en} (${c.country_en})](${DOMAIN}/cities/${c.id}.html) | [Version Française](${DOMAIN}/fr/cities/${c.id}.html)`).join('\n')}

## Languages
- English: ${DOMAIN}/
- Français: ${DOMAIN}/fr/
- Full AI Reference: ${DOMAIN}/llms-full.txt
`;

  const llmsFull = `${llmsShort}

## Complete Radio Directory (${stations.length} Live Streams)
${stations.map((s) => `- **${s.name}** (${s.badge}): ${s.desc_en} / ${s.desc_fr}`).join('\n')}

## Detailed City Profiles (${cities.length} Cities)
${cities.map((c) => `### ${c.flag} ${c.name_en} / ${c.name_fr} (${c.code}) — ${c.country_en}
- Tagline (EN): ${c.tagline_en}
- Tagline (FR): ${c.tagline_fr}
- Summary: ${c.desc_en}
- Rarity: ${c.rarity} | Element: ${c.element}
- Urban Ratings: Culture ${c.stats.culture}/100, Nightlife ${c.stats.nightlife}/100, Tech ${c.stats.tech}/100, Gastronomy ${c.stats.gastronomy}/100
- Direct Hub: ${DOMAIN}/cities/${c.id}.html`).join('\n\n')}
`;

  return { llmsShort, llmsFull };
}

/* ── 9. Execute Build ── */
function main() {
  const { cities, elements, stations } = loadCitiesAndStations();
  ensureDir(path.join(ROOT, 'cities'));
  ensureDir(path.join(ROOT, 'fr', 'cities'));

  let generatedCount = 0;

  // 48 City Pages (24 EN + 24 FR)
  cities.forEach((city) => {
    fs.writeFileSync(path.join(ROOT, 'cities', `${city.id}.html`), buildCityPage(city, 'en', cities, elements, stations), 'utf8');
    fs.writeFileSync(path.join(ROOT, 'fr', 'cities', `${city.id}.html`), buildCityPage(city, 'fr', cities, elements, stations), 'utf8');
    generatedCount += 2;
  });

  // French Root Landing Hub (/fr/index.html)
  fs.writeFileSync(path.join(ROOT, 'fr', 'index.html'), buildFrenchHomePage(cities, stations), 'utf8');
  generatedCount += 1;

  // 2 Directory Index Pages
  fs.writeFileSync(path.join(ROOT, 'cities', 'index.html'), buildDirectoryPage('en', cities, stations.length), 'utf8');
  fs.writeFileSync(path.join(ROOT, 'fr', 'cities', 'index.html'), buildDirectoryPage('fr', cities, stations.length), 'utf8');
  generatedCount += 2;

  // 12 High-Intent Feature Hub Pages (6 EN + 6 FR)
  fs.writeFileSync(path.join(ROOT, 'focus-tv.html'), buildFocusTvHubPage('en', cities, stations), 'utf8');
  fs.writeFileSync(path.join(ROOT, 'fr', 'focus-tv.html'), buildFocusTvHubPage('fr', cities, stations), 'utf8');
  fs.writeFileSync(path.join(ROOT, 'study-room.html'), buildStudyRoomHubPage('en', cities, stations), 'utf8');
  fs.writeFileSync(path.join(ROOT, 'fr', 'study-room.html'), buildStudyRoomHubPage('fr', cities, stations), 'utf8');
  fs.writeFileSync(path.join(ROOT, 'world-blitz.html'), buildWorldBlitzHubPage('en', cities), 'utf8');
  fs.writeFileSync(path.join(ROOT, 'fr', 'world-blitz.html'), buildWorldBlitzHubPage('fr', cities), 'utf8');
  fs.writeFileSync(path.join(ROOT, 'world-radio.html'), buildWorldRadioHubPage('en', stations, cities), 'utf8');
  fs.writeFileSync(path.join(ROOT, 'fr', 'world-radio.html'), buildWorldRadioHubPage('fr', stations, cities), 'utf8');
  fs.writeFileSync(path.join(ROOT, 'guess-the-city.html'), buildGuessCityHubPage('en', cities), 'utf8');
  fs.writeFileSync(path.join(ROOT, 'fr', 'guess-the-city.html'), buildGuessCityHubPage('fr', cities), 'utf8');
  fs.writeFileSync(path.join(ROOT, 'boarding-pass.html'), buildBoardingPassHubPage('en', cities), 'utf8');
  fs.writeFileSync(path.join(ROOT, 'fr', 'boarding-pass.html'), buildBoardingPassHubPage('fr', cities), 'utf8');
  generatedCount += 12;

  // Clean up deprecated beat-maker static pages if present
  [path.join(ROOT, 'beat-maker.html'), path.join(ROOT, 'fr', 'beat-maker.html')].forEach((p) => {
    try { if (fs.existsSync(p)) fs.unlinkSync(p); } catch (e) {}
  });

  // Embeddable Backlink Widget
  fs.writeFileSync(path.join(ROOT, 'widget.html'), buildWidgetHtml(cities, stations), 'utf8');

  // Sitemap, Robots, LLMs & IndexNow Key
  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), buildSitemapXml(cities), 'utf8');
  fs.writeFileSync(path.join(ROOT, 'robots.txt'), buildRobotsTxt(), 'utf8');
  const { llmsShort, llmsFull } = buildLlmsFiles(cities, stations);
  fs.writeFileSync(path.join(ROOT, 'llms.txt'), llmsShort, 'utf8');
  fs.writeFileSync(path.join(ROOT, 'llms-full.txt'), llmsFull, 'utf8');
  fs.writeFileSync(path.join(ROOT, `${INDEXNOW_KEY}.txt`), INDEXNOW_KEY, 'utf8');

  console.log(`✓ Generated ${generatedCount} static SEO pages + widget.html + sitemap.xml + robots.txt + llms.txt + IndexNow key!`);
}

main();
