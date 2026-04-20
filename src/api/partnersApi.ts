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

/**
 * API service for managing partner organizations, contacts, and interactions.
 */
export const partnersApi = {
  /**
   * Fetches a filtered and paginated list of partners.
   * @param query - Search keywords, status filters, and location/sector parameters.
   * @returns Paginated list of partner records.
   */
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

  /**
   * Retrieves available options and master data for partner classification.
   * @returns Reference data for sectors, statuses, etc.
   */
  options: async () => {
    const response = await axiosClient.get<ApiEnvelope<PartnerOptionsResponse>>(`${getPrefix()}/options`);
    return response.data;
  },

  /**
   * Fetches detailed information for a specific partner.
   * @param id - The partner ID.
   * @returns Comprehensive partner detail object.
   */
  get: async (id: string) => {
    const response = await axiosClient.get<ApiEnvelope<PartnerDetailApiItem>>(`${getPrefix()}/${id}`);
    return response.data;
  },

  /**
   * Registers a new partner organization.
   * @param payload - Initial partner data and classification.
   * @returns The created partner record.
   */
  create: async (payload: PartnerCreatePayload) => {
    const response = await axiosClient.post<ApiEnvelope<PartnerApiItem>>(`${getPrefix()}`, payload);
    return response.data;
  },

  /**
   * Updates partial information for an existing partner.
   * @param id - Target partner ID.
   * @param payload - Fields to modify.
   * @returns Updated partner record.
   */
  update: async (id: string, payload: PartnerPatchPayload) => {
    const response = await axiosClient.patch<ApiEnvelope<PartnerApiItem>>(`${getPrefix()}/${id}`, payload);
    return response.data;
  },

  /**
   * Permanently removes a partner organization from the system.
   * @param id - ID of the partner to delete.
   * @returns Success confirmation.
   */
  delete: async (id: string) => {
    const response = await axiosClient.delete<ApiEnvelope<null>>(`${getPrefix()}/${id}`);
    return response.data;
  },

  /**
   * Adds a new contact person to the partner organization.
   * @param id - The partner ID.
   * @param payload - Contact information (name, role, etc.).
   * @returns The ID of the created contact.
   */
  addContact: async (id: string, payload: PartnerContactPayload) => {
    const response = await axiosClient.post<ApiEnvelope<{ id: string }>>(`${getPrefix()}/${id}/contacts`, payload);
    return response.data;
  },

  /**
   * Logs a new interaction (meeting, call, etc.) with the partner.
   * @param id - The partner ID.
   * @param payload - Interaction details and timestamp.
   * @returns The ID of the logged interaction.
   */
  addInteraction: async (id: string, payload: { interactionType: number; interactionAt: string; summary: string }) => {
    const response = await axiosClient.post<ApiEnvelope<{ id: string }>>(`${getPrefix()}/${id}/interactions`, payload);
    return response.data;
  },
};
