import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
  windowMs: 0.5 * 60 * 1000, // 0.5  0r 30sec to be able to test it
  max: 3, // Limit to 3 requests
  message: "Too many authentication attempts, please try again later.",
});

export const limiter = rateLimit({
  windowMs: 0.5 * 60 * 1000, // 0.5  0r 30sec to be able to test it
  max: 5, // Limit to 5 requests
  message: "Too many requests, please try again later.",
});