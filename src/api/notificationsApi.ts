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

/**
 * Represents a system or process notification sent to a user.
 */
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

/**
 * API service for user notifications, updates, and lifecycle management.
 */
export const notificationsApi = {
  /**
   * Fetches a paginated list of notifications.
   * @param query - Optional filter to show only unread items and pagination context.
   * @returns Notification data including list of items and unread count.
   */
  list: async (query?: { unreadOnly?: boolean; page?: number; pageSize?: number }) => {
    const response = await axiosClient.get<ApiEnvelope<NotificationsData>>("/api/v1/staff/notifications", {
      params: query,
      headers: buildMockIdentityHeaders(),
    });
    return response.data;
  },

  /**
   * Marks a specific notification as read.
   * @param id - The target notification ID.
   * @returns Update confirmation with the readAt timestamp.
   */
  read: async (id: string) => {
    const response = await axiosClient.patch<ApiEnvelope<{ readAt: string }>>(`/api/v1/staff/notifications/${id}/read`, { read: true }, { headers: buildMockIdentityHeaders() });
    return response.data;
  },

  /**
   * Marks all pending notifications for the current user as read.
   * @returns The number of notifications updated.
   */
  readAll: async () => {
    const response = await axiosClient.patch<ApiEnvelope<{ updatedCount: number }>>("/api/v1/staff/notifications/read-all", {}, { headers: buildMockIdentityHeaders() });
    return response.data;
  },

  /**
   * Permanently deletes notifications that have already been read.
   * @returns The number of notifications deleted.
   */
  deleteRead: async () => {
    const response = await axiosClient.delete<ApiEnvelope<{ deletedCount: number }>>("/api/v1/staff/notifications/read", { headers: buildMockIdentityHeaders() });
    return response.data;
  },

  /**
   * Retrieves the current count of unread notifications.
   * @returns The unread count object.
   */
  getCount: async () => {
    const response = await axiosClient.get<ApiEnvelope<{ unreadCount: number }>>("/api/v1/staff/notifications/count", { headers: buildMockIdentityHeaders() });
    return response.data;
  },
};
