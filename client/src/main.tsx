import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import App from "./App";
import { QueryClientProvider } from "@tanstack/react-query";

import { queryClient } from "./api/queryClient";
import { AuthInitializer } from "./context/AuthInitializer";
import { AuthProvider } from "./context/AuthProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AuthInitializer>
          <App />
        </AuthInitializer>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);
