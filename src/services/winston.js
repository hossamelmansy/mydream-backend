const winston = require("winston");

// Define the custom settings for each transport
const options = {
  handleExceptions: true,
  json: true,
  maxsize: 5242880, // 5MB
  maxFiles: 5,
  colorize: false,
};

// Instantiate a new Winston logger with the settings defined above
const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({
      ...options,
      filename: "logs/error.log",
      level: "error",
    }),
    new winston.transports.File({
      ...options,
      filename: "logs/combined.log",
    }),
  ],
  exitOnError: false,
});

// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({ format: winston.format.simple() }),
  );
}

// Create a stream object with a 'write' function that will be used by 'morgan'
logger.morganStream = {
  write: function(message) {
    // Use the 'info' log level so the output will be picked up by both transports (file and console)
    logger.info(message);
  },
};

module.exports = logger;
