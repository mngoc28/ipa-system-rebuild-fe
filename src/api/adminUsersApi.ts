import axiosClient from "@/api/axiosClient";
import { ApiEnvelope, PaginatedData } from "@/types/api";
import { useAuthStore } from "@/store/useAuthStore";

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
  const mappedRole = role.toLowerCase() === "admin" ? "director" : role.toLowerCase();
  return `/api/v1/${mappedRole}/users`;
};

export const adminUsersApi = {
  list: async (query: AdminUsersQuery) => {
    const response = await axiosClient.get<ApiEnvelope<PaginatedData<AdminUser>>>(`${getPrefix()}`, {
      params: query,
    });
    return response.data;
  },
  get: async (userId: string) => {
    const response = await axiosClient.get<ApiEnvelope<AdminUser>>(`${getPrefix()}/${userId}`);
    return response.data;
  },
  create: async (payload: CreateAdminUserPayload) => {
    const response = await axiosClient.post<ApiEnvelope<AdminUser>>(`${getPrefix()}`, payload);
    return response.data;
  },
  patch: async (userId: string, payload: UpdateAdminUserPayload) => {
    const response = await axiosClient.patch<ApiEnvelope<AdminUser>>(`${getPrefix()}/${userId}`, payload);
    return response.data;
  },
  lock: async (userId: string, locked: boolean) => {
    const response = await axiosClient.patch<ApiEnvelope<{ locked: boolean }>>(`${getPrefix()}/${userId}/lock`, {
      locked,
    });
    return response.data;
  },
  delete: async (userId: string) => {
    const response = await axiosClient.delete<ApiEnvelope<{ deleted: boolean }>>(`${getPrefix()}/${userId}`);
    return response.data;
  },
};
