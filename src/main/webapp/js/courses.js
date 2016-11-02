var MAX_CATEGORY_DEPTH = 1;

function selectCheckpointGroup(checkpointGroupId) {
  if (checkpointGroupId == getCheckpointGroupId()) {
    wifiAlertAndGoNext();
    return;
  }

  $.blockUI();
  new JsonRpcClient(new JsonRpcRequest(getBaseUrl(), "getInitialData", [checkpointGroupId],
          function(data) {
            saveCityWalkData(data.result);
            setCheckpointGroupId(checkpointGroupId);
            setMaxCategoryDepth(MAX_CATEGORY_DEPTH);
            new JsonRpcClient(new JsonRpcRequest(getBaseUrl(), "join", [getUserId(),
                getCheckpointGroupId()], function(data) {
              if (data.result) {
                wifiAlertAndGoNext();
              } else {
                alert("コースに参加できません．後でもう一度試して下さい．");
              }
            }, function(error) {
              $.unblockUI();
              alert("コースに参加できません．後でもう一度試して下さい．");
            })).rpc();
          })).rpc();
}

function wifiAlertAndGoNext() {
  swalAlert("WiFiオンで位置精度アップ！", "WiFiをオンにするだけで位置情報の精度が上がることがあります", "info", function() {
    location.href = "checkpoints.html";
  });
}

$(function() {
  $("#nav-menu").hide();
  $(".course a").on('click', function() {
    var checkpointGroupId = $(this).attr("id");
    selectCheckpointGroup(checkpointGroupId);
  });
});
