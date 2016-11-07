$(function() {
  if (!getUserId() || !getCheckpointGroupId()) {
    $("#nav-menu-wrapper").remove();
  }
});
