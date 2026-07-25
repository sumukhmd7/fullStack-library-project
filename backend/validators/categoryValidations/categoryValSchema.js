const { z } = require("zod");

const categorySchema = {
  // Add category validation
  addCategory: z
    .object({
      categoryName: z
        .string({ required_error: "categoryName is required" })
        .min(2, "categoryName should be at least 2 characters")
        .max(20, "categoryName should not exceed 20 characters"),
    })
    .passthrough(), // equivalent to Joi .unknown(true)
};

module.exports = categorySchema;
