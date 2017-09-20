const Colony = require('./Colony');
const Colonist = require('./Colonist');

class Manager {
  constructor(db) {
    this.db = db;

    this.colonists = {};
    this.colonies = {};
  }

  setColonists(colonists) {
    colonists.forEach(colonist => {
      this.colonists[colonist.userId] = new Colonist();
      this.colonists[colonist.userId].set(colonist.userId, colonist.username, colonist.data);
    });
  }

  getColonists() {
    return this.colonists;
  }

  getColonist(userId) {
    return this.colonists[userId];
  }

  hasColonist(userId) {
    return Object.prototype.hasOwnProperty.call(this.colonists, userId);
  }

  setColonies(colonies) {
    colonies.forEach(colony => {
      this.colonies[colony.name] = new Colony();
      this.colonies[colony.name].set(colony.name, colony.data);
    });
  }

  getColonies() {
    return this.colonies;
  }

  getColony(name) {
    return this.colonies[name];
  }

  hasColony(name) {
    return Object.prototype.hasOwnProperty.call(this.colonies, name);
  }

  createColonist(userId, username) {
    this.colonists[userId] = new Colonist(userId, username);

    return this.db.run("INSERT INTO colonists (userId, username, data) VALUES ($userId, $username, $data)",  this.colonists[userId].get()).catch(console.error);
  }

  createColony(name) {
    if(this.colonies[name]) {

    }
    this.colonists[userId] = new Colonist(userId, username);

    return this.db.run("INSERT INTO colonists (userId, username, data) VALUES ($userId, $username, $data)",  this.colonists[userId].get()).catch(console.error);
  }

  load() {

  }

  create() {

  }
}

module.exports = Manager;