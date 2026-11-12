import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import App from "./App";
import { QueryClientProvider } from "@tanstack/react-query";

import { queryClient } from "./api/queryClient";
import { AuthInitializer } from "./context/AuthInitializer";
import { AuthProvider } from "./context/AuthProvider";
import { ThemeProvider } from "./context/ThemeContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="surveyhub-theme">
        <AuthProvider>
          <AuthInitializer>
            <App />
          </AuthInitializer>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
);
