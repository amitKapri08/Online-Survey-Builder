import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getCsrfToken,
  getMe,
  login,
  logout,
  register,
  type LoginPayload,
  type RegisterPayload,
} from "@/services/auth.service";

export const authKeys = {
  all: ["auth"] as const,
  me: () => [...authKeys.all, "me"] as const,
  csrf: () => [...authKeys.all, "csrf"] as const,
};

export function useMe(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: getMe,
    retry: false,
    refetchOnWindowFocus: false,
    ...options,
  });
}

export function useCsrf() {
  return useQuery({
    queryKey: authKeys.csrf(),
    queryFn: getCsrfToken,
    retry: false,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: (payload: LoginPayload) => login(payload),
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (payload: RegisterPayload) => register(payload),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,

    onSuccess: async () => {
      queryClient.removeQueries({
        queryKey: authKeys.me(),
      });

      await queryClient.refetchQueries({
        queryKey: authKeys.csrf(),
      });
    },
  });
}
