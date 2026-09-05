import { z } from "zod";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const createSurveySchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Title must be at most 200 characters"),
  description: z.string().trim().max(2000, "Description must be at most 2000 characters").optional(),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .max(100, "Slug must be at most 100 characters")
    .regex(slugRegex, "Slug must contain only lowercase letters, numbers, and hyphens")
    .optional(),
  isAnonymous: z.boolean().optional(),
  allowMultipleResponses: z.boolean().optional(),
});

export const updateSurveySchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().max(2000).optional(),
    slug: z
      .string()
      .trim()
      .min(1)
      .max(100)
      .regex(slugRegex, "Slug must contain only lowercase letters, numbers, and hyphens")
      .optional(),
    status: z.enum(["DRAFT", "PUBLISHED", "CLOSED"]).optional(),
    isAnonymous: z.boolean().optional(),
    allowMultipleResponses: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export const surveyQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  status: z.enum(["DRAFT", "PUBLISHED", "CLOSED"]).optional(),
  search: z.string().trim().max(100).optional(),
});

export type CreateSurveyInput = z.infer<typeof createSurveySchema>;
export type UpdateSurveyInput = z.infer<typeof updateSurveySchema>;
export type SurveyQueryInput = z.infer<typeof surveyQuerySchema>;
