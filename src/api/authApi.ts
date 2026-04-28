import axiosClient from "@/api/axiosClient";
import type { ChangePasswordFirstTimePayload, AuthUser, LoginPayload, LoginResponse } from "@/dataHelper/auth.dataHelper";
import { ApiEnvelope } from "@/types/api";

/**
 * API service for authentication-related operations.
 */
export const authApi = {
  /**
   * Performs user login with credentials.
   * @param payload - Username/email and password.
   * @returns Login response containing tokens and user information.
   */
  login: async (payload: LoginPayload) => {
    const response = await axiosClient.post<ApiEnvelope<LoginResponse>>("/api/v1/auth/login", payload);
    return response.data;
  },

  /**
   * Refreshes the access token using a valid refresh token.
   * @param refreshToken - The existing refresh token.
   * @returns New access token and expiration details.
   */
  refresh: async (refreshToken: string) => {
    const response = await axiosClient.post<ApiEnvelope<{ accessToken: string; expiresIn: number }>>("/api/v1/auth/refresh", {
      refreshToken,
    });
    return response.data;
  },

  /**
   * Fetches the current authenticated user's profile.
   * @returns The profile of the logged-in user.
   */
  me: async () => {
    const response = await axiosClient.get<ApiEnvelope<AuthUser>>("/api/v1/auth/me");
    return response.data;
  },

  /**
   * Initializes common application state (user profile + counts).
   */
  init: async () => {
    const response = await axiosClient.get<ApiEnvelope<{ user: AuthUser; unreadCount: number; pendingApprovalsCount: number }>>("/api/v1/auth/init");
    return response.data;
  },

  /**
   * invalidates the current session and logs the user out.
   */
  logout: async () => {
    const response = await axiosClient.post<ApiEnvelope<null>>("/api/v1/auth/logout");
    return response.data;
  },

  /**
   * Allows a user to change their password upon their first login.
   * @param payload - Current and new password details.
   * @returns Result indicating if the password was successfully changed.
   */
  changePasswordFirstTime: async (payload: ChangePasswordFirstTimePayload) => {
    const response = await axiosClient.post<ApiEnvelope<{ changed: boolean }>>("/api/v1/auth/change-password-first-time", payload);
    return response.data;
  },
};
