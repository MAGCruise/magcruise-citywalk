function selectCheckpointGroup(checkpointGroupId) {
  new JsonRpcClient(new JsonRpcRequest(getBaseUrl(), "getInitialData", [checkpointGroupId],
          function(data) {
            saveCityWalkData(data.result);
            setCheckpointGroupId(checkpointGroupId);
            new JsonRpcClient(new JsonRpcRequest(getBaseUrl(), "join", [getUserId(),
                getCheckpointGroupId()], function(data) {
              if (data.result) {
                location.href = "checkpoints.html";
              } else {
                alert("コースに参加できません．後でもう一度試して下さい．");
              }
            }, function(error) {
              alert("コースに参加できません．後でもう一度試して下さい．");
            })).rpc();
          })).rpc();
}

$(function() {
  $("#nav-menu").hide();
  $(".course a").click(function() {
    var checkpointGroupId = $(this).attr("id");
    selectCheckpointGroup(checkpointGroupId);
  });
  // selectCheckpointGroup("wasedasai2016");
});
