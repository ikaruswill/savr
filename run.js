$(document).ready(function(){
	var data;

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
	$('#start').click(function(){
		$('form').savr('start');
	});
	$('#stop').click(function(){
		$('form').savr('stop');
	});
	$('#is-pristine').click(function(){
		console.log($('form').savr('isPristine'));
	});
	$('#diff').click(function(){
		console.log($('form').savr('diff'));
	});
	$('#export').click(function(){
		console.log($('form').savr('export'));
		data = $('form').savr('export');
	});
	$('#import').click(function(){
		$('form').savr('import', data);
	});
})