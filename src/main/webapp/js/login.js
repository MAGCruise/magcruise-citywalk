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
            } else {
              swalAlert('ログイン失敗', 'アカウントが無効です．', 'error');
            }
          }, function(error) {
            swalAlert('ログイン失敗', '後でもう一度試して下さい．', 'warining');
          })).rpc();

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
  $(".form input").on('keypress', function(ev) {
    if ((ev.which && ev.which === 13) || (ev.keyCode && ev.keyCode === 13)) {
      ev.preventDefault();
      loginFunc();
    }
  });
});
