import { useMutation, useQuery } from "@tanstack/react-query";
import { authApi } from "@/api/authApi";
import type { ChangePasswordFirstTimePayload, LoginPayload } from "@/dataHelper/auth.dataHelper";
import { getAuthToken } from "@/store/useAuthStore";
import { isJwtToken } from "@/utils/tokenUtils";

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
  });
};

export const useRefreshTokenMutation = () => {
  return useMutation({
    mutationFn: (refreshToken: string) => authApi.refresh(refreshToken),
  });
};

export const useLogoutMutation = () => {
  return useMutation({
    mutationFn: () => authApi.logout(),
  });
};

export const useChangePasswordFirstTimeMutation = () => {
  return useMutation({
    mutationFn: (payload: ChangePasswordFirstTimePayload) => authApi.changePasswordFirstTime(payload),
  });
};

export const useCurrentUserQuery = (enabled = true) => {
  const authToken = getAuthToken();

  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => authApi.me(),
    enabled: enabled && isJwtToken(authToken),
  });
};