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

  var answerSel = "#answer-text";
  var buttonSel = "#btn-next";
  // 回答の変更を監視
  function checkChange(e) {
    var old = v = $(e).find(answerSel).val();
    return function() {
      v = $(e).find(answerSel).val();
      if (old != v) {
        old = v;
        $(buttonSel).prop("disabled", (v.length == 0));
      }
    }
  }
  $(answerSel).keyup(checkChange(this));

  $(buttonSel).click(function() {
    var text = $(answerSel).val().replace(/\s+/g, "").replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) {
      return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
    });
    if (!/^[0-9]{4}$/g.test(text)) {
      alert("半角数字4桁が入力されていません");
      return;
    }

    addAnswerDic(checkpoint, task, text);

    var isCorrect = false;
    task.answerTexts.forEach(function(answerText) {
      isCorrect = isCorrect || (answerText == text);
    });
    if (isCorrect) {
      addActivity(task, text, isCorrect);
    } else {
      alert("合い言葉が間違っています．");
    }
  });
});
