const userQueries = require("./user.queries");

class UserRepository {
  async getById(id) {
    const userRow = await userQueries.getById(id);
    return { ...userRow, friends: [] };
  }
}

module.exports = UserRepository;
