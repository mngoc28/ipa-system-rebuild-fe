import axiosClient from "@/api/axiosClient";
import { ApiEnvelope } from "@/types/api";
import { useAuthStore } from "@/store/useAuthStore";

export interface MasterDataItem {
  id: string;
  code: string;
  name_vi: string;
  name_en?: string;
  sort_order?: number;
  is_active?: boolean;
}

const getPrefix = () => {
  const role = useAuthStore.getState().user?.role || "staff";
  const mappedRole = role.toLowerCase() === "admin" ? "director" : role.toLowerCase();
  return `/api/v1/${mappedRole}/master-data`;
};

export const masterDataApi = {
  list: async (domain: string) => {
    const response = await axiosClient.get<ApiEnvelope<{ items: MasterDataItem[] }>>(`${getPrefix()}/${domain}`);
    return response.data;
  },
  create: async (domain: string, payload: { code: string; name_vi: string; name_en?: string; sort_order?: number; is_active?: boolean }) => {
    const response = await axiosClient.post<ApiEnvelope<MasterDataItem>>(`${getPrefix()}/${domain}`, payload);
    return response.data;
  },
  patch: async (domain: string, id: string, payload: Partial<{ code: string; name_vi: string; name_en: string; sort_order: number; is_active: boolean }>) => {
    const response = await axiosClient.patch<ApiEnvelope<{ updated: boolean }>>(`${getPrefix()}/${domain}/${id}`, payload);
    return response.data;
  },
  delete: async (domain: string, id: string) => {
    await axiosClient.delete(`${getPrefix()}/${domain}/${id}`);
  },
};
