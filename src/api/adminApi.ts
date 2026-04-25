import { ApiEnvelope } from "@/types/api";
import apiClient from "./axiosClient";

/**
 * Represents a system-wide announcement or notification.
 */
export interface Announcement {
    id: number;
    title: string;
    content: string;
    type: "info" | "warning" | "success";
    starts_at: string | null;
    ends_at: string | null;
    is_active: boolean;
    created_at: string;
}

/**
 * Snapshot of system operation metrics and health status.
 */
export interface OperationalStats {
    online_users: number;
    new_files_24h: number;
    active_tasks: number;
    storage_used: string;
    active_announcements: number;
    total_users: number;
    cpu_load: number;
    db_status: boolean;
    security_alerts_count: number;
}

/**
 * API service for system administration, monitoring, and announcements.
 */
export const adminApi = {
  /**
   * Fetches real-time operational and system health statistics.
   * @returns Comprehensive operational stats object.
   */
  getOperationalStats: async () => {
    const response = await apiClient.get<ApiEnvelope<OperationalStats>>("/api/v1/admin/system-settings/stats");
    return response.data;
  },

  /**
   * Lists administrative announcements with optional keyword search.
   * @param search - Optional keyword to filter announcements.
   * @returns Array of announcement records.
   */
  getAnnouncements: async (search?: string) => {
    const response = await apiClient.get<ApiEnvelope<{ items: Announcement[] }>>("/api/v1/admin/announcements", {
      params: { search },
    });
    return response.data;
  },

  /**
   * Posts a new system announcement.
   * @param data - Partial announcement data.
   * @returns The created announcement object.
   */
  createAnnouncement: async (data: Partial<Announcement>) => {
    const response = await apiClient.post<ApiEnvelope<Announcement>>("/api/v1/admin/announcements", data);
    return response.data;
  },

  /**
   * Updates an existing announcement's details or activation state.
   * @param id - The ID of the announcement to modify.
   * @param data - Subset of fields to update.
   * @returns The updated announcement object.
   */
  updateAnnouncement: async (id: number, data: Partial<Announcement>) => {
    const response = await apiClient.patch<ApiEnvelope<Announcement>>(`/api/v1/admin/announcements/${id}`, data);
    return response.data;
  },

  /**
   * Permanently removes a system announcement.
   * @param id - The target announcement ID.
   */
  deleteAnnouncement: async (id: number) => {
    await apiClient.delete(`/api/v1/admin/announcements/${id}`);
  },
};
