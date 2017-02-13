/**
 * Created by hugomarques on 2/12/17.
 */
var socket;

function setup() {
  socket = io.connect("http://localhost:3000");
  socket.on('mouse', newDrawing);
  createCanvas(600, 400);
  background(51);
}

function newDrawing(data) {
  noStroke();
  fill(255, 0, 100);
  ellipse(data.x, data.y, 36, 36);
}

function mouseDragged() {
  var data = {
    x: mouseX,
    y: mouseY,
    toString: function() {
      return mouseX +","+ mouseY;
    }
  }
  console.log("Sending: " + data);
  socket.emit("mouse", data);
  noStroke();
  fill(255);
  ellipse(data.x, data.y, 36, 36);
}

function draw() {
}