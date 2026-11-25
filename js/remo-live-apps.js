/* ═══════════════════════════════════════════════════════════════════════════
   ✨ REMO LIVE DISCOVERY APPS ENGINE v1.0
   - 8 Production-Ready Bilingual (EN/FR) Viewer-City Live API Mini-Apps
   - Social Loop Bridge (REMO_APP_SHARE -> Comments Pre-Fill + 9:16 Story PNG)
   - Audio Coordination (REMO_APP_AUDIO_ACTIVE + Auto-Pause on Scroll/Close)
   - Live Apps Category Sub-Bar, Drop of the Day (+5 PTS Explorer Bonus) & Scheduling
   - 1-Click Admin Studio Preset Loader + Standalone Export Support
   ═══════════════════════════════════════════════════════════════════════════ */

window.currentLiveAppCategory = window.currentLiveAppCategory || 'all';
window._pendingLiveAppKey = '';
let _activeLiveAppSharePayload = null;
let _liveAppAudioObserver = null;

/* ── Shared 24 REMO Cities Table (Embedded cleanly inside each standalone app) ── */
const LIVE_APP_CITIES_MINI = [
  { id: 'montreal',   en: 'Montréal',       fr: 'Montréal',       flag: '⚜️', lat: 45.5017,  lng: -73.5673, cur: 'CAD', c: 4.9,  m: 3.75, f: 18,   r: 68 },
  { id: 'paris',      en: 'Paris',          fr: 'Paris',          flag: '🗼', lat: 48.8566,  lng: 2.3522,   cur: 'EUR', c: 3.8,  m: 2.5,  f: 16,   r: 52 },
  { id: 'chisinau',   en: 'Chișinău',       fr: 'Chișinău',       flag: '🇲🇩', lat: 47.0105,  lng: 28.8638,  cur: 'MDL', c: 42,   m: 6,    f: 155,  r: 360 },
  { id: 'bucharest',  en: 'Bucharest',      fr: 'Bucarest',       flag: '🇷🇴', lat: 44.4268,  lng: 26.1025,  cur: 'RON', c: 15,   m: 5,    f: 52,   r: 120 },
  { id: 'newyork',    en: 'New York',       fr: 'New York',       flag: '🗽', lat: 40.7128,  lng: -74.0060, cur: 'USD', c: 5.5,  m: 2.9,  f: 22,   r: 125 },
  { id: 'tokyo',      en: 'Tokyo',          fr: 'Tokyo',          flag: '🏯', lat: 35.6762,  lng: 139.6503, cur: 'JPY', c: 520,  m: 210,  f: 1200, r: 4600 },
  { id: 'london',     en: 'London',         fr: 'Londres',        flag: '🏰', lat: 51.5074,  lng: -0.1278,  cur: 'GBP', c: 3.9,  m: 2.9,  f: 15,   r: 72 },
  { id: 'dubai',      en: 'Dubai',          fr: 'Dubaï',          flag: '🌆', lat: 25.2048,  lng: 55.2708,  cur: 'AED', c: 22,   m: 6,    f: 55,   r: 230 },
  { id: 'miami',      en: 'Miami',          fr: 'Miami',          flag: '🌴', lat: 25.7617,  lng: -80.1918, cur: 'USD', c: 5.2,  m: 2.25, f: 19,   r: 95 },
  { id: 'barcelona',  en: 'Barcelona',      fr: 'Barcelone',      flag: '☀️', lat: 41.3874,  lng: 2.1686,   cur: 'EUR', c: 2.4,  m: 2.55, f: 14,   r: 46 },
  { id: 'rome',       en: 'Rome',           fr: 'Rome',           flag: '🏛️', lat: 41.9028,  lng: 12.4964,  cur: 'EUR', c: 1.5,  m: 1.5,  f: 13,   r: 42 },
  { id: 'toronto',    en: 'Toronto',        fr: 'Toronto',        flag: '🍁', lat: 43.6532,  lng: -79.3832, cur: 'CAD', c: 5.1,  m: 3.35, f: 20,   r: 82 },
  { id: 'monaco',     en: 'Monaco',         fr: 'Monaco',         flag: '🏎️', lat: 43.7384,  lng: 7.4246,   cur: 'EUR', c: 5.5,  m: 2.0,  f: 28,   r: 160 },
  { id: 'losangeles', en: 'Los Angeles',    fr: 'Los Angeles',    flag: '🎬', lat: 34.0522,  lng: -118.2437,cur: 'USD', c: 5.6,  m: 1.75, f: 21,   r: 92 },
  { id: 'seoul',      en: 'Seoul',          fr: 'Séoul',          flag: '⚡', lat: 37.5665,  lng: 126.9780, cur: 'KRW', c: 4800, m: 1400, f: 11000,r: 36000 },
  { id: 'geneva',     en: 'Geneva',         fr: 'Genève',         flag: '⌚', lat: 46.2044,  lng: 6.1432,   cur: 'CHF', c: 5.5,  m: 3.0,  f: 26,   r: 88 },
  { id: 'singapore',  en: 'Singapore',      fr: 'Singapour',      flag: '🦁', lat: 1.3521,   lng: 103.8198, cur: 'SGD', c: 5.8,  m: 1.8,  f: 9,    r: 110 },
  { id: 'sydney',     en: 'Sydney',         fr: 'Sydney',         flag: '⛵', lat: -33.8688, lng: 151.2093, cur: 'AUD', c: 5.2,  m: 4.5,  f: 22,   r: 105 },
  { id: 'rio',        en: 'Rio de Janeiro', fr: 'Rio de Janeiro', flag: '🎭', lat: -22.9068, lng: -43.1729, cur: 'BRL', c: 11,   m: 7.5,  f: 42,   r: 110 },
  { id: 'istanbul',   en: 'Istanbul',       fr: 'Istanbul',       flag: '🕌', lat: 41.0082,  lng: 28.9784,  cur: 'TRY', c: 110,  m: 27,   f: 320,  r: 950 },
  { id: 'berlin',     en: 'Berlin',         fr: 'Berlin',         flag: '🎧', lat: 52.5200,  lng: 13.4050,  cur: 'EUR', c: 3.6,  m: 3.5,  f: 13,   r: 44 },
  { id: 'amsterdam',  en: 'Amsterdam',      fr: 'Amsterdam',      flag: '🚲', lat: 52.3676,  lng: 4.9041,   cur: 'EUR', c: 4.0,  m: 3.4,  f: 17,   r: 68 },
  { id: 'lisbon',     en: 'Lisbon',         fr: 'Lisbonne',       flag: '🚋', lat: 38.7223,  lng: -9.1393,  cur: 'EUR', c: 1.6,  m: 1.8,  f: 12,   r: 45 },
  { id: 'cairo',      en: 'Cairo',          fr: 'Le Caire',       flag: '🔺', lat: 30.0444,  lng: 31.2357,  cur: 'EGP', c: 85,   m: 10,   f: 220,  r: 550 }
];

/* ── Shared Base Styles & Context Helper Snippet for All 8 Standalone Mini-Apps ── */
function _buildAppShell({ title, accent = '#38bdf8', accent2 = '#a855f7', extraCss = '', bodyHtml = '', scriptJs = '' }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
<title>${title}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;}
:root{--bg:#060919;--card:#0c132a;--line:rgba(148,163,184,0.22);--txt:#f8fafc;--muted:#94a3b8;--ac:${accent};--ac2:${accent2};}
html,body{width:100%;height:100%;background:radial-gradient(circle at top right,rgba(56,189,248,0.16),#050816 62%);color:var(--txt);font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;overflow:hidden;}
.app{width:100%;height:100%;max-width:520px;margin:0 auto;padding:12px;display:flex;flex-direction:column;gap:9px;overflow-y:auto;}
.top{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-shrink:0;}
.brand{display:flex;align-items:center;gap:7px;min-width:0;}
.brand-ic{width:30px;height:30px;border-radius:10px;display:grid;place-items:center;background:linear-gradient(135deg,var(--ac),var(--ac2));font-size:15px;flex-shrink:0;box-shadow:0 4px 14px rgba(56,189,248,0.28);}
.brand-t{font-weight:900;font-size:13px;letter-spacing:0.2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.brand-s{font-size:10.5px;color:var(--muted);}
.sel{background:#0f172a;color:#e2e8f0;border:1px solid var(--line);border-radius:10px;padding:5px 8px;font-size:11.5px;font-weight:700;outline:none;max-width:142px;cursor:pointer;}
.card{background:rgba(12,19,42,0.86);border:1px solid var(--line);border-radius:16px;padding:12px;position:relative;overflow:hidden;display:flex;flex-direction:column;gap:8px;flex:1;min-height:0;}
.pill{display:inline-flex;align-items:center;gap:5px;padding:3px 9px;border-radius:99px;font-size:10.5px;font-weight:800;background:rgba(56,189,248,0.16);border:1px solid rgba(56,189,248,0.36);color:#bae6fd;width:fit-content;}
.pill.gold{background:rgba(251,191,36,0.16);border-color:rgba(251,191,36,0.45);color:#fde68a;}
.row{display:flex;gap:7px;align-items:center;}
.btn{flex:1;border:none;border-radius:12px;padding:10px 12px;font-weight:900;font-size:12.5px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px;transition:transform .12s,opacity .15s;}
.btn:active{transform:scale(0.97);}
.btn-pri{background:linear-gradient(135deg,var(--ac),var(--ac2));color:#040814;box-shadow:0 6px 18px rgba(56,189,248,0.25);}
.btn-sec{background:rgba(255,255,255,0.08);color:#f1f5f9;border:1px solid var(--line);flex:0 0 auto;padding:10px 12px;}
.btn-sec:hover{background:rgba(255,255,255,0.14);}
.muted{color:var(--muted);font-size:11.5px;line-height:1.4;}
.img-box{position:relative;width:100%;flex:1;min-height:155px;border-radius:12px;overflow:hidden;background:#090f24;border:1px solid rgba(255,255,255,0.08);display:grid;place-items:center;}
.img-box img{width:100%;height:100%;object-fit:cover;display:block;transition:opacity .25s;}
.badge-ov{position:absolute;top:8px;left:8px;padding:4px 9px;border-radius:99px;background:rgba(5,8,22,0.82);backdrop-filter:blur(6px);border:1px solid rgba(251,191,36,0.5);color:#fde68a;font-size:11px;font-weight:900;}
.loader{font-size:12px;color:#7dd3fc;font-weight:700;padding:16px;text-align:center;}
${extraCss}
</style>
</head>
<body>
${bodyHtml}
<script>
const CITIES = ${JSON.stringify(LIVE_APP_CITIES_MINI)};
const CTX = window.REMO_CONTEXT || {};
const LANG = (CTX.lang === 'fr') ? 'fr' : 'en';
const IS_FR = LANG === 'fr';
const INIT_CITY_ID = (CTX.viewerCityId || CTX.cityId || 'montreal').toLowerCase();
function getCity(id){ return CITIES.find(c => c.id === id) || CITIES[0]; }
function cityLabel(c){ return c.flag + ' ' + (IS_FR ? c.fr : c.en); }
function fillCitySelect(selEl, selectedId){
  if(!selEl) return;
  selEl.innerHTML = CITIES.map(c => '<option value="'+c.id+'"'+(c.id===selectedId?' selected':'')+'>'+cityLabel(c)+'</option>').join('');
}
function shareToRemo(payload){
  if (typeof window.remoShareResult === 'function') {
    window.remoShareResult(payload);
    return;
  }
  try {
    parent.postMessage(Object.assign({ type: 'REMO_APP_SHARE', postId: CTX.postId || '' }, payload || {}), '*');
  } catch (e) {}
}
${scriptJs}
<\/script>
</body>
</html>`;
}

/* ═══════════════════════════════════════════════════════════════════════════
   1. 📸 TIME PORTAL — 100 YEARS AGO CITY POSTCARDS (Wikimedia Commons API)
   ═══════════════════════════════════════════════════════════════════════════ */
function buildTimePortalAppHtml() {
  const extraCss = `
.img-box.sepia img{filter:sepia(0.18) contrast(1.06);}
.era-title{font-weight:900;font-size:13.5px;color:#fef3c7;line-height:1.3;}
.era-sub{font-size:11px;color:#94a3b8;display:flex;justify-content:space-between;gap:8px;align-items:center;}
.era-frame{border:2px solid rgba(251,191,36,0.35);box-shadow:inset 0 0 28px rgba(0,0,0,0.55);}
`;
  const bodyHtml = `
<div class="app">
  <div class="top">
    <div class="brand">
      <div class="brand-ic">📸</div>
      <div>
        <div class="brand-t" id="hdrTitle">Time Portal · 100 Years Ago</div>
        <div class="brand-s" id="hdrSub">Real historical archives (1890–1960)</div>
      </div>
    </div>
    <select id="citySel" class="sel" aria-label="City"></select>
  </div>
  <div class="card">
    <div class="img-box sepia era-frame" id="imgBox">
      <div class="loader" id="loader">⏳ Opening historical vault...</div>
      <img id="photo" alt="" style="display:none;">
      <div class="badge-ov" id="yearBadge" style="display:none;">🏛️ 1910</div>
    </div>
    <div class="era-title" id="eraTitle">—</div>
    <div class="era-sub">
      <span id="eraCredit">Wikimedia Commons Archive</span>
      <span id="eraCount">0 / 0</span>
    </div>
    <div class="row">
      <button class="btn btn-pri" id="btnNext">⏳ Next Era</button>
      <button class="btn btn-sec" id="btnShare" title="Share">💬</button>
    </div>
  </div>
</div>`;
  const scriptJs = `
const QUERIES = {
  montreal: '"Montreal" postcard 1900 OR 1910 OR 1920 OR 1930',
  paris: '"Paris" postcard 1900 OR 1910 OR 1920 OR 1925',
  chisinau: '"Chisinau" OR "Kishinev" 1900 OR 1910 OR 1920 OR postcard',
  bucharest: '"Bucharest" OR "Bucuresti" postcard OR 1900 OR 1910 OR 1920',
  newyork: '"New York" street OR skyline 1900 OR 1910 OR 1920 OR 1930',
  tokyo: '"Tokyo" 1900 OR 1910 OR 1920 OR 1930 postcard',
  london: '"London" street 1900 OR 1910 OR 1920 postcard',
  dubai: '"Dubai" creek OR 1950 OR 1960 historic',
  miami: '"Miami" postcard 1920 OR 1930 OR 1940',
  barcelona: '"Barcelona" postcard 1900 OR 1910 OR 1920',
  rome: '"Rome" OR "Roma" postcard 1900 OR 1910 OR 1920',
  toronto: '"Toronto" postcard 1900 OR 1910 OR 1920',
  monaco: '"Monte Carlo" OR "Monaco" postcard 1900 OR 1910 OR 1920',
  losangeles: '"Los Angeles" postcard 1910 OR 1920 OR 1930',
  seoul: '"Seoul" 1900 OR 1910 OR 1920 OR 1930 historic',
  geneva: '"Geneve" OR "Geneva" postcard 1900 OR 1910 OR 1920',
  singapore: '"Singapore" postcard 1900 OR 1910 OR 1920',
  sydney: '"Sydney" postcard 1900 OR 1910 OR 1920',
  rio: '"Rio de Janeiro" postcard 1900 OR 1910 OR 1920',
  istanbul: '"Constantinople" OR "Istanbul" postcard 1900 OR 1910',
  berlin: '"Berlin" postcard 1900 OR 1910 OR 1920',
  amsterdam: '"Amsterdam" postcard 1900 OR 1910 OR 1920',
  lisbon: '"Lisbon" OR "Lisboa" postcard 1900 OR 1910 OR 1920',
  cairo: '"Cairo" postcard 1900 OR 1910 OR 1920'
};
document.getElementById('hdrTitle').textContent = IS_FR ? 'Portail Temporel · Il y a 100 ans' : 'Time Portal · 100 Years Ago';
document.getElementById('hdrSub').textContent = IS_FR ? 'Vraies archives historiques (1890–1960)' : 'Real historical archives (1890–1960)';
document.getElementById('btnNext').textContent = IS_FR ? '⏳ Autre Époque' : '⏳ Next Era';

const sel = document.getElementById('citySel');
let curCity = getCity(INIT_CITY_ID);
fillCitySelect(sel, curCity.id);
let items = [];
let idx = 0;

function stripHtml(s){ return String(s||'').replace(/<[^>]*>/g,' ').replace(/\\s+/g,' ').trim(); }
function extractYear(text){
  const m = String(text||'').match(/\\b(18[6-9]\\d|19[0-6]\\d)\\b/);
  return m ? m[1] : '';
}
async function queryCommons(q){
  const url = 'https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrlimit=28&gsrsearch=' +
    encodeURIComponent(q + ' filetype:bitmap') +
    '&prop=imageinfo&iiprop=url|mime|extmetadata&iiurlwidth=860&format=json&origin=*';
  const res = await fetch(url);
  const data = await res.json();
  const pages = Object.values((data && data.query && data.query.pages) || {});
  const out = [];
  for (const pg of pages) {
    const ii = pg.imageinfo && pg.imageinfo[0];
    if (!ii || !ii.thumburl) continue;
    if (!/^image\\/(jpeg|png|webp)$/i.test(ii.mime || '')) continue;
    const rawTitle = String(pg.title || '').replace(/^File:/i, '').replace(/\\.[a-z0-9]+$/i, '').replace(/_/g, ' ');
    if (/(map|plan|coat of arms|flag|seal|signature|logo|diagram|chart|stamp|grave|certificate)/i.test(rawTitle)) continue;
    const meta = ii.extmetadata || {};
    const desc = stripHtml(meta.ImageDescription && meta.ImageDescription.value);
    const dt = stripHtml(meta.DateTimeOriginal && meta.DateTimeOriginal.value);
    const yr = extractYear(dt) || extractYear(rawTitle) || extractYear(desc) || 'c. 1915';
    const cleanTitle = (desc && desc.length > 8 && desc.length < 110) ? desc : rawTitle;
    out.push({
      url: ii.thumburl,
      year: yr,
      title: cleanTitle.slice(0, 110),
      credit: stripHtml(meta.Artist && meta.Artist.value).slice(0, 42) || 'Wikimedia Commons'
    });
  }
  return out;
}
function renderItem(){
  const img = document.getElementById('photo');
  const loader = document.getElementById('loader');
  const yrB = document.getElementById('yearBadge');
  if (!items.length) {
    img.style.display = 'none';
    yrB.style.display = 'none';
    loader.style.display = 'block';
    loader.textContent = IS_FR ? 'Aucune archive trouvée — essayez une autre ville.' : 'No archive found — try another city.';
    return;
  }
  const it = items[idx % items.length];
  loader.style.display = 'block';
  loader.textContent = IS_FR ? '⏳ Développement de la photo...' : '⏳ Developing vintage photo...';
  img.style.opacity = '0.25';
  img.onload = () => { loader.style.display = 'none'; img.style.display = 'block'; img.style.opacity = '1'; };
  img.onerror = () => { idx = (idx + 1) % items.length; if (items.length > 1) renderItem(); };
  img.src = it.url;
  yrB.style.display = 'block';
  yrB.textContent = '🏛️ ' + it.year + ' · ' + (IS_FR ? curCity.fr : curCity.en);
  document.getElementById('eraTitle').textContent = it.title;
  document.getElementById('eraCredit').textContent = '📜 ' + it.credit;
  document.getElementById('eraCount').textContent = ((idx % items.length) + 1) + ' / ' + items.length;
}
async function loadCity(cityId){
  curCity = getCity(cityId);
  items = [];
  idx = 0;
  document.getElementById('photo').style.display = 'none';
  document.getElementById('yearBadge').style.display = 'none';
  document.getElementById('loader').style.display = 'block';
  document.getElementById('loader').textContent = IS_FR ? '⏳ Recherche dans les archives de ' + curCity.fr + '...' : '⏳ Searching ' + curCity.en + ' archives...';
  try {
    items = await queryCommons(QUERIES[curCity.id] || ('"' + curCity.en + '" postcard 1900 OR 1910 OR 1920'));
    if (items.length < 3) {
      const extra = await queryCommons('"' + curCity.en + '" vintage OR historic');
      items = items.concat(extra);
    }
    items.sort(() => Math.random() - 0.5);
  } catch (e) {}
  renderItem();
}
sel.addEventListener('change', () => loadCity(sel.value));
document.getElementById('btnNext').addEventListener('click', () => { if (!items.length) return; idx = (idx + 1) % items.length; renderItem(); });
document.getElementById('btnShare').addEventListener('click', () => {
  const it = items[idx % Math.max(1, items.length)];
  const cName = IS_FR ? curCity.fr : curCity.en;
  const txt = it
    ? (IS_FR
      ? '📸 Portail Temporel REMO : Voici ' + cName + ' en ' + it.year + ' — « ' + it.title + ' » ! À quoi ressemblait votre ville ?'
      : '📸 REMO Time Portal: Look at ' + cName + ' in ' + it.year + ' — "' + it.title + '"! What did your city look like?')
    : (IS_FR ? '📸 J’explore le passé de ' + cName + ' sur REMO !' : '📸 Exploring ' + cName + ' 100 years ago on REMO!');
  shareToRemo({
    badge: '📸 TIME PORTAL · ' + (it ? it.year : '1900s'),
    title: curCity.flag + ' ' + cName + ' (' + (it ? it.year : 'Archive') + ')',
    subtitle: it ? it.title : cName,
    summaryText: txt,
    accentColor: '#fbbf24'
  });
});
loadCity(curCity.id);
`;
  return _buildAppShell({ title: 'REMO Time Portal 100 Years Ago', accent: '#fbbf24', accent2: '#f97316', extraCss, bodyHtml, scriptJs });
}

/* ═══════════════════════════════════════════════════════════════════════════
   2. 🔭 NASA SPACE BIRTHDAY (Cached Netlify Proxy + Keyless NASA Images Fallback)
   ═══════════════════════════════════════════════════════════════════════════ */
function buildNasaBirthdayAppHtml() {
  const extraCss = `
.bday-bar{display:flex;gap:6px;align-items:center;}
.date-inp{flex:1;background:#0f172a;color:#f8fafc;border:1px solid rgba(167,139,250,0.45);border-radius:11px;padding:7px 10px;font-size:12px;font-weight:700;outline:none;color-scheme:dark;}
.space-title{font-weight:900;font-size:13.5px;color:#e0e7ff;line-height:1.25;}
.space-desc{font-size:11px;color:#94a3b8;line-height:1.38;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;}
`;
  const bodyHtml = `
<div class="app">
  <div class="top">
    <div class="brand">
      <div class="brand-ic">🔭</div>
      <div>
        <div class="brand-t" id="hdrTitle">NASA Space Birthday</div>
        <div class="brand-s" id="hdrSub">What NASA photographed on your birthday</div>
      </div>
    </div>
    <span class="pill" id="modePill">TODAY</span>
  </div>
  <div class="card">
    <div class="bday-bar">
      <input type="date" id="bdayInp" class="date-inp" min="1950-01-01">
      <button class="btn btn-pri" id="btnGo" style="flex:0 0 auto;padding:8px 13px;">🔭 Go</button>
    </div>
    <div class="img-box">
      <div class="loader" id="loader">✨ Tuning NASA deep-space telescope...</div>
      <img id="spaceImg" alt="" style="display:none;">
      <div class="badge-ov" id="dateOv" style="display:none;">🔭 NASA</div>
    </div>
    <div class="space-title" id="spaceTitle">—</div>
    <div class="space-desc" id="spaceDesc"></div>
    <div class="row">
      <button class="btn btn-pri" id="btnShare">💬 Share My Space Photo</button>
      <button class="btn btn-sec" id="btnToday">🌟 Today</button>
    </div>
  </div>
</div>`;
  const scriptJs = `
document.getElementById('hdrTitle').textContent = IS_FR ? 'Anniversaire Spatial NASA' : 'NASA Space Birthday';
document.getElementById('hdrSub').textContent = IS_FR ? 'Ce que la NASA a photographié le jour de votre naissance' : 'What NASA photographed on your birthday';
document.getElementById('btnGo').textContent = IS_FR ? '🔭 Voir' : '🔭 Discover';
document.getElementById('btnShare').textContent = IS_FR ? '💬 Partager Ma Photo NASA' : '💬 Share My Space Photo';
document.getElementById('btnToday').textContent = IS_FR ? '🌟 Aujourd’hui' : '🌟 Today';

const todayStr = new Date().toISOString().slice(0, 10);
const inp = document.getElementById('bdayInp');
inp.max = todayStr;
inp.value = '1998-07-20';
let curData = null;

function hashStr(s){ let h=2166136261; for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619); } return Math.abs(h); }
async function fetchClientNasaFallback(dateStr){
  const topics = ['nebula hubble','james webb galaxy','supernova remnant','saturn rings cassini','pillars of creation','aurora borealis iss','orion nebula','andromeda galaxy'];
  const seed = hashStr(dateStr || todayStr);
  const q = topics[seed % topics.length];
  const r = await fetch('https://images-api.nasa.gov/search?q=' + encodeURIComponent(q) + '&media_type=image&page=1');
  const d = await r.json();
  const list = ((d && d.collection && d.collection.items) || []).filter(x => x.links && x.links[0] && x.data && x.data[0]);
  const pick = list[seed % Math.max(1, list.length)];
  if (!pick) throw new Error('empty');
  const m = pick.data[0];
  return {
    ok: true,
    matchedMode: dateStr ? 'cosmic_archive' : 'today',
    requestedDate: dateStr || todayStr,
    apodDate: String(m.date_created || todayStr).slice(0, 10),
    title: m.title || 'NASA Deep Space',
    explanation: String(m.description || '').replace(/<[^>]*>/g, '').slice(0, 320),
    imageUrl: pick.links[0].href,
    credit: m.center || 'NASA / Hubble / JWST'
  };
}

async function loadSpaceDate(dateStr){
  const img = document.getElementById('spaceImg');
  const loader = document.getElementById('loader');
  const dateOv = document.getElementById('dateOv');
  img.style.display = 'none';
  dateOv.style.display = 'none';
  loader.style.display = 'block';
  loader.textContent = IS_FR ? '✨ Connexion aux archives NASA...' : '✨ Loading NASA cosmic archive...';

  let data = null;
  try {
    const qs = dateStr ? ('?date=' + encodeURIComponent(dateStr)) : '';
    const base = /^https?:$/i.test(location.protocol) ? '' : 'https://remoworld.com';
    const r = await fetch(base + '/.netlify/functions/nasa-apod' + qs);
    if (r.ok) {
      const j = await r.json();
      if (j && j.ok && j.imageUrl) data = j;
    }
  } catch (e) {}
  if (!data) {
    try { data = await fetchClientNasaFallback(dateStr); } catch (e) {}
  }
  if (!data) {
    loader.textContent = IS_FR ? '⚠️ NASA temporairement occupée — réessayez !' : '⚠️ NASA archive temporarily busy — try again!';
    return;
  }
  curData = data;
  const modePill = document.getElementById('modePill');
  if (data.matchedMode === 'today') modePill.textContent = IS_FR ? 'AUJOURD’HUI' : 'TODAY';
  else if (data.matchedMode === 'birthday_anniversary') modePill.textContent = IS_FR ? 'MATCH COSMIQUE' : 'COSMIC MATCH';
  else modePill.textContent = data.apodDate || 'NASA HD';

  img.onload = () => { loader.style.display = 'none'; img.style.display = 'block'; };
  img.src = data.imageUrl;
  dateOv.style.display = 'block';
  dateOv.textContent = '🔭 ' + (data.apodDate || todayStr) + ' · ' + (data.credit || 'NASA');
  document.getElementById('spaceTitle').textContent = data.title;
  document.getElementById('spaceDesc').textContent = data.explanation || '';
}

document.getElementById('btnGo').addEventListener('click', () => loadSpaceDate(inp.value || todayStr));
document.getElementById('btnToday').addEventListener('click', () => loadSpaceDate(''));
document.getElementById('btnShare').addEventListener('click', () => {
  if (!curData) return;
  const dLbl = curData.requestedDate || curData.apodDate;
  const txt = IS_FR
    ? '🔭 Pour ma date (' + dLbl + '), la NASA a capturé « ' + curData.title + ' » ✨ Et pour votre anniversaire, c’est quoi ?'
    : '🔭 For my date (' + dLbl + '), NASA captured "' + curData.title + '" ✨ What did NASA photograph on your birthday?';
  shareToRemo({
    badge: '🔭 NASA SPACE BIRTHDAY · ' + dLbl,
    title: curData.title,
    subtitle: 'NASA Archive · ' + (curData.apodDate || dLbl),
    summaryText: txt,
    accentColor: '#818cf8'
  });
});
loadSpaceDate('');
`;
  return _buildAppShell({ title: 'REMO NASA Space Birthday', accent: '#818cf8', accent2: '#38bdf8', extraCss, bodyHtml, scriptJs });
}

/* ═══════════════════════════════════════════════════════════════════════════
   3. 📍 WIKIPEDIA RADAR (< 5 KM FROM CITY CENTER — Bilingual EN/FR Geosearch)
   ═══════════════════════════════════════════════════════════════════════════ */
function buildWikiRadarAppHtml() {
  const extraCss = `
.wiki-title{font-weight:900;font-size:14px;color:#f8fafc;line-height:1.25;}
.wiki-extract{font-size:11.5px;color:#cbd5e1;line-height:1.42;display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden;}
.wiki-link{font-size:11px;color:#38bdf8;text-decoration:none;font-weight:800;}
`;
  const bodyHtml = `
<div class="app">
  <div class="top">
    <div class="brand">
      <div class="brand-ic">📍</div>
      <div>
        <div class="brand-t" id="hdrTitle">Wikipedia Radar · &lt;5 km</div>
        <div class="brand-s" id="hdrSub">Hidden stories right next to your city</div>
      </div>
    </div>
    <select id="citySel" class="sel" aria-label="City"></select>
  </div>
  <div class="card">
    <div class="img-box">
      <div class="loader" id="loader">📡 Scanning 5 km radius...</div>
      <img id="wikiImg" alt="" style="display:none;">
      <div class="badge-ov" id="distOv" style="display:none;">📍 1.2 km</div>
    </div>
    <div class="wiki-title" id="wikiTitle">—</div>
    <div class="wiki-extract" id="wikiExtract"></div>
    <div class="row" style="justify-content:space-between;">
      <a class="wiki-link" id="wikiLink" href="#" target="_blank" rel="noopener">↗ Wikipedia</a>
      <span class="muted" id="wikiIdx"></span>
    </div>
    <div class="row">
      <button class="btn btn-pri" id="btnNext">🎯 Next Secret Spot</button>
      <button class="btn btn-sec" id="btnShare" title="Share">💬</button>
    </div>
  </div>
</div>`;
  const scriptJs = `
document.getElementById('hdrTitle').textContent = IS_FR ? 'Radar Wikipédia · < 5 km' : 'Wikipedia Radar · < 5 km';
document.getElementById('hdrSub').textContent = IS_FR ? 'Histoires cachées autour du centre-ville' : 'Hidden stories right next to your city';
document.getElementById('btnNext').textContent = IS_FR ? '🎯 Autre Secret Proche' : '🎯 Next Secret Spot';

const sel = document.getElementById('citySel');
let curCity = getCity(INIT_CITY_ID);
fillCitySelect(sel, curCity.id);
let spots = [];
let idx = 0;
let curSpot = null;

function fmtDist(m){ return m >= 1000 ? (m / 1000).toFixed(1) + ' km' : Math.round(m) + ' m'; }

async function showCurrentSpot(){
  if (!spots.length) return;
  const img = document.getElementById('wikiImg');
  const loader = document.getElementById('loader');
  const distOv = document.getElementById('distOv');
  loader.style.display = 'block';
  loader.textContent = IS_FR ? '📡 Chargement du secret...' : '📡 Loading hidden spot...';
  img.style.display = 'none';
  const wk = IS_FR ? 'fr' : 'en';

  // Try up to 3 candidates so we usually show one with a photo
  let best = null;
  for (let tries = 0; tries < Math.min(3, spots.length); tries++) {
    const cand = spots[(idx + tries) % spots.length];
    try {
      const r = await fetch('https://' + wk + '.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(cand.title));
      if (!r.ok) continue;
      const sum = await r.json();
      if (!best) best = { cand, sum, offset: tries };
      if (sum && sum.thumbnail && sum.thumbnail.source) {
        best = { cand, sum, offset: tries };
        break;
      }
    } catch (e) {}
  }
  if (!best) {
    loader.textContent = IS_FR ? 'Impossible de charger cet article.' : 'Could not load article.';
    return;
  }
  idx = (idx + best.offset) % spots.length;
  const { cand, sum } = best;
  curSpot = { title: sum.title || cand.title, dist: cand.dist, extract: sum.extract || '', url: (sum.content_urls && sum.content_urls.desktop && sum.content_urls.desktop.page) || '' };
  distOv.style.display = 'block';
  distOv.textContent = '📍 ' + fmtDist(cand.dist) + ' · ' + (IS_FR ? curCity.fr : curCity.en);
  document.getElementById('wikiTitle').textContent = curSpot.title;
  document.getElementById('wikiExtract').textContent = curSpot.extract || '';
  document.getElementById('wikiLink').href = curSpot.url || ('https://' + wk + '.wikipedia.org/wiki/' + encodeURIComponent(curSpot.title));
  document.getElementById('wikiIdx').textContent = (idx + 1) + ' / ' + spots.length;
  if (sum.thumbnail && sum.thumbnail.source) {
    img.onload = () => { loader.style.display = 'none'; img.style.display = 'block'; };
    img.src = sum.thumbnail.source;
  } else {
    loader.textContent = '🏛️ ' + curSpot.title;
  }
}

async function scanCity(cityId){
  curCity = getCity(cityId);
  spots = [];
  idx = 0;
  document.getElementById('wikiImg').style.display = 'none';
  document.getElementById('distOv').style.display = 'none';
  document.getElementById('loader').style.display = 'block';
  document.getElementById('loader').textContent = IS_FR ? '📡 Scan 5 km autour de ' + curCity.fr + '...' : '📡 Scanning 5 km around ' + curCity.en + '...';
  const wk = IS_FR ? 'fr' : 'en';
  try {
    const url = 'https://' + wk + '.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord=' +
      curCity.lat + '|' + curCity.lng + '&gsradius=5000&gslimit=35&format=json&origin=*';
    const r = await fetch(url);
    const d = await r.json();
    spots = ((d && d.query && d.query.geosearch) || []).filter(s => !/^(List of|Liste des|Arrondissement)/i.test(s.title));
    spots.sort(() => Math.random() - 0.5);
  } catch (e) {}
  if (!spots.length) {
    document.getElementById('loader').textContent = IS_FR ? 'Aucun lieu trouvé.' : 'No nearby entries found.';
    return;
  }
  showCurrentSpot();
}

sel.addEventListener('change', () => scanCity(sel.value));
document.getElementById('btnNext').addEventListener('click', () => { if (!spots.length) return; idx = (idx + 1) % spots.length; showCurrentSpot(); });
document.getElementById('btnShare').addEventListener('click', () => {
  if (!curSpot) return;
  const cName = IS_FR ? curCity.fr : curCity.en;
  const txt = IS_FR
    ? '📍 Secret découvert à ' + fmtDist(curSpot.dist) + ' du centre de ' + cName + ' : « ' + curSpot.title + ' » ! Vous connaissiez ?'
    : '📍 Hidden spot just ' + fmtDist(curSpot.dist) + ' from ' + cName + ' center: "' + curSpot.title + '"! Did you know this one?';
  shareToRemo({
    badge: '📍 WIKIPEDIA RADAR · ' + fmtDist(curSpot.dist),
    title: curSpot.title,
    subtitle: curCity.flag + ' ' + cName,
    summaryText: txt,
    accentColor: '#38bdf8'
  });
});
scanCity(curCity.id);
`;
  return _buildAppShell({ title: 'REMO Wikipedia Radar', accent: '#38bdf8', accent2: '#06b6d4', extraCss, bodyHtml, scriptJs });
}

/* ═══════════════════════════════════════════════════════════════════════════
   4. 🦜 WILDLIFE LIVE NEAR YOU (iNaturalist Research-Grade Live Observations)
   ═══════════════════════════════════════════════════════════════════════════ */
function buildWildlifeNearAppHtml() {
  const extraCss = `
.taxa-row{display:flex;gap:5px;flex-wrap:wrap;}
.tchip{border:1px solid var(--line);background:rgba(255,255,255,0.05);color:#cbd5e1;border-radius:99px;padding:4px 9px;font-size:10.5px;font-weight:800;cursor:pointer;}
.tchip.active{background:rgba(16,185,129,0.22);border-color:#34d399;color:#a7f3d0;}
.sp-name{font-weight:900;font-size:14.5px;color:#ecfdf5;}
.sp-sci{font-size:11px;color:#6ee7b7;font-style:italic;}
.sp-meta{font-size:11px;color:#94a3b8;}
`;
  const bodyHtml = `
<div class="app">
  <div class="top">
    <div class="brand">
      <div class="brand-ic">🦜</div>
      <div>
        <div class="brand-t" id="hdrTitle">Wildlife Live Near You</div>
        <div class="brand-s" id="hdrSub">Real recent sightings (iNaturalist)</div>
      </div>
    </div>
    <select id="citySel" class="sel" aria-label="City"></select>
  </div>
  <div class="card">
    <div class="taxa-row" id="taxaRow">
      <button class="tchip active" data-t="">🌍 All</button>
      <button class="tchip" data-t="Aves">🐦 Birds</button>
      <button class="tchip" data-t="Mammalia">🦊 Mammals</button>
      <button class="tchip" data-t="Insecta">🦋 Insects</button>
      <button class="tchip" data-t="Plantae">🌿 Plants</button>
    </div>
    <div class="img-box">
      <div class="loader" id="loader">🌿 Scanning recent wildlife sightings...</div>
      <img id="spImg" alt="" style="display:none;">
      <div class="badge-ov" id="spBadge" style="display:none;">🌿 Live</div>
    </div>
    <div>
      <div class="sp-name" id="spName">—</div>
      <div class="sp-sci" id="spSci"></div>
    </div>
    <div class="sp-meta" id="spMeta"></div>
    <div class="row">
      <button class="btn btn-pri" id="btnNext">🌿 Next Species</button>
      <button class="btn btn-sec" id="btnShare" title="Share">💬</button>
    </div>
  </div>
</div>`;
  const scriptJs = `
document.getElementById('hdrTitle').textContent = IS_FR ? 'Faune & Flore en Direct' : 'Wildlife Live Near You';
document.getElementById('hdrSub').textContent = IS_FR ? 'Observations réelles récentes (iNaturalist)' : 'Real recent sightings (iNaturalist)';
document.getElementById('btnNext').textContent = IS_FR ? '🌿 Espèce Suivante' : '🌿 Next Species';
if (IS_FR) {
  const lbls = { '': '🌍 Tout', Aves: '🐦 Oiseaux', Mammalia: '🦊 Mammifères', Insecta: '🦋 Insectes', Plantae: '🌿 Plantes' };
  document.querySelectorAll('#taxaRow .tchip').forEach(b => { b.textContent = lbls[b.dataset.t] || b.textContent; });
}

const sel = document.getElementById('citySel');
let curCity = getCity(INIT_CITY_ID);
fillCitySelect(sel, curCity.id);
let taxon = '';
let obs = [];
let idx = 0;

function renderObs(){
  const img = document.getElementById('spImg');
  const loader = document.getElementById('loader');
  const badge = document.getElementById('spBadge');
  if (!obs.length) {
    img.style.display = 'none';
    badge.style.display = 'none';
    loader.style.display = 'block';
    loader.textContent = IS_FR ? 'Aucune observation récente dans ce filtre.' : 'No recent sightings in this filter.';
    return;
  }
  const o = obs[idx % obs.length];
  const tx = o.taxon || {};
  const photo = (o.photos && o.photos[0] && o.photos[0].url) ? o.photos[0].url.replace('square', 'medium') : '';
  const common = tx.preferred_common_name || tx.name || 'Wild Species';
  const sci = tx.name || '';
  const dt = o.observed_on || '';
  const place = o.place_guess || (IS_FR ? curCity.fr : curCity.en);

  loader.style.display = 'block';
  loader.textContent = '🌿 Loading photo...';
  img.onload = () => { loader.style.display = 'none'; img.style.display = 'block'; };
  img.src = photo;
  badge.style.display = 'block';
  badge.textContent = '🗓️ ' + (dt || 'Recent') + ' · ' + ((idx % obs.length) + 1) + '/' + obs.length;
  document.getElementById('spName').textContent = common;
  document.getElementById('spSci').textContent = sci;
  document.getElementById('spMeta').textContent = '📍 ' + place.slice(0, 72);
}

async function loadWildlife(){
  obs = [];
  idx = 0;
  document.getElementById('spImg').style.display = 'none';
  document.getElementById('spBadge').style.display = 'none';
  document.getElementById('loader').style.display = 'block';
  document.getElementById('loader').textContent = IS_FR ? '🌿 Recherche autour de ' + curCity.fr + '...' : '🌿 Checking sightings near ' + curCity.en + '...';
  try {
    let url = 'https://api.inaturalist.org/v1/observations?lat=' + curCity.lat + '&lng=' + curCity.lng +
      '&radius=28&photos=true&quality_grade=research&per_page=24&order_by=observed_on&order=desc&locale=' + LANG;
    if (taxon) url += '&iconic_taxa=' + encodeURIComponent(taxon);
    const r = await fetch(url);
    const d = await r.json();
    const seen = new Set();
    obs = (d.results || []).filter(o => {
      if (!o.photos || !o.photos[0] || !o.taxon) return false;
      if (seen.has(o.taxon.id)) return false;
      seen.add(o.taxon.id);
      return true;
    });
  } catch (e) {}
  renderObs();
}

sel.addEventListener('change', () => { curCity = getCity(sel.value); loadWildlife(); });
document.querySelectorAll('#taxaRow .tchip').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#taxaRow .tchip').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    taxon = btn.dataset.t || '';
    loadWildlife();
  });
});
document.getElementById('btnNext').addEventListener('click', () => { if (!obs.length) return; idx = (idx + 1) % obs.length; renderObs(); });
document.getElementById('btnShare').addEventListener('click', () => {
  const o = obs[idx % Math.max(1, obs.length)];
  if (!o) return;
  const common = (o.taxon && (o.taxon.preferred_common_name || o.taxon.name)) || 'Wildlife';
  const cName = IS_FR ? curCity.fr : curCity.en;
  const txt = IS_FR
    ? '🦜 Vu récemment dans la nature près de ' + cName + ' : ' + common + ' (' + (o.observed_on || 'récent') + ') ! 🌿'
    : '🦜 Spotted recently in the wild near ' + cName + ': ' + common + ' (' + (o.observed_on || 'recent') + ')! 🌿';
  shareToRemo({
    badge: '🦜 WILDLIFE LIVE · ' + cName.toUpperCase(),
    title: common,
    subtitle: (o.taxon && o.taxon.name) || cName,
    summaryText: txt,
    accentColor: '#10b981'
  });
});
loadWildlife();
`;
  return _buildAppShell({ title: 'REMO Wildlife Live Near You', accent: '#34d399', accent2: '#0ea5e9', extraCss, bodyHtml, scriptJs });
}

/* ═══════════════════════════════════════════════════════════════════════════
   5. 🗣️ SLANG & UNTRANSLATABLE WORD OF THE DAY (Web Speech + 1-Click Quiz)
   ═══════════════════════════════════════════════════════════════════════════ */
function buildSlangWordAppHtml() {
  const extraCss = `
.word-hero{text-align:center;padding:12px 10px;border-radius:14px;background:linear-gradient(135deg,rgba(236,72,153,0.16),rgba(99,102,241,0.18));border:1px solid rgba(244,114,182,0.35);}
.word-big{font-size:26px;font-weight:900;letter-spacing:0.3px;color:#fff;margin:4px 0;}
.word-ph{font-size:12px;color:#f9a8d4;font-weight:700;}
.quiz-q{font-size:11.5px;font-weight:800;color:#cbd5e1;text-align:center;}
.qlist{display:flex;flex-direction:column;gap:6px;}
.qbtn{width:100%;text-align:left;padding:9px 11px;border-radius:11px;border:1px solid var(--line);background:rgba(15,23,42,0.75);color:#f1f5f9;font-size:12px;font-weight:700;cursor:pointer;transition:.15s;}
.qbtn:hover{border-color:#f472b6;}
.qbtn.ok{background:rgba(16,185,129,0.22);border-color:#34d399;color:#a7f3d0;}
.qbtn.bad{background:rgba(244,63,94,0.2);border-color:#fb7185;color:#fecdd3;}
.note-box{background:rgba(2,6,23,0.62);border:1px solid rgba(56,189,248,0.28);border-radius:11px;padding:9px 10px;font-size:11.5px;color:#e2e8f0;line-height:1.4;display:none;}
`;
  const bodyHtml = `
<div class="app">
  <div class="top">
    <div class="brand">
      <div class="brand-ic">🗣️</div>
      <div>
        <div class="brand-t" id="hdrTitle">Word of the Day</div>
        <div class="brand-s" id="hdrSub">Slang &amp; untranslatable city expressions</div>
      </div>
    </div>
    <span class="pill gold" id="scorePill">🔥 0</span>
  </div>
  <div class="card">
    <div class="word-hero">
      <div class="pill" id="cityPill" style="margin:0 auto;">⚜️ Montréal</div>
      <div class="word-big" id="wordTxt">Tiguidou</div>
      <div class="word-ph" id="wordPh">/ti.gi.du/</div>
      <button class="btn btn-sec" id="btnSpeak" style="margin-top:8px;padding:6px 12px;font-size:11.5px;">🔊 Listen</button>
    </div>
    <div class="quiz-q" id="quizQ">Guess the real meaning:</div>
    <div class="qlist" id="qList"></div>
    <div class="note-box" id="noteBox"></div>
    <div class="row">
      <button class="btn btn-pri" id="btnNext">🎲 Another City</button>
      <button class="btn btn-sec" id="btnShare" title="Share">💬</button>
    </div>
  </div>
</div>`;
  const scriptJs = `
const WORDS = [
  { city:'⚜️ Montréal', loc:'fr-CA', w:'Tiguidou', ph:'tee-gee-doo', en:'All good / Awesome / Sorted!', fr:'Tout est parfait / Impeccable !', dEn:['A tiny winter hat','A late-night snack'], dFr:['Un bonnet d’hiver','Une collation de minuit'], nEn:'Classic warm Québécois expression used daily across Montréal.', nFr:'Expression québécoise chaleureuse utilisée tous les jours à Montréal.' },
  { city:'⚜️ Montréal', loc:'fr-CA', w:'Faire frette', ph:'fair fret', en:'To be freezing icy cold outside', fr:'Il fait un froid glacial dehors', dEn:['To play guitar fast','To hurry to work'], dFr:['Jouer de la guitare vite','Courir au travail'], nEn:'Essential Montréal winter vocabulary when temperatures drop below -20°C.', nFr:'Indispensable de l’hiver montréalais dès que le mercure chute sous -20°C.' },
  { city:'🇲🇩 Chișinău · 🇷🇴 București', loc:'ro-RO', w:'Dor', ph:'dohr', en:'Deep nostalgic longing for someone or home', fr:'Nostalgie profonde mêlée d’amour et de manque', dEn:['Golden sunrise','Loud street party'], dFr:['Lever de soleil doré','Fête bruyante'], nEn:'One of the most famous untranslatable Romanian words — a bittersweet ache of love and distance.', nFr:'L’un des mots roumains intraduisibles les plus célèbres, entre tendresse et nostalgie.' },
  { city:'🏯 Tokyo', loc:'ja-JP', w:'Komorebi (木漏れ日)', ph:'ko-mo-reh-bee', en:'Sunlight filtering through tree leaves', fr:'La lumière du soleil filtrant à travers les feuilles', dEn:['Midnight ramen craving','Neon rain puddle'], dFr:['Envie de ramen à minuit','Flaque de pluie néon'], nEn:'Japanese captures fleeting moments of beauty in a single poetic noun.', nFr:'Le japonais capture la beauté éphémère de la nature en un seul mot poétique.' },
  { city:'🗼 Paris', loc:'fr-FR', w:'Flâner', ph:'flah-nay', en:'To stroll aimlessly just to soak up the city', fr:'Se promener sans but précis pour savourer la ville', dEn:['To bake a custard pie','To skip the metro line'], dFr:['Cuisiner un flan','Sauter le tourniquet'], nEn:'The quintessential Parisian art of wandering along the Seine with zero rush.', nFr:'L’art parisien par excellence de déambuler sans montre ni destination.' },
  { city:'🎭 Rio de Janeiro', loc:'pt-BR', w:'Cafuné', ph:'kah-foo-neh', en:'Tenderly running fingers through someone’s hair', fr:'Passer tendrement ses doigts dans les cheveux de quelqu’un', dEn:['Strong espresso shot','Beach sunset dance'], dFr:['Un café très serré','Une danse au coucher du soleil'], nEn:'A warm Brazilian Portuguese word for pure affection.', nFr:'Un mot brésilien rempli de douceur et d’affection.' },
  { city:'⚡ Seoul', loc:'ko-KR', w:'Nunchi (눈치)', ph:'noon-chee', en:'Subtle social intuition to read the room', fr:'L’art subtil de ressentir l’ambiance et les non-dits', dEn:['Spicy midnight noodles','Snowy mountain view'], dFr:['Nouilles épicées','Vue sur la neige'], nEn:'Korean superpower for harmony, empathy, and effortless social grace.', nFr:'Super-pouvoir coréen d’empathie et d’intelligence sociale.' },
  { city:'🚲 Amsterdam', loc:'nl-NL', w:'Gezelligheid', ph:'heh-zel-ikh-hite', en:'Cozy, warm togetherness with good company', fr:'Atmosphère chaleureuse et conviviale entre amis', dEn:['Fast bicycle lane','Canal bridge toll'], dFr:['Piste cyclable rapide','Péage de canal'], nEn:'The heart of Dutch culture — candles, laughter, and feeling right at home.', nFr:'Le cœur de la culture néerlandaise : bougies, rires et bien-être partagé.' },
  { city:'☀️ Barcelona', loc:'es-ES', w:'Sobremesa', ph:'soh-breh-meh-sah', en:'Lingering at the table chatting long after dinner', fr:'S’attarder à table à discuter longtemps après le repas', dEn:['A marble tablecloth','Evening street market'], dFr:['Une nappe en marbre','Marché nocturne'], nEn:'In Spain, the best part of the meal begins after the plates are empty.', nFr:'En Espagne, le meilleur moment du repas commence une fois les assiettes vides.' },
  { city:'🎧 Berlin', loc:'de-DE', w:'Feierabend', ph:'fye-er-ah-bent', en:'That sacred peaceful joy right after work ends', fr:'La joie libératrice de la fin de journée de travail', dEn:['Bonfire festival','Midnight train'], dFr:['Festival de feu','Train de minuit'], nEn:'Literally "celebration evening" — the German ritual of fully switching off.', nFr:'Littéralement « soirée de fête » : l’art allemand de déconnecter après le boulot.' },
  { city:'🏛️ Rome', loc:'it-IT', w:'Sprezzatura', ph:'spret-sah-too-rah', en:'Effortless elegance that looks completely natural', fr:'L’élégance désinvolte qui paraît totalement naturelle', dEn:['Sparkling citrus soda','Ancient marble arch'], dFr:['Soda aux agrumes','Arche en marbre'], nEn:'Coined in Renaissance Italy — mastering style without ever seeming to try.', nFr:'Né en Italie à la Renaissance : la maîtrise du style sans effort apparent.' },
  { city:'🏰 London', loc:'en-GB', w:'Chuffed', ph:'chuhft', en:'Really pleased and quietly proud', fr:'Super content et agréablement ravi', dEn:['Exhausted from rain','Lost in the Tube'], dFr:['Épuisé par la pluie','Perdu dans le métro'], nEn:'Quintessential British slang: "Proper chuffed with that!"', nFr:'Argot britannique classique pour exprimer une vraie joie simple.' },
  { city:'🏯 Tokyo', loc:'ja-JP', w:'Tsundoku (積ん読)', ph:'tsoon-doh-koo', en:'Buying books and letting them pile up unread', fr:'Acheter des livres et les empiler sans les lire', dEn:['Origami crane art','Quiet tea ceremony'], dFr:['Art de l’origami','Cérémonie du thé'], nEn:'Every book lover around the world immediately relates to this Tokyo gem.', nFr:'Tous les amoureux des livres se reconnaissent instantanément dans ce mot.' },
  { city:'🕌 Istanbul', loc:'tr-TR', w:'Keyif', ph:'keh-yeef', en:'Pure relaxed enjoyment of the present moment', fr:'Plaisir paisible de savourer pleinement l’instant', dEn:['Strong Turkish spice','Bosphorus ferry bell'], dFr:['Épice turque','Cloche du ferry'], nEn:'Sipping tea by the Bosphorus with zero worries — pure keyif.', nFr:'Siroter un thé face au Bosphore sans aucun souci : le pur keyif.' },
  { city:'🚋 Lisbon', loc:'pt-PT', w:'Desenrascanço', ph:'deh-zen-rash-kan-soo', en:'Cleverly improvising a solution out of nowhere', fr:'L’art ingénieux de se débrouiller avec les moyens du bord', dEn:['Steep tram hill','Atlantic sea breeze'], dFr:['Colline de tramway','Brise de l’Atlantique'], nEn:'Portuguese art of MacGyver-style creative problem solving.', nFr:'L’art portugais de trouver une solution brillante à la dernière seconde.' },
  { city:'⚜️ Montréal', loc:'fr-CA', w:'Placoter', ph:'plah-koh-teh', en:'To chat happily and gossip for hours', fr:'Bavarder joyeusement pendant des heures', dEn:['To shovel fresh snow','To skate on a pond'], dFr:['Pelleter la neige','Patiner sur un lac'], nEn:'Grab a coffee in the Plateau and placoter all afternoon!', nFr:'Prendre un café sur le Plateau et placoter tout l’après-midi !' }
];

document.getElementById('hdrTitle').textContent = IS_FR ? 'Mot du Jour · Villes du Monde' : 'World City Word of the Day';
document.getElementById('hdrSub').textContent = IS_FR ? 'Argot & mots intraduisibles locaux' : 'Local slang & untranslatable expressions';
document.getElementById('btnSpeak').textContent = IS_FR ? '🔊 Prononciation' : '🔊 Listen';
document.getElementById('quizQ').textContent = IS_FR ? 'Devinez la vraie signification :' : 'Guess the real meaning:';
document.getElementById('btnNext').textContent = IS_FR ? '🎲 Autre Ville' : '🎲 Another City';

const dayNum = Math.floor(Date.now() / 86400000);
let idx = dayNum % WORDS.length;
let streak = 0;
let answered = false;

function speakCurrent(){
  const it = WORDS[idx];
  try {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(it.w.replace(/\\s*\\([^)]*\\)/g, ''));
    u.lang = it.loc || 'en-US';
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
  } catch (e) {}
}

function renderWord(){
  answered = false;
  const it = WORDS[idx];
  document.getElementById('cityPill').textContent = it.city;
  document.getElementById('wordTxt').textContent = it.w;
  document.getElementById('wordPh').textContent = '/' + it.ph + '/';
  const note = document.getElementById('noteBox');
  note.style.display = 'none';
  note.textContent = '';

  const correct = IS_FR ? it.fr : it.en;
  const distractors = IS_FR ? it.dFr : it.dEn;
  const opts = [
    { txt: correct, ok: true },
    { txt: distractors[0], ok: false },
    { txt: distractors[1], ok: false }
  ].sort(() => Math.random() - 0.5);

  const list = document.getElementById('qList');
  list.innerHTML = '';
  opts.forEach(o => {
    const b = document.createElement('button');
    b.className = 'qbtn';
    b.textContent = o.txt;
    b.onclick = () => {
      if (answered) return;
      answered = true;
      if (o.ok) {
        streak++;
        b.classList.add('ok');
      } else {
        streak = 0;
        b.classList.add('bad');
        list.querySelectorAll('.qbtn').forEach(el => { if (el.textContent === correct) el.classList.add('ok'); });
      }
      document.getElementById('scorePill').textContent = '🔥 ' + streak;
      note.style.display = 'block';
      note.textContent = '✨ ' + (IS_FR ? it.nFr : it.nEn);
    };
    list.appendChild(b);
  });
}

document.getElementById('btnSpeak').addEventListener('click', speakCurrent);
document.getElementById('btnNext').addEventListener('click', () => { idx = (idx + 1) % WORDS.length; renderWord(); });
document.getElementById('btnShare').addEventListener('click', () => {
  const it = WORDS[idx];
  const meaning = IS_FR ? it.fr : it.en;
  const txt = IS_FR
    ? '🗣️ Mot du jour (' + it.city + ') : « ' + it.w + ' » = ' + meaning + ' ! Quel est le meilleur mot de votre ville ?'
    : '🗣️ Word of the day (' + it.city + '): "' + it.w + '" = ' + meaning + '! What is the best local word in your city?';
  shareToRemo({
    badge: '🗣️ WORD OF THE DAY · ' + it.city,
    title: it.w,
    subtitle: '/' + it.ph + '/',
    summaryText: txt,
    accentColor: '#ec4899'
  });
});
renderWord();
`;
  return _buildAppShell({ title: 'REMO Word of the Day', accent: '#f472b6', accent2: '#8b5cf6', extraCss, bodyHtml, scriptJs });
}

/* ═══════════════════════════════════════════════════════════════════════════
   6. ☕ PURCHASING POWER DUEL ($20 IN CITY A VS CITY B — Live FX incl. MDL!)
   ═══════════════════════════════════════════════════════════════════════════ */
function buildPowerDuelAppHtml() {
  const extraCss = `
.duel-pick{display:grid;grid-template-columns:1fr auto 1fr;gap:6px;align-items:center;}
.duel-pick .sel{max-width:100%;width:100%;}
.vs-dot{font-weight:900;font-size:11px;color:#fbbf24;background:rgba(251,191,36,0.16);border:1px solid rgba(251,191,36,0.4);border-radius:99px;padding:3px 7px;}
.amt-row{display:flex;gap:5px;}
.amt-b{flex:1;padding:6px;border-radius:10px;border:1px solid var(--line);background:rgba(255,255,255,0.05);color:#cbd5e1;font-weight:900;font-size:11.5px;cursor:pointer;}
.amt-b.active{background:linear-gradient(135deg,#fbbf24,#f59e0b);color:#050816;border-color:#fde68a;}
.metric{display:flex;flex-direction:column;gap:4px;}
.m-top{display:flex;justify-content:space-between;font-size:11.5px;font-weight:800;}
.bar-wrap{display:grid;grid-template-columns:1fr 1fr;gap:6px;height:10px;}
.bar-bg{background:rgba(255,255,255,0.08);border-radius:99px;overflow:hidden;position:relative;}
.bar-a{height:100%;background:linear-gradient(90deg,#38bdf8,#818cf8);border-radius:99px;transition:width .35s;}
.bar-b{height:100%;background:linear-gradient(90deg,#fbbf24,#f97316);border-radius:99px;transition:width .35s;}
.verdict{background:rgba(16,185,129,0.12);border:1px solid rgba(52,211,153,0.35);border-radius:11px;padding:8px 10px;font-size:11.5px;font-weight:800;color:#a7f3d0;text-align:center;}
`;
  const bodyHtml = `
<div class="app">
  <div class="top">
    <div class="brand">
      <div class="brand-ic">☕</div>
      <div>
        <div class="brand-t" id="hdrTitle">Purchasing Power Duel</div>
        <div class="brand-s" id="hdrSub">Live FX · What does $20 buy?</div>
      </div>
    </div>
    <span class="pill" id="fxStatus">LIVE FX</span>
  </div>
  <div class="card">
    <div class="duel-pick">
      <select id="cityA" class="sel" aria-label="City A"></select>
      <span class="vs-dot">VS</span>
      <select id="cityB" class="sel" aria-label="City B"></select>
    </div>
    <div class="amt-row" id="amtRow">
      <button class="amt-b" data-v="10">$10</button>
      <button class="amt-b active" data-v="20">$20</button>
      <button class="amt-b" data-v="50">$50</button>
      <button class="amt-b" data-v="100">$100</button>
    </div>
    <div id="fxConvert" class="muted" style="text-align:center;font-weight:700;color:#7dd3fc;"></div>
    <div id="metricsBox" style="display:flex;flex-direction:column;gap:8px;flex:1;justify-content:center;"></div>
    <div class="verdict" id="verdict">—</div>
    <div class="row">
      <button class="btn btn-pri" id="btnShare">💬 Share Duel Result</button>
      <button class="btn btn-sec" id="btnSwap" title="Swap">⇄</button>
    </div>
  </div>
</div>`;
  const scriptJs = `
const FALLBACK_RATES = { USD:1, CAD:1.39, EUR:0.93, MDL:17.8, RON:4.62, JPY:153, GBP:0.79, AED:3.67, KRW:1380, CHF:0.88, SGD:1.34, AUD:1.54, BRL:5.75, TRY:34.2, EGP:49.1 };
let rates = Object.assign({}, FALLBACK_RATES);
let amountUsd = 20;

document.getElementById('hdrTitle').textContent = IS_FR ? 'Duel Pouvoir d’Achat' : 'Purchasing Power Duel';
document.getElementById('hdrSub').textContent = IS_FR ? 'Taux en direct · Qu’achète-t-on avec 20$ ?' : 'Live FX · What does $20 buy?';
document.getElementById('btnShare').textContent = IS_FR ? '💬 Partager ce Duel' : '💬 Share Duel Result';

const selA = document.getElementById('cityA');
const selB = document.getElementById('cityB');
const defaultA = getCity(INIT_CITY_ID).id;
const defaultB = defaultA === 'chisinau' ? 'montreal' : (defaultA === 'paris' ? 'tokyo' : 'chisinau');
fillCitySelect(selA, defaultA);
fillCitySelect(selB, defaultB);

function fmt(n){ return n >= 10 ? n.toFixed(0) : n.toFixed(1); }

function renderDuel(){
  const a = getCity(selA.value);
  const b = getCity(selB.value);
  const locA = amountUsd * (rates[a.cur] || 1);
  const locB = amountUsd * (rates[b.cur] || 1);
  document.getElementById('fxConvert').textContent =
    '$' + amountUsd + ' = ' + Math.round(locA).toLocaleString() + ' ' + a.cur + ' (' + (IS_FR ? a.fr : a.en) + ')  ⇄  ' +
    Math.round(locB).toLocaleString() + ' ' + b.cur + ' (' + (IS_FR ? b.fr : b.en) + ')';

  const rows = [
    { ic: '☕', lbl: IS_FR ? 'Cafés Espresso' : 'Espresso Coffees', va: locA / a.c, vb: locB / b.c },
    { ic: '🚇', lbl: IS_FR ? 'Billets Métro / Bus' : 'Metro / Bus Rides', va: locA / a.m, vb: locB / b.m },
    { ic: '🍽️', lbl: IS_FR ? 'Repas Street-Food' : 'Casual Meals', va: locA / a.f, vb: locB / b.f },
    { ic: '🏠', lbl: IS_FR ? 'Jours de Loyer (1BR)' : 'Days of Rent (1BR)', va: locA / a.r, vb: locB / b.r }
  ];

  const box = document.getElementById('metricsBox');
  box.innerHTML = rows.map(r => {
    const mx = Math.max(r.va, r.vb, 0.1);
    const pa = Math.max(6, Math.round((r.va / mx) * 100));
    const pb = Math.max(6, Math.round((r.vb / mx) * 100));
    return '<div class="metric">' +
      '<div class="m-top"><span style="color:#7dd3fc;">' + a.flag + ' ' + fmt(r.va) + '</span><span>' + r.ic + ' ' + r.lbl + '</span><span style="color:#fde68a;">' + fmt(r.vb) + ' ' + b.flag + '</span></div>' +
      '<div class="bar-wrap"><div class="bar-bg"><div class="bar-a" style="width:' + pa + '%;"></div></div><div class="bar-bg"><div class="bar-b" style="width:' + pb + '%;"></div></div></div>' +
    '</div>';
  }).join('');

  const ratio = (locB / b.c) / Math.max(0.01, locA / a.c);
  const aName = IS_FR ? a.fr : a.en;
  const bName = IS_FR ? b.fr : b.en;
  const vEl = document.getElementById('verdict');
  if (ratio >= 1.15) {
    vEl.textContent = IS_FR
      ? '🔥 $' + amountUsd + ' offre ' + ratio.toFixed(1) + '× plus de cafés à ' + bName + ' qu’à ' + aName + ' !'
      : '🔥 $' + amountUsd + ' buys ' + ratio.toFixed(1) + '× more coffees in ' + bName + ' than in ' + aName + '!';
  } else if (ratio <= 0.87) {
    vEl.textContent = IS_FR
      ? '🔥 $' + amountUsd + ' offre ' + (1 / ratio).toFixed(1) + '× plus de cafés à ' + aName + ' qu’à ' + bName + ' !'
      : '🔥 $' + amountUsd + ' buys ' + (1 / ratio).toFixed(1) + '× more coffees in ' + aName + ' than in ' + bName + '!';
  } else {
    vEl.textContent = IS_FR
      ? '⚖️ Pouvoir d’achat presque identique entre ' + aName + ' et ' + bName + ' !'
      : '⚖️ Nearly identical coffee purchasing power between ' + aName + ' & ' + bName + '!';
  }
}

fetch('https://open.er-api.com/v6/latest/USD')
  .then(r => r.json())
  .then(d => { if (d && d.rates) { rates = Object.assign(rates, d.rates); document.getElementById('fxStatus').textContent = 'LIVE FX ✓'; renderDuel(); } })
  .catch(() => {});

selA.addEventListener('change', renderDuel);
selB.addEventListener('change', renderDuel);
document.querySelectorAll('#amtRow .amt-b').forEach(b => {
  b.addEventListener('click', () => {
    document.querySelectorAll('#amtRow .amt-b').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    amountUsd = Number(b.dataset.v || 20);
    renderDuel();
  });
});
document.getElementById('btnSwap').addEventListener('click', () => {
  const t = selA.value; selA.value = selB.value; selB.value = t; renderDuel();
});
document.getElementById('btnShare').addEventListener('click', () => {
  const a = getCity(selA.value), b = getCity(selB.value);
  const cA = fmt((amountUsd * (rates[a.cur] || 1)) / a.c);
  const cB = fmt((amountUsd * (rates[b.cur] || 1)) / b.c);
  const aN = IS_FR ? a.fr : a.en, bN = IS_FR ? b.fr : b.en;
  const txt = IS_FR
    ? '☕ Duel $' + amountUsd + ' : ' + cA + ' cafés à ' + aN + ' ' + a.flag + ' vs ' + cB + ' cafés à ' + bN + ' ' + b.flag + ' ! Combien coûte un café chez vous ?'
    : '☕ $' + amountUsd + ' Duel: ' + cA + ' coffees in ' + aN + ' ' + a.flag + ' vs ' + cB + ' coffees in ' + bN + ' ' + b.flag + '! How much is a coffee in your city?';
  shareToRemo({
    badge: '☕ POWER DUEL · $' + amountUsd,
    title: a.flag + ' ' + aN + ' vs ' + b.flag + ' ' + bN,
    subtitle: document.getElementById('verdict').textContent,
    summaryText: txt,
    accentColor: '#fbbf24'
  });
});
renderDuel();
`;
  return _buildAppShell({ title: 'REMO Purchasing Power Duel', accent: '#fbbf24', accent2: '#38bdf8', extraCss, bodyHtml, scriptJs });
}

/* ═══════════════════════════════════════════════════════════════════════════
   7. 🎧 WEATHER-SYNCED AMBIENT STUDIO (Open-Meteo + Procedural Web Audio API)
   ═══════════════════════════════════════════════════════════════════════════ */
function buildAmbientStudioAppHtml() {
  const extraCss = `
.viz-box{position:relative;height:104px;border-radius:14px;overflow:hidden;background:radial-gradient(circle at center,rgba(56,189,248,0.18),#040814);border:1px solid rgba(56,189,248,0.3);}
.viz-box canvas{width:100%;height:100%;display:block;}
.wx-ov{position:absolute;inset:8px 10px auto 10px;display:flex;justify-content:space-between;align-items:center;font-size:11.5px;font-weight:800;}
.sliders{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
.sl-item{background:rgba(255,255,255,0.04);border:1px solid var(--line);border-radius:11px;padding:7px 9px;}
.sl-lbl{display:flex;justify-content:space-between;font-size:11px;font-weight:800;margin-bottom:4px;color:#cbd5e1;}
.sl-item input[type=range]{width:100%;accent-color:#38bdf8;cursor:pointer;}
.pomo-pill{font-family:monospace;font-weight:900;font-size:12px;color:#fde68a;background:rgba(251,191,36,0.14);border:1px solid rgba(251,191,36,0.38);border-radius:10px;padding:6px 10px;cursor:pointer;}
`;
  const bodyHtml = `
<div class="app">
  <div class="top">
    <div class="brand">
      <div class="brand-ic">🎧</div>
      <div>
        <div class="brand-t" id="hdrTitle">Weather Ambient Studio</div>
        <div class="brand-s" id="hdrSub">Synced to live city weather · 0% copyright</div>
      </div>
    </div>
    <select id="citySel" class="sel" aria-label="City"></select>
  </div>
  <div class="card">
    <div class="viz-box">
      <canvas id="vizCv" width="460" height="104"></canvas>
      <div class="wx-ov">
        <span id="wxLabel">🌤️ Loading weather...</span>
        <span class="pill" id="presetPill">AUTO SYNC</span>
      </div>
    </div>
    <div class="sliders">
      <div class="sl-item"><div class="sl-lbl"><span id="lRain">🌧️ Rain</span><span id="vRain">60%</span></div><input id="sRain" type="range" min="0" max="100" value="60"></div>
      <div class="sl-item"><div class="sl-lbl"><span id="lWind">🌬️ Storm/Wind</span><span id="vWind">30%</span></div><input id="sWind" type="range" min="0" max="100" value="30"></div>
      <div class="sl-item"><div class="sl-lbl"><span id="lPad">🎹 Lo-Fi Pad</span><span id="vPad">55%</span></div><input id="sPad" type="range" min="0" max="100" value="55"></div>
      <div class="sl-item"><div class="sl-lbl"><span id="lCafe">☕ Café Warmth</span><span id="vCafe">35%</span></div><input id="sCafe" type="range" min="0" max="100" value="35"></div>
    </div>
    <div class="row">
      <button class="btn btn-pri" id="btnPlay">▶️ Start Weather Mix</button>
      <button class="pomo-pill" id="btnPomo" title="25m Focus Timer">⏱️ 25:00</button>
      <button class="btn btn-sec" id="btnShare" title="Share">💬</button>
    </div>
  </div>
</div>`;
  const scriptJs = `
document.getElementById('hdrTitle').textContent = IS_FR ? 'Studio Ambiance Météo' : 'Weather Ambient Studio';
document.getElementById('hdrSub').textContent = IS_FR ? 'Synchronisé à la météo réelle de la ville' : 'Synced to live city weather · Focus & Chill';
document.getElementById('lRain').textContent = IS_FR ? '🌧️ Pluie' : '🌧️ Rain';
document.getElementById('lWind').textContent = IS_FR ? '🌬️ Orage/Vent' : '🌬️ Storm/Wind';
document.getElementById('lPad').textContent = IS_FR ? '🎹 Pad Lo-Fi' : '🎹 Lo-Fi Pad';
document.getElementById('lCafe').textContent = IS_FR ? '☕ Café / Vinyle' : '☕ Café Warmth';

const sel = document.getElementById('citySel');
let curCity = getCity(INIT_CITY_ID);
fillCitySelect(sel, curCity.id);

let ac = null, masterGain = null, gains = {}, playing = false, wxDesc = '', presetName = 'Focus Mix';
let pomoSec = 25 * 60, pomoInt = null;

function notifyParentAudio(on){
  if (typeof window.remoNotifyAudio === 'function') window.remoNotifyAudio(on);
  else try { parent.postMessage({ type: 'REMO_APP_AUDIO_ACTIVE', postId: CTX.postId || '', active: Boolean(on) }, '*'); } catch (e) {}
}

function createNoiseBuffer(ctx, pink){
  const len = ctx.sampleRate * 3;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const out = buf.getChannelData(0);
  let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
  for (let i = 0; i < len; i++) {
    const white = Math.random() * 2 - 1;
    if (!pink) { out[i] = white * 0.4; continue; }
    b0 = 0.99886*b0 + white*0.0555179;
    b1 = 0.99332*b1 + white*0.0750759;
    b2 = 0.96900*b2 + white*0.1538520;
    b3 = 0.86650*b3 + white*0.3104856;
    b4 = 0.55000*b4 + white*0.5329522;
    b5 = -0.7616*b5 - white*0.0168980;
    out[i] = (b0+b1+b2+b3+b4+b5+b6+white*0.5362)*0.05;
    b6 = white*0.115926;
  }
  return buf;
}

function initAudio(){
  if (ac) return;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  ac = new AudioCtx();
  masterGain = ac.createGain();
  masterGain.gain.value = 0.75;
  masterGain.connect(ac.destination);

  // 1. Rain (filtered pink noise)
  const rainSrc = ac.createBufferSource();
  rainSrc.buffer = createNoiseBuffer(ac, true);
  rainSrc.loop = true;
  const rainFlt = ac.createBiquadFilter();
  rainFlt.type = 'bandpass'; rainFlt.frequency.value = 1350; rainFlt.Q.value = 0.5;
  gains.rain = ac.createGain();
  rainSrc.connect(rainFlt); rainFlt.connect(gains.rain); gains.rain.connect(masterGain);
  rainSrc.start();

  // 2. Wind / Low Storm rumble
  const windSrc = ac.createBufferSource();
  windSrc.buffer = createNoiseBuffer(ac, true);
  windSrc.loop = true;
  const windFlt = ac.createBiquadFilter();
  windFlt.type = 'lowpass'; windFlt.frequency.value = 210;
  gains.wind = ac.createGain();
  windSrc.connect(windFlt); windFlt.connect(gains.wind); gains.wind.connect(masterGain);
  windSrc.start();

  // 3. Warm Lo-Fi Ambient Chord Pad (Cmaj9)
  gains.pad = ac.createGain();
  const padFlt = ac.createBiquadFilter();
  padFlt.type = 'lowpass'; padFlt.frequency.value = 540;
  gains.pad.connect(padFlt); padFlt.connect(masterGain);
  [130.81, 164.81, 196.00, 246.94, 293.66].forEach((freq, i) => {
    const osc = ac.createOscillator();
    osc.type = i % 2 === 0 ? 'sine' : 'triangle';
    osc.frequency.value = freq;
    const og = ac.createGain(); og.gain.value = 0.045;
    osc.connect(og); og.connect(gains.pad);
    osc.start();
  });

  // 4. Cozy Café Warmth (soft low-mid murmur)
  const cafeSrc = ac.createBufferSource();
  cafeSrc.buffer = createNoiseBuffer(ac, true);
  cafeSrc.loop = true;
  const cafeFlt = ac.createBiquadFilter();
  cafeFlt.type = 'bandpass'; cafeFlt.frequency.value = 460; cafeFlt.Q.value = 1.2;
  gains.cafe = ac.createGain();
  cafeSrc.connect(cafeFlt); cafeFlt.connect(gains.cafe); gains.cafe.connect(masterGain);
  cafeSrc.start();
  applySliders();
}

function applySliders(){
  const rv = Number(document.getElementById('sRain').value);
  const wv = Number(document.getElementById('sWind').value);
  const pv = Number(document.getElementById('sPad').value);
  const cv = Number(document.getElementById('sCafe').value);
  document.getElementById('vRain').textContent = rv + '%';
  document.getElementById('vWind').textContent = wv + '%';
  document.getElementById('vPad').textContent = pv + '%';
  document.getElementById('vCafe').textContent = cv + '%';
  if (!ac) return;
  const now = ac.currentTime;
  gains.rain.gain.setTargetAtTime((rv / 100) * 0.55, now, 0.08);
  gains.wind.gain.setTargetAtTime((wv / 100) * 0.65, now, 0.08);
  gains.pad.gain.setTargetAtTime((pv / 100) * 0.55, now, 0.08);
  gains.cafe.gain.setTargetAtTime((cv / 100) * 0.45, now, 0.08);
}

function setPlaying(on){
  playing = on;
  const btn = document.getElementById('btnPlay');
  if (on) {
    initAudio();
    ac.resume();
    applySliders();
    notifyParentAudio(true);
    btn.textContent = IS_FR ? '⏸️ Pause Ambiance' : '⏸️ Pause Weather Mix';
  } else {
    if (ac) ac.suspend();
    notifyParentAudio(false);
    btn.textContent = IS_FR ? '▶️ Lancer Ambiance Météo' : '▶️ Start Weather Mix';
  }
}

window.addEventListener('message', ev => {
  if (ev && ev.data && ev.data.type === 'REMO_PAUSE_AUDIO' && playing) setPlaying(false);
});

function setPreset(r, w, p, c, name){
  document.getElementById('sRain').value = r;
  document.getElementById('sWind').value = w;
  document.getElementById('sPad').value = p;
  document.getElementById('sCafe').value = c;
  presetName = name;
  document.getElementById('presetPill').textContent = name;
  applySliders();
}

async function syncWeather(){
  document.getElementById('wxLabel').textContent = '🌤️ ' + (IS_FR ? curCity.fr : curCity.en) + '...';
  try {
    const r = await fetch('https://api.open-meteo.com/v1/forecast?latitude=' + curCity.lat + '&longitude=' + curCity.lng + '&current=temperature_2m,weather_code,is_day');
    const d = await r.json();
    const cur = d.current || {};
    const temp = Math.round(cur.temperature_2m ?? 18);
    const code = Number(cur.weather_code || 0);
    const isDay = cur.is_day !== 0;
    let ic = isDay ? '☀️' : '🌙';
    if (code >= 95) { ic = '⛈️'; setPreset(85, 80, 45, 15, IS_FR ? '⛈️ ORAGE FOCUS' : '⛈️ STORM FOCUS'); }
    else if (code >= 51 && code <= 82) { ic = '🌧️'; setPreset(80, 35, 60, 30, IS_FR ? '🌧️ PLUIE LO-FI' : '🌧️ RAIN LO-FI'); }
    else if (code >= 71 && code <= 77) { ic = '❄️'; setPreset(15, 75, 70, 50, IS_FR ? '❄️ CHALET HIVER' : '❄️ WINTER CABIN'); }
    else if (!isDay) { ic = '🌙'; setPreset(20, 20, 75, 45, IS_FR ? '🌙 NUIT CHILL' : '🌙 NIGHT CHILL'); }
    else { ic = '☀️'; setPreset(10, 15, 55, 70, IS_FR ? '☕ CAFÉ JOUR' : '☕ DAY CAFÉ'); }
    wxDesc = ic + ' ' + temp + '°C · ' + (IS_FR ? curCity.fr : curCity.en);
    document.getElementById('wxLabel').textContent = wxDesc;
  } catch (e) {
    wxDesc = '🎧 ' + (IS_FR ? curCity.fr : curCity.en);
    document.getElementById('wxLabel').textContent = wxDesc;
  }
}

// Smooth Neon Wave Canvas
const cv = document.getElementById('vizCv');
const ctx2 = cv.getContext('2d');
let phase = 0;
function drawViz(){
  const W = cv.width, H = cv.height;
  ctx2.clearRect(0, 0, W, H);
  phase += playing ? 0.055 : 0.012;
  const amp = playing ? 20 : 5;
  for (let w = 0; w < 3; w++) {
    ctx2.beginPath();
    ctx2.strokeStyle = w === 0 ? 'rgba(56,189,248,0.85)' : (w === 1 ? 'rgba(168,85,247,0.65)' : 'rgba(251,191,36,0.45)');
    ctx2.lineWidth = w === 0 ? 2.4 : 1.5;
    for (let x = 0; x <= W; x += 6) {
      const y = H * 0.62 + Math.sin(x * 0.018 + phase + w * 1.4) * (amp * (1 - w * 0.22)) * Math.sin((x / W) * Math.PI);
      if (x === 0) ctx2.moveTo(x, y); else ctx2.lineTo(x, y);
    }
    ctx2.stroke();
  }
  requestAnimationFrame(drawViz);
}
drawViz();

['sRain','sWind','sPad','sCafe'].forEach(id => document.getElementById(id).addEventListener('input', applySliders));
document.getElementById('btnPlay').addEventListener('click', () => setPlaying(!playing));
document.getElementById('btnPomo').addEventListener('click', () => {
  if (pomoInt) { clearInterval(pomoInt); pomoInt = null; pomoSec = 25 * 60; document.getElementById('btnPomo').textContent = '⏱️ 25:00'; return; }
  if (!playing) setPlaying(true);
  pomoInt = setInterval(() => {
    pomoSec = Math.max(0, pomoSec - 1);
    const mm = String(Math.floor(pomoSec / 60)).padStart(2, '0');
    const ss = String(pomoSec % 60).padStart(2, '0');
    document.getElementById('btnPomo').textContent = '⏱️ ' + mm + ':' + ss;
    if (pomoSec === 0) { clearInterval(pomoInt); pomoInt = null; }
  }, 1000);
});
sel.addEventListener('change', () => { curCity = getCity(sel.value); syncWeather(); });
document.getElementById('btnShare').addEventListener('click', () => {
  const txt = IS_FR
    ? '🎧 J’écoute l’ambiance météo en direct de ' + curCity.fr + ' (' + wxDesc + ' · ' + presetName + ') sur REMO !'
    : '🎧 Tuning into live weather ambience in ' + curCity.en + ' (' + wxDesc + ' · ' + presetName + ') on REMO!';
  shareToRemo({
    badge: '🎧 WEATHER AMBIENT · ' + presetName,
    title: wxDesc || curCity.en,
    subtitle: presetName,
    summaryText: txt,
    accentColor: '#38bdf8'
  });
});
document.getElementById('btnPlay').textContent = IS_FR ? '▶️ Lancer Ambiance Météo' : '▶️ Start Weather Mix';
syncWeather();
`;
  return _buildAppShell({ title: 'REMO Weather Ambient Studio', accent: '#38bdf8', accent2: '#a855f7', extraCss, bodyHtml, scriptJs });
}

/* ═══════════════════════════════════════════════════════════════════════════
   8. 🪐 COSMIC LIFE COUNTER (Mars Age, Live Heartbeats & Space Distance)
   ═══════════════════════════════════════════════════════════════════════════ */
function buildCosmicLifeAppHtml() {
  const extraCss = `
.bday-row{display:flex;gap:7px;align-items:center;}
.date-inp{flex:1;background:#0f172a;color:#f8fafc;border:1px solid rgba(168,85,247,0.45);border-radius:11px;padding:7px 10px;font-size:12px;font-weight:700;outline:none;color-scheme:dark;}
.big-grid{display:grid;grid-template-columns:1fr 1fr;gap:7px;}
.stat-box{background:rgba(15,23,42,0.78);border:1px solid var(--line);border-radius:13px;padding:9px 10px;}
.stat-lbl{font-size:10.5px;color:#94a3b8;font-weight:800;}
.stat-val{font-family:monospace;font-size:16px;font-weight:900;color:#fde68a;margin-top:3px;}
.planets{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;}
.pl-box{background:rgba(139,92,246,0.12);border:1px solid rgba(167,139,250,0.34);border-radius:11px;padding:7px 5px;text-align:center;}
.pl-n{font-size:10px;color:#cbd5e1;font-weight:800;}
.pl-v{font-size:14px;font-weight:900;color:#fff;margin-top:2px;}
.mars-banner{background:linear-gradient(135deg,rgba(249,115,22,0.18),rgba(236,72,153,0.16));border:1px solid rgba(251,146,60,0.45);border-radius:12px;padding:8px 10px;font-size:11.5px;font-weight:800;color:#fed7aa;text-align:center;}
`;
  const bodyHtml = `
<div class="app">
  <div class="top">
    <div class="brand">
      <div class="brand-ic">🪐</div>
      <div>
        <div class="brand-t" id="hdrTitle">Cosmic Life Counter</div>
        <div class="brand-s" id="hdrSub">Your Mars age &amp; live heartbeats</div>
      </div>
    </div>
    <span class="pill gold">LIVE 60FPS</span>
  </div>
  <div class="card">
    <div class="bday-row">
      <span class="muted" id="dobLbl" style="font-weight:800;">🎂 Birthday:</span>
      <input type="date" id="dobInp" class="date-inp" min="1925-01-01">
    </div>
    <div class="big-grid">
      <div class="stat-box"><div class="stat-lbl" id="lHeart">💓 Heartbeats Lived</div><div class="stat-val" id="vHeart" style="color:#fb7185;">0</div></div>
      <div class="stat-box"><div class="stat-lbl" id="lKm">🌍 Space Traveled (km)</div><div class="stat-val" id="vKm" style="color:#7dd3fc;">0</div></div>
    </div>
    <div class="planets">
      <div class="pl-box"><div class="pl-n">☿ Mercury</div><div class="pl-v" id="pMerc">0</div></div>
      <div class="pl-box"><div class="pl-n">♀ Venus</div><div class="pl-v" id="pVen">0</div></div>
      <div class="pl-box"><div class="pl-n">♂ Mars</div><div class="pl-v" id="pMars" style="color:#fb923c;">0</div></div>
      <div class="pl-box"><div class="pl-n">♃ Jupiter</div><div class="pl-v" id="pJup">0</div></div>
    </div>
    <div class="mars-banner" id="marsNext">—</div>
    <div class="row">
      <button class="btn btn-pri" id="btnShare">💬 Share My Cosmic Stats</button>
    </div>
  </div>
</div>`;
  const scriptJs = `
document.getElementById('hdrTitle').textContent = IS_FR ? 'Compteur de Vie Cosmique' : 'Cosmic Life Counter';
document.getElementById('hdrSub').textContent = IS_FR ? 'Votre âge sur Mars & battements de cœur' : 'Your Mars age & live heartbeats';
document.getElementById('dobLbl').textContent = IS_FR ? '🎂 Naissance :' : '🎂 Birthday:';
document.getElementById('lHeart').textContent = IS_FR ? '💓 Battements de cœur' : '💓 Heartbeats Lived';
document.getElementById('lKm').textContent = IS_FR ? '🌍 Parcours spatial (km)' : '🌍 Space Traveled (km)';
document.getElementById('btnShare').textContent = IS_FR ? '💬 Partager Mes Stats Cosmiques' : '💬 Share My Cosmic Stats';

const dobInp = document.getElementById('dobInp');
dobInp.max = new Date().toISOString().slice(0, 10);
try { dobInp.value = localStorage.getItem('remo_cosmic_dob') || '1996-05-14'; } catch (e) { dobInp.value = '1996-05-14'; }
dobInp.addEventListener('change', () => { try { localStorage.setItem('remo_cosmic_dob', dobInp.value); } catch (e) {} });

let lastSnap = { mars: '0', hearts: '0', kmB: '0', nextDays: 0 };

function tick(){
  const birthMs = Date.parse((dobInp.value || '1996-05-14') + 'T00:00:00Z');
  const sec = Math.max(1, (Date.now() - birthMs) / 1000);
  const days = sec / 86400;
  const hearts = Math.floor(sec * (70 / 60));
  const km = Math.floor(sec * 29.78);
  const merc = (days / 87.969).toFixed(1);
  const ven = (days / 224.701).toFixed(1);
  const marsNum = days / 686.98;
  const mars = marsNum.toFixed(2);
  const jup = (days / 4332.59).toFixed(2);
  const nextMarsDays = Math.ceil((Math.floor(marsNum) + 1) * 686.98 - days);

  document.getElementById('vHeart').textContent = hearts.toLocaleString();
  document.getElementById('vKm').textContent = (km / 1e9).toFixed(3) + ' B';
  document.getElementById('pMerc').textContent = merc;
  document.getElementById('pVen').textContent = ven;
  document.getElementById('pMars').textContent = mars;
  document.getElementById('pJup').textContent = jup;
  document.getElementById('marsNext').textContent = IS_FR
    ? '🎂 Prochain anniversaire sur Mars dans ' + nextMarsDays + ' jours terrestres !'
    : '🎂 Next Martian birthday in ' + nextMarsDays + ' Earth days!';
  lastSnap = { mars, hearts: hearts.toLocaleString(), kmB: (km / 1e9).toFixed(2) + 'B', nextDays: nextMarsDays };
}
setInterval(tick, 120);
tick();

document.getElementById('btnShare').addEventListener('click', () => {
  const txt = IS_FR
    ? '🪐 J’ai ' + lastSnap.mars + ' ans sur Mars, ' + lastSnap.hearts + ' battements de cœur et ' + lastSnap.kmB + ' km parcourus dans l’espace ! Et toi ?'
    : '🪐 I am ' + lastSnap.mars + ' years old on Mars, with ' + lastSnap.hearts + ' heartbeats and ' + lastSnap.kmB + ' km traveled through space! How old are you on Mars?';
  shareToRemo({
    badge: '🪐 COSMIC LIFE · MARS AGE ' + lastSnap.mars,
    title: lastSnap.mars + (IS_FR ? ' ans sur Mars' : ' yrs on Mars'),
    subtitle: '💓 ' + lastSnap.hearts + ' · 🌍 ' + lastSnap.kmB + ' km',
    summaryText: txt,
    accentColor: '#fb923c'
  });
});
`;
  return _buildAppShell({ title: 'REMO Cosmic Life Counter', accent: '#fb923c', accent2: '#ec4899', extraCss, bodyHtml, scriptJs });
}

/* ── Master Registry of the 8 REMO Live Discovery Apps ── */
const REMO_LIVE_DISCOVERY_APPS = {
  time_portal: {
    fileName: '01-time-portal-100y.html',
    category: 'planet',
    title_en: '📸 Time Portal — What did your city look like 100 years ago? Tap Next Era to travel through real 1890–1960 archives! #REMO #TimePortal',
    title_fr: '📸 Portail Temporel — À quoi ressemblait votre ville il y a 100 ans ? Touchez « Autre Époque » pour explorer les archives 1890–1960 ! #REMO #Histoire',
    buildHtml: buildTimePortalAppHtml
  },
  nasa_birthday: {
    fileName: '02-nasa-space-birthday.html',
    category: 'culture',
    title_en: '🔭 NASA Space Birthday — Enter your birthday and see the real cosmic masterpiece NASA photographed! Drop yours in the comments 👇 #REMO #NASA',
    title_fr: '🔭 Anniversaire Spatial NASA — Entrez votre date de naissance et découvrez la vraie photo cosmique de la NASA ! Partagez la vôtre en commentaire 👇 #REMO #NASA',
    buildHtml: buildNasaBirthdayAppHtml
  },
  wiki_radar: {
    fileName: '03-wikipedia-radar.html',
    category: 'culture',
    title_en: '📍 Wikipedia Radar (<5 km) — Discover hidden monuments & wild stories right next to your city center! #REMO #HiddenGems',
    title_fr: '📍 Radar Wikipédia (<5 km) — Découvrez un lieu secret ou une histoire insolite à moins de 5 km du centre-ville ! #REMO #Découverte',
    buildHtml: buildWikiRadarAppHtml
  },
  wildlife_near: {
    fileName: '04-wildlife-near-you.html',
    category: 'planet',
    title_en: '🦜 Wildlife Live Near You — Real birds, mammals & nature photographed this week around your REMO city! #REMO #Wildlife',
    title_fr: '🦜 Faune & Flore en Direct — Vraies espèces photographiées cette semaine autour de votre ville REMO ! #REMO #Nature',
    buildHtml: buildWildlifeNearAppHtml
  },
  slang_word: {
    fileName: '05-slang-word-of-day.html',
    category: 'culture',
    title_en: '🗣️ World City Word of the Day — Listen to authentic local slang & untranslatable words and try the 1-click quiz! #REMO #Culture',
    title_fr: '🗣️ Mot du Jour des Villes — Écoutez la prononciation d’une expression locale intraduisible et tentez le mini-quiz ! #REMO #Culture',
    buildHtml: buildSlangWordAppHtml
  },
  power_duel: {
    fileName: '06-purchasing-power-duel.html',
    category: 'viral',
    title_en: '☕ $20 Purchasing Power Duel — Compare how many coffees, metro rides & meals $20 buys in your city vs the world! #REMO #CityDuel',
    title_fr: '☕ Duel Pouvoir d’Achat (20$) — Comparez combien de cafés, billets de métro et repas valent 20$ dans votre ville vs le monde ! #REMO #Villes',
    buildHtml: buildPowerDuelAppHtml
  },
  ambient_studio: {
    fileName: '07-weather-ambient-studio.html',
    category: 'viral',
    title_en: '🎧 Weather-Synced Ambient Studio — Relax or study with a procedural soundscape automatically tuned to your city’s live weather! #REMO #Focus',
    title_fr: '🎧 Studio Ambiance Météo — Travaillez ou détendez-vous avec un paysage sonore synchronisé à la météo en direct de votre ville ! #REMO #Focus',
    buildHtml: buildAmbientStudioAppHtml
  },
  cosmic_life: {
    fileName: '08-cosmic-life-counter.html',
    category: 'viral',
    title_en: '🪐 Cosmic Life Counter — How old are you on Mars and how many heartbeats have you lived? Share your cosmic score below! #REMO #Space',
    title_fr: '🪐 Compteur de Vie Cosmique — Quel âge avez-vous sur Mars et combien de battements de cœur avez-vous vécus ? Partagez votre score ! #REMO #Espace',
    buildHtml: buildCosmicLifeAppHtml
  }
};

/* ═══════════════════════════════════════════════════════════════════════════
   STUDIO 1-CLICK PRESET LOADER + ADMIN DAILY DROP / SCHEDULE CONTROLS
   ═══════════════════════════════════════════════════════════════════════════ */
function loadLiveDiscoveryAppPreset(appKey) {
  if (typeof REMO_STORE !== 'undefined' && !REMO_STORE.isAdminUnlocked() && !REMO_STORE.isCurrentUserAdmin()) {
    if (typeof remoToast === 'function') {
      remoToast(REMO_I18N.getLang() === 'fr' ? 'Réservé aux administrateurs REMO.' : 'Admin only feature.');
    }
    return;
  }
  const spec = REMO_LIVE_DISCOVERY_APPS[appKey];
  if (!spec) return;
  const lang = (typeof REMO_I18N !== 'undefined' && REMO_I18N.getLang) ? REMO_I18N.getLang() : 'en';
  const html = spec.buildHtml();

  const area = document.getElementById('createHtmlCodeArea');
  if (area) area.value = html;
  const arcToggle = document.getElementById('createHtmlArcadeToggle');
  if (arcToggle) arcToggle.checked = false;
  const catSel = document.getElementById('createHtmlAppCategory');
  if (catSel) catSel.value = spec.category || 'culture';
  const capInp = document.getElementById('createCaptionInp');
  if (capInp) capInp.value = lang === 'fr' ? spec.title_fr : spec.title_en;

  // Pre-populate dual EN/FR fields if present
  const enBox = document.getElementById('createCaptionEnBox');
  const frBox = document.getElementById('createCaptionFrBox');
  if (enBox) enBox.value = spec.title_en;
  if (frBox) frBox.value = spec.title_fr;

  window._pendingLiveAppKey = appKey;
  if (typeof refreshStudioHtmlPreview === 'function') refreshStudioHtmlPreview();
  const statusEl = document.getElementById('createMediaPreviewStatus');
  if (statusEl) {
    statusEl.textContent = lang === 'fr'
      ? `✨ Mini-App « ${spec.fileName} » chargée & prête à publier !`
      : `✨ Live App "${spec.fileName}" loaded & ready to publish!`;
  }
}
window.loadLiveDiscoveryAppPreset = loadLiveDiscoveryAppPreset;

function setLiveAppCategory(cat, chipEl) {
  window.currentLiveAppCategory = cat || 'all';
  document.querySelectorAll('#liveAppsCatChips .fchip').forEach((b) => b.classList.remove('active'));
  if (chipEl) chipEl.classList.add('active');
  if (typeof renderSocialFeed === 'function') renderSocialFeed();
}
window.setLiveAppCategory = setLiveAppCategory;

function syncLiveAppsSubbarUI() {
  const isHtmlMode = typeof currentFeedMode !== 'undefined' && currentFeedMode === 'html';
  const subbar = document.getElementById('liveAppsSubbar');
  const badge = document.getElementById('feedLiveAppsBadge');
  const dropBanner = document.getElementById('liveAppsDailyDropBanner');
  const now = Date.now();
  const allPosts = (typeof REMO_STORE !== 'undefined' && REMO_STORE.state && REMO_STORE.state.posts) ? REMO_STORE.state.posts : [];
  const activeDrops = allPosts.filter((p) => p && p.mediaType === 'html_app' && p.isDailyDrop && (!p.scheduledAt || Number(p.scheduledAt) <= now));
  const latestDrop = activeDrops.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))[0] || null;

  if (badge) {
    badge.style.display = latestDrop ? 'inline-block' : 'none';
  }
  if (subbar) {
    subbar.style.display = isHtmlMode ? 'flex' : 'none';
  }
  if (dropBanner) {
    if (isHtmlMode && latestDrop) {
      const lang = (typeof REMO_I18N !== 'undefined' && REMO_I18N.getLang) ? REMO_I18N.getLang() : 'en';
      const rawTitle = String((lang === 'fr' ? (latestDrop.caption_fr || latestDrop.caption_en) : (latestDrop.caption_en || latestDrop.caption_fr)) || '').trim();
      const shortTitle = rawTitle.length > 74 ? rawTitle.slice(0, 74) + '…' : rawTitle;
      dropBanner.style.display = 'flex';
      dropBanner.innerHTML = `
        <div style="min-width:0;flex:1;">
          <b style="color:#fde047;letter-spacing:0.3px;">${lang === 'fr' ? '✨ DROP DU JOUR · +5 PTS EXPLORATEUR' : '✨ DROP OF THE DAY · +5 PTS EXPLORER'}</b>
          <div style="font-size:0.74rem;color:#e2e8f0;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${typeof escapeHtmlStr === 'function' ? escapeHtmlStr(shortTitle) : shortTitle}</div>
        </div>
        <button type="button" class="btn-cyber btn-gold" style="padding:5px 10px;font-size:0.72rem;flex-shrink:0;" onclick="document.getElementById('post_card_${latestDrop.id}')?.scrollIntoView({behavior:'smooth',block:'center'})">${lang === 'fr' ? 'Ouvrir' : 'Open'}</button>
      `;
    } else {
      dropBanner.style.display = 'none';
    }
  }
}
window.syncLiveAppsSubbarUI = syncLiveAppsSubbarUI;

function adminToggleHtmlDailyDrop(postId) {
  if (!REMO_STORE.isAdminUnlocked() && !REMO_STORE.isCurrentUserAdmin()) return;
  const p = (REMO_STORE.state.posts || []).find((x) => x.id === postId);
  if (!p || p.mediaType !== 'html_app') return;
  const lang = REMO_I18N.getLang();
  p.isDailyDrop = !Boolean(p.isDailyDrop);
  REMO_STORE.syncPostToCloud(p);
  REMO_STORE.save(true, 'admin_toggle_daily_drop');
  if (typeof rerenderSinglePostCard === 'function') rerenderSinglePostCard(p.id);
  syncLiveAppsSubbarUI();
  if (typeof remoToast === 'function') {
    remoToast(p.isDailyDrop
      ? (lang === 'fr' ? '✨ Épinglé comme Drop du Jour !' : '✨ Pinned as Drop of the Day!')
      : (lang === 'fr' ? 'Drop du Jour désactivé.' : 'Drop of the Day turned off.'));
  }
}
window.adminToggleHtmlDailyDrop = adminToggleHtmlDailyDrop;

function adminPublishScheduledPostNow(postId) {
  if (!REMO_STORE.isAdminUnlocked() && !REMO_STORE.isCurrentUserAdmin()) return;
  const p = (REMO_STORE.state.posts || []).find((x) => x.id === postId);
  if (!p) return;
  const lang = REMO_I18N.getLang();
  p.scheduledAt = 0;
  p.createdAt = Date.now();
  REMO_STORE.syncPostToCloud(p);
  REMO_STORE.save(true, 'admin_publish_scheduled_now');
  if (typeof renderSocialFeed === 'function') renderSocialFeed('', true);
  if (typeof remoToast === 'function') {
    remoToast(lang === 'fr' ? '🚀 Publication libérée en direct maintenant !' : '🚀 Scheduled post published live now!', 'fanfare');
  }
}
window.adminPublishScheduledPostNow = adminPublishScheduledPostNow;

/* ═══════════════════════════════════════════════════════════════════════════
   DAILY EXPLORER BONUS (+5 PTS once/day when engaging with Drop of the Day)
   ═══════════════════════════════════════════════════════════════════════════ */
function _maybeGrantDailyExplorerBonus(postId) {
  try {
    if (typeof REMO_STORE === 'undefined' || !REMO_STORE.getCurrentUser) return;
    const u = REMO_STORE.getCurrentUser();
    if (!u) return;
    const p = (typeof findFeedPostById === 'function') ? findFeedPostById(postId) : null;
    if (!p || !p.isDailyDrop) return;
    const dayKey = 'remo_daily_explorer_' + new Date().toISOString().slice(0, 10);
    if (localStorage.getItem(dayKey) === '1') return;
    localStorage.setItem(dayKey, '1');
    if (typeof REMO_STORE.addCityScore === 'function') {
      REMO_STORE.addCityScore(u.homeCity || p.cityId || 'montreal', 5);
    }
    if (typeof remoToast === 'function' && typeof t === 'function') {
      remoToast(t('live_app_explorer_bonus'), 'coin');
    }
  } catch (e) {}
}

/* ═══════════════════════════════════════════════════════════════════════════
   SOCIAL LOOP ENGINE (REMO_APP_SHARE -> Comment Pre-Fill + 9:16 Story PNG)
   ═══════════════════════════════════════════════════════════════════════════ */
function openLiveAppShareModal(payload) {
  _activeLiveAppSharePayload = payload;
  const card = document.getElementById('liveAppSharePreviewCard');
  const modal = document.getElementById('liveAppShareModal');
  if (!card || !modal) return;

  const esc = typeof escapeHtmlStr === 'function'
    ? escapeHtmlStr
    : (s) => String(s || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const accent = /^#[0-9a-f]{3,8}$/i.test(String(payload.accentColor || '')) ? payload.accentColor : '#38bdf8';
  card.style.borderColor = accent;
  card.innerHTML = `
    <div class="live-app-share-badge">${esc(payload.badge || '✨ REMO LIVE APP')}</div>
    <div class="live-app-share-title-txt">${esc(payload.title || 'REMO Discovery')}</div>
    ${payload.subtitle ? `<div class="live-app-share-sub-txt">${esc(payload.subtitle)}</div>` : ''}
    <div class="live-app-share-body-txt">${esc(payload.summaryText || '')}</div>
  `;

  const cmtBtn = document.getElementById('btnLiveAppShareComment');
  const hasRealPost = Boolean(payload.postId && payload.postId !== 'studio_preview' && typeof findFeedPostById === 'function' && findFeedPostById(payload.postId));
  if (cmtBtn) cmtBtn.style.display = hasRealPost ? 'inline-flex' : 'none';

  modal.classList.add('open');
  _maybeGrantDailyExplorerBonus(payload.postId);
}

function closeLiveAppShareModal() {
  document.getElementById('liveAppShareModal')?.classList.remove('open');
}
window.closeLiveAppShareModal = closeLiveAppShareModal;

function liveAppShareToComments() {
  const pl = _activeLiveAppSharePayload;
  if (!pl || !pl.postId) return;
  closeLiveAppShareModal();
  if (typeof closeHtmlFullscreenModal === 'function') closeHtmlFullscreenModal();
  if (typeof openCommentsModal === 'function') {
    openCommentsModal(pl.postId);
    setTimeout(() => {
      const inp = document.getElementById('commentInputBox');
      if (inp) {
        inp.value = String(pl.summaryText || '').slice(0, 360);
        inp.focus();
      }
    }, 90);
  }
}
window.liveAppShareToComments = liveAppShareToComments;

function copyLiveAppShareText() {
  const pl = _activeLiveAppSharePayload;
  if (!pl) return;
  const link = (pl.postId && pl.postId !== 'studio_preview')
    ? `https://remoworld.com/?post=${encodeURIComponent(pl.postId)}`
    : 'https://remoworld.com';
  const full = `${pl.summaryText || pl.title || 'REMO Live App'}\n🌐 ${link}`;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(full).then(() => {
      const fr = (typeof REMO_I18N !== 'undefined' && REMO_I18N.getLang() === 'fr');
      if (typeof remoToast === 'function') remoToast(fr ? '📋 Résultat copié !' : '📋 Result copied!', 'coin');
    }).catch(() => {});
  }
}
window.copyLiveAppShareText = copyLiveAppShareText;

function _wrapCanvasLines(ctx, text, maxW, maxLines) {
  const words = String(text || '').split(/\s+/);
  const lines = [];
  let cur = '';
  for (const w of words) {
    const test = cur ? (cur + ' ' + w) : w;
    if (ctx.measureText(test).width > maxW && cur) {
      lines.push(cur);
      cur = w;
      if (lines.length >= maxLines - 1) break;
    } else {
      cur = test;
    }
  }
  if (cur) lines.push(cur);
  return lines.slice(0, maxLines);
}

function exportLiveAppShareStory916() {
  const pl = _activeLiveAppSharePayload;
  if (!pl) return;
  const W = 1080, H = 1920;
  const cv = document.createElement('canvas');
  cv.width = W;
  cv.height = H;
  const ctx = cv.getContext('2d');
  const accent = /^#[0-9a-f]{3,8}$/i.test(String(pl.accentColor || '')) ? pl.accentColor : '#38bdf8';

  // Deep cosmic gradient background
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#040717');
  bg.addColorStop(0.5, '#0b1330');
  bg.addColorStop(1, '#050816');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Subtle orbital radial glows
  const g1 = ctx.createRadialGradient(W * 0.82, H * 0.18, 20, W * 0.82, H * 0.18, 620);
  g1.addColorStop(0, accent + '55');
  g1.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g1;
  ctx.fillRect(0, 0, W, H);

  const g2 = ctx.createRadialGradient(W * 0.18, H * 0.82, 20, W * 0.18, H * 0.82, 580);
  g2.addColorStop(0, 'rgba(139,92,246,0.32)');
  g2.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g2;
  ctx.fillRect(0, 0, W, H);

  // Outer sleek neon frame
  ctx.strokeStyle = 'rgba(255,255,255,0.14)';
  ctx.lineWidth = 4;
  ctx.strokeRect(56, 56, W - 112, H - 112);

  // Header brand
  ctx.fillStyle = '#38bdf8';
  ctx.font = '900 44px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('REMO WORLD™', W / 2, 190);
  ctx.fillStyle = '#94a3b8';
  ctx.font = '700 26px system-ui, -apple-system, sans-serif';
  ctx.fillText('LIVE WORLD APPS · VILLES DU MONDE', W / 2, 236);

  // Central glass discovery card
  const cx = 96, cy = 360, cw = W - 192, ch = 1040;
  ctx.fillStyle = 'rgba(12, 19, 42, 0.9)';
  ctx.beginPath();
  ctx.roundRect(cx, cy, cw, ch, 44);
  ctx.fill();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 5;
  ctx.stroke();

  // Badge pill
  const badgeTxt = String(pl.badge || '✨ REMO DISCOVERY').slice(0, 42);
  ctx.font = '900 30px system-ui, -apple-system, sans-serif';
  const bw = Math.min(cw - 80, ctx.measureText(badgeTxt).width + 72);
  ctx.fillStyle = 'rgba(251, 191, 36, 0.18)';
  ctx.beginPath();
  ctx.roundRect((W - bw) / 2, cy + 72, bw, 66, 33);
  ctx.fill();
  ctx.fillStyle = '#fde68a';
  ctx.fillText(badgeTxt, W / 2, cy + 115);

  // Main Title
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 62px system-ui, -apple-system, sans-serif';
  const titleLines = _wrapCanvasLines(ctx, pl.title || 'REMO Discovery', cw - 110, 3);
  let y = cy + 255;
  for (const ln of titleLines) {
    ctx.fillText(ln, W / 2, y);
    y += 78;
  }

  // Subtitle
  if (pl.subtitle) {
    ctx.fillStyle = accent;
    ctx.font = '800 34px system-ui, -apple-system, sans-serif';
    const subLines = _wrapCanvasLines(ctx, pl.subtitle, cw - 110, 2);
    y += 16;
    for (const ln of subLines) {
      ctx.fillText(ln, W / 2, y);
      y += 46;
    }
  }

  // Divider line
  y += 32;
  ctx.strokeStyle = 'rgba(148,163,184,0.28)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx + 90, y);
  ctx.lineTo(cx + cw - 90, y);
  ctx.stroke();

  // Summary quote
  ctx.fillStyle = '#e2e8f0';
  ctx.font = '600 38px system-ui, -apple-system, sans-serif';
  const bodyLines = _wrapCanvasLines(ctx, pl.summaryText || '', cw - 120, 6);
  y += 76;
  for (const ln of bodyLines) {
    ctx.fillText(ln, W / 2, y);
    y += 54;
  }

  // Footer CTA & watermark
  ctx.fillStyle = '#fde047';
  ctx.font = '900 38px system-ui, -apple-system, sans-serif';
  const isFr = typeof REMO_I18N !== 'undefined' && REMO_I18N.getLang() === 'fr';
  ctx.fillText(isFr ? '✨ Essayez en direct sur remoworld.com' : '✨ Try it live on remoworld.com', W / 2, 1615);

  const curU = (typeof REMO_STORE !== 'undefined' && REMO_STORE.getCurrentUser) ? REMO_STORE.getCurrentUser() : null;
  if (curU && curU.name) {
    ctx.fillStyle = '#7dd3fc';
    ctx.font = '700 30px system-ui, -apple-system, sans-serif';
    ctx.fillText(`@${curU.name} · remoworld.com`, W / 2, 1685);
  } else {
    ctx.fillStyle = '#7dd3fc';
    ctx.font = '700 30px system-ui, -apple-system, sans-serif';
    ctx.fillText('remoworld.com', W / 2, 1685);
  }

  cv.toBlob(async (blob) => {
    if (!blob) return;
    const fname = `remo-discovery-916-${Date.now()}.png`;
    try {
      const file = new File([blob], fname, { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: pl.title || 'REMO Discovery', text: pl.summaryText || '' });
        return;
      }
    } catch (e) {}
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fname;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2500);
    if (typeof remoToast === 'function') {
      remoToast(isFr ? '📲 Story 9:16 téléchargée !' : '📲 9:16 Story Card downloaded!', 'fanfare');
    }
  }, 'image/png');
}
window.exportLiveAppShareStory916 = exportLiveAppShareStory916;

/* ═══════════════════════════════════════════════════════════════════════════
   GLOBAL MESSAGE LISTENER (REMO_APP_SHARE + REMO_APP_AUDIO_ACTIVE)
   ═══════════════════════════════════════════════════════════════════════════ */
if (typeof window !== 'undefined' && window.addEventListener) {
  window.addEventListener('message', (ev) => {
    const d = ev && ev.data;
    if (!d || typeof d !== 'object') return;
    if (d.type !== 'REMO_APP_SHARE' && d.type !== 'REMO_APP_AUDIO_ACTIVE') return;

    // Verify sender is an actual rendered REMO HTML mini-app iframe
    const frames = Array.from(document.querySelectorAll('iframe.html-post-frame, iframe#htmlFsIframe, iframe#studioHtmlLivePreview'));
    const senderFrame = frames.find((fr) => fr.contentWindow === ev.source);
    if (!senderFrame) return;
    const pid = String(d.postId || senderFrame.getAttribute('data-post-id') || 'studio_preview');

    if (d.type === 'REMO_APP_SHARE') {
      openLiveAppShareModal({
        postId: pid,
        badge: String(d.badge || '✨ REMO LIVE APP').slice(0, 64),
        title: String(d.title || 'REMO Discovery').slice(0, 120),
        subtitle: String(d.subtitle || '').slice(0, 140),
        summaryText: String(d.summaryText || d.text || '').slice(0, 360),
        accentColor: String(d.accentColor || '#38bdf8').slice(0, 16)
      });
      return;
    }

    if (d.type === 'REMO_APP_AUDIO_ACTIVE' && d.active) {
      // Pause REMO Radio so audio never overlaps
      try {
        if (window.REMO_RADIO && typeof window.REMO_RADIO.pause === 'function') window.REMO_RADIO.pause();
      } catch (e) {}
      // Pause any other live-app iframe playing audio
      frames.forEach((fr) => {
        if (fr !== senderFrame && fr.contentWindow) {
          try { fr.contentWindow.postMessage({ type: 'REMO_PAUSE_AUDIO' }, '*'); } catch (e) {}
        }
      });
      // Auto-pause if scrolled off-screen
      if (typeof IntersectionObserver !== 'undefined') {
        if (!_liveAppAudioObserver) {
          _liveAppAudioObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting && entry.target && entry.target.contentWindow) {
                try { entry.target.contentWindow.postMessage({ type: 'REMO_PAUSE_AUDIO' }, '*'); } catch (e) {}
              }
            });
          }, { threshold: 0.08 });
        }
        try { _liveAppAudioObserver.observe(senderFrame); } catch (e) {}
      }
    }
  });
}

window.REMO_LIVE_DISCOVERY_APPS = REMO_LIVE_DISCOVERY_APPS;

/* Allow Node export script to generate standalone .html files with zero duplication */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { REMO_LIVE_DISCOVERY_APPS, LIVE_APP_CITIES_MINI };
}
