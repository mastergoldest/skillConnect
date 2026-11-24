import rateLimit from "express-rate-limit";

// ==========================================
// GENERAL AUTHENTICATION RATE LIMITER
// ==========================================

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  // Maximum 20 requests within 15 minutes.
  limit: 20,

  standardHeaders: "draft-8",
  legacyHeaders: false,

  message: {
    success: false,
    message:
      "Too many authentication requests. Please try again after 15 minutes.",
  },
});


// ==========================================
// STRICTER PASSWORD RESET RATE LIMITER
// ==========================================

export const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  limit: 5,

  standardHeaders: "draft-8",
  legacyHeaders: false,

  message: {
    success: false,
    message:
      "Too many password reset attempts. Please try again later.",
  },
});