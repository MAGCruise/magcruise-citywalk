/* Consntants */
var KEY_CITY_WALK_DATA = "city_walk_data";
var KEY_CITY_WALK_DATA_DATE = "city_walk_data_date";
var KEY_USER_ID = "user_id";
var KEY_GROUP_ID = "group_id";
var KEY_COURSE_ID = "checkpoint_group_id";
var KEY_CATEGORY_DEPTH = "category_depth";
var KEY_MAX_CATEGORY_DEPTH = "max_category_depth";
var KEY_VISITED_CHECKPOINTS = "visited_checkpoints";
var KEY_ANSWER_DIC = "answer_dic";
var KEY_CHECKPOINT_PROGRESS_DIC = "checkpoint_progress_dic";
var KEY_ACTIVITIES = "activities";
var KEY_MOVEMENT_LIST = "movement_list";

var POST_ACTIVITY_INTERVAL = 1000 * 8; // msec
var POST_MOVEMENT_INTERVAL = 1000 * 10; // msec
/** *********** */

window.addEventListener("load", function() {
  hideLoading();
  memorizeHistory();
}, false);

function memorizeHistory() {
  if (history && typeof (history.replaceState) == "function" && !history.state) {
    history.replaceState({
      page: history.length,
      href: location.href
    }, document.title, location.href);
  }

}

$(function() {
  isEnableLocalStorage();
  setNavTitle();
  setUserNameInMenu();
  setBack();
  setForward();
  postActivitiesFunc();
  postMovementsFunc();
  setInterval(postActivitiesFunc, POST_ACTIVITY_INTERVAL);
  setInterval(postMovementsFunc, POST_MOVEMENT_INTERVAL);
});

function isEnableLocalStorage() {
  try {
    window.localStorage.setItem("enableLocalStorage", "true");
    window.localStorage.getItem("enableLocalStorage");
    return true;
  } catch (e) {
    return false;
  }
}

var loadingTimer;
function showLoading() {
  $("#loading").show();
  if (!loadingTimer) {
    clearTimeout(loadingTimer);
  }
  loadingTimer = setTimeout(hideLoading, 5000);
}

function hideLoading() {
  $("#loading").hide();
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
  $("#nav-title").html(document.title);
  $("#nav-title").ready(function() {
    if ($("#nav-title").height() <= 20) {
      $("#mag-nav").css("height", "60px");
      $("#nav-title").css("padding-top", "10px");
    } else if ($("#nav-title").height() <= 40) {
      $("#mag-nav").css("height", "60px");
      $("#nav-title").css("padding-top", "6px");
    } else {
      $("#mag-nav").css("height", "70px");
      $("#nav-title").css("padding-top", "2px");
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

function getNaviFromParam() {
  return getParam("navi_from");
}

function getBaseUrl() {
  var u = parseUri(document.URL);
  var urlPrefix = u.protocol + "://" + u.authority + "/" + u.directory.split("/")[1] + "/";
  return urlPrefix + "json/CityWalkService";
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
  setCityWalkDataDate(Date.now());
}

function setCityWalkDataDate(date) {
  setItem(KEY_CITY_WALK_DATA_DATE, JSON.stringify(date));
}

function getCityWalkDataDate() {
  return JSON.parse(getItem(KEY_CITY_WALK_DATA_DATE));
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

function getItems(itemsName) {
  var items = getItem(itemsName);
  return items ? JSON.parse(items) : [];
}

function setItems(itemsName, items) {
  setItem(itemsName, JSON.stringify(items ? items : []));
}

function addItems(itemsName, items) {
  setItems(itemsName, getItems(itemsName).concat(items))
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

function setCourseId(val) {
  setItem(KEY_COURSE_ID, val);
}
function getCourseId() {
  return getItem(KEY_COURSE_ID);
}

function getCategoryDepth() {
  return parseInt(getItem(KEY_CATEGORY_DEPTH) ? getItem(KEY_CATEGORY_DEPTH) : 1);
}

function setCategoryDepth(depth) {
  setItem(KEY_CATEGORY_DEPTH, depth);
}

function getMaxCategoryDepth() {
  return parseInt(getItem(KEY_MAX_CATEGORY_DEPTH) ? getItem(KEY_MAX_CATEGORY_DEPTH) : 2);
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

function getCategoryImgSrc(name) {
  var cates = loadCityWalkData().categories;
  var courseId = getCourseId();
  for (var i = 0; i < cates.length; i++) {
    if (cates[i].name === name && cates[i].courseId === courseId) { return cates[i].imgSrc; }
  }
  return null;
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
    animation: false,
    html: true,
  }, callback);
}

var postActivitiesFunc = function() {
  var activities = getItems(KEY_ACTIVITIES);
  if (activities.length == 0) { return; }
  removeItem(KEY_ACTIVITIES);
  activities.forEach(function(activity) {
    new JsonRpcClient(new JsonRpcRequest(getBaseUrl(), "addActivity", [activity], function(data) {
      if (data.result && data.result.badges.length > 0) {
        swalAlert("バッジを獲得！", data.result.badges.toString().replace(",", "</br>"));
      }
    }, function(data, textStatus, errorThrown) {
      addItems(KEY_ACTIVITIES, [activity]);
    })).rpc();
  });
}

/* ローカルストレージにムーブメントを追加する */
function enqueueMovement(pos) {
  var movement = {
    userId: getUserId(),
    lat: pos.coords.latitude,
    lon: pos.coords.longitude,
    accuracy: pos.coords.accuracy,
    altitude: pos.coords.altitude || -1,
    altitudeAccuracy: pos.coords.altitudeAccuracy || -1,
    speed: pos.coords.speed || -1,
    heading: cHeading,
    courseId: getCourseId(),
    checkpointId: checkpoint.id,
    recordedAt: Date.now(),
  };
  addItems(KEY_MOVEMENT_LIST, [movement]);
}

/* 一定周期で呼び出され，ムーブメントを送信する */
var postMovementsFunc = function() {
  var movements = getItems(KEY_MOVEMENT_LIST);
  if (movements.length == 0) { return; }
  removeItem(KEY_MOVEMENT_LIST); // クリア
  new JsonRpcClient(new JsonRpcRequest(getBaseUrl(), "addMovements", [movements], function(data) {
    // console.log(data);
  }, function(data, textStatus, errorThrown) {
    // リストア
    setItems(KEY_MOVEMENT_LIST, movements.concat(getItems(KEY_MOVEMENT_LIST)));
  })).rpc();
}

function updateInitialDataIfNeeded(courseId) {
  if (!getCityWalkDataDate()) { return; }
  new JsonRpcClient(new JsonRpcRequest(getBaseUrl(), "exsitsUpdatedInitialData",
          [getCityWalkDataDate()], function(data) {
            if (data.result) {
              var req = new JsonRpcRequest(getBaseUrl(), "getInitialData", [courseId], function(
                      data) {
                saveCityWalkData(data.result);
              });
              req.timeout = 20000;
              new JsonRpcClient(req).rpc();
            }
          })).rpc();
}
