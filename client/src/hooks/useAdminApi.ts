import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getAdminUsers,
  getAdminSurveys,
  getAdminStats,
  updateAdminUserRole,
  deleteAdminUser,
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
