const { gql } = require("apollo-server-express");
const { GraphQLScalarType } = require("graphql");

const { isDateTime } = require("../../utils/validator");

// TypeDef
const typeDef = gql`
  scalar DateTime
`;

function dateTime() {
  return new GraphQLScalarType({
    name: "DateTime",
    description: "DateTime custom scalar type",
    serialize(value) {
      // gets invoked when serializing the result to send it back to the client
      return value;
    },
    parseValue(value) {
      // gets invoked to parse client input that was passed through variables
      isDateTime(value, { error: true });
      return new Date(value);
    },
    parseLiteral(ast) {
      // gets invoked to parse client input that was passed inline in the query
      isDateTime(ast.value, { error: true });
      return new Date(ast.value);
    },
  });
}

module.exports = {
  typeDef,
  resolver: { DateTime: dateTime() },
};
