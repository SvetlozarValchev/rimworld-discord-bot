const path = require('path');
const ItemData = require('../../data/items');

class Item {
  constructor() {
    /**
     * @type {string}
     */
    this.name = '';

    /**
     * @type {Item.Quality}
     */
    this.quality = Item.Quality.None;

    /**
     * @type {number}
     */
    this.amount = 1;

    /**
     * @type {number}
     */
    this.condition = 100;
  }

  /**
   * @enum
   * @returns {Object}
   */
  static get Quality() {
    return {
      None: 'none',
      Bad: 'bad',
      Normal: 'normal',
      Superior: 'superior',
    }
  }

  /**
   * @returns {Item}
   */
  get() {
    return this;
  }

  /**
   * @param {Object} item
   */
  set(item) {
    if (!item) {
      return;
    }

    this.name = item.name;
    this.quality = item.quality;
    this.amount = item.amount;
    this.condition = item.condition;
  }

  addAmount(amount) {
    this.amount += amount;
  }

  getImagePath() {
    return path.join(__dirname, '..', '..', 'assets', 'game', ItemData[this.name].image + '.png');
  }
}

module.exports = Item;