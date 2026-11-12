import { useRef, useState } from "react";
import { ArrowLeft, Send, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
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
    <div className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-4 px-4 py-3 sm:px-6">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => navigate(ROUTES.SURVEYS)}
          aria-label="Back to surveys"
        >
          <ArrowLeft />
        </Button>

        <div className="flex flex-1 items-center gap-3 overflow-hidden">
          {isEditingTitle ? (
            <input
              ref={titleInputRef}
              type="text"
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={handleTitleKeyDown}
              className="w-full max-w-md truncate border-b border-foreground bg-transparent text-lg font-bold outline-none sm:text-xl"
              autoFocus
            />
          ) : (
            <button
              type="button"
              onClick={handleStartEditing}
              className="max-w-md cursor-pointer truncate rounded px-1 text-lg font-bold hover:bg-muted sm:text-xl"
              title="Click to edit title"
            >
              {title}
            </button>
          )}
          <SaveStatus />
        </div>

        <div className="hidden md:block">
          <TabNavigation
            activeTab={activeTab}
            onTabChange={onTabChange}
            onPreviewOpen={onPreviewOpen}
          />
        </div>

        <div className="flex items-center gap-2">
          {status !== "DRAFT" && (
            <Button variant="outline" size="sm" onClick={onShare}>
              <Share2 data-icon="inline-start" />
              Share
            </Button>
          )}
          {status === "DRAFT" && (
            <Button variant="success" size="sm" onClick={onPublish}>
              <Send data-icon="inline-start" />
              Publish
            </Button>
          )}
        </div>
      </div>

      <div className="border-t px-4 py-2 sm:hidden">
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
