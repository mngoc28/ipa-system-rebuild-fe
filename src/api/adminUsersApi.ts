import axiosClient from "@/api/axiosClient";
import { ApiEnvelope, PaginatedData } from "@/types/api";

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  roles: string[];
  permissions: string[];
  unit: { id: string; unit_code?: string; unit_name?: string } | null;
  status: string;
  locked: boolean;
}

export interface AdminUsersQuery {
  keyword?: string;
  status?: "active" | "inactive";
  page?: number;
  pageSize?: number;
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

export const adminUsersApi = {
  list: async (query: AdminUsersQuery) => {
    const response = await axiosClient.get<ApiEnvelope<PaginatedData<AdminUser>>>("/api/v1/admin/users", {
      params: query,
    });
    return response.data;
  },
  get: async (userId: string) => {
    const response = await axiosClient.get<ApiEnvelope<AdminUser>>(`/api/v1/admin/users/${userId}`);
    return response.data;
  },
  create: async (payload: CreateAdminUserPayload) => {
    const response = await axiosClient.post<ApiEnvelope<AdminUser>>("/api/v1/admin/users", payload);
    return response.data;
  },
  patch: async (userId: string, payload: UpdateAdminUserPayload) => {
    const response = await axiosClient.patch<ApiEnvelope<AdminUser>>(`/api/v1/admin/users/${userId}`, payload);
    return response.data;
  },
  lock: async (userId: string, locked: boolean) => {
    const response = await axiosClient.patch<ApiEnvelope<{ locked: boolean }>>(`/api/v1/admin/users/${userId}/lock`, {
      locked,
    });
    return response.data;
  },
};
