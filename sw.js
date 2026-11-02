/* ════════════════════════════════════════════════════════════════════
   🌐 REMO — Progressive Web App Service Worker v1.0
   Offline Shell Caching + Native Push & Incoming Call Notifications
   ════════════════════════════════════════════════════════════════════ */

const CACHE_NAME = 'remo-pwa-v52';
const CORE_ASSETS = [
  './',
  './index.html',
  './admin.html',
  './manifest.json',
  './favicon.ico',
  './css/remo-core.css',
  './css/remo-admin.css',
  './img/remo_icon_512.png',
  './img/remo_icon_192.png',
  './img/apple-touch-icon.png',
  './img/remo_brand_coin.png',
  './img/favicon-32x32.png',
  './img/favicon-64x64.png',
  './img/remo_coin_front.png',
  './img/remo_coin_back_base.png',
  './img/remo_coin_back_001.png',
  './img/remo_coin_front.jpg',
  './img/remo_coin_back_001.jpg',
  './img/remo_coin_obverse_gold.jpg',
  './img/remo_coin_reverse_compass.jpg',
  './img/remo_coin_prismatic_4d.jpg',
  './js/remo-i18n.js',
  './js/remo-cities-data.js',
  './js/remo-store.js',
  './js/remo-card-engine.js',
  './js/remo-radar-arena.js',
  './js/remo-social-comms.js',
  './js/remo-radio-engine.js',
  './js/remo-admin.js'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS).catch(() => {}))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        if (res && res.status === 200 && res.type === 'basic') {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone)).catch(() => {});
        }
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || './index.html';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
    })
  );
});
