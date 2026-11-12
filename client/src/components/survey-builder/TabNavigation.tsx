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
    <nav className="flex items-center gap-1" role="tablist">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            activeTab === tab.id
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {tab.label}
        </button>
      ))}
      <button
        type="button"
        onClick={onPreviewOpen}
        className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        Preview
      </button>
    </nav>
  );
}

export { TabNavigation };
export type { BuilderTab };
