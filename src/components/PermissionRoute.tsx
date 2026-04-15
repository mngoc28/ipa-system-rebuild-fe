import * as React from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { AUTH_LOGIN_PATH, getDashboardPathForRole } from "@/lib/routeHelpers";

interface PermissionRouteProps {
  requiredCode: string;
  children: React.ReactNode;
}

const PermissionRoute: React.FC<PermissionRouteProps> = ({ requiredCode, children }) => {
  const { user } = useAuthStore();

  // Basic permission check - this will be enhanced as we build sub-functions
  const hasPermission = user?.permissions?.includes(requiredCode) || user?.role === "Admin";

  if (!hasPermission) {
    return <Navigate to={user ? getDashboardPathForRole(user.role) : AUTH_LOGIN_PATH} replace />;
  }

  return <>{children}</>;
};

export default PermissionRoute;
