import Service from "../models/Service.js";
import { validateRequest } from "../utils/validateRequest.js";
import {
  createServiceSchema,
  updateServiceSchema,
} from "../validators/serviceValidator.js";
import ServiceRequest from "../models/ServiceRequest.js";
import Connection from "../models/Connection.js";
import mongoose from "mongoose";

// CREATE SERVICE
export const createService = async (req, res) => {
  try {
    const validation = validateRequest(createServiceSchema, req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Please check your service details.",
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const service = await Service.create({
      ...validation.data,
      provider: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Your service has been published successfully.",
      service,
    });
  } catch (error) {
    console.error("Create service error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to create service.",
    });
  }
};

// GET ALL ACTIVE SERVICES

export const getServices = async (req, res) => {
  try {
    const { search = "", category = "", page = "1", limit = "12" } = req.query;

    const currentPage = Math.max(1, Number(page) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(limit) || 12));

    const filter = {
      status: "active",
    };

    // Category filtering
    if (category && category !== "All") {
      filter.category = category;
    }

    // Search by service title or description
    if (search.trim()) {
      const safeSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      filter.$or = [
        { title: { $regex: safeSearch, $options: "i" } },
        { description: { $regex: safeSearch, $options: "i" } },
      ];
    }

    const totalServices = await Service.countDocuments(filter);

    const services = await Service.find(filter)
      .populate(
        "provider",
        "fullName faculty department verificationStatus profilePicture bio skills",
      )
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * pageSize)
      .limit(pageSize)
      .lean();

    return res.status(200).json({
      success: true,
      services,
      pagination: {
        currentPage,
        pageSize,
        totalServices,
        totalPages: Math.ceil(totalServices / pageSize),
        hasNextPage: currentPage * pageSize < totalServices,
        hasPreviousPage: currentPage > 1,
      },
    });
  } catch (error) {
    console.error("Get services error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve services.",
    });
  }
};

// GET LOGGED-IN PROVIDER'S SERVICES
export const getMyServices = async (req, res) => {
  try {
    const services = await Service.find({ provider: req.user._id }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: services.length,
      services,
    });
  } catch (error) {
    console.error("Get my services error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve your services.",
    });
  }
};

// UPDATE SERVICE
export const updateService = async (req, res) => {
  try {
    const validation = validateRequest(updateServiceSchema, req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Please check your service details.",
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const service = await Service.findOne({
      _id: req.params.id,
      provider: req.user._id,
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found.",
      });
    }

    Object.assign(service, validation.data);
    await service.save();

    return res.status(200).json({
      success: true,
      message: "Service updated successfully.",
      service,
    });
  } catch (error) {
    console.error("Update service error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to update service.",
    });
  }
};

// DELETE SERVICE

export const deleteService = async (req, res) => {
  try {
    const service = await Service.findOne({
      _id: req.params.id,
      provider: req.user._id,
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found.",
      });
    }

    // Preserve service request and connection history.
    const hasRequests = await ServiceRequest.exists({
      service: service._id,
    });

    const hasConnections = await Connection.exists({
      service: service._id,
    });

    if (hasRequests || hasConnections) {
      return res.status(409).json({
        success: false,
        message:
          "This service has existing request or connection history. Deactivate it instead of deleting it.",
      });
    }

    await service.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Service deleted successfully.",
    });
  } catch (error) {
    console.error("Delete service error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete service.",
    });
  }
};

export const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid service ID.",
      });
    }

    const service = await Service.findOne({
      _id: id,
      status: "active",
    })
      .populate(
        "provider",
        "fullName faculty department verificationStatus profilePicture bio skills",
      )
      .lean();

    if (!service || !service.provider) {
      return res.status(404).json({
        success: false,
        message: "Service not found.",
      });
    }

    return res.status(200).json({
      success: true,
      service,
    });
  } catch (error) {
    console.error("Get service details error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve service details.",
    });
  }
};
