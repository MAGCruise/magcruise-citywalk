$(function() {
  if (!getUserId() || !getCourseId()) {
    $("#mag-nav").remove();
  }
  $("#nav-title").text("はじめに");

  $("#btn-join-ja").on('click', function() {
    swalAlert("「歩きスマホ」はやめましょう", "画面を見つめながらの歩行は危険です", "warning", function() {
      location.href = "check-environment.html?lang=ja"
    });
  });
  $("#btn-join-en").on(
          'click',
          function() {
            swalAlert("Warning", "Please pay attention to surroundings when you walk", "warning",
                    function() {
                      location.href = "check-environment.html?lang=en"
                    });
          });
});
