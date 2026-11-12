import { describe, it, expect } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { AuthProvider } from "@/context/AuthProvider";
import { useAuth } from "@/context/useAuth";

function AuthProbe() {
  const { user, isAuthenticated, isLoading, initializeAuth, setUser } = useAuth();
  return (
    <div>
      <span data-testid="isLoading">{String(isLoading)}</span>
      <span data-testid="isAuthenticated">{String(isAuthenticated)}</span>
      <span data-testid="userName">{user?.name ?? "none"}</span>
      <button onClick={() => initializeAuth()}>init</button>
      <button onClick={() => setUser({ id: "u1", name: "Bob", email: "b@test.com", role: "USER" })}>
        set-user
      </button>
    </div>
  );
}

function renderProbe() {
  return render(
    <AuthProvider>
      <AuthProbe />
    </AuthProvider>,
  );
}

describe("AuthProvider", () => {
  it("starts with no user and isLoading true", () => {
    renderProbe();
    expect(screen.getByTestId("isLoading").textContent).toBe("true");
    expect(screen.getByTestId("isAuthenticated").textContent).toBe("false");
    expect(screen.getByTestId("userName").textContent).toBe("none");
  });

  it("initializeAuth sets isLoading to false", () => {
    renderProbe();
    act(() => {
      screen.getByText("init").click();
    });
    expect(screen.getByTestId("isLoading").textContent).toBe("false");
  });

  it("setUser makes the user authenticated", () => {
    renderProbe();
    act(() => {
      screen.getByText("set-user").click();
    });
    expect(screen.getByTestId("isAuthenticated").textContent).toBe("true");
    expect(screen.getByTestId("userName").textContent).toBe("Bob");
  });
});