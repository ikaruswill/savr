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
    // Parameters
    var debugMode = false;
    var path      = window.location.pathname;
    var timers    = [];
    var options   = {
        namespace     : 'savr',
        saveInterval  : '5000',
        clearOnSubmit : true,
        storageType   : 'localStorage'
    };
    var storage = window[options.storageType];

    function log(message){
        if(debugMode){
            console.log(message);
        }
    }

    log('[SAVR] Initialized!');

    /**
     * Generates the storage key based on the attributes of the object
     *
     * @param {jQuery} obj <form> or any enclosing element
     * @return The storage key in the form of a String
     */
    function getStorageKey(obj){
        var identifierSuffix = '';

        // Identify the selected form(s)
        if(typeof obj.attr('id') != 'undefined'){
            identifierSuffix = obj.attr('id');
        } else if(typeof obj.attr('name') != 'undefined'){
            identifierSuffix = obj.attr('name');
        } else if(typeof obj.attr('class') != 'undefined'){
            identifierSuffix = obj.attr('class').split(' ').join('.');
        }

        // Generate storageKey
        var storageKeyArr = [options.namespace, path];
        if(identifierSuffix !== ''){
            storageKeyArr.push(identifierSuffix);
        }
        return storageKeyArr.join('.');
    };



    /**
     * Saves all input and select element data into localStorage
     *
     * @param {jQuery} obj <form> or any enclosing element
     * @param {string} storageKey The key for the data to be saved under
     */
    function save(obj, storageKey){
        log('[SAVE] StorageKey: ' + storageKey);

        var storageObject = {
            fields:{},
            radios:{},
            checkboxes:{},
            dropdowns:{}
        };

        // Fields
        obj.find('input[type="text"]').each(function(){
            var name                   = $(this).attr('name');
            var value                  = $(this).val();
            storageObject.fields[name] = value; 
            log('[SAVE] [Text input]  ' + 'name: ' + name + ' value: ' + value);
        });

        // Radios
        obj.find('input[type="radio"]:checked').each(function(){
            var name                   = $(this).attr('name');
            var value                  = $(this).val();
            storageObject.radios[name] = value;
            log('[SAVE] [Radio button]  ' + 'name: ' + name + ' value: ' + value);
        });

        // Checkbox
        obj.find('input[type="checkbox"]:checked').each(function(){
            var name                       = $(this).attr('name');
            var value                      = $(this).val();
            storageObject.checkboxes[name] = value;
            log('[SAVE] [Checkbox]  ' + 'name: ' + name + ' value: ' + value);
        });

        // Dropdowns
        obj.find('select').each(function(){
            var name                      = $(this).attr('name');
            var value                     = $(this).children(':selected').val();
            storageObject.dropdowns[name] = value;
            log('[SAVE] [Dropdown]  ' + 'name: ' + name + ' selected: ' + value);
        });
        
        var storageObjectString = JSON.stringify(storageObject);
        storage[storageKey]     = storageObjectString;

        log('[SAVE] JSON: ' + storage[storageKey]);
    };

    /**
     * Loads all input and select element data from localStorage
     *
     * @param {jQuery} obj <form> or any enclosing element
     * @param {string} storageKey The key from which the data is loaded
     */
    function load(obj, storageKey){
        log('[LOAD] StorageKey: ' + storageKey);
        // Check if first save has been done
        if(typeof storage[storageKey] == 'undefined') {
            return;
        }

        log('[LOAD] JSON: ' + storage[storageKey]);
        var storageObject = JSON.parse(storage[storageKey]);

        //Fields
        var fieldNames = Object.keys(storageObject.fields);
        for(var i = 0; i < fieldNames.length; i++){
            var name     = fieldNames[i];
            var value    = storageObject.fields[name];
            var selector = 'input[name="' + name + '"]';
            obj.find(selector).val(value);
            log('[LOAD] [Text input]  ' + 'name: ' + name + ' value: ' + value);
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
            log('[LOAD] [Radio button]  ' + 'name: ' + name + ' value: ' + value);
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
            log('[LOAD] [Checkbox]  ' + 'name: ' + name + ' value: ' + value);
        }

        //Dropdowns
        var dropdownNames = Object.keys(storageObject.dropdowns);
        for(var i = 0; i < dropdownNames.length; i++){
            var name     = dropdownNames[i];
            var value    = storageObject.dropdowns[name];
            var selector = 'select[name="' + name + '"]>option[value="' + value + '"]';
            obj.find(selector).prop('selected', true);
            log('[LOAD] [Dropdown]  ' + 'name: ' + name + ' selected: ' + value);
        }

    };

    /**
     * Checks if any data is stored in localStorage under the specified key
     *
     * @param {string} storageKey The key to be checked
     * @return true if data exists under the specified key
     */
    var exists = function(storageKey){
        if(typeof storage[storageKey] == 'undefined') {
            return false;
        }
        return true;
    };

    /**
     * Checks if the form is in it's default (pristine) state
     *
     * @param {jQuery} obj <form> or any enclosing element
     * @return {boolean} true if form is in it's default state
     */
    function isPristine(obj){
        var isPristine = true;
        obj.find('input[type="text"]').each(function(){
            if($(this).val() != $(this).prop('defaultValue')) {
                isPristine = false;
                log('[ISPRISTINE] [Text input] ' + $(this).attr('name') + ' is dirty');
                return false;
            }
        });

        if(isPristine == false) return false;

        obj.find('input[type="radio"], input[type="checkbox"]').each(function(){
            if(this.checked != $(this).prop('defaultChecked')) {
                isPristine = false;
                log('[ISPRISTINE] [Radio/Checkbox] ' + $(this).attr('name') + ' is dirty');
                return false;
            }
        });

        if(isPristine == false) return false;

        obj.find('select').each(function(){
            for(var i = 0; i < this.length; i++){
                var currentOption = this.options[i];
                if(currentOption.selected != currentOption.defaultSelected) {
                    isPristine = false;
                    log('[ISPRISTINE] [Select] ' + $(this).attr('name') + ' is dirty');
                    return false;
                }
            }
        });

        return isPristine;
    }

    /**
     * Checks whether the form is different from the form data saved
     *
     * @param {jQuery} obj <form> or any enclosing element
     * @param {string} storageKey The key from which the data is loaded
     */
    function diff(obj, storageKey){
        log('[DIFF] StorageKey: ' + storageKey);
        var diff = false;

        // Check if first save has been done
        if(typeof storage[storageKey] == 'undefined') {
            return true;
        }

        log('[DIFF] JSON: ' + storage[storageKey]);
        var storageObject = JSON.parse(storage[storageKey]);

         // Fields
        obj.find('input[type="text"]').each(function(){
            var name                   = $(this).attr('name');
            var value                  = $(this).val();
            if(storageObject.fields[name] != value){
                diff = true;
                log('[DIFF] [Text input Live]  ' + 'name: ' + name + ' value: ' + value);
                log('[DIFF] [Text input Saved]  ' + 'name: ' + name + ' value: ' + storageObject.fields[name]);
                return false;
            }
        });

        if(diff == true) return diff;

        // Radios
        obj.find('input[type="radio"]:checked').each(function(){
            var name                   = $(this).attr('name');
            var value                  = $(this).val();
            if(storageObject.radios[name] != value){
                diff = true;
                log('[DIFF] [Radio button Live]  ' + 'name: ' + name + ' value: ' + value);
                log('[DIFF] [Radio button Saved]  ' + 'name: ' + name + ' value: ' + storageObject.radios[name]);
                return false;
            }
        });

        if(diff == true) return diff;

        // Checkbox
        obj.find('input[type="checkbox"]:checked').each(function(){
            var name                       = $(this).attr('name');
            var value                      = $(this).val();
            if(storageObject.checkboxes[name] != value){
                diff = true;
                log('[DIFF] [Checkbox Live]  ' + 'name: ' + name + ' value: ' + value);
                log('[DIFF] [Checkbox Saved]  ' + 'name: ' + name + ' value: ' + storageObject.checkboxes[name]);
                return false;
            }
        });

        if(diff == true) return diff;

        // Dropdowns
        obj.find('select').each(function(){
            var name                      = $(this).attr('name');
            var value                     = $(this).children(':selected').val();
            if(storageObject.dropdowns[name] != value){
                diff = true;
                log('[DIFF] [Dropdown Live]  ' + 'name: ' + name + ' value: ' + value);
                log('[DIFF] [Dropdown Saved]  ' + 'name: ' + name + ' value: ' + storageObject.dropdowns[name]);
                return false;
            }
        });

        return diff;
    }

    /**
     * Removes the specified key-value pair in localStorage
     *
     * @param {string} storageKey The key to be checked
     */
    function clear(storageKey){
        storage.removeItem(storageKey);
    };

    /**
     * Starts saving the data to storage periodically, specified by the saveInterval variable.
     *
     * @param {jQuery} obj <form> or any enclosing element
     * @param {string} storageKey The key for the data and timer to be saved under
     */
    function startTimer(obj, storageKey){
        timer = window.setInterval(function(){
            save(obj, storageKey);
        }, options.saveInterval);
        timers[storageKey] = timer;
    };

    /**
     * Stops periodically saving data to storage
     *
     * @param {string} storageKey The key in which the timer to be removed is saved under
     */
    function stopTimer(storageKey){
        window.clearInterval(timers[storageKey]);
    };

    /**
     * Checks for support of the storage type
     *
     * @param {string} type The storage type to be checked
     */
    function supports(type) {
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

        // Exists and isPristine does not return a jQuery object and hence is not chainable
        switch(action){
            case 'exists':
                var allExists = true;
                this.each(function(){
                    var storageKey = getStorageKey($(this));
                    allExists = exists(storageKey);
                    if(!allExists){
                        return false;
                    }
                });
                return allExists;
            case 'isPristine':
                var allPristine = true;
                this.each(function(){
                    var storageKey = getStorageKey($(this));
                    allPristine = isPristine($(this));
                    if(!allPristine){
                        return false;
                    }
                });
                return allPristine;

                return isPristine(this);
            case 'diff':
                var allDiff = false;
                this.each(function(){
                    var storageKey = getStorageKey($(this));
                    allDiff = diff($(this), storageKey);
                    if(allDiff){
                        return false;
                    }
                });
                return allDiff;
            default:
                break;
        }

        return this.each(function(){
            var storageKey = getStorageKey($(this));
            log('[SAVR] Action: ' + action + ' StorageKey: ' + storageKey);
            // Function body
            switch(action){
                case 'start':
                    startTimer($(this), storageKey);
                    break;
                case 'stop':
                    stopTimer(storageKey);
                    break;
                case 'clear':
                    clear(storageKey);
                    break;
                case 'save':
                    save($(this), storageKey);
                    break;
                case 'load':
                    load($(this), storageKey);
                    break;
                default:
                    break;
            }
        });
    }
}(jQuery, window));