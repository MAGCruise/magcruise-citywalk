var MAX_CATEGORY_DEPTH = 1;

function selectCheckpointGroup(checkpointGroupId) {
  showLoading();
  var req = new JsonRpcRequest(getBaseUrl(), "getInitialData", [checkpointGroupId], function(data) {
    saveCityWalkData(data.result);
    setCheckpointGroupId(checkpointGroupId);

    setMaxCategoryDepth(MAX_CATEGORY_DEPTH);
    new JsonRpcClient(new JsonRpcRequest(getBaseUrl(), "join",
            [getUserId(), getCheckpointGroupId()], function(data) {
              hideLoading();
              if (data.result) {
                location.href = "checkpoints.html";
              } else {
                alert("コースに参加できません．後でもう一度試して下さい．");
              }
            }, function(error) {
              hideLoading();
              alert("コースに参加できません．後でもう一度試して下さい．");
            })).rpc();
  }, function(error) {
    hideLoading();
    alert("コースに参加できません．後でもう一度試して下さい．");
  });
  req.timeout = 20000;
  new JsonRpcClient(req).rpc();
}

$(function() {
  $("#nav-menu").hide();
  if (getParam("checkpointGroupId")) {
    selectCheckpointGroup(getParam("checkpointGroupId"));
    return;
  }

  $(".course a").on('click', function() {
    var checkpointGroupId = $(this).attr("id");
    selectCheckpointGroup(checkpointGroupId);
  });
});
