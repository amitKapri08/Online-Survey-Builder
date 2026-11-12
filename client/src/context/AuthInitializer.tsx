import { useEffect, type ReactNode } from "react";

import { useCsrf, useMe } from "@/hooks/useAuthApi";
import { useAuth } from "@/context/useAuth";
import { Loader } from "@/components/ui/loader";

interface AuthInitializerProps {
  children: ReactNode;
}

export function AuthInitializer({ children }: AuthInitializerProps) {
  const { setUser, initializeAuth } = useAuth();

  const csrfQuery = useCsrf();
  const meQuery = useMe();

  const isInitializing = csrfQuery.isPending || meQuery.isPending;

  useEffect(() => {
    if (meQuery.isSuccess) {
      setUser(meQuery.data);
    } else if (meQuery.isError) {
      setUser(null);
    }

    if (!isInitializing && !csrfQuery.isError) {
      initializeAuth();
    }
  }, [
    meQuery.isSuccess,
    meQuery.isError,
    meQuery.data,
    isInitializing,
    csrfQuery.isError,
    setUser,
    initializeAuth,
  ]);

  if (isInitializing) {
    return <Loader variant="fullscreen" label="Initializing application" />;
  }

  if (csrfQuery.isError) {
    return (
      <div
        role="alert"
        className="flex min-h-screen items-center justify-center bg-muted px-4"
      >
        <div className="w-full max-w-sm space-y-3 rounded-2xl border border-danger-200 bg-card p-6 text-center text-sm text-danger-700 shadow-sm">
          <p className="font-medium">Unable to load security token</p>
          <p className="text-danger-600/80">
            Please refresh the page. If the issue persists, contact support.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
