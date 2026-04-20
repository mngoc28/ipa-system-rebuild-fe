import axiosClient from "@/api/axiosClient";
import { ApiEnvelope, PaginatedData } from "@/types/api";
import { useAuthStore } from "@/store/useAuthStore";
import type {
  TaskApiItem,
  TaskCreatePayload,
  TaskPatchPayload,
} from "@/dataHelper/tasks.dataHelper";

export interface TaskCommentApiItem {
  id: number | string;
  comment_text: string;
  created_at: string;
  commenter?: {
    id?: number | string;
    full_name?: string;
    avatar_url?: string | null;
  };
}

export interface TaskAttachmentApiItem {
  id: number | string;
  file_name: string;
  file_size: number;
  mime_type?: string;
  created_at?: string;
}

const getPrefix = () => {
  const role = useAuthStore.getState().user?.role || "staff";
  const mappedRole = role.toLowerCase() === "admin" ? "director" : role.toLowerCase();
  return `/api/v1/${mappedRole}/tasks`;
};

export const tasksApi = {
  list: async (query?: {
    status?: number;
    priority?: number;
    search?: string;
    page?: number;
    pageSize?: number;
  }) => {
    const response = await axiosClient.get<ApiEnvelope<PaginatedData<TaskApiItem>>>(`${getPrefix()}`, {
      params: query,
    });
    return response.data;
  },

  get: async (id: string) => {
    const response = await axiosClient.get<ApiEnvelope<TaskApiItem>>(`${getPrefix()}/${id}`);
    return response.data;
  },

  create: async (payload: TaskCreatePayload) => {
    const response = await axiosClient.post<ApiEnvelope<TaskApiItem>>(`${getPrefix()}`, payload);
    return response.data;
  },

  update: async (id: string, payload: TaskPatchPayload) => {
    const response = await axiosClient.patch<ApiEnvelope<TaskApiItem>>(`${getPrefix()}/${id}`, payload);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await axiosClient.delete<ApiEnvelope<null>>(`${getPrefix()}/${id}`);
    return response.data;
  },

  // Comments
  listComments: async (taskId: string) => {
    const response = await axiosClient.get<ApiEnvelope<TaskCommentApiItem[]>>(`${getPrefix()}/${taskId}/comments`);
    return response.data;
  },

  addComment: async (taskId: string, content: string) => {
    const response = await axiosClient.post<ApiEnvelope<TaskCommentApiItem>>(`${getPrefix()}/${taskId}/comments`, {
      content,
    });
    return response.data;
  },

  // Attachments
  listAttachments: async (taskId: string) => {
    const response = await axiosClient.get<ApiEnvelope<TaskAttachmentApiItem[]>>(`${getPrefix()}/${taskId}/attachments`);
    return response.data;
  },

  uploadAttachment: async (taskId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await axiosClient.post<ApiEnvelope<TaskAttachmentApiItem>>(
      `${getPrefix()}/${taskId}/attachments`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data;
  },

  deleteAttachment: async (taskId: string, attachmentId: string) => {
    const response = await axiosClient.delete<ApiEnvelope<null>>(
      `${getPrefix()}/${taskId}/attachments/${attachmentId}`
    );
    return response.data;
  },
};
