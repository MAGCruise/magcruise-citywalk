$(function() {
  if (!getUserId() || !getCheckpointGroupId()) {
    $("#mag-nav").remove();
  }
  $("#nav-title-wrapper").empty();

  $("#btn-join").on('click', function() {
    location.href = "check-environment.html"
  });

});
