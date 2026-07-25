const { createLogger, transports, format } = require("winston");
const PostgresTransport = require("../postgresTransport"); // ✅ import custom transport

const bookLogger = createLogger({
  transports: [
    // Console INFO
    new transports.Console({
      level: "info",
      format: format.combine(format.timestamp(), format.json()),
    }),

    // Console ERROR
    new transports.Console({
      level: "error",
      format: format.combine(format.timestamp(), format.json()),
    }),

    // File Logs
    new transports.File({
      filename: "logs/bookLogger/bookLogs.log",
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

    // ✅ PostgreSQL Logs (Drizzle replaces MongoDB)
    new PostgresTransport({
      level: "info",
    }),
  ],
});

module.exports = bookLogger;
