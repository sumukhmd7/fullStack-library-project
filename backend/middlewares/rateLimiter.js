const { rateLimit } = require("express-rate-limit");

const { RedisStore } = require("rate-limit-redis");

const redis = require("../config/redisClient");

function createRateLimiter({ windowMs, max, message }) {
  // Memory limiter is cheap and safe to build immediately.
  const memoryLimiter = rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message },
  });

  // The Redis-backed limiter is NOT built here. Building it early was the
  // actual bug: RedisStore's constructor immediately tries to load a Lua
  // script into Redis (for atomic increments), which fails if Redis isn't
  // connected yet. So we defer construction until we KNOW Redis is ready.
  let redisLimiter = null;

  const buildRedisLimiter = () => {
    if (redisLimiter) return; // already built, don't rebuild on every 'ready' event
    redisLimiter = rateLimit({
      windowMs,
      max,
      store: new RedisStore({
        sendCommand: (...args) => redis.call(...args),
      }),
      standardHeaders: true,
      legacyHeaders: false,
      message: { success: false, message },
    });
  };

  // If Redis happens to already be ready by the time this runs, build it now.
  if (redis.status === "ready") {
    buildRedisLimiter();
  }

  // Otherwise, build it the moment Redis actually becomes ready — this
  // guarantees the Lua script load succeeds, since the connection is
  // confirmed open at that point.
  redis.on("ready", buildRedisLimiter);

  // If Redis drops later, stop using the (now-stale) Redis limiter and
  // fall back to memory until it reconnects and rebuilds.
  redis.on("end", () => {
    redisLimiter = null;
  });

  return (req, res, next) => {
    if (redis.status === "ready" && redisLimiter) {
      return redisLimiter(req, res, next);
    }
    return memoryLimiter(req, res, next);
  };
}

module.exports = createRateLimiter;
