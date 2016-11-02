/* Consntants */
var KEY_CITY_WALK_DATA = "city_walk_data";
var KEY_USER_ID = "user_id";
var KEY_GROUP_ID = "group_id";
var KEY_CHECKPOINT_GROUP_ID = "checkpoint_group_id";
var KEY_MAX_CATEGORY_DEPTH = "max_category_depth";
var KEY_VISITED_CHECKPOINTS = "visited_checkpoints";
var KEY_ANSWER_DIC = "answer_dic";
var KEY_CHECKPOINT_PROGRESS_DIC = "checkpoint_progress_dic";
/** *********** */
$.blockUI.defaults.css = {};
/** *********** */

window.addEventListener("load", function() {
  memorizeHistory();
}, false);

// スマートフォンにonloadを毎回読み込ませるための対策．
window.onunload = function() {
}

function memorizeHistory() {
  if (history && typeof (history.replaceState) == "function" && !history.state) {
    history.replaceState({
      page: history.length,
      href: location.href
    }, document.title, location.href);
  }

}

$(function() {
  setNavTitle();
  setUserNameInMenu();
  setBack();
  setForward();
  setGFormLink();
});

function setGFormLink() {
  $('#gForm')
          .on(
                  'click',
                  function() {
                    location.href = "https://docs.google.com/forms/d/e/1FAIpQLScluqlpE64IkDjsCaERUtuZL_MUAd4Hfbxwi5o6uUolp498iA/viewform?entry.1317694510="
                            + encodeURIComponent(getUserId()) + "&entry.1660844838"
                  });
}

function setBack() {
  if (!document.referrer) {
    setBackDisabled();
  } else {
    $('#back').removeClass("disabled");
    $('#back').on('click', function() {
      window.history.back();
    });
  }
}

function setForward() {
  if (!history.state) {
    // このページに来たことがない(つまり先頭)
    setForwardDisabled();
  } else if (history.state && history.state.page == history.length) {
    // 来たことがあってその時の履歴が今の履歴の長さと同じである(先頭のページでリロードしたときなど)
    setForwardDisabled();
  } else {
    $('#forward').removeClass("disabled");
    $('#forward').on('click', function() {
      window.history.forward();
    });
  }

}

function setBackDisabled() {
  $('#back').addClass('disabled');
  $('#back').off('click');
}

function setForwardDisabled() {
  $('#forward').addClass('disabled');
  $('#forward').off('click');
}

function setUserNameInMenu() {
  if (getUserId()) {
    $("#user-name").text(getUserId() + " さん");
  }
}

function setNavTitle() {
  $("#nav-title").text(document.title);
  $("#nav-title").ready(function() {
    if ($("#nav-title").height() < 30) {
      $("#nav-title").css("padding-top", "8px");
    }
  });
}

function getParamDic() {
  var paramDic = {};
  var url = location.href;
  params = url.split("?");
  if (params.length <= 1) { return paramDic; }
  params = params[1].split("&");
  for (var i = 0; i < params.length; i++) {
    var tmp = params[i].split("=");
    paramDic[tmp[0]] = tmp[1];
  }
  return paramDic;
}

function getParam(key) {
  if (getParamDic()[key]) { return decodeURIComponent(getParamDic()[key]); }
  return null;
}

function getBaseUrl() {
  var u = parseUri(document.URL);
  var urlPrefix = u.protocol + "://" + u.authority + "/" + u.directory.split("/")[1] + "/";
  return urlPrefix + "CityWalkService";
}

function getActivityPublisherUrl() {
  if (parseUri(location).protocol === "https") {
    return getActivityPublisherWssUrl();
  } else {
    return getActivityPublisherWsUrl();
  }
}

function getActivityPublisherWsUrl() {
  var u = parseUri(document.URL);
  var urlPrefix = "ws://" + u.authority + "/" + u.directory.split("/")[1] + "/";
  return urlPrefix + "websocket/activity";
}

function getActivityPublisherWssUrl() {
  var u = parseUri(document.URL);
  var urlPrefix = "wss://" + u.authority + "/" + u.directory.split("/")[1] + "/";
  return urlPrefix + "websocket/activity";
}

/* City Walk Data */
function saveCityWalkData(data) {
  setItem(KEY_CITY_WALK_DATA, JSON.stringify(data));
}

function loadCityWalkData() {
  return JSON.parse(getItem(KEY_CITY_WALK_DATA));
}

function getCheckpoints() {
  return loadCityWalkData()["checkpoints"];
}

function getCheckpoint(id) {
  if (!id) {
    id = getParam("checkpoint_id");
  }

  var array = getCheckpoints().filter(function(c) {
    return c.id == id;
  });
  if (array.length == 1) { return array[0]; }
  return null;
}

function getVisitedCheckPointIds() {
  return JSON.parse(getItem(KEY_VISITED_CHECKPOINTS)) || [];
}

function addVisitedCheckPointIds(checkpointId) {
  var visitedCheckPointIds = getVisitedCheckPointIds();
  visitedCheckPointIds.push(checkpointId);
  setItem(KEY_VISITED_CHECKPOINTS, JSON.stringify(visitedCheckPointIds));
}

function getVisitedCheckPoints() {
  var visitedCheckPointIds = getVisitedCheckPointIds();
  var visitedCheckPoints = getCheckpoints().filter(function(checkpoint) {
    return visitedCheckPointIds.indexOf(checkpoint.id) >= 0;
  });
  return visitedCheckPoints;
}

function getNonVisitedCheckPoints() {
  var visitedCheckPointIds = getVisitedCheckPointIds();
  var nonVisitedCheckPoints = getCheckpoints().filter(function(checkpoint) {
    return visitedCheckPointIds.indexOf(checkpoint.id) < 0;
  }).filter(function(checkpoint) {
    var now = Date.now();
    return (now >= checkpoint.visibleTimeFrom) && (now <= checkpoint.visibleTimeTo);
  });
  return nonVisitedCheckPoints;
}

function getLastTaskIndex(checkpointId) {
  return (checkpointId in getCheckpointProgressDic()) ? getCheckpointProgressDic()[checkpointId]
          : -1;
}

function getCheckpointProgressDic() {
  return JSON.parse(getItem(KEY_CHECKPOINT_PROGRESS_DIC)) || {};
}

function setCheckpointProgress(checkpointId, taskIndex) {
  var checkpointProgressDic = getCheckpointProgressDic();
  checkpointProgressDic[checkpointId] = taskIndex;
  setItem(KEY_CHECKPOINT_PROGRESS_DIC, JSON.stringify(checkpointProgressDic));
}

/* Local Storage */
// localStorageに値を設定
function setItem(key, val) {
  window.localStorage.setItem(key, val);
}
// localStorageから値を取得
function getItem(key) {
  return window.localStorage.getItem(key);
}
// localStorageに保存されている，あるkeyの値を削除する
function removeItem(key) {
  window.localStorage.removeItem(key);
}
// localStorageに保存されているすべての値を削除する
function clear() {
  window.localStorage.clear();
}

function setUserId(val) {
  setItem(KEY_USER_ID, val);
}
function getUserId() {
  return getItem(KEY_USER_ID);
}

function setGroupId(val) {
  setItem(KEY_GROUP_ID, val);
}
function getGroupId() {
  return getItem(KEY_GROUP_ID);
}

function setCheckpointGroupId(val) {
  setItem(KEY_CHECKPOINT_GROUP_ID, val);
}
function getCheckpointGroupId() {
  return getItem(KEY_CHECKPOINT_GROUP_ID);
}

function getMaxCategoryDepth() {
  return parseInt(getItem(KEY_MAX_CATEGORY_DEPTH));
}

function setMaxCategoryDepth(depth) {
  setItem(KEY_MAX_CATEGORY_DEPTH, depth);
}
function getAnswerDic() {
  return JSON.parse(getItem(KEY_ANSWER_DIC)) || {};
}

function addAnswerDic(checkpoint, task, answer) {
  var answerDic = getAnswerDic();
  if (answerDic[checkpoint.id] == null) {
    answerDic[checkpoint.id] = {};
  }
  answerDic[checkpoint.id][task.id] = answer;
  setItem(KEY_ANSWER_DIC, JSON.stringify(answerDic));
}

/* Geo */
function floatFormat(number, n) {
  var _pow = Math.pow(10, n);
  return Math.round(number * _pow) / _pow;
}

function padding(str) {
  return ('0' + str).slice(-2);
}

function toFormattedDate(milliseconds) {
  var date = new Date(milliseconds);
  var str = [date.getFullYear(), padding(date.getMonth() + 1), padding(date.getDate())].join('-');
  str += ' ';
  str += [padding(date.getHours()), padding(date.getMinutes()), padding(date.getSeconds())]
          .join(':');
  return "[" + str + "] ";
}

function toFormattedShortDate(milliseconds) {
  var date = new Date(milliseconds);
  return padding(date.getMonth() + 1) + '月' + padding(date.getDate()) + '日' + ' '
          + [padding(date.getHours()), padding(date.getMinutes())].join(':');
}

/** SweetAlert * */
function confirmSubmission(callback) {
  swalConfirm("送信しますか？", "", null, callback);
}

function swalConfirm(title, text, type, callback) {
  swal({
    title: title,
    text: text ? text : null,
    type: type ? type : null,
    animation: false,
    html: true,
    showCancelButton: true
  }, callback);
}

function swalAlert(title, text, type, callback) {
  swal({
    title: title,
    text: text ? text : null,
    type: type ? type : null,
    type: "warning",
    animation: false,
    html: true,
  }, callback);
}
