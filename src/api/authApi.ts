import axiosClient from "@/api/axiosClient";
import type { ChangePasswordFirstTimePayload, AuthUser, LoginPayload, LoginResponse } from "@/dataHelper/auth.dataHelper";
import { ApiEnvelope } from "@/types/api";

export const authApi = {
  login: async (payload: LoginPayload) => {
    const response = await axiosClient.post<ApiEnvelope<LoginResponse>>("/api/v1/auth/login", payload);
    return response.data;
  },
  refresh: async (refreshToken: string) => {
    const response = await axiosClient.post<ApiEnvelope<{ accessToken: string; expiresIn: number }>>("/api/v1/auth/refresh", {
      refreshToken,
    });
    return response.data;
  },
  me: async () => {
    const response = await axiosClient.get<ApiEnvelope<AuthUser>>("/api/v1/auth/me");
    return response.data;
  },
  logout: async () => {
    const response = await axiosClient.post<ApiEnvelope<null>>("/api/v1/auth/logout");
    return response.data;
  },
  changePasswordFirstTime: async (payload: ChangePasswordFirstTimePayload) => {
    const response = await axiosClient.post<ApiEnvelope<{ changed: boolean }>>("/api/v1/auth/change-password-first-time", payload);
    return response.data;
  },
};
