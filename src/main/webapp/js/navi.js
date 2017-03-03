var checkpoint = getCheckpoint();
var cPos; // 現在地
var ePos;
var map;
var watchID;
var DEFAULT_FOCUS_ZOOM = 17;
var infoWindow;

var POST_MOVEMENT_INTERVAL = 1000 * 30; // msec
var osName = new UAParser().getOS().name;

window.onload = function() {
  setTimeout(initMap, 300);
}
$(function() {
  document.title = checkpoint.name; // タイトルの変更
  ePos = new google.maps.LatLng(checkpoint.lat, checkpoint.lon);

  // ブラウザがバックグラウンドに一度遷移すると，watchPositionがキャンセルされる。
  // そこで，フォアグラウンドに戻ってきた際に，リロードする。initMap()だけでも良いが念のため。
  // ex.)ホームボタンを押す。
  // ex.)電源ボタンを押す。
  // ex.)通知より，別のアプリを起動する。
  checkReturnFromBackground();

  $("#hide-gps-settings-alert").on('click', function() {
    localStorage.hideGpsSettingsAlert = "true";
    updateGpsEnableMessage(osName);
  });
  updateGpsEnableMessage(osName);
  $('#checkpoint-info').append(makeCheckpointInfoHtml(checkpoint));
  $('#checkpoint-info .checkpoint-info-description').append($("<div>").attr("id", "notification"));
});

function updateGpsEnableMessage(osName) {
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

$(function() {
  function updateMapHeight() {
    var height = window.innerHeight - $("#map-box").offset().top;
    if (height > 280) {
      $("#map-box").css("height", height + "px");
    }
  }

  updateMapHeight();
  setInterval(updateMapHeight, 500);

  $("#btn-next").on(
          'click',
          function() {
            // 既に途中までタスクが進んでいる場合には，完了済みの次のタスクからはじめる
            var taskIndex = getLastTaskIndex(checkpoint.id) + 1;
            var distThreshold = getTask(checkpoint, 0).activeArea;
            if (getDistance() == null) {
              if (currentUser.language == "ja") {
                swalAlert("位置情報が取得できません", "チェックポイントの側で位置情報の利用ができる場所へ移動して下さい．", "error");
              } else {
                swalAlert("Location service is unavailable",
                        "Let's move to place where location service is available．", "error");
              }
              return;
            } else if (getDistance() > distThreshold) {
              if (currentUser.language == "ja") {
                swalAlert("チェックポイントまで" + distThreshold + "m以内に近づいて下さい", "チェックポイントまで，残りおよそ "
                        + getDistanceStr() + "です．チェックポイントの近くで位置情報が利用できる場所へ移動して下さい．", "error");
              } else {
                swalAlert("To far from the checkpoint", "You should come within " + distThreshold
                        + "m of the checkpoint", "error");
              }
              return;
            }

            location.href = getTaskURLWithCurrentPosition(checkpoint, taskIndex, cPos)
                    + "&navi_from=" + getNaviFromParam();
          });

  showCheckinLogs();
  showEventsViaWebsocket();
  setInterval(postMovementsFunc, POST_MOVEMENT_INTERVAL);
});

function showCheckinLogs() {
  if (!navigator.onLine) { return; }

  new JsonRpcClient(new JsonRpcRequest(getBaseUrl(), "getCheckinLogs", [checkpoint.id], function(
          data) {
    if (data.result.length == 0) { return; }
    console.log(data);
    $('#btn-checkin-log').text(data.result.length + " user checked in");
    $('#btn-checkin-log').prop("disabled", false);
    $('#btn-checkin-log').on(
            'click',
            function(e) {
              var msg = "";
              data.result.forEach(function(a) {
                msg += "<span class='green'>" + a.userId + "</span> ("
                        + toFormattedShortDate(a.createdAt) + ")<br>";
              });
              swalAlert("", msg, "", function() {
              });
            });
  }, function(data, textStatus, errorThrown) {
    console.error(data);
  })).rpc();

}
function showEventsViaWebsocket() {
  var KEY_NOTIFIED_ACTIVITY_IDS = "key_notified_activity_ids";

  function addNotifedActivityId(aid) {
    addItems(KEY_NOTIFIED_ACTIVITY_IDS, aid);
  }

  function getNotifiedActivityIds() {
    return getItems(KEY_NOTIFIED_ACTIVITY_IDS);
  }

  function notifyMsg(messages, i) {
    if (messages.length == i) { return; }
    var a = messages[i];
    if (getNotifiedActivityIds().indexOf(a.id) != -1) {
      notifyMsg(messages, i + 1);
      return;
    }

    var info = $('<div>').html(
            '<i class="glyphicon glyphicon-time" /> ' + toFormattedShortDate(a.createdAt)
                    + ' <i class="glyphicon glyphicon-user" /> ' + a.userId
                    + ' <i class="glyphicon glyphicon-camera" /> '
                    + getCheckpoint(a.checkpointId).name);
    $('#notification-msg-area').append(info);
    $('#notification-msg-area').slideDown(500);
    setTimeout(function() {
      $('#notification-msg-area').slideUp(500)
      setTimeout(function() {
        info.remove();
        addNotifedActivityId(a.id);
        notifyMsg(messages, i + 1);
      }, 500);
    }, 12000);
  }

  var wsUrl = getActivityPublisherUrl() + "/" + getCourseId() + "/" + checkpoint.id + "/"
          + getUserId();
  var connection = new WebSocket(wsUrl);
  connection.onmessage = function(e) {
    var messages = JSON.parse(e.data);
    notifyMsg(messages, 0);
  };
  return {
    abort: function() {
      connection.close();
    }
  };
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
    zoom: DEFAULT_FOCUS_ZOOM
  });

  initMakers();

  // マーカーの追加
  var marker = new google.maps.Marker({
    position: center,
    map: map,
  });

  infoWindow = new google.maps.InfoWindow({
    content: checkpoint.name + "<br>(" + checkpoint.place + ")",
    maxWidth: 200,
    disableAutoPan: true,
  });

  google.maps.event.addListener(infoWindow, "closeclick", function() {
    google.maps.event.addListenerOnce(marker, "click", function(event) {
      infoWindow.open(map, marker);
      map.panTo(marker.getPosition());
    });
  });

  createMapControlUI(map, "Checkpoint", "10px", google.maps.ControlPosition.LEFT_TOP)
          .addEventListener('click', function() {
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

  if (!navigator.onLine) { return; }
  watchCurrentPosition();
}

function initMakers() {
  var checkpoints = getNonVisitedCheckPoints();
  var markers = [];
  checkpoints.forEach(function(checkpoint, i) {
    if (checkpoint.id === getCheckpoint().id) { return; }
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
                + "<br><span class='balloon-description'>Category： </span>" + '<a href="'
                + "./checkpoints.html#" + "?category=" + encodeURIComponent(checkpoint.category)
                + "&selected-id=" + encodeURIComponent(checkpoint.id) + '&no-refresh=true">'
                + checkpoint.category + "</a>" + '<img src="' + imgSrc
                + '" class="pull-right checkpoint-img" style="max-width: 70px;margin-left: 2em;">'
                + "<div class='balloon-description'>" + checkpoint.label + "<br>"
                + '<a id="nav-start-in-list" class="btn btn-success btn-sm">Go!</a>' + "</div>",
        maxWidth: 200,
        disableAutoPan: true,
      });
      infoWindow.open(marker.getMap(), marker);
      map.panTo(marker.getPosition());
      $("#nav-start-in-list").on("click", function() {
        location.href = "./navi.html?checkpoint_id=" + checkpoint.id + "&navi_from=navi";
      });
    });
    markers.push(marker);
  });
}

/* 位置情報を連続取得する */
function watchCurrentPosition() {
  /* 残り距離を表示 */
  function getDistanceStr(cPos, ePos) {
    var distance = getDistance(cPos, ePos);
    if (!distance) { return ""; }
    return getFormattedDistance(distance);
  }

  function getDistance(cPos, ePos) {
    if (cPos == null || ePos == null) { return null; }
    return google.maps.geometry.spherical.computeDistanceBetween(cPos, ePos);
  }

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
    if (!cPos) {
      createMapControlUI(map, "From Here to Checkpoint", "10px",
              google.maps.ControlPosition.TOP_LEFT).addEventListener('click', function() {
        fitBoundsAndZoom(map, [{
          lat: ePos.lat(),
          lon: ePos.lng()
        }, {
          lat: cPos.lat(),
          lon: cPos.lng()
        }], cPos, DEFAULT_FOCUS_ZOOM);
      });

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
      enqueueMovement(pos);
      postMovementsFunc();
    }
    cPos = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
    console.log("currentPosition: " + pos.coords.latitude + ", " + pos.coords.longitude);
    $("#distance").text(getDistanceStr(cPos, ePos));
    enqueueMovement(pos);
    $('.gps-error-msg').hide();
    $('.error-msg-splitter').hide();
    if ($('.compass-error-msg').is(':hidden')) {
      $('#error-msg-area').hide();
    }

  }, function(error) {
    console.error(error);
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

/* 一定周期で呼び出され，ムーブメントを送信する */
function postMovementsFunc() {
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
