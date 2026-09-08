import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarCheck, HeartHandshake, Smile, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCreateSurvey } from "@/hooks/useSurveyApi";
import { batchCreateQuestions } from "@/services/survey.service";
import { ROUTES } from "@/lib/routes";
import { getApiErrorMessage } from "@/lib/apiError";
import { cn } from "@/lib/utils";
import type { CreateQuestionPayload } from "@/types/survey";

interface SurveyTemplate {
  id: string;
  name: string;
  description: string;
  icon: typeof Smile;
  accent: string;
  questionCount: number;
  survey: {
    title: string;
    description: string;
    isAnonymous: boolean;
    allowMultipleResponses: boolean;
    questions: CreateQuestionPayload[];
  };
}

const TEMPLATES: SurveyTemplate[] = [
  {
    id: "customer-satisfaction",
    name: "Customer satisfaction",
    description:
      "Measure overall satisfaction, loyalty, and areas for improvement.",
    icon: Smile,
    accent: "bg-emerald-100 text-emerald-700",
    questionCount: 4,
    survey: {
      title: "Customer Satisfaction Survey",
      description:
        "Thank you for helping us improve. Your feedback is anonymous and takes about two minutes.",
      isAnonymous: true,
      allowMultipleResponses: false,
      questions: [
        {
          questionText: "How satisfied are you with our product overall?",
          questionType: "RATING",
          isRequired: true,
          minValue: 1,
          maxValue: 5,
        },
        {
          questionText: "How likely are you to recommend us to a friend?",
          questionType: "SINGLE_CHOICE",
          isRequired: true,
          options: [
            { optionText: "Very unlikely" },
            { optionText: "Unlikely" },
            { optionText: "Neutral" },
            { optionText: "Likely" },
            { optionText: "Very likely" },
          ],
        },
        {
          questionText: "What could we do better?",
          questionType: "MULTIPLE_CHOICE",
          isRequired: true,
          options: [
            { optionText: "Product features" },
            { optionText: "Customer support" },
            { optionText: "Pricing" },
            { optionText: "Speed" },
            { optionText: "Other" },
          ],
        },
        {
          questionText: "Any additional comments?",
          questionType: "LONG_TEXT",
          isRequired: false,
        },
      ],
    },
  },
  {
    id: "employee-engagement",
    name: "Employee engagement",
    description:
      "Gauge morale, manager support, and how frequently your team receives feedback.",
    icon: HeartHandshake,
    accent: "bg-sky-100 text-sky-700",
    questionCount: 4,
    survey: {
      title: "Employee Engagement Survey",
      description:
        "We want to make sure everyone feels supported. Please answer honestly — responses are confidential.",
      isAnonymous: true,
      allowMultipleResponses: false,
      questions: [
        {
          questionText: "How engaged do you feel at work right now?",
          questionType: "RATING",
          isRequired: true,
          minValue: 1,
          maxValue: 5,
        },
        {
          questionText: "Do you feel your manager supports your growth?",
          questionType: "YES_NO",
          isRequired: true,
        },
        {
          questionText: "How often do you receive useful feedback?",
          questionType: "SINGLE_CHOICE",
          isRequired: true,
          options: [
            { optionText: "Monthly" },
            { optionText: "Quarterly" },
            { optionText: "Twice a year" },
            { optionText: "Rarely" },
            { optionText: "Never" },
          ],
        },
        {
          questionText: "What is one thing we could do better?",
          questionType: "SHORT_TEXT",
          isRequired: false,
        },
      ],
    },
  },
  {
    id: "event-registration",
    name: "Event registration",
    description:
      "Collect attendee details, session preferences, and dietary requirements.",
    icon: CalendarCheck,
    accent: "bg-violet-100 text-violet-700",
    questionCount: 4,
    survey: {
      title: "Event Registration",
      description:
        "Register for our upcoming event. We'll send you a confirmation once you submit.",
      isAnonymous: false,
      allowMultipleResponses: false,
      questions: [
        {
          questionText: "Full name",
          questionType: "SHORT_TEXT",
          isRequired: true,
        },
        {
          questionText: "Email address",
          questionType: "SHORT_TEXT",
          isRequired: true,
        },
        {
          questionText: "Which session will you attend?",
          questionType: "SINGLE_CHOICE",
          isRequired: true,
          options: [
            { optionText: "Session A — Keynote" },
            { optionText: "Session B — Workshops" },
            { optionText: "Session C — Networking" },
          ],
        },
        {
          questionText: "Any dietary requirements?",
          questionType: "MULTIPLE_CHOICE",
          isRequired: false,
          options: [
            { optionText: "Vegetarian" },
            { optionText: "Vegan" },
            { optionText: "Gluten-free" },
            { optionText: "None" },
          ],
        },
      ],
    },
  },
];

interface TemplateGalleryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function TemplateGalleryModal({
  open,
  onOpenChange,
}: TemplateGalleryModalProps) {
  const navigate = useNavigate();
  const createSurveyMutation = useCreateSurvey();

  const [importingTemplateId, setImportingTemplateId] = useState<string | null>(
    null,
  );
  const [failedQuestions, setFailedQuestions] = useState<
    CreateQuestionPayload[]
  >([]);

  const activeTemplate = useMemo(() => {
    const template = TEMPLATES.find((t) => t.id === importingTemplateId);
    return template ?? null;
  }, [importingTemplateId]);

  if (!open) return null;

  const createSurvey = (template: SurveyTemplate) =>
    createSurveyMutation.mutateAsync({
      title: template.survey.title,
      description: template.survey.description,
      isAnonymous: template.survey.isAnonymous,
      allowMultipleResponses: template.survey.allowMultipleResponses,
    });

  const handleUseTemplate = async (template: SurveyTemplate) => {
    if (importingTemplateId) return;
    setImportingTemplateId(template.id);
    setFailedQuestions([]);
    try {
      const survey = await createSurvey(template);
      await batchCreateQuestions(survey.id, template.survey.questions);
      toast.success(
        `"${template.survey.title}" created with ${template.survey.questions.length} questions`,
      );
      navigate(ROUTES.SURVEY_EDIT.replace(":id", survey.id));
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to create survey"));
      setImportingTemplateId(null);
    }
  };

  const handleRetryFailed = async () => {
    if (!activeTemplate || failedQuestions.length === 0) return;
    setImportingTemplateId(null);
    try {
      const survey = await createSurvey(activeTemplate);
      await batchCreateQuestions(survey.id, failedQuestions);
      setFailedQuestions([]);
      toast.success("All questions imported");
      navigate(ROUTES.SURVEY_EDIT.replace(":id", survey.id));
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Import failed"));
      setImportingTemplateId(activeTemplate.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-foreground/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-50 flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-border bg-background shadow-lg">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Start from a template
            </h2>
            <p className="text-sm text-muted-foreground">
              Pick a template and we&apos;ll pre-fill the survey for you.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close template gallery"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-auto p-5">
          {TEMPLATES.map((template) => {
            const Icon = template.icon;
            const isImporting = importingTemplateId === template.id;
            const failedHere = failedQuestions.length > 0;
            return (
              <div
                key={template.id}
                className="flex items-start justify-between gap-4 rounded-xl border p-4 transition-colors hover:border-foreground/40"
              >
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      "mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg",
                      template.accent,
                    )}
                  >
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-foreground">
                        {template.name}
                      </p>
                      <Badge variant="outline">
                        {template.questionCount} questions
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {template.description}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="brand"
                  disabled={isImporting || failedHere}
                  onClick={() => handleUseTemplate(template)}
                >
                  {isImporting ? "Creating..." : "Use template"}
                </Button>
              </div>
            );
          })}
        </div>

        {failedQuestions.length > 0 && activeTemplate && (
          <div className="border-t border-destructive/20 bg-destructive/5 px-5 py-3">
            <p className="text-sm text-destructive">
              {activeTemplate.survey.questions.length - failedQuestions.length}{" "}
              of {activeTemplate.survey.questions.length} questions imported.
              {failedQuestions.length > 1
                ? " Some failed."
                : " One failed."}{" "}
              Retry importing the remaining questions?
            </p>
            <div className="mt-2 flex gap-2">
              <Button
                size="sm"
                variant="destructive"
                onClick={handleRetryFailed}
              >
                Retry failed
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate(ROUTES.SURVEYS)}
              >
                Back to surveys
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export { TemplateGalleryModal };
