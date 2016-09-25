var id  = getParamDic()["id"];
var lat = getParamDic()["lat"];
var lon = getParamDic()["lon"];
var checkpoint = getCheckpoint(id);

$(function() {
	$("#loading").hide();
	$("#task-img").attr('src', checkpoint.checkin.imgSrc);
	$("#btn-next").click(function() {
		$("#loading").fadeIn();
		var imgData = $("#img-preview").attr('src');
		new JsonRpcClient(new JsonRpcRequest(getBaseUrl(), "uploadImage", [ getUserId(), imgData ], function(data) {
			$("#loading").fadeOut();
			location.href = getTaskURL(checkpoint) + "&lat=" + lat + "&lon=" + lon + "&image_id=" + data.result;
		})).rpc();
	});
});

function handleFiles(files) {
	if (files == null || files.length == 0 || files[0] == null) {
		alert("画像を取得できませんでした。");
		return;
	}
	var file = files[0];
	var fileReader = new FileReader();
	fileReader.onload = function(event) {
		$("#img-preview").attr('src', event.target.result);
	};
	fileReader.readAsDataURL(file);

	$("#btn-next").prop("disabled", false);
}
