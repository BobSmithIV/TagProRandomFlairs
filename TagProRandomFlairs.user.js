// ==UserScript==
// @name          Random flairs
// @namespace     http://www.github.com/BobSmithIV/
// @description   Randomly choose a new flair each game
// @include       http://tagpro-*.koalabeast.com*
// @author        BobSmithIV, with some code inspired by ballparts' extensions
// @version       3.0
// @grant         GM_getValue
// @grant         GM_setValue
// @downloadURL   https://raw.githubusercontent.com/BobSmithIV/TagProRandomFlairs/master/TagProRandomFlairs.user.js
// ==/UserScript==

// Note that unlike in version 1.X of this script, to change which flairs to include in the flair rotation, visit your profile and tick the checkboxes of those flairs you want included. 

// load the saved JSON if it exists
var flairRotation = 'needsBuilt';
if (GM_getValue('flairs')){
    flairRotation = JSON.parse(GM_getValue('flairs'));
}

//work out the user's current server:
GM_setValue('server', window.location.href.substring(window.location.href.indexOf('tagpro-')+7, window.location.href.indexOf('.koalabeast.com')));

//if on the home page, get the user's profile id
if (document.URL.substring(document.URL.search('.com/')+5).length===0){
    //work out the user's profile id:
    url = $('a[href^="/profile"]').attr('href');
	if(url !== undefined) {
	    var n = url.lastIndexOf('/');
	    var profileNum = url.substring(n + 1);
	    GM_setValue('profileNum',profileNum);
	}
    // if the flair rotation hasn't been initialized yet, go to the profile to initialize it
    if (flairRotation == 'needsBuilt'){
        GM_setValue('flairs',JSON.stringify({'state': 'beingBuilt'}));
        window.location.href = 'http://tagpro-'+GM_getValue('server')+'.koalabeast.com/profile/'+GM_getValue('profileNum');
    }
}

//if you're starting a new game or in a group, pick a new flair
if(document.URL.search('games/find')>=0 || document.URL.search('group')>=0) {
    pickNewFlair();
}

//if you're on the profile, add the new column to allow users to select the flair rotation
if( document.URL.search('profile') >= 0 ){
    
    //create the new column's header:
    x=getBoard().firstChild.childNodes;
    var newCell = x[0].appendChild(document.createElement('th'));
    newCell.innerHTML = 'Rotation';
    
    //initialize the list of all flairs
    allFlairs = [];
    
    for (var i = 1; i<x.length;i++){
        //create the new cell
        newCell = x[i].appendChild(document.createElement('td'));
        
        //if you've earned the flair,
        if (x[i].className!='fade'){
            //get the name of the flair as given by TagPro
            flairName = x[i].childNodes[3].firstChild.value;
            //save it to the list of all flairs
            allFlairs.push(flairName);
            
            //add a checkbox to the cell
            checkbox = newCell.appendChild(document.createElement('input'));
            checkbox.type = "checkbox";
            checkbox.id = flairName;
            
            // if the rotation hasn't been built yet, select the flair, or if the rotation has been built and this was included, select the flair
            if (flairRotation=='needsBuilt' || flairRotation['state']=='beingBuilt' || flairRotation[flairName]){
                checkbox.checked=true;
            
            // if this is a new flair
            } else if (flairRotation[flairName]===undefined){
                checkbox.checked=true;
                flairRotation[flairName]=true;
            }

            //toggle this flair in/out of rotation when the checkbox is clicked
            checkbox.onclick = function() {
                if (this.checked){
                    flairRotation[this.id]=true;
                }else{
                    flairRotation[this.id]=false;
                }
                GM_setValue('flairs',JSON.stringify(flairRotation));
            }
        }
    }
    // if this is the first time the profile has been visited, build the rotation
    if (flairRotation=='needsBuilt'||flairRotation['state']=='beingBuilt' ){
        var returnToHome = flairRotation['state']=='beingBuilt' 
        flairRotation={};
        for (var i = 0; i<allFlairs.length; i++){
            flairRotation[allFlairs[i]] = true;
        }
        GM_setValue('flairs',JSON.stringify(flairRotation));
        // if the user was sent here to build the rotation, send them back again
        if (returnToHome){
            window.location.href = 'http://tagpro-'+GM_getValue('server')+'.koalabeast.com/'
        }
    }
}

function pickNewFlair(){
    //randomly select a flair to use
    flairs=[];
    for (var flair in flairRotation) {
        if (flairRotation.hasOwnProperty(flair)&&flairRotation[flair]===true) {
            flairs.push(flair);
        }
    }
    chosenFlair = flairs[Math.floor((Math.random() * flairs.length))];

    // create the POST request to change flair
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST","http://tagpro-chord.koalabeast.com/profile/selectedFlair",true);
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

    // if POST is unsuccessful, alert the user
    xmlhttp.onreadystatechange=function(){
        if (xmlhttp.readyState==4){
            if ( xmlhttp.status==200){
            } else {
                console.log('Unable to toggle flair - POST request failed.')
            }
        }
    }
    // send the POST request
    xmlhttp.send('flair='+chosenFlair);
}

//get the leaderboard from the dom
function getBoard(){
    var x = document.getElementsByClassName("board");
    for (var i=x.length-1;i>=0;i--){
        if (x[i].childNodes[0].childNodes[0].childNodes[1].innerText=="Award"){
            return x[i];
        }
    }
}
