import * as React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { AUTH_LOGIN_PATH } from "@/lib/routeHelpers";

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to={AUTH_LOGIN_PATH} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
