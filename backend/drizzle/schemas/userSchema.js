const {
  pgTable,
  uuid,
  text,
  varchar,
  boolean,
  timestamp,
  json,
} = require("drizzle-orm/pg-core");

const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),

  userName: text("user_name").notNull(),

  userPhone: varchar("user_phone", { length: 15 }).notNull(),

  userEmail: text("user_email").notNull(),

  userPassword: text("user_password").notNull(),

  userAddress: text("user_address").notNull(),

  userProfilePic: text("user_profile_pic").notNull(),

  userGender: text("user_gender").notNull(),

  // borrowBooks: json("borrow_books").default([]),

  usedPasswords: json("used_passwords").default([]),

  userRole: text("user_role").default("user"),

  isActive: boolean("is_active").default(true),

  createdAt: timestamp("created_at").defaultNow(),

  updatedAt: timestamp("updated_at").defaultNow(),
});

module.exports = { users };
