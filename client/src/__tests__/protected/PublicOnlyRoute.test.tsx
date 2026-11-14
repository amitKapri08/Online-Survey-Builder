import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { PublicOnlyRoute } from "@/components/protected/PublicOnlyRoute";
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

function authUser(): User {
  return {
    id: "u1",
    name: "Test User",
    email: "test@test.com",
    role: "USER",
    createdAt: "2026-01-01T00:00:00.000Z",
  } as User;
}

function renderPublicOnlyRoute(
  authValue: AuthContextType,
  initialEntry: string | { pathname: string; state?: unknown } = "/login",
) {
  return render(
    <AuthContext.Provider value={authValue}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<div>Login Form</div>} />
          </Route>
          <Route path="/dashboard" element={<div>Dashboard Page</div>} />
          <Route path="/s/:slug" element={<div>Survey Page</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe("PublicOnlyRoute", () => {
  it("renders the outlet for unauthenticated visitors", () => {
    renderPublicOnlyRoute(
      makeAuthValue({ user: null, isAuthenticated: false, isLoading: false }),
    );
    expect(screen.getByText("Login Form")).toBeInTheDocument();
  });

  it("shows a loader while auth state is loading", () => {
    renderPublicOnlyRoute(
      makeAuthValue({ user: null, isAuthenticated: false, isLoading: true }),
    );
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("redirects authenticated users to the dashboard", () => {
    renderPublicOnlyRoute(
      makeAuthValue({ user: authUser(), isAuthenticated: true, isLoading: false }),
    );
    expect(screen.getByText("Dashboard Page")).toBeInTheDocument();
    expect(screen.queryByText("Login Form")).not.toBeInTheDocument();
  });

  it("redirects authenticated users back to the requested page", () => {
    renderPublicOnlyRoute(
      makeAuthValue({ user: authUser(), isAuthenticated: true, isLoading: false }),
      {
        pathname: "/login",
        state: { from: { pathname: "/s/my-survey" } },
      },
    );
    expect(screen.getByText("Survey Page")).toBeInTheDocument();
    expect(screen.queryByText("Dashboard Page")).not.toBeInTheDocument();
  });
});