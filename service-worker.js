const CACHE_NAME = 'hbq-network-first-v20260924-ch4-itemart-webp-6';

const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './pwa-register.js',
  './offline.html',
  './icon-72.png',
  './icon-96.png',
  './icon-128.png',
  './icon-192.png',
  './icon-512.png',
  './chapter4-donggureung-main.png',
  './ch4-hongsalmun-badge.webp',
  './ch4-geonwolleung-bookmark.webp',
  './ch4-jeongjagak-postcard.webp',
  './ch4-stone-guardians-card.webp',
  './ch4-officials-set.webp',
  './ch4-donggureung-theme-ticket.webp',
  './apple-touch-icon.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      await Promise.allSettled(APP_SHELL.map(url =>
        cache.add(new Request(url, { cache: 'reload' }))
      ));
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request, { cache: 'no-store' });
    if (response && (response.ok || response.type === 'opaque')) {
      cache.put(request, response.clone()).catch(() => {});
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request, { ignoreSearch: true });
    if (cached) return cached;
    if (request.mode === 'navigate') {
      const offline = await cache.match('./offline.html');
      if (offline) return offline;
    }
    throw error;
  }
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (!['http:', 'https:'].includes(url.protocol)) return;
  event.respondWith(networkFirst(request));
});
