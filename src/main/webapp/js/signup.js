window.onunload = function() {
}

var MAX_LENGTH_OF_USER_ID = 8;

var registerFunc = function() {
  if (getUserId()) {
    location.href = "courses.html";
    return;
  }

  // スマートフォンでの戻る対策
  $(window).on('popstate', function(e) {
    if (getUserId()) {
      location.href = "courses.html";
      return;
    }
  });

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

  $("form input").on('keypress', function(ev) {
    if ((ev.which && ev.which === 13) || (ev.keyCode && ev.keyCode === 13)) {
      ev.preventDefault();
      registerFunc();
    }
  });
});
