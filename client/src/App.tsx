import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { ErrorBoundary } from "@/components/error-boundary/ErrorBoundary";
import { ProtectedRoute, PublicOnlyRoute } from "@/components/protected";
import { Loader } from "@/components/ui/loader";
import { Toaster } from "@/components/ui/sonner";
import { ROUTES } from "@/lib/routes";

const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/auth/RegisterPage"));
const DashboardPage = lazy(() => import("@/pages/dashboard/DashboardPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Suspense fallback={<Loader variant="fullscreen" />}>
          <Routes>
            <Route element={<PublicOnlyRoute />}>
              <Route path={ROUTES.LOGIN} element={<LoginPage />} />
              <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route
                path={ROUTES.HOME}
                element={<Navigate to={ROUTES.DASHBOARD} replace />}
              />
              <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;