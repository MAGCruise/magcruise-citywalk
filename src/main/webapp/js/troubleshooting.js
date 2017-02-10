$(function() {
  if (!getUserId() || !getCourseId()) {
    $("#nav-menu-wrapper").remove();
  }
});
