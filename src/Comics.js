const path = require('path');
const fs = require('fs');
const Canvas = require('canvas');
const Discord = require('discord.js');

const Image = Canvas.Image;
const IMG_PATH = path.join(__dirname, '..', 'assets', 'comics');
const types = {
  begin: 'begin',
  middle: 'middle',
  end: 'end'
};

const comicStrips = {
  begin: [],
  middle: [],
  end: []
};

const offsets = {
  begin: {x: 0, y: 0},
  middle: {x: 200, y: 0},
  end: {x: 400, y: 0}
};

const Comics = {
  drawRandomImage(ctx, type) {
    const filename = comicStrips[type][Math.floor(Math.random()*comicStrips[type].length)];
    const img = new Image();

    img.src = fs.readFileSync(path.join(IMG_PATH, type, filename));

    ctx.drawImage(img, offsets[type].x, offsets[type].y, img.width, img.height);

    return img;
  },

  fetchStrips() {
    comicStrips.begin = [];
    comicStrips.middle = [];
    comicStrips.end = [];

    fs.readdirSync(path.join(IMG_PATH, types.begin)).forEach(file => {
      comicStrips.begin.push(file);
    });

    fs.readdirSync(path.join(IMG_PATH, types.middle)).forEach(file => {
      comicStrips.middle.push(file);
    });

    fs.readdirSync(path.join(IMG_PATH, types.end)).forEach(file => {
      comicStrips.end.push(file);
    });
  },

  random(message, args) {
    const canvas = new Canvas(600, 200);
    const ctx = canvas.getContext('2d');

    Comics.fetchStrips();

    Comics.drawRandomImage(ctx, types.begin);
    Comics.drawRandomImage(ctx, types.middle);
    Comics.drawRandomImage(ctx, types.end);

    return message.channel.send('', new Discord.Attachment(canvas.toBuffer()));;
  }
};

module.exports = Comics;