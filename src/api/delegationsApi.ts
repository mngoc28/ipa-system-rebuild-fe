import axiosClient from "@/api/axiosClient";
import { ApiEnvelope, PaginatedData } from "@/types/api";
import { useAuthStore } from "@/store/useAuthStore";
import type {
  CreateDelegationPayload,
  DelegationApiItem,
  DelegationsQuery,
} from "@/dataHelper/delegations.dataHelper";

export interface DelegationCommentApiItem {
  id: number | string;
  comment_text: string;
  created_at: string;
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

export const delegationsApi = {
  list: async (query?: DelegationsQuery) => {
    const response = await axiosClient.get<ApiEnvelope<PaginatedData<DelegationApiItem>>>(`${getPrefix()}`, {
      params: query,
    });
    return response.data;
  },

  getById: async (id: string | number) => {
    const response = await axiosClient.get<ApiEnvelope<DelegationApiItem>>(`${getPrefix()}/${id}`);
    return response.data;
  },

  create: async (payload: CreateDelegationPayload) => {
    const response = await axiosClient.post<ApiEnvelope<DelegationApiItem>>(`${getPrefix()}`, payload);
    return response.data;
  },

  update: async (id: string | number, payload: Partial<CreateDelegationPayload>) => {
    const response = await axiosClient.patch<ApiEnvelope<DelegationApiItem>>(`${getPrefix()}/${id}`, payload);
    return response.data;
  },

  delete: async (id: string | number) => {
    const response = await axiosClient.delete<ApiEnvelope<void>>(`${getPrefix()}/${id}`);
    return response.data;
  },

  listComments: async (id: string | number) => {
    const response = await axiosClient.get<ApiEnvelope<DelegationCommentApiItem[]>>(`${getPrefix()}/${id}/comments`);
    return response.data;
  },

  addComment: async (id: string | number, content: string) => {
    const response = await axiosClient.post<ApiEnvelope<DelegationCommentApiItem>>(`${getPrefix()}/${id}/comments`, { content });
    return response.data;
  },

  updateComment: async (id: string | number, commentId: number, content: string) => {
    const response = await axiosClient.put<ApiEnvelope<DelegationCommentApiItem>>(`${getPrefix()}/${id}/comments/${commentId}`, { content });
    return response.data;
  },

  deleteComment: async (id: string | number, commentId: number) => {
    const response = await axiosClient.delete<ApiEnvelope<DelegationCommentApiItem>>(`${getPrefix()}/${id}/comments/${commentId}`);
    return response.data;
  },
};
