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

  $("#btn-next").on('click', function() {
    var text = $("#answer-text").val().replace(/\s+/g, "").replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) {
      return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
    });
    if (!/^[0-9]{4}$/g.test(text)) {
      alert("半角数字4桁が入力されていません");
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
      alert("合い言葉が間違っています．");
    }
  });
});
