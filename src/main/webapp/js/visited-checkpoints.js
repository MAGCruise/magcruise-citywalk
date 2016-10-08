$(function() {
	new JsonRpcClient(new JsonRpcRequest(getBaseUrl(), "getVisitedCheckpoints", [ getUserId(), getCheckpointGroupId() ], function(data) {
		showVisitedCheckPoints(data.result);
	})).rpc();
});

function showVisitedCheckPoints(results) {
	var answerDic = getAnswerDic();
	getVisitedCheckPoints().forEach(function(checkpoint) {
		var result = getResultByCheckpoint(results, checkpoint);
		var resultHtml = makeResultHtml(result);
		var answerHtml = "";
		checkpoint.tasks.forEach(function(task) {
			if (task.taskType === "DescriptionTask") {
				answerHtml += '問題：' + task.label + '<br/>正解：' + task.answerTexts.join('、') + '<br/>回答：' + answerDic[checkpoint.id][task.id];
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
				answerHtml += '問題：' + task.label + '<br/>正解：' + answerTexts.join('、') + '<br/>回答：' + userAnswerTexts.join('、');
			}
		});
		var html =  '<div class="row checkpoint">' +
						'<i class="fa fa-check-square" aria-hidden="true"></i>' +
						'<p class="name">' + checkpoint.name +
						resultHtml +
						'</p>' +
						'<p class="answer">' + answerHtml + '</p>' +
						'<img src="../img/placeholder.svg" class="img-responsive img col-xs-3 col-sm-3 col-md-2 col-lg-2">' +
						'<div class="col-xs-9 col-sm-9 col-md-10 col-lg-10 description">' +
							checkpoint.label + '<br/><p style="word-break: break-word;">' + (checkpoint.description || "") +'</p>'+ 
						'</div>' +
					'</div>';
		$('#checkpoints').append(html);
	});
}

function getResultByCheckpoint(results, checkpoint) {
	var filteredResults = results.filter(function(result) {
		return result.checkpointId == checkpoint.id;
	});
	if (filteredResults.length == 1) {
		return filteredResults[0];
	}
	return null;
}

function makeResultHtml(result) {
	if (result == null) {
		return "";
	}
	return '<span class="pull-right result">獲得ポイント：' + result.score + "/" + result.point + '</span>';
}
