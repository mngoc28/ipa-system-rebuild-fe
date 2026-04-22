import axiosClient from "@/api/axiosClient";
import { ApiEnvelope, PaginatedData } from "@/types/api";
import { useAuthStore } from "@/store/useAuthStore";

/**
 * Represents a user object managed within the administrative module.
 */
export interface AdminUser {
    id: string;
    fullName: string;
    email: string;
    role_codes: string[];
    permission_codes: string[];
    unit: { id: string; unit_code?: string; unit_name?: string } | null;
    status: string;
    locked: boolean;
    avatar?: string;
}

export interface AdminUsersQuery {
  keyword?: string;
  status?: "active" | "inactive";
  page?: number;
  pageSize?: number;
  unitId?: string;
}

export interface CreateAdminUserPayload {
  username: string;
  fullName: string;
  email: string;
  phone: string;
  unitId: string;
  roleIds: string[];
  password?: string;
}

export interface UpdateAdminUserPayload {
  username?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  unitId?: string;
  roleIds?: string[];
  status?: string;
}

export interface PatchAdminUserPayload {
  username?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  unitId?: string;
  roleIds?: string[];
  status?: string;
}

const getPrefix = () => {
  const role = useAuthStore.getState().user?.role || "staff";
  const roleStr = role.toLowerCase();
  const mappedRole = roleStr === "admin" ? "admin" : roleStr;
  return `/api/v1/${mappedRole}/users`;
};

/**
 * API service for managing administrative users and their permissions.
 */
export const adminUsersApi = {
  /**
   * Fetches a paginated list of administrative users.
   * @param query - Search patterns and pagination options.
   * @returns Paginated list of users.
   */
  list: async (query: AdminUsersQuery) => {
    const response = await axiosClient.get<ApiEnvelope<PaginatedData<AdminUser>>>(`${getPrefix()}`, {
      params: query,
    });
    return response.data;
  },

  /**
   * Retrieves full details for a specific administrative user.
   * @param userId - Unique ID of the user to fetch.
   * @returns The user data object.
   */
  get: async (userId: string) => {
    const response = await axiosClient.get<ApiEnvelope<AdminUser>>(`${getPrefix()}/${userId}`);
    return response.data;
  },

  /**
   * Creates a new administrative user record.
   * @param payload - Basic info and access roles for the new user.
   * @returns The newly created user data.
   */
  create: async (payload: CreateAdminUserPayload) => {
    const response = await axiosClient.post<ApiEnvelope<AdminUser>>(`${getPrefix()}`, payload);
    return response.data;
  },

  /**
   * Updates partial data for an existing administrative user.
   * @param userId - ID of the user to update.
   * @param payload - Subset of fields to modify.
   * @returns The updated user record.
   */
  patch: async (userId: string, payload: UpdateAdminUserPayload) => {
    const response = await axiosClient.patch<ApiEnvelope<AdminUser>>(`${getPrefix()}/${userId}`, payload);
    return response.data;
  },

  /**
   * Toggles the lock/suspension status of a user account.
   * @param userId - ID of the target user.
   * @param locked - New lock state.
   * @returns Confirmation of the new lock state.
   */
  lock: async (userId: string, locked: boolean) => {
    const response = await axiosClient.patch<ApiEnvelope<{ locked: boolean }>>(`${getPrefix()}/${userId}/lock`, {
      locked,
    });
    return response.data;
  },

  /**
   * Permanently removes an administrative user from the system.
   * @param userId - ID of the user to delete.
   * @returns Success confirmation.
   */
  delete: async (userId: string) => {
    const response = await axiosClient.delete<ApiEnvelope<{ deleted: boolean }>>(`${getPrefix()}/${userId}`);
    return response.data;
  },

  /**
   * Fetches all available system roles.
   */
  listRoles: async () => {
    const response = await axiosClient.get<ApiEnvelope<{ items: Array<{ id: string; code: string; name: string }> }>>(
      `${getPrefix()}/roles`
    );
    return response.data;
  },

  /**
   * Fetches all available organizational units.
   */
  listUnits: async () => {
    const response = await axiosClient.get<ApiEnvelope<{ items: Array<{ id: string; unitCode: string; unitName: string }> }>>(
      `${getPrefix()}/units`
    );
    return response.data;
  },

  /**
   * Resets a user's password to the default system password.
   * @param userId - ID of the user to reset.
   */
  resetPassword: async (userId: string) => {
    const response = await axiosClient.post<ApiEnvelope<null>>(`${getPrefix()}/${userId}/reset-password`);
    return response.data;
  },
};
