const userQueries = require("./user/user.queries");

const rootValue = {
  user: async ({ id }) => {
    const repository = new UserRepository();
    return repository.getById(id);
    const userRow = await userQueries.getById(id);
    return {
      id: id,
      name: userRow.name,
      friends: () => getFriendsOfUser(id),
    };
  },
};

async function getFriendsOfUser(id) {
  const friendIds = await userQueries.getFriendIds(id);
  const friendUserRows = await userQueries.getByIds(friendIds);

  return friendUserRows.map((friend) => ({
    id: friend.id,
    name: friend.name,
    friends: () => getFriendsOfUser(friend.id),
  }));
}

module.exports = rootValue;

async function getUsersById() {
  usersById = {};
  const userRows = await userQueries.getAll();
  userRows.forEach((u) => {
    usersById[u.id] = { ...u, friends: [] };
  });

  const friendPairs = await userQueries.getFriendPairs();
  friendPairs.forEach(([a, b]) => {
    usersById[a].friends.push(usersById[b]);
    usersById[b].friends.push(usersById[a]);
  });
  return usersById;
}

const UserRepository = require("./user/user.repository.05-data-loader");
