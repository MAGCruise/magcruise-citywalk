var VERSION = 1;
var CACHE_NAME = 'cache-v'+VERSION;
var DOC_ROOT = location.href.replace("sw.js","");
var HTMLS = ["clear.html","dev.html","index.html","task-description.html","badge.html","task-photo.html",
             "task-qr.html","task-selection.html","visit-history.html","score.html","navi.html","task-pin.html",
             "login.html","how-to-use.html","courses.html","help.html","credits.html","intro.html","tutorial.html",
             "signup.html","troubleshooting.html","check-environment.html","checkpoints.html"];
var JSS=["lib/parseUri.js","lib/ua-parser.min.js","lib/hammer-time.min.js","lib/geolocation-marker.js","lib/jsonrpc.js",
         "score.js","task-qr.js","task-photo.js","visit-history.js","clear.js","task-common.js",
         "task-description.js","checkpoint-utils.js","map-utils.js","courses.js","login.js","utils.js","troubleshooting.js",
         "tutorial.js","intro.js","signup.js","task-selection.js","task-pin.js","badge.js","check-environment.js","checkpoints.js","navi.js"];
var CSSS=["task-selection.css","badge.css","carousel.css", "credits.css","doc-page.css","score.css","task-photo.css","task-qr.css","tutorial.css",
          "visit-history.css","top.css","courses.css","common.css","checkpoints.css","header.css","navi.css"];
var IMGS=["arrow.png","btn_current_position.png","next_button.svg","nopicture.svg",
          "placeholder.svg","loading.gif","rank_first.png","rank_second.png",
          "rank_third.png","back.svg","forward.svg","btn_nav_start.png",
          "web/here.png","web/gps-alert.png","web/gps-chrome.png","web/gps-safari-alert.png","web/checkin.png",
          "web/navi.png","web/checkpoints.png","web/score.png","web/signup.png","web/task.png",
          "web/visit-history.png","web/gps-ios-app.png","web/gps-android.png"];

self.addEventListener('activate', function(evt) {
  evt.waitUntil(
    caches.keys().then(function(keys) {
          var promises = [];
          keys.forEach(function(cacheName) {
              promises.push(caches.delete(cacheName));
          });
          return Promise.all(promises);
    }));
  evt.waitUntil(
          caches.open(CACHE_NAME).then((cache) => {
            HTMLS.forEach(function(fileName){
              var path = DOC_ROOT+"app/"+fileName;
              fetch(path+"?serviceWorker=true").then(function (response) {
                return cache.put(path, response);
              })
            });
            JSS.forEach(function(fileName){
              var path = DOC_ROOT+"js/"+fileName;
              fetch(path).then(function (response) {
                return cache.put(path, response);
              })
            });
            CSSS.forEach(function(fileName){
              var path = DOC_ROOT+"css/"+fileName;
              fetch(path).then(function (response) {
                return cache.put(path, response);
              })
            });
            IMGS.forEach(function(fileName){
              var path = DOC_ROOT+"img/"+fileName;
              fetch(path).then(function (response) {
                return cache.put(path, response);
              })
            });
          })
        );
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
        return caches.match(exchangeCitywalkUrl(event.request.referrer)).then((response)=>{
          if(!response && isCitywalkHtmlUrl(event.request.url)){
            return caches.match(DOC_ROOT+"checkpoints.html");
          }
          return response;
        });
      }
      return response;
    });
  });

  event.respondWith(res);
});
