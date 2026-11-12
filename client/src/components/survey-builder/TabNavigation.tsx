import { Eye } from "lucide-react";
import { cn } from "@/lib/utils";

type BuilderTab = "build" | "settings" | "results";

interface TabNavigationProps {
  activeTab: BuilderTab;
  onTabChange: (tab: BuilderTab) => void;
  onPreviewOpen: () => void;
}

const TABS: { id: BuilderTab; label: string }[] = [
  { id: "build", label: "Build" },
  { id: "settings", label: "Settings" },
  { id: "results", label: "Results" },
];

function TabNavigation({
  activeTab,
  onTabChange,
  onPreviewOpen,
}: TabNavigationProps) {
  return (
    <nav className="flex items-center gap-1.5" role="tablist">
      <div className="flex items-center gap-1 rounded-lg border border-border/60 bg-muted/50 p-1">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "relative rounded-md px-3.5 py-1.5 text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-background text-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onPreviewOpen}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-background px-3 py-1.5 text-sm font-medium text-muted-foreground shadow-2xs transition-all hover:bg-muted hover:text-foreground"
      >
        <Eye className="size-3.5" />
        <span>Preview</span>
      </button>
    </nav>
  );
}

export { TabNavigation };
export type { BuilderTab };
