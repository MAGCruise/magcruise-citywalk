var loginFunc = function() {
	for (var i = 0; i < $('input').size(); i++) {
		if (!$('input')[i].checkValidity()) {
			$('#submit-for-validation').trigger("click");
			return;
		}
	}
	var checkpointGroupId = parseUri(location).anchor;
	var userId = $('#user-id').val().replace("@", "-at-");
	var groupId = $('#group-id').val();
	new JsonRpcClient(new JsonRpcRequest(getBaseUrl(), "register", [userId, groupId], function(data) {
		if (data.result.register) {
			// データの保存
			setCheckpointGroupId(checkpointGroupId);
			setUserId(userId);
			setGroupId(groupId);
			location.href = "checkpoints.html";
		} else {
			var recommendedUserId = data.result.recommendedUserId;
			$('#user-id').val(recommendedUserId);
			alert("そのユーザー名は既に使われています。「" + recommendedUserId + "」ですとご利用頂けます。");
		}
	}, function(data, textStatus, errorThrown) {
		console.error("fail to register.");
        console.error(textStatus+ ', ' + errorThrown + '. response: ' + JSON.stringify(data));
        console.error('request: ' + JSON.stringify(JSON.stringify(this)));
        alert('ユーザーを登録できませんでした。')
	})).rpc();
};

$(function() {
	$("#nav-menu").hide();
	$('#register-btn').on('click', loginFunc);
});
