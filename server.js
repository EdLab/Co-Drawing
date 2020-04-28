// Using express: http://expressjs.com/
var express = require('express');
var app = express();
var AWS = require('aws-sdk')
var fs = require('fs')
const bodyParser = require('body-parser');
app.use(bodyParser.json({limit: '50mb'}));

let {accessKeyId, secretAccessKey, Bucket} = process.env

// Set up the server
// process.env.PORT is related to deploying on heroku
var server = app.listen(process.env.PORT || 3000, listen);
function listen() {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://' + host + ':' + port);
}

app.use(express.static('public'));


app.post('/submit', function(req, res) {
  let body = req.body
  console.log(Object.keys(body))
  const s3 = new AWS.S3({
    accessKeyId,
    secretAccessKey
  })

  let buf = Buffer.from(req.body.image.replace(/^data:image\/\w+;base64,/, ""),'base64')
  var params = {
    Bucket,
    Key: `s3-${body.ImgName}.png`, 
    Body: buf,
    ContentEncoding: 'base64',
    ContentType: 'image/png'
  };



  s3.upload(params, function(err, data) {
      if (err) {
          throw err;
      }
      console.log(`File uploaded successfully. ${data.Location}`);
  });
})

// WebSocket Portion
// WebSockets work with the HTTP server
var io = require('socket.io')(server);

io.sockets.on('connection',

  function (socket) {
    const sessionID = socket.id;
  
    console.log("We have a new client: " + socket.id);
  
    socket.on('mouse',
      function(data) {
        // Data comes in as whatever was sent, including objects
        // console.log("Received: 'mouse' " + data.x0 + " " + data.y0 + " " + data.f0 );
      
        // Send it to all other clients
        socket.broadcast.emit('mouse', data);
        
        // This is a way to send to everyone including sender
        // io.sockets.emit('message', "this goes to everyone");

      }
    );
    
    socket.on('disconnect', function() {
      console.log("Client has disconnected");
    });
  }
);