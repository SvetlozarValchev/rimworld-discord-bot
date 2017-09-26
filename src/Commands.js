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
   * @param {string} userId
   * @returns {string}
   */
  static mention(userId) {
    return `<@${userId}>`;
  }
}

module.exports = Commands;
