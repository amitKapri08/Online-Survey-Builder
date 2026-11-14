import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getSurveys,
  createSurvey,
  getSurvey,
  getSurveyBySlug,
  updateSurvey,
  deleteSurvey,
  duplicateSurvey,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  reorderQuestions,
  setAllQuestionsRequired,
  createOption,
  updateOption,
  deleteOption,
  submitResponse,
  getSurveyResponses,
  getSurveyAnalytics,
  exportResponsesCsv,
} from "@/services/survey.service";
import type {
  CreateSurveyPayload,
  UpdateSurveyPayload,
  CreateQuestionPayload,
  UpdateQuestionPayload,
  CreateOptionPayload,
  UpdateOptionPayload,
  SubmitResponsePayload,
  ResponsesPage,
  QuestionAnalytics,
} from "@/types/survey";

export const surveyKeys = {
  all: ["surveys"] as const,
  list: (params?: Record<string, unknown>) =>
    [...surveyKeys.all, "list", params] as const,
  detail: (id: string) => [...surveyKeys.all, "detail", id] as const,
  slug: (slug: string) => [...surveyKeys.all, "slug", slug] as const,
  responses: (id: string, params?: Record<string, unknown>) =>
    [...surveyKeys.all, "responses", id, params] as const,
  analytics: (id: string) => [...surveyKeys.all, "analytics", id] as const,
};

export function useSurveys(params: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: surveyKeys.list(params),
    queryFn: () => getSurveys(params),
  });
}

export function useSurvey(id: string) {
  return useQuery({
    queryKey: surveyKeys.detail(id),
    queryFn: () => getSurvey(id),
    enabled: !!id,
  });
}

export function useCreateSurvey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateSurveyPayload) => createSurvey(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: surveyKeys.all });
    },
  });
}

export function useUpdateSurvey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateSurveyPayload;
    }) => updateSurvey(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: surveyKeys.all });
      queryClient.invalidateQueries({
        queryKey: surveyKeys.detail(variables.id),
      });
    },
  });
}

export function useDeleteSurvey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteSurvey(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: surveyKeys.all });
    },
  });
}

export function useDuplicateSurvey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => duplicateSurvey(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: surveyKeys.all });
      queryClient.invalidateQueries({ queryKey: surveyKeys.detail(id) });
    },
  });
}

export function useCreateQuestion(surveyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateQuestionPayload) =>
      createQuestion(surveyId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: surveyKeys.detail(surveyId),
      });
    },
  });
}

export function useUpdateQuestion(surveyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      questionId,
      payload,
    }: {
      questionId: string;
      payload: UpdateQuestionPayload;
    }) => updateQuestion(surveyId, questionId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: surveyKeys.detail(surveyId),
      });
    },
  });
}

export function useDeleteQuestion(surveyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (questionId: string) => deleteQuestion(surveyId, questionId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: surveyKeys.detail(surveyId),
      });
    },
  });
}

export function useReorderQuestions(surveyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (questionIds: string[]) =>
      reorderQuestions(surveyId, questionIds),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: surveyKeys.detail(surveyId),
      });
    },
  });
}

export function useSetAllQuestionsRequired(surveyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (isRequired: boolean) =>
      setAllQuestionsRequired(surveyId, isRequired),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: surveyKeys.detail(surveyId),
      });
    },
  });
}

export function useCreateOption(surveyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      questionId,
      payload,
    }: {
      questionId: string;
      payload: CreateOptionPayload;
    }) => createOption(surveyId, questionId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: surveyKeys.detail(surveyId),
      });
    },
  });
}

export function useUpdateOption(surveyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      questionId,
      optionId,
      payload,
    }: {
      questionId: string;
      optionId: string;
      payload: UpdateOptionPayload;
    }) => updateOption(surveyId, questionId, optionId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: surveyKeys.detail(surveyId),
      });
    },
  });
}

export function useDeleteOption(surveyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      questionId,
      optionId,
    }: {
      questionId: string;
      optionId: string;
    }) => deleteOption(surveyId, questionId, optionId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: surveyKeys.detail(surveyId),
      });
    },
  });
}

export function usePublicSurvey(slug: string) {
  return useQuery({
    queryKey: surveyKeys.slug(slug),
    queryFn: () => getSurveyBySlug(slug),
    retry: false,
  });
}

export function useSubmitResponse() {
  return useMutation({
    mutationFn: ({
      surveyId,
      payload,
    }: {
      surveyId: string;
      payload: SubmitResponsePayload;
    }) => submitResponse(surveyId, payload),
  });
}

export function useSurveyResponses(
  surveyId: string,
  params: { page?: number; limit?: number; order?: "newest" | "oldest" } = {},
  options: { enabled?: boolean } = {},
) {
  return useQuery<ResponsesPage>({
    queryKey: surveyKeys.responses(surveyId, params),
    queryFn: () => getSurveyResponses(surveyId, params),
    enabled: !!surveyId && options.enabled !== false,
    staleTime: 30_000,
  });
}

export function useSurveyAnalytics(
  surveyId: string,
  options: { enabled?: boolean } = {},
) {
  return useQuery<QuestionAnalytics[]>({
    queryKey: surveyKeys.analytics(surveyId),
    queryFn: () => getSurveyAnalytics(surveyId),
    enabled: !!surveyId && options.enabled !== false,
    staleTime: 30_000,
  });
}

export function useExportResponses() {
  return useMutation({
    mutationFn: (surveyId: string) => exportResponsesCsv(surveyId),
  });
}
