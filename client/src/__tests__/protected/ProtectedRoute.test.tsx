import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "@/components/protected/ProtectedRoute";
import { AuthContext, type AuthContextType } from "@/context/AuthContext";
import type { User } from "@/services/auth.service";

function makeAuthValue(overrides: Partial<AuthContextType>): AuthContextType {
  return {
    user: null,
    isLoading: false,
    isAuthenticated: false,
    setUser: () => {},
    initializeAuth: () => {},
    ...overrides,
  };
}

function authUser(overrides: Partial<User> = {}): User {
  return {
    id: "u1",
    name: "Test User",
    email: "test@test.com",
    role: "USER",
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  } as User;
}

function renderProtectedRoute(authValue: AuthContextType, initialEntry = "/dashboard") {
  return render(
    <AuthContext.Provider value={authValue}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<div>Dashboard Content</div>} />
          </Route>
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe("ProtectedRoute", () => {
  it("renders the outlet when authenticated", () => {
    renderProtectedRoute(
      makeAuthValue({ user: authUser(), isAuthenticated: true, isLoading: false }),
    );
    expect(screen.getByText("Dashboard Content")).toBeInTheDocument();
  });

  it("shows a loader while auth state is still loading", () => {
    renderProtectedRoute(
      makeAuthValue({ user: null, isAuthenticated: false, isLoading: true }),
    );
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("redirects unauthenticated users to login", () => {
    renderProtectedRoute(
      makeAuthValue({ user: null, isAuthenticated: false, isLoading: false }),
    );
    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });
});