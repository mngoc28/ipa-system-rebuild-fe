import { create } from "zustand";
import { notificationsApi } from "@/api/notificationsApi";
import { approvalsApi } from "@/api/approvalsApi";
import { useAuthStore } from "@/store/useAuthStore";

interface NotificationState {
  unreadCount: number;
  pendingApprovalsCount: number;
  isLoading: boolean;
  lastUpdated: number | null;
  
  // Actions
  fetchCounts: () => Promise<void>;
  setUnreadCount: (count: number) => void;
  incrementUnreadCount: () => void;
  decrementUnreadCount: () => void;
  reset: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  unreadCount: 0,
  pendingApprovalsCount: 0,
  isLoading: false,
  lastUpdated: null,

  fetchCounts: async () => {
    // Prevent double fetching if updated recently (e.g., within 30 seconds)
    const now = Date.now();
    const last = get().lastUpdated;
    if (last && now - last < 30000 && !get().isLoading) {
      // Small cooldown to avoid spamming APIs on every mount
      // return;
    }

    const { user } = useAuthStore.getState();
    if (!user) return;

    set({ isLoading: true });
    try {
      const [notifRes, approvalRes] = await Promise.all([
        notificationsApi.getCount(),
        user.role !== 'Staff' ? approvalsApi.getSummary() : Promise.resolve(null),
      ]);

      set({
        unreadCount: notifRes.data?.unreadCount || 0,
        pendingApprovalsCount: approvalRes ? (approvalRes.data?.pendingCount || 0) : 0,
        lastUpdated: Date.now(),
        isLoading: false
      });
    } catch (error) {
      console.error("Failed to fetch notification counts:", error);
      set({ isLoading: false });
    }
  },

  setUnreadCount: (count: number) => {
    set({ unreadCount: count });
  },

  incrementUnreadCount: () => {
    set((state) => ({ unreadCount: state.unreadCount + 1 }));
  },

  decrementUnreadCount: () => {
    set((state) => ({ unreadCount: Math.max(0, state.unreadCount - 1) }));
  },

  reset: () => {
    set({ unreadCount: 0, pendingApprovalsCount: 0, lastUpdated: null });
  }
}));
