const path = require('path');
const ItemData = require('../../../data/items');

class Item {
  constructor() {
    /**
     * @type {string}
     */
    this.name = '';

    /**
     * @type {Item.quality}
     */
    this.quality = Item.quality.None;

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
   * @readonly
   * @enum
   * @returns {{None: string, Bad: string, Normal: string, Superior: string}}
   */
  static get quality() {
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

  /**
   * @param {string} amount
   */
  addAmount(amount) {
    this.amount += amount;
  }

  /**
   * @returns {{}}
   */
  get itemData() {
    return ItemData[this.name];
  }
}

module.exports = Item;