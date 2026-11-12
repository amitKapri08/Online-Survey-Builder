import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Send,
  CircleStop,
  Pencil,
  Plus,
  Lock,
} from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Label } from "@/components/ui/label";
import { Loader } from "@/components/ui/loader";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useSurvey, useUpdateSurvey } from "@/hooks/useSurveyApi";
import { ROUTES } from "@/lib/routes";
import { getApiErrorMessage } from "@/lib/apiError";
import { cn } from "@/lib/utils";
import type { SurveyStatus } from "@/types/survey";

const STATUS_BADGE: Record<SurveyStatus, "draft" | "published" | "closed"> = {
  DRAFT: "draft",
  PUBLISHED: "published",
  CLOSED: "closed",
};

const surveyDetailsSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().trim().max(2000).optional(),
  slug: z
    .string()
    .trim()
    .max(100)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Only lowercase letters, numbers, and hyphens",
    )
    .optional()
    .or(z.literal("")),
  isAnonymous: z.boolean(),
  allowMultipleResponses: z.boolean(),
});

type SurveyDetailsFormValues = z.infer<typeof surveyDetailsSchema>;

export default function EditSurveyPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: survey, isLoading, error } = useSurvey(id ?? "");
  const updateMutation = useUpdateSurvey();
  const [confirmAction, setConfirmAction] = useState<SurveyStatus | null>(null);

  const isEditable = survey?.status === "DRAFT";

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isDirty },
  } = useForm<SurveyDetailsFormValues>({
    resolver: zodResolver(surveyDetailsSchema),
  });

  const watchedSlug = useWatch({ control, name: "slug" });

  useEffect(() => {
    if (survey) {
      reset({
        title: survey.title,
        description: survey.description ?? "",
        slug: survey.slug,
        isAnonymous: survey.isAnonymous,
        allowMultipleResponses: survey.allowMultipleResponses,
      });
    }
  }, [survey, reset]);

  const handleStatusChange = async (newStatus: SurveyStatus) => {
    if (!id) return;
    try {
      await updateMutation.mutateAsync({
        id,
        payload: { status: newStatus },
      });
      if (newStatus === "CLOSED") {
        toast.success("Survey closed", {
          duration: 10_000,
          action: {
            label: "Undo",
            onClick: handleUndoClose,
          },
        });
      } else {
        toast.success("Survey published successfully");
      }
      setConfirmAction(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to update survey status"));
    }
  };

  const handleUndoClose = async () => {
    if (!id) return;
    try {
      await updateMutation.mutateAsync({
        id,
        payload: { status: "PUBLISHED" },
      });
      toast.success("Survey reopened");
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Undo failed — the survey is now closed"),
      );
    }
  };

  const handleSaveDetails = async (values: SurveyDetailsFormValues) => {
    if (!id) return;
    try {
      await updateMutation.mutateAsync({
        id,
        payload: {
          title: values.title,
          description: values.description || undefined,
          slug: values.slug || undefined,
          isAnonymous: values.isAnonymous,
          allowMultipleResponses: values.allowMultipleResponses,
        },
      });
      toast.success("Survey details saved");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to save survey details"));
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="py-12">
          <Loader label="Loading survey..." />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !survey) {
    return (
      <DashboardLayout>
        <div className="py-12 text-center text-sm text-muted-foreground">
          Survey not found.
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(ROUTES.SURVEYS)}
          className="mb-4"
        >
          <ArrowLeft data-icon="inline-start" />
          Back to surveys
        </Button>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {survey.title}
              </h1>
              <Badge variant={STATUS_BADGE[survey.status]}>
                {survey.status.toLowerCase()}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {isEditable
                ? "Edit your survey details below before publishing."
                : "This survey is no longer editable."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {survey.status === "DRAFT" && (
              <Button
                variant="success"
                size="sm"
                onClick={() => setConfirmAction("PUBLISHED")}
                disabled={updateMutation.isPending}
              >
                <Send data-icon="inline-start" />
                Publish
              </Button>
            )}
            {survey.status === "PUBLISHED" && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setConfirmAction("CLOSED")}
                disabled={updateMutation.isPending}
              >
                <CircleStop data-icon="inline-start" />
                Close
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Responses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">
              {survey._count.responses}
            </p>
            <p className="text-xs text-muted-foreground">
              {survey._count.responses === 1 ? "response" : "responses"}{" "}
              collected
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">
              {survey._count.questions}
            </p>
            <p className="text-xs text-muted-foreground">
              {survey._count.questions === 1 ? "question" : "questions"} added
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Views</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">
              {survey.viewCount}
            </p>
            <p className="text-xs text-muted-foreground">page views</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Survey details
            {!isEditable && <Lock className="size-4 text-muted-foreground" />}
          </CardTitle>
          <CardDescription>
            {isEditable
              ? "Your survey link stays the same while you work on it. Fields are frozen once published."
              : "Publish locks the title, description, slug, and settings."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleSaveDetails)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="e.g. Customer Satisfaction Survey"
                {...register("title")}
                disabled={!isEditable}
                aria-invalid={!!errors.title}
              />
              {errors.title && (
                <p className="text-xs text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Optional description for your survey..."
                rows={3}
                {...register("description")}
                disabled={!isEditable}
                aria-invalid={!!errors.description}
              />
              {errors.description && (
                <p className="text-xs text-destructive">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Custom slug</Label>
              <Input
                id="slug"
                placeholder="auto-generated from title"
                {...register("slug")}
                disabled={!isEditable}
                aria-invalid={!!errors.slug}
              />
              <p className="text-xs text-muted-foreground">
                Your survey link is{" "}
                <span className="font-medium text-foreground">
                  /s/{watchedSlug || survey.slug}
                </span>
              </p>
              {errors.slug && (
                <p className="text-xs text-destructive">{errors.slug.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <Label
                className={cn(
                  "flex items-center gap-2",
                  !isEditable && "cursor-not-allowed opacity-50",
                )}
              >
                <input
                  type="checkbox"
                  className="size-4 rounded border-input"
                  {...register("isAnonymous")}
                  disabled={!isEditable}
                />
                Allow anonymous responses
              </Label>
              <Label
                className={cn(
                  "flex items-center gap-2",
                  !isEditable && "cursor-not-allowed opacity-50",
                )}
              >
                <input
                  type="checkbox"
                  className="size-4 rounded border-input"
                  {...register("allowMultipleResponses")}
                  disabled={!isEditable}
                />
                Allow multiple responses per person
              </Label>
            </div>

            {isEditable && (
              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  variant="brand"
                  disabled={updateMutation.isPending || !isDirty}
                >
                  {updateMutation.isPending ? "Saving..." : "Save changes"}
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Questions</CardTitle>
              <CardDescription>
                Add and arrange questions for your survey.
              </CardDescription>
            </div>
            <Button variant="brand" size="sm" disabled={
              !isEditable || survey._count.questions > 0
            }>
              <Plus data-icon="inline-start" />
              Add question
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {survey._count.questions === 0 ? (
            <EmptyState
              icon={Pencil}
              title="No questions yet"
              description="Start building your survey by adding questions. Each question can be one of 9 types: text, choice, rating, and more."
            />
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Question builder is coming in the next phase.
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={!!confirmAction}
        onOpenChange={(o) => !o && setConfirmAction(null)}
      >
        <DialogContent>
          <DialogClose onClick={() => setConfirmAction(null)} />
          <DialogHeader>
            <DialogTitle>
              {confirmAction === "PUBLISHED" ? "Publish survey" : "Close survey"}
            </DialogTitle>
            <DialogDescription>
              {confirmAction === "PUBLISHED"
                ? "Once published, respondents can access this survey via its public link. You won't be able to add or edit questions after publishing."
                : "Closing the survey will stop accepting new responses. This action cannot be undone."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmAction(null)}>
              Cancel
            </Button>
            <Button
              variant={confirmAction === "PUBLISHED" ? "success" : "destructive"}
              onClick={() => confirmAction && handleStatusChange(confirmAction)}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending
                ? "Updating..."
                : confirmAction === "PUBLISHED"
                  ? "Publish"
                  : "Close survey"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}