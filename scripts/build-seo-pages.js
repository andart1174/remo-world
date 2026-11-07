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
const TODAY = '2026-11-02';
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

function renderTopbar(lang, prefix, altUrl) {
  const isFr = lang === 'fr';
  const dirHref = isFr ? `${prefix}fr/cities/index.html` : `${prefix}cities/index.html`;
  const radioHref = isFr ? `${prefix}fr/world-radio.html` : `${prefix}world-radio.html`;
  const guessHref = isFr ? `${prefix}fr/guess-the-city.html` : `${prefix}guess-the-city.html`;
  const passHref = isFr ? `${prefix}fr/boarding-pass.html` : `${prefix}boarding-pass.html`;
  const appHref = `${prefix}index.html?lang=${lang}&from=seo`;
  return `
  <header class="topbar">
    <a class="brand" href="${appHref}">
      <img src="${prefix}img/remo_brand_coin.png" alt="REMO World Coin Logo" width="34" height="34">
      <span>REMO World 🌐</span>
    </a>
    <nav class="top-links" aria-label="${isFr ? 'Navigation Principale' : 'Primary Navigation'}">
      <a class="pill" href="${dirHref}">🌍 ${isFr ? '24 Villes' : '24 Cities'}</a>
      <a class="pill" href="${radioHref}">📻 ${isFr ? 'Radio Monde' : 'World Radio'}</a>
      <a class="pill" href="${guessHref}">🕵️ ${isFr ? 'Deviner la Ville' : 'Guess City'}</a>
      <a class="pill" href="${passHref}">🎫 ${isFr ? 'Billet 4D' : 'Boarding Pass'}</a>
      <a class="pill" href="${altUrl}" hreflang="${isFr ? 'en' : 'fr'}">${isFr ? '🇬🇧 EN' : '🇫🇷 FR'}</a>
      <a class="pill gold" href="${appHref}">🚀 ${isFr ? 'Ouvrir l’App' : 'Launch App'}</a>
    </nav>
  </header>`;
}

function renderFooter(lang, prefix) {
  const isFr = lang === 'fr';
  return `
  <footer>
    <div>© 2026 <strong>REMO World</strong> — ${isFr ? 'Réseau Social Urbain 4D, Radio Mondiale & Jeux de Villes.' : 'The 4D City Social Network, Live World Radio & Interactive City Games.'}</div>
    <div style="display:flex;gap:14px;flex-wrap:wrap;">
      <a href="${prefix}index.html?lang=${lang}">${isFr ? 'Accueil REMO' : 'REMO Home'}</a>
      <a href="${isFr ? prefix + 'fr/cities/index.html' : prefix + 'cities/index.html'}">${isFr ? 'Annuaire des Villes' : 'World Cities Directory'}</a>
      <a href="${isFr ? prefix + 'fr/world-radio.html' : prefix + 'world-radio.html'}">${isFr ? '38 Radios en Direct' : '38 Live Radio Stations'}</a>
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
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="REMO World">
  <meta property="og:url" content="${canonical}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(metaDesc)}">
  <meta property="og:image" content="${DOMAIN}/img/remo_brand_coin.png">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(metaDesc)}">
  <meta name="twitter:image" content="${DOMAIN}/img/remo_brand_coin.png">
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
          <a class="btn-primary" href="${prefix}index.html?city=${city.id}&lang=${lang}&from=seo">
            🚀 ${isFr ? `Entrer dans le Hub Live de ${esc(cName)} (+25 🪙)` : `Enter Live ${esc(cName)} Hub (+25 🪙 Bonus)`}
          </a>
          <a class="btn-sec" href="${prefix}index.html?open=boardingpass&city=${city.id}&lang=${lang}&from=seo">
            🎫 ${isFr ? `Billet d’Embarquement 4D vers ${esc(city.code)}` : `Generate 4D Boarding Pass to ${esc(city.code)}`}
          </a>
          <a class="btn-sec" href="${prefix}index.html?view=radar&city=${city.id}&lang=${lang}&from=seo">
            🗺️ ${isFr ? 'Voir sur le Radar 3D' : 'Open on Live Radar Map'}
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
            <a href="${isFr ? '../world-radio.html' : '../world-radio.html'}" style="font-size:0.84rem;font-weight:800;">
              🎧 ${isFr ? 'Explorer les 38 Stations Radio du Monde →' : 'Explore All 38 World Radio Stations →'}
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
function buildDirectoryPage(lang, cities) {
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
  <meta property="og:type" content="website">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${DOMAIN}/img/remo_brand_coin.png">
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
          <a class="btn-primary" href="${prefix}index.html?lang=${lang}&from=seo">🚀 ${isFr ? 'Entrer dans le Flux Mondial (+25 🪙)' : 'Enter Live World Feed (+25 🪙)'}</a>
          <a class="btn-sec" href="${isFr ? '../world-radio.html' : '../world-radio.html'}">📻 ${isFr ? '38 Radios en Direct' : 'Stream 38 World Radios'}</a>
          <a class="btn-sec" href="${isFr ? '../guess-the-city.html' : '../guess-the-city.html'}">🕵️ ${isFr ? 'Jouer à Deviner la Ville' : 'Play Guess The City'}</a>
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

  const title = isFr
    ? '📻 Radio du Monde en Direct Gratuit — 38 Stations Sans Pub (Paris, Montréal, Chișinău, Tokyo) | REMO World'
    : '📻 Free Live World Cities Radio Online — 38 Ad-Free Streams (Lofi, Paris, Montréal, Chișinău, Tokyo) | REMO World';
  const desc = isFr
    ? 'Écoutez 38 radios du monde et ambiances Lofi, Jazz, Synthwave, K-Pop et Hits urbains gratuitement dans votre navigateur. Zéro inscription requise + gagnez des pièces d’or sur REMO World.'
    : 'Listen to 38 live world city radio stations, Lofi Beats, Night Jazz, Synthwave, French Touch, Chisinau, Montreal, NYC, Tokyo & Seoul K-Pop free online in your browser. Zero sign-up required.';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        'name': isFr ? 'REMO World Radio 2.0 (38 Stations en Direct)' : 'REMO World Radio 2.0 (38 Live Stations)',
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
            'name': isFr ? 'Puis-je écouter les 38 stations radio gratuitement sans créer de compte ?' : 'Can I stream all 38 world radio stations for free without signing up?',
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
  <meta property="og:type" content="website">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${DOMAIN}/img/remo_brand_coin.png">
  <link rel="icon" type="image/png" sizes="32x32" href="${prefix}img/favicon-32x32.png">
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
  <style>${SHARED_CSS}</style>
</head>
<body>
  <div class="wrap">
    ${renderTopbar(lang, prefix, altUrl)}
    <main>
      <section class="hero">
        <div class="eyebrow">📻 38 LIVE STREAMS • ZERO SIGN-UP • LISTEN-TO-EARN</div>
        <h1>${isFr ? 'Radio Mondiale en Direct — 38 Stations Urbaines & Lofi' : 'Free Live World Cities Radio — 38 Curated Global Stations'}</h1>
        <p class="lead">${esc(desc)}</p>
        <div class="cta-row">
          <a class="btn-primary" href="${prefix}index.html?open=radio&lang=${lang}&from=seo">🎧 ${isFr ? 'Ouvrir le Lecteur Complet (+5 🪙 / 10 min)' : 'Open Full Radio & Earn Coins (+5 🪙 / 10m)'}</a>
          <input type="search" id="stSearch" placeholder="🔍 ${isFr ? 'Filtrer par ville ou style (ex: Paris, Lofi, Jazz)...' : 'Filter by city or genre (e.g. Chisinau, Lofi, Jazz, K-Pop)...'}"
            oninput="filterSt(this.value)" style="padding:12px 16px;border-radius:14px;border:1px solid rgba(56,189,248,0.45);background:rgba(2,6,23,0.85);color:#fff;min-width:270px;flex:1;">
        </div>
      </section>

      <section class="card" style="margin-bottom:22px;">
        <h2>🌍 ${isFr ? 'Toutes les 38 Stations en Direct (1-Click Play)' : 'All 38 Live Stations — Click Any Stream to Listen Instantly'}</h2>
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
  <meta property="og:type" content="website">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${DOMAIN}/img/remo_brand_coin.png">
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
  <meta property="og:type" content="website">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${DOMAIN}/img/remo_brand_coin.png">
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
  <meta property="og:type" content="website">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${DOMAIN}/img/remo_brand_coin.png">
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
          <a class="city-link" href="${isFr ? 'cities/' : 'cities/'}${c.id}.html">${c.flag} ${esc(isFr ? c.name_fr : c.name_en)} (${c.code})</a>`).join('')}
        </div>
      </section>
    </main>
    ${renderFooter(lang, prefix)}
  </div>
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

/* ── 7. Build Sitemap.xml (60 Canonical Bilingual URLs + hreflang) & Robots.txt ── */
function buildSitemapXml(cities) {
  const pairs = [
    { en: `${DOMAIN}/`, fr: `${DOMAIN}/?lang=fr`, prio: '1.0', freq: 'daily' },
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

  const urlNodes = [];
  pairs.forEach((p) => {
    // Emit EN entry
    urlNodes.push(`  <url>
    <loc>${p.en}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${p.freq}</changefreq>
    <priority>${p.prio}</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${p.en}"/>
    <xhtml:link rel="alternate" hreflang="fr" href="${p.fr}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${p.en}"/>
  </url>`);
    // Emit FR entry if distinct static page
    if (p.fr.endsWith('.html')) {
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

> REMO World is a free bilingual (English & French) 4D City Social Network, Live World Radio Player (38 ad-free global & Lofi stations), Browser Geography Game ("Guess My City!"), and 9:16 Virtual Boarding Pass Generator connecting 24 world cities in real time.

## Key Free Features (Zero Sign-Up Required to Explore)
- [REMO World Live Social App](${DOMAIN}/): Real-time cross-city social feed, 1-click cross-city Waves with km distance, live City Clicker Cup wars, Citizen Passports, and collectible 4D City Cards.
- [Free Live World Cities Radio (38 Stations)](${DOMAIN}/world-radio.html): Stream live radio from Paris, Montréal, Chișinău, Bucharest, New York, London, Tokyo, Seoul, Berlin, Dubai + Lofi, Jazz & Synthwave with Listen-to-Earn coin rewards.
- [Guess The City Photo Game](${DOMAIN}/guess-the-city.html): Free browser geography & skyline photo guessing game created by real citizens worldwide.
- [4D Holographic Boarding Pass Generator](${DOMAIN}/boarding-pass.html): Create & download 9:16 Story Boarding Passes between any two world cities for TikTok, Instagram & WhatsApp.
- [All 24 Connected World Cities Directory](${DOMAIN}/cities/index.html): Live local time, weather, radio streams & urban stats for every Edition-1 metropolis.

## Edition-1 Connected Cities (EN & FR)
${cities.map((c) => `- [${c.flag} ${c.name_en} (${c.country_en})](${DOMAIN}/cities/${c.id}.html) | [Version Française](${DOMAIN}/fr/cities/${c.id}.html)`).join('\n')}

## Languages
- English: ${DOMAIN}/
- Français: ${DOMAIN}/fr/cities/index.html
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

  // 2 Directory Index Pages
  fs.writeFileSync(path.join(ROOT, 'cities', 'index.html'), buildDirectoryPage('en', cities), 'utf8');
  fs.writeFileSync(path.join(ROOT, 'fr', 'cities', 'index.html'), buildDirectoryPage('fr', cities), 'utf8');
  generatedCount += 2;

  // 6 High-Intent Feature Hub Pages
  fs.writeFileSync(path.join(ROOT, 'world-radio.html'), buildWorldRadioHubPage('en', stations, cities), 'utf8');
  fs.writeFileSync(path.join(ROOT, 'fr', 'world-radio.html'), buildWorldRadioHubPage('fr', stations, cities), 'utf8');
  fs.writeFileSync(path.join(ROOT, 'guess-the-city.html'), buildGuessCityHubPage('en', cities), 'utf8');
  fs.writeFileSync(path.join(ROOT, 'fr', 'guess-the-city.html'), buildGuessCityHubPage('fr', cities), 'utf8');
  fs.writeFileSync(path.join(ROOT, 'boarding-pass.html'), buildBoardingPassHubPage('en', cities), 'utf8');
  fs.writeFileSync(path.join(ROOT, 'fr', 'boarding-pass.html'), buildBoardingPassHubPage('fr', cities), 'utf8');
  generatedCount += 6;

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
