function showCourses() {
  var req = new JsonRpcRequest(getBaseUrl(), "getCourses", [], function(data) {
    data.result.courses.forEach(function(c) {
      if (!c.disabled) {
        $('#courses-list').append(
                $('<div>').addClass('course').append(
                        $('<a>').attr('id', c.id).attr('data-max-category-depth',
                                c.maxCategoryDepth).text(c.name)));
      }
    })
    $(".course a").on('click', function() {
      var courseId = $(this).attr('id');
      var maxCategoryDepth = $(this).attr('data-max-category-depth');
      selectCourse(courseId, maxCategoryDepth);
    });
  }, function(error) {
  });
  new JsonRpcClient(req).rpc();
}
function selectCourse(courseId, maxCategoryDepth) {
  showLoading();
  var req = new JsonRpcRequest(getBaseUrl(), "getInitialData", [courseId, getLanguage()], function(
          data) {
    saveCityWalkData(data.result);
    setCourseId(courseId);
    setMaxCategoryDepth(maxCategoryDepth);
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
    selectCourse(getParam("courseId"), 2);
    return;
  }

  showCourses();

});
