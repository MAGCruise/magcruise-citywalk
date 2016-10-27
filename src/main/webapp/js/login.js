window.onunload = function() {
};

function isNoLogin() {
  return parseUri(location).queryKey.msg == "nologin";
}
var loginFunc = function() {
  var userId = $('#user-id').val();
  var client = new JsonRpcClient(new JsonRpcRequest(getBaseUrl(), "login", [userId],
          function(data) {
            if (data.result) {
              if (isNoLogin()) {
                location.href = parseUri(location).query.replace("msg=nologin&redirect=", "");
              } else {
                location.href = "courses.html";
              }
            }
          })).retry(3, function() {
    // Nothing to do
  }, function() {
    alert('ログインに失敗しました．後でもう一度試して下さい．');
  });

};

$(function() {
  if (!getUserId()) {
    location.href = 'signup.html';
    return;
  }
  if (isNoLogin()) {
    loginFunc();
    // alert("ログアウトされています．もう一度ログインして下さい．");
  }

  $("#nav-menu").hide();
  $('#user-id').val(getUserId());
  $('#login-btn').on('click', loginFunc);
  $(".form").on('keypress', function(ev) {
    if ((ev.which && ev.which === 13) || (ev.keyCode && ev.keyCode === 13)) {
      loginFunc();
      return false;
    }
  });
});
