/* Consntants */
var KEY_CITY_WALK_DATA = "city_walk_data";
var KEY_CITY_WALK_DATA_DATE = "city_walk_data_date";
var KEY_USER_ID = "user_id";
var KEY_PIN = "pin";
var KEY_GROUP_ID = "group_id";
var KEY_LANGUAGE = "language";
var KEY_COURSE_ID = "checkpoint_group_id";
var KEY_CATEGORY_DEPTH = "category_depth";
var KEY_MAX_CATEGORY_DEPTH = "max_category_depth";
var KEY_VISITED_CHECKPOINTS = "visited_checkpoints";
var KEY_ANSWER_DIC = "answer_dic";
var KEY_CHECKPOINT_PROGRESS_DIC = "checkpoint_progress_dic";
var KEY_ACTIVITIES = "activities";
var KEY_MOVEMENT_LIST = "movement_list";

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

window.onerror = function(msg, file, line, col, error) {
  StackTrace.fromError(error)
    .then(function(stackFrames){
        var errorMsg = msg+'\n';
        errorMsg += stackFrames.map(function(sf) {
          return sf.toString();
        }).join('\n');
        console.error(errorMsg);
        sendLogAux(msg,"ERROR", stackFrames[0]);
     })
    .catch(function(stackFrames){
      var errorMsg = msg+"\n"+stackFrames.toString();
      console.log(errorMsg);
     });
};

function getDeviceInfo(){
  var ua = new UAParser().getResult();
  return {browser:ua.browser, os:ua.os, device:ua.device};
}

function getUserInfo(){
  if(!isEnableLocalStorage()){
    return null;
  }
  return {userId: getUserId(), language:getLanguage(), pin:getPin()};
}

function getCourseInfo(){
  if(!isEnableLocalStorage()){
    return null;
  }
  return {courseId: getCourseId(),
    checkpoint: (typeof checkpoint != "undefined")?checkpoint:null,
    task:(typeof task != "undefined")?task: null
   };
}

function sendError(msg){
  sendLog(msg,"ERROR", 4);
}

function sendWarn(msg){
  sendLog(msg,"WARN", 4);
}

function sendInfo(msg){
  sendLog(msg,"INFO", 4);
}

function sendDebug(msg){
  sendLog(msg,"DEBUG", 4);
}

function sendLog(msg, logLevel, stackNum) {
  var st = StackTrace.getSync();
  sendLogAux(msg, logLevel, st[4]);
}

function sendLogAux(msg, logLevel, stackTrace){
  setTimeout(function(){
    new JsonRpcClient(new JsonRpcRequest(getBaseUrl(), "sendLog",
            [logLevel, stackTrace,
             {message: msg, course: getCourseInfo(), user: getUserInfo(),device: getDeviceInfo()},""], function(data) {
    })).rpc();
  },10);
}

$(function() {
  isEnableLocalStorage();
  setNavTitle();
  setUserNameInMenu();
  setBack();
  setForward();
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
    $("#user-name").text(getUserId());
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
function getAdminBaseUrl() {
  var u = parseUri(document.URL);
  var urlPrefix = u.protocol + "://" + u.authority + "/" + u.directory.split("/")[1] + "/";
  return urlPrefix + "json/CityWalkAdminService";
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

function setPin(pin) {
  setItem(KEY_PIN, pin);
}

function getPin() {
  return getItem(KEY_PIN);
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
function clearLocalStorage() {
  window.localStorage.clear();
}

function setUserId(val) {
  setItem(KEY_USER_ID, val);
}
function getUserId() {
  return getItem(KEY_USER_ID);
}

function setLanguage(val) {
  setItem(KEY_LANGUAGE, val);
}
function getLanguage() {
  return getItem(KEY_LANGUAGE);
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

function toTimestamp(milliseconds) {
  var date = new Date(milliseconds);
  var str = [date.getFullYear(), padding(date.getMonth() + 1), padding(date.getDate())].join('-');
  str += ' ';
  str += [padding(date.getHours()), padding(date.getMinutes()), padding(date.getSeconds())]
          .join(':');
  return str;
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
  return padding(date.getMonth() + 1) + '/' + padding(date.getDate()) + ' '
          + [padding(date.getHours()), padding(date.getMinutes())].join(':');
}

function getFormattedDistance(distance) {
  if (distance >= 1000 * 5) { // 5km以上
    return String(floatFormat(distance / 1000, 1)) + "km";
  } else {
    var distanceStr = String(Math.round(distance));
    if (distanceStr.length >= 4) {
      distanceStr = distanceStr.slice(0, 1) + "," + distanceStr.slice(1, distanceStr.length);
    }
    return distanceStr + "m";
  }
}

/** SweetAlert * */
function confirmSubmission(callback) {
  swalConfirm("", "Submit?", null, callback);
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

var KEY_RANKING = "ranking";
var KEY_NOTIFIED_BADGES = "notified_badges";

function getNotifiedBadges() {
  return getItem(KEY_NOTIFIED_BADGES);
}

function getRanking() {
  return getItem(KEY_RANKING);
}

function getRankingTime(){
  return JSON.parse(getItem(KEY_RANKING_TIME));
}

function getRewardMessage() {
  var msg = [];
  if (getRanking() && JSON.parse(getRanking())) {
    msg.push('<i class="glyphicon glyphicon-time" /> '
            + toFormattedShortDate(getRankingTime())
            +' <i class="glyphicon glyphicon-signal" />'
            +" Ranking No. " + getRanking());
  }
  if (getNotifiedBadges() && JSON.parse(getNotifiedBadges())) {
    if (JSON.parse(getNotifiedBadges()).length != 0) {
      msg.push('<i class="glyphicon glyphicon-gift" /> ' + JSON.parse(getNotifiedBadges()));
    }
  }
  return msg.join("<br>");
}

function clearRewardMessage() {
  setItem(KEY_RANKING, null);
  setItems(KEY_NOTIFIED_BADGES, []);
}

var KEY_RANKING_TIME = "ranking_time";

// var postActivitiesFunc = function() {
// var activities = getItems(KEY_ACTIVITIES);
// if (activities.length == 0) { return; }
// removeItem(KEY_ACTIVITIES);
// activities.forEach(function(activity) {
// new JsonRpcClient(new JsonRpcRequest(getBaseUrl(), "addActivity", [activity],
// function(data) {
// console.log(data.result);
// console.log("ranking => " + data.result.rank);
// setItem(KEY_RANKING, data.result.rank);
// if (data.result.badges.length > 0) {
// if (!getNotifiedBadges()) {
// setItems(KEY_NOTIFIED_BADGES, []);
// }
// console.log("badges => " + data.result.badges);
// addItems(KEY_NOTIFIED_BADGES, data.result.badges);
// }
// }, function(data, textStatus, errorThrown) {
// log.error("fail to add activity: " + textStatus + errorThrown + data);
// addItems(KEY_ACTIVITIES, [activity]);
// })).rpc();
// });
// }

function updateInitialDataIfNeeded(courseId, callback) {
  callback = callback || function() {
  };
  if (!getCityWalkDataDate()) { return; }
  new JsonRpcClient(new JsonRpcRequest(getBaseUrl(), "exsitsUpdatedInitialData",
          [getCityWalkDataDate()], function(data) {
            if (data.result) {
              var req = new JsonRpcRequest(getBaseUrl(), "getInitialData",
                      [courseId, getLanguage()], function(data) {
                        saveCityWalkData(data.result);
                        callback();
                      });
              req.timeout = 20000;
              new JsonRpcClient(req).rpc();
            }
          })).rpc();
}

function checkReturnFromBackground() {
  var lastChecked = Date.now();
  setInterval(function() {
    var now = Date.now();
    if (now - lastChecked > 1000 * 10) {
      location.reload();
    }
    lastChecked = now;
  }, 1000 * 5);
}

function confirmLogout() {
  swalConfirm("", "Logout？", "warning", function(input) {
    if (input) {
      logout();
    }
  });
}

function logout() {
  new JsonRpcClient(new JsonRpcRequest(getBaseUrl(), "logout", [], function(data) {
    location.href = "login.html";
  })).rpc();
}
