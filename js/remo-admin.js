/* ════════════════════════════════════════════════════════════════════
   🛡️ REMO — Admin Executive Office & Master City Card Factory Controller
   Controls 100% of REMO: Cards, Cities, Flash Drops, Wars, Bank, Users,
   Moderation & Plug-and-Play Firebase Cloud. Strictly EN / FR ONLY.
   ════════════════════════════════════════════════════════════════════ */

let adminCurrentTab = 'overview';
let studioLoadedPhotoImg = null;
let studioPhotoDataUrl = '';

function admToast(msg) {
  RemoAudio.play('coin');
  const box = document.getElementById('admToastBox');
  if (!box) return;
  const d = document.createElement('div');
  d.style.cssText = 'background:#111a33;border:1px solid #fbbf24;color:#fff;padding:11px 16px;border-radius:12px;font-weight:700;font-size:0.84rem;box-shadow:0 12px 30px rgba(0,0,0,0.65);margin-bottom:8px;';
  d.textContent = msg;
  box.appendChild(d);
  setTimeout(() => d.remove(), 3400);
}

/* ── 1. ADMIN PIN LOCK / UNLOCK (Synced with REMO Social Network God-Mode) ── */
function checkAdminSession() {
  const unlocked = REMO_STORE.isAdminUnlocked();
  const lockEl = document.getElementById('admLockScreen');
  if (lockEl) lockEl.style.display = unlocked ? 'none' : 'flex';
  if (unlocked) refreshAllAdminPanels();
}

function unlockAdminOffice(ev) {
  if (ev) ev.preventDefault();
  const lang = REMO_I18N.getLang();
  const inp = document.getElementById('admPinInput')?.value.trim();
  const masterPin = REMO_STORE.state.settings.adminPin || '2026';
  if (inp === masterPin) {
    if (!REMO_STORE.isCurrentUserAdmin()) {
      REMO_STORE.ensureGuestOrCitizen('REMO Founder', 'andart1174@gmail.com', 'montreal', true);
    }
    REMO_STORE.setAdminUnlocked(true);
    checkAdminSession();
    RemoAudio.play('fanfare');
    admToast(lang === 'fr' ? '🛡️ Bureau Exécutif Admin & Mode Dieu déverrouillés !' : '🛡️ Admin Executive Office & God-Mode unlocked!');
  } else {
    alert(lang === 'fr' ? 'Code PIN incorrect ! (Défaut : 2026)' : 'Invalid Admin PIN! (Default: 2026)');
  }
}

function lockAdminOffice() {
  REMO_STORE.setAdminUnlocked(false);
  checkAdminSession();
}

function adminToggleHappyHour2x() {
  REMO_STORE.state.settings.happyHour2x = !REMO_STORE.state.settings.happyHour2x;
  REMO_STORE.save(true, 'happy_hour');
  refreshAllAdminPanels();
  admToast(REMO_STORE.state.settings.happyHour2x ? '⚡ 2X REWARDS HAPPY HOUR ACTIVE!' : '2X Happy Hour OFF');
}

function switchAdminTab(tabId) {
  adminCurrentTab = tabId;
  document.querySelectorAll('.adm-panel').forEach((p) => p.classList.remove('active'));
  document.getElementById('adm-panel-' + tabId)?.classList.add('active');
  document.querySelectorAll('.adm-tab-btn').forEach((b) => {
    b.classList.toggle('active', b.getAttribute('data-adm-tab') === tabId);
  });
  if (tabId === 'cards') renderAdminCardStudio();
  else refreshAllAdminPanels();
}

/* ── 2. OVERVIEW KPIs & MEGAPHONE ── */
function refreshAllAdminPanels() {
  const st = REMO_STORE.state;
  const lang = REMO_I18N.getLang();

  // KPI counters
  const totalCoins = (st.users || []).reduce((s, u) => s + (u.coins || 0), 0);
  const topCityEntry = Object.entries(st.cityScores || {}).sort((a, b) => b[1] - a[1])[0] || ['montreal', 4820];
  const topCity = getCityById(topCityEntry[0]);
  const fbCfg = REMO_STORE.getFirebaseConfig();

  const setTxt = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setTxt('kpiUsers', (st.users || []).length);
  setTxt('kpiPosts', (st.posts || []).length);
  setTxt('kpiCards', (st.droppedCardsPool || []).length);
  setTxt('kpiCoins', totalCoins.toLocaleString() + ' 🪙');
  setTxt('kpiTopCity', `${topCity.flag} ${getCityName(topCity, lang)}`);
  setTxt('kpiCloudMode', fbCfg ? `☁️ ${fbCfg.projectId}` : (lang === 'fr' ? '⚡ Local Live Sync' : '⚡ Local Live Sync'));

  // Megaphone inputs
  const mEn = document.getElementById('admMegaEn');
  const mFr = document.getElementById('admMegaFr');
  const mAct = document.getElementById('admMegaActive');
  if (mEn) mEn.value = st.settings.announcement_en || '';
  if (mFr) mFr.value = st.settings.announcement_fr || '';
  if (mAct) mAct.checked = !!st.settings.announcementActive;

  renderAdminCardStudioSelectors();
  renderAdminCitiesPanel();
  renderAdminWarsAndPulsePanel();
  renderAdminEconomyPanel();
  renderAdminModerationPanel();
  renderAdminCloudPanel();
  if (typeof renderAdminContestsPanel === 'function') {
    renderAdminContestsPanel();
  }
}

function saveAdminMegaphone() {
  const lang = REMO_I18N.getLang();
  REMO_STORE.state.settings.announcement_en = document.getElementById('admMegaEn')?.value || '';
  REMO_STORE.state.settings.announcement_fr = document.getElementById('admMegaFr')?.value || '';
  REMO_STORE.state.settings.announcementActive = !!document.getElementById('admMegaActive')?.checked;
  REMO_STORE.save(true, 'megaphone');
  admToast(lang === 'fr' ? '📢 Bandeau global mis à jour en direct sur REMO !' : '📢 Live Megaphone updated across REMO!');
}

function triggerGlobalCoinRainAdmin() {
  const lang = REMO_I18N.getLang();
  const amt = Number(prompt(lang === 'fr' ? 'Combien de Pièces REMO envoyer à TOUS les citoyens ?' : 'How many REMO Coins to gift to ALL citizens?', '100'));
  if (!amt || amt <= 0) return;
  REMO_STORE.state.users.forEach((u) => {
    u.coins = (u.coins || 0) + amt;
    u.lifetimeCoins = (u.lifetimeCoins || 0) + amt;
  });
  REMO_STORE.save(true, 'coin_rain');
  refreshAllAdminPanels();
  admToast(lang === 'fr' ? `🌧️ +${amt} 🪙 distribués à tous les citoyens !` : `🌧️ +${amt} 🪙 gifted to every citizen!`);
}

/* ── 3. MASTER CITY CARD STUDIO & MINTING FACTORY ── */
function renderAdminCardStudioSelectors() {
  const citySel = document.getElementById('stCitySelect');
  const themeSel = document.getElementById('stThemeSelect');
  const recipientSel = document.getElementById('stRecipientUser');
  const lang = REMO_I18N.getLang();
  if (!citySel) return;

  const prevVal = citySel.value || 'chisinau';
  citySel.innerHTML = getRemoCities().map((c) =>
    `<option value="${c.id}" ${c.id === prevVal ? 'selected' : ''}>${c.flag} ${getCityName(c, lang)} (${c.code})</option>`
  ).join('');

  if (themeSel && !themeSel.options.length) {
    themeSel.innerHTML = REMO_CARD_THEMES.map((th) =>
      `<option value="${th.id}">${lang === 'fr' ? th.name_fr : th.name_en}</option>`
    ).join('');
  }

  if (recipientSel) {
    recipientSel.innerHTML = `<option value="">🌐 REMO Public Drop Pool</option>` +
      REMO_STORE.state.users.map((u) => `<option value="${u.uid}">👤 ${u.name} (#${u.passportNum})</option>`).join('');
  }
}

function onStudioCityChange() {
  const cityId = document.getElementById('stCitySelect')?.value || 'montreal';
  const c = getCityById(cityId);
  const lang = REMO_I18N.getLang();
  document.getElementById('stCardTitle').value = getCityName(c, lang).toUpperCase();
  document.getElementById('stRarity').value = c.rarity || 'Mythic 4D';
  document.getElementById('stThemeSelect').value = String(c.themeId || 0);
  document.getElementById('stCoinVal').value = c.baseValue || 9000;
  document.getElementById('stStatCulture').value = c.stats.culture;
  document.getElementById('stStatNight').value = c.stats.nightlife;
  document.getElementById('stStatTech').value = c.stats.tech;
  document.getElementById('stStatGastro').value = c.stats.gastronomy;
  renderAdminCardStudio();
}

function buildCurrentStudioSpec() {
  const cityId = document.getElementById('stCitySelect')?.value || 'chisinau';
  return {
    cityId,
    title: document.getElementById('stCardTitle')?.value || '',
    subtitle: document.getElementById('stCardSubtitle')?.value || '',
    serial: document.getElementById('stSerial')?.value || '0001',
    maxSupply: Number(document.getElementById('stMaxSupply')?.value || 1000),
    rarity: document.getElementById('stRarity')?.value || 'Mythic 4D',
    themeId: Number(document.getElementById('stThemeSelect')?.value || 0),
    coinValue: Number(document.getElementById('stCoinVal')?.value || 9400),
    verifiedGps: !!document.getElementById('stChkGps')?.checked,
    customLore: document.getElementById('stCustomLore')?.value || '',
    customPhotoDataUrl: studioPhotoDataUrl,
    _loadedPhotoImg: studioLoadedPhotoImg,
    stats: {
      culture: Number(document.getElementById('stStatCulture')?.value || 94),
      nightlife: Number(document.getElementById('stStatNight')?.value || 90),
      tech: Number(document.getElementById('stStatTech')?.value || 92),
      gastronomy: Number(document.getElementById('stStatGastro')?.value || 95)
    },
    security: {
      guilloche: !!document.getElementById('stChkGuilloche')?.checked,
      microtext: !!document.getElementById('stChkMicro')?.checked,
      nfcChip: !!document.getElementById('stChkNfc')?.checked,
      psaSlab: !!document.getElementById('stChkPsa')?.checked,
      goldStamp: !!document.getElementById('stChkGoldStamp')?.checked,
      founderSig: !!document.getElementById('stChkSig')?.checked,
      redLensSecret: document.getElementById('stRedSecret')?.value || ''
    }
  };
}

function renderAdminCardStudio() {
  const fCv = document.getElementById('admFrontCanvas');
  const bCv = document.getElementById('admBackCanvas');
  if (!fCv || !bCv) return;
  const spec = buildCurrentStudioSpec();
  renderCityCardFront(fCv, spec);
  renderCityCardBack(bCv, spec);
}

function handleStudioPhotoUpload(ev) {
  const file = ev.target.files && ev.target.files[0];
  if (!file) return;
  const rd = new FileReader();
  rd.onload = (e) => {
    studioPhotoDataUrl = e.target.result;
    const img = new Image();
    img.onload = () => {
      studioLoadedPhotoImg = img;
      renderAdminCardStudio();
    };
    img.src = studioPhotoDataUrl;
  };
  rd.readAsDataURL(file);
}

function clearStudioPhoto() {
  studioPhotoDataUrl = '';
  studioLoadedPhotoImg = null;
  const inp = document.getElementById('stPhotoInput');
  if (inp) inp.value = '';
  renderAdminCardStudio();
}

function adminDropCardLiveToNetwork() {
  const lang = REMO_I18N.getLang();
  const spec = buildCurrentStudioSpec();
  const targetUid = document.getElementById('stRecipientUser')?.value || null;
  const card = REMO_STORE.mintCardForUser(targetUid, spec.cityId, spec.rarity, spec.verifiedGps, spec);

  // Auto-increment serial input for smooth minting
  const nextS = String(Number(spec.serial) + 1).padStart(4, '0');
  document.getElementById('stSerial').value = nextS;
  renderAdminCardStudio();
  refreshAllAdminPanels();

  const c = getCityById(spec.cityId);
  admToast(
    lang === 'fr'
      ? `🚀 Carte ${c.flag} ${getCityName(c, 'fr')} #${card.serial} envoyée en direct sur REMO !`
      : `🚀 Card ${c.flag} ${getCityName(c, 'en')} #${card.serial} dropped LIVE to REMO!`
  );
}

function adminLaunchCardAuctionFromStudio() {
  const lang = REMO_I18N.getLang();
  const spec = buildCurrentStudioSpec();
  const startBid = Number(prompt(lang === 'fr' ? 'Mise à prix initiale (Pièces REMO) :' : 'Starting auction bid (REMO Coins):', '500'));
  if (!startBid) return;
  REMO_STORE.state.auctions.unshift({
    id: 'auc_' + Date.now(),
    cardSpec: { ...spec, _loadedPhotoImg: undefined },
    sellerName: 'REMO Official Mint',
    currentBid: startBid,
    highestBidder: '—',
    endsAt: Date.now() + 24 * 3600 * 1000
  });
  REMO_STORE.save(true, 'admin_auction');
  admToast(lang === 'fr' ? '🔨 Enchère officielle lancée sur REMO !' : '🔨 Official City Card Auction launched on REMO!');
}

function adminExportPNG(side) {
  const spec = buildCurrentStudioSpec();
  const c = getCityById(spec.cityId);
  const cv = document.getElementById(side === 'front' ? 'admFrontCanvas' : 'admBackCanvas');
  downloadCanvasAsPNG(cv, `REMO_${c.code}_${spec.serial}_${side.toUpperCase()}_300DPI.png`);
}

function adminPrintCurrentSheet(side) {
  const spec = buildCurrentStudioSpec();
  const nineCopies = Array.from({ length: 9 }, (_, i) => ({
    ...spec,
    serial: String(Number(spec.serial) + i).padStart(4, '0')
  }));
  openCityPrintSuite(nineCopies, side);
}

function adminPrintAllCitiesDeck(side) {
  const baseSpec = buildCurrentStudioSpec();
  const allSpecs = getRemoCities().map((c, idx) => ({
    ...baseSpec,
    cityId: c.id,
    title: '',
    serial: String(idx + 1).padStart(4, '0'),
    rarity: c.rarity,
    themeId: c.themeId,
    coinValue: c.baseValue,
    stats: c.stats,
    _loadedPhotoImg: null
  }));
  openCityPrintSuite(allSpecs, side);
}

/* ── 4. CITIES, SCORES & 15-MIN FLASH DROP CONTROLLER ── */
function renderAdminCitiesPanel() {
  const lang = REMO_I18N.getLang();
  const fdSel = document.getElementById('admFlashCitySelect');
  const tbody = document.getElementById('admCitiesTableBody');
  const cities = getRemoCities();

  if (fdSel) {
    fdSel.innerHTML = cities.map((c) =>
      `<option value="${c.id}">${c.flag} ${getCityName(c, lang)} (${c.code})</option>`
    ).join('');
  }

  const vSel = document.getElementById('admVaultCitySelect');
  if (vSel) {
    vSel.innerHTML = cities.map((c) =>
      `<option value="${c.id}">${c.flag} ${getCityName(c, lang)} (${c.code})</option>`
    ).join('');
  }

  if (tbody) {
    tbody.innerHTML = cities.map((c) => {
      const pts = REMO_STORE.state.cityScores[c.id] || 1000;
      const wx = typeof REMO_WEATHER !== 'undefined' ? REMO_WEATHER.getCityLiveStatus(c) : null;
      return `
        <tr>
          <td>
            <b>${c.flag} ${getCityName(c, lang)}</b> <span style="color:var(--muted);">(${c.code})</span>
            ${wx ? `<span style="color:#7dd3fc;font-size:0.74rem;font-weight:800;"> · 🕒 ${wx.timeStr} ${wx.icon} ${wx.tempC}°C</span>` : ''}
            ${wx && wx.isSurge ? `<span style="background:rgba(245,158,11,0.25);color:#fde047;padding:2px 6px;border-radius:99px;font-size:0.68rem;font-weight:900;">⚡ 2X SURGE</span>` : ''}
            ${c.foundedBy ? `<span style="background:rgba(16,185,129,0.2);color:#34d399;padding:2px 6px;border-radius:99px;font-size:0.68rem;font-weight:900;">🌱 @${c.foundedBy}</span>` : ''}
          </td>
          <td>${getCityCountry(c, lang)}</td>
          <td><code>${c.lat.toFixed(2)}, ${c.lng.toFixed(2)}</code></td>
          <td><b style="color:#fbbf24;">${pts.toLocaleString()} PTS</b></td>
          <td style="display:flex;gap:6px;flex-wrap:wrap;">
            <button class="adm-btn ${wx && wx.isSurge ? 'emerald' : 'outline'}" style="padding:5px 10px;" onclick="adminToggleCityWeatherSurge('${c.id}')">${wx && wx.isSurge ? '⛈️ 2X ON' : '⛈️ 2X Surge'}</button>
            <button class="adm-btn outline" style="padding:5px 10px;" onclick="adminBoostCityPoints('${c.id}', 250)">+250 PTS</button>
            <button class="adm-btn gold" style="padding:5px 10px;" onclick="jumpStudioToCity('${c.id}')">🎴 Mint Card</button>
            ${c.communityAdded ? `<button class="adm-btn rose" style="padding:5px 10px;" onclick="adminDeleteCity('${c.id}')">🗑️</button>` : ''}
          </td>
        </tr>
      `;
    }).join('');
  }
}

function jumpStudioToCity(cityId) {
  switchAdminTab('cards');
  const sel = document.getElementById('stCitySelect');
  if (sel) {
    sel.value = cityId;
    onStudioCityChange();
  }
}

function adminBoostCityPoints(cityId, pts) {
  REMO_STORE.addCityScore(cityId, pts);
  renderAdminCitiesPanel();
  admToast(`+${pts} PTS!`);
}

function adminDeleteCity(cityId) {
  const list = getRemoCities().filter((c) => c.id !== cityId);
  saveRemoCities(list);
  delete REMO_STORE.state.cityScores[cityId];
  REMO_STORE.save(true, 'city_deleted');
  refreshAllAdminPanels();
  admToast('🗑️ City removed from REMO.');
}

function adminTriggerFlashDrop() {
  const lang = REMO_I18N.getLang();
  const cityId = document.getElementById('admFlashCitySelect')?.value || 'montreal';
  const c = getCityById(cityId);
  const spot = document.getElementById('admFlashSpot')?.value.trim() || `${getCityName(c, 'en')} Golden Beacon`;
  const coins = Number(document.getElementById('admFlashCoins')?.value || 300);
  const mins = Number(document.getElementById('admFlashMins')?.value || 15);

  REMO_STORE.state.settings.flashDrop = {
    active: true,
    cityId: c.id,
    spotName_en: spot,
    spotName_fr: spot,
    lat: c.lat + 0.004,
    lng: c.lng + 0.004,
    coins,
    bonusCardCityId: c.id,
    expiresAt: Date.now() + mins * 60 * 1000
  };
  REMO_STORE.save(true, 'flash_drop');
  admToast(
    lang === 'fr'
      ? `⚡ Super Flash Drop lancé sur ${c.flag} ${getCityName(c, 'fr')} (${mins} min · +${coins} 🪙) !`
      : `⚡ Super Flash Drop live in ${c.flag} ${getCityName(c, 'en')} (${mins} min · +${coins} 🪙)!`
  );
}

function adminDropFounderGeoVault() {
  const lang = REMO_I18N.getLang();
  const cityId = document.getElementById('admVaultCitySelect')?.value || 'montreal';
  const c = getCityById(cityId);
  if (!c) return;
  const title = document.getElementById('admVaultTitle')?.value.trim() || `${getCityName(c, 'en')} Founder Vault`;
  const clue = document.getElementById('admVaultClue')?.value.trim() || `Look near ${getCityName(c, 'en')} central landmark coordinates!`;
  const coins = Number(document.getElementById('admVaultCoins')?.value || 500);

  const res = REMO_STORE.buryNewGeoVault({
    cityId,
    title_en: title,
    title_fr: title,
    hint_en: clue,
    hint_fr: clue,
    coinsReward: coins,
    radiusMeters: 400,
    lat: c.lat,
    lng: c.lng,
    rarity: 'Mythic 4D',
    cardCityId: cityId
  });

  if (res && res.success) {
    RemoAudio.play('fanfare');
    admToast(
      lang === 'fr'
        ? `💎 Géo-Coffre Fondateur déployé sur ${c.flag} ${getCityName(c, 'fr')} (+${coins} 🪙) !`
        : `💎 Founder Geo-Vault deployed on ${c.flag} ${getCityName(c, 'en')} (+${coins} 🪙)!`
    );
  }
}

function adminAddNewCity(ev) {
  if (ev) ev.preventDefault();
  const lang = REMO_I18N.getLang();
  const nameEn = document.getElementById('newCityNameEn')?.value.trim();
  const nameFr = document.getElementById('newCityNameFr')?.value.trim() || nameEn;
  const code = (document.getElementById('newCityCode')?.value.trim() || 'CTY').toUpperCase().slice(0, 4);
  const flag = document.getElementById('newCityFlag')?.value.trim() || '🏙️';
  const country = document.getElementById('newCityCountry')?.value.trim() || 'World';
  const lat = Number(document.getElementById('newCityLat')?.value || 45.0);
  const lng = Number(document.getElementById('newCityLng')?.value || 0.0);
  const color = document.getElementById('newCityColor')?.value || '#38bdf8';

  if (!nameEn) return;
  const id = nameEn.toLowerCase().replace(/[^a-z0-9]/g, '') + '_' + Date.now().toString(36).slice(-3);
  const cities = getRemoCities();
  cities.push({
    id, code, flag, continent: 'World',
    name_en: nameEn, name_fr: nameFr,
    country_en: country, country_fr: country,
    tagline_en: `${nameEn} Official Collectible Metropolis`,
    tagline_fr: `Métropole Officielle ${nameFr}`,
    desc_en: `Official REMO World City hub for ${nameEn}.`,
    desc_fr: `Hub officiel REMO pour la ville de ${nameFr}.`,
    lat, lng, themeColor: color, themeId: 0,
    element: 'neon', rarity: 'Legendary Gold', baseValue: 8800,
    stats: { culture: 90, nightlife: 90, tech: 90, gastronomy: 90 }
  });
  saveRemoCities(cities);
  REMO_STORE.state.cityScores[id] = 1500;
  REMO_STORE.save(true, 'city_added');
  refreshAllAdminPanels();
  admToast(lang === 'fr' ? `🌍 Ville ${flag} ${nameFr} ajoutée à REMO !` : `🌍 City ${flag} ${nameEn} added to REMO!`);
}

/* ── 5. CITY WARS & DAILY PULSE CONTROLLER ── */
function renderAdminWarsAndPulsePanel() {
  const lang = REMO_I18N.getLang();
  const cities = getRemoCities();
  const selA = document.getElementById('admWarCityA');
  const selB = document.getElementById('admWarCityB');
  if (selA && selB) {
    const opts = cities.map((c) => `<option value="${c.id}">${c.flag} ${getCityName(c, lang)}</option>`).join('');
    selA.innerHTML = opts;
    selB.innerHTML = opts;
    if (cities[2]) selB.value = cities[2].id;
  }

  const dp = REMO_STORE.state.settings.dailyPulse || {};
  if (document.getElementById('admPulseTag')) {
    document.getElementById('admPulseTag').value = dp.hashtag || '#RemoPulse';
    document.getElementById('admPulseEn').value = dp.title_en || '';
    document.getElementById('admPulseFr').value = dp.title_fr || '';
    document.getElementById('admPulseReward').value = dp.reward || 25;
  }

  const wList = document.getElementById('admActiveWarsTable');
  if (wList) {
    const activeWars = (REMO_STORE.state.duels || []).filter((w) => w && (!REMO_STORE.deletedDuelIds || !REMO_STORE.deletedDuelIds.has(w.id)));
    if (!activeWars.length) {
      wList.innerHTML = `<tr><td colspan="3" style="text-align:center;color:var(--muted);padding:14px;font-size:0.85rem;">${lang === 'fr' ? 'Aucune guerre de villes active. Cliquez sur "Start Live City War" pour en lancer une !' : 'No active city wars. Click "Start Live City War" to launch one!'}</td></tr>`;
    } else {
      wList.innerHTML = activeWars.map((w) => {
        const cA = getCityById(w.cityA) || { flag: '🏙️', name_en: w.cityA, name_fr: w.cityA },
              cB = getCityById(w.cityB) || { flag: '🏙️', name_en: w.cityB, name_fr: w.cityB };
        return `
          <tr>
            <td><b>${lang === 'fr' ? (w.title_fr || w.title_en) : (w.title_en || w.title_fr)}</b></td>
            <td>${cA.flag} ${getCityName(cA, lang)} (${w.votesA}) vs ${cB.flag} ${getCityName(cB, lang)} (${w.votesB})</td>
            <td><button class="adm-btn rose" style="padding:5px 10px;" onclick="adminDeleteWar('${w.id}')">✕</button></td>
          </tr>
        `;
      }).join('');
    }
  }

  const vList = document.getElementById('admActiveVersusTable');
  if (vList) {
    const versusPosts = (REMO_STORE.state.posts || []).filter((p) => p && p.versus);
    if (!versusPosts.length) {
      vList.innerHTML = `<tr><td colspan="4" style="text-align:center;color:var(--muted);padding:10px;">No official city duels published yet. Use Creator Studio ⚔️ City Versus Duel tab as Admin to launch one!</td></tr>`;
    } else {
      const now = Date.now();
      vList.innerHTML = versusPosts.map((p) => {
        const v = p.versus;
        const cA = getCityById(v.leftCityId || 'montreal') || { flag: '⚜️', code: 'MTL' };
        const cB = getCityById(v.rightCityId || 'paris') || { flag: '🗼', code: 'PAR' };
        const endsAt = Number(v.endsAt || (p.createdAt ? p.createdAt + 86400000 : now));
        const isClosed = Boolean(v.closed) || now >= endsAt;
        const statusStr = isClosed ? '🏆 Closed' : `⏳ Active (${Math.max(0, Math.round((endsAt - now) / 3600000))}h left)`;
        return `
          <tr>
            <td><b>${cA.flag} ${cA.code} (${v.leftVotes || 0}) vs ${cB.flag} ${cB.code} (${v.rightVotes || 0})</b></td>
            <td><span class="adm-badge ${isClosed ? 'grey' : 'gold'}">${statusStr}</span></td>
            <td>${(v.voters || []).length} votes</td>
            <td style="display:flex;gap:6px;">
              ${!isClosed ? `<button class="adm-btn gold" style="padding:4px 8px;font-size:0.75rem;" onclick="adminConcludeVersusFromAdmin('${p.id}')">👑 Conclude</button>` : ''}
              <button class="adm-btn rose" style="padding:4px 8px;font-size:0.75rem;" onclick="adminDeleteVersusFromAdmin('${p.id}')">✕ Delete</button>
            </td>
          </tr>
        `;
      }).join('');
    }
  }
}

function adminConcludeVersusFromAdmin(postId) {
  const p = (REMO_STORE.state.posts || []).find((x) => x && x.id === postId);
  if (!p || !p.versus) return;
  p.versus.closed = true;
  p.versus.endsAt = Date.now() - 1000;
  const lV = Number(p.versus.leftVotes || 0);
  const rV = Number(p.versus.rightVotes || 0);
  p.versus.winnerSide = lV > rV ? 'left' : (rV > lV ? 'right' : 'tie');
  REMO_STORE.save(true, 'admin_conclude_versus');
  renderAdminWarsAndPulsePanel();
  admToast('👑 Official City Duel concluded!');
}
window.adminConcludeVersusFromAdmin = adminConcludeVersusFromAdmin;

function adminDeleteVersusFromAdmin(postId) {
  const lang = REMO_I18N.getLang();
  REMO_STORE.deletePostFromCloud(postId);
  REMO_STORE.save(true, 'admin_delete_versus');
  renderAdminWarsAndPulsePanel();
  admToast(lang === 'fr' ? '🗑️ Duel officiel supprimé !' : '🗑️ Official City Duel deleted!');
}
window.adminDeleteVersusFromAdmin = adminDeleteVersusFromAdmin;

function adminCreateCityWar() {
  const lang = REMO_I18N.getLang();
  const tEn = document.getElementById('admWarTitleEn')?.value.trim() || 'World City Showdown';
  const tFr = document.getElementById('admWarTitleFr')?.value.trim() || tEn;
  const cityA = document.getElementById('admWarCityA')?.value || 'montreal';
  const cityB = document.getElementById('admWarCityB')?.value || 'chisinau';
  const warId = 'war_' + Date.now();
  if (REMO_STORE.deletedDuelIds) {
    REMO_STORE.deletedDuelIds.delete(warId);
  }
  REMO_STORE.state.duels = Array.isArray(REMO_STORE.state.duels) ? REMO_STORE.state.duels : [];
  REMO_STORE.state.duels.unshift({
    id: warId,
    title_en: tEn,
    title_fr: tFr,
    cityA,
    cityB,
    votesA: 10,
    votesB: 10,
    voters: []
  });
  REMO_STORE.save(true, 'war_created');
  REMO_STORE.syncToFirestore('war_created', true);
  renderAdminWarsAndPulsePanel();
  admToast(lang === 'fr' ? '⚔️ Nouvelle Guerre des Villes lancée !' : '⚔️ New Live City War launched!');
}

function adminDeleteWar(warId) {
  const lang = REMO_I18N.getLang();
  REMO_STORE.deleteWar(warId);
  renderAdminWarsAndPulsePanel();
  admToast(lang === 'fr' ? '🗑️ Guerre des villes supprimée !' : '🗑️ City War deleted permanently!');
}

function adminPurgeAllWars() {
  const lang = REMO_I18N.getLang();
  const msg = lang === 'fr'
    ? 'Supprimer définitivement TOUTES les guerres de villes actives ?'
    : 'Permanently delete ALL active city wars?';
  if (!confirm(msg)) return;
  REMO_STORE.purgeAllWars();
  renderAdminWarsAndPulsePanel();
  admToast(lang === 'fr' ? '🗑️ Toutes les guerres ont été supprimées !' : '🗑️ All city wars deleted permanently!');
}
window.adminPurgeAllWars = adminPurgeAllWars;

function adminSaveDailyPulse() {
  REMO_STORE.state.settings.dailyPulse = {
    active: true,
    hashtag: document.getElementById('admPulseTag')?.value.trim() || '#RemoPulse',
    title_en: document.getElementById('admPulseEn')?.value.trim() || '',
    title_fr: document.getElementById('admPulseFr')?.value.trim() || '',
    reward: Number(document.getElementById('admPulseReward')?.value || 25)
  };
  REMO_STORE.save(true, 'pulse_saved');
  admToast('⚡ Daily City Pulse updated!');
}

/* ── 6. CENTRAL BANK, DIRECT COIN TRANSFERS, PROMO CODES & AUCTIONS ── */
function renderAdminEconomyPanel() {
  const lang = REMO_I18N.getLang();
  const hhBtn = document.getElementById('admBtnHappyHour');
  if (hhBtn) {
    hhBtn.textContent = REMO_STORE.state.settings.happyHour2x
      ? '🟢 2X Happy Hour: ON'
      : '⚡ 2X Happy Hour: OFF';
  }

  const uSel = document.getElementById('admBankTargetUser');
  if (uSel) {
    const prev = uSel.value;
    uSel.innerHTML = (REMO_STORE.state.users || []).map((u) => {
      const c = getCityById(u.homeCity);
      return `<option value="${u.uid}" ${u.uid === prev ? 'selected' : ''}>${c.flag} @${u.name} (#${u.passportNum}) — 🪙 ${u.coins.toLocaleString()}</option>`;
    }).join('');
  }

  const promoCitySel = document.getElementById('admPromoCardCitySel');
  if (promoCitySel) {
    promoCitySel.innerHTML = `<option value="">— No Card —</option>` +
      getRemoCities().map((c) => `<option value="${c.id}">🎴 +${c.flag} ${getCityName(c, lang)}</option>`).join('');
  }

  // 👑 Royal Sovereign Coin Serialization Bureau
  const mintUserSel = document.getElementById('admMintTargetUser');
  if (mintUserSel) {
    mintUserSel.innerHTML = `<option value="vault">🏛️ Keep in Founder Treasury Vault</option>` +
      (REMO_STORE.state.users || []).map((u) => {
        const c = getCityById(u.homeCity);
        return `<option value="${u.uid}">${c ? c.flag : '👤'} @${u.name} (#${u.passportNum})</option>`;
      }).join('');
  }

  const serials = REMO_STORE.getSerializedCoins();
  const nextSerial = String(serials.length + 1).padStart(4, '0');
  const serialInp = document.getElementById('admMintSerialInp');
  if (serialInp) {
    if (!serialInp.value) serialInp.value = nextSerial;
    serialInp.oninput = () => {
      const s = serialInp.value.trim() || '0001';
      const clean = s.startsWith('#') ? s.slice(1) : s;
      const tp = document.getElementById('admLivePreviewTextPath');
      if (tp) tp.textContent = `SERIAL № ${clean} • 100% VERIFIED`;
    };
    // Trigger initial live preview
    const curVal = serialInp.value.trim() || '0001';
    const cleanCur = curVal.startsWith('#') ? curVal.slice(1) : curVal;
    const tp = document.getElementById('admLivePreviewTextPath');
    if (tp) tp.textContent = `SERIAL № ${cleanCur} • 100% VERIFIED`;
  }

  const mintedTbl = document.getElementById('admMintedCoinsTableBody');
  if (mintedTbl) {
    mintedTbl.innerHTML = serials.map((sc) => {
      const cfg = REMO_STORE.getAlloyConfig(sc.alloy || 'genesis');
      return `
        <tr>
          <td><b style="color:#fbbf24;font-family:'Orbitron',monospace;letter-spacing:1px;">#${sc.serial}</b></td>
          <td>
            <span style="background:${cfg.badgeBg};color:${cfg.badgeColor};border:1px solid ${cfg.rimBorder};padding:2px 8px;border-radius:99px;font-size:0.7rem;font-weight:900;display:inline-flex;align-items:center;gap:4px;">
              ${cfg.icon} ${cfg.name.split(' (')[0]}
            </span>
          </td>
          <td><b style="color:#fde047;">+${sc.coinsValue} 🪙</b></td>
          <td><span style="color:#38bdf8;font-weight:700;">${sc.ownerName || 'Founder Vault'}</span></td>
          <td><span style="background:${sc.status === 'assigned' ? 'rgba(16,185,129,0.2)' : 'rgba(56,189,248,0.2)'};color:${sc.status === 'assigned' ? '#34d399' : '#7dd3fc'};padding:2px 8px;border-radius:99px;font-size:0.7rem;font-weight:900;">${sc.status ? sc.status.toUpperCase() : 'VAULT'}</span></td>
          <td>
            <button class="adm-btn outline" style="padding:3px 8px;font-size:0.7rem;border-color:#fbbf24;color:#fbbf24;" onclick="adminExportDuplexPrintCoin('${sc.serial}')">🖨️ Print</button>
          </td>
        </tr>
      `;
    }).join('');
  }

  const promoTbl = document.getElementById('admPromoCodesTable');
  if (promoTbl) {
    promoTbl.innerHTML = (REMO_STORE.state.promoCodes || []).map((pc) => `
      <tr>
        <td><b style="color:#38bdf8;font-family:monospace;">${pc.code}</b></td>
        <td><b style="color:#fbbf24;">+${pc.coins} 🪙</b> ${pc.bonusCityCard ? `+ 🎴 ${pc.bonusCityCard.toUpperCase()}` : ''}</td>
        <td>${(pc.redeemedBy || []).length} citizens</td>
        <td><button class="adm-btn rose" style="padding:4px 9px;" onclick="adminDeletePromoCode('${pc.code}')">✕</button></td>
      </tr>
    `).join('');
  }

  const r = REMO_STORE.state.settings.rewards;
  const mapIds = {
    rwSignup: 'signupBonus', rwPost: 'postReward', rwPulse: 'pulseReward',
    rwVote: 'duelVoteReward', rwPvp: 'pvpWinReward', rwPack: 'packCost',
    rwBoost: 'boostCost', rwMint: 'mintPostCardCost', rwReferral: 'referralBonus'
  };
  Object.entries(mapIds).forEach(([elId, key]) => {
    const el = document.getElementById(elId);
    if (el) el.value = r[key] !== undefined ? r[key] : 100;
  });

  // VIP Boutique Catalog & Voucher Orders inside Admin Office
  const shopTbl = document.getElementById('admVipShopTable');
  if (shopTbl) {
    shopTbl.innerHTML = (REMO_STORE.state.vipShopItems || []).map((it) => `
      <tr>
        <td><b>${it.icon || '💎'} ${lang === 'fr' ? (it.name_fr || it.name_en) : it.name_en}</b></td>
        <td>${it.category.toUpperCase()}</td>
        <td><b style="color:#fbbf24;">🪙 ${it.price}</b></td>
        <td><button class="adm-btn rose" style="padding:4px 9px;" onclick="adminRemoveVipShopItem('${it.id}')">🗑️</button></td>
      </tr>
    `).join('');
  }
  const ordTbl = document.getElementById('admVipOrdersTable');
  if (ordTbl) {
    const ords = REMO_STORE.state.vipOrders || [];
    ordTbl.innerHTML = ords.length === 0
      ? `<tr><td colspan="4" style="color:var(--muted);">No VIP vouchers redeemed yet.</td></tr>`
      : ords.map((o) => `
          <tr>
            <td><b style="color:#fbbf24;font-family:monospace;">${o.ticketCode}</b></td>
            <td>@${o.userName}</td>
            <td>${o.itemName}</td>
            <td>
              ${o.status === 'delivered'
                ? '<span style="color:#10b981;font-weight:900;">✓ DELIVERED</span>'
                : `<button class="adm-btn emerald" style="padding:4px 9px;" onclick="adminDeliverVipOrder('${o.id}')">✓ Mark Delivered</button>`}
            </td>
          </tr>
        `).join('');
  }

  const aucBody = document.getElementById('admAuctionsTable');
  if (aucBody) {
    aucBody.innerHTML = (REMO_STORE.state.auctions || []).map((a) => {
      const c = getCityById(a.cardSpec.cityId);
      return `
        <tr>
          <td>${c.flag} ${c.code} #${a.cardSpec.serial} (${a.cardSpec.rarity})</td>
          <td>${a.sellerName}</td>
          <td><b style="color:#fbbf24;">🪙 ${a.currentBid}</b> (${a.highestBidder})</td>
          <td><button class="adm-btn rose" style="padding:5px 10px;" onclick="adminRemoveAuction('${a.id}')">✕</button></td>
        </tr>
      `;
    }).join('');
  }
}

function adminExecuteBankTransfer() {
  const lang = REMO_I18N.getLang();
  const uid = document.getElementById('admBankTargetUser')?.value;
  const mode = document.getElementById('admBankTransferMode')?.value || 'add';
  const amt = Number(document.getElementById('admBankAmount')?.value || 0);
  const note = document.getElementById('admBankNote')?.value || '';
  if (!uid || amt < 0) return;
  const u = REMO_STORE.adminAdjustUserCoins(uid, mode, amt, note);
  if (u) {
    refreshAllAdminPanels();
    admToast(lang === 'fr' ? `🪙 Portefeuille de @${u.name} : ${u.coins.toLocaleString()} 🪙 !` : `🪙 @${u.name} wallet updated: ${u.coins.toLocaleString()} 🪙!`);
  }
}

function adminOnAlloySelectChange() {
  const alloy = document.getElementById('admMintAlloySelect')?.value || 'genesis';
  const cfg = REMO_STORE.getAlloyConfig(alloy);

  const descEl = document.getElementById('admMintAlloyDesc');
  if (descEl) descEl.textContent = `${cfg.icon} ${cfg.spec}`;

  const frontImg = document.getElementById('admLivePreviewFront');
  const backWrap = document.getElementById('admLivePreviewBackWrap');
  if (frontImg) frontImg.style.filter = cfg.filter;
  if (backWrap) backWrap.style.filter = cfg.filter;

  const gradEl = document.getElementById('admPreviewGold');
  if (gradEl && cfg.goldGrad) {
    gradEl.innerHTML = `
      <stop offset="0%" stop-color="${cfg.goldGrad[0]}" />
      <stop offset="25%" stop-color="${cfg.goldGrad[1]}" />
      <stop offset="60%" stop-color="${cfg.goldGrad[2]}" />
      <stop offset="90%" stop-color="${cfg.goldGrad[3]}" />
      <stop offset="100%" stop-color="${cfg.goldGrad[4]}" />
    `;
  }

  RemoAudio.play(cfg.sound || 'goldchime');
}

function adminExecuteMintSerializedCoin() {
  const lang = REMO_I18N.getLang();
  const serial = document.getElementById('admMintSerialInp')?.value.trim() || '0001';
  const coins = Number(document.getElementById('admMintCoinsInp')?.value || 500);
  const targetUid = document.getElementById('admMintTargetUser')?.value || 'vault';
  const note = document.getElementById('admMintNoteInp')?.value.trim() || '';
  const alloy = document.getElementById('admMintAlloySelect')?.value || 'genesis';

  const res = REMO_STORE.mintSerializedCoin(serial, coins, targetUid, note, alloy);
  if (!res.success) {
    if (res.reason === 'duplicate_serial') {
      admToast(lang === 'fr' ? `❌ Le numéro de série #${serial} existe déjà !` : `❌ Serial number #${serial} already exists!`);
    } else {
      admToast(lang === 'fr' ? '❌ Erreur de frappe de la pièce.' : '❌ Minting error.');
    }
    return;
  }

  refreshAllAdminPanels();
  const cfg = REMO_STORE.getAlloyConfig(alloy);
  RemoAudio.play(cfg.sound || 'goldchime');
  admToast(lang === 'fr' 
    ? `👑 Pièce Souveraine #${serial} (${cfg.nameFr.split(' (')[0]}) frappée avec succès (+${coins} 🪙) !` 
    : `👑 Sovereign Coin #${serial} (${cfg.name.split(' (')[0]}) minted successfully (+${coins} 🪙)!`);
}

function adminExportDuplexPrintCoin(serial = '') {
  const lang = REMO_I18N.getLang();
  const serials = REMO_STORE.getSerializedCoins();
  const inpVal = document.getElementById('admMintSerialInp') ? document.getElementById('admMintSerialInp').value.trim() : '';
  const chosenSerial = serial || inpVal || (serials[0] ? serials[0].serial : '0001');
  const coin = serials.find((c) => c.serial === chosenSerial) || { serial: chosenSerial, coinsValue: 500 };
  const sNum = coin ? coin.serial : chosenSerial;
  const alloy = coin.alloy || (document.getElementById('admMintAlloySelect')?.value) || 'genesis';
  const cfg = REMO_STORE.getAlloyConfig(alloy);

  const w = window.open('', '_blank');
  if (!w) return;

  w.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>REMO Official Sovereign Coin #${sNum} — 300 DPI Duplex Print</title>
      <style>
        body { margin: 0; padding: 24px; font-family: 'Segoe UI', sans-serif; background: #070a14; color: #fff; text-align: center; }
        .sheet { max-width: 800px; margin: 0 auto; background: #0b1120; border: 2px solid ${cfg.rimBorder}; border-radius: 20px; padding: 28px; box-shadow: 0 10px 40px rgba(0,0,0,0.8); }
        .hdr { font-size: 20px; font-weight: 900; color: #fbbf24; letter-spacing: 2px; margin-bottom: 6px; }
        .sub { font-size: 13px; color: #94a3b8; margin-bottom: 24px; }
        .coins-row { display: flex; justify-content: center; gap: 40px; flex-wrap: wrap; margin: 24px 0; }
        .disc { width: 260px; height: 260px; border-radius: 50%; border: 3px dashed ${cfg.rimBorder}; box-shadow: 0 8px 30px rgba(0,0,0,0.7); object-fit: cover; filter: ${cfg.filter}; }
        .tag { font-size: 13px; font-weight: 800; color: #38bdf8; margin-top: 10px; }
        .cut-hint { font-size: 12px; color: #cbd5e1; margin-top: 20px; border-top: 1px solid #1e293b; padding-top: 16px; font-style: italic; }
        @media print {
          body { background: #fff; color: #000; padding: 0; }
          .sheet { border: 2px solid #000; box-shadow: none; background: #fff; color: #000; }
          .hdr { color: #000; }
          .sub { color: #555; }
          .disc { border: 2px dashed #000; }
          .tag { color: #000; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="sheet">
        <div class="hdr">★ REMO CENTRAL TREASURY ★</div>
        <div class="sub">
          Official Sovereign Bearer Coin #${sNum} · Value: +${coin.coinsValue || 500} REMO Coins<br>
          <span style="display:inline-block;margin-top:6px;background:${cfg.badgeBg};color:${cfg.badgeColor};border:1px solid ${cfg.rimBorder};padding:3px 12px;border-radius:99px;font-size:12px;font-weight:900;">
            ${cfg.icon} ${cfg.name}
          </span><br>
          <span style="font-size:11px;color:#94a3b8;font-style:italic;">Composition: ${cfg.spec}</span>
        </div>
        <div class="coins-row">
          <div>
            <img class="disc" src="img/remo_coin_front.png" alt="Front">
            <div class="tag">OBVERSE (FRONT)</div>
          </div>
          <div>
            <div style="position:relative;width:260px;height:260px;display:inline-block;">
              <svg viewBox="0 0 1024 1024" class="disc" style="width:260px;height:260px;display:block;">
                <defs>
                  <path id="printArc" d="M 87,587 A 432 432 0 0 0 937,587" fill="none" />
                  <linearGradient id="printGold" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="${cfg.goldGrad[0]}" />
                    <stop offset="25%" stop-color="${cfg.goldGrad[1]}" />
                    <stop offset="60%" stop-color="${cfg.goldGrad[2]}" />
                    <stop offset="90%" stop-color="${cfg.goldGrad[3]}" />
                    <stop offset="100%" stop-color="${cfg.goldGrad[4]}" />
                  </linearGradient>
                  <filter id="printEmboss" x="-10%" y="-10%" width="120%" height="120%">
                    <feDropShadow dx="1" dy="2" stdDeviation="1.5" flood-color="#0a0501" flood-opacity="0.95" />
                    <feDropShadow dx="-1" dy="-1" stdDeviation="0.8" flood-color="#fffdf0" flood-opacity="0.75" />
                  </filter>
                </defs>
                <image href="img/remo_coin_back_base.png" width="1024" height="1024" />
                <text font-family="'Times New Roman', Georgia, serif" font-weight="900" font-size="44" letter-spacing="2px"
                      fill="url(#printGold)" stroke="#78350f" stroke-width="1.2" stroke-linejoin="round"
                      filter="url(#printEmboss)">
                  <textPath href="#printArc" startOffset="50%" text-anchor="middle">
                    SERIAL № ${sNum} • 100% VERIFIED
                  </textPath>
                </text>
              </svg>
            </div>
            <div class="tag">REVERSE (BACK · SERIAL № ${sNum})</div>
          </div>
        </div>
        <div class="cut-hint">
          ✂️ Cut along the circular dashed border to place in a standard 60-70mm acrylic collector coin capsule.
        </div>
        <div style="margin-top:20px;" class="no-print">
          <button onclick="window.print()" style="padding:10px 24px;background:#fbbf24;color:#000;font-weight:900;border:none;border-radius:10px;cursor:pointer;font-size:14px;">🖨️ Print Coin Sheet Now</button>
        </div>
      </div>
    </body>
    </html>
  `);
  w.document.close();
}

function adminCreateNewCitizenPrompt() {
  const lang = REMO_I18N.getLang();
  const name = prompt(lang === 'fr' ? 'Nom du nouveau Citoyen :' : 'New Citizen Name:');
  if (!name || !name.trim()) return;
  const coins = Math.max(0, Number(prompt(lang === 'fr' ? 'Solde initial de Pièces REMO :' : 'Starting REMO Coins:', '500') || 0));
  const pNum = String((REMO_STORE.state.users || []).length + 1).padStart(4, '0');
  REMO_STORE.state.users.push({
    uid: 'u_' + Date.now().toString(36),
    name: name.trim(),
    email: `${name.trim().toLowerCase().replace(/[^a-z0-9]/g, '')}@remo.world`,
    role: 'citizen',
    verified: true,
    homeCity: 'montreal',
    passportNum: pNum,
    coins,
    lifetimeCoins: coins,
    streak: 1,
    visas: ['montreal'],
    avatarColor: '#38bdf8'
  });
  REMO_STORE.save(true, 'admin_create_user');
  refreshAllAdminPanels();
  admToast(`👤 Citizen @${name.trim()} (#${pNum}) created with ${coins} 🪙!`);
}

function adminCreatePromoCode() {
  const code = (document.getElementById('admPromoCodeInp')?.value || '').trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
  const coins = Math.max(10, Number(document.getElementById('admPromoCoinsInp')?.value || 500));
  const bonusCityCard = document.getElementById('admPromoCardCitySel')?.value || '';
  if (!code) return;
  REMO_STORE.state.promoCodes = (REMO_STORE.state.promoCodes || []).filter((c) => c.code !== code);
  REMO_STORE.state.promoCodes.unshift({ code, coins, bonusCityCard, maxUses: 500, redeemedBy: [] });
  REMO_STORE.save(true, 'promo_new');
  document.getElementById('admPromoCodeInp').value = '';
  renderAdminEconomyPanel();
  admToast(`🎟️ Promo Code ${code} (+${coins} 🪙) live!`);
}

function adminDeletePromoCode(code) {
  REMO_STORE.state.promoCodes = (REMO_STORE.state.promoCodes || []).filter((c) => c.code !== code);
  REMO_STORE.save(true, 'promo_del');
  renderAdminEconomyPanel();
}

function adminSaveEconomyRates() {
  const r = REMO_STORE.state.settings.rewards;
  r.signupBonus = Number(document.getElementById('rwSignup')?.value || 150);
  r.postReward = Number(document.getElementById('rwPost')?.value || 15);
  r.pulseReward = Number(document.getElementById('rwPulse')?.value || 25);
  r.duelVoteReward = Number(document.getElementById('rwVote')?.value || 20);
  r.pvpWinReward = Number(document.getElementById('rwPvp')?.value || 35);
  r.packCost = Number(document.getElementById('rwPack')?.value || 150);
  r.boostCost = Number(document.getElementById('rwBoost')?.value || 50);
  r.mintPostCardCost = Number(document.getElementById('rwMint')?.value || 100);
  r.referralBonus = Number(document.getElementById('rwReferral')?.value || 100);
  REMO_STORE.save(true, 'economy');
  admToast('🪙 Central Bank rates updated live!');
}

function adminAddVipStoreItemFromOffice() {
  const lang = REMO_I18N.getLang();
  const title = prompt(lang === 'fr' ? 'Nom de l’article / cadeau VIP :' : 'VIP Store Item / Real Voucher Title:');
  if (!title || !title.trim()) return;
  const price = Math.max(10, Number(prompt(lang === 'fr' ? 'Prix en Pièces REMO :' : 'Price in REMO Coins:', '500') || 500));
  const desc = prompt(lang === 'fr' ? 'Description :' : 'Description:', 'Official VIP Founder Reward!') || '';
  const pair = REMO_TRANSLATOR.makeBilingualPair(title.trim());
  const dPair = REMO_TRANSLATOR.makeBilingualPair(desc.trim());
  REMO_STORE.state.vipShopItems.unshift({
    id: 'perk_adm_' + Date.now(),
    category: 'perk',
    icon: '🎁',
    name_en: pair.en,
    name_fr: pair.fr,
    desc_en: dPair.en,
    desc_fr: dPair.fr,
    price
  });
  REMO_STORE.save(true, 'vip_item_added');
  renderAdminEconomyPanel();
  admToast('🛍️ VIP Boutique item added live!');
}

function adminRemoveVipShopItem(itemId) {
  REMO_STORE.state.vipShopItems = (REMO_STORE.state.vipShopItems || []).filter((x) => x.id !== itemId);
  REMO_STORE.save(true, 'vip_item_del');
  renderAdminEconomyPanel();
}

function adminDeliverVipOrder(ordId) {
  const o = (REMO_STORE.state.vipOrders || []).find((x) => x.id === ordId);
  if (o) o.status = 'delivered';
  REMO_STORE.save(true, 'vip_order_delivered');
  renderAdminEconomyPanel();
  admToast('✓ VIP Voucher marked Delivered!');
}

function adminRemoveAuction(aucId) {
  REMO_STORE.state.auctions = REMO_STORE.state.auctions.filter((a) => a.id !== aucId);
  REMO_STORE.save(true, 'auction_del');
  renderAdminEconomyPanel();
}

/* ── 7. USERS, CITY MAYORS & POSTS EXECUTIVE MODERATION ── */
function escapeHtmlStr(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderAdminModerationPanel() {
  const lang = REMO_I18N.getLang();
  const uBody = document.getElementById('admUsersTable');
  if (uBody) {
    uBody.innerHTML = (REMO_STORE.state.users || []).map((u) => {
      const hc = getCityById(u.homeCity);
      const isMayor = REMO_STORE.state.cityMayors && REMO_STORE.state.cityMayors[u.homeCity] === u.uid;
      return `
        <tr style="${u.banned ? 'opacity:0.5;' : ''}">
          <td>
            <b>${escapeHtmlStr(u.name)}</b> ${u.verified ? '<span style="color:#38bdf8;">✓</span>' : ''}
            ${isMayor ? '<span style="background:#f59e0b;color:#000;padding:2px 6px;border-radius:99px;font-size:0.68rem;font-weight:900;">👑 MAYOR</span>' : ''}
            <span style="color:var(--muted);">#${u.passportNum}</span>
            <span style="color:#34d399;font-size:0.75rem;font-weight:800;"> · 🤝 ${u.referralsCount || 0} (${u.referralCode || 'REMO-' + u.passportNum})</span>
            ${u.email ? `<br><small style="color:#94a3b8;font-size:0.72rem;">✉️ ${escapeHtmlStr(u.email)}</small>` : ''}
          </td>
          <td>${hc.flag} ${getCityName(hc, lang)}</td>
          <td><b style="color:#fbbf24;">🪙 ${(u.coins || 0).toLocaleString()}</b></td>
          <td style="display:flex;gap:6px;flex-wrap:wrap;">
            <button class="adm-btn gold" style="padding:5px 10px;" onclick="adminCustomCoinPrompt('${u.uid}')">🪙 Give / Set Coins</button>
            <button class="adm-btn emerald" style="padding:5px 10px;" onclick="adminToggleCityMayor('${u.uid}')">👑 Mayor</button>
            <button class="adm-btn outline" style="padding:5px 10px;" onclick="adminToggleVerifyUser('${u.uid}')">✓ VIP</button>
            <button class="adm-btn rose" style="padding:5px 10px;" onclick="adminToggleBanUser('${u.uid}')">${u.banned ? 'Unban' : '🚫 Ban'}</button>
            ${u.role !== 'admin' ? `<button class="adm-btn rose" style="padding:5px 10px;" onclick="adminDeleteCitizen('${u.uid}')">🗑️</button>` : ''}
          </td>
        </tr>
      `;
    }).join('');
  }

  // Live Direct Messages table in Admin Executive Office
  const dmBody = document.getElementById('admDirectMsgsTable');
  if (dmBody) {
    const dms = (REMO_STORE.state.directMessages || []).slice().sort((a, b) => (b.ts || 0) - (a.ts || 0)).slice(0, 30);
    dmBody.innerHTML = dms.length ? dms.map((d) => {
      const fromU = (REMO_STORE.state.users || []).find((x) => x.uid === d.fromUid) || { name: d.fromName || 'Citizen' };
      const toU = (REMO_STORE.state.users || []).find((x) => x.uid === d.toUid) || { name: d.toUid === 'u_admin_founder' ? 'REMO Founder' : 'Citizen' };
      const dateStr = d.ts ? new Date(d.ts).toLocaleTimeString() : '';
      return `
        <tr>
          <td><b style="color:#7dd3fc;">@${escapeHtmlStr(fromU.name || d.fromName)}</b></td>
          <td><b style="color:#fbbf24;">@${escapeHtmlStr(toU.name || d.toUid)}</b></td>
          <td><span style="color:#f8fafc;">${d.text ? escapeHtmlStr(d.text) : (d.voiceUrl ? '🎤 Note Vocale' : (d.envelopeCoins ? '🧧 Enveloppe ' + d.envelopeCoins + '🪙' : '✉️ Message'))}</span></td>
          <td style="color:var(--muted);font-size:0.75rem;">${dateStr}</td>
          <td>
            <button class="adm-btn rose" style="padding:4px 8px;" onclick="adminDeleteDmFromOffice('${d.id}')">🗑️</button>
          </td>
        </tr>
      `;
    }).join('') : `<tr><td colspan="5" style="text-align:center;color:var(--muted);padding:14px;">Aucun message privé pour le moment.</td></tr>`;
  }

  const pBody = document.getElementById('admPostsTable');
  if (pBody) {
    pBody.innerHTML = (REMO_STORE.state.posts || []).map((p) => {
      const c = getCityById(p.cityId);
      const cap = (lang === 'fr' ? p.caption_fr : p.caption_en) || '';
      const fmtMap = {
        html_app: '<span style="color:#38bdf8;font-weight:800;">💻 HTML</span>',
        video: '<span style="color:#f43f5e;font-weight:800;">🎬 60s</span>',
        image: '<span style="color:#10b981;font-weight:800;">📷 Photo</span>',
        carousel: '<span style="color:#a855f7;font-weight:800;">📷 Multi</span>',
        before_after: '<span style="color:#fbbf24;font-weight:800;">🔀 B/A</span>',
        city_art: '<span style="color:#94a3b8;font-weight:800;">🏙️ Art</span>'
      };
      const fmtBadge = fmtMap[p.mediaType] || fmtMap.city_art;
      const isSealedCapsule = Boolean(p.unlockAt && Number(p.unlockAt) > Date.now());
      return `
        <tr>
          <td>
            <b>@${p.authorName}</b> (${c.flag}) · ${fmtBadge}
            ${p.duetOf ? ' <span style="color:#f472b6;font-weight:900;">🎭 Duet</span>' : ''}
            ${isSealedCapsule ? ' <span style="color:#e879f9;font-weight:900;">⏳ Sealed</span>' : ''}
            ${p.pinned ? ' <span style="color:#fbbf24;font-weight:900;">📌#1</span>' : ''}
            ${p.founderAward ? ' 👑' : ''}
          </td>
          <td>${cap.slice(0, 62)}...</td>
          <td>❤️ ${(p.likes || []).length} · 🪙 ${p.tipsTotal || 0}</td>
          <td style="display:flex;gap:5px;flex-wrap:wrap;">
            ${isSealedCapsule ? `<button class="adm-btn emerald" style="padding:5px 9px;" onclick="adminUnsealCapsuleFromOffice('${p.id}')">🔓 Unseal</button>` : ''}
            <button class="adm-btn gold" style="padding:5px 9px;" onclick="adminTogglePinPost('${p.id}')">${p.pinned ? 'Unpin' : '📌 Pin'}</button>
            <button class="adm-btn emerald" style="padding:5px 9px;" onclick="adminCrownPostAward('${p.id}')">👑 +250🪙</button>
            <button class="adm-btn outline" style="padding:5px 9px;" onclick="adminToggleBoostPost('${p.id}')">${p.boosted ? 'Unboost' : '🚀 Boost'}</button>
            <button class="adm-btn outline" style="padding:5px 9px;" onclick="adminEditPostCaption('${p.id}')">✏️</button>
            <button class="adm-btn rose" style="padding:5px 9px;" onclick="adminDeletePost('${p.id}')">🗑️</button>
          </td>
        </tr>
      `;
    }).join('');
  }
}

function adminDeleteDmFromOffice(dmId) {
  if (!confirm('Supprimer ce message privé ?')) return;
  REMO_STORE.state.directMessages = (REMO_STORE.state.directMessages || []).filter((d) => d.id !== dmId);
  REMO_STORE.save(true, 'dm_del');
  if (REMO_STORE.fbDb) {
    REMO_STORE.fbDb.collection('remo_direct_messages').doc(dmId).delete().catch(() => {});
  }
  renderAdminModerationPanel();
  admToast('🗑️ Message privé supprimé !');
}
window.adminDeleteDmFromOffice = adminDeleteDmFromOffice;

function adminCustomCoinPrompt(uid) {
  const lang = REMO_I18N.getLang();
  const u = (REMO_STORE.state.users || []).find((x) => x.uid === uid);
  if (!u) return;
  const raw = prompt(
    lang === 'fr'
      ? `Combien de Pièces REMO envoyer à @${u.name} ? (Ex: 500 pour ajouter, -200 pour retirer, =5000 pour fixer)`
      : `Enter REMO Coins for @${u.name} (e.g. 500 to add, -200 to deduct, or =5000 to set exact balance):`,
    '500'
  );
  if (!raw || !raw.trim()) return;
  const s = raw.trim();
  if (s.startsWith('=')) {
    REMO_STORE.adminAdjustUserCoins(uid, 'set', Number(s.slice(1)), '👑 Admin Balance Update');
  } else {
    const n = Number(s);
    if (isNaN(n)) return;
    REMO_STORE.adminAdjustUserCoins(uid, n < 0 ? 'sub' : 'add', Math.abs(n), '👑 Admin Transfer');
  }
  REMO_STORE.syncUserToCloud(u);
  refreshAllAdminPanels();
  admToast(`🪙 @${u.name}: ${u.coins.toLocaleString()} 🪙!`);
}

function adminGiftUserCoins(uid, amt) {
  const u = (REMO_STORE.state.users || []).find((x) => x.uid === uid);
  REMO_STORE.adminAdjustUserCoins(uid, 'add', amt, '👑 Admin Gift');
  if (u) REMO_STORE.syncUserToCloud(u);
  refreshAllAdminPanels();
  admToast(`+${amt} 🪙 sent!`);
}

function adminToggleCityMayor(uid) {
  const u = (REMO_STORE.state.users || []).find((x) => x.uid === uid);
  if (!u) return;
  REMO_STORE.state.cityMayors = REMO_STORE.state.cityMayors || {};
  if (REMO_STORE.state.cityMayors[u.homeCity] === uid) {
    delete REMO_STORE.state.cityMayors[u.homeCity];
  } else {
    REMO_STORE.state.cityMayors[u.homeCity] = uid;
  }
  REMO_STORE.save(true, 'mayor_mod');
  REMO_STORE.syncUserToCloud(u);
  renderAdminModerationPanel();
  admToast(`👑 Mayor status updated for @${u.name}!`);
}

function adminToggleVerifyUser(uid) {
  const u = REMO_STORE.state.users.find((x) => x.uid === uid);
  if (u) {
    u.verified = !u.verified;
    REMO_STORE.save(true, 'user_mod');
    REMO_STORE.syncUserToCloud(u);
  }
  renderAdminModerationPanel();
}

function adminToggleBanUser(uid) {
  const u = REMO_STORE.state.users.find((x) => x.uid === uid);
  if (u) {
    u.banned = !u.banned;
    REMO_STORE.save(true, 'user_ban');
    REMO_STORE.syncUserToCloud(u);
  }
  renderAdminModerationPanel();
}

function adminDeleteCitizen(uid) {
  const lang = REMO_I18N.getLang();
  if (!confirm(lang === 'fr' ? 'Supprimer définitivement ce compte ?' : 'Permanently delete this citizen account?')) return;
  REMO_STORE.deleteUserFromCloud(uid);
  refreshAllAdminPanels();
  admToast(lang === 'fr' ? '🗑️ Compte supprimé définitivement !' : '🗑️ Citizen account permanently deleted!');
}

async function adminPurgeFakeUsers() {
  const lang = REMO_I18N.getLang();
  const msg = lang === 'fr'
    ? '⚠️ Nettoyer tous les faux comptes "citizenXXXX@remo.world" ?\nLes vrais comptes (admin, gmail, etc.) seront conservés.'
    : '⚠️ Clean all fake citizen accounts? Real accounts will be kept.';
  if (!confirm(msg)) return;
  admToast('⏳ Nettoyage des comptes en cours...');
  if (typeof REMO_STORE.purgeFakeUsersFromCloud === 'function') {
    await REMO_STORE.purgeFakeUsersFromCloud();
  }
  refreshAllAdminPanels();
  admToast('🗑️ Faux comptes nettoyés avec succès !');
}

function adminTogglePinPost(pid) {
  const p = REMO_STORE.state.posts.find((x) => x.id === pid);
  if (p) p.pinned = !p.pinned;
  REMO_STORE.save(true, 'post_pin');
  renderAdminModerationPanel();
  admToast(p && p.pinned ? '📌 Pinned #1 on REMO!' : 'Unpinned');
}

function adminCrownPostAward(pid) {
  const p = REMO_STORE.state.posts.find((x) => x.id === pid);
  if (!p) return;
  p.founderAward = true;
  if (p.uid) REMO_STORE.adminAdjustUserCoins(p.uid, 'add', 250, '👑 Founder Award!');
  p.tipsTotal = (p.tipsTotal || 0) + 250;
  REMO_STORE.save(true, 'founder_award');
  refreshAllAdminPanels();
  admToast(`👑 Awarded +250 🪙 to @${p.authorName}!`);
}

function adminEditPostCaption(pid) {
  const p = REMO_STORE.state.posts.find((x) => x.id === pid);
  if (!p) return;
  const next = prompt('Edit Post Caption:', p.caption_en || p.caption_fr || '');
  if (next === null) return;
  p.caption_en = next;
  p.caption_fr = next;
  REMO_STORE.save(true, 'post_edit');
  renderAdminModerationPanel();
}

function adminToggleBoostPost(pid) {
  const p = REMO_STORE.state.posts.find((x) => x.id === pid);
  if (p) p.boosted = !p.boosted;
  REMO_STORE.save(true, 'post_mod');
  renderAdminModerationPanel();
}

function adminDeletePost(pid) {
  REMO_STORE.state.posts = REMO_STORE.state.posts.filter((x) => x.id !== pid);
  if (typeof REMO_STORE.deletePostFromCloud === 'function') {
    REMO_STORE.deletePostFromCloud(pid);
  }
  REMO_STORE.save(true, 'post_del');
  refreshAllAdminPanels();
  admToast('🗑️ Post permanently deleted!');
}

async function adminPurgeAllPosts() {
  const lang = REMO_I18N.getLang();
  const msg = lang === 'fr'
    ? '⚠️ VOULEZ-VOUS VRAIMENT SUPPRIMER TOUS LES POSTS DU MONDE ?\nCette action videra complètement le flux pour tous les utilisateurs sur tous les appareils.'
    : '⚠️ ARE YOU SURE YOU WANT TO DELETE ALL POSTS GLOBALLY?\nThis will completely wipe the feed for all users across all devices.';
  if (!confirm(msg)) return;
  admToast('⏳ Suppression de tous les posts en cours...');
  if (typeof REMO_STORE.purgeAllPostsFromCloud === 'function') {
    await REMO_STORE.purgeAllPostsFromCloud();
  }
  refreshAllAdminPanels();
  admToast('🗑️ Tous les posts ont été supprimés avec succès !');
}

/* ── 8. FIREBASE CLOUD, CUSTOM DOMAIN, ADMIN PIN & JSON BACKUP ── */
function renderAdminCloudPanel() {
  const cfg = REMO_STORE.getFirebaseConfig();
  const area = document.getElementById('admFirebaseJson');
  if (area && cfg) area.value = JSON.stringify(cfg, null, 2);
  const dom = document.getElementById('admCustomDomain');
  if (dom) dom.value = localStorage.getItem('remo_custom_domain') || '';
}

function adminSaveFirebaseConfig() {
  const lang = REMO_I18N.getLang();
  const raw = document.getElementById('admFirebaseJson')?.value.trim();
  if (!raw) {
    REMO_STORE.saveFirebaseConfig(null);
    admToast(lang === 'fr' ? 'Mode Local Live activé.' : 'Switched to Local Live Sync mode.');
    refreshAllAdminPanels();
    return;
  }
  try {
    const parsed = JSON.parse(raw);
    REMO_STORE.saveFirebaseConfig(parsed);
    refreshAllAdminPanels();
    admToast(lang === 'fr' ? `☁️ Firebase connecté : ${parsed.projectId}` : `☁️ Firebase Cloud connected: ${parsed.projectId}`);
  } catch (e) {
    alert('Invalid JSON format: ' + e.message);
  }
}

function adminSaveSystemSettings() {
  const dom = document.getElementById('admCustomDomain')?.value.trim() || '';
  if (dom) localStorage.setItem('remo_custom_domain', dom);
  else localStorage.removeItem('remo_custom_domain');

  const newPin = document.getElementById('admNewPin')?.value.trim();
  if (newPin && newPin.length >= 4) {
    REMO_STORE.state.settings.adminPin = newPin;
    REMO_STORE.save(true, 'pin');
  }
  admToast('⚙️ System Settings saved!');
}

function adminExportBackupJSON() {
  const blob = new Blob([JSON.stringify(REMO_STORE.state, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `REMO_Full_Backup_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a); a.click(); a.remove();
}

function adminImportBackupJSON(ev) {
  const f = ev.target.files && ev.target.files[0];
  if (!f) return;
  const rd = new FileReader();
  rd.onload = (e) => {
    try {
      REMO_STORE.state = JSON.parse(e.target.result);
      REMO_STORE.save(true, 'backup_restore');
      refreshAllAdminPanels();
      admToast('✓ REMO Backup restored successfully!');
    } catch (err) {
      alert('JSON Error: ' + err.message);
    }
  };
  rd.readAsText(f);
}

document.addEventListener('DOMContentLoaded', () => {
  REMO_I18N.applyDOM();
  renderAdminCardStudioSelectors();
  onStudioCityChange();
  checkAdminSession();
});

window.addEventListener('remo:langchange', () => {
  refreshAllAdminPanels();
  renderAdminCardStudio();
});

window.addEventListener('remo:stateupdate', () => {
  if (adminCurrentTab !== 'cards') refreshAllAdminPanels();
});

window.unlockAdminOffice = unlockAdminOffice;
window.lockAdminOffice = lockAdminOffice;
window.switchAdminTab = switchAdminTab;
window.saveAdminMegaphone = saveAdminMegaphone;
window.triggerGlobalCoinRainAdmin = triggerGlobalCoinRainAdmin;
window.onStudioCityChange = onStudioCityChange;
window.buildCurrentStudioSpec = buildCurrentStudioSpec;
window.renderAdminCardStudio = renderAdminCardStudio;
window.handleStudioPhotoUpload = handleStudioPhotoUpload;
window.clearStudioPhoto = clearStudioPhoto;
window.adminDropCardLiveToNetwork = adminDropCardLiveToNetwork;
window.adminLaunchCardAuctionFromStudio = adminLaunchCardAuctionFromStudio;
window.adminExportPNG = adminExportPNG;
window.adminPrintCurrentSheet = adminPrintCurrentSheet;
window.adminPrintAllCitiesDeck = adminPrintAllCitiesDeck;
window.jumpStudioToCity = jumpStudioToCity;
window.adminBoostCityPoints = adminBoostCityPoints;
window.adminTriggerFlashDrop = adminTriggerFlashDrop;
window.adminAddNewCity = adminAddNewCity;
window.adminCreateCityWar = adminCreateCityWar;
window.adminDeleteWar = adminDeleteWar;
window.adminPurgeAllWars = adminPurgeAllWars;
window.adminSaveDailyPulse = adminSaveDailyPulse;
window.adminSaveEconomyRates = adminSaveEconomyRates;
window.adminRemoveAuction = adminRemoveAuction;
window.adminGiftUserCoins = adminGiftUserCoins;
window.adminCustomCoinPrompt = adminCustomCoinPrompt;
window.adminExecuteBankTransfer = adminExecuteBankTransfer;
window.adminCreateNewCitizenPrompt = adminCreateNewCitizenPrompt;
window.adminCreatePromoCode = adminCreatePromoCode;
window.adminDeletePromoCode = adminDeletePromoCode;
window.adminToggleHappyHour2x = adminToggleHappyHour2x;
window.adminToggleCityMayor = adminToggleCityMayor;
window.adminToggleBanUser = adminToggleBanUser;
window.adminDeleteCitizen = adminDeleteCitizen;
window.adminPurgeFakeUsers = adminPurgeFakeUsers;
window.adminTogglePinPost = adminTogglePinPost;
window.adminCrownPostAward = adminCrownPostAward;
window.adminEditPostCaption = adminEditPostCaption;
window.adminToggleVerifyUser = adminToggleVerifyUser;
window.adminToggleBoostPost = adminToggleBoostPost;
window.adminDeletePost = adminDeletePost;
window.adminPurgeAllPosts = adminPurgeAllPosts;
window.adminSaveFirebaseConfig = adminSaveFirebaseConfig;
window.adminSaveSystemSettings = adminSaveSystemSettings;
window.adminExportBackupJSON = adminExportBackupJSON;
window.adminImportBackupJSON = adminImportBackupJSON;
function adminToggleCityWeatherSurge(cityId) {
  if (typeof REMO_WEATHER === 'undefined') return;
  const active = REMO_WEATHER.toggleAdminCitySurge(cityId);
  renderAdminCitiesPanel();
  admToast(active ? '⛈️ 2X Weather Surge ACTIVATED!' : '☀️ 2X Weather Surge turned OFF.');
}

function adminUnsealCapsuleFromOffice(postId) {
  const p = (REMO_STORE.state.posts || []).find((x) => x.id === postId);
  if (!p) return;
  p.unlockAt = Date.now() - 1000;
  p.wasTimeCapsule = true;
  REMO_STORE.save(true, 'admin_unseal_capsule');
  renderAdminModerationPanel();
  admToast('🔓 Time-Capsule unsealed globally!');
}

window.adminAddVipStoreItemFromOffice = adminAddVipStoreItemFromOffice;
window.adminRemoveVipShopItem = adminRemoveVipShopItem;
window.adminDeliverVipOrder = adminDeliverVipOrder;
window.adminDeleteCity = adminDeleteCity;
window.adminToggleCityWeatherSurge = adminToggleCityWeatherSurge;
window.adminUnsealCapsuleFromOffice = adminUnsealCapsuleFromOffice;
window.adminOnAlloySelectChange = adminOnAlloySelectChange;


/* ════════════════════════════════════════════════════════════════════
   🎤🏆⚽🕵️🎟️⚡ v69: ADMIN VIRAL CONTESTS COMMAND CENTER CONTROLLER
   ════════════════════════════════════════════════════════════════════ */

let _admPendingEuroAudioUrl = '';

function setContestPillDOM(id, active, statusText) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = statusText;
  el.style.background = active ? 'rgba(16,185,129,0.22)' : 'rgba(255,255,255,0.08)';
  el.style.color = active ? '#6ee7b7' : '#94a3b8';
  el.style.border = active ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.12)';
}

function renderAdminContestsPanel() {
  if (!REMO_STORE || !REMO_STORE.state) return;
  const lang = REMO_I18N.getLang();
  const vc = REMO_STORE.ensureViralContests();
  const cities = getRemoCities();

  const populateCitySel = (selId, defVal) => {
    const sel = document.getElementById(selId);
    if (!sel) return;
    const cur = sel.value || defVal || 'montreal';
    sel.innerHTML = cities.map((c) =>
      `<option value="${c.id}" ${c.id === cur ? 'selected' : ''}>${c.flag} ${getCityName(c, lang)} (${c.code})</option>`
    ).join('');
  };

  populateCitySel('admEuroAddCity', 'montreal');
  populateCitySel('admMdCity', (vc.mysteryDetective && vc.mysteryDetective.correctCityId) || 'paris');
  populateCitySel('admFhCity', (vc.flashHunt && vc.flashHunt.targetCityId) || 'montreal');

  // 1. Eurovision Status & Table
  const ev = vc.eurovision || {};
  setContestPillDOM('admEuroStatusPill', !!ev.active, ev.active ? `🟢 LIVE (${(ev.entries || []).length} songs)` : '⚪ IDLE');
  const euroBody = document.getElementById('admEuroEntriesTable');
  if (euroBody) {
    const entries = (ev.entries || []).slice().sort((a, b) => Number(b.points || 0) - Number(a.points || 0));
    euroBody.innerHTML = entries.length === 0
      ? `<tr><td colspan="4" style="color:var(--muted);text-align:center;">No Eurovision songs added yet.</td></tr>`
      : entries.map((e, i) => {
          const c = getCityById(e.cityId);
          return `
            <tr>
              <td><b>#${i + 1}</b> ${c.flag} ${getCityName(c, lang)}</td>
              <td><b>${e.songTitle}</b> · <span style="color:#7dd3fc;">@${e.artistName}</span></td>
              <td style="color:#fbbf24;font-weight:900;">${Number(e.points || 0)} PTS (${Number(e.votesCount || 0)} votes)</td>
              <td>
                <button class="adm-btn rose" style="padding:4px 9px;font-size:0.75rem;" onclick="REMO_STORE.adminDeleteEurovisionEntry('${e.id}')">✕ Delete</button>
              </td>
            </tr>
          `;
        }).join('');
  }

  // 2. Photo Grand Prix Status & Table
  const pgp = vc.photoGrandPrix || {};
  setContestPillDOM('admPgpStatusPill', !!pgp.active, pgp.active ? `🟢 LIVE (${(pgp.entries || []).length} entries)` : '⚪ IDLE');
  const pgpBody = document.getElementById('admPgpEntriesTable');
  if (pgpBody) {
    const entries = (pgp.entries || []).slice().sort((a, b) => Number(b.votes || 0) - Number(a.votes || 0));
    pgpBody.innerHTML = entries.length === 0
      ? `<tr><td colspan="4" style="color:var(--muted);text-align:center;">No Grand Prix entries yet.</td></tr>`
      : entries.map((e, i) => {
          const c = getCityById(e.cityId);
          return `
            <tr>
              <td><b>#${i + 1}</b> ${c.flag} ${getCityName(c, lang)}</td>
              <td><b>${e.title}</b> · <span style="color:#7dd3fc;">@${e.authorName}</span></td>
              <td style="color:#fbbf24;font-weight:900;">🔥 ${Number(e.votes || 0)} votes</td>
              <td>
                <button class="adm-btn rose" style="padding:4px 9px;font-size:0.75rem;" onclick="REMO_STORE.adminDeletePhotoGrandPrixEntry('${e.id}')">✕ Delete</button>
              </td>
            </tr>
          `;
        }).join('');
  }

  // 3. World Cup Bracket Status
  const wc = vc.worldCupBracket || {};
  setContestPillDOM('admWcStatusPill', !!wc.active, wc.active ? `🟢 LIVE (Round: ${String(wc.round || 'qf').toUpperCase()})` : '⚪ IDLE');

  // 4. Mystery Detective Status
  const md = vc.mysteryDetective || {};
  setContestPillDOM('admMdStatusPill', !!md.active, md.active ? `🟢 LIVE (${(md.winners || []).length}/${md.maxWinners || 15} winners)` : '⚪ IDLE');

  // 5. Golden Raffle Status
  const gr = vc.goldenRaffle || {};
  setContestPillDOM('admGrStatusPill', !!gr.active, gr.active ? `🟢 LIVE (${(gr.tickets || []).length} tickets)` : '⚪ IDLE');

  // 6. Flash Hunt Status
  const fh = vc.flashHunt || {};
  setContestPillDOM('admFhStatusPill', !!fh.active, fh.active ? `🟢 LIVE (${(fh.claims || []).length}/${fh.maxClaims || 20} claimed)` : '⚪ IDLE');
}

function handleAdminEuroAudioFile(ev) {
  const f = ev.target.files && ev.target.files[0];
  if (!f) return;
  const rd = new FileReader();
  rd.onload = async (e) => {
    const dataUrl = e.target.result;
    if (window.RemoMediaDB && typeof window.RemoMediaDB.saveDataUrl === 'function') {
      _admPendingEuroAudioUrl = await window.RemoMediaDB.saveDataUrl(dataUrl);
    } else {
      _admPendingEuroAudioUrl = dataUrl;
    }
    admToast(`🎵 60s Audio ready: ${f.name}`);
  };
  rd.readAsDataURL(f);
}

function adminStartEurovisionFromOffice() {
  const title_en = document.getElementById('admEuroTitleEn')?.value || 'Eurovision REMO — World Cities 60s Song Contest';
  const title_fr = document.getElementById('admEuroTitleFr')?.value || 'Eurovision REMO — Concours Musical 60s des Villes';
  const prizeCoins = Number(document.getElementById('admEuroPrize')?.value || 5000);
  const durationHours = Number(document.getElementById('admEuroDuration')?.value || 48);
  const allowCitizenSubmissions = !!document.getElementById('admEuroAllowCitizens')?.checked;
  const noSelfCityVote = !!document.getElementById('admEuroNoSelfVote')?.checked;

  REMO_STORE.adminLaunchEurovision({
    title_en,
    title_fr,
    prizeCoins,
    durationHours,
    allowCitizenSubmissions,
    noSelfCityVote,
    keepEntries: true
  });
  RemoAudio.play('fanfare');
  admToast('🎤 Eurovision REMO is now LIVE across the world!');
}

function adminAddEurovisionSongFromOffice() {
  const cityId = document.getElementById('admEuroAddCity')?.value || 'montreal';
  const songTitle = (document.getElementById('admEuroAddTitle')?.value || '').trim();
  const artistName = (document.getElementById('admEuroAddArtist')?.value || 'REMO Official').trim();
  const externalLink = (document.getElementById('admEuroAddLink')?.value || '').trim();
  const soundPreset = document.getElementById('admEuroAddPreset')?.value || 'shibuya_neon';

  if (!songTitle) {
    admToast('⚠️ Please enter a Song Title!');
    return;
  }

  REMO_STORE.submitEurovisionEntry({
    cityId,
    songTitle,
    artistName,
    audioUrl: _admPendingEuroAudioUrl,
    externalLink,
    soundPreset
  });
  _admPendingEuroAudioUrl = '';
  const titleInp = document.getElementById('admEuroAddTitle');
  if (titleInp) titleInp.value = '';
  const linkInp = document.getElementById('admEuroAddLink');
  if (linkInp) linkInp.value = '';
  admToast(`🎵 Added "${songTitle}" to Eurovision REMO!`);
}

function adminConcludeEurovisionFromOffice() {
  const res = REMO_STORE.adminConcludeEurovision();
  if (!res.ok) {
    admToast('⚠️ Add at least 1 song before concluding Eurovision!');
    return;
  }
  RemoAudio.play('fanfare');
  admToast(`👑 Eurovision Concluded! Winner: "${res.winner.songTitle}" (+${res.prize} 🪙 paid)!`);
}

function adminResetEurovisionFromOffice() {
  REMO_STORE.adminStopEurovision();
  admToast('🗑️ Eurovision REMO stopped and cleared.');
}

function adminStartPgpFromOffice() {
  REMO_STORE.adminLaunchPhotoGrandPrix({
    title_en: document.getElementById('admPgpTitleEn')?.value || 'World Cities Photo & Video Grand Prix',
    title_fr: document.getElementById('admPgpTitleFr')?.value || 'Grand Prix Photo & Vidéo des Villes',
    prize1st: Number(document.getElementById('admPgpPrize1')?.value || 3000),
    prize2nd: Number(document.getElementById('admPgpPrize2')?.value || 1500),
    prize3rd: Number(document.getElementById('admPgpPrize3')?.value || 750),
    durationHours: Number(document.getElementById('admPgpHours')?.value || 48),
    keepEntries: true
  });
  RemoAudio.play('fanfare');
  admToast('📸 Photo & Video Grand Prix is now LIVE!');
}

function adminConcludePgpFromOffice() {
  const res = REMO_STORE.adminConcludePhotoGrandPrix();
  if (!res.ok) {
    admToast('⚠️ No entries to conclude!');
    return;
  }
  RemoAudio.play('fanfare');
  admToast('🏆 Top 3 Podium crowned and REMO Coin prizes paid!');
}

function adminResetPgpFromOffice() {
  REMO_STORE.adminStopPhotoGrandPrix();
  admToast('🗑️ Photo & Video Grand Prix stopped.');
}

function adminStartWorldCupFromOffice() {
  REMO_STORE.adminLaunchWorldCupBracket({
    title_en: document.getElementById('admWcTitleEn')?.value || '8-City World Knockout Cup',
    title_fr: document.getElementById('admWcTitleFr')?.value || 'Coupe du Monde des Villes (8 Villes)',
    prizePool: Number(document.getElementById('admWcPrizePool')?.value || 5000),
    roundHours: Number(document.getElementById('admWcRoundHours')?.value || 24)
  });
  RemoAudio.play('fanfare');
  admToast('⚽ 8-City World Knockout Cup Quarter-Finals launched!');
}

function adminAdvanceWorldCupFromOffice() {
  const res = REMO_STORE.adminAdvanceWorldCupRound();
  if (!res.ok) {
    admToast('⚠️ Launch the World Cup Bracket first!');
    return;
  }
  RemoAudio.play('fanfare');
  admToast(`⚽ World Cup advanced to: ${String(res.round).toUpperCase()}!`);
}

function adminResetWorldCupFromOffice() {
  REMO_STORE.adminStopWorldCupBracket();
  admToast('🗑️ World Cup Bracket stopped.');
}

function adminStartMysteryFromOffice() {
  REMO_STORE.adminLaunchMysteryDetective({
    correctCityId: document.getElementById('admMdCity')?.value || 'paris',
    imageUrl: document.getElementById('admMdImage')?.value || '',
    clue_en: document.getElementById('admMdClueEn')?.value || 'Identify the secret world city from this clue!',
    clue_fr: document.getElementById('admMdClueFr')?.value || 'Identifiez la ville secrète grâce à cet indice !',
    rewardCoins: Number(document.getElementById('admMdReward')?.value || 500),
    maxWinners: Number(document.getElementById('admMdMaxWinners')?.value || 15),
    durationHours: 24
  });
  RemoAudio.play('fanfare');
  admToast('🕵️ Mystery City Detective is now LIVE!');
}

function adminResetMysteryFromOffice() {
  REMO_STORE.adminStopMysteryDetective();
  admToast('🗑️ Mystery City Detective stopped.');
}

function adminStartRaffleFromOffice() {
  REMO_STORE.adminLaunchGoldenRaffle({
    title_en: document.getElementById('admGrTitleEn')?.value || 'Founder’s Golden Ticket Raffle',
    title_fr: document.getElementById('admGrTitleFr')?.value || 'Grande Tombola Ticket d’Or du Fondateur',
    prizeCoins: Number(document.getElementById('admGrPrize')?.value || 2500),
    winnersCount: Number(document.getElementById('admGrCount')?.value || 3),
    durationHours: 48
  });
  RemoAudio.play('fanfare');
  admToast('🎟️ Golden Ticket Raffle is now OPEN!');
}

function adminDrawRaffleFromOffice() {
  const res = REMO_STORE.adminDrawGoldenRaffleWinners();
  if (!res.ok) {
    admToast('⚠️ No tickets claimed yet!');
    return;
  }
  RemoAudio.play('fanfare');
  admToast(`🎰 Drawn ${res.winners.length} Golden Ticket Winner(s) & paid prizes!`);
}

function adminResetRaffleFromOffice() {
  REMO_STORE.adminStopGoldenRaffle();
  admToast('🗑️ Golden Ticket Raffle stopped.');
}

function adminStartFlashHuntFromOffice() {
  REMO_STORE.adminLaunchFlashHunt({
    targetCityId: document.getElementById('admFhCity')?.value || 'montreal',
    maxClaims: Number(document.getElementById('admFhMax')?.value || 20),
    riddle_en: document.getElementById('admFhRiddleEn')?.value || 'Solve the Founder’s riddle and unlock the secret city chest!',
    riddle_fr: document.getElementById('admFhRiddleFr')?.value || 'Résolvez l’énigme du Fondateur et ouvrez le coffre secret !',
    rewardCoins: Number(document.getElementById('admFhReward')?.value || 300)
  });
  RemoAudio.play('fanfare');
  admToast('⚡ Founder’s Flash Treasure Hunt is now LIVE!');
}

function adminResetFlashHuntFromOffice() {
  REMO_STORE.adminStopFlashHunt();
  admToast('🗑️ Flash Treasure Hunt stopped.');
}

window.renderAdminContestsPanel = renderAdminContestsPanel;
window.handleAdminEuroAudioFile = handleAdminEuroAudioFile;
window.adminStartEurovisionFromOffice = adminStartEurovisionFromOffice;
window.adminAddEurovisionSongFromOffice = adminAddEurovisionSongFromOffice;
window.adminConcludeEurovisionFromOffice = adminConcludeEurovisionFromOffice;
window.adminResetEurovisionFromOffice = adminResetEurovisionFromOffice;
window.adminStartPgpFromOffice = adminStartPgpFromOffice;
window.adminConcludePgpFromOffice = adminConcludePgpFromOffice;
window.adminResetPgpFromOffice = adminResetPgpFromOffice;
window.adminStartWorldCupFromOffice = adminStartWorldCupFromOffice;
window.adminAdvanceWorldCupFromOffice = adminAdvanceWorldCupFromOffice;
window.adminResetWorldCupFromOffice = adminResetWorldCupFromOffice;
window.adminStartMysteryFromOffice = adminStartMysteryFromOffice;
window.adminResetMysteryFromOffice = adminResetMysteryFromOffice;
window.adminStartRaffleFromOffice = adminStartRaffleFromOffice;
window.adminDrawRaffleFromOffice = adminDrawRaffleFromOffice;
window.adminResetRaffleFromOffice = adminResetRaffleFromOffice;
window.adminStartFlashHuntFromOffice = adminStartFlashHuntFromOffice;
window.adminResetFlashHuntFromOffice = adminResetFlashHuntFromOffice;
