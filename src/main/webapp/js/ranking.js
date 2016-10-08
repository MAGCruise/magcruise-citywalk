$(function() {
	new JsonRpcClient(new JsonRpcRequest(getBaseUrl(), "getRanking", [getUserId()], function(data) {
		var myGroupRanking	= data.result.groupRank;
		var groupRankings 	= data.result.groupRanking;
		var myRanking		= data.result.rank;
		var rankings 		= data.result.ranking;
		
		initNames();
		initMyRankingView(myRanking);
		initMyGroupRankingView(myGroupRanking);
		initRankingsView(rankings, false); 		// isGroup:false->個人
		initRankingsView(groupRankings, true);
	})).rpc();
});

function initNames() {
	$('#my-user-name').text(getUserId());
	$('#my-group-name').text(getGroupId());
}

function initMyRankingView(myRanking) {
	if (myRanking.rank == -1) {
		$('#my-ranking').hide();
	}
	$('#my-rank').text(myRanking.rank);
	$('#my-score').text(myRanking.score);
}

function initMyGroupRankingView(myGroupRanking) {
	if (myGroupRanking.rank == -1) {
		$('#my-group-ranking').hide();
	}
	$('#my-group-rank').text(myGroupRanking.rank);
	$('#my-group-score').text(myGroupRanking.score);
}

function initRankingsView(rankings, isGroup) {
	for (var i = 0; i < rankings.length; i++) {
		var ranking = rankings[i];
		
		var listItem = $('<li></li>').addClass('list-group-item');
		var html = "";
		if (i < 3) {
			listItem.addClass('rank-text');
			// 0->first, 1->second, 2->third
			var val = (i == 0) ? 'first' : (i == 1) ? 'second' : 'third';
			html = '<img src="../img/rank_' + val + '.png" class="rank-' + val + '-img"/>';
		} else {
			html = ranking.rank + '. ';
		}
		if (isGroup) {
			listItem.html(html + ranking.name + " グループ");
			$('#group-rankings').append(listItem);
		} else {
			listItem.html(html + ranking.name + " さん");
			$('#rankings').append(listItem);			
		}
	}
	/*
	<div class="row">
		<h1>グループランキング</h1>
		<ul class="list-group">
			<li class="list-group-item rank-text"><img src="../img/rank_first.png" class="rank-first-img"/>ほげほげ チーム<p class="pull-right">100pt</p></li>
			<li class="list-group-item rank-text"><img src="../img/rank_second.png" class="rank-second-img"/>ほげほげ チーム<p class="pull-right">80pt</p></li>
			<li class="list-group-item rank-text"><img src="../img/rank_third.png" class="rank-third-img"/>ほげほげ チーム<p class="pull-right">50pt</p></li>
			<li class="list-group-item">4. ほげほげ チーム<p class="pull-right">30pt</p></li>
			<li class="list-group-item">5. ほげほげ チーム<p class="pull-right">20pt</p></li>
		</ul>
	</div>
	*/
}
