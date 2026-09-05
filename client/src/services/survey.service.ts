import apiClient from "@/api/axios";
import type { ApiResponse } from "@/types/api";
import type {
  SurveyDetail,
  SurveyListResponse,
  CreateSurveyPayload,
  UpdateSurveyPayload,
} from "@/types/survey";

export async function getSurveys(params: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}): Promise<SurveyListResponse> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.status) query.set("status", params.status);
  if (params.search) query.set("search", params.search);

  const response = await apiClient.get<ApiResponse<SurveyListResponse>>(
    `/surveys?${query.toString()}`,
  );
  return response.data.data;
}

export async function createSurvey(
  payload: CreateSurveyPayload,
): Promise<SurveyDetail> {
  const response = await apiClient.post<ApiResponse<{ survey: SurveyDetail }>>(
    "/surveys",
    payload,
  );
  return response.data.data.survey;
}

export async function getSurvey(id: string): Promise<SurveyDetail> {
  const response = await apiClient.get<ApiResponse<{ survey: SurveyDetail }>>(
    `/surveys/${id}`,
  );
  return response.data.data.survey;
}

export async function getSurveyBySlug(slug: string): Promise<SurveyDetail> {
  const response = await apiClient.get<ApiResponse<{ survey: SurveyDetail }>>(
    `/surveys/slug/${slug}`,
  );
  return response.data.data.survey;
}

export async function updateSurvey(
  id: string,
  payload: UpdateSurveyPayload,
): Promise<SurveyDetail> {
  const response = await apiClient.patch<ApiResponse<{ survey: SurveyDetail }>>(
    `/surveys/${id}`,
    payload,
  );
  return response.data.data.survey;
}

export async function deleteSurvey(id: string): Promise<void> {
  await apiClient.delete(`/surveys/${id}`);
}