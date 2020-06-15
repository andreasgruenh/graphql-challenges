const db = require("../db")

const userQueries = {
  getById: id => {
    return new Promise((resolve, reject) => {
      db.get(
        `
        SELECT *
        FROM user
        WHERE id = ?
      `,
        id,
        (err, userRow) => {
          if (err) {
            reject(new Error(err));
          } else {
            resolve(userRow);
          }
        }
      );
    });
  },
  getByIds: ids => {
    return new Promise((resolve, reject) => {
      db.all(
        `
        SELECT *
        FROM user
        WHERE id IN (${new Array(ids.length).fill("?").join(", ")})
      `,
        ids,
        (err, userRows) => {
          if (err) {
            reject(new Error(err));
          } else {
            const userRowsById = {};
            userRows.forEach(row => (userRowsById[row.id] = row));
            const userRowsInCorrectOrder = ids.map(id => userRowsById[id]);
            resolve(userRowsInCorrectOrder);
          }
        }
      );
    });
  },
  getFriendIds: userId => {
    return new Promise((resolve, reject) => {
      db.all(
        `
        SELECT *
        FROM friends
        WHERE user1Id = ? OR user2Id = ?
      `,
        [userId, userId],
        (err, resultRows) => {
          if (err) {
            reject(new Error(err));
          } else {
            const idPairs = resultRows.map(r => [r.user1Id, r.user2Id]);
            const flattenedPairs = [].concat(...idPairs);
            const friendIds = flattenedPairs.filter(id => id !== userId);
            resolve(friendIds);
          }
        }
      );
    });
  },
  getAllFriendIds: userIds => {
    return new Promise((resolve, reject) => {
      const placeholders = new Array(userIds.length).fill("?").join(", ");
      db.all(
        `
        SELECT *
        FROM friends
        WHERE (user1Id IN (${placeholders})) OR (user2Id IN (${placeholders}))
      `,
        [...userIds, ...userIds],
        (err, resultRows) => {
          if (err) {
            reject(new Error(err));
          } else {
            const idPairs = resultRows.map(r => [r.user1Id, r.user2Id]);

            const friendIdsByUserId = {};
            idPairs.forEach(([a, b]) => {
              if (!friendIdsByUserId[a]) friendIdsByUserId[a] = [];
              if (!friendIdsByUserId[b]) friendIdsByUserId[b] = [];
              friendIdsByUserId[a].push(b);
              friendIdsByUserId[b].push(a);
            });
            resolve(userIds.map(userId => friendIdsByUserId[userId]));
          }
        }
      );
    });
  },
  getAll: () => {
    return new Promise((resolve, reject) => {
      db.all(
        `
        SELECT *
        FROM user
      `,
        (err, userRows) => {
          if (err) {
            reject(new Error(err));
          } else {
            resolve(userRows);
          }
        }
      );
    });
  },
  getFriendPairs: () => {
    return new Promise((resolve, reject) => {
      db.all(
        `
        SELECT *
        FROM friends
      `,
        (err, resultRows) => {
          if (err) {
            reject(new Error(err));
          } else {
            const idPairs = resultRows.map(r => [r.user1Id, r.user2Id]);
            resolve(idPairs);
          }
        }
      );
    });
  }
};

module.exports = userQueries;
