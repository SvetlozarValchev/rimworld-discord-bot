const Settlement = require('./entities/Settlement');
const Colonist = require('./entities/Colonist');

class Manager {
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
   * @param name
   * @returns {boolean}
   */
  hasSettlement(name) {
    return Object.prototype.hasOwnProperty.call(this.settlements, name);
  }

  /**
   * @param {string} userId
   * @param {string} username
   * @returns {Promise}
   */
  createColonist(userId, username) {
    const colonist = new Colonist(userId, username);

    return this.db.run("INSERT INTO colonists (userId, username, data) VALUES ($userId, $username, $data)",  colonist.get()).then(() => {
      this.colonists[userId] = colonist;
    }).catch(console.error);
  }

  createSettlement(name) {
    const settlement = new Settlement(name);

    return this.db.run("INSERT INTO settlements (name, data) VALUES ($name, $data)",  settlement.get()).then(() => {
      this.settlements[name] = settlement;
    }).catch((e) => Promise.reject(`Couldn't add Settlement.`));
  }

  load() {

  }

  create() {

  }
}

module.exports = Manager;