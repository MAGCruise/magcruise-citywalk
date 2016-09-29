/* Consntants */
var KEY_CITY_WALK_DATA = "city_walk_data";
var KEY_USER_ID = "user_id";
var KEY_CHECKPOINT_GROUP_ID = "checkpoint_group_id";
var KEY_VISITED_CHECKPOINTS = "visited_checkpoints";
/** *********** */

$(function() {
	setNavTitle();
});

function setNavTitle() {
	$("#nav-title").text(document.title);
}

function getParamDic() {
	var paramDic = {};
	var url = location.href;
	params = url.split("?");
	if (params.length <= 1) {
		return paramDic;
	}
	params = params[1].split("&");
	for (var i = 0; i < params.length; i++) {
		var tmp = params[i].split("=");
		paramDic[tmp[0]] = tmp[1];
	}
	return paramDic;
}

function getParam(key) {
	return getParamDic()[key];
}

function getBaseUrl() {
	var u = parseUri(document.URL);
	var urlPrefix = u.protocol + "://" + u.authority + "/"
			+ u.directory.split("/")[1] + "/";
	return urlPrefix + "CityWalkService";
}

function getActivityPublisherUrl() {
	if (parseUri(location).protocol === "https") {
		return getActivityPublisherWssUrl();
	}else{
		return getActivityPublisherWsUrl();
	}
}

function getActivityPublisherWsUrl() {
	var u = parseUri(document.URL);
	var urlPrefix = "ws://" + u.authority + "/" + u.directory.split("/")[1]
			+ "/";
	return urlPrefix + "websocket/activity";
}

function getActivityPublisherWssUrl() {
	var u = parseUri(document.URL);
	var urlPrefix = "wss://" + u.authority + "/" + u.directory.split("/")[1]
			+ "/";
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

function getCheckpoint() {
	var id = getParam("checkpoint_id");
	var array = getCheckpoints().filter(function(c) {
		return c.id == id;
	});
	if (array.length == 1) {
		return array[0];
	}
	return null;
}

function getVisitedCheckPointIds() {
	return JSON.parse(getItem(KEY_VISITED_CHECKPOINTS)) || [];
}

function addVisitedCheckPointIds(checkpointId) {
	var visitedCheckPointIds = getVisitedCheckPointIds();
	console.log(visitedCheckPointIds);
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
	var visitedCheckPoints = getCheckpoints().filter(function(checkpoint) {
		return visitedCheckPointIds.indexOf(checkpoint.id) < 0;
	});
	return visitedCheckPoints;
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
// localStorageに保存されている、あるkeyの値を削除する
function removeItem(key) {
	window.localStorage.removeItem(key);
}
// localStorageに保存されているすべての値を削除する
function clear() {
	window.localStorage.clear();
}

/* Session Storage */
function setUserId(val) {
	window.sessionStorage.setItem(KEY_USER_ID, val);
}
function getUserId() {
	return window.sessionStorage.getItem(KEY_USER_ID);
}

function setCheckpointGroupId(val) {
	window.sessionStorage.setItem(KEY_CHECKPOINT_GROUP_ID, val);
}
function getCheckpointGroupId() {
	return window.sessionStorage.getItem(KEY_CHECKPOINT_GROUP_ID);
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
	var str = [ date.getFullYear(), padding(date.getMonth() + 1),
			padding(date.getDate()) ].join('-');
	str += ' ';
	str += [ padding(date.getHours()), padding(date.getMinutes()),
			padding(date.getSeconds()) ].join(':');
	return "[" + str + "] ";
}

function toFormattedShortDate(milliseconds) {
	var date = new Date(milliseconds);
	return padding(date.getMonth() + 1)
			+ '月'
			+ padding(date.getDate())
			+ '日'
			+ ' '
			+ [ padding(date.getHours()), padding(date.getMinutes()) ]
					.join(':');
}
