// BNI 트래픽 라이트 — 오프라인용 서비스워커
var CACHE = 'tl-shell-v1';
var SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(SHELL); }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener('fetch', function(e){
  var url = new URL(e.request.url);
  // 구글시트 데이터 요청은 네트워크로 (앱이 localStorage에 자체 캐시함)
  if(url.hostname.indexOf('docs.google.com') >= 0) return;
  // 앱 파일: 캐시 우선 + 백그라운드 갱신
  e.respondWith(
    caches.match(e.request).then(function(cached){
      var fetched = fetch(e.request).then(function(res){
        if(res && res.ok && url.origin === location.origin){
          var copy = res.clone();
          caches.open(CACHE).then(function(c){ c.put(e.request, copy); });
        }
        return res;
      }).catch(function(){ return cached; });
      return cached || fetched;
    })
  );
});
