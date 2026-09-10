import { describe, expect, it } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useUserDashboard } from "@/hooks/useUserApi";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe("useUserApi hooks", () => {
  it("useUserDashboard returns dashboard data", async () => {
    const { result } = renderHook(() => useUserDashboard(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.stats.totalSurveys).toBe(3);
    expect(result.current.data?.recentSurveys.length).toBeGreaterThan(0);
  });
});