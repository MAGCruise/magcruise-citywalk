var registerFunc = function() {
	for (var i = 0; i < $('input').size(); i++) {
		if (!$('input')[i].checkValidity()) {
			$('#submit-for-validation').trigger("click");
			return;
		}
	}
	var checkpointGroupId = parseUri(location).anchor;
	var userId = $('#user-id').val();
	var groupId = $('#group-id').val();
	new JsonRpcClient(new JsonRpcRequest(getBaseUrl(), "register", [ userId,
			groupId ], function(data) {
		if (data.result) {
			if (data.result.register) {
				setUserId(userId);
				setGroupId(groupId);
				location.href = "courses.html";
			} else {
				var recommendedUserId = data.result.recommendedUserId;
				$('#user-id').val(recommendedUserId);
				alert("そのユーザー名は既に使われています。「" + recommendedUserId
						+ "」ですとご利用頂けます。");
			}
		} else {
			alert('ユーザーを登録できませんでした。');
		}
	}, function(data, textStatus, errorThrown) {
		console.error("fail to register.");
		console.error(textStatus + ', ' + errorThrown + '. response: '
				+ JSON.stringify(data));
		console.error('request: ' + JSON.stringify(JSON.stringify(this)));
		alert('ユーザーを登録できませんでした。');
	})).rpc();
};

$(function() {
	if (getUserId()) {
		location.href = 'login.html';
		return;
	}
	$("#nav-menu").hide();
	$('#register-btn').on('click', registerFunc);
	$("form").keypress(
			function(ev) {
				if ((ev.which && ev.which === 13)
						|| (ev.keyCode && ev.keyCode === 13)) {
					registerFunc();
					return false;
				} else {
					return true;
				}
			});
});
