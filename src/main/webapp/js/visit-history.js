$(function() {
  new JsonRpcClient(new JsonRpcRequest(getBaseUrl(), "getVisitedCheckpoints", [getUserId(),
      getCheckpointGroupId()], function(data) {
    showVisitedCheckPoints(data.result);
  })).rpc();
});

function showVisitedCheckPoints(results) {
  var visitedCheckpoints = getVisitedCheckPoints();
  if (visitedCheckpoints.length == 0) {
    $('#initial-msg').show();
  }

  visitedCheckpoints.forEach(function(cp) {
    $('#checkpoints').append(makeVisitedCheckpointInfoHtml(results, cp));
  });
}

function makeVisitedCheckpointInfoHtml(results, cp) {

  function makeScoreHtml(results, checkpoint) {

    function getResultByCheckpoint(results, checkpoint) {
      var filteredResults = results.filter(function(result) {
        return result.checkpointId == checkpoint.id;
      });
      if (filteredResults.length == 1) { return filteredResults[0]; }
      return null;
    }

    var result = getResultByCheckpoint(results, checkpoint)
    if (result == null) { return ""; }
    return '<div class="pull-right score">スコア： ' + result.score + "pt/" + result.point + 'pt</div>';
  }

  var html = '<div class="row checkpoint">' + '<div class="col-xs-12">' + makeNameHtml(cp)
          + '<div class="row bottom-margin">' + '<div class="col-xs-7">' + makeBalloonHtml(cp)
          + '</div>' + '<div class="col-xs-5">' + makeScoreHtml(results, cp) + '</div>' + '</div>'
          + '<div class="row">' + '<div class="col-xs-12">' + '<p class="answer">'
          + makeAnswerHtml(cp) + '</p>' + '</div>' + '</div>' + '<div class="row">'
          + '<div class="col-xs-3">' + makeImgHtml(cp) + '</div>'
          + '<div class="col-xs-9 narrow-description">' + makeLabelAndDescriptionHtml(cp) + '</div>'
          + '</div>' + '</div>' + '</div></div></div>';
  return html;
}
