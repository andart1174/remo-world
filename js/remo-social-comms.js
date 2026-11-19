/* ════════════════════════════════════════════════════════════════════
   📱💬📹 REMO — Social Feed, TikTok Mobile UX, 24h Stories, Spark Voice,
   1-Click 9:16 Reel Studio, Post-to-Card Mint, City Chat & WebRTC Calls
   Strictly Bilingual (EN / FR ONLY)
   ════════════════════════════════════════════════════════════════════ */

let currentRemoView = 'feed';
let currentFeedCityFilter = 'all';
let currentFeedVibeFilter = 'all';
let currentFeedMode = 'all';
let currentChatRoom = 'global';
let activeCommentPostId = null;

// Multi-Format Creator Studio & Spark Voice temporary buffers
let activeCreateStudioTab = 'photo';
let pendingStudioPhotoBlobs = [];
let pendingStudioPhotoPreviewUrls = [];
let pendingStudioPhotoFilter = 'flt-none';
let pendingBaBeforeBlob = null;
let pendingBaBeforePreviewUrl = '';
let pendingBaBeforeFilter = 'flt-none';
let pendingBaAfterBlob = null;
let pendingBaAfterPreviewUrl = '';
let pendingBaAfterFilter = 'flt-none';
let pendingStudioVideoBlob = null;
let pendingStudioVideoDuration = 0;
let pendingRawLongVideoFile = null;
let cam60Stream = null;
let cam60Recorder = null;
let cam60Chunks = [];
let cam60Timer = null;
let pendingRemixParent = null;
let pendingDuetParent = null;
let pendingVersusMedia = { left: '', right: '' };
let activeDmPartnerUid = 'u_elena_kiv';
let dmSearchQuery = '';
let _explicitDmPartnerSelected = false;
const _justReadDmHighlightIds = new Set();
let pendingCommentVoiceKey = '';
let commentVoiceRecorder = null;
let wtRecorder = null;
let wtStream = null;
let wtRecordingActive = false;
let wtTimeoutId = null;

let pendingPostMediaDataUrl = '';
let pendingPostVoiceBlob = null;
let pendingPostVoiceDataUrl = '';
let pendingPostGpsVerified = false;
let voiceRecorder = null;
let voiceChunks = [];
const _carouselState = {};
const _textCardStudioState = {
  theme: 'aurora',
  align: 'center',
  motion: 'glow',
  previewPage: 0,
  inspireIdx: 0
};

// WebRTC Peer-to-Peer Calling State
const REMO_RTC_CFG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun.cloudflare.com:3478' }
  ]
};
let localCallStream = null;
let rtcPeer = null;

/* ── 1. VIEW ROUTER & TOP/SIDEBAR SYNC ── */
function switchRemoView(viewId) {
  currentRemoView = viewId;
  document.querySelectorAll('.remo-view').forEach((v) => v.classList.remove('active'));
  const target = document.getElementById('view-' + viewId);
  if (target) target.classList.add('active');

  document.querySelectorAll('[data-nav-view]').forEach((b) => {
    b.classList.toggle('active', b.getAttribute('data-nav-view') === viewId);
  });

  document.getElementById('appLauncherModal')?.classList.remove('open');
  if (typeof closeTopFeedDrawers === 'function') closeTopFeedDrawers();
  if (window.scrollX) window.scrollTo(0, window.scrollY);
  if (typeof syncDesktopStageLayoutUI === 'function') syncDesktopStageLayoutUI();
  if (typeof _syncFeedBackToTopPill === 'function') _syncFeedBackToTopPill();
  if (viewId !== 'feed') {
    document.querySelectorAll('#remoPostsGrid video').forEach((v) => { try { v.pause(); } catch (e) {} });
  } else if (typeof scheduleInfiniteFeedCheck === 'function') {
    scheduleInfiniteFeedCheck();
  }

  if (viewId === 'messages') {
    if (!_explicitDmPartnerSelected) {
      const me = REMO_STORE.getCurrentUser();
      const myUid = me ? me.uid : null;
      const isAdm = REMO_STORE.isCurrentUserAdmin();
      if (myUid) {
        const unreadToMe = (REMO_STORE.state.directMessages || [])
          .filter((d) => isDmAddressedToMe(d, myUid, isAdm) && !d.read)
          .sort((a, b) => (b.ts || 0) - (a.ts || 0));
        if (unreadToMe.length > 0 && unreadToMe[0].fromUid) {
          activeDmPartnerUid = unreadToMe[0].fromUid;
        } else {
          // Default to most recent active conversation partner if current default has no unread messages
          const recentConvo = (REMO_STORE.state.directMessages || [])
            .filter((d) => d && d.id !== 'dm1' && d.id !== 'dm_env_demo_1' && (isDmAddressedToMe(d, myUid, isAdm) || d.fromUid === myUid))
            .sort((a, b) => (b.ts || 0) - (a.ts || 0));
          if (recentConvo.length > 0) {
            const topMsg = recentConvo[0];
            const otherUid = topMsg.fromUid === myUid ? topMsg.toUid : topMsg.fromUid;
            if (otherUid && otherUid !== myUid) {
              activeDmPartnerUid = otherUid;
            }
          }
        }
      }
    }
    _explicitDmPartnerSelected = false;
  }

  if (viewId === 'feed') renderSocialFeed();
  else if (viewId === 'radar') initRemoRadarMap();
  else if (viewId === 'arena') renderArenaView();
  else if (viewId === 'cards') renderVaultView();
  else if (viewId === 'passport') renderPassportView();
  else if (viewId === 'shop') renderVipShopView();
  else if (viewId === 'auctions') renderAuctionsView();
  else if (viewId === 'bounties') renderBountiesView();
  else if (viewId === 'exchange') renderCityExchangeView();
  else if (viewId === 'chat') renderCityChatView();
  else if (viewId === 'messages') renderDirectMessagesView();
  else if (viewId === 'bottles') renderWorldBottlesView();
  else if (viewId === 'wheel') renderWheelView();
  else if (viewId === 'contests') renderViralContestsView();

  if (typeof updateUnreadBadges === 'function') {
    updateUnreadBadges();
  }
  if (typeof syncStreakHeaderBadge === 'function') {
    syncStreakHeaderBadge();
  }
  if (typeof syncPushToggleUI === 'function') {
    syncPushToggleUI();
  }

  if (typeof initDesktopHorizontalScrollRails === 'function') {
    setTimeout(initDesktopHorizontalScrollRails, 40);
  }
}

function syncHeaderAndSidebars() {
  const lang = REMO_I18N.getLang();
  const st = REMO_STORE.state;
  const u = REMO_STORE.getCurrentUser();
  const isAdm = REMO_STORE.isAdminUnlocked();

  // 2X Happy Hour Header Indicator
  const hhEl = document.getElementById('hdrHappyHourBadge');
  if (hhEl) hhEl.style.display = st.settings.happyHour2x ? 'inline-flex' : 'none';

  // Admin God-Mode Header Pill & Navigation Links (Strictly visible ONLY when verified admin AND non-guest session)
  const isAdmUser = REMO_STORE.isCurrentUserAdmin();
  const isAdmUnlocked = REMO_STORE.isAdminUnlocked();
  const isGuestSession = Boolean(!u || (typeof REMO_STORE.isFakeOrGuestUser === 'function' && REMO_STORE.isFakeOrGuestUser(u)) || u.role === 'guest');
  const showAdminControls = Boolean(isAdmUser && isAdmUnlocked && !isGuestSession);

  const admBtn = document.getElementById('hdrAdminGodBtn');
  if (admBtn) {
    admBtn.style.display = showAdminControls ? 'inline-flex' : 'none';
    admBtn.classList.toggle('active', isAdmUnlocked);
    admBtn.textContent = isAdmUnlocked ? t('btn_admin_mode_on') : t('btn_admin_mode_off');
  }

  const admOfficeHdr = document.getElementById('hdrAdminOfficeLink');
  if (admOfficeHdr) {
    admOfficeHdr.style.display = showAdminControls ? 'inline-flex' : 'none';
  }

  const sideAdm = document.getElementById('sidebarAdminBox');
  if (sideAdm) {
    sideAdm.style.display = showAdminControls ? 'block' : 'none';
  }

  const mbHubAdmGod = document.getElementById('mbHubAdminGodBtn');
  if (mbHubAdmGod) {
    mbHubAdmGod.style.display = showAdminControls ? 'inline-flex' : 'none';
  }

  const mbHubPromo = document.getElementById('mbHubPromoStudioBtn');
  if (mbHubPromo) {
    mbHubPromo.style.display = showAdminControls ? 'inline-flex' : 'none';
  }

  const feedChipPromo = document.getElementById('feedChipAdminPromoBtn');
  if (feedChipPromo) {
    feedChipPromo.style.display = showAdminControls ? 'inline-flex' : 'none';
  }

  const mbHubAdmOffice = document.getElementById('mbHubAdminOfficeBtn');
  if (mbHubAdmOffice) {
    mbHubAdmOffice.style.display = showAdminControls ? 'inline-flex' : 'none';
  }

  const admTile = document.getElementById('appLauncherAdminPromoTile');
  if (admTile) admTile.style.display = showAdminControls ? '' : 'none';

  const launcherAdmRow = document.getElementById('appLauncherAdminRow');
  if (launcherAdmRow) launcherAdmRow.style.display = showAdminControls ? 'grid' : 'none';

  // Dynamically sync "Explore All Apps" count pill on desktop sidebar
  const launcherTiles = document.querySelectorAll('#appLauncherModal .app-tile');
  if (launcherTiles.length > 0) {
    let visibleCount = 0;
    launcherTiles.forEach((tile) => {
      if (tile.style.display !== 'none') visibleCount += 1;
    });
    document.querySelectorAll('.apps-count-pill').forEach((pill) => {
      pill.textContent = String(visibleCount);
    });
  }

  // Admin-Only Radar Controls (Déposer un Géo-Coffre & Placer une Balise Ici)
  const buryVaultBtn = document.getElementById('btnRadarBuryVault');
  if (buryVaultBtn) {
    buryVaultBtn.style.display = showAdminControls ? 'inline-flex' : 'none';
  }
  const dropPinBtn = document.getElementById('btnRadarDropPin');
  if (dropPinBtn) {
    dropPinBtn.style.display = showAdminControls ? 'inline-flex' : 'none';
  }

  // Global Megaphone Broadcast Banner
  const mega = document.getElementById('remoMegaphoneBar');
  if (mega) {
    if (st.settings.announcementActive) {
      mega.style.display = 'flex';
      const txt = lang === 'fr' ? st.settings.announcement_fr : st.settings.announcement_en;
      document.getElementById('remoMegaphoneText').textContent = txt;
    } else {
      mega.style.display = 'none';
    }
  }

  // Genesis Allocation Live Slots Ticker
  if (typeof REMO_STORE.getGenesisAllocationStats === 'function') {
    const genStats = REMO_STORE.getGenesisAllocationStats();
    const slotsEl = document.getElementById('genesisSlotsLeft');
    if (slotsEl) slotsEl.textContent = genStats.remaining;
  }

  // User & Coins in Top Header
  const coinEl = document.getElementById('hdrCoinsVal');
  if (coinEl) coinEl.textContent = u ? u.coins.toLocaleString() : '0';

  if (typeof updateUnreadBadges === 'function') {
    updateUnreadBadges();
  }
  if (typeof syncStreakHeaderBadge === 'function') {
    syncStreakHeaderBadge();
  }
  if (typeof syncPushToggleUI === 'function') {
    syncPushToggleUI();
  }

  const authBtn = document.getElementById('hdrAuthBtn');
  const launcherSignOut = document.getElementById('appLauncherSignOutBtn');
  if (authBtn || launcherSignOut) {
    const curFb = REMO_STORE.fbAuth && REMO_STORE.fbAuth.currentUser;
    const isFbVerified = Boolean(curFb && REMO_STORE._isFbUserVerified && REMO_STORE._isFbUserVerified(curFb));
    const hasIdentity = Boolean(u && !(typeof REMO_STORE.isFakeOrGuestUser === 'function' && REMO_STORE.isFakeOrGuestUser(u)) && u.role !== 'guest' && u.name && (u.email || u.fbUid || isFbVerified));
    if (launcherSignOut) {
      launcherSignOut.style.display = hasIdentity ? 'inline-flex' : 'none';
    }
    if (authBtn) {
      if (hasIdentity) {
        const hc = getCityById(u.homeCity) || { flag: '🌐' };
        authBtn.innerHTML = `${hc.flag} ${escapeHtmlStr(u.name)}`;
        authBtn.onclick = () => switchRemoView('passport');
      } else {
        authBtn.innerHTML = `✨ ${escapeHtmlStr(t('btn_sign_in') || 'Sign In')}`;
        authBtn.onclick = () => openAuthModal();
      }
    }
  }

  // Left Sidebar Home City Card + Live Local Clock & Weather + Today's Crown
  const homeCard = document.getElementById('leftHomeCityBox');
  if (homeCard) {
    const hc = getCityById(u ? u.homeCity : 'montreal');
    const pts = st.cityScores[hc.id] || 1000;
    const wx = REMO_WEATHER.getCityLiveStatus(hc);
    const condTxt = lang === 'fr' ? wx.cond_fr : wx.cond_en;
    const spotlight = typeof computeCityDailySpotlight === 'function' ? computeCityDailySpotlight(hc.id) : null;
    const leaderLabel = spotlight
      ? `${spotlight.isLive24h ? t('spotlight_24h_lbl') : t('spotlight_mayor_lbl')}: @${escapeHtmlStr(spotlight.leaderName)}${spotlight.pointsToday > 0 ? ` (${spotlight.pointsToday}p)` : ''}`
      : '';
    homeCard.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
        <div>
          <div style="font-size:0.7rem;color:var(--muted);font-weight:700;">${t('passport_home_city')} · 🕒 ${wx.timeStr}</div>
          <div style="font-weight:900;font-size:1.05rem;margin-top:2px;display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
            <span>${hc.flag} ${getCityName(hc, lang)}</span>
            ${wx.isSurge ? `<span class="surge-mini-pill">${t('weather_surge_pill')}</span>` : ''}
          </div>
          <div style="font-size:0.74rem;color:#7dd3fc;font-weight:800;margin-top:2px;">${wx.icon} ${wx.tempC}°C · ${escapeHtmlStr(condTxt)}</div>
          <div style="font-size:0.75rem;color:#fbbf24;font-weight:800;margin-top:2px;">🏆 ${pts.toLocaleString()} PTS</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:5px;">
          <button class="btn-ghost" title="4D Citizen Passport" onclick="switchRemoView('passport')">🛂</button>
          <button class="btn-ghost" style="border-color:rgba(251,191,36,0.55);color:#fbbf24;" title="Official City Ambassador 9:16 Diploma (+25 🪙)" onclick="openCityAmbassadorModal()">🏅</button>
        </div>
      </div>
      ${spotlight ? `
      <div class="home-city-spotlight-row">
        <button type="button" class="home-spotlight-user" onclick="openCitizenProfileModal('${escapeHtmlStr(spotlight.leaderUid || '')}', '${escapeHtmlStr(spotlight.leaderName || '')}')">
          <span>${leaderLabel}</span>
        </button>
        <div class="home-spotlight-mini-btns">
          <button type="button" class="home-spotlight-mini-btn" onclick="openWorldBlitzModal()" title="Daily World Blitz">⚡</button>
          <button type="button" class="home-spotlight-mini-btn" onclick="openWidgetEmbedModal('${hc.id}')" title="Live City Widget">🧩</button>
        </div>
      </div>` : ''}
    `;
  }

  if (typeof updateUnreadBadges === 'function') updateUnreadBadges();
  if (typeof renderFeedCitySpotlightBar === 'function') renderFeedCitySpotlightBar();
  renderRightSidebarWidgets();
}

function computeCityDailySpotlight(cityId) {
  const cid = String(cityId || 'montreal').toLowerCase();
  const st = REMO_STORE.state || {};
  const posts = Array.isArray(st.posts) ? st.posts : [];
  const users = Array.isArray(st.users) ? st.users : [];
  const officialMayor = (REMO_STORE.getCityMayor) ? REMO_STORE.getCityMayor(cid) : null;
  const cutoffMs = Date.now() - 24 * 3600 * 1000;
  const todayUtc = new Date().toISOString().slice(0, 10);

  const tallyMap = new Map();
  const addScore = (key, meta, pts) => {
    if (!key) return;
    const prev = tallyMap.get(key) || {
      uid: meta.uid || '',
      name: meta.name || 'Citizen',
      points: 0
    };
    prev.points += pts;
    if (!prev.uid && meta.uid) prev.uid = meta.uid;
    if (meta.name && (!prev.name || prev.name === 'Citizen')) prev.name = meta.name;
    tallyMap.set(key, prev);
  };

  for (const p of posts) {
    if (!p || p.cityId !== cid || p.isShowcase) continue;
    const ts = Number(p.createdAt || 0);
    if (ts < cutoffMs) continue;
    const likePts = Array.isArray(p.likes) ? p.likes.length * 5 : 0;
    const cmtPts = Array.isArray(p.comments) ? p.comments.length * 8 : 0;
    const craftPts = (p.mediaType === 'text_card' || p.verifiedGps || p.isWorldWindow) ? 10 : 0;
    const pts = 25 + likePts + cmtPts + craftPts;
    const key = p.uid || (p.authorName ? 'name:' + p.authorName.toLowerCase() : '');
    addScore(key, { uid: p.uid || '', name: p.authorName || 'Citizen' }, pts);
  }

  for (const usr of users) {
    if (!usr || usr.banned || usr.homeCity !== cid) continue;
    if (usr.lastBlitzDate === todayUtc && Number(usr.lastBlitzScore || 0) > 0) {
      addScore(usr.uid, { uid: usr.uid, name: usr.name || 'Citizen' }, Number(usr.lastBlitzScore) * 12);
    }
  }

  const ranked = Array.from(tallyMap.values()).sort((a, b) => b.points - a.points);
  if (ranked.length > 0 && ranked[0].points > 0) {
    return {
      cityId: cid,
      leaderUid: ranked[0].uid,
      leaderName: ranked[0].name,
      pointsToday: ranked[0].points,
      isLive24h: true,
      officialMayor
    };
  }

  if (officialMayor) {
    return {
      cityId: cid,
      leaderUid: officialMayor.uid || '',
      leaderName: officialMayor.name || 'REMO Citizen',
      pointsToday: 0,
      isLive24h: false,
      officialMayor
    };
  }

  return {
    cityId: cid,
    leaderUid: 'u_admin_founder',
    leaderName: 'REMO Founder',
    pointsToday: 0,
    isLive24h: false,
    officialMayor: null
  };
}
window.computeCityDailySpotlight = computeCityDailySpotlight;

function renderFeedCitySpotlightBar() {
  const bar = document.getElementById('feedCitySpotlightBar');
  if (!bar) return;
  const lang = REMO_I18N.getLang();
  const u = REMO_STORE.getCurrentUser();
  const targetCid = (typeof currentFeedCityFilter === 'string' && currentFeedCityFilter && currentFeedCityFilter !== 'all')
    ? currentFeedCityFilter
    : ((u && u.homeCity) || 'montreal');
  const city = getCityById(targetCid) || getCityById('montreal');
  if (!city) {
    bar.style.display = 'none';
    return;
  }
  const sp = computeCityDailySpotlight(city.id);
  const badgeTitle = sp.isLive24h ? t('spotlight_24h_lbl') : t('spotlight_mayor_lbl');
  const scoreSub = sp.isLive24h
    ? t('spotlight_pts_today', { pts: sp.pointsToday })
    : t('spotlight_alltime');
  const hasSeparateMayor = sp.officialMayor && sp.officialMayor.name &&
    sp.officialMayor.name.toLowerCase() !== sp.leaderName.toLowerCase() && sp.isLive24h;

  bar.style.display = 'flex';
  bar.innerHTML = `
    <div class="spotlight-left" style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;min-width:0;">
      <button type="button" class="spotlight-crown-chip" onclick="openCitizenProfileModal('${escapeHtmlStr(sp.leaderUid || '')}', '${escapeHtmlStr(sp.leaderName || '')}')">
        <span>${city.flag} ${escapeHtmlStr(getCityName(city, lang))}</span>
        <span style="opacity:0.65;">·</span>
        <span>${escapeHtmlStr(badgeTitle)}: @${escapeHtmlStr(sp.leaderName)}</span>
      </button>
      <span class="spotlight-pts-lbl" style="font-size:0.71rem;font-weight:800;color:#93c5fd;">⚡ ${escapeHtmlStr(scoreSub)}${hasSeparateMayor ? ` · 🏛️ @${escapeHtmlStr(sp.officialMayor.name)}` : ''}</span>
    </div>
    <div class="spotlight-actions" style="display:flex;align-items:center;gap:5px;flex-shrink:0;">
      <button type="button" class="spotlight-action-btn" onclick="openCitySpotlightComposer('${city.id}')">${escapeHtmlStr(t('spotlight_claim_btn'))}</button>
      <button type="button" class="spotlight-action-btn" onclick="openWidgetEmbedModal('${city.id}')" title="${escapeHtmlStr(t('nav_city_widget'))}">🧩</button>
    </div>
  `;
}
window.renderFeedCitySpotlightBar = renderFeedCitySpotlightBar;

function openCitySpotlightComposer(cityId = '') {
  if (typeof openCreatePostModal === 'function') openCreatePostModal();
  const sel = document.getElementById('createCitySelect');
  if (sel && cityId) sel.value = cityId;
  if (typeof updateTextCardStudioPreview === 'function' && activeCreateStudioTab === 'textcard') {
    updateTextCardStudioPreview();
  }
}
window.openCitySpotlightComposer = openCitySpotlightComposer;

function renderRightSidebarWidgets() {
  const lang = REMO_I18N.getLang();
  const cupBox = document.getElementById('rightCityCupList');
  if (cupBox) {
    const sorted = Object.entries(REMO_STORE.state.cityScores || {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7);
    cupBox.innerHTML = sorted.map(([cid, pts], i) => {
      const c = getCityById(cid);
      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`;
      return `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:7px 9px;border-radius:11px;background:${i === 0 ? 'rgba(251,191,36,0.12)' : 'rgba(255,255,255,0.03)'};margin-bottom:6px;cursor:pointer;" onclick="filterFeedByCityFromMap('${c.id}')">
          <span style="font-weight:800;font-size:0.84rem;">${medal} ${c.flag} ${getCityName(c, lang)}</span>
          <span style="font-weight:900;font-size:0.78rem;color:#fbbf24;">${pts.toLocaleString()}</span>
        </div>
      `;
    }).join('');
  }

  const miniWar = document.getElementById('rightQuickWarBox');
  if (miniWar) {
    const activeWars = (REMO_STORE.state.duels || []).filter((w) => w && (!REMO_STORE.deletedDuelIds || !REMO_STORE.deletedDuelIds.has(w.id)));
    if (activeWars.length > 0) {
      const w = activeWars[0];
      const cA = getCityById(w.cityA) || { flag: '🏙️', name_en: w.cityA, name_fr: w.cityA },
            cB = getCityById(w.cityB) || { flag: '🏙️', name_en: w.cityB, name_fr: w.cityB };
      const vA = Number(w.votesA || 0), vB = Number(w.votesB || 0);
      const tot = Math.max(1, vA + vB);
      const pA = Math.round((vA / tot) * 100);
      const pB = 100 - pA;
      const u = REMO_STORE.getCurrentUser();
      const myVote = localStorage.getItem('remo_voted_' + w.id) || (u && u.votedWars && u.votedWars[w.id]) || '';
      const votedA = myVote === 'A';
      const votedB = myVote === 'B';
      const hasVoted = Boolean(myVote);
      const btnTextA = votedA ? `✓ ${cA.flag} ${t('war_voted_btn')}` : `${cA.flag} ${t('war_tap_btn')}`;
      const btnTextB = votedB ? `✓ ${cB.flag} ${t('war_voted_btn')}` : `${cB.flag} ${t('war_tap_btn')}`;
      const styleA = votedA ? 'border-color:#10b981;box-shadow:0 0 10px rgba(16,185,129,0.4);font-weight:900;' : (hasVoted ? 'opacity:0.5;' : '');
      const styleB = votedB ? 'border-color:#10b981;box-shadow:0 0 10px rgba(16,185,129,0.4);font-weight:900;' : (hasVoted ? 'opacity:0.5;' : '');
      const prefSide = votedB ? 'B' : (votedA ? 'A' : (pA >= pB ? 'A' : 'B'));

      miniWar.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;margin-bottom:6px;">
          <b style="font-size:0.82rem;">⚔️ ${cA.flag} ${getCityName(cA, lang)} vs ${cB.flag} ${getCityName(cB, lang)}</b>
          <button type="button" class="war-backup-btn" style="padding:3px 8px;font-size:0.66rem;" onclick="shareCityWarBackup('${w.id}','${prefSide}')">${t('war_backup_btn')}</button>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:0.72rem;font-weight:800;color:#cbd5e1;">
          <span>${cA.flag} ${pA}% (${vA.toLocaleString()})</span>
          <span>${cB.flag} ${pB}% (${vB.toLocaleString()})</span>
        </div>
        <div class="war-bar-track" style="height:10px;margin:5px 0;">
          <div class="war-bar-fill-a" style="width:${pA}%;transition:width 0.18s ease;"></div>
        </div>
        <div style="display:flex;gap:6px;margin-top:8px;">
          <button type="button" class="war-pulse-btn side-a" style="flex:1;padding:7px 6px;font-size:0.69rem;${styleA}" onclick="voteCityWar('${w.id}','A',event)">${btnTextA}</button>
          <button type="button" class="war-pulse-btn side-b" style="flex:1;padding:7px 6px;font-size:0.69rem;${styleB}" onclick="voteCityWar('${w.id}','B',event)">${btnTextB}</button>
        </div>
      `;
    } else {
      miniWar.innerHTML = `
        <div style="text-align:center;padding:12px 6px;color:var(--muted);font-size:0.78rem;">
          <div style="font-size:1.3rem;margin-bottom:4px;">⚔️</div>
          <div>${lang === 'fr' ? 'Aucune guerre de villes active' : 'No active city war'}</div>
        </div>
      `;
    }
  }
  if (typeof renderMobileCityWarStrip === 'function') {
    renderMobileCityWarStrip();
  }
}


/* ══════════════════════════════════════════════════════════════
   🎴 3D FLIP-CARD, CITY VERSUS DUEL & FEED BOUNTY HELPERS
   ══════════════════════════════════════════════════════════════ */
function handleTouchDoubleTap(ev, postId, wrapEl) {
  const now = Date.now();
  if (wrapEl._lastTouchTime && (now - wrapEl._lastTouchTime) < 340) {
    wrapEl._lastTouchTime = 0;
    handleMediaDoubleTap(ev, postId, wrapEl);
  } else {
    wrapEl._lastTouchTime = now;
  }
}

function flipPost3DCard(postId) {
  const p = findFeedPostById(postId);
  if (p && typeof isMysteryCityMaskedForViewer === 'function' && isMysteryCityMaskedForViewer(p, REMO_STORE.getCurrentUser())) {
    remoToast(t('guess_card_back_locked'));
    return;
  }
  const container = document.getElementById('post_flip_' + postId);
  if (!container) return;
  const inner = container.querySelector('.post-flip-inner');
  if (inner) {
    inner.classList.toggle('flipped');
    RemoAudio.play('hit');
    RemoAudio.haptic(25);
    if (typeof syncDesktopStageRail === 'function') syncDesktopStageRail(true);
  }
}

function savePostCardToAlbum(postId) {
  const p = findFeedPostById(postId);
  if (!p) return;
  const u = REMO_STORE.getCurrentUser();
  if (u) {
    if (!Array.isArray(u.ownedCards)) u.ownedCards = [];
    const cardId = 'card_flex_' + p.id;
    if (!u.ownedCards.some((c) => c.id === cardId)) {
      u.ownedCards.push({
        id: cardId,
        cityId: p.cityId,
        rarity: p.mintedCard ? 'Mythic 4D' : 'Legendary Gold',
        unlockedAt: Date.now(),
        creator: p.authorName
      });
      REMO_STORE.addCoins(u.uid, 10, 10);
      REMO_STORE.save(true, 'card_save');
    }
  }
  RemoAudio.play('fanfare');
  spawnRemoCoinsFX(12);
  remoToast(t('post_flip_saved_toast'), 'fanfare');
}

function voteCityVersusDuel(postId, choice, ev) {
  if (ev) ev.stopPropagation();
  const p = findFeedPostById(postId);
  if (!p || !p.versus) return;
  const v = p.versus;
  const lang = REMO_I18N.getLang();

  const now = Date.now();
  const endsAt = Number(v.endsAt || (p.createdAt ? p.createdAt + (v.durationHours || 24) * 3600000 : now + 86400000));
  if (v.closed || now >= endsAt) {
    v.closed = true;
    REMO_STORE.syncPostToCloud(p);
    remoToast(t('versus_ended_toast'));
    rerenderSinglePostCard(p.id);
    return;
  }

  const u = REMO_STORE.getCurrentUser() || REMO_STORE.ensureGuestOrCitizen('Citizen', '', 'montreal');
  let voterKey = (u && u.uid) ? u.uid : (localStorage.getItem('remo_guest_vid') || '');
  if (!voterKey) {
    voterKey = 'g_' + Date.now().toString(36);
    localStorage.setItem('remo_guest_vid', voterKey);
  }

  if (!Array.isArray(v.voters)) v.voters = [];
  if (!v.voterSides) v.voterSides = {};

  const prevSide = v.voterSides[voterKey] || localStorage.getItem('remo_versus_side_' + p.id) || '';
  const alreadyVoted = v.voters.includes(voterKey) || Boolean(localStorage.getItem('remo_versus_voted_' + p.id));

  if (alreadyVoted) {
    const lockedSide = prevSide || choice;
    if (voterKey) {
      if (!v.voters.includes(voterKey)) v.voters.push(voterKey);
      v.voterSides[voterKey] = lockedSide;
    }
    localStorage.setItem('remo_versus_voted_' + p.id, '1');
    localStorage.setItem('remo_versus_side_' + p.id, lockedSide);

    const sideValues = Object.values(v.voterSides || {});
    const mapLeft = sideValues.filter((s) => s === 'left').length;
    const mapRight = sideValues.filter((s) => s === 'right').length;
    if ((mapLeft + mapRight) > 0 && v.voters.length <= (mapLeft + mapRight)) {
      v.leftVotes = mapLeft;
      v.rightVotes = mapRight;
    } else {
      if (lockedSide === 'left' && (!v.leftVotes || v.leftVotes < 1)) v.leftVotes = 1;
      if (lockedSide === 'right' && (!v.rightVotes || v.rightVotes < 1)) v.rightVotes = 1;
    }
    REMO_STORE.syncPostToCloud(p);
    rerenderSinglePostCard(p.id);
    remoToast(t('versus_already_voted'));
    return;
  }

  if (!v.voters.includes(voterKey)) {
    v.voters.push(voterKey);
  }
  v.voterSides[voterKey] = choice;
  localStorage.setItem('remo_versus_voted_' + p.id, '1');
  localStorage.setItem('remo_versus_side_' + p.id, choice);

  const sideValuesAfter = Object.values(v.voterSides || {});
  const mapLeftAfter = sideValuesAfter.filter((s) => s === 'left').length;
  const mapRightAfter = sideValuesAfter.filter((s) => s === 'right').length;
  if ((mapLeftAfter + mapRightAfter) > 0 && v.voters.length <= (mapLeftAfter + mapRightAfter)) {
    v.leftVotes = mapLeftAfter;
    v.rightVotes = mapRightAfter;
  } else if (choice === 'left') {
    v.leftVotes = (Number(v.leftVotes) || 0) + 1;
  } else {
    v.rightVotes = (Number(v.rightVotes) || 0) + 1;
  }

  if (choice === 'left') {
    REMO_STORE.addCityScore(v.leftCityId || 'montreal', 50);
  } else {
    REMO_STORE.addCityScore(v.rightCityId || 'paris', 50);
  }

  if (u && u.uid) {
    REMO_STORE.addCoins(u.uid, 10, 10);
  }
  REMO_STORE.syncPostToCloud(p);
  REMO_STORE.save(true, 'versus_vote');
  spawnRemoCoinsFX(10);
  RemoAudio.play('coin');
  try { if (navigator.vibrate) navigator.vibrate(15); } catch (e) {}

  const chosenCity = getCityById(choice === 'left' ? v.leftCityId : v.rightCityId);
  remoToast(t('versus_voted_toast', { city: getCityName(chosenCity, lang) }), 'coin');
  rerenderSinglePostCard(p.id);
  syncHeaderAndSidebars();
}
window.voteCityVersusDuel = voteCityVersusDuel;

function claimVersusVictoryBonus(postId, ev) {
  if (ev) ev.stopPropagation();
  const p = findFeedPostById(postId);
  if (!p || !p.versus) return;
  const v = p.versus;
  const u = REMO_STORE.getCurrentUser() || REMO_STORE.ensureGuestOrCitizen('Citizen', '', 'montreal');
  const voterKey = (u && u.uid) ? u.uid : (localStorage.getItem('remo_guest_vid') || '');

  if (!Array.isArray(v.claimedBonus)) v.claimedBonus = [];
  if (v.claimedBonus.includes(voterKey) || localStorage.getItem('remo_versus_claimed_' + p.id)) {
    remoToast(t('versus_claimed_bonus_lbl'));
    return;
  }

  v.claimedBonus.push(voterKey);
  localStorage.setItem('remo_versus_claimed_' + p.id, '1');
  if (u && u.uid) {
    REMO_STORE.addCoins(u.uid, 25, 25);
  }
  REMO_STORE.syncPostToCloud(p);
  REMO_STORE.save(true, 'versus_claim_bonus');
  spawnRemoCoinsFX(20);
  RemoAudio.play('fanfare');
  remoToast(t('versus_bonus_claimed_toast'), 'fanfare');
  rerenderSinglePostCard(p.id);
  syncHeaderAndSidebars();
}
window.claimVersusVictoryBonus = claimVersusVictoryBonus;

function adminConcludeDuelNow(postId, ev) {
  if (ev) ev.stopPropagation();
  if (!REMO_STORE.isAdminUnlocked()) return;
  const p = (REMO_STORE.state.posts || []).find((x) => x.id === postId);
  if (!p || !p.versus) return;
  const v = p.versus;
  v.closed = true;
  v.endsAt = Date.now() - 1000;
  const leftVotes = Number(v.leftVotes || 0);
  const rightVotes = Number(v.rightVotes || 0);
  v.winnerSide = leftVotes > rightVotes ? 'left' : (rightVotes > leftVotes ? 'right' : 'tie');
  if (v.winnerSide === 'left') REMO_STORE.addCityScore(v.leftCityId || 'montreal', 500);
  else if (v.winnerSide === 'right') REMO_STORE.addCityScore(v.rightCityId || 'paris', 500);
  REMO_STORE.syncPostToCloud(p);
  REMO_STORE.save(true, 'admin_conclude_duel');
  rerenderSinglePostCard(p.id);
  syncHeaderAndSidebars();
  remoToast('👑 Official City Duel concluded by Admin!');
}
window.adminConcludeDuelNow = adminConcludeDuelNow;

function claimPostFeedBounty(postId) {
  const p = (REMO_STORE.state.posts || []).find((x) => x.id === postId);
  if (!p || !p.bounty) return;
  const b = p.bounty;
  const lang = REMO_I18N.getLang();
  if (b.claimed) {
    remoToast(t('bounty_feed_claimed_by', { user: b.claimedBy || 'Citizen', coins: b.coins }));
    return;
  }

  const u = REMO_STORE.getCurrentUser() || REMO_STORE.ensureGuestOrCitizen('Hunter', '', 'montreal');
  const ans = prompt(t('bounty_feed_prompt', { coins: b.coins }));
  if (!ans) return;

  const isAdm = REMO_STORE.isAdminUnlocked() || REMO_STORE.isCurrentUserAdmin();
  const cleanAns = ans.trim().toLowerCase();
  const expected = (b.answer || '').trim().toLowerCase();

  if (isAdm || cleanAns === expected || (expected && cleanAns.includes(expected))) {
    b.claimed = true;
    b.claimedBy = u.name;
    b.claimedAt = Date.now();
    REMO_STORE.addCoins(u.uid, b.coins, b.coins);
    REMO_STORE.syncPostToCloud(p);
    REMO_STORE.save(true, 'bounty_feed_claimed');
    spawnRemoCoinsFX(20);
    RemoAudio.play('fanfare');
    remoToast(t('bounty_feed_success', { coins: b.coins }), 'fanfare');
    rerenderSinglePostCard(p.id);
    syncHeaderAndSidebars();
  } else {
    RemoAudio.play('hit');
    remoToast(t('bounty_feed_wrong'));
  }
}

function resolveCityFallbackArtUrl(cityOrId, headline = '', subline = '') {
  const city = (cityOrId && typeof cityOrId === 'object') ? cityOrId : getCityById(cityOrId);
  const cid = (city && city.id) || (typeof cityOrId === 'string' ? cityOrId : '') || 'montreal';
  const cleanHeadline = String(headline || '').trim();
  if (cleanHeadline && typeof generateCityPostVisualDataUrl === 'function') {
    return generateCityPostVisualDataUrl(cid, cleanHeadline, subline || '');
  }
  if (typeof resolveCityRealPhotoUrl === 'function') {
    const realUrl = resolveCityRealPhotoUrl(city || cid);
    if (realUrl) return realUrl;
  }
  return typeof generateCityPostVisualDataUrl === 'function'
    ? generateCityPostVisualDataUrl(cid, cleanHeadline || getCityName(city, 'en'), subline || '')
    : '';
}

function updateVersusAutoPreviews() {
  const isFr = typeof REMO_I18N !== 'undefined' && REMO_I18N.getLang && REMO_I18N.getLang() === 'fr';
  const autoBadgeTxt = isFr ? '🌐 Photo auto ville' : '🌐 Auto City Photo';
  const resetTitle = isFr ? 'Revenir à la photo auto' : 'Revert to Auto Photo';

  ['left', 'right'].forEach((side) => {
    const prev = document.getElementById(side === 'left' ? 'versusLeftPreview' : 'versusRightPreview');
    if (!prev) return;
    const customSrc = pendingVersusMedia && pendingVersusMedia[side];
    if (customSrc) {
      const safeCustom = sanitizeSafeMediaUrl(customSrc);
      prev.style.display = 'block';
      prev.innerHTML = `<div style="position:relative;width:100%;height:100%;"><img src="${escapeHtmlStr(safeCustom)}" alt="${side}" style="width:100%;height:100%;object-fit:cover;display:block;"><button type="button" onclick="clearVersusCustomMedia('${side}')" title="${escapeHtmlStr(resetTitle)}" style="position:absolute;top:5px;right:5px;padding:2px 7px;border-radius:999px;border:1px solid rgba(255,255,255,0.28);background:rgba(15,23,42,0.84);color:#fff;font-size:0.66rem;font-weight:800;cursor:pointer;">↺ Auto</button></div>`;
      return;
    }
    const sel = document.getElementById(side === 'left' ? 'createVersusLeftCity' : 'createVersusRightCity');
    const cid = (sel && sel.value) || (side === 'left' ? 'montreal' : 'paris');
    const autoSrc = resolveCityFallbackArtUrl(cid);
    if (autoSrc) {
      const safeAuto = sanitizeSafeMediaUrl(autoSrc) || autoSrc;
      prev.style.display = 'block';
      prev.innerHTML = `<div style="position:relative;width:100%;height:100%;"><img src="${escapeHtmlStr(safeAuto)}" alt="${escapeHtmlStr(cid)}" style="width:100%;height:100%;object-fit:cover;display:block;"><span style="position:absolute;left:6px;bottom:5px;padding:2px 8px;border-radius:999px;background:rgba(5,10,26,0.8);border:1px solid rgba(56,189,248,0.45);color:#e0f2fe;font-size:0.64rem;font-weight:800;backdrop-filter:blur(4px);pointer-events:none;">${autoBadgeTxt}</span></div>`;
    } else {
      prev.style.display = 'none';
      prev.innerHTML = '';
    }
  });
}

function clearVersusCustomMedia(side) {
  if (side !== 'left' && side !== 'right') return;
  pendingVersusMedia[side] = '';
  const inp = document.getElementById(side === 'left' ? 'createVersusLeftFile' : 'createVersusRightFile');
  if (inp) inp.value = '';
  updateVersusAutoPreviews();
}

window.resolveCityFallbackArtUrl = resolveCityFallbackArtUrl;
window.updateVersusAutoPreviews = updateVersusAutoPreviews;
window.clearVersusCustomMedia = clearVersusCustomMedia;

async function handleVersusMediaSelect(side, ev) {
  const file = ev.target.files && ev.target.files[0];
  if (!file) return;
  const prev = document.getElementById(side === 'left' ? 'versusLeftPreview' : 'versusRightPreview');
  if (prev) {
    prev.style.display = 'block';
    prev.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:0.75rem;color:#38bdf8;">⏳ Optimizing...</div>`;
  }
  try {
    let compressedUrl = '';
    if (typeof window.compressImageFileToDataUrl === 'function') {
      compressedUrl = await window.compressImageFileToDataUrl(file, 960, 0.78);
    }
    if (!compressedUrl) {
      compressedUrl = await new Promise((res) => {
        const rd = new FileReader();
        rd.onload = (e) => res(e.target.result);
        rd.onerror = () => res('');
        rd.readAsDataURL(file);
      });
    }
    pendingVersusMedia[side] = compressedUrl;
    updateVersusAutoPreviews();
  } catch (err) {
    console.warn('handleVersusMediaSelect error:', err);
  }
}

function toggleCustomCapsuleMinutesInp(val) {
  const customInp = document.getElementById('createCapsuleCustomMins');
  if (customInp) {
    customInp.style.display = val === 'custom' ? 'block' : 'none';
  }
}

function formatVersusCountdown(diffMs, lang) {
  if (diffMs <= 0) return '00h 00m';
  const totalMins = Math.floor(diffMs / 60000);
  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    const remH = hours % 24;
    return lang === 'fr' ? `${days}j ${remH}h` : `${days}d ${remH}h`;
  }
  return `${hours}h ${mins}m`;
}

function getVersusCategoryLabel(catKey, lang) {
  const mapEn = {
    general: '⚡ Overall Prestige',
    nightlife: '🌙 Nightlife & Skyline',
    food: '🍽️ Gastronomy & Food',
    culture: '🎭 Culture & Heritage',
    summer: '☀️ Summer Vibes',
    tech: '🚀 Tech & Innovation'
  };
  const mapFr = {
    general: '⚡ Prestige Global',
    nightlife: '🌙 Vie Nocturne & Lumières',
    food: '🍽️ Gastronomie & Saveurs',
    culture: '🎭 Culture & Patrimoine',
    summer: '☀️ Soleil & Voyages',
    tech: '🚀 Tech & Innovation'
  };
  const map = lang === 'fr' ? mapFr : mapEn;
  return map[catKey] || map.general;
}

function renderCityVersusDuelStage(p, lang) {
  const v = p.versus || {};
  const cA = getCityById(v.leftCityId || 'montreal') || { flag: '⚜️', code: 'MTL', id: 'montreal' };
  const cB = getCityById(v.rightCityId || 'paris') || { flag: '🗼', code: 'PAR', id: 'paris' };
  const nameA = escapeHtmlStr(getCityName(cA, lang));
  const nameB = escapeHtmlStr(getCityName(cB, lang));

  const u = (REMO_STORE && REMO_STORE.getCurrentUser) ? REMO_STORE.getCurrentUser() : null;
  const voterKey = (u && u.uid) ? u.uid : (localStorage.getItem('remo_guest_vid') || '');
  const hasVoted = Boolean(
    (voterKey && Array.isArray(v.voters) && v.voters.includes(voterKey)) ||
    localStorage.getItem('remo_versus_voted_' + p.id)
  );
  const votedSide = (v.voterSides && voterKey && v.voterSides[voterKey]) || localStorage.getItem('remo_versus_side_' + p.id) || '';

  // Ensure local vote is always reflected in the tally and self-heal any inflated count from voterSides
  if (voterKey && votedSide) {
    if (!Array.isArray(v.voters)) v.voters = [];
    if (!v.voters.includes(voterKey)) v.voters.push(voterKey);
    if (!v.voterSides) v.voterSides = {};
    if (!v.voterSides[voterKey]) v.voterSides[voterKey] = votedSide;
  }
  const sideValues = Object.values(v.voterSides || {});
  const mapLeft = sideValues.filter((s) => s === 'left').length;
  const mapRight = sideValues.filter((s) => s === 'right').length;
  const voterCount = Array.isArray(v.voters) ? v.voters.length : 0;

  let leftVotes = Number(v.leftVotes || 0);
  let rightVotes = Number(v.rightVotes || 0);
  if ((mapLeft + mapRight) > 0 && voterCount <= (mapLeft + mapRight)) {
    leftVotes = mapLeft;
    rightVotes = mapRight;
  } else {
    leftVotes = Math.max(leftVotes, mapLeft, votedSide === 'left' ? 1 : 0);
    rightVotes = Math.max(rightVotes, mapRight, votedSide === 'right' ? 1 : 0);
  }
  if (leftVotes !== Number(v.leftVotes || 0) || rightVotes !== Number(v.rightVotes || 0)) {
    v.leftVotes = leftVotes;
    v.rightVotes = rightVotes;
    if (REMO_STORE && typeof REMO_STORE.syncPostToCloud === 'function') {
      REMO_STORE.syncPostToCloud(p);
    }
  }
  const total = leftVotes + rightVotes;
  const pA = total > 0 ? Math.round((leftVotes / total) * 100) : 50;
  const pB = total > 0 ? (100 - pA) : 50;
  const leftSrc = v.leftMedia || resolveCityFallbackArtUrl(cA);
  const rightSrc = v.rightMedia || resolveCityFallbackArtUrl(cB);

  const now = Date.now();
  const endsAt = Number(v.endsAt || (p.createdAt ? p.createdAt + (v.durationHours || 24) * 3600000 : now + 86400000));
  const isExpired = Boolean(v.closed) || (now >= endsAt);

  // Auto-close if expired
  let winnerSide = v.winnerSide || null;
  if (isExpired && !winnerSide) {
    winnerSide = leftVotes > rightVotes ? 'left' : (rightVotes > leftVotes ? 'right' : 'tie');
    v.closed = true;
    v.winnerSide = winnerSide;
  }

  const isLeftWinner = isExpired && winnerSide === 'left';
  const isRightWinner = isExpired && winnerSide === 'right';
  const isTie = isExpired && winnerSide === 'tie';

  const catLabel = getVersusCategoryLabel(v.category, lang);
  const diffMs = Math.max(0, endsAt - now);
  const timeStr = formatVersusCountdown(diffMs, lang);

  const hasClaimedVictory = Boolean(
    (voterKey && Array.isArray(v.claimedBonus) && v.claimedBonus.includes(voterKey)) ||
    localStorage.getItem('remo_versus_claimed_' + p.id)
  );
  const userWon = isExpired && ((winnerSide === 'left' && votedSide === 'left') || (winnerSide === 'right' && votedSide === 'right'));

  const isAdm = (REMO_STORE && (REMO_STORE.isAdminUnlocked() || REMO_STORE.isCurrentUserAdmin()));

  // Top header bar
  const topBarHtml = `
    <div class="versus-stage-topbar">
      <span class="versus-cat-tag">👑 ${catLabel}</span>
      <div style="display:flex;align-items:center;gap:6px;">
        ${!isExpired ? `<span class="versus-timer-tag" data-versus-timer="${p.id}" data-ends="${endsAt}">${escapeHtmlStr(t('versus_time_left', { time: timeStr }))}</span>` : `<span class="versus-timer-tag" style="border-color:#fbbf24;color:#fbbf24;">${escapeHtmlStr(t('versus_ended_badge'))}</span>`}
        ${isAdm && !isExpired ? `<button type="button" class="btn-ghost" style="padding:2px 7px;font-size:0.68rem;border-color:#fbbf24;color:#fbbf24;background:rgba(0,0,0,0.6);" onclick="adminConcludeDuelNow('${p.id}', event)" title="Admin: Conclude duel now">${escapeHtmlStr(t('versus_conclude_adm_btn'))}</button>` : ''}
      </div>
    </div>
  `;

  // Overlay when duel is ended
  let winnerOverlayHtml = '';
  if (isExpired) {
    let winMsg = '';
    if (isTie) {
      winMsg = t('versus_tie_announcement', { cityA: `${cA.flag} ${nameA}`, cityB: `${cB.flag} ${nameB}` });
    } else {
      const winCity = winnerSide === 'left' ? cA : cB;
      const winName = winnerSide === 'left' ? nameA : nameB;
      winMsg = t('versus_winner_announcement', { city: `${winCity.flag} ${winName}` });
    }

    winnerOverlayHtml = `
      <div class="versus-winner-overlay">
        <div class="versus-winner-card">
          <div style="font-size:0.75rem;font-weight:900;letter-spacing:1px;color:#fbbf24;margin-bottom:4px;">${escapeHtmlStr(t('versus_ended_badge'))}</div>
          <div style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:0.98rem;color:#fff;margin-bottom:8px;">${winMsg}</div>
          <div style="display:flex;justify-content:center;gap:12px;font-size:0.82rem;font-weight:800;color:#e2e8f0;margin-bottom:6px;">
            <span>${cA.flag} ${cA.code}: <b>${pA}%</b> (${leftVotes})</span>
            <span style="color:#fbbf24;">•</span>
            <span>${cB.flag} ${cB.code}: <b>${pB}%</b> (${rightVotes})</span>
          </div>
          ${userWon && !hasClaimedVictory ? `
            <button type="button" class="btn-cyber btn-gold" style="margin-top:6px;padding:6px 14px;font-size:0.78rem;" onclick="claimVersusVictoryBonus('${p.id}', event)">
              ${escapeHtmlStr(t('versus_claim_bonus_btn'))}
            </button>
          ` : (userWon && hasClaimedVictory ? `
            <div style="font-size:0.75rem;color:#10b981;font-weight:800;margin-top:4px;">${escapeHtmlStr(t('versus_claimed_bonus_lbl'))}</div>
          ` : '')}
        </div>
      </div>
    `;
  }

  const leftPillText = votedSide === 'left'
    ? `${t('versus_you_voted_side')} · ${cA.flag} ${cA.code} (${pA}%)`
    : (hasVoted || isExpired ? `${cA.flag} ${cA.code} (${pA}%)` : `🗳️ ${cA.flag} ${cA.code} (${pA}%)`);

  const rightPillText = votedSide === 'right'
    ? `${t('versus_you_voted_side')} · ${cB.flag} ${cB.code} (${pB}%)`
    : (hasVoted || isExpired ? `${cB.flag} ${cB.code} (${pB}%)` : `🗳️ ${cB.flag} ${cB.code} (${pB}%)`);

  return `
    <div class="city-versus-stage ${isExpired ? 'finished' : ''}">
      ${topBarHtml}
      <div class="versus-pane left ${votedSide === 'left' ? 'voted' : ''} ${isLeftWinner ? 'winner' : ''}" onclick="voteCityVersusDuel('${escapeJsSingleArg(p.id)}', 'left', event)">
        <img src="${leftSrc}" loading="lazy" decoding="async" alt="${nameA}">
        <div class="versus-city-pill left ${votedSide === 'left' ? 'active' : ''}">${leftPillText}</div>
      </div>
      <div class="versus-bolt-divider">
        <div class="versus-bolt-badge">⚡</div>
      </div>
      <div class="versus-pane right ${votedSide === 'right' ? 'voted' : ''} ${isRightWinner ? 'winner' : ''}" onclick="voteCityVersusDuel('${escapeJsSingleArg(p.id)}', 'right', event)">
        <img src="${rightSrc}" loading="lazy" decoding="async" alt="${nameB}">
        <div class="versus-city-pill right ${votedSide === 'right' ? 'active' : ''}">${rightPillText}</div>
      </div>
      ${winnerOverlayHtml}
    </div>
  `;
}

function renderPostCardBack(p, city, lang, wx) {
  const serial = (p.id || '').slice(-6).toUpperCase();
  const cosm = (REMO_STORE && REMO_STORE.getUserCosmetics) ? REMO_STORE.getUserCosmetics(p.uid) : { frameClass: '', title_fr: '', title_en: '' };
  const royalTitle = lang === 'fr' ? (cosm.title_fr || '') : (cosm.title_en || '');
  const cityName = getCityName(city, lang);
  const authorUser = (REMO_STORE.state.users || []).find((usr) => usr && ((p.uid && usr.uid === p.uid) || (p.authorName && usr.name && usr.name.toLowerCase() === p.authorName.toLowerCase())));
  const authorAvatarUrl = p.authorAvatar || (typeof REMO_STORE.getUserAvatar === 'function' ? REMO_STORE.getUserAvatar(p.uid || p.authorName) : '') || (authorUser && authorUser.avatarUrl) || '';

  // Dynamic collectible scores
  const likesCount = Array.isArray(p.likes) ? p.likes.length : (typeof p.likes === 'number' ? p.likes : 0);
  const hypeScore = Math.min(99, Math.max(35, 45 + likesCount * 4));
  const rarityPct = p.founderAward ? 96 : (p.boosted ? 86 : 72);
  const rarityLbl = p.founderAward ? 'FOUNDER LEGEND' : (p.boosted ? '4D ULTRA' : '4D HOLO');
  const tempStr = wx ? `${wx.tempC ?? 20}°C` : '20°C';
  const mintVal = 10 + likesCount * 2;
  const citizenLabel = t('post_flip_registered_citizen') || (lang === 'fr' ? 'CITOYEN ENREGISTRÉ' : 'REGISTERED CITIZEN');
  const certifiedLabel = t('post_flip_certified') || (lang === 'fr' ? '★ CERTIFIÉ REMO EARTH 4D ★' : '★ REMO EARTH 4D CERTIFIED ★');

  return `
    <div class="holo-back-shimmer"></div>
    <div class="post-back-stamp-seal">
      <span>REMO EARTH™</span>
      <span style="font-size:0.55rem;margin:2px 0;">AUTHENTICATED</span>
      <span>${city.code || '4D'} 4D</span>
    </div>

    <!-- Header Row: Holographic title & Golden Serial -->
    <div class="post-back-top-row">
      <div class="holo-title-pill">🎴 ${lang === 'fr' ? 'CARTE HOLOGRAPHIQUE 4D' : '4D HOLOGRAPHIC CARD'}</div>
      <div class="holo-serial-badge">#${serial}</div>
    </div>

    <!-- Citizen ID Card strip (Registered Citizen city instead of raw GPS) -->
    <div class="holo-citizen-header-card">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;">
        <div style="display:flex;align-items:center;gap:7px;">
          <div class="avatar-circle ${cosm.frameClass}" style="width:28px;height:28px;font-size:0.75rem;overflow:hidden;padding:0;">
            ${sanitizeSafeMediaUrl(authorAvatarUrl) ? `<img src="${sanitizeSafeMediaUrl(authorAvatarUrl)}" loading="lazy" decoding="async" style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block;" alt="${escapeHtmlStr(p.authorName)}">` : escapeHtmlStr((p.authorName || 'R')[0].toUpperCase())}
          </div>
          <div>
            <b style="color:#fbbf24;font-size:0.82rem;">@${escapeHtmlStr(p.authorName)}</b>
            ${royalTitle ? `<span class="royal-title-pill" style="font-size:0.6rem;margin-left:4px;">${escapeHtmlStr(royalTitle)}</span>` : ''}
          </div>
        </div>
        <span class="registered-city-badge">🏛️ ${citizenLabel}: ${city.flag} ${cityName.toUpperCase()}</span>
      </div>
    </div>

    <!-- Spectacular Colorful Animated Centerpiece -->
    <div class="holo-prism-centerpiece">
      <div class="holo-prism-ring">
        <span class="holo-crest-flag">${city.flag}</span>
      </div>
      <div class="holo-crest-cityname">${cityName.toUpperCase()}</div>
      <div class="holo-crest-allegiance">${certifiedLabel}</div>
    </div>

    <!-- 4 Colorful Cyberpunk Stat Bars -->
    <div class="holo-stats-grid">
      <div class="holo-stat-item">
        <div class="stat-lbl-row">
          <span>🔥 Vibe & Hype</span>
          <b>${hypeScore}%</b>
        </div>
        <div class="holo-stat-bar-track">
          <div class="holo-stat-bar-fill bar-rose" style="width:${hypeScore}%;"></div>
        </div>
      </div>

      <div class="holo-stat-item">
        <div class="stat-lbl-row">
          <span>⭐ ${t('post_flip_rarity') || (lang === 'fr' ? 'Rareté 4D' : '4D Rarity')}</span>
          <b style="color:#fbbf24;">${rarityLbl}</b>
        </div>
        <div class="holo-stat-bar-track">
          <div class="holo-stat-bar-fill bar-gold" style="width:${rarityPct}%;"></div>
        </div>
      </div>

      <div class="holo-stat-item">
        <div class="stat-lbl-row">
          <span>🌤️ ${t('post_flip_climate') || (lang === 'fr' ? 'Climat Live' : 'Live Climate')}</span>
          <b style="color:#38bdf8;">${tempStr}</b>
        </div>
        <div class="holo-stat-bar-track">
          <div class="holo-stat-bar-fill bar-cyan" style="width:80%;"></div>
        </div>
      </div>

      <div class="holo-stat-item">
        <div class="stat-lbl-row">
          <span>🪙 ${t('post_flip_mint_val') || (lang === 'fr' ? 'Valeur Mint' : 'Mint Value')}</span>
          <b style="color:#34d399;">+${mintVal} 🪙</b>
        </div>
        <div class="holo-stat-bar-track">
          <div class="holo-stat-bar-fill bar-emerald" style="width:75%;"></div>
        </div>
      </div>
    </div>

    ${p.bounty && !p.bounty.claimed ? `
      <div style="background:rgba(245,158,11,0.22);border:1px dashed #fbbf24;border-radius:8px;padding:5px 9px;font-size:0.75rem;color:#fde68a;display:flex;align-items:center;gap:6px;position:relative;z-index:2;">
        <span>🎁</span> <b>${lang === 'fr' ? 'Prime Active :' : 'Active Bounty:'}</b> +${p.bounty.coins} 🪙
      </div>
    ` : ''}

    ${p.voiceUrl ? `
      <div style="background:rgba(56,189,248,0.15);border:1px solid rgba(56,189,248,0.3);border-radius:8px;padding:4px 8px;font-size:0.72rem;color:#bae6fd;display:flex;align-items:center;gap:6px;position:relative;z-index:2;">
        <span>🎙️</span> <b>${lang === 'fr' ? 'Note Vocale :' : 'Voice Note:'}</b> ${lang === 'fr' ? 'Enregistrement 4D Inclus' : '4D Audio Included'}
      </div>
    ` : ''}

    <!-- Bottom Flip Card Action Buttons -->
    <div class="post-back-actions">
      <button type="button" class="btn-cyber btn-gold" style="flex:1;font-size:0.75rem;padding:7px 10px;justify-content:center;" onclick="savePostCardToAlbum('${p.id}')">
        ${t('post_flip_save')}
      </button>
      <button type="button" class="btn-ghost" style="font-size:0.75rem;padding:7px 10px;" onclick="flipPost3DCard('${p.id}')">
        ${t('post_flip_front_btn')}
      </button>
    </div>
  `;
}

function renderFeedBountyWidget(p, lang) {
  if (!p.bounty || !p.bounty.coins) return '';
  const b = p.bounty;
  if (b.claimed) {
    return `
      <div class="feed-bounty-box" style="background:rgba(16,185,129,0.12);border-color:#10b981;">
        <span style="font-size:0.78rem;font-weight:800;color:#6ee7b7;">
          ${t('bounty_feed_claimed_by', { user: escapeHtmlStr(b.claimedBy || 'Citizen'), coins: b.coins })}
        </span>
      </div>
    `;
  }
  return `
    <div class="feed-bounty-box">
      <div style="display:flex;align-items:center;gap:8px;">
        <span class="feed-bounty-badge">🎁 +${b.coins} 🪙</span>
        <span style="font-size:0.76rem;color:#cbd5e1;font-weight:700;">
          ${b.clue ? `💡 "${escapeHtmlStr(b.clue)}"` : t('bounty_feed_badge', { coins: b.coins })}
        </span>
      </div>
      <button type="button" class="btn-cyber btn-gold" style="font-size:0.72rem;padding:4px 10px;" onclick="claimPostFeedBounty('${p.id}')">
        ${t('bounty_feed_claim_btn')}
      </button>
    </div>
  `;
}

/* ── 2. STORIES, FLASH DROP TIMER, DAILY PULSE & SOCIAL FEED ── */
function renderStoriesAndBanners() {
  if (typeof renderLivePresenceStrip === 'function') {
    renderLivePresenceStrip();
  }
  if (typeof renderFeedDailyMatchPill === 'function') {
    renderFeedDailyMatchPill();
  }
  if (typeof renderMobileCityWarStrip === 'function') {
    renderMobileCityWarStrip();
  }
  if (typeof renderActiveGameChallengeHero === 'function') {
    renderActiveGameChallengeHero();
  }
  const lang = REMO_I18N.getLang();
  const bar = document.getElementById('storiesBarEl');
  if (bar) {
    bar.style.display = 'none';
    bar.innerHTML = '';
  }
  if (typeof updateHeaderStoryBadge === 'function') {
    updateHeaderStoryBadge();
  }

  // Daily Pulse Banner + 1-Click Live World Window
  const pulseBox = document.getElementById('dailyPulseBox');
  const dp = REMO_STORE.state.settings.dailyPulse;
  if (pulseBox && dp && dp.active) {
    pulseBox.style.display = 'flex';
    const ttl = lang === 'fr' ? dp.title_fr : dp.title_en;
    pulseBox.innerHTML = `
      <div>
        <div style="font-size:0.72rem;font-weight:900;color:#38bdf8;">${t('pulse_badge')} · ${dp.hashtag}</div>
        <div class="pulse-title-text" style="font-weight:800;font-size:0.9rem;margin-top:2px;">${ttl}</div>
      </div>
      <div style="display:flex;gap:7px;flex-wrap:wrap;align-items:center;">
        <button type="button" class="btn-window-sync" onclick="openLiveWindowCreator('${dp.hashtag}')">${t('win_pulse_btn')}</button>
        <button type="button" class="btn-cyber" onclick="openCreatePostModal('${dp.hashtag}')">${t('pulse_join_btn')}</button>
      </div>
    `;
  }

  renderWorldWeatherTicker();
  try {
    if (localStorage.getItem('remo_genesis_dismissed') === '1') {
      const gFomo = document.getElementById('genesisFomoBar');
      if (gFomo) gFomo.style.display = 'none';
    }
  } catch (e) {}
}

function renderWorldWeatherTicker() {
  const ticker = document.getElementById('worldWeatherTickerBar');
  if (!ticker || typeof REMO_WEATHER === 'undefined') return;
  if (typeof REMO_WEATHER.hydrateAllCitiesBatch === 'function') {
    REMO_WEATHER.hydrateAllCitiesBatch();
  }
  const lang = REMO_I18N.getLang();
  const u = REMO_STORE.getCurrentUser();
  const allCities = getRemoCities();
  const wxMap = Object.create(null);
  allCities.forEach((c) => {
    wxMap[c.id] = REMO_WEATHER.getCityLiveStatus(c);
  });

  // Prioritize active 2X Weather Surge cities, user's Home City, community cities, and top capitals
  const ordered = allCities.slice().sort((a, b) => {
    const wA = wxMap[a.id]?.isSurge ? 1 : 0;
    const wB = wxMap[b.id]?.isSurge ? 1 : 0;
    if (wB !== wA) return wB - wA;
    if (u && a.id === u.homeCity) return -1;
    if (u && b.id === u.homeCity) return 1;
    return 0;
  });

  ticker.innerHTML =
    `<span style="flex-shrink:0;font-size:0.68rem;font-weight:900;color:#38bdf8;letter-spacing:0.6px;padding-right:4px;">${escapeHtmlStr(t('weather_bar_lbl'))}:</span>` +
    ordered.map((c) => {
      const wx = wxMap[c.id] || REMO_WEATHER.getCityLiveStatus(c);
      return `
        <button type="button" class="weather-chip ${wx.isSurge ? 'surge' : ''}" onclick="filterFeedByCityFromMap('${escapeJsSingleArg(c.id)}')" title="${escapeHtmlStr(getCityName(c, lang))} — ${escapeHtmlStr(lang === 'fr' ? wx.cond_fr : wx.cond_en)}">
          <span>${c.flag} <b>${escapeHtmlStr(c.code || getCityName(c, lang))}</b></span>
          <span style="color:#94a3b8;">${wx.timeStr}</span>
          <span>${wx.icon} ${wx.tempC}°C</span>
          ${wx.isSurge ? `<span class="surge-mini-pill">${t('weather_surge_pill')}</span>` : ''}
        </button>
      `;
    }).join('');
  if (typeof initDesktopHorizontalScrollRails === 'function') {
    setTimeout(initDesktopHorizontalScrollRails, 30);
  }
}

let _lastWeatherMinute = -1;
window._announcedUnsealedCapsules = window._announcedUnsealedCapsules || {};
window._adminXrayCapsules = window._adminXrayCapsules || {};

function formatCapsuleCountdown(remMs) {
  const secTotal = Math.max(0, Math.ceil(remMs / 1000));
  const hh = Math.floor(secTotal / 3600);
  const mm = String(Math.floor((secTotal % 3600) / 60)).padStart(2, '0');
  const ss = String(secTotal % 60).padStart(2, '0');
  return hh > 0 ? `${String(hh).padStart(2, '0')}:${mm}:${ss}` : `${mm}:${ss}`;
}

function updateFlashDropCountdownUI() {
  // 1. Live 1-Second Heartbeat for all Time-Capsule Mystery Posts!
  const capsuleTimers = document.querySelectorAll('.tc-countdown[data-unlock-ts]');
  let anyJustUnsealed = false;
  capsuleTimers.forEach((el) => {
    const unlockTs = Number(el.getAttribute('data-unlock-ts') || 0);
    const pid = el.getAttribute('data-post-id') || '';
    const rem = unlockTs - Date.now();
    if (rem > 0) {
      el.textContent = formatCapsuleCountdown(rem);
    } else if (pid && !window._announcedUnsealedCapsules[pid]) {
      window._announcedUnsealedCapsules[pid] = true;
      anyJustUnsealed = true;
      const pObj = (REMO_STORE.state.posts || []).find((x) => x.id === pid);
      const city = getCityById(pObj ? pObj.cityId : 'montreal');
      const langNow = REMO_I18N.getLang();
      spawnRemoCoinsFX(16);
      remoToast(t('capsule_unsealed_toast', { city: getCityName(city, langNow) }), 'fanfare');
    }
  });
  if (anyJustUnsealed) {
    renderSocialFeed();
  }

  // 2. Refresh World Clocks on minute rollover
  const curMin = new Date().getMinutes();
  if (_lastWeatherMinute !== -1 && curMin !== _lastWeatherMinute) {
    renderWorldWeatherTicker();
    syncHeaderAndSidebars();
  }
  _lastWeatherMinute = curMin;

  // 3. 15-Min Super Flash Drop Banner
  const box = document.getElementById('flashDropBannerEl');
  if (!box) return;
  const fd = REMO_STORE.state.settings.flashDrop;
  if (!fd || !fd.active || fd.expiresAt <= Date.now()) {
    box.style.display = 'none';
    return;
  }
  const rem = fd.expiresAt - Date.now();
  const mm = String(Math.floor(rem / 60000)).padStart(2, '0');
  const ss = String(Math.floor((rem % 60000) / 1000)).padStart(2, '0');
  const lang = REMO_I18N.getLang();
  const c = getCityById(fd.cityId || 'montreal');
  box.style.display = 'flex';
  box.innerHTML = `
    <div>
      <div style="font-weight:900;color:#fbbf24;font-size:0.84rem;">${t('flash_drop_active')} (${mm}:${ss})</div>
      <div style="font-size:0.78rem;color:#f8fafc;">${c.flag} ${lang === 'fr' ? fd.spotName_fr : fd.spotName_en} · <b>+${fd.coins} 🪙</b></div>
    </div>
    <button class="btn-cyber btn-gold" onclick="switchRemoView('radar');setTimeout(()=>claimFlashSuperDrop(),350);">⚡ ${t('flash_drop_claim')}</button>
  `;
}

function escapeHtmlStr(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeJsSingleArg(str = '') {
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, '\\x27')
    .replace(/"/g, '\\x22')
    .replace(/</g, '\\x3c')
    .replace(/>/g, '\\x3e')
    .replace(/&/g, '\\x26')
    .replace(/[\r\n]/g, ' ');
}

function sanitizeSafeMediaUrl(url = '') {
  const s = String(url || '').trim();
  if (!s) return '';
  if (/^https?:\/\//i.test(s) || /^data:(?:image|audio|video)\//i.test(s) || /^blob:/i.test(s) || /^idb:\/\//i.test(s) || /^(?:img\/|\.\/|\/(?!\/))/i.test(s)) {
    return escapeHtmlStr(s);
  }
  return '';
}

function escapeSrcDocAttr(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;');
}

function formatDurationMMSS(sec) {
  const s = Math.max(1, Math.min(60, Math.round(Number(sec) || 60)));
  const mm = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

function renderPostPollWidget(p, lang, u) {
  if (!p.poll || !Array.isArray(p.poll.options) || p.poll.options.length < 2) return '';
  const q = lang === 'fr' ? (p.poll.question_fr || p.poll.question_en) : (p.poll.question_en || p.poll.question_fr);
  const totalVotes = Math.max(1, p.poll.options.reduce((acc, o) => acc + (o.votes || 0), 0));
  const voted = u && Array.isArray(p.poll.voters) && p.poll.voters.includes(u.uid);

  return `
    <div class="post-poll-card">
      <div style="font-size:0.79rem;font-weight:900;color:#c7d2fe;">📊 ${escapeHtmlStr(q)}</div>
      ${p.poll.options.map((opt, idx) => {
        const lbl = lang === 'fr' ? (opt.label_fr || opt.label_en) : (opt.label_en || opt.label_fr);
        const pct = Math.round(((opt.votes || 0) / totalVotes) * 100);
        return `
          <button type="button" class="poll-opt-btn" onclick="voteOnPostPoll('${p.id}', ${idx})">
            <div class="poll-opt-fill" style="width:${pct}%;"></div>
            <span>${escapeHtmlStr(lbl)}</span>
            <span style="color:#fbbf24;font-weight:900;">${pct}% (${opt.votes || 0})</span>
          </button>
        `;
      }).join('')}
      <div style="font-size:0.68rem;color:var(--muted);">${voted ? '✓' : '🪙 +5'} · ${p.poll.options.reduce((a, o) => a + (o.votes || 0), 0)} votes</div>
    </div>
  `;
}

const BA_LOOK_CRITERIA = [
  { key: 'style', i18n: 'ba_crit_style' },
  { key: 'vibe', i18n: 'ba_crit_vibe' },
  { key: 'icon', i18n: 'ba_crit_icon' }
];

function renderLookRatingWidget(p, lang, u) {
  if (p.mediaType !== 'before_after') return '';
  if (p.lookRating && p.lookRating.enabled === false) return '';
  const lr = p.lookRating || {};
  const voters = lr.voters && typeof lr.voters === 'object' ? lr.voters : {};
  const myVotes = (u && voters[u.uid]) ? voters[u.uid] : {};
  const totalVoters = Object.keys(voters).length;
  const cityTag = escapeJsSingleArg(`#GlowUp #${p.cityId || 'world'}`);

  return `
    <div class="ba-look-rating-card">
      <div class="ba-look-hdr">
        <span class="ba-look-title">${escapeHtmlStr(t('ba_rating_title'))}</span>
        <span class="ba-look-total">${escapeHtmlStr(t('ba_votes_count', { n: totalVoters }))}${totalVoters === 0 ? ' · +5 🪙' : ''}</span>
      </div>
      ${BA_LOOK_CRITERIA.map((c) => {
        const bucket = lr[c.key] || { sum: 0, count: 0 };
        const cnt = Number(bucket.count) || 0;
        const avg10 = cnt > 0 ? ((Number(bucket.sum) || 0) / cnt) * 2 : 0;
        const fillPct = Math.round((avg10 / 10) * 100);
        const myScore = Number(myVotes[c.key]) || 0;
        return `
          <div class="ba-crit-row">
            <div class="ba-crit-top">
              <span>${escapeHtmlStr(t(c.i18n))}</span>
              <span class="ba-crit-score">${cnt > 0 ? `${avg10.toFixed(1)}/10` : '—/10'}</span>
            </div>
            <div class="ba-crit-controls">
              <div class="ba-crit-bar-track"><div class="ba-crit-bar-fill" style="width:${fillPct}%;"></div></div>
              <div class="ba-stars-row">
                ${[1, 2, 3, 4, 5].map((st) => `<button type="button" class="ba-star-btn ${myScore === st ? 'active' : ''}" onclick="rateBeforeAfterLook('${escapeJsSingleArg(p.id)}', '${c.key}', ${st})">${st}★</button>`).join('')}
              </div>
            </div>
          </div>
        `;
      }).join('')}
      <button type="button" class="btn-cyber ba-chain-btn" onclick="openCreateBeforeAfterModal('${cityTag}')">${escapeHtmlStr(t('ba_post_mine_btn'))}</button>
    </div>
  `;
}

function renderSecretCapsuleWidget(p, lang, u) {
  if (!p.secretCapsule) return '';
  const sc = p.secretCapsule;
  const unlockedList = sc.unlockedBy || [];
  const isOwner = u && u.uid === p.uid;
  const isUnlocked = isOwner || (u && unlockedList.includes(u.uid));
  const sameCity = u && u.homeCity === p.cityId;
  const cost = sc.cost || 15;

  if (isUnlocked) {
    const secretTxt = lang === 'fr' ? (sc.text_fr || sc.text_en) : (sc.text_en || sc.text_fr);
    return `
      <div class="secret-capsule-card" style="border-style:solid;border-color:#10b981;background:rgba(16,185,129,0.12);">
        <div style="font-weight:900;color:#34d399;font-size:0.74rem;margin-bottom:3px;">🔓 ${t('secret_locked_title')}</div>
        <div style="color:#f8fafc;line-height:1.4;">${escapeHtmlStr(secretTxt)}</div>
      </div>
    `;
  }

  return `
    <div class="secret-capsule-card">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;">
        <span style="font-weight:800;color:#fbbf24;">${t('secret_locked_title')}</span>
        ${sameCity
          ? `<button type="button" class="btn-cyber" style="padding:5px 11px;font-size:0.72rem;background:#10b981;" onclick="unlockSecretCapsule('${p.id}', true)">${t('secret_unlock_city_btn')}</button>`
          : `<button type="button" class="btn-cyber btn-gold" style="padding:5px 11px;font-size:0.72rem;" onclick="unlockSecretCapsule('${p.id}', false)">${t('secret_unlock_coin_btn', { cost })}</button>`}
      </div>
    </div>
  `;
}

function isPostCapsuleSealed(p) {
  return Boolean(p && p.unlockAt && Number(p.unlockAt) > Date.now());
}

function isAdminXrayOpen(postId) {
  return Boolean(REMO_STORE.isAdminUnlocked() && window._adminXrayCapsules && window._adminXrayCapsules[postId]);
}

function renderInteractiveBeforeAfterBox({
  url1,
  url2,
  key1 = '',
  key2 = '',
  flt1 = 'flt-none',
  flt2 = 'flt-none',
  lbl1 = 'BEFORE',
  lbl2 = 'AFTER',
  isLightbox = false
}) {
  const idb1 = key1 && String(key1).startsWith('idb://') ? `data-idb-src="${key1}"` : '';
  const idb2 = key2 && String(key2).startsWith('idb://') ? `data-idb-src="${key2}"` : '';
  return `
    <div class="ba-slider-box">
      <img src="${sanitizeSafeMediaUrl(url1)}" ${idb1} class="${escapeHtmlStr(flt1 || 'flt-none')}" loading="lazy" decoding="async" alt="${escapeHtmlStr(lbl1)}">
      <div class="ba-after-layer">
        <img src="${sanitizeSafeMediaUrl(url2)}" ${idb2} class="${escapeHtmlStr(flt2 || 'flt-none')}" loading="lazy" decoding="async" alt="${escapeHtmlStr(lbl2)}">
      </div>
      <span class="ba-corner-badge ba-badge-before">${escapeHtmlStr(lbl1)}</span>
      <span class="ba-corner-badge ba-badge-after">${escapeHtmlStr(lbl2)}</span>
      <button type="button" class="ba-autoslide-btn" onclick="event.stopPropagation();toggleBeforeAfterAutoSlide(this)">${escapeHtmlStr(t('ba_autoslide_btn'))}</button>
      <div class="ba-divider-line"><div class="ba-knob">◀ ▶</div></div>
      <input type="range" min="3" max="97" value="50" class="ba-range-input" onpointerdown="stopBeforeAfterAutoSlide(this)" oninput="updateBeforeAfterSlider(this)" onclick="event.stopPropagation()" aria-label="${isLightbox ? 'Fullscreen comparison slider' : 'Before and After slider'}">
    </div>
  `;
}

function renderSinglePaneMedia(item, cityObj, lang) {
  if (item.mediaType === 'text_card' && item.textCard && typeof renderPostTextCardStage === 'function') {
    return renderPostTextCardStage(item, cityObj, lang, { compact: true });
  }
  const flt = item.photoFilter || 'flt-none';
  if (item.mediaType === 'html_app' && item.htmlCode) {
    return `<iframe sandbox="allow-scripts" loading="lazy" data-post-id="${escapeHtmlStr(item.id || '')}" srcdoc="${escapeSrcDocAttr(item.htmlCode)}"></iframe>`;
  }
  if (item.mediaType === 'video' && item.mediaUrl) {
    const rawK = item.mediaUrl;
    const res = RemoMediaDB.resolveSyncOrPlaceholder(rawK);
    const idbA = String(rawK).startsWith('idb://') ? `data-idb-src="${rawK}"` : '';
    return `<video src="${res}" ${idbA} autoplay playsinline loop muted></video>`;
  }
  let src = item.mediaUrl || (Array.isArray(item.mediaUrls) && item.mediaUrls[0]) || '';
  let idbTag = '';
  if (src && String(src).startsWith('idb://')) {
    idbTag = `data-idb-src="${src}"`;
    src = RemoMediaDB.resolveSyncOrPlaceholder(src);
  } else if (!src) {
    if (!item._cachedArt) {
      item._cachedArt = resolveCityFallbackArtUrl(cityObj.id, item.visualHeadline, item.visualSub);
    }
    src = item._cachedArt;
  }
  return `<img src="${sanitizeSafeMediaUrl(src)}" ${idbTag} class="${flt}" loading="lazy" decoding="async" alt="${escapeHtmlStr(getCityName(cityObj, lang))}">`;
}

const _sessionUnboxedBoxes = new Set();
const _sessionBoxTaps = {};

function isPostMysteryBoxLocked(p, u) {
  if (!p || !p.mysteryBox || !p.mysteryBox.enabled) return false;
  if (isPostCapsuleSealed(p)) return false;
  if (isAdminXrayOpen(p.id)) return false;
  if (_sessionUnboxedBoxes.has(p.id)) return false;
  const unboxedBy = Array.isArray(p.mysteryBox.unboxedBy) ? p.mysteryBox.unboxedBy : [];
  if (u && u.uid && unboxedBy.includes(u.uid)) return false;
  return true;
}

function _renderMysteryBoxOverlay(p, innerHtml, lang) {
  const mb = p.mysteryBox || {};
  const u = REMO_STORE.getCurrentUser();
  const theme = mb.theme || 'silver';
  const teaserRaw = lang === 'fr'
    ? (mb.teaser_fr || mb.teaser_en || '')
    : (mb.teaser_en || mb.teaser_fr || '');
  const teaserTxt = teaserRaw || t('mbox_default_teaser', { name: p.authorName || 'Citizen' });
  const taps = _sessionBoxTaps[p.id] || 0;
  const opts = Array.isArray(mb.guessOptions) ? mb.guessOptions : [];
  const voterKey = (u && u.uid) ? u.uid : (localStorage.getItem('remo_guest_vid') || 'guest');
  const myGuess = (mb.guessVoters && mb.guessVoters[voterKey] !== undefined) ? mb.guessVoters[voterKey] : -1;
  const themeIcon = theme === 'gold' ? '👑' : theme === 'neon' ? '⚡' : theme === 'gift' ? '🎁' : '📦';

  return `
    <div class="mbox-overlay-stage" id="mbox_stage_${p.id}" ondblclick="event.stopPropagation()" ontouchstart="event.stopPropagation()">
      <div class="mbox-under-blur">${innerHtml}</div>
      <canvas class="mbox-scratch-canvas" data-mbox-post="${p.id}" data-mbox-theme="${escapeHtmlStr(theme)}"></canvas>
      <div class="mbox-center-emblem">
        <div class="mbox-box-emoji">${themeIcon}</div>
        <div class="mbox-teaser-pill">🔒 ${escapeHtmlStr(teaserTxt)}</div>
        <div class="mbox-sub-hint">${escapeHtmlStr(t('mbox_scratch_hint'))}</div>
        ${opts.length >= 2 ? `
          <div class="mbox-guess-box" onclick="event.stopPropagation()">
            ${mb.guessQuestion ? `<div class="mbox-guess-q">🔮 ${escapeHtmlStr(mb.guessQuestion)}</div>` : ''}
            <div class="mbox-guess-opts">
              ${opts.map((o, idx) => `<button type="button" class="mbox-guess-btn ${myGuess === idx ? 'voted' : ''}" onclick="voteMysteryBoxGuess('${escapeJsSingleArg(p.id)}', ${idx}, event)">${escapeHtmlStr(o.label)} (${o.votes || 0})</button>`).join('')}
            </div>
          </div>
        ` : ''}
        <button type="button" class="mbox-tap-btn" onclick="tapMysteryBoxPost('${escapeJsSingleArg(p.id)}', event)">${escapeHtmlStr(t('mbox_tap_btn', { n: taps }))}</button>
      </div>
    </div>
  `;
}

function voteMysteryBoxGuess(postId, optIdx, ev) {
  if (ev) ev.stopPropagation();
  const p = findFeedPostById(postId);
  if (!p || !p.mysteryBox || !Array.isArray(p.mysteryBox.guessOptions) || !p.mysteryBox.guessOptions[optIdx]) return;
  const u = REMO_STORE.getCurrentUser();
  const voterKey = (u && u.uid) ? u.uid : (localStorage.getItem('remo_guest_vid') || 'guest');
  if (!p.mysteryBox.guessVoters || typeof p.mysteryBox.guessVoters !== 'object') {
    p.mysteryBox.guessVoters = {};
  }
  const prevIdx = p.mysteryBox.guessVoters[voterKey];
  if (prevIdx !== undefined && p.mysteryBox.guessOptions[prevIdx]) {
    p.mysteryBox.guessOptions[prevIdx].votes = Math.max(0, (p.mysteryBox.guessOptions[prevIdx].votes || 0) - 1);
  }
  p.mysteryBox.guessVoters[voterKey] = optIdx;
  p.mysteryBox.guessOptions[optIdx].votes = (p.mysteryBox.guessOptions[optIdx].votes || 0) + 1;
  REMO_STORE.syncPostToCloud(p);
  REMO_STORE.save(true, 'mbox_guess');
  if (typeof RemoAudio !== 'undefined' && RemoAudio.play) RemoAudio.play('click');
  remoToast(t('mbox_guess_saved_toast'));
  rerenderSinglePostCard(p.id);
}

function tapMysteryBoxPost(postId, ev) {
  if (ev) ev.stopPropagation();
  const next = (_sessionBoxTaps[postId] || 0) + 1;
  _sessionBoxTaps[postId] = next;
  if (typeof RemoAudio !== 'undefined' && RemoAudio.play) RemoAudio.play('click');
  const stage = document.getElementById('mbox_stage_' + postId);
  if (stage) {
    stage.classList.remove('cracking');
    void stage.offsetWidth;
    stage.classList.add('cracking');
    const btn = stage.querySelector('.mbox-tap-btn');
    if (btn) btn.textContent = t('mbox_tap_btn', { n: Math.min(3, next) });
  }
  if (next >= 3) {
    unlockMysteryBoxPost(postId, 'tap');
  }
}

function unlockMysteryBoxPost(postId, reason = 'scratch') {
  const p = findFeedPostById(postId);
  if (!p || !p.mysteryBox) return;
  if (_sessionUnboxedBoxes.has(postId)) return;
  _sessionUnboxedBoxes.add(postId);
  delete _sessionBoxTaps[postId];

  const u = REMO_STORE.getCurrentUser();
  p.mysteryBox.unboxedBy = Array.isArray(p.mysteryBox.unboxedBy) ? p.mysteryBox.unboxedBy : [];
  const uidKey = u?.uid || ('guest_' + (localStorage.getItem('remo_guest_vid') || 'visitor'));
  const isOwner = Boolean(u && p.uid && u.uid === p.uid);
  const firstViewerUnbox = !p.mysteryBox.unboxedBy.includes(uidKey);
  if (firstViewerUnbox) {
    p.mysteryBox.unboxedBy.push(uidKey);
    if (!isOwner && p.uid) {
      REMO_STORE.addCoins(p.uid, 2, 2);
    }
  }

  let gotDailyBonus = false;
  if (u && !isOwner && u.homeCity !== p.cityId) {
    const todayStr = new Date().toISOString().slice(0, 10);
    const bonusKey = `remo_mbox_bonus_day_${u.uid}`;
    if (localStorage.getItem(bonusKey) !== todayStr) {
      localStorage.setItem(bonusKey, todayStr);
      REMO_STORE.addCoins(u.uid, 5, 5);
      gotDailyBonus = true;
    }
  }

  if (typeof spawnRemoCoinsFX === 'function') spawnRemoCoinsFX(gotDailyBonus ? 8 : 4);
  if (typeof RemoAudio !== 'undefined' && RemoAudio.play) RemoAudio.play('fanfare');
  remoToast(
    gotDailyBonus
      ? t('mbox_unboxed_bonus_toast')
      : t('mbox_unboxed_toast', { n: p.mysteryBox.unboxedBy.length }),
    gotDailyBonus ? 'coin' : 'fanfare'
  );
  REMO_STORE.syncPostToCloud(p);
  REMO_STORE.save(true, 'mbox_unbox');
  rerenderSinglePostCard(p.id);
  syncHeaderAndSidebars();
}

function _initSingleMysteryBoxCanvas(canvas) {
  if (!canvas || canvas._mboxReady) return;
  canvas._mboxReady = true;
  const postId = canvas.getAttribute('data-mbox-post');
  const theme = canvas.getAttribute('data-mbox-theme') || 'silver';
  const rect = canvas.getBoundingClientRect();
  const w = Math.max(260, Math.round(rect.width || 320));
  const h = Math.max(260, Math.round(rect.height || 300));
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const grad = ctx.createLinearGradient(0, 0, w, h);
  if (theme === 'gold') {
    grad.addColorStop(0, '#fde047');
    grad.addColorStop(0.5, '#d97706');
    grad.addColorStop(1, '#78350f');
  } else if (theme === 'neon') {
    grad.addColorStop(0, '#0ea5e9');
    grad.addColorStop(0.5, '#9333ea');
    grad.addColorStop(1, '#ec4899');
  } else if (theme === 'gift') {
    grad.addColorStop(0, '#f43f5e');
    grad.addColorStop(0.5, '#be123c');
    grad.addColorStop(1, '#4c0519');
  } else {
    grad.addColorStop(0, '#cbd5e1');
    grad.addColorStop(0.5, '#64748b');
    grad.addColorStop(1, '#1e293b');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Foil crosshatch sheen lines
  ctx.strokeStyle = 'rgba(255,255,255,0.16)';
  ctx.lineWidth = 2;
  for (let i = -h; i < w + h; i += 22) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + h * 0.45, h);
    ctx.stroke();
  }

  const COLS = 12;
  const ROWS = 10;
  const clearedCells = new Set();
  let scratching = false;

  const scratchAt = (clientX, clientY) => {
    const r = canvas.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const x = ((clientX - r.left) / r.width) * w;
    const y = ((clientY - r.top) / r.height) * h;
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, Math.max(20, w * 0.085), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    const gx = Math.min(COLS - 1, Math.max(0, Math.floor((x / w) * COLS)));
    const gy = Math.min(ROWS - 1, Math.max(0, Math.floor((y / h) * ROWS)));
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const cx = gx + dx;
        const cy = gy + dy;
        if (cx >= 0 && cx < COLS && cy >= 0 && cy < ROWS) {
          clearedCells.add(`${cx}:${cy}`);
        }
      }
    }
    if (clearedCells.size >= Math.ceil(COLS * ROWS * 0.42)) {
      unlockMysteryBoxPost(postId, 'scratch');
    }
  };

  canvas.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    scratching = true;
    canvas.style.touchAction = 'none';
    scratchAt(e.clientX, e.clientY);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!scratching) return;
    e.stopPropagation();
    scratchAt(e.clientX, e.clientY);
  });
  const endScratch = () => {
    scratching = false;
    canvas.style.touchAction = 'pan-y';
  };
  canvas.addEventListener('pointerup', endScratch);
  canvas.addEventListener('pointercancel', endScratch);
}

function initAllMysteryBoxCanvases(rootEl = document) {
  const scope = rootEl || document;
  scope.querySelectorAll('.mbox-scratch-canvas[data-mbox-post]').forEach((cv) => {
    _initSingleMysteryBoxCanvas(cv);
  });
}

window.tapMysteryBoxPost = tapMysteryBoxPost;
window.voteMysteryBoxGuess = voteMysteryBoxGuess;
window.unlockMysteryBoxPost = unlockMysteryBoxPost;
window.initAllMysteryBoxCanvases = initAllMysteryBoxCanvases;

function renderPostMediaStage(p, city, lang) {
  if (isPostCapsuleSealed(p) && !isAdminXrayOpen(p.id)) {
    return _renderPostMediaStageInner(p, city, lang);
  }
  const innerHtml = _renderPostMediaStageInner(p, city, lang);
  if (isPostMysteryBoxLocked(p, REMO_STORE.getCurrentUser())) {
    return _renderMysteryBoxOverlay(p, innerHtml, lang);
  }
  return innerHtml;
}

function _renderPostMediaStageInner(p, city, lang) {
  const flt = p.photoFilter || 'flt-none';

  // 0. ⏳ SEALED 4D TIME-CAPSULE MYSTERY VAULT (Unless Admin X-Ray Preview is toggled ON)
  if (isPostCapsuleSealed(p) && !isAdminXrayOpen(p.id)) {
    const u = REMO_STORE.getCurrentUser();
    const isAdm = REMO_STORE.isAdminUnlocked();
    const watchers = Array.isArray(p.capsuleWatchers) ? p.capsuleWatchers : [];
    const isWatching = Boolean(u && watchers.includes(u.uid));
    const teaser = lang === 'fr'
      ? (p.capsuleTeaser_fr || p.capsuleTeaser_en || 'Surprise mystère bientôt révélée...')
      : (p.capsuleTeaser_en || p.capsuleTeaser_fr || 'Mystery surprise dropping soon...');
    const fmtHint = p.mediaType === 'html_app'
      ? '💻 LIVE HTML APP'
      : p.mediaType === 'video'
        ? '🎬 60s HD VIDEO'
        : '📷 VISUAL DROP';

    return `
      <div class="time-capsule-vault">
        <div class="tc-holo-ring"></div>
        <div class="tc-vault-icon">⏳</div>
        <div class="tc-sub-lbl">${t('capsule_opens_in')} · ${fmtHint}</div>
        <div class="tc-countdown" data-unlock-ts="${Number(p.unlockAt)}" data-post-id="${p.id}">${formatCapsuleCountdown(Number(p.unlockAt) - Date.now())}</div>
        <div class="tc-teaser-text">🔒 ${escapeHtmlStr(teaser)}</div>
        <div style="font-size:0.74rem;color:#fda4af;font-weight:800;position:relative;z-index:2;">
          ${t('capsule_watchers', { n: watchers.length })}
        </div>
        <div class="tc-actions-row">
          <button type="button" class="tc-notify-btn ${isWatching ? 'watching' : ''}" onclick="toggleWatchTimeCapsule('${p.id}')">
            ${isWatching ? t('capsule_notified_btn') : t('capsule_notify_btn')}
          </button>
          ${isAdm ? `
            <button type="button" class="adm-pbtn gold" onclick="adminUnsealCapsuleNow('${p.id}')">${t('capsule_adm_unseal')}</button>
            <button type="button" class="adm-pbtn" onclick="adminToggleCapsuleXray('${p.id}')">${t('capsule_adm_xray')}</button>
          ` : ''}
        </div>
      </div>
    `;
  }

  // 0A. ⚔️ CITY VERSUS DUEL (HEAD-TO-HEAD BATTLE)
  if (p.mediaType === 'city_versus' && p.versus) {
    return renderCityVersusDuelStage(p, lang);
  }

  // 0B. 🎭 SPLIT-SCREEN CITY DUET STAGE (50/50 Two World Cities Live Collab!)
  if (p.duetOf && p.duetOf.cityId) {
    const leftCity = getCityById(p.duetOf.cityId);
    const leftWx = REMO_WEATHER.getCityLiveStatus(leftCity);
    const rightWx = REMO_WEATHER.getCityLiveStatus(city);
    const duetKm = (typeof computeHaversineKm === 'function' && leftCity.lat != null && city.lat != null)
      ? Math.round(computeHaversineKm(leftCity.lat, leftCity.lng, city.lat, city.lng))
      : 0;
    const ribbonTxt = duetKm > 0
      ? `${leftCity.flag} ${leftWx.timeStr} ${escapeHtmlStr(leftCity.code)} ⇄ ${city.flag} ${rightWx.timeStr} ${escapeHtmlStr(city.code)} · ${duetKm.toLocaleString()} km`
      : `${leftCity.flag} ${leftWx.timeStr} ${escapeHtmlStr(leftCity.code)} ⇄ ${city.flag} ${rightWx.timeStr} ${escapeHtmlStr(city.code)}`;
    return `
      <div class="city-duet-stage" style="position:relative;">
        <div class="duet-pane">
          ${renderSinglePaneMedia(p.duetOf, leftCity, lang)}
          <div class="duet-city-pill left">${leftCity.flag} ${escapeHtmlStr(leftCity.code)} ${leftWx.timeStr} · @${escapeHtmlStr(p.duetOf.authorName || 'Creator')}</div>
        </div>
        <div class="duet-bolt-divider"><div class="duet-bolt-icon">⚡</div></div>
        <div class="duet-pane">
          ${renderSinglePaneMedia(p, city, lang)}
          <div class="duet-city-pill right">${city.flag} ${escapeHtmlStr(city.code)} ${rightWx.timeStr} · @${escapeHtmlStr(p.authorName || 'Creator')}</div>
        </div>
        <div class="duet-distance-ribbon">🌍 ${ribbonTxt}</div>
      </div>
    `;
  }

  // 0. 🧭 REMO ODYSSEY 1v1 FEED CHALLENGE CARD
  if (p.odysseyChallenge && typeof p.odysseyChallenge === 'object') {
    const oc = p.odysseyChallenge;
    const ocCity = getCityById(oc.startCityId || p.cityId || 'montreal');
    const bgImg = `img/cities/${escapeHtmlStr(ocCity ? ocCity.id : 'montreal')}.jpg`;
    const routeTxt = Array.isArray(oc.routeIds) && oc.routeIds.length
      ? oc.routeIds.slice(0, 6).map((cid) => {
          const rc = getCityById(cid);
          return rc ? `${rc.flag} ${rc.code}` : cid.toUpperCase();
        }).join(' ➔ ')
      : `${ocCity ? ocCity.flag : '🌍'} ${ocCity ? ocCity.code : 'REMO'}`;
    const targetScore = Number(oc.score || 0);
    const seedArg = escapeJsSingleArg(String(oc.seed || 'REMO2026'));
    const startArg = escapeJsSingleArg(String(oc.startCityId || p.cityId || 'montreal'));
    const vsArg = escapeJsSingleArg(String(oc.playerName || p.authorName || 'Citizen'));
    return `
      <div class="odyssey-feed-challenge-card">
        <img class="odyssey-feed-challenge-bg" src="${bgImg}" alt="REMO Odyssey Challenge" loading="lazy">
        <div class="odyssey-feed-challenge-overlay">
          <span class="odyssey-feed-challenge-pill">${escapeHtmlStr(t('odyssey_challenge_badge'))}</span>
          <div class="odyssey-feed-challenge-score">${targetScore.toLocaleString()} PTS</div>
          <div class="odyssey-feed-challenge-meta">${escapeHtmlStr(t('odyssey_challenge_target', {
            score: targetScore.toLocaleString(),
            cities: Number(oc.citiesCount || 1),
            km: Number(oc.kmFlown || 0).toLocaleString()
          }))}</div>
          <div style="font-size:0.74rem;color:#7dd3fc;font-weight:800;">${escapeHtmlStr(routeTxt)}</div>
          <button type="button" class="odyssey-feed-challenge-cta" onclick="event.stopPropagation();openRemoOdysseyModal({seed:'${seedArg}',start:'${startArg}',target:${targetScore},vs:'${vsArg}'})">
            ${escapeHtmlStr(t('odyssey_challenge_play_btn'))}
          </button>
        </div>
      </div>
    `;
  }

  // 1. LIVE INTERACTIVE HTML / 3D MINI-APP
  if (p.mediaType === 'html_app' && p.htmlCode) {
    const cleanCode = buildFittedHtmlSrcdoc(p.htmlCode, p.id);
    return `
      <iframe class="html-post-frame" id="htmlFrame_${escapeHtmlStr(p.id)}" data-post-id="${escapeHtmlStr(p.id)}" sandbox="allow-scripts" loading="lazy" scrolling="no" srcdoc="${escapeSrcDocAttr(cleanCode)}" style="width:100%;height:100%;border:none;border-radius:12px;background:#050816;overflow:hidden;"></iframe>
    `;
  }

  // 1B. EXTERNAL VIDEO / WEB LINK (YouTube, Shorts, Vimeo, Direct MP4/WebM, TikTok, IG, or Web Link — No Time Limit)
  if (p.mediaType === 'video_link' || p.externalUrl) {
    const extRaw = p.externalUrl || p.mediaUrl || '';
    const capTxt = lang === 'fr' ? (p.caption_fr || p.caption_en || '') : (p.caption_en || p.caption_fr || '');
    return renderExternalVideoOrLinkStage(extRaw, city, lang, capTxt);
  }

  // 2. 60-SECOND HD VIDEO
  if (p.mediaType === 'video') {
    const rawKey = p.mediaUrl || '';
    let resolved = '';
    if (rawKey.startsWith('http') || rawKey.startsWith('data:') || rawKey.startsWith('blob:')) {
      resolved = rawKey;
    } else {
      resolved = RemoMediaDB.resolveSyncOrPlaceholder(rawKey);
    }
    const idbAttr = String(rawKey).startsWith('idb://') ? `data-idb-src="${rawKey}"` : '';
    const cap60Attr = p.enforce60sCap ? `ontimeupdate="if(this.currentTime>60){this.currentTime=0;}"` : '';
    
    if (!resolved && String(rawKey).startsWith('idb://')) {
      return `
        <div style="background:#090d1e;border:1px dashed rgba(244,63,94,0.4);border-radius:12px;padding:26px 14px;text-align:center;">
          <div style="font-size:1.8rem;margin-bottom:6px;">📹</div>
          <div style="font-size:0.84rem;color:#f43f5e;font-weight:700;">${lang === 'fr' ? 'Vidéo locale non disponible sur cet appareil' : 'Local device video'}</div>
          <div style="font-size:0.75rem;color:var(--muted);margin-top:4px;">${lang === 'fr' ? 'Cette ancienne vidéo a été enregistrée avant l’activation du Cloud Storage.' : 'Legacy video before Cloud Storage.'}</div>
          ${isAdm ? `<button type="button" class="adm-pbtn danger" style="margin-top:10px;padding:6px 14px;font-size:0.8rem;" onclick="adminDeletePostInline('${escapeJsSingleArg(p.id)}')">🗑️ Supprimer définitivement</button>` : ''}
        </div>
      `;
    }
    return `<video src="${sanitizeSafeMediaUrl(resolved)}" ${idbAttr} ${cap60Attr} controls playsinline preload="metadata" style="width:100%;max-height:480px;border-radius:12px;background:#050816;object-fit:cover;"></video>`;
  }

  // 3. INTERACTIVE BEFORE / AFTER 2-PHOTO COMPARISON SLIDER
  if (p.mediaType === 'before_after' && Array.isArray(p.mediaUrls) && p.mediaUrls.length >= 2) {
    const k1 = p.mediaUrls[0], k2 = p.mediaUrls[1];
    const u1 = RemoMediaDB.resolveSyncOrPlaceholder(k1);
    const u2 = RemoMediaDB.resolveSyncOrPlaceholder(k2);
    return renderInteractiveBeforeAfterBox({
      url1: u1,
      url2: u2,
      key1: k1,
      key2: k2,
      flt1: p.beforeFilter || flt,
      flt2: p.afterFilter || flt,
      lbl1: p.beforeLabel || t('ba_badge_before'),
      lbl2: p.afterLabel || t('ba_badge_after')
    });
  }

  // 4. MULTI-PHOTO CAROUSEL (2–4 PHOTOS)
  if (p.mediaType === 'carousel' && Array.isArray(p.mediaUrls) && p.mediaUrls.length > 1) {
    const idx = (_carouselState[p.id] || 0) % p.mediaUrls.length;
    const curKey = p.mediaUrls[idx];
    let curUrl = RemoMediaDB.resolveSyncOrPlaceholder(curKey);
    if (!curUrl || curUrl.startsWith('idb://')) {
      curUrl = (curKey && (curKey.startsWith('data:') || curKey.startsWith('http')))
        ? curKey
        : (p._cachedArt || resolveCityFallbackArtUrl(city.id, p.visualHeadline, p.visualSub));
    }
    return `
      <div style="position:relative;width:100%;height:100%;touch-action:pan-y;" ontouchstart="initCarouselTouchSwipe(this, '${escapeJsSingleArg(p.id)}')">
        <img src="${sanitizeSafeMediaUrl(curUrl)}" class="carousel-slide-img ${flt}" loading="lazy" decoding="async" alt="${escapeHtmlStr(getCityName(city, lang))}" style="width:100%;height:100%;object-fit:cover;transition:opacity 0.2s ease;">
        <button type="button" class="carousel-nav-btn prev" onclick="stepPostCarousel('${escapeJsSingleArg(p.id)}', -1, event)" title="Précédent">‹</button>
        <button type="button" class="carousel-nav-btn next" onclick="stepPostCarousel('${escapeJsSingleArg(p.id)}', 1, event)" title="Suivant">›</button>
        <div class="carousel-dots">
          ${p.mediaUrls.map((_, i) => `<span class="carousel-dot ${i === idx ? 'active' : ''}" onclick="setPostCarouselIndex('${escapeJsSingleArg(p.id)}', ${i}, event)"></span>`).join('')}
        </div>
        <div class="carousel-count-pill" style="position:absolute;top:10px;right:10px;background:rgba(6,10,24,0.78);backdrop-filter:blur(6px);color:#fff;font-size:0.72rem;font-weight:900;padding:3px 9px;border-radius:99px;border:1px solid rgba(255,255,255,0.22);pointer-events:none;z-index:6;">
          🎠 ${idx + 1}/${p.mediaUrls.length}
        </div>
      </div>
    `;
  }

  // 4B. COLORED PAGINATED TEXT CARD (Proverbs, Wishes, Quotes, Stories)
  if (p.mediaType === 'text_card' && p.textCard) {
    return renderPostTextCardStage(p, city, lang);
  }

  // 5. SINGLE PHOTO OR PROCEDURAL CITY POSTER
  let mediaSrc = p.mediaUrl || (Array.isArray(p.mediaUrls) && p.mediaUrls[0]) || '';
  let idbTag = '';
  if (mediaSrc && String(mediaSrc).startsWith('idb://')) {
    idbTag = `data-idb-src="${mediaSrc}"`;
    const resolved = RemoMediaDB.resolveSyncOrPlaceholder(mediaSrc);
    if (resolved && !resolved.startsWith('idb://')) {
      mediaSrc = resolved;
    } else {
      mediaSrc = '';
    }
  }
  if (!mediaSrc || mediaSrc.startsWith('idb://')) {
    if (!p._cachedArt) {
      p._cachedArt = resolveCityFallbackArtUrl(city.id, p.visualHeadline, p.visualSub);
    }
    mediaSrc = p._cachedArt;
  }
  return `<img src="${sanitizeSafeMediaUrl(mediaSrc)}" ${idbTag} class="${flt}" loading="lazy" decoding="async" alt="${escapeHtmlStr(getCityName(city, lang))}" style="width:100%;height:100%;object-fit:cover;">`;
}

function renderViralGoalWidget(p, lang, isAdm) {
  if (!p.viralGoal || !p.viralGoal.targetLikes) return '';
  const curLikes = (p.likes || []).length;
  const target = Number(p.viralGoal.targetLikes) || 5;
  const reached = curLikes >= target || isAdm;
  const secretTxt = lang === 'fr' ? (p.viralGoal.text_fr || p.viralGoal.text_en) : (p.viralGoal.text_en || p.viralGoal.text_fr);

  if (reached) {
    return `
      <div class="secret-capsule-card" style="border-style:solid;border-color:#f59e0b;background:rgba(245,158,11,0.14);">
        <div style="font-weight:900;color:#fbbf24;font-size:0.74rem;margin-bottom:3px;">${t('viral_goal_unlocked')} ${isAdm && curLikes < target ? '(👑 Admin Preview)' : ''}</div>
        <div style="color:#fff;font-weight:700;">${escapeHtmlStr(secretTxt)}</div>
      </div>
    `;
  }

  const pct = Math.min(100, Math.round((curLikes / target) * 100));
  return `
    <div class="secret-capsule-card" style="border-color:rgba(244,63,94,0.6);">
      <div style="font-weight:800;color:#fda4af;font-size:0.76rem;margin-bottom:5px;">
        ${t('viral_goal_locked', { cur: curLikes, target })}
      </div>
      <div class="video60-progress-bar"><div class="video60-progress-fill" style="width:${pct}%;"></div></div>
    </div>
  `;
}

function renderAdminPostBar(p) {
  if (!REMO_STORE.isAdminUnlocked()) return '';
  const sealed = isPostCapsuleSealed(p);
  const pidShort = (p.id || '').slice(-6);
  return `
    <details class="admin-post-bar-wrap">
      <summary class="admin-post-bar-trigger">
        <span>🛡️ Admin Tools (#${escapeHtmlStr(pidShort)})</span>
        <span class="adm-trigger-arrow">▾</span>
      </summary>
      <div class="admin-post-bar">
        <button type="button" class="adm-pbtn danger" onclick="adminDeletePostInline('${escapeJsSingleArg(p.id)}')">${t('adm_bar_delete')}</button>
        <button type="button" class="adm-pbtn gold" onclick="adminPinPostInline('${escapeJsSingleArg(p.id)}')">${p.pinned ? t('adm_bar_unpin') : t('adm_bar_pin')}</button>
        ${sealed ? `<button type="button" class="adm-pbtn gold" onclick="adminUnsealCapsuleNow('${escapeJsSingleArg(p.id)}')">${t('capsule_adm_unseal')}</button>` : ''}
        ${sealed ? `<button type="button" class="adm-pbtn" onclick="adminToggleCapsuleXray('${escapeJsSingleArg(p.id)}')">${t('capsule_adm_xray')}</button>` : ''}
        <button type="button" class="adm-pbtn gold" onclick="adminAwardFounderCrown('${escapeJsSingleArg(p.id)}')">${t('adm_bar_award')}</button>
        <button type="button" class="adm-pbtn" onclick="openAdminQuickModal('${escapeJsSingleArg(p.uid || '')}')">${t('adm_bar_coins')}</button>
        <button type="button" class="adm-pbtn" onclick="adminEditPostInline('${escapeJsSingleArg(p.id)}')">${t('adm_bar_edit')}</button>
      </div>
    </details>
  `;
}

function getInterCityDistanceBridge(postCity, lang) {
  if (!postCity) return '';
  const u = REMO_STORE.getCurrentUser();
  const viewerCity = getCityById((u && u.homeCity) ? u.homeCity : 'montreal') || getCityById('montreal');
  if (!viewerCity) return '';

  // In same city, omit redundant bridge bar to streamline feed
  if (postCity.id === viewerCity.id) {
    return '';
  }

  const fnHaversine = (typeof haversineKm === 'function')
    ? haversineKm
    : (window.haversineKm || ((lat1, lon1, lat2, lon2) => {
        const R = 6371;
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;
        const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      }));

  const km = Math.round(fnHaversine(postCity.lat, postCity.lng, viewerCity.lat, viewerCity.lng));
  const sub = lang === 'fr' ? 'Générer un Billet 4D' : 'Generate 4D Ticket';

  return `
    <div class="city-distance-bridge compact-distance-pill" title="${sub}">
      <span class="bridge-plane">✈️</span>
      <span class="bridge-route">${postCity.flag} ${getCityName(postCity, lang)} → ${viewerCity.flag} ${getCityName(viewerCity, lang)}</span>
      <span class="bridge-km">${km.toLocaleString()} km</span>
      <button type="button" class="bridge-ticket-btn" onclick="openBoardingPassModal('${viewerCity.id}', '${postCity.id}')" title="${sub}">🎫 4D</button>
    </div>
  `;
}

function isPostBoostActive(p) {
  if (!p || !p.boosted) return false;
  const now = Date.now();
  if (p.boostedUntil) {
    if (now < Number(p.boostedUntil)) return true;
    p.boosted = false;
    return false;
  }
  // Fallback for legacy boosted post without explicit boostedUntil:
  // if createdAt is within 24h, grant remaining time; otherwise expire immediately!
  if (p.createdAt && (now - Number(p.createdAt) < 86400000)) {
    p.boostedUntil = Number(p.createdAt) + 86400000;
    return true;
  }
  p.boosted = false;
  return false;
}
window.isPostBoostActive = isPostBoostActive;

function getPostBoostBadgeHtml(p, lang) {
  if (!isPostBoostActive(p)) return '';
  const untilTs = Number(p.boostedUntil || 0);
  const msLeft = Math.max(0, untilTs - Date.now());
  const hoursLeft = Math.floor(msLeft / 3600000);
  const minsLeft = Math.max(1, Math.floor((msLeft % 3600000) / 60000));
  const isFr = lang === 'fr';
  const timeStr = hoursLeft > 0 ? `${hoursLeft}h ${minsLeft}m` : `${minsLeft}m`;
  const lbl = isFr ? `🚀 BOOSTÉ · ⏳ ${timeStr}` : `🚀 BOOSTED · ⏳ ${timeStr}`;
  return `<span class="pbadge boost post-boost-badge-live" data-boost-until="${untilTs}" style="background:linear-gradient(135deg,#f59e0b,#ec4899);color:#fff;font-weight:900;box-shadow:0 0 12px rgba(245,158,11,0.55);border:1px solid rgba(254,240,138,0.55);letter-spacing:0.3px;">${lbl}</span>`;
}
window.getPostBoostBadgeHtml = getPostBoostBadgeHtml;

function refreshLiveBoostBadgesInPlace() {
  const isFr = REMO_I18N.getLang() === 'fr';
  const now = Date.now();
  document.querySelectorAll('.post-boost-badge-live[data-boost-until]').forEach((el) => {
    const untilTs = Number(el.getAttribute('data-boost-until') || 0);
    const msLeft = untilTs - now;
    if (msLeft <= 0) {
      el.remove();
      return;
    }
    const hoursLeft = Math.floor(msLeft / 3600000);
    const minsLeft = Math.max(1, Math.floor((msLeft % 3600000) / 60000));
    const timeStr = hoursLeft > 0 ? `${hoursLeft}h ${minsLeft}m` : `${minsLeft}m`;
    el.textContent = isFr ? `🚀 BOOSTÉ · ⏳ ${timeStr}` : `🚀 BOOSTED · ⏳ ${timeStr}`;
  });
}
window.refreshLiveBoostBadgesInPlace = refreshLiveBoostBadgesInPlace;

function computePostRenderSig(p, u, lang) {
  if (!p || !p.id) return '';
  const voterKey = (u && u.uid) ? u.uid : (localStorage.getItem('remo_guest_vid') || '');
  const votedSide = (p.versus && p.versus.voterSides && voterKey && p.versus.voterSides[voterKey]) || localStorage.getItem('remo_versus_side_' + p.id) || '';
  const dualOpen = (window._openTranslatedPosts && window._openTranslatedPosts[p.id]) ? 1 : 0;
  const vSig = p.versus ? `${p.versus.leftVotes || 0}:${p.versus.rightVotes || 0}:${p.versus.closed ? 1 : 0}:${votedSide}:${(p.versus.claimedBonus || []).length}` : '';
  const pollSig = p.poll ? `${(p.poll.voters || []).length}:${(p.poll.options || []).map((o) => o.votes || 0).join(',')}` : '';
  const btySig = p.bounty ? `${p.bounty.claimed ? 1 : 0}` : '';
  const capSig = p.secretCapsule ? `${(p.secretCapsule.unlockedBy || []).length}` : '';
  const lookSig = p.lookRating ? `${p.lookRating.style?.sum || 0}:${p.lookRating.vibe?.sum || 0}:${p.lookRating.icon?.sum || 0}:${Object.keys(p.lookRating.voters || {}).length}` : '';
  const mboxSig = p.mysteryBox?.enabled ? `${isPostMysteryBoxLocked(p, u) ? 1 : 0}:${(p.mysteryBox.unboxedBy || []).length}:${(p.mysteryBox.guessOptions || []).map((o) => o.votes || 0).join(',')}` : '';
  const chSig = p.gameChallenge ? `${p.gameChallenge.targetScore || 0}:${p.gameChallenge.holderUid || ''}:${p.gameChallenge.crownSteals || 0}` : '';
  const liked = (u && (p.likes || []).includes(u.uid)) ? 1 : 0;
  const boostMins = isPostBoostActive(p) ? Math.floor(Math.max(0, Number(p.boostedUntil) - Date.now()) / 60000) : 0;
  const mFp = (s) => (s ? `${s.length}:${s.slice(0, 24)}:${s.slice(-16)}` : '');
  return `${p.id}_${lang}_${p.mediaType || ''}_${mFp(p.mediaUrl)}_${(p.mediaUrls || []).map(mFp).join(',')}_${(p.likes || []).length}_${liked}_${(p.comments || []).length}_${p.tipsTotal || 0}_${p.pinned ? 1 : 0}_${boostMins}_${p.founderAward ? 1 : 0}_${p.mintedCard ? 1 : 0}_${dualOpen}_${vSig}_${pollSig}_${btySig}_${capSig}_${lookSig}_${mboxSig}_${chSig}_${Object.keys(p.cityGuesses || {}).length}_${p.leaderboard?.[0]?.score || 0}_${isPostCapsuleSealed(p) ? 1 : 0}_${isAdminXrayOpen(p.id) ? 1 : 0}_${p._cloudSyncError ? 1 : 0}_${p._cloudSyncPending ? 1 : 0}`;
}

function toggleTkCaptionExpand(postId, ev) {
  if (ev) ev.stopPropagation();
  window._openTkCaptions = window._openTkCaptions || {};
  window._openTkCaptions[postId] = !window._openTkCaptions[postId];
  const card = document.getElementById('post_card_' + postId);
  if (card) {
    const capEl = card.querySelector('.tk-ov-caption');
    const btnEl = card.querySelector('.tk-ov-more-btn');
    const expanded = Boolean(window._openTkCaptions[postId]);
    if (capEl) capEl.classList.toggle('expanded', expanded);
    if (btnEl) {
      const fr = REMO_I18N.getLang() === 'fr';
      btnEl.textContent = expanded ? (fr ? 'moins' : 'less') : (fr ? 'plus' : 'more');
    }
  }
}
window.toggleTkCaptionExpand = toggleTkCaptionExpand;

function toggleTkWidgetTray(postId, ev) {
  if (ev) ev.stopPropagation();
  window._openTkWidgetTrays = window._openTkWidgetTrays || {};
  window._openTkWidgetTrays[postId] = !window._openTkWidgetTrays[postId];
  const tray = document.getElementById('tk_widget_tray_' + postId);
  if (tray) tray.classList.toggle('open', Boolean(window._openTkWidgetTrays[postId]));
}
window.toggleTkWidgetTray = toggleTkWidgetTray;

function renderSinglePostCardHtml(p, lang, u, isAdm) {
  try {
    if (!p || !p.id) return '';
    const tcRecipient = (p.mediaType === 'text_card') ? getEffectiveTextCardRecipient(p) : '';
    const showTcReplyBar = Boolean(
      p.mediaType === 'text_card' &&
      (tcRecipient || (window._deepLinkedPostId && window._deepLinkedPostId === p.id))
    );
    const city = getCityById(p.cityId) || getCityById('montreal') || { id: 'montreal', name_en: 'Montreal', name_fr: 'Montréal', flag: '⚜️', code: 'MTL' };
    const wx = (typeof REMO_WEATHER !== 'undefined' && REMO_WEATHER.getCityLiveStatus)
      ? (REMO_WEATHER.getCityLiveStatus(city) || { icon: '🌤️', tempC: 20, isSurge: false, timeStr: '12:00' })
      : { icon: '🌤️', tempC: 20, isSurge: false, timeStr: '12:00' };
    const sealed = isPostCapsuleSealed(p);
    const xray = isAdminXrayOpen(p.id);
    const hiddenByCapsule = sealed && !xray;
    const mboxLocked = isPostMysteryBoxLocked(p, u);
    const teaserTxt = lang === 'fr'
      ? (p.capsuleTeaser_fr || p.capsuleTeaser_en || 'Capsule mystère scellée...')
      : (p.capsuleTeaser_en || p.capsuleTeaser_fr || 'Mystery capsule sealed...');
    const rawCap = hiddenByCapsule
      ? `🔒 ${teaserTxt}`
      : String((lang === 'fr' ? (p.caption_fr || p.caption_en) : (p.caption_en || p.caption_fr)) || '').replace(/^(?:🇬🇧|🇫🇷)\s+/u, '');
    const formattedCap = escapeHtmlStr(rawCap || '').replace(/#([\w\u00C0-\u024F]+)/g, `<span class="hashtag" onclick="renderSocialFeed('#$1', true)">#$1</span>`);
    const liked = Boolean(u && (p.likes || []).includes(u.uid));
    const interactiveNoTilt = hiddenByCapsule || mboxLocked || p.mediaType === 'html_app' || p.mediaType === 'before_after' || p.mediaType === 'video_link' || Boolean(p.externalUrl) || Boolean(p.odysseyChallenge);
    const voiceResolved = p.voiceUrl ? RemoMediaDB.resolveSyncOrPlaceholder(p.voiceUrl) : '';
    const voiceIdbAttr = p.voiceUrl && String(p.voiceUrl).startsWith('idb://') ? `data-idb-src="${p.voiceUrl}"` : '';
    const cityMayor = (REMO_STORE && REMO_STORE.getCityMayor) ? REMO_STORE.getCityMayor(p.cityId) : null;
    const isMayor = cityMayor && cityMayor.uid === p.uid;
    const cosm = (REMO_STORE && REMO_STORE.getUserCosmetics) ? REMO_STORE.getUserCosmetics(p.uid) : { frameClass: '', title_fr: '', title_en: '' };
    const authorUser = (REMO_STORE.state.users || []).find((usr) => usr && ((p.uid && usr.uid === p.uid) || (p.authorName && usr.name && usr.name.toLowerCase() === p.authorName.toLowerCase())));
    const authorAvatarUrl = p.authorAvatar || (typeof REMO_STORE.getUserAvatar === 'function' ? REMO_STORE.getUserAvatar(p.uid || p.authorName) : '') || (authorUser && authorUser.avatarUrl) || '';
    const dualPair = hiddenByCapsule
      ? { en: `🔒 ${p.capsuleTeaser_en || teaserTxt}`, fr: `🔒 ${p.capsuleTeaser_fr || teaserTxt}` }
      : buildPostBilingualPair(p);
    const isDualOpen = !!(window._openTranslatedPosts && window._openTranslatedPosts[p.id]);
    const isTkCapOpen = !!(window._openTkCaptions && window._openTkCaptions[p.id]);
    const isTkTrayOpen = !!(window._openTkWidgetTrays && window._openTkWidgetTrays[p.id]);
    const isPostOwner = Boolean(u && (
      (p.uid && u.uid === p.uid) ||
      (p.authorUid && u.uid === p.authorUid) ||
      (u.email && p.authorEmail && u.email.toLowerCase() === p.authorEmail.toLowerCase()) ||
      (u.name && p.authorName && u.name.trim().toLowerCase() === p.authorName.trim().toLowerCase())
    ));
    const mysteryMasked = Boolean(p.mysteryCity && !isPostOwner && typeof isMysteryCityMaskedForViewer === 'function' && isMysteryCityMaskedForViewer(p, u));

    const tcBarHtml = (!hiddenByCapsule && showTcReplyBar) ? `
      <div class="tc-dedicated-reply-bar">
        <span class="tc-dedicated-reply-txt">${tcRecipient ? escapeHtmlStr(t('tc_dedicated_banner', { name: tcRecipient })) : `✍️ @${escapeHtmlStr(p.authorName || 'Citizen')}`}</span>
        <button type="button" class="tc-send-back-btn" onclick="openReplyTextCardTo('${escapeJsSingleArg(p.authorName || '')}', '${escapeJsSingleArg(city.id)}')">${escapeHtmlStr(t('tc_send_back_btn'))}</button>
      </div>` : '';
    const mysteryHtml = !hiddenByCapsule && typeof renderMysteryCityWidget === 'function' ? renderMysteryCityWidget(p, city, lang, u, isPostOwner) : '';
    const winBarHtml = (!hiddenByCapsule && !mysteryMasked && (p.duetOf || p.isWorldWindow) && typeof renderWorldWindowActionsBar === 'function')
      ? renderWorldWindowActionsBar(p, lang)
      : '';
    const secretSpotHtml = p.isSecretSpot ? `
      <div class="secret-spot-card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;gap:8px;">
          <span style="font-family:'Orbitron',sans-serif;font-size:0.78rem;font-weight:900;color:#38bdf8;letter-spacing:0.5px;">
            🗺️ ${lang === 'fr' ? 'LIEU SECRET URBAIN' : 'URBAN SECRET SPOT'}
          </span>
          <button type="button" class="btn-cyber" style="padding:4px 9px;font-size:0.72rem;background:#0284c7;" onclick="focusCityOnRadar('${p.cityId}')">
            🧭 ${lang === 'fr' ? 'Radar GPS' : 'GPS Radar'}
          </button>
        </div>
        <b style="font-size:0.86rem;color:#f8fafc;display:block;">${escapeHtmlStr(p.secretSpotTitle || '')}</b>
        ${p.secretSpotClue ? `
          <div style="font-size:0.78rem;color:#94a3b8;margin-top:3px;font-style:italic;">
            💡 <span style="color:#cbd5e1;">${lang === 'fr' ? 'Indice' : 'Clue'}:</span> "${escapeHtmlStr(p.secretSpotClue)}"
          </div>
        ` : ''}
      </div>` : '';
    const bountyHtml = renderFeedBountyWidget(p, lang);
    const lookHtml = hiddenByCapsule ? '' : renderLookRatingWidget(p, lang, u);
    const pollHtml = hiddenByCapsule ? '' : renderPostPollWidget(p, lang, u);
    const capsuleHtml = hiddenByCapsule ? '' : renderSecretCapsuleWidget(p, lang, u);
    const viralHtml = hiddenByCapsule ? '' : renderViralGoalWidget(p, lang, isAdm);
    const audioHtml = (!hiddenByCapsule && p.voiceUrl) ? `<audio src="${voiceResolved}" ${voiceIdbAttr} controls style="width:100%;height:34px;margin-top:6px;"></audio>` : '';
    const htmlGameLb = (!hiddenByCapsule && p.mediaType === 'html_app') ? renderHtmlGameLeaderboardWidget(p, lang, u) : '';
    const adminBarHtml = renderAdminPostBar(p);
    const syncErrHtml = p._cloudSyncError ? `<button type="button" class="post-sync-retry-banner" onclick="retrySyncPostToCloud('${escapeJsSingleArg(p.id)}')" title="${escapeHtmlStr(p._cloudSyncError)}">${escapeHtmlStr(t('post_sync_retry_btn'))}</button>` : '';

    const tkInteractiveHtml = [tcBarHtml, mysteryHtml, pollHtml, bountyHtml, lookHtml, capsuleHtml, viralHtml, secretSpotHtml, winBarHtml, audioHtml, htmlGameLb, adminBarHtml].filter(Boolean).join('');
    const tkTriggerLabel = mysteryHtml
      ? (lang === 'fr' ? '🕵️ Deviner la Ville (+10 🪙)' : '🕵️ Guess City (+10 🪙)')
      : pollHtml
        ? (lang === 'fr' ? '📊 Voter au Sondage' : '📊 Vote in Poll')
        : bountyHtml
          ? (lang === 'fr' ? '🎁 Réclamer Prime 🪙' : '🎁 Claim Bounty 🪙')
          : lookHtml
            ? (lang === 'fr' ? '⭐ Noter le Avant/Après' : '⭐ Rate Glow-Up')
            : htmlGameLb
              ? (lang === 'fr' ? '🏆 Classement & Défi' : '🏆 Game Scores')
              : secretSpotHtml
                ? (lang === 'fr' ? '🗺️ Lieu Secret GPS' : '🗺️ Secret Spot')
                : adminBarHtml
                  ? (lang === 'fr' ? '🛡️ Outils Admin' : '🛡️ Admin Tools')
                  : (lang === 'fr' ? '✨ Activité & Audio' : '✨ Interactive');

    return `
      <article id="post_card_${p.id}" class="post-card ${isPostBoostActive(p) || p.pinned || sealed ? 'boosted' : ''} ${p.mediaType === 'html_app' ? 'is-html-app' : ''} ${p.mediaType === 'city_versus' ? 'is-city-versus' : ''} ${p.mediaType === 'before_after' ? 'is-before-after' : ''}" ${interactiveNoTilt ? '' : 'onmousemove="applyHoloTilt(event, this)" onmouseleave="resetHoloTilt(this)"'}>
        <div class="post-head">
          <div style="display:flex;align-items:center;gap:6px;min-width:0;flex:1;">
            <div class="post-author" style="cursor:pointer;min-width:0;" onclick="${p.isShowcase ? `openFocusTvModal('${escapeJsSingleArg(city.id)}')` : `openCitizenProfileModal('${escapeJsSingleArg(p.uid || '')}', '${escapeJsSingleArg(p.authorName || '')}')`}" title="🪪 @${escapeHtmlStr(p.authorName)}">
              <div class="avatar-circle ${cosm.frameClass}" style="overflow:hidden;padding:0;">
                ${sanitizeSafeMediaUrl(authorAvatarUrl) ? `<img src="${sanitizeSafeMediaUrl(authorAvatarUrl)}" loading="lazy" decoding="async" style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block;" alt="${escapeHtmlStr(p.authorName)}">` : escapeHtmlStr((p.authorName || 'R')[0].toUpperCase())}
              </div>
              <div style="min-width:0;">
                <div style="font-weight:800;font-size:0.86rem;display:flex;align-items:center;gap:5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                  <span style="overflow:hidden;text-overflow:ellipsis;">${escapeHtmlStr(p.authorName)}</span>
                  ${p.authorVerified ? '<span style="color:#38bdf8;flex-shrink:0;">✓</span>' : ''}
                  ${!mysteryMasked && isMayor ? `<span class="mayor-tag" title="${t('mayor_badge')}">👑</span>` : ''}
                </div>
                <div style="font-size:0.71rem;color:var(--muted);margin-top:1px;display:flex;align-items:center;gap:5px;flex-wrap:wrap;">
                  ${mysteryMasked
                    ? `<span class="mystery-masked-tag">${t('guess_masked_city')}</span>`
                    : `<span style="cursor:pointer;color:#cbd5e1;" onclick="event.stopPropagation();filterFeedByCityFromMap('${city.id}')">${city.flag} ${escapeHtmlStr(getCityName(city, lang))}</span> · <span>🕒 ${wx.timeStr}</span>`}
                  ${p.remixedFromAuthor ? ` · <span style="color:#34d399;">${t('post_remix_from')} @${escapeHtmlStr(p.remixedFromAuthor)}</span>` : ''}
                </div>
              </div>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
            ${mysteryMasked
              ? `<span class="city-tag" style="color:#fde047;border-color:rgba(251,191,36,0.45);">🕵️ ???</span>`
              : `<span class="city-tag ${wx.isSurge ? 'is-surge' : ''}" onclick="filterFeedByCityFromMap('${city.id}')">${wx.icon || '🌤️'} ${wx.tempC ?? 20}°${wx.isSurge ? ' ⚡2X' : ''}</span>`}
            <button type="button" class="post-more-dot-btn" onclick="openPostActionsSheet('${p.id}')" title="${lang === 'fr' ? 'Options de la publication' : 'Post options'}">⋯</button>
          </div>
        </div>

        <div class="post-media-wrap" id="post_media_${p.id}" ondblclick="handleMediaDoubleTap(event, '${p.id}', this)" ontouchstart="handleTouchDoubleTap(event, '${p.id}', this)">
          <div class="post-flip-container" id="post_flip_${p.id}">
            <div class="post-flip-inner">
              <div class="post-face-front">
                <div class="post-badges-top">
                  ${sealed ? `<span class="pbadge capsule">${t('capsule_locked_badge')}${xray ? ' · 👁️ X-RAY' : ''}</span>` : (p.wasTimeCapsule ? `<span class="pbadge unsealed">${t('capsule_unsealed_badge')}</span>` : '')}
                  ${!hiddenByCapsule && mboxLocked ? `<span class="pbadge mbox">${t('mbox_badge_locked')}</span>` : (!hiddenByCapsule && p.mysteryBox?.enabled ? `<span class="pbadge unboxed">${t('mbox_badge_unboxed', { n: (p.mysteryBox.unboxedBy || []).length })}</span>` : '')}
                  ${p.duetOf ? `<span class="pbadge duet">${t('post_duet_badge')}</span>` : ''}
                  ${p.pinned ? `<span class="pbadge pinned">${t('post_pinned_badge')}</span>` : ''}
                  ${p.founderAward ? `<span class="pbadge founder">${t('post_founder_award_badge')}</span>` : ''}
                  ${getPostBoostBadgeHtml(p, lang)}
                  ${p.bounty && !p.bounty.claimed ? `<span class="pbadge boost" style="background:#f59e0b;color:#000;">🎁 +${p.bounty.coins} 🪙</span>` : ''}
                  ${!hiddenByCapsule && p.mediaType === 'video' ? `<span class="pbadge vid60">${t('post_video60_badge')} · ${formatDurationMMSS(p.videoDuration || 60)}</span>` : ''}
                  ${!hiddenByCapsule && (p.mediaType === 'video_link' || p.externalUrl) ? `<span class="pbadge vid60">🔗 ${lang === 'fr' ? 'LIEN VIDÉO' : 'VIDEO LINK'}</span>` : ''}
                  ${!hiddenByCapsule && p.mediaType === 'before_after' ? `<span class="pbadge html">${t('post_slider_badge')}</span>` : ''}
                  ${!mysteryMasked && p.verifiedGps ? `<span class="pbadge gps">${t('post_verified_gps')}</span>` : ''}
                  ${p.mintedCard ? `<span class="pbadge mint">${t('post_minted_badge')}</span>` : ''}
                  ${p.isSecretSpot ? `<span class="pbadge secret-spot">🗺️ ${lang === 'fr' ? 'LIEU SECRET' : 'SECRET SPOT'}</span>` : ''}
                </div>
                ${renderPostMediaStage(p, city, lang)}
                ${!hiddenByCapsule && p.soundtrackId && typeof renderPostSoundtrackDisc === 'function' ? renderPostSoundtrackDisc(p, lang) : ''}
              </div>
              <div class="post-face-back">
                ${mysteryMasked ? `<div style="padding:28px;text-align:center;color:#fde047;font-weight:800;">${t('guess_card_back_locked')}</div>` : renderPostCardBack(p, city, lang, wx)}
              </div>
            </div>
          </div>
        </div>

        <!-- Mobile TikTok Bottom-Left Clean Overlay (Restores Caption, Author & Expandable Interactions) -->
        <div class="tiktok-overlay-info">
          ${syncErrHtml}
          ${tkInteractiveHtml ? `
            <button type="button" class="tk-ov-interact-pill" id="tk_widget_btn_${p.id}" onclick="toggleTkWidgetTray('${p.id}', event)">${tkTriggerLabel}</button>
            <div class="tk-ov-widget-tray ${isTkTrayOpen ? 'open' : ''}" id="tk_widget_tray_${p.id}" onclick="event.stopPropagation()">${tkInteractiveHtml}</div>
          ` : ''}
          <div class="tk-ov-author-row">
            <button type="button" class="tk-ov-author-btn" onclick="${p.isShowcase ? `openFocusTvModal('${escapeJsSingleArg(city.id)}')` : `openCitizenProfileModal('${escapeJsSingleArg(p.uid || '')}', '${escapeJsSingleArg(p.authorName || '')}')`}">
              <b>@${escapeHtmlStr(p.authorName)}</b>
              ${p.authorVerified ? '<span style="color:#38bdf8;">✓</span>' : ''}
              ${!mysteryMasked && isMayor ? '<span>👑</span>' : ''}
            </button>
            ${mysteryMasked
              ? `<span class="tk-ov-city-pill" style="color:#fde047;">🕵️ ???</span>`
              : `<button type="button" class="tk-ov-city-pill" onclick="filterFeedByCityFromMap('${city.id}')">${city.flag} ${escapeHtmlStr(getCityName(city, lang))} · ${wx.timeStr} · ${wx.icon || '🌤️'} ${wx.tempC ?? 20}°</button>`}
          </div>
          ${(formattedCap || p.mediaType === 'text_card') ? `
            <div class="tk-ov-caption-wrap">
              <div class="tk-ov-caption ${isTkCapOpen ? 'expanded' : ''}">${formattedCap}</div>
              <div class="tk-ov-cap-tools">
                ${(rawCap && rawCap.length > 72) ? `<button type="button" class="tk-ov-more-btn" onclick="toggleTkCaptionExpand('${p.id}', event)">${isTkCapOpen ? (lang === 'fr' ? 'moins' : 'less') : (lang === 'fr' ? 'plus' : 'more')}</button>` : ''}
                <button type="button" class="tk-ov-tr-btn ${isDualOpen ? 'active' : ''}" onclick="event.stopPropagation();togglePostAutoTranslate('${p.id}')">🌐 EN⇄FR</button>
              </div>
              <div class="bilingual-dual-box ${isDualOpen ? 'open' : ''}" style="margin-top:4px;font-size:0.74rem;">
                <div><b style="color:#38bdf8;">🇬🇧 EN:</b> ${escapeHtmlStr(dualPair.en)}</div>
                <div><b style="color:#fbbf24;">🇫🇷 FR:</b> ${escapeHtmlStr(dualPair.fr)}</div>
              </div>
            </div>
          ` : ''}
        </div>

        <!-- Clean Sleek Post Body (Desktop) -->
        <div class="post-body">
          ${tcBarHtml}
          ${mysteryMasked ? '' : getInterCityDistanceBridge(city, lang)}
          ${mysteryHtml}
          ${winBarHtml}
          ${syncErrHtml}

          <div class="post-actions-bar">
            <button type="button" class="pact-btn ${liked ? 'liked' : ''}" onclick="toggleLikePost('${p.id}')" title="Like">
              ❤️ <span>${(p.likes || []).length}</span>
            </button>
            <button type="button" class="pact-btn" onclick="openCommentsModal('${p.id}')" title="Comments">
              💬 <span>${(p.comments || []).length}</span>
            </button>
            <button type="button" class="pact-btn" onclick="tipPostAuthor('${p.id}')" title="Tip Coins">
              🪙 <span>${p.tipsTotal || 0}</span>
            </button>
            <button type="button" class="pact-btn" onclick="sharePostLink('${p.id}')" title="${lang === 'fr' ? 'Partager' : 'Share'}">
              ↪
            </button>
            ${isPostOwner ? `
            <button type="button" class="pact-btn pact-wspot-btn" onclick="openSpotlightForSpecificPost('${p.id}')" title="${escapeHtmlStr(t('wspot_post_btn_sub'))}">
              🌟 <span>#1</span>
            </button>
            ` : ''}
            <button type="button" class="pact-btn pact-more-btn" onclick="openPostActionsSheet('${p.id}')" title="${lang === 'fr' ? 'Plus d’actions (3D, Duo, Billet, Boost)' : 'More options (3D, Duet, Pass, Boost)'}">
              ⋯
            </button>
          </div>

          ${(formattedCap || p.mediaType === 'text_card') ? `
          <div class="post-caption-row">
            <div class="post-caption" style="flex:1;">${formattedCap}</div>
            <button type="button" class="translate-pill-btn subtle-tr-btn ${isDualOpen ? 'active' : ''}" onclick="togglePostAutoTranslate('${p.id}')">${isDualOpen ? t('post_translate_hide') : '🌐 EN⇄FR'}</button>
          </div>
          <div class="bilingual-dual-box ${isDualOpen ? 'open' : ''}">
            <div><b style="color:#38bdf8;">🇬🇧 EN:</b> ${escapeHtmlStr(dualPair.en)}</div>
            <div><b style="color:#fbbf24;">🇫🇷 FR:</b> ${escapeHtmlStr(dualPair.fr)}</div>
          </div>` : ''}
          ${secretSpotHtml}
          ${bountyHtml}
          ${lookHtml}
          ${pollHtml}
          ${capsuleHtml}
          ${viralHtml}
          ${audioHtml}
          ${htmlGameLb}
          ${adminBarHtml}
        </div>

        <!-- Mobile Clean 5-Icon TikTok Right Floating Rail -->
        <div class="tiktok-rail">
          <div class="tk-avatar-wrap" onclick="openCitizenProfileModal('${escapeJsSingleArg(p.uid || '')}', '${escapeJsSingleArg(p.authorName || '')}')" title="@${escapeHtmlStr(p.authorName)}">
            <div class="avatar-circle ${cosm.frameClass}" style="width:40px;height:40px;font-size:0.9rem;border:2px solid #fff;overflow:hidden;padding:0;">
              ${sanitizeSafeMediaUrl(authorAvatarUrl) ? `<img src="${sanitizeSafeMediaUrl(authorAvatarUrl)}" loading="lazy" decoding="async" style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block;" alt="${escapeHtmlStr(p.authorName)}">` : escapeHtmlStr((p.authorName || 'R')[0].toUpperCase())}
            </div>
            <span class="tk-avatar-plus">+</span>
          </div>
          <button type="button" class="tk-btn ${liked ? 'liked' : ''}" onclick="toggleLikePost('${p.id}')">
            <span class="tk-ic">❤️</span>
            <span class="tk-cnt">${(p.likes || []).length}</span>
          </button>
          <button type="button" class="tk-btn" onclick="openCommentsModal('${p.id}')">
            <span class="tk-ic">💬</span>
            <span class="tk-cnt">${(p.comments || []).length}</span>
          </button>
          <button type="button" class="tk-btn" onclick="tipPostAuthor('${p.id}')">
            <span class="tk-ic">🪙</span>
            <span class="tk-cnt">${p.tipsTotal || 0}</span>
          </button>
          <button type="button" class="tk-btn" onclick="sharePostLink('${p.id}')" title="${lang === 'fr' ? 'Partager' : 'Share'}">
            <span class="tk-ic">↪</span>
            <span class="tk-cnt">${lang === 'fr' ? 'Partager' : 'Share'}</span>
          </button>
          <button type="button" class="tk-btn tk-btn-more" onclick="openPostActionsSheet('${p.id}')" title="${lang === 'fr' ? 'Plus (3D, Duo, Options)' : 'More'}">
            <span class="tk-ic">⋯</span>
          </button>
          <div class="tk-disc" onclick="toggleHeaderRadio()" title="World Radio">🎵</div>
        </div>
      </article>
    `;
  } catch (err) {
    console.warn('Post card render error:', p?.id, err);
    return '';
  }
}

/* ── EDITORIAL SHOWCASE FEED MOMENTS & CLEAN UI HELPERS ── */
function getEditorialShowcasePosts() {
  if (Array.isArray(window._REMO_SHOWCASE_POSTS) && window._REMO_SHOWCASE_POSTS.length) {
    return window._REMO_SHOWCASE_POSTS;
  }
  const now = Date.now();
  const neonGameHtml = `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>*{box-sizing:border-box;margin:0;padding:0;font-family:system-ui,sans-serif;}body{height:100vh;background:radial-gradient(circle at 50% 25%,#1e1b4b,#050816);color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;overflow:hidden;user-select:none;}#orb{width:96px;height:96px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#38bdf8,#ec4899);box-shadow:0 0 36px rgba(236,72,153,0.75);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:2rem;transition:transform .09s ease;}#orb:active{transform:scale(0.9);}.hud{font-size:0.85rem;color:#bae6fd;letter-spacing:1px;font-weight:800;}#sc{font-size:2.1rem;font-weight:900;color:#fde047;text-shadow:0 0 14px rgba(253,224,71,0.5);}</style></head><body><div class="hud">TOKYO NEON PULSE · TAP ORB</div><div id="sc">0</div><div id="orb" onclick="hit()">⚡</div><div class="hud" id="sub">Catch Cyber Voltage</div><script>let n=0;function hit(){n+=10;document.getElementById('sc').textContent=n;const o=document.getElementById('orb');o.style.transform='scale(1.12)';setTimeout(()=>o.style.transform='',90);document.getElementById('sub').textContent='Voltage '+n+' ⚡';}</script></body></html>`;

  window._REMO_SHOWCASE_POSTS = [
    {
      id: 'showcase_mtl_guide',
      isShowcase: true,
      uid: '',
      authorName: 'REMO City Guide',
      authorVerified: true,
      cityId: 'montreal',
      vibe: 'culture',
      mediaType: 'image',
      visualHeadline: 'MONTRÉAL SKYLINE',
      visualSub: 'Mount Royal · Cyber-Creative Capital',
      caption_en: '⚜️ Welcome to Montréal — home of the 4D World Feed, late-night cafés & live Cyber-LoFi Focus TV. Tap 📺 Focus TV above to tune in!',
      caption_fr: '⚜️ Bienvenue à Montréal — berceau du Flux Mondial 4D, cafés nocturnes et Focus TV Cyber-LoFi en direct. Touchez 📺 Focus TV ci-dessus !',
      createdAt: now - 3600000,
      likes: [],
      comments: [],
      reactions: { '🔥': 3, '💎': 2 }
    },
    {
      id: 'showcase_duel_mtl_par',
      isShowcase: true,
      uid: '',
      authorName: 'REMO City Duel',
      authorVerified: true,
      cityId: 'paris',
      vibe: 'energy',
      mediaType: 'city_versus',
      versus: {
        leftCityId: 'montreal',
        rightCityId: 'paris',
        category: 'nightlife',
        durationHours: 72,
        endsAt: now + 72 * 3600000,
        leftVotes: 0,
        rightVotes: 0,
        voters: [],
        voterSides: {}
      },
      caption_en: '⚔️ Classic Transatlantic Duel: ⚜️ Montréal Nightlife vs 🗼 Paris Golden Hour! Tap a city photo to cast your vote (+10 🪙)!',
      caption_fr: '⚔️ Duel Transatlantique : ⚜️ Nuits de Montréal vs 🗼 Heure Dorée à Paris ! Touchez une photo pour voter (+10 🪙) !',
      createdAt: now - 7200000,
      likes: [],
      comments: [],
      reactions: { '⚡': 4 }
    },
    {
      id: 'showcase_ny_guess',
      isShowcase: true,
      uid: '',
      authorName: 'REMO Mystery Lens',
      authorVerified: true,
      cityId: 'newyork',
      vibe: 'chill',
      mediaType: 'image',
      mysteryCity: true,
      visualHeadline: 'NEON CANYON 02:15',
      visualSub: 'Guess This Sleepless Metropolis!',
      caption_en: '🕵️ Guess The City Challenge: Which metropolis never sleeps beneath holographic skyscrapers? Pick your answer below (+10 🪙)!',
      caption_fr: '🕵️ Défi Devine la Ville : Quelle métropole ne dort jamais sous les gratte-ciels néon ? Choisissez votre réponse ci-dessous (+10 🪙) !',
      createdAt: now - 10800000,
      likes: [],
      comments: [],
      reactions: { '🤯': 2 }
    },
    {
      id: 'showcase_tyo_arcade',
      isShowcase: true,
      uid: '',
      authorName: 'REMO Cyber Arcade',
      authorVerified: true,
      cityId: 'tokyo',
      vibe: 'energy',
      mediaType: 'html_app',
      htmlCode: neonGameHtml,
      caption_en: '💻 Playable 4D Mini-App directly in the feed: Tokyo Neon Pulse ⚡ Tap the cyber orb right inside this card!',
      caption_fr: '💻 Mini-App 4D jouable directement dans le flux : Tokyo Neon Pulse ⚡ Touchez l’orbe cyber dans cette carte !',
      createdAt: now - 14400000,
      likes: [],
      comments: [],
      reactions: { '👑': 2 }
    },
    {
      id: 'showcase_par_lofi',
      isShowcase: true,
      uid: '',
      authorName: 'REMO City Guide',
      authorVerified: true,
      cityId: 'paris',
      vibe: 'chill',
      mediaType: 'image',
      visualHeadline: 'PARIS · LA SEINE',
      visualSub: 'Golden Hour & Velvet Nightfall',
      caption_en: '🗼 Midnight walks along the Seine, rainy brasseries, and French-touch chill beats inside 4D Focus TV.',
      caption_fr: '🗼 Balades nocturnes sur la Seine, brasseries sous la pluie et beats chill dans Focus TV 4D.',
      createdAt: now - 18000000,
      likes: [],
      comments: [],
      reactions: { '🔥': 2 }
    },
    {
      id: 'showcase_tyo_night',
      isShowcase: true,
      uid: '',
      authorName: 'REMO City Guide',
      authorVerified: true,
      cityId: 'tokyo',
      vibe: 'culture',
      mediaType: 'image',
      visualHeadline: 'TOKYO SHIBUYA',
      visualSub: 'Rain Reflections & Holographic Neon',
      caption_en: '🏯 Tokyo Shibuya 24/7 — sync live weather & neon Lo-Fi radio inside your own 4D City Window.',
      caption_fr: '🏯 Tokyo Shibuya 24/7 — synchronisez la météo réelle et la radio Lo-Fi dans votre Fenêtre Ville 4D.',
      createdAt: now - 21600000,
      likes: [],
      comments: [],
      reactions: { '💎': 3 }
    }
  ];
  return window._REMO_SHOWCASE_POSTS;
}

function findFeedPostById(postId) {
  if (!postId) return null;
  const target = String(postId);
  const realMatch = (REMO_STORE.state.posts || []).find((x) => x && String(x.id) === target);
  if (realMatch) return realMatch;
  return getEditorialShowcasePosts().find((x) => x && String(x.id) === target) || null;
}
window.findFeedPostById = findFeedPostById;

function openAppLauncherModal() {
  const modal = document.getElementById('appLauncherModal');
  if (!modal) return;
  if (typeof REMO_I18N !== 'undefined' && REMO_I18N.applyDOM) REMO_I18N.applyDOM(modal);
  syncHeaderAndSidebars();
  if (typeof updateUnreadBadges === 'function') updateUnreadBadges();
  modal.classList.add('open');
}
window.openAppLauncherModal = openAppLauncherModal;

function closeAppLauncherModal() {
  document.getElementById('appLauncherModal')?.classList.remove('open');
}
window.closeAppLauncherModal = closeAppLauncherModal;

function toggleMoreFeedFilters(forceState) {
  const wrap = document.getElementById('moreFeedFiltersWrap');
  const btn = document.getElementById('btnToggleMoreFilters');
  if (!wrap) return;
  const nextOpen = typeof forceState === 'boolean' ? forceState : !wrap.classList.contains('open');
  if (nextOpen && typeof closeTopFeedDrawers === 'function') {
    closeTopFeedDrawers('filters');
  }
  wrap.classList.toggle('open', nextOpen);
  if (btn) {
    btn.setAttribute('data-i18n', nextOpen ? 'filter_less_btn' : 'filter_more_btn');
    btn.textContent = REMO_I18N.t(nextOpen ? 'filter_less_btn' : 'filter_more_btn');
    btn.classList.toggle('active', nextOpen);
  }
}
window.toggleMoreFeedFilters = toggleMoreFeedFilters;

function dismissWelcomeHeroStrip() {
  const el = document.getElementById('remoWelcomeHeroStrip');
  if (el) el.style.display = 'none';
  try { localStorage.setItem('remo_hero_strip_dismissed', '1'); } catch (e) {}
}
window.dismissWelcomeHeroStrip = dismissWelcomeHeroStrip;

function syncWelcomeHeroVisibility() {
  const el = document.getElementById('remoWelcomeHeroStrip');
  if (!el) return;
  let dismissed = false;
  try { dismissed = localStorage.getItem('remo_hero_strip_dismissed') === '1'; } catch (e) {}
  const u = REMO_STORE.getCurrentUser();
  const isSignedInCitizen = Boolean(u && u.role !== 'guest' && !(typeof REMO_STORE.isFakeOrGuestUser === 'function' && REMO_STORE.isFakeOrGuestUser(u)) && (u.email || u.fbUid));
  el.style.display = (dismissed || isSignedInCitizen) ? 'none' : '';
}
window.syncWelcomeHeroVisibility = syncWelcomeHeroVisibility;

function voteCityDuelShortcut() {
  const chip = document.querySelector('#feedModeChips button[onclick*="duets"]');
  setFeedMode('duets', chip);
  const grid = document.getElementById('remoPostsGrid');
  const duelCard = document.querySelector('#remoPostsGrid .is-city-versus') || grid;
  if (duelCard) {
    if (grid && _isMobileGridScrollActive()) {
      grid.scrollTo({ top: duelCard.offsetTop || 0, behavior: 'smooth' });
      setTimeout(() => { if (typeof syncDesktopStageRail === 'function') syncDesktopStageRail(true); }, 180);
    } else {
      duelCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
}
window.voteCityDuelShortcut = voteCityDuelShortcut;

function _patchSingleFeedCardElement(p, lang, u, isAdm) {
  if (!p || !p.id) return false;
  const existingEl = document.getElementById('post_card_' + p.id);
  if (!existingEl) return false;
  const wasFlipped = Boolean(existingEl.querySelector('.post-flip-inner')?.classList.contains('flipped'));
  const newHtml = renderSinglePostCardHtml(p, lang, u, isAdm);
  if (!newHtml) return false;

  existingEl.outerHTML = newHtml;
  const updatedEl = document.getElementById('post_card_' + p.id);
  if (updatedEl) {
    if (wasFlipped) {
      updatedEl.querySelector('.post-flip-inner')?.classList.add('flipped');
    }
    RemoMediaDB.hydrateDom(updatedEl);
    initAllMysteryBoxCanvases(updatedEl);
  }
  if (window._renderedCardSigs) {
    window._renderedCardSigs[p.id] = computePostRenderSig(p, u, lang);
  }
  if (typeof syncDesktopStageRail === 'function') {
    syncDesktopStageRail(true);
  }
  return Boolean(updatedEl);
}

function rerenderSinglePostCard(postId) {
  if (!postId) return;
  const existingEl = document.getElementById('post_card_' + postId);
  const p = findFeedPostById(postId);
  if (!existingEl || !p) {
    renderSocialFeed('', true);
    return;
  }
  const lang = REMO_I18N.getLang();
  const u = REMO_STORE.getCurrentUser();
  const isAdm = REMO_STORE.isAdminUnlocked();
  _patchSingleFeedCardElement(p, lang, u, isAdm);
  // Keep feed signature synchronized so subsequent cloud snapshots don't trigger a redundant full rebuild
  window._lastRenderedFeedSignature = computeVisibleFeedSignature('');
}
window.rerenderSinglePostCard = rerenderSinglePostCard;

function getFilteredSortedFeedPosts(searchQuery = '') {
  const u = REMO_STORE.getCurrentUser();
  const deepId = window._deepLinkedPostId || '';
  const realPosts = (REMO_STORE.state.posts || []).filter((p) => p && p.mediaType !== 'beat_loop');

  // Deep-linked shared post (?post=ID) floats #1 on arrival, then Official Pinned posts, then Boosted posts (most recently boosted first), then newest
  realPosts.sort((a, b) => {
    const deepDiff = (deepId && b.id === deepId ? 1 : 0) - (deepId && a.id === deepId ? 1 : 0);
    if (deepDiff !== 0) return deepDiff;
    const pinDiff = (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0);
    if (pinDiff !== 0) return pinDiff;
    const bBoost = isPostBoostActive(b) ? 1 : 0;
    const aBoost = isPostBoostActive(a) ? 1 : 0;
    if (bBoost !== aBoost) return bBoost - aBoost;
    if (bBoost && aBoost) {
      return Number(b.boostedAt || b.createdAt || 0) - Number(a.boostedAt || a.createdAt || 0);
    }
    return (b.createdAt || 0) - (a.createdAt || 0);
  });

  // Merge Editorial Showcase posts after real user posts only while real feed is sparse (< 6 posts)
  let posts = realPosts.length < 6
    ? realPosts.concat(getEditorialShowcasePosts())
    : realPosts.slice();

  if (currentFeedMode === 'following') {
    const myFollowing = (u && Array.isArray(u.following)) ? u.following : [];
    posts = posts.filter((p) => p && myFollowing.includes(p.uid));
  } else if (currentFeedMode === 'mystery') {
    posts = posts.filter((p) => Boolean(p && p.mysteryCity));
  } else if (currentFeedMode === 'duets') {
    posts = posts.filter((p) => Boolean(p.duetOf || p.mediaType === 'city_versus'));
  } else if (currentFeedMode === 'bounties') {
    posts = posts.filter((p) => Boolean(p.bounty));
  } else if (currentFeedMode === 'capsules') {
    posts = posts.filter((p) => p.wasTimeCapsule || Boolean(p.unlockAt));
  } else if (currentFeedMode === 'html') {
    posts = posts.filter((p) => p.mediaType === 'html_app');
  } else if (currentFeedMode === 'videos') {
    posts = posts.filter((p) => p.mediaType === 'video' || p.mediaType === 'video_link' || Boolean(p.externalUrl));
  } else if (currentFeedMode === 'photos') {
    posts = posts.filter((p) => ['image', 'carousel', 'before_after'].includes(p.mediaType));
  } else if (currentFeedMode === 'my_city' && u) {
    posts = posts.filter((p) => p.cityId === u.homeCity);
  } else if (currentFeedMode === 'trending') {
    posts.sort((a, b) => ((b.likes || []).length + (b.tipsTotal || 0)) - ((a.likes || []).length + (a.tipsTotal || 0)));
  } else if (currentFeedMode === 'cards') {
    posts = posts.filter((p) => p.mintedCard);
  } else if (currentFeedMode === 'voice') {
    posts = posts.filter((p) => !!p.voiceUrl);
  } else if (currentFeedMode === 'saved') {
    const savedIds = JSON.parse(localStorage.getItem('remo_saved_posts') || '[]');
    posts = posts.filter((p) => savedIds.includes(p.id));
  }

  if (currentFeedCityFilter !== 'all') {
    posts = posts.filter((p) => p.cityId === currentFeedCityFilter);
  }
  if (currentFeedVibeFilter !== 'all') {
    posts = posts.filter((p) => p.vibe === currentFeedVibeFilter);
  }
  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    posts = posts.filter((p) =>
      (p.caption_en || '').toLowerCase().includes(q) ||
      (p.caption_fr || '').toLowerCase().includes(q) ||
      (p.textCard && (p.textCard.raw || '').toLowerCase().includes(q)) ||
      (p.authorName || '').toLowerCase().includes(q) ||
      (p.cityId || '').toLowerCase().includes(q)
    );
  }
  return posts;
}

const FEED_BATCH_SIZE = 12;
let _feedVisibleLimit = FEED_BATCH_SIZE;
let _lastFeedFilterKey = '';
let _lastFeedBaseCtx = '';
let _feedAutoPrefetchCount = 0;
let _feedSentinelObserver = null;
let _feedScrollListenersBound = false;
let _feedScrollRafId = 0;
let _feedInfiniteBusy = false;
let _feedKnownFirstPostId = '';
let _feedNewTopArrivedCount = 0;
window._renderedFeedPostIds = [];
window._renderedCardSigs = {};

function computeVisibleFeedSignature(searchQuery = '', prefilteredPosts = null) {
  const lang = REMO_I18N.getLang();
  const u = REMO_STORE.getCurrentUser();
  const isAdm = REMO_STORE.isAdminUnlocked();
  const posts = prefilteredPosts || getFilteredSortedFeedPosts(searchQuery).slice(0, _feedVisibleLimit);
  return `${lang}_${isAdm ? 1 : 0}_${u?.uid || 'guest'}_${u?.homeCity || ''}_${currentFeedMode}_${currentFeedCityFilter}_${currentFeedVibeFilter}_${searchQuery || ''}_${posts.length}::` +
    posts.map((p) => computePostRenderSig(p, u, lang)).join('|');
}

let _desktopFeedMode = (function () {
  try {
    return localStorage.getItem('remo_desktop_feed_mode') === 'grid' ? 'grid' : 'stage';
  } catch (e) {
    return 'stage';
  }
})();
let _desktopRightTab = (function () {
  try {
    const t = localStorage.getItem('remo_desktop_right_tab');
    return ['cup', 'tv', 'id'].includes(t) ? t : 'cup';
  } catch (e) {
    return 'cup';
  }
})();
let _desktopRightHidden = (function () {
  try {
    return localStorage.getItem('remo_desktop_right_hidden') === '1';
  } catch (e) {
    return false;
  }
})();
let _lastDesktopRailRenderSig = '';
let _railScrollTickScheduled = false;

function isDesktopFeedStageActive() {
  const vf = document.getElementById('view-feed');
  return Boolean(window.innerWidth > 860 && _desktopFeedMode === 'stage' && vf && vf.classList.contains('active'));
}
window.isDesktopFeedStageActive = isDesktopFeedStageActive;

function setDesktopFeedMode(mode) {
  _desktopFeedMode = mode === 'grid' ? 'grid' : 'stage';
  try { localStorage.setItem('remo_desktop_feed_mode', _desktopFeedMode); } catch (e) {}
  syncDesktopStageLayoutUI();
  if (_desktopFeedMode === 'stage') {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }
  scheduleInfiniteFeedCheck();
}
window.setDesktopFeedMode = setDesktopFeedMode;

function setDesktopRightTab(tab) {
  _desktopRightTab = ['cup', 'tv', 'id'].includes(tab) ? tab : 'cup';
  try { localStorage.setItem('remo_desktop_right_tab', _desktopRightTab); } catch (e) {}
  document.querySelectorAll('.rr-tab[data-rr-tab]').forEach((b) => {
    b.classList.toggle('active', b.getAttribute('data-rr-tab') === _desktopRightTab);
  });
  const paneMap = { cup: 'rightPaneCup', tv: 'rightPaneTv', id: 'rightPaneId' };
  Object.keys(paneMap).forEach((k) => {
    document.getElementById(paneMap[k])?.classList.toggle('active', k === _desktopRightTab);
  });
}
window.setDesktopRightTab = setDesktopRightTab;

function toggleDesktopRightRail(forceShow) {
  _desktopRightHidden = typeof forceShow === 'boolean' ? !forceShow : !_desktopRightHidden;
  try { localStorage.setItem('remo_desktop_right_hidden', _desktopRightHidden ? '1' : '0'); } catch (e) {}
  syncDesktopStageLayoutUI();
}
window.toggleDesktopRightRail = toggleDesktopRightRail;

function closeTopFeedDrawers(exceptKey = '') {
  if (exceptKey !== 'online' && document.getElementById('cleanFeedOnlineDrawer')?.classList.contains('open')) {
    toggleFeedPresenceDrawer(false);
  }
  if (exceptKey !== 'pulse' && document.getElementById('cleanFeedPulseDrawer')?.classList.contains('open')) {
    if (typeof openCleanFeedPulseDrawer === 'function') openCleanFeedPulseDrawer(false);
  }
  if (exceptKey !== 'filters' && document.getElementById('moreFeedFiltersWrap')?.classList.contains('open')) {
    if (typeof toggleMoreFeedFilters === 'function') toggleMoreFeedFilters(false);
  }
  if (exceptKey !== 'search' && document.getElementById('mobileFeedSearchDrawer')?.classList.contains('open')) {
    toggleMobileFeedSearchBar(false);
  }
}
window.closeTopFeedDrawers = closeTopFeedDrawers;

function toggleFeedPresenceDrawer(forceState) {
  const drawer = document.getElementById('cleanFeedOnlineDrawer');
  const btn = document.getElementById('feedOnlineToggleBtn');
  if (!drawer) return;
  const next = typeof forceState === 'boolean' ? forceState : !drawer.classList.contains('open');
  if (next) {
    closeTopFeedDrawers('online');
  }
  drawer.classList.toggle('open', next);
  if (btn) btn.classList.toggle('active', next);
  if (next && typeof renderLivePresenceStrip === 'function') {
    renderLivePresenceStrip();
  }
}
window.toggleFeedPresenceDrawer = toggleFeedPresenceDrawer;

function handleFeedSearchInput(val) {
  const desk = document.getElementById('desktopHeaderSearchInp');
  const mob = document.getElementById('mobileFeedSearchInp');
  if (desk && desk.value !== val) desk.value = val;
  if (mob && mob.value !== val) mob.value = val;
  renderSocialFeed(val);
}
window.handleFeedSearchInput = handleFeedSearchInput;

function toggleMobileFeedSearchBar(forceState) {
  const drawer = document.getElementById('mobileFeedSearchDrawer');
  const btn = document.getElementById('btnMobileSearchToggle');
  if (!drawer) return;
  const next = typeof forceState === 'boolean' ? forceState : !drawer.classList.contains('open');
  if (next) {
    closeTopFeedDrawers('search');
  }
  drawer.classList.toggle('open', next);
  if (btn) btn.classList.toggle('active', next);
  if (next) {
    setTimeout(() => document.getElementById('mobileFeedSearchInp')?.focus(), 60);
  }
}
window.toggleMobileFeedSearchBar = toggleMobileFeedSearchBar;

function clearAndCloseMobileSearch() {
  const mob = document.getElementById('mobileFeedSearchInp');
  const hadText = Boolean(mob && mob.value.trim());
  if (hadText) handleFeedSearchInput('');
  toggleMobileFeedSearchBar(false);
}
window.clearAndCloseMobileSearch = clearAndCloseMobileSearch;

function openRemoQuickGuideModal() {
  const modal = document.getElementById('remoQuickGuideModal');
  if (!modal) return;
  if (typeof REMO_I18N !== 'undefined' && REMO_I18N.applyDOM) REMO_I18N.applyDOM(modal);
  modal.classList.add('open');
}
window.openRemoQuickGuideModal = openRemoQuickGuideModal;

function closeRemoQuickGuideModal() {
  document.getElementById('remoQuickGuideModal')?.classList.remove('open');
}
window.closeRemoQuickGuideModal = closeRemoQuickGuideModal;

function dismissStageOnboardingHint() {
  const el = document.getElementById('stageOnboardingHint');
  if (el) el.style.display = 'none';
  try { localStorage.setItem('remo_stage_hint_seen', '1'); } catch (e) {}
}
window.dismissStageOnboardingHint = dismissStageOnboardingHint;

function getStagePostCards() {
  return Array.from(document.querySelectorAll('#remoPostsGrid .post-card'));
}

function getActiveDesktopStageCardIndex() {
  const grid = document.getElementById('remoPostsGrid');
  const cards = getStagePostCards();
  if (!grid || !cards.length) return 0;
  if (!isDesktopFeedStageActive() && window.innerWidth > 860) return 0;
  const curTop = grid.scrollTop || 0;
  let bestIdx = 0;
  let bestDist = Infinity;
  for (let i = 0; i < cards.length; i++) {
    const dist = Math.abs((cards[i].offsetTop || 0) - curTop);
    if (dist < bestDist) {
      bestDist = dist;
      bestIdx = i;
    }
  }
  return bestIdx;
}

function stepDesktopStagePost(delta) {
  const grid = document.getElementById('remoPostsGrid');
  const cards = getStagePostCards();
  if (!grid || !cards.length) return;
  const curIdx = getActiveDesktopStageCardIndex();
  const nextIdx = Math.max(0, Math.min(cards.length - 1, curIdx + delta));
  const target = cards[nextIdx];
  if (!target) return;
  dismissStageOnboardingHint();
  grid.scrollTo({ top: target.offsetTop || 0, behavior: 'smooth' });
  if (nextIdx >= cards.length - 3) {
    triggerInfiniteFeedLoad(true);
  }
  setTimeout(() => syncDesktopStageRail(true), 120);
  setTimeout(() => syncDesktopStageRail(true), 360);
}
window.stepDesktopStagePost = stepDesktopStagePost;

function syncDesktopStageLayoutUI() {
  const stageActive = isDesktopFeedStageActive();
  document.body.classList.toggle('desktop-stage-active', stageActive);
  document.body.classList.toggle('desktop-right-hidden', Boolean(window.innerWidth > 860 && _desktopRightHidden));

  const btnStage = document.getElementById('btnDesktopStageMode');
  const btnGrid = document.getElementById('btnDesktopGridMode');
  if (btnStage) btnStage.classList.toggle('active', _desktopFeedMode === 'stage');
  if (btnGrid) btnGrid.classList.toggle('active', _desktopFeedMode === 'grid');

  const reopenPill = document.getElementById('reopenRightRailPill');
  if (reopenPill) {
    reopenPill.style.display = (window.innerWidth > 860 && _desktopRightHidden) ? 'inline-flex' : 'none';
  }

  setDesktopRightTab(_desktopRightTab);

  const hintEl = document.getElementById('stageOnboardingHint');
  if (hintEl) {
    let seen = false;
    try { seen = localStorage.getItem('remo_stage_hint_seen') === '1'; } catch (e) {}
    hintEl.style.display = (stageActive && !seen && getStagePostCards().length > 1) ? 'inline-flex' : 'none';
  }

  syncDesktopStageRail(true);
}
window.syncDesktopStageLayoutUI = syncDesktopStageLayoutUI;

function syncDesktopStageRail(forceUpdate = false) {
  const rail = document.getElementById('desktopStageRail');
  if (!rail) return;
  if (!isDesktopFeedStageActive()) {
    rail.style.display = 'none';
    _lastDesktopRailRenderSig = '';
    return;
  }

  const cards = getStagePostCards();
  if (!cards.length) {
    rail.style.display = 'none';
    _lastDesktopRailRenderSig = '';
    return;
  }
  rail.style.display = 'flex';

  const activeIdx = getActiveDesktopStageCardIndex();
  const activeCard = cards[activeIdx];
  const postId = activeCard ? String(activeCard.id || '').replace(/^post_card_/, '') : '';
  const p = findFeedPostById(postId);
  if (!p) return;

  window._activeDesktopStagePostId = p.id;
  const u = REMO_STORE.getCurrentUser();
  const lang = REMO_I18N.getLang();
  const liked = Boolean(u && (p.likes || []).includes(u.uid));
  const isFlipped = Boolean(activeCard?.querySelector('.post-flip-inner')?.classList.contains('flipped'));
  const isPostOwner = Boolean(u && (
    (p.uid && u.uid === p.uid) ||
    (p.authorUid && u.uid === p.authorUid) ||
    (u.email && p.authorEmail && u.email.toLowerCase() === p.authorEmail.toLowerCase()) ||
    (u.name && p.authorName && u.name.trim().toLowerCase() === p.authorName.trim().toLowerCase())
  ));
  const hasMore = Boolean(typeof REMO_STORE !== 'undefined' && REMO_STORE.hasMoreCloudPosts);
  const sig = `${p.id}|${activeIdx}|${cards.length}|${hasMore ? 1 : 0}|${liked ? 1 : 0}|${isFlipped ? 1 : 0}|${(p.likes || []).length}|${(p.comments || []).length}|${p.tipsTotal || 0}|${lang}|${isPostOwner ? 1 : 0}`;
  if (!forceUpdate && sig === _lastDesktopRailRenderSig) return;
  _lastDesktopRailRenderSig = sig;

  const city = getCityById(p.cityId) || { id: 'montreal', flag: '🌍' };
  const authorUser = (REMO_STORE.state.users || []).find((usr) => usr && ((p.uid && usr.uid === p.uid) || (p.authorName && usr.name && usr.name.toLowerCase() === p.authorName.toLowerCase())));
  const authorAvatarUrl = p.authorAvatar || (typeof REMO_STORE.getUserAvatar === 'function' ? REMO_STORE.getUserAvatar(p.uid || p.authorName) : '') || (authorUser && authorUser.avatarUrl) || '';

  rail.innerHTML = `
    <div class="dsr-nav-group">
      <button type="button" class="dsr-step-btn" onclick="stepDesktopStagePost(-1)" ${activeIdx <= 0 ? 'disabled' : ''} title="${lang === 'fr' ? 'Publication précédente (↑)' : 'Previous post (↑)'}">▲</button>
      <div class="dsr-counter">${activeIdx + 1}/${cards.length}</div>
      <button type="button" class="dsr-step-btn" onclick="stepDesktopStagePost(1)" ${(activeIdx >= cards.length - 1 && !hasMore) ? 'disabled' : ''} title="${lang === 'fr' ? 'Publication suivante (↓)' : 'Next post (↓)'}">▼</button>
    </div>

    <div class="dsr-actions-group">
      <button type="button" class="dsr-avatar-btn" onclick="${p.isShowcase ? `openFocusTvModal('${escapeJsSingleArg(city.id)}')` : `openCitizenProfileModal('${escapeJsSingleArg(p.uid || '')}', '${escapeJsSingleArg(p.authorName || '')}')`}" title="@${escapeHtmlStr(p.authorName)}">
        ${sanitizeSafeMediaUrl(authorAvatarUrl) ? `<img src="${sanitizeSafeMediaUrl(authorAvatarUrl)}" loading="lazy" decoding="async" alt="${escapeHtmlStr(p.authorName)}">` : `<span>${escapeHtmlStr((p.authorName || 'R')[0].toUpperCase())}</span>`}
        <span class="dsr-avatar-city">${city.flag || '🌍'}</span>
      </button>

      <button type="button" class="dsr-act-btn ${liked ? 'liked' : ''}" onclick="toggleLikePost('${p.id}')" title="Like">
        <span class="dsr-ic">❤️</span>
        <span class="dsr-lbl">${(p.likes || []).length}</span>
      </button>

      <button type="button" class="dsr-act-btn" onclick="openCommentsModal('${p.id}')" title="${lang === 'fr' ? 'Commentaires' : 'Comments'}">
        <span class="dsr-ic">💬</span>
        <span class="dsr-lbl">${(p.comments || []).length}</span>
      </button>

      <button type="button" class="dsr-act-btn" onclick="tipPostAuthor('${p.id}')" title="${lang === 'fr' ? 'Offrir des Pièces' : 'Tip Coins'}">
        <span class="dsr-ic">🪙</span>
        <span class="dsr-lbl">${p.tipsTotal || 0}</span>
      </button>

      <button type="button" class="dsr-act-btn ${isFlipped ? 'active' : ''}" onclick="flipPost3DCard('${p.id}')" title="${t('post_3d_flip')}">
        <span class="dsr-ic">🔄</span>
        <span class="dsr-lbl">3D</span>
      </button>

      <button type="button" class="dsr-act-btn" onclick="openPostFullscreenMedia('${p.id}')" title="${t('act_fullscreen')}">
        <span class="dsr-ic">⛶</span>
      </button>

      <button type="button" class="dsr-act-btn" onclick="sharePostLink('${p.id}')" title="${lang === 'fr' ? 'Partager' : 'Share'}">
        <span class="dsr-ic">↪</span>
      </button>

      ${isPostOwner ? `
      <button type="button" class="dsr-act-btn is-gold" onclick="openSpotlightForSpecificPost('${p.id}')" title="${escapeHtmlStr(t('wspot_post_btn_sub'))}">
        <span class="dsr-ic">🌟</span>
        <span class="dsr-lbl">#1</span>
      </button>
      ` : ''}

      <button type="button" class="dsr-act-btn" onclick="openPostActionsSheet('${p.id}')" title="${lang === 'fr' ? 'Plus d’options' : 'More'}">
        <span class="dsr-ic">⋯</span>
      </button>
    </div>
  `;
}
window.syncDesktopStageRail = syncDesktopStageRail;

function toggleMobileFeedLayoutMode() {
  document.body.classList.remove('mobile-feed-classic');
  try {
    localStorage.removeItem('remo_mobile_feed_mode');
  } catch (e) {}
}
window.toggleMobileFeedLayoutMode = toggleMobileFeedLayoutMode;

function syncMobileFeedLayoutModeUI() {
  document.body.classList.remove('mobile-feed-classic');
  try {
    localStorage.removeItem('remo_mobile_feed_mode');
  } catch (e) {}
  const btn = document.getElementById('mobileFeedLayoutToggleBtn');
  if (btn) {
    btn.style.display = 'none';
  }
}

function _isMobileGridScrollActive() {
  const grid = document.getElementById('remoPostsGrid');
  if (!grid) return false;
  if (window.innerWidth <= 860 && grid.scrollHeight > grid.clientHeight + 20) return true;
  if (isDesktopFeedStageActive() && grid.scrollHeight > grid.clientHeight + 20) return true;
  return false;
}

function scrollFeedToTop() {
  const grid = document.getElementById('remoPostsGrid');
  _feedNewTopArrivedCount = 0;
  _syncFeedBackToTopPill();
  if (_isMobileGridScrollActive() && grid) {
    grid.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
window.scrollFeedToTop = scrollFeedToTop;

function _syncFeedBackToTopPill() {
  const viewFeed = document.getElementById('view-feed');
  if (!viewFeed) return;
  let pill = document.getElementById('remoFeedBackToTopBtn');
  const isActiveView = viewFeed.classList.contains('active');
  const grid = document.getElementById('remoPostsGrid');
  const scrollPos = _isMobileGridScrollActive() && grid ? grid.scrollTop : (window.scrollY || document.documentElement.scrollTop || 0);
  const threshold = window.innerWidth <= 860 ? 1100 : 1400;
  const stageHiddenUnlessNew = isDesktopFeedStageActive() && _feedNewTopArrivedCount <= 0;
  const shouldShow = Boolean(isActiveView && !stageHiddenUnlessNew && scrollPos > threshold && (window._renderedFeedPostIds || []).length > 4);

  if (!shouldShow) {
    if (pill) pill.style.display = 'none';
    return;
  }
  if (!pill) {
    pill = document.createElement('button');
    pill.id = 'remoFeedBackToTopBtn';
    pill.type = 'button';
    pill.className = 'feed-back-to-top-pill';
    pill.onclick = scrollFeedToTop;
    document.body.appendChild(pill);
  }
  const hasNew = _feedNewTopArrivedCount > 0;
  pill.classList.toggle('has-new', hasNew);
  pill.textContent = hasNew ? REMO_I18N.t('feed_new_posts_pill') : REMO_I18N.t('feed_back_to_top');
  pill.style.display = 'inline-flex';
}

function _ensureFeedSentinelElement(grid) {
  if (!grid) return null;
  let sentinel = document.getElementById('remoFeedInfiniteSentinel');
  if (!sentinel) {
    sentinel = document.createElement('div');
    sentinel.id = 'remoFeedInfiniteSentinel';
    sentinel.className = 'feed-scroll-sentinel is-trigger';
  }
  if (sentinel.parentNode !== grid || grid.lastElementChild !== sentinel) {
    grid.appendChild(sentinel);
  }
  return sentinel;
}

function renderFeedInfiniteSentinel(grid, totalCount, shownCount, lang) {
  document.getElementById('remoFeedLoadMoreBox')?.remove();
  if (!grid) return;
  const existing = document.getElementById('remoFeedInfiniteSentinel');
  if (shownCount <= 0) {
    if (existing) existing.remove();
    return;
  }
  const sentinel = _ensureFeedSentinelElement(grid);
  const hasMoreLocal = shownCount < totalCount;
  const hasMoreCloud = Boolean(typeof REMO_STORE !== 'undefined' && REMO_STORE.hasMoreCloudPosts);
  const isLoadingCloud = Boolean(typeof REMO_STORE !== 'undefined' && REMO_STORE.loadingOlderCloudPosts);

  if (isLoadingCloud) {
    sentinel.className = 'feed-scroll-sentinel is-loading';
    sentinel.innerHTML = `<span class="feed-sentinel-spinner"></span><span>${escapeHtmlStr(REMO_I18N.t('feed_loading_more'))}</span>`;
  } else if (hasMoreLocal || hasMoreCloud) {
    sentinel.className = 'feed-scroll-sentinel is-trigger';
    sentinel.innerHTML = '';
  } else {
    sentinel.className = 'feed-scroll-sentinel is-caught-up';
    const caughtTxt = escapeHtmlStr(REMO_I18N.t('feed_caught_up'));
    const topTxt = escapeHtmlStr(REMO_I18N.t('feed_back_to_top'));
    sentinel.innerHTML = `<div class="feed-caught-up-inner">
      <span>${caughtTxt}</span>
      ${shownCount > 3 ? `<button type="button" class="btn-ghost feed-end-top-btn" onclick="scrollFeedToTop()">${topTxt}</button>` : ''}
    </div>`;
  }
  _observeFeedSentinel(sentinel);
}

function _pauseOffscreenFeedVideos() {
  const grid = document.getElementById('remoPostsGrid');
  if (!grid) return;
  const vh = window.innerHeight || 800;

  // 1. Pause & release heavy buffers on far-offscreen videos, restore when scrolled back near viewport
  grid.querySelectorAll('video').forEach((v) => {
    const r = v.getBoundingClientRect();
    const farOffscreen = (r.bottom < -vh * 3.8 || r.top > vh * 3.8);
    if (r.bottom < -vh * 1.2 || r.top > vh * 2.2) {
      if (!v.paused) {
        try { v.pause(); } catch (e) {}
      }
      if (farOffscreen && v.src && !v.src.startsWith('blob:') && !v.src.startsWith('data:')) {
        if (!v.dataset.deferredSrc) v.dataset.deferredSrc = v.src;
        v.removeAttribute('src');
        try { v.load(); } catch (e) {}
      }
    } else if (v.dataset.deferredSrc && !v.getAttribute('src') && r.bottom >= -vh * 2.6 && r.top <= vh * 2.6) {
      v.src = v.dataset.deferredSrc;
      delete v.dataset.deferredSrc;
    }
  });

  // 2. Suspend offscreen HTML Mini-App iframes so background requestAnimationFrame loops don't burn mobile CPU/RAM
  grid.querySelectorAll('iframe.html-post-frame').forEach((fr) => {
    const r = fr.getBoundingClientRect();
    const pid = fr.getAttribute('data-post-id') || '';
    if (!pid) return;
    if (r.bottom < -vh * 2.2 || r.top > vh * 2.2) {
      if (fr.hasAttribute('srcdoc')) {
        fr.dataset.suspendedHtmlPid = pid;
        fr.removeAttribute('srcdoc');
      }
    } else if (fr.dataset.suspendedHtmlPid && !fr.hasAttribute('srcdoc') && r.bottom >= -vh * 1.8 && r.top <= vh * 1.8) {
      const post = findFeedPostById(fr.dataset.suspendedHtmlPid);
      if (post && post.htmlCode && typeof buildFittedHtmlSrcdoc === 'function') {
        fr.srcdoc = buildFittedHtmlSrcdoc(post.htmlCode, post.id);
      }
      delete fr.dataset.suspendedHtmlPid;
    }
  });

  // 3. Lightweight DOM windowing for 48+ cards (archives cards scrolled far above fold without shifting scrollTop)
  if (typeof isDesktopFeedStageActive === 'function' && isDesktopFeedStageActive()) return;
  const cards = Array.from(grid.children).filter((el) =>
    el.id && el.id.startsWith('post_card_') && (el.classList.contains('post-card') || el.classList.contains('post-card-archived-stub'))
  );
  if (cards.length <= 48) return;
  const lang = REMO_I18N.getLang();
  const u = REMO_STORE.getCurrentUser();
  const isAdm = REMO_STORE.isAdminUnlocked();

  cards.forEach((card) => {
    const r = card.getBoundingClientRect();
    if (card.classList.contains('post-card') && r.bottom < -vh * 4.5 && r.height > 120) {
      const pid = card.id.slice('post_card_'.length);
      const h = Math.round(r.height);
      const stub = document.createElement('div');
      stub.id = card.id;
      stub.className = 'post-card-archived-stub';
      stub.setAttribute('data-archived-post-id', pid);
      stub.style.height = h + 'px';
      stub.style.minHeight = h + 'px';
      card.replaceWith(stub);
    } else if (card.classList.contains('post-card-archived-stub') && r.bottom >= -vh * 3.0 && r.top <= vh * 3.0) {
      const pid = card.getAttribute('data-archived-post-id');
      const post = pid ? findFeedPostById(pid) : null;
      if (post) {
        const wrap = document.createElement('div');
        wrap.innerHTML = renderSinglePostCardHtml(post, lang, u, isAdm);
        const restored = wrap.firstElementChild;
        if (restored) {
          card.replaceWith(restored);
          RemoMediaDB.hydrateDom(restored);
          initAllMysteryBoxCanvases(restored);
        }
      }
    }
  });
}

function _isFeedNearBottom() {
  const grid = document.getElementById('remoPostsGrid');
  if (!grid) return false;
  if (_isMobileGridScrollActive()) {
    const dist = grid.scrollHeight - (grid.scrollTop + grid.clientHeight);
    return dist < Math.max(900, grid.clientHeight * 2.2);
  }
  const rect = grid.getBoundingClientRect();
  return rect.bottom <= (window.innerHeight || 800) + 1100;
}

async function triggerInfiniteFeedLoad(forceNextBatch = false) {
  if (_feedInfiniteBusy) return;
  const viewFeed = document.getElementById('view-feed');
  if (!viewFeed || !viewFeed.classList.contains('active')) return;
  const searchInp = document.querySelector('.header-search input');
  const qStr = searchInp ? searchInp.value : '';
  const posts = getFilteredSortedFeedPosts(qStr);
  const hasMoreLocal = _feedVisibleLimit < posts.length;
  const hasMoreCloud = Boolean(typeof REMO_STORE !== 'undefined' && REMO_STORE.hasMoreCloudPosts);
  if (!hasMoreLocal && !hasMoreCloud) return;
  if (!forceNextBatch && !_isFeedNearBottom()) return;

  _feedInfiniteBusy = true;
  try {
    if (hasMoreLocal) {
      _feedVisibleLimit += FEED_BATCH_SIZE;
      renderSocialFeed(qStr, false);
    }
    const afterShown = Math.min(posts.length, _feedVisibleLimit);
    const remainingBuffer = posts.length - afterShown;
    if (remainingBuffer < 8 && typeof REMO_STORE !== 'undefined' && REMO_STORE.hasMoreCloudPosts && !REMO_STORE.loadingOlderCloudPosts) {
      const grid = document.getElementById('remoPostsGrid');
      if (grid) renderFeedInfiniteSentinel(grid, posts.length, afterShown, REMO_I18N.getLang());
      const curU = REMO_STORE.getCurrentUser();
      const useFilteredQuery = (currentFeedCityFilter !== 'all' || ['html', 'mystery', 'videos', 'photos', 'duets', 'my_city'].includes(currentFeedMode))
        && typeof REMO_STORE.loadFilteredCloudPosts === 'function';
      const fetched = useFilteredQuery
        ? await REMO_STORE.loadFilteredCloudPosts({ cityId: currentFeedCityFilter, mode: currentFeedMode, myCity: curU?.homeCity }, 25)
        : await REMO_STORE.loadOlderCloudPosts(30);
      if (fetched) {
        const latestPosts = getFilteredSortedFeedPosts(qStr);
        if (_feedVisibleLimit < latestPosts.length) {
          _feedVisibleLimit += FEED_BATCH_SIZE;
        }
      }
      renderSocialFeed(qStr, false);
    }
  } finally {
    _feedInfiniteBusy = false;
  }
}

function scheduleInfiniteFeedCheck() {
  if (_feedScrollRafId) return;
  _feedScrollRafId = requestAnimationFrame(() => {
    _feedScrollRafId = 0;
    _syncFeedBackToTopPill();
    _pauseOffscreenFeedVideos();
    if (typeof syncDesktopStageRail === 'function') {
      syncDesktopStageRail(false);
    }
    const g = document.getElementById('remoPostsGrid');
    if (g && g.scrollTop > 40) {
      dismissStageOnboardingHint();
    }
    if (_isFeedNearBottom()) {
      triggerInfiniteFeedLoad(false);
    }
  });
}

function _bindGlobalFeedScrollListeners() {
  if (_feedScrollListenersBound) return;
  _feedScrollListenersBound = true;
  window.addEventListener('scroll', scheduleInfiniteFeedCheck, { passive: true });
  window.addEventListener('resize', () => {
    if (typeof syncDesktopStageLayoutUI === 'function') syncDesktopStageLayoutUI();
    scheduleInfiniteFeedCheck();
  }, { passive: true });
  const grid = document.getElementById('remoPostsGrid');
  if (grid) {
    grid.addEventListener('scroll', scheduleInfiniteFeedCheck, { passive: true });
  }
  window.addEventListener('remo:feedpaging', () => {
    const g = document.getElementById('remoPostsGrid');
    if (g && (window._renderedFeedPostIds || []).length > 0) {
      const searchInp = document.querySelector('.header-search input');
      const total = getFilteredSortedFeedPosts(searchInp ? searchInp.value : '').length;
      renderFeedInfiniteSentinel(g, total, Math.min(total, _feedVisibleLimit), REMO_I18N.getLang());
    }
  });
}

function _observeFeedSentinel(sentinelEl) {
  if (!sentinelEl || typeof IntersectionObserver === 'undefined') return;
  if (_feedSentinelObserver) _feedSentinelObserver.disconnect();
  _feedSentinelObserver = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      triggerInfiniteFeedLoad(true);
    }
  }, { root: null, rootMargin: '1200px 0px', threshold: 0 });
  _feedSentinelObserver.observe(sentinelEl);
}

function loadMoreFeedPosts() {
  triggerInfiniteFeedLoad(true);
}
window.loadMoreFeedPosts = loadMoreFeedPosts;

function renderSocialFeed(searchQuery = '', forceFull = false) {
  _bindGlobalFeedScrollListeners();
  renderStoriesAndBanners();
  if (typeof renderWorldSpotlightBar === 'function') {
    renderWorldSpotlightBar();
  }
  if (typeof renderFeedCitySpotlightBar === 'function') {
    renderFeedCitySpotlightBar();
  }
  if (typeof renderFeedActiveContestsBanner === 'function') {
    renderFeedActiveContestsBanner();
  }
  syncMobileFeedLayoutModeUI();
  const grid = document.getElementById('remoPostsGrid');
  if (!grid) return;

  const lang = REMO_I18N.getLang();
  const qStr = String(searchQuery || '');
  const u = REMO_STORE.getCurrentUser();
  const isAdm = REMO_STORE.isAdminUnlocked();
  const filterKey = `${currentFeedMode}|${currentFeedCityFilter}|${currentFeedVibeFilter}|${qStr.trim().toLowerCase()}`;
  const baseCtx = `${lang}|${isAdm ? 1 : 0}|${u?.uid || 'guest'}|${u?.homeCity || ''}|${filterKey}`;

  if (filterKey !== _lastFeedFilterKey) {
    _lastFeedFilterKey = filterKey;
    _feedVisibleLimit = FEED_BATCH_SIZE;
    _feedAutoPrefetchCount = 0;
    window._renderedFeedPostIds = [];
    window._renderedCardSigs = {};
    _feedKnownFirstPostId = '';
    _feedNewTopArrivedCount = 0;
    if (_isMobileGridScrollActive()) grid.scrollTop = 0;
  }

  const posts = getFilteredSortedFeedPosts(qStr);

  if (posts.length === 0) {
    if (typeof REMO_STORE !== 'undefined' && !REMO_STORE.loadingOlderCloudPosts && (currentFeedMode !== 'all' || currentFeedCityFilter !== 'all') && _feedAutoPrefetchCount < 2) {
      _feedAutoPrefetchCount++;
      const loader = (typeof REMO_STORE.loadFilteredCloudPosts === 'function' && (currentFeedCityFilter !== 'all' || ['html', 'mystery', 'videos', 'photos', 'duets', 'my_city'].includes(currentFeedMode)))
        ? REMO_STORE.loadFilteredCloudPosts({ cityId: currentFeedCityFilter, mode: currentFeedMode, myCity: u?.homeCity }, 25)
        : (REMO_STORE.hasMoreCloudPosts ? REMO_STORE.loadOlderCloudPosts(30) : Promise.resolve(false));
      loader.then((got) => { if (got) renderSocialFeed(qStr, true); });
    }
    window._renderedFeedPostIds = [];
    window._renderedCardSigs = {};
    window._lastRenderedFeedSignature = 'empty_' + lang + '_' + filterKey;
    grid.innerHTML = `<div class="glass-box" style="grid-column:1/-1;text-align:center;padding:40px;">
      ${lang === 'fr' ? 'Aucun moment trouvé pour ce filtre. Soyez le premier à publier ! ✨' : 'No moments match this filter yet. Be the first to post! ✨'}
    </div>`;
    renderFeedInfiniteSentinel(grid, 0, 0, lang);
    _syncFeedBackToTopPill();
    return;
  }

  if (window._deepLinkedPostId) {
    const deepIdx = posts.findIndex((x) => x && x.id === window._deepLinkedPostId);
    if (deepIdx < 0 && typeof REMO_STORE !== 'undefined' && typeof REMO_STORE.fetchDeepLinkedPostIfMissing === 'function') {
      REMO_STORE.fetchDeepLinkedPostIfMissing(window._deepLinkedPostId);
    } else if (deepIdx >= _feedVisibleLimit) {
      _feedVisibleLimit = deepIdx + 4;
    }
  }

  const visiblePosts = posts.slice(0, Math.min(posts.length, _feedVisibleLimit));
  const nextIds = visiblePosts.map((p) => p.id);
  const prevIds = window._renderedFeedPostIds || [];
  const nextSig = computeVisibleFeedSignature(qStr, visiblePosts) + `_tot:${posts.length}`;

  if (_feedKnownFirstPostId && nextIds[0] && nextIds[0] !== _feedKnownFirstPostId) {
    const scrollPos = _isMobileGridScrollActive() ? grid.scrollTop : (window.scrollY || 0);
    if (scrollPos > 700) {
      _feedNewTopArrivedCount++;
    }
  }
  _feedKnownFirstPostId = nextIds[0] || '';

  const canIncrementalPatchOrAppend = !forceFull &&
    prevIds.length > 0 &&
    baseCtx === _lastFeedBaseCtx &&
    nextIds.length >= prevIds.length &&
    prevIds.every((id, idx) => id === nextIds[idx]) &&
    Boolean(document.getElementById('post_card_' + prevIds[0]));

  if (canIncrementalPatchOrAppend) {
    if (prevIds.length === nextIds.length && window._lastRenderedFeedSignature === nextSig) {
      renderFeedInfiniteSentinel(grid, posts.length, visiblePosts.length, lang);
      scheduleInfiniteFeedCheck();
      return;
    }
    // 1. In-place patch ONLY existing cards whose content changed (keeps playing videos & scroll smooth!)
    for (let i = 0; i < prevIds.length; i++) {
      const p = visiblePosts[i];
      const newCardSig = computePostRenderSig(p, u, lang);
      if (window._renderedCardSigs[p.id] !== newCardSig) {
        _patchSingleFeedCardElement(p, lang, u, isAdm);
      }
    }
    // 2. Append ONLY newly revealed posts cleanly before the sentinel
    if (visiblePosts.length > prevIds.length) {
      const sentinel = _ensureFeedSentinelElement(grid);
      const newlyVisible = visiblePosts.slice(prevIds.length);
      const tempWrap = document.createElement('div');
      tempWrap.innerHTML = newlyVisible.map((p) => renderSinglePostCardHtml(p, lang, u, isAdm)).join('');
      const addedNodes = Array.from(tempWrap.children);
      addedNodes.forEach((node) => {
        grid.insertBefore(node, sentinel);
        RemoMediaDB.hydrateDom(node);
        initAllMysteryBoxCanvases(node);
      });
      newlyVisible.forEach((p) => {
        window._renderedCardSigs[p.id] = computePostRenderSig(p, u, lang);
      });
    }
    window._renderedFeedPostIds = nextIds;
    window._lastRenderedFeedSignature = nextSig;
    renderFeedInfiniteSentinel(grid, posts.length, visiblePosts.length, lang);
    scheduleInfiniteFeedCheck();
    return;
  }

  _lastFeedBaseCtx = baseCtx;
  window._lastRenderedFeedSignature = nextSig;
  window._renderedFeedPostIds = nextIds;
  window._renderedCardSigs = {};
  visiblePosts.forEach((p) => {
    window._renderedCardSigs[p.id] = computePostRenderSig(p, u, lang);
  });

  grid.innerHTML = visiblePosts.map((p) => renderSinglePostCardHtml(p, lang, u, isAdm)).join('');
  renderFeedInfiniteSentinel(grid, posts.length, visiblePosts.length, lang);

  // Asynchronously attach any IndexedDB video/photo/audio Blobs
  RemoMediaDB.hydrateDom(grid);
  initAllMysteryBoxCanvases(grid);
  if (typeof syncDesktopStageLayoutUI === 'function') {
    syncDesktopStageLayoutUI();
  }
  scheduleInfiniteFeedCheck();
}

function applyHoloTilt(e, cardEl) {
  if (window.innerWidth <= 860 || (typeof isDesktopFeedStageActive === 'function' && isDesktopFeedStageActive())) return;
  const r = cardEl.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width - 0.5;
  const y = (e.clientY - r.top) / r.height - 0.5;
  cardEl.style.transform = `perspective(900px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-3px)`;
}

function resetHoloTilt(cardEl) {
  cardEl.style.transform = '';
}

function setFeedMode(mode, chipEl) {
  currentFeedMode = mode;
  currentFeedCityFilter = 'all';

  // Always reset secondary vibe filter to 'all' when switching category or clicking 'Monde Entier'
  currentFeedVibeFilter = 'all';
  document.querySelectorAll('#feedVibeChips .fchip').forEach((b) => b.classList.remove('active'));
  document.querySelector('#feedVibeChips .fchip:first-child')?.classList.add('active');

  document.querySelectorAll('#feedModeChips .fchip, .more-feed-chips-subrow .fchip').forEach((b) => b.classList.remove('active'));
  if (chipEl) chipEl.classList.add('active');
  renderSocialFeed();
}

function setFeedVibe(vibe, chipEl) {
  if (currentFeedVibeFilter === vibe && vibe !== 'all') {
    // Clicking active vibe toggles it back to 'all'
    currentFeedVibeFilter = 'all';
    document.querySelectorAll('#feedVibeChips .fchip').forEach((b) => b.classList.remove('active'));
    document.querySelector('#feedVibeChips .fchip:first-child')?.classList.add('active');
  } else {
    currentFeedVibeFilter = vibe;
    document.querySelectorAll('#feedVibeChips .fchip').forEach((b) => b.classList.remove('active'));
    if (chipEl) chipEl.classList.add('active');
  }
  renderSocialFeed();
}

function filterFeedByCityFromMap(cityId) {
  currentFeedCityFilter = cityId;
  switchRemoView('feed');
  const c = getCityById(cityId);
  remoToast(`${c.flag} ${getCityName(c, REMO_I18N.getLang())}`);
}

/* ── 3. POST INTERACTIONS: LIKE, COMMENT, TIP, BOOST, SAVE & MINT-AS-CARD ── */
function toggleLikePost(postId) {
  const u = REMO_STORE.getCurrentUser() || REMO_STORE.ensureGuestOrCitizen('Citizen', '', 'montreal');
  const p = findFeedPostById(postId);
  if (!p) return;
  p.likes = p.likes || [];
  const idx = p.likes.indexOf(u.uid);
  if (idx >= 0) {
    p.likes.splice(idx, 1);
  } else {
    p.likes.push(u.uid);
    RemoAudio.play('click');
    RemoAudio.haptic(15);
    if (!p.isShowcase) REMO_STORE.addCityScore(p.cityId, 5);
    if (p.uid && p.uid !== u.uid) {
      REMO_STORE.addNotification({
        toUid: p.uid,
        fromUid: u.uid,
        fromName: u.name,
        fromCity: u.homeCity,
        type: 'like',
        postId: p.id,
        text: REMO_I18N.getLang() === 'fr' ? 'a aimé votre publication ❤️' : 'liked your post ❤️'
      });
    }
  }
  REMO_STORE.syncPostToCloud(p).then((res) => {
    if (res && !res.ok && p._cloudSyncError) {
      rerenderSinglePostCard(p.id);
    }
  });
  REMO_STORE.save(true, 'like');
  rerenderSinglePostCard(p.id);
  syncHeaderAndSidebars();
}

async function retrySyncPostToCloud(postId) {
  const p = findFeedPostById(postId);
  if (!p) return;
  if (typeof REMO_STORE.waitForAuthReady === 'function') {
    await REMO_STORE.waitForAuthReady(1800);
  }
  const curFb = REMO_STORE.fbAuth && REMO_STORE.fbAuth.currentUser;
  if (REMO_STORE.fbAuth && !curFb) {
    remoToast(t('auth_need_signin_post'));
    if (typeof openAuthModal === 'function') openAuthModal(false);
    return;
  }
  remoToast(t('post_sync_retrying'), 'coin');
  p._cloudSyncPending = true;
  const res = await REMO_STORE.syncPostToCloud(p);
  if (res && res.ok) {
    REMO_STORE.save(true, 'post_retry_ok');
    rerenderSinglePostCard(p.id);
    remoToast(t('post_sync_ok'), 'fanfare');
  } else {
    rerenderSinglePostCard(p.id);
    remoToast(t('post_cloud_sync_err', { err: (res && (res.code || res.message)) || 'error' }));
  }
}
window.retrySyncPostToCloud = retrySyncPostToCloud;

function tipPostAuthor(postId) {
  const lang = REMO_I18N.getLang();
  if (REMO_STORE.isCurrentUserBanned()) {
    remoToast(t('auth_err_banned'));
    return;
  }
  const p = findFeedPostById(postId);
  if (!p) return;
  if (p.isShowcase) {
    remoToast(t('showcase_tip_notice'));
    return;
  }
  const u = REMO_STORE.getCurrentUser();
  if (!u) { openAuthModal(); return; }
  const amt = Math.min(10000, Math.floor(Number(prompt(lang === 'fr' ? 'Combien de Pièces REMO offrir ?' : 'How many REMO Coins to tip?', '25'))));
  if (!amt || amt <= 0) return;
  if (!REMO_STORE.addCoins(u.uid, -amt, 10)) {
    remoToast(lang === 'fr' ? 'Pièces REMO insuffisantes !' : 'Not enough REMO Coins!');
    return;
  }
  p.tipsTotal = (p.tipsTotal || 0) + amt;
  if (p.duetOf && p.duetOf.uid) {
    const half = Math.ceil(amt / 2);
    if (p.uid) REMO_STORE.creditSystemCoins(p.uid, half, 'Duet tip', 10000);
    REMO_STORE.creditSystemCoins(p.duetOf.uid, amt - half, 'Duet tip', 10000);
    remoToast(
      lang === 'fr'
        ? `🎭 +${amt} 🪙 partagés 50/50 entre @${p.authorName} & @${p.duetOf.authorName} !`
        : `🎭 +${amt} 🪙 split 50/50 between @${p.authorName} & @${p.duetOf.authorName}!`,
      'fanfare'
    );
  } else {
    if (p.uid) REMO_STORE.creditSystemCoins(p.uid, amt, 'Post tip', 10000);
    remoToast(lang === 'fr' ? `🪙 +${amt} Pièces offertes à ${p.authorName} !` : `🪙 Tipped ${amt} Coins to ${p.authorName}!`, 'coin');
  }
  if (p.uid && p.uid !== u.uid) {
    REMO_STORE.addNotification({
      toUid: p.uid,
      fromUid: u.uid,
      fromName: u.name,
      fromCity: u.homeCity,
      type: 'tip',
      postId: p.id,
      tipAmount: amt,
      text: lang === 'fr' ? `vous a offert un pourboire de +${amt} 🪙 !` : `tipped you +${amt} 🪙!`
    });
  }
  REMO_STORE.syncPostToCloud(p);
  REMO_STORE.save(true, 'tip');
  spawnRemoCoinsFX(8);
  syncHeaderAndSidebars();
  rerenderSinglePostCard(p.id);
}

function _scrollFeedToBoostedPost(postId) {
  setTimeout(() => {
    const grid = document.getElementById('remoPostsGrid');
    const card = document.getElementById('post_card_' + postId);
    if (grid && _isMobileGridScrollActive()) {
      if (card) {
        grid.scrollTo({ top: card.offsetTop || 0, behavior: 'smooth' });
      } else {
        grid.scrollTo({ top: 0, behavior: 'smooth' });
      }
      setTimeout(() => { if (typeof syncDesktopStageRail === 'function') syncDesktopStageRail(true); }, 180);
      return;
    }
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, 60);
}

function boostPost24h(postId) {
  const lang = REMO_I18N.getLang();
  const isFr = lang === 'fr';
  const u = REMO_STORE.getCurrentUser();
  if (!u || u.role === 'guest') {
    openAuthModal();
    return;
  }
  const isAdm = REMO_STORE.isAdminUnlocked() || REMO_STORE.isCurrentUserAdmin();
  const p = (REMO_STORE.state.posts || []).find((x) => x.id === postId);
  if (!p) return;

  const isPostOwner = Boolean(u && (
    (p.uid && u.uid === p.uid) ||
    (p.authorUid && u.uid === p.authorUid) ||
    (u.email && p.authorEmail && u.email.toLowerCase() === p.authorEmail.toLowerCase()) ||
    (u.name && p.authorName && u.name.trim().toLowerCase() === p.authorName.trim().toLowerCase())
  ));

  if (!isPostOwner && !isAdm) {
    remoToast(isFr
      ? '⚠️ Vous ne pouvez booster que vos propres publications !'
      : '⚠️ You can only boost your own posts!');
    return;
  }

  const cost = isAdm ? 0 : 100;
  if (cost > 0) {
    const curCoins = Number(u.coins || 0);
    if (curCoins < cost) {
      remoToast(isFr
        ? `⚠️ 100 Pièces REMO requises pour booster (vous avez ${curCoins} 🪙) !`
        : `⚠️ 100 REMO Coins required to boost (you have ${curCoins} 🪙)!`);
      return;
    }
    REMO_STORE.addCoins(u.uid, -cost, 20);
  }

  const now = Date.now();
  p.boosted = true;
  p.boostedAt = now;
  p.boostedUpdatedAt = now;
  const baseUntil = (p.boostedUntil && Number(p.boostedUntil) > now) ? Number(p.boostedUntil) : now;
  p.boostedUntil = baseUntil + 86400000;

  if (currentFeedMode === 'trending') {
    currentFeedMode = 'all';
    document.querySelectorAll('#feedModeChips .fchip, .more-feed-chips-subrow .fchip').forEach((b) => b.classList.remove('active'));
    document.querySelector('#feedModeChips .fchip')?.classList.add('active');
  }

  REMO_STORE.syncPostToCloud(p);
  REMO_STORE.save(true, 'boost');
  if (cost > 0) spawnRemoCoinsFX(8);
  syncHeaderAndSidebars();
  renderSocialFeed('', true);
  _scrollFeedToBoostedPost(p.id);
  remoToast(isFr
    ? '🚀 Publication boostée en tête du fil pendant 24h !'
    : '🚀 Post boosted to top of feed for 24h!',
    'fanfare'
  );
}
window.boostPost24h = boostPost24h;

function adminToggleBoostPostInline(postId) {
  const isAdm = REMO_STORE.isAdminUnlocked() || REMO_STORE.isCurrentUserAdmin();
  if (!isAdm) return;
  const lang = REMO_I18N.getLang();
  const isFr = lang === 'fr';
  const p = (REMO_STORE.state.posts || []).find((x) => x.id === postId);
  if (!p) return;

  const now = Date.now();
  if (isPostBoostActive(p)) {
    p.boosted = false;
    p.boostedAt = 0;
    p.boostedUntil = 0;
    p.boostedUpdatedAt = now;
    REMO_STORE.syncPostToCloud(p);
    REMO_STORE.save(true, 'admin_unboost');
    renderSocialFeed('', true);
    remoToast(isFr ? '⏸️ Boost annulé par l’Admin.' : '⏸️ Boost cancelled by Admin.');
  } else {
    p.boosted = true;
    p.boostedAt = now;
    p.boostedUpdatedAt = now;
    p.boostedUntil = now + 86400000;
    if (currentFeedMode === 'trending') {
      currentFeedMode = 'all';
    }
    REMO_STORE.syncPostToCloud(p);
    REMO_STORE.save(true, 'admin_boost');
    renderSocialFeed('', true);
    _scrollFeedToBoostedPost(p.id);
    remoToast(isFr ? '🚀 Publication boostée 24h par l’Admin !' : '🚀 Post boosted 24h by Admin!', 'fanfare');
  }
}
window.adminToggleBoostPostInline = adminToggleBoostPostInline;

function getCurrentPhotoMintMonthKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function hasCitizenUsedMonthlyPhotoCardQuota(u) {
  if (!u || !u.uid) return false;
  const isAdm = REMO_STORE.isAdminUnlocked() || REMO_STORE.isCurrentUserAdmin();
  if (isAdm) return false;
  const monthKey = getCurrentPhotoMintMonthKey();
  let localKey = '';
  try {
    localKey = localStorage.getItem('remo_photo_card_mint_month_' + u.uid) || '';
  } catch (e) {}
  return u.lastPhotoCardMintMonth === monthKey || localKey === monthKey;
}

async function mintPostAsCityCard(postId) {
  const lang = REMO_I18N.getLang();
  const u = REMO_STORE.getCurrentUser();
  const p = findFeedPostById(postId);
  if (!p) return;

  // If this post was already minted into a 4D Card, open/inspect the existing card instead of duplicating!
  if (p.mintedCard) {
    const postPhotoExisting = ['image', 'carousel', 'before_after'].includes(p.mediaType)
      ? (p.mediaUrl || (Array.isArray(p.mediaUrls) && p.mediaUrls[0]) || '')
      : (p.mediaType === 'text_card' && typeof renderTextCardToDataUrl === 'function' ? renderTextCardToDataUrl(p, 0) : '');
    const existing =
      (p.mintedCardId && (REMO_STORE.state.droppedCardsPool || []).find((c) => c && c.id === p.mintedCardId)) ||
      (REMO_STORE.state.droppedCardsPool || []).find(
        (c) => c && c.subtitle && p.authorName && String(c.subtitle).toUpperCase().includes('MOMENT BY ' + String(p.authorName).toUpperCase()) && c.cityId === p.cityId
      ) ||
      p.mintedCardSpec;
    if (existing) {
      if (!existing.customPhotoDataUrl && postPhotoExisting) {
        existing.customPhotoDataUrl = postPhotoExisting;
      }
      if (!existing.postId) existing.postId = p.id;
      if ('_loadedPhotoImg' in existing) delete existing._loadedPhotoImg;
      if ('_loadingPhoto' in existing) delete existing._loadingPhoto;
      if ('_photoFailed' in existing) delete existing._photoFailed;
      inspectCardModal(existing);
      return;
    }
    inspectCardModal({
      id: p.mintedCardId || ('card_post_' + p.id),
      postId: p.id,
      cityId: p.cityId || 'montreal',
      subtitle: `MOMENT BY ${(p.authorName || 'CITIZEN').toUpperCase()}`,
      serial: '0001',
      rarity: 'Legendary Gold',
      coinValue: 9500,
      customPhotoDataUrl: postPhotoExisting,
      ownerUid: p.uid || p.authorUid || '',
      ownerName: p.authorName || 'Citizen'
    });
    return;
  }

  if (!u) {
    remoToast(lang === 'fr' ? '🔒 Connectez-vous pour créer votre Carte 4D !' : '🔒 Sign in to mint your 4D Card!');
    return;
  }

  const isPostOwner = Boolean(
    (p.uid && u.uid === p.uid) ||
    (p.authorUid && u.uid === p.authorUid) ||
    (u.email && p.authorEmail && u.email.toLowerCase() === p.authorEmail.toLowerCase()) ||
    (u.name && p.authorName && u.name.trim().toLowerCase() === p.authorName.trim().toLowerCase())
  );
  if (!isPostOwner) {
    remoToast(
      lang === 'fr'
        ? '🔒 Seul le propriétaire de cette publication peut en faire une Carte 4D !'
        : '🔒 Only the owner of this post can mint it as a 4D Card!'
    );
    return;
  }

  const isAdm = REMO_STORE.isAdminUnlocked() || REMO_STORE.isCurrentUserAdmin();
  const monthKey = getCurrentPhotoMintMonthKey();
  if (!isAdm && hasCitizenUsedMonthlyPhotoCardQuota(u)) {
    remoToast(
      lang === 'fr'
        ? '⏳ Limite atteinte : 1 Carte 4D par mois maximum à partir de vos publications (prochaine le 1er du mois) !'
        : '⏳ Limit reached: maximum 1 4D Card per month from your own posts (next on the 1st of the month)!'
    );
    return;
  }

  const cost = REMO_STORE.state.settings.rewards.mintPostCardCost || 100;
  if (!isAdm && !REMO_STORE.addCoins(u.uid, -cost, 30)) {
    remoToast(lang === 'fr' ? `Il faut ${cost} 🪙 pour convertir en Carte 4D !` : `Need ${cost} 🪙 to mint as a 4D City Card!`);
    return;
  }

  const rawPostPhoto = ['image', 'carousel', 'before_after'].includes(p.mediaType)
    ? (p.mediaUrl || (Array.isArray(p.mediaUrls) && p.mediaUrls[0]) || '')
    : (p.mediaType === 'text_card' && typeof renderTextCardToDataUrl === 'function' ? renderTextCardToDataUrl(p, 0) : '');
  const card = REMO_STORE.mintCardForUser(u.uid, p.cityId, 'Legendary Gold', !!p.verifiedGps, {
    subtitle: `MOMENT BY ${p.authorName.toUpperCase()}`,
    customPhotoDataUrl: rawPostPhoto
  });
  card.postId = p.id;

  p.mintedCard = true;
  p.mintedCardId = card.id;
  p.mintedCardSpec = {
    id: card.id,
    postId: p.id,
    cityId: card.cityId,
    title: card.title || '',
    subtitle: card.subtitle || `MOMENT BY ${p.authorName.toUpperCase()}`,
    serial: card.serial,
    rarity: card.rarity,
    coinValue: card.coinValue,
    customPhotoDataUrl: rawPostPhoto,
    ownerUid: u.uid,
    ownerName: u.name
  };

  if (!isAdm) {
    u.lastPhotoCardMintMonth = monthKey;
    try {
      localStorage.setItem('remo_photo_card_mint_month_' + u.uid, monthKey);
    } catch (e) {}
    REMO_STORE.syncUserToCloud(u);
  }
  REMO_STORE.syncPostToCloud(p);
  REMO_STORE.save(true, 'card_minted', card);

  spawnRemoCoinsFX(10);
  renderSocialFeed();
  inspectCardModal(card);
}

function saveBookmarkPost(postId) {
  const arr = JSON.parse(localStorage.getItem('remo_saved_posts') || '[]');
  if (!arr.includes(postId)) arr.push(postId);
  localStorage.setItem('remo_saved_posts', JSON.stringify(arr));
  remoToast(REMO_I18N.getLang() === 'fr' ? '🔖 Moment sauvegardé !' : '🔖 Moment saved!');
}

function openCommentsModal(postId) {
  activeCommentPostId = postId;
  pendingCommentVoiceKey = '';
  const p = findFeedPostById(postId);
  if (!p) return;
  const lang = REMO_I18N.getLang();
  const isAdm = REMO_STORE.isAdminUnlocked();
  const u = REMO_STORE.getCurrentUser();

  // Populate 4D Card-Flex dropdown from citizen's collection
  const cardSel = document.getElementById('commentCardFlexSelect');
  if (cardSel) {
    const myCards = (REMO_STORE.state.mintedCards || []).filter((mc) => u && mc.ownerUid === u.uid);
    cardSel.innerHTML = `<option value="">${t('cmt_card_none')}</option>` +
      myCards.map((mc) => {
        const cc = getCityById(mc.cityId);
        const safeRarity = escapeHtmlStr(mc.rarity || 'Mythic 4D');
        return `<option value="${escapeHtmlStr(mc.cityId)}|${safeRarity}">🎴 ${cc.flag} ${escapeHtmlStr(getCityName(cc, lang))} (${escapeHtmlStr(mc.rarity || '4D')})</option>`;
      }).join('');
  }
  const stEl = document.getElementById('commentVoiceReadyStatus');
  if (stEl) stEl.textContent = '';

  const list = document.getElementById('commentsModalList');
  if (list) {
    const sorted = (p.comments || []).slice().sort((a, b) => (Number(b.superTip || 0) - Number(a.superTip || 0)) || ((b.createdAt || 0) - (a.createdAt || 0)));
    list.innerHTML = sorted.map((c) => {
      const tip = Number(c.superTip || 0);
      const vUrl = c.voiceUrl ? RemoMediaDB.resolveSyncOrPlaceholder(c.voiceUrl) : '';
      const vIdb = c.voiceUrl && String(c.voiceUrl).startsWith('idb://') ? `data-idb-src="${c.voiceUrl}"` : '';
      const flexCity = c.flexCardCityId ? getCityById(c.flexCardCityId) : null;
      const dual = c.text ? REMO_TRANSLATOR.makeBilingualPair(c.text) : null;
      const altTxt = dual ? (lang === 'fr' ? dual.fr : dual.en) : '';
      const cUser = (REMO_STORE.state.users || []).find((usr) => usr && ((c.uid && usr.uid === c.uid) || (c.author && usr.name && usr.name.toLowerCase() === c.author.toLowerCase())));
      const cAvatarUrl = c.authorAvatar || (cUser && cUser.avatarUrl) || '';
      return `
        <div class="${tip > 0 ? 'super-comment-card' : ''}" style="padding:10px 12px;border-radius:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);margin-bottom:8px;display:flex;justify-content:space-between;align-items:start;gap:8px;">
          <div style="flex:1;">
            <div style="display:flex;align-items:center;gap:7px;flex-wrap:wrap;">
              <div class="avatar-circle" style="width:24px;height:24px;font-size:0.7rem;flex-shrink:0;overflow:hidden;padding:0;">
                ${sanitizeSafeMediaUrl(cAvatarUrl) ? `<img src="${sanitizeSafeMediaUrl(cAvatarUrl)}" loading="lazy" decoding="async" style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block;" alt="${escapeHtmlStr(c.author)}">` : escapeHtmlStr((c.author || 'R')[0].toUpperCase())}
              </div>
              <b style="color:#38bdf8;font-size:0.83rem;cursor:pointer;" onclick="document.getElementById('commentsModal').classList.remove('open');openDirectChatWithUser('${escapeJsSingleArg(c.uid || '')}')">@${escapeHtmlStr(c.author)} 💌</b>
              ${tip > 0 ? `<span class="surge-mini-pill">💎 +${tip} 🪙 ${t('cmt_super_badge')}</span>` : ''}
            </div>
            ${c.text ? `<div style="font-size:0.86rem;margin-top:4px;color:#f8fafc;">${escapeHtmlStr(c.text)}</div>` : ''}
            ${altTxt && altTxt.toLowerCase() !== String(c.text || '').toLowerCase() ? `<div style="font-size:0.74rem;color:#94a3b8;margin-top:2px;">🌐 ${escapeHtmlStr(altTxt)}</div>` : ''}
            ${c.voiceUrl ? `<audio src="${sanitizeSafeMediaUrl(vUrl)}" ${vIdb} controls style="width:100%;height:30px;margin-top:5px;"></audio>` : ''}
            ${flexCity ? `
              <div>
                <button type="button" class="cmt-card-flex-pill" onclick="inspectCommentFlexCard('${escapeJsSingleArg(flexCity.id)}', '${escapeJsSingleArg(c.flexCardRarity || 'Mythic 4D')}')">
                  🎴 ${flexCity.flag} ${escapeHtmlStr(getCityName(flexCity, lang))} · ${escapeHtmlStr(c.flexCardRarity || '4D')}
                </button>
              </div>
            ` : ''}
          </div>
          ${isAdm ? `<button type="button" class="adm-pbtn danger" onclick="adminDeleteCommentInline('${escapeJsSingleArg(p.id)}', '${escapeJsSingleArg(c.id)}')">🗑️</button>` : ''}
        </div>
      `;
    }).join('') || `<div style="color:var(--muted);text-align:center;padding:18px;">—</div>`;
    RemoMediaDB.hydrateDom(list);
  }
  document.getElementById('commentsModal')?.classList.add('open');
}

function inspectCommentFlexCard(cityId, rarity) {
  document.getElementById('commentsModal')?.classList.remove('open');
  if (typeof inspectCardModal === 'function') {
    inspectCardModal({ cityId, rarity: rarity || 'Mythic 4D', serial: 'FLEX', verifiedGps: true });
  }
}

async function toggleCommentVoiceRecord() {
  const lang = REMO_I18N.getLang();
  const btn = document.getElementById('btnCommentVoice');
  const stEl = document.getElementById('commentVoiceReadyStatus');

  if (commentVoiceRecorder && commentVoiceRecorder.state === 'recording') {
    commentVoiceRecorder.stop();
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const chunks = [];
    commentVoiceRecorder = new MediaRecorder(stream);
    commentVoiceRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
    commentVoiceRecorder.onstop = async () => {
      stream.getTracks().forEach((tr) => tr.stop());
      const blob = new Blob(chunks, { type: 'audio/webm' });
      pendingCommentVoiceKey = await RemoMediaDB.saveBlob(blob, 'cmt_voice');
      if (btn) btn.textContent = t('cmt_voice_btn');
      if (stEl) stEl.textContent = lang === 'fr' ? '✓ Vocal 15s prêt à publier !' : '✓ 15s Voice Reply ready!';
    };
    commentVoiceRecorder.start();
    if (btn) btn.textContent = t('cmt_voice_stop');
    setTimeout(() => {
      if (commentVoiceRecorder && commentVoiceRecorder.state === 'recording') commentVoiceRecorder.stop();
    }, 15000);
  } catch (e) {
    // Graceful synthesized voice-wave fallback when testing without a connected mic
    pendingCommentVoiceKey = RemoAudio.createSynthVoiceWavDataUrl(2.2);
    RemoAudio.play('roger');
    if (stEl) stEl.textContent = lang === 'fr' ? '✓ Onde Vocale Cyber prête !' : '✓ Cyber Voice Note ready!';
  }
}

function submitPostComment() {
  const lang = REMO_I18N.getLang();
  if (REMO_STORE.isCurrentUserBanned()) {
    remoToast(t('auth_err_banned'));
    return;
  }
  const inp = document.getElementById('commentInputBox');
  const txt = inp ? inp.value.trim() : '';
  const tipAmt = Math.min(10000, Math.max(0, Math.floor(Number(document.getElementById('commentSuperTipSel')?.value || 0))));
  const flexRaw = document.getElementById('commentCardFlexSelect')?.value || '';
  if (!activeCommentPostId || (!txt && !pendingCommentVoiceKey && !flexRaw)) return;

  const u = REMO_STORE.getCurrentUser() || REMO_STORE.ensureGuestOrCitizen('Citizen', '', 'montreal');
  const p = findFeedPostById(activeCommentPostId);
  if (!p) return;

  if (tipAmt > 0 && !p.isShowcase) {
    if (!REMO_STORE.addCoins(u.uid, -tipAmt, 10)) {
      remoToast(lang === 'fr' ? `Il faut ${tipAmt} 🪙 pour ce Super-Commentaire !` : `Need ${tipAmt} 🪙 for this Super-Comment!`);
      return;
    }
    p.tipsTotal = (p.tipsTotal || 0) + tipAmt;
    if (p.uid) REMO_STORE.creditSystemCoins(p.uid, tipAmt, 'Super-comment tip', 10000);
    spawnRemoCoinsFX(10);
  } else if (!p.isShowcase) {
    REMO_STORE.addCoins(u.uid, 5, 5);
  } else {
    remoToast(t('showcase_comment_notice'));
  }

  const [flexCardCityId, flexCardRarity] = flexRaw ? flexRaw.split('|') : ['', ''];
  p.comments = p.comments || [];
  p.comments.push({
    id: 'c_' + Date.now(),
    uid: u.uid,
    author: u.name,
    authorAvatar: u.avatarUrl || '',
    cityId: u.homeCity,
    text: txt,
    voiceUrl: pendingCommentVoiceKey || '',
    superTip: tipAmt,
    flexCardCityId: flexCardCityId || '',
    flexCardRarity: flexCardRarity || '',
    createdAt: Date.now()
  });

  if (p.uid && p.uid !== u.uid) {
    const cmtPreview = txt ? (txt.length > 50 ? txt.slice(0, 47) + '...' : txt) : (pendingCommentVoiceKey ? '🎤 Voice' : 'Super-Comment');
    REMO_STORE.addNotification({
      toUid: p.uid,
      fromUid: u.uid,
      fromName: u.name,
      fromCity: u.homeCity,
      type: 'comment',
      postId: p.id,
      rawPreview: cmtPreview,
      text: lang === 'fr' ? `a commenté : "${cmtPreview}"` : `commented: "${cmtPreview}"`
    });
  }

  if (inp) inp.value = '';
  const tipSel = document.getElementById('commentSuperTipSel');
  if (tipSel) tipSel.value = '0';
  pendingCommentVoiceKey = '';
  REMO_STORE.syncPostToCloud(p);
  REMO_STORE.save(true, 'comment');
  syncHeaderAndSidebars();
  openCommentsModal(activeCommentPostId);
  renderSocialFeed();
}

/* ── 3B. INTERACTIVE FEED POWER-UPS: HTML CODE, REMIX, CAROUSEL, SLIDER, POLLS & CAPSULES ── */
function handleMediaDoubleTap(ev, postId, wrapEl) {
  if (ev && ev.target && (['IFRAME', 'INPUT', 'BUTTON', 'A'].includes(ev.target.tagName) || (ev.target.closest && ev.target.closest('button, a, .carousel-nav-btn, .carousel-dot')))) return;
  const heart = document.createElement('div');
  heart.className = 'dbl-heart-burst';
  heart.textContent = '❤️';
  wrapEl.appendChild(heart);
  setTimeout(() => heart.remove(), 800);

  const u = REMO_STORE.getCurrentUser() || REMO_STORE.ensureGuestOrCitizen('Citizen', '', 'montreal');
  const p = findFeedPostById(postId);
  if (p && !(p.likes || []).includes(u.uid)) {
    toggleLikePost(postId);
  } else {
    RemoAudio.play('click');
  }
}

function toggleHtmlCodeView(postId, btnEl) {
  const pre = document.getElementById('htmlCodeView_' + postId);
  if (!pre) return;
  const open = pre.classList.toggle('open');
  if (btnEl) btnEl.textContent = open ? t('act_live_app') : t('act_view_code');
}

let currentFullscreenPostId = null;
window._activeViralSharePostId = null;

function getEffectiveTextCardRecipient(post) {
  if (!post || post.mediaType !== 'text_card') return '';
  const fromUrlMap = (window._deepLinkedRecipientByPost && post.id) ? window._deepLinkedRecipientByPost[post.id] : '';
  const stored = (post.textCard && post.textCard.dedicatedTo) ? post.textCard.dedicatedTo : '';
  return String(fromUrlMap || stored || '').replace(/[\r\n<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 32);
}

function getViralPostShareData(postId) {
  const lang = REMO_I18N.getLang();
  const isFr = lang === 'fr';
  const post = findFeedPostById(postId);
  const u = REMO_STORE.getCurrentUser();
  const refCode = (u && (u.referralCode || u.passportNum)) ? String(u.referralCode || ('REMO-' + u.passportNum)) : '';
  const cleanId = encodeURIComponent(postId || '');
  let baseOrigin = (window.location && window.location.origin && window.location.origin !== 'null') ? window.location.origin : 'https://remoworld.com';
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    baseOrigin = 'https://remoworld.com';
  }
  const tcTo = post ? getEffectiveTextCardRecipient(post) : '';
  const toParam = tcTo ? `&to=${encodeURIComponent(tcTo)}` : '';
  const refParam = refCode ? `&ref=${encodeURIComponent(refCode)}` : '';
  const url = `${baseOrigin}/?post=${cleanId}${toParam}${refParam}#post_${cleanId}`;

  let title = 'REMO World 🌐 4D World Cities';
  let shareText = isFr
    ? '🌐 Découvre ce moment en direct sur REMO World et gagne +100 🪙 !'
    : '🌐 Check out this live city moment on REMO World & claim +100 🪙!';

  if (post && post.versus) {
    const cA = getCityById(post.versus.leftCityId || 'montreal');
    const cB = getCityById(post.versus.rightCityId || 'paris');
    const nA = getCityName(cA, lang);
    const nB = getCityName(cB, lang);
    title = `⚔️ ${cA.flag} ${nA} vs ${cB.flag} ${nB} — REMO City Duel`;
    shareText = isFr
      ? `⚔️ Duel des Villes en direct : ${cA.flag} ${nA} vs ${cB.flag} ${nB} sur REMO World ! Vote pour notre ville (+10 🪙) 👉`
      : `⚔️ Live City Duel: ${cA.flag} ${nA} vs ${cB.flag} ${nB} on REMO World! Vote for our city (+10 🪙) 👉`;
  } else if (post) {
    const city = getCityById(post.cityId || 'montreal');
    const mysteryMasked = _isTextCardMysteryMasked(post);
    const locLabel = mysteryMasked ? t('tc_guess_masked_loc') : `${city.flag} ${getCityName(city, lang)}`;
    const cap = isFr ? (post.caption_fr || post.caption_en || '') : (post.caption_en || post.caption_fr || '');
    const tcPages = (post.mediaType === 'text_card' && post.textCard) ? _getTextCardSpecPages(post.textCard) : [];
    const tcActiveTxt = tcPages.length
      ? (tcPages[((_carouselState[post.id] || 0) % tcPages.length + tcPages.length) % tcPages.length] || '').replace(/\s+/g, ' ').trim()
      : '';
    const effectiveCap = cap || tcActiveTxt;
    const shortCap = effectiveCap.length > 90 ? effectiveCap.slice(0, 87) + '...' : effectiveCap;
    const toTag = tcTo ? (isFr ? `🎁 Pour ${tcTo} · ` : `🎁 For ${tcTo} · `) : '';
    title = `${toTag}${locLabel} • @${post.authorName || 'Citizen'} on REMO World`;
    shareText = shortCap
      ? `${toTag}${locLabel} — "${shortCap}" 🌐 REMO World 👉`
      : `${toTag}${isFr ? `${locLabel} en direct sur REMO World 👉` : `${locLabel} live on REMO World 👉`}`;
  }

  return { post, url, title, shareText, lang, isFr, u };
}

function rewardViralShareOnce(postId) {
  if (!postId) return;
  const key = 'remo_viral_shared_' + postId;
  if (localStorage.getItem(key)) return;
  localStorage.setItem(key, '1');
  const u = REMO_STORE.getCurrentUser();
  if (u && u.uid) {
    REMO_STORE.addCoins(u.uid, 25, 15);
    REMO_STORE.save(true, 'viral_post_share');
    if (typeof spawnRemoCoinsFX === 'function') spawnRemoCoinsFX(12);
    if (typeof syncHeaderAndSidebars === 'function') syncHeaderAndSidebars();
  }
}

function sharePostLink(postId) {
  window._activeViralSharePostId = postId;
  const modal = document.getElementById('viralPostShareModal');
  if (modal) {
    openViralPostShareModal(postId);
    return;
  }
  const { url, lang } = getViralPostShareData(postId);
  copyPostUrlToClipboard(url, lang);
}

/* ── 🌐 UNIVERSAL MULTI-NETWORK SHARE HUB & PURE-JS QR GENERATOR (v121) ── */
const REMO_QR = (function () {
  // ISO/IEC 18004 Byte-Mode QR Encoder (ECC Level L, Versions 1..10, max ~271 UTF-8 bytes)
  const VER_TABLE = [
    null,
    { size: 21, totalData: 19, ec: 7, g1b: 1, g1d: 19, g2b: 0, g2d: 0, rem: 0, align: [] },
    { size: 25, totalData: 34, ec: 10, g1b: 1, g1d: 34, g2b: 0, g2d: 0, rem: 7, align: [6, 18] },
    { size: 29, totalData: 55, ec: 15, g1b: 1, g1d: 55, g2b: 0, g2d: 0, rem: 7, align: [6, 22] },
    { size: 33, totalData: 80, ec: 20, g1b: 1, g1d: 80, g2b: 0, g2d: 0, rem: 7, align: [6, 26] },
    { size: 37, totalData: 108, ec: 26, g1b: 1, g1d: 108, g2b: 0, g2d: 0, rem: 7, align: [6, 30] },
    { size: 41, totalData: 136, ec: 18, g1b: 2, g1d: 68, g2b: 0, g2d: 0, rem: 7, align: [6, 34] },
    { size: 45, totalData: 156, ec: 20, g1b: 2, g1d: 78, g2b: 0, g2d: 0, rem: 0, align: [6, 22, 38] },
    { size: 49, totalData: 194, ec: 24, g1b: 2, g1d: 97, g2b: 0, g2d: 0, rem: 0, align: [6, 24, 42] },
    { size: 53, totalData: 232, ec: 30, g1b: 2, g1d: 116, g2b: 0, g2d: 0, rem: 0, align: [6, 26, 46] },
    { size: 57, totalData: 274, ec: 18, g1b: 2, g1d: 68, g2b: 2, g2d: 69, rem: 0, align: [6, 28, 50] }
  ];

  const GF_EXP = new Uint8Array(512);
  const GF_LOG = new Uint8Array(256);
  (() => {
    let x = 1;
    for (let i = 0; i < 255; i++) {
      GF_EXP[i] = x;
      GF_LOG[x] = i;
      x = (x << 1) ^ (x & 0x80 ? 0x11d : 0);
    }
    for (let i = 255; i < 512; i++) GF_EXP[i] = GF_EXP[i - 255];
  })();

  function gfMul(a, b) {
    if (a === 0 || b === 0) return 0;
    return GF_EXP[GF_LOG[a] + GF_LOG[b]];
  }

  function rsGeneratorPoly(deg) {
    let poly = [1];
    for (let i = 0; i < deg; i++) {
      const next = new Array(poly.length + 1).fill(0);
      const factor = GF_EXP[i];
      for (let j = 0; j < poly.length; j++) {
        next[j] ^= poly[j];
        next[j + 1] ^= gfMul(poly[j], factor);
      }
      poly = next;
    }
    return poly;
  }

  function rsComputeEc(data, ecCount) {
    const gen = rsGeneratorPoly(ecCount);
    const res = new Array(ecCount).fill(0);
    for (let i = 0; i < data.length; i++) {
      const factor = data[i] ^ res[0];
      res.shift();
      res.push(0);
      if (factor !== 0) {
        for (let j = 0; j < ecCount; j++) {
          res[j] ^= gfMul(gen[j + 1], factor);
        }
      }
    }
    return res;
  }

  function utf8Bytes(str) {
    if (typeof TextEncoder !== 'undefined') {
      return Array.from(new TextEncoder().encode(String(str || '')));
    }
    const enc = unescape(encodeURIComponent(String(str || '')));
    const out = [];
    for (let i = 0; i < enc.length; i++) out.push(enc.charCodeAt(i));
    return out;
  }

  function pickVersion(byteLen) {
    for (let v = 1; v < VER_TABLE.length; v++) {
      const ccBits = v >= 10 ? 16 : 8;
      const capBytes = Math.floor((VER_TABLE[v].totalData * 8 - 4 - ccBits) / 8);
      if (byteLen <= capBytes) return v;
    }
    return -1;
  }

  function bchFormat(mask) {
    const data = (1 << 3) | (mask & 7); // ECC L = 01
    let d = data << 10;
    for (let i = 4; i >= 0; i--) {
      if ((d >>> (i + 10)) & 1) d ^= 0x537 << i;
    }
    return ((data << 10) | d) ^ 0x5412;
  }

  function bchVersion(ver) {
    let d = ver << 12;
    for (let i = 5; i >= 0; i--) {
      if ((d >>> (i + 12)) & 1) d ^= 0x1f25 << i;
    }
    return (ver << 12) | d;
  }

  function encode(text) {
    let bytes = utf8Bytes(text);
    let ver = pickVersion(bytes.length);
    if (ver < 0) {
      bytes = bytes.slice(0, 271);
      ver = 10;
    }
    const spec = VER_TABLE[ver];
    const bits = [];
    const pushBits = (val, n) => {
      for (let i = n - 1; i >= 0; i--) bits.push((val >>> i) & 1);
    };

    pushBits(0b0100, 4); // Byte mode
    pushBits(bytes.length, ver >= 10 ? 16 : 8);
    for (let i = 0; i < bytes.length; i++) pushBits(bytes[i], 8);
    const totalDataBits = spec.totalData * 8;
    pushBits(0, Math.min(4, totalDataBits - bits.length));
    while (bits.length % 8 !== 0) bits.push(0);

    const codewords = [];
    for (let i = 0; i < bits.length; i += 8) {
      let cw = 0;
      for (let b = 0; b < 8; b++) cw = (cw << 1) | bits[i + b];
      codewords.push(cw);
    }
    let padToggle = 0;
    while (codewords.length < spec.totalData) {
      codewords.push(padToggle === 0 ? 0xec : 0x11);
      padToggle ^= 1;
    }

    const dataBlocks = [];
    const ecBlocks = [];
    let offset = 0;
    for (let i = 0; i < spec.g1b; i++) {
      const blk = codewords.slice(offset, offset + spec.g1d);
      offset += spec.g1d;
      dataBlocks.push(blk);
      ecBlocks.push(rsComputeEc(blk, spec.ec));
    }
    for (let i = 0; i < spec.g2b; i++) {
      const blk = codewords.slice(offset, offset + spec.g2d);
      offset += spec.g2d;
      dataBlocks.push(blk);
      ecBlocks.push(rsComputeEc(blk, spec.ec));
    }

    const interleaved = [];
    const maxD = Math.max(spec.g1d, spec.g2d);
    for (let col = 0; col < maxD; col++) {
      for (let b = 0; b < dataBlocks.length; b++) {
        if (col < dataBlocks[b].length) interleaved.push(dataBlocks[b][col]);
      }
    }
    for (let col = 0; col < spec.ec; col++) {
      for (let b = 0; b < ecBlocks.length; b++) interleaved.push(ecBlocks[b][col]);
    }

    const bitStream = [];
    for (let i = 0; i < interleaved.length; i++) {
      const v = interleaved[i];
      for (let b = 7; b >= 0; b--) bitStream.push((v >>> b) & 1);
    }
    for (let i = 0; i < spec.rem; i++) bitStream.push(0);

    const N = spec.size;
    const mods = Array.from({ length: N }, () => new Int8Array(N).fill(-1));
    const isFunc = Array.from({ length: N }, () => new Uint8Array(N));

    const setMod = (r, c, v, fn = false) => {
      if (r < 0 || c < 0 || r >= N || c >= N) return;
      mods[r][c] = v ? 1 : 0;
      if (fn) isFunc[r][c] = 1;
    };

    const drawFinder = (r0, c0) => {
      for (let dr = -1; dr <= 7; dr++) {
        for (let dc = -1; dc <= 7; dc++) {
          const r = r0 + dr;
          const c = c0 + dc;
          if (r < 0 || c < 0 || r >= N || c >= N) continue;
          const dark =
            dr >= 0 && dr <= 6 && dc >= 0 && dc <= 6 &&
            (dr === 0 || dr === 6 || dc === 0 || dc === 6 || (dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4));
          setMod(r, c, dark ? 1 : 0, true);
        }
      }
    };
    drawFinder(0, 0);
    drawFinder(0, N - 7);
    drawFinder(N - 7, 0);

    const al = spec.align;
    for (let i = 0; i < al.length; i++) {
      for (let j = 0; j < al.length; j++) {
        if ((i === 0 && j === 0) || (i === 0 && j === al.length - 1) || (i === al.length - 1 && j === 0)) continue;
        const cr = al[i];
        const cc = al[j];
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            const dark = Math.max(Math.abs(dr), Math.abs(dc)) !== 1;
            setMod(cr + dr, cc + dc, dark ? 1 : 0, true);
          }
        }
      }
    }

    for (let i = 8; i < N - 8; i++) {
      const dark = i % 2 === 0 ? 1 : 0;
      if (!isFunc[6][i]) setMod(6, i, dark, true);
      if (!isFunc[i][6]) setMod(i, 6, dark, true);
    }

    setMod(N - 8, 8, 1, true);
    for (let i = 0; i < 9; i++) {
      if (!isFunc[8][i]) setMod(8, i, 0, true);
      if (!isFunc[i][8]) setMod(i, 8, 0, true);
    }
    for (let i = 0; i < 8; i++) {
      if (!isFunc[8][N - 1 - i]) setMod(8, N - 1 - i, 0, true);
      if (!isFunc[N - 1 - i][8]) setMod(N - 1 - i, 8, 0, true);
    }
    if (ver >= 7) {
      const vBits = bchVersion(ver);
      for (let i = 0; i < 18; i++) {
        const bit = (vBits >>> i) & 1;
        const rBL = N - 11 + (i % 3);
        const cBL = Math.floor(i / 3);
        setMod(rBL, cBL, bit, true);
        setMod(cBL, rBL, bit, true);
      }
    }

    let bitIdx = 0;
    let up = true;
    for (let rightCol = N - 1; rightCol >= 1; rightCol -= 2) {
      if (rightCol === 6) rightCol--;
      for (let step = 0; step < N; step++) {
        const r = up ? N - 1 - step : step;
        for (let k = 0; k < 2; k++) {
          const c = rightCol - k;
          if (!isFunc[r][c]) {
            mods[r][c] = bitIdx < bitStream.length ? bitStream[bitIdx++] : 0;
          }
        }
      }
      up = !up;
    }

    const maskPreds = [
      (r, c) => (r + c) % 2 === 0,
      (r) => r % 2 === 0,
      (r, c) => c % 3 === 0,
      (r, c) => (r + c) % 3 === 0,
      (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0,
      (r, c) => ((r * c) % 2) + ((r * c) % 3) === 0,
      (r, c) => (((r * c) % 2) + ((r * c) % 3)) % 2 === 0,
      (r, c) => (((r + c) % 2) + ((r * c) % 3)) % 2 === 0
    ];

    const applyMaskAndFormat = (grid, mask) => {
      const pred = maskPreds[mask];
      for (let r = 0; r < N; r++) {
        for (let c = 0; c < N; c++) {
          if (!isFunc[r][c] && pred(r, c)) grid[r][c] ^= 1;
        }
      }
      const fmt = bchFormat(mask);
      for (let i = 0; i < 6; i++) grid[8][i] = (fmt >>> (14 - i)) & 1;
      grid[8][7] = (fmt >>> 8) & 1;
      grid[8][8] = (fmt >>> 7) & 1;
      grid[7][8] = (fmt >>> 6) & 1;
      for (let i = 0; i < 6; i++) grid[5 - i][8] = (fmt >>> (5 - i)) & 1;
      for (let i = 0; i < 7; i++) grid[N - 1 - i][8] = (fmt >>> (14 - i)) & 1;
      for (let i = 0; i < 8; i++) grid[8][N - 8 + i] = (fmt >>> (7 - i)) & 1;
    };

    const scorePenalty = (grid) => {
      let pen = 0;
      for (let r = 0; r < N; r++) {
        let runCol = 1;
        let runRow = 1;
        for (let c = 1; c < N; c++) {
          if (grid[r][c] === grid[r][c - 1]) {
            runRow++;
            if (runRow === 5) pen += 3;
            else if (runRow > 5) pen++;
          } else runRow = 1;
          if (grid[c][r] === grid[c - 1][r]) {
            runCol++;
            if (runCol === 5) pen += 3;
            else if (runCol > 5) pen++;
          } else runCol = 1;
        }
      }
      for (let r = 0; r < N - 1; r++) {
        for (let c = 0; c < N - 1; c++) {
          const v = grid[r][c];
          if (v === grid[r][c + 1] && v === grid[r + 1][c] && v === grid[r + 1][c + 1]) pen += 3;
        }
      }
      let darkCount = 0;
      for (let r = 0; r < N; r++) {
        for (let c = 0; c < N; c++) if (grid[r][c]) darkCount++;
      }
      pen += Math.floor(Math.abs(darkCount * 100 / (N * N) - 50) / 5) * 10;
      return pen;
    };

    let bestMask = 0;
    let bestPen = Infinity;
    let bestGrid = null;
    for (let m = 0; m < 8; m++) {
      const clone = mods.map((row) => Int8Array.from(row));
      applyMaskAndFormat(clone, m);
      const p = scorePenalty(clone);
      if (p < bestPen) {
        bestPen = p;
        bestMask = m;
        bestGrid = clone;
      }
    }

    return {
      version: ver,
      size: N,
      mask: bestMask,
      matrix: bestGrid.map((r) => Array.from(r))
    };
  }

  return { encode };
})();

const REMO_SHARE_HUB = (function () {
  const DAILY_CAP_NETS = 4;
  const DAILY_BONUS_COINS = 5;

  function _cleanUrl(url) {
    const raw = String(url || '').trim();
    if (!raw) return 'https://remoworld.com/';
    if (raw.startsWith('http://localhost') || raw.startsWith('http://127.0.0.1')) {
      return raw.replace(/^http:\/\/[^/]+/i, 'https://remoworld.com');
    }
    return raw;
  }

  function _getDefaultTags(context, isFr) {
    if (context === 'blitz') {
      return isFr ? '#REMOWorld #WorldBlitz #DéfiGéo #VillesDuMonde' : '#REMOWorld #WorldBlitz #GeoChallenge #WorldCities';
    }
    if (context === 'focus') {
      return '#REMOWorld #FocusTV #StudyWithMe #LoFi';
    }
    if (context === 'ambassador') {
      return isFr ? '#REMOWorld #Ambassadeur #VillesDuMonde' : '#REMOWorld #CityAmbassador #WorldCities';
    }
    if (context === 'duel') {
      return isFr ? '#REMOWorld #DuelDesVilles #Votez' : '#REMOWorld #CityDuel #WorldCities';
    }
    return isFr ? '#REMOWorld #VillesDuMonde #Voyage4D' : '#REMOWorld #REMOWorldCities #LiveWorld #4DCities';
  }

  function formatCopy(platform, opts = {}) {
    const lang = opts.isFr !== undefined ? (opts.isFr ? 'fr' : 'en') : (REMO_I18N.getLang() === 'fr' ? 'fr' : 'en');
    const isFr = lang === 'fr';
    const url = _cleanUrl(opts.url);
    const title = String(opts.title || 'REMO World 🌐 4D World Cities').trim();
    const baseText = String(opts.shareText || (isFr ? '🌐 Découvre ce moment en direct sur REMO World :' : '🌐 Check out this live city moment on REMO World:')).trim();
    const tags = String(opts.hashtags || _getDefaultTags(opts.context, isFr)).trim();

    if (platform === 'x') {
      const suffix = tags ? ` ${tags}` : '';
      const maxBody = Math.max(80, 240 - suffix.length);
      const body = baseText.length > maxBody ? (baseText.slice(0, maxBody - 3).trim() + '...') : baseText;
      const xTweetText = `${body}${suffix}`.trim();
      return { url, title, tags, body, xTweetText, fullMsg: `${xTweetText}\n${url}` };
    }
    if (platform === 'tiktok' || platform === 'instagram') {
      const cta = isFr ? '🌐 Joue & vote en direct 👉' : '🌐 Join & vote live 👉';
      const cap = `${baseText}\n${cta} ${url}\n\n${tags}`.trim();
      return { url, title, tags, body: baseText, fullMsg: cap, xTweetText: cap };
    }
    const fullMsg = `${baseText}\n${url}${tags ? `\n${tags}` : ''}`.trim();
    return { url, title, tags, body: baseText, fullMsg, xTweetText: fullMsg };
  }

  function drawQrOnCanvas(ctx, text, x, y, boxSize, opts = {}) {
    if (!ctx || !text || boxSize < 36) return;
    try {
      const clean = _cleanUrl(text);
      const qr = REMO_QR.encode(clean);
      const pad = Math.max(4, Math.round(boxSize * 0.065));
      const inner = boxSize - pad * 2;
      const modPx = Math.floor(inner / qr.size);
      const drawnSize = modPx * qr.size;
      const startX = Math.round(x + (boxSize - drawnSize) / 2);
      const startY = Math.round(y + (boxSize - drawnSize) / 2);

      ctx.save();
      const rad = opts.radius !== undefined ? opts.radius : 12;
      ctx.fillStyle = opts.bgColor || '#ffffff';
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') ctx.roundRect(x, y, boxSize, boxSize, rad);
      else ctx.rect(x, y, boxSize, boxSize);
      ctx.fill();

      ctx.strokeStyle = opts.borderColor || '#38bdf8';
      ctx.lineWidth = opts.borderWidth || 2;
      ctx.stroke();

      ctx.fillStyle = opts.fgColor || '#050816';
      for (let r = 0; r < qr.size; r++) {
        for (let c = 0; c < qr.size; c++) {
          if (qr.matrix[r][c]) {
            ctx.fillRect(startX + c * modPx, startY + r * modPx, modPx, modPx);
          }
        }
      }
      ctx.restore();
    } catch (e) {}
  }

  function awardDailyNetworkShareBonus(platform) {
    const cleanNet = String(platform || '').toLowerCase();
    if (!cleanNet || cleanNet === 'download' || cleanNet === 'copy') return { awarded: 0, countToday: 0 };
    try {
      const now = new Date();
      const dayKey = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`;
      const storeKey = `remo_share_net_${dayKey}`;
      const raw = JSON.parse(localStorage.getItem(storeKey) || '[]');
      const list = Array.isArray(raw) ? raw : [];
      if (list.includes(cleanNet) || list.length >= DAILY_CAP_NETS) {
        return { awarded: 0, countToday: list.length };
      }
      list.push(cleanNet);
      localStorage.setItem(storeKey, JSON.stringify(list));
      const u = window.REMO_STORE && typeof window.REMO_STORE.getCurrentUser === 'function'
        ? window.REMO_STORE.getCurrentUser()
        : null;
      if (u && u.uid && typeof window.REMO_STORE.addCoins === 'function') {
        window.REMO_STORE.addCoins(u.uid, DAILY_BONUS_COINS, DAILY_BONUS_COINS);
        if (typeof window.spawnRemoCoinsFX === 'function') window.spawnRemoCoinsFX(4);
        if (typeof window.syncHeaderAndSidebars === 'function') window.syncHeaderAndSidebars();
        return { awarded: DAILY_BONUS_COINS, countToday: list.length };
      }
      return { awarded: 0, countToday: list.length };
    } catch (e) {
      return { awarded: 0, countToday: 0 };
    }
  }

  async function copyTextSafe(txt) {
    const s = String(txt || '');
    if (!s) return false;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(s);
        return true;
      }
    } catch (e) {}
    try {
      const ta = document.createElement('textarea');
      ta.value = s;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return Boolean(ok);
    } catch (e) {
      return false;
    }
  }

  async function copyImageDataUrlToClipboard(dataUrl) {
    if (!dataUrl || !navigator.clipboard || !window.ClipboardItem) return false;
    try {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      return true;
    } catch (e) {
      return false;
    }
  }

  function downloadDataUrl(dataUrl, fileName) {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = fileName || `REMO_Share_${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  async function _resolveVisualDataUrl(opts) {
    if (typeof opts.getDataUrlFn === 'function') {
      try {
        const res = await opts.getDataUrlFn();
        if (res) return res;
      } catch (e) {}
    }
    if (opts.canvas && typeof opts.canvas.toDataURL === 'function') {
      try { return opts.canvas.toDataURL('image/png'); } catch (e) {}
    }
    return '';
  }

  async function recordCanvasVideoLoop(canvas, renderFrameAtT, opts = {}) {
    const isFr = opts.isFr !== undefined ? opts.isFr : (REMO_I18N.getLang() === 'fr');
    if (!canvas || typeof canvas.captureStream !== 'function' || typeof MediaRecorder === 'undefined') {
      if (typeof window.remoToast === 'function') {
        window.remoToast(
          isFr ? '🎥 Export vidéo non supporté sur ce navigateur — utilise 📥 PNG !' : '🎥 Video loop not supported on this browser — use 📥 PNG!',
          'coin'
        );
      }
      return false;
    }
    const candidates = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm', 'video/mp4'];
    const mimeType = candidates.find((m) => MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(m)) || '';
    const durationMs = Number(opts.durationMs || 4500);
    const fileName = opts.fileName || `REMO_Loop_${Date.now()}.webm`;

    if (typeof window.remoToast === 'function') {
      window.remoToast(isFr ? '🎬 Création de la boucle vidéo 5s (TikTok / Reels)...' : '🎬 Rendering 5s video loop (TikTok / Reels)...');
    }

    const stream = canvas.captureStream(30);
    const chunks = [];
    let rec;
    try {
      rec = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
    } catch (e) {
      rec = new MediaRecorder(stream);
    }

    return await new Promise((resolve) => {
      rec.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) chunks.push(ev.data);
      };
      rec.onstop = async () => {
        try {
          const outMime = mimeType || 'video/webm';
          const blob = new Blob(chunks, { type: outMime });
          const ext = outMime.includes('mp4') ? 'mp4' : 'webm';
          const outName = fileName.replace(/\.(webm|mp4)$/i, '') + '.' + ext;
          const urlObj = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = urlObj;
          a.download = outName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(() => { try { URL.revokeObjectURL(urlObj); } catch (e) {} }, 8000);
          if (typeof window.remoToast === 'function') {
            window.remoToast(
              isFr ? '🎥 Boucle vidéo 5s téléchargée pour TikTok / Instagram Reels !' : '🎥 5s video loop downloaded for TikTok / Instagram Reels!',
              'fanfare'
            );
          }
          resolve(true);
        } catch (err) {
          resolve(false);
        }
      };

      try {
        rec.start();
      } catch (startErr) {
        resolve(false);
        return;
      }

      const startTs = performance.now();
      const step = (now) => {
        const elapsed = now - startTs;
        try {
          renderFrameAtT(elapsed / 1000);
        } catch (e) {}
        if (elapsed < durationMs) {
          requestAnimationFrame(step);
        } else {
          try { renderFrameAtT(0); } catch (e) {}
          if (rec.state !== 'inactive') rec.stop();
        }
      };
      requestAnimationFrame(step);
    });
  }

  async function shareToNetwork(platform, opts = {}) {
    const net = String(platform || 'native').toLowerCase();
    const isFr = opts.isFr !== undefined ? opts.isFr : (REMO_I18N.getLang() === 'fr');
    const formatted = formatCopy(net, opts);
    const bonusRes = opts.skipDailyBonus ? { awarded: 0 } : awardDailyNetworkShareBonus(net);
    const netBonusSuffix = bonusRes.awarded > 0 ? ` (+${bonusRes.awarded} 🪙!)` : '';
    const extraSuffix = (opts.extraToastSuffix || '') + netBonusSuffix;

    if (typeof opts.onShared === 'function') {
      try { opts.onShared(net, bonusRes); } catch (e) {}
    }

    if (net === 'native') {
      await copyTextSafe(formatted.fullMsg);
      const dataUrl = await _resolveVisualDataUrl(opts);
      if (navigator.share) {
        try {
          if (dataUrl) {
            const res = await fetch(dataUrl);
            const blob = await res.blob();
            const file = new File([blob], (opts.fileName || 'REMO_Story') + '.png', { type: 'image/png' });
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
              await navigator.share({ files: [file], title: formatted.title, text: formatted.fullMsg });
              if (!opts.suppressToast && typeof window.remoToast === 'function') {
                window.remoToast((isFr ? '📲 Partagé avec image !' : '📲 Shared with image!') + extraSuffix, 'fanfare');
              }
              return true;
            }
          }
          await navigator.share({ title: formatted.title, text: `${formatted.body} ${formatted.tags}`.trim(), url: formatted.url });
          if (!opts.suppressToast && typeof window.remoToast === 'function') {
            window.remoToast((isFr ? '🔗 Lien partagé avec succès !' : '🔗 Shared successfully!') + extraSuffix, 'coin');
          }
          return true;
        } catch (e) {}
      }
      if (dataUrl) {
        downloadDataUrl(dataUrl, (opts.fileName || 'REMO_Story') + '.png');
      }
      if (!opts.suppressToast && typeof window.remoToast === 'function') {
        window.remoToast(
          (dataUrl
            ? (isFr ? '📥 Image téléchargée & légende copiée !' : '📥 Image saved & caption copied!')
            : (isFr ? '📋 Légende & lien copiés !' : '📋 Caption & link copied!')) + extraSuffix,
          'coin'
        );
      }
      return true;
    }

    if (net === 'tiktok' || net === 'instagram') {
      await copyTextSafe(formatted.fullMsg);
      const dataUrl = await _resolveVisualDataUrl(opts);
      if (dataUrl && navigator.share) {
        try {
          const res = await fetch(dataUrl);
          const blob = await res.blob();
          const file = new File([blob], (opts.fileName || 'REMO_Story') + '.png', { type: 'image/png' });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({ files: [file], title: formatted.title, text: formatted.fullMsg });
            if (!opts.suppressToast && typeof window.remoToast === 'function') {
              window.remoToast((isFr ? `🎬 Prêt sur ${net === 'tiktok' ? 'TikTok' : 'Instagram'} !` : `🎬 Shared to ${net === 'tiktok' ? 'TikTok' : 'Instagram'}!`) + extraSuffix, 'fanfare');
            }
            return true;
          }
        } catch (e) {}
      }
      if (dataUrl) {
        downloadDataUrl(dataUrl, (opts.fileName || `REMO_${net}_Card`) + '.png');
      }
      const label = net === 'tiktok' ? 'TikTok' : 'Instagram';
      if (!opts.suppressToast && typeof window.remoToast === 'function') {
        window.remoToast(
          (isFr
            ? `📥 Image PNG prête & légende #hashtags copiée pour ${label} ! Colle-la dans ta publication.`
            : `📥 PNG card saved & #hashtag caption copied for ${label}! Paste it into your post.`) + extraSuffix,
          'fanfare'
        );
      }
      return true;
    }

    let targetUrl = '';
    if (net === 'whatsapp') {
      targetUrl = `https://wa.me/?text=${encodeURIComponent(formatted.fullMsg)}`;
    } else if (net === 'telegram') {
      targetUrl = `https://t.me/share/url?url=${encodeURIComponent(formatted.url)}&text=${encodeURIComponent(formatted.body)}`;
    } else if (net === 'x') {
      targetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(formatted.xTweetText)}&url=${encodeURIComponent(formatted.url)}`;
    } else if (net === 'reddit') {
      targetUrl = `https://www.reddit.com/submit?url=${encodeURIComponent(formatted.url)}&title=${encodeURIComponent(formatted.title)}`;
    } else if (net === 'linkedin') {
      await copyTextSafe(formatted.fullMsg);
      targetUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(formatted.url)}`;
    } else if (net === 'sms') {
      targetUrl = `sms:?&body=${encodeURIComponent(formatted.fullMsg)}`;
    } else if (net === 'email') {
      targetUrl = `mailto:?subject=${encodeURIComponent(formatted.title)}&body=${encodeURIComponent(formatted.fullMsg)}`;
    } else if (net === 'facebook') {
      targetUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(formatted.url)}&quote=${encodeURIComponent(formatted.body)}`;
      const dataUrl = await _resolveVisualDataUrl(opts);
      if (dataUrl) {
        const copiedImg = await copyImageDataUrlToClipboard(dataUrl);
        if (!copiedImg) downloadDataUrl(dataUrl, (opts.fileName || 'REMO_Facebook_Card') + '.png');
        if (!opts.suppressToast && typeof window.remoToast === 'function') {
          window.remoToast(
            (copiedImg
              ? (isFr ? '📋 Image copiée ! Appuie sur Ctrl+V dans Facebook pour coller le visuel !' : '📋 Image copied! Press Ctrl+V inside Facebook to attach your visual!')
              : (isFr ? '📥 Visuel téléchargé ! Ajoute-le à ton post Facebook !' : '📥 Visual downloaded! Attach it to your Facebook post!')) + extraSuffix,
            'fanfare'
          );
        }
      }
    } else if (net === 'copy') {
      await copyTextSafe(opts.copyRawUrlOnly ? formatted.url : formatted.fullMsg);
      if (!opts.suppressToast && typeof window.remoToast === 'function') {
        window.remoToast(
          (isFr ? '📋 Légende, #hashtags et lien copiés !' : '📋 Caption, #hashtags & link copied!') + extraSuffix,
          'coin'
        );
      }
      return true;
    }

    if (targetUrl) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
      if (net !== 'facebook' && !opts.suppressToast && typeof window.remoToast === 'function') {
        const labelMap = {
          whatsapp: 'WhatsApp', telegram: 'Telegram', x: '𝕏',
          reddit: 'Reddit', linkedin: 'LinkedIn', sms: 'SMS', email: 'Email'
        };
        const lbl = labelMap[net] || net;
        window.remoToast(
          (isFr ? `🚀 Prêt à partager sur ${lbl} !` : `🚀 Opening ${lbl} share!`) + extraSuffix,
          bonusRes.awarded > 0 ? 'coin' : 'info'
        );
      }
      return true;
    }
    return false;
  }

  return {
    encodeQr: (txt) => REMO_QR.encode(txt),
    drawQrOnCanvas,
    formatCopy,
    shareToNetwork,
    awardDailyNetworkShareBonus,
    copyTextSafe,
    copyImageDataUrlToClipboard,
    downloadDataUrl,
    recordCanvasVideoLoop
  };
})();
window.REMO_SHARE_HUB = REMO_SHARE_HUB;
window.drawQrOnCanvas = REMO_SHARE_HUB.drawQrOnCanvas;

window._viralShareFormat = '9:16';
window._viralShareShowQr = true;

function getViralStoryDims(fmt = window._viralShareFormat) {
  if (fmt === '1:1') return { fmt: '1:1', W: 720, H: 720, cssMaxW: '245px', cssAspect: '1 / 1', suffix: '1x1' };
  if (fmt === '16:9') return { fmt: '16:9', W: 960, H: 540, cssMaxW: '360px', cssAspect: '16 / 9', suffix: '16x9' };
  return { fmt: '9:16', W: 540, H: 960, cssMaxW: '205px', cssAspect: '9 / 16', suffix: '9x16' };
}

function setViralPostShareFormat(fmt) {
  window._viralShareFormat = (fmt === '1:1' || fmt === '16:9') ? fmt : '9:16';
  document.querySelectorAll('.viral-fmt-pill').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.fmt === window._viralShareFormat);
  });
  drawViralPostStoryCanvas(window._activeViralSharePostId);
}
window.setViralPostShareFormat = setViralPostShareFormat;

function toggleViralPostQr(force) {
  window._viralShareShowQr = typeof force === 'boolean' ? force : !window._viralShareShowQr;
  const btn = document.getElementById('viralPostQrToggleBtn');
  if (btn) btn.classList.toggle('active', window._viralShareShowQr);
  drawViralPostStoryCanvas(window._activeViralSharePostId);
}
window.toggleViralPostQr = toggleViralPostQr;

function openViralPostShareModal(postId) {
  window._activeViralSharePostId = postId;
  const modal = document.getElementById('viralPostShareModal');
  if (!modal) return;
  const { post, url, isFr } = getViralPostShareData(postId);

  const titleEl = document.getElementById('viralPostModalTitle');
  const subEl = document.getElementById('viralPostModalSub');
  const nativeBtn = document.getElementById('viralPostNativeShareBtn');
  const copyBtn = document.getElementById('viralPostCopyLinkBtn');
  const linkInp = document.getElementById('viralPostDirectLinkInput');

  if (titleEl) {
    titleEl.textContent = isFr
      ? '📲 Studio de Partage Universel (+25 🪙)'
      : '📲 Universal Viral Share Studio (+25 🪙)';
  }
  if (subEl) {
    subEl.textContent = post && post.versus
      ? (isFr
          ? 'Partage ce Duel sur TikTok, Instagram, WhatsApp, 𝕏, Telegram, Reddit ou Facebook (+25 🪙 + Bonus Réseaux)!'
          : 'Share this Duel on TikTok, Instagram, WhatsApp, 𝕏, Telegram, Reddit or Facebook (+25 🪙 + Network Bonus)!')
      : (isFr
          ? 'Choisis ton format (9:16, 1:1, 16:9), active le Code QR et partage partout (+25 🪙)!'
          : 'Pick your format (9:16, 1:1, 16:9), stamp a QR Code & share on every network (+25 🪙)!');
  }
  if (nativeBtn) {
    nativeBtn.textContent = isFr ? '📲 Partage Natif / TikTok' : '📲 Native / TikTok';
  }
  if (copyBtn) {
    copyBtn.textContent = isFr ? '🔗 Copier (+25 🪙)' : '🔗 Copy (+25 🪙)';
  }
  if (linkInp) {
    linkInp.value = url;
  }

  document.querySelectorAll('.viral-fmt-pill').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.fmt === window._viralShareFormat);
  });
  const qrBtn = document.getElementById('viralPostQrToggleBtn');
  if (qrBtn) qrBtn.classList.toggle('active', window._viralShareShowQr);

  if (window.REMO_I18N && typeof window.REMO_I18N.applyDOM === 'function') {
    window.REMO_I18N.applyDOM();
  }

  modal.classList.add('open');
  drawViralPostStoryCanvas(postId);
}
window.openViralPostShareModal = openViralPostShareModal;

function closeViralPostShareModal() {
  const modal = document.getElementById('viralPostShareModal');
  if (modal) modal.classList.remove('open');
}
window.closeViralPostShareModal = closeViralPostShareModal;

function drawViralPostStoryCanvas(postId, animT = 0) {
  const cv = document.getElementById('viralPostStoryCanvas');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const dims = getViralStoryDims(window._viralShareFormat);
  const { fmt, W, H } = dims;
  cv.width = W;
  cv.height = H;
  cv.style.maxWidth = dims.cssMaxW;
  cv.style.aspectRatio = dims.cssAspect;

  const { post, url, isFr, u } = getViralPostShareData(postId);
  const lang = isFr ? 'fr' : 'en';
  const showQr = Boolean(window._viralShareShowQr);

  const drawCoverImg = (img, x, y, w, h, zoom = 1) => {
    if (!img) return false;
    try {
      const iw = img.naturalWidth || img.videoWidth || img.width || w;
      const ih = img.naturalHeight || img.videoHeight || img.height || h;
      if (!iw || !ih) {
        ctx.drawImage(img, x, y, w, h);
        return true;
      }
      const scale = Math.max(w / iw, h / ih) * zoom;
      const sw = w / scale;
      const sh = h / scale;
      const sx = Math.max(0, (iw - sw) / 2);
      const sy = Math.max(0, (ih - sh) / 2);
      ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
      return true;
    } catch (e) {
      try {
        ctx.drawImage(img, x, y, w, h);
        return true;
      } catch (e2) {
        return false;
      }
    }
  };

  const roundRectSafe = (x, y, w, h, r) => {
    const rad = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(x, y, w, h, rad);
    } else {
      ctx.moveTo(x + rad, y);
      ctx.arcTo(x + w, y, x + w, y + h, rad);
      ctx.arcTo(x + w, y + h, x, y + h, rad);
      ctx.arcTo(x, y + h, x, y, rad);
      ctx.arcTo(x, y, x + w, y, rad);
      ctx.closePath();
    }
  };

  const drawWrappedCenterText = (text, cx, startY, maxWidth, lineHeight, maxLines) => {
    const words = String(text || '').trim().split(/\s+/).filter(Boolean);
    if (!words.length) return;
    const lines = [];
    let cur = '';
    for (let i = 0; i < words.length; i++) {
      const candidate = cur ? `${cur} ${words[i]}` : words[i];
      if (ctx.measureText(candidate).width <= maxWidth) {
        cur = candidate;
      } else {
        if (cur) lines.push(cur);
        cur = words[i];
      }
    }
    if (cur) lines.push(cur);
    const clipped = lines.slice(0, maxLines);
    if (lines.length > maxLines && clipped.length) {
      clipped[clipped.length - 1] = clipped[clipped.length - 1].slice(0, Math.max(4, clipped[clipped.length - 1].length - 3)) + '...';
    }
    clipped.forEach((line, idx) => {
      ctx.fillText(line, cx, startY + idx * lineHeight);
    });
  };

  const renderFrame = (imgLeft, imgRight, tVal = animT) => {
    cv.width = W;
    cv.height = H;

    const bgGrad = ctx.createLinearGradient(0, 0, W, H);
    bgGrad.addColorStop(0, '#050816');
    bgGrad.addColorStop(0.5, '#0b132b');
    bgGrad.addColorStop(1, '#050816');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    const borderGlow = tVal > 0 ? (0.52 + 0.36 * Math.sin(tVal * 3.4)) : 0.55;
    ctx.strokeStyle = `rgba(56, 189, 248, ${borderGlow.toFixed(2)})`;
    ctx.lineWidth = 4;
    ctx.strokeRect(14, 14, W - 28, H - 28);

    const inviterCode = (u && (u.referralCode || u.passportNum)) ? String(u.referralCode || ('REMO-' + u.passportNum)) : 'REMO-0001';
    const pulseZoom = tVal > 0 ? (1 + 0.035 * Math.sin(tVal * 1.4)) : 1;

    let stageX, stageY, stageW, stageH;
    if (fmt === '16:9') {
      stageX = 32;
      stageY = 38;
      stageW = 496;
      stageH = 464;
    } else if (fmt === '1:1') {
      stageX = 36;
      stageY = 88;
      stageW = W - 72;
      stageH = 418;
    } else {
      stageX = 32;
      stageY = 108;
      stageW = W - 64;
      stageH = (post && post.versus) ? 512 : 484;
    }

    const hdrCx = fmt === '16:9' ? 744 : W / 2;
    const hdrY1 = fmt === '16:9' ? 70 : (fmt === '1:1' ? 46 : 56);
    const hdrY2 = hdrY1 + 26;

    ctx.textAlign = 'center';
    ctx.fillStyle = '#38bdf8';
    ctx.font = `900 ${fmt === '1:1' ? 21 : 22}px Orbitron, sans-serif`;
    ctx.fillText('🌐 REMOWORLD.COM', hdrCx, hdrY1);

    ctx.fillStyle = '#fde047';
    ctx.font = '800 13px sans-serif';
    ctx.fillText(
      post && post.versus
        ? (isFr ? '⚔️ DUEL OFFICIEL DES VILLES DU MONDE' : '⚔️ OFFICIAL WORLD CITY DUEL')
        : (isFr ? '✨ LE MÉTAVERS SOCIAL DES VILLES 4D' : '✨ THE 4D WORLD CITIES SOCIAL NETWORK'),
      hdrCx,
      hdrY2
    );

    const renderStageVisual = () => {
      if (post && post.versus) {
        const v = post.versus;
        const cA = getCityById(v.leftCityId || 'montreal');
        const cB = getCityById(v.rightCityId || 'paris');
        const nA = getCityName(cA, lang).toUpperCase();
        const nB = getCityName(cB, lang).toUpperCase();
        const lVotes = Number(v.leftVotes || 0);
        const rVotes = Number(v.rightVotes || 0);
        const tot = lVotes + rVotes;
        const pA = tot > 0 ? Math.round((lVotes / tot) * 100) : 50;
        const pB = tot > 0 ? (100 - pA) : 50;
        const halfW = stageW / 2;

        ctx.save();
        roundRectSafe(stageX, stageY, stageW, stageH, 20);
        ctx.clip();
        if (!drawCoverImg(imgLeft, stageX, stageY, halfW, stageH, pulseZoom)) {
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(stageX, stageY, halfW, stageH);
        }
        if (!drawCoverImg(imgRight, stageX + halfW, stageY, halfW, stageH, pulseZoom)) {
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(stageX + halfW, stageY, halfW, stageH);
        }
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(stageX + halfW, stageY);
        ctx.lineTo(stageX + halfW, stageY + stageH);
        ctx.stroke();

        const botGrad = ctx.createLinearGradient(0, stageY + stageH - 130, 0, stageY + stageH);
        botGrad.addColorStop(0, 'rgba(5,8,22,0)');
        botGrad.addColorStop(1, 'rgba(5,8,22,0.92)');
        ctx.fillStyle = botGrad;
        ctx.fillRect(stageX, stageY + stageH - 130, stageW, 130);
        ctx.restore();

        ctx.fillStyle = '#050816';
        ctx.beginPath();
        ctx.arc(stageX + halfW, stageY + stageH / 2, 26, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.fillStyle = '#fde047';
        ctx.font = '900 20px Orbitron, sans-serif';
        ctx.fillText('⚡', stageX + halfW, stageY + stageH / 2 + 7);

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 17px Orbitron, sans-serif';
        ctx.fillText(`${cA.flag} ${nA}`, stageX + halfW / 2, stageY + stageH - 50);
        ctx.fillText(`${cB.flag} ${nB}`, stageX + halfW + halfW / 2, stageY + stageH - 50);

        ctx.fillStyle = '#38bdf8';
        ctx.font = '900 25px Orbitron, sans-serif';
        ctx.fillText(`${pA}%`, stageX + halfW / 2, stageY + stageH - 16);
        ctx.fillStyle = '#f43f5e';
        ctx.fillText(`${pB}%`, stageX + halfW + halfW / 2, stageY + stageH - 16);

        return { pA, isDuel: true };
      }

      if (post && post.mediaType === 'text_card' && post.textCard) {
        const city = getCityById(post.cityId || 'montreal');
        const mysteryMasked = _isTextCardMysteryMasked(post);
        const tcPages = _getTextCardSpecPages(post.textCard);
        const activePageIdx = (((_carouselState[post.id] || 0) % tcPages.length) + tcPages.length) % tcPages.length;
        const tcCv = document.createElement('canvas');
        tcCv.width = stageW * 2;
        tcCv.height = stageH * 2;
        const tcCtx = tcCv.getContext('2d');
        const tcSpecForStory = { ...post.textCard, dedicatedTo: getEffectiveTextCardRecipient(post) };
        drawTextCardCanvasFrame(
          tcCtx, tcCv.width, tcCv.height, tcSpecForStory, activePageIdx,
          city, post.authorName || 'REMO Citizen', lang, mysteryMasked, tVal
        );

        ctx.save();
        roundRectSafe(stageX, stageY, stageW, stageH, 20);
        ctx.clip();
        ctx.drawImage(tcCv, stageX, stageY, stageW, stageH);
        ctx.restore();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.24)';
        ctx.lineWidth = 2;
        roundRectSafe(stageX, stageY, stageW, stageH, 20);
        ctx.stroke();

        const cap = isFr ? (post.caption_fr || post.caption_en || '') : (post.caption_en || post.caption_fr || '');
        const rawPageTxt = (tcPages[activePageIdx] || '').replace(/\s+/g, ' ').trim();
        return { capText: cap || rawPageTxt, isDuel: false };
      }

      const city = getCityById((post && post.cityId) || 'montreal');
      const cityName = getCityName(city, lang).toUpperCase();
      ctx.save();
      roundRectSafe(stageX, stageY, stageW, stageH, 20);
      ctx.clip();
      if (!drawCoverImg(imgLeft, stageX, stageY, stageW, stageH, pulseZoom)) {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(stageX, stageY, stageW, stageH);
      }
      const botGrad = ctx.createLinearGradient(0, stageY + stageH - 120, 0, stageY + stageH);
      botGrad.addColorStop(0, 'rgba(5,8,22,0)');
      botGrad.addColorStop(1, 'rgba(5,8,22,0.92)');
      ctx.fillStyle = botGrad;
      ctx.fillRect(stageX, stageY + stageH - 120, stageW, 120);
      ctx.restore();

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 21px Orbitron, sans-serif';
      ctx.fillText(`${city.flag} ${cityName}`, stageX + stageW / 2, stageY + stageH - 44);
      ctx.fillStyle = '#38bdf8';
      ctx.font = '800 15px sans-serif';
      ctx.fillText(`@${(post && post.authorName) || 'REMO Citizen'}`, stageX + stageW / 2, stageY + stageH - 16);

      const cap = post ? (isFr ? (post.caption_fr || post.caption_en || '') : (post.caption_en || post.caption_fr || '')) : '';
      return { capText: cap, isDuel: false };
    };

    const meta = renderStageVisual();

    let ctaX, ctaY, ctaW, ctaH;
    if (fmt === '16:9') {
      const colX = 552;
      const colW = W - colX - 32;
      const colCx = colX + colW / 2;

      if (meta.isDuel) {
        const barY = 148;
        ctx.fillStyle = '#f43f5e';
        ctx.fillRect(colX, barY, colW, 14);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(colX, barY, Math.round((colW * meta.pA) / 100), 14);

        ctx.fillStyle = '#f8fafc';
        ctx.font = '900 20px Orbitron, sans-serif';
        drawWrappedCenterText(
          isFr ? 'QUELLE VILLE GAGNE CE DUEL ?' : 'WHICH CITY WINS THIS DUEL?',
          colCx, 198, colW - 8, 28, 2
        );
      } else {
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '700 17px sans-serif';
        drawWrappedCenterText(
          meta.capText || (isFr ? 'En direct sur REMO World' : 'Live on REMO World'),
          colCx, 152, colW - 10, 25, 3
        );
        ctx.fillStyle = '#fde047';
        ctx.font = '900 15px Orbitron, sans-serif';
        ctx.fillText(
          isFr ? '24 VILLES • RADIO LIVE • PASSEPORT 4D' : '24 CITIES • LIVE RADIO • 4D PASSPORT',
          colCx,
          266
        );
      }
      ctaX = colX;
      ctaY = 306;
      ctaW = colW;
      ctaH = 196;
    } else if (fmt === '1:1') {
      if (meta.isDuel) {
        ctx.fillStyle = '#f43f5e';
        ctx.fillRect(36, 518, W - 72, 12);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(36, 518, Math.round(((W - 72) * meta.pA) / 100), 12);
        ctx.fillStyle = '#f8fafc';
        ctx.font = '900 18px Orbitron, sans-serif';
        ctx.fillText(isFr ? 'QUELLE VILLE GAGNE CE DUEL ?' : 'WHICH CITY WINS THIS DUEL?', W / 2, 556);
      } else {
        const subTxt = String(meta.capText || '').trim();
        const shortCap = subTxt.length > 68 ? subTxt.slice(0, 65) + '...' : subTxt;
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '700 16px sans-serif';
        ctx.fillText(shortCap || (isFr ? 'En direct sur REMO World' : 'Live on REMO World'), W / 2, 538);
        ctx.fillStyle = '#fde047';
        ctx.font = '900 15px Orbitron, sans-serif';
        ctx.fillText(
          isFr ? '24 VILLES • RADIO LIVE • PASSEPORT 4D' : '24 CITIES • LIVE RADIO • 4D PASSPORT',
          W / 2,
          562
        );
      }
      ctaX = 36;
      ctaY = 580;
      ctaW = W - 72;
      ctaH = 112;
    } else {
      if (meta.isDuel) {
        const barY = 638;
        ctx.fillStyle = '#f43f5e';
        ctx.fillRect(32, barY, W - 64, 14);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(32, barY, Math.round(((W - 64) * meta.pA) / 100), 14);
        ctx.fillStyle = '#f8fafc';
        ctx.font = '900 21px Orbitron, sans-serif';
        ctx.fillText(
          isFr ? 'QUELLE VILLE GAGNE CE DUEL ?' : 'WHICH CITY WINS THIS DUEL?',
          W / 2,
          698
        );
      } else {
        const subTxt = String(meta.capText || '').trim();
        const shortCap = subTxt.length > 58 ? subTxt.slice(0, 55) + '...' : subTxt;
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '700 17px sans-serif';
        ctx.fillText(shortCap || (isFr ? 'En direct sur REMO World' : 'Live on REMO World'), W / 2, 642);
        ctx.fillStyle = '#fde047';
        ctx.font = '900 18px Orbitron, sans-serif';
        ctx.fillText(
          isFr ? '24 VILLES • RADIO LIVE • PASSEPORT 4D' : '24 CITIES • LIVE RADIO • 4D PASSPORT',
          W / 2,
          692
        );
      }
      ctaX = 32;
      ctaY = 740;
      ctaW = W - 64;
      ctaH = 148;
    }

    ctx.fillStyle = 'rgba(56, 189, 248, 0.14)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    roundRectSafe(ctaX, ctaY, ctaW, ctaH, 18);
    ctx.fill();
    ctx.stroke();

    const qrSize = showQr ? (fmt === '9:16' ? 116 : (fmt === '1:1' ? 92 : 124)) : 0;
    const ctaTextAreaW = showQr ? (ctaW - qrSize - 26) : ctaW;
    const ctaTextCx = ctaX + ctaTextAreaW / 2;

    if (showQr) {
      const qrX = ctaX + ctaW - qrSize - 12;
      const qrY = ctaY + Math.round((ctaH - qrSize) / 2);
      const drawQrFn = (window.REMO_SHARE_HUB && typeof window.REMO_SHARE_HUB.drawQrOnCanvas === 'function')
        ? window.REMO_SHARE_HUB.drawQrOnCanvas
        : (typeof window.drawQrOnCanvas === 'function' ? window.drawQrOnCanvas : null);
      if (drawQrFn) {
        try { drawQrFn(ctx, url, qrX, qrY, qrSize); } catch (qrErr) {}
      }
      if (fmt === '9:16' || fmt === '16:9') {
        ctx.fillStyle = '#7dd3fc';
        ctx.font = '800 9px Orbitron, sans-serif';
        ctx.fillText(isFr ? 'SCAN QR' : 'SCAN QR', qrX + qrSize / 2, Math.min(ctaY + ctaH - 5, qrY + qrSize + 12));
      }
    }

    ctx.textAlign = 'center';
    if (fmt === '16:9') {
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 15px Orbitron, sans-serif';
      ctx.fillText(
        post && post.versus ? (isFr ? '🗳️ VOTEZ EN DIRECT :' : '🗳️ VOTE LIVE AT:') : (isFr ? '🌍 REJOIGNEZ-NOUS :' : '🌍 JOIN LIVE AT:'),
        ctaTextCx, ctaY + 46
      );
      ctx.fillStyle = '#fde047';
      ctx.font = `900 ${showQr ? 17 : 26}px Orbitron, sans-serif`;
      ctx.fillText('REMOWORLD.COM', ctaTextCx, ctaY + 88);
      ctx.fillStyle = '#7dd3fc';
      ctx.font = '800 12px sans-serif';
      ctx.fillText(
        isFr ? `🎁 Code : ${inviterCode} (+100 🪙)` : `🎁 Code: ${inviterCode} (+100 🪙 Free)`,
        ctaTextCx, ctaY + 126
      );
      ctx.fillStyle = '#94a3b8';
      ctx.font = '700 11px sans-serif';
      ctx.fillText('TikTok • IG • X • WhatsApp • Reddit', ctaTextCx, ctaY + 162);
    } else if (fmt === '1:1') {
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 15px Orbitron, sans-serif';
      ctx.fillText(
        post && post.versus ? (isFr ? '🗳️ VOTEZ EN DIRECT SUR :' : '🗳️ VOTE LIVE NOW AT:') : (isFr ? '🌍 REJOIGNEZ LA VILLE SUR :' : '🌍 JOIN YOUR CITY LIVE AT:'),
        ctaTextCx, ctaY + 32
      );
      ctx.fillStyle = '#fde047';
      ctx.font = '900 24px Orbitron, sans-serif';
      ctx.fillText('REMOWORLD.COM', ctaTextCx, ctaY + 65);
      ctx.fillStyle = '#7dd3fc';
      ctx.font = '800 13px sans-serif';
      ctx.fillText(
        isFr ? `🎁 Code Invité : ${inviterCode} (+100 🪙 Gratuits)` : `🎁 Invite Code: ${inviterCode} (+100 🪙 Free Bonus)`,
        ctaTextCx, ctaY + 93
      );
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.font = `900 ${showQr ? 15 : 19}px Orbitron, sans-serif`;
      ctx.fillText(
        post && post.versus ? (isFr ? '🗳️ VOTEZ EN DIRECT SUR :' : '🗳️ VOTE LIVE NOW AT:') : (isFr ? '🌍 REJOIGNEZ LA VILLE SUR :' : '🌍 JOIN YOUR CITY LIVE AT:'),
        ctaTextCx, ctaY + 42
      );
      ctx.fillStyle = '#fde047';
      ctx.font = `900 ${showQr ? 22 : 28}px Orbitron, sans-serif`;
      ctx.fillText('REMOWORLD.COM', ctaTextCx, ctaY + 84);
      ctx.fillStyle = '#7dd3fc';
      ctx.font = `800 ${showQr ? 12 : 14}px sans-serif`;
      ctx.fillText(
        isFr
          ? (showQr ? `🎁 Code : ${inviterCode} (+100 🪙)` : `🎁 Code Invité : ${inviterCode} (+100 🪙 Bonus Gratuits)`)
          : (showQr ? `🎁 Code: ${inviterCode} (+100 🪙 Free)` : `🎁 Invite Code: ${inviterCode} (+100 🪙 Free Welcome Bonus)`),
        ctaTextCx, ctaY + 118
      );
      ctx.fillStyle = '#94a3b8';
      ctx.font = '700 12px sans-serif';
      ctx.fillText('TikTok • Instagram • WhatsApp • 𝕏 • Telegram • REMO 4D', W / 2, 924);
    }
  };

  if (post && post.mediaType === 'text_card' && post.textCard) {
    renderFrame(null, null, animT);
    window._viralStoryFrameRenderer = (t) => renderFrame(null, null, t);
    window._viralStoryRenderPromise = Promise.resolve();
    return;
  }

  const renderGen = (window._viralStoryRenderGen = (window._viralStoryRenderGen || 0) + 1);
  const skipDom = Boolean(window._viralStoryCleanExportOnly);
  const domCard = (!skipDom && postId) ? document.getElementById('post_card_' + postId) : null;
  const domWrap = domCard ? (domCard.querySelector('.post-media-wrap') || domCard.querySelector('.post-media') || domCard) : null;
  const isReadyImg = (el) => Boolean(el && el.tagName === 'IMG' && el.complete && (el.naturalWidth || 0) > 0);
  const isReadyVid = (el) => Boolean(el && el.tagName === 'VIDEO' && (el.readyState || 0) >= 2);
  const isVideoSrc = (u) => /\.(mp4|webm|mov|m4v|m3u8)(\?|#|$)/i.test(String(u || '')) || /^data:video\//i.test(String(u || ''));

  let domLeftImg = null;
  let domRightImg = null;
  let domVidEl = null;
  if (domWrap) {
    if (post && post.versus) {
      domLeftImg = domWrap.querySelector('.versus-pane.left img') || domWrap.querySelectorAll('img')[0] || null;
      domRightImg = domWrap.querySelector('.versus-pane.right img') || domWrap.querySelectorAll('img')[1] || null;
    } else if (post && post.mediaType === 'carousel') {
      const slides = domWrap.querySelectorAll('.carousel-slide-img');
      const carouselMap = (typeof _carouselState !== 'undefined' ? _carouselState : window._carouselState) || {};
      const rawIdx = post.id && carouselMap[post.id] != null ? Number(carouselMap[post.id]) || 0 : 0;
      const safeIdx = slides.length ? Math.max(0, Math.min(slides.length - 1, rawIdx)) : 0;
      domLeftImg = slides[safeIdx] || domWrap.querySelector('.carousel-slide-img, .post-face-front > img, img');
    } else {
      domLeftImg = domWrap.querySelector('.post-face-front > img, .ba-slider-box img, .duet-pane img, .carousel-slide-img, img');
      domVidEl = domWrap.querySelector('video');
    }
  }

  let readyLeftDom = isReadyImg(domLeftImg) ? domLeftImg : (isReadyVid(domVidEl) ? domVidEl : null);
  let readyRightDom = (post && post.versus && isReadyImg(domRightImg)) ? domRightImg : null;
  if (!skipDom && window._viralStoryLastPostId === postId && window._viralStoryLastImgs) {
    if (!readyLeftDom && window._viralStoryLastImgs.left) readyLeftDom = window._viralStoryLastImgs.left;
    if (post && post.versus && !readyRightDom && window._viralStoryLastImgs.right) readyRightDom = window._viralStoryLastImgs.right;
  }

  if (!skipDom) {
    window._viralStoryLastPostId = postId;
    window._viralStoryLastImgs = { left: readyLeftDom, right: post && post.versus ? readyRightDom : null };
    window._viralStoryFrameRenderer = (t) => renderFrame(window._viralStoryLastImgs.left, window._viralStoryLastImgs.right, t);
  }

  renderFrame(readyLeftDom, post && post.versus ? readyRightDom : null, animT);

  const resolveMediaSource = async (raw) => {
    if (!raw) return '';
    const str = String(raw);
    if (str.startsWith('idb://') && typeof RemoMediaDB !== 'undefined') {
      try {
        const syncVal = RemoMediaDB.resolveSyncOrPlaceholder ? RemoMediaDB.resolveSyncOrPlaceholder(str) : '';
        if (syncVal && !String(syncVal).startsWith('idb://')) return String(syncVal);
        if (RemoMediaDB.getObjectUrl) {
          const asyncVal = await RemoMediaDB.getObjectUrl(str);
          if (asyncVal && !String(asyncVal).startsWith('idb://')) return String(asyncVal);
        }
      } catch (e) {}
      return '';
    }
    return str;
  };

  // Load images asynchronously with CORS-clean fallback so preview & PNG export keep the real photo
  const loadImg = (src, fallbackEl = null) => new Promise((resolve) => {
    if (!src) return resolve(fallbackEl);
    const strSrc = String(src);
    if (isVideoSrc(strSrc)) return resolve(fallbackEl);
    const isDataOrBlob = strSrc.startsWith('data:') || strSrc.startsWith('blob:');
    const im = new Image();
    if (!isDataOrBlob) {
      im.crossOrigin = 'anonymous';
    }
    im.onload = () => resolve(im);
    im.onerror = () => {
      if (isDataOrBlob || skipDom) return resolve(fallbackEl);
      const imNoCors = new Image();
      imNoCors.onload = () => resolve(imNoCors);
      imNoCors.onerror = () => resolve(fallbackEl);
      imNoCors.src = strSrc;
    };
    im.src = strSrc;
  });

  if (post && post.versus) {
    const v = post.versus;
    const cA = getCityById(v.leftCityId || 'montreal');
    const cB = getCityById(v.rightCityId || 'paris');
    const artA = resolveCityFallbackArtUrl(cA);
    const artB = resolveCityFallbackArtUrl(cB);
    window._viralStoryRenderPromise = (async () => {
      const [resA, resB] = await Promise.all([
        resolveMediaSource(v.leftMedia),
        resolveMediaSource(v.rightMedia)
      ]);
      const domSrcA = (!skipDom && domLeftImg) ? (domLeftImg.currentSrc || domLeftImg.src || '') : '';
      const domSrcB = (!skipDom && domRightImg) ? (domRightImg.currentSrc || domRightImg.src || '') : '';
      const srcA = resA || domSrcA || artA;
      const srcB = resB || domSrcB || artB;
      let [imA, imB] = await Promise.all([
        loadImg(srcA, readyLeftDom),
        loadImg(srcB, readyRightDom)
      ]);
      if (!imA && srcA !== artA) imA = await loadImg(artA, readyLeftDom);
      if (!imB && srcB !== artB) imB = await loadImg(artB, readyRightDom);
      if (renderGen !== window._viralStoryRenderGen) return;
      const finalLeft = imA || readyLeftDom || null;
      const finalRight = imB || readyRightDom || null;
      if (!skipDom) window._viralStoryLastImgs = { left: finalLeft, right: finalRight };
      renderFrame(finalLeft, finalRight, animT);
    })();
  } else if (post) {
    const city = getCityById(post.cityId || 'montreal');
    const fallbackArt = resolveCityFallbackArtUrl(city, post.visualHeadline || '', post.visualSub || '');
    window._viralStoryRenderPromise = (async () => {
      let rawSrc = '';
      if (post.mediaType === 'carousel' && Array.isArray(post.mediaUrls) && post.mediaUrls.length) {
        const carouselMap = (typeof _carouselState !== 'undefined' ? _carouselState : window._carouselState) || {};
        const rawIdx = post.id && carouselMap[post.id] != null ? Number(carouselMap[post.id]) || 0 : 0;
        const safeIdx = Math.max(0, Math.min(post.mediaUrls.length - 1, rawIdx));
        rawSrc = post.mediaUrls[safeIdx] || post.mediaUrls[0] || post.mediaUrl || post.thumbnailUrl || '';
      } else if (post.mediaType === 'video' || post.mediaType === 'video_link') {
        rawSrc = post.thumbnailUrl || (post.mediaUrl && !isVideoSrc(post.mediaUrl) ? post.mediaUrl : '') || '';
      } else {
        rawSrc = post.mediaUrl || (Array.isArray(post.mediaUrls) && post.mediaUrls[0]) || post.thumbnailUrl || '';
      }
      let resolvedSrc = await resolveMediaSource(rawSrc);
      if (!resolvedSrc && !skipDom && domLeftImg) {
        resolvedSrc = domLeftImg.currentSrc || domLeftImg.src || '';
      }
      if (!resolvedSrc && post.mediaType === 'video' && isReadyVid(readyLeftDom)) {
        if (renderGen !== window._viralStoryRenderGen) return;
        if (!skipDom) window._viralStoryLastImgs = { left: readyLeftDom, right: null };
        renderFrame(readyLeftDom, null, animT);
        return;
      }
      const src = resolvedSrc || fallbackArt;
      let im = await loadImg(src, readyLeftDom);
      if (!im && src !== fallbackArt) {
        im = await loadImg(fallbackArt);
      }
      if (renderGen !== window._viralStoryRenderGen) return;
      const finalLeft = im || readyLeftDom || null;
      if (!skipDom) window._viralStoryLastImgs = { left: finalLeft, right: null };
      renderFrame(finalLeft, null, animT);
    })();
  }
}

async function exportViralStoryCanvasDataUrl(postId) {
  const cv = document.getElementById('viralPostStoryCanvas');
  if (!cv) return '';
  if (window._viralStoryRenderPromise) {
    try { await window._viralStoryRenderPromise; } catch (e) {}
  }
  try {
    return cv.toDataURL('image/png');
  } catch (secErr) {
    const { post } = getViralPostShareData(postId);
    if (!post) return '';
    const getCleanExportFallbackUrl = (cityObj, headline, subline) => {
      const c = cityObj || { id: 'montreal', name: 'REMO' };
      const cid = String(c.id || '').toLowerCase();
      if (typeof REMO_BUNDLED_CITY_IMAGE_IDS !== 'undefined' && REMO_BUNDLED_CITY_IMAGE_IDS.has(cid) && typeof getDefaultCityCardImageUrl === 'function') {
        const localUrl = getDefaultCityCardImageUrl(cid);
        if (localUrl) return localUrl;
      }
      if (typeof generateCityPostVisualDataUrl === 'function') {
        const genUrl = generateCityPostVisualDataUrl(c.id || 'montreal', headline || (c.name || 'REMO').toUpperCase(), subline || 'REMOWORLD.COM');
        if (genUrl) return genUrl;
      }
      return resolveCityFallbackArtUrl(c, headline || '', subline || '');
    };

    const dims = getViralStoryDims(window._viralShareFormat);
    const cleanCv = document.createElement('canvas');
    cleanCv.width = dims.W;
    cleanCv.height = dims.H;
    const origId = cv.id;
    cv.id = 'viralPostStoryCanvas_orig';
    cleanCv.id = 'viralPostStoryCanvas';
    cleanCv.style.display = 'none';
    document.body.appendChild(cleanCv);

    const savedLastImgs = window._viralStoryLastImgs;
    const savedLastPostId = window._viralStoryLastPostId;
    const savedRenderGen = window._viralStoryRenderGen;
    const savedRenderPromise = window._viralStoryRenderPromise;
    const savedFrameRenderer = window._viralStoryFrameRenderer;

    let out = '';
    if (post.versus) {
      const v = post.versus;
      const savedLeft = v.leftMedia;
      const savedRight = v.rightMedia;
      const cA = getCityById(v.leftCityId || 'montreal');
      const cB = getCityById(v.rightCityId || 'paris');
      try {
        window._viralStoryCleanExportOnly = true;
        v.leftMedia = getCleanExportFallbackUrl(cA);
        v.rightMedia = getCleanExportFallbackUrl(cB);
        drawViralPostStoryCanvas(postId);
        if (window._viralStoryRenderPromise) {
          try { await window._viralStoryRenderPromise; } catch (e) {}
        }
        await new Promise((r) => setTimeout(r, 80));
        try { out = cleanCv.toDataURL('image/png'); } catch (e) {}
      } finally {
        window._viralStoryCleanExportOnly = false;
        v.leftMedia = savedLeft;
        v.rightMedia = savedRight;
        if (cleanCv.parentNode) cleanCv.parentNode.removeChild(cleanCv);
        cv.id = origId;
        window._viralStoryLastImgs = savedLastImgs;
        window._viralStoryLastPostId = savedLastPostId;
        window._viralStoryRenderGen = savedRenderGen;
        window._viralStoryRenderPromise = savedRenderPromise;
        window._viralStoryFrameRenderer = savedFrameRenderer;
      }
      return out;
    }

    const city = getCityById(post.cityId || 'montreal');
    const savedMediaUrl = post.mediaUrl;
    const savedMediaUrls = post.mediaUrls;
    const savedThumbUrl = post.thumbnailUrl;
    try {
      window._viralStoryCleanExportOnly = true;
      post.mediaUrl = getCleanExportFallbackUrl(city, post.visualHeadline || '', post.visualSub || '');
      post.mediaUrls = null;
      post.thumbnailUrl = '';
      drawViralPostStoryCanvas(postId);
      if (window._viralStoryRenderPromise) {
        try { await window._viralStoryRenderPromise; } catch (e) {}
      }
      await new Promise((r) => setTimeout(r, 80));
      try { out = cleanCv.toDataURL('image/png'); } catch (e) {}
    } finally {
      window._viralStoryCleanExportOnly = false;
      post.mediaUrl = savedMediaUrl;
      post.mediaUrls = savedMediaUrls;
      post.thumbnailUrl = savedThumbUrl;
      if (cleanCv.parentNode) cleanCv.parentNode.removeChild(cleanCv);
      cv.id = origId;
      window._viralStoryLastImgs = savedLastImgs;
      window._viralStoryLastPostId = savedLastPostId;
      window._viralStoryRenderGen = savedRenderGen;
      window._viralStoryRenderPromise = savedRenderPromise;
      window._viralStoryFrameRenderer = savedFrameRenderer;
    }
    return out;
  }
}

async function shareViralPostStoryNative() {
  const postId = window._activeViralSharePostId;
  const { post, url, title, shareText, isFr } = getViralPostShareData(postId);
  const dims = getViralStoryDims(window._viralShareFormat);
  rewardViralShareOnce(postId);
  return await REMO_SHARE_HUB.shareToNetwork('native', {
    url,
    title,
    shareText,
    isFr,
    context: post && post.versus ? 'duel' : 'post',
    fileName: `REMO_${dims.suffix}_${postId || 'moment'}`,
    getDataUrlFn: () => exportViralStoryCanvasDataUrl(postId)
  });
}
window.shareViralPostStoryNative = shareViralPostStoryNative;

async function downloadViralPostStoryPNG() {
  const postId = window._activeViralSharePostId;
  const { isFr } = getViralPostShareData(postId);
  const cv = document.getElementById('viralPostStoryCanvas');
  if (!cv) return;
  const dims = getViralStoryDims(window._viralShareFormat);
  rewardViralShareOnce(postId);
  try {
    const dataUrl = await exportViralStoryCanvasDataUrl(postId);
    if (!dataUrl) throw new Error('export_failed');
    REMO_SHARE_HUB.downloadDataUrl(dataUrl, `REMO_Card_${dims.suffix}_${postId || Date.now()}.png`);
    remoToast(
      isFr ? `📥 Visuel ${dims.fmt} HD téléchargé ! (+25 🪙)` : `📥 ${dims.fmt} HD Card downloaded! (+25 🪙)`,
      'coin'
    );
  } catch (e) {
    copyViralPostDirectLink();
  }
}
window.downloadViralPostStoryPNG = downloadViralPostStoryPNG;

async function downloadViralPostStoryVideo() {
  const postId = window._activeViralSharePostId;
  const { isFr } = getViralPostShareData(postId);
  const cv = document.getElementById('viralPostStoryCanvas');
  if (!cv) return;
  if (window._viralStoryRenderPromise) {
    try { await window._viralStoryRenderPromise; } catch (e) {}
  }
  rewardViralShareOnce(postId);
  const dims = getViralStoryDims(window._viralShareFormat);
  const renderer = typeof window._viralStoryFrameRenderer === 'function'
    ? window._viralStoryFrameRenderer
    : (t) => drawViralPostStoryCanvas(postId, t);
  await REMO_SHARE_HUB.recordCanvasVideoLoop(cv, renderer, {
    isFr,
    durationMs: 4500,
    fileName: `REMO_Video_${dims.suffix}_${postId || Date.now()}.webm`
  });
}
window.downloadViralPostStoryVideo = downloadViralPostStoryVideo;

async function copyViralPostCaptionAndTags() {
  const postId = window._activeViralSharePostId;
  const { post, url, title, shareText, isFr } = getViralPostShareData(postId);
  rewardViralShareOnce(postId);
  return await REMO_SHARE_HUB.shareToNetwork('copy', {
    url,
    title,
    shareText,
    isFr,
    context: post && post.versus ? 'duel' : 'post'
  });
}
window.copyViralPostCaptionAndTags = copyViralPostCaptionAndTags;

async function shareViralPostToSocial(platform) {
  const postId = window._activeViralSharePostId;
  const { post, url, title, shareText, isFr } = getViralPostShareData(postId);
  const dims = getViralStoryDims(window._viralShareFormat);
  rewardViralShareOnce(postId);
  return await REMO_SHARE_HUB.shareToNetwork(platform, {
    url,
    title,
    shareText,
    isFr,
    context: post && post.versus ? 'duel' : 'post',
    fileName: `REMO_${dims.suffix}_${postId || 'moment'}`,
    getDataUrlFn: () => exportViralStoryCanvasDataUrl(postId)
  });
}
window.shareViralPostToSocial = shareViralPostToSocial;

function copyViralPostDirectLink() {
  const postId = window._activeViralSharePostId;
  const { url, lang } = getViralPostShareData(postId);
  rewardViralShareOnce(postId);
  copyPostUrlToClipboard(url, lang);
}
window.copyViralPostDirectLink = copyViralPostDirectLink;

function copyPostUrlToClipboard(url, lang) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(() => {
      remoToast(lang === 'fr' ? '🔗 Lien copié ! Partagez ce moment avec vos amis.' : '🔗 Link copied! Share this moment with friends.');
    }).catch(() => fallbackCopyPostUrl(url, lang));
  } else {
    fallbackCopyPostUrl(url, lang);
  }
}

function fallbackCopyPostUrl(url, lang) {
  const ta = document.createElement('textarea');
  ta.value = url;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    remoToast(lang === 'fr' ? '🔗 Lien copié dans le presse-papiers !' : '🔗 Link copied to clipboard!');
  } catch (e) {
    prompt(lang === 'fr' ? 'Copiez ce lien :' : 'Copy this link:', url);
  }
  document.body.removeChild(ta);
}

function shareFullscreenPostLink() {
  if (currentFullscreenPostId) sharePostLink(currentFullscreenPostId);
}

function openHtmlFullscreenModal(postId) {
  const p = findFeedPostById(postId);
  if (!p || !p.htmlCode) return;
  currentFullscreenPostId = postId;
  const modal = document.getElementById('htmlFullscreenModal');
  const iframe = document.getElementById('htmlFsIframe');
  const titleEl = document.getElementById('htmlFsTitle');
  const shareBtn = document.getElementById('htmlFsShareBtn');
  if (titleEl) titleEl.textContent = `💻 @${p.authorName} — LIVE HTML ARCADE`;
  if (iframe) iframe.srcdoc = buildFittedHtmlSrcdoc(p.htmlCode, postId);
  if (shareBtn) {
    shareBtn.onclick = () => {
      sharePostLink(postId);
    };
  }
  modal?.classList.add('open');
  remoEnterNativeFullscreen(modal);
}

function closeHtmlFullscreenModal() {
  remoExitNativeFullscreen();
  const iframe = document.getElementById('htmlFsIframe');
  if (iframe) iframe.srcdoc = '';
  document.getElementById('htmlFullscreenModal')?.classList.remove('open');
}

function remixHtmlPost(postId) {
  if (!REMO_STORE.isAdminUnlocked() && !REMO_STORE.isCurrentUserAdmin()) {
    sharePostLink(postId);
    return;
  }
  const p = REMO_STORE.state.posts.find((x) => x.id === postId);
  if (!p || !p.htmlCode) return;
  const lang = REMO_I18N.getLang();
  openCreatePostModal('#LiveHTML ');
  switchCreateStudioTab('html');
  pendingRemixParent = { postId: p.id, authorUid: p.uid, authorName: p.authorName };

  const banner = document.getElementById('createRemixBanner');
  if (banner) {
    banner.style.display = 'block';
    banner.textContent = lang === 'fr'
      ? `🧬 Remix du code de @${p.authorName} — +10 🪙 de royauté seront versés à @${p.authorName} à la publication !`
      : `🧬 Remixing @${p.authorName}'s code — +10 🪙 creator royalty will be sent to @${p.authorName} when published!`;
  }
  const area = document.getElementById('createHtmlCodeArea');
  if (area) area.value = p.htmlCode;
  refreshStudioHtmlPreview();
}

function stepPostCarousel(postId, delta, ev) {
  if (ev) ev.stopPropagation();
  const p = REMO_STORE.state.posts.find((x) => x.id === postId);
  if (!p || !Array.isArray(p.mediaUrls) || !p.mediaUrls.length) return;
  const len = p.mediaUrls.length;
  _carouselState[postId] = (((_carouselState[postId] || 0) + delta) % len + len) % len;
  updateCarouselDom(postId, p);
}

function setPostCarouselIndex(postId, index, ev) {
  if (ev) ev.stopPropagation();
  const p = REMO_STORE.state.posts.find((x) => x.id === postId);
  if (!p || !Array.isArray(p.mediaUrls) || !p.mediaUrls.length) return;
  _carouselState[postId] = Math.max(0, Math.min(index, p.mediaUrls.length - 1));
  updateCarouselDom(postId, p);
}

function updateCarouselDom(postId, p) {
  const box = document.getElementById('post_media_' + postId);
  const idx = _carouselState[postId] || 0;
  const curKey = p.mediaUrls[idx];
  let curUrl = RemoMediaDB.resolveSyncOrPlaceholder(curKey);
  if (!curUrl || curUrl.startsWith('idb://')) {
    curUrl = (curKey && (curKey.startsWith('data:') || curKey.startsWith('http'))) ? curKey : '';
  }

  if (box) {
    const img = box.querySelector('img.carousel-slide-img');
    if (img && curUrl) {
      img.style.opacity = '0.35';
      setTimeout(() => {
        img.src = curUrl;
        img.style.opacity = '1';
      }, 50);
    }
    box.querySelectorAll('.carousel-dot').forEach((d, i) => {
      d.classList.toggle('active', i === idx);
    });
    const pill = box.querySelector('.carousel-count-pill');
    if (pill) pill.textContent = `🎠 ${idx + 1}/${p.mediaUrls.length}`;
    return;
  }
  renderSocialFeed();
}

function initCarouselTouchSwipe(el, postId, handlerName = 'stepPostCarousel') {
  if (!el || el._hasSwipe) return;
  el._hasSwipe = true;
  let startX = 0;
  let startY = 0;
  el.addEventListener('touchstart', (e) => {
    if (!e.touches || !e.touches[0]) return;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }, { passive: true });
  el.addEventListener('touchend', (e) => {
    if (!e.changedTouches || !e.changedTouches[0]) return;
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.4) {
      const fn = typeof window[handlerName] === 'function' ? window[handlerName] : stepPostCarousel;
      fn(postId, dx < 0 ? 1 : -1, e);
    }
  }, { passive: true });
}
window.initCarouselTouchSwipe = initCarouselTouchSwipe;
window.setPostCarouselIndex = setPostCarouselIndex;

/* ── 3C. REMO TEXT CARD ENGINE (Colored Paginated Proverbs, Wishes, Quotes & Stories) ── */
const REMO_TEXT_CARD_CHAR_LIMIT = 1800;

const REMO_TEXT_CARD_THEMES = {
  aurora:    { id: 'aurora',    swatch: 'linear-gradient(135deg,#4f46e5,#db2777)', stops: ['#1e1b4b', '#312e81', '#831843'], textColor: '#ffffff', accent: '#38bdf8' },
  sunset:    { id: 'sunset',    swatch: 'linear-gradient(135deg,#ea580c,#e11d48)', stops: ['#7c2d12', '#c2410c', '#be123c'], textColor: '#ffffff', accent: '#fde047' },
  parchment: { id: 'parchment', swatch: 'linear-gradient(135deg,#78350f,#d97706)', stops: ['#27211a', '#443829', '#1c1917'], textColor: '#fef3c7', accent: '#fbbf24' },
  emerald:   { id: 'emerald',   swatch: 'linear-gradient(135deg,#059669,#0891b2)', stops: ['#064e3b', '#0f3d3e', '#0e7490'], textColor: '#ffffff', accent: '#34d399' },
  velvet:    { id: 'velvet',    swatch: 'linear-gradient(135deg,#1e1b4b,#7e22ce)', stops: ['#020617', '#1e1b4b', '#3b0764'], textColor: '#ffffff', accent: '#c084fc' },
  ruby:      { id: 'ruby',      swatch: 'linear-gradient(135deg,#be123c,#581c87)', stops: ['#4c0519', '#9f1239', '#311042'], textColor: '#ffffff', accent: '#fda4af' },
  ocean:     { id: 'ocean',     swatch: 'linear-gradient(135deg,#0284c7,#312e81)', stops: ['#082f49', '#0369a1', '#1e1b4b'], textColor: '#ffffff', accent: '#7dd3fc' },
  city:      { id: 'city',      swatch: 'radial-gradient(circle,#38bdf8,#090d1f)',  stops: ['#050816', '#0f172a', '#050816'], textColor: '#ffffff', accent: '#38bdf8' }
};

const REMO_TEXT_CARD_FONTS = {
  modern:    { family: '"Outfit", "Inter", sans-serif', weight: '800', style: 'normal' },
  editorial: { family: 'Georgia, "Times New Roman", serif', weight: '700', style: 'normal' },
  poetic:    { family: 'Georgia, "Times New Roman", serif', weight: '600', style: 'italic' },
  cyber:     { family: '"Orbitron", "Outfit", sans-serif', weight: '800', style: 'normal' }
};

const REMO_TEXT_CARD_BADGE_KEYS = {
  proverb: 'tc_badge_proverb',
  wish:    'tc_badge_wish',
  thought: 'tc_badge_thought',
  story:   'tc_badge_story'
};

const REMO_TEXT_CARD_IDEAS = [
  {
    badge: 'proverb', theme: 'parchment', font: 'editorial',
    en: 'He who shares a candle loses nothing of its light, yet brightens the whole city.',
    fr: 'Celui qui partage sa flamme ne perd rien de sa lumière, mais illumine toute la ville.'
  },
  {
    badge: 'wish', theme: 'sunset', font: 'poetic',
    en: 'May your morning start with calm, your path stay bright, and a friend across the ocean smile because of you today. ✨💛',
    fr: 'Que votre matin commence dans la paix, que votre route soit lumineuse et qu’un ami sourie grâce à vous aujourd’hui. ✨💛'
  },
  {
    badge: 'proverb', theme: 'emerald', font: 'modern',
    en: 'Quiet steps cross every mountain. --- Keep building even on the days nobody claps yet. The view from the summit remembers every step. 🏔️⚡',
    fr: 'À pas calmes, on traverse toutes les montagnes. --- Continuez de bâtir même les jours sans applaudissements. Le sommet se souvient de chaque pas. 🏔️⚡'
  },
  {
    badge: 'wish', theme: 'aurora', font: 'modern',
    en: 'Sending good energy from {city} to every corner of the world tonight! Drop your city flag if you see this. 🌍✨',
    fr: 'J’envoie une belle énergie depuis {city} vers chaque coin du monde ce soir ! Mettez le drapeau de votre ville en commentaire. 🌍✨'
  },
  {
    badge: 'story', theme: 'velvet', font: 'editorial',
    en: 'Two strangers waited for the same late tram under rain. One shared an umbrella, the other a warm coffee.\n---\nTwo years later, both cities still talk about how one small kindness rewrote two whole lives. ☕🌧️',
    fr: 'Deux inconnus attendaient le même tram sous la pluie. L’un a partagé son parapluie, l’autre un café chaud.\n---\nDeux ans plus tard, deux villes parlent encore de ce petit geste qui a tout changé. ☕🌧️'
  }
];

/**
 * Splits a Text Card body into balanced readable pages, honoring explicit `---`
 * breaks and automatically wrapping long sections at paragraph, sentence, or word boundaries.
 */
function splitTextCardPages(rawText, maxCharsPerPage = 250, maxLinesPerPage = 6) {
  const clean = String(rawText || '').replace(/\r\n/g, '\n').trim().slice(0, REMO_TEXT_CARD_CHAR_LIMIT);
  if (!clean) return [''];

  const manualSections = clean
    .split(/\n\s*(?:---|===)\s*\n|^\s*(?:---|===)\s*$/gm)
    .map((s) => s.trim())
    .filter(Boolean);

  const pages = [];
  const flushChunk = (txt) => { if (txt && txt.trim()) pages.push(txt.trim()); };

  manualSections.forEach((section) => {
    if (section.length <= maxCharsPerPage && section.split('\n').length <= maxLinesPerPage) {
      flushChunk(section);
      return;
    }

    // Break large sections at paragraphs/lines or sentences first, then word-wrap safely
    const paragraphs = section.split(/\n+/);
    let current = '';

    const pushWordSafe = (unit) => {
      const words = unit.split(/\s+/).filter(Boolean);
      words.forEach((word) => {
        const sep = current ? (current.endsWith('\n') ? '' : ' ') : '';
        const next = current + sep + word;
        if (next.length > maxCharsPerPage || next.split('\n').length > maxLinesPerPage) {
          flushChunk(current);
          current = '';
          const wordChars = Array.from(word);
          if (wordChars.length > maxCharsPerPage) {
            for (let i = 0; i < wordChars.length; i += maxCharsPerPage) {
              const part = wordChars.slice(i, i + maxCharsPerPage).join('');
              if (i + maxCharsPerPage < wordChars.length) flushChunk(part);
              else current = part;
            }
          } else {
            current = word;
          }
        } else {
          current = next;
        }
      });
    };

    paragraphs.forEach((para, pIdx) => {
      const pTrim = para.trim();
      if (!pTrim) return;
      const sentences = pTrim.match(/[^.!?…]+[.!?…]*(\s|$)/g) || [pTrim];
      if (pIdx > 0 && current) {
        if ((current + '\n' + pTrim).length <= maxCharsPerPage && (current + '\n' + pTrim).split('\n').length <= maxLinesPerPage) {
          current += '\n';
        } else {
          flushChunk(current);
          current = '';
        }
      }
      sentences.forEach((sent) => {
        const sTrim = sent.trim();
        if (!sTrim) return;
        const sep = current ? (current.endsWith('\n') ? '' : ' ') : '';
        const candidate = current + sep + sTrim;
        if (candidate.length <= maxCharsPerPage && candidate.split('\n').length <= maxLinesPerPage) {
          current = candidate;
        } else if (sTrim.length <= maxCharsPerPage) {
          flushChunk(current);
          current = sTrim;
        } else {
          pushWordSafe(sTrim);
        }
      });
    });
    flushChunk(current);
  });

  return pages.length ? pages.slice(0, 10) : [clean.slice(0, maxCharsPerPage)];
}

function getTextCardSizeClass(pageText) {
  const txt = String(pageText || '');
  const len = txt.length;
  const lineCount = txt.split('\n').length;
  if (len <= 85 && lineCount <= 3) return 'tc-size-xl';
  if (len <= 165 && lineCount <= 4) return 'tc-size-lg';
  if (len <= 230 && lineCount <= 5) return 'tc-size-md';
  return 'tc-size-sm';
}

function _getTextCardSpecPages(spec) {
  if (!spec) return [''];
  if (Array.isArray(spec.pages) && spec.pages.length) return spec.pages;
  return splitTextCardPages(spec.raw || '');
}

/**
 * Unified HTML renderer for colored Text Cards across feed, studio live preview,
 * city duets, and the fullscreen lightbox reader.
 */
function renderTextCardMarkup(spec, opts = {}) {
  const s = spec || {};
  const lang = opts.lang || REMO_I18N.getLang();
  const context = opts.context || 'feed';
  const city = opts.city || getCityById(s.cityId || 'montreal') || { id: 'montreal', flag: '🌍', name_en: 'World', name_fr: 'Monde', themeColor: '#38bdf8' };
  const theme = REMO_TEXT_CARD_THEMES[s.theme] ? s.theme : 'aurora';
  const fontStyle = REMO_TEXT_CARD_FONTS[s.fontStyle] ? s.fontStyle : 'modern';
  const align = s.align === 'left' ? 'left' : 'center';
  const motion = s.motion === 'still' ? 'still' : 'glow';
  const badgeKey = REMO_TEXT_CARD_BADGE_KEYS[s.badgeType];
  const badgeLabel = badgeKey ? t(badgeKey) : '';

  const pages = _getTextCardSpecPages(s);
  const len = pages.length;
  const idx = (((Number(opts.pageIdx) || 0) % len) + len) % len;
  const curText = pages[idx] || opts.emptyHint || '';
  const sizeCls = getTextCardSizeClass(curText);
  const mysteryMasked = Boolean(opts.mysteryMasked);
  const dedicatedTo = String(opts.dedicatedTo || s.dedicatedTo || '').replace(/[\r\n<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 32);
  const authorHandle = opts.authorName ? `@${escapeHtmlStr(opts.authorName)}` : '';
  const locText = mysteryMasked
    ? t('tc_guess_masked_loc')
    : `${city.flag || '🌍'} ${escapeHtmlStr(getCityName(city, lang))}`;

  const showPager = len > 1 && context !== 'compact';
  const stepCall = opts.stepCall || ((d) => `stepPostTextCardPage('${opts.postId}', ${d}, event)`);
  const dotCall = opts.dotCall || ((i) => `setPostTextCardPageIndex('${opts.postId}', ${i}, event)`);
  const touchAttr = (context === 'feed' && opts.postId && len > 1)
    ? `ontouchstart="initCarouselTouchSwipe(this, '${opts.postId}', 'stepPostTextCardPage')"`
    : '';
  const themeStyle = theme === 'city'
    ? `style="--tc-city-color:${escapeHtmlStr(city.themeColor || '#38bdf8')};"`
    : '';

  return `
    <div class="remo-text-card-stage tc-theme-${theme} tc-font-${fontStyle} ${motion === 'glow' ? 'tc-living-glow' : ''} ${context === 'preview' ? 'is-preview' : ''}" ${themeStyle} ${touchAttr}>
      <div class="tc-top-row">
        <span style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
          ${badgeLabel ? `<span class="tc-cat-pill">${escapeHtmlStr(badgeLabel)}</span>` : ''}
          ${dedicatedTo ? `<span class="tc-for-pill">${escapeHtmlStr(t('tc_dedicated_prefix'))} ${escapeHtmlStr(dedicatedTo)}</span>` : ''}
        </span>
        ${len > 1 ? `<span class="tc-page-pill">📖 ${idx + 1}/${len}</span>` : ''}
      </div>

      <div class="tc-body-scroll">
        <div class="tc-body-text align-${align} ${sizeCls}">${escapeHtmlStr(curText)}</div>
      </div>

      <div class="tc-footer-meta">
        <span>${locText}</span>
        ${authorHandle ? `<span>${authorHandle}</span>` : ''}
      </div>

      ${showPager ? `
        <button type="button" class="carousel-nav-btn prev" onclick="${stepCall(-1)}" title="Prev">‹</button>
        <button type="button" class="carousel-nav-btn next" onclick="${stepCall(1)}" title="Next">›</button>
        <div class="carousel-dots">
          ${pages.map((_, i) => `<span class="carousel-dot ${i === idx ? 'active' : ''}" onclick="${dotCall(i)}"></span>`).join('')}
        </div>
      ` : ''}
    </div>
  `;
}

function _isTextCardMysteryMasked(p) {
  if (!p || !p.mysteryCity) return false;
  const u = REMO_STORE.getCurrentUser();
  const isPostOwner = Boolean(u && (
    (p.uid && u.uid === p.uid) ||
    (p.authorUid && u.uid === p.authorUid) ||
    (u.email && p.authorEmail && u.email.toLowerCase() === p.authorEmail.toLowerCase()) ||
    (u.name && p.authorName && u.name.trim().toLowerCase() === p.authorName.trim().toLowerCase())
  ));
  return !isPostOwner && typeof isMysteryCityMaskedForViewer === 'function' && isMysteryCityMaskedForViewer(p, u);
}

function renderPostTextCardStage(p, city, lang, opts = {}) {
  const mysteryMasked = _isTextCardMysteryMasked(p);
  const idx = _carouselState[p.id] || 0;
  const dedicatedTo = getEffectiveTextCardRecipient(p);
  const html = renderTextCardMarkup(p.textCard, {
    context: opts.compact ? 'compact' : 'feed',
    postId: p.id,
    city,
    authorName: p.authorName || 'Citizen',
    lang,
    pageIdx: idx,
    mysteryMasked,
    dedicatedTo
  });
  return `<div class="tc-stage-host" data-tc-post-id="${p.id}" style="width:100%;height:100%;">${html}</div>`;
}

function stepPostTextCardPage(postId, delta, ev) {
  if (ev) ev.stopPropagation();
  const p = findFeedPostById(postId);
  if (!p || !p.textCard) return;
  const pages = _getTextCardSpecPages(p.textCard);
  const len = pages.length;
  _carouselState[postId] = (((_carouselState[postId] || 0) + delta) % len + len) % len;
  _refreshTextCardStageHost(postId, p);
}

function setPostTextCardPageIndex(postId, index, ev) {
  if (ev) ev.stopPropagation();
  const p = findFeedPostById(postId);
  if (!p || !p.textCard) return;
  const pages = _getTextCardSpecPages(p.textCard);
  _carouselState[postId] = Math.max(0, Math.min(index, pages.length - 1));
  _refreshTextCardStageHost(postId, p);
}

function _refreshTextCardStageHost(postId, p) {
  const box = document.getElementById('post_media_' + postId);
  const host = box ? box.querySelector('.tc-stage-host') : null;
  if (host) {
    const lang = REMO_I18N.getLang();
    const city = getCityById(p.cityId) || getCityById('montreal');
    host.outerHTML = renderPostTextCardStage(p, city, lang);
    RemoAudio.play('click');
  } else {
    renderSocialFeed();
  }
}

function _wrapCanvasTextLines(ctx, text, maxWidth) {
  const out = [];
  const pushLongWord = (word) => {
    const chars = Array.from(word);
    let chunk = '';
    chars.forEach((ch) => {
      const candidate = chunk + ch;
      if (chunk && ctx.measureText(candidate).width > maxWidth) {
        out.push(chunk);
        chunk = ch;
      } else {
        chunk = candidate;
      }
    });
    if (chunk) out.push(chunk);
  };

  String(text || '').replace(/\r\n/g, '\n').split('\n').forEach((para) => {
    const trimmed = para.trim();
    if (!trimmed) { out.push(''); return; }
    const words = trimmed.split(/\s+/);
    let line = '';
    words.forEach((word) => {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width <= maxWidth) {
        line = test;
      } else {
        if (line) {
          out.push(line);
          line = '';
        }
        if (ctx.measureText(word).width <= maxWidth) {
          line = word;
        } else {
          pushLongWord(word);
        }
      }
    });
    if (line) out.push(line);
  });
  return out;
}

/**
 * Shared Canvas frame renderer for colored Text Cards (used by PNG download,
 * 4D Card minting, World Window Story export, and 9:16 Video Reels).
 */
function drawTextCardCanvasFrame(ctx, w, h, spec, pageIdx, city, authorName, lang, mysteryMasked = false, tSec = 0) {
  const s = spec || {};
  const theme = REMO_TEXT_CARD_THEMES[s.theme] || REMO_TEXT_CARD_THEMES.aurora;
  const fontSpec = REMO_TEXT_CARD_FONTS[s.fontStyle] || REMO_TEXT_CARD_FONTS.modern;
  const pages = _getTextCardSpecPages(s);
  const len = pages.length;
  const idx = (((Number(pageIdx) || 0) % len) + len) % len;
  const pageText = pages[idx] || '';

  const cityColor = (city && city.themeColor) || '#38bdf8';
  const bg = ctx.createLinearGradient(0, 0, w, h);
  if (theme.id === 'city') {
    bg.addColorStop(0, '#050816');
    bg.addColorStop(0.5, cityColor + '55');
    bg.addColorStop(1, '#050816');
  } else {
    bg.addColorStop(0, theme.stops[0]);
    bg.addColorStop(0.52, theme.stops[1]);
    bg.addColorStop(1, theme.stops[2]);
  }
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Subtle living aura halo
  const pulseR = Math.max(w, h) * (0.48 + Math.sin(tSec * 2.4) * 0.04);
  const halo = ctx.createRadialGradient(w * 0.25, h * 0.22, 10, w * 0.25, h * 0.22, pulseR);
  halo.addColorStop(0, 'rgba(255,255,255,0.14)');
  halo.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, w, h);

  // Oversized decorative opening quote
  ctx.save();
  ctx.font = `900 ${Math.round(w * 0.24)}px Georgia, serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('“', Math.round(w * 0.05), Math.round(h * 0.04));
  ctx.restore();

  // Top category & page pills
  const padX = Math.round(w * 0.08);
  const topY = Math.round(h * 0.075);
  const badgeKey = REMO_TEXT_CARD_BADGE_KEYS[s.badgeType];
  ctx.save();
  ctx.textBaseline = 'middle';
  const drawPill = (labelTxt, xLeft, fillCol, textCol, bold = true) => {
    const pFontPx = Math.round(w * 0.026);
    ctx.font = `${bold ? '900' : '800'} ${pFontPx}px "Outfit", sans-serif`;
    const pPadX = Math.round(w * 0.026);
    const pillH = Math.round(pFontPx * 1.9);
    const pillW = Math.min(w - padX * 2, Math.round(ctx.measureText(labelTxt).width + pPadX * 2));
    const px = xLeft != null ? xLeft : (w - padX - pillW);
    ctx.fillStyle = fillCol;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.24)';
    ctx.lineWidth = Math.max(1.5, w * 0.002);
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(px, topY - pillH / 2, pillW, pillH, pillH / 2);
    } else {
      ctx.rect(px, topY - pillH / 2, pillW, pillH);
    }
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = textCol;
    ctx.textAlign = 'left';
    ctx.fillText(labelTxt, px + pPadX, topY + 1);
    return pillW;
  };
  let nextPillX = padX;
  if (badgeKey) {
    const bw = drawPill(t(badgeKey).toUpperCase(), padX, 'rgba(15, 23, 42, 0.56)', '#fde68a', true);
    nextPillX = padX + bw + Math.round(w * 0.015);
  }
  const dedicatedTo = String(s.dedicatedTo || '').replace(/[\r\n<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 24);
  if (dedicatedTo) {
    const forWord = lang === 'fr' ? 'POUR' : 'FOR';
    drawPill(`🎁 ${forWord} ${dedicatedTo.toUpperCase()}`, nextPillX, 'rgba(251, 191, 36, 0.25)', '#fef08a', true);
  }
  if (len > 1) {
    drawPill(`📖 ${idx + 1}/${len}`, null, 'rgba(15, 23, 42, 0.58)', '#ffffff', false);
  }

  // Adaptive centered or left-aligned message text bounded safely between top badge & footer
  const maxTextW = w - padX * 2;
  const safeTop = Math.round(h * 0.16);
  const safeBottom = Math.round(h * 0.87);
  const safeH = safeBottom - safeTop;
  const density = pageText.length;
  let fontPx = Math.round(density <= 85 ? w * 0.068 : density <= 165 ? w * 0.052 : density <= 230 ? w * 0.043 : w * 0.037);
  const minFontPx = Math.max(16, Math.round(w * 0.026));
  let lineH = Math.round(fontPx * 1.36);
  ctx.font = `${fontSpec.style} ${fontSpec.weight} ${fontPx}px ${fontSpec.family}`;
  let lines = _wrapCanvasTextLines(ctx, pageText, maxTextW);

  while (lines.length * lineH > safeH && fontPx > minFontPx) {
    fontPx = Math.max(minFontPx, fontPx - 2);
    lineH = Math.round(fontPx * 1.36);
    ctx.font = `${fontSpec.style} ${fontSpec.weight} ${fontPx}px ${fontSpec.family}`;
    lines = _wrapCanvasTextLines(ctx, pageText, maxTextW);
  }

  const totalTextH = lines.length * lineH;
  const isLeft = s.align === 'left';

  ctx.textAlign = isLeft ? 'left' : 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = theme.textColor || '#ffffff';
  ctx.shadowColor = 'rgba(0,0,0,0.45)';
  ctx.shadowBlur = 14;
  const startY = safeTop + Math.max(0, Math.round((safeH - totalTextH) / 2));
  const textX = isLeft ? padX : Math.round(w / 2);

  lines.forEach((ln, i) => {
    const ly = startY + i * lineH;
    if (ly + fontPx <= safeBottom + 4) ctx.fillText(ln, textX, ly);
  });
  ctx.restore();

  // Footer signature + REMO mark
  ctx.save();
  ctx.textBaseline = 'bottom';
  ctx.font = `800 ${Math.round(w * 0.026)}px "Outfit", sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.82)';
  ctx.textAlign = 'left';
  const loc = mysteryMasked ? t('tc_guess_masked_loc') : `${(city && city.flag) || '🌍'} ${getCityName(city || getCityById('montreal'), lang)}`;
  ctx.fillText(loc, padX, h - Math.round(h * 0.045));

  ctx.textAlign = 'right';
  ctx.fillStyle = theme.accent || '#38bdf8';
  ctx.fillText(`${authorName ? '@' + authorName + ' · ' : ''}REMOWORLD.COM`, w - padX, h - Math.round(h * 0.045));
  ctx.restore();
}

function renderTextCardToDataUrl(postOrSpec, pageIdx = 0, opts = {}) {
  try {
    const isPost = Boolean(postOrSpec && postOrSpec.textCard);
    const rawSpec = isPost ? postOrSpec.textCard : postOrSpec;
    if (!rawSpec) return '';
    const effTo = isPost ? getEffectiveTextCardRecipient(postOrSpec) : (rawSpec.dedicatedTo || '');
    const spec = effTo ? { ...rawSpec, dedicatedTo: effTo } : rawSpec;
    const lang = opts.lang || REMO_I18N.getLang();
    const city = getCityById((isPost ? postOrSpec.cityId : spec.cityId) || 'montreal') || getCityById('montreal');
    const authorName = (isPost ? postOrSpec.authorName : opts.authorName) || 'Citizen';
    const cv = document.createElement('canvas');
    cv.width = opts.width || 720;
    cv.height = opts.height || 900;
    const ctx = cv.getContext('2d');
    drawTextCardCanvasFrame(ctx, cv.width, cv.height, spec, pageIdx, city, authorName, lang, Boolean(opts.mysteryMasked), 0);
    const mime = opts.mime || 'image/jpeg';
    return mime === 'image/png' ? cv.toDataURL('image/png') : cv.toDataURL(mime, opts.quality || 0.9);
  } catch (e) {
    return '';
  }
}

function _getStudioTextCardSpecFromDom() {
  const inp = document.getElementById('createTextCardInp');
  const raw = (inp ? inp.value : '').trim().slice(0, REMO_TEXT_CARD_CHAR_LIMIT);
  const badgeType = document.getElementById('createTextCardBadgeSel')?.value || 'proverb';
  const fontStyle = document.getElementById('createTextCardFontSel')?.value || 'modern';
  const dedicatedTo = (document.getElementById('createTextCardToInp')?.value || '').replace(/[\r\n<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 32);
  return {
    raw,
    pages: splitTextCardPages(raw),
    theme: _textCardStudioState.theme || 'aurora',
    fontStyle,
    badgeType,
    align: _textCardStudioState.align || 'center',
    motion: _textCardStudioState.motion || 'glow',
    dedicatedTo
  };
}

function renderTextCardThemeSwatches() {
  const wrap = document.getElementById('tcThemeSwatches');
  if (!wrap) return;
  wrap.innerHTML = Object.values(REMO_TEXT_CARD_THEMES).map((th) => `
    <button type="button" class="tc-swatch-btn ${_textCardStudioState.theme === th.id ? 'active' : ''}"
      style="background:${th.swatch};" title="${th.id}"
      onclick="selectTextCardTheme('${th.id}')"></button>
  `).join('');
}

function selectTextCardTheme(themeId) {
  if (!REMO_TEXT_CARD_THEMES[themeId]) return;
  _textCardStudioState.theme = themeId;
  renderTextCardThemeSwatches();
  updateTextCardStudioPreview();
}

function updateTextCardStudioPreview() {
  const wrap = document.getElementById('tcStudioPreviewWrap');
  const inp = document.getElementById('createTextCardInp');
  const counterEl = document.getElementById('tcCharCounter');
  const spec = _getStudioTextCardSpecFromDom();
  const len = (inp ? inp.value : '').length;
  const pageCount = spec.pages.length;

  if (_textCardStudioState.previewPage >= pageCount) {
    _textCardStudioState.previewPage = Math.max(0, pageCount - 1);
  }

  if (counterEl) {
    counterEl.textContent = `${len} / ${REMO_TEXT_CARD_CHAR_LIMIT} · 📖 ${_textCardStudioState.previewPage + 1}/${pageCount}`;
    counterEl.classList.toggle('warn', len >= 1400 && len < REMO_TEXT_CARD_CHAR_LIMIT);
    counterEl.classList.toggle('full', len >= REMO_TEXT_CARD_CHAR_LIMIT);
  }

  if (!wrap) return;
  const lang = REMO_I18N.getLang();
  const cityId = document.getElementById('createCitySelect')?.value || 'montreal';
  const city = getCityById(cityId);
  const u = REMO_STORE.getCurrentUser();
  const mystery = Boolean(document.getElementById('createMysteryCityToggle')?.checked);
  const placeholderHint = lang === 'fr'
    ? 'Votre proverbe, bon vœu ou histoire apparaîtra ici en couleurs...'
    : 'Your proverb, good wish, or short story appears here in color...';

  wrap.innerHTML = renderTextCardMarkup(spec, {
    context: 'preview',
    city,
    authorName: (u && u.name) ? u.name : 'Citizen',
    lang,
    pageIdx: _textCardStudioState.previewPage,
    mysteryMasked: mystery,
    emptyHint: placeholderHint,
    stepCall: (d) => `stepStudioTextCardPreview(${d}, event)`,
    dotCall: (i) => `setStudioTextCardPreviewPage(${i}, event)`
  });
}

function handleTextCardInputChange() {
  updateTextCardStudioPreview();
}

function handleTextCardStyleChange() {
  updateTextCardStudioPreview();
}

function stepStudioTextCardPreview(delta, ev) {
  if (ev) ev.stopPropagation();
  const pages = _getStudioTextCardSpecFromDom().pages;
  _textCardStudioState.previewPage = (((_textCardStudioState.previewPage + delta) % pages.length) + pages.length) % pages.length;
  updateTextCardStudioPreview();
}

function setStudioTextCardPreviewPage(idx, ev) {
  if (ev) ev.stopPropagation();
  const pages = _getStudioTextCardSpecFromDom().pages;
  _textCardStudioState.previewPage = Math.max(0, Math.min(idx, pages.length - 1));
  updateTextCardStudioPreview();
}

function insertTextCardPageBreak() {
  const inp = document.getElementById('createTextCardInp');
  if (!inp) return;
  const pos = inp.selectionStart ?? inp.value.length;
  const before = inp.value.slice(0, pos).trimEnd();
  const after = inp.value.slice(pos).trimStart();
  const nextVal = (before ? before + '\n---\n' : '---\n') + after;
  inp.value = nextVal.slice(0, REMO_TEXT_CARD_CHAR_LIMIT);
  inp.focus();
  const newPages = splitTextCardPages(inp.value);
  _textCardStudioState.previewPage = Math.max(0, newPages.length - 1);
  updateTextCardStudioPreview();
  RemoAudio.play('click');
}

function fillTextCardInspiration() {
  const lang = REMO_I18N.getLang();
  const cityId = document.getElementById('createCitySelect')?.value || 'montreal';
  const city = getCityById(cityId);
  const idea = REMO_TEXT_CARD_IDEAS[_textCardStudioState.inspireIdx % REMO_TEXT_CARD_IDEAS.length];
  _textCardStudioState.inspireIdx++;

  const txt = (lang === 'fr' ? idea.fr : idea.en).replace(/\{city\}/g, `${city.flag} ${getCityName(city, lang)}`);
  const inp = document.getElementById('createTextCardInp');
  if (inp) inp.value = txt.slice(0, REMO_TEXT_CARD_CHAR_LIMIT);
  const bSel = document.getElementById('createTextCardBadgeSel');
  if (bSel && idea.badge) bSel.value = idea.badge;
  const fSel = document.getElementById('createTextCardFontSel');
  if (fSel && idea.font) fSel.value = idea.font;
  _textCardStudioState.theme = idea.theme || 'aurora';
  _textCardStudioState.previewPage = 0;

  renderTextCardThemeSwatches();
  updateTextCardStudioPreview();
  RemoAudio.play('coin');
}

function randomizeTextCardStyle() {
  const themeKeys = Object.keys(REMO_TEXT_CARD_THEMES);
  const fontKeys = Object.keys(REMO_TEXT_CARD_FONTS);
  _textCardStudioState.theme = themeKeys[Math.floor(Math.random() * themeKeys.length)];
  const fSel = document.getElementById('createTextCardFontSel');
  if (fSel) fSel.value = fontKeys[Math.floor(Math.random() * fontKeys.length)];
  renderTextCardThemeSwatches();
  updateTextCardStudioPreview();
  RemoAudio.play('click');
}

function toggleTextCardAlign() {
  _textCardStudioState.align = _textCardStudioState.align === 'center' ? 'left' : 'center';
  const btn = document.getElementById('btnTcAlignToggle');
  if (btn) {
    btn.textContent = _textCardStudioState.align === 'left' ? t('tc_align_left') : t('tc_align_center');
    btn.classList.toggle('active', _textCardStudioState.align === 'left');
  }
  updateTextCardStudioPreview();
}

function toggleTextCardMotion() {
  _textCardStudioState.motion = _textCardStudioState.motion === 'glow' ? 'still' : 'glow';
  const btn = document.getElementById('btnTcMotionToggle');
  if (btn) {
    btn.textContent = _textCardStudioState.motion === 'glow' ? t('tc_motion_on') : t('tc_motion_off');
    btn.classList.toggle('active', _textCardStudioState.motion === 'glow');
  }
  updateTextCardStudioPreview();
}

function clearTextCardInput() {
  const inp = document.getElementById('createTextCardInp');
  if (inp) inp.value = '';
  const toInp = document.getElementById('createTextCardToInp');
  if (toInp) toInp.value = '';
  _textCardStudioState.previewPage = 0;
  updateTextCardStudioPreview();
}

function resetTextCardStudioState() {
  _textCardStudioState.theme = 'aurora';
  _textCardStudioState.align = 'center';
  _textCardStudioState.motion = 'glow';
  _textCardStudioState.previewPage = 0;
  const inp = document.getElementById('createTextCardInp');
  if (inp) inp.value = '';
  const toInp = document.getElementById('createTextCardToInp');
  if (toInp) toInp.value = '';
  const bSel = document.getElementById('createTextCardBadgeSel');
  if (bSel) bSel.value = 'proverb';
  const fSel = document.getElementById('createTextCardFontSel');
  if (fSel) fSel.value = 'modern';
  const alignBtn = document.getElementById('btnTcAlignToggle');
  if (alignBtn) {
    alignBtn.textContent = t('tc_align_center');
    alignBtn.classList.remove('active');
  }
  const motBtn = document.getElementById('btnTcMotionToggle');
  if (motBtn) {
    motBtn.textContent = t('tc_motion_on');
    motBtn.classList.add('active');
  }
  renderTextCardThemeSwatches();
  updateTextCardStudioPreview();
}

function openReplyTextCardTo(recipientName = '', cityId = '') {
  if (typeof openCreatePostModal === 'function') openCreatePostModal();
  if (typeof switchCreateStudioTab === 'function') switchCreateStudioTab('textcard');
  const citySel = document.getElementById('createCitySelect');
  if (citySel && cityId) citySel.value = cityId;
  const toInp = document.getElementById('createTextCardToInp');
  if (toInp) toInp.value = String(recipientName || '').replace(/[\r\n<>]/g, '').trim().slice(0, 32);
  const bSel = document.getElementById('createTextCardBadgeSel');
  if (bSel) bSel.value = 'wish';
  updateTextCardStudioPreview();
  setTimeout(() => document.getElementById('createTextCardInp')?.focus(), 60);
}
window.openReplyTextCardTo = openReplyTextCardTo;

function downloadTextCardPng(postId, pageIdx = null) {
  const p = findFeedPostById(postId);
  if (!p || !p.textCard) return;
  const idx = pageIdx != null ? pageIdx : (_carouselState[postId] || 0);
  const url = renderTextCardToDataUrl(p, idx, {
    width: 900,
    height: 1125,
    mime: 'image/png',
    mysteryMasked: _isTextCardMysteryMasked(p)
  });
  if (!url) return;
  const a = document.createElement('a');
  a.href = url;
  a.download = `REMO_TextCard_${postId}_p${idx + 1}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  RemoAudio.play('coin');
}

function copyTextCardText(postId) {
  const p = findFeedPostById(postId);
  if (!p || !p.textCard) return;
  const raw = p.textCard.raw || _getTextCardSpecPages(p.textCard).join('\n\n');
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(raw).catch(() => {});
  }
  remoToast(t('tc_copied_toast'), 'coin');
}

function downloadCurrentLightboxTextCardPng() {
  if (!currentLightboxPostId) return;
  const idx = _carouselState['lb_' + currentLightboxPostId] ?? (_carouselState[currentLightboxPostId] || 0);
  downloadTextCardPng(currentLightboxPostId, idx);
}

window.stepPostTextCardPage = stepPostTextCardPage;
window.setPostTextCardPageIndex = setPostTextCardPageIndex;
window.selectTextCardTheme = selectTextCardTheme;
window.handleTextCardInputChange = handleTextCardInputChange;
window.handleTextCardStyleChange = handleTextCardStyleChange;
window.stepStudioTextCardPreview = stepStudioTextCardPreview;
window.setStudioTextCardPreviewPage = setStudioTextCardPreviewPage;
window.insertTextCardPageBreak = insertTextCardPageBreak;
window.fillTextCardInspiration = fillTextCardInspiration;
window.randomizeTextCardStyle = randomizeTextCardStyle;
window.toggleTextCardAlign = toggleTextCardAlign;
window.toggleTextCardMotion = toggleTextCardMotion;
window.clearTextCardInput = clearTextCardInput;
window.downloadTextCardPng = downloadTextCardPng;
window.copyTextCardText = copyTextCardText;
window.downloadCurrentLightboxTextCardPng = downloadCurrentLightboxTextCardPng;

function _applyBeforeAfterSliderPct(box, pct) {
  if (!box) return;
  const clamped = Math.max(3, Math.min(97, Number(pct) || 50));
  const afterLayer = box.querySelector('.ba-after-layer');
  const divider = box.querySelector('.ba-divider-line');
  const bBadge = box.querySelector('.ba-badge-before');
  const aBadge = box.querySelector('.ba-badge-after');
  const inp = box.querySelector('.ba-range-input');
  if (afterLayer) afterLayer.style.clipPath = `inset(0 0 0 ${clamped}%)`;
  if (divider) divider.style.left = `${clamped}%`;
  if (bBadge) bBadge.style.opacity = clamped < 17 ? '0.2' : '1';
  if (aBadge) aBadge.style.opacity = clamped > 83 ? '0.2' : '1';
  if (inp && Number(inp.value) !== Math.round(clamped)) inp.value = String(Math.round(clamped));
}

function updateBeforeAfterSlider(rangeInput) {
  const box = rangeInput?.closest?.('.ba-slider-box');
  if (!box) return;
  _applyBeforeAfterSliderPct(box, rangeInput.value);
}

function stopBeforeAfterAutoSlide(el) {
  const box = el?.classList?.contains('ba-slider-box') ? el : el?.closest?.('.ba-slider-box');
  if (!box) return;
  if (box._baAnimId) {
    cancelAnimationFrame(box._baAnimId);
    box._baAnimId = 0;
  }
  const btn = box.querySelector('.ba-autoslide-btn');
  if (btn) {
    btn.classList.remove('playing');
    btn.textContent = t('ba_autoslide_btn');
  }
}

function toggleBeforeAfterAutoSlide(btn) {
  const box = btn?.closest?.('.ba-slider-box');
  if (!box) return;
  if (box._baAnimId) {
    stopBeforeAfterAutoSlide(box);
    return;
  }
  btn.classList.add('playing');
  btn.textContent = t('ba_stop_btn');
  const t0 = performance.now();
  const step = (now) => {
    if (!box.isConnected || !box._baAnimId) {
      box._baAnimId = 0;
      return;
    }
    const elapsed = (now - t0) % 3600;
    const wave = 50 - 38 * Math.sin((elapsed / 3600) * Math.PI * 2);
    _applyBeforeAfterSliderPct(box, wave);
    box._baAnimId = requestAnimationFrame(step);
  };
  box._baAnimId = requestAnimationFrame(step);
}

function rateBeforeAfterLook(postId, criterion, stars) {
  const score = Math.max(1, Math.min(5, Math.round(Number(stars) || 5)));
  if (!BA_LOOK_CRITERIA.some((c) => c.key === criterion)) return;
  const u = REMO_STORE.getCurrentUser() || REMO_STORE.ensureGuestOrCitizen('Citizen', '', 'montreal');
  const p = findFeedPostById(postId);
  if (!p) return;

  if (!p.lookRating || typeof p.lookRating !== 'object') {
    p.lookRating = { enabled: true };
  }
  p.lookRating.enabled = true;
  if (!p.lookRating.voters || typeof p.lookRating.voters !== 'object') {
    p.lookRating.voters = {};
  }
  const hadRatedBefore = Boolean(p.lookRating.voters[u.uid]);
  const prevEntry = p.lookRating.voters[u.uid] || {};
  p.lookRating.voters[u.uid] = { ...prevEntry, [criterion]: score };

  BA_LOOK_CRITERIA.forEach((c) => {
    let sum = 0;
    let count = 0;
    Object.values(p.lookRating.voters).forEach((v) => {
      const val = Number(v?.[c.key]);
      if (val >= 1 && val <= 5) {
        sum += val;
        count += 1;
      }
    });
    p.lookRating[c.key] = { sum, count };
  });

  const isOwner = p.uid && p.uid === u.uid;
  if (!hadRatedBefore && !isOwner) {
    REMO_STORE.addCoins(u.uid, 5, 5);
    if (p.uid) REMO_STORE.addCoins(p.uid, 2, 2);
    if (typeof spawnRemoCoinsFX === 'function') spawnRemoCoinsFX(4);
    remoToast(t('ba_rate_reward_toast'), 'coin');
  } else {
    remoToast(t('ba_rate_saved_toast'));
  }

  if (typeof RemoAudio !== 'undefined' && RemoAudio.play) RemoAudio.play('click');
  REMO_STORE.syncPostToCloud(p);
  REMO_STORE.save(true, 'look_rating');
  rerenderSinglePostCard(p.id);
  syncHeaderAndSidebars();
}

window.updateBeforeAfterSlider = updateBeforeAfterSlider;
window.stopBeforeAfterAutoSlide = stopBeforeAfterAutoSlide;
window.toggleBeforeAfterAutoSlide = toggleBeforeAfterAutoSlide;
window.rateBeforeAfterLook = rateBeforeAfterLook;

function voteOnPostPoll(postId, optIdx) {
  const lang = REMO_I18N.getLang();
  const u = REMO_STORE.getCurrentUser() || REMO_STORE.ensureGuestOrCitizen('Citizen', '', 'montreal');
  const p = findFeedPostById(postId);
  if (!p || !p.poll || !p.poll.options[optIdx]) return;
  p.poll.voters = p.poll.voters || [];
  if (p.poll.voters.includes(u.uid)) {
    remoToast(lang === 'fr' ? 'Vous avez déjà voté à ce sondage !' : 'You already voted on this poll!');
    return;
  }
  p.poll.voters.push(u.uid);
  p.poll.options[optIdx].votes = (p.poll.options[optIdx].votes || 0) + 1;
  REMO_STORE.addCoins(u.uid, 5, 5);
  REMO_STORE.syncPostToCloud(p);
  REMO_STORE.save(true, 'poll_vote');
  rerenderSinglePostCard(p.id);
  syncHeaderAndSidebars();
  remoToast(lang === 'fr' ? '📊 Vote enregistré (+5 🪙) !' : '📊 Poll vote counted (+5 🪙)!', 'coin');
}

function unlockSecretCapsule(postId, freeCityPass = false) {
  const lang = REMO_I18N.getLang();
  const u = REMO_STORE.getCurrentUser();
  if (!u) { openAuthModal(); return; }
  const p = REMO_STORE.state.posts.find((x) => x.id === postId);
  if (!p || !p.secretCapsule) return;

  const sc = p.secretCapsule;
  sc.unlockedBy = sc.unlockedBy || [];
  if (sc.unlockedBy.includes(u.uid)) return;

  if (!freeCityPass) {
    const cost = sc.cost || 15;
    if (!REMO_STORE.addCoins(u.uid, -cost, 5)) {
      remoToast(lang === 'fr' ? `Il faut ${cost} 🪙 pour débloquer cette capsule !` : `Need ${cost} 🪙 to unlock this capsule!`);
      return;
    }
    if (p.uid) REMO_STORE.addCoins(p.uid, cost, 5);
    p.tipsTotal = (p.tipsTotal || 0) + cost;
  }

  sc.unlockedBy.push(u.uid);
  REMO_STORE.syncPostToCloud(p);
  REMO_STORE.save(true, 'capsule_unlock');
  spawnRemoCoinsFX(6);
  rerenderSinglePostCard(p.id);
  syncHeaderAndSidebars();
  remoToast(
    lang === 'fr' ? '🔓 Capsule secrète débloquée !' : '🔓 Secret Creator Capsule unlocked!',
    'fanfare'
  );
}

function reactEmojiToPost(postId, emoji) {
  const u = REMO_STORE.getCurrentUser() || REMO_STORE.ensureGuestOrCitizen('Citizen', '', 'montreal');
  const p = findFeedPostById(postId);
  if (!p) return;
  p.reactions = p.reactions || {};
  p.reactions[emoji] = (p.reactions[emoji] || 0) + 1;
  RemoAudio.play('click');
  if (p.uid && p.uid !== u.uid) {
    REMO_STORE.addNotification({
      toUid: p.uid,
      fromUid: u.uid,
      fromName: u.name,
      fromCity: u.homeCity,
      type: 'reaction',
      emoji: emoji,
      postId: p.id,
      text: REMO_I18N.getLang() === 'fr' ? `a réagi avec ${emoji} à votre publication` : `reacted with ${emoji} to your post`
    });
  }
  REMO_STORE.syncPostToCloud(p);
  REMO_STORE.save(true, 'reaction');
  rerenderSinglePostCard(p.id);
}

/* ── 4. MULTI-FORMAT CREATOR STUDIO (PHOTO / 60S VIDEO / LIVE HTML / REEL) ── */
function stopActiveCam60Stream() {
  if (cam60Timer) {
    clearInterval(cam60Timer);
    cam60Timer = null;
  }
  if (cam60Recorder && cam60Recorder.state === 'recording') {
    try { cam60Recorder.stop(); } catch (e) {}
  }
  if (cam60Stream) {
    cam60Stream.getTracks().forEach((tr) => tr.stop());
    cam60Stream = null;
  }
}

function closeCreatePostModal() {
  stopActiveCam60Stream();
  stopBeforeAfterAutoSlide(document.querySelector('#baStudioPreviewStage .ba-slider-box'));
  if (window.RemoAudio) {
    if (window.RemoAudio.activeSoundtrackPostId === 'studio_preview') window.RemoAudio.stopSoundtrackLoop();
    if (window.RemoAudio.activeBeatTargetId === 'studio_preview') window.RemoAudio.stopBeatPattern();
  }
  document.getElementById('createModal')?.classList.remove('open');
}

function switchCreateStudioTab(tabId) {
  const isAdm = REMO_STORE.isAdminUnlocked() || REMO_STORE.isCurrentUserAdmin();
  if (tabId === 'versus' && !isAdm) {
    remoToast(REMO_I18N.getLang() === 'fr' ? 'Seul l’administrateur peut publier un Duel Officiel !' : 'Only the administrator can create an Official City Duel!');
    tabId = 'photo';
  }
  if (tabId === 'html' && !isAdm) {
    remoToast(REMO_I18N.getLang() === 'fr' ? 'Le studio HTML Live est réservé aux administrateurs !' : 'Live HTML Studio is reserved for administrators!');
    tabId = 'photo';
  }
  activeCreateStudioTab = tabId;
  document.querySelectorAll('.studio-tab-btn').forEach((b) => {
    b.classList.toggle('active', b.getAttribute('data-studio-tab') === tabId);
  });
  document.querySelectorAll('.studio-pane').forEach((p) => p.classList.remove('active'));
  document.getElementById('studioPane-' + tabId)?.classList.add('active');
  if (tabId !== 'video') stopActiveCam60Stream();

  const capEl = document.getElementById('createCaptionInp');
  if (capEl) {
    capEl.placeholder = tabId === 'textcard' ? t('tc_cap_opt_hint') : t('create_caption_ph');
  }

  if (tabId === 'beforeafter') {
    renderBeforeAfterStudioPreview();
  }

  if (tabId === 'textcard') {
    renderTextCardThemeSwatches();
    updateTextCardStudioPreview();
    setTimeout(() => document.getElementById('createTextCardInp')?.focus(), 40);
  }

  if (tabId === 'versus') {
    const leftSel = document.getElementById('createVersusLeftCity');
    const rightSel = document.getElementById('createVersusRightCity');
    const cities = getRemoCities();
    const lang = REMO_I18N.getLang();
    if (leftSel && (!leftSel.children || leftSel.children.length !== cities.length)) {
      const prevLeft = leftSel.value || 'montreal';
      leftSel.innerHTML = cities.map((c) => `<option value="${c.id}">${c.flag} ${getCityName(c, lang)}</option>`).join('');
      leftSel.value = cities.some((c) => c.id === prevLeft) ? prevLeft : 'montreal';
    }
    if (rightSel && (!rightSel.children || rightSel.children.length !== cities.length)) {
      const prevRight = rightSel.value || 'paris';
      rightSel.innerHTML = cities.map((c) => `<option value="${c.id}">${c.flag} ${getCityName(c, lang)}</option>`).join('');
      rightSel.value = cities.some((c) => c.id === prevRight) ? prevRight : 'paris';
    }
    updateVersusAutoPreviews();
  }
}

function openCreatePostModal(prefillTag = '') {
  stopActiveCam60Stream();
  pendingStudioPhotoBlobs = [];
  pendingStudioPhotoPreviewUrls.forEach((u) => URL.revokeObjectURL(u));
  pendingStudioPhotoPreviewUrls = [];
  pendingStudioPhotoFilter = 'flt-none';
  resetBeforeAfterStudioState();
  pendingStudioVideoBlob = null;
  pendingStudioVideoDuration = 0;
  pendingRawLongVideoFile = null;
  window._pendingEnforce60sCap = false;
  pendingRemixParent = null;
  pendingPostMediaDataUrl = '';
  pendingPostVoiceBlob = null;
  pendingPostVoiceDataUrl = '';
  pendingPostGpsVerified = false;
  pendingVersusMedia = { left: '', right: '' };
  const vLPrev = document.getElementById('versusLeftPreview');
  if (vLPrev) { vLPrev.style.display = 'none'; vLPrev.innerHTML = ''; }
  const vRPrev = document.getElementById('versusRightPreview');
  if (vRPrev) { vRPrev.style.display = 'none'; vRPrev.innerHTML = ''; }
  if (typeof activeCreateStudioTab !== 'undefined' && activeCreateStudioTab === 'versus') {
    updateVersusAutoPreviews();
  }
  const fLInp = document.getElementById('createVersusLeftFile');
  if (fLInp) fLInp.value = '';
  const fRInp = document.getElementById('createVersusRightFile');
  if (fRInp) fRInp.value = '';

  const sel = document.getElementById('createCitySelect');
  const lang = REMO_I18N.getLang();
  const u = REMO_STORE.getCurrentUser();
  if (sel) {
    sel.innerHTML = getRemoCities().map((c) =>
      `<option value="${c.id}" ${u && u.homeCity === c.id ? 'selected' : ''}>${c.flag} ${getCityName(c, lang)}</option>`
    ).join('');
  }

  const cap = document.getElementById('createCaptionInp');
  if (cap) cap.value = prefillTag ? `${prefillTag} ` : '';
  const remixBanner = document.getElementById('createRemixBanner');
  if (remixBanner) remixBanner.style.display = 'none';
  pendingDuetParent = null;
  const duetBanner = document.getElementById('createDuetBanner');
  if (duetBanner) duetBanner.style.display = 'none';
  renderStudioPhotoThumbnails();
  const cmpWrap = document.getElementById('studioCompareWrap');
  if (cmpWrap) cmpWrap.style.display = 'none';
  const cmpChk = document.getElementById('studioCompareToggle');
  if (cmpChk) cmpChk.checked = false;
  const sndSel = document.getElementById('createPhotoSoundSelect');
  if (sndSel) sndSel.value = '';
  if (window.RemoAudio) {
    if (window.RemoAudio.activeSoundtrackPostId === 'studio_preview') window.RemoAudio.stopSoundtrackLoop();
    if (window.RemoAudio.activeBeatTargetId === 'studio_preview') window.RemoAudio.stopBeatPattern();
  }
  const vidPrev = document.getElementById('studioVideo60Preview');
  if (vidPrev) { vidPrev.style.display = 'none'; vidPrev.srcObject = null; vidPrev.src = ''; }
  const extUrlInp = document.getElementById('createVideoExternalUrlInput');
  if (extUrlInp) extUrlInp.value = '';
  const extPrevBox = document.getElementById('studioExternalLinkPreviewBox');
  if (extPrevBox) { extPrevBox.style.display = 'none'; extPrevBox.innerHTML = ''; }
  const timerRow = document.getElementById('video60TimerRow');
  if (timerRow) timerRow.style.display = 'none';
  const htmlFrame = document.getElementById('studioHtmlLivePreview');
  if (htmlFrame) { htmlFrame.style.display = 'none'; htmlFrame.srcdoc = ''; }
  const isAdm = REMO_STORE.isAdminUnlocked() || REMO_STORE.isCurrentUserAdmin();
  const admTplBox = document.getElementById('adminHtmlTemplatesBox');
  if (admTplBox) admTplBox.style.display = isAdm ? 'block' : 'none';
  const copilotGameBtn = document.getElementById('copilotGameBtn');
  if (copilotGameBtn) copilotGameBtn.style.display = isAdm ? 'inline-flex' : 'none';
  const versusTabBtn = document.getElementById('studioTabVersusBtn');
  if (versusTabBtn) versusTabBtn.style.display = isAdm ? 'inline-flex' : 'none';
  const htmlTabBtn = document.getElementById('studioTabHtmlBtn');
  if (htmlTabBtn) htmlTabBtn.style.display = isAdm ? 'inline-flex' : 'none';
  document.querySelector('#createModal .studio-tabs')?.classList.toggle('has-admin-tabs', isAdm);
  if (!isAdm && (activeCreateStudioTab === 'versus' || activeCreateStudioTab === 'html')) {
    switchCreateStudioTab('photo');
  }

  // Keep live Text Card preview in sync when City or Guess-My-City changes
  const citySelHook = document.getElementById('createCitySelect');
  if (citySelHook && !citySelHook._hasTcHook) {
    citySelHook._hasTcHook = true;
    citySelHook.addEventListener('change', () => {
      if (activeCreateStudioTab === 'textcard') updateTextCardStudioPreview();
    });
  }
  const mysHook = document.getElementById('createMysteryCityToggle');
  if (mysHook && !mysHook._hasTcHook) {
    mysHook._hasTcHook = true;
    mysHook.addEventListener('change', () => {
      if (activeCreateStudioTab === 'textcard') updateTextCardStudioPreview();
    });
  }

  const htmlArea = document.getElementById('createHtmlCodeArea');
  if (htmlArea) {
    if (isAdm && !htmlArea.value.trim()) {
      htmlArea.value = REMO_HTML_TEMPLATES.fireworks;
    } else if (!isAdm) {
      htmlArea.value = '';
    }
  }

  // Reset Mystery Box, Poll, Secret Capsule & Viral Goal toggles
  const mboxT = document.getElementById('createMysteryBoxToggle');
  if (mboxT) mboxT.checked = false;
  const mboxF = document.getElementById('createMysteryBoxFields');
  if (mboxF) mboxF.style.display = 'none';
  ['createMysteryBoxTeaser', 'createMysteryBoxGuessQ', 'createMysteryBoxOptA', 'createMysteryBoxOptB'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const mboxSel = document.getElementById('createMysteryBoxTheme');
  if (mboxSel) mboxSel.value = 'silver';

  const pollT = document.getElementById('createPollToggle');
  if (pollT) pollT.checked = false;
  const pollF = document.getElementById('createPollFields');
  if (pollF) pollF.style.display = 'none';
  const secT = document.getElementById('createSecretToggle');
  if (secT) secT.checked = false;
  const secF = document.getElementById('createSecretFields');
  if (secF) secF.style.display = 'none';
  const vgT = document.getElementById('createViralGoalToggle');
  if (vgT) vgT.checked = false;
  const vgF = document.getElementById('createViralGoalFields');
  if (vgF) vgF.style.display = 'none';
  const tcT = document.getElementById('createTimeCapsuleToggle');
  if (tcT) tcT.checked = false;
  const tcF = document.getElementById('createTimeCapsuleFields');
  if (tcF) tcF.style.display = 'none';
  const tcInp = document.getElementById('createCapsuleTeaserInp');
  if (tcInp) tcInp.value = '';

  const spotT = document.getElementById('createSecretSpotToggle');
  if (spotT) spotT.checked = false;
  const spotF = document.getElementById('createSecretSpotFields');
  if (spotF) spotF.style.display = 'none';
  const spotTitle = document.getElementById('createSecretSpotTitleInp');
  if (spotTitle) spotTitle.value = '';
  const spotClue = document.getElementById('createSecretSpotClueInp');
  if (spotClue) spotClue.value = '';

  const mysT = document.getElementById('createMysteryCityToggle');
  if (mysT) mysT.checked = false;
  const winT = document.getElementById('createWindowStampToggle');
  if (winT) winT.checked = Boolean(window._prefillWindowStamp);
  window._prefillWindowStamp = false;

  resetTextCardStudioState();
  document.getElementById('createMediaPreviewStatus').innerHTML = '';
  switchCreateStudioTab('photo');
  document.getElementById('createModal')?.classList.add('open');
}

/* ── TAB 1: Photo Studio Handlers ── */
function handleStudioPhotosSelect(ev) {
  const newFiles = Array.from(ev.target.files || []);
  if (!newFiles.length) return;
  // Append new files up to 4 total!
  const combined = [...pendingStudioPhotoBlobs, ...newFiles].slice(0, 4);
  pendingStudioPhotoPreviewUrls.forEach((u) => URL.revokeObjectURL(u));
  pendingStudioPhotoBlobs = combined;
  pendingStudioPhotoPreviewUrls = combined.map((f) => URL.createObjectURL(f));

  if (ev.target) ev.target.value = '';

  const cmpWrap = document.getElementById('studioCompareWrap');
  if (cmpWrap) cmpWrap.style.display = combined.length === 2 ? 'flex' : 'none';

  renderStudioPhotoThumbnails();
  const lang = REMO_I18N.getLang();
  const statusEl = document.getElementById('createMediaPreviewStatus');
  if (statusEl) {
    statusEl.textContent = lang === 'fr'
      ? (combined.length > 1
          ? `🎠 ${combined.length} / 4 photos prêtes pour le Carrousel !`
          : `✓ 1 photo prête en qualité HD !`)
      : (combined.length > 1
          ? `🎠 ${combined.length} / 4 photos ready for Carousel!`
          : `✓ 1 HD photo ready!`);
  }
}

function removeStudioPhotoThumbnail(idx) {
  if (idx < 0 || idx >= pendingStudioPhotoBlobs.length) return;
  pendingStudioPhotoBlobs.splice(idx, 1);
  if (pendingStudioPhotoPreviewUrls[idx]) URL.revokeObjectURL(pendingStudioPhotoPreviewUrls[idx]);
  pendingStudioPhotoPreviewUrls.splice(idx, 1);
  
  const cmpWrap = document.getElementById('studioCompareWrap');
  if (cmpWrap) cmpWrap.style.display = pendingStudioPhotoBlobs.length === 2 ? 'flex' : 'none';

  renderStudioPhotoThumbnails();
  const lang = REMO_I18N.getLang();
  const statusEl = document.getElementById('createMediaPreviewStatus');
  if (statusEl) {
    statusEl.textContent = lang === 'fr'
      ? `${pendingStudioPhotoBlobs.length} photo(s) restante(s)`
      : `${pendingStudioPhotoBlobs.length} photo(s) remaining`;
  }
}
window.removeStudioPhotoThumbnail = removeStudioPhotoThumbnail;

function renderStudioPhotoThumbnails() {
  const grid = document.getElementById('studioPhotosPreviewGrid');
  if (!grid) return;
  const lang = REMO_I18N.getLang();

  let html = pendingStudioPhotoPreviewUrls.map((url, idx) => `
    <div style="position:relative;aspect-ratio:1;border-radius:12px;overflow:hidden;border:1px solid var(--border-glow);box-shadow:0 4px 14px rgba(0,0,0,0.5);">
      <img src="${url}" class="${pendingStudioPhotoFilter}" style="width:100%;height:100%;object-fit:cover;">
      <span style="position:absolute;top:4px;left:4px;background:rgba(0,0,0,0.85);color:#fbbf24;font-size:0.68rem;padding:2px 7px;border-radius:99px;font-weight:900;">#${idx + 1}</span>
      <button type="button" onclick="removeStudioPhotoThumbnail(${idx})" title="Supprimer" style="position:absolute;top:4px;right:4px;background:rgba(239,68,68,0.9);color:#fff;border:none;border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:0.72rem;font-weight:bold;line-height:1;box-shadow:0 2px 6px rgba(0,0,0,0.6);">✕</button>
    </div>
  `).join('');

  // If fewer than 4 photos, show an interactive "Ajouter photo +" card!
  if (pendingStudioPhotoBlobs.length < 4) {
    const nextNum = pendingStudioPhotoBlobs.length + 1;
    html += `
      <label style="position:relative;aspect-ratio:1;border-radius:12px;border:2px dashed rgba(251,191,36,0.65);background:rgba(251,191,36,0.06);display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;gap:6px;color:#fbbf24;transition:all 0.2s ease;">
        <span style="font-size:1.6rem;line-height:1;">➕</span>
        <span style="font-size:0.72rem;font-weight:800;text-align:center;padding:0 4px;">${lang === 'fr' ? `+ Photo #${nextNum}` : `+ Add #${nextNum}`}</span>
        <input type="file" accept="image/*" multiple style="display:none;" onchange="handleStudioPhotosSelect(event)">
      </label>
    `;
  }
  grid.innerHTML = html;
}

function setStudioPhotoFilter(fltClass, btnEl) {
  pendingStudioPhotoFilter = fltClass;
  document.querySelectorAll('#studioPhotoFilterChips .fchip').forEach((b) => b.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');
  renderStudioPhotoThumbnails();
}

/* ── TAB 1B: Interactive Before / After Glow-Up Studio Handlers ── */
function resetBeforeAfterStudioState() {
  stopBeforeAfterAutoSlide(document.querySelector('#baStudioPreviewStage .ba-slider-box'));
  if (pendingBaBeforePreviewUrl) {
    try { URL.revokeObjectURL(pendingBaBeforePreviewUrl); } catch (e) {}
  }
  if (pendingBaAfterPreviewUrl) {
    try { URL.revokeObjectURL(pendingBaAfterPreviewUrl); } catch (e) {}
  }
  pendingBaBeforeBlob = null;
  pendingBaBeforePreviewUrl = '';
  pendingBaBeforeFilter = 'flt-none';
  pendingBaAfterBlob = null;
  pendingBaAfterPreviewUrl = '';
  pendingBaAfterFilter = 'flt-none';
  ['baBeforeFileInp', 'baBeforeCamInp', 'baAfterFileInp', 'baAfterCamInp', 'baBeforeLabelInp', 'baAfterLabelInp'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  ['baBeforeFilterSel', 'baAfterFilterSel'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = 'flt-none';
  });
  const ratChk = document.getElementById('createBaLookRatingToggle');
  if (ratChk) ratChk.checked = true;
  renderBeforeAfterStudioPreview();
}

function handleBeforeAfterSlotSelect(slot, ev) {
  const file = ev?.target?.files?.[0];
  if (!file) return;
  const previewUrl = URL.createObjectURL(file);
  if (slot === 'after') {
    if (pendingBaAfterPreviewUrl) {
      try { URL.revokeObjectURL(pendingBaAfterPreviewUrl); } catch (e) {}
    }
    pendingBaAfterBlob = file;
    pendingBaAfterPreviewUrl = previewUrl;
  } else {
    if (pendingBaBeforePreviewUrl) {
      try { URL.revokeObjectURL(pendingBaBeforePreviewUrl); } catch (e) {}
    }
    pendingBaBeforeBlob = file;
    pendingBaBeforePreviewUrl = previewUrl;
  }
  if (ev?.target) ev.target.value = '';
  renderBeforeAfterStudioPreview();
}

function swapBeforeAfterSlots() {
  [pendingBaBeforeBlob, pendingBaAfterBlob] = [pendingBaAfterBlob, pendingBaBeforeBlob];
  [pendingBaBeforePreviewUrl, pendingBaAfterPreviewUrl] = [pendingBaAfterPreviewUrl, pendingBaBeforePreviewUrl];
  [pendingBaBeforeFilter, pendingBaAfterFilter] = [pendingBaAfterFilter, pendingBaBeforeFilter];
  const selB = document.getElementById('baBeforeFilterSel');
  const selA = document.getElementById('baAfterFilterSel');
  if (selB) selB.value = pendingBaBeforeFilter;
  if (selA) selA.value = pendingBaAfterFilter;
  const lblB = document.getElementById('baBeforeLabelInp');
  const lblA = document.getElementById('baAfterLabelInp');
  if (lblB && lblA) {
    const tmp = lblB.value;
    lblB.value = lblA.value;
    lblA.value = tmp;
  }
  renderBeforeAfterStudioPreview();
  if (typeof RemoAudio !== 'undefined' && RemoAudio.play) RemoAudio.play('click');
}

function setBeforeAfterSlotFilter(slot, fltClass) {
  if (slot === 'after') pendingBaAfterFilter = fltClass || 'flt-none';
  else pendingBaBeforeFilter = fltClass || 'flt-none';
  renderBeforeAfterStudioPreview();
}

function renderBeforeAfterStudioPreview() {
  const bThumb = document.getElementById('baBeforeThumb');
  const aThumb = document.getElementById('baAfterThumb');
  if (bThumb) {
    bThumb.innerHTML = pendingBaBeforePreviewUrl
      ? `<img src="${pendingBaBeforePreviewUrl}" class="${escapeHtmlStr(pendingBaBeforeFilter)}" alt="Before">`
      : '⏮️';
  }
  if (aThumb) {
    aThumb.innerHTML = pendingBaAfterPreviewUrl
      ? `<img src="${pendingBaAfterPreviewUrl}" class="${escapeHtmlStr(pendingBaAfterFilter)}" alt="After">`
      : '⏭️';
  }
  const stage = document.getElementById('baStudioPreviewStage');
  if (!stage) return;
  stopBeforeAfterAutoSlide(stage.querySelector('.ba-slider-box'));
  if (pendingBaBeforePreviewUrl && pendingBaAfterPreviewUrl) {
    const lbl1 = document.getElementById('baBeforeLabelInp')?.value.trim() || t('ba_badge_before');
    const lbl2 = document.getElementById('baAfterLabelInp')?.value.trim() || t('ba_badge_after');
    stage.innerHTML = renderInteractiveBeforeAfterBox({
      url1: pendingBaBeforePreviewUrl,
      url2: pendingBaAfterPreviewUrl,
      flt1: pendingBaBeforeFilter,
      flt2: pendingBaAfterFilter,
      lbl1,
      lbl2
    });
  } else {
    stage.innerHTML = `<div class="ba-studio-placeholder"><span style="font-size:1.7rem;">🪞</span><span>${escapeHtmlStr(t('ba_preview_hint'))}</span></div>`;
  }
}

function openCreateBeforeAfterModal(prefillTag = '#GlowUp #BeforeAfter') {
  openCreatePostModal(prefillTag);
  switchCreateStudioTab('beforeafter');
}

window.handleBeforeAfterSlotSelect = handleBeforeAfterSlotSelect;
window.swapBeforeAfterSlots = swapBeforeAfterSlots;
window.setBeforeAfterSlotFilter = setBeforeAfterSlotFilter;
window.renderBeforeAfterStudioPreview = renderBeforeAfterStudioPreview;
window.openCreateBeforeAfterModal = openCreateBeforeAfterModal;

/* ── TAB 2: Video & External Link Studio Handlers (60s File/Cam + Unlimited Video/Web Link) ── */
function parseExternalVideoUrl(rawUrl) {
  const s = String(rawUrl || '').trim();
  if (!/^https?:\/\//i.test(s)) return null;
  try {
    const u = new URL(s);
    const host = u.hostname.replace(/^www\./i, '').toLowerCase();
    // YouTube watch / youtu.be / shorts / embed / live
    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtu.be' || host === 'youtube-nocookie.com') {
      let ytId = '';
      if (host === 'youtu.be') {
        ytId = u.pathname.slice(1).split('/')[0];
      } else if (u.pathname.startsWith('/shorts/')) {
        ytId = u.pathname.split('/shorts/')[1]?.split('/')[0] || '';
      } else if (u.pathname.startsWith('/embed/')) {
        ytId = u.pathname.split('/embed/')[1]?.split('/')[0] || '';
      } else if (u.pathname.startsWith('/live/')) {
        ytId = u.pathname.split('/live/')[1]?.split('/')[0] || '';
      } else {
        ytId = u.searchParams.get('v') || '';
      }
      ytId = ytId.replace(/[^a-zA-Z0-9_-]/g, '');
      if (ytId.length >= 6) {
        return { kind: 'youtube', id: ytId, embedUrl: `https://www.youtube-nocookie.com/embed/${ytId}?rel=0`, url: s, host: 'YouTube' };
      }
    }
    // Vimeo
    if (host === 'vimeo.com' || host === 'player.vimeo.com') {
      const m = u.pathname.match(/\/(?:video\/)?(\d{5,})/);
      if (m && m[1]) {
        return { kind: 'vimeo', id: m[1], embedUrl: `https://player.vimeo.com/video/${m[1]}`, url: s, host: 'Vimeo' };
      }
    }
    // Direct video file (.mp4, .webm, .mov, .m4v)
    if (/\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(u.pathname)) {
      return { kind: 'direct_video', url: s, host };
    }
    // Social / Web link
    let platform = host;
    let icon = '🔗';
    if (host.includes('tiktok.com')) { platform = 'TikTok'; icon = '🎵'; }
    else if (host.includes('instagram.com')) { platform = 'Instagram'; icon = '📸'; }
    else if (host.includes('facebook.com') || host.includes('fb.watch')) { platform = 'Facebook Video'; icon = '🎬'; }
    else if (host.includes('x.com') || host.includes('twitter.com')) { platform = 'X / Twitter'; icon = '🐦'; }
    else if (host.includes('twitch.tv')) { platform = 'Twitch'; icon = '🎮'; }
    return { kind: 'web_link', url: s, host: platform, icon };
  } catch (e) {
    return null;
  }
}

function renderExternalVideoOrLinkStage(rawUrl, city, lang, captionText = '') {
  const info = parseExternalVideoUrl(rawUrl);
  const safeUrl = escapeHtmlStr(rawUrl || '');
  const openLbl = lang === 'fr' ? 'Ouvrir le lien original ↗' : 'Open original link ↗';

  if (!info) {
    return `
      <div style="width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;background:radial-gradient(circle at 50% 25%,#1e1b4b,#050816);text-align:center;">
        <div style="font-size:2.4rem;margin-bottom:8px;">🔗</div>
        <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="btn-cyber" style="text-decoration:none;">${openLbl}</a>
      </div>
    `;
  }

  if (info.kind === 'youtube' || info.kind === 'vimeo') {
    return `
      <div style="width:100%;height:100%;display:flex;flex-direction:column;background:#050816;border-radius:12px;overflow:hidden;">
        <div style="position:relative;width:100%;flex:1;min-height:240px;">
          <iframe src="${escapeHtmlStr(info.embedUrl)}" title="${escapeHtmlStr(info.host)} Video" style="position:absolute;inset:0;width:100%;height:100%;border:none;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen loading="lazy"></iframe>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 12px;background:rgba(15,23,42,0.95);border-top:1px solid rgba(56,189,248,0.25);font-size:0.74rem;">
          <span style="color:#38bdf8;font-weight:800;">▶️ ${escapeHtmlStr(info.host)} · ${city ? `${city.flag} ${getCityName(city, lang)}` : 'REMO'}</span>
          <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" style="color:#fde047;font-weight:800;text-decoration:none;">${openLbl}</a>
        </div>
      </div>
    `;
  }

  if (info.kind === 'direct_video') {
    return `
      <div style="width:100%;height:100%;display:flex;flex-direction:column;background:#050816;border-radius:12px;overflow:hidden;">
        <video src="${safeUrl}" controls playsinline preload="metadata" style="width:100%;flex:1;max-height:440px;background:#050816;object-fit:contain;"></video>
        <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 12px;background:rgba(15,23,42,0.95);border-top:1px solid rgba(56,189,248,0.25);font-size:0.74rem;">
          <span style="color:#38bdf8;font-weight:800;">🎬 HD Video Link</span>
          <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" style="color:#fde047;font-weight:800;text-decoration:none;">${openLbl}</a>
        </div>
      </div>
    `;
  }

  // Rich interactive card for TikTok, Instagram, Facebook, X, or general Web Links
  const watchBtnLbl = lang === 'fr' ? `▶️ Ouvrir sur ${info.host} ↗` : `▶️ Watch / Open on ${info.host} ↗`;
  return `
    <div style="width:100%;height:100%;min-height:240px;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px 18px;background:radial-gradient(circle at 50% 20%,rgba(56,189,248,0.22),rgba(15,23,42,0.96) 65%,#050816);border-radius:12px;text-align:center;gap:10px;">
      <div style="width:62px;height:62px;border-radius:18px;background:rgba(56,189,248,0.14);border:1px solid rgba(56,189,248,0.45);display:flex;align-items:center;justify-content:center;font-size:2rem;box-shadow:0 0 24px rgba(56,189,248,0.25);">${info.icon || '🔗'}</div>
      <div style="font-family:'Orbitron',sans-serif;font-size:0.86rem;font-weight:900;color:#38bdf8;letter-spacing:0.5px;">${escapeHtmlStr(info.host.toUpperCase())}</div>
      ${captionText ? `<div style="font-size:0.84rem;color:#f8fafc;font-weight:700;max-width:90%;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${escapeHtmlStr(captionText)}</div>` : ''}
      <div style="font-size:0.72rem;color:#94a3b8;max-width:92%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${safeUrl}</div>
      <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="btn-cyber" style="margin-top:4px;text-decoration:none;padding:9px 18px;font-size:0.82rem;box-shadow:0 0 18px rgba(56,189,248,0.35);">${escapeHtmlStr(watchBtnLbl)}</a>
    </div>
  `;
}

function handleStudioExternalLinkInput(rawVal) {
  const lang = REMO_I18N.getLang();
  const prevBox = document.getElementById('studioExternalLinkPreviewBox');
  const statusEl = document.getElementById('createMediaPreviewStatus');
  const val = String(rawVal || '').trim();
  if (!val) {
    if (prevBox) { prevBox.style.display = 'none'; prevBox.innerHTML = ''; }
    return;
  }
  const info = parseExternalVideoUrl(val);
  if (!info) {
    if (prevBox) {
      prevBox.style.display = 'block';
      prevBox.innerHTML = `<div style="font-size:0.75rem;color:#f43f5e;font-weight:700;">${lang === 'fr' ? '⚠️ Entrez un lien complet commençant par https://...' : '⚠️ Please enter a full link starting with https://...'}</div>`;
    }
    return;
  }
  const cityId = document.getElementById('createCitySelect')?.value || 'montreal';
  const city = getCityById(cityId);
  if (prevBox) {
    prevBox.style.display = 'block';
    prevBox.innerHTML = `<div style="height:220px;border-radius:12px;overflow:hidden;border:1px solid rgba(56,189,248,0.35);">${renderExternalVideoOrLinkStage(val, city, lang)}</div>`;
  }
  if (statusEl) {
    statusEl.textContent = lang === 'fr'
      ? `✓ Lien externe prêt (${info.host}) — aucune limite de durée !`
      : `✓ External link ready (${info.host}) — no duration limit!`;
  }
}

function handleStudioVideo60File(ev) {
  const file = ev.target.files && ev.target.files[0];
  if (!file) return;
  const lang = REMO_I18N.getLang();
  const statusEl = document.getElementById('createMediaPreviewStatus');
  const vidPrev = document.getElementById('studioVideo60Preview');

  const tempUrl = URL.createObjectURL(file);
  const probe = document.createElement('video');
  probe.preload = 'metadata';
  probe.onloadedmetadata = () => {
    const dur = probe.duration || 0;
    if (dur > 60.5) {
      URL.revokeObjectURL(tempUrl);
      pendingStudioVideoBlob = null;
      pendingRawLongVideoFile = file;
      if (vidPrev) vidPrev.style.display = 'none';
      const secRound = Math.round(dur);
      if (statusEl) {
        statusEl.innerHTML = lang === 'fr'
          ? `<span style="color:#f43f5e;">⚠️ Cette vidéo dure ${secRound}s — la limite REMO est de 60s (1 min) !</span>
             <button type="button" class="btn-ghost" style="margin-left:8px;padding:3px 10px;border-color:#fbbf24;color:#fbbf24;" onclick="forceAcceptFirst60sVideo()">✂️ Garder les 60 premières sec.</button>`
          : `<span style="color:#f43f5e;">⚠️ Video is ${secRound}s — REMO max is 60s (1 min)!</span>
             <button type="button" class="btn-ghost" style="margin-left:8px;padding:3px 10px;border-color:#fbbf24;color:#fbbf24;" onclick="forceAcceptFirst60sVideo()">✂️ Trim to First 60s</button>`;
      }
      remoToast(lang === 'fr' ? '⚠️ Durée max : 1 minute (60s) !' : '⚠️ Max video duration is 1 minute (60s)!');
      return;
    }

    pendingStudioVideoBlob = file;
    pendingStudioVideoDuration = Math.max(1, Math.round(dur));
    window._pendingEnforce60sCap = false;
    if (vidPrev) {
      vidPrev.srcObject = null;
      vidPrev.src = tempUrl;
      vidPrev.style.display = 'block';
    }
    if (statusEl) {
      statusEl.textContent = lang === 'fr'
        ? `✓ Vidéo HD validée (${formatDurationMMSS(dur)} / 01:00) !`
        : `✓ Valid 60s HD Video ready (${formatDurationMMSS(dur)} / 01:00)!`;
    }
  };
  probe.src = tempUrl;
}

function forceAcceptFirst60sVideo() {
  if (!pendingRawLongVideoFile) return;
  const lang = REMO_I18N.getLang();
  pendingStudioVideoBlob = pendingRawLongVideoFile;
  pendingStudioVideoDuration = 60;
  window._pendingEnforce60sCap = true;
  const vidPrev = document.getElementById('studioVideo60Preview');
  if (vidPrev) {
    vidPrev.srcObject = null;
    vidPrev.src = URL.createObjectURL(pendingRawLongVideoFile);
    vidPrev.ontimeupdate = () => { if (vidPrev.currentTime > 60) vidPrev.currentTime = 0; };
    vidPrev.style.display = 'block';
  }
  document.getElementById('createMediaPreviewStatus').textContent =
    lang === 'fr' ? '✓ Découpée automatiquement à 01:00 (60s) !' : '✓ Auto-capped to first 01:00 (60s)!';
}

async function toggleLiveCam60Recording() {
  const lang = REMO_I18N.getLang();
  const btn = document.getElementById('btnRecordCam60');
  const vidPrev = document.getElementById('studioVideo60Preview');
  const timerRow = document.getElementById('video60TimerRow');
  const clockLbl = document.getElementById('video60ClockLbl');
  const progFill = document.getElementById('video60ProgFill');

  if (cam60Recorder && cam60Recorder.state === 'recording') {
    stopActiveCam60Stream();
    if (btn) btn.textContent = t('create_record_cam60');
    return;
  }

  try {
    cam60Stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: true });
    if (vidPrev) {
      vidPrev.src = '';
      vidPrev.srcObject = cam60Stream;
      vidPrev.muted = true;
      vidPrev.style.display = 'block';
      vidPrev.play().catch(() => {});
    }

    cam60Chunks = [];
    const startTs = Date.now();
    cam60Recorder = new MediaRecorder(cam60Stream);
    cam60Recorder.ondataavailable = (e) => { if (e.data && e.data.size > 0) cam60Chunks.push(e.data); };
    cam60Recorder.onstop = () => {
      const elapsedSec = Math.min(60, Math.max(1, Math.round((Date.now() - startTs) / 1000)));
      const blob = new Blob(cam60Chunks, { type: 'video/webm' });
      pendingStudioVideoBlob = blob;
      pendingStudioVideoDuration = elapsedSec;
      window._pendingEnforce60sCap = false;
      if (vidPrev) {
        vidPrev.srcObject = null;
        vidPrev.src = URL.createObjectURL(blob);
        vidPrev.controls = true;
      }
      if (btn) btn.textContent = t('create_record_cam60');
      document.getElementById('createMediaPreviewStatus').textContent =
        lang === 'fr'
          ? `✓ Vidéo Caméra enregistrée (${formatDurationMMSS(elapsedSec)} / 01:00) !`
          : `✓ Live Camera Video recorded (${formatDurationMMSS(elapsedSec)} / 01:00)!`;
    };

    cam60Recorder.start();
    if (timerRow) timerRow.style.display = 'block';
    if (btn) btn.textContent = t('create_stop_cam60');

    cam60Timer = setInterval(() => {
      const sec = (Date.now() - startTs) / 1000;
      if (clockLbl) clockLbl.textContent = `${formatDurationMMSS(sec)} / 01:00`;
      if (progFill) progFill.style.width = `${Math.min(100, (sec / 60) * 100)}%`;
      if (sec >= 60) {
        stopActiveCam60Stream();
      }
    }, 200);
  } catch (err) {
    remoToast(lang === 'fr' ? 'Caméra / Micro non autorisés.' : 'Camera / Microphone permission denied.');
  }
}

/* ── TAB 3: Live HTML / CSS / JS Code Studio Handlers ── */
function loadStudioHtmlTemplate(tplKey) {
  if (!REMO_STORE.isAdminUnlocked() && !REMO_STORE.isCurrentUserAdmin()) {
    remoToast(REMO_I18N.getLang() === 'fr' ? 'Les modèles officiels sont réservés aux administrateurs.' : 'Official templates are admin only.');
    return;
  }
  const code = REMO_HTML_TEMPLATES[tplKey];
  if (!code) return;
  const area = document.getElementById('createHtmlCodeArea');
  if (area) area.value = code;
  refreshStudioHtmlPreview();
}

function handleStudioHtmlFileUpload(ev) {
  const file = ev.target.files && ev.target.files[0];
  if (!file) return;
  const rd = new FileReader();
  rd.onload = (e) => {
    const area = document.getElementById('createHtmlCodeArea');
    if (area) area.value = String(e.target.result || '');
    refreshStudioHtmlPreview();
    document.getElementById('createMediaPreviewStatus').textContent = `✓ ${file.name} loaded!`;
  };
  rd.readAsText(file);
}

function refreshStudioHtmlPreview() {
  const area = document.getElementById('createHtmlCodeArea');
  const frame = document.getElementById('studioHtmlLivePreview');
  if (!area || !frame) return;
  const code = area.value.trim();
  if (!code) return;
  frame.srcdoc = code;
  frame.style.display = 'block';
}

function handleCreateMediaFile(ev) {
  handleStudioPhotosSelect(ev);
}

async function toggleSparkVoiceRecord() {
  const lang = REMO_I18N.getLang();
  const btn = document.getElementById('btnSparkVoice');
  if (voiceRecorder && voiceRecorder.state === 'recording') {
    voiceRecorder.stop();
    if (btn) btn.textContent = '✓ Spark Voice Ready';
    return;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    voiceChunks = [];
    voiceRecorder = new MediaRecorder(stream);
    voiceRecorder.ondataavailable = (e) => { if (e.data.size > 0) voiceChunks.push(e.data); };
    voiceRecorder.onstop = () => {
      stream.getTracks().forEach((tr) => tr.stop());
      pendingPostVoiceBlob = new Blob(voiceChunks, { type: 'audio/webm' });
      document.getElementById('createMediaPreviewStatus').textContent =
        lang === 'fr' ? '✓ Note Vocale Spark 30s prête !' : '✓ 30s Spark Voice ready!';
    };
    voiceRecorder.start();
    if (btn) btn.textContent = lang === 'fr' ? '⏹️ Arrêter (Max 30s)...' : '⏹️ Stop Recording (30s)...';
    setTimeout(() => { if (voiceRecorder && voiceRecorder.state === 'recording') voiceRecorder.stop(); }, 30000);
  } catch (e) {
    remoToast(lang === 'fr' ? 'Microphone non autorisé.' : 'Microphone access denied.');
  }
}

function checkGpsForNewPost() {
  const lang = REMO_I18N.getLang();
  if (!navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition((pos) => {
    pendingPostGpsVerified = true;
    const { city } = findNearestRemoCity(pos.coords.latitude, pos.coords.longitude);
    const sel = document.getElementById('createCitySelect');
    if (sel) sel.value = city.id;
    remoToast(lang === 'fr' ? `📍 GPS Vérifié : ${getCityName(city, 'fr')} !` : `📍 Verified GPS: ${getCityName(city, 'en')}!`, 'coin');
  });
}

let _publishPostInFlight = false;
async function publishNewRemoPost() {
  if (_publishPostInFlight) return;
  const lang = REMO_I18N.getLang();
  if (REMO_STORE.isCurrentUserBanned()) {
    remoToast(t('auth_err_banned'));
    return;
  }
  const pubBtn = document.getElementById('btnPublishRemoPost');
  const origPubHtml = pubBtn ? pubBtn.innerHTML : '';
  const setPubBusy = (busy, label = '') => {
    _publishPostInFlight = busy;
    if (pubBtn) {
      pubBtn.disabled = busy;
      pubBtn.style.opacity = busy ? '0.65' : '';
      pubBtn.innerHTML = busy ? label : origPubHtml;
    }
  };
  setPubBusy(true, lang === 'fr' ? '⏳ Connexion & Préparation...' : '⏳ Connecting & Preparing...');
  try {
  if (typeof REMO_STORE.waitForAuthReady === 'function') {
    await REMO_STORE.waitForAuthReady(1800);
  }
  const curUAuth = REMO_STORE.getCurrentUser();
  const curFbUser = REMO_STORE.fbAuth && REMO_STORE.fbAuth.currentUser;
  if (!curUAuth || curUAuth.role === 'guest' || (REMO_STORE.fbAuth && !curFbUser)) {
    remoToast(t('auth_need_signin_post'));
    if (typeof openAuthModal === 'function') openAuthModal(false);
    return;
  }
  const cityId = document.getElementById('createCitySelect')?.value || 'montreal';
  const vibe = document.getElementById('createVibeSelect')?.value || 'energy';
  let cap = document.getElementById('createCaptionInp')?.value.trim() || '';
  const rawExternalVideoUrl = document.getElementById('createVideoExternalUrlInput')?.value.trim() || '';

  if (!cap && activeCreateStudioTab === 'video' && rawExternalVideoUrl) {
    const cObj = getCityById(cityId);
    cap = lang === 'fr'
      ? `🔗 Découvrez cette vidéo / ce lien partagé depuis ${getCityName(cObj, 'fr')} ! #${cObj.code}`
      : `🔗 Check out this video / link shared from ${getCityName(cObj, 'en')}! #${cObj.code}`;
  }
  if (activeCreateStudioTab === 'beforeafter' && (!pendingBaBeforeBlob || !pendingBaAfterBlob)) {
    remoToast(t('ba_need_two_err'));
    return;
  }
  if (!cap && activeCreateStudioTab === 'beforeafter') {
    const cObj = getCityById(cityId);
    cap = lang === 'fr'
      ? `🪞 Avant / Après à ${getCityName(cObj, 'fr')} ! Faites glisser pour comparer ✨ #AvantApres #GlowUp`
      : `🪞 Before / After in ${getCityName(cObj, 'en')}! Slide to compare ✨ #BeforeAfter #GlowUp`;
  }

  let textCardPayload = null;
  if (activeCreateStudioTab === 'textcard') {
    const tcSpec = _getStudioTextCardSpecFromDom();
    if (!tcSpec.raw) {
      remoToast(t('tc_empty_err'));
      document.getElementById('createTextCardInp')?.focus();
      return;
    }
    textCardPayload = tcSpec;
  } else if (!cap) {
    remoToast(lang === 'fr' ? 'Ajoutez une légende à votre publication !' : 'Please write a caption for your post!');
    return;
  }

  const isMysteryCity = Boolean(document.getElementById('createMysteryCityToggle')?.checked) && !pendingDuetParent;
  const wantWindowStamp = Boolean(document.getElementById('createWindowStampToggle')?.checked) && !isMysteryCity;

  let mediaType = textCardPayload ? 'text_card' : 'city_art';
  let mediaUrl = '';
  let mediaUrls = [];
  let htmlCode = '';
  let videoDuration = 0;
  let externalUrl = '';
  let soundtrackId = '';
  let baMeta = null;

  if (activeCreateStudioTab === 'beforeafter') {
    soundtrackId = document.getElementById('createPhotoSoundSelect')?.value || '';
    for (const rawBlob of [pendingBaBeforeBlob, pendingBaAfterBlob]) {
      const blob = (wantWindowStamp && typeof stampPhotoWithLiveCityWindow === 'function')
        ? await stampPhotoWithLiveCityWindow(rawBlob, cityId, lang)
        : rawBlob;
      const url = await uploadMediaToCloudOrDataUrl(blob, 'posts', { inlineMaxChars: 15000, forceCloud: true });
      mediaUrls.push(url);
    }
    mediaType = 'before_after';
    mediaUrl = (mediaUrls[0] && String(mediaUrls[0]).startsWith('http')) ? mediaUrls[0] : '';
    const wantLookMeter = document.getElementById('createBaLookRatingToggle')?.checked !== false;
    baMeta = {
      beforeFilter: pendingBaBeforeFilter || 'flt-none',
      afterFilter: pendingBaAfterFilter || 'flt-none',
      beforeLabel: document.getElementById('baBeforeLabelInp')?.value.trim() || '',
      afterLabel: document.getElementById('baAfterLabelInp')?.value.trim() || '',
      lookRating: { enabled: wantLookMeter, style: { sum: 0, count: 0 }, vibe: { sum: 0, count: 0 }, icon: { sum: 0, count: 0 }, voters: {} }
    };
  } else if (activeCreateStudioTab === 'photo') {
    soundtrackId = document.getElementById('createPhotoSoundSelect')?.value || '';
    if (pendingStudioPhotoBlobs.length > 0) {
      for (const rawBlob of pendingStudioPhotoBlobs) {
        const blob = (wantWindowStamp && typeof stampPhotoWithLiveCityWindow === 'function')
          ? await stampPhotoWithLiveCityWindow(rawBlob, cityId, lang)
          : rawBlob;
        const url = await uploadMediaToCloudOrDataUrl(blob, 'posts', { inlineMaxChars: 15000, forceCloud: true });
        mediaUrls.push(url);
      }
      const wantBeforeAfter = pendingStudioPhotoBlobs.length === 2 && document.getElementById('studioCompareToggle')?.checked;
      if (wantBeforeAfter) {
        mediaType = 'before_after';
        mediaUrl = (mediaUrls[0] && String(mediaUrls[0]).startsWith('http')) ? mediaUrls[0] : '';
      } else if (mediaUrls.length > 1) {
        mediaType = 'carousel';
        mediaUrl = (mediaUrls[0] && String(mediaUrls[0]).startsWith('http')) ? mediaUrls[0] : '';
      } else {
        mediaType = 'image';
        mediaUrl = mediaUrls[0];
      }
    }
  } else if (activeCreateStudioTab === 'video') {
    if (pendingStudioVideoBlob) {
      if (pendingStudioVideoBlob.size && pendingStudioVideoBlob.size > 29.5 * 1024 * 1024) {
        const mb = Math.round(pendingStudioVideoBlob.size / (1024 * 1024));
        remoToast(lang === 'fr'
          ? `⚠️ Vidéo trop volumineuse (${mb} Mo, max Cloud 29 Mo). Filmez plus court ou utilisez un lien vidéo !`
          : `⚠️ Video too large (${mb} MB, Cloud limit 29 MB). Record shorter or paste a video link!`, 6500);
        return;
      }
      setPubBusy(true, lang === 'fr' ? '⏳ Envoi vidéo vers REMO Cloud...' : '⏳ Uploading video to REMO Cloud...');
      remoToast(lang === 'fr' ? '⏳ Téléversement vidéo vers le Cloud REMO...' : '⏳ Uploading video to REMO Cloud...', 'coin');
      mediaType = 'video';
      mediaUrl = await uploadMediaToCloudOrDataUrl(pendingStudioVideoBlob, 'posts');
      videoDuration = pendingStudioVideoDuration || 60;
    } else if (rawExternalVideoUrl) {
      const parsedLink = parseExternalVideoUrl(rawExternalVideoUrl);
      if (!parsedLink) {
        remoToast(lang === 'fr' ? '⚠️ Veuillez coller un lien valide commençant par https://...' : '⚠️ Please paste a valid link starting with https://...');
        return;
      }
      mediaType = 'video_link';
      mediaUrl = rawExternalVideoUrl;
      externalUrl = rawExternalVideoUrl;
    } else {
      remoToast(lang === 'fr' ? 'Importez une vidéo (max 60s) OU collez un lien vidéo / web !' : 'Please upload a video (max 60s) OR paste a video / web link!');
      return;
    }
  } else if (activeCreateStudioTab === 'html') {
    const isAdm = REMO_STORE.isAdminUnlocked() || REMO_STORE.isCurrentUserAdmin();
    if (!isAdm) {
      remoToast(lang === 'fr' ? 'Seul l’administrateur peut publier une application HTML Live !' : 'Only the administrator can publish a Live HTML mini-app!');
      return;
    }
    const rawHtml = document.getElementById('createHtmlCodeArea')?.value.trim() || '';
    if (!rawHtml) {
      remoToast(lang === 'fr' ? 'Entrez votre code HTML/JS ou choisissez un modèle !' : 'Please enter HTML/JS code or choose a template!');
      return;
    }
    mediaType = 'html_app';
    htmlCode = rawHtml.includes('<html') || rawHtml.includes('<body') || rawHtml.includes('<canvas') || rawHtml.includes('<script')
      ? rawHtml
      : `<!DOCTYPE html><html><body style="margin:0;background:#050816;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;">${rawHtml}</body></html>`;
  } else if (activeCreateStudioTab === 'versus') {
    const isAdm = REMO_STORE.isAdminUnlocked() || REMO_STORE.isCurrentUserAdmin();
    if (!isAdm) {
      remoToast(lang === 'fr' ? 'Seul l’administrateur peut publier un Duel Officiel !' : 'Only the administrator can publish an Official City Duel!');
      return;
    }
    mediaType = 'city_versus';
  }

  let voiceKey = pendingPostVoiceDataUrl || '';
  if (pendingPostVoiceBlob) {
    voiceKey = (typeof uploadMediaToCloudOrDataUrl === 'function')
      ? await uploadMediaToCloudOrDataUrl(pendingPostVoiceBlob, 'posts')
      : await RemoMediaDB.saveBlob(pendingPostVoiceBlob, 'voice');
  }

  // Optional 🎁 Mystery Blind-Box Scratch/3-Tap Wrapper
  let mysteryBoxObj = null;
  if (document.getElementById('createMysteryBoxToggle')?.checked) {
    const mbTheme = document.getElementById('createMysteryBoxTheme')?.value || 'silver';
    const rawMbTeaser = document.getElementById('createMysteryBoxTeaser')?.value.trim() || '';
    const mbPair = rawMbTeaser ? REMO_TRANSLATOR.makeBilingualPair(rawMbTeaser) : { en: '', fr: '' };
    const mbGuessQ = document.getElementById('createMysteryBoxGuessQ')?.value.trim() || '';
    const mbOptA = document.getElementById('createMysteryBoxOptA')?.value.trim() || '';
    const mbOptB = document.getElementById('createMysteryBoxOptB')?.value.trim() || '';
    const mbOpts = [mbOptA, mbOptB].filter(Boolean).map((lbl) => ({ label: lbl, votes: 0 }));
    mysteryBoxObj = {
      enabled: true,
      theme: mbTheme,
      teaser_en: mbPair.en || rawMbTeaser,
      teaser_fr: mbPair.fr || rawMbTeaser,
      guessQuestion: mbOpts.length >= 2 ? mbGuessQ : '',
      guessOptions: mbOpts.length >= 2 ? mbOpts : [],
      guessVoters: {},
      unboxedBy: []
    };
  }

  // Optional Interactive Live Poll
  let pollObj = null;
  if (document.getElementById('createPollToggle')?.checked) {
    const q = document.getElementById('createPollQuestion')?.value.trim();
    const o1 = document.getElementById('createPollOpt1')?.value.trim();
    const o2 = document.getElementById('createPollOpt2')?.value.trim();
    const o3 = document.getElementById('createPollOpt3')?.value.trim();
    const opts = [o1, o2, o3].filter(Boolean).map((lbl) => ({ label_en: lbl, label_fr: lbl, votes: 0 }));
    if (q && opts.length >= 2) {
      pollObj = { question_en: q, question_fr: q, options: opts, voters: [] };
    }
  }

  // Optional VIP Secret Creator Capsule
  let secretObj = null;
  if (document.getElementById('createSecretToggle')?.checked) {
    const secTxt = document.getElementById('createSecretTextInp')?.value.trim();
    if (secTxt) {
      secretObj = { cost: 15, text_en: secTxt, text_fr: secTxt, unlockedBy: [] };
    }
  }

  // Optional Viral Like-Goal Vault
  let viralGoalObj = null;
  if (document.getElementById('createViralGoalToggle')?.checked) {
    const tgt = Math.max(2, Number(document.getElementById('createViralTargetLikes')?.value || 5));
    const vTxt = document.getElementById('createViralSecretText')?.value.trim();
    if (vTxt) {
      viralGoalObj = { targetLikes: tgt, text_en: vTxt, text_fr: vTxt };
    }
  }

  // Optional ⏳ Time-Capsule Mystery Countdown Vault
  let unlockAtTs = 0;
  let wasTimeCapsule = false;
  let capsuleTeaserEn = '';
  let capsuleTeaserFr = '';
  if (document.getElementById('createTimeCapsuleToggle')?.checked) {
    let mins = 1;
    const selVal = document.getElementById('createCapsuleMinutesSel')?.value;
    if (selVal === 'custom') {
      mins = Math.max(1, Number(document.getElementById('createCapsuleCustomMins')?.value || 45));
    } else {
      mins = Math.max(1, Number(selVal || 1));
    }
    unlockAtTs = Date.now() + mins * 60000;
    wasTimeCapsule = true;
    const rawTeaser = document.getElementById('createCapsuleTeaserInp')?.value.trim()
      || (lang === 'fr' ? 'Surprise mystère bientôt révélée en direct !' : 'Mystery drop unsealing live soon!');
    const tPair = REMO_TRANSLATOR.makeBilingualPair(rawTeaser);
    capsuleTeaserEn = tPair.en || rawTeaser;
    capsuleTeaserFr = tPair.fr || rawTeaser;
  }

  const artHeadline = document.getElementById('createArtHeadlineInp')?.value.trim() || '';
  const u = REMO_STORE.getCurrentUser() || REMO_STORE.ensureGuestOrCitizen('Creator', '', cityId);

  // Use custom dual EN/FR boxes if open, or auto-generate bilingual EN ⇄ FR pair!
  const drawerEl = document.getElementById('bilingualCaptionDrawer');
  const enBoxVal = document.getElementById('createCaptionEnBox')?.value.trim();
  const frBoxVal = document.getElementById('createCaptionFrBox')?.value.trim();
  const autoPair = cap ? REMO_TRANSLATOR.makeBilingualPair(cap) : { en: '', fr: '' };
  const finalEn = (drawerEl && drawerEl.style.display !== 'none' && enBoxVal) ? enBoxVal : (autoPair.en || cap);
  const finalFr = (drawerEl && drawerEl.style.display !== 'none' && frBoxVal) ? frBoxVal : (autoPair.fr || cap);
  if (drawerEl) drawerEl.style.display = 'none';

  const isSecretSpot = Boolean(document.getElementById('createSecretSpotToggle')?.checked);
  const rawSpotTitle = document.getElementById('createSecretSpotTitleInp')?.value.trim() || '';
  const rawSpotClue = document.getElementById('createSecretSpotClueInp')?.value.trim() || '';

  const cloudAuthorUid = (typeof REMO_STORE.getCloudAuthorUid === 'function') ? REMO_STORE.getCloudAuthorUid(u) : u.uid;
  const newPost = {
    id: 'post_' + Date.now(),
    uid: u.uid,
    authorUid: cloudAuthorUid || u.uid,
    authorName: u.name,
    authorAvatar: u.avatarUrl || '',
    authorEmail: u.email || '',
    authorVerified: Boolean(REMO_STORE.fbAuth && REMO_STORE.fbAuth.currentUser),
    authorPassport: u.passportNum,
    cityId,
    vibe,
    caption_en: finalEn,
    caption_fr: finalFr,
    mediaType,
    mediaUrl,
    mediaUrls,
    externalUrl: externalUrl || '',
    photoFilter: pendingStudioPhotoFilter || 'flt-none',
    beforeFilter: baMeta ? baMeta.beforeFilter : (pendingStudioPhotoFilter || 'flt-none'),
    afterFilter: baMeta ? baMeta.afterFilter : (pendingStudioPhotoFilter || 'flt-none'),
    beforeLabel: baMeta ? baMeta.beforeLabel : '',
    afterLabel: baMeta ? baMeta.afterLabel : '',
    lookRating: baMeta ? baMeta.lookRating : (mediaType === 'before_after' ? { enabled: true, style: { sum: 0, count: 0 }, vibe: { sum: 0, count: 0 }, icon: { sum: 0, count: 0 }, voters: {} } : null),
    soundtrackId: soundtrackId || '',
    videoDuration,
    enforce60sCap: !!window._pendingEnforce60sCap,
    htmlCode,
    visualHeadline: artHeadline,
    textCard: textCardPayload,
    remixedFromAuthor: pendingRemixParent ? pendingRemixParent.authorName : '',
    duetOf: pendingDuetParent ? { ...pendingDuetParent } : null,
    poll: pollObj,
    secretCapsule: secretObj,
    viralGoal: viralGoalObj,
    isSecretSpot,
    secretSpotTitle: isSecretSpot ? (rawSpotTitle || (lang === 'fr' ? 'Lieu Secret Urbain' : 'Urban Secret Spot')) : '',
    secretSpotClue: isSecretSpot ? rawSpotClue : '',
    mysteryCity: isMysteryCity,
    cityGuesses: {},
    isWorldWindow: Boolean(wantWindowStamp || (pendingDuetParent && pendingDuetParent.isWorldWindow)),
    windowStamp: (wantWindowStamp && typeof buildLiveWindowStampMeta === 'function') ? buildLiveWindowStampMeta(cityId) : null,
    wasTimeCapsule,
    unlockAt: unlockAtTs,
    capsuleTeaser_en: capsuleTeaserEn,
    capsuleTeaser_fr: capsuleTeaserFr,
    capsuleWatchers: wasTimeCapsule ? [u.uid] : [],
    mysteryBox: mysteryBoxObj,
    reactions: {},
    voiceUrl: voiceKey,
    verifiedGps: pendingPostGpsVerified,
    boosted: false,
    mintedCard: false,
    likes: [],
    tipsTotal: 0,
    comments: [],
    createdAt: Date.now()
  };

  // Pay +10 Coins Royalty to original HTML creator when Remixing or City-Dueting!
  if (pendingDuetParent && (wantWindowStamp || pendingDuetParent.isWorldWindow)) {
    REMO_STORE.addCoins(u.uid, 10, 10);
  }
  if (pendingRemixParent && pendingRemixParent.authorUid && pendingRemixParent.authorUid !== u.uid) {
    REMO_STORE.addCoins(pendingRemixParent.authorUid, 10, 10);
  }
  if (pendingDuetParent && pendingDuetParent.uid && pendingDuetParent.uid !== u.uid) {
    REMO_STORE.addCoins(pendingDuetParent.uid, 10, 10);
  }

  if (mediaType === 'city_versus') {
    const lC = document.getElementById('createVersusLeftCity')?.value || 'montreal';
    const rC = document.getElementById('createVersusRightCity')?.value || 'paris';
    const durationHours = Math.max(1, Number(document.getElementById('createVersusDuration')?.value || 24));
    const cat = document.getElementById('createVersusCategory')?.value || 'general';
    const now = Date.now();
    let leftImg = pendingVersusMedia.left || '';
    let rightImg = pendingVersusMedia.right || '';
    if (typeof uploadMediaToCloudOrDataUrl === 'function') {
      if (leftImg && leftImg.startsWith('data:image')) {
        setPubBusy(true, lang === 'fr' ? '⏳ Envoi média Duel (1/2)...' : '⏳ Uploading Duel photo (1/2)...');
        leftImg = await uploadMediaToCloudOrDataUrl(leftImg, 'posts', { inlineMaxChars: 15000, forceCloud: true, maxDim: 960, quality: 0.76 });
      }
      if (rightImg && rightImg.startsWith('data:image')) {
        setPubBusy(true, lang === 'fr' ? '⏳ Envoi média Duel (2/2)...' : '⏳ Uploading Duel photo (2/2)...');
        rightImg = await uploadMediaToCloudOrDataUrl(rightImg, 'posts', { inlineMaxChars: 15000, forceCloud: true, maxDim: 960, quality: 0.76 });
      }
    } else if (typeof compressImageFileToDataUrl === 'function') {
      if (leftImg && leftImg.length > 180000) leftImg = await compressImageFileToDataUrl(leftImg, 960, 0.76);
      if (rightImg && rightImg.length > 180000) rightImg = await compressImageFileToDataUrl(rightImg, 960, 0.76);
    }
    newPost.versus = {
      leftCityId: lC,
      rightCityId: rC,
      leftMedia: leftImg,
      rightMedia: rightImg,
      leftVotes: 0,
      rightVotes: 0,
      durationHours,
      category: cat,
      createdAt: now,
      endsAt: now + durationHours * 3600 * 1000,
      voters: [],
      voterSides: {},
      closed: false,
      winnerSide: null,
      claimedBonus: []
    };
    pendingVersusMedia = { left: '', right: '' };
  }

  if (document.getElementById('createFeedBountyToggle')?.checked) {
    const bountyCoins = Math.max(20, Number(document.getElementById('createFeedBountyCoins')?.value || 50));
    const bountyAns = document.getElementById('createFeedBountyAnswer')?.value.trim() || 'remo';
    newPost.bounty = {
      coins: bountyCoins,
      answer: bountyAns.toLowerCase(),
      clue: bountyAns.length > 3 ? `${bountyAns.slice(0, 1)}...${bountyAns.slice(-1)} (${bountyAns.length} letters)` : '',
      claimed: false,
      claimedBy: null
    };
  }

  REMO_STORE.state.posts.unshift(newPost);

  if (isSecretSpot) {
    const cObj = getCityById(cityId) || getCityById('montreal');
    const jitterLat = (Math.random() - 0.5) * 0.018;
    const jitterLng = (Math.random() - 0.5) * 0.018;
    if (!Array.isArray(REMO_STORE.state.radarPins)) REMO_STORE.state.radarPins = [];
    REMO_STORE.state.radarPins.push({
      id: 'spot_' + newPost.id,
      postId: newPost.id,
      cityId: cObj.id,
      lat: (cObj.coords ? cObj.coords.lat : (cObj.lat || 45.5017)) + jitterLat,
      lng: (cObj.coords ? cObj.coords.lng : (cObj.lng || -73.5673)) + jitterLng,
      isSecretSpot: true,
      title_en: rawSpotTitle || ('Secret Spot: ' + (cObj.name_en || cObj.name)),
      title_fr: rawSpotTitle || ('Lieu Secret: ' + (cObj.name_fr || cObj.name)),
      clue: rawSpotClue,
      reward: 60
    });
    if (typeof refreshRadarMarkers === 'function') refreshRadarMarkers();
  }
  const baseReward = pendingDuetParent ? 20 : (REMO_STORE.state.settings.rewards.postReward || 15);
  pendingDuetParent = null;
  const wxStatus = REMO_WEATHER.getCityLiveStatus(cityId);
  const surgeMult = wxStatus.isSurge ? 2 : 1;
  const reward = baseReward * surgeMult;
  const cityPts = (pendingPostGpsVerified ? 45 : 25) * surgeMult;
  REMO_STORE.addCoins(u.uid, reward, cityPts);
  setPubBusy(true, lang === 'fr' ? '☁️ Sauvegarde sur REMO Cloud...' : '☁️ Saving to REMO Cloud...');
  newPost._cloudSyncPending = true;
  REMO_STORE.save(true, 'new_post');
  const syncRes = await REMO_STORE.syncPostToCloud(newPost);
  REMO_STORE.save(true, syncRes && !syncRes.ok ? 'new_post_local' : 'new_post_synced');
  closeCreatePostModal();
  renderSocialFeed();
  if (syncRes && !syncRes.ok) {
    remoToast(t('post_cloud_sync_err', { err: syncRes.code || syncRes.message || 'error' }), 8000);
  } else {
    spawnRemoCoinsFX(wxStatus.isSurge ? 16 : 10);
    if (wxStatus.isSurge) {
      const cityObj = getCityById(cityId);
      remoToast(t('weather_surge_bonus_toast', { city: getCityName(cityObj, lang), coins: reward }), 'fanfare');
    } else {
      remoToast(lang === 'fr' ? `🚀 Publié sur REMO Cloud (+${reward} 🪙) !` : `🚀 Published to REMO Cloud (+${reward} 🪙)!`, 'coin');
    }
  }
  } finally {
    setPubBusy(false);
  }
}

/* ── 1-Click 9:16 Video Reel Studio (MediaRecorder + Canvas Stream) ── */
async function record1ClickCityVideoReel() {
  const lang = REMO_I18N.getLang();
  const cityId = document.getElementById('createCitySelect')?.value || 'montreal';
  const city = getCityById(cityId);
  const cv = document.createElement('canvas');
  cv.width = 720; cv.height = 1280;
  const ctx = cv.getContext('2d');

  if (!cv.captureStream || typeof MediaRecorder === 'undefined') {
    remoToast(lang === 'fr' ? 'Export vidéo non supporté sur ce navigateur.' : 'Video capture not supported in this browser.');
    return;
  }

  remoToast(lang === 'fr' ? '🎬 Enregistrement du Reel 9:16 (4 secondes)...' : '🎬 Recording 9:16 City Video Reel (4s)...');
  const stream = cv.captureStream(30);
  const chunks = [];
  const rec = new MediaRecorder(stream, { mimeType: 'video/webm' });
  rec.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
  rec.onstop = () => {
    const blob = new Blob(chunks, { type: 'video/webm' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `REMO_Reel_${city.code}_9x16.webm`;
    document.body.appendChild(a); a.click(); a.remove();
    remoToast(lang === 'fr' ? '🎥 Reel vidéo téléchargé pour TikTok / Reels !' : '🎥 9:16 Video Reel downloaded for TikTok / IG!', 'fanfare');
  };

  rec.start();
  const tcReelSpec = (activeCreateStudioTab === 'textcard') ? _getStudioTextCardSpecFromDom() : null;
  const tcUser = REMO_STORE.getCurrentUser();
  const tcMystery = Boolean(document.getElementById('createMysteryCityToggle')?.checked);
  const start = performance.now();
  const drawFrame = (now) => {
    const tSec = (now - start) / 1000;
    if (tcReelSpec && tcReelSpec.raw) {
      drawTextCardCanvasFrame(ctx, 720, 1280, tcReelSpec, _textCardStudioState.previewPage, city, (tcUser && tcUser.name) || 'Citizen', lang, tcMystery, tSec);
    } else {
      ctx.fillStyle = '#040714';
      ctx.fillRect(0, 0, 720, 1280);
      const pulse = 220 + Math.sin(tSec * 4) * 18;
      drawCityLandmark(ctx, city.id, city.themeColor, 360, 560, pulse);
      ctx.font = '900 46px "Orbitron", sans-serif';
      ctx.fillStyle = '#fbbf24';
      ctx.textAlign = 'center';
      ctx.fillText(`🌐 REMO · ${city.flag} ${getCityName(city, lang).toUpperCase()}`, 360, 160);
      ctx.font = '800 28px "Outfit", sans-serif';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(getCityTagline(city, lang), 360, 1020);
    }
    if (tSec < 4.0) requestAnimationFrame(drawFrame);
    else rec.stop();
  };
  requestAnimationFrame(drawFrame);
}

/* ── Stories Hub, Real Photo Upload & Interactive Viewer (Header Button next to Radio) ── */
let _pendingStoryPhotoDataUrl = '';
let _activeStoryViewerId = '';
let _storyAutoPlayInterval = null;
let _storyAutoPlayProgressPct = 0;
let _storyAutoPlayPaused = false;
const _viewedStoryIdsSession = new Set();

function getActiveValid24hStories() {
  if (!REMO_STORE || !REMO_STORE.state) return [];
  const raw = Array.isArray(REMO_STORE.state.stories) ? REMO_STORE.state.stories : [];
  const nowTs = Date.now();
  const legacyIds = new Set(['st_1', 'st_2', 'st_3', 'st_4']);
  const delSet = REMO_STORE.deletedStoryIds || new Set();
  const valid = raw.filter((s) =>
    s && s.id &&
    !legacyIds.has(s.id) &&
    !delSet.has(s.id) &&
    (nowTs - Number(s.createdAt || 0) <= 86400000)
  );
  if (valid.length !== raw.length) {
    REMO_STORE.state.stories = valid;
  }
  return valid;
}
window.getActiveValid24hStories = getActiveValid24hStories;

function getGroupedAuthorStories() {
  const stories = getActiveValid24hStories();
  const groupsMap = new Map();

  stories.forEach((s) => {
    const key = (s.uid && s.uid !== 'u_guest' && !s.uid.startsWith('u_visitor')) ? s.uid : (s.author || s.id);
    if (!groupsMap.has(key)) {
      groupsMap.set(key, {
        key,
        uid: s.uid || '',
        author: s.author || 'Citizen',
        cityId: s.cityId || 'montreal',
        stories: [],
        latestCreatedAt: 0
      });
    }
    const grp = groupsMap.get(key);
    grp.stories.push(s);
    const ts = Number(s.createdAt || 0);
    if (ts > grp.latestCreatedAt) {
      grp.latestCreatedAt = ts;
      if (s.cityId) grp.cityId = s.cityId;
      if (s.author) grp.author = s.author;
    }
  });

  const list = Array.from(groupsMap.values());
  // Sort stories within each author chronologically (oldest to newest)
  list.forEach((g) => {
    g.stories.sort((a, b) => Number(a.createdAt || 0) - Number(b.createdAt || 0));
  });
  // Sort author groups by most recent activity
  list.sort((a, b) => b.latestCreatedAt - a.latestCreatedAt);
  return list;
}
window.getGroupedAuthorStories = getGroupedAuthorStories;

function openAuthorStoriesGroup(groupKey) {
  const groups = getGroupedAuthorStories();
  const target = groups.find((g) => g.key === groupKey) || groups[0];
  if (target && target.stories.length > 0) {
    const firstUnviewed = target.stories.find((s) => !_viewedStoryIdsSession.has(s.id));
    const storyToOpen = firstUnviewed || target.stories[0];
    renderStoriesModalStripAndStage(storyToOpen.id);
  }
}
window.openAuthorStoriesGroup = openAuthorStoriesGroup;

function stopStoryAutoPlayTimer() {
  if (_storyAutoPlayInterval) {
    clearInterval(_storyAutoPlayInterval);
    _storyAutoPlayInterval = null;
  }
  _storyAutoPlayProgressPct = 0;
}
window.stopStoryAutoPlayTimer = stopStoryAutoPlayTimer;

function pauseStoryAutoPlay(paused) {
  _storyAutoPlayPaused = !!paused;
  const badge = document.getElementById('storyAutoPlayStateBadge');
  if (badge) {
    const isFr = REMO_I18N.getLang() === 'fr';
    badge.textContent = _storyAutoPlayPaused ? (isFr ? '⏸️ EN PAUSE' : '⏸️ PAUSED') : '▶ 6s';
    badge.style.color = _storyAutoPlayPaused ? '#fde047' : '#94a3b8';
  }
}
window.pauseStoryAutoPlay = pauseStoryAutoPlay;

function startStoryAutoPlayTimer() {
  stopStoryAutoPlayTimer();
  _storyAutoPlayPaused = false;
  _storyAutoPlayProgressPct = 0;
  _storyAutoPlayInterval = setInterval(() => {
    const modal = document.getElementById('storyViewerModal');
    if (!modal || !modal.classList.contains('open')) {
      stopStoryAutoPlayTimer();
      return;
    }
    const drawer = document.getElementById('storyCreateDrawerBox');
    if (drawer && drawer.style.display !== 'none') return;
    if (_storyAutoPlayPaused) return;

    _storyAutoPlayProgressPct = Math.min(100, _storyAutoPlayProgressPct + 1);
    const activeBar = document.getElementById('storyActiveProgressFill');
    if (activeBar) {
      activeBar.style.width = `${_storyAutoPlayProgressPct}%`;
    }
    if (_storyAutoPlayProgressPct >= 100) {
      const stories = getActiveValid24hStories();
      if (stories.length > 1) {
        stepStoryViewer(1);
      } else {
        _storyAutoPlayProgressPct = 0;
        if (activeBar) activeBar.style.width = '0%';
      }
    }
  }, 60);
}

function updateHeaderStoryBadge() {
  const badge = document.getElementById('hdrStoryCountBadge');
  if (!badge || !REMO_STORE || !REMO_STORE.state) return;
  const stories = getActiveValid24hStories();
  badge.textContent = String(stories.length);
  badge.style.display = stories.length > 0 ? 'inline-flex' : 'none';
}
window.updateHeaderStoryBadge = updateHeaderStoryBadge;

function openStoriesHubModal(initialStoryId = '') {
  const modal = document.getElementById('storyViewerModal');
  if (!modal) return;
  const lang = REMO_I18N.getLang();
  const u = REMO_STORE.getCurrentUser();
  const citySel = document.getElementById('storyCreateCitySel');
  if (citySel) {
    citySel.innerHTML = getRemoCities().map((c) =>
      `<option value="${c.id}" ${u && u.homeCity === c.id ? 'selected' : ''}>${c.flag} ${escapeHtmlStr(getCityName(c, lang))}</option>`
    ).join('');
  }
  const stories = getActiveValid24hStories();
  const targetId = initialStoryId || (stories[0] && stories[0].id) || '';
  modal.classList.add('open');
  renderStoriesModalStripAndStage(targetId);
}
window.openStoriesHubModal = openStoriesHubModal;

function toggleStoryCreateDrawer(forceOpen) {
  const drawer = document.getElementById('storyCreateDrawerBox');
  if (!drawer) return;
  const isOpen = forceOpen !== undefined ? forceOpen : drawer.style.display === 'none';
  drawer.style.display = isOpen ? 'block' : 'none';
}
window.toggleStoryCreateDrawer = toggleStoryCreateDrawer;

function openStoryUploadPrompt() {
  openStoriesHubModal();
  toggleStoryCreateDrawer(true);
}
window.openStoryUploadPrompt = openStoryUploadPrompt;

function handleStoryPhotoUpload(ev) {
  const file = ev.target.files && ev.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const cv = document.createElement('canvas');
      const maxDim = 720;
      let w = img.width;
      let h = img.height;
      if (w > maxDim || h > maxDim) {
        if (w > h) { h = Math.round((h * maxDim) / w); w = maxDim; }
        else { w = Math.round((w * maxDim) / h); h = maxDim; }
      }
      cv.width = w;
      cv.height = h;
      cv.getContext('2d').drawImage(img, 0, 0, w, h);
      _pendingStoryPhotoDataUrl = cv.toDataURL('image/jpeg', 0.78);
      const prev = document.getElementById('storyPhotoPreviewBox');
      if (prev) {
        prev.style.display = 'block';
        prev.innerHTML = `<img src="${_pendingStoryPhotoDataUrl}" style="width:100%;max-height:165px;object-fit:cover;display:block;">`;
      }
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}
window.handleStoryPhotoUpload = handleStoryPhotoUpload;

function publishCitizen24hStory() {
  const lang = REMO_I18N.getLang();
  const isFr = lang === 'fr';
  const u = REMO_STORE.getCurrentUser();
  if (REMO_STORE.isCurrentUserBanned()) {
    remoToast(t('auth_err_banned'));
    return;
  }
  if (!u || u.role === 'guest') {
    document.getElementById('storyViewerModal')?.classList.remove('open');
    openAuthModal();
    return;
  }
  const cityId = document.getElementById('storyCreateCitySel')?.value || u.homeCity || 'montreal';
  const capInp = document.getElementById('storyCreateCaptionInp');
  const txt = (capInp?.value || '').trim();
  if (!txt && !_pendingStoryPhotoDataUrl) {
    remoToast(isFr ? '⚠️ Ajoutez une photo ou un texte pour votre Story !' : '⚠️ Add a photo or caption for your Story!');
    return;
  }
  const finalTxt = txt || (isFr ? 'En direct de ma ville ! ✨' : 'Live from my city! ✨');
  const newStory = {
    id: 'st_' + Date.now(),
    uid: u.uid,
    author: u.name,
    cityId,
    caption_en: finalTxt,
    caption_fr: finalTxt,
    mediaUrl: _pendingStoryPhotoDataUrl || '',
    views: 1,
    tipsCoins: 0,
    reactions: { '❤️': 1, '🔥': 1, '👑': 0 },
    createdAt: Date.now()
  };
  REMO_STORE.state.stories = getActiveValid24hStories();
  REMO_STORE.state.stories.unshift(newStory);
  _pendingStoryPhotoDataUrl = '';
  if (capInp) capInp.value = '';
  const prev = document.getElementById('storyPhotoPreviewBox');
  if (prev) { prev.style.display = 'none'; prev.innerHTML = ''; }
  toggleStoryCreateDrawer(false);

  REMO_STORE.addCoins(u.uid, 10, 10);
  REMO_STORE.save(true, 'story');
  REMO_STORE.syncStoryToCloud(newStory);
  REMO_STORE.syncToFirestore('story_added', true);
  syncHeaderAndSidebars();
  updateHeaderStoryBadge();
  renderStoriesModalStripAndStage(newStory.id);
  spawnRemoCoinsFX(8);
  remoToast(isFr ? '📸 Story 24h publiée (+10 🪙) !' : '📸 24h Story published (+10 🪙)!', 'fanfare');
}
window.publishCitizen24hStory = publishCitizen24hStory;

function renderStoriesModalStripAndStage(storyId = '') {
  const strip = document.getElementById('storyModalAvatarsStrip');
  const box = document.getElementById('storyViewerBody');
  const lang = REMO_I18N.getLang();
  const isFr = lang === 'fr';
  const authorGroups = getGroupedAuthorStories();
  const allStories = getActiveValid24hStories();

  if (!authorGroups.length || !allStories.length) {
    _activeStoryViewerId = '';
    stopStoryAutoPlayTimer();
    if (strip) {
      strip.innerHTML = `
        <div class="story-pill" onclick="toggleStoryCreateDrawer()" style="flex-shrink:0;cursor:pointer;">
          <div class="story-ring" style="background:linear-gradient(135deg,#ec4899,#6366f1);">
            <div class="story-ring-inner">+</div>
          </div>
          <div class="story-lbl" style="color:#fbcfe8;font-weight:900;">${escapeHtmlStr(t('stories_add'))}</div>
        </div>
      `;
    }
    if (box) {
      box.innerHTML = `
        <div style="text-align:center;padding:28px;color:var(--muted);">
          📸 ${isFr ? 'Aucune Story active dans les dernières 24h. Cliquez sur + pour publier la première Story (+10 🪙) !' : 'No active Story in the last 24h. Click + to publish the first 24h Story (+10 🪙)!'}
        </div>
      `;
    }
    return;
  }

  // Find active author group and active story
  let activeGroup = null;
  let activeStory = null;

  if (storyId) {
    activeGroup = authorGroups.find((g) => g.stories.some((s) => s.id === storyId)) || null;
    if (activeGroup) {
      activeStory = activeGroup.stories.find((s) => s.id === storyId) || null;
    }
  }

  if (!activeGroup || !activeStory) {
    activeGroup = authorGroups[0];
    const unviewed = activeGroup.stories.find((s) => !_viewedStoryIdsSession.has(s.id));
    activeStory = unviewed || activeGroup.stories[0];
  }

  _activeStoryViewerId = activeStory.id;
  const authorStories = activeGroup.stories;
  const curSubIdx = Math.max(0, authorStories.findIndex((s) => s.id === activeStory.id));

  // Render strictly ONE circle per user in the top avatars strip
  if (strip) {
    strip.innerHTML = `
      <div class="story-pill" onclick="toggleStoryCreateDrawer()" style="flex-shrink:0;cursor:pointer;text-align:center;">
        <div class="story-ring" style="background:linear-gradient(135deg,#ec4899,#6366f1);">
          <div class="story-ring-inner">+</div>
        </div>
        <div class="story-lbl" style="color:#fbcfe8;font-weight:900;">${escapeHtmlStr(t('stories_add'))}</div>
      </div>
      ${authorGroups.map((grp) => {
        const c = getCityById(grp.cityId);
        const isSel = (activeGroup && activeGroup.key === grp.key);
        const count = grp.stories.length;
        return `
          <div class="story-pill" onclick="openAuthorStoriesGroup('${escapeHtmlStr(grp.key)}')" style="position:relative;flex-shrink:0;cursor:pointer;text-align:center;transform:${isSel ? 'scale(1.06)' : 'none'};transition:transform 0.15s ease;">
            <div class="story-ring" style="position:relative;background:${isSel ? 'linear-gradient(135deg,#fbbf24,#ec4899)' : 'linear-gradient(135deg,rgba(56,189,248,0.7),rgba(236,72,153,0.7))'};box-shadow:${isSel ? '0 0 14px rgba(251,191,36,0.65)' : 'none'};">
              <div class="story-ring-inner">${c.flag}</div>
              ${count > 1 ? `
                <span style="position:absolute;top:-2px;right:-2px;background:linear-gradient(135deg,#ec4899,#f59e0b);color:#fff;font-size:0.62rem;font-weight:900;padding:1px 6px;border-radius:99px;border:1.5px solid #0b1120;box-shadow:0 2px 6px rgba(0,0,0,0.6);line-height:1.2;">
                  ${count}
                </span>
              ` : ''}
            </div>
            <div class="story-lbl" style="color:${isSel ? '#fde047' : '#cbd5e1'};font-weight:${isSel ? '900' : '700'};">${escapeHtmlStr(grp.author)}</div>
          </div>
        `;
      }).join('')}
    `;
  }

  if (!box) return;

  if (!_viewedStoryIdsSession.has(activeStory.id)) {
    _viewedStoryIdsSession.add(activeStory.id);
    activeStory.views = Number(activeStory.views || 0) + 1;
    REMO_STORE.save(false, 'story_view');
  }

  const c = getCityById(activeStory.cityId);
  const capTxt = isFr ? (activeStory.caption_fr || activeStory.caption_en) : (activeStory.caption_en || activeStory.caption_fr);
  const imgSrc = activeStory.mediaUrl || resolveCityFallbackArtUrl(c);
  const rx = activeStory.reactions || { '❤️': 1, '🔥': 1, '👑': 0 };
  const u = REMO_STORE.getCurrentUser();
  const isAdm = REMO_STORE.isAdminUnlocked() || REMO_STORE.isCurrentUserAdmin();
  const canDelete = isAdm || (u && u.uid && activeStory.uid && u.uid === activeStory.uid);

  const msLeft = Math.max(0, 86400000 - (Date.now() - Number(activeStory.createdAt || Date.now())));
  const hoursLeft = Math.floor(msLeft / 3600000);
  const minsLeft = Math.max(1, Math.floor((msLeft % 3600000) / 60000));
  const viewsCount = Math.max(1, Number(activeStory.views || 1));
  const tipsCoins = Number(activeStory.tipsCoins || 0);

  box.innerHTML = `
    <div style="position:relative;border-radius:16px;overflow:hidden;background:#050816;border:1px solid rgba(255,255,255,0.12);"
         onpointerenter="pauseStoryAutoPlay(true)" onpointerleave="pauseStoryAutoPlay(false)"
         ontouchstart="pauseStoryAutoPlay(true)" ontouchend="pauseStoryAutoPlay(false)">
      <!-- Story Progress Indicators for Active Author's Stories (6s Auto-Play) -->
      <div style="display:flex;align-items:center;gap:6px;padding:8px 10px;background:rgba(0,0,0,0.72);">
        <div style="display:flex;gap:4px;flex:1;">
          ${authorStories.map((st, i) => `
            <div style="flex:1;height:4px;border-radius:99px;background:rgba(255,255,255,0.2);overflow:hidden;">
              <div ${i === curSubIdx ? 'id="storyActiveProgressFill"' : ''} style="height:100%;width:${i < curSubIdx ? '100%' : (i === curSubIdx ? '0%' : '0%')};background:linear-gradient(90deg,#fbbf24,#ec4899);transition:width 0.06s linear;"></div>
            </div>
          `).join('')}
        </div>
        <span id="storyAutoPlayStateBadge" style="font-size:0.65rem;font-weight:900;color:#94a3b8;letter-spacing:0.4px;">▶ 6s</span>
      </div>

      <!-- Story Header -->
      <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:rgba(15,23,42,0.92);flex-wrap:wrap;gap:6px;">
        <div style="display:flex;align-items:center;gap:8px;">
          <span style="font-size:1.3rem;">${c.flag}</span>
          <div>
            <div style="font-weight:900;font-size:0.88rem;color:#fff;">@${escapeHtmlStr(activeStory.author)}</div>
            <div style="font-size:0.72rem;color:#7dd3fc;">${escapeHtmlStr(getCityName(c, lang))} · ${curSubIdx + 1}/${authorStories.length} · ⏳ ${hoursLeft}h ${minsLeft}m</div>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:6px;">
          <button type="button" class="adm-pbtn" style="background:linear-gradient(135deg,#0284c7,#6366f1);color:#fff;border:none;font-weight:900;padding:5px 10px;font-size:0.74rem;" onclick="shareActive24hStory916('${activeStory.id}')">
            📲 ${isFr ? 'Partager 9:16 (+25 🪙)' : 'Share 9:16 (+25 🪙)'}
          </button>
          ${canDelete ? `
            <button type="button" class="adm-pbtn danger" onclick="adminDeleteStoryInline('${activeStory.id}')">🗑️ ${isFr ? 'Supprimer' : 'Delete'}</button>
          ` : ''}
        </div>
      </div>

      <!-- Story Image + 4D Live City Stamp + Prev/Next Controls -->
      <div style="position:relative;">
        <img src="${imgSrc}" alt="${escapeHtmlStr(capTxt)}" style="width:100%;max-height:52dvh;object-fit:cover;display:block;">
        <!-- 4D City Holographic Stamp -->
        <div style="position:absolute;top:10px;left:10px;padding:4px 10px;border-radius:99px;background:rgba(5,8,22,0.78);backdrop-filter:blur(6px);border:1px solid rgba(56,189,248,0.45);color:#f8fafc;font-size:0.68rem;font-weight:900;letter-spacing:0.5px;display:flex;align-items:center;gap:6px;box-shadow:0 4px 14px rgba(0,0,0,0.45);">
          <span>${c.flag} ${escapeHtmlStr(getCityName(c, lang).toUpperCase())}</span>
          <span style="color:#38bdf8;">•</span>
          <span style="color:#fde047;">24H LIVE</span>
        </div>
        <div style="position:absolute;top:10px;right:10px;padding:4px 10px;border-radius:99px;background:rgba(5,8,22,0.78);backdrop-filter:blur(6px);border:1px solid rgba(251,191,36,0.4);color:#fde047;font-size:0.68rem;font-weight:900;">
          👁️ ${viewsCount}
        </div>
        ${(allStories.length > 1) ? `
          <button type="button" onclick="stepStoryViewer(-1)" style="position:absolute;left:8px;top:50%;transform:translateY(-50%);width:36px;height:36px;border-radius:50%;border:1px solid rgba(255,255,255,0.35);background:rgba(0,0,0,0.65);color:#fff;font-size:1.1rem;cursor:pointer;">‹</button>
          <button type="button" onclick="stepStoryViewer(1)" style="position:absolute;right:8px;top:50%;transform:translateY(-50%);width:36px;height:36px;border-radius:50%;border:1px solid rgba(255,255,255,0.35);background:rgba(0,0,0,0.65);color:#fff;font-size:1.1rem;cursor:pointer;">›</button>
        ` : ''}
      </div>

      <!-- Story Caption, Quick Reactions & +5 Coin Tip -->
      <div style="padding:12px;background:rgba(15,23,42,0.95);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
        <div style="font-weight:800;font-size:0.88rem;color:#fde047;flex:1;min-width:160px;">"${escapeHtmlStr(capTxt)}"</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;">
          ${['❤️', '🔥', '👑'].map((em) => `
            <button type="button" class="btn-ghost" style="padding:4px 10px;font-size:0.78rem;" onclick="reactToStory('${activeStory.id}','${em}')">
              ${em} ${Number(rx[em] || 0)}
            </button>
          `).join('')}
          <button type="button" class="btn-ghost" style="padding:4px 10px;font-size:0.78rem;border-color:rgba(251,191,36,0.55);color:#fde047;font-weight:900;background:rgba(251,191,36,0.12);" onclick="tipStoryAuthor('${activeStory.id}')">
            🪙 +5 ${tipsCoins > 0 ? `(${tipsCoins})` : ''}
          </button>
        </div>
      </div>
    </div>
  `;

  startStoryAutoPlayTimer();
}
window.renderStoriesModalStripAndStage = renderStoriesModalStripAndStage;

function openStoryViewer(storyId) {
  openStoriesHubModal(storyId);
}
window.openStoryViewer = openStoryViewer;

function stepStoryViewer(delta) {
  const authorGroups = getGroupedAuthorStories();
  if (!authorGroups.length) return;

  let grpIdx = authorGroups.findIndex((g) => g.stories.some((s) => s.id === _activeStoryViewerId));
  if (grpIdx === -1) grpIdx = 0;
  const currentGroup = authorGroups[grpIdx];
  const curSubIdx = currentGroup.stories.findIndex((s) => s.id === _activeStoryViewerId);
  const nextSubIdx = curSubIdx + delta;

  if (delta > 0) {
    if (nextSubIdx < currentGroup.stories.length) {
      renderStoriesModalStripAndStage(currentGroup.stories[nextSubIdx].id);
    } else {
      const nextGrpIdx = (grpIdx + 1) % authorGroups.length;
      const nextGroup = authorGroups[nextGrpIdx];
      renderStoriesModalStripAndStage(nextGroup.stories[0].id);
    }
  } else if (delta < 0) {
    if (nextSubIdx >= 0) {
      renderStoriesModalStripAndStage(currentGroup.stories[nextSubIdx].id);
    } else {
      const prevGrpIdx = (grpIdx - 1 + authorGroups.length) % authorGroups.length;
      const prevGroup = authorGroups[prevGrpIdx];
      renderStoriesModalStripAndStage(prevGroup.stories[prevGroup.stories.length - 1].id);
    }
  }
}
window.stepStoryViewer = stepStoryViewer;

function reactToStory(storyId, emoji) {
  const s = getActiveValid24hStories().find((x) => x && x.id === storyId);
  if (!s) return;
  s.reactions = s.reactions || { '❤️': 1, '🔥': 1, '👑': 0 };
  s.reactions[emoji] = Number(s.reactions[emoji] || 0) + 1;
  RemoAudio.play('click');
  REMO_STORE.save(true, 'story_react');
  REMO_STORE.syncStoryToCloud(s);
  REMO_STORE.syncToFirestore('story_react', false);
  renderStoriesModalStripAndStage(storyId);
}
window.reactToStory = reactToStory;

function tipStoryAuthor(storyId) {
  const isFr = REMO_I18N.getLang() === 'fr';
  const s = getActiveValid24hStories().find((x) => x && x.id === storyId);
  if (!s) return;
  const u = REMO_STORE.getCurrentUser();
  if (!u || u.role === 'guest') {
    document.getElementById('storyViewerModal')?.classList.remove('open');
    openAuthModal();
    return;
  }
  if (u.uid && s.uid && u.uid === s.uid) {
    remoToast(isFr ? '💡 Vous êtes l’auteur de cette Story !' : '💡 You are the author of this Story!');
    return;
  }
  if (Number(u.coins || 0) < 5) {
    remoToast(isFr ? '⚠️ Il vous faut au moins 5 🪙 pour envoyer un cadeau !' : '⚠️ You need at least 5 🪙 to send a tip!');
    return;
  }
  REMO_STORE.addCoins(u.uid, -5, 5);
  if (s.uid) {
    REMO_STORE.addCoins(s.uid, 5, 5);
  }
  s.tipsCoins = Number(s.tipsCoins || 0) + 5;
  s.reactions = s.reactions || { '❤️': 1, '🔥': 1, '👑': 0 };
  s.reactions['👑'] = Number(s.reactions['👑'] || 0) + 1;
  RemoAudio.play('coin');
  spawnRemoCoinsFX(8);
  REMO_STORE.save(true, 'story_tip');
  REMO_STORE.syncStoryToCloud(s);
  REMO_STORE.syncToFirestore('story_tip', true);
  syncHeaderAndSidebars();
  renderStoriesModalStripAndStage(storyId);
  remoToast(isFr ? `🪙 +5 Coins envoyés à @${s.author} !` : `🪙 +5 Coins sent to @${s.author}!`, 'fanfare');
}
window.tipStoryAuthor = tipStoryAuthor;

async function shareActive24hStory916(storyId) {
  const lang = REMO_I18N.getLang();
  const isFr = lang === 'fr';
  const stories = getActiveValid24hStories();
  const s = stories.find((x) => x && x.id === storyId) || stories[0];
  if (!s) return;

  pauseStoryAutoPlay(true);
  const c = getCityById(s.cityId);
  const cityName = getCityName(c, lang);
  const capTxt = isFr ? (s.caption_fr || s.caption_en || '') : (s.caption_en || s.caption_fr || '');
  const u = REMO_STORE.getCurrentUser();
  const refCode = (u && u.referralCode) ? u.referralCode : 'REMO2026';

  const cv = document.createElement('canvas');
  cv.width = 540;
  cv.height = 960;
  const ctx = cv.getContext('2d');

  const drawBackgroundAndFrame = () => {
    const bg = ctx.createLinearGradient(0, 0, 540, 960);
    bg.addColorStop(0, '#050816');
    bg.addColorStop(0.5, '#0f172a');
    bg.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 540, 960);

    ctx.strokeStyle = 'rgba(251, 191, 36, 0.45)';
    ctx.lineWidth = 4;
    ctx.strokeRect(18, 18, 504, 924);

    // Top 4D Header Pill
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.fillRect(36, 38, 468, 68);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
    ctx.lineWidth = 2;
    ctx.strokeRect(36, 38, 468, 68);

    ctx.fillStyle = '#fde047';
    ctx.font = '900 18px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`📸 REMO 24H CITY STORY • ${c.flag} ${cityName.toUpperCase()}`, 270, 68);
    ctx.fillStyle = '#7dd3fc';
    ctx.font = '700 14px system-ui, sans-serif';
    ctx.fillText(`@${s.author} • 👁️ ${Math.max(1, Number(s.views || 1))} • 🪙 +${Number(s.tipsCoins || 0)}`, 270, 92);
  };

  drawBackgroundAndFrame();

  const imgSrc = s.mediaUrl || resolveCityFallbackArtUrl(c);
  if (imgSrc) {
    await new Promise((resolve) => {
      const img = new Image();
      if (!imgSrc.startsWith('data:')) img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          ctx.save();
          ctx.beginPath();
          ctx.rect(36, 124, 468, 520);
          ctx.clip();
          const scale = Math.max(468 / img.width, 520 / img.height);
          const dw = img.width * scale;
          const dh = img.height * scale;
          ctx.drawImage(img, 36 + (468 - dw) / 2, 124 + (520 - dh) / 2, dw, dh);
          ctx.restore();
          ctx.strokeStyle = 'rgba(236, 72, 153, 0.65)';
          ctx.lineWidth = 3;
          ctx.strokeRect(36, 124, 468, 520);
        } catch (err) {
          drawBackgroundAndFrame();
        }
        resolve();
      };
      img.onerror = () => resolve();
      img.src = imgSrc;
    });
  }

  // Caption Box
  ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
  ctx.fillRect(36, 662, 468, 130);
  ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
  ctx.lineWidth = 2;
  ctx.strokeRect(36, 662, 468, 130);

  ctx.fillStyle = '#fde047';
  ctx.font = '800 20px system-ui, sans-serif';
  ctx.textAlign = 'center';
  const shortCap = capTxt.length > 72 ? capTxt.slice(0, 69) + '...' : capTxt;
  ctx.fillText(`"${shortCap}"`, 270, 718);

  const rx = s.reactions || { '❤️': 1, '🔥': 1, '👑': 0 };
  ctx.fillStyle = '#f8fafc';
  ctx.font = '800 17px system-ui, sans-serif';
  ctx.fillText(`❤️ ${Number(rx['❤️'] || 0)}   🔥 ${Number(rx['🔥'] || 0)}   👑 ${Number(rx['👑'] || 0)}`, 270, 766);

  // Bottom Viral CTA
  ctx.fillStyle = 'rgba(2, 132, 199, 0.25)';
  ctx.fillRect(36, 810, 468, 108);
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2;
  ctx.strokeRect(36, 810, 468, 108);

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 20px system-ui, sans-serif';
  ctx.fillText('🌍 JOIN REMOWORLD.COM (4D METAVERSE)', 270, 848);
  ctx.fillStyle = '#fde047';
  ctx.font = '900 17px system-ui, sans-serif';
  ctx.fillText(isFr ? `Code Invité : ${refCode} (+100 🪙 Bonus)` : `Invite Code: ${refCode} (+100 🪙 Bonus)`, 270, 882);

  let dataUrl = '';
  try {
    dataUrl = cv.toDataURL('image/png');
  } catch (e) {
    remoToast(isFr ? '⚠️ Erreur export image' : '⚠️ Image export error');
    return;
  }

  let copiedImg = false;
  try {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    if (navigator.clipboard && window.ClipboardItem) {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      copiedImg = true;
    }
  } catch (e) {}

  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = `remo-story-${c.id}-${Date.now()}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();

  if (typeof rewardViralShareWithDailyCap === 'function') {
    rewardViralShareWithDailyCap('story_916');
  }
  remoToast(
    copiedImg
      ? (isFr ? '📲 Story 9:16 copiée (Ctrl+V sur Facebook) & téléchargée !' : '📲 9:16 Story copied (Ctrl+V on Facebook) & downloaded!')
      : (isFr ? '📲 Carte Story 9:16 téléchargée !' : '📲 9:16 Story Card downloaded!'),
    'fanfare'
  );
}
window.shareActive24hStory916 = shareActive24hStory916;

function adminDeleteStoryInline(storyId) {
  const isFr = REMO_I18N.getLang() === 'fr';
  const u = REMO_STORE.getCurrentUser();
  const stories = Array.isArray(REMO_STORE.state.stories) ? REMO_STORE.state.stories : [];
  const target = stories.find((x) => x && x.id === storyId);
  const isOwnStory = !!(u && u.uid && target && target.uid && u.uid === target.uid);
  if (!isOwnStory && !REMO_STORE.isAdminUnlocked() && !REMO_STORE.isCurrentUserAdmin()) return;

  if (typeof REMO_STORE.deleteStoryFromCloud === 'function') {
    REMO_STORE.deleteStoryFromCloud(storyId);
  } else {
    if (!REMO_STORE.deletedStoryIds) {
      REMO_STORE.deletedStoryIds = new Set(['st_1', 'st_2', 'st_3', 'st_4']);
    }
    REMO_STORE.deletedStoryIds.add(storyId);
    try {
      localStorage.setItem('remo_deleted_stories', JSON.stringify([...REMO_STORE.deletedStoryIds]));
    } catch (e) {}
    REMO_STORE.state.stories = stories.filter((x) => x && x.id !== storyId && !REMO_STORE.deletedStoryIds.has(x.id));
    REMO_STORE.save(true, 'story_del');
    REMO_STORE.syncToFirestore('story_deleted', true);
  }
  updateHeaderStoryBadge();
  renderStoriesModalStripAndStage();
  remoToast(isFr ? '🗑️ Story supprimée définitivement !' : '🗑️ Story permanently deleted!');
}
window.adminDeleteStoryInline = adminDeleteStoryInline;

/* ── 5. CITY LIVE CHAT ROOMS (#7 WALKIE-TALKIE), #5 1-ON-1 PRIVATE MESSENGER & WEBRTC CALLS ── */
function renderCityChatView() {
  const tabs = document.getElementById('chatCityTabs');
  const msgsBox = document.getElementById('chatRoomMessages');
  const lang = REMO_I18N.getLang();
  const isAdm = REMO_STORE.isAdminUnlocked();
  if (!tabs || !msgsBox) return;

  const allCityIds = getRemoCities().map((c) => c.id);
  const rooms = ['global', ...allCityIds];
  tabs.innerHTML = rooms.map((r) => {
    const lbl = r === 'global' ? '🌍 Global' : `${getCityById(r).flag} ${getCityName(getCityById(r), lang)}`;
    return `<button class="fchip ${currentChatRoom === r ? 'active' : ''}" onclick="selectCityChatRoom('${r}')">${lbl}</button>`;
  }).join('');

  const wtSub = document.getElementById('wtStatusSub');
  if (wtSub && !wtRecordingActive) {
    const chLabel = currentChatRoom === 'global' ? '🌍 CH-GLOBAL' : `${getCityById(currentChatRoom).flag} CH-${getCityById(currentChatRoom).code}`;
    wtSub.textContent = `${chLabel} · ${lang === 'fr' ? 'Prêt sur fréquence' : 'Ready on frequency'}`;
  }

  const list = (REMO_STORE.state.chatMessages && REMO_STORE.state.chatMessages[currentChatRoom]) || [];
  msgsBox.innerHTML = list.map((m) => {
    const vUrl = m.voiceUrl ? RemoMediaDB.resolveSyncOrPlaceholder(m.voiceUrl) : '';
    const vIdb = m.voiceUrl && String(m.voiceUrl).startsWith('idb://') ? `data-idb-src="${m.voiceUrl}"` : '';
    const dual = m.text ? REMO_TRANSLATOR.makeBilingualPair(m.text) : null;
    const altTxt = dual ? (lang === 'fr' ? dual.fr : dual.en) : '';
    return `
      <div class="${m.isWalkieTalkie ? 'wt-chat-card' : ''}" style="padding:10px 14px;border-radius:14px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.06);margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;gap:8px;">
        <div style="flex:1;">
          <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
            <b style="color:#fbbf24;cursor:pointer;" onclick="openDirectChatWithUser('${escapeJsSingleArg(m.uid || '')}')">${escapeHtmlStr(m.cityFlag || '🌐')} @${escapeHtmlStr(m.author)} 💌:</b>
            ${m.isWalkieTalkie ? `<span class="surge-mini-pill" style="background:linear-gradient(135deg,#0ea5e9,#10b981);">${t('wt_msg_badge')}</span>` : ''}
          </div>
          ${m.text ? `<div style="margin-top:3px;color:#f1f5f9;">${escapeHtmlStr(m.text)}</div>` : ''}
          ${altTxt && altTxt.toLowerCase() !== String(m.text || '').toLowerCase() ? `<div style="font-size:0.74rem;color:#94a3b8;margin-top:2px;">🌐 ${escapeHtmlStr(altTxt)}</div>` : ''}
          ${m.voiceUrl ? `<audio src="${sanitizeSafeMediaUrl(vUrl)}" ${vIdb} controls style="width:100%;max-width:340px;height:32px;margin-top:5px;"></audio>` : ''}
        </div>
        ${isAdm ? `<button class="adm-pbtn danger" onclick="adminDeleteChatMsgInline('${escapeJsSingleArg(currentChatRoom)}', '${escapeJsSingleArg(m.id)}')">🗑️</button>` : ''}
      </div>
    `;
  }).join('') || `<div style="text-align:center;color:var(--muted);padding:24px;">${lang === 'fr' ? 'Canal ouvert — envoyez un message ou utilisez le Talkie-Walkie 📻 !' : 'Channel open — type a message or press the Walkie-Talkie 📻!'}</div>`;

  RemoMediaDB.hydrateDom(msgsBox);
  msgsBox.scrollTop = msgsBox.scrollHeight;
}

function adminDeleteChatMsgInline(room, msgId) {
  if (!REMO_STORE.isAdminUnlocked()) return;
  if (REMO_STORE.state.chatMessages && Array.isArray(REMO_STORE.state.chatMessages[room])) {
    REMO_STORE.state.chatMessages[room] = REMO_STORE.state.chatMessages[room].filter((m) => m.id !== msgId);
    REMO_STORE.save(true, 'chat_del');
    renderCityChatView();
  }
}

function selectCityChatRoom(room) {
  currentChatRoom = room;
  RemoAudio.play('roger');
  renderCityChatView();
}

function sendCityChatMessage() {
  if (REMO_STORE.isCurrentUserBanned()) {
    remoToast(t('auth_err_banned'));
    return;
  }
  const inp = document.getElementById('chatRoomInput');
  if (!inp || !inp.value.trim()) return;
  const u = REMO_STORE.getCurrentUser() || REMO_STORE.ensureGuestOrCitizen('Citizen', '', 'montreal');
  const c = getCityById(u.homeCity);
  REMO_STORE.state.chatMessages[currentChatRoom] = REMO_STORE.state.chatMessages[currentChatRoom] || [];
  REMO_STORE.state.chatMessages[currentChatRoom].push({
    id: 'm_' + Date.now(),
    uid: u.uid,
    author: u.name,
    cityFlag: c.flag,
    text: inp.value.trim(),
    ts: Date.now()
  });
  inp.value = '';
  REMO_STORE.save(true, 'chat');
  renderCityChatView();
}

/* ── #7 Push-to-Talk Walkie-Talkie Engine ── */
async function startCityWalkieTalkie(ev) {
  if (ev && ev.type === 'pointerdown') ev.preventDefault();
  if (wtRecordingActive) {
    // Allow second tap to stop if tapped instead of held
    stopCityWalkieTalkie();
    return;
  }
  const lang = REMO_I18N.getLang();
  wtRecordingActive = true;
  RemoAudio.play('roger');
  RemoAudio.haptic(25);

  const btn = document.getElementById('btnCityWalkieTalkie');
  const lbl = document.getElementById('wtBtnLabel');
  const bars = document.getElementById('wtLiveWaveBars');
  const sub = document.getElementById('wtStatusSub');
  if (btn) btn.classList.add('transmitting');
  if (lbl) lbl.textContent = t('wt_live_tx');
  if (bars) bars.classList.add('active');
  if (sub) sub.textContent = '🔴 ON AIR (Max 15s)';

  try {
    wtStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const chunks = [];
    wtRecorder = new MediaRecorder(wtStream);
    wtRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
    wtRecorder.onstop = async () => {
      if (wtStream) { wtStream.getTracks().forEach((tr) => tr.stop()); wtStream = null; }
      const blob = new Blob(chunks, { type: 'audio/webm' });
      const voiceKey = await RemoMediaDB.saveBlob(blob, 'wt_radio');
      publishWalkieTalkieTransmission(voiceKey);
    };
    wtRecorder.start();
    wtTimeoutId = setTimeout(() => { if (wtRecordingActive) stopCityWalkieTalkie(); }, 15000);
  } catch (err) {
    // Instant synth Walkie-Talkie fallback when tested without a physical microphone
    wtTimeoutId = setTimeout(() => {
      if (wtRecordingActive) {
        wtRecordingActive = false;
        resetWalkieTalkieUI();
        publishWalkieTalkieTransmission(RemoAudio.createSynthVoiceWavDataUrl(2.4));
      }
    }, 900);
  }
}

function resetWalkieTalkieUI() {
  const btn = document.getElementById('btnCityWalkieTalkie');
  const lbl = document.getElementById('wtBtnLabel');
  const bars = document.getElementById('wtLiveWaveBars');
  if (btn) btn.classList.remove('transmitting');
  if (lbl) lbl.textContent = t('wt_hold_btn');
  if (bars) bars.classList.remove('active');
}

function stopCityWalkieTalkie(ev) {
  if (!wtRecordingActive) return;
  wtRecordingActive = false;
  if (wtTimeoutId) { clearTimeout(wtTimeoutId); wtTimeoutId = null; }
  resetWalkieTalkieUI();
  RemoAudio.play('roger');

  if (wtRecorder && wtRecorder.state === 'recording') {
    try { wtRecorder.stop(); } catch (e) {}
  } else {
    publishWalkieTalkieTransmission(RemoAudio.createSynthVoiceWavDataUrl(2.4));
  }
}

function publishWalkieTalkieTransmission(voiceKey) {
  const lang = REMO_I18N.getLang();
  if (REMO_STORE.isCurrentUserBanned()) {
    remoToast(t('auth_err_banned'));
    return;
  }
  const u = REMO_STORE.getCurrentUser() || REMO_STORE.ensureGuestOrCitizen('Radio Operator', '', 'montreal');
  const c = getCityById(u.homeCity);
  REMO_STORE.state.chatMessages[currentChatRoom] = REMO_STORE.state.chatMessages[currentChatRoom] || [];
  REMO_STORE.state.chatMessages[currentChatRoom].push({
    id: 'wt_' + Date.now(),
    uid: u.uid,
    author: u.name,
    cityFlag: c.flag,
    isWalkieTalkie: true,
    voiceUrl: voiceKey,
    text: lang === 'fr' ? `📻 Transmission radio en direct (${getCityName(c, 'fr')})` : `📻 Live radio transmission (${getCityName(c, 'en')})`,
    ts: Date.now()
  });
  REMO_STORE.addCoins(u.uid, 5, 5);
  REMO_STORE.save(true, 'wt_radio');
  syncHeaderAndSidebars();
  renderCityChatView();

  // Auto-play scanner if checked!
  if (document.getElementById('wtAutoScannerChk')?.checked) {
    setTimeout(() => {
      const audios = document.querySelectorAll('#chatRoomMessages audio');
      const lastAudio = audios[audios.length - 1];
      if (lastAudio) lastAudio.play().catch(() => {});
    }, 180);
  }
}

/* ── #5 1-ON-1 PRIVATE MESSENGER 2.0 (SMART INBOX, AUTO-JUMP, SEARCH, GIFT ENVELOPES & 4D CARD TRADES) ── */
function isDmAddressedToMe(d, myUid, isAdmUser) {
  if (!d || !myUid || !d.fromUid || d.fromUid === myUid) return false;
  if (isAdmUser && d.fromUid === 'u_admin_founder' && myUid === 'u_admin_founder') return false;
  if (d.id === 'dm1' || d.id === 'dm_env_demo_1') return false;
  return d.toUid === myUid || Boolean(isAdmUser && (d.toUid === 'u_admin_founder' || !d.toUid || d.toUid === 'peer'));
}

function isDmSentByMe(d, myUid, isAdmUser) {
  if (!d || !myUid) return false;
  return d.fromUid === myUid || Boolean(isAdmUser && d.fromUid === 'u_admin_founder' && d.toUid !== myUid);
}

function formatDmSnippet(d, lang) {
  if (!d) return '';
  if (d.text && String(d.text).trim()) {
    const clean = String(d.text).trim();
    return clean.length > 36 ? clean.slice(0, 34) + '…' : clean;
  }
  if (d.voiceUrl) return lang === 'fr' ? '🎙️ Note vocale' : '🎙️ Voice note';
  if (d.envelopeCoins > 0) return `🧧 +${d.envelopeCoins} 🪙`;
  if (d.cardOffer) return lang === 'fr' ? '🎴 Offre Carte 4D' : '🎴 4D Card Offer';
  return lang === 'fr' ? '✉️ Message' : '✉️ Message';
}

function openDirectChatWithUser(targetUid) {
  const me = REMO_STORE.getCurrentUser();
  if (me && targetUid && targetUid === me.uid) {
    switchRemoView('passport');
    return;
  }
  if (targetUid && (!me || targetUid !== me.uid)) {
    _justReadDmHighlightIds.clear();
    activeDmPartnerUid = targetUid;
    _explicitDmPartnerSelected = true;
  }
  switchRemoView('messages');
}

function selectDmPartner(uid) {
  _justReadDmHighlightIds.clear();
  activeDmPartnerUid = uid;
  RemoAudio.play('click');
  renderDirectMessagesView();
}

function onDmSearchInput(val) {
  dmSearchQuery = String(val || '').trim();
  renderDirectMessagesView();
}
window.onDmSearchInput = onDmSearchInput;

function renderDirectMessagesView() {
  const box = document.getElementById('dmListContainer');
  const contactsBar = document.getElementById('dmContactsBar');
  const unreadBanner = document.getElementById('dmUnreadSendersBanner');
  const activeHdr = document.getElementById('dmActivePartnerHeader');
  const admEnvBtn = document.getElementById('btnDmAdminEnvelope');
  if (!box) return;

  const lang = REMO_I18N.getLang();
  const isAdm = REMO_STORE.isAdminUnlocked();
  const isAdmUser = REMO_STORE.isCurrentUserAdmin();
  if (admEnvBtn) admEnvBtn.style.display = isAdm ? 'inline-flex' : 'none';

  const me = REMO_STORE.getCurrentUser() || (REMO_STORE.state.users || [])[0] || { uid: 'u_admin_founder', name: 'Founder Admin', homeCity: 'montreal' };
  const allDms = REMO_STORE.state.directMessages || [];

  // Build complete citizen roster + synthesize any sender/recipient not yet synced in state.users
  const userMap = new Map();
  (REMO_STORE.state.users || []).forEach((u) => {
    if (!u || !u.uid) return;
    if (u.uid === me.uid) return;
    if (isAdmUser && u.uid === 'u_admin_founder' && me.uid !== 'u_admin_founder') return;
    userMap.set(u.uid, u);
  });
  allDms.forEach((d) => {
    if (!d || !d.fromUid || d.fromUid === me.uid) return;
    if (isAdmUser && d.fromUid === 'u_admin_founder' && me.uid !== 'u_admin_founder') return;
    if (!userMap.has(d.fromUid)) {
      userMap.set(d.fromUid, {
        uid: d.fromUid,
        name: d.fromName || 'Citizen',
        homeCity: d.fromCity || 'montreal',
        passportNum: '----'
      });
    }
  });
  const allUsers = Array.from(userMap.values());

  // Compute per-partner conversation stats in one fast pass (scales to 100k+ citizens)
  const statsMap = new Map();
  allDms.forEach((d) => {
    if (!d) return;
    let partnerId = null;
    const toMe = isDmAddressedToMe(d, me.uid, isAdmUser);
    const byMe = isDmSentByMe(d, me.uid, isAdmUser);
    if (toMe) partnerId = d.fromUid;
    else if (byMe) partnerId = d.toUid;
    else if (d.id === 'dm_env_demo_1' && d.fromUid === 'u_elena_kiv' && (me.uid === 'u_admin_founder' || isAdmUser)) partnerId = 'u_elena_kiv';
    if (!partnerId || !userMap.has(partnerId)) return;

    let st = statsMap.get(partnerId);
    if (!st) {
      st = { unreadCount: 0, lastMsg: null, lastTs: 0, hasUnclaimed: false };
      statsMap.set(partnerId, st);
    }
    if (toMe && !d.read) {
      st.unreadCount += 1;
    }
    if ((d.fromUid === partnerId) && d.envelopeCoins > 0 && !d.envelopeClaimed && (toMe || d.id === 'dm_env_demo_1')) {
      st.hasUnclaimed = true;
    }
    const ts = Number(d.ts || 0);
    if (ts >= st.lastTs && d.id !== 'dm1') {
      st.lastTs = ts;
      st.lastMsg = d;
    }
  });

  if (allUsers.length > 0 && !userMap.has(activeDmPartnerUid)) {
    // Pick newest unread sender first, or most recent conversation, or first user
    const best = allUsers.slice().sort((a, b) => {
      const sa = statsMap.get(a.uid) || { unreadCount: 0, lastTs: 0 };
      const sb = statsMap.get(b.uid) || { unreadCount: 0, lastTs: 0 };
      if (sb.unreadCount !== sa.unreadCount) return sb.unreadCount - sa.unreadCount;
      return sb.lastTs - sa.lastTs;
    })[0];
    activeDmPartnerUid = best ? best.uid : allUsers[0].uid;
  }

  const partner = userMap.get(activeDmPartnerUid) || allUsers[0] || { uid: 'u_elena_kiv', name: 'Elena KIV', homeCity: 'chisinau' };
  const isMessagesViewActive = (currentRemoView === 'messages');

  // Capture newly opened unread messages from active partner BEFORE marking read so they keep a "NEW ✨" highlight
  if (isMessagesViewActive) {
    allDms.forEach((d) => {
      if (d && d.fromUid === partner.uid && isDmAddressedToMe(d, me.uid, isAdmUser) && !d.read) {
        _justReadDmHighlightIds.add(d.id);
      }
    });
  }

  // Sort Smart Inbox: 1) Unread Senders -> 2) Unclaimed Gift Envelopes -> 3) Recent Active Chats -> 4) Active Partner -> 5) Others
  const sortedUsers = allUsers.slice().sort((a, b) => {
    const sa = statsMap.get(a.uid) || { unreadCount: 0, lastTs: 0, hasUnclaimed: false };
    const sb = statsMap.get(b.uid) || { unreadCount: 0, lastTs: 0, hasUnclaimed: false };
    const aUnread = (a.uid === partner.uid && isMessagesViewActive) ? 0 : sa.unreadCount;
    const bUnread = (b.uid === partner.uid && isMessagesViewActive) ? 0 : sb.unreadCount;
    if ((bUnread > 0 ? 1 : 0) !== (aUnread > 0 ? 1 : 0)) return bUnread > 0 ? 1 : -1;
    if (aUnread > 0 && bUnread > 0 && sb.lastTs !== sa.lastTs) return sb.lastTs - sa.lastTs;
    if ((sb.hasUnclaimed ? 1 : 0) !== (sa.hasUnclaimed ? 1 : 0)) return sb.hasUnclaimed ? 1 : -1;
    if (a.uid === partner.uid && sa.lastTs === 0 && sb.lastTs === 0) return -1;
    if (b.uid === partner.uid && sa.lastTs === 0 && sb.lastTs === 0) return 1;
    if (sb.lastTs !== sa.lastTs) return sb.lastTs - sa.lastTs;
    return 0;
  });

  // Render Top Unread Quick-Jump Bar if OTHER citizens still have unread messages
  if (unreadBanner) {
    const otherUnreadUsers = sortedUsers.filter((u) => {
      if (u.uid === partner.uid && isMessagesViewActive) return false;
      const st = statsMap.get(u.uid);
      return st && st.unreadCount > 0;
    });
    if (otherUnreadUsers.length > 0) {
      unreadBanner.style.display = 'flex';
      unreadBanner.innerHTML = `
        <span class="dm-unread-banner-lbl">${t('dm_unread_bar_lbl')}</span>
        ${otherUnreadUsers.map((u) => {
          const c = getCityById(u.homeCity);
          const cnt = statsMap.get(u.uid)?.unreadCount || 1;
          return `
            <button type="button" class="dm-unread-jump-pill" onclick="selectDmPartner('${escapeJsSingleArg(u.uid)}')">
              <span>${c.flag} @${escapeHtmlStr(u.name)}</span>
              <span class="dm-chip-unread-count">${cnt}</span>
            </button>
          `;
        }).join('')}
      `;
    } else {
      unreadBanner.style.display = 'none';
      unreadBanner.innerHTML = '';
    }
  }

  if (typeof renderDailyWorldMatchBox === 'function') {
    renderDailyWorldMatchBox(me, lang);
  }

  // Filter by instant search query (scales cleanly to thousands of citizens)
  const q = dmSearchQuery.toLowerCase().replace(/^@/, '');
  let visibleContacts = sortedUsers;
  if (q) {
    visibleContacts = sortedUsers.filter((u) => {
      const c = getCityById(u.homeCity);
      const nameMatch = String(u.name || '').toLowerCase().includes(q);
      const cityEnMatch = String(c.name_en || c.name || '').toLowerCase().includes(q);
      const cityFrMatch = String(c.name_fr || '').toLowerCase().includes(q);
      const cityIdMatch = String(u.homeCity || '').toLowerCase().includes(q);
      return nameMatch || cityEnMatch || cityFrMatch || cityIdMatch;
    }).slice(0, 50);
  } else {
    // Always keep active partner + all unread + active conversations + suggested citizens (capped at 35 for instant DOM)
    visibleContacts = sortedUsers.slice(0, 35);
    if (partner && partner.uid && !visibleContacts.some((u) => u.uid === partner.uid)) {
      visibleContacts.unshift(partner);
    }
  }

  if (contactsBar) {
    if (visibleContacts.length === 0) {
      contactsBar.innerHTML = `<div style="padding:8px 12px;font-size:0.78rem;color:var(--muted);">${t('dm_no_match')}</div>`;
    } else {
      contactsBar.innerHTML = visibleContacts.map((u) => {
        const c = getCityById(u.homeCity);
        const st = statsMap.get(u.uid) || { unreadCount: 0, lastMsg: null, lastTs: 0, hasUnclaimed: false };
        const effectiveUnread = (u.uid === partner.uid && isMessagesViewActive) ? 0 : st.unreadCount;
        const snippet = st.lastMsg
          ? formatDmSnippet(st.lastMsg, lang)
          : getCityName(c, lang);
        const relTime = st.lastTs ? formatNotifTimeAgo(st.lastTs, lang) : '';

        return `
          <button type="button" class="dm-contact-chip smart-card ${u.uid === partner.uid ? 'active' : ''} ${effectiveUnread > 0 ? 'unread-glow' : ''}" onclick="selectDmPartner('${escapeJsSingleArg(u.uid)}')">
            <div class="dm-chip-body">
              <div class="dm-chip-top">
                <span style="width:7px;height:7px;border-radius:50%;background:${effectiveUnread > 0 ? '#ef4444' : '#10b981'};display:inline-block;flex-shrink:0;"></span>
                <span>${c.flag} @${escapeHtmlStr(u.name)}</span>
                ${st.hasUnclaimed ? '<span>🧧</span>' : ''}
              </div>
              <div class="dm-chip-snippet">${escapeHtmlStr(snippet)}${relTime ? ` · ${escapeHtmlStr(relTime)}` : ''}</div>
            </div>
            ${effectiveUnread > 0 ? `<span class="dm-chip-unread-count">${effectiveUnread}</span>` : ''}
          </button>
        `;
      }).join('');
    }
  }

  // Active Partner Header right above thread
  if (activeHdr) {
    const pc = getCityById(partner.homeCity);
    activeHdr.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;">
        <div style="display:flex;align-items:center;gap:9px;min-width:0;cursor:pointer;" onclick="openCitizenProfileModal('${escapeJsSingleArg(partner.uid)}', '${escapeJsSingleArg(partner.name)}')">
          <span style="font-size:1.35rem;">${pc.flag}</span>
          <div style="min-width:0;">
            <div style="font-size:0.7rem;color:#7dd3fc;font-weight:800;text-transform:uppercase;letter-spacing:0.4px;">${t('dm_active_chat_with')}</div>
            <div style="font-size:0.92rem;font-weight:900;color:#fbbf24;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
              @${escapeHtmlStr(partner.name)} <span style="font-size:0.75rem;color:#cbd5e1;font-weight:700;">· ${escapeHtmlStr(getCityName(pc, lang))}${partner.passportNum ? ` · #${escapeHtmlStr(partner.passportNum)}` : ''}</span>
            </div>
          </div>
        </div>
        <button type="button" class="btn-ghost" style="font-size:0.73rem;padding:4px 10px;flex-shrink:0;" onclick="openCitizenProfileModal('${escapeJsSingleArg(partner.uid)}', '${escapeJsSingleArg(partner.name)}')">${t('dm_view_profile')}</button>
      </div>
    `;
  }

  const autoTrans = Boolean(document.getElementById('dmAutoTranslateChk')?.checked);
  const dms = allDms.filter(
    (d) =>
      (isDmSentByMe(d, me.uid, isAdmUser) && d.toUid === partner.uid) ||
      (d.fromUid === partner.uid && (isDmAddressedToMe(d, me.uid, isAdmUser) || d.toUid === me.uid || (isAdmUser && d.toUid === 'u_admin_founder')))
  );

  box.innerHTML = dms.map((d) => {
    const isMine = isDmSentByMe(d, me.uid, isAdmUser);
    const isJustOpened = !isMine && (_justReadDmHighlightIds.has(d.id) || !d.read);
    const dual = d.text ? REMO_TRANSLATOR.makeBilingualPair(d.text) : null;
    const isInlineAudio = d.voiceUrl && (String(d.voiceUrl).startsWith('data:') || String(d.voiceUrl).startsWith('http') || String(d.voiceUrl).startsWith('blob:'));
    const vUrl = isInlineAudio ? d.voiceUrl : (d.voiceUrl ? RemoMediaDB.resolveSyncOrPlaceholder(d.voiceUrl) : '');
    const vIdb = d.voiceUrl && String(d.voiceUrl).startsWith('idb://') ? `data-idb-src="${escapeHtmlStr(d.voiceUrl)}"` : '';
    const offerCity = d.cardOffer ? getCityById(d.cardOffer.cityId) : null;
    const msgTime = d.ts ? formatNotifTimeAgo(d.ts, lang) : '';

    return `
      <div class="dm-bubble ${isMine ? 'mine' : ''} ${isJustOpened ? 'just-arrived' : ''}">
        ${d.isDailyMatch ? `<div class="dm-match-badge">${t('match_dm_badge')}</div>` : ''}
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
          <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
            <b style="color:${isMine ? '#7dd3fc' : '#fbbf24'};font-size:0.8rem;">@${escapeHtmlStr(d.fromName || 'Citizen')}</b>
            ${isJustOpened ? `<span class="dm-new-msg-pill">${t('dm_new_badge')}</span>` : ''}
            ${msgTime ? `<span style="font-size:0.68rem;color:var(--muted);">${escapeHtmlStr(msgTime)}</span>` : ''}
          </div>
          ${isAdm ? `<button type="button" class="adm-pbtn danger" style="padding:2px 6px;" onclick="adminDeleteDmInline('${escapeJsSingleArg(d.id)}')">🗑️</button>` : ''}
        </div>
        ${d.text ? `<div style="margin-top:4px;font-size:0.88rem;color:#f8fafc;">${escapeHtmlStr(d.text)}</div>` : ''}
        ${autoTrans && dual ? `
          <div style="margin-top:4px;padding-top:4px;border-top:1px dashed rgba(255,255,255,0.12);font-size:0.74rem;color:#cbd5e1;">
            🇬🇧 ${escapeHtmlStr(dual.en)}<br>🇫🇷 ${escapeHtmlStr(dual.fr)}
          </div>
        ` : ''}
        ${vUrl || vIdb ? `<audio src="${sanitizeSafeMediaUrl(vUrl)}" ${vIdb} controls preload="auto" style="width:100%;height:32px;margin-top:6px;outline:none;border-radius:8px;"></audio>` : ''}

        ${d.envelopeCoins > 0 ? `
          <div class="dm-envelope-card">
            <div>
              <div style="font-weight:900;color:#fde047;font-size:0.84rem;">${d.isRoyalAdmin ? '👑 ROYAL FOUNDER ENVELOPE' : '🧧 REMO GIFT ENVELOPE'}</div>
              <div style="font-size:0.76rem;color:#fff;">+${d.envelopeCoins} 🪙 REMO Coins</div>
            </div>
            ${d.envelopeClaimed
              ? `<span style="font-size:0.76rem;font-weight:900;color:#86efac;">${t('dm_env_opened_lbl', { coins: d.envelopeCoins })}</span>`
              : `<button type="button" class="btn-cyber btn-gold" style="padding:6px 12px;font-size:0.76rem;" onclick="claimDmCoinEnvelope('${escapeJsSingleArg(d.id)}')">${t('dm_env_open_btn', { coins: d.envelopeCoins })}</button>`}
          </div>
        ` : ''}

        ${offerCity ? `
          <div class="dm-card-offer-box">
            <div>
              <div style="font-weight:900;color:#6ee7b7;font-size:0.83rem;">🎴 ${offerCity.flag} ${escapeHtmlStr(getCityName(offerCity, lang))} (${escapeHtmlStr(d.cardOffer.rarity || 'Mythic 4D')})</div>
              <div style="font-size:0.74rem;color:#e2e8f0;">${d.cardOffer.price > 0 ? `🪙 ${d.cardOffer.price} Coins` : '🎁 FREE GIFT'}</div>
            </div>
            ${d.cardOffer.accepted
              ? `<span style="font-size:0.76rem;font-weight:900;color:#a7f3d0;">${t('dm_trade_done_lbl')}</span>`
              : (!isMine
                  ? `<button type="button" class="btn-cyber" style="padding:6px 12px;font-size:0.76rem;" onclick="acceptDmCardTradeOffer('${escapeJsSingleArg(d.id)}')">${t('dm_trade_accept_btn', { price: d.cardOffer.price > 0 ? d.cardOffer.price + ' 🪙' : 'FREE' })}</button>`
                  : `<span style="font-size:0.73rem;color:#94a3b8;">⏳ Sent</span>`)}
          </div>
        ` : ''}
      </div>
    `;
  }).join('') || `<div style="text-align:center;color:var(--muted);padding:26px;">${lang === 'fr' ? `Démarrez votre conversation privée 1-à-1 avec @${escapeHtmlStr(partner.name)} !` : `Start your private 1-on-1 conversation with @${escapeHtmlStr(partner.name)}!`}</div>`;

  // Mark unread messages from this active partner as read ONLY when Messages view is actually open
  if (isMessagesViewActive) {
    let markedAny = false;
    allDms.forEach((d) => {
      if (d && d.fromUid === partner.uid && isDmAddressedToMe(d, me.uid, isAdmUser) && !d.read) {
        d.read = true;
        markedAny = true;
        REMO_STORE.syncDmToCloud(d);
      }
    });
    (REMO_STORE.state.notifications || []).forEach((n) => {
      if (n && n.fromUid === partner.uid && n.type === 'message' && !n.read && (n.toUid === me.uid || (isAdmUser && n.toUid === 'u_admin_founder'))) {
        n.read = true;
        markedAny = true;
        REMO_STORE.markNotifIdReadLocal(n.id);
        REMO_STORE.syncNotificationToCloud(n);
      }
    });
    if (markedAny) {
      REMO_STORE.save(false, 'dm_read');
      if (typeof updateUnreadBadges === 'function') updateUnreadBadges();
    }
  }

  RemoMediaDB.hydrateDom(box);
  box.scrollTop = box.scrollHeight;
  if (contactsBar) {
    const activeChip = contactsBar.querySelector('.dm-contact-chip.active');
    if (activeChip && typeof activeChip.scrollIntoView === 'function') {
      try { activeChip.scrollIntoView({ inline: 'nearest', block: 'nearest' }); } catch (e) {}
    }
  }
  if (typeof initDesktopHorizontalScrollRails === 'function') {
    setTimeout(initDesktopHorizontalScrollRails, 30);
  }
}

function sendDirectMessage() {
  if (REMO_STORE.isCurrentUserBanned()) {
    remoToast(t('auth_err_banned'));
    return;
  }
  const inp = document.getElementById('dmInputBox');
  if (!inp || !inp.value.trim()) return;
  const u = REMO_STORE.getCurrentUser() || REMO_STORE.ensureGuestOrCitizen('Citizen', '', 'montreal');
  const targetUid = activeDmPartnerUid || 'u_admin_founder';
  const txt = inp.value.trim();
  const newDm = {
    id: 'dm_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    fromUid: u.uid,
    fromName: u.name,
    fromCity: u.homeCity || '',
    toUid: targetUid,
    text: txt,
    read: false,
    ts: Date.now()
  };
  REMO_STORE.state.directMessages.push(newDm);
  inp.value = '';
  RemoAudio.play('click');
  if (typeof checkAndRewardMutualDailyMatch === 'function') {
    checkAndRewardMutualDailyMatch(u, targetUid, newDm);
  }
  REMO_STORE.save(true, 'dm');
  REMO_STORE.syncDmToCloud(newDm);
  renderDirectMessagesView();
  if (typeof updateUnreadBadges === 'function') updateUnreadBadges();
}

async function toggleDmVoiceNote() {
  const lang = REMO_I18N.getLang();
  const u = REMO_STORE.getCurrentUser() || REMO_STORE.ensureGuestOrCitizen('Citizen', '', 'montreal');
  const targetUid = activeDmPartnerUid || 'u_admin_founder';
  const btn = document.getElementById('btnDmVoiceRec');

  if (window._dmRec && window._dmRec.state === 'recording') {
    window._dmRec.stop();
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const chunks = [];
    window._dmRec = new MediaRecorder(stream);
    window._dmRec.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
    window._dmRec.onstop = async () => {
      stream.getTracks().forEach((tr) => tr.stop());
      if (btn) btn.textContent = t('dm_btn_voice');
      const audioBlob = new Blob(chunks, { type: chunks[0]?.type || 'audio/webm' });
      const sendVoiceDm = (audioDataUrl) => {
        const newDm = {
          id: 'dm_v_' + Date.now(),
          fromUid: u.uid,
          fromName: u.name,
          fromCity: u.homeCity || '',
          toUid: targetUid,
          text: lang === 'fr' ? '🎙️ Message vocal privé' : '🎙️ Private voice note',
          voiceUrl: audioDataUrl,
          read: false,
          ts: Date.now()
        };
        REMO_STORE.state.directMessages.push(newDm);
        if (typeof checkAndRewardMutualDailyMatch === 'function') {
          checkAndRewardMutualDailyMatch(u, targetUid, newDm);
        }
        REMO_STORE.save(true, 'dm_voice');
        REMO_STORE.syncDmToCloud(newDm);
        renderDirectMessagesView();
        if (typeof updateUnreadBadges === 'function') updateUnreadBadges();
      };

      if (window.FileReader) {
        const reader = new FileReader();
        reader.onloadend = () => {
          sendVoiceDm(reader.result);
        };
        reader.readAsDataURL(audioBlob);
      } else {
        const vKey = await RemoMediaDB.saveBlob(audioBlob, 'dm_voice');
        sendVoiceDm(vKey);
      }
    };
    window._dmRec.start();
    if (btn) btn.textContent = '⏹️ Stop (15s)';
    setTimeout(() => { if (window._dmRec && window._dmRec.state === 'recording') window._dmRec.stop(); }, 15000);
  } catch (e) {
    const newDm = {
      id: 'dm_v_' + Date.now(),
      fromUid: u.uid,
      fromName: u.name,
      fromCity: u.homeCity || '',
      toUid: targetUid,
      text: lang === 'fr' ? '🎙️ Onde vocale privée' : '🎙️ Private cyber voice note',
      voiceUrl: RemoAudio.createSynthVoiceWavDataUrl(2.2),
      read: false,
      ts: Date.now()
    };
    REMO_STORE.state.directMessages.push(newDm);
    RemoAudio.play('roger');
    REMO_STORE.save(true, 'dm_voice');
    REMO_STORE.syncDmToCloud(newDm);
    renderDirectMessagesView();
    if (typeof updateUnreadBadges === 'function') updateUnreadBadges();
  }
}

function sendDmCoinEnvelopePrompt(isRoyalAdmin = false) {
  const lang = REMO_I18N.getLang();
  const u = REMO_STORE.getCurrentUser() || REMO_STORE.ensureGuestOrCitizen('Citizen', '', 'montreal');
  if (isRoyalAdmin && !REMO_STORE.isAdminUnlocked()) return;

  const amt = Number(prompt(
    lang === 'fr'
      ? (isRoyalAdmin ? '👑 Combien de Pièces Royales (Trésor Admin) envoyer dans l’enveloppe ?' : '🧧 Combien de Pièces REMO mettre dans l’enveloppe cadeau ?')
      : (isRoyalAdmin ? '👑 How many Royal Treasury Coins to seal in this envelope?' : '🧧 How many REMO Coins to seal inside this Gift Envelope?'),
    isRoyalAdmin ? '250' : '50'
  ));
  if (!amt || amt <= 0) return;

  if (!isRoyalAdmin && !REMO_STORE.addCoins(u.uid, -amt, 5)) {
    remoToast(lang === 'fr' ? 'Solde insuffisant pour cette enveloppe !' : 'Not enough REMO Coins for this envelope!');
    return;
  }

  const newDm = {
    id: 'dm_env_' + Date.now(),
    fromUid: u.uid,
    fromName: u.name,
    fromCity: u.homeCity || '',
    toUid: activeDmPartnerUid || 'u_admin_founder',
    text: isRoyalAdmin
      ? (lang === 'fr' ? '👑 Cadeau Officiel du Fondateur REMO !' : '👑 Official REMO Founder Gift!')
      : (lang === 'fr' ? '🧧 Voici une enveloppe cadeau pour toi !' : '🧧 Sent you a Golden Coin Envelope!'),
    envelopeCoins: amt,
    envelopeClaimed: false,
    isRoyalAdmin: !!isRoyalAdmin,
    read: false,
    ts: Date.now()
  };
  REMO_STORE.state.directMessages.push(newDm);
  REMO_STORE.save(true, 'dm_envelope');
  REMO_STORE.syncDmToCloud(newDm);
  syncHeaderAndSidebars();
  renderDirectMessagesView();
  remoToast(lang === 'fr' ? `🧧 Enveloppe +${amt} 🪙 envoyée !` : `🧧 +${amt} 🪙 Envelope sent!`, 'coin');
}

function claimDmCoinEnvelope(msgId) {
  const lang = REMO_I18N.getLang();
  if (REMO_STORE.isCurrentUserBanned()) {
    remoToast(t('auth_err_banned'));
    return;
  }
  const d = (REMO_STORE.state.directMessages || []).find((x) => x.id === msgId);
  if (!d || d.envelopeClaimed || !d.envelopeCoins) return;
  const u = REMO_STORE.getCurrentUser() || REMO_STORE.ensureGuestOrCitizen('Citizen', '', 'montreal');
  d.envelopeClaimed = true;
  REMO_STORE.creditSystemCoins(u.uid, d.envelopeCoins, 'DM Coin Envelope', 10000);
  REMO_STORE.save(true, 'dm_env_claim');
  REMO_STORE.syncDmToCloud(d);
  spawnRemoCoinsFX(14);
  syncHeaderAndSidebars();
  renderDirectMessagesView();
  remoToast(lang === 'fr' ? `🧧 Enveloppe ouverte : +${d.envelopeCoins} 🪙 !` : `🧧 Envelope opened: +${d.envelopeCoins} 🪙!`, 'fanfare');
}

function sendDmCardTradePrompt() {
  const lang = REMO_I18N.getLang();
  const u = REMO_STORE.getCurrentUser() || REMO_STORE.ensureGuestOrCitizen('Citizen', '', 'montreal');
  let myCards = (REMO_STORE.state.mintedCards || []).filter((mc) => mc.ownerUid === u.uid);
  if (myCards.length === 0) {
    const starter = REMO_STORE.mintCardForUser(u.uid, u.homeCity || 'montreal', 'Mythic 4D', true);
    myCards = [starter];
  }
  const summary = myCards.slice(0, 6).map((c, idx) => `${idx + 1}. ${getCityName(getCityById(c.cityId), lang)} (${c.rarity})`).join('\n');
  const pickIdx = Number(prompt(
    lang === 'fr' ? `Choisissez le numéro de la Carte 4D à envoyer :\n${summary}` : `Pick the 4D City Card number to offer in chat:\n${summary}`,
    '1'
  )) - 1;
  const chosen = myCards[pickIdx];
  if (!chosen) return;

  const price = Math.max(0, Number(prompt(
    lang === 'fr' ? 'Prix demandé en Pièces REMO (0 = Cadeau Gratuit) :' : 'Asking price in REMO Coins (0 = Free Gift):',
    '0'
  )) || 0);

  const newDm = {
    id: 'dm_trd_' + Date.now(),
    fromUid: u.uid,
    fromName: u.name,
    fromCity: u.homeCity || '',
    toUid: activeDmPartnerUid || 'u_admin_founder',
    text: lang === 'fr' ? '🔄 Offre officielle de Carte 4D dans le chat :' : '🔄 Official 4D City Card offer in chat:',
    cardOffer: {
      cardId: chosen.id,
      cityId: chosen.cityId,
      rarity: chosen.rarity || 'Mythic 4D',
      price,
      accepted: false
    },
    read: false,
    ts: Date.now()
  };
  REMO_STORE.state.directMessages.push(newDm);
  REMO_STORE.save(true, 'dm_card_offer');
  REMO_STORE.syncDmToCloud(newDm);
  renderDirectMessagesView();
  remoToast(lang === 'fr' ? '🎴 Offre de Carte 4D envoyée dans le chat !' : '🎴 4D Card Offer sent in chat!', 'coin');
}

function acceptDmCardTradeOffer(msgId) {
  const lang = REMO_I18N.getLang();
  const d = (REMO_STORE.state.directMessages || []).find((x) => x.id === msgId);
  if (!d || !d.cardOffer || d.cardOffer.accepted) return;
  const buyer = REMO_STORE.getCurrentUser() || REMO_STORE.ensureGuestOrCitizen('Citizen', '', 'montreal');
  const price = Number(d.cardOffer.price || 0);

  if (price > 0) {
    if (!REMO_STORE.addCoins(buyer.uid, -price, 10)) {
      remoToast(lang === 'fr' ? `Il vous faut ${price} 🪙 pour accepter cette carte !` : `Need ${price} 🪙 to accept this card!`);
      return;
    }
    if (d.fromUid) REMO_STORE.creditSystemCoins(d.fromUid, price, '4D Card Trade Sale', 50000);
  }

  const card = (REMO_STORE.state.mintedCards || []).find((mc) => mc.id === d.cardOffer.cardId);
  if (card) {
    card.ownerUid = buyer.uid;
  } else {
    REMO_STORE.mintCardForUser(buyer.uid, d.cardOffer.cityId, d.cardOffer.rarity || 'Mythic 4D', true);
  }
  d.cardOffer.accepted = true;
  REMO_STORE.save(true, 'dm_card_accepted');
  REMO_STORE.syncDmToCloud(d);
  spawnRemoCoinsFX(12);
  syncHeaderAndSidebars();
  renderDirectMessagesView();
  remoToast(lang === 'fr' ? '🤝 Carte 4D transférée dans votre collection !' : '🤝 4D Card transferred to your collection!', 'fanfare');
}

function adminDeleteDmInline(msgId) {
  if (!confirm('Supprimer ce message privé ?')) return;
  REMO_STORE.state.directMessages = (REMO_STORE.state.directMessages || []).filter((d) => d.id !== msgId);
  REMO_STORE.save(true, 'dm_del');
  if (REMO_STORE.fbDb) {
    REMO_STORE.fbDb.collection('remo_direct_messages').doc(msgId).delete().catch(() => {});
  }
  renderDirectMessagesView();
  renderDirectMessagesView();
}

async function startWebRTCCall(withVideo = false) {
  // Voice & Video Call feature cleanly deactivated as requested
  remoToast(REMO_I18N.getLang() === 'fr' ? '💬 Messagerie privée instantanée 1-à-1 active !' : '💬 Instant 1-on-1 private messaging active!');
}

function endWebRTCCall() {
  if (localCallStream) {
    try { localCallStream.getTracks().forEach((t) => t.stop()); } catch (e) {}
    localCallStream = null;
  }
  if (rtcPeer) {
    try { rtcPeer.close(); } catch (e) {}
    rtcPeer = null;
  }
  document.getElementById('webrtcCallModal')?.classList.remove('open');
}

function openLiveStreamModal() {
  if (typeof toggleRemoRadio === 'function') {
    toggleRemoRadio();
  } else {
    remoToast(REMO_I18N.getLang() === 'fr' ? '📻 Fréquences Radio Monde activées !' : '📻 World Radio Frequencies activated!');
  }
}

/* ── 6. UNIVERSAL AUTH MODAL (WITH TIKTOK / IG / FB BROWSER DETECTOR) ── */
let isRegisterMode = true;

function setAuthModalMode(isReg = true) {
  isRegisterMode = Boolean(isReg);
  const regBtn = document.getElementById('authTabRegisterBtn');
  const logBtn = document.getElementById('authTabLoginBtn');
  const cityWrap = document.getElementById('authCityFieldWrap');
  const nameWrap = document.getElementById('authNameFieldWrap');
  const nameInp = document.getElementById('authNameInp');
  const termsWrap = document.getElementById('authTermsFieldWrap');
  const termsChk = document.getElementById('authTermsCheck');
  const passInp = document.getElementById('authPassInp');
  const submitBtn = document.getElementById('authSubmitBtn');

  if (regBtn) {
    regBtn.classList.toggle('btn-cyber', isRegisterMode);
    regBtn.classList.toggle('btn-gold', isRegisterMode);
    regBtn.classList.toggle('btn-ghost', !isRegisterMode);
  }
  if (logBtn) {
    logBtn.classList.toggle('btn-cyber', !isRegisterMode);
    logBtn.classList.toggle('btn-gold', !isRegisterMode);
    logBtn.classList.toggle('btn-ghost', isRegisterMode);
  }
  if (cityWrap) cityWrap.style.display = isRegisterMode ? 'block' : 'none';
  if (nameWrap) nameWrap.style.display = isRegisterMode ? 'block' : 'none';
  if (nameInp) nameInp.required = isRegisterMode;
  if (termsWrap) termsWrap.style.display = isRegisterMode ? 'flex' : 'none';
  if (termsChk) termsChk.required = isRegisterMode;
  if (passInp) {
    passInp.setAttribute('autocomplete', isRegisterMode ? 'new-password' : 'current-password');
    passInp.minLength = isRegisterMode ? 8 : 6;
  }
  if (submitBtn) {
    submitBtn.setAttribute('data-i18n', isRegisterMode ? 'auth_submit_register' : 'auth_submit_login');
    submitBtn.textContent = t(isRegisterMode ? 'auth_submit_register' : 'auth_submit_login');
  }
}
window.setAuthModalMode = setAuthModalMode;

function openAuthModal(defaultRegister = true) {
  const sel = document.getElementById('authHomeCitySelect');
  const lang = REMO_I18N.getLang();
  if (sel) {
    sel.innerHTML = getRemoCities().map((c) =>
      `<option value="${c.id}">${c.flag} ${escapeHtmlStr(getCityName(c, lang))}</option>`
    ).join('');
  }
  const iabWarn = document.getElementById('authIabWarningBox');
  if (iabWarn) iabWarn.style.display = REMO_STORE.isInAppBrowser() ? 'block' : 'none';
  const curFb = REMO_STORE.fbAuth && REMO_STORE.fbAuth.currentUser;
  const isWaitingVerify = Boolean(curFb && !REMO_STORE._isFbUserVerified(curFb));
  if (!isWaitingVerify) {
    const regForm = document.getElementById('authRegisterForm');
    const otpBox = document.getElementById('authOtpBox');
    if (regForm) regForm.style.display = 'block';
    if (otpBox) otpBox.style.display = 'none';
  }
  setAuthModalMode(defaultRegister !== false);
  document.getElementById('authModal')?.classList.add('open');
}

async function sendAuthPasswordReset() {
  const email = (document.getElementById('authEmailInp')?.value || '').trim();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    remoToast(t('auth_err_email_invalid'));
    document.getElementById('authEmailInp')?.focus();
    return;
  }
  if (!REMO_STORE.fbAuth && typeof REMO_STORE.initFirebaseIfConfigured === 'function') {
    REMO_STORE.initFirebaseIfConfigured();
  }
  if (!REMO_STORE.fbAuth) {
    remoToast('Firebase Auth loading...');
    return;
  }
  try {
    await REMO_STORE.fbAuth.sendPasswordResetEmail(email);
    remoToast(t('auth_reset_sent'), 'fanfare');
  } catch (err) {
    remoToast(err && err.message ? err.message : t('auth_err_email_invalid'));
  }
}
window.sendAuthPasswordReset = sendAuthPasswordReset;

function openInExternalBrowser() {
  const url = window.location.href;
  if (/Android/i.test(navigator.userAgent)) {
    window.location.href = `intent://${url.replace(/^https?:\/\//, '')}#Intent;scheme=https;package=com.android.chrome;end`;
  } else {
    navigator.clipboard?.writeText(url);
    remoToast(REMO_I18N.getLang() === 'fr' ? 'Lien copié — collez-le dans Safari/Chrome !' : 'Link copied — paste in Safari/Chrome!');
  }
}

function isDisposableEmail(email) {
  if (!email || !email.includes('@')) return true;
  const domain = email.split('@')[1].toLowerCase().trim();
  const disposableDomains = new Set([
    'mailinator.com', 'temp-mail.org', 'tempmail.com', '10minutemail.com',
    'guerrillamail.com', 'yopmail.com', 'trashmail.com', 'fake.com',
    'test.com', 'fakemail.com', 'throwawaymail.com', 'sharklasers.com',
    'getairmail.com', 'dispostable.com', 'mytemp.email', 'crazymailing.com',
    'inboxkitten.com', 'tempail.com', 'mohmal.com', 'emailondeck.com',
    'disposable.com', 'burnermail.io', 'generator.email'
  ]);
  return disposableDomains.has(domain);
}
window.isDisposableEmail = isDisposableEmail;

async function submitUniversalAuth(ev) {
  if (ev) ev.preventDefault();
  const lang = REMO_I18N.getLang();
  const rawName = (document.getElementById('authNameInp')?.value || '').trim();
  const name = isRegisterMode ? (rawName || 'Citizen') : rawName;
  const email = (document.getElementById('authEmailInp')?.value || '').trim();
  const password = document.getElementById('authPassInp')?.value || '';
  const cityId = document.getElementById('authHomeCitySelect')?.value || 'montreal';
  const termsChecked = document.getElementById('authTermsCheck')?.checked;

  if (isRegisterMode && !termsChecked) {
    remoToast(t('auth_err_terms'));
    return;
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    remoToast(t('auth_err_email_invalid'));
    return;
  }

  if (isRegisterMode && isDisposableEmail(email)) {
    remoToast(t('auth_err_disposable_email'));
    return;
  }

  const minLen = isRegisterMode ? 8 : 6;
  if (!password || password.length < minLen) {
    remoToast(t('auth_err_password_short'));
    document.getElementById('authPassInp')?.focus();
    return;
  }

  if (!REMO_STORE.fbAuth && typeof REMO_STORE.initFirebaseIfConfigured === 'function') {
    REMO_STORE.initFirebaseIfConfigured();
  }

  if (!REMO_STORE.fbAuth) {
    remoToast(lang === 'fr' ? '⏳ Connexion au serveur Firebase en cours, veuillez réessayer...' : '⏳ Connecting to Firebase Auth server, please retry...');
    return;
  }

  const adminEmail = (REMO_STORE.state?.settings?.adminEmail || REMO_STORE.ADMIN_EMAIL || 'andart1174@gmail.com').toLowerCase().trim();
  const isTargetingAdmin = email.toLowerCase().trim() === adminEmail;

  const pendingData = {
    name,
    email,
    cityId,
    expiresAt: Date.now() + 30 * 60 * 1000,
    isTargetingAdmin
  };
  try {
    sessionStorage.setItem('remo_pending_signup', JSON.stringify(pendingData));
    localStorage.setItem('remo_pending_signup', JSON.stringify(pendingData));
  } catch (e) {}

  let fbUser = null;

  const formatAuthError = (err) => {
    const code = err && err.code ? err.code : '';
    if (code === 'auth/user-not-found') {
      return lang === 'fr'
        ? '❌ Aucun compte trouvé pour cet email. Cliquez sur « Créer mon Compte Citoyen » ou « Continuer avec Google ».'
        : '❌ No account found for this email. Click "Create Citizen Account" or "Continue with Google".';
    }
    if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/invalid-login-credentials') {
      return lang === 'fr'
        ? '❌ Mot de passe incorrect — ou ce compte Gmail utilise « Continuer avec Google ». Utilisez Google ou « Mot de passe oublié » pour définir un mot de passe.'
        : '❌ Incorrect password — or this Gmail uses "Continue with Google". Use Google above or "Forgot or Set Password?" below.';
    }
    if (code === 'auth/too-many-requests') {
      return lang === 'fr' ? '⏳ Trop de tentatives. Réessayez dans quelques minutes ou utilisez Google.' : '⏳ Too many attempts. Wait a moment or use Google.';
    }
    return (err && err.message) || (lang === 'fr' ? 'Email ou mot de passe incorrect.' : 'Invalid email or password.');
  };

  if (isTargetingAdmin || !isRegisterMode) {
    try {
      const signInCred = await REMO_STORE.fbAuth.signInWithEmailAndPassword(email, password);
      fbUser = signInCred && signInCred.user;
    } catch (signInErr) {
      if (isTargetingAdmin) {
        remoToast(
          lang === 'fr'
            ? '🔐 Compte Admin : connectez-vous via Google ou utilisez « Mot de passe oublié » pour définir votre mot de passe Firebase.'
            : '🔐 Admin Account: sign in with Google or use "Forgot / Set Password" to set your Firebase password.',
          6000
        );
      } else {
        remoToast(formatAuthError(signInErr), 6500);
      }
      return;
    }
  } else {
    try {
      const cred = await REMO_STORE.fbAuth.createUserWithEmailAndPassword(email, password);
      fbUser = cred && cred.user;
      if (fbUser && name) {
        try { await fbUser.updateProfile({ displayName: name }); } catch (e) {}
      }
    } catch (err) {
      if (err && (err.code === 'auth/email-already-in-use' || String(err.message || '').includes('already-in-use'))) {
        try {
          const signInCred = await REMO_STORE.fbAuth.signInWithEmailAndPassword(email, password);
          fbUser = signInCred && signInCred.user;
        } catch (signInErr) {
          remoToast(
            lang === 'fr'
              ? '⚠️ Cet email existe déjà (ou utilise « Continuer avec Google »). Utilisez « Connexion », « Continuer avec Google » ou « Mot de passe oublié ».'
              : '⚠️ Email already registered (or uses "Continue with Google"). Use Sign In with its password, Google above, or "Forgot / Set Password?".',
            7000
          );
          return;
        }
      } else {
        remoToast(err.message || t('auth_err_email_invalid'));
        return;
      }
    }
  }

  if (!fbUser) return;

  try {
    await fbUser.reload();
    fbUser = REMO_STORE.fbAuth.currentUser || fbUser;
  } catch (e) {}

  if (fbUser.emailVerified) {
    completeVerifiedEmailLogin(fbUser, pendingData);
    return;
  }

  let sendErr = null;
  try {
    await fbUser.sendEmailVerification({ url: window.location.origin + '/' });
  } catch (e) {
    try {
      await fbUser.sendEmailVerification();
    } catch (e2) {
      sendErr = e2;
      console.warn('sendEmailVerification notice:', e2.code || e2.message);
    }
  }

  window._lastVerifyEmailSentTs = sendErr ? 0 : Date.now();
  const regForm = document.getElementById('authRegisterForm');
  const otpBox = document.getElementById('authOtpBox');
  const emailDisplay = document.getElementById('authOtpEmailDisplay');
  const sendWarnEl = document.getElementById('authOtpSendWarn');
  if (regForm) regForm.style.display = 'none';
  if (otpBox) otpBox.style.display = 'block';
  if (emailDisplay) emailDisplay.textContent = email;

  if (sendErr) {
    const errLabel = sendErr.code || sendErr.message || 'blocked';
    if (sendWarnEl) {
      sendWarnEl.style.display = 'block';
      sendWarnEl.textContent = t('auth_verify_send_err', { err: errLabel });
    }
    remoToast(t('auth_verify_send_err', { err: errLabel }), 8000);
    return;
  }
  if (sendWarnEl) {
    sendWarnEl.style.display = 'none';
    sendWarnEl.textContent = '';
  }

  remoToast(
    lang === 'fr'
      ? `📧 Email officiel de confirmation envoyé à ${email} ! Ouvrez votre boîte mail (ou vos Spams) et cliquez sur le lien.`
      : `📧 Official verification email sent to ${email}! Open your inbox (or Spam folder) and click the link.`,
    8000
  );

  startEmailVerificationWatcher();
}

function startEmailVerificationWatcher() {
  if (window._remoEmailVerifyTimer) {
    clearInterval(window._remoEmailVerifyTimer);
  }
  window._remoEmailVerifyTimer = setInterval(async () => {
    const otpBox = document.getElementById('authOtpBox');
    if (!otpBox || otpBox.style.display === 'none') {
      clearInterval(window._remoEmailVerifyTimer);
      window._remoEmailVerifyTimer = null;
      return;
    }
    const curFb = REMO_STORE.fbAuth && REMO_STORE.fbAuth.currentUser;
    if (!curFb) return;
    try {
      await curFb.reload();
      const refreshed = REMO_STORE.fbAuth.currentUser;
      if (refreshed && refreshed.emailVerified) {
        clearInterval(window._remoEmailVerifyTimer);
        window._remoEmailVerifyTimer = null;
        verifyAuthOtpCode();
      }
    } catch (e) {}
  }, 3000);
}

function completeVerifiedEmailLogin(fbUser, pending) {
  const lang = REMO_I18N.getLang();
  const fbEmail = REMO_STORE._getFbEmail ? REMO_STORE._getFbEmail(fbUser) : (fbUser.email || '');
  const existing = (REMO_STORE.state.users || []).find((x) =>
    x && (x.uid === ('u_fb_' + fbUser.uid) || x.uid === fbUser.uid || x.fbUid === fbUser.uid || (x.email && fbEmail && x.email.toLowerCase().trim() === fbEmail.toLowerCase().trim()))
  );
  if (existing && existing.banned) {
    try { REMO_STORE.fbAuth && REMO_STORE.fbAuth.signOut(); } catch (e) {}
    REMO_STORE.signOut();
    remoToast(t('auth_err_banned'));
    return;
  }

  const adminEmail = (REMO_STORE.state?.settings?.adminEmail || REMO_STORE.ADMIN_EMAIL || 'andart1174@gmail.com').toLowerCase().trim();
  const isAdminVerified = Boolean(fbUser.emailVerified && fbEmail.toLowerCase().trim() === adminEmail);

  const chosenName = (pending && pending.name && pending.name !== 'REMO Pioneer')
    ? pending.name
    : (fbUser.displayName || (isAdminVerified ? 'REMO Founder' : 'Citizen'));

  const u = REMO_STORE.ensureGuestOrCitizen(
    chosenName,
    (pending && pending.email) || fbEmail,
    (pending && pending.cityId) || 'montreal',
    isAdminVerified,
    fbUser.uid
  );
  if (u) {
    u.termsAcceptedAt = Date.now();
    u.termsVersion = '1.0';
    u.emailVerified = true;
    u.fbUid = fbUser.uid;
    if (fbEmail && !u.email) u.email = fbEmail;
    REMO_STORE.save(true, 'user_registered_verified');
  }
  if (isAdminVerified) {
    REMO_STORE.setAdminUnlocked(true);
  } else {
    REMO_STORE.setAdminUnlocked(false);
  }
  if (typeof REMO_STORE.refreshPrivateCloudListeners === 'function') {
    REMO_STORE.refreshPrivateCloudListeners();
  }

  try {
    sessionStorage.removeItem('remo_pending_signup');
    localStorage.removeItem('remo_pending_signup');
  } catch (e) {}

  if (window._remoEmailVerifyTimer) {
    clearInterval(window._remoEmailVerifyTimer);
    window._remoEmailVerifyTimer = null;
  }

  cancelAuthOtpStep(true);
  document.getElementById('authModal')?.classList.remove('open');
  spawnRemoCoinsFX(15);
  syncHeaderAndSidebars();
  renderSocialFeed();
  if (typeof renderPassportView === 'function') renderPassportView();
  remoToast(
    isAdminVerified
      ? (lang === 'fr' ? '👑 Session Fondateur Admin activée !' : '👑 Founder Admin session active!')
      : (lang === 'fr'
        ? `🎉 Compte connecté avec succès ! Bienvenue ${u ? u.name : ''} (Passeport #${u ? u.passportNum : '0001'}) !`
        : `🎉 Signed in successfully! Welcome ${u ? u.name : ''} (Passport #${u ? u.passportNum : '0001'})!`),
    'fanfare'
  );
}

async function verifyAuthOtpCode() {
  let pending = null;
  try {
    const raw = sessionStorage.getItem('remo_pending_signup') || localStorage.getItem('remo_pending_signup');
    if (raw) pending = JSON.parse(raw);
  } catch (e) {}

  const curFb = REMO_STORE.fbAuth && REMO_STORE.fbAuth.currentUser;
  if (!curFb) {
    remoToast(t('auth_err_otp_invalid'));
    return;
  }

  try {
    await curFb.reload();
  } catch (e) {}

  const refreshed = REMO_STORE.fbAuth.currentUser || curFb;
  if (!refreshed.emailVerified) {
    remoToast(t('auth_err_otp_invalid'));
    return;
  }

  completeVerifiedEmailLogin(refreshed, pending);
}
window.verifyAuthOtpCode = verifyAuthOtpCode;

async function resendAuthOtpCode() {
  const lang = REMO_I18N.getLang();
  const curFb = REMO_STORE.fbAuth && REMO_STORE.fbAuth.currentUser;
  if (!curFb) return;
  const elapsed = Date.now() - Number(window._lastVerifyEmailSentTs || 0);
  if (elapsed < 60000) {
    const waitSec = Math.max(1, Math.ceil((60000 - elapsed) / 1000));
    remoToast(lang === 'fr'
      ? `⏳ Patientez encore ${waitSec}s avant de renvoyer l’email (ou utilisez Continuer avec Google).`
      : `⏳ Please wait ${waitSec}s before resending (or click Continue with Google).`);
    return;
  }

  let resendErr = null;
  try {
    await curFb.sendEmailVerification({ url: window.location.origin + '/' });
  } catch (e) {
    try {
      await curFb.sendEmailVerification();
    } catch (err) {
      resendErr = err;
    }
  }

  const sendWarnEl = document.getElementById('authOtpSendWarn');
  if (resendErr) {
    const errCode = (resendErr && resendErr.code) || '';
    const errMsg = errCode === 'auth/too-many-requests'
      ? (lang === 'fr'
        ? '⏳ Limite atteinte : attendez 2-3 minutes ou utilisez « Continuer avec Google » ci-dessous.'
        : '⏳ Rate limit reached: wait 2-3 minutes or click "Continue with Google" below.')
      : t('auth_verify_send_err', { err: errCode || resendErr.message || 'error' });
    if (sendWarnEl) {
      sendWarnEl.style.display = 'block';
      sendWarnEl.textContent = errMsg;
    }
    remoToast(errMsg, 7500);
    return;
  }

  window._lastVerifyEmailSentTs = Date.now();
  if (sendWarnEl) {
    sendWarnEl.style.display = 'none';
    sendWarnEl.textContent = '';
  }

  remoToast(
    lang === 'fr'
      ? `📧 Nouvel email de vérification envoyé à ${curFb.email} ! Vérifiez aussi vos Spams.`
      : `📧 New verification email sent to ${curFb.email}! Please check your Spam folder too.`,
    8000
  );
}
window.resendAuthOtpCode = resendAuthOtpCode;

function cancelAuthOtpStep(keepSession = false) {
  if (window._remoEmailVerifyTimer) {
    clearInterval(window._remoEmailVerifyTimer);
    window._remoEmailVerifyTimer = null;
  }
  if (!keepSession && REMO_STORE.fbAuth && REMO_STORE.fbAuth.currentUser && !REMO_STORE.fbAuth.currentUser.emailVerified) {
    try { REMO_STORE.fbAuth.signOut(); } catch (e) {}
  }
  const regForm = document.getElementById('authRegisterForm');
  const otpBox = document.getElementById('authOtpBox');
  if (regForm) regForm.style.display = 'block';
  if (otpBox) otpBox.style.display = 'none';
}
window.cancelAuthOtpStep = cancelAuthOtpStep;

function userSelfDeleteAccountAction() {
  const lang = REMO_I18N.getLang();
  const u = REMO_STORE.getCurrentUser();
  if (!u) return;
  if (u.role === 'admin' || u.uid === 'u_admin_founder') {
    remoToast(lang === 'fr' ? '⚠️ Le compte Fondateur Principal ne peut pas être supprimé !' : '⚠️ Master Founder account cannot be deleted!');
    return;
  }
  const msg = lang === 'fr'
    ? 'Êtes-vous certain de vouloir supprimer DÉFINITIVEMENT votre compte, vos publications, cartes et toutes vos données personnelles ? Cette action est irréversible.'
    : 'Are you sure you want to PERMANENTLY delete your account, posts, cards, and all personal data? This action is irreversible.';
  if (!confirm(msg)) return;
  REMO_STORE.deleteMyAccount(u.uid);
  syncHeaderAndSidebars();
  switchRemoView('feed');
  renderSocialFeed();
  remoToast(lang === 'fr' ? '🗑️ Votre compte et vos données ont été définitivement supprimés.' : '🗑️ Your account and data have been permanently deleted.');
}
window.userSelfDeleteAccountAction = userSelfDeleteAccountAction;

function quickGoogleSignInSim() {
  const lang = REMO_I18N.getLang();

  // 1. Ensure Firebase SDK is initialized
  if (!REMO_STORE.fbAuth && typeof firebase !== 'undefined') {
    REMO_STORE.initFirebaseIfConfigured();
  }

  // 2. Real Google Sign-In with Firebase Auth
  if (REMO_STORE.fbAuth && typeof firebase !== 'undefined') {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');
    provider.setCustomParameters({ prompt: 'select_account' });
    const cityId = document.getElementById('authHomeCitySelect')?.value || 'montreal';
    try {
      sessionStorage.setItem('remo_pending_google', JSON.stringify({ cityId, ts: Date.now() }));
      localStorage.setItem('remo_pending_google', JSON.stringify({ cityId, ts: Date.now() }));
    } catch (e) {}

    REMO_STORE.fbAuth.signInWithPopup(provider).then((res) => {
      const fbU = res && res.user;
      if (!fbU) return;
      const fbEmail = REMO_STORE._getFbEmail ? REMO_STORE._getFbEmail(fbU) : (fbU.email || '');
      const existing = (REMO_STORE.state.users || []).find((x) =>
        x && (x.uid === ('u_fb_' + fbU.uid) || x.uid === fbU.uid || x.fbUid === fbU.uid || (x.email && fbEmail && x.email.toLowerCase().trim() === fbEmail.toLowerCase().trim()))
      );
      if (existing && existing.banned) {
        try { REMO_STORE.fbAuth.signOut(); } catch (e) {}
        REMO_STORE.signOut();
        remoToast(t('auth_err_banned'));
        return;
      }

      const adminEmail = (REMO_STORE.state?.settings?.adminEmail || REMO_STORE.ADMIN_EMAIL || 'andart1174@gmail.com').toLowerCase().trim();
      const isAdminEmail = Boolean(fbU.emailVerified && fbEmail.toLowerCase().trim() === adminEmail);

      try {
        sessionStorage.removeItem('remo_pending_signup');
        localStorage.removeItem('remo_pending_signup');
        sessionStorage.removeItem('remo_pending_google');
        localStorage.removeItem('remo_pending_google');
      } catch (e) {}

      if (isAdminEmail) {
        REMO_STORE.setAdminUnlocked(true);
      } else {
        REMO_STORE.setAdminUnlocked(false);
      }

      const u = REMO_STORE.ensureGuestOrCitizen(
        fbU.displayName || (isAdminEmail ? 'REMO Founder' : 'Citizen'),
        fbEmail,
        cityId,
        isAdminEmail,
        fbU.uid
      );
      if (u) {
        u.emailVerified = true;
        u.fbUid = fbU.uid;
        if (fbEmail && !u.email) u.email = fbEmail;
        REMO_STORE.save(true, 'auth_google');
      }
      if (typeof REMO_STORE.refreshPrivateCloudListeners === 'function') {
        REMO_STORE.refreshPrivateCloudListeners();
      }
      cancelAuthOtpStep(true);
      document.getElementById('authModal')?.classList.remove('open');
      syncHeaderAndSidebars();
      renderSocialFeed();
      if (typeof renderPassportView === 'function') renderPassportView();
      if (document.getElementById('adminQuickModal')?.classList.contains('open') && typeof openAdminQuickModal === 'function') {
        openAdminQuickModal();
      }
      remoToast(
        isAdminEmail
          ? (lang === 'fr' ? '👑 Session Fondateur Admin activée !' : '👑 Founder Admin session active!')
          : (lang === 'fr' ? `🎉 Bienvenue ${u.name} !` : `🎉 Welcome ${u.name}!`),
        'fanfare'
      );
    }).catch((err) => {
      console.warn('Firebase Google Sign-In error:', err);
      if (err && (err.code === 'auth/popup-blocked' || err.code === 'auth/operation-not-supported-in-this-environment')) {
        REMO_STORE.fbAuth.signInWithRedirect(provider).catch((e) => remoToast(e.message));
        return;
      }
      if (err && err.code === 'auth/popup-closed-by-user') {
        remoToast(lang === 'fr' ? 'Fenêtre Google fermée avant la fin. Cliquez à nouveau sur Google pour vous connecter.' : 'Google popup closed before finishing. Click Google again to sign in.');
        return;
      }
      remoToast('Google Sign-In: ' + ((err && (err.message || err.code)) || 'Error'));
    });
    return;
  }

  remoToast(lang === 'fr' ? 'Initialisation de Firebase en cours... Veuillez réessayer dans quelques secondes.' : 'Firebase initializing... Please retry in a few seconds.');
}

async function userSignOutAction(reopenAuthModal = false) {
  const lang = REMO_I18N.getLang();
  cancelAuthOtpStep(true);
  await REMO_STORE.signOut();
  localStorage.removeItem(REMO_STORE.USER_KEY);
  localStorage.removeItem(REMO_STORE.ADMIN_MODE_KEY);
  sessionStorage.removeItem('remo_admin_unlocked');
  if (typeof firebase !== 'undefined' && firebase.auth) {
    try { await firebase.auth().signOut(); } catch (e) {}
  }
  syncHeaderAndSidebars();
  if (typeof renderPassportView === 'function') renderPassportView();
  renderSocialFeed();
  if (reopenAuthModal) {
    openAuthModal(false);
  } else {
    switchRemoView('feed');
    remoToast(lang === 'fr' ? '🚪 Déconnecté avec succès. Vous pouvez maintenant vous reconnecter.' : '🚪 Signed out successfully. You can now sign in again.');
  }
}
window.updateAuthHeaderUI = syncHeaderAndSidebars;

function toggleHeaderRadio() {
  if (typeof window.openFocusTvModal === 'function') {
    window.openFocusTvModal();
    return;
  }
  if (typeof window.openRemoRadioModal === 'function') {
    window.openRemoRadioModal();
    return;
  }
  const active = RemoAudio.toggleCyberLofiRadio();
  const btn = document.getElementById('btnRadioToggle');
  if (btn) btn.style.borderColor = active ? '#10b981' : '';
  remoToast(
    active
      ? (REMO_I18N.getLang() === 'fr' ? '📻 Radio Cyber-Lofi 24/7 activée !' : '📻 REMO Cyber-Lofi 24/7 Radio ON!')
      : (REMO_I18N.getLang() === 'fr' ? '📻 Radio en pause' : '📻 Radio paused')
  );
}

/* ── DESKTOP HORIZONTAL SCROLL ENGINE (Wheel Scroll & Smooth Drag Rail) ── */
function makeHorizontalScrollable(el) {
  if (!el || el._hScrollAttached) return;
  if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(pointer: coarse)').matches) return;
  el._hScrollAttached = true;

  // 1. Mouse wheel horizontal scrolling (translates normal vertical mouse wheel to smooth horizontal scroll)
  el.addEventListener('wheel', (e) => {
    if (el.scrollWidth > el.clientWidth) {
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (delta !== 0) {
        e.preventDefault();
        el.scrollLeft += delta * 1.15;
      }
    }
  }, { passive: false });

  // 2. Mouse Drag-to-Scroll: allows clicking & dragging horizontally on PC,
  // while preserving native button clicks if user clicks without dragging (< 15px movement).
  let isDown = false;
  let startX = 0;
  let scrollStart = 0;
  let hasDragged = false;

  const onMouseMove = (e) => {
    if (!isDown) return;
    const diff = e.pageX - startX;
    if (Math.abs(diff) > 15) {
      hasDragged = true;
      el.scrollLeft = scrollStart - diff;
    }
  };

  const onMouseUp = () => {
    if (!isDown) return;
    isDown = false;
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);

    if (hasDragged) {
      const suppressClick = (ev) => {
        ev.stopPropagation();
        ev.preventDefault();
      };
      el.addEventListener('click', suppressClick, { capture: true, once: true });
      setTimeout(() => el.removeEventListener('click', suppressClick, { capture: true }), 100);
      hasDragged = false;
    }
  };

  el.addEventListener('mousedown', (e) => {
    if (e.button !== 0 || el.scrollWidth <= el.clientWidth) return;
    isDown = true;
    hasDragged = false;
    startX = e.pageX;
    scrollStart = el.scrollLeft;
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  });
}

function initDesktopHorizontalScrollRails() {
  const selectors = [
    '.header-right',
    '.clean-feed-toolbar',
    '#worldWeatherTickerBar',
    '#feedModeChips',
    '#feedVibeChips',
    '#storiesBarEl',
    '#dmContactsBar',
    '#radarTeleportBar',
    '#shopCategoryChips',
    '.filter-row',
    '.weather-ticker-bar',
    '.dm-contacts-strip',
    '.stories-bar',
    '.city-teleport-bar'
  ];
  selectors.forEach((sel) => {
    document.querySelectorAll(sel).forEach((el) => makeHorizontalScrollable(el));
  });
}
window.initDesktopHorizontalScrollRails = initDesktopHorizontalScrollRails;

function updateVersusCountdownsUI() {
  const lang = (typeof REMO_I18N !== 'undefined' && REMO_I18N.getLang) ? REMO_I18N.getLang() : 'en';
  const now = Date.now();
  let hasExpiredNeedingRender = false;

  document.querySelectorAll('.versus-timer-tag[data-ends]').forEach((el) => {
    const endsAt = Number(el.getAttribute('data-ends') || 0);
    const postId = el.getAttribute('data-versus-timer');
    if (!endsAt) return;
    const diff = endsAt - now;
    if (diff <= 0) {
      el.textContent = t('versus_ended_badge');
      el.style.borderColor = '#fbbf24';
      el.style.color = '#fbbf24';
      if (postId) {
        const p = (REMO_STORE.state.posts || []).find((x) => x && x.id === postId);
        if (p && p.versus && !p.versus.closed) {
          p.versus.closed = true;
          hasExpiredNeedingRender = true;
        }
      }
    } else {
      el.textContent = t('versus_time_left', { time: formatVersusCountdown(diff, lang) });
    }
  });

  if (hasExpiredNeedingRender) {
    renderSocialFeed();
  }
}
window.updateVersusCountdownsUI = updateVersusCountdownsUI;

/* ── 7. BOOTSTRAP & LIVE REAL-TIME LISTENERS ── */
document.addEventListener('DOMContentLoaded', () => {
  REMO_I18N.applyDOM();
  syncHeaderAndSidebars();
  renderSocialFeed();
  updateFlashDropCountdownUI();
  setInterval(updateFlashDropCountdownUI, 1000);
  updateVersusCountdownsUI();
  setInterval(updateVersusCountdownsUI, 10000);
  initDesktopHorizontalScrollRails();
  setTimeout(initDesktopHorizontalScrollRails, 300);
  setTimeout(initDesktopHorizontalScrollRails, 1200);


  // Check URL parameters (?view=arena, ?city=chisinau, ?lang=fr, ?open=radio|beatpad|boardingpass|guess, ?verify=..., ?post=...)
  const params = new URLSearchParams(window.location.search);
  const urlLang = (params.get('lang') || '').toLowerCase();
  if ((urlLang === 'en' || urlLang === 'fr') && typeof REMO_I18N !== 'undefined' && REMO_I18N.getLang() !== urlLang) {
    REMO_I18N.setLang(urlLang);
  }
  const targetPost = params.get('post') || (window.location.hash ? window.location.hash.replace('#post_', '').replace('#', '') : null);
  const urlToParam = (params.get('to') || '').replace(/[\r\n<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 32);
  if (targetPost) {
    window._deepLinkedPostId = targetPost;
    if (urlToParam) {
      window._deepLinkedRecipientByPost = window._deepLinkedRecipientByPost || {};
      window._deepLinkedRecipientByPost[targetPost] = urlToParam;
    }
    currentFeedMode = 'all';
    currentFeedCityFilter = 'all';
    renderSocialFeed('', true);
    const scrollToTargetPost = () => {
      renderSocialFeed('', true);
      const grid = document.getElementById('remoPostsGrid');
      const card = document.getElementById(`post_card_${targetPost}`);
      if (card) {
        if (grid && _isMobileGridScrollActive()) {
          grid.scrollTo({ top: card.offsetTop || 0, behavior: 'smooth' });
          setTimeout(() => { if (typeof syncDesktopStageRail === 'function') syncDesktopStageRail(true); }, 180);
        } else {
          card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        card.style.transition = 'all 0.5s ease';
        card.style.boxShadow = '0 0 35px rgba(56, 189, 248, 0.7)';
        setTimeout(() => { if (card) card.style.boxShadow = ''; }, 3500);
      }
      if (!window._deepLinkToastShown) {
        const pObj = findFeedPostById(targetPost);
        if (pObj) {
          window._deepLinkToastShown = true;
          const isFrNow = REMO_I18N.getLang() === 'fr';
          const effTo = (pObj.mediaType === 'text_card') ? getEffectiveTextCardRecipient(pObj) : '';
          if (effTo) {
            if (typeof spawnRemoCoinsFX === 'function') spawnRemoCoinsFX(8);
            remoToast(
              isFrNow
                ? `🎁 Vœu personnalisé pour ${effTo} de @${pObj.authorName || 'Citoyen'} !`
                : `🎁 Personalized card for ${effTo} from @${pObj.authorName || 'Citizen'}!`,
              'fanfare'
            );
          } else {
            remoToast(
              pObj.versus
                ? (isFrNow ? '⚔️ Duel de Villes en direct ! Touchez une ville pour voter (+10 🪙) !' : '⚔️ Live City Duel! Tap a city photo to cast your vote (+10 🪙)!')
                : (isFrNow ? '🌐 Moment de ville partagé en direct sur REMO World !' : '🌐 Shared live City Moment on REMO World!'),
              'coin'
            );
          }
        }
      }
    };
    setTimeout(scrollToTargetPost, 600);
    setTimeout(scrollToTargetPost, 1800);
  }
  if (params.get('city')) {
    currentFeedCityFilter = params.get('city');
    renderSocialFeed();
  }
  if (params.get('contest')) {
    window._pendingContestDeepLink = {
      key: params.get('contest').trim(),
      entry: (params.get('entry') || '').trim()
    };
    switchRemoView('contests');
    setTimeout(() => { if (typeof focusPendingContestDeepLink === 'function') focusPendingContestDeepLink(); }, 450);
  } else if (params.get('view')) {
    switchRemoView(params.get('view'));
  }
  if (params.get('verify')) {
    remoToast(`✓ Verified Authentic Card: ${params.get('verify')}`, 'fanfare');
  }
  if (params.get('u')) {
    const targetUserParam = params.get('u').trim();
    if (targetUserParam) {
      window._pendingProfileDeepLink = targetUserParam;
      setTimeout(() => {
        if (window._pendingProfileDeepLink && typeof openCitizenProfileModal === 'function') {
          const opened = openCitizenProfileModal(window._pendingProfileDeepLink, '', true);
          if (opened) window._pendingProfileDeepLink = '';
        }
      }, 450);
    }
  }
  if (params.get('challengeScore') && targetPost) {
    if (typeof initGameChallengeFromUrlParams === 'function') {
      initGameChallengeFromUrlParams(targetPost, params.get('challengeScore'), params.get('challenger') || 'Challenger');
    }
  }
  if (params.get('war')) {
    window._activeWarDeepLink = {
      warId: params.get('war'),
      side: params.get('side') === 'B' ? 'B' : 'A'
    };
    if (typeof openCleanFeedPulseDrawer === 'function') openCleanFeedPulseDrawer(true);
    if (typeof renderMobileCityWarStrip === 'function') renderMobileCityWarStrip();
    setTimeout(() => {
      const strip = document.getElementById('mobileCityWarStrip');
      if (strip) {
        strip.classList.add('force-visible');
        strip.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 350);
  }
  if (params.get('guess') && targetPost) {
    setTimeout(() => {
      const mBox = document.querySelector(`#post_card_${targetPost} .mystery-city-box`);
      if (mBox) {
        mBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
        mBox.style.boxShadow = '0 0 28px rgba(168, 85, 247, 0.85)';
      }
    }, 850);
  }
  syncWelcomeHeroVisibility();
  const tvCity = (params.get('tv') || '').trim().toLowerCase();
  const tvFx = (params.get('fx') || '').trim().toLowerCase();
  const tvSt = (params.get('st') || params.get('station') || '').trim();
  const tvZen = params.get('zen') === '1';
  const tvRoom = (params.get('room') || '').trim();
  const tvRt = Number(params.get('rt') || 0);
  const tvRd = Number(params.get('rd') || 0);
  const focusFlag = params.get('focus') === '1';
  const openTarget = (params.get('open') || '').trim().toLowerCase();
  if (tvCity || tvFx || tvSt || tvRoom || focusFlag || openTarget === 'focustv' || openTarget === 'tv') {
    setTimeout(() => {
      if (typeof window.openFocusTvModal === 'function') {
        window.openFocusTvModal(tvCity || null, true, {
          fx: tvFx,
          stationId: tvSt,
          zen: tvZen,
          room: tvRoom,
          roomStartSec: tvRt,
          roomDurMin: tvRd
        });
      }
    }, 280);
  }
  if (openTarget) {
    setTimeout(() => {
      if (openTarget === 'radio') {
        if (typeof window.openRemoRadioModal === 'function') window.openRemoRadioModal();
        const stParam = (params.get('station') || '').trim();
        if (stParam && typeof window.selectRadioStation === 'function') window.selectRadioStation(stParam);
      } else if (openTarget === 'beatpad') {
        if (typeof openCreatePostModal === 'function') openCreatePostModal('#RemoBeat');
        if (typeof switchCreateStudioTab === 'function') switchCreateStudioTab('beat');
      } else if (openTarget === 'boardingpass') {
        if (typeof openBoardingPassModal === 'function') openBoardingPassModal();
        const destCity = (params.get('city') || '').trim().toLowerCase();
        if (destCity && typeof setBoardingPassRoutePreset === 'function') {
          setBoardingPassRoutePreset(destCity === 'montreal' ? 'paris' : 'montreal', destCity);
        }
      } else if (openTarget === 'guess') {
        const mysteryBtn = document.querySelector('.feed-top-widgets button[onclick*="mystery"]');
        if (typeof setFeedMode === 'function') setFeedMode('mystery', mysteryBtn);
      } else if (openTarget === 'blitz' || openTarget === 'worldblitz') {
        const blitzVs = (params.get('vs') || '').trim();
        if (typeof window.openWorldBlitzModal === 'function') {
          window.openWorldBlitzModal(blitzVs ? { vs: blitzVs } : {});
        }
      }
    }, 280);
  }
  if (params.get('ref')) {
    const refCode = params.get('ref').trim().toUpperCase();
    const curU = REMO_STORE.getCurrentUser();
    if (curU && !curU.referredBy) {
      const r = REMO_STORE.redeemReferralCode(curU.uid, refCode);
      if (r.ok) {
        spawnRemoCoinsFX(12);
        syncHeaderAndSidebars();
        remoToast(`🎉 +${r.bonus} 🪙 Referral Bonus claimed with @${r.inviter.name}!`, 'fanfare');
      }
    } else if (!curU) {
      localStorage.setItem('remo_pending_ref', refCode);
      remoToast(`🎁 Invite Code ${refCode} ready! Sign In to claim +100 🪙!`, 'fanfare');
      openAuthModal();
    }
  }

  // Register Service Worker for PWA with auto-update
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('./sw.js').then((reg) => {
      reg.update().catch(() => {});
    }).catch(() => {});
  }

  // Auto-collapse top filter drawer on mobile after picking a chip, and close orphaned drawers when tapping feed/modals
  const moreFiltersWrapEl = document.getElementById('moreFeedFiltersWrap');
  if (moreFiltersWrapEl) {
    moreFiltersWrapEl.addEventListener('click', (ev) => {
      if (window.innerWidth <= 860 && ev.target && ev.target.closest('.fchip')) {
        setTimeout(() => toggleMoreFeedFilters(false), 60);
      }
    });
  }
  document.addEventListener('click', (ev) => {
    const tEl = ev.target;
    if (!tEl) return;
    if (!tEl.closest('.feed-top-widgets') && !tEl.closest('#mobileFeedSearchDrawer') && !tEl.closest('#btnMobileSearchToggle')) {
      closeTopFeedDrawers();
    }
  });

  // Global Escape + Desktop Keyboard Shortcuts (ArrowUp/ArrowDown/J/K stage step, M radar, G cards, A arena)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const openCoin = document.getElementById('remoCoin3DModal')?.classList.contains('open');
      if (openCoin && typeof closeRemoCoin3DModal === 'function') closeRemoCoin3DModal();
      document.querySelectorAll('.remo-modal-backdrop.open').forEach((m) => m.classList.remove('open'));
      closeTopFeedDrawers();
      return;
    }
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
    const anyModalOpen = Boolean(document.querySelector('.remo-modal-backdrop.open'));
    if (!anyModalOpen && typeof isDesktopFeedStageActive === 'function' && isDesktopFeedStageActive()) {
      if (e.key === 'ArrowDown' || e.key.toLowerCase() === 'j') {
        e.preventDefault();
        stepDesktopStagePost(1);
        return;
      }
      if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'k') {
        e.preventDefault();
        stepDesktopStagePost(-1);
        return;
      }
    }
    if (e.key.toLowerCase() === 'm') switchRemoView('radar');
    else if (e.key.toLowerCase() === 'g') switchRemoView('cards');
    else if (e.key.toLowerCase() === 'a') switchRemoView('arena');
  });

  // 🌐 Holographic Onboarding Welcome Splash Screen (Only when explicitly requested via ?welcome=1 or ?onboarding=1)
  if (params.has('welcome') || params.has('onboarding')) {
    setTimeout(() => {
      if (typeof showWelcomeSplashScreen === 'function') {
        showWelcomeSplashScreen(true);
      }
    }, 400);
  }
});

/* ── FEATURE 4: LIVE CITY WIDGET EMBED STUDIO CONTROLLER ── */
const REMO_WIDGET_CITY_IDS = [
  'montreal', 'paris', 'chisinau', 'bucharest', 'newyork', 'tokyo',
  'london', 'dubai', 'miami', 'barcelona', 'rome', 'toronto',
  'monaco', 'losangeles', 'seoul', 'geneva', 'singapore', 'sydney',
  'rio', 'istanbul', 'berlin', 'amsterdam', 'lisbon', 'cairo'
];

const _widgetEmbedState = {
  cityId: 'montreal',
  lang: 'en'
};

function _populateWidgetCityOptions(selectedCityId = '') {
  const sel = document.getElementById('widgetEmbedCitySel');
  if (!sel) return;
  const lang = REMO_I18N.getLang();
  const pick = REMO_WIDGET_CITY_IDS.includes(String(selectedCityId || '').toLowerCase())
    ? String(selectedCityId).toLowerCase()
    : _widgetEmbedState.cityId;
  sel.innerHTML = REMO_WIDGET_CITY_IDS.map((cid) => {
    const c = getCityById(cid);
    const label = c ? `${c.flag} ${escapeHtmlStr(getCityName(c, lang))}` : cid;
    return `<option value="${cid}" ${cid === pick ? 'selected' : ''}>${label}</option>`;
  }).join('');
  sel.value = pick;
  _widgetEmbedState.cityId = pick;
}

function setWidgetEmbedLang(langCode) {
  _widgetEmbedState.lang = langCode === 'fr' ? 'fr' : 'en';
  document.getElementById('widgetLangBtnEn')?.classList.toggle('active', _widgetEmbedState.lang === 'en');
  document.getElementById('widgetLangBtnFr')?.classList.toggle('active', _widgetEmbedState.lang === 'fr');
  const sel = document.getElementById('widgetEmbedCitySel');
  if (sel && sel.options.length === 0) {
    _populateWidgetCityOptions(_widgetEmbedState.cityId);
  }
  updateWidgetEmbedPreview();
}
window.setWidgetEmbedLang = setWidgetEmbedLang;

function updateWidgetEmbedPreview() {
  const sel = document.getElementById('widgetEmbedCitySel');
  if (sel) {
    if (sel.options.length === 0) _populateWidgetCityOptions(_widgetEmbedState.cityId);
    if (REMO_WIDGET_CITY_IDS.includes(sel.value)) {
      _widgetEmbedState.cityId = sel.value;
    }
  }
  const cid = _widgetEmbedState.cityId || 'montreal';
  const wLang = _widgetEmbedState.lang === 'fr' ? 'fr' : 'en';
  const prodUrl = `https://remoworld.com/widget.html?city=${encodeURIComponent(cid)}&lang=${wLang}`;
  const previewSrc = `widget.html?city=${encodeURIComponent(cid)}&lang=${wLang}`;
  const iframeCode = `<iframe src="${prodUrl}" width="100%" height="156" style="border:0;border-radius:16px;overflow:hidden;" loading="lazy" title="REMO World Live City Widget"></iframe>`;

  const urlInp = document.getElementById('widgetEmbedDirectUrlInp');
  if (urlInp) urlInp.value = prodUrl;
  const iframeInp = document.getElementById('widgetEmbedIframeInp');
  if (iframeInp) iframeInp.value = iframeCode;

  const frame = document.getElementById('widgetEmbedLiveFrame');
  if (frame && frame.getAttribute('src') !== previewSrc) {
    frame.setAttribute('src', previewSrc);
  }
}
window.updateWidgetEmbedPreview = updateWidgetEmbedPreview;

function openWidgetEmbedModal(preferredCityId = '') {
  const modal = document.getElementById('widgetEmbedModal');
  if (!modal) return;
  const u = REMO_STORE.getCurrentUser();
  const candidate = String(preferredCityId || (u && u.homeCity) || 'montreal').toLowerCase();
  _widgetEmbedState.cityId = REMO_WIDGET_CITY_IDS.includes(candidate) ? candidate : 'montreal';
  _widgetEmbedState.lang = REMO_I18N.getLang() === 'fr' ? 'fr' : 'en';

  if (typeof REMO_I18N !== 'undefined' && REMO_I18N.applyDOM) REMO_I18N.applyDOM(modal);
  _populateWidgetCityOptions(_widgetEmbedState.cityId);
  setWidgetEmbedLang(_widgetEmbedState.lang);
  modal.classList.add('open');
}
window.openWidgetEmbedModal = openWidgetEmbedModal;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => _populateWidgetCityOptions());
} else {
  _populateWidgetCityOptions();
}

function closeWidgetEmbedModal() {
  document.getElementById('widgetEmbedModal')?.classList.remove('open');
  const frame = document.getElementById('widgetEmbedLiveFrame');
  if (frame) frame.setAttribute('src', 'about:blank');
}
window.closeWidgetEmbedModal = closeWidgetEmbedModal;

async function copyWidgetEmbedValue(kind) {
  const el = document.getElementById(kind === 'iframe' ? 'widgetEmbedIframeInp' : 'widgetEmbedDirectUrlInp');
  const text = el ? el.value : '';
  if (!text) return;
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
    } else if (el) {
      el.select();
      document.execCommand('copy');
    }
  } catch (e) {}
  RemoAudio.play('coin');
  remoToast(t(kind === 'iframe' ? 'widget_copied_iframe' : 'widget_copied_link'), 'coin');
}
window.copyWidgetEmbedValue = copyWidgetEmbedValue;

window.addEventListener('remo:langchange', () => {
  syncHeaderAndSidebars();
  switchRemoView(currentRemoView);
  const widgetModal = document.getElementById('widgetEmbedModal');
  if (widgetModal && widgetModal.classList.contains('open')) {
    _populateWidgetCityOptions(_widgetEmbedState.cityId);
    if (REMO_I18N.applyDOM) REMO_I18N.applyDOM(widgetModal);
    updateWidgetEmbedPreview();
  }
  const createModal = document.getElementById('createPostModal');
  if (createModal && createModal.classList.contains('open') && typeof updateTextCardStudioPreview === 'function') {
    updateTextCardStudioPreview();
    const alignBtn = document.getElementById('btnTcAlignToggle');
    if (alignBtn) alignBtn.textContent = _textCardStudioState.align === 'left' ? t('tc_align_left') : t('tc_align_center');
    const motBtn = document.getElementById('btnTcMotionToggle');
    if (motBtn) motBtn.textContent = _textCardStudioState.motion === 'glow' ? t('tc_motion_on') : t('tc_motion_off');
    const capEl = document.getElementById('createCaptionInp');
    if (capEl && activeCreateStudioTab === 'textcard') capEl.placeholder = t('tc_cap_opt_hint');
  }
});

window.addEventListener('remo:stateupdate', (ev) => {
  const reason = ev && ev.detail ? ev.detail.reason : '';
  syncHeaderAndSidebars();

  if (reason === 'auth') {
    if (typeof flushPendingGuestGameScore === 'function') flushPendingGuestGameScore();
    if (typeof flushPendingGuestV59Rewards === 'function') flushPendingGuestV59Rewards();
  }
  if (window._pendingProfileDeepLink && typeof openCitizenProfileModal === 'function') {
    const opened = openCitizenProfileModal(window._pendingProfileDeepLink, '', true);
    if (opened) window._pendingProfileDeepLink = '';
  }

  // Keep running HTML mini-game iframes & videos uninterrupted when scores, war taps, single-post actions or non-feed events update
  if (reason === 'war_pulse') {
    if (typeof renderRightSidebarWidgets === 'function') renderRightSidebarWidgets();
    if (typeof renderMobileCityWarStrip === 'function') renderMobileCityWarStrip();
    if (currentRemoView === 'arena' && typeof renderArenaWarsOnly === 'function') renderArenaWarsOnly();
    return;
  }
  if (reason === 'game_score') {
    if (typeof refreshAllGameLeaderboardsDOM === 'function') refreshAllGameLeaderboardsDOM();
    return;
  }
  if (reason === 'cloud_users') {
    if (typeof renderLivePresenceStrip === 'function') renderLivePresenceStrip();
    return;
  }
  const singlePostOrNonFeedReasons = new Set([
    'like', 'city_score', 'tip', 'versus_vote', 'versus_claim_bonus', 'admin_conclude_duel',
    'poll_vote', 'capsule_unlock', 'bounty_feed_claimed', 'reaction', 'card_save',
    'dm', 'cloud_dms', 'notification', 'notif_read_all', 'city_stock_buy', 'city_stock_sell',
    'vip_order', 'vip_equip', 'vip_item_added', 'vip_item_del', 'vip_order_delivered',
    'bounty_new', 'bounty_sub', 'bounty_paid', 'bounty_del', 'post_retry_ok'
  ]);
  if (singlePostOrNonFeedReasons.has(reason) && currentRemoView === 'feed') {
    return;
  }

  if (currentRemoView === 'feed') renderSocialFeed();
  else if (currentRemoView === 'arena') renderArenaView();
  else if (currentRemoView === 'cards') renderVaultView();
  else if (currentRemoView === 'passport') renderPassportView();
  else if (currentRemoView === 'shop') renderVipShopView();
  else if (currentRemoView === 'auctions') renderAuctionsView();
  else if (currentRemoView === 'bounties') renderBountiesView();
  else if (currentRemoView === 'exchange') renderCityExchangeView();
  else if (currentRemoView === 'chat') renderCityChatView();
  else if (currentRemoView === 'messages') renderDirectMessagesView();
  else if (currentRemoView === 'bottles') renderWorldBottlesView();
  else if (currentRemoView === 'wheel') renderWheelView();
});

/* ── 8. ADMIN IN-FEED GOD-MODE, CUSTOM COIN TRANSFERS, PROMO CODES, BOUNTIES & CITY EXCHANGE ── */
function openAdminQuickModal(preselectUid = '') {
  const modal = document.getElementById('adminQuickModal');
  const pinBox = document.getElementById('admQuickPinBox');
  const ctrlBox = document.getElementById('admQuickControlsBox');
  if (!modal) return;

  const isAdmUser = REMO_STORE.isCurrentUserAdmin();
  if (!isAdmUser) {
    const lang = REMO_I18N.getLang();
    remoToast(lang === 'fr' ? '🔒 Accès réservé à l’Administration Officielle REMO.' : '🔒 Access restricted to Official REMO Administration.');
    return;
  }

  const titleEl = document.getElementById('admQuickTitleEl');
  const subEl = document.getElementById('admQuickSubEl');
  if (titleEl) titleEl.textContent = t('adm_quick_title');
  if (subEl) subEl.textContent = t('adm_unlock_sub');

  const isAdm = REMO_STORE.isAdminUnlocked();
  if (pinBox) pinBox.style.display = isAdm ? 'none' : 'block';
  if (ctrlBox) ctrlBox.style.display = isAdm ? 'flex' : 'none';

  if (isAdm) {
    const lang = REMO_I18N.getLang();
    const uSel = document.getElementById('admTransferUserSel');
    if (uSel) {
      uSel.innerHTML = (REMO_STORE.state.users || []).map((u) => {
        const c = getCityById(u.homeCity);
        return `<option value="${escapeHtmlStr(u.uid)}" ${u.uid === preselectUid ? 'selected' : ''}>${c.flag} @${escapeHtmlStr(u.name)} (#${escapeHtmlStr(u.passportNum)}) — 🪙 ${Number(u.coins || 0).toLocaleString()}</option>`;
      }).join('');
    }
    const cSel = document.getElementById('admNewPromoCityCard');
    if (cSel) {
      cSel.innerHTML = `<option value="">${lang === 'fr' ? 'Aucune carte bonus' : 'No Bonus Card'}</option>` +
        getRemoCities().map((c) => `<option value="${c.id}">🎴 +${c.flag} ${getCityName(c, lang)} Card</option>`).join('');
    }
    const sSel = document.getElementById('admSurgeCitySelect');
    if (sSel) {
      const prevCity = sSel.value || 'chisinau';
      sSel.innerHTML = getRemoCities().map((c) => {
        const wx = REMO_WEATHER.getCityLiveStatus(c);
        return `<option value="${c.id}" ${c.id === prevCity ? 'selected' : ''}>${c.flag} ${getCityName(c, lang)} (${wx.timeStr} · ${wx.icon} ${wx.tempC}°C)${wx.isSurge ? ' — ⚡ 2X ACTIVE' : ''}</option>`;
      }).join('');
    }
    const hhBtn = document.getElementById('btnToggleHappyHour');
    if (hhBtn) {
      hhBtn.textContent = REMO_STORE.state.settings.happyHour2x
        ? (lang === 'fr' ? '🟢 Happy Hour 2X : ACTIF (Désactiver)' : '🟢 2X Happy Hour: ACTIVE (Turn Off)')
        : (lang === 'fr' ? '⚡ Activer Happy Hour 2X Pièces' : '⚡ Activate 2X Rewards Happy Hour');
    }
    if (typeof renderInlineAdminSupportInbox === 'function') {
      renderInlineAdminSupportInbox();
    }
  }
  modal.classList.add('open');
}

function unlockAdminGodModeInline() {
  const lang = REMO_I18N.getLang();
  if (!REMO_STORE.isCurrentUserAdmin()) {
    quickGoogleSignInSim();
    return;
  }
  REMO_STORE.setAdminUnlocked(true);
  RemoAudio.play('fanfare');
  remoToast(lang === 'fr' ? '👑 Mode Admin activé sur tout REMO !' : '👑 Admin Mode unlocked across REMO!', 'fanfare');
  syncHeaderAndSidebars();
  openAdminQuickModal();
  renderSocialFeed();
}

function lockAdminGodModeInline() {
  REMO_STORE.setAdminUnlocked(false);
  document.getElementById('adminQuickModal')?.classList.remove('open');
  syncHeaderAndSidebars();
  renderSocialFeed();
}

function executeInlineAdminCoinTransfer() {
  if (!REMO_STORE.isAdminUnlocked()) return;
  const lang = REMO_I18N.getLang();
  const uid = document.getElementById('admTransferUserSel')?.value;
  const mode = document.getElementById('admTransferModeSel')?.value || 'add';
  const amt = Number(document.getElementById('admTransferAmtInp')?.value || 0);
  const note = document.getElementById('admTransferNoteInp')?.value || '';
  if (!uid || amt < 0) return;

  const updated = REMO_STORE.adminAdjustUserCoins(uid, mode, amt, note);
  if (updated) {
    spawnRemoCoinsFX(12);
    syncHeaderAndSidebars();
    openAdminQuickModal(uid);
    remoToast(
      lang === 'fr'
        ? `🪙 Solde de @${updated.name} mis à jour : ${updated.coins.toLocaleString()} 🪙 !`
        : `🪙 @${updated.name}'s wallet updated: ${updated.coins.toLocaleString()} 🪙!`,
      'fanfare'
    );
  }
}

function quickCreateNewCitizenByAdmin() {
  if (!REMO_STORE.isAdminUnlocked()) return;
  const lang = REMO_I18N.getLang();
  const name = prompt(lang === 'fr' ? 'Nom du nouveau Citoyen :' : 'New Citizen Name:');
  if (!name || !name.trim()) return;
  const pNum = String((REMO_STORE.state.users || []).length + 1).padStart(4, '0');
  const newU = {
    uid: 'u_' + Date.now().toString(36),
    name: name.trim(),
    email: `${name.trim().toLowerCase().replace(/[^a-z0-9]/g, '')}@remo.world`,
    role: 'citizen',
    verified: true,
    homeCity: 'montreal',
    passportNum: pNum,
    coins: 500,
    lifetimeCoins: 500,
    streak: 1,
    visas: ['montreal'],
    avatarColor: '#38bdf8'
  };
  REMO_STORE.state.users.push(newU);
  REMO_STORE.save(true, 'admin_create_user');
  openAdminQuickModal(newU.uid);
  remoToast(`👤 @${newU.name} (#${pNum}) created!`);
}

function toggleHappyHour2xInline() {
  if (!REMO_STORE.isAdminUnlocked()) return;
  REMO_STORE.state.settings.happyHour2x = !REMO_STORE.state.settings.happyHour2x;
  REMO_STORE.save(true, 'happy_hour');
  syncHeaderAndSidebars();
  openAdminQuickModal();
  remoToast(REMO_STORE.state.settings.happyHour2x ? '⚡ 2X REWARDS HAPPY HOUR LIVE!' : '2X Happy Hour ended.', 'fanfare');
}

function triggerInlineCoinRain() {
  if (!REMO_STORE.isAdminUnlocked()) return;
  const lang = REMO_I18N.getLang();
  const amt = Number(prompt(lang === 'fr' ? 'Combien de Pièces REMO envoyer à TOUS les citoyens ?' : 'How many REMO Coins to rain on EVERY citizen?', '200'));
  if (!amt || amt <= 0) return;
  (REMO_STORE.state.users || []).forEach((u) => {
    u.coins = (u.coins || 0) + amt;
    u.lifetimeCoins = (u.lifetimeCoins || 0) + amt;
  });
  REMO_STORE.save(true, 'coin_rain');
  spawnRemoCoinsFX(20);
  syncHeaderAndSidebars();
  openAdminQuickModal();
  remoToast(lang === 'fr' ? `🌧️ +${amt} 🪙 envoyés à tous les citoyens !` : `🌧️ +${amt} 🪙 rained on all citizens!`, 'fanfare');
}

function createPromoCodeInline() {
  if (!REMO_STORE.isAdminUnlocked()) return;
  const lang = REMO_I18N.getLang();
  const code = (document.getElementById('admNewPromoCode')?.value || '').trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
  const coins = Math.max(10, Number(document.getElementById('admNewPromoCoins')?.value || 500));
  const bonusCityCard = document.getElementById('admNewPromoCityCard')?.value || '';
  if (!code) {
    remoToast(lang === 'fr' ? 'Entrez un code promo (ex: VIP500) !' : 'Enter a promo code (e.g. VIP500)!');
    return;
  }
  REMO_STORE.state.promoCodes = (REMO_STORE.state.promoCodes || []).filter((c) => c.code !== code);
  REMO_STORE.state.promoCodes.unshift({ code, coins, bonusCityCard, maxUses: 500, redeemedBy: [] });
  REMO_STORE.save(true, 'promo_created');
  navigator.clipboard?.writeText(code);
  remoToast(
    lang === 'fr'
      ? `🎟️ Code ${code} créé (+${coins} 🪙) et copié !`
      : `🎟️ Code ${code} created (+${coins} 🪙) & copied!`,
    'fanfare'
  );
}

/* ── ⋯ Post Actions & Creator Tools Bottom-Sheet Modal ── */
function openPostActionsSheet(postId) {
  const modal = document.getElementById('postActionsModal');
  const content = document.getElementById('postActionsModalContent');
  if (!modal || !content) return;

  const lang = REMO_I18N.getLang();
  const u = REMO_STORE.getCurrentUser();
  const isAdm = REMO_STORE.isAdminUnlocked() || REMO_STORE.isCurrentUserAdmin();
  const p = findFeedPostById(postId);
  if (!p) return;

  const city = getCityById(p.cityId) || getCityById('montreal');
  const isPostOwner = Boolean(u && (
    (p.uid && u.uid === p.uid) ||
    (p.authorUid && u.uid === p.authorUid) ||
    (u.email && p.authorEmail && u.email.toLowerCase() === p.authorEmail.toLowerCase()) ||
    (u.name && p.authorName && u.name.trim().toLowerCase() === p.authorName.trim().toLowerCase())
  ));
  const isBookmarked = JSON.parse(localStorage.getItem('remo_saved_posts') || '[]').includes(p.id);

  const EMOJIS = ['🔥', '⚡', '💎', '🤯', '👑'];
  const rxMap = p.reactions || {};
  const dualPair = buildPostBilingualPair(p);
  const rawCap = String((lang === 'fr' ? (p.caption_fr || p.caption_en) : (p.caption_en || p.caption_fr)) || '').replace(/^(?:🇬🇧|🇫🇷)\s+/u, '');
  const authorUser = (REMO_STORE.state.users || []).find((usr) => usr && ((p.uid && usr.uid === p.uid) || (p.authorName && usr.name && usr.name.toLowerCase() === p.authorName.toLowerCase())));
  const authorAvatarUrl = p.authorAvatar || (typeof REMO_STORE.getUserAvatar === 'function' ? REMO_STORE.getUserAvatar(p.uid || p.authorName) : '') || (authorUser && authorUser.avatarUrl) || '';

  content.innerHTML = `
    <div class="modal-hdr">
      <div style="display:flex;align-items:center;gap:10px;min-width:0;cursor:pointer;" onclick="closePostActionsModal();openCitizenProfileModal('${escapeJsSingleArg(p.uid || '')}', '${escapeJsSingleArg(p.authorName || '')}');">
        <div class="avatar-circle" style="width:36px;height:36px;font-size:0.95rem;flex-shrink:0;overflow:hidden;padding:0;">
          ${sanitizeSafeMediaUrl(authorAvatarUrl) ? `<img src="${sanitizeSafeMediaUrl(authorAvatarUrl)}" loading="lazy" decoding="async" style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block;" alt="${escapeHtmlStr(p.authorName)}">` : escapeHtmlStr((p.authorName || 'R')[0].toUpperCase())}
        </div>
        <div style="min-width:0;">
          <div style="font-weight:900;font-size:0.92rem;color:#fff;">@${escapeHtmlStr(p.authorName)}</div>
          <div style="font-size:0.75rem;color:var(--muted);">${city.flag} ${getCityName(city, lang)}</div>
        </div>
      </div>
      <button class="modal-close" onclick="closePostActionsModal()">✕</button>
    </div>

    ${rawCap ? `
      <div style="margin:8px 0 12px;padding:10px 12px;border-radius:12px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);font-size:0.83rem;line-height:1.42;color:#f8fafc;">
        <div>${escapeHtmlStr(rawCap)}</div>
        ${dualPair.en && dualPair.fr && dualPair.en.toLowerCase() !== dualPair.fr.toLowerCase() ? `
          <div style="margin-top:6px;padding-top:6px;border-top:1px dashed rgba(255,255,255,0.1);font-size:0.75rem;color:#94a3b8;">
            🌐 ${escapeHtmlStr(lang === 'fr' ? dualPair.en : dualPair.fr)}
          </div>
        ` : ''}
      </div>
    ` : ''}

    <!-- Quick Studio Action Tools Grid -->
    <div class="sheet-quick-tools-grid">
      <button type="button" class="sheet-qt-btn" onclick="closePostActionsModal(); flipPost3DCard('${p.id}');">
        <span>🔄</span>
        <b>${lang === 'fr' ? 'Carte 3D' : '3D Flip'}</b>
      </button>
      <button type="button" class="sheet-qt-btn" onclick="closePostActionsModal(); openPostFullscreenMedia('${p.id}');">
        <span>⛶</span>
        <b>${lang === 'fr' ? 'Plein écran' : 'Fullscreen'}</b>
      </button>
      ${['image', 'carousel', 'city_art', 'text_card'].includes(p.mediaType) && !p.duetOf ? `
      <button type="button" class="sheet-qt-btn" onclick="closePostActionsModal(); startWorldWindowSync('${p.id}');">
        <span>🪟</span>
        <b>${lang === 'fr' ? 'Synchro 4D' : 'Sync Window'}</b>
      </button>
      ` : `
      <button type="button" class="sheet-qt-btn" onclick="closePostActionsModal(); sharePostLink('${p.id}');">
        <span>🔗</span>
        <b>${lang === 'fr' ? 'Lien' : 'Share Link'}</b>
      </button>
      `}
      <button type="button" class="sheet-qt-btn" onclick="closePostActionsModal(); openBoardingPassModal('${(u && u.homeCity) ? u.homeCity : 'montreal'}', '${p.cityId || 'chisinau'}');">
        <span>🎫</span>
        <b>${lang === 'fr' ? 'Billet 4D' : '4D Ticket'}</b>
      </button>
    </div>

    <!-- Quick Emoji Reactions Row -->
    <div style="margin:12px 0 16px;">
      <div style="font-size:0.75rem;font-weight:800;color:#94a3b8;margin-bottom:8px;text-transform:uppercase;">
        ${lang === 'fr' ? 'Réagir avec un Émoji' : 'React with Emoji'}
      </div>
      <div style="display:flex;justify-content:space-between;gap:6px;">
        ${EMOJIS.map((em) => `
          <button type="button" class="creact-pill" style="flex:1;justify-content:center;padding:8px 0;font-size:1.15rem;" onclick="reactEmojiToPost('${p.id}', '${em}'); closePostActionsModal();">
            ${em} ${rxMap[em] ? `<span style="font-size:0.75rem;">${rxMap[em]}</span>` : ''}
          </button>
        `).join('')}
      </div>
    </div>

    <!-- Action Buttons List -->
    <div style="display:flex;flex-direction:column;gap:8px;">
      <button type="button" class="action-sheet-row" onclick="closePostActionsModal(); startCityDuetFromPost('${p.id}');">
        <span class="as-icon" style="background:rgba(244,114,182,0.15);color:#f472b6;">🎭</span>
        <div style="text-align:left;flex:1;">
          <b style="color:#fbcfe8;">${lang === 'fr' ? 'Créer un Duo de Ville' : 'Create City Duet'}</b>
          <div style="font-size:0.72rem;color:var(--muted);">${lang === 'fr' ? 'Répondez avec votre propre vidéo/photo (+20 🪙)' : 'Reply with your city moment (+20 🪙)'}</div>
        </div>
      </button>

      <button type="button" class="action-sheet-row" onclick="closePostActionsModal(); openBoardingPassModal('${(u && u.homeCity) ? u.homeCity : 'montreal'}', '${p.cityId || 'chisinau'}');">
        <span class="as-icon" style="background:rgba(56,189,248,0.15);color:#38bdf8;">🎫</span>
        <div style="text-align:left;flex:1;">
          <b style="color:#bae6fd;">${lang === 'fr' ? 'Billet de Téléportation 4D (Story 9:16)' : '4D Teleport Boarding Pass (9:16 Story)'}</b>
          <div style="font-size:0.72rem;color:var(--muted);">${lang === 'fr' ? 'Générez un billet de vol officiel pour TikTok & Instagram' : 'Generate official cyber flight pass for TikTok & Instagram'}</div>
        </div>
      </button>

      ${p.mintedCard ? `
      <button type="button" class="action-sheet-row" onclick="closePostActionsModal(); mintPostAsCityCard('${p.id}');">
        <span class="as-icon" style="background:rgba(251,191,36,0.18);color:#fbbf24;">🎴</span>
        <div style="text-align:left;flex:1;">
          <b style="color:#fef08a;">${lang === 'fr' ? 'Voir la Carte Ville 4D' : 'View 4D City Card'}</b>
          <div style="font-size:0.72rem;color:var(--muted);">${lang === 'fr' ? 'Inspectez la Carte 4D créée par l’auteur' : 'Inspect the 4D Card minted by the author'}</div>
        </div>
      </button>
      ` : isPostOwner ? `
      <button type="button" class="action-sheet-row" onclick="closePostActionsModal(); mintPostAsCityCard('${p.id}');">
        <span class="as-icon" style="background:rgba(251,191,36,0.15);color:#fbbf24;">🎴</span>
        <div style="text-align:left;flex:1;">
          <b style="color:#fef08a;">${lang === 'fr' ? 'Créer Carte Ville 4D' : 'Mint 4D City Card'}</b>
          <div style="font-size:0.72rem;color:var(--muted);">${
            isAdm
              ? (lang === 'fr' ? '👑 Fondateur : Création 4D illimitée depuis vos publications' : '👑 Founder: Unlimited 4D Card minting from your posts')
              : hasCitizenUsedMonthlyPhotoCardQuota(u)
                ? (lang === 'fr' ? '⏳ Limite atteinte : 1 Carte 4D / mois (Prochaine le 1er du mois)' : '⏳ Limit reached: 1 4D Card / month (Next on the 1st)')
                : (lang === 'fr' ? '1 Carte 4D / mois (Votre publication uniquement)' : '1 4D Card / month (Your own post only)')
          }</div>
        </div>
      </button>
      ` : ''}

      ${(isPostOwner || isAdm) ? `
      <button type="button" class="action-sheet-row" onclick="closePostActionsModal(); boostPost24h('${p.id}');">
        <span class="as-icon" style="background:rgba(56,189,248,0.15);color:#38bdf8;">🚀</span>
        <div style="text-align:left;flex:1;">
          <b style="color:#bae6fd;">${isPostBoostActive(p) ? (lang === 'fr' ? 'Prolonger le Boost (+24h)' : 'Extend Boost (+24h)') : (lang === 'fr' ? 'Booster la Publication' : 'Boost Post')}</b>
          <div style="font-size:0.72rem;color:var(--muted);">${isAdm ? (lang === 'fr' ? 'Propulsez en tête du fil (Gratuit Admin)' : 'Propel to top of feed (Free Admin)') : (lang === 'fr' ? 'Propulsez ce moment en tête du fil 24h (100 🪙)' : 'Propel to top of global feed for 24h (100 🪙)')}</div>
        </div>
      </button>
      ` : ''}

      ${isPostOwner ? `
      <button type="button" class="action-sheet-row" style="border-color:rgba(251,191,36,0.38);background:rgba(251,191,36,0.06);" onclick="closePostActionsModal(); openSpotlightForSpecificPost('${p.id}');">
        <span class="as-icon" style="background:rgba(251,191,36,0.18);color:#fde047;">🌟</span>
        <div style="text-align:left;flex:1;">
          <b style="color:#fde047;">${escapeHtmlStr(t('wspot_post_btn'))}</b>
          <div style="font-size:0.72rem;color:var(--muted);">${escapeHtmlStr(t('wspot_post_btn_sub'))}</div>
        </div>
      </button>
      ` : ''}

      <button type="button" class="action-sheet-row" onclick="closePostActionsModal(); saveBookmarkPost('${p.id}');">
        <span class="as-icon" style="background:rgba(168,85,247,0.15);color:#c084fc;">${isBookmarked ? '⭐' : '🔖'}</span>
        <div style="text-align:left;flex:1;">
          <b style="color:#e9d5ff;">${isBookmarked ? (lang === 'fr' ? 'Retirer des Favoris' : 'Remove Bookmark') : (lang === 'fr' ? 'Enregistrer dans Favoris' : 'Save Bookmark')}</b>
        </div>
      </button>

      <button type="button" class="action-sheet-row" onclick="closePostActionsModal(); sharePostLink('${p.id}');">
        <span class="as-icon" style="background:rgba(52,211,153,0.15);color:#34d399;">🔗</span>
        <div style="text-align:left;flex:1;">
          <b style="color:#a7f3d0;">${lang === 'fr' ? 'Copier le Lien Direct' : 'Copy Share Link'}</b>
        </div>
      </button>

      ${(p.mediaType === 'text_card' && p.textCard) ? `
      <button type="button" class="action-sheet-row" onclick="closePostActionsModal(); downloadTextCardPng('${p.id}');">
        <span class="as-icon" style="background:rgba(56,189,248,0.15);color:#38bdf8;">💾</span>
        <div style="text-align:left;flex:1;">
          <b style="color:#bae6fd;">${escapeHtmlStr(t('tc_download_png'))}</b>
        </div>
      </button>
      <button type="button" class="action-sheet-row" onclick="closePostActionsModal(); copyTextCardText('${p.id}');">
        <span class="as-icon" style="background:rgba(251,191,36,0.15);color:#fbbf24;">📋</span>
        <div style="text-align:left;flex:1;">
          <b style="color:#fef08a;">${escapeHtmlStr(t('tc_copy_text'))}</b>
        </div>
      </button>
      ` : ''}

      <button type="button" class="action-sheet-row" onclick="closePostActionsModal(); openDirectChatWithUser('${p.uid || ''}');">
        <span class="as-icon" style="background:rgba(56,189,248,0.15);color:#38bdf8;">💌</span>
        <div style="text-align:left;flex:1;">
          <b style="color:#bae6fd;">${lang === 'fr' ? 'Message Privé (DM)' : 'Send Private Message'}</b>
        </div>
      </button>

      ${(isPostOwner || isAdm) ? `
        <button type="button" class="action-sheet-row danger" onclick="closePostActionsModal(); userDeleteOwnPost('${p.id}');">
          <span class="as-icon" style="background:rgba(244,63,94,0.15);color:#f43f5e;">🗑️</span>
          <div style="text-align:left;flex:1;">
            <b style="color:#fda4af;">${lang === 'fr' ? 'Supprimer ma Publication' : 'Delete My Post'}</b>
          </div>
        </button>
      ` : ''}

      ${isAdm ? `
        <div style="margin-top:10px;padding-top:10px;border-top:1px dashed rgba(251,191,36,0.35);">
          <div style="font-size:0.75rem;font-weight:900;color:#fbbf24;margin-bottom:8px;">
            👑 ADMIN GOD-MODE TOOLS (#${escapeHtmlStr((p.id || '').slice(-6))})
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
            <button type="button" class="adm-pbtn gold" onclick="closePostActionsModal(); adminPinPostInline('${p.id}');">
              📌 ${p.pinned ? (lang === 'fr' ? 'Désépingler' : 'Unpin') : (lang === 'fr' ? 'Épingler' : 'Pin')}
            </button>
            <button type="button" class="adm-pbtn" style="background:${isPostBoostActive(p) ? 'linear-gradient(135deg,#ef4444,#dc2626)' : 'linear-gradient(135deg,#0284c7,#ec4899)'};color:#fff;" onclick="closePostActionsModal(); adminToggleBoostPostInline('${p.id}');">
              🚀 ${isPostBoostActive(p) ? (lang === 'fr' ? 'Annuler Boost' : 'Cancel Boost') : (lang === 'fr' ? 'Booster 24h' : 'Boost 24h')}
            </button>
            <button type="button" class="adm-pbtn gold" onclick="closePostActionsModal(); adminAwardFounderCrown('${p.id}');">
              👑 Couronne (+100🪙)
            </button>
            <button type="button" class="adm-pbtn" onclick="closePostActionsModal(); adminEditPostInline('${p.id}');">
              ✏️ Modifier Texte
            </button>
            <button type="button" class="adm-pbtn danger" style="grid-column:span 2;" onclick="closePostActionsModal(); adminDeletePostInline('${p.id}');">
              🗑️ Supprimer (Admin)
            </button>
          </div>
        </div>
      ` : ''}
    </div>
  `;

  modal.classList.add('open');
}

function closePostActionsModal() {
  const modal = document.getElementById('postActionsModal');
  if (modal) modal.classList.remove('open');
}

window.openPostActionsSheet = openPostActionsSheet;
window.closePostActionsModal = closePostActionsModal;

/* ── Post Author & Admin Deletion Action ── */
function userDeleteOwnPost(postId) {
  const lang = REMO_I18N.getLang();
  const u = REMO_STORE.getCurrentUser();
  const isAdm = REMO_STORE.isAdminUnlocked() || REMO_STORE.isCurrentUserAdmin();
  const p = findFeedPostById(postId);
  if (!p) return;
  const isPostOwner = Boolean(u && (
    (p.uid && u.uid === p.uid) ||
    (p.authorUid && u.uid === p.authorUid) ||
    (u.email && p.authorEmail && u.email.toLowerCase() === p.authorEmail.toLowerCase()) ||
    (u.name && p.authorName && u.name.trim().toLowerCase() === p.authorName.trim().toLowerCase())
  ));
  if (!isPostOwner && !isAdm) {
    remoToast(lang === 'fr' ? '⚠️ Vous ne pouvez supprimer que vos propres publications.' : '⚠️ You can only delete your own posts.');
    return;
  }
  const confirmMsg = lang === 'fr'
    ? '🗑️ Voulez-vous vraiment supprimer définitivement cette publication ?'
    : '🗑️ Are you sure you want to permanently delete this post?';
  if (!confirm(confirmMsg)) return;

  REMO_STORE.state.posts = (REMO_STORE.state.posts || []).filter((x) => x.id !== postId);
  REMO_STORE.save(true, 'user_delete_post');
  REMO_STORE.deletePostFromCloud(postId);
  renderSocialFeed();
  remoToast(lang === 'fr' ? '🗑️ Votre publication a été supprimée avec succès.' : '🗑️ Your post was successfully deleted.');
}

/* ── Direct In-Feed Post Moderation Actions (Admin God-Mode) ── */
function adminDeletePostInline(postId) {
  const isAdm = REMO_STORE.isAdminUnlocked() || REMO_STORE.isCurrentUserAdmin();
  if (!isAdm) return;
  const lang = REMO_I18N.getLang();
  if (!confirm(lang === 'fr' ? '🗑️ Supprimer définitivement cette publication ?' : '🗑️ Permanently delete this post?')) return;
  REMO_STORE.state.posts = (REMO_STORE.state.posts || []).filter((p) => p.id !== postId);
  REMO_STORE.deletePostFromCloud(postId);
  REMO_STORE.save(true, 'admin_delete_post');
  renderSocialFeed();
  remoToast(lang === 'fr' ? '🗑️ Publication supprimée par Admin.' : '🗑️ Post deleted by Admin.');
}

function adminPinPostInline(postId) {
  const isAdm = REMO_STORE.isAdminUnlocked() || REMO_STORE.isCurrentUserAdmin();
  if (!isAdm) return;
  const p = (REMO_STORE.state.posts || []).find((x) => x.id === postId);
  if (!p) return;
  p.pinned = !p.pinned;
  REMO_STORE.syncPostToCloud(p);
  REMO_STORE.save(true, 'admin_pin_post');
  renderSocialFeed();
  remoToast(p.pinned ? '📌 Pinned #1 Globally!' : '📌 Unpinned.');
}

function adminAwardFounderCrown(postId) {
  const isAdm = REMO_STORE.isAdminUnlocked() || REMO_STORE.isCurrentUserAdmin();
  if (!isAdm) return;
  const p = (REMO_STORE.state.posts || []).find((x) => x.id === postId);
  if (!p) return;
  p.founderAward = true;
  if (p.uid) REMO_STORE.adminAdjustUserCoins(p.uid, 'add', 250, '👑 Founder Award Prize!');
  p.tipsTotal = (p.tipsTotal || 0) + 250;
  REMO_STORE.save(true, 'founder_award');
  spawnRemoCoinsFX(12);
  renderSocialFeed();
  remoToast(`👑 Founder Award granted to @${p.authorName} (+250 🪙)!`, 'fanfare');
}

function adminEditPostInline(postId) {
  if (!REMO_STORE.isAdminUnlocked() && !REMO_STORE.isCurrentUserAdmin()) return;
  const lang = REMO_I18N.getLang();
  const p = (REMO_STORE.state.posts || []).find((x) => x.id === postId);
  if (!p) return;
  const cur = lang === 'fr' ? (p.caption_fr || p.caption_en) : (p.caption_en || p.caption_fr);
  const edited = prompt(lang === 'fr' ? 'Modifier la légende de la publication :' : 'Edit post caption:', cur);
  if (edited === null) return;
  p.caption_en = edited;
  p.caption_fr = edited;
  REMO_STORE.syncPostToCloud(p);
  REMO_STORE.save(true, 'admin_edit_post');
  renderSocialFeed();
  remoToast('✏️ Post updated!');
}

function adminDeleteCommentInline(postId, commentId) {
  if (!REMO_STORE.isAdminUnlocked() && !REMO_STORE.isCurrentUserAdmin()) return;
  const p = (REMO_STORE.state.posts || []).find((x) => x.id === postId);
  if (!p || !Array.isArray(p.comments)) return;
  p.comments = p.comments.filter((c) => c.id !== commentId);
  REMO_STORE.save(true, 'admin_del_comment');
  openCommentsModal(postId);
  renderSocialFeed();
}

/* ── Redeemable VIP Promo Codes ── */
function redeemPromoCodeInput(inputId) {
  const lang = REMO_I18N.getLang();
  const inp = document.getElementById(inputId);
  const code = (inp?.value || '').trim().toUpperCase();
  if (!code) return;

  const u = REMO_STORE.getCurrentUser() || REMO_STORE.ensureGuestOrCitizen('Citizen', '', 'montreal');
  const found = (REMO_STORE.state.promoCodes || []).find((c) => c.code === code);
  if (!found) {
    remoToast(lang === 'fr' ? '❌ Code promo invalide ou expiré.' : '❌ Invalid or expired promo code.');
    return;
  }
  found.redeemedBy = found.redeemedBy || [];
  if (found.redeemedBy.includes(u.uid)) {
    remoToast(lang === 'fr' ? '✓ Vous avez déjà utilisé ce code !' : '✓ You already redeemed this code!');
    return;
  }
  found.redeemedBy.push(u.uid);
  REMO_STORE.creditSystemCoins(u.uid, found.coins, `🎟️ Promo Code ${code}`, 50000);
  if (inp) inp.value = '';
  spawnRemoCoinsFX(12);
  syncHeaderAndSidebars();

  if (found.bonusCityCard) {
    const card = REMO_STORE.mintCardForUser(u.uid, found.bonusCityCard, 'Mythic 4D', true, {
      subtitle: `VIP CODE: ${code}`
    });
    inspectCardModal(card);
  }
  remoToast(
    lang === 'fr'
      ? `🎉 Code ${code} validé : +${found.coins} 🪙 !`
      : `🎉 Code ${code} redeemed: +${found.coins} 🪙!`,
    'fanfare'
  );
}

/* ── 🎯 REMO CITY BOUNTIES™ (Paid Creator Missions) ── */
function renderBountiesView() {
  const box = document.getElementById('bountiesListContainer');
  if (!box) return;
  const lang = REMO_I18N.getLang();
  const isAdm = REMO_STORE.isAdminUnlocked();
  const bounties = REMO_STORE.state.bounties || [];

  box.innerHTML = bounties.map((b) => {
    const c = getCityById(b.cityId);
    const title = lang === 'fr' ? (b.title_fr || b.title_en) : (b.title_en || b.title_fr);
    const subs = b.submissions || [];
    return `
      <div class="bounty-card">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
          <span class="city-tag">${c.flag} ${getCityName(c, lang)} · @${escapeHtmlStr(b.sponsorName)}</span>
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="background:rgba(251,191,36,0.2);border:1px solid #fbbf24;color:#fbbf24;padding:4px 12px;border-radius:99px;font-weight:900;font-size:0.84rem;">
              🏆 +${b.reward} 🪙
            </span>
            ${isAdm ? `<button class="adm-pbtn danger" onclick="adminDeleteBounty('${b.id}')">🗑️</button>` : ''}
          </div>
        </div>
        <div style="font-weight:800;font-size:0.96rem;color:#fff;">${escapeHtmlStr(title)}</div>
        ${b.status === 'paid'
          ? `<div style="color:#10b981;font-weight:900;font-size:0.82rem;">✓ ${lang === 'fr' ? 'Remportée par' : 'Won by'} @${escapeHtmlStr(b.winnerName)} !</div>`
          : `<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
               <span style="font-size:0.76rem;color:var(--muted);">${subs.length} ${lang === 'fr' ? 'participations' : 'entries'}</span>
               <button class="btn-cyber" onclick="submitBountyClaim('${b.id}')">${t('bounty_submit_btn')}</button>
             </div>`}
        ${subs.length > 0 && b.status !== 'paid' ? `
          <div style="margin-top:6px;padding-top:8px;border-top:1px solid var(--border);display:flex;flex-direction:column;gap:6px;">
            ${subs.map((s, idx) => `
              <div style="display:flex;justify-content:space-between;align-items:center;background:rgba(255,255,255,0.04);padding:6px 10px;border-radius:10px;font-size:0.78rem;">
                <span><b>@${escapeHtmlStr(s.userName)}</b>: ${escapeHtmlStr(s.note)}</span>
                ${isAdm ? `<button class="adm-pbtn gold" onclick="approveBountyWinner('${b.id}', ${idx})">${t('bounty_approve_btn')}</button>` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

function openCreateBountyPrompt() {
  const lang = REMO_I18N.getLang();
  const isAdm = REMO_STORE.isAdminUnlocked();
  const u = REMO_STORE.getCurrentUser() || REMO_STORE.ensureGuestOrCitizen('Creator', '', 'montreal');
  const title = prompt(lang === 'fr' ? 'Décrivez la mission (Photo, Vidéo 60s ou Code HTML) :' : 'Describe the mission (Photo, 60s Video or HTML App):');
  if (!title || !title.trim()) return;
  const reward = Math.max(50, Number(prompt(lang === 'fr' ? 'Récompense en Pièces REMO :' : 'Prize in REMO Coins:', '300') || 0));

  if (!isAdm && !REMO_STORE.addCoins(u.uid, -reward, 15)) {
    remoToast(lang === 'fr' ? 'Pièces REMO insuffisantes !' : 'Not enough REMO Coins!');
    return;
  }

  REMO_STORE.state.bounties.unshift({
    id: 'bty_' + Date.now(),
    cityId: u.homeCity || 'montreal',
    sponsorName: isAdm ? '👑 REMO Treasury' : u.name,
    format: 'any',
    reward,
    title_en: title.trim(),
    title_fr: title.trim(),
    status: 'open',
    submissions: [],
    winnerName: '',
    createdAt: Date.now()
  });
  REMO_STORE.save(true, 'bounty_new');
  renderBountiesView();
  remoToast(lang === 'fr' ? `🎯 Mission (+${reward} 🪙) publiée !` : `🎯 Bounty (+${reward} 🪙) launched!`, 'fanfare');
}

function submitBountyClaim(bountyId) {
  const lang = REMO_I18N.getLang();
  const u = REMO_STORE.getCurrentUser() || REMO_STORE.ensureGuestOrCitizen('Creator', '', 'montreal');
  const b = (REMO_STORE.state.bounties || []).find((x) => x.id === bountyId);
  if (!b || b.status === 'paid') return;
  const note = prompt(lang === 'fr' ? 'Lien ou titre de votre post (Photo/Vidéo/HTML) pour cette mission :' : 'Title or #hashtag of your Photo/60s Video/HTML post for this bounty:');
  if (!note || !note.trim()) return;
  b.submissions = b.submissions || [];
  b.submissions.push({ uid: u.uid, userName: u.name, note: note.trim(), ts: Date.now() });
  REMO_STORE.addCoins(u.uid, 10, 10);
  REMO_STORE.save(true, 'bounty_sub');
  renderBountiesView();
  remoToast(lang === 'fr' ? '🎯 Participation envoyée (+10 🪙 bonus) !' : '🎯 Entry submitted (+10 🪙 bonus)!', 'coin');
}

function approveBountyWinner(bountyId, subIdx) {
  if (!REMO_STORE.isAdminUnlocked()) return;
  const b = (REMO_STORE.state.bounties || []).find((x) => x.id === bountyId);
  if (!b || !b.submissions || !b.submissions[subIdx]) return;
  const win = b.submissions[subIdx];
  b.status = 'paid';
  b.winnerName = win.userName;
  REMO_STORE.adminAdjustUserCoins(win.uid, 'add', b.reward, `🏆 Bounty Winner: ${b.title_en}`);
  REMO_STORE.addCityScore(b.cityId, 60);
  REMO_STORE.save(true, 'bounty_paid');
  spawnRemoCoinsFX(15);
  renderBountiesView();
  remoToast(`🏆 Paid +${b.reward} 🪙 to @${win.userName}!`, 'fanfare');
}

function adminDeleteBounty(bountyId) {
  if (!REMO_STORE.isAdminUnlocked()) return;
  REMO_STORE.state.bounties = (REMO_STORE.state.bounties || []).filter((b) => b.id !== bountyId);
  REMO_STORE.save(true, 'bounty_del');
  renderBountiesView();
}

/* ── 📈 REMO WORLD CITY STOCK EXCHANGE™ ($MTL, $KIV, $PAR, $TYO...) ── */
function renderCityExchangeView() {
  const grid = document.getElementById('cityExchangeGrid');
  if (!grid) return;
  const lang = REMO_I18N.getLang();
  const u = REMO_STORE.getCurrentUser();
  const isAdm = REMO_STORE.isAdminUnlocked();
  const portfolio = (u && REMO_STORE.state.cityPortfolios && REMO_STORE.state.cityPortfolios[u.uid]) || {};

  grid.innerHTML = getRemoCities().slice(0, 16).map((c) => {
    const price = REMO_STORE.getCitySharePrice(c.id);
    const owned = portfolio[c.id] || 0;
    const mayor = REMO_STORE.getCityMayor(c.id);
    return `
      <div class="stock-card">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <b style="font-size:0.95rem;">${c.flag} $${c.code}</b>
          <span style="color:#10b981;font-weight:900;font-size:0.9rem;">🪙 ${price}</span>
        </div>
        <div style="font-size:0.78rem;color:#cbd5e1;font-weight:700;">${getCityName(c, lang)}</div>
        <div style="font-size:0.7rem;color:var(--muted);">
          ${mayor ? `👑 ${t('mayor_badge')}: @${escapeHtmlStr(mayor.name)}` : '—'} · Owned: <b style="color:#fbbf24;">${owned}</b>
        </div>
        <div style="display:flex;gap:6px;margin-top:4px;">
          <button class="pact-btn" style="flex:1;justify-content:center;border-color:#10b981;color:#34d399;" onclick="buyCityStockShare('${c.id}')">${t('exchange_buy_btn')}</button>
          <button class="pact-btn" style="flex:1;justify-content:center;" onclick="sellCityStockShare('${c.id}')">${t('exchange_sell_btn')}</button>
        </div>
        ${isAdm ? `<button class="adm-pbtn gold" style="width:100%;margin-top:4px;" onclick="adminBoomCityStock('${c.id}')">🚀 Admin Bull Boom (+500 PTS)</button>` : ''}
      </div>
    `;
  }).join('');
}

function buyCityStockShare(cityId) {
  const lang = REMO_I18N.getLang();
  const u = REMO_STORE.getCurrentUser() || REMO_STORE.ensureGuestOrCitizen('Investor', '', cityId);
  const price = REMO_STORE.getCitySharePrice(cityId);
  if (!REMO_STORE.addCoins(u.uid, -price, 0)) {
    remoToast(lang === 'fr' ? `Il vous faut ${price} 🪙 pour acheter 1 action !` : `Need ${price} 🪙 to buy 1 share!`);
    return;
  }
  REMO_STORE.state.cityPortfolios = REMO_STORE.state.cityPortfolios || {};
  REMO_STORE.state.cityPortfolios[u.uid] = REMO_STORE.state.cityPortfolios[u.uid] || {};
  REMO_STORE.state.cityPortfolios[u.uid][cityId] = (REMO_STORE.state.cityPortfolios[u.uid][cityId] || 0) + 1;
  REMO_STORE.addCityScore(cityId, 35); // Buying pushes share value up!
  REMO_STORE.save(true, 'city_stock_buy');
  syncHeaderAndSidebars();
  renderCityExchangeView();
  if (typeof renderPassportView === 'function') renderPassportView();
  const c = getCityById(cityId);
  remoToast(`📈 +1 $${c.code} Share acquired!`, 'coin');
}

function sellCityStockShare(cityId) {
  const lang = REMO_I18N.getLang();
  const u = REMO_STORE.getCurrentUser();
  if (!u) { openAuthModal(); return; }
  const port = (REMO_STORE.state.cityPortfolios && REMO_STORE.state.cityPortfolios[u.uid]) || {};
  if (!port[cityId] || port[cityId] <= 0) {
    remoToast(lang === 'fr' ? 'Vous ne possédez aucune action de cette ville.' : 'You own 0 shares of this city.');
    return;
  }
  const price = REMO_STORE.getCitySharePrice(cityId);
  port[cityId] -= 1;
  REMO_STORE.creditSystemCoins(u.uid, price, 'City Stock Sale', 50000);
  REMO_STORE.save(true, 'city_stock_sell');
  spawnRemoCoinsFX(6);
  syncHeaderAndSidebars();
  renderCityExchangeView();
  if (typeof renderPassportView === 'function') renderPassportView();
  const c = getCityById(cityId);
  remoToast(`💰 Sold 1 $${c.code} Share for +${price} 🪙!`, 'coin');
}

function adminBoomCityStock(cityId) {
  if (!REMO_STORE.isAdminUnlocked()) return;
  REMO_STORE.addCityScore(cityId, 500);
  renderCityExchangeView();
  remoToast('🚀 Bull Market Boom (+500 PTS)!', 'fanfare');
}

function focusCityOnRadar(cityId) {
  if (typeof switchRemoView === 'function') switchRemoView('radar');
  setTimeout(() => {
    if (typeof teleportRadarCity === 'function') teleportRadarCity(cityId);
  }, 350);
}

window.focusCityOnRadar = focusCityOnRadar;

window.switchRemoView = switchRemoView;
window.syncHeaderAndSidebars = syncHeaderAndSidebars;
window.setFeedMode = setFeedMode;
window.setFeedVibe = setFeedVibe;
window.filterFeedByCityFromMap = filterFeedByCityFromMap;
window.renderSocialFeed = renderSocialFeed;
window.applyHoloTilt = applyHoloTilt;
window.resetHoloTilt = resetHoloTilt;
window.toggleLikePost = toggleLikePost;
window.tipPostAuthor = tipPostAuthor;
window.boostPost24h = boostPost24h;
window.adminToggleBoostPostInline = adminToggleBoostPostInline;
window.isPostBoostActive = isPostBoostActive;
window.getPostBoostBadgeHtml = getPostBoostBadgeHtml;
window.mintPostAsCityCard = mintPostAsCityCard;
window.saveBookmarkPost = saveBookmarkPost;
window.openCommentsModal = openCommentsModal;
window.submitPostComment = submitPostComment;
window.openCreatePostModal = openCreatePostModal;
window.closeCreatePostModal = closeCreatePostModal;
window.switchCreateStudioTab = switchCreateStudioTab;
window.handleStudioPhotosSelect = handleStudioPhotosSelect;
window.setStudioPhotoFilter = setStudioPhotoFilter;
window.handleStudioVideo60File = handleStudioVideo60File;
window.forceAcceptFirst60sVideo = forceAcceptFirst60sVideo;
window.toggleLiveCam60Recording = toggleLiveCam60Recording;
window.loadStudioHtmlTemplate = loadStudioHtmlTemplate;
window.handleStudioHtmlFileUpload = handleStudioHtmlFileUpload;
window.refreshStudioHtmlPreview = refreshStudioHtmlPreview;
window.handleMediaDoubleTap = handleMediaDoubleTap;
window.toggleHtmlCodeView = toggleHtmlCodeView;
window.copyPostHtmlCode = (postId) => { if (typeof sharePostLink === 'function') sharePostLink(postId); };
window.openHtmlFullscreenModal = openHtmlFullscreenModal;
window.closeHtmlFullscreenModal = closeHtmlFullscreenModal;
window.sharePostLink = sharePostLink;
window.shareFullscreenPostLink = shareFullscreenPostLink;
window.remixHtmlPost = remixHtmlPost;
window.stepPostCarousel = stepPostCarousel;
window.updateBeforeAfterSlider = updateBeforeAfterSlider;
window.voteOnPostPoll = voteOnPostPoll;
window.unlockSecretCapsule = unlockSecretCapsule;
window.reactEmojiToPost = reactEmojiToPost;
window.handleCreateMediaFile = handleCreateMediaFile;
window.toggleSparkVoiceRecord = toggleSparkVoiceRecord;
window.checkGpsForNewPost = checkGpsForNewPost;
window.publishNewRemoPost = publishNewRemoPost;
window.record1ClickCityVideoReel = record1ClickCityVideoReel;
window.openStoryUploadPrompt = openStoryUploadPrompt;
window.openStoryViewer = openStoryViewer;
window.adminDeleteStoryInline = adminDeleteStoryInline;
window.adminDeleteChatMsgInline = adminDeleteChatMsgInline;
window.selectCityChatRoom = selectCityChatRoom;
window.sendCityChatMessage = sendCityChatMessage;
window.sendDirectMessage = sendDirectMessage;
window.startWebRTCCall = startWebRTCCall;
window.endWebRTCCall = endWebRTCCall;
window.openLiveStreamModal = openLiveStreamModal;
window.openAuthModal = openAuthModal;
window.openInExternalBrowser = openInExternalBrowser;
window.submitUniversalAuth = submitUniversalAuth;
window.verifyAuthOtpCode = verifyAuthOtpCode;
window.resendAuthOtpCode = resendAuthOtpCode;
window.cancelAuthOtpStep = cancelAuthOtpStep;
window.userSelfDeleteAccountAction = userSelfDeleteAccountAction;
window.quickGoogleSignInSim = quickGoogleSignInSim;
window.userSignOutAction = userSignOutAction;
window.toggleHeaderRadio = toggleHeaderRadio;
window.openAdminQuickModal = openAdminQuickModal;
window.unlockAdminGodModeInline = unlockAdminGodModeInline;
window.lockAdminGodModeInline = lockAdminGodModeInline;
window.executeInlineAdminCoinTransfer = executeInlineAdminCoinTransfer;
/* ── 9. #8 REMO VIP BOUTIQUE (Animated Avatar Frames, Royal Titles & Real-World Perks) ── */
let currentVipShopCategory = 'all';

function filterVipShop(cat = 'all', chipEl = null) {
  currentVipShopCategory = cat;
  document.querySelectorAll('#shopCategoryChips .fchip').forEach((b) => b.classList.remove('active'));
  if (chipEl) {
    chipEl.classList.add('active');
  } else if (typeof document.querySelector === 'function') {
    const match = document.querySelector(`#shopCategoryChips .fchip[onclick*="'${cat}'"]`);
    if (match) match.classList.add('active');
  }
  renderVipShopView();
}

function renderVipShopView() {
  const grid = document.getElementById('vipShopGrid');
  if (!grid) return;
  const lang = REMO_I18N.getLang();

  try {
    const u = REMO_STORE.getCurrentUser();
    const isAdm = REMO_STORE.isAdminUnlocked() || REMO_STORE.isCurrentUserAdmin();

    const admAddBtn = document.getElementById('btnShopAdminAdd');
    if (admAddBtn) admAddBtn.style.display = isAdm ? 'inline-flex' : 'none';

    // Retrieve default shop items safely
    const defaults = (typeof getDefaultVipShopItems === 'function')
      ? getDefaultVipShopItems()
      : (typeof window.getDefaultVipShopItems === 'function'
          ? window.getDefaultVipShopItems()
          : (REMO_STORE && REMO_STORE.getDefaultVipShopItems ? REMO_STORE.getDefaultVipShopItems() : []));

    // Auto-heal shop catalog if state was unpopulated, null, or cleared
    let rawItems = Array.isArray(REMO_STORE.state.vipShopItems)
      ? REMO_STORE.state.vipShopItems.filter((it) => it && typeof it === 'object' && it.id && it.category)
      : [];

    if (rawItems.length === 0 && defaults && defaults.length > 0) {
      rawItems = defaults.slice();
      REMO_STORE.state.vipShopItems = rawItems;
      REMO_STORE.save(false, 'shop_defaults_restored');
    }

    let items = rawItems.slice();
    if (currentVipShopCategory && currentVipShopCategory !== 'all') {
      items = items.filter((it) => it && it.category === currentVipShopCategory);
    }

    if (items.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 48px 20px; color: var(--muted); background: rgba(255,255,255,0.02); border-radius: 16px; border: 1px dashed var(--border);">
          <div style="font-size: 2.4rem; margin-bottom: 10px;">🛍️</div>
          <div style="font-size: 0.95rem; font-weight: 700; color: #f8fafc; margin-bottom: 6px;">
            ${lang === 'fr' ? 'Aucun article dans cette catégorie pour le moment.' : 'No items in this category currently.'}
          </div>
          <button type="button" class="btn-cyber" style="margin-top: 10px;" onclick="filterVipShop('all')">
            ${lang === 'fr' ? '✨ Voir tous les articles' : '✨ View all items'}
          </button>
        </div>
      `;
    } else {
      grid.innerHTML = items.map((it) => {
        if (!it) return '';
        const owned = Boolean(u && Array.isArray(u.ownedShopItems) && u.ownedShopItems.includes(it.id));
        const isEquipped = Boolean(u && ((u.equippedFrame && u.equippedFrame === it.id) || (u.equippedTitleId && u.equippedTitleId === it.id)));
        const name = lang === 'fr' ? (it.name_fr || it.name_en || 'VIP Item') : (it.name_en || it.name_fr || 'VIP Item');
        const desc = lang === 'fr' ? (it.desc_fr || it.desc_en || '') : (it.desc_en || it.desc_fr || '');

        let previewHtml = `<div style="font-size:2.1rem;text-align:center;">${it.icon || '💎'}</div>`;
        if (it.category === 'frame') {
          const rawName = (u && u.name) ? String(u.name).trim() : 'Citizen';
          const ch = (rawName[0] || 'R').toUpperCase();
          previewHtml = `<div style="display:flex;justify-content:center;padding:6px 0;"><div class="avatar-circle ${it.cssClass || 'av-frame-gold_fire'}" style="width:56px;height:56px;font-size:1.35rem;">${escapeHtmlStr(ch)}</div></div>`;
        } else if (it.category === 'title') {
          const bTxt = lang === 'fr' ? (it.badge_fr || it.name_fr || it.name_en) : (it.badge_en || it.name_en || it.name_fr);
          previewHtml = `<div style="text-align:center;padding:8px 0;"><span class="royal-title-pill" style="font-size:0.78rem;padding:5px 12px;">${escapeHtmlStr(bTxt || 'VIP')}</span></div>`;
        }

        let actionBtn = '';
        if (it.category === 'perk') {
          actionBtn = `<button class="btn-cyber btn-gold" style="width:100%;justify-content:center;" onclick="buyOrEquipVipItem('${it.id}')">${t('shop_redeem_perk_btn')} (${it.price} 🪙)</button>`;
        } else if (!owned) {
          actionBtn = `<button class="btn-cyber btn-gold" style="width:100%;justify-content:center;" onclick="buyOrEquipVipItem('${it.id}')">${t('shop_buy_btn')} · 🪙 ${it.price}</button>`;
        } else if (isEquipped) {
          actionBtn = `<button class="btn-ghost" style="width:100%;justify-content:center;border-color:#10b981;color:#34d399;" onclick="buyOrEquipVipItem('${it.id}')">${t('shop_equipped_btn')}</button>`;
        } else {
          actionBtn = `<button class="btn-cyber" style="width:100%;justify-content:center;" onclick="buyOrEquipVipItem('${it.id}')">${t('shop_equip_btn')}</button>`;
        }

        return `
          <div class="shop-card">
            <div>
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                <span class="city-tag">${escapeHtmlStr((it.category || 'VIP').toUpperCase())}</span>
                <div style="display:flex;align-items:center;gap:6px;">
                  <span style="color:#fbbf24;font-weight:900;font-size:0.86rem;">🪙 ${it.price}</span>
                  ${isAdm ? `<button class="adm-pbtn danger" onclick="adminDeleteVipShopItem('${it.id}')">🗑️</button>` : ''}
                </div>
              </div>
              ${previewHtml}
              <div style="font-weight:900;font-size:0.94rem;color:#fff;margin-top:6px;">${escapeHtmlStr(name)}</div>
              <div style="font-size:0.76rem;color:var(--muted);line-height:1.4;margin-top:4px;">${escapeHtmlStr(desc)}</div>
            </div>
            <div>${actionBtn}</div>
          </div>
        `;
      }).filter(Boolean).join('');
    }

    // Render VIP Voucher Orders (User sees own tickets; Admin sees ALL citizen vouchers to fulfill!)
    const ordSec = document.getElementById('vipOrdersSection');
    const ordList = document.getElementById('vipOrdersList');
    const allOrders = (Array.isArray(REMO_STORE.state.vipOrders) ? REMO_STORE.state.vipOrders : []).filter((o) => o && typeof o === 'object');
    const visibleOrders = isAdm ? allOrders : (u ? allOrders.filter((o) => o.uid === u.uid) : []);
    if (ordSec && ordList) {
      ordSec.style.display = visibleOrders.length > 0 ? 'block' : 'none';
      ordList.innerHTML = visibleOrders.map((o) => `
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;padding:10px 12px;border-radius:12px;background:rgba(255,255,255,0.04);border:1px solid var(--border);margin-bottom:8px;font-size:0.82rem;">
          <div>
            <b style="color:#fbbf24;">${escapeHtmlStr(o.ticketCode || 'VIP-CODE')}</b> · <b>@${escapeHtmlStr(o.userName || 'Citizen')}</b> — ${escapeHtmlStr(o.itemName || 'Perk')}
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="color:${o.status === 'delivered' ? '#10b981' : '#38bdf8'};font-weight:900;">
              ${o.status === 'delivered' ? '✓ DELIVERED' : '⏳ PENDING'}
            </span>
            ${isAdm && o.status !== 'delivered' ? `<button class="adm-pbtn gold" onclick="adminMarkVipOrderDelivered('${escapeHtmlStr(o.id || '')}')">✓ Mark Delivered</button>` : ''}
          </div>
        </div>
      `).join('');
    }
  } catch (err) {
    console.error('renderVipShopView error:', err);
    if (grid) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #f87171;">
          <p>⚠️ ${lang === 'fr' ? 'Erreur lors du chargement de la Boutique VIP.' : 'Error loading VIP Boutique.'}</p>
          <button type="button" class="btn-cyber" style="margin-top: 10px;" onclick="if(window.REMO_STORE){ REMO_STORE.state.vipShopItems = (window.getDefaultVipShopItems ? window.getDefaultVipShopItems() : []).slice(); REMO_STORE.save(true); renderVipShopView(); }">
            🔄 ${lang === 'fr' ? 'Réinitialiser la Boutique' : 'Reset Boutique'}
          </button>
        </div>
      `;
    }
  }
}

function buyOrEquipVipItem(itemId) {
  const lang = REMO_I18N.getLang();
  const isAdm = REMO_STORE.isAdminUnlocked();
  const u = REMO_STORE.getCurrentUser() || REMO_STORE.ensureGuestOrCitizen('VIP Citizen', '', 'montreal');
  const it = (REMO_STORE.state.vipShopItems || []).find((x) => x.id === itemId);
  if (!it) return;

  u.ownedShopItems = u.ownedShopItems || [];

  // 1. Real-World / VIP Perks & Vouchers
  if (it.category === 'perk') {
    if (!isAdm && !REMO_STORE.addCoins(u.uid, -it.price, 25)) {
      remoToast(lang === 'fr' ? `Il vous faut ${it.price} 🪙 Pièces REMO !` : `Need ${it.price} 🪙 REMO Coins!`);
      return;
    }
    const ticketCode = 'VIP-' + Math.random().toString(36).slice(2, 7).toUpperCase();
    REMO_STORE.state.vipOrders = REMO_STORE.state.vipOrders || [];
    REMO_STORE.state.vipOrders.unshift({
      id: 'ord_' + Date.now(),
      ticketCode,
      uid: u.uid,
      userName: u.name,
      itemName: lang === 'fr' ? (it.name_fr || it.name_en) : it.name_en,
      status: 'pending',
      ts: Date.now()
    });
    if (it.id === 'perk_mythic_pack') {
      const minted = REMO_STORE.mintCardForUser(u.uid, u.homeCity || 'montreal', 'Mythic 4D', true, {
        subtitle: `VIP FOUNDER EDITION · ${ticketCode}`
      });
      inspectCardModal(minted);
    }
    REMO_STORE.save(true, 'vip_order');
    spawnRemoCoinsFX(12);
    syncHeaderAndSidebars();
    renderVipShopView();
    remoToast(
      lang === 'fr'
        ? `🎟️ Voucher ${ticketCode} activé et transmis à l’Admin !`
        : `🎟️ VIP Voucher ${ticketCode} unlocked & sent to Founder!`,
      'fanfare'
    );
    return;
  }

  // 2. Unlock Frame or Royal Title if not yet owned (Free for Admin!)
  if (!u.ownedShopItems.includes(it.id)) {
    if (!isAdm && !REMO_STORE.addCoins(u.uid, -it.price, 20)) {
      remoToast(lang === 'fr' ? `Il vous faut ${it.price} 🪙 Pièces REMO !` : `Need ${it.price} 🪙 REMO Coins!`);
      return;
    }
    u.ownedShopItems.push(it.id);
    RemoAudio.play('fanfare');
  }

  // 3. Toggle Equip / Unequip
  if (it.category === 'frame') {
    u.equippedFrame = u.equippedFrame === it.id ? '' : it.id;
  } else if (it.category === 'title') {
    u.equippedTitleId = u.equippedTitleId === it.id ? '' : it.id;
  }
  REMO_STORE.save(true, 'vip_equip');
  syncHeaderAndSidebars();
  renderVipShopView();
  remoToast(lang === 'fr' ? '✨ Style VIP mis à jour sur tout REMO !' : '✨ VIP Aura equipped across REMO!', 'coin');
}

function adminCreateVipShopItemPrompt() {
  if (!REMO_STORE.isAdminUnlocked()) return;
  const lang = REMO_I18N.getLang();
  const title = prompt(lang === 'fr' ? 'Nom du nouvel article / voucher VIP :' : 'New VIP Store Item / Real Voucher Title:');
  if (!title || !title.trim()) return;
  const price = Math.max(10, Number(prompt(lang === 'fr' ? 'Prix en Pièces REMO (🪙) :' : 'Price in REMO Coins (🪙):', '500') || 500));
  const desc = prompt(
    lang === 'fr' ? 'Description (EN/FR) :' : 'Short Description (what does the citizen receive?):',
    'Official VIP Reward curated by REMO Founder!'
  ) || '';
  const pair = REMO_TRANSLATOR.makeBilingualPair(title.trim());
  const descPair = REMO_TRANSLATOR.makeBilingualPair(desc.trim());

  REMO_STORE.state.vipShopItems.unshift({
    id: 'perk_custom_' + Date.now(),
    category: 'perk',
    icon: '🎁',
    name_en: pair.en,
    name_fr: pair.fr,
    desc_en: descPair.en,
    desc_fr: descPair.fr,
    price
  });
  REMO_STORE.save(true, 'vip_item_added');
  renderVipShopView();
  remoToast('🛍️ VIP Store Item published live!', 'fanfare');
}

function adminDeleteVipShopItem(itemId) {
  if (!REMO_STORE.isAdminUnlocked()) return;
  REMO_STORE.state.vipShopItems = (REMO_STORE.state.vipShopItems || []).filter((x) => x.id !== itemId);
  REMO_STORE.save(true, 'vip_item_del');
  renderVipShopView();
}

function adminMarkVipOrderDelivered(orderId) {
  if (!REMO_STORE.isAdminUnlocked()) return;
  const ord = (REMO_STORE.state.vipOrders || []).find((o) => o.id === orderId);
  if (!ord) return;
  ord.status = 'delivered';
  REMO_STORE.save(true, 'vip_order_delivered');
  renderVipShopView();
  remoToast(`✓ ${ord.ticketCode} marked Delivered!`);
}

/* ── 10. #10 INSTANT 1-CLICK EN ⇄ FR AUTO-TRANSLATE & VIRAL CO-PILOT STUDIO ── */
function buildPostBilingualPair(p) {
  const enRaw = (p.caption_en || '').trim().replace(/^(?:🇬🇧|🇫🇷)\s+/u, '');
  const frRaw = (p.caption_fr || '').trim().replace(/^(?:🇬🇧|🇫🇷)\s+/u, '');
  if (enRaw && frRaw && enRaw !== frRaw) {
    return { en: enRaw, fr: frRaw };
  }
  const fallback = enRaw || frRaw || (p.textCard && p.textCard.raw) || '';
  return REMO_TRANSLATOR.makeBilingualPair(fallback);
}

function togglePostAutoTranslate(postId) {
  window._openTranslatedPosts = window._openTranslatedPosts || {};
  window._openTranslatedPosts[postId] = !window._openTranslatedPosts[postId];
  RemoAudio.play('click');
  rerenderSinglePostCard(postId);
}

function copilotGenerateViralIdea() {
  const lang = REMO_I18N.getLang();
  const cityId = document.getElementById('createCitySelect')?.value || 'montreal';
  const city = getCityById(cityId);
  const enCity = city.name_en;
  const frCity = city.name_fr || city.name_en;
  const tag = `#${enCity.replace(/[^A-Za-z]/g, '')} #RemoWorld #4DCity`;

  const ideas = [
    {
      en: `${city.flag} Unbelievable night energy in ${enCity} right now! Rate this vibe from 1 to 10 🔥⚡ ${tag}`,
      fr: `${city.flag} Énergie nocturne incroyable à ${frCity} en ce moment ! Notez cette ambiance de 1 à 10 🔥⚡ ${tag}`
    },
    {
      en: `${city.flag} Only real citizens know this secret spot in ${enCity}! Who wants the exact coordinates? 💎👀 ${tag}`,
      fr: `${city.flag} Seuls les vrais citoyens connaissent ce lieu secret à ${frCity} ! Qui veut les coordonnées ? 💎👀 ${tag}`
    },
    {
      en: `${city.flag} ${enCity} vs the rest of the world tonight — drop your city flag in the comments! 🌍🏆 ${tag}`,
      fr: `${city.flag} ${frCity} face au reste du monde ce soir — mettez le drapeau de votre ville en commentaire ! 🌍🏆 ${tag}`
    },
    {
      en: `${city.flag} Golden hour magic over ${enCity}! Double-tap if your city deserves #1 in the World Cup ✨👑 ${tag}`,
      fr: `${city.flag} Magie de l’heure dorée sur ${frCity} ! Double-cliquez si votre ville mérite la place #1 ✨👑 ${tag}`
    }
  ];
  const pick = ideas[Math.floor(Math.random() * ideas.length)];
  const inp = document.getElementById('createCaptionInp');
  if (inp) inp.value = lang === 'fr' ? pick.fr : pick.en;

  const drawer = document.getElementById('bilingualCaptionDrawer');
  const enBox = document.getElementById('createCaptionEnBox');
  const frBox = document.getElementById('createCaptionFrBox');
  if (drawer && enBox && frBox) {
    drawer.style.display = 'grid';
    enBox.value = pick.en;
    frBox.value = pick.fr;
  }
  RemoAudio.play('coin');
  remoToast(lang === 'fr' ? '💡 Idée virale EN + FR générée !' : '💡 Viral EN + FR concept ready!');
}

function copilotUpgradeHypeHook() {
  const lang = REMO_I18N.getLang();
  const inp = document.getElementById('createCaptionInp');
  const cityId = document.getElementById('createCitySelect')?.value || 'montreal';
  const city = getCityById(cityId);
  const raw = (inp?.value || '').trim() || `Live moment in ${getCityName(city, lang)}`;

  const pair = REMO_TRANSLATOR.makeBilingualPair(raw);
  const enUp = `🔥 WAIT FOR IT in ${city.flag} ${city.name_en}: ${pair.en} — Drop a 🔥 if you agree! #${city.code} #RemoViral`;
  const frUp = `🔥 REGARDEZ ÇA à ${city.flag} ${city.name_fr || city.name_en} : ${pair.fr} — Mettez un 🔥 en commentaire ! #${city.code} #RemoViral`;

  if (inp) inp.value = lang === 'fr' ? frUp : enUp;
  const drawer = document.getElementById('bilingualCaptionDrawer');
  if (drawer) {
    drawer.style.display = 'grid';
    document.getElementById('createCaptionEnBox').value = enUp;
    document.getElementById('createCaptionFrBox').value = frUp;
  }
  RemoAudio.play('coin');
  remoToast(lang === 'fr' ? '🔥 Accroche virale propulsée en EN + FR !' : '🔥 Viral Hype Hook applied in EN + FR!');
}

function copilotAutoTranslateStudio() {
  const lang = REMO_I18N.getLang();
  const raw = document.getElementById('createCaptionInp')?.value.trim() || '';
  if (!raw) {
    remoToast(lang === 'fr' ? 'Écrivez d’abord votre texte ci-dessous !' : 'Write a caption first to auto-translate!');
    return;
  }
  const pair = REMO_TRANSLATOR.makeBilingualPair(raw);
  const drawer = document.getElementById('bilingualCaptionDrawer');
  if (drawer) {
    drawer.style.display = 'grid';
    document.getElementById('createCaptionEnBox').value = pair.en;
    document.getElementById('createCaptionFrBox').value = pair.fr;
  }
  RemoAudio.play('click');
  remoToast(lang === 'fr' ? '🌐 Traduction bilingue EN ⇄ FR prête !' : '🌐 Instant EN ⇄ FR translation ready!');
}

let _cityHtmlTemplateCycleIdx = 0;

function copilotGenerateCityHtmlGame(forcedGenre = '') {
  if (!REMO_STORE.isAdminUnlocked() && !REMO_STORE.isCurrentUserAdmin()) {
    remoToast(REMO_I18N.getLang() === 'fr' ? 'La génération d’animations HTML est réservée aux administrateurs.' : 'HTML interactive generation is admin only.');
    return;
  }
  const lang = REMO_I18N.getLang();
  const cityId = document.getElementById('createCitySelect')?.value || 'chisinau';
  const city = getCityById(cityId);
  switchCreateStudioTab('html');

  const tplKeys = ['fireworks', 'racer', 'globe', 'beatpad'];
  const key = forcedGenre && REMO_HTML_TEMPLATES && REMO_HTML_TEMPLATES[forcedGenre]
    ? forcedGenre
    : tplKeys[(_cityHtmlTemplateCycleIdx++) % tplKeys.length];
  const tpl = (typeof REMO_HTML_TEMPLATES !== 'undefined' && REMO_HTML_TEMPLATES[key])
    ? REMO_HTML_TEMPLATES[key]
    : null;
  if (!tpl) return;

  const titleEn = tpl.title_en || 'REMO 4D Interactive Visual';
  const titleFr = tpl.title_fr || titleEn;
  const code = String(tpl.code || '');

  const area = document.getElementById('createHtmlCodeArea');
  if (area) area.value = code;
  refreshStudioHtmlPreview();

  const enCap = `✨ Experience this ${city.flag} ${city.name_en} "${titleEn}" interactive 4D moment directly inside this post! #${city.code} #LiveHTML`;
  const frCap = `✨ Découvrez cette création interactive 4D ${city.flag} ${city.name_fr || city.name_en} « ${titleFr} » directement dans ce post ! #${city.code} #LiveHTML`;
  const inp = document.getElementById('createCaptionInp');
  if (inp) inp.value = lang === 'fr' ? frCap : enCap;
  const drawer = document.getElementById('bilingualCaptionDrawer');
  if (drawer) {
    drawer.style.display = 'grid';
    document.getElementById('createCaptionEnBox').value = enCap;
    document.getElementById('createCaptionFrBox').value = frCap;
  }
  RemoAudio.play('fanfare');
  remoToast(lang === 'fr' ? `✨ Création « ${titleFr} » (${city.flag}) prête !` : `✨ "${titleEn}" (${city.flag}) ready!`, 'fanfare');
}

/* ── 11. 🌍 USER-FOUNDED MISSING CITIES (+75 🪙 + MAYOR CROWN + CARD #0001) ── */
const KNOWN_WORLD_TOWNS = {
  balti: { country: 'Moldova', flag: '🇲🇩', lat: 47.7615, lng: 27.9289 },
  orhei: { country: 'Moldova', flag: '🇲🇩', lat: 47.3831, lng: 28.8231 },
  cahul: { country: 'Moldova', flag: '🇲🇩', lat: 45.9042, lng: 28.1993 },
  ungheni: { country: 'Moldova', flag: '🇲🇩', lat: 47.2108, lng: 27.8005 },
  soroca: { country: 'Moldova', flag: '🇲🇩', lat: 48.1566, lng: 28.2849 },
  comrat: { country: 'Moldova', flag: '🇲🇩', lat: 46.2946, lng: 28.6565 },
  tiraspol: { country: 'Moldova', flag: '🇲🇩', lat: 46.8403, lng: 29.6433 },
  hincesti: { country: 'Moldova', flag: '🇲🇩', lat: 46.8305, lng: 28.5906 },
  iasi: { country: 'Romania', flag: '🇷🇴', lat: 47.1585, lng: 27.6014 },
  cluj: { country: 'Romania', flag: '🇷🇴', lat: 46.7712, lng: 23.6236 },
  'cluj-napoca': { country: 'Romania', flag: '🇷🇴', lat: 46.7712, lng: 23.6236 },
  timisoara: { country: 'Romania', flag: '🇷🇴', lat: 45.7489, lng: 21.2087 },
  brasov: { country: 'Romania', flag: '🇷🇴', lat: 45.6427, lng: 25.5887 },
  constanta: { country: 'Romania', flag: '🇷🇴', lat: 44.1598, lng: 28.6348 },
  sibiu: { country: 'Romania', flag: '🇷🇴', lat: 45.7983, lng: 24.1256 },
  oradea: { country: 'Romania', flag: '🇷🇴', lat: 47.0465, lng: 21.9189 },
  suceava: { country: 'Romania', flag: '🇷🇴', lat: 47.6635, lng: 26.2732 },
  galati: { country: 'Romania', flag: '🇷🇴', lat: 45.4353, lng: 28.0080 },
  craiova: { country: 'Romania', flag: '🇷🇴', lat: 44.3302, lng: 23.7949 },
  quebec: { country: 'Canada', flag: '🇨🇦', lat: 46.8139, lng: -71.2080 },
  laval: { country: 'Canada', flag: '🇨🇦', lat: 45.6066, lng: -73.7124 },
  longueuil: { country: 'Canada', flag: '🇨🇦', lat: 45.5312, lng: -73.5181 },
  ottawa: { country: 'Canada', flag: '🇨🇦', lat: 45.4215, lng: -75.6972 },
  vancouver: { country: 'Canada', flag: '🇨🇦', lat: 49.2827, lng: -123.1207 },
  calgary: { country: 'Canada', flag: '🇨🇦', lat: 51.0447, lng: -114.0719 },
  lyon: { country: 'France', flag: '🇫🇷', lat: 45.7640, lng: 4.8357 },
  marseille: { country: 'France', flag: '🇫🇷', lat: 43.2965, lng: 5.3698 },
  nice: { country: 'France', flag: '🇫🇷', lat: 43.7102, lng: 7.2620 },
  bordeaux: { country: 'France', flag: '🇫🇷', lat: 44.8378, lng: -0.5792 },
  toulouse: { country: 'France', flag: '🇫🇷', lat: 43.6047, lng: 1.4442 },
  bruxelles: { country: 'Belgium', flag: '🇧🇪', lat: 50.8503, lng: 4.3517 },
  brussels: { country: 'Belgium', flag: '🇧🇪', lat: 50.8503, lng: 4.3517 },
  geneve: { country: 'Switzerland', flag: '🇨🇭', lat: 46.2044, lng: 6.1432 },
  geneva: { country: 'Switzerland', flag: '🇨🇭', lat: 46.2044, lng: 6.1432 },
  zurich: { country: 'Switzerland', flag: '🇨🇭', lat: 47.3769, lng: 8.5417 },
  vienna: { country: 'Austria', flag: '🇦🇹', lat: 48.2082, lng: 16.3738 },
  prague: { country: 'Czechia', flag: '🇨🇿', lat: 50.0755, lng: 14.4378 },
  budapest: { country: 'Hungary', flag: '🇭🇺', lat: 47.4979, lng: 19.0402 },
  warsaw: { country: 'Poland', flag: '🇵🇱', lat: 52.2297, lng: 21.0122 },
  milano: { country: 'Italy', flag: '🇮🇹', lat: 45.4642, lng: 9.1900 },
  milan: { country: 'Italy', flag: '🇮🇹', lat: 45.4642, lng: 9.1900 },
  venezia: { country: 'Italy', flag: '🇮🇹', lat: 45.4408, lng: 12.3155 },
  venice: { country: 'Italy', flag: '🇮🇹', lat: 45.4408, lng: 12.3155 },
  valencia: { country: 'Spain', flag: '🇪🇸', lat: 39.4699, lng: -0.3763 }
};

function openAddUserCityModal() {
  document.getElementById('addCityModal')?.classList.add('open');
}

function autoGuessCityCoordinates(val) {
  const norm = String(val || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  const match = KNOWN_WORLD_TOWNS[norm];
  if (match) {
    const cInp = document.getElementById('usrCityCountryInp');
    const fInp = document.getElementById('usrCityFlagInp');
    const latInp = document.getElementById('usrCityLatInp');
    const lngInp = document.getElementById('usrCityLngInp');
    if (cInp && !cInp.value) cInp.value = match.country;
    if (fInp) fInp.value = match.flag;
    if (latInp) latInp.value = match.lat;
    if (lngInp) lngInp.value = match.lng;
  }
}

function detectGpsForNewCity() {
  const lang = REMO_I18N.getLang();
  if (!navigator.geolocation) {
    remoToast(lang === 'fr' ? 'GPS non disponible sur cet appareil.' : 'GPS unavailable on this device.');
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      document.getElementById('usrCityLatInp').value = pos.coords.latitude.toFixed(4);
      document.getElementById('usrCityLngInp').value = pos.coords.longitude.toFixed(4);
      remoToast(lang === 'fr' ? '📍 Coordonnées GPS détectées !' : '📍 Exact GPS coordinates locked in!', 'coin');
    },
    () => remoToast(lang === 'fr' ? 'Autorisez le GPS ou entrez la ville manuellement.' : 'Allow GPS or keep smart coordinates.')
  );
}

function refreshAllCitySelectDropdowns(selectedCityId = '') {
  const lang = REMO_I18N.getLang();
  const cities = getRemoCities();
  ['createCitySelect', 'authHomeCitySelect'].forEach((id) => {
    const sel = document.getElementById(id);
    if (sel) {
      sel.innerHTML = cities.map((c) =>
        `<option value="${c.id}" ${c.id === selectedCityId ? 'selected' : ''}>${c.flag} ${getCityName(c, lang)}</option>`
      ).join('');
    }
  });
}

function submitUserNewCity(ev) {
  if (ev) ev.preventDefault();
  const lang = REMO_I18N.getLang();
  const rawName = (document.getElementById('usrCityNameInp')?.value || '').trim();
  const rawCountry = (document.getElementById('usrCityCountryInp')?.value || '').trim() || 'World';
  const flag = (document.getElementById('usrCityFlagInp')?.value || '🌍').trim() || '🌍';
  const lat = Number(document.getElementById('usrCityLatInp')?.value || 47.01);
  const lng = Number(document.getElementById('usrCityLngInp')?.value || 28.86);
  const themeColor = document.getElementById('usrCityColorInp')?.value || '#38bdf8';

  if (!rawName) return;

  const cleanId = rawName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
  if (!cleanId) return;

  const list = getRemoCities();
  const existing = list.find((c) => c.id === cleanId || c.name_en.toLowerCase() === rawName.toLowerCase());
  if (existing) {
    document.getElementById('addCityModal')?.classList.remove('open');
    refreshAllCitySelectDropdowns(existing.id);
    remoToast(
      lang === 'fr'
        ? `✓ ${existing.flag} ${getCityName(existing, 'fr')} existe déjà sur REMO !`
        : `✓ ${existing.flag} ${getCityName(existing, 'en')} is already on REMO!`
    );
    return;
  }

  const u = REMO_STORE.getCurrentUser() || REMO_STORE.ensureGuestOrCitizen('City Founder', '', 'montreal');
  const code = cleanId.slice(0, 3).toUpperCase().padEnd(3, 'X');

  const newCity = {
    id: cleanId,
    code,
    name_en: rawName,
    name_fr: rawName,
    country_en: rawCountry,
    country_fr: rawCountry,
    flag,
    lat,
    lng,
    element: 'neon',
    themeColor,
    themeId: Math.floor(Math.random() * 6),
    rarity: 'Mythic 4D',
    baseValue: 9200,
    stats: { culture: 90, nightlife: 88, tech: 89, gastronomy: 91 },
    tagline_en: `Founded by @${u.name} · Official REMO Hub`,
    tagline_fr: `Fondée par @${u.name} · Cité Officielle REMO`,
    desc_en: `${rawName} (${rawCountry}) — Community-founded World City on the REMO global network.`,
    desc_fr: `${rawName} (${rawCountry}) — Ville fondée par la communauté sur le réseau mondial REMO.`,
    communityAdded: true,
    foundedBy: u.name,
    foundedByUid: u.uid
  };

  list.push(newCity);
  saveRemoCities(list);

  // Reward Founder (+75 🪙), Crown First Mayor & Mint Edition #0001 Card!
  u.homeCity = newCity.id;
  if (!u.visas.includes(newCity.id)) u.visas.push(newCity.id);
  REMO_STORE.state.cityScores[newCity.id] = 1800;
  REMO_STORE.setCityMayor(newCity.id, u.uid);
  REMO_STORE.addCoins(u.uid, 75, 50);

  const founderCard = REMO_STORE.mintCardForUser(u.uid, newCity.id, 'Founder 1-of-1', true, {
    serial: '0001',
    subtitle: `CITY FOUNDER @${u.name.toUpperCase()}`
  });

  document.getElementById('addCityModal')?.classList.remove('open');
  document.getElementById('usrCityNameInp').value = '';
  spawnRemoCoinsFX(16);
  refreshAllCitySelectDropdowns(newCity.id);
  syncHeaderAndSidebars();
  if (currentRemoView === 'radar') initRemoRadarMap();
  else if (currentRemoView === 'passport') renderPassportView();
  else if (currentRemoView === 'exchange') renderCityExchangeView();
  else renderSocialFeed();

  inspectCardModal(founderCard);
  remoToast(
    lang === 'fr'
      ? `🏛️ ${flag} ${rawName} fondée ! Vous êtes Maire + Carte #0001 + 75 🪙 !`
      : `🏛️ ${flag} ${rawName} founded! You are Mayor + Card #0001 + 75 🪙!`,
    'fanfare'
  );

  // Auto-Pilot Media: asynchronously fetch real city photo + local radio stream (zero UI blocking)
  if (typeof fetchCityPhotoFromWikipedia === 'function' && typeof updateRemoCityMedia === 'function') {
    fetchCityPhotoFromWikipedia(rawName, rawCountry).then((wikiPhotoUrl) => {
      if (!wikiPhotoUrl) return;
      updateRemoCityMedia(newCity.id, { imageUrl: wikiPhotoUrl, cardImageUrl: wikiPhotoUrl });
      if (founderCard && REMO_STORE.state && Array.isArray(REMO_STORE.state.cards)) {
        const fc = REMO_STORE.state.cards.find((c) => c && c.id === founderCard.id);
        if (fc) fc.imageUrl = wikiPhotoUrl;
      }
      if (typeof REMO_STORE !== 'undefined' && typeof REMO_STORE.syncToFirestore === 'function') {
        REMO_STORE.syncToFirestore('city_media_auto', false);
      }
      if (currentRemoView === 'radar') initRemoRadarMap();
      else if (currentRemoView === 'passport') renderPassportView();
      else if (currentRemoView === 'exchange') renderCityExchangeView();
      else if (currentRemoView === 'cards' && typeof renderVaultView === 'function') renderVaultView();
      else renderSocialFeed();
    }).catch(() => {});
  }
  if (window.REMO_RADIO && typeof window.REMO_RADIO.autoDiscoverStationForCity === 'function') {
    window.REMO_RADIO.autoDiscoverStationForCity(newCity).catch(() => {});
  }
}

/* ── #4 & #5: Weather Surge Admin Trigger + Time-Capsule Watch / Unseal / X-Ray ── */
function toggleAdminCitySurgeInline() {
  if (!REMO_STORE.isAdminUnlocked()) return;
  const lang = REMO_I18N.getLang();
  const cityId = document.getElementById('admSurgeCitySelect')?.value || 'chisinau';
  const nowActive = REMO_WEATHER.toggleAdminCitySurge(cityId);
  const c = getCityById(cityId);
  syncHeaderAndSidebars();
  renderSocialFeed();
  openAdminQuickModal();
  remoToast(
    nowActive
      ? (lang === 'fr' ? `⛈️ Bonus Météo 2X ACTIVÉ pour ${c.flag} ${getCityName(c, 'fr')} !` : `⛈️ 2X Weather Surge ACTIVATED for ${c.flag} ${getCityName(c, 'en')}!`)
      : (lang === 'fr' ? `☀️ Bonus Météo 2X désactivé pour ${c.flag} ${getCityName(c, 'fr')}.` : `☀️ 2X Weather Surge turned off for ${c.flag} ${getCityName(c, 'en')}.`),
    nowActive ? 'fanfare' : 'click'
  );
}

function toggleWatchTimeCapsule(postId) {
  const lang = REMO_I18N.getLang();
  const p = (REMO_STORE.state.posts || []).find((x) => x.id === postId);
  if (!p) return;
  const u = REMO_STORE.getCurrentUser() || REMO_STORE.ensureGuestOrCitizen('Citizen', '', p.cityId || 'montreal');
  p.capsuleWatchers = Array.isArray(p.capsuleWatchers) ? p.capsuleWatchers : [];
  if (!p.capsuleWatchers.includes(u.uid)) {
    p.capsuleWatchers.push(u.uid);
    REMO_STORE.addCoins(u.uid, 5, 5);
    spawnRemoCoinsFX(5);
    remoToast(
      lang === 'fr' ? '🔔 Alerte activée (+5 🪙) ! Ouverture automatique à 00:00 !' : '🔔 Countdown alert set (+5 🪙)! Auto-unseals at 00:00!',
      'coin'
    );
  } else {
    p.capsuleWatchers = p.capsuleWatchers.filter((id) => id !== u.uid);
    RemoAudio.play('click');
  }
  REMO_STORE.save(true, 'watch_capsule');
  syncHeaderAndSidebars();
  renderSocialFeed();
}

function adminUnsealCapsuleNow(postId) {
  if (!REMO_STORE.isAdminUnlocked()) return;
  const lang = REMO_I18N.getLang();
  const p = (REMO_STORE.state.posts || []).find((x) => x.id === postId);
  if (!p) return;
  p.unlockAt = Date.now() - 1000;
  p.wasTimeCapsule = true;
  window._announcedUnsealedCapsules[postId] = true;
  REMO_STORE.save(true, 'admin_unseal_capsule');
  spawnRemoCoinsFX(16);
  renderSocialFeed();
  const c = getCityById(p.cityId);
  remoToast(t('capsule_unsealed_toast', { city: getCityName(c, lang) }), 'fanfare');
}

function adminToggleCapsuleXray(postId) {
  if (!REMO_STORE.isAdminUnlocked()) return;
  window._adminXrayCapsules = window._adminXrayCapsules || {};
  window._adminXrayCapsules[postId] = !window._adminXrayCapsules[postId];
  RemoAudio.play('click');
  renderSocialFeed();
}

/* ── #1 Split-Screen City Duet Triggers ── */
function startCityDuetFromPost(postId) {
  const p = (REMO_STORE.state.posts || []).find((x) => x.id === postId);
  if (!p) return;
  const lang = REMO_I18N.getLang();
  const origCity = getCityById(p.cityId);

  openCreatePostModal(`#CityDuet `);
  pendingDuetParent = {
    postId: p.id,
    uid: p.uid || '',
    authorName: p.authorName || 'Creator',
    cityId: p.cityId,
    mediaType: p.mediaType === 'city_duet' ? 'city_art' : p.mediaType,
    mediaUrl: p.mediaUrl || (Array.isArray(p.mediaUrls) && p.mediaUrls[0]) || '',
    htmlCode: p.htmlCode || '',
    textCard: p.textCard || null,
    visualHeadline: p.visualHeadline || getCityName(origCity, 'en').toUpperCase()
  };

  const banner = document.getElementById('createDuetBanner');
  const txt = document.getElementById('createDuetBannerText');
  if (banner && txt) {
    banner.style.display = 'flex';
    txt.textContent = t('duet_banner_lbl', {
      author: p.authorName,
      city: `${origCity.flag} ${getCityName(origCity, lang)}`
    });
  }
}

function cancelPendingCityDuet() {
  pendingDuetParent = null;
  const banner = document.getElementById('createDuetBanner');
  if (banner) banner.style.display = 'none';
}

/* ── #8 DIGITAL MESSAGE IN A BOTTLE ACROSS WORLD CITIES™ ── */
function computeHaversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return Math.max(120, Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))));
}

function renderWorldBottlesView() {
  const box = document.getElementById('bottlesListContainer');
  const admBtn = document.getElementById('btnAdminGoldenBottle');
  if (!box) return;

  const lang = REMO_I18N.getLang();
  const isAdm = REMO_STORE.isAdminUnlocked();
  const u = REMO_STORE.getCurrentUser();
  if (admBtn) admBtn.style.display = isAdm ? 'inline-flex' : 'none';

  const bottles = (REMO_STORE.state.worldBottles || []).slice().sort((a, b) => b.createdAt - a.createdAt);
  box.innerHTML = bottles.map((b) => {
    const cFrom = getCityById(b.fromCityId);
    const cTo = getCityById(b.toCityId);
    const msg = lang === 'fr' ? (b.text_fr || b.text_en) : (b.text_en || b.text_fr);
    const canReply = !b.replyText && (!u || b.fromUid !== u.uid);

    return `
      <div class="bottle-card ${b.isGoldenAdmin ? 'golden' : ''}" id="bottleCard_${b.id}">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:6px;">
          <div style="font-weight:900;font-size:0.86rem;color:${b.isGoldenAdmin ? '#fde047' : '#38bdf8'};">
            ${b.isGoldenAdmin ? '👑' : '🍾'} ${cFrom.flag} ${escapeHtmlStr(getCityName(cFrom, lang))} 🌊 ➔ ${cTo.flag} ${escapeHtmlStr(getCityName(cTo, lang))}
            <span style="color:#94a3b8;font-size:0.74rem;font-weight:700;">(${(b.km || 4200).toLocaleString()} km)</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;">
            ${b.bonusCoins > 0 ? `<span class="surge-mini-pill">+${b.bonusCoins} 🪙</span>` : ''}
            ${isAdm ? `<button type="button" class="adm-pbtn danger" onclick="adminDeleteBottle('${b.id}')">🗑️</button>` : ''}
          </div>
        </div>

        <div style="font-size:0.88rem;color:#f8fafc;line-height:1.42;margin-bottom:8px;">
          <b style="color:#fbbf24;cursor:pointer;" onclick="openDirectChatWithUser('${b.fromUid || ''}')">@${escapeHtmlStr(b.fromName)}:</b> "${escapeHtmlStr(msg)}"
        </div>

        ${b.replyText ? `
          <div style="padding:8px 12px;border-radius:12px;background:rgba(16,185,129,0.14);border:1px solid rgba(52,211,153,0.4);font-size:0.82rem;color:#d1fae5;">
            <b>${t('bottle_replied_lbl')}</b> — <b>@${escapeHtmlStr(b.repliedByName)}:</b> "${escapeHtmlStr(b.replyText)}"
          </div>
        ` : (canReply ? `
          <button type="button" class="btn-cyber" style="padding:6px 13px;font-size:0.78rem;" onclick="replyToWorldBottle('${b.id}')">${t('bottle_reply_btn')}</button>
        ` : `<span style="font-size:0.74rem;color:var(--muted);">🌊 ${lang === 'fr' ? 'En dérive sur l’océan REMO...' : 'Drifting across the REMO ocean...'}</span>`)}
      </div>
    `;
  }).join('');
}

function launchWorldCityBottle(isGoldenAdmin = false) {
  const lang = REMO_I18N.getLang();
  if (isGoldenAdmin && !REMO_STORE.isAdminUnlocked()) return;

  const inp = document.getElementById('bottleMsgInput');
  let rawTxt = inp ? inp.value.trim() : '';
  if (!rawTxt && isGoldenAdmin) {
    rawTxt = '👑 GOLDEN FOUNDER BOTTLE! Catch & reply to claim +200 🪙 Royal REMO Coins!';
  }
  if (!rawTxt) {
    remoToast(lang === 'fr' ? 'Écrivez un message à glisser dans la bouteille !' : 'Write a message to seal inside the bottle!');
    return;
  }

  const u = REMO_STORE.getCurrentUser() || REMO_STORE.ensureGuestOrCitizen('Ocean Explorer', '', 'montreal');
  const giftCoins = isGoldenAdmin
    ? Math.max(50, Number(prompt(lang === 'fr' ? 'Pièces Royales dans cette Bouteille d’Or :' : 'Royal Treasury Coins inside this Golden Bottle:', '200')) || 200)
    : Math.max(0, Number(document.getElementById('bottleGiftCoinsSel')?.value || 0));

  if (!isGoldenAdmin && giftCoins > 0) {
    if (!REMO_STORE.addCoins(u.uid, -giftCoins, 5)) {
      remoToast(lang === 'fr' ? 'Pièces insuffisantes pour ce cadeau !' : 'Not enough coins to attach that gift!');
      return;
    }
  }

  const fromCity = getCityById(u.homeCity || 'montreal');
  const otherCities = getRemoCities().filter((c) => c.id !== fromCity.id);
  const destCity = otherCities[Math.floor(Math.random() * otherCities.length)] || getCityById('chisinau');
  const km = computeHaversineKm(fromCity.lat, fromCity.lng, destCity.lat, destCity.lng);
  const pair = REMO_TRANSLATOR.makeBilingualPair(rawTxt);

  REMO_STORE.state.worldBottles = REMO_STORE.state.worldBottles || [];
  REMO_STORE.state.worldBottles.unshift({
    id: 'btl_' + Date.now(),
    fromUid: u.uid,
    fromName: u.name,
    fromCityId: fromCity.id,
    toCityId: destCity.id,
    km,
    text_en: pair.en || rawTxt,
    text_fr: pair.fr || rawTxt,
    bonusCoins: giftCoins,
    isGoldenAdmin: !!isGoldenAdmin,
    caughtByUid: '',
    repliedByName: '',
    replyText: '',
    createdAt: Date.now()
  });

  if (!isGoldenAdmin) REMO_STORE.addCoins(u.uid, 10, 10);
  if (inp) inp.value = '';
  RemoAudio.play('splash');
  spawnRemoCoinsFX(8);
  REMO_STORE.save(true, 'bottle_launched');
  syncHeaderAndSidebars();
  renderWorldBottlesView();
  remoToast(
    lang === 'fr'
      ? `🍾 Bouteille lancée sur ${km.toLocaleString()} km vers ${destCity.flag} ${getCityName(destCity, 'fr')} !`
      : `🍾 Bottle launched ${km.toLocaleString()} km to ${destCity.flag} ${getCityName(destCity, 'en')}!`,
    'fanfare'
  );
}

function catchRandomWorldBottle() {
  const lang = REMO_I18N.getLang();
  const u = REMO_STORE.getCurrentUser() || REMO_STORE.ensureGuestOrCitizen('Ocean Explorer', '', 'montreal');
  const available = (REMO_STORE.state.worldBottles || []).filter((b) => !b.replyText && b.fromUid !== u.uid);
  if (available.length === 0) {
    remoToast(lang === 'fr' ? 'Toutes les bouteilles actuelles ont déjà trouvé preneur ! Lancez la vôtre !' : 'All floating bottles have been caught! Toss a new one!');
    return;
  }
  const caught = available[Math.floor(Math.random() * available.length)];
  RemoAudio.play('splash');
  const el = document.getElementById('bottleCard_' + caught.id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.style.boxShadow = '0 0 28px rgba(56, 189, 248, 0.85)';
  }
  replyToWorldBottle(caught.id);
}

function replyToWorldBottle(bottleId) {
  const lang = REMO_I18N.getLang();
  const b = (REMO_STORE.state.worldBottles || []).find((x) => x.id === bottleId);
  if (!b || b.replyText) return;

  const u = REMO_STORE.getCurrentUser() || REMO_STORE.ensureGuestOrCitizen('Citizen', '', 'montreal');
  const cFrom = getCityById(b.fromCityId);
  const reply = prompt(
    lang === 'fr'
      ? `🍾 Bouteille reçue de @${b.fromName} (${cFrom.flag} ${getCityName(cFrom, 'fr')}) :\n"${b.text_fr || b.text_en}"\n\nÉcrivez votre réponse pour créer un Pont Inter-Villes (+25 🪙) :`
      : `🍾 Bottle caught from @${b.fromName} (${cFrom.flag} ${getCityName(cFrom, 'en')}):\n"${b.text_en || b.text_fr}"\n\nWrite your reply to forge a City Bridge (+25 🪙):`
  );
  if (!reply || !reply.trim()) return;

  b.caughtByUid = u.uid;
  b.repliedByName = u.name;
  b.replyText = reply.trim();

  const totalPrize = 25 + Number(b.bonusCoins || 0);
  REMO_STORE.creditSystemCoins(u.uid, totalPrize, 'Bottle Reply Prize', 5000);
  if (b.fromUid) REMO_STORE.creditSystemCoins(b.fromUid, 25, 'Bottle Bridge Bonus', 5000);

  // Stamp sender's city visa in catcher's Passport & link in 1-on-1 DMs!
  u.visas = Array.isArray(u.visas) ? u.visas : [];
  if (!u.visas.includes(b.fromCityId)) u.visas.push(b.fromCityId);

  REMO_STORE.state.directMessages.push({
    id: 'dm_btl_' + Date.now(),
    fromUid: u.uid,
    fromName: u.name,
    toUid: b.fromUid || 'u_elena_kiv',
    text: `🌉 [Bottle Bridge ${cFrom.flag}] ${b.replyText}`,
    ts: Date.now()
  });

  REMO_STORE.save(true, 'bottle_reply');
  spawnRemoCoinsFX(15);
  syncHeaderAndSidebars();
  renderWorldBottlesView();
  remoToast(
    lang === 'fr'
      ? `🌉 Pont créé avec @${b.fromName} (${cFrom.flag}) ! +${totalPrize} 🪙 & Visa ajouté !`
      : `🌉 Bridge forged with @${b.fromName} (${cFrom.flag})! +${totalPrize} 🪙 & Visa stamped!`,
    'fanfare'
  );
}

function adminDeleteBottle(bottleId) {
  if (!REMO_STORE.isAdminUnlocked()) return;
  REMO_STORE.state.worldBottles = (REMO_STORE.state.worldBottles || []).filter((b) => b.id !== bottleId);
  REMO_STORE.save(true, 'bottle_del');
  renderWorldBottlesView();
}

window.quickCreateNewCitizenByAdmin = quickCreateNewCitizenByAdmin;
window.toggleHappyHour2xInline = toggleHappyHour2xInline;
window.toggleAdminCitySurgeInline = toggleAdminCitySurgeInline;
window.toggleWatchTimeCapsule = toggleWatchTimeCapsule;
window.adminUnsealCapsuleNow = adminUnsealCapsuleNow;
window.adminToggleCapsuleXray = adminToggleCapsuleXray;
window.startCityDuetFromPost = startCityDuetFromPost;
window.cancelPendingCityDuet = cancelPendingCityDuet;
window.toggleCommentVoiceRecord = toggleCommentVoiceRecord;
window.inspectCommentFlexCard = inspectCommentFlexCard;
window.startCityWalkieTalkie = startCityWalkieTalkie;
window.stopCityWalkieTalkie = stopCityWalkieTalkie;
window.openDirectChatWithUser = openDirectChatWithUser;
window.selectDmPartner = selectDmPartner;
window.toggleDmVoiceNote = toggleDmVoiceNote;
window.sendDmCoinEnvelopePrompt = sendDmCoinEnvelopePrompt;
window.claimDmCoinEnvelope = claimDmCoinEnvelope;
window.sendDmCardTradePrompt = sendDmCardTradePrompt;
window.acceptDmCardTradeOffer = acceptDmCardTradeOffer;
window.adminDeleteDmInline = adminDeleteDmInline;
window.renderWorldBottlesView = renderWorldBottlesView;
window.launchWorldCityBottle = launchWorldCityBottle;
window.catchRandomWorldBottle = catchRandomWorldBottle;
window.replyToWorldBottle = replyToWorldBottle;
window.adminDeleteBottle = adminDeleteBottle;
window.triggerInlineCoinRain = triggerInlineCoinRain;
window.createPromoCodeInline = createPromoCodeInline;
window.adminDeletePostInline = adminDeletePostInline;
window.userDeleteOwnPost = userDeleteOwnPost;
window.adminPinPostInline = adminPinPostInline;
window.adminAwardFounderCrown = adminAwardFounderCrown;
window.adminEditPostInline = adminEditPostInline;
window.adminDeleteCommentInline = adminDeleteCommentInline;
window.redeemPromoCodeInput = redeemPromoCodeInput;
window.renderBountiesView = renderBountiesView;
window.openCreateBountyPrompt = openCreateBountyPrompt;
window.submitBountyClaim = submitBountyClaim;
window.approveBountyWinner = approveBountyWinner;
window.adminDeleteBounty = adminDeleteBounty;
window.renderCityExchangeView = renderCityExchangeView;
window.buyCityStockShare = buyCityStockShare;
window.sellCityStockShare = sellCityStockShare;
window.adminBoomCityStock = adminBoomCityStock;
window.filterVipShop = filterVipShop;
window.renderVipShopView = renderVipShopView;
window.buyOrEquipVipItem = buyOrEquipVipItem;
window.adminCreateVipShopItemPrompt = adminCreateVipShopItemPrompt;
window.adminDeleteVipShopItem = adminDeleteVipShopItem;
window.adminMarkVipOrderDelivered = adminMarkVipOrderDelivered;
window.togglePostAutoTranslate = togglePostAutoTranslate;
window.copilotGenerateViralIdea = copilotGenerateViralIdea;
window.copilotUpgradeHypeHook = copilotUpgradeHypeHook;
window.copilotAutoTranslateStudio = copilotAutoTranslateStudio;
window.copilotGenerateCityHtmlGame = copilotGenerateCityHtmlGame;
window.openAddUserCityModal = openAddUserCityModal;
window.autoGuessCityCoordinates = autoGuessCityCoordinates;
window.detectGpsForNewCity = detectGpsForNewCity;
window.submitUserNewCity = submitUserNewCity;

/* ════════════════════════════════════════════════════════════════════
   🪙 SOVEREIGN REMO 3D COIN ROTATING SHOWCASE ENGINE
   ════════════════════════════════════════════════════════════════════ */
let coin3DAutoSpinActive = true;
let coin3DCurrentRotY = 0;
let coin3DCurrentRotX = 8;
let coin3DDragStartX = 0;
let coin3DDragStartY = 0;
let coin3DIsDragging = false;
let coin3DAnimFrameId = null;
let currentCoin3DAlloy = 'genesis';

function setRemoCoin3DAlloy(alloyId) {
  const disc = document.getElementById('coin3DDisc');
  const stage = document.getElementById('coin3DStage');
  if (!disc) return;

  const validAlloys = ['genesis', 'platinum', 'obsidian', 'urban'];
  const alloy = validAlloys.includes(alloyId) ? alloyId : 'genesis';
  currentCoin3DAlloy = alloy;

  // Remove existing alloy classes & add new
  validAlloys.forEach((a) => disc.classList.remove('alloy-' + a));
  disc.classList.add('alloy-' + alloy);

  // Update pills active state
  validAlloys.forEach((a) => {
    const btn = document.getElementById('coinAlloyBtn_' + a);
    if (btn) btn.classList.toggle('active', a === alloy);
  });

  // Update SVG text gradient stops for dynamic engraving
  const cfg = (typeof REMO_STORE !== 'undefined' && REMO_STORE.getAlloyConfig) 
    ? REMO_STORE.getAlloyConfig(alloy) 
    : null;

  if (cfg) {
    const gradEl = document.getElementById('goldRelief');
    if (gradEl && cfg.goldGrad) {
      gradEl.innerHTML = `
        <stop offset="0%" stop-color="${cfg.goldGrad[0]}" />
        <stop offset="25%" stop-color="${cfg.goldGrad[1]}" />
        <stop offset="60%" stop-color="${cfg.goldGrad[2]}" />
        <stop offset="90%" stop-color="${cfg.goldGrad[3]}" />
        <stop offset="100%" stop-color="${cfg.goldGrad[4]}" />
      `;
    }
    if (stage) {
      stage.style.filter = `drop-shadow(0 22px 42px rgba(0, 0, 0, 0.95)) drop-shadow(0 0 35px ${cfg.glow})`;
    }
    RemoAudio.play(cfg.sound || 'goldchime');
  }
}

function setRemoCoin3DSerial(serial, isSystem = false) {
  const isAdmin = typeof REMO_STORE !== 'undefined' && REMO_STORE.isCurrentUserAdmin();
  if (!isAdmin && !isSystem) {
    // Only Admin (andart1174@gmail.com) is authorized to modify REMO Coin serial numbers
    return;
  }
  const sStr = String(serial || '0001').trim();
  const clean = sStr.startsWith('#') ? sStr.slice(1) : sStr;
  const path = document.getElementById('coin3DSerialTextPath');
  if (path) {
    path.textContent = `SERIAL № ${clean} • 100% VERIFIED`;
  }
  const inp = document.getElementById('coin3DSerialInp');
  if (inp && inp.value !== clean) {
    inp.value = clean;
  }
}

function openRemoCoin3DModal(forcedSerial, forcedAlloy) {
  const modal = document.getElementById('remoCoin3DModal');
  if (!modal) return;

  const serials = (REMO_STORE.state && REMO_STORE.state.serializedCoins) || [];
  const foundCoin = forcedSerial ? serials.find((c) => c.serial === forcedSerial) : (serials.length ? serials[0] : null);
  const latestSerial = forcedSerial || (foundCoin ? foundCoin.serial : '0001');
  const targetAlloy = forcedAlloy || (foundCoin ? foundCoin.alloy : 'genesis') || 'genesis';

  setRemoCoin3DSerial(latestSerial, true);
  setRemoCoin3DAlloy(targetAlloy);

  const inp = document.getElementById('coin3DSerialInp');
  const isAdmin = typeof REMO_STORE !== 'undefined' && REMO_STORE.isCurrentUserAdmin();
  if (inp) {
    inp.readOnly = !isAdmin;
    inp.style.pointerEvents = isAdmin ? 'auto' : 'none';
    inp.style.cursor = isAdmin ? 'text' : 'not-allowed';
    inp.style.opacity = isAdmin ? '1' : '0.9';
    inp.title = isAdmin
      ? 'Éditer le Serial (Admin Privilège)'
      : 'Numéro de série certifié 100% Vérifié (Réservé Admin)';
  }

  modal.classList.add('open');
  initRemoCoin3DStage();
}

function closeRemoCoin3DModal() {
  const modal = document.getElementById('remoCoin3DModal');
  if (modal) modal.classList.remove('open');
  if (coin3DAnimFrameId) {
    cancelAnimationFrame(coin3DAnimFrameId);
    coin3DAnimFrameId = null;
  }
}

function flipRemoCoin3D() {
  coin3DAutoSpinActive = false;
  coin3DCurrentRotY += 180;
  applyRemoCoin3DTransform();
  const cfg = (typeof REMO_STORE !== 'undefined' && REMO_STORE.getAlloyConfig) 
    ? REMO_STORE.getAlloyConfig(currentCoin3DAlloy) 
    : null;
  RemoAudio.play(cfg ? cfg.sound : 'goldchime');
  setTimeout(() => { coin3DAutoSpinActive = true; }, 1200);
}

function ringRemoCoinChime() {
  const cfg = (typeof REMO_STORE !== 'undefined' && REMO_STORE.getAlloyConfig) 
    ? REMO_STORE.getAlloyConfig(currentCoin3DAlloy) 
    : null;
  RemoAudio.play(cfg ? cfg.sound : 'goldchime');
  const stage = document.getElementById('coin3DStage');
  if (stage) {
    const glow = cfg ? cfg.glow : 'rgba(251, 191, 36, 0.7)';
    stage.style.filter = `drop-shadow(0 0 50px ${glow}) drop-shadow(0 20px 40px rgba(0,0,0,0.95))`;
    setTimeout(() => {
      stage.style.filter = `drop-shadow(0 22px 42px rgba(0, 0, 0, 0.95)) drop-shadow(0 0 30px ${glow})`;
    }, 450);
  }
}

function applyRemoCoin3DTransform() {
  const disc = document.getElementById('coin3DDisc');
  if (!disc) return;
  disc.style.transform = `rotateX(${coin3DCurrentRotX}deg) rotateY(${coin3DCurrentRotY}deg)`;

  // Normalized rotation around Y (0 to 360)
  const normY = ((coin3DCurrentRotY % 360) + 360) % 360;
  // Between 90 and 270 degrees, the reverse / back face is facing the camera
  const isBack = normY > 90 && normY < 270;
  const frontFace = disc.querySelector('.coin-3d-face.front');
  const backFace = disc.querySelector('.coin-3d-face.back');

  if (frontFace && backFace) {
    if (isBack) {
      frontFace.style.visibility = 'hidden';
      backFace.style.visibility = 'visible';
      backFace.style.zIndex = '10';
      frontFace.style.zIndex = '1';
    } else {
      frontFace.style.visibility = 'visible';
      backFace.style.visibility = 'hidden';
      frontFace.style.zIndex = '10';
      backFace.style.zIndex = '1';
    }
  }
}

function initRemoCoin3DStage() {
  const stage = document.getElementById('coin3DStage');
  const disc = document.getElementById('coin3DDisc');
  if (!stage || !disc) return;

  if (coin3DAnimFrameId) cancelAnimationFrame(coin3DAnimFrameId);

  // Auto-spin loop
  function spinLoop() {
    if (coin3DAutoSpinActive && !coin3DIsDragging) {
      coin3DCurrentRotY = (coin3DCurrentRotY + 0.75) % 360;
      applyRemoCoin3DTransform();
    }
    const modal = document.getElementById('remoCoin3DModal');
    if (modal && modal.classList.contains('open')) {
      coin3DAnimFrameId = requestAnimationFrame(spinLoop);
    }
  }
  coin3DAnimFrameId = requestAnimationFrame(spinLoop);

  // Drag interaction
  if (!stage._hasCoinDragListener) {
    stage._hasCoinDragListener = true;

    const onPointerDown = (e) => {
      coin3DIsDragging = true;
      coin3DAutoSpinActive = false;
      coin3DDragStartX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      coin3DDragStartY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
    };

    const onPointerMove = (e) => {
      if (!coin3DIsDragging) return;
      const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
      const deltaX = clientX - coin3DDragStartX;
      const deltaY = clientY - coin3DDragStartY;
      coin3DCurrentRotY += deltaX * 0.9;
      coin3DCurrentRotX = Math.max(-45, Math.min(45, coin3DCurrentRotX - deltaY * 0.4));
      coin3DDragStartX = clientX;
      coin3DDragStartY = clientY;
      applyRemoCoin3DTransform();
    };

    const onPointerUp = () => {
      if (!coin3DIsDragging) return;
      coin3DIsDragging = false;
      setTimeout(() => { coin3DAutoSpinActive = true; }, 1500);
    };

    stage.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    stage.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);
  }
}

window.openRemoCoin3DModal = openRemoCoin3DModal;
window.closeRemoCoin3DModal = closeRemoCoin3DModal;
window.flipRemoCoin3D = flipRemoCoin3D;
window.ringRemoCoinChime = ringRemoCoinChime;
window.setRemoCoin3DSerial = setRemoCoin3DSerial;
window.setRemoCoin3DAlloy = setRemoCoin3DAlloy;

/* ══════════════════════════════════════════════════════════════════════
   🌐 HOLOGRAPHIC ONBOARDING WELCOME SPLASH SCREEN (3-SECOND VIRAL POP)
   ══════════════════════════════════════════════════════════════════════ */
let welcomeSplashTimerInterval = null;
let welcomeSplashTimeoutId = null;

function showWelcomeSplashScreen(force = false) {
  const splash = document.getElementById('remoWelcomeSplash');
  if (!splash) return;

  const params = new URLSearchParams(window.location.search);
  const hasWelcomeParam = params.has('welcome') || params.has('onboarding');
  const hasRefParam = params.has('ref');
  const isDirectSeoEntry = params.get('from') === 'seo' || params.has('open') || params.has('post') || params.has('tv') || params.has('focus');
  if (!force && (params.has('post') || params.has('tv') || params.has('focus') || (isDirectSeoEntry && !hasWelcomeParam && !hasRefParam))) {
    localStorage.setItem('remo_welcome_splash_seen', '1');
    return;
  }
  const alreadySeen = localStorage.getItem('remo_welcome_splash_seen');

  if (!force && alreadySeen && !hasWelcomeParam && !hasRefParam) {
    return;
  }

  const u = REMO_STORE.getCurrentUser() || REMO_STORE.ensureGuestOrCitizen('REMO Pioneer', '', 'montreal');
  const pNumEl = document.getElementById('welcomeSplashPassportNum');
  if (pNumEl) {
    const rawNum = (u && u.passportNum) ? String(u.passportNum) : '0001';
    pNumEl.textContent = rawNum.startsWith('#') ? rawNum : `#${rawNum}`;
  }

  if (typeof REMO_I18N !== 'undefined' && REMO_I18N.applyDOM) {
    REMO_I18N.applyDOM(splash);
  }

  splash.classList.add('show');

  // Spawn introductory burst of golden coins
  if (typeof spawnRemoCoinsFX === 'function') {
    setTimeout(() => spawnRemoCoinsFX(8), 250);
  }

  // 3-second animated countdown
  let secondsLeft = 3;
  const secEl = document.getElementById('welcomeSplashSeconds');
  if (secEl) secEl.textContent = '3';

  if (welcomeSplashTimerInterval) clearInterval(welcomeSplashTimerInterval);
  if (welcomeSplashTimeoutId) clearTimeout(welcomeSplashTimeoutId);

  welcomeSplashTimerInterval = setInterval(() => {
    secondsLeft--;
    if (secEl) secEl.textContent = Math.max(0, secondsLeft);
    if (secondsLeft <= 0) {
      clearInterval(welcomeSplashTimerInterval);
      welcomeSplashTimerInterval = null;
    }
  }, 1000);

  welcomeSplashTimeoutId = setTimeout(() => {
    dismissWelcomeSplash();
  }, 3500);
}

function dismissWelcomeSplash() {
  const splash = document.getElementById('remoWelcomeSplash');
  if (welcomeSplashTimerInterval) {
    clearInterval(welcomeSplashTimerInterval);
    welcomeSplashTimerInterval = null;
  }
  if (welcomeSplashTimeoutId) {
    clearTimeout(welcomeSplashTimeoutId);
    welcomeSplashTimeoutId = null;
  }
  if (splash) {
    splash.classList.remove('show');
  }
  localStorage.setItem('remo_welcome_splash_seen', '1');

  // Celebratory coins burst on entering the 4D world
  if (typeof spawnRemoCoinsFX === 'function') {
    spawnRemoCoinsFX(10);
  }
}

window.showWelcomeSplashScreen = showWelcomeSplashScreen;
window.dismissWelcomeSplash = dismissWelcomeSplash;
window.handleTouchDoubleTap = handleTouchDoubleTap;
window.flipPost3DCard = flipPost3DCard;
window.savePostCardToAlbum = savePostCardToAlbum;
window.voteCityVersusDuel = voteCityVersusDuel;
window.claimPostFeedBounty = claimPostFeedBounty;
window.handleVersusMediaSelect = handleVersusMediaSelect;
window.toggleCustomCapsuleMinutesInp = toggleCustomCapsuleMinutesInp;



function dismissGenesisFomoBar(ev) {
  if (ev) ev.stopPropagation();
  const el = document.getElementById('genesisFomoBar');
  if (el) el.style.display = 'none';
  try {
    localStorage.setItem('remo_genesis_dismissed', '1');
  } catch (e) {}
}
window.dismissGenesisFomoBar = dismissGenesisFomoBar;


/* ══════════════════════════════════════════════════════════════
   ⛶ UNIVERSAL FULLSCREEN & LIGHTBOX CONTROLLERS (v54)
   ══════════════════════════════════════════════════════════════ */
let currentLightboxPostId = null;

function openPostFullscreenMedia(postId) {
  const p = findFeedPostById(postId);
  if (!p) {
    console.warn('Post not found for fullscreen:', postId);
    return;
  }
  if (isPostMysteryBoxLocked(p, REMO_STORE.getCurrentUser())) {
    remoToast(t('mbox_unlock_first_toast'));
    return;
  }
  if (p.mediaType === 'html_app' && p.htmlCode) {
    if (typeof openHtmlFullscreenModal === 'function') {
      openHtmlFullscreenModal(p.id);
    }
  } else if (p.mediaType === 'video') {
    const vid = document.querySelector(`#post_media_${p.id} video`);
    if (vid) {
      if (vid.requestFullscreen) vid.requestFullscreen();
      else if (vid.webkitRequestFullscreen) vid.webkitRequestFullscreen();
      else if (vid.webkitEnterFullscreen) vid.webkitEnterFullscreen();
    } else {
      openPhotoLightboxModal(p.id);
    }
  } else {
    openPhotoLightboxModal(p.id);
  }
}

function _renderLightboxTextCardDom(p, pageIdx) {
  const tcEl = document.getElementById('photoLightboxTextCard');
  if (!tcEl || !p || !p.textCard) return;
  const lang = REMO_I18N.getLang();
  const city = (typeof getCityById === 'function') ? (getCityById(p.cityId) || getCityById('montreal')) : { id: 'montreal', flag: '🌍', name_en: 'World', name_fr: 'Monde', themeColor: '#38bdf8' };
  const mysteryMasked = _isTextCardMysteryMasked(p);
  tcEl.innerHTML = renderTextCardMarkup(p.textCard, {
    context: 'lightbox',
    postId: p.id,
    city,
    authorName: p.authorName || 'Citizen',
    lang,
    pageIdx,
    mysteryMasked,
    stepCall: (d) => `stepLightboxTextCardPage('${p.id}', ${d}, event)`,
    dotCall: (i) => `setLightboxTextCardPageIndex('${p.id}', ${i}, event)`
  });
}

function stepLightboxTextCardPage(postId, delta, ev) {
  if (ev) ev.stopPropagation();
  const p = findFeedPostById(postId);
  if (!p || !p.textCard) return;
  const pages = _getTextCardSpecPages(p.textCard);
  const key = 'lb_' + postId;
  const cur = _carouselState[key] ?? (_carouselState[postId] || 0);
  _carouselState[key] = (((cur + delta) % pages.length) + pages.length) % pages.length;
  _renderLightboxTextCardDom(p, _carouselState[key]);
  RemoAudio.play('click');
}

function setLightboxTextCardPageIndex(postId, index, ev) {
  if (ev) ev.stopPropagation();
  const p = findFeedPostById(postId);
  if (!p || !p.textCard) return;
  const pages = _getTextCardSpecPages(p.textCard);
  const key = 'lb_' + postId;
  _carouselState[key] = Math.max(0, Math.min(index, pages.length - 1));
  _renderLightboxTextCardDom(p, _carouselState[key]);
  RemoAudio.play('click');
}
window.stepLightboxTextCardPage = stepLightboxTextCardPage;
window.setLightboxTextCardPageIndex = setLightboxTextCardPageIndex;

function openPhotoLightboxModal(postId) {
  const p = findFeedPostById(postId);
  if (!p) return;
  currentLightboxPostId = p.id;
  const modal = document.getElementById('photoLightboxModal');
  const img = document.getElementById('photoLightboxImg');
  const tcBox = document.getElementById('photoLightboxTextCard');
  const dlBtn = document.getElementById('photoLightboxDownloadBtn');
  const title = document.getElementById('photoLightboxTitle');
  const city = (typeof getCityById === 'function') ? (getCityById(p.cityId) || { flag: '🌍', name: 'World' }) : { flag: '🌍', name: 'World' };

  if (p.mediaType === 'text_card' && p.textCard && tcBox) {
    if (img) { img.src = ''; img.style.display = 'none'; }
    tcBox.style.display = 'block';
    if (dlBtn) dlBtn.style.display = 'inline-flex';
    const startIdx = _carouselState[p.id] || 0;
    _carouselState['lb_' + p.id] = startIdx;
    _renderLightboxTextCardDom(p, startIdx);
    initCarouselTouchSwipe(tcBox, p.id, 'stepLightboxTextCardPage');
    if (title) title.textContent = `✍️ @${p.authorName} — REMO TEXT CARD`;
    if (modal) {
      modal.classList.add('open');
      remoEnterNativeFullscreen(modal);
    }
    return;
  }

  if (p.mediaType === 'before_after' && Array.isArray(p.mediaUrls) && p.mediaUrls.length >= 2 && tcBox) {
    if (img) { img.src = ''; img.style.display = 'none'; }
    if (dlBtn) dlBtn.style.display = 'none';
    const k1 = p.mediaUrls[0], k2 = p.mediaUrls[1];
    const u1 = RemoMediaDB.resolveSyncOrPlaceholder(k1);
    const u2 = RemoMediaDB.resolveSyncOrPlaceholder(k2);
    const flt = p.photoFilter || 'flt-none';
    tcBox.style.display = 'block';
    tcBox.innerHTML = `<div class="fs-lb-ba-wrap">${renderInteractiveBeforeAfterBox({
      url1: u1,
      url2: u2,
      key1: k1,
      key2: k2,
      flt1: p.beforeFilter || flt,
      flt2: p.afterFilter || flt,
      lbl1: p.beforeLabel || t('ba_badge_before'),
      lbl2: p.afterLabel || t('ba_badge_after'),
      isLightbox: true
    })}</div>`;
    if (title) title.textContent = `${city.flag || '🪞'} @${p.authorName} — ${t('post_slider_badge')}`;
    if (modal) {
      modal.classList.add('open');
      remoEnterNativeFullscreen(modal);
    }
    return;
  }

  if (tcBox) { tcBox.style.display = 'none'; tcBox.innerHTML = ''; }
  if (dlBtn) dlBtn.style.display = 'none';
  if (img) img.style.display = 'block';

  const rawKey = p.mediaUrl || (Array.isArray(p.mediaUrls) ? p.mediaUrls[0] : '');
  let resolved = '';
  if (rawKey.startsWith('http') || rawKey.startsWith('data:') || rawKey.startsWith('blob:')) {
    resolved = rawKey;
  } else if (typeof RemoMediaDB !== 'undefined' && RemoMediaDB.resolveSyncOrPlaceholder) {
    resolved = RemoMediaDB.resolveSyncOrPlaceholder(rawKey);
  } else {
    resolved = rawKey;
  }
  if (!resolved) {
    resolved = p._cachedArt || resolveCityFallbackArtUrl(city, p.visualHeadline, p.visualSub);
  }
  if (img) img.src = resolved;
  if (title) title.textContent = `${city.flag || '📸'} @${p.authorName} — 4D VIEW`;
  if (modal) {
    modal.classList.add('open');
    remoEnterNativeFullscreen(modal);
  }
}

function closePhotoLightboxModal() {
  remoExitNativeFullscreen();
  const modal = document.getElementById('photoLightboxModal');
  if (modal) modal.classList.remove('open');
  const img = document.getElementById('photoLightboxImg');
  if (img) { img.src = ''; img.style.display = 'block'; }
  const tcBox = document.getElementById('photoLightboxTextCard');
  if (tcBox) {
    stopBeforeAfterAutoSlide(tcBox.querySelector('.ba-slider-box'));
    tcBox.style.display = 'none';
    tcBox.innerHTML = '';
  }
  const dlBtn = document.getElementById('photoLightboxDownloadBtn');
  if (dlBtn) dlBtn.style.display = 'none';
  currentLightboxPostId = null;
}

function saveCurrentLightboxCard() {
  if (currentLightboxPostId && typeof savePostCardToAlbum === 'function') {
    savePostCardToAlbum(currentLightboxPostId);
  }
}

window.openPostFullscreenMedia = openPostFullscreenMedia;
window.openPhotoLightboxModal = openPhotoLightboxModal;
window.closePhotoLightboxModal = closePhotoLightboxModal;
window.saveCurrentLightboxCard = saveCurrentLightboxCard;


/* ══════════════════════════════════════════════════════════════
   🕹️ HTML MINI-APP AUTO-FIT ENGINE (v55)
   Scales any user-coded game/app so the WHOLE layout (screen +
   gamepad buttons) is visible inside its frame — no scrollbars,
   no cut-off controls. Full-viewport canvas games stay at 1:1.
   ══════════════════════════════════════════════════════════════ */
const REMO_HTML_FIT_STYLE = '<style id="remo-fit-style">html,body{scrollbar-width:none!important;-ms-overflow-style:none!important;}html::-webkit-scrollbar,body::-webkit-scrollbar{display:none!important;}</style>';
const REMO_HTML_FIT_SCRIPT = '<script id="remo-fit-script">(function(){' +
  'function fit(){var b=document.body,d=document.documentElement;if(!b)return;' +
  'b.style.transform="";b.style.transformOrigin="";b.style.overflow="";d.style.overflow="";' +
  'try{window.scrollTo(0,0);}catch(e){}' +
  'var W=window.innerWidth,H=window.innerHeight;if(!W||!H)return;' +
  'var L=0,T=0,R=Math.max(d.scrollWidth,b.scrollWidth),B=Math.max(d.scrollHeight,b.scrollHeight);' +
  'function acc(el,depth){if(!el||el.id==="remo-fit-script")return;var tn=el.tagName;if(tn==="SCRIPT"||tn==="STYLE"||tn==="LINK"||tn==="META")return;' +
  'var cs=getComputedStyle(el);if(cs.display==="none"||cs.visibility==="hidden"||cs.position==="fixed")return;' +
  'var r=el.getBoundingClientRect();if(r.width<1||r.height<1)return;' +
  'L=Math.min(L,r.left);T=Math.min(T,r.top);R=Math.max(R,r.right);B=Math.max(B,r.bottom);' +
  'if(depth<1){for(var i=0;i<el.children.length&&i<80;i++)acc(el.children[i],depth+1);}}' +
  'for(var i=0;i<b.children.length;i++)acc(b.children[i],0);' +
  'var bw=R-L,bh=B-T;if(bw<=W+2&&bh<=H+2)return;' +
  'var s=Math.min(W/bw,H/bh);var br=b.getBoundingClientRect();' +
  'var tx=(W-bw*s)/2-br.left-s*(L-br.left);var ty=(H-bh*s)/2-br.top-s*(T-br.top);' +
  'd.style.overflow="hidden";b.style.overflow="visible";b.style.transformOrigin="0 0";' +
  'b.style.transform="translate("+tx+"px,"+ty+"px) scale("+s+")";}' +
  'var tm=null;function later(){clearTimeout(tm);tm=setTimeout(fit,120);}' +
  'if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",fit);}else{fit();}' +
  'window.addEventListener("load",function(){fit();setTimeout(fit,300);setTimeout(fit,1200);});' +
  'setTimeout(fit,60);setTimeout(fit,700);window.addEventListener("resize",later);' +
  '})();<\/script>';

function buildFittedHtmlSrcdoc(code, postId = '') {
  let html = String(code || '');
  if (!html) return html;
  if (html.includes('remo-fit-script')) return html;
  const safePid = String(postId || '').replace(/[^a-zA-Z0-9_-]/g, '');
  const scoreBridgeScript = safePid ? (
    '<script id="remo-score-bridge">(function(){' +
    'var pid="' + safePid + '",best=0;' +
    'function emit(v){var n=Math.floor(Number(v||0));if(!isFinite(n)||n<=best||n<=0||n>9999999)return;best=n;' +
    'try{parent.postMessage({type:"REMO_HTML_SCORE",postId:pid,score:best},"*");}catch(e){}}' +
    'window.remoSubmitScore=emit;' +
    'function scan(){try{' +
    'var els=document.querySelectorAll("#score,.score,[id*=score i],[class*=score i],#st,#fl,#pts,.hud");' +
    'for(var i=0;i<els.length;i++){var t=els[i].textContent||"";' +
    'var m=t.match(/(?:score|pts|points|floor|🪙|🏆)\\s*[:=·]?\\s*(\\d{1,7})/i)||t.match(/^\\s*(\\d{1,7})\\s*$/);' +
    'if(m&&m[1])emit(parseInt(m[1],10));}' +
    '}catch(e){}}' +
    'setInterval(scan,900);' +
    '})();<\/script>'
  ) : '';
  const scriptTag = REMO_HTML_FIT_SCRIPT + scoreBridgeScript;
  if (/<\/head>/i.test(html)) {
    html = html.replace(/<\/head>/i, REMO_HTML_FIT_STYLE + '</head>');
  } else {
    html = REMO_HTML_FIT_STYLE + html;
  }
  const lower = html.toLowerCase();
  const bodyEnd = lower.lastIndexOf('</body>');
  if (bodyEnd !== -1) {
    html = html.slice(0, bodyEnd) + scriptTag + html.slice(bodyEnd);
  } else {
    html = html + scriptTag;
  }
  return html;
}

function remoEnterNativeFullscreen(el) {
  try {
    if (!el || document.fullscreenElement || document.webkitFullscreenElement) return;
    const req = el.requestFullscreen || el.webkitRequestFullscreen;
    if (req) {
      const res = req.call(el);
      if (res && typeof res.catch === 'function') res.catch(() => {});
    }
  } catch (e) {}
}

function remoExitNativeFullscreen() {
  try {
    if (document.fullscreenElement && document.exitFullscreen) {
      const res = document.exitFullscreen();
      if (res && typeof res.catch === 'function') res.catch(() => {});
    } else if (document.webkitFullscreenElement && document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  } catch (e) {}
}

document.addEventListener('keydown', (ev) => {
  if (ev.key !== 'Escape') return;
  const lb = document.getElementById('photoLightboxModal');
  if (lb && lb.classList.contains('open')) closePhotoLightboxModal();
  ['notificationsModal', 'onlineDirectoryModal', 'publicProfileModal', 'dailyStreakModal'].forEach((mid) => {
    const m = document.getElementById(mid);
    if (m && m.classList.contains('open')) m.classList.remove('open');
  });
});

window.buildFittedHtmlSrcdoc = buildFittedHtmlSrcdoc;

/* ════════════════════════════════════════════════════════════════════
   🔔 REMO PULSE — SMART NOTIFICATION HUB, SIDEBAR PILLS, FLOATING BUBBLE & TAB TITLE
   ════════════════════════════════════════════════════════════════════ */
let currentNotifFilter = 'all';
let headsUpTimer = null;
let activeHeadsUpPayload = null;
const _dismissedFloatingAlertIds = new Set();
let _activeFloatingAlertPayload = null;
let _tabBlinkTimer = null;
let _tabBlinkFlip = false;
const ORIGINAL_REMO_TITLE = (typeof document !== 'undefined' && document.title) ? document.title : 'REMO World 🌐 The 4D City Metaverse & Social Network';

function formatNotifTimeAgo(ts, lang) {
  const diffSec = Math.max(0, Math.floor((Date.now() - Number(ts || Date.now())) / 1000));
  const isFr = lang === 'fr';
  if (diffSec < 45) return isFr ? 'à l’instant' : 'just now';
  const mins = Math.floor(diffSec / 60);
  if (mins < 60) return isFr ? `il y a ${mins} min` : `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return isFr ? `il y a ${hrs} h` : `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return isFr ? `il y a ${days} j` : `${days}d ago`;
}
window.formatRelativeTime = formatNotifTimeAgo;

function formatNotificationDesc(n, langOverride) {
  if (!n) return '';
  const lang = langOverride || (typeof REMO_I18N !== 'undefined' ? REMO_I18N.getLang() : 'en');
  const isFr = lang === 'fr';
  if (n.type === 'wave') {
    if (Number(n.groupedCount || 0) > 1) {
      const others = Number(n.groupedCount) - 1;
      return isFr
        ? `et ${others} autre${others > 1 ? 's' : ''} citoyen${others > 1 ? 's' : ''} vous ont salué ! 👋`
        : `and ${others} other citizen${others > 1 ? 's' : ''} waved at you! 👋`;
    }
    const cObj = getCityById(n.fromCity || 'montreal');
    const cName = cObj ? `${cObj.flag} ${getCityName(cObj, lang)}` : '';
    const kmPart = Number(n.distanceKm || 0) > 0 ? ` (${Number(n.distanceKm).toLocaleString()} km)` : '';
    if (cName) {
      return isFr
        ? `vous a salué depuis ${cName}${kmPart} ! 👋`
        : `waved at you from ${cName}${kmPart}! 👋`;
    }
    return isFr ? 'vous a envoyé un salut inter-villes ! 👋' : 'sent you a cross-city wave! 👋';
  }
  if (n.type === 'follow') {
    return isFr ? 's’est abonné à votre profil 🌟' : 'started following you 🌟';
  }
  if (n.type === 'like') {
    return isFr ? 'a aimé votre publication ❤️' : 'liked your post ❤️';
  }
  if (n.type === 'reaction') {
    const em = n.emoji || '🔥';
    return isFr ? `a réagi avec ${em} à votre publication` : `reacted with ${em} to your post`;
  }
  if (n.type === 'tip') {
    let amt = Number(n.tipAmount || 0);
    if (!amt && n.text) {
      const m = String(n.text).match(/\+?(\d+)/);
      if (m) amt = Number(m[1]);
    }
    return amt > 0
      ? (isFr ? `vous a offert un pourboire de +${amt} 🪙 !` : `tipped you +${amt} 🪙!`)
      : (isFr ? 'vous a offert des Pièces REMO 🪙 !' : 'tipped you REMO Coins 🪙!');
  }
  if (n.type === 'comment') {
    let snippet = n.rawPreview || '';
    if (!snippet && n.text) {
      const qMatch = String(n.text).match(/"([^"]+)"/);
      snippet = qMatch ? qMatch[1] : String(n.text).replace(/^(a commenté\s*:\s*|commented\s*:\s*)/i, '');
    }
    if (snippet === '🎤 Note Vocale' || snippet === '🎤 Voice') {
      snippet = isFr ? '🎤 Note vocale' : '🎤 Voice reply';
    } else if (snippet === 'Super-Commentaire' || snippet === 'Super-Comment') {
      snippet = isFr ? '💎 Super-Commentaire' : '💎 Super-Comment';
    }
    return snippet
      ? (isFr ? `a commenté : "${snippet}"` : `commented: "${snippet}"`)
      : (isFr ? 'a commenté votre publication 💬' : 'commented on your post 💬');
  }
  if (n.type === 'message') {
    const preview = n.rawPreview || n.text || '';
    return preview
      ? (isFr ? `Message privé : "${preview}"` : `Private message: "${preview}"`)
      : (isFr ? 'vous a envoyé un message privé 💌' : 'sent you a private message 💌');
  }
  if (n.type === 'mystery_solved') {
    if (n.groupedCount && n.groupedCount > 1) {
      return isFr
        ? `🕵️ +${n.groupedCount - 1} autres citoyens ont deviné votre Ville Mystère !`
        : `🕵️ +${n.groupedCount - 1} other citizens solved your Mystery City!`;
    }
    return isFr
      ? '🕵️ a deviné votre Ville Mystère du 1er coup (+2 🪙) !'
      : '🕵️ guessed your Mystery City on the 1st try (+2 🪙)!';
  }
  if (n.type === 'daily_match') {
    return isFr
      ? '🤝 Connexion Planétaire complétée ! +15 🪙 gagnés chacun !'
      : '🤝 Daily World Match unlocked! +15 🪙 earned each!';
  }
  if (n.type === 'crown_steal') {
    return (isFr ? (n.text_fr || n.text_en) : (n.text_en || n.text_fr))
      || (isFr ? '👑 Quelqu’un a volé votre Couronne Arcade ! Prenez votre revanche !' : '👑 Someone stole your Arcade Crown! Take revenge!');
  }
  if (n.type === 'spotlight_hype' || n.type === 'spotlight_gift') {
    return (isFr ? (n.text_fr || n.text_en) : (n.text_en || n.text_fr)) || n.text || '';
  }
  return (isFr ? (n.text_fr || n.text_en) : (n.text_en || n.text_fr)) || n.text || '';
}
window.formatNotificationDesc = formatNotificationDesc;

function buildUnifiedNotificationsList() {
  const u = REMO_STORE.getCurrentUser();
  const myUid = u ? u.uid : null;
  if (!myUid) return [];
  const isAdm = REMO_STORE.isCurrentUserAdmin();
  const lang = REMO_I18N.getLang();
  const localReadSet = REMO_STORE.getLocalReadNotifIds();
  const unified = [];

  // 1. Direct Messages from directMessages (single source of truth for private messages)
  const myIncomingDms = (REMO_STORE.state.directMessages || [])
    .filter((d) => isDmAddressedToMe(d, myUid, isAdm))
    .slice()
    .sort((a, b) => (b.ts || 0) - (a.ts || 0))
    .slice(0, 45);

  myIncomingDms.forEach((d) => {
    const senderObj = (REMO_STORE.state.users || []).find((usr) => usr.uid === d.fromUid);
    unified.push({
      id: 'dmnotif_' + d.id,
      dmId: d.id,
      toUid: myUid,
      fromUid: d.fromUid,
      fromName: d.fromName || (senderObj ? senderObj.name : 'Citizen'),
      fromCity: d.fromCity || (senderObj ? senderObj.homeCity : ''),
      type: 'message',
      rawPreview: formatDmSnippet(d, lang),
      text: d.text || '',
      read: Boolean(d.read),
      ts: Number(d.ts || 0)
    });
  });

  // 2. Social & System Notifications (excluding duplicate type === 'message' entries)
  const socialNotifs = (REMO_STORE.state.notifications || []).filter((n) =>
    n && n.type !== 'message' &&
    (n.toUid === myUid || (isAdm && (n.toUid === 'u_admin_founder' || !n.toUid))) &&
    n.fromUid !== myUid
  );
  socialNotifs.forEach((n) => {
    unified.push(Object.assign({}, n, {
      read: Boolean(n.read || localReadSet.has(n.id))
    }));
  });

  // 3. Backfill comments on my posts that don't yet have a social notification entry
  (REMO_STORE.state.posts || []).forEach((p) => {
    if (!p || !(p.uid === myUid || (isAdm && p.uid === 'u_admin_founder'))) return;
    (p.comments || []).forEach((c) => {
      if (!c || !c.id || !c.uid || c.uid === myUid) return;
      const synthId = 'notif_cmt_' + c.id;
      const alreadyCovered = unified.some((un) =>
        un.id === synthId ||
        (un.type === 'comment' && un.postId === p.id && un.fromUid === c.uid && Math.abs((un.ts || 0) - (c.createdAt || 0)) < 20000)
      );
      if (!alreadyCovered) {
        const snippet = c.text ? (c.text.length > 50 ? c.text.slice(0, 47) + '...' : c.text) : (c.voiceUrl ? '🎤 Voice' : 'Super-Comment');
        unified.push({
          id: synthId,
          isSynthetic: true,
          toUid: myUid,
          fromUid: c.uid,
          fromName: c.author || 'Citizen',
          fromCity: c.cityId || '',
          type: 'comment',
          postId: p.id,
          rawPreview: snippet,
          text: snippet,
          read: Boolean(localReadSet.has(synthId)),
          ts: Number(c.createdAt || p.createdAt || 0)
        });
      }
    });
  });

  unified.sort((a, b) => (b.ts || 0) - (a.ts || 0));

  // 4. Anti-Spam Shield: automatically group multiple waves or mystery_solved alerts when > 2 arrive
  let listOut = unified;
  ['wave', 'mystery_solved'].forEach((gType) => {
    const unreadGrp = listOut.filter((x) => x.type === gType && !x.read);
    if (unreadGrp.length > 2) {
      const lead = Object.assign({}, unreadGrp[0], {
        groupedCount: unreadGrp.length,
        groupedWaveIds: unreadGrp.map((w) => w.id)
      });
      const idSet = new Set(lead.groupedWaveIds);
      const compacted = [];
      let insertedLead = false;
      listOut.forEach((item) => {
        if (idSet.has(item.id)) {
          if (!insertedLead) {
            compacted.push(lead);
            insertedLead = true;
          }
        } else {
          compacted.push(item);
        }
      });
      listOut = compacted;
    }
  });

  return listOut;
}

function updateDynamicTabTitle(unreadSenders, unreadSocial, lang) {
  const totalUnread = unreadSenders.reduce((acc, s) => acc + s.count, 0) + unreadSocial.length;
  if (totalUnread <= 0) {
    if (_tabBlinkTimer) {
      clearInterval(_tabBlinkTimer);
      _tabBlinkTimer = null;
    }
    if (typeof document !== 'undefined' && document.title !== ORIGINAL_REMO_TITLE) {
      document.title = ORIGINAL_REMO_TITLE;
    }
    return;
  }

  const getAlertTitle = () => {
    const curLang = REMO_I18N.getLang();
    if (unreadSenders.length > 0) {
      const top = unreadSenders[0];
      return curLang === 'fr'
        ? `🔴 (${totalUnread}) Message de @${top.name} • REMO`
        : `🔴 (${totalUnread}) Message from @${top.name} • REMO`;
    }
    const topSoc = unreadSocial[0];
    const actor = topSoc ? topSoc.fromName : 'Citizen';
    return curLang === 'fr'
      ? `🔔 (${totalUnread}) @${actor} • REMO World`
      : `🔔 (${totalUnread}) @${actor} • REMO World`;
  };

  if (typeof document !== 'undefined' && !_tabBlinkFlip) {
    document.title = getAlertTitle();
  }

  if (!_tabBlinkTimer) {
    _tabBlinkTimer = setInterval(() => {
      if (typeof document === 'undefined') return;
      _tabBlinkFlip = !_tabBlinkFlip;
      document.title = _tabBlinkFlip ? ORIGINAL_REMO_TITLE : getAlertTitle();
    }, 2200);
  }
}

function renderSidebarUnreadSenderPills(unreadSenders, lang) {
  const containers = [
    document.getElementById('sidebarUnreadSenderPills'),
    document.getElementById('mbHubUnreadSenderPills')
  ];
  containers.forEach((el) => {
    if (!el) return;
    if (!unreadSenders || unreadSenders.length === 0) {
      el.style.display = 'none';
      el.innerHTML = '';
      return;
    }
    el.style.display = 'flex';
    el.innerHTML = unreadSenders.slice(0, 3).map((s) => `
      <button type="button" class="sidebar-sender-pill" onclick="openDirectChatWithUser('${s.uid}')">
        <span class="sp-dot"></span>
        <span class="sp-txt">
          <span class="sp-name">${s.flag} @${escapeHtmlStr(s.name)}:</span>
          <span class="sp-msg">"${escapeHtmlStr(s.snippet)}"</span>
        </span>
        <span class="sp-cnt">${s.count}</span>
      </button>
    `).join('');
  });
}

function renderFloatingAlertBubble(unreadSenders, unreadSocial, lang) {
  const bubble = document.getElementById('remoFloatingAlertBubble');
  if (!bubble) return;
  const isFr = lang === 'fr';

  // Pick top non-dismissed unread DM sender (if not currently viewing their chat)
  const candidateDm = unreadSenders.find((s) => {
    if (currentRemoView === 'messages' && activeDmPartnerUid === s.uid) return false;
    return !_dismissedFloatingAlertIds.has('dm_sender_' + s.uid + '_' + s.latestDmId);
  });

  if (candidateDm) {
    _activeFloatingAlertPayload = {
      kind: 'dm',
      dismissKey: 'dm_sender_' + candidateDm.uid + '_' + candidateDm.latestDmId,
      partnerUid: candidateDm.uid
    };
    bubble.className = 'remo-floating-bubble is-dm';
    bubble.style.display = 'block';
    bubble.onclick = () => handleFloatingAlertClick();
    bubble.innerHTML = `
      <div class="rfb-inner">
        <div class="rfb-avatar">
          <span>${candidateDm.flag || '💌'}</span>
          <span class="rfb-badge">${candidateDm.count}</span>
        </div>
        <div class="rfb-body">
          <div class="rfb-title">💌 @${escapeHtmlStr(candidateDm.name)}</div>
          <div class="rfb-text">${escapeHtmlStr(candidateDm.snippet)}</div>
        </div>
        <button type="button" class="rfb-open-btn" onclick="event.stopPropagation();handleFloatingAlertClick()">${t('notif_reply_btn')}</button>
        <button type="button" class="rfb-close-btn" onclick="dismissFloatingAlertBubble(event)" title="${isFr ? 'Fermer' : 'Dismiss'}">✕</button>
      </div>
    `;
    return;
  }

  // Otherwise pick top non-dismissed unread social notification (comment, like, reaction, tip)
  const candidateSoc = unreadSocial.find((n) => !_dismissedFloatingAlertIds.has('notif_' + n.id));
  if (candidateSoc) {
    let icon = '🔔';
    if (candidateSoc.type === 'comment') icon = '💬';
    else if (candidateSoc.type === 'like') icon = '❤️';
    else if (candidateSoc.type === 'reaction') icon = candidateSoc.emoji || '🔥';
    else if (candidateSoc.type === 'tip') icon = '🪙';
    else if (candidateSoc.type === 'wave') icon = '👋';
    else if (candidateSoc.type === 'follow') icon = '🌟';

    _activeFloatingAlertPayload = {
      kind: 'notif',
      dismissKey: 'notif_' + candidateSoc.id,
      notifId: candidateSoc.id
    };
    bubble.className = 'remo-floating-bubble';
    bubble.style.display = 'block';
    bubble.onclick = () => handleFloatingAlertClick();
    bubble.innerHTML = `
      <div class="rfb-inner">
        <div class="rfb-avatar">
          <span>${icon}</span>
          <span class="rfb-badge">1</span>
        </div>
        <div class="rfb-body">
          <div class="rfb-title">@${escapeHtmlStr(candidateSoc.fromName || 'Citizen')}</div>
          <div class="rfb-text">${escapeHtmlStr(formatNotificationDesc(candidateSoc, lang))}</div>
        </div>
        <button type="button" class="rfb-open-btn" onclick="event.stopPropagation();handleFloatingAlertClick()">${t('notif_open_btn')}</button>
        <button type="button" class="rfb-close-btn" onclick="dismissFloatingAlertBubble(event)" title="${isFr ? 'Fermer' : 'Dismiss'}">✕</button>
      </div>
    `;
    return;
  }

  _activeFloatingAlertPayload = null;
  bubble.style.display = 'none';
  bubble.innerHTML = '';
}

function dismissFloatingAlertBubble(ev) {
  if (ev) ev.stopPropagation();
  if (_activeFloatingAlertPayload && _activeFloatingAlertPayload.dismissKey) {
    _dismissedFloatingAlertIds.add(_activeFloatingAlertPayload.dismissKey);
  }
  updateUnreadBadges();
}
window.dismissFloatingAlertBubble = dismissFloatingAlertBubble;

function handleFloatingAlertClick() {
  const p = _activeFloatingAlertPayload;
  if (!p) return;
  if (p.dismissKey) _dismissedFloatingAlertIds.add(p.dismissKey);
  if (p.kind === 'dm' && p.partnerUid) {
    openDirectChatWithUser(p.partnerUid);
  } else if (p.kind === 'notif' && p.notifId) {
    handleNotificationClick(p.notifId);
  }
}
window.handleFloatingAlertClick = handleFloatingAlertClick;

function updateUnreadBadges() {
  const u = REMO_STORE.getCurrentUser();
  const myUid = u ? u.uid : null;
  const isAdm = REMO_STORE.isCurrentUserAdmin();
  const lang = REMO_I18N.getLang();

  // 1. Group unread Direct Messages by sender (sorted newest first)
  const unreadDms = (REMO_STORE.state.directMessages || [])
    .filter((d) => isDmAddressedToMe(d, myUid, isAdm) && !d.read)
    .sort((a, b) => (b.ts || 0) - (a.ts || 0));
  const unreadDmCount = unreadDms.length;

  const senderGroupMap = new Map();
  unreadDms.forEach((d) => {
    if (!d.fromUid) return;
    if (!senderGroupMap.has(d.fromUid)) {
      const usr = (REMO_STORE.state.users || []).find((x) => x.uid === d.fromUid);
      const cityObj = getCityById(d.fromCity || (usr ? usr.homeCity : 'montreal'));
      senderGroupMap.set(d.fromUid, {
        uid: d.fromUid,
        name: d.fromName || (usr ? usr.name : 'Citizen'),
        flag: cityObj ? cityObj.flag : '🌍',
        snippet: formatDmSnippet(d, lang),
        latestDmId: d.id,
        latestTs: Number(d.ts || 0),
        count: 1
      });
    } else {
      senderGroupMap.get(d.fromUid).count += 1;
    }
  });
  const unreadSenders = Array.from(senderGroupMap.values()).sort((a, b) => b.latestTs - a.latestTs);

  // 2. Unified unread social notifications (zero double-counting with DMs)
  const unifiedList = buildUnifiedNotificationsList();
  const unreadSocial = unifiedList.filter((n) => n.type !== 'message' && !n.read);
  const totalUnreadNotifs = unreadDmCount + unreadSocial.length;

  // Update Header Bell Badge
  const bellBadge = document.getElementById('hdrNotifBadge');
  if (bellBadge) {
    if (totalUnreadNotifs > 0) {
      bellBadge.textContent = totalUnreadNotifs > 99 ? '99+' : totalUnreadNotifs;
      bellBadge.style.display = 'inline-flex';
    } else {
      bellBadge.style.display = 'none';
    }
  }

  // Update Modal Count
  const modalBadge = document.getElementById('notifModalCountBadge');
  if (modalBadge) {
    if (totalUnreadNotifs > 0) {
      modalBadge.textContent = totalUnreadNotifs;
      modalBadge.style.display = 'inline-block';
    } else {
      modalBadge.style.display = 'none';
    }
  }

  // Update Sidebar Messages Badge
  const sideBadge = document.getElementById('sidebarMsgUnreadBadge');
  if (sideBadge) {
    if (unreadDmCount > 0) {
      sideBadge.textContent = unreadDmCount;
      sideBadge.style.display = 'inline-block';
    } else {
      sideBadge.style.display = 'none';
    }
  }

  // Update Mobile Hub Messages Badge & Dot
  const mbBadge = document.getElementById('mbHubMsgUnreadBadge');
  if (mbBadge) {
    if (unreadDmCount > 0) {
      mbBadge.textContent = unreadDmCount;
      mbBadge.style.display = 'inline-block';
    } else {
      mbBadge.style.display = 'none';
    }
  }
  const mbDot = document.getElementById('mbHubUnreadDot');
  if (mbDot) {
    mbDot.style.display = (totalUnreadNotifs > 0) ? 'block' : 'none';
  }

  // Update Live Sender Preview Pills in Left Sidebar & Mobile Hub
  renderSidebarUnreadSenderPills(unreadSenders, lang);

  // Update Persistent Bottom-Right Floating Alert Bubble
  renderFloatingAlertBubble(unreadSenders, unreadSocial, lang);

  // Update Dynamic Blinking Browser Tab Title
  updateDynamicTabTitle(unreadSenders, unreadSocial, lang);
}
window.updateUnreadBadges = updateUnreadBadges;

function toggleNotificationsModal() {
  const modal = document.getElementById('notificationsModal');
  if (!modal) return;
  const isOpen = modal.classList.toggle('open');
  if (isOpen) {
    RemoAudio.play('click');
    renderNotificationsList(currentNotifFilter);
  }
}
window.toggleNotificationsModal = toggleNotificationsModal;

function filterNotifications(filterTab) {
  currentNotifFilter = filterTab;
  document.querySelectorAll('.notif-tab').forEach((b) => {
    b.classList.toggle('active', b.getAttribute('data-notif-filter') === filterTab);
  });
  renderNotificationsList(filterTab);
}
window.filterNotifications = filterNotifications;

function renderNotificationsList(filterTab = currentNotifFilter) {
  const box = document.getElementById('notificationsListContainer');
  if (!box) return;
  const lang = REMO_I18N.getLang();

  let list = buildUnifiedNotificationsList();
  if (filterTab === 'like') {
    list = list.filter((n) => n.type === 'like' || n.type === 'reaction' || n.type === 'tip');
  } else if (filterTab !== 'all') {
    list = list.filter((n) => n.type === filterTab);
  }

  if (list.length === 0) {
    box.innerHTML = `
      <div style="text-align:center;padding:36px 14px;color:var(--muted);font-size:0.84rem;">
        <div style="font-size:2rem;margin-bottom:8px;">✨</div>
        <div>${t('notif_empty')}</div>
      </div>
    `;
    return;
  }

  box.innerHTML = list.map((n) => {
    const isUnread = !n.read;
    const timeAgo = formatNotifTimeAgo(n.ts, lang);
    const usr = (REMO_STORE.state.users || []).find((x) => x.uid === n.fromUid);
    const cityObj = getCityById(n.fromCity || (usr ? usr.homeCity : 'montreal'));
    const cityFlag = cityObj ? cityObj.flag : '';
    let icon = '🔔';
    let iconBg = 'rgba(56, 189, 248, 0.15)';
    if (n.type === 'comment') { icon = '💬'; iconBg = 'rgba(56, 189, 248, 0.2)'; }
    else if (n.type === 'like') { icon = '❤️'; iconBg = 'rgba(244, 63, 94, 0.2)'; }
    else if (n.type === 'reaction') { icon = n.emoji || '🔥'; iconBg = 'rgba(251, 191, 36, 0.2)'; }
    else if (n.type === 'message') { icon = '💌'; iconBg = 'rgba(168, 85, 247, 0.24)'; }
    else if (n.type === 'tip') { icon = '🪙'; iconBg = 'rgba(234, 179, 8, 0.2)'; }
    else if (n.type === 'wave') { icon = '👋'; iconBg = 'rgba(16, 185, 129, 0.22)'; }
    else if (n.type === 'follow') { icon = '🌟'; iconBg = 'rgba(99, 102, 241, 0.24)'; }
    else if (n.type === 'mystery_solved') { icon = '🕵️'; iconBg = 'rgba(168, 85, 247, 0.24)'; }
    else if (n.type === 'daily_match') { icon = '🤝'; iconBg = 'rgba(16, 185, 129, 0.25)'; }
    else if (n.type === 'crown_steal') { icon = '👑'; iconBg = 'rgba(251, 191, 36, 0.28)'; }
    else if (n.type === 'spotlight_hype' || n.type === 'spotlight_gift') { icon = '🌟'; iconBg = 'rgba(234, 179, 8, 0.26)'; }

    const canWaveBack = n.type === 'wave' && n.fromUid && !n.groupedCount;

    return `
      <div class="notif-card-item ${isUnread ? 'unread' : ''}" onclick="handleNotificationClick('${n.id}')">
        <div class="notif-card-icon" style="background:${iconBg};">
          ${icon}
        </div>
        <div class="notif-card-content">
          <div class="notif-card-actor">${cityFlag ? cityFlag + ' ' : ''}@${escapeHtmlStr(n.fromName || 'Citizen')}</div>
          <div class="notif-card-desc">${escapeHtmlStr(formatNotificationDesc(n, lang))}</div>
          ${canWaveBack ? `<div style="margin-top:5px;"><button type="button" class="presence-wave-mini-btn" onclick="event.stopPropagation();waveBackFromNotif('${n.id}', '${n.fromUid}')">${t('wave_back_btn')}</button></div>` : ''}
        </div>
        <div class="notif-card-time">${escapeHtmlStr(timeAgo)}</div>
      </div>
    `;
  }).join('');
}
window.renderNotificationsList = renderNotificationsList;

function jumpToPostFromNotification(postId, shouldOpenComments) {
  if (!postId) return;
  // Reset any active feed filter if it would hide the target post
  if (currentFeedMode !== 'all' || currentFeedCityFilter !== 'all' || currentFeedVibeFilter !== 'all') {
    currentFeedMode = 'all';
    currentFeedCityFilter = 'all';
    currentFeedVibeFilter = 'all';
    document.querySelectorAll('#feedModeChips .fchip').forEach((b, idx) => b.classList.toggle('active', idx === 0));
    document.querySelectorAll('#feedVibeChips .fchip').forEach((b, idx) => b.classList.toggle('active', idx === 0));
  }
  switchRemoView('feed');
  setTimeout(() => {
    const el = document.getElementById('post_card_' + postId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.style.transition = 'box-shadow 0.35s ease';
      el.style.boxShadow = '0 0 28px rgba(56, 189, 248, 0.85)';
      setTimeout(() => { if (el) el.style.boxShadow = ''; }, 2600);
    }
    if (shouldOpenComments) {
      openCommentsModal(postId);
    }
  }, 160);
}

function handleNotificationClick(notifId) {
  const unified = buildUnifiedNotificationsList();
  const item = unified.find((x) => x.id === notifId);
  if (!item) return;

  const idsToMark = Array.isArray(item.groupedWaveIds) && item.groupedWaveIds.length > 0
    ? item.groupedWaveIds
    : [notifId];

  idsToMark.forEach((idVal) => {
    REMO_STORE.markNotifIdReadLocal(idVal);
    const realNotif = (REMO_STORE.state.notifications || []).find((x) => x.id === idVal);
    if (realNotif && !realNotif.read) {
      realNotif.read = true;
      REMO_STORE.syncNotificationToCloud(realNotif);
    }
  });

  if (item.dmId) {
    const dm = (REMO_STORE.state.directMessages || []).find((d) => d.id === item.dmId);
    if (dm && !dm.read) {
      _justReadDmHighlightIds.add(dm.id);
      dm.read = true;
      REMO_STORE.syncDmToCloud(dm);
    }
  }

  REMO_STORE.save(false, 'notif_read');
  updateUnreadBadges();
  document.getElementById('notificationsModal')?.classList.remove('open');

  if ((item.type === 'message' || item.type === 'daily_match') && item.fromUid) {
    openDirectChatWithUser(item.fromUid);
  } else if ((item.type === 'wave' || item.type === 'follow') && item.fromUid) {
    openCitizenProfileModal(item.fromUid, item.fromName || '');
  } else if ((item.type === 'comment' || item.type === 'like' || item.type === 'reaction' || item.type === 'tip' || item.type === 'mystery_solved' || item.type === 'crown_steal' || item.type === 'spotlight_hype' || item.type === 'spotlight_gift') && item.postId) {
    jumpToPostFromNotification(item.postId, item.type === 'comment');
  }
}
window.handleNotificationClick = handleNotificationClick;

function markAllNotificationsAsRead() {
  REMO_STORE.markAllNotificationsAsRead();
  RemoAudio.play('click');
  renderNotificationsList();
  updateUnreadBadges();
  remoToast(REMO_I18N.getLang() === 'fr' ? '✓ Toutes les notifications sont lues' : '✓ All notifications marked as read');
}
window.markAllNotificationsAsRead = markAllNotificationsAsRead;

function showHeadsUpNotification(opts) {
  if (!opts) return;
  activeHeadsUpPayload = opts;
  const banner = document.getElementById('remoHeadsUpBanner');
  const avEl = document.getElementById('headsupAvatar');
  const tEl = document.getElementById('headsupTitle');
  const bEl = document.getElementById('headsupText');
  const actBtn = document.getElementById('headsupActionBtn');
  if (!banner) return;

  const lang = REMO_I18N.getLang();
  if (avEl) {
    if (opts.type === 'comment') avEl.textContent = '💬';
    else if (opts.type === 'like') avEl.textContent = '❤️';
    else if (opts.type === 'reaction') avEl.textContent = opts.emoji || '🔥';
    else if (opts.type === 'message') avEl.textContent = '💌';
    else if (opts.type === 'tip') avEl.textContent = '🪙';
    else if (opts.type === 'wave') avEl.textContent = '👋';
    else if (opts.type === 'follow') avEl.textContent = '🌟';
    else avEl.textContent = '🔔';
  }
  if (tEl) tEl.textContent = opts.title || 'REMO';
  if (bEl) bEl.textContent = opts.text || '';
  if (actBtn) actBtn.textContent = lang === 'fr' ? 'Voir' : 'View';

  banner.style.display = 'block';
  setTimeout(() => { banner.classList.add('open'); }, 20);

  if (headsUpTimer) clearTimeout(headsUpTimer);
  headsUpTimer = setTimeout(() => {
    closeHeadsUpBanner();
  }, 5500);
}
window.showHeadsUpNotification = showHeadsUpNotification;

function closeHeadsUpBanner() {
  const banner = document.getElementById('remoHeadsUpBanner');
  if (!banner) return;
  banner.classList.remove('open');
  if (headsUpTimer) clearTimeout(headsUpTimer);
  setTimeout(() => {
    banner.style.display = 'none';
  }, 400);
}
window.closeHeadsUpBanner = closeHeadsUpBanner;

function handleHeadsUpClick() {
  const p = activeHeadsUpPayload;
  closeHeadsUpBanner();
  if (!p) return;
  if (p.actionFn) {
    p.actionFn();
    return;
  }
  if (p.type === 'message' && p.partnerUid) {
    openDirectChatWithUser(p.partnerUid);
  } else if ((p.type === 'wave' || p.type === 'follow') && p.partnerUid) {
    openCitizenProfileModal(p.partnerUid);
  } else if (p.postId) {
    jumpToPostFromNotification(p.postId, p.type === 'comment');
  }
}
window.handleHeadsUpClick = handleHeadsUpClick;

window.addEventListener('remo:langchange', () => {
  updateUnreadBadges();
  if (typeof renderLivePresenceStrip === 'function') renderLivePresenceStrip();
  if (typeof syncStreakHeaderBadge === 'function') syncStreakHeaderBadge();
  if (typeof syncPushToggleUI === 'function') syncPushToggleUI();
  if (document.getElementById('notificationsModal')?.classList.contains('open')) {
    renderNotificationsList(currentNotifFilter);
  }
  if (document.getElementById('onlineDirectoryModal')?.classList.contains('open')) {
    renderOnlineDirectoryModal();
  }
  if (document.getElementById('dailyStreakModal')?.classList.contains('open')) {
    openDailyStreakModal();
  }
  if (document.getElementById('publicProfileModal')?.classList.contains('open') && _currentOpenProfileUid) {
    openCitizenProfileModal(_currentOpenProfileUid);
  }
});

/* ════════════════════════════════════════════════════════════════════
   🟢 MODULE 1 (v58): ADAPTIVE LIVE PRESENCE (<=12 DIRECT / >12 SMART 100K+
   SPOTLIGHT + CITY PODS), 1-CLICK 👋 WAVE ACROSS CITIES, 🌍 RANDOM WAVE,
   ANTI-SPAM COOLDOWN & 🛬 NEW CITIZEN AUTO-WELCOME
   ════════════════════════════════════════════════════════════════════ */
let _onlineDirActiveCityFilter = 'all';
const _welcomedNewCitizensSession = new Set();
const _randomWaveTimestamps = [];

function _getWaveCooldownMap() {
  const me = REMO_STORE.getCurrentUser();
  const key = 'remo_wave_cd_' + (me ? me.uid : 'guest');
  try {
    return JSON.parse(localStorage.getItem(key) || '{}') || {};
  } catch (e) {
    return {};
  }
}

function _setWaveCooldownForTarget(targetUid) {
  const me = REMO_STORE.getCurrentUser();
  if (!me || !targetUid) return;
  const key = 'remo_wave_cd_' + me.uid;
  const map = _getWaveCooldownMap();
  const now = Date.now();
  // Prune entries older than 24h
  Object.keys(map).forEach((k) => {
    if (now - Number(map[k] || 0) > 86400000) delete map[k];
  });
  map[targetUid] = now;
  try {
    localStorage.setItem(key, JSON.stringify(map));
  } catch (e) {}
}

function _hasWavedToday(targetUid) {
  if (!targetUid) return false;
  const map = _getWaveCooldownMap();
  const ts = Number(map[targetUid] || 0);
  return ts > 0 && (Date.now() - ts < 86400000);
}

function renderLivePresenceStrip() {
  const strip = document.getElementById('livePresenceStrip');
  const welcomeBar = document.getElementById('newCitizenWelcomeBar');
  if (!strip && !welcomeBar) return;

  const lang = REMO_I18N.getLang();
  const isFr = lang === 'fr';
  const me = REMO_STORE.getCurrentUser();
  const myUid = me ? me.uid : '';
  const myHomeCity = me ? (me.homeCity || 'montreal') : 'montreal';
  const onlineAll = (typeof REMO_STORE.getOnlineCitizensList === 'function')
    ? REMO_STORE.getOnlineCitizensList()
    : [];
  const totalOnline = Math.max(1, onlineAll.length);
  const miniOnlineCnt = document.getElementById('feedOnlineMiniCount');
  if (miniOnlineCnt) miniOnlineCnt.textContent = String(totalOnline);
  const others = onlineAll.filter((c) => c && c.uid && c.uid !== myUid);

  // 1. 🛬 New Citizen Auto-Welcome Bar (joined within last 15 minutes)
  if (welcomeBar) {
    const now = Date.now();
    const freshCitizen = (REMO_STORE.state.users || [])
      .filter((usr) =>
        usr &&
        usr.uid &&
        usr.uid !== myUid &&
        !_welcomedNewCitizensSession.has(usr.uid) &&
        Number(usr.joinedAt || 0) > 0 &&
        (now - Number(usr.joinedAt) <= 15 * 60000)
      )
      .sort((a, b) => (b.joinedAt || 0) - (a.joinedAt || 0))[0];

    if (freshCitizen) {
      const fc = getCityById(freshCitizen.homeCity || 'montreal');
      const cityLabel = `${fc.flag} ${getCityName(fc, lang)}`;
      const msg = t('online_new_landed', {
        num: freshCitizen.passportNum || '0001',
        name: freshCitizen.name || 'Citizen',
        city: cityLabel
      });
      welcomeBar.style.display = 'flex';
      welcomeBar.innerHTML = `
        <div style="font-size:0.8rem;font-weight:800;color:#ecfdf5;display:flex;align-items:center;gap:6px;cursor:pointer;" onclick="openCitizenProfileModal('${freshCitizen.uid}', '${escapeHtmlStr(freshCitizen.name)}')">
          <span>${escapeHtmlStr(msg)}</span>
        </div>
        <button type="button" class="btn-cyber btn-gold" style="font-size:0.73rem;padding:5px 11px;" onclick="welcomeNewCitizenClick('${freshCitizen.uid}')">
          ${t('online_welcome_btn')}
        </button>
      `;
    } else {
      welcomeBar.style.display = 'none';
      welcomeBar.innerHTML = '';
    }
  }

  if (!strip) return;

  const renderChip = (cit) => {
    const cObj = getCityById(cit.homeCity || 'montreal');
    const following = REMO_STORE.isFollowingUser && REMO_STORE.isFollowingUser(cit.uid);
    const waved = _hasWavedToday(cit.uid);
    return `
      <div class="presence-user-chip ${following ? 'is-following' : ''}">
        <span class="presence-user-name" onclick="openCitizenProfileModal('${cit.uid}', '${escapeHtmlStr(cit.name)}')" title="🪪 @${escapeHtmlStr(cit.name)}">
          <span>${cObj ? cObj.flag : '🌍'}</span>
          <span>@${escapeHtmlStr(cit.name)}</span>
        </span>
        <button type="button" class="presence-wave-mini-btn" style="${waved ? 'opacity:0.55;' : ''}" onclick="sendCityWaveToUser('${cit.uid}')" title="👋 @${escapeHtmlStr(cit.name)}">👋</button>
      </div>
    `;
  };

  // Adaptive Mode A: <= 12 other citizens online -> show all directly + 👋 + 🌍 Random Wave
  if (others.length <= 12) {
    strip.innerHTML = `
      <button type="button" class="presence-counter-pill" onclick="openOnlineDirectoryModal('all')">
        <span class="online-pulse-dot"></span>
        <span>${totalOnline} ${escapeHtmlStr(t('online_now_lbl'))}</span>
      </button>
      ${others.length > 0
        ? others.map(renderChip).join('')
        : `<span style="font-size:0.75rem;color:var(--muted);padding:0 4px;">${isFr ? 'Vous êtes en direct • Invitez vos amis !' : 'You are live • Invite friends online!'}</span>`
      }
      <button type="button" class="random-wave-pill" onclick="sendRandomWorldWave()">
        ${t('online_random_wave_btn')}
      </button>
    `;
    return;
  }

  // Adaptive Mode B: > 12 online (scales cleanly to 100,000+ users)
  // Build City Pulse Pods (top 4 active cities) + max 8 Smart Spotlight citizens
  const cityCounts = new Map();
  others.forEach((c) => {
    const cid = c.homeCity || 'montreal';
    cityCounts.set(cid, (cityCounts.get(cid) || 0) + 1);
  });
  const topCities = Array.from(cityCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const nowTs = Date.now();
  const scoredSpotlight = others
    .map((c) => {
      let relevance = 0;
      if (REMO_STORE.isFollowingUser && REMO_STORE.isFollowingUser(c.uid)) relevance += 100;
      if (c.homeCity === myHomeCity) relevance += 50;
      if (c.joinedAt && (nowTs - c.joinedAt < 30 * 60000)) relevance += 30;
      if (!_hasWavedToday(c.uid)) relevance += 10;
      return { cit: c, relevance };
    })
    .sort((a, b) => b.relevance - a.relevance || (b.cit.lastSeenAt || 0) - (a.cit.lastSeenAt || 0))
    .slice(0, 8)
    .map((x) => x.cit);

  strip.innerHTML = `
    <button type="button" class="presence-counter-pill" onclick="openOnlineDirectoryModal('all')">
      <span class="online-pulse-dot"></span>
      <span>${totalOnline.toLocaleString()} ${escapeHtmlStr(t('online_now_lbl'))} ›</span>
    </button>
    ${topCities.map(([cid, cnt]) => {
      const co = getCityById(cid);
      return `<button type="button" class="presence-city-pod" onclick="openOnlineDirectoryModal('${cid}')">${co.flag} ${escapeHtmlStr(getCityName(co, lang))} · ${cnt}</button>`;
    }).join('')}
    ${scoredSpotlight.map(renderChip).join('')}
    <button type="button" class="random-wave-pill" onclick="sendRandomWorldWave()">
      ${t('online_random_wave_btn')}
    </button>
  `;
}
window.renderLivePresenceStrip = renderLivePresenceStrip;

function welcomeNewCitizenClick(targetUid) {
  _welcomedNewCitizensSession.add(targetUid);
  sendCityWaveToUser(targetUid, true);
  renderLivePresenceStrip();
}
window.welcomeNewCitizenClick = welcomeNewCitizenClick;

function openOnlineDirectoryModal(cityFilter = 'all') {
  _onlineDirActiveCityFilter = cityFilter || 'all';
  const modal = document.getElementById('onlineDirectoryModal');
  if (!modal) return;
  modal.classList.add('open');
  RemoAudio.play('click');
  renderOnlineDirectoryModal();
}
window.openOnlineDirectoryModal = openOnlineDirectoryModal;

function setOnlineDirCityFilter(cityId) {
  _onlineDirActiveCityFilter = cityId || 'all';
  renderOnlineDirectoryModal();
}
window.setOnlineDirCityFilter = setOnlineDirCityFilter;

function renderOnlineDirectoryModal() {
  const listBox = document.getElementById('onlineDirListBox');
  const cityStrip = document.getElementById('onlineDirCityStrip');
  const countBadge = document.getElementById('onlineDirCountBadge');
  if (!listBox) return;

  const lang = REMO_I18N.getLang();
  const isFr = lang === 'fr';
  const me = REMO_STORE.getCurrentUser();
  const myUid = me ? me.uid : '';
  const q = (document.getElementById('onlineDirSearchInp')?.value || '').trim().toLowerCase();

  const onlineAll = REMO_STORE.getOnlineCitizensList ? REMO_STORE.getOnlineCitizensList() : [];
  if (countBadge) countBadge.textContent = Math.max(1, onlineAll.length).toLocaleString();

  // Build city filter chips inside modal
  if (cityStrip) {
    const counts = new Map();
    onlineAll.forEach((c) => {
      const cid = c.homeCity || 'montreal';
      counts.set(cid, (counts.get(cid) || 0) + 1);
    });
    const citiesSorted = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
    cityStrip.innerHTML = `
      <button type="button" class="fchip ${_onlineDirActiveCityFilter === 'all' ? 'active' : ''}" onclick="setOnlineDirCityFilter('all')">🌍 ${isFr ? 'Toutes' : 'All'} (${onlineAll.length})</button>
      ${citiesSorted.map(([cid, cnt]) => {
        const co = getCityById(cid);
        return `<button type="button" class="fchip ${_onlineDirActiveCityFilter === cid ? 'active' : ''}" onclick="setOnlineDirCityFilter('${cid}')">${co.flag} ${escapeHtmlStr(getCityName(co, lang))} (${cnt})</button>`;
      }).join('')}
    `;
  }

  let filtered = onlineAll.slice();
  if (_onlineDirActiveCityFilter !== 'all') {
    filtered = filtered.filter((c) => (c.homeCity || 'montreal') === _onlineDirActiveCityFilter);
  }
  if (q) {
    filtered = filtered.filter((c) => {
      const co = getCityById(c.homeCity || 'montreal');
      const cNameEn = (co?.name_en || '').toLowerCase();
      const cNameFr = (co?.name_fr || '').toLowerCase();
      return (c.name || '').toLowerCase().includes(q) || cNameEn.includes(q) || cNameFr.includes(q);
    });
  }

  if (filtered.length === 0) {
    listBox.innerHTML = `<div style="text-align:center;padding:28px;color:var(--muted);font-size:0.83rem;">${escapeHtmlStr(t('dm_no_match'))}</div>`;
    return;
  }

  // Cap DOM rows at 40 for instant 60fps performance regardless of online user count
  listBox.innerHTML = filtered.slice(0, 40).map((c) => {
    const co = getCityById(c.homeCity || 'montreal');
    const isMe = c.uid === myUid;
    const isFol = !isMe && REMO_STORE.isFollowingUser && REMO_STORE.isFollowingUser(c.uid);
    return `
      <div class="online-dir-row">
        <div style="display:flex;align-items:center;gap:10px;min-width:0;cursor:pointer;" onclick="document.getElementById('onlineDirectoryModal').classList.remove('open');openCitizenProfileModal('${c.uid}', '${escapeHtmlStr(c.name)}')">
          <span style="font-size:1.25rem;">${co.flag}</span>
          <div style="min-width:0;">
            <div style="font-weight:900;font-size:0.86rem;color:#f8fafc;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
              @${escapeHtmlStr(c.name)} ${isMe ? `<span style="color:#34d399;font-size:0.7rem;">(${isFr ? 'Vous' : 'You'})</span>` : ''}
            </div>
            <div style="font-size:0.72rem;color:var(--muted);">${escapeHtmlStr(getCityName(co, lang))} · #${escapeHtmlStr(c.passportNum || '0001')}</div>
          </div>
        </div>
        ${!isMe ? `
          <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
            <button type="button" class="btn-ghost" style="font-size:0.72rem;padding:4px 9px;" onclick="toggleFollowFromProfile('${c.uid}');renderOnlineDirectoryModal();">${isFol ? t('profile_following_btn') : t('profile_follow_btn')}</button>
            <button type="button" class="presence-wave-mini-btn" style="padding:4px 10px;" onclick="sendCityWaveToUser('${c.uid}')">👋</button>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}
window.renderOnlineDirectoryModal = renderOnlineDirectoryModal;

function sendCityWaveToUser(targetUid, isBonusWave = false, bypassCooldown = false) {
  const lang = REMO_I18N.getLang();
  const me = REMO_STORE.getCurrentUser();
  if (!me) {
    openAuthModal();
    return false;
  }
  if (!targetUid || targetUid === me.uid) return false;

  const target = resolveCitizenByUidOrName(targetUid);
  const targetName = target ? target.name : 'Citizen';
  const targetCityObj = getCityById((target && target.homeCity) || 'montreal');
  const myCityObj = getCityById(me.homeCity || 'montreal');

  if (!bypassCooldown && _hasWavedToday(targetUid)) {
    remoToast(t('wave_cooldown_toast', { name: targetName }));
    return false;
  }

  _setWaveCooldownForTarget(targetUid);
  const km = (myCityObj.id === targetCityObj.id)
    ? 5
    : computeHaversineKm(myCityObj.lat, myCityObj.lng, targetCityObj.lat, targetCityObj.lng);

  const rewardCoins = isBonusWave ? 5 : 2;
  REMO_STORE.addCoins(me.uid, rewardCoins, 5);
  spawnRemoCoinsFX(isBonusWave ? 6 : 3);
  RemoAudio.play('chime');

  REMO_STORE.addNotification({
    toUid: targetUid,
    fromUid: me.uid,
    fromName: me.name,
    fromCity: myCityObj.id,
    type: 'wave',
    distanceKm: km,
    text: `waved at you from ${myCityObj.name_en} (${km.toLocaleString()} km)! 👋`
  });

  syncHeaderAndSidebars();
  renderLivePresenceStrip();
  remoToast(
    t('wave_sent_toast', {
      km: km.toLocaleString(),
      name: targetName,
      city: `${targetCityObj.flag} ${getCityName(targetCityObj, lang)}`
    }),
    'coin'
  );
  return true;
}
window.sendCityWaveToUser = sendCityWaveToUser;

function waveBackFromNotif(notifId, targetUid) {
  if (!targetUid) return;
  REMO_STORE.markNotifIdReadLocal(notifId);
  const realNotif = (REMO_STORE.state.notifications || []).find((x) => x.id === notifId);
  if (realNotif) {
    realNotif.read = true;
    REMO_STORE.syncNotificationToCloud(realNotif);
  }
  sendCityWaveToUser(targetUid, true, true);
  renderNotificationsList(currentNotifFilter);
  updateUnreadBadges();
}
window.waveBackFromNotif = waveBackFromNotif;

function sendRandomWorldWave() {
  const me = REMO_STORE.getCurrentUser();
  if (!me) {
    openAuthModal();
    return;
  }
  const now = Date.now();
  while (_randomWaveTimestamps.length > 0 && now - _randomWaveTimestamps[0] > 10 * 60000) {
    _randomWaveTimestamps.shift();
  }
  if (_randomWaveTimestamps.length >= 5) {
    remoToast(t('wave_rate_limit_toast'));
    return;
  }

  const onlineOthers = (REMO_STORE.getOnlineCitizensList ? REMO_STORE.getOnlineCitizensList() : [])
    .filter((c) => c && c.uid && c.uid !== me.uid && !_hasWavedToday(c.uid));

  let pool = onlineOthers;
  if (pool.length === 0) {
    // Fallback to any active citizen not yet waved today so the button always delights
    pool = (REMO_STORE.state.users || []).filter((u) => u && u.uid && u.uid !== me.uid && !_hasWavedToday(u.uid));
  }
  if (pool.length === 0) {
    remoToast(t('wave_no_other_online'));
    return;
  }

  // Prefer citizens in a different city for dramatic cross-continent distance
  const diffCityPool = pool.filter((c) => c.homeCity && c.homeCity !== me.homeCity);
  const chosenPool = diffCityPool.length > 0 ? diffCityPool : pool;
  const target = chosenPool[Math.floor(Math.random() * chosenPool.length)];
  if (sendCityWaveToUser(target.uid, false, false)) {
    _randomWaveTimestamps.push(now);
  }
}
window.sendRandomWorldWave = sendRandomWorldWave;

/* ════════════════════════════════════════════════════════════════════
   🪪 MODULE 2 (v58): CLICKABLE PUBLIC CITIZEN SHOWCASE (?u=Name)
   & FOLLOW GRAPH (+ FOLLOW / + SUIVRE)
   ════════════════════════════════════════════════════════════════════ */
let _currentOpenProfileUid = '';

function resolveCitizenByUidOrName(uidOrName, fallbackName = '') {
  const clean = String(uidOrName || '').trim().replace(/^@+/, '');
  const users = REMO_STORE.state.users || [];
  let found = null;
  if (clean) {
    found = users.find((u) =>
      u && (
        u.uid === clean ||
        (u.name && u.name.trim().toLowerCase() === clean.toLowerCase()) ||
        (u.passportNum && String(u.passportNum) === clean.replace(/^#+/, ''))
      )
    );
  }
  if (!found && fallbackName) {
    const fn = String(fallbackName).trim().toLowerCase();
    found = users.find((u) => u && u.name && u.name.trim().toLowerCase() === fn);
  }
  if (found) return found;

  // Synthesize from published posts if user profile hasn't synced yet
  const matchPost = (REMO_STORE.state.posts || []).find((p) =>
    p && (
      (clean && p.uid === clean) ||
      (clean && p.authorName && p.authorName.trim().toLowerCase() === clean.toLowerCase()) ||
      (fallbackName && p.authorName && p.authorName.trim().toLowerCase() === fallbackName.trim().toLowerCase())
    )
  );
  if (matchPost) {
    return {
      uid: matchPost.uid || ('u_post_' + matchPost.id),
      name: matchPost.authorName || fallbackName || 'Citizen',
      homeCity: matchPost.cityId || 'montreal',
      passportNum: '0099',
      verified: Boolean(matchPost.authorVerified),
      streak: 1,
      following: [],
      visas: [matchPost.cityId || 'montreal']
    };
  }
  return null;
}

function openCitizenProfileModal(uidOrName, fallbackName = '', silentIfMissing = false) {
  const target = resolveCitizenByUidOrName(uidOrName, fallbackName);
  if (!target) {
    if (uidOrName && typeof REMO_STORE.fetchUserByUid === 'function' && !window._fetchingProfileUid) {
      window._fetchingProfileUid = uidOrName;
      REMO_STORE.fetchUserByUid(uidOrName).then((fetched) => {
        window._fetchingProfileUid = '';
        if (fetched) {
          openCitizenProfileModal(fetched.uid, fetched.name, silentIfMissing);
        } else if (!silentIfMissing) {
          remoToast(REMO_I18N.getLang() === 'fr' ? 'Profil citoyen introuvable.' : 'Citizen profile not found.');
        }
      }).catch(() => { window._fetchingProfileUid = ''; });
      return false;
    }
    if (!silentIfMissing) {
      remoToast(REMO_I18N.getLang() === 'fr' ? 'Profil citoyen introuvable.' : 'Citizen profile not found.');
    }
    return false;
  }

  _currentOpenProfileUid = target.uid;
  const modal = document.getElementById('publicProfileModal');
  const body = document.getElementById('publicProfileModalBody');
  const shareHdrBtn = document.getElementById('btnProfileHeaderShare');
  if (!modal || !body) return false;

  const lang = REMO_I18N.getLang();
  const isFr = lang === 'fr';
  const me = REMO_STORE.getCurrentUser();
  const isMe = Boolean(me && me.uid === target.uid);
  const isFollowing = !isMe && REMO_STORE.isFollowingUser && REMO_STORE.isFollowingUser(target.uid);

  const hc = getCityById(target.homeCity || 'montreal');
  const wx = REMO_WEATHER.getCityLiveStatus(hc);
  const cosm = REMO_STORE.getUserCosmetics ? REMO_STORE.getUserCosmetics(target.uid) : { frameClass: '', title_en: '', title_fr: '' };
  const royalTitle = isFr ? (cosm.title_fr || '') : (cosm.title_en || '');
  const cityMayor = REMO_STORE.getCityMayor ? REMO_STORE.getCityMayor(hc.id) : null;
  const isMayor = Boolean(cityMayor && cityMayor.uid === target.uid);
  const tier = REMO_STORE.getUserPassportTier ? REMO_STORE.getUserPassportTier(target.passportNum) : null;
  const onlineNow = (REMO_STORE.getOnlineCitizensList ? REMO_STORE.getOnlineCitizensList() : []).some((x) => x.uid === target.uid);

  const targetAliases = new Set([target.uid]);
  if (target.fbUid) {
    targetAliases.add(target.fbUid);
    targetAliases.add('u_fb_' + target.fbUid);
  }
  if (target.role === 'admin' || (typeof REMO_STORE.isAdminEmail === 'function' && REMO_STORE.isAdminEmail(target.email))) {
    targetAliases.add('u_admin_founder');
  }
  const userPosts = (REMO_STORE.state.posts || []).filter((p) =>
    p && (
      (p.uid && targetAliases.has(p.uid)) ||
      (target.email && p.authorEmail && p.authorEmail.toLowerCase() === target.email.toLowerCase()) ||
      (p.authorName && target.name && p.authorName.trim().toLowerCase() === target.name.trim().toLowerCase())
    )
  );
  const userCards = (typeof REMO_STORE.getUserCards === 'function')
    ? REMO_STORE.getUserCards(target.uid)
    : (REMO_STORE.state.droppedCardsPool || []).filter((c) => c && c.ownerUid === target.uid);
  const followersCount = REMO_STORE.getFollowersCount ? REMO_STORE.getFollowersCount(target.uid) : 0;
  const followingCount = Array.isArray(target.following) ? target.following.length : 0;

  if (shareHdrBtn) {
    shareHdrBtn.onclick = () => shareCitizenProfileLink(target.name || target.uid);
  }

  const targetAvatarUrl = target.avatarUrl || (typeof REMO_STORE.getUserAvatar === 'function' ? REMO_STORE.getUserAvatar(target.uid || target.name) : '') || localStorage.getItem('remo_avatar_' + target.uid) || '';

  body.innerHTML = `
    <div class="public-profile-hero">
      <div class="pp-avatar-lg ${cosm.frameClass || ''}" style="overflow:hidden;padding:0;position:relative;">
        ${sanitizeSafeMediaUrl(targetAvatarUrl) ? `<img src="${sanitizeSafeMediaUrl(targetAvatarUrl)}" loading="lazy" decoding="async" style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block;" alt="${escapeHtmlStr(target.name)}">` : escapeHtmlStr((target.name || 'R')[0].toUpperCase())}
        ${onlineNow ? '<span class="online-pulse-dot" style="position:absolute;bottom:2px;right:2px;border:2px solid #070b18;"></span>' : ''}
      </div>
      <div style="flex:1;min-width:180px;">
        <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
          <span style="font-size:1.15rem;font-weight:900;color:#f8fafc;">@${escapeHtmlStr(target.name)}</span>
          ${target.verified ? '<span style="color:#38bdf8;font-weight:900;">✓</span>' : ''}
          ${isMayor ? `<span class="mayor-tag">${t('mayor_badge')}</span>` : ''}
          ${royalTitle ? `<span class="royal-title-pill">${escapeHtmlStr(royalTitle)}</span>` : ''}
        </div>
        <div style="font-size:0.78rem;color:#cbd5e1;margin-top:4px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
          <span>${hc.flag} <b>${escapeHtmlStr(getCityName(hc, lang))}</b> (${wx.icon} ${wx.tempC}°C)</span>
          <span>· 🪪 #${escapeHtmlStr(target.passportNum || '0001')}</span>
          <span>· 🔥 ${Math.max(1, Number(target.streak || 1))}d</span>
        </div>
        ${tier ? `<div style="margin-top:6px;"><span style="font-size:0.68rem;font-weight:900;padding:2px 8px;border-radius:99px;background:rgba(251,191,36,0.14);border:1px solid ${tier.color};color:${tier.color};">${escapeHtmlStr(isFr ? tier.badge_fr : tier.badge_en)}</span></div>` : ''}
      </div>
    </div>

    <div class="pp-stats-grid">
      <div class="pp-stat-card">
        <div class="pp-stat-val">${userPosts.length}</div>
        <div class="pp-stat-lbl">${escapeHtmlStr(t('profile_posts'))}</div>
      </div>
      <div class="pp-stat-card">
        <div class="pp-stat-val" style="color:#38bdf8;">${followersCount}</div>
        <div class="pp-stat-lbl">${escapeHtmlStr(t('profile_followers'))}</div>
      </div>
      <div class="pp-stat-card">
        <div class="pp-stat-val">${followingCount}</div>
        <div class="pp-stat-lbl">${escapeHtmlStr(t('profile_following'))}</div>
      </div>
      <div class="pp-stat-card">
        <div class="pp-stat-val" style="color:#fde047;">${userCards.length}</div>
        <div class="pp-stat-lbl">${escapeHtmlStr(t('profile_cards'))}</div>
      </div>
    </div>

    <div class="pp-actions-row">
      ${!isMe ? `
        <button type="button" class="btn-cyber ${isFollowing ? '' : 'btn-gold'}" style="flex:1;justify-content:center;" onclick="toggleFollowFromProfile('${target.uid}')">
          ${isFollowing ? t('profile_following_btn') : t('profile_follow_btn')}
        </button>
        <button type="button" class="btn-cyber" style="flex:1;justify-content:center;" onclick="document.getElementById('publicProfileModal').classList.remove('open');openDirectChatWithUser('${target.uid}')">
          💌 ${isFr ? 'Message' : 'Message'}
        </button>
        <button type="button" class="btn-ghost" onclick="sendCityWaveToUser('${target.uid}')">👋 Wave</button>
      ` : `
        <button type="button" class="btn-cyber btn-gold" style="flex:1;justify-content:center;" onclick="document.getElementById('publicProfileModal').classList.remove('open');switchRemoView('passport')">
          🪪 ${isFr ? 'Ouvrir Mon Passeport 4D' : 'Open My 4D Passport'}
        </button>
      `}
      <button type="button" class="btn-ghost" onclick="shareCitizenProfileLink('${escapeJsSingleArg(target.name || target.uid)}')">
        ${t('profile_share_btn')}
      </button>
    </div>

    ${userCards.length > 0 ? `
      <div style="margin-bottom:14px;">
        <div style="font-size:0.8rem;font-weight:900;color:#fde047;margin-bottom:6px;">${escapeHtmlStr(t('profile_cards_hdr'))}</div>
        <div class="filter-row" style="gap:8px;padding-bottom:4px;">
          ${userCards.slice(0, 8).map((card) => {
            const cc = getCityById(card.cityId || 'montreal');
            return `
              <button type="button" class="fchip" style="border-color:rgba(251,191,36,0.4);color:#fef08a;" onclick="document.getElementById('publicProfileModal').classList.remove('open');inspectCardByIdFromProfile('${card.id}')">
                ${cc.flag} ${escapeHtmlStr(getCityName(cc, lang))} · #${escapeHtmlStr(card.serial || '0001')} (${escapeHtmlStr(card.rarity || 'Rare')})
              </button>
            `;
          }).join('')}
        </div>
      </div>
    ` : ''}

    <div>
      <div style="font-size:0.8rem;font-weight:900;color:#7dd3fc;">${escapeHtmlStr(t('profile_recent_posts'))} (${userPosts.length})</div>
      ${userPosts.length === 0 ? `
        <div style="padding:20px;text-align:center;color:var(--muted);font-size:0.8rem;">${escapeHtmlStr(t('profile_no_posts'))}</div>
      ` : `
        <div class="pp-moments-grid">
          ${userPosts.slice(0, 12).map((p) => {
            const pc = getCityById(p.cityId || 'montreal');
            const cap = isFr ? (p.caption_fr || p.caption_en || '') : (p.caption_en || p.caption_fr || '');
            const typeIcon = p.mediaType === 'html_app' ? '🕹️' : (p.mediaType === 'video' ? '🎬' : '📸');
            return `
              <div class="pp-moment-thumb" onclick="document.getElementById('publicProfileModal').classList.remove('open');jumpToPostFromNotification('${p.id}', false)">
                <div style="display:flex;justify-content:space-between;font-size:0.73rem;color:#94a3b8;margin-bottom:4px;">
                  <span>${pc.flag} ${escapeHtmlStr(getCityName(pc, lang))}</span>
                  <span>${typeIcon} ❤️ ${(p.likes || []).length}</span>
                </div>
                <div style="font-size:0.78rem;color:#f1f5f9;font-weight:700;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;line-height:1.35;">
                  ${escapeHtmlStr(cap || 'REMO Moment')}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `}
    </div>
  `;

  modal.classList.add('open');
  return true;
}
window.openCitizenProfileModal = openCitizenProfileModal;

function inspectCardByIdFromProfile(cardId) {
  const card = (REMO_STORE.state.droppedCardsPool || []).find((c) => c && c.id === cardId);
  if (card && typeof inspectCardModal === 'function') {
    inspectCardModal(card);
  }
}
window.inspectCardByIdFromProfile = inspectCardByIdFromProfile;

function toggleFollowFromProfile(targetUid) {
  const me = REMO_STORE.getCurrentUser();
  if (!me) {
    openAuthModal();
    return;
  }
  const res = REMO_STORE.toggleFollowUser(targetUid);
  if (!res.ok) return;
  RemoAudio.play(res.following ? 'coin' : 'click');
  renderLivePresenceStrip();
  if (currentRemoView === 'feed' && currentFeedMode === 'following') {
    renderSocialFeed();
  }
  if (document.getElementById('publicProfileModal')?.classList.contains('open') && _currentOpenProfileUid === targetUid) {
    openCitizenProfileModal(targetUid);
  }
}
window.toggleFollowFromProfile = toggleFollowFromProfile;

function shareCitizenProfileLink(nameOrUid) {
  const lang = REMO_I18N.getLang();
  let baseOrigin = 'https://remoworld.com';
  if (window.location.origin && window.location.origin !== 'null' && !window.location.origin.startsWith('file:')) {
    baseOrigin = window.location.origin;
  }
  const url = `${baseOrigin}/?u=${encodeURIComponent(String(nameOrUid || '').trim())}`;
  if (navigator.share) {
    navigator.share({ url }).catch(() => {
      copyPostUrlToClipboard(url, lang);
    });
  } else if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(() => {
      remoToast(t('profile_copied_toast'), 'coin');
    }).catch(() => fallbackCopyPostUrl(url, lang));
  } else {
    fallbackCopyPostUrl(url, lang);
  }
}
window.shareCitizenProfileLink = shareCitizenProfileLink;

/* ════════════════════════════════════════════════════════════════════
   🕹️ MODULE 3 (v58): LIVE HTML MINI-GAME HIGH-SCORE LEADERBOARD
   & ZERO-FRICTION WHATSAPP / SOCIAL CHALLENGE (?challengeScore=...)
   ════════════════════════════════════════════════════════════════════ */
const _sessionGameScores = {};
let _pendingGuestGameScore = null;
let _activeGameChallenge = null;

function initGameChallengeFromUrlParams(postId, rawScore, challengerName) {
  const targetScore = Math.max(1, Math.floor(Number(rawScore || 0)));
  if (!postId || !targetScore) return;
  _activeGameChallenge = {
    postId,
    targetScore,
    challenger: String(challengerName || 'Citizen').replace(/^@+/, ''),
    beaten: false
  };
  renderActiveGameChallengeHero();
}
window.initGameChallengeFromUrlParams = initGameChallengeFromUrlParams;

function renderActiveGameChallengeHero() {
  const bar = document.getElementById('gameChallengeHeroBar');
  if (!bar) return;
  if (!_activeGameChallenge) {
    bar.style.display = 'none';
    bar.innerHTML = '';
    return;
  }
  const lang = REMO_I18N.getLang();
  const isFr = lang === 'fr';
  const ch = _activeGameChallenge;
  const myScore = Number(_sessionGameScores[ch.postId] || 0);
  const beaten = myScore > ch.targetScore;

  bar.style.display = 'flex';
  bar.innerHTML = `
    <div style="font-size:0.83rem;font-weight:900;color:#fef08a;">
      ${beaten
        ? (isFr
          ? `🏆 DÉFI RELEVÉ ! Vous avez battu @${escapeHtmlStr(ch.challenger)} (${myScore.toLocaleString()} vs ${ch.targetScore.toLocaleString()} pts) !`
          : `🏆 CHALLENGE CRUSHED! You beat @${escapeHtmlStr(ch.challenger)} (${myScore.toLocaleString()} vs ${ch.targetScore.toLocaleString()} pts)!`)
        : (isFr
          ? `⚔️ DÉFI ARCADE : Battez le score de @${escapeHtmlStr(ch.challenger)} (${ch.targetScore.toLocaleString()} pts) ci-dessous sans inscription !`
          : `⚔️ ARCADE CHALLENGE: Beat @${escapeHtmlStr(ch.challenger)}’s ${ch.targetScore.toLocaleString()} pts live below — zero signup needed to play!`)
      }
    </div>
    <div style="display:flex;align-items:center;gap:6px;">
      ${myScore > 0 ? `<button type="button" class="btn-cyber btn-gold" style="font-size:0.74rem;padding:5px 11px;" onclick="saveHtmlGameScoreAction('${ch.postId}')">${t('game_save_score_btn', { score: myScore.toLocaleString() })}</button>` : ''}
      <button type="button" class="btn-ghost" style="font-size:0.72rem;padding:4px 8px;" onclick="dismissGameChallengeHero()">✕</button>
    </div>
  `;
}
window.renderActiveGameChallengeHero = renderActiveGameChallengeHero;

function dismissGameChallengeHero() {
  _activeGameChallenge = null;
  renderActiveGameChallengeHero();
}
window.dismissGameChallengeHero = dismissGameChallengeHero;

function renderHtmlGameLeaderboardWidget(p, lang, u) {
  if (!p || p.mediaType !== 'html_app') return '';
  const lb = Array.isArray(p.leaderboard) ? p.leaderboard.slice(0, 3) : [];
  const sessScore = Number(_sessionGameScores[p.id] || 0);
  const medals = ['🥇', '🥈', '🥉'];
  const gc = p.gameChallenge || null;
  const crownBannerHtml = gc ? `
    <div class="crown-steal-banner">
      <div class="crown-steal-holder">${escapeHtmlStr(t('games_hub_crown_holder', { name: gc.holderName || 'Champion', score: Number(gc.targetScore || 0).toLocaleString() }))}</div>
      <div class="crown-steal-sub">${escapeHtmlStr(t('games_hub_steal_hint', { score: Number(gc.targetScore || 0).toLocaleString(), steals: Number(gc.crownSteals || 0) }))}</div>
    </div>
  ` : '';

  return `
    <div class="game-leaderboard-box" id="glbBox_${p.id}">
      <div class="glb-header">
        <span class="glb-title">${escapeHtmlStr(t('game_lb_title'))}</span>
        ${lb.length > 0 ? `<span style="font-size:0.7rem;color:#34d399;font-weight:800;">#1 · ${Number(lb[0].score || 0).toLocaleString()} pts</span>` : ''}
      </div>
      ${crownBannerHtml}
      ${lb.length === 0 ? `
        <div style="font-size:0.75rem;color:var(--muted);padding:3px 0;">${escapeHtmlStr(t('game_lb_empty'))}</div>
      ` : lb.map((entry, idx) => {
        const ec = getCityById(entry.cityId || 'montreal');
        return `
          <div class="glb-row ${idx === 0 ? 'rank-1' : ''}">
            <span style="font-weight:800;cursor:pointer;" onclick="openCitizenProfileModal('${entry.uid || ''}', '${escapeHtmlStr(entry.name || '')}')">
              ${medals[idx] || '🎮'} ${ec ? ec.flag : '🌍'} @${escapeHtmlStr(entry.name || 'Citizen')}
            </span>
            <b style="color:${idx === 0 ? '#fde047' : '#bae6fd'};font-family:'Orbitron',sans-serif;font-size:0.76rem;">${Number(entry.score || 0).toLocaleString()} pts</b>
          </div>
        `;
      }).join('')}
      <div class="glb-actions">
        <button type="button" id="glbLockBtn_${p.id}" class="btn-cyber btn-gold" style="font-size:0.72rem;padding:5px 11px;${sessScore > 0 ? '' : 'display:none;'}" onclick="saveHtmlGameScoreAction('${p.id}')">
          ${t('game_save_score_btn', { score: sessScore.toLocaleString() })}
        </button>
        <button type="button" class="btn-ghost" style="font-size:0.72rem;padding:5px 10px;border-color:rgba(56,189,248,0.45);color:#7dd3fc;" onclick="challengeFriendOnGame('${p.id}')">
          ${t('game_challenge_btn')}
        </button>
      </div>
    </div>
  `;
}
window.renderHtmlGameLeaderboardWidget = renderHtmlGameLeaderboardWidget;

function refreshSingleGameLeaderboardDOM(postId) {
  if (!postId) return;
  const p = (REMO_STORE.state.posts || []).find((x) => x && x.id === postId);
  const existingBox = document.getElementById('glbBox_' + postId);
  if (!p || !existingBox) return;
  const lang = REMO_I18N.getLang();
  const u = REMO_STORE.getCurrentUser();
  const wrapper = document.createElement('div');
  wrapper.innerHTML = renderHtmlGameLeaderboardWidget(p, lang, u);
  if (wrapper.firstElementChild) {
    existingBox.replaceWith(wrapper.firstElementChild);
  }
}

function refreshAllGameLeaderboardsDOM() {
  (REMO_STORE.state.posts || []).forEach((p) => {
    if (p && p.mediaType === 'html_app') {
      refreshSingleGameLeaderboardDOM(p.id);
    }
  });
}
window.refreshAllGameLeaderboardsDOM = refreshAllGameLeaderboardsDOM;

window.addEventListener('message', (ev) => {
  const d = ev && ev.data;
  if (!d || d.type !== 'REMO_HTML_SCORE' || !d.postId) return;
  const pid = String(d.postId);
  const matchingFrames = Array.from(document.querySelectorAll('iframe.html-post-frame[data-post-id], iframe[data-post-id]'))
    .filter((fr) => fr.getAttribute('data-post-id') === pid);
  if (!ev.source || !matchingFrames.some((fr) => fr.contentWindow === ev.source)) {
    return;
  }
  const score = Math.floor(Number(d.score || 0));
  if (!Number.isFinite(score) || score <= 0 || score > 10000000) return;

  const prev = Number(_sessionGameScores[d.postId] || 0);
  if (score <= prev) return;
  _sessionGameScores[d.postId] = score;

  const lockBtn = document.getElementById('glbLockBtn_' + d.postId);
  if (lockBtn) {
    lockBtn.style.display = 'inline-flex';
    lockBtn.textContent = t('game_save_score_btn', { score: score.toLocaleString() });
  }

  if (_activeGameChallenge && _activeGameChallenge.postId === d.postId) {
    renderActiveGameChallengeHero();
    if (!_activeGameChallenge.beaten && score > _activeGameChallenge.targetScore) {
      _activeGameChallenge.beaten = true;
      RemoAudio.play('fanfare');
      spawnRemoCoinsFX(10);
    }
  }
});

function saveHtmlGameScoreAction(postId) {
  const lang = REMO_I18N.getLang();
  const isFr = lang === 'fr';
  let score = Number(_sessionGameScores[postId] || 0);
  if (score <= 0) return;

  const u = REMO_STORE.getCurrentUser();
  if (!u) {
    _pendingGuestGameScore = { postId, score };
    remoToast(
      isFr
        ? `🎮 Créez votre Passeport en 1 clic (+150 🪙) pour publier votre score de ${score.toLocaleString()} pts !`
        : `🎮 Claim your Passport in 1 click (+150 🪙) to lock your ${score.toLocaleString()} pts on the leaderboard!`,
      'fanfare'
    );
    openAuthModal();
    return;
  }

  const res = REMO_STORE.submitHtmlGameScore(postId, score);
  if (res.ok) {
    if (res.stoleCrown) {
      RemoAudio.play('fanfare');
      spawnRemoCoinsFX(16);
      remoToast(
        isFr
          ? `👑 Couronne volée à @${res.prevHolderName} avec ${score.toLocaleString()} pts !`
          : `👑 Crown stolen from @${res.prevHolderName} with ${score.toLocaleString()} pts!`,
        'fanfare'
      );
    } else if (res.isNewRecord) {
      RemoAudio.play('fanfare');
      spawnRemoCoinsFX(12);
      remoToast(t('game_new_record_toast', { score: score.toLocaleString() }), 'fanfare');
    } else {
      RemoAudio.play('coin');
      remoToast(t('game_score_saved_toast', { score: score.toLocaleString() }), 'coin');
    }
    syncHeaderAndSidebars();
    if (res.stoleCrown && typeof rerenderSinglePostCard === 'function') {
      rerenderSinglePostCard(postId);
    } else {
      refreshSingleGameLeaderboardDOM(postId);
    }
  } else if (res.reason === 'not_higher') {
    remoToast(
      isFr
        ? `Votre meilleur record est déjà de ${Number(res.best || score).toLocaleString()} pts !`
        : `Your personal best is already ${Number(res.best || score).toLocaleString()} pts!`
    );
  }
}
window.saveHtmlGameScoreAction = saveHtmlGameScoreAction;

function flushPendingGuestGameScore() {
  if (!_pendingGuestGameScore) return;
  const { postId, score } = _pendingGuestGameScore;
  _pendingGuestGameScore = null;
  _sessionGameScores[postId] = Math.max(Number(_sessionGameScores[postId] || 0), score);
  saveHtmlGameScoreAction(postId);
}
window.flushPendingGuestGameScore = flushPendingGuestGameScore;

/* ── 🧭 REMO ODYSSEY OFFICIAL 4D GAME CONTROLLER & LIVE HOST BRIDGE ── */
let _odysseyModalOpen = false;
let _odysseyOwnedRadio = false;
let _pendingOdysseyChallenge = null;

function syncRemoOdysseyBadges() {
  if (typeof REMO_STORE === 'undefined' || typeof REMO_STORE.ensureRemoOdyssey !== 'function') return;
  const od = REMO_STORE.ensureRemoOdyssey();
  const is2x = Boolean(od.event2x || (REMO_STORE.state && REMO_STORE.state.settings && REMO_STORE.state.settings.happyHour2x));

  const pill = document.getElementById('feedRemoOdysseyPill');
  const pillTag = document.getElementById('feedOdysseyPillBadge');
  if (pill) pill.classList.toggle('event-2x', is2x);
  if (pillTag) pillTag.textContent = is2x ? '⚡2X' : '4D';

  const tileBadge = document.getElementById('appLauncherOdysseyBadge');
  if (tileBadge) tileBadge.textContent = is2x ? t('odyssey_badge_2x') : t('odyssey_badge_4d');

  const modal2x = document.getElementById('remoOdysseyModal2xChip');
  if (modal2x) modal2x.style.display = is2x ? 'inline-flex' : 'none';
}
window.syncRemoOdysseyBadges = syncRemoOdysseyBadges;

function _buildRemoOdysseyWeatherMap() {
  const map = {};
  if (typeof REMO_WEATHER === 'undefined' || typeof REMO_WEATHER.getCityLiveStatus !== 'function') return map;
  const cities = typeof getRemoCities === 'function' ? getRemoCities() : (window.REMO_CITIES || []);
  cities.forEach((c) => {
    if (!c || !c.id) return;
    try {
      const st = REMO_WEATHER.getCityLiveStatus(c);
      if (!st) return;
      const ic = String(st.icon || '');
      let kind = 'clear';
      if (ic.includes('❄')) kind = 'snow';
      else if (ic.includes('🌧') || ic.includes('⛈') || st.isSurge) kind = 'rain';
      map[c.id] = { kind, tempC: Number.isFinite(Number(st.tempC)) ? Number(st.tempC) : null, live: true };
    } catch (e) {}
  });
  return map;
}

function buildRemoOdysseyHostContext() {
  const lang = typeof REMO_I18N !== 'undefined' ? REMO_I18N.getLang() : 'en';
  const u = typeof REMO_STORE !== 'undefined' && REMO_STORE.getCurrentUser ? REMO_STORE.getCurrentUser() : null;
  const od = typeof REMO_STORE !== 'undefined' && REMO_STORE.ensureRemoOdyssey ? REMO_STORE.ensureRemoOdyssey() : { event2x: false, leaderboard: [], cityKings: {} };
  let ownedCardCities = [];
  if (u && typeof REMO_STORE.getUserCards === 'function') {
    const cards = REMO_STORE.getUserCards(u.uid) || [];
    ownedCardCities = Array.from(new Set(cards.map((c) => c && c.cityId).filter(Boolean)));
  }
  let torchCityId = '';
  try {
    const ws = typeof REMO_STORE.ensureWorldSystems === 'function' ? REMO_STORE.ensureWorldSystems() : null;
    if (ws && ws.torchRelay && ws.torchRelay.active && ws.torchRelay.currentCityId) {
      torchCityId = ws.torchRelay.currentCityId;
    }
  } catch (e) {}

  const resolveAv = (uid, fallback) => {
    if (fallback) return String(fallback);
    try {
      if (uid && typeof REMO_STORE.getUserAvatar === 'function') return String(REMO_STORE.getUserAvatar(uid) || '');
    } catch (e) {}
    return '';
  };

  const playerAvatarUrl = u ? resolveAv(u.uid, u.avatarUrl || '') : '';
  const globalLeaderboard = (Array.isArray(od.leaderboard) ? od.leaderboard : []).slice(0, 10).map((e) => ({
    uid: e.uid || '',
    name: e.name || 'Citizen',
    cityId: e.cityId || 'montreal',
    score: Number(e.score || 0),
    citiesCount: Number(e.citiesCount || 1),
    kmFlown: Number(e.kmFlown || 0),
    avatarUrl: resolveAv(e.uid, e.avatarUrl || '')
  }));

  const cityKings = {};
  if (od.cityKings && typeof od.cityKings === 'object') {
    Object.keys(od.cityKings).forEach((cid) => {
      const k = od.cityKings[cid];
      if (k && Number(k.score || 0) > 0) {
        cityKings[cid] = { name: k.name || 'Champion', score: Number(k.score || 0), avatarUrl: resolveAv(k.uid, k.avatarUrl || '') };
      }
    });
  }
  globalLeaderboard.forEach((e) => {
    if (e.cityId && (!cityKings[e.cityId] || e.score > cityKings[e.cityId].score)) {
      cityKings[e.cityId] = { name: e.name, score: e.score, avatarUrl: e.avatarUrl };
    }
  });

  const cityScores = (REMO_STORE && REMO_STORE.state && REMO_STORE.state.cityScores) || {};
  const allCities = typeof getRemoCities === 'function' ? getRemoCities() : (window.REMO_CITIES || []);
  const cityRanking = allCities
    .filter((c) => c && c.id)
    .map((c) => ({ id: c.id, score: Math.floor(Number(cityScores[c.id] || 1000)) }))
    .sort((a, b) => b.score - a.score)
    .map((entry, idx) => ({ id: entry.id, score: entry.score, rank: idx + 1 }));

  return {
    lang,
    isGuest: !u,
    playerName: u && u.name ? String(u.name) : '',
    playerAvatarUrl,
    homeCityId: u && u.homeCity ? String(u.homeCity) : '',
    ownedCardCities,
    torchCityId,
    weatherMap: _buildRemoOdysseyWeatherMap(),
    globalLeaderboard,
    cityKings,
    cityRanking,
    odyssey2x: Boolean(od.event2x),
    happyHour2x: Boolean(REMO_STORE && REMO_STORE.state && REMO_STORE.state.settings && REMO_STORE.state.settings.happyHour2x)
  };
}

function sendRemoOdysseyHostContext() {
  const fr = document.getElementById('remoOdysseyIframe');
  if (!fr || !fr.contentWindow) return;
  try {
    const origin = (window.location && window.location.origin && window.location.origin !== 'null') ? window.location.origin : '*';
    fr.contentWindow.postMessage({ type: 'REMO_HOST_CONTEXT', context: buildRemoOdysseyHostContext() }, origin);
  } catch (e) {}
}

function openRemoOdysseyModal(opts = {}) {
  const modal = document.getElementById('remoOdysseyModal');
  const wrap = document.getElementById('remoOdysseyFrameWrap');
  if (!modal || !wrap) return;

  const lang = typeof REMO_I18N !== 'undefined' ? REMO_I18N.getLang() : 'en';
  const qs = new URLSearchParams();
  qs.set('embed', '1');
  qs.set('lang', lang);
  qs.set('v', '148');
  if (opts && opts.seed) qs.set('seed', String(opts.seed));
  if (opts && opts.start) qs.set('start', String(opts.start));
  if (opts && Number(opts.target) > 0) qs.set('target', String(Math.floor(Number(opts.target))));
  if (opts && opts.vs) qs.set('vs', String(opts.vs));
  if (opts && opts.mode) qs.set('mode', String(opts.mode));

  const fullLink = document.getElementById('remoOdysseyFullscreenLink');
  if (fullLink) {
    const pageQs = new URLSearchParams(qs);
    pageQs.delete('embed');
    pageQs.delete('lang');
    const basePage = lang === 'fr' ? 'fr/odyssey.html' : 'odyssey.html';
    const qStr = pageQs.toString();
    fullLink.href = qStr ? `${basePage}?${qStr}` : basePage;
  }

  _odysseyModalOpen = true;
  _odysseyOwnedRadio = false;
  syncRemoOdysseyBadges();
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';

  wrap.innerHTML = '';
  const iframe = document.createElement('iframe');
  iframe.id = 'remoOdysseyIframe';
  iframe.className = 'remo-odyssey-iframe';
  iframe.title = 'REMO Odyssey — Official 4D World Game';
  iframe.setAttribute('allow', 'autoplay; fullscreen');
  iframe.src = `odyssey/index.html?${qs.toString()}`;
  iframe.addEventListener('load', () => {
    setTimeout(sendRemoOdysseyHostContext, 80);
  });
  wrap.appendChild(iframe);

  if (typeof RemoAudio !== 'undefined' && RemoAudio.play) RemoAudio.play('click');
}
window.openRemoOdysseyModal = openRemoOdysseyModal;
window.openGamesHubModal = openRemoOdysseyModal;

function closeRemoOdysseyModal() {
  const modal = document.getElementById('remoOdysseyModal');
  const wrap = document.getElementById('remoOdysseyFrameWrap');
  const fr = document.getElementById('remoOdysseyIframe');
  if (fr && fr.contentWindow) {
    try {
      const origin = (window.location && window.location.origin && window.location.origin !== 'null') ? window.location.origin : '*';
      fr.contentWindow.postMessage({ type: 'REMO_ODYSSEY_PAUSE' }, origin);
    } catch (e) {}
  }
  if (_odysseyOwnedRadio && window.REMO_RADIO && typeof window.REMO_RADIO.pause === 'function') {
    try { window.REMO_RADIO.pause(); } catch (e) {}
  }
  _odysseyOwnedRadio = false;
  _odysseyModalOpen = false;
  if (wrap) wrap.innerHTML = '';
  if (modal) modal.classList.remove('open');
  document.body.style.overflow = '';
}
window.closeRemoOdysseyModal = closeRemoOdysseyModal;
window.closeGamesHubModal = closeRemoOdysseyModal;

function publishRemoOdysseyFeedChallenge(summary) {
  if (!summary || !Number(summary.score)) return;
  const lang = REMO_I18N.getLang();
  const isFr = lang === 'fr';
  const u = REMO_STORE.getCurrentUser();
  if (!u) {
    _pendingOdysseyChallenge = summary;
    remoToast(
      isFr
        ? `🧭 Créez votre Passeport en 1 clic (+150 🪙) pour publier votre défi de ${Number(summary.score).toLocaleString()} pts !`
        : `🧭 Claim your Passport in 1 click (+150 🪙) to post your ${Number(summary.score).toLocaleString()} pts challenge!`,
      'fanfare'
    );
    closeRemoOdysseyModal();
    openAuthModal();
    return;
  }

  const cityId = summary.startCityId || u.homeCity || 'montreal';
  const city = getCityById(cityId);
  const scoreNum = Math.floor(Number(summary.score || 0));
  const citiesCount = Math.max(1, Math.floor(Number(summary.citiesCount || 1)));
  const kmFlown = Math.max(0, Math.floor(Number(summary.kmFlown || 0)));
  const routeIds = Array.isArray(summary.routeIds) && summary.routeIds.length ? summary.routeIds.slice(0, 8) : [cityId];
  const cloudAuthorUid = (typeof REMO_STORE.getCloudAuthorUid === 'function') ? REMO_STORE.getCloudAuthorUid(u) : u.uid;

  const newPost = {
    id: 'post_' + Date.now(),
    uid: u.uid,
    authorUid: cloudAuthorUid || u.uid,
    authorName: u.name,
    authorAvatar: u.avatarUrl || '',
    authorEmail: u.email || '',
    authorVerified: Boolean(REMO_STORE.fbAuth && REMO_STORE.fbAuth.currentUser),
    authorPassport: u.passportNum,
    cityId,
    vibe: '🧭',
    caption_en: `🧭 @${u.name} scored ${scoreNum.toLocaleString()} PTS in REMO Odyssey (${citiesCount} cities · ${kmFlown.toLocaleString()} km) for ${city ? city.name_en : 'REMO'}! Tap Play & Beat Score to race my 1v1 challenge! #RemoOdyssey #BeatMyScore`,
    caption_fr: `🧭 @${u.name} a marqué ${scoreNum.toLocaleString()} PTS dans REMO Odyssey (${citiesCount} villes · ${kmFlown.toLocaleString()} km) pour ${city ? (city.name_fr || city.name_en) : 'REMO'} ! Cliquez pour relever mon défi 1v1 ! #RemoOdyssey #Defi1v1`,
    mediaType: 'photo',
    mediaUrl: `img/cities/${cityId}.jpg`,
    mediaUrls: [],
    odysseyChallenge: {
      seed: String(summary.seed || 'REMO2026'),
      startCityId: cityId,
      score: scoreNum,
      citiesCount,
      kmFlown,
      routeIds,
      playerName: u.name,
      cityWarPoints: Math.max(10, Math.floor(Number(summary.cityWarPoints || 20)))
    },
    externalUrl: '',
    photoFilter: 'flt-none',
    soundtrackId: '',
    likes: [],
    tipsTotal: 0,
    comments: [],
    reactions: {},
    createdAt: Date.now()
  };

  REMO_STORE.state.posts.unshift(newPost);
  REMO_STORE.addCoins(u.uid, 15, 10);
  REMO_STORE.syncPostToCloud(newPost);
  REMO_STORE.save(true, 'odyssey_feed_challenge');
  closeRemoOdysseyModal();
  if (typeof switchRemoView === 'function') switchRemoView('feed');
  else renderSocialFeed('', true);
  syncHeaderAndSidebars();
  if (typeof RemoAudio !== 'undefined' && RemoAudio.play) RemoAudio.play('fanfare');
  spawnRemoCoinsFX(12);
  remoToast(t('odyssey_challenge_posted'), 'fanfare');
}
window.publishRemoOdysseyFeedChallenge = publishRemoOdysseyFeedChallenge;

window.addEventListener('message', (ev) => {
  const d = ev && ev.data;
  if (!d || typeof d !== 'object' || !d.type) return;
  const fr = document.getElementById('remoOdysseyIframe');
  if (!fr || !fr.contentWindow || ev.source !== fr.contentWindow) return;
  if (window.location && window.location.origin && window.location.origin !== 'null' && ev.origin && ev.origin !== 'null' && ev.origin !== window.location.origin) {
    return;
  }

  if (d.type === 'REMO_ODYSSEY_READY') {
    sendRemoOdysseyHostContext();
    return;
  }

  if (d.type === 'REMO_GAME_TUNE_CITY_RADIO') {
    if (window.REMO_RADIO) {
      try {
        if (d.stationId && typeof window.REMO_RADIO.selectStation === 'function') {
          window.REMO_RADIO.selectStation(d.stationId, true);
          _odysseyOwnedRadio = true;
        } else if (d.cityId && typeof window.REMO_RADIO.tuneToCity === 'function') {
          window.REMO_RADIO.tuneToCity(d.cityId, true);
          _odysseyOwnedRadio = true;
        }
      } catch (e) {}
    }
    return;
  }

  if (d.type === 'REMO_GAME_STOP_CITY_RADIO') {
    if (_odysseyOwnedRadio && window.REMO_RADIO && typeof window.REMO_RADIO.pause === 'function') {
      try { window.REMO_RADIO.pause(); } catch (e) {}
    }
    _odysseyOwnedRadio = false;
    return;
  }

  if (d.type === 'REMO_ODYSSEY_RUN_COMPLETE') {
    const summary = d.summary || d;
    const res = REMO_STORE.submitRemoOdysseyRun(summary);
    if (res && res.ok) {
      syncHeaderAndSidebars();
      sendRemoOdysseyHostContext();
      if (res.isNewRecord) {
        if (typeof RemoAudio !== 'undefined' && RemoAudio.play) RemoAudio.play('fanfare');
        spawnRemoCoinsFX(14);
        remoToast(t('odyssey_new_record_toast', { score: res.score.toLocaleString(), coins: res.coinsGranted }), 'fanfare');
      } else if (res.coinsGranted > 0 || res.cityWarPoints > 0) {
        if (typeof RemoAudio !== 'undefined' && RemoAudio.play) RemoAudio.play('coin');
        if (res.coinsGranted > 0) spawnRemoCoinsFX(8);
        remoToast(t('odyssey_run_saved_toast', {
          score: res.score.toLocaleString(),
          coins: res.coinsGranted,
          war: res.cityWarPoints
        }), 'coin');
      }
    } else if (res && res.needAuth && res.score >= 250) {
      remoToast(t('odyssey_guest_toast', { score: res.score.toLocaleString() }), 'fanfare');
    }
    return;
  }

  if (d.type === 'REMO_ODYSSEY_DROP_FEED_CHALLENGE') {
    publishRemoOdysseyFeedChallenge(d.summary || d);
    return;
  }

  if (d.type === 'REMO_ODYSSEY_CLOSE') {
    closeRemoOdysseyModal();
  }
});

window.addEventListener('remo:langchange', () => {
  syncRemoOdysseyBadges();
  if (!_odysseyModalOpen) return;
  const fr = document.getElementById('remoOdysseyIframe');
  if (fr && fr.contentWindow) {
    try {
      const origin = (window.location && window.location.origin && window.location.origin !== 'null') ? window.location.origin : '*';
      fr.contentWindow.postMessage({ type: 'REMO_SET_LANG', lang: REMO_I18N.getLang() }, origin);
    } catch (e) {}
  }
});

window.addEventListener('remo:stateupdate', (ev) => {
  syncRemoOdysseyBadges();
  if (_odysseyModalOpen) {
    sendRemoOdysseyHostContext();
  }
  if (ev && ev.detail && ev.detail.reason === 'auth' && _pendingOdysseyChallenge && REMO_STORE.getCurrentUser()) {
    const pending = _pendingOdysseyChallenge;
    _pendingOdysseyChallenge = null;
    publishRemoOdysseyFeedChallenge(pending);
  }
});

document.addEventListener('keydown', (e) => {
  if (_odysseyModalOpen && e.key === 'Escape') {
    closeRemoOdysseyModal();
  }
});

/* ── 🌟 STAGE 4: WORLD SPOTLIGHT STAGE CONTROLLER (#1 Pill + Ultra-Compact Live Strip) ── */
let _wspotTickTimer = null;
window._wspotLiveMinimized = false;

function _isOwnPersonalPost(p, u) {
  if (!p || !u) return false;
  const isAdm = REMO_STORE.isCurrentUserAdmin() || REMO_STORE.isAdminUnlocked();
  return Boolean(
    (p.uid && u.uid === p.uid) ||
    (p.authorUid && u.uid === p.authorUid) ||
    (u.email && p.authorEmail && u.email.toLowerCase() === p.authorEmail.toLowerCase()) ||
    (isAdm && p.uid === 'u_admin_founder')
  );
}

function _resolveSpotlightThumbHtml(post, entry, isLarge = true) {
  let rawSrc = (post && post.mediaUrl) || (entry && entry.previewImg) || '';
  if (!rawSrc && post && Array.isArray(post.mediaUrls) && post.mediaUrls.length > 0) {
    rawSrc = post.mediaUrls[0] || '';
  }
  const mType = post ? post.mediaType : '';
  let resolved = rawSrc;
  let idbAttr = '';
  if (rawSrc && String(rawSrc).startsWith('idb://')) {
    idbAttr = `data-idb-src="${escapeHtmlStr(rawSrc)}"`;
    if (typeof RemoMediaDB !== 'undefined' && RemoMediaDB.resolveSyncOrPlaceholder) {
      resolved = RemoMediaDB.resolveSyncOrPlaceholder(rawSrc);
    }
  }
  const cls = isLarge ? 'wspot-thumb' : 'wspot-post-pick-thumb';
  if (resolved && !String(resolved).startsWith('idb://') && !String(resolved).startsWith('data:image/svg')) {
    return `<div class="${cls}" ${idbAttr}><img src="${escapeHtmlStr(resolved)}" alt=""></div>`;
  }
  const icon = mType === 'html_app' ? '🕹️' : mType === 'before_after' ? '🪞' : mType === 'video' ? '🎬' : '🌟';
  return `<div class="${cls}" ${idbAttr}>${icon}</div>`;
}

function _syncWspotMiniNum1Btn(ws, secLeft = 0) {
  const btn = document.getElementById('wspotMiniNum1Btn');
  const txt = document.getElementById('wspotMiniNum1Txt');
  const dot = document.getElementById('wspotMiniDot');
  if (!btn || !txt) return;
  const isLive = Boolean(ws && ws.activeEntry && !ws.paused);
  btn.classList.toggle('is-live', isLive);
  txt.textContent = isLive ? `#1 · ${secLeft}s` : '#1';
  if (dot) {
    dot.style.display = (ws && ws.paused && !ws.activeEntry) ? 'none' : 'inline-block';
  }
}

function _stopWorldSpotlightTimer() {
  if (_wspotTickTimer) {
    clearInterval(_wspotTickTimer);
    _wspotTickTimer = null;
  }
}

function _updateWorldSpotlightCountdownDOM() {
  const ws = REMO_STORE.ensureWorldSpotlight();
  const cur = ws && ws.activeEntry;
  if (!cur || ws.paused) {
    _stopWorldSpotlightTimer();
    return;
  }
  const now = Date.now();
  const remMs = Number(cur.endsAt || 0) - now;
  if (remMs <= 0) {
    _stopWorldSpotlightTimer();
    renderWorldSpotlightBar();
    return;
  }
  const secLeft = Math.max(0, Math.ceil(remMs / 1000));
  const totalWindowMs = Math.max(45000, Number(cur.endsAt || 0) - Number(cur.startedAt || now));
  const pct = Math.max(0, Math.min(100, Math.round((remMs / totalWindowMs) * 100)));
  const secEl = document.getElementById('wspotSecsLeft');
  const fillEl = document.getElementById('wspotTimerFill');
  if (secEl) secEl.textContent = secLeft + 's';
  if (fillEl) fillEl.style.width = pct + '%';
  _syncWspotMiniNum1Btn(ws, secLeft);
}

function handleWorldSpotlightMiniClick() {
  REMO_STORE.advanceWorldSpotlightIfNeeded();
  const ws = REMO_STORE.ensureWorldSpotlight();
  if (ws && ws.activeEntry && window._wspotLiveMinimized) {
    window._wspotLiveMinimized = false;
    renderWorldSpotlightBar();
    return;
  }
  openSpotlightEnterModal();
}
window.handleWorldSpotlightMiniClick = handleWorldSpotlightMiniClick;

function toggleMinimizeWorldSpotlightLive() {
  window._wspotLiveMinimized = !window._wspotLiveMinimized;
  renderWorldSpotlightBar();
}
window.toggleMinimizeWorldSpotlightLive = toggleMinimizeWorldSpotlightLive;

function renderWorldSpotlightBar() {
  const bar = document.getElementById('worldSpotlightBar');
  if (!bar) return;
  REMO_STORE.advanceWorldSpotlightIfNeeded();
  const ws = REMO_STORE.ensureWorldSpotlight();
  const lang = REMO_I18N.getLang();
  const isFr = lang === 'fr';
  const cur = ws.activeEntry;

  if (!cur) {
    _stopWorldSpotlightTimer();
    window._wspotLiveMinimized = false;
    bar.style.display = 'none';
    bar.innerHTML = '';
    _syncWspotMiniNum1Btn(ws, 0);
    return;
  }

  const post = (REMO_STORE.state.posts || []).find((p) => p && p.id === cur.postId);
  const city = getCityById(cur.authorCityId || 'montreal');
  const now = Date.now();
  const remMs = Math.max(0, Number(cur.endsAt || now) - now);
  const secLeft = Math.max(0, Math.ceil(remMs / 1000));
  const totalWindowMs = Math.max(45000, Number(cur.endsAt || now) - Number(cur.startedAt || now));
  const pct = Math.max(0, Math.min(100, Math.round((remMs / totalWindowMs) * 100)));
  const cap = (isFr ? (cur.caption_fr || cur.caption_en) : (cur.caption_en || cur.caption_fr)) || (city ? getCityName(city, lang) : 'REMO');
  const hypesCnt = Array.isArray(cur.hypes) ? cur.hypes.length : Number(cur.totalHypes || 0);

  _syncWspotMiniNum1Btn(ws, secLeft);

  if (window._wspotLiveMinimized) {
    bar.style.display = 'none';
    bar.innerHTML = '';
  } else {
    bar.style.display = 'block';
    bar.innerHTML = `
      <div class="wspot-compact-live-row">
        <div onclick="openSpotlightPostJump('${escapeHtmlStr(cur.postId)}')" style="cursor:pointer;flex-shrink:0;">${_resolveSpotlightThumbHtml(post, cur, true)}</div>
        <div class="wspot-compact-meta" onclick="openSpotlightPostJump('${escapeHtmlStr(cur.postId)}')" style="cursor:pointer;">
          <div class="wspot-author-line">
            <span class="wspot-live-mini-tag">🌟 #1 ${ws.paused ? '⏸️' : 'LIVE'}</span>
            <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${city ? city.flag : '🌍'} @${escapeHtmlStr(cur.authorName || 'Citizen')}</span>
            <span id="wspotSecsLeft" class="wspot-timer-txt">${secLeft}s</span>
          </div>
          <div class="wspot-caption-line">${escapeHtmlStr(cap)}</div>
        </div>
        <div class="wspot-compact-actions">
          <button type="button" class="btn-cyber wspot-act-btn" style="background:linear-gradient(135deg,#ea580c,#e11d48);" onclick="hypeSpotlightAction()" title="${escapeHtmlStr(t('wspot_hype_btn', { count: hypesCnt }))}">🔥 <span>${hypesCnt}</span></button>
          <button type="button" class="btn-ghost wspot-act-btn" style="border-color:rgba(56,189,248,0.45);color:#7dd3fc;" onclick="giftSpotlightAction()" title="${escapeHtmlStr(t('wspot_gift_btn'))}">💎</button>
          <button type="button" class="btn-ghost wspot-act-btn" onclick="openSpotlightPostJump('${escapeHtmlStr(cur.postId)}')" title="${escapeHtmlStr(t('wspot_view_post_btn'))}">👀</button>
          <button type="button" class="btn-ghost wspot-act-btn" onclick="toggleMinimizeWorldSpotlightLive()" title="${escapeHtmlStr(t('wspot_minimize_title'))}">⌄</button>
        </div>
      </div>
      <div class="wspot-timer-bar" style="margin:5px 0 0;height:3px;"><div id="wspotTimerFill" class="wspot-timer-fill" style="width:${pct}%"></div></div>
    `;
  }

  _stopWorldSpotlightTimer();
  if (!ws.paused) {
    _wspotTickTimer = setInterval(_updateWorldSpotlightCountdownDOM, 1000);
  }
}
window.renderWorldSpotlightBar = renderWorldSpotlightBar;

function openSpotlightForSpecificPost(postId) {
  openSpotlightEnterModal(postId);
}
window.openSpotlightForSpecificPost = openSpotlightForSpecificPost;

function openSpotlightEnterModal(preselectedPostId = null) {
  const u = REMO_STORE.getCurrentUser();
  if (!u || u.role === 'guest') {
    openAuthModal();
    return;
  }
  const modal = document.getElementById('spotlightEnterModal');
  const body = document.getElementById('spotlightEnterBody');
  if (!modal || !body) return;

  const lang = REMO_I18N.getLang();
  const isFr = lang === 'fr';
  const ws = REMO_STORE.ensureWorldSpotlight();
  const todayStr = new Date().toISOString().slice(0, 10);
  const star = ws.dailyStarRecord || {};
  const starHtml = (star.date === todayStr && Number(star.durationSec || 0) > 0 && star.name)
    ? `<div style="margin-bottom:8px;"><span class="wspot-star-pill">${escapeHtmlStr(t('wspot_star_today', { name: star.name, secs: Number(star.durationSec || 0) }))}</span></div>`
    : '';

  if (preselectedPostId) {
    const specificPost = findFeedPostById(preselectedPostId);
    if (!specificPost || !_isOwnPersonalPost(specificPost, u)) {
      remoToast(t('wspot_own_post_only'));
      return;
    }
  }

  if (ws.usedDatesByUid && ws.usedDatesByUid[u.uid] === todayStr) {
    body.innerHTML = `${starHtml}<div style="padding:14px;border-radius:12px;background:rgba(244,63,94,0.12);border:1px solid rgba(244,63,94,0.4);color:#fda4af;font-size:0.82rem;font-weight:700;">${escapeHtmlStr(t('wspot_daily_used'))}</div>`;
    modal.classList.add('open');
    return;
  }

  const myPosts = (REMO_STORE.state.posts || []).filter((p) => _isOwnPersonalPost(p, u)).slice(0, 20);

  if (!myPosts.length) {
    body.innerHTML = `
      ${starHtml}
      <div style="text-align:center;padding:16px;color:var(--muted);font-size:0.84rem;">
        <p style="margin:0 0 12px;">${escapeHtmlStr(t('wspot_no_posts'))}</p>
        <button type="button" class="btn-cyber btn-gold" onclick="closeSpotlightEnterModal();openCreatePostModal()">${escapeHtmlStr(t('wspot_create_post_cta'))}</button>
      </div>
    `;
  } else {
    const prePost = preselectedPostId ? myPosts.find((p) => p.id === preselectedPostId) : null;
    const otherPosts = prePost ? myPosts.filter((p) => p.id !== prePost.id) : myPosts;

    let focusedHtml = '';
    if (prePost) {
      const capPre = (isFr ? (prePost.caption_fr || prePost.caption_en) : (prePost.caption_en || prePost.caption_fr)) || (prePost.mediaType || 'Post');
      const cPre = getCityById(prePost.cityId || u.homeCity || 'montreal');
      focusedHtml = `
        <div style="padding:12px;border-radius:14px;background:rgba(251,191,36,0.1);border:1px solid rgba(251,191,36,0.5);margin-bottom:12px;">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
            ${_resolveSpotlightThumbHtml(prePost, null, false)}
            <div style="flex:1;min-width:0;">
              <div style="font-size:0.74rem;color:#fde047;font-weight:800;">${cPre ? cPre.flag : '🌍'} ${cPre ? escapeHtmlStr(getCityName(cPre, lang)) : 'REMO'}</div>
              <div style="font-size:0.82rem;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtmlStr(capPre)}</div>
            </div>
          </div>
          <button type="button" class="btn-cyber btn-gold" style="width:100%;justify-content:center;padding:10px;font-size:0.84rem;font-weight:900;" onclick="confirmEnterWorldSpotlight('${escapeHtmlStr(prePost.id)}')">
            ${escapeHtmlStr(t('wspot_confirm_this_post'))}
          </button>
        </div>
      `;
    }

    body.innerHTML = `
      ${starHtml}
      ${focusedHtml}
      ${otherPosts.length ? `
        <div style="font-size:0.76rem;color:#cbd5e1;font-weight:700;margin-bottom:4px;">${escapeHtmlStr(prePost ? t('wspot_pick_other_link') : t('wspot_choose_post'))}</div>
        <div class="wspot-post-pick-list">
          ${otherPosts.map((p) => {
            const cap = (isFr ? (p.caption_fr || p.caption_en) : (p.caption_en || p.caption_fr)) || (p.mediaType || 'Post');
            const c = getCityById(p.cityId || u.homeCity || 'montreal');
            return `
              <button type="button" class="wspot-post-pick-item" onclick="confirmEnterWorldSpotlight('${escapeHtmlStr(p.id)}')">
                ${_resolveSpotlightThumbHtml(p, null, false)}
                <div style="flex:1;min-width:0;">
                  <div style="font-size:0.74rem;color:#fde047;font-weight:800;">${c ? c.flag : '🌍'} ${c ? escapeHtmlStr(getCityName(c, lang)) : 'REMO'}</div>
                  <div style="font-size:0.8rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtmlStr(cap)}</div>
                </div>
                <span style="font-size:0.74rem;font-weight:900;color:#fbbf24;">100 🪙 →</span>
              </button>
            `;
          }).join('')}
        </div>
      ` : ''}
    `;
  }
  modal.classList.add('open');
  if (typeof RemoAudio !== 'undefined' && RemoAudio.play) RemoAudio.play('click');
}
window.openSpotlightEnterModal = openSpotlightEnterModal;

function closeSpotlightEnterModal() {
  document.getElementById('spotlightEnterModal')?.classList.remove('open');
}
window.closeSpotlightEnterModal = closeSpotlightEnterModal;

function confirmEnterWorldSpotlight(postId) {
  const res = REMO_STORE.enterWorldSpotlightQueue(postId);
  if (!res.ok) {
    if (res.error === 'auth_required') {
      closeSpotlightEnterModal();
      openAuthModal();
    } else if (res.error === 'not_post_owner') {
      remoToast(t('wspot_own_post_only'));
    } else if (res.error === 'daily_limit_reached') {
      remoToast(t('wspot_daily_used'));
    } else if (res.error === 'insufficient_coins') {
      remoToast(t('wspot_need_coins', { needed: res.needed || 100, have: res.have || 0 }));
    }
    return;
  }
  if (res.isLiveNow) window._wspotLiveMinimized = false;
  closeSpotlightEnterModal();
  renderWorldSpotlightBar();
  syncHeaderAndSidebars();
  if (typeof RemoAudio !== 'undefined' && RemoAudio.play) RemoAudio.play('fanfare');
  spawnRemoCoinsFX(12);
  remoToast(res.isLiveNow ? t('wspot_entered_live') : t('wspot_entered_queue', { pos: res.queuePos || 1 }), 'fanfare');
}
window.confirmEnterWorldSpotlight = confirmEnterWorldSpotlight;

function hypeSpotlightAction() {
  const res = REMO_STORE.hypeCurrentSpotlight();
  if (!res.ok) {
    if (res.needAuth) openAuthModal();
    else if (res.error === 'cannot_hype_self') remoToast(REMO_I18N.getLang() === 'fr' ? 'Vous ne pouvez pas hyper votre propre passage !' : 'You cannot hype your own Spotlight turn!');
    else if (res.error === 'already_hyped') remoToast(REMO_I18N.getLang() === 'fr' ? 'Vous avez déjà hypé ce créateur !' : 'You already hyped this Spotlight turn!');
    return;
  }
  RemoAudio.play('coin');
  spawnRemoCoinsFX(6);
  renderWorldSpotlightBar();
  syncHeaderAndSidebars();
  remoToast(t('wspot_hyped_toast', { sec: res.addedSec || 5 }), 'fanfare');
}
window.hypeSpotlightAction = hypeSpotlightAction;

function nextSpotlightAction() {
  const res = REMO_STORE.voteNextSpotlight();
  if (!res.ok) {
    if (res.needAuth) openAuthModal();
    else if (res.error === 'already_voted_next') remoToast(REMO_I18N.getLang() === 'fr' ? 'Vote Suivant déjà pris en compte !' : 'NEXT vote already counted!');
    return;
  }
  RemoAudio.play('click');
  renderWorldSpotlightBar();
  remoToast(t('wspot_next_toast'));
}
window.nextSpotlightAction = nextSpotlightAction;

function giftSpotlightAction() {
  const res = REMO_STORE.giftCurrentSpotlight(25);
  if (!res.ok) {
    if (res.needAuth) openAuthModal();
    else if (res.error === 'cannot_gift_self') remoToast(REMO_I18N.getLang() === 'fr' ? 'Impossible de vous envoyer un cadeau à vous-même !' : 'You cannot gift yourself!');
    else if (res.error === 'insufficient_coins') remoToast(t('wspot_need_coins', { needed: res.needed || 25, have: res.have || 0 }));
    return;
  }
  RemoAudio.play('fanfare');
  spawnRemoCoinsFX(10);
  renderWorldSpotlightBar();
  syncHeaderAndSidebars();
  remoToast(t('wspot_gifted_toast', { amt: res.giftAmt || 25, name: res.creatorName || 'Champion' }), 'fanfare');
}
window.giftSpotlightAction = giftSpotlightAction;

function openSpotlightPostJump(postId) {
  if (!postId) return;
  if (typeof jumpToPostFromNotification === 'function') {
    jumpToPostFromNotification(postId, false);
  }
}
window.openSpotlightPostJump = openSpotlightPostJump;

function challengeFriendOnGame(postId) {
  const lang = REMO_I18N.getLang();
  const isFr = lang === 'fr';
  const p = (REMO_STORE.state.posts || []).find((x) => x && x.id === postId);
  if (!p) return;
  const me = REMO_STORE.getCurrentUser();
  const myName = me ? me.name : 'REMO_Player';
  const myLbEntry = me && Array.isArray(p.leaderboard) ? p.leaderboard.find((e) => e.uid === me.uid) : null;
  const bestScore = Math.max(
    Number(_sessionGameScores[postId] || 0),
    Number(myLbEntry?.score || 0),
    Number(p.leaderboard?.[0]?.score || 100)
  );

  let baseOrigin = 'https://remoworld.com';
  if (window.location.origin && window.location.origin !== 'null' && !window.location.origin.startsWith('file:')) {
    baseOrigin = window.location.origin;
  }
  const url = `${baseOrigin}/?post=${encodeURIComponent(postId)}&challengeScore=${bestScore}&challenger=${encodeURIComponent(myName)}`;
  const shareText = isFr
    ? `⚔️ Peux-tu battre mon score de ${bestScore.toLocaleString()} pts sur REMO Arcade ? Joue directement sans inscription :`
    : `⚔️ Can you beat my ${bestScore.toLocaleString()} pts on REMO Arcade? Play live with zero signup:`;

  if (navigator.share) {
    navigator.share({ title: 'REMO Arcade Challenge', text: shareText, url }).catch(() => {
      copyPostUrlToClipboard(`${shareText} ${url}`, lang);
    });
  } else {
    copyPostUrlToClipboard(`${shareText} ${url}`, lang);
  }
}
window.challengeFriendOnGame = challengeFriendOnGame;

/* ════════════════════════════════════════════════════════════════════
   📲🔥 MODULE 4 (v58): NATIVE BROWSER/PWA PUSH ALERTS (sw.js)
   & 🔥 7-DAY DAILY PASSPORT STREAK (+ MYTHIC 4D CARD ON DAY 7)
   ════════════════════════════════════════════════════════════════════ */
function isNativePushEnabled() {
  if (typeof Notification === 'undefined') return false;
  return Notification.permission === 'granted' && localStorage.getItem('remo_push_enabled') !== '0';
}

function syncPushToggleUI() {
  const btn = document.getElementById('btnPushPermToggle');
  if (!btn) return;
  if (typeof Notification === 'undefined') {
    btn.style.display = 'none';
    return;
  }
  const active = isNativePushEnabled();
  btn.textContent = active ? t('push_enabled_lbl') : t('push_enable_btn');
  btn.style.background = active ? 'rgba(16, 185, 129, 0.2)' : '';
}
window.syncPushToggleUI = syncPushToggleUI;

function toggleNativePushAlerts() {
  if (typeof Notification === 'undefined') return;
  if (Notification.permission === 'granted') {
    const currentlyOn = localStorage.getItem('remo_push_enabled') !== '0';
    localStorage.setItem('remo_push_enabled', currentlyOn ? '0' : '1');
    syncPushToggleUI();
    remoToast(currentlyOn ? t('push_disabled_toast') : t('push_enabled_toast'), 'click');
    return;
  }
  if (Notification.permission === 'denied') {
    remoToast(t('push_blocked_toast'));
    return;
  }
  Notification.requestPermission().then((perm) => {
    if (perm === 'granted') {
      localStorage.setItem('remo_push_enabled', '1');
      syncPushToggleUI();
      RemoAudio.play('fanfare');
      remoToast(t('push_enabled_toast'), 'coin');
    } else if (perm === 'denied') {
      remoToast(t('push_blocked_toast'));
    }
  }).catch(() => {});
}
window.toggleNativePushAlerts = toggleNativePushAlerts;

function triggerNativeDeviceNotification(opts = {}) {
  try {
    if (!isNativePushEnabled()) return;
    if (typeof document !== 'undefined' && !document.hidden) return;
    const title = opts.title || 'REMO World 🌐';
    const options = {
      body: opts.body || '',
      icon: 'img/icon-192.png',
      badge: 'img/icon-192.png',
      tag: opts.tag || ('remo_' + Date.now()),
      vibrate: [180, 80, 180],
      data: opts.data || { url: './index.html' }
    };
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        if (reg && reg.showNotification) {
          reg.showNotification(title, options).catch(() => {});
        }
      }).catch(() => {});
    } else {
      new Notification(title, options);
    }
  } catch (e) {}
}
window.triggerNativeDeviceNotification = triggerNativeDeviceNotification;

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (ev) => {
    const msg = ev && ev.data;
    if (!msg || msg.type !== 'REMO_OS_NOTIF_CLICK' || !msg.data) return;
    const d = msg.data;
    if (d.type === 'message' && d.partnerUid) {
      openDirectChatWithUser(d.partnerUid);
    } else if ((d.type === 'wave' || d.type === 'follow') && d.partnerUid) {
      openCitizenProfileModal(d.partnerUid);
    } else if (d.postId) {
      jumpToPostFromNotification(d.postId, d.type === 'comment');
    }
  });
}

function syncStreakHeaderBadge() {
  const btn = document.getElementById('hdrStreakBtn');
  const valEl = document.getElementById('hdrStreakVal');
  if (!btn || !valEl || !REMO_STORE.getDailyStreakStatus) return;
  const st = REMO_STORE.getDailyStreakStatus();
  valEl.textContent = `${st.currentStreak}d`;
  btn.classList.toggle('unclaimed', Boolean(st.signedIn && st.canClaim));
}
window.syncStreakHeaderBadge = syncStreakHeaderBadge;

function openDailyStreakModal() {
  const modal = document.getElementById('dailyStreakModal');
  const grid = document.getElementById('dailyStreakGridBox');
  const actBox = document.getElementById('dailyStreakActionBox');
  if (!modal || !grid || !actBox || !REMO_STORE.getDailyStreakStatus) return;

  const st = REMO_STORE.getDailyStreakStatus();
  const lang = REMO_I18N.getLang();
  const isFr = lang === 'fr';

  grid.innerHTML = st.rewards.map((coins, idx) => {
    const dayNum = idx + 1;
    const isClaimed = st.canClaim ? (dayNum < st.cycleDay) : (dayNum <= st.cycleDay);
    const isToday = st.canClaim && dayNum === st.cycleDay;
    return `
      <div class="streak-day-card ${isClaimed ? 'claimed' : ''} ${isToday ? 'today' : ''} ${dayNum === 7 ? 'day7-mythic' : ''}">
        <div style="font-size:0.72rem;font-weight:800;color:#cbd5e1;">${escapeHtmlStr(t('streak_day_lbl', { d: dayNum }))}</div>
        <div style="font-family:'Orbitron',sans-serif;font-size:1.05rem;font-weight:900;color:#fde047;margin:5px 0;">
          ${isClaimed ? '✅' : '🪙'} +${coins}
        </div>
        ${dayNum === 7 ? `<div style="font-size:0.68rem;font-weight:900;color:#e9d5ff;">${escapeHtmlStr(t('streak_mythic_bonus'))}</div>` : ''}
      </div>
    `;
  }).join('');

  if (!st.signedIn) {
    actBox.innerHTML = `
      <button type="button" class="btn-cyber btn-gold" style="width:100%;justify-content:center;padding:11px;" onclick="document.getElementById('dailyStreakModal').classList.remove('open');openAuthModal()">
        🪪 ${isFr ? 'Connectez votre Passeport pour réclamer +15 🪙' : 'Sign In to Stamp Passport & Claim +15 🪙'}
      </button>
    `;
  } else if (st.canClaim) {
    actBox.innerHTML = `
      <button type="button" class="btn-cyber btn-gold" style="width:100%;justify-content:center;padding:12px;font-size:0.9rem;" onclick="claimDailyStreakUI()">
        ${escapeHtmlStr(t('streak_claim_btn', { coins: st.todayReward }))}
      </button>
    `;
  } else {
    actBox.innerHTML = `
      <div style="padding:10px 14px;border-radius:12px;background:rgba(16,185,129,0.14);border:1px solid rgba(52,211,153,0.45);color:#6ee7b7;font-weight:800;font-size:0.82rem;">
        ${escapeHtmlStr(t('streak_claimed_lbl'))} (🔥 ${st.currentStreak}d)
      </div>
    `;
  }

  modal.classList.add('open');
}
window.openDailyStreakModal = openDailyStreakModal;

function claimDailyStreakUI() {
  const lang = REMO_I18N.getLang();
  const isFr = lang === 'fr';
  const res = REMO_STORE.claimDailyStreakReward();
  if (!res.ok) return;

  RemoAudio.play('fanfare');
  spawnRemoCoinsFX(16);
  syncHeaderAndSidebars();
  openDailyStreakModal();

  if (res.mintedCard && typeof inspectCardModal === 'function') {
    document.getElementById('dailyStreakModal')?.classList.remove('open');
    inspectCardModal(res.mintedCard);
    remoToast(
      isFr
        ? `🏆 SÉRIE 7 JOURS COMPLÈTE ! +${res.coins} 🪙 + Carte 4D Mythique débloquée !`
        : `🏆 7-DAY STREAK COMPLETE! +${res.coins} 🪙 + Mythic 4D Card unlocked!`,
      'fanfare'
    );
  } else {
    remoToast(
      isFr
        ? `🔥 Jour ${res.streak} tamponné ! +${res.coins} 🪙 ajoutés à votre Passeport !`
        : `🔥 Day ${res.streak} stamped! +${res.coins} 🪙 added to your Passport!`,
      'coin'
    );
  }
}
window.claimDailyStreakUI = claimDailyStreakUI;

/* ═══════════════════════════════════════════════════════════════════════════
   🚀 v59 VIRAL SOCIAL ENGINES (STRICTLY EN / FR):
   1. 🕵️ Guess My City! (Mystery City Post Game + Zero-Signup WhatsApp Loop)
   2. ⚡ Mobile City Clicker War Strip + Guest Coin Vault Flush
   3. 🪟 World Window Sync (Live Photo Time/°C Stamp + 9:16 Dual-City Story)
   4. 🤝 Daily World Match (Cross-City 1-on-1 Icebreakers + Mutual +15 🪙)
═══════════════════════════════════════════════════════════════════════════ */

function _v59HashStr(str) {
  let h = 2166136261;
  const s = String(str || 'remo');
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function _getGuestDeviceVoterId() {
  let gid = localStorage.getItem('remo_guest_vid');
  if (!gid) {
    gid = 'g_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6);
    localStorage.setItem('remo_guest_vid', gid);
  }
  return gid;
}

/* ── 1. 🕵️ GUESS MY CITY! (DEVINE MA VILLE !) ── */
function getViewerMysteryGuess(p, u) {
  if (!p || !p.id) return '';
  if (u && u.uid && p.cityGuesses && p.cityGuesses[u.uid]) {
    return p.cityGuesses[u.uid];
  }
  const localPick = localStorage.getItem('remo_guess_' + p.id);
  if (localPick) return localPick;
  const gid = localStorage.getItem('remo_guest_vid');
  if (gid && p.cityGuesses && p.cityGuesses[gid]) {
    return p.cityGuesses[gid];
  }
  return '';
}

function isMysteryCityMaskedForViewer(p, u) {
  if (!p || !p.mysteryCity) return false;
  if (u && (
    (p.uid && u.uid === p.uid) ||
    (p.authorUid && u.uid === p.authorUid) ||
    (u.email && p.authorEmail && u.email.toLowerCase() === p.authorEmail.toLowerCase())
  )) {
    return false;
  }
  const picked = getViewerMysteryGuess(p, u);
  return !picked;
}
window.isMysteryCityMaskedForViewer = isMysteryCityMaskedForViewer;

function getMysteryCityChoices(p) {
  const allCities = getRemoCities();
  const realCity = getCityById(p.cityId) || allCities[0];
  let pool = allCities.filter((c) => c.id !== realCity.id && c.country_en !== realCity.country_en);
  if (pool.length < 3) {
    pool = allCities.filter((c) => c.id !== realCity.id);
  }
  // Deterministic selection of 3 decoys based on post ID
  let seed = _v59HashStr(p.id + '_decoys');
  const decoys = [];
  const tempPool = pool.slice();
  while (decoys.length < 3 && tempPool.length > 0) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const idx = seed % tempPool.length;
    decoys.push(tempPool.splice(idx, 1)[0]);
  }
  const four = [realCity, ...decoys];
  // Deterministic Fisher-Yates shuffle
  for (let i = four.length - 1; i > 0; i--) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const j = seed % (i + 1);
    const tmp = four[i];
    four[i] = four[j];
    four[j] = tmp;
  }
  return four;
}

function renderMysteryCityWidget(p, city, lang, u, isPostOwner) {
  if (!p || !p.mysteryCity) return '';
  const guessesObj = p.cityGuesses || {};
  const entries = Object.values(guessesObj);
  const totalGuesses = entries.length;
  const solvedCount = entries.filter((cid) => cid === p.cityId).length;

  if (isPostOwner) {
    return `
      <div class="mystery-city-box">
        <div class="mystery-city-hdr" style="margin-bottom:0;">
          <span class="mystery-city-title">${escapeHtmlStr(t('guess_owner_badge', { solved: solvedCount, total: totalGuesses }))}</span>
          <button type="button" class="war-backup-btn" onclick="shareMysteryCityChallenge('${p.id}')">${escapeHtmlStr(t('guess_share_btn'))}</button>
        </div>
      </div>
    `;
  }

  const pickedId = getViewerMysteryGuess(p, u);
  const options = getMysteryCityChoices(p);

  if (!pickedId) {
    return `
      <div class="mystery-city-box">
        <div class="mystery-city-hdr">
          <span class="mystery-city-title">${escapeHtmlStr(t('guess_prompt_title'))}</span>
          <button type="button" class="war-backup-btn" onclick="shareMysteryCityChallenge('${p.id}')">${escapeHtmlStr(t('guess_share_btn'))}</button>
        </div>
        ${totalGuesses > 0 ? `<div style="font-size:0.71rem;color:#cbd5e1;margin-bottom:7px;font-weight:700;">${escapeHtmlStr(t('guess_solved_stats', { solved: solvedCount, total: totalGuesses }))}</div>` : ''}
        <div class="mystery-choice-grid">
          ${options.map((opt) => `
            <button type="button" class="mystery-choice-btn" onclick="submitMysteryCityGuess('${p.id}','${opt.id}')">
              <span>${opt.flag}</span>
              <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtmlStr(getCityName(opt, lang))}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;
  }

  const isWin = pickedId === p.cityId;
  const pickedCity = getCityById(pickedId);
  const resultText = isWin
    ? t('guess_correct_msg', { city: `${city.flag} ${getCityName(city, lang)}` })
    : t('guess_wrong_msg', { picked: getCityName(pickedCity, lang), city: `${city.flag} ${getCityName(city, lang)}` });

  return `
    <div class="mystery-city-box">
      <div class="mystery-city-hdr">
        <span style="font-size:0.73rem;font-weight:800;color:#cbd5e1;">${escapeHtmlStr(t('guess_solved_stats', { solved: solvedCount, total: Math.max(1, totalGuesses) }))}</span>
        <button type="button" class="war-backup-btn" onclick="shareMysteryCityChallenge('${p.id}')">${escapeHtmlStr(t('guess_share_btn'))}</button>
      </div>
      <div class="mystery-choice-grid">
        ${options.map((opt) => {
          const cls = opt.id === p.cityId ? 'correct' : (opt.id === pickedId ? 'wrong' : '');
          return `
            <button type="button" class="mystery-choice-btn ${cls}" disabled>
              <span>${opt.flag}</span>
              <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtmlStr(getCityName(opt, lang))}</span>
            </button>
          `;
        }).join('')}
      </div>
      <div class="mystery-result-banner ${isWin ? 'win' : 'lose'}">
        <span>${escapeHtmlStr(resultText)}</span>
        ${(!u && isWin) ? `<button type="button" class="btn-cyber btn-gold" style="padding:4px 10px;font-size:0.71rem;" onclick="openAuthModal()">${escapeHtmlStr(t('guess_guest_claim_cta'))}</button>` : ''}
      </div>
    </div>
  `;
}
window.renderMysteryCityWidget = renderMysteryCityWidget;

function submitMysteryCityGuess(postId, guessedCityId) {
  const p = findFeedPostById(postId);
  if (!p || !p.mysteryCity) return;
  const u = REMO_STORE.getCurrentUser();
  if (getViewerMysteryGuess(p, u)) return;

  const lang = REMO_I18N.getLang();
  const realCity = getCityById(p.cityId);
  const pickedCity = getCityById(guessedCityId);
  const voterKey = (u && u.uid) ? u.uid : _getGuestDeviceVoterId();

  if (!p.cityGuesses || typeof p.cityGuesses !== 'object') p.cityGuesses = {};
  p.cityGuesses[voterKey] = guessedCityId;
  localStorage.setItem('remo_guess_' + p.id, guessedCityId);

  const isCorrect = guessedCityId === p.cityId;
  if (isCorrect) {
    try { RemoAudio.play('fanfare'); } catch (e) {}
    spawnRemoCoinsFX(10);
    if (u) {
      REMO_STORE.addCoins(u.uid, 10, 8);
      const solvedSoFar = Object.values(p.cityGuesses).filter((cid) => cid === p.cityId).length;
      if (p.uid && p.uid !== u.uid && solvedSoFar <= 20) {
        REMO_STORE.addCoins(p.uid, 2, 2);
        REMO_STORE.addNotification({
          toUid: p.uid,
          fromUid: u.uid,
          fromName: u.name,
          fromCity: u.homeCity || 'montreal',
          type: 'mystery_solved',
          postId: p.id,
          text: 'guessed your Mystery City (+2 🪙)!'
        });
      }
    } else {
      const pending = Math.min(30, Number(localStorage.getItem('remo_guest_mystery_coins') || 0) + 10);
      localStorage.setItem('remo_guest_mystery_coins', String(pending));
    }
    remoToast(t('guess_correct_msg', { city: `${realCity.flag} ${getCityName(realCity, lang)}` }), 'fanfare');
  } else {
    try { RemoAudio.play('hit'); } catch (e) {}
    remoToast(t('guess_wrong_msg', { picked: getCityName(pickedCity, lang), city: `${realCity.flag} ${getCityName(realCity, lang)}` }));
  }

  REMO_STORE.syncPostToCloud(p);
  REMO_STORE.save(true, 'mystery_guess');
  renderSocialFeed();
  syncHeaderAndSidebars();
}
window.submitMysteryCityGuess = submitMysteryCityGuess;

async function shareMysteryCityChallenge(postId) {
  const u = REMO_STORE.getCurrentUser();
  const base = `${window.location.origin}${window.location.pathname}`;
  const refPart = (u && u.referralCode) ? `&ref=${encodeURIComponent(u.referralCode)}` : '';
  const url = `${base}?post=${encodeURIComponent(postId)}&guess=1${refPart}`;
  const msg = t('guess_share_text');

  if (navigator.share) {
    try {
      await navigator.share({ title: 'REMO · Guess My City!', text: msg, url });
      return;
    } catch (err) {
      if (err && err.name === 'AbortError') return;
    }
  }
  copyTextToClipboard(`${msg} ${url}`);
  const waUrl = `https://wa.me/?text=${encodeURIComponent(msg + ' ' + url)}`;
  window.open(waUrl, '_blank', 'noopener,noreferrer');
}
window.shareMysteryCityChallenge = shareMysteryCityChallenge;

/* ── 2. ⚡ MOBILE CITY CLICKER WAR STRIP & GUEST COIN FLUSH ── */
function renderMobileCityWarStrip() {
  const strip = document.getElementById('mobileCityWarStrip');
  if (!strip) return;
  const duels = (REMO_STORE.state.duels || []).filter((w) => w && (!REMO_STORE.deletedDuelIds || !REMO_STORE.deletedDuelIds.has(w.id)));
  if (!duels.length) {
    strip.innerHTML = '';
    return;
  }
  const targetId = window._activeWarDeepLink && window._activeWarDeepLink.warId;
  const w = (targetId && duels.find((d) => d.id === targetId)) || duels[0];
  const lang = REMO_I18N.getLang();
  const cA = getCityById(w.cityA), cB = getCityById(w.cityB);
  const vA = Number(w.votesA || 0), vB = Number(w.votesB || 0);
  const tot = Math.max(1, vA + vB);
  const pA = Math.round((vA / tot) * 100);
  const pB = 100 - pA;
  const u = REMO_STORE.getCurrentUser();
  const myVote = localStorage.getItem('remo_voted_' + w.id) || (u && u.votedWars && u.votedWars[w.id]) || '';
  const votedA = myVote === 'A';
  const votedB = myVote === 'B';
  const hasVoted = Boolean(myVote);
  const prefSide = (window._activeWarDeepLink && window._activeWarDeepLink.side) || (votedB ? 'B' : (votedA ? 'A' : (pA >= pB ? 'A' : 'B')));
  const btnTextA = votedA ? `✓ ${cA.flag} ${escapeHtmlStr(t('war_voted_btn'))}` : `${cA.flag} ${escapeHtmlStr(getCityName(cA, lang))} · ${escapeHtmlStr(t('war_tap_btn'))}`;
  const btnTextB = votedB ? `✓ ${cB.flag} ${escapeHtmlStr(t('war_voted_btn'))}` : `${cB.flag} ${escapeHtmlStr(getCityName(cB, lang))} · ${escapeHtmlStr(t('war_tap_btn'))}`;
  const styleA = votedA ? 'border-color:#10b981;box-shadow:0 0 10px rgba(16,185,129,0.4);font-weight:900;' : (hasVoted ? 'opacity:0.5;' : '');
  const styleB = votedB ? 'border-color:#10b981;box-shadow:0 0 10px rgba(16,185,129,0.4);font-weight:900;' : (hasVoted ? 'opacity:0.5;' : '');

  strip.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:5px;">
      <div style="font-size:0.76rem;font-weight:900;color:#f8fafc;">
        <span style="color:#f472b6;">${escapeHtmlStr(t('war_mobile_strip_lbl'))}:</span>
        ${cA.flag} ${escapeHtmlStr(getCityName(cA, lang))} (${pA}%) vs ${cB.flag} ${escapeHtmlStr(getCityName(cB, lang))} (${pB}%)
      </div>
      <button type="button" class="war-backup-btn" style="padding:3px 9px;font-size:0.68rem;" onclick="shareCityWarBackup('${w.id}','${prefSide}')">${escapeHtmlStr(t('war_backup_btn'))}</button>
    </div>
    <div class="war-bar-track" style="height:8px;margin:4px 0 7px;">
      <div class="war-bar-fill-a" style="width:${pA}%;transition:width 0.18s ease;"></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:7px;">
      <button type="button" class="war-pulse-btn side-a" style="padding:7px 8px;font-size:0.71rem;${styleA}" onclick="voteCityWar('${w.id}','A',event)">
        ${btnTextA}
      </button>
      <button type="button" class="war-pulse-btn side-b" style="padding:7px 8px;font-size:0.71rem;${styleB}" onclick="voteCityWar('${w.id}','B',event)">
        ${btnTextB}
      </button>
    </div>
    ${(!u && hasVoted) ? `
      <div style="margin-top:7px;display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:0.72rem;color:#fde047;font-weight:800;">
        <span>${escapeHtmlStr(t('war_guest_claim_bar', { city: getCityName(prefSide === 'B' ? cB : cA, lang) }))}</span>
        <button type="button" class="btn-cyber btn-gold" style="padding:3px 9px;font-size:0.68rem;" onclick="openAuthModal()">🛂 ${escapeHtmlStr(t('btn_sign_in'))}</button>
      </div>
    ` : ''}
  `;
}
window.renderMobileCityWarStrip = renderMobileCityWarStrip;

function flushPendingGuestV59Rewards() {
  const u = REMO_STORE.getCurrentUser();
  if (!u || !u.uid) return;
  const mCoins = Number(localStorage.getItem('remo_guest_mystery_coins') || 0);
  const wCoins = Number(localStorage.getItem('remo_guest_war_coins') || 0);
  const bCoins = Number(localStorage.getItem('remo_guest_blitz_coins') || 0);
  const total = mCoins + wCoins + bCoins;
  if (total > 0) {
    localStorage.removeItem('remo_guest_mystery_coins');
    localStorage.removeItem('remo_guest_war_coins');
    localStorage.removeItem('remo_guest_blitz_coins');
    REMO_STORE.addCoins(u.uid, total, 10);
    spawnRemoCoinsFX(10);
    const isFr = REMO_I18N.getLang() === 'fr';
    remoToast(
      isFr
        ? `🎁 +${total} 🪙 de vos défis invités ont été crédités sur votre Passeport !`
        : `🎁 +${total} 🪙 from your guest challenges credited to your Passport!`,
      'fanfare'
    );
  }
}
window.flushPendingGuestV59Rewards = flushPendingGuestV59Rewards;

/* ── 3. 🪟 WORLD WINDOW SYNC & 9:16 DUAL-CITY STORY EXPORTER ── */
function openLiveWindowCreator(prefillTag = '#WorldWindow') {
  window._prefillWindowStamp = true;
  openCreatePostModal(prefillTag);
  const winT = document.getElementById('createWindowStampToggle');
  if (winT) winT.checked = true;
}
window.openLiveWindowCreator = openLiveWindowCreator;

function startWorldWindowSync(postId) {
  window._prefillWindowStamp = true;
  startCityDuetFromPost(postId);
  const winT = document.getElementById('createWindowStampToggle');
  if (winT) winT.checked = true;
}
window.startWorldWindowSync = startWorldWindowSync;

function buildLiveWindowStampMeta(cityId) {
  const c = getCityById(cityId);
  const wx = (typeof REMO_WEATHER !== 'undefined' && REMO_WEATHER.getCityLiveStatus)
    ? REMO_WEATHER.getCityLiveStatus(c)
    : { timeStr: '12:00', tempC: 20, icon: '🌤️' };
  return {
    cityId: c.id,
    timeStr: wx.timeStr || '12:00',
    tempC: wx.tempC ?? 20,
    icon: wx.icon || '🌤️',
    stampedAt: Date.now()
  };
}
window.buildLiveWindowStampMeta = buildLiveWindowStampMeta;

function stampPhotoWithLiveCityWindow(blob, cityId, lang) {
  return new Promise((resolve) => {
    try {
      const c = getCityById(cityId);
      const wx = REMO_WEATHER.getCityLiveStatus(c);
      const img = new Image();
      const objUrl = URL.createObjectURL(blob);
      img.onload = () => {
        try {
          URL.revokeObjectURL(objUrl);
          const maxDim = 1440;
          let w = img.naturalWidth || img.width || 1080;
          let h = img.naturalHeight || img.height || 1080;
          if (w > maxDim || h > maxDim) {
            const ratio = Math.min(maxDim / w, maxDim / h);
            w = Math.round(w * ratio);
            h = Math.round(h * ratio);
          }
          const cv = document.createElement('canvas');
          cv.width = w;
          cv.height = h;
          const ctx = cv.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);

          // Bottom gradient + holographic live city time & weather bar
          const barH = Math.max(46, Math.round(h * 0.068));
          const grad = ctx.createLinearGradient(0, h - barH * 1.9, 0, h);
          grad.addColorStop(0, 'rgba(5, 8, 22, 0)');
          grad.addColorStop(1, 'rgba(5, 8, 22, 0.88)');
          ctx.fillStyle = grad;
          ctx.fillRect(0, h - barH * 1.9, w, barH * 1.9);

          const padX = Math.round(w * 0.032);
          const fontPx = Math.max(15, Math.round(barH * 0.42));
          ctx.font = `900 ${fontPx}px "Orbitron", "Outfit", sans-serif`;
          ctx.textBaseline = 'middle';

          const stampLine = `🪟 ${c.flag} ${getCityName(c, lang || 'en').toUpperCase()} · 🕒 ${wx.timeStr} · ${wx.icon} ${wx.tempC}°C`;
          ctx.fillStyle = '#fde047';
          ctx.fillText(stampLine, padX, h - barH * 0.56);

          ctx.font = `800 ${Math.max(12, Math.round(fontPx * 0.72))}px "Orbitron", sans-serif`;
          ctx.textAlign = 'right';
          ctx.fillStyle = '#38bdf8';
          ctx.fillText('REMOWORLD.COM · LIVE', w - padX, h - barH * 0.56);
          ctx.textAlign = 'left';

          cv.toBlob((stampedBlob) => {
            resolve(stampedBlob || blob);
          }, 'image/jpeg', 0.91);
        } catch (err) {
          resolve(blob);
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(objUrl);
        resolve(blob);
      };
      img.src = objUrl;
    } catch (e) {
      resolve(blob);
    }
  });
}
window.stampPhotoWithLiveCityWindow = stampPhotoWithLiveCityWindow;

function renderWorldWindowActionsBar(p, lang) {
  if (!p) return '';
  const isDuet = Boolean(p.duetOf && p.duetOf.cityId);
  const canSyncDuet = !isDuet && ['image', 'carousel', 'city_art', 'text_card'].includes(p.mediaType);
  const showStoryBtn = Boolean(isDuet || p.isWorldWindow);
  if (!canSyncDuet && !showStoryBtn) return '';

  return `
    <div class="window-sync-actions">
      ${canSyncDuet ? `<button type="button" class="btn-window-sync" onclick="startWorldWindowSync('${p.id}')">${escapeHtmlStr(t('win_sync_duet_btn'))}</button>` : ''}
      ${showStoryBtn ? `<button type="button" class="btn-window-story" onclick="exportWorldWindowStory('${p.id}')">${escapeHtmlStr(t('win_story_916_btn'))}</button>` : ''}
    </div>
  `;
}
window.renderWorldWindowActionsBar = renderWorldWindowActionsBar;

async function _loadImageSafeForStory(srcUrl) {
  if (!srcUrl) return null;
  let resolvedSrc = String(srcUrl);
  if (resolvedSrc.startsWith('idb://') && typeof RemoMediaDB !== 'undefined') {
    const syncVal = RemoMediaDB.resolveSyncOrPlaceholder ? RemoMediaDB.resolveSyncOrPlaceholder(resolvedSrc) : '';
    if (syncVal && !String(syncVal).startsWith('idb://')) {
      resolvedSrc = String(syncVal);
    } else if (RemoMediaDB.getObjectUrl) {
      try {
        const asyncVal = await RemoMediaDB.getObjectUrl(resolvedSrc);
        resolvedSrc = (asyncVal && !String(asyncVal).startsWith('idb://')) ? String(asyncVal) : '';
      } catch (e) {
        resolvedSrc = '';
      }
    } else {
      resolvedSrc = '';
    }
  }
  if (!resolvedSrc) return null;
  return new Promise((resolve) => {
    const img = new Image();
    const isHttp = /^https?:/i.test(resolvedSrc);
    if (isHttp) img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => {
      if (!isHttp) { resolve(null); return; }
      const imgNoCors = new Image();
      imgNoCors.onload = () => resolve(imgNoCors);
      imgNoCors.onerror = () => resolve(null);
      imgNoCors.src = resolvedSrc;
    };
    img.src = resolvedSrc;
  });
}

function _drawCoverPane(ctx, img, cityObj, lang, x, y, w, h) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  if (img && (img.naturalWidth || img.width)) {
    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;
    const scale = Math.max(w / iw, h / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
  } else {
    const g = ctx.createLinearGradient(x, y, x + w, y + h);
    g.addColorStop(0, '#1e1b4b');
    g.addColorStop(1, '#0f172a');
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w, h);
    ctx.font = '900 96px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fillText(cityObj.flag || '🌍', x + w / 2, y + h / 2 - 10);
    ctx.font = '900 42px "Orbitron", sans-serif';
    ctx.fillStyle = '#fde047';
    ctx.fillText(getCityName(cityObj, lang).toUpperCase(), x + w / 2, y + h / 2 + 64);
  }
  const overlay = ctx.createLinearGradient(0, y + h - 130, 0, y + h);
  overlay.addColorStop(0, 'rgba(5,8,20,0)');
  overlay.addColorStop(1, 'rgba(5,8,20,0.88)');
  ctx.fillStyle = overlay;
  ctx.fillRect(x, y + h - 130, w, 130);
  ctx.restore();
}

async function exportWorldWindowStory(postId) {
  const p = (REMO_STORE.state.posts || []).find((x) => x && x.id === postId);
  if (!p) return;
  const lang = REMO_I18N.getLang();
  const cv = document.getElementById('citizenStoryCanvasPreview');
  const modal = document.getElementById('storyExportModal');
  if (!cv) return;

  cv.width = 1080;
  cv.height = 1920;
  const ctx = cv.getContext('2d');

  // Deep cosmic background
  const bg = ctx.createLinearGradient(0, 0, 1080, 1920);
  bg.addColorStop(0, '#050816');
  bg.addColorStop(0.5, '#0f172a');
  bg.addColorStop(1, '#050816');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 1080, 1920);

  // Header
  ctx.textAlign = 'center';
  ctx.font = '900 34px "Orbitron", sans-serif';
  ctx.fillStyle = '#fbbf24';
  ctx.fillText('🌐 REMO WORLD · LIVE WINDOW 9:16', 540, 78);
  ctx.font = '700 22px "Outfit", sans-serif';
  ctx.fillStyle = '#7dd3fc';
  ctx.fillText(lang === 'fr' ? 'Deux Villes Connectées au Même Instant' : 'Real Moments Across World Cities', 540, 116);

  const rightCity = getCityById(p.cityId);
  const rightWx = REMO_WEATHER.getCityLiveStatus(rightCity);
  const rightImgRaw = (p.mediaType === 'text_card' && p.textCard)
    ? renderTextCardToDataUrl(p, 0, { width: 972, height: 1360 })
    : (p.mediaUrl || (p.mediaUrls && p.mediaUrls[0]) || '');
  const rightImg = await _loadImageSafeForStory(rightImgRaw);

  if (p.duetOf && p.duetOf.cityId) {
    const leftCity = getCityById(p.duetOf.cityId);
    const leftWx = REMO_WEATHER.getCityLiveStatus(leftCity);
    const leftImgRaw = (p.duetOf.mediaType === 'text_card' && p.duetOf.textCard)
      ? renderTextCardToDataUrl({ ...p.duetOf, cityId: leftCity.id }, 0, { width: 972, height: 640 })
      : (p.duetOf.mediaUrl || (p.duetOf.mediaUrls && p.duetOf.mediaUrls[0]) || '');
    const leftImg = await _loadImageSafeForStory(leftImgRaw);

    // Top Pane (City A)
    _drawCoverPane(ctx, leftImg, leftCity, lang, 54, 150, 972, 640);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
    ctx.lineWidth = 4;
    ctx.strokeRect(54, 150, 972, 640);
    ctx.textAlign = 'left';
    ctx.font = '900 28px "Orbitron", sans-serif';
    ctx.fillStyle = '#fde047';
    ctx.fillText(`${leftCity.flag} ${getCityName(leftCity, lang).toUpperCase()} · 🕒 ${leftWx.timeStr} · ${leftWx.tempC}°C`, 82, 758);
    ctx.textAlign = 'right';
    ctx.font = '800 24px "Outfit", sans-serif';
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText(`@${p.duetOf.authorName || 'Citizen'}`, 998, 758);

    // Center Distance Bridge Ribbon
    const km = Math.round(computeHaversineKm(leftCity.lat, leftCity.lng, rightCity.lat, rightCity.lng));
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(140, 808, 800, 58);
    ctx.textAlign = 'center';
    ctx.font = '900 26px "Orbitron", sans-serif';
    ctx.fillStyle = '#050816';
    ctx.fillText(`⚡ ${leftCity.code} ⇄ ${rightCity.code} · ${km.toLocaleString()} KM LIVE SYNC`, 540, 846);

    // Bottom Pane (City B)
    _drawCoverPane(ctx, rightImg, rightCity, lang, 54, 884, 972, 640);
    ctx.strokeStyle = 'rgba(244, 114, 182, 0.75)';
    ctx.lineWidth = 4;
    ctx.strokeRect(54, 884, 972, 640);
    ctx.textAlign = 'left';
    ctx.font = '900 28px "Orbitron", sans-serif';
    ctx.fillStyle = '#fde047';
    ctx.fillText(`${rightCity.flag} ${getCityName(rightCity, lang).toUpperCase()} · 🕒 ${rightWx.timeStr} · ${rightWx.tempC}°C`, 82, 1492);
    ctx.textAlign = 'right';
    ctx.font = '800 24px "Outfit", sans-serif';
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText(`@${p.authorName || 'Citizen'}`, 998, 1492);
  } else {
    _drawCoverPane(ctx, rightImg, rightCity, lang, 54, 155, 972, 1360);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.75)';
    ctx.lineWidth = 4;
    ctx.strokeRect(54, 155, 972, 1360);
    ctx.textAlign = 'left';
    ctx.font = '900 30px "Orbitron", sans-serif';
    ctx.fillStyle = '#fde047';
    ctx.fillText(`${rightCity.flag} ${getCityName(rightCity, lang).toUpperCase()} · 🕒 ${rightWx.timeStr} · ${rightWx.tempC}°C`, 84, 1480);
    ctx.textAlign = 'right';
    ctx.font = '800 25px "Outfit", sans-serif';
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText(`@${p.authorName || 'Citizen'}`, 996, 1480);
  }

  // Bottom QR & Brand Bar
  const u = REMO_STORE.getCurrentUser();
  const refPart = (u && u.referralCode) ? `&ref=${encodeURIComponent(u.referralCode)}` : '';
  const postUrl = `${window.location.origin}${window.location.pathname}?post=${encodeURIComponent(p.id)}${refPart}`;

  ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
  ctx.strokeStyle = 'rgba(251, 191, 36, 0.55)';
  ctx.lineWidth = 3;
  ctx.fillRect(54, 1560, 972, 300);
  ctx.strokeRect(54, 1560, 972, 300);

  if (typeof RemoQREngine !== 'undefined' && RemoQREngine.toCanvas) {
    try {
      const qrCv = RemoQREngine.toCanvas(postUrl, 220);
      ctx.drawImage(qrCv, 84, 1600, 220, 220);
    } catch (e) {}
  }

  ctx.textAlign = 'left';
  ctx.font = '900 32px "Orbitron", sans-serif';
  ctx.fillStyle = '#fbbf24';
  ctx.fillText('REMOWORLD.COM', 340, 1655);
  ctx.font = '800 24px "Outfit", sans-serif';
  ctx.fillStyle = '#f8fafc';
  ctx.fillText(lang === 'fr' ? '🪟 Synchronise la vue de ta ville (+25 🪙)' : '🪟 Sync your city’s live view (+25 🪙)', 340, 1705);
  ctx.font = '700 21px "Outfit", sans-serif';
  ctx.fillStyle = '#34d399';
  ctx.fillText(lang === 'fr' ? '✓ Scanne le QR ou ouvre le lien en direct' : '✓ Scan QR or open live link to join', 340, 1752);
  ctx.fillStyle = '#38bdf8';
  ctx.fillText(u && u.referralCode ? `CODE: ${u.referralCode} (+100 🪙)` : 'FREE CITIZEN PASSPORT (+150 🪙)', 340, 1798);

  window._customStoryShareMeta = {
    url: postUrl,
    title: 'REMO World · Live World Window 9:16',
    text: lang === 'fr'
      ? `🪟 Regarde cette Fenêtre Monde en direct sur REMO et synchronise ta ville (+25 🪙) !`
      : `🪟 Check out this Live World Window on REMO and sync your city (+25 🪙)!`,
    filename: `REMO_World_Window_${p.id}.png`
  };

  if (cv.toBlob) {
    cv.toBlob((b) => {
      if (b) {
        window._cachedStoryBlob = b;
        try {
          window._cachedStoryFile = new File([b], `REMO_World_Window_${p.id}.png`, { type: 'image/png' });
        } catch (e) {
          window._cachedStoryFile = null;
        }
      }
    }, 'image/png');
  }

  if (modal) modal.classList.add('open');
  remoToast(t('win_story_ready_toast'), 'fanfare');
}
window.exportWorldWindowStory = exportWorldWindowStory;

/* ── 4. 🤝 DAILY WORLD MATCH (CONNEXION PLANÉTAIRE) ── */
function getTodayWorldMatch(me) {
  if (!me || !me.uid) return null;
  const allUsers = (REMO_STORE.state.users || []).filter((u) =>
    u && u.uid && u.uid !== me.uid && !u.banned &&
    (!REMO_STORE.deletedUserIds || !REMO_STORE.deletedUserIds.has(u.uid))
  );
  if (allUsers.length === 0) return null;

  const crossCity = allUsers.filter((u) => (u.homeCity || 'montreal') !== (me.homeCity || 'montreal'));
  const pool = crossCity.length > 0 ? crossCity : allUsers;
  pool.sort((a, b) => String(a.uid).localeCompare(String(b.uid)));

  const dateKey = REMO_STORE._getLocalDateKey(0);
  const idx = _v59HashStr(`${dateKey}_${me.uid}`) % pool.length;
  const partner = pool[idx];
  const myCity = getCityById(me.homeCity || 'montreal');
  const partnerCity = getCityById(partner.homeCity || 'paris');
  const km = Math.round(computeHaversineKm(myCity.lat, myCity.lng, partnerCity.lat, partnerCity.lng));
  const sortedPair = [me.uid, partner.uid].sort().join('_');
  const matchKey = `match_${dateKey}_${sortedPair}`;

  return { partner, myCity, partnerCity, km, dateKey, matchKey };
}
window.getTodayWorldMatch = getTodayWorldMatch;

function getDailyMatchThreadStatus(meUid, partnerUid, matchKey) {
  const dms = REMO_STORE.state.directMessages || [];
  let sentByMe = false;
  let sentByPartner = false;
  let rewarded = Boolean(localStorage.getItem('remo_match_rewarded_' + matchKey));

  dms.forEach((d) => {
    if (!d || d.dailyMatchKey !== matchKey) return;
    if (d.dailyMatchRewarded) rewarded = true;
    if (d.fromUid === meUid) sentByMe = true;
    if (d.fromUid === partnerUid) sentByPartner = true;
  });

  return { sentByMe, sentByPartner, rewarded };
}

function openDailyMatchInMessages() {
  const me = REMO_STORE.getCurrentUser();
  if (!me) { openAuthModal(); return; }
  const match = getTodayWorldMatch(me);
  if (match && match.partner) {
    activeDmPartnerUid = match.partner.uid;
  }
  switchRemoView('messages');
}
window.openDailyMatchInMessages = openDailyMatchInMessages;

function dismissFeedDailyMatchPill(ev) {
  if (ev) ev.stopPropagation();
  const dateKey = REMO_STORE._getLocalDateKey(0);
  localStorage.setItem('remo_hide_match_pill_' + dateKey, '1');
  const pill = document.getElementById('feedDailyMatchPill');
  if (pill) pill.style.display = 'none';
}
window.dismissFeedDailyMatchPill = dismissFeedDailyMatchPill;

function renderFeedDailyMatchPill() {
  const pill = document.getElementById('feedDailyMatchPill');
  if (!pill) return;
  const me = REMO_STORE.getCurrentUser();
  if (!me) {
    pill.style.display = 'none';
    return;
  }
  const match = getTodayWorldMatch(me);
  if (!match) {
    pill.style.display = 'none';
    return;
  }
  if (localStorage.getItem('remo_hide_match_pill_' + match.dateKey) === '1') {
    pill.style.display = 'none';
    return;
  }
  const st = getDailyMatchThreadStatus(me.uid, match.partner.uid, match.matchKey);
  if (st.rewarded || st.sentByMe) {
    pill.style.display = 'none';
    return;
  }
  const lang = REMO_I18N.getLang();
  pill.style.display = 'flex';
  pill.onclick = () => openDailyMatchInMessages();
  pill.innerHTML = `
    <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
      ${escapeHtmlStr(t('match_feed_pill', {
        name: match.partner.name,
        flag: match.partnerCity.flag,
        city: getCityName(match.partnerCity, lang),
        km: match.km.toLocaleString()
      }))}
    </span>
    <button type="button" class="modal-close" style="width:22px;height:22px;font-size:0.7rem;flex-shrink:0;" onclick="dismissFeedDailyMatchPill(event)">✕</button>
  `;
}
window.renderFeedDailyMatchPill = renderFeedDailyMatchPill;

function renderDailyWorldMatchBox(me, lang) {
  const box = document.getElementById('dailyWorldMatchBox');
  if (!box) return;
  if (!me || !me.uid) {
    box.style.display = 'none';
    return;
  }
  const match = getTodayWorldMatch(me);
  if (!match) {
    box.style.display = 'none';
    return;
  }

  const pName = match.partner.name;
  const pCityName = getCityName(match.partnerCity, lang);
  const st = getDailyMatchThreadStatus(me.uid, match.partner.uid, match.matchKey);

  const ice1 = t('match_ice_1', { city: pCityName });
  const ice2 = t('match_ice_2', { city: pCityName });
  const ice3 = t('match_ice_3', { city: pCityName });

  let footerHtml = '';
  if (st.rewarded) {
    footerHtml = `<div style="margin-top:8px;font-size:0.76rem;font-weight:800;color:#6ee7b7;">${escapeHtmlStr(t('match_completed_status'))}</div>`;
  } else if (st.sentByMe && !st.sentByPartner) {
    footerHtml = `<div style="margin-top:8px;font-size:0.75rem;font-weight:800;color:#fde047;">${escapeHtmlStr(t('match_sent_status', { name: pName }))}</div>`;
  } else {
    footerHtml = `
      <div class="daily-match-icebreakers">
        <button type="button" class="icebreaker-pill" onclick="sendDailyMatchIcebreaker(1)">${escapeHtmlStr(ice1)}</button>
        <button type="button" class="icebreaker-pill" onclick="sendDailyMatchIcebreaker(2)">${escapeHtmlStr(ice2)}</button>
        <button type="button" class="icebreaker-pill" onclick="sendDailyMatchIcebreaker(3)">${escapeHtmlStr(ice3)}</button>
      </div>
    `;
  }

  box.style.display = 'block';
  box.innerHTML = `
    <div class="daily-match-top">
      <div>
        <div style="font-family:'Orbitron',sans-serif;font-size:0.8rem;font-weight:900;color:#34d399;">
          ${escapeHtmlStr(t('match_box_title'))} · <span style="color:#fde047;">${match.myCity.flag} ⇄ ${match.partnerCity.flag} ${match.km.toLocaleString()} km</span>
        </div>
        <div style="font-size:0.73rem;color:#cbd5e1;margin-top:2px;">${escapeHtmlStr(t('match_box_sub'))}</div>
      </div>
      <button type="button" class="btn-ghost" style="padding:5px 11px;font-size:0.75rem;border-color:#34d399;color:#a7f3d0;" onclick="selectDmPartner('${match.partner.uid}')">
        ${match.partnerCity.flag} @${escapeHtmlStr(pName)}
      </button>
    </div>
    ${footerHtml}
  `;
}
window.renderDailyWorldMatchBox = renderDailyWorldMatchBox;

function sendDailyMatchIcebreaker(iceNum) {
  const me = REMO_STORE.getCurrentUser();
  if (!me) { openAuthModal(); return; }
  const match = getTodayWorldMatch(me);
  if (!match) return;
  const lang = REMO_I18N.getLang();
  const pCityName = getCityName(match.partnerCity, lang);

  const key = iceNum === 2 ? 'match_ice_2' : (iceNum === 3 ? 'match_ice_3' : 'match_ice_1');
  const txt = t(key, { city: pCityName });

  activeDmPartnerUid = match.partner.uid;
  const newDm = {
    id: 'dm_match_' + Date.now() + '_' + Math.random().toString(36).slice(2, 5),
    fromUid: me.uid,
    fromName: me.name,
    fromCity: me.homeCity || 'montreal',
    toUid: match.partner.uid,
    text: txt,
    isDailyMatch: true,
    dailyMatchKey: match.matchKey,
    dailyMatchRewarded: false,
    read: false,
    ts: Date.now()
  };

  REMO_STORE.state.directMessages.push(newDm);
  checkAndRewardMutualDailyMatch(me, match.partner.uid, newDm);
  try { RemoAudio.play('chime'); } catch (e) {}
  REMO_STORE.save(true, 'dm');
  REMO_STORE.syncDmToCloud(newDm);
  renderDirectMessagesView();
  renderFeedDailyMatchPill();
  if (typeof updateUnreadBadges === 'function') updateUnreadBadges();
}
window.sendDailyMatchIcebreaker = sendDailyMatchIcebreaker;

function checkAndRewardMutualDailyMatch(sender, receiverUid, replyDm) {
  if (!sender || !sender.uid || !receiverUid || sender.uid === receiverUid) return false;
  const now = Date.now();
  const DAY_MS = 86400000;
  const allDms = REMO_STORE.state.directMessages || [];

  // Look for an incoming Daily Match message from receiverUid to sender.uid within the last 24h
  const incomingMatchDm = allDms.find((d) =>
    d &&
    d.isDailyMatch &&
    d.dailyMatchKey &&
    d.fromUid === receiverUid &&
    d.toUid === sender.uid &&
    (now - Number(d.ts || 0) <= DAY_MS)
  );
  if (!incomingMatchDm) return false;

  const mKey = incomingMatchDm.dailyMatchKey;
  const alreadyRewarded = Boolean(localStorage.getItem('remo_match_rewarded_' + mKey)) ||
    allDms.some((d) => d && d.dailyMatchKey === mKey && d.dailyMatchRewarded);
  if (alreadyRewarded) return false;

  localStorage.setItem('remo_match_rewarded_' + mKey, '1');
  incomingMatchDm.dailyMatchRewarded = true;
  if (replyDm) {
    replyDm.isDailyMatch = true;
    replyDm.dailyMatchKey = mKey;
    replyDm.dailyMatchRewarded = true;
  }

  REMO_STORE.addCoins(sender.uid, 15, 10);
  REMO_STORE.addCoins(receiverUid, 15, 10);
  REMO_STORE.syncDmToCloud(incomingMatchDm);

  const partnerUser = (REMO_STORE.state.users || []).find((u) => u && u.uid === receiverUid);
  const partnerName = (partnerUser && partnerUser.name) || incomingMatchDm.fromName || 'Citizen';

  REMO_STORE.addNotification({
    toUid: receiverUid,
    fromUid: sender.uid,
    fromName: sender.name,
    fromCity: sender.homeCity || 'montreal',
    type: 'daily_match',
    text: 'Daily World Match unlocked! +15 🪙 each!'
  });

  try { RemoAudio.play('fanfare'); } catch (e) {}
  spawnRemoCoinsFX(14);
  remoToast(t('match_mutual_toast', { name: partnerName }), 'fanfare');
  return true;
}
window.checkAndRewardMutualDailyMatch = checkAndRewardMutualDailyMatch;

/* ═══════════════════════════════════════════════════════════════════════════
   📻🎛️💿 v60 AUDIO & CLEAN-FEED ENGINES (STRICTLY EN / FR):
   1. ⚡ Clean Feed Collapsible Pulse Drawer (Zero Screen Clutter)
   2. 💿 Copyright-Free Photo Soundtracks & Spinning Vinyl Corner Disc
   3. 🎛️ REMO Beat-Pad 4D Sequencer Studio + Feed Player + 1-Click Remix
═══════════════════════════════════════════════════════════════════════════ */

/* ── 1. ⚡ CLEAN FEED COLLAPSIBLE PULSE DRAWER ── */
function openCleanFeedPulseDrawer(forceOpen = true) {
  const drawer = document.getElementById('cleanFeedPulseDrawer');
  const arrow = document.getElementById('cleanFeedPulseArrow');
  if (!drawer) return;
  if (forceOpen) {
    if (typeof closeTopFeedDrawers === 'function') closeTopFeedDrawers('pulse');
  }
  drawer.classList.toggle('open', Boolean(forceOpen));
  if (arrow) {
    arrow.textContent = forceOpen ? t('clean_pulse_hide') : t('clean_pulse_open');
    arrow.setAttribute('data-i18n', forceOpen ? 'clean_pulse_hide' : 'clean_pulse_open');
  }
  if (forceOpen && typeof initDesktopHorizontalScrollRails === 'function') {
    setTimeout(initDesktopHorizontalScrollRails, 40);
  }
}
window.openCleanFeedPulseDrawer = openCleanFeedPulseDrawer;

function toggleCleanFeedPulseDrawer() {
  const drawer = document.getElementById('cleanFeedPulseDrawer');
  if (!drawer) return;
  const nextOpen = !drawer.classList.contains('open');
  openCleanFeedPulseDrawer(nextOpen);
}
window.toggleCleanFeedPulseDrawer = toggleCleanFeedPulseDrawer;

/* ── 2. 💿 COPYRIGHT-FREE PHOTO SOUNDTRACKS ── */
const SOUNDTRACK_I18N_MAP = {
  lofi_rain: 'sound_lofi_rain',
  french_cafe: 'sound_french_cafe',
  shibuya_neon: 'sound_shibuya_neon',
  sunset_house: 'sound_sunset_house',
  afro_groove: 'sound_afro_groove',
  velvet_jazz: 'sound_velvet_jazz',
  cyber_pulse: 'sound_cyber_pulse',
  acoustic_breeze: 'sound_acoustic_breeze',
  city_radio: 'sound_city_radio'
};

function getSoundtrackDisplayLabel(soundId) {
  const key = SOUNDTRACK_I18N_MAP[soundId];
  return key ? t(key) : '💿 REMO Loop';
}

function previewStudioPhotoSoundtrack(soundId) {
  if (!window.RemoAudio) return;
  if (!soundId || soundId === 'city_radio') {
    window.RemoAudio.stopSoundtrackLoop();
    return;
  }
  window.RemoAudio.playSoundtrackLoop(soundId, 'studio_preview');
}
window.previewStudioPhotoSoundtrack = previewStudioPhotoSoundtrack;

function renderPostSoundtrackDisc(p) {
  if (!p || !p.soundtrackId) return '';
  let isPlaying = false;
  if (p.soundtrackId === 'city_radio') {
    isPlaying = Boolean(window.REMO_RADIO && window.REMO_RADIO.isPlaying);
  } else if (window.RemoAudio) {
    isPlaying = window.RemoAudio.activeSoundtrackPostId === p.id;
  }
  const shortLabel = getSoundtrackDisplayLabel(p.soundtrackId).replace(/^[^\s]+\s*/, '');
  return `
    <button type="button" class="post-sound-disc ${isPlaying ? 'playing' : ''}" data-sound-post="${p.id}" data-sound-id="${escapeHtmlStr(p.soundtrackId)}" onclick="togglePostSoundtrack('${p.id}', event)" title="${escapeHtmlStr(getSoundtrackDisplayLabel(p.soundtrackId))}">
      <span class="disc-ic">💿</span>
      <span style="max-width:110px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtmlStr(shortLabel)}</span>
    </button>
  `;
}
window.renderPostSoundtrackDisc = renderPostSoundtrackDisc;

function togglePostSoundtrack(postId, ev) {
  if (ev) ev.stopPropagation();
  const p = (REMO_STORE.state.posts || []).find((x) => x && x.id === postId);
  if (!p || !p.soundtrackId) return;

  if (p.soundtrackId === 'city_radio') {
    if (window.REMO_RADIO) {
      if (window.REMO_RADIO.isPlaying) {
        window.REMO_RADIO.pause();
      } else {
        const tuned = window.REMO_RADIO.tuneToCity(p.cityId, true);
        if (!tuned) window.REMO_RADIO.play();
        remoToast(t('sound_playing_toast', { name: window.REMO_RADIO.currentStation?.name || 'Radio' }), 'coin');
      }
      syncActivePostAudioDOM();
    }
    return;
  }

  if (window.RemoAudio) {
    const started = window.RemoAudio.playSoundtrackLoop(p.soundtrackId, p.id);
    if (started) {
      remoToast(t('sound_playing_toast', { name: getSoundtrackDisplayLabel(p.soundtrackId) }), 'coin');
    }
    syncActivePostAudioDOM();
  }
}
window.togglePostSoundtrack = togglePostSoundtrack;

/* ── 3. 🎛️ REMO BEAT-PAD 4D STUDIO & FEED PLAYER ── */
let _studioBeatRows = [
  [1, 0, 0, 0, 1, 0, 0, 0], // 🥁 Kick
  [0, 0, 1, 0, 0, 0, 1, 0], // 👏 Clap
  [1, 0, 0, 1, 0, 1, 0, 0], // 🎸 Bass
  [1, 0, 1, 0, 1, 1, 0, 1]  // 🎹 Synth
];

function getStudioBeatPatternSnapshot() {
  const bpm = Number(document.getElementById('beatStudioBpmSel')?.value || 118);
  const scale = document.getElementById('beatStudioScaleSel')?.value || 'cyber';
  return {
    bpm,
    scale,
    rows: _studioBeatRows.map((r) => r.slice(0, 8))
  };
}
window.getStudioBeatPatternSnapshot = getStudioBeatPatternSnapshot;

function renderBeatStudioMatrix() {
  const box = document.getElementById('studioBeatMatrix');
  if (!box) return;
  const rowLabels = ['🥁 Kick', '👏 Clap', '🎸 Bass', '🎹 Synth'];
  box.innerHTML = rowLabels.map((lbl, rIdx) => `
    <div class="beat-row-wrap">
      <div class="beat-row-lbl">${lbl}</div>
      ${[0, 1, 2, 3, 4, 5, 6, 7].map((cIdx) => {
        const isOn = Boolean(_studioBeatRows[rIdx] && _studioBeatRows[rIdx][cIdx]);
        return `<button type="button" class="beat-pad-cell r${rIdx} ${isOn ? 'on' : ''}" data-beat-r="${rIdx}" data-beat-c="${cIdx}" onclick="toggleBeatStudioCell(${rIdx}, ${cIdx})"></button>`;
      }).join('')}
    </div>
  `).join('');
  syncBeatStudioPlayBtnDOM();
}
window.renderBeatStudioMatrix = renderBeatStudioMatrix;

function toggleBeatStudioCell(r, c) {
  if (!_studioBeatRows[r]) return;
  _studioBeatRows[r][c] = _studioBeatRows[r][c] ? 0 : 1;
  if (_studioBeatRows[r][c] && window.RemoAudio) {
    const scale = document.getElementById('beatStudioScaleSel')?.value || 'cyber';
    window.RemoAudio.playSingleDrumPad(r, c, scale, 0.9);
  }
  renderBeatStudioMatrix();
  if (window.RemoAudio && window.RemoAudio.activeBeatTargetId === 'studio_preview') {
    window.RemoAudio.stopBeatPattern(true);
    toggleBeatStudioPreview();
  }
}
window.toggleBeatStudioCell = toggleBeatStudioCell;

function randomizeBeatStudio() {
  const presets = [
    [[1,0,0,0, 1,0,0,0], [0,0,1,0, 0,0,1,0], [1,0,1,1, 0,1,0,1], [1,1,0,1, 1,0,1,1]],
    [[1,0,0,1, 0,0,1,0], [0,0,1,0, 0,0,1,0], [1,0,0,1, 1,0,1,0], [0,1,1,0, 1,0,1,1]],
    [[1,0,1,0, 1,0,1,0], [0,0,1,0, 0,0,1,1], [1,1,0,0, 1,1,0,1], [1,0,1,1, 0,1,1,0]],
    [[1,0,0,0, 0,1,0,0], [0,0,0,0, 1,0,0,0], [1,0,1,0, 0,1,1,0], [1,1,0,1, 1,0,0,1]]
  ];
  const pick = presets[Math.floor(Math.random() * presets.length)];
  _studioBeatRows = pick.map((row) => row.map((v) => (Math.random() < 0.14 ? (v ? 0 : 1) : v)));
  _studioBeatRows[0][0] = 1; // Always anchor downbeat kick
  renderBeatStudioMatrix();
  if (window.RemoAudio) {
    window.RemoAudio.stopBeatPattern(true);
  }
  toggleBeatStudioPreview();
}
window.randomizeBeatStudio = randomizeBeatStudio;

function clearBeatStudioGrid() {
  _studioBeatRows = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  if (window.RemoAudio && window.RemoAudio.activeBeatTargetId === 'studio_preview') {
    window.RemoAudio.stopBeatPattern();
  }
  renderBeatStudioMatrix();
}
window.clearBeatStudioGrid = clearBeatStudioGrid;

function highlightStudioPlayhead(stepIdx) {
  document.querySelectorAll('#studioBeatMatrix .beat-pad-cell').forEach((el) => {
    const col = Number(el.getAttribute('data-beat-c'));
    el.classList.toggle('playhead', col === stepIdx);
  });
}

function syncBeatStudioPlayBtnDOM() {
  const btn = document.getElementById('btnBeatStudioPlay');
  if (!btn) return;
  const active = Boolean(window.RemoAudio && window.RemoAudio.activeBeatTargetId === 'studio_preview');
  btn.innerHTML = active ? `${escapeHtmlStr(t('beat_stop_btn'))}` : `▶️ ${escapeHtmlStr(t('beat_play_btn'))}`;
}

function toggleBeatStudioPreview() {
  if (!window.RemoAudio) return;
  const snap = getStudioBeatPatternSnapshot();
  const started = window.RemoAudio.playBeatPattern(snap, 'studio_preview', highlightStudioPlayhead);
  if (!started) {
    highlightStudioPlayhead(-1);
  }
  syncBeatStudioPlayBtnDOM();
}
window.toggleBeatStudioPreview = toggleBeatStudioPreview;

function onBeatStudioConfigChange() {
  if (window.RemoAudio && window.RemoAudio.activeBeatTargetId === 'studio_preview') {
    window.RemoAudio.stopBeatPattern(true);
    toggleBeatStudioPreview();
  }
}
window.onBeatStudioConfigChange = onBeatStudioConfigChange;

function renderBeatPostStage(p, city, lang) {
  const pat = p.beatPattern || { bpm: 118, scale: 'cyber', rows: _studioBeatRows };
  const rows = Array.isArray(pat.rows) ? pat.rows : _studioBeatRows;
  const isPlaying = Boolean(window.RemoAudio && window.RemoAudio.activeBeatTargetId === p.id);
  const scaleTag = String(pat.scale || 'cyber').toUpperCase();

  let dotsHtml = '';
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 8; c++) {
      const on = Boolean(rows[r] && rows[r][c]);
      dotsHtml += `<span class="beat-mini-dot r${r} ${on ? 'on' : ''}" data-feed-beat-c="${c}"></span>`;
    }
  }

  return `
    <div class="beat-post-stage" id="beatStage_${p.id}">
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;justify-content:center;">
        <span style="font-family:'Orbitron',sans-serif;font-size:0.8rem;font-weight:900;color:#fde047;">
          ${city.flag} ${escapeHtmlStr(getCityName(city, lang))} · ${Number(pat.bpm || 118)} BPM · ${escapeHtmlStr(scaleTag)}
        </span>
      </div>
      <div class="beat-mini-matrix" id="beatMatrix_${p.id}">
        ${dotsHtml}
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-top:4px;">
        <button type="button" class="btn-cyber btn-gold" data-beat-play-btn="${p.id}" style="padding:7px 15px;font-size:0.78rem;" onclick="toggleFeedBeatLoop('${p.id}', event)">
          ${isPlaying ? escapeHtmlStr(t('beat_stop_btn')) : `▶️ ${escapeHtmlStr(t('beat_play_btn'))}`}
        </button>
        <button type="button" class="btn-ghost" style="padding:7px 13px;font-size:0.76rem;border-color:#a78bfa;color:#ddd6fe;" onclick="remixBeatPost('${p.id}', event)">
          ${escapeHtmlStr(t('beat_remix_btn'))}
        </button>
      </div>
    </div>
  `;
}
window.renderBeatPostStage = renderBeatPostStage;

function toggleFeedBeatLoop(postId, ev) {
  if (ev) ev.stopPropagation();
  if (!window.RemoAudio) return;
  const p = (REMO_STORE.state.posts || []).find((x) => x && x.id === postId);
  if (!p || !p.beatPattern) return;

  const started = window.RemoAudio.playBeatPattern(p.beatPattern, p.id, (stepIdx) => {
    document.querySelectorAll(`#beatMatrix_${p.id} .beat-mini-dot`).forEach((el) => {
      const col = Number(el.getAttribute('data-feed-beat-c'));
      el.classList.toggle('playhead', col === stepIdx);
    });
  });

  if (!started) {
    document.querySelectorAll(`#beatMatrix_${p.id} .beat-mini-dot`).forEach((el) => el.classList.remove('playhead'));
  }
  syncActivePostAudioDOM();
}
window.toggleFeedBeatLoop = toggleFeedBeatLoop;

function remixBeatPost(postId, ev) {
  if (ev) ev.stopPropagation();
  const lang = REMO_I18N.getLang();
  const isAdm = REMO_STORE.isAdminUnlocked() || REMO_STORE.isCurrentUserAdmin();
  if (!isAdm) {
    remoToast(lang === 'fr' ? 'La création de Beats officiels est réservée aux administrateurs !' : 'Official Beat creation is reserved for administrators!');
    return;
  }
  const p = (REMO_STORE.state.posts || []).find((x) => x && x.id === postId);
  if (!p || !p.beatPattern) return;

  openCreatePostModal('#RemoBeat');
  pendingRemixParent = { authorUid: p.uid || '', authorName: p.authorName || 'Creator' };

  const remixBanner = document.getElementById('createRemixBanner');
  if (remixBanner) {
    remixBanner.style.display = 'block';
    remixBanner.textContent = `🎛️ ${t('post_remix_from')} @${p.authorName} (+10 🪙)`;
  }

  if (Array.isArray(p.beatPattern.rows) && p.beatPattern.rows.length === 4) {
    _studioBeatRows = p.beatPattern.rows.map((r) => r.slice(0, 8));
  }
  const bpmSel = document.getElementById('beatStudioBpmSel');
  if (bpmSel && p.beatPattern.bpm) bpmSel.value = String(p.beatPattern.bpm);
  const scSel = document.getElementById('beatStudioScaleSel');
  if (scSel && p.beatPattern.scale) scSel.value = String(p.beatPattern.scale);

  const capInp = document.getElementById('createCaptionInp');
  if (capInp) {
    capInp.value = lang === 'fr'
      ? `🎛️ Mon Remix du Beat de @${p.authorName} ! #RemoBeat`
      : `🎛️ Remixing @${p.authorName}'s City Beat! #RemoBeat`;
  }

  switchCreateStudioTab('beat');
}
window.remixBeatPost = remixBeatPost;

function syncActivePostAudioDOM() {
  const activeSoundPost = (window.RemoAudio && window.RemoAudio.activeSoundtrackPostId) || '';
  const activeBeatPost = (window.RemoAudio && window.RemoAudio.activeBeatTargetId) || '';
  const radioOn = Boolean(window.REMO_RADIO && window.REMO_RADIO.isPlaying);

  document.querySelectorAll('.post-sound-disc[data-sound-post]').forEach((btn) => {
    const pid = btn.getAttribute('data-sound-post');
    const sid = btn.getAttribute('data-sound-id');
    const on = sid === 'city_radio' ? radioOn : (pid === activeSoundPost);
    btn.classList.toggle('playing', on);
  });

  document.querySelectorAll('[data-beat-play-btn]').forEach((btn) => {
    const pid = btn.getAttribute('data-beat-play-btn');
    const on = pid === activeBeatPost;
    btn.innerHTML = on ? escapeHtmlStr(t('beat_stop_btn')) : `▶️ ${escapeHtmlStr(t('beat_play_btn'))}`;
    if (!on) {
      document.querySelectorAll(`#beatMatrix_${pid} .beat-mini-dot`).forEach((el) => el.classList.remove('playhead'));
    }
  });

  syncBeatStudioPlayBtnDOM();
}
window.syncActivePostAudioDOM = syncActivePostAudioDOM;

window.addEventListener('remo:postaudiochange', syncActivePostAudioDOM);




/* ════════════════════════════════════════════════════════════════════
   🎤🏆⚽🕵️🎟️⚡ v69: EUROVISION REMO (60S SONG CONTEST) &
   6 ADMIN-CONTROLLED VIRAL CONTESTS ENGINE (EN / FR ONLY)
   ════════════════════════════════════════════════════════════════════ */

let _euroAudioPlayer = null;
let _euroPlayingEntryId = '';
let _euroTimerInterval = null;
let _euroElapsedSec = 0;
let _pendingEuroAudioDataUrl = '';
let _pendingPgpMediaDataUrl = '';
let _pendingPgpMediaType = 'image';
let _pendingGlobalSyncMediaUrl = '';

function stopEurovision60sPreview() {
  if (_euroTimerInterval) {
    clearInterval(_euroTimerInterval);
    _euroTimerInterval = null;
  }
  if (_euroAudioPlayer) {
    try {
      _euroAudioPlayer.pause();
      _euroAudioPlayer.currentTime = 0;
    } catch (e) {}
    _euroAudioPlayer = null;
  }
  if (window.RemoAudio && window.RemoAudio.activeSoundtrackPostId && String(window.RemoAudio.activeSoundtrackPostId).startsWith('euro_')) {
    try { window.RemoAudio.stopPostSoundtrack(); } catch (e) {}
  }
  _euroPlayingEntryId = '';
  _euroElapsedSec = 0;
  document.querySelectorAll('[data-euro-play-btn]').forEach((btn) => {
    btn.innerHTML = escapeHtmlStr(t('euro_play_60s'));
    btn.classList.remove('active');
  });
  document.querySelectorAll('[data-euro-timer]').forEach((el) => {
    el.textContent = '0:00 / 1:00';
  });
}
window.stopEurovision60sPreview = stopEurovision60sPreview;

function playEurovision60sPreview(entryId) {
  const vc = REMO_STORE.ensureViralContests();
  const ev = vc.eurovision || {};
  const entry = (ev.entries || []).find((e) => e && e.id === entryId);
  if (!entry) return;

  if (_euroPlayingEntryId === entryId) {
    stopEurovision60sPreview();
    return;
  }

  stopEurovision60sPreview();
  _euroPlayingEntryId = entryId;
  _euroElapsedSec = 0;

  const btn = document.querySelector(`[data-euro-play-btn="${entryId}"]`);
  if (btn) {
    btn.innerHTML = escapeHtmlStr(t('euro_stop_60s'));
    btn.classList.add('active');
  }

  if (entry.audioUrl) {
    const resolved = entry.audioUrl.startsWith('idb://')
      ? RemoMediaDB.resolveSyncOrPlaceholder(entry.audioUrl)
      : entry.audioUrl;
    if (resolved) {
      _euroAudioPlayer = new Audio(resolved);
      _euroAudioPlayer.play().catch(() => {});
      _euroAudioPlayer.ontimeupdate = () => {
        if (!_euroAudioPlayer) return;
        const sec = Math.min(60, Math.floor(_euroAudioPlayer.currentTime || 0));
        const timerEl = document.querySelector(`[data-euro-timer="${entryId}"]`);
        if (timerEl) {
          timerEl.textContent = `0:${String(sec).padStart(2, '0')} / 1:00`;
        }
        if (_euroAudioPlayer.currentTime >= 60) {
          stopEurovision60sPreview();
        }
      };
      _euroAudioPlayer.onended = () => stopEurovision60sPreview();
      return;
    }
  }

  // Fallback to built-in 60s synth preset preview if no raw MP3 file
  if (window.RemoAudio && typeof window.RemoAudio.togglePostSoundtrack === 'function') {
    window.RemoAudio.togglePostSoundtrack(entry.soundPreset || 'shibuya_neon', entry.id, entry.cityId);
  }
  _euroTimerInterval = setInterval(() => {
    _euroElapsedSec++;
    const sec = Math.min(60, _euroElapsedSec);
    const timerEl = document.querySelector(`[data-euro-timer="${entryId}"]`);
    if (timerEl) {
      timerEl.textContent = `0:${String(sec).padStart(2, '0')} / 1:00`;
    }
    if (_euroElapsedSec >= 60) {
      stopEurovision60sPreview();
    }
  }, 1000);
}
window.playEurovision60sPreview = playEurovision60sPreview;

function formatContestRemainingTime(endsAt) {
  const lang = REMO_I18N.getLang();
  if (!endsAt) return lang === 'fr' ? 'En direct' : 'Live';
  const diff = Number(endsAt) - Date.now();
  if (diff <= 0) return lang === 'fr' ? 'Terminé' : 'Ended';
  const hrs = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  return `${hrs}h ${mins}m`;
}

function _isContestExpired(obj) {
  if (!obj) return false;
  if (obj.status && obj.status !== 'open' && obj.status !== 'running') return true;
  return Boolean(obj.endsAt && Date.now() > Number(obj.endsAt));
}

function renderContestTimerBadgeHtml(endsAt, status = 'open', isFr = false) {
  const isConcluded = status === 'concluded';
  const expired = !isConcluded && Boolean(endsAt && Date.now() > Number(endsAt));
  const label = isConcluded
    ? (isFr ? '🏆 TERMINÉ' : '🏆 CONCLUDED')
    : expired
    ? (isFr ? '⌛ TEMPS ÉCOULÉ' : '⌛ ENDED')
    : `⏳ ${formatContestRemainingTime(endsAt)}`;
  return `<span class="contest-timer-pill ${expired ? 'expired' : ''}" data-contest-timer="${Number(endsAt || 0)}" data-contest-status="${escapeHtmlStr(status || 'open')}">${escapeHtmlStr(label)}</span>`;
}

function _contestShareFootHtml(contestKey, infoEn, infoFr, entryId = '') {
  const isFr = REMO_I18N.getLang() === 'fr';
  return `
    <div class="contest-card-foot">
      <span style="font-size:0.72rem;color:#94a3b8;font-weight:700;">${escapeHtmlStr(isFr ? infoFr : infoEn)}</span>
      <button type="button" class="contest-share-btn" onclick="openContestShareSheet('${escapeHtmlStr(contestKey)}', '${escapeHtmlStr(entryId)}')">
        ${escapeHtmlStr(t('contest_share_btn'))}
      </button>
    </div>
  `;
}

function focusPendingContestDeepLink() {
  const dl = window._pendingContestDeepLink;
  if (!dl || !dl.key) return;
  const target = (dl.entry && document.getElementById('contestEntry_' + dl.entry))
    || document.getElementById('contestCard_' + dl.key);
  if (!target) return;
  window._pendingContestDeepLink = null;
  try {
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    target.classList.add('contest-highlight-pulse');
    setTimeout(() => target.classList.remove('contest-highlight-pulse'), 3600);
  } catch (e) {}
}
window.focusPendingContestDeepLink = focusPendingContestDeepLink;

if (typeof window !== 'undefined' && typeof document !== 'undefined' && !window._remoContestTickTimer) {
  window._remoContestTickTimer = setInterval(() => {
    const viewEl = document.getElementById('view-contests');
    if (!viewEl || !viewEl.classList.contains('active')) return;
    const isFr = REMO_I18N.getLang() === 'fr';
    document.querySelectorAll('[data-contest-timer]').forEach((el) => {
      const endsAt = Number(el.getAttribute('data-contest-timer') || 0);
      const st = el.getAttribute('data-contest-status') || 'open';
      if (st === 'concluded' || !endsAt) return;
      const expired = Date.now() > endsAt;
      el.classList.toggle('expired', expired);
      el.textContent = expired ? (isFr ? '⌛ TEMPS ÉCOULÉ' : '⌛ ENDED') : `⏳ ${formatContestRemainingTime(endsAt)}`;
    });
  }, 30000);
}

function renderFeedActiveContestsBanner() {
  const banner = document.getElementById('feedActiveContestsBanner');
  if (!banner || !REMO_STORE || !REMO_STORE.state) return;
  const lang = REMO_I18N.getLang();
  const isFr = lang === 'fr';
  const vc = REMO_STORE.ensureViralContests();

  const activePills = [];
  if (vc.eurovision && vc.eurovision.active) {
    activePills.push(`🎤 ${isFr ? 'REMO Concours Musical' : 'REMO Music Contest'} (+${Number(vc.eurovision.prizeCoins || 5000).toLocaleString()} 🪙)`);
  }
  if (vc.photoGrandPrix && vc.photoGrandPrix.active) {
    activePills.push(`📸 Photo Grand Prix (🥇 +${Number(vc.photoGrandPrix.prize1st || 3000).toLocaleString()} 🪙)`);
  }
  if (vc.worldCupBracket && vc.worldCupBracket.active) {
    activePills.push(`⚽ World Cup 8-Cities (+${Number(vc.worldCupBracket.prizePool || 5000).toLocaleString()} 🪙)`);
  }
  if (vc.mysteryDetective && vc.mysteryDetective.active) {
    activePills.push(`🕵️ Mystery City (+${Number(vc.mysteryDetective.rewardCoins || 500)} 🪙)`);
  }
  if (vc.goldenRaffle && vc.goldenRaffle.active) {
    activePills.push(`🎟️ Golden Raffle (+${Number(vc.goldenRaffle.prizeCoins || 2500).toLocaleString()} 🪙)`);
  }
  if (vc.flashHunt && vc.flashHunt.active) {
    const rem = Math.max(0, Number(vc.flashHunt.maxClaims || 20) - (vc.flashHunt.claims || []).length);
    activePills.push(`⚡ Flash Hunt (${rem} ${isFr ? 'restants' : 'left'})`);
  }

  const ws = typeof REMO_STORE.ensureWorldSystems === 'function' ? REMO_STORE.ensureWorldSystems() : {};
  if (ws.torchRelay && ws.torchRelay.active) {
    activePills.push(`🔥 4D Torch (${Number(ws.torchRelay.totalKm || 0).toLocaleString()} km)`);
  }
  if (ws.globalSync && ws.globalSync.active) {
    activePills.push(`🌍 Global Sync (+${Number(ws.globalSync.rewardCoins || 100)} 🪙)`);
  }
  if (ws.mayorElections && ws.mayorElections.active) {
    activePills.push(`🏛️ ${isFr ? 'Élections Maires 4D' : 'City Mayor Elections'}`);
  }
  if (ws.sisterAlliances && ws.sisterAlliances.active && (ws.sisterAlliances.treaties || []).length > 0) {
    activePills.push(`🤝 ${isFr ? 'Villes Jumelées 2X' : 'Sister Cities 2X'}`);
  }
  if (ws.pixelCanvas && ws.pixelCanvas.active) {
    activePills.push(`🎨 Pixel Canvas (+${Number(ws.pixelCanvas.pixelRewardCoins || 5)} 🪙)`);
  }
  if (ws.monumentVault && ws.monumentVault.active) {
    activePills.push(`⏳ ${ws.monumentVault.sealed ? (isFr ? 'Monument Scellé' : 'Sealed Monument') : (isFr ? '🔓 Monument Ouvert !' : '🔓 Monument Unsealed!')}`);
  }
  if (ws.creatorBourse && ws.creatorBourse.active) {
    activePills.push(`📈 ${isFr ? 'Bourse Créateurs' : 'Creator Shares'}`);
  }

  if (activePills.length === 0) {
    banner.style.display = 'none';
    banner.innerHTML = '';
    return;
  }

  banner.style.display = 'block';
  banner.innerHTML = `
    <div onclick="switchRemoView('contests')" style="cursor:pointer;background:linear-gradient(135deg,rgba(245,158,11,0.18),rgba(236,72,153,0.18),rgba(56,189,248,0.15));border:1.5px solid rgba(251,191,36,0.65);border-radius:16px;padding:10px 14px;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;box-shadow:0 8px 24px rgba(0,0,0,0.45);">
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
        <span style="background:#fbbf24;color:#0f172a;font-weight:900;font-size:0.7rem;padding:3px 9px;border-radius:99px;letter-spacing:0.6px;">🔥 ${isFr ? 'REMO CONCOURS EN DIRECT' : 'LIVE REMO CONTESTS'}</span>
        <span style="font-size:0.82rem;font-weight:800;color:#fde047;">${activePills.join(' · ')}</span>
      </div>
      <span class="btn-cyber btn-gold" style="padding:5px 12px;font-size:0.74rem;">${isFr ? 'Participer & Voter ➔' : 'Join & Vote ➔'}</span>
    </div>
  `;
}
window.renderFeedActiveContestsBanner = renderFeedActiveContestsBanner;

function renderViralContestsView() {
  const stage = document.getElementById('viralContestsStage');
  if (!stage || !REMO_STORE || !REMO_STORE.state) return;

  const lang = REMO_I18N.getLang();
  const isFr = lang === 'fr';
  const vc = REMO_STORE.ensureViralContests();
  const u = REMO_STORE.getCurrentUser();
  const isAdm = Boolean(REMO_STORE.isCurrentUserAdmin() && REMO_STORE.isAdminUnlocked());
  const cities = getRemoCities();

  const cityOptionsHtml = cities.map((c) =>
    `<option value="${c.id}" ${u && u.homeCity === c.id ? 'selected' : ''}>${c.flag} ${escapeHtmlStr(getCityName(c, lang))}</option>`
  ).join('');

  const ws = typeof REMO_STORE.ensureWorldSystems === 'function' ? REMO_STORE.ensureWorldSystems() : {};

  const anyActive = Boolean(
    (vc.eurovision && vc.eurovision.active) ||
    (vc.photoGrandPrix && vc.photoGrandPrix.active) ||
    (vc.worldCupBracket && vc.worldCupBracket.active) ||
    (vc.mysteryDetective && vc.mysteryDetective.active) ||
    (vc.goldenRaffle && vc.goldenRaffle.active) ||
    (vc.flashHunt && vc.flashHunt.active) ||
    (ws.torchRelay && ws.torchRelay.active) ||
    (ws.globalSync && ws.globalSync.active) ||
    (ws.mayorElections && ws.mayorElections.active) ||
    (ws.sisterAlliances && ws.sisterAlliances.active && (ws.sisterAlliances.treaties || []).length > 0) ||
    (ws.pixelCanvas && ws.pixelCanvas.active) ||
    (ws.monumentVault && ws.monumentVault.active) ||
    (ws.creatorBourse && ws.creatorBourse.active)
  );

  // ── 1. REMO MUSIC CONTEST (60S CITY SOUNDS & ANTHEMS) ──
  const ev = vc.eurovision || {};
  let euroHtml = '';
  if (ev.active) {
    const rawTitle = isFr ? (ev.title_fr || ev.title_en) : (ev.title_en || ev.title_fr);
    const evTitle = (!rawTitle || /eurovision/i.test(rawTitle))
      ? (isFr ? 'REMO Concours Musical — Sons & Hymnes 60s des Villes' : 'REMO Music Contest — 60s City Sounds & Anthems')
      : rawTitle;
    const evEntries = Array.isArray(ev.entries) ? ev.entries.slice().sort((a, b) => Number(b.points || 0) - Number(a.points || 0)) : [];
    const myVotedEntryId = u && ev.voters ? ev.voters[u.uid] : '';
    const evExpired = _isContestExpired(ev);
    const canSubmit = isAdm || (ev.active && ev.status === 'open' && !evExpired && ev.allowCitizenSubmissions);

    euroHtml = `
      <div id="contestCard_eurovision" class="glass-box" style="margin-bottom:16px;border:1.5px solid rgba(251,191,36,0.55);background:radial-gradient(circle at top right,rgba(236,72,153,0.16),rgba(15,23,42,0.95) 70%);">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:10px;margin-bottom:10px;">
          <div>
            <div style="display:inline-flex;align-items:center;gap:6px;background:rgba(251,191,36,0.18);border:1px solid #fbbf24;color:#fde047;padding:3px 10px;border-radius:99px;font-size:0.7rem;font-weight:900;margin-bottom:6px;">
              ${escapeHtmlStr(t('euro_badge'))}
            </div>
            <h2 style="font-family:'Orbitron',sans-serif;font-size:1.18rem;color:#fff;margin:0;">${escapeHtmlStr(evTitle)}</h2>
            <p style="font-size:0.78rem;color:#cbd5e1;margin-top:4px;">${escapeHtmlStr(t('euro_rule_note'))}</p>
          </div>
          <div style="text-align:right;display:flex;flex-direction:column;align-items:flex-end;gap:5px;">
            <div style="background:linear-gradient(135deg,#f59e0b,#ec4899);color:#fff;font-weight:900;padding:6px 14px;border-radius:12px;font-size:0.86rem;box-shadow:0 4px 15px rgba(245,158,11,0.4);">
              🏆 ${isFr ? 'Grand Prix' : 'Grand Prize'}: +${Number(ev.prizeCoins || 5000).toLocaleString()} 🪙
            </div>
            <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
              ${renderContestTimerBadgeHtml(ev.endsAt, ev.status, isFr)}
              <span style="font-size:0.74rem;color:#38bdf8;font-weight:800;">· ${evEntries.length} ${isFr ? 'villes en lice' : 'songs'}</span>
            </div>
          </div>
        </div>

        ${evExpired && ev.status === 'open' ? `
          <div style="padding:8px 12px;border-radius:10px;background:rgba(244,63,94,0.16);border:1px solid rgba(244,63,94,0.45);color:#fda4af;font-weight:800;font-size:0.78rem;margin-bottom:10px;text-align:center;">
            ${escapeHtmlStr(t('contest_expired_lbl'))}
          </div>
        ` : ''}

        ${ev.status === 'concluded' && ev.winnerEntryId ? (() => {
          const winE = evEntries.find((x) => x.id === ev.winnerEntryId) || evEntries[0];
          if (!winE) return '';
          const wc = getCityById(winE.cityId);
          return `
            <div style="background:linear-gradient(135deg,rgba(251,191,36,0.25),rgba(16,185,129,0.22));border:2px solid #fbbf24;border-radius:14px;padding:14px;text-align:center;margin-bottom:14px;">
              <div style="font-size:1.5rem;">👑🎤🏆</div>
              <div style="font-family:'Orbitron',sans-serif;font-weight:900;color:#fde047;font-size:1.05rem;">
                ${isFr ? 'CHAMPION REMO CONCOURS MUSICAL' : 'REMO MUSIC CONTEST CHAMPION'}: ${wc.flag} ${escapeHtmlStr(getCityName(wc, lang))}!
              </div>
              <div style="font-size:0.86rem;color:#fff;font-weight:800;margin-top:3px;">
                "${escapeHtmlStr(winE.songTitle)}" — @${escapeHtmlStr(winE.artistName)} (${winE.points} PTS · +${Number(ev.prizeCoins || 5000).toLocaleString()} 🪙)
              </div>
            </div>
          `;
        })() : ''}

        ${canSubmit ? `
          <div style="margin-bottom:12px;">
            <button type="button" class="btn-cyber btn-gold" onclick="document.getElementById('euroSubmitDrawer').style.display = document.getElementById('euroSubmitDrawer').style.display === 'none' ? 'block' : 'none'">
              ${escapeHtmlStr(t('euro_submit_btn'))}
            </button>
            <div id="euroSubmitDrawer" style="display:none;margin-top:10px;padding:14px;border-radius:14px;background:rgba(15,23,42,0.85);border:1px solid rgba(56,189,248,0.4);">
              <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:8px;margin-bottom:8px;">
                <div>
                  <label style="font-size:0.74rem;color:#94a3b8;font-weight:800;">${isFr ? 'Ville Représentée' : 'Represented City'}</label>
                  <select id="euroSubCitySel" class="remo-input">${cityOptionsHtml}</select>
                </div>
                <div>
                  <label style="font-size:0.74rem;color:#94a3b8;font-weight:800;">${isFr ? 'Titre de la Chanson (60s)' : 'Song Title (60s)'}</label>
                  <input type="text" id="euroSubTitleInp" class="remo-input" maxlength="70" placeholder="${isFr ? 'Ex: Hymne Nocturne de ma Ville' : 'e.g. Midnight City Anthem'}">
                </div>
                <div>
                  <label style="font-size:0.74rem;color:#94a3b8;font-weight:800;">${isFr ? 'Artiste / Créateur' : 'Artist / Creator'}</label>
                  <input type="text" id="euroSubArtistInp" class="remo-input" maxlength="45" value="${escapeHtmlStr(u ? u.name : 'REMO Creator')}">
                </div>
              </div>
              <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:8px;margin-bottom:10px;">
                <div>
                  <label style="font-size:0.74rem;color:#38bdf8;font-weight:800;">🎵 ${isFr ? 'Fichier Audio MP3/WAV (Max 60s, Optionnel)' : 'Upload MP3/Audio File (Max 60s, Optional)'}</label>
                  <input type="file" accept="audio/*,video/mp4" class="remo-input" onchange="handleEurovisionAudioUpload(event)">
                  <div id="euroAudioUploadStatus" style="font-size:0.72rem;color:#34d399;margin-top:3px;"></div>
                </div>
                <div>
                  <label style="font-size:0.74rem;color:#fbbf24;font-weight:800;">🔗 ${isFr ? 'OU Lien Externe (YouTube, Suno, SoundCloud...)' : 'OR External Link (YouTube, Suno, SoundCloud...)'}</label>
                  <input type="url" id="euroSubLinkInp" class="remo-input" placeholder="https://youtube.com/... or https://suno.com/...">
                </div>
                <div>
                  <label style="font-size:0.74rem;color:#a78bfa;font-weight:800;">🎹 ${isFr ? 'Ambiance Synthé 60s (si pas de MP3)' : 'Backup 60s Synth Vibe (if no MP3)'}</label>
                  <select id="euroSubPresetSel" class="remo-input">
                    <option value="shibuya_neon">🌆 Shibuya Neon Synthwave</option>
                    <option value="sunset_house">🏖️ Ibiza Sunset Deep House</option>
                    <option value="french_cafe">🥐 Paris Sunset Lounge</option>
                    <option value="afro_groove">🥁 Warm Afro-Groove Pulse</option>
                    <option value="cyber_pulse">⚡ Cyber Metropolis Bass</option>
                    <option value="velvet_jazz">🎷 Velvet Midnight Jazz</option>
                  </select>
                </div>
              </div>
              <button type="button" class="btn-cyber btn-gold" style="width:100%;justify-content:center;" onclick="submitCitizenEurovisionSong()">
                🚀 ${isFr ? 'Inscrire la Chanson Officielle (+25 🪙)' : 'Submit Official City Song (+25 🪙)'}
              </button>
            </div>
          </div>
        ` : ''}

        <!-- Eurovision Entries List -->
        <div style="display:flex;flex-direction:column;gap:8px;">
          ${evEntries.length === 0 ? `
            <div style="text-align:center;padding:22px;background:rgba(0,0,0,0.28);border-radius:12px;color:var(--muted);font-size:0.83rem;">
              🎤 ${isFr ? 'Aucune chanson inscrite pour le moment. Soyez la première ville en compétition !' : 'No city songs submitted yet. Be the first city to enter!'}
            </div>
          ` : evEntries.map((ent, idx) => {
            const c = getCityById(ent.cityId);
            const rankBadge = idx === 0 ? '🥇 #1' : idx === 1 ? '🥈 #2' : idx === 2 ? '🥉 #3' : `#${idx + 1}`;
            const isMyVote = myVotedEntryId === ent.id;
            const isPlaying = _euroPlayingEntryId === ent.id;
            return `
              <div id="contestEntry_${ent.id}" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;padding:11px 14px;border-radius:14px;background:${idx === 0 ? 'linear-gradient(90deg,rgba(251,191,36,0.16),rgba(15,23,42,0.85))' : 'rgba(255,255,255,0.04)'};border:1px solid ${isMyVote ? '#10b981' : idx === 0 ? 'rgba(251,191,36,0.5)' : 'rgba(255,255,255,0.08)'};">
                <div style="display:flex;align-items:center;gap:10px;min-width:200px;flex:1;">
                  <span style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:0.9rem;color:${idx === 0 ? '#fde047' : '#94a3b8'};min-width:44px;">${rankBadge}</span>
                  <span style="font-size:1.45rem;">${c.flag}</span>
                  <div style="min-width:0;">
                    <div style="font-weight:900;font-size:0.92rem;color:#fff;">
                      ${escapeHtmlStr(getCityName(c, lang))} — "${escapeHtmlStr(ent.songTitle)}"
                    </div>
                    <div style="font-size:0.75rem;color:#7dd3fc;font-weight:700;">
                      🎤 @${escapeHtmlStr(ent.artistName)} · <span data-euro-timer="${ent.id}" style="color:#fde047;">0:00 / 1:00</span>
                    </div>
                  </div>
                </div>

                <div style="display:flex;align-items:center;gap:7px;flex-wrap:wrap;">
                  <button type="button" class="btn-ghost ${isPlaying ? 'active' : ''}" data-euro-play-btn="${ent.id}" style="font-size:0.75rem;padding:6px 11px;border-color:#38bdf8;color:#7dd3fc;" onclick="playEurovision60sPreview('${ent.id}')">
                    ${isPlaying ? escapeHtmlStr(t('euro_stop_60s')) : escapeHtmlStr(t('euro_play_60s'))}
                  </button>
                  ${ent.externalLink ? `
                    <a href="${escapeHtmlStr(ent.externalLink)}" target="_blank" rel="noopener noreferrer" class="btn-ghost" style="font-size:0.75rem;padding:6px 11px;border-color:#f472b6;color:#fbcfe8;text-decoration:none;">
                      ${escapeHtmlStr(t('euro_open_link'))}
                    </a>
                  ` : ''}
                  <span style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:0.88rem;color:#fbbf24;padding:0 6px;">
                    ${Number(ent.points || 0)} PTS
                  </span>
                  ${!evExpired && ev.status === 'open' ? `
                    <button type="button" class="btn-cyber ${isMyVote ? '' : 'btn-gold'}" style="font-size:0.75rem;padding:6px 12px;" ${myVotedEntryId ? 'disabled' : ''} onclick="castCitizenEurovisionVote('${ent.id}')">
                      ${isMyVote ? escapeHtmlStr(t('euro_voted_lbl')) : escapeHtmlStr(t('euro_vote_btn'))}
                    </button>
                  ` : ''}
                  <button type="button" class="contest-share-btn" style="padding:5px 8px;" title="Share Song" onclick="openContestShareSheet('eurovision','${ent.id}')">📤</button>
                  ${isAdm ? `
                    <button type="button" class="btn-ghost" style="padding:5px 9px;color:#f43f5e;border-color:#f43f5e;font-size:0.74rem;" onclick="REMO_STORE.adminDeleteEurovisionEntry('${ent.id}')" title="Delete Entry">✕</button>
                  ` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
        ${_contestShareFootHtml('eurovision', 'Invite fans worldwide to listen & vote +100 PTS!', 'Invitez vos amis du monde entier à écouter et voter !')}
      </div>
    `;
  }

  // ── 2. PHOTO & VIDEO GRAND PRIX (TOP 3 PODIUM 🥇🥈🥉) ──
  const pgp = vc.photoGrandPrix || {};
  let pgpHtml = '';
  if (pgp.active) {
    const pgpTitle = isFr ? (pgp.title_fr || pgp.title_en) : (pgp.title_en || pgp.title_fr);
    const pgpEntries = Array.isArray(pgp.entries) ? pgp.entries.slice().sort((a, b) => Number(b.votes || 0) - Number(a.votes || 0)) : [];
    const myVotedId = u && pgp.voters ? pgp.voters[u.uid] : '';
    const pgpExpired = _isContestExpired(pgp);

    pgpHtml = `
      <div id="contestCard_photoGrandPrix" class="glass-box" style="margin-bottom:16px;border:1.5px solid rgba(56,189,248,0.5);">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:10px;margin-bottom:12px;">
          <div>
            <div style="display:inline-flex;align-items:center;gap:6px;background:rgba(56,189,248,0.16);border:1px solid #38bdf8;color:#7dd3fc;padding:3px 10px;border-radius:99px;font-size:0.7rem;font-weight:900;margin-bottom:6px;">
              ${escapeHtmlStr(t('pgp_badge'))}
            </div>
            <h2 style="font-family:'Orbitron',sans-serif;font-size:1.12rem;color:#fff;margin:0;">${escapeHtmlStr(pgpTitle || 'Photo & Video Grand Prix')}</h2>
          </div>
          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;">
            <div style="display:flex;gap:8px;flex-wrap:wrap;font-size:0.78rem;font-weight:900;">
              <span style="background:rgba(251,191,36,0.2);border:1px solid #fbbf24;color:#fde047;padding:4px 10px;border-radius:10px;">🥇 +${Number(pgp.prize1st || 3000).toLocaleString()} 🪙</span>
              <span style="background:rgba(226,232,240,0.15);border:1px solid #cbd5e1;color:#f1f5f9;padding:4px 10px;border-radius:10px;">🥈 +${Number(pgp.prize2nd || 1500).toLocaleString()} 🪙</span>
              <span style="background:rgba(217,119,6,0.2);border:1px solid #f59e0b;color:#fed7aa;padding:4px 10px;border-radius:10px;">🥉 +${Number(pgp.prize3rd || 750).toLocaleString()} 🪙</span>
            </div>
            ${renderContestTimerBadgeHtml(pgp.endsAt, pgp.status, isFr)}
          </div>
        </div>

        ${pgpExpired && pgp.status === 'open' ? `
          <div style="padding:8px 12px;border-radius:10px;background:rgba(244,63,94,0.16);border:1px solid rgba(244,63,94,0.45);color:#fda4af;font-weight:800;font-size:0.78rem;margin-bottom:10px;text-align:center;">
            ${escapeHtmlStr(t('contest_expired_lbl'))}
          </div>
        ` : ''}

        ${pgp.active && pgp.status === 'open' && !pgpExpired ? `
          <div style="margin-bottom:12px;">
            <button type="button" class="btn-cyber" onclick="document.getElementById('pgpSubmitDrawer').style.display = document.getElementById('pgpSubmitDrawer').style.display === 'none' ? 'block' : 'none'">
              ${escapeHtmlStr(t('pgp_submit_btn'))}
            </button>
            <div id="pgpSubmitDrawer" style="display:none;margin-top:10px;padding:12px;border-radius:14px;background:rgba(15,23,42,0.85);border:1px solid rgba(56,189,248,0.35);">
              <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:8px;margin-bottom:8px;">
                <select id="pgpSubCitySel" class="remo-input">${cityOptionsHtml}</select>
                <input type="text" id="pgpSubTitleInp" class="remo-input" placeholder="${isFr ? 'Titre ou légende de la photo/vidéo...' : 'Photo/Video title or caption...'}">
                <input type="file" accept="image/*,video/*" class="remo-input" onchange="handlePgpMediaUpload(event)">
              </div>
              <div id="pgpUploadStatus" style="font-size:0.74rem;color:#34d399;margin-bottom:6px;"></div>
              <button type="button" class="btn-cyber btn-gold" style="width:100%;justify-content:center;" onclick="submitCitizenPgpEntry()">
                🚀 ${isFr ? 'Publier dans le Grand Prix (+20 🪙)' : 'Submit to Grand Prix (+20 🪙)'}
              </button>
            </div>
          </div>
        ` : ''}

        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:12px;">
          ${pgpEntries.length === 0 ? `
            <div style="grid-column:1/-1;text-align:center;padding:20px;color:var(--muted);font-size:0.82rem;">
              📸 ${isFr ? 'Aucune photo/vidéo soumise pour le moment.' : 'No photo/video entries submitted yet.'}
            </div>
          ` : pgpEntries.map((ent, idx) => {
            const c = getCityById(ent.cityId);
            const medal = idx === 0 ? '🥇 1ST' : idx === 1 ? '🥈 2ND' : idx === 2 ? '🥉 3RD' : `#${idx + 1}`;
            const imgSrc = ent.mediaUrl || resolveCityFallbackArtUrl(c);
            return `
              <div id="contestEntry_${ent.id}" style="background:rgba(15,23,42,0.85);border:1px solid ${idx < 3 ? '#fbbf24' : 'rgba(255,255,255,0.1)'};border-radius:14px;overflow:hidden;display:flex;flex-direction:column;">
                <div style="position:relative;height:155px;background:#050816;">
                  ${ent.mediaType === 'video'
                    ? `<video src="${imgSrc}" controls playsinline style="width:100%;height:100%;object-fit:cover;"></video>`
                    : `<img src="${imgSrc}" alt="${escapeHtmlStr(ent.title)}" style="width:100%;height:100%;object-fit:cover;">`
                  }
                  <span style="position:absolute;top:8px;left:8px;background:rgba(0,0,0,0.8);border:1px solid #fbbf24;color:#fde047;font-weight:900;font-size:0.72rem;padding:2px 8px;border-radius:99px;">${medal}</span>
                  <span style="position:absolute;top:8px;right:8px;background:rgba(0,0,0,0.8);color:#fff;font-weight:800;font-size:0.72rem;padding:2px 8px;border-radius:99px;">${c.flag} ${escapeHtmlStr(getCityName(c, lang))}</span>
                </div>
                <div style="padding:10px;display:flex;flex-direction:column;gap:6px;flex:1;justify-content:space-between;">
                  <div>
                    <div style="font-weight:800;font-size:0.84rem;color:#fff;">${escapeHtmlStr(ent.title)}</div>
                    <div style="font-size:0.73rem;color:#7dd3fc;">@${escapeHtmlStr(ent.authorName)} · 🔥 ${Number(ent.votes || 0)} votes</div>
                  </div>
                  <div style="display:flex;gap:6px;">
                    ${pgp.status === 'open' && !pgpExpired ? `
                      <button type="button" class="btn-cyber ${myVotedId === ent.id ? '' : 'btn-gold'}" style="flex:1;justify-content:center;padding:6px;font-size:0.74rem;" ${myVotedId ? 'disabled' : ''} onclick="voteCitizenPgpEntry('${ent.id}')">
                        ${myVotedId === ent.id ? '✓ Voted' : escapeHtmlStr(t('pgp_vote_btn'))}
                      </button>
                    ` : ''}
                    <button type="button" class="contest-share-btn" style="padding:5px 8px;" title="Share Photo/Video" onclick="openContestShareSheet('photoGrandPrix','${ent.id}')">📤</button>
                    ${isAdm ? `<button type="button" class="btn-ghost" style="padding:5px 8px;color:#f43f5e;border-color:#f43f5e;" onclick="REMO_STORE.adminDeletePhotoGrandPrixEntry('${ent.id}')">✕</button>` : ''}
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
        ${_contestShareFootHtml('photoGrandPrix', 'Share this Grand Prix & rally votes for Top 3 podium!', 'Partagez ce Grand Prix et mobilisez des votes !')}
      </div>
    `;
  }

  // ── 3. 8-CITY WORLD KNOCKOUT CUP BRACKET ──
  const wc = vc.worldCupBracket || {};
  let wcHtml = '';
  if (wc.active) {
    const wcTitle = isFr ? (wc.title_fr || wc.title_en) : (wc.title_en || wc.title_fr);
    const roundLabel = wc.round === 'qf'
      ? (isFr ? 'Quarts de Finale (8 Villes)' : 'Quarter-Finals (8 Cities)')
      : wc.round === 'sf'
      ? (isFr ? 'Demi-Finales (4 Villes)' : 'Semi-Finals (4 Cities)')
      : wc.round === 'final'
      ? (isFr ? 'GRANDE FINALE MONDIALE' : 'WORLD GRAND FINAL')
      : (isFr ? 'CHAMPION COURONNÉ' : 'CHAMPION CROWNED');
    const curMatches = (wc.matches || []).filter((m) => m.round === (wc.round === 'champion' ? 'final' : wc.round));
    const wcExpired = _isContestExpired(wc);

    wcHtml = `
      <div id="contestCard_worldCupBracket" class="glass-box" style="margin-bottom:16px;border:1.5px solid rgba(16,185,129,0.5);">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:12px;">
          <div>
            <div style="display:inline-flex;align-items:center;gap:6px;background:rgba(16,185,129,0.18);border:1px solid #10b981;color:#6ee7b7;padding:3px 10px;border-radius:99px;font-size:0.7rem;font-weight:900;margin-bottom:6px;">
              ${escapeHtmlStr(t('wc_badge'))} · ${escapeHtmlStr(roundLabel)}
            </div>
            <h2 style="font-family:'Orbitron',sans-serif;font-size:1.12rem;color:#fff;margin:0;">${escapeHtmlStr(wcTitle)}</h2>
          </div>
          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;">
            <div style="font-weight:900;color:#fbbf24;font-size:0.86rem;">
              🏆 +${Number(wc.prizePool || 5000).toLocaleString()} PTS
            </div>
            ${renderContestTimerBadgeHtml(wc.endsAt, wc.status, isFr)}
          </div>
        </div>

        ${wcExpired && wc.status === 'open' ? `
          <div style="padding:8px 12px;border-radius:10px;background:rgba(244,63,94,0.16);border:1px solid rgba(244,63,94,0.45);color:#fda4af;font-weight:800;font-size:0.78rem;margin-bottom:10px;text-align:center;">
            ${escapeHtmlStr(t('contest_expired_lbl'))}
          </div>
        ` : ''}

        ${wc.championCityId ? (() => {
          const champ = getCityById(wc.championCityId);
          return `
            <div style="background:linear-gradient(135deg,rgba(251,191,36,0.25),rgba(16,185,129,0.25));border:2px solid #fbbf24;border-radius:14px;padding:14px;text-align:center;margin-bottom:12px;">
              <div style="font-size:1.6rem;">🏆👑⚽</div>
              <div style="font-family:'Orbitron',sans-serif;font-weight:900;color:#fde047;font-size:1.05rem;">
                ${champ.flag} ${escapeHtmlStr(getCityName(champ, lang))} — ${isFr ? 'CHAMPION DE LA COUPE DU MONDE !' : 'WORLD KNOCKOUT CUP CHAMPION!'}
              </div>
            </div>
          `;
        })() : ''}

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:10px;">
          ${curMatches.map((m) => {
            const cA = getCityById(m.cityA);
            const cB = getCityById(m.cityB);
            const vA = Number(m.votesA || 0);
            const vB = Number(m.votesB || 0);
            const tot = Math.max(1, vA + vB);
            const pA = Math.round((vA / tot) * 100);
            const pB = 100 - pA;
            const myVote = u && m.voters ? m.voters[u.uid] : '';
            const locked = Boolean(myVote || wcExpired || wc.status !== 'open');
            return `
              <div style="padding:12px;border-radius:14px;background:rgba(15,23,42,0.85);border:1px solid rgba(255,255,255,0.1);">
                <div style="display:flex;justify-content:space-between;align-items:center;font-weight:900;font-size:0.88rem;margin-bottom:8px;">
                  <span>${cA.flag} ${escapeHtmlStr(getCityName(cA, lang))} (${vA})</span>
                  <span style="color:#fbbf24;font-family:'Orbitron',sans-serif;font-size:0.75rem;">VS</span>
                  <span>${cB.flag} ${escapeHtmlStr(getCityName(cB, lang))} (${vB})</span>
                </div>
                <div class="war-bar-track" style="height:8px;margin-bottom:10px;">
                  <div class="war-bar-fill-a" style="width:${pA}%;"></div>
                </div>
                <div style="display:flex;gap:6px;">
                  <button type="button" class="btn-cyber ${myVote === 'A' ? 'btn-gold' : ''}" style="flex:1;justify-content:center;font-size:0.74rem;padding:6px;" ${locked ? 'disabled' : ''} onclick="voteCitizenWorldCupMatch('${m.id}','A')">
                    ${cA.flag} ${myVote === 'A' ? '✓' : 'Vote'} (${pA}%)
                  </button>
                  <button type="button" class="btn-cyber ${myVote === 'B' ? 'btn-gold' : ''}" style="flex:1;justify-content:center;font-size:0.74rem;padding:6px;" ${locked ? 'disabled' : ''} onclick="voteCitizenWorldCupMatch('${m.id}','B')">
                    ${cB.flag} ${myVote === 'B' ? '✓' : 'Vote'} (${pB}%)
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
        ${_contestShareFootHtml('worldCupBracket', 'Share the Knockout Bracket to push your city to the Final!', 'Partagez le Tableau Mondial pour qualifier votre ville !')}
      </div>
    `;
  }

  // ── 4. MYSTERY CITY DETECTIVE (1-ATTEMPT QUIZ) ──
  const md = vc.mysteryDetective || {};
  let mdHtml = '';
  if (md.active) {
    const clueTxt = isFr ? (md.clue_fr || md.clue_en) : (md.clue_en || md.clue_fr);
    const myAttempt = u && md.attempts ? md.attempts[u.uid] : null;
    const winnersCount = (md.winners || []).length;
    const maxW = Number(md.maxWinners || 15);
    const mdExpired = _isContestExpired(md);
    const applyBlur = Boolean(md.blurImage && md.status === 'open' && !myAttempt && !mdExpired);

    mdHtml = `
      <div id="contestCard_mysteryDetective" class="glass-box" style="margin-bottom:16px;border:1.5px solid rgba(168,85,247,0.55);">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:10px;">
          <div>
            <div style="display:inline-flex;align-items:center;gap:6px;background:rgba(168,85,247,0.18);border:1px solid #a855f7;color:#e9d5ff;padding:3px 10px;border-radius:99px;font-size:0.7rem;font-weight:900;margin-bottom:6px;">
              ${escapeHtmlStr(t('md_badge'))}
            </div>
            <h2 style="font-family:'Orbitron',sans-serif;font-size:1.08rem;color:#fff;margin:0;">
              🕵️ ${isFr ? 'Enquête Ville Mystère' : 'Mystery City Detective'} (+${Number(md.rewardCoins || 500)} 🪙)
            </h2>
          </div>
          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;">
            <span style="font-size:0.78rem;font-weight:900;color:#fbbf24;">🏆 ${winnersCount} / ${maxW} ${isFr ? 'Gagnants' : 'Winners'}</span>
            ${renderContestTimerBadgeHtml(md.endsAt, md.status, isFr)}
          </div>
        </div>

        ${md.imageUrl ? `
          <div style="position:relative;overflow:hidden;border-radius:14px;margin-bottom:10px;">
            <img src="${escapeHtmlStr(md.imageUrl)}" alt="Mystery City" class="${applyBlur ? 'contest-blur-mystery' : ''}" style="width:100%;max-height:260px;object-fit:cover;display:block;">
            ${applyBlur ? `<span style="position:absolute;bottom:10px;left:10px;background:rgba(15,23,42,0.88);border:1px solid #a855f7;color:#e9d5ff;font-size:0.72rem;font-weight:900;padding:4px 10px;border-radius:99px;">${escapeHtmlStr(t('md_blur_badge'))}</span>` : ''}
          </div>
        ` : ''}
        <div style="padding:10px 14px;border-radius:12px;background:rgba(0,0,0,0.35);border:1px solid rgba(255,255,255,0.08);color:#fde047;font-weight:700;font-size:0.86rem;margin-bottom:10px;">
          💡 "${escapeHtmlStr(clueTxt || 'Guess the secret city!')}"
        </div>

        ${md.status === 'concluded' ? (() => {
          const ansC = getCityById(md.correctCityId || 'paris');
          return `
            <div style="padding:10px;border-radius:12px;background:rgba(168,85,247,0.2);border:1px solid #a855f7;color:#f3e8ff;font-weight:900;text-align:center;margin-bottom:8px;">
              👁️ ${isFr ? 'RÉPONSE RÉVÉLÉE' : 'MYSTERY ANSWER REVEALED'}: ${ansC.flag} ${escapeHtmlStr(getCityName(ansC, lang))}!
            </div>
          `;
        })() : ''}

        ${myAttempt ? `
          <div style="padding:10px;border-radius:12px;text-align:center;font-weight:900;background:${myAttempt.correct ? 'rgba(16,185,129,0.2)' : 'rgba(244,63,94,0.2)'};color:${myAttempt.correct ? '#6ee7b7' : '#fda4af'};">
            ${myAttempt.correct
              ? (isFr ? `🎉 BRAVO ! Vous avez trouvé la ville secrète (+${md.rewardCoins} 🪙) !` : `🎉 BINGO! You solved the Mystery City (+${md.rewardCoins} 🪙)!`)
              : (isFr ? '❌ Essai unique utilisé ! Ce n’était pas la bonne ville.' : '❌ 1 Attempt used! That was not the secret city.')
            }
          </div>
        ` : (md.active && md.status === 'open' && !mdExpired ? `
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <select id="mdGuessCitySel" class="remo-input" style="flex:1;min-width:180px;">${cityOptionsHtml}</select>
            <button type="button" class="btn-cyber btn-gold" onclick="submitCitizenMysteryDetective()">
              🕵️ ${isFr ? 'Valider mon Unique Essai' : 'Lock In My 1 Attempt'} (+${Number(md.rewardCoins || 500)} 🪙)
            </button>
          </div>
        ` : (mdExpired && md.status === 'open' ? `<div style="text-align:center;font-size:0.78rem;color:#fda4af;font-weight:800;">${escapeHtmlStr(t('contest_expired_lbl'))}</div>` : ''))}
        ${_contestShareFootHtml('mysteryDetective', 'Challenge friends: can they recognize this secret city?', 'Défiez vos amis : sauront-ils identifier cette ville ?')}
      </div>
    `;
  }

  // ── 5. FOUNDER'S GOLDEN TICKET RAFFLE ──
  const gr = vc.goldenRaffle || {};
  let grHtml = '';
  if (gr.active) {
    const grTitle = isFr ? (gr.title_fr || gr.title_en) : (gr.title_en || gr.title_fr);
    const myTicket = u && Array.isArray(gr.tickets) ? gr.tickets.find((t) => t && t.uid === u.uid) : null;
    const winners = Array.isArray(gr.winningTickets) ? gr.winningTickets : [];
    const grExpired = _isContestExpired(gr);

    grHtml = `
      <div id="contestCard_goldenRaffle" class="glass-box" style="margin-bottom:16px;border:1.5px solid rgba(251,191,36,0.6);">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:10px;">
          <div>
            <div style="display:inline-flex;align-items:center;gap:6px;background:rgba(251,191,36,0.2);border:1px solid #fbbf24;color:#fde047;padding:3px 10px;border-radius:99px;font-size:0.7rem;font-weight:900;margin-bottom:6px;">
              ${escapeHtmlStr(t('gr_badge'))}
            </div>
            <h2 style="font-family:'Orbitron',sans-serif;font-size:1.08rem;color:#fff;margin:0;">${escapeHtmlStr(grTitle)}</h2>
          </div>
          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;">
            <div style="font-weight:900;color:#fde047;font-size:0.86rem;">
              🎟️ ${(gr.tickets || []).length} ${isFr ? 'Tickets inscrits' : 'Tickets Claimed'} · +${Number(gr.prizeCoins || 2500).toLocaleString()} 🪙 × ${Number(gr.winnersCount || 3)}
            </div>
            ${renderContestTimerBadgeHtml(gr.endsAt, gr.status, isFr)}
          </div>
        </div>

        ${winners.length > 0 ? `
          <div style="padding:12px;border-radius:12px;background:rgba(251,191,36,0.18);border:1px solid #fbbf24;margin-bottom:10px;text-align:center;">
            <div style="font-weight:900;color:#fde047;margin-bottom:4px;">🎉 ${isFr ? 'TICKETS D’OR GAGNANTS TIRÉS AU SORT' : 'WINNING GOLDEN TICKETS DRAWN'}:</div>
            <div style="font-size:0.85rem;color:#fff;font-weight:800;">
              ${winners.map((w) => `🎟️ #${escapeHtmlStr(w.code)} (@${escapeHtmlStr(w.name)})`).join(' · ')}
            </div>
          </div>
        ` : ''}

        ${myTicket ? `
          <div style="padding:10px 14px;border-radius:12px;background:rgba(16,185,129,0.16);border:1px solid #10b981;color:#6ee7b7;font-weight:900;display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;">
            <span>🎟️ ${isFr ? 'Votre Ticket d’Or Officiel' : 'Your Official Golden Ticket'}: <span style="color:#fde047;font-family:'Orbitron',sans-serif;">#${escapeHtmlStr(myTicket.code)}</span></span>
            <button type="button" class="contest-share-btn" onclick="openContestShareSheet('goldenRaffle','${escapeHtmlStr(myTicket.code)}')">📤 ${isFr ? 'Partager mon Ticket' : 'Share My Ticket'}</button>
          </div>
        ` : (gr.active && gr.status === 'open' && !grExpired ? `
          <button type="button" class="btn-cyber btn-gold" style="width:100%;justify-content:center;padding:11px;" onclick="claimCitizenGoldenTicket()">
            🎟️ ${isFr ? 'Réclamer mon Ticket d’Or Gratuit (+10 🪙)' : 'Claim My Free Golden Ticket (+10 🪙)'}
          </button>
        ` : (grExpired && gr.status === 'open' ? `<div style="text-align:center;font-size:0.78rem;color:#fda4af;font-weight:800;">${escapeHtmlStr(t('contest_expired_lbl'))}</div>` : ''))}
        ${_contestShareFootHtml('goldenRaffle', 'Invite friends to grab a free VIP Golden Ticket!', 'Invitez vos amis à réclamer leur Ticket d’Or gratuit !')}
      </div>
    `;
  }

  // ── 6. FOUNDER'S FLASH TREASURE HUNT ──
  const fh = vc.flashHunt || {};
  let fhHtml = '';
  if (fh.active) {
    const riddleTxt = isFr ? (fh.riddle_fr || fh.riddle_en) : (fh.riddle_en || fh.riddle_fr);
    const claimedList = Array.isArray(fh.claims) ? fh.claims : [];
    const maxC = Number(fh.maxClaims || 20);
    const rem = Math.max(0, maxC - claimedList.length);
    const myTried = u && fh.attempts ? fh.attempts[u.uid] : null;
    const fhExpired = _isContestExpired(fh);

    fhHtml = `
      <div id="contestCard_flashHunt" class="glass-box" style="margin-bottom:16px;border:1.5px solid rgba(244,63,94,0.55);">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:10px;">
          <div>
            <div style="display:inline-flex;align-items:center;gap:6px;background:rgba(244,63,94,0.2);border:1px solid #f43f5e;color:#fda4af;padding:3px 10px;border-radius:99px;font-size:0.7rem;font-weight:900;margin-bottom:6px;">
              ${escapeHtmlStr(t('fh_badge'))}
            </div>
            <h2 style="font-family:'Orbitron',sans-serif;font-size:1.08rem;color:#fff;margin:0;">
              ⚡ ${isFr ? 'Chasse au Trésor Flash' : 'Founder’s Flash Treasure Hunt'} (+${Number(fh.rewardCoins || 300)} 🪙)
            </h2>
          </div>
          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;">
            <span style="font-weight:900;color:#fde047;font-size:0.85rem;">🔥 ${rem} / ${maxC} ${isFr ? ' coffres restants' : ' chests left'}</span>
            ${fh.endsAt ? renderContestTimerBadgeHtml(fh.endsAt, fh.status, isFr) : ''}
          </div>
        </div>

        <div style="padding:10px 14px;border-radius:12px;background:rgba(0,0,0,0.35);border:1px solid rgba(255,255,255,0.08);color:#fde047;font-weight:700;font-size:0.86rem;margin-bottom:10px;">
          🗺️ "${escapeHtmlStr(riddleTxt || 'Find the secret city chest!')}"
        </div>

        ${myTried ? `
          <div style="padding:10px;border-radius:12px;text-align:center;font-weight:900;background:${myTried.correct ? 'rgba(16,185,129,0.2)' : 'rgba(244,63,94,0.2)'};color:${myTried.correct ? '#6ee7b7' : '#fda4af'};">
            ${myTried.correct
              ? (isFr ? `🎉 TRÉSOR DÉBLOQUÉ ! +${fh.rewardCoins} 🪙 ajoutés !` : `🎉 TREASURE UNLOCKED! +${fh.rewardCoins} 🪙 claimed!`)
              : (isFr ? '❌ Mauvaise ville ! Le coffre flash était ailleurs.' : '❌ Wrong city! The flash chest was hidden elsewhere.')
            }
          </div>
        ` : (fh.active && fh.status === 'open' && !fhExpired && rem > 0 ? `
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <select id="fhGuessCitySel" class="remo-input" style="flex:1;min-width:180px;">${cityOptionsHtml}</select>
            <button type="button" class="btn-cyber btn-gold" onclick="claimCitizenFlashHunt()">
              ⚡ ${isFr ? 'Ouvrir le Coffre Flash' : 'Unlock Flash Chest'} (+${Number(fh.rewardCoins || 300)} 🪙)
            </button>
          </div>
        ` : (fhExpired ? `<div style="text-align:center;font-size:0.78rem;color:#fda4af;font-weight:800;">${escapeHtmlStr(t('contest_expired_lbl'))}</div>` : ''))}
        ${_contestShareFootHtml('flashHunt', 'First citizens win instant REMO Coins — share the riddle!', 'Les premiers gagnent des Pièces REMO — partagez l’énigme !')}
      </div>
    `;
  }

  /* ═══════════════════════════════════════════════════════════════════════
     7 UNIQUE REMO WORLD SYSTEMS (Rendered ONLY when Admin-Activated)
     ═══════════════════════════════════════════════════════════════════════ */
  // 🔥 1. 4D WORLD TORCH RELAY™
  const tr = ws.torchRelay || {};
  let torchHtml = '';
  if (tr.active) {
    const curCity = getCityById(tr.currentCityId || 'montreal');
    const visited = Array.isArray(tr.visitedCities) ? tr.visitedCities : ['montreal'];
    const targetC = Math.max(2, Number(tr.targetCitiesCount || 10));
    const pct = Math.min(100, Math.round((visited.length / targetC) * 100));
    const routeChain = visited.map((cid) => {
      const cObj = getCityById(cid);
      return `${cObj.flag} ${escapeHtmlStr(getCityName(cObj, lang))}`;
    }).join(' ➔ ');
    const nextCitiesOpts = cities
      .filter((c) => c.id !== tr.currentCityId)
      .map((c) => `<option value="${c.id}">${c.flag} ${escapeHtmlStr(getCityName(c, lang))}</option>`)
      .join('');

    torchHtml = `
      <div id="contestCard_torchRelay" class="glass-box" style="margin-bottom:16px;border:1.5px solid rgba(249,115,22,0.7);background:radial-gradient(circle at top left,rgba(249,115,22,0.18),rgba(15,23,42,0.96) 70%);">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:10px;margin-bottom:10px;">
          <div>
            <div style="display:inline-flex;align-items:center;gap:6px;background:rgba(249,115,22,0.2);border:1px solid #f97316;color:#fdba74;padding:3px 10px;border-radius:99px;font-size:0.7rem;font-weight:900;margin-bottom:6px;">
              ${escapeHtmlStr(t('ws_torch_badge'))}
            </div>
            <h2 style="font-family:'Orbitron',sans-serif;font-size:1.12rem;color:#fff;margin:0;">
              🔥 ${escapeHtmlStr(isFr ? (tr.title_fr || tr.title_en) : (tr.title_en || tr.title_fr))}
            </h2>
          </div>
          <div style="text-align:right;">
            <span style="background:linear-gradient(135deg,#f97316,#ef4444);color:#fff;font-weight:900;padding:5px 12px;border-radius:10px;font-size:0.82rem;">
              🏆 Jackpot: +${Number(tr.jackpotCoins || 5000).toLocaleString()} 🪙
            </span>
            <div style="font-size:0.75rem;color:#fde047;font-weight:800;margin-top:4px;">
              🌍 ${Number(tr.totalKm || 0).toLocaleString()} KM · ${visited.length}/${targetC} ${isFr ? 'Villes' : 'Cities'}
            </div>
          </div>
        </div>

        <div style="padding:11px 14px;border-radius:12px;background:rgba(0,0,0,0.4);border:1px solid rgba(251,191,36,0.35);margin-bottom:10px;">
          <div style="font-size:0.76rem;color:#94a3b8;font-weight:800;margin-bottom:4px;">
            🔥 ${isFr ? 'Parcours Planétaire de la Flamme en Direct :' : 'Live Planetary Torch Route:'}
          </div>
          <div style="font-weight:900;color:#fde047;font-size:0.86rem;line-height:1.5;">${routeChain}</div>
          <div style="font-size:0.76rem;color:#38bdf8;font-weight:800;margin-top:6px;">
            🏃 ${isFr ? 'Porteur Actuel de la Flamme' : 'Current Torchbearer'}: <span style="color:#fff;">@${escapeHtmlStr(tr.currentHolderName || 'REMO Founder')}</span> (${curCity.flag} ${escapeHtmlStr(getCityName(curCity, lang))})
          </div>
        </div>

        <div class="war-bar-track" style="height:8px;margin-bottom:12px;">
          <div class="war-bar-fill-a" style="width:${pct}%;background:linear-gradient(90deg,#f97316,#fde047);"></div>
        </div>

        ${tr.status === 'running' ? `
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <select id="wsTorchNextCitySel" class="remo-input" style="min-width:170px;">${nextCitiesOpts}</select>
            <input type="text" id="wsTorchMsgInp" class="remo-input" style="flex:1;min-width:180px;" maxlength="120" placeholder="${isFr ? 'Message olympique en passant la flamme...' : 'Olympic relay message as you pass the torch...'}">
            <button type="button" class="btn-cyber btn-gold" onclick="citizenPassWorldTorch()">
              ${escapeHtmlStr(t('ws_torch_pass_btn'))}
            </button>
          </div>
        ` : `
          <div style="padding:10px;border-radius:12px;background:rgba(16,185,129,0.2);border:1px solid #10b981;color:#6ee7b7;font-weight:900;text-align:center;">
            🎉 ${isFr ? 'Objectif Planétaire Atteint ! Tous les porteurs de la Flamme ont partagé le Grand Jackpot !' : 'Planetary Target Reached! All Torchbearers shared the Grand Jackpot!'}
          </div>
        `}
        ${_contestShareFootHtml('torchRelay', 'Pass the flame & invite global cities onto the 4D route!', 'Faites tourner la flamme 4D dans le monde entier !')}
      </div>
    `;
  }

  // 🌍 2. GLOBAL SYNC FLASH™ (Simultaneous Planetary Live Mosaic)
  const gs = ws.globalSync || {};
  let syncHtml = '';
  if (gs.active) {
    const promptTxt = isFr ? (gs.prompt_fr || gs.prompt_en) : (gs.prompt_en || gs.prompt_fr);
    const moments = Array.isArray(gs.moments) ? gs.moments : [];
    const alreadySynced = Boolean(u && gs.participants && gs.participants[u.uid]);
    const gsExpired = _isContestExpired(gs);

    syncHtml = `
      <div id="contestCard_globalSync" class="glass-box" style="margin-bottom:16px;border:1.5px solid rgba(56,189,248,0.65);background:radial-gradient(circle at top right,rgba(56,189,248,0.16),rgba(15,23,42,0.96) 70%);">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:10px;margin-bottom:10px;">
          <div>
            <div style="display:inline-flex;align-items:center;gap:6px;background:rgba(56,189,248,0.2);border:1px solid #38bdf8;color:#7dd3fc;padding:3px 10px;border-radius:99px;font-size:0.7rem;font-weight:900;margin-bottom:6px;">
              ${escapeHtmlStr(t('ws_sync_badge'))}
            </div>
            <h2 style="font-family:'Orbitron',sans-serif;font-size:1.1rem;color:#fff;margin:0;">
              🌍 "${escapeHtmlStr(promptTxt)}"
            </h2>
          </div>
          <div style="text-align:right;display:flex;flex-direction:column;align-items:flex-end;gap:4px;">
            <span style="background:rgba(16,185,129,0.2);border:1px solid #10b981;color:#6ee7b7;font-weight:900;padding:4px 10px;border-radius:10px;font-size:0.8rem;">
              ⚡ +${Number(gs.rewardCoins || 100)} 🪙
            </span>
            ${renderContestTimerBadgeHtml(gs.endsAt, gs.status, isFr)}
          </div>
        </div>

        ${!alreadySynced && gs.status === 'open' && !gsExpired ? `
          <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:12px;padding:10px;border-radius:12px;background:rgba(15,23,42,0.82);border:1px solid rgba(56,189,248,0.3);">
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
              <select id="wsSyncCitySel" class="remo-input" style="min-width:155px;">${cityOptionsHtml}</select>
              <input type="text" id="wsSyncCaptionInp" class="remo-input" style="flex:1;min-width:190px;" maxlength="160" placeholder="${isFr ? 'Que voyez-vous ou faites-vous dans votre ville à cette seconde ?' : 'What is happening in your city at this exact second?'}">
            </div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
              <label style="flex:1;min-width:200px;font-size:0.74rem;color:#7dd3fc;font-weight:800;">
                ${escapeHtmlStr(t('ws_sync_photo_opt'))}
                <input type="file" accept="image/*" class="remo-input" style="margin-top:4px;" onchange="handleGlobalSyncMediaUpload(event)">
                <span id="wsSyncUploadStatus" style="display:block;font-size:0.72rem;color:#34d399;margin-top:2px;"></span>
              </label>
              <button type="button" class="btn-cyber btn-gold" onclick="citizenSubmitGlobalSync()">
                ${escapeHtmlStr(t('ws_sync_join_btn'))}
              </button>
            </div>
          </div>
        ` : (gsExpired && gs.status === 'open' && !alreadySynced ? `<div style="text-align:center;font-size:0.78rem;color:#fda4af;font-weight:800;margin-bottom:10px;">${escapeHtmlStr(t('contest_expired_lbl'))}</div>` : '')}

        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px;">
          ${moments.length === 0 ? `
            <div style="grid-column:1/-1;text-align:center;padding:16px;color:var(--muted);font-size:0.82rem;">
              🌍 ${isFr ? 'Soyez le premier citoyen à synchroniser votre ville en direct !' : 'Be the first citizen to sync your city live!'}
            </div>
          ` : moments.map((m) => {
            const c = getCityById(m.cityId);
            return `
              <div style="padding:10px 12px;border-radius:12px;background:rgba(15,23,42,0.9);border:1px solid rgba(56,189,248,0.4);">
                <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.74rem;font-weight:900;color:#fde047;margin-bottom:5px;">
                  <span>${c.flag} ${escapeHtmlStr(getCityName(c, lang))}</span>
                  <span>${m.weatherIcon || '☀️'} ${escapeHtmlStr(m.localTime || '12:00')} · ${m.tempC !== undefined ? m.tempC + '°C' : ''}</span>
                </div>
                ${m.mediaUrl ? `<img src="${escapeHtmlStr(m.mediaUrl)}" alt="Global Sync" style="width:100%;height:130px;object-fit:cover;border-radius:8px;margin-bottom:6px;">` : ''}
                <div style="font-size:0.84rem;color:#fff;font-weight:700;margin-bottom:4px;">"${escapeHtmlStr(m.caption)}"</div>
                <div style="font-size:0.72rem;color:#7dd3fc;font-weight:800;">⚡ LIVE SYNC · @${escapeHtmlStr(m.authorName)}</div>
              </div>
            `;
          }).join('')}
        </div>
        ${_contestShareFootHtml('globalSync', 'Synchronize the planet simultaneously — invite friends right now!', 'Synchronisons la planète au même instant — invitez vos amis !')}
      </div>
    `;
  }

  // 🏛️ 3. WORLD CITY MAYOR & ROYAL KEY™
  const me = ws.mayorElections || {};
  let mayorHtml = '';
  if (me.active) {
    const selCityId = window._selectedMayorElectionCity || (u && u.homeCity) || 'montreal';
    const selCity = getCityById(selCityId);
    const currentMayorUid = (REMO_STORE.state.cityMayors && REMO_STORE.state.cityMayors[selCityId]) || 'u_admin_founder';
    const mayorUser = (REMO_STORE.state.users || []).find((x) => x && x.uid === currentMayorUid);
    const mayorName = (mayorUser && mayorUser.name) || (currentMayorUid === 'u_admin_founder' ? 'REMO Founder' : currentMayorUid.replace(/^u_mayor_/, ''));
    const decreeObj = me.cityDecrees && me.cityDecrees[selCityId];
    const cityCandidates = (me.candidates && Array.isArray(me.candidates[selCityId])) ? me.candidates[selCityId] : [];
    const isCityMayorOrAdmin = Boolean((u && u.uid === currentMayorUid) || isAdm);

    mayorHtml = `
      <div id="contestCard_mayorElections" class="glass-box" style="margin-bottom:16px;border:1.5px solid rgba(251,191,36,0.65);">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:10px;">
          <div>
            <div style="display:inline-flex;align-items:center;gap:6px;background:rgba(251,191,36,0.2);border:1px solid #fbbf24;color:#fde047;padding:3px 10px;border-radius:99px;font-size:0.7rem;font-weight:900;margin-bottom:6px;">
              ${escapeHtmlStr(t('ws_mayor_badge'))}
            </div>
            <h2 style="font-family:'Orbitron',sans-serif;font-size:1.1rem;color:#fff;margin:0;">
              🏛️ ${selCity.flag} ${escapeHtmlStr(getCityName(selCity, lang))} — 👑 ${isFr ? 'Maire Actuel' : 'Current Mayor'}: <span style="color:#fde047;">@${escapeHtmlStr(mayorName)}</span> 🔑
            </h2>
          </div>
          <select class="remo-input" style="max-width:210px;" onchange="window._selectedMayorElectionCity=this.value;renderViralContestsView();">
            ${cities.map((c) => `<option value="${c.id}" ${c.id === selCityId ? 'selected' : ''}>${c.flag} ${escapeHtmlStr(getCityName(c, lang))}</option>`).join('')}
          </select>
        </div>

        ${decreeObj && (decreeObj.approved || isAdm) ? `
          <div style="padding:10px 14px;border-radius:12px;background:linear-gradient(90deg,rgba(251,191,36,0.16),rgba(15,23,42,0.9));border:1px solid #fbbf24;margin-bottom:10px;">
            <div style="font-size:0.72rem;font-weight:900;color:#fde047;margin-bottom:3px;">
              🔑 ${isFr ? 'DÉCRET D’ACCUEIL OFFICIEL DU MAIRE' : 'OFFICIAL MAYOR WELCOME DECREE'} (@${escapeHtmlStr(decreeObj.authorName)}) ${!decreeObj.approved ? '· [⏳ PENDING ADMIN]' : ''}:
            </div>
            <div style="font-size:0.86rem;color:#fff;font-weight:700;">"${escapeHtmlStr(isFr ? (decreeObj.text_fr || decreeObj.text_en) : (decreeObj.text_en || decreeObj.text_fr))}"</div>
          </div>
        ` : ''}

        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;">
          <input type="text" id="wsMayorManifestoInp" class="remo-input" style="flex:1;min-width:190px;" maxlength="130" placeholder="${isFr ? 'Votre promesse électorale pour cette ville...' : 'Your campaign promise for this city...'}">
          <button type="button" class="btn-cyber btn-gold" onclick="citizenVoteOrNominateMayor('${selCityId}','')">
            ${escapeHtmlStr(t('ws_mayor_vote_btn'))}
          </button>
        </div>

        ${isCityMayorOrAdmin ? `
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;padding:10px;border-radius:12px;background:rgba(251,191,36,0.1);border:1px dashed rgba(251,191,36,0.5);">
            <input type="text" id="wsMayorDecreeInp" class="remo-input" style="flex:1;min-width:190px;" maxlength="200" placeholder="${isFr ? '🔑 Écrire le message officiel de bienvenue de la ville...' : '🔑 Write the official city welcome message...'}">
            <button type="button" class="btn-cyber" onclick="citizenSubmitMayorDecree('${selCityId}')">
              ${escapeHtmlStr(t('ws_mayor_decree_btn'))}
            </button>
          </div>
        ` : ''}

        ${cityCandidates.length > 0 ? `
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:8px;">
            ${cityCandidates.map((cand, idx) => `
              <div style="padding:9px 12px;border-radius:12px;background:rgba(15,23,42,0.85);border:1px solid ${idx === 0 ? '#fbbf24' : 'rgba(255,255,255,0.1)'};display:flex;justify-content:space-between;align-items:center;gap:8px;">
                <div>
                  <div style="font-weight:900;font-size:0.84rem;color:#fff;">${idx === 0 ? '👑 ' : ''}@${escapeHtmlStr(cand.name)} (${Number(cand.votes || 0)} votes)</div>
                  <div style="font-size:0.72rem;color:#94a3b8;">"${escapeHtmlStr(cand.manifesto || '')}"</div>
                </div>
                <button type="button" class="btn-ghost" style="padding:5px 10px;font-size:0.73rem;border-color:#fbbf24;color:#fde047;" onclick="citizenVoteOrNominateMayor('${selCityId}','${cand.uid}')">
                  Vote
                </button>
              </div>
            `).join('')}
          </div>
        ` : ''}
        ${_contestShareFootHtml('mayorElections', 'Campaign & rally votes for your city Mayor!', 'Mobilisez votre ville pour élire votre Maire !')}
      </div>
    `;
  }

  // 🤝 4. SISTER CITIES 2X ALLIANCE™ (48h Twin-City Treaties)
  const sa = ws.sisterAlliances || {};
  let allianceHtml = '';
  if (sa.active && Array.isArray(sa.treaties) && sa.treaties.length > 0) {
    allianceHtml = `
      <div id="contestCard_sisterAlliances" class="glass-box" style="margin-bottom:16px;border:1.5px solid rgba(16,185,129,0.6);">
        <div style="display:inline-flex;align-items:center;gap:6px;background:rgba(16,185,129,0.2);border:1px solid #10b981;color:#6ee7b7;padding:3px 10px;border-radius:99px;font-size:0.7rem;font-weight:900;margin-bottom:8px;">
          ${escapeHtmlStr(t('ws_alliance_badge'))}
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:10px;">
          ${sa.treaties.map((trItem) => {
            const cA = getCityById(trItem.cityA);
            const cB = getCityById(trItem.cityB);
            const waved = Boolean(u && trItem.wavedBy && trItem.wavedBy[u.uid]);
            const trExp = Boolean(trItem.endsAt && Date.now() > Number(trItem.endsAt));
            const locked = waved || trExp;
            return `
              <div style="padding:12px;border-radius:14px;background:rgba(15,23,42,0.9);border:1px solid rgba(16,185,129,0.45);">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                  <span style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:0.95rem;color:#fff;">
                    ${cA.flag} ${escapeHtmlStr(getCityName(cA, lang))} 🤝 ${cB.flag} ${escapeHtmlStr(getCityName(cB, lang))}
                  </span>
                  <span style="background:rgba(251,191,36,0.2);border:1px solid #fbbf24;color:#fde047;font-size:0.7rem;font-weight:900;padding:2px 8px;border-radius:99px;">2X BONUS</span>
                </div>
                <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;flex-wrap:wrap;font-size:0.74rem;color:#6ee7b7;font-weight:800;margin-bottom:8px;">
                  <span>👋 ${Number(trItem.wavesCount || 0)} ${isFr ? 'Saluts Diplomatiques' : 'Diplomatic Waves'}</span>
                  ${renderContestTimerBadgeHtml(trItem.endsAt, trExp ? 'concluded' : 'open', isFr)}
                </div>
                <button type="button" class="btn-cyber ${locked ? '' : 'btn-gold'}" style="width:100%;justify-content:center;font-size:0.76rem;padding:7px;" ${locked ? 'disabled' : ''} onclick="citizenSendAllianceWave('${trItem.id}')">
                  ${waved ? (isFr ? '✓ Salut Diplomatique Envoyé' : '✓ Diplomatic Wave Sent') : (trExp ? escapeHtmlStr(t('contest_expired_lbl')) : escapeHtmlStr(t('ws_alliance_wave_btn')))}
                </button>
              </div>
            `;
          }).join('')}
        </div>
        ${_contestShareFootHtml('sisterAlliances', 'Invite both twin cities to double the diplomatic bonus!', 'Invitez les deux villes jumelées à doubler le bonus !')}
      </div>
    `;
  }

  // 🎨 5. REMO WORLD PIXEL CANVAS™
  const pc = ws.pixelCanvas || {};
  let pixelHtml = '';
  if (pc.active) {
    const W = Number(pc.width || 24);
    const H = Number(pc.height || 14);
    const palette = ['#fbbf24', '#ef4444', '#38bdf8', '#2563eb', '#10b981', '#ffffff', '#a855f7', '#f97316', '#ec4899', '#0f172a'];
    const curColor = window._selectedWorldPixelColor || '#fbbf24';
    let gridCells = '';
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const px = pc.pixels && pc.pixels[`${x}_${y}`];
        const bg = (px && px.color) || 'rgba(15,23,42,0.85)';
        const tip = px ? `@${px.name} (${px.cityId})` : `${x},${y}`;
        gridCells += `<div onclick="citizenClickPixelCanvas(${x},${y})" title="${escapeHtmlStr(tip)}" style="aspect-ratio:1;background:${escapeHtmlStr(bg)};border:1px solid rgba(255,255,255,0.06);cursor:pointer;border-radius:2px;"></div>`;
      }
    }

    pixelHtml = `
      <div id="contestCard_pixelCanvas" class="glass-box" style="margin-bottom:16px;border:1.5px solid rgba(168,85,247,0.6);">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:10px;">
          <div>
            <div style="display:inline-flex;align-items:center;gap:6px;background:rgba(168,85,247,0.2);border:1px solid #a855f7;color:#e9d5ff;padding:3px 10px;border-radius:99px;font-size:0.7rem;font-weight:900;margin-bottom:6px;">
              ${escapeHtmlStr(t('ws_pixel_badge'))}
            </div>
            <h2 style="font-family:'Orbitron',sans-serif;font-size:1.08rem;color:#fff;margin:0;">
              🎨 ${escapeHtmlStr(isFr ? (pc.title_fr || pc.title_en) : (pc.title_en || pc.title_fr))} (+${Number(pc.pixelRewardCoins || 5)} 🪙/pixel)
            </h2>
          </div>
          <span style="font-size:0.78rem;font-weight:900;color:#fde047;">
            🖌️ ${Number(pc.totalPixelsPlaced || 0)} pixels · 🎴 ${Number(pc.mintedCardsCount || 0)} 4D Editions
          </span>
        </div>

        <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:10px;">
          <span style="font-size:0.75rem;color:#cbd5e1;font-weight:800;">${isFr ? 'Couleur :' : 'Color:'}</span>
          ${palette.map((col) => `
            <button type="button" onclick="citizenSelectPixelColor('${col}')" style="width:24px;height:24px;border-radius:50%;background:${col};border:${curColor === col ? '3px solid #fff' : '1px solid rgba(255,255,255,0.3)'};cursor:pointer;box-shadow:${curColor === col ? '0 0 10px ' + col : 'none'};"></button>
          `).join('')}
        </div>

        <div style="display:grid;grid-template-columns:repeat(${W},1fr);gap:2px;background:#050816;padding:6px;border-radius:12px;border:1px solid rgba(255,255,255,0.12);max-width:680px;margin:0 auto;">
          ${gridCells}
        </div>
        ${_contestShareFootHtml('pixelCanvas', 'Share the live world pixel fresco snapshot with friends!', 'Partagez la fresque pixel mondiale avec vos amis !')}
      </div>
    `;
  }

  // ⏳ 6. CITY MONUMENT TIME-VAULT™
  const mv = ws.monumentVault || {};
  let vaultHtml = '';
  if (mv.active) {
    const capsules = Array.isArray(mv.capsules) ? mv.capsules : [];
    const hasDeposited = Boolean(u && capsules.some((c) => c && c.uid === u.uid));
    const targetLbl = isFr ? (mv.unsealTargetLabel_fr || mv.unsealTargetLabel_en) : (mv.unsealTargetLabel_en || mv.unsealTargetLabel_fr);

    vaultHtml = `
      <div id="contestCard_monumentVault" class="glass-box" style="margin-bottom:16px;border:1.5px solid rgba(251,191,36,0.65);">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:10px;">
          <div>
            <div style="display:inline-flex;align-items:center;gap:6px;background:rgba(251,191,36,0.2);border:1px solid #fbbf24;color:#fde047;padding:3px 10px;border-radius:99px;font-size:0.7rem;font-weight:900;margin-bottom:6px;">
              ${escapeHtmlStr(t('ws_vault_badge'))} · ${mv.sealed ? '🔒 SEALED' : '🔓 UNSEALED GALA'}
            </div>
            <h2 style="font-family:'Orbitron',sans-serif;font-size:1.08rem;color:#fff;margin:0;">
              ⏳ ${escapeHtmlStr(isFr ? (mv.title_fr || mv.title_en) : (mv.title_en || mv.title_fr))}
            </h2>
            <p style="font-size:0.76rem;color:#7dd3fc;margin:3px 0 0;">🎯 ${escapeHtmlStr(targetLbl)} · ${capsules.length} ${isFr ? 'capsules déposées' : 'capsules sealed'}</p>
          </div>
        </div>

        ${!hasDeposited ? `
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px;">
            <select id="wsVaultCitySel" class="remo-input" style="min-width:155px;">${cityOptionsHtml}</select>
            <input type="text" id="wsVaultMsgInp" class="remo-input" style="flex:1;min-width:190px;" maxlength="240" placeholder="${isFr ? 'Déposez votre vœu ou prédiction pour le futur de votre ville...' : 'Deposit your wish or prediction for your city’s future...'}">
            <button type="button" class="btn-cyber btn-gold" onclick="citizenDepositMonumentCapsule()">
              ${escapeHtmlStr(t('ws_vault_deposit_btn'))}
            </button>
          </div>
        ` : ''}

        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:8px;">
          ${capsules.map((cap) => {
            const c = getCityById(cap.cityId);
            return `
              <div style="padding:10px 12px;border-radius:12px;background:rgba(15,23,42,0.88);border:1px solid ${mv.sealed ? 'rgba(148,163,184,0.3)' : '#fbbf24'};">
                <div style="font-size:0.74rem;font-weight:900;color:#fde047;margin-bottom:4px;">
                  ${c.flag} ${escapeHtmlStr(getCityName(c, lang))} · @${escapeHtmlStr(cap.authorName)}
                </div>
                ${mv.sealed && !isAdm ? `
                  <div style="font-size:0.78rem;color:#94a3b8;font-style:italic;">
                    🔒 ${isFr ? 'Capsule scellée jusqu’à l’ouverture officielle par le Fondateur' : 'Capsule sealed until official Founder gala opening'}
                  </div>
                ` : `
                  <div style="font-size:0.84rem;color:#fff;font-weight:700;">🔓 "${escapeHtmlStr(cap.message)}"</div>
                `}
              </div>
            `;
          }).join('')}
        </div>
        ${_contestShareFootHtml('monumentVault', 'Seal a prediction & share the city time-capsule gala!', 'Scellez votre capsule temporelle et partagez l’événement !')}
      </div>
    `;
  }

  // 📈 7. CREATOR SHARES & FAN DIVIDENDS™
  const cb = ws.creatorBourse || {};
  let bourseHtml = '';
  if (cb.active) {
    const stocks = Array.isArray(cb.stocks) ? cb.stocks : [];
    bourseHtml = `
      <div id="contestCard_creatorBourse" class="glass-box" style="margin-bottom:16px;border:1.5px solid rgba(56,189,248,0.6);">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:10px;">
          <div>
            <div style="display:inline-flex;align-items:center;gap:6px;background:rgba(56,189,248,0.2);border:1px solid #38bdf8;color:#7dd3fc;padding:3px 10px;border-radius:99px;font-size:0.7rem;font-weight:900;margin-bottom:6px;">
              ${escapeHtmlStr(t('ws_bourse_badge'))}
            </div>
            <h2 style="font-family:'Orbitron',sans-serif;font-size:1.08rem;color:#fff;margin:0;">
              📈 ${isFr ? 'Investissez dans les Créateurs & Recevez des Dividendes !' : 'Invest in Creators & Earn Automatic Fan Dividends!'}
            </h2>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(235px,1fr));gap:10px;">
          ${stocks.map((st) => {
            const c = getCityById(st.cityId || 'montreal');
            const myShares = Number((u && st.shareholders && st.shareholders[u.uid]) || 0);
            return `
              <div style="padding:12px;border-radius:14px;background:rgba(15,23,42,0.9);border:1px solid rgba(56,189,248,0.35);display:flex;flex-direction:column;justify-content:space-between;gap:8px;">
                <div>
                  <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-weight:900;color:#fff;font-size:0.9rem;">@${escapeHtmlStr(st.creatorName)}</span>
                    <span style="font-family:'Orbitron',sans-serif;font-weight:900;color:#fde047;font-size:0.86rem;">${Number(st.sharePrice || 50)} 🪙</span>
                  </div>
                  <div style="font-size:0.74rem;color:#7dd3fc;margin-top:2px;">
                    ${c.flag} ${escapeHtmlStr(getCityName(c, lang))} · ${isFr ? 'Mes parts :' : 'My shares:'} <strong style="color:#34d399;">${myShares}</strong>
                  </div>
                  ${st.lastDividendCoins ? `
                    <div style="font-size:0.7rem;color:#fbbf24;margin-top:3px;">💎 ${isFr ? 'Dernier dividende' : 'Last dividend'}: +${st.lastDividendCoins} 🪙/part</div>
                  ` : ''}
                </div>
                <div style="display:flex;gap:6px;">
                  <button type="button" class="btn-cyber btn-gold" style="flex:1;justify-content:center;font-size:0.73rem;padding:6px;" onclick="citizenBuyCreatorShare('${st.creatorUid}')">
                    📈 ${isFr ? 'Acheter' : 'Buy'} (${Number(st.sharePrice || 50)} 🪙)
                  </button>
                  ${myShares > 0 ? `
                    <button type="button" class="btn-ghost" style="padding:6px 10px;font-size:0.73rem;" onclick="citizenSellCreatorShare('${st.creatorUid}')">
                      💰 ${isFr ? 'Vendre' : 'Sell'}
                    </button>
                  ` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
        ${_contestShareFootHtml('creatorBourse', 'Back local city creators & share Fan Dividends live!', 'Investissez dans vos créateurs locaux et partagez !')}
      </div>
    `;
  }

  stage.innerHTML = `
    <div class="glass-box" style="margin-bottom:16px;background:linear-gradient(135deg,rgba(15,23,42,0.96),rgba(49,16,68,0.75));border-color:rgba(251,191,36,0.5);">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
        <div>
          <h1 style="font-family:'Orbitron',sans-serif;font-size:1.25rem;color:#fde047;margin:0;" data-i18n="contests_hub_title">${escapeHtmlStr(t('contests_hub_title'))}</h1>
          <p style="font-size:0.82rem;color:#cbd5e1;margin-top:4px;" data-i18n="contests_hub_sub">${escapeHtmlStr(t('contests_hub_sub'))}</p>
        </div>
        ${isAdm ? `
          <a href="admin.html" class="btn-cyber btn-gold" style="text-decoration:none;">
            👑 ${isFr ? 'Gérer les Concours & 7 Systèmes (Admin)' : 'Manage Contests & 7 Systems (Admin)'}
          </a>
        ` : ''}
      </div>
    </div>

    ${!anyActive ? `
      <div class="glass-box" style="text-align:center;padding:38px 20px;color:#cbd5e1;font-size:0.9rem;">
        <div style="font-size:2.4rem;margin-bottom:8px;">🏆🎤⚽</div>
        <div style="font-weight:800;">${escapeHtmlStr(t('contests_none_active'))}</div>
      </div>
    ` : ''}

    ${torchHtml}
    ${syncHtml}
    ${mayorHtml}
    ${allianceHtml}
    ${pixelHtml}
    ${vaultHtml}
    ${bourseHtml}
    ${euroHtml}
    ${pgpHtml}
    ${wcHtml}
    ${mdHtml}
    ${grHtml}
    ${fhHtml}
  `;
  if (typeof focusPendingContestDeepLink === 'function' && window._pendingContestDeepLink) {
    setTimeout(focusPendingContestDeepLink, 80);
  }
}
window.renderViralContestsView = renderViralContestsView;

async function handleEurovisionAudioUpload(ev) {
  const file = ev.target.files && ev.target.files[0];
  if (!file) return;
  const statusEl = document.getElementById('euroAudioUploadStatus');
  const lang = REMO_I18N.getLang();
  if (file.size > 12 * 1024 * 1024) {
    remoToast(lang === 'fr' ? '⚠️ Fichier trop volumineux (Max 12 MB / 60s).' : '⚠️ Audio file too large (Max 12 MB / 60s).');
    return;
  }
  if (statusEl) statusEl.textContent = t('ws_sync_uploading');
  const url = (REMO_STORE && typeof REMO_STORE.uploadMediaToCloudOrDataUrl === 'function')
    ? await REMO_STORE.uploadMediaToCloudOrDataUrl(file, 'contests_audio')
    : '';
  if (!url || url.startsWith('idb://')) {
    _pendingEuroAudioDataUrl = '';
    if (statusEl) {
      statusEl.textContent = lang === 'fr'
        ? '⚠️ Cloud indisponible pour >1.2MB : utilisez un MP3 < 1.2MB ou collez un lien.'
        : '⚠️ Cloud unavailable & file > 1.2MB: upload < 1.2MB MP3 or paste a link.';
    }
    return;
  }
  _pendingEuroAudioDataUrl = url;
  if (statusEl) {
    statusEl.textContent = lang === 'fr'
      ? `✓ Audio 60s prêt (Cloud) : ${file.name}`
      : `✓ 60s Audio ready (Cloud): ${file.name}`;
  }
}
window.handleEurovisionAudioUpload = handleEurovisionAudioUpload;

function submitCitizenEurovisionSong() {
  const lang = REMO_I18N.getLang();
  const isFr = lang === 'fr';
  const u = REMO_STORE.getCurrentUser();
  if (!u || u.role === 'guest') {
    openAuthModal();
    return;
  }
  const cityId = document.getElementById('euroSubCitySel')?.value || u.homeCity || 'montreal';
  const songTitle = (document.getElementById('euroSubTitleInp')?.value || '').trim();
  const artistName = (document.getElementById('euroSubArtistInp')?.value || u.name || 'Creator').trim();
  const externalLink = (document.getElementById('euroSubLinkInp')?.value || '').trim();
  const soundPreset = document.getElementById('euroSubPresetSel')?.value || 'shibuya_neon';

  if (!songTitle) {
    remoToast(isFr ? '⚠️ Entrez le titre de votre chanson !' : '⚠️ Please enter a song title!');
    return;
  }

  const res = REMO_STORE.submitEurovisionEntry({
    cityId,
    songTitle,
    artistName,
    audioUrl: _pendingEuroAudioDataUrl,
    externalLink,
    soundPreset
  });

  if (!res.ok) {
    if (res.error === 'already_submitted') {
      remoToast(isFr ? '⚠️ Vous avez déjà inscrit une chanson pour cette édition !' : '⚠️ You already submitted a song for this edition!');
    } else if (res.error === 'ended') {
      remoToast(isFr ? '⌛ Temps écoulé pour les inscriptions.' : '⌛ Submission time has ended.');
    } else {
      remoToast(isFr ? '⚠️ Inscriptions fermées.' : '⚠️ Submissions are closed.');
    }
    return;
  }

  _pendingEuroAudioDataUrl = '';
  spawnRemoCoinsFX(10);
  remoToast(isFr ? `🎤 "${songTitle}" inscrit au REMO Concours Musical (+25 🪙) !` : `🎤 "${songTitle}" entered in REMO Music Contest (+25 🪙)!`, 'fanfare');
  renderViralContestsView();
}
window.submitCitizenEurovisionSong = submitCitizenEurovisionSong;

function castCitizenEurovisionVote(entryId) {
  const lang = REMO_I18N.getLang();
  const isFr = lang === 'fr';
  const u = REMO_STORE.getCurrentUser();
  if (!u || u.role === 'guest') {
    openAuthModal();
    return;
  }
  const res = REMO_STORE.voteEurovisionEntry(entryId);
  if (!res.ok) {
    if (res.error === 'self_city_blocked') {
      remoToast(t('euro_no_self_city_err'));
    } else if (res.error === 'already_voted') {
      remoToast(isFr ? '⚠️ Vous avez déjà attribué votre Vote d’Or (+100 PTS) !' : '⚠️ You already cast your REMO Gold Vote (+100 PTS)!');
    } else {
      remoToast(isFr ? '⚠️ Vote terminé.' : '⚠️ Voting has ended.');
    }
    return;
  }
  spawnRemoCoinsFX(12);
  const c = getCityById(res.entry.cityId);
  remoToast(
    isFr
      ? `🌟 VOTE D’OR REMO (+100 PTS) pour ${c.flag} ${getCityName(c, 'fr')} ! (+15 🪙)`
      : `🌟 REMO GOLD VOTE (+100 PTS) to ${c.flag} ${getCityName(c, 'en')}! (+15 🪙)`,
    'fanfare'
  );
  syncHeaderAndSidebars();
  renderViralContestsView();
}
window.castCitizenEurovisionVote = castCitizenEurovisionVote;

async function handlePgpMediaUpload(ev) {
  const file = ev.target.files && ev.target.files[0];
  if (!file) return;
  const st = document.getElementById('pgpUploadStatus');
  if (st) st.textContent = t('ws_sync_uploading');
  _pendingPgpMediaType = (String(file.type || '').startsWith('video') || /\.(mp4|webm|mov|m4v)$/i.test(file.name || '')) ? 'video' : 'image';
  const url = (REMO_STORE && typeof REMO_STORE.uploadMediaToCloudOrDataUrl === 'function')
    ? await REMO_STORE.uploadMediaToCloudOrDataUrl(file, 'contests_pgp')
    : '';
  if (!url || url.startsWith('idb://')) {
    _pendingPgpMediaDataUrl = '';
    const isFr = REMO_I18N.getLang() === 'fr';
    if (st) st.textContent = isFr ? '⚠️ Fichier trop grand sans cloud — utilisez une photo ou vidéo < 1.2MB.' : '⚠️ File too large without cloud — pick image or < 1.2MB video.';
    return;
  }
  _pendingPgpMediaDataUrl = url;
  if (st) st.textContent = `✓ ${file.name}`;
}
window.handlePgpMediaUpload = handlePgpMediaUpload;

function submitCitizenPgpEntry() {
  const isFr = REMO_I18N.getLang() === 'fr';
  const u = REMO_STORE.getCurrentUser();
  if (!u || u.role === 'guest') { openAuthModal(); return; }
  const cityId = document.getElementById('pgpSubCitySel')?.value || u.homeCity || 'montreal';
  const title = (document.getElementById('pgpSubTitleInp')?.value || '').trim();
  if (!title) {
    remoToast(isFr ? '⚠️ Ajoutez un titre !' : '⚠️ Please enter a title!');
    return;
  }
  if (!_pendingPgpMediaDataUrl) {
    remoToast(t('pgp_media_required_err'));
    return;
  }
  const res = REMO_STORE.submitPhotoGrandPrixEntry({
    cityId,
    title,
    mediaUrl: _pendingPgpMediaDataUrl,
    mediaType: _pendingPgpMediaType
  });
  if (!res.ok) {
    if (res.error === 'ended' || res.error === 'inactive') {
      remoToast(isFr ? '⌛ Grand Prix terminé !' : '⌛ Grand Prix has ended!');
    } else if (res.error === 'media_required') {
      remoToast(t('pgp_media_required_err'));
    } else {
      remoToast(isFr ? '⚠️ Vous avez déjà soumis une participation !' : '⚠️ You already submitted an entry!');
    }
    return;
  }
  _pendingPgpMediaDataUrl = '';
  spawnRemoCoinsFX(8);
  remoToast(isFr ? '📸 Participation inscrite au Grand Prix (+20 🪙) !' : '📸 Entry submitted to Grand Prix (+20 🪙)!', 'fanfare');
  syncHeaderAndSidebars();
  renderViralContestsView();
}
window.submitCitizenPgpEntry = submitCitizenPgpEntry;

function voteCitizenPgpEntry(entryId) {
  const isFr = REMO_I18N.getLang() === 'fr';
  const u = REMO_STORE.getCurrentUser();
  if (!u || u.role === 'guest') { openAuthModal(); return; }
  const res = REMO_STORE.votePhotoGrandPrixEntry(entryId);
  if (!res.ok) {
    remoToast(res.error === 'ended'
      ? (isFr ? '⌛ Temps écoulé !' : '⌛ Voting time has ended!')
      : (isFr ? '⚠️ 1 seul vote par citoyen !' : '⚠️ Only 1 vote per citizen!'));
    return;
  }
  spawnRemoCoinsFX(6);
  remoToast(isFr ? '🔥 Vote enregistré (+10 🪙) !' : '🔥 Vote recorded (+10 🪙)!', 'coin');
  syncHeaderAndSidebars();
  renderViralContestsView();
}
window.voteCitizenPgpEntry = voteCitizenPgpEntry;

function voteCitizenWorldCupMatch(matchId, side) {
  const isFr = REMO_I18N.getLang() === 'fr';
  const u = REMO_STORE.getCurrentUser();
  if (!u || u.role === 'guest') { openAuthModal(); return; }
  const res = REMO_STORE.voteWorldCupMatch(matchId, side);
  if (!res.ok) {
    remoToast(res.error === 'ended'
      ? (isFr ? '⌛ Tour terminé !' : '⌛ Round voting ended!')
      : (isFr ? '⚠️ Vous avez déjà voté pour ce match !' : '⚠️ You already voted in this match!'));
    return;
  }
  spawnRemoCoinsFX(6);
  remoToast(isFr ? '⚽ Vote Coupe du Monde enregistré (+10 🪙) !' : '⚽ World Cup vote recorded (+10 🪙)!', 'coin');
  syncHeaderAndSidebars();
  renderViralContestsView();
}
window.voteCitizenWorldCupMatch = voteCitizenWorldCupMatch;

function submitCitizenMysteryDetective() {
  const isFr = REMO_I18N.getLang() === 'fr';
  const u = REMO_STORE.getCurrentUser();
  if (!u || u.role === 'guest') { openAuthModal(); return; }
  const cityId = document.getElementById('mdGuessCitySel')?.value || 'paris';
  const res = REMO_STORE.submitMysteryDetectiveGuess(cityId);
  if (!res.ok) {
    remoToast(isFr ? '⚠️ Essai déjà utilisé ou enquête terminée !' : '⚠️ Attempt already used or detective quiz ended!');
    return;
  }
  if (res.correct) {
    spawnRemoCoinsFX(14);
    remoToast(isFr ? `🎉 BINGO ! Vous gagnez +${res.reward} 🪙 !` : `🎉 BINGO! You won +${res.reward} 🪙!`, 'fanfare');
  } else {
    remoToast(isFr ? '❌ Mauvaise réponse ! Vous n’aviez qu’un seul essai.' : '❌ Wrong city! Only 1 attempt allowed.');
  }
  syncHeaderAndSidebars();
  renderViralContestsView();
}
window.submitCitizenMysteryDetective = submitCitizenMysteryDetective;

function claimCitizenGoldenTicket() {
  const isFr = REMO_I18N.getLang() === 'fr';
  const u = REMO_STORE.getCurrentUser();
  if (!u || u.role === 'guest') { openAuthModal(); return; }
  const res = REMO_STORE.claimGoldenRaffleTicket();
  if (!res.ok) {
    remoToast(res.error === 'ended'
      ? (isFr ? '⌛ Tombola clôturée !' : '⌛ Raffle window ended!')
      : (isFr ? '⚠️ Vous avez déjà votre Ticket d’Or !' : '⚠️ You already claimed your Golden Ticket!'));
    return;
  }
  spawnRemoCoinsFX(8);
  remoToast(isFr ? `🎟️ Ticket #${res.ticket.code} activé (+10 🪙) !` : `🎟️ Ticket #${res.ticket.code} claimed (+10 🪙)!`, 'fanfare');
  syncHeaderAndSidebars();
  renderViralContestsView();
}
window.claimCitizenGoldenTicket = claimCitizenGoldenTicket;

function claimCitizenFlashHunt() {
  const isFr = REMO_I18N.getLang() === 'fr';
  const u = REMO_STORE.getCurrentUser();
  if (!u || u.role === 'guest') { openAuthModal(); return; }
  const cityId = document.getElementById('fhGuessCitySel')?.value || 'montreal';
  const res = REMO_STORE.claimFlashHuntTreasure(cityId);
  if (!res.ok) {
    remoToast(isFr ? '⚠️ Déjà tenté ou chasse terminée !' : '⚠️ Already tried or flash hunt ended!');
    return;
  }
  if (res.correct) {
    spawnRemoCoinsFX(12);
    remoToast(isFr ? `⚡ COFFRE FLASH TROUVÉ ! +${res.reward} 🪙 !` : `⚡ FLASH CHEST FOUND! +${res.reward} 🪙!`, 'fanfare');
  } else {
    remoToast(isFr ? '❌ Ce n’était pas la bonne ville cible !' : '❌ That was not the secret target city!');
  }
  syncHeaderAndSidebars();
  renderViralContestsView();
}
window.claimCitizenFlashHunt = claimCitizenFlashHunt;

async function handleGlobalSyncMediaUpload(ev) {
  const file = ev.target.files && ev.target.files[0];
  if (!file) return;
  const st = document.getElementById('wsSyncUploadStatus');
  if (st) st.textContent = t('ws_sync_uploading');
  const url = (REMO_STORE && typeof REMO_STORE.uploadMediaToCloudOrDataUrl === 'function')
    ? await REMO_STORE.uploadMediaToCloudOrDataUrl(file, 'global_sync')
    : '';
  if (!url || url.startsWith('idb://')) {
    _pendingGlobalSyncMediaUrl = '';
    if (st) st.textContent = '⚠️ Photo could not upload cleanly.';
    return;
  }
  _pendingGlobalSyncMediaUrl = url;
  if (st) st.textContent = `✓ ${file.name}`;
}
window.handleGlobalSyncMediaUpload = handleGlobalSyncMediaUpload;

/* ── CITIZEN HANDLERS FOR THE 7 UNIQUE REMO WORLD SYSTEMS ── */
function citizenPassWorldTorch() {
  const isFr = REMO_I18N.getLang() === 'fr';
  const u = REMO_STORE.getCurrentUser();
  if (!u || u.role === 'guest') { openAuthModal(); return; }
  const nextCityId = document.getElementById('wsTorchNextCitySel')?.value || 'paris';
  const msg = (document.getElementById('wsTorchMsgInp')?.value || '').trim();
  const res = REMO_STORE.passWorldTorchToCity(nextCityId, msg);
  if (!res.ok) {
    remoToast(isFr ? '⚠️ Choisissez une autre ville de destination !' : '⚠️ Please choose a different destination city!');
    return;
  }
  spawnRemoCoinsFX(10);
  const c = getCityById(nextCityId);
  remoToast(
    isFr
      ? `🔥 Flamme passée à ${c.flag} ${getCityName(c, 'fr')} (+${res.km} km) ! +${res.reward} 🪙 !`
      : `🔥 Torch passed to ${c.flag} ${getCityName(c, 'en')} (+${res.km} km)! +${res.reward} 🪙!`,
    'fanfare'
  );
  syncHeaderAndSidebars();
  renderViralContestsView();
}
window.citizenPassWorldTorch = citizenPassWorldTorch;

function citizenSubmitGlobalSync() {
  const isFr = REMO_I18N.getLang() === 'fr';
  const u = REMO_STORE.getCurrentUser();
  if (!u || u.role === 'guest') { openAuthModal(); return; }
  const cityId = document.getElementById('wsSyncCitySel')?.value || u.homeCity || 'montreal';
  const caption = (document.getElementById('wsSyncCaptionInp')?.value || '').trim();
  if (!caption) {
    remoToast(isFr ? '⚠️ Décrivez votre instant en direct !' : '⚠️ Describe your live moment!');
    return;
  }
  const res = REMO_STORE.submitGlobalSyncMoment({ cityId, caption, mediaUrl: _pendingGlobalSyncMediaUrl });
  if (!res.ok) {
    remoToast(res.error === 'expired'
      ? (isFr ? '⌛ Fenêtre Global Sync terminée !' : '⌛ Global Sync window ended!')
      : (isFr ? '⚠️ Vous avez déjà synchronisé votre ville !' : '⚠️ You already synced your city in this window!'));
    return;
  }
  _pendingGlobalSyncMediaUrl = '';
  spawnRemoCoinsFX(12);
  remoToast(
    isFr
      ? `🌍 Instant Planétaire Synchronisé ! +${res.reward} 🪙 !`
      : `🌍 Global Sync Moment Published! +${res.reward} 🪙!`,
    'fanfare'
  );
  syncHeaderAndSidebars();
  renderViralContestsView();
}
window.citizenSubmitGlobalSync = citizenSubmitGlobalSync;

function _buildContestShareUrl(contestKey, entryId = '') {
  const u = (REMO_STORE && typeof REMO_STORE.getCurrentUser === 'function') ? REMO_STORE.getCurrentUser() : null;
  const refCode = (u && (u.referralCode || u.passportNum)) ? String(u.referralCode || ('REMO-' + u.passportNum)) : '';
  let baseOrigin = (typeof window !== 'undefined' && window.location && window.location.origin && window.location.origin !== 'null')
    ? window.location.origin
    : 'https://remoworld.com';
  if (typeof window !== 'undefined' && window.location && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    baseOrigin = 'https://remoworld.com';
  }
  return `${baseOrigin}/index.html?view=contests&contest=${encodeURIComponent(contestKey || 'eurovision')}${entryId ? '&entry=' + encodeURIComponent(entryId) : ''}${refCode ? '&ref=' + encodeURIComponent(refCode) : ''}`;
}
window._buildContestShareUrl = _buildContestShareUrl;

function _getContestShareDescriptor(contestKey, entryId = '') {
  const lang = (window.REMO_I18N && REMO_I18N.getLang() === 'fr') ? 'fr' : 'en';
  const isFr = lang === 'fr';
  const vc = (REMO_STORE.state && REMO_STORE.state.viralContests) || {};
  const ws = (REMO_STORE.state && REMO_STORE.state.worldSystems) || {};
  const u = REMO_STORE.getCurrentUser();
  const url = _buildContestShareUrl(contestKey, entryId);
  const gCityName = (cid) => {
    const c = (typeof getCityById === 'function' ? getCityById(cid) : null) || { flag: '🌐', name_en: cid, name_fr: cid };
    const nm = (typeof getCityName === 'function') ? getCityName(c, lang) : (c.name_en || cid);
    return `${c.flag || '🌐'} ${nm}`;
  };

  let accent = '#fbbf24';
  let badge = 'REMO CONTEST LIVE';
  let title = isFr ? '🏆 Concours Mondial REMO' : '🏆 REMO Global Contest';
  let subtitle = isFr ? 'Rejoins les citoyens du monde en direct !' : 'Join global citizens live right now!';
  let prizeText = '';
  let timerText = isFr ? 'EN DIRECT' : 'LIVE NOW';
  let thumbUrl = '';
  let pixelSnapshot = null;

  if (contestKey === 'eurovision') {
    const ev = vc.eurovision || {};
    const songs = Array.isArray(ev.entries) ? ev.entries : [];
    const targetSong = entryId ? songs.find((s) => s && s.id === entryId) : null;
    accent = '#fbbf24';
    badge = '🎤 REMO MUSIC CONTEST';
    title = isFr ? (ev.title_fr || 'Concours Musical REMO') : (ev.title_en || 'REMO Music Contest');
    prizeText = `🏆 +${Number(ev.prizeCoins || 5000).toLocaleString()} 🪙`;
    timerText = ev.status === 'concluded' ? (isFr ? 'TERMINÉ' : 'CONCLUDED') : formatContestRemainingTime(ev.endsAt);
    subtitle = targetSong
      ? `${gCityName(targetSong.cityId)} — "${targetSong.songTitle}" (@${targetSong.artistName || targetSong.authorName}) · ${Number(targetSong.votesCount || 0)} votes`
      : (isFr ? `${songs.length} chansons de villes en compétition` : `${songs.length} world city anthems competing`);
  } else if (contestKey === 'photoGrandPrix') {
    const pgp = vc.photoGrandPrix || {};
    const items = Array.isArray(pgp.entries) ? pgp.entries : [];
    const targetItem = entryId ? items.find((p) => p && p.id === entryId) : items[0];
    accent = '#38bdf8';
    badge = '📸 PHOTO & VIDEO GRAND PRIX';
    title = isFr ? (pgp.theme_fr || 'Grand Prix Photo & Vidéo') : (pgp.theme_en || 'Photo & Video Grand Prix');
    prizeText = `🥇 +${Number(pgp.prize1st || 3000)} 🪙`;
    timerText = pgp.status === 'concluded' ? (isFr ? 'PODIUM FINAL' : 'FINAL PODIUM') : formatContestRemainingTime(pgp.endsAt);
    subtitle = targetItem
      ? `${gCityName(targetItem.cityId)} — "${targetItem.caption || ''}" · ${Number(targetItem.votesCount || 0)} votes`
      : (isFr ? `${items.length} participations en lice` : `${items.length} city snapshots competing`);
    if (targetItem && targetItem.mediaUrl && (!targetItem.mediaType || targetItem.mediaType === 'image')) {
      thumbUrl = targetItem.mediaUrl;
    }
  } else if (contestKey === 'worldCupBracket') {
    const wc = vc.worldCupBracket || {};
    const matches = Array.isArray(wc.matches) ? wc.matches : [];
    const targetMatch = entryId ? matches.find((m) => m && m.id === entryId) : matches[0];
    accent = '#10b981';
    badge = `⚽ WORLD CUP · ROUND ${String(wc.round || 'QF').toUpperCase()}`;
    title = isFr ? (wc.title_fr || 'Coupe du Monde des Villes') : (wc.title_en || '8-City World Knockout Cup');
    prizeText = `🏆 +${Number(wc.prizeCityBonus || wc.prizePool || 5000)} PTS`;
    timerText = (wc.status === 'concluded' || wc.round === 'champion') ? (isFr ? 'CHAMPION COURONNÉ' : 'CHAMPION CROWNED') : formatContestRemainingTime(wc.endsAt);
    if (wc.championCityId) {
      subtitle = `${isFr ? 'Champion Mondial' : 'World Champion'}: ${gCityName(wc.championCityId)}`;
    } else if (targetMatch) {
      subtitle = `${gCityName(targetMatch.cityA)} (${targetMatch.votesA || 0}) ⚔️ ${gCityName(targetMatch.cityB)} (${targetMatch.votesB || 0})`;
    }
  } else if (contestKey === 'mysteryDetective') {
    const md = vc.mysteryDetective || {};
    accent = '#a855f7';
    badge = '🕵️ MYSTERY CITY DETECTIVE';
    title = isFr ? 'Défi Ville Mystère REMO' : 'REMO Mystery City Detective';
    prizeText = `💎 +${Number(md.rewardCoins || 500)} 🪙 / Winner`;
    timerText = md.status === 'concluded' ? (isFr ? 'RÉVÉLÉ' : 'REVEALED') : formatContestRemainingTime(md.endsAt);
    const clue = isFr ? (md.clue_fr || md.clue_en) : (md.clue_en || md.clue_fr);
    subtitle = md.status === 'concluded'
      ? `${isFr ? 'Réponse' : 'Answer'}: ${gCityName(md.correctCityId || 'paris')} · "${clue || ''}"`
      : (clue ? `"${clue}" — ${isFr ? '1 seul essai !' : '1 attempt only!'}` : (isFr ? 'Devinez la ville secrète !' : 'Guess the secret city!'));
    if (md.imageUrl && (!md.blurImage || md.status === 'concluded')) thumbUrl = md.imageUrl;
  } else if (contestKey === 'goldenRaffle') {
    const gr = vc.goldenRaffle || {};
    const myTk = (u && Array.isArray(gr.tickets)) ? gr.tickets.find((tk) => tk && tk.uid === u.uid) : null;
    accent = '#fbbf24';
    badge = '🎟️ GOLDEN TICKET RAFFLE';
    title = isFr ? (gr.title_fr || 'Grande Tombola Ticket d’Or') : (gr.title_en || "Founder's Golden Ticket Raffle");
    prizeText = `🪙 ${Number(gr.prizeCoins || 2500)} × ${Number(gr.winnersCount || 3)}`;
    timerText = gr.status === 'concluded' ? (isFr ? 'TIRAGE EFFECTUÉ' : 'DRAWN') : formatContestRemainingTime(gr.endsAt);
    subtitle = myTk
      ? `${isFr ? 'Mon Ticket d’Or' : 'My Golden Ticket'}: #${myTk.code}`
      : (isFr ? 'Réclamez votre Ticket d’Or gratuit maintenant !' : 'Claim your free Golden Ticket before the draw!');
  } else if (contestKey === 'flashHunt') {
    const fh = vc.flashHunt || {};
    accent = '#f43f5e';
    badge = '⚡ FLASH TREASURE HUNT';
    title = isFr ? 'Chasse au Trésor Éclair REMO' : "Founder's Flash Treasure Hunt";
    prizeText = `⚡ +${Number(fh.rewardCoins || 200)} 🪙`;
    timerText = fh.endsAt ? formatContestRemainingTime(fh.endsAt) : (isFr ? 'PREMIERS ARRIVÉS' : 'FIRST CLAIMERS');
    subtitle = isFr ? (fh.riddle_fr || fh.riddle_en || 'Trouvez le coffre secret en direct !') : (fh.riddle_en || fh.riddle_fr || 'Find the secret city chest live!');
  } else if (contestKey === 'torchRelay') {
    const tr = ws.torchRelay || {};
    const vis = Array.isArray(tr.visitedCities) ? tr.visitedCities : ['montreal'];
    accent = '#f97316';
    badge = '🔥 4D WORLD TORCH RELAY™';
    title = isFr ? (tr.title_fr || 'Relais Flamme 4D') : (tr.title_en || '4D World Torch Relay™');
    prizeText = `🔥 ${Number(tr.totalKm || 0).toLocaleString()} KM · +${Number(tr.jackpotCoins || 5000)} 🪙`;
    subtitle = vis.slice(-4).map((cid) => gCityName(cid)).join(' ➔ ');
  } else if (contestKey === 'globalSync') {
    const gs = ws.globalSync || {};
    const moms = Array.isArray(gs.moments) ? gs.moments : [];
    accent = '#38bdf8';
    badge = '🌍 GLOBAL SYNC FLASH™';
    title = isFr ? (gs.prompt_fr || 'Synchronisation Planétaire') : (gs.prompt_en || 'Global Sync Flash™');
    prizeText = `⚡ +${Number(gs.rewardCoins || 100)} 🪙`;
    timerText = formatContestRemainingTime(gs.endsAt);
    subtitle = moms[0]
      ? `${gCityName(moms[0].cityId)} — "${moms[0].caption || ''}" (${moms.length} live)`
      : (isFr ? `${moms.length} villes synchronisées à cette seconde` : `${moms.length} cities synced at this exact second`);
    if (moms[0] && moms[0].mediaUrl) thumbUrl = moms[0].mediaUrl;
  } else if (contestKey === 'mayorElections') {
    const selCid = window._selectedMayorElectionCity || (u && u.homeCity) || 'montreal';
    const me = ws.mayorElections || {};
    const mUid = (REMO_STORE.state.cityMayors && REMO_STORE.state.cityMayors[selCid]) || 'u_admin_founder';
    const mUser = (REMO_STORE.state.users || []).find((x) => x && x.uid === mUid);
    const mName = (mUser && mUser.name) || 'REMO Founder';
    accent = '#fbbf24';
    badge = '🏛️ WORLD CITY MAYOR™';
    title = `${gCityName(selCid)} — ${isFr ? 'Élections du Maire' : 'Mayor Elections'}`;
    prizeText = `👑 @${mName}`;
    const cands = (me.candidates && Array.isArray(me.candidates[selCid])) ? me.candidates[selCid] : [];
    subtitle = isFr ? `${cands.length} candidat(s) en campagne · Votez maintenant !` : `${cands.length} candidate(s) running · Cast your city vote!`;
  } else if (contestKey === 'sisterAlliances') {
    const sa = ws.sisterAlliances || {};
    const tr0 = (Array.isArray(sa.treaties) && sa.treaties[0]) || null;
    accent = '#10b981';
    badge = '🤝 SISTER CITIES 2X ALLIANCE™';
    title = isFr ? 'Traités de Jumelage 2X REMO' : 'Sister Cities 2X Alliance™';
    prizeText = '2X BONUS · +40 🪙';
    subtitle = tr0 ? `${gCityName(tr0.cityA)} 🤝 ${gCityName(tr0.cityB)} (${tr0.wavesCount || 0} waves)` : subtitle;
    if (tr0 && tr0.endsAt) timerText = formatContestRemainingTime(tr0.endsAt);
  } else if (contestKey === 'pixelCanvas') {
    const pc = ws.pixelCanvas || {};
    accent = '#a855f7';
    badge = '🎨 REMO PIXEL FRESCO™';
    title = isFr ? (pc.title_fr || 'Fresque Pixel-Art REMO') : (pc.title_en || 'REMO World Pixel-Art Fresco™');
    prizeText = `🖌️ ${Number(pc.totalPixelsPlaced || 0)} PIXELS`;
    subtitle = isFr ? 'Placez votre pixel coloré sur la fresque mondiale !' : 'Claim & paint a live pixel on the global fresco!';
    pixelSnapshot = pc;
  } else if (contestKey === 'monumentVault') {
    const mv = ws.monumentVault || {};
    const caps = Array.isArray(mv.capsules) ? mv.capsules : [];
    accent = '#fbbf24';
    badge = '⏳ CITY TIME-VAULT™';
    title = isFr ? (mv.title_fr || 'Capsule Temporelle des Villes') : (mv.title_en || 'City Monument Time-Vault™');
    prizeText = `⏳ ${caps.length} CAPSULES`;
    subtitle = isFr ? (mv.unsealTargetLabel_fr || 'Scellez votre prédiction du futur !') : (mv.unsealTargetLabel_en || 'Seal your future prediction capsule!');
  } else if (contestKey === 'creatorBourse') {
    const cb = ws.creatorBourse || {};
    const st0 = (Array.isArray(cb.stocks) && cb.stocks[0]) || null;
    accent = '#38bdf8';
    badge = '📈 CREATOR SHARES & DIVIDENDS™';
    title = isFr ? 'Bourse des Créateurs REMO™' : 'REMO Creator Shares & Fan Dividends™';
    prizeText = st0 ? `@${st0.creatorName} · ${Number(st0.sharePrice || 50)} 🪙` : '📈 FAN DIVIDENDS';
    subtitle = isFr ? 'Soutenez les créateurs des villes & touchez des dividendes !' : 'Back city creators & earn automatic fan dividends!';
  }

  const shareText = `${badge}: ${title}\n${subtitle}${prizeText ? ` (${prizeText})` : ''}\n${isFr ? 'Rejoins & participe en direct sur REMO World 👉' : 'Join & vote live on REMO World 👉'}`;
  const hashtags = '#REMOWorld #REMOConcours #WorldCities #LiveContest';
  return { url, title, subtitle, prizeText, timerText, badge, accent, thumbUrl, pixelSnapshot, shareText, hashtags, isFr, u };
}

async function generateContestSharePosterDataUrl(contestKey, entryId = '') {
  const info = _getContestShareDescriptor(contestKey, entryId);
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1080;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Cosmic gradient backdrop
  const bg = ctx.createRadialGradient(840, 180, 60, 540, 540, 920);
  bg.addColorStop(0, '#1e1b4b');
  bg.addColorStop(0.55, '#0b1224');
  bg.addColorStop(1, '#040712');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 1080, 1080);

  // Outer neon frame
  ctx.strokeStyle = info.accent;
  ctx.lineWidth = 6;
  ctx.strokeRect(26, 26, 1028, 1028);
  ctx.strokeStyle = 'rgba(255,255,255,0.14)';
  ctx.lineWidth = 2;
  ctx.strokeRect(44, 44, 992, 992);

  // Header brand + badge
  ctx.fillStyle = '#fde047';
  ctx.font = '900 32px Orbitron, Inter, sans-serif';
  ctx.fillText('REMO WORLD · LIVE ARENA', 76, 108);

  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  ctx.fillRect(76, 134, 480, 52);
  ctx.strokeStyle = info.accent;
  ctx.lineWidth = 2;
  ctx.strokeRect(76, 134, 480, 52);
  ctx.fillStyle = '#ffffff';
  ctx.font = '800 22px Inter, sans-serif';
  ctx.fillText(String(info.badge).slice(0, 34), 96, 168);

  // Timer pill top-right
  ctx.fillStyle = 'rgba(56,189,248,0.18)';
  ctx.fillRect(720, 74, 284, 52);
  ctx.strokeStyle = '#38bdf8';
  ctx.strokeRect(720, 74, 284, 52);
  ctx.fillStyle = '#7dd3fc';
  ctx.font = '900 22px Inter, sans-serif';
  ctx.fillText(`⏳ ${String(info.timerText).slice(0, 18)}`, 742, 108);

  // Helper to wrap text cleanly
  const wrapText = (txt, x, startY, maxW, lineH, maxLines) => {
    const words = String(txt || '').split(/\s+/);
    let line = '';
    let y = startY;
    let linesDrawn = 0;
    for (let i = 0; i < words.length; i++) {
      const test = line ? `${line} ${words[i]}` : words[i];
      if (ctx.measureText(test).width > maxW && line) {
        ctx.fillText(line, x, y);
        linesDrawn++;
        if (linesDrawn >= maxLines) return y + lineH;
        line = words[i];
        y += lineH;
      } else {
        line = test;
      }
    }
    if (line && linesDrawn < maxLines) {
      ctx.fillText(line, x, y);
      y += lineH;
    }
    return y;
  };

  // Main Title
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 48px Orbitron, Inter, sans-serif';
  let nextY = wrapText(info.title, 76, 265, 928, 60, 3);

  // Subtitle
  ctx.fillStyle = '#cbd5e1';
  ctx.font = '600 30px Inter, sans-serif';
  nextY = wrapText(info.subtitle, 76, nextY + 24, 928, 42, 3);

  // Optional Pixel Canvas miniature OR Safe Image Preview
  if (info.pixelSnapshot) {
    const pc = info.pixelSnapshot;
    const W = Number(pc.width || 24);
    const H = Number(pc.height || 14);
    const cell = 18;
    const ox = 76;
    const oy = Math.max(nextY + 24, 480);
    ctx.fillStyle = '#050816';
    ctx.fillRect(ox - 8, oy - 8, W * cell + 16, H * cell + 16);
    for (let py = 0; py < H; py++) {
      for (let px = 0; px < W; px++) {
        const cellObj = pc.pixels && pc.pixels[`${px}_${py}`];
        ctx.fillStyle = (cellObj && cellObj.color) || '#111827';
        ctx.fillRect(ox + px * cell, oy + py * cell, cell - 2, cell - 2);
      }
    }
  } else if (info.thumbUrl) {
    try {
      const imgData = await new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        const timer = setTimeout(() => resolve(null), 1600);
        img.onload = () => { clearTimeout(timer); resolve(img); };
        img.onerror = () => { clearTimeout(timer); resolve(null); };
        img.src = info.thumbUrl;
      });
      if (imgData) {
        const boxX = 76;
        const boxY = Math.max(nextY + 18, 480);
        const boxW = 680;
        const boxH = 290;
        ctx.save();
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') ctx.roundRect(boxX, boxY, boxW, boxH, 18);
        else ctx.rect(boxX, boxY, boxW, boxH);
        ctx.clip();
        ctx.drawImage(imgData, boxX, boxY, boxW, boxH);
        ctx.restore();
      }
    } catch (e) {}
  }

  // Prize bar
  if (info.prizeText) {
    ctx.fillStyle = 'rgba(251,191,36,0.16)';
    ctx.fillRect(76, 825, 690, 88);
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 3;
    ctx.strokeRect(76, 825, 690, 88);
    ctx.fillStyle = '#fde047';
    ctx.font = '900 34px Orbitron, Inter, sans-serif';
    ctx.fillText(String(info.prizeText).slice(0, 34), 104, 881);
  }

  // Footer signature + QR code
  const authorTag = (info.u && info.u.name) ? `@${info.u.name}` : 'REMO World Citizen';
  ctx.fillStyle = '#94a3b8';
  ctx.font = '700 22px Inter, sans-serif';
  ctx.fillText(`🌐 ${authorTag} · remoworld.com/contests`, 76, 978);

  if (window.REMO_SHARE_HUB && typeof window.REMO_SHARE_HUB.drawQrOnCanvas === 'function') {
    window.REMO_SHARE_HUB.drawQrOnCanvas(ctx, info.url, 815, 815, 192, { borderColor: info.accent });
  }

  try {
    return canvas.toDataURL('image/png');
  } catch (e) {
    // Fallback clean poster without potentially cross-origin tainted pixel data
    ctx.fillStyle = '#050816';
    ctx.fillRect(76, 480, 680, 290);
    try { return canvas.toDataURL('image/png'); } catch (e2) { return ''; }
  }
}
window.generateContestSharePosterDataUrl = generateContestSharePosterDataUrl;

async function shareContestToPlatform(platform) {
  const ctx = window._activeContestShareContext || { contestKey: 'eurovision', entryId: '' };
  const info = _getContestShareDescriptor(ctx.contestKey, ctx.entryId);
  const net = String(platform || 'copy').toLowerCase();

  if (window.REMO_SHARE_HUB && typeof window.REMO_SHARE_HUB.shareToNetwork === 'function') {
    await window.REMO_SHARE_HUB.shareToNetwork(net, {
      url: info.url,
      title: info.title,
      shareText: info.shareText,
      hashtags: info.hashtags,
      context: 'duel',
      isFr: info.isFr,
      fileName: `REMO_${ctx.contestKey}`,
      getDataUrlFn: () => window._activeContestSharePosterUrl
        ? Promise.resolve(window._activeContestSharePosterUrl)
        : generateContestSharePosterDataUrl(ctx.contestKey, ctx.entryId)
    });
    return;
  }

  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(`${info.shareText}\n${info.url}`);
    }
    remoToast(t('contest_share_copy_ok'), 'coin');
  } catch (e) {}
}
window.shareContestToPlatform = shareContestToPlatform;

async function downloadContestSharePoster() {
  const ctx = window._activeContestShareContext || { contestKey: 'eurovision', entryId: '' };
  const dataUrl = window._activeContestSharePosterUrl || await generateContestSharePosterDataUrl(ctx.contestKey, ctx.entryId);
  if (!dataUrl) return;
  if (window.REMO_SHARE_HUB && typeof window.REMO_SHARE_HUB.downloadDataUrl === 'function') {
    window.REMO_SHARE_HUB.downloadDataUrl(dataUrl, `REMO_${ctx.contestKey}_Poster.png`);
  } else {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `REMO_${ctx.contestKey}_Poster.png`;
    a.click();
  }
  remoToast('📥 Poster PNG downloaded!', 'coin');
}
window.downloadContestSharePoster = downloadContestSharePoster;

async function openContestShareSheet(contestKey, entryId = '') {
  window._activeContestShareContext = { contestKey: String(contestKey || 'eurovision'), entryId: String(entryId || '') };
  window._activeContestSharePosterUrl = '';
  const info = _getContestShareDescriptor(contestKey, entryId);

  const old = document.getElementById('remoContestShareModal');
  if (old) old.remove();

  const wrap = document.createElement('div');
  wrap.id = 'remoContestShareModal';
  wrap.className = 'contest-share-modal-backdrop';
  wrap.onclick = (ev) => { if (ev.target === wrap) wrap.remove(); };
  wrap.innerHTML = `
    <div class="contest-share-sheet">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:6px;">
        <h3 style="font-family:'Orbitron',sans-serif;font-size:0.96rem;color:#fde047;margin:0;">${escapeHtmlStr(t('contest_share_title'))}</h3>
        <button type="button" class="ftv-vibe-close" onclick="document.getElementById('remoContestShareModal')?.remove()">✕</button>
      </div>
      <p style="font-size:0.75rem;color:#cbd5e1;margin:0 0 8px;">${escapeHtmlStr(t('contest_share_sub'))}</p>
      <img id="remoContestSharePosterImg" class="contest-share-poster-preview" alt="REMO Contest Share Poster" style="display:none;">
      <input type="text" readonly value="${escapeHtmlStr(info.url)}" class="remo-input" style="font-size:0.72rem;margin-bottom:10px;width:100%;" onclick="this.select()">
      <div class="contest-share-grid">
        <button type="button" class="contest-share-plat-btn" onclick="shareContestToPlatform('whatsapp')">💬 WhatsApp</button>
        <button type="button" class="contest-share-plat-btn" onclick="shareContestToPlatform('facebook')">📘 Facebook</button>
        <button type="button" class="contest-share-plat-btn" onclick="shareContestToPlatform('x')">𝕏 Twitter</button>
        <button type="button" class="contest-share-plat-btn" onclick="shareContestToPlatform('telegram')">✈️ Telegram</button>
        <button type="button" class="contest-share-plat-btn" onclick="shareContestToPlatform('tiktok')">🎵 TikTok</button>
        <button type="button" class="contest-share-plat-btn" onclick="shareContestToPlatform('instagram')">📸 Instagram</button>
        <button type="button" class="contest-share-plat-btn" onclick="shareContestToPlatform('native')">📲 Native</button>
        <button type="button" class="contest-share-plat-btn" onclick="shareContestToPlatform('copy')">🔗 Copy</button>
        <button type="button" class="contest-share-plat-btn" onclick="downloadContestSharePoster()">${escapeHtmlStr(t('contest_share_download_poster'))}</button>
      </div>
    </div>
  `;
  document.body.appendChild(wrap);

  const posterUrl = await generateContestSharePosterDataUrl(contestKey, entryId);
  window._activeContestSharePosterUrl = posterUrl;
  const imgEl = document.getElementById('remoContestSharePosterImg');
  if (imgEl && posterUrl) {
    imgEl.src = posterUrl;
    imgEl.style.display = 'block';
  }
}
window.openContestShareSheet = openContestShareSheet;

function citizenVoteOrNominateMayor(cityId, candidateUid = '') {
  const isFr = REMO_I18N.getLang() === 'fr';
  const u = REMO_STORE.getCurrentUser();
  if (!u || u.role === 'guest') { openAuthModal(); return; }
  const manifesto = (document.getElementById('wsMayorManifestoInp')?.value || '').trim();
  const res = REMO_STORE.nominateOrVoteCityMayor(cityId, candidateUid, manifesto);
  if (!res.ok) {
    remoToast(isFr ? '⚠️ Vous avez déjà voté dans cette ville !' : '⚠️ You already voted in this city!');
    return;
  }
  spawnRemoCoinsFX(8);
  remoToast(
    isFr
      ? `👑 Vote Maire enregistré pour @${res.candidate.name} (+${res.reward} 🪙) !`
      : `👑 Mayor vote recorded for @${res.candidate.name} (+${res.reward} 🪙)!`,
    'fanfare'
  );
  syncHeaderAndSidebars();
  renderViralContestsView();
}
window.citizenVoteOrNominateMayor = citizenVoteOrNominateMayor;

function citizenSubmitMayorDecree(cityId) {
  const isFr = REMO_I18N.getLang() === 'fr';
  const text = (document.getElementById('wsMayorDecreeInp')?.value || '').trim();
  if (!text) {
    remoToast(isFr ? '⚠️ Écrivez le message officiel du Maire !' : '⚠️ Please write the official Mayor welcome message!');
    return;
  }
  const res = REMO_STORE.submitMayorCityDecree(cityId, text);
  if (!res.ok) {
    remoToast(isFr ? '⚠️ Réservé au Maire de la ville ou à l’Admin !' : '⚠️ Reserved for the City Mayor or Admin!');
    return;
  }
  remoToast(
    res.approved
      ? (isFr ? '🔑 Décret officiel du Maire publié !' : '🔑 Official Mayor Decree published!')
      : (isFr ? '🔑 Décret soumis à l’approbation de l’Admin !' : '🔑 Decree submitted for Admin approval!'),
    'fanfare'
  );
  renderViralContestsView();
}
window.citizenSubmitMayorDecree = citizenSubmitMayorDecree;

function citizenSendAllianceWave(treatyId) {
  const isFr = REMO_I18N.getLang() === 'fr';
  const u = REMO_STORE.getCurrentUser();
  if (!u || u.role === 'guest') { openAuthModal(); return; }
  const res = REMO_STORE.sendSisterAllianceWave(treatyId);
  if (!res.ok) {
    remoToast(isFr ? '⚠️ Salut diplomatique déjà envoyé pour ce traité !' : '⚠️ Diplomatic wave already sent for this treaty!');
    return;
  }
  spawnRemoCoinsFX(10);
  remoToast(
    isFr
      ? `🤝 Salut d’Alliance 2X envoyé ! +${res.reward} 🪙 & +50 PTS aux 2 villes !`
      : `🤝 2X Alliance Wave sent! +${res.reward} 🪙 & +50 PTS to both sister cities!`,
    'fanfare'
  );
  syncHeaderAndSidebars();
  renderViralContestsView();
}
window.citizenSendAllianceWave = citizenSendAllianceWave;

function citizenSelectPixelColor(col) {
  window._selectedWorldPixelColor = col;
  renderViralContestsView();
}
window.citizenSelectPixelColor = citizenSelectPixelColor;

function citizenClickPixelCanvas(x, y) {
  const isFr = REMO_I18N.getLang() === 'fr';
  const u = REMO_STORE.getCurrentUser();
  if (!u || u.role === 'guest') { openAuthModal(); return; }
  const col = window._selectedWorldPixelColor || '#fbbf24';
  const res = REMO_STORE.placeWorldPixel(x, y, col);
  if (!res.ok) return;
  RemoAudio.play('coin');
  remoToast(
    isFr
      ? `🎨 Pixel (${x},${y}) peint ! +${res.reward} 🪙`
      : `🎨 Pixel (${x},${y}) painted! +${res.reward} 🪙`
  );
  syncHeaderAndSidebars();
  renderViralContestsView();
}
window.citizenClickPixelCanvas = citizenClickPixelCanvas;

function citizenDepositMonumentCapsule() {
  const isFr = REMO_I18N.getLang() === 'fr';
  const u = REMO_STORE.getCurrentUser();
  if (!u || u.role === 'guest') { openAuthModal(); return; }
  const cityId = document.getElementById('wsVaultCitySel')?.value || u.homeCity || 'montreal';
  const message = (document.getElementById('wsVaultMsgInp')?.value || '').trim();
  if (!message) {
    remoToast(isFr ? '⚠️ Écrivez votre vœu ou prédiction !' : '⚠️ Please write your wish or prediction!');
    return;
  }
  const res = REMO_STORE.depositMonumentCapsule({ cityId, message });
  if (!res.ok) {
    remoToast(isFr ? '⚠️ Vous avez déjà scellé une capsule dans le Monument !' : '⚠️ You already sealed a capsule in the Monument!');
    return;
  }
  spawnRemoCoinsFX(8);
  remoToast(
    isFr
      ? `⏳ Capsule scellée dans le Monument (+${res.reward} 🪙) !`
      : `⏳ Capsule sealed inside the Monument (+${res.reward} 🪙)!`,
    'fanfare'
  );
  syncHeaderAndSidebars();
  renderViralContestsView();
}
window.citizenDepositMonumentCapsule = citizenDepositMonumentCapsule;

function citizenBuyCreatorShare(creatorUid) {
  const isFr = REMO_I18N.getLang() === 'fr';
  const u = REMO_STORE.getCurrentUser();
  if (!u || u.role === 'guest') { openAuthModal(); return; }
  const res = REMO_STORE.buyCreatorShare(creatorUid);
  if (!res.ok) {
    remoToast(
      res.error === 'insufficient_coins'
        ? (isFr ? `⚠️ Il vous faut ${res.price} 🪙 pour acheter cette part !` : `⚠️ You need ${res.price} 🪙 to buy this share!`)
        : (isFr ? '⚠️ Achat indisponible.' : '⚠️ Purchase unavailable.')
    );
    return;
  }
  RemoAudio.play('coin');
  remoToast(
    isFr
      ? `📈 +1 Part achetée (${res.pricePaid} 🪙) ! Vous recevrez des dividendes automatiques !`
      : `📈 +1 Share bought (${res.pricePaid} 🪙)! You now earn automatic Fan Dividends!`
  );
  syncHeaderAndSidebars();
  renderViralContestsView();
}
window.citizenBuyCreatorShare = citizenBuyCreatorShare;

function citizenSellCreatorShare(creatorUid) {
  const isFr = REMO_I18N.getLang() === 'fr';
  const res = REMO_STORE.sellCreatorShare(creatorUid);
  if (!res.ok) return;
  RemoAudio.play('coin');
  remoToast(
    isFr
      ? `💰 1 Part vendue pour +${res.sellValue} 🪙 !`
      : `💰 1 Share sold for +${res.sellValue} 🪙!`
  );
  syncHeaderAndSidebars();
  renderViralContestsView();
}
window.citizenSellCreatorShare = citizenSellCreatorShare;

/* ── 📩 OFFICIAL IN-APP CONTACT & SUPPORT DESK (Zero External Email Needed) ── */
function openContactSupportModal(defaultCategory = 'support') {
  const modal = document.getElementById('remoContactSupportModal');
  if (!modal) return;
  const u = REMO_STORE.getCurrentUser();
  const senderInp = document.getElementById('contactSupportSenderInp');
  const catSel = document.getElementById('contactSupportCategorySel');
  const msgInp = document.getElementById('contactSupportMsgInp');
  if (catSel && defaultCategory) catSel.value = defaultCategory;
  if (senderInp && !senderInp.value) {
    if (u && u.name && u.role !== 'guest') {
      senderInp.value = `@${u.name}${u.passportNum ? ' (#' + u.passportNum + ')' : ''}`;
    }
  }
  if (msgInp) msgInp.value = '';
  REMO_I18N.applyDOM(modal);
  modal.classList.add('open');
}

function submitContactSupportTicket(e) {
  if (e && typeof e.preventDefault === 'function') e.preventDefault();
  const lang = REMO_I18N.getLang();
  const category = document.getElementById('contactSupportCategorySel')?.value || 'support';
  const senderName = document.getElementById('contactSupportSenderInp')?.value.trim() || 'Citizen';
  const message = document.getElementById('contactSupportMsgInp')?.value.trim() || '';

  if (!message) {
    remoToast(lang === 'fr' ? '⚠️ Veuillez écrire votre message.' : '⚠️ Please write your message.');
    return;
  }

  const res = REMO_STORE.submitSupportTicket({ category, senderName, message });
  if (!res || !res.ok) {
    remoToast(
      res && res.error === 'cooldown'
        ? (lang === 'fr' ? '⏳ Patientez quelques secondes avant un nouveau message.' : '⏳ Please wait a few seconds before sending another message.')
        : (lang === 'fr' ? '⚠️ Impossible d’envoyer le message.' : '⚠️ Could not send message.')
    );
    return;
  }

  document.getElementById('remoContactSupportModal')?.classList.remove('open');
  if (typeof RemoAudio !== 'undefined' && RemoAudio.play) RemoAudio.play('fanfare');
  remoToast(t('contact_sent_toast'), 'fanfare');
  syncHeaderAndSidebars();
  if (typeof updateUnreadBadges === 'function') updateUnreadBadges();
  if (typeof renderInlineAdminSupportInbox === 'function') renderInlineAdminSupportInbox();
}

function renderInlineAdminSupportInbox() {
  const listEl = document.getElementById('admQuickSupportList');
  const badgeEl = document.getElementById('admQuickSupportCountBadge');
  if (!listEl) return;
  const lang = REMO_I18N.getLang();
  const tickets = (REMO_STORE.state.supportTickets || []).slice().sort((a, b) => Number(b.ts || 0) - Number(a.ts || 0));
  const openCount = tickets.filter((t) => t && t.status !== 'replied').length;

  if (badgeEl) {
    badgeEl.style.display = openCount > 0 ? 'inline-block' : 'none';
    badgeEl.textContent = String(openCount);
  }

  if (tickets.length === 0) {
    listEl.innerHTML = `<div style="color:var(--muted);text-align:center;padding:10px;">${lang === 'fr' ? 'Aucun message de support pour le moment ✨' : 'No support messages yet ✨'}</div>`;
    return;
  }

  listEl.innerHTML = tickets.map((tk) => {
    const c = getCityById(tk.cityId || 'montreal') || { flag: '🌐' };
    const timeStr = tk.ts ? new Date(tk.ts).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
    const isReplied = tk.status === 'replied';
    return `
      <div style="background:rgba(15,23,42,0.75);border:1px solid ${isReplied ? 'rgba(16,185,129,0.35)' : 'rgba(56,189,248,0.45)'};border-radius:12px;padding:9px 11px;">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:4px;">
          <span style="font-weight:900;color:#7dd3fc;">${c.flag} ${escapeHtmlStr(tk.senderName || 'Citizen')} <span style="color:#fbbf24;font-size:0.72rem;">· ${escapeHtmlStr(tk.categoryLabel || tk.category || 'Support')}</span></span>
          <span style="font-size:0.68rem;color:var(--muted);">${timeStr}</span>
        </div>
        <div style="color:#f8fafc;line-height:1.4;margin-bottom:6px;white-space:pre-wrap;">${escapeHtmlStr(tk.message || '')}</div>
        ${tk.replyText ? `<div style="background:rgba(16,185,129,0.12);border-left:3px solid #10b981;padding:5px 8px;border-radius:6px;color:#a7f3d0;font-size:0.74rem;margin-bottom:6px;">🛡️ <b>REMO Reply:</b> ${escapeHtmlStr(tk.replyText)}</div>` : ''}
        <div style="display:flex;gap:6px;justify-content:flex-end;">
          <button type="button" class="btn-cyber" style="padding:4px 10px;font-size:0.72rem;" onclick="replySupportTicketInline('${escapeJsSingleArg(tk.id)}')">💬 ${isReplied ? (lang === 'fr' ? 'Répondre encore' : 'Reply Again') : (lang === 'fr' ? 'Répondre dans REMO' : 'Reply in REMO')}</button>
          <button type="button" class="btn-ghost" style="padding:4px 8px;font-size:0.72rem;border-color:#f43f5e;color:#fda4af;" onclick="deleteSupportTicketInline('${escapeJsSingleArg(tk.id)}')">🗑️</button>
        </div>
      </div>
    `;
  }).join('');
}

function replySupportTicketInline(ticketId) {
  if (!REMO_STORE.isCurrentUserAdmin()) return;
  const lang = REMO_I18N.getLang();
  const tk = (REMO_STORE.state.supportTickets || []).find((x) => x && x.id === ticketId);
  if (!tk) return;
  const reply = window.prompt(
    lang === 'fr'
      ? `🛡️ Répondre officiellement à ${tk.senderName} dans REMO (Notifications 🔔 & Messagerie 💌) :`
      : `🛡️ Send official REMO Support reply to ${tk.senderName} (delivered to their Notifications 🔔 & Messenger 💌):`,
    tk.replyText || ''
  );
  if (!reply || !reply.trim()) return;
  REMO_STORE.replySupportTicket(ticketId, reply.trim());
  remoToast(
    lang === 'fr'
      ? `✅ Réponse officielle envoyée à ${tk.senderName} dans REMO !`
      : `✅ Official reply delivered to ${tk.senderName} in REMO!`
  );
  renderInlineAdminSupportInbox();
  syncHeaderAndSidebars();
}

function deleteSupportTicketInline(ticketId) {
  if (!REMO_STORE.isCurrentUserAdmin()) return;
  REMO_STORE.deleteSupportTicket(ticketId);
  renderInlineAdminSupportInbox();
  syncHeaderAndSidebars();
}

window.openContactSupportModal = openContactSupportModal;
window.submitContactSupportTicket = submitContactSupportTicket;
window.renderInlineAdminSupportInbox = renderInlineAdminSupportInbox;
window.replySupportTicketInline = replySupportTicketInline;
window.deleteSupportTicketInline = deleteSupportTicketInline;

/* ── 🏅 OFFICIAL CITY AMBASSADOR 9:16 HOLOGRAPHIC DIPLOMA STUDIO ── */
function computeCitizenOfficialDiplomaRank(u, city, lang) {
  const isFr = lang === 'fr';
  const cityName = getCityName(city, lang).toUpperCase();
  if (REMO_STORE.isFounder && REMO_STORE.isFounder(u)) {
    return {
      icon: '👑',
      badgeText: isFr ? `FONDATEUR SOUVERAIN • ${cityName}` : `SOVEREIGN FOUNDER • ${cityName}`,
      uiLabel: isFr ? '👑 Fondateur Souverain & Grand Maire' : '👑 Sovereign Founder & Grand Mayor'
    };
  }
  if (REMO_STORE.isCityMayor && u && REMO_STORE.isCityMayor(u.uid, city.id)) {
    return {
      icon: '👑',
      badgeText: isFr ? `MAIRE OFFICIEL DE ${cityName}` : `OFFICIAL MAYOR OF ${cityName}`,
      uiLabel: isFr ? `👑 Maire Officiel de ${getCityName(city, lang)}` : `👑 Official Mayor of ${getCityName(city, lang)}`
    };
  }
  if (REMO_STORE.getEquippedTitle && u) {
    const eq = REMO_STORE.getEquippedTitle(u);
    if (eq && (eq.title_en || eq.title_fr)) {
      const tStr = (isFr ? (eq.title_fr || eq.title_en) : (eq.title_en || eq.title_fr)).toUpperCase();
      return {
        icon: '💎',
        badgeText: `${tStr} • ${cityName}`,
        uiLabel: `💎 ${isFr ? (eq.title_fr || eq.title_en) : (eq.title_en || eq.title_fr)}`
      };
    }
  }
  const passInt = parseInt(String((u && u.passportNum) || '9999').replace(/\D/g, ''), 10) || 9999;
  if (passInt <= 500) {
    return {
      icon: '🌟',
      badgeText: isFr ? `AMBASSADEUR PIONNIER GENESIS • ${cityName}` : `GENESIS PIONEER AMBASSADOR • ${cityName}`,
      uiLabel: isFr ? '🌟 Ambassadeur Pionnier Genesis' : '🌟 Genesis Pioneer Ambassador'
    };
  }
  if (((u && u.coins) || 0) >= 250 || ((u && u.xp) || 0) >= 80) {
    return {
      icon: '🏅',
      badgeText: isFr ? `AMBASSADEUR OFFICIEL DE ${cityName}` : `OFFICIAL AMBASSADOR OF ${cityName}`,
      uiLabel: isFr ? '🏅 Ambassadeur Officiel de la Ville' : '🏅 Official City Ambassador'
    };
  }
  return {
    icon: '🛂',
    badgeText: isFr ? `CITOYEN AMBASSADEUR 4D • ${cityName}` : `4D CITIZEN AMBASSADOR • ${cityName}`,
    uiLabel: isFr ? '🛂 Citoyen Ambassadeur 4D Vérifié' : '🛂 Verified 4D Citizen Ambassador'
  };
}

function getAmbassadorDiplomaPhotoDataUrl(u) {
  const key = 'remo_diploma_photo_' + ((u && u.uid) || 'guest');
  const saved = localStorage.getItem(key);
  if (saved && saved.startsWith('data:image/')) return saved;
  if (u && u.avatar && String(u.avatar).startsWith('data:image/')) return u.avatar;
  return '';
}

function handleAmbassadorDiplomaPhotoUpload(event) {
  const file = event && event.target && event.target.files && event.target.files[0];
  if (!file) return;
  const lang = REMO_I18N.getLang();
  const isFr = lang === 'fr';
  const u = REMO_STORE.getCurrentUser() || REMO_STORE.ensureGuestOrCitizen('REMO Pioneer', '', 'montreal');
  const reader = new FileReader();
  reader.onload = (ev) => {
    const im = new Image();
    im.onload = () => {
      const sq = document.createElement('canvas');
      const S = 320;
      sq.width = S;
      sq.height = S;
      const sCtx = sq.getContext('2d');
      const minSide = Math.min(im.naturalWidth || im.width, im.naturalHeight || im.height);
      const sx = Math.max(0, ((im.naturalWidth || im.width) - minSide) / 2);
      const sy = Math.max(0, ((im.naturalHeight || im.height) - minSide) / 2);
      sCtx.drawImage(im, sx, sy, minSide, minSide, 0, 0, S, S);
      const compressed = sq.toDataURL('image/jpeg', 0.88);
      try {
        localStorage.setItem('remo_diploma_photo_' + (u.uid || 'guest'), compressed);
      } catch (err) {}
      const resetBtn = document.getElementById('ambResetPhotoBtn');
      if (resetBtn) resetBtn.style.display = 'inline-flex';
      renderCityAmbassadorDiplomaCanvas();
      remoToast(
        isFr ? '📸 Votre photo officielle a été gravée sur le Diplôme !' : '📸 Your official photo has been engraved on the Diploma!',
        'fanfare'
      );
    };
    im.src = ev.target.result;
  };
  reader.readAsDataURL(file);
}

function resetAmbassadorDiplomaPhoto() {
  const lang = REMO_I18N.getLang();
  const isFr = lang === 'fr';
  const u = REMO_STORE.getCurrentUser() || REMO_STORE.ensureGuestOrCitizen('REMO Pioneer', '', 'montreal');
  localStorage.removeItem('remo_diploma_photo_' + (u.uid || 'guest'));
  const inp = document.getElementById('ambDiplomaPhotoInput');
  if (inp) inp.value = '';
  const resetBtn = document.getElementById('ambResetPhotoBtn');
  if (resetBtn) resetBtn.style.display = 'none';
  renderCityAmbassadorDiplomaCanvas();
  remoToast(isFr ? '🗑️ Photo retirée du Diplôme.' : '🗑️ Photo removed from Diploma.');
}

function openCityAmbassadorModal() {
  const modal = document.getElementById('cityAmbassadorModal');
  if (!modal) return;
  const lang = REMO_I18N.getLang();
  const u = REMO_STORE.getCurrentUser() || REMO_STORE.ensureGuestOrCitizen('REMO Pioneer', '', 'montreal');
  const city = getCityById(u.homeCity || 'montreal') || getCityById('montreal');
  const rankObj = computeCitizenOfficialDiplomaRank(u, city, lang);

  const cityLbl = document.getElementById('ambDiplomaLockedCityLbl');
  if (cityLbl) {
    cityLbl.textContent = `🔒 ${city.flag} ${getCityName(city, lang)}`;
  }
  const rankLbl = document.getElementById('ambDiplomaLockedRankLbl');
  if (rankLbl) {
    rankLbl.textContent = rankObj.uiLabel;
  }
  const resetBtn = document.getElementById('ambResetPhotoBtn');
  if (resetBtn) {
    resetBtn.style.display = localStorage.getItem('remo_diploma_photo_' + (u.uid || 'guest')) ? 'inline-flex' : 'none';
  }

  REMO_I18N.applyDOM(modal);
  modal.classList.add('open');
  renderCityAmbassadorDiplomaCanvas();
}

function renderCityAmbassadorDiplomaCanvas() {
  const cv = document.getElementById('cityAmbassadorCanvas');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const W = 540;
  const H = 960;
  const roundRectCanvas = (c, x, y, w, h, r) => {
    const rad = Math.min(r, w / 2, h / 2);
    c.beginPath();
    if (typeof c.roundRect === 'function') {
      c.roundRect(x, y, w, h, rad);
    } else {
      c.moveTo(x + rad, y);
      c.arcTo(x + w, y, x + w, y + h, rad);
      c.arcTo(x + w, y + h, x, y + h, rad);
      c.arcTo(x, y + h, x, y, rad);
      c.arcTo(x, y, x + w, y, rad);
      c.closePath();
    }
  };
  const lang = REMO_I18N.getLang();
  const isFr = lang === 'fr';
  const u = REMO_STORE.getCurrentUser() || REMO_STORE.ensureGuestOrCitizen('REMO Pioneer', '', 'montreal');
  // Strictly locked to the citizen's Home City & Real Earned Rank
  const city = getCityById(u.homeCity || 'montreal') || getCityById('montreal');
  const cityName = getCityName(city, lang).toUpperCase();
  const rankObj = computeCitizenOfficialDiplomaRank(u, city, lang);
  const cityPts = Number((REMO_STORE.state.cityScores && REMO_STORE.state.cityScores[city.id]) || 10000);
  const passportNum = u.passportNum || '0001';
  const inviteCode = u.referralCode || `REMO-${passportNum}`;
  const citizenName = (u.name || 'REMO Citizen').toUpperCase();
  const regSerial = `REG № ${city.id.slice(0, 3).toUpperCase()}-${passportNum}-2026`;
  const photoDataUrl = getAmbassadorDiplomaPhotoDataUrl(u);

  const drawDiplomaWithPortrait = (portraitImg) => {
    cv.width = W;
    cv.height = H;

    // 1. Deep Royal Obsidian & Radial Nebula Background
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#040714');
    bg.addColorStop(0.5, '#0b1332');
    bg.addColorStop(1, '#050818');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    const glowTop = ctx.createRadialGradient(W / 2, 210, 20, W / 2, 210, 280);
    glowTop.addColorStop(0, 'rgba(251, 191, 36, 0.26)');
    glowTop.addColorStop(0.6, 'rgba(56, 189, 248, 0.08)');
    glowTop.addColorStop(1, 'transparent');
    ctx.fillStyle = glowTop;
    ctx.fillRect(0, 0, W, H);

    // 2. Double Royal Gold Filigree Certificate Frame
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.85)';
    ctx.lineWidth = 3;
    roundRectCanvas(ctx, 20, 20, W - 40, H - 40, 26);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
    ctx.lineWidth = 1.5;
    roundRectCanvas(ctx, 30, 30, W - 60, H - 60, 20);
    ctx.stroke();

    // 3. Top Header Crest & Official Serial Number
    ctx.textAlign = 'center';
    ctx.fillStyle = '#38bdf8';
    ctx.font = '900 18px system-ui, -apple-system, sans-serif';
    ctx.fillText('🌐 REMOWORLD.COM', W / 2, 64);

    ctx.fillStyle = '#fbbf24';
    ctx.font = '800 13px system-ui, -apple-system, sans-serif';
    ctx.fillText(isFr ? '★ DIPLÔME SOUVERAIN OFFICIEL 4D ★' : '★ OFFICIAL 4D SOVEREIGN CITY DIPLOMA ★', W / 2, 87);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '800 11px monospace';
    ctx.fillText(regSerial, W / 2, 106);

    // 4. Giant Illuminated City Medallion (or Citizen Portrait + City Seal)
    const medX = W / 2;
    const medY = 205;
    const medR = 76;

    ctx.save();
    ctx.beginPath();
    ctx.arc(medX, medY, medR, 0, Math.PI * 2);
    const medalGrad = ctx.createLinearGradient(medX - 70, medY - 75, medX + 70, medY + 75);
    medalGrad.addColorStop(0, 'rgba(251, 191, 36, 0.28)');
    medalGrad.addColorStop(1, 'rgba(15, 23, 42, 0.94)');
    ctx.fillStyle = medalGrad;
    ctx.fill();
    if (portraitImg) {
      ctx.clip();
      ctx.drawImage(portraitImg, medX - medR, medY - medR, medR * 2, medR * 2);
    }
    ctx.restore();

    // Outer Gold Ring around Medallion
    ctx.save();
    ctx.beginPath();
    ctx.arc(medX, medY, medR, 0, Math.PI * 2);
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#fbbf24';
    ctx.stroke();
    ctx.restore();

    if (portraitImg) {
      // Corner City Flag Emblem Badge on the bottom-right of the portrait
      const badgeX = medX + 54;
      const badgeY = medY + 52;
      ctx.save();
      ctx.beginPath();
      ctx.arc(badgeX, badgeY, 26, 0, Math.PI * 2);
      ctx.fillStyle = '#090d16';
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#fbbf24';
      ctx.stroke();
      ctx.restore();
      ctx.font = '26px system-ui, "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
      ctx.fillText(city.flag || '🌍', badgeX, badgeY + 9);
    } else {
      ctx.font = '68px system-ui, "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
      ctx.fillText(city.flag || '🌍', medX, medY + 22);
    }

    // City Name Banner
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 32px system-ui, -apple-system, sans-serif';
    ctx.fillText(cityName, W / 2, 326);

    ctx.fillStyle = '#7dd3fc';
    ctx.font = '800 14px system-ui, -apple-system, sans-serif';
    ctx.fillText(`🏆 ${cityPts.toLocaleString()} PTS • WORLD CITY CUP`, W / 2, 352);

    // Ornamental Divider Line
    const divGrad = ctx.createLinearGradient(70, 0, W - 70, 0);
    divGrad.addColorStop(0, 'transparent');
    divGrad.addColorStop(0.5, '#fbbf24');
    divGrad.addColorStop(1, 'transparent');
    ctx.strokeStyle = divGrad;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(70, 378);
    ctx.lineTo(W - 70, 378);
    ctx.stroke();

    // 5. Certificate Proclamation Text
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '700 13px system-ui, -apple-system, sans-serif';
    ctx.fillText(
      isFr ? 'CE DIPLÔME SOUVERAIN CERTIFIE OFFICIELLEMENT QUE' : 'THIS SOVEREIGN DIPLOMA OFFICIALLY CERTIFIES THAT',
      W / 2,
      414
    );

    // Citizen Name Highlight Box
    ctx.fillStyle = 'rgba(251, 191, 36, 0.12)';
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.55)';
    ctx.lineWidth = 2;
    roundRectCanvas(ctx, 52, 430, W - 104, 70, 16);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fde047';
    ctx.font = '900 28px system-ui, -apple-system, sans-serif';
    ctx.fillText(`@${citizenName.slice(0, 22)}`, W / 2, 475);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '700 13px system-ui, -apple-system, sans-serif';
    ctx.fillText(
      isFr ? 'DÉTIENT LE TITRE & RANG OFFICIEL VÉRIFIÉ DE :' : 'HOLDS THE VERIFIED OFFICIAL RANK & TITLE OF:',
      W / 2,
      530
    );

    // Rank Pill (Locked to Citizen's Real Earned Rank)
    const rankGrad = ctx.createLinearGradient(44, 546, W - 44, 602);
    rankGrad.addColorStop(0, 'rgba(14, 165, 233, 0.25)');
    rankGrad.addColorStop(0.5, 'rgba(99, 102, 241, 0.38)');
    rankGrad.addColorStop(1, 'rgba(251, 191, 36, 0.25)');
    ctx.fillStyle = rankGrad;
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    roundRectCanvas(ctx, 44, 546, W - 88, 54, 999);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 15px system-ui, -apple-system, sans-serif';
    ctx.fillText(`${rankObj.icon} ${rankObj.badgeText.slice(0, 40)}`, W / 2, 579);

    // 6. Official Passport Stats Grid (3 Columns)
    const statY = 622;
    const statW = 136;
    const cols = [
      { x: 46, lbl: isFr ? 'PASSEPORT 4D' : '4D PASSPORT', val: `#${passportNum}` },
      { x: 202, lbl: isFr ? 'PIÈCES REMO' : 'REMO COINS', val: `🪙 ${(u.coins || 150).toLocaleString()}` },
      { x: 358, lbl: isFr ? 'VILLE NATALE' : 'HOME CITY', val: `${city.flag} ${getCityName(city, lang).slice(0, 10)}` }
    ];
    cols.forEach((st) => {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1.2;
      roundRectCanvas(ctx, st.x, statY, statW, 64, 14);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.font = '800 10px system-ui, -apple-system, sans-serif';
      ctx.fillText(st.lbl, st.x + statW / 2, statY + 23);

      ctx.fillStyle = '#fbbf24';
      ctx.font = '900 15px system-ui, -apple-system, sans-serif';
      ctx.fillText(st.val, st.x + statW / 2, statY + 47);
    });

    // 7. Golden Wax Seal & Official Sovereign Signature
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'italic 600 12px Georgia, serif';
    ctx.fillText(isFr ? 'Certifié par le Conseil Souverain' : 'Certified by the Sovereign Council', 142, 736);
    ctx.fillStyle = '#fde68a';
    ctx.font = 'italic 700 15px Georgia, serif';
    ctx.fillText('✒️ REMO World Council', 142, 756);

    ctx.save();
    ctx.beginPath();
    ctx.arc(W / 2, 742, 30, 0, Math.PI * 2);
    ctx.fillStyle = '#f59e0b';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#fef08a';
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = '#090d16';
    ctx.font = '900 13px system-ui, -apple-system, sans-serif';
    ctx.fillText('REMO', W / 2, 740);
    ctx.font = '900 10px system-ui, -apple-system, sans-serif';
    ctx.fillText('SEAL', W / 2, 753);

    ctx.fillStyle = '#38bdf8';
    ctx.font = '800 11px monospace';
    ctx.fillText('✓ 4D AUTHENTIC', 402, 742);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '700 10px monospace';
    ctx.fillText(new Date().toISOString().slice(0, 10), 402, 757);

    // 8. Bottom Viral Invite CTA Box + Cyber QR Matrix
    ctx.fillStyle = 'rgba(14, 165, 233, 0.14)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    roundRectCanvas(ctx, 44, 792, W - 88, 114, 20);
    ctx.fill();
    ctx.stroke();

    const ctaCenterX = 232;
    ctx.fillStyle = '#e0f2fe';
    ctx.font = '800 13px system-ui, -apple-system, sans-serif';
    ctx.fillText(
      isFr ? `🌍 REJOIGNEZ ${cityName} EN DIRECT SUR :` : `🌍 REPRESENT ${cityName} LIVE AT:`,
      ctaCenterX,
      822
    );

    ctx.fillStyle = '#fbbf24';
    ctx.font = '900 26px system-ui, -apple-system, sans-serif';
    ctx.fillText('REMOWORLD.COM', ctaCenterX, 856);

    ctx.fillStyle = '#7dd3fc';
    ctx.font = '800 12px system-ui, -apple-system, sans-serif';
    ctx.fillText(
      isFr
        ? `🎁 Code : ${inviteCode} (+100 🪙 Bonus Gratuit)`
        : `🎁 Code: ${inviteCode} (+100 🪙 Free Welcome Bonus)`,
      ctaCenterX,
      884
    );

    // Cyber QR Code Matrix on the right side of the CTA Box
    const qrX = 408;
    const qrY = 807;
    const qrS = 78;
    ctx.fillStyle = '#040714';
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 1.5;
    roundRectCanvas(ctx, qrX, qrY, qrS, qrS, 10);
    ctx.fill();
    ctx.stroke();

    const cell = 8;
    const startX = qrX + 7;
    const startY = qrY + 7;
    const seedStr = `${city.id}-${passportNum}-${citizenName}`;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const isCorner = (r < 2 && c < 2) || (r < 2 && c > 5) || (r > 5 && c < 2);
        const charCode = seedStr.charCodeAt((r * 8 + c) % seedStr.length) || 7;
        const on = isCorner || ((charCode + r * 3 + c * 5) % 2 === 0);
        if (on) {
          ctx.fillStyle = isCorner ? '#fbbf24' : '#38bdf8';
          ctx.fillRect(startX + c * cell, startY + r * cell, cell - 1.5, cell - 1.5);
        }
      }
    }

    ctx.fillStyle = '#64748b';
    ctx.font = '700 11px system-ui, -apple-system, sans-serif';
    ctx.fillText('24 World Cities • 38 Live Radios • 4D Cards • World City Cup', W / 2, 928);
  };

  if (photoDataUrl) {
    const pIm = new Image();
    pIm.onload = () => drawDiplomaWithPortrait(pIm);
    pIm.onerror = () => drawDiplomaWithPortrait(null);
    pIm.src = photoDataUrl;
  } else {
    drawDiplomaWithPortrait(null);
  }
}

function awardAmbassadorDiplomaShareCoins() {
  const u = REMO_STORE.getCurrentUser();
  if (!u) return false;
  const todayKey = 'remo_amb_diploma_' + new Date().toISOString().slice(0, 10);
  if (localStorage.getItem(todayKey)) return false;
  localStorage.setItem(todayKey, '1');
  REMO_STORE.addCoins(u.uid, 25, 10);
  if (typeof spawnRemoCoinsFX === 'function') spawnRemoCoinsFX(12);
  syncHeaderAndSidebars();
  return true;
}

async function shareCityAmbassadorDiploma(channel = 'native') {
  const lang = REMO_I18N.getLang();
  const isFr = lang === 'fr';
  const cv = document.getElementById('cityAmbassadorCanvas');
  if (!cv) return;
  const u = REMO_STORE.getCurrentUser() || REMO_STORE.ensureGuestOrCitizen('REMO Pioneer', '', 'montreal');
  const city = getCityById(u.homeCity || 'montreal') || getCityById('montreal');
  const cityName = getCityName(city, lang);
  const inviteCode = u.referralCode || `REMO-${u.passportNum || '0001'}`;
  const shareUrl = `https://remoworld.com/?ref=${encodeURIComponent(inviteCode)}&city=${encodeURIComponent(city.id)}`;
  const shareText = isFr
    ? `🏅 Fier d'être Ambassadeur Officiel de ${city.flag} ${cityName} sur REMO World ! Rejoignez notre ville dans la Coupe Mondiale (+100 🪙 offerts avec le code ${inviteCode}) :`
    : `🏅 Proud Official Ambassador of ${city.flag} ${cityName} on REMO World! Join our city in the World City Cup (+100 🪙 free bonus with code ${inviteCode}):`;

  const earned = awardAmbassadorDiplomaShareCoins();
  const bonusTxt = earned ? ' (+25 🪙!)' : '';

  if (channel === 'download') {
    REMO_SHARE_HUB.downloadDataUrl(cv.toDataURL('image/png'), `REMO-Ambassador-${city.id}-9x16.png`);
    remoToast((isFr ? '📥 Diplôme 9:16 téléchargé !' : '📥 9:16 Diploma downloaded!') + bonusTxt, 'fanfare');
    return;
  }

  return await REMO_SHARE_HUB.shareToNetwork(channel || 'native', {
    url: shareUrl,
    title: `REMO World — ${cityName} Ambassador`,
    shareText,
    isFr,
    context: 'ambassador',
    fileName: `REMO-Ambassador-${city.id}-9x16`,
    canvas: cv,
    extraToastSuffix: bonusTxt
  });
}

window.openCityAmbassadorModal = openCityAmbassadorModal;
window.renderCityAmbassadorDiplomaCanvas = renderCityAmbassadorDiplomaCanvas;
window.handleAmbassadorDiplomaPhotoUpload = handleAmbassadorDiplomaPhotoUpload;
window.resetAmbassadorDiplomaPhoto = resetAmbassadorDiplomaPhoto;
window.shareCityAmbassadorDiploma = shareCityAmbassadorDiploma;

/* ── 🎟️ 24K GOLDEN CITY SCRATCH-CARD ENGINE (DAILY + SHARE-TO-UNLOCK #2) ── */
let _activeScratchPrize = null;
let _scratchRevealed = false;
let _scratchBound = false;

function getGoldenScratchDayState() {
  const day = new Date().toISOString().slice(0, 10);
  const usedCount = Number(localStorage.getItem('remo_scratch_used_' + day) || 0);
  const sharedUnlocked = localStorage.getItem('remo_scratch_shared_' + day) === '1';
  return { day, usedCount, sharedUnlocked };
}

function rollGoldenScratchPrize(city, lang) {
  const isFr = lang === 'fr';
  const cityName = getCityName(city, lang);
  const flag = city.flag || '⚜️';
  const roll = Math.random();
  if (roll < 0.12) {
    return {
      coins: 500,
      pts: 50,
      symbols: `${flag} ${flag} ${flag}`,
      title: isFr ? '🏆 JACKPOT ROYAL : +500 🪙 !' : '🏆 ROYAL JACKPOT: +500 🪙!',
      sub: isFr ? `🔥 +50 PTS pour ${cityName}` : `🔥 +50 PTS for ${cityName}`
    };
  }
  if (roll < 0.38) {
    return {
      coins: 150,
      pts: 25,
      symbols: `${flag} ${flag} 🪙`,
      title: isFr ? '✨ GAIN D’OR 24K : +150 🪙 !' : '✨ 24K GOLD WIN: +150 🪙!',
      sub: isFr ? `🏆 +25 PTS pour ${cityName}` : `🏆 +25 PTS for ${cityName}`
    };
  }
  if (roll < 0.72) {
    return {
      coins: 75,
      pts: 15,
      symbols: `${flag} 🗼 🪙`,
      title: isFr ? '🎉 PRIX CITOYEN : +75 🪙 !' : '🎉 CITIZEN PRIZE: +75 🪙!',
      sub: isFr ? `⚡ +15 PTS pour ${cityName}` : `⚡ +15 PTS for ${cityName}`
    };
  }
  return {
    coins: 35,
    pts: 10,
    symbols: `${flag} 🗽 🌟`,
    title: isFr ? '🪙 BONUS DU JOUR : +35 🪙 !' : '🪙 DAILY BONUS: +35 🪙!',
    sub: isFr ? `🌍 +10 PTS pour ${cityName}` : `🌍 +10 PTS for ${cityName}`
  };
}

function paintGoldenScratchFoilCanvas(isLockedTicket) {
  const cv = document.getElementById('goldenScratchCanvas');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const W = 360;
  const H = 200;
  cv.width = W;
  cv.height = H;
  cv.style.opacity = '1';
  cv.style.pointerEvents = isLockedTicket ? 'none' : 'auto';

  ctx.globalCompositeOperation = 'source-over';
  const foilGrad = ctx.createLinearGradient(0, 0, W, H);
  foilGrad.addColorStop(0, '#b45309');
  foilGrad.addColorStop(0.25, '#fbbf24');
  foilGrad.addColorStop(0.5, '#fef08a');
  foilGrad.addColorStop(0.75, '#f59e0b');
  foilGrad.addColorStop(1, '#92400e');
  ctx.fillStyle = foilGrad;
  ctx.fillRect(0, 0, W, H);

  // Diagonal metallic sheen lines
  ctx.strokeStyle = 'rgba(255,255,255,0.22)';
  ctx.lineWidth = 2;
  for (let x = -H; x < W + H; x += 22) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x - H, H);
    ctx.stroke();
  }

  // Inner embossed gold border
  ctx.strokeStyle = 'rgba(9, 13, 22, 0.45)';
  ctx.lineWidth = 3;
  ctx.strokeRect(10, 10, W - 20, H - 20);

  const isFr = REMO_I18N.getLang() === 'fr';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#090d16';
  ctx.font = '900 18px system-ui, -apple-system, sans-serif';
  if (isLockedTicket) {
    ctx.fillText(
      isFr ? '🔒 TICKET DU JOUR DÉJÀ UTILISÉ' : '🔒 DAILY TICKETS COMPLETED',
      W / 2,
      H / 2 - 6
    );
    ctx.font = '800 13px system-ui, -apple-system, sans-serif';
    ctx.fillText(
      isFr ? 'Revenez demain pour 2 nouveaux Tickets d’Or !' : 'Come back tomorrow for 2 new Golden Tickets!',
      W / 2,
      H / 2 + 20
    );
  } else {
    ctx.fillText(
      isFr ? '✨ GRATTEZ ICI (DOIGT / SOURIS) ✨' : '✨ SCRATCH HERE (FINGER / MOUSE) ✨',
      W / 2,
      H / 2 - 8
    );
    ctx.font = '800 13px system-ui, -apple-system, sans-serif';
    ctx.fillText(
      isFr ? '🎟️ GAIN GARANTI : +35 À +500 🪙' : '🎟️ GUARANTEED PRIZE: +35 TO +500 🪙',
      W / 2,
      H / 2 + 18
    );
  }
}

function bindGoldenScratchPointerEvents() {
  if (_scratchBound) return;
  const cv = document.getElementById('goldenScratchCanvas');
  if (!cv) return;
  _scratchBound = true;
  let drawing = false;
  let strokes = 0;

  const scratchAt = (clientX, clientY) => {
    if (_scratchRevealed) return;
    const rect = cv.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const x = ((clientX - rect.left) / rect.width) * cv.width;
    const y = ((clientY - rect.top) / rect.height) * cv.height;
    const ctx = cv.getContext('2d');
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 26, 0, Math.PI * 2);
    ctx.fill();
    strokes++;
    if (strokes >= 18) {
      revealGoldenScratchCardPrize(false);
    }
  };

  cv.addEventListener('pointerdown', (e) => {
    if (_scratchRevealed) return;
    drawing = true;
    strokes = 0;
    scratchAt(e.clientX, e.clientY);
  });
  cv.addEventListener('pointermove', (e) => {
    if (!drawing || _scratchRevealed) return;
    scratchAt(e.clientX, e.clientY);
  });
  window.addEventListener('pointerup', () => {
    drawing = false;
  });
}

function openGoldenScratchModal() {
  const modal = document.getElementById('goldenScratchModal');
  if (!modal) return;
  const lang = REMO_I18N.getLang();
  const isFr = lang === 'fr';
  const u = REMO_STORE.getCurrentUser() || REMO_STORE.ensureGuestOrCitizen('REMO Pioneer', '', 'montreal');
  const city = getCityById(u.homeCity || 'montreal') || getCityById('montreal');
  const { usedCount, sharedUnlocked } = getGoldenScratchDayState();

  REMO_I18N.applyDOM(modal);
  modal.classList.add('open');
  bindGoldenScratchPointerEvents();

  const badge = document.getElementById('scratchTicketStatusBadge');
  const instantBtn = document.getElementById('scratchInstantRevealBtn');
  const unlockBox = document.getElementById('goldenScratchShareUnlockBox');

  if (usedCount === 0) {
    // Ticket #1 ready
    _scratchRevealed = false;
    _activeScratchPrize = rollGoldenScratchPrize(city, lang);
    document.getElementById('goldenScratchSymbols').textContent = _activeScratchPrize.symbols;
    document.getElementById('goldenScratchPrizeTitle').textContent = _activeScratchPrize.title;
    document.getElementById('goldenScratchPrizeSub').textContent = _activeScratchPrize.sub;
    if (badge) badge.textContent = isFr ? '🎟️ Ticket d’Or Gratuit #1 / 2 Prêt' : '🎟️ Free Daily Golden Ticket #1 / 2 Ready';
    if (instantBtn) instantBtn.style.display = 'inline-flex';
    if (unlockBox) unlockBox.style.display = 'none';
    paintGoldenScratchFoilCanvas(false);
  } else if (usedCount === 1 && !sharedUnlocked) {
    // Ticket #1 used, waiting for Share to unlock Ticket #2
    _scratchRevealed = true;
    if (badge) badge.textContent = isFr ? '🔓 Partagez REMO pour débloquer le Ticket #2 !' : '🔓 Share REMO below to unlock Ticket #2!';
    if (instantBtn) instantBtn.style.display = 'none';
    if (unlockBox) unlockBox.style.display = 'block';
    const cv = document.getElementById('goldenScratchCanvas');
    if (cv) {
      cv.style.opacity = '0';
      cv.style.pointerEvents = 'none';
    }
  } else if (usedCount === 1 && sharedUnlocked) {
    // Ticket #2 ready!
    _scratchRevealed = false;
    _activeScratchPrize = rollGoldenScratchPrize(city, lang);
    document.getElementById('goldenScratchSymbols').textContent = _activeScratchPrize.symbols;
    document.getElementById('goldenScratchPrizeTitle').textContent = _activeScratchPrize.title;
    document.getElementById('goldenScratchPrizeSub').textContent = _activeScratchPrize.sub;
    if (badge) badge.textContent = isFr ? '🔥 Ticket Bonus #2 / 2 Débloqué ! Grattez maintenant' : '🔥 Bonus Ticket #2 / 2 Unlocked! Scratch Now';
    if (instantBtn) instantBtn.style.display = 'inline-flex';
    if (unlockBox) unlockBox.style.display = 'none';
    paintGoldenScratchFoilCanvas(false);
  } else {
    // Both tickets used today
    _scratchRevealed = true;
    if (badge) badge.textContent = isFr ? '✓ 2 / 2 Tickets d’Or grattés aujourd’hui' : '✓ 2 / 2 Golden Tickets scratched today';
    if (instantBtn) instantBtn.style.display = 'none';
    if (unlockBox) unlockBox.style.display = 'none';
    paintGoldenScratchFoilCanvas(true);
  }
}

function revealGoldenScratchCardPrize(isInstant) {
  if (_scratchRevealed || !_activeScratchPrize) return;
  _scratchRevealed = true;
  const lang = REMO_I18N.getLang();
  const isFr = lang === 'fr';
  const u = REMO_STORE.getCurrentUser() || REMO_STORE.ensureGuestOrCitizen('REMO Pioneer', '', 'montreal');
  const { day, usedCount, sharedUnlocked } = getGoldenScratchDayState();

  const cv = document.getElementById('goldenScratchCanvas');
  if (cv) {
    cv.style.transition = 'opacity 0.35s ease';
    cv.style.opacity = '0';
    cv.style.pointerEvents = 'none';
  }

  const nextUsed = usedCount + 1;
  localStorage.setItem('remo_scratch_used_' + day, String(nextUsed));

  REMO_STORE.addCoins(u.uid, _activeScratchPrize.coins, _activeScratchPrize.pts);
  if (typeof spawnRemoCoinsFX === 'function') spawnRemoCoinsFX(18);
  syncHeaderAndSidebars();

  const instantBtn = document.getElementById('scratchInstantRevealBtn');
  if (instantBtn) instantBtn.style.display = 'none';

  const badge = document.getElementById('scratchTicketStatusBadge');
  const unlockBox = document.getElementById('goldenScratchShareUnlockBox');

  if (nextUsed === 1 && !sharedUnlocked) {
    if (badge) badge.textContent = isFr ? '🎉 Ticket #1 Encaissé ! Débloquez le Ticket #2 ci-dessous :' : '🎉 Ticket #1 Claimed! Unlock Ticket #2 below:';
    if (unlockBox) unlockBox.style.display = 'block';
  } else {
    if (badge) badge.textContent = isFr ? '✓ 2 / 2 Tickets d’Or encaissés aujourd’hui !' : '✓ 2 / 2 Golden Tickets claimed today!';
    if (unlockBox) unlockBox.style.display = 'none';
  }

  remoToast(
    isFr
      ? `🎟️ Bravo ! Vous avez gagné +${_activeScratchPrize.coins} 🪙 au Ticket d’Or !`
      : `🎟️ Congrats! You won +${_activeScratchPrize.coins} 🪙 on the Golden Scratch-Card!`,
    'fanfare'
  );
}

async function shareToUnlockSecondScratchCard(platform) {
  const lang = REMO_I18N.getLang();
  const isFr = lang === 'fr';
  const u = REMO_STORE.getCurrentUser() || REMO_STORE.ensureGuestOrCitizen('REMO Pioneer', '', 'montreal');
  const city = getCityById(u.homeCity || 'montreal') || getCityById('montreal');
  const cityName = getCityName(city, lang);
  const inviteCode = u.referralCode || `REMO-${u.passportNum || '0001'}`;
  const shareUrl = `https://remoworld.com/?ref=${encodeURIComponent(inviteCode)}&city=${encodeURIComponent(city.id)}`;
  const shareText = isFr
    ? `🎟️ Je viens de gagner des Pièces d'Or au Ticket à Gratter 24K pour ${city.flag} ${cityName} sur REMO World ! Gratte ton ticket gratuit et reçois +100 🪙 avec mon code ${inviteCode} :`
    : `🎟️ I just won Gold Coins on the 24K City Scratch-Card for ${city.flag} ${cityName} on REMO World! Scratch your free ticket & claim +100 🪙 with my code ${inviteCode}:`;

  await REMO_SHARE_HUB.shareToNetwork(platform || 'facebook', {
    url: shareUrl,
    title: `REMO World 24K Scratch-Card — ${cityName}`,
    shareText,
    isFr,
    context: 'scratch',
    suppressToast: true
  });

  const { day } = getGoldenScratchDayState();
  localStorage.setItem('remo_scratch_shared_' + day, '1');
  openGoldenScratchModal();
  remoToast(
    isFr
      ? '🔓 Ticket d’Or #2 Débloqué ! Grattez maintenant pour un 2e gain garanti !'
      : '🔓 Golden Scratch-Card #2 Unlocked! Scratch now for your 2nd guaranteed win!',
    'fanfare'
  );
}

window.openGoldenScratchModal = openGoldenScratchModal;
window.revealGoldenScratchCardPrize = revealGoldenScratchCardPrize;
window.shareToUnlockSecondScratchCard = shareToUnlockSecondScratchCard;

/* ── 🎁 1. VIP REFERRAL & SHARED LINK HOLOGRAPHIC WELCOME CHEST (?ref= / ?promo= / ?invite=) ── */
let _detectedVipInviteCode = 'REMO2026';
let _detectedVipCityId = '';

function openVipInviteWelcomeModal(isPreview = false) {
  const modal = document.getElementById('vipInviteWelcomeModal');
  if (!modal) return;
  const lang = REMO_I18N.getLang();
  const u = REMO_STORE.getCurrentUser();
  const cities = getRemoCities();

  let params = null;
  try {
    params = new URLSearchParams(window.location.search);
  } catch (e) {}

  const refParam = (params && (params.get('ref') || params.get('invite') || params.get('promo'))) || '';
  const cityParam = (params && params.get('city')) || '';
  if (refParam) _detectedVipInviteCode = refParam.toUpperCase().slice(0, 24);
  else if (u && u.referralCode) _detectedVipInviteCode = u.referralCode;
  if (cityParam && cities.some((c) => c.id === cityParam)) {
    _detectedVipCityId = cityParam;
  }

  const codeEl = document.getElementById('vipInviteCodeVal');
  if (codeEl) codeEl.textContent = _detectedVipInviteCode || 'REMO2026';

  const sel = document.getElementById('vipInviteCitySelect');
  const preferredCity = _detectedVipCityId || (u && u.homeCity) || 'montreal';
  if (sel) {
    sel.innerHTML = cities.map((c) =>
      `<option value="${c.id}" ${c.id === preferredCity ? 'selected' : ''}>${c.flag} ${escapeHtmlStr(getCityName(c, lang))} (+50 PTS)</option>`
    ).join('');
  }

  const nameInp = document.getElementById('vipInviteNameInput');
  if (nameInp && u && u.name && !u.name.startsWith('REMO Pioneer') && u.role !== 'guest') {
    nameInp.value = u.name;
  }

  REMO_I18N.applyDOM(modal);
  modal.classList.add('open');
  if (!isPreview && typeof RemoAudio !== 'undefined') {
    try { RemoAudio.play('fanfare'); } catch (e) {}
  }
}
window.openVipInviteWelcomeModal = openVipInviteWelcomeModal;

function claimVipInviteWelcomePack() {
  const lang = REMO_I18N.getLang();
  const isFr = lang === 'fr';
  const sel = document.getElementById('vipInviteCitySelect');
  const nameInp = document.getElementById('vipInviteNameInput');
  const chosenCityId = (sel && sel.value) || _detectedVipCityId || 'montreal';
  const rawName = (nameInp && nameInp.value || '').trim().replace(/^@+/, '');

  let u = REMO_STORE.getCurrentUser();
  if (!u) {
    u = REMO_STORE.ensureGuestOrCitizen(rawName || 'REMO Citizen', '', chosenCityId);
  } else {
    u.homeCity = chosenCityId;
    if (rawName && rawName.length >= 2) {
      u.name = rawName;
    }
  }

  const alreadyClaimed = localStorage.getItem('remo_vip_invite_claimed') === '1';
  if (!alreadyClaimed) {
    localStorage.setItem('remo_vip_invite_claimed', '1');
    REMO_STORE.addCoins(u.uid, 150, 50);
    if (_detectedVipInviteCode && typeof REMO_STORE.redeemReferralCode === 'function') {
      try { REMO_STORE.redeemReferralCode(_detectedVipInviteCode); } catch (e) {}
    }
  } else {
    REMO_STORE.addCoins(u.uid, 25, 15);
  }

  REMO_STORE.save(true, 'vip_invite_claim');
  REMO_STORE.syncToFirestore('vip_invite_claim', true);
  syncHeaderAndSidebars();
  if (typeof renderSocialFeed === 'function') renderSocialFeed();

  document.getElementById('vipInviteWelcomeModal')?.classList.remove('open');
  if (typeof spawnRemoCoinsFX === 'function') spawnRemoCoinsFX(22);

  const cityObj = getCityById(chosenCityId);
  const cityName = getCityName(cityObj, lang);
  remoToast(
    isFr
      ? `🎉 Pack VIP Réclamé ! +150 🪙 dans votre coffre & +50 PTS pour ${cityObj.flag} ${cityName} !`
      : `🎉 VIP Pack Claimed! +150 🪙 added to your vault & +50 PTS for ${cityObj.flag} ${cityName}!`,
    'fanfare'
  );
}
window.claimVipInviteWelcomePack = claimVipInviteWelcomePack;

/* ── 📣 2. ADMIN-ONLY 1-CLICK VIRAL PROMO STUDIO (CUSTOM PHOTO + 16:9 / 9:16 + 16 VIRAL TEXTS) ── */
let _viralPromoStudioFormat = '16:9';
let _viralPromoTemplatesCache = [];
let _viralPromoActiveCategory = 'all';
let _promoStudioCustomPhotoImg = null;
let _promoStudioCustomPhotoDataUrl = '';

function getSortedCitiesLeaderboard() {
  const cities = getRemoCities().map((c) => ({
    city: c,
    pts: Number(REMO_STORE.getCityScore ? REMO_STORE.getCityScore(c.id) : ((REMO_STORE.state.cityScores && REMO_STORE.state.cityScores[c.id]) || c.baseScore || 1200))
  }));
  cities.sort((a, b) => b.pts - a.pts);
  return cities;
}

function handlePromoStudioPhotoUpload(ev) {
  const file = ev.target && ev.target.files && ev.target.files[0];
  if (!file) return;
  const isFr = REMO_I18N.getLang() === 'fr';
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const cv = document.createElement('canvas');
      const maxDim = 960;
      let w = img.width;
      let h = img.height;
      if (w > maxDim || h > maxDim) {
        if (w > h) { h = Math.round((h * maxDim) / w); w = maxDim; }
        else { w = Math.round((w * maxDim) / h); h = maxDim; }
      }
      cv.width = w;
      cv.height = h;
      cv.getContext('2d').drawImage(img, 0, 0, w, h);
      _promoStudioCustomPhotoDataUrl = cv.toDataURL('image/jpeg', 0.85);
      const cleanImg = new Image();
      cleanImg.onload = () => {
        _promoStudioCustomPhotoImg = cleanImg;
        const resetBtn = document.getElementById('promoStudioResetPhotoBtn');
        if (resetBtn) resetBtn.style.display = 'inline-flex';
        renderViralPromoStudioCanvas();
        remoToast(isFr ? '📷 Photo ajoutée sur l’affiche !' : '📷 Photo added to poster!');
      };
      cleanImg.src = _promoStudioCustomPhotoDataUrl;
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}
window.handlePromoStudioPhotoUpload = handlePromoStudioPhotoUpload;

function resetPromoStudioPhoto() {
  _promoStudioCustomPhotoImg = null;
  _promoStudioCustomPhotoDataUrl = '';
  const inp = document.getElementById('promoStudioPhotoInput');
  if (inp) inp.value = '';
  const resetBtn = document.getElementById('promoStudioResetPhotoBtn');
  if (resetBtn) resetBtn.style.display = 'none';
  renderViralPromoStudioCanvas();
}
window.resetPromoStudioPhoto = resetPromoStudioPhoto;

function openViralPromoStudioModal(defaultCityId = '') {
  if (!REMO_STORE.isAdminUnlocked() && !REMO_STORE.isCurrentUserAdmin()) {
    const isFr = REMO_I18N.getLang() === 'fr';
    remoToast(isFr ? '🔒 Accès réservé à l’Administrateur REMO.' : '🔒 Access restricted to REMO Administrator.');
    return;
  }
  const modal = document.getElementById('viralPromoStudioModal');
  if (!modal) return;
  const lang = REMO_I18N.getLang();
  const isFr = lang === 'fr';
  const u = REMO_STORE.getCurrentUser();
  const targetCityId = defaultCityId || (u && u.homeCity) || 'montreal';
  const sorted = getSortedCitiesLeaderboard();

  const citySel = document.getElementById('promoStudioCitySelect');
  if (citySel) {
    citySel.innerHTML = sorted.map((item, idx) =>
      `<option value="${item.city.id}" ${item.city.id === targetCityId ? 'selected' : ''}>#${idx + 1} ${item.city.flag} ${escapeHtmlStr(getCityName(item.city, lang))} (${item.pts.toLocaleString()} PTS)</option>`
    ).join('');
  }

  const themeSel = document.getElementById('promoStudioThemeSelect');
  if (themeSel) {
    const curVal = themeSel.value || 'ranking';
    themeSel.innerHTML = `
      <option value="ranking" ${curVal === 'ranking' ? 'selected' : ''}>${isFr ? '🏆 Alerte Classement Mondial Live' : '🏆 Live World Ranking Alert'}</option>
      <option value="duel" ${curVal === 'duel' ? 'selected' : ''}>${isFr ? '⚔️ Duel de Fierté entre 2 Villes' : '⚔️ City vs City Pride Duel'}</option>
      <option value="radio" ${curVal === 'radio' ? 'selected' : ''}>${isFr ? '📻 38 Radios du Monde & Cadeau +150 🪙' : '📻 38 Live Radios & +150 🪙 Gift'}</option>
      <option value="guess" ${curVal === 'guess' ? 'selected' : ''}>${isFr ? '🕵️ Défi Photo : Devine la Ville !' : '🕵️ Guess The City Photo Challenge'}</option>
    `;
  }

  const upBtn = document.getElementById('promoStudioUploadBtn');
  if (upBtn) {
    upBtn.textContent = isFr ? '📷 Ajouter Ma Photo sur Carte / Affiche' : '📷 Upload Photo to Card / Poster';
  }

  const pmSel = document.getElementById('promoStudioPhotoModeSelect');
  if (pmSel) {
    const curPm = pmSel.value || 'card';
    pmSel.innerHTML = `
      <option value="card" ${curPm === 'card' ? 'selected' : ''}>${isFr ? '🎴 Photo dans Carte 4D d’Or' : '🎴 Photo Inside 4D Gold Card'}</option>
      <option value="bg" ${curPm === 'bg' ? 'selected' : ''}>${isFr ? '🌆 Photo en Fond Plein Écran' : '🌆 Full-Screen Background Photo'}</option>
    `;
  }

  const titleInp = document.getElementById('promoStudioCustomTitleInp');
  if (titleInp) {
    titleInp.placeholder = isFr ? '✍️ Titre personnalisé sur l’affiche (optionnel)...' : '✍️ Optional custom title on poster...';
  }

  const destSel = document.getElementById('promoStudioDestSelect');
  if (destSel) {
    const curDest = destSel.value || 'home';
    destSel.innerHTML = `
      <option value="home" ${curDest === 'home' ? 'selected' : ''}>${isFr ? '🎯 Lien : 🏠 Accueil + Coffre VIP (+150 🪙)' : '🎯 Link: 🏠 Home + VIP Chest (+150 🪙)'}</option>
      <option value="ranking" ${curDest === 'ranking' ? 'selected' : ''}>${isFr ? '🎯 Lien : 🏆 Classement Live des 24 Villes' : '🎯 Link: 🏆 Top 24 Cities Live Ranking'}</option>
      <option value="guess" ${curDest === 'guess' ? 'selected' : ''}>${isFr ? '🎯 Lien : 🕵️ Jeu Photo Devine la Ville' : '🎯 Link: 🕵️ Guess The City Photo Game'}</option>
      <option value="radio" ${curDest === 'radio' ? 'selected' : ''}>${isFr ? '🎯 Lien : 📻 38 Radios du Monde Live' : '🎯 Link: 📻 38 Live World Cities Radio'}</option>
      <option value="versus" ${curDest === 'versus' ? 'selected' : ''}>${isFr ? '🎯 Lien : ⚔️ Comparateur & Duels des Villes' : '🎯 Link: ⚔️ City Duels Comparator'}</option>
    `;
  }

  REMO_I18N.applyDOM(modal);
  if (typeof updateIndexNowStatusUI === 'function') {
    updateIndexNowStatusUI();
  }
  modal.classList.add('open');
  renderViralPromoStudioAll();
}
window.openViralPromoStudioModal = openViralPromoStudioModal;

function setViralPromoStudioFormat(fmt) {
  _viralPromoStudioFormat = fmt === '9:16' ? '9:16' : '16:9';
  const b169 = document.getElementById('promoFmtBtn169');
  const b916 = document.getElementById('promoFmtBtn916');
  if (b169 && b916) {
    if (_viralPromoStudioFormat === '16:9') {
      b169.className = 'btn-cyber';
      b916.className = 'btn-ghost';
    } else {
      b169.className = 'btn-ghost';
      b916.className = 'btn-cyber';
    }
  }
  renderViralPromoStudioAll();
}
window.setViralPromoStudioFormat = setViralPromoStudioFormat;

function setViralPromoCategory(cat) {
  _viralPromoActiveCategory = cat || 'all';
  renderViralPromoTemplatesList();
}
window.setViralPromoCategory = setViralPromoCategory;

function renderViralPromoStudioAll() {
  renderViralPromoStudioCanvas();
  renderViralPromoTemplatesList();
}
window.renderViralPromoStudioAll = renderViralPromoStudioAll;

function drawCoverImageInRect(ctx, img, rx, ry, rw, rh) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(rx, ry, rw, rh);
  ctx.clip();
  const scale = Math.max(rw / img.width, rh / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  ctx.drawImage(img, rx + (rw - dw) / 2, ry + (rh - dh) / 2, dw, dh);
  ctx.restore();
}

function renderViralPromoStudioCanvas() {
  const cv = document.getElementById('viralPromoStudioCanvas');
  if (!cv) return;
  const lang = REMO_I18N.getLang();
  const isFr = lang === 'fr';
  const sorted = getSortedCitiesLeaderboard();
  const selCityId = document.getElementById('promoStudioCitySelect')?.value || 'montreal';
  const theme = document.getElementById('promoStudioThemeSelect')?.value || 'ranking';
  const photoMode = document.getElementById('promoStudioPhotoModeSelect')?.value || 'card';
  const customHeadline = (document.getElementById('promoStudioCustomTitleInp')?.value || '').trim();

  const focusIdx = Math.max(0, sorted.findIndex((x) => x.city.id === selCityId));
  const focusEntry = sorted[focusIdx] || sorted[0];
  const rivalEntry = sorted[focusIdx === 0 ? 1 : focusIdx - 1] || sorted[0];

  const focusCity = focusEntry.city;
  const rivalCity = rivalEntry.city;
  const focusName = getCityName(focusCity, lang);
  const rivalName = getCityName(rivalCity, lang);
  const rankNum = focusIdx + 1;

  const u = REMO_STORE.getCurrentUser();
  const inviteCode = (u && u.referralCode) ? u.referralCode : 'REMO2026';

  const isVert = _viralPromoStudioFormat === '9:16';
  const W = isVert ? 540 : 960;
  const H = isVert ? 960 : 540;
  cv.width = W;
  cv.height = H;
  const ctx = cv.getContext('2d');

  // Deep 4D Cyber Gradient Background OR Full-Bleed Custom Photo Background
  if (_promoStudioCustomPhotoImg && photoMode === 'bg') {
    drawCoverImageInRect(ctx, _promoStudioCustomPhotoImg, 0, 0, W, H);
    ctx.fillStyle = 'rgba(4, 7, 20, 0.66)';
    ctx.fillRect(0, 0, W, H);
  } else {
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#040714');
    bg.addColorStop(0.5, '#0f172a');
    bg.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 48) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += 48) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
  }

  // Outer Gold Neon Frame
  ctx.strokeStyle = 'rgba(251, 191, 36, 0.72)';
  ctx.lineWidth = 4;
  ctx.strokeRect(14, 14, W - 28, H - 28);

  if (!isVert) {
    // ── 16:9 LANDSCAPE BANNER (960×540) FOR FACEBOOK GROUPS / REDDIT / X ──
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.fillRect(36, 32, 888, 44);
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(36, 32, 888, 44);

    ctx.fillStyle = '#fde047';
    ctx.font = '900 17px system-ui, sans-serif';
    ctx.textAlign = 'center';
    const defaultTopAlert = theme === 'duel'
      ? (isFr ? `⚔️ ALERTE DUEL EN DIRECT : ${focusCity.flag} ${focusName.toUpperCase()} (#${rankNum}) VS ${rivalCity.flag} ${rivalName.toUpperCase()} !` : `⚔️ LIVE CITY DUEL ALERT: ${focusCity.flag} ${focusName.toUpperCase()} (#${rankNum}) VS ${rivalCity.flag} ${rivalName.toUpperCase()}!`)
      : theme === 'radio'
        ? (isFr ? `📻 38 RADIOS DU MONDE EN DIRECT + CLASSEMENT OFFICIEL 2026 • REMOWORLD.COM` : `📻 38 LIVE WORLD RADIOS + OFFICIAL 2026 CITY RANKING • REMOWORLD.COM`)
        : theme === 'guess'
          ? (isFr ? `🕵️ DÉFI PHOTO : 90% ÉCHOUENT À RECONNAÎTRE LA 3E VILLE ! ET VOUS ?` : `🕵️ PHOTO QUIZ: 90% FAIL TO GUESS THE 3RD WORLD CITY! CAN YOU?`)
          : (isFr ? `🔥 CLASSEMENT MONDIAL DES VILLES 2026 EN DIRECT • ${focusCity.flag} ${focusName.toUpperCase()} EST #${rankNum} !` : `🔥 LIVE 2026 WORLD CITIES RANKING • ${focusCity.flag} ${focusName.toUpperCase()} IS CURRENTLY #${rankNum}!`);
    ctx.fillText(customHeadline || defaultTopAlert, W / 2, 60);

    // Left Column: Featured City Spotlight OR 4D Custom Photo Card (x: 36..466, y: 92..420)
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.fillRect(36, 92, 430, 328);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.55)';
    ctx.lineWidth = 2;
    ctx.strokeRect(36, 92, 430, 328);

    if (_promoStudioCustomPhotoImg && photoMode === 'card') {
      // Render Custom Photo inside a 4D Gold Card Frame at top of Left Column
      drawCoverImageInRect(ctx, _promoStudioCustomPhotoImg, 54, 106, 394, 168);
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(54, 106, 394, 168);

      // Pill badge over photo top-left
      ctx.fillStyle = 'rgba(4, 7, 20, 0.84)';
      ctx.fillRect(64, 114, 210, 30);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1;
      ctx.strokeRect(64, 114, 210, 30);
      ctx.fillStyle = '#fde047';
      ctx.font = '900 13px system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${focusCity.flag} ${focusName.toUpperCase()} • #${rankNum}`, 74, 134);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 22px system-ui, sans-serif';
      ctx.fillText(
        isFr ? `${focusCity.flag} ${focusName.toUpperCase()} • ${focusEntry.pts.toLocaleString()} PTS` : `${focusCity.flag} ${focusName.toUpperCase()} • ${focusEntry.pts.toLocaleString()} PTS`,
        251,
        304
      );

      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(68, 326, 366, 66);
      ctx.fillStyle = '#050816';
      ctx.font = '900 18px system-ui, sans-serif';
      ctx.fillText(
        isFr ? `🗳️ VOTER POUR ${focusName.toUpperCase()} (+100 PTS)` : `🗳️ VOTE FOR ${focusName.toUpperCase()} (+100 PTS)`,
        251,
        365
      );
    } else {
      ctx.font = '64px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(focusCity.flag || '🌍', 251, 175);

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 30px system-ui, sans-serif';
      ctx.fillText(`${focusName.toUpperCase()}`, 251, 222);

      ctx.fillStyle = '#fde047';
      ctx.font = '900 22px system-ui, sans-serif';
      ctx.fillText(
        isFr ? `🏆 RANG MONDIAL #${rankNum} • ${focusEntry.pts.toLocaleString()} PTS` : `🏆 WORLD RANK #${rankNum} • ${focusEntry.pts.toLocaleString()} PTS`,
        251,
        260
      );

      const diffPts = Math.abs(rivalEntry.pts - focusEntry.pts);
      ctx.fillStyle = '#7dd3fc';
      ctx.font = '800 16px system-ui, sans-serif';
      ctx.fillText(
        focusIdx === 0
          ? (isFr ? `👑 En tête devant ${rivalCity.flag} ${rivalName} (+${diffPts} PTS)` : `👑 Leading ahead of ${rivalCity.flag} ${rivalName} (+${diffPts} PTS)`)
          : (isFr ? `⚡ À seulement ${diffPts} PTS de ${rivalCity.flag} ${rivalName} !` : `⚡ Only ${diffPts} PTS behind ${rivalCity.flag} ${rivalName}!`),
        251,
        298
      );

      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(68, 330, 366, 62);
      ctx.fillStyle = '#050816';
      ctx.font = '900 19px system-ui, sans-serif';
      ctx.fillText(
        isFr ? `🗳️ VOTER POUR ${focusName.toUpperCase()} (+100 PTS)` : `🗳️ VOTE FOR ${focusName.toUpperCase()} (+100 PTS)`,
        251,
        368
      );
    }

    // Right Column: Top 5 World Leaderboard (x: 484..924, y: 92..420)
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.fillRect(484, 92, 440, 328);
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.45)';
    ctx.lineWidth = 2;
    ctx.strokeRect(484, 92, 440, 328);

    ctx.fillStyle = '#fde047';
    ctx.font = '900 18px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(isFr ? '🌍 TOP 5 CLASSEMENT MONDIAL EN DIRECT' : '🌍 LIVE TOP 5 WORLD CITIES STANDINGS', 504, 126);

    sorted.slice(0, 5).forEach((item, idx) => {
      const y = 144 + idx * 52;
      const isFocus = item.city.id === focusCity.id;
      ctx.fillStyle = isFocus ? 'rgba(251, 191, 36, 0.22)' : 'rgba(255, 255, 255, 0.05)';
      ctx.fillRect(504, y, 400, 42);
      if (isFocus) {
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(504, y, 400, 42);
      }
      ctx.fillStyle = idx === 0 ? '#fde047' : '#38bdf8';
      ctx.font = '900 17px system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`#${idx + 1}  ${item.city.flag} ${getCityName(item.city, lang)}`, 518, y + 27);

      ctx.fillStyle = '#f8fafc';
      ctx.textAlign = 'right';
      ctx.font = '900 16px system-ui, sans-serif';
      ctx.fillText(`${item.pts.toLocaleString()} PTS`, 890, y + 27);
    });

    // Bottom VIP Gift Banner (x: 36..924, y: 436..506)
    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.fillRect(36, 436, 888, 70);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.strokeRect(36, 436, 888, 70);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 20px system-ui, sans-serif';
    ctx.fillText(
      isFr
        ? `🎁 CADEAU VIP : +150 🪙 PIÈCES D’OR + 1 CARTE DE VILLE 4D GRATUITE SUR REMOWORLD.COM`
        : `🎁 VIP GIFT: CLAIM +150 🪙 FREE GOLD COINS & 1 4D CITY CARD ON REMOWORLD.COM`,
      W / 2,
      466
    );
    ctx.fillStyle = '#fde047';
    ctx.font = '900 16px system-ui, sans-serif';
    ctx.fillText(
      isFr
        ? `👉 Code d’Invitation VIP : ${inviteCode}  •  38 Radios Live  •  Jeux & Duels des Villes`
        : `👉 VIP Invite Code: ${inviteCode}  •  38 Live Radios  •  World City Games & Duels`,
      W / 2,
      494
    );
  } else {
    // ── 9:16 VERTICAL STORY POSTER (540×960) FOR STORIES / TIKTOK / REELS ──
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.fillRect(32, 34, 476, 56);
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 2;
    ctx.strokeRect(32, 34, 476, 56);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#fde047';
    ctx.font = '900 16px system-ui, sans-serif';
    ctx.fillText(
      customHeadline || (isFr ? '🔥 COUPE MONDIALE DES VILLES 2026' : '🔥 2026 WORLD CITIES LIVE RANKING'),
      W / 2,
      68
    );

    // City Spotlight Card
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.fillRect(32, 108, 476, 290);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.strokeRect(32, 108, 476, 290);

    if (_promoStudioCustomPhotoImg && photoMode === 'card') {
      drawCoverImageInRect(ctx, _promoStudioCustomPhotoImg, 48, 120, 444, 165);
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(48, 120, 444, 165);

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 22px system-ui, sans-serif';
      ctx.fillText(`${focusCity.flag} ${focusName.toUpperCase()} • #${rankNum} (${focusEntry.pts.toLocaleString()} PTS)`, W / 2, 312);

      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(62, 328, 416, 54);
      ctx.fillStyle = '#050816';
      ctx.font = '900 18px system-ui, sans-serif';
      ctx.fillText(
        isFr ? `🗳️ SOUTENEZ ${focusName.toUpperCase()} (+100 PTS)` : `🗳️ VOTE FOR ${focusName.toUpperCase()} (+100 PTS)`,
        W / 2,
        361
      );
    } else {
      ctx.font = '68px system-ui, sans-serif';
      ctx.fillText(focusCity.flag || '🌍', W / 2, 190);

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 32px system-ui, sans-serif';
      ctx.fillText(focusName.toUpperCase(), W / 2, 240);

      ctx.fillStyle = '#fde047';
      ctx.font = '900 22px system-ui, sans-serif';
      ctx.fillText(
        isFr ? `🏆 RANG #${rankNum} • ${focusEntry.pts.toLocaleString()} PTS` : `🏆 RANK #${rankNum} • ${focusEntry.pts.toLocaleString()} PTS`,
        W / 2,
        280
      );

      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(62, 314, 416, 58);
      ctx.fillStyle = '#050816';
      ctx.font = '900 18px system-ui, sans-serif';
      ctx.fillText(
        isFr ? `🗳️ SOUTENEZ ${focusName.toUpperCase()} (+100 PTS)` : `🗳️ VOTE FOR ${focusName.toUpperCase()} (+100 PTS)`,
        W / 2,
        350
      );
    }

    // Top 5 Standings Box
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.fillRect(32, 416, 476, 336);
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.45)';
    ctx.lineWidth = 2;
    ctx.strokeRect(32, 416, 476, 336);

    ctx.fillStyle = '#7dd3fc';
    ctx.font = '900 18px system-ui, sans-serif';
    ctx.fillText(isFr ? '🌍 TOP 5 DES VILLES EN DIRECT' : '🌍 LIVE TOP 5 WORLD STANDINGS', W / 2, 450);

    sorted.slice(0, 5).forEach((item, idx) => {
      const y = 470 + idx * 52;
      const isFocus = item.city.id === focusCity.id;
      ctx.fillStyle = isFocus ? 'rgba(251, 191, 36, 0.22)' : 'rgba(255, 255, 255, 0.05)';
      ctx.fillRect(50, y, 440, 42);
      ctx.fillStyle = idx === 0 ? '#fde047' : '#f8fafc';
      ctx.textAlign = 'left';
      ctx.font = '900 17px system-ui, sans-serif';
      ctx.fillText(`#${idx + 1}  ${item.city.flag} ${getCityName(item.city, lang)}`, 66, y + 27);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`${item.pts.toLocaleString()} PTS`, 474, y + 27);
    });

    // Bottom VIP Gift CTA
    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.fillRect(32, 772, 476, 152);
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(32, 772, 476, 152);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#fde047';
    ctx.font = '900 20px system-ui, sans-serif';
    ctx.fillText(
      isFr ? '🎁 CADEAU VIP : +150 🪙 OFFERTS !' : '🎁 VIP GIFT: +150 🪙 FREE COINS!',
      W / 2,
      812
    );
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 22px system-ui, sans-serif';
    ctx.fillText('🌍 REMOWORLD.COM', W / 2, 852);
    ctx.fillStyle = '#7dd3fc';
    ctx.font = '800 16px system-ui, sans-serif';
    ctx.fillText(
      isFr ? `Code VIP : ${inviteCode} (+1 Carte 4D Gratuite)` : `VIP Code: ${inviteCode} (+1 Free 4D City Card)`,
      W / 2,
      892
    );
  }
}

async function copyAndDownloadViralPromoPoster() {
  const isFr = REMO_I18N.getLang() === 'fr';
  const cv = document.getElementById('viralPromoStudioCanvas');
  if (!cv) return;
  const selCityId = document.getElementById('promoStudioCitySelect')?.value || 'montreal';
  const dataUrl = cv.toDataURL('image/png');

  let copied = false;
  try {
    if (navigator.clipboard && window.ClipboardItem) {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      copied = true;
    }
  } catch (e) {}

  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = `REMO-Promo-${selCityId}-${_viralPromoStudioFormat.replace(':', 'x')}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();

  if (typeof rewardViralShareWithDailyCap === 'function') {
    rewardViralShareWithDailyCap('promo_studio_poster');
  }
  remoToast(
    copied
      ? (isFr ? '📋 Affiche copiée dans le presse-papiers (Ctrl+V sur Facebook) & téléchargée !' : '📋 Poster copied to clipboard (Ctrl+V on Facebook) & downloaded!')
      : (isFr ? '📥 Affiche PNG téléchargée !' : '📥 Poster PNG downloaded!'),
    'fanfare'
  );
}
window.copyAndDownloadViralPromoPoster = copyAndDownloadViralPromoPoster;

function renderViralPromoTemplatesList() {
  const box = document.getElementById('viralPromoTemplatesBox');
  const catBar = document.getElementById('viralPromoCatFilterBar');
  if (!box) return;
  const lang = REMO_I18N.getLang();
  const isFr = lang === 'fr';
  const sorted = getSortedCitiesLeaderboard();
  const selCityId = document.getElementById('promoStudioCitySelect')?.value || 'montreal';
  const destMode = document.getElementById('promoStudioDestSelect')?.value || 'home';
  const focusIdx = Math.max(0, sorted.findIndex((x) => x.city.id === selCityId));
  const focusEntry = sorted[focusIdx] || sorted[0];
  const rivalEntry = sorted[focusIdx === 0 ? 1 : focusIdx - 1] || sorted[0];

  const cName = getCityName(focusEntry.city, lang);
  const rName = getCityName(rivalEntry.city, lang);
  const rank = focusIdx + 1;
  const diffPts = Math.max(10, Math.abs(rivalEntry.pts - focusEntry.pts));
  const u = REMO_STORE.getCurrentUser();
  const inviteCode = (u && u.referralCode) ? u.referralCode : 'REMO2026';

  const prefix = isFr ? 'fr/' : '';
  const queryTail = `?ref=${encodeURIComponent(inviteCode)}&city=${encodeURIComponent(focusEntry.city.id)}&promo=vip150`;
  const urlMap = {
    home: `https://remoworld.com/${queryTail}`,
    ranking: `https://remoworld.com/${prefix}world-ranking.html${queryTail}`,
    guess: `https://remoworld.com/${prefix}guess-the-city.html${queryTail}`,
    radio: `https://remoworld.com/${prefix}world-radio.html${queryTail}`,
    versus: `https://remoworld.com/${prefix}city-versus.html${queryTail}`
  };
  const targetUrl = urlMap[destMode] || urlMap.home;

  const categories = isFr ? [
    { id: 'all', label: '✨ Tous (16)' },
    { id: 'city', label: '🏙️ Villes & Diaspora (3)' },
    { id: 'duel', label: '⚔️ Duels de Villes (3)' },
    { id: 'guess', label: '🕵️ Quiz Photo (3)' },
    { id: 'radio', label: '📻 38 Radios Live (3)' },
    { id: 'gold', label: '🎟️ Ticket d’Or & Cartes (2)' },
    { id: 'short', label: '📲 TikTok / WhatsApp (2)' }
  ] : [
    { id: 'all', label: '✨ All (16)' },
    { id: 'city', label: '🏙️ City & Diaspora (3)' },
    { id: 'duel', label: '⚔️ City Duels (3)' },
    { id: 'guess', label: '🕵️ Photo Quiz (3)' },
    { id: 'radio', label: '📻 38 Live Radios (3)' },
    { id: 'gold', label: '🎟️ Gold & 4D Cards (2)' },
    { id: 'short', label: '📲 TikTok / WhatsApp (2)' }
  ];

  if (catBar) {
    catBar.innerHTML = categories.map((cat) => {
      const active = _viralPromoActiveCategory === cat.id;
      return `<button type="button" class="${active ? 'btn-cyber' : 'btn-ghost'}" style="padding:5px 10px;font-size:0.72rem;white-space:nowrap;font-weight:900;" onclick="setViralPromoCategory('${cat.id}')">${escapeHtmlStr(cat.label)}</button>`;
    }).join('');
  }

  _viralPromoTemplatesCache = isFr ? [
    // 1. CITY & DIASPORA (3)
    {
      cat: 'city',
      badge: '🏙️ 1. Groupes Facebook de Ville & Fierté Locale',
      text: `🔥 ALERTE FIERTÉ LOCALE : ${focusEntry.city.flag} ${cName} est actuellement #${rank} mondial dans le Classement Live des Villes 2026 (${focusEntry.pts.toLocaleString()} PTS) juste face à ${rivalEntry.city.flag} ${rName} ! 🌍\n🎁 Cliquez ici pour voter pour ${cName} en 5 secondes et recevoir un Coffre VIP gratuit de +150 🪙 : ${targetUrl}`,
      url: targetUrl
    },
    {
      cat: 'city',
      badge: '🏙️ 2. Groupes Expatriés & Diaspora (Appel à la Communauté)',
      text: `🌍 Combien de personnes de ${focusEntry.city.flag} ${cName} sont dans ce groupe ? Il nous manque seulement ${diffPts} PTS pour dépasser ${rivalEntry.city.flag} ${rName} dans la Coupe Mondiale des Villes 2026 !\n👉 Donnez +100 PTS gratuits à ${cName} et réclamez votre Passeport Citoyen (+150 🪙 offerts) : ${targetUrl}`,
      url: targetUrl
    },
    {
      cat: 'city',
      badge: '🏙️ 3. Découverte du Hub Officiel 4D de la Ville',
      text: `✨ On a créé le Hub 4D interactif pour les amoureux de ${focusEntry.city.flag} ${cName} : météo & heure en direct, radio locale, cartes 4D de collection et tchat entre citoyens !\n🎁 Entrez avec le code VIP ${inviteCode} pour recevoir +150 🪙 d'Or gratuits : ${targetUrl}`,
      url: targetUrl
    },
    // 2. CITY DUELS (3)
    {
      cat: 'duel',
      badge: '⚔️ 4. Duel Explosif entre 2 Villes (Provocation Amicale)',
      text: `⚔️ DUEL EN DIRECT : ${focusEntry.city.flag} ${cName} vs ${rivalEntry.city.flag} ${rName} ! Quelle ville a la meilleure communauté en 2026 ? 🏆\nVotez gratuitement en 5 secondes (+100 PTS pour notre ville + +150 🪙 offerts) : ${targetUrl}`,
      url: targetUrl
    },
    {
      cat: 'duel',
      badge: '⚔️ 5. Alerte Urgence Classement (Mobilisation Éclair)',
      text: `🚨 ALERTE ${cName.toUpperCase()} : ${rivalEntry.city.flag} ${rName} est à seulement ${diffPts} PTS de nous au classement mondial ! On ne peut pas les laisser gagner aujourd'hui 💪\n🗳️ Cliquez ici pour ajouter +100 PTS à ${focusEntry.city.flag} ${cName} (+150 🪙 en cadeau) : ${targetUrl}`,
      url: targetUrl
    },
    {
      cat: 'duel',
      badge: '⚔️ 6. Comparateur Coût de la Vie, Sécurité & Vibe',
      text: `📊 Vous hésitez entre ${focusEntry.city.flag} ${cName} et ${rivalEntry.city.flag} ${rName} ? Comparez le coût de la vie, la sécurité, la gastronomie et votez dans le Duel Mondial 2026 !\n🎁 Bonus VIP de +150 🪙 inclus sur le lien : ${targetUrl}`,
      url: targetUrl
    },
    // 3. GUESS THE CITY PHOTO QUIZ (3)
    {
      cat: 'guess',
      badge: '🕵️ 7. Défi Viral "90% Échouent" (Très Fort Taux de Clic !)',
      text: `🕵️ DÉFI GÉOGRAPHIE : 90% des gens n'arrivent pas à deviner la 3e ville de ce quiz photo gratuit ! Combien de villes du monde pouvez-vous reconnaître d'un seul coup d'œil ? 🌍📸\n🎮 Jouez gratuitement dans le navigateur (+150 🪙 offerts) : ${targetUrl}`,
      url: targetUrl
    },
    {
      cat: 'guess',
      badge: '🕵️ 8. Quiz Voyageurs & Passionnés de Géographie (Reddit / FB)',
      text: `🌍 Vous pensez connaître les grandes capitales du monde ? Testez le jeu gratuit "Devine la Ville" sur REMO World — aucune inscription obligatoire et +150 🪙 de récompense VIP pour votre ville : ${targetUrl}`,
      url: targetUrl
    },
    {
      cat: 'guess',
      badge: '🕵️ 9. Défi Photo Mystère de Votre Ville',
      text: `📸 Un citoyen vient de publier une photo mystère de ${focusEntry.city.flag} ${cName} ! Les vrais habitants la reconnaissent en 3 secondes. Venez tester et gagner +150 🪙 : ${targetUrl}`,
      url: targetUrl
    },
    // 4. 38 LIVE RADIOS (3)
    {
      cat: 'radio',
      badge: '📻 10. 38 Radios du Monde en Direct (Pour Travailler / Conduire)',
      text: `📻 Écoutez gratuitement 38 Radios des Villes du Monde en direct (Montréal, Paris, Chișinău, Bucarest, Tokyo, New York, Londres) dans une console 4D sans publicité ! 🎶🌍\n🎁 +150 🪙 offerts en entrant par ce lien VIP : ${targetUrl}`,
      url: targetUrl
    },
    {
      cat: 'radio',
      badge: '📻 11. Voyage Sonore Nocturne & Lo-Fi Urbain',
      text: `🌙 Envie de voyager depuis votre salon ? Changez de ville en 1 clic et écoutez la radio live de ${focusEntry.city.flag} ${cName}, Paris ou Tokyo tout en explorant la carte 4D :\n👉 ${targetUrl}`,
      url: targetUrl
    },
    {
      cat: 'radio',
      badge: '🎤 12. Concours Musical REMO (60s) pour Artistes & DJ',
      text: `🎤 Artistes, DJ et créateurs de ${focusEntry.city.flag} ${cName} : représentez votre ville dans le Concours Musical Mondial REMO (extraits de 60s) ! Chaque vote rapporte +100 PTS à votre ville :\n🏆 Participez ou votez ici (+150 🪙 offerts) : ${targetUrl}`,
      url: targetUrl
    },
    // 5. GOLD SCRATCH & 4D CARDS (2)
    {
      cat: 'gold',
      badge: '🎟️ 13. Ticket à Gratter d’Or 24K Gratuit du Jour',
      text: `🎟️ Grattez gratuitement votre Ticket d'Or 24K du jour sur REMO World et gagnez entre +35 et +500 🪙 Pièces d'Or pour ${focusEntry.city.flag} ${cName} ! ✨\n🎁 +150 🪙 supplémentaires offerts avec ce lien d'invitation VIP : ${targetUrl}`,
      url: targetUrl
    },
    {
      cat: 'gold',
      badge: '🎴 14. Collection de Cartes Holographiques 4D & Diplôme d’Ambassadeur',
      text: `🏅 Devenez Ambassadeur Officiel de ${focusEntry.city.flag} ${cName}, téléchargez votre Diplôme 9:16 avec votre photo et ouvrez votre pack quotidien de Cartes 4D !\n🎁 Réclamez votre Coffre VIP (+150 🪙) : ${targetUrl}`,
      url: targetUrl
    },
    // 6. SHORT TIKTOK / WHATSAPP / TELEGRAM (2)
    {
      cat: 'short',
      badge: '📲 15. Légende Courte Punchy pour TikTok / Reels / Stories',
      text: `${focusEntry.city.flag} ${cName} est #${rank} mondial aujourd'hui sur REMO World ! 🏆 Rejoins notre ville et réclame +150 🪙 + 1 Carte 4D gratuite (Code : ${inviteCode}) 👉 ${targetUrl}`,
      url: targetUrl
    },
    {
      cat: 'short',
      badge: '🟢 16. Message Direct WhatsApp / Telegram / Messenger',
      text: `🎁 Salut ! Je t'envoie un Coffre VIP de +150 🪙 Pièces d'Or + 1 Carte de Ville 4D gratuite sur REMO World pour soutenir ${focusEntry.city.flag} ${cName} ! Ouvre ton cadeau en 5 secondes ici : ${targetUrl}`,
      url: targetUrl
    }
  ] : [
    // 1. CITY & DIASPORA (3)
    {
      cat: 'city',
      badge: '🏙️ 1. Facebook City & Local Pride Groups',
      text: `🔥 LIVE CITY RANKING ALERT: ${focusEntry.city.flag} ${cName} is currently #${rank} in the 2026 World Cities Live Standings (${focusEntry.pts.toLocaleString()} PTS) battling ${rivalEntry.city.flag} ${rName}! 🌍\n🎁 Tap here to vote for ${cName} in 5 seconds & claim a free +150 🪙 VIP Welcome Chest: ${targetUrl}`,
      url: targetUrl
    },
    {
      cat: 'city',
      badge: '🏙️ 2. Expat & Diaspora Community Rally Post',
      text: `🌍 How many people from ${focusEntry.city.flag} ${cName} are in this group? We only need ${diffPts} more PTS to overtake ${rivalEntry.city.flag} ${rName} in the 2026 World City Cup!\n👉 Cast a free +100 PTS vote for ${cName} & claim your Citizen Passport (+150 🪙 free gift): ${targetUrl}`,
      url: targetUrl
    },
    {
      cat: 'city',
      badge: '🏙️ 3. Official 4D City Hub & Live Community Showcase',
      text: `✨ We built a live 4D interactive hub for everyone who loves ${focusEntry.city.flag} ${cName}: live city radio, real-time weather, 4D collectible city cards & citizen chat!\n🎁 Enter with VIP code ${inviteCode} to claim +150 🪙 free Gold Coins: ${targetUrl}`,
      url: targetUrl
    },
    // 2. CITY DUELS (3)
    {
      cat: 'duel',
      badge: '⚔️ 4. City vs City Friendly Duel Provocation',
      text: `⚔️ LIVE CITY DUEL: ${focusEntry.city.flag} ${cName} vs ${rivalEntry.city.flag} ${rName}! Which city has the strongest community in 2026? 🏆\nVote for free in 5 seconds (+100 PTS for our city + +150 🪙 welcome gift): ${targetUrl}`,
      url: targetUrl
    },
    {
      cat: 'duel',
      badge: '⚔️ 5. Urgent Leaderboard Overtake Alert',
      text: `🚨 URGENT FOR ${cName.toUpperCase()}: ${rivalEntry.city.flag} ${rName} is only ${diffPts} PTS away from us on the live world leaderboard! Let's push ${cName} to #1 today 💪\n🗳️ Tap here to add +100 PTS for ${focusEntry.city.flag} ${cName} (+150 🪙 gift included): ${targetUrl}`,
      url: targetUrl
    },
    {
      cat: 'duel',
      badge: '⚔️ 6. Cost of Living, Safety & Culture Comparator',
      text: `📊 ${focusEntry.city.flag} ${cName} vs ${rivalEntry.city.flag} ${rName}: compare cost of living, safety, food scene & nightlife side-by-side and vote in the 2026 World City Cup!\n🎁 Free +150 🪙 VIP bonus included: ${targetUrl}`,
      url: targetUrl
    },
    // 3. GUESS THE CITY PHOTO QUIZ (3)
    {
      cat: 'guess',
      badge: '🕵️ 7. Viral "90% Fail" Geography Photo Challenge (High CTR!)',
      text: `🕵️ GEOGRAPHY CHALLENGE: 90% of people fail to guess the 3rd city in this free photo game! How many world cities can you recognize from a single photo? 🌍📸\n🎮 Play free in your browser (+150 🪙 VIP bonus): ${targetUrl}`,
      url: targetUrl
    },
    {
      cat: 'guess',
      badge: '🕵️ 8. Reddit / GeoGuessr / Travel Trivia Lovers Post',
      text: `🌍 Think you know the world's iconic skylines? Try the free "Guess The City" photo trivia on REMO World — instant browser play, no signup required, plus +150 🪙 free welcome gift: ${targetUrl}`,
      url: targetUrl
    },
    {
      cat: 'guess',
      badge: '🕵️ 9. Local Spotter Mystery Photo Challenge',
      text: `📸 Someone just posted a mystery street photo from ${focusEntry.city.flag} ${cName}! True locals recognize it in 3 seconds. Test your eye & claim +150 🪙 free: ${targetUrl}`,
      url: targetUrl
    },
    // 4. 38 LIVE RADIOS (3)
    {
      cat: 'radio',
      badge: '📻 10. 38 Live World City Radios (Work / Study / Drive)',
      text: `📻 Stream 38 Live World City Radios for free (Montréal, Paris, Chișinău, Bucharest, Tokyo, NYC, London) inside a sleek ad-free 4D console! 🎶🌍\n🎁 Claim +150 🪙 free VIP coins via this link: ${targetUrl}`,
      url: targetUrl
    },
    {
      cat: 'radio',
      badge: '📻 11. Night Drive & Global City Vibes Stream',
      text: `🌙 Want to travel the world from your desk or car? Switch between live radio stations in ${focusEntry.city.flag} ${cName}, Paris, Tokyo and 24 world cities in 1 click:\n👉 ${targetUrl}`,
      url: targetUrl
    },
    {
      cat: 'radio',
      badge: '🎤 12. REMO 60s World Music Contest for Artists & Fans',
      text: `🎤 Musicians, DJs & music fans from ${focusEntry.city.flag} ${cName}: represent your city in the REMO 60-Second World Music Contest! Every citizen vote adds +100 PTS to your city:\n🏆 Listen & vote here (+150 🪙 free gift): ${targetUrl}`,
      url: targetUrl
    },
    // 5. GOLD SCRATCH & 4D CARDS (2)
    {
      cat: 'gold',
      badge: '🎟️ 13. Free Daily 24K Golden City Scratch-Card',
      text: `🎟️ Scratch your free daily 24K Golden City Ticket on REMO World and win between +35 and +500 🪙 Gold Coins for ${focusEntry.city.flag} ${cName}! ✨\n🎁 Plus get an instant +150 🪙 VIP Welcome Chest here: ${targetUrl}`,
      url: targetUrl
    },
    {
      cat: 'gold',
      badge: '🎴 14. Official City Ambassador 9:16 Diploma & 4D Cards',
      text: `🏅 Become an Official Ambassador for ${focusEntry.city.flag} ${cName}, generate your personalized 9:16 Diploma with your photo, and open your free daily 4D City Card pack!\n🎁 Claim your +150 🪙 VIP Chest: ${targetUrl}`,
      url: targetUrl
    },
    // 6. SHORT TIKTOK / WHATSAPP / TELEGRAM (2)
    {
      cat: 'short',
      badge: '📲 15. Short Punchy Caption for TikTok / Insta & FB Stories',
      text: `${focusEntry.city.flag} ${cName} is #${rank} in the world today on REMO World! 🏆 Represent our city & claim +150 🪙 + 1 Free 4D City Card (Code: ${inviteCode}) 👉 ${targetUrl}`,
      url: targetUrl
    },
    {
      cat: 'short',
      badge: '🟢 16. WhatsApp / Telegram / Messenger Direct VIP Gift Invite',
      text: `🎁 Hey! I sent you a +150 🪙 Golden Welcome Chest + 1 Free 4D City Card on REMO World to help boost ${focusEntry.city.flag} ${cName}! Open your gift in 5 seconds here: ${targetUrl}`,
      url: targetUrl
    }
  ];

  const visibleTemplates = _viralPromoTemplatesCache
    .map((tpl, idx) => ({ tpl, idx }))
    .filter((item) => _viralPromoActiveCategory === 'all' || item.tpl.cat === _viralPromoActiveCategory);

  box.innerHTML = visibleTemplates.map(({ tpl, idx }) => `
    <div style="background:rgba(15,23,42,0.9);border:1px solid rgba(56,189,248,0.28);border-radius:12px;padding:10px;">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:6px;">
        <b style="font-size:0.76rem;color:#fde047;">${escapeHtmlStr(tpl.badge)}</b>
        <div style="display:flex;gap:5px;">
          <button type="button" class="adm-pbtn" style="border-color:#fbbf24;color:#fde047;font-weight:900;" onclick="copyViralPromoTemplateText(${idx}, 'copy')">
            📋 ${isFr ? 'Copier Texte' : 'Copy Text'}
          </button>
          <button type="button" class="adm-pbtn" style="border-color:#3b82f6;color:#93c5fd;" onclick="copyViralPromoTemplateText(${idx}, 'facebook')">
            📘 FB
          </button>
          <button type="button" class="adm-pbtn" style="border-color:#22c55e;color:#86efac;" onclick="copyViralPromoTemplateText(${idx}, 'whatsapp')">
            🟢 WA
          </button>
          <button type="button" class="adm-pbtn" style="border-color:#f97316;color:#fdba74;" onclick="copyViralPromoTemplateText(${idx}, 'reddit')">
            👽 Reddit
          </button>
        </div>
      </div>
      <div style="font-size:0.75rem;color:#e2e8f0;line-height:1.4;white-space:pre-wrap;background:rgba(5,8,22,0.65);padding:7px 9px;border-radius:8px;border:1px solid rgba(255,255,255,0.06);">${escapeHtmlStr(tpl.text)}</div>
    </div>
  `).join('');
}

async function copyViralPromoTemplateText(idx, platform = 'copy') {
  const isFr = REMO_I18N.getLang() === 'fr';
  const tpl = _viralPromoTemplatesCache[idx];
  if (!tpl) return;

  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(tpl.text);
    }
  } catch (e) {}

  if (typeof rewardViralShareWithDailyCap === 'function') {
    rewardViralShareWithDailyCap('promo_tpl_' + idx);
  }

  if (platform === 'facebook') {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(tpl.url)}&quote=${encodeURIComponent(tpl.text)}`, '_blank', 'noopener,noreferrer');
  } else if (platform === 'whatsapp') {
    window.open(`https://wa.me/?text=${encodeURIComponent(tpl.text)}`, '_blank', 'noopener,noreferrer');
  } else if (platform === 'reddit') {
    window.open(`https://www.reddit.com/submit?url=${encodeURIComponent(tpl.url)}&title=${encodeURIComponent(tpl.text.split('\n')[0])}`, '_blank', 'noopener,noreferrer');
  }

  remoToast(
    isFr
      ? '📋 Texte viral copié ! Collez-le (Ctrl+V) dans votre publication !'
      : '📋 Viral text copied! Paste it (Ctrl+V) into your post!',
    'fanfare'
  );
}
window.copyViralPromoTemplateText = copyViralPromoTemplateText;

if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    try {
      syncRemoOdysseyBadges();
      const params = new URLSearchParams(window.location.search);
      const openParam = params.get('open');
      if (openParam === 'odyssey' || openParam === 'games') {
        setTimeout(() => {
          openRemoOdysseyModal({
            seed: params.get('seed') || '',
            start: params.get('start') || params.get('city') || '',
            target: Number(params.get('target') || params.get('odyssey_score') || 0),
            vs: params.get('vs') || '',
            mode: params.get('mode') || ''
          });
        }, 380);
      } else if (params.get('contact') === '1') {
        setTimeout(() => openContactSupportModal(), 350);
      } else if (params.get('promo_studio') === '1') {
        setTimeout(() => openViralPromoStudioModal(), 450);
      } else if (params.get('ref') || params.get('invite') || params.get('promo')) {
        if (localStorage.getItem('remo_vip_invite_claimed') !== '1') {
          setTimeout(() => openVipInviteWelcomeModal(false), 550);
        }
      }

      // Realtime 60s countdown ticker for 24h boosted posts (in-place DOM update, no full feed rebuild)
      setInterval(() => {
        try {
          const feedEl = document.getElementById('view-feed');
          if (feedEl && feedEl.classList.contains('active') && typeof refreshLiveBoostBadgesInPlace === 'function') {
            refreshLiveBoostBadgesInPlace();
          }
        } catch (e) {}
      }, 60000);
    } catch (e) {}
  });
}
