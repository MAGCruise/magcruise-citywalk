function selectCheckpointGroup(checkpointGroupId) {
	new JsonRpcClient(new JsonRpcRequest(getBaseUrl(), "getInitialData",
			[ checkpointGroupId ], function(data) {
				saveCityWalkData(data.result);
				setCheckpointGroupId(checkpointGroupId);
				location.href = "checkpoints.html";
			})).rpc();
}

$(function() {
	$("#back").hide();
	$("#nav-menu").hide();
	$(".course a").click(function() {
		var checkpointGroupId = $(this).attr("id");
		selectCheckpointGroup(checkpointGroupId);
	});
	//selectCheckpointGroup("wasedasai2016");
});
