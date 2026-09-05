import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardList, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/loader";
import { Pagination } from "@/components/ui/pagination";
import { Select } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useAuth } from "@/context/useAuth";
import { useSurveys, useDeleteSurvey } from "@/hooks/useSurveyApi";
import { ROUTES } from "@/lib/routes";
import { getApiErrorMessage } from "@/lib/apiError";
import type { SurveyStatus } from "@/types/survey";

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "DRAFT", label: "Draft" },
  { value: "PUBLISHED", label: "Published" },
  { value: "CLOSED", label: "Closed" },
];

const STATUS_BADGE: Record<SurveyStatus, "draft" | "published" | "closed"> = {
  DRAFT: "draft",
  PUBLISHED: "published",
  CLOSED: "closed",
};

export default function SurveyListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0] ?? "there";

  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useSurveys({ page, limit: 10, status, search });
  const deleteMutation = useDeleteSurvey();

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      toast.success("Survey deleted");
      setDeleteId(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to delete survey"));
    }
  };

  const surveys = data?.surveys ?? [];

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Welcome back, {firstName}!
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create, manage and analyze your surveys from here.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Your surveys</CardTitle>
              <CardDescription>
                {data ? `${data.total} total survey${data.total !== 1 ? "s" : ""}` : "Loading..."}
              </CardDescription>
            </div>
            <Button
              variant="success"
              onClick={() => navigate(ROUTES.SURVEY_CREATE)}
            >
              New survey
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row">
            <Input
              placeholder="Search surveys..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="sm:max-w-xs"
            />
            <Select
              options={STATUS_OPTIONS}
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="sm:max-w-[180px]"
            />
          </div>

          {isLoading ? (
            <div className="py-12">
              <Loader label="Loading surveys..." />
            </div>
          ) : surveys.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="No surveys yet"
              description="Create your first survey to start collecting responses."
              action={{
                label: "Create survey",
                onClick: () => navigate(ROUTES.SURVEY_CREATE),
              }}
            />
          ) : (
            <>
              <div className="divide-y divide-border">
                {surveys.map((survey) => (
                  <div
                    key={survey.id}
                    className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate text-sm font-medium text-foreground">
                          {survey.title}
                        </h3>
                        <Badge variant={STATUS_BADGE[survey.status]}>
                          {survey.status.toLowerCase()}
                        </Badge>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {survey._count.questions} question
                        {survey._count.questions !== 1 ? "s" : ""} ·{" "}
                        {survey._count.responses} response
                        {survey._count.responses !== 1 ? "s" : ""} · Updated{" "}
                        {new Date(survey.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() =>
                          navigate(
                            ROUTES.SURVEY_EDIT.replace(":id", survey.id),
                          )
                        }
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setDeleteId(survey.id)}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                {data && (
                  <Pagination
                    page={data.page}
                    totalPages={data.totalPages}
                    onPageChange={setPage}
                  />
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent>
          <DialogClose onClick={() => setDeleteId(null)} />
          <DialogHeader>
            <DialogTitle>Delete survey</DialogTitle>
            <DialogDescription>
              This action cannot be undone. All questions and responses will be
              permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
