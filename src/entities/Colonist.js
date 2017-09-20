const Inventory = require('../objects/Inventory');
const ColonistStats = require('../objects/ColonistStats');

class Colonist {
  /**
   * @param {string} userId
   * @param {string} username
   */
  constructor(userId = '', username = '') {
    this.userId = userId;
    this.username = username;

    /**
     * @type {Object}
     */
    this.needs = {
      health: 100,
      hunger: 100,
      mood: 100,
    };

    // this.stats = new ColonistStats();

    /**
     * @type {Inventory}
     */
    this.inventory = new Inventory();
  }

  /**
   * @returns {Object}
   */
  get() {
    return {
      $userId: this.userId,
      $username: this.username,
      $data: JSON.stringify({
        needs: {
          health: this.needs.health,
          hunger: this.needs.hunger,
          mood: this.needs.mood,
        },
        inventory: this.inventory.get()
      })
    };
  }

  /**
   * @param {string} userId
   * @param {string} username
   * @param {string} dataString
   */
  set(userId, username, dataString) {
    const data = JSON.parse(dataString);

    this.userId = userId;
    this.username = username;
    this.needs = data.needs;
    this.inventory.set(data.inventory);
  }
}

module.exports = Colonist;