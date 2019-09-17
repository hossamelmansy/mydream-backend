const merge = require("lodash/merge");

const email = require("./email");
const objectId = require("./objectId");
const mobilePhone = require("./mobilePhone");
const dateTime = require("./dateTime");

// TypeDefs
const typeDefs = [
  email.typeDef,
  objectId.typeDef,
  mobilePhone.typeDef,
  dateTime.typeDef,
];

// Resolvers
const resolvers = merge(
  email.resolver,
  objectId.resolver,
  mobilePhone.resolver,
  dateTime.resolver,
);

module.exports = {
  typeDefs,
  resolvers,
};
