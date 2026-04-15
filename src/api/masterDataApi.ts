import axiosClient from "@/api/axiosClient";
import { ApiEnvelope } from "@/types/api";

export interface MasterDataItem {
  id: string;
  code: string;
  name_vi: string;
  name_en?: string;
  sort_order?: number;
  is_active?: boolean;
}

export const masterDataApi = {
  list: async (domain: string) => {
    const response = await axiosClient.get<ApiEnvelope<{ items: MasterDataItem[] }>>(`/api/v1/master-data/${domain}`);
    return response.data;
  },
  create: async (domain: string, payload: { code: string; name_vi: string; name_en?: string; sort_order?: number; is_active?: boolean }) => {
    const response = await axiosClient.post<ApiEnvelope<MasterDataItem>>(`/api/v1/master-data/${domain}`, payload);
    return response.data;
  },
  patch: async (domain: string, id: string, payload: Partial<{ code: string; name_vi: string; name_en: string; sort_order: number; is_active: boolean }>) => {
    const response = await axiosClient.patch<ApiEnvelope<{ updated: boolean }>>(`/api/v1/master-data/${domain}/${id}`, payload);
    return response.data;
  },
  delete: async (domain: string, id: string) => {
    await axiosClient.delete(`/api/v1/master-data/${domain}/${id}`);
  },
};
