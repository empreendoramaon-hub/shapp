const CACHE_NAME = 'shapp-apps-v7';
const CORE_ASSETS = [
  '/',
  '/sotalia-app',
  '/manifest.webmanifest',
  '/icon-192.png',
  '/icon-512.png',
  '/sotalia-manifest.webmanifest',
  '/icon.svg',
  '/sotalia-icon.svg',
  '/sotalia-icon-192.png',
  '/sotalia-icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((key) => key !== CACHE_NAME && caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  const fallback = url.pathname.startsWith('/sotalia-app') ? '/sotalia-app' : '/';
  const isNavigation = event.request.mode === 'navigate';
  const isBundle = url.pathname.startsWith('/assets/');
  event.respondWith(
    fetch(event.request, isNavigation || isBundle ? { cache: 'no-store' } : undefined)
      .then((response) => {
        if (!isNavigation && !isBundle) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() => caches.match(event.request).then((res) => res || caches.match(fallback) || caches.match('/')))
  );
});
