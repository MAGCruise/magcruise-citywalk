if (!getCheckpointGroupId()) {
  location.href = "courses.html";
}

var DEFAULT_FOCUS_ZOOM = 17;

var map = null;
var markers = []; // マーカーs
var infoWindow = null; // バルーン
var checkpoints = [];
var cPos = null; // 現在地
var selectedCheckpoint;
var category = getParam("category");
var subcategory = getParam("subcategory");
var locationsAccuracy = 10;
var enableGps = false;

window.onload = function() {
  function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
      mapTypeControl: false,
      streetViewControl: false,
      scaleControl: true,
      scaleControlOptions: {
        position: google.maps.ControlPosition.BOTTOM_LEFT
      }
    });

    // マップをドラッグした場合は，チェックポイントを非選択に
    google.maps.event.addListener(map, "dragend", function() {
      unselectCheckpoint();
    });

    var currentPositionMarker = new GeolocationMarker();
    currentPositionMarker.setCircleOptions({
      fillColor: '#C2D3E3'
    });
    currentPositionMarker.setMap(map);

    getCurrentPositionAndUpdateViews();
  }

  initMap();
}

function updateCheckpointListHeight() {
  var height = window.innerHeight - $("#checkpoints").offset().top + 15;
  if (height > 280) {
    $("#checkpoints").css("max-height", height + "px");
  }
}

$(function() {
  updateCheckpointListHeight();
  setInterval(updateCheckpointListHeight, 500);

  $(window).on('hashchange', function() {
    if (getParam("no-refresh")) {
      memorizeHistory();
      setForward();
      return;
    }
    category = getParam("category");
    subcategory = getParam("subcategory");
    updateViews();
    memorizeHistory();
    setForward();
  });

  unselectCheckpoint();
  $("#current-position").on('click', function() {
    if (!cPos) { return; }
    map.setZoom(DEFAULT_FOCUS_ZOOM);
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
  $("#nav-start").hide();
  $(".checkpoint").removeClass("selected");

  loadCheckpoints();

  initMarkers();

  initBreadCrumb();
  showList();

  if (map && getParam("selected-id")) {
    selectCheckpoint(getCheckpoint(getParam("selected-id")));
  }
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
  var topElem = $('<span>カテゴリ: </span><a class="btn btn-sm btn-success">TOP</a>');
  $("#breadcrumb").append(topElem);
  topElem.on('click', function() {
    category = null;
    subcategory = null;
    unselectCheckpoint();
    location.href = "./checkpoints.html#";
  });
  // カテゴリ
  if (category) {
    var categoryElem = $('<span> &gt; </span><a class="btn btn-sm btn-success">' + category
            + '</a>');
    categoryElem.on('click', function() {
      subcategory = null;
      unselectCheckpoint();
      location.href = "./checkpoints.html#" + "?category=" + encodeURIComponent(category);
    });
    $("#breadcrumb").append(categoryElem);
  }
  // サブカテゴリ
  if (subcategory) {
    var subCategoryElem = $('<span> &gt; </span><a class="btn btn-sm btn-success">' + subcategory
            + '</a>');
    $("#breadcrumb").append(subCategoryElem);
    categoryElem.on('click', function() {
      unselectCheckpoint();
      location.href = "./checkpoints.html#" + "?category=" + encodeURIComponent(category)
              + "&subcategory=" + encodeURIComponent(subcategory);
    });

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

    var imgSrc = checkpoint.imgSrc == null ? "../img/placeholder.svg" : checkpoint.imgSrc;
    imgSrc = checkpoint.imgSrc.indexOf("http") == -1 ? "../" + imgSrc : imgSrc;

    var elem = $('<div class="row">' + '<div class="col-sm-12">'
            + '<div class="checkpoint" id="checkpoint-' + checkpoint.id + '">'
            + '<div class="pull-left distance ' + distanceStyle + '">'
            + (enableGps ? getFormattedDistance(distance) : "?m") + '</div>' + '<img src="'
            + imgSrc + '" class="pull-left checkpoint-img">' + '<div class="text">'
            + '<div class="name">' + checkpoint.name + '</div>' + '<div class="detail">' + '<div>'
            + checkpoint.place + '</div>' + checkpoint.label + '</div></div></div></div></div>');
    elem.on('click', function() {
      selectCheckpoint(checkpoint);
    });
    $("#checkpoints").append(elem);
  });
}

function makeListElemWithoutDistanceAndImage(name) {
  return $('<div class="row">' + '<div class="col-sm-12">' + '<div class="checkpoint">'
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
      location.href = "./checkpoints.html#" + "?category=" + encodeURIComponent(category)
              + "&subcategory=" + encodeURIComponent(subcategory);
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
      location.href = "./checkpoints.html#" + "?category=" + encodeURIComponent(category);
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

  var imgSrc = checkpoint.imgSrc == null ? "../img/placeholder.svg" : checkpoint.imgSrc;
  imgSrc = checkpoint.imgSrc.indexOf("http") == -1 ? "../" + imgSrc : imgSrc;

  // マーカータップ時のバルーンの初期化
  infoWindow = new google.maps.InfoWindow({
    content: "<span class='green'>" + checkpoint.name + "</span> (" + checkpoint.place + ")"
            + "<br><span class='balloon-description'>カテゴリ： </span>" + '<a href="'
            + "./checkpoints.html#" + "?category=" + encodeURIComponent(checkpoint.category)
            + "&selected-id=" + encodeURIComponent(checkpoint.id) + '">' + checkpoint.category
            + "</a>" + '<img src="' + imgSrc
            + '" class="pull-right checkpoint-img" style="max-width: 70px;margin-left: 2em;">'
            + "<div class='balloon-description'>" + checkpoint.label + "</div>"
  });

  var marker = markers.filter(function(marker) {
    return marker.checkpointId === checkpoint.id;
  })[0];
  infoWindow.open(marker.getMap(), marker);

  $(".checkpoint").removeClass("selected");
  $("#checkpoint-" + checkpoint.id).addClass("selected");

  $("#selected-checkpoint-description").remove();
  $("#nav-start-in-list").remove();
  $(".checkpoint.selected .detail").append(
          $("<p>").attr("id", "selected-checkpoint-description").html(checkpoint.description))
          .append('<a id="nav-start-in-list" class="btn btn-success btn-sm">ここに行く</a>');

  $(document).on('click', "#nav-start-in-list", function() {
    $("#nav-start").trigger('click');
  });

  $("#nav-start").show();
  switch (getMaxCategoryDepth()) {
  case 0:
    location.href = "./checkpoints.html#" + "&selected-id=" + encodeURIComponent(checkpoint.id)
            + "&no-refresh=true";
    break;
  case 1:
    location.href = "./checkpoints.html#" + "?category=" + encodeURIComponent(checkpoint.category)
            + "&selected-id=" + encodeURIComponent(checkpoint.id) + "&no-refresh=true";
    break;
  default:
    location.href = "./checkpoints.html#" + "?category=" + encodeURIComponent(checkpoint.category)
            + "&subcategory=" + encodeURIComponent(checkpoint.subcategory) + "&selected-id="
            + encodeURIComponent(checkpoint.id) + "&no-refresh=true";
  }

}

/* チェックポイント非選択処理 */
function unselectCheckpoint() {
  closeInfoWindow();
  $(".checkpoint").removeClass("selected");
  $("#nav-start").hide();
  selectedCheckpoint = null;
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
    fitBoundsAndZoom(map, [], cPos, DEFAULT_FOCUS_ZOOM);
    $('#gps-error-msg').hide();

    createMapControlUI(map, "チェックポイント周辺", "12px", google.maps.ControlPosition.RIGHT_TOP)
            .addEventListener('click', function() {
              fitBoundsAndZoom(map, getNonVisitedCheckPoints(), cPos, DEFAULT_FOCUS_ZOOM);
            });
  }, function(error) {
    enableGps = false;
    cPos = new google.maps.LatLng(35.71079167, 139.7193);
    updateViews();
    $('#gps-error-msg').show();
    fitBoundsAndZoom(map, getNonVisitedCheckPoints(), cPos, DEFAULT_FOCUS_ZOOM);
  }, {
    enableHighAccuracy: true,
    timeout: 1000 * 60,
    maximumAge: 0,
  });
}
