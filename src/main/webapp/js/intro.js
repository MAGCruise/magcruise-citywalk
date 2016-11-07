$(function() {
  if (!getUserId() || !getCheckpointGroupId()) {
    $("#mag-nav").remove();
  }
  $("#nav-title-wrapper").empty();

  $("#btn-join").on('click', function() {
    swalAlert("「歩きスマホ」はやめましょう", "画面を見つめながらの歩行は危険です", "warning", function() {
      location.href = "check-environment.html"
    });
  });
});
