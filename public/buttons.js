function resetCanvas() {
  paths.splice(0);
  background (255);
  image(img, 0, 0, w, h);
}


function saveImg() {
  var userAgent = navigator.userAgent || navigator.vendor || window.opera;

  if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
  } 
  else {
    let y = year();
    let mt = month();
    let d = day();
    let h = hour();
    let m = minute();
    let s = second();
    var ImgName = str(y) + str(mt) + str(d) + str(h) + str(m) + str(s);

    saveCanvas(ImgName,"png");
    paths.splice(0);
    background (255);
    // image(img, 0, 0, w, h);
  }
  location.reload();

}
