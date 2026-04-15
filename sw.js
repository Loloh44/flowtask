// FlowTask Service Worker — offline cache
var CACHE = 'flowtask-v1';
var FILES = ['/', '/index.html', '/manifest.json'];

self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(cache){
      return cache.addAll(FILES).catch(function(){});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){return k!==CACHE;}).map(function(k){return caches.delete(k);}));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e){
  // Only cache same-origin requests, pass through Google API calls
  if(e.request.url.indexOf('script.google.com')>=0||
     e.request.url.indexOf('api.anthropic.com')>=0||
     e.request.url.indexOf('googleapis.com')>=0){
    return;
  }
  e.respondWith(
    caches.match(e.request).then(function(cached){
      return cached || fetch(e.request).then(function(resp){
        var clone=resp.clone();
        caches.open(CACHE).then(function(cache){cache.put(e.request,clone);});
        return resp;
      }).catch(function(){return cached;});
    })
  );
});
