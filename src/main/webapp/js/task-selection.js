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

  var selectionType = (task.answerIndexes.length == 1) ? "radio" : "checkbox"
  task.selections.forEach(function(selection, i) {
    var selectionElem = '<div class="selection">' + '<label><input type="' + selectionType
            + '" name="selection" class="selection" value=' + i + '>' + selection + '</label>'
    '</div>';
    $('.form-group').append(selectionElem);
  });

  $('.selection').on('click', function() {
    var enableBtnNext = false;
    // 一つでもチェックがあれば，回答するボタンを押せるように
    $('.selection').each(function() {
      enableBtnNext = (enableBtnNext || $(this).prop('checked'));
    });
    $('#btn-next').prop('disabled', !enableBtnNext);
  });
  $('#btn-next').on('click', function() {

    confirmSubmission(function() {
      var indexes = $('.selection:checked').map(function() {
        return parseInt($(this).val());
      }).get();
      addAnswerDic(checkpoint, task, indexes);
      var isCorrect = isSameAnswers(task.answerIndexes, indexes);
      addActivity(task, indexes.sort().toString(), isCorrect);
    });

  });
});

function isSameAnswers(array1, array2) {
  return array1.sort().toString() === array2.sort().toString();
}
