import axiosClient from "@/api/axiosClient";
import { ApiEnvelope, PaginatedData } from "@/types/api";
import type {
  PartnerApiItem,
  PartnerDetailApiItem,
  PartnerContactPayload,
  PartnerCreatePayload,
  PartnerOptionsResponse,
  PartnerPatchPayload,
} from "@/dataHelper/partners.dataHelper";

export const partnersApi = {
  list: async (query?: {
    status?: number;
    page?: number;
    pageSize?: number;
    search?: string;
    sectorId?: number;
    countryId?: number;
  }) => {
    const response = await axiosClient.get<ApiEnvelope<PaginatedData<PartnerApiItem>>>("/api/v1/partners", {
      params: query,
    });
    return response.data;
  },

  options: async () => {
    const response = await axiosClient.get<ApiEnvelope<PartnerOptionsResponse>>("/api/v1/partners/options");
    return response.data;
  },

  get: async (id: string) => {
    const response = await axiosClient.get<ApiEnvelope<PartnerDetailApiItem>>(`/api/v1/partners/${id}`);
    return response.data;
  },

  create: async (payload: PartnerCreatePayload) => {
    const response = await axiosClient.post<ApiEnvelope<PartnerApiItem>>("/api/v1/partners", payload);
    return response.data;
  },

  update: async (id: string, payload: PartnerPatchPayload) => {
    const response = await axiosClient.patch<ApiEnvelope<PartnerApiItem>>(`/api/v1/partners/${id}`, payload);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await axiosClient.delete<ApiEnvelope<null>>(`/api/v1/partners/${id}`);
    return response.data;
  },

  addContact: async (id: string, payload: PartnerContactPayload) => {
    const response = await axiosClient.post<ApiEnvelope<{ id: string }>>(`/api/v1/partners/${id}/contacts`, payload);
    return response.data;
  },

  addInteraction: async (id: string, payload: { interactionType: number; interactionAt: string; summary: string }) => {
    const response = await axiosClient.post<ApiEnvelope<{ id: string }>>(`/api/v1/partners/${id}/interactions`, payload);
    return response.data;
  },
};
