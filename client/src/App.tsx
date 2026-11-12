import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { ErrorBoundary } from "@/components/error-boundary/ErrorBoundary";
import {
  AdminRoute,
  ProtectedRoute,
  PublicOnlyRoute,
} from "@/components/protected";
import { Loader } from "@/components/ui/loader";
import { Toaster } from "@/components/ui/sonner";
import { ROUTES } from "@/lib/routes";

const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/auth/RegisterPage"));
const DashboardPage = lazy(() => import("@/pages/dashboard/DashboardPage"));
const SurveyListPage = lazy(() => import("@/pages/surveys/SurveyListPage"));
const CreateSurveyPage = lazy(
  () => import("@/pages/surveys/CreateSurveyPage"),
);
const EditSurveyPage = lazy(() => import("@/pages/surveys/EditSurveyPage"));
const AdminPage = lazy(() => import("@/pages/admin/AdminPage"));
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
              <Route path={ROUTES.SURVEYS} element={<SurveyListPage />} />
              <Route
                path={ROUTES.SURVEY_CREATE}
                element={<CreateSurveyPage />}
              />
              <Route path={ROUTES.SURVEY_EDIT} element={<EditSurveyPage />} />
              <Route element={<AdminRoute />}>
                <Route path={ROUTES.ADMIN} element={<AdminPage />} />
              </Route>
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
