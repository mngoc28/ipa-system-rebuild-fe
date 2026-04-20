import { useMutation, useQuery } from "@tanstack/react-query";
import { authApi } from "@/api/authApi";
import type { ChangePasswordFirstTimePayload, LoginPayload } from "@/dataHelper/auth.dataHelper";
import { getAuthToken } from "@/store/useAuthStore";
import { isJwtToken } from "@/utils/tokenUtils";

/**
 * Hook to perform user login.
 * @returns Mutation object accepting LoginPayload.
 */
export const useLoginMutation = () => {
  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
  });
};

/**
 * Hook to refresh the current session's access token.
 */
export const useRefreshTokenMutation = () => {
  return useMutation({
    mutationFn: (refreshToken: string) => authApi.refresh(refreshToken),
  });
};

/**
 * Hook to invalidate the current session on the server.
 */
export const useLogoutMutation = () => {
  return useMutation({
    mutationFn: () => authApi.logout(),
  });
};

/**
 * Hook to handle mandatory password change for first-time login or forced resets.
 */
export const useChangePasswordFirstTimeMutation = () => {
  return useMutation({
    mutationFn: (payload: ChangePasswordFirstTimePayload) => authApi.changePasswordFirstTime(payload),
  });
};

/**
 * Hook to retrieve the current authenticated user's profile and permissions.
 * @param enabled - Whether the query should be active.
 */
export const useCurrentUserQuery = (enabled = true) => {
  const authToken = getAuthToken();

  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => authApi.me(),
    enabled: enabled && isJwtToken(authToken),
  });
};