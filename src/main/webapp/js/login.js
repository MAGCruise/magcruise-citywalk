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
		if (!confirm('ログインに失敗しました。ユーザー登録をしてください。')) {
	    	return false;
	    } else {
	    	location.href = 'register.html';
	    }
	})).rpc();
};

$(function() {
	$("#nav-menu").hide();
	$('#login-btn').on('click', loginFunc);
	
	// 自動ログイン
	$('#user-id').val(getUserId().replace("-at-", "@"));
	$('#group-id').val(getGroupId());
	loginFunc();
});
