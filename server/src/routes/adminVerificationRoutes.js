import express from "express";

import { protect, requireAdmin } from "../middleware/authMiddleware.js";
import {
  getPendingVerifications,
  getStudentIdCardPreview,
  approveStudentVerification,
  rejectStudentVerification,
} from "../controllers/adminVerificationController.js";

const router = express.Router();

// All routes require an authenticated administrator.
router.use(protect, requireAdmin);

// Get students awaiting verification.
router.get("/pending", getPendingVerifications);

// Securely view an individual student's ID card.
router.get("/:studentId/student-id", getStudentIdCardPreview);
router.post("/:studentId/approve", approveStudentVerification);

router.post("/:studentId/reject", rejectStudentVerification);

export default router;
