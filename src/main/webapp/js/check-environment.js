var numOfOk = 0;
function ok() {
  numOfOk++;
  if (numOfOk >= 3) {
    $("#btn-join").prop("disabled", false);
  }
}
$(function() {
  if (!getUserId() || !getCourseId()) {
    $("#nav-menu-wrapper").remove();
  }

  $("#btn-join").on('click', function() {
    if (!isEnableLocalStorage()) { return; }
    var lang = "en";
    if (!parseUri(location).queryKey.lang) {
      lang = getLanguage() ? getLanguage() : "en";
    } else {
      lang = parseUri(location).queryKey.lang;
    }
    if (getUserId()) {
      location.href = 'login.html?lang=' + lang;
    } else {
      location.href = 'signup.html?lang=' + lang;
    }
    return;
  });

  checkDevice();
  if (isEnableLocalStorage()) {
    $("#localStorage").html(
            $('<div class="alert alert-success">').html(
                    '<span class="label label-success">OK</span> '));
    ok();
  } else {
    $("#localStorage")
            .html(
                    $('<div class="alert alert-danger">')
                            .html(
                                    '<span class="label label-danger">ERROR</span> '
                                            + 'ローカルストレージを利用できません．ブラウザがプライベートモードになっているならば，オフにして下さい．'
                                            + '<a class="alert-link" href="https://support.apple.com/ja-jp/HT203036">プライベートブラウズをオフにする  - Apple サポート<i class="fa fa-external-link"></i></a> を見る'));
  }
  checkGPS();

  $("#compass").html(
          $('<div class="alert alert-warning">').html(
                  '<span class="label label-warning">WARN</span> '
                          + "Fail to use electronic compass."));
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
  } else {
    $("#compass").html(
            $('<div class="alert alert-success">').html(
                    '<span class="label label-success">OK</span> '));
  }

}

function checkGPS() {
  navigator.geolocation
          .getCurrentPosition(
                  function(pos) {
                    $("#gps").html(
                            $('<div class="alert alert-success">').html(
                                    '<span class="label label-success">OK</span> '));
                    ok();
                  },
                  function(error) {
                    $("#gps")
                            .html(
                                    $('<div class="alert alert-danger">')
                                            .html(
                                                    '<span class="label label-danger">ERROR</span> '
                                                            + "位置情報サービスが利用できないため，残り距離，コンパスによるナビゲーションができません．"
                                                            + '<br><i class="glyphicon glyphicon-hand-right"></i> '
                                                            + '<a class="alert-link" href="troubleshooting.html#gps-settings">位置情報サービスの設定</a> を見る．'));
                  }, {
                    enableHighAccuracy: true,
                    timeout: 1000 * 60,
                    maximumAge: 0,
                  });
}

function checkDevice() {
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

    if (uaParser.getBrowser().name === "Chrome"
            && Number(uaParser.getBrowser().version.split(".")[0]) >= 54) {
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
                                            + " is not recommended."
                                            + '<i class="glyphicon glyphicon-hand-right"></i> '
                                            + '<a class="alert-link" href="troubleshooting.html#recommended-environment">Show recomendded enviroment</a>．'));
  } else {
    $("#os-browser").html(
            $('<div class="alert alert-success">').html(
                    '<span class="label label-success">OK</span> ' + osAndBrowser));
    ok();
  }
}