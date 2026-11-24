
import express from "express";

import { protect } from "../middleware/authMiddleware.js";
import profileUpload from "../middleware/profileUpload.js";

import {
  updateProfile,
  uploadProfilePicture,
} from "../controllers/profileController.js";

const router = express.Router();

// All profile routes require authentication.
router.use(protect);

// Update personal information.
router.patch("/", updateProfile);

// Upload or replace profile picture.
router.post(
  "/picture",
  profileUpload.single("profilePicture"),
  uploadProfilePicture
);

export default router;
