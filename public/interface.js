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

if (performance.navigation.type == performance.navigation.TYPE_RELOAD) {
	// console.info( "This page is reloaded");
} 
else {
	// console.info( "This page is not reloaded");
	infoBox.style.display = "block";
}


var titleLink = document.getElementById("about-link");
var externalLink = document.getElementById("infoURL").getElementsByTagName("a")[0];

var isClickTitle = false;
var isClickURL = false;
var isTouchTitle = false;
var isTouchURL = false;


infoBox.onclick = function(event) {
  isClickTitle = titleLink.contains(event.target);
  isClickURL = externalLink.contains(event.target);

  if (!isClickTitle && !isClickURL && !isTouchTitle && !isTouchURL){
    if(infoBox.style.display !== "none"){
      infoBox.style.display = "none";
    }
  }
}

infoBox.ontouchstart = function(event) {
  isTouchTitle = titleLink.contains(event.target);
  isTouchURL = externalLink.contains(event.target);

  if (!isClickTitle && !isClickURL && !isTouchTitle && !isTouchURL){
    if(infoBox.style.display !== "none"){
      infoBox.style.display = "none";
    }
  }
}


function showInfo() {
  var startInfo = document.getElementsByClassName("startInfo")[0];
  var artInfo = document.getElementsByClassName("artInfo")[0];

	startInfo.style.display = "none";
	artInfo.style.display = "inline-block";
  infoBox.style.display = "block";
}

titleLink.onclick = function(){
  showInfo();
}

titleLink.ontouchstart = function(){
  showInfo();
}

