import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  adminUsersApi,
  type AdminUsersQuery,
  type CreateAdminUserPayload,
  type UpdateAdminUserPayload,
} from "@/api/adminUsersApi";

/**
 * Hook to retrieve a paginated list of administrative users with filtering and sorting.
 * @param query - Search, role, status, and pagination parameters.
 */
export const useAdminUsersListQuery = (query: AdminUsersQuery) => {
  return useQuery({
    queryKey: ["admin-users", query],
    queryFn: () => adminUsersApi.list(query),
    placeholderData: (previousData) => previousData,
  });
};

/**
 * Hook to onboard a new administrative user.
 * Invalidates the main user list on successful creation.
 */
export const useCreateAdminUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAdminUserPayload) => adminUsersApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
};

/**
 * Hook to partially update an administrative user's profile or account details.
 * @returns A mutation object accepting { userId, payload }.
 */
export const usePatchAdminUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: UpdateAdminUserPayload }) => adminUsersApi.patch(userId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
};

/**
 * Hook to fetch detailed information for a specific administrative user by ID.
 * @param userId - Target user identifier.
 * @param enabled - Boolean flag to control whether the query should run automatically.
 */
export const useAdminUserQuery = (userId?: string, enabled = true) => {
  return useQuery({
    queryKey: ["admin-user", userId],
    queryFn: () => adminUsersApi.get(userId || ""),
    enabled: Boolean(userId) && enabled,
  });
};

/**
 * Hook to lock or unlock an administrative user account.
 * Useful for suspending access without total deletion.
 * @returns A mutation object accepting { userId, locked }.
 */
export const useLockAdminUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, locked }: { userId: string; locked: boolean }) => adminUsersApi.lock(userId, locked),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
};

/**
 * Hook to permanently delete an administrative user account.
 * @returns A mutation object accepting the userId string.
 */
export const useDeleteAdminUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => adminUsersApi.delete(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
};
