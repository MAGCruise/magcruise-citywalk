var compassElem;
var defaultOrientation; // 端末の向き(landscape,portrait)を取得
var cHeading; // 絶対角

$(function() {
  var compassElem = $("#compass");
  defaultOrientation = (screen.width > screen.height) ? "landscape" : "portrait";

  // 電子コンパスイベントの取得
  window.addEventListener("deviceorientation", onHeadingChange);
});

/**
 * 'portait-primary': for (screen width < screen height, e.g. phone, phablet,
 * small tablet) device is in 'normal' orientation for (screen width > screen
 * height, e.g. large tablet, laptop) device has been turned 90deg clockwise
 * from normal 'portait-secondary': for (screen width < screen height) device
 * has been turned 180deg from normal for (screen width > screen height) device
 * has been turned 90deg anti-clockwise (or 270deg clockwise) from normal
 * 'landscape-primary': for (screen width < screen height) device has been
 * turned 90deg clockwise from normal for (screen width > screen height) device
 * is in 'normal' orientation 'landscape-secondary': for (screen width < screen
 * height) device has been turned 90deg anti-clockwise (or 270deg clockwise)
 * from normal for (screen width > screen height) device has been turned 180deg
 * from normal
 */
function getBrowserOrientation() {
  var orientation;
  if (screen.orientation && screen.orientation.type) {
    orientation = screen.orientation.type;
  } else {
    orientation = screen.orientation || screen.mozOrientation || screen.msOrientation;
  }

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

/* 一定周期で呼び出され，ムーブメントを送信する */
var postMovementsFunc = function() {
  var movements = getItems(KEY_MOVEMENT_LIST);
  if (movements.length == 0) { return; }
  removeItem(KEY_MOVEMENT_LIST); // クリア
  new JsonRpcClient(new JsonRpcRequest(getBaseUrl(), "addMovements", [movements], function(data) {
    // console.log(data);
  }, function(data, textStatus, errorThrown) {
    // リストア
    setItems(KEY_MOVEMENT_LIST, movements.concat(getItems(KEY_MOVEMENT_LIST)));
  })).rpc();
}
