class Commands {
  /**
   * @returns {{info: number, success: number, error: number}}
   */
  static get msgColor() {
    return {
      info: 0x3498DB,
      success: 0x00AE86,
      error: 0xFF7777
    }
  }

  /**
   * @param {Message} message
   * @param {string} title
   * @param {string} [description]
   * @param {Array.<{name: string, value: string}>} [fields]
   * @param {number} [color]
   */
  static sendEmbed(message, title, description = '', fields = [], color) {
    return message.channel.send({
      embed: {
        color: color || Commands.msgColor.info,
        title,
        description,
        fields,
      }
    });
  }

  /**
   * @param {Message} message
   * @param {string} msg
   */
  static sendSuccess(message, msg) {
    return Commands.sendEmbed(message, msg, '', [], Commands.msgColor.success);
  }

  /**
   * @param {Message} message
   * @param {string} error
   */
  static sendError(message, error) {
    return Commands.sendEmbed(message, 'Error', error, [], Commands.msgColor.error);
  }

  /**
   * @param {Manager} manager
   * @param {Message} message
   * @param {Array} args
   */
  static colonistInfo(manager, message, args = []) {
    const [id] = args;
    const colonist = manager.getColonist(id);

    if (!manager.hasColonist(id)) {
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
   * @param {Message} message
   * @param {string} title
   * @returns {Promise}
   */
  static noColonistMessage(message, title = '') {
    return Commands.sendEmbed(message, title, 'Not Available. Type \`!join\` to enter the game.');
  }

  /**
   * @param {Message} message
   * @returns {string}
   */
  static getNickname(message) {
    if (message.member && message.member.nickname) {
      return message.member.nickname;
    }

    return message.author.username;
  }

  /**
   * @param {Manager} manager
   * @param {Message} message
   * @param {Array} args
   */
  static showStats(manager, message, args = []) {
    const colonist = manager.getColonist(message.author.id);

    if (!manager.hasColonist(message.author.id)) {
      return Commands.noColonistMessage(message, 'Stats');
    }

    return Commands.colonistInfo(manager, message, [colonist.userId]);
  }

  /**
   * @param {Manager} manager
   * @param {Message} message
   * @param {Array} args
   */
  static addColonist(manager, message, args) {
    if (manager.hasColonist(message.author.id)) {
      message.reply('You are already a colonist');

      return Commands.showStats(manager, message, args);
    }

    return manager.createColonist(message.author.id, message.author.username, Commands.getNickname(message))
      .then(() => Commands.sendSuccess(message, 'You are now a colonist!'))
      .then(() => Commands.colonistInfo(manager, message, [message.author.id]))
      .catch((e) => {
        console.error(e);
        Commands.sendError(message, 'Failed to make you a colonist.');
      });
  }

  /**
   * @param {Manager} manager
   * @param {Message} message
   * @param {Array} args
   */
  static showColonists(manager, message, args = []) {
    const colonists = manager.getColonists();
    const text = [];

    Object.keys(colonists).forEach((key) => {
      text.push(`\`${colonists[key].nickname}\``);
    });

    return message.channel.send('<:colony:360090744540889088> All Colonists: ' + text.join(', '));
  }

  /**
   * @param {Manager} manager
   * @param {Message} message
   * @param {Array} args
   */
  static showColonist(manager, message, args = []) {
    const colonists = manager.getColonists();
    const name = args.join(" ");
    let colonistId = null;

    Object.keys(colonists).forEach((id) => {
      if (colonists[id].nickname === name) {
        colonistId = id;
      }
    });

    if (colonistId !== null) {
      return Commands.colonistInfo(manager, message, [colonistId]);
    }

    return Commands.sendError(message, `No colonist with the name \`${name}\` found`);
  }

  /**
   * @param {Array.<Item>} inventoryItems
   * @returns {Array}
   */
  static getInventory(inventoryItems) {
    const items = [];
    let item;

    Object.keys(inventoryItems).forEach((key) => {
      item = inventoryItems[key];

      items.push(`${item.amount} ${item.name}`);
    });

    return items;
  }

  /**
   * @param {string} name
   * @param {Object.<string, Colonist>} colonists
   * @returns {Array}
   */
  static getSettlementColonists(name, colonists) {
    const colonistsFilter = [];

    Object.keys(colonists).forEach((key) => {
      if (colonists[key].settlement === name) {
        colonistsFilter.push(`\`${colonists[key].nickname}\``);
      }
    });

    return colonistsFilter;
  }

  static showInventory(manager, message, args = []) {
    if (!manager.hasColonist(message.author.id)) {
      return Commands.noColonistMessage(message, 'Inventory');
    }

    const colonist = manager.getColonist(message.author.id);
    const items = Commands.getInventory(colonist.inventory.items);

    if (items.length === 0) {
      return Commands.sendEmbed(message, 'Inventory', 'Empty');
    }

    return Commands.sendEmbed(message, 'Inventory', items.join('\n'));
  }

  /**
   * @param {Manager} manager
   * @param {Message} message
   * @param {Array} args
   */
  static addSettlement(manager, message, args = []) {
    const colonist = manager.getColonist(message.author.id);
    const name = args.join(" ");

    if (!manager.hasColonist(message.author.id)) {
      return Commands.noColonistMessage(message, 'Create Settlement');
    }

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

    if (manager.hasSettlement(name)) {
      const settlement = manager.getSettlement(name);

      colonist.setSettlement(name);

      return manager.updateColonist(colonist.userId).then(() => {
        settlement.addMember();

        return manager.updateSettlement(settlement.name)
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

    return manager.createSettlement(name).then(() => {
      colonist.setSettlement(name);

      return manager.updateColonist(colonist.userId).then(() => {
        return Commands.sendSuccess(message, 'Settlement Created').then(() => Commands.settlementInfo(manager, message, [name]));
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
   * @param {Manager} manager
   * @param {Message} message
   * @param {Array} args
   */
  static showSettlements(manager, message, args = []) {
    const settlements = manager.getSettlements();
    const text = [];

    Object.keys(settlements).forEach((key) => {
      text.push(`\`${key}\``);
    });

    return message.channel.send('<:settlement:360323072886177794> All Settlements: ' + text.join(', '));
  }

  /**
   * @param {Manager} manager
   * @param {Message} message
   * @param {Array} args
   */
  static showSettlement(manager, message, args = []) {
    const name = args.join(" ");
    const settlement = manager.getSettlement(name);

    if (!manager.hasSettlement(name)) {
      return Commands.sendError(message, `No settlement with name \`${name}\``);
    }

    return Commands.settlementInfo(manager, message, [name]);
  }

  /**
   * @param {Manager} manager
   * @param {Message} message
   * @param {Array} args
   */
  static settlementInfo(manager, message, args = []) {
    const [name] = args;
    const settlement = manager.getSettlement(name);

    if (!manager.hasSettlement(name)) {
      throw new Error(`No settlement with name: ${name}`);
    }

    const colonists = manager.getColonists();
    const inventoryItems = Commands.getInventory(settlement.inventory.items);
    const colonistsFilter = Commands.getSettlementColonists(name, colonists);

    return Commands.sendEmbed(message, `Settlement ${name}`, '.', [
      {
        name: "<:colony:360090744540889088> Colonists",
        value: colonistsFilter.length === 0 ? 'None' : colonistsFilter.join('\n')
      },
      {
        name: "Inventory",
        value: inventoryItems.length === 0 ? 'Empty' : inventoryItems.join('\n')
      }
    ]);
  }

  /**
   * @param {Manager} manager
   * @param {Message} message
   * @param {Array} args
   */
  static abandonSettlement(manager, message, args = []) {
    const colonist = manager.getColonist(message.author.id);

    if (!colonist.hasSettlement()) {
      return Commands.sendError(message, 'You do not belong to a settlement');
    }

    const settlementName = colonist.settlement;

    colonist.setSettlement(null);

    return manager.updateColonist(colonist.userId).then(() => {
      const settlement = manager.getSettlement(settlementName);

      settlement.removeMember();

      if (settlement.members < 1) {
        manager.deleteSettlement(settlementName)
          .then(() => Commands.sendSuccess(message, `You left settlement ${settlementName}`))
          .then(() => Commands.sendEmbed(message, `No members left in settlement \`${settlementName}\`. It has been removed.`))
          .catch((e) => {
            settlement.addMember();

            console.error(e);
            Commands.sendError(message, 'Removing from settlement failed.');
          });
      } else {
        manager.updateSettlement(settlementName)
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
}

module.exports = Commands;
