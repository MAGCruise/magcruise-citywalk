var map = null;
var markers = [];
var infoWindow = null;

function initMap(latLons) {
  map = new google.maps.Map(document.getElementById('map'), {
    mapTypeControl: false,
    streetViewControl: false,
    scaleControl: true,
    scaleControlOptions: {
      position: google.maps.ControlPosition.BOTTOM_LEFT
    }
  });
  fitBoundsAndZoom(map, latLons, null, 17);
}

$(function() {

  new JsonRpcClient(new JsonRpcRequest(getBaseUrl(), "getUsers", [], function(data) {
    data.result.forEach(function(e){
      $('#user-id').append($('<option>').attr('value', e.id).text(e.id));
    });
    if(getItem("selectedUserId")){
      $("#user-id [value="+getItem("selectedUserId")+"]").prop("selected",true);
    }
    $('#user-id').selectpicker('refresh');
  })).rpc();

  $('#btn-submit').on(
          'click',
          function(e) {
            var userId = $('#user-id').val();
            setItem("selectedUserId", userId);
            var courseId = $('#course-id').val();
            var incrementSize = $('#increment-size').val();
            new JsonRpcClient(new JsonRpcRequest(getBaseUrl(), "getMovements", [userId, courseId, incrementSize], function(data) {
              var movements = data.result;
              if(movements.length==0){
                  swalAlert("","移動ログがありません","error");
                  return;
              }
              initMap(movements);
              putMarkers(movements, "//maps.google.com/mapfiles/ms/icons/blue-dot.png");
//              new JsonRpcClient(new JsonRpcRequest(getBaseUrl(), "getCheckinLogs", [userId, courseId], function(data) {
//                var checkinLogs = data.result;
//                putMarkers(checkinLogs);
//              }
            })).rpc();
          });
});

function putMarkers(movements, icon) {
  var refreshRate = $('#refresh-rate').val();
  var startFrom = Date.parse($('#start-from').val());
  var counter = 0;
  movements.forEach(function(movement) {
    if(movement.recordedAt<startFrom){
      return;
    }
    setTimeout(function() {
      putMarker(movement, icon);
    }, refreshRate * counter++);
  });
}


function putMarker(movement,icon) {
  $('#recordedAt').text(toFormattedDate(movement.recordedAt));
  
  var marker = new google.maps.Marker({
    position: {
      lat: movement.lat,
      lng: movement.lon
    },
    map: map,
    icon: icon
  });
  marker.addListener('click', function() {
    if (infoWindow != null) {
      infoWindow.close();
    }
    infoWindow = new google.maps.InfoWindow({
      content: "<span class='green'>" + toFormattedDate(movement.recordedAt) + "</span> directed to "
              + movement.checkpointId,
      maxWidth: 200,
      disableAutoPan: true,
    });
    infoWindow.open(marker.getMap(), marker);
    map.panTo(marker.getPosition());
  });
  markers.push(marker);
}


