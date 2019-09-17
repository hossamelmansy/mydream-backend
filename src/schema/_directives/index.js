const merge = require("lodash/merge");

const dateTime = require("./dateTime");
const auth = require("./auth");

// TypeDefs
const typeDefs = [dateTime.typeDef, auth.typeDef];

// Schema directives
const schemaDirectives = merge(dateTime.directive, auth.directive);

module.exports = {
  typeDefs,
  schemaDirectives,
};
