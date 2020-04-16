// Collaboratie Drawing for Harlem Renaissance @ Gottesman Libraries
// version 1.00 only drawing function
// April 2020
// by CARLiE YUTONG ZHANG

// Keep track of our socket connection
var socket;
const paintID;

var w;
var h;

var weight = 10;
var fat = 5;
let c;

//color buttons
var colors = ['#e2af6e', '#d44a2e', '#019daa', '#86c045', '#295799', '#811c17', '#000', '#fff']; //white, red, blue, green, yellow, gray, black
let colorBtn = [];

// All the paths
let paths = [];

// Are we painting?
let painting = false;

// Where are we now and where were we?
let current;
let previous;

function setup() {
  /************ user interface ************/
  let btnContainer = document.getElementById('btnHolder');

  // colors
  c = colors[colors.length-2];

  for( let i = 0; i < colors.length; i++) {
    colorBtn[i] = createButton('');
    // colorBtn[i].position(15, 160 + 80*i);
    colorBtn[i].parent(btnContainer);
    colorBtn[i].class('colorBtn');
    colorBtn[i].style('background-color', colors[i]);
    colorBtn[i].mousePressed(function(){
      c = colors[i];
      for( let i = 0; i < colors.length; i++) {
        colorBtn[i].removeClass('activeColor');
      }
      this.addClass('activeColor');
    });
  }
  colorBtn[colors.length-2].addClass('activeColor');

  // buttons
  resetBtn = createButton('Clear');
  // resetBtn.position(15, 15);
  resetBtn.class('resetBtn');
  resetBtn.parent(btnContainer);
  resetBtn.mousePressed(resetCanvas);

  submitBtn = createButton('Save');
  // submitBtn.position(15, 70);
  submitBtn.parent(btnContainer);
  submitBtn.mousePressed(saveImg);


  /************ canvas ************/
  let cnvContainer = document.getElementById('cnvHolder');

  if (windowWidth-182 >= windowHeight) {
    h = windowHeight;
    w = h;
  } else if (windowWidth>= windowHeight) {
    h = windowHeight - 182;
    w = h;
  } else{
    w = windowWidth;
    h = w;
  }

  let cnv = createCanvas(w, h);
  cnv.parent(cnvContainer);

  //attach listener for canvas click only
  cnv.mousePressed(cnvPressed);
  cnv.mouseReleased(cnvReleased);

  //touch screen
  cnv.touchStarted(cnvPressed);
  cnv.touchEnded(cnvReleased);
  cnv.touchMoved(cnvDragged);

  background(255);

  //drawing set up
  current = createVector(0,0);
  previous = createVector(0,0);

  /************ socket ************/
  socket = io();

  socket.on('connect', function() {
    paintID = socket.id;  // client socket id
    console.log(socket.id); 
  });

  socket.on('mouse',
    // When receive drawing
    function(data) {
      if(data.push){
        previous.x = data.x0;
        previous.y = data.y0;
        paths.push(new Path());
        // console.log("Push: " + data.x0 + " " + data.y0);
      }
      else {
        // console.log("Receive: " + data.x0 + " " + data.y0 + " " + data.c0);
        if (data.c0 == '#fff'){
          fill(255);
          noStroke();
          ellipse(data.x0*w, data.y0*h, 15, 15);
        }
        else{
          paint(data.x0, data.y0, data.c0);
        }
      }
    }
  );

}

function draw() {
  // nothing happening here
}


function mouseDragged() {
  cnvDragged();
}

// Start it up
function cnvPressed() {
  painting = true;
  previous.x = mouseX;
  previous.y = mouseY;
  paths.push(new Path());

  if (painting) {
    // paint(mouseX, mouseY);
    sendmouse(mouseX/w, mouseY/h, true, c);
  }
}

function cnvDragged() {
  if (painting) {
    if (c == '#fff'){
      fill(255);
      noStroke();
      ellipse(mouseX, mouseY, 15, 15);
    }
    else{
      paint(mouseX/w, mouseY/h, c);
    }

    // Send the mouse coordinates
    sendmouse(mouseX/w, mouseY/h, false, c);
  }
}
// Stop
function cnvReleased() {
  painting = false;
}



function paint(x, y, color){
  // Grab mouse position      
  current.x = x*w;
  current.y = y*h;

  // New particle's force is based on mouse movement
  let force = p5.Vector.dist(current, previous);
  force = 5 - force*0.2;
  if (force < 1){
    force = 1;
  }

  // Add new particle
  paths[paths.length - 1].add(current, force, color);

  // Store mouse values
  previous.x = current.x;
  previous.y = current.y;


  // Draw all paths
  for( let i = 0; i < paths.length; i++) {
    paths[i].display();
  }

  // Remove path after drawing
  if (paths.length > 1){
    paths.splice(0,1);
  }
  
}


// Function for sending to the socket
function sendmouse(x0, y0, push, c0) {
  // console.log("sendmouse: " + x0 + " " + y0 + " " + c0);
  // Make a data object to send
  var data = {
    x0: x0,
    y0: y0,
    push: push,
    c0: c0
  };
  // Send that object to the socket
  socket.emit('mouse',data);
}


function resetCanvas() {
  paths.splice(0);
  background (255);
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
  }

}


// A Path is a list of particles
class Path {
  constructor() {
    this.particles = [];
  }

  add(position, force, color) {
    // Add a new particle with a position and force
    this.particles.push(new Particle(position, force, color));
  }
  
  // Display path
  display() {    
    // Loop through backwards
    for (let i = this.particles.length - 1; i >= 0; i--) {
      stroke(this.particles[i].c);
      this.particles[i].display(this.particles[i+1]);
    }
  }  
}

// Particles along the path
class Particle {
  constructor(position, force, color) {
    this.position = createVector(position.x, position.y);
    this.fat = force;
    this.c = color;
  }
  // Draw a line to another
  display(other) {  
    // draw a line
    if (other) {
      strokeWeight(other.fat + this.fat*0.5);
      line(this.position.x, this.position.y, other.position.x, other.position.y);
    }
  }
}

