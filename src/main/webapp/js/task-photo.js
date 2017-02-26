if (!getCheckpoint()) {
  history.back();
}
if (getTaskIndex() <= getLastTaskIndex(getCheckpoint().id)) {
  moveToNextPage();
}

setTaskTitle();
var task = getTask();

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
    if (confirm("送信しますか？")) {
      var imgData = $("#img-preview").attr('src');
      addActivity(task, imgData, true);
    }
  });
});

function handleFiles(files) {
  if (files == null || files.length == 0 || files[0] == null) {
    alert("画像を取得できませんでした");
    return;
  }
  var file = files[0];
  loadImage.parseMetaData(file, function(data) {
    loadImage(file, function(canvas) {
      $("#img-preview").attr('src', canvas.toDataURL("image/jpeg"));
    }, {
      orientation: data.exif.get('Orientation'),
      maxHeight: $("#task-img").height(),
      canvas: true
    });
  });

  $("#btn-next").prop("disabled", false);
}
