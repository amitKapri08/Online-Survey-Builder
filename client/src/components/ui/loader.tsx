import { cn } from "@/lib/utils";

interface LoaderProps {
  size?: "sm" | "md" | "lg";
  variant?: "inline" | "fullscreen";
  label?: string;
}

const sizes = {
  sm: {
    card: "w-28 gap-2 p-3 pt-9",
    medallion: "size-8 -top-4 rounded-lg",
    initial: "text-base",
    lineH: "h-1",
    dot: "size-2",
  },
  md: {
    card: "w-40 gap-3 p-4 pt-10",
    medallion: "size-12 -top-6 rounded-xl",
    initial: "text-2xl",
    lineH: "h-1.5",
    dot: "size-2.5",
  },
  lg: {
    card: "w-56 gap-3.5 p-5 pt-12",
    medallion: "size-16 -top-8 rounded-2xl",
    initial: "text-4xl",
    lineH: "h-2",
    dot: "size-3",
  },
} as const;

export function Loader({
  size = "md",
  variant = "inline",
  label = "Loading…",
}: LoaderProps) {
  const s = sizes[size];

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex items-center justify-center",
        variant === "fullscreen" && "min-h-screen bg-muted",
      )}
    >
      <span className="sr-only">{label}</span>

      <div className="relative flex flex-col items-center">
        <div className="animate-loader-float relative">
          <div
            className={cn(
              "animate-loader-pulse absolute left-1/2 z-10 flex -translate-x-1/2 items-center justify-center border border-border bg-card shadow-lg",
              s.medallion,
            )}
          >
            <span
              className={cn(
                "bg-gradient-to-br from-brand-600 to-success-600 bg-clip-text font-bold text-transparent",
                s.initial,
              )}
            >
              S
            </span>
          </div>

          <div
            className={cn(
              "rounded-2xl border border-border bg-card shadow-sm",
              s.card,
            )}
          >
            <div className="animate-loader-line h-2 w-3/4 rounded-full bg-brand-600/30" />

            <div className="flex flex-col gap-2">
              <div className="animate-loader-line flex items-center gap-2">
                <span className={cn("rounded-full bg-brand-500/50", s.dot)} />
                <span
                  className={cn("flex-1 rounded-full bg-brand-600/25", s.lineH)}
                />
              </div>

              <div className="animate-loader-line flex items-center gap-2 [animation-delay:0.3s]">
                <span className={cn("rounded-full bg-success-500/50", s.dot)} />
                <span
                  className={cn(
                    "w-2/3 rounded-full bg-success-600/25",
                    s.lineH,
                  )}
                />
              </div>

              <div className="animate-loader-line flex items-center gap-2 [animation-delay:0.6s]">
                <span className={cn("rounded-full bg-muted", s.dot)} />
                <span className={cn("w-1/2 rounded-full bg-muted", s.lineH)} />
              </div>
            </div>
          </div>
        </div>

        <div className="animate-loader-shadow -mt-2 h-2 w-3/4 rounded-full bg-foreground/20" />
      </div>
    </div>
  );
}
