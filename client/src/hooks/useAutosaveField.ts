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
  const pendingRef = useRef<{ value: T } | null>(null);
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
      pendingRef.current = { value };
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        const pending = pendingRef.current;
        pendingRef.current = null;
        if (pending !== null) {
          void doSave(pending.value);
        }
      }, debounceMs);
    },
    [enabled, debounceMs, doSave],
  );

  const flush = useCallback(() => {
    const pending = pendingRef.current;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
      pendingRef.current = null;
    }
    if (pending !== null) {
      return doSave(pending.value);
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
        pendingRef.current = null;
      }
    };
  }, [saveKey, flush, registerPendingFlush, unregisterPendingFlush]);

  return { setValue, flush } as const;
}