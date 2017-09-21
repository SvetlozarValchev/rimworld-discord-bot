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

    /**
     * @type {number}
     */
    this.members = 1;
  }

  addMember() {
    this.members += 1;
  }

  removeMember() {
    this.members -= 1;
  }

  /**
   * @param {string} name
   * @param {string} dataString
   */
  set(name, dataString) {
    const data = JSON.parse(dataString);

    this.name = name;
    this.members = data.members;
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
        members: this.members,
        inventory: this.inventory.get()
      })
    }
  }
}

module.exports = Settlement;