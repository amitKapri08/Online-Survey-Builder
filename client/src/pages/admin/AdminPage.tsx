import { useState } from "react";
import { Users, ClipboardList, MessageSquare } from "lucide-react";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/loader";
import { Pagination } from "@/components/ui/pagination";
import { Select } from "@/components/ui/select";
import { useAdminStats, useAdminUsers, useAdminSurveys } from "@/hooks/useAdminApi";
import { getApiErrorMessage } from "@/lib/apiError";
import type { SurveyStatus } from "@/types/survey";

const STATUS_BADGE: Record<SurveyStatus, "draft" | "published" | "closed"> = {
  DRAFT: "draft",
  PUBLISHED: "published",
  CLOSED: "closed",
};

export default function AdminPage() {
  const [usersPage, setUsersPage] = useState(1);
  const [surveysPage, setSurveysPage] = useState(1);
  const [surveyStatus, setSurveyStatus] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [userSearchInput, setUserSearchInput] = useState("");

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
  });

  const loadError = statsError ?? usersError ?? surveysError;

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Admin Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Overview of all users and surveys on the platform.
        </p>
      </div>

      {loadError && (
        <div
          role="alert"
          className="mb-6 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {getApiErrorMessage(loadError, "Failed to load admin data.")}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="size-4 text-muted-foreground" />
              Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Loader size="sm" />
            ) : (
              <>
                <p className="text-3xl font-bold text-foreground">
                  {stats?.totalUsers ?? 0}
                </p>
                <p className="text-xs text-muted-foreground">registered users</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ClipboardList className="size-4 text-muted-foreground" />
              Surveys
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Loader size="sm" />
            ) : (
              <>
                <p className="text-3xl font-bold text-foreground">
                  {stats?.totalSurveys ?? 0}
                </p>
                <p className="text-xs text-muted-foreground">total surveys</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageSquare className="size-4 text-muted-foreground" />
              Responses
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Loader size="sm" />
            ) : (
              <>
                <p className="text-3xl font-bold text-foreground">
                  {stats?.totalResponses ?? 0}
                </p>
                <p className="text-xs text-muted-foreground">total responses</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>All registered users on the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Search users..."
              value={userSearchInput}
              onChange={(e) => setUserSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setUserSearch(userSearchInput);
                  setUsersPage(1);
                }
              }}
              className="max-w-xs"
            />
          </div>
          {usersLoading ? (
            <div className="py-8">
              <Loader label="Loading users..." />
            </div>
          ) : !usersData?.users.length ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No users found.
            </p>
          ) : (
            <>
              <div className="divide-y divide-border">
                {usersData.users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {user.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{user._count.surveys} surveys</span>
                      <span>{user._count.responses} responses</span>
                      <Badge
                        variant={
                          user.role === "ADMIN" ? "default" : "secondary"
                        }
                      >
                        {user.role.toLowerCase()}
                      </Badge>
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

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>All Surveys</CardTitle>
          <CardDescription>Surveys across all users.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Select
              options={[
                { value: "", label: "All statuses" },
                { value: "DRAFT", label: "Draft" },
                { value: "PUBLISHED", label: "Published" },
                { value: "CLOSED", label: "Closed" },
              ]}
              value={surveyStatus}
              onChange={(e) => {
                setSurveyStatus(e.target.value);
                setSurveysPage(1);
              }}
              className="max-w-[180px]"
            />
          </div>
          {surveysLoading ? (
            <div className="py-8">
              <Loader label="Loading surveys..." />
            </div>
          ) : !surveysData?.surveys.length ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No surveys found.
            </p>
          ) : (
            <>
              <div className="divide-y divide-border">
                {surveysData.surveys.map((survey) => (
                  <div
                    key={survey.id}
                    className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground">
                          {survey.title}
                        </p>
                        <Badge variant={STATUS_BADGE[survey.status]}>
                          {survey.status.toLowerCase()}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        by {survey.user.name} · {survey._count.questions}{" "}
                        questions · {survey._count.responses} responses
                      </p>
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
    </DashboardLayout>
  );
}
