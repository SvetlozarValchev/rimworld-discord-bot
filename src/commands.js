const commands = {
  join(manager, message, args) {
    if(manager.hasColonist(message.author.id)) {
      message.reply('You are already a colonist');
      commands.info(manager, message);
      return;
    }

    manager.createColonist(message.author.id, message.author.username).then(() => {
      commands.info(manager, message, ["Colonist " + message.author.username, "You are now a colonist!"]);
    });
  },

  stats(manager, message, args = []) {
    commands.info(manager, message);
  },

  colonists(manager, message, args = []) {
    const colonists = manager.getColonists();
    const text = [];

    Object.keys(colonists).forEach((key) => {
      text.push(colonists[key].username);
    });

    message.channel.send('<:colony:360066503942471681> ' + text.join(', '));
  },

  info(manager, message, args = []) {
    const colonist = manager.getColonist(message.author.id);

    message.channel.send({
      embed: {
        color: 3447003,
        title: args[0],
        description: args[1],
        fields: [
          {
            name: "Stats",
            value: `<:health:360057366559064074> Health ${colonist.health * 100}%\n<:hunger:360058451826573312> Hunger ${colonist.hunger * 100}%\n<:mood:360059651657695233> Mood ${colonist.mood * 100}%`
          }
        ],
      }
    });
  },

  settle(manager, message, args = []) {

  }
};

module.exports = commands;