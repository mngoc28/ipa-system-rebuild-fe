import axiosClient from "@/api/axiosClient";
import { ApiEnvelope, PaginatedData } from "@/types/api";
import { useAuthStore } from "@/store/useAuthStore";
import type {
  CreateDelegationPayload,
  DelegationApiItem,
  DelegationsQuery,
} from "@/dataHelper/delegations.dataHelper";

/**
 * Represents a comment record associated with a delegation.
 */
export interface DelegationCommentApiItem {
  /** Unique identifier for the comment */
  id: number | string;
  /** The content of the comment */
  comment_text: string;
  /** Creation timestamp */
  created_at: string;
  /** Identity details of the commenter */
  commenter?: {
    id?: number | string;
    full_name?: string;
    avatar_url?: string | null;
  };
}

const getPrefix = () => {
  const role = useAuthStore.getState().user?.role || "staff";
  const mappedRole = role.toLowerCase() === "admin" ? "director" : role.toLowerCase();
  return `/api/v1/${mappedRole}/delegations`;
};

/**
 * API service for delegation management, comments, and lifecycle operations.
 */
export const delegationsApi = {
  /**
   * Retrieves a filtered and paginated list of delegations.
   * @param query - Search and filter parameters.
   * @returns Paginated list of delegation items.
   */
  list: async (query?: DelegationsQuery) => {
    const response = await axiosClient.get<ApiEnvelope<PaginatedData<DelegationApiItem>>>(`${getPrefix()}`, {
      params: query,
    });
    return response.data;
  },

  /**
   * Fetches the complete details for a specific delegation.
   * @param id - Unique delegation ID.
   * @returns Detailed delegation object.
   */
  getById: async (id: string | number) => {
    const response = await axiosClient.get<ApiEnvelope<DelegationApiItem>>(`${getPrefix()}/${id}`);
    return response.data;
  },

  /**
   * Registers a new delegation in the system.
   * @param payload - Initial data for the delegation.
   * @returns The created delegation record.
   */
  create: async (payload: CreateDelegationPayload) => {
    const response = await axiosClient.post<ApiEnvelope<DelegationApiItem>>(`${getPrefix()}`, payload);
    return response.data;
  },

  /**
   * Updates an existing delegation's information.
   * @param id - Target delegation ID.
   * @param payload - Fields to be updated.
   * @returns The updated delegation record.
   */
  update: async (id: string | number, payload: Partial<CreateDelegationPayload>) => {
    const response = await axiosClient.patch<ApiEnvelope<DelegationApiItem>>(`${getPrefix()}/${id}`, payload);
    return response.data;
  },

  /**
   * Permanently deletes a delegation record.
   * @param id - ID of the delegation to remove.
   * @returns Success confirmation.
   */
  delete: async (id: string | number) => {
    const response = await axiosClient.delete<ApiEnvelope<void>>(`${getPrefix()}/${id}`);
    return response.data;
  },

  /**
   * Lists all comments associated with a specific delegation.
   * @param id - The delegation ID.
   * @returns Array of comment objects.
   */
  listComments: async (id: string | number) => {
    const response = await axiosClient.get<ApiEnvelope<DelegationCommentApiItem[]>>(`${getPrefix()}/${id}/comments`);
    return response.data;
  },

  /**
   * Posts a new comment to a delegation.
   * @param id - The delegation ID.
   * @param content - Text content of the comment.
   * @returns The newly created comment object.
   */
  addComment: async (id: string | number, content: string) => {
    const response = await axiosClient.post<ApiEnvelope<DelegationCommentApiItem>>(`${getPrefix()}/${id}/comments`, { content });
    return response.data;
  },

  /**
   * Modifies an existing comment.
   * @param id - The delegation ID.
   * @param commentId - The ID of the comment to edit.
   * @param content - New text content.
   * @returns The updated comment object.
   */
  updateComment: async (id: string | number, commentId: number, content: string) => {
    const response = await axiosClient.put<ApiEnvelope<DelegationCommentApiItem>>(`${getPrefix()}/${id}/comments/${commentId}`, { content });
    return response.data;
  },

  /**
   * Deletes a specific comment from a delegation.
   * @param id - The delegation ID.
   * @param commentId - The comment ID to remove.
   * @returns Success confirmation (comment object).
   */
  deleteComment: async (id: string | number, commentId: number) => {
    const response = await axiosClient.delete<ApiEnvelope<DelegationCommentApiItem>>(`${getPrefix()}/${id}/comments/${commentId}`);
    return response.data;
  },
};
