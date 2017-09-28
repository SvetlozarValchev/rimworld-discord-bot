const db = require('sqlite');
const Discord = require('discord.js');

const auth = require('./auth.json');
const HttpServer = require('./src/server/Server');
const Game = require('./src/game/Game');
const TicTacToe = require('./src/tictactoe/TicTacToe');
const Comics = require('./src/comics/Comics');
const Gifs = require('./src/gifs/Gifs');

// Bot Client
const client = new Discord.Client();

/** @type {Game} */
let game;

// Run server
HttpServer.start();

// On ready
client.on('ready', () => {
  console.info('Connected');
  console.info('Logged in as: ');
  console.info(client.user.username + ' - (' + client.user.id + ')');
});

// On Message Received
client.on("message", /** @type {Message} */ (message) => {
  if (message.author.bot) return;
  if (message.content.substring(0, 1) !== '!') return;

  let args = message.content.substring(1).split(' ');
  const cmd = args[0];

  args = args.splice(1);

  switch (cmd) {
    case 'ping': message.channel.send('Pong!'); break;
    case 'join': game.join(message, args); break;
    case 'stats': game.stats(message, args); break;
    case 'inventory': game.inventory(message, args); break;
    case 'colonists': game.colonists(message, args); break;
    case 'settle': game.settle(message, args); break;
    case 'settlement': game.settlement(message, args); break;
    case 'settlements': game.settlements(message, args); break;
    case 'abandon': game.abandon(message, args); break;
    case 'clearitems': game.clearItems(message, args); break;
    case 'ttt': {
      const cmd2 = args[0];
      args = args.splice(1);

      switch(cmd2) {
        case 'help': TicTacToe.help(message, args); break;
        case 'play': TicTacToe.play(message, args); break;
        case 'show': TicTacToe.show(message, args); break;
        case 'set': TicTacToe.set(message, args); break;
        case 'stop': TicTacToe.stop(message, args); break;
      }

      break;
    }
    case 'comic': {
      Comics.comic(message, args); break;
    }
    case 'gif': {
      Gifs.gif(message, args); break;
    }
    default: {
      if(game.isAction(cmd)) {
        game.action(cmd, message, args);
        break;
      }
    }
  }
});

Promise.resolve()
  .then(() => db.open('./rimworld.sqlite', {Promise}))
  .catch(err => console.error(err.stack))
  .then(() => init())
  .then(() => load());

function init() {
  game = new Game(db, client);

  return Promise.resolve()
    .then(() => TicTacToe.preload())
    .then(() => db.run("CREATE TABLE IF NOT EXISTS colonists (userId TEXT, username TEXT, data TEXT)"))
    .catch(err => console.error(err.stack))
    .then(() => db.run("CREATE TABLE IF NOT EXISTS settlements (name TEXT, data TEXT)"))
    .catch(err => console.error(err.stack))
}

function load() {
  return Promise.all([
    db.all('SELECT * FROM colonists')
      .then(colonists => {
        if (colonists) {
          game.manager.setColonists(colonists);
        }
      })
      .catch(console.error),

    db.all('SELECT * FROM settlements')
      .then(settlements => {
        if (settlements) {
          game.manager.setSettlements(settlements);
        }
      })
      .catch(console.error),

    client.login(auth.token)
  ]);
}