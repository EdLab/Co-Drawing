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
  console.log(ImgName);
  myp5.saveCanvas(ImgName,"png");

  // resetCanvas();
  // window.location.reload(true);
}