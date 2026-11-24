import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/User.js";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  resendVerificationSchema,
  verifyEmailSchema,
} from "../validators/authValidator.js";

import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "../services/emailService.js";

// ==========================================
// SHARED HELPER FUNCTIONS
// ==========================================

const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

const generateToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

const createAuthCookie = (res, token) => {
  res.cookie("skillconnect_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000,
    path: "/",
  });
};

const clearAuthCookie = (res) => {
  res.clearCookie("skillconnect_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
};

const getSafeUser = (user) => ({
  id: user._id,
  fullName: user.fullName,
  email: user.email,

  // Account information
  accountType: user.accountType,
  emailVerified: user.emailVerified,
  isProvider: user.isProvider,
  isActive: user.isActive,

  // Academic information
  matricNumber: user.matricNumber,
  faculty: user.faculty,
  department: user.department,
  academicLevel: user.academicLevel,

  // Student verification
  verificationStatus: user.verificationStatus,
  rejectionReason: user.rejectionReason,
  hasStudentIdCard: Boolean(user.studentIdCard?.publicId),

  // Public profile information
  profilePicture: user.profilePicture,
  bio: user.bio,
  skills: user.skills,

  createdAt: user.createdAt,
});

const validateRequest = (schema, data) => {
  return schema.safeParse(data);
};

// ==========================================
// 1. REGISTER STUDENT
// ==========================================

export const register = async (req, res) => {
  try {
    console.log("========== REGISTRATION DEBUG ==========");

    console.log("REQUEST BODY:", req.body);

    console.log("VALIDATOR FIELDS:", Object.keys(registerSchema.shape));

    const validation = registerSchema.safeParse(req.body);

    console.log("VALIDATION RESULT:", validation.success);

    if (!validation.success) {
      console.log("VALIDATION ERRORS:", validation.error.issues);
    }

    console.log("========================================");

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Please check your registration details.",
        errors: validation.error.issues,
      });
    }

    const {
      fullName,
      email,
      password,
      matricNumber,
      faculty,
      department,
      academicLevel,
    } = validation.data;

    // Check whether the email already exists.
    const existingEmail = await User.findOne({ email });

    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    // Check whether the matric number already exists.
    const existingMatric = await User.findOne({ matricNumber });

    if (existingMatric) {
      return res.status(409).json({
        success: false,
        message: "This matriculation number is already registered.",
      });
    }

    // Hash the password before saving it.
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate an email verification token.
    const verificationToken = generateToken();

    // Save only the hashed token in the database.
    const verificationTokenHash = hashToken(verificationToken);

    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      matricNumber,
      faculty,
      department,
      academicLevel,

      // These fields are controlled by the backend.
      accountType: "student",
      verificationStatus: "pending",
      emailVerified: false,
      isProvider: false,
      isActive: true,

      emailVerificationTokenHash: verificationTokenHash,
      emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    // Send verification email.
    try {
      await sendVerificationEmail(user, verificationToken);
    } catch (emailError) {
      console.error("Verification email failed:", emailError.message);

      return res.status(503).json({
        success: false,
        message:
          "Your account was created, but the verification email could not be sent. Please request another verification email.",
      });
    }

    return res.status(201).json({
      success: true,
      message:
        "Registration successful. Please check your email to verify your account.",
      user: getSafeUser(user),
    });
  } catch (error) {
    console.error("Registration error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This email or matriculation number is already registered.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Something went wrong during registration.",
    });
  }
};

// ==========================================
// 2. VERIFY EMAIL
// ==========================================

export const verifyEmail = async (req, res) => {
  try {
    const validation = validateRequest(verifyEmailSchema, req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "A valid verification token is required.",
      });
    }

    const tokenHash = hashToken(validation.data.token);

    const user = await User.findOne({
      emailVerificationTokenHash: tokenHash,
      emailVerificationExpires: { $gt: new Date() },
    }).select("+emailVerificationTokenHash +emailVerificationExpires");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "This verification link is invalid or has expired.",
      });
    }

    user.emailVerified = true;
    user.emailVerificationTokenHash = undefined;
    user.emailVerificationExpires = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Your email has been verified successfully. You can now log in.",
    });
  } catch (error) {
    console.error("Email verification error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to verify your email at this time.",
    });
  }
};

// ==========================================
// 3. RESEND VERIFICATION EMAIL
// ==========================================

export const resendVerification = async (req, res) => {
  try {
    const validation = validateRequest(resendVerificationSchema, req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    const { email } = validation.data;

    const genericMessage =
      "If an eligible account exists, a verification email will be sent.";

    const user = await User.findOne({ email });

    if (!user || user.emailVerified) {
      return res.status(200).json({
        success: true,
        message: genericMessage,
      });
    }

    const verificationToken = generateToken();

    user.emailVerificationTokenHash = hashToken(verificationToken);
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await user.save();

    try {
      await sendVerificationEmail(user, verificationToken);
    } catch (emailError) {
      console.error("Resend verification error:", emailError.message);

      return res.status(503).json({
        success: false,
        message: "Unable to send the verification email. Try again later.",
      });
    }

    return res.status(200).json({
      success: true,
      message: genericMessage,
    });
  } catch (error) {
    console.error("Resend verification error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};

// ==========================================
// 4. LOGIN
// ==========================================

export const login = async (req, res) => {
  try {
    const validation = validateRequest(loginSchema, req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Please enter valid login details.",
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const { email, password } = validation.data;

    // Password is excluded by default in the User model.
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "This account has been deactivated.",
      });
    }

    if (!user.emailVerified) {
      return res.status(403).json({
        success: false,
        code: "EMAIL_NOT_VERIFIED",
        message: "Please verify your email before logging in.",
      });
    }

    const token = jwt.sign(
      { sub: user._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    user.lastLoginAt = new Date();
    await user.save();

    createAuthCookie(res, token);

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      user: getSafeUser(user),
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong during login.",
    });
  }
};

// ==========================================
// 5. GET LOGGED-IN USER
// ==========================================

export const getMe = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      user: getSafeUser(req.user),
    });
  } catch (error) {
    console.error("Get current user error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve your account details.",
    });
  }
};

// ==========================================
// 6. LOGOUT
// ==========================================

export const logout = async (req, res) => {
  clearAuthCookie(res);

  return res.status(200).json({
    success: true,
    message: "You have logged out successfully.",
  });
};

// ==========================================
// 7. FORGOT PASSWORD
// ==========================================

export const forgotPassword = async (req, res) => {
  try {
    const validation = validateRequest(forgotPasswordSchema, req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    const { email } = validation.data;

    const genericMessage =
      "If an account exists with this email, password reset instructions will be sent.";

    const user = await User.findOne({ email });

    if (!user || !user.isActive) {
      return res.status(200).json({
        success: true,
        message: genericMessage,
      });
    }

    const resetToken = generateToken();

    user.passwordResetTokenHash = hashToken(resetToken);
    user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);

    await user.save();

    try {
      await sendPasswordResetEmail(user, resetToken);
    } catch (emailError) {
      console.error("Password reset email error:", emailError.message);

      // Keep the response generic to prevent account discovery.
    }

    return res.status(200).json({
      success: true,
      message: genericMessage,
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to process your request at this time.",
    });
  }
};

// ==========================================
// 8. RESET PASSWORD
// ==========================================

export const resetPassword = async (req, res) => {
  try {
    const validation = validateRequest(resetPasswordSchema, req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Please check your new password details.",
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const { token, password } = validation.data;

    const tokenHash = hashToken(token);
    const user = await User.findOne({
      passwordResetTokenHash: tokenHash,
      passwordResetExpires: { $gt: new Date() },
    }).select("+password +passwordResetTokenHash +passwordResetExpires");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "This password reset link is invalid or has expired.",
      });
    }
    // Prevent users from reusing their current password.
    const isSamePassword = await bcrypt.compare(password, user.password);

    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot reuse your current password. Please choose a different password.",
      });
    }

    user.password = await bcrypt.hash(password, 12);

    user.passwordResetTokenHash = undefined;
    user.passwordResetExpires = undefined;

    // Invalidates authentication tokens issued before this change.
    user.passwordChangedAt = new Date(Date.now() + 1000);

    await user.save();

    clearAuthCookie(res);

    return res.status(200).json({
      success: true,
      message:
        "Your password has been reset successfully. Please log in with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to reset your password at this time.",
    });
  }
};
