const ColonistStats = require('./ColonistStats');

class Colonist {
  constructor(userId = '', username = '') {
    this.userId = userId;
    this.username = username;

    this.health = 1.0;
    this.hunger = 1.0;
    this.mood = 1.0;

    // this.stats = new ColonistStats();
  }

  get() {
    return {
      $userId: this.userId,
      $username: this.username,
      $data: JSON.stringify({
        health: this.health,
        hunger: this.hunger,
        mood: this.mood
      })
    };
  }

  set(userId, username, dataString) {
    const data = JSON.parse(dataString);

    this.userId = userId;
    this.username = username;
    this.health = data.health;
    this.hunger = data.hunger;
    this.mood = data.mood;
  }
}

module.exports = Colonist;