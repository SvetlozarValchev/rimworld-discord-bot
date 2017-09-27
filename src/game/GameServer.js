const path = require('path');
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const characters = {};

class GameServer {
  static start() {
    app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, 'www', 'index.html'));
    });

    app.get('/js/:file', (req, res) => {
      res.sendFile(path.join(__dirname, 'www', 'js', req.params.file));
    });

    app.get('/asset/:asset', (req, res) => {
      res.set('Content-Type', 'text/png');
      res.sendFile(path.join(__dirname, '..', '..', 'assets', 'game', req.params.asset));
    });

    io.on('connection', function(socket){
      console.log('a user connected');

      socket.on('newUser', function(user){
        characters[user] = {
          x: 300,
          y: 300
        }
      });

      socket.on('checkUser', function(user) {
        io.emit('resolveUser', !!characters[user]);
      });

      socket.on('move', function(data) {
        if(data) {
          if(!characters[data.user]) {
            return;
          }

          if (data.dir === 'left') {
            characters[data.user].x -= 7;
          } else if (data.dir === 'right') {
            characters[data.user].x += 7;
          } else if (data.dir === 'up') {
            characters[data.user].y -= 7;
          } else if (data.dir === 'down') {
            characters[data.user].y += 7;
          }
        }

        io.emit('positionUpdate', characters);
        // io.emit('positionUpdate', { for: 'everyone' });
      });
    });

    http.listen(8080, function () {
      console.log('Server listening on port 8080!')
    });
  }
}

module.exports = GameServer;