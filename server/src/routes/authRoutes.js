import express from "express";

import {
  register,
  verifyEmail,
  resendVerification,
  login,
  getMe,
  logout,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js";

import {
  authLimiter,
  passwordResetLimiter,
} from "../middleware/rateLimiter.js";


const router = express.Router();


// ==========================================
// PUBLIC AUTHENTICATION ROUTES
// ==========================================

// Register a new student.
router.post(
  "/register",
  authLimiter,
  register
);


// Verify email address.
router.post(
  "/verify-email",
  authLimiter,
  verifyEmail
);


// Resend verification email.
router.post(
  "/resend-verification",
  authLimiter,
  resendVerification
);


// Login.
router.post(
  "/login",
  authLimiter,
  login
);


// Request password reset.
router.post(
  "/forgot-password",
  passwordResetLimiter,
  forgotPassword
);


// Reset password.
router.post(
  "/reset-password",
  passwordResetLimiter,
  resetPassword
);


// ==========================================
// PROTECTED AUTHENTICATION ROUTES
// ==========================================

// Get currently authenticated user.
router.get(
  "/me",
  protect,
  getMe
);


// Logout.
router.post(
  "/logout",
  protect,
  logout
);


export default router;