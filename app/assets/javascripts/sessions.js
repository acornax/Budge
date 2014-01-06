$(document).ready(function(){

	$('#log_in').on('click', function(){
		$('#login_form').submit();
	});

	$('#create_account').on('click', function(){
		$('#new_user').submit();
	});

});