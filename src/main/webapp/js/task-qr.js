setTaskTitle();
var task = getTask();

$(function() {
	$("#back").hide();
	showCheckeinMessageIfNeeded();
	
	$("#btn-next").click(function() {
		addActivity(task, task.answerQr, true);
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
		qrcode.decode(event.target.result);
		// decodeQR(event.target.result);
	};
	fileReader.readAsDataURL(file);
}

qrcode.callback = function(res) {
	$("#btn-next").prop("disabled", true);
	if (res == 'error decoding QR Code') {
    	alert('QRコードの解析に失敗');
	} else {
		console.log('Success to decode qr-code : ' + res);
		if (res == task.answerQr) {
			$("#btn-next").prop("disabled", false);
		} else {
			alert("誤ったQRコードを読み込んでいます。別のQRコードを探して下さい。");
		}
	}
};

function decodeQR(data) {
    var img = new Image();
    img.src = data;
    img.onload = function() {
    	var canvas = document.createElement("canvas");
    	qrcode.decode(canvas.toDataURL("image/png"));
    };
}
