import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi, Announcement } from "@/api/adminApi";

export const useAdminOperationalStats = () => {
  return useQuery({
    queryKey: ["admin", "operational-stats"],
    queryFn: () => adminApi.getOperationalStats(),
    refetchInterval: 60000, // Refetch every minute
  });
};

export const useAnnouncementsList = (search?: string) => {
  return useQuery({
    queryKey: ["admin", "announcements", search],
    queryFn: () => adminApi.getAnnouncements(search),
  });
};

export const useCreateAnnouncement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Announcement>) => adminApi.createAnnouncement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "announcements"] });
    },
  });
};

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

export const useDeleteAnnouncement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminApi.deleteAnnouncement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "announcements"] });
    },
  });
};
