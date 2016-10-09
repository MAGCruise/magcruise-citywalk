function getTask() {
	var checkpoint = getCheckpoint();
	return checkpoint.tasks[getTaskIndex()];
}

var TaskType = {
	Photo : "PhotoTask",
	QR : "QrCodeTask",
	Selection : "SelectionTask",
	Sort : "SortTask",
	Description : "DescriptionTask",
};

function getTaskIndex() {
	return parseInt(getParam("task_index"));
}

function getTaskURL(checkpoint, taskIndex) {
	var task = checkpoint.tasks[taskIndex];
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
	if (getParam("lat") && getParam("lon")) {
		url += "&lat=" + getParam("lat") + "&lon=" + getParam("lon");
	}
	return url;
}

function getTaskURLWithLatLon(checkpoint, taskIndex, lat, lon) {
	var url = getTaskURL(checkpoint, taskIndex);
	return url + "&lat=" + lat + "&lon=" + lon;
}

function getTaskURLWithCurrentPosition(checkpoint, taskIndex, cPos) {
	return getTaskURLWithLatLon(checkpoint, taskIndex, cPos.lat(), cPos.lng())
}

function isLastTask() {
	return getParam("is_last_task") === 'true';
}

function isCheckin() {
	return getTaskIndex() == 0;
}

function moveToNextPage() {
	if (isLastTask()) {
		location.href = "./checkpoints.html";
	} else {
		location.href = getTaskURL(getCheckpoint(), getTaskIndex() + 1).split('#')[0];
	}
}

function setTaskTitle() {
	document.title = isCheckin() ? "チェックイン" : "タスク";
}

function showCheckeinMessageIfNeeded() {
	// チェックイン直後のみ表示する
	if (parseInt(getParam("task_index")) != 1) {
		return;
	}
	var html = '<div class="row">' +
					'<div class="col-sm-12">' +
						'<p class="alert alert-info">チェックインに成功しました！</p>' +
					'</div>' +
				'</div>';
	$("#menu").after(html);
}

function addActivity(task, input, isCorrect) {
	var checkpointId = getParam("checkpoint_id");
	var arg = {
		checkpointId      : checkpointId,
        lat               : getParam("lat"),
        lon               : getParam("lon"),
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
		setCheckpointProgress(checkpointId, getTaskIndex()); // 完了済みtask indexを保存
		if (isLastTask()) {
			addVisitedCheckPointIds(checkpointId); // 訪問済みチェックポイントに追加
		}
		if (isCheckin()) {
			moveToNextPage();
			return;
		}
		var title = "タスクを完了しました！";
		if (data.result && data.result.badges.length > 0) {
			title = "バッジを獲得しました！";
			$('#modalDesc').html(data.result.badges.toString().replace(",", "</br>"));
		}
		$('#modalTitle').text(title);
		$('#modal')[0].click();
	})).rpc();
}

$(document).on('confirmation', '.remodal', function () {
	moveToNextPage();
});
