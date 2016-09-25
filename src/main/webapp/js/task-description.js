var checkpointId = getParamDic()["checkpoint_id"];
var lat = getParamDic()["lat"];
var lon = getParamDic()["lon"];
var checkpoint = getCheckpoint(checkpointId);

$(function() {
	var task = checkpoint.task;
	$("#label").text(task.label);

	var answerSel = "#answer-text";
	var buttonSel = "#btn-next";
	// 回答の変更を監視
	function checkChange(e){
	    var old = v = $(e).find(answerSel).val();
	    return function(){
	        v = $(e).find(answerSel).val();
	        if(old != v){
	            old = v;
	            $(buttonSel).prop("disabled", (v.length == 0));
	        }
	    }
	}
	$(answerSel).keyup(checkChange(this));

	$(buttonSel).click(function() {
		var text = $(answerSel).val();
		addActivity(task, text);
	});

	$(document).on('confirmation', '.remodal', function () {
		moveToNextPage();
	});
});

function addActivity(task, text) {
	var isCorrect = (task.answerTexts.indexOf(text) >= 0);
	var arg = {
		checkpointId:checkpoint.id,
		lat		: lat,
		lon		: lon,
		userId	: getUserId(),
		taskId	: task.id,
		taskType: task.taskType,
		score	: (isCorrect) ? task.point : 0,
		inputs	: {
			value			: text
		}
	};
	new JsonRpcClient(new JsonRpcRequest(getBaseUrl(), "addActivity", [ arg ], function(data) {
		if (data.result && data.result.badges.length > 0) {
			$('#modalDesc').html(data.result.badges.toString().replace(",", "</br>"));
			$('#modal')[0].click();
		} else {
			moveToNextPage();
		}
	})).rpc();
}

function moveToNextPage() {
	location.href = "./checkpoints.html";
}

