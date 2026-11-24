import Service from "../models/Service.js";
import ServiceRequest from "../models/ServiceRequest.js";
import { validateRequest } from "../utils/validateRequest.js";
import mongoose from "mongoose";
import {
  createServiceRequestSchema,
  respondToServiceRequestSchema,
} from "../validators/serviceRequestValidator.js";
import Connection from "../models/Connection.js";
// CREATE SERVICE REQUEST
export const createServiceRequest = async (req, res) => {
  try {
    // Validate request message
    const validation = validateRequest(createServiceRequestSchema, req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Please check your request details.",
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const { serviceId } = req.params;
    const requesterId = req.user._id;

    // Find an active service
    const service = await Service.findOne({
      _id: serviceId,
      status: "active",
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "This service is unavailable.",
      });
    }

    // Prevent students from requesting their own services
    if (service.provider.toString() === requesterId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot request your own service.",
      });
    }

    // Prevent duplicate pending requests
    const existingRequest = await ServiceRequest.findOne({
      service: service._id,
      requester: requesterId,
      status: "pending",
    });

    if (existingRequest) {
      return res.status(409).json({
        success: false,
        message: "You already have a pending request for this service.",
      });
    }

    // Create request using trusted backend IDs
    const serviceRequest = await ServiceRequest.create({
      service: service._id,
      requester: requesterId,
      provider: service.provider,
      requestMessage: validation.data.requestMessage,
    });

    return res.status(201).json({
      success: true,
      message: "Your service request has been submitted successfully.",
      serviceRequest,
    });
  } catch (error) {
    console.error("Create service request error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to submit your service request.",
    });
  }
};

// GET REQUESTS SUBMITTED BY THE LOGGED-IN STUDENT
export const getMyServiceRequests = async (req, res) => {
  try {
    const requests = await ServiceRequest.find({
      requester: req.user._id,
    })
      .populate("service", "title category pricingType price")
      .populate("provider", "fullName faculty department")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error("Get my service requests error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve your service requests.",
    });
  }
};

// GET REQUESTS RECEIVED BY THE LOGGED-IN PROVIDER
export const getIncomingServiceRequests = async (req, res) => {
  try {
    const requests = await ServiceRequest.find({
      provider: req.user._id,
    })
      .populate("service", "title category pricingType price")
      .populate("requester", "fullName faculty department")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error("Get incoming service requests error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve incoming requests.",
    });
  }
};

// PROVIDER ACCEPTS OR DECLINES A REQUEST
export const respondToServiceRequest = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const validation = validateRequest(
      respondToServiceRequestSchema,
      req.body
    );

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid response.",
        errors: validation.errors,
      });
    }

    const { status, providerResponse } = validation.data;
    const { requestId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid service request ID.",
      });
    }

    let updatedRequest = null;

    await session.withTransaction(async () => {
      // Find a pending request belonging to this provider.
      const request = await ServiceRequest.findOne({
        _id: requestId,
        provider: req.user._id,
        status: "pending",
      }).session(session);

      if (!request) return;

      // Update the request.
      request.status = status;
      request.providerResponse = providerResponse || "";
      request.respondedAt = new Date();

      await request.save({ session });

      // Create a connection ONLY when the provider accepts.
      if (status === "accepted") {
        await Connection.create(
          [
            {
              serviceRequest: request._id,
              service: request.service,
              requester: request.requester,
              provider: request.provider,
            },
          ],
          { session }
        );
      }

      updatedRequest = request;
    });

    if (!updatedRequest) {
      return res.status(404).json({
        success: false,
        message: "Pending service request not found.",
      });
    }

    await updatedRequest.populate([
      {
        path: "service",
        select: "title category pricingType price",
      },
      {
        path: "requester",
        select: "fullName faculty department",
      },
    ]);

    return res.status(200).json({
      success: true,
      message:
        status === "accepted"
          ? "Request accepted successfully. A connection has been created."
          : "Request declined successfully.",
      request: updatedRequest,
    });
  } catch (error) {
    console.error("Respond to service request error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to process your response.",
    });
  } finally {
    await session.endSession();
  }
};
// GET MY CONNECTIONS
export const getMyConnections = async (req, res) => {
  try {
    const connections = await Connection.find({
      $or: [
        { requester: req.user._id },
        { provider: req.user._id },
      ],
    })
      .populate("service", "title category pricingType price")
      .populate("requester", "fullName faculty department")
      .populate("provider", "fullName faculty department")
      .populate(
        "serviceRequest",
        "requestMessage status providerResponse createdAt"
      )
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      count: connections.length,
      connections,
    });
  } catch (error) {
    console.error("Get my connections error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch your connections.",
    });
  }
};

// GET ONE CONNECTION
export const getConnectionById = async (req, res) => {
  try {
    const { connectionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(connectionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid connection ID.",
      });
    }

    const connection = await Connection.findOne({
      _id: connectionId,
      $or: [
        { requester: req.user._id },
        { provider: req.user._id },
      ],
    })
      .populate("service")
      .populate("requester", "fullName")
      .populate("provider", "fullName")
      .populate("serviceRequest");

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: "Connection not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: connection,
    });
  } catch (error) {
    console.error("Get connection error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve connection.",
    });
  }
};