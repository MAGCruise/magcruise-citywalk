var map = null;
var markers = [];
var infoWindow = null;

function initMap(cPos) {

  map = new google.maps.Map(document.getElementById('map'), {
    center: cPos,
    zoom: 17,
    mapTypeControl: false,
    streetViewControl: false,
    scaleControl: true,
    scaleControlOptions: {
      position: google.maps.ControlPosition.BOTTOM_LEFT
    }
  });
}

$(function() {
  $('#btn-submit').on(
          'click',
          function(e) {
            var userId = $('#user-id').val();
            var courseId = $('#course-id').val();
            var incrementSize = $('#increment-size').val();
            new JsonRpcClient(new JsonRpcRequest(getBaseUrl(), "getMovements", [userId, courseId,
                incrementSize], function(data) {
              var m = data.result[0];
              initMap(new google.maps.LatLng(m.lat, m.lon));
              console.log(data);
              putMarkers(data.result);
            })).rpc();
          });
});

function putMarker(movement) {
  var marker = new google.maps.Marker({
    position: {
      lat: movement.lat,
      lng: movement.lon
    },
    map: map,
    icon: "//maps.google.com/mapfiles/ms/icons/blue-dot.png",
  });
  marker.addListener('click', function() {
    if (infoWindow != null) {
      infoWindow.close();
    }
    infoWindow = new google.maps.InfoWindow({
      content: "<span class='green'>" + movement.recordedAt + "</span> directed to "
              + movement.checkpointId,
      maxWidth: 200,
      disableAutoPan: true,
    });
    infoWindow.open(marker.getMap(), marker);
    map.panTo(marker.getPosition());
  });
  markers.push(marker);
}

function putMarkers(movements) {
  movements.forEach(function(movement, i) {
    setTimeout(function() {
      putMarker(movement);
    }, 300 * (i + 1));
  });
}
