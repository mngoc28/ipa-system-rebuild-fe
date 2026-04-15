import type { UserRole } from "@/store/useAuthStore";

export const AUTH_LOGIN_PATH = "/auth/login";
export const AUTH_CHANGE_PASSWORD_PATH = "/auth/change-password";
export const PUBLIC_HOME_PATH = "/";
export const ADMIN_PORTAL_HOME_PATH = "/admin/dashboard";

export const getDashboardPathForRole = (role?: UserRole | null) => {
  if (role === "Admin") {
    return ADMIN_PORTAL_HOME_PATH;
  }

  return "/dashboard";
};

export const getLoginRedirectPath = (role?: UserRole | null) => getDashboardPathForRole(role);