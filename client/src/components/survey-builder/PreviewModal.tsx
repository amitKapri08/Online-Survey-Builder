import { useState } from "react";
import {
  CheckSquare,
  Monitor,
  Smartphone,
  Tablet,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { SurveyDetail, SurveyQuestion } from "@/types/survey";

type PreviewDevice = "desktop" | "tablet" | "mobile";

const DEVICE_WIDTHS: Record<PreviewDevice, string> = {
  desktop: "w-full sm:max-w-3xl",
  tablet: "max-w-lg",
  mobile: "max-w-xs",
};

function PreviewField({ question }: { question: SurveyQuestion }) {
  switch (question.questionType) {
    case "SINGLE_CHOICE":
      return (
        <div className="space-y-1.5">
          {question.options.map((option) => (
            <label
              key={option.id}
              className="flex cursor-pointer items-center gap-2 text-sm"
            >
              <span className="size-3.5 rounded-full border border-input" />
              {option.optionText}
            </label>
          ))}
        </div>
      );
    case "MULTIPLE_CHOICE":
      return (
        <div className="space-y-1.5">
          {question.options.map((option) => (
            <label
              key={option.id}
              className="flex cursor-pointer items-center gap-2 text-sm"
            >
              <span className="flex size-4 items-center justify-center rounded border border-input">
                <CheckSquare className="size-3 text-transparent" />
              </span>
              {option.optionText}
            </label>
          ))}
        </div>
      );
    case "DROPDOWN":
      return (
        <div className="rounded-lg border border-input px-3 py-2 text-sm text-muted-foreground">
          Select an option...
        </div>
      );
    case "RATING":
      return (
        <div className="space-y-1">
          <div className="flex gap-1.5">
            {Array.from(
              { length: (question.maxValue ?? 5) - (question.minValue ?? 1) + 1 },
              (_, i) => (question.minValue ?? 1) + i,
            ).map((value) => (
              <span
                key={value}
                className="flex size-8 items-center justify-center rounded-full border border-input text-sm text-muted-foreground"
              >
                {value}
              </span>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Rate from {question.minValue} to {question.maxValue}
          </p>
        </div>
      );
    case "YES_NO":
      return (
        <div className="flex gap-2">
          <span className="px-3 py-1.5 text-sm">Yes</span>
          <span className="px-3 py-1.5 text-sm">No</span>
        </div>
      );
    case "NUMBER":
      return (
        <Input
          type="number"
          disabled
          className="max-w-[180px]"
          placeholder="Your number"
        />
      );
    case "DATE":
      return (
        <Input type="date" disabled className="max-w-[180px]" />
      );
    case "LONG_TEXT":
      return <Textarea rows={3} disabled placeholder="Long answer" />;
    case "SHORT_TEXT":
    default:
      return <Input disabled placeholder="Your answer" />;
  }
}

interface PreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  survey: Pick<SurveyDetail, "title" | "description" | "questions">;
}

function PreviewModal({ open, onOpenChange, survey }: PreviewModalProps) {
  const [device, setDevice] = useState<PreviewDevice>("desktop");

  if (!open) return null;

  const questions = survey.questions ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-foreground/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-50 flex max-h-[92vh] w-full flex-col overflow-hidden rounded-xl border border-border bg-background shadow-lg">
        <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            Preview
          </div>
          <div className="flex items-center gap-1">
            {(
              [
                { id: "desktop", label: "Desktop", icon: Monitor },
                { id: "tablet", label: "Tablet", icon: Tablet },
                { id: "mobile", label: "Mobile", icon: Smartphone },
              ] as const
            ).map(({ id, label, icon: Icon }) => (
              <Button
                key={id}
                variant={device === id ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setDevice(id)}
                aria-pressed={device === id}
              >
                <Icon data-icon="inline-start" />
                <span className="hidden sm:inline">{label}</span>
              </Button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close preview"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex-1 overflow-auto bg-muted/60 p-4 sm:p-6">
          <div
            className={cn(
              "mx-auto rounded-xl border border-border bg-background shadow-sm transition-all",
              DEVICE_WIDTHS[device],
            )}
          >
            <div className="border-b-4 border-b-muted px-5 py-6 sm:px-7">
              <h2 className="text-xl font-bold text-foreground sm:text-2xl">
                {survey.title}
              </h2>
              {survey.description ? (
                <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                  {survey.description}
                </p>
              ) : null}
            </div>

            <div className="space-y-6 px-5 py-6 sm:px-7">
              {questions.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No questions yet.
                </p>
              ) : (
                questions.map((question, index) => (
                  <div key={question.id}>
                    <p className="text-sm font-medium text-foreground">
                      {index + 1}. {question.questionText}
                      {question.isRequired && (
                        <span className="ml-0.5 text-destructive">*</span>
                      )}
                    </p>
                    <div className="mt-2">
                      <PreviewField question={question} />
                    </div>
                    <div aria-hidden className="mt-6 border-b border-border" />
                  </div>
                ))
              )}

              <div className="pt-2">
                <Button variant="brand" disabled>
                  Submit
                </Button>
                <p className="mt-3 text-xs text-muted-foreground">
                  {questions.filter((question) => question.isRequired).length}{" "}
                  required question
                  {questions.filter((question) => question.isRequired).length ===
                  1
                    ? ""
                    : "s"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { PreviewModal };