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
    case "RATING":
      return (
        <p className="text-sm text-muted-foreground">
          Rate on a scale of{" "}
          <span className="font-medium text-foreground">{question.minValue}</span>{" "}
          to{" "}
          <span className="font-medium text-foreground">{question.maxValue}</span>
        </p>
      );
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