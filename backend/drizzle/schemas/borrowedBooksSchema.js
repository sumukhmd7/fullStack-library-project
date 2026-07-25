const { pgTable, uuid, timestamp, integer } = require("drizzle-orm/pg-core");

const { users } = require("./userSchema");
const { books } = require("./bookSchema");

const borrowedBooks = pgTable("borrowed_books", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),

  bookId: uuid("book_id")
    .references(() => books.id)
    .notNull(),

  borrowedAt: timestamp("borrowed_at").defaultNow().notNull(),

  dueDate: timestamp("due_date"),

  returnedAt: timestamp("returned_at"),

  fine: integer("fine").default(0),

  createdAt: timestamp("created_at").defaultNow(),

  updatedAt: timestamp("updated_at").defaultNow(),
});

module.exports = { borrowedBooks };
