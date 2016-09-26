$(function() {
	getVisitedCheckPoints().forEach(function(checkpoint) {
		var html =  '<div class="row checkpoint">' +
		'<i class="fa fa-check-square" aria-hidden="true"></i>' +
						'<p class="name">' + checkpoint.name + '</p>' +
						// '<p class="answer">正解：ほげ</p>' +
						'<img src="../img/placeholder.svg" class="img-responsive img col-xs-3 col-sm-3 col-md-2 col-lg-2">' +
						'<div class="col-xs-9 col-sm-9 col-md-10 col-lg-10 description">' +
							checkpoint.label +
						'</div>' +
					'</div>';
		$('#checkpoints').append(html);
	});
});
