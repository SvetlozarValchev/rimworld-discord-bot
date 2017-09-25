const path = require('path');
const fs = require('fs');
const Discord = require('discord.js');
const { createCanvas, loadImage } = require('canvas');

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
  drawRandomImage(ctx, type) {
    const filename = comicStrips[type][Math.floor(Math.random()*comicStrips[type].length)];

    return Comics.drawImage(filename, ctx, type);
  },

  drawImage(filename, ctx, type) {
    const imgPath = path.join(IMG_PATH, type, filename);

    return loadImage(imgPath).then((image) => {
      ctx.drawImage(image, offsets[type].x, offsets[type].y, image.width, image.height);
    }).then(() => filename);
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
    const canvas = createCanvas(600, 200);
    const ctx = canvas.getContext('2d');
    let [panelFirst, panelSecond] = args;

    panelFirst = parseInt(panelFirst, 10);
    panelSecond = parseInt(panelSecond, 10);

    if(panelFirst < 1 || panelFirst > 3 || (panelSecond && (panelSecond < 1 || panelSecond > 3))) return;

    Comics.fetchStrips();

    const begin = panelFirst === 1 || panelSecond === 1 ? Comics.drawRandomImage(ctx, types.begin) : Comics.drawImage(lastComic.begin,ctx, types.begin);
    const middle = panelFirst === 2 || panelSecond === 2 ? Comics.drawRandomImage(ctx, types.middle) : Comics.drawImage(lastComic.middle, ctx, types.middle);
    const end = panelFirst === 3 || panelSecond === 3 ? Comics.drawRandomImage(ctx, types.end) : Comics.drawImage(lastComic.end, ctx, types.end);

    return Promise.all([
      begin,
      middle,
      end
    ]).then((lastComics) => {
      [lastComic.begin, lastComic.middle, lastComic.end] = lastComics;

      return message.channel.send('', new Discord.Attachment(canvas.toBuffer(), 'comic.png'));
    })
  },

  random(message, args) {
    const canvas = createCanvas(600, 200);
    const ctx = canvas.getContext('2d');

    Comics.fetchStrips();

    const begin = Comics.drawRandomImage(ctx, types.begin);
    const middle = Comics.drawRandomImage(ctx, types.middle);
    const end = Comics.drawRandomImage(ctx, types.end);

    return Promise.all([
      begin,
      middle,
      end
    ]).then((lastComics) => {
      [lastComic.begin, lastComic.middle, lastComic.end] = lastComics;

      return message.channel.send('', new Discord.Attachment(canvas.toBuffer(), 'comic.png'));
    })
  },

  comic(message, args) {
    if(args.length === 0) {
      return Comics.random(message, args);
    } else {
      return Comics.reroll(message, args);
    }
  }
};

module.exports = Comics;