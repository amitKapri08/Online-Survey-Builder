import { useCallback, useState } from "react";
import { useParams } from "react-router-dom";
import { Lock } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
import {
  BuilderHeader,
  BuilderSaveProvider,
  BuildTab,
  PreviewModal,
  ResultsTab,
} from "@/components/survey-builder";
import type { BuilderTab } from "@/components/survey-builder";
import { useSurvey, useUpdateSurvey } from "@/hooks/useSurveyApi";
import { useAutosaveField } from "@/hooks/useAutosaveField";
import { useBuilderSave } from "@/hooks/useBuilderSave";
import { getApiErrorMessage } from "@/lib/apiError";
import { cn } from "@/lib/utils";
import type { SurveyStatus } from "@/types/survey";

const surveyDetailsSchema = z.object({
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

function SettingsTabContent({
  survey,
  isEditable,
}: {
  survey: { slug: string; isAnonymous: boolean; allowMultipleResponses: boolean };
  isEditable: boolean;
}) {
  const updateMutation = useUpdateSurvey();
  const { id } = useParams<{ id: string }>();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
  } = useForm<SurveyDetailsFormValues>({
    resolver: zodResolver(surveyDetailsSchema),
    defaultValues: {
      description: "",
      slug: survey.slug,
      isAnonymous: survey.isAnonymous,
      allowMultipleResponses: survey.allowMultipleResponses,
    },
  });

  const watchedSlug = useWatch({ control, name: "slug" });

  const handleSave = async (values: SurveyDetailsFormValues) => {
    if (!id) return;
    try {
      await updateMutation.mutateAsync({
        id,
        payload: {
          description: values.description || undefined,
          slug: values.slug || undefined,
          isAnonymous: values.isAnonymous,
          allowMultipleResponses: values.allowMultipleResponses,
        },
      });
      toast.success("Settings saved");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to save settings"));
    }
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Survey settings
          {!isEditable && <Lock className="size-4 text-muted-foreground" />}
        </CardTitle>
        <CardDescription>
          {isEditable
            ? "Configure your survey settings. These can be changed while the survey is in draft."
            : "Settings are locked once the survey is published."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleSave)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="settings-description">Description</Label>
            <Textarea
              id="settings-description"
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
            <Label htmlFor="settings-slug">Custom slug</Label>
            <Input
              id="settings-slug"
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
                {updateMutation.isPending ? "Saving..." : "Save settings"}
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

function EditSurveyPageContent() {
  const { id } = useParams<{ id: string }>();
  const { data: survey, isLoading, error } = useSurvey(id ?? "");
  const updateMutation = useUpdateSurvey();
  const [activeTab, setActiveTab] = useState<BuilderTab>("build");
  const [confirmAction, setConfirmAction] = useState<SurveyStatus | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const isEditable = survey?.status === "DRAFT";
  const resourceId = survey?.id ?? id ?? "";
  const { flushPendingSaves } = useBuilderSave();

  const titleAutosave = useAutosaveField({
    resourceType: "survey",
    resourceId,
    fieldName: "title",
    enabled: isEditable,
    onSave: async (value) => {
      const trimmed = String(value).trim();
      if (!id || !survey) return;
      if (!trimmed || trimmed === survey.title) return;
      try {
        await updateMutation.mutateAsync({ id, payload: { title: trimmed } });
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Failed to save title"));
        throw error;
      }
    },
  });

  const descriptionAutosave = useAutosaveField({
    resourceType: "survey",
    resourceId,
    fieldName: "description",
    enabled: isEditable,
    onSave: async (value) => {
      if (!id || !survey) return;
      const next = String(value).trim();
      if (next === (survey.description ?? "")) return;
      try {
        await updateMutation.mutateAsync({
          id,
          payload: { description: next },
        });
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Failed to save description"));
        throw error;
      }
    },
  });

  const handleStatusChange = async (newStatus: SurveyStatus) => {
    if (!id) return;
    try {
      await flushPendingSaves();
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

  const handlePreviewOpen = useCallback(() => {
    setPreviewOpen(true);
  }, []);

  const handleShare = useCallback(async () => {
    if (!survey) return;
    await flushPendingSaves();
    const url = `${window.location.origin}/s/${survey.slug}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    } catch {
      toast.info(url);
    }
  }, [survey, flushPendingSaves]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-muted">
        <div className="flex flex-1 items-center justify-center py-12">
          <Loader label="Loading survey..." />
        </div>
      </div>
    );
  }

  if (error || !survey) {
    return (
      <div className="flex min-h-screen flex-col bg-muted">
        <div className="flex flex-1 items-center justify-center py-12 text-sm text-muted-foreground">
          Survey not found.
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted">
      <BuilderHeader
        surveyId={survey.id}
        title={survey.title}
        status={survey.status}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onPreviewOpen={handlePreviewOpen}
        onPublish={() => setConfirmAction("PUBLISHED")}
        onShare={handleShare}
        onTitleChange={titleAutosave.setValue}
      />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
        {activeTab === "build" && (
          <BuildTab
            surveyId={survey.id}
            title={survey.title}
            description={survey.description ?? ""}
            questions={survey.questions ?? []}
            isEditable={isEditable}
            onTitleChange={titleAutosave.setValue}
            onDescriptionChange={descriptionAutosave.setValue}
          />
        )}

        {activeTab === "settings" && (
          <SettingsTabContent survey={survey} isEditable={isEditable} />
        )}

        {activeTab === "results" && (
          <ResultsTab
            responseCount={survey._count.responses}
            viewCount={survey.viewCount}
            questionCount={survey._count.questions}
            onShare={handleShare}
          />
        )}
      </main>

      <PreviewModal
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        survey={{
          title: survey.title,
          description: survey.description ?? "",
          questions: survey.questions ?? [],
        }}
      />

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
    </div>
  );
}

export default function EditSurveyPage() {
  return (
    <BuilderSaveProvider>
      <EditSurveyPageContent />
    </BuilderSaveProvider>
  );
}
