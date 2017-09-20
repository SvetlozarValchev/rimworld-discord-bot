class Resource {
  constructor(type) {
    this.type = type;
  }

  static get Type() {
    return {
      None: '',
      Lumber: 'lumber',
      Stone: 'stone',
      Cloth: 'cloth',
      Component: 'component',
    }
  }
}

module.exports = Resource;