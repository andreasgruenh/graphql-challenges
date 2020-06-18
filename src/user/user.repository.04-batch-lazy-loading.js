const { Mutex } = require("async-mutex");

const userQueries = require("./user.queries");
const User = require("./user.entity");

class UserRepository {
  loadedUsersById = {};
  loadedFriendsByUserId = {};

  async getById(id) {
    const user = this.loadedUsersById[id] || (await userQueries.getById(id));

    this.loadedUsersById[id] = { ...user, friends: () => this.getFriends(id) };

    return this.loadedUsersById[id];
  }

  async getFriends(userId) {
    await this.primeFriendsForLoadedUsers();
    return this.loadedFriendsByUserId[userId];
  }

  mutex = new Mutex();
  async primeFriendsForLoadedUsers() {
    const release = await this.mutex.acquire();

    const usersWithoutLoadedFriends = this._getUserIdsWithoutLoadedFriends();
    if (usersWithoutLoadedFriends.length === 0) {
      release();
      return;
    }

    const friendIdsForUserIds = await userQueries.getAllFriendIds(
      usersWithoutLoadedFriends
    );

    await this._primeUsersForFriendIds(friendIdsForUserIds.flat());

    usersWithoutLoadedFriends.forEach((id, index) => {
      const friendIds = friendIdsForUserIds[index];
      const friends = friendIds.map((id) => this.loadedUsersById[id]);
      this.loadedFriendsByUserId[id] = friends;
    });
    release();
  }

  /**
   * Helpers
   */
  _getUserIdsWithoutLoadedFriends() {
    const loadedUserIds = Object.keys(this.loadedUsersById).map(Number);
    const usersWithoutLoadedFriends = loadedUserIds.filter(
      (id) => !this.loadedFriendsByUserId[id]
    );
    return usersWithoutLoadedFriends;
  }

  async _primeUsersForFriendIds(friendIds) {
    const uniqFriendIds = [...new Set(friendIds)];

    const friendIdsWithoutLoadedUser = uniqFriendIds.filter(
      (id) => !this.loadedUsersById[id]
    );
    if (friendIdsWithoutLoadedUser.length > 0) {
      const friendUserRows = await userQueries.getByIds(
        friendIdsWithoutLoadedUser
      );
      friendUserRows.forEach((userRow) => {
        this.loadedUsersById[userRow.id] = {
          ...userRow,
          friends: () => this.getFriends(userRow.id),
        };
      });
    }
  }
}

module.exports = UserRepository;
