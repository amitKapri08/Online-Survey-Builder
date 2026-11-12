import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getAdminUsers,
  getAdminSurveys,
  getAdminStats,
  getAdminAuditLogs,
  updateAdminUserRole,
  deleteAdminUser,
} from "@/services/admin.service";

export const adminKeys = {
  all: ["admin"] as const,
  users: (params?: Record<string, unknown>) =>
    params
      ? [...adminKeys.all, "users", params]
      : [...adminKeys.all, "users"] as const,
  surveys: (params?: Record<string, unknown>) =>
    params
      ? [...adminKeys.all, "surveys", params]
      : [...adminKeys.all, "surveys"] as const,
  stats: () => [...adminKeys.all, "stats"] as const,
  auditLogs: (params?: Record<string, unknown>) =>
    params
      ? [...adminKeys.all, "auditLogs", params]
      : [...adminKeys.all, "auditLogs"] as const,
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

export function useUpdateAdminUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: "USER" | "ADMIN" }) =>
      updateAdminUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
      queryClient.invalidateQueries({ queryKey: adminKeys.stats() });
    },
  });
}

export function useDeleteAdminUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => deleteAdminUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
      queryClient.invalidateQueries({ queryKey: adminKeys.stats() });
    },
  });
}

export function useAdminAuditLogs(params: {
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: adminKeys.auditLogs(params),
    queryFn: () => getAdminAuditLogs(params),
  });
}

