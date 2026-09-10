import { describe, expect, it, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  useSurveys,
  useSurvey,
  usePublicSurvey,
  useCreateSurvey,
  useUpdateSurvey,
  useDeleteSurvey,
  useSubmitResponse,
  useSurveyResponses,
  useSurveyAnalytics,
  useDuplicateSurvey,
} from "@/hooks/useSurveyApi";
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

describe("useSurveyApi hooks", () => {
  it("useSurveys returns a list of surveys", async () => {
    const { result } = renderHook(() => useSurveys({ page: 1, limit: 10 }), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.surveys.length).toBeGreaterThan(0);
  });

  it("useSurvey returns a survey detail", async () => {
    const { result } = renderHook(() => useSurvey("survey-1"), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.id).toBe("survey-1");
  });

  it("useSurvey is disabled without an id", async () => {
    const { result } = renderHook(() => useSurvey(""), {
      wrapper: createWrapper(),
    });
    expect(result.current.isPending).toBe(true);
  });

  it("usePublicSurvey returns a public survey", async () => {
    const { result } = renderHook(() => usePublicSurvey("my-published-survey"), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.slug).toBe("my-published-survey");
  });

  it("useCreateSurvey creates a survey", async () => {
    const { result } = renderHook(() => useCreateSurvey(), {
      wrapper: createWrapper(),
    });

    const survey = await act(() => {
      return result.current.mutateAsync({ title: "Fresh Survey" });
    });

    expect(survey.title).toBe("Fresh Survey");
  });

  it("useUpdateSurvey updates a survey", async () => {
    const { result } = renderHook(() => useUpdateSurvey(), {
      wrapper: createWrapper(),
    });
    await act(async () => {
      await result.current.mutateAsync({
        id: "survey-1",
        payload: { title: "New Title" },
      });
    });
    expect(result.current.data?.title).toBe("New Title");
  });

  it("useDeleteSurvey deletes a survey", async () => {
    const { result } = renderHook(() => useDeleteSurvey(), {
      wrapper: createWrapper(),
    });
    await act(async () => {
      await result.current.mutateAsync("survey-2");
    });
    expect(result.current.isSuccess).toBe(true);
  });

  it("useDuplicateSurvey duplicates a survey", async () => {
    const { result } = renderHook(() => useDuplicateSurvey(), {
      wrapper: createWrapper(),
    });
    await act(async () => {
      await result.current.mutateAsync("survey-1");
    });
    expect(result.current.isSuccess).toBe(true);
  });

  it("useSubmitResponse records a response", async () => {
    const { result } = renderHook(() => useSubmitResponse(), {
      wrapper: createWrapper(),
    });
    await act(async () => {
      await result.current.mutateAsync({
        surveyId: "survey-1",
        payload: { answers: [{ questionId: "q-1", value: "Alice" }] },
      });
    });
    expect(result.current.isSuccess).toBe(true);
  });

  it("useSurveyResponses returns response pages", async () => {
    const { result } = renderHook(() => useSurveyResponses("survey-1"), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.total).toBe(1);
  });

  it("useSurveyAnalytics returns analytics", async () => {
    const { result } = renderHook(() => useSurveyAnalytics("survey-1"), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.length).toBeGreaterThan(0);
  });
});