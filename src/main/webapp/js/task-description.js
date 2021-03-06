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
  var text = $("#answer-text").val();
  addAnswerDic(checkpoint, task, text);
  var isCorrect = false;
  task.answerTexts.forEach(function(answerText) {
    isCorrect = isCorrect || (answerText == text);
  });
  addActivity(task, text, isCorrect);
}
