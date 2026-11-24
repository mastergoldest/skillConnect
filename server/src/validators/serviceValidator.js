
import { z } from "zod";

const serviceFields = {
  title: z
    .string()
    .trim()
    .min(3, "Service title must be at least 3 characters.")
    .max(100, "Service title cannot exceed 100 characters."),

  description: z
    .string()
    .trim()
    .min(20, "Description must be at least 20 characters.")
    .max(2000, "Description cannot exceed 2000 characters."),

  category: z.enum([
    "Technology",
    "Graphics & Design",
    "Writing & Translation",
    "Education & Tutoring",
    "Business",
    "Photography & Video",
    "Home & Lifestyle",
    "Other",
  ]),

  pricingType: z.enum(["fixed", "hourly", "negotiable"]),

  price: z.number().min(0).nullable().optional(),
};

export const createServiceSchema = z
  .object(serviceFields)
  .superRefine((data, ctx) => {
    if (
      (data.pricingType === "fixed" ||
        data.pricingType === "hourly") &&
      (data.price === undefined || data.price === null)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["price"],
        message: "Please provide a price for fixed or hourly services.",
      });
    }

    if (
      data.pricingType === "negotiable" &&
      data.price !== undefined &&
      data.price !== null
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["price"],
        message: "Negotiable services should not have a fixed price.",
      });
    }
  });

// Update validation: every field is optional. i will check when inspecting

export const updateServiceSchema = z
  .object({
    title: serviceFields.title.optional(),
    description: serviceFields.description.optional(),
    category: serviceFields.category.optional(),
    pricingType: serviceFields.pricingType.optional(),
    price: serviceFields.price,

    // Allow the owner to activate or deactivate a service.
    status: z.enum(["active", "inactive"]).optional(),
  })
  .superRefine((data, ctx) => {
    // Validate pricing when both pricing fields are supplied.
    if (
      (data.pricingType === "fixed" ||
        data.pricingType === "hourly") &&
      (data.price === undefined || data.price === null)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["price"],
        message: "Please provide a price for fixed or hourly services.",
      });
    }

    if (
      data.pricingType === "negotiable" &&
      data.price !== undefined &&
      data.price !== null
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["price"],
        message: "Negotiable services should not have a fixed price.",
      });
    }
  });
