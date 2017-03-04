function getCurrentTask() {
  var checkpoint = getCheckpoint();
  return checkpoint.tasks[getTaskIndex()];
}

function getTask(checkpoint, taskIndex) {
  return checkpoint.tasks[taskIndex];
}

function getLastTaskIndex(checkpointId) {
  return (checkpointId in getCheckpointProgressDic()) ? getCheckpointProgressDic()[checkpointId]
          : -1;
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
  document.title = isCheckin() ? "Check-in" : "Task";
}

function addActivity(task, input, isCorrect) {
  var activity = {
    checkpointId: getParam("checkpoint_id"),
    createdAt: Date.now(),
    lat: getParam("lat"),
    lon: getParam("lon"),
    userId: getUserId(),
    courseId: getCourseId(),
    taskId: task.id,
    taskType: task.taskType,
    score: (isCorrect) ? task.point : 0,
    inputs: {
      value: input
    },
    options: JSON.stringify({
      "naviFrom": getNaviFromParam()
    })
  };

  // addItems(KEY_ACTIVITIES, [activity]);
  sendAddActivity(activity, isCorrect);
}

function sendAddActivity(activity, isCorrect) {
  new JsonRpcClient(new JsonRpcRequest(getBaseUrl(), "addActivity", [activity], function(data) {
    var checkpointId = activity.checkpointId;
    console.log(data.result);
    console.log("ranking => " + data.result.rank);
    setItem(KEY_RANKING_TIME, Date.now());
    setItem(KEY_RANKING, data.result.rank);
    if (data.result.badges.length > 0) {
      if (!getNotifiedBadges()) {
        setItems(KEY_NOTIFIED_BADGES, []);
      }
      console.log("badges => " + data.result.badges);
      addItems(KEY_NOTIFIED_BADGES, data.result.badges);
    }

    setCheckpointProgress(checkpointId, getTaskIndex()); // 完了済みtask
    // indexを保存
    if (isLastTask()) {
      addVisitedCheckPointIds(checkpointId); // 訪問済みチェックポイントに追加
    }

    var msg = "";
    var title = "";
    if (isCheckin()) {
      title = "<i class='glyphicon glyphicon-thumbs-up'/> Check-in!";
      msg = +activity.score + "pt";
    } else {
      if (isCorrect) {
        title = "<br><i class='glyphicon glyphicon-thumbs-up'/> Good answer!"
        msg = activity.score + "pt";
      } else {
        title = "Bad answer...";
        if (task.taskType === "DescriptionTask") {
          msg = 'Correct answer: "' + task.answerTexts.join('"，"') + '"．';
        } else if (task.taskType === "SelectionTask") {
          var answerTexts = [];
          for (var i = 0; i < task.selections.length; i++) {
            if (task.answerIndexes.indexOf(i) >= 0) {
              answerTexts.push(task.selections[i]);
            }
          }
          msg = 'Correct answer: "' + answerTexts.join('"，"') + '"．';
        }
      }
    }
    setTimeout(function() {
      swalAlert(title, msg, "info", function() {
        location.reload();
      })
    }, 500);
  }, function(data, textStatus, errorThrown) {
    console.error("fail to add activity: " + textStatus + errorThrown + data);
    setTimeout(function() {
      swalAlert("", "Fail to send", "error", function() {
      })
    }, 500);
  })).rpc();
}
