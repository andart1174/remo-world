/* ════════════════════════════════════════════════════════════════════
   🛡️ REMO — Admin Executive Office & Master City Card Factory Controller
   Controls 100% of REMO: Cards, Cities, Flash Drops, Wars, Bank, Users,
   Moderation & Plug-and-Play Firebase Cloud. Strictly EN / FR ONLY.
   ════════════════════════════════════════════════════════════════════ */

let adminCurrentTab = 'overview';
let studioLoadedPhotoImg = null;
let studioPhotoDataUrl = '';
let studioCommunityMeta = null;
let studioCommunityFilterCityOnly = true;

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

/* ── 1. ADMIN FIREBASE AUTH LOCK / UNLOCK (Synced with Verified Founder Account) ── */
function getAdminRealUsers() {
  return (REMO_STORE.state.users || []).filter((u) =>
    u && u.uid && !(typeof REMO_STORE.isFakeOrGuestUser === 'function' && REMO_STORE.isFakeOrGuestUser(u))
  );
}

function checkAdminSession() {
  const unlocked = REMO_STORE.isAdminUnlocked() && REMO_STORE.isCurrentUserAdmin();
  const lockEl = document.getElementById('admLockScreen');
  if (lockEl) lockEl.style.display = unlocked ? 'none' : 'flex';
  if (unlocked) {
    refreshAllAdminPanels();
    if (!window._remoAutoPurgeDone && typeof REMO_STORE.purgeFakeUsersFromCloud === 'function') {
      window._remoAutoPurgeDone = true;
      REMO_STORE.purgeFakeUsersFromCloud().catch(() => {});
    }
  }
}

async function adminGoogleSignIn() {
  const lang = REMO_I18N.getLang();
  if (!REMO_STORE.fbAuth && typeof REMO_STORE.initFirebaseIfConfigured === 'function') {
    REMO_STORE.initFirebaseIfConfigured();
  }
  if (!REMO_STORE.fbAuth || typeof firebase === 'undefined' || !firebase.auth) {
    alert(lang === 'fr' ? 'Serveur Firebase Auth en cours de chargement, réessayez.' : 'Firebase Auth is initializing, please retry.');
    return;
  }
  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const cred = await REMO_STORE.fbAuth.signInWithPopup(provider);
    const fbU = cred && cred.user;
    const adminEmail = (REMO_STORE.state?.settings?.adminEmail || 'andart1174@gmail.com').toLowerCase().trim();
    if (!fbU || (fbU.email || '').toLowerCase().trim() !== adminEmail || fbU.emailVerified !== true) {
      await REMO_STORE.fbAuth.signOut();
      alert(lang === 'fr' ? '❌ Accès refusé : connectez-vous avec le compte Fondateur vérifié (' + adminEmail + ').' : '❌ Access denied: please sign in with the verified Founder account (' + adminEmail + ').');
      return;
    }
    REMO_STORE.ensureGuestOrCitizen(fbU.displayName || 'REMO Founder', fbU.email, 'montreal', true, fbU.uid);
    REMO_STORE.setAdminUnlocked(true);
    REMO_STORE.refreshPrivateCloudListeners();
    checkAdminSession();
    RemoAudio.play('fanfare');
    admToast(lang === 'fr' ? '🛡️ Bureau Exécutif Admin déverrouillé !' : '🛡️ Admin Executive Office unlocked!');
  } catch (err) {
    alert((err && err.message) || 'Google Sign-In error');
  }
}

async function unlockAdminOffice(ev) {
  if (ev) ev.preventDefault();
  const lang = REMO_I18N.getLang();
  const email = (document.getElementById('admEmailInput')?.value || '').trim();
  const pass = document.getElementById('admPinInput')?.value || '';
  if (!email || !pass) {
    alert(lang === 'fr' ? 'Email et mot de passe Admin requis.' : 'Admin email and password required.');
    return;
  }
  if (!REMO_STORE.fbAuth && typeof REMO_STORE.initFirebaseIfConfigured === 'function') {
    REMO_STORE.initFirebaseIfConfigured();
  }
  if (!REMO_STORE.fbAuth) {
    alert(lang === 'fr' ? 'Serveur Firebase Auth en cours de connexion.' : 'Firebase Auth server connecting.');
    return;
  }
  try {
    const cred = await REMO_STORE.fbAuth.signInWithEmailAndPassword(email, pass);
    const fbU = cred && cred.user;
    const adminEmail = (REMO_STORE.state?.settings?.adminEmail || 'andart1174@gmail.com').toLowerCase().trim();
    if (!fbU || (fbU.email || '').toLowerCase().trim() !== adminEmail || fbU.emailVerified !== true) {
      await REMO_STORE.fbAuth.signOut();
      alert(lang === 'fr' ? '❌ Compte non autorisé pour l’Administration.' : '❌ Unauthorized Admin credentials.');
      return;
    }
    REMO_STORE.ensureGuestOrCitizen(fbU.displayName || 'REMO Founder', fbU.email, 'montreal', true, fbU.uid);
    REMO_STORE.setAdminUnlocked(true);
    REMO_STORE.refreshPrivateCloudListeners();
    checkAdminSession();
    RemoAudio.play('fanfare');
    admToast(lang === 'fr' ? '🛡️ Bureau Exécutif Admin déverrouillé !' : '🛡️ Admin Executive Office unlocked!');
  } catch (err) {
    alert(lang === 'fr' ? '❌ Échec d’authentification Admin : ' + (err && err.message ? err.message : 'Erreur') : '❌ Admin Sign-In failed: ' + (err && err.message ? err.message : 'Error'));
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
  if (tabId === 'cards') {
    renderAdminCardStudio();
    renderAdminCommunityPhotoPicker();
  } else {
    refreshAllAdminPanels();
  }
}

/* ── 2. OVERVIEW KPIs & MEGAPHONE ── */
function refreshAllAdminPanels() {
  const st = REMO_STORE.state;
  const lang = REMO_I18N.getLang();

  // KPI counters
  const realUsers = getAdminRealUsers();
  const totalCoins = realUsers.reduce((s, u) => s + (u.coins || 0), 0);
  const topCityEntry = Object.entries(st.cityScores || {}).sort((a, b) => b[1] - a[1])[0] || ['montreal', 4820];
  const topCity = getCityById(topCityEntry[0]);
  const fbCfg = REMO_STORE.getFirebaseConfig();

  const setTxt = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setTxt('kpiUsers', realUsers.length);
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
  getAdminRealUsers().forEach((u) => {
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
      getAdminRealUsers().map((u) => `<option value="${u.uid}">👤 ${escapeHtmlStr(u.name)} (#${escapeHtmlStr(u.passportNum)})</option>`).join('');
  }
}

function onStudioCityChange(preservePhoto = false) {
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
  if (!preservePhoto && studioCommunityMeta) {
    studioPhotoDataUrl = '';
    studioLoadedPhotoImg = null;
    studioCommunityMeta = null;
    const subInp = document.getElementById('stCardSubtitle');
    if (subInp && String(subInp.value || '').includes('COMMUNITY EDITION')) subInp.value = '';
  }
  renderAdminCardStudio();
  renderAdminCommunityPhotoPicker();
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
    postId: studioCommunityMeta ? studioCommunityMeta.postId : '',
    communityPostId: studioCommunityMeta ? studioCommunityMeta.postId : '',
    communityAuthorName: studioCommunityMeta ? studioCommunityMeta.authorName : '',
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

function getSafeCommunityPostMediaUrl(post) {
  if (!post || !['image', 'carousel', 'before_after'].includes(post.mediaType)) return '';
  const raw = post.mediaUrl || (Array.isArray(post.mediaUrls) && post.mediaUrls[0]) || '';
  if (!raw) return '';
  const s = String(raw).trim();
  if (/^(https?:\/\/|data:image\/|blob:|idb:\/\/|\.\/)/i.test(s)) return s;
  return '';
}

function setStudioCommunityFilter(cityOnly) {
  studioCommunityFilterCityOnly = !!cityOnly;
  renderAdminCommunityPhotoPicker();
}

function renderAdminCommunityPhotoPicker() {
  const grid = document.getElementById('admCommunityPhotoGrid');
  const creditEl = document.getElementById('stCommActiveCredit');
  const btnCity = document.getElementById('stCommFilterCityBtn');
  const btnAll = document.getElementById('stCommFilterAllBtn');
  const lang = window.REMO_I18N ? REMO_I18N.getLang() : 'en';
  const curCityId = document.getElementById('stCitySelect')?.value || 'chisinau';

  if (btnCity && btnAll) {
    btnCity.className = 'adm-btn ' + (studioCommunityFilterCityOnly ? 'emerald' : 'outline');
    btnAll.className = 'adm-btn ' + (!studioCommunityFilterCityOnly ? 'emerald' : 'outline');
  }

  if (creditEl) {
    if (studioCommunityMeta && studioCommunityMeta.authorName) {
      creditEl.innerHTML = `<span style="color:#38bdf8;font-weight:800;">📸 ${lang === 'fr' ? 'Édition Communauté active :' : 'Active Community Edition:'} @${escapeHtmlStr(studioCommunityMeta.authorName)}</span>`;
    } else if (studioPhotoDataUrl) {
      creditEl.innerHTML = `<span style="color:#fbbf24;font-weight:800;">🖼️ ${lang === 'fr' ? 'Photo personnalisée chargée' : 'Custom Uploaded Photo Active'}</span>`;
    } else {
      const c = getCityById(curCityId);
      creditEl.textContent = `${lang === 'fr' ? 'Par défaut :' : 'Default:'} ${c.flag} ${getCityName(c, lang)} Official Landmark Artwork`;
    }
  }

  if (!grid) return;
  const posts = Array.isArray(REMO_STORE.state?.posts) ? REMO_STORE.state.posts : [];
  const filtered = posts
    .filter((p) => {
      const u = getSafeCommunityPostMediaUrl(p);
      if (!u) return false;
      if (studioCommunityFilterCityOnly && curCityId && p.cityId !== curCityId) return false;
      return true;
    })
    .slice(0, 24);

  if (!filtered.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;font-size:0.76rem;color:var(--muted);padding:8px 4px;">${
      lang === 'fr'
        ? 'Aucune photo publiée pour ce filtre. Essayez « All Cities ».'
        : 'No citizen photos matching this filter yet. Try "All Cities".'
    }</div>`;
    return;
  }

  grid.innerHTML = filtered.map((p) => {
    const mediaUrl = getSafeCommunityPostMediaUrl(p);
    const city = getCityById(p.cityId || curCityId);
    const author = String(p.authorName || 'Citizen');
    const isSelected = studioCommunityMeta && String(studioCommunityMeta.postId) === String(p.id);
    const isIdb = mediaUrl.startsWith('idb://');
    return `
      <button type="button" data-post-id="${escapeHtmlStr(p.id)}"
        style="text-align:left;padding:5px;border-radius:10px;border:1.5px solid ${isSelected ? '#fbbf24' : 'rgba(148,163,184,0.28)'};background:${isSelected ? 'rgba(251,191,36,0.14)' : 'rgba(2,6,23,0.75)'};cursor:pointer;color:#f8fafc;display:flex;flex-direction:column;gap:4px;">
        <div style="width:100%;height:68px;border-radius:7px;overflow:hidden;background:#0f172a;position:relative;">
          ${isIdb
            ? `<div data-idb-src="${escapeHtmlStr(mediaUrl)}" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:0.7rem;color:#38bdf8;">⏳ Media</div>`
            : `<img src="${escapeHtmlStr(mediaUrl)}" alt="" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block;">`
          }
          ${p.verifiedGps ? `<span style="position:absolute;top:4px;right:4px;background:rgba(16,185,129,0.9);color:#fff;font-size:0.62rem;font-weight:900;padding:1px 5px;border-radius:99px;">📍GPS</span>` : ''}
        </div>
        <div style="font-size:0.72rem;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${city.flag} @${escapeHtmlStr(author)}</div>
      </button>
    `;
  }).join('');

  if (!grid._remoBoundClick) {
    grid._remoBoundClick = true;
    grid.addEventListener('click', (ev) => {
      const btn = ev.target && ev.target.closest ? ev.target.closest('[data-post-id]') : null;
      if (!btn) return;
      const pid = btn.getAttribute('data-post-id');
      if (pid) selectCommunityPhotoForStudio(pid);
    });
  }

  // Resolve any local IndexedDB thumbnails lazily
  if (window.RemoMediaDB && typeof window.RemoMediaDB.getObjectUrl === 'function') {
    grid.querySelectorAll('[data-idb-src]').forEach((holder) => {
      const idbUri = holder.getAttribute('data-idb-src');
      window.RemoMediaDB.getObjectUrl(idbUri).then((objUrl) => {
        if (objUrl && holder.parentNode) {
          holder.outerHTML = `<img src="${escapeHtmlStr(objUrl)}" alt="" style="width:100%;height:100%;object-fit:cover;display:block;">`;
        }
      }).catch(() => {});
    });
  }
}

async function selectCommunityPhotoForStudio(postId) {
  const lang = window.REMO_I18N ? REMO_I18N.getLang() : 'en';
  const posts = Array.isArray(REMO_STORE.state?.posts) ? REMO_STORE.state.posts : [];
  const post = posts.find((x) => x && String(x.id) === String(postId));
  if (!post) return;
  const mediaUrl = getSafeCommunityPostMediaUrl(post);
  if (!mediaUrl) return;

  const citySel = document.getElementById('stCitySelect');
  if (citySel && post.cityId && citySel.value !== post.cityId && getRemoCities().some((c) => c.id === post.cityId)) {
    citySel.value = post.cityId;
    onStudioCityChange(true);
  }

  const cleanAuthor = String(post.authorName || 'Citizen').replace(/^@+/, '').trim();
  studioCommunityMeta = {
    postId: String(post.id),
    authorName: cleanAuthor,
    authorUid: String(post.authorUid || '')
  };
  studioPhotoDataUrl = mediaUrl;

  const subInp = document.getElementById('stCardSubtitle');
  if (subInp) {
    subInp.value = `📸 COMMUNITY EDITION · @${cleanAuthor.toUpperCase()}`;
  }
  const gpsChk = document.getElementById('stChkGps');
  if (gpsChk) gpsChk.checked = !!post.verifiedGps;

  renderAdminCardStudio();
  renderAdminCommunityPhotoPicker();

  if (typeof ensureSpecPhotoUntainted === 'function') {
    await ensureSpecPhotoUntainted(buildCurrentStudioSpec()).catch(() => false);
    renderAdminCardStudio();
  }
  admToast(
    lang === 'fr'
      ? `📸 Photo de @${cleanAuthor} chargée dans le Studio !`
      : `📸 Community photo by @${cleanAuthor} loaded into Studio!`
  );
}

function handleStudioPhotoUpload(ev) {
  const file = ev.target.files && ev.target.files[0];
  if (!file) return;
  const rd = new FileReader();
  rd.onload = (e) => {
    studioCommunityMeta = null;
    studioPhotoDataUrl = e.target.result;
    const img = new Image();
    img.onload = () => {
      studioLoadedPhotoImg = img;
      if (window.CARD_PHOTO_MEM_CACHE) {
        window.CARD_PHOTO_MEM_CACHE.set(studioPhotoDataUrl, { img, tainted: false, dataUrl: studioPhotoDataUrl });
      }
      renderAdminCardStudio();
      renderAdminCommunityPhotoPicker();
    };
    img.src = studioPhotoDataUrl;
  };
  rd.readAsDataURL(file);
}

function clearStudioPhoto() {
  studioPhotoDataUrl = '';
  studioLoadedPhotoImg = null;
  studioCommunityMeta = null;
  const subInp = document.getElementById('stCardSubtitle');
  if (subInp && String(subInp.value || '').includes('COMMUNITY EDITION')) {
    subInp.value = '';
  }
  const inp = document.getElementById('stPhotoInput');
  if (inp) inp.value = '';
  renderAdminCardStudio();
  renderAdminCommunityPhotoPicker();
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
  return openCityPrintSuite(nineCopies, side);
}

function adminPrintAllCitiesDeck(side) {
  const baseSpec = buildCurrentStudioSpec();
  const allSpecs = getRemoCities().map((c, idx) => ({
    ...baseSpec,
    cityId: c.id,
    title: '',
    subtitle: '',
    serial: String(idx + 1).padStart(4, '0'),
    rarity: c.rarity,
    themeId: c.themeId,
    coinValue: c.baseValue,
    stats: c.stats,
    customPhotoDataUrl: '',
    communityPostId: '',
    communityAuthorName: '',
    postId: ''
  }));
  return openCityPrintSuite(allSpecs, side);
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
    if (typeof healBrokenCityPhotos === 'function') healBrokenCityPhotos();
    tbody.innerHTML = cities.map((c) => {
      const pts = REMO_STORE.state.cityScores[c.id] || 1000;
      const wx = typeof REMO_WEATHER !== 'undefined' ? REMO_WEATHER.getCityLiveStatus(c) : null;
      const photoUrl = typeof resolveCityRealPhotoUrl === 'function' ? resolveCityRealPhotoUrl(c) : '';
      const hasCustomRadio = Boolean(c.radioStreamUrl && /^https:\/\//i.test(c.radioStreamUrl));
      const thumbHtml = photoUrl
        ? `<img src="${photoUrl.replace(/"/g, '&quot;')}" alt="${c.id}" style="width:30px;height:21px;object-fit:cover;border-radius:4px;border:1px solid rgba(255,255,255,0.22);vertical-align:middle;margin-right:6px;">`
        : '';
      return `
        <tr>
          <td>
            ${thumbHtml}<b>${c.flag} ${getCityName(c, lang)}</b> <span style="color:var(--muted);">(${c.code})</span>
            ${wx ? `<span style="color:#7dd3fc;font-size:0.74rem;font-weight:800;"> · 🕒 ${wx.timeStr} ${wx.icon} ${wx.tempC}°C</span>` : ''}
            ${wx && wx.isSurge ? `<span style="background:rgba(245,158,11,0.25);color:#fde047;padding:2px 6px;border-radius:99px;font-size:0.68rem;font-weight:900;">⚡ 2X SURGE</span>` : ''}
            ${c.foundedBy ? `<span style="background:rgba(16,185,129,0.2);color:#34d399;padding:2px 6px;border-radius:99px;font-size:0.68rem;font-weight:900;">🌱 @${c.foundedBy}</span>` : ''}
            ${hasCustomRadio ? `<span style="background:rgba(56,189,248,0.18);color:#7dd3fc;padding:2px 6px;border-radius:99px;font-size:0.66rem;font-weight:800;">📻 FM</span>` : ''}
          </td>
          <td>${getCityCountry(c, lang)}</td>
          <td><code>${c.lat.toFixed(2)}, ${c.lng.toFixed(2)}</code></td>
          <td><b style="color:#fbbf24;">${pts.toLocaleString()} PTS</b></td>
          <td style="display:flex;gap:6px;flex-wrap:wrap;">
            <button class="adm-btn ${wx && wx.isSurge ? 'emerald' : 'outline'}" style="padding:5px 10px;" onclick="adminToggleCityWeatherSurge('${c.id}')">${wx && wx.isSurge ? '⛈️ 2X ON' : '⛈️ 2X Surge'}</button>
            <button class="adm-btn outline" style="padding:5px 10px;" onclick="adminBoostCityPoints('${c.id}', 250)">+250 PTS</button>
            <button class="adm-btn gold" style="padding:5px 10px;" onclick="jumpStudioToCity('${c.id}')">🎴 Mint Card</button>
            <button class="adm-btn outline" style="padding:5px 10px;" onclick="adminEditCityMediaPrompt('${c.id}')">🖼️ Media</button>
            <button class="adm-btn outline" style="padding:5px 10px;" onclick="adminAutoDiscoverCityMedia('${c.id}')">🌐 Auto</button>
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

async function _adminDiscoverRadioStreamForCity(city) {
  if (!city || typeof fetch !== 'function') return null;
  const cityName = String(city.name_en || city.name_fr || city.id || '').trim();
  if (!cityName) return null;
  try {
    const qs = new URLSearchParams({
      name: cityName,
      hidebroken: 'true',
      is_https: 'true',
      order: 'votes',
      reverse: 'true',
      limit: '10'
    }).toString();
    const resp = await fetch(`https://de1.api.radio-browser.info/json/stations/search?${qs}`);
    if (!resp || !resp.ok) return null;
    const rows = await resp.json();
    if (!Array.isArray(rows)) return null;
    const match = rows.find((r) => {
      if (!r || !r.url_resolved) return false;
      const u = String(r.url_resolved).trim();
      return /^https:\/\//i.test(u) && Number(r.hls) !== 1 && /mp3|aac|ogg/i.test(String(r.codec || 'mp3'));
    });
    if (!match) return null;
    return {
      radioStreamUrl: String(match.url_resolved).trim(),
      radioName: String(match.name || `${cityName} FM`).trim().slice(0, 42),
      radioBadge: '🌐 AUTO FM'
    };
  } catch (e) {
    return null;
  }
}

async function adminAutoDiscoverCityMedia(cityId, silent = false) {
  const lang = REMO_I18N.getLang();
  const c = getCityById(cityId);
  if (!c || typeof updateRemoCityMedia !== 'function') return false;
  const patch = {};
  if (typeof fetchCityPhotoFromWikipedia === 'function') {
    const photoUrl = await fetchCityPhotoFromWikipedia(c.name_en, getCityCountry(c, 'en'));
    if (photoUrl) {
      patch.imageUrl = photoUrl;
      patch.cardImageUrl = photoUrl;
    }
  }
  const radioMeta = await _adminDiscoverRadioStreamForCity(c);
  if (radioMeta && radioMeta.radioStreamUrl) {
    patch.radioStreamUrl = radioMeta.radioStreamUrl;
    patch.radioName = radioMeta.radioName;
    patch.radioBadge = radioMeta.radioBadge;
  }
  if (!Object.keys(patch).length) {
    if (!silent) {
      admToast(lang === 'fr'
        ? `ℹ️ Aucun média auto trouvé pour ${getCityName(c, lang)} (vous pouvez saisir une URL via 🖼️ Media).`
        : `ℹ️ No auto media found for ${getCityName(c, lang)} (you can set URLs via 🖼️ Media).`);
    }
    return false;
  }
  updateRemoCityMedia(c.id, patch);
  REMO_STORE.syncToFirestore('admin_city_media', true);
  renderAdminCitiesPanel();
  if (!silent) {
    const parts = [];
    if (patch.imageUrl) parts.push('📸 Photo');
    if (patch.radioStreamUrl) parts.push(`📻 ${patch.radioName}`);
    admToast(lang === 'fr'
      ? `✅ ${getCityName(c, lang)} mis à jour : ${parts.join(' + ')}`
      : `✅ ${getCityName(c, lang)} updated: ${parts.join(' + ')}`);
  }
  return true;
}

function adminEditCityMediaPrompt(cityId) {
  const lang = REMO_I18N.getLang();
  const c = getCityById(cityId);
  if (!c || typeof updateRemoCityMedia !== 'function') return;
  const curImg = c.cardImageUrl || c.imageUrl || '';
  const curRadio = c.radioStreamUrl || '';

  const imgInput = window.prompt(
    lang === 'fr'
      ? `URL photo HTTPS pour ${getCityName(c, lang)} (laisser vide pour réinitialiser) :`
      : `HTTPS Photo URL for ${getCityName(c, lang)} (leave blank to reset):`,
    curImg
  );
  if (imgInput === null) return;
  const cleanImg = String(imgInput || '').trim();
  if (cleanImg && !/^(https:\/\/|(\.\.?\/)?img\/)/i.test(cleanImg)) {
    admToast(lang === 'fr' ? '⚠️ URL photo invalide (HTTPS requis).' : '⚠️ Invalid photo URL (HTTPS required).');
    return;
  }

  const radioInput = window.prompt(
    lang === 'fr'
      ? `URL flux radio HTTPS (MP3/AAC) pour ${getCityName(c, lang)} (laisser vide pour défaut) :`
      : `HTTPS Radio Stream URL (MP3/AAC) for ${getCityName(c, lang)} (leave blank for default):`,
    curRadio
  );
  if (radioInput === null) return;
  const cleanRadio = String(radioInput || '').trim();
  if (cleanRadio && !/^https:\/\//i.test(cleanRadio)) {
    admToast(lang === 'fr' ? '⚠️ URL radio invalide (HTTPS requis).' : '⚠️ Invalid radio stream URL (HTTPS required).');
    return;
  }

  updateRemoCityMedia(c.id, {
    imageUrl: cleanImg,
    cardImageUrl: cleanImg,
    radioStreamUrl: cleanRadio,
    radioName: cleanRadio ? `${c.name_en || c.id} Local FM` : '',
    radioBadge: cleanRadio ? 'LOCAL FM' : ''
  });
  REMO_STORE.syncToFirestore('admin_city_media', true);
  renderAdminCitiesPanel();
  admToast(lang === 'fr'
    ? `✅ Médias enregistrés pour ${getCityName(c, lang)} !`
    : `✅ Media saved for ${getCityName(c, lang)}!`);
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
  const rawImageUrl = (document.getElementById('newCityImageUrl')?.value || '').trim();
  const rawRadioUrl = (document.getElementById('newCityRadioUrl')?.value || '').trim();

  if (!nameEn) return;
  const safeImg = /^https:\/\//i.test(rawImageUrl) ? rawImageUrl : '';
  const safeRadio = /^https:\/\//i.test(rawRadioUrl) ? rawRadioUrl : '';
  const id = nameEn.toLowerCase().replace(/[^a-z0-9]/g, '') + '_' + Date.now().toString(36).slice(-3);
  const cities = getRemoCities();
  const newCityObj = {
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
  };
  if (safeImg) {
    newCityObj.imageUrl = safeImg;
    newCityObj.cardImageUrl = safeImg;
  }
  if (safeRadio) {
    newCityObj.radioStreamUrl = safeRadio;
    newCityObj.radioName = `${nameEn} Local FM`;
    newCityObj.radioBadge = 'LOCAL FM';
  }
  cities.push(newCityObj);
  saveRemoCities(cities);
  if (document.getElementById('newCityImageUrl')) document.getElementById('newCityImageUrl').value = '';
  if (document.getElementById('newCityRadioUrl')) document.getElementById('newCityRadioUrl').value = '';
  REMO_STORE.state.cityScores[id] = 1500;
  REMO_STORE.save(true, 'city_added');
  refreshAllAdminPanels();
  admToast(lang === 'fr' ? `🌍 Ville ${flag} ${nameFr} ajoutée à REMO !` : `🌍 City ${flag} ${nameEn} added to REMO!`);

  // Auto-discover photo / radio if Admin left either URL blank
  if (!safeImg || !safeRadio) {
    Promise.resolve().then(async () => {
      const autoPatch = {};
      if (!safeImg && typeof fetchCityPhotoFromWikipedia === 'function') {
        const wUrl = await fetchCityPhotoFromWikipedia(nameEn, country);
        if (wUrl) {
          autoPatch.imageUrl = wUrl;
          autoPatch.cardImageUrl = wUrl;
        }
      }
      if (!safeRadio) {
        const rMeta = await _adminDiscoverRadioStreamForCity(newCityObj);
        if (rMeta && rMeta.radioStreamUrl) {
          autoPatch.radioStreamUrl = rMeta.radioStreamUrl;
          autoPatch.radioName = rMeta.radioName;
          autoPatch.radioBadge = rMeta.radioBadge;
        }
      }
      if (Object.keys(autoPatch).length && typeof updateRemoCityMedia === 'function') {
        updateRemoCityMedia(id, autoPatch);
        REMO_STORE.syncToFirestore('admin_city_media', true);
        renderAdminCitiesPanel();
      }
    }).catch(() => {});
  }
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
    uSel.innerHTML = getAdminRealUsers().map((u) => {
      const c = getCityById(u.homeCity);
      return `<option value="${u.uid}" ${u.uid === prev ? 'selected' : ''}>${c.flag} @${escapeHtmlStr(u.name)} (#${escapeHtmlStr(u.passportNum)}) — 🪙 ${u.coins.toLocaleString()}</option>`;
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
      getAdminRealUsers().map((u) => {
        const c = getCityById(u.homeCity);
        return `<option value="${u.uid}">${c ? c.flag : '👤'} @${escapeHtmlStr(u.name)} (#${escapeHtmlStr(u.passportNum)})</option>`;
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
        <td><b>${escapeHtmlStr(it.icon || '💎')} ${escapeHtmlStr(lang === 'fr' ? (it.name_fr || it.name_en) : it.name_en)}</b></td>
        <td>${escapeHtmlStr(String(it.category || '').toUpperCase())}</td>
        <td><b style="color:#fbbf24;">🪙 ${Number(it.price || 0)}</b></td>
        <td><button class="adm-btn rose" style="padding:4px 9px;" onclick="adminRemoveVipShopItem('${escapeHtmlStr(it.id)}')">🗑️</button></td>
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
            <td><b style="color:#fbbf24;font-family:monospace;">${escapeHtmlStr(o.ticketCode)}</b></td>
            <td>@${escapeHtmlStr(o.userName)}</td>
            <td>${escapeHtmlStr(o.itemName)}</td>
            <td>
              ${o.status === 'delivered'
                ? '<span style="color:#10b981;font-weight:900;">✓ DELIVERED</span>'
                : `<button class="adm-btn emerald" style="padding:4px 9px;" onclick="adminDeliverVipOrder('${escapeHtmlStr(o.id)}')">✓ Mark Delivered</button>`}
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
          <td>${c.flag} ${escapeHtmlStr(c.code)} #${escapeHtmlStr(a.cardSpec.serial)} (${escapeHtmlStr(a.cardSpec.rarity)})</td>
          <td>${escapeHtmlStr(a.sellerName)}</td>
          <td><b style="color:#fbbf24;">🪙 ${Number(a.currentBid || 0)}</b> (${escapeHtmlStr(a.highestBidder)})</td>
          <td><button class="adm-btn rose" style="padding:5px 10px;" onclick="adminRemoveAuction('${escapeHtmlStr(a.id)}')">✕</button></td>
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
  const pNum = String(getAdminRealUsers().length + 1).padStart(4, '0');
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
  r.boostCost = Number(document.getElementById('rwBoost')?.value || 100);
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
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderAdminModerationPanel() {
  const lang = REMO_I18N.getLang();
  const uBody = document.getElementById('admUsersTable');
  if (uBody) {
    uBody.innerHTML = getAdminRealUsers().map((u) => {
      const hc = getCityById(u.homeCity);
      const isMayor = REMO_STORE.state.cityMayors && REMO_STORE.state.cityMayors[u.homeCity] === u.uid;
      const safeUid = escapeHtmlStr(u.uid);
      return `
        <tr style="${u.banned ? 'opacity:0.5;' : ''}">
          <td>
            <b>${escapeHtmlStr(u.name)}</b> ${u.verified ? '<span style="color:#38bdf8;">✓</span>' : ''}
            ${isMayor ? '<span style="background:#f59e0b;color:#000;padding:2px 6px;border-radius:99px;font-size:0.68rem;font-weight:900;">👑 MAYOR</span>' : ''}
            <span style="color:var(--muted);">#${escapeHtmlStr(u.passportNum)}</span>
            <span style="color:#34d399;font-size:0.75rem;font-weight:800;"> · 🤝 ${Number(u.referralsCount || 0)} (${escapeHtmlStr(u.referralCode || 'REMO-' + u.passportNum)})</span>
            ${u.email ? `<br><small style="color:#94a3b8;font-size:0.72rem;">✉️ ${escapeHtmlStr(u.email)}</small>` : ''}
          </td>
          <td>${hc.flag} ${escapeHtmlStr(getCityName(hc, lang))}</td>
          <td><b style="color:#fbbf24;">🪙 ${(u.coins || 0).toLocaleString()}</b></td>
          <td style="display:flex;gap:6px;flex-wrap:wrap;">
            <button class="adm-btn gold" style="padding:5px 10px;" onclick="adminCustomCoinPrompt('${safeUid}')">🪙 Give / Set Coins</button>
            <button class="adm-btn emerald" style="padding:5px 10px;" onclick="adminToggleCityMayor('${safeUid}')">👑 Mayor</button>
            <button class="adm-btn outline" style="padding:5px 10px;" onclick="adminToggleVerifyUser('${safeUid}')">✓ VIP</button>
            <button class="adm-btn rose" style="padding:5px 10px;" onclick="adminToggleBanUser('${safeUid}')">${u.banned ? 'Unban' : '🚫 Ban'}</button>
            ${u.role !== 'admin' ? `<button class="adm-btn rose" style="padding:5px 10px;" onclick="adminDeleteCitizen('${safeUid}')">🗑️</button>` : ''}
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
      const safeDmId = escapeHtmlStr(d.id);
      return `
        <tr>
          <td><b style="color:#7dd3fc;">@${escapeHtmlStr(fromU.name || d.fromName)}</b></td>
          <td><b style="color:#fbbf24;">@${escapeHtmlStr(toU.name || d.toUid)}</b></td>
          <td><span style="color:#f8fafc;">${d.text ? escapeHtmlStr(d.text) : (d.voiceUrl ? '🎤 Note Vocale' : (d.envelopeCoins ? '🧧 Enveloppe ' + Number(d.envelopeCoins) + '🪙' : '✉️ Message'))}</span></td>
          <td style="color:var(--muted);font-size:0.75rem;">${escapeHtmlStr(dateStr)}</td>
          <td style="display:flex;gap:5px;">
            <button class="adm-btn indigo" style="padding:4px 8px;" onclick="adminReplyDmFromOffice('${safeDmId}')">💬 Reply</button>
            <button class="adm-btn rose" style="padding:4px 8px;" onclick="adminDeleteDmFromOffice('${safeDmId}')">🗑️</button>
          </td>
        </tr>
      `;
    }).join('') : `<tr><td colspan="5" style="text-align:center;color:var(--muted);padding:14px;">Aucun message privé pour le moment.</td></tr>`;
  }

  // Official Support & Contact Tickets (Overview + Moderation tabs)
  if (typeof renderAdminSupportTicketsTables === 'function') {
    renderAdminSupportTicketsTables();
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
      const safePostId = escapeHtmlStr(p.id);
      return `
        <tr>
          <td>
            <b>@${escapeHtmlStr(p.authorName)}</b> (${c.flag}) · ${fmtBadge}
            ${p.duetOf ? ' <span style="color:#f472b6;font-weight:900;">🎭 Duet</span>' : ''}
            ${isSealedCapsule ? ' <span style="color:#e879f9;font-weight:900;">⏳ Sealed</span>' : ''}
            ${p.pinned ? ' <span style="color:#fbbf24;font-weight:900;">📌#1</span>' : ''}
            ${p.founderAward ? ' 👑' : ''}
          </td>
          <td>${escapeHtmlStr(cap.slice(0, 62))}...</td>
          <td>❤️ ${(p.likes || []).length} · 🪙 ${Number(p.tipsTotal || 0)}</td>
          <td style="display:flex;gap:5px;flex-wrap:wrap;">
            ${isSealedCapsule ? `<button class="adm-btn emerald" style="padding:5px 9px;" onclick="adminUnsealCapsuleFromOffice('${safePostId}')">🔓 Unseal</button>` : ''}
            <button class="adm-btn gold" style="padding:5px 9px;" onclick="adminTogglePinPost('${safePostId}')">${p.pinned ? 'Unpin' : '📌 Pin'}</button>
            <button class="adm-btn emerald" style="padding:5px 9px;" onclick="adminCrownPostAward('${safePostId}')">👑 +250🪙</button>
            <button class="adm-btn outline" style="padding:5px 9px;" onclick="adminToggleBoostPost('${safePostId}')">${p.boosted ? 'Unboost' : '🚀 Boost'}</button>
            <button class="adm-btn outline" style="padding:5px 9px;" onclick="adminEditPostCaption('${safePostId}')">✏️</button>
            <button class="adm-btn rose" style="padding:5px 9px;" onclick="adminDeletePost('${safePostId}')">🗑️</button>
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

async function adminDeleteCitizen(uid) {
  const lang = REMO_I18N.getLang();
  if (!confirm(lang === 'fr' ? 'Supprimer définitivement ce compte ?' : 'Permanently delete this citizen account?')) return;
  const res = await REMO_STORE.deleteUserFromCloud(uid);
  refreshAllAdminPanels();
  if (res && res.ok === false) {
    admToast(lang === 'fr'
      ? `⚠️ Supprimé localement, erreur Cloud (${res.error}). Reconnectez-vous en Admin.`
      : `⚠️ Removed locally, Cloud error (${res.error}). Please re-authenticate as Admin.`);
    return;
  }
  admToast(lang === 'fr' ? '🗑️ Compte supprimé définitivement !' : '🗑️ Citizen account permanently deleted!');
}

async function adminPurgeFakeUsers() {
  const lang = REMO_I18N.getLang();
  const msg = lang === 'fr'
    ? '⚠️ Nettoyer tous les comptes invités/faux ("REMO Pioneer #0000", "u_guest_*", "citizenXXXX@remo.world") ?\nLes vrais comptes (admin, Google, emails vérifiés) seront conservés.'
    : '⚠️ Purge all guest/fake accounts ("REMO Pioneer #0000", "u_guest_*", "citizenXXXX@remo.world")? Real accounts will be kept.';
  if (!confirm(msg)) return;
  admToast(lang === 'fr' ? '⏳ Nettoyage complet Cloud en cours...' : '⏳ Purging Cloud accounts...');
  let res = null;
  if (typeof REMO_STORE.purgeFakeUsersFromCloud === 'function') {
    res = await REMO_STORE.purgeFakeUsersFromCloud();
  }
  refreshAllAdminPanels();
  if (res && res.ok === false) {
    admToast(lang === 'fr'
      ? `❌ Erreur Cloud (${res.error}) — reconnexion Admin Firebase requise.`
      : `❌ Cloud purge failed (${res.error}) — Admin Firebase auth required.`);
    return;
  }
  const totalCleaned = res ? Number(res.cloudDeleted || res.localRemoved || 0) : 0;
  admToast(lang === 'fr'
    ? `🗑️ ${totalCleaned} faux comptes / invités nettoyés avec succès !`
    : `🗑️ ${totalCleaned} fake/guest accounts purged successfully!`);
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
  if (!p) return;
  const now = Date.now();
  const isActive = p.boosted && p.boostedUntil && now < Number(p.boostedUntil);
  if (isActive) {
    p.boosted = false;
    p.boostedUntil = 0;
  } else {
    p.boosted = true;
    p.boostedAt = now;
    p.boostedUntil = now + 86400000;
  }
  REMO_STORE.syncPostToCloud(p);
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
  if (REMO_STORE.state && REMO_STORE.state.settings) {
    REMO_STORE.state.settings.customDomain = dom;
    delete REMO_STORE.state.settings.adminPin;
    delete REMO_STORE.state.settings.adminPinHash;
  }
  REMO_STORE.save(true, 'system_settings');
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
      const parsed = JSON.parse(e.target.result);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed) || !Array.isArray(parsed.users) || !Array.isArray(parsed.posts)) {
        throw new Error('Invalid REMO backup schema (missing users or posts arrays).');
      }
      if (parsed.settings && typeof parsed.settings === 'object') {
        delete parsed.settings.adminPin;
        delete parsed.settings.adminPinHash;
      }
      REMO_STORE.state = parsed;
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
  if (typeof updateIndexNowStatusUI === 'function') updateIndexNowStatusUI();
});

window.addEventListener('remo:langchange', () => {
  refreshAllAdminPanels();
  renderAdminCardStudio();
  if (typeof updateIndexNowStatusUI === 'function') updateIndexNowStatusUI();
});

window.addEventListener('remo:stateupdate', (ev) => {
  const reason = ev && ev.detail && ev.detail.reason;
  if (reason === 'admin_mode' || reason === 'auth') {
    checkAdminSession();
  } else if (adminCurrentTab !== 'cards') {
    refreshAllAdminPanels();
  }
});

window.adminGoogleSignIn = adminGoogleSignIn;

window.unlockAdminOffice = unlockAdminOffice;
window.lockAdminOffice = lockAdminOffice;
window.switchAdminTab = switchAdminTab;
window.saveAdminMegaphone = saveAdminMegaphone;
window.triggerGlobalCoinRainAdmin = triggerGlobalCoinRainAdmin;
window.onStudioCityChange = onStudioCityChange;
window.buildCurrentStudioSpec = buildCurrentStudioSpec;
window.renderAdminCardStudio = renderAdminCardStudio;
window.renderAdminCommunityPhotoPicker = renderAdminCommunityPhotoPicker;
window.setStudioCommunityFilter = setStudioCommunityFilter;
window.selectCommunityPhotoForStudio = selectCommunityPhotoForStudio;
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
window.adminEditCityMediaPrompt = adminEditCityMediaPrompt;
window.adminAutoDiscoverCityMedia = adminAutoDiscoverCityMedia;
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
      ? `<tr><td colspan="4" style="color:var(--muted);text-align:center;">No Music Contest songs added yet.</td></tr>`
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

  // ── 7 UNIQUE REMO WORLD SYSTEMS (Admin Status & Tables) ──
  const ws = typeof REMO_STORE.ensureWorldSystems === 'function' ? REMO_STORE.ensureWorldSystems() : {};
  populateCitySel('admTorchStartCity', (ws.torchRelay && ws.torchRelay.currentCityId) || 'montreal');
  populateCitySel('admMayorCitySel', 'montreal');
  populateCitySel('admAllyCityA', 'montreal');
  populateCitySel('admAllyCityB', 'chisinau');
  populateCitySel('admBourseCreatorCity', 'montreal');

  const tr = ws.torchRelay || {};
  setContestPillDOM('admWsTorchPill', !!tr.active, tr.active ? `🟢 LIVE (${tr.totalKm || 0} km · ${(tr.visitedCities || []).length}/${tr.targetCitiesCount || 10} cities)` : '⚪ IDLE');

  const gs = ws.globalSync || {};
  setContestPillDOM('admWsSyncPill', !!gs.active, gs.active ? `🟢 LIVE (${(gs.moments || []).length} synced)` : '⚪ IDLE');

  const me = ws.mayorElections || {};
  setContestPillDOM('admWsMayorPill', !!me.active, me.active ? '🟢 LIVE (Mayor Elections Open)' : '⚪ IDLE');

  const sa = ws.sisterAlliances || {};
  setContestPillDOM('admWsAlliancePill', !!(sa.active && (sa.treaties || []).length), sa.active ? `🟢 LIVE (${(sa.treaties || []).length} treaties)` : '⚪ IDLE');

  const pc = ws.pixelCanvas || {};
  setContestPillDOM('admWsPixelPill', !!pc.active, pc.active ? `🟢 LIVE (${pc.totalPixelsPlaced || 0} pixels)` : '⚪ IDLE');

  const mv = ws.monumentVault || {};
  setContestPillDOM('admWsVaultPill', !!mv.active, mv.active ? (mv.sealed ? `🔒 SEALED (${(mv.capsules || []).length} capsules)` : `🔓 UNSEALED (${(mv.capsules || []).length} capsules)`) : '⚪ IDLE');

  const cb = ws.creatorBourse || {};
  setContestPillDOM('admWsBoursePill', !!cb.active, cb.active ? `🟢 LIVE (${(cb.stocks || []).length} creators)` : '⚪ IDLE');
  const bourseBody = document.getElementById('admBourseStocksTable');
  if (bourseBody) {
    const stocks = Array.isArray(cb.stocks) ? cb.stocks : [];
    bourseBody.innerHTML = stocks.map((st) => {
      const c = getCityById(st.cityId || 'montreal');
      const holders = Object.keys(st.shareholders || {}).length;
      return `
        <tr>
          <td><b>@${st.creatorName}</b> (${c.flag} ${getCityName(c, lang)})</td>
          <td style="color:#fbbf24;font-weight:900;">${Number(st.sharePrice || 50)} 🪙/share · ${holders} fan holder(s)</td>
          <td>
            <button class="adm-btn emerald" style="padding:4px 10px;font-size:0.74rem;" onclick="adminPayDividendToCreatorFromOffice('${st.creatorUid}')">💎 Pay Fan Dividend Now</button>
          </td>
        </tr>
      `;
    }).join('');
  }
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
  const title_en = document.getElementById('admEuroTitleEn')?.value || 'REMO Music Contest — 60s City Sounds & Anthems';
  const title_fr = document.getElementById('admEuroTitleFr')?.value || 'REMO Concours Musical — Sons & Hymnes 60s des Villes';
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
  admToast('🎤 REMO Music Contest is now LIVE across the world!');
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
  admToast(`🎵 Added "${songTitle}" to REMO Music Contest!`);
}

function adminConcludeEurovisionFromOffice() {
  const res = REMO_STORE.adminConcludeEurovision();
  if (!res.ok) {
    admToast('⚠️ Add at least 1 song before concluding the Music Contest!');
    return;
  }
  RemoAudio.play('fanfare');
  admToast(`👑 Music Contest Concluded! Winner: "${res.winner.songTitle}" (+${res.prize} 🪙 paid)!`);
}

function adminResetEurovisionFromOffice() {
  REMO_STORE.adminStopEurovision();
  admToast('🗑️ REMO Music Contest stopped and cleared.');
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

/* ── ADMIN OFFICE HANDLERS FOR THE 7 UNIQUE REMO WORLD SYSTEMS ── */
function adminIgniteWorldTorchFromOffice() {
  REMO_STORE.adminLaunchTorchRelay({
    startCityId: document.getElementById('admTorchStartCity')?.value || 'montreal',
    targetCitiesCount: Number(document.getElementById('admTorchTargetCities')?.value || 10),
    jackpotCoins: Number(document.getElementById('admTorchJackpot')?.value || 5000),
    perPassCoins: Number(document.getElementById('admTorchPerPass')?.value || 50)
  });
  RemoAudio.play('fanfare');
  admToast('🔥 4D World Torch Relay ignited and LIVE!');
}

function adminConcludeWorldTorchFromOffice() {
  const res = REMO_STORE.adminConcludeTorchJackpot();
  RemoAudio.play('fanfare');
  admToast(`🏆 Torch Jackpot distributed (+${res.share} 🪙 per Torchbearer)!`);
}

function adminStopWorldTorchFromOffice() {
  REMO_STORE.adminStopTorchRelay();
  admToast('🗑️ 4D World Torch Relay extinguished.');
}

function adminStartGlobalSyncFromOffice() {
  REMO_STORE.adminLaunchGlobalSync({
    prompt_en: document.getElementById('admSyncPromptEn')?.value || 'Show the sky or your view in your city right now!',
    prompt_fr: document.getElementById('admSyncPromptFr')?.value || 'Montrez le ciel ou votre vue dans votre ville en cet instant !',
    durationMinutes: Number(document.getElementById('admSyncMinutes')?.value || 25),
    rewardCoins: Number(document.getElementById('admSyncReward')?.value || 100)
  });
  RemoAudio.play('fanfare');
  admToast('🌍 Global Sync Flash triggered LIVE across all cities!');
}

function adminStopGlobalSyncFromOffice() {
  REMO_STORE.adminStopGlobalSync();
  admToast('🗑️ Global Sync Flash stopped.');
}

function adminToggleMayorHubFromOffice(active) {
  REMO_STORE.adminToggleMayorElections(active);
  admToast(active ? '🏛️ World City Mayor Elections Hub is now LIVE!' : '🗑️ Mayor Elections Hub hidden.');
}

function adminCrownCityMayorFromOffice() {
  const cityId = document.getElementById('admMayorCitySel')?.value || 'montreal';
  const citizen = (document.getElementById('admMayorCitizenInp')?.value || 'REMO Founder').trim();
  const decree = (document.getElementById('admMayorDecreeInp')?.value || '').trim();
  const res = REMO_STORE.adminCrownCityMayorDirect(cityId, citizen, decree);
  RemoAudio.play('fanfare');
  admToast(`👑 Appointed @${res.mayor.name} as Mayor of ${cityId} with 4D Royal Key!`);
}

function adminCreateSisterAllianceFromOffice() {
  const cityA = document.getElementById('admAllyCityA')?.value || 'montreal';
  const cityB = document.getElementById('admAllyCityB')?.value || 'chisinau';
  const hrs = Number(document.getElementById('admAllyHours')?.value || 48);
  const reward = Number(document.getElementById('admAllyWaveReward')?.value || 40);
  const res = REMO_STORE.adminCreateSisterAlliance(cityA, cityB, hrs, reward);
  if (!res.ok) {
    admToast('⚠️ Please choose two different cities for the Sister Alliance!');
    return;
  }
  RemoAudio.play('fanfare');
  admToast(`🤝 Sister Cities 2X Alliance active: ${cityA.toUpperCase()} × ${cityB.toUpperCase()}!`);
}

function adminClearSisterAlliancesFromOffice() {
  REMO_STORE.adminRemoveSisterAlliance('ALL');
  admToast('🗑️ All Sister Cities Alliances ended.');
}

function adminTogglePixelCanvasFromOffice(active) {
  REMO_STORE.adminTogglePixelCanvas(active);
  admToast(active ? '🎨 REMO World Pixel Canvas is now LIVE!' : '🗑️ Pixel Canvas hidden.');
}

function adminMintPixelCanvasFromOffice() {
  const res = REMO_STORE.adminMintCanvasAs4DCard();
  RemoAudio.play('fanfare');
  admToast(`🎴 Minted World Pixel Fresco Edition #${res.edition} & paid +100 🪙 to all pixel artists!`);
}

function adminOpenMonumentVaultFromOffice(sealed = true) {
  REMO_STORE.adminLaunchMonumentVault({
    sealed,
    title_en: document.getElementById('admVaultTitleEn')?.value || 'City Monument Time-Vault™',
    title_fr: document.getElementById('admVaultTitleFr')?.value || 'Monument Capsule Temporelle des Villes™',
    unsealTargetLabel_en: document.getElementById('admVaultTargetEn')?.value || 'Official Founder Gala Opening',
    unsealTargetLabel_fr: document.getElementById('admVaultTargetFr')?.value || 'Grande Ouverture Gala du Fondateur'
  });
  RemoAudio.play('fanfare');
  admToast('🔒 Monument Time-Vault is now OPEN for sealed citizen capsules!');
}

function adminUnsealMonumentVaultFromOffice() {
  const res = REMO_STORE.adminUnsealMonumentVault();
  admToast(`🔓 MONUMENT UNSEALED! All ${res.count} capsules revealed in the Gala (+50 🪙 bonus paid)!`);
}

function adminStopMonumentVaultFromOffice() {
  REMO_STORE.adminStopMonumentVault();
  admToast('🗑️ Monument Time-Vault hidden.');
}

function adminToggleCreatorBourseFromOffice(active) {
  REMO_STORE.adminToggleCreatorBourse(active);
  admToast(active ? '📈 Creator Shares & Fan Dividends Exchange is now LIVE!' : '🗑️ Creator Bourse hidden.');
}

function adminAddCreatorStockFromOffice() {
  const name = (document.getElementById('admBourseCreatorName')?.value || '').trim();
  const cityId = document.getElementById('admBourseCreatorCity')?.value || 'montreal';
  const price = Number(document.getElementById('admBourseSharePrice')?.value || 60);
  if (!name) {
    admToast('⚠️ Enter a Creator @Username!');
    return;
  }
  REMO_STORE.adminAddFeaturedCreatorStock(name, cityId, price);
  admToast(`📈 Listed @${name} on the Creator Stock Exchange!`);
}

function adminPayDividendToCreatorFromOffice(creatorUid) {
  const amt = Number(document.getElementById('admBourseDividendAmt')?.value || 30);
  const res = REMO_STORE.adminPayCreatorDividend(creatorUid, amt);
  if (!res.ok) return;
  admToast(`💎 Paid +${amt} 🪙/share Fan Dividend for @${res.creatorName} (${res.holdersCount} shareholder(s), +${res.totalPaid} 🪙 total)!`);
}

window.adminIgniteWorldTorchFromOffice = adminIgniteWorldTorchFromOffice;
window.adminConcludeWorldTorchFromOffice = adminConcludeWorldTorchFromOffice;
window.adminStopWorldTorchFromOffice = adminStopWorldTorchFromOffice;
window.adminStartGlobalSyncFromOffice = adminStartGlobalSyncFromOffice;
window.adminStopGlobalSyncFromOffice = adminStopGlobalSyncFromOffice;
window.adminToggleMayorHubFromOffice = adminToggleMayorHubFromOffice;
window.adminCrownCityMayorFromOffice = adminCrownCityMayorFromOffice;
window.adminCreateSisterAllianceFromOffice = adminCreateSisterAllianceFromOffice;
window.adminClearSisterAlliancesFromOffice = adminClearSisterAlliancesFromOffice;
window.adminTogglePixelCanvasFromOffice = adminTogglePixelCanvasFromOffice;
window.adminMintPixelCanvasFromOffice = adminMintPixelCanvasFromOffice;
window.adminOpenMonumentVaultFromOffice = adminOpenMonumentVaultFromOffice;
window.adminUnsealMonumentVaultFromOffice = adminUnsealMonumentVaultFromOffice;
window.adminStopMonumentVaultFromOffice = adminStopMonumentVaultFromOffice;
window.adminToggleCreatorBourseFromOffice = adminToggleCreatorBourseFromOffice;
window.adminAddCreatorStockFromOffice = adminAddCreatorStockFromOffice;
window.adminPayDividendToCreatorFromOffice = adminPayDividendToCreatorFromOffice;

/* ── 📩 OFFICIAL SUPPORT & CONTACT INBOX IN ADMIN OFFICE ── */
function renderAdminSupportTicketsTables() {
  const tickets = (REMO_STORE.state.supportTickets || []).slice().sort((a, b) => Number(b.ts || 0) - Number(a.ts || 0));
  const openCount = tickets.filter((t) => t && t.status !== 'replied').length;

  ['admSupportOverviewBadge', 'admSupportModBadge'].forEach((id) => {
    const b = document.getElementById(id);
    if (b) {
      b.style.display = openCount > 0 ? 'inline-block' : 'none';
      b.textContent = String(openCount);
    }
  });

  const rowsHtml = tickets.length
    ? tickets.map((tk) => {
        const c = getCityById(tk.cityId || 'montreal') || { flag: '🌐' };
        const dateStr = tk.ts ? new Date(tk.ts).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
        const isReplied = tk.status === 'replied';
        return `
          <tr>
            <td>
              <b style="color:#7dd3fc;">${c.flag} ${escapeHtmlStr(tk.senderName || 'Citizen')}</b>
              ${tk.passportNum ? `<br><small style="color:var(--muted);">#${escapeHtmlStr(tk.passportNum)}</small>` : ''}
            </td>
            <td><span style="color:#fbbf24;font-weight:800;font-size:0.78rem;">${escapeHtmlStr(tk.categoryLabel || tk.category || 'Support')}</span></td>
            <td>
              <div style="color:#f8fafc;white-space:pre-wrap;margin-bottom:4px;">${escapeHtmlStr(tk.message || '')}</div>
              ${tk.replyText ? `<div style="background:rgba(16,185,129,0.14);border-left:3px solid #10b981;padding:4px 8px;border-radius:6px;color:#a7f3d0;font-size:0.76rem;">🛡️ <b>Réponse REMO :</b> ${escapeHtmlStr(tk.replyText)}</div>` : ''}
            </td>
            <td style="color:var(--muted);font-size:0.75rem;">${dateStr}</td>
            <td style="display:flex;gap:6px;flex-wrap:wrap;">
              <button class="adm-btn ${isReplied ? 'emerald' : 'gold'}" style="padding:5px 10px;" onclick="adminReplySupportTicketFromOffice('${escapeHtmlStr(tk.id)}')">💬 ${isReplied ? 'Répondre encore' : 'Répondre'}</button>
              <button class="adm-btn rose" style="padding:5px 8px;" onclick="adminDeleteSupportTicketFromOffice('${escapeHtmlStr(tk.id)}')">🗑️</button>
            </td>
          </tr>
        `;
      }).join('')
    : `<tr><td colspan="5" style="text-align:center;color:var(--muted);padding:14px;">Aucun ticket de support ou contact pour le moment ✨</td></tr>`;

  ['admSupportOverviewTable', 'admSupportModTable'].forEach((id) => {
    const tb = document.getElementById(id);
    if (tb) tb.innerHTML = rowsHtml;
  });
}

function adminReplySupportTicketFromOffice(ticketId) {
  const tk = (REMO_STORE.state.supportTickets || []).find((x) => x && x.id === ticketId);
  if (!tk) return;
  const reply = window.prompt(
    `🛡️ Réponse officielle de l'Administration REMO à ${tk.senderName} (livrée dans ses Notifications 🔔 et sa Messagerie 💌 sans exposer de Gmail) :`,
    tk.replyText || ''
  );
  if (!reply || !reply.trim()) return;
  REMO_STORE.replySupportTicket(ticketId, reply.trim());
  admToast(`✅ Réponse officielle envoyée à ${tk.senderName} dans REMO !`);
  refreshAllAdminPanels();
}

function adminDeleteSupportTicketFromOffice(ticketId) {
  REMO_STORE.deleteSupportTicket(ticketId);
  admToast('🗑️ Ticket supprimé.');
  refreshAllAdminPanels();
}

function adminReplyDmFromOffice(dmId) {
  const d = (REMO_STORE.state.directMessages || []).find((x) => x && x.id === dmId);
  if (!d) return;
  const targetUid = d.fromUid === 'u_admin_founder' ? d.toUid : d.fromUid;
  const targetName = d.fromName || 'Citoyen';
  const reply = window.prompt(`🛡️ Répondre dans la Messagerie REMO à @${targetName} :`, '');
  if (!reply || !reply.trim()) return;
  const now = Date.now();
  const dmReply = {
    id: 'dm_adm_' + now,
    fromUid: 'u_admin_founder',
    fromName: '🛡️ REMO Official Support',
    fromCity: 'montreal',
    toUid: targetUid,
    text: `🛡️ [REMO Official Support]: ${reply.trim()}`,
    isRoyalAdmin: true,
    read: false,
    ts: now
  };
  REMO_STORE.state.directMessages.unshift(dmReply);
  REMO_STORE.syncDmToCloud(dmReply);
  REMO_STORE.addNotification({
    id: 'notif_adm_' + now,
    toUid: targetUid,
    fromUid: 'u_admin_founder',
    fromName: '🛡️ REMO Official Support',
    fromCity: 'montreal',
    type: 'message',
    text: `🛡️ REMO Support: ${reply.trim().slice(0, 100)}`,
    rawPreview: reply.trim().slice(0, 120),
    ts: now
  });
  REMO_STORE.save(true, 'admin_dm_reply');
  admToast(`✅ Message envoyé à @${targetName} dans REMO !`);
  refreshAllAdminPanels();
}

window.renderAdminSupportTicketsTables = renderAdminSupportTicketsTables;
window.adminReplySupportTicketFromOffice = adminReplySupportTicketFromOffice;
window.adminDeleteSupportTicketFromOffice = adminDeleteSupportTicketFromOffice;
window.adminReplyDmFromOffice = adminReplyDmFromOffice;
