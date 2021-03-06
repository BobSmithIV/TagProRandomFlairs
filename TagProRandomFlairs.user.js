// ==UserScript==
// @name          Random flairs
// @namespace     http://www.github.com/BobSmithIV/
// @description   Randomly choose a new flair each game.  
// @include       http://tagpro-*.koalabeast.com*
// @author        BobSmithIV, with some code inspired by ballparts' extensions, and help from snaps
// @version       4.0
// @grant         GM_getValue
// @grant         GM_setValue
// @downloadURL   https://raw.githubusercontent.com/BobSmithIV/TagProRandomFlairs/master/TagProRandomFlairs.user.js
// @require       https://code.jquery.com/jquery-3.1.1.min.js
// ==/UserScript==

(function () {
    'use strict';

    // load or initialize rotation
    var rotation;
    if (GM_getValue('rotation')){
        rotation = JSON.parse(GM_getValue('rotation'));
        rotationLoaded();
    } else if ($('#profile-btn').length > 0) {
        rotation = [];
        $.ajax({
            url: $('#profile-btn').attr('href'),
        }).done(function (data) {
            $(data).find('div#owned-flair li.flair-available').each(function () {
                rotation.push($(this).attr('data-flair'));
            });
            rotationLoaded();
        });
    }
    
    function rotationLoaded(){
        //if you're starting a new game or in a group, pick a new flair
        if (document.URL.search('games/find') >= 0 || document.URL.search('group') >= 0) {
            pickNewFlair();
        }

        //if you're on the profile page, add the UI to allow users to select the flair rotation
        if (document.URL.search('profile') >= 0) {
            addCheckboxes();
        }

        function addCheckboxes() {
            // add the checkboxes
            $('.flair-item.selectable:not(.empty)').append('<div class="randomFlairsCheckbox" title="Include flair in random flair rotation?"><input type="checkbox"></div>');
            // disable checkboxes for unobtained flairs
            $('.flair-unavailable .randomFlairsCheckbox input').attr("disabled", true);
            setCheckboxes();
            // activate the checkboxes
            $('.flair-item.selectable:not(.empty) input').click(function(){
                var flair = $(this).parent().parent().parent().attr('data-flair');
                if ($(this).is(':checked')){
                    rotation.push(flair);
                } else {
                    rotation = rotation.filter(item => item !== flair);
                }
                setCheckboxes();
                GM_setValue('rotation',JSON.stringify(rotation));
            });
            $('<style>.profile .flair-list .flair-item { padding-bottom: 43px; } .randomFlairsCheckbox { padding-top: 3px; margin-left: 1px; width: 16px; }</style>').appendTo('head'); 
        }
        
        function setCheckboxes(){
            // set the checkboxes to match the current rotation
            $('div li.flair-available').each(function(){
                if (rotation.includes($(this).attr('data-flair'))){
                    $(this).find('input').prop('checked', true);
                } else {
                    $(this).find('input').prop('checked', false);
                }
            });
        }

        function getCurrentRotation(){
            var rotation = [];
            $('div li.flair-available').each(function(){
                if ($(this).find('input').is(':checked')){
                  rotation.push($(this).attr('data-flair'));
                }
            });
            return rotation;
        }

        function pickNewFlair() {
            var flair = rotation[Math.floor(Math.random() * (rotation.length - 1))];
            $.post("/profile/selectedFlair", {flair: flair});
        }
    }
})();
