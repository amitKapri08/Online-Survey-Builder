import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getSurveys,
  createSurvey,
  getSurvey,
  updateSurvey,
  deleteSurvey,
  type CreateSurveyPayload,
  type UpdateSurveyPayload,
} from "@/services/survey.service";

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
    mutationFn: ({ id, payload }: { id: string; payload: UpdateSurveyPayload }) =>
      updateSurvey(id, payload),
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
