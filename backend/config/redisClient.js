// config/redisClient.js
const Redis = require("ioredis");
require("dotenv").config();

const redis = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: 1, // individual commands (get/set) fail fast — this protects your controllers
  enableOfflineQueue: false, // don't queue commands while disconnected, reject immediately
  retryStrategy(times) {
    return 10000; // always retry, every 10s, forever — no giving up
  },
});

let hasLoggedError = false;

redis.on("connect", () => {
  console.log("✅ Redis connected");
  hasLoggedError = false; // reset so the next disconnect logs again
});

redis.on("error", (err) => {
  if (!hasLoggedError) {
    console.error("❌ Redis error:", err.message);
    hasLoggedError = true;
  }
});

module.exports = redis;
