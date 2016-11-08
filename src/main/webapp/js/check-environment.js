$(function() {

  if (!getUserId() || !getCheckpointGroupId()) {
    $("#nav-menu-wrapper").remove();
  }

  $("#btn-join").on('click', function() {
    if (!isEnableLocalStorage()) { return; }
    location.href = "tutorial.html"
  });

  checkDeviceAndMoveNext();
  if (isEnableLocalStorage()) {
    $("#localStorage").html(
            $('<div class="alert alert-success">').html(
                    '<span class="label label-success">OK</span> ' + "ブラウザ設定が正常です．"));
  } else {
    $("#localStorage")
            .html(
                    $('<div class="alert alert-danger">')
                            .html(
                                    '<span class="label label-danger">ERROR</span> '
                                            + 'ローカルストレージを利用できません．ブラウザがプライベートモードになっているならば，オフにして下さい．'
                                            + '<a class="alert-link" href="https://support.apple.com/ja-jp/HT203036">プライベートブラウズをオフにする  - Apple サポート<i class="fa fa-external-link"></i></a> を見る'));
    $("#btn-join").prop("disabled", true);
  }
  checkGPS();
  window.addEventListener("deviceorientation", onHeadingChange);

});

function onHeadingChange(event) {
  function getBrowserOrientation() {
    var orientation;
    if (screen.orientation && screen.orientation.type) {
      orientation = screen.orientation.type;
    } else {
      orientation = screen.orientation || screen.mozOrientation || screen.msOrientation;
    }
    return orientation;
  }

  cHeading = event.alpha;
  if (typeof event.webkitCompassHeading !== "undefined") {
    cHeading = event.webkitCompassHeading; // iOS non-standard
  }
  var orientation = getBrowserOrientation();
  if (typeof cHeading == "undefined" || cHeading == null) {
    $("#compass").html(
            $('<div class="alert alert-warning">').html(
                    '<span class="label label-warning">WARN</span> '
                            + "電子コンパスを利用できないため，コンパスによるナビゲーションはできません．"));
  } else {
    $("#compass").html(
            $('<div class="alert alert-success">').html(
                    '<span class="label label-success">OK</span> ' + "電子コンパスを利用できます．"));
  }

}

function checkGPS() {
  navigator.geolocation
          .getCurrentPosition(
                  function(pos) {
                    $("#gps").html(
                            $('<div class="alert alert-success">').html(
                                    '<span class="label label-success">OK</span> '
                                            + "位置情報サービスを利用できます．"));
                  },
                  function(error) {
                    $("#gps")
                            .html(
                                    $('<div class="alert alert-warning">')
                                            .html(
                                                    '<span class="label label-warning">WARN</span> '
                                                            + "位置情報サービスが利用できないため，残り距離，コンパスによるナビゲーションができません．"
                                                            + '<i class="glyphicon glyphicon-hand-right"></i> '
                                                            + '<a class="alert-link" href="troubleshooting.html#gps-settings">位置情報サービスの設定</a> を見る．'));
                  }, {
                    enableHighAccuracy: true,
                    timeout: 1000 * 60,
                    maximumAge: 0,
                  });
}

function checkDeviceAndMoveNext() {
  var uaParser = new UAParser();
  var unrecommended = false;

  if (!uaParser.getOS() || !uaParser.getBrowser()) {
    unrecommended = true;
  }
  if (uaParser.getOS().name === "Windows" || uaParser.getOS().name === "Linux") {
    if (uaParser.getBrowser().name === "Chrome"
            && Number(uaParser.getBrowser().version.split(".")[0]) >= 54) {
    } else {
      unrecommended = true;
    }
  } else if (uaParser.getOS().name === "Android") {
    if (Number(uaParser.getOS().version) < 5.0) {
      unrecommended = true;
    }

    if (uaParser.getBrowser().name === "Chrome"
            && Number(uaParser.getBrowser().version.split(".")[0]) >= 54) {
    } else {
      unrecommended = true;
    }
  } else if (uaParser.getOS().name === "iOS") {
    if (uaParser.getOS().version < 9.0) {
      unrecommended = true;
    }

    if (uaParser.getBrowser().name === "Chrome" && Number(uaParser.getBrowser().version) >= 54) {
    } else if (uaParser.getBrowser().name.indexOf("Safari") != -1
            && Number(uaParser.getBrowser().version) >= 9.0) {
    } else {
      unrecommended = true;
    }
  } else {
    unrecommended = true;
  }
  var osAndBrowser = (uaParser.getBrowser() ? uaParser.getBrowser().name + " "
          + uaParser.getBrowser().version : "unkown browser")
          + " ("
          + (uaParser.getOS() ? uaParser.getOS().name + " " + uaParser.getOS().version
                  : "unkown OS") + ")";
  if (unrecommended) {
    $("#os-browser")
            .html(
                    $('<div class="alert alert-warning">')
                            .html(
                                    '<span class="label label-warning">WARN</span> '
                                            + osAndBrowser
                                            + "は推奨ブラウザ/OSではないため，正しく動作しない可能性があります．"
                                            + '<i class="glyphicon glyphicon-hand-right"></i> '
                                            + '<a class="alert-link" href="troubleshooting.html#recommended-environment">推奨ブラウザ/OS</a> を見る．'));
  } else {
    $("#os-browser").html(
            $('<div class="alert alert-success">').html(
                    '<span class="label label-success">OK</span> ' + osAndBrowser + "は推奨環境です．"));
  }
}