if (!getCheckpoint()) {
  history.back();
}
if (getTaskIndex() <= getLastTaskIndex(getCheckpoint().id)) {
  moveToNextPage();
}

setTaskTitle();
var task = getCurrentTask();

$(function() {
  if (getTaskIndex() != 0) {
    setBackDisabled();
  }

  $("#loading").hide();
  $("#task-img").attr('src', "../" + task.imgSrc);

  $("#btn-file-input, #img-preview").on('click', function() {
    $('#file-input').click();
  });

  $("#btn-next").on('click', function() {
    swalConfirm("確認", "この写真を送信しますか？", "info", function(e) {
      var imgData = $("#img-preview").attr('src');
      addActivity(task, imgData, true);
    });
  });
});

function handleFiles(files) {
  if (files == null || files.length == 0 || files[0] == null) {
    alert("画像を取得できませんでした");
    return;
  }
  var file = files[0];
  loadImage.parseMetaData(file, function(data) {
    var option = {
      maxHeight: $("#task-img").height(),
      canvas: true
    };
    if (data.exif && data.exif.get('Orientation')) {
      option.orientation = data.exif.get('Orientation');
    }
    loadImage(file, function(canvas) {
      $("#img-preview").attr('src', canvas.toDataURL("image/jpeg"));
    }, option);
  });

  $("#btn-next").prop("disabled", false);
}
