
import { z } from "zod";

// STUDENT SUBMITS A SERVICE REQUEST
export const createServiceRequestSchema = z.object({
  requestMessage: z
    .string()
    .trim()
    .min(10, "Please provide at least 10 characters.")
    .max(1000, "Your request cannot exceed 1000 characters."),
});

// PROVIDER ACCEPTS OR DECLINES A REQUEST
export const respondToServiceRequestSchema = z.object({
  status: z.enum(["accepted", "declined"], {
    error: "Please select a valid response.",
  }),

  providerResponse: z
    .string()
    .trim()
    .max(500, "Your response cannot exceed 500 characters.")
    .optional()
    .default(""),
});
