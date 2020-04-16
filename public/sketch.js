// Collaborative Drawing for Harlem Renaissance @ Gottesman Libraries
// version 2.00 with artworks
// April 2020
// by CARLiE YUTONG ZHANG

let myp5;

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

function startSketch(){

  let sketch = function(p) {

    p.preload = function() {
        img = p.loadImage(imgURL);
    }

    p.setup = function() {
      /************ user interface ************/
      let btnContainer = document.getElementById('btnHolder');

      // colors
      c = colors[colors.length-2];

      for( let i = 0; i < colors.length; i++) {
        colorBtn[i] = p.createButton('');
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
      resetBtn = p.createButton('Clear');
      resetBtn.class('resetBtn');
      resetBtn.parent(btnContainer);
      resetBtn.mousePressed(resetCanvas);

      // Only desktop can save
      var userAgent = navigator.userAgent || navigator.vendor || window.opera;
      if (/iPad|iPhone|iPod|Android|Windows Phone/.test(userAgent) && !window.MSStream) {
        infoBtn = p.createButton('About');
        infoBtn.parent(btnContainer);
        infoBtn.mousePressed(showInfo);

      } else{
        submitBtn = p.createButton('Save');
        submitBtn.parent(btnContainer);
        submitBtn.mousePressed(saveImg);

        infoBtn = p.createButton('About');
        infoBtn.parent(btnContainer);
        infoBtn.mousePressed(showInfo);
      }


      /************ canvas ************/
      let cnvContainer = document.getElementById('cnvHolder');

      if (p.windowWidth-182 >= p.windowHeight) {
        h = p.windowHeight;
        w = h;
      } else if (p.windowWidth>= p.windowHeight) {
        h = p.windowHeight - 182;
        w = h;
      } else{
        w = p.windowWidth;
        h = w;
      }
      scl = w/768;

      let cnv = p.createCanvas(w, h);
      cnv.parent(cnvContainer);

      //attach listener for canvas click only
      cnv.mousePressed(cnvPressed);
      cnv.mouseReleased(cnvReleased);

      //touch screen
      cnv.touchStarted(cnvPressed);
      cnv.touchEnded(cnvReleased);
      cnv.touchMoved(cnvDragged);

      p.background(255);
      p.image(img, 0, 0, w, h);

      //drawing set up
      current = p.createVector(0,0);
      previous = p.createVector(0,0);

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
                p.fill(255);
                p.noStroke();
                p.ellipse(data.x0*w, data.y0*h, 15*scl, 15*scl);
              }
              else{
                for( let i = 0; i < paths.length; i++) {
                  if (paths[i].paintID == data.id0){
                    // Add new particle
                    let pos = p.createVector(data.x0*w, data.y0*h);
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

    p.draw = function() {
      // nothing happening here
      if((p.mouseX<0)||(p.mouseX>w)||(p.mouseY<0)||(p.mouseY>h)){
        cnvReleased();
      }
    }

    p.mouseDragged = function() {
      cnvDragged();
    }
  }

  myp5 = new p5(sketch);

}

// Start it up
function cnvPressed() {
  painting = true;
  previous.x = myp5.mouseX;
  previous.y = myp5.mouseY;
  paths.push(new Path(myID));

  if (painting) {
    sendData(myp5.mouseX/w, myp5.mouseY/h, c, force, myID, 1);
  }
}

function cnvDragged() {
  if (painting) {
    if (c == '#fff'){
      myp5.fill(255);
      myp5.noStroke();
      myp5.ellipse(myp5.mouseX, myp5.mouseY, 15, 15);
    }
    else{
      paint(myp5.mouseX, myp5.mouseY, c);
    }

    sendData(myp5.mouseX/w, myp5.mouseY/h, c, force, myID, 0);
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
  sendData(myp5.mouseX/w, myp5.mouseY/h, c, force, myID, -1);
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
      myp5.stroke(this.particles[i].c);
      this.particles[i].display(this.particles[i+1]);
    }
  }  
}

// Particles along the path
class Particle {
  constructor(position, force, color) {
    this.position = myp5.createVector(position.x, position.y);
    this.fat = force;
    this.c = color;
  }
  // Draw a line to another
  display(other) {  
    // draw a line
    if (other) {
      myp5.strokeWeight(other.fat + this.fat*0.5);
      myp5.line(this.position.x, this.position.y, other.position.x, other.position.y);
    }
  }
}

