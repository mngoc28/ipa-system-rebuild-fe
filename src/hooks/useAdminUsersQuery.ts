import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  adminUsersApi,
  type AdminUsersQuery,
  type CreateAdminUserPayload,
  type UpdateAdminUserPayload,
} from "@/api/adminUsersApi";

export const useAdminUsersListQuery = (query: AdminUsersQuery) => {
  return useQuery({
    queryKey: ["admin-users", query],
    queryFn: () => adminUsersApi.list(query),
  });
};

export const useCreateAdminUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAdminUserPayload) => adminUsersApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
};

export const usePatchAdminUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: UpdateAdminUserPayload }) => adminUsersApi.patch(userId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
};

export const useAdminUserQuery = (userId?: string, enabled = true) => {
  return useQuery({
    queryKey: ["admin-user", userId],
    queryFn: () => adminUsersApi.get(userId || ""),
    enabled: Boolean(userId) && enabled,
  });
};

export const useLockAdminUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, locked }: { userId: string; locked: boolean }) => adminUsersApi.lock(userId, locked),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
};