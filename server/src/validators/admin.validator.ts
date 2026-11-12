import { z } from "zod";

export const adminQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  status: z.enum(["DRAFT", "PUBLISHED", "CLOSED"]).optional(),
  search: z.string().trim().max(100).optional(),
});

export type AdminQueryInput = z.infer<typeof adminQuerySchema>;