const {
  pgTable,
  uuid,
  varchar,
  boolean,
  timestamp,
} = require("drizzle-orm/pg-core");

const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),

  categoryName: varchar("category_name", { length: 255 }).notNull(),

  isActive: boolean("is_active").default(true),

  createdAt: timestamp("created_at").defaultNow(),

  updatedAt: timestamp("updated_at").defaultNow(),
});

module.exports = {
  categories,
};
