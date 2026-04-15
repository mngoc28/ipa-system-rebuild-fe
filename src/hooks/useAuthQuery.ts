import { useMutation, useQuery } from "@tanstack/react-query";
import { authApi } from "@/api/authApi";
import type { ChangePasswordFirstTimePayload, LoginPayload } from "@/dataHelper/auth.dataHelper";

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

export const useChangePasswordFirstTimeMutation = () => {
  return useMutation({
    mutationFn: (payload: ChangePasswordFirstTimePayload) => authApi.changePasswordFirstTime(payload),
  });
};

export const useCurrentUserQuery = (enabled = true) => {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => authApi.me(),
    enabled,
  });
};