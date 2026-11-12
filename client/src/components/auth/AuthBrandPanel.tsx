import {
  BarChart3,
  CheckCircle2,
  Sparkles,
  Star,
  TrendingUp,
} from "lucide-react";

interface AuthBrandPanelProps {
  variant: "login" | "register";
}

export function AuthBrandPanel({ variant }: AuthBrandPanelProps) {
  const isLogin = variant === "login";

  return (
    <div className="relative flex h-full min-h-[640px] flex-col justify-between overflow-hidden bg-slate-950 p-8 text-white xl:p-12">
      {/* Dynamic ambient gradient glow orbs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-20 -top-20 h-80 w-80 rounded-full bg-brand-600/30 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-indigo-600/25 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500/15 blur-2xl"
      />

      {/* Grid pattern overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:32px_32px]"
      />

      {/* Top Brand Header */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 shadow-md shadow-brand-500/20">
            <BarChart3 className="size-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            Survey<span className="text-brand-400">Builder</span>
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-300 backdrop-blur-md border border-white/10">
          <Sparkles className="size-3.5 text-brand-400" />
          <span>Real-Time Insights</span>
        </div>
      </div>

      {/* Center Value Proposition */}
      <div className="relative z-10 my-auto py-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-brand-500/15 border border-brand-500/30 px-3 py-1 text-xs font-medium text-brand-300 mb-6">
          <TrendingUp className="size-3.5" />
          <span>Enterprise Feedback Platform</span>
        </div>

        <h2 className="text-3xl font-bold tracking-tight leading-tight sm:text-4xl text-white">
          {isLogin ? (
            <>
              Turn every response into <br />
              <span className="bg-gradient-to-r from-brand-300 via-indigo-200 to-white bg-clip-text text-transparent">
                actionable intelligence.
              </span>
            </>
          ) : (
            <>
              Build surveys that people <br />
              <span className="bg-gradient-to-r from-brand-300 via-indigo-200 to-white bg-clip-text text-transparent">
                genuinely love answering.
              </span>
            </>
          )}
        </h2>

        <p className="mt-4 max-w-sm text-sm text-slate-300 leading-relaxed">
          {isLogin
            ? "Access your surveys, track real-time audience engagement, and uncover predictive feedback trends effortlessly."
            : "Create conversational surveys in minutes, distribute via link or embed, and convert raw feedback into high-impact decisions."}
        </p>

        {/* Feature check pills */}
        <div className="mt-6 flex flex-col gap-2.5">
          <div className="flex items-center gap-2.5 text-xs text-slate-300">
            <CheckCircle2 className="size-4 text-brand-400 shrink-0" />
            <span>Interactive NPS, rating scales & multi-step forms</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-slate-300">
            <CheckCircle2 className="size-4 text-brand-400 shrink-0" />
            <span>Anonymous responses & GDPR-ready security controls</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-slate-300">
            <CheckCircle2 className="size-4 text-brand-400 shrink-0" />
            <span>Real-time completion analytics & CSV exports</span>
          </div>
        </div>
      </div>

      {/* Bottom Frosted Glass KPI & Testimonial Card */}
      <div className="relative z-10 space-y-4">
        {/* Floating KPI card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl shadow-2xl shadow-black/40">
          <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-3">
            <div>
              <div className="text-2xl font-bold tracking-tight text-white flex items-center gap-1.5">
                +94%
                <span className="inline-flex items-center text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  <TrendingUp className="size-3 mr-0.5 inline" /> +12%
                </span>
              </div>
              <p className="text-xs text-slate-400">Average completion rate</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold tracking-tight text-white">5,431+</div>
              <p className="text-xs text-slate-400">Responses collected</p>
            </div>
          </div>

          {/* Customer Quote */}
          <div className="pt-3">
            <div className="flex items-center gap-1 text-amber-400 mb-1.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="size-3 fill-amber-400 text-amber-400" />
              ))}
              <span className="text-[11px] font-semibold text-slate-300 ml-1">5.0 / 5.0</span>
            </div>
            <p className="text-xs italic text-slate-300 leading-relaxed">
              &ldquo;SurveyBuilder cut our customer feedback loop by 70% while boosting response quality across our enterprise.&rdquo;
            </p>
            <div className="mt-2 flex items-center gap-2">
              <div className="size-5 rounded-full bg-brand-500 flex items-center justify-center text-[10px] font-bold text-white">
                SL
              </div>
              <span className="text-[11px] font-medium text-slate-400">
                Sarah Lin · Head of Product, NextScale
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
