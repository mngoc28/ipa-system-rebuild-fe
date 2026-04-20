import apiClient from "./axiosClient";

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

export const adminApi = {
  getOperationalStats: async () => {
    const response = await apiClient.get<{ data: OperationalStats }>("/api/v1/admin/system-settings/stats");
    return response.data.data;
  },

  getAnnouncements: async (search?: string) => {
    const response = await apiClient.get<{ data: Announcement[] }>("/api/v1/admin/announcements", {
      params: { search },
    });
    return response.data.data;
  },

  createAnnouncement: async (data: Partial<Announcement>) => {
    const response = await apiClient.post<{ data: Announcement }>("/api/v1/admin/announcements", data);
    return response.data.data;
  },

  updateAnnouncement: async (id: number, data: Partial<Announcement>) => {
    const response = await apiClient.patch<{ data: Announcement }>(`/api/v1/admin/announcements/${id}`, data);
    return response.data.data;
  },

  deleteAnnouncement: async (id: number) => {
    await apiClient.delete(`/api/v1/admin/announcements/${id}`);
  },
};
