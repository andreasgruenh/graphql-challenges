const fs = require("fs");
const path = require("path");

const graphql = require("graphql");

// #region code first schema
// Define the User type
const userType = new graphql.GraphQLObjectType({
  name: "User",
  fields: () => ({
    id: { type: graphql.GraphQLInt },
    name: { type: graphql.GraphQLString },
    friends: {
      type: graphql.GraphQLList(userType),
      resolve: function(user) {
        // Get friends from database
      }
    }
  })
});

// Define the Query type
const queryType = new graphql.GraphQLObjectType({
  name: "Query",
  fields: {
    user: {
      type: userType,
      args: {
        id: { type: graphql.GraphQLInt }
      },
      resolve: function(_, { id }) {
        // Get from database;
      }
    }
  }
});

const codeFirstSchema = new graphql.GraphQLSchema({ query: queryType });
// #endregion

const schemaFirstSchema = graphql.buildSchema(
  fs.readFileSync(path.join(__dirname, "./schema.graphql")).toString()
);

module.exports = schemaFirstSchema;
