import { z } from "zod";

// ==========================================
// REUSABLE VALIDATION RULES
// ==========================================

const emailSchema = z
  .string()
  .trim()
  .email("Please provide a valid email address.")
  .transform((value) => value.toLowerCase());

const passwordSchema = z
  .string()
  .min(8, "Password must contain at least 8 characters.")
  .max(128, "Password cannot exceed 128 characters.")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
  .regex(/[0-9]/, "Password must contain at least one number.");

const matricSchema = z
  .string()
  .trim()
  .min(3, "Please enter a valid matric number.")
  .max(30, "Matric number is too long.")
  .transform((value) => value.toUpperCase());

// ==========================================
// 1. STUDENT REGISTRATION
// ==========================================

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(3, "Full name must contain at least 3 characters.")
      .max(100, "Full name is too long."),

    email: emailSchema,

    password: passwordSchema,

    confirmPassword: z.string(),

    matricNumber: matricSchema,

    faculty: z
      .string()
      .trim()
      .min(2, "Faculty is required.")
      .max(100),

    department: z
      .string()
      .trim()
      .min(2, "Department is required.")
      .max(100),

    academicLevel: z.enum([
      "100",
      "200",
      "300",
      "400",
      "500",
      "600",
    ]),
  })
  .refine(
    (data) => data.password === data.confirmPassword,
    {
      message: "Passwords do not match.",
      path: ["confirmPassword"],
    }
  );

// ==========================================
// 2. LOGIN
// ==========================================

export const loginSchema = z.object({
  email: emailSchema,

  password: z
    .string()
    .min(1, "Password is required."),
});

// ==========================================
// 3. FORGOT PASSWORD
// ==========================================

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

// ==========================================
// 4. RESET PASSWORD
// ==========================================

export const resetPasswordSchema = z
  .object({
    token: z
      .string()
      .min(20, "Invalid password reset token."),

    password: passwordSchema,

    confirmPassword: z.string(),
  })
  .refine(
    (data) => data.password === data.confirmPassword,
    {
      message: "Passwords do not match.",
      path: ["confirmPassword"],
    }
  );

// ==========================================
// 5. RESEND EMAIL VERIFICATION
// ==========================================

export const resendVerificationSchema = z.object({
  email: emailSchema,
});

// ==========================================
// 6. EMAIL VERIFICATION TOKEN
// ==========================================

export const verifyEmailSchema = z.object({
  token: z
    .string()
    .min(20, "Invalid verification token."),
});