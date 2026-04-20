import axiosClient from "@/api/axiosClient";
import { ApiEnvelope, PaginatedData } from "@/types/api";
import { useAuthStore } from "@/store/useAuthStore";
import type {
  TaskApiItem,
  TaskCreatePayload,
  TaskPatchPayload,
} from "@/dataHelper/tasks.dataHelper";

/**
 * Represents a commentary or feedback item linked to a task.
 */
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

/**
 * Metadata for a file uploaded as an attachment to a task.
 */
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

/**
 * API service for managing workflow tasks, comments, and file attachments.
 */
export const tasksApi = {
  /**
   * Fetches a paginated list of tasks matching search and status criteria.
   * @param query - Filter parameters for progress, importance, and pagination.
   * @returns Paginated list of tasks records.
   */
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

  /**
   * Retrieves full details for a single task.
   * @param id - The unique task identifier.
   * @returns Comprehensive task metadata.
   */
  get: async (id: string) => {
    const response = await axiosClient.get<ApiEnvelope<TaskApiItem>>(`${getPrefix()}/${id}`);
    return response.data;
  },

  /**
   * Registers a new actionable task in the system.
   * @param payload - Initial task configuration and assignment.
   * @returns Newly created task record.
   */
  create: async (payload: TaskCreatePayload) => {
    const response = await axiosClient.post<ApiEnvelope<TaskApiItem>>(`${getPrefix()}`, payload);
    return response.data;
  },

  /**
   * Modifies an existing task's lifecycle or metadata.
   * @param id - Target task ID.
   * @param payload - Subset of fields to update.
   * @returns The updated task record.
   */
  update: async (id: string, payload: TaskPatchPayload) => {
    const response = await axiosClient.patch<ApiEnvelope<TaskApiItem>>(`${getPrefix()}/${id}`, payload);
    return response.data;
  },

  /**
   * Permanently removes a task from the system.
   * @param id - ID of the task to delete.
   * @returns Success confirmation.
   */
  delete: async (id: string) => {
    const response = await axiosClient.delete<ApiEnvelope<null>>(`${getPrefix()}/${id}`);
    return response.data;
  },

  /**
   * Fetches all collaboration comments for a specific task.
   * @param taskId - The parent task ID.
   * @returns List of formatted comment objects.
   */
  listComments: async (taskId: string) => {
    const response = await axiosClient.get<ApiEnvelope<TaskCommentApiItem[]>>(`${getPrefix()}/${taskId}/comments`);
    return response.data;
  },

  /**
   * Adds a new feedback or progress comment to a task.
   * @param taskId - Target task ID.
   * @param content - The text content to post.
   * @returns The newly created comment record.
   */
  addComment: async (taskId: string, content: string) => {
    const response = await axiosClient.post<ApiEnvelope<TaskCommentApiItem>>(`${getPrefix()}/${taskId}/comments`, {
      content,
    });
    return response.data;
  },

  /**
   * Lists all binary file attachments linked to a task.
   * @param taskId - Target task ID.
   * @returns List of attachment metadata records.
   */
  listAttachments: async (taskId: string) => {
    const response = await axiosClient.get<ApiEnvelope<TaskAttachmentApiItem[]>>(`${getPrefix()}/${taskId}/attachments`);
    return response.data;
  },

  /**
   * Uploads a new document or image as a task attachment.
   * @param taskId - Target task ID.
   * @param file - The binary file to upload.
   * @returns Attachment metadata for the newly uploaded file.
   */
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

  /**
   * Deletes a specific file attachment from a task.
   * @param taskId - The parent task ID.
   * @param attachmentId - The ID of the file to remove.
   * @returns Success confirmation.
   */
  deleteAttachment: async (taskId: string, attachmentId: string) => {
    const response = await axiosClient.delete<ApiEnvelope<null>>(
      `${getPrefix()}/${taskId}/attachments/${attachmentId}`
    );
    return response.data;
  },
};
