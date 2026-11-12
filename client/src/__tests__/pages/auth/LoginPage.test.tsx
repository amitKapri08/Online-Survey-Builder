import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/context/AuthProvider";
import { useAuth } from "@/context/useAuth";
import LoginPage from "@/pages/auth/LoginPage";
import { resetMockData } from "@/__tests__/mocks/handlers";

function AuthProbe() {
  const { user } = useAuth();
  return <output data-testid="auth-user">{user?.email ?? "no-user"}</output>;
}

function renderPage() {
  const user = userEvent.setup();
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  const view = render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter initialEntries={["/login"]}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<div>Register Route</div>} />
            <Route path="/dashboard" element={<div>Dashboard Route</div>} />
          </Routes>
        </MemoryRouter>
        <AuthProbe />
      </AuthProvider>
    </QueryClientProvider>,
  );
  return { user, queryClient, ...view };
}

describe("LoginPage", () => {
  beforeEach(() => {
    resetMockData();
  });

  it("renders the login heading and form fields", () => {
    renderPage();
    expect(screen.getByText("Welcome back!")).toBeInTheDocument();
    expect(screen.getByLabelText("Email address")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByText("Remember me")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Sign in to Dashboard" }),
    ).toBeInTheDocument();
  });

  it("shows validation errors on empty submit", async () => {
    const { user } = renderPage();
    await user.click(screen.getByRole("button", { name: "Sign in to Dashboard" }));

    expect(
      await screen.findByText("Please enter a valid email address"),
    ).toBeInTheDocument();
    expect(screen.getByText("Password is required")).toBeInTheDocument();
  });

  it("shows a server error for invalid credentials", async () => {
    const { user } = renderPage();
    await user.type(screen.getByLabelText("Email address"), "nobody@test.com");
    await user.type(screen.getByLabelText("Password"), "WrongPass123!");
    await user.click(screen.getByRole("button", { name: "Sign in to Dashboard" }));

    expect(
      await screen.findByText("Invalid email or password."),
    ).toBeInTheDocument();
    expect(screen.getByTestId("auth-user")).toHaveTextContent("no-user");
  });

  it("logs the user in and updates auth state with valid credentials", async () => {
    const { user } = renderPage();
    await user.type(screen.getByLabelText("Email address"), "me@test.com");
    await user.type(screen.getByLabelText("Password"), "Password@123");
    await user.click(screen.getByRole("button", { name: "Sign in to Dashboard" }));

    await waitFor(() =>
      expect(screen.getByTestId("auth-user")).toHaveTextContent("me@test.com"),
    );
  });

  it("toggles the password visibility", async () => {
    const { user } = renderPage();
    const passwordInput = screen.getByLabelText("Password");

    await user.click(screen.getByRole("button", { name: "Show password" }));
    expect(passwordInput).toHaveAttribute("type", "text");

    await user.click(screen.getByRole("button", { name: "Hide password" }));
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("links to the register page", async () => {
    const { user } = renderPage();
    await user.click(screen.getByText("Sign up"));
    expect(screen.getByText("Register Route")).toBeInTheDocument();
  });
});