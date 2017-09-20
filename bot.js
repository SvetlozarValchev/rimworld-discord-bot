const logger = require('winston');
const Discord = require('discord.js');
const auth = require('./auth.json');
const db = require('sqlite');
const Manager = require('./src/Manager');
const commands = require('./src/commands');

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
  colorize: true
});
logger.level = 'debug';

const manager = new Manager(db);

// Initialize Discord Bot
const client = new Discord.Client();

client.on('ready', (evt) => {
  logger.info('Connected');
  logger.info('Logged in as: ');
  logger.info(client.user.username + ' - (' + client.user.id + ')');
});

client.on("message", (message) => {
  if (message.author.bot) {
    return;
  } // Ignore bots.
  if (message.channel.type === "dm") {
    return;
  } // Ignore DM channels.

  if (message.content.substring(0, 1) !== '!') {
    return;
  } // Only messages that start with '!'

  const args = message.content.substring(1).split(' ');
  const cmd = args[0];

  args.splice(1);

  switch (cmd) {
    case 'ping': {
      message.channel.send('Pong!');
      break;
    }
    case 'join': {
      commands.join(manager, message, args);
      break;
    }
    case 'stats': {
      commands.stats(manager, message, args);
      break;
    }
    case 'colonists': {
      commands.colonists(manager, message, args);
      break;
    }
    case 'settle': {
      commands.settle(manager, message, args);
      break;
    }
  }
});

Promise.resolve()
  .then(() => db.open('./rimworld.sqlite', {Promise}))
  .catch(err => logger.error(err.stack))
  .then(() => reset())
  .then(() => init())
  .then(() => load());

function reset() {
  // return db.run("DROP TABLE colonists").catch(logger.error);
}

function init() {
  return Promise.resolve()
    .then(() => db.run("CREATE TABLE IF NOT EXISTS colonists (userId TEXT, username TEXT, data TEXT)"))
    .catch(err => logger.error(err.stack))
    .then(() => db.run("CREATE TABLE IF NOT EXISTS colonies (name TEXT, data TEXT)"))
    .catch(err => logger.error(err.stack))
}

function load() {
  Promise.all([
    db.all('SELECT * FROM colonists')
      .then(colonists => {
        if (colonists) {
          manager.setColonists(colonists)
        }
      })
      .catch(logger.error),

    db.all('SELECT * FROM colonies')
      .then(colonies => {
        if (colonies) {
          manager.setColonies(colonies)
        }
      })
      .catch(logger.error),
  ]);

  return client.login(auth.token);
}