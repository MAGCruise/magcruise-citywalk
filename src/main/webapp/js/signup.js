var MAX_LENGTH_OF_USER_ID = 8;

var registerFunc = function() {
  if (getUserId()) {
    location.href = "courses.html";
    return;
  }

  $('#register-btn').prop("disabled", true);
  setTimeout(function() {
    $('#register-btn').prop("disabled", false);
  }, 1000);

  // スマートフォンでの戻る対策
  $(window).on('popstate', function(e) {
    if (getUserId()) {
      location.href = "courses.html";
      return;
    }
  });

  var userId = $('#user-id').val().trim();
  var pin = $('#pin').val();
  var language = parseUri(location).queryKey.lang;

  if (userId < 1 || 8 < userId) {
    swalAlert(MSG_FAIL_TO_SIGNUP, MSG_INVALID_USER_ID);
    return;
  }
  if (new String(pin).length != 4) {
    swalAlert(MSG_FAIL_TO_SIGNUP, MSG_INVALID_PIN);
    return;
  }

  var userAccount = {
    id: userId,
    createdAt: Date.now(),
    pin: pin,
    language: language,
    environment: JSON.stringify(new UAParser().getResult())
  }

  new JsonRpcClient(new JsonRpcRequest(getBaseUrl(), "register", [userAccount,
      MAX_LENGTH_OF_USER_ID], function(data) {
    if (data.result) {
      if (data.result.success) {
        setUserId(userId);
        setLanguage(language);
        setPin(pin);
        location.href = "courses.html";
      } else {
        var recommendedUserId = data.result.recommendedUserId;
        $('#user-id').val(recommendedUserId);
        swalAlert("既に登録されているニックネームです", "「" + recommendedUserId + "」はいかがでしょうか？", "info");
      }
    } else {
      swalAlert('サインアップ失敗', 'もう一度試して下さい．', 'warning');
    }
  }, function(data, textStatus, errorThrown) {
    swalAlert('サインアップ失敗', '後でもう一度試して下さい．', 'warning');
  })).rpc();
};

$(function() {
  if (getUserId()) {
    location.href = 'login.html';
    return;
  }
  if (!parseUri(location).queryKey.lang) {
    var lang = getLanguage() ? getLanguage() : "en";
    location.href = 'signup.html?lang=' + lang;
    return;
  }

  $("#nav-menu").hide();
  $('#register-btn').on('click', registerFunc);

  $(".form input").on('keypress', function(ev) {
    if ((ev.which && ev.which === 13) || (ev.keyCode && ev.keyCode === 13)) {
      ev.preventDefault();
      registerFunc();
      return false;
    }
  });
});
