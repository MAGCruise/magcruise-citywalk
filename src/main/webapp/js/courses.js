function selectCourse(courseId) {
  showLoading();
  var req = new JsonRpcRequest(getBaseUrl(), "getInitialData", [courseId], function(data) {
    saveCityWalkData(data.result);
    setCourseId(courseId);
    new JsonRpcClient(new JsonRpcRequest(getBaseUrl(), "join", [getUserId(), getCourseId()],
            function(data) {
              hideLoading();
              if (data.result) {
                location.href = "checkpoints.html";
              } else {
                alert("コースに参加できません．後でもう一度試して下さい．");
              }
            }, function(error) {
              hideLoading();
              alert("コースに参加できません．後でもう一度試して下さい．");
            })).rpc();
  }, function(error) {
    hideLoading();
    alert("コースに参加できません．後でもう一度試して下さい．");
  });
  req.timeout = 20000;
  new JsonRpcClient(req).rpc();
}

$(function() {
  $("#nav-menu").hide();
  if (getParam("courseId")) {
    selectCourse(getParam("courseId"));
    return;
  }

  $(".course a").on('click', function() {
    var courseId = $(this).attr("id");
    selectCourse(courseId);
  });
});
