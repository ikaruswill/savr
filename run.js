$(document).ready(function(){
	$('form').savr('start');

	$('#save').click(function(){
		$('form').savr('save');
	});
	$('#load').click(function(){
		$('form').savr('load');
	})
})