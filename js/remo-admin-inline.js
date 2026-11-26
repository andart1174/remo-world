/* ════════════════════════════════════════════════════════════════════
   👑 REMO World — Dynamic Admin Inline Studio (Lazy-Loaded ONLY for Verified Admin)
   Zero Admin UI markup is shipped in public index.html for visitors/citizens.
   ════════════════════════════════════════════════════════════════════ */
(function () {
  function isVerifiedAdminActive() {
    if (typeof REMO_STORE === 'undefined' || !REMO_STORE) return false;
    const u = REMO_STORE.getCurrentUser();
    const isGuest = Boolean(!u || (typeof REMO_STORE.isFakeOrGuestUser === 'function' && REMO_STORE.isFakeOrGuestUser(u)) || u.role === 'guest');
    return Boolean(REMO_STORE.isCurrentUserAdmin() && REMO_STORE.isAdminUnlocked() && !isGuest);
  }

  function ensureAdminQuickModalDom() {
    if (document.getElementById('adminQuickModal')) return document.getElementById('adminQuickModal');
    const wrap = document.createElement('div');
    wrap.innerHTML = `
      <div class="remo-modal-backdrop" id="adminQuickModal" onclick="if(event.target===this)this.classList.remove('open')">
        <div class="remo-modal" style="max-width:600px;border-color:#fbbf24;">
          <div class="modal-hdr">
            <b id="admQuickTitleEl" style="font-family:'Orbitron',sans-serif;color:#fbbf24;">⚡ Executive Studio</b>
            <button class="modal-close" onclick="document.getElementById('adminQuickModal').classList.remove('open')">✕</button>
          </div>

          <div id="admQuickAuthBox" style="display:none;text-align:center;padding:12px 0;">
            <p id="admQuickSubEl" style="font-size:0.84rem;color:var(--muted);margin-bottom:12px;"></p>
            <div style="display:flex;justify-content:center;gap:8px;max-width:340px;margin:0 auto;">
              <button type="button" class="btn-cyber btn-gold" onclick="unlockAdminGodModeInline()" data-i18n="adm_google_btn">🌐 Continue with Admin Google Account</button>
            </div>
          </div>

          <div id="admQuickControlsBox" style="display:none;flex-direction:column;gap:14px;">
            <button type="button" class="btn-cyber" style="width:100%;justify-content:center;padding:12px;font-size:0.88rem;font-weight:900;background:linear-gradient(135deg,#0284c7,#6366f1);box-shadow:0 6px 20px rgba(2,132,199,0.4);" onclick="document.getElementById('adminQuickModal').classList.remove('open');openViralPromoStudioModal();">
              👑 <span data-i18n="promo_studio_title">📣 1-Click Viral Promo Studio (FB / TikTok / Reddit / X)</span>
            </button>

            <div style="background:rgba(251,191,36,0.08);border:1px solid rgba(251,191,36,0.4);border-radius:16px;padding:14px;">
              <div style="font-weight:900;font-size:0.86rem;color:#fbbf24;margin-bottom:10px;" data-i18n="adm_transfer_hdr">🪙 Send / Set REMO Coins to Any Citizen</div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">
                <select id="admTransferUserSel" class="remo-input"></select>
                <select id="admTransferModeSel" class="remo-input">
                  <option value="add">➕ Add / Gift Coins (+)</option>
                  <option value="sub">➖ Deduct / Fine Coins (-)</option>
                  <option value="set">🎯 Set Exact Balance (=)</option>
                </select>
              </div>
              <div style="display:grid;grid-template-columns:140px 1fr;gap:8px;margin-bottom:8px;">
                <input type="number" id="admTransferAmtInp" class="remo-input" value="500" min="1" max="10000000" placeholder="Coins">
                <input type="text" id="admTransferNoteInp" class="remo-input" placeholder="Optional Founder message (e.g. Bravo for your post!)">
              </div>
              <div style="display:flex;gap:8px;flex-wrap:wrap;">
                <button class="btn-cyber btn-gold" style="flex:1;justify-content:center;" onclick="executeInlineAdminCoinTransfer()" data-i18n="adm_transfer_btn">⚡ Execute Coin Transfer</button>
                <button class="btn-ghost" onclick="quickCreateNewCitizenByAdmin()">👤+ New Citizen</button>
              </div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
              <button class="btn-cyber" id="btnToggleHappyHour" style="justify-content:center;background:linear-gradient(135deg,#10b981,#059669);" onclick="toggleHappyHour2xInline()">⚡ Toggle 2X Happy Hour</button>
              <button class="btn-cyber btn-gold" style="justify-content:center;" onclick="triggerInlineCoinRain()">🌧️ Global Coin Rain</button>
            </div>

            <div style="background:rgba(168,85,247,0.09);border:1px solid rgba(168,85,247,0.38);border-radius:16px;padding:12px;">
              <div style="font-weight:900;font-size:0.84rem;color:#e879f9;margin-bottom:8px;" data-i18n="adm_weather_hdr">⛈️ City 2X Weather Surge Trigger (Storm / Snow Bonus)</div>
              <div style="display:grid;grid-template-columns:1fr auto;gap:8px;">
                <select id="admSurgeCitySelect" class="remo-input"></select>
                <button class="btn-cyber" style="background:linear-gradient(135deg,#7c3aed,#ec4899);" onclick="toggleAdminCitySurgeInline()" data-i18n="adm_weather_btn">⚡ Toggle 2X City Surge</button>
              </div>
            </div>

            <div style="background:rgba(56,189,248,0.07);border:1px solid rgba(56,189,248,0.35);border-radius:16px;padding:12px;">
              <div style="font-weight:900;font-size:0.84rem;color:#38bdf8;margin-bottom:8px;" data-i18n="adm_promo_hdr">🎟️ Create Redeemable Promo / Gift Code</div>
              <div style="display:grid;grid-template-columns:1fr 110px 1fr;gap:7px;margin-bottom:8px;">
                <input type="text" id="admNewPromoCode" class="remo-input" style="text-transform:uppercase;" placeholder="VIP500">
                <input type="number" id="admNewPromoCoins" class="remo-input" value="500" placeholder="Coins">
                <select id="admNewPromoCityCard" class="remo-input"></select>
              </div>
              <button class="btn-cyber" style="width:100%;justify-content:center;" onclick="createPromoCodeInline()" data-i18n="adm_promo_btn">🎟️ Generate Code</button>
            </div>

            <div style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.38);border-radius:16px;padding:12px;">
              <div style="font-weight:900;font-size:0.84rem;color:#34d399;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;">
                <span>📩 Support &amp; Contact Inbox</span>
                <span id="admQuickSupportCountBadge" style="background:#ef4444;color:#fff;border-radius:99px;padding:1px 8px;font-size:0.72rem;display:none;">0</span>
              </div>
              <div id="admQuickSupportList" style="max-height:190px;overflow-y:auto;display:flex;flex-direction:column;gap:8px;font-size:0.78rem;"></div>
            </div>

            <div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;padding-top:6px;border-top:1px solid var(--border);">
              <a href="admin.html" class="btn-cyber btn-gold">🛡️ Full Admin Office &amp; 300 DPI Card Studio</a>
              <button class="btn-ghost" style="border-color:#f43f5e;color:#fda4af;" onclick="lockAdminGodModeInline()">🔒 Lock Admin Mode</button>
            </div>
          </div>
        </div>
      </div>
    `;
    const modal = wrap.firstElementChild;
    document.body.appendChild(modal);
    return modal;
  }

  function mountInlineAdminUI() {
    if (!isVerifiedAdminActive()) {
      unmountInlineAdminUI();
      return;
    }

    const isAdmUnlocked = REMO_STORE.isAdminUnlocked();
    const tr = (k, fallback) => (typeof t === 'function' ? t(k) : fallback);

    // 1. Header Admin Buttons
    const hdrRight = document.querySelector('.header-right');
    if (hdrRight) {
      let godBtn = document.getElementById('hdrAdminGodBtn');
      if (!godBtn) {
        godBtn = document.createElement('button');
        godBtn.className = 'admin-god-pill';
        godBtn.id = 'hdrAdminGodBtn';
        godBtn.type = 'button';
        godBtn.setAttribute('data-remo-admin-injected', '1');
        godBtn.onclick = () => window.openAdminQuickModal && window.openAdminQuickModal();
        hdrRight.appendChild(godBtn);
      }
      godBtn.style.display = 'inline-flex';
      godBtn.classList.toggle('active', isAdmUnlocked);
      godBtn.textContent = isAdmUnlocked ? tr('btn_admin_mode_on', '👑 Admin ON') : tr('btn_admin_mode_off', '👑 Admin');

      let officeLink = document.getElementById('hdrAdminOfficeLink');
      if (!officeLink) {
        officeLink = document.createElement('a');
        officeLink.href = 'admin.html';
        officeLink.className = 'btn-ghost hide-mobile';
        officeLink.id = 'hdrAdminOfficeLink';
        officeLink.setAttribute('data-remo-admin-injected', '1');
        officeLink.setAttribute('data-i18n', 'btn_admin_office');
        officeLink.style.cssText = 'border-color:rgba(251,191,36,0.5);color:#fbbf24;';
        officeLink.textContent = tr('btn_admin_office', '🛡️ Admin Office');
        hdrRight.appendChild(officeLink);
      }
      officeLink.style.display = 'inline-flex';
    }

    // 2. Left Sidebar Executive Control Box
    const leftRail = document.querySelector('.left-rail');
    if (leftRail && !document.getElementById('sidebarAdminBox')) {
      const box = document.createElement('div');
      box.className = 'glass-box';
      box.id = 'sidebarAdminBox';
      box.setAttribute('data-remo-admin-injected', '1');
      box.style.borderColor = 'rgba(251,191,36,0.35)';
      box.innerHTML = `
        <div style="font-weight:800;font-size:0.84rem;color:#fbbf24;margin-bottom:8px;">🛡️ Executive Control</div>
        <button type="button" class="btn-cyber" style="width:100%;justify-content:center;margin-bottom:8px;background:linear-gradient(135deg,#0284c7,#6366f1);" onclick="openViralPromoStudioModal()" data-i18n="nav_promo_studio">${tr('nav_promo_studio', '📣 Viral Promo Studio')}</button>
        <a href="admin.html" class="btn-cyber btn-gold" style="width:100%;justify-content:center;" data-i18n="btn_admin_office">${tr('btn_admin_office', '🛡️ Admin Office')}</a>
      `;
      leftRail.appendChild(box);
    }

    // 3. Feed Toolbar Promo Studio Chip
    const feedChips = document.getElementById('feedModeChips');
    const moreBtn = document.getElementById('btnToggleMoreFilters');
    if (feedChips && !document.getElementById('feedChipAdminPromoBtn')) {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'fchip';
      chip.id = 'feedChipAdminPromoBtn';
      chip.setAttribute('data-remo-admin-injected', '1');
      chip.style.cssText = 'border-color:rgba(56,189,248,0.65);color:#7dd3fc;font-weight:900;';
      chip.onclick = () => window.openViralPromoStudioModal && window.openViralPromoStudioModal();
      chip.innerHTML = `👑 <span data-i18n="promo_studio_chip">${tr('promo_studio_chip', '📣 Promo Studio')}</span>`;
      if (moreBtn && moreBtn.parentNode === feedChips) {
        feedChips.insertBefore(chip, moreBtn);
      } else {
        feedChips.appendChild(chip);
      }
    }

    // 4. Radar Admin Controls
    const radarBtnsWrap = document.getElementById('radarActionButtonsWrap');
    if (radarBtnsWrap) {
      if (!document.getElementById('btnRadarBuryVault')) {
        const buryBtn = document.createElement('button');
        buryBtn.type = 'button';
        buryBtn.className = 'btn-cyber btn-gold';
        buryBtn.id = 'btnRadarBuryVault';
        buryBtn.setAttribute('data-remo-admin-injected', '1');
        buryBtn.setAttribute('data-i18n', 'radar_bury_vault_btn');
        buryBtn.style.cssText = 'background:linear-gradient(135deg,#f59e0b,#fbbf24);color:#0f172a;font-weight:900;box-shadow:0 0 16px rgba(245,158,11,0.5);';
        buryBtn.onclick = () => window.openBuryGeoVaultModal && window.openBuryGeoVaultModal();
        buryBtn.textContent = tr('radar_bury_vault_btn', '👑 🎁 Plant Secret Chest');
        radarBtnsWrap.insertBefore(buryBtn, radarBtnsWrap.firstChild);
      }
      if (!document.getElementById('btnRadarDropPin')) {
        const dropBtn = document.createElement('button');
        dropBtn.type = 'button';
        dropBtn.className = 'btn-ghost';
        dropBtn.id = 'btnRadarDropPin';
        dropBtn.setAttribute('data-remo-admin-injected', '1');
        dropBtn.setAttribute('data-i18n', 'radar_drop_pin');
        dropBtn.onclick = () => window.startAdminDropPin && window.startAdminDropPin();
        dropBtn.textContent = tr('radar_drop_pin', '📌 Drop Live Pin');
        radarBtnsWrap.appendChild(dropBtn);
      }
    }

    // 5. App Launcher Modal Admin Tile + Studio/Office Row
    const launcherGrid = document.querySelector('#appLauncherModal .apps-launcher-grid');
    if (launcherGrid && !document.getElementById('appLauncherAdminPromoTile')) {
      const tile = document.createElement('button');
      tile.type = 'button';
      tile.className = 'app-tile';
      tile.id = 'appLauncherAdminPromoTile';
      tile.setAttribute('data-remo-admin-injected', '1');
      tile.style.borderColor = '#38bdf8';
      tile.onclick = () => {
        if (typeof closeAppLauncherModal === 'function') closeAppLauncherModal();
        if (typeof openViralPromoStudioModal === 'function') openViralPromoStudioModal();
      };
      tile.innerHTML = `<span class="app-tile-ic">📣</span><span class="app-tile-lbl" data-i18n="nav_promo_studio">${tr('nav_promo_studio', 'Viral Promo Studio')}</span>`;
      launcherGrid.appendChild(tile);
    }
    if (launcherGrid && launcherGrid.parentNode && !document.getElementById('appLauncherAdminRow')) {
      const row = document.createElement('div');
      row.id = 'appLauncherAdminRow';
      row.setAttribute('data-remo-admin-injected', '1');
      row.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px;';
      row.innerHTML = `
        <button type="button" class="btn-ghost" id="mbHubAdminGodBtn" onclick="closeAppLauncherModal();openAdminQuickModal()" style="justify-content:center;">👑 Admin Studio</button>
        <a href="admin.html" id="mbHubAdminOfficeBtn" class="btn-cyber btn-gold" style="justify-content:center;">🛡️ Admin Office</a>
      `;
      launcherGrid.insertAdjacentElement('afterend', row);
    }

    // 6. Mount Quick Studio Modal on demand
    ensureAdminQuickModalDom();

    if (typeof REMO_I18N !== 'undefined' && typeof REMO_I18N.applyToDOM === 'function') {
      try { REMO_I18N.applyToDOM(); } catch (e) {}
    }
  }

  function unmountInlineAdminUI() {
    document.querySelectorAll('[data-remo-admin-injected="1"]').forEach((el) => el.remove());
    const modal = document.getElementById('adminQuickModal');
    if (modal) modal.remove();
  }

  function openAdminQuickModalImpl(preselectUid = '') {
    if (typeof REMO_STORE === 'undefined' || !REMO_STORE.isCurrentUserAdmin()) {
      const lang = typeof REMO_I18N !== 'undefined' ? REMO_I18N.getLang() : 'en';
      if (typeof remoToast === 'function') {
        remoToast(lang === 'fr' ? '🔒 Accès réservé à l’Administration Officielle REMO.' : '🔒 Access restricted to Official REMO Administration.');
      }
      return;
    }

    const modal = ensureAdminQuickModalDom();
    const authBox = document.getElementById('admQuickAuthBox');
    const ctrlBox = document.getElementById('admQuickControlsBox');
    if (!modal) return;

    const titleEl = document.getElementById('admQuickTitleEl');
    const subEl = document.getElementById('admQuickSubEl');
    if (titleEl && typeof t === 'function') titleEl.textContent = t('adm_quick_title');
    if (subEl && typeof t === 'function') subEl.textContent = t('adm_unlock_sub');

    const isAdm = REMO_STORE.isAdminUnlocked();
    if (authBox) authBox.style.display = isAdm ? 'none' : 'block';
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

  window.REMO_ADMIN_INLINE = {
    mount: mountInlineAdminUI,
    unmount: unmountInlineAdminUI,
    openQuickModal: openAdminQuickModalImpl
  };
  window.openAdminQuickModal = openAdminQuickModalImpl;

  if (isVerifiedAdminActive()) {
    mountInlineAdminUI();
  }
})();
