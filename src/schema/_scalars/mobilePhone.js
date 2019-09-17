const { gql } = require("apollo-server-express");
const { GraphQLScalarType } = require("graphql");

const { isMobilePhone } = require("../../utils/validator");

// TypeDef
const typeDef = gql`
  scalar MobilePhone
`;

function mobilePhone() {
  return new GraphQLScalarType({
    name: "MobilePhone",
    description: "MobilePhone custom scalar type",
    serialize(value) {
      // gets invoked when serializing the result to send it back to the client
      return String(value).trim();
    },
    parseValue(value) {
      // gets invoked to parse client input that was passed through variables
      isMobilePhone(value, { error: true });
      return String(value).trim();
    },
    parseLiteral(ast) {
      // gets invoked to parse client input that was passed inline in the query
      isMobilePhone(ast.value, { error: true });
      return String(ast.value).trim();
    },
  });
}

module.exports = {
  typeDef,
  resolver: { MobilePhone: mobilePhone() },
};
