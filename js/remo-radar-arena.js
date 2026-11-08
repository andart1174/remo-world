/* ════════════════════════════════════════════════════════════════════
   🗺️⚔️🎴 REMO — Radar Map, City Wars, 3D Card PvP, Pack Vault,
   3D Visa Passport, Auction House & Daily Lucky Wheel Engine
   Strictly Bilingual (EN / FR ONLY)
   ════════════════════════════════════════════════════════════════════ */

let remoMap = null;
let remoTileLayer = null;
let remoMarkersLayer = null;
let activeInspectedCard = null;

function remoToast(msg, playSfx = '') {
  if (playSfx) RemoAudio.play(playSfx);
  const box = document.getElementById('remoToastBox');
  if (!box) return;
  const el = document.createElement('div');
  el.className = 'remo-toast';
  el.textContent = msg;
  box.appendChild(el);
  setTimeout(() => el.remove(), 3400);
}

function spawnRemoCoinsFX(count = 8) {
  for (let i = 0; i < count; i++) {
    const d = document.createElement('div');
    d.className = 'coin-drop-fx';
    d.textContent = '🪙';
    d.style.left = (22 + Math.random() * 56) + 'vw';
    d.style.top = (42 + Math.random() * 28) + 'vh';
    d.style.animationDelay = (i * 0.06) + 's';
    document.body.appendChild(d);
    setTimeout(() => d.remove(), 1450);
  }
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
window.haversineKm = haversineKm;

/* ── 1. REMO EARTH™ LIVE LEAFLET RADAR MAP (100% Free, Zero API Key, file:// Safe!) ── */
let remoLabelsOverlayLayer = null;
let currentRadarMode = 'dark';

const MAP_TILES = {
  // Uses Esri World Street Map + Cyber Neon Dark CSS filter on tile-pane (zero API key, works on file:// & https://)
  dark: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
  street: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
  sat: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  topo: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
  satLabels: 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
  darkFallback: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}'
};

function initRemoRadarMap() {
  const el = document.getElementById('remoLeafletMap');
  if (!el) return;
  if (typeof L === 'undefined') {
    if (!window._remoLeafletLoadBound) {
      window._remoLeafletLoadBound = true;
      window.addEventListener('load', () => {
        if (typeof L !== 'undefined' && document.getElementById('view-radar')?.classList.contains('active')) {
          initRemoRadarMap();
        }
      });
    }
    return;
  }

  if (!remoMap) {
    const user = REMO_STORE.getCurrentUser();
    const startCity = getCityById(user ? user.homeCity : 'montreal');
    remoMap = L.map('remoLeafletMap', {
      zoomControl: true,
      attributionControl: false
    }).setView([startCity.lat, startCity.lng], 12);

    remoMarkersLayer = L.layerGroup().addTo(remoMap);
    setRadarTileStyle('dark');

    // Auto-resize observer so map never renders partial grey tiles when switching tabs
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(() => {
        if (remoMap) remoMap.invalidateSize();
      });
      ro.observe(el);
    }

    remoMap.on('click', (ev) => {
      if (window._adminChestPickMode) {
        window._adminChestPickMode = false;
        openBuryGeoVaultModalAtCoords(ev.latlng.lat, ev.latlng.lng);
        return;
      }
      if (!window._dropPinMode) return;
      window._dropPinMode = false;
      const lang = REMO_I18N.getLang();
      if (!REMO_STORE.isAdminUnlocked() && !REMO_STORE.isCurrentUserAdmin()) {
        remoToast(lang === 'fr' ? 'La pose de balises est réservée à l’administrateur.' : 'Dropping pins is admin only.');
        return;
      }
      const title = prompt(lang === 'fr' ? 'Titre de votre balise live :' : 'Title for your live map pin:');
      if (!title) return;
      const nearest = findNearestRemoCity(ev.latlng.lat, ev.latlng.lng);
      REMO_STORE.state.radarPins.push({
        id: 'pin_' + Date.now(),
        cityId: nearest.city.id,
        lat: ev.latlng.lat,
        lng: ev.latlng.lng,
        title_en: title,
        title_fr: title,
        reward: 35
      });
      const u = REMO_STORE.getCurrentUser();
      if (u) REMO_STORE.addCoins(u.uid, 15, 15);
      REMO_STORE.save(true, 'radar_pin');
      refreshRadarMarkers();
      remoToast(lang === 'fr' ? '📌 Balise publiée (+15 🪙) !' : '📌 Live Pin dropped (+15 🪙)!', 'coin');
    });

    // Admin Right-Click / Contextmenu to plant GeoVault anywhere on Earth!
    remoMap.on('contextmenu', (ev) => {
      if (REMO_STORE.isAdminUnlocked() || REMO_STORE.isCurrentUserAdmin()) {
        openBuryGeoVaultModalAtCoords(ev.latlng.lat, ev.latlng.lng);
      }
    });

    // Radar Sonar Proximity HUD update
    remoMap.on('move', () => {
      if (typeof updateRadarSonarHUD === 'function') updateRadarSonarHUD();
    });
  }

  setTimeout(() => { if (remoMap) remoMap.invalidateSize(); }, 80);
  setTimeout(() => { if (remoMap) remoMap.invalidateSize(); }, 350);
  renderRadarCityTeleportBar();
  refreshRadarMarkers();
}

function setRadarTileStyle(mode, chipEl = null) {
  const el = document.getElementById('remoLeafletMap');
  if (!remoMap || !MAP_TILES[mode]) return;
  currentRadarMode = mode;

  if (chipEl) {
    document.querySelectorAll('#radarLayerChips .fchip').forEach((b) => b.classList.remove('active'));
    chipEl.classList.add('active');
  }

  if (el) {
    el.classList.toggle('remo-map-cyber-dark', mode === 'dark');
  }

  if (remoTileLayer) {
    remoMap.removeLayer(remoTileLayer);
    remoTileLayer = null;
  }
  if (remoLabelsOverlayLayer) {
    remoMap.removeLayer(remoLabelsOverlayLayer);
    remoLabelsOverlayLayer = null;
  }

  let errorCount = 0;
  remoTileLayer = L.tileLayer(MAP_TILES[mode], { maxZoom: 19 });
  remoTileLayer.on('tileerror', () => {
    errorCount++;
    if (errorCount === 4 && mode === 'dark' && remoMap) {
      if (el) el.classList.remove('remo-map-cyber-dark');
      remoMap.removeLayer(remoTileLayer);
      remoTileLayer = L.tileLayer(MAP_TILES.darkFallback, { maxZoom: 16 }).addTo(remoMap);
    }
  });
  remoTileLayer.addTo(remoMap);

  if (mode === 'sat') {
    remoLabelsOverlayLayer = L.tileLayer(MAP_TILES.satLabels, { maxZoom: 19, opacity: 0.92 }).addTo(remoMap);
  }
}

function locateMeOnRadar() {
  const lang = REMO_I18N.getLang();
  if (!navigator.geolocation || !remoMap) {
    remoToast(lang === 'fr' ? 'GPS non disponible sur cet appareil.' : 'GPS unavailable on this device.');
    return;
  }
  remoToast(lang === 'fr' ? '📡 Recherche satellite GPS...' : '📡 Acquiring live GPS lock...');
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      remoMap.flyTo([latitude, longitude], 14, { duration: 1.3 });
      const near = findNearestRemoCity(latitude, longitude);
      L.circleMarker([latitude, longitude], {
        radius: 10,
        color: '#38bdf8',
        fillColor: '#6366f1',
        fillOpacity: 0.9,
        weight: 3
      })
        .addTo(remoMarkersLayer)
        .bindPopup(`<b>📍 ${lang === 'fr' ? 'Vous êtes ici' : 'You are here'}</b><br>${near.city.flag} ${getCityName(near.city, lang)}`)
        .openPopup();
      RemoAudio.play('coin');
    },
    () => {
      remoToast(lang === 'fr' ? 'Accès GPS refusé — sélectionnez une ville ci-dessus.' : 'GPS permission denied — tap any city above.');
    },
    { enableHighAccuracy: true, timeout: 8000 }
  );
}

function renderRadarCityTeleportBar() {
  const bar = document.getElementById('radarTeleportBar');
  if (!bar) return;
  const lang = REMO_I18N.getLang();
  bar.innerHTML = getRemoCities().map((c) => `
    <button class="fchip" onclick="teleportRadarCity('${c.id}')">
      ${c.flag} ${getCityName(c, lang)}
    </button>
  `).join('');
  if (typeof initDesktopHorizontalScrollRails === 'function') {
    setTimeout(initDesktopHorizontalScrollRails, 20);
  }
}

function teleportRadarCity(cityId) {
  const c = getCityById(cityId);
  if (!c || !remoMap) return;
  RemoAudio.play('click');
  remoMap.flyTo([c.lat, c.lng], 13, { duration: 1.2 });
}

function refreshRadarMarkers() {
  if (!remoMap || !remoMarkersLayer) return;
  remoMarkersLayer.clearLayers();
  const lang = REMO_I18N.getLang();

  // City Hub Beacons
  getRemoCities().forEach((c) => {
    const score = REMO_STORE.state.cityScores[c.id] || 1000;
    const wx = typeof REMO_WEATHER !== 'undefined' ? REMO_WEATHER.getCityLiveStatus(c) : null;
    const surgeBadge = wx && wx.isSurge ? ' ⚡2X' : '';
    const icon = L.divIcon({
      className: 'remo-city-pin',
      html: `<div style="background:#0d1428;border:2px solid ${wx && wx.isSurge ? '#fbbf24' : c.themeColor};color:#fff;padding:3px 8px;border-radius:99px;font-weight:800;font-size:11px;white-space:nowrap;box-shadow:0 0 12px ${wx && wx.isSurge ? '#fbbf24' : c.themeColor};">${c.flag} ${c.code}${wx ? ` · ${wx.icon}` : ''}${surgeBadge}</div>`,
      iconSize: [92, 26]
    });
    L.marker([c.lat, c.lng], { icon })
      .addTo(remoMarkersLayer)
      .bindPopup(`
        <div style="color:#0f172a;font-family:Outfit,sans-serif;min-width:195px;">
          <b>${c.flag} ${getCityName(c, lang)}</b><br>
          ${wx ? `<span style="font-size:12px;font-weight:700;color:#334155;">🕒 ${wx.timeStr} · ${wx.icon} ${wx.tempC}°C (${lang === 'fr' ? wx.cond_fr : wx.cond_en})</span><br>` : ''}
          ${wx && wx.isSurge ? `<span style="display:inline-block;margin:2px 0;background:#f59e0b;color:#fff;padding:1px 7px;border-radius:99px;font-size:11px;font-weight:800;">⚡ 2X WEATHER SURGE</span><br>` : ''}
          <span style="font-size:12px;">🏆 ${score.toLocaleString()} PTS</span><br>
          <button onclick="filterFeedByCityFromMap('${c.id}')" style="margin-top:6px;background:#6366f1;color:#fff;border:none;border-radius:6px;padding:5px 10px;cursor:pointer;font-weight:700;">
            ${lang === 'fr' ? 'Voir les Posts' : 'View City Posts'}
          </button>
        </div>
      `);
  });

  // Event & Drop Pins (Balises & Flash Drops)
  const isAdm = REMO_STORE.isAdminUnlocked() || REMO_STORE.isCurrentUserAdmin();
  (REMO_STORE.state.radarPins || []).forEach((p) => {
    const claimedKey = 'remo_pin_claimed_' + p.id;
    const claimed = !!localStorage.getItem(claimedKey);
    // Once claimed or taken, DISAPPEAR from the map!
    if (claimed) return;

    const isSpot = Boolean(p.isSecretSpot);
    const pinIcon = L.divIcon({
      className: isSpot ? 'remo-secret-spot-pin' : 'remo-spot-pin',
      html: `<div style="font-size:24px;filter:drop-shadow(0 0 10px ${isSpot ? '#38bdf8' : '#fbbf24'});">${isSpot ? '🗺️' : '💎'}</div>`,
      iconSize: [30, 30]
    });
    const ttl = lang === 'fr' ? (p.title_fr || p.title_en) : p.title_en;
    L.marker([p.lat, p.lng], { icon: pinIcon })
      .addTo(remoMarkersLayer)
      .bindPopup(`
        <div style="color:#0f172a;font-family:Outfit,sans-serif;min-width:205px;">
          ${isSpot ? `<div style="font-size:10px;font-weight:900;background:#0284c7;color:#fff;padding:2px 7px;border-radius:4px;display:inline-block;margin-bottom:4px;letter-spacing:0.5px;">🗺️ LIEU SECRET URBAIN</div><br>` : ''}
          <b>${isSpot ? '🗺️' : '💎'} ${ttl}</b><br>
          ${p.clue ? `<div style="font-size:11px;color:#475569;margin-top:2px;font-style:italic;">💡 Indice: "${escapeHtmlStr(p.clue)}"</div>` : ''}
          <span style="font-size:12px;color:#d97706;font-weight:700;">+${p.reward || 50} REMO Coins</span><br>
          <button onclick="claimRadarSpot('${p.id}', ${p.reward || 50})" style="margin-top:6px;background:${isSpot ? 'linear-gradient(135deg,#0284c7,#38bdf8)' : '#f59e0b'};color:${isSpot ? '#fff' : '#000'};border:none;border-radius:6px;padding:5px 12px;cursor:pointer;font-weight:800;font-size:12px;">
            ${isSpot ? (lang === 'fr' ? '🔓 Découvrir & Réclamer' : '🔓 Discover & Claim') : (lang === 'fr' ? 'Réclamer Drop' : 'Claim Drop')}
          </button>
          ${isAdm ? `
            <div style="margin-top:6px;">
              <button onclick="adminDeleteRadarPin('${p.id}')" style="background:#ef4444;color:#fff;border:none;border-radius:6px;padding:4px 8px;cursor:pointer;font-size:11px;font-weight:700;">
                🗑️ ${lang === 'fr' ? 'Supprimer Balise (Admin)' : 'Delete Live Pin (Admin)'}
              </button>
            </div>
          ` : ''}
        </div>
      `);
  });

  // Active 15-Minute Flash Super Drop
  const fd = REMO_STORE.state.settings.flashDrop;
  if (fd && fd.active && fd.expiresAt > Date.now()) {
    const claimKey = 'remo_flash_claimed_' + fd.expiresAt;
    if (!localStorage.getItem(claimKey)) {
      const fdIcon = L.divIcon({
        className: 'remo-flash-pin',
        html: `<div style="background:linear-gradient(135deg,#f59e0b,#f43f5e);color:#fff;padding:5px 10px;border-radius:99px;font-weight:900;font-size:12px;box-shadow:0 0 20px #fbbf24;white-space:nowrap;">⚡ +${fd.coins} 🪙 FLASH</div>`,
        iconSize: [110, 30]
      });
      const sName = lang === 'fr' ? (fd.spotName_fr || fd.spotName_en) : fd.spotName_en;
      L.marker([fd.lat, fd.lng], { icon: fdIcon })
        .addTo(remoMarkersLayer)
        .bindPopup(`
          <div style="color:#0f172a;font-family:Outfit,sans-serif;min-width:200px;">
            <b>⚡ ${sName}</b><br>
            <span style="color:#e11d48;font-weight:800;">+${fd.coins} REMO Coins!</span><br>
            <button onclick="claimFlashSuperDrop()" style="margin-top:6px;background:#e11d48;color:#fff;border:none;border-radius:6px;padding:6px 12px;cursor:pointer;font-weight:800;">
              ⚡ ${lang === 'fr' ? 'Réclamer Super Drop' : 'Claim Super Drop'}
            </button>
          </div>
        `);
    }
  }

  // 💎 Render Real-World Urban Geo-Vaults on Radar Map
  renderRadarGeoVaultMarkers();
}

/* ════════════════════════════════════════════════════════════════════
   💎 URBAN GEO-VAULTS ENGINE (Real-World AR Treasure Hunts)
   Strictly Bilingual: English (EN) & French (FR) ONLY
   ════════════════════════════════════════════════════════════════════ */
window._lastUserGps = null;
let activeInspectVaultId = null;

function renderRadarGeoVaultMarkers() {
  if (!remoMap || !remoMarkersLayer) return;
  const lang = REMO_I18N.getLang();
  const u = REMO_STORE.getCurrentUser() || { uid: 'guest' };
  const vaults = (REMO_STORE.state && REMO_STORE.state.geoVaults) || [];

  // Filter out any vault that this citizen has ALREADY unlocked/claimed so it disappears from the map!
  const activeVaults = vaults.filter((v) => !Array.isArray(v.unlockedBy) || !v.unlockedBy.includes(u.uid));

  const badgeEl = document.getElementById('radarVaultsBadge');
  if (badgeEl) badgeEl.textContent = activeVaults.length;

  activeVaults.forEach((v) => {
    const c = getCityById(v.cityId);
    const title = lang === 'fr' ? (v.title_fr || v.title_en) : v.title_en;

    const tier = v.tier || 'gold';
    const tierIcon = tier === 'wood' ? '🪵' : (tier === 'diamond' ? '💎' : '🪙');

    const vaultIcon = L.divIcon({
      className: 'remo-geovault-pin-wrap',
      html: `
        <div class="remo-geovault-marker tier-${tier}" title="${title}">
          <div class="vault-ping-wave"></div>
          <div class="vault-icon-core">${tierIcon}</div>
          <div class="vault-lbl-pill">${c ? c.flag : '🌍'} +${v.coinsReward}🪙</div>
        </div>
      `,
      iconSize: [64, 64],
      iconAnchor: [32, 50]
    });

    L.marker([v.lat, v.lng], { icon: vaultIcon })
      .addTo(remoMarkersLayer)
      .bindPopup(`
        <div style="color:#0f172a;font-family:Outfit,sans-serif;min-width:215px;text-align:center;">
          <div style="font-size:11px;font-weight:900;color:#6366f1;text-transform:uppercase;letter-spacing:0.8px;">
            ${lang === 'fr' ? '💎 GÉO-COFFRE URBAIN AR' : '💎 URBAN AR GEO-VAULT'}
          </div>
          <b style="font-size:13px;display:block;margin:4px 0;line-height:1.25;">${title}</b>
          <div style="font-size:12px;color:#d97706;font-weight:800;margin-bottom:6px;">
            🪙 +${v.coinsReward} Coins · 🎁 ${v.rarity || 'Mythic 4D'}
          </div>
          <button onclick="openGeoVaultInspector('${v.id}')" style="background:linear-gradient(135deg,#06b6d4,#3b82f6);color:#fff;border:none;border-radius:8px;padding:6px 14px;cursor:pointer;font-weight:800;font-size:12px;box-shadow:0 3px 10px rgba(6,182,212,0.4);">
            📡 ${lang === 'fr' ? 'Inspecter Radar AR' : 'Inspect AR Radar'}
          </button>
        </div>
      `);
  });
}

function openGeoVaultInspector(vaultId) {
  const vaults = (REMO_STORE.state && REMO_STORE.state.geoVaults) || [];
  const v = vaults.find((x) => x.id === vaultId);
  if (!v) return;

  activeInspectVaultId = vaultId;
  const lang = REMO_I18N.getLang();
  const u = REMO_STORE.getCurrentUser() || { uid: 'guest', name: 'Explorer' };
  const isUnlocked = Array.isArray(v.unlockedBy) && v.unlockedBy.includes(u.uid);
  const city = getCityById(v.cityId) || { name_en: 'World City', name_fr: 'Ville du Monde', flag: '🌍' };

  const modal = document.getElementById('geoVaultInspectModal');
  if (!modal) return;

  const title = lang === 'fr' ? (v.title_fr || v.title_en) : v.title_en;
  const hint = lang === 'fr' ? (v.hint_fr || v.hint_en) : v.hint_en;
  const cityName = getCityName(city, lang);

  // Set fields
  const titleEl = document.getElementById('gvInspectTitle');
  if (titleEl) titleEl.textContent = title;
  const cityEl = document.getElementById('gvInspectCity');
  if (cityEl) cityEl.textContent = `${city.flag} ${cityName}`;
  const rarityEl = document.getElementById('gvInspectRarity');
  if (rarityEl) rarityEl.textContent = v.rarity || 'Mythic 4D';
  const sponsorEl = document.getElementById('gvInspectSponsor');
  if (sponsorEl) sponsorEl.textContent = v.sponsorName || 'REMO Pioneer';
  const coinsEl = document.getElementById('gvInspectCoins');
  if (coinsEl) coinsEl.textContent = `+${v.coinsReward || 250} 🪙`;
  const clueEl = document.getElementById('gvInspectClue');
  if (clueEl) clueEl.textContent = hint;

  // Compute live proximity if GPS known
  updateGeoVaultProximityUI(v);

  // Actions row
  const actionsBox = document.getElementById('gvInspectActionsBox');
  const isAdmUser = REMO_STORE.isAdminUnlocked() || REMO_STORE.isCurrentUserAdmin();
  const admDelBtn = isAdmUser ? `
    <button class="btn-ghost" style="width:100%;justify-content:center;border-color:#ef4444;color:#f87171;padding:8px;font-size:0.8rem;margin-top:6px;" onclick="adminDeleteGeoVault('${v.id}')">
      🗑️ ${lang === 'fr' ? 'Supprimer ce Géo-Coffre (Admin)' : 'Delete this Geo-Vault (Admin)'}
    </button>
  ` : '';

  if (actionsBox) {
    if (isUnlocked) {
      actionsBox.innerHTML = `
        <div style="background:rgba(16,185,129,0.15);border:1.5px solid #10b981;border-radius:14px;padding:12px;text-align:center;color:#6ee7b7;font-weight:900;font-size:0.92rem;">
          ✓ ${lang === 'fr' ? 'DÉVERROUILLÉ & ENREGISTRÉ DANS LE PASSEPORT' : 'UNLOCKED & CLAIMED IN PASSPORT'}
        </div>
        ${admDelBtn}
      `;
    } else {
      actionsBox.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:8px;width:100%;">
          <button class="btn-cyber btn-gold" style="width:100%;justify-content:center;padding:13px;font-size:0.92rem;" onclick="executeGeoVaultUnlock('${v.id}', false)">
            ⚡ ${lang === 'fr' ? 'Ouvrir avec GPS en Direct' : 'Unlock Geo-Vault with Live GPS'}
          </button>
          <button class="btn-ghost" style="width:100%;justify-content:center;border-color:#38bdf8;color:#7dd3fc;padding:9px;font-size:0.8rem;" onclick="executeGeoVaultUnlock('${v.id}', true)">
            🧪 ${lang === 'fr' ? 'Tester l’Ouverture AR (Téléportation Démo)' : 'Test AR Unlock (Demo Teleport)'}
          </button>
          ${admDelBtn}
        </div>
      `;
    }
  }

  modal.classList.add('open');
}

function updateGeoVaultProximityUI(v) {
  const lang = REMO_I18N.getLang();
  const proxBox = document.getElementById('gvInspectProximityBox');
  if (!proxBox) return;

  const radiusM = v.radiusMeters || 350;

  if (window._lastUserGps) {
    const distKm = haversineKm(window._lastUserGps.lat, window._lastUserGps.lng, v.lat, v.lng);
    const distM = Math.round(distKm * 1000);
    const inRange = distM <= radiusM;

    proxBox.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
        <span style="font-size:0.75rem;font-weight:800;color:var(--muted);">${lang === 'fr' ? 'Distance Radar :' : 'Radar Distance:'}</span>
        <span style="font-size:0.88rem;font-weight:900;color:${inRange ? '#10b981' : '#fbbf24'};">
          ${distM < 1000 ? `${distM} m` : `${distKm.toFixed(2)} km`}
        </span>
      </div>
      <div style="background:rgba(255,255,255,0.06);border-radius:99px;height:8px;overflow:hidden;margin-bottom:6px;">
        <div style="height:100%;width:${Math.min(100, Math.max(5, (radiusM / Math.max(radiusM, distM)) * 100))}%;background:${inRange ? '#10b981' : '#fbbf24'};transition:width 0.3s;"></div>
      </div>
      <div style="font-size:0.75rem;font-weight:800;color:${inRange ? '#6ee7b7' : '#cbd5e1'};text-align:center;">
        ${inRange ? (lang === 'fr' ? '🛰️ À PORTÉE ! Vous êtes dans le périmètre d’ouverture !' : '🛰️ IN RANGE! You are within unlock perimeter!') : (lang === 'fr' ? `🛰️ Trop loin. Rapprochez-vous à moins de ${radiusM}m.` : `🛰️ Out of range. Move within ${radiusM}m to open.`)}
      </div>
    `;
  } else {
    proxBox.innerHTML = `
      <div style="font-size:0.76rem;color:var(--muted);text-align:center;padding:6px 0;">
        📡 ${lang === 'fr' ? 'Appuyez sur "Ouvrir avec GPS" pour calculer votre distance exacte.' : 'Tap "Unlock with Live GPS" to calculate exact distance.'}
      </div>
    `;
  }
}

function executeGeoVaultUnlock(vaultId, isSimulated = false) {
  const lang = REMO_I18N.getLang();
  const vaults = (REMO_STORE.state && REMO_STORE.state.geoVaults) || [];
  const v = vaults.find((x) => x.id === vaultId);
  if (!v) return;

  if (isSimulated) {
    const res = REMO_STORE.claimGeoVault(vaultId, v.lat, v.lng, true);
    handleGeoVaultUnlockResult(res, v, lang);
    return;
  }

  if (!navigator.geolocation) {
    remoToast(lang === 'fr' ? 'GPS non disponible sur cet appareil.' : 'GPS unavailable on this device.');
    return;
  }

  remoToast(lang === 'fr' ? '🛰️ Acquisition du signal satellite GPS...' : '🛰️ Acquiring live satellite lock...');
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      window._lastUserGps = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      const res = REMO_STORE.claimGeoVault(vaultId, pos.coords.latitude, pos.coords.longitude, false);
      handleGeoVaultUnlockResult(res, v, lang);
    },
    (err) => {
      remoToast(lang === 'fr' ? 'Permission GPS refusée. Utilisez la téléportation démo pour tester.' : 'GPS access denied. Use demo teleport to test.');
    },
    { enableHighAccuracy: true, timeout: 9000 }
  );
}

function handleGeoVaultUnlockResult(res, v, lang) {
  if (!res) return;

  if (res.success) {
    RemoAudio.play('fanfare');
    RemoAudio.play('coin');
    spawnRemoCoinsFX(14);
    refreshRadarMarkers();
    openGeoVaultInspector(v.id);

    const toastMsg = lang === 'fr'
      ? `🎉 GÉO-COFFRE OUVERT ! +${res.coinsWon} 🪙 et Carte 4D obtenue !`
      : `🎉 GEO-VAULT UNLOCKED! +${res.coinsWon} 🪙 and 4D Card claimed!`;
    remoToast(toastMsg, 'fanfare');
  } else if (res.reason === 'too_far') {
    updateGeoVaultProximityUI(v);
    const distM = Math.round((res.distanceKm || 0) * 1000);
    const failMsg = lang === 'fr'
      ? `❌ Trop loin (${distM}m). Vous devez être à moins de ${res.radiusMeters}m !`
      : `❌ Too far (${distM}m away). You must be within ${res.radiusMeters}m!`;
    remoToast(failMsg);
  } else if (res.reason === 'already_claimed') {
    remoToast(lang === 'fr' ? '✓ Déjà ouvert et enregistré !' : '✓ Already unlocked and recorded!');
  }
}

function locateNearestGeoVault() {
  const vaults = (REMO_STORE.state && REMO_STORE.state.geoVaults) || [];
  if (!vaults.length || !remoMap) return;

  let target = vaults[0];
  if (window._lastUserGps) {
    let minD = Infinity;
    vaults.forEach((v) => {
      const d = haversineKm(window._lastUserGps.lat, window._lastUserGps.lng, v.lat, v.lng);
      if (d < minD) { minD = d; target = v; }
    });
  } else if (remoMap) {
    const center = remoMap.getCenter();
    let minD = Infinity;
    vaults.forEach((v) => {
      const d = haversineKm(center.lat, center.lng, v.lat, v.lng);
      if (d < minD) { minD = d; target = v; }
    });
  }

  RemoAudio.play('coin');
  remoMap.flyTo([target.lat, target.lng], 16, { duration: 1.3 });
  const lang = REMO_I18N.getLang();
  remoToast(lang === 'fr' 
    ? `🗺️ 🎁 Coffre Secret ciblé : ${target.title_fr || target.title_en} (+${target.coinsReward} 🪙) !` 
    : `🗺️ 🎁 Secret Chest targeted: ${target.title_en} (+${target.coinsReward} 🪙)!`, 'coin');

  if (typeof updateRadarSonarHUD === 'function') updateRadarSonarHUD();

  setTimeout(() => {
    openGeoVaultInspector(target.id);
  }, 1400);
}

function startAdminPickChestLocation() {
  const modal = document.getElementById('buryGeoVaultModal');
  if (modal) modal.classList.remove('open');
  window._adminChestPickMode = true;
  const lang = REMO_I18N.getLang();
  remoToast(lang === 'fr' 
    ? '🎯 GOD-MODE ACTIF : Cliquez n’importe où sur le radar pour planter votre coffre secret !' 
    : '🎯 GOD-MODE ACTIVE: Click anywhere on the radar map to plant your secret chest!', 'fanfare');
}

function startAdminDropPin() {
  const lang = REMO_I18N.getLang();
  if (!REMO_STORE.isAdminUnlocked() && !REMO_STORE.isCurrentUserAdmin()) {
    remoToast(lang === 'fr' ? 'La pose de balises est réservée à l’administrateur.' : 'Live pin dropping is admin only.');
    return;
  }
  window._dropPinMode = true;
  remoToast(lang === 'fr' ? '📍 Cliquez n’importe où sur la carte pour déposer la balise !' : '📍 Click anywhere on the map to drop the live pin!');
}

function openBuryGeoVaultModal() {
  const lang = REMO_I18N.getLang();
  if (!REMO_STORE.isAdminUnlocked() && !REMO_STORE.isCurrentUserAdmin()) {
    remoToast(lang === 'fr' ? 'La création de Géo-Coffres est réservée aux administrateurs.' : 'Geo-Vaults can only be placed by admins.');
    return;
  }
  const modal = document.getElementById('buryGeoVaultModal');
  if (!modal) return;

  const addrInp = document.getElementById('buryVaultAddressInp');
  if (addrInp) addrInp.value = '';
  const addrFb = document.getElementById('buryVaultAddressFeedback');
  if (addrFb) { addrFb.style.display = 'none'; addrFb.textContent = ''; }

  const sel = document.getElementById('buryVaultCitySelect');
  if (sel) {
    sel.innerHTML = getRemoCities().map((c) => `<option value="${c.id}">${c.flag} ${getCityName(c, lang)}</option>`).join('');
    const curU = REMO_STORE.getCurrentUser();
    if (curU && curU.homeCity) sel.value = curU.homeCity;
  }

  if (window._lastUserGps) {
    const latInp = document.getElementById('buryVaultLatInp');
    const lngInp = document.getElementById('buryVaultLngInp');
    if (latInp) latInp.value = window._lastUserGps.lat.toFixed(4);
    if (lngInp) lngInp.value = window._lastUserGps.lng.toFixed(4);
  }

  modal.classList.add('open');
}

async function geocodeVaultAddress() {
  const inp = document.getElementById('buryVaultAddressInp');
  const fb = document.getElementById('buryVaultAddressFeedback');
  const q = inp ? inp.value.trim() : '';
  const lang = REMO_I18N.getLang();
  if (!q) {
    remoToast(lang === 'fr' ? 'Entrez d’abord une adresse ou une ville !' : 'Enter an address or city first!');
    return;
  }
  if (fb) {
    fb.style.display = 'block';
    fb.style.color = '#38bdf8';
    fb.textContent = lang === 'fr' ? '🔍 Recherche des coordonnées GPS...' : '🔍 Searching GPS coordinates...';
  }
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`);
    const data = await res.json();
    if (data && data.length > 0) {
      const item = data[0];
      const lat = parseFloat(item.lat);
      const lng = parseFloat(item.lon);
      const latInp = document.getElementById('buryVaultLatInp');
      const lngInp = document.getElementById('buryVaultLngInp');
      if (latInp) latInp.value = lat.toFixed(4);
      if (lngInp) lngInp.value = lng.toFixed(4);

      const nearest = findNearestRemoCity(lat, lng);
      const sel = document.getElementById('buryVaultCitySelect');
      if (sel && nearest && nearest.city) {
        sel.value = nearest.city.id;
      }

      const titleInp = document.getElementById('buryVaultTitleInp');
      if (titleInp && !titleInp.value.trim()) {
        const shortName = item.display_name.split(',')[0];
        titleInp.value = shortName + ' Vault';
      }

      if (fb) {
        fb.style.color = '#34d399';
        fb.textContent = `✓ GPS trouvé : ${lat.toFixed(4)}, ${lng.toFixed(4)} (${item.display_name.slice(0, 50)}...)`;
      }
      remoToast(lang === 'fr' ? '✓ Coordonnées GPS trouvées automatiquement !' : '✓ GPS coordinates found automatically!', 'coin');
    } else {
      if (fb) {
        fb.style.color = '#f87171';
        fb.textContent = lang === 'fr' ? '⚠️ Aucune coordonnée trouvée pour cette adresse.' : '⚠️ No coordinates found for this address.';
      }
    }
  } catch (err) {
    if (fb) {
      fb.style.color = '#f87171';
      fb.textContent = lang === 'fr' ? 'Erreur lors de la recherche GPS.' : 'Error contacting geocoding service.';
    }
  }
}

function detectGpsForBuryVault() {
  const lang = REMO_I18N.getLang();
  if (!navigator.geolocation) {
    remoToast(lang === 'fr' ? 'GPS non disponible.' : 'GPS unavailable.');
    return;
  }
  remoToast(lang === 'fr' ? '🛰️ Verrouillage GPS...' : '🛰️ Acquiring GPS coordinates...');
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      window._lastUserGps = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      const latInp = document.getElementById('buryVaultLatInp');
      const lngInp = document.getElementById('buryVaultLngInp');
      if (latInp) latInp.value = pos.coords.latitude.toFixed(4);
      if (lngInp) lngInp.value = pos.coords.longitude.toFixed(4);
      remoToast(lang === 'fr' ? '✓ Coordonnées GPS verrouillées !' : '✓ GPS Coordinates locked!', 'coin');
    },
    () => {
      remoToast(lang === 'fr' ? 'Accès GPS refusé.' : 'GPS access denied.');
    },
    { enableHighAccuracy: true, timeout: 8000 }
  );
}

function submitBuryGeoVault(event) {
  event.preventDefault();
  const lang = REMO_I18N.getLang();
  if (!REMO_STORE.isAdminUnlocked() && !REMO_STORE.isCurrentUserAdmin()) {
    remoToast(lang === 'fr' ? 'La déposition de Géo-Coffres est réservée aux administrateurs.' : 'Geo-Vaults can only be placed by admins.');
    return;
  }

  const cityId = document.getElementById('buryVaultCitySelect')?.value || 'montreal';
  const address = document.getElementById('buryVaultAddressInp')?.value.trim() || '';
  const title = document.getElementById('buryVaultTitleInp')?.value.trim() || 'Secret Landmark Vault';
  const hint = document.getElementById('buryVaultHintInp')?.value.trim() || 'Look around the landmark carefully...';
  const coinsReward = Number(document.getElementById('buryVaultCoinsSel')?.value) || 150;
  const radiusMeters = Number(document.getElementById('buryVaultRadiusSel')?.value) || 350;
  const lat = Number(document.getElementById('buryVaultLatInp')?.value) || 45.5017;
  const lng = Number(document.getElementById('buryVaultLngInp')?.value) || -73.5673;

  const tier = document.getElementById('buryVaultTierSel')?.value || 'gold';
  const shouldAlert = document.getElementById('buryVaultAlertCheck')?.checked ?? true;

  const res = REMO_STORE.buryNewGeoVault({
    cityId,
    address,
    title_en: title,
    title_fr: title,
    hint_en: hint,
    hint_fr: hint,
    tier,
    coinsReward,
    radiusMeters,
    lat,
    lng,
    rarity: tier === 'diamond' ? 'Mythic 4D' : (tier === 'gold' ? 'Legendary Gold' : 'Urban Rare'),
    cardCityId: cityId
  });

  if (!res || !res.success) {
    if (res && res.reason === 'insufficient_coins') {
      remoToast(lang === 'fr' ? 'Solde de pièces insuffisant pour déposer ce coffre !' : 'Insufficient coins to bury this vault bounty!');
    } else {
      remoToast(lang === 'fr' ? 'Erreur lors du dépôt.' : 'Failed to bury vault.');
    }
    return;
  }

  document.getElementById('buryGeoVaultModal')?.classList.remove('open');
  RemoAudio.play('fanfare');
  spawnRemoCoinsFX(10);
  refreshRadarMarkers();

  if (shouldAlert && res.vault) {
    showWorldChestDropAlert(res.vault);
  }

  if (remoMap) {
    remoMap.flyTo([lat, lng], 15, { duration: 1.2 });
  }

  remoToast(lang === 'fr' ? '💎 Géo-Coffre déposé avec succès ! Chasse ouverte !' : '💎 Geo-Vault buried successfully! Hunt is live!', 'coin');
}

function claimRadarSpot(pinId, reward) {
  const lang = REMO_I18N.getLang();
  const u = REMO_STORE.getCurrentUser() || REMO_STORE.ensureGuestOrCitizen('Explorer', '', 'montreal');
  const key = 'remo_pin_claimed_' + pinId;
  if (localStorage.getItem(key)) return;
  localStorage.setItem(key, '1');
  REMO_STORE.addCoins(u.uid, reward, 25);
  spawnRemoCoinsFX(8);
  refreshRadarMarkers();
  remoToast(lang === 'fr' ? `💎 +${reward} Pièces REMO réclamées !` : `💎 +${reward} REMO Coins claimed!`, 'coin');
}

function claimFlashSuperDrop() {
  const lang = REMO_I18N.getLang();
  const fd = REMO_STORE.state.settings.flashDrop;
  if (!fd || !fd.active || fd.expiresAt <= Date.now()) return;
  const claimKey = 'remo_flash_claimed_' + fd.expiresAt;
  if (localStorage.getItem(claimKey)) {
    remoToast(lang === 'fr' ? 'Déjà réclamé pour cet événement !' : 'Already claimed for this flash event!');
    return;
  }
  const u = REMO_STORE.getCurrentUser() || REMO_STORE.ensureGuestOrCitizen('Flash Pioneer', '', fd.cityId || 'montreal');
  localStorage.setItem(claimKey, '1');
  REMO_STORE.addCoins(u.uid, fd.coins || 300, 60);
  if (fd.bonusCardCityId) {
    REMO_STORE.mintCardForUser(u.uid, fd.bonusCardCityId, 'Epic', true);
  }
  spawnRemoCoinsFX(12);
  RemoAudio.play('fanfare');
  remoToast(
    lang === 'fr'
      ? `⚡ SUPER DROP RÉCLAMÉ : +${fd.coins} 🪙 + Carte Ville GPS !`
      : `⚡ SUPER DROP CLAIMED: +${fd.coins} 🪙 + Verified City Card!`,
    'fanfare'
  );
  refreshRadarMarkers();
}

function findNearestRemoCity(lat, lng) {
  let best = null, minKm = Infinity;
  getRemoCities().forEach((c) => {
    const d = haversineKm(lat, lng, c.lat, c.lng);
    if (d < minKm) { minKm = d; best = c; }
  });
  return { city: best || getRemoCities()[0], distanceKm: minKm };
}

function verifyPhysicalGpsVisa() {
  const lang = REMO_I18N.getLang();
  if (!navigator.geolocation) {
    remoToast(lang === 'fr' ? 'GPS non disponible sur cet appareil.' : 'GPS not supported on this browser.');
    return;
  }
  remoToast(lang === 'fr' ? '📡 Verrouillage des coordonnées satellites...' : '📡 Locking satellite coordinates...');
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      if (remoMap) remoMap.flyTo([latitude, longitude], 13);
      const curU = REMO_STORE.getCurrentUser() || REMO_STORE.ensureGuestOrCitizen('GPS Explorer', '', 'montreal');
      const res = REMO_STORE.verifyAndStampGpsBorder(curU.uid, pos.coords);

      if (res && res.ok) {
        document.body.classList.add('screen-rumble');
        setTimeout(() => document.body.classList.remove('screen-rumble'), 400);

        RemoAudio.play('fanfare');
        spawnRemoCoinsFX(16);

        if (res.isNew) {
          remoToast(
            lang === 'fr'
              ? `🛂 Entrée frontière authentifiée à ${getCityName(res.closestCity, 'fr')} ! (+${res.bonusAwarded} 🪙)`
              : `🛂 Border entry authenticated in ${getCityName(res.closestCity, 'en')}! (+${res.bonusAwarded} 🪙)`,
            'fanfare'
          );
        } else {
          remoToast(
            lang === 'fr'
              ? `🛂 Tampon de frontière réactualisé à ${getCityName(res.closestCity, 'fr')} !`
              : `🛂 Border entry re-stamped in ${getCityName(res.closestCity, 'en')}!`,
            'fanfare'
          );
        }

        openGpsBorderStampSuccessModal(res);
        if (typeof renderPassportView === 'function') renderPassportView();
      } else if (res && res.reason === 'too_far') {
        const cityObj = res.closestCity;
        const msg = lang === 'fr'
          ? `⚠️ Vous êtes à ${res.distanceKm} km de ${getCityName(cityObj, 'fr')}. Rapprochez-vous (< 45 km) pour tamponner votre passeport !`
          : `⚠️ You are ${res.distanceKm} km from ${getCityName(cityObj, 'en')}. Travel closer (< 45 km) to receive this official border stamp!`;
        remoToast(msg);
      }
    },
    () => {
      remoToast(
        lang === 'fr'
          ? '⚠️ Accès GPS refusé — autorisez la localisation dans votre navigateur.'
          : '⚠️ GPS permission denied — allow location access in your browser.'
      );
    },
    { enableHighAccuracy: true, timeout: 9000 }
  );
}

function openGpsBorderStampSuccessModal(res) {
  const modal = document.getElementById('gpsBorderStampModal');
  const body = document.getElementById('gpsBorderStampModalBody');
  if (!modal || !body || !res || !res.stamp) return;
  const lang = REMO_I18N.getLang();
  const c = res.closestCity;
  const s = res.stamp;
  const dateStr = new Date(s.stampedAt).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
  const timeStr = new Date(s.stampedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  body.innerHTML = `
    <div style="padding:10px 0;">
      <div class="stamp-seal-circle stamp-animated-slam" style="width:115px;height:115px;margin:0 auto 16px;">
        <span class="stamp-seal-flag" style="font-size:2.3rem;">${c.flag}</span>
        <span class="stamp-seal-code" style="font-size:0.85rem;">${s.code} · ${s.serial}</span>
      </div>
      <h3 style="font-family:'Orbitron',sans-serif;color:#fbbf24;font-size:1.1rem;margin-bottom:6px;">
        ${lang === 'fr' ? 'ENTRÉE DE FRONTIÈRE AUTHENTIFIÉE' : 'OFFICIAL IN-PERSON BORDER ENTRY'}
      </h3>
      <p style="font-size:0.84rem;color:#e2e8f0;margin-bottom:12px;">
        ${c.flag} <b>${getCityName(c, lang)}</b> · ${dateStr} ${timeStr}
      </p>

      <div style="background:rgba(15,23,42,0.8);border:1px solid rgba(251,191,36,0.3);border-radius:14px;padding:12px;margin-bottom:14px;text-align:left;font-size:0.75rem;">
        <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
          <span style="color:#94a3b8;">${lang === 'fr' ? 'Localité Officielle :' : 'Official Locality:'}</span>
          <span style="color:#38bdf8;font-family:monospace;font-weight:700;">${c.flag} ${getCityName(c, lang)} (${lang === 'fr' ? 'Vérifiée' : 'Verified'})</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
          <span style="color:#94a3b8;">${lang === 'fr' ? 'Rang Diplomatique :' : 'Diplomatic Rank:'}</span>
          <span style="color:#fbbf24;font-weight:900;">👑 ${res.diplomaticTitle}</span>
        </div>
        <div style="display:flex;justify-content:space-between;">
          <span style="color:#94a3b8;">${lang === 'fr' ? 'Prime Découverte :' : 'Discovery Bounty:'}</span>
          <span style="color:#34d399;font-weight:900;">+${res.bonusAwarded} 🪙 REMO Coins</span>
        </div>
      </div>

      <div style="display:flex;gap:8px;">
        <button type="button" class="btn-cyber btn-gold" style="width:100%;justify-content:center;padding:11px;" onclick="document.getElementById('gpsBorderStampModal').classList.remove('open');switchRemoView('passport');">
          🪪 ${lang === 'fr' ? 'Voir dans mon Passeport' : 'View in my Passport'}
        </button>
      </div>
    </div>
  `;
  modal.classList.add('open');
}

function showWorldChestDropAlert(v) {
  if (!v) return;
  const lang = REMO_I18N.getLang();
  const c = getCityById(v.cityId) || { flag: '🌍', name_en: 'City', name_fr: 'Ville' };
  const banner = document.getElementById('worldChestAlertBanner');
  const titleEl = document.getElementById('worldChestAlertTitle');
  const textEl = document.getElementById('worldChestAlertText');
  if (!banner) return;

  const cityName = getCityName(c, lang);
  if (titleEl) titleEl.textContent = lang === 'fr' ? '🚨 ALERTE TRÉSOR MONDIAL !' : '🚨 WORLD TREASURE DROP!';
  if (textEl) {
    textEl.textContent = lang === 'fr'
      ? `Un coffre secret a atterri à ${cityName} (+${v.coinsReward} 🪙) ! Chasse ouverte ➔`
      : `A secret chest landed in ${cityName} (+${v.coinsReward} 🪙)! Tap to hunt ➔`;
  }

  banner.style.display = 'flex';
  RemoAudio.play('fanfare');

  if (window._chestAlertTimer) clearTimeout(window._chestAlertTimer);
  window._chestAlertTimer = setTimeout(() => {
    banner.style.display = 'none';
  }, 15000);
}

function trackWorldChestOnRadar(vaultId) {
  const banner = document.getElementById('worldChestAlertBanner');
  if (banner) banner.style.display = 'none';
  switchRemoView('radar');
  const vaults = (REMO_STORE.state && REMO_STORE.state.geoVaults) || [];
  const v = (vaultId ? vaults.find((x) => x.id === vaultId) : null) || vaults[0];
  if (v && remoMap) {
    remoMap.flyTo([v.lat, v.lng], 16, { duration: 1.5 });
    setTimeout(() => {
      openGeoVaultInspector(v.id);
    }, 1600);
  }
}

function openBuryGeoVaultModalAtCoords(lat, lng) {
  openBuryGeoVaultModal();
  const latInp = document.getElementById('buryVaultLatInp');
  const lngInp = document.getElementById('buryVaultLngInp');
  if (latInp) latInp.value = Number(lat).toFixed(4);
  if (lngInp) lngInp.value = Number(lng).toFixed(4);
  const { city } = findNearestRemoCity(lat, lng);
  const sel = document.getElementById('buryVaultCitySelect');
  if (sel && city) sel.value = city.id;
  remoToast(REMO_I18N.getLang() === 'fr' ? `📍 Coordonnées ciblées : ${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)}` : `📍 Coordinates targeted: ${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)}`);
}

function updateRadarSonarHUD() {
  if (!remoMap) return;
  const hud = document.getElementById('radarSonarHUD');
  const dot = document.getElementById('radarSonarDot');
  const txt = document.getElementById('radarSonarText');
  if (!hud || !dot || !txt) return;

  const center = remoMap.getCenter();
  const u = REMO_STORE.getCurrentUser() || { uid: 'guest' };
  const vaults = (REMO_STORE.state && REMO_STORE.state.geoVaults) || [];
  const activeVaults = vaults.filter((v) => !Array.isArray(v.unlockedBy) || !v.unlockedBy.includes(u.uid));

  if (activeVaults.length === 0) {
    hud.style.display = 'none';
    return;
  }

  let minM = Infinity;
  activeVaults.forEach((v) => {
    const dM = Math.round(haversineKm(center.lat, center.lng, v.lat, v.lng) * 1000);
    if (dM < minM) minM = dM;
  });

  const lang = REMO_I18N.getLang();
  if (minM <= 1500) {
    hud.style.display = 'flex';
    if (minM <= 250) {
      dot.style.color = '#ef4444';
      txt.textContent = lang === 'fr' ? `🔥 CHAUD ! Trésor à ~${minM}m !` : `🔥 HOT! Treasure ~${minM}m away!`;
    } else if (minM <= 700) {
      dot.style.color = '#f59e0b';
      txt.textContent = lang === 'fr' ? `⚡ TIÈDE ! Recherche à ~${minM}m...` : `⚡ WARM! Searching ~${minM}m...`;
    } else {
      dot.style.color = '#38bdf8';
      txt.textContent = lang === 'fr' ? `❄️ FROID... Trésor à ~${(minM / 1000).toFixed(1)}km` : `❄️ COLD... Chest ~${(minM / 1000).toFixed(1)}km away`;
    }
  } else {
    hud.style.display = 'none';
  }
}

/* ── 2. CITY WARS & 3-ROUND 3D CARD PVP BATTLE ARENA ── */
function renderArenaWarsOnly() {
  const warsBox = document.getElementById('arenaWarsList');
  if (!warsBox) return;
  const lang = REMO_I18N.getLang();
  const u = REMO_STORE.getCurrentUser();
  const activeWars = (REMO_STORE.state.duels || []).filter((w) => w && (!REMO_STORE.deletedDuelIds || !REMO_STORE.deletedDuelIds.has(w.id)));

  if (!activeWars.length) {
    warsBox.innerHTML = `
      <div class="war-card" style="text-align:center;padding:34px 20px;">
        <div style="font-size:2.2rem;margin-bottom:10px;">⚔️</div>
        <b style="font-size:1.05rem;color:#fff;display:block;margin-bottom:6px;">${lang === 'fr' ? 'Aucune guerre de villes active pour le moment' : 'No active city wars right now'}</b>
        <p style="color:var(--muted);font-size:0.88rem;max-width:440px;margin:0 auto 14px;line-height:1.5;">
          ${lang === 'fr' ? 'Toutes les guerres de villes précédentes sont terminées. Revenez très bientôt pour le prochain affrontement officiel ou explorez le Radar !' : 'All previous city wars have concluded. Stay tuned for the next official global clash or explore the 4D Radar!'}
        </p>
      </div>
    `;
    return;
  }

  warsBox.innerHTML = activeWars.map((w) => {
    const cA = getCityById(w.cityA), cB = getCityById(w.cityB);
    const vA = Number(w.votesA || 0), vB = Number(w.votesB || 0);
    const tot = Math.max(1, vA + vB);
    const pctA = Math.round((vA / tot) * 100);
    const pctB = 100 - pctA;
    const ttl = lang === 'fr' ? (w.title_fr || w.title_en) : w.title_en;
    const myVote = localStorage.getItem('remo_voted_' + w.id) || (u && u.votedWars && u.votedWars[w.id]) || '';
    const votedA = myVote === 'A';
    const votedB = myVote === 'B';
    const hasVoted = Boolean(myVote);
    const btnTextA = votedA ? `✓ ${cA.flag} ${getCityName(cA, lang)} · ${t('war_voted_btn')}` : `${cA.flag} ${getCityName(cA, lang)} · ${t('war_tap_btn')}`;
    const btnTextB = votedB ? `✓ ${cB.flag} ${getCityName(cB, lang)} · ${t('war_voted_btn')}` : `${cB.flag} ${getCityName(cB, lang)} · ${t('war_tap_btn')}`;
    const styleA = votedA ? 'border-color:#10b981;box-shadow:0 0 14px rgba(16,185,129,0.5);font-weight:900;' : (hasVoted ? 'opacity:0.55;' : '');
    const styleB = votedB ? 'border-color:#10b981;box-shadow:0 0 14px rgba(16,185,129,0.5);font-weight:900;' : (hasVoted ? 'opacity:0.55;' : '');
    const guestClaimHtml = (!u && hasVoted)
      ? `<div style="margin-top:8px;padding:6px 10px;border-radius:10px;background:rgba(251,191,36,0.14);border:1px solid rgba(251,191,36,0.45);display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;font-size:0.75rem;color:#fde047;font-weight:800;">
           <span>${t('war_guest_claim_bar', { city: getCityName(votedB ? cB : cA, lang) })}</span>
           <button class="btn-cyber btn-gold" style="padding:4px 10px;font-size:0.72rem;" onclick="openAuthModal()">🛂 ${t('btn_sign_in')}</button>
         </div>`
      : '';
    return `
      <div class="war-card">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:8px;">
          <b style="font-size:1rem;color:#fff;">⚔️ ${ttl}</b>
          <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
            ${myVote ? `<span class="city-tag" style="border-color:rgba(16,185,129,0.6);color:#6ee7b7;font-weight:900;">${t('war_voted_btn')}</span>` : ''}
            <span class="city-tag">+20 🪙 / ${lang === 'fr' ? 'vote' : 'vote'}</span>
          </div>
        </div>
        <div style="display:flex;justify-content:space-between;font-weight:800;font-size:0.9rem;">
          <span style="color:#818cf8;">${cA.flag} ${getCityName(cA, lang)} (${pctA}% · ${vA.toLocaleString()})</span>
          <span style="color:#f472b6;">${cB.flag} ${getCityName(cB, lang)} (${pctB}% · ${vB.toLocaleString()})</span>
        </div>
        <div class="war-bar-track">
          <div class="war-bar-fill-a" style="width:${pctA}%;transition:width 0.18s ease;"></div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px;">
          <button type="button" class="war-pulse-btn side-a" style="${styleA}" onclick="voteCityWar('${w.id}','A',event)">
            ${btnTextA}
          </button>
          <button type="button" class="war-pulse-btn side-b" style="${styleB}" onclick="voteCityWar('${w.id}','B',event)">
            ${btnTextB}
          </button>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:8px;flex-wrap:wrap;">
          <button type="button" class="war-backup-btn" style="flex:1;justify-content:center;" onclick="shareCityWarBackup('${w.id}','A')">
            ${t('war_backup_btn')} (${cA.flag} ${getCityName(cA, lang)})
          </button>
          <button type="button" class="war-backup-btn" style="flex:1;justify-content:center;" onclick="shareCityWarBackup('${w.id}','B')">
            ${t('war_backup_btn')} (${cB.flag} ${getCityName(cB, lang)})
          </button>
        </div>
        ${guestClaimHtml}
      </div>
    `;
  }).join('');
}

function renderArenaView() {
  const warsBox = document.getElementById('arenaWarsList');
  const pvpSel = document.getElementById('pvpUserCardSelect');
  const lang = REMO_I18N.getLang();
  if (!warsBox) return;

  renderArenaWarsOnly();

  if (pvpSel) {
    const u = REMO_STORE.getCurrentUser();
    const myCards = u ? REMO_STORE.getUserCards(u.uid) : [];
    const list = myCards.length > 0 ? myCards : [
      { id: 'starter_mtl', cityId: 'montreal', serial: '0099', rarity: 'Rare', verifiedGps: false },
      { id: 'starter_kiv', cityId: 'chisinau', serial: '0099', rarity: 'Rare', verifiedGps: false },
      { id: 'starter_par', cityId: 'paris', serial: '0099', rarity: 'Rare', verifiedGps: false }
    ];
    window._pvpAvailableCards = list;
    pvpSel.innerHTML = list.map((c, idx) => {
      const city = getCityById(c.cityId);
      const st = computeCityPvPStats(city, c.rarity, c.verifiedGps);
      return `<option value="${idx}">${city.flag} ${getCityName(city, lang)} #${c.serial} (${c.rarity}) — ATK ${st.atk} / DEF ${st.def} / HP ${st.hp}</option>`;
    }).join('');
    updatePvPCardPreviews();
  }

  // 🎲 Render City Predictions Market
  renderCityPredictionsView();
}

/* ── 🎲 IDEA 4: CITY PREDICTION MARKET (POLYMARKET 4D) ── */
function renderCityPredictionsView() {
  const grid = document.getElementById('cityPredictionsGrid');
  if (!grid) return;

  const lang = REMO_I18N.getLang();
  const u = REMO_STORE.getCurrentUser() || REMO_STORE.ensureGuestOrCitizen('REMO Pioneer', '', 'montreal');
  const balEl = document.getElementById('predUserVaultBalance');
  if (balEl && u) {
    balEl.textContent = `${(u.coins || 0).toLocaleString()} 🪙`;
  }

  const preds = Array.isArray(REMO_STORE.state.cityPredictions) ? REMO_STORE.state.cityPredictions : [];
  if (preds.length === 0) {
    grid.innerHTML = `<div style="color:var(--muted);font-size:0.85rem;padding:12px;">${lang === 'fr' ? 'Aucune prédiction active pour le moment.' : 'No active predictions right now.'}</div>`;
    return;
  }

  grid.innerHTML = preds.map((p) => {
    const c = getCityById(p.cityId) || { flag: p.cityFlag || '🌍', name_fr: 'Monde', name_en: 'World' };
    const ttl = lang === 'fr' ? (p.title_fr || p.title_en) : (p.title_en || p.title_fr);
    const optA = p.options && p.options[0];
    const optB = p.options && p.options[1];
    const poolA = optA ? (optA.pool || 0) : 0;
    const poolB = optB ? (optB.pool || 0) : 0;
    const totPool = Math.max(1, poolA + poolB);
    const pctA = Math.round((poolA / totPool) * 100);
    const pctB = 100 - pctA;

    const optALabel = optA ? (lang === 'fr' ? optA.label_fr : optA.label_en) : 'OUI';
    const optBLabel = optB ? (lang === 'fr' ? optB.label_fr : optB.label_en) : 'NON';

    // Check if user already placed a bet
    const userBet = (u && u.predictionBets && Array.isArray(u.predictionBets))
      ? u.predictionBets.find((b) => b && b.predId === p.id)
      : null;

    let betStatusHtml = '';
    if (userBet) {
      const chosenOpt = (userBet.optionId === optA?.id) ? optALabel : optBLabel;
      betStatusHtml = `
        <div class="pred-user-bet-status">
          ✓ ${t('pred_your_bet')}: <b>${userBet.amount} 🪙</b> · <b>${chosenOpt}</b>
        </div>
      `;
    }

    return `
      <div class="pred-card">
        <div>
          <div class="pred-card-hdr">
            <span class="pred-city-badge">${c.flag} ${getCityName(c, lang)}</span>
            <span class="pred-timer-badge">⏳ ${t('pred_ends_in')} ${p.endsInStr || '8h'}</span>
          </div>

          <div class="pred-question">${ttl}</div>

          <div class="pred-pool-strip">
            <span>🪙 <b>${(p.totalPool || totPool).toLocaleString()}</b> ${t('pred_total_pool')}</span>
            <span>${(p.bets || []).length} ${lang === 'fr' ? 'paris' : 'bets'}</span>
          </div>

          <div class="pred-split-bar-box">
            <div class="pred-split-fill-a" style="width:${pctA}%;"></div>
          </div>

          <div class="pred-options-row">
            <!-- Option A -->
            <div class="pred-opt-box">
              <div class="pred-opt-label" title="${optALabel}">${optALabel}</div>
              <div class="pred-opt-pct" style="color:#34d399;">${pctA}%</div>
              <div class="pred-opt-pool">🪙 ${poolA} (${optA?.votes || 0})</div>
              <div class="pred-bet-btns-row">
                <button type="button" class="pred-bet-pill-btn" onclick="placePredictionBetAction('${p.id}', '${optA?.id}', 5)">+5</button>
                <button type="button" class="pred-bet-pill-btn" onclick="placePredictionBetAction('${p.id}', '${optA?.id}', 10)">+10</button>
                <button type="button" class="pred-bet-pill-btn" onclick="placePredictionBetAction('${p.id}', '${optA?.id}', 25)">+25</button>
              </div>
            </div>

            <!-- Option B -->
            <div class="pred-opt-box">
              <div class="pred-opt-label" title="${optBLabel}">${optBLabel}</div>
              <div class="pred-opt-pct" style="color:#fb7185;">${pctB}%</div>
              <div class="pred-opt-pool">🪙 ${poolB} (${optB?.votes || 0})</div>
              <div class="pred-bet-btns-row">
                <button type="button" class="pred-bet-pill-btn" onclick="placePredictionBetAction('${p.id}', '${optB?.id}', 5)">+5</button>
                <button type="button" class="pred-bet-pill-btn" onclick="placePredictionBetAction('${p.id}', '${optB?.id}', 10)">+10</button>
                <button type="button" class="pred-bet-pill-btn" onclick="placePredictionBetAction('${p.id}', '${optB?.id}', 25)">+25</button>
              </div>
            </div>
          </div>

          ${betStatusHtml}
        </div>
      </div>
    `;
  }).join('');
}

function placePredictionBetAction(predId, optId, amount = 5) {
  const res = REMO_STORE.placeCityPredictionBet(predId, optId, amount);
  if (!res.ok && !res.success) {
    if (res.reason === 'insufficient_coins') {
      remoToast(t('pred_err_coins'), 'warn');
    } else {
      remoToast('⚠️ Error placing bet.', 'warn');
    }
    return;
  }
  spawnRemoCoinsFX(8);
  remoToast(t('pred_voted_toast'), 'fanfare');
  renderCityPredictionsView();
  syncHeaderAndSidebars();
}
window.renderCityPredictionsView = renderCityPredictionsView;
window.placePredictionBetAction = placePredictionBetAction;

let _warTapTimestamps = [];
let _warPulseFlushTimer = null;

function spawnWarTapSpark(ev, flag) {
  try {
    const el = document.createElement('div');
    el.className = 'war-tap-spark';
    el.textContent = `+1 ${flag || '⚡'}`;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    if (ev && typeof ev.clientX === 'number' && ev.clientX > 0) {
      x = ev.clientX + (Math.random() * 24 - 12);
      y = ev.clientY - 8;
    } else if (ev && ev.currentTarget && ev.currentTarget.getBoundingClientRect) {
      const r = ev.currentTarget.getBoundingClientRect();
      x = r.left + r.width / 2 + (Math.random() * 24 - 12);
      y = r.top + 6;
    }
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    document.body.appendChild(el);
    setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 700);
  } catch (e) {}
}

function scheduleWarPulseCloudFlush() {
  if (_warPulseFlushTimer) return;
  _warPulseFlushTimer = setTimeout(() => {
    _warPulseFlushTimer = null;
    REMO_STORE.save(true, 'war_pulse');
  }, 3500);
}

function voteCityWar(warId, side, ev) {
  const lang = REMO_I18N.getLang();
  const war = (REMO_STORE.state.duels || []).find((d) => d.id === warId);
  if (!war) return;

  const u = REMO_STORE.getCurrentUser();
  const voteKey = 'remo_voted_' + warId;
  const existingVote = localStorage.getItem(voteKey) || (u && u.votedWars && u.votedWars[warId]);

  if (existingVote) {
    remoToast(lang === 'fr' 
      ? '⚠️ Vous avez déjà voté pour ce duel ! Invitez vos amis à voter.' 
      : '⚠️ You have already voted in this battle! Invite your friends to vote.');
    return;
  }

  // 1 User = 1 Vote per war
  localStorage.setItem(voteKey, side);
  if (u) {
    if (!u.votedWars) u.votedWars = {};
    u.votedWars[warId] = side;
  }

  const cA = getCityById(war.cityA);
  const cB = getCityById(war.cityB);
  const chosenCity = side === 'A' ? cA : cB;
  const otherCity = side === 'A' ? cB : cA;

  const prevA = Number(war.votesA || 0);
  const prevB = Number(war.votesB || 0);
  const prevLead = prevA > prevB ? 'A' : (prevB > prevA ? 'B' : 'tie');

  if (side === 'A') {
    war.votesA = prevA + 1;
    REMO_STORE.state.cityScores[war.cityA] = (REMO_STORE.state.cityScores[war.cityA] || 1000) + 5;
  } else {
    war.votesB = prevB + 1;
    REMO_STORE.state.cityScores[war.cityB] = (REMO_STORE.state.cityScores[war.cityB] || 1000) + 5;
  }

  try { RemoAudio.play('pop'); } catch (e) {}
  try { if (navigator.vibrate) navigator.vibrate(20); } catch (e) {}
  spawnWarTapSpark(ev, chosenCity ? chosenCity.flag : '⚡');

  // Single-vote reward: +20 REMO Coins
  const dayKey = 'remo_war_coins_' + REMO_STORE._getLocalDateKey(0);
  const earnedToday = Number(localStorage.getItem(dayKey) || 0);

  if (u) {
    REMO_STORE.addCoins(u.uid, 20, 20);
    localStorage.setItem(dayKey, String(earnedToday + 20));
    spawnRemoCoinsFX(6);
    remoToast(t('war_milestone_toast', { city: getCityName(chosenCity, lang) }), 'coin');
  } else {
    const gCoins = Math.min(100, Number(localStorage.getItem('remo_guest_war_coins') || 0) + 20);
    localStorage.setItem('remo_guest_war_coins', String(gCoins));
    spawnRemoCoinsFX(4);
    remoToast(t('war_milestone_toast', { city: getCityName(chosenCity, lang) }), 'coin');
  }

  // Lead-change overtake alert!
  const nextA = Number(war.votesA || 0);
  const nextB = Number(war.votesB || 0);
  const nextLead = nextA > nextB ? 'A' : (nextB > nextA ? 'B' : 'tie');
  if (prevLead !== nextLead && nextLead === side) {
    const tot = Math.max(1, nextA + nextB);
    const winPct = Math.round(((side === 'A' ? nextA : nextB) / tot) * 100);
    try { RemoAudio.play('fanfare'); } catch (e) {}
    remoToast(t('war_overtake_toast', {
      city: `${chosenCity.flag} ${getCityName(chosenCity, lang)}`,
      other: getCityName(otherCity, lang),
      pct: winPct
    }), 'fanfare');
  }

  // Instant lightweight UI refresh without touching feed iframes
  renderArenaWarsOnly();
  if (typeof renderRightSidebarWidgets === 'function') renderRightSidebarWidgets();
  if (typeof renderMobileCityWarStrip === 'function') renderMobileCityWarStrip();
  if (typeof syncHeaderAndSidebars === 'function') syncHeaderAndSidebars();

  REMO_STORE.save(true, 'war_pulse');
  scheduleWarPulseCloudFlush();
}

async function shareCityWarBackup(warId, side) {
  const lang = REMO_I18N.getLang();
  const war = (REMO_STORE.state.duels || []).find((d) => d.id === warId) || (REMO_STORE.state.duels || [])[0];
  if (!war) return;
  const cA = getCityById(war.cityA);
  const cB = getCityById(war.cityB);
  const tot = Math.max(1, Number(war.votesA || 0) + Number(war.votesB || 0));
  const pctA = Math.round((Number(war.votesA || 0) / tot) * 100);
  const pctB = 100 - pctA;
  const myCity = side === 'B' ? cB : cA;
  const u = REMO_STORE.getCurrentUser();
  const base = `${window.location.origin}${window.location.pathname}`;
  const refPart = u && u.referralCode ? `&ref=${encodeURIComponent(u.referralCode)}` : '';
  const url = `${base}?war=${encodeURIComponent(war.id)}&side=${side === 'B' ? 'B' : 'A'}${refPart}`;

  const msg = t('war_share_backup_text', {
    cityA: `${cA.flag} ${getCityName(cA, lang)}`,
    cityB: `${cB.flag} ${getCityName(cB, lang)}`,
    pctA,
    pctB,
    myCity: `${myCity.flag} ${getCityName(myCity, lang)}`
  });

  if (navigator.share) {
    try {
      await navigator.share({ title: 'REMO Live City War', text: msg, url });
      return;
    } catch (err) {
      if (err && err.name === 'AbortError') return;
    }
  }
  copyTextToClipboard(`${msg} ${url}`);
  remoToast(lang === 'fr' 
    ? '📋 Lien copié ! Partagez-le avec vos amis pour soutenir votre ville.' 
    : '📋 Link copied! Share it with your friends to support your city.', 'info');
}

function updatePvPCardPreviews() {
  const sel = document.getElementById('pvpUserCardSelect');
  const myCv = document.getElementById('pvpMyCardCanvas');
  const oppCv = document.getElementById('pvpOppCardCanvas');
  if (!sel || !myCv || !oppCv || !window._pvpAvailableCards) return;

  const chosen = window._pvpAvailableCards[Number(sel.value) || 0];
  renderCityCardFront(myCv, chosen);

  const cities = getRemoCities().filter((c) => c.id !== chosen.cityId);
  const oppCity = cities[Math.floor(Math.random() * cities.length)];
  window._currentPvPOppSpec = {
    cityId: oppCity.id,
    serial: String(Math.floor(Math.random() * 500) + 10).padStart(4, '0'),
    rarity: oppCity.rarity,
    verifiedGps: Math.random() > 0.5
  };
  renderCityCardFront(oppCv, window._currentPvPOppSpec);
}

async function runCardPvPBattle() {
  const sel = document.getElementById('pvpUserCardSelect');
  const logEl = document.getElementById('pvpBattleLog');
  if (!sel || !logEl || !window._pvpAvailableCards) return;

  const lang = REMO_I18N.getLang();
  const myCard = window._pvpAvailableCards[Number(sel.value) || 0];
  const oppCard = window._currentPvPOppSpec || { cityId: 'tokyo', serial: '0088', rarity: 'Epic' };

  const c1 = getCityById(myCard.cityId), c2 = getCityById(oppCard.cityId);
  const s1 = computeCityPvPStats(c1, myCard.rarity, myCard.verifiedGps);
  const s2 = computeCityPvPStats(c2, oppCard.rarity, oppCard.verifiedGps);
  const el1 = REMO_ELEMENTS[s1.element] || REMO_ELEMENTS.neon;
  const el2 = REMO_ELEMENTS[s2.element] || REMO_ELEMENTS.cyber;

  const adv1 = el1.beats === el2.id ? 1.15 : 1.0;
  const adv2 = el2.beats === el1.id ? 1.15 : 1.0;

  let hp1 = s1.hp, hp2 = s2.hp;
  logEl.innerHTML = '';

  for (let round = 1; round <= 3; round++) {
    await new Promise((r) => setTimeout(r, 420));
    RemoAudio.play('hit');
    RemoAudio.haptic(25);
    const dmg1 = Math.max(28, Math.round((s1.atk * 1.15 - s2.def * 0.42 + (Math.random() * 22)) * adv1));
    const dmg2 = Math.max(26, Math.round((s2.atk * 1.1 - s1.def * 0.45 + (Math.random() * 20)) * adv2));
    hp2 = Math.max(0, hp2 - dmg1);
    hp1 = Math.max(0, hp1 - dmg2);

    const row = document.createElement('div');
    row.style.cssText = 'padding:8px 12px;border-radius:10px;background:rgba(255,255,255,0.05);margin-bottom:6px;font-size:0.83rem;';
    row.innerHTML = `<b>${t('pvp_round')} ${round}:</b> ${c1.flag} ${getCityName(c1, lang)} ➡️ <span style="color:#fbbf24;">-${dmg1} HP</span> | ${c2.flag} ${getCityName(c2, lang)} ➡️ <span style="color:#f43f5e;">-${dmg2} HP</span>`;
    logEl.appendChild(row);
    if (hp1 <= 0 || hp2 <= 0) break;
  }

  const won = hp1 >= hp2;
  const resDiv = document.createElement('div');
  resDiv.style.cssText = `padding:12px;border-radius:12px;font-weight:900;text-align:center;margin-top:8px;background:${won ? 'rgba(16,185,129,0.2)' : 'rgba(244,63,94,0.2)'};color:${won ? '#10b981' : '#f43f5e'};`;
  resDiv.textContent = won ? t('pvp_victory') : t('pvp_defeat');
  logEl.appendChild(resDiv);

  if (won) {
    const prize = REMO_STORE.state.settings.rewards.pvpWinReward || 35;
    const u = REMO_STORE.getCurrentUser();
    if (u) REMO_STORE.addCoins(u.uid, prize, 35);
    else REMO_STORE.addCityScore(c1.id, 35);
    spawnRemoCoinsFX(9);
    RemoAudio.play('fanfare');
  }
}

function sharePvPChallengeLink() {
  const lang = REMO_I18N.getLang();
  const sel = document.getElementById('pvpUserCardSelect');
  const card = (window._pvpAvailableCards && window._pvpAvailableCards[Number(sel?.value) || 0]) || { cityId: 'montreal' };
  const city = getCityById(card.cityId);
  const url = `${window.location.origin}${window.location.pathname}?view=arena&challenge=${city.id}`;
  const msg = lang === 'fr'
    ? `⚔️ Je te défie sur REMO avec ma carte ${city.flag} ${getCityName(city, 'fr')} ! Ouvre le lien pour combattre : ${url}`
    : `⚔️ I challenge you on REMO with my ${city.flag} ${getCityName(city, 'en')} 4D Card! Click to battle: ${url}`;

  if (navigator.share) {
    navigator.share({ title: 'REMO Card Duel', text: msg, url }).catch(() => {});
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(msg).catch(() => {});
    remoToast(lang === 'fr' ? '🔗 Lien de défi copié dans le presse-papiers !' : '🔗 Duel challenge link copied to clipboard!', 'coin');
  }
}

/* ── 3. MY CITY CARDS VAULT & DAILY FREE PACK OPENING ── */
function renderVaultView() {
  const grid = document.getElementById('vaultCardsGrid');
  const btn = document.getElementById('btnOpenDailyPack');
  if (!grid) return;

  const lang = REMO_I18N.getLang();
  const lastFree = Number(localStorage.getItem('remo_last_free_pack_ts') || 0);
  const diff = Date.now() - lastFree;
  const canFree = diff >= 24 * 3600 * 1000;

  if (btn) {
    if (canFree) {
      btn.textContent = t('pack_open_btn');
      btn.disabled = false;
    } else {
      const remHrs = Math.ceil((24 * 3600 * 1000 - diff) / 3600000);
      btn.textContent = `⏳ ${t('pack_cooldown')} ${remHrs}h`;
      btn.disabled = true;
    }
  }

  const u = REMO_STORE.getCurrentUser();
  const cards = u ? REMO_STORE.getUserCards(u.uid) : REMO_STORE.state.droppedCardsPool.slice(0, 4);

  // Update Royal Trophy Pedestal live metrics
  const totalCardsEl = document.getElementById('vaultTotalCardsCount');
  if (totalCardsEl) totalCardsEl.textContent = cards.length;

  const visasEl = document.getElementById('vaultVisasCount');
  if (visasEl) {
    const stampedVisas = u && u.visas ? Object.keys(u.visas).length : 1;
    visasEl.textContent = stampedVisas;
  }

  const worthEl = document.getElementById('vaultTotalWorthCount');
  if (worthEl) {
    worthEl.textContent = u ? u.coins : 0;
  }

  const serials = (REMO_STORE.state && REMO_STORE.state.serializedCoins) || [];
  const userCoin = u ? serials.find((c) => c.ownerUid === u.uid) : null;
  const activeSerial = userCoin ? userCoin.serial : (serials[0] ? serials[0].serial : '0001');
  const tagEl = document.getElementById('vaultCoinSerialTag');
  if (tagEl) {
    tagEl.textContent = `#${activeSerial}`;
  }

  if (cards.length === 0) {
    grid.innerHTML = `<div class="glass-box" style="grid-column:1/-1;text-align:center;padding:34px;">
      ${lang === 'fr' ? 'Aucune carte encore — ouvrez votre Pack Ville Gratuit ci-dessus ! 🎁' : 'No City Cards yet — open your Free Daily City Pack above! 🎁'}
    </div>`;
    return;
  }

  grid.innerHTML = cards.map((c, idx) => `
    <div class="glass-box" style="display:flex;flex-direction:column;align-items:center;gap:10px;cursor:pointer;" onclick="inspectCardById('${c.id}')">
      <canvas id="vaultMiniCv_${idx}" style="width:100%;max-width:220px;height:auto;border-radius:14px;box-shadow:0 10px 25px rgba(0,0,0,0.6);"></canvas>
      <div style="font-weight:800;font-size:0.84rem;text-align:center;">
        ${getCityById(c.cityId).flag} #${c.serial} · <span style="color:#fbbf24;">${c.rarity}</span>
      </div>
    </div>
  `).join('');

  cards.forEach((c, idx) => {
    const cv = document.getElementById(`vaultMiniCv_${idx}`);
    if (cv) renderCityCardFront(cv, c, lang);
  });
}

function triggerCityPackOpening(isPaid = false) {
  const lang = REMO_I18N.getLang();
  const u = REMO_STORE.getCurrentUser() || REMO_STORE.ensureGuestOrCitizen('Collector', '', 'montreal');

  if (isPaid) {
    const cost = REMO_STORE.state.settings.rewards.packCost || 150;
    if (!REMO_STORE.addCoins(u.uid, -cost, 0)) {
      remoToast(lang === 'fr' ? `Il vous faut ${cost} 🪙 Pièces REMO !` : `You need ${cost} 🪙 REMO Coins!`);
      return;
    }
  } else {
    localStorage.setItem('remo_last_free_pack_ts', String(Date.now()));
  }

  const cities = getRemoCities();
  const picked = cities[Math.floor(Math.random() * cities.length)];
  const roll = Math.random();
  const rar = roll > 0.90 ? 'Mythic 4D' : roll > 0.68 ? 'Legendary Gold' : roll > 0.35 ? 'Epic' : 'Rare';
  const minted = REMO_STORE.mintCardForUser(u.uid, picked.id, rar, false);

  RemoAudio.play('pack');
  RemoAudio.haptic([50, 40, 90]);
  spawnRemoCoinsFX(10);
  renderVaultView();
  inspectCardModal(minted);
}

function inspectCardById(cardId) {
  const c = REMO_STORE.state.droppedCardsPool.find((x) => x.id === cardId);
  if (c) inspectCardModal(c);
}

function isCurrentUserOwnerOfCard(cardSpec) {
  if (!cardSpec) return false;
  const u = REMO_STORE.getCurrentUser();
  const isAdm = REMO_STORE.isAdminUnlocked() || REMO_STORE.isCurrentUserAdmin();
  if (!u) return false;
  if (cardSpec.ownerUid && u.uid === cardSpec.ownerUid) return true;
  if (cardSpec.ownerName && u.name && u.name.trim().toLowerCase() === cardSpec.ownerName.trim().toLowerCase()) return true;
  if (cardSpec.subtitle && u.name && String(cardSpec.subtitle).toLowerCase().includes('moment by ' + u.name.trim().toLowerCase())) return true;
  if (!cardSpec.ownerUid && !cardSpec.ownerName && isAdm) return true;
  return false;
}

function isCardAlreadyInAuction(cardSpec) {
  if (!cardSpec) return false;
  return (REMO_STORE.state.auctions || []).some((a) => {
    if (!a || !a.cardSpec) return false;
    if (cardSpec.id && a.cardSpec.id && a.cardSpec.id === cardSpec.id) return true;
    if (cardSpec.serial && a.cardSpec.serial === cardSpec.serial && a.cardSpec.cityId === cardSpec.cityId) return true;
    return false;
  });
}

function inspectCardModal(cardSpec) {
  activeInspectedCard = cardSpec;
  const ov = document.getElementById('cardInspectModal');
  const flipper = document.getElementById('inspectCardFlipper');
  const fCv = document.getElementById('inspectFrontCv');
  const bCv = document.getElementById('inspectBackCv');
  if (!ov || !fCv || !bCv) return;

  const isOwner = isCurrentUserOwnerOfCard(cardSpec);
  const expBtn = document.getElementById('btnInspectCardExportStory');
  const qrBtn = document.getElementById('btnInspectCardTradeQR');
  const aucBtn = document.getElementById('btnInspectCardAuction');
  if (expBtn) expBtn.style.display = isOwner ? '' : 'none';
  if (qrBtn) qrBtn.style.display = isOwner ? '' : 'none';
  if (aucBtn) aucBtn.style.display = isOwner ? '' : 'none';

  if (flipper) flipper.classList.remove('flipped');
  renderCityCardFront(fCv, cardSpec);
  renderCityCardBack(bCv, cardSpec);
  ov.classList.add('open');
}

async function exportInspectedCardStory() {
  if (!activeInspectedCard) return;
  const lang = REMO_I18N.getLang();
  if (!isCurrentUserOwnerOfCard(activeInspectedCard)) {
    remoToast(
      lang === 'fr'
        ? '🔒 Seul le propriétaire de cette Carte 4D peut l’exporter !'
        : '🔒 Only the owner of this 4D Card can export it!'
    );
    return;
  }
  const fCv = document.getElementById('inspectFrontCv');
  if (fCv && activeInspectedCard) {
    await exportCityStory916(fCv, activeInspectedCard);
  }
}

function showInspectedCardTradeQR() {
  if (!activeInspectedCard) return;
  const lang = REMO_I18N.getLang();
  const c = getCityById(activeInspectedCard.cityId);
  const url = `${window.location.origin}${window.location.pathname}?trade=${activeInspectedCard.id}`;
  if (navigator.clipboard) navigator.clipboard.writeText(url).catch(() => {});
  remoToast(
    lang === 'fr'
      ? `🔄 Lien d’échange pour ${getCityName(c, 'fr')} #${activeInspectedCard.serial} copié !`
      : `🔄 Trade link for ${getCityName(c, 'en')} #${activeInspectedCard.serial} copied!`,
    'coin'
  );
}

function listInspectedCardInAuction() {
  if (!activeInspectedCard) return;
  const lang = REMO_I18N.getLang();
  const u = REMO_STORE.getCurrentUser();
  if (!u) {
    remoToast(lang === 'fr' ? '🔒 Connectez-vous pour vendre vos Cartes 4D !' : '🔒 Sign in to auction your 4D Cards!');
    return;
  }
  const isAdm = REMO_STORE.isAdminUnlocked() || REMO_STORE.isCurrentUserAdmin();
  if (!isCurrentUserOwnerOfCard(activeInspectedCard)) {
    remoToast(
      lang === 'fr'
        ? '🔒 Vous ne pouvez mettre aux enchères que vos propres Cartes 4D !'
        : '🔒 You can only auction your own 4D Cards!'
    );
    return;
  }
  if (isCardAlreadyInAuction(activeInspectedCard)) {
    remoToast(
      lang === 'fr'
        ? '🔨 Cette Carte 4D est déjà en vente aux enchères !'
        : '🔨 This 4D Card is already listed in the Auction House!'
    );
    return;
  }

  const promptMsg = isAdm
    ? (lang === 'fr' ? '👑 Prix de départ en Pièces REMO (Fondateur — sans limite) :' : '👑 Starting bid in REMO Coins (Founder — unlimited):')
    : (lang === 'fr' ? 'Prix de départ en Pièces REMO (entre 50 🪙 et 5 000 🪙) :' : 'Starting bid in REMO Coins (between 50 🪙 and 5,000 🪙):');
  const rawInput = prompt(promptMsg, '250');
  if (rawInput === null) return;
  const startBid = Math.round(Number(rawInput));
  if (!Number.isFinite(startBid) || startBid < (isAdm ? 10 : 50) || (!isAdm && startBid > 5000)) {
    remoToast(
      lang === 'fr'
        ? '⚠️ Prix autorisé pour les citoyens : entre 50 🪙 et 5 000 🪙 !'
        : '⚠️ Allowed starting price for citizens: between 50 🪙 and 5,000 🪙!'
    );
    return;
  }

  const cleanSpec = typeof window.sanitizeCardSpecForCloud === 'function'
    ? window.sanitizeCardSpecForCloud(activeInspectedCard)
    : Object.assign({}, activeInspectedCard);
  if (cleanSpec) {
    delete cleanSpec._loadedPhotoImg;
    delete cleanSpec._loadingPhoto;
    delete cleanSpec._photoFailed;
    delete cleanSpec._photoTainted;
  }

  REMO_STORE.state.auctions.unshift({
    id: 'auc_' + Date.now(),
    cardSpec: cleanSpec,
    sellerUid: u.uid,
    sellerName: u.name || 'Citizen',
    currentBid: startBid,
    highestBidder: '—',
    createdAt: Date.now(),
    endsAt: Date.now() + 24 * 3600 * 1000
  });
  REMO_STORE.save(true, 'auction_new');
  if (typeof REMO_STORE.syncToFirestore === 'function') {
    REMO_STORE.syncToFirestore('auction_new', true);
  }
  document.getElementById('cardInspectModal')?.classList.remove('open');
  remoToast(lang === 'fr' ? '🔨 Carte mise aux enchères !' : '🔨 Card listed in the Auction House!', 'coin');
  if (typeof switchRemoView === 'function') switchRemoView('auctions');
  if (typeof renderAuctionsView === 'function') renderAuctionsView();
}

/* ── 4. #9 OFFICIAL HOLOGRAPHIC CITIZEN ID, REFERRAL QR (+100 🪙) & 3D VISA PASSPORT ── */
function getCitizenInviteUrl(u) {
  const ref = (u && u.referralCode) || `REMO-${(u && u.passportNum) || '0001'}`;
  const customDom = localStorage.getItem('remo_custom_domain');
  if (customDom && customDom.trim()) {
    const cleanDom = customDom.trim().replace(/\/+$/, '');
    return cleanDom.endsWith('.html') ? `${cleanDom}?ref=${encodeURIComponent(ref)}` : `${cleanDom}/?ref=${encodeURIComponent(ref)}`;
  }
  if (typeof window !== 'undefined' && window.location && window.location.origin && window.location.origin !== 'null' && window.location.protocol.startsWith('http')) {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (!isLocal) {
      const cleanOrigin = window.location.origin.replace(/\/+$/, '');
      return `${cleanOrigin}/?ref=${encodeURIComponent(ref)}`;
    }
  }
  // Official Production Domain
  return `https://remoworld.com/?ref=${encodeURIComponent(ref)}`;
}

function copyTextToClipboard(text) {
  if (!text) return;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).catch(() => {
      fallbackCopyText(text);
    });
  } else {
    fallbackCopyText(text);
  }
}

function fallbackCopyText(text) {
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.top = '0';
    ta.style.left = '0';
    ta.style.width = '2em';
    ta.style.height = '2em';
    ta.style.padding = '0';
    ta.style.border = 'none';
    ta.style.outline = 'none';
    ta.style.boxShadow = 'none';
    ta.style.background = 'transparent';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  } catch (err) {}
}

window.getCitizenInviteUrl = getCitizenInviteUrl;
window.copyTextToClipboard = copyTextToClipboard;

function drawOfficialCitizenIdCard(cv, u, lang) {
  if (!cv) return;
  cv.width = 1080;
  cv.height = 630;
  const ctx = cv.getContext('2d');
  const home = getCityById((u && u.homeCity) || 'montreal');
  const col = home.themeColor || '#38bdf8';
  const refCode = (u && u.referralCode) || `REMO-${(u && u.passportNum) || '0001'}`;
  const cosm = u && u.uid ? REMO_STORE.getUserCosmetics(u.uid) : { title_en: '', title_fr: '' };
  const royalTitle = lang === 'fr' ? cosm.title_fr : cosm.title_en;
  const refBonus = (REMO_STORE.state.settings.rewards && REMO_STORE.state.settings.rewards.referralBonus) || 100;

  // Holographic Cyber Background
  const bg = ctx.createLinearGradient(0, 0, 1080, 630);
  bg.addColorStop(0, '#040817');
  bg.addColorStop(0.55, '#12183b');
  bg.addColorStop(1, '#05091a');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 1080, 630);

  // Subtle City Aura Glow
  const rad = ctx.createRadialGradient(340, 315, 30, 340, 315, 420);
  rad.addColorStop(0, col + '44');
  rad.addColorStop(1, 'transparent');
  ctx.fillStyle = rad;
  ctx.fillRect(0, 0, 1080, 630);

  // Guilloché Security Grid
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 1;
  for (let x = 0; x < 1080; x += 36) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 630); ctx.stroke(); }
  for (let y = 0; y < 630; y += 36) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1080, y); ctx.stroke(); }

  // Watermark City Landmark
  ctx.save();
  ctx.globalAlpha = 0.22;
  drawCityLandmark(ctx, home.id, col, 520, 340, 195);
  ctx.restore();

  // Outer Gold & Cyan Holographic Border
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 6;
  ctx.strokeRect(22, 22, 1036, 586);
  ctx.strokeStyle = col;
  ctx.lineWidth = 2;
  ctx.strokeRect(32, 32, 1016, 566);

  // Top Header Strip
  ctx.fillStyle = 'rgba(251,191,36,0.14)';
  ctx.fillRect(34, 34, 1012, 74);
  ctx.textAlign = 'left';
  ctx.font = '900 26px "Orbitron", sans-serif';
  ctx.fillStyle = '#fbbf24';
  ctx.fillText(lang === 'fr' ? '🌐 REMO · CARTE D’IDENTITÉ CITOYEN OFFICIELLE' : '🌐 REMO · OFFICIAL WORLD CITIZEN ID CARD', 58, 80);

  ctx.textAlign = 'right';
  ctx.font = '800 20px monospace';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText(`ID #${u.passportNum || '0001'}`, 1020, 80);

  // Left Avatar Emblem
  ctx.save();
  ctx.beginPath();
  ctx.arc(138, 235, 68, 0, Math.PI * 2);
  ctx.fillStyle = '#1e1b4b';
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#fbbf24';
  ctx.stroke();
  ctx.font = '900 58px "Orbitron", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String((u.name || 'R')[0]).toUpperCase(), 138, 238);
  ctx.restore();

  // Citizen Identity Info
  ctx.textAlign = 'left';
  ctx.font = '900 42px "Orbitron", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(`@${u.name || 'REMO Citizen'}`, 235, 206);

  ctx.font = '800 24px "Outfit", sans-serif';
  ctx.fillStyle = '#38bdf8';
  const cityLocalityLabel = `${home.flag} ${getCityName(home, lang).toUpperCase()} · ${(lang === 'fr' ? (home.country_fr || 'CITOYEN OFFICIEL') : (home.country_en || 'OFFICIAL CITIZEN')).toUpperCase()}`;
  ctx.fillText(cityLocalityLabel, 235, 248);

  if (royalTitle) {
    ctx.font = '900 21px "Outfit", sans-serif';
    ctx.fillStyle = '#f472b6';
    ctx.fillText(`${royalTitle}`, 235, 286);
  }

  // Stats Pills Row
  const stats = [
    { lbl: lang === 'fr' ? 'PIÈCES REMO' : 'REMO COINS', val: `🪙 ${(u.coins || 0).toLocaleString()}` },
    { lbl: lang === 'fr' ? 'VISAS VILLES' : 'CITY VISAS', val: `🛂 ${(u.visas || []).length}` },
    { lbl: lang === 'fr' ? 'AMIS INVITÉS' : 'INVITES', val: `🤝 ${u.referralsCount || 0}` }
  ];
  stats.forEach((st, i) => {
    const bx = 58 + i * 228, by = 348;
    ctx.fillStyle = 'rgba(15,23,42,0.88)';
    ctx.strokeStyle = 'rgba(255,255,255,0.16)';
    ctx.lineWidth = 2;
    ctx.fillRect(bx, by, 212, 96);
    ctx.strokeRect(bx, by, 212, 96);
    ctx.font = '700 15px "Outfit", sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(st.lbl, bx + 16, by + 32);
    ctx.font = '900 26px "Orbitron", sans-serif';
    ctx.fillStyle = '#fbbf24';
    ctx.fillText(st.val, bx + 16, by + 72);
  });

  // Bottom Machine-Readable Passport Strip
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.fillRect(36, 522, 1008, 68);
  ctx.font = '700 18px monospace';
  ctx.fillStyle = '#10b981';
  ctx.fillText(`P<REMO<<${(u.name || 'CITIZEN').toUpperCase().replace(/[^A-Z0-9]/g, '<')}<<<<${home.code}<<<${refCode}<<<<2026`, 58, 563);

  // Right Scannable Invite QR Box
  const qrUrl = getCitizenInviteUrl(u);
  const qrCv = RemoQREngine.toCanvas(qrUrl, 210);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(792, 142, 226, 226);
  ctx.drawImage(qrCv, 800, 150, 210, 210);

  ctx.textAlign = 'center';
  ctx.font = '900 20px "Orbitron", sans-serif';
  ctx.fillStyle = '#fbbf24';
  ctx.fillText(refCode, 905, 404);
  ctx.font = '800 16px "Outfit", sans-serif';
  ctx.fillStyle = '#34d399';
  ctx.fillText(lang === 'fr' ? `SCANNER = +${refBonus} 🪙 BONUS` : `SCAN QR = +${refBonus} 🪙 BONUS`, 905, 432);
}

function escapeHtmlStr(str = '') {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
window.escapeHtmlStr = escapeHtmlStr;

window._activeProfileTab = window._activeProfileTab || 'posts';

function setPassportTab(tabId) {
  window._activeProfileTab = tabId;
  renderPassportView();
}
window.setPassportTab = setPassportTab;

function openEditProfileModal() {
  const modal = document.getElementById('editProfileModal');
  const u = REMO_STORE.getCurrentUser();
  if (!modal || !u) return;
  const nameInp = document.getElementById('editProfNameInp');
  const bioInp = document.getElementById('editProfBioInp');
  const citySel = document.getElementById('editProfCitySel');
  const lang = REMO_I18N.getLang();

  if (nameInp) nameInp.value = u.name || '';
  if (bioInp) bioInp.value = u.bio || '';
  if (citySel) {
    citySel.innerHTML = getRemoCities().map((c) => `<option value="${c.id}" ${c.id === u.homeCity ? 'selected' : ''}>${c.flag} ${getCityName(c, lang)}</option>`).join('');
  }
  modal.classList.add('open');
}

function closeEditProfileModal() {
  const modal = document.getElementById('editProfileModal');
  if (modal) modal.classList.remove('open');
}

function saveUserProfile(event) {
  event.preventDefault();
  const lang = REMO_I18N.getLang();
  const u = REMO_STORE.getCurrentUser();
  if (!u) return;

  const nameInp = document.getElementById('editProfNameInp');
  const bioInp = document.getElementById('editProfBioInp');
  const citySel = document.getElementById('editProfCitySel');

  const newName = nameInp ? nameInp.value.trim() : '';
  const newBio = bioInp ? bioInp.value.trim() : '';
  const newCity = citySel ? citySel.value : u.homeCity;

  if (!newName) {
    remoToast(lang === 'fr' ? 'Veuillez entrer un nom valide.' : 'Please enter a valid name.');
    return;
  }

  const oldName = u.name;
  u.name = newName;
  u.bio = newBio;
  u.homeCity = newCity;

  // Add home city to visas if not present
  u.visas = Array.isArray(u.visas) ? u.visas : [];
  if (!u.visas.includes(newCity)) {
    u.visas.push(newCity);
  }

  // Update authorName on user's own posts, comments, bottles & DMs
  (REMO_STORE.state.posts || []).forEach((p) => {
    if (p) {
      if (p.uid === u.uid || p.authorName === oldName) p.authorName = newName;
      if (Array.isArray(p.comments)) {
        p.comments.forEach((c) => {
          if (c && (c.uid === u.uid || c.author === oldName)) c.author = newName;
        });
      }
    }
  });

  (REMO_STORE.state.bottles || []).forEach((b) => {
    if (b && (b.fromUid === u.uid || b.fromName === oldName)) b.fromName = newName;
  });

  (REMO_STORE.state.directMessages || []).forEach((m) => {
    if (m) {
      if (m.fromUid === u.uid || m.fromName === oldName) m.fromName = newName;
      if (m.toUid === u.uid || m.toName === oldName) m.toName = newName;
    }
  });

  REMO_STORE.save(true, 'profile_updated');

  closeEditProfileModal();
  syncHeaderAndSidebars();
  renderPassportView();
  if (typeof renderSocialFeed === 'function') renderSocialFeed();

  RemoAudio.play('coin');
  remoToast(lang === 'fr' ? '✓ Profil mis à jour avec succès !' : '✓ Profile updated successfully!', 'coin');
}

window.openEditProfileModal = openEditProfileModal;
window.closeEditProfileModal = closeEditProfileModal;
window.saveUserProfile = saveUserProfile;

function renderPassportView() {
  const box = document.getElementById('passportContentBox');
  if (!box) return;
  const lang = REMO_I18N.getLang();
  const u = REMO_STORE.getCurrentUser() || REMO_STORE.ensureGuestOrCitizen('REMO Pioneer', '', 'montreal');
  const home = getCityById(u.homeCity || 'montreal');
  const allCities = getRemoCities();
  const refCode = u.referralCode || `REMO-${u.passportNum}`;
  const activeTab = window._activeProfileTab || 'posts';

  // My Posts
  const myPosts = (REMO_STORE.state.posts || []).filter(
    (p) => p && (p.uid === u.uid || (u.email && p.authorEmail && u.email.toLowerCase() === p.authorEmail.toLowerCase()) || p.authorName === u.name)
  );

  // My Discussions / Direct Messages
  const dms = Array.isArray(REMO_STORE.state.directMessages) ? REMO_STORE.state.directMessages : [];
  const myDms = dms.filter((m) => m && (m.fromUid === u.uid || m.toUid === u.uid));
  const partnerMap = new Map();
  myDms.forEach((m) => {
    const partnerUid = m.fromUid === u.uid ? m.toUid : m.fromUid;
    if (!partnerUid || partnerUid === u.uid) return;
    if (!partnerMap.has(partnerUid)) {
      partnerMap.set(partnerUid, { lastMsg: m, count: 1 });
    } else {
      const prev = partnerMap.get(partnerUid);
      prev.count++;
      if ((m.ts || 0) > (prev.lastMsg.ts || 0)) prev.lastMsg = m;
    }
  });
  const partnerList = Array.from(partnerMap.entries()).map(([pUid, info]) => {
    const pUser = (REMO_STORE.state.users || []).find((x) => x.uid === pUid) || { uid: pUid, name: info.lastMsg.fromName || 'Citizen', homeCity: 'montreal' };
    return { user: pUser, ...info };
  });

  // Equipped VIP Cosmetics
  const allShopItems = Array.isArray(REMO_STORE.state.vipShopItems) ? REMO_STORE.state.vipShopItems : [];
  const equippedFrameItem = allShopItems.find((x) => x.id === u.equippedFrame);
  const frameClass = equippedFrameItem ? equippedFrameItem.cssClass : (u.equippedFrame || 'av-frame-gold_fire');
  const equippedTitleItem = allShopItems.find((x) => x.id === u.equippedTitleId);
  const titleBadge = equippedTitleItem ? (lang === 'fr' ? (equippedTitleItem.badge_fr || equippedTitleItem.name_fr) : (equippedTitleItem.badge_en || equippedTitleItem.name_en)) : '';

  // Genesis Tier & Allocation Stats
  const userTier = (typeof REMO_STORE.getUserPassportTier === 'function')
    ? REMO_STORE.getUserPassportTier(u.passportNum)
    : { badge_fr: '🌟 PIONNIER GENESIS #1', badge_en: '🌟 GENESIS PIONEER TIER 1', cssClass: 'genesis-tier-badge' };
  const tierBadgeText = lang === 'fr' ? userTier.badge_fr : userTier.badge_en;
  const genStats = (typeof REMO_STORE.getGenesisAllocationStats === 'function')
    ? REMO_STORE.getGenesisAllocationStats()
    : { totalMax: 500, claimed: 421, remaining: 79, percentage: 84 };

  // User City Stock Portfolio
  const userPortfolio = (REMO_STORE.state.cityPortfolios && REMO_STORE.state.cityPortfolios[u.uid]) || {};
  const ownedCityEntries = Object.entries(userPortfolio).filter(([cId, count]) => count > 0);
  const totalSharesOwned = ownedCityEntries.reduce((sum, [cId, count]) => sum + count, 0);
  const totalPortfolioValue = ownedCityEntries.reduce((sum, [cId, count]) => {
    const p = REMO_STORE.getCitySharePrice(cId);
    return sum + (p * count);
  }, 0);

  // 1. Profile Hero Card
  let html = `
    <div class="profile-hero-card">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;">
        <div style="display:flex;align-items:center;gap:16px;min-width:0;">
          <div class="avatar-circle ${frameClass}" style="width:68px;height:68px;font-size:1.75rem;flex-shrink:0;">
            ${escapeHtmlStr((u.name || 'R')[0].toUpperCase())}
          </div>
          <div style="min-width:0;">
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
              <h2 style="font-family:'Orbitron',sans-serif;font-size:1.3rem;color:#fbbf24;margin:0;">
                ${escapeHtmlStr(u.name)}
              </h2>
              ${u.verified ? '<span style="color:#38bdf8;font-size:1.1rem;" title="Vérifié">✓</span>' : ''}
              ${u.role === 'admin' ? '<span class="adm-badge">👑 ADMIN</span>' : ''}
              ${titleBadge ? `<span class="royal-title-pill">${escapeHtmlStr(titleBadge)}</span>` : ''}
              <span class="${userTier.cssClass || 'genesis-tier-badge'}">${escapeHtmlStr(tierBadgeText)}</span>
            </div>
            <div style="font-size:0.84rem;color:#94a3b8;margin-top:3px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
              <span>${home.flag} <b>${escapeHtmlStr(getCityName(home, lang))}</b></span>
              <span>•</span>
              <span style="color:#cbd5e1;">#${escapeHtmlStr(u.passportNum || '0001')}</span>
              ${(u.email && u.role !== 'admin') ? `<span>•</span> <span style="font-size:0.75rem;color:#64748b;">${escapeHtmlStr(u.email)}</span>` : ''}
            </div>
            <div style="font-size:0.83rem;color:#e2e8f0;margin-top:6px;font-style:italic;">
              "${escapeHtmlStr(u.bio || (lang === 'fr' ? 'Citoyen explorateur de REMO World 🌍' : 'Exploring the cities of REMO World 🌍'))}"
            </div>
          </div>
        </div>
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
          <button class="btn-cyber btn-gold" style="padding:8px 14px;font-size:0.82rem;font-weight:900;" onclick="openCityAmbassadorModal()">
            🏅 ${lang === 'fr' ? 'Diplôme d’Ambassadeur (+25 🪙)' : 'Ambassador Diploma (+25 🪙)'}
          </button>
          <button class="btn-cyber" style="padding:8px 14px;font-size:0.82rem;" onclick="openEditProfileModal()">
            ✏️ ${lang === 'fr' ? 'Modifier Profil' : 'Edit Profile'}
          </button>
          <button class="btn-ghost" style="border-color:#f43f5e;color:#fda4af;padding:8px 12px;font-size:0.82rem;" onclick="userSignOutAction()">
            🚪 ${lang === 'fr' ? 'Déconnexion' : 'Sign Out'}
          </button>
        </div>
      </div>

      <!-- Quick Stats Strip -->
      <div class="profile-stats-strip">
        <div class="prof-stat-badge" style="border-color:#fbbf24;color:#fbbf24;">
          🪙 <b>${u.coins.toLocaleString()}</b> REMO Coins
        </div>
        <div class="prof-stat-badge" style="border-color:#10b981;color:#6ee7b7;cursor:pointer;" onclick="setPassportTab('stocks')" title="${lang === 'fr' ? 'Voir mon portefeuille d’actions' : 'View stock portfolio'}">
          📈 <b>${totalSharesOwned}</b> ${lang === 'fr' ? 'Actions Villes' : 'City Shares'}
        </div>
        <div class="prof-stat-badge">
          📸 <b>${myPosts.length}</b> ${lang === 'fr' ? 'Publications' : 'Posts'}
        </div>
        <div class="prof-stat-badge">
          💬 <b>${partnerList.length}</b> Discussions
        </div>
        <div class="prof-stat-badge">
          🎴 <b>${(u.cards || []).length}</b> ${lang === 'fr' ? 'Cartes 4D' : '4D Cards'}
        </div>
        <div class="prof-stat-badge">
          🛂 <b>${(u.visas || []).length} / ${allCities.length}</b> ${lang === 'fr' ? 'Visas GPS' : 'Visas'}
        </div>
      </div>

      <!-- Genesis Allocation Progress Bar -->
      <div style="margin-top:14px;background:rgba(251,191,36,0.06);border:1px solid rgba(251,191,36,0.25);border-radius:14px;padding:12px 14px;">
        <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.75rem;font-weight:800;color:#fbbf24;margin-bottom:6px;flex-wrap:wrap;gap:6px;">
          <span>🔥 ${t('genesis_progress_hdr')} (#0001–#0500)</span>
          <span style="color:#fde047;">${genStats.claimed} / ${genStats.totalMax} ${t('genesis_progress_stat')} (${genStats.remaining} ${t('genesis_progress_rem')})</span>
        </div>
        <div style="height:6px;width:100%;border-radius:999px;background:rgba(255,255,255,0.1);overflow:hidden;">
          <div style="height:100%;width:${genStats.percentage}%;background:linear-gradient(90deg,#fbbf24,#f59e0b);border-radius:999px;"></div>
        </div>
      </div>
    </div>

    <!-- Navigation Tabs Rail -->
    <div class="profile-tabs-rail">
      <button type="button" class="fchip ${activeTab === 'posts' ? 'active' : ''}" onclick="setPassportTab('posts')">
        📸 ${lang === 'fr' ? 'Mes Publications' : 'My Posts'} (${myPosts.length})
      </button>
      <button type="button" class="fchip ${activeTab === 'messages' ? 'active' : ''}" onclick="setPassportTab('messages')">
        💌 ${lang === 'fr' ? 'Mes Discussions' : 'My Messages'} (${partnerList.length})
      </button>
      <button type="button" class="fchip ${activeTab === 'stocks' ? 'active' : ''}" onclick="setPassportTab('stocks')">
        📈 ${lang === 'fr' ? 'Bourse & Actions' : 'City Stocks'} (${totalSharesOwned})
      </button>
      <button type="button" class="fchip ${activeTab === 'inventory' ? 'active' : ''}" onclick="setPassportTab('inventory')">
        🎴 ${lang === 'fr' ? 'Inventaire & Rames VIP' : 'Inventory & Styles'}
      </button>
      <button type="button" class="fchip ${activeTab === 'id' ? 'active' : ''}" onclick="setPassportTab('id')">
        🪪 ${lang === 'fr' ? 'ID Officiel & Visas' : 'Citizen ID & Visas'}
      </button>
    </div>
  `;

  // 2. Tab Contents
  if (activeTab === 'posts') {
    if (myPosts.length === 0) {
      html += `
        <div class="glass-box" style="text-align:center;padding:48px 20px;border-radius:18px;">
          <div style="font-size:2.8rem;margin-bottom:10px;">📸</div>
          <h3 style="font-family:'Orbitron',sans-serif;color:#fff;margin-bottom:6px;">
            ${lang === 'fr' ? 'Aucune publication pour le moment' : 'No posts yet'}
          </h3>
          <p style="color:var(--muted);font-size:0.85rem;max-width:380px;margin:0 auto 16px;">
            ${lang === 'fr' ? 'Partagez une photo, une vidéo de 60s ou une application HTML interactive avec les citoyens du monde !' : 'Share a photo, 60s video, or live HTML app with the citizens of the world!'}
          </p>
          <button class="btn-cyber btn-gold" onclick="openCreatePostModal()">
            + ${lang === 'fr' ? 'Créer ma Première Publication' : 'Create My First Post'}
          </button>
        </div>
      `;
    } else {
      html += `
        <div class="my-posts-grid">
          ${myPosts.map((p) => {
            const cap = lang === 'fr' ? (p.caption_fr || p.caption_en || '') : (p.caption_en || p.caption_fr || '');
            let mediaPreview = '';
            if (p.mediaType === 'html_app') {
              mediaPreview = `
                <div style="background:radial-gradient(circle,#1e1b4b,#020617);width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#38bdf8;padding:12px;text-align:center;">
                  <span style="font-size:2.2rem;margin-bottom:4px;">💻</span>
                  <b style="font-size:0.8rem;letter-spacing:1px;">LIVE HTML APP</b>
                </div>
              `;
            } else if (p.mediaType === 'video') {
              mediaPreview = `
                <div style="background:#020617;width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#ec4899;">
                  <span style="font-size:2.2rem;margin-bottom:4px;">🎬</span>
                  <b style="font-size:0.75rem;">VIDEO (60s)</b>
                </div>
              `;
            } else {
              const src = p.mediaUrl || (Array.isArray(p.mediaUrls) && p.mediaUrls[0]) || '';
              mediaPreview = `<img src="${src}" alt="Post Media" loading="lazy" style="width:100%;height:100%;object-fit:cover;">`;
            }

            return `
              <div class="my-post-card">
                <div class="my-post-thumb-box">${mediaPreview}</div>
                <div style="padding:12px;display:flex;flex-direction:column;justify-content:space-between;flex:1;">
                  <div>
                    <div style="font-size:0.84rem;color:#f8fafc;line-height:1.4;margin-bottom:8px;max-height:56px;overflow:hidden;text-overflow:ellipsis;">
                      ${escapeHtmlStr(cap || (lang === 'fr' ? 'Publication sans légende' : 'Untitled post'))}
                    </div>
                    <div style="display:flex;gap:12px;font-size:0.78rem;font-weight:800;color:var(--muted);margin-bottom:10px;">
                      <span>❤️ ${Array.isArray(p.likes) ? p.likes.length : (p.likes || 0)}</span>
                      <span>💬 ${(p.comments || []).length}</span>
                      <span>🪙 ${p.tipsTotal || 0}</span>
                    </div>
                  </div>
                  <div style="display:flex;gap:8px;justify-content:space-between;align-items:center;padding-top:8px;border-top:1px solid rgba(255,255,255,0.06);">
                    <button class="btn-ghost" style="padding:5px 10px;font-size:0.75rem;" onclick="sharePostLink('${p.id}')">
                      🔗 ${lang === 'fr' ? 'Partager' : 'Share'}
                    </button>
                    <button class="adm-pbtn danger" style="padding:5px 9px;" onclick="userDeleteOwnPost('${p.id}'); setTimeout(renderPassportView, 120);" title="${lang === 'fr' ? 'Supprimer' : 'Delete'}">
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }
  } else if (activeTab === 'messages') {
    if (partnerList.length === 0) {
      html += `
        <div class="glass-box" style="text-align:center;padding:48px 20px;border-radius:18px;">
          <div style="font-size:2.8rem;margin-bottom:10px;">💌</div>
          <h3 style="font-family:'Orbitron',sans-serif;color:#fff;margin-bottom:6px;">
            ${lang === 'fr' ? 'Aucune discussion active' : 'No active discussions'}
          </h3>
          <p style="color:var(--muted);font-size:0.85rem;max-width:380px;margin:0 auto 16px;">
            ${lang === 'fr' ? 'Discutez en direct avec d’autres citoyens ou envoyez une bouteille à la mer !' : 'Chat live with other citizens or toss a message in a bottle!'}
          </p>
          <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
            <button class="btn-cyber" onclick="switchRemoView('chat')">
              💬 ${lang === 'fr' ? 'Ouvrir le Chat des Villes' : 'Open World Chat'}
            </button>
            <button class="btn-ghost" onclick="switchRemoView('bottles')" style="border-color:#38bdf8;color:#7dd3fc;">
              🍾 ${lang === 'fr' ? 'Bouteille à la Mer' : 'City Bottle'}
            </button>
          </div>
        </div>
      `;
    } else {
      html += `
        <div class="glass-box">
          <h3 style="font-family:'Orbitron',sans-serif;font-size:0.98rem;color:#fbbf24;margin-bottom:14px;">
            💌 ${lang === 'fr' ? 'Vos Conversations Récentes' : 'Recent Discussions'}
          </h3>
          ${partnerList.map(({ user: pUser, lastMsg, count }) => {
            const pCity = getCityById(pUser.homeCity || 'montreal');
            const snippet = lastMsg ? (lastMsg.text || (lastMsg.voiceUrl ? '🎤 Voice Note' : '💬 Message')) : '';
            return `
              <div class="my-dm-thread-card" onclick="openDirectChatWithUser('${pUser.uid}')">
                <div style="display:flex;align-items:center;gap:12px;min-width:0;flex:1;">
                  <div class="avatar-circle" style="width:44px;height:44px;font-size:1.15rem;flex-shrink:0;">
                    ${escapeHtmlStr((pUser.name || 'C')[0].toUpperCase())}
                  </div>
                  <div style="min-width:0;flex:1;">
                    <div style="font-weight:900;font-size:0.92rem;color:#fff;display:flex;align-items:center;gap:6px;">
                      <span>${pCity.flag} @${escapeHtmlStr(pUser.name)}</span>
                      <span style="font-size:0.72rem;color:var(--muted);font-weight:700;">(${count} msg)</span>
                    </div>
                    <div style="font-size:0.78rem;color:#cbd5e1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:2px;">
                      ${escapeHtmlStr(snippet)}
                    </div>
                  </div>
                </div>
                <div>
                  <button class="btn-cyber btn-gold" style="padding:6px 12px;font-size:0.76rem;" onclick="event.stopPropagation();openDirectChatWithUser('${pUser.uid}')">
                    💬 ${lang === 'fr' ? 'Ouvrir' : 'Open'}
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }
  } else if (activeTab === 'stocks') {
    // 📈 User City Stocks Portfolio
    html += `
      <div class="glass-box" style="margin-bottom:16px;">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:14px;">
          <div>
            <h3 style="font-family:'Orbitron',sans-serif;font-size:1.05rem;color:#10b981;margin:0;">
              📈 ${lang === 'fr' ? 'Portefeuille d’Actions des Villes' : 'City Stock Portfolio'}
            </h3>
            <p style="font-size:0.79rem;color:var(--muted);margin-top:3px;">
              ${lang === 'fr' ? 'Vos investissements dans les villes du monde. Vendez quand le cours monte pour encaisser vos plus-values !' : 'Your investments in world cities. Sell when prices rise to cash in profits!'}
            </p>
          </div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
            <div style="padding:6px 14px;border-radius:12px;background:rgba(16,185,129,0.12);border:1px solid #10b981;font-size:0.84rem;font-weight:900;color:#34d399;">
              🪙 ${totalPortfolioValue.toLocaleString()} ${lang === 'fr' ? 'Valeur Totale' : 'Total Value'}
            </div>
            <button type="button" class="btn-cyber" style="padding:7px 14px;font-size:0.8rem;" onclick="switchRemoView('exchange')">
              🏛️ ${lang === 'fr' ? 'Bourse des Villes' : 'City Exchange'}
            </button>
          </div>
        </div>

        ${ownedCityEntries.length === 0 ? `
          <div style="text-align:center;padding:40px 20px;background:rgba(255,255,255,0.02);border-radius:16px;border:1px dashed var(--border);">
            <div style="font-size:2.6rem;margin-bottom:8px;">📈</div>
            <h4 style="font-family:'Orbitron',sans-serif;color:#fff;margin-bottom:6px;">
              ${lang === 'fr' ? 'Vous ne possédez aucune action de ville' : 'No city shares owned yet'}
            </h4>
            <p style="color:var(--muted);font-size:0.84rem;max-width:420px;margin:0 auto 14px;">
              ${lang === 'fr' ? 'Investissez vos Pièces REMO dans vos villes favorites ($MTL, $KIV, $PAR, $BUH...) et devenez actionnaire officiel de leur rayonnement !' : 'Invest your REMO Coins in your favorite cities ($MTL, $KIV, $PAR, $BUH...) and become an official shareholder!'}
            </p>
            <button type="button" class="btn-cyber btn-gold" onclick="switchRemoView('exchange')">
              📈 ${lang === 'fr' ? 'Acheter mes Premières Actions' : 'Buy My First City Shares'}
            </button>
          </div>
        ` : `
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px;">
            ${ownedCityEntries.map(([cId, count]) => {
              const c = getCityById(cId) || { id: cId, flag: '🌍', code: cId.toUpperCase() };
              const currentPrice = REMO_STORE.getCitySharePrice(cId);
              const totalVal = currentPrice * count;
              const mayor = REMO_STORE.getCityMayor(cId);

              return `
                <div style="padding:14px;border-radius:16px;background:rgba(255,255,255,0.04);border:1px solid rgba(16,185,129,0.35);display:flex;flex-direction:column;justify-content:space-between;gap:10px;">
                  <div>
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                      <b style="font-size:1.02rem;color:#fff;">${c.flag} $${c.code}</b>
                      <span style="color:#10b981;font-weight:900;font-size:0.92rem;">🪙 ${currentPrice}</span>
                    </div>
                    <div style="font-weight:800;font-size:0.86rem;color:#7dd3fc;margin-top:2px;">
                      ${getCityName(c, lang)}
                    </div>
                    <div style="font-size:0.73rem;color:var(--muted);margin-top:4px;">
                      ${mayor ? `👑 ${lang === 'fr' ? 'Maire' : 'Mayor'}: @${escapeHtmlStr(mayor.name)}` : ''}
                    </div>
                    <div style="margin-top:10px;padding:8px 10px;border-radius:10px;background:rgba(0,0,0,0.3);display:flex;justify-content:space-between;align-items:center;font-size:0.82rem;">
                      <span style="color:#cbd5e1;">${lang === 'fr' ? 'Détenu :' : 'Owned:'} <b style="color:#fbbf24;font-size:0.95rem;">${count}</b></span>
                      <span style="color:#34d399;font-weight:900;">= 🪙 ${totalVal.toLocaleString()}</span>
                    </div>
                  </div>

                  <div style="display:flex;gap:6px;margin-top:4px;">
                    <button type="button" class="btn-cyber" style="flex:1;justify-content:center;padding:7px;font-size:0.78rem;" onclick="buyCityStockShare('${c.id}')">
                      ➕ ${lang === 'fr' ? 'Acheter' : 'Buy (+1)'}
                    </button>
                    <button type="button" class="btn-cyber btn-gold" style="flex:1;justify-content:center;padding:7px;font-size:0.78rem;" onclick="sellCityStockShare('${c.id}')">
                      💰 ${lang === 'fr' ? 'Vendre' : 'Sell (-1)'}
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>
    `;
  } else if (activeTab === 'inventory') {
    // Inventory: Frames & Titles & 4D Cards
    const ownedIds = Array.isArray(u.ownedShopItems) ? u.ownedShopItems : [];
    const ownedItems = allShopItems.filter((it) => ownedIds.includes(it.id));
    const userCards = Array.isArray(u.cards) ? u.cards : [];

    html += `
      <div class="glass-box" style="margin-bottom:16px;">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:12px;">
          <h3 style="font-family:'Orbitron',sans-serif;font-size:0.98rem;color:#fbbf24;">
            ✨ ${lang === 'fr' ? 'Rames d’Avatar & Titres Royaux Détenus' : 'Owned Avatar Frames & Royal Titles'}
          </h3>
          <button class="btn-cyber" style="padding:6px 12px;font-size:0.78rem;" onclick="switchRemoView('shop')">
            🛍️ ${lang === 'fr' ? 'Boutique VIP' : 'VIP Shop'}
          </button>
        </div>

        ${ownedItems.length === 0 ? `
          <div style="text-align:center;padding:24px;color:var(--muted);font-size:0.85rem;">
            ${lang === 'fr' ? 'Vous n’avez pas encore de cadre ou de titre VIP.' : 'You don’t own any VIP frames or titles yet.'}<br>
            <button class="btn-cyber btn-gold" style="margin-top:10px;" onclick="switchRemoView('shop')">
              🛍️ ${lang === 'fr' ? 'Découvrir la Boutique VIP' : 'Explore VIP Boutique'}
            </button>
          </div>
        ` : `
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:10px;">
            ${ownedItems.map((it) => {
              const isEquipped = (it.category === 'frame' && u.equippedFrame === it.id) || (it.category === 'title' && u.equippedTitleId === it.id);
              const itName = lang === 'fr' ? (it.name_fr || it.name_en) : (it.name_en || it.name_fr);
              return `
                <div style="padding:12px;border-radius:14px;background:rgba(255,255,255,0.04);border:1px solid ${isEquipped ? '#10b981' : 'var(--border)'};text-align:center;">
                  <div style="font-size:1.8rem;margin-bottom:6px;">${it.icon || '💎'}</div>
                  <b style="font-size:0.86rem;color:#fff;">${escapeHtmlStr(itName)}</b>
                  <div style="font-size:0.7rem;color:var(--muted);text-transform:uppercase;margin:3px 0 10px;">${it.category}</div>
                  <button class="${isEquipped ? 'btn-ghost' : 'btn-cyber btn-gold'}" style="width:100%;justify-content:center;padding:5px 8px;font-size:0.75rem;${isEquipped ? 'border-color:#10b981;color:#34d399;' : ''}" onclick="buyOrEquipVipItem('${it.id}'); setTimeout(renderPassportView, 120);">
                    ${isEquipped ? (lang === 'fr' ? '✓ Équipé' : '✓ Equipped') : (lang === 'fr' ? '✨ Équiper' : '✨ Equip')}
                  </button>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>

      <div class="glass-box">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:12px;">
          <h3 style="font-family:'Orbitron',sans-serif;font-size:0.98rem;color:#38bdf8;">
            🎴 ${lang === 'fr' ? 'Collection de Cartes de Villes 4D' : '4D City Cards Collection'} (${userCards.length})
          </h3>
          <button class="btn-cyber btn-gold" style="padding:6px 12px;font-size:0.78rem;" onclick="switchRemoView('cards')">
            🎁 ${lang === 'fr' ? 'Ouvrir un Pack' : 'Open Pack'}
          </button>
        </div>
        ${userCards.length === 0 ? `
          <div style="text-align:center;padding:24px;color:var(--muted);font-size:0.85rem;">
            ${lang === 'fr' ? 'Aucune carte dans votre inventaire.' : 'No cards in your collection yet.'}
          </div>
        ` : `
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px;">
            ${userCards.slice(0, 12).map((c) => {
              const cCity = getCityById(c.cityId);
              return `
                <div style="padding:10px;border-radius:12px;background:rgba(255,255,255,0.03);border:1px solid var(--border);text-align:center;cursor:pointer;" onclick="inspectCardById('${c.id}')">
                  <div style="font-size:1.6rem;">${cCity.flag}</div>
                  <b style="font-size:0.78rem;color:#fff;">${getCityName(cCity, lang)}</b>
                  <div style="font-size:0.68rem;color:#fbbf24;font-weight:900;margin-top:2px;">#${c.serial} · ${c.rarity}</div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>
    `;
  } else if (activeTab === 'id') {
    // ID Card Canvas & Visas
    html += `
      <!-- Official Citizen ID & Referral QR Card -->
      <div class="glass-box" style="background:linear-gradient(135deg,#0b1124,#1e1b4b);border-color:rgba(251,191,36,0.55);margin-bottom:16px;">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:10px;">
          <div>
            <h2 style="font-family:'Orbitron',sans-serif;font-size:1.08rem;color:#fbbf24;">${t('passport_id_hdr')}</h2>
            <p style="font-size:0.79rem;color:#cbd5e1;margin-top:3px;">${t('passport_id_sub')}</p>
          </div>
        </div>

        <div style="text-align:center;margin:10px 0 14px;">
          <canvas id="citizenOfficialIdCanvas" style="width:100%;max-width:680px;height:auto;border-radius:16px;box-shadow:0 16px 40px rgba(0,0,0,0.75);"></canvas>
        </div>

        <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-bottom:14px;">
          <button class="btn-cyber btn-gold" style="background:linear-gradient(135deg,#f59e0b,#ec4899);border-color:#fbbf24;color:#fff;font-weight:900;" onclick="exportPassportStory()">📲 ${t('passport_share_story')}</button>
          <button class="btn-cyber" style="background:linear-gradient(135deg,#0284c7,#06b6d4);border-color:#38bdf8;color:#fff;font-weight:900;" onclick="openBoardingPassModal()">🎫 ${lang === 'fr' ? 'Billet 4D 9:16' : '4D Boarding Pass'}</button>
          <button class="btn-cyber btn-gold" onclick="downloadCitizenIdPNG()">${t('passport_dl_id_btn')}</button>
          <button class="btn-cyber" onclick="copyMyReferralInviteLink()">${t('passport_copy_ref_btn')} (${refCode})</button>
          <button class="btn-ghost" style="border-color:#10b981;color:#34d399;" onclick="shareReferralOnWhatsApp()">${t('passport_wa_ref_btn')}</button>
        </div>

        ${!u.referredBy ? `
          <div style="background:rgba(16,185,129,0.1);border:1px dashed #10b981;border-radius:14px;padding:10px 12px;display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
            <span style="font-size:0.8rem;font-weight:800;color:#6ee7b7;flex:1;min-width:200px;">${t('passport_claim_ref_hdr')}</span>
            <input type="text" id="claimFriendRefInp" class="remo-input" style="max-width:190px;text-transform:uppercase;padding:7px 11px;" placeholder="${t('passport_claim_ref_ph')}">
            <button class="btn-cyber" style="background:#10b981;" onclick="claimFriendReferralInput()">${t('passport_claim_ref_btn')}</button>
          </div>
        ` : `
          <div style="text-align:center;font-size:0.78rem;color:#34d399;font-weight:800;">
            ✓ ${lang === 'fr' ? 'Parrainé avec le code' : 'Invited via Citizen Code'}: ${u.referredBy}
          </div>
        `}
      </div>

      <!-- 3D Visa Stamp Album -->
      <div class="glass-box">
        <h3 style="margin-bottom:12px;">${t('passport_visas_collected')} ${(u.visas || []).length} / ${allCities.length}</h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(135px,1fr));gap:10px;">
          ${allCities.map((c) => {
            const stamped = (u.visas || []).includes(c.id);
            return `
              <div style="padding:12px;border-radius:14px;text-align:center;border:1px solid ${stamped ? '#fbbf24' : 'rgba(255,255,255,0.08)'};background:${stamped ? 'rgba(251,191,36,0.12)' : 'rgba(255,255,255,0.02)'};opacity:${stamped ? '1' : '0.45'};">
                <div style="font-size:1.6rem;">${c.flag}</div>
                <div style="font-weight:800;font-size:0.82rem;margin-top:4px;">${getCityName(c, lang)}</div>
                <div style="font-size:0.68rem;color:${stamped ? '#10b981' : '#94a3b8'};font-weight:800;margin-top:3px;">
                  ${stamped ? (lang === 'fr' ? '✓ VISA ACTIF' : '✓ STAMPED') : (lang === 'fr' ? 'VERROUILLÉ' : 'LOCKED')}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- 🛂 4D Sovereign Border Control Station & Real GPS Stamps -->
      <div class="border-control-station-box">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:10px;">
          <div>
            <h3 style="font-family:'Orbitron',sans-serif;font-size:1.05rem;color:#fbbf24;display:flex;align-items:center;gap:8px;">
              <span>🛂</span> <span>${t('border_control_hdr')}</span>
            </h3>
            <p style="font-size:0.78rem;color:#cbd5e1;margin-top:2px;">${t('border_control_sub')}</p>
          </div>
          <button class="btn-cyber btn-gold" style="padding:9px 16px;font-size:0.84rem;font-weight:900;" onclick="verifyPhysicalGpsVisa()">
            ${t('border_stamp_btn')}
          </button>
        </div>

        <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;background:rgba(251,191,36,0.1);border:1px solid rgba(251,191,36,0.3);border-radius:10px;padding:8px 12px;">
          <span style="font-size:1.2rem;">🏛️</span>
          <div style="font-size:0.78rem;">
            <span style="color:#94a3b8;">${lang === 'fr' ? 'Rang Diplomatique :' : 'Diplomatic Rank:'}</span>
            <b style="color:#fbbf24;font-family:'Orbitron',sans-serif;margin-left:6px;">${u.diplomaticRank || ((Array.isArray(u.gpsBorderVisas) ? u.gpsBorderVisas.length : 0) >= 5 ? 'Ambassadeur Mondial' : ((Array.isArray(u.gpsBorderVisas) ? u.gpsBorderVisas.length : 0) >= 3 ? 'Globetrotter Vérifié' : ((Array.isArray(u.gpsBorderVisas) ? u.gpsBorderVisas.length : 0) >= 1 ? 'Attaché Diplomatique' : (lang === 'fr' ? 'Citoyen Virtuel' : 'Virtual Citizen'))))}</b>
            <span style="color:#64748b;margin-left:8px;">(${(Array.isArray(u.gpsBorderVisas) ? u.gpsBorderVisas.length : 0)} ${lang === 'fr' ? 'Vérifications GPS réelles' : 'Real GPS Visas'})</span>
          </div>
        </div>

        ${!(Array.isArray(u.gpsBorderVisas) && u.gpsBorderVisas.length > 0) ? `
          <div style="text-align:center;padding:20px 10px;color:var(--muted);font-size:0.8rem;border:1px dashed rgba(255,255,255,0.1);border-radius:12px;">
            ${t('border_visas_empty')}
          </div>
        ` : `
          <div class="diplomatic-passport-grid">
            ${u.gpsBorderVisas.map((s) => {
              const c = getCityById(s.cityId) || { flag: '🌍', name_en: 'City', name_fr: 'Ville' };
              const dateStr = new Date(s.stampedAt).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
              return `
                <div class="diplomatic-stamp-card">
                  <div class="stamp-seal-circle">
                    <span class="stamp-seal-flag">${c.flag}</span>
                    <span class="stamp-seal-code">${s.code || c.code}</span>
                  </div>
                  <b style="font-family:'Orbitron',sans-serif;font-size:0.88rem;color:#f8fafc;display:block;">${getCityName(c, lang)}</b>
                  <div class="stamp-meta-serial">${s.serial || 'BDR-GPS-001'}</div>
                  <div class="stamp-meta-time">📅 ${dateStr}</div>
                  <div class="stamp-meta-coords">🏛️ ${t('border_stamp_verified_badge')} · ${getCityName(c, lang)}</div>
                  <div class="stamp-verified-ribbon">${t('border_stamp_verified_badge')}</div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>

      <!-- 🔒 Privacy & Data Rights (GDPR & Law 25 Québec) -->
      <div class="glass-box" style="margin-top:16px;border-color:rgba(244,63,94,0.35);background:rgba(244,63,94,0.04);">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
          <div>
            <h3 style="font-family:'Orbitron',sans-serif;font-size:0.95rem;color:#f43f5e;display:flex;align-items:center;gap:6px;margin-bottom:4px;">
              <span>🛡️</span> <span>${lang === 'fr' ? 'Confidentialité &amp; Droit à l’Oubli (RGPD / Loi 25)' : 'Privacy &amp; Data Rights (GDPR / Law 25)'}</span>
            </h3>
            <p style="font-size:0.78rem;color:#cbd5e1;margin:0;">
              ${lang === 'fr'
                ? 'Conformément aux normes internationales, vous pouvez consulter vos droits ou effacer définitivement votre compte et vos données.'
                : 'Under international privacy regulations, you have full control to view policies or permanently erase your account and data.'}
            </p>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <a href="terms.html" target="_blank" class="btn-ghost" style="padding:6px 12px;font-size:0.75rem;">📜 ${lang === 'fr' ? 'Conditions' : 'Terms'}</a>
            <a href="privacy.html" target="_blank" class="btn-ghost" style="padding:6px 12px;font-size:0.75rem;">🔒 ${lang === 'fr' ? 'Confidentialité' : 'Privacy'}</a>
            <button type="button" class="btn-cyber rose" style="padding:6px 12px;font-size:0.75rem;background:#f43f5e;color:#fff;" onclick="userSelfDeleteAccountAction()">
              🗑️ ${t('btn_delete_account')}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  box.innerHTML = html;

  if (activeTab === 'id') {
    const cv = document.getElementById('citizenOfficialIdCanvas');
    if (cv) drawOfficialCitizenIdCard(cv, u, lang);
  }
}

function downloadCitizenIdPNG() {
  const u = REMO_STORE.getCurrentUser() || REMO_STORE.ensureGuestOrCitizen('REMO Pioneer', '', 'montreal');
  const cv = document.getElementById('citizenOfficialIdCanvas') || document.createElement('canvas');
  drawOfficialCitizenIdCard(cv, u, REMO_I18N.getLang());
  downloadCanvasAsPNG(cv, `REMO_Citizen_ID_${u.referralCode || u.passportNum}.png`);
  remoToast(REMO_I18N.getLang() === 'fr' ? '🪪 Carte d’Identité HD téléchargée !' : '🪪 Official HD Citizen ID downloaded!', 'fanfare');
}

function copyMyReferralInviteLink() {
  const lang = REMO_I18N.getLang();
  const u = REMO_STORE.getCurrentUser() || REMO_STORE.ensureGuestOrCitizen('REMO Pioneer', '', 'montreal');
  const url = getCitizenInviteUrl(u);
  copyTextToClipboard(url);
  remoToast(
    lang === 'fr'
      ? `🔗 Lien d’invitation copié (${u.referralCode}) ! +100 🪙 par ami !`
      : `🔗 Invite link copied (${u.referralCode})! +100 🪙 per friend!`,
    'coin'
  );
}

function shareReferralOnWhatsApp() {
  const lang = REMO_I18N.getLang();
  const u = REMO_STORE.getCurrentUser() || REMO_STORE.ensureGuestOrCitizen('REMO Pioneer', '', 'montreal');
  const c = getCityById(u.homeCity || 'montreal');
  const url = getCitizenInviteUrl(u);
  const txt = lang === 'fr'
    ? `🌐 Rejoins-moi dans ${c.flag} ${getCityName(c, 'fr')} sur REMO ! Utilise mon code citoyen ${u.referralCode} pour recevoir +100 🪙 Pièces REMO gratuites : ${url}`
    : `🌐 Join me representing ${c.flag} ${getCityName(c, 'en')} on REMO! Use my Citizen Code ${u.referralCode} so we BOTH get +100 🪙 Free REMO Coins: ${url}`;
  if (navigator.share) {
    navigator.share({ title: 'REMO Invite (+100 Coins)', text: txt, url }).catch(() => {});
  } else {
    window.open(`https://wa.me/?text=${encodeURIComponent(txt)}`, '_blank');
  }
}

function claimFriendReferralInput() {
  const lang = REMO_I18N.getLang();
  const u = REMO_STORE.getCurrentUser() || REMO_STORE.ensureGuestOrCitizen('REMO Citizen', '', 'montreal');
  const code = document.getElementById('claimFriendRefInp')?.value.trim();
  if (!code) return;
  const res = REMO_STORE.redeemReferralCode(u.uid, code);
  if (!res.ok) {
    const msg = res.reason === 'self'
      ? (lang === 'fr' ? '❌ Vous ne pouvez pas utiliser votre propre code !' : '❌ You cannot enter your own code!')
      : res.reason === 'already_claimed'
        ? (lang === 'fr' ? '✓ Bonus de parrainage déjà activé !' : '✓ Referral bonus already claimed!')
        : (lang === 'fr' ? '❌ Code citoyen introuvable (essayez ex: REMO-0001).' : '❌ Citizen code not found (try e.g. REMO-0001).');
    remoToast(msg);
    return;
  }
  spawnRemoCoinsFX(14);
  if (typeof syncHeaderAndSidebars === 'function') syncHeaderAndSidebars();
  renderPassportView();
  remoToast(
    lang === 'fr'
      ? `🎉 +${res.bonus} 🪙 envoyés à vous et à @${res.inviter.name} !`
      : `🎉 +${res.bonus} 🪙 awarded to BOTH you and @${res.inviter.name}!`,
    'fanfare'
  );
}

function changeUserHomeCity(cityId) {
  const u = REMO_STORE.getCurrentUser();
  if (!u) {
    openAuthModal();
    return;
  }
  u.homeCity = cityId;
  if (!u.visas.includes(cityId)) u.visas.push(cityId);
  REMO_STORE.save(true, 'home_city');
  renderPassportView();
  remoToast(REMO_I18N.getLang() === 'fr' ? '🏙️ Ville d’allégeance mise à jour !' : '🏙️ Home City updated!');
}

function drawStoryVerticalCanvas(cv, u, lang) {
  if (!cv) return;
  try {
    cv.width = 1080;
    cv.height = 1920;
    const ctx = cv.getContext('2d');
    const home = getCityById((u && u.homeCity) || 'montreal') || getCityById('montreal');
    const col = home.themeColor || '#38bdf8';
    const refCode = (u && u.referralCode) || `REMO-${(u && u.passportNum) || '0001'}`;
    const inviteUrl = getCitizenInviteUrl(u || { passportNum: '0001' });
    const cosm = u && u.uid ? REMO_STORE.getUserCosmetics(u.uid) : { title_en: '', title_fr: '' };
    const royalTitle = lang === 'fr' ? (cosm.title_fr || (u.role === 'admin' ? 'FONDATEUR' : 'CITOYEN OFFICIEL')) : (cosm.title_en || (u.role === 'admin' ? 'FOUNDER' : 'OFFICIAL CITIZEN'));

    // 1. Deep Cyber Cosmic Gradient Background
    const bg = ctx.createLinearGradient(0, 0, 1080, 1920);
    bg.addColorStop(0, '#02050f');
    bg.addColorStop(0.3, '#09102b');
    bg.addColorStop(0.7, '#13113d');
    bg.addColorStop(1, '#030511');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 1080, 1920);

    // 2. City Aura Glow
    const glow = ctx.createRadialGradient(540, 740, 40, 540, 740, 500);
    glow.addColorStop(0, col + '44');
    glow.addColorStop(0.6, col + '15');
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, 1080, 1920);

    // 3. Holographic Security Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.035)';
    ctx.lineWidth = 1;
    for (let x = 0; x < 1080; x += 45) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 1920); ctx.stroke(); }
    for (let y = 0; y < 1920; y += 45) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1080, y); ctx.stroke(); }

    // 4. Double Cyber Borders
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 6;
    ctx.strokeRect(36, 36, 1008, 1848);
    ctx.strokeStyle = col;
    ctx.lineWidth = 2;
    ctx.strokeRect(50, 50, 980, 1820);

    // 5. Header Branding Strip
    ctx.fillStyle = 'rgba(251,191,36,0.12)';
    ctx.fillRect(52, 52, 976, 120);
    ctx.textAlign = 'center';
    ctx.font = '900 48px "Orbitron", sans-serif';
    ctx.fillStyle = '#fbbf24';
    ctx.fillText('🌐 REMO WORLD', 540, 116);
    ctx.font = '800 24px "Outfit", sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(lang === 'fr' ? 'PASSEPORT CITOYEN OFFICIEL · COUPE DES VILLES 4D' : 'OFFICIAL WORLD CITIZEN PASSPORT · 4D CITIES CUP', 540, 154);

    // 6. User Avatar Badge & Name
    const avatarY = 270;
    ctx.beginPath();
    ctx.arc(540, avatarY, 68, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = '#fbbf24';
    ctx.font = '900 58px "Orbitron", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(((u && u.name) || 'R').charAt(0).toUpperCase(), 540, avatarY);
    ctx.textBaseline = 'alphabetic';

    // Citizen Name
    ctx.font = '900 50px "Outfit", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`@${(u && u.name) || 'Pioneer'}`, 540, 395);

    // Royal / Genesis Pioneer Badge Pill
    const pNum = (u && u.passportNum) || '0001';
    const tierInfo = (typeof REMO_STORE !== 'undefined' && typeof REMO_STORE.getUserPassportTier === 'function')
      ? REMO_STORE.getUserPassportTier(pNum)
      : { tier: 1, color: '#fbbf24', border: '#f59e0b', badge: '🌟 GENESIS PIONEER TIER 1', name_en: 'GENESIS PIONEER TIER 1', name_fr: 'PIONNIER GENESIS TIER 1' };
    const tierBadgeText = lang === 'fr' ? (tierInfo.tier === 1 ? '🌟 PIONNIER GENESIS TIER 1' : tierInfo.tier === 2 ? '🛡️ CITOYEN TITANE TIER 2' : '🌍 CITOYEN SOUVERAIN TIER 3') : tierInfo.badge;

    const pillW = 560;
    ctx.fillStyle = tierInfo.tier === 1 ? 'rgba(251,191,36,0.22)' : tierInfo.tier === 2 ? 'rgba(56,189,248,0.2)' : 'rgba(167,139,250,0.18)';
    ctx.strokeStyle = tierInfo.color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(540 - pillW / 2, 415, pillW, 46, 23);
    } else {
      ctx.rect(540 - pillW / 2, 415, pillW, 46);
    }
    ctx.fill();
    ctx.stroke();
    ctx.font = '900 20px "Orbitron", sans-serif';
    ctx.fillStyle = tierInfo.color;
    ctx.fillText(`${tierBadgeText} · #${pNum}`, 540, 444);

    if (tierInfo.tier === 1) {
      ctx.font = '800 16px "Orbitron", sans-serif';
      ctx.fillStyle = '#fde68a';
      ctx.fillText(lang === 'fr' ? '★ CLUB DES FONDATEURS EXCLUSIF (1 SUR 500 DANS LE MONDE) ★' : '★ EXCLUSIVE FOUNDERS CLUB (1 OF ONLY 500 IN THE WORLD) ★', 540, 482);
    }

    // 7. Middle Stage: City Landmark
    if (typeof drawCityLandmark === 'function') {
      drawCityLandmark(ctx, home.id, col, 540, 710, 220);
    }

    // City Title
    ctx.font = '900 54px "Orbitron", sans-serif';
    ctx.fillStyle = col;
    ctx.fillText(`${home.flag} ${getCityName(home, lang).toUpperCase()}`, 540, 990);

    const countryName = lang === 'fr' ? (home.country_fr || 'Monde') : (home.country_en || 'World');

    ctx.font = '700 24px monospace';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText(`${countryName.toUpperCase()} · ${lang === 'fr' ? 'CITOYEN SOUVERAIN 4D' : 'SOVEREIGN CITIZEN 4D'}`, 540, 1030);

    // 8. Stats Strip
    const statsY = 1080;
    const statBoxW = 280;
    const refsCount = (u && (u.referralsCount !== undefined ? u.referralsCount : u.referralCount)) || 0;
    const stats = [
      { label: lang === 'fr' ? 'PIÈCES REMO' : 'REMO COINS', val: `🪙 ${(u && u.coins) || 0}` },
      { label: lang === 'fr' ? 'VISAS VILLES' : 'CITY VISAS', val: `🌍 ${((u && u.visas) || []).length}` },
      { label: lang === 'fr' ? 'PARRAINAGES' : 'REFERRALS', val: `👥 ${refsCount}` }
    ];
    stats.forEach((st, idx) => {
      const bx = 100 + idx * 300;
      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 1.5;
      ctx.fillRect(bx, statsY, statBoxW, 95);
      ctx.strokeRect(bx, statsY, statBoxW, 95);

      ctx.font = '900 32px "Orbitron", sans-serif';
      ctx.fillStyle = '#fbbf24';
      ctx.fillText(st.val, bx + statBoxW / 2, statsY + 48);

      ctx.font = '800 16px "Outfit", sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(st.label, bx + statBoxW / 2, statsY + 78);
    });

    // 9. Scannable QR Code Box
    const qrBoxY = 1220;
    ctx.fillStyle = 'rgba(15,23,42,0.88)';
    ctx.strokeStyle = tierInfo.color;
    ctx.lineWidth = 3;
    ctx.fillRect(140, qrBoxY, 800, 480);
    ctx.strokeRect(140, qrBoxY, 800, 480);

    // Top QR Box Ribbon
    ctx.fillStyle = tierInfo.color;
    ctx.fillRect(140, qrBoxY, 800, 52);
    ctx.font = '900 23px "Orbitron", sans-serif';
    ctx.fillStyle = '#050814';
    ctx.fillText(lang === 'fr' ? '🎁 SCANNEZ LE QR POUR GAGNER +100 🪙 DE BIENVENUE' : '🎁 SCAN QR TO EARN +100 🪙 WELCOME BONUS', 540, qrBoxY + 35);

    // Draw 280x280 QR Code
    if (typeof RemoQREngine !== 'undefined' && RemoQREngine.toCanvas) {
      try {
        const qrCanvas = RemoQREngine.toCanvas(inviteUrl, 280);
        ctx.drawImage(qrCanvas, 400, qrBoxY + 75, 280, 280);
      } catch (err) {
        console.error('QR draw failed:', err);
      }
    }

    // Under QR Code
    ctx.font = '900 26px "Orbitron", sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`CODE CITOYEN: ${refCode}`, 540, qrBoxY + 395);

    ctx.font = '800 21px "Outfit", sans-serif';
    ctx.fillStyle = '#10b981';
    ctx.fillText(lang === 'fr' ? '✓ +100 🪙 offerts à l’inscription !' : '✓ +100 🪙 awarded on sign-up!', 540, qrBoxY + 430);

    ctx.font = '700 17px "Orbitron", sans-serif';
    ctx.fillStyle = '#fbbf24';
    ctx.fillText(lang === 'fr' ? '⚡ PLACES GENESIS TIER 1 LIMITÉES : REMOWORLD.COM' : '⚡ LIMITED GENESIS TIER 1 SLOTS : REMOWORLD.COM', 540, qrBoxY + 460);

    // 10. Bottom Footer
    ctx.font = '900 24px "Orbitron", sans-serif';
    ctx.fillStyle = '#fbbf24';
    ctx.fillText('REMOWORLD.COM', 540, 1780);
    ctx.font = '700 18px "Outfit", sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText(lang === 'fr' ? 'Le Réseau Social Mondial 4D · Explorez sans frontières' : 'The 4D Global Social Network · Explore without borders', 540, 1812);

    if (cv && cv.toBlob) {
      cv.toBlob((b) => {
        if (b) {
          window._cachedStoryBlob = b;
          try {
            window._cachedStoryFile = new File([b], `REMO_Story_${(u && u.passportNum) || '0001'}.png`, { type: 'image/png' });
          } catch (e) {
            window._cachedStoryFile = null;
          }
        }
      }, 'image/png');
    }
  } catch (err) {
    console.error('drawStoryVerticalCanvas error:', err);
  }
}

function exportPassportStory() {
  window._customStoryShareMeta = null;
  const lang = REMO_I18N.getLang();
  const u = REMO_STORE.getCurrentUser() || REMO_STORE.ensureGuestOrCitizen('REMO Pioneer', '', 'montreal');
  const modal = document.getElementById('storyExportModal');
  if (modal) {
    modal.classList.add('open');
  }
  const cv = document.getElementById('citizenStoryCanvasPreview');
  if (cv) {
    try {
      drawStoryVerticalCanvas(cv, u, lang);
    } catch (e) {
      console.error('drawStoryVerticalCanvas invocation error:', e);
    }
  }
  if (!modal && cv) {
    downloadStoryCanvasPNG();
  }
}

async function shareStoryCanvasNative() {
  const cv = document.getElementById('citizenStoryCanvasPreview');
  const u = REMO_STORE.getCurrentUser() || { name: 'Pioneer', passportNum: '0001', referralCode: 'REMO-0001' };
  const lang = REMO_I18N.getLang();
  const custom = window._customStoryShareMeta || null;
  const inviteUrl = (custom && custom.url) ? custom.url : getCitizenInviteUrl(u);
  const shareTitle = (custom && custom.title) ? custom.title : 'REMO World · Official Citizen Passport';
  const shareText = (custom && custom.text)
    ? custom.text
    : (lang === 'fr'
      ? `🌐 Rejoins ma ville sur REMO avec mon code ${u.referralCode || ('REMO-' + u.passportNum)} et gagne +100 🪙 de bienvenue !`
      : `🌐 Join my city on REMO with code ${u.referralCode || ('REMO-' + u.passportNum)} to earn +100 🪙 welcome coins!`);

  // Always copy link with fallback and trigger HD PNG download
  copyTextToClipboard(inviteUrl);
  downloadStoryCanvasPNG();

  // Try native Web Share API
  if (navigator.share) {
    const file = window._cachedStoryFile;
    if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: shareTitle,
          text: `${shareText} ${inviteUrl}`
        });
        remoToast(lang === 'fr' ? '🎉 Story partagée avec succès !' : '🎉 Story shared successfully!', 'fanfare');
        return;
      } catch (err) {
        if (err && err.name === 'AbortError') return;
      }
    }

    try {
      await navigator.share({
        title: shareTitle,
        text: shareText,
        url: inviteUrl
      });
      remoToast(lang === 'fr' ? '🎉 Lien de partage envoyé !' : '🎉 Share link sent!', 'fanfare');
      return;
    } catch (err) {
      if (err && err.name === 'AbortError') return;
    }
  }

  remoToast(
    lang === 'fr'
      ? '📥 Image HD enregistrée et lien copié ! Prêt pour votre Story Instagram / TikTok !'
      : '📥 HD image saved & link copied! Ready for your Instagram / TikTok Story!',
    'fanfare'
  );
}

function downloadStoryCanvasPNG() {
  const cv = document.getElementById('citizenStoryCanvasPreview');
  const u = REMO_STORE.getCurrentUser() || { passportNum: '0001', referralCode: 'REMO-0001' };
  if (!cv) return;
  const custom = window._customStoryShareMeta || null;
  const fname = (custom && custom.filename)
    ? custom.filename
    : `REMO_Story_9x16_${u.referralCode || u.passportNum || '0001'}.png`;
  downloadCanvasAsPNG(cv, fname);
  remoToast(REMO_I18N.getLang() === 'fr' ? '📥 Story 9:16 HD téléchargée !' : '📥 9:16 HD Story downloaded!', 'coin');
}

function closeStoryExportModal() {
  window._customStoryShareMeta = null;
  const m = document.getElementById('storyExportModal');
  if (m) m.classList.remove('open');
}

/* ══════════════════════════════════════════════════════════════════════
   🎫 4B. 4D CYBER BOARDING PASS (9:16 Story for TikTok / Insta / WhatsApp)
   ══════════════════════════════════════════════════════════════════════ */
const CITY_AIRPORT_CODES = {
  montreal: 'YUL',
  chisinau: 'KIV',
  paris: 'CDG',
  bucharest: 'OTP',
  newyork: 'JFK',
  tokyo: 'HND',
  dubai: 'DXB',
  london: 'LHR',
  miami: 'MIA',
  barcelona: 'BCN',
  monaco: 'MCM',
  seoul: 'ICN'
};

function getCityAirportCode(cityId) {
  if (!cityId) return 'RMO';
  const id = String(cityId).toLowerCase();
  if (CITY_AIRPORT_CODES[id]) return CITY_AIRPORT_CODES[id];
  return id.replace(/[^a-z]/g, '').slice(0, 3).toUpperCase() || 'RMO';
}

function resolveCityFromQuery(rawQuery) {
  const cities = typeof getRemoCities === 'function' ? getRemoCities() : (window.REMO_DEFAULT_CITIES || []);
  if (!rawQuery || !String(rawQuery).trim()) {
    return cities[0] || { id: 'montreal', code: 'MTL', flag: '⚜️', name_en: 'Montréal', name_fr: 'Montréal', lat: 45.50, lng: -73.57 };
  }
  const q = String(rawQuery).trim();
  const qClean = q.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // 1. Direct match in active cities
  const found = cities.find((c) => {
    const id = (c.id || '').toLowerCase();
    const code = (c.code || '').toLowerCase();
    const ne = (c.name_en || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const nf = (c.name_fr || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return id === qClean || code === qClean || ne === qClean || nf === qClean ||
           ne.includes(qClean) || nf.includes(qClean) || qClean.includes(ne) || qClean.includes(nf);
  });
  if (found) return found;

  // 2. Known world cities coordinates & codes dictionary
  const KNOWN_TYPED_CITIES = {
    rome: { code: 'FCO', flag: '🏛️', lat: 41.9028, lng: 12.4964, country_en: 'Italy', country_fr: 'Italie' },
    roma: { code: 'FCO', flag: '🏛️', lat: 41.9028, lng: 12.4964, country_en: 'Italy', country_fr: 'Italie' },
    berlin: { code: 'BER', flag: '🐻', lat: 52.5200, lng: 13.4050, country_en: 'Germany', country_fr: 'Allemagne' },
    madrid: { code: 'MAD', flag: '👑', lat: 40.4168, lng: -3.7038, country_en: 'Spain', country_fr: 'Espagne' },
    toronto: { code: 'YYZ', flag: '🍁', lat: 43.6532, lng: -79.3832, country_en: 'Canada', country_fr: 'Canada' },
    vancouver: { code: 'YVR', flag: '🌲', lat: 49.2827, lng: -123.1207, country_en: 'Canada', country_fr: 'Canada' },
    balti: { code: 'BZY', flag: '🇲🇩', lat: 47.7617, lng: 27.9289, country_en: 'Moldova', country_fr: 'Moldavie' },
    orhei: { code: 'ORH', flag: '🇲🇩', lat: 47.3831, lng: 28.8236, country_en: 'Moldova', country_fr: 'Moldavie' },
    iasi: { code: 'IAS', flag: '🇷🇴', lat: 47.1585, lng: 27.6014, country_en: 'Romania', country_fr: 'Roumanie' },
    cluj: { code: 'CLJ', flag: '🇷🇴', lat: 46.7712, lng: 23.6236, country_en: 'Romania', country_fr: 'Roumanie' },
    amsterdam: { code: 'AMS', flag: '🚲', lat: 52.3676, lng: 4.9041, country_en: 'Netherlands', country_fr: 'Pays-Bas' },
    chicago: { code: 'ORD', flag: '🏙️', lat: 41.8781, lng: -87.6298, country_en: 'USA', country_fr: 'États-Unis' },
    losangeles: { code: 'LAX', flag: '🌴', lat: 34.0522, lng: -118.2437, country_en: 'USA', country_fr: 'États-Unis' },
    sydney: { code: 'SYD', flag: '🦘', lat: -33.8688, lng: 151.2093, country_en: 'Australia', country_fr: 'Australie' }
  };

  const lookupKey = qClean.replace(/[^a-z]/g, '');
  if (KNOWN_TYPED_CITIES[lookupKey]) {
    const k = KNOWN_TYPED_CITIES[lookupKey];
    return {
      id: lookupKey,
      code: k.code,
      flag: k.flag,
      name_en: q,
      name_fr: q,
      country_en: k.country_en,
      country_fr: k.country_fr,
      lat: k.lat,
      lng: k.lng
    };
  }

  // 3. Fallback for custom user-typed city
  const rawCode = q.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase() || 'RMO';
  let hash = 0;
  for (let i = 0; i < q.length; i++) hash = (hash * 31 + q.charCodeAt(i)) & 0xffffffff;
  const pseudoLat = 20 + Math.abs(hash % 45);
  const pseudoLng = -120 + Math.abs((hash >> 3) % 240);

  return {
    id: 'custom_' + (lookupKey || 'world'),
    code: rawCode,
    flag: '🌍',
    name_en: q,
    name_fr: q,
    country_en: 'World',
    country_fr: 'Monde',
    lat: pseudoLat,
    lng: pseudoLng
  };
}

function populateCityDatalist(datalistId) {
  const dl = document.getElementById(datalistId);
  if (!dl) return;
  const list = typeof getRemoCities === 'function' ? getRemoCities() : (window.REMO_DEFAULT_CITIES || []);
  const lang = REMO_I18N.getLang();
  dl.innerHTML = list.map((c) => {
    const name = getCityName(c, lang);
    return `<option value="${name}">${c.flag} ${name} (${c.code || getCityAirportCode(c.id)})</option>`;
  }).join('');
}

function drawBoardingPassCanvas(cv, fromQuery, toQuery, u, lang = 'fr') {
  if (!cv) return;
  cv.width = 1080;
  cv.height = 1920;
  const ctx = cv.getContext('2d');
  if (!ctx) return;

  if (typeof ctx.roundRect !== 'function') {
    ctx.roundRect = function (x, y, w, h, radii) {
      const r = Array.isArray(radii) ? radii[0] : (radii || 0);
      this.moveTo(x + r, y);
      this.lineTo(x + w - r, y);
      this.quadraticCurveTo(x + w, y, x + w, y + r);
      this.lineTo(x + w, y + h - r);
      this.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      this.lineTo(x + r, y + h);
      this.quadraticCurveTo(x, y + h, x, y + h - r);
      this.lineTo(x, y + r);
      this.quadraticCurveTo(x, y, x + r, y);
    };
  }

  try {
    const fromCity = resolveCityFromQuery(fromQuery || 'montreal');
    const toCity = resolveCityFromQuery(toQuery || 'chisinau');
    const userObj = u || REMO_STORE.getCurrentUser() || { name: 'Pioneer', passportNum: '0001', referralCode: 'REMO-0001', role: 'citizen' };
    const refCode = userObj.referralCode || `REMO-${userObj.passportNum || '0001'}`;
    const inviteUrl = typeof getCitizenInviteUrl === 'function' ? getCitizenInviteUrl(userObj) : `https://remoworld.com/?ref=${encodeURIComponent(refCode)}`;

    const fnHaversine = (typeof haversineKm === 'function')
      ? haversineKm
      : (window.haversineKm || ((lat1, lon1, lat2, lon2) => {
          const R = 6371;
          const dLat = ((lat2 - lat1) * Math.PI) / 180;
          const dLon = ((lon2 - lon1) * Math.PI) / 180;
          const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
          return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        }));

    const km = Math.round(fnHaversine(fromCity.lat, fromCity.lng, toCity.lat, toCity.lng)) || 7140;
    const fromCode = fromCity.code || getCityAirportCode(fromCity.id);
    const toCode = toCity.code || getCityAirportCode(toCity.id);
    const flightNum = `RM-${km > 9999 ? String(km).slice(0, 4) : km}`;

    // 1. Cyber Aviation Background
    const bg = ctx.createLinearGradient(0, 0, 1080, 1920);
    bg.addColorStop(0, '#030712');
    bg.addColorStop(0.35, '#07132e');
    bg.addColorStop(0.7, '#0b162f');
    bg.addColorStop(1, '#020617');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 1080, 1920);

    // Glowing Holographic Radial Gradients
    const r1 = ctx.createRadialGradient(200, 300, 10, 200, 300, 600);
    r1.addColorStop(0, 'rgba(6,182,212,0.18)');
    r1.addColorStop(1, 'rgba(6,182,212,0)');
    ctx.fillStyle = r1;
    ctx.fillRect(0, 0, 1080, 1920);

    const r2 = ctx.createRadialGradient(880, 1100, 10, 880, 1100, 600);
    r2.addColorStop(0, 'rgba(251,191,36,0.14)');
    r2.addColorStop(1, 'rgba(251,191,36,0)');
    ctx.fillStyle = r2;
    ctx.fillRect(0, 0, 1080, 1920);

    // Subtle radar flight arcs
    ctx.strokeStyle = 'rgba(56,189,248,0.08)';
    ctx.lineWidth = 1.5;
    for (let i = 1; i <= 4; i++) {
      ctx.beginPath();
      ctx.arc(540, 960, i * 220, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 2. Main Ticket Container with Rounded Corners
    const tX = 70;
    const tY = 90;
    const tW = 940;
    const tH = 1740;
    const tR = 36;

    ctx.save();
    ctx.shadowColor = 'rgba(6, 182, 212, 0.45)';
    ctx.shadowBlur = 35;
    ctx.fillStyle = 'rgba(11, 20, 42, 0.90)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.roundRect(tX, tY, tW, tH, tR);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // 3. Airline Header Ribbon
    const ribbonGrad = ctx.createLinearGradient(tX, tY, tX + tW, tY);
    ribbonGrad.addColorStop(0, '#0369a1');
    ribbonGrad.addColorStop(0.5, '#0284c7');
    ribbonGrad.addColorStop(1, '#06b6d4');
    ctx.fillStyle = ribbonGrad;
    ctx.beginPath();
    ctx.roundRect(tX, tY, tW, 115, [tR, tR, 0, 0]);
    ctx.fill();

    ctx.textAlign = 'left';
    ctx.font = '900 32px "Orbitron", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('REMO AIRWAYS 🌐 4D NEXUS', tX + 40, tY + 68);

    ctx.textAlign = 'right';
    ctx.font = '800 20px "Orbitron", sans-serif';
    ctx.fillStyle = '#fde047';
    ctx.fillText('BOARDING PASS', tX + tW - 40, tY + 68);

    // 4. Subheader Class Strip
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.fillRect(tX, tY + 115, tW, 60);
    ctx.textAlign = 'left';
    ctx.font = '800 18px "Orbitron", sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(lang === 'fr' ? 'FIRST CLASS · CITOYEN SOUVERAIN 4D' : 'FIRST CLASS · SOVEREIGN CITIZEN 4D', tX + 40, tY + 152);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#94a3b8';
    ctx.font = '700 18px monospace';
    ctx.fillText(`ETKT: 4D-${refCode}`, tX + tW - 40, tY + 152);

    // 5. Giant City Route (From -> To)
    const routeY = tY + 280;

    // Departure Airport Code
    ctx.textAlign = 'left';
    ctx.font = '900 84px "Orbitron", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(fromCode, tX + 50, routeY);

    ctx.font = '800 24px "Outfit", sans-serif';
    ctx.fillStyle = '#38bdf8';
    const fromName = getCityName(fromCity, lang) || fromCity.name_fr || fromCity.name_en;
    ctx.fillText(`${fromCity.flag || '🏙️'} ${fromName.toUpperCase()}`, tX + 50, routeY + 40);

    // Arrival Airport Code
    ctx.textAlign = 'right';
    ctx.font = '900 84px "Orbitron", sans-serif';
    ctx.fillStyle = '#fde047';
    ctx.fillText(toCode, tX + tW - 50, routeY);

    ctx.font = '800 24px "Outfit", sans-serif';
    ctx.fillStyle = '#fbbf24';
    const toName = getCityName(toCity, lang) || toCity.name_fr || toCity.name_en;
    ctx.fillText(`${toCity.flag || '🏙️'} ${toName.toUpperCase()}`, tX + tW - 50, routeY + 40);

    // Flight Arc & Airplane
    ctx.textAlign = 'center';
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(251,191,36,0.6)';
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 8]);
    ctx.moveTo(tX + 260, routeY - 20);
    ctx.quadraticCurveTo(540, routeY - 80, tX + tW - 260, routeY - 20);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.font = '40px sans-serif';
    ctx.fillText('✈️', 540, routeY - 60);

    // Geodesic Distance Pill
    ctx.fillStyle = 'rgba(6,182,212,0.18)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(400, routeY + 10, 280, 42, 21);
    ctx.fill();
    ctx.stroke();

    ctx.font = '900 20px "Orbitron", sans-serif';
    ctx.fillStyle = '#e0f2fe';
    ctx.fillText(`${km.toLocaleString()} KM · 4D TELEPORT`, 540, routeY + 38);

    // 6. Flight Info 4-Box Grid
    const infoY = tY + 410;
    const gridCols = [
      { label: lang === 'fr' ? 'VOL / FLIGHT' : 'FLIGHT', val: flightNum },
      { label: lang === 'fr' ? 'PORTE / GATE' : 'GATE', val: '4D-01' },
      { label: lang === 'fr' ? 'SIÈGE / SEAT' : 'SEAT', val: '01A' },
      { label: lang === 'fr' ? 'EMBARQ. / TIME' : 'TIME', val: 'INSTANT' }
    ];
    const boxW = (tW - 80 - 30) / 4;
    gridCols.forEach((col, idx) => {
      const bx = tX + 40 + idx * (boxW + 10);
      ctx.fillStyle = 'rgba(255,255,255,0.03)';
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(bx, infoY, boxW, 85, 12);
      ctx.fill();
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.font = '700 15px "Outfit", sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(col.label, bx + boxW / 2, infoY + 28);

      ctx.font = '900 24px "Orbitron", sans-serif';
      ctx.fillStyle = idx === 0 ? '#38bdf8' : idx === 3 ? '#10b981' : '#ffffff';
      ctx.fillText(col.val, bx + boxW / 2, infoY + 65);
    });

    // 7. Passenger Identity Strip
    const passY = tY + 535;
    ctx.fillStyle = 'rgba(15,23,42,0.95)';
    ctx.strokeStyle = 'rgba(251,191,36,0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(tX + 40, passY, tW - 80, 105, 16);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.font = '800 17px "Outfit", sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(lang === 'fr' ? 'PASSAGER OFFICIEL / PASSENGER' : 'OFFICIAL PASSENGER', tX + 65, passY + 36);

    ctx.font = '900 32px "Orbitron", sans-serif';
    ctx.fillStyle = '#fde047';
    ctx.fillText(`@${userObj.name}`, tX + 65, passY + 78);

    ctx.textAlign = 'right';
    ctx.font = '800 17px "Outfit", sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(lang === 'fr' ? 'PASSEPORT №' : 'PASSPORT №', tX + tW - 65, passY + 36);

    ctx.font = '900 28px "Orbitron", sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`#${userObj.passportNum || '0001'}`, tX + tW - 65, passY + 78);

    // 8. Destination City Landmark Visual (Center Artwork)
    const artY = tY + 840;
    ctx.textAlign = 'center';

    ctx.beginPath();
    ctx.arc(540, artY, 150, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(6,182,212,0.08)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(56,189,248,0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();

    if (toCity.id && typeof drawCityLandmark === 'function' && !toCity.id.startsWith('custom_')) {
      try {
        drawCityLandmark(ctx, toCity.id, '#38bdf8', 540, artY, 190);
      } catch (err) {
        console.warn('Landmark draw error:', err);
      }
    } else {
      // Custom skyline vector badge for custom typed cities
      ctx.font = '90px sans-serif';
      ctx.fillText(toCity.flag || '🌍', 540, artY + 15);
      ctx.font = '900 34px "Orbitron", sans-serif';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(toCode, 540, artY + 70);
    }

    ctx.font = '900 22px "Orbitron", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${toCity.flag || '🏙️'} ${toName.toUpperCase()} · DESTINATION 4D`, 540, artY + 175);

    // 9. Classic Ticket Perforation (Tear Line with Notches)
    const tearY = tY + 1090;
    ctx.setLineDash([12, 10]);
    ctx.strokeStyle = 'rgba(255,255,255,0.28)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(tX + 45, tearY);
    ctx.lineTo(tX + tW - 45, tearY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#030712';
    ctx.beginPath();
    ctx.arc(tX, tearY, 28, -Math.PI / 2, Math.PI / 2);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(tX + tW, tearY, 28, Math.PI / 2, -Math.PI / 2);
    ctx.fill();
    ctx.stroke();

    // 10. QR Code & Airline Barcode Stub
    const stubY = tearY + 45;

    if (typeof RemoQREngine !== 'undefined' && RemoQREngine.toCanvas) {
      try {
        const qrCanvas = RemoQREngine.toCanvas(inviteUrl, 260);
        ctx.drawImage(qrCanvas, 140, stubY, 260, 260);
      } catch (e) {
        console.error('Boarding pass QR error:', e);
      }
    }

    ctx.textAlign = 'left';
    ctx.font = '900 24px "Orbitron", sans-serif';
    ctx.fillStyle = '#fde047';
    ctx.fillText(lang === 'fr' ? '🎁 SCANNEZ LE BILLET' : '🎁 SCAN BOARDING PASS', 440, stubY + 45);

    ctx.font = '800 20px "Outfit", sans-serif';
    ctx.fillStyle = '#10b981';
    ctx.fillText(lang === 'fr' ? '✓ +100 🪙 offerts à l’arrivée !' : '✓ +100 🪙 welcome bonus!', 440, stubY + 85);

    ctx.font = '800 18px "Orbitron", sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`CODE: ${refCode}`, 440, stubY + 130);

    ctx.font = '700 16px "Outfit", sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(lang === 'fr' ? 'Téléportation instantanée en direct' : 'Instant live global teleportation', 440, stubY + 165);

    // Realistic Barcode
    const bcY = stubY + 285;
    const bcH = 65;
    ctx.fillStyle = '#ffffff';
    let curX = tX + 70;
    const barPattern = [3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 4, 1, 2, 3, 1, 4, 2, 2, 1, 3, 4, 1, 3, 2, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 4, 1, 2, 3, 1, 4];
    while (curX < tX + tW - 80) {
      for (let p = 0; p < barPattern.length && curX < tX + tW - 80; p++) {
        const w = barPattern[p];
        ctx.fillRect(curX, bcY, w, bcH);
        curX += w + 2 + (p % 3);
      }
    }

    // 11. Machine-Readable Zone (MRZ Strip)
    const mrzY = bcY + 95;
    ctx.font = '700 17px monospace';
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'center';
    const cleanUser = userObj.name.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 12);
    ctx.fillText(`P<REMO<${fromCode}<<<${toCode}<<<<${cleanUser}<<<<${km}KM<<<<2026<<<<`, 540, mrzY);
    ctx.fillText(`RM${flightNum}<<<<<<SEAT01A<<<<GATE4D-NEXUS<<<<CITIZEN_APPROVED<<<<`, 540, mrzY + 24);

    if (cv && cv.toBlob) {
      cv.toBlob((b) => {
        if (b) {
          window._cachedBoardingPassBlob = b;
          try {
            window._cachedBoardingPassFile = new File([b], `REMO_BoardingPass_${fromCode}_${toCode}_${userObj.passportNum || '0001'}.png`, { type: 'image/png' });
          } catch (e) {
            window._cachedBoardingPassFile = null;
          }
        }
      }, 'image/png');
    }
  } catch (err) {
    console.error('drawBoardingPassCanvas error:', err);
  }
}

function openBoardingPassModal(fromQuery, toQuery) {
  const modal = document.getElementById('boardingPassModal');
  if (!modal) return;

  const u = REMO_STORE.getCurrentUser() || REMO_STORE.ensureGuestOrCitizen('REMO Pioneer', '', 'montreal');
  const lang = REMO_I18N.getLang();

  populateCityDatalist('boardingPassCitiesList');

  const fInp = document.getElementById('boardingPassFromInput');
  const tInp = document.getElementById('boardingPassToInput');

  const c1 = resolveCityFromQuery(fromQuery || (u && u.homeCity) || 'montreal');
  const c2 = resolveCityFromQuery(toQuery || (c1.id === 'chisinau' ? 'montreal' : 'chisinau'));

  if (fInp) fInp.value = getCityName(c1, lang) || c1.name_fr || c1.name_en;
  if (tInp) tInp.value = getCityName(c2, lang) || c2.name_fr || c2.name_en;

  modal.classList.add('open');
  if (typeof REMO_I18N !== 'undefined' && REMO_I18N.applyDOM) {
    REMO_I18N.applyDOM(modal);
  }

  const cv = document.getElementById('boardingPassCanvasPreview');
  if (cv) {
    drawBoardingPassCanvas(cv, fInp ? fInp.value : 'Montréal', tInp ? tInp.value : 'Chișinău', u, lang);
  }
}

function closeBoardingPassModal() {
  const m = document.getElementById('boardingPassModal');
  if (m) m.classList.remove('open');
}

function onBoardingPassRouteChanged() {
  const fInp = document.getElementById('boardingPassFromInput');
  const tInp = document.getElementById('boardingPassToInput');
  const cv = document.getElementById('boardingPassCanvasPreview');
  const u = REMO_STORE.getCurrentUser() || { name: 'Pioneer', passportNum: '0001', referralCode: 'REMO-0001' };
  const lang = REMO_I18N.getLang();

  const fVal = fInp ? fInp.value : 'Montréal';
  const tVal = tInp ? tInp.value : 'Chișinău';

  if (cv) {
    drawBoardingPassCanvas(cv, fVal, tVal, u, lang);
  }
}

function swapBoardingPassRoute() {
  const fInp = document.getElementById('boardingPassFromInput');
  const tInp = document.getElementById('boardingPassToInput');
  if (!fInp || !tInp) return;
  const tmp = fInp.value;
  fInp.value = tInp.value;
  tInp.value = tmp;
  onBoardingPassRouteChanged();
}

function setBoardingPassRoutePreset(fromId, toId) {
  const fInp = document.getElementById('boardingPassFromInput');
  const tInp = document.getElementById('boardingPassToInput');
  const lang = REMO_I18N.getLang();
  const c1 = resolveCityFromQuery(fromId);
  const c2 = resolveCityFromQuery(toId);
  if (fInp && c1) fInp.value = getCityName(c1, lang) || c1.name_fr || c1.name_en;
  if (tInp && c2) tInp.value = getCityName(c2, lang) || c2.name_fr || c2.name_en;
  onBoardingPassRouteChanged();
}

async function shareBoardingPassNative() {
  const cv = document.getElementById('boardingPassCanvasPreview');
  const u = REMO_STORE.getCurrentUser() || { name: 'Pioneer', passportNum: '0001', referralCode: 'REMO-0001' };
  const lang = REMO_I18N.getLang();
  const inviteUrl = typeof getCitizenInviteUrl === 'function' ? getCitizenInviteUrl(u) : `https://remoworld.com/?ref=${encodeURIComponent(u.referralCode || 'REMO-0001')}`;

  const shareTitle = lang === 'fr' ? 'REMO Airways · Billet de Vol Holographique 4D' : 'REMO Airways · 4D Holographic Boarding Pass';
  const shareText = lang === 'fr'
    ? `🎫 Voici mon Billet de Téléportation 4D sur REMO ! Rejoins le vol avec mon code ${u.referralCode || ('REMO-' + u.passportNum)} et gagne +100 🪙 de bienvenue !`
    : `🎫 Here is my 4D Holographic Boarding Pass on REMO! Join the flight with code ${u.referralCode || ('REMO-' + u.passportNum)} to earn +100 🪙 welcome bonus!`;

  if (typeof copyTextToClipboard === 'function') copyTextToClipboard(inviteUrl);
  downloadBoardingPassPNG();

  if (navigator.share) {
    const file = window._cachedBoardingPassFile;
    if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: shareTitle,
          text: `${shareText} ${inviteUrl}`
        });
        remoToast(lang === 'fr' ? '🎉 Billet partagé avec succès !' : '🎉 Boarding Pass shared successfully!', 'fanfare');
        return;
      } catch (err) {
        if (err && err.name === 'AbortError') return;
      }
    }

    try {
      await navigator.share({
        title: shareTitle,
        text: shareText,
        url: inviteUrl
      });
      remoToast(lang === 'fr' ? '🎉 Lien du billet envoyé !' : '🎉 Boarding Pass link sent!', 'fanfare');
      return;
    } catch (err) {
      if (err && err.name === 'AbortError') return;
    }
  }

  remoToast(
    lang === 'fr'
      ? '📥 Billet HD enregistré et lien copié ! Prêt pour votre Story Instagram / TikTok !'
      : '📥 HD Boarding Pass saved & link copied! Ready for your Instagram / TikTok Story!',
    'fanfare'
  );
}

function downloadBoardingPassPNG() {
  const cv = document.getElementById('boardingPassCanvasPreview');
  const fInp = document.getElementById('boardingPassFromInput');
  const tInp = document.getElementById('boardingPassToInput');
  const u = REMO_STORE.getCurrentUser() || { passportNum: '0001' };
  if (!cv) return;

  const c1 = resolveCityFromQuery(fInp ? fInp.value : 'montreal');
  const c2 = resolveCityFromQuery(tInp ? tInp.value : 'chisinau');
  const fCode = c1.code || getCityAirportCode(c1.id);
  const tCode = c2.code || getCityAirportCode(c2.id);

  downloadCanvasAsPNG(cv, `REMO_BoardingPass_${fCode}_${tCode}_${u.passportNum || '0001'}.png`);
  remoToast(REMO_I18N.getLang() === 'fr' ? '📥 Billet 4D HD téléchargé !' : '📥 4D HD Boarding Pass downloaded!', 'coin');
}

/* ══════════════════════════════════════════════════════════════════════
   ⛲ 4C. 4D GLOBAL WISHING WELL (Le Puits aux Souhaits 4D)
   ══════════════════════════════════════════════════════════════════════ */
let _wishingWellAnimId = null;
let _wishingWellRipples = [];

function formatRelativeTime(ts, lang = 'fr') {
  const diffSec = Math.max(1, Math.floor((Date.now() - (ts || Date.now())) / 1000));
  if (diffSec < 60) return lang === 'fr' ? 'À l’instant' : 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return lang === 'fr' ? `il y a ${diffMin} min` : `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return lang === 'fr' ? `il y a ${diffHr} h` : `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  return lang === 'fr' ? `il y a ${diffDays} j` : `${diffDays}d ago`;
}

function openWishingWellModal(prefillCityQuery) {
  const modal = document.getElementById('wishingWellModal');
  if (!modal) return;

  const u = REMO_STORE.getCurrentUser() || REMO_STORE.ensureGuestOrCitizen('REMO Pioneer', '', 'montreal');
  const lang = REMO_I18N.getLang();

  populateCityDatalist('wishingWellCitiesList');

  const cInp = document.getElementById('wishingWellCityInput');
  const cObj = resolveCityFromQuery(prefillCityQuery || (u && u.homeCity) || 'montreal');
  if (cInp) cInp.value = getCityName(cObj, lang) || cObj.name_fr || cObj.name_en;

  modal.classList.add('open');
  if (typeof REMO_I18N !== 'undefined' && REMO_I18N.applyDOM) {
    REMO_I18N.applyDOM(modal);
  }

  initWishingWellCanvas();
  renderWishingWellStream();
}

function closeWishingWellModal() {
  const modal = document.getElementById('wishingWellModal');
  if (modal) modal.classList.remove('open');
  if (_wishingWellAnimId) {
    cancelAnimationFrame(_wishingWellAnimId);
    _wishingWellAnimId = null;
  }
}

function initWishingWellCanvas() {
  const cv = document.getElementById('wishingPoolCanvas');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  if (!ctx) return;

  _wishingWellRipples = [
    { x: cv.width * 0.5, y: cv.height * 0.55, r: 20, maxR: 140, alpha: 0.6, speed: 0.8 },
    { x: cv.width * 0.5, y: cv.height * 0.55, r: 60, maxR: 140, alpha: 0.4, speed: 0.8 }
  ];

  if (_wishingWellAnimId) cancelAnimationFrame(_wishingWellAnimId);

  function animatePool() {
    ctx.clearRect(0, 0, cv.width, cv.height);

    // Deep luminous water gradient
    const grad = ctx.createRadialGradient(cv.width * 0.5, cv.height * 0.55, 10, cv.width * 0.5, cv.height * 0.55, cv.width * 0.55);
    grad.addColorStop(0, '#102a5c');
    grad.addColorStop(0.5, '#071630');
    grad.addColorStop(1, '#020713');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, cv.width, cv.height);

    // Faint reflective caustics
    const t = Date.now() * 0.002;
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(cv.width * 0.5 + Math.sin(t + i) * 15, cv.height * 0.55 + Math.cos(t + i) * 8, 40 + i * 25, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Expanding Ripples
    for (let i = _wishingWellRipples.length - 1; i >= 0; i--) {
      const rip = _wishingWellRipples[i];
      rip.r += rip.speed;
      rip.alpha -= 0.005;

      if (rip.alpha <= 0 || rip.r >= rip.maxR) {
        _wishingWellRipples.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.beginPath();
      ctx.arc(rip.x, rip.y, rip.r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(251, 191, 36, ${rip.alpha * 0.85})`;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(rip.x, rip.y, Math.max(0, rip.r - 8), 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(56, 189, 248, ${rip.alpha * 0.5})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.restore();
    }

    // Keep gentle ambient ripples going
    if (_wishingWellRipples.length < 2 && Math.random() < 0.03) {
      _wishingWellRipples.push({
        x: cv.width * 0.5 + (Math.random() - 0.5) * 40,
        y: cv.height * 0.55 + (Math.random() - 0.5) * 20,
        r: 10,
        maxR: 120,
        alpha: 0.5,
        speed: 0.7
      });
    }

    const modal = document.getElementById('wishingWellModal');
    if (modal && modal.classList.contains('open')) {
      _wishingWellAnimId = requestAnimationFrame(animatePool);
    }
  }

  animatePool();
}

function tossWishingCoinWithAnimation() {
  const coinEl = document.getElementById('wishingCenterCoin');
  const cv = document.getElementById('wishingPoolCanvas');
  const txtInput = document.getElementById('wishingWellTextInput');

  if (coinEl) {
    coinEl.style.transform = 'scale(0.4) translateY(60px)';
    coinEl.style.opacity = '0.3';
    setTimeout(() => {
      coinEl.style.transform = '';
      coinEl.style.opacity = '';
    }, 450);
  }

  if (cv) {
    _wishingWellRipples.push(
      { x: cv.width * 0.5, y: cv.height * 0.55, r: 8, maxR: 160, alpha: 0.95, speed: 2.2 },
      { x: cv.width * 0.5, y: cv.height * 0.55, r: 2, maxR: 120, alpha: 0.8, speed: 1.6 }
    );
  }

  if (REMO_STORE && REMO_STORE.audio) {
    REMO_STORE.audio.play('splash');
    setTimeout(() => {
      if (REMO_STORE && REMO_STORE.audio) REMO_STORE.audio.play('coin');
    }, 120);
  }

  if (txtInput) {
    txtInput.focus();
  }
}

function submitWishingWellCoin() {
  const txtInput = document.getElementById('wishingWellTextInput');
  const cityInput = document.getElementById('wishingWellCityInput');
  const anonSel = document.getElementById('wishingWellAnonSelect');
  const lang = REMO_I18N.getLang();

  const text = (txtInput ? txtInput.value : '').trim();
  if (!text) {
    remoToast(lang === 'fr' ? '✍️ Veuillez écrire un vœu pour une ville !' : '✍️ Please write a heartfelt wish for a city!', 'alert');
    if (txtInput) txtInput.focus();
    return;
  }

  const cityQuery = (cityInput ? cityInput.value : '').trim() || 'Montréal';
  const isAnonymous = anonSel ? anonSel.value === '1' : false;

  const res = REMO_STORE.tossCoinInWishingWell(cityQuery, text, isAnonymous);
  if (!res.success) {
    if (res.reason === 'no_coins') {
      remoToast(lang === 'fr' ? '🪙 Vous n’avez pas assez de pièces REMO (1 🪙 requis).' : '🪙 Not enough REMO Coins (1 🪙 required).', 'alert');
    }
    return;
  }

  tossWishingCoinWithAnimation();

  if (txtInput) txtInput.value = '';
  renderWishingWellStream();

  // Update header coins counter
  const u = REMO_STORE.getCurrentUser();
  const hdrCoins = document.getElementById('hdrCoinsVal');
  if (hdrCoins && u) {
    hdrCoins.textContent = u.coins.toLocaleString();
  }

  remoToast(
    lang === 'fr'
      ? `✨ Vœu jeté dans la fontaine ! +5 points pour ${res.cityName || cityQuery} !`
      : `✨ Wish tossed into the well! +5 City Points for ${res.cityName || cityQuery}!`,
    'fanfare'
  );
}

function renderWishingWellStream() {
  const listEl = document.getElementById('wishingWellStreamList');
  const countEl = document.getElementById('wishingWellTotalCount');
  if (!listEl) return;

  const wishes = (REMO_STORE.state && REMO_STORE.state.wishes) || [];
  const lang = REMO_I18N.getLang();
  const u = REMO_STORE.getCurrentUser();

  if (countEl) {
    countEl.textContent = `${wishes.length} ${lang === 'fr' ? 'vœux mondiaux' : 'global wishes'}`;
  }

  if (wishes.length === 0) {
    listEl.innerHTML = `<div style="text-align:center;padding:20px;color:var(--muted);font-size:0.8rem;">${lang === 'fr' ? 'Soyez le premier à jeter une pièce et formuler un vœu !' : 'Be the first to toss a coin and make a wish!'}</div>`;
    return;
  }

  listEl.innerHTML = wishes.map((w) => {
    const cityFlag = w.cityFlag || '🌍';
    const cityName = w.cityName || (w.cityId && typeof getCityById === 'function' ? getCityName(getCityById(w.cityId), lang) : 'World');
    const isBlessedByMe = Boolean(u && u.uid && Array.isArray(w.blessedUids) && w.blessedUids.includes(u.uid));
    const timeAgo = formatRelativeTime(w.timestamp || Date.now(), lang);

    return `
      <div class="wish-item-card">
        <div class="wish-item-top">
          <div class="wish-author-badge">
            <span>${w.isAnonymous ? '🎭' : '✨'}</span>
            <span style="color:#ffffff;">${w.isAnonymous ? (lang === 'fr' ? 'Citoyen Anonyme' : 'Anonymous Citizen') : (typeof escapeHtmlStr === 'function' ? escapeHtmlStr(w.authorName) : w.authorName)}</span>
            <span class="pbadge" style="font-size:0.68rem;padding:2px 7px;background:rgba(255,255,255,0.06);border:1px solid var(--border);">${cityFlag} ${typeof escapeHtmlStr === 'function' ? escapeHtmlStr(cityName) : cityName}</span>
          </div>
          <div style="font-size:0.72rem;color:var(--muted);">${timeAgo}</div>
        </div>
        <div class="wish-item-text">"${typeof escapeHtmlStr === 'function' ? escapeHtmlStr(w.text) : w.text}"</div>
        <div style="display:flex;justify-content:flex-end;align-items:center;margin-top:2px;">
          <button type="button" class="bless-wish-btn ${isBlessedByMe ? 'blessed' : ''}" onclick="blessWishingWellItem('${w.id}')" title="${lang === 'fr' ? 'Bénir ce vœu (+1 🪙 Karma)' : 'Bless this wish (+1 🪙 Karma)'}">
            ${isBlessedByMe ? (lang === 'fr' ? '✓ Béni' : '✓ Blessed') : (lang === 'fr' ? '✨ Bénir' : '✨ Bless')} (${w.blessings || 1})
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function blessWishingWellItem(wishId) {
  const res = REMO_STORE.blessWish(wishId);
  const lang = REMO_I18N.getLang();

  if (!res.success) {
    if (res.reason === 'already_blessed') {
      remoToast(lang === 'fr' ? '✨ Vous avez déjà béni ce vœu !' : '✨ You already blessed this wish!', 'info');
    }
    return;
  }

  if (REMO_STORE && REMO_STORE.audio) REMO_STORE.audio.play('coin');

  const u = REMO_STORE.getCurrentUser();
  const hdrCoins = document.getElementById('hdrCoinsVal');
  if (hdrCoins && u) {
    hdrCoins.textContent = u.coins.toLocaleString();
  }

  renderWishingWellStream();
  remoToast(lang === 'fr' ? '✨ Bénédiction envoyée ! +1 🪙 Karma gagné !' : '✨ Blessing sent! +1 🪙 Karma earned!', 'coin');
}

function canCurrentUserDeleteAuction(a) {
  if (!a) return false;
  const isAdm = REMO_STORE.isAdminUnlocked() || REMO_STORE.isCurrentUserAdmin();
  if (isAdm) return true;
  const u = REMO_STORE.getCurrentUser();
  if (!u) return false;
  if (a.sellerUid && u.uid === a.sellerUid) return true;
  if (a.sellerName && u.name && a.sellerName.trim().toLowerCase() === u.name.trim().toLowerCase()) return true;
  if (a.cardSpec && isCurrentUserOwnerOfCard(a.cardSpec)) return true;
  return false;
}

/* ── 5. LIVE AUCTION HOUSE & DAILY LUCKY WHEEL ── */
function renderAuctionsView() {
  const box = document.getElementById('auctionsListGrid');
  if (!box) return;
  const lang = REMO_I18N.getLang();
  const deletedSet = REMO_STORE.deletedAuctionIds || new Set();
  const list = (REMO_STORE.state.auctions || []).filter((a) => a && a.id && a.cardSpec && !deletedSet.has(a.id));

  if (list.length === 0) {
    box.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 48px 20px; color: var(--muted); background: rgba(255,255,255,0.02); border-radius: 16px; border: 1px dashed var(--border);">
        <div style="font-size: 2.4rem; margin-bottom: 8px;">🔨</div>
        <div>${lang === 'fr' ? 'Aucune enchère en cours pour le moment.' : 'No active card auctions currently.'}</div>
      </div>
    `;
    return;
  }

  box.innerHTML = list.map((a, idx) => {
    const city = getCityById(a.cardSpec.cityId);
    const canDelete = canCurrentUserDeleteAuction(a);
    return `
      <div class="glass-box" style="display:flex;flex-direction:column;align-items:center;gap:10px;position:relative;">
        ${canDelete ? `<button type="button" class="adm-pbtn danger" style="position:absolute;top:8px;right:8px;z-index:5;" onclick="adminDeleteAuction('${a.id}')" title="${lang === 'fr' ? 'Supprimer des enchères' : 'Remove from Auction'}">🗑️</button>` : ''}
        <canvas id="aucCv_${idx}" style="width:100%;max-width:210px;height:auto;border-radius:14px;cursor:pointer;" onclick="inspectAuctionCard('${a.id}')"></canvas>
        <div style="font-weight:900;font-size:0.92rem;">${city.flag} ${getCityName(city, lang)} #${a.cardSpec.serial}</div>
        <div style="font-size:0.78rem;color:var(--muted);">${lang === 'fr' ? 'Vendeur' : 'Seller'}: ${typeof escapeHtmlStr === 'function' ? escapeHtmlStr(a.sellerName) : a.sellerName}</div>
        <div style="font-size:0.9rem;color:#fbbf24;font-weight:900;">${t('auction_min_bid')} 🪙 ${a.currentBid} (${typeof escapeHtmlStr === 'function' ? escapeHtmlStr(a.highestBidder) : a.highestBidder})</div>
        <button class="btn-cyber btn-gold" style="width:100%;justify-content:center;" onclick="placeAuctionBid('${a.id}')">
          🔨 ${t('auction_bid_btn')} (+50 🪙)
        </button>
        ${canDelete ? `
        <button type="button" class="btn-ghost" style="width:100%;justify-content:center;border-color:rgba(244,63,94,0.45);color:#fda4af;background:rgba(244,63,94,0.12);font-size:0.78rem;padding:7px 10px;" onclick="adminDeleteAuction('${a.id}')">
          🗑️ ${lang === 'fr' ? 'Retirer des Enchères' : 'Remove from Auction'}
        </button>
        ` : ''}
      </div>
    `;
  }).join('');

  list.forEach((a, idx) => {
    const cv = document.getElementById(`aucCv_${idx}`);
    if (cv) renderCityCardFront(cv, a.cardSpec, lang);
  });
}

function inspectAuctionCard(aucId) {
  const a = (REMO_STORE.state.auctions || []).find((x) => x && x.id === aucId);
  if (a && a.cardSpec) inspectCardModal(a.cardSpec);
}

function adminDeleteAuction(aucId) {
  const a = (REMO_STORE.state.auctions || []).find((x) => x && x.id === aucId);
  if (!a) return;
  if (!canCurrentUserDeleteAuction(a)) {
    remoToast(REMO_I18N.getLang() === 'fr' ? '🔒 Action non autorisée.' : '🔒 Unauthorized action.');
    return;
  }
  if (typeof REMO_STORE.deleteAuctionFromCloud === 'function') {
    REMO_STORE.deleteAuctionFromCloud(aucId);
  } else {
    REMO_STORE.state.auctions = (REMO_STORE.state.auctions || []).filter((x) => x.id !== aucId);
    REMO_STORE.save(true, 'auction_delete');
  }
  renderAuctionsView();
  remoToast(REMO_I18N.getLang() === 'fr' ? '🗑️ Carte retirée des enchères !' : '🗑️ Card removed from Auction House!');
}

function placeAuctionBid(aucId) {
  const lang = REMO_I18N.getLang();
  const u = REMO_STORE.getCurrentUser();
  if (!u) { openAuthModal(); return; }
  const a = REMO_STORE.state.auctions.find((x) => x.id === aucId);
  if (!a) return;
  const nextBid = a.currentBid + 50;
  if (!REMO_STORE.addCoins(u.uid, -50, 10)) {
    remoToast(lang === 'fr' ? 'Solde insuffisant en Pièces REMO !' : 'Not enough REMO Coins!');
    return;
  }
  a.currentBid = nextBid;
  a.highestBidder = u.name;
  REMO_STORE.save(true, 'auction_bid');
  renderAuctionsView();
  remoToast(lang === 'fr' ? `🔨 Enchère placée : ${nextBid} 🪙 !` : `🔨 Bid placed: ${nextBid} 🪙!`, 'coin');
}

/* ── 5B. AAA 4D CASINO HOLOGRAPHIC LUCKY WHEEL (8 SLICES + REAL PHYSICS + SOUND) ── */
const REMO_WHEEL_SLICES = [
  { id: 'c40', type: 'coins', val: 40, icon: '🪙', label_en: '+40 COINS', label_fr: '+40 PIÈCES', color: '#4f46e5' },
  { id: 'card_rare', type: 'card', rarity: 'Rare', icon: '🎴', label_en: 'RARE CARD', label_fr: 'CARTE RARE', color: '#ec4899' },
  { id: 'c100', type: 'coins', val: 100, icon: '💰', label_en: '+100 COINS', label_fr: '+100 PIÈCES', color: '#059669' },
  { id: 'card_mythic', type: 'card', rarity: 'Mythic 4D', icon: '🌌', label_en: 'MYTHIC 4D', label_fr: 'MYTHIC 4D', color: '#7c3aed' },
  { id: 'c75', type: 'coins', val: 75, icon: '⚡', label_en: '+75 COINS', label_fr: '+75 PIÈCES', color: '#0284c7' },
  { id: 'c250', type: 'coins', val: 250, icon: '🔥', label_en: '+250 COINS', label_fr: '+250 PIÈCES', color: '#d97706' },
  { id: 'card_epic', type: 'card', rarity: 'Epic', icon: '🃏', label_en: 'EPIC CARD', label_fr: 'CARTE ÉPIQUE', color: '#e11d48' },
  { id: 'c500', type: 'coins', val: 500, icon: '👑', label_en: '+500 JACKPOT', label_fr: '+500 JACKPOT', color: '#b45309' }
];

let wheelCurrentAngle = 0;
let wheelSpinning = false;
let wheelBulbPhase = 0;

function drawLuckyWheelCanvas(angleRad = wheelCurrentAngle) {
  const cv = document.getElementById('remoWheelCanvas');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const lang = REMO_I18N.getLang();
  const W = cv.width, H = cv.height;
  const cx = W / 2, cy = H / 2;
  const outerR = W * 0.47;
  const wheelR = W * 0.425;
  const N = REMO_WHEEL_SLICES.length;
  const sliceArc = (Math.PI * 2) / N;

  ctx.clearRect(0, 0, W, H);

  // 1. Metallic Gold Casino Outer Bezel
  const bezelGrad = ctx.createLinearGradient(0, 0, W, H);
  bezelGrad.addColorStop(0, '#fde047');
  bezelGrad.addColorStop(0.5, '#d97706');
  bezelGrad.addColorStop(1, '#fbbf24');
  ctx.beginPath();
  ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
  ctx.fillStyle = bezelGrad;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(cx, cy, wheelR + 6, 0, Math.PI * 2);
  ctx.fillStyle = '#070b19';
  ctx.fill();

  // 2. 24 Glowing Casino Rim Bulbs
  for (let b = 0; b < 24; b++) {
    const ba = (b / 24) * Math.PI * 2;
    const bx = cx + Math.cos(ba) * ((outerR + wheelR + 6) / 2);
    const by = cy + Math.sin(ba) * ((outerR + wheelR + 6) / 2);
    const lit = (b + wheelBulbPhase) % 2 === 0;
    ctx.beginPath();
    ctx.arc(bx, by, lit ? 5.5 : 4, 0, Math.PI * 2);
    ctx.fillStyle = lit ? '#ffffff' : '#fef08a';
    ctx.shadowColor = lit ? '#38bdf8' : 'transparent';
    ctx.shadowBlur = lit ? 10 : 0;
    ctx.fill();
  }
  ctx.shadowBlur = 0;

  // 3. Draw 8 Vivid Prize Wedges with Icons & Radial Labels
  REMO_WHEEL_SLICES.forEach((sl, i) => {
    const startA = angleRad + i * sliceArc;
    const endA = startA + sliceArc;
    const midA = startA + sliceArc / 2;

    const g = ctx.createRadialGradient(cx, cy, 30, cx, cy, wheelR);
    g.addColorStop(0, '#0f172a');
    g.addColorStop(0.35, sl.color);
    g.addColorStop(1, sl.color);

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, wheelR, startA, endA);
    ctx.closePath();
    ctx.fillStyle = g;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#fde047';
    ctx.stroke();

    // Slice Text + Icon
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(midA);
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    ctx.font = '900 32px sans-serif';
    ctx.fillText(sl.icon, wheelR - 18, 0);

    const lbl = lang === 'fr' ? sl.label_fr : sl.label_en;
    ctx.font = '900 18px "Orbitron", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0,0,0,0.85)';
    ctx.shadowBlur = 6;
    ctx.fillText(lbl, wheelR - 60, 0);
    ctx.restore();
  });

  // 4. Center 3D Spin Hub Medallion
  const hubG = ctx.createRadialGradient(cx, cy, 6, cx, cy, 56);
  hubG.addColorStop(0, '#fde047');
  hubG.addColorStop(0.7, '#d97706');
  hubG.addColorStop(1, '#78350f');
  ctx.beginPath();
  ctx.arc(cx, cy, 56, 0, Math.PI * 2);
  ctx.fillStyle = hubG;
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#ffffff';
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#050814';
  ctx.font = '900 18px "Orbitron", sans-serif';
  ctx.fillText(lang === 'fr' ? 'TOURNER' : 'SPIN', cx, cy + 2);
}

function renderWheelView() {
  drawLuckyWheelCanvas(wheelCurrentAngle);
  const lang = REMO_I18N.getLang();
  const isAdm = REMO_STORE.isAdminUnlocked();
  const today = new Date().toISOString().slice(0, 10);
  const usedFree = !isAdm && localStorage.getItem('remo_wheel_day') === today;
  const freeBtn = document.getElementById('btnWheelFreeSpin');
  if (freeBtn) {
    freeBtn.textContent = isAdm
      ? '👑 ADMIN FREE SPIN'
      : usedFree
        ? (lang === 'fr' ? '⏳ Tour gratuit utilisé (Retourner 50 🪙)' : '⏳ Free Spin Used Today (Try 50 🪙)')
        : t('wheel_spin_btn');
  }

  const histBox = document.getElementById('wheelHistoryBox');
  if (histBox) {
    const hist = REMO_STORE.state.wheelHistory || [
      { user: 'Elena_KIV', flag: '🇲🇩', prize: '🌌 MYTHIC 4D CARD' },
      { user: 'Lucas_Paris', flag: '🇫🇷', prize: '🔥 +250 🪙' },
      { user: 'REMO Founder', flag: '🇨🇦', prize: '👑 +500 JACKPOT' }
    ];
    histBox.innerHTML = hist.slice(0, 5).map((h) => `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 10px;border-radius:10px;background:rgba(255,255,255,0.04);">
        <span><b>${h.flag || '🌐'} @${h.user}</b></span>
        <span style="color:#fbbf24;font-weight:900;">${h.prize}</span>
      </div>
    `).join('');
  }
}

function spinLuckyWheel(paid = false) {
  if (wheelSpinning) return;
  const lang = REMO_I18N.getLang();
  const isAdm = REMO_STORE.isAdminUnlocked();
  const u = REMO_STORE.getCurrentUser() || REMO_STORE.ensureGuestOrCitizen('Lucky Citizen', '', 'montreal');

  if (!isAdm) {
    if (!paid) {
      const today = new Date().toISOString().slice(0, 10);
      if (localStorage.getItem('remo_wheel_day') === today) {
        remoToast(lang === 'fr' ? 'Tour gratuit déjà utilisé aujourd’hui — essayez pour 50 🪙 !' : 'Free daily spin used — click Spin Again (50 🪙)!');
        return;
      }
      localStorage.setItem('remo_wheel_day', today);
    } else {
      if (!REMO_STORE.addCoins(u.uid, -50, 0)) {
        remoToast(lang === 'fr' ? '50 Pièces REMO requises !' : '50 REMO Coins required!');
        return;
      }
    }
  }

  wheelSpinning = true;
  const winBanner = document.getElementById('wheelWinBanner');
  if (winBanner) winBanner.style.display = 'none';

  // Weighted fair casino probabilities across all 8 slices
  const weights = [20, 14, 18, 6, 18, 10, 9, 5];
  const totalW = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * totalW;
  let winIdx = 0;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) { winIdx = i; break; }
  }

  const N = REMO_WHEEL_SLICES.length;
  const sliceArc = (Math.PI * 2) / N;
  const jitter = (Math.random() - 0.5) * sliceArc * 0.55;
  // Exact target angle so slice `winIdx` stops right under 12 o'clock (-Math.PI / 2)
  const baseTarget = -Math.PI / 2 - (winIdx + 0.5) * sliceArc - jitter;
  const fullSpins = (6 + Math.floor(Math.random() * 3)) * Math.PI * 2;
  const startAngle = wheelCurrentAngle % (Math.PI * 2);
  wheelCurrentAngle = startAngle;
  const endAngle = baseTarget + fullSpins + (baseTarget < startAngle ? Math.PI * 2 : 0);

  const duration = 4200;
  const t0 = performance.now();
  let lastTickSlice = -1;
  const pinEl = document.getElementById('wheelPointerPin');

  const animateWheel = (now) => {
    const p = Math.min(1, (now - t0) / duration);
    const ease = 1 - Math.pow(1 - p, 4); // Smooth casino quartic deceleration
    wheelCurrentAngle = startAngle + (endAngle - startAngle) * ease;

    // Detect slice crossing under 12 o'clock for crisp mechanical tick & needle bounce!
    const normUnderPin = ((-Math.PI / 2 - wheelCurrentAngle) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
    const curSliceUnderPin = Math.floor(normUnderPin / sliceArc);
    if (curSliceUnderPin !== lastTickSlice) {
      lastTickSlice = curSliceUnderPin;
      wheelBulbPhase++;
      RemoAudio.play('click');
      if (pinEl) {
        pinEl.style.transform = 'translateX(-50%) rotate(-16deg)';
        setTimeout(() => { if (pinEl) pinEl.style.transform = 'translateX(-50%) rotate(0deg)'; }, 65);
      }
    }

    drawLuckyWheelCanvas(wheelCurrentAngle);

    if (p < 1) {
      requestAnimationFrame(animateWheel);
    } else {
      wheelSpinning = false;
      const prize = REMO_WHEEL_SLICES[winIdx];
      const lbl = lang === 'fr' ? prize.label_fr : prize.label_en;
      const hc = getCityById(u.homeCity || 'montreal');

      REMO_STORE.state.wheelHistory = REMO_STORE.state.wheelHistory || [];
      if (prize.type === 'coins') {
        REMO_STORE.addCoins(u.uid, prize.val, 25);
        spawnRemoCoinsFX(prize.val >= 250 ? 20 : 10);
        RemoAudio.play('fanfare');
        const msg = `🎉 ${prize.icon} ${lbl} (+${prize.val} 🪙)!`;
        if (winBanner) { winBanner.style.display = 'block'; winBanner.textContent = msg; }
        REMO_STORE.state.wheelHistory.unshift({ user: u.name, flag: hc.flag, prize: `${prize.icon} +${prize.val} 🪙` });
        remoToast(msg, 'fanfare');
      } else {
        const cities = getRemoCities();
        const rc = cities[Math.floor(Math.random() * cities.length)];
        const card = REMO_STORE.mintCardForUser(u.uid, rc.id, prize.rarity, false);
        spawnRemoCoinsFX(12);
        RemoAudio.play('fanfare');
        const msg = `🎴 ${lbl}: ${rc.flag} ${getCityName(rc, lang)} #${card.serial}!`;
        if (winBanner) { winBanner.style.display = 'block'; winBanner.textContent = msg; }
        REMO_STORE.state.wheelHistory.unshift({ user: u.name, flag: hc.flag, prize: `${prize.icon} ${lbl} (${rc.code})` });
        remoToast(msg, 'fanfare');
        setTimeout(() => inspectCardModal(card), 550);
      }
      REMO_STORE.state.wheelHistory = REMO_STORE.state.wheelHistory.slice(0, 10);
      REMO_STORE.save(true, 'wheel_win');
      renderWheelView();
    }
  };

  requestAnimationFrame(animateWheel);
}

window.remoToast = remoToast;
window.spawnRemoCoinsFX = spawnRemoCoinsFX;
window.initRemoRadarMap = initRemoRadarMap;
window.setRadarTileStyle = setRadarTileStyle;
window.locateMeOnRadar = locateMeOnRadar;
window.teleportRadarCity = teleportRadarCity;
window.claimRadarSpot = claimRadarSpot;
window.claimFlashSuperDrop = claimFlashSuperDrop;
window.verifyPhysicalGpsVisa = verifyPhysicalGpsVisa;
window.renderArenaView = renderArenaView;
window.voteCityWar = voteCityWar;
window.updatePvPCardPreviews = updatePvPCardPreviews;
window.runCardPvPBattle = runCardPvPBattle;
window.sharePvPChallengeLink = sharePvPChallengeLink;
window.renderVaultView = renderVaultView;
window.triggerCityPackOpening = triggerCityPackOpening;
function adminDeleteGeoVault(vaultId) {
  if (!REMO_STORE.isAdminUnlocked() && !REMO_STORE.isCurrentUserAdmin()) return;
  const lang = REMO_I18N.getLang();
  if (!confirm(lang === 'fr' ? 'Supprimer définitivement ce Géo-Coffre ?' : 'Permanently delete this Geo-Vault?')) return;
  REMO_STORE.state.geoVaults = (REMO_STORE.state.geoVaults || []).filter((x) => x.id !== vaultId);
  REMO_STORE.save(true, 'vault_del');
  closeGeoVaultInspectModal();
  refreshRadarMarkers();
  remoToast(lang === 'fr' ? '🗑️ Géo-Coffre supprimé !' : '🗑️ Geo-Vault deleted!');
}

function adminDeleteRadarPin(pinId) {
  if (!REMO_STORE.isAdminUnlocked() && !REMO_STORE.isCurrentUserAdmin()) return;
  const lang = REMO_I18N.getLang();
  if (!confirm(lang === 'fr' ? 'Supprimer définitivement cette balise ?' : 'Permanently delete this live pin?')) return;
  REMO_STORE.state.radarPins = (REMO_STORE.state.radarPins || []).filter((x) => x.id !== pinId);
  REMO_STORE.save(true, 'pin_del');
  refreshRadarMarkers();
  remoToast(lang === 'fr' ? '🗑️ Balise supprimée !' : '🗑️ Live pin deleted!');
}

window.adminDeleteGeoVault = adminDeleteGeoVault;
window.adminDeleteRadarPin = adminDeleteRadarPin;
window.openBuryGeoVaultModal = openBuryGeoVaultModal;
window.locateNearestGeoVault = locateNearestGeoVault;
window.startAdminPickChestLocation = startAdminPickChestLocation;
window.submitBuryGeoVault = submitBuryGeoVault;
window.detectGpsForBuryVault = detectGpsForBuryVault;
window.refreshRadarMarkers = refreshRadarMarkers;
window.renderRadarCityTeleportBar = renderRadarCityTeleportBar;
window.openGeoVaultInspector = openGeoVaultInspector;
window.closeGeoVaultInspectModal = closeGeoVaultInspectModal;
window.tryUnlockGeoVaultAR = tryUnlockGeoVaultAR;
window.inspectCardById = inspectCardById;
window.inspectCardModal = inspectCardModal;
window.exportInspectedCardStory = exportInspectedCardStory;
window.showInspectedCardTradeQR = showInspectedCardTradeQR;
window.listInspectedCardInAuction = listInspectedCardInAuction;
window.renderPassportView = renderPassportView;
window.drawOfficialCitizenIdCard = drawOfficialCitizenIdCard;
window.downloadCitizenIdPNG = downloadCitizenIdPNG;
window.copyMyReferralInviteLink = copyMyReferralInviteLink;
window.shareReferralOnWhatsApp = shareReferralOnWhatsApp;
window.claimFriendReferralInput = claimFriendReferralInput;
window.changeUserHomeCity = changeUserHomeCity;
window.exportPassportStory = exportPassportStory;
window.drawStoryVerticalCanvas = drawStoryVerticalCanvas;
window.shareStoryCanvasNative = shareStoryCanvasNative;
window.downloadStoryCanvasPNG = downloadStoryCanvasPNG;
window.closeStoryExportModal = closeStoryExportModal;
window.drawBoardingPassCanvas = drawBoardingPassCanvas;
window.openBoardingPassModal = openBoardingPassModal;
window.closeBoardingPassModal = closeBoardingPassModal;
window.onBoardingPassRouteChanged = onBoardingPassRouteChanged;
window.swapBoardingPassRoute = swapBoardingPassRoute;
window.setBoardingPassRoutePreset = setBoardingPassRoutePreset;
window.resolveCityFromQuery = resolveCityFromQuery;
window.shareBoardingPassNative = shareBoardingPassNative;
window.downloadBoardingPassPNG = downloadBoardingPassPNG;
window.openWishingWellModal = openWishingWellModal;
window.closeWishingWellModal = closeWishingWellModal;
window.initWishingWellCanvas = initWishingWellCanvas;
window.tossWishingCoinWithAnimation = tossWishingCoinWithAnimation;
window.submitWishingWellCoin = submitWishingWellCoin;
window.renderWishingWellStream = renderWishingWellStream;
window.blessWishingWellItem = blessWishingWellItem;
window.teleportRadarCity = teleportRadarCity;
window.renderAuctionsView = renderAuctionsView;
window.placeAuctionBid = placeAuctionBid;
window.adminDeleteAuction = adminDeleteAuction;
window.inspectAuctionCard = inspectAuctionCard;
window.startAdminDropPin = startAdminDropPin;
window.geocodeVaultAddress = geocodeVaultAddress;
window.renderWheelView = renderWheelView;
window.drawLuckyWheelCanvas = drawLuckyWheelCanvas;
window.spinLuckyWheel = spinLuckyWheel;
window.verifyPhysicalGpsVisa = verifyPhysicalGpsVisa;
window.openGpsBorderStampSuccessModal = openGpsBorderStampSuccessModal;
window.showWorldChestDropAlert = showWorldChestDropAlert;
window.trackWorldChestOnRadar = trackWorldChestOnRadar;
window.openBuryGeoVaultModalAtCoords = openBuryGeoVaultModalAtCoords;
window.updateRadarSonarHUD = updateRadarSonarHUD;
window.renderArenaWarsOnly = renderArenaWarsOnly;
window.shareCityWarBackup = shareCityWarBackup;

if (typeof window !== 'undefined') {
  window.addEventListener('remo:worldchest_dropped', (e) => {
    if (typeof showWorldChestDropAlert === 'function') {
      showWorldChestDropAlert(e.detail);
    }
    if (typeof renderRadarGeoVaultMarkers === 'function') {
      renderRadarGeoVaultMarkers();
    }
  });
}
