
import cloudinary from "../config/cloudinary.js";
import User from "../models/User.js";

// ==========================================
// UPLOAD STUDENT ID CARD
// ==========================================

export const uploadStudentIdCard = async (req, res) => {
  let uploadedPublicId = null;

  try {
    // 1. Confirm that the account belongs to a student.
    if (req.user.accountType !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only student accounts can submit student ID cards.",
      });
    }

    // 2. Email verification must be completed first.
    if (!req.user.emailVerified) {
      return res.status(403).json({
        success: false,
        code: "EMAIL_NOT_VERIFIED",
        message: "Please verify your email address before submitting your student ID card.",
      });
    }

    // 3. Prevent already verified students from replacing their ID.
    if (req.user.verificationStatus === "verified") {
      return res.status(409).json({
        success: false,
        message: "Your student identity has already been verified.",
      });
    }

    // 4. Ensure an image was uploaded.
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select your student ID card image.",
      });
    }

    const oldPublicId = req.user.studentIdCard?.publicId;

    // 5. Upload the image to Cloudinary.
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "skillconnect/student-ids",
          resource_type: "image",
          type: "authenticated",
          allowed_formats: ["jpg", "jpeg", "png", "webp"],
        },
        (error, result) => {
          if (error) {
            return reject(error);
          }

          resolve(result);
        }
      );

      uploadStream.end(req.file.buffer);
    });

    uploadedPublicId = uploadResult.public_id;

    // 6. Save the private image reference in MongoDB.
    req.user.studentIdCard = {
      publicId: uploadResult.public_id,
      format: uploadResult.format,
      uploadedAt: new Date(),
    };

    req.user.verificationStatus = "pending";
    req.user.rejectionReason = undefined;
    req.user.verifiedAt = undefined;
    req.user.verifiedBy = undefined;

    await req.user.save();

    // 7. Delete the previous image only after the new image is saved.
    if (oldPublicId && oldPublicId !== uploadedPublicId) {
      try {
        await cloudinary.uploader.destroy(oldPublicId, {
          resource_type: "image",
          type: "authenticated",
        });
      } catch (deleteError) {
        console.error("Previous student ID cleanup failed:", deleteError);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Student ID card uploaded successfully. Your submission is awaiting administrator review.",
      data: {
        verificationStatus: req.user.verificationStatus,
        uploadedAt: req.user.studentIdCard.uploadedAt,
        hasStudentIdCard: true,
      },
    });
  } catch (error) {
    // Remove the new Cloudinary image if the database save fails.
    if (uploadedPublicId) {
      try {
        await cloudinary.uploader.destroy(uploadedPublicId, {
          resource_type: "image",
          type: "authenticated",
        });
      } catch (cleanupError) {
        console.error("Cloudinary cleanup failed:", cleanupError);
      }
    }

    console.error("Student ID upload error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to upload your student ID card. Please try again.",
    });
  }
};
