import axiosClient from "@/api/axiosClient";
import { ApiEnvelope, PaginatedData } from "@/types/api";

export type AuditLogType = "info" | "success" | "warning" | "system";

/**
 * Represents a historical log record of a user or system action.
 */
export interface AuditLogItem {
  /** Unique ID of the log record */
  id: string;
  /** Name of the user or system component that performed the action */
  user: string;
  /** High-level description of the action (e.g., LOGIN, DELETE_USER) */
  action: string;
  /** Detailed information or parameters of the action */
  detail: string;
  /** Timestamp of the event */
  time: string;
  /** Categorization of the log importance */
  type: AuditLogType;
}

/**
 * Filtering and pagination criteria for audit log retrieval.
 */
export interface AuditLogListQuery {
  /** Search keyword for actions or details */
  keyword?: string;
  /** Filter by log category */
  type?: AuditLogType;
  /** Filter by the ID of the user who performed the action */
  actorUserId?: number;
  /** Specific action name to filter by */
  action?: string;
  /** filter by affected resource type (e.g., DELEGATION) */
  resourceType?: string;
  /** Page number for pagination */
  page?: number;
  /** Items per page */
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