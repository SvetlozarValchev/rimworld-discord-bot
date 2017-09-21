const path = require('path');
const fs = require('fs');
const Canvas = require('canvas');
const Discord = require('discord.js');
const Commands = require('./Commands');

const Image = Canvas.Image;
const IMG_PATH = path.join(__dirname, '..', 'assets');

const images = {
  bg: {
    filename: 'tictactoe_bg.png',
    image: null
  },

  circle: {
    filename: 'tictactoe_circle.png',
    image: null
  },

  cross: {
    filename: 'tictactoe_cross.png',
    image: null
  }
};
const instances = [];

class TicTacToe {
  /**
   * @param {string} player
   * @param {string} opponent
   */
  constructor(player, opponent) {
    /**
     * @type {canvas.Canvas}
     */
    this.canvas = new Canvas(150, 150);

    /**
     * @type {*}
     */
    this.ctx = this.canvas.getContext('2d');

    /**
     * @type {Message|null}
     */
    this.previousMessage = null;

    /**
     * @type {string}
     */
    this.player = player;

    /**
     * @type {string}
     */
    this.opponent = opponent;

    /**
     * @type {boolean}
     */
    this.playerTurn = true;

    /**
     * @type {Array.<Array.<number>>}
     */
    this.map = [
      [TicTacToe.tile.none, TicTacToe.tile.none, TicTacToe.tile.none],
      [TicTacToe.tile.none, TicTacToe.tile.none, TicTacToe.tile.none],
      [TicTacToe.tile.none, TicTacToe.tile.none, TicTacToe.tile.none],
    ];

    /**
     * @type {boolean}
     */
    this.playerWon = false;

    /**
     * @type {boolean}
     */
    this.ended = false;
  }

  static preload() {
    Object.keys(images).forEach((key) => {
      images[key].image = new Image;

      images[key].image.src = fs.readFileSync(path.join(IMG_PATH, images[key].filename));
    });
  }

  static get tile() {
    return {
      none: 0,
      circle: 1,
      cross: -1
    };
  }

  static hasInstance(name) {
    let has = false;

    instances.forEach((instance) => {
      if(instance.player === name || instance.opponent === name) {
        has = true;
      }
    });

    return has;
  }

  /**
   * @param name
   * @returns {TicTacToe|null}
   */
  static getInstance(name) {
    let inst = null;

    instances.forEach((instance) => {
      if(instance.player === name || instance.opponent === name) {
        inst = instance;
      }
    });

    return inst;
  }

  /**
   * @param {Manager} manager
   * @param {Message} message
   * @param {Array} args
   */
  static help(manager, message, args = []) {
    const commands = [
      '`!ttt help` - This help',
      '`!ttt play [opponent]` - Play against opponent',
      '`!ttt stop` - Stop current tictactoe game',
      '`!ttt set [top|middle|bottom] [left|middle|right]` - Set position'
    ];

    return Commands.sendEmbed(message, 'TicTacToe Commands', commands.join('\n'));
  }

  /**
   * @param {Manager} manager
   * @param {Message} message
   * @param {Array} args
   */
  static stop(manager, message, args = []) {
    const name = Commands.getNickname(message);

    if(!TicTacToe.hasInstance(name)) {
      return Commands.sendError(message, 'You don\'t have an active game; Type `!ttt help`');
    }

    instances.forEach((instance, idx) => {
      if(instance.player === name || instance.opponent === name) {
        delete instances[idx];
      }
    });

    return Commands.sendSuccess(message, 'Your game was stopped.');
  }

  /**
   * @param {Manager} manager
   * @param {Message} message
   * @param {Array} args
   */
  static play(manager, message, args = []) {
    const player = Commands.getNickname(message);
    const opponent = args.join(" ");

    if(TicTacToe.hasInstance(player) || TicTacToe.hasInstance(opponent)) {
      return Commands.sendError(message, 'You already have an active game; Type `!ttt stop` to stop it.');
    }

    const instance = new TicTacToe(player, opponent);

    instances.push(instance);

    return Commands.sendSuccess(message, 'Game started. Set a position with `!ttt set [positions]`').then(() => {
      TicTacToe.show(manager, message, args);
    });
  }

  /**
   * @param {Manager} manager
   * @param {Message} message
   * @param {Array} args
   */
  static show(manager, message, args = []) {
    if(!TicTacToe.hasInstance(Commands.getNickname(message))) {
      return Commands.sendError(message, 'You don\'t have an active game; Type `!ttt help`');
    }

    const instance = TicTacToe.getInstance(Commands.getNickname(message));

    return instance.beforeDraw(manager, message, args);
  }

  /**
   * @param {Manager} manager
   * @param {Message} message
   * @param {Array} args
   */
  static set(manager, message, args = []) {
    if(!TicTacToe.hasInstance(Commands.getNickname(message))) {
      return Commands.sendError(message, 'You don\'t have an active game; Type `!ttt help`');
    }

    const instance = TicTacToe.getInstance(Commands.getNickname(message));
    const isPlayer = instance.isPlayer(message);
    const tileType = isPlayer ? TicTacToe.tile.cross : TicTacToe.tile.circle;
    const [position1, position2] = args;

    if((isPlayer && !instance.playerTurn) || (!isPlayer && instance.playerTurn)) {
      return Commands.sendError(message, 'It\'s not your turn');
    }

    if(!position1 && !position2) {
      return;
    }

    if(position1 === 'middle' && (!position2 || position2 === 'middle')) {
      instance.setMap(1, 1, tileType);
    } else if(position1 === 'left') {
      instance.setMap(0, 1, tileType);
    } else if(position1 === 'right') {
      instance.setMap(2, 1, tileType);
    } else {
      let yPos;

      switch(position1) {
        case 'top': yPos = 0; break;
        case 'middle': yPos = 1; break;
        case 'bottom': yPos = 2; break;
      }

      switch(position2) {
        case 'left': instance.setMap(0, yPos, tileType); break;
        case 'right': instance.setMap(2, yPos, tileType); break;
        default: instance.setMap(1, yPos, tileType);
      }
    }

    instance.toggleTurn();

    return instance.beforeDraw(manager, message, args);
  }

  isPlayer(message) {
    return this.player === Commands.getNickname(message);
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} tile
   */
  setMap(x, y, tile) {
    this.map[y][x] = tile;
  }

  toggleTurn() {
    this.playerTurn = !this.playerTurn;
  }

  /**
   * @param {Manager} manager
   * @param {Message} message
   * @param {Array} args
   */
  beforeDraw(manager, message, args) {
    if (this.previousMessage) {
      return this.previousMessage.delete().then(() => this.draw(manager, message, args));
    } else {
      return this.draw(manager, message, args);
    }
  }

  /**
   * @param {Manager} manager
   * @param {Message} message
   * @param {Array} args
   */
  draw(manager, message, args) {
    let img;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.drawImage(images.bg.image, 0, 0, images.bg.image.width, images.bg.image.height);

    this.map.forEach((row, y) => {
      row.forEach((tile, x) => {
        img = null;

        if(tile === TicTacToe.tile.circle) {
          img = 'circle';
        } else if(tile === TicTacToe.tile.cross) {
          img = 'cross';
        }

        if(img) {
          this.ctx.drawImage(images[img].image, x * 50, y * 50, images[img].image.width, images[img].image.height);
        }
      });
    });

    return message.channel.send(`${this.player} (X) vs. ${this.opponent} (O)`, new Discord.Attachment(this.canvas.toBuffer())).then((prevMsg) => {
      this.previousMessage = prevMsg;
    });
  }
}

module.exports = TicTacToe;
