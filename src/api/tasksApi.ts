import axiosClient from "@/api/axiosClient";
import { ApiEnvelope, PaginatedData } from "@/types/api";
import type {
  TaskApiItem,
  TaskCreatePayload,
  TaskPatchPayload,
} from "@/dataHelper/tasks.dataHelper";

export const tasksApi = {
  list: async (query?: {
    status?: number;
    priority?: number;
    search?: string;
    page?: number;
    pageSize?: number;
  }) => {
    const response = await axiosClient.get<ApiEnvelope<PaginatedData<TaskApiItem>>>("/api/v1/tasks", {
      params: query,
    });
    return response.data;
  },

  get: async (id: string) => {
    const response = await axiosClient.get<ApiEnvelope<TaskApiItem>>(`/api/v1/tasks/${id}`);
    return response.data;
  },

  create: async (payload: TaskCreatePayload) => {
    const response = await axiosClient.post<ApiEnvelope<TaskApiItem>>("/api/v1/tasks", payload);
    return response.data;
  },

  update: async (id: string, payload: TaskPatchPayload) => {
    const response = await axiosClient.patch<ApiEnvelope<TaskApiItem>>(`/api/v1/tasks/${id}`, payload);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await axiosClient.delete<ApiEnvelope<null>>(`/api/v1/tasks/${id}`);
    return response.data;
  },
};
