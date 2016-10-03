var MAX_ZOOM_LEVEL = 17;

var map;
var markers = []; // マーカーs
var infoWindows = []; // バルーンs
var checkpoints = getNonVisitedCheckPoints(); // 未訪問チェックポイントデータをLocalStorageより取得
var cPos; // 現在地
var selectedCheckpoint;
var category = getParam("category");
var subcategory = getParam("subcategory");
if (category) {
	checkpoints = checkpoints.filter(function(checkpoint) {
		return checkpoint.category == category;
	});
}
if (subcategory) {
	checkpoints = checkpoints.filter(function(checkpoint) {
		return checkpoint.subcategory == subcategory;
	});
}

$(function() {
	unselectCheckpoint();
	$("#current-position").click(function() {
		if (!cPos) {
			return;
		}
		map.setZoom(17);
		map.setCenter(cPos);
	});
	$("#nav-start").click(function() {
		if(!selectedCheckpoint) {
			alert("チェックポイントが選択されていません。");
			return;
		}
		location.href = "./navi.html?checkpoint_id=" + selectedCheckpoint.id;
	});
	
	if (category || subcategory) {
		var url = location.origin + location.pathname;
		// トップ（カテゴリ一覧）へ
		var html = '<a href="' + url + '">TOP</a>';
		// サブカテゴリ一覧へ
		if (category && subcategory) {
			html += ' > <a href="' + url + '?category=' + category + '">' + category + '</a>';
			html += ' > ' + subcategory;
		} else if (category) {
			html += ' > ' + category;
		}
		$("#breadcrumb").html(html);
		$("#breadcrumb").show();
	} else {
		$("#breadcrumb").hide();
	}
});

function getCurrentPosition() {
	if (!navigator || !navigator.geolocation) {
		alert('GPSが使用できません');
	}
	navigator.geolocation.getCurrentPosition(
		function(pos) { // success
			cPos = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
			console.log("currentPosition: " + pos.coords.latitude + ", " + pos.coords.longitude);
	        showList();
		},
		function(error) {
			alert('位置情報の取得に失敗しました');
		},
		{
			enableHighAccuracy: true,
			timeout: 1000 * 60,
			maximumAge: 1000 * 60,
		}
	);
}

function showList() {
	if (category && subcategory) {
		showCheckpoints();
	} else if (category) {
		showSubcategory();
	} else {
		showCategory();
	}
}

/* チェックポイントリストの表示 */
function showCheckpoints() {
	checkpoints.forEach(function(checkpoint, i) {
		var ePos = new google.maps.LatLng(checkpoint.lat, checkpoint.lon);
		var distance = google.maps.geometry.spherical.computeDistanceBetween(cPos, ePos);
		var distanceStyle = (distance > 1000) ? "far" : "near";
		var imgSrc = "../img/placeholder.svg";
		var elem =
			$('<div class="checkpoint" id="checkpoint-' + i + '">' + 
				'<span class="pull-left distance ' + distanceStyle + '">' + 
					getFormattedDistance(distance) + 
				'</span>' +
				'<img src="' + imgSrc + '" class="pull-left checkpoint-img">' +
				'<div class="text">' +
					'<div class="name">' + checkpoint.name + '</div>' +
					'<div class="detail">' + checkpoint.label + '</div>' +
				'</div>' +
			'</div>');
		elem.click(function() {
			selectCheckpoint(i);
		});
		$("#checkpoints").append(elem);
	});
}

function makeListElemWithoutDistanceAndImage(name) {
	return $(
			'<div class="checkpoint">' + 
				'<div class="text">' +
					'<div class="name">' + name + '</div>' +
				'</div>' +
			'</div>'
			);
}

/* サブカテゴリの表示 */
function showSubcategory() {
	// カテゴリでフィルタ、サブカテゴリ名を抽出、ユニークに
	var names = checkpoints.filter(function (checkpoint) {
        return checkpoint.category = category;
    }).map(function(checkpoint) {
		return checkpoint.subcategory;
	}).filter(function (subcategory, index, self) {
        return self.indexOf(subcategory) === index;
    });
	names.forEach(function(name, i) {
		var elem = makeListElemWithoutDistanceAndImage(name);
		elem.click(function() {
			location.href = location.href + "&subcategory=" + name;
		});
		$("#checkpoints").append(elem);
	});
}

/* カテゴリの表示 */
function showCategory() {
	// カテゴリ名を抽出、ユニークに
	var names = checkpoints.map(function(checkpoint) {
		return checkpoint.category;
	}).filter(function (category, index, self) {
        return self.indexOf(category) === index;
    });
	names.forEach(function(name, i) {
		var elem = makeListElemWithoutDistanceAndImage(name);
		elem.click(function() {
			location.href = location.href + "?category=" + name;
		});
		$("#checkpoints").append(elem);
	});
}

/* 15685->15km, 1576->1.6km, 165->165m */
function getFormattedDistance(distance) {
	if (distance >= 1000 * 10) { // 10km以上
		return String(Math.round(distance / 1000)) + "km";
	} else if (distance >= 1000) { // 1km以上
		return String(floatFormat(distance / 1000, 1)) + "km";
    } else { // 1km以内
		return String(Math.round(distance)) + "m";
    }
}

/* 全てのマーカーバルーンを閉じる */
function closeAllInfoWindows() {
	infoWindows.forEach(function(infoWindow, i) {
		infoWindow.close();
	});
}

/* チェックポイント選択処理 */
function selectCheckpoint(index) {
	selectedCheckpoint = checkpoints[index];
	closeAllInfoWindows();
	var marker = markers[index];
	infoWindows[index].open(marker.getMap(), marker);
	map.setZoom(MAX_ZOOM_LEVEL);
    map.setCenter(marker.getPosition());
	$(".checkpoint").removeClass("selected");
	$("#checkpoint-" + String(index)).addClass("selected");
    $("#nav-start").show();
}

/* チェックポイント非選択処理 */
function unselectCheckpoint() {
	closeAllInfoWindows();
	$(".checkpoint").removeClass("selected");
	$("#nav-start").hide();
}

function initMap() {
	var maxLat = -90.0, minLat = 90.0;
	var maxLon = -180.0, minLon = 180.0;
	
	map = new google.maps.Map(document.getElementById('map'), {
//		center: {lat: 38.4400, lng: 139.11090},
//		zoom: 8
	});
	
	checkpoints.forEach(function(checkpoint, i) {
		// マーカーの追加
		var marker = new google.maps.Marker({
		    position: {lat: checkpoint.lat, lng: checkpoint.lon},
		    map: map,
		    icon: "http://maps.google.com/mapfiles/ms/icons/" + checkpoint.markerColor + "-dot.png"
		});
		marker.addListener('click', function() {
		    selectCheckpoint(i);
		});
		markers.push(marker);
		// マーカータップ時のバルーンの初期化
		var infoWindow = new google.maps.InfoWindow({content: checkpoint.id});
		infoWindows.push(infoWindow);
		// 最大最小緯度経度の計算
		if (maxLat < checkpoint.lat) maxLat = checkpoint.lat;
		if (minLat > checkpoint.lat) minLat = checkpoint.lat;
		if (maxLon < checkpoint.lon) maxLon = checkpoint.lon;
		if (minLon > checkpoint.lon) minLon = checkpoint.lon;
	});
	
	// 全てのマーカーが入るように縮尺を調整
	var sw = {lat: minLat, lng: minLon};
	var ne = {lat: maxLat, lng: maxLon};
	var latlngBounds = new google.maps.LatLngBounds(sw, ne);
	map.fitBounds(latlngBounds);
	// 最小ズームレベルの調整
	var listener = google.maps.event.addListener(map, "idle", function() {
		if (map.getZoom() > MAX_ZOOM_LEVEL) map.setZoom(MAX_ZOOM_LEVEL);
		google.maps.event.removeListener(listener); 
	});
	// マップをドラッグした場合は、チェックポイントを非選択に
	google.maps.event.addListener(map, "dragend", function() {
		unselectCheckpoint();
	});
	// 現在地取得し、チェックポイントリストを表示
	getCurrentPosition();
}