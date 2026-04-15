import axiosClient from "@/api/axiosClient";
import { ApiEnvelope, PaginatedData } from "@/types/api";
import type {
  CreateDelegationPayload,
  DelegationApiItem,
  DelegationsQuery,
} from "@/dataHelper/delegations.dataHelper";

export const delegationsApi = {
  list: async (query?: DelegationsQuery) => {
    const response = await axiosClient.get<ApiEnvelope<PaginatedData<DelegationApiItem>>>("/api/v1/delegations", {
      params: query,
    });
    return response.data;
  },

  getById: async (id: string | number) => {
    const response = await axiosClient.get<ApiEnvelope<DelegationApiItem>>(`/api/v1/delegations/${id}`);
    return response.data;
  },

  create: async (payload: CreateDelegationPayload) => {
    const response = await axiosClient.post<ApiEnvelope<DelegationApiItem>>("/api/v1/delegations", payload);
    return response.data;
  },

  update: async (id: string | number, payload: Partial<CreateDelegationPayload>) => {
    const response = await axiosClient.patch<ApiEnvelope<DelegationApiItem>>(`/api/v1/delegations/${id}`, payload);
    return response.data;
  },

  delete: async (id: string | number) => {
    const response = await axiosClient.delete<ApiEnvelope<void>>(`/api/v1/delegations/${id}`);
    return response.data;
  },
};
