import axios, { type AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from "axios";
import { getAuthToken, useAuthStore } from "@/store/useAuthStore";
import { getAccessToken, getRefreshToken } from "@/utils/storage";
import { decodeToken, refreshAccessToken } from "@/utils/tokenUtils";
import { toast } from "sonner";

/**
 * Configured Axios instance for all API communications.
 * Includes base URL, timeout settings, and standard headers.
 */
/**
 * Global registry for active request AbortControllers.
 * Allows cancelling all pending requests at once (e.g., on logout).
 */
const activeRequests = new Set<AbortController>();

export const abortAllRequests = () => {
  activeRequests.forEach((controller) => controller.abort());
  activeRequests.clear();
  console.log("[Axios] All pending requests aborted.");
};

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8001",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Extended request config to track retry attempts for failed requests.
 */
type RetryableRequestConfig = AxiosRequestConfig & {
  /** Internal flag to prevent infinite retry loops on 401 errors */
  _retry?: boolean;
};

/**
 * Extended InternalAxiosRequestConfig to include internal tracking properties.
 */
interface CustomInternalAxiosRequestConfig extends InternalAxiosRequestConfig {
  _abortController?: AbortController;
}

axiosClient.interceptors.request.use(
  (config) => {
    // Attach AbortController for global cancellation support
    const controller = new AbortController();
    config.signal = controller.signal;
    activeRequests.add(controller);
    
    // Store reference to controller in config to remove it later
    (config as CustomInternalAxiosRequestConfig)._abortController = controller;

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
  (response) => {
    // Remove controller from registry on success
    const controller = (response.config as CustomInternalAxiosRequestConfig)._abortController;
    if (controller) activeRequests.delete(controller);
    return response;
  },
  async (error: AxiosError) => {
    // Remove controller from registry on error
    const controller = (error.config as CustomInternalAxiosRequestConfig | undefined)?._abortController;
    if (controller) activeRequests.delete(controller);

    const status = error.response?.status;
    const originalRequest = error.config as RetryableRequestConfig | undefined;
    const requestUrl = originalRequest?.url || "";
    const method = originalRequest?.method?.toLowerCase() || "";
    const currentToken = getAuthToken() || getAccessToken();
    const isJwtLikeToken = Boolean(currentToken && decodeToken(currentToken));

    // 1. Handle Timeout / Network errors
    if (error.code === "ECONNABORTED" || error.message.includes("timeout") || !error.response) {
      console.error(`[Network/Timeout Error] ${method.toUpperCase()} ${requestUrl}:`, error.message);
      
      // Specifically show "Server starting" message for timeouts
      if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
        toast.error("Server đang khởi động, vui lòng thử lại sau giây lát.");
      } else {
        toast.error("Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng.");
      }
      return Promise.reject(error);
    }

    const isAuthRoute = requestUrl.includes("/api/v1/auth/login") || requestUrl.includes("/api/v1/auth/refresh") || requestUrl.includes("/api/v1/auth/me");

    // 2. Handle 401 Refresh Logic - Avoid auto-retry for POST to prevent duplicates
    if (status === 401 && originalRequest && !originalRequest._retry && !isAuthRoute && getRefreshToken()) {
      // Avoid blind auto-retry for POST requests as per requirements
      if (method === "post") {
        console.warn(`[Auth] 401 encountered for POST ${requestUrl}. Avoiding auto-retry to prevent duplicates.`);
        // For POST, we let it fail so the user can retry manually and controlled
      } else {
        originalRequest._retry = true;
        const newAccessToken = await refreshAccessToken();

        if (newAccessToken) {
          originalRequest.headers = originalRequest.headers ?? {};
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axiosClient(originalRequest);
        }
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
