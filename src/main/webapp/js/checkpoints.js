if (!getCheckpointGroupId()) {
  location.href = "courses.html";
}

var MAX_ZOOM_LEVEL = 17;

var map = null;
var markers = []; // マーカーs
var infoWindow = null; // バルーン
var checkpoints = [];
var cPos = null;
; // 現在地
var selectedCheckpoint;
var category = getParam("category");
var subcategory = getParam("subcategory");
var locationsAccuracy = 10;
var enableGps = false;
window.onload = function() {
  initMap();
}

$(function() {
  $(window).on('hashchange', function() {
    category = getParam("category");
    subcategory = getParam("subcategory");
    updateViews();
  });

  unselectCheckpoint();
  $("#current-position").on('click', function() {
    if (!cPos) { return; }
    map.setZoom(17);
    map.setCenter(cPos);
  });
  $("#nav-start").on('click', function() {
    if (!selectedCheckpoint) {
      alert("チェックポイントが選択されていません");
      return;
    }
    location.href = "./navi.html?checkpoint_id=" + selectedCheckpoint.id;
  });
});

function updateViews() {
  loadCheckpoints();

  initMarkers();
  // 現在地の表示
  drawCurrentLocationCircle(map, cPos, locationsAccuracy);
  // マップの表示位置とズームレベルの調整
  fitMapPositionAndZoomLevel();

  initBreadCrumb();
  showList();
}

function loadCheckpoints() {
  // 未訪問チェックポイントデータをLocalStorageより取得
  checkpoints = getNonVisitedCheckPoints();
  if (category) {
    checkpoints = checkpoints.filter(function(checkpoint) {
      return checkpoint.category == category;
    });
  }
  if (subcategory) {
    checkpoints = checkpoints.filter(function(checkpoint) {
      return checkpoint.subcategory == subcategory;
    });
  }
}

function initBreadCrumb() {
  $("#breadcrumb").empty();

  // トップ
  var topElem = $('<span>カテゴリ：</span><span class="link">TOP</span>');
  $("#breadcrumb").append(topElem);
  topElem.on('click', function() {
    category = null;
    subcategory = null;
    location.href = "./checkpoints.html#";
  });
  // カテゴリ
  if (category) {
    var categoryElem = $('<span> > ' + category + '</span>');
    if (subcategory) {
      categoryElem.addClass('link');
      categoryElem.on('click', function() {
        subcategory = null;
        location.href = "./checkpoints.html#" + "?category=" + category;
      });
    }
    $("#breadcrumb").append(categoryElem);
  }
  // サブカテゴリ
  if (subcategory) {
    $("#breadcrumb").append($('<span> > ' + subcategory + '</span>'));
  }
  $("#breadcrumb").show();
}

function showList() {
  $("#checkpoints").empty();
  switch (getMaxCategoryDepth()) {
  case 0:
    showCheckpoints();
    break;
  case 1:
    if (category) {
      showCheckpoints();
    } else {
      showCategory();
    }
    break;
  default:
    if (category && subcategory) {
      showCheckpoints();
    } else if (category) {
      showSubcategory();
    } else {
      showCategory();
    }
  }
}

/* チェックポイントリストの表示 */
function showCheckpoints() {
  checkpoints.forEach(function(checkpoint, i) {
    var ePos = new google.maps.LatLng(checkpoint.lat, checkpoint.lon);
    var distance = google.maps.geometry.spherical.computeDistanceBetween(cPos, ePos);
    var distanceStyle = (distance > 1000) ? "far" : "near";
    var imgSrc = checkpoint.imgSrc == null ? "../img/placeholder.svg" : "../img/"
            + checkpoint.imgSrc;

    var elem = $('<div class="row">' + '<div class="col-sm-12 no-padding">'
            + '<div class="checkpoint" id="checkpoint-' + checkpoint.id + '">'
            + '<div class="pull-left distance ' + distanceStyle + '">'
            + (enableGps ? getFormattedDistance(distance) : "?m") + '</div>' + '<img src="'
            + imgSrc + '" class="pull-left checkpoint-img">' + '<div class="text">'
            + '<div class="name">' + checkpoint.name + '</div>' + '<div class="detail">' + '<div>'
            + checkpoint.balloon + '</div>' + checkpoint.label + '</div></div></div></div></div>');
    elem.on('click', function() {
      selectCheckpoint(checkpoint);
    });
    $("#checkpoints").append(elem);
  });
}

function makeListElemWithoutDistanceAndImage(name) {
  return $('<div class="row">' + '<div class="col-sm-12 no-padding">' + '<div class="checkpoint">'
          + '<div class="text">' + '<div class="name">' + name + '</div></div></div></div></div>');
}

/* サブカテゴリの表示 */
function showSubcategory() {
  // カテゴリでフィルタ，サブカテゴリ名を抽出，ユニークに
  var names = checkpoints.filter(function(checkpoint) {
    return checkpoint.category = category;
  }).map(function(checkpoint) {
    return checkpoint.subcategory;
  }).filter(function(subcategory, index, self) {
    return self.indexOf(subcategory) === index;
  });
  names.forEach(function(name, i) {
    var elem = makeListElemWithoutDistanceAndImage(name);
    elem.on('click', function() {
      subcategory = name;
      location.href = location.href + "&subcategory=" + encodeURIComponent(name);
    });
    $("#checkpoints").append(elem);
  });
}

/* カテゴリの表示 */
function showCategory() {
  // カテゴリ名を抽出，ユニークに
  var names = checkpoints.map(function(checkpoint) {
    return checkpoint.category;
  }).filter(function(category, index, self) {
    return self.indexOf(category) === index;
  });
  names.forEach(function(name, i) {
    var elem = makeListElemWithoutDistanceAndImage(name);
    elem.on('click', function() {
      category = name;
      location.href = "./checkpoints.html#" + "?category=" + encodeURIComponent(name);
    });
    $("#checkpoints").append(elem);
  });
}

/* 15685->15km, 1576->1.6km, 165->165m */
function getFormattedDistance(distance) {
  if (distance >= 1000 * 10) { // 10km以上
    return String(Math.round(distance / 1000)) + "km";
  } else if (distance >= 1000) { // 1km以上
    return String(floatFormat(distance / 1000, 1)) + "km";
  } else { // 1km以内
    return String(Math.round(distance)) + "m";
  }
}

/* 全てのマーカーバルーンを閉じる */
function closeInfoWindow() {
  if (infoWindow != null) {
    infoWindow.close();
  }
}

function initMap() {
  if (map == null) {
    map = new google.maps.Map(document.getElementById('map'), {
      center: {
        lat: 0.0,
        lng: 0.0
      },
      // zoom: 8
      mapTypeControl: false,
      streetViewControl: false,
      scaleControl: true,
      scaleControlOptions: {
        position: google.maps.ControlPosition.BOTTOM_LEFT
      }
    });
  }

  // マップをドラッグした場合は，チェックポイントを非選択に
  google.maps.event.addListener(map, "dragend", function() {
    unselectCheckpoint();
  });
  getCurrentPositionAndUpdateViews();
}

function initMarkers() {
  // マーカーの削除
  markers.forEach(function(marker) {
    marker.setMap(null);
  });
  markers = [];
  checkpoints.forEach(function(checkpoint, i) {
    // マーカーの追加
    var marker = new google.maps.Marker({
      position: {
        lat: checkpoint.lat,
        lng: checkpoint.lon
      },
      map: map,
      icon: "//maps.google.com/mapfiles/ms/icons/" + checkpoint.markerColor + "-dot.png",
      checkpointId: checkpoint.id
    });
    marker.addListener('click', function() {
      selectCheckpoint(checkpoint);
    });
    markers.push(marker);
  });
}

/* チェックポイント選択処理 */
function selectCheckpoint(checkpoint) {
  selectedCheckpoint = checkpoint;
  closeInfoWindow();

  // マーカータップ時のバルーンの初期化
  infoWindow = new google.maps.InfoWindow({
    content: checkpoint.name + "<br>(" + checkpoint.balloon + ")"
  });
  var marker = markers.filter(function(marker) {
    return marker.checkpointId === checkpoint.id;
  })[0];
  infoWindow.open(marker.getMap(), marker);

  map.setZoom(MAX_ZOOM_LEVEL);
  map.setCenter(marker.getPosition());
  $(".checkpoint").removeClass("selected");
  $("#checkpoint-" + checkpoint.id).addClass("selected");
  $("#selected-checkpoint-description").remove();
  $(".checkpoint.selected .detail").append(
          $("<p>").attr("id", "selected-checkpoint-description").html(checkpoint.description));
  $("#nav-start").show();
}

/* チェックポイント非選択処理 */
function unselectCheckpoint() {
  closeInfoWindow();
  $(".checkpoint").removeClass("selected");
  $("#nav-start").hide();
}

function getCurrentPositionAndUpdateViews() {
  if (!navigator || !navigator.geolocation) {
    $('#gps-error-msg').show();
    enableGps = false;
  }
  navigator.geolocation.getCurrentPosition(function(pos) { // success
    enableGps = true;
    cPos = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
    console.log("currentPosition: " + pos.coords.latitude + ", " + pos.coords.longitude);
    locationAccuracy = pos.coords.accuracy;
    updateViews();
    $('#gps-error-msg').hide();
  }, function(error) {
    enableGps = false;
    cPos = new google.maps.LatLng(35.71079167, 139.7193);
    updateViews();
    $('#gps-error-msg').show();
  }, {
    enableHighAccuracy: true,
    timeout: 1000 * 60,
    maximumAge: 0,
  });
}

function fitMapPositionAndZoomLevel() {
  var maxLat = minLat = cPos.lat();
  var maxLon = minLon = cPos.lng();

  checkpoints.forEach(function(checkpoint, i) {
    // 最大最小緯度経度の計算
    if (maxLat < checkpoint.lat) maxLat = checkpoint.lat;
    if (minLat > checkpoint.lat) minLat = checkpoint.lat;
    if (maxLon < checkpoint.lon) maxLon = checkpoint.lon;
    if (minLon > checkpoint.lon) minLon = checkpoint.lon;
  });

  // 全てのマーカーが入るように縮尺を調整
  var sw = {
    lat: minLat,
    lng: minLon
  };
  var ne = {
    lat: maxLat,
    lng: maxLon
  };
  var latlngBounds = new google.maps.LatLngBounds(sw, ne);
  map.fitBounds(latlngBounds);
  // 最小ズームレベルの調整
  var listener = google.maps.event.addListener(map, "idle", function() {
    if (map.getZoom() > MAX_ZOOM_LEVEL) map.setZoom(MAX_ZOOM_LEVEL);
    google.maps.event.removeListener(listener);
  });
}
