const userQueries = require("./user.queries");
const User = require("./user.entity");

let usersById = null;

class UserRepository {
  getById(id) {
    return usersById[id];
  }

  async init() {
    if (usersById) return;

    usersById = {};
    const userRows = await userQueries.getAll();
    userRows.forEach(u => {
      usersById[u.id] = new User(u, []);
    });

    const friendPairs = await userQueries.getFriendPairs();
    friendPairs.forEach(([a, b]) => {
      usersById[a].friends.push(usersById[b]);
      usersById[b].friends.push(usersById[a]);
    });
  }
}

module.exports = UserRepository;
