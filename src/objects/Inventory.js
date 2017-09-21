const Item = require('./Item');

class Inventory {
  constructor() {
    /**
     * @type {number}
     */
    this.size = 0;
    /**
     * @type {Array.<Item>}
     */
    this.items = {};
  }

  static itemName(name, quality) {
    return `${name}.${quality}`;
  }

  /**
   * @returns {Inventory}
   */
  get() {
    return this;
  }

  /**
   * @param {Object} inventory
   */
  set(inventory) {
    if (!inventory) {
      return;
    }

    this.items = {};

    Object.keys(inventory.items).forEach((key) => {
      this.items[key] = new Item();
      this.items[key].set(inventory.items[key]);
    });
  }

  /**
   * @param {Item.Name} name
   * @param {Item.Quality} quality
   * @param {number} amount
   */
  addItem(name, quality, amount) {
    if (amount <= 0) {
      throw new Error('Amount has to be at least 1');
    }

    const itemName = Inventory.itemName(name, quality);
    let item = this.items[itemName];

    if (item) {
      item.addAmount(amount);
    } else {
      item = new Item();
      item.set({
        name,
        quality,
        amount
      });
    }
  }

  /**
   * @param {Item.Name} name
   * @param {Item.Quality} quality
   * @param {number} amount
   */
  removeItem(name, quality, amount) {
    if (amount <= 0) {
      throw new Error('Amount has to be at least 1');
    }

    const itemName = Inventory.itemName(name, quality);
    let item = this.items[itemName];

    if (item) {
      item.addAmount(amount);

      if (item.amount <= 0) {
        delete this.items[itemName];
      }
    } else {
      throw new Error('Item doesn\'t exist');
    }
  }
}

module.exports = Inventory;