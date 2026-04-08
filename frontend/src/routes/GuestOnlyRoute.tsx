import type { UserRole } from "@market-place/shared/api";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuthStore } from "@/store/authStore";

type GuestOnlyRouteProps = {
  allowedRole?: UserRole;
  fallbackTo?: string;
};

function GuestOnlyRoute({ allowedRole, fallbackTo = "/" }: GuestOnlyRouteProps) {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  if (!token) {
    return <Outlet />;
  }

  if (allowedRole && user?.role !== allowedRole) {
    return <Navigate replace state={{ from: location }} to={fallbackTo} />;
  }

  if (user?.role === "ADMIN") {
    return <Navigate replace state={{ from: location }} to="/admin" />;
  }

  if (user?.role === "SELLER") {
    return <Navigate replace state={{ from: location }} to="/seller" />;
  }

  return <Navigate replace state={{ from: location }} to="/account" />;
}

export default GuestOnlyRoute;
