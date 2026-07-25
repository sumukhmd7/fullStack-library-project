const {
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} = require("drizzle-orm/pg-core");

const bookLogs = pgTable("book_logs", {
  id: serial("id").primaryKey(),
  level: varchar("level", { length: 20 }),
  message: text("message"),
  timestamp: timestamp("timestamp").defaultNow(),
});

module.exports = { bookLogs };
