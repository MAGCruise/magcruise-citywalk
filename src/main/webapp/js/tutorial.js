$(function() {
  if (!getUserId() || !getCheckpointGroupId()) {
    $("#nav-menu-wrapper").remove();
  }

  $('#btn-skip-tutorial').on('click', function(e) {
    swalConfirm("確認", 'チュートリアルをスキップしてよろしいですか？', "warning", function() {
      location.href = "signup.html";
    });
  });

  $("#step-" + $("li.active").attr("data-slide-to")).addClass("current-step");

  $("#btn-next-step").on("click", function(e) {
    $("#carousel-next").trigger('click');
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
