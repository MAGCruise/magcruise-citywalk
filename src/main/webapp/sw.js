var VERSION = 1;
var CACHE_NAME = 'cache-v'+VERSION;
var DOC_ROOT = location.href.replace("sw.js","")+"app/";

self.addEventListener('activate', function(evt) {
  evt.waitUntil(
    caches.keys().then(function(keys) {
          var promises = [];
          keys.forEach(function(cacheName) {
              promises.push(caches.delete(cacheName));
          });
          return Promise.all(promises);
    }));
});

self.addEventListener('fetch', (event) => {
  function exchangeCitywalkUrl(url){
    if(url.indexOf("magcruise-citywalk") !=-1 &&url.indexOf("?")!=-1){
      return url.substring(0,url.indexOf("?"));
    }else{
      return url;
    }
  }

  function isCitywalkHtmlUrl(url){
    return url.indexOf(DOC_ROOT)!=-1 && url.indexOf(".html")!=-1;
  }

  var res = fetch(event.request).then((response) => {
      if (!response || response.status !== 200 || response.type !== 'basic') {
        return response;
      }
      let responseToCache = response.clone();
      caches.open(CACHE_NAME).then((cache) => {
              if(event.request.method=="GET"){
                cache.put(exchangeCitywalkUrl(event.request.url), responseToCache);
              }
      });
      return response;
  }).catch(function(ev) {
    return caches.match(exchangeCitywalkUrl(event.request.url)).then((response)=>{
        if(!response && isCitywalkHtmlUrl(event.request.url)){
          return caches.match(DOC_ROOT+"checkpoints.html");
        }
        return response;
      }
    );
  });

  event.respondWith(res);
});
