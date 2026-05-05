import { useQuery } from "@tanstack/react-query";
import { authApi } from "@/api/authApi";
import { getAuthToken } from "@/store/useAuthStore";
import { getAccessToken } from "@/utils/storage";
import { isJwtToken } from "@/utils/tokenUtils";
import { useNotificationStore } from "@/store/useNotificationStore";
import { useEffect } from "react";

/**
 * Hook to initialize the application state with a single API call.
 * Replaces separate calls to /me, /notifications/count, and /approvals/summary.
 */
export const useInitQuery = (enabled = true) => {
  const authToken = getAuthToken() || getAccessToken();
  const { setUnreadCount, setPendingApprovalsCount } = useNotificationStore();

  const query = useQuery({
    queryKey: ["app-init"],
    queryFn: async () => {
      const response = await authApi.init();
      return response;
    },
    enabled: enabled && isJwtToken(authToken),
    staleTime: 1000 * 60 * 60, // 1 hour for master data
  });

  // Sync with stores when data arrives
  useEffect(() => {
    if (query.data) {
      setUnreadCount(query.data.unreadCount);
      setPendingApprovalsCount(query.data.pendingApprovalsCount);
    }
  }, [query.data, setUnreadCount, setPendingApprovalsCount]);

  return query;
};
