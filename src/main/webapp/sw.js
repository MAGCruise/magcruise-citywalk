'use strict';

const CACHE_NAME = 'cache-v1';
const ROOT = '/magcruise-citywalk/'
const urlsToCache = [
   ROOT + 'css/badge.css',
   ROOT + 'css/checkpoints.css',
   ROOT + 'css/common.css',
   ROOT + 'css/courses.css',
   ROOT + 'css/header.css',
   ROOT + 'css/login.css',
   ROOT + 'css/navi.css',
   ROOT + 'css/ranking.css',
   ROOT + 'css/register.css',
   ROOT + 'css/remodal-default-theme.css',
   ROOT + 'css/remodal.css',
   ROOT + 'css/task-photo.css',
   ROOT + 'css/task-qr.css',
   ROOT + 'css/task-selection.css',
   ROOT + 'css/top.css',
   ROOT + 'css/visited-checkpoints.css',
   ROOT + 'fragment/header.html',
   ROOT + 'fragment/modal.html',
   ROOT + 'img/arrow.png',
   ROOT + 'img/back.png',
   ROOT + 'img/btn_current_position.png',
   ROOT + 'img/btn_nav_start.png',
   ROOT + 'img/loading.gif',
   ROOT + 'img/next_button.svg',
   ROOT + 'img/nopicture.svg',
   ROOT + 'img/placeholder.svg',
   ROOT + 'img/rank_first.png',
   ROOT + 'img/rank_second.png',
   ROOT + 'img/rank_third.png',
   ROOT + 'img/web/checkin.png',
   ROOT + 'img/web/here.png',
   ROOT + 'img/web/mihoumon_addComments.png',
   ROOT + 'img/web/navi.png',
   ROOT + 'img/web/ranking.png',
   ROOT + 'img/web/register.png',
   ROOT + 'img/web/task.png',
   ROOT + 'app/index.html',
   ROOT + 'app/about-wasedasai.html',
   ROOT + 'app/badge.html',
   ROOT + 'app/checkpoints.html',
   ROOT + 'app/clear.html',
   ROOT + 'app/courses.html',
   ROOT + 'app/credits.html',
   ROOT + 'app/dev.html',
   ROOT + 'app/how-to-use.html',
   ROOT + 'app/index.html',
   ROOT + 'app/intro.html',
   ROOT + 'app/login.html',
   ROOT + 'app/navi.html',
   ROOT + 'app/ranking.html',
   ROOT + 'app/signup.html',
   ROOT + 'app/task-description.html',
   ROOT + 'app/task-photo.html',
   ROOT + 'app/task-pin.html',
   ROOT + 'app/task-qr.html',
   ROOT + 'app/task-selection.html',
   ROOT + 'app/visited-checkpoints.html',
   ROOT + 'js/badge.js',
   ROOT + 'js/checkpoints.js',
   ROOT + 'js/citywalk-dev.js',
   ROOT + 'js/courses.js',
   ROOT + 'js/jsonrpc.js',
   ROOT + 'js/login.js',
   ROOT + 'js/navi.js',
   ROOT + 'js/parseUri.js',
   ROOT + 'js/ranking.js',
   ROOT + 'js/register.js',
   ROOT + 'js/remodal.min.js',
   ROOT + 'js/task-common.js',
   ROOT + 'js/task-description.js',
   ROOT + 'js/task-photo.js',
   ROOT + 'js/task-pin.js',
   ROOT + 'js/task-qr.js',
   ROOT + 'js/task-selection.js',
   ROOT + 'js/util.js',
   ROOT + 'js/visited-checkpoints.js',
   ROOT + 'js/qr/alignpat.js',
   ROOT + 'js/qr/bitmat.js',
   ROOT + 'js/qr/bmparser.js',
   ROOT + 'js/qr/datablock.js',
   ROOT + 'js/qr/databr.js',
   ROOT + 'js/qr/datamask.js',
   ROOT + 'js/qr/decoder.js',
   ROOT + 'js/qr/detector.js',
   ROOT + 'js/qr/errorlevel.js',
   ROOT + 'js/qr/findpat.js',
   ROOT + 'js/qr/formatinf.js',
   ROOT + 'js/qr/gf256.js',
   ROOT + 'js/qr/gf256poly.js',
   ROOT + 'js/qr/grid.js',
   ROOT + 'js/qr/jquery-2.2.3.min.js',
   ROOT + 'js/qr/megapix-image.js',
   ROOT + 'js/qr/qrcode.js',
   ROOT + 'js/qr/rsdecoder.js',
   ROOT + 'js/qr/version.js',
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
                                    cache.put(event.request, responseToCache);
                                });
                          return response;
                      });
              })
    );
});
