import axiosClient from "@/api/axiosClient";
import { ApiEnvelope, PaginatedData } from "@/types/api";

export interface MinutesItemDto {
  id: string;
  delegationId: string;
  eventId?: string | null;
  title: string;
  status: string;
  currentVersionNo: number;
}

export interface MinutesDetailDto {
  minutes: MinutesItemDto;
  versions: Array<{
    id: string;
    minutesId: string;
    versionNo: number;
    contentText?: string | null;
    contentJson?: unknown;
    changeSummary?: string;
    editedAt?: string;
  }>;
  comments: Array<{
    id: string;
    minutesId: string;
    versionId?: string | null;
    commentText: string;
    parentCommentId?: string | null;
    createdAt?: string;
  }>;
  approvals: Array<{
    id: string;
    minutesId: string;
    decision: "APPROVE" | "REJECT";
    decisionNote?: string | null;
    decidedAt?: string;
    deciderUserId?: string;
  }>;
}

export interface MinutesListQuery {
  delegationId?: string;
  status?: string;
  keyword?: string;
  page?: number;
  pageSize?: number;
}

export interface MinutesListMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface MinutesListResponseDto {
  items: MinutesItemDto[];
  meta?: MinutesListMeta;
}

export const minutesApi = {
  list: async (query?: MinutesListQuery) => {
    const response = await axiosClient.get<ApiEnvelope<PaginatedData<MinutesItemDto> & { meta?: MinutesListMeta }>>("/api/v1/minutes", {
      params: query,
    });
    return response.data;
  },
  create: async (payload: { delegationId: string; eventId?: string; title: string; content?: string }) => {
    const response = await axiosClient.post<ApiEnvelope<{ id: string; currentVersionNo: number }>>("/api/v1/minutes", payload);
    return response.data;
  },
  getById: async (id: string) => {
    const response = await axiosClient.get<ApiEnvelope<MinutesDetailDto>>(`/api/v1/minutes/${id}`);
    return response.data;
  },
  createVersion: async (id: string, payload: { contentText?: string; contentJson?: unknown; changeSummary: string }) => {
    const response = await axiosClient.post<ApiEnvelope<{ versionNo: number; editedAt: string }>>(`/api/v1/minutes/${id}/versions`, payload);
    return response.data;
  },
  createComment: async (id: string, payload: { versionId?: string; commentText: string; parentCommentId?: string }) => {
    const response = await axiosClient.post<ApiEnvelope<{ id: string; commentText: string; createdAt?: string }>>(`/api/v1/minutes/${id}/comments`, payload);
    return response.data;
  },
  approve: async (id: string, payload: { decision: "APPROVE" | "REJECT"; decisionNote?: string }) => {
    const response = await axiosClient.post<ApiEnvelope<{ approved: boolean; status: string }>>(`/api/v1/minutes/${id}/approve`, payload);
    return response.data;
  },
};

export const mapMinutesStatus = (status?: string): "Draft" | "Pending" | "Signed" => {
  const normalized = (status || "").toUpperCase();
  if (normalized === "FINAL") return "Signed";
  if (normalized === "INTERNAL") return "Pending";
  return "Draft";
};
