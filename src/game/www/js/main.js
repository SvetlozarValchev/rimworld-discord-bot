var assets = {};
var canvas;
var ctx;
var socket;
var user;
var worldOffset;
var isMouseDown = false;
var mouseDownCoords = {x: 0, y: 0};
var isDrawing = true;
var characters = {};

(function () {
  init(function() {
    load();
  })
})();

function loadImage(name, cb) {
  var image = new Image();

  image.onload = function() {
    cb(image);
  };

  image.src = `asset/${name}.png`;
}

function loadAssets(callback) {
  var images = ['tree', 'grass', 'cube', 'character'];
  var toLoad = images.length;

  for(var i = 0; i < images.length; i++) {
    loadImage(images[i], (function(imgName) {
      return function(image) {
        assets[imgName] = image;

        if(--toLoad === 0) {
          callback();
        }
      }
    })(images[i]))
  }
}

function init(callback) {
  canvas = document.getElementById('scene');
  ctx = canvas.getContext("2d");
  worldOffset = {x: 0, y: 0};
  socket = io();

  var cookie = document.cookie.split("=");

  if(!cookie[0]) {
    fillUser();
  } else {
    user = cookie[1];
  }

  socket.on('positionUpdate', function(data) {
    characters = data;
  });

  socket.emit('checkUser', user);

  socket.on('resolveUser', function(valid) {
    if(!valid) {
      fillUser();
    }

    document.cookie = "user=" + user;

    loadAssets(callback);
  });
}

function fillUser() {
  user = prompt('Fill user');
  document.cookie = "user=" + user;

  socket.emit('newUser', user);
}

function load() {
  document.addEventListener('mousedown', function(e) {
    isMouseDown = true;
    mouseDownCoords.x = e.x;
    mouseDownCoords.y = e.y;
  });

  document.addEventListener('mouseup', function(e) {
    isMouseDown = false;
  });

  document.addEventListener('mousemove', function(e) {
    if(isMouseDown) {
      worldOffset.x -= mouseDownCoords.x - e.x;
      worldOffset.y -= mouseDownCoords.y - e.y;
      mouseDownCoords.x = e.x;
      mouseDownCoords.y = e.y;
    }
  });

  document.addEventListener('keydown', function(e) {
    if(e.key === 'w') {
      socket.emit('move', {user: user, dir: 'up'});
    } else if(e.key === 's') {
      socket.emit('move', {user: user, dir: 'down'});
    } else if(e.key === 'a') {
      socket.emit('move', {user: user, dir: 'left'});
    } else if(e.key === 'd') {
      socket.emit('move', {user: user, dir: 'right'});
    }
  });

  window.requestAnimationFrame(draw);
  socket.emit('move');
}

function draw() {
  clearCanvas();

  ctx.fillStyle = '#333333';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#AAAAAA';
  ctx.font = '16px monospace';
  ctx.fillText("Hello world", 10, 20);

  drawIsometric();
  drawCharacter();

  if(isDrawing) {
    window.requestAnimationFrame(draw);
  }
}

function clearCanvas() {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

function drawIsometric() {
  var startingPoint = {x: 600, y: 20};
  var size = 42;
  var rowLength = 1;
  var y, j;
  var side = 25;
  var row = 1;

  for(y = 0; y < side; y++) {
    j = 0;
    while(j < rowLength) {
      ctx.drawImage(assets['cube'], worldOffset.x + startingPoint.x + j * size - rowLength * size / 2, worldOffset.y + startingPoint.y + row * size * 0.25, assets['cube'].width, assets['cube'].height);
      j++;
    }

    row++;
    rowLength++;
  }

  for(y = side; y >= 0; y--) {
    j = 0;
    while(j < rowLength) {
      ctx.drawImage(assets['cube'], worldOffset.x + startingPoint.x + j * size - rowLength * size / 2, worldOffset.y + startingPoint.y + row * size * 0.25, assets['cube'].width, assets['cube'].height);
      j++;
    }

    row++;
    rowLength--;
  }

  row = 1;

  for(y = 0; y < side; y++) {
    j = 0;
    while(j < rowLength) {
      ctx.drawImage(assets['grass'], worldOffset.x + startingPoint.x + j * size - rowLength * size / 2, worldOffset.y + startingPoint.y + row * size * 0.25 - 32, assets['cube'].width, assets['cube'].height);
      j++;
    }

    row++;
    rowLength++;
  }

  for(y = side; y >= 0; y--) {
    j = 0;
    while(j < rowLength) {
      ctx.drawImage(assets['grass'], worldOffset.x + startingPoint.x + j * size - rowLength * size / 2, worldOffset.y + startingPoint.y + row * size * 0.25 - 32, assets['cube'].width, assets['cube'].height);
      j++;
    }

    row++;
    rowLength--;
  }

  row = 1;

  var trees = ['3:2', '4:3', '5:2', '8:4', '12:2', '12:3', '13:3'];

  for(y = 0; y < side; y++) {
    j = 0;
    while(j < rowLength) {
      if(trees.indexOf(y + ':' + j) !== -1) {
        ctx.drawImage(assets['tree'], worldOffset.x + startingPoint.x + j * size - rowLength * size / 2, worldOffset.y + startingPoint.y + row * size * 0.25 , assets['cube'].width, assets['cube'].height);
      }
      j++;
    }

    row++;
    rowLength++;
  }

  for(y = side; y >= 0; y--) {
    j = 0;
    while(j < rowLength) {
      if(trees.indexOf(y + ':' + j) !== -1) {
        ctx.drawImage(assets['tree'], worldOffset.x + startingPoint.x + j * size - rowLength * size / 2, worldOffset.y + startingPoint.y + row * size * 0.25 , assets['cube'].width, assets['cube'].height);
      }
      j++;
    }

    row++;
    rowLength--;
  }
}

function drawCharacter() {
  for(var key in characters) {
    ctx.drawImage(assets['character'], characters[key].x, characters[key].y, assets['character'].width, assets['character'].height);
  }
}