const mongoose = require("mongoose");

const env = require("../env");
const winston = require("../services/winston");

mongoose.Promise = global.Promise;
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
  keepAlive: true,
  user: env.MONGO_USER,
  pass: env.MONGO_PASSWORD,
  dbName: env.MONGO_DATABSE,
  poolSize: env.MONGO_CONNECTION_POOL_SIZE,
  autoIndex: process.env.NODE_ENV != "production", // mongoose will build indexes when it connects, set to false on production
  reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
  reconnectInterval: 500, // Reconnect every 500ms
};

(async function connectToDB() {
  try {
    await mongoose.connect(env.MONGO_URI, options);
  } catch (err) {
    console.log("Error connecting to databse.");
    winston.error(err);
  }
})();

// On database connection error
mongoose.connection.on("error", function(err) {
  console.error(err);
  winston.error(err);
});

// While databse connecting
mongoose.connection.on("connecting", function() {
  console.log("Connecting to database....");
});

// After databse connected
mongoose.connection.on("connected", function() {
  console.log("Successfully connected to database.");
});

// After databse disconnected
mongoose.connection.on("disconnected", function() {
  console.log("Disconnected from database.");
});
