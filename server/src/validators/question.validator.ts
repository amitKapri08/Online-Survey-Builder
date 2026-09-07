import { z } from "zod";

export const QUESTION_TYPES = [
  "SHORT_TEXT",
  "LONG_TEXT",
  "SINGLE_CHOICE",
  "MULTIPLE_CHOICE",
  "DROPDOWN",
  "RATING",
  "YES_NO",
  "NUMBER",
  "DATE",
] as const;

export const questionTypeSchema = z.enum(QUESTION_TYPES);

const MIN_MAX = z
  .number()
  .int("Value must be a whole number")
  .min(0, "Value must be a positive number")
  .max(1_000_000, "Value is too large");

const optionInputSchema = z.object({
  optionText: z
    .string()
    .trim()
    .min(1, "Option text is required")
    .max(500, "Option text must be at most 500 characters"),
  position: z.number().int().positive().optional(),
});

const optionInputListSchema = z.array(optionInputSchema);

function addRangeNotAcceptedIssues(
  input: {
    minValue?: number | null | undefined;
    maxValue?: number | null | undefined;
  },
  ctx: z.RefinementCtx,
): void {
  if (input.minValue != null) {
    ctx.addIssue({
      code: "custom",
      message: "This question type does not accept a minimum value",
      path: ["minValue"],
    });
  }
  if (input.maxValue != null) {
    ctx.addIssue({
      code: "custom",
      message: "This question type does not accept a maximum value",
      path: ["maxValue"],
    });
  }
}

function validateQuestionRequirements(
  input: {
    questionType?: (typeof QUESTION_TYPES)[number] | undefined;
    minValue?: number | null | undefined;
    maxValue?: number | null | undefined;
    options?: { optionText: string; position?: number | undefined }[] | undefined;
  },
  ctx: z.RefinementCtx,
): void {
  const options = input.options ?? [];

  if (
    input.minValue != null &&
    input.maxValue != null &&
    input.maxValue <= input.minValue
  ) {
    ctx.addIssue({
      code: "custom",
      message: "maxValue must be greater than minValue",
      path: ["maxValue"],
    });
  }

  switch (input.questionType) {
    case "RATING":
      if (input.minValue === undefined || input.maxValue === undefined) {
        ctx.addIssue({
          code: "custom",
          message: "Rating questions require both a minimum and maximum value",
          path: ["minValue"],
        });
      }
      break;
    case "SINGLE_CHOICE":
    case "MULTIPLE_CHOICE":
    case "DROPDOWN":
      if (options.length < 2) {
        ctx.addIssue({
          code: "custom",
          message: "Choice questions require at least 2 options",
          path: ["options"],
        });
      }
      addRangeNotAcceptedIssues(input, ctx);
      break;
    case "NUMBER":
      break;
    case undefined:
      break;
    default:
      if (options.length > 0) {
        ctx.addIssue({
          code: "custom",
          message: "This question type does not accept options",
          path: ["options"],
        });
      }
      addRangeNotAcceptedIssues(input, ctx);
      break;
  }
}

export const createQuestionSchema = z
  .object({
    questionText: z
      .string()
      .trim()
      .min(1, "Question text is required")
      .max(1000, "Question text must be at most 1000 characters"),
    questionType: questionTypeSchema,
    isRequired: z.boolean().optional(),
    minValue: MIN_MAX.optional(),
    maxValue: MIN_MAX.optional(),
    options: optionInputListSchema.optional(),
  })
  .superRefine(validateQuestionRequirements);

export const updateQuestionSchema = z
  .object({
    questionText: z
      .string()
      .trim()
      .min(1, "Question text is required")
      .max(1000, "Question text must be at most 1000 characters")
      .optional(),
    questionType: questionTypeSchema.optional(),
    isRequired: z.boolean().optional(),
    minValue: MIN_MAX.nullable().optional(),
    maxValue: MIN_MAX.nullable().optional(),
    options: optionInputListSchema.optional(),
  })
  .superRefine(validateQuestionRequirements)
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export const reorderQuestionsSchema = z.object({
  questionIds: z
    .array(z.string().uuid("Invalid question id"))
    .min(2, "At least two questions are required to reorder"),
});

export const createOptionSchema = z.object({
  optionText: z
    .string()
    .trim()
    .min(1, "Option text is required")
    .max(500, "Option text must be at most 500 characters"),
  position: z.number().int().positive().optional(),
});

export const updateOptionSchema = z
  .object({
    optionText: z
      .string()
      .trim()
      .min(1, "Option text is required")
      .max(500, "Option text must be at most 500 characters")
      .optional(),
    position: z.number().int().positive().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>;
export type ReorderQuestionsInput = z.infer<typeof reorderQuestionsSchema>;
export type CreateOptionInput = z.infer<typeof createOptionSchema>;
export type UpdateOptionInput = z.infer<typeof updateOptionSchema>;