
import mongoose from "mongoose";

const serviceRequestSchema = new mongoose.Schema(
  {
    // The service being requested
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },

    // Student who submitted the request
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Student offering the service
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Message explaining what the requester needs
    requestMessage: {
      type: String,
      required: [true, "Please describe what you need."],
      trim: true,
      minlength: 10,
      maxlength: 1000,
    },

    // Current request status
    status: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "declined",
        "cancelled",
        "completed",
      ],
      default: "pending",
    },

    // Optional response from the provider
    providerResponse: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    respondedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Improve request lookup performance
serviceRequestSchema.index({ requester: 1, createdAt: -1 });
serviceRequestSchema.index({ provider: 1, status: 1, createdAt: -1 });
serviceRequestSchema.index(
    { requester: 1, service: 1 },
    {
      unique: true,
      partialFilterExpression: { status: "pending" },
      name: "unique_pending_request_per_student_service",
    }
  );

const ServiceRequest = mongoose.model(
  "ServiceRequest",
  serviceRequestSchema
);

export default ServiceRequest;
