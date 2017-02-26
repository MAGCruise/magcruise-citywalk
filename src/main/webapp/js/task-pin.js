if (!getCheckpoint()) {
  history.back();
}
if (getTaskIndex() <= getLastTaskIndex(getCheckpoint().id)) {
  moveToNextPage();
}

setTaskTitle();
var checkpoint = getCheckpoint();
var task = getCurrentTask();

$(function() {
  if (getTaskIndex() != 0) {
    setBackDisabled();
  }

  $('#label').text(task.label);

  $("form input").on('keypress', function(ev) {
    if ((ev.which && ev.which === 13) || (ev.keyCode && ev.keyCode === 13)) {
      ev.preventDefault();
      procTask();
    }
  });

  $("#btn-next").on('click', function(ev) {
    ev.preventDefault();
    procTask();
  });
});

function procTask() {
  var text = $("#answer-text").val().replace(/\s+/g, "").replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) {
    return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
  });
  if (!/^[0-9]{4}$/g.test(text)) {
    swalAlert("照合失敗", "半角数字4桁が入力されていません", "warning");
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
    swalAlert("照合失敗", "キーワードが違っています", "warning");
  }
}
