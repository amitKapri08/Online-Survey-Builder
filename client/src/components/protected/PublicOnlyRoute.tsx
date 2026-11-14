import { Navigate, Outlet, useLocation } from "react-router-dom";

import { Loader } from "@/components/ui/loader";
import { useAuth } from "@/context/useAuth";
import { getPostAuthRedirect } from "@/lib/authRedirect";

export function PublicOnlyRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <Loader variant="fullscreen" />;
  }

  if (isAuthenticated) {
    return <Navigate to={getPostAuthRedirect(location.state)} replace />;
  }

  return <Outlet />;
}
