// ==UserScript==
// @name          Random flairs
// @namespace     http://www.reddit.com/user/Bob_Smith_IV/
// @description   Randomly choose a new flair each game
// @include       http://tagpro-*.koalabeast.com*
// @author        BobSmithIV, with some code inspired by ballparts' extensions
// @version       1.1
// @grant         GM_getValue
// @grant         GM_setValue
// ==/UserScript==

var flairsToInclude = [	//Flairs to include.  Change the 'true' to 'false' to remove that flair from the flair rotation.  
true,	// TagPro Developer
true,	// Communtiy Contributor
true,	// Level 1 Donor ($10)
true,	// Level 2 Donor ($40)
true,	// Level 3 Donor ($100)
true,	// Community Contest Winner
true,	// Monthly Leader Board Winner
true,	// Weekly Leader Board Winner
true,	// Daily Leader Board Winner
true,	// Happy Birthday TagPro
true,	// Lucky You
true,	// How Foolish
true,	// Hare Today, Goon Tomorrow
true,	// Unfortunate Sniper Hacks TagPro
true,	// So Very Scary
true,	// Daryl Would Be Proud
true,   // Happy 2nd Birthday TagPro
true,   // Tower 1-1 Complete
false,	// Bacon (6°)
false,	// Moon (11°)
false,	// Freezing (32°)
false,	// Dolphin (42°)
false,	// Alien (51°)
false,	// Road Sign (66°)
false,	// Peace (69°)
true,	// Flux Capacitor (88°)
true,	// Microphone (98°)
true,	// Boiling (100°)
true,	// Dalmations (101°)
true,	// ABC (123°)
true,	// Love (143°)
true,	// Pokemon (151°)
true,	// Phi (162°)
true,	// U Turn (180°)
true,	// World (196°)
true,	// Bowling (300°)
true	// Pi (314°)
];


// ***  Don't change anything beneath this!  ***

//create the flair rotation
var flairNames = ['special.developer','special.helper','special.supporter','special.supporter2','special.supporter3','special.contest','boards.month','boards.week','boards.day',
                  'event.birthday','event.stPatricksDay','event.aprilFoolsDay','event.easter','event.hacked','event.halloween','event.survivor', 'event.birthday2', 'event.platformer',
                  'degree.bacon','degree.moon','degree.freezing','degree.dolphin','degree.alien','degree.roadsign','degree.peace','degree.flux','degree.microphone','degree.boiling',
                  'degree.dalmations','degree.abc','degree.love','degree.pokemon','degree.phi','degree.uturn','degree.world','degree.bowling','degree.pi'];
var flairRotation = [];
for (var i = 0; i<flairsToInclude.length; i++){
    if (flairsToInclude[i]){
        flairRotation.push(flairNames[i]);
    }
}

//intialize variables the first time the script is run
if(!GM_getValue('randomizeState')){
    GM_setValue('randomizeState','unrandomized');
}

//work out the user's current server:
GM_setValue('server', window.location.href.substring(window.location.href.indexOf('tagpro-')+7, window.location.href.indexOf('.koalabeast.com')));



//if on the home page, get the user's profile id and get ready to randomize
if (document.URL.substring(document.URL.search('.com/')+5).length===0){
    //work out the user's profile id:
    url = $('a[href^="/profile"]').attr('href');
	if(url !== undefined) {
	    var n = url.lastIndexOf('/');
	    var profileNum = url.substring(n + 1);
	    profilePage = 'http://tagpro-'+GM_getValue('server')+'.koalabeast.com/profile/'+profileNum;
	    GM_setValue('profileNum',profileNum);
	}
    GM_setValue('randomizeState','unrandomized');
}


//if you're starting a new game and aren't in a group, go to the profile to randomize flairs
if(document.URL.search('games/find')>=0 && !(tagpro.group.socket) && GM_getValue('randomizeState')=='unrandomized') {
    GM_setValue('randomizeState','sentToRandomizeFromJoiner');
    window.location.href = 'http://tagpro-'+GM_getValue('server')+'.koalabeast.com/profile/'+GM_getValue('profileNum');
}

//if you've just joined/rejoined a group, go to the profile to randomize flairs
if(document.URL.match(/groups\/./) && document.URL.search('create')<0 && GM_getValue('randomizeState')=='unrandomized') {
    GM_setValue('groupName',window.location.href.substring(window.location.href.lastIndexOf('/')+1));
    GM_setValue('randomizeState','sentToRandomizeFromGroup');
    window.location.href = 'http://tagpro-'+GM_getValue('server')+'.koalabeast.com/profile/'+GM_getValue('profileNum');
}


//if you've been sent to the profile to randomize flairs, pick any available flair at random, then go back to where you came from
if( document.URL.search('profile') >= 0 && (GM_getValue('randomizeState').search('sentToRandomize')>=0)) {

    //randomly select a flair to use
    elements = document.getElementsByTagName('input');
    flairs = [];
    for(var i=0; i<elements.length; i++) {
        //if the object found is indeed a flair radio, and that flair is in the current flair rotation, add that to the chooseable options
        if(elements[i].name=="selectedFlair" && flairRotation.indexOf(elements[i].value)>=0){
            flairs.push(elements[i]);
        }
    }
    chosenFlair = flairs[Math.floor(Math.random()*flairs.length)];
    chosenFlair.click();
    
    //if sent from group, set to return to group, else set to return to joiner
    if (GM_getValue('randomizeState')=='sentToRandomizeFromGroup'){
        returnTo='http://tagpro-'+GM_getValue('server')+'.koalabeast.com/groups/'+GM_getValue('groupName');
    }else{
        returnTo = 'http://tagpro-'+GM_getValue('server')+'.koalabeast.com/games/find/';
    }
    
    //save that we've now randomized the flair
    GM_setValue('randomizeState','randomized');
    
    //return to whence you came
    window.location.href = returnTo;
}


//if a game starts, not from a group, get ready to randomize the flair afterwards
if( document.URL.search(':80') >= 0){
	GM_setValue('randomizeState','unrandomized');
}
