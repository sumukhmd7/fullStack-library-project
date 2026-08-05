const { rateLimit } = require("express-rate-limit");

const { RedisStore } = require("rate-limit-redis");

const redis = require("../config/redisClient");

function createRateLimiter({ windowMs, max, message }) {
  let store;

  // Only use Redis if it's connected
  if (redis.status === "ready") {
    store = new RedisStore({
      sendCommand: (...args) => redis.call(...args),
    });
    console.log("✅ Using Redis Rate Limiter");
  } else {
    console.log("⚠️ Redis unavailable. Using Memory Store");
  }

  return rateLimit({
    windowMs,
    max,
    store, // undefined => uses MemoryStore automatically

    standardHeaders: true,
    legacyHeaders: false,

    message: {
      success: false,
      message,
    },
  });
}

module.exports = createRateLimiter;
