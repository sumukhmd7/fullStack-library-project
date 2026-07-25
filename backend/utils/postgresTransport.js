const Transport = require("winston-transport");
const db = require("../db");
const { bookLogs } = require("../drizzle/schemas/logSchema");
const { timeStamp } = require("node:console");

class PostgresTransport extends Transport {
  async log(info, callback) {
    try {
      await db.insert(bookLogs).values({
        level: info.level,
        message: info.message,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Error saving log to DB:", error.message);
    }

    callback();
  }
}

module.exports = PostgresTransport;
