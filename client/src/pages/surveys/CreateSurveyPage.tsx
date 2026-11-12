import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
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
import { Textarea } from "@/components/ui/textarea";
import { useCreateSurvey } from "@/hooks/useSurveyApi";
import { ROUTES } from "@/lib/routes";
import { getApiErrorMessage } from "@/lib/apiError";

const createSurveyFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().trim().max(2000).optional(),
  slug: z
    .string()
    .trim()
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Only lowercase letters, numbers, and hyphens")
    .optional()
    .or(z.literal("")),
  isAnonymous: z.boolean(),
  allowMultipleResponses: z.boolean(),
});

type CreateSurveyFormValues = z.infer<typeof createSurveyFormSchema>;

export default function CreateSurveyPage() {
  const navigate = useNavigate();
  const createMutation = useCreateSurvey();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateSurveyFormValues>({
    resolver: zodResolver(createSurveyFormSchema),
    defaultValues: {
      title: "",
      description: "",
      slug: "",
      isAnonymous: false,
      allowMultipleResponses: false,
    },
  });

  const onSubmit = async (values: CreateSurveyFormValues) => {
    setServerError(null);
    try {
      const payload = {
        ...values,
        slug: values.slug || undefined,
        description: values.description || undefined,
      };
      const survey = await createMutation.mutateAsync(payload);
      toast.success("Survey created");
      navigate(ROUTES.SURVEY_EDIT.replace(":id", survey.id));
    } catch (error) {
      setServerError(getApiErrorMessage(error, "Failed to create survey"));
    }
  };

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
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Create a new survey
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Set up the basics. You can add questions after creating the survey.
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Survey details</CardTitle>
          <CardDescription>
            Give your survey a title and optional description.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {serverError && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
                {serverError}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="e.g. Customer Satisfaction Survey"
                {...register("title")}
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
                aria-invalid={!!errors.slug}
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to auto-generate. Your survey link will be{" "}
                <span className="font-medium text-foreground">/s/your-slug</span>
              </p>
              {errors.slug && (
                <p className="text-xs text-destructive">{errors.slug.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <Label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="size-4 rounded border-input"
                  {...register("isAnonymous")}
                />
                Allow anonymous responses
              </Label>
              <Label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="size-4 rounded border-input"
                  {...register("allowMultipleResponses")}
                />
                Allow multiple responses per person
              </Label>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(ROUTES.SURVEYS)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="success"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Creating..." : "Create survey"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
