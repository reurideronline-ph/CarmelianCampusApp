// Carmelian Campus App - Service Worker
const CACHE_NAME = 'carmelian-campus-v1';
const SHELL_ASSETS = [
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png'
];

// Install: cache the app shell
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(SHELL_ASSETS);
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

// Activate: clean up old caches
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) { return key !== CACHE_NAME; })
            .map(function(key) { return caches.delete(key); })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// Fetch: network-first for the app (Apps Script must be live),
// cache-first for the shell assets
self.addEventListener('fetch', function(event) {
  // Never cache the Google Apps Script app itself
  if (event.request.url.indexOf('script.google.com') !== -1 ||
      event.request.url.indexOf('googleusercontent.com') !== -1) {
    return; // let the browser handle it normally
  }

  event.respondWith(
    caches.match(event.request).then(function(cached) {
      return cached || fetch(event.request).then(function(response) {
        return response;
      }).catch(function() {
        // Offline fallback to the shell
        return caches.match('./index.html');
      });
    })
  );
});
