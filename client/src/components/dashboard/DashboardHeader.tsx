import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme";
import { useAuth } from "@/context/useAuth";
import { useLogout } from "@/hooks/useAuthApi";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

export function DashboardHeader() {
  const { user, setUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const logoutMutation = useLogout();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isDashboard = location.pathname === ROUTES.DASHBOARD;
  const isSurveys =
    location.pathname === ROUTES.SURVEYS ||
    (location.pathname.startsWith("/surveys") &&
      location.pathname !== ROUTES.SURVEY_CREATE);
  const isTemplates = location.pathname === ROUTES.TEMPLATES;
  const isAdmin = user?.role === "ADMIN";
  const isAdminRoute = location.pathname.startsWith("/admin");

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      setUser(null);
    } catch {
      toast.error("Could not sign you out. Please try again.");
    }
  };

  return (
    <header className="sticky top-0 z-20 border-b border-border/80 bg-background/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link
          to={ROUTES.DASHBOARD}
          className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
        >
          <div className="flex size-8 items-center justify-center rounded-lg bg-brand-600 text-white shadow-xs">
            <ClipboardList className="size-5" />
          </div>

          <span className="text-lg font-bold tracking-tight text-foreground">
            SurveyBuilder
          </span>
        </Link>

        {/* Central Navigation - Desktop & Tablet */}
        <nav
          aria-label="Main navigation"
          className="hidden md:flex items-center gap-1"
        >
          <Link
            to={ROUTES.DASHBOARD}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              isDashboard
                ? "bg-accent text-accent-foreground font-semibold shadow-xs"
                : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
            )}
          >
            <LayoutDashboard className="size-4" />
            <span>Dashboard</span>
          </Link>

          <Link
            to={ROUTES.SURVEYS}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              isSurveys
                ? "bg-accent text-accent-foreground font-semibold shadow-xs"
                : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
            )}
          >
            <ClipboardList className="size-4" />
            <span>Surveys</span>
          </Link>

          <Link
            to={ROUTES.TEMPLATES}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              isTemplates
                ? "bg-accent text-accent-foreground font-semibold shadow-xs"
                : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
            )}
          >
            <Sparkles className="size-4 text-brand-600 dark:text-brand-400" />
            <span>Templates</span>
          </Link>

          {isAdmin && (
            <Link
              to={ROUTES.ADMIN}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                isAdminRoute
                  ? "bg-accent text-accent-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
              )}
            >
              <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
              <span>Admin</span>
            </Link>
          )}
        </nav>

        {/* User Utilities & Primary Action */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="brand"
            size="sm"
            onClick={() => navigate(ROUTES.SURVEY_CREATE)}
            className="hidden sm:inline-flex gap-1.5"
          >
            <Plus className="size-4" />
            <span>New survey</span>
          </Button>

          <Separator orientation="vertical" className="hidden h-5 sm:block" />

          <ThemeToggle />

          <Link
            to={ROUTES.PROFILE}
            className={cn(
              "flex items-center gap-2 rounded-lg p-1 transition-colors hover:bg-accent",
              location.pathname === ROUTES.PROFILE && "bg-accent",
            )}
            aria-label="Account settings"
            title="Account settings"
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700 ring-1 ring-brand-200 dark:bg-brand-900/40 dark:text-brand-300 dark:ring-brand-800">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : "U"}
            </div>
            <span
              className="hidden max-w-[120px] truncate text-sm font-medium text-foreground lg:inline"
              title={user?.name ?? ""}
            >
              {user?.name}
            </span>
          </Link>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className="hidden md:inline-flex"
          >
            <LogOut data-icon="inline-start" />
            {logoutMutation.isPending ? "Signing out..." : "Sign out"}
          </Button>

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="inline-flex md:hidden size-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="size-4" />
            ) : (
              <Menu className="size-4" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile navigation drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-background px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            <Link
              to={ROUTES.DASHBOARD}
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isDashboard
                  ? "bg-accent text-accent-foreground font-semibold"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
              )}
            >
              <LayoutDashboard className="size-4" />
              Dashboard
            </Link>
            <Link
              to={ROUTES.SURVEYS}
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isSurveys
                  ? "bg-accent text-accent-foreground font-semibold"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
              )}
            >
              <ClipboardList className="size-4" />
              Surveys
            </Link>
            <Link
              to={ROUTES.TEMPLATES}
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isTemplates
                  ? "bg-accent text-accent-foreground font-semibold"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
              )}
            >
              <Sparkles className="size-4 text-brand-600 dark:text-brand-400" />
              Templates
            </Link>
            {isAdmin && (
              <Link
                to={ROUTES.ADMIN}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isAdminRoute
                    ? "bg-accent text-accent-foreground font-semibold"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                )}
              >
                <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
                Admin Panel
              </Link>
            )}
          </div>

          <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
            <Button
              variant="brand"
              size="sm"
              onClick={() => {
                setMobileMenuOpen(false);
                navigate(ROUTES.SURVEY_CREATE);
              }}
              className="w-full gap-1.5"
            >
              <Plus className="size-4" />
              New survey
            </Button>

            <div className="flex items-center justify-between pt-1">
              <span className="truncate text-xs text-muted-foreground">
                {user?.email}
              </span>
              <Button
                variant="ghost"
                size="xs"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="text-muted-foreground hover:text-destructive"
              >
                <LogOut className="mr-1 size-3" />
                Sign out
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
