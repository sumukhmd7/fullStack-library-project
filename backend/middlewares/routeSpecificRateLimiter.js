const createRateLimiter = require("./rateLimiter");

// Global limiter (all routes)
const globalLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: "Too many requests. Please try again later.",
});

// Login
const loginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many login attempts. Try again after 15 minutes.",
});

// Signup
const signupLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: "Too many signup attempts.",
});

// Forgot Password
const forgotPasswordLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: "Too many password reset requests.",
});

// Upload APIs
// const uploadLimiter = createRateLimiter({
//   windowMs: 15 * 60 * 1000,
//   max: 20,
//   message: "Upload limit exceeded.",
// });

module.exports = {
  globalLimiter,
  loginLimiter,
  signupLimiter,
  forgotPasswordLimiter,
  //   uploadLimiter,
};
