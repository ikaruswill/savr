/**********************************************************************************************

Copyright (c) 2016 Will Ho

Permission is hereby granted, free of charge, to any person obtaining a copy of this software 
and associated documentation files (the "Software"), to deal in the Software without 
restriction, including without limitation the rights to use, copy, modify, merge, publish, 
distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the 
Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or 
substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING 
BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND 
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, 
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

Savr is a script that saves (the day) your form states by using your browser's local storage
to prevent data loss on closing the browser or navigating away when filling in forms.

**********************************************************************************************/

$(document).ready(function() {
	console.log('run');
	host = window.location.hostname;
	path = window.location.pathname;

	options = {
		namespace     = 'savr';
		saveInterval  = '10000';
		clearOnSubmit = true;
		storageKey    = [namespace, path].join('.');
		storage       = window.localStorage;
	}
	
	storageObject = {
		fields:{},
		radios:{},
		checkboxes:{},
		dropdowns:{}
	};

	var save = function(){
		console.log('hostname: ' + host + ' pathname: ' + path);

		// Clear object as checkbox checks don't get unset
		storageObject['checkboxes'] = {};

		// Fields
		$('input:not([type="radio"]):not([type="checkbox"])').each(function(){
			name                          = $(this).attr('name');
			value                         = $(this).val();
			storageObject['fields'][name] = value; 
			console.log('name: ' + name + ' value: ' + value);
		});

		// Radios
		$('input[type="radio"]:checked').each(function(){
			name                          = $(this).attr('name');
			value                         = $(this).val();
			storageObject['radios'][name] = value;
			console.log('name: ' + name + ' value: ' + value);
		});

		// Checkbox
		$('input[type="checkbox"]:checked').each(function(){
			name                              = $(this).attr('name');
			value                             = $(this).val();
			storageObject['checkboxes'][name] = value;
			console.log('name: ' + name + ' value: ' + value);
		});

		// Dropdowns
		$('select').each(function(){
			name                             = $(this).attr('name');
			value                            = $(this).children(':selected').val();
			storageObject['dropdowns'][name] = value;
			console.log('name: ' + name + ' selected: ' + value);
		});
		
		storageObjectString                 = JSON.stringify(storageObject);
		options.storage[options.storageKey] = storageObjectString;

		console.log(options.storage[options.storageKey]);
	};

	var load = function(){
		console.log('LOAD');
		// Check if first save has been done
		if(typeof options.storage[options.storageKey] == 'undefined') {
			return;
		}
		console.log('Parsing: ' + options.storage[options.storageKey]);
		storageObject = JSON.parse(options.storage[options.storageKey]);

		//Fields
		fieldNames = Object.keys(storageObject['fields']);
		for(var i = 0; i < fieldNames.length; i++){
			name     = fieldNames[i];
			value    = storageObject['fields'][name];
			selector = 'input[name="' + name + '"]';
			$(selector).val(value);
			console.log('name: ' + name + ' value: ' + value);
		};

		//Radios
		// Uncheck all radios
		$('input[type="radio"]').each(function(){
			$(this).prop('checked', false);
		});

		radioNames = Object.keys(storageObject['radios']);
		for(var i = 0; i < radioNames.length; i++){
			name     = radioNames[i];
			value    = storageObject['radios'][name];
			selector = 'input[name="' + name + '"][value="' + value + '"]';
			$(selector).prop('checked', true);
			console.log('name: ' + name + ' value: ' + value);
		};

		//Checkbox
		// Uncheck all checkboxes
		$('input[type="checkbox"]').each(function(){
			$(this).prop('checked', false);
		});

		checkboxNames = Object.keys(storageObject['checkboxes']);
		for(var i = 0; i < checkboxNames.length; i++){
			name     = checkboxNames[i];
			value    = storageObject['checkboxes'][name];
			selector = 'input[name="' + name + '"][value="' + value + '"]';
			$(selector).prop('checked', true);
			console.log('name: ' + name + ' value: ' + value);
		};

		//Dropdowns
		dropdownNames = Object.keys(storageObject['dropdowns']);
		for(var i = 0; i < dropdownNames.length; i++){
			name     = dropdownNames[i];
			value    = storageObject['dropdowns'][name];
			selector = 'select[name="' + name + '"]>option[value="' + value + '"]';
			$(selector).prop('selected', true);
		};

	};

	var clear = function(){
		options.storage.removeItem(options.storageKey);
	};

	var startTimer = function(){
		window.setInterval(save, saveInterval);
	};

	$('#save').click(save);
	$('#load').click(load);

	load();
	startTimer();

	$('form').submit(function(){
		if(clearOnSubmit){
			clear();
		}
	});
})