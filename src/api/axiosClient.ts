import axios, { type AxiosError, type AxiosRequestConfig } from "axios";
import { getAuthToken, useAuthStore } from "@/store/useAuthStore";
import { getAccessToken, removeAccessToken } from "@/utils/storage";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8001",
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken() || getAccessToken();

    if (token) {
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
  (error: AxiosError) => {
    const status = error.response?.status;

    if (status === 401 || status === 403) {
      useAuthStore.getState().logout();
      removeAccessToken();

      if (window.location.pathname !== "/auth/login") {
        window.location.href = "/auth/login";
      }
    }

    return Promise.reject(error);
  },
);

export type { AxiosRequestConfig };
export default axiosClient;