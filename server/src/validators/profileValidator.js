
import { z } from "zod";

export const updateProfileSchema = z
  .object({
    // Students can update their display name
    fullName: z
      .string()
      .trim()
      .min(2, "Full name must contain at least 2 characters.")
      .max(100, "Full name cannot exceed 100 characters.")
      .optional(),

    // Short personal introduction
    bio: z
      .string()
      .trim()
      .max(500, "Bio cannot exceed 500 characters.")
      .optional(),

    // Skills offered by the student
    skills: z
      .array(
        z
          .string()
          .trim()
          .min(2, "Each skill must contain at least 2 characters.")
          .max(50, "Each skill cannot exceed 50 characters.")
      )
      .max(15, "You can add a maximum of 15 skills.")
      .optional(),
  })
  .strict()
  .refine(
    (data) => Object.keys(data).length > 0,
    {
      message: "Please provide at least one profile field to update.",
    }
  );
