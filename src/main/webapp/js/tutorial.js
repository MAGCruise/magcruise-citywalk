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

  $("#btn-next-step").on("click", function(e) {
    $("#carousel-next").trigger('click');
  });

  var hammer = new Hammer.Manager(window);
  hammer.add(new Hammer.Swipe());

  hammer.on("swipeleft", function(e) {
    $("#carousel-next").trigger('click');
  });

  hammer.on("swiperight", function(e) {
    $("#carousel-prev").trigger('click');
  });

  $(".carousel-control").on("click", function(e) {
    setTimeout(function() {
      $(".step").removeClass("current-step");
      $("#step-" + $("li.active").attr("data-slide-to")).addClass("current-step");
      if ($("li.active").attr("data-slide-to") == 5) {
        $("#btn-start").show();
        $("#btn-skip-tutorial").hide();
        $("#btn-next-step").hide();
        $("#nav-title").html("チュートリアル終了！");
      }
    }, 500)
  });
});
