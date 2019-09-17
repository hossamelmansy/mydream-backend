const { gql } = require("apollo-server-express");
const { GraphQLScalarType } = require("graphql");

const { isEmail } = require("../../utils/validator");

// TypeDef
const typeDef = gql`
  scalar Email
`;

function email() {
  return new GraphQLScalarType({
    name: "Email",
    description: "Email custom scalar type",
    serialize(value) {
      // gets invoked when serializing the result to send it back to the client
      return String(value)
        .trim()
        .toLowerCase();
    },
    parseValue(value) {
      // gets invoked to parse client input that was passed through variables
      isEmail(value, { error: true });
      return String(value)
        .trim()
        .toLowerCase();
    },
    parseLiteral(ast) {
      // gets invoked to parse client input that was passed inline in the query
      isEmail(ast.value, { error: true });
      return String(ast.value)
        .trim()
        .toLowerCase();
    },
  });
}

module.exports = {
  typeDef,
  resolver: { Email: email() },
};
