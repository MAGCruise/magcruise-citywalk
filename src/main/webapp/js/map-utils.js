function addMapControlUI(map, controlPosition, controlUI) {
  map.controls[controlPosition].push(controlUI);
  return controlUI;
}

function createMapControlUI(map, label, fontSize, controlPosition) {
  var controlUI = document.createElement('div');

  // Set CSS for the control border.
  var controlUIArea = document.createElement('div');
  controlUIArea.style.backgroundColor = '#fff';
  controlUIArea.style.border = '2px solid #fff';
  controlUIArea.style.borderRadius = '3px';
  controlUIArea.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
  controlUIArea.style.cursor = 'pointer';
  controlUIArea.style.marginBottom = '22px';
  controlUIArea.style.textAlign = 'center';
  controlUI.appendChild(controlUIArea);

  // Set CSS for the control interior.
  var controlUIText = document.createElement('div');
  controlUIText.style.color = 'rgb(25,25,25)';
  controlUIText.style.fontSize = fontSize;
  controlUIText.style.paddingTop = '4px';
  controlUIText.style.paddingBottom = '4px';
  controlUIText.style.paddingLeft = '4px';
  controlUIText.style.paddingRight = '4px';
  controlUIText.innerHTML = label;
  controlUIArea.appendChild(controlUIText);

  controlUI.index = 1;
  map.controls[controlPosition].push(controlUI);

  return controlUI;
}

function fitBoundsAndZoom(map, latLons, cPos, maxZoom) {
  var latlngBounds = new google.maps.LatLngBounds();
  if (!latLons || latLons.length == 0) {
    latlngBounds.extend(new google.maps.LatLng(cPos.lat(), cPos.lng()));
  } else {
    latLons.forEach(function(latLon, i) {
      latlngBounds.extend(new google.maps.LatLng(latLon.lat, latLon.lon));
    });
  }
  map.fitBounds(latlngBounds);
  // 最小ズームレベルの調整
  var listener = google.maps.event.addListener(map, "idle", function() {
    if (map.getZoom() > maxZoom) map.setZoom(maxZoom);
    google.maps.event.removeListener(listener);
  });
}
