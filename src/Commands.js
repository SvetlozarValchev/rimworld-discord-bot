class Commands {
  /**
   * @param {Message} message
   * @param {string} title
   * @param {string} [description]
   * @param {Array.<{name: string, value: string}>} [fields]
   */
  static sendEmbed(message, title, description, fields) {
    return message.channel.send({
      embed: {
        color: 3447003,
        title,
        description,
        fields,
      }
    });
  }

  /**
   * @param {Message} message
   * @param {string} error
   */
  static sendError(message, error) {
    return Commands.sendEmbed(message, 'Error', error)
  }

  /**
   * @param {Manager} manager
   * @param {Message} message
   * @param {Array} args
   */
  static colonistInfo(manager, message, args = []) {
    const [title, description, id] = args;
    const colonist = manager.getColonist(id);

    if (!manager.hasColonist(id)) {
      throw new Error(`No colonist with id: ${id}`);
    }

    return Commands.sendEmbed(message, title, description, [
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
   * @param {Manager} manager
   * @param {Message} message
   * @param {Array} args
   */
  static showStats(manager, message, args = []) {
    const colonist = manager.getColonist(message.author.id);

    if (!manager.hasColonist(message.author.id)) {
      return Commands.noColonistMessage(message, 'Stats');
    }

    return Commands.colonistInfo(manager, message, [`Colonist ${colonist.username}`, '', colonist.userId]);
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

    return manager.createColonist(message.author.id, message.author.username).then(() => {
      return Commands.colonistInfo(manager, message, [`Colonist ${message.author.username}`, "You are now a colonist!", message.author.id]);
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
      text.push(`\`${colonists[key].username}\``);
    });

    return message.channel.send('<:Settlement:360090744540889088> All Colonists: ' + text.join(', '));
  }

  /**
   * @param {Manager} manager
   * @param {Message} message
   * @param {Array} args
   */
  static showColonist(manager, message, args = []) {
    const colonists = manager.getColonists();
    const [name] = args;
    let colonistId = null;

    Object.keys(colonists).forEach((id) => {
      console.log(id);
      if (colonists[id].username === name) {
        colonistId = id;
      }
    });

    if (colonistId !== null) {
      return Commands.colonistInfo(manager, message, [`Colonist ${name}`, '', colonistId]);
    }

    return Commands.sendError(message, `No colonist with the name \`${name}\` found`);
  }

  static showInventory(manager, message, args = []) {
    if (!manager.hasColonist(message.author.id)) {
      return Commands.noColonistMessage(message, 'Inventory');
    }

    const colonist = manager.getColonist(message.author.id);
    const items = [];
    let item;

    Object.keys(colonist.inventory.items).forEach((key) => {
      item = colonist.inventory.items[key];

      items.push(`${item.amount} ${item.name}`);
    });

    if(items.length === 0) {
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
    const [name] = args;

    if (!manager.hasColonist(message.author.id)) {
      return Commands.noColonistMessage(message, 'Create Settlement');
    }

    if (!name) {
      return Commands.sendError(message, 'No name specified');
    }

    if (manager.hasSettlement(name)) {
      return Commands.sendError(message, `Settlement named \`${name}\` already exists`);
    }

    manager.createSettlement(name).then(() => {
      Commands.sendEmbed(message, 'Settlement Created');
    }).catch((e) => {
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

    return message.channel.send('<:Settlement:360090744540889088> All Settlements: ' + text.join(', '));
  }
}

module.exports = Commands;
