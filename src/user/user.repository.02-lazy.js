const userQueries = require("./user.queries");
const User = require("./user.entity");

class UserRepository {
  async getById(id) {
    const userRow = await userQueries.getById(id);

    return new User(userRow, () => this.getFriendsOfUser(id));
  }

  async getFriendsOfUser(userId) {
    const friendIds = await userQueries.getFriendIds(userId);
    const friendUserRows = await userQueries.getByIds(friendIds);
    return friendUserRows.map(
      friend => new User(friend, () => this.getFriendsOfUser(friend.id))
    );
  }
}

module.exports = UserRepository;
