const Settlement = require('./entities/Settlement');
const Colonist = require('./entities/Colonist');

class Manager {
  /**
   * @typedef {Object} ColonistSerialized
   *
   * @property {string} userId
   * @property {string} username
   * @property {string} data
   */

  /**
   * @typedef {Object} SettlementSerialized
   *
   * @property {string} name
   * @property {string} data
   */

  constructor(db) {
    this.db = db;

    /**
     * @type {Object.<string, Colonist>}
     */
    this.colonists = {};

    /**
     * @type {Object.<string, Settlement>}
     */
    this.settlements = {};
  }

  /**
   * @param {Array.<ColonistSerialized>} colonists
   */
  setColonists(colonists) {
    colonists.forEach(colonist => {
      this.colonists[colonist.userId] = new Colonist();
      this.colonists[colonist.userId].set(colonist.userId, colonist.username, colonist.data);
    });
  }

  /**
   * @returns {Object.<string, Colonist>}
   */
  getColonists() {
    return this.colonists;
  }

  /**
   * @param {string} userId
   * @returns {Colonist}
   */
  getColonist(userId) {
    return this.colonists[userId];
  }

  /**
   * @param userId
   * @returns {boolean}
   */
  hasColonist(userId) {
    return Object.prototype.hasOwnProperty.call(this.colonists, userId);
  }

  /**
   * @param {Array.<SettlementSerialized>} settlements
   */
  setSettlements(settlements) {
    settlements.forEach(settlement => {
      this.settlements[settlement.name] = new Settlement();
      this.settlements[settlement.name].set(settlement.name, settlement.data);
    });
  }

  /**
   * @returns {Object.<Settlement#name, Settlement>}
   */
  getSettlements() {
    return this.settlements;
  }

  /**
   * @param {string} name
   * @returns {Settlement}
   */
  getSettlement(name) {
    return this.settlements[name];
  }


  /**
   * @param {string} name
   * @returns {Array}
   */
  getSettlementColonists(name) {
    const colonists = [];

    Object.keys(this.colonists).forEach((key) => {
      if (this.colonists[key].settlement === name) {
        colonists.push(`\`${this.colonists[key].nickname}\``);
      }
    });

    return colonists;
  }

  /**
   * @param name
   * @returns {boolean}
   */
  hasSettlement(name) {
    return Object.prototype.hasOwnProperty.call(this.settlements, name);
  }

  /**
   * @param {string} userId
   * @param {string} username
   * @param {string} nickname
   * @returns {Promise}
   */
  createColonist(userId, username, nickname) {
    const colonist = new Colonist(userId, username, nickname);

    return this.db.run("INSERT INTO colonists (userId, username, data) VALUES ($userId, $username, $data)", colonist.get()).then(() => {
      this.colonists[userId] = colonist;
    }).catch(console.error);
  }

  /**
   * @param {string} name
   * @returns {Promise}
   */
  createSettlement(name) {
    const settlement = new Settlement(name);

    return this.db.run("INSERT INTO settlements (name, data) VALUES ($name, $data)", settlement.get()).then(() => {
      this.settlements[name] = settlement;
    }).catch((e) => Promise.reject(`Couldn't add Settlement.`));
  }

  /**
   * @param {string} userId
   */
  updateColonist(userId) {
    if (!this.hasColonist(userId)) {
      throw new Error(`No colonist with userId - ${userId}`);
    }

    const colonist = this.getColonist(userId);

    const get = colonist.get();

    return this.db.run("UPDATE colonists SET data=$data WHERE userId=$userId", {
      $userId: get.$userId,
      $data: get.$data
    });
  }

  /**
   * @param {string} name
   */
  updateSettlement(name) {
    if (!this.hasSettlement(name)) {
      throw new Error(`No settlement with name - ${name}`);
    }

    const settlement = this.getSettlement(name);

    const get = settlement.get();

    return this.db.run("UPDATE settlements SET data=$data WHERE name=$name", {
      $name: get.$name,
      $data: get.$data
    });
  }

  /**
   * @param {string} name
   * @returns {Promise}
   */
  deleteSettlement(name) {
    if (!this.hasSettlement(name)) {
      throw new Error(`No settlement with name - ${name}`);
    }

    return this.db.run("DELETE FROM settlements WHERE name=$name", {
      $name: name
    }).then(() => delete this.settlements[name]);
  }
}

module.exports = Manager;