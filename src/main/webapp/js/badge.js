$(function() {
  new JsonRpcClient(new JsonRpcRequest(getBaseUrl(), "getBadges", [getUserId(), getCourseId()],
          function(data) {
            initBadgesView(data.result);
          })).rpc();
});

function initBadgesView(badges) {
  if (badges.length != 0) {
    $('#badges').empty();
  }
  badges.forEach(function(badge, i) {
    var badgeElem = $('<div class="badge-item col-xs-6 col-sm-4 col-md-3 col-lg-2">'
            + '<div class="wrapper">' + '<img src="../' + badge.imgSrc + '">' + '<p class="name">'
            + badge.name + '</p>' + '</div>' + '</div>');
    $('#badges').append(badgeElem);
  });
}
