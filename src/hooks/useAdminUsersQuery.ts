import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AppInitData } from "@/dataHelper/auth.dataHelper";
import type { ApiEnvelope, PaginatedData } from "@/types/api";
import {
  adminUsersApi,
  type AdminUsersQuery,
  type AdminUser,
  type AdminRole,
  type AdminUnit,
  type CreateAdminUserPayload,
  type UpdateAdminUserPayload,
} from "@/api/adminUsersApi";

/**
 * Hook to retrieve a paginated list of administrative users with filtering and sorting.
 * @param query - Search, role, status, and pagination parameters.
 */
export const useAdminUsersListQuery = (query: AdminUsersQuery, enabled = true) => {
  const queryClient = useQueryClient();
  const initCache = queryClient.getQueryData<ApiEnvelope<AppInitData>>(["app-init"]);

  // If query is for the first page with 100 items and no filters, use init cache as initial data
  const isSimpleList = query.pageSize === 100 && !query.keyword && !query.unitId && !query.status && (query.page === 1 || !query.page);

  return useQuery({
    queryKey: ["admin-users", query],
    queryFn: () => adminUsersApi.list(query),
    initialData: isSimpleList ? () => {
      const users = initCache?.masterData?.users as AdminUser[] | undefined;
      if (users) {
        return {
          success: true,
          message: "Loaded from cache",
          items: users,
          meta: {
            total: users.length,
            per_page: 100,
            current_page: 1,
            total_pages: 1,
            totalPages: 1
          }
        } as unknown as ApiEnvelope<PaginatedData<AdminUser>>;
      }
      return undefined;
    } : undefined,
    placeholderData: (previousData) => previousData,
    enabled,
    staleTime: 1000 * 60 * 60, // 1 hour
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
      queryClient.invalidateQueries({ queryKey: ["app-init"] }); // Also invalidate init cache to refresh user list
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
      queryClient.invalidateQueries({ queryKey: ["app-init"] });
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
    staleTime: 1000 * 60 * 5, // 5 minutes
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
      queryClient.invalidateQueries({ queryKey: ["app-init"] });
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
      queryClient.invalidateQueries({ queryKey: ["app-init"] });
    },
  });
};

/**
 * Hook to retrieve all available system roles for user assignment.
 */
export const useAdminRolesQuery = () => {
  const queryClient = useQueryClient();
  const initCache = queryClient.getQueryData<ApiEnvelope<AppInitData>>(["app-init"]);

  return useQuery({
    queryKey: ["admin-roles"],
    queryFn: () => adminUsersApi.listRoles(),
    initialData: initCache?.masterData?.roles ? { success: true, items: initCache.masterData.roles as AdminRole[] } : undefined,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

/**
 * Hook to retrieve all available organizational units.
 */
export const useAdminUnitsQuery = () => {
  const queryClient = useQueryClient();
  const initCache = queryClient.getQueryData<ApiEnvelope<AppInitData>>(["app-init"]);

  return useQuery({
    queryKey: ["admin-units"],
    queryFn: () => adminUsersApi.listUnits(),
    initialData: initCache?.masterData?.units ? { success: true, items: initCache.masterData.units as AdminUnit[] } : undefined,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

export const useResetAdminPasswordMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => adminUsersApi.resetPassword(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
};
