import { useCallback, useMemo, useState, type ReactNode } from "react";

import type { User } from "@/services/auth.service";
import { AuthContext } from "./AuthContext";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const initializeAuth = useCallback(() => {
    setIsLoading(false);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: user !== null,
      setUser,
      initializeAuth,
    }),
    [user, isLoading, initializeAuth],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
