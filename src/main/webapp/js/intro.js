$(function() {
  if (!getUserId() || !getCheckpointGroupId()) {
    $("#mag-nav").remove();
  }
  $("#nav-title-wrapper").empty();

  $("#btn-join").on('click', function() {
    checkDeviceAndMoveNext();
  });

});

function checkDeviceAndMoveNext() {
  var uaParser = new UAParser();
  var errTitle = "非推奨環境";
  var errText = "OSまたはWebブラウザが推奨環境ではありません．正しく動作しない可能性があります．";
  var unrecommended = false;

  var callback = function() {
    setTimeout(function() {
      swalAlert("「歩きスマホ」はやめましょう", "画面を見つめながらの歩行は危険です", "warning", function() {
        location.href = "tutorial.html"
      });
    }, 300);
  }

  if (!uaParser.getOS() || !uaParser.getBrowser()) {
    unrecommended = true;
    swalAlert(errTitle, errText, "warning", callback);
    return;
  } else if (uaParser.getOS().name === "Windows" || uaParser.getOS().name === "Android"
          || uaParser.getOS().name === "Linux") {
    if (uaParser.getBrowser().name !== "Chrome") {
      unrecommended = true;
    }
  } else if (uaParser.getOS().name === "iOS") {
    if (uaParser.getBrowser().name !== "Chrome"
            && uaParser.getBrowser().name.indexOf("Safari") == -1) {
      unrecommended = true;
    }
  } else {
    unrecommended = true;
  }
  if (unrecommended) {
    errText += "<br>" + uaParser.getBrowser().name + " on " + uaParser.getOS().name;
    swalAlert(errTitle, errText, "warning", callback);
  } else {
    callback();
  }
}