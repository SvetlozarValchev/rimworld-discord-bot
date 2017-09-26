const { createCanvas, loadImage } = require('canvas');
const Discord = require('discord.js');

const Commands = require('../Commands');
const Manager = require('./Manager');
const Assets = require('./Assets');
const Colonist = require('./entities/Colonist');
const Item = require('./objects/Item');

const GRID_SIZE = 64;

class Game {
  constructor(db) {
    this.manager = new Manager(db);

    /**
     * @type {Object}
     */
    this.stepInterval = setInterval(this.step.bind(this), 1000);

    Assets.load();
  }

  step() {
    let addItem;
    let colonist;


    Object.keys(this.manager.colonists).forEach((key) => {
      colonist = this.manager.colonists[key];

      switch(colonist.action) {
        case Colonist.actions.chop: {
          addItem = colonist.inventory.addItem('wood', Item.quality.Normal, 1);
          break;
        }
        case Colonist.actions.mine: {
          addItem = colonist.inventory.addItem('stone', Item.quality.Normal, 1);
          break;
        }
        case Colonist.actions.grow: {
          addItem = colonist.inventory.addItem('strawberry', Item.quality.Normal, 1);
          break;
        }
        default: {
          addItem = false;
        }
      }

      if(addItem) {
        this.manager.updateColonist(colonist.userId);
      }
    });
  }

  /**
   * @param {Message} message
   * @param {string} title
   * @returns {boolean}
   */
  isColonist(message, title) {
    if (!this.manager.hasColonist(message.author.id)) {
      Commands.noColonistMessage(message, title);

      return false;
    }

     return true;
  }

  /**
   * @param {Message} message
   * @param {Array} args
   */
  join(message, args) {
    if (this.manager.hasColonist(message.author.id)) {
      return message.reply('You are already a colonist').then(() => {
        this.info(message, args);
      });
    }

    return this.manager.createColonist(message.author.id, message.author.username, Commands.getNickname(message))
      .then(() => Commands.sendSuccess(message, 'You are now a colonist!'))
      .then(() => this.info(message, [message.author.id]))
      .catch((e) => {
        console.error(e);
        Commands.sendError(message, 'Failed to make you a colonist.');
      });
  }

  /**
   * @param {Message} message
   * @param {Array} args
   */
  stats(message, args) {
    return this.info(message, [message.author.id]);
  }

  /**
   * @param {Message} message
   * @param {Array} args
   */
  info(message, args) {
    if(!this.isColonist(message, 'Stats')) return;

    const [id] = args;
    const colonist = this.manager.getColonist(id);

    if (!this.manager.hasColonist(id)) {
      throw new Error(`No colonist with id: ${id}`);
    }

    return Commands.sendEmbed(message, `Colonist ${colonist.nickname}`, '.', [
      {
        name: "Settlement",
        value: colonist.settlement || '-',
      },
      {
        name: "Needs",
        value: `<:health:360090756611964928> Health ${colonist.needs.health}%\n<:hunger:360090765072007178> Hunger ${colonist.needs.hunger}%\n<:mood:360090773909274635> Mood ${colonist.needs.mood}%`
      }
    ]);
  }

  /**
   * @param {string} name
   * @returns {Promise}
   */
  settlementInfo(name) {
    const settlement = this.manager.getSettlement(name);
    const colonists = this.manager.getSettlementColonists(name);
    const items = settlement.inventory.getItems();

    return Commands.sendEmbed(message, `Settlement ${name}`, '.', [
      {
        name: "Colonists",
        value: colonists.length === 0 ? 'None' : colonists.join('\n')
      },
      {
        name: "Inventory",
        value: items.length === 0 ? 'Empty' : items.join('\n')
      }
    ]);
  }

  /**
   * @param {Message} message
   * @param {Array} args
   * @returns {Promise}
   */
  inventory(message, args) {
    if(!this.isColonist(message, 'Inventory')) return;

    const offsetX = 5, offsetY = 58;
    const colonist = this.manager.getColonist(message.author.id);
    const items = colonist.inventory.items;
    const inventorySizeSqrt = Math.sqrt(colonist.inventory.size);
    const canvas = createCanvas(GRID_SIZE * inventorySizeSqrt, GRID_SIZE * inventorySizeSqrt);
    const ctx = canvas.getContext('2d');
    let itemIdx = 0, asset, item, itemData;

    for(let y = 0; y < inventorySizeSqrt; y++) {
      for(let x = 0; x < inventorySizeSqrt; x++) {
        if(itemIdx > items.length - 1) {
          item = null;
          itemData = null;
          asset = Assets.get['items']['empty'];
        } else {
          item = items[itemIdx];
          itemData = item.itemData;
          asset = Assets.get['items'][itemData.image];
        }

        ctx.drawImage(asset, x * GRID_SIZE, y * GRID_SIZE, asset.width, asset.height);
        itemIdx++;

        if(item && itemData && itemData.maxAmount > 1) {
          ctx.font = '12px "monospace"';
          ctx.fillText(String(item.amount), x * GRID_SIZE + offsetX, y * GRID_SIZE + offsetY);
        }
      }
    }

    if (items.length === 0) {
      return Commands.sendEmbed(message, 'Inventory', 'Empty');
    }

    return message.channel.send(`Your inventory, ${Commands.mention(message.author.id)}`, new Discord.Attachment(canvas.toBuffer()));
  }

  /**
   * @param {Message} message
   * @param {Array} args
   * @returns {Promise}
   */
  colonists(message, args) {
    if(!this.isColonist(message, 'Colonists')) return;

    const colonists = this.manager.getColonists();
    const text = [];

    Object.keys(colonists).forEach((key) => {
      text.push(`\`${colonists[key].nickname}\``);
    });

    return message.channel.send('<:colony:360090744540889088> All Colonists: ' + text.join(', '));
  }

  /**
   * @param {Message} message
   * @param {Array} args
   * @returns {Promise}
   */
  settle(message, args) {
    if(!this.isColonist(message, 'Settle')) return;

    if (!this.manager.hasColonist(message.author.id)) {
      return Commands.noColonistMessage(message, 'Create Settlement');
    }

    const colonist = this.manager.getColonist(message.author.id);
    const name = args.join(" ");

    if (!name) {
      return Commands.sendError(message, 'No name specified');
    }

    if (colonist.settlement !== null) {
      if (colonist.settlement === name) {
        return Commands.sendError(message, `You already belong to settlement \`${colonist.settlement}\`.`);
      } else {
        return Commands.sendError(message, `You already belong to settlement \`${colonist.settlement}\`. Type \`!abandon\` to leave it.`);
      }
    }

    // Join existing settlement
    if (this.manager.hasSettlement(name)) {
      const settlement = this.manager.getSettlement(name);

      colonist.setSettlement(name);

      return this.manager.updateColonist(colonist.userId).then(() => {
        settlement.addMember();

        return this.manager.updateSettlement(settlement.name)
          .then(() => Commands.sendSuccess(message, `You joined settlement ${settlement.name}`))
          .catch((e) => {
            settlement.removeMember();

            console.error(e);
            Commands.sendError(message, 'Adding to settlement failed.');
          });
      }).catch(e => {
        colonist.setSettlement(null);

        console.error(e);
        Commands.sendError(message, 'Joining settlement Failed.');
      });
    }

    // Create new settlement
    return this.manager.createSettlement(name).then(() => {
      colonist.setSettlement(name);

      return this.manager.updateColonist(colonist.userId).then(() => {
        return Commands.sendSuccess(message, 'Settlement Created').then(() => this.settlementInfo(name));
      }).catch(e => {
        colonist.setSettlement(null);

        console.error(e);
        Commands.sendError(message, 'Failed to add to settlement');
      });
    }).catch(e => {
      console.error(e);
      Commands.sendError(message, 'Creating settlement Failed.');
    })
  }

  /**
   * @param {Message} message
   * @param {Array} args
   * @returns {Promise}
   */
  settlement(message, args) {
    if(!this.isColonist(message, 'Settlement')) return;

    let name = args.join(" ");

    if (!name) {
      const colonist = this.manager.getColonist(message.author.id);

      if (!colonist.hasSettlement()) {
        return Commands.sendError(message, 'You do not belong to a settlement');
      }

      name = colonist.settlement;
    }

    if (!this.manager.hasSettlement(name)) {
      return Commands.sendError(message, `No settlement with name \`${name}\``);
    }

    return this.settlementInfo(name);
  }

  /**
   * @param {Message} message
   * @param {Array} args
   * @returns {Promise}
   */
  settlements(message, args) {
    if(!this.isColonist(message, 'Settlements')) return;

    const settlements = this.manager.getSettlements();
    const text = [];

    Object.keys(settlements).forEach((key) => {
      text.push(`\`${key}\``);
    });

    return message.channel.send('<:settlement:360323072886177794> All Settlements: ' + text.join(', '));
  }

  /**
   * @param {Message} message
   * @param {Array} args
   * @returns {Promise}
   */
  abandon(message, args) {
    if(!this.isColonist(message, 'Abandon')) return;

    const colonist = this.manager.getColonist(message.author.id);

    if (!colonist.hasSettlement()) {
      return Commands.sendError(message, 'You do not belong to a settlement');
    }

    const settlementName = colonist.settlement;

    colonist.setSettlement(null);

    return this.manager.updateColonist(colonist.userId).then(() => {
      const settlement = this.manager.getSettlement(settlementName);

      settlement.removeMember();

      if (settlement.members < 1) {
        this.manager.deleteSettlement(settlementName)
          .then(() => Commands.sendSuccess(message, `You left settlement ${settlementName}`))
          .then(() => Commands.sendEmbed(message, `No members left in settlement \`${settlementName}\`. It has been removed.`))
          .catch((e) => {
            settlement.addMember();

            console.error(e);
            Commands.sendError(message, 'Removing from settlement failed.');
          });
      } else {
        this.manager.updateSettlement(settlementName)
          .then(() => Commands.sendSuccess(message, `You left settlement ${settlementName}`))
          .catch((e) => {
            settlement.addMember();

            console.error(e);
            Commands.sendError(message, 'Removing from settlement failed.');
          });
      }
    }).catch(e => {
      colonist.setSettlement(settlementName);

      console.error(e);
      Commands.sendError(message, 'Abandoning settlement Failed.');
    });
  }

  /**
   * @param action
   * @returns {boolean}
   */
  isAction(action) {
    return Object.prototype.hasOwnProperty.call(Colonist.actions, action);
  }

  /**
   * @param {string} action
   * @param {Message} message
   * @param {Array} args
   * @returns {Promise}
   */
  action(action, message, args) {
    if(!this.isColonist(message, `Action: ${action}`)) return;

    const colonist = this.manager.getColonist(message.author.id);

    colonist.setAction(Colonist.actions[action]);

    return Commands.sendSuccess(message, `Profession: ${Colonist.profession[action]}`);
  }

  /**
   * @param {Message} message
   * @param {Array} args
   */
  clearItems(message, args) {
    const colonist = this.manager.getColonist(message.author.id);

    colonist.inventory.clearItems();
  }
}

module.exports = Game;