import { z } from "zod";

export const submitResponseSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.string().uuid(),
        value: z.union([z.string(), z.number(), z.array(z.string())]),
      }),
    )
    .max(500, "Too many answers"),
  submitAnonymously: z.boolean().optional().default(false),
});

export const responseQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  order: z.enum(["newest", "oldest"]).default("newest"),
});

export type SubmitResponseInput = z.infer<typeof submitResponseSchema>;
export type ResponseQueryInput = z.infer<typeof responseQuerySchema>;
