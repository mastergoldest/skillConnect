
import express from "express";

import {
  protect,
  requireVerifiedStudent,
} from "../middleware/authMiddleware.js";
import {
  createServiceRequest,
  getMyServiceRequests,
  getIncomingServiceRequests,
  respondToServiceRequest,
  getMyConnections,
  getConnectionById,
} from "../controllers/serviceRequestController.js";

const router = express.Router();

// All request routes require authentication
router.use(protect);
router.use(requireVerifiedStudent);

// Requests submitted by the logged-in student
router.get("/my-requests", getMyServiceRequests);

// Requests received by the logged-in provider
router.get("/incoming", getIncomingServiceRequests);

// Submit a request for an existing service
router.post("/:serviceId", createServiceRequest);

// Provider accepts or declines a request
router.patch("/:requestId/respond", respondToServiceRequest);
router.get("/my-connections", getMyConnections);
router.get("/connections/:connectionId", getConnectionById);

export default router;
