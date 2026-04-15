import type { AxiosRequestConfig } from "axios";
import axiosClient from "@/api/axiosClient";

const apiService = {
  get: <T>(url: string, config?: AxiosRequestConfig) => {
    return axiosClient.get<T>(url, config);
  },
  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => {
    return axiosClient.post<T>(url, data, config);
  },
  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => {
    return axiosClient.patch<T>(url, data, config);
  },
  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => {
    return axiosClient.put<T>(url, data, config);
  },
  delete: <T>(url: string, config?: AxiosRequestConfig) => {
    return axiosClient.delete<T>(url, config);
  },
};

export default apiService;
