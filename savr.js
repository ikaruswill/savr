$(document).ready(function() {
	console.log('run');
	host = window.location.hostname;
	path = window.location.pathname;
	namespace = 'savr';
	saveInterval = '10000';
	storageKey = [namespace, path].join('.');
	storage = window.localStorage;
	storageObject = {
		fields:{},
		radios:{},
		checkboxes:{},
		dropdowns:{}
	};


	var save = function() {
		console.log('hostname: ' + host + ' pathname: ' + path);

		// Clear object as dropdown checks don't get unset
		storageObject['checkboxes'] = {};

		// Fields
		$('input:not([type="radio"]):not([type="checkbox"])').each(function(){
			name = $(this).attr('name');
			value = $(this).val();
			storageObject['fields'][name] = value; 
			console.log('name: ' + name + ' value: ' + value);
		});

		// Radios
		$('input[type="radio"]:checked').each(function(){
			name = $(this).attr('name');
			value = $(this).val();
			storageObject['radios'][name] = value;
			console.log('name: ' + name + ' value: ' + value);
		});

		// Checkbox
		$('input[type="checkbox"]:checked').each(function(){
			name = $(this).attr('name');
			value = $(this).val();
			storageObject['checkboxes'][name] = value;
			console.log('name: ' + name + ' value: ' + value);
		});

		// Dropdowns
		$('select').each(function(){
			name = $(this).attr('name');
			value = $(this).children(':selected').val();
			storageObject['dropdowns'][name] = value;
			console.log('name: ' + name + ' selected: ' + value);
		});

		storageObjectString = JSON.stringify(storageObject);
		storage[storageKey] = storageObjectString;

		console.log(storage[storageKey]);
	}

	var startTimer = function() {
		window.setInterval(save, saveInterval);
	}

	startTimer();
})