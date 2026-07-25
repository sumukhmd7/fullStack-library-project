require("dotenv").config();

module.exports = {
  schema: "./drizzle/schemas/*",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
};
