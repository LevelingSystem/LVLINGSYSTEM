/* Weekly Workout Tracker — offline service worker
   Build v18 • 2026-09-20

   Upload this file NEXT TO index.html (same folder) on GitHub Pages.
   The whole app is a single HTML file, so we only need to cache the document
   itself. Everything else (icons, styles, scripts) is already inlined.        */

const CACHE = 'workout-v18';

/* Install: pre-cache the app shell, then take over immediately. */
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(['./', './index.html']).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

/* Activate: drop caches from older builds so an update is picked up. */
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* Fetch: network-first for the page itself, so you always get the newest
   build when you are online, and fall back to the cached copy when you are
   offline. Anything else falls back to cache-first.                          */
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const isDoc = req.mode === 'navigate' ||
                (req.headers.get('accept') || '').includes('text/html');

  if (isDoc) {
    e.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
    );
    return;
  }

  e.respondWith(
    caches.match(req).then(r => r || fetch(req).catch(() => r))
  );
});
