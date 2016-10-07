if (getUserId()) {
	location.href = 'login.html';
} else {
	location.href = 'register.html';
}

$(function() {
	$("#nav-menu").hide();
});
