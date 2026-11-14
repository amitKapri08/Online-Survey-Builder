import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  RotateCcw,
  Sparkles,
} from "lucide-react";

import { SurveyAnswerForm } from "@/components/public/SurveyAnswerForm";
import { ThemeToggle } from "@/components/theme";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/lib/buttonVariant";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import {
  SURVEY_TEMPLATES,
  type SurveyTemplate,
} from "@/data/surveyTemplates";
import type { SurveyQuestion } from "@/types/survey";

const DEMO_TEMPLATE_ID = "customer-satisfaction";

function buildDemoQuestions(template: SurveyTemplate): SurveyQuestion[] {
  return template.survey.questions.map((question, questionIndex) => ({
    id: `demo-question-${questionIndex + 1}`,
    questionText: question.questionText,
    questionType: question.questionType,
    isRequired: question.isRequired ?? false,
    position: questionIndex + 1,
    minValue: question.minValue ?? null,
    maxValue: question.maxValue ?? null,
    ratingLabels: question.ratingLabels ?? [],
    options: (question.options ?? []).map((option, optionIndex) => ({
      id: `demo-option-${questionIndex + 1}-${optionIndex + 1}`,
      optionText: option.optionText,
      position: option.position ?? optionIndex + 1,
    })),
  }));
}

export default function DemoSurveyPage() {
  const template = useMemo(() => {
    return (
      SURVEY_TEMPLATES.find((item) => item.id === DEMO_TEMPLATE_ID) ??
      SURVEY_TEMPLATES[0]
    );
  }, []);

  const questions = useMemo(() => buildDemoQuestions(template), [template]);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    setSubmitted(true);
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-gradient-to-b from-slate-100 via-slate-50 to-slate-200 text-foreground dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      <header className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
        <Link
          to={ROUTES.HOME}
          className="flex items-center gap-2.5 font-bold tracking-tight text-foreground transition-opacity hover:opacity-90"
        >
          <div className="flex size-9 items-center justify-center rounded-lg bg-brand-600 text-brand-50 shadow-sm">
            <ClipboardList className="size-5" />
          </div>
          <span className="text-lg">SurveyBuilder</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            to={ROUTES.REGISTER}
            className={cn(
              buttonVariants({ variant: "brand", size: "sm" }),
              "hidden gap-1.5 sm:inline-flex",
            )}
          >
            Start building free
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center px-4 pb-16 sm:px-6">
        <div className="mb-6 flex w-full items-start gap-3 rounded-2xl border border-brand-500/20 bg-brand-50/70 px-4 py-3 text-sm text-brand-800 shadow-2xs dark:bg-brand-950/40 dark:text-brand-200">
          <Sparkles className="mt-0.5 size-4 shrink-0 text-brand-600 dark:text-brand-300" />
          <p>
            <span className="font-semibold">Interactive demo.</span> Responses
            stay in your browser and are not saved.
          </p>
        </div>

        {submitted ? (
          <div className="flex w-full flex-col items-center gap-6 rounded-3xl border border-border/80 bg-card p-8 text-center shadow-xl ring-1 ring-black/[0.04] sm:p-10 dark:ring-white/[0.06]">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 ring-2 ring-emerald-500/20 dark:bg-emerald-950/60 dark:text-emerald-400">
              <CheckCircle2 className="size-8" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Demo complete
              </h1>
              <p className="mx-auto max-w-sm text-sm text-muted-foreground">
                That&apos;s how respondents experience a SurveyBuilder survey.
                In a live survey, every answer is saved and available in your
                analytics dashboard.
              </p>
            </div>

            <div className="flex w-full max-w-xs flex-col gap-2.5">
              <Link
                to={ROUTES.REGISTER}
                className={cn(
                  buttonVariants({ variant: "brand" }),
                  "w-full gap-2",
                )}
              >
                Create your own survey free
              </Link>
              <Button
                type="button"
                variant="outline"
                onClick={() => setSubmitted(false)}
                className="w-full gap-2"
              >
                <RotateCcw className="size-4" />
                Try the demo again
              </Button>
              <Link
                to={ROUTES.HOME}
                className="inline-flex items-center justify-center gap-1.5 pt-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="size-3.5" />
                Back to homepage
              </Link>
            </div>
          </div>
        ) : (
          <>
            <header className="mb-6 w-full space-y-2 text-center">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/80 px-3 py-0.5 text-xs font-medium text-muted-foreground shadow-2xs backdrop-blur-sm">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Live demo
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                {template.survey.title}
              </h1>
              <p className="mx-auto max-w-md text-sm text-muted-foreground">
                {template.survey.description}
              </p>
            </header>

            <SurveyAnswerForm
              questions={questions}
              isAnonymous
              isSubmitting={false}
              onSubmit={handleSubmit}
            />
          </>
        )}
      </main>
    </div>
  );
}
