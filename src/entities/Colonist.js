const Inventory = require('../objects/Inventory');
const ColonistStats = require('../objects/ColonistStats');

class Colonist {
  /**
   * @param {string} userId
   * @param {string} username
   * @param {string|null} nickname
   */
  constructor(userId = '', username = '', nickname) {
    /**
     * @type {string}
     */
    this.userId = userId;

    /**
     * @type {string}
     */
    this.username = username;

    /**
     * @type {*}
     */
    this.nickname = nickname;

    /**
     * @type {string}
     */
    this.settlement = null;

    /**
     * @type {Object}
     */
    this.needs = {
      health: 100,
      hunger: 100,
      mood: 100,
    };

    this.stats = {
      combat: 0,
      social: 0,
      medicine: 0,
      cooking: 0,
      construction: 0,
      growing: 0,
      mining: 0,
      artistic: 0,
      crafting: 0,
      research: 0,
      carryCapacity: 0
    };

    /**
     * @type {Inventory}
     */
    this.inventory = new Inventory();
  }

  hasSettlement() {
    return this.settlement !== null;
  }

  setSettlement(settlement) {
    this.settlement = settlement;
  }

  /**
   * @returns {Object}
   */
  get() {
    return {
      $userId: this.userId,
      $username: this.username,
      $data: JSON.stringify({
        nickname: this.nickname,
        settlement: this.settlement,
        needs: this.needs,
        stats: this.stats,
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

    this.nickname = data.nickname;
    this.settlement = data.settlement;
    this.needs = data.needs;
    this.stats = data.stats;
    this.inventory.set(data.inventory);
  }
}

module.exports = Colonist;