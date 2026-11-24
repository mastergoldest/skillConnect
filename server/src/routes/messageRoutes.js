
import express from "express";
import { protect, requireVerifiedStudent } from "../middleware/authMiddleware.js";

import {
  getConnectionMessages,
  sendConnectionMessage,
} from "../controllers/messageController.js";

const router = express.Router();

// All messaging routes require authentication and student verification.
router.use(protect);
router.use(requireVerifiedStudent);

// Get conversation messages
router.get("/:connectionId", getConnectionMessages);

// Send a message
router.post("/:connectionId", sendConnectionMessage);

export default router;
