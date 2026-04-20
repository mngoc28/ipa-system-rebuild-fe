import axiosClient from "@/api/axiosClient";
import { ApiEnvelope } from "@/types/api";
import { useAuthStore } from "@/store/useAuthStore";

/**
 * Represents a standardized reference data item (e.g., status, type, region).
 */
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

/**
 * API service for managing shared lookup tables and reference data.
 */
export const masterDataApi = {
  /**
   * Lists standardized items for a specific domain (e.g., countries, statuses).
   * @param domain - The category or scope of master data.
   * @returns List of matching master data items.
   */
  list: async (domain: string) => {
    const response = await axiosClient.get<ApiEnvelope<{ items: MasterDataItem[] }>>(`${getPrefix()}/${domain}`);
    return response.data;
  },

  /**
   * Registers a new master data record for a domain.
   * @param domain - Target category.
   * @param payload - Details for the new record.
   * @returns The created master data object.
   */
  create: async (domain: string, payload: { code: string; name_vi: string; name_en?: string; sort_order?: number; is_active?: boolean }) => {
    const response = await axiosClient.post<ApiEnvelope<MasterDataItem>>(`${getPrefix()}/${domain}`, payload);
    return response.data;
  },

  /**
   * Updates an existing master data entry.
   * @param domain - Data category.
   * @param id - Entry ID.
   * @param payload - Subset of fields to update.
   * @returns Update confirmation.
   */
  patch: async (domain: string, id: string, payload: Partial<{ code: string; name_vi: string; name_en: string; sort_order: number; is_active: boolean }>) => {
    const response = await axiosClient.patch<ApiEnvelope<{ updated: boolean }>>(`${getPrefix()}/${domain}/${id}`, payload);
    return response.data;
  },

  /**
   * Permanently removes a master data entry.
   * @param domain - Data category.
   * @param id - ID of the record to delete.
   */
  delete: async (domain: string, id: string) => {
    await axiosClient.delete(`${getPrefix()}/${domain}/${id}`);
  },
};
