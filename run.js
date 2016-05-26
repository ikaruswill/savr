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
		data = $('form').savr('export');
		$('#exported').val(JSON.stringify(data));
	});
	$('#import').click(function(){
		data = JSON.parse($('#toImport').val());
		$('form').savr('import', data);
	});
})