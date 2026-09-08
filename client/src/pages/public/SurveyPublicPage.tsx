import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AxiosError } from "axios";
import { CheckCircle2, ClipboardList, PencilRuler } from "lucide-react";
import { toast } from "sonner";

import { SurveyAnswerForm } from "@/components/public/SurveyAnswerForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Loader } from "@/components/ui/loader";
import { usePublicSurvey, useSubmitResponse } from "@/hooks/useSurveyApi";
import { recordSurveyView } from "@/services/survey.service";
import { getApiErrorMessage } from "@/lib/apiError";
import type { SubmitResponsePayload } from "@/types/survey";

function SurveyPublicPage() {
  const { slug } = useParams<{ slug: string }>();
  const [submitted, setSubmitted] = useState(false);

  const surveyQuery = usePublicSurvey(slug ?? "");
  const submitMutation = useSubmitResponse();

  const survey = surveyQuery.data;

  useEffect(() => {
    if (!survey?.id) return;
    void recordSurveyView(survey.id);
  }, [survey?.id]);

  const handleSubmit = async (payload: SubmitResponsePayload) => {
    if (!survey) return;
    try {
      await submitMutation.mutateAsync({
        surveyId: survey.id,
        payload,
      });
      setSubmitted(true);
    } catch (error) {
      const alreadySubmitted =
        error instanceof AxiosError &&
        error.response?.status === 409 &&
        error.response?.data?.code === "ALREADY_SUBMITTED";

      if (alreadySubmitted) {
        setSubmitted(true);
        return;
      }
      toast.error(getApiErrorMessage(error, "Failed to submit response"));
    }
  };

  const handleSubmitAnother = () => {
    setSubmitted(false);
    submitMutation.reset();
  };

  if (surveyQuery.isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-muted">
        <div className="flex flex-1 items-center justify-center py-12">
          <Loader label="Loading survey..." />
        </div>
      </div>
    );
  }

  if (surveyQuery.isError || !survey) {
    return (
      <div className="flex min-h-screen flex-col bg-muted">
        <div className="flex flex-1 items-center justify-center py-12">
          <Card className="max-w-md">
            <CardContent className="pt-6">
              <EmptyState
                icon={ClipboardList}
                title="Survey not available"
                description="This survey could not be found, or it is not currently open for responses."
              />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen flex-col bg-muted">
        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-4 px-4 py-12 text-center">
          <CheckCircle2 className="size-12 text-success" />
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">
            Thank you! Your response has been recorded.
          </h1>
          <p className="text-sm text-muted-foreground">
            {survey.allowMultipleResponses
              ? "Please close this page, or submit another response."
              : "Please close this page. Thank you for taking part."}
          </p>
          {survey.allowMultipleResponses && (
            <Button variant="outline" onClick={handleSubmitAnother}>
              Submit another response
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted">
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:py-12">
        <Card>
          <CardContent className="pt-6">
            <header className="mb-6">
              <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                {survey.title}
              </h1>
              {survey.description && (
                <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                  {survey.description}
                </p>
              )}
              <p className="mt-3 text-xs text-muted-foreground">
                {survey.isAnonymous
                  ? "This survey is anonymous."
                  : "This survey collects your identity."}
              </p>
            </header>

            {survey.questions.length === 0 ? (
              <EmptyState
                icon={PencilRuler}
                title="No questions yet"
                description="This survey doesn't have any questions yet. Please check back later."
              />
            ) : (
              <SurveyAnswerForm
                questions={survey.questions}
                isAnonymous={survey.isAnonymous}
                isSubmitting={submitMutation.isPending}
                onSubmit={handleSubmit}
              />
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default SurveyPublicPage;
