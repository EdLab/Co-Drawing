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


infoBox.onclick = function(event) {
  if(infoBox.style.display !== "none"){
    infoBox.style.display = "none";
  }
}

infoBox.ontouchstart = function() {
  if(infoBox.style.display !== "none"){
    infoBox.style.display = "none";
  }
}

var titleLink = document.getElementById("about-link");

var startInfo = document.getElementsByClassName("startInfo")[0];
var artInfo = document.getElementsByClassName("artInfo")[0];

function showInfo() {
  if (infoBox.style.display !== "block"){
  	startInfo.style.display = "none";
  	infoBox.style.display = "block";
  	artInfo.style.display = "inline-block";
  }
}

// titleLink.onclick = showInfo();
// titleLink.ontouchstart = showInfo();














