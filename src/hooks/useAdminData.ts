import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi, Announcement } from "@/api/adminApi";

/**
 * Hook to retrieve operational health statistics for the administration dashboard.
 * Includes CPU load, database status, and user counts.
 * Refetches automatically every 60 seconds.
 */
export const useAdminOperationalStats = () => {
  return useQuery({
    queryKey: ["admin", "operational-stats"],
    queryFn: () => adminApi.getOperationalStats(),
    refetchInterval: 60000, // Refetch every minute
  });
};

/**
 * Hook to fetch the list of system-wide announcements.
 * @param search - Optional keyword to filter announcements by title or content.
 */
export const useAnnouncementsList = (search?: string) => {
  return useQuery({
    queryKey: ["admin", "announcements", search],
    queryFn: () => adminApi.getAnnouncements(search),
  });
};

/**
 * Hook to create a new system announcement.
 * Automatically invalidates the announcements list on success.
 */
export const useCreateAnnouncement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Announcement>) => adminApi.createAnnouncement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "announcements"] });
    },
  });
};

/**
 * Hook to update an existing system announcement.
 * @returns A mutation object accepting { id, data }.
 */
export const useUpdateAnnouncement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Announcement> }) => 
      adminApi.updateAnnouncement(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "announcements"] });
    },
  });
};

/**
 * Hook to permanently delete an announcement.
 * @returns A mutation object accepting the announcement ID.
 */
export const useDeleteAnnouncement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminApi.deleteAnnouncement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "announcements"] });
    },
  });
};
