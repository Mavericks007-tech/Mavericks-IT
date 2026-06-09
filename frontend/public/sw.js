// Minimal service worker — offline shell + static cache.
// Skips POST and admin/portal routes.
const VERSION = 'v1';
const PRECACHE = `precache-${VERSION}`;
const RUNTIME  = `runtime-${VERSION}`;

const PRECACHE_URLS = ['/', '/offline.html', '/favicon.svg', '/manifest.webmanifest'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(PRECACHE).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names.filter((n) => ![PRECACHE, RUNTIME].includes(n)).map((n) => caches.delete(n))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/manage') ||
      url.pathname.startsWith('/portal') ||
      url.pathname.startsWith('/api')   ||
      url.pathname.startsWith('/admin')) return;

  // network-first for HTML, cache-first for static
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(RUNTIME).then((c) => c.put(request, copy));
          return res;
        })
        .catch(() => caches.match(request).then((m) => m || caches.match('/offline.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((res) => {
          if (res.status === 200 && res.type === 'basic') {
            const copy = res.clone();
            caches.open(RUNTIME).then((c) => c.put(request, copy));
          }
          return res;
        })
    )
  );
});
