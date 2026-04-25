import { JwtPayload } from "@/dataHelper/auth.dataHelper";
import { getRefreshToken, setAccessToken } from "./storage";
import { authApi } from "@/api/authApi";
import { TOKEN_EXPIRATION_BUFFER_MS, TOKEN_REFRESH_THRESHOLD_MINUTES } from "@/constant";
import { useAuthStore } from "@/store/useAuthStore";

/**
 * Safely decodes a JWT string to retrieve its JSON payload.
 * Does not verify the signature.
 * @param token - The JWT token to decode.
 * @returns The decoded payload object or null if formatting is invalid.
 */
export const decodeToken = (token: string): JwtPayload | null => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded) as JwtPayload;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

/**
 * Heuristic check to determine if a string looks like a valid JWT with an expiration.
 * @param token - The candidate string.
 * @returns true if it appears to be a valid JWT.
 */
export const isJwtToken = (token: string | null): boolean => {
  if (!token) {
    return false;
  }

  const payload = decodeToken(token);
  return Boolean(payload && payload.exp);
};

/**
 * Checks if a JWT is expired or within the dangerous expiration buffer.
 * @param token - JWT token string.
 * @returns true if token is missing, malformed, or past its expiration window.
 */
export const isTokenExpired = (token: string | null): boolean => {
  if (!token) {
    return true;
  }

  const payload = decodeToken(token);
  if (!payload || !payload.exp) {
    return true;
  }

  const expirationTime = payload.exp * 1000;
  const currentTime = Date.now();
  return currentTime >= expirationTime - TOKEN_EXPIRATION_BUFFER_MS;
};

/**
 * Extracts the absolute expiration timestamp from a JWT.
 * @param token - The JWT string.
 * @returns Expiration time in milliseconds, or null if unavailable.
 */
export const getTokenExpirationTime = (token: string | null): number | null => {
  if (!token) {
    return null;
  }

  const payload = decodeToken(token);
  if (!payload || !payload.exp) {
    return null;
  }

  return payload.exp * 1000;
};

/**
 * Calculates the remaining lifespan of the token in milliseconds.
 * @param token - The JWT string.
 * @returns Remaining time, or 0 if already expired, or null if invalid.
 */
export const getTimeUntilExpiration = (token: string | null): number | null => {
  const expirationTime = getTokenExpirationTime(token);
  if (!expirationTime) {
    return null;
  }

  const timeUntilExpiration = expirationTime - Date.now();
  return timeUntilExpiration > 0 ? timeUntilExpiration : 0;
};

/**
 * Attempts to obtain a new access token using the stored refresh token.
 * This function interacts with both the low-level API and the global auth store.
 * @returns Promise<string | null> - The new access token, or null on failure.
 */
export const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const refreshToken = getRefreshToken();

    if (!refreshToken || !isJwtToken(refreshToken)) {
      return null;
    }

    const response = await authApi.refresh(refreshToken);

    const newAccessToken = response?.accessToken;

    if (newAccessToken) {
      setAccessToken(newAccessToken);
      useAuthStore.getState().setToken(newAccessToken);
      return newAccessToken;
    }

    return null;
  } catch (error) {
    console.error("Error refreshing token:", error);
    return null;
  }
};

/**
 * Determines if a token has entered its proactive refresh window.
 * @param token - The JWT string to evaluate.
 * @param thresholdMinutes - How many minutes before expiry to consider a refresh 'due'.
 * @returns true if proactive refresh is recommended.
 */
export const shouldRefreshToken = (token: string | null, thresholdMinutes: number = TOKEN_REFRESH_THRESHOLD_MINUTES): boolean => {
  if (!token) {
    return false;
  }

  const timeUntilExpiration = getTimeUntilExpiration(token);
  if (!timeUntilExpiration) {
    return false;
  }

  const thresholdMs = thresholdMinutes * 60 * 1000;
  return timeUntilExpiration <= thresholdMs && timeUntilExpiration > 0;
};
