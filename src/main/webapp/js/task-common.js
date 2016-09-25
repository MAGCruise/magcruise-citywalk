function getTask(checkpoint=getCheckpoint(), taskIndex=parseInt(getParamDic()["task_index"])) {
	return checkpoint.tasks[taskIndex];
}

var TaskType = {
	Photo : "PhotoTask",
	QR : "QrCodeTask",
	Selection : "SelectionTask",
	Sort : "SortTask",
	Description : "DescriptionTask",
};

function getTaskURL(checkpoint, taskIndex) {
	var task = getTask(checkpoint, taskIndex);
	var suffix = "";
	switch (task.taskType) {
	case TaskType.Photo:
		suffix = "photo";
		break;
	case TaskType.QR:
		suffix = "qr";
		break;
	case TaskType.Selection:
		suffix = "selection";
		break;
	case TaskType.Sort:
		suffix = "sort";
		break;
	case TaskType.Description:
		suffix = "description";
		break;
	default:
		break;
	}
	var url = "task-" + suffix + ".html" +
			  "?checkpoint_id=" + checkpoint.id +
			  "&task_index=" + taskIndex +
			  "&is_last_task=" + (taskIndex == checkpoint.tasks.length-1);
	if (getParamDic()["lat"] && getParamDic()["lon"]) {
		url += "&lat=" + getParamDic()["lat"] + "&lon=" + getParamDic()["lon"];
	}
	return url;
}

function getTaskURLWithLatLon(task, taskIndex, lat, lon) {
	var url = getTaskURL(task, taskIndex);
	return url + "&lat=" + lat + "&lon=" + lon;
}

function getTaskURLWithCurrentPosition(task, taskIndex, cPos) {
	return getTaskURLWithLatLon(task, taskIndex, cPos.lat(), cPos.lng())
}

function isLastTask() {
	return getParamDic()["is_last_task"] === 'true';
}

function moveToNextPage() {
	if (isLastTask()) {
		location.href = "./checkpoints.html";
	} else {
		location.href = getTaskURL(getCheckpoint(), parseInt(getParamDic()["task_index"]) + 1).split('#')[0];
	}
}

function setTaskTitle() {
	document.title = (parseInt(getParamDic()["task_index"]) == 0) ? "チェックイン" : "タスク";
}

function showCheckeinMessageIfNeeded() {
	// チェックイン直後のみ表示する
	if (parseInt(getParamDic()["task_index"]) != 1) {
		return;
	}
	var html = '<div class="row">' +
					'<div class="col-sm-12">' +
						'<p class="alert alert-info">チェックインに成功しました！</p>' +
						'<h1 id="label"></h1>' +
						'<div class="form-group"></div>' +
					'</div>' +
				'</div>';
	$("#menu").after(html);
}

function addActivity(task, input, isCorrect) {
	var arg = {
		checkpointId      : getParamDic()["checkpoint_id"],
        lat               : getParamDic()["lat"],
        lon               : getParamDic()["lon"],
        userId            : getUserId(),
        checkpointGroupId : getCheckpointGroupId(),
        taskId            : task.id,
        taskType          : task.taskType,
        score             : (isCorrect) ? task.point : 0,
        inputs : {
            value : input
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

$(document).on('confirmation', '.remodal', function () {
	moveToNextPage();
});
