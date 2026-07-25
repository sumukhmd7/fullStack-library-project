const { z } = require("zod");

const bookValidationsSchema = {
  addBook: z
    .object({
      bookName: z
        .string()
        .min(1, "bookName should be at least 1 character")
        .max(100, "bookName should not exceed 100 characters"),

      bookDescription: z
        .string()
        .min(2, "bookDescription should be at least 2 characters")
        .max(5000, "bookDescription should not exceed 5000 characters"),

      bookAuthor: z
        .string()
        .min(3, "bookAuthor should be at least 3 characters")
        .max(500, "bookAuthor should not exceed 500 characters"),

      // bookCategory: z
      //   .string()
      //   .min(2, "bookCategory should be at least 2 characters")
      //   .max(80, "bookCategory should not exceed 80 characters"),

      categoryId: z.string().uuid("Invalid category ID"),

      bookCost: z.coerce
        .number({
          invalid_type_error: "bookCost must be a number",
        })
        .min(20, "bookCost should be at least 20")
        .max(10000, "bookCost should not exceed 10000"),
    })
    .passthrough(), // equivalent to Joi .unknown(true)
};

module.exports = bookValidationsSchema;
