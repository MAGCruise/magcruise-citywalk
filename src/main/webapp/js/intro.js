$(function() {
  if (!getUserId() || !getCheckpointGroupId()) {
    $("#mag-nav").remove();
  }
  $("#nav-title-wrapper").empty();

  checkDevice();
});

function checkDevice() {
  var uaParser = new UAParser();
  var errMsg = "OSまたはWebブラウザが推奨環境ではないため，正しく動作しない可能性があります．";
  if (uaParser.getOS().name === "Windows") {
    if (uaParser.getBrowser().name !== "Chrome") {
      alert(errMsg);
    }
  } else if (uaParser.getOS().name === "iOS") {
    if (uaParser.getBrowser().name !== "Chrome"
            && uaParser.getBrowser().name.indexOf("Safari") == -1) {
      alert(errMsg);
    }
  } else if (uaParser.getOS().name === "Android") {
    if (uaParser.getBrowser().name !== "Chrome") {
      alert(errMsg);
    }
  } else {
    alert(errMsg);
  }
}