const CACHE_VERSION = 'bayram-v3';
const PRECACHE = [
  './',
  './index.html',
  './manifest.json',
  './css/base.css',
  './css/setup.css',
  './css/envelope.css',
  './css/celebration.css',
  './css/animations.css',
  './js/main.js',
  './js/envelope.js',
  './js/setup.js',
  './js/fireworks.js',
  './js/greeting.js',
  './js/bayram-detect.js',
  './js/iban.js',
  './js/share.js',
  './js/card-export.js',
  './js/config.js',
  './js/toast.js',
  './js/pwa.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // CDN ESM modülleri: stale-while-revalidate
  if (url.origin === 'https://cdn.jsdelivr.net' || url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com') {
    event.respondWith(
      caches.open(`${CACHE_VERSION}-cdn`).then(async (cache) => {
        const cached = await cache.match(request);
        const network = fetch(request).then((response) => {
          if (response.ok) cache.put(request, response.clone());
          return response;
        }).catch(() => cached);
        return cached || network;
      }),
    );
    return;
  }

  // Aynı origin: cache-first
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cached) => {
        return cached || fetch(request).then((response) => {
          if (response.ok && response.type === 'basic') {
            const clone = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(request, clone));
          }
          return response;
        }).catch(() => caches.match('./index.html'));
      }),
    );
  }
});
