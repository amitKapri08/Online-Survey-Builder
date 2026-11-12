import { useCallback, useEffect, useRef } from "react";
import { useBuilderSave } from "./useBuilderSave";

export function useAutosaveField<T>({
  resourceType,
  resourceId,
  fieldName,
  debounceMs = 500,
  enabled = true,
  onSave,
}: {
  resourceType: "survey" | "question";
  resourceId: string;
  fieldName: string;
  debounceMs?: number;
  enabled?: boolean;
  onSave: (value: T) => Promise<void>;
}) {
  const { notifySaveStart, notifySaveEnd, registerPendingFlush, unregisterPendingFlush } =
    useBuilderSave();

  const saveKey = `${resourceType}:${resourceId}:${fieldName}`;

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingValueRef = useRef<T | null>(null);
  const pendingSavePromiseRef = useRef<Promise<void> | null>(null);
  const onSaveRef = useRef(onSave);

  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  const doSave = useCallback(
    async (value: T) => {
      notifySaveStart();
      const promise = onSaveRef
        .current(value)
        .then(() => {
          pendingSavePromiseRef.current = null;
          notifySaveEnd(true);
        })
        .catch(() => {
          pendingSavePromiseRef.current = null;
          notifySaveEnd(false);
        });
      pendingSavePromiseRef.current = promise;
      await promise;
    },
    [notifySaveStart, notifySaveEnd],
  );

  const setValue = useCallback(
    (value: T) => {
      if (!enabled) return;
      pendingValueRef.current = value;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        const latest = pendingValueRef.current;
        pendingValueRef.current = null;
        if (latest !== null) {
          void doSave(latest);
        }
      }, debounceMs);
    },
    [enabled, debounceMs, doSave],
  );

  const flush = useCallback(() => {
    const latest = pendingValueRef.current;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
      pendingValueRef.current = null;
    }
    if (latest !== null) {
      return doSave(latest);
    }
    return pendingSavePromiseRef.current ?? Promise.resolve();
  }, [doSave]);

  useEffect(() => {
    registerPendingFlush(saveKey, () => flush());
    return () => {
      unregisterPendingFlush(saveKey);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
        pendingValueRef.current = null;
      }
    };
  }, [saveKey, flush, registerPendingFlush, unregisterPendingFlush]);

  return { setValue, flush } as const;
}