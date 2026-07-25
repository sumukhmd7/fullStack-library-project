const { books } = require("./bookSchema");

const {
  pgTable,
  uuid,
  text,
  varchar,
  integer,
  boolean,
  check,
} = require("drizzle-orm/pg-core");

const { sql } = require("drizzle-orm");
const { timestamp } = require("drizzle-orm/gel-core");

const reviews = pgTable(
  "reviews",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    bookId: uuid("book_id")
      .notNull()
      .references(() => books.id),

    review: text("review", { length: 255 }),

    rating: integer("rating", {}),

    isActive: boolean("is_active").default(true),

    createdAt: timestamp("created_at").defaultNow(),

    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    ratingCheck: check("rating_check", sql`${table.rating} BETWEEN 1 AND 10`),
  }),
);

module.exports = { reviews };
