/* Metalika Urenstaat / Timesheet — Service Worker
   Cache-first strategy for full offline support.
   Bump CACHE_NAME on every deploy that changes any cached file. */
const CACHE_NAME = 'metalika-timesheet-v2';

const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './jspdf.umd.min.js',
  './assets/metalika_logo.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './fonts/Roboto-Regular.ttf',
  './fonts/Roboto-Bold.ttf'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached);
    })
  );
});
