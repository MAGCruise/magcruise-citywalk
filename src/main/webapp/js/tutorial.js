$(function() {
  if (!getUserId()) {
    $("#nav-back-wrapper").remove();
    $("#nav-menu-wrapper").remove();
    $("#nav-title-wrapper").removeClass("col-xs-8");
    $("#nav-title-wrapper").addClass("col-xs-12");
    $("#nav-title").css("font-size", "18px");
  } else {
    $("#mag-nav").css("height", "72px");
  }

  $("#step-" + $("li.active").attr("data-slide-to")).addClass("current-step");
  $("#nav-title").html("チュートリアル<br>" + $("#step-" + $("li.active").attr("data-slide-to")).text());

  $("#btn-next-step").on("click", function(e) {
    $("#carousel-next").trigger('click');
  });

  $(".carousel-control").on(
          "click",
          function(e) {
            setTimeout(function() {
              $(".step").removeClass("current-step");
              $("#step-" + $("li.active").attr("data-slide-to")).addClass("current-step");
              $("#nav-title").html(
                      "チュートリアル<br>" + $("#step-" + $("li.active").attr("data-slide-to")).text());

              if ($("li.active").attr("data-slide-to") == 5) {
                $("#btn-start").show();
                $("#btn-skip-tutorial").hide();
                $("#btn-next-step").hide();
                $("#nav-title").html("チュートリアル<br>終了！");
              }
            }, 500)
          });
});
