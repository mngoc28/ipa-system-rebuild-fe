import type { AxiosRequestConfig } from "axios";
import axiosClient from "@/api/axiosClient";

/**
 * Generic API service wrapper providing standardized HTTP methods over axiosClient.
 * Supports type-safe response data handling.
 */
const apiService = {
  /**
   * Performs an asynchronous GET request.
   * @param url - The target endpoint.
   * @param config - Optional request configuration.
   */
  get: <T>(url: string, config?: AxiosRequestConfig) => {
    return axiosClient.get<T>(url, config);
  },

  /**
   * Performs an asynchronous POST request.
   * @param url - The target endpoint.
   * @param data - The request body payload.
   * @param config - Optional configuration.
   */
  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => {
    return axiosClient.post<T>(url, data, config);
  },

  /**
   * Performs an asynchronous PATCH request (partial update).
   * @param url - The target endpoint.
   * @param data - The partial data payload.
   * @param config - Optional configuration.
   */
  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => {
    return axiosClient.patch<T>(url, data, config);
  },

  /**
   * Performs an asynchronous PUT request (full replacement).
   * @param url - The target endpoint.
   * @param data - The full data payload.
   * @param config - Optional configuration.
   */
  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => {
    return axiosClient.put<T>(url, data, config);
  },

  /**
   * Performs an asynchronous DELETE request.
   * @param url - The target endpoint.
   * @param config - Optional configuration.
   */
  delete: <T>(url: string, config?: AxiosRequestConfig) => {
    return axiosClient.delete<T>(url, config);
  },
};

export default apiService;
