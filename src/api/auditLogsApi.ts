import axiosClient from "@/api/axiosClient";
import { ApiEnvelope, PaginatedData } from "@/types/api";

export type AuditLogType = "info" | "success" | "warning" | "system";

export interface AuditLogItem {
  id: string;
  user: string;
  action: string;
  detail: string;
  time: string;
  type: AuditLogType;
}

export interface AuditLogListQuery {
  keyword?: string;
  type?: AuditLogType;
  actorUserId?: number;
  action?: string;
  resourceType?: string;
  page?: number;
  pageSize?: number;
}

export const auditLogsApi = {
  list: async (query: AuditLogListQuery) => {
    const response = await axiosClient.get<ApiEnvelope<PaginatedData<AuditLogItem>>>("/api/v1/admin/audit-logs", {
      params: query,
    });

    return response.data;
  },
};