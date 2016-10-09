if (getUserId()) {
	location.href = 'login.html';
} else {
	location.href = 'register.html';
}

$(function() {
	$("#back").hide();
	$("#nav-menu").hide();
});
