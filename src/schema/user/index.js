module.exports = {
  resolvers: require("./user.resolvers"),
  typeDefs: require("../../utils").loadGQLFile("../schema/user/user.graphql"),
};
