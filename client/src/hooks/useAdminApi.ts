import { useQuery } from "@tanstack/react-query";

import {
  getAdminUsers,
  getAdminSurveys,
  getAdminStats,
} from "@/services/admin.service";

export const adminKeys = {
  all: ["admin"] as const,
  users: (params?: Record<string, unknown>) =>
    [...adminKeys.all, "users", params] as const,
  surveys: (params?: Record<string, unknown>) =>
    [...adminKeys.all, "surveys", params] as const,
  stats: () => [...adminKeys.all, "stats"] as const,
};

export function useAdminUsers(params: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  return useQuery({
    queryKey: adminKeys.users(params),
    queryFn: () => getAdminUsers(params),
  });
}

export function useAdminSurveys(params: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: adminKeys.surveys(params),
    queryFn: () => getAdminSurveys(params),
  });
}

export function useAdminStats() {
  return useQuery({
    queryKey: adminKeys.stats(),
    queryFn: getAdminStats,
  });
}
