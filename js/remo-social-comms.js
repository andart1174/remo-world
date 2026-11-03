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

  document.getElementById('mobileHubModal')?.classList.remove('open');

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

  // Admin God-Mode Header Pill & Navigation Links (Strictly visible ONLY when verified admin and PIN unlocked)
  const isAdmUser = REMO_STORE.isCurrentUserAdmin();
  const isAdmUnlocked = REMO_STORE.isAdminUnlocked();
  const showAdminControls = Boolean(isAdmUser && isAdmUnlocked);

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

  const mbHubAdmOffice = document.getElementById('mbHubAdminOfficeBtn');
  if (mbHubAdmOffice) {
    mbHubAdmOffice.style.display = showAdminControls ? 'inline-flex' : 'none';
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
  if (authBtn) {
    if (u && u.email && u.role !== 'guest' && u.name) {
      const hc = getCityById(u.homeCity) || { flag: '🌐' };
      authBtn.innerHTML = `${hc.flag} ${u.name}`;
      authBtn.onclick = () => switchRemoView('passport');
    } else {
      authBtn.innerHTML = `✨ ${t('btn_sign_in') || 'Sign In'}`;
      authBtn.onclick = () => openAuthModal();
    }
  }

  // Left Sidebar Home City Card + Live Local Clock & Weather
  const homeCard = document.getElementById('leftHomeCityBox');
  if (homeCard) {
    const hc = getCityById(u ? u.homeCity : 'montreal');
    const pts = st.cityScores[hc.id] || 1000;
    const wx = REMO_WEATHER.getCityLiveStatus(hc);
    const condTxt = lang === 'fr' ? wx.cond_fr : wx.cond_en;
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
        <button class="btn-ghost" onclick="switchRemoView('passport')">🛂</button>
      </div>
    `;
  }

  if (typeof updateUnreadBadges === 'function') updateUnreadBadges();
  renderRightSidebarWidgets();
}

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
      miniWar.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;margin-bottom:6px;">
          <b style="font-size:0.82rem;">⚔️ ${cA.flag} ${getCityName(cA, lang)} vs ${cB.flag} ${getCityName(cB, lang)}</b>
          <button type="button" class="war-backup-btn" style="padding:3px 8px;font-size:0.66rem;" onclick="shareCityWarBackup('${w.id}','${pA >= pB ? 'A' : 'B'}')">${t('war_backup_btn')}</button>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:0.72rem;font-weight:800;color:#cbd5e1;">
          <span>${cA.flag} ${pA}% (${vA.toLocaleString()})</span>
          <span>${cB.flag} ${pB}% (${vB.toLocaleString()})</span>
        </div>
        <div class="war-bar-track" style="height:10px;margin:5px 0;">
          <div class="war-bar-fill-a" style="width:${pA}%;transition:width 0.18s ease;"></div>
        </div>
        <div style="display:flex;gap:6px;margin-top:8px;">
          <button type="button" class="war-pulse-btn side-a" style="flex:1;padding:7px 6px;font-size:0.69rem;" onclick="voteCityWar('${w.id}','A',event)">${cA.flag} ${t('war_tap_btn')}</button>
          <button type="button" class="war-pulse-btn side-b" style="flex:1;padding:7px 6px;font-size:0.69rem;" onclick="voteCityWar('${w.id}','B',event)">${cB.flag} ${t('war_tap_btn')}</button>
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
  const p = (REMO_STORE.state.posts || []).find((x) => x && x.id === postId);
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
  }
}

function savePostCardToAlbum(postId) {
  const p = (REMO_STORE.state.posts || []).find((x) => x.id === postId);
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
  const p = (REMO_STORE.state.posts || []).find((x) => x.id === postId);
  if (!p || !p.versus) return;
  const v = p.versus;
  const lang = REMO_I18N.getLang();

  const now = Date.now();
  const endsAt = Number(v.endsAt || (p.createdAt ? p.createdAt + (v.durationHours || 24) * 3600000 : now + 86400000));
  if (v.closed || now >= endsAt) {
    v.closed = true;
    remoToast(t('versus_ended_toast'));
    renderSocialFeed();
    return;
  }

  const u = REMO_STORE.getCurrentUser() || REMO_STORE.ensureGuestOrCitizen('Citizen', '', 'montreal');
  let voterKey = (u && u.uid) ? u.uid : (localStorage.getItem('remo_guest_vid') || '');
  if (!voterKey) {
    voterKey = 'g_' + Date.now().toString(36);
    localStorage.setItem('remo_guest_vid', voterKey);
  }

  if (!Array.isArray(v.voters)) v.voters = [];
  if (v.voters.includes(voterKey) || localStorage.getItem('remo_versus_voted_' + p.id)) {
    remoToast(t('versus_already_voted'));
    return;
  }

  v.voters.push(voterKey);
  if (!v.voterSides) v.voterSides = {};
  v.voterSides[voterKey] = choice;
  localStorage.setItem('remo_versus_voted_' + p.id, '1');
  localStorage.setItem('remo_versus_side_' + p.id, choice);

  if (choice === 'left') {
    v.leftVotes = (v.leftVotes || 0) + 1;
    REMO_STORE.addCityScore(v.leftCityId || 'montreal', 50);
  } else {
    v.rightVotes = (v.rightVotes || 0) + 1;
    REMO_STORE.addCityScore(v.rightCityId || 'paris', 50);
  }

  if (u && u.uid) {
    REMO_STORE.addCoins(u.uid, 10, 10);
  }
  REMO_STORE.save(true, 'versus_vote');
  spawnRemoCoinsFX(10);
  RemoAudio.play('coin');
  try { if (navigator.vibrate) navigator.vibrate(15); } catch (e) {}

  const chosenCity = getCityById(choice === 'left' ? v.leftCityId : v.rightCityId);
  remoToast(t('versus_voted_toast', { city: getCityName(chosenCity, lang) }), 'coin');
  renderSocialFeed();
}
window.voteCityVersusDuel = voteCityVersusDuel;

function claimVersusVictoryBonus(postId, ev) {
  if (ev) ev.stopPropagation();
  const p = (REMO_STORE.state.posts || []).find((x) => x.id === postId);
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
  REMO_STORE.save(true, 'versus_claim_bonus');
  spawnRemoCoinsFX(20);
  RemoAudio.play('fanfare');
  remoToast(t('versus_bonus_claimed_toast'), 'fanfare');
  renderSocialFeed();
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
  REMO_STORE.save(true, 'admin_conclude_duel');
  renderSocialFeed();
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
    REMO_STORE.save(true, 'bounty_feed_claimed');
    spawnRemoCoinsFX(20);
    RemoAudio.play('fanfare');
    remoToast(t('bounty_feed_success', { coins: b.coins }), 'fanfare');
    renderSocialFeed();
  } else {
    RemoAudio.play('hit');
    remoToast(t('bounty_feed_wrong'));
  }
}

function handleVersusMediaSelect(side, ev) {
  const file = ev.target.files && ev.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    pendingVersusMedia[side] = e.target.result;
    const prev = document.getElementById(side === 'left' ? 'versusLeftPreview' : 'versusRightPreview');
    if (prev) {
      prev.style.display = 'block';
      prev.innerHTML = `<img src="${e.target.result}" style="width:100%;height:100%;object-fit:cover;">`;
    }
  };
  reader.readAsDataURL(file);
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

  const leftVotes = Number(v.leftVotes || 0);
  const rightVotes = Number(v.rightVotes || 0);
  const total = leftVotes + rightVotes;
  const pA = total > 0 ? Math.round((leftVotes / total) * 100) : 50;
  const pB = 100 - pA;
  const leftSrc = v.leftMedia || generateCityPostVisualDataUrl(cA.id, getCityName(cA, 'en'));
  const rightSrc = v.rightMedia || generateCityPostVisualDataUrl(cB.id, getCityName(cB, 'en'));

  const now = Date.now();
  const endsAt = Number(v.endsAt || (p.createdAt ? p.createdAt + (v.durationHours || 24) * 3600000 : now + 86400000));
  const isExpired = Boolean(v.closed) || (now >= endsAt);

  const u = (REMO_STORE && REMO_STORE.getCurrentUser) ? REMO_STORE.getCurrentUser() : null;
  const voterKey = (u && u.uid) ? u.uid : (localStorage.getItem('remo_guest_vid') || '');
  const hasVoted = Boolean(
    (voterKey && Array.isArray(v.voters) && v.voters.includes(voterKey)) ||
    localStorage.getItem('remo_versus_voted_' + p.id)
  );
  const votedSide = (v.voterSides && voterKey && v.voterSides[voterKey]) || localStorage.getItem('remo_versus_side_' + p.id) || '';

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
    ? `✓ ${t('versus_you_voted_side')} · ${cA.flag} ${cA.code} (${pA}%)`
    : (hasVoted || isExpired ? `${cA.flag} ${cA.code} (${pA}%)` : `🗳️ ${cA.flag} ${cA.code} (${pA}%)`);

  const rightPillText = votedSide === 'right'
    ? `✓ ${t('versus_you_voted_side')} · ${cB.flag} ${cB.code} (${pB}%)`
    : (hasVoted || isExpired ? `${cB.flag} ${cB.code} (${pB}%)` : `🗳️ ${cB.flag} ${cB.code} (${pB}%)`);

  return `
    <div class="city-versus-stage ${isExpired ? 'finished' : ''}">
      ${topBarHtml}
      <div class="versus-pane left ${votedSide === 'left' ? 'voted' : ''} ${isLeftWinner ? 'winner' : ''}" onclick="voteCityVersusDuel('${p.id}', 'left', event)">
        <img src="${leftSrc}" alt="${nameA}">
        <div class="versus-city-pill left ${votedSide === 'left' ? 'active' : ''}">${leftPillText}</div>
      </div>
      <div class="versus-bolt-divider">
        <div class="versus-bolt-badge">⚡</div>
      </div>
      <div class="versus-pane right ${votedSide === 'right' ? 'voted' : ''} ${isRightWinner ? 'winner' : ''}" onclick="voteCityVersusDuel('${p.id}', 'right', event)">
        <img src="${rightSrc}" alt="${nameB}">
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
          <div class="avatar-circle ${cosm.frameClass}" style="width:28px;height:28px;font-size:0.75rem;">${escapeHtmlStr((p.authorName || 'R')[0].toUpperCase())}</div>
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
    const stories = REMO_STORE.state.stories || [];
    bar.innerHTML = `
      <div class="story-pill" onclick="openStoryUploadPrompt()">
        <div class="story-ring" style="background:rgba(99,102,241,0.4);">
          <div class="story-ring-inner">+</div>
        </div>
        <div class="story-lbl">${t('stories_add')}</div>
      </div>
      <div class="story-pill" onclick="openLiveStreamModal()">
        <div class="story-ring" style="background:linear-gradient(135deg,#f43f5e,#f59e0b);">
          <div class="story-ring-inner">🔴</div>
        </div>
        <div class="story-lbl">${t('stories_live')}</div>
      </div>
      ${stories.map((s) => {
        const c = getCityById(s.cityId);
        return `
          <div class="story-pill" onclick="openStoryViewer('${s.id}')">
            <div class="story-ring">
              <div class="story-ring-inner">${c.flag}</div>
            </div>
            <div class="story-lbl">${s.author}</div>
          </div>
        `;
      }).join('')}
    `;
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
  const lang = REMO_I18N.getLang();
  const u = REMO_STORE.getCurrentUser();
  const allCities = getRemoCities();

  // Prioritize active 2X Weather Surge cities, user's Home City, community cities, and top capitals
  const ordered = allCities.slice().sort((a, b) => {
    const wA = REMO_WEATHER.getCityLiveStatus(a).isSurge ? 1 : 0;
    const wB = REMO_WEATHER.getCityLiveStatus(b).isSurge ? 1 : 0;
    if (wB !== wA) return wB - wA;
    if (u && a.id === u.homeCity) return -1;
    if (u && b.id === u.homeCity) return 1;
    return 0;
  });

  ticker.innerHTML =
    `<span style="flex-shrink:0;font-size:0.68rem;font-weight:900;color:#38bdf8;letter-spacing:0.6px;padding-right:4px;">${t('weather_bar_lbl')}:</span>` +
    ordered.map((c) => {
      const wx = REMO_WEATHER.getCityLiveStatus(c);
      return `
        <button type="button" class="weather-chip ${wx.isSurge ? 'surge' : ''}" onclick="filterFeedByCityFromMap('${c.id}')" title="${escapeHtmlStr(getCityName(c, lang))} — ${escapeHtmlStr(lang === 'fr' ? wx.cond_fr : wx.cond_en)}">
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
    .replace(/"/g, '&quot;');
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

function renderSinglePaneMedia(item, cityObj, lang) {
  const flt = item.photoFilter || 'flt-none';
  if (item.mediaType === 'html_app' && item.htmlCode) {
    return `<iframe sandbox="allow-scripts" loading="lazy" srcdoc="${escapeSrcDocAttr(item.htmlCode)}"></iframe>`;
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
      item._cachedArt = generateCityPostVisualDataUrl(cityObj.id, item.visualHeadline, item.visualSub);
    }
    src = item._cachedArt;
  }
  return `<img src="${src}" ${idbTag} class="${flt}" alt="${getCityName(cityObj, lang)}">`;
}

function renderPostMediaStage(p, city, lang) {
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

  // 0C. 🎛️ REMO BEAT-PAD 4D SEQUENCER LOOP
  if (p.mediaType === 'beat_loop' && p.beatPattern && typeof renderBeatPostStage === 'function') {
    return renderBeatPostStage(p, city, lang);
  }

  // 1. LIVE INTERACTIVE HTML / 3D MINI-APP
  if (p.mediaType === 'html_app' && p.htmlCode) {
    const cleanCode = buildFittedHtmlSrcdoc(p.htmlCode, p.id);
    return `
      <iframe class="html-post-frame" id="htmlFrame_${p.id}" sandbox="allow-scripts" loading="lazy" scrolling="no" srcdoc="${escapeSrcDocAttr(cleanCode)}" style="width:100%;height:100%;border:none;border-radius:12px;background:#050816;overflow:hidden;"></iframe>
    `;
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
          ${isAdm ? `<button type="button" class="adm-pbtn danger" style="margin-top:10px;padding:6px 14px;font-size:0.8rem;" onclick="adminDeletePostInline('${p.id}')">🗑️ Supprimer définitivement</button>` : ''}
        </div>
      `;
    }
    return `<video src="${resolved}" ${idbAttr} ${cap60Attr} controls playsinline preload="metadata" style="width:100%;max-height:480px;border-radius:12px;background:#050816;object-fit:cover;"></video>`;
  }

  // 3. INTERACTIVE BEFORE / AFTER 2-PHOTO COMPARISON SLIDER
  if (p.mediaType === 'before_after' && Array.isArray(p.mediaUrls) && p.mediaUrls.length >= 2) {
    const k1 = p.mediaUrls[0], k2 = p.mediaUrls[1];
    const u1 = RemoMediaDB.resolveSyncOrPlaceholder(k1);
    const u2 = RemoMediaDB.resolveSyncOrPlaceholder(k2);
    return `
      <div class="ba-slider-box">
        <img src="${u1}" ${String(k1).startsWith('idb://') ? `data-idb-src="${k1}"` : ''} class="${flt}" alt="Before">
        <div class="ba-after-layer">
          <img src="${u2}" ${String(k2).startsWith('idb://') ? `data-idb-src="${k2}"` : ''} class="${flt}" alt="After">
        </div>
        <div class="ba-divider-line"><div class="ba-knob">◀ ▶</div></div>
        <input type="range" min="3" max="97" value="50" class="ba-range-input" oninput="updateBeforeAfterSlider(this)">
      </div>
    `;
  }

  // 4. MULTI-PHOTO CAROUSEL (2–4 PHOTOS)
  if (p.mediaType === 'carousel' && Array.isArray(p.mediaUrls) && p.mediaUrls.length > 1) {
    const idx = (_carouselState[p.id] || 0) % p.mediaUrls.length;
    const curKey = p.mediaUrls[idx];
    let curUrl = RemoMediaDB.resolveSyncOrPlaceholder(curKey);
    if (!curUrl || curUrl.startsWith('idb://')) {
      curUrl = (curKey && (curKey.startsWith('data:') || curKey.startsWith('http')))
        ? curKey
        : (p._cachedArt || generateCityPostVisualDataUrl(city.id, p.visualHeadline, p.visualSub));
    }
    return `
      <div style="position:relative;width:100%;height:100%;touch-action:pan-y;" ontouchstart="initCarouselTouchSwipe(this, '${p.id}')">
        <img src="${curUrl}" class="carousel-slide-img ${flt}" alt="${getCityName(city, lang)}" style="width:100%;height:100%;object-fit:cover;transition:opacity 0.2s ease;">
        <button type="button" class="carousel-nav-btn prev" onclick="stepPostCarousel('${p.id}', -1, event)" title="Précédent">‹</button>
        <button type="button" class="carousel-nav-btn next" onclick="stepPostCarousel('${p.id}', 1, event)" title="Suivant">›</button>
        <div class="carousel-dots">
          ${p.mediaUrls.map((_, i) => `<span class="carousel-dot ${i === idx ? 'active' : ''}" onclick="setPostCarouselIndex('${p.id}', ${i}, event)"></span>`).join('')}
        </div>
        <div class="carousel-count-pill" style="position:absolute;top:10px;right:10px;background:rgba(6,10,24,0.78);backdrop-filter:blur(6px);color:#fff;font-size:0.72rem;font-weight:900;padding:3px 9px;border-radius:99px;border:1px solid rgba(255,255,255,0.22);pointer-events:none;z-index:6;">
          🎠 ${idx + 1}/${p.mediaUrls.length}
        </div>
      </div>
    `;
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
      p._cachedArt = generateCityPostVisualDataUrl(city.id, p.visualHeadline, p.visualSub);
    }
    mediaSrc = p._cachedArt;
  }
  return `<img src="${mediaSrc}" ${idbTag} class="${flt}" alt="${getCityName(city, lang)}" style="width:100%;height:100%;object-fit:cover;">`;
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
        <button type="button" class="adm-pbtn danger" onclick="adminDeletePostInline('${p.id}')">${t('adm_bar_delete')}</button>
        <button type="button" class="adm-pbtn gold" onclick="adminPinPostInline('${p.id}')">${p.pinned ? t('adm_bar_unpin') : t('adm_bar_pin')}</button>
        ${sealed ? `<button type="button" class="adm-pbtn gold" onclick="adminUnsealCapsuleNow('${p.id}')">${t('capsule_adm_unseal')}</button>` : ''}
        ${sealed ? `<button type="button" class="adm-pbtn" onclick="adminToggleCapsuleXray('${p.id}')">${t('capsule_adm_xray')}</button>` : ''}
        <button type="button" class="adm-pbtn gold" onclick="adminAwardFounderCrown('${p.id}')">${t('adm_bar_award')}</button>
        <button type="button" class="adm-pbtn" onclick="openAdminQuickModal('${p.uid || ''}')">${t('adm_bar_coins')}</button>
        <button type="button" class="adm-pbtn" onclick="adminEditPostInline('${p.id}')">${t('adm_bar_edit')}</button>
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
  const sub = lang === 'fr' ? 'Une fenêtre ouverte sur le monde' : 'Live window across the world';

  return `
    <div class="city-distance-bridge" title="${sub}">
      <span class="bridge-plane">✈️</span>
      <span class="bridge-route"><b>${postCity.flag} ${getCityName(postCity, lang)}</b> ➔ <b>${viewerCity.flag} ${getCityName(viewerCity, lang)}</b></span>
      <span class="bridge-km">(${km.toLocaleString()} km)</span>
      <button type="button" class="bridge-ticket-btn" onclick="openBoardingPassModal('${viewerCity.id}', '${postCity.id}')" title="${lang === 'fr' ? 'Générer Billet 4D' : 'Generate 4D Boarding Pass'}">🎫 ${lang === 'fr' ? 'Billet 4D' : '4D Ticket'}</button>
    </div>
  `;
}

function renderSocialFeed(searchQuery = '') {
  renderStoriesAndBanners();
  const grid = document.getElementById('remoPostsGrid');
  if (!grid) return;

  const lang = REMO_I18N.getLang();
  const u = REMO_STORE.getCurrentUser();
  const isAdm = REMO_STORE.isAdminUnlocked();
  let posts = (REMO_STORE.state.posts || []).slice();

  // Official Pinned posts float #1, then Boosted posts, then newest
  posts.sort((a, b) =>
    (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) ||
    (b.boosted ? 1 : 0) - (a.boosted ? 1 : 0) ||
    b.createdAt - a.createdAt
  );

  if (currentFeedMode === 'following') {
    const myFollowing = (u && Array.isArray(u.following)) ? u.following : [];
    posts = posts.filter((p) => p && myFollowing.includes(p.uid));
  } else if (currentFeedMode === 'mystery') {
    posts = posts.filter((p) => Boolean(p && p.mysteryCity));
  } else if (currentFeedMode === 'beats') {
    posts = posts.filter((p) => p && p.mediaType === 'beat_loop');
  } else if (currentFeedMode === 'duets') {
    posts = posts.filter((p) => Boolean(p.duetOf || p.mediaType === 'city_versus'));
  } else if (currentFeedMode === 'bounties') {
    posts = posts.filter((p) => Boolean(p.bounty));
  } else if (currentFeedMode === 'capsules') {
    posts = posts.filter((p) => p.wasTimeCapsule || Boolean(p.unlockAt));
  } else if (currentFeedMode === 'html') {
    posts = posts.filter((p) => p.mediaType === 'html_app');
  } else if (currentFeedMode === 'videos') {
    posts = posts.filter((p) => p.mediaType === 'video');
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
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    posts = posts.filter((p) =>
      (p.caption_en || '').toLowerCase().includes(q) ||
      (p.caption_fr || '').toLowerCase().includes(q) ||
      (p.authorName || '').toLowerCase().includes(q) ||
      (p.cityId || '').toLowerCase().includes(q)
    );
  }

  if (posts.length === 0) {
    grid.innerHTML = `<div class="glass-box" style="grid-column:1/-1;text-align:center;padding:40px;">
      ${lang === 'fr' ? 'Aucun moment trouvé pour ce filtre. Soyez le premier à publier ! ✨' : 'No moments match this filter yet. Be the first to post! ✨'}
    </div>`;
    return;
  }

  const EMOJIS = ['🔥', '⚡', '💎', '🤯', '👑'];

  grid.innerHTML = posts.map((p) => {
    try {
      if (!p || !p.id) return '';
      const city = getCityById(p.cityId) || getCityById('montreal') || { id: 'montreal', name_en: 'Montreal', name_fr: 'Montréal', flag: '⚜️', code: 'MTL' };
      const wx = (typeof REMO_WEATHER !== 'undefined' && REMO_WEATHER.getCityLiveStatus)
        ? (REMO_WEATHER.getCityLiveStatus(city) || { icon: '🌤️', tempC: 20, isSurge: false, timeStr: '12:00' })
        : { icon: '🌤️', tempC: 20, isSurge: false, timeStr: '12:00' };
      const sealed = isPostCapsuleSealed(p);
      const xray = isAdminXrayOpen(p.id);
      const hiddenByCapsule = sealed && !xray;
      const teaserTxt = lang === 'fr'
        ? (p.capsuleTeaser_fr || p.capsuleTeaser_en || 'Capsule mystère scellée...')
        : (p.capsuleTeaser_en || p.capsuleTeaser_fr || 'Mystery capsule sealed...');
      const rawCap = hiddenByCapsule
        ? `🔒 ${teaserTxt}`
        : (lang === 'fr' ? (p.caption_fr || p.caption_en) : (p.caption_en || p.caption_fr));
      const formattedCap = escapeHtmlStr(rawCap || '').replace(/#([\w\u00C0-\u024F]+)/g, `<span class="hashtag" onclick="renderSocialFeed('#$1')">#$1</span>`);
      const liked = u && (p.likes || []).includes(u.uid);
      const interactiveNoTilt = hiddenByCapsule || p.mediaType === 'html_app' || p.mediaType === 'before_after' || p.mediaType === 'beat_loop';
      const voiceResolved = p.voiceUrl ? RemoMediaDB.resolveSyncOrPlaceholder(p.voiceUrl) : '';
      const voiceIdbAttr = p.voiceUrl && String(p.voiceUrl).startsWith('idb://') ? `data-idb-src="${p.voiceUrl}"` : '';
      const rxMap = p.reactions || {};
      const cityMayor = (REMO_STORE && REMO_STORE.getCityMayor) ? REMO_STORE.getCityMayor(p.cityId) : null;
      const isMayor = cityMayor && cityMayor.uid === p.uid;
      const cosm = (REMO_STORE && REMO_STORE.getUserCosmetics) ? REMO_STORE.getUserCosmetics(p.uid) : { frameClass: '', title_fr: '', title_en: '' };
      const royalTitle = lang === 'fr' ? (cosm.title_fr || '') : (cosm.title_en || '');
      const dualPair = hiddenByCapsule
        ? { en: `🔒 ${p.capsuleTeaser_en || teaserTxt}`, fr: `🔒 ${p.capsuleTeaser_fr || teaserTxt}` }
        : buildPostBilingualPair(p);
      const isDualOpen = !!(window._openTranslatedPosts && window._openTranslatedPosts[p.id]);
      const isPostOwner = Boolean(u && (
        (p.uid && u.uid === p.uid) ||
        (p.authorUid && u.uid === p.authorUid) ||
        (u.email && p.authorEmail && u.email.toLowerCase() === p.authorEmail.toLowerCase()) ||
        (u.name && p.authorName && u.name.trim().toLowerCase() === p.authorName.trim().toLowerCase())
      ));
      const mysteryMasked = Boolean(p.mysteryCity && !isPostOwner && typeof isMysteryCityMaskedForViewer === 'function' && isMysteryCityMaskedForViewer(p, u));
      const cityTagLabel = mysteryMasked
        ? t('guess_masked_city')
        : `${city.flag || '🌍'} ${getCityName(city, lang)} · ${wx.icon || '🌤️'} ${wx.tempC ?? 20}°${wx.isSurge ? ' ⚡2X' : ''}`;

    return `
      <article id="post_card_${p.id}" class="post-card ${p.boosted || p.pinned || sealed ? 'boosted' : ''} ${p.mediaType === 'html_app' ? 'is-html-app' : ''}" ${interactiveNoTilt ? '' : 'onmousemove="applyHoloTilt(event, this)" onmouseleave="resetHoloTilt(this)"'}>
        <div class="post-head">
          <div style="display:flex;align-items:center;gap:6px;min-width:0;">
            <div class="post-author" style="cursor:pointer;" onclick="openCitizenProfileModal('${p.uid || ''}', '${escapeHtmlStr(p.authorName || '')}')" title="🪪 @${escapeHtmlStr(p.authorName)}">
              <div class="avatar-circle ${cosm.frameClass}">${escapeHtmlStr((p.authorName || 'R')[0].toUpperCase())}</div>
              <div>
                <div style="font-weight:800;font-size:0.88rem;display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                  <span>${escapeHtmlStr(p.authorName)}</span>
                  ${p.authorVerified ? '<span style="color:#38bdf8;">✓</span>' : ''}
                  ${!mysteryMasked && isMayor ? `<span class="mayor-tag">${t('mayor_badge')}</span>` : ''}
                  ${royalTitle ? `<span class="royal-title-pill">${escapeHtmlStr(royalTitle)}</span>` : ''}
                </div>
                <div style="font-size:0.72rem;color:var(--muted);margin-top:2px;">
                  ${mysteryMasked
                    ? `<span class="mystery-masked-tag">${t('guess_masked_city')}</span>`
                    : `<span>${city.flag} ${getCityName(city, lang)}</span> · <span>🕒 ${wx.timeStr}</span>`}
                  ${p.remixedFromAuthor ? ` · <span style="color:#34d399;">${t('post_remix_from')} @${escapeHtmlStr(p.remixedFromAuthor)}</span>` : ''}
                </div>
              </div>
            </div>
            ${(!isPostOwner && p.uid) ? `<button type="button" class="post-author-dm-mini" onclick="event.stopPropagation();openDirectChatWithUser('${p.uid || ''}')" title="💌 @${escapeHtmlStr(p.authorName)}">💌</button>` : ''}
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            ${mysteryMasked
              ? `<span class="city-tag" style="color:#fde047;border-color:rgba(251,191,36,0.45);">🕵️ ???</span>`
              : `<span class="city-tag" onclick="filterFeedByCityFromMap('${city.id}')">${wx.icon || '🌤️'} ${wx.tempC ?? 20}°${wx.isSurge ? ' ⚡2X' : ''}</span>`}
            <button type="button" class="post-more-dot-btn" onclick="openPostActionsSheet('${p.id}')" title="${lang === 'fr' ? 'Options de la publication' : 'Post options'}">⋯</button>
          </div>
        </div>

        <div class="post-media-wrap" id="post_media_${p.id}" ondblclick="handleMediaDoubleTap(event, '${p.id}', this)" ontouchstart="handleTouchDoubleTap(event, '${p.id}', this)">
          <div class="post-flip-container" id="post_flip_${p.id}">
            <div class="post-flip-inner">
              <div class="post-face-front">
                <div class="post-badges-top">
                  ${sealed ? `<span class="pbadge capsule">${t('capsule_locked_badge')}${xray ? ' · 👁️ X-RAY' : ''}</span>` : (p.wasTimeCapsule ? `<span class="pbadge unsealed">${t('capsule_unsealed_badge')}</span>` : '')}
                  ${p.duetOf || p.mediaType === 'city_versus' ? `<span class="pbadge duet">${t('post_duet_badge')}</span>` : ''}
                  ${p.isWorldWindow || (p.duetOf && p.duetOf.isWorldWindow) ? `<span class="window-live-badge">${t('win_badge_live')}</span>` : ''}
                  ${p.pinned ? `<span class="pbadge pinned">${t('post_pinned_badge')}</span>` : ''}
                  ${p.founderAward ? `<span class="pbadge founder">${t('post_founder_award_badge')}</span>` : ''}
                  ${p.boosted ? `<span class="pbadge boost">${t('post_boosted_badge')}</span>` : ''}
                  ${p.bounty && !p.bounty.claimed ? `<span class="pbadge boost" style="background:#f59e0b;color:#000;">🎁 +${p.bounty.coins} 🪙</span>` : ''}
                  
                  ${!hiddenByCapsule && p.mediaType === 'video' ? `<span class="pbadge vid60">${t('post_video60_badge')} · ${formatDurationMMSS(p.videoDuration || 60)}</span>` : ''}
                  ${!hiddenByCapsule && p.mediaType === 'beat_loop' ? `<span class="pbadge html">${t('beat_badge_live')}</span>` : ''}
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

        <!-- Modern Sleek Post Body -->
        <div class="post-body">
          ${mysteryMasked ? '' : getInterCityDistanceBridge(city, lang)}
          ${!hiddenByCapsule && typeof renderMysteryCityWidget === 'function' ? renderMysteryCityWidget(p, city, lang, u, isPostOwner) : ''}
          ${!hiddenByCapsule && !mysteryMasked && typeof renderWorldWindowActionsBar === 'function' ? renderWorldWindowActionsBar(p, lang) : ''}

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
            <button type="button" class="pact-btn pact-flip-btn" onclick="flipPost3DCard('${p.id}')" title="${t('post_3d_flip')}">
              🔄 <span>3D</span>
            </button>
            <button type="button" class="pact-btn pact-fs-btn" onclick="openPostFullscreenMedia('${p.id}')" title="${t('act_fullscreen')}">
              ⛶
            </button>
            <button type="button" class="pact-btn" onclick="sharePostLink('${p.id}')" title="${lang === 'fr' ? 'Partager le lien' : 'Share link'}">
              🔗
            </button>
            <button type="button" class="pact-btn pact-more-btn" onclick="openPostActionsSheet('${p.id}')" title="${lang === 'fr' ? 'Plus d’actions (Duo, Carte, Boost)' : 'More options'}">
              ⋯
            </button>
          </div>

          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-top:6px;">
            <div class="post-caption" style="flex:1;">${formattedCap}</div>
            <button type="button" class="translate-pill-btn ${isDualOpen ? 'active' : ''}" onclick="togglePostAutoTranslate('${p.id}')">${isDualOpen ? t('post_translate_hide') : t('post_translate_btn')}</button>
          </div>
          <div class="bilingual-dual-box ${isDualOpen ? 'open' : ''}">
            <div><b style="color:#38bdf8;">🇬🇧 EN:</b> ${escapeHtmlStr(dualPair.en)}</div>
            <div><b style="color:#fbbf24;">🇫🇷 FR:</b> ${escapeHtmlStr(dualPair.fr)}</div>
          </div>
          ${p.isSecretSpot ? `
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
            </div>
          ` : ''}
          ${renderFeedBountyWidget(p, lang)}
          ${hiddenByCapsule ? '' : renderPostPollWidget(p, lang, u)}
          ${hiddenByCapsule ? '' : renderSecretCapsuleWidget(p, lang, u)}
          ${hiddenByCapsule ? '' : renderViralGoalWidget(p, lang, isAdm)}
          ${!hiddenByCapsule && p.voiceUrl ? `<audio src="${voiceResolved}" ${voiceIdbAttr} controls style="width:100%;height:34px;margin-top:6px;"></audio>` : ''}
          ${!hiddenByCapsule && p.mediaType === 'html_app' ? renderHtmlGameLeaderboardWidget(p, lang, u) : ''}
        </div>

        <!-- Mobile TikTok Bottom-Left Info Overlay -->
        <div class="tiktok-overlay-info">
          ${renderAdminPostBar(p)}
          <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
            <span style="font-weight:900;font-size:0.98rem;cursor:pointer;" onclick="openCitizenProfileModal('${p.uid || ''}', '${escapeHtmlStr(p.authorName || '')}')">@${escapeHtmlStr(p.authorName)}</span>
            ${(!isPostOwner && p.uid) ? `<button type="button" class="post-author-dm-mini" onclick="event.stopPropagation();openDirectChatWithUser('${p.uid || ''}')">💌</button>` : ''}
            ${!mysteryMasked && isMayor ? `<span class="mayor-tag">${t('mayor_badge')}</span>` : ''}
            ${royalTitle ? `<span class="royal-title-pill">${escapeHtmlStr(royalTitle)}</span>` : ''}
            <span class="city-tag" onclick="${mysteryMasked ? '' : `filterFeedByCityFromMap('${city.id}')`}">${cityTagLabel}</span>
            <button type="button" class="translate-pill-btn ${isDualOpen ? 'active' : ''}" onclick="togglePostAutoTranslate('${p.id}')">${t('post_translate_btn')}</button>
          </div>
          <div style="font-size:0.86rem;line-height:1.4;color:#f1f5f9;">${formattedCap}</div>
          <div class="bilingual-dual-box ${isDualOpen ? 'open' : ''}">
            <div><b style="color:#38bdf8;">🇬🇧</b> ${escapeHtmlStr(dualPair.en)}</div>
            <div><b style="color:#fbbf24;">🇫🇷</b> ${escapeHtmlStr(dualPair.fr)}</div>
          </div>
          ${!hiddenByCapsule && typeof renderMysteryCityWidget === 'function' ? renderMysteryCityWidget(p, city, lang, u, isPostOwner) : ''}
          ${hiddenByCapsule ? '' : renderPostPollWidget(p, lang, u)}
          ${hiddenByCapsule ? '' : renderSecretCapsuleWidget(p, lang, u)}
          ${hiddenByCapsule ? '' : renderViralGoalWidget(p, lang, isAdm)}
          ${!hiddenByCapsule && p.voiceUrl ? `<audio src="${voiceResolved}" ${voiceIdbAttr} controls style="width:100%;height:32px;margin-top:4px;"></audio>` : ''}
        </div>

        <!-- Mobile TikTok Right Floating Rail -->
        <div class="tiktok-rail">
          <button class="tk-btn" onclick="toggleLikePost('${p.id}')">❤️<span class="tk-cnt">${(p.likes || []).length}</span></button>
          <button class="tk-btn" onclick="openCommentsModal('${p.id}')">💬<span class="tk-cnt">${(p.comments || []).length}</span></button>
          <button class="tk-btn" onclick="tipPostAuthor('${p.id}')">🪙<span class="tk-cnt">${p.tipsTotal || 0}</span></button>
          <button class="tk-btn" onclick="startCityDuetFromPost('${p.id}')" title="City Duet">🎭</button>
          <button class="tk-btn" onclick="sharePostLink('${p.id}')" title="${lang === 'fr' ? 'Partager' : 'Share'}">🔗</button>
          ${p.mediaType === 'html_app'
            ? `<button class="tk-btn" onclick="openHtmlFullscreenModal('${p.id}')" title="Fullscreen">⛶</button>`
            : `<button class="tk-btn" onclick="mintPostAsCityCard('${p.id}')" title="Mint Card">🎴</button>
               <button class="tk-btn" onclick="switchRemoView('arena')" title="Duel">⚔️</button>`}
          <div class="tk-disc" onclick="toggleHeaderRadio()">🎵</div>
          ${(isPostOwner || isAdm) ? `<button class="tk-btn" onclick="userDeleteOwnPost('${p.id}')" title="${lang === 'fr' ? 'Supprimer' : 'Delete'}" style="color:#f43f5e;">🗑️</button>` : ''}
        </div>
      </article>
    `;
    } catch (err) {
      console.warn('Post card render error:', p?.id, err);
      return '';
    }
  }).join('');

  // Asynchronously attach any IndexedDB video/photo/audio Blobs
  RemoMediaDB.hydrateDom(grid);
}

function applyHoloTilt(e, cardEl) {
  if (window.innerWidth <= 860) return;
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

  document.querySelectorAll('#feedModeChips .fchip').forEach((b) => b.classList.remove('active'));
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
  const p = REMO_STORE.state.posts.find((x) => x.id === postId);
  if (!p) return;
  p.likes = p.likes || [];
  const idx = p.likes.indexOf(u.uid);
  if (idx >= 0) {
    p.likes.splice(idx, 1);
  } else {
    p.likes.push(u.uid);
    RemoAudio.play('click');
    RemoAudio.haptic(15);
    REMO_STORE.addCityScore(p.cityId, 5);
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
  REMO_STORE.syncPostToCloud(p);
  REMO_STORE.save(true, 'like');
  renderSocialFeed();
}

function tipPostAuthor(postId) {
  const lang = REMO_I18N.getLang();
  const u = REMO_STORE.getCurrentUser();
  if (!u) { openAuthModal(); return; }
  const p = REMO_STORE.state.posts.find((x) => x.id === postId);
  if (!p) return;
  const amt = Number(prompt(lang === 'fr' ? 'Combien de Pièces REMO offrir ?' : 'How many REMO Coins to tip?', '25'));
  if (!amt || amt <= 0) return;
  if (!REMO_STORE.addCoins(u.uid, -amt, 10)) {
    remoToast(lang === 'fr' ? 'Pièces REMO insuffisantes !' : 'Not enough REMO Coins!');
    return;
  }
  p.tipsTotal = (p.tipsTotal || 0) + amt;
  if (p.duetOf && p.duetOf.uid) {
    const half = Math.ceil(amt / 2);
    if (p.uid) REMO_STORE.adminAdjustUserCoins(p.uid, 'add', half);
    REMO_STORE.adminAdjustUserCoins(p.duetOf.uid, 'add', amt - half);
    remoToast(
      lang === 'fr'
        ? `🎭 +${amt} 🪙 partagés 50/50 entre @${p.authorName} & @${p.duetOf.authorName} !`
        : `🎭 +${amt} 🪙 split 50/50 between @${p.authorName} & @${p.duetOf.authorName}!`,
      'fanfare'
    );
  } else {
    if (p.uid) REMO_STORE.adminAdjustUserCoins(p.uid, 'add', amt);
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
  renderSocialFeed();
}

function boostPost24h(postId) {
  const lang = REMO_I18N.getLang();
  const u = REMO_STORE.getCurrentUser();
  if (!u) { openAuthModal(); return; }
  const cost = REMO_STORE.state.settings.rewards.boostCost || 50;
  if (!REMO_STORE.addCoins(u.uid, -cost, 20)) {
    remoToast(lang === 'fr' ? `${cost} Pièces REMO requises pour booster !` : `${cost} REMO Coins needed to boost!`);
    return;
  }
  const p = REMO_STORE.state.posts.find((x) => x.id === postId);
  if (p) p.boosted = true;
  REMO_STORE.syncPostToCloud(p);
  REMO_STORE.save(true, 'boost');
  spawnRemoCoinsFX(6);
  renderSocialFeed();
  remoToast(lang === 'fr' ? '🚀 Publication boostée en tête du flux 24h !' : '🚀 Post boosted to top of feed for 24h!', 'fanfare');
}

function mintPostAsCityCard(postId) {
  const lang = REMO_I18N.getLang();
  const u = REMO_STORE.getCurrentUser() || REMO_STORE.ensureGuestOrCitizen('Creator', '', 'montreal');
  const p = REMO_STORE.state.posts.find((x) => x.id === postId);
  if (!p) return;
  const cost = REMO_STORE.state.settings.rewards.mintPostCardCost || 100;
  if (!REMO_STORE.addCoins(u.uid, -cost, 30)) {
    remoToast(lang === 'fr' ? `Il faut ${cost} 🪙 pour convertir en Carte 4D !` : `Need ${cost} 🪙 to mint as a 4D City Card!`);
    return;
  }
  p.mintedCard = true;
  const postPhoto = ['image', 'carousel', 'before_after'].includes(p.mediaType)
    ? (p.mediaUrl || (Array.isArray(p.mediaUrls) && p.mediaUrls[0]) || '')
    : '';
  const card = REMO_STORE.mintCardForUser(u.uid, p.cityId, 'Legendary Gold', !!p.verifiedGps, {
    subtitle: `MOMENT BY ${p.authorName.toUpperCase()}`,
    customPhotoDataUrl: postPhoto
  });
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
  const p = REMO_STORE.state.posts.find((x) => x.id === postId);
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
        return `<option value="${mc.cityId}|${mc.rarity || 'Mythic 4D'}">🎴 ${cc.flag} ${getCityName(cc, lang)} (${mc.rarity || '4D'})</option>`;
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
      return `
        <div class="${tip > 0 ? 'super-comment-card' : ''}" style="padding:10px 12px;border-radius:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);margin-bottom:8px;display:flex;justify-content:space-between;align-items:start;gap:8px;">
          <div style="flex:1;">
            <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
              <b style="color:#38bdf8;font-size:0.83rem;cursor:pointer;" onclick="document.getElementById('commentsModal').classList.remove('open');openDirectChatWithUser('${c.uid || ''}')">@${escapeHtmlStr(c.author)} 💌</b>
              ${tip > 0 ? `<span class="surge-mini-pill">💎 +${tip} 🪙 ${t('cmt_super_badge')}</span>` : ''}
            </div>
            ${c.text ? `<div style="font-size:0.86rem;margin-top:4px;color:#f8fafc;">${escapeHtmlStr(c.text)}</div>` : ''}
            ${altTxt && altTxt.toLowerCase() !== String(c.text || '').toLowerCase() ? `<div style="font-size:0.74rem;color:#94a3b8;margin-top:2px;">🌐 ${escapeHtmlStr(altTxt)}</div>` : ''}
            ${c.voiceUrl ? `<audio src="${vUrl}" ${vIdb} controls style="width:100%;height:30px;margin-top:5px;"></audio>` : ''}
            ${flexCity ? `
              <div>
                <button type="button" class="cmt-card-flex-pill" onclick="inspectCommentFlexCard('${flexCity.id}', '${escapeHtmlStr(c.flexCardRarity || 'Mythic 4D')}')">
                  🎴 ${flexCity.flag} ${escapeHtmlStr(getCityName(flexCity, lang))} · ${escapeHtmlStr(c.flexCardRarity || '4D')}
                </button>
              </div>
            ` : ''}
          </div>
          ${isAdm ? `<button type="button" class="adm-pbtn danger" onclick="adminDeleteCommentInline('${p.id}', '${c.id}')">🗑️</button>` : ''}
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
  const inp = document.getElementById('commentInputBox');
  const txt = inp ? inp.value.trim() : '';
  const tipAmt = Math.max(0, Number(document.getElementById('commentSuperTipSel')?.value || 0));
  const flexRaw = document.getElementById('commentCardFlexSelect')?.value || '';
  if (!activeCommentPostId || (!txt && !pendingCommentVoiceKey && !flexRaw)) return;

  const u = REMO_STORE.getCurrentUser() || REMO_STORE.ensureGuestOrCitizen('Citizen', '', 'montreal');
  const p = REMO_STORE.state.posts.find((x) => x.id === activeCommentPostId);
  if (!p) return;

  if (tipAmt > 0) {
    if (!REMO_STORE.addCoins(u.uid, -tipAmt, 10)) {
      remoToast(lang === 'fr' ? `Il faut ${tipAmt} 🪙 pour ce Super-Commentaire !` : `Need ${tipAmt} 🪙 for this Super-Comment!`);
      return;
    }
    p.tipsTotal = (p.tipsTotal || 0) + tipAmt;
    if (p.uid) REMO_STORE.adminAdjustUserCoins(p.uid, 'add', tipAmt);
    spawnRemoCoinsFX(10);
  } else {
    REMO_STORE.addCoins(u.uid, 5, 5);
  }

  const [flexCardCityId, flexCardRarity] = flexRaw ? flexRaw.split('|') : ['', ''];
  p.comments = p.comments || [];
  p.comments.push({
    id: 'c_' + Date.now(),
    uid: u.uid,
    author: u.name,
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
  if (ev && ev.target && ['IFRAME', 'INPUT', 'BUTTON'].includes(ev.target.tagName)) return;
  const heart = document.createElement('div');
  heart.className = 'dbl-heart-burst';
  heart.textContent = '❤️';
  wrapEl.appendChild(heart);
  setTimeout(() => heart.remove(), 800);

  const u = REMO_STORE.getCurrentUser() || REMO_STORE.ensureGuestOrCitizen('Citizen', '', 'montreal');
  const p = REMO_STORE.state.posts.find((x) => x.id === postId);
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

function sharePostLink(postId) {
  const lang = REMO_I18N.getLang();
  const post = (REMO_STORE.state.posts || []).find((p) => p.id === postId);
  const cleanId = encodeURIComponent(postId);
  let baseOrigin = (window.location && window.location.origin && window.location.origin !== 'null') ? window.location.origin : 'https://remoworld.com';
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    baseOrigin = 'https://remoworld.com';
  }
  const url = `${baseOrigin}/?post=${cleanId}#post_${cleanId}`;
  const title = post ? (lang === 'fr' ? (post.caption_fr || post.caption_en) : (post.caption_en || post.caption_fr)) : 'REMO World';

  if (navigator.share) {
    navigator.share({
      url: url
    }).then(() => {
      remoToast(lang === 'fr' ? '🔗 Lien partagé avec succès !' : '🔗 Link shared successfully!');
    }).catch(() => {
      copyPostUrlToClipboard(url, lang);
    });
  } else {
    copyPostUrlToClipboard(url, lang);
  }
}

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
  const p = REMO_STORE.state.posts.find((x) => x.id === postId);
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

function initCarouselTouchSwipe(el, postId) {
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
      if (dx < 0) {
        stepPostCarousel(postId, 1, e);
      } else {
        stepPostCarousel(postId, -1, e);
      }
    }
  }, { passive: true });
}
window.initCarouselTouchSwipe = initCarouselTouchSwipe;
window.setPostCarouselIndex = setPostCarouselIndex;

function updateBeforeAfterSlider(rangeInput) {
  const box = rangeInput.closest('.ba-slider-box');
  if (!box) return;
  const pct = Number(rangeInput.value) || 50;
  const afterLayer = box.querySelector('.ba-after-layer');
  const divider = box.querySelector('.ba-divider-line');
  if (afterLayer) afterLayer.style.clipPath = `inset(0 0 0 ${pct}%)`;
  if (divider) divider.style.left = `${pct}%`;
}

function voteOnPostPoll(postId, optIdx) {
  const lang = REMO_I18N.getLang();
  const u = REMO_STORE.getCurrentUser() || REMO_STORE.ensureGuestOrCitizen('Citizen', '', 'montreal');
  const p = REMO_STORE.state.posts.find((x) => x.id === postId);
  if (!p || !p.poll || !p.poll.options[optIdx]) return;
  p.poll.voters = p.poll.voters || [];
  if (p.poll.voters.includes(u.uid)) {
    remoToast(lang === 'fr' ? 'Vous avez déjà voté à ce sondage !' : 'You already voted on this poll!');
    return;
  }
  p.poll.voters.push(u.uid);
  p.poll.options[optIdx].votes = (p.poll.options[optIdx].votes || 0) + 1;
  REMO_STORE.addCoins(u.uid, 5, 5);
  REMO_STORE.save(true, 'poll_vote');
  renderSocialFeed();
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
  REMO_STORE.save(true, 'capsule_unlock');
  spawnRemoCoinsFX(6);
  renderSocialFeed();
  remoToast(
    lang === 'fr' ? '🔓 Capsule secrète débloquée !' : '🔓 Secret Creator Capsule unlocked!',
    'fanfare'
  );
}

function reactEmojiToPost(postId, emoji) {
  const u = REMO_STORE.getCurrentUser() || REMO_STORE.ensureGuestOrCitizen('Citizen', '', 'montreal');
  const p = REMO_STORE.state.posts.find((x) => x.id === postId);
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
  renderSocialFeed();
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
  activeCreateStudioTab = tabId;
  document.querySelectorAll('.studio-tab-btn').forEach((b) => {
    b.classList.toggle('active', b.getAttribute('data-studio-tab') === tabId);
  });
  document.querySelectorAll('.studio-pane').forEach((p) => p.classList.remove('active'));
  document.getElementById('studioPane-' + tabId)?.classList.add('active');
  if (tabId !== 'video') stopActiveCam60Stream();
  if (tabId !== 'beat' && window.RemoAudio && window.RemoAudio.activeBeatTargetId === 'studio_preview') {
    window.RemoAudio.stopBeatPattern();
  }
  if (tabId === 'beat' && typeof renderBeatStudioMatrix === 'function') {
    renderBeatStudioMatrix();
  }

  if (tabId === 'versus') {
    const leftSel = document.getElementById('createVersusLeftCity');
    const rightSel = document.getElementById('createVersusRightCity');
    const cities = getRemoCities();
    const lang = REMO_I18N.getLang();
    if (leftSel && (!leftSel.children || !leftSel.children.length)) {
      leftSel.innerHTML = cities.map((c) => `<option value="${c.id}">${c.flag} ${getCityName(c, lang)}</option>`).join('');
      leftSel.value = 'montreal';
    }
    if (rightSel && (!rightSel.children || !rightSel.children.length)) {
      rightSel.innerHTML = cities.map((c) => `<option value="${c.id}">${c.flag} ${getCityName(c, lang)}</option>`).join('');
      rightSel.value = 'paris';
    }
  }
}

function openCreatePostModal(prefillTag = '') {
  stopActiveCam60Stream();
  pendingStudioPhotoBlobs = [];
  pendingStudioPhotoPreviewUrls.forEach((u) => URL.revokeObjectURL(u));
  pendingStudioPhotoPreviewUrls = [];
  pendingStudioPhotoFilter = 'flt-none';
  pendingStudioVideoBlob = null;
  pendingStudioVideoDuration = 0;
  pendingRawLongVideoFile = null;
  window._pendingEnforce60sCap = false;
  pendingRemixParent = null;
  pendingPostMediaDataUrl = '';
  pendingPostVoiceBlob = null;
  pendingPostVoiceDataUrl = '';
  pendingPostGpsVerified = false;

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
  if (!isAdm && activeCreateStudioTab === 'versus') {
    switchCreateStudioTab('photo');
  }

  const htmlArea = document.getElementById('createHtmlCodeArea');
  if (htmlArea) {
    if (isAdm && !htmlArea.value.trim()) {
      htmlArea.value = REMO_HTML_TEMPLATES.fireworks;
    } else if (!isAdm) {
      htmlArea.value = '';
    }
  }

  // Reset Poll, Secret Capsule & Viral Goal toggles
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

/* ── TAB 2: 60s Video Studio Handlers (Strict <= 60s Check + Live Camera 60s Recorder) ── */
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

async function publishNewRemoPost() {
  const lang = REMO_I18N.getLang();
  const cityId = document.getElementById('createCitySelect')?.value || 'montreal';
  const vibe = document.getElementById('createVibeSelect')?.value || 'energy';
  let cap = document.getElementById('createCaptionInp')?.value.trim() || '';

  if (!cap && activeCreateStudioTab === 'beat') {
    const cObj = getCityById(cityId);
    cap = lang === 'fr'
      ? `🎛️ Beat Urbain 4D composé à ${getCityName(cObj, 'fr')} ! #RemoBeat`
      : `🎛️ 4D City Beat Loop composed in ${getCityName(cObj, 'en')}! #RemoBeat`;
  }

  if (!cap) {
    remoToast(lang === 'fr' ? 'Ajoutez une légende à votre publication !' : 'Please write a caption for your post!');
    return;
  }

  const isMysteryCity = Boolean(document.getElementById('createMysteryCityToggle')?.checked) && !pendingDuetParent;
  const wantWindowStamp = Boolean(document.getElementById('createWindowStampToggle')?.checked) && !isMysteryCity;

  let mediaType = 'city_art';
  let mediaUrl = '';
  let mediaUrls = [];
  let htmlCode = '';
  let videoDuration = 0;
  let beatPatternObj = null;
  let soundtrackId = '';

  if (activeCreateStudioTab === 'photo') {
    soundtrackId = document.getElementById('createPhotoSoundSelect')?.value || '';
    if (pendingStudioPhotoBlobs.length > 0) {
      for (const rawBlob of pendingStudioPhotoBlobs) {
        const blob = (wantWindowStamp && typeof stampPhotoWithLiveCityWindow === 'function')
          ? await stampPhotoWithLiveCityWindow(rawBlob, cityId, lang)
          : rawBlob;
        const url = await uploadMediaToCloudOrDataUrl(blob, 'posts');
        mediaUrls.push(url);
      }
      const wantBeforeAfter = pendingStudioPhotoBlobs.length === 2 && document.getElementById('studioCompareToggle')?.checked;
      if (wantBeforeAfter) {
        mediaType = 'before_after';
        mediaUrl = mediaUrls[0];
      } else if (mediaUrls.length > 1) {
        mediaType = 'carousel';
        mediaUrl = mediaUrls[0];
      } else {
        mediaType = 'image';
        mediaUrl = mediaUrls[0];
      }
    }
  } else if (activeCreateStudioTab === 'beat') {
    if (typeof getStudioBeatPatternSnapshot === 'function') {
      beatPatternObj = getStudioBeatPatternSnapshot();
    }
    const activeCells = beatPatternObj && Array.isArray(beatPatternObj.rows)
      ? beatPatternObj.rows.reduce((sum, r) => sum + r.filter(Boolean).length, 0)
      : 0;
    if (!activeCells) {
      remoToast(t('beat_empty_err'));
      return;
    }
    mediaType = 'beat_loop';
    if (window.RemoAudio && window.RemoAudio.activeBeatTargetId === 'studio_preview') {
      window.RemoAudio.stopBeatPattern();
    }
  } else if (activeCreateStudioTab === 'video') {
    if (!pendingStudioVideoBlob) {
      remoToast(lang === 'fr' ? 'Importez ou filmez une vidéo de 60s maximum !' : 'Please upload or record a video (max 60s)!');
      return;
    }
    remoToast(lang === 'fr' ? '⏳ Téléversement vidéo vers le Cloud REMO...' : '⏳ Uploading video to REMO Cloud...', 'coin');
    mediaType = 'video';
    mediaUrl = await uploadMediaToCloudOrDataUrl(pendingStudioVideoBlob, 'posts');
    videoDuration = pendingStudioVideoDuration || 60;
  } else if (activeCreateStudioTab === 'html') {
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
    voiceKey = await RemoMediaDB.saveBlob(pendingPostVoiceBlob, 'voice');
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
  const autoPair = REMO_TRANSLATOR.makeBilingualPair(cap);
  const finalEn = (drawerEl && drawerEl.style.display !== 'none' && enBoxVal) ? enBoxVal : (autoPair.en || cap);
  const finalFr = (drawerEl && drawerEl.style.display !== 'none' && frBoxVal) ? frBoxVal : (autoPair.fr || cap);
  if (drawerEl) drawerEl.style.display = 'none';

  const isSecretSpot = Boolean(document.getElementById('createSecretSpotToggle')?.checked);
  const rawSpotTitle = document.getElementById('createSecretSpotTitleInp')?.value.trim() || '';
  const rawSpotClue = document.getElementById('createSecretSpotClueInp')?.value.trim() || '';

  const newPost = {
    id: 'post_' + Date.now(),
    uid: u.uid,
    authorName: u.name,
    authorEmail: u.email || '',
    authorVerified: true,
    authorPassport: u.passportNum,
    cityId,
    vibe,
    caption_en: finalEn,
    caption_fr: finalFr,
    mediaType,
    mediaUrl,
    mediaUrls,
    photoFilter: pendingStudioPhotoFilter || 'flt-none',
    soundtrackId: soundtrackId || '',
    beatPattern: beatPatternObj || null,
    videoDuration,
    enforce60sCap: !!window._pendingEnforce60sCap,
    htmlCode,
    visualHeadline: artHeadline,
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
    newPost.versus = {
      leftCityId: lC,
      rightCityId: rC,
      leftMedia: pendingVersusMedia.left || generateCityPostVisualDataUrl(lC, getCityName(getCityById(lC), 'en')),
      rightMedia: pendingVersusMedia.right || generateCityPostVisualDataUrl(rC, getCityName(getCityById(rC), 'en')),
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
  REMO_STORE.syncPostToCloud(newPost);
  REMO_STORE.save(true, 'new_post');
  closeCreatePostModal();
  spawnRemoCoinsFX(wxStatus.isSurge ? 16 : 10);
  renderSocialFeed();
  if (wxStatus.isSurge) {
    const cityObj = getCityById(cityId);
    remoToast(t('weather_surge_bonus_toast', { city: getCityName(cityObj, lang), coins: reward }), 'fanfare');
  } else {
    remoToast(lang === 'fr' ? `🚀 Publié sur REMO (+${reward} 🪙) !` : `🚀 Published to REMO (+${reward} 🪙)!`, 'coin');
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
  const start = performance.now();
  const drawFrame = (now) => {
    const tSec = (now - start) / 1000;
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
    if (tSec < 4.0) requestAnimationFrame(drawFrame);
    else rec.stop();
  };
  requestAnimationFrame(drawFrame);
}

/* ── Stories Upload & Viewer ── */
function openStoryUploadPrompt() {
  const lang = REMO_I18N.getLang();
  const txt = prompt(lang === 'fr' ? 'Texte de votre Story 24h :' : 'Caption for your 24h City Story:');
  if (!txt) return;
  const u = REMO_STORE.getCurrentUser() || REMO_STORE.ensureGuestOrCitizen('Creator', '', 'montreal');
  REMO_STORE.state.stories.unshift({
    id: 'st_' + Date.now(),
    author: u.name,
    cityId: u.homeCity || 'montreal',
    caption_en: txt,
    caption_fr: txt,
    createdAt: Date.now()
  });
  REMO_STORE.addCoins(u.uid, 10, 10);
  REMO_STORE.save(true, 'story');
  renderStoriesAndBanners();
  remoToast(lang === 'fr' ? '📖 Story 24h publiée (+10 🪙) !' : '📖 24h Story published (+10 🪙)!', 'coin');
}

function openStoryViewer(storyId) {
  const s = (REMO_STORE.state.stories || []).find((x) => x.id === storyId);
  if (!s) return;
  const lang = REMO_I18N.getLang();
  const c = getCityById(s.cityId);
  const box = document.getElementById('storyViewerBody');
  if (box) {
    const art = generateCityPostVisualDataUrl(c.id, s.author, lang === 'fr' ? s.caption_fr : s.caption_en);
    box.innerHTML = `
      <img src="${art}" style="width:100%;border-radius:16px;max-height:65dvh;object-fit:cover;">
      <div style="margin-top:10px;font-weight:800;text-align:center;">${c.flag} @${s.author} — ${lang === 'fr' ? s.caption_fr : s.caption_en}</div>
      ${REMO_STORE.isAdminUnlocked() ? `<div style="text-align:center;margin-top:10px;"><button class="adm-pbtn danger" onclick="adminDeleteStoryInline('${s.id}')">🗑️ Delete Story (Admin)</button></div>` : ''}
    `;
  }
  document.getElementById('storyViewerModal')?.classList.add('open');
}

function adminDeleteStoryInline(storyId) {
  if (!REMO_STORE.isAdminUnlocked()) return;
  REMO_STORE.state.stories = (REMO_STORE.state.stories || []).filter((x) => x.id !== storyId);
  REMO_STORE.save(true, 'story_del');
  document.getElementById('storyViewerModal')?.classList.remove('open');
  renderStoriesAndBanners();
  remoToast('🗑️ Story deleted!');
}

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
            <b style="color:#fbbf24;cursor:pointer;" onclick="openDirectChatWithUser('${m.uid || ''}')">${m.cityFlag || '🌐'} @${escapeHtmlStr(m.author)} 💌:</b>
            ${m.isWalkieTalkie ? `<span class="surge-mini-pill" style="background:linear-gradient(135deg,#0ea5e9,#10b981);">${t('wt_msg_badge')}</span>` : ''}
          </div>
          ${m.text ? `<div style="margin-top:3px;color:#f1f5f9;">${escapeHtmlStr(m.text)}</div>` : ''}
          ${altTxt && altTxt.toLowerCase() !== String(m.text || '').toLowerCase() ? `<div style="font-size:0.74rem;color:#94a3b8;margin-top:2px;">🌐 ${escapeHtmlStr(altTxt)}</div>` : ''}
          ${m.voiceUrl ? `<audio src="${vUrl}" ${vIdb} controls style="width:100%;max-width:340px;height:32px;margin-top:5px;"></audio>` : ''}
        </div>
        ${isAdm ? `<button class="adm-pbtn danger" onclick="adminDeleteChatMsgInline('${currentChatRoom}', '${m.id}')">🗑️</button>` : ''}
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
            <button type="button" class="dm-unread-jump-pill" onclick="selectDmPartner('${u.uid}')">
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
          <button type="button" class="dm-contact-chip smart-card ${u.uid === partner.uid ? 'active' : ''} ${effectiveUnread > 0 ? 'unread-glow' : ''}" onclick="selectDmPartner('${u.uid}')">
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
        <div style="display:flex;align-items:center;gap:9px;min-width:0;cursor:pointer;" onclick="openCitizenProfileModal('${partner.uid}', '${escapeHtmlStr(partner.name)}')">
          <span style="font-size:1.35rem;">${pc.flag}</span>
          <div style="min-width:0;">
            <div style="font-size:0.7rem;color:#7dd3fc;font-weight:800;text-transform:uppercase;letter-spacing:0.4px;">${t('dm_active_chat_with')}</div>
            <div style="font-size:0.92rem;font-weight:900;color:#fbbf24;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
              @${escapeHtmlStr(partner.name)} <span style="font-size:0.75rem;color:#cbd5e1;font-weight:700;">· ${escapeHtmlStr(getCityName(pc, lang))}${partner.passportNum ? ` · #${escapeHtmlStr(partner.passportNum)}` : ''}</span>
            </div>
          </div>
        </div>
        <button type="button" class="btn-ghost" style="font-size:0.73rem;padding:4px 10px;flex-shrink:0;" onclick="openCitizenProfileModal('${partner.uid}', '${escapeHtmlStr(partner.name)}')">${t('dm_view_profile')}</button>
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
    const vIdb = d.voiceUrl && String(d.voiceUrl).startsWith('idb://') ? `data-idb-src="${d.voiceUrl}"` : '';
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
          ${isAdm ? `<button type="button" class="adm-pbtn danger" style="padding:2px 6px;" onclick="adminDeleteDmInline('${d.id}')">🗑️</button>` : ''}
        </div>
        ${d.text ? `<div style="margin-top:4px;font-size:0.88rem;color:#f8fafc;">${escapeHtmlStr(d.text)}</div>` : ''}
        ${autoTrans && dual ? `
          <div style="margin-top:4px;padding-top:4px;border-top:1px dashed rgba(255,255,255,0.12);font-size:0.74rem;color:#cbd5e1;">
            🇬🇧 ${escapeHtmlStr(dual.en)}<br>🇫🇷 ${escapeHtmlStr(dual.fr)}
          </div>
        ` : ''}
        ${vUrl || vIdb ? `<audio src="${vUrl}" ${vIdb} controls preload="auto" style="width:100%;height:32px;margin-top:6px;outline:none;border-radius:8px;"></audio>` : ''}

        ${d.envelopeCoins > 0 ? `
          <div class="dm-envelope-card">
            <div>
              <div style="font-weight:900;color:#fde047;font-size:0.84rem;">${d.isRoyalAdmin ? '👑 ROYAL FOUNDER ENVELOPE' : '🧧 REMO GIFT ENVELOPE'}</div>
              <div style="font-size:0.76rem;color:#fff;">+${d.envelopeCoins} 🪙 REMO Coins</div>
            </div>
            ${d.envelopeClaimed
              ? `<span style="font-size:0.76rem;font-weight:900;color:#86efac;">${t('dm_env_opened_lbl', { coins: d.envelopeCoins })}</span>`
              : `<button type="button" class="btn-cyber btn-gold" style="padding:6px 12px;font-size:0.76rem;" onclick="claimDmCoinEnvelope('${d.id}')">${t('dm_env_open_btn', { coins: d.envelopeCoins })}</button>`}
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
                  ? `<button type="button" class="btn-cyber" style="padding:6px 12px;font-size:0.76rem;" onclick="acceptDmCardTradeOffer('${d.id}')">${t('dm_trade_accept_btn', { price: d.cardOffer.price > 0 ? d.cardOffer.price + ' 🪙' : 'FREE' })}</button>`
                  : `<span style="font-size:0.73rem;color:#94a3b8;">⏳ Sent</span>`)}
          </div>
        ` : ''}
      </div>
    `;
  }).join('') || `<div style="text-align:center;color:var(--muted);padding:26px;">${lang === 'fr' ? `Démarrez votre conversation privée 1-à-1 avec @${partner.name} !` : `Start your private 1-on-1 conversation with @${partner.name}!`}</div>`;

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
  const d = (REMO_STORE.state.directMessages || []).find((x) => x.id === msgId);
  if (!d || d.envelopeClaimed || !d.envelopeCoins) return;
  const u = REMO_STORE.getCurrentUser() || REMO_STORE.ensureGuestOrCitizen('Citizen', '', 'montreal');
  d.envelopeClaimed = true;
  REMO_STORE.adminAdjustUserCoins(u.uid, 'add', d.envelopeCoins);
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
    if (d.fromUid) REMO_STORE.adminAdjustUserCoins(d.fromUid, 'add', price);
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

function openAuthModal() {
  const sel = document.getElementById('authHomeCitySelect');
  const lang = REMO_I18N.getLang();
  if (sel) {
    sel.innerHTML = getRemoCities().map((c) =>
      `<option value="${c.id}">${c.flag} ${getCityName(c, lang)}</option>`
    ).join('');
  }
  const iabWarn = document.getElementById('authIabWarningBox');
  if (iabWarn) iabWarn.style.display = REMO_STORE.isInAppBrowser() ? 'block' : 'none';
  document.getElementById('authModal')?.classList.add('open');
}

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

function submitUniversalAuth(ev) {
  if (ev) ev.preventDefault();
  const lang = REMO_I18N.getLang();
  const name = document.getElementById('authNameInp')?.value.trim() || 'REMO Pioneer';
  const email = (document.getElementById('authEmailInp')?.value || '').trim();
  const cityId = document.getElementById('authHomeCitySelect')?.value || 'montreal';
  const termsChecked = document.getElementById('authTermsCheck')?.checked;

  if (!termsChecked) {
    remoToast(t('auth_err_terms'));
    return;
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    remoToast(t('auth_err_email_invalid'));
    return;
  }

  if (isDisposableEmail(email)) {
    remoToast(t('auth_err_disposable_email'));
    return;
  }

  const adminEmail = (REMO_STORE.state?.settings?.adminEmail || 'andart1174@gmail.com').toLowerCase();
  const isTargetingAdmin = email.toLowerCase() === adminEmail;

  if (isTargetingAdmin) {
    const pin = prompt(
      lang === 'fr'
        ? '🔐 Compte Fondateur & Administrateur (andart1174@gmail.com)\nEntrez le code PIN Admin (défaut : 2026) :'
        : '🔐 Founder & Admin Account (andart1174@gmail.com)\nEnter Admin Master PIN (default: 2026):'
    );
    const masterPin = REMO_STORE.state?.settings?.adminPin || '2026';
    if (!pin || pin.trim() !== masterPin) {
      remoToast(lang === 'fr' ? '❌ Code PIN Admin incorrect ! Connexion refusée.' : '❌ Invalid Admin PIN! Access denied.');
      return;
    }
  }

  // Check if existing citizen in local or cloud store
  const existingUser = (REMO_STORE.state.users || []).find((x) => x && x.email && x.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    const u = REMO_STORE.ensureGuestOrCitizen(name, email, cityId);
    if (isTargetingAdmin) {
      REMO_STORE.setAdminUnlocked(true);
    }
    document.getElementById('authModal')?.classList.remove('open');
    spawnRemoCoinsFX(10);
    syncHeaderAndSidebars();
    renderSocialFeed();
    remoToast(lang === 'fr' ? `🎉 Bon retour ${u.name} !` : `🎉 Welcome back ${u.name}!`, 'fanfare');
    return;
  }

  // Brand new registration: Generate 6-digit confirmation code (OTP)
  const otpCode = String(Math.floor(100000 + Math.random() * 900000));
  const pendingData = {
    name,
    email,
    cityId,
    code: otpCode,
    expiresAt: Date.now() + 10 * 60 * 1000,
    isTargetingAdmin
  };
  try {
    sessionStorage.setItem('remo_pending_signup', JSON.stringify(pendingData));
  } catch (e) {}

  // 1. Dispatch real email via Netlify Serverless Function (if RESEND_API_KEY / BREVO_API_KEY configured)
  try {
    fetch('/.netlify/functions/send-email-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, code: otpCode, lang })
    }).then((r) => r.json()).then((res) => {
      if (res && res.success) {
        console.log('[REMO Mailer]: Confirmation email dispatched to', email);
      }
    }).catch(() => {});
  } catch (e) {}

  // 2. Dispatch real email via Firebase Authentication Email Link
  if (REMO_STORE.fbAuth && typeof REMO_STORE.fbAuth.sendSignInLinkToEmail === 'function') {
    const actionCodeSettings = {
      url: window.location.origin + window.location.pathname + '?emailAuth=1',
      handleCodeInApp: true
    };
    REMO_STORE.fbAuth.sendSignInLinkToEmail(email, actionCodeSettings)
      .then(() => {
        try { localStorage.setItem('remo_email_for_signin', email); } catch (e) {}
      })
      .catch((err) => {
        console.warn('Firebase email auth dispatch notice:', err.message);
      });
  }

  // Transition modal UI to OTP confirmation step
  const regForm = document.getElementById('authRegisterForm');
  const otpBox = document.getElementById('authOtpBox');
  const emailDisplay = document.getElementById('authOtpEmailDisplay');
  if (regForm) regForm.style.display = 'none';
  if (otpBox) otpBox.style.display = 'block';
  if (emailDisplay) emailDisplay.textContent = email;

  // Never leak the secret code in the user-facing toast!
  remoToast(
    lang === 'fr'
      ? `🔑 Un code de confirmation à 6 chiffres a été envoyé à ${email}. Veuillez vérifier votre boîte de réception (et vos spams).`
      : `🔑 A 6-digit confirmation code was sent to ${email}. Please check your inbox (and spam folder).`,
    8000
  );
  console.log('%c[REMO Secure Verification Code]: ' + otpCode, 'color:#38bdf8;font-weight:bold;font-size:12px;');
}

function verifyAuthOtpCode() {
  const lang = REMO_I18N.getLang();
  let pending = null;
  try {
    const raw = sessionStorage.getItem('remo_pending_signup');
    if (raw) pending = JSON.parse(raw);
  } catch (e) {}

  if (!pending || !pending.email) {
    cancelAuthOtpStep();
    return;
  }

  const inpCode = (document.getElementById('authOtpCodeInp')?.value || '').trim();
  if (!inpCode || inpCode !== pending.code || Date.now() > pending.expiresAt) {
    remoToast(t('auth_err_otp_invalid'));
    return;
  }

  // OTP Verified! Complete account creation
  const u = REMO_STORE.ensureGuestOrCitizen(pending.name, pending.email, pending.cityId);
  u.termsAcceptedAt = Date.now();
  u.termsVersion = '1.0';
  u.emailVerified = true;
  if (pending.isTargetingAdmin) {
    REMO_STORE.setAdminUnlocked(true);
  }
  REMO_STORE.save(true, 'user_registered_verified');

  try {
    sessionStorage.removeItem('remo_pending_signup');
  } catch (e) {}

  cancelAuthOtpStep();
  document.getElementById('authModal')?.classList.remove('open');
  spawnRemoCoinsFX(15);
  syncHeaderAndSidebars();
  renderSocialFeed();
  remoToast(
    lang === 'fr'
      ? `🎉 Compte vérifié avec succès ! Bienvenue ${u.name} (Passeport #${u.passportNum}) !`
      : `🎉 Real Email Verified! Welcome ${u.name} (Passport #${u.passportNum})!`,
    'fanfare'
  );
}
window.verifyAuthOtpCode = verifyAuthOtpCode;

function resendAuthOtpCode() {
  const lang = REMO_I18N.getLang();
  let pending = null;
  try {
    const raw = sessionStorage.getItem('remo_pending_signup');
    if (raw) pending = JSON.parse(raw);
  } catch (e) {}
  if (!pending) return;
  pending.code = String(Math.floor(100000 + Math.random() * 900000));
  pending.expiresAt = Date.now() + 10 * 60 * 1000;
  try {
    sessionStorage.setItem('remo_pending_signup', JSON.stringify(pending));
  } catch (e) {}

  // Dispatch real email via Netlify Serverless Function
  try {
    fetch('/.netlify/functions/send-email-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: pending.email, name: pending.name, code: pending.code, lang })
    }).catch(() => {});
  } catch (e) {}

  // Dispatch via Firebase
  if (REMO_STORE.fbAuth && typeof REMO_STORE.fbAuth.sendSignInLinkToEmail === 'function') {
    const actionCodeSettings = {
      url: window.location.origin + window.location.pathname + '?emailAuth=1',
      handleCodeInApp: true
    };
    REMO_STORE.fbAuth.sendSignInLinkToEmail(pending.email, actionCodeSettings).catch(() => {});
  }

  remoToast(
    lang === 'fr'
      ? `🔑 Un nouveau code de confirmation a été envoyé à ${pending.email}. Veuillez vérifier vos courriels.`
      : `🔑 A new confirmation code has been sent to ${pending.email}. Please check your inbox.`,
    8000
  );
  console.log('%c[REMO Secure Verification Code Resent]: ' + pending.code, 'color:#38bdf8;font-weight:bold;font-size:12px;');
}
window.resendAuthOtpCode = resendAuthOtpCode;

function cancelAuthOtpStep() {
  const regForm = document.getElementById('authRegisterForm');
  const otpBox = document.getElementById('authOtpBox');
  if (regForm) regForm.style.display = 'block';
  if (otpBox) otpBox.style.display = 'none';
  const inp = document.getElementById('authOtpCodeInp');
  if (inp) inp.value = '';
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

    REMO_STORE.fbAuth.signInWithPopup(provider).then((res) => {
      const fbU = res && res.user;
      if (!fbU) return;
      const cityId = document.getElementById('authHomeCitySelect')?.value || 'montreal';
      const adminEmail = (REMO_STORE.state?.settings?.adminEmail || 'andart1174@gmail.com').toLowerCase();
      const isAdminEmail = (fbU.email || '').toLowerCase().trim() === adminEmail;

      const u = REMO_STORE.ensureGuestOrCitizen(
        fbU.displayName || (isAdminEmail ? 'REMO Founder' : 'Citizen'),
        fbU.email,
        cityId,
        isAdminEmail
      );
      if (isAdminEmail) {
        REMO_STORE.setAdminUnlocked(true);
      }
      document.getElementById('authModal')?.classList.remove('open');
      syncHeaderAndSidebars();
      renderSocialFeed();
      remoToast(
        isAdminEmail
          ? (lang === 'fr' ? '👑 Session Fondateur Admin activée !' : '👑 Founder Admin session active!')
          : (lang === 'fr' ? `🎉 Bienvenue ${u.name} !` : `🎉 Welcome ${u.name}!`),
        'fanfare'
      );
    }).catch((err) => {
      console.warn('Firebase Google Sign-In error:', err);
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/popup-closed-by-user') {
        REMO_STORE.fbAuth.signInWithRedirect(provider).catch((e) => remoToast(e.message));
        return;
      }
      remoToast('Google Sign-In: ' + (err.message || err.code));
    });
    return;
  }

  remoToast(lang === 'fr' ? 'Initialisation de Firebase en cours... Veuillez réessayer dans quelques secondes.' : 'Firebase initializing... Please retry in a few seconds.');
}

function userSignOutAction() {
  const lang = REMO_I18N.getLang();
  REMO_STORE.signOut();
  localStorage.removeItem(REMO_STORE.USER_KEY);
  localStorage.removeItem(REMO_STORE.ADMIN_MODE_KEY);
  sessionStorage.removeItem('remo_admin_unlocked');
  if (typeof firebase !== 'undefined' && firebase.auth) {
    try { firebase.auth().signOut(); } catch (e) {}
  }
  syncHeaderAndSidebars();
  renderSocialFeed();
  switchRemoView('feed');
  remoToast(lang === 'fr' ? '🚪 Déconnecté avec succès. Vous pouvez maintenant vous reconnecter.' : '🚪 Signed out successfully. You can now sign in again.');
}

function toggleHeaderRadio() {
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
  if (targetPost) {
    const scrollToTargetPost = () => {
      const card = document.getElementById(`post_card_${targetPost}`);
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        card.style.transition = 'all 0.5s ease';
        card.style.boxShadow = '0 0 35px rgba(56, 189, 248, 0.7)';
        setTimeout(() => { if (card) card.style.boxShadow = ''; }, 3500);
      }
    };
    setTimeout(scrollToTargetPost, 600);
    setTimeout(scrollToTargetPost, 1800);
  }
  if (params.get('city')) {
    currentFeedCityFilter = params.get('city');
    renderSocialFeed();
  }
  if (params.get('view')) {
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
  const openTarget = (params.get('open') || '').trim().toLowerCase();
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
        const mysteryBtn = document.querySelector('#feedModeChips button[onclick*="mystery"]');
        if (typeof setFeedMode === 'function') setFeedMode('mystery', mysteryBtn);
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

  // Desktop Keyboard Shortcuts (J/K scroll, M radar, G cards)
  document.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
    if (e.key.toLowerCase() === 'm') switchRemoView('radar');
    else if (e.key.toLowerCase() === 'g') switchRemoView('cards');
    else if (e.key.toLowerCase() === 'a') switchRemoView('arena');
  });

  // 🌐 Holographic Onboarding Welcome Splash Screen (Auto-trigger for new users or ?welcome=1)
  setTimeout(() => {
    if (typeof showWelcomeSplashScreen === 'function') {
      showWelcomeSplashScreen();
    }
  }, 400);
});

window.addEventListener('remo:langchange', () => {
  syncHeaderAndSidebars();
  switchRemoView(currentRemoView);
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

  // Keep running HTML mini-game iframes & videos uninterrupted when scores, war taps or presence update
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
    remoToast(lang === 'fr' ? '🔒 Accès réservé au compte Fondateur (andart1174@gmail.com).' : '🔒 Access restricted to Founder account (andart1174@gmail.com).');
    return;
  }

  const isAdm = REMO_STORE.isAdminUnlocked();
  if (pinBox) pinBox.style.display = isAdm ? 'none' : 'block';
  if (ctrlBox) ctrlBox.style.display = isAdm ? 'flex' : 'none';

  if (isAdm) {
    const lang = REMO_I18N.getLang();
    const uSel = document.getElementById('admTransferUserSel');
    if (uSel) {
      uSel.innerHTML = (REMO_STORE.state.users || []).map((u) => {
        const c = getCityById(u.homeCity);
        return `<option value="${u.uid}" ${u.uid === preselectUid ? 'selected' : ''}>${c.flag} @${u.name} (#${u.passportNum}) — 🪙 ${u.coins.toLocaleString()}</option>`;
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
  }
  modal.classList.add('open');
}

function unlockAdminGodModeInline() {
  const lang = REMO_I18N.getLang();
  const pin = document.getElementById('admQuickPinInput')?.value.trim();
  const master = REMO_STORE.state.settings.adminPin || '2026';
  if (pin !== master) {
    remoToast(lang === 'fr' ? '❌ Code PIN Admin incorrect !' : '❌ Invalid Admin PIN!');
    return;
  }
  if (!REMO_STORE.isCurrentUserAdmin()) {
    REMO_STORE.ensureGuestOrCitizen('REMO Founder', 'andart1174@gmail.com', 'montreal', true);
  }
  REMO_STORE.setAdminUnlocked(true);
  RemoAudio.play('fanfare');
  remoToast(lang === 'fr' ? '👑 Mode Admin activé sur tout REMO !' : '👑 Admin God-Mode unlocked across REMO!', 'fanfare');
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
  const p = (REMO_STORE.state.posts || []).find((x) => x.id === postId);
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

  content.innerHTML = `
    <div class="modal-hdr">
      <div style="display:flex;align-items:center;gap:10px;min-width:0;">
        <div class="avatar-circle" style="width:36px;height:36px;font-size:0.95rem;flex-shrink:0;">
          ${escapeHtmlStr((p.authorName || 'R')[0].toUpperCase())}
        </div>
        <div style="min-width:0;">
          <div style="font-weight:900;font-size:0.92rem;color:#fff;">@${escapeHtmlStr(p.authorName)}</div>
          <div style="font-size:0.75rem;color:var(--muted);">${city.flag} ${getCityName(city, lang)}</div>
        </div>
      </div>
      <button class="modal-close" onclick="closePostActionsModal()">✕</button>
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

      <button type="button" class="action-sheet-row" onclick="closePostActionsModal(); mintPostAsCityCard('${p.id}');">
        <span class="as-icon" style="background:rgba(251,191,36,0.15);color:#fbbf24;">🎴</span>
        <div style="text-align:left;flex:1;">
          <b style="color:#fef08a;">${lang === 'fr' ? 'Créer Carte Ville 4D' : 'Mint 4D City Card'}</b>
          <div style="font-size:0.72rem;color:var(--muted);">${lang === 'fr' ? 'Transformez ce moment en carte de collection' : 'Turn this moment into a collectible 4D card'}</div>
        </div>
      </button>

      <button type="button" class="action-sheet-row" onclick="closePostActionsModal(); boostPost24h('${p.id}');">
        <span class="as-icon" style="background:rgba(56,189,248,0.15);color:#38bdf8;">🚀</span>
        <div style="text-align:left;flex:1;">
          <b style="color:#bae6fd;">${lang === 'fr' ? 'Booster la Publication' : 'Boost Post'}</b>
          <div style="font-size:0.72rem;color:var(--muted);">${lang === 'fr' ? 'Propulsez ce moment en tête du fil (+100 🪙)' : 'Propel this post to top of global feed'}</div>
        </div>
      </button>

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
              📌 ${p.pinned ? 'Désépingler' : 'Épingler'}
            </button>
            <button type="button" class="adm-pbtn gold" onclick="closePostActionsModal(); adminAwardFounderCrown('${p.id}');">
              👑 Couronne (+100🪙)
            </button>
            <button type="button" class="adm-pbtn" onclick="closePostActionsModal(); adminEditPostInline('${p.id}');">
              ✏️ Modifier Texte
            </button>
            <button type="button" class="adm-pbtn danger" onclick="closePostActionsModal(); adminDeletePostInline('${p.id}');">
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
  const isAdm = REMO_STORE.isAdminUnlocked();
  const p = (REMO_STORE.state.posts || []).find((x) => x.id === postId);
  if (!p) return;
  const isPostOwner = Boolean(u && (u.uid === p.uid || (u.email && p.authorEmail && u.email.toLowerCase() === p.authorEmail.toLowerCase())));
  if (!isPostOwner && !isAdm) {
    remoToast(lang === 'fr' ? 'Vous ne pouvez supprimer que vos propres publications.' : 'You can only delete your own posts.');
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
  if (!REMO_STORE.isAdminUnlocked()) return;
  const lang = REMO_I18N.getLang();
  if (!confirm(lang === 'fr' ? '🗑️ Supprimer définitivement cette publication ?' : '🗑️ Permanently delete this post?')) return;
  REMO_STORE.state.posts = (REMO_STORE.state.posts || []).filter((p) => p.id !== postId);
  REMO_STORE.deletePostFromCloud(postId);
  REMO_STORE.save(true, 'admin_delete_post');
  renderSocialFeed();
  remoToast(lang === 'fr' ? '🗑️ Publication supprimée par Admin.' : '🗑️ Post deleted by Admin.');
}

function adminPinPostInline(postId) {
  if (!REMO_STORE.isAdminUnlocked()) return;
  const p = (REMO_STORE.state.posts || []).find((x) => x.id === postId);
  if (!p) return;
  p.pinned = !p.pinned;
  REMO_STORE.syncPostToCloud(p);
  REMO_STORE.save(true, 'admin_pin_post');
  renderSocialFeed();
  remoToast(p.pinned ? '📌 Pinned #1 Globally!' : '📌 Unpinned.');
}

function adminAwardFounderCrown(postId) {
  if (!REMO_STORE.isAdminUnlocked()) return;
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
  if (!REMO_STORE.isAdminUnlocked()) return;
  const lang = REMO_I18N.getLang();
  const p = (REMO_STORE.state.posts || []).find((x) => x.id === postId);
  if (!p) return;
  const cur = lang === 'fr' ? (p.caption_fr || p.caption_en) : (p.caption_en || p.caption_fr);
  const edited = prompt(lang === 'fr' ? 'Modifier la légende de la publication :' : 'Edit post caption:', cur);
  if (edited === null) return;
  p.caption_en = edited;
  p.caption_fr = edited;
  REMO_STORE.save(true, 'admin_edit_post');
  renderSocialFeed();
  remoToast('✏️ Post updated!');
}

function adminDeleteCommentInline(postId, commentId) {
  if (!REMO_STORE.isAdminUnlocked()) return;
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
  REMO_STORE.adminAdjustUserCoins(u.uid, 'add', found.coins, `🎟️ Promo Code ${code}`);
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
  REMO_STORE.adminAdjustUserCoins(u.uid, 'add', price);
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
  const enRaw = (p.caption_en || '').trim();
  const frRaw = (p.caption_fr || '').trim();
  if (enRaw && frRaw && enRaw !== frRaw) {
    return { en: enRaw, fr: frRaw };
  }
  return REMO_TRANSLATOR.makeBilingualPair(enRaw || frRaw);
}

function togglePostAutoTranslate(postId) {
  window._openTranslatedPosts = window._openTranslatedPosts || {};
  window._openTranslatedPosts[postId] = !window._openTranslatedPosts[postId];
  RemoAudio.play('click');
  renderSocialFeed();
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

let _cityArcadeCycleIdx = 0;

function copilotGenerateCityHtmlGame(forcedGenre = '') {
  if (!REMO_STORE.isAdminUnlocked() && !REMO_STORE.isCurrentUserAdmin()) {
    remoToast(REMO_I18N.getLang() === 'fr' ? 'La génération de jeux arcade est réservée aux administrateurs.' : 'Arcade game generation is admin only.');
    return;
  }
  const lang = REMO_I18N.getLang();
  const cityId = document.getElementById('createCitySelect')?.value || 'chisinau';
  const city = getCityById(cityId);
  const col = city.themeColor || '#38bdf8';
  const cName = city.name_en.toUpperCase();
  switchCreateStudioTab('html');

  const genres = ['defense', 'stacker', 'drone', 'metro', 'rhythm'];
  const genre = forcedGenre && genres.includes(forcedGenre)
    ? forcedGenre
    : genres[(_cityArcadeCycleIdx++) % genres.length];

  let code = '';
  let gameTitleEn = '';
  let gameTitleFr = '';

  if (genre === 'defense') {
    gameTitleEn = 'Skyline Laser Defense';
    gameTitleFr = 'Défense Laser Skyline';
    code = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
html,body{margin:0;height:100%;overflow:hidden;background:#040714;font-family:system-ui,sans-serif;user-select:none;touch-action:none;color:#fff;}
canvas{display:block;width:100%;height:100%;cursor:crosshair;}
.hud{position:fixed;top:40px;left:10px;right:10px;display:flex;justify-content:space-between;pointer-events:none;font-weight:900;font-size:12px;}
.pill{background:rgba(8,14,34,0.88);border:1px solid ${col};padding:4px 10px;border-radius:99px;}
</style></head><body>
<div class="hud"><span class="pill">🏙️ ${city.flag} ${cName} LASER DEFENSE</span><span class="pill" id="st">🛡️ 100% · 🪙 0</span></div>
<canvas id="c"></canvas><script>
const cv=document.getElementById('c'),x=cv.getContext('2d');
let w,h,sc=0,hp=100,meteors=[],lasers=[],sparks=[],ac=null;
function rs(){w=cv.width=innerWidth;h=cv.height=innerHeight;}addEventListener('resize',rs);rs();
function sfx(f1,f2,d){try{if(!ac)ac=new(window.AudioContext||window.webkitAudioContext)();if(ac.state==='suspended')ac.resume();const o=ac.createOscillator(),g=ac.createGain(),t=ac.currentTime;o.type='sawtooth';o.frequency.setValueAtTime(f1,t);o.frequency.exponentialRampToValueAtTime(f2,t+d);g.gain.setValueAtTime(0.12,t);g.gain.exponentialRampToValueAtTime(0.001,t+d);o.connect(g);g.connect(ac.destination);o.start(t);o.stop(t+d);}catch(e){}}
setInterval(()=>{if(hp<=0)return;meteors.push({x:24+Math.random()*(w-48),y:-18,vx:(Math.random()-0.5)*1.2,vy:1.3+Math.random()*1.8+sc*0.004,r:13+Math.random()*9,boss:Math.random()>0.82});},680);
cv.addEventListener('pointerdown',e=>{
  if(hp<=0){hp=100;sc=0;meteors=[];return;}
  lasers.push({tx:e.clientX,ty:e.clientY,life:1});sfx(880,180,0.14);
  for(let i=meteors.length-1;i>=0;i--){
    const m=meteors[i];
    if(Math.hypot(e.clientX-m.x,e.clientY-m.y)<m.r+34){
      sc+=m.boss?40:15;sfx(260,55,0.22);
      for(let k=0;k<18;k++){const a=Math.random()*6.28,s=1.5+Math.random()*4;sparks.push({x:m.x,y:m.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:1,c:m.boss?'#fbbf24':'${col}'});}
      meteors.splice(i,1);
    }
  }
  document.getElementById('st').textContent='🛡️ '+hp+'% · 🪙 '+sc;
});
function draw(){
  x.fillStyle='rgba(4,7,20,0.32)';x.fillRect(0,0,w,h);
  // Illuminated City Skyline
  for(let i=0;i<11;i++){
    const bw=w/11,bh=38+((i*29)%58)+(i===5?28:0),bx=i*bw+2;
    x.fillStyle=i===5?'${col}44':'#0d1633';x.strokeStyle=i===5?'#fbbf24':'${col}66';
    x.fillRect(bx,h-bh,bw-4,bh);x.strokeRect(bx,h-bh,bw-4,bh);
  }
  lasers.forEach(l=>{x.strokeStyle='#fbbf24';x.lineWidth=3*l.life;x.beginPath();x.moveTo(w/2,h-66);x.lineTo(l.tx,l.ty);x.stroke();l.life-=0.14;});
  lasers=lasers.filter(l=>l.life>0);
  for(let i=meteors.length-1;i>=0;i--){
    const m=meteors[i];m.x+=m.vx;m.y+=m.vy;
    x.shadowColor=m.boss?'#fbbf24':'#f43f5e';x.shadowBlur=16;
    x.fillStyle=m.boss?'#fbbf24':'#f43f5e';x.beginPath();x.arc(m.x,m.y,m.r,0,6.28);x.fill();x.shadowBlur=0;
    if(m.y>h-46){hp=Math.max(0,hp-15);meteors.splice(i,1);document.getElementById('st').textContent='🛡️ '+hp+'% · 🪙 '+sc;}
  }
  sparks.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.life-=0.04;x.globalAlpha=Math.max(0,p.life);x.fillStyle=p.c;x.fillRect(p.x,p.y,4,4);});
  x.globalAlpha=1;sparks=sparks.filter(p=>p.life>0);
  if(hp<=0){x.fillStyle='#fbbf24';x.font='900 18px sans-serif';x.textAlign='center';x.fillText('💥 TAP TO REBUILD ${cName} (SCORE: '+sc+')',w/2,h/2);}
  requestAnimationFrame(draw);
}draw();<\/script></body></html>`;
  } else if (genre === 'stacker') {
    gameTitleEn = '4D Skyscraper Builder';
    gameTitleFr = 'Constructeur Gratte-Ciel 4D';
    code = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
html,body{margin:0;height:100%;overflow:hidden;background:linear-gradient(#040716,#131b3a);font-family:system-ui,sans-serif;user-select:none;touch-action:none;color:#fff;}
canvas{display:block;width:100%;height:100%;cursor:pointer;}
.hud{position:fixed;top:40px;left:10px;right:10px;display:flex;justify-content:space-between;pointer-events:none;font-weight:900;font-size:12px;}
.pill{background:rgba(8,14,34,0.88);border:1px solid #fbbf24;padding:4px 10px;border-radius:99px;}
</style></head><body>
<div class="hud"><span class="pill">🏗️ ${city.flag} ${cName} TOWER STACKER</span><span class="pill" id="fl">FLOOR: 1</span></div>
<canvas id="c"></canvas><script>
const cv=document.getElementById('c'),x=cv.getContext('2d');
let w,h,stack=[],cur=null,camY=0,over=false,ac=null;
function rs(){w=cv.width=innerWidth;h=cv.height=innerHeight;reset();}addEventListener('resize',rs);
function reset(){stack=[{x:w/2-70,w:140,c:'${col}'}];spawn();camY=0;over=false;document.getElementById('fl').textContent='FLOOR: 1';}
function spawn(){const top=stack[stack.length-1];cur={x:20,w:top.w,vx:3.2+stack.length*0.22,dir:1};}
function note(n){try{if(!ac)ac=new(window.AudioContext||window.webkitAudioContext)();const o=ac.createOscillator(),g=ac.createGain(),t=ac.currentTime;o.frequency.value=260+n*28;g.gain.setValueAtTime(0.13,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.25);o.connect(g);g.connect(ac.destination);o.start(t);o.stop(t+0.26);}catch(e){}}
cv.addEventListener('pointerdown',()=>{
  if(over){reset();return;}
  const top=stack[stack.length-1];
  const left=Math.max(top.x,cur.x),right=Math.min(top.x+top.w,cur.x+cur.w),nw=right-left;
  if(nw<=8){over=true;return;}
  stack.push({x:left,w:nw,c:stack.length%2?'#fbbf24':'${col}'});
  note(stack.length);document.getElementById('fl').textContent='FLOOR: '+stack.length+' 🏙️';
  spawn();
});
rs();
function loop(){
  x.clearRect(0,0,w,h);
  const bh=24,targetCam=Math.max(0,(stack.length-6)*bh);camY+=(targetCam-camY)*0.12;
  if(!over&&cur){cur.x+=cur.vx*cur.dir;if(cur.x+cur.w>w-14)cur.dir=-1;if(cur.x<14)cur.dir=1;}
  stack.forEach((b,i)=>{
    const by=h-56-i*bh+camY;
    x.fillStyle=b.c;x.fillRect(b.x,by,b.w,bh-2);
    x.fillStyle='rgba(255,255,255,0.55)';
    for(let wx=b.x+8;wx<b.x+b.w-10;wx+=16)x.fillRect(wx,by+6,7,10);
  });
  if(!over&&cur){
    const cy=h-56-stack.length*bh+camY;
    x.strokeStyle='#94a3b8';x.beginPath();x.moveTo(cur.x+cur.w/2,0);x.lineTo(cur.x+cur.w/2,cy);x.stroke();
    x.fillStyle='#ec4899';x.fillRect(cur.x,cy,cur.w,bh-2);
  }
  if(over){x.fillStyle='#fbbf24';x.font='900 17px sans-serif';x.textAlign='center';x.fillText('🏆 '+stack.length+' FLOORS IN ${cName}! TAP TO PLAY AGAIN',w/2,h/2);}
  requestAnimationFrame(loop);
}loop();<\/script></body></html>`;
  } else if (genre === 'drone') {
    gameTitleEn = 'Cyber Drone City Flier';
    gameTitleFr = 'Vol de Drone Cyber';
    code = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
html,body{margin:0;height:100%;overflow:hidden;background:#050816;font-family:system-ui,sans-serif;user-select:none;touch-action:none;color:#fff;}
canvas{display:block;width:100%;height:100%;cursor:pointer;}
.hud{position:fixed;top:40px;left:10px;right:10px;display:flex;justify-content:space-between;pointer-events:none;font-weight:900;font-size:12px;}
.pill{background:rgba(8,14,34,0.88);border:1px solid ${col};padding:4px 10px;border-radius:99px;}
</style></head><body>
<div class="hud"><span class="pill">🛸 ${city.flag} ${cName} DRONE FLIER</span><span class="pill" id="sc">🪙 0</span></div>
<canvas id="c"></canvas><script>
const cv=document.getElementById('c'),x=cv.getContext('2d');
let w,h,dy=180,vy=0,gates=[],sc=0,dead=false,frame=0;
function rs(){w=cv.width=innerWidth;h=cv.height=innerHeight;dy=h*0.45;}addEventListener('resize',rs);rs();
cv.addEventListener('pointerdown',()=>{if(dead){dead=false;gates=[];sc=0;dy=h*0.45;vy=-5.5;document.getElementById('sc').textContent='🪙 0';return;}vy=-6.2;});
function loop(){
  x.fillStyle='#050816';x.fillRect(0,0,w,h);frame++;
  if(!dead){
    vy+=0.32;dy+=vy;
    if(frame%85===0)gates.push({x:w+20,gapY:90+Math.random()*(h-210),gapH:118,passed:false});
    if(dy<12||dy>h-48)dead=true;
  }
  for(let i=gates.length-1;i>=0;i--){
    const g=gates[i];if(!dead)g.x-=2.8;
    x.fillStyle='${col}';x.fillRect(g.x,0,26,g.gapY);x.fillRect(g.x,g.gapY+g.gapH,26,h);
    if(!g.passed&&g.x<76){g.passed=true;sc+=10;document.getElementById('sc').textContent='🪙 '+sc;}
    if(78>g.x&&58<g.x+26&&(dy-12<g.gapY||dy+12>g.gapY+g.gapH))dead=true;
    if(g.x<-40)gates.splice(i,1);
  }
  // Neon Drone
  x.shadowColor='#fbbf24';x.shadowBlur=16;x.fillStyle='#fbbf24';
  x.beginPath();x.ellipse(68,dy,18,10,0,0,6.28);x.fill();x.shadowBlur=0;
  if(dead){x.fillStyle='#fff';x.font='900 17px sans-serif';x.textAlign='center';x.fillText('⚡ SCORE '+sc+' — TAP TO FLY OVER ${cName}!',w/2,h/2);}
  requestAnimationFrame(loop);
}loop();<\/script></body></html>`;
  } else if (genre === 'metro') {
    gameTitleEn = '3D Neon Street Dash';
    gameTitleFr = 'Course Néon 3 Voies';
    code = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
html,body{margin:0;height:100%;overflow:hidden;background:#050714;font-family:system-ui,sans-serif;user-select:none;touch-action:none;color:#fff;}
canvas{display:block;width:100%;height:100%;cursor:pointer;}
.hud{position:fixed;top:40px;left:10px;right:10px;display:flex;justify-content:space-between;pointer-events:none;font-weight:900;font-size:12px;}
.pill{background:rgba(8,14,34,0.88);border:1px solid #10b981;padding:4px 10px;border-radius:99px;}
</style></head><body>
<div class="hud"><span class="pill">🚇 ${city.flag} ${cName} 3-LANE DASH</span><span class="pill" id="sc">🪙 0</span></div>
<canvas id="c"></canvas><script>
const cv=document.getElementById('c'),x=cv.getContext('2d');
let w,h,lane=1,sc=0,objs=[],t=0;
function rs(){w=cv.width=innerWidth;h=cv.height=innerHeight;}addEventListener('resize',rs);rs();
cv.addEventListener('pointerdown',e=>{lane=e.clientX<w*0.35?0:e.clientX>w*0.65?2:1;});
setInterval(()=>{objs.push({l:Math.floor(Math.random()*3),z:0.05,coin:Math.random()>0.38});},480);
function loop(){
  x.fillStyle='#050714';x.fillRect(0,0,w,h);t=(t+0.04)%1;
  const hy=h*0.32;
  // Horizon City Silhouette
  x.fillStyle='${col}44';for(let i=0;i<14;i++){const bh=22+((i*19)%45);x.fillRect(i*(w/14),hy-bh,(w/14)-3,bh);}
  // 3D Perspective Road
  x.strokeStyle='${col}';x.lineWidth=2;
  [-1.5,-0.5,0.5,1.5].forEach(k=>{x.beginPath();x.moveTo(w/2+k*24,hy);x.lineTo(w/2+k*(w*0.3),h);x.stroke();});
  for(let i=objs.length-1;i>=0;i--){
    const o=objs[i];o.z+=0.022;
    const py=hy+(h-hy)*o.z,px=w/2+(o.l-1)*(24+(w*0.28)*o.z),sz=8+26*o.z;
    x.fillStyle=o.coin?'#fbbf24':'#f43f5e';
    if(o.coin){x.beginPath();x.arc(px,py,sz*0.6,0,6.28);x.fill();}
    else x.fillRect(px-sz,py-sz*0.4,sz*2,sz*0.8);
    if(o.z>0.82&&o.z<0.95&&o.l===lane){
      sc=o.coin?sc+20:Math.max(0,sc-25);document.getElementById('sc').textContent='🪙 '+sc;objs.splice(i,1);continue;
    }
    if(o.z>1.05)objs.splice(i,1);
  }
  const carX=w/2+(lane-1)*(w*0.26);
  x.shadowColor='#38bdf8';x.shadowBlur=16;x.fillStyle='#38bdf8';
  x.beginPath();x.moveTo(carX,h-64);x.lineTo(carX-22,h-26);x.lineTo(carX+22,h-26);x.closePath();x.fill();x.shadowBlur=0;
  requestAnimationFrame(loop);
}loop();<\/script></body></html>`;
  } else {
    gameTitleEn = 'City Rhythm Synth Piano';
    gameTitleFr = 'Piano Rythmique Néon';
    code = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
html,body{margin:0;height:100%;overflow:hidden;background:#050816;font-family:system-ui,sans-serif;user-select:none;touch-action:none;color:#fff;}
canvas{display:block;width:100%;height:100%;cursor:pointer;}
.hud{position:fixed;top:40px;left:10px;right:10px;display:flex;justify-content:space-between;pointer-events:none;font-weight:900;font-size:12px;}
.pill{background:rgba(8,14,34,0.88);border:1px solid #ec4899;padding:4px 10px;border-radius:99px;}
</style></head><body>
<div class="hud"><span class="pill">🎹 ${city.flag} ${cName} RHYTHM PIANO</span><span class="pill" id="sc">🎵 COMBO: 0</span></div>
<canvas id="c"></canvas><script>
const cv=document.getElementById('c'),x=cv.getContext('2d');
let w,h,tiles=[],combo=0,ac=null;
const notes=[261.6,329.6,392.0,523.25],cols=['#38bdf8','#ec4899','#fbbf24','#10b981'];
function rs(){w=cv.width=innerWidth;h=cv.height=innerHeight;}addEventListener('resize',rs);rs();
setInterval(()=>{tiles.push({col:Math.floor(Math.random()*4),y:-70,hit:false});},460);
function play(f){try{if(!ac)ac=new(window.AudioContext||window.webkitAudioContext)();if(ac.state==='suspended')ac.resume();const o=ac.createOscillator(),g=ac.createGain(),t=ac.currentTime;o.type='triangle';o.frequency.value=f;g.gain.setValueAtTime(0.18,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.35);o.connect(g);g.connect(ac.destination);o.start(t);o.stop(t+0.36);}catch(e){}}
cv.addEventListener('pointerdown',e=>{
  const lane=Math.min(3,Math.floor(e.clientX/(w/4)));
  for(let i=0;i<tiles.length;i++){
    const tl=tiles[i];
    if(!tl.hit&&tl.col===lane&&tl.y>h-190&&tl.y<h-20){
      tl.hit=true;combo++;play(notes[lane]);
      document.getElementById('sc').textContent='🎵 COMBO: '+combo+' 🔥';break;
    }
  }
});
function loop(){
  x.fillStyle='#050816';x.fillRect(0,0,w,h);
  const lw=w/4;
  for(let i=1;i<4;i++){x.strokeStyle='rgba(255,255,255,0.08)';x.beginPath();x.moveTo(i*lw,0);x.lineTo(i*lw,h);x.stroke();}
  x.fillStyle='rgba(251,191,36,0.14)';x.fillRect(0,h-105,w,48);
  for(let i=tiles.length-1;i>=0;i--){
    const tl=tiles[i];tl.y+=3.4;
    if(!tl.hit){
      x.fillStyle=cols[tl.col];x.fillRect(tl.col*lw+6,tl.y,lw-12,64);
    }
    if(tl.y>h+20){if(!tl.hit)combo=0;tiles.splice(i,1);}
  }
  requestAnimationFrame(loop);
}loop();<\/script></body></html>`;
  }

  const area = document.getElementById('createHtmlCodeArea');
  if (area) area.value = code;
  refreshStudioHtmlPreview();

  const enCap = `🎮 Play my ${city.flag} ${city.name_en} "${gameTitleEn}" Arcade Game directly inside this post! Can you beat my score? #${city.code} #LiveHTML`;
  const frCap = `🎮 Jouez à mon jeu d’arcade ${city.flag} ${city.name_fr || city.name_en} « ${gameTitleFr} » directement dans ce post ! #${city.code} #LiveHTML`;
  const inp = document.getElementById('createCaptionInp');
  if (inp) inp.value = lang === 'fr' ? frCap : enCap;
  const drawer = document.getElementById('bilingualCaptionDrawer');
  if (drawer) {
    drawer.style.display = 'grid';
    document.getElementById('createCaptionEnBox').value = enCap;
    document.getElementById('createCaptionFrBox').value = frCap;
  }
  RemoAudio.play('fanfare');
  remoToast(lang === 'fr' ? `🎮 Jeu « ${gameTitleFr} » (${city.flag}) prêt !` : `🎮 "${gameTitleEn}" (${city.flag}) ready!`, 'fanfare');
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
  REMO_STORE.adminAdjustUserCoins(u.uid, 'add', totalPrize);
  if (b.fromUid) REMO_STORE.adminAdjustUserCoins(b.fromUid, 'add', 25);

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
  const isDirectSeoEntry = params.get('from') === 'seo' || params.has('open');
  if (!force && isDirectSeoEntry && !hasWelcomeParam && !hasRefParam) {
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
  const p = (REMO_STORE.state.posts || []).find((x) => String(x.id) === String(postId));
  if (!p) {
    console.warn('Post not found for fullscreen:', postId);
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

function openPhotoLightboxModal(postId) {
  const p = (REMO_STORE.state.posts || []).find((x) => String(x.id) === String(postId));
  if (!p) return;
  currentLightboxPostId = p.id;
  const modal = document.getElementById('photoLightboxModal');
  const img = document.getElementById('photoLightboxImg');
  const title = document.getElementById('photoLightboxTitle');
  const city = (typeof getCityById === 'function') ? (getCityById(p.cityId) || { flag: '🌍', name: 'World' }) : { flag: '🌍', name: 'World' };
  const rawKey = p.mediaUrl || (Array.isArray(p.mediaUrls) ? p.mediaUrls[0] : '');
  let resolved = '';
  if (rawKey.startsWith('http') || rawKey.startsWith('data:') || rawKey.startsWith('blob:')) {
    resolved = rawKey;
  } else if (typeof RemoMediaDB !== 'undefined' && RemoMediaDB.resolveSyncOrPlaceholder) {
    resolved = RemoMediaDB.resolveSyncOrPlaceholder(rawKey);
  } else {
    resolved = rawKey;
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
  if (img) img.src = '';
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
  return n.text || '';
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
  } else if ((item.type === 'comment' || item.type === 'like' || item.type === 'reaction' || item.type === 'tip' || item.type === 'mystery_solved') && item.postId) {
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

  const userPosts = (REMO_STORE.state.posts || []).filter((p) =>
    p && ((p.uid && p.uid === target.uid) || (p.authorName && target.name && p.authorName.trim().toLowerCase() === target.name.trim().toLowerCase()))
  );
  const userCards = (REMO_STORE.state.droppedCardsPool || []).filter((c) => c && c.ownerUid === target.uid);
  const followersCount = REMO_STORE.getFollowersCount ? REMO_STORE.getFollowersCount(target.uid) : 0;
  const followingCount = Array.isArray(target.following) ? target.following.length : 0;

  if (shareHdrBtn) {
    shareHdrBtn.onclick = () => shareCitizenProfileLink(target.name || target.uid);
  }

  body.innerHTML = `
    <div class="public-profile-hero">
      <div class="pp-avatar-lg ${cosm.frameClass || ''}">
        ${escapeHtmlStr((target.name || 'R')[0].toUpperCase())}
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
      <button type="button" class="btn-ghost" onclick="shareCitizenProfileLink('${escapeHtmlStr(target.name || target.uid)}')">
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

  return `
    <div class="game-leaderboard-box" id="glbBox_${p.id}">
      <div class="glb-header">
        <span class="glb-title">${escapeHtmlStr(t('game_lb_title'))}</span>
        ${lb.length > 0 ? `<span style="font-size:0.7rem;color:#34d399;font-weight:800;">#1 · ${Number(lb[0].score || 0).toLocaleString()} pts</span>` : ''}
      </div>
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
  const score = Math.floor(Number(d.score || 0));
  if (!Number.isFinite(score) || score <= 0) return;

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
    if (res.isNewRecord) {
      RemoAudio.play('fanfare');
      spawnRemoCoinsFX(12);
      remoToast(t('game_new_record_toast', { score: score.toLocaleString() }), 'fanfare');
    } else {
      RemoAudio.play('coin');
      remoToast(t('game_score_saved_toast', { score: score.toLocaleString() }), 'coin');
    }
    syncHeaderAndSidebars();
    refreshSingleGameLeaderboardDOM(postId);
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
  const p = (REMO_STORE.state.posts || []).find((x) => x && x.id === postId);
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
  window.open(waUrl, '_blank', 'noopener');
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
  const myTaps = Number(localStorage.getItem('remo_war_taps_' + w.id) || 0);
  const prefSide = (window._activeWarDeepLink && window._activeWarDeepLink.side) || (pA >= pB ? 'A' : 'B');

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
      <button type="button" class="war-pulse-btn side-a" style="padding:7px 8px;font-size:0.71rem;" onclick="voteCityWar('${w.id}','A',event)">
        ${cA.flag} ${escapeHtmlStr(getCityName(cA, lang))} · ${escapeHtmlStr(t('war_tap_btn'))}
      </button>
      <button type="button" class="war-pulse-btn side-b" style="padding:7px 8px;font-size:0.71rem;" onclick="voteCityWar('${w.id}','B',event)">
        ${cB.flag} ${escapeHtmlStr(getCityName(cB, lang))} · ${escapeHtmlStr(t('war_tap_btn'))}
      </button>
    </div>
    ${(!u && myTaps >= 15) ? `
      <div style="margin-top:7px;display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:0.72rem;color:#fde047;font-weight:800;">
        <span>${escapeHtmlStr(t('war_guest_claim_bar', { taps: myTaps, city: getCityName(prefSide === 'B' ? cB : cA, lang) }))}</span>
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
  const total = mCoins + wCoins;
  if (total > 0) {
    localStorage.removeItem('remo_guest_mystery_coins');
    localStorage.removeItem('remo_guest_war_coins');
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
  const canSyncDuet = !isDuet && ['image', 'carousel', 'city_art'].includes(p.mediaType);
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

function _loadImageSafeForStory(srcUrl) {
  return new Promise((resolve) => {
    if (!srcUrl) { resolve(null); return; }
    let resolvedSrc = srcUrl;
    if (String(srcUrl).startsWith('idb://') && typeof RemoMediaDB !== 'undefined') {
      resolvedSrc = RemoMediaDB.resolveSyncOrPlaceholder(srcUrl) || '';
    }
    if (!resolvedSrc) { resolve(null); return; }
    const img = new Image();
    if (/^https?:/i.test(resolvedSrc)) img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
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
  const rightImg = await _loadImageSafeForStory(p.mediaUrl || (p.mediaUrls && p.mediaUrls[0]) || '');

  if (p.duetOf && p.duetOf.cityId) {
    const leftCity = getCityById(p.duetOf.cityId);
    const leftWx = REMO_WEATHER.getCityLiveStatus(leftCity);
    const leftImg = await _loadImageSafeForStory(p.duetOf.mediaUrl || (p.duetOf.mediaUrls && p.duetOf.mediaUrls[0]) || '');

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
  const p = (REMO_STORE.state.posts || []).find((x) => x && x.id === postId);
  if (!p || !p.beatPattern) return;
  const lang = REMO_I18N.getLang();

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



