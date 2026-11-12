import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ChevronRight,
  Clock,
  Eye,
  HelpCircle,
  LayoutDashboard,
  Plus,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  SURVEY_TEMPLATES,
  TEMPLATE_CATEGORIES,
  type SurveyTemplate,
  type TemplateCategory,
} from "@/data/surveyTemplates";
import { useCreateSurvey } from "@/hooks/useSurveyApi";
import { batchCreateQuestions } from "@/services/survey.service";
import { getApiErrorMessage } from "@/lib/apiError";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

export default function TemplatesPage() {
  const navigate = useNavigate();
  const createSurveyMutation = useCreateSurvey();

  const [selectedCategory, setSelectedCategory] =
    useState<TemplateCategory>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [previewTemplate, setPreviewTemplate] = useState<SurveyTemplate | null>(
    null,
  );
  const [importingId, setImportingId] = useState<string | null>(null);

  // Filter templates based on category & search
  const filteredTemplates = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return SURVEY_TEMPLATES.filter((template) => {
      const matchesCategory =
        selectedCategory === "All" || template.category === selectedCategory;

      if (!matchesCategory) return false;
      if (!q) return true;

      const matchesName = template.name.toLowerCase().includes(q);
      const matchesDesc = template.description.toLowerCase().includes(q);
      const matchesTags = template.tags.some((tag) =>
        tag.toLowerCase().includes(q),
      );
      const matchesQuestions = template.survey.questions.some((qu) =>
        qu.questionText.toLowerCase().includes(q),
      );

      return matchesName || matchesDesc || matchesTags || matchesQuestions;
    });
  }, [selectedCategory, searchQuery]);

  // Handle template creation
  const handleUseTemplate = async (template: SurveyTemplate) => {
    if (importingId) return;
    setImportingId(template.id);
    try {
      const survey = await createSurveyMutation.mutateAsync({
        title: template.survey.title,
        description: template.survey.description,
        isAnonymous: template.survey.isAnonymous,
        allowMultipleResponses: template.survey.allowMultipleResponses,
      });

      await batchCreateQuestions(survey.id, template.survey.questions);

      toast.success(
        `"${template.survey.title}" created with ${template.survey.questions.length} questions!`,
      );

      navigate(ROUTES.SURVEY_EDIT.replace(":id", survey.id));
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to create survey from template"));
      setImportingId(null);
    }
  };

  return (
    <>
      {/* Breadcrumbs */}
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
        <span className="font-medium text-foreground">Template Library</span>
      </nav>

      {/* Page Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-brand-500/20 bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-600 dark:bg-brand-950/40 dark:text-brand-300">
            <Sparkles className="size-3" />
            Curated Templates
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Survey Template Library
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Explore ready-to-use, professionally crafted survey templates across customer experience, HR, events, UX research, and education.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            onClick={() => navigate(ROUTES.SURVEYS)}
            className="gap-2"
          >
            My surveys
          </Button>
          <Button
            variant="brand"
            onClick={() => navigate(ROUTES.SURVEY_CREATE)}
            className="gap-2"
          >
            <Plus className="size-4" />
            Create blank survey
          </Button>
        </div>
      </div>

      {/* Search & Category Filter Controls */}
      <div className="mb-8 space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search templates by title, tag, or topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-8"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          {TEMPLATE_CATEGORIES.map((category) => {
            const isSelected = selectedCategory === category;
            const count =
              category === "All"
                ? SURVEY_TEMPLATES.length
                : SURVEY_TEMPLATES.filter((t) => t.category === category).length;

            return (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  "inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  isSelected
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <span>{category}</span>
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.2 text-[10px]",
                    isSelected
                      ? "bg-background/20 text-background"
                      : "bg-background text-muted-foreground",
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted">
            <HelpCircle className="size-6 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-foreground">
            No matching templates found
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Try adjusting your search terms or clearing the active category filter.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
            >
              Reset filters
            </Button>
            <Button
              variant="brand"
              size="sm"
              onClick={() => navigate(ROUTES.SURVEY_CREATE)}
            >
              Create from scratch
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => {
            const isImporting = importingId === template.id;

            return (
              <Card
                key={template.id}
                className="flex flex-col justify-between transition-all duration-200 hover:shadow-md hover:border-border/80"
              >
                <div>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-2">
                      <Badge
                        variant="secondary"
                        className={cn("text-[11px] font-medium", template.accentColor.badge)}
                      >
                        {template.category}
                      </Badge>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="size-3" />
                          {template.estimatedTime}
                        </span>
                        <span>·</span>
                        <span>{template.questionCount} Qs</span>
                      </div>
                    </div>

                    <CardTitle className="mt-3 text-lg font-bold leading-tight">
                      {template.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 mt-1.5 text-xs leading-relaxed">
                      {template.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-3 pb-3">
                    {/* Tags preview */}
                    <div className="flex flex-wrap gap-1.5">
                      {template.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Question sample preview */}
                    <div className="rounded-lg border border-border/60 bg-muted/40 p-2.5 text-xs">
                      <p className="font-medium text-muted-foreground">
                        First question preview:
                      </p>
                      <p className="mt-1 line-clamp-1 italic text-foreground">
                        &ldquo;{template.survey.questions[0]?.questionText}&rdquo;
                      </p>
                    </div>
                  </CardContent>
                </div>

                <CardFooter className="flex items-center justify-between gap-2 border-t border-border pt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPreviewTemplate(template)}
                    className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <Eye className="size-3.5" />
                    Preview
                  </Button>

                  <Button
                    variant="brand"
                    size="sm"
                    onClick={() => handleUseTemplate(template)}
                    disabled={!!importingId}
                    className="gap-1.5"
                  >
                    {isImporting ? (
                      "Creating..."
                    ) : (
                      <>
                        <span>Use template</span>
                        <ArrowRight className="size-3.5" />
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Interactive Template Preview Modal */}
      {previewTemplate && (
        <Dialog
          open={!!previewTemplate}
          onOpenChange={(open) => !open && setPreviewTemplate(null)}
        >
          <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className={previewTemplate.accentColor.badge}
                >
                  {previewTemplate.category}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {previewTemplate.questionCount} questions · {previewTemplate.estimatedTime}
                </span>
                {previewTemplate.survey.isAnonymous && (
                  <Badge variant="outline" className="text-[10px]">
                    Anonymous
                  </Badge>
                )}
              </div>
              <DialogTitle className="mt-2 text-xl font-bold">
                {previewTemplate.name}
              </DialogTitle>
              <DialogDescription className="text-sm">
                {previewTemplate.longDescription}
              </DialogDescription>
            </DialogHeader>

            <div className="my-4 space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Questions Included ({previewTemplate.survey.questions.length})
              </h4>

              <div className="space-y-3.5">
                {previewTemplate.survey.questions.map((q, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-border bg-card p-4 shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-[11px] font-bold text-brand-700 dark:bg-brand-950/60 dark:text-brand-300">
                          {idx + 1}
                        </span>
                        <p className="text-sm font-semibold text-foreground">
                          {q.questionText}
                        </p>
                      </div>
                      <Badge variant="outline" className="shrink-0 text-[10px]">
                        {q.questionType.replace("_", " ")}
                      </Badge>
                    </div>

                    {/* Question mock inputs for rich preview */}
                    <div className="mt-3 pl-7">
                      {q.questionType === "RATING" && (
                        <div className="flex items-center gap-2">
                          {[1, 2, 3, 4, 5].map((num) => (
                            <div
                              key={num}
                              className="flex size-8 items-center justify-center rounded-lg border border-border bg-muted/50 text-xs font-semibold text-muted-foreground"
                            >
                              {num}
                            </div>
                          ))}
                        </div>
                      )}

                      {q.questionType === "YES_NO" && (
                        <div className="flex gap-2">
                          <span className="rounded-lg border border-border bg-muted/40 px-4 py-1.5 text-xs font-medium text-muted-foreground">
                            Yes
                          </span>
                          <span className="rounded-lg border border-border bg-muted/40 px-4 py-1.5 text-xs font-medium text-muted-foreground">
                            No
                          </span>
                        </div>
                      )}

                      {(q.questionType === "SINGLE_CHOICE" ||
                        q.questionType === "MULTIPLE_CHOICE") &&
                        q.options && (
                          <div className="space-y-1.5">
                            {q.options.map((opt, oIdx) => (
                              <div
                                key={oIdx}
                                className="flex items-center gap-2 text-xs text-muted-foreground"
                              >
                                <div
                                  className={cn(
                                    "size-3.5 border border-muted-foreground/40",
                                    q.questionType === "SINGLE_CHOICE"
                                      ? "rounded-full"
                                      : "rounded-xs",
                                  )}
                                />
                                <span>{opt.optionText}</span>
                              </div>
                            ))}
                          </div>
                        )}

                      {q.questionType === "SHORT_TEXT" && (
                        <div className="rounded-md border border-border/60 bg-muted/20 px-3 py-2 text-xs italic text-muted-foreground/60">
                          Respondent enters short text...
                        </div>
                      )}

                      {q.questionType === "LONG_TEXT" && (
                        <div className="h-14 rounded-md border border-border/60 bg-muted/20 px-3 py-2 text-xs italic text-muted-foreground/60">
                          Respondent enters detailed comments or feedback...
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter className="border-t border-border pt-4">
              <Button
                variant="outline"
                onClick={() => setPreviewTemplate(null)}
              >
                Close preview
              </Button>
              <Button
                variant="brand"
                onClick={() => {
                  const target = previewTemplate;
                  setPreviewTemplate(null);
                  handleUseTemplate(target);
                }}
                disabled={!!importingId}
                className="gap-1.5"
              >
                <span>Use this template</span>
                <ArrowRight className="size-4" />
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
