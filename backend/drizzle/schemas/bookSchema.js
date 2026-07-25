//const { users } = require("./users");
const { categories } = require("./categorySchema");

const {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  pgEnum,
} = require("drizzle-orm/pg-core");

// Optional: Enum for book status
//const bookStatusEnum = pgEnum("book_status", ["available", "unavailable"]);

const books = pgTable("books", {
  id: uuid("id").defaultRandom().primaryKey(),

  bookName: varchar("book_name", { length: 255 }).notNull(),

  bookDescription: text("book_description").notNull(),

  bookAuthor: varchar("book_author", { length: 255 }).notNull(),

  // bookCategory: varchar("book_category", { length: 100 }).default("common"),

  categoryId: uuid("category_id")
    .references(() => categories.id)
    .notNull(),

  bookImage: text("book_image").notNull(),

  bookStatus: text("book_status").default("available"),

  bookCost: integer("book_cost").notNull(),

  bookLikes: integer("book_likes").default(0),

  likeByUsers: uuid("like_by_users").array(),

  bookDislikes: integer("book_dislikes").default(0),

  // currentOwner: uuid("current_owner"),

  isActive: boolean("is_active").default(true),

  createdAt: timestamp("created_at").defaultNow(),

  updatedAt: timestamp("updated_at").defaultNow(),
});

module.exports = {
  books,
};
