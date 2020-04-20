// lock touch screen
function preventBehavior(e) {
    e.preventDefault(); 
};

document.addEventListener("touchmove", preventBehavior, {passive: false});


/****** infobox ******/ 
// Detect if the page is reloaded
// if (window.performance) {
//   console.info("window.performance works fine on this browser");
// }
var infoBox = document.getElementById("credits");
var startInfo = document.getElementsByClassName("startInfo")[0];
var artInfo = document.getElementsByClassName("artInfo")[0];

if (performance.navigation.type == performance.navigation.TYPE_RELOAD) {
	// console.info( "This page is reloaded");
} 
else {
	// console.info( "This page is not reloaded");
	infoBox.style.display = "block";
}


var titleLink = document.getElementById("about-link");
var externalLink = document.getElementById("infoURL").getElementsByTagName("a");

var isClickTitle = false;
var isClickURL = false;
var isTouchTitle = false;
var isTouchURL = false;


infoBox.onclick = function(event) {
  isClickTitle = titleLink.contains(event.target);
  isClickURL = false;
  for (var i = externalLink.length - 1; i >= 0; i--) {
    if(externalLink[i].contains(event.target)){
      isClickURL = true;
    }
  }

  if (!isClickTitle && !isClickURL && !isTouchTitle && !isTouchURL){
    if(infoBox.style.display !== "none"){
      if(startInfo.style.display !== "none"){
        event.preventDefault();
        showInfo();
      }else{
        infoBox.style.display = "none";
      }
    }
  }
}

infoBox.ontouchstart = function(event) {
  isTouchTitle = titleLink.contains(event.target);
  isTouchURL = false;
  for (var i = externalLink.length - 1; i >= 0; i--) {
    if(externalLink[i].contains(event.target)){
      isTouchURL = true;
    }
  }

  if (!isClickTitle && !isClickURL && !isTouchTitle && !isTouchURL){
    if(infoBox.style.display !== "none"){
      if(startInfo.style.display !== "none"){
        event.preventDefault();
        showInfo();
      }else{
        infoBox.style.display = "none";
      }
    }
  }
}


function showInfo() {
	startInfo.style.display = "none";
	artInfo.style.display = "inline-block";
  infoBox.style.display = "block";
}

// titleLink.onclick = function(){
//   showInfo(event);
// }

// titleLink.ontouchstart = function(){
//   showInfo(event);
// }

