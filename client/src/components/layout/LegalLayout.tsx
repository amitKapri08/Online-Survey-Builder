import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { BarChart3 } from "lucide-react";

import { AppFooter } from "@/components/layout/AppFooter";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { ROUTES } from "@/lib/routes";

interface LegalLayoutProps {
  children: ReactNode;
}

function LegalLayout({ children }: LegalLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-muted/20 dark:bg-slate-950 text-foreground transition-colors">
      <header className="sticky top-0 z-10 border-b border-border/80 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            to={ROUTES.HOME}
            className="flex items-center gap-2.5 text-foreground transition-opacity hover:opacity-90"
          >
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white shadow-md shadow-brand-500/20">
              <BarChart3 className="size-5" />
            </div>

            <span className="text-xl font-bold tracking-tight">
              Survey<span className="text-brand-600">Builder</span>
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <nav className="flex items-center gap-1 text-sm font-medium">
              <Link
                to={ROUTES.PRIVACY_POLICY}
                className="rounded-lg px-2.5 py-1.5 text-xs sm:text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                Privacy Policy
              </Link>
              <Link
                to={ROUTES.TERMS_OF_USE}
                className="rounded-lg px-2.5 py-1.5 text-xs sm:text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                Terms of Use
              </Link>
            </nav>

            <div className="h-4 w-px bg-border" />

            <ThemeToggle />

            <Link
              to={ROUTES.LOGIN}
              className="hidden sm:inline-flex items-center justify-center rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors shadow-2xs"
            >
              Sign in
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        {children}
      </main>

      <AppFooter />
    </div>
  );
}

export { LegalLayout };
