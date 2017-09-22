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

const lastComic = {
  begin: '',
  middle: '',
  end: ''
};

const Comics = {
  stripImage(filename, type) {
    const img = new Image();

    img.src = fs.readFileSync(path.join(IMG_PATH, type, filename));

    return img;
  },

  drawRandomImage(ctx, type) {
    const filename = comicStrips[type][Math.floor(Math.random()*comicStrips[type].length)];

    return Comics.drawImage(filename, ctx, type);
  },

  drawImage(filename, ctx, type) {
    const img = Comics.stripImage(filename, type);

    ctx.drawImage(img, offsets[type].x, offsets[type].y, img.width, img.height);

    return filename;
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

  reroll(message, args) {
    const panelNum = parseInt(args[0]);
    const canvas = new Canvas(600, 200);
    const ctx = canvas.getContext('2d');

    Comics.fetchStrips();

    if(panelNum === 1) {
      lastComic.begin = Comics.drawRandomImage(ctx, types.begin);
      lastComic.middle = Comics.drawImage(lastComic.middle, ctx, types.middle);
      lastComic.end = Comics.drawImage(lastComic.end, ctx, types.end);
    } else if(panelNum === 2) {
      lastComic.begin = Comics.drawImage(lastComic.begin,ctx, types.begin);
      lastComic.middle = Comics.drawRandomImage(ctx, types.middle);
      lastComic.end = Comics.drawImage(lastComic.end, ctx, types.end);
    } else if(panelNum === 3) {
      lastComic.begin = Comics.drawImage(lastComic.begin, ctx, types.begin);
      lastComic.middle = Comics.drawImage(lastComic.middle, ctx, types.middle);
      lastComic.end = Comics.drawRandomImage(ctx, types.end);
    } else {
      return;
    }

    return message.channel.send('', new Discord.Attachment(canvas.toBuffer()));
  },

  random(message, args) {
    const canvas = new Canvas(600, 200);
    const ctx = canvas.getContext('2d');

    Comics.fetchStrips();

    lastComic.begin = Comics.drawRandomImage(ctx, types.begin);
    lastComic.middle = Comics.drawRandomImage(ctx, types.middle);
    lastComic.end = Comics.drawRandomImage(ctx, types.end);

    return message.channel.send('', new Discord.Attachment(canvas.toBuffer()));
  },

  comic(message, args) {
    const [panelNum] = args;

    if(!panelNum) {
      return Comics.random(message, args);
    } else {
      return Comics.reroll(message, args);
    }
  }
};

module.exports = Comics;