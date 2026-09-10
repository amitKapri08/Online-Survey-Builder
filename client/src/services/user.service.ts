import apiClient from "@/api/axios";
import type { ApiResponse } from "@/types/api";
import type { UserDashboardData } from "@/types/dashboard";

export async function getUserDashboard(): Promise<UserDashboardData> {
  const response = await apiClient.get<ApiResponse<UserDashboardData>>(
    "/users/dashboard",
  );
  return response.data.data;
}
