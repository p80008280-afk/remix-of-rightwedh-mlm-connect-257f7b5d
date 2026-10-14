// Minimal network-first service worker (needed for installable app mode).
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (new URL(event.request.url).pathname.startsWith('/sbp/')) return;
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
