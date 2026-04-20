import axiosClient from "@/api/axiosClient";
import { ApiEnvelope, PaginatedData } from "@/types/api";
import { useAuthStore } from "@/store/useAuthStore";
import type {
  PartnerApiItem,
  PartnerDetailApiItem,
  PartnerContactPayload,
  PartnerCreatePayload,
  PartnerOptionsResponse,
  PartnerPatchPayload,
} from "@/dataHelper/partners.dataHelper";

const getPrefix = () => {
  const role = useAuthStore.getState().user?.role || "staff";
  const mappedRole = role.toLowerCase() === "admin" ? "director" : role.toLowerCase();
  return `/api/v1/${mappedRole}/partners`;
};

export const partnersApi = {
  list: async (query?: {
    status?: number;
    page?: number;
    pageSize?: number;
    search?: string;
    sectorId?: number;
    countryId?: number;
  }) => {
    const response = await axiosClient.get<ApiEnvelope<PaginatedData<PartnerApiItem>>>(`${getPrefix()}`, {
      params: query,
    });
    return response.data;
  },

  options: async () => {
    const response = await axiosClient.get<ApiEnvelope<PartnerOptionsResponse>>(`${getPrefix()}/options`);
    return response.data;
  },

  get: async (id: string) => {
    const response = await axiosClient.get<ApiEnvelope<PartnerDetailApiItem>>(`${getPrefix()}/${id}`);
    return response.data;
  },

  create: async (payload: PartnerCreatePayload) => {
    const response = await axiosClient.post<ApiEnvelope<PartnerApiItem>>(`${getPrefix()}`, payload);
    return response.data;
  },

  update: async (id: string, payload: PartnerPatchPayload) => {
    const response = await axiosClient.patch<ApiEnvelope<PartnerApiItem>>(`${getPrefix()}/${id}`, payload);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await axiosClient.delete<ApiEnvelope<null>>(`${getPrefix()}/${id}`);
    return response.data;
  },

  addContact: async (id: string, payload: PartnerContactPayload) => {
    const response = await axiosClient.post<ApiEnvelope<{ id: string }>>(`${getPrefix()}/${id}/contacts`, payload);
    return response.data;
  },

  addInteraction: async (id: string, payload: { interactionType: number; interactionAt: string; summary: string }) => {
    const response = await axiosClient.post<ApiEnvelope<{ id: string }>>(`${getPrefix()}/${id}/interactions`, payload);
    return response.data;
  },
};
