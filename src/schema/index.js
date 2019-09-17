const { makeExecutableSchema, gql } = require("apollo-server-express");
const merge = require("lodash/merge");

const directives = require("./_directives"); // directives
const scalars = require("./_scalars"); // scalars
const user = require("./user");

/**
 * Create a base typeDef so other typeDefs can extend them later
 * Types cannot be empty, so we'll define something in each type
 */
const baseTypeDefs = gql`
  type Query {
    _: Boolean
  }

  type Mutation {
    _: Boolean
  }

  type Subscription {
    _: Boolean
  }
`;

// TypeDefs
const typeDefs = [
  baseTypeDefs,
  ...scalars.typeDefs,
  ...directives.typeDefs,
  user.typeDefs,
];

// Resolvers
const resolvers = merge(scalars.resolvers, user.resolvers);

// Schema
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
  schemaDirectives: directives.schemaDirectives,
});

module.exports = schema;
