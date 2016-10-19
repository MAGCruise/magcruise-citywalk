var MAX_ZOOM_LEVEL = 17;

var map = null;
var markers = []; // マーカーs
var infoWindow = null; // バルーン
var checkpoints = [];
var cPos = null; // 現在地
var selectedCheckpoint;
var category = null;
var subcategory = null;
var locationsAccuracy = 10;

window.onload = function() {
  initMap();
}

$(function() {
  if (!document.referrer || document.referrer.indexOf("/task-") != -1) {
    $("#back").hide();
  }
  unselectCheckpoint();
  $("#current-position").click(function() {
    if (!cPos) { return; }
    map.setZoom(17);
    map.setCenter(cPos);
  });
  $("#nav-start").click(function() {
    if (!selectedCheckpoint) {
      alert("チェックポイントが選択されていません。");
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

  if (category == null && subcategory == null) {
    $("#breadcrumb").hide();
    return;
  }

  // トップ
  var topElem = $('<span class="link">TOP</span>');
  $("#breadcrumb").append(topElem);
  topElem.click(function() {
    category = null;
    subcategory = null;
    updateViews();
  });
  // カテゴリ
  if (category) {
    var categoryElem = $('<span> > ' + category + '</span>');
    if (subcategory) {
      categoryElem.addClass('link');
      categoryElem.click(function() {
        subcategory = null;
        updateViews();
      });
    } else {

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
  if (category && subcategory) {
    showCheckpoints();
  } else if (category) {
    showSubcategory();
  } else {
    showCategory();
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

    var elem = $('<div class="checkpoint" id="checkpoint-' + checkpoint.id + '">'
            + '<span class="pull-left distance ' + distanceStyle + '">'
            + getFormattedDistance(distance) + '</span>' + '<img src="' + imgSrc
            + '" class="pull-left checkpoint-img">' + '<div class="text">' + '<div class="name">'
            + checkpoint.name + '</div>' + '<div class="detail">' + checkpoint.label + '</div>'
            + '</div>' + '</div>');
    elem.click(function() {
      selectCheckpoint(checkpoint);
    });
    $("#checkpoints").append(elem);
  });
}

function makeListElemWithoutDistanceAndImage(name) {
  return $('<div class="checkpoint">' + '<div class="text">' + '<div class="name">' + name
          + '</div>' + '</div>' + '</div>');
}

/* サブカテゴリの表示 */
function showSubcategory() {
  // カテゴリでフィルタ、サブカテゴリ名を抽出、ユニークに
  var names = checkpoints.filter(function(checkpoint) {
    return checkpoint.category = category;
  }).map(function(checkpoint) {
    return checkpoint.subcategory;
  }).filter(function(subcategory, index, self) {
    return self.indexOf(subcategory) === index;
  });
  names.forEach(function(name, i) {
    var elem = makeListElemWithoutDistanceAndImage(name);
    elem.click(function() {
      subcategory = name;
      updateViews();
    });
    $("#checkpoints").append(elem);
  });
}

/* カテゴリの表示 */
function showCategory() {
  // カテゴリ名を抽出、ユニークに
  var names = checkpoints.map(function(checkpoint) {
    return checkpoint.category;
  }).filter(function(category, index, self) {
    return self.indexOf(category) === index;
  });
  names.forEach(function(name, i) {
    var elem = makeListElemWithoutDistanceAndImage(name);
    elem.click(function() {
      category = name;
      updateViews();
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

  // マップをドラッグした場合は、チェックポイントを非選択に
  google.maps.event.addListener(map, "dragend", function() {
    unselectCheckpoint();
  });
  if (cPos == null) {
    // 現在地取得し、チェックポイントリストを表示
    getCurrentPosition();
  } else {
    updateViews();
  }
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
    content: checkpoint.balloon
  });
  var marker = markers.filter(function(marker) {
    return marker.checkpointId === checkpoint.id;
  })[0];
  infoWindow.open(marker.getMap(), marker);

  map.setZoom(MAX_ZOOM_LEVEL);
  map.setCenter(marker.getPosition());
  $(".checkpoint").removeClass("selected");
  $("#checkpoint-" + checkpoint.id).addClass("selected");
  $("#nav-start").show();
}

/* チェックポイント非選択処理 */
function unselectCheckpoint() {
  closeInfoWindow();
  $(".checkpoint").removeClass("selected");
  $("#nav-start").hide();
}

function getCurrentPosition() {
  if (!navigator || !navigator.geolocation) {
    alert('GPSが使用できません');
  }
  navigator.geolocation.getCurrentPosition(function(pos) { // success
    cPos = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
    console.log("currentPosition: " + pos.coords.latitude + ", " + pos.coords.longitude);
    locationAccuracy = pos.coords.accuracy;
    updateViews();
  }, function(error) {
    alert('位置情報の取得に失敗しました');
  }, {
    enableHighAccuracy: true,
    timeout: 1000 * 60,
    maximumAge: 1000 * 60,
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
