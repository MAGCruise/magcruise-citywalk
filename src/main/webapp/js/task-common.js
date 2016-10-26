function getTask() {
  var checkpoint = getCheckpoint();
  return checkpoint.tasks[getTaskIndex()];
}

var TaskType = {
  Photo: "PhotoTask",
  QR: "QrCodeTask",
  Selection: "SelectionTask",
  Sort: "SortTask",
  Description: "DescriptionTask",
  Pin: "PinTask",
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
  case TaskType.Pin:
    suffix = "pin";
    break;
  default:
    break;
  }
  var url = "task-" + suffix + ".html" + "?checkpoint_id=" + checkpoint.id + "&task_index="
          + taskIndex + "&is_last_task=" + (taskIndex == checkpoint.tasks.length - 1);
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
  return getTaskURLWithLatLon(checkpoint, taskIndex, cPos ? cPos.lat() : 0, cPos ? cPos.lng() : 0)
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

function addActivity(task, input, isCorrect) {
  var checkpointId = getParam("checkpoint_id");
  var arg = {
    checkpointId: checkpointId,
    lat: getParam("lat"),
    lon: getParam("lon"),
    userId: getUserId(),
    checkpointGroupId: getCheckpointGroupId(),
    taskId: task.id,
    taskType: task.taskType,
    score: (isCorrect) ? task.point : 0,
    inputs: {
      value: input
    }
  };
  new JsonRpcClient(new JsonRpcRequest(getBaseUrl(), "addActivity", [arg], function(data) {
    setCheckpointProgress(checkpointId, getTaskIndex()); // 完了済みtask
    // indexを保存
    if (isLastTask()) {
      addVisitedCheckPointIds(checkpointId); // 訪問済みチェックポイントに追加
    }
    var title = "";
    if (isCheckin()) {
      title = "チェックイン完了";
      title += "<br>" + arg.score + "pt獲得しました！";
    } else {
      if (isCorrect) {
        title += "<br>正解！"
        title += "<br>" + arg.score + "pt獲得しました！";
      } else {
        title += "<br>不正解！";
        if (task.taskType === "DescriptionTask") {
          title += "<br>正解は「" + task.answerTexts.join('」，「') + "」でした．";
        } else if (task.taskType === "SelectionTask") {
          var answerTexts = [];
          for (var i = 0; i < task.selections.length; i++) {
            if (task.answerIndexes.indexOf(i) >= 0) {
              answerTexts.push(task.selections[i]);
            }
          }
          title += "<br>正解は「" + answerTexts.join('」，「') + "」でした．";
        }
      }
    }

    if (data.result && data.result.badges.length > 0) {
      title = "バッジを獲得しました！";
      $('#modalDesc').html(data.result.badges.toString().replace(",", "</br>"));
    }
    $('#modalTitle').html(title);
    $('[data-remodal-id=modal]').remodal().open();
  }, function(error) {
    alert("送信失敗．もう一度送信して下さい．");
  })).rpc();
}

$(document).on('confirmation', '.remodal', function() {
  history.replaceState('', '', location.href.replace("#modal", ""));
  moveToNextPage();
});
