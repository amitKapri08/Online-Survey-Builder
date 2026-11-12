import { render, type RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactElement, type ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";
import type { User } from "@/services/auth.service";

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

export function renderWithProviders(
  ui: ReactElement,
  {
    route = "/admin",
    queryClient = createTestQueryClient(),
    ...renderOptions
  }: {
    route?: string;
    queryClient?: QueryClient;
  } & Omit<RenderOptions, "wrapper"> = {},
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
      </QueryClientProvider>
    );
  }

  return {
    queryClient,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

export function renderWithAuth(
  ui: ReactElement,
  {
    route = "/",
    user = null,
    setUser,
    ...renderOptions
  }: {
    route?: string;
    user?: User | null;
    setUser?: (user: User | null) => void;
  } & Omit<RenderOptions, "wrapper"> = {},
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={createTestQueryClient()}>
        <AuthContext.Provider
          value={{
            user,
            isLoading: false,
            isAuthenticated: user !== null,
            setUser: setUser ?? (() => {}),
            initializeAuth: () => {},
          }}
        >
          <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
        </AuthContext.Provider>
      </QueryClientProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}