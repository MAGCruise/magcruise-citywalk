$(function() {
  $("#loading").hide();

  $("#btn-file-input, #img-preview").on('click', function() {
    $('#file-input').click();
  });

  // この写真を送信しますか？
  $("#btn-next").on(
          'click',
          function() {
            swalConfirm("", "Submit this picture?", "info", function(e) {
              var imgData = $("#img-preview").attr('src');
              var cp = {
                id: Date.now(),
                lat: getParam("lat"),
                lon: getParam("lon"),
                name: "name",
                label: "label",
                description: "description",
                checkin: false,
                markerColor: "red",
                category: "",
                subcategory: "",
                imgSrc: "",
                place: ""
              };
              new JsonRpcClient(new JsonRpcRequest(getBaseUrl(), "addCheckpoint", [getUserId(),
                  getCourseId(), cp, imgData], function(data) {
                updateInitialDataIfNeeded(getCourseId(), function() {
                  location.href = "checkpoints.html";
                });
              })).rpc();
            });
          });
});

function handleFiles(files) {
  if (files == null || files.length == 0 || files[0] == null) {
    alert("Fail to get image."); // 画像を取得できませんでした
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
