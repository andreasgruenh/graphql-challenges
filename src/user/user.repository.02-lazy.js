const userQueries = require("./user.queries");

class UserRepository {
  async getById(id) {
    const userRow = await userQueries.getById(id);

    return { ...userRow, friends: () => this.getFriendsOfUser(id) };
  }

  async getFriendsOfUser(userId) {
    const friendIds = await userQueries.getFriendIds(userId);
    const friendUserRows = await userQueries.getByIds(friendIds);
    return friendUserRows.map((friend) => ({
      ...friend,
      friends: () => this.getFriendsOfUser(friend.id),
    }));
  }
}

module.exports = UserRepository;
