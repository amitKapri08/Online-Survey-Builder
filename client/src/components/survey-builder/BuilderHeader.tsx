import { useRef, useState } from "react";
import { ChevronLeft, Pencil, Send, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme";
import { SaveStatus } from "./SaveStatus";
import { TabNavigation } from "./TabNavigation";
import type { BuilderTab } from "./TabNavigation";
import { ROUTES } from "@/lib/routes";
import type { SurveyStatus } from "@/types/survey";

interface BuilderHeaderProps {
  surveyId: string;
  title: string;
  status: SurveyStatus;
  activeTab: BuilderTab;
  onTabChange: (tab: BuilderTab) => void;
  onPreviewOpen: () => void;
  onPublish: () => void;
  onShare: () => void;
  onTitleChange: (title: string) => void;
}

function BuilderHeader({
  title,
  status,
  activeTab,
  onTabChange,
  onPreviewOpen,
  onPublish,
  onShare,
  onTitleChange,
}: BuilderHeaderProps) {
  const navigate = useNavigate();
  const [draftTitle, setDraftTitle] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const handleStartEditing = () => {
    setDraftTitle(title);
    setIsEditingTitle(true);
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    const trimmed = draftTitle.trim();
    if (trimmed && trimmed !== title) {
      onTitleChange(trimmed);
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      titleInputRef.current?.blur();
    }
    if (e.key === "Escape") {
      setIsEditingTitle(false);
    }
  };

  return (
    <div className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-md">
      <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
        {/* Left: Back Arrow + Editable Survey Title Pill */}
        <div className="flex items-center gap-3 overflow-hidden">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => navigate(ROUTES.SURVEYS)}
            aria-label="Back to surveys"
            className="rounded-lg text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="size-5" />
          </Button>

          <div className="flex items-center gap-2.5 overflow-hidden">
            {isEditingTitle ? (
              <input
                ref={titleInputRef}
                type="text"
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                onBlur={handleTitleBlur}
                onKeyDown={handleTitleKeyDown}
                className="max-w-xs sm:max-w-sm rounded-lg border border-brand-500 bg-background px-3 py-1 text-sm font-semibold text-foreground outline-none ring-2 ring-brand-500/20"
                autoFocus
              />
            ) : (
              <button
                type="button"
                onClick={handleStartEditing}
                className="group flex max-w-xs sm:max-w-sm items-center gap-2 rounded-lg border border-border/70 bg-muted/30 px-3 py-1.5 text-sm font-semibold text-foreground transition-colors hover:border-border hover:bg-muted/60"
                title="Click to rename survey"
              >
                <span className="truncate">{title}</span>
                <Pencil className="size-3.5 shrink-0 text-muted-foreground opacity-60 transition-opacity group-hover:opacity-100" />
              </button>
            )}
            <SaveStatus />
          </div>
        </div>

        {/* Center: Tabs on Desktop */}
        <div className="hidden md:block">
          <TabNavigation
            activeTab={activeTab}
            onTabChange={onTabChange}
            onPreviewOpen={onPreviewOpen}
          />
        </div>

        {/* Right: Theme Toggle & Publish / Share Actions */}
        <div className="flex items-center gap-2.5">
          <ThemeToggle />

          {status !== "DRAFT" ? (
            <Button
              variant="outline"
              size="sm"
              onClick={onShare}
              className="gap-1.5 shadow-2xs"
            >
              <Share2 className="size-4 text-muted-foreground" />
              <span>Share</span>
            </Button>
          ) : (
            <Button
              variant="brand"
              size="sm"
              onClick={onPublish}
              className="gap-1.5 shadow-xs"
            >
              <Send className="size-4" />
              <span>Publish</span>
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Tab Navigation Strip */}
      <div className="border-t border-border/60 px-4 py-2 sm:hidden">
        <TabNavigation
          activeTab={activeTab}
          onTabChange={onTabChange}
          onPreviewOpen={onPreviewOpen}
        />
      </div>
    </div>
  );
}

export { BuilderHeader };
