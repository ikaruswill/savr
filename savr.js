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

(function($, window) {
    console.log('RUN');
    // Parameters
    var path = window.location.pathname;

    var options = {
        namespace     : 'savr',
        saveInterval  : '10000',
        clearOnSubmit : true,
        storageType   : 'localStorage'
    };
    var timer;
    var storage       = window[options.storageType];
    var storageKey    = [options.namespace, path];
    storageKey        = storageKey.join('.');
    var storageObject = {
        fields:{},
        radios:{},
        checkboxes:{},
        dropdowns:{}
    };

    /**
     * Takes in a jQuery object and saves all input and select element data into localStorage
     *
     * @param {jQuery} <form> or any enclosing element
     */
    var save = function(obj){
        console.log('SAVE');

        // Clear object as checkbox checks don't get unset
        storageObject.checkboxes = {};

        // Fields
        obj.find('input:not([type="radio"]):not([type="checkbox"])').each(function(){
            var name                          = $(this).attr('name');
            var value                         = $(this).val();
            storageObject.fields[name] = value; 
            console.log('name: ' + name + ' value: ' + value);
        });

        // Radios
        obj.find('input[type="radio"]:checked').each(function(){
            var name                          = $(this).attr('name');
            var value                         = $(this).val();
            storageObject.radios[name] = value;
            console.log('name: ' + name + ' value: ' + value);
        });

        // Checkbox
        obj.find('input[type="checkbox"]:checked').each(function(){
            var name                              = $(this).attr('name');
            var value                             = $(this).val();
            storageObject.checkboxes[name] = value;
            console.log('name: ' + name + ' value: ' + value);
        });

        // Dropdowns
        obj.find('select').each(function(){
            var name                             = $(this).attr('name');
            var value                            = $(this).children(':selected').val();
            storageObject.dropdowns[name] = value;
            console.log('name: ' + name + ' selected: ' + value);
        });
        
        var storageObjectString         = JSON.stringify(storageObject);
        storage[storageKey] = storageObjectString;

        console.log(storage[storageKey]);
    };

    /**
     * Takes in a jQuery object and loads all input and select element data from localStorage
     *
     * @param {jQuery} <form> or any enclosing element
     */
    var load = function(obj){
        console.log('LOAD');
        // Check if first save has been done
        if(typeof storage[storageKey] == 'undefined') {
            return;
        }

        console.log('Parsing: ' + storage[storageKey]);
        storageObject = JSON.parse(storage[storageKey]);

        //Fields
        var fieldNames = Object.keys(storageObject.fields);
        for(var i = 0; i < fieldNames.length; i++){
            var name     = fieldNames[i];
            var value    = storageObject.fields[name];
            var selector = 'input[name="' + name + '"]';
            obj.find(selector).val(value);
            console.log('name: ' + name + ' value: ' + value);
        }

        //Radios
        // Uncheck all radios
        obj.find('input[type="radio"]').each(function(){
            $(this).prop('checked', false);
        });

        var radioNames = Object.keys(storageObject.radios);
        for(var i = 0; i < radioNames.length; i++){
            var name     = radioNames[i];
            var value    = storageObject.radios[name];
            var selector = 'input[name="' + name + '"][value="' + value + '"]';
            obj.find(selector).prop('checked', true);
            console.log('name: ' + name + ' value: ' + value);
        }

        //Checkbox
        // Uncheck all checkboxes
        obj.find('input[type="checkbox"]').each(function(){
            $(this).prop('checked', false);
        });

        var checkboxNames = Object.keys(storageObject.checkboxes);
        for(var i = 0; i < checkboxNames.length; i++){
            var name     = checkboxNames[i];
            var value    = storageObject.checkboxes[name];
            var selector = 'input[name="' + name + '"][value="' + value + '"]';
            obj.find(selector).prop('checked', true);
            console.log('name: ' + name + ' value: ' + value);
        }

        //Dropdowns
        var dropdownNames = Object.keys(storageObject.dropdowns);
        for(var i = 0; i < dropdownNames.length; i++){
            var name     = dropdownNames[i];
            var value    = storageObject.dropdowns[name];
            var selector = 'select[name="' + name + '"]>option[value="' + value + '"]';
            obj.find(selector).prop('selected', true);
        }

    };

    var clear = function(){
        storage.removeItem(storageKey);
    };

    var startTimer = function(obj){
        timer = window.setInterval(function(){
            save(obj);
        }, options.saveInterval);
    };

    var stopTimer = function(){
        window.clearInterval(timer);
    };

    var supports = function(type) {
        try {
            var _s = window[type];
            var _x = '__storage_test__';
            storage.setItem(_x, _x);
            storage.removeItem(_x);
            return true;
        }
        catch(e) {
            return false;
        }
    };

    // jQuery plugin aspect
    $.fn.savr = function(action) {
        if(!supports(options.storageType)) {
            return this;
        }

        switch(action){
            case 'start':
                startTimer(this);
                break;
            case 'stop':
                stopTimer();
                break;
            case 'clear':
                clear();
                break;
            case 'save':
                save(this);
                break;
            case 'load':
                load(this);
                break;
            default:
            break;
        }
        return this;
    }
}(jQuery, window));