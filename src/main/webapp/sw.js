'use strict';

const CACHE_NAME = 'cache-v1';
const ROOT = '/magcruise-citywalk/'
const urlsToCache = [
   ROOT + 'css/checkpoints.css',
   ROOT + 'css/common.css',
   ROOT + 'css/header.css',
   ROOT + 'css/navi.css',
   ROOT + 'css/remodal-default-theme.css',
   ROOT + 'css/remodal.css',
   ROOT + 'css/task-selection.css',
   ROOT + 'img/back.svg',
   ROOT + 'img/forward.svg',
   ROOT + 'img/btn_nav_start.png',
   ROOT + 'img/loading.gif',
   ROOT + 'img/next_button.svg',
   ROOT + 'img/nopicture.svg',
   ROOT + 'img/placeholder.svg',
   ROOT + 'app/checkpoints.html',
   ROOT + 'app/check-environment.html',
   ROOT + 'app/task-description.html',
   ROOT + 'app/task-pin.html',
   ROOT + 'app/task-qr.html',
   ROOT + 'app/task-selection.html',
   ROOT + 'js/checkpoints.js',
   ROOT + 'js/lib/jsonrpc.js',
   ROOT + 'js/navi.js',
   ROOT + 'js/lib/parseUri.js',
   ROOT + 'js/lib/remodal.min.js',
   ROOT + 'js/task-common.js',
   ROOT + 'js/task-description.js',
   ROOT + 'js/task-photo.js',
   ROOT + 'js/task-pin.js',
   ROOT + 'js/task-qr.js',
   ROOT + 'js/task-selection.js',
   ROOT + 'js/util.js',

];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
              .then((cache) => {
                  // 指定されたリソースをキャッシュに追加する
                  return cache.addAll(urlsToCache);
              })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
              .then((response) => {
                  if (response) {
                      return response;
                  }
                  // 重要：リクエストを clone する。リクエストは Stream なので
                  // 一度しか処理できない。ここではキャッシュ用、fetch 用と2回
                  // 必要なので、リクエストは clone しないといけない
                  let fetchRequest = event.request.clone();
                  return fetch(fetchRequest)
                      .then((response) => {
                          if (!response || response.status !== 200 || response.type !== 'basic') {
                              return response;
                          }
                          // 重要：レスポンスを clone する。レスポンスは Stream で
                          // ブラウザ用とキャッシュ用の2回必要。なので clone して
                          // 2つの Stream があるようにする
                          let responseToCache = response.clone();
                          caches.open(CACHE_NAME)
                                .then((cache) => {
                                  if(event.request.method==="GET"){
                                    cache.put(event.request, responseToCache);
                                  }
                                });
                          return response;
                      });
              })
    );
});
