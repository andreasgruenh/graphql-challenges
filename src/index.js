const express = require("express");
const graphqlHTTP = require("express-graphql");

// #region local imports
const rootValue = require("./rootValue");
const schema = require("./schema");
const db = require("./db");
// #endregion

// #region steps
// const UserRepository = require("./user/user.repository.01-unfinished-lazy");
const UserRepository = require("./user/user.repository.02-lazy");
// const UserRepository = require("./user/user.repository.03-inmemory");
// const UserRepository = require("./user/user.repository.04-batch-lazy-loading");
// const UserRepository = require("./user/user.repository.05-data-loader");
// #endregion

// Instantiate express app
const app = express();

/**
 * When using graphQL as a middleware, we can prepend arbitrary other middlewares
 * This can be used for authentication or dependency instatiation.
 **/

app.use(async (req, res, next) => {
  db.resetQueryIndex();

  // Each request gets its own userRepository
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
    customFormatErrorFn: formatError,
  })
);

app.listen(4040, () => console.log("Now browse to localhost:4040/graphql"));

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
