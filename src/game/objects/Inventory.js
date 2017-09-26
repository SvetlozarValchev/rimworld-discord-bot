const Item = require('./Item');
const ItemData = require('../../../data/items');

class Inventory {
  constructor() {
    /**
     * @type {number}
     */
    this.size = 4;

    /**
     * @type {Array.<Item>}
     */
    this.items = [];
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
    let item;

    if (!inventory) {
      return;
    }

    this.size = inventory.size;
    this.items = [];

    inventory.items.forEach((inventoryItem) => {
      item = new Item();
      item.set(inventoryItem);

      this.items.push(item);
    });
  }

  /**
   * @param {string} name
   * @param {string} quality
   * @returns {?number}
   */
  findItemIndex(name, quality) {
    let itemId = null;

    this.items.forEach((item, idx) => {
      if(item.name === name && item.quality === quality) {
        itemId = idx;
      }
    });

    return itemId;
  }

  /**
   * @param {string} name
   * @param {string} quality
   * @param {number} amount
   */
  addItem(name, quality, amount) {
    if (amount <= 0) {
      throw new Error('Amount has to be at least 1');
    }

    if(!ItemData[name]) {
      throw new Error('No item with name ' + name);
    }

    let itemData = ItemData[name];
    let itemIndex = this.findItemIndex(name, quality);
    let item;

    if (itemIndex !== null) {
      item = this.items[itemIndex];

      if(item.amount < itemData.maxAmount) {
        this.items[itemIndex].addAmount(amount);
      } else {
        if(this.items.length < this.size) {
          item = new Item();
          item.set({name, quality, amount});

          this.items.push(item);
        } else {
          return false;
        }
      }
    } else {
      item = new Item();
      item.set({name, quality, amount});
      this.items.push(item);
    }

    return true;
  }

  /**
   * @param {Item.Name} name
   * @param {Item.quality} quality
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

  clearItems() {
    this.items = [];
  }
}

module.exports = Inventory;