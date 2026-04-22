import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationsApi, NotificationItem, NotificationsData } from "@/api/notificationsApi";
import { useNotificationStore } from "@/store/useNotificationStore";
import { toast } from "sonner";

/**
 * Hook to fetch and manage the user's notification list.
 * Includes automatic state synchronization with the global notification store.
 */
export const useNotificationsQuery = (options?: { pageSize?: number; unreadOnly?: boolean }) => {
  const { setUnreadCount } = useNotificationStore();

  return useQuery({
    queryKey: ["notifications", options],
    queryFn: async () => {
      const response = await notificationsApi.list(options);
      if (response.success && response.data) {
        setUnreadCount(response.data.unreadCount);
        return response.data;
      }
      throw new Error(response.message || "Failed to fetch notifications");
    },
    staleTime: 1000 * 60, // 1 minute
  });
};

/**
 * Hook to mark a specific notification as read.
 */
export const useMarkNotificationReadMutation = () => {
  const queryClient = useQueryClient();
  const { unreadCount, setUnreadCount } = useNotificationStore();

  return useMutation({
    mutationFn: (id: string) => notificationsApi.read(id),
    onSuccess: (_, id) => {
      // Optimistically update the list if it exists in cache
      queryClient.setQueriesData({ queryKey: ["notifications"] }, (oldData: NotificationsData | undefined) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          items: oldData.items.map((item: NotificationItem) => 
            item.id === id ? { ...item, readAt: new Date().toISOString() } : item
          )
        };
      });
      setUnreadCount(Math.max(0, unreadCount - 1));
    },
  });
};

/**
 * Hook to mark all notifications as read.
 */
export const useMarkAllNotificationsReadMutation = () => {
  const queryClient = useQueryClient();
  const { setUnreadCount } = useNotificationStore();

  return useMutation({
    mutationFn: () => notificationsApi.readAll(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      setUnreadCount(0);
      toast.success("Đã đánh dấu tất cả là đã đọc");
    },
    onError: () => toast.error("Không thể đánh dấu tất cả đã đọc"),
  });
};

/**
 * Hook to delete all read notifications.
 */
export const useDeleteReadNotificationsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationsApi.deleteRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Đã xóa các thông báo đã đọc");
    },
    onError: () => toast.error("Không thể xóa thông báo"),
  });
};
