import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import { ClipboardList } from "lucide-react";

import { AppFooter } from "@/components/layout/AppFooter";
import { ROUTES } from "@/lib/routes";

interface LegalLayoutProps {
  children: ReactNode;
}

function LegalLayout({ children }: LegalLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-muted">
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            to={ROUTES.HOME}
            className="flex items-center gap-2 text-foreground"
          >
            <div className="flex size-8 items-center justify-center rounded-lg bg-brand-600 text-white">
              <ClipboardList className="size-5" />
            </div>

            <span className="text-lg font-bold tracking-tight">
              SurveyHub
            </span>
          </Link>

          <nav className="flex items-center gap-1 text-sm">
            <Link
              to={ROUTES.PRIVACY_POLICY}
              className="rounded-md px-3 py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Privacy Policy
            </Link>
            <Link
              to={ROUTES.TERMS_OF_USE}
              className="rounded-md px-3 py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Terms of Use
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>

      <AppFooter />
    </div>
  );
}

export { LegalLayout };
