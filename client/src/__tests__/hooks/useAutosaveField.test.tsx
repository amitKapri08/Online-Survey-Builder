import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type { ReactNode } from "react";
import { BuilderSaveProvider } from "../../hooks/useBuilderSave";
import { useAutosaveField } from "../../hooks/useAutosaveField";

function createWrapper() {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <BuilderSaveProvider>{children}</BuilderSaveProvider>;
  };
}

describe("useAutosaveField", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("debounces and saves regular values", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);

    const { result } = renderHook(
      () =>
        useAutosaveField<string>({
          resourceType: "survey",
          resourceId: "test-1",
          fieldName: "title",
          debounceMs: 300,
          onSave,
        }),
      { wrapper: createWrapper() },
    );

    act(() => {
      result.current.setValue("New Survey Title");
    });

    expect(onSave).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith("New Survey Title");
  });

  it("correctly saves null when field value is cleared to null", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);

    const { result } = renderHook(
      () =>
        useAutosaveField<number | null>({
          resourceType: "question",
          resourceId: "q-1",
          fieldName: "minValue",
          debounceMs: 300,
          onSave,
        }),
      { wrapper: createWrapper() },
    );

    act(() => {
      result.current.setValue(null);
    });

    expect(onSave).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith(null);
  });

  it("flushes pending value immediately", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);

    const { result } = renderHook(
      () =>
        useAutosaveField<string | null>({
          resourceType: "survey",
          resourceId: "test-1",
          fieldName: "description",
          debounceMs: 500,
          onSave,
        }),
      { wrapper: createWrapper() },
    );

    act(() => {
      result.current.setValue("Pending Description");
    });

    expect(onSave).not.toHaveBeenCalled();

    await act(async () => {
      await result.current.flush();
    });

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith("Pending Description");
  });
});
