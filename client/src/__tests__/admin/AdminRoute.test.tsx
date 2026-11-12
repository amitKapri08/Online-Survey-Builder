import { render, screen } from "@testing-library/react";
import {
  MemoryRouter,
  Route,
  Routes,
  type MemoryRouterProps,
} from "react-router-dom";
import { describe, expect, it } from "vitest";

import { AdminRoute } from "@/components/protected/AdminRoute";
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

function adminUser(role: "USER" | "ADMIN"): User {
  return {
    id: "user-1",
    name: "Test User",
    email: "test@test.com",
    role,
    createdAt: "2026-01-01T00:00:00.000Z",
  } as User;
}

function renderAdminRoute(authValue: AuthContextType) {
  const initialEntries: MemoryRouterProps["initialEntries"] = ["/admin"];
  return render(
    <AuthContext.Provider value={authValue}>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<div>Admin Home</div>} />
          </Route>
          <Route path="/dashboard" element={<div>Dashboard</div>} />
          <Route path="/login" element={<div>Login</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe("AdminRoute", () => {
  it("renders children for an admin user", () => {
    renderAdminRoute(
      makeAuthValue({
        user: adminUser("ADMIN"),
        isAuthenticated: true,
        isLoading: false,
      }),
    );
    expect(screen.getByText("Admin Home")).toBeInTheDocument();
  });

  it("shows a loader while auth state is loading", () => {
    renderAdminRoute(
      makeAuthValue({
        user: null,
        isAuthenticated: false,
        isLoading: true,
      }),
    );
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("redirects a regular user to the dashboard", () => {
    renderAdminRoute(
      makeAuthValue({
        user: adminUser("USER"),
        isAuthenticated: true,
        isLoading: false,
      }),
    );
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.queryByText("Admin Home")).not.toBeInTheDocument();
  });

  it("redirects an unauthenticated visitor to the login page", () => {
    renderAdminRoute(
      makeAuthValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      }),
    );
    expect(screen.getByText("Login")).toBeInTheDocument();
  });
});