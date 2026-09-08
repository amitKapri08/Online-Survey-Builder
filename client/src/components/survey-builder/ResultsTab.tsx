import { useState } from "react";
import {
  BarChart3,
  Download,
  Eye,
  List,
  MousePointerClick,
  Share2,
  Star,
  Users,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { Loader } from "@/components/ui/loader";
import { cn } from "@/lib/utils";
import {
  useExportResponses,
  useSurveyAnalytics,
  useSurveyResponses,
} from "@/hooks/useSurveyApi";
import type {
  QuestionAnalytics,
  SurveyResponse,
} from "@/types/survey";

interface ResultsTabProps {
  surveyId: string;
  responseCount: number;
  viewCount: number;
  questionCount: number;
  onShare?: () => void;
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Users;
  label: string;
  value: number;
  hint: string;
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <Icon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold text-foreground">{value}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString();
}

function AnalyticsBlock({ analytics }: { analytics: QuestionAnalytics[] }) {
  if (analytics.length === 0) {
    return (
      <EmptyState
        icon={BarChart3}
        title="No analytics available"
        description="There aren't any questions to summarize yet."
      />
    );
  }

  return (
    <div className="space-y-4">
      {analytics.map((item) => (
        <Card key={item.questionId}>
          <CardHeader>
            <CardTitle className="text-base">
              {item.position}. {item.questionText}
            </CardTitle>
            <CardDescription>
              <Badge variant="secondary">{item.type}</Badge> ·{" "}
              {item.total} {item.total === 1 ? "response" : "responses"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {item.type === "CHOICE" && (
              <div className="space-y-2">
                {item.options.map((option) => {
                  const pct =
                    item.total > 0
                      ? Math.round((option.count / item.total) * 100)
                      : 0;
                  return (
                    <div key={option.optionId} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>{option.optionText}</span>
                        <span className="text-muted-foreground">
                          {option.count} · {pct}%
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {item.type === "YES_NO" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-sm font-medium">
                    <ThumbsUp className="size-4 text-green-600" /> Yes
                  </div>
                  <p className="text-2xl font-bold">{item.yes}</p>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-green-500"
                      style={{
                        width: `${item.total > 0 ? (item.yes / item.total) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-sm font-medium">
                    <ThumbsDown className="size-4 text-red-600" /> No
                  </div>
                  <p className="text-2xl font-bold">{item.no}</p>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-red-500"
                      style={{
                        width: `${item.total > 0 ? (item.no / item.total) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {item.type === "RATING" && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Star className="size-4 fill-amber-400 text-amber-400" />
                  <span className="text-2xl font-bold">
                    {item.average.toFixed(2)}
                  </span>
                  <span className="text-muted-foreground">
                    average (min {item.min} – max {item.max})
                  </span>
                </div>
                <div className="space-y-1">
                  {item.distribution
                    .slice()
                    .sort((a, b) => a.value - b.value)
                    .map((bucket) => {
                      const pct =
                        item.total > 0
                          ? Math.round((bucket.count / item.total) * 100)
                          : 0;
                      return (
                        <div key={bucket.value} className="flex items-center gap-3">
                          <span className="w-6 text-right text-xs text-muted-foreground">
                            {bucket.value}
                          </span>
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full bg-primary"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="w-8 text-xs text-muted-foreground">
                            {bucket.count}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {item.type === "NUMBER" && (
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-muted-foreground">Average</p>
                  <p className="text-xl font-bold">{item.average.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Minimum</p>
                  <p className="text-xl font-bold">{item.min}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Maximum</p>
                  <p className="text-xl font-bold">{item.max}</p>
                </div>
              </div>
            )}

            {item.type === "TEXT" && (
              <div className="space-y-3">
                {item.samples.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No text responses.
                  </p>
                )}
                {item.samples.map((sample) => (
                  <div key={sample.responseId} className="rounded-lg border p-3">
                    <p className="text-sm">{sample.text}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDate(sample.submittedAt)}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {item.type === "DATE" && (
              <div className="text-sm text-muted-foreground">
                {item.earliest && item.latest ? (
                  <>
                    Range: {formatDate(item.earliest)} → {formatDate(item.latest)}
                  </>
                ) : (
                  "No date responses yet."
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function AnswerValue({
  value,
}: {
  value: string | number | string[] | null;
}) {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground">—</span>;
  }
  if (Array.isArray(value)) {
    return value.length ? (
      value.join("; ")
    ) : (
      <span className="text-muted-foreground">—</span>
    );
  }
  return <span>{String(value)}</span>;
}

function ResponseDetail({
  response,
  onClose,
}: {
  response: SurveyResponse | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={!!response} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Response details</DialogTitle>
          <DialogDescription>
            {response ? (
              <>
                Submitted {formatDate(response.submittedAt)} ·{" "}
                {response.respondentType === "authenticated"
                  ? "Authenticated user"
                  : "Anonymous"}
              </>
            ) : null}
          </DialogDescription>
        </DialogHeader>
        {response && (
          <div className="space-y-3">
            {response.answers.map((answer) => (
              <div
                key={answer.questionId ?? answer.questionText}
                className="rounded-lg border p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium">{answer.questionText}</p>
                  {answer.questionType && (
                    <Badge variant="outline" className="shrink-0">
                      {answer.questionType}
                    </Badge>
                  )}
                </div>
                <div className="mt-1 text-sm">
                  <AnswerValue value={answer.value} />
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ResponsesListPage({
  surveyId,
  onOpen,
}: {
  surveyId: string;
  onOpen: (response: SurveyResponse) => void;
}) {
  const [page, setPage] = useState(1);
  const [order, setOrder] = useState<"newest" | "oldest">("newest");
  const limit = 10;
  const { data, isLoading, isError } = useSurveyResponses(
    surveyId,
    { page, limit, order },
    { enabled: true },
  );

  if (isLoading) return <Loader />;
  if (isError) {
    return (
      <EmptyState
        icon={List}
        title="Could not load responses"
        description="Try refreshing the page."
      />
    );
  }
  if (!data || data.responses.length === 0) {
    return (
      <EmptyState
        icon={List}
        title="No responses yet"
        description="Your responses will appear here once respondents start submitting."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setOrder((current) => (current === "newest" ? "oldest" : "newest"))
          }
        >
          Sort: {order === "newest" ? "Newest" : "Oldest"}
        </Button>
      </div>
      <div className="space-y-2">
        {data.responses.map((response) => (
          <button
            key={response.responseId}
            onClick={() => onOpen(response)}
            className="flex w-full items-center justify-between rounded-lg border p-3 text-left transition-colors hover:bg-muted"
          >
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {response.respondentType === "authenticated"
                  ? "Authenticated"
                  : "Anonymous"}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {formatDate(response.submittedAt)}
              </span>
            </div>
            <Eye className="size-4 text-muted-foreground" />
          </button>
        ))}
      </div>
      <Pagination
        page={page}
        totalPages={data.totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}

function ResultsTab({
  surveyId,
  responseCount,
  viewCount,
  questionCount,
  onShare,
}: ResultsTabProps) {
  const [view, setView] = useState<"overview" | "responses">("overview");
  const [selectedResponse, setSelectedResponse] =
    useState<SurveyResponse | null>(null);
  const analytics = useSurveyAnalytics(surveyId, {
    enabled: view === "overview",
  });
  const exportMutation = useExportResponses();

  const handleShare = () => {
    if (onShare) {
      onShare();
    } else {
      toast.info("Share is coming soon");
    }
  };

  const handleExport = async () => {
    try {
      const blob = await exportMutation.mutateAsync(surveyId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `survey-${surveyId.slice(0, 8)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success("Survey exported as CSV");
    } catch {
      toast.error("Failed to export survey");
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={Users}
          label="Responses"
          value={responseCount}
          hint={responseCount === 1 ? "response collected" : "responses collected"}
        />
        <StatCard
          icon={MousePointerClick}
          label="Views"
          value={viewCount}
          hint="page views"
        />
        <StatCard
          icon={BarChart3}
          label="Questions"
          value={questionCount}
          hint={questionCount === 1 ? "question" : "questions"}
        />
      </div>

      {responseCount === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <EmptyState
              icon={BarChart3}
              title="No responses yet"
              description="Your analytics will appear here once respondents start submitting answers."
              action={{
                label: "Share survey",
                onClick: handleShare,
              }}
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <CardTitle>Results</CardTitle>
                <CardDescription>
                  Overview of collected responses and per-question breakdowns.
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                disabled={exportMutation.isPending}
              >
                <Download data-icon="inline-start" />
                {exportMutation.isPending ? "Exporting…" : "Export CSV"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="inline-flex items-center rounded-lg border bg-muted p-1">
              <button
                onClick={() => setView("overview")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  view === "overview"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground",
                )}
              >
                <BarChart3 className="size-4" /> Overview
              </button>
              <button
                onClick={() => setView("responses")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  view === "responses"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground",
                )}
              >
                <List className="size-4" /> Responses
              </button>
            </div>

            <div className="mt-4">
              {view === "overview" &&
                (analytics.isLoading ? (
                  <Loader />
                ) : analytics.isError ? (
                  <EmptyState
                    icon={BarChart3}
                    title="Could not load analytics"
                    description="Try refreshing the page."
                  />
                ) : analytics.data ? (
                  <AnalyticsBlock analytics={analytics.data} />
                ) : null)}

              {view === "responses" && (
                <ResponsesListPage
                  surveyId={surveyId}
                  onOpen={setSelectedResponse}
                />
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={handleShare}>
          <Share2 data-icon="inline-start" />
          Share survey
        </Button>
      </div>

      <ResponseDetail
        response={selectedResponse}
        onClose={() => setSelectedResponse(null)}
      />
    </div>
  );
}

export { ResultsTab };