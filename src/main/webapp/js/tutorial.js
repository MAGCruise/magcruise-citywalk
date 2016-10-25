$(function() {
  if (!getUserId() || !getCheckpointGroupId()) {
    $("#nav-back-wrapper").remove();
    $("#nav-menu-wrapper").remove();
    $("#nav-title-wrapper").removeClass("col-xs-8");
    $("#nav-title-wrapper").addClass("col-xs-12");
  }

  $('#btn-skip-tutorial').on('click', function(e) {
    if (confirm('チュートリアルをスキップしますか？')) {
      location.href = "signup.html";
    }
  });

  $("#step-" + $("li.active").attr("data-slide-to")).addClass("current-step");
  $("#nav-title").html($("#step-" + $("li.active").attr("data-slide-to")).text());

  $("#btn-next-step").on("click", function(e) {
    $("#carousel-next").trigger('click');
  });

  $(".carousel-control").on("click", function(e) {
    setTimeout(function() {
      $(".step").removeClass("current-step");
      $("#step-" + $("li.active").attr("data-slide-to")).addClass("current-step");
      $("#nav-title").html($("#step-" + $("li.active").attr("data-slide-to")).text());

      if ($("li.active").attr("data-slide-to") == 5) {
        $("#btn-start").show();
        $("#btn-skip-tutorial").hide();
        $("#btn-next-step").hide();
        $("#nav-title").html("チュートリアル終了！");
      }
    }, 500)
  });
});
