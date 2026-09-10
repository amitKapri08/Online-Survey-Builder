import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  QUESTION_TYPE_OPTIONS,
  isChoiceType,
  isRangeType,
} from "./questionTypes";
import type { QuestionType } from "@/types/survey";
import type {
  CreateQuestionPayload,
  UpdateQuestionPayload,
} from "@/types/survey";

const questionFormSchema = z
  .object({
    questionText: z
      .string()
      .trim()
      .min(1, "Question text is required")
      .max(1000, "Question must be at most 1000 characters"),
    questionType: z.enum([
      "SHORT_TEXT",
      "LONG_TEXT",
      "SINGLE_CHOICE",
      "MULTIPLE_CHOICE",
      "DROPDOWN",
      "RATING",
      "YES_NO",
      "NUMBER",
      "DATE",
    ]),
    isRequired: z.boolean(),
    minValue: z.string(),
    maxValue: z.string(),
    options: z.array(
      z.object({
        id: z.string().optional(),
        optionText: z
          .string()
          .trim()
          .max(500, "Option must be at most 500 characters")
          .optional(),
      }),
    ),
  })
  .superRefine((data, ctx) => {
    switch (data.questionType) {
      case "RATING": {
        const min = Number(data.minValue);
        const max = Number(data.maxValue);
        if (data.minValue === "" || Number.isNaN(min)) {
          ctx.addIssue({
            code: "custom",
            message: "Minimum value is required",
            path: ["minValue"],
          });
        }
        if (data.maxValue === "" || Number.isNaN(max)) {
          ctx.addIssue({
            code: "custom",
            message: "Maximum value is required",
            path: ["maxValue"],
          });
        }
        if (
          data.minValue !== "" &&
          data.maxValue !== "" &&
          !Number.isNaN(min) &&
          !Number.isNaN(max) &&
          max <= min
        ) {
          ctx.addIssue({
            code: "custom",
            message: "Maximum must be greater than minimum",
            path: ["maxValue"],
          });
        }
        break;
      }
      case "NUMBER": {
        const min = data.minValue === "" ? undefined : Number(data.minValue);
        const max = data.maxValue === "" ? undefined : Number(data.maxValue);
        if (min !== undefined && Number.isNaN(min)) {
          ctx.addIssue({
            code: "custom",
            message: "Minimum must be a number",
            path: ["minValue"],
          });
        }
        if (max !== undefined && Number.isNaN(max)) {
          ctx.addIssue({
            code: "custom",
            message: "Maximum must be a number",
            path: ["maxValue"],
          });
        }
        if (
          min !== undefined &&
          max !== undefined &&
          !Number.isNaN(min) &&
          !Number.isNaN(max) &&
          max <= min
        ) {
          ctx.addIssue({
            code: "custom",
            message: "Maximum must be greater than minimum",
            path: ["maxValue"],
          });
        }
        break;
      }
      default:
        break;
    }

    const isChoiceForm =
      data.questionType === "SINGLE_CHOICE" ||
      data.questionType === "MULTIPLE_CHOICE" ||
      data.questionType === "DROPDOWN";

    if (isChoiceForm) {
      data.options.forEach((option, index) => {
        if (!option.optionText || option.optionText.trim().length === 0) {
          ctx.addIssue({
            code: "custom",
            message: "Option text is required",
            path: ["options", index, "optionText"],
          });
        }
      });

      if (data.options.length < 2) {
        ctx.addIssue({
          code: "custom",
          message: "Choice questions require at least 2 options",
          path: ["options"],
        });
      }
    }
  });

type QuestionFormValues = z.infer<typeof questionFormSchema>;

export interface QuestionEditorInitialValues {
  questionText: string;
  questionType: QuestionType;
  isRequired: boolean;
  minValue: number | null;
  maxValue: number | null;
  options: { id?: string; optionText: string }[];
}

interface QuestionEditorProps {
  initialValues?: QuestionEditorInitialValues;
  isCreating?: boolean;
  isPending?: boolean;
  onCancel: () => void;
  onSubmit: (
    payload: CreateQuestionPayload | UpdateQuestionPayload,
  ) => void | Promise<void>;
}

function buildPayload(
  values: QuestionFormValues,
  isCreating: boolean,
): CreateQuestionPayload | UpdateQuestionPayload {
  const isChoice = isChoiceType(values.questionType);
  const isRange = isRangeType(values.questionType);

  const base = {
    questionText: values.questionText,
    questionType: values.questionType,
    isRequired: values.isRequired,
  };

  const range: {
    minValue?: number | null;
    maxValue?: number | null;
  } = {};
  if (isRange) {
    range.minValue =
      values.minValue === "" ? null : Number(values.minValue);
    range.maxValue =
      values.maxValue === "" ? null : Number(values.maxValue);
  } else if (!isCreating) {
    range.minValue = null;
    range.maxValue = null;
  }

  const options = isChoice
    ? {
        options: values.options.map((option, index) => ({
          id: option.id,
          optionText: option.optionText ?? "",
          position: index + 1,
        })),
      }
    : {};

  return { ...base, ...range, ...options };
}

function QuestionEditor({
  initialValues,
  isCreating = false,
  isPending,
  onCancel,
  onSubmit,
}: QuestionEditorProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<QuestionFormValues>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: {
      questionText: initialValues?.questionText ?? "",
      questionType: initialValues?.questionType ?? "SHORT_TEXT",
      isRequired: initialValues?.isRequired ?? false,
      minValue:
        initialValues?.minValue != null ? String(initialValues.minValue) : "",
      maxValue:
        initialValues?.maxValue != null ? String(initialValues.maxValue) : "",
      options:
        initialValues && initialValues.options.length > 0
          ? initialValues.options.map((option) => ({
              id: option.id,
              optionText: option.optionText,
            }))
          : [{ optionText: "" }, { optionText: "" }],
    },
  });

  const optionsField = useFieldArray({
    control,
    name: "options",
  });

  const watchedType = useWatch({ control, name: "questionType" });
  const watchedMin = useWatch({ control, name: "minValue" });
  const watchedMax = useWatch({ control, name: "maxValue" });
  const minRequired = watchedType === "RATING";
  const maxRequired = watchedType === "RATING";

  const handleFormSubmit = handleSubmit(
    async (values) => {
      let payload: CreateQuestionPayload | UpdateQuestionPayload;
      try {
        payload = buildPayload(values, isCreating);
      } catch {
        toast.error("Failed to build question");
        return;
      }
      await onSubmit(payload);
    },
    () => {
      toast.error("Please fix the highlighted fields");
    },
  );

  const isSaving = isSubmitting || isPending;

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="question-text">
          Question <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="question-text"
          placeholder="e.g. How satisfied are you with our support?"
          rows={2}
          {...register("questionText")}
          aria-invalid={!!errors.questionText}
        />
        {errors.questionText && (
          <p className="text-xs text-destructive">
            {errors.questionText.message}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 sm:items-center">
        <div className="space-y-1.5">
          <Label htmlFor="question-type" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Question type
          </Label>
          <Select
            id="question-type"
            placeholder="Choose a type"
            options={QUESTION_TYPE_OPTIONS}
            {...register("questionType")}
            aria-invalid={!!errors.questionType}
          />
          {errors.questionType && (
            <p className="text-xs text-destructive">
              {errors.questionType.message}
            </p>
          )}
        </div>

        <div className="flex items-center justify-start sm:justify-end sm:pt-5">
          <label className="inline-flex cursor-pointer items-center gap-3">
            <span className="text-sm font-medium text-foreground">
              Required
            </span>
            <div className="relative inline-flex items-center">
              <input
                type="checkbox"
                id="is-required-toggle"
                className="peer sr-only"
                {...register("isRequired")}
              />
              <div className="h-5 w-9 rounded-full bg-muted ring-1 ring-border/80 transition-colors peer-checked:bg-brand-600 peer-checked:ring-brand-600 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500/50 after:absolute after:top-[2px] after:left-[2px] after:size-4 after:rounded-full after:bg-white after:shadow-xs after:transition-all after:content-[''] peer-checked:after:translate-x-4 dark:bg-zinc-800" />
            </div>
          </label>
        </div>
      </div>

      {isRangeType(watchedType) && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="min-value">
              Minimum value
              {minRequired && <span className="text-destructive"> *</span>}
            </Label>
            <Input
              id="min-value"
              type="number"
              min={0}
              inputMode="numeric"
              placeholder={watchedType === "RATING" ? "1" : "0"}
              {...register("minValue")}
              aria-invalid={!!errors.minValue}
            />
            {errors.minValue && (
              <p className="text-xs text-destructive">
                {errors.minValue.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="max-value">
              Maximum value
              {maxRequired && <span className="text-destructive"> *</span>}
            </Label>
            <Input
              id="max-value"
              type="number"
              min={0}
              inputMode="numeric"
              placeholder={watchedType === "RATING" ? "5" : "100"}
              {...register("maxValue")}
              aria-invalid={!!errors.maxValue}
            />
            {errors.maxValue && (
              <p className="text-xs text-destructive">
                {errors.maxValue.message}
              </p>
            )}
          </div>
          {watchedType === "RATING" && (
            <p className="text-xs text-muted-foreground sm:col-span-2">
              Respondents pick a value between{" "}
              <span className="font-medium text-foreground">
                {watchedMin || "min"}
              </span>{" "}
              and{" "}
              <span className="font-medium text-foreground">
                {watchedMax || "max"}
              </span>
              .
            </p>
          )}
        </div>
      )}

      {isChoiceType(watchedType) && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">
              Options{" "}
              <span className="text-muted-foreground">(at least 2)</span>
            </Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => optionsField.append({ optionText: "" })}
            >
              <Plus data-icon="inline-start" />
              Add option
            </Button>
          </div>
          <div className="space-y-2">
            {optionsField.fields.map((fieldItem, index) => (
              <div
                key={fieldItem.id}
                className="group flex items-center gap-2 rounded-xl border border-border/80 bg-muted/20 px-3 py-1 shadow-2xs transition-all focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 hover:bg-muted/40"
              >
                <GripVertical className="size-4 text-muted-foreground/40 shrink-0" />
                <input
                  type="text"
                  placeholder={`Option ${index + 1}`}
                  aria-label={`Option ${index + 1}`}
                  {...register(`options.${index}.optionText`)}
                  className="w-full border-0 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 outline-none"
                  aria-invalid={!!errors.options?.[index]?.optionText}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => optionsField.remove(index)}
                  aria-label={`Remove option ${index + 1}`}
                  disabled={optionsField.fields.length <= 2}
                  className="rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:opacity-30"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            ))}
          </div>
          {errors.options && (
            <p className="text-xs text-destructive">
              {errors.options.message}
            </p>
          )}
        </div>
      )}

      <Separator />

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="brand"
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : isCreating ? "Add question" : "Save question"}
        </Button>
      </div>
    </form>
  );
}

export { QuestionEditor };