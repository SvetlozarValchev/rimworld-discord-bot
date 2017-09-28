const { createCanvas, loadImage } = require('canvas');
const Assets = require('../Assets');
const Item = require('./Item');
const ItemData = require('../../../data/items');

const GRID_SIZE = 64;

class Inventory {
  constructor() {
    /**
     * @type {number}
     */
    this.size = 9;

    /**
     * @type {Array.<Item>}
     */
    this.items = [];

    /**
     * @type {Object.<string, Array.<Function>>}
     */
    this.events = {};
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
      if (item.name === name && item.quality === quality) {
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

    if (!ItemData[name]) {
      throw new Error('No item with name ' + name);
    }

    let itemData = ItemData[name];
    let itemIndex = this.findItemIndex(name, quality);
    let item;

    if (itemIndex !== null) {
      item = this.items[itemIndex];

      if (item.amount < itemData.maxAmount) {
        this.items[itemIndex].addAmount(amount);
      } else {
        if (this.items.length < this.size) {
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

    this.emit('change');

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

      this.emit('change');
    } else {
      throw new Error('Item doesn\'t exist');
    }
  }

  clearItems() {
    this.items = [];
  }

  /**
   * @returns {Canvas}
   */
  draw() {
    const offsetX = 7, offsetY = 58;
    const inventorySizeSqrt = Math.sqrt(this.size);
    const canvas = createCanvas(GRID_SIZE * inventorySizeSqrt, GRID_SIZE * inventorySizeSqrt);
    const ctx = canvas.getContext('2d');
    let itemIdx = 0, asset, item, itemData;

    for (let y = 0; y < inventorySizeSqrt; y++) {
      for (let x = 0; x < inventorySizeSqrt; x++) {
        item = null;
        asset = Assets.get['inventory']['slot'];

        ctx.drawImage(asset, x * GRID_SIZE, y * GRID_SIZE, asset.width, asset.height);

        if (itemIdx < this.items.length) {
          item = this.items[itemIdx];

          asset = Assets.get['items'][item.itemData.image];
          ctx.drawImage(asset, x * GRID_SIZE, y * GRID_SIZE, asset.width, asset.height);
        }

        itemIdx++;

        if (item && item.itemData && item.itemData.maxAmount > 1) {
          asset = Assets.get['inventory']['bar'];

          ctx.drawImage(asset, x * GRID_SIZE, y * GRID_SIZE, asset.width, asset.height);

          ctx.font = 'bold 16px "Arial"';
          ctx.fillStyle = "#DDDDDD";
          ctx.fillText(String(item.amount), x * GRID_SIZE + offsetX, y * GRID_SIZE + offsetY);
        }
      }
    }

    return canvas;
  }

  on(event, cb) {
    if(!this.events[event]) {
      this.events[event] = [];
    }

    this.events[event].push(cb);
  }

  emit(event) {
    if(this.events[event]) {
      this.events.forEach((cb) => {
        cb();
      });
    }
  }
}

module.exports = Inventory;