var filesToAdd = ['/',
]

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open('offline')
      .then(function(cache) {
        return cache.addAll(filesToAdd);
      })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    checkResponse(event.request)
      .catch(function() {
        return returnFromCache(event.request)}
      ));
  event.waitUntil(addToCache(event.request));
});

var checkResponse = function(request) {
  return new Promise(function(fulfill, reject) {
    fetch(request)
      .then(function(response) {
        if(response.status !== 404) {
          fulfill(response)
        } else {
          reject()
        }
      }, reject)
  });
};

var returnFromCache = function(request){
  return caches.open('offline')
    .then(function (cache) {
      return cache.match(request)
        .then(function (matching) {
          if(!matching || matching.status == 404) {
            return cache.match('/404.html')
          } else {
            return matching
          }
        });
    });
};

var addToCache = function(request) {
  return caches.open('offline')
    .then(function (cache) {
      return fetch(request)
        .then(function (response) {
          return cache.put(request, response);
        });
    });
};
