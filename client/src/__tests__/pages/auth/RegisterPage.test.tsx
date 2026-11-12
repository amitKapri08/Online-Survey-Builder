import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/context/AuthProvider";
import { useAuth } from "@/context/useAuth";
import RegisterPage from "@/pages/auth/RegisterPage";
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
        <MemoryRouter initialEntries={["/register"]}>
          <Routes>
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<div>Login Route</div>} />
          </Routes>
        </MemoryRouter>
        <AuthProbe />
      </AuthProvider>
    </QueryClientProvider>,
  );
  return { user, queryClient, ...view };
}

const validName = "Jane Doe";
const validEmail = "jane@example.com";
const validPassword = "Password@123";

describe("RegisterPage", () => {
  beforeEach(() => {
    resetMockData();
  });

  it("renders the registration heading and form fields", () => {
    renderPage();
    expect(screen.getByText("Create your account")).toBeInTheDocument();
    expect(screen.getByLabelText("Full name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email address")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create account" })).toBeInTheDocument();
  });

  it("shows validation errors on empty submit", async () => {
    const { user } = renderPage();
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(
      await screen.findByText("Name must be at least 2 characters"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Please enter a valid email address"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Password must be at least 8 characters"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("You must accept the terms and privacy policy"),
    ).toBeInTheDocument();
  });

  it("shows a password mismatch error", async () => {
    const { user } = renderPage();
    await user.type(screen.getByLabelText("Password"), validPassword);
    await user.type(screen.getByLabelText("Confirm password"), "Different1!");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(await screen.findByText("Passwords do not match")).toBeInTheDocument();
  });

  it("shows the password strength meter while typing", async () => {
    const { user } = renderPage();
    await user.type(screen.getByLabelText("Password"), "abc");
    expect(await screen.findByText("Weak")).toBeInTheDocument();
    expect(screen.getByText("Password strength")).toBeInTheDocument();
  });

  it("registers a new account and updates auth state", async () => {
    const { user } = renderPage();
    await user.type(screen.getByLabelText("Full name"), validName);
    await user.type(screen.getByLabelText("Email address"), validEmail);
    await user.type(screen.getByLabelText("Password"), validPassword);
    await user.type(screen.getByLabelText("Confirm password"), validPassword);
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() =>
      expect(screen.getByTestId("auth-user")).toHaveTextContent(validEmail),
    );
  });

  it("links to the login page", async () => {
    const { user } = renderPage();
    await user.click(screen.getByText("Sign in"));
    expect(screen.getByText("Login Route")).toBeInTheDocument();
  });
});