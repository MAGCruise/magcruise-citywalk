var MAX_RANKING_INFO = 100;

$(function() {
  new JsonRpcClient(new JsonRpcRequest(getBaseUrl(), "getRanking", [getUserId(), getCourseId(),
      MAX_RANKING_INFO], function(data) {
    var myRanking = data.result.rank;
    var rankings = data.result.ranking;

    initNames();
    initRankingsView(rankings, false); // isGroup:false->個人
    initMyRankingView(myRanking);

    // var myGroupRanking = data.result.groupRank;
    // var groupRankings = data.result.groupRanking;
    // initMyGroupRankingView(myGroupRanking);
    // initRankingsView(groupRankings, true);

  })).rpc();
});

function initNames() {
  $('#my-user-name').text(getUserId());
  // $('#my-group-name').text(getGroupId());
}

function initMyRankingView(myRanking) {
  if (myRanking.rank == -1) {
    $('#my-rank').text("-");
    $('#my-score').text("-");
  } else {
    $('#my-rank').text(myRanking.rank);
    $('#my-score').text(myRanking.score);
  }
}

function initMyGroupRankingView(myGroupRanking) {
  if (myGroupRanking.rank == -1) {
    $('#my-group-rank').text("-");
    $('#my-group-score').text("-");
  } else {
    $('#my-group-rank').text(myGroupRanking.rank);
    $('#my-group-score').text(myGroupRanking.score);
  }
}

function initRankingsView(rankings, isGroup) {
  var MAX_ROW = 10;

  for (var i = 0; i < rankings.length; i++) {
    var ranking = rankings[i];

    if (i >= MAX_ROW && getUserId() != ranking.name) {
      continue;
    }

    var listItem = $('<li></li>').addClass('list-group-item');
    if (getUserId() == ranking.name) {
      listItem.addClass('alert alert-info');
    }
    var html = "";
    if (ranking.rank <= 3) {
      listItem.addClass('rank-text');
      var val = (ranking.rank == 1) ? 'first' : (ranking.rank == 2) ? 'second' : 'third';
      html = '<img src="../img/rank_' + val + '.png" class="rank-' + val + '-img"/>';
    } else {
      html = ranking.rank + '. ';
    }

    var ptMarginTop = (ranking.rank == 1) ? 11 : (ranking.rank == 2) ? 5 : 0;
    if (isGroup) {
      listItem.html(html + ranking.name + ' グループ' + '<div class="pull-right" style="margin-top: '
              + ptMarginTop + 'px">' + ranking.score + 'pt</div>');
      $('#group-rankings').append(listItem);
    } else {
      listItem.html(html + ranking.name + '<div class="pull-right" style="margin-top: '
              + ptMarginTop + 'px">' + ranking.score + 'pt</div>');
      $('#rankings').append(listItem);
    }
  }
  /*
   * <div class="row"> <h1>グループランキング</h1> <ul class="list-group">
   * <li class="list-group-item rank-text"><img src="../img/rank_first.png"
   * class="rank-first-img"/>ほげほげ チーム<p class="pull-right">100pt</p></li>
   * <li class="list-group-item rank-text"><img src="../img/rank_second.png"
   * class="rank-second-img"/>ほげほげ チーム<p class="pull-right">80pt</p></li>
   * <li class="list-group-item rank-text"><img src="../img/rank_third.png"
   * class="rank-third-img"/>ほげほげ チーム<p class="pull-right">50pt</p></li>
   * <li class="list-group-item">4. ほげほげ チーム<p class="pull-right">30pt</p></li>
   * <li class="list-group-item">5. ほげほげ チーム<p class="pull-right">20pt</p></li>
   * </ul> </div>
   */
}
