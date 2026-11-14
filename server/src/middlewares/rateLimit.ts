import rateLimit from "express-rate-limit";

import { env } from "../config/env.js";

// The auth suite exercises register/login many times in one process, so the
// per-IP limiter is effectively disabled there to avoid cross-test 429s.
const AUTH_MAX_REQUESTS = env.NODE_ENV === "test" ? 10_000 : 10;

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: AUTH_MAX_REQUESTS,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: {
    success: false,
    message: "Too many refresh attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const viewLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const responseLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: {
    success: false,
    message: "Too many response submissions, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
