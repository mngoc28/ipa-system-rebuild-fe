import axiosClient from "@/api/axiosClient";
import { ApiEnvelope, PaginatedData } from "@/types/api";

export type AuditLogType = "info" | "success" | "warning" | "system";

/**
 * Represents a historical log record of a user or system action.
 */
export interface AuditLogItem {
    id: string;
    user: string;
    action: string;
    detail: string;
    time: string;
    type: AuditLogType;
}

/**
 * Filtering and pagination criteria for audit log retrieval.
 */
export interface AuditLogListQuery {
    keyword?: string;
    type?: AuditLogType;
    actorUserId?: number;
    action?: string;
    resourceType?: string;
    page?: number;
    pageSize?: number;
}

/**
 * API service for querying system audit and activity logs.
 */
export const auditLogsApi = {
  /**
   * Fetches a list of audit logs based on the provided query filters.
   * @param query - Search, filter, and pagination parameters.
   * @returns Paginated list of audit log items.
   */
  list: async (query: AuditLogListQuery) => {
    const response = await axiosClient.get<ApiEnvelope<PaginatedData<AuditLogItem>>>("/api/v1/admin/audit-logs", {
      params: query,
    });

    return response.data;
  },
};
