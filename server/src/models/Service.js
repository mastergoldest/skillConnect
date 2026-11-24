
import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: [true, "Service title is required."],
      trim: true,
      minlength: 3,
      maxlength: 100,
    },

    description: {
      type: String,
      required: [true, "Service description is required."],
      trim: true,
      minlength: 20,
      maxlength: 2000,
    },

    category: {
      type: String,
      required: true,
      trim: true,
      enum: [
        "Technology",
        "Graphics & Design",
        "Writing & Translation",
        "Education & Tutoring",
        "Business",
        "Photography & Video",
        "Home & Lifestyle",
        "Other",
      ],
    },

    pricingType: {
      type: String,
      enum: ["fixed", "hourly", "negotiable"],
      default: "negotiable",
    },

    price: {
      type: Number,
      min: 0,
      default: null,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

const Service = mongoose.model("Service", serviceSchema);

export default Service;
