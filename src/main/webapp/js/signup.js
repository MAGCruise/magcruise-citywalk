var MAX_LENGTH_OF_USER_ID = 8;

var enableButton = true;

var registerFunc = function() {
  if (getUserId()) {
    location.href = "courses.html";
    return;
  }

  if (!enableButton) { return; }

  enableButton = false;
  setTimeout(function() {
    enableButton = true;
  }, 1000);

  // スマートフォンでの戻る対策
  $(window).on('popstate', function(e) {
    if (getUserId()) {
      location.href = "courses.html";
      return;
    }
  });

  var checkpointGroupId = parseUri(location).anchor;
  var userId = $('#user-id').val().trim();
  var groupId = $('#group-id').val().trim();

  for (var i = 0; i < $('input').size(); i++) {
    if (!$('input')[i].checkValidity()) {
      swalAlert('サインアップ失敗', "1文字以上8文字以下で入力して下さい");
      return;
    }
  }

  new JsonRpcClient(new JsonRpcRequest(getBaseUrl(), "register", [userId, groupId,
      MAX_LENGTH_OF_USER_ID], function(data) {
    if (data.result) {
      if (data.result.success) {
        setUserId(userId);
        setGroupId(groupId);
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
