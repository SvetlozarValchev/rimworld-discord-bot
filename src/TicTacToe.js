const path = require('path');
const fs = require('fs');
const Canvas = require('canvas');
const Discord = require('discord.js');
const Commands = require('./Commands');

const Image = Canvas.Image;
const IMG_PATH = path.join(__dirname, '..', 'assets');
const MentionRegex = new RegExp(/\<@!?([0-9]+)\>/);

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
  },

  line_horizontal: {
    filename: 'tictactoe_line_horizontal.png',
    image: null
  },

  line_vertical: {
    filename: 'tictactoe_line_vertical.png',
    image: null
  },

  line_diagonal_left: {
    filename: 'tictactoe_line_diagonal_left.png',
    image: null
  },

  line_diagonal_right: {
    filename: 'tictactoe_line_diagonal_right.png',
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
    this.playerTurn = false;

    /**
     * @type {Array.<Array.<number>>}
     */
    this.map = [
      [TicTacToe.tile.none, TicTacToe.tile.none, TicTacToe.tile.none],
      [TicTacToe.tile.none, TicTacToe.tile.none, TicTacToe.tile.none],
      [TicTacToe.tile.none, TicTacToe.tile.none, TicTacToe.tile.none],
    ];

    /**
     * @type {number}
     */
    this.winType = TicTacToe.winType.none;
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

  static get winType() {
    return {
      none: 0,
      horizontalTop: 1,
      horizontalMiddle: 2,
      horizontalBottom: 3,
      verticalLeft: 4,
      verticalMiddle: 5,
      verticalRight: 6,
      diagonalLeft: 7,
      diagonalRight: 8,
      draw: 9
    }
  }

  /**
   * @param {string} name
   * @returns {boolean}
   */
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
   * @param {string} playerOrOpponentName
   */
  static deleteInstance(playerOrOpponentName) {
    instances.forEach((instance, idx) => {
      if(instance.player === playerOrOpponentName || instance.opponent === playerOrOpponentName) {
        delete instances[idx];
      }
    });
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

    TicTacToe.deleteInstance(name);

    return Commands.sendSuccess(message, 'Your game was stopped.');
  }

  /**
   * @param {Manager} manager
   * @param {Message} message
   * @param {Array} args
   */
  static play(manager, message, args = []) {
    const player = Commands.getNickname(message);
    let opponent = args.join(" ");

    if(!opponent) {
      return Commands.sendError(message, 'You must type your opponent.');
    }

    if(MentionRegex.test(opponent)) {
      const id = opponent.match(MentionRegex)[1];
      const member = message.channel.members.find('id', id);

      opponent = member.nickname || member.user && member.user.username;
    }

    if(opponent === player) {
      return Commands.sendError(message, 'You can\'t challenge yourself.');
    }

    if(TicTacToe.hasInstance(opponent)) {
      const instance = TicTacToe.getInstance(opponent);

      if(instance.player !== player && instance.opponent !== player) {
        return Commands.sendError(message, 'Your opponent is already in an active game.');
      }
    }

    if(TicTacToe.hasInstance(player)) {
      const instance = TicTacToe.getInstance(player);

      if(instance.winType > 0) {
        TicTacToe.deleteInstance(player);
      } else {
        return Commands.sendError(message, 'You already have an active game; Type `!ttt stop` to stop it.');
      }
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
  static playSuccess(manager, message, args = []) {

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
    let [position1, position2] = args;

    if(instance.winType > 0) {
      return Commands.sendError(message, 'Game already ended');
    }

    if((isPlayer && !instance.playerTurn) || (!isPlayer && instance.playerTurn)) {
      return Commands.sendError(message, 'It\'s not your turn');
    }

    if(!position1 && !position2) {
      return;
    }

    let pos = [0, 0];

    if(position1 === 'middle' && (!position2 || position2 === 'middle')) {
      pos = [1, 1];
    } else if(position1 === 'left') {
      pos = [0, 1];
    } else if(position1 === 'right') {
      pos = [2, 1];
    } else {
      let yPos;

      switch(position1) {
        case 'top': yPos = 0; break;
        case 'middle': yPos = 1; break;
        case 'bottom': yPos = 2; break;
        default: return;
      }

      switch(position2) {
        case 'left': pos = [0, yPos]; break;
        case 'right': pos = [2, yPos]; break;
        default: pos = [1, yPos];
      }
    }

    if(instance.getTile(pos[0], pos[1]) !== TicTacToe.tile.none) {
      return Commands.sendError(message, 'Tile is already set');
    }

    instance.setMap(pos[0], pos[1], tileType);
    instance.checkWin();

    if(instance.winType === TicTacToe.winType.none) {
      instance.toggleTurn();
    }

    return instance.beforeDraw(manager, message, args);
  }

  /**
   * @param {Message} message
   * @returns {boolean}
   */
  isPlayer(message) {
    return this.player === Commands.getNickname(message);
  }

  /**
   * @param {number} x
   * @param {number} y
   * @returns {number}
   */
  getTile(x, y) {
    return this.map[y][x];
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

  checkWin() {
    let tile1;
    let tile2;
    let tile3;

    // top horizontal
    [tile1, tile2, tile3] = [this.getTile(0, 0), this.getTile(1, 0), this.getTile(2, 0)];
    if(tile1 && tile1 === tile2 && tile2 === tile3) {
      this.winType = TicTacToe.winType.horizontalTop;
    }

    // middle horizontal
    [tile1, tile2, tile3] = [this.getTile(0, 1), this.getTile(1, 1), this.getTile(2, 1)];
    if(tile1 && tile1 === tile2 && tile2 === tile3) {
      this.winType = TicTacToe.winType.horizontalMiddle;
    }

    // bottom horizontal
    [tile1, tile2, tile3] = [this.getTile(0, 2), this.getTile(1, 2), this.getTile(2, 2)];
    if(tile1 && tile1 === tile2 && tile2 === tile3) {
      this.winType = TicTacToe.winType.horizontalBottom;
    }

    // left vertical
    [tile1, tile2, tile3] = [this.getTile(0, 0), this.getTile(0, 1), this.getTile(0, 2)];
    if(tile1 && tile1 === tile2 && tile2 === tile3) {
      this.winType = TicTacToe.winType.verticalLeft;
    }

    // middle vertical
    [tile1, tile2, tile3] = [this.getTile(1, 0), this.getTile(1, 1), this.getTile(1, 2)];
    if(tile1 && tile1 === tile2 && tile2 === tile3) {
      this.winType = TicTacToe.winType.verticalMiddle;
    }

    // right vertical
    [tile1, tile2, tile3] = [this.getTile(2, 0), this.getTile(2, 1), this.getTile(2, 2)];
    if(tile1 && tile1 === tile2 && tile2 === tile3) {
      this.winType = TicTacToe.winType.verticalRight;
    }

    // diagonal left
    [tile1, tile2, tile3] = [this.getTile(0, 0), this.getTile(1, 1), this.getTile(2, 2)];
    if(tile1 && tile1 === tile2 && tile2 === tile3) {
      this.winType = TicTacToe.winType.diagonalLeft;
    }

    // diagonal right
    [tile1, tile2, tile3] = [this.getTile(2, 0), this.getTile(1, 1), this.getTile(0, 2)];
    if(tile1 && tile1 === tile2 && tile2 === tile3) {
      this.winType = TicTacToe.winType.diagonalRight;
    }

    let settedTiles = 0;

    this.map.forEach((row, y) => {
      row.forEach((tile, x) => {
        if(tile !== TicTacToe.tile.none) {
          settedTiles++;
        }
      });
    });

    if(settedTiles === 9) {
      this.winType = TicTacToe.winType.draw;
    }
  }

  /**
   * @param {Manager} manager
   * @param {Message} message
   * @param {Array} args
   */
  draw(manager, message, args) {
    let img;
    let title;
    let winLine = {
      image: null,
      x: 0,
      y: 0
    };

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

    switch(this.winType) {
      case TicTacToe.winType.horizontalTop: winLine.image = 'line_horizontal'; winLine.x = 0; winLine.y = 0; break;
      case TicTacToe.winType.horizontalMiddle: winLine.image = 'line_horizontal'; winLine.x = 0; winLine.y = 50; break;
      case TicTacToe.winType.horizontalBottom: winLine.image = 'line_horizontal'; winLine.x = 0; winLine.y = 100; break;
      case TicTacToe.winType.verticalLeft: winLine.image = 'line_vertical'; winLine.x = 0; winLine.y = 0; break;
      case TicTacToe.winType.verticalMiddle: winLine.image = 'line_vertical'; winLine.x = 50; winLine.y = 0; break;
      case TicTacToe.winType.verticalRight: winLine.image = 'line_vertical'; winLine.x = 100; winLine.y = 0; break;
      case TicTacToe.winType.diagonalLeft: winLine.image = 'line_diagonal_left'; winLine.x = 0; winLine.y = 0; break;
      case TicTacToe.winType.diagonalRight: winLine.image = 'line_diagonal_right'; winLine.x = 0; winLine.y = 0; break;
      default: break;
    }

    if(winLine.image) {
      this.ctx.drawImage(images[winLine.image].image, winLine.x, winLine.y, images[winLine.image].image.width, images[winLine.image].image.height);

      if(this.playerTurn) {
        title = `${this.player} Won!`;
      } else {
        title = `${this.opponent} Won!`;
      }
    } else {
      if(this.winType === TicTacToe.winType.draw) {
        title = 'Draw!';
      } else {
        if(this.playerTurn) {
          title = `**X** \`>${this.player}<\` vs. **O** \`${this.opponent}\``;
        } else {
          title = `**X** \`${this.player}\` vs. **O** \`>${this.opponent}<\``;
        }
      }
    }

    return message.channel.send(title, new Discord.Attachment(this.canvas.toBuffer())).then((prevMsg) => {
      this.previousMessage = prevMsg;
    });
  }
}

module.exports = TicTacToe;
