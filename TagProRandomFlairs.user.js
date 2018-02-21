// ==UserScript==
// @name          Random flairs
// @namespace     http://www.github.com/BobSmithIV/
// @description   Randomly choose a new flair each game.  Also contains the ability to change the favicon to your current flair.
// @include       http://tagpro-*.koalabeast.com*
// @author        BobSmithIV, with some code inspired by ballparts' extensions
// @version       3.2
// @grant         GM_getValue
// @grant         GM_setValue
// @downloadURL   https://raw.githubusercontent.com/BobSmithIV/TagProRandomFlairs/master/TagProRandomFlairs.user.js
// @require       https://code.jquery.com/jquery-3.1.1.min.js
// ==/UserScript==

(function () {
    'use strict';

    //if you're starting a new game or in a group, pick a new flair
    if (document.URL.search('games/find') >= 0 || document.URL.search('group') >= 0) {
        pickNewFlair();
    }

    //if you're on the profile page, add the UI to allow users to select the flair rotation
    if (document.URL.search('profile') >= 0) {
        addCheckboxes();
        var rotation = getCurrentRotation();
    }
    
    function addCheckboxes() {
        // add the checkboxes
        $('.flair-item.selectable').append('<div class="randomFlairsCheckbox"><input type="checkbox"></div>');
        // disable checkboxes for unobtained flairs
        $('.flair-unavailable .randomFlairsCheckbox input').attr("disabled", true);
        // set the checkboxes to match the current rotation
        $('div#owned-flair li.flair-available').each(function(){
            if (rotation.includes($(this).attr('data-flair'))){
                $(this).find('input').prop('checked', true);
            } else {
                $(this).find('input').prop('checked', false);
            }
        });
        $('<style>.profile .flair-list .flair-item { padding-bottom: 43px; } .randomFlairsCheckbox { padding-top: 3px; margin-left: 1px; width: 16px; }</style>').appendTo('head'); 
    }
    
    function getCurrentRotation(){
        var rotation = [];
        $('div#owned-flair li.flair-available').each(function(){
            if ($(this).find('input').is(':checked')){
              rotation.push($(this).attr('data-flair'));
            }
        });
        return rotation;
    }

    function pickNewFlair() {
        console.log('was here');
        //randomly select a flair to use
        var flairs = [];
        $.ajax({
            url: $('#profile-btn').attr('href'),
        }).done(function (data) {
            $(data).find('div#owned-flair li.flair-available').each(function () {
                flairs.push($(this).attr('data-flair'));
            });
            var flair = flairs[Math.floor(Math.random() * (flairs.length - 1))];
            $.post("/profile/selectedFlair", {flair: flair});
        });
    }
})();
