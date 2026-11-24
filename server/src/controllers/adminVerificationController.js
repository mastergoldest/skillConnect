
import mongoose from "mongoose";
import cloudinary from "../config/cloudinary.js";
import User from "../models/User.js";

// ==========================================
// 1. GET STUDENTS AWAITING VERIFICATION
// ==========================================

export const getPendingVerifications = async (req, res) => {
  try {
    const students = await User.find({
      accountType: "student",
      verificationStatus: "pending",
      "studentIdCard.publicId": { $exists: true, $ne: null },
    })
      .select(
        "fullName email matricNumber faculty department academicLevel verificationStatus studentIdCard.uploadedAt createdAt"
      )
      .sort({ "studentIdCard.uploadedAt": 1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: students.length,
      data: students.map((student) => ({
        id: student._id,
        fullName: student.fullName,
        email: student.email,
        matricNumber: student.matricNumber,
        faculty: student.faculty,
        department: student.department,
        academicLevel: student.academicLevel,
        verificationStatus: student.verificationStatus,
        uploadedAt: student.studentIdCard?.uploadedAt,
        createdAt: student.createdAt,
      })),
    });
  } catch (error) {
    console.error("Get pending verifications error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve pending student verifications.",
    });
  }
};


// ==========================================
// 2. GET SECURE STUDENT ID CARD PREVIEW
// ==========================================

export const getStudentIdCardPreview = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!mongoose.isValidObjectId(studentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID.",
      });
    }

    const student = await User.findOne({
      _id: studentId,
      accountType: "student",
      verificationStatus: "pending",
      "studentIdCard.publicId": { $exists: true, $ne: null },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Pending student verification or ID card not found.",
      });
    }

    const publicId = student.studentIdCard.publicId;

    let format = student.studentIdCard.format;

    // Support ID cards uploaded before format was added to the schema.
    if (!format) {
      const asset = await cloudinary.api.resource(publicId, {
        resource_type: "image",
        type: "authenticated",
      });

      format = asset.format;

      student.studentIdCard.format = format;
      await student.save();
    }

    // Generate a temporary authenticated image URL.
    const expiresAt = Math.floor(Date.now() / 1000) + 300;

    const imageUrl = cloudinary.utils.private_download_url(
      publicId,
      format,
      {
        resource_type: "image",
        type: "authenticated",
        expires_at: expiresAt,
        attachment: false,
      }
    );

    return res.status(200).json({
      success: true,
      data: {
        imageUrl,
        expiresAt,
      },
    });
  } catch (error) {
    console.error("Student ID preview error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve the student ID card.",
    });
  }
};

// APPROVE STUDENT VERIFICATION
export const approveStudentVerification = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!mongoose.isValidObjectId(studentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID.",
      });
    }

    const student = await User.findOne({
      _id: studentId,
      accountType: "student",
      verificationStatus: "pending",
      "studentIdCard.publicId": { $exists: true, $ne: null },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Pending student verification not found.",
      });
    }

    student.verificationStatus = "verified";
    student.rejectionReason = undefined;
    student.verifiedAt = new Date();
    student.verifiedBy = req.user._id;

    await student.save();

    return res.status(200).json({
      success: true,
      message: "Student verification approved successfully.",
    });
  } catch (error) {
    console.error("Approve student verification error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to approve student verification.",
    });
  }
};

// REJECT STUDENT VERIFICATION
export const rejectStudentVerification = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { reason } = req.body;

    if (!mongoose.isValidObjectId(studentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID.",
      });
    }

    if (
      typeof reason !== "string" ||
      reason.trim().length < 10 ||
      reason.trim().length > 500
    ) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason must be between 10 and 500 characters.",
      });
    }

    const student = await User.findOne({
      _id: studentId,
      accountType: "student",
      verificationStatus: "pending",
      "studentIdCard.publicId": { $exists: true, $ne: null },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Pending student verification not found.",
      });
    }

    student.verificationStatus = "rejected";
    student.rejectionReason = reason.trim();
    student.verifiedAt = undefined;
    student.verifiedBy = undefined;

    await student.save();

    return res.status(200).json({
      success: true,
      message: "Student verification rejected successfully.",
    });
  } catch (error) {
    console.error("Reject student verification error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to reject student verification.",
    });
  }
};