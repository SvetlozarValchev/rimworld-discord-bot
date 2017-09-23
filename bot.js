const db = require('sqlite');
const Discord = require('discord.js');

const auth = require('./auth.json');
const Manager = require('./src/Manager');
const Commands = require('./src/Commands');
const TicTacToe = require('./src/TicTacToe');
const HttpServer = require('./src/Server');
const Comics = require('./src/Comics');
const Gifs = require('./src/Gifs');

// Initialize
const manager = new Manager(db);

// Start server
HttpServer.start();

// Bot Client
const client = new Discord.Client();

client.on('ready', (evt) => {
  console.info('Connected');
  console.info('Logged in as: ');
  console.info(client.user.username + ' - (' + client.user.id + ')');
});

client.on("message", /** @type {Message} */ (message) => {
  if (message.author.bot) {
    return;
  } // Ignore bots.
  // if (message.channel.name !== "my-secret-dev-channel") {
  //   return;
  // } // Only certain channel

  if (message.content.substring(0, 1) !== '!') {
    return;
  } // Only messages that start with '!'

  let args = message.content.substring(1).split(' ');
  const cmd = args[0];

  args = args.splice(1);

  switch (cmd) {
    case 'ping': message.channel.send('Pong!'); break;
    case 'stats': Commands.showStats(manager, message, args); break;
    case 'join': Commands.addColonist(manager, message, args); break;
    case 'colonists': Commands.showColonists(manager, message, args); break;
    case 'colonist': Commands.showColonist(manager, message, args); break;
    case 'inventory': Commands.showInventory(manager, message, args); break;
    case 'settle': Commands.addSettlement(manager, message, args); break;
    case 'settlements': Commands.showSettlements(manager, message, args); break;
    case 'settlement': Commands.showSettlement(manager, message, args); break;
    case 'abandon': Commands.abandonSettlement(manager, message, args); break;
    case 'actions': {
      const cmd2 = args[0];
      args = args.splice(1);
      break;
    }
    case 'ttt': {
      const cmd2 = args[0];
      args = args.splice(1);

      switch(cmd2) {
        case 'help': TicTacToe.help(manager, message, args); break;
        case 'play': TicTacToe.play(manager, message, args); break;
        case 'show': TicTacToe.show(manager, message, args); break;
        case 'set': TicTacToe.set(manager, message, args); break;
        case 'stop': TicTacToe.stop(manager, message, args); break;
      }

      break;
    }
    case 'comic': {
      Comics.comic(message, args); break;
    }
    case 'gif': {
      Gifs.gif(message, args); break;
    }
  }
});

Promise.resolve()
  .then(() => db.open('./rimworld.sqlite', {Promise}))
  .catch(err => console.error(err.stack))
  .then(() => init())
  .then(() => load());

function init() {
  TicTacToe.preload();

  return Promise.resolve()
    .then(() => db.run("CREATE TABLE IF NOT EXISTS colonists (userId TEXT, username TEXT, data TEXT)"))
    .catch(err => console.error(err.stack))
    .then(() => db.run("CREATE TABLE IF NOT EXISTS settlements (name TEXT, data TEXT)"))
    .catch(err => console.error(err.stack))
    .then(() => db.run("CREATE TABLE IF NOT EXISTS comics (name TEXT, data TEXT)"))
    .catch(err => console.error(err.stack))
}

/**
 * @typedef {Object} ColonistSerialized
 *
 * @property {string} userId
 * @property {string} username
 * @property {string} data
 */

/**
 * @typedef {Object} SettlementSerialized
 *
 * @property {string} name
 * @property {string} data
 */

function load() {
  return Promise.all([
    db.all('SELECT * FROM colonists')
      .then(colonists => {
        if (colonists) {
          manager.setColonists(colonists)
        }
      })
      .catch(console.error),

    db.all('SELECT * FROM settlements')
      .then(settlements => {
        if (settlements) {
          manager.setSettlements(settlements)
        }
      })
      .catch(console.error),

    client.login(auth.token)
  ]);
}