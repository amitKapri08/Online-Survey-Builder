import apiClient from "@/api/axios";
import type { ApiResponse } from "@/types/api";
import type {
  PublicSurvey,
  SubmitResponsePayload,
  SurveyDetail,
  SurveyListResponse,
  SurveyQuestion,
  SurveyQuestionOption,
  CreateSurveyPayload,
  UpdateSurveyPayload,
  CreateQuestionPayload,
  UpdateQuestionPayload,
  CreateOptionPayload,
  UpdateOptionPayload,
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

export async function getSurveyBySlug(slug: string): Promise<PublicSurvey> {
  const response = await apiClient.get<ApiResponse<{ survey: PublicSurvey }>>(
    `/surveys/slug/${slug}`,
  );
  return response.data.data.survey;
}

export async function recordSurveyView(surveyId: string): Promise<void> {
  await apiClient.post(`/surveys/${surveyId}/view`);
}

export async function submitResponse(
  surveyId: string,
  payload: SubmitResponsePayload,
): Promise<{ id: string; surveyId: string; createdAt: string }> {
  const response = await apiClient.post<
    ApiResponse<{
      response: { id: string; surveyId: string; createdAt: string };
    }>
  >(`/surveys/${surveyId}/responses`, payload);
  return response.data.data.response;
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

export async function createQuestion(
  surveyId: string,
  payload: CreateQuestionPayload,
): Promise<SurveyQuestion> {
  const response = await apiClient.post<
    ApiResponse<{ question: SurveyQuestion }>
  >(`/surveys/${surveyId}/questions`, payload);
  return response.data.data.question;
}

export async function updateQuestion(
  surveyId: string,
  questionId: string,
  payload: UpdateQuestionPayload,
): Promise<SurveyQuestion> {
  const response = await apiClient.patch<
    ApiResponse<{ question: SurveyQuestion }>
  >(`/surveys/${surveyId}/questions/${questionId}`, payload);
  return response.data.data.question;
}

export async function deleteQuestion(
  surveyId: string,
  questionId: string,
): Promise<void> {
  await apiClient.delete(`/surveys/${surveyId}/questions/${questionId}`);
}

export async function reorderQuestions(
  surveyId: string,
  questionIds: string[],
): Promise<void> {
  await apiClient.patch(`/surveys/${surveyId}/questions/reorder`, {
    questionIds,
  });
}

export async function createOption(
  surveyId: string,
  questionId: string,
  payload: CreateOptionPayload,
): Promise<SurveyQuestionOption> {
  const response = await apiClient.post<
    ApiResponse<{ option: SurveyQuestionOption }>
  >(`/surveys/${surveyId}/questions/${questionId}/options`, payload);
  return response.data.data.option;
}

export async function updateOption(
  surveyId: string,
  questionId: string,
  optionId: string,
  payload: UpdateOptionPayload,
): Promise<SurveyQuestionOption> {
  const response = await apiClient.patch<
    ApiResponse<{ option: SurveyQuestionOption }>
  >(`/surveys/${surveyId}/questions/${questionId}/options/${optionId}`, payload);
  return response.data.data.option;
}

export async function deleteOption(
  surveyId: string,
  questionId: string,
  optionId: string,
): Promise<void> {
  await apiClient.delete(
    `/surveys/${surveyId}/questions/${questionId}/options/${optionId}`,
  );
}