import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Activity,
  ChevronRight,
  ClipboardList,
  ExternalLink,
  Eye,
  HelpCircle,
  LayoutDashboard,
  MessageSquare,
  Search,
  Shield,
  Trash2,
  UserCog,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/loader";
import { Pagination } from "@/components/ui/pagination";
import { Select } from "@/components/ui/select";
import {
  useAdminAuditLogs,
  useAdminStats,
  useAdminSurveys,
  useAdminUsers,
  useDeleteAdminUser,
  useUpdateAdminUserRole,
} from "@/hooks/useAdminApi";
import { getApiErrorMessage } from "@/lib/apiError";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/routes";
import type { AdminAuditLogEntry } from "@/types/admin";
import type { SurveyStatus } from "@/types/survey";

const STATUS_BADGE: Record<SurveyStatus, "draft" | "published" | "closed"> = {
  DRAFT: "draft",
  PUBLISHED: "published",
  CLOSED: "closed",
};

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "DRAFT", label: "Draft" },
  { value: "PUBLISHED", label: "Published" },
  { value: "CLOSED", label: "Closed" },
];

type AdminTab = "overview" | "users" | "surveys" | "audit";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString();
}

export default function AdminPage() {
  const { tab } = useParams<{ tab?: string }>();
  const navigate = useNavigate();

  const getTabFromParam = (t?: string): AdminTab => {
    if (t === "audit-logs" || t === "audit") return "audit";
    if (t === "users") return "users";
    if (t === "surveys") return "surveys";
    return "overview";
  };

  const activeTab = getTabFromParam(tab);

  const handleTabChange = (nextTab: AdminTab) => {
    if (nextTab === "overview") {
      navigate(ROUTES.ADMIN);
    } else if (nextTab === "audit") {
      navigate(ROUTES.ADMIN_AUDIT);
    } else if (nextTab === "users") {
      navigate(ROUTES.ADMIN_USERS);
    } else if (nextTab === "surveys") {
      navigate(ROUTES.ADMIN_SURVEYS);
    }
  };

  // Users state
  const [usersPage, setUsersPage] = useState(1);
  const [userSearch, setUserSearch] = useState("");
  const [userSearchInput, setUserSearchInput] = useState("");
  const [deleteUserId, setDeleteUserId] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Surveys state
  const [surveysPage, setSurveysPage] = useState(1);
  const [surveyStatus, setSurveyStatus] = useState("");
  const [surveySearch, setSurveySearch] = useState("");
  const [surveySearchInput, setSurveySearchInput] = useState("");

  // Audit state
  const [auditPage, setAuditPage] = useState(1);
  const [selectedAuditLog, setSelectedAuditLog] =
    useState<AdminAuditLogEntry | null>(null);

  const roleMutation = useUpdateAdminUserRole();
  const deleteMutation = useDeleteAdminUser();

  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useAdminStats();

  const {
    data: usersData,
    isLoading: usersLoading,
    error: usersError,
  } = useAdminUsers({
    page: usersPage,
    limit: 10,
    search: userSearch,
  });

  const {
    data: surveysData,
    isLoading: surveysLoading,
    error: surveysError,
  } = useAdminSurveys({
    page: surveysPage,
    limit: 10,
    status: surveyStatus,
    search: surveySearch,
  });

  const {
    data: auditData,
    isLoading: auditLoading,
    error: auditError,
  } = useAdminAuditLogs({
    page: auditPage,
    limit: 10,
  });

  const loadError = statsError ?? usersError ?? surveysError ?? auditError;

  const handleToggleRole = async (userId: string, role: string) => {
    try {
      await roleMutation.mutateAsync({
        userId,
        role: role === "ADMIN" ? "USER" : "ADMIN",
      });
      toast.success("User role updated successfully");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to update role"));
    }
  };

  const handleDelete = async () => {
    if (!deleteUserId) return;
    try {
      await deleteMutation.mutateAsync(deleteUserId.id);
      toast.success("User account deactivated");
      setDeleteUserId(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to deactivate user"));
    }
  };

  const handleUserSearch = () => {
    setUserSearch(userSearchInput);
    setUsersPage(1);
  };

  const handleSurveySearch = () => {
    setSurveySearch(surveySearchInput);
    setSurveysPage(1);
  };

  const publishedRatio =
    stats?.totalSurveys && stats.surveysByStatus?.published
      ? Math.round(
          (stats.surveysByStatus.published / stats.totalSurveys) * 100,
        )
      : 0;

  return (
    <>
      {/* Breadcrumb Navigation */}
      <nav
        aria-label="Breadcrumb"
        className="mb-4 flex items-center gap-2 text-sm text-muted-foreground"
      >
        <Link
          to={ROUTES.DASHBOARD}
          className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
        >
          <LayoutDashboard className="size-4" />
          <span>Dashboard</span>
        </Link>
        <ChevronRight className="size-4 text-muted-foreground/60" />
        <span className="font-medium text-foreground">Admin Console</span>
      </nav>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Admin Console
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Platform oversight, user control, survey management, and audit logs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(ROUTES.DASHBOARD)}
            className="gap-2"
          >
            <LayoutDashboard className="size-4" />
            Dashboard
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(ROUTES.SURVEYS)}
            className="gap-2"
          >
            <ClipboardList className="size-4" />
            Surveys
          </Button>
        </div>
      </div>

      {loadError && (
        <div
          role="alert"
          className="mb-6 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {getApiErrorMessage(loadError, "Failed to load admin data.")}
        </div>
      )}

      <div className="mb-6 flex overflow-x-auto border-b border-border">
        <div className="flex gap-2 pb-px">
          {[
            { id: "overview", label: "Overview & Health", icon: Activity },
            { id: "users", label: `Users (${stats?.totalUsers ?? 0})`, icon: Users },
            {
              id: "surveys",
              label: `Surveys (${stats?.totalSurveys ?? 0})`,
              icon: ClipboardList,
            },
            { id: "audit", label: "Audit Logs", icon: Shield },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as AdminTab)}
                className={cn(
                  "inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap",
                  isActive
                    ? "border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400"
                    : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
                )}
              >
                <Icon className="size-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Users
                </CardTitle>
                <Users className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <Loader size="sm" />
                ) : (
                  <>
                    <p className="text-2xl font-bold text-foreground">
                      {stats?.totalUsers ?? 0}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      registered accounts
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Surveys
                </CardTitle>
                <ClipboardList className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <Loader size="sm" />
                ) : (
                  <>
                    <p className="text-2xl font-bold text-foreground">
                      {stats?.totalSurveys ?? 0}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      across all users
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Responses
                </CardTitle>
                <MessageSquare className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <Loader size="sm" />
                ) : (
                  <>
                    <p className="text-2xl font-bold text-foreground">
                      {stats?.totalResponses ?? 0}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      total submissions
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Survey Views
                </CardTitle>
                <Eye className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <Loader size="sm" />
                ) : (
                  <>
                    <p className="text-2xl font-bold text-foreground">
                      {stats?.totalViews ?? 0}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      page visits logged
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Questions
                </CardTitle>
                <HelpCircle className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <Loader size="sm" />
                ) : (
                  <>
                    <p className="text-2xl font-bold text-foreground">
                      {stats?.totalQuestions ?? 0}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      questions configured
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">
                  Survey Status Breakdown
                </CardTitle>
                <CardDescription>
                  Distribution of surveys by operational status.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1.5">
                      <span className="size-2.5 rounded-full bg-emerald-500" />
                      Published (Active)
                    </span>
                    <span className="font-semibold text-foreground">
                      {stats?.surveysByStatus?.published ?? 0} ({publishedRatio}%)
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${publishedRatio}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1.5">
                      <span className="size-2.5 rounded-full bg-muted-foreground" />
                      Drafts
                    </span>
                    <span className="font-semibold text-foreground">
                      {stats?.surveysByStatus?.draft ?? 0}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-muted-foreground/60 transition-all duration-500"
                      style={{
                        width: `${
                          stats?.totalSurveys
                            ? Math.round(
                                ((stats?.surveysByStatus?.draft ?? 0) /
                                  stats.totalSurveys) *
                                  100,
                              )
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1.5">
                      <span className="size-2.5 rounded-full bg-destructive" />
                      Closed
                    </span>
                    <span className="font-semibold text-foreground">
                      {stats?.surveysByStatus?.closed ?? 0}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-destructive/60 transition-all duration-500"
                      style={{
                        width: `${
                          stats?.totalSurveys
                            ? Math.round(
                                ((stats?.surveysByStatus?.closed ?? 0) /
                                  stats.totalSurveys) *
                                  100,
                              )
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">
                  Platform Operations
                </CardTitle>
                <CardDescription>
                  Quick management shortcuts and policies.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-lg border border-border/80 bg-muted/40 p-3.5">
                  <p className="text-sm font-medium text-foreground">
                    Role-Based Access Control
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Promote trusted team members to administrator status or demote
                    them safely from the Users tab. Self-demotions are blocked.
                  </p>
                </div>
                <div className="rounded-lg border border-border/80 bg-muted/40 p-3.5">
                  <p className="text-sm font-medium text-foreground">
                    Audit Logging & Compliance
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    All administrative privileges, user deactivations, and role
                    changes are permanently recorded in the immutable audit log.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "users" && (
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Users Management</CardTitle>
                <CardDescription>
                  Review and manage all registered accounts on the platform.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email..."
                    value={userSearchInput}
                    onChange={(e) => setUserSearchInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleUserSearch()}
                    className="w-64 pl-8"
                  />
                </div>
                <Button variant="outline" size="sm" onClick={handleUserSearch}>
                  Search
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <div className="py-12">
                <Loader label="Loading users directory..." />
              </div>
            ) : !usersData?.users.length ? (
              <p className="py-12 text-center text-sm text-muted-foreground">
                No users found matching your search.
              </p>
            ) : (
              <>
                <div className="divide-y divide-border">
                  {usersData.users.map((user) => (
                    <div
                      key={user.id}
                      className="flex flex-col gap-3 py-3.5 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground">
                            {user.name}
                          </p>
                          <Badge
                            variant={
                              user.role === "ADMIN" ? "default" : "secondary"
                            }
                          >
                            {user.role.toLowerCase()}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {user.email} · Registered {formatDateTime(user.createdAt)}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="hidden sm:inline">
                          {user._count.surveys} surveys · {user._count.responses}{" "}
                          responses
                        </span>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleRole(user.id, user.role)}
                            disabled={roleMutation.isPending}
                            className="h-8 gap-1.5 text-xs"
                          >
                            <UserCog className="size-3.5" />
                            {user.role === "ADMIN" ? "Demote" : "Make Admin"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() =>
                              setDeleteUserId({ id: user.id, name: user.name })
                            }
                            disabled={deleteMutation.isPending}
                            aria-label={`Deactivate ${user.name}`}
                            title="Deactivate account"
                          >
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <Pagination
                    page={usersData.page}
                    totalPages={usersData.totalPages}
                    onPageChange={setUsersPage}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "surveys" && (
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Surveys Oversight</CardTitle>
                <CardDescription>
                  Monitor and review all surveys created by platform users.
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by title..."
                    value={surveySearchInput}
                    onChange={(e) => setSurveySearchInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSurveySearch()}
                    className="w-56 pl-8"
                  />
                </div>
                <Select
                  options={STATUS_OPTIONS}
                  value={surveyStatus}
                  onChange={(e) => {
                    setSurveyStatus(e.target.value);
                    setSurveysPage(1);
                  }}
                  className="w-36"
                />
                <Button variant="outline" size="sm" onClick={handleSurveySearch}>
                  Filter
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {surveysLoading ? (
              <div className="py-12">
                <Loader label="Loading surveys directory..." />
              </div>
            ) : !surveysData?.surveys.length ? (
              <p className="py-12 text-center text-sm text-muted-foreground">
                No surveys found matching the selected filters.
              </p>
            ) : (
              <>
                <div className="divide-y divide-border">
                  {surveysData.surveys.map((survey) => (
                    <div
                      key={survey.id}
                      className="flex flex-col gap-2 py-3.5 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground">
                            {survey.title}
                          </p>
                          <Badge variant={STATUS_BADGE[survey.status]}>
                            {survey.status.toLowerCase()}
                          </Badge>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Owner:{" "}
                          <span className="font-medium text-foreground">
                            {survey.user.name}
                          </span>{" "}
                          ({survey.user.email}) · {survey._count.questions}{" "}
                          questions · {survey._count.responses} responses ·{" "}
                          {survey.viewCount} views
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`/s/${survey.slug}`, "_blank")}
                          className="h-8 gap-1.5 text-xs"
                        >
                          <ExternalLink className="size-3.5" />
                          View Public
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <Pagination
                    page={surveysData.page}
                    totalPages={surveysData.totalPages}
                    onPageChange={setSurveysPage}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "audit" && (
        <Card>
          <CardHeader>
            <CardTitle>System Audit Logs</CardTitle>
            <CardDescription>
              Chronological ledger of security and administrative operations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {auditLoading ? (
              <div className="py-12">
                <Loader label="Loading audit logs..." />
              </div>
            ) : !auditData?.logs.length ? (
              <p className="py-12 text-center text-sm text-muted-foreground">
                No audit log entries recorded yet.
              </p>
            ) : (
              <>
                <div className="divide-y divide-border">
                  {auditData.logs.map((log) => (
                    <div
                      key={log.id}
                      className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono">
                            {log.action}
                          </Badge>
                          <span className="font-medium text-foreground">
                            by {log.actor.name} ({log.actor.email})
                          </span>
                        </div>
                        <p className="mt-1 text-muted-foreground">
                          Target ID: {log.targetId ?? "N/A"} ·{" "}
                          {formatDateTime(log.createdAt)}
                        </p>
                      </div>

                      {log.details && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedAuditLog(log)}
                          className="h-7 text-xs"
                        >
                          View Details
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <Pagination
                    page={auditData.page}
                    totalPages={auditData.totalPages}
                    onPageChange={setAuditPage}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      <Dialog
        open={!!deleteUserId}
        onOpenChange={(open) => !open && setDeleteUserId(null)}
      >
        <DialogContent>
          <DialogClose onClick={() => setDeleteUserId(null)} />
          <DialogHeader>
            <DialogTitle>Deactivate user account</DialogTitle>
            <DialogDescription>
              {deleteUserId
                ? `${deleteUserId.name} will lose access immediately. Their surveys and responses are preserved, but all active sessions will be terminated and login will be blocked.`
                : null}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteUserId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deactivating..." : "Deactivate user"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!selectedAuditLog}
        onOpenChange={(open) => !open && setSelectedAuditLog(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogClose onClick={() => setSelectedAuditLog(null)} />
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="size-4 text-brand-600" />
              Audit Log Details
            </DialogTitle>
            <DialogDescription>
              {selectedAuditLog?.action} at{" "}
              {selectedAuditLog ? formatDateTime(selectedAuditLog.createdAt) : ""}
            </DialogDescription>
          </DialogHeader>
          {selectedAuditLog && (
            <div className="space-y-3 text-xs">
              <div>
                <span className="font-semibold text-foreground">Actor: </span>
                <span className="text-muted-foreground">
                  {selectedAuditLog.actor.name} ({selectedAuditLog.actor.email})
                </span>
              </div>
              {selectedAuditLog.targetId && (
                <div>
                  <span className="font-semibold text-foreground">
                    Target ID:{" "}
                  </span>
                  <span className="font-mono text-muted-foreground">
                    {selectedAuditLog.targetId}
                  </span>
                </div>
              )}
              <div>
                <span className="font-semibold text-foreground">Payload:</span>
                <pre className="mt-1 max-h-56 overflow-auto rounded-lg border border-border bg-muted p-2.5 font-mono text-xs">
                  {JSON.stringify(selectedAuditLog.details, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
