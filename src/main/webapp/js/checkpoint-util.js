function makeLabelAndDescriptionHtml(checkpoint) {
  return checkpoint.label + '<p>' + (checkpoint.description || "") + '</p>';
}

function makeBalloonHtml(checkpoint) {
  return '<div class="balloon">' + checkpoint.balloon + '</div>';
}
function makeNameHtml(checkpoint) {
  return '<div class="name">' + '<i class="fa fa-check-square""></i> ' + checkpoint.name + '</div>';
}

function makeAnswerHtml(checkpoint) {
  var answerDic = getAnswerDic();
  var answerHtml = "";
  checkpoint.tasks.forEach(function(task, index) {
    if (!(checkpoint.id in answerDic) || !(task.id in answerDic[checkpoint.id])) { return; }
    if (task.taskType === "DescriptionTask") {
      answerHtml += '問題：' + task.label + '<br/>正解：' + task.answerTexts.join('，') + '<br/>回答：'
              + answerDic[checkpoint.id][task.id];
    } else if (task.taskType === "SelectionTask") {
      var answerTexts = [];
      var userAnswerTexts = [];
      for (var i = 0; i < task.selections.length; i++) {
        if (task.answerIndexes.indexOf(i) >= 0) {
          answerTexts.push(task.selections[i]);
        }
        if (answerDic[checkpoint.id][task.id].indexOf(i) >= 0) {
          userAnswerTexts.push(task.selections[i]);
        }
      }
      answerHtml += '問題：' + task.label + '<br/>正解：' + answerTexts.join('，') + '<br/>回答：'
              + userAnswerTexts.join('，');
    }
  });
  return answerHtml;
}

function makeImgHtml(checkpoint) {
  var imgSrc = checkpoint.imgSrc == null ? "../img/placeholder.svg" : "../img/" + checkpoint.imgSrc;
  return '<img src="' + imgSrc + '" class="img-responsive img">';

}

function makeCheckpointInfoHtml(cp) {
  var html = '<div class="row checkpoint no-margin">' + '<div class="col-xs-12">'
          + makeNameHtml(cp) + '<div class="row">' + '<div class="col-xs-12">'
          + makeBalloonHtml(cp) + '</div>' + '</div>' + '<div class="row">'
          + '<div class="col-xs-12">' + '<p class="answer">' + makeAnswerHtml(cp) + '</p>'
          + '</div>' + '</div>' + '<div class="row">' + '<div class="col-xs-3">' + makeImgHtml(cp)
          + '</div>' + '<div class="col-xs-9 description">' + makeLabelAndDescriptionHtml(cp)
          + '</div>' + '</div>' + '</div>' + '</div></div></div>';
  return html;
}
