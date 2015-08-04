// ==UserScript==
// @name          Random flairs
// @namespace     http://www.github.com/BobSmithIV/
// @description   Randomly choose a new flair each game.  Also contains the ability to change the favicon to your current flair.  
// @include       http://tagpro-*.koalabeast.com*
// @author        BobSmithIV, with some code inspired by ballparts' extensions
// @version       3.0
// @grant         GM_getValue
// @grant         GM_setValue
// @downloadURL   https://raw.githubusercontent.com/BobSmithIV/TagProRandomFlairs/master/TagProRandomFlairs.user.js
// ==/UserScript==

// Note that unlike in version 1.X of this script, to change which flairs to include in the flair rotation, visit your profile and tick the checkboxes of those flairs you want included. 

// initialize the favicon toggle variable the first time the script is run
if (GM_getValue('toggleFavicon')===undefined ){
    GM_setValue('toggleFavicon',false);

// change the favicon to the current flair if the user has selected that functionality
} else if (GM_getValue('toggleFavicon')){
    changeFavicon(GM_getValue('currentFlair'));
}

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

//if you're on the profile, add the new UI to allow users to select the flair rotation
if( document.URL.search('profile') >= 0 ){
	
    // make the 'toggle favicon' row and checkbox
	var row = getBoard().lastChild.appendChild(document.createElement('tr'));
	row.style.marginBottom='10px';
	row.style.height='50px';
	row.appendChild(document.createElement('td'));
	var label = row.appendChild(document.createElement('td'));
	row.appendChild(document.createElement('td'));
	row.appendChild(document.createElement('td'));
	var checkboxContainer = row.appendChild(document.createElement('td'));
	label.innerHTML='Change favicon to current flair'
	var faviconCheckbox = checkboxContainer.appendChild(document.createElement('input'));
	faviconCheckbox.type = 'checkbox';
	faviconCheckbox.id = 'faviconCheckbox';
    // set it to checked if appropriate
	if (GM_getValue('toggleFavicon')===true){
		faviconCheckbox.checked=true;
	}
    // toggle changing the favicon when this is clicked
	faviconCheckbox.onclick = function() {
		GM_setValue('toggleFavicon',this.checked);
        // if not checked, forget the saved flair
        if (!this.checked){
            GM_setValue('currentFlair','initial');
            changeFavicon('initial');
        }
	}
	
    //create the new column's header:
    x=getBoard().firstChild.childNodes;
    var newCell = x[0].appendChild(document.createElement('th'));
    newCell.innerHTML = 'Rotation';
    
    //initialize the list of all flairs
    allFlairs = [];
    
    for (var i = 1; i<x.length-1;i++){
        //create the new cell
        newCell = x[i].appendChild(document.createElement('td'));
		if (i%2===0){
			newCell.className = 'alt';
		}
        
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
                flairRotation[this.id]=this.checked;
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
    
    // change favicon if the user changes their flair manually too
    $('body').click(function(){
        if (GM_getValue('toggleFavicon')){
            elements = document.getElementsByTagName('input'); 
            for(var i=0; i<elements.length; i++) {
                if(elements[i].name=="selectedFlair" && elements[i].checked){ // if this is a selected flair radio,
                    if (GM_getValue('currentFlair')!=elements[i].value){ // if the selected flair is different to what it was before
                        GM_setValue('currentFlair',elements[i].value); // save the new value
                        changeFavicon(elements[i].value); // change the favicon 
                    }
                }
            }
        }
    });
    
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
    if (GM_getValue('toggleFavicon')){
        changeFavicon(chosenFlair);
    }
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

// changes the favicon to the inputted flair image, as hosted by myself on GitHub
function changeFavicon(flair) {
    var link = document.createElement('link');
    var oldLink = document.getElementById('dynamic-favicon');
    link.id = 'dynamic-favicon';
    link.rel = 'shortcut icon';
    link.href = 'https://raw.githubusercontent.com/BobSmithIV/TagProFaviconFlair/master/flairs/'+flair+'.png';
    if (oldLink) {
        document.head.removeChild(oldLink);
    }
    document.head.appendChild(link);
}
