const userQueries = require("./user.queries");
const User = require("./user.entity");

class UserRepository {
    async getById(id) {
        const userRow = await userQueries.getById(id);
        return new User(userRow, []);
    }
}

module.exports = UserRepository;
