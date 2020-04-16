// Collaborative Drawing for Harlem Renaissance @ Gottesman Libraries
// version 2.00 with artworks
// April 2020
// by CARLiE YUTONG ZHANG

// Keep track of our socket connection
var socket;
let myID;

//color buttons
var colors = ['#e2af6e', '#d44a2e', '#019daa', '#86c045', '#295799', '#811c17', '#000', '#fff']; //white, red, blue, green, yellow, gray, black
let colorBtn = [];

// Store canvas drawing info
var w, h, scl;

let c;
let force;

// All the paths
let paths = [];

// Are we painting?
let painting = false;

// Where are we now and where were we?
let current;
let previous;

// Record image
let img;


function preload() {
  if (dataloaded){
    img = loadImage(imgURL);
  }
  // img = loadImage('img/1_TheJudgmentDay-bg.jpg');
}

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
  resetBtn.class('resetBtn');
  resetBtn.parent(btnContainer);
  resetBtn.mousePressed(resetCanvas);

  // Only desktop can save
  var userAgent = navigator.userAgent || navigator.vendor || window.opera;
  if (/iPad|iPhone|iPod|Android|Windows Phone/.test(userAgent) && !window.MSStream) {
    infoBtn = createButton('About');
    infoBtn.parent(btnContainer);
    infoBtn.mousePressed(showInfo);

  } else{
    submitBtn = createButton('Save');
    submitBtn.parent(btnContainer);
    submitBtn.mousePressed(saveImg);

    infoBtn = createButton('About');
    infoBtn.parent(btnContainer);
    infoBtn.mousePressed(showInfo);
  }


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
  scl = w/768;

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
  // image(img, 0, 0, w, h);

  //drawing set up
  current = createVector(0,0);
  previous = createVector(0,0);

  /************ socket ************/
  socket = io();

  socket.on('connect', function() {
    myID = socket.id;  // client socket id
    console.log(socket.id); 
  });

  socket.on('mouse',
    // When receive drawing
    function(data) {
      if(data.stat == 1){
        paths.push(new Path(data.id0)); //add new path from other painter
      }
      else if(data.stat == 0)
      {
          if (data.c0 == '#fff'){
            fill(255);
            noStroke();
            ellipse(data.x0*w, data.y0*h, 15*scl, 15*scl);
          }
          else{
            for( let i = 0; i < paths.length; i++) {
              if (paths[i].paintID == data.id0){
                // Add new particle
                let pos = createVector(data.x0*w, data.y0*h);
                paths[i].add(pos, data.f0*scl, data.c0);
                paths[i].display();
              }
            }
          }
      }
      else {
        for( let i = 0; i < paths.length; i++) {
          if (paths[i].paintID == data.id0){
            paths.splice(i,1);
          }
        }
      }
    
    }
  );

}

function draw() {
  // nothing happening here
  if((mouseX<0)||(mouseX>w)||(mouseY<0)||(mouseY>h)){
    cnvReleased();
  }
}


function mouseDragged() {
  cnvDragged();
}

// Start it up
function cnvPressed() {
  painting = true;
  previous.x = mouseX;
  previous.y = mouseY;
  paths.push(new Path(myID));

  if (painting) {
    sendData(mouseX/w, mouseY/h, c, force, myID, 1);
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
      paint(mouseX, mouseY, c);
    }

    sendData(mouseX/w, mouseY/h, c, force, myID, 0);
  }
}

// Stop
function cnvReleased() {
  // Remove my path from array
  for( let i = 0; i < paths.length; i++) {
    if (paths[i].paintID == myID){
      paths.splice(i,1);
    }
  }
  sendData(mouseX/w, mouseY/h, c, force, myID, -1);
  painting = false;
}




function paint(x, y, color){
  // Grab mouse position      
  current.x = x;
  current.y = y;

  // New particle's force is based on mouse movement
  force = p5.Vector.dist(current, previous);
  force = 5 - force*0.2;
  if (force < 1){
    force = 1;
  }

  // Select path
  for( let i = 0; i < paths.length; i++) {
    if (paths[i].paintID == myID){
      // Add new particle
      paths[i].add(current, force*scl, color);
      paths[i].display();
    }
  }

  // Store mouse values
  previous.x = current.x;
  previous.y = current.y;
}


// Function for sending to the socket
function sendData(x0, y0, c0, f0, id0, stat) {
  // console.log("sendmouse: " + x0 + " " + y0 + " " + c0);
  var data = {
    x0: x0,
    y0: y0,
    c0: c0,
    f0: f0,
    id0: id0,
    stat: stat // -1: remove, 0: keep drawing, 1: push new path
  };
  // Send that object to the socket
  socket.emit('mouse',data);
}


// A Path is a list of particles
class Path {
  constructor(paintID) {
    this.particles = [];
    this.paintID = paintID;
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



