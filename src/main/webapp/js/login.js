function isNoLogin() {
  return parseUri(location).queryKey.msg == "nologin";
}
var loginFunc = function() {
  for (var i = 0; i < $('input').size(); i++) {
    if (!$('input')[i].checkValidity()) {
      $('#submit-for-validation').trigger("click");
      return;
    }
  }
  var checkpointGroupId = parseUri(location).anchor;
  var userId = $('#user-id').val();
  var groupId = $('#group-id').val();
  new JsonRpcClient(new JsonRpcRequest(getBaseUrl(), "login",
          [userId, groupId], function(data) {
            if (data.result) {
              setUserId(userId);
              setGroupId(groupId);
              if (isNoLogin()) {
                location.href = parseUri(location).query.replace(
                        "msg=nologin&redirect=", "");
              } else {
                location.href = "courses.html";
              }
            } else {
              if (!confirm('ログインに失敗しました。ユーザ登録をしてください。')) {
                return false;
              } else {
                setUserId("");
                setGroupId("");
                location.href = 'signup.html';
              }
            }
          }, function(data, textStatus, errorThrown) {
            console.error("fail to login.");
            console.error(textStatus + ', ' + errorThrown + '. response: '
                    + JSON.stringify(data));
            console.error('request: ' + JSON.stringify(JSON.stringify(this)));
            if (!confirm('ログインに失敗しました。ユーザ登録をしてください。')) {
              return false;
            } else {
              location.href = 'signup.html';
            }
          })).rpc();
};

$(function() {
  if (!getUserId()) {
    location.href = 'signup.html';
    return;
  }
  if (isNoLogin()) {
    alert("ログアウトされました．もう一度ログインして下さい．");
  }

  $("#nav-menu").hide();
  $('#user-id').val(getUserId());
  // loginFunc()
  $('#login-btn').on('click', loginFunc);
  $("form").keypress(function(ev) {
    if ((ev.which && ev.which === 13) || (ev.keyCode && ev.keyCode === 13)) {
      loginFunc();
      return false;
    } else {
      return true;
    }
  });
});
