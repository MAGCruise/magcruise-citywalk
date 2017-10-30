if (!getCourseId()) {
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
var sorted = false;

window.onload = function() {
  $('#btn-add-checkpoint').click(function() {
    location.href = "add-checkpoint.html" + "?lat=" + cPos.lat() + "&lon=" + cPos.lng();
  });
  function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
      center: new google.maps.LatLng(34.995782, 135.766918),
      mapTypeControl: false,
      streetViewControl: false,
      scaleControl: true,
      scaleControlOptions: {
        position: google.maps.ControlPosition.BOTTOM_LEFT
      }
    });

    fitBoundsAndZoom(map, getCheckpoints(), null, DEFAULT_FOCUS_ZOOM);

    google.maps.event.addListener(map, "click", function() {
      $("#map-box").css("height", (window.innerHeight - $("#map-box").offset().top - 160) + "px");
      google.maps.event.trigger(map, "resize");
    });

    $("#checkpoints").on("click", function() {
      var height = $("#map-box").css("height", (window.innerHeight / 4) + "px");
      height = height > 200 ? height : 200;
      $("#map-box").css("height", height + "px");
      google.maps.event.trigger(map, "resize");
      updateCheckpointListHeight(200);
    });

    var currentPositionMarker = new GeolocationMarker();
    currentPositionMarker.setCircleOptions({
      fillColor: '#C2D3E3'
    });
    currentPositionMarker.setMap(map);
    getCurrentPositionAndUpdateViews();
  }
  showReward();

  setTimeout(initMap, 300);
}

function showReward() {
  var msg = getRewardMessage();
  if (msg.length == 0) { return; }
  var info = $('<div>').html(msg);
  $('#notification-msg-area').append(info);
  $('#notification-msg-area').slideDown(500);
  setTimeout(function() {
    $('#notification-msg-area').slideUp(500)
    setTimeout(function() {
      info.remove();
      clearRewardMessage();
    }, 500);
  }, 12000);
}

function updateCheckpointListHeight(maxHeight) {
  var height = window.innerHeight - $("#checkpoints").offset().top + 15;
  if (height > maxHeight) {
    $("#checkpoints").css("max-height", height + "px");
  }
}

$(function() {
  updateInitialDataIfNeeded(getCourseId());
  updateCheckpointListHeight(280);

  setCategoryDepth(getCategoryDepth() <= getMaxCategoryDepth() ? getCategoryDepth()
          : getMaxCategoryDepth());

  switch (getMaxCategoryDepth()) {
  case 0:
    $('#category-depth option[value=1]').remove();
    $('#category-depth option[value=2]').remove();
    break;
  case 1:
    $('#category-depth option[value=2]').remove();
    break;
  default:
  }

  $('#category-depth').val(getCategoryDepth());
  $('#category-depth').on(
          'change',
          function() {
            setCategoryDepth($(this).val() <= getMaxCategoryDepth() ? $(this).val()
                    : getMaxCategoryDepth());

            switch (getCategoryDepth()) {
            case 0:
              category = null;
              subcategory = null;
              break;
            case 1:
              subcategory = null;
              break;
            default:
            }
            updateViews();
          });

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
  $("#nav-start").on(
          'click',
          function() {
            if (!selectedCheckpoint) {
              alert("チェックポイントが選択されていません");
              return;
            }
            var naviFrom;
            switch (getCategoryDepth()) {
            case 0:
              naviFrom = "distance";
              break;
            case 1:
              naviFrom = "category"
              break;
            case 2:
              naviFrom = "subcategory"
              break;
            default:
              naviFrom = "unknown";
            }
            location.href = "./navi.html?checkpoint_id=" + selectedCheckpoint.id + "&navi_from="
                    + naviFrom;
            ;
          });
});

function updateViews() {
  $("#nav-start").hide();
  $(".checkpoint").removeClass("selected");
  updateTitle();

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
  function snipBread(word) {
    return (word.length <= 4 ? word : word.substring(0, 3) + "...")
  }

  $("#breadcrumb").empty();

  // トップ
  var topElem = $('<a class="btn btn-success">TOP</a>');
  $("#breadcrumb").append(topElem);
  topElem.on('click', function() {
    category = null;
    subcategory = null;
    unselectCheckpoint();
    location.href = "./checkpoints.html#";
  });
  // カテゴリ
  if (category) {
    var categoryElem = $('<span> &gt; </span><a class="btn btn-success">' + snipBread(category)
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
    var subCategoryElem = $('<span> &gt; </span><a class="btn btn-success">'
            + snipBread(subcategory) + '</a>');
    $("#breadcrumb").append(subCategoryElem);
    subCategoryElem.on('click', function() {
      unselectCheckpoint();
      location.href = "./checkpoints.html#" + "?category=" + encodeURIComponent(category)
              + "&subcategory=" + encodeURIComponent(subcategory);
    });
  }
  $("#breadcrumb").show();
}

function updateTitle() {
  if (category && subcategory) {
    document.title = subcategory;
  } else if (category) {
    document.title = category;
  } else {
    document.title = "Checkpoints";
  }
  setNavTitle();
}

function showList() {
  $("#checkpoints").empty();
  switch (getCategoryDepth()) {
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
  if (enableGps && navigator.onLine && cPos) {
    var checkpointIds = [];
    checkpoints.forEach(function(e) {
      checkpointIds.push(e.id);
    });
    new JsonRpcClient(new JsonRpcRequest(getBaseUrl(), "getCheckpointIdsOrderedByDistance", [
        cPos.lat(), cPos.lng(), getCourseId(), getLanguage(), checkpointIds], function(data) {
      if (data.result && data.result.length == checkpoints.length) {
        var tmp = [];
        data.result.forEach(function(e) {
          checkpoints.forEach(function(c) {
            if (c.id === e) {
              tmp.push(c);
              return;
            }
          });
        });
        checkpoints = tmp;
      }
      drawCheckpoints();
    })).rpc();
  } else {
    drawCheckpoints();
  }
}

function drawCheckpoints() {
  checkpoints.forEach(function(checkpoint, i) {
    var ePos = new google.maps.LatLng(checkpoint.lat, checkpoint.lon);
    var distance = google.maps.geometry.spherical.computeDistanceBetween(cPos, ePos);
    var distanceStyle = (distance > 1000) ? "far" : "near";

    var imgSrc = checkpoint.imgSrc == null ? "img/placeholder.svg" : checkpoint.imgSrc;
    imgSrc = checkpoint.imgSrc.indexOf("http") == -1 ? "../" + imgSrc : imgSrc;

    var elem = $('<div class="row">' + '<div class="col-sm-12">'
            + '<div class="checkpoint" id="checkpoint-'
            + checkpoint.id
            + '">'
            + '<div class="pull-left distance '
            + distanceStyle
            + '">'
            + (enableGps ? getFormattedDistance(distance) : "?m")
            + '</div>'
            + '<img src="'
            + imgSrc
            + '" class="pull-left checkpoint-img">'
            + '<div class="text">'
            + '<div class="name">'
            + checkpoint.name
            + '</div>'
            + '<div class="detail">'
            + '<div>'
            + checkpoint.category
            + ' - '
            + checkpoint.place
            + '</div>'
            + checkpoint.label
            + '</div></div></div></div></div>');
    elem.on('click', function() {
      selectCheckpoint(checkpoint);
    });
    $("#checkpoints").append(elem);
  });
}

function makeListElemWithoutDistance(name, imgSrc) {
  var imgSrc = getCategoryImgSrc(name) == null ? "img/placeholder.svg" : getCategoryImgSrc(name);
  imgSrc = imgSrc.indexOf("http") == -1 ? "../" + imgSrc : imgSrc;

  return $('<div class="row">' + '<div class="col-sm-12">' + '<div class="checkpoint">'
          + '<img src="' + imgSrc + '" class="pull-left checkpoint-img">' + '<div class="text">'
          + '<div class="name">' + name + '</div></div></div></div></div>');
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
  names.sort();
  names.forEach(function(name, i) {
    var elem = makeListElemWithoutDistance(name);
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
  names.sort();
  names.forEach(function(name, i) {
    var elem = makeListElemWithoutDistance(name);
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

  var imgSrc = checkpoint.imgSrc == null ? "img/placeholder.svg" : checkpoint.imgSrc;
  imgSrc = checkpoint.imgSrc.indexOf("http") == -1 ? "../" + imgSrc : imgSrc;

  // マーカータップ時のバルーンの初期化
  infoWindow = new google.maps.InfoWindow({
    content: "<span class='green'>" + checkpoint.name + "</span> (" + checkpoint.place + ")"
            + "<br><span class='balloon-description'>Category： </span>" + '<a href="'
            + "./checkpoints.html#" + "?category=" + encodeURIComponent(checkpoint.category)
            + "&selected-id=" + encodeURIComponent(checkpoint.id) + '">' + checkpoint.category
            + "</a>" + '<img src="' + imgSrc
            + '" class="pull-right checkpoint-img" style="max-width: 70px;margin-left: 2em;">'
            + "<div class='balloon-description'>" + checkpoint.label + "</div>",
    maxWidth: 200,
    disableAutoPan: true,
  });

  var marker = markers.filter(function(marker) {
    return marker.checkpointId === checkpoint.id;
  })[0];
  infoWindow.open(marker.getMap(), marker);
  map.panTo(marker.getPosition());

  $(".checkpoint").removeClass("selected");
  $("#checkpoint-" + checkpoint.id).addClass("selected");

  $("#selected-checkpoint-description").remove();
  $("#nav-start-in-list").remove();
  $(".checkpoint.selected .detail").append(
          $("<p>").attr("id", "selected-checkpoint-description").html(checkpoint.description))
          .append('<a id="nav-start-in-list" class="btn btn-success btn-sm">Go!</a>');

  $(document).on('click', "#nav-start-in-list", function() {
    $("#nav-start").trigger('click');
  });

  $("#nav-start").show();
  switch (getCategoryDepth()) {
  case 0:
    location.href = "./checkpoints.html#" + "?selected-id=" + encodeURIComponent(checkpoint.id)
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
    if (navigator.onLine) {
      fitBoundsAndZoom(map, [], cPos, DEFAULT_FOCUS_ZOOM);
    }
    $('#gps-error-msg').hide();

    addMapControlUI(
            map,
            google.maps.ControlPosition.RIGHT_BOTTOM,
            $('<div>').append(
                    $('<img>').attr('src', "../img/btn_current_position.png").attr('id',
                            "current-position").css('right', '10'))[0]).addEventListener('click',
            function() {
              fitBoundsAndZoom(map, [{
                lat: cPos.lat(),
                lon: cPos.lng()
              }], cPos, DEFAULT_FOCUS_ZOOM);
            });

    createMapControlUI(map, "From Here to Checkpoints", "10px",
            google.maps.ControlPosition.TOP_LEFT).addEventListener('click', function() {
      fitBoundsAndZoom(map, getNonVisitedCheckPoints(), cPos, DEFAULT_FOCUS_ZOOM);
    });
  }, function(error) {
    console.error(error);
    enableGps = false;
    cPos = new google.maps.LatLng(35.71079167, 139.7193);
    updateViews();
    $('#gps-error-msg').show();
    if (navigator.onLine) {
      fitBoundsAndZoom(map, getNonVisitedCheckPoints(), cPos, DEFAULT_FOCUS_ZOOM);
    }
  }, {
    enableHighAccuracy: true,
    timeout: 1000 * 60,
    maximumAge: 0,
  });
}
