import express from "express";
import {
  protect,
  requireVerifiedStudent,
} from "../middleware/authMiddleware.js";

import {
  createService,
  getServices,
  getMyServices,
  updateService,
  deleteService,
  getServiceById,
} from "../controllers/serviceController.js";

const router = express.Router();

// PUBLIC ROUTES
// PUBLIC ROUTES
router.get("/", getServices);

// PROTECTED ROUTES
router.use(protect);

router.get("/my-services", getMyServices);
router.post("/", requireVerifiedStudent, createService);
router.patch("/:id", requireVerifiedStudent, updateService);
router.delete("/:id", requireVerifiedStudent, deleteService);
router.get("/:id", getServiceById);
export default router;
