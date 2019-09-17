const { gql } = require("apollo-server-express");
const { GraphQLScalarType } = require("graphql");
const mongoose = require("mongoose");

const { isObjectId } = require("../../utils/validator");

// TypeDef
const typeDef = gql`
  scalar ObjectId
`;

function objectId() {
  return new GraphQLScalarType({
    name: "ObjectId",
    description: "ObjectId custom scalar type",
    serialize(value) {
      // gets invoked when serializing the result to send it back to the client
      return String(value).trim();
    },
    parseValue(value) {
      // gets invoked to parse client input that was passed through variables
      isObjectId(value, { error: true });
      return new mongoose.Types.ObjectId(value);
    },
    parseLiteral(ast) {
      // gets invoked to parse client input that was passed inline in the query
      isObjectId(ast.value, { error: true });
      return new mongoose.Types.ObjectId(ast.value);
    },
  });
}

module.exports = {
  typeDef,
  resolver: { ObjectId: objectId() },
};
