/**
 * Roles available for authentication.
 */
export type AuthRole = "Staff" | "Manager" | "Director" | "Admin";

/**
 * Payload extracted from a decoded JWT token.
 */
export interface JwtPayload {
    exp?: number;
    sub?: string;
    role?: string;
    fullName?: string;
  [key: string]: unknown;
}

/**
 * User object returned upon authentication.
 */
export interface AuthUser {
    id: string;
    username?: string;
    fullName?: string;
    full_name?: string; 
    email: string;
    phone?: string;
    role_codes: string[];
    permission_codes: string[];
    unit?: { 
    id: string | number;
    unit_name?: string;
    name?: string;
  };
    status?: string | number;
    locked?: boolean;
    avatar_url?: string;
    avatar?: string;
}

/**
 * Payload required for the login request.
 */
export interface LoginPayload {
    usernameOrEmail: string;
    password: string;
}

/**
 * Response structure returned after a successful login.
 */
export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user: AuthUser;
}

/**
 * Response structure for token refresh requests.
 */
export interface RefreshTokenResponse {
  data: {
        accessToken: string;
        expiresIn: number;
  };
}

/**
 * Payload for changing password for the first time.
 */
export interface ChangePasswordFirstTimePayload {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
}

/**
 * Common application state returned by the init endpoint.
 */
export interface AppInitData {
    user: AuthUser;
    unreadCount: number;
    pendingApprovalsCount: number;
    masterData?: {
        users?: unknown[]; 
        roles?: unknown[];
        units?: unknown[];
        sectors?: unknown[];
        locations?: unknown[];
        countries?: unknown[];
    };
}
