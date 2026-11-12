import { useState } from "react";

import { useAuth } from "@/context/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type {
  QuestionType,
  SurveyAnswerInput,
  SurveyQuestion,
  SubmitResponsePayload,
} from "@/types/survey";

interface SurveyAnswerFormProps {
  questions: SurveyQuestion[];
  isAnonymous?: boolean;
  isSubmitting: boolean;
  onSubmit: (payload: SubmitResponsePayload) => void | Promise<void>;
}

function isChoiceType(type: QuestionType): boolean {
  return (
    type === "SINGLE_CHOICE" ||
    type === "MULTIPLE_CHOICE" ||
    type === "DROPDOWN"
  );
}

function maxLengthFor(type: QuestionType): number | undefined {
  if (type === "SHORT_TEXT") return 300;
  if (type === "LONG_TEXT") return 5000;
  return undefined;
}

function SurveyAnswerForm({
  questions,
  isAnonymous = false,
  isSubmitting,
  onSubmit,
}: SurveyAnswerFormProps) {
  const { user } = useAuth();
  const [values, setValues] = useState<Record<string, string | string[]>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitAnonymously, setSubmitAnonymously] = useState(false);

  const setValue = (questionId: string, value: string | string[]) => {
    setValues((current) => ({ ...current, [questionId]: value }));
    setErrors((current) => {
      if (!current[questionId]) return current;
      const next = { ...current };
      delete next[questionId];
      return next;
    });
  };

  const toggleMultiple = (questionId: string, optionId: string) => {
    const current = questionValues(questionId);
    const next = current.includes(optionId)
      ? current.filter((id) => id !== optionId)
      : [...current, optionId];
    setValue(questionId, next);
  };

  const questionValues = (questionId: string): string[] => {
    const current = values[questionId];
    return Array.isArray(current) ? current : [];
  };

  const validateQuestion = (question: SurveyQuestion): string | null => {
    const raw = values[question.id];
    const type = question.questionType;

    if (type === "MULTIPLE_CHOICE") {
      const selected = Array.isArray(raw) ? raw : [];
      if (question.isRequired && selected.length === 0) {
        return "This question is required";
      }
      return null;
    }

    if (type === "NUMBER") {
      if (question.isRequired && (raw === undefined || raw === "")) {
        return "This question is required";
      }
      if (raw === undefined || raw === "") return null;
      const parsed = Number(raw);
      if (Number.isNaN(parsed)) return "Enter a valid number";
      if (
        question.minValue != null &&
        (parsed < question.minValue || !Number.isInteger(parsed))
      ) {
        return `Enter a whole number of at least ${question.minValue}`;
      }
      if (question.maxValue != null && parsed > question.maxValue) {
        return `Enter a number no greater than ${question.maxValue}`;
      }
      return null;
    }

    if (question.isRequired && (raw === undefined || raw === "")) {
      return "This question is required";
    }
    return null;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const nextErrors: Record<string, string> = {};
    for (const question of questions) {
      const error = validateQuestion(question);
      if (error) nextErrors[question.id] = error;
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const answers: SurveyAnswerInput[] = [];
    for (const question of questions) {
      const raw = values[question.id];
      if (raw === undefined || raw === "") continue;
      if (
        question.questionType === "NUMBER" ||
        question.questionType === "RATING"
      ) {
        answers.push({
          questionId: question.id,
          value: Number(raw),
        });
        continue;
      }
      if (
        question.questionType === "YES_NO" ||
        !isChoiceType(question.questionType)
      ) {
        answers.push({ questionId: question.id, value: String(raw) });
        continue;
      }
      if (question.questionType === "MULTIPLE_CHOICE") {
        const selected = Array.isArray(raw) ? raw : [];
        if (selected.length === 0) continue;
        answers.push({ questionId: question.id, value: selected });
        continue;
      }
      answers.push({ questionId: question.id, value: String(raw) });
    }

    await onSubmit({
      answers,
      submitAnonymously: isAnonymous
        ? user
          ? submitAnonymously
          : true
        : false,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {questions.map((question, index) => {
        const type = question.questionType;
        const error = errors[question.id];
        const current = values[question.id];
        const selected = Array.isArray(current) ? current : [];
        const ratingMin = type === "RATING" ? (question.minValue ?? 1) : 1;
        const ratingMax = type === "RATING" ? (question.maxValue ?? 5) : 5;

        return (
          <div key={question.id} className="space-y-2.5">
            <div className="flex items-baseline gap-2">
              <span className="font-medium text-foreground">
                {index + 1}. {question.questionText}
              </span>
              {question.isRequired && (
                <span
                  className="text-sm text-destructive"
                  aria-label="Required"
                >
                  *
                </span>
              )}
            </div>

            {type === "SHORT_TEXT" && (
              <Input
                value={typeof current === "string" ? current : ""}
                onChange={(e) => setValue(question.id, e.target.value)}
                maxLength={maxLengthFor(type)}
                placeholder="Your answer"
                aria-invalid={!!error}
                disabled={isSubmitting}
              />
            )}

            {type === "LONG_TEXT" && (
              <Textarea
                value={typeof current === "string" ? current : ""}
                onChange={(e) => setValue(question.id, e.target.value)}
                rows={4}
                maxLength={maxLengthFor(type)}
                placeholder="Your answer"
                aria-invalid={!!error}
                disabled={isSubmitting}
              />
            )}

            {type === "NUMBER" && (
              <Input
                type="number"
                value={typeof current === "string" ? current : ""}
                onChange={(e) => setValue(question.id, e.target.value)}
                min={question.minValue ?? undefined}
                max={question.maxValue ?? undefined}
                inputMode="numeric"
                placeholder={question.maxValue != null ? "0-100" : "0"}
                aria-invalid={!!error}
                disabled={isSubmitting}
              />
            )}

            {type === "DATE" && (
              <Input
                type="date"
                value={typeof current === "string" ? current : ""}
                onChange={(e) => setValue(question.id, e.target.value)}
                aria-invalid={!!error}
                disabled={isSubmitting}
              />
            )}

            {type === "RATING" && (
              <div className="flex flex-wrap gap-2">
                {Array.from(
                  { length: ratingMax - ratingMin + 1 },
                  (_, offset) => ratingMin + offset,
                ).map((value) => {
                  const isSelected = current === String(value);
                  return (
                    <label
                      key={value}
                      className={cn(
                        "flex size-9 cursor-pointer items-center justify-center rounded-full border text-sm font-medium transition-colors",
                        isSelected
                          ? "border-foreground bg-foreground text-background"
                          : "border-input hover:bg-muted",
                      )}
                    >
                      <input
                        type="radio"
                        name={`rating-${question.id}`}
                        value={value}
                        checked={isSelected}
                        onChange={() => setValue(question.id, String(value))}
                        className="sr-only"
                        disabled={isSubmitting}
                      />
                      {value}
                    </label>
                  );
                })}
              </div>
            )}

            {type === "YES_NO" && (
              <div className="flex gap-3">
                {["yes", "no"].map((option) => (
                  <label
                    key={option}
                    className="flex cursor-pointer items-center gap-2 text-sm font-medium text-foreground"
                  >
                    <input
                      type="radio"
                      name={`yesno-${question.id}`}
                      value={option}
                      checked={current === option}
                      onChange={() => setValue(question.id, option)}
                      className="size-4 rounded border-input"
                      disabled={isSubmitting}
                    />
                    {option === "yes" ? "Yes" : "No"}
                  </label>
                ))}
              </div>
            )}

            {(type === "SINGLE_CHOICE" || type === "DROPDOWN") &&
              (type === "DROPDOWN" ? (
                <Select
                  options={question.options.map((option) => ({
                    value: option.id,
                    label: option.optionText,
                  }))}
                  placeholder="Choose an option"
                  value={
                    typeof current === "string" && current !== "" ? current : ""
                  }
                  onChange={(e) => setValue(question.id, e.target.value)}
                  aria-invalid={!!error}
                  disabled={isSubmitting}
                />
              ) : (
                <div className="space-y-2">
                  {question.options.map((option) => (
                    <label
                      key={option.id}
                      className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-foreground"
                    >
                      <input
                        type="radio"
                        name={`single-${question.id}`}
                        value={option.id}
                        checked={current === option.id}
                        onChange={() => setValue(question.id, option.id)}
                        className="size-4 rounded border-input"
                        disabled={isSubmitting}
                      />
                      {option.optionText}
                    </label>
                  ))}
                </div>
              ))}

            {type === "MULTIPLE_CHOICE" && (
              <div className="space-y-2">
                {question.options.map((option) => (
                  <label
                    key={option.id}
                    className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-foreground"
                  >
                    <input
                      type="checkbox"
                      checked={selected.includes(option.id)}
                      onChange={() => toggleMultiple(question.id, option.id)}
                      className="size-4 rounded border-input"
                      disabled={isSubmitting}
                    />
                    {option.optionText}
                  </label>
                ))}
              </div>
            )}

            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
        );
      })}

      {isAnonymous && user && (
        <div className="rounded-lg border border-border bg-muted/50 p-3.5 space-y-1">
          <label className="flex cursor-pointer items-start gap-2.5 text-sm font-medium text-foreground">
            <input
              type="checkbox"
              checked={submitAnonymously}
              onChange={(e) => setSubmitAnonymously(e.target.checked)}
              className="mt-0.5 size-4 rounded border-input text-primary focus:ring-primary"
              disabled={isSubmitting}
            />
            <div>
              <span>Submit anonymously</span>
              <p className="text-xs font-normal text-muted-foreground">
                {submitAnonymously
                  ? "Your name and email will not be shared with the survey creator."
                  : `Submitting as ${user.name} (${user.email}).`}
              </p>
            </div>
          </label>
        </div>
      )}

      <div className="border-t pt-4">
        <Button type="submit" variant="brand" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit response"}
        </Button>
      </div>
    </form>
  );
}

export { SurveyAnswerForm };
