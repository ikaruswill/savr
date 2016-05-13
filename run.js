$(document).ready(function(){
	$('form').savr('start');

	$('#save').click(function(){
		$('form').savr('save');
	});
	$('#load').click(function(){
		$('form').savr('load');
	});
	$('#clear').click(function(){
		$('form').savr('clear');
	});
	$('#exists').click(function(){
		console.log($('form').savr('exists'));
	});
})