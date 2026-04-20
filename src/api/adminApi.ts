import apiClient from "./axiosClient";

/**
 * Represents a system-wide announcement or notification.
 */
export interface Announcement {
  /** Unique announcement ID */
  id: number;
  /** Subject line or title of the announcement */
  title: string;
  /** Detailed information or markdown content */
  content: string;
  /** Severity/category of the announcement */
  type: "info" | "warning" | "success";
  /** Scheduled start time for visibility */
  starts_at: string | null;
  /** Scheduled end time for visibility */
  ends_at: string | null;
  /** Toggle for manual activation/deactivation */
  is_active: boolean;
  /** ISO creation timestamp */
  created_at: string;
}

/**
 * Snapshot of system operation metrics and health status.
 */
export interface OperationalStats {
  /** Count of users currently logged into the system */
  online_users: number;
  /** Count of new files uploaded in the last 24 hours */
  new_files_24h: number;
  /** Current count of unresolved tasks */
  active_tasks: number;
  /** Human-readable storage usage string (e.g., "1.2GB") */
  storage_used: string;
  /** Count of currently visible announcements */
  active_announcements: number;
  /** Total user population in the database */
  total_users: number;
  /** Current server CPU load percentage */
  cpu_load: number;
  /** Global database connection status */
  db_status: boolean;
  /** Count of outstanding security alerts */
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
    const response = await apiClient.get<{ data: OperationalStats }>("/api/v1/admin/system-settings/stats");
    return response.data.data;
  },

  /**
   * Lists administrative announcements with optional keyword search.
   * @param search - Optional keyword to filter announcements.
   * @returns Array of announcement records.
   */
  getAnnouncements: async (search?: string) => {
    const response = await apiClient.get<{ data: Announcement[] }>("/api/v1/admin/announcements", {
      params: { search },
    });
    return response.data.data;
  },

  /**
   * Posts a new system announcement.
   * @param data - Partial announcement data.
   * @returns The created announcement object.
   */
  createAnnouncement: async (data: Partial<Announcement>) => {
    const response = await apiClient.post<{ data: Announcement }>("/api/v1/admin/announcements", data);
    return response.data.data;
  },

  /**
   * Updates an existing announcement's details or activation state.
   * @param id - The ID of the announcement to modify.
   * @param data - Subset of fields to update.
   * @returns The updated announcement object.
   */
  updateAnnouncement: async (id: number, data: Partial<Announcement>) => {
    const response = await apiClient.patch<{ data: Announcement }>(`/api/v1/admin/announcements/${id}`, data);
    return response.data.data;
  },

  /**
   * Permanently removes a system announcement.
   * @param id - The target announcement ID.
   */
  deleteAnnouncement: async (id: number) => {
    await apiClient.delete(`/api/v1/admin/announcements/${id}`);
  },
};
