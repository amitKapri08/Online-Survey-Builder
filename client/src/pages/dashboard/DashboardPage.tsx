import { useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  CheckCircle2,
  ClipboardList,
  Copy,
  ExternalLink,
  Layers,
  MousePointerClick,
  Pencil,
  Plus,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Loader } from "@/components/ui/loader";
import { Sparkline } from "@/components/dashboard/Sparkline";
import { useAuth } from "@/context/useAuth";
import { useUserDashboard } from "@/hooks/useUserApi";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { SurveyStatus } from "@/types/survey";

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
  accent,
  trendBadge,
  sparklineColor,
  sparklineTrend = "up",
  sparklineData,
  progressBar,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtext: string;
  accent?: string;
  trendBadge?: {
    text: string;
    positive?: boolean;
  };
  sparklineColor?: "emerald" | "brand" | "sky" | "amber" | "slate";
  sparklineTrend?: "up" | "down" | "neutral";
  sparklineData?: number[];
  progressBar?: number;
}) {
  return (
    <Card className="relative overflow-hidden border border-border/80 bg-card p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-border">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        {trendBadge ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
              trendBadge.positive !== false
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20"
                : "bg-rose-500/10 text-rose-600 dark:text-rose-400 ring-1 ring-rose-500/20",
            )}
          >
            {trendBadge.text}
          </span>
        ) : (
          <div
            className={cn(
              "flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground",
              accent,
            )}
          >
            <Icon className="size-4" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-2">
        <p className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {value}
        </p>
        {sparklineColor && (
          <Sparkline
            color={sparklineColor}
            trend={sparklineTrend}
            data={sparklineData}
            width={76}
            height={26}
          />
        )}
      </div>

      <p className="mt-2 text-xs text-muted-foreground">{subtext}</p>

      {typeof progressBar === "number" && (
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-500 transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, progressBar))}%` }}
          />
        </div>
      )}
    </Card>
  );
}

function SurveyStatusBadge({ status }: { status: SurveyStatus }) {
  if (status === "PUBLISHED") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
        Published
      </span>
    );
  }

  if (status === "DRAFT") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
        Draft
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
      Closed
    </span>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data, isLoading, error } = useUserDashboard();

  const firstName = user?.name?.split(" ")[0] ?? "there";
  const isAdmin = user?.role === "ADMIN";

  const handleCopyLink = async (slug: string, title: string) => {
    const url = `${window.location.origin}/s/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success(`Copied link for "${title}"`);
    } catch {
      toast.info(url);
    }
  };

  const stats = data?.stats ?? {
    totalSurveys: 0,
    publishedSurveys: 0,
    draftSurveys: 0,
    closedSurveys: 0,
    totalResponses: 0,
    totalViews: 0,
    completionRate: 0,
  };

  const recentSurveys = data?.recentSurveys ?? [];
  const recentResponses = data?.recentResponses ?? [];

  return (
    <div className="space-y-8">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Welcome back, {firstName}!
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here is an overview of your surveys and real-time response activity.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            onClick={() => navigate(ROUTES.SURVEYS)}
            className="gap-2 shadow-2xs"
          >
            <ClipboardList className="size-4 text-muted-foreground" />
            Manage surveys
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(ROUTES.TEMPLATES)}
            className="gap-2 shadow-2xs"
          >
            <Sparkles className="size-4 text-brand-600 dark:text-brand-400" />
            Templates
          </Button>
          <Button
            variant="brand"
            onClick={() => navigate(ROUTES.SURVEY_CREATE)}
            className="gap-2 shadow-xs"
          >
            <Plus className="size-4" />
            New survey
          </Button>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          Failed to load live dashboard statistics. Please refresh the page.
        </div>
      )}

      {isLoading ? (
        <div className="py-16">
          <Loader label="Loading your dashboard overview..." />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Top 4 KPI Metrics */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={ClipboardList}
              label="Total Surveys"
              value={stats.totalSurveys}
              subtext={`${stats.publishedSurveys} active · ${stats.draftSurveys} draft · ${stats.closedSurveys} closed`}
              accent="bg-brand-50 text-brand-600 dark:bg-brand-100/30 dark:text-brand-300"
              sparklineColor="brand"
              sparklineTrend="neutral"
            />
            <StatCard
              icon={Users}
              label="Total Responses"
              value={stats.totalResponses}
              subtext={
                stats.totalResponses === 1
                  ? "1 response collected"
                  : `${stats.totalResponses} responses collected`
              }
              trendBadge={{ text: "+18.2%", positive: true }}
              accent="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
              sparklineColor="emerald"
              sparklineTrend="up"
            />
            <StatCard
              icon={TrendingUp}
              label="Completion Rate"
              value={`${stats.completionRate}%`}
              subtext="Average submission rate per view"
              accent="bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400"
              sparklineColor="sky"
              sparklineTrend="up"
              progressBar={stats.completionRate}
            />
            <StatCard
              icon={MousePointerClick}
              label="Total Views"
              value={stats.totalViews}
              subtext="Public survey landing impressions"
              accent="bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
              sparklineColor="amber"
              sparklineTrend="neutral"
            />
          </div>

          {/* Main Content Grid: Recent Surveys Cards + Sidebar Feed */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left 2 Cols: Recent Surveys Card Grid */}
            <div className="space-y-6 lg:col-span-2">
              <Card className="border-border/80 shadow-xs">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  <div>
                    <CardTitle className="text-base font-semibold">
                      Recent Surveys
                    </CardTitle>
                    <CardDescription>
                      Your latest created and modified surveys.
                    </CardDescription>
                  </div>
                  {stats.totalSurveys > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(ROUTES.SURVEYS)}
                      className="gap-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                      View all ({stats.totalSurveys})
                      <ArrowUpRight className="size-3.5" />
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {recentSurveys.length === 0 ? (
                    <EmptyState
                      icon={ClipboardList}
                      title="No surveys yet"
                      description="Create your first survey or start with a template to begin collecting feedback."
                      action={{
                        label: "Create survey",
                        onClick: () => navigate(ROUTES.SURVEY_CREATE),
                      }}
                    />
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {recentSurveys.map((survey) => {
                        const engagementRate =
                          survey.viewCount > 0
                            ? Math.min(
                                100,
                                Math.round(
                                  (survey._count.responses / survey.viewCount) *
                                    100,
                                ),
                              )
                            : survey._count.responses > 0
                              ? 100
                              : 0;

                        return (
                          <div
                            key={survey.id}
                            className="group flex flex-col justify-between rounded-xl border border-border/80 bg-card p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-500/40 hover:shadow-md"
                          >
                            <div>
                              {/* Status Badge & Actions */}
                              <div className="flex items-center justify-between">
                                <SurveyStatusBadge status={survey.status} />
                                <Button
                                  variant="ghost"
                                  size="icon-xs"
                                  onClick={() =>
                                    navigate(
                                      ROUTES.SURVEY_EDIT.replace(
                                        ":id",
                                        survey.id,
                                      ),
                                    )
                                  }
                                  title="Edit survey"
                                  aria-label="Edit survey"
                                  className="text-muted-foreground opacity-70 group-hover:opacity-100"
                                >
                                  <Pencil className="size-3.5" />
                                </Button>
                              </div>

                              {/* Title */}
                              <button
                                type="button"
                                onClick={() =>
                                  navigate(
                                    ROUTES.SURVEY_EDIT.replace(
                                      ":id",
                                      survey.id,
                                    ),
                                  )
                                }
                                className="mt-3 block text-left text-base font-semibold tracking-tight text-foreground transition-colors hover:text-brand-600 dark:hover:text-brand-400 line-clamp-1"
                              >
                                {survey.title}
                              </button>

                              {/* Meta date and count */}
                              <p className="mt-1 text-xs text-muted-foreground">
                                Updated {formatRelativeTime(survey.updatedAt)} ·{" "}
                                {survey._count.questions} questions
                              </p>

                              {/* Progress bar */}
                              <div className="mt-4 flex items-center gap-3">
                                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                                  <div
                                    className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-500 transition-all duration-500"
                                    style={{ width: `${engagementRate}%` }}
                                  />
                                </div>
                                <span className="shrink-0 text-xs font-medium text-muted-foreground">
                                  {engagementRate}%
                                </span>
                              </div>
                            </div>

                            {/* Card Footer: Responses + Share link */}
                            <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-3 text-xs">
                              <span className="font-medium text-muted-foreground">
                                {survey._count.responses}{" "}
                                {survey._count.responses === 1
                                  ? "response"
                                  : "responses"}
                              </span>

                              <div className="flex items-center gap-1">
                                {survey.status === "PUBLISHED" && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleCopyLink(survey.slug, survey.title)
                                    }
                                    className="h-7 gap-1.5 px-2 text-xs font-medium text-muted-foreground hover:text-foreground"
                                    title="Copy public link"
                                    aria-label="Copy public link"
                                  >
                                    <Copy className="size-3.5" />
                                    <span>Share link</span>
                                  </Button>
                                )}

                                <Button
                                  variant="ghost"
                                  size="icon-xs"
                                  onClick={() =>
                                    window.open(`/s/${survey.slug}`, "_blank")
                                  }
                                  title="Open public page"
                                  aria-label="Open public page"
                                  className="text-muted-foreground hover:text-foreground"
                                >
                                  <ExternalLink className="size-3.5" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Col: Recent Submissions Feed & Quick Actions */}
            <div className="space-y-6">
              <Card className="border-border/80 shadow-xs">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base font-semibold">
                    <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                    Recent Submissions
                  </CardTitle>
                  <CardDescription>
                    Live response activity on your surveys.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {recentResponses.length === 0 ? (
                    <div className="py-8 text-center text-xs text-muted-foreground">
                      No responses recorded yet. Once people submit answers,
                      they will appear here in real-time.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {recentResponses.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/30 p-3 text-xs transition-colors hover:bg-muted/50"
                        >
                          <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 ring-1 ring-emerald-500/20">
                            <CheckCircle2 className="size-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium text-foreground">
                              {item.survey.title}
                            </p>
                            <p className="mt-0.5 text-muted-foreground">
                              by{" "}
                              <span className="font-medium text-foreground">
                                {item.user?.name ?? "Anonymous respondent"}
                              </span>{" "}
                              · {formatRelativeTime(item.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-border/80 shadow-xs">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">
                    Quick Shortcuts
                  </CardTitle>
                  <CardDescription>
                    Accelerate your survey workflows.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2.5 text-sm"
                    onClick={() => navigate(ROUTES.TEMPLATES)}
                  >
                    <Sparkles className="size-4 text-brand-600 dark:text-brand-400" />
                    Browse Pre-built Templates
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2.5 text-sm"
                    onClick={() => navigate(ROUTES.SURVEYS)}
                  >
                    <Layers className="size-4 text-muted-foreground" />
                    Manage All Surveys
                  </Button>
                  {isAdmin && (
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2.5 text-sm"
                      onClick={() => navigate(ROUTES.ADMIN)}
                    >
                      <ShieldCheck className="size-4 text-success-600" />
                      Platform Admin Console
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
