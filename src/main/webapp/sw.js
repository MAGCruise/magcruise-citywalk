var VERSION = 1;
var CACHE_NAME = 'cache-v'+VERSION;

function exchangeCitywalkUrl(url){
  if(url.indexOf("magcruise-citywalk") !=-1 &&url.indexOf("?")!=-1){
    return url.substring(0,url.indexOf("?"));
  }else{
    return url;
  }
}

self.addEventListener('fetch', (event) => {
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
    return caches.match(exchangeCitywalkUrl(event.request.url));
  });

  event.respondWith(res);
});
