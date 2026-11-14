import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ChevronRight,
  ClipboardList,
  ExternalLink,
  LayoutDashboard,
  Link2,
  Pencil,
  Share2,
} from "lucide-react";
import { toast } from "sonner";

import { QuestionPreview } from "@/components/survey-builder";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Loader } from "@/components/ui/loader";
import { useSurvey } from "@/hooks/useSurveyApi";
import { ROUTES } from "@/lib/routes";
import type { QuestionType, SurveyStatus } from "@/types/survey";

const STATUS_BADGE: Record<SurveyStatus, "draft" | "published" | "closed"> = {
  DRAFT: "draft",
  PUBLISHED: "published",
  CLOSED: "closed",
};

const QUESTION_TYPE_LABEL: Record<QuestionType, string> = {
  SHORT_TEXT: "Short text",
  LONG_TEXT: "Long text",
  SINGLE_CHOICE: "Single choice",
  MULTIPLE_CHOICE: "Multiple choice",
  DROPDOWN: "Dropdown",
  RATING: "Rating",
  YES_NO: "Yes / No",
  NUMBER: "Number",
  DATE: "Date",
};

export default function SurveyViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: survey, isLoading, error } = useSurvey(id ?? "");

  const handleCopyLink = async () => {
    if (!survey) return;
    const url = `${window.location.origin}/s/${survey.slug}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Public link copied to clipboard");
    } catch {
      toast.info(url);
    }
  };

  const handleOpenPublicPage = () => {
    if (!survey) return;
    window.open(`${window.location.origin}/s/${survey.slug}`, "_blank", "noopener");
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader label="Loading survey..." />
      </div>
    );
  }

  if (error || !survey) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="Survey not found"
        description="This survey may have been deleted or you do not have access to it."
        action={{
          label: "Back to surveys",
          onClick: () => navigate(ROUTES.SURVEYS),
        }}
      />
    );
  }

  const questions = survey.questions ?? [];
  const isPublished = survey.status === "PUBLISHED";
  const isDraft = survey.status === "DRAFT";

  return (
    <>
      <nav
        aria-label="Breadcrumb"
        className="mb-4 flex items-center gap-2 text-sm text-muted-foreground"
      >
        <Link
          to={ROUTES.DASHBOARD}
          className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
        >
          <LayoutDashboard className="size-4" />
          <span>Dashboard</span>
        </Link>
        <ChevronRight className="size-4 text-muted-foreground/60" />
        <Link
          to={ROUTES.SURVEYS}
          className="transition-colors hover:text-foreground"
        >
          Surveys
        </Link>
        <ChevronRight className="size-4 text-muted-foreground/60" />
        <span className="truncate font-medium text-foreground">
          {survey.title}
        </span>
      </nav>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {survey.title}
            </h1>
            <Badge variant={STATUS_BADGE[survey.status]}>
              {survey.status.toLowerCase()}
            </Badge>
          </div>
          {survey.description && (
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
              {survey.description}
            </p>
          )}
          <p className="mt-2 text-xs text-muted-foreground">
            {questions.length} question{questions.length !== 1 ? "s" : ""} ·{" "}
            {survey._count.responses} response
            {survey._count.responses !== 1 ? "s" : ""} · {survey.viewCount}{" "}
            view{survey.viewCount !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(ROUTES.SURVEYS)}
            className="gap-2"
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>

          {isDraft && (
            <Button
              variant="brand"
              onClick={() =>
                navigate(ROUTES.SURVEY_EDIT.replace(":id", survey.id))
              }
              className="gap-2"
            >
              <Pencil className="size-4" />
              Edit survey
            </Button>
          )}

          {isPublished && (
            <>
              <Button
                variant="outline"
                onClick={handleCopyLink}
                className="gap-2"
              >
                <Link2 className="size-4" />
                Share link
              </Button>
              <Button
                variant="brand"
                onClick={handleOpenPublicPage}
                className="gap-2"
              >
                <ExternalLink className="size-4" />
                Open public page
              </Button>
            </>
          )}
        </div>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2">
            <Share2 className="size-4 text-muted-foreground" />
            Questions
          </CardTitle>
          <span className="text-xs text-muted-foreground">
            Read-only preview
          </span>
        </CardHeader>
        <CardContent>
          {questions.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="No questions yet"
              description="This survey does not have any questions yet."
              action={
                isDraft
                  ? {
                      label: "Add questions",
                      onClick: () =>
                        navigate(
                          ROUTES.SURVEY_EDIT.replace(":id", survey.id),
                        ),
                    }
                  : undefined
              }
            />
          ) : (
            <ol className="space-y-4">
              {questions.map((question, index) => (
                <li
                  key={question.id}
                  className="rounded-xl border border-border/80 bg-card p-4 shadow-2xs"
                >
                  <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-bold text-muted-foreground">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground">
                          {question.questionText}
                          {question.isRequired && (
                            <span
                              className="ml-1 text-destructive"
                              aria-label="Required"
                            >
                              *
                            </span>
                          )}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {QUESTION_TYPE_LABEL[question.questionType]}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="pl-10">
                    <QuestionPreview question={question} />
                  </div>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>
    </>
  );
}
