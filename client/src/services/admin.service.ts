import apiClient from "@/api/axios";
import type { ApiResponse } from "@/types/api";
import type {
  AdminAuditLogsResponse,
  AdminStats,
  AdminSurvey,
  AdminUser,
} from "@/types/admin";

export async function getAdminUsers(params: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<{
  users: AdminUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.search) query.set("search", params.search);

  const response = await apiClient.get<ApiResponse<{
    users: AdminUser[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>>(`/admin/users?${query.toString()}`);
  return response.data.data;
}

export async function getAdminSurveys(params: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}): Promise<{
  surveys: AdminSurvey[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.status) query.set("status", params.status);
  if (params.search) query.set("search", params.search);

  const response = await apiClient.get<ApiResponse<{
    surveys: AdminSurvey[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>>(`/admin/surveys?${query.toString()}`);
  return response.data.data;
}

export async function getAdminStats(): Promise<AdminStats> {
  const response = await apiClient.get<ApiResponse<{ stats: AdminStats }>>(
    "/admin/stats",
  );
  return response.data.data.stats;
}

export async function updateAdminUserRole(
  userId: string,
  role: "USER" | "ADMIN",
): Promise<AdminUser> {
  const response = await apiClient.patch<ApiResponse<{ user: AdminUser }>>(
    `/admin/users/${userId}/role`,
    { role },
  );
  return response.data.data.user;
}

export async function deleteAdminUser(userId: string): Promise<void> {
  await apiClient.delete(`/admin/users/${userId}`);
}

export async function getAdminAuditLogs(params: {
  page?: number;
  limit?: number;
}): Promise<AdminAuditLogsResponse> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));

  const response = await apiClient.get<ApiResponse<AdminAuditLogsResponse>>(
    `/admin/audit-logs?${query.toString()}`,
  );
  return response.data.data;
}