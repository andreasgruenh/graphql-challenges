# graphql-challenges

Code sample for the talk "GraphQL: New challenges for the backend"

## Setup

This is a basic express app, that servers the following graphQL schema:

```graphql
type User {
  id: Int!
  name: String!
  friends: [User!]!
}

type Query {
  user(id: Int): User
}
```

It is storing data in an inmemory sqlite database in order to show the persistence concepts with a common persistence model.
In `src/user` there are multiple `repositories` that implement the different ways to fetch the data from the database.

## 1: Unfinished lazy loading

This is just for the first setup, where we simply return an empty array when querying `user.friends`.

## 2: Lazy loading

Here, we carelessly load data from the database, whenever a new field is queried. This results in many superfluous queries that eat performance when the graphQL query becomes larger. For small sample apps and demos this is however still a viable solution, because it is very simple to implement.

## 3: Inmemory

In this repository, we initialize all required data before the request goes into the graphQL layer. This means, that resolving of values is completly synchronous which makes this step very easy. This can be used, when clients query a large portion of the data anyways, which makes loading data lazily pointless. This can also be used for isolated performance sensitive parts of your schema, where you want to optimize database queries for specific queries from the clients.

## 4. Batch-lazy-loading

Here we try to defer loading of data until it is needed but we cache all loaded entities. Additionally, when a field is queried that needs data from the database, we resolve this field for all entities that are currently in the cache. This results in no overfetching for the common cases. However, this eager priming of the cache has to be serialized, which is why we used the `async-mutex` library to synchronize prime calls.

## 5. dataloder

Lastly, we implemented the dataloader pattern. Whenever an async field is queried, we store this data request in a queue and wait for all other current fields to be resolved (by using `setTimeout(0)`). This way, we queue up multiple data requests for the same type, which can then be resolved in one batch.
