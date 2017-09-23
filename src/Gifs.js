const path = require('path');
const fs = require('fs');
const Discord = require('discord.js');

const IMG_PATH = path.join(__dirname, '..', 'assets', 'gifs');
const gifCollection = {};
let lastName = '';

const Gifs = {
  randomName() {
    let count = 0;
    let name;

    for (let gif in gifCollection) {
      if (Math.random() < 1 / ++count) {
        name = gif;
      }
    }

    return name;
  },

  randomGif(name) {
    return gifCollection[name][Math.floor(Math.random()*gifCollection[name].length)];
  },

  fetch() {
    fs.readdirSync(path.join(IMG_PATH)).forEach(file => {
      const name = file.split('_')[0];

      if (!gifCollection[name]) {
        gifCollection[name] = [];
      }

      gifCollection[name].push(file);
    });
  },

  gif(message, args) {
    let name = args[0];

    Gifs.fetch();

    if(!lastName || !name || !gifCollection[name]) {
      name = Gifs.randomName();
    }

    lastName = name;

    return message.channel.send('', new Discord.Attachment(fs.readFileSync(path.join(IMG_PATH, Gifs.randomGif(name))), `${name}.gif`));
  }
};

module.exports = Gifs;