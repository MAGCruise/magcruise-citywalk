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

function fitBoundsAndZoom(map, checkpoints, cPos, maxZoom) {
  var latlngBounds = new google.maps.LatLngBounds();
  if (!checkpoints || checkpoints.length == 0) {
    latlngBounds.extend(new google.maps.LatLng(cPos.lat(), cPos.lng()));
  } else {
    checkpoints.forEach(function(checkpoint, i) {
      latlngBounds.extend(new google.maps.LatLng(checkpoint.lat, checkpoint.lon));
    });
  }
  map.fitBounds(latlngBounds);
  // 最小ズームレベルの調整
  var listener = google.maps.event.addListener(map, "idle", function() {
    if (map.getZoom() > maxZoom) map.setZoom(maxZoom);
    google.maps.event.removeListener(listener);
  });
}
