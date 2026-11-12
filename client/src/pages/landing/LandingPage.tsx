import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  CalendarCheck,
  ClipboardList,
  HeartHandshake,
  Lock,
  PencilRuler,
  Shield,
  Smile,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme";
import { ROUTES } from "@/lib/routes";

export default function LandingPage() {
  const navigate = useNavigate();

  const [previewRating, setPreviewRating] = useState<number>(4);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            to={ROUTES.HOME}
            className="flex items-center gap-2.5 font-bold tracking-tight text-foreground transition-opacity hover:opacity-90"
          >
            <div className="flex size-9 items-center justify-center rounded-lg bg-brand-600 text-brand-50 shadow-sm">
              <ClipboardList className="size-5" />
            </div>
            <span className="text-lg">SurveyBuilder</span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
            <a
              href="#features"
              className="transition-colors hover:text-foreground"
            >
              Features
            </a>
            <Link
              to={ROUTES.TEMPLATES}
              className="transition-colors hover:text-foreground"
            >
              Templates
            </Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(ROUTES.LOGIN)}
              className="text-sm"
            >
              Sign in
            </Button>
            <Button
              variant="brand"
              size="sm"
              onClick={() => navigate(ROUTES.REGISTER)}
              className="text-sm font-medium"
            >
              Get started free
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section matching the approved visual design */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        {/* Subtle Ambient Gradient Orbs */}
        <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
          <div className="size-[600px] rounded-full bg-brand-500/15 blur-[140px]" />
          <div className="size-[500px] rounded-full bg-indigo-500/10 blur-[120px]" />
          <div className="size-[400px] rounded-full bg-cyan-500/10 blur-[100px]" />
        </div>

        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
            {/* Left Column: Headline, CTAs, Social Proof */}
            <div className="text-left lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/60 px-3.5 py-1 text-xs font-semibold text-foreground backdrop-blur-sm">
                <Sparkles className="size-3.5 text-brand-600" />
                Modern Feedback Engine
              </div>

              <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Build surveys people{" "}
                <span className="bg-gradient-to-r from-brand-600 via-indigo-500 to-emerald-500 bg-clip-text text-transparent">
                  actually enjoy
                </span>{" "}
                answering.
              </h1>

              <p className="mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
                Create beautiful, engaging surveys that people complete. High
                conversion rates, powerful analytics, and seamless integration.
              </p>

              {/* Glowing Call-to-Actions */}
              <div className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
                <Button
                  size="lg"
                  variant="brand"
                  onClick={() => navigate(ROUTES.REGISTER)}
                  className="rounded-xl px-6 py-3.5 text-base font-semibold shadow-lg shadow-brand-500/30 transition-all hover:shadow-brand-500/50 hover:-translate-y-0.5"
                >
                  Start Building Free
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate(ROUTES.TEMPLATES)}
                  className="rounded-xl px-6 py-3.5 text-base font-medium shadow-2xs"
                >
                  View Live Demo
                </Button>
              </div>

              {/* Social Proof & Trust Badges */}
              <div className="mt-12 pt-6 border-t border-border/60">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 mb-3">
                  Trusted by creators and modern teams
                </p>
                <div className="flex flex-wrap items-center gap-6 text-sm font-bold tracking-tight text-muted-foreground/70">
                  <span className="transition-colors hover:text-foreground">
                    TechCrunch
                  </span>
                  <span>·</span>
                  <span className="transition-colors hover:text-foreground">
                    Product Hunt
                  </span>
                  <span>·</span>
                  <span className="transition-colors hover:text-foreground">
                    G2 Crowd
                  </span>
                  <span>·</span>
                  <span className="transition-colors hover:text-foreground">
                    Forbes
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Floating 3D Glassmorphic Card Preview */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto w-full max-w-md rounded-3xl border border-border/80 bg-card/85 p-6 shadow-2xl backdrop-blur-xl ring-1 ring-black/[0.05] sm:p-7 dark:ring-white/[0.08]">
                {/* Micro Header */}
                <div className="flex items-center justify-between border-b border-border/60 pb-4">
                  <span className="text-sm font-bold text-foreground">
                    New User Feedback Survey
                  </span>
                  <Badge variant="published" className="text-[10px] px-2 py-0.5">
                    Live Demo
                  </Badge>
                </div>

                {/* Interactive Question */}
                <div className="mt-5 space-y-3">
                  <p className="text-xs font-medium text-foreground">
                    1. How was your experience today?
                  </p>
                  <div className="grid grid-cols-7 gap-1.5">
                    {[0, 1, 2, 3, 4, 5, 6].map((score) => {
                      const isSelected = previewRating === score;
                      return (
                        <button
                          key={score}
                          type="button"
                          onClick={() => setPreviewRating(score)}
                          className={`flex size-8 items-center justify-center rounded-lg text-xs font-semibold transition-all ${
                            isSelected
                              ? "bg-foreground text-background font-bold shadow-xs scale-105"
                              : "border border-border/80 bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
                          }`}
                        >
                          {score}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Live Metric Stats Cards */}
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
                    <p className="text-[11px] font-medium text-muted-foreground">
                      Total Responses
                    </p>
                    <p className="mt-1 text-lg font-bold text-foreground">
                      1,482
                    </p>
                  </div>

                  <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
                    <p className="text-[11px] font-medium text-muted-foreground">
                      Completion Rate
                    </p>
                    <p className="mt-1 text-lg font-bold text-foreground">
                      91%
                    </p>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div className="h-full w-[91%] rounded-full bg-gradient-to-r from-brand-600 to-indigo-500" />
                    </div>
                  </div>
                </div>

                {/* Customer Sentiment Bar */}
                <div className="mt-4 rounded-xl border border-border/60 bg-muted/30 p-3.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">
                      Customer sentiment
                    </span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      72% Positive
                    </span>
                  </div>
                  <div className="mt-2.5 flex h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-[72%] bg-emerald-500" />
                    <div className="h-full w-[21%] bg-amber-400" />
                    <div className="h-full w-[7%] bg-rose-400" />
                  </div>
                  <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
                    <span className="text-emerald-600 font-medium dark:text-emerald-400">
                      72% Positive
                    </span>
                    <span>21% Neutral</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="border-t border-border bg-muted/30 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-xs font-semibold tracking-wider text-brand-600 uppercase">
              Everything You Need
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Powerful tools built for modern teams
            </p>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
              Engineered with care from intuitive form generation to enterprise-grade
              data collection and auditing.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="border-border/80 transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="flex size-10 items-center justify-center rounded-lg bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-400">
                  <PencilRuler className="size-5" />
                </div>
                <CardTitle className="mt-2 text-lg">
                  9 Dynamic Question Types
                </CardTitle>
                <CardDescription>
                  Single choice, multiple choice, ratings, dropdowns, dates, numbers,
                  yes/no, and free text with drag-and-drop reordering.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/80 transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                  <BarChart3 className="size-5" />
                </div>
                <CardTitle className="mt-2 text-lg">
                  Real-Time Analytics & CSV
                </CardTitle>
                <CardDescription>
                  Instant aggregations, choice percentage distributions, star rating
                  averages, and one-click full data export to CSV.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/80 transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="flex size-10 items-center justify-center rounded-lg bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-400">
                  <Lock className="size-5" />
                </div>
                <CardTitle className="mt-2 text-lg">
                  Smart Duplicate Prevention
                </CardTitle>
                <CardDescription>
                  Configurable response limits using visitor fingerprinting for
                  anonymous responses and user keys for logged-in submissions.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/80 transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="flex size-10 items-center justify-center rounded-lg bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-400">
                  <Users className="size-5" />
                </div>
                <CardTitle className="mt-2 text-lg">
                  Flexible Privacy Controls
                </CardTitle>
                <CardDescription>
                  Toggle anonymous submissions per survey so respondents feel
                  comfortable providing candid, unvarnished feedback.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/80 transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="flex size-10 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                  <Shield className="size-5" />
                </div>
                <CardTitle className="mt-2 text-lg">
                  Enterprise RBAC & Auditing
                </CardTitle>
                <CardDescription>
                  Granular administrator role management, tamper-evident audit logs,
                  CSRF double-submit tokens, and origin validation.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/80 transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="flex size-10 items-center justify-center rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400">
                  <Zap className="size-5" />
                </div>
                <CardTitle className="mt-2 text-lg">
                  Autosave & Fast Execution
                </CardTitle>
                <CardDescription>
                  Continuous background saving with conflict resolution so you never
                  lose your survey title, descriptions, or questions.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Pre-built Templates Teaser */}
      <section id="templates" className="py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-xs font-semibold tracking-wider text-brand-600 uppercase">
                Jumpstart In Seconds
              </h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Ready-to-use survey templates
              </p>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                Don&apos;t start from a blank slate. Launch one of our proven
                templates with pre-configured questions and bounds.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate(ROUTES.TEMPLATES)}
              className="gap-1.5"
            >
              <Sparkles className="size-4 text-brand-600 dark:text-brand-400" />
              View all templates
            </Button>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            <Card className="border-border/80 transition-transform hover:-translate-y-1">
              <CardHeader>
                <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                  <Smile className="size-5" />
                </div>
                <CardTitle className="mt-2 text-base font-semibold">
                  Customer Satisfaction (CSAT)
                </CardTitle>
                <CardDescription>
                  Measure overall satisfaction, loyalty, recommendation index, and
                  improvement opportunities.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="brand"
                  size="sm"
                  className="w-full"
                  onClick={() => navigate(ROUTES.REGISTER)}
                >
                  Use template
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border/80 transition-transform hover:-translate-y-1">
              <CardHeader>
                <div className="flex size-10 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
                  <HeartHandshake className="size-5" />
                </div>
                <CardTitle className="mt-2 text-base font-semibold">
                  Employee Engagement
                </CardTitle>
                <CardDescription>
                  Gauge morale, managerial support, feedback frequency, and team
                  retention factors confidentially.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="brand"
                  size="sm"
                  className="w-full"
                  onClick={() => navigate(ROUTES.REGISTER)}
                >
                  Use template
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border/80 transition-transform hover:-translate-y-1">
              <CardHeader>
                <div className="flex size-10 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
                  <CalendarCheck className="size-5" />
                </div>
                <CardTitle className="mt-2 text-base font-semibold">
                  Event Registration
                </CardTitle>
                <CardDescription>
                  Collect attendee details, track session selections, and gather
                  dietary or accessibility requirements.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="brand"
                  size="sm"
                  className="w-full"
                  onClick={() => navigate(ROUTES.REGISTER)}
                >
                  Use template
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call To Action Banner */}
      <section className="border-t border-border bg-muted/40 py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Start collecting meaningful feedback today
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground sm:text-base">
            Join survey creators building better products, events, and teams with
            our modern survey platform.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button
              size="lg"
              variant="brand"
              onClick={() => navigate(ROUTES.REGISTER)}
              className="gap-2 text-base font-semibold shadow-md"
            >
              Get started for free
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-8 text-xs text-muted-foreground">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <ClipboardList className="size-4 text-brand-600" />
            <span className="font-semibold text-foreground">Online Survey Builder</span>
            <span>· All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link
              to={ROUTES.PRIVACY_POLICY}
              className="transition-colors hover:text-foreground"
            >
              Privacy Policy
            </Link>
            <Link
              to={ROUTES.TERMS_OF_USE}
              className="transition-colors hover:text-foreground"
            >
              Terms of Use
            </Link>
            <Link
              to={ROUTES.LOGIN}
              className="transition-colors hover:text-foreground"
            >
              Sign In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
