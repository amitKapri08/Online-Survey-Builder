import { createContext } from "react";
import type { User } from "@/services/auth.service";

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  initializeAuth: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);
