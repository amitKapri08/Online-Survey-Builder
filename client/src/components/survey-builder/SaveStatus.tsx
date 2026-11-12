import { Loader2 } from "lucide-react";
import { useBuilderSave } from "@/hooks/useBuilderSave";

function formatRelativeTime(date: Date): string {
  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 10) return "Saved just now";
  if (diffSec < 60) return `Saved ${diffSec}s ago`;

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `Saved ${diffMin}m ago`;

  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `Saved ${diffHr}h ago`;

  return `Saved ${Math.floor(diffHr / 24)}d ago`;
}

function SaveStatus() {
  const { saveStatus, lastSavedAt } = useBuilderSave();

  if (saveStatus === "saving") {
    return (
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Loader2 className="size-3 animate-spin" />
        Saving...
      </span>
    );
  }

  if (saveStatus === "error") {
    return (
      <span className="text-xs text-destructive">
        Save failed
      </span>
    );
  }

  if (lastSavedAt) {
    return (
      <span className="text-xs text-muted-foreground">
        {formatRelativeTime(lastSavedAt)}
      </span>
    );
  }

  return null;
}

export { SaveStatus };
