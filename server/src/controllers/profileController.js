import User from "../models/User.js";
import { updateProfileSchema } from "../validators/profileValidator.js";
import cloudinary from "../config/cloudinary.js";

// ==========================================
// UPDATE STUDENT PROFILE
// ==========================================

export const updateProfile = async (req, res) => {
  try {
    // 1. Validate incoming data
    const validation = updateProfileSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid profile information.",
        errors: validation.error.flatten().fieldErrors,
      });
    }

    // 2. Find the authenticated student
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found.",
      });
    }

    // 3. Prevent admin accounts from using this endpoint
    if (user.accountType !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only student accounts can update student profiles.",
      });
    }

    // 4. Update only the validated fields
    const { fullName, bio, skills } = validation.data;

    if (fullName !== undefined) user.fullName = fullName;
    if (bio !== undefined) user.bio = bio;

    if (skills !== undefined) {
      // Remove duplicates and empty entries
      user.skills = [
        ...new Set(
          skills
            .map((skill) => skill.trim())
            .filter(Boolean)
            .map((skill) => skill.toLowerCase()),
        ),
      ];
    }

    // 5. Save changes
    await user.save();

    // 6. Return safe profile information
    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      data: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        matricNumber: user.matricNumber,
        faculty: user.faculty,
        department: user.department,
        academicLevel: user.academicLevel,
        profilePicture: user.profilePicture,
        bio: user.bio,
        skills: user.skills,
        verificationStatus: user.verificationStatus,
        emailVerified: user.emailVerified,
        isProvider: user.isProvider,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update profile. Please try again.",
    });
  }
};

// ==========================================
// UPLOAD PROFILE PICTURE
// ==========================================

export const uploadProfilePicture = async (req, res) => {
  let uploadedPublicId = null;

  try {
    if (req.user.accountType !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only students can upload profile pictures.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select a profile picture.",
      });
    }

    const oldPublicId = req.user.profilePicture?.publicId;

    // Upload the new picture to Cloudinary.
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "skillconnect/profile-pictures",
          resource_type: "image",
          allowed_formats: ["jpg", "jpeg", "png", "webp"],
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );

      uploadStream.end(req.file.buffer);
    });

    uploadedPublicId = uploadResult.public_id;

    // Save the new image details.
    req.user.profilePicture = {
      publicId: uploadResult.public_id,
      url: uploadResult.secure_url,
    };

    await req.user.save();

    // Delete the previous picture after successful database save.
    if (oldPublicId && oldPublicId !== uploadedPublicId) {
      try {
        await cloudinary.uploader.destroy(oldPublicId, {
          resource_type: "image",
        });
      } catch (deleteError) {
        console.error("Old profile picture cleanup failed:", deleteError);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Profile picture updated successfully.",
      data: {
        profilePicture: req.user.profilePicture,
      },
    });
  } catch (error) {
    // Clean up newly uploaded image if saving fails.
    if (uploadedPublicId) {
      try {
        await cloudinary.uploader.destroy(uploadedPublicId, {
          resource_type: "image",
        });
      } catch (cleanupError) {
        console.error("Profile picture cleanup failed:", cleanupError);
      }
    }

    console.error("Profile picture upload error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to upload profile picture. Please try again.",
    });
  }
};
