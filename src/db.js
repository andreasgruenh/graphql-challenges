const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database(":memory:", () => {
  db.serialize(() => {
    db.run("CREATE TABLE user (id INTEGER, name TEXT)");
    db.run("CREATE TABLE friends (user1Id INTEGER, user2Id INTEGER)");

    // #region insert dummy data
    users.map(user => {
      db.run("INSERT INTO user VALUES (?, ?)", [user.id, user.name]);
    });

    friendPairs.map(([a, b]) => {
      db.run("INSERT INTO friends VALUES (?, ?)", [a, b]);
    });
    // #endregion
  });
});

// #region helpers
let index = 1;
db.on("trace", query => {
  console.log(`DB - ${index++}: ${query}`);
});

db.resetQueryIndex = () => {
  index = 1;
};

// #endregion

module.exports = db;

// #region dummy data
const users = [
  {
    id: 1,
    name: "Luke Skywalker"
  },
  {
    id: 2,
    name: "Anakin Skywalker"
  },
  {
    id: 3,
    name: "Darth Sidious"
  },
  {
    id: 4,
    name: "Han Solo"
  },
  {
    id: 5,
    name: "Yoda"
  }
];
const friendPairs = [[1, 2], [1, 4], [1, 5], [2, 3], [2, 5]];

// #endregion
