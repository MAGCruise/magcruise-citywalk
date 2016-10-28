$(function() {
  if (!getUserId() || !getCheckpointGroupId()) {
    $("#mag-nav").remove();
  }
  $("#nav-title-wrapper").empty();

  $("#btn-join").on('click', function() {
    checkDevice();
  });

});

function checkDevice() {
  var uaParser = new UAParser();
  var errTitle = "非推奨環境";
  var errText = "OSまたはWebブラウザが推奨環境ではありません．正しく動作しない可能性があります．";
  var unrecommended = false;

  var callback = function() {
    location.href = "tutorial.html"
  }

  if (!uaParser.getOS() || !uaParser.getBrowser()) {
    unrecommended = true;
    swalWarning(errTitle, errText, callback);
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
    swalWarning(errTitle, errText, callback);
  } else {
    callback();
  }
}