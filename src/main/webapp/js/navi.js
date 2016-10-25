var checkpoint = getCheckpoint();
document.title = checkpoint.name; // タイトルの変更
var cPos; // 現在地
var cCircle; // 現在地を示す円
var ePos; // チェックポイント
var cHeading; // 絶対角
var map;
var watchID;
var compassElem;
var defaultOrientation;

var POST_MOVEMENT_INTERVAL = 1000 * 10; // msec
var KEY_MOVEMENT_LIST = "movement_list";

window.onload = function() {
  initMap();
}

$(function() {
  showCheckpointInfo();
  $("#current-position").on('click',function() {
    if (!cPos) { return; }
    map.setZoom(17);
    map.setCenter(cPos);
  });
});

// ブラウザがバックグラウンドに一度遷移すると，watchPositionキャンセルされる。
// そこで，フォアグラウンドに戻ってきた際に，リロードする。initMap()だけでも良いが念のため。
// ex.)ホームボタンを押す。
// ex.)電源ボタンを押す。
// ex.)通知より，別のアプリを起動する。
var lastChecked = new Date().getTime();
setInterval(function() {
  var now = new Date().getTime();
  if (now - lastChecked > 1000 * 10) {
    location.reload();
  }
  lastChecked = now;
}, 1000 * 5);

$(function() {
  $("#activity-title").text(checkpoint.name + "でのアクティビティ");
  $("#btn-next").on('click',function() {
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
      var elem = $('<div class="item">' + '<span class="time">' + toFormattedShortDate(a.created)
              + '</span>' + '<span class="name">' + a.userId + '</span>' + 'さんがチェックインしました．'
              + '</div>');
      $('#notification').prepend(elem);
    }
  };
  return {
    abort: function() {
      connection.close();
    }
  };
}

function createCenterControlUI(controlDiv, map) {

  // Set CSS for the control border.
  var controlUI = document.createElement('div');
  controlUI.style.backgroundColor = '#fff';
  controlUI.style.border = '2px solid #fff';
  controlUI.style.borderRadius = '3px';
  controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
  controlUI.style.cursor = 'pointer';
  controlUI.style.marginBottom = '22px';
  controlUI.style.textAlign = 'center';
  controlUI.title = 'Click to recenter the map';
  controlDiv.appendChild(controlUI);

  // Set CSS for the control interior.
  var controlText = document.createElement('div');
  controlText.style.color = 'rgb(25,25,25)';
  controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
  controlText.style.fontSize = '14px';
  controlText.style.lineHeight = '38px';
  controlText.style.paddingLeft = '5px';
  controlText.style.paddingRight = '5px';
  controlText.innerHTML = '目的地と現在地を表示';
  controlUI.appendChild(controlText);

  return controlUI;
}

function initMap() {

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
    // minZoom: 12,
    // maxZoom: 20,
    zoom: 18
  });
  // マーカーの追加
  var marker = new google.maps.Marker({
    position: center,
    map: map,
  });
  // マーカータップ時のバルーンの初期化
  var infoWindow = new google.maps.InfoWindow({
    content: checkpoint.balloon
  });
  infoWindow.open(marker.getMap(), marker);

  google.maps.event.addListener(infoWindow, "closeclick", function() {
    google.maps.event.addListenerOnce(marker, "click", function(event) {
      infoWindow.open(map, marker);
    });
  });

  var centerControlDiv = document.createElement('div');
  var centerControlUI = createCenterControlUI(centerControlDiv, map);
  centerControlDiv.index = 1;
  map.controls[google.maps.ControlPosition.TOP_RIGHT].push(centerControlDiv);

  centerControlUI.addEventListener('click', function() {
    updateMapZoomLevelAndCenter();
    infoWindow.open(map, marker);
  });

  // 目的地の設定&位置情報の連続取得
  ePos = new google.maps.LatLng(checkpoint.lat, checkpoint.lon);
  watchCurrentPosition();
}

/* 位置情報を連続取得する */
function watchCurrentPosition() {
  if (!navigator || !navigator.geolocation) {
    if ($('#error-msg-area').is(':hidden')) {
      $('#error-msg-area').show();
    }
    $('#gps-error-msg').show();
    if ($('#compass-error-msg').is(':visible')) {
      $('#error-msg-splitter').show();
    }
  }
  watchID = window.navigator.geolocation.watchPosition(function(pos) {
    cPos = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
    console.log("currentPosition: " + pos.coords.latitude + ", " + pos.coords.longitude);
    showDistance();
    enqueueMovement(pos);
    updateCurrentCircle(pos.coords.accuracy);
    $('#gps-error-msg').hide();
    $('#error-msg-splitter').hide();
    if ($('#compass-error-msg').is(':hidden')) {
      $('#error-msg-area').hide();
    }
  }, function(error) {
    if ($('#error-msg-area').is(':hidden')) {
      $('#error-msg-area').show();
    }
    $('#gps-error-msg').show();
    if ($('#compass-error-msg').is(':visible')) {
      $('#error-msg-splitter').show();
    }
    navigator.geolocation.clearWatch(watchID);
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
    $('#compass-error-msg').show();
    if ($('#gps-error-msg').is(':visible')) {
      $('#error-msg-splitter').show();
    }

  } else {
    $('#compass-error-msg').hide();
    $('#error-msg-splitter').hide();
    if ($('#gps-error-msg').is(':hidden')) {
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
    date: new Date(),
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

/* マップのズームレベルと中央位置を調整 */
function updateMapZoomLevelAndCenter() {
  var minLat, maxLat, minLng, maxLng;
  if (cPos.lat() > ePos.lat()) {
    minLat = ePos.lat();
    maxLat = cPos.lat();
  } else {
    minLat = cPos.lat();
    maxLat = ePos.lat();
  }
  if (cPos.lng() > ePos.lng()) {
    minLng = ePos.lng();
    maxLng = cPos.lng();
  } else {
    minLng = cPos.lng();
    maxLng = ePos.lng();
  }
  // 全てのマーカーが入るように縮尺を調整
  var sw = {
    lat: minLat,
    lng: minLng
  };
  var ne = {
    lat: maxLat,
    lng: maxLng
  };
  var latlngBounds = new google.maps.LatLngBounds(sw, ne);
  map.fitBounds(latlngBounds);
}

function updateCurrentCircle(accuracy) {
  if (cCircle != null) {
    cCircle.setMap(null);
  }
  cCircle = drawCurrentLocationCircle(map, cPos, accuracy);
}

function showCheckpointInfo() {
  var imgSrc = checkpoint.imgSrc == null ? "../img/placeholder.svg" : "../img/" + checkpoint.imgSrc;
  var html = '<div class="row checkpoint">'
          + '<i class="fa fa-check-square" aria-hidden="true"></i>' + '<img src="' + imgSrc
          + '" class="img-responsive img col-xs-3 col-sm-3 col-md-2 col-lg-2">'
          + '<div class="col-xs-9 col-sm-9 col-md-10 col-lg-10 description">' + '<p class="name">'
          + checkpoint.name + '</p>' + checkpoint.label
          + '<br/><p style="word-break: break-word;">' + (checkpoint.description || "") + '</p>'
          + '</div>' + '</div>';
  $('#checkpoint').append(html);
}
