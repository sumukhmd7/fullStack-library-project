const { z } = require("zod");

// Password regex rules
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least 1 uppercase letter")
  .regex(
    /[a-z].*[a-z].*[a-z]/,
    "Password must contain at least 3 lowercase letters",
  )
  .regex(/[0-9]/, "Password must contain at least 1 number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least 1 special character")
  .regex(/^\S+$/, "Password should not contain whitespace")
  .regex(/^[\x00-\x7F]+$/, "Password must contain only Latin characters");

const userValSchema = {
  // Signup validation
  signupUser: z
    .object({
      userName: z
        .string()
        .min(3, "userName should be at least 3 characters")
        .max(20, "userName should be at most 20 characters"),

      userPhone: z.coerce
        .number()
        .min(1000000000, "userPhone must be 10 digits")
        .max(9999999999, "userPhone must be 10 digits"),

      userEmail: z.string().email("Invalid email format"),

      userPassword: passwordSchema,

      userGender: z.string(),

      userAddress: z
        .string()
        .min(5, "userAddress should be at least 5 characters")
        .max(75, "userAddress should be at most 75 characters"),
    })
    .passthrough(),

  // Login validation
  userLogin: z
    .object({
      userEmail: z.string().email("Invalid email format"),
      userPassword: z.string(),
    })
    .passthrough(),

  // Reset password
  resetPassword: z
    .object({
      newPassword: passwordSchema,
      confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }),

  // Set new password
  setNewPassword: z
    .object({
      oldPassword: z.string(),
      newPassword: passwordSchema,
      confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }),
};

module.exports = userValSchema;
