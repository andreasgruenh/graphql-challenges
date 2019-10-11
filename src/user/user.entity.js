class User {
  constructor(userRow, friends) {
    this.id = userRow.id;
    this.name = userRow.name;
    this.friends = friends;
  }
}

module.exports = User;
