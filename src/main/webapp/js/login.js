function isNoLogin() {
  return parseUri(location).queryKey.msg == "nologin";
}
var loginFunc = function() {
  var userId = $('#user-id').val();
  new JsonRpcClient(new JsonRpcRequest(getBaseUrl(), "login", [userId], function(data) {
    if (data.result) {
      if (isNoLogin()) {
        location.href = parseUri(location).query.replace("msg=nologin&redirect=", "");
      } else {
        location.href = "courses.html";
      }
    } else {
      alert('ログインに失敗しました．後でもう一度試して下さい．');
    }
  }, function(data, textStatus, errorThrown) {
    alert('ログインに失敗しました．後でもう一度試して下さい．');
    console.error("fail to login.");
    console.error(textStatus + ', ' + errorThrown + '. response: ' + JSON.stringify(data));
    console.error('request: ' + JSON.stringify(JSON.stringify(this)));
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
