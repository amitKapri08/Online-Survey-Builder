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
});

export type SubmitResponseInput = z.infer<typeof submitResponseSchema>;