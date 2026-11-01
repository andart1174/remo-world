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
  if (!el || typeof L === 'undefined') return;

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

    const pinIcon = L.divIcon({
      className: 'remo-spot-pin',
      html: `<div style="font-size:22px;filter:drop-shadow(0 0 8px #fbbf24);">💎</div>`,
      iconSize: [28, 28]
    });
    const ttl = lang === 'fr' ? (p.title_fr || p.title_en) : p.title_en;
    L.marker([p.lat, p.lng], { icon: pinIcon })
      .addTo(remoMarkersLayer)
      .bindPopup(`
        <div style="color:#0f172a;font-family:Outfit,sans-serif;min-width:190px;">
          <b>💎 ${ttl}</b><br>
          <span style="font-size:12px;color:#d97706;font-weight:700;">+${p.reward || 50} REMO Coins</span><br>
          <button onclick="claimRadarSpot('${p.id}', ${p.reward || 50})" style="margin-top:6px;background:#f59e0b;color:#000;border:none;border-radius:6px;padding:5px 10px;cursor:pointer;font-weight:800;">
            ${lang === 'fr' ? 'Réclamer Drop' : 'Claim Drop'}
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

    const vaultIcon = L.divIcon({
      className: 'remo-geovault-pin-wrap',
      html: `
        <div class="remo-geovault-marker" title="${title}">
          <div class="vault-ping-wave"></div>
          <div class="vault-icon-core">💎</div>
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

  RemoAudio.play('click');
  remoMap.flyTo([target.lat, target.lng], 15, { duration: 1.4 });
  const lang = REMO_I18N.getLang();
  remoToast(lang === 'fr' ? `💎 Téléportation vers : ${target.title_fr || target.title_en}` : `💎 Radar lock on: ${target.title_en}`);
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

  const res = REMO_STORE.buryNewGeoVault({
    cityId,
    address,
    title_en: title,
    title_fr: title,
    hint_en: hint,
    hint_fr: hint,
    coinsReward,
    radiusMeters,
    lat,
    lng,
    rarity: coinsReward >= 300 ? 'Mythic 4D' : 'Legendary Gold',
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
  remoToast(lang === 'fr' ? '🧭 Scan satellite GPS en cours...' : '🧭 Scanning GPS satellite coordinates...');
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      if (remoMap) remoMap.flyTo([latitude, longitude], 13);
      const { city, distanceKm } = findNearestRemoCity(latitude, longitude);
      const u = REMO_STORE.getCurrentUser() || REMO_STORE.ensureGuestOrCitizen('GPS Explorer', '', city.id);
      const isLocal = distanceKm <= 80;
      const card = REMO_STORE.mintCardForUser(u.uid, city.id, isLocal ? 'Legendary Gold' : 'Rare', isLocal);
      REMO_STORE.addCoins(u.uid, 50, 40);
      spawnRemoCoinsFX(10);
      remoToast(
        lang === 'fr'
          ? `🛂 Visa ${getCityName(city, 'fr')} tamponné ! Carte #${card.serial} reçue (+50 🪙)`
          : `🛂 ${getCityName(city, 'en')} Visa stamped! Card #${card.serial} unlocked (+50 🪙)`,
        'fanfare'
      );
      inspectCardModal(card);
    },
    () => {
      remoToast(
        lang === 'fr'
          ? '⚠️ Accès GPS refusé — autorisez la localisation dans votre navigateur.'
          : '⚠️ GPS permission denied — allow location access in your browser.'
      );
    },
    { enableHighAccuracy: true, timeout: 8000 }
  );
}

/* ── 2. CITY WARS & 3-ROUND 3D CARD PVP BATTLE ARENA ── */
function renderArenaView() {
  const warsBox = document.getElementById('arenaWarsList');
  const pvpSel = document.getElementById('pvpUserCardSelect');
  const lang = REMO_I18N.getLang();
  if (!warsBox) return;

  warsBox.innerHTML = (REMO_STORE.state.duels || []).map((w) => {
    const cA = getCityById(w.cityA), cB = getCityById(w.cityB);
    const tot = Math.max(1, (w.votesA || 0) + (w.votesB || 0));
    const pctA = Math.round(((w.votesA || 0) / tot) * 100);
    const pctB = 100 - pctA;
    const ttl = lang === 'fr' ? (w.title_fr || w.title_en) : w.title_en;
    return `
      <div class="war-card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <b style="font-size:1rem;color:#fff;">⚔️ ${ttl}</b>
          <span class="city-tag">${t('arena_vote_reward')}</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-weight:800;font-size:0.9rem;">
          <span style="color:#f43f5e;">${cA.flag} ${getCityName(cA, lang)} (${pctA}% · ${w.votesA})</span>
          <span style="color:#38bdf8;">${cB.flag} ${getCityName(cB, lang)} (${pctB}% · ${w.votesB})</span>
        </div>
        <div class="war-bar-track">
          <div class="war-bar-fill-a" style="width:${pctA}%;"></div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px;">
          <button class="btn-cyber" style="justify-content:center;" onclick="voteCityWar('${w.id}','A')">
            ${cA.flag} ${lang === 'fr' ? 'Voter' : 'Vote'} ${getCityName(cA, lang)}
          </button>
          <button class="btn-ghost" style="justify-content:center;border-color:#38bdf8;" onclick="voteCityWar('${w.id}','B')">
            ${cB.flag} ${lang === 'fr' ? 'Voter' : 'Vote'} ${getCityName(cB, lang)}
          </button>
        </div>
      </div>
    `;
  }).join('');

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
}

function voteCityWar(warId, side) {
  const lang = REMO_I18N.getLang();
  const voteKey = 'remo_voted_' + warId;
  if (localStorage.getItem(voteKey)) {
    remoToast(lang === 'fr' ? 'Vous avez déjà voté dans ce duel !' : 'You already voted in this City War!');
    return;
  }
  const war = REMO_STORE.state.duels.find((d) => d.id === warId);
  if (!war) return;
  localStorage.setItem(voteKey, side);
  if (side === 'A') {
    war.votesA = (war.votesA || 0) + 1;
    REMO_STORE.addCityScore(war.cityA, 25);
  } else {
    war.votesB = (war.votesB || 0) + 1;
    REMO_STORE.addCityScore(war.cityB, 25);
  }
  const u = REMO_STORE.getCurrentUser();
  const reward = REMO_STORE.state.settings.rewards.duelVoteReward || 20;
  if (u) REMO_STORE.addCoins(u.uid, reward, 15);
  REMO_STORE.save(true, 'war_vote');
  spawnRemoCoinsFX(6);
  renderArenaView();
  if (typeof renderRightSidebarWidgets === 'function') renderRightSidebarWidgets();
  remoToast(lang === 'fr' ? `⚔️ Vote enregistré (+${reward} 🪙) !` : `⚔️ Vote locked in (+${reward} 🪙)!`, 'coin');
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

function inspectCardModal(cardSpec) {
  activeInspectedCard = cardSpec;
  const ov = document.getElementById('cardInspectModal');
  const flipper = document.getElementById('inspectCardFlipper');
  const fCv = document.getElementById('inspectFrontCv');
  const bCv = document.getElementById('inspectBackCv');
  if (!ov || !fCv || !bCv) return;

  if (flipper) flipper.classList.remove('flipped');
  renderCityCardFront(fCv, cardSpec);
  renderCityCardBack(bCv, cardSpec);
  ov.classList.add('open');
}

function exportInspectedCardStory() {
  const fCv = document.getElementById('inspectFrontCv');
  if (fCv && activeInspectedCard) exportCityStory916(fCv, activeInspectedCard);
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
  const startBid = Number(prompt(lang === 'fr' ? 'Prix de départ en Pièces REMO :' : 'Starting bid in REMO Coins:', '250'));
  if (!startBid || startBid < 10) return;
  const u = REMO_STORE.getCurrentUser();
  REMO_STORE.state.auctions.unshift({
    id: 'auc_' + Date.now(),
    cardSpec: activeInspectedCard,
    sellerName: u ? u.name : 'Citizen',
    currentBid: startBid,
    highestBidder: '—',
    endsAt: Date.now() + 24 * 3600 * 1000
  });
  REMO_STORE.save(true, 'auction_new');
  document.getElementById('cardInspectModal')?.classList.remove('open');
  remoToast(lang === 'fr' ? '🔨 Carte mise aux enchères !' : '🔨 Card listed in the Auction House!', 'coin');
  if (typeof switchRemoView === 'function') switchRemoView('auctions');
}

/* ── 4. #9 OFFICIAL HOLOGRAPHIC CITIZEN ID, REFERRAL QR (+100 🪙) & 3D VISA PASSPORT ── */
function getCitizenInviteUrl(u) {
  const ref = (u && u.referralCode) || `REMO-${(u && u.passportNum) || '0001'}`;
  const customDom = localStorage.getItem('remo_custom_domain');
  const base = customDom ? customDom.replace(/\/$/, '') + '/index.html' : `${window.location.origin}${window.location.pathname}`;
  return `${base}?ref=${encodeURIComponent(ref)}`;
}

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
  ctx.fillText(`${home.flag} ${getCityName(home, lang).toUpperCase()}  ·  ${home.lat.toFixed(2)}°, ${home.lng.toFixed(2)}°`, 235, 248);

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
            </div>
            <div style="font-size:0.84rem;color:#94a3b8;margin-top:3px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
              <span>${home.flag} <b>${escapeHtmlStr(getCityName(home, lang))}</b></span>
              <span>•</span>
              <span style="color:#cbd5e1;">#${escapeHtmlStr(u.passportNum || '0001')}</span>
              ${u.email ? `<span>•</span> <span style="font-size:0.75rem;color:#64748b;">${escapeHtmlStr(u.email)}</span>` : ''}
            </div>
            <div style="font-size:0.83rem;color:#e2e8f0;margin-top:6px;font-style:italic;">
              "${escapeHtmlStr(u.bio || (lang === 'fr' ? 'Citoyen explorateur de REMO World 🌍' : 'Exploring the cities of REMO World 🌍'))}"
            </div>
          </div>
        </div>
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
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
    </div>

    <!-- Navigation Tabs Rail -->
    <div class="profile-tabs-rail">
      <button type="button" class="fchip ${activeTab === 'posts' ? 'active' : ''}" onclick="setPassportTab('posts')">
        📸 ${lang === 'fr' ? 'Mes Publications' : 'My Posts'} (${myPosts.length})
      </button>
      <button type="button" class="fchip ${activeTab === 'messages' ? 'active' : ''}" onclick="setPassportTab('messages')">
        💌 ${lang === 'fr' ? 'Mes Discussions' : 'My Messages'} (${partnerList.length})
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
          <button class="btn-cyber btn-gold" onclick="downloadCitizenIdPNG()">${t('passport_dl_id_btn')}</button>
          <button class="btn-cyber" onclick="copyMyReferralInviteLink()">${t('passport_copy_ref_btn')} (${refCode})</button>
          <button class="btn-ghost" style="border-color:#10b981;color:#34d399;" onclick="shareReferralOnWhatsApp()">${t('passport_wa_ref_btn')}</button>
          <button class="btn-ghost" onclick="exportPassportStory()">${t('passport_share_story')}</button>
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
  navigator.clipboard?.writeText(url).catch(() => {});
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

function exportPassportStory() {
  const lang = REMO_I18N.getLang();
  const u = REMO_STORE.getCurrentUser() || { name: 'REMO Pioneer', passportNum: '0001', homeCity: 'montreal', coins: 150, visas: ['montreal'] };
  const c = getCityById(u.homeCity || 'montreal');
  const cv = document.createElement('canvas');
  cv.width = 1080; cv.height = 1920;
  const ctx = cv.getContext('2d');

  const g = ctx.createLinearGradient(0, 0, 1080, 1920);
  g.addColorStop(0, '#040714'); g.addColorStop(0.5, '#17133a'); g.addColorStop(1, '#040714');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920);

  ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 10;
  ctx.strokeRect(48, 48, 984, 1824);

  ctx.textAlign = 'center';
  ctx.font = '900 66px "Orbitron", sans-serif';
  ctx.fillStyle = '#fbbf24';
  ctx.fillText('🌐 REMO PASSPORT', 540, 200);

  ctx.font = '800 44px "Outfit", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(`${u.name} · #${u.passportNum}`, 540, 320);

  drawCityLandmark(ctx, c.id, c.themeColor || '#38bdf8', 540, 720, 260);

  ctx.font = '900 48px "Orbitron", sans-serif';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText(`${c.flag} ${getCityName(c, lang).toUpperCase()}`, 540, 1120);

  ctx.font = '800 34px "Outfit", sans-serif';
  ctx.fillStyle = '#10b981';
  ctx.fillText(`${(u.visas || []).length} WORLD CITY VISAS · 🪙 ${u.coins} REMO`, 540, 1210);

  const qr = RemoQREngine.toCanvas(`${window.location.origin}${window.location.pathname}?ref=PASS${u.passportNum}`, 240);
  ctx.drawImage(qr, 420, 1340, 240, 240);

  ctx.fillStyle = '#fbbf24';
  ctx.font = '900 32px "Outfit", sans-serif';
  ctx.fillText(lang === 'fr' ? 'SCANNEZ POUR REJOINDRE REMO (+150 🪙)' : 'SCAN TO JOIN REMO (+150 🪙)', 540, 1660);

  downloadCanvasAsPNG(cv, `REMO_Passport_${u.passportNum}.png`);
}

/* ── 5. LIVE AUCTION HOUSE & DAILY LUCKY WHEEL ── */
function renderAuctionsView() {
  const box = document.getElementById('auctionsListGrid');
  if (!box) return;
  const lang = REMO_I18N.getLang();
  const u = REMO_STORE.getCurrentUser();
  const isAdm = REMO_STORE.isAdminUnlocked() || REMO_STORE.isCurrentUserAdmin();
  const list = REMO_STORE.state.auctions || [];

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
    const canDelete = isAdm || (u && a.sellerName === u.name);
    return `
      <div class="glass-box" style="display:flex;flex-direction:column;align-items:center;gap:10px;position:relative;">
        ${canDelete ? `<button type="button" class="adm-pbtn danger" style="position:absolute;top:8px;right:8px;z-index:5;" onclick="adminDeleteAuction('${a.id}')" title="${lang === 'fr' ? 'Annuler l’enchère' : 'Cancel Auction'}">🗑️</button>` : ''}
        <canvas id="aucCv_${idx}" style="width:100%;max-width:210px;height:auto;border-radius:14px;"></canvas>
        <div style="font-weight:900;font-size:0.92rem;">${city.flag} ${getCityName(city, lang)} #${a.cardSpec.serial}</div>
        <div style="font-size:0.78rem;color:var(--muted);">${lang === 'fr' ? 'Vendeur' : 'Seller'}: ${typeof escapeHtmlStr === 'function' ? escapeHtmlStr(a.sellerName) : a.sellerName}</div>
        <div style="font-size:0.9rem;color:#fbbf24;font-weight:900;">${t('auction_min_bid')} 🪙 ${a.currentBid} (${typeof escapeHtmlStr === 'function' ? escapeHtmlStr(a.highestBidder) : a.highestBidder})</div>
        <button class="btn-cyber btn-gold" style="width:100%;justify-content:center;" onclick="placeAuctionBid('${a.id}')">
          🔨 ${t('auction_bid_btn')} (+50 🪙)
        </button>
      </div>
    `;
  }).join('');

  list.forEach((a, idx) => {
    const cv = document.getElementById(`aucCv_${idx}`);
    if (cv) renderCityCardFront(cv, a.cardSpec, lang);
  });
}

function adminDeleteAuction(aucId) {
  const isAdm = REMO_STORE.isAdminUnlocked() || REMO_STORE.isCurrentUserAdmin();
  const u = REMO_STORE.getCurrentUser();
  const a = (REMO_STORE.state.auctions || []).find((x) => x.id === aucId);
  if (!a) return;
  if (!isAdm && (!u || a.sellerName !== u.name)) {
    remoToast(REMO_I18N.getLang() === 'fr' ? 'Action non autorisée.' : 'Unauthorized.');
    return;
  }
  REMO_STORE.state.auctions = (REMO_STORE.state.auctions || []).filter((x) => x.id !== aucId);
  REMO_STORE.save(true, 'auction_delete');
  renderAuctionsView();
  remoToast(REMO_I18N.getLang() === 'fr' ? '🗑️ Enchère annulée et retirée !' : '🗑️ Auction cancelled and removed!');
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
window.renderAuctionsView = renderAuctionsView;
window.placeAuctionBid = placeAuctionBid;
window.adminDeleteAuction = adminDeleteAuction;
window.startAdminDropPin = startAdminDropPin;
window.geocodeVaultAddress = geocodeVaultAddress;
window.renderWheelView = renderWheelView;
window.drawLuckyWheelCanvas = drawLuckyWheelCanvas;
window.spinLuckyWheel = spinLuckyWheel;
