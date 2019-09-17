require("dotenv").config();

const environmentVariables = {
  GRAPHQL_SERVER_PORT: process.env.GRAPHQL_SERVER_PORT || null, // Graphql server port
  MONGO_URI: process.env.MONGO_URI, // Mongo URI
  MONGO_DATABASE: process.env.MONGO_DATABASE, // Mongo database name
  MONGO_USER: process.env.MONGO_USER, // Mongo auth user
  MONGO_PASSWORD: process.env.MONGO_PASSWORD, // Mongo auth password
  MONGO_CONNECTION_POOL_SIZE: process.env.MONGO_CONNECTION_POOL_SIZE
    ? parseInt(process.env.MONGO_CONNECTION_POOL_SIZE, 10)
    : 10, // Mongo connection pool size
  JWT_SECRET: process.env.JWT_SECRET, // Jwt secret key used for signature
  JWT_ISSUER: process.env.JWT_ISSUER, // Jwt issuer property
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY, // Send grid api key
  JWT_ACC_TOKEN_EXP: process.env.JWT_ACC_TOKEN_EXP, // Jwt access token expiry time
  JWT_REF_TOKEN_EXP: process.env.JWT_REF_TOKEN_EXP, // Jwt refresh token expiry without remember me
  JWT_REF_TOKEN_EXP_REM: process.env.JWT_REF_TOKEN_EXP_REM, // // Jwt refresh token expiry with remember me
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID, // Twilio account sid
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN, // Twilio authentication token
  TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER, // Twilio phone number
  PASSWORD_RESET_TOKEN_EXPIRY: process.env.PASSWORD_RESET_TOKEN_EXPIRY, // Password reset token expiry
};

// Check that all required environment variables have been set and exit server if any aren't defined
const missingEnvs = Object.keys(environmentVariables).filter(function isNull(
  key,
) {
  return environmentVariables[key] == null;
});
const isMissingEnvs = missingEnvs.length > 0;

if (isMissingEnvs) {
  console.error("The following required environment variables are missing");
  console.error(missingEnvs.join("\n"), "\n");
  throw new Error("Environment variables are missing.");
}

module.exports = environmentVariables;
