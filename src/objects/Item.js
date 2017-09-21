class Item {
  constructor() {
    /**
     * @type {Item.Name}
     */
    this.name = Item.Name.None;

    /**
     * @type {Item.Quality}
     */
    this.quality = Item.Quality.None;

    /**
     * @type {number}
     */
    this.amount = 1;
  }

  /**
   * @enum
   * @returns {Object}
   */
  static get Name() {
    return {
      None: 'None',
      Lumber: 'Lumber',
      Stone: 'Stone',
      Cloth: 'Cloth',
      Component: 'Component',
    }
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
  }

  addAmount(amount) {
    this.amount += amount;
  }
}

module.exports = Item;