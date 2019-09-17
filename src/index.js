const http = require("http");
const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const passport = require("passport");

const env = require("./env");
const winston = require("./services/winston");
require("./services/passport");

const app = express(); // Create express app
app.use(cors()); // Adding cors
app.use(helmet()); // Adding helmet
app.use(morgan("combined", { stream: winston.morganStream }));
// Adding compression if in production
if (process.env.NODE_ENV === "production") {
  app.use(compression());
}
app.use(passport.initialize()); // Initiliaze passportJS
app.use(require("./middleware/jwtAuth")); // Adding jwtAuth, extract user from accessToken

require("./db/mongo"); // Connect to database

// Create apollo server
const server = new ApolloServer({
  schema: require("./schema"),
  context: require("./context"),
  formatError: require("./utils").formatError,
  tracing: process.env.NODE_ENV == "production" ? false : true,
  debug: process.env.NODE_ENV == "production" ? false : true,
});
server.applyMiddleware({ app });

const httpServer = http.createServer(app);
httpServer.listen({ port: env.GRAPHQL_SERVER_PORT }, function() {
  console.log(
    `🚀 Server ready at https://localhost:${env.GRAPHQL_SERVER_PORT}${server.graphqlPath}`,
  );
});

// Close mongoDB connections when close application
process.on("SIGTERM", async function gracefulShutdown() {
  console.log("Stopping HTTP Server.");
  httpServer.close(async function() {
    // Close any other open connections (i.e. database)
    await mongoose.connection.close();
    console.log("All connections closed.");
  });
});
