import jwt from "jsonwebtoken";
import User from "../models/User.js";

// ==========================================
// 1. AUTHENTICATE USER
// ==========================================

export const protect = async (req, res, next) => {
  try {
    const token = req.cookies?.skillconnect_token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please log in.",
      });
    }

    // Verify JWT.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Retrieve the user from MongoDB.
    const user = await User.findById(decoded.sub);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "The account associated with this session no longer exists.",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated.",
      });
    }

    // Invalidate tokens issued before a password change.
    if (user.passwordChangedAt && decoded.iat) {
      const passwordChangedAt = Math.floor(
        user.passwordChangedAt.getTime() / 1000
      );

      if (passwordChangedAt > decoded.iat) {
        return res.status(401).json({
          success: false,
          message: "Your session has expired. Please log in again.",
        });
      }
    }

    // Make authenticated user available to the next middleware/controller.
    req.user = user;

    next();
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        success: false,
        message: "Your session is invalid or has expired. Please log in again.",
      });
    }

    console.error("Authentication middleware error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to authenticate your request.",
    });
  }
};


// ==========================================
// 2. REQUIRE ADMINISTRATOR
// ==========================================

export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }

  if (req.user.accountType !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Administrator access is required.",
    });
  }

  next();
};


// ==========================================
// 3. REQUIRE VERIFIED STUDENT
// ==========================================

export const requireVerifiedStudent = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }

  if (req.user.accountType !== "student") {
    return res.status(403).json({
      success: false,
      message: "This feature is available to students only.",
    });
  }

  if (!req.user.emailVerified) {
    return res.status(403).json({
      success: false,
      code: "EMAIL_NOT_VERIFIED",
      message: "Please verify your email address first.",
    });
  }

  if (req.user.verificationStatus !== "verified") {
    return res.status(403).json({
      success: false,
      code: "STUDENT_NOT_VERIFIED",
      verificationStatus: req.user.verificationStatus,
      rejectionReason: req.user.rejectionReason || null,
      message:
        req.user.verificationStatus === "rejected"
          ? "Your student verification was rejected. Please correct your details and resubmit."
          : "Your student verification is still awaiting administrator approval.",
    });
  }

  next();
};


// ==========================================
// 4. REQUIRE SERVICE PROVIDER
// ==========================================

export const requireProvider = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }

  if (req.user.accountType !== "student") {
    return res.status(403).json({
      success: false,
      message: "This feature is available to student service providers.",
    });
  }

  if (!req.user.emailVerified) {
    return res.status(403).json({
      success: false,
      message: "Please verify your email address first.",
    });
  }

  if (req.user.verificationStatus !== "verified") {
    return res.status(403).json({
      success: false,
      message: "Your student identity must be verified first.",
    });
  }

  if (!req.user.isProvider) {
    return res.status(403).json({
      success: false,
      code: "PROVIDER_PROFILE_REQUIRED",
      message: "Please activate your service provider profile first.",
    });
  }

  next();
};