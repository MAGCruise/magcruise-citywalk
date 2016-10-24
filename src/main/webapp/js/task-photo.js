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
  $("#task-img").attr('src', task.imgSrc);
  $("#btn-next").on('click',function() {
    $("#loading").fadeIn();
    var imgData = $("#img-preview").attr('src');
    addActivity(task, imgData, true);
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
