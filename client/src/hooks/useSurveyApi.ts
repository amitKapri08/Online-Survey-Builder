import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getSurveys,
  createSurvey,
  getSurvey,
  getSurveyBySlug,
  updateSurvey,
  deleteSurvey,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  reorderQuestions,
  createOption,
  updateOption,
  deleteOption,
  submitResponse,
} from "@/services/survey.service";
import type {
  CreateSurveyPayload,
  UpdateSurveyPayload,
  CreateQuestionPayload,
  UpdateQuestionPayload,
  CreateOptionPayload,
  UpdateOptionPayload,
  SubmitResponsePayload,
} from "@/types/survey";

export const surveyKeys = {
  all: ["surveys"] as const,
  list: (params?: Record<string, unknown>) =>
    [...surveyKeys.all, "list", params] as const,
  detail: (id: string) => [...surveyKeys.all, "detail", id] as const,
  slug: (slug: string) => [...surveyKeys.all, "slug", slug] as const,
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
