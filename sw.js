/* ════════════════════════════════════════════════════════════════════
   🌐 REMO — Progressive Web App Service Worker v1.0
   Offline Shell Caching + Native Push & Incoming Call Notifications
   ════════════════════════════════════════════════════════════════════ */

const CACHE_NAME = 'remo-pwa-v157';
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './favicon.ico',
  './css/remo-core.css?v=157',
  './img/remo_icon_192.png',
  './img/apple-touch-icon.png',
  './img/remo_brand_coin.png',
  './img/favicon-32x32.png',
  './img/favicon-64x64.png',
  './img/remo_coin_front.png',
  './img/remo_coin_back_base.png',
  './js/remo-i18n.js?v=157',
  './js/remo-cities-data.js?v=157',
  './js/remo-store.js?v=157',
  './js/remo-card-engine.js?v=157',
  './js/remo-radar-arena.js?v=157',
  './js/remo-social-comms.js?v=157',
  './js/remo-radio-engine.js?v=157',
  './js/remo-focus-tv.js?v=157',
  './js/remo-world-blitz.js?v=157'
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
  let reqUrl;
  try {
    reqUrl = new URL(event.request.url);
  } catch (e) {
    return;
  }
  // Never intercept cross-origin requests, serverless functions, or streaming audio/video/Range
  if (
    reqUrl.origin !== self.location.origin ||
    reqUrl.pathname.startsWith('/.netlify/') ||
    event.request.destination === 'audio' ||
    event.request.destination === 'video' ||
    event.request.headers.has('range')
  ) {
    return;
  }
  // Fast Cache-First for immutable versioned JS/CSS (?v=...) and static images (instant repeat load on mobile!)
  const isVersionedAsset = Boolean(reqUrl.searchParams.get('v')) && (reqUrl.pathname.endsWith('.js') || reqUrl.pathname.endsWith('.css'));
  const isStaticImg = reqUrl.pathname.startsWith('/img/');
  if (isVersionedAsset || isStaticImg) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(event.request).then((cached) => {
          if (cached) return cached;
          return fetch(event.request).then((res) => {
            if (res && res.status === 200 && res.type === 'basic') {
              cache.put(event.request, res.clone()).catch(() => {});
            }
            return res;
          });
        })
      )
    );
    return;
  }
  // Network-First for HTML & unversioned pages so fresh deployments always take effect immediately
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
  const notifData = event.notification.data || {};
  const targetUrl = notifData.url || './index.html';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        try {
          client.postMessage({ type: 'REMO_OS_NOTIF_CLICK', data: notifData });
        } catch (e) {}
        if ('focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
    })
  );
});
