const express = require("express");
const graphqlHTTP = require("express-graphql");

const rootValue = require("./rootValue");
const schema = require("./schema");
const db = require("./db");

// Instantiate express app
const app = express();

/**
 * When using graphQL as a middleware, we can prepend arbitrary other middlewares
 * This can be used for authentication or dependency instatiation.
 **/

app.use(async (req, res, next) => {
  db.resetQueryIndex();

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
