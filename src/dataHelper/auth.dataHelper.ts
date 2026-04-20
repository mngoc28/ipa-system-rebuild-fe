/**
 * Roles available for authentication.
 */
export type AuthRole = "Staff" | "Manager" | "Director" | "Admin";

/**
 * Payload extracted from a decoded JWT token.
 */
export interface JwtPayload {
  /** Expiration time (seconds since epoch) */
  exp?: number;
  /** Subject (usually user ID) */
  sub?: string;
  /** Assigned user role */
  role?: string;
  /** Full name of the user */
  fullName?: string;
  [key: string]: unknown;
}

/**
 * User object returned upon authentication.
 */
export interface AuthUser {
  /** Unique user identifier */
  id: string;
  /** Login username */
  username?: string;
  /** Full name (camelCase) */
  fullName?: string;
  /** Full name (snake_case) - Used for API compatibility */
  full_name?: string; 
  /** User email address */
  email: string;
  /** Contact phone number */
  phone?: string;
  /** List of role codes assigned to the user */
  role_codes: string[];
  /** List of permission codes granted to the user */
  permission_codes: string[];
  /** Unit/Department information */
  unit?: { 
    id: string | number;
    unit_name?: string;
    name?: string;
  };
  /** Current account status */
  status?: string | number;
  /** Whether the account is locked */
  locked?: boolean;
  /** URL to user's avatar image (from Cloudinary or local) */
  avatar_url?: string;
  /** Legacy avatar field */
  avatar?: string;
}

/**
 * Payload required for the login request.
 */
export interface LoginPayload {
  /** Username or email address */
  usernameOrEmail: string;
  /** User password */
  password: string;
}

/**
 * Response structure returned after a successful login.
 */
export interface LoginResponse {
  /** Access token for API authorization */
  accessToken: string;
  /** Refresh token for renewing the access token */
  refreshToken: string;
  /** Token expiration time in seconds */
  expiresIn: number;
  /** Authenticated user details */
  user: AuthUser;
}

/**
 * Response structure for token refresh requests.
 */
export interface RefreshTokenResponse {
  data: {
    /** New access token */
    accessToken: string;
    /** New expiration time */
    expiresIn: number;
  };
}

/**
 * Payload for changing password for the first time.
 */
export interface ChangePasswordFirstTimePayload {
  /** Current password */
  oldPassword: string;
  /** New password to be set */
  newPassword: string;
  /** Confirmation of the new password */
  confirmPassword: string;
}
