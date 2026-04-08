import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuthStore } from "@/store/authStore";

type ProtectedRouteProps = {
  redirectTo?: string;
};

function ProtectedRoute({ redirectTo = "/login" }: ProtectedRouteProps) {
  const token = useAuthStore((state) => state.token);
  const location = useLocation();

  if (!token) {
    return <Navigate replace state={{ from: location }} to={redirectTo} />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
