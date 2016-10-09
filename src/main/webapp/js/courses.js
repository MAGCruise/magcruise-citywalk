$(function() {
	$("#back").hide();
	$("#nav-menu").hide();
	$(".city a").click(
			function() {
				var checkpointGroupId = $(this).attr("id");
				var data = new JsonRpcClient(new JsonRpcRequest(getBaseUrl(),
						"getInitialData", [ checkpointGroupId ], function(data) {
							saveCityWalkData(data.result);
							setCheckpointGroupId(checkpointGroupId);
							location.href = "checkpoints.html";
				})).rpc();
			});
});
