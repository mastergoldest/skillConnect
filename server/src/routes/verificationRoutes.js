
import express from "express";

import { protect } from "../middleware/authMiddleware.js";

import uploadStudentId from "../middleware/uploadMiddleware.js";

import {
  uploadStudentIdCard,
} from "../controllers/verificationController.js";

const router = express.Router();

// Upload or resubmit a student ID card.
router.post(
  "/student-id",
  protect,
  uploadStudentId.single("studentIdCard"),
  uploadStudentIdCard
);

export default router;
