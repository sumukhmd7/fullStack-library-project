const { z } = require("zod");

const reviewValidationSchema = {
  addReview: z
    .object({
      review: z
        .string()
        .min(3, "review should be at least 3 characters")
        .max(20, "review should not exceed 20 characters"),

      rating: z.coerce
        .number({
          invalid_type_error: "rating must be a number",
        })
        .min(1, "rating should be at least 1")
        .max(5, "rating should not exceed 5"),
    })
    .passthrough(), // equivalent to Joi .unknown(true)
};

module.exports = reviewValidationSchema;
