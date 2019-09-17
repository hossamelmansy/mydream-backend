const {
  AuthenticationError,
  ForbiddenError,
  ApolloError,
} = require("apollo-server-express");
const pick = require("lodash/pick");
const { readFileSync } = require("fs");
const { join } = require("path");

// GraphQL server error types
const ERRORS = {
  AUTHENTICATION: "authentication_error",
  FORBIDDEN: "forbidden_error",
  CUSTOM: "custom_error",
};

module.exports = {
  ERRORS,
  generateRandom6Digits,
  formatError,
  throwInternalServerError,
  throwError,
  loadGQLFile,
};

// ##############################################################################
// ##############################################################################

// Generate Random 6-digits
function generateRandom6Digits() {
  return Math.floor(100000 + Math.random() * 900000);
}

// Format error for graphQL apollo server
function formatError(err) {
  if (process.env.NODE_ENV == "production") {
    return pick(err, ["message", "extensions"]);
  }

  return err;
}

// Throw internal server error
function throwInternalServerError(
  message = "Internal server error.",
  code = "INTERNAL_SERVER_ERROR",
) {
  throwError(ERRORS.CUSTOM, message, code);
}

// Throw error for graphQL apollo server
function throwError(type = ERRORS.CUSTOM, message = "Error", code = "ERROR") {
  switch (type) {
    case ERRORS.AUTHENTICATION:
      throw new AuthenticationError("Authentication required!");
    case ERRORS.FORBIDDEN:
      throw new ForbiddenError("Forbidden!");
    default:
      throw new ApolloError(message, code);
  }
}

// Read graphQL file
function loadGQLFile(file) {
  const filePath = join(__dirname, "./", file);

  return readFileSync(filePath, "utf-8");
}
