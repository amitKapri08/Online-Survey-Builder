import {
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Send,
  Users,
} from "lucide-react";

interface AuthBrandPanelProps {
  variant: "login" | "register";
}

const loginFeatures = [
  "Create and manage surveys",
  "Collect responses easily",
  "Turn responses into insights",
];

const registerFeatures = [
  "Create unlimited surveys",
  "Collect responses in real-time",
  "Make data-driven decisions",
];

const loginIcons = [BarChart3, Send, Users];
const registerIcons = [CheckCircle2, Users, BarChart3];

export function AuthBrandPanel({ variant }: AuthBrandPanelProps) {
  const isLogin = variant === "login";
  const features = isLogin ? loginFeatures : registerFeatures;
  const icons = isLogin ? loginIcons : registerIcons;

  return (
    <div
      className={
        isLogin
          ? "relative flex h-full min-h-[600px] flex-col overflow-hidden bg-brand-600 p-8 text-white xl:p-10"
          : "relative flex h-full min-h-[600px] flex-col overflow-hidden bg-success-50 p-8 text-foreground xl:p-10"
      }
    >
      {/* Decorative elements */}
      <div
        aria-hidden="true"
        className={
          isLogin
            ? "absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-500/30"
            : "absolute -right-20 -top-20 h-64 w-64 rounded-full bg-success-100"
        }
      />

      <div
        aria-hidden="true"
        className={
          isLogin
            ? "absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-brand-700/40"
            : "absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-success-100"
        }
      />

      {/* Logo */}
      <div className="relative z-10 flex items-center gap-2">
        <div
          className={
            isLogin
              ? "flex size-10 items-center justify-center rounded-xl bg-white/15"
              : "flex size-10 items-center justify-center rounded-xl bg-success-100"
          }
        >
          <ClipboardList
            className={
              isLogin ? "size-6 text-white" : "size-6 text-success-600"
            }
          />
        </div>

        <span className="text-xl font-bold tracking-tight">SurveyHub</span>
      </div>

      {/* Main content */}
      <div className="relative z-10 mt-auto">
        <h2 className="max-w-sm text-3xl font-bold leading-tight xl:text-4xl">
          {isLogin ? (
            <>
              Smarter surveys,
              <br />
              better insights.
            </>
          ) : (
            <>
              Build surveys
              <br />
              people love{" "}
              <span className="text-success-600">to answer.</span>
            </>
          )}
        </h2>

        <p
          className={
            isLogin
              ? "mt-5 max-w-sm text-sm leading-6 text-brand-100"
              : "mt-5 max-w-sm text-sm leading-6 text-muted-foreground"
          }
        >
          {isLogin
            ? "Create, share and analyze surveys effortlessly. Get the answers that matter."
            : "Create engaging surveys, collect valuable responses and turn them into meaningful insights."}
        </p>

        {/* Features */}
        <div className="mt-8 space-y-4">
          {features.map((feature, index) => {
            const Icon = icons[index];

            return (
              <div key={feature} className="flex items-center gap-3">
                <div
                  className={
                    isLogin
                      ? "flex size-9 shrink-0 items-center justify-center rounded-full bg-white/15"
                      : "flex size-9 shrink-0 items-center justify-center rounded-full bg-card"
                  }
                >
                  <Icon
                    className={
                      isLogin
                        ? "size-4 text-white"
                        : "size-4 text-success-600"
                    }
                  />
                </div>

                <span
                  className={
                    isLogin
                      ? "text-sm text-brand-50"
                      : "text-sm text-muted-foreground"
                  }
                >
                  {feature}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Decorative survey card */}
      <div className="relative z-10 mt-8 hidden xl:block">
        <div
          className={
            isLogin
              ? "ml-auto w-56 rotate-2 rounded-xl bg-card p-4 shadow-xl"
              : "ml-auto w-56 -rotate-2 rounded-xl bg-card p-4 shadow-xl ring-1 ring-success-100"
          }
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="h-2 w-20 rounded-full bg-muted" />
            <BarChart3 className="size-4 text-success-500" />
          </div>

          <div className="space-y-2">
            <div className="h-2 rounded-full bg-muted" />
            <div className="h-2 w-4/5 rounded-full bg-muted" />
            <div className="h-2 w-3/5 rounded-full bg-muted" />
          </div>

          <div className="mt-4 flex items-end gap-2">
            <div className="h-8 w-5 rounded-t bg-brand-500" />
            <div className="h-12 w-5 rounded-t bg-success-500" />
            <div className="h-10 w-5 rounded-t bg-brand-400" />
            <div className="h-16 w-5 rounded-t bg-success-400" />
            <div className="h-7 w-5 rounded-t bg-brand-300" />
          </div>
        </div>
      </div>
    </div>
  );
}
