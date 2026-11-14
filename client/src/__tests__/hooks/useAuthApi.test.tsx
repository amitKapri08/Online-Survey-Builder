import { describe, expect, it, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  useLogin,
  useLogout,
  useMe,
  useUpdateProfile,
  useRegister,
  useChangePassword,
} from "@/hooks/useAuthApi";
import { setStoredCsrfToken } from "@/api/csrf";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

beforeEach(() => {
  setStoredCsrfToken("mock-csrf-token");
});

describe("useAuthApi hooks", () => {
  it("useMe returns the current user", async () => {
    const { result } = renderHook(() => useMe(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.id).toBe("user-1");
    expect(result.current.data?.name).toBe("Me User");
  });

  it("useLogin succeeds with valid credentials", async () => {
    const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() });

    const data = await act(() => {
      return result.current.mutateAsync({
        email: "me@test.com",
        password: "Password@123",
      });
    });

    expect(data.data.user.id).toBe("user-1");
  });

  it("useLogin fails with invalid credentials", async () => {
    const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() });

    let rejected = false;
    await act(async () => {
      try {
        await result.current.mutateAsync({
          email: "wrong@test.com",
          password: "Password@123",
        });
      } catch {
        rejected = true;
      }
    });

    expect(rejected).toBe(true);
    expect(
      await waitFor(() => {
        if (!result.current.isError) throw new Error("not errored yet");
        return true;
      }),
    ).toBe(true);
  });

  it("useRegister creates a new user", async () => {
    const { result } = renderHook(() => useRegister(), { wrapper: createWrapper() });

    const data = await act(() => {
      return result.current.mutateAsync({
        name: "Jane Doe",
        email: "jane@example.com",
        password: "Password@123",
        termsAccepted: true,
      });
    });

    expect(data.data.user.email).toBe("jane@example.com");
  });

  it("useLogout resolves without error", async () => {
    const { result } = renderHook(() => useLogout(), { wrapper: createWrapper() });
    await act(async () => {
      await result.current.mutateAsync();
    });
    expect(result.current.isSuccess).toBe(true);
  });

  it("useUpdateProfile returns the updated user", async () => {
    const { result } = renderHook(() => useUpdateProfile(), { wrapper: createWrapper() });
    await act(async () => {
      await result.current.mutateAsync({ name: "Updated Name" });
    });
    expect(result.current.data?.name).toBe("Updated Name");
  });

  it("useChangePassword resolves without error", async () => {
    const { result } = renderHook(() => useChangePassword(), { wrapper: createWrapper() });
    await act(async () => {
      await result.current.mutateAsync({
        currentPassword: "Current@123",
        newPassword: "NewPass@123",
      });
    });
    expect(result.current.isSuccess).toBe(true);
  });
});