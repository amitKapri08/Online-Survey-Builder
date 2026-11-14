import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AxiosError } from "axios";
import { CheckCircle2, ClipboardList, LogIn, Sparkles, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { SurveyAnswerForm } from "@/components/public/SurveyAnswerForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Loader } from "@/components/ui/loader";
import { ThemeToggle } from "@/components/theme";
import { useAuth } from "@/context/useAuth";
import { usePublicSurvey, useSubmitResponse } from "@/hooks/useSurveyApi";
import { recordSurveyView } from "@/services/survey.service";
import { ROUTES } from "@/lib/routes";
import { getApiErrorMessage } from "@/lib/apiError";
import { buttonVariants } from "@/lib/buttonVariant";
import { cn } from "@/lib/utils";
import type { SubmitResponsePayload } from "@/types/survey";

function SurveyPublicPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [submitted, setSubmitted] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [redirectCancelled, setRedirectCancelled] = useState(false);

  const surveyQuery = usePublicSurvey(slug ?? "");
  const submitMutation = useSubmitResponse();

  const survey = surveyQuery.data;

  useEffect(() => {
    if (!survey?.id) return;
    void recordSurveyView(survey.id);
  }, [survey?.id]);

  useEffect(() => {
    if (!submitted || redirectCancelled) return;

    if (countdown <= 0) {
      if (isAuthenticated) {
        navigate(ROUTES.DASHBOARD);
      } else {
        navigate(ROUTES.HOME);
      }
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [submitted, redirectCancelled, countdown, isAuthenticated, navigate]);

  const handleSubmit = async (payload: SubmitResponsePayload) => {
    if (!survey) return;
    try {
      await submitMutation.mutateAsync({
        surveyId: survey.id,
        payload,
      });
      setSubmitted(true);
    } catch (error) {
      const alreadySubmitted =
        error instanceof AxiosError &&
        error.response?.status === 409 &&
        error.response?.data?.code === "ALREADY_SUBMITTED";

      if (alreadySubmitted) {
        setSubmitted(true);
        return;
      }
      toast.error(getApiErrorMessage(error, "Failed to submit response"));
    }
  };

  const handleSubmitAnother = () => {
    setSubmitted(false);
    setCountdown(5);
    setRedirectCancelled(false);
    submitMutation.reset();
  };

  if (surveyQuery.isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-100 via-slate-50 to-slate-200 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 p-4">
        <Loader label="Loading survey experience..." />
      </div>
    );
  }

  if (surveyQuery.isError || !survey) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-100 via-slate-50 to-slate-200 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 p-4">
        <Card className="w-full max-w-md rounded-3xl border border-border/80 shadow-xl">
          <CardContent className="pt-6">
            <EmptyState
              icon={ClipboardList}
              title="Survey not available"
              description="This survey could not be found, or it is not currently open for responses."
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Celebratory Thank You Screen
  if (submitted) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-100 via-slate-50 to-slate-200 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 p-4">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>

        <div className="mx-auto flex w-full max-w-md flex-col items-center justify-center gap-6 rounded-3xl border border-border/80 bg-card p-8 sm:p-10 text-center shadow-xl ring-1 ring-black/[0.04] dark:ring-white/[0.06]">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 ring-2 ring-emerald-500/20">
            <CheckCircle2 className="size-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Thank you!
            </h1>
            <p className="text-sm text-muted-foreground">
              Your response has been recorded successfully.
            </p>
          </div>

          {!redirectCancelled && countdown > 0 ? (
            <div className="w-full rounded-2xl border border-border/80 bg-muted/30 p-4">
              <p className="text-xs text-muted-foreground">
                Redirecting to{" "}
                <span className="font-semibold text-foreground">
                  {isAuthenticated ? "your dashboard" : "the homepage"}
                </span>{" "}
                in {countdown}s...
              </p>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-brand-600 transition-all duration-1000 ease-linear"
                  style={{ width: `${(countdown / 5) * 100}%` }}
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRedirectCancelled(true)}
                className="mt-2.5 text-xs text-muted-foreground hover:text-foreground"
              >
                Cancel auto-redirect
              </Button>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Auto-redirect cancelled.
            </p>
          )}

          <div className="flex w-full flex-col gap-2.5 pt-1">
            {isAuthenticated ? (
              <Button
                variant="brand"
                onClick={() => navigate(ROUTES.DASHBOARD)}
                className="w-full shadow-xs"
              >
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button
                  variant="brand"
                  onClick={() => navigate(ROUTES.HOME)}
                  className="w-full shadow-xs"
                >
                  Go to Homepage
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate(ROUTES.REGISTER)}
                  className="w-full shadow-2xs"
                >
                  Create your own survey free
                </Button>
              </>
            )}

            {survey.allowMultipleResponses && (
              <Button
                variant="ghost"
                onClick={handleSubmitAnother}
                className="w-full text-xs text-muted-foreground"
              >
                Submit another response
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-100 via-slate-50 to-slate-200 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 px-4 py-12 sm:py-16">
      {/* Theme Toggle Top Right */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      <main className="mx-auto flex w-full max-w-xl flex-col items-center">
        {/* Survey Branding & Title Header */}
        <header className="mb-6 w-full text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/80 px-3 py-0.5 text-xs font-medium text-muted-foreground shadow-2xs backdrop-blur-sm">
            <Sparkles className="size-3 text-brand-600" />
            <span>SurveyBuilder</span>
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            {survey.title}
          </h1>

          {survey.description && (
            <p className="mx-auto max-w-md text-sm text-muted-foreground">
              {survey.description}
            </p>
          )}
        </header>

        {/* Login gate for non-anonymous surveys */}
        {!survey.isAnonymous && !isAuthenticated ? (
          <Card className="w-full rounded-3xl border border-border/80 shadow-xl">
            <CardContent className="flex flex-col items-center gap-5 px-6 py-10 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 ring-2 ring-brand-500/20 dark:bg-brand-950/40 dark:text-brand-300">
                <LogIn className="size-7" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  Sign in to respond
                </h2>
                <p className="mx-auto max-w-sm text-sm text-muted-foreground">
                  This survey is not anonymous, so responses must be linked to
                  your account. Sign in or create a free account to continue.
                </p>
              </div>
              <div className="flex w-full max-w-xs flex-col gap-2.5">
                <Link
                  to={ROUTES.LOGIN}
                  state={{ from: { pathname: `/s/${survey.slug}` } }}
                  className={cn(
                    buttonVariants({ variant: "brand" }),
                    "w-full gap-2",
                  )}
                >
                  <LogIn className="size-4" />
                  Sign in
                </Link>
                <Link
                  to={ROUTES.REGISTER}
                  state={{ from: { pathname: `/s/${survey.slug}` } }}
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "w-full gap-2",
                  )}
                >
                  <UserPlus className="size-4" />
                  Create an account
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : survey.questions.length === 0 ? (
          <Card className="w-full rounded-3xl border border-border/80 shadow-xl">
            <CardContent className="pt-6">
              <EmptyState
                icon={ClipboardList}
                title="No questions yet"
                description="This survey doesn't have any questions yet. Please check back later."
              />
            </CardContent>
          </Card>
        ) : (
          <SurveyAnswerForm
            questions={survey.questions}
            isAnonymous={survey.isAnonymous}
            isSubmitting={submitMutation.isPending}
            onSubmit={handleSubmit}
          />
        )}
      </main>
    </div>
  );
}

export default SurveyPublicPage;
