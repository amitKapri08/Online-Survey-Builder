import type { SurveyQuestion } from "@/types/survey";

function QuestionPreview({ question }: { question: SurveyQuestion }) {
  switch (question.questionType) {
    case "SINGLE_CHOICE":
      return (
        <div className="space-y-1.5">
          {question.options.map((option) => (
            <div key={option.id} className="flex items-center gap-2 text-sm">
              <span className="size-3 shrink-0 rounded-full border border-input" />
              {option.optionText}
            </div>
          ))}
        </div>
      );
    case "MULTIPLE_CHOICE":
      return (
        <div className="space-y-1.5">
          {question.options.map((option) => (
            <div key={option.id} className="flex items-center gap-2 text-sm">
              <span className="size-3 shrink-0 rounded border border-input" />
              {option.optionText}
            </div>
          ))}
        </div>
      );
    case "DROPDOWN":
      return (
        <div className="space-y-1.5">
          <p className="text-sm text-muted-foreground">Select an option...</p>
          {question.options.map((option) => (
            <div key={option.id} className="flex items-center gap-2 text-sm">
              <span className="size-2 shrink-0" />
              {option.optionText}
            </div>
          ))}
        </div>
      );
    case "RATING": {
      const min = question.minValue ?? 1;
      const max = question.maxValue ?? 5;
      const labels = question.ratingLabels ?? [];
      const hasLabels = labels.some((label) => label.trim().length > 0);

      if (hasLabels) {
        return (
          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: max - min + 1 }, (_, offset) => {
              const value = min + offset;
              const label = labels[offset] ?? "";
              return (
                <div
                  key={value}
                  className="flex min-w-10 flex-col items-center gap-0.5 rounded-lg border border-border/70 bg-muted/30 px-1.5 py-1"
                >
                  <span className="text-sm font-semibold text-foreground">
                    {value}
                  </span>
                  <span
                    className="max-w-24 text-center text-[10px] leading-tight text-muted-foreground"
                    title={label}
                  >
                    {label || "—"}
                  </span>
                </div>
              );
            })}
          </div>
        );
      }

      return (
        <p className="text-sm text-muted-foreground">
          Rate on a scale of{" "}
          <span className="font-medium text-foreground">{question.minValue}</span>{" "}
          to{" "}
          <span className="font-medium text-foreground">{question.maxValue}</span>
        </p>
      );
    }
    case "YES_NO":
      return (
        <div className="flex gap-4 text-sm">
          <span className="flex items-center gap-2">
            <span className="size-3 shrink-0 rounded-full border border-input" />
            Yes
          </span>
          <span className="flex items-center gap-2">
            <span className="size-3 shrink-0 rounded-full border border-input" />
            No
          </span>
        </div>
      );
    case "NUMBER":
      return (
        <p className="text-sm text-muted-foreground">
          {question.minValue != null || question.maxValue != null
            ? `Number between ${question.minValue ?? "-∞"} and ${
                question.maxValue ?? "∞"
              }`
            : "Free-form number"}
        </p>
      );
    case "DATE":
      return <p className="text-sm text-muted-foreground">Date picker</p>;
    case "LONG_TEXT":
      return (
        <p className="text-sm text-muted-foreground">
          Long answer (multi-line)
        </p>
      );
    case "SHORT_TEXT":
    default:
      return (
        <p className="text-sm text-muted-foreground">Short answer (one line)</p>
      );
  }
}

export { QuestionPreview };