const Inventory = require('../objects/Inventory');

class Settlement {
  constructor(name) {
    /**
     * @type {string}
     */
    this.name = name;

    /**
     * @type {Inventory}
     */
    this.inventory = new Inventory();
  }

  /**
   * @param {string} name
   * @param {string} dataString
   */
  set(name, dataString) {
    const data = JSON.parse(dataString);

    this.name = name;
    this.inventory = new Inventory();
    this.inventory.set(data.inventory);
  }

  /**
   * @returns {Object}
   */
  get() {
    return {
      $name: this.name,
      $data: JSON.stringify({
        inventory: this.inventory.get()
      })
    }
  }
}

module.exports = Settlement;