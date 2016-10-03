$(function() {
	$("#nav-menu").hide();
	$('#register-btn').on(
			'click',
			function() {
				for (var i = 0; i < $('input').size(); i++) {
					if (!$('input')[i].checkValidity()) {
						$('#submit-for-validation').trigger("click");
						return;
					}
				}
				var checkpointGroupId = parseUri(location).anchor;
				var userId = $('#user-id').val().replace("@", "-at-");
				var groupId = $('#group-id').val();
				new JsonRpcClient(new JsonRpcRequest(getBaseUrl(), "login", [
						checkpointGroupId, userId, groupId ], function(data) {
					// データの保存
					setCheckpointGroupId(checkpointGroupId);
					setUserId(userId);
					setGroupId(groupId);
					location.href = "checkpoints.html";
				}, function(data, textStatus, errorThrown) {
					console.error("fail to login.");
			        console.error(textStatus+ ', ' + errorThrown + '. response: ' + JSON.stringify(data));
			        console.error('request: ' + JSON.stringify(JSON.stringify(this)));
				})).rpc();
			});
});
