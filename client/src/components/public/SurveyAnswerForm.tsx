import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  Check,
  CornerDownLeft,
  Layers,
  Rows3,
} from "lucide-react";

import { useAuth } from "@/context/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { validateNumberAnswer } from "@/utils/numberValidation";
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

type ViewMode = "stepped" | "all";

function SurveyAnswerForm({
  questions,
  isAnonymous = false,
  isSubmitting,
  onSubmit,
}: SurveyAnswerFormProps) {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>("stepped");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [values, setValues] = useState<Record<string, string | string[]>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitAnonymously, setSubmitAnonymously] = useState(false);

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex] || questions[0];

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

  const validateQuestion = useCallback(
    (question: SurveyQuestion): string | null => {
      const raw = values[question.id];
      const type = question.questionType;

      if (type === "MULTIPLE_CHOICE") {
        const selected = Array.isArray(raw) ? raw : [];
        if (question.isRequired && selected.length === 0) {
          return "Please select at least one option to continue";
        }
        return null;
      }

      if (type === "NUMBER") {
        if (question.isRequired && (raw === undefined || raw === "")) {
          return "This question is required";
        }
        if (raw === undefined || raw === "") return null;
        const parsed = Number(raw);
        const validation = validateNumberAnswer(
          parsed,
          question.minValue,
          question.maxValue,
        );
        if (!validation.valid) {
          switch (validation.code) {
            case "INVALID_NUMBER":
              return "Enter a valid number";
            case "NOT_AN_INTEGER":
              return "Enter a whole number";
            case "LESS_THAN_MIN":
              return `Enter a number of at least ${question.minValue}`;
            case "GREATER_THAN_MAX":
              return `Enter a number no greater than ${question.maxValue}`;
          }
        }
        return null;
      }

      if (question.isRequired && (raw === undefined || raw === "")) {
        return "This question is required";
      }
      return null;
    },
    [values],
  );

  // Calculate answered count for progress bar
  const answeredCount = questions.reduce((count, q) => {
    const val = values[q.id];
    if (val === undefined || val === "") return count;
    if (Array.isArray(val) && val.length === 0) return count;
    return count + 1;
  }, 0);

  const progressPercent =
    totalQuestions > 0
      ? Math.min(100, Math.round((answeredCount / totalQuestions) * 100))
      : 100;

  const buildPayloadAndSubmit = useCallback(async () => {
    const answers: SurveyAnswerInput[] = [];
    for (const q of questions) {
      const raw = values[q.id];
      if (raw === undefined || raw === "") continue;
      if (q.questionType === "NUMBER" || q.questionType === "RATING") {
        answers.push({
          questionId: q.id,
          value: Number(raw),
        });
        continue;
      }
      if (q.questionType === "YES_NO" || !isChoiceType(q.questionType)) {
        answers.push({ questionId: q.id, value: String(raw) });
        continue;
      }
      if (q.questionType === "MULTIPLE_CHOICE") {
        const selected = Array.isArray(raw) ? raw : [];
        if (selected.length === 0) continue;
        answers.push({ questionId: q.id, value: selected });
        continue;
      }
      answers.push({ questionId: q.id, value: String(raw) });
    }

    await onSubmit({
      answers,
      submitAnonymously: isAnonymous
        ? user
          ? submitAnonymously
          : true
        : false,
    });
  }, [questions, values, isAnonymous, user, submitAnonymously, onSubmit]);

  const handleNextOrSubmit = useCallback(async () => {
    if (!currentQuestion) return;

    const error = validateQuestion(currentQuestion);
    if (error) {
      setErrors((prev) => ({ ...prev, [currentQuestion.id]: error }));
      return;
    }

    // If on the last question, submit the full payload
    if (currentIndex === totalQuestions - 1) {
      // Validate all required questions
      const nextErrors: Record<string, string> = {};
      for (const q of questions) {
        const qError = validateQuestion(q);
        if (qError) nextErrors[q.id] = qError;
      }

      if (Object.keys(nextErrors).length > 0) {
        setErrors(nextErrors);
        const firstErrorIndex = questions.findIndex((q) => nextErrors[q.id]);
        if (firstErrorIndex !== -1) {
          setCurrentIndex(firstErrorIndex);
        }
        return;
      }

      await buildPayloadAndSubmit();
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [
    currentQuestion,
    currentIndex,
    totalQuestions,
    questions,
    validateQuestion,
    buildPayloadAndSubmit,
  ]);

  const handleFullSubmit = async () => {
    const nextErrors: Record<string, string> = {};
    for (const q of questions) {
      const qError = validateQuestion(q);
      if (qError) nextErrors[q.id] = qError;
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      const firstErrorId = questions.find((q) => nextErrors[q.id])?.id;
      if (firstErrorId) {
        const el = document.getElementById(`q-${firstErrorId}`);
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    await buildPayloadAndSubmit();
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Keyboard shortcut: Press Enter to continue in stepped mode (except in textarea)
  useEffect(() => {
    if (viewMode !== "stepped") return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "Enter" &&
        !e.shiftKey &&
        (e.target as HTMLElement)?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        void handleNextOrSubmit();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNextOrSubmit, viewMode]);

  if (!currentQuestion && questions.length === 0) return null;

  const renderQuestionControls = (q: SurveyQuestion, isFocused = false) => {
    const val = values[q.id];
    const selected = Array.isArray(val) ? val : [];
    const error = errors[q.id];

    const ratingMin = q.questionType === "RATING" ? (q.minValue ?? 1) : 1;
    const ratingMax = q.questionType === "RATING" ? (q.maxValue ?? 5) : 5;

    return (
      <div className="mt-4">
        {/* SHORT_TEXT */}
        {q.questionType === "SHORT_TEXT" && (
          <Input
            value={typeof val === "string" ? val : ""}
            onChange={(e) => setValue(q.id, e.target.value)}
            maxLength={maxLengthFor(q.questionType)}
            placeholder="Type your answer here..."
            aria-invalid={!!error}
            disabled={isSubmitting}
            className="h-12 rounded-xl text-base px-4 bg-muted/20 focus:bg-background transition-colors"
            autoFocus={isFocused}
          />
        )}

        {/* LONG_TEXT */}
        {q.questionType === "LONG_TEXT" && (
          <Textarea
            value={typeof val === "string" ? val : ""}
            onChange={(e) => setValue(q.id, e.target.value)}
            rows={4}
            maxLength={maxLengthFor(q.questionType)}
            placeholder="Type your detailed answer here..."
            aria-invalid={!!error}
            disabled={isSubmitting}
            className="rounded-xl text-base p-4 bg-muted/20 focus:bg-background transition-colors"
            autoFocus={isFocused}
          />
        )}

        {/* NUMBER */}
        {q.questionType === "NUMBER" && (
          <Input
            type="number"
            step="1"
            value={typeof val === "string" ? val : ""}
            onChange={(e) => setValue(q.id, e.target.value)}
            min={q.minValue ?? undefined}
            max={q.maxValue ?? undefined}
            inputMode="numeric"
            placeholder={
              q.maxValue != null
                ? `${q.minValue ?? 0} - ${q.maxValue}`
                : "Enter a number"
            }
            aria-invalid={!!error}
            disabled={isSubmitting}
            className="h-12 rounded-xl text-base px-4 bg-muted/20 focus:bg-background transition-colors max-w-xs"
            autoFocus={isFocused}
          />
        )}

        {/* DATE */}
        {q.questionType === "DATE" && (
          <Input
            type="date"
            value={typeof val === "string" ? val : ""}
            onChange={(e) => setValue(q.id, e.target.value)}
            aria-invalid={!!error}
            disabled={isSubmitting}
            className="h-12 rounded-xl text-base px-4 bg-muted/20 focus:bg-background transition-colors max-w-xs"
            autoFocus={isFocused}
          />
        )}

        {/* RATING / NPS */}
        {q.questionType === "RATING" && (
          <div className="space-y-3">
            <div className="flex flex-wrap overflow-hidden rounded-xl border border-border/80 bg-muted/30 p-1 shadow-2xs divide-x divide-border/60 sm:flex-nowrap">
              {Array.from(
                { length: ratingMax - ratingMin + 1 },
                (_, offset) => ratingMin + offset,
              ).map((num) => {
                const isSelected = val === String(num);
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setValue(q.id, String(num))}
                    disabled={isSubmitting}
                    className={cn(
                      "flex flex-1 min-w-[36px] items-center justify-center py-2.5 text-sm font-semibold transition-all cursor-pointer first:rounded-l-lg last:rounded-r-lg",
                      isSelected
                        ? "bg-foreground text-background shadow-xs font-bold ring-2 ring-foreground scale-105 z-10"
                        : "hover:bg-muted text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground px-1">
              <span>Not likely at all ({ratingMin})</span>
              <span>Extremely likely ({ratingMax})</span>
            </div>
          </div>
        )}

        {/* YES_NO */}
        {q.questionType === "YES_NO" && (
          <div className="grid grid-cols-2 gap-3 max-w-sm">
            {["yes", "no"].map((opt) => {
              const isSelected = val === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setValue(q.id, opt)}
                  disabled={isSubmitting}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-xl border p-4 text-base font-semibold shadow-2xs transition-all cursor-pointer",
                    isSelected
                      ? "border-brand-600 bg-brand-50/30 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300 ring-2 ring-brand-500/20"
                      : "border-border/80 bg-card hover:border-border hover:bg-muted/40 text-foreground",
                  )}
                >
                  {opt === "yes" ? "Yes" : "No"}
                </button>
              );
            })}
          </div>
        )}

        {/* SINGLE CHOICE */}
        {q.questionType === "SINGLE_CHOICE" && (
          <div className="space-y-2.5">
            {q.options.map((opt, idx) => {
              const isSelected = val === opt.id;
              const letter = String.fromCharCode(65 + idx);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setValue(q.id, opt.id)}
                  disabled={isSubmitting}
                  className={cn(
                    "group flex w-full items-center justify-between rounded-xl border p-3.5 text-left text-sm font-medium shadow-2xs transition-all cursor-pointer",
                    isSelected
                      ? "border-brand-600 bg-brand-50/20 text-brand-950 ring-2 ring-brand-500/20 dark:bg-brand-950/30 dark:text-brand-200"
                      : "border-border/80 bg-card hover:border-brand-500/30 hover:bg-muted/30 text-foreground",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "flex size-6 shrink-0 items-center justify-center rounded-md border text-xs font-semibold transition-colors",
                        isSelected
                          ? "border-brand-600 bg-brand-600 text-white"
                          : "border-border bg-muted text-muted-foreground group-hover:border-border/80",
                      )}
                    >
                      {letter}
                    </span>
                    <span>{opt.optionText}</span>
                  </div>
                  <div
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                      isSelected
                        ? "border-brand-600 bg-brand-600 text-white"
                        : "border-muted-foreground/30",
                    )}
                  >
                    {isSelected && <Check className="size-3" />}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* MULTIPLE CHOICE */}
        {q.questionType === "MULTIPLE_CHOICE" && (
          <div className="space-y-2.5">
            <p className="text-xs text-muted-foreground pb-0.5">
              Select all options that apply:
            </p>
            {q.options.map((opt, idx) => {
              const isSelected = selected.includes(opt.id);
              const letter = String.fromCharCode(65 + idx);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => toggleMultiple(q.id, opt.id)}
                  disabled={isSubmitting}
                  className={cn(
                    "group flex w-full items-center justify-between rounded-xl border p-3.5 text-left text-sm font-medium shadow-2xs transition-all cursor-pointer",
                    isSelected
                      ? "border-brand-600 bg-brand-50/20 text-brand-950 ring-2 ring-brand-500/20 dark:bg-brand-950/30 dark:text-brand-200"
                      : "border-border/80 bg-card hover:border-brand-500/30 hover:bg-muted/30 text-foreground",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "flex size-6 shrink-0 items-center justify-center rounded-md border text-xs font-semibold transition-colors",
                        isSelected
                          ? "border-brand-600 bg-brand-600 text-white"
                          : "border-border bg-muted text-muted-foreground group-hover:border-border/80",
                      )}
                    >
                      {letter}
                    </span>
                    <span>{opt.optionText}</span>
                  </div>
                  <div
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors",
                      isSelected
                        ? "border-brand-600 bg-brand-600 text-white"
                        : "border-muted-foreground/30",
                    )}
                  >
                    {isSelected && <Check className="size-3.5" />}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* DROPDOWN */}
        {q.questionType === "DROPDOWN" && (
          <div className="max-w-sm">
            <Select
              options={q.options.map((opt) => ({
                value: opt.id,
                label: opt.optionText,
              }))}
              placeholder="Choose an option..."
              value={typeof val === "string" && val !== "" ? val : ""}
              onChange={(e) => setValue(q.id, e.target.value)}
              aria-invalid={!!error}
              disabled={isSubmitting}
            />
          </div>
        )}

        {/* Error message */}
        {error && (
          <p className="mt-2 text-xs font-medium text-rose-600 dark:text-rose-400">
            {error}
          </p>
        )}
      </div>
    );
  };

  const isLastQuestion = currentIndex === totalQuestions - 1;

  return (
    <div className="w-full space-y-6">
      {/* Top Bar: Progress & Viewer Preference Toggle */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div className="text-xs font-medium text-muted-foreground">
            {answeredCount} of {totalQuestions} answered ({progressPercent}%)
          </div>

          {/* View Mode Toggle Pill */}
          <div className="inline-flex rounded-xl bg-muted/60 p-1 border border-border/60 text-xs">
            <button
              type="button"
              onClick={() => setViewMode("stepped")}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer",
                viewMode === "stepped"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Layers className="size-3.5" />
              <span>Step by step</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("all")}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer",
                viewMode === "all"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Rows3 className="size-3.5" />
              <span>All in one</span>
            </button>
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/80">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-500 transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Mode 1: Step-by-Step Viewer */}
      {viewMode === "stepped" && currentQuestion && (
        <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-xl ring-1 ring-black/[0.04] sm:p-10 dark:ring-white/[0.06]">
          {/* Question Header */}
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                Question {currentIndex + 1} of {totalQuestions}
              </span>
            </div>
            <div className="flex items-baseline gap-2 pt-1">
              <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                {currentQuestion.questionText}
              </h2>
              {currentQuestion.isRequired && (
                <span className="text-sm font-semibold text-rose-500" title="Required">
                  *
                </span>
              )}
            </div>
          </div>

          {/* Controls */}
          {renderQuestionControls(currentQuestion, true)}

          {/* Anonymity Switch */}
          {isAnonymous && isLastQuestion && (
            <div className="mt-8 flex items-center justify-between rounded-xl border border-border/80 bg-muted/20 p-4">
              <div className="pr-4">
                <span className="text-sm font-semibold text-foreground">
                  Responding Anonymously
                </span>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {submitAnonymously || !user
                    ? "Your identity and email will not be shared with the survey creator."
                    : `Submitting as ${user.name} (${user.email}).`}
                </p>
              </div>

              {user ? (
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={submitAnonymously}
                    onChange={(e) => setSubmitAnonymously(e.target.checked)}
                    className="peer sr-only"
                    disabled={isSubmitting}
                  />
                  <div className="h-5 w-9 rounded-full bg-muted ring-1 ring-border/80 transition-colors peer-checked:bg-brand-600 peer-checked:ring-brand-600 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500/50 after:absolute after:top-[2px] after:left-[2px] after:size-4 after:rounded-full after:bg-white after:shadow-xs after:transition-all after:content-[''] peer-checked:after:translate-x-4 dark:bg-zinc-800" />
                </label>
              ) : (
                <span className="shrink-0 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  Anonymous
                </span>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 flex items-center justify-between border-t border-border/60 pt-5">
            <Button
              type="button"
              variant="ghost"
              onClick={handlePrev}
              disabled={currentIndex === 0 || isSubmitting}
              className="gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground disabled:opacity-30"
            >
              <ArrowLeft className="size-3.5" />
              <span>Back</span>
            </Button>

            <Button
              type="button"
              variant="brand"
              onClick={() => void handleNextOrSubmit()}
              disabled={isSubmitting}
              className="gap-2 px-5 font-semibold shadow-xs"
            >
              <span>
                {isSubmitting
                  ? "Submitting..."
                  : isLastQuestion
                    ? "Submit response"
                    : "Continue"}
              </span>
              {!isLastQuestion && (
                <span className="hidden items-center gap-1 text-[11px] opacity-80 sm:inline-flex">
                  <CornerDownLeft className="size-3" /> press Enter
                </span>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Mode 2: All-in-One Questions Viewer */}
      {viewMode === "all" && (
        <div className="space-y-6">
          {questions.map((q, idx) => (
            <div
              key={q.id}
              id={`q-${q.id}`}
              className={cn(
                "rounded-2xl border bg-card p-6 shadow-sm transition-all sm:p-7",
                errors[q.id]
                  ? "border-rose-400 ring-2 ring-rose-400/20"
                  : "border-border/80",
              )}
            >
              <div className="flex items-start gap-3">
                <span className="flex size-7 items-center justify-center rounded-lg bg-brand-500/10 text-xs font-bold text-brand-600 dark:text-brand-400 shrink-0 mt-0.5">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-base font-bold text-foreground sm:text-lg">
                      {q.questionText}
                    </h3>
                    {q.isRequired && (
                      <span className="text-sm font-semibold text-rose-500" title="Required">
                        *
                      </span>
                    )}
                  </div>
                  {renderQuestionControls(q)}
                </div>
              </div>
            </div>
          ))}

          {/* Anonymity Switch */}
          {isAnonymous && (
            <div className="flex items-center justify-between rounded-2xl border border-border/80 bg-card p-5 shadow-xs">
              <div className="pr-4">
                <span className="text-sm font-semibold text-foreground">
                  Responding Anonymously
                </span>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {submitAnonymously || !user
                    ? "Your identity and email will not be shared with the survey creator."
                    : `Submitting as ${user.name} (${user.email}).`}
                </p>
              </div>

              {user ? (
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={submitAnonymously}
                    onChange={(e) => setSubmitAnonymously(e.target.checked)}
                    className="peer sr-only"
                    disabled={isSubmitting}
                  />
                  <div className="h-5 w-9 rounded-full bg-muted ring-1 ring-border/80 transition-colors peer-checked:bg-brand-600 peer-checked:ring-brand-600 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500/50 after:absolute after:top-[2px] after:left-[2px] after:size-4 after:rounded-full after:bg-white after:shadow-xs after:transition-all after:content-[''] peer-checked:after:translate-x-4 dark:bg-zinc-800" />
                </label>
              ) : (
                <span className="shrink-0 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  Anonymous
                </span>
              )}
            </div>
          )}

          {/* Full Submit Button */}
          <div className="flex justify-end pt-2">
            <Button
              type="button"
              variant="brand"
              size="lg"
              onClick={() => void handleFullSubmit()}
              disabled={isSubmitting}
              className="h-12 px-8 rounded-xl font-bold shadow-md shadow-brand-500/20 w-full sm:w-auto"
            >
              {isSubmitting ? "Submitting responses..." : "Submit All Responses"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export { SurveyAnswerForm };
