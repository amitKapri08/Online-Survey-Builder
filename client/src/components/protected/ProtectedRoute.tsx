import { Navigate, Outlet, useLocation } from "react-router-dom";

import { Loader } from "@/components/ui/loader";
import { useAuth } from "@/context/useAuth";
import { ROUTES } from "@/lib/routes";

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <Loader variant="fullscreen" />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location }} />;
  }

  return <Outlet />;
}
