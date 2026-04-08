import type { UserRole } from "@market-place/shared/api";
import { Navigate, Outlet } from "react-router-dom";

import { useAuthStore } from "@/store/authStore";

type RoleRouteProps = {
  allowedRoles: UserRole[];
  redirectTo?: string;
};

function RoleRoute({ allowedRoles, redirectTo = "/" }: RoleRouteProps) {
  const user = useAuthStore((state) => state.user);

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate replace to={redirectTo} />;
  }

  return <Outlet />;
}

export default RoleRoute;
