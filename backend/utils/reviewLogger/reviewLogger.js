const { createLogger, transports, format } = require("winston");
require("dotenv").config();

const PostgresTransport = require("../postgresTransport");

const reviewLogger = createLogger({
  transports: [
    // Console Info
    new transports.Console({
      level: "info",
      format: format.combine(format.timestamp(), format.json()),
    }),

    // Console Error
    new transports.Console({
      level: "error",
      format: format.combine(format.timestamp(), format.json()),
    }),

    // File Logs
    new transports.File({
      filename: "logs/reviewLogger/reviewLogs.log",
      level: "info",
      maxsize: 5242880,
      format: format.combine(
        format.timestamp({ format: "MMM-DD-YYYY HH:mm:ss" }),
        format.align(),
        format.printf(
          (info) => `level ${info.level}: ${info.timestamp} ${info.message}`,
        ),
      ),
    }),

    // PostgreSQL Logs (Drizzle)
    new PostgresTransport({
      level: "info",
    }),
  ],
});

module.exports = reviewLogger;
