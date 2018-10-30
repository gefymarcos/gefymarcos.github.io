var CACHE_NAME = 'gefy-cache-v1';

self.addEventListener('install', event => {
  this.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll([
          '/',
          '/index.html',
          '/img/',
          '/countdown/',
          '/countdown/style.css',
          '/css/main.css',
          '/countdown/beep.mp3',
          '/countdown/finish-beep.mp3'
        ]);
      })
  );
});

this.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => {
            (cacheName.startsWith('gefy-'))
          })
          .filter(cacheName => {
            (cacheName !== staticCacheName)
          })
          .map(cacheName => caches.delete(cacheName))
      );
    })
  );
});

this.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
      .catch(() => {
        return caches.match('/offline/index.html');
      })
  )
});
