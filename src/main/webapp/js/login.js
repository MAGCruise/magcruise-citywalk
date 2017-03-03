function isNoLogin() {
  return parseUri(location).queryKey.msg === "nologin";
}

var loginFunc = function() {
  var userId = $('#user-id').val();
  var pin = Number.parseInt($('#pin').val());
  var client = new JsonRpcClient(new JsonRpcRequest(getBaseUrl(), "login", [userId, pin], function(
          data) {
    if (data.result) {
      if (isNoLogin()) {
        location.href = parseUri(location).query.replace("msg=nologin&redirect=", "");
      } else {
        setUserId(data.result.id);
        setPin(data.result.pin);
        setLanguage(data.result.language);
        location.href = "courses.html";
      }
    } else {
      swalAlert('ログイン失敗', 'アカウントが無効です．', 'error');
    }
  }, function(error) {
    swalAlert('ログイン失敗', '後でもう一度試して下さい．', 'warning');
  })).rpc();

};

$(function() {
  if (!getUserId() && !parseUri(location).queryKey.msg === "admin") {
    location.href = 'signup.html';
    return;
  }
  if (isNoLogin()) {
    loginFunc();
    // alert("ログアウトされています．もう一度ログインして下さい．");
  }

  $("#nav-menu").hide();
  $('#user-id').val(getUserId());
  $('#pin').val(getPin());
  if (parseUri(location).queryKey.msg === "admin") {
    $('#user-id').prop("disabled", false);
  }
  $('#login-btn').on('click', loginFunc);
  $(".form input").on('keypress', function(ev) {
    if ((ev.which && ev.which === 13) || (ev.keyCode && ev.keyCode === 13)) {
      ev.preventDefault();
      loginFunc();
    }
  });
});
