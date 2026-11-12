import { Navigate, Outlet } from "react-router-dom";

import { Loader } from "@/components/ui/loader";
import { useAuth } from "@/context/useAuth";
import { ROUTES } from "@/lib/routes";

export function AdminRoute() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Loader variant="fullscreen" />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (user?.role !== "ADMIN") {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return <Outlet />;
}