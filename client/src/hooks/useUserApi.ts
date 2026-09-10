import { useQuery } from "@tanstack/react-query";
import { getUserDashboard } from "@/services/user.service";

export const userKeys = {
  all: ["user"] as const,
  dashboard: () => [...userKeys.all, "dashboard"] as const,
};

export function useUserDashboard() {
  return useQuery({
    queryKey: userKeys.dashboard(),
    queryFn: getUserDashboard,
  });
}
