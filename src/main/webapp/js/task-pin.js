if (!getCheckpoint()) {
  history.back();
}
if (getTaskIndex() <= getLastTaskIndex(getCheckpoint().id)) {
  moveToNextPage();
}

setTaskTitle();
var checkpoint = getCheckpoint();
var task = getTask();

$(function() {
  if (getTaskIndex() != 0) {
    setBackDisabled();
  }

  $('#label').text(task.label);

  $(".form").on('keypress', function(ev) {
    if ((ev.which && ev.which === 13) || (ev.keyCode && ev.keyCode === 13)) {
      procTask();
      return false;
    }
  });

  $("#btn-next").on('click', function(e) {
    procTask();
  });
});

function procTask() {
  var text = $("#answer-text").val().replace(/\s+/g, "").replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) {
    return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
  });
  if (!/^[0-9]{4}$/g.test(text)) {
    alertWarning("照合失敗", "半角数字4桁が入力されていません");
    return;
  }
  var isCorrect = false;
  task.answerTexts.forEach(function(answerText) {
    isCorrect = isCorrect || (answerText == text);
  });
  if (isCorrect) {
    addAnswerDic(checkpoint, task, text);
    addActivity(task, text, isCorrect);
  } else {
    alertWarning("照合失敗", "キーワードが違っています");
  }
}
