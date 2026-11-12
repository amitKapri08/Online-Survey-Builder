import { ClipboardList } from "lucide-react";

import { LegalLinks } from "@/components/legal/LegalLinks";

function AppFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="flex size-6 items-center justify-center rounded-md bg-brand-600 text-white">
            <ClipboardList className="size-4" />
          </div>

          <span className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} SurveyHub
          </span>
        </div>

        <LegalLinks className="flex items-center gap-2 text-sm" />
      </div>
    </footer>
  );
}

export { AppFooter };
