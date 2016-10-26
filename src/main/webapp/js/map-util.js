var MAX_ZOOM_LEVEL = 17;

function createMapControlUI(map, label, fontSize, controlPosition) {
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
  controlText.style.fontSize = fontSize;
  controlText.style.paddingTop = '4px';
  controlText.style.paddingBottom = '4px';
  controlText.style.paddingLeft = '4px';
  controlText.style.paddingRight = '4px';
  controlText.innerHTML = label;
  controlUI.appendChild(controlText);

  centerControlDiv.index = 1;
  map.controls[controlPosition].push(centerControlDiv);

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

// 誤差を円で描く
function drawCurrentLocationCircle(map, cPos, radius) {
  var circle = new google.maps.Circle({
    map: map,
    center: cPos,
    radius: radius, // 単位はメートル
    strokeColor: '#0088ff',
    strokeOpacity: 0.8,
    strokeWeight: 1,
    fillColor: '#0088ff',
    fillOpacity: 0.2
  });
  return circle;
}
