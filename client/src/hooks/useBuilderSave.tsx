/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

interface BuilderSaveContextValue {
  lastSavedAt: Date | null;
  isSaving: boolean;
  saveStatus: SaveStatus;
  notifySaveStart: () => void;
  notifySaveEnd: (success: boolean) => void;
  flushPendingSaves: () => Promise<void>;
  registerPendingFlush: (key: string, fn: () => Promise<void>) => void;
  unregisterPendingFlush: (key: string) => void;
}

const BuilderSaveContext = createContext<BuilderSaveContextValue | null>(null);

export function BuilderSaveProvider({ children }: { children: ReactNode }) {
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const inFlightCountRef = useRef(0);
  const pendingFlushRef = useRef<Map<string, () => Promise<void>>>(new Map());

  const notifySaveStart = useCallback(() => {
    inFlightCountRef.current += 1;
    setSaveStatus("saving");
  }, []);

  const notifySaveEnd = useCallback((success: boolean) => {
    inFlightCountRef.current = Math.max(0, inFlightCountRef.current - 1);
    if (success) {
      setLastSavedAt(new Date());
      setSaveStatus(inFlightCountRef.current > 0 ? "saving" : "saved");
    } else {
      setSaveStatus("error");
    }
  }, []);

  const registerPendingFlush = useCallback(
    (key: string, fn: () => Promise<void>) => {
      pendingFlushRef.current.set(key, fn);
    },
    [],
  );

  const unregisterPendingFlush = useCallback((key: string) => {
    pendingFlushRef.current.delete(key);
  }, []);

  const flushPendingSaves = useCallback(async () => {
    const fns = Array.from(pendingFlushRef.current.values());
    pendingFlushRef.current.clear();
    await Promise.allSettled(fns.map((fn) => fn()));
  }, []);

  const value = useMemo(
    () => ({
      lastSavedAt,
      isSaving: saveStatus === "saving",
      saveStatus,
      notifySaveStart,
      notifySaveEnd,
      flushPendingSaves,
      registerPendingFlush,
      unregisterPendingFlush,
    }),
    [
      lastSavedAt,
      saveStatus,
      notifySaveStart,
      notifySaveEnd,
      flushPendingSaves,
      registerPendingFlush,
      unregisterPendingFlush,
    ],
  );

  return (
    <BuilderSaveContext.Provider value={value}>
      {children}
    </BuilderSaveContext.Provider>
  );
}

export function useBuilderSave(): BuilderSaveContextValue {
  const context = useContext(BuilderSaveContext);
  if (!context) {
    throw new Error("useBuilderSave must be used within a BuilderSaveProvider");
  }
  return context;
}
