// ----------------------------------------
// Particle
// ----------------------------------------
function Particle( x, y, radius ) {
  this.init( x, y, radius );
}

Particle.prototype = {
  init: function( x, y, radius ) {
    this.alive = true;
    this.radius = radius || 10;
    this.wander = 0.15;
    this.theta = random( TWO_PI );
    this.drag = 0.92;
    this.color = '#0F0';
    this.x = x || 0.0;
    this.y = y || 0.0;
    this.vx = 0.0;
    this.vy = 0.0;
  },
  move: function() {
    this.x += this.vx;
    this.y += this.vy;
    this.vx *= this.drag;
    this.vy *= this.drag;
    this.theta += random( -0.5, 0.5 ) * this.wander;
    this.vx += sin( this.theta ) * 0.08;
    this.vy += cos( this.theta ) * 0.08;
    this.radius *= 0.99;
    this.alive = this.radius > 0.5;
  },
  draw: function( ctx ) {
    ctx.beginPath();
    ctx.arc( this.x, this.y, this.radius, 0, TWO_PI );
    ctx.fillStyle = this.color;
    ctx.fill();
  }
};

// ----------------------------------------
// Example
// ----------------------------------------
var MAX_PARTICLES = 350;
var particles = [];
var pool = [];
var socket;

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++ ) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

var demo = Sketch.create({
  container: document.getElementById( 'container' )
});
demo.setup = function() {
  demo.socketSetup();
  demo.colours = random([ '#69D2E7', '#A7DBD8', '#0F0', '#F38630', '#FA6900', '#FF4E50', '#F9D423' ]);

  // Set off some initial particles.
  var i, x, y;
  for ( i = 0; i < 20; i++ ) {
    x = ( demo.width * 0.5 ) + random( -100, 100 );
    y = ( demo.height * 0.5 ) + random( -100, 100 );
    demo.spawn( x, y );
  }
};

demo.spawn = function( x, y, color ) {
  var particle, theta, force;
  if ( particles.length >= MAX_PARTICLES )
    pool.push( particles.shift() );
  particle = pool.length ? pool.pop() : new Particle();
  particle.init( x, y, random( 5, 30 ) );
  particle.wander = random( 0.5, 2.0 );
  particle.color = color ? color : demo.colours;
  particle.drag = random( 0.9, 0.99 );
  theta = random( TWO_PI );
  // force = random( 2, 8 );
  // particle.vx = sin( theta ) * force;
  // particle.vy = cos( theta ) * force;
  particles.push( particle );
};

demo.update = function() {
  var i, particle;
  for ( i = particles.length - 1; i >= 0; i-- ) {
    particle = particles[i];
    if ( particle.alive ) particle.move();
    else pool.push( particles.splice( i, 1 )[0] );
  }
};

demo.draw = function() {
  demo.globalCompositeOperation  = 'lighter';
  for ( var i = particles.length - 1; i >= 0; i-- ) {
    particles[i].draw( demo );
  }
};

demo.socketSetup = function() {
  socket = io.connect("http://sketch.hugodesmarques.com");
  socket.on('mouse', demo.newParticles);
};

demo.newParticles = function(data) {
  demo.start();
  demo.spawn(data.x*demo.width, data.y*demo.height, data.color);
};

demo.mousemove = function() {
  var touch, max, i, n;
  for ( i = 0, n = demo.touches.length; i < n; i++ ) {
    touch = demo.touches[i];
    demo.spawn( touch.x, touch.y );
    var data = {
      x: touch.x/demo.width,
      y: touch.y/demo.height,
      color: demo.colours,
      toString: function() {
        return touch.x +","+ touch.y;
      }
    }
    socket.emit("mouse", data);
  }
};

