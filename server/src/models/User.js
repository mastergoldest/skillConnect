import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // ==========================================
    // 1. BASIC ACCOUNT INFORMATION
    // ==========================================

    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },

    // ==========================================
    // 2. ACCOUNT TYPE
    // ==========================================

    accountType: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
      required: true,
    },

    // ==========================================
    // 3. EMAIL VERIFICATION
    // ==========================================

    emailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerificationTokenHash: {
      type: String,
      select: false,
    },

    emailVerificationExpires: {
      type: Date,
      select: false,
    },

    // ==========================================
    // 4. PASSWORD RESET
    // ==========================================

    passwordResetTokenHash: {
      type: String,
      select: false,
    },

    passwordResetExpires: {
      type: Date,
      select: false,
    },

    passwordChangedAt: {
      type: Date,
    },

    // ==========================================
    // 5. STUDENT IDENTIFICATION
    // ==========================================

    matricNumber: {
      type: String,
      uppercase: true,
      trim: true,
      sparse: true,
      unique: true,
    },

    faculty: {
      type: String,
      trim: true,
    },

    department: {
      type: String,
      trim: true,
    },

    academicLevel: {
      type: String,
      enum: ["100", "200", "300", "400", "500", "600"],
    },

    // ==========================================
    // 6. STUDENT IDENTITY VERIFICATION
    // ==========================================

    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },

    studentIdCard: {
      publicId: String,
      format: String,
      uploadedAt: Date,
    },

    rejectionReason: {
      type: String,
      trim: true,
    },

    verifiedAt: Date,

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // ==========================================
    // 7. SERVICE PROVIDER FUNCTIONALITY
    // ==========================================

    isProvider: {
      type: Boolean,
      default: false,
    },
    // ==========================================
// 8. STUDENT PROFILE INFORMATION
// ==========================================

profilePicture: {
  publicId: {
    type: String,
    default: null,
  },
  url: {
    type: String,
    default: null,
  },
},

bio: {
  type: String,
  trim: true,
  maxlength: 500,
  default: "",
},

skills: {
  type: [String],
  default: [],
},

    // ==========================================
    // 9. GENERAL ACCOUNT STATUS
    // ==========================================

    isActive: {
      type: Boolean,
      default: true,
    },

    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// ==========================================
// 10. STUDENT INFORMATION VALIDATION
// ==========================================

userSchema.pre("validate", function () {
  if (this.accountType === "student") {
    if (!this.matricNumber) {
      this.invalidate("matricNumber", "Matric number is required.");
    }

    if (!this.faculty) {
      this.invalidate("faculty", "Faculty is required.");
    }

    if (!this.department) {
      this.invalidate("department", "Department is required.");
    }

    if (!this.academicLevel) {
      this.invalidate("academicLevel", "Academic level is required.");
    }
  }
});

// ==========================================
// 11. CREATE USER MODEL
// ==========================================

const User = mongoose.model("User", userSchema);

export default User;