import axios, { type AxiosError, type AxiosRequestConfig } from "axios";
import { getAuthToken, useAuthStore } from "@/store/useAuthStore";
import { getAccessToken, getRefreshToken } from "@/utils/storage";
import { decodeToken, refreshAccessToken } from "@/utils/tokenUtils";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8001",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

type RetryableRequestConfig = AxiosRequestConfig & {
  _retry?: boolean;
};

axiosClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken() || getAccessToken();
    const isJwtLikeToken = Boolean(token && decodeToken(token));

    if (token && isJwtLikeToken) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData && config.headers) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => Promise.reject(error),
);

axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const originalRequest = error.config as RetryableRequestConfig | undefined;
    const requestUrl = originalRequest?.url || "";
    const currentToken = getAuthToken() || getAccessToken();
    const isJwtLikeToken = Boolean(currentToken && decodeToken(currentToken));

    const isAuthRoute = requestUrl.includes("/api/v1/auth/login") || requestUrl.includes("/api/v1/auth/refresh") || requestUrl.includes("/api/v1/auth/me");

    if (status === 401 && originalRequest && !originalRequest._retry && !isAuthRoute && getRefreshToken()) {
      originalRequest._retry = true;

      const newAccessToken = await refreshAccessToken();

      if (newAccessToken) {
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosClient(originalRequest);
      }
    }

    if ((status === 401 || status === 403) && isJwtLikeToken) {
      console.warn(`Auth error ${status} detected for ${error.config?.url}. Redirecting to login...`);
      useAuthStore.getState().logout();
      
      if (window.location.pathname !== "/auth/login") {
        window.location.href = "/auth/login";
      }
    }

    return Promise.reject(error);
  },
);

export type { AxiosRequestConfig };
export default axiosClient;