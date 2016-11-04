var checkpoint = getCheckpoint();
document.title = checkpoint.name; // タイトルの変更
var cPos; // 現在地
var ePos; // チェックポイント
var cHeading; // 絶対角
var map;
var watchID;
var compassElem;
var defaultOrientation;

var POST_MOVEMENT_INTERVAL = 1000 * 10; // msec
var KEY_MOVEMENT_LIST = "movement_list";

var DEFAULT_FOCUS_ZOOM = 17;
var infoWindow;

var uaParser = new UAParser();

window.onload = function() {
  initMap();
}

// ブラウザがバックグラウンドに一度遷移すると，watchPositionキャンセルされる。
// そこで，フォアグラウンドに戻ってきた際に，リロードする。initMap()だけでも良いが念のため。
// ex.)ホームボタンを押す。
// ex.)電源ボタンを押す。
// ex.)通知より，別のアプリを起動する。
var lastChecked = Date.now();
setInterval(function() {
  var now = Date.now();
  if (now - lastChecked > 1000 * 10) {
    location.reload();
  }
  lastChecked = now;
}, 1000 * 5);

$(function() {
  $("#hide-gps-settings-alert").on('click', function() {
    localStorage.hideGpsSettingsAlert = "true";
    updateGpsEnableMessage();
  });
  updateGpsEnableMessage();
  $('#checkpoint-info').append(makeCheckpointInfoHtml(checkpoint));
  $('#checkpoint-info .checkpoint-info-description').append($("<div>").attr("id", "notification"));
});

function updateGpsEnableMessage() {
  if (localStorage.hideGpsSettingsAlert && JSON.parse(localStorage.hideGpsSettingsAlert)) {
    $("#initial-warning-msg-area").remove();
  } else {
    if (uaParser.getOS().name === "iOS") {
      $("#initial-warning-msg-ios").show();
    } else {
      $("#initial-warning-msg-android").show();
    }
  }
}

function updateMapHeight() {
  var height = $(window).height() - $("#map-box").offset().top - 16;
  if (height > Number($("#map-box").css("height").replace("px", ""))) {
    $("#map-box").css("height", height + "px");
  }
}

$(function() {
  updateMapHeight();
  setInterval(updateMapHeight, 500);
  $("#btn-next").on('click', function() {
    // 既に途中までタスクが進んでいる場合には，完了済みの次のタスクからはじめる
    var taskIndex = getLastTaskIndex(checkpoint.id) + 1;
    location.href = getTaskURLWithCurrentPosition(checkpoint, taskIndex, cPos);
  });

  // コンパス画像の要素
  compassElem = $("#compass");
  // 端末の向きを取得
  defaultOrientation = (screen.width > screen.height) ? "landscape" : "portrait";
  // 電子コンパスイベントの取得
  window.addEventListener("deviceorientation", onHeadingChange);
  getEventsByWebsocket();
  // 移動ログの送信
  setInterval(postMovementsFunc, POST_MOVEMENT_INTERVAL);
});

function getEventsByWebsocket() {
  var wsUrl = getActivityPublisherUrl() + "/" + getCheckpointGroupId() + "/" + checkpoint.id + "/"
          + getUserId();
  var connection = new WebSocket(wsUrl);
  connection.onmessage = function(e) {
    var messages = JSON.parse(e.data);
    for (var i = 0; i < messages.length; i++) {
      var a = messages[i];
      var elem = $('<div class="item">' + '<span class="time">' + toFormattedShortDate(a.createdAt)
              + '</span>' + '<span class="name">' + a.userId + '</span>' + 'さんがチェックイン' + '</div>');
      $('#notification').prepend(elem);
    }
  };
  return {
    abort: function() {
      connection.close();
    }
  };
}

function initMap() {

  // 目的地の設定&位置情報の連続取得
  ePos = new google.maps.LatLng(checkpoint.lat, checkpoint.lon);

  var center = {
    lat: checkpoint.lat,
    lng: checkpoint.lon
  };

  map = new google.maps.Map(document.getElementById('map'), {
    center: center,
    mapTypeControl: false,
    streetViewControl: false,
    scaleControl: true,
    scaleControlOptions: {
      position: google.maps.ControlPosition.BOTTOM_LEFT
    },
    zoom: DEFAULT_FOCUS_ZOOM
  });

  initMakers();

  // マーカーの追加
  var marker = new google.maps.Marker({
    position: center,
    map: map,
  });

  infoWindow = new google.maps.InfoWindow({
    content: checkpoint.name + "<br>(" + checkpoint.place + ")"
  });
  infoWindow.open(marker.getMap(), marker);

  google.maps.event.addListener(infoWindow, "closeclick", function() {
    google.maps.event.addListenerOnce(marker, "click", function(event) {
      infoWindow.open(map, marker);
    });
  });

  createMapControlUI(map, "目的地", "12px", google.maps.ControlPosition.RIGHT_TOP).addEventListener(
          'click', function() {
            fitBoundsAndZoom(map, [{
              lat: ePos.lat(),
              lon: ePos.lng()
            }], cPos, DEFAULT_FOCUS_ZOOM);
            infoWindow.open(map, marker);
          });

  var currentPositionMarker = new GeolocationMarker();
  currentPositionMarker.setCircleOptions({
    fillColor: '#C2D3E3'
  });
  currentPositionMarker.setMap(map);

  watchCurrentPosition();
}

function initMakers() {
  var checkpoints = getNonVisitedCheckPoints();
  var markers = [];
  checkpoints.forEach(function(checkpoint, i) {
    var marker = new google.maps.Marker({
      position: {
        lat: checkpoint.lat,
        lng: checkpoint.lon
      },
      map: map,
      icon: "//maps.google.com/mapfiles/ms/icons/blue-dot.png",
    });
    marker.addListener('click', function() {
      if (infoWindow != null) {
        infoWindow.close();
      }

      var imgSrc = checkpoint.imgSrc == null ? "../img/placeholder.svg" : checkpoint.imgSrc;
      imgSrc = checkpoint.imgSrc.indexOf("http") == -1 ? "../" + imgSrc : imgSrc;

      infoWindow = new google.maps.InfoWindow({
        content: "<span class='green'>" + checkpoint.name + "</span> (" + checkpoint.place + ")"
                + "<br><span class='balloon-description'>カテゴリ： </span>" + '<a href="'
                + "./checkpoints.html#" + "?category=" + encodeURIComponent(checkpoint.category)
                + "&selected-id=" + encodeURIComponent(checkpoint.id) + '&no-refresh=true">'
                + checkpoint.category + "</a>" + '<img src="' + imgSrc
                + '" class="pull-right checkpoint-img" style="max-width: 70px;margin-left: 2em;">'
                + "<div class='balloon-description'>" + checkpoint.label + "<br>"
                + '<a id="nav-start-in-list" class="btn btn-success btn-sm">ここに行く</a>' + "</div>"
      });
      infoWindow.open(marker.getMap(), marker);
      $("#nav-start-in-list").on("click", function() {
        location.href = "./navi.html?checkpoint_id=" + checkpoint.id;
      });
    });
    markers.push(marker);
  });
}

/* 位置情報を連続取得する */
function watchCurrentPosition() {
  if (!navigator || !navigator.geolocation) {
    if ($('#error-msg-area').is(':hidden')) {
      $('#error-msg-area').show();
    }
    $('.gps-error-msg').show();
    if ($('.compass-error-msg').is(':visible')) {
      $('.error-msg-splitter').show();
    }
    return;
  }
  watchID = window.navigator.geolocation.watchPosition(function(pos) {
    if (!localStorage.hideGpsSettingsAlert) {
      localStorage.hideGpsSettingsAlert = "true";
    }
    updateGpsEnableMessage();
    $('#initial-msg').hide();
    $('#distance-wrapper').show();

    cPos = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
    console.log("currentPosition: " + pos.coords.latitude + ", " + pos.coords.longitude);
    showDistance();
    enqueueMovement(pos);
    $('.gps-error-msg').hide();
    $('.error-msg-splitter').hide();
    if ($('.compass-error-msg').is(':hidden')) {
      $('#error-msg-area').hide();
    }
    createMapControlUI(map, "現在地", "12px", google.maps.ControlPosition.RIGHT_TOP).addEventListener(
            'click', function() {
              fitBoundsAndZoom(map, [{
                lat: cPos.lat(),
                lon: cPos.lng()
              }], cPos, DEFAULT_FOCUS_ZOOM);
            });

    createMapControlUI(map, "目的地～現在地", "12px", google.maps.ControlPosition.TOP_RIGHT)
            .addEventListener('click', function() {
              fitBoundsAndZoom(map, [{
                lat: ePos.lat(),
                lon: ePos.lng()
              }, {
                lat: cPos.lat(),
                lon: cPos.lng()
              }], cPos, DEFAULT_FOCUS_ZOOM);
            });

    createMapControlUI(map, "現在地", "12px", google.maps.ControlPosition.RIGHT_TOP).addEventListener(
            'click', function() {
              fitBoundsAndZoom(map, [{
                lat: cPos.lat(),
                lon: cPos.lng()
              }], cPos, DEFAULT_FOCUS_ZOOM);
            });

  }, function(error) {
    $('#initial-msg').hide();
    if ($('#error-msg-area').is(':hidden')) {
      $('#error-msg-area').show();
    }
    $('.gps-error-msg').show();
    if ($('.compass-error-msg').is(':visible')) {
      $('.error-msg-splitter').show();
    }
    navigator.geolocation.clearWatch(watchID);
    setTimeout(watchCurrentPosition, 5000);
  }, {
    enableHighAccuracy: true,
    timeout: 1000 * 60 * 60 * 2,
    maximumAge: 0,
  });
}

/* 残り距離を表示 */
function showDistance() {
  if (cPos == null || ePos == null) { return; }
  var distance = google.maps.geometry.spherical.computeDistanceBetween(cPos, ePos);
  $("#distance").text(getFormattedDistance(distance));
}

function getFormattedDistance(distance) {
  if (distance >= 1000 * 5) { // 5km以上
    return String(floatFormat(distance / 1000, 1)) + "km";
  } else {
    var distanceStr = String(Math.round(distance));
    if (distanceStr.length >= 4) {
      distanceStr = distanceStr.slice(0, 1) + "," + distanceStr.slice(1, distanceStr.length);
    }
    return distanceStr + "m";
  }
}

function getBrowserOrientation() {
  var orientation;
  if (screen.orientation && screen.orientation.type) {
    orientation = screen.orientation.type;
  } else {
    orientation = screen.orientation || screen.mozOrientation || screen.msOrientation;
  }
  /*
   * 'portait-primary': for (screen width < screen height, e.g. phone, phablet,
   * small tablet) device is in 'normal' orientation for (screen width > screen
   * height, e.g. large tablet, laptop) device has been turned 90deg clockwise
   * from normal
   * 
   * 'portait-secondary': for (screen width < screen height) device has been
   * turned 180deg from normal for (screen width > screen height) device has
   * been turned 90deg anti-clockwise (or 270deg clockwise) from normal
   * 
   * 'landscape-primary': for (screen width < screen height) device has been
   * turned 90deg clockwise from normal for (screen width > screen height)
   * device is in 'normal' orientation
   * 
   * 'landscape-secondary': for (screen width < screen height) device has been
   * turned 90deg anti-clockwise (or 270deg clockwise) from normal for (screen
   * width > screen height) device has been turned 180deg from normal
   */
  return orientation;
}

function onHeadingChange(event) {
  cHeading = event.alpha;
  if (typeof event.webkitCompassHeading !== "undefined") {
    cHeading = event.webkitCompassHeading; // iOS non-standard
  }
  var orientation = getBrowserOrientation();
  if (typeof cHeading == "undefined" || cHeading == null) { // && typeof
    // orientation !=="undefined") {
    if ($('#error-msg-area').is(':hidden')) {
      $('#error-msg-area').show();
    }
    $('.compass-error-msg').show();
    $('#compass-wrapper').hide();
    $('#compass-notice').hide();

    if ($('.gps-error-msg').is(':visible')) {
      $('.error-msg-splitter').show();
    }

  } else {
    $('.compass-error-msg').hide();
    $('.error-msg-splitter').hide();
    if ($('.gps-error-msg').is(':hidden')) {
      $('#error-msg-area').hide();
    }
  }

  // we have a browser that reports device cHeading and orientation
  // what adjustment we have to add to rotation to allow for current device
  // orientation
  var adjustment = 0;
  if (defaultOrientation === "landscape") {
    adjustment -= 90;
  }
  if (typeof orientation !== "undefined") {
    var currentOrientation = orientation.split("-");
    if (defaultOrientation !== currentOrientation[0]) {
      if (defaultOrientation === "landscape") {
        adjustment -= 270;
      } else {
        adjustment -= 90;
      }
    }
    if (currentOrientation[1] === "secondary") {
      adjustment -= 180;
    }
  }

  cHeading += adjustment;
  var userAgent = window.navigator.userAgent.toLowerCase();
  if (userAgent.indexOf('android') >= 0) {
    cHeading = 360 - cHeading;
  }
  while (cHeading < 0)
    cHeading += 360;
  while (cHeading > 360)
    cHeading -= 360;

  showCompass(cHeading);
}

/* コンパスを回転 */
function showCompass(heading) {
  if (cPos == null || ePos == null) { return; }
  $('#compass-wrapper').show();
  $('#compass-notice').show();

  var absoluteAngle = google.maps.geometry.spherical.computeHeading(cPos, ePos);
  // apply rotation to compass
  if (compassElem.css("transform")) {
    compassElem.css("transform", 'rotate(' + (absoluteAngle - heading) + 'deg)');
  } else if (compassElem.css("webkitTransform")) {
    compassElem.css("webkitTransform", 'rotate(' + (absoluteAngle - heading) + 'deg)');
  }
}

/* ローカルストレージにムーブメントを追加する */
function enqueueMovement(pos) {
  var movement = {
    userId: getUserId(),
    lat: pos.coords.latitude,
    lon: pos.coords.longitude,
    accuracy: pos.coords.accuracy,
    altitude: pos.coords.altitude || -1,
    altitudeAccuracy: pos.coords.altitudeAccuracy || -1,
    speed: pos.coords.speed || -1,
    heading: cHeading,
    checkpointGroupId: getCheckpointGroupId(),
    checkpointId: checkpoint.id,
    recordedAt: Date.now(),
  };
  var movements = getMovementQueue();
  movements.push(movement);
  setMovementQueue(movements);
}

/* ローカルストレージから未送信ムーブメントを取得する */
function getMovementQueue() {
  var movements = getItem(KEY_MOVEMENT_LIST);
  return (movements != null) ? JSON.parse(movements) : [];
}

/* ローカルストレージにムーブメントを保存する */
function setMovementQueue(movements) {
  setItem(KEY_MOVEMENT_LIST, JSON.stringify(movements));
}

/* 一定周期で呼び出され，ムーブメントを送信する */
var postMovementsFunc = function() {
  var movements = getMovementQueue();
  var lastMovements = getMovementQueue();
  if (movements.length == 0) { return; }
  removeItem(KEY_MOVEMENT_LIST); // クリア
  new JsonRpcClient(new JsonRpcRequest(getBaseUrl(), "addMovements", [movements], function(data) {
    // console.log(data);
  }, function(data, textStatus, errorThrown) {
    console.error("fail to add movement.");
    console.error(textStatus + ', ' + errorThrown + '. response: ' + JSON.stringify(data));
    console.error('request: ' + JSON.stringify(JSON.stringify(this)));
    // リストア
    var newMovements = lastMovements.concat(getMovementQueue());
    setMovementQueue(newMovements);
  })).rpc();
}
