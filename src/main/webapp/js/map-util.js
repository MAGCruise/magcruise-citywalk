var MAX_ZOOM_LEVEL = 17;

function createMapControlUI(map, position) {
  if (!position) {
    position = google.maps.ControlPosition.TOP_RIGHT;
  }
  var centerControlDiv = document.createElement('div');

  // Set CSS for the control border.
  var controlUI = document.createElement('div');
  controlUI.style.backgroundColor = '#fff';
  controlUI.style.border = '2px solid #fff';
  controlUI.style.borderRadius = '3px';
  controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
  controlUI.style.cursor = 'pointer';
  controlUI.style.marginBottom = '22px';
  controlUI.style.textAlign = 'center';
  controlUI.title = 'Click to recenter the map';
  centerControlDiv.appendChild(controlUI);

  // Set CSS for the control interior.
  var controlText = document.createElement('div');
  controlText.style.color = 'rgb(25,25,25)';
  controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
  controlText.style.fontSize = '14px';
  controlText.style.lineHeight = '38px';
  controlText.style.paddingLeft = '5px';
  controlText.style.paddingRight = '5px';
  controlText.innerHTML = '目的地と現在地を表示';
  controlUI.appendChild(controlText);

  centerControlDiv.index = 1;
  map.controls[google.maps.ControlPosition.TOP_RIGHT].push(centerControlDiv);

  return controlUI;
}

function fitBoundsAndZoom(map, checkpoints) {
  var latlngBounds = new google.maps.LatLngBounds();
  checkpoints.forEach(function(checkpoint, i) {
    latlngBounds.extend(new google.maps.LatLng(checkpoint.lat, checkpoint.lon));
  });
  map.fitBounds(latlngBounds);
  // 最小ズームレベルの調整
  var listener = google.maps.event.addListener(map, "idle", function() {
    if (map.getZoom() > MAX_ZOOM_LEVEL) map.setZoom(MAX_ZOOM_LEVEL);
    google.maps.event.removeListener(listener);
  });
}
