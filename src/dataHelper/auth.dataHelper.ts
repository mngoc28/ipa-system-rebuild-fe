export type AuthRole = "Staff" | "Manager" | "Director" | "Admin";

export interface JwtPayload {
  exp?: number;
  sub?: string;
  role?: string;
  fullName?: string;
  [key: string]: unknown;
}

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  roles: string[];
  permissions: string[];
  unit?: { id: string };
  status?: string;
  locked?: boolean;
}

export interface LoginPayload {
  usernameOrEmail: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: AuthUser;
}

export interface RefreshTokenResponse {
  data: {
    accessToken: string;
    expiresIn: number;
  };
}

export interface ChangePasswordFirstTimePayload {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}
