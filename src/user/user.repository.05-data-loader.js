const userQueries = require("./user.queries");

class UserRepository {
  userByIdDataLoader = new MyDataLoader(async (userIds) => {
    const userRows = await userQueries.getByIds(userIds);
    return userRows.map((userRow) => ({
      ...userRow,
      friends: () => this.friendsByUserIdDataLoader.load(userRow.id),
    }));
  });
  friendsByUserIdDataLoader = new MyDataLoader(async (userIds) => {
    const friendIdsChunkedByUserId = await userQueries.getAllFriendIds(userIds);
    const friendsChunkedByUserId = await Promise.all(
      friendIdsChunkedByUserId.map((friendIds) =>
        this.userByIdDataLoader.loadMany(friendIds)
      )
    );
    return friendsChunkedByUserId;
  });

  async getById(id) {
    return this.userByIdDataLoader.load(id);
  }
}

/**
 * Helper
 */
function MyDataLoader(batchLoadingFunction) {
  let cache = {};
  let queue = new Set();
  let loadingPromise = null;

  async function load(key) {
    if (cache[key]) return cache[key];

    queue.add(key);

    // wait until all sync tasks completed.
    // NOTE: Not a thread.sleep. Main thread is not blocked
    await new Promise((r) => setTimeout(r, 0));

    if (!loadingPromise) {
      loadingPromise = new Promise(async (resolve) => {
        const queueArray = [...queue];
        queue = new Set();
        const result = await batchLoadingFunction(queueArray);
        queueArray.map((key, index) => {
          const keyResult = result[index];
          cache[key] = keyResult;
        });
        loadingPromise = null;
        resolve();
      });
    }

    await loadingPromise;
    return cache[key];
  }
  function loadMany(keys) {
    return Promise.all(keys.map((key) => load(key)));
  }

  return {
    load,
    loadMany,
  };
}

module.exports = UserRepository;
