const express = require("express");
const graphqlHTTP = require("express-graphql");

// #region local imports
const rootValue = require("./rootValue");
const schema = require("./schema");
const db = require("./db");
// #endregion

// #region steps
// const UserRepository = require("./user/user.repository.01-unfinished-lazy");
// const UserRepository = require("./user/user.repository.02-lazy");
// const UserRepository = require("./user/user.repository.03-inmemory");
// const UserRepository = require("./user/user.repository.04-batch-lazy-loading");
const UserRepository = require("./user/user.repository.05-data-loader");
// #endregion

const app = express();

app.use(async (req, res, next) => {
  db.resetQueryIndex();

  const userRepository = new UserRepository();
  if (userRepository.init) {
    await userRepository.init();
  }
  req.dependencies = { userRepository };
  return next();
});

app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    rootValue,
    graphiql: true,
    customFormatErrorFn: formatError
  })
);

app.listen(4000, () => console.log("Now browse to localhost:4000/graphql"));

// #region helpers
function formatError(error) {
  console.error(error);
  const message = error.message || "An unknown error occurred.";
  const locations = error.locations;
  const path = error.path;
  const extensions = error.extensions;

  return extensions
    ? { message, locations, path, extensions }
    : { message, locations, path };
}
// #endregion
