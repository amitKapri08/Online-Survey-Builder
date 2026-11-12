import { ClipboardList, LogOut } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/useAuth";
import { useLogout } from "@/hooks/useAuthApi";

export function DashboardHeader() {
  const { user, setUser } = useAuth();
  const logoutMutation = useLogout();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      setUser(null);
    } catch {
      toast.error("Could not sign you out. Please try again.");
    }
  };

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-brand-600 text-white">
            <ClipboardList className="size-5" />
          </div>

          <span className="text-lg font-bold tracking-tight text-foreground">
            SurveyHub
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-muted-foreground sm:inline">
            {user?.name}
          </span>

          <Separator orientation="vertical" className="hidden h-5 sm:block" />

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
          >
            <LogOut data-icon="inline-start" />
            {logoutMutation.isPending ? "Signing out..." : "Sign out"}
          </Button>
        </div>
      </div>
    </header>
  );
}