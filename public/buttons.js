
function resetCanvas() {
  paths.splice(0);
  myp5.background (255);
  myp5.image(img, 0, 0, w, h);
}

function saveImg() {

  let y = myp5.year();
  let mt = myp5.month();
  let d = myp5.day();
  let h = myp5.hour();
  let m = myp5.minute();
  let s = myp5.second();
  var ImgName = myp5.str(y) + myp5.str(mt) + myp5.str(d) + myp5.str(h) + myp5.str(m) + myp5.str(s);
  myp5.saveCanvas(ImgName,"png");
  var http = new XMLHttpRequest();
  var url = '/submit';
  http.open('POST', url, true);
  
  http.setRequestHeader('Content-Type', 'application/json');
  
  http.onreadystatechange = function() {//Call a function when the state changes.
      if(http.readyState == 4 && http.status == 200) {
        alert(http.responseText);
      }
  }
  http.send(JSON.stringify({image: myp5.canvas.toDataURL(), ImgName  }))
  // resetCanvas();
  // window.location.reload(true);

  var submitBox = document.getElementById("submitBox");
  var desktopBox = document.getElementById("desktop-box");
  var span = desktopBox.getElementsByClassName("close")[0];

  desktopBox.style.display = "inline-block";
  submitBox.style.display = "block";

  span.onclick = function() {
    submitBox.style.display = "none";
  }
  span.ontouchstart = function() {
    submitBox.style.display = "none";
  }
  
}

function showSubmit(){
  var submitBox = document.getElementById("submitBox");
  var mobileBox = document.getElementById("mobile-box");
  var span = mobileBox.getElementsByClassName("close")[0];

  mobileBox.style.display = "inline-block";
  submitBox.style.display = "block";

  span.onclick = function() {
    submitBox.style.display = "none";
  }
  span.ontouchstart = function() {
    submitBox.style.display = "none";
  }
}