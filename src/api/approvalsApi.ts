import axiosClient from "@/api/axiosClient";
import { ApiEnvelope, PaginatedData } from "@/types/api";

/**
 * Represents an approval request or item in the workflow.
 */
export interface ApprovalItem {
  /** Unique ID of the approval request */
  id: string;
  /** Type of approval (e.g., DELEGATION_PLAN, BUDGET) */
  type: string;
  /** Subject line or title */
  title?: string;
  /** ID of the user who initiated the request */
  requesterId?: string;
  /** ID of the current assigned approver */
  approverId?: string;
  /** Lifecycle status (e.g., PENDING, APPROVED, REJECTED) */
  status: string;
  /** ISO timestamp of request creation */
  createdAt?: string;
  /** Deadline for the decision */
  dueAt?: string;
}

export interface ApprovalDetail {
  request: ApprovalItem;
  steps: Array<{
    id?: string;
    status?: string;
    approverId?: string;
    stepOrder?: number;
    decisionNote?: string | null;
    decidedAt?: string;
  }>;
  history: Array<{
    decision?: string;
    decisionNote?: string | null;
    decidedAt?: string;
    deciderUserId?: string;
    oldStatus?: string;
    newStatus?: string;
  }>;
}

/**
 * API service for managing and processing approval workflows.
 */
export const approvalsApi = {
  /**
   * Fetches a paginated list of approval requests for the current manager.
   * @param query - Filter by status/type and pagination parameters.
   * @returns Paginated list of approval items.
   */
  list: async (query?: { status?: string; type?: string; page?: number; pageSize?: number }) => {
    const response = await axiosClient.get<ApiEnvelope<PaginatedData<ApprovalItem>>>("/api/v1/manager/approvals", {
      params: query,
    });
    return response.data;
  },

  /**
   * Retrieves full details, steps, and history of a specific approval request.
   * @param id - The ID of the approval request.
   * @returns Detailed approval information.
   */
  getById: async (id: string) => {
    const response = await axiosClient.get<ApiEnvelope<ApprovalDetail>>(`/api/v1/manager/approvals/${id}`);
    return response.data;
  },

  /**
   * Submits a decision (approve or reject) for a pending request.
   * @param id - Target approval ID.
   * @param payload - The decision and optional commentary.
   * @returns Update confirmation with new status and timestamp.
   */
  decision: async (id: string, payload: { decision: "APPROVE" | "REJECT"; decisionNote?: string }) => {
    const response = await axiosClient.post<ApiEnvelope<{ status: string; decidedAt: string }>>(`/api/v1/manager/approvals/${id}/decision`, payload);
    return response.data;
  },

  /**
   * Gets a brief summary of outstanding tasks for the manager.
   * @returns Total count of pending approval requests.
   */
  getSummary: async () => {
    const response = await axiosClient.get<ApiEnvelope<{ pendingCount: number }>>("/api/v1/manager/approvals/summary");
    return response.data;
  },
};

export const mapApprovalStatus = (status?: string): "pending" | "approved" | "rejected" => {
  const normalized = (status || "").toUpperCase();
  if (normalized === "APPROVED") return "approved";
  if (normalized === "REJECTED") return "rejected";
  return "pending";
};
