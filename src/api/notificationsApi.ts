import axiosClient from "@/api/axiosClient";
import { ApiEnvelope, PaginatedData } from "@/types/api";

const buildMockIdentityHeaders = () => {
  try {
    const rawState = localStorage.getItem("ipa-auth-storage");

    if (!rawState) {
      return {};
    }

    const parsed = JSON.parse(rawState) as { state?: { user?: { username?: string; email?: string } } };
    const username = parsed?.state?.user?.username?.trim();
    const email = parsed?.state?.user?.email?.trim();

    return {
      ...(username ? { "X-Mock-Username": username } : {}),
      ...(email ? { "X-Mock-Email": email } : {}),
    };
  } catch {
    return {};
  }
};

export interface NotificationItem {
  id: string;
  type?: string;
  title?: string;
  description?: string;
  message?: string;
  refTable?: string;
  refId?: string | number;
  severity?: number;
  createdAt?: string;
  readAt?: string | null;
}

export interface NotificationsData extends PaginatedData<NotificationItem> {
  unreadCount: number;
}

export const notificationsApi = {
  list: async (query?: { unreadOnly?: boolean; page?: number; pageSize?: number }) => {
    const response = await axiosClient.get<ApiEnvelope<NotificationsData>>("/api/v1/staff/notifications", {
      params: query,
      headers: buildMockIdentityHeaders(),
    });
    return response.data;
  },
  read: async (id: string) => {
    const response = await axiosClient.patch<ApiEnvelope<{ readAt: string }>>(`/api/v1/staff/notifications/${id}/read`, { read: true }, { headers: buildMockIdentityHeaders() });
    return response.data;
  },
  readAll: async () => {
    const response = await axiosClient.patch<ApiEnvelope<{ updatedCount: number }>>("/api/v1/staff/notifications/read-all", {}, { headers: buildMockIdentityHeaders() });
    return response.data;
  },
  deleteRead: async () => {
    const response = await axiosClient.delete<ApiEnvelope<{ deletedCount: number }>>("/api/v1/staff/notifications/read", { headers: buildMockIdentityHeaders() });
    return response.data;
  },
  getCount: async () => {
    const response = await axiosClient.get<ApiEnvelope<{ unreadCount: number }>>("/api/v1/staff/notifications/count", { headers: buildMockIdentityHeaders() });
    return response.data;
  },
};
