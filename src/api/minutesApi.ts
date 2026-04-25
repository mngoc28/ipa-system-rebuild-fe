import axiosClient from "@/api/axiosClient";
import { ApiEnvelope, PaginatedData } from "@/types/api";
import { useAuthStore } from "@/store/useAuthStore";

/**
 * Data transfer object for a meeting minutes record.
 */
export interface MinutesItemDto {
    id: string;
    delegationId: string;
    eventId?: string | null;
    title: string;
    status: string;
    currentVersionNo: number;
}

export interface MinutesVersion {
  id: string;
  minutesId: string;
  versionNo: number;
  contentText?: string | null;
  contentJson?: unknown;
  changeSummary?: string;
  editedAt?: string;
}

export interface MinutesComment {
  id: string;
  minutesId: string;
  versionId?: string | null;
  commentText: string;
  parentCommentId?: string | null;
  createdAt?: string;
}

export interface MinutesApproval {
  id: string;
  minutesId: string;
  decision: "APPROVE" | "REJECT";
  decisionNote?: string | null;
  decidedAt?: string;
  deciderUserId?: string;
}

/**
 * Comprehensive detailed view of meeting minutes including history and feedback.
 */
export interface MinutesDetailDto {
  minutes: MinutesItemDto;
  versions: MinutesVersion[];
  comments: MinutesComment[];
  approvals: MinutesApproval[];
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

const getPrefix = () => {
  const role = useAuthStore.getState().user?.role || "staff";
  const mappedRole = role.toLowerCase() === "admin" ? "director" : role.toLowerCase();
  return `/api/v1/${mappedRole}/minutes`;
};

/**
 * API service for meeting minutes preservation, versioning, and approval.
 */
export const minutesApi = {
  /**
   * Fetches a paginated list of minutes records based on filters.
   * @param query - Optional search patterns and delegation filters.
   * @returns Paginated list of minutes items with metadata.
   */
  list: async (query?: MinutesListQuery) => {
    const response = await axiosClient.get<ApiEnvelope<PaginatedData<MinutesItemDto> & { meta?: MinutesListMeta }>>(`${getPrefix()}`, {
      params: query,
    });
    return response.data;
  },

  /**
   * Creates a new meeting minute entry.
   * @param payload - Initial context and content for the meeting notes.
   * @returns ID and initial version of the created minutes.
   */
  create: async (payload: { delegationId: string; eventId?: string; title: string; content?: string }) => {
    const response = await axiosClient.post<ApiEnvelope<{ id: string; currentVersionNo: number }>>(`${getPrefix()}`, payload);
    return response.data;
  },

  /**
   * Retrieves full content, version history, and comments for specific minutes.
   * @param id - The minutes record ID.
   * @returns Detailed minutes object.
   */
  getById: async (id: string) => {
    const response = await axiosClient.get<ApiEnvelope<MinutesDetailDto>>(`${getPrefix()}/${id}`);
    return response.data;
  },

  /**
   * Submits a new revision of the meeting minutes content.
   * @param id - Target minutes ID.
   * @param payload - Updated content and a summary of what changed.
   * @returns New version number and update timestamp.
   */
  createVersion: async (id: string, payload: { contentText?: string; contentJson?: unknown; changeSummary: string }) => {
    const response = await axiosClient.post<ApiEnvelope<{ versionNo: number; editedAt: string }>>(`${getPrefix()}/${id}/versions`, payload);
    return response.data;
  },

  /**
   * Adds a commentary or feedback item to the minutes.
   * @param id - Target minutes ID.
   * @param payload - Comment text and optional version/parent references.
   * @returns Newly created comment details.
   */
  createComment: async (id: string, payload: { versionId?: string; commentText: string; parentCommentId?: string }) => {
    const response = await axiosClient.post<ApiEnvelope<{ id: string; commentText: string; createdAt?: string }>>(`${getPrefix()}/${id}/comments`, payload);
    return response.data;
  },

  /**
   * Specifically handles manager-level approval for final minute versions.
   * @param id - Target minutes ID.
   * @param payload - The approval decision and commentary.
   * @returns Approval status confirmation.
   */
  approve: async (id: string, payload: { decision: "APPROVE" | "REJECT"; decisionNote?: string }) => {
    const response = await axiosClient.post<ApiEnvelope<{ approved: boolean; status: string }>>(`/api/v1/manager/minutes/${id}/approve`, payload);
    return response.data;
  },
};

/**
 * Helper to map API internal status codes to human-readable UI labels.
 * @param status - The raw status code from the API.
 * @returns Standard label (Draft, Pending, or Signed).
 */
export const mapMinutesStatus = (status?: string): "Draft" | "Pending" | "Signed" => {
  const normalized = (status || "").toUpperCase();
  if (normalized === "FINAL") return "Signed";
  if (normalized === "INTERNAL") return "Pending";
  return "Draft";
};
