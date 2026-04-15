import axiosClient from "@/api/axiosClient";
import { ApiEnvelope, PaginatedData } from "@/types/api";

export interface ApprovalItem {
  id: string;
  type: string;
  title?: string;
  requesterId?: string;
  approverId?: string;
  status: string;
  createdAt?: string;
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

export const approvalsApi = {
  list: async (query?: { status?: string; type?: string; page?: number; pageSize?: number }) => {
    const response = await axiosClient.get<ApiEnvelope<PaginatedData<ApprovalItem>>>("/api/v1/approvals", {
      params: query,
    });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await axiosClient.get<ApiEnvelope<ApprovalDetail>>(`/api/v1/approvals/${id}`);
    return response.data;
  },
  decision: async (id: string, payload: { decision: "APPROVE" | "REJECT"; decisionNote?: string }) => {
    const response = await axiosClient.post<ApiEnvelope<{ status: string; decidedAt: string }>>(`/api/v1/approvals/${id}/decision`, payload);
    return response.data;
  },
};

export const mapApprovalStatus = (status?: string): "pending" | "approved" | "rejected" => {
  const normalized = (status || "").toUpperCase();
  if (normalized === "APPROVED") return "approved";
  if (normalized === "REJECTED") return "rejected";
  return "pending";
};
