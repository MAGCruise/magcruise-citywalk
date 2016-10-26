var MAX_LENGTH_OF_USER_ID = 8;
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
  new JsonRpcClient(new JsonRpcRequest(getBaseUrl(), "register", [userId, groupId,
      MAX_LENGTH_OF_USER_ID], function(data) {
    if (data.result) {
      if (data.result.success) {
        if (localStorage.length != 0) {
          if (confirm('これまでのアクティビティを消去し，新しくニックネームを登録し直してよろしいですか？')) {
            clear();
          } else {
            alert('新しいニックネームの登録をキャンセルしました．');
            return;
          }
        }
        setUserId(userId);
        setGroupId(groupId);
        location.href = "courses.html";
      } else {
        var recommendedUserId = data.result.recommendedUserId;
        $('#user-id').val(recommendedUserId);
        alert("そのニックネームは既に登録されています．「" + recommendedUserId + "」が利用できます．");
      }
    } else {
      alert('ニックネームの登録に失敗しました');
    }
  }, function(data, textStatus, errorThrown) {
    alert('ニックネームの登録に失敗しました');
    console.error("fail to register.");
    console.error(textStatus + ', ' + errorThrown + '. response: ' + JSON.stringify(data));
    console.error('request: ' + JSON.stringify(JSON.stringify(this)));
  })).rpc();
};

$(function() {
  if (getUserId()) {
    location.href = 'login.html';
    return;
  }
  $("#nav-menu").hide();
  $('#register-btn').on('click', registerFunc);
  $("form").keypress(function(ev) {
    if ((ev.which && ev.which === 13) || (ev.keyCode && ev.keyCode === 13)) {
      registerFunc();
      return false;
    }
  });
});
