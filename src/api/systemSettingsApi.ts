import axiosClient from "@/api/axiosClient";
import { ApiEnvelope } from "@/types/api";

/**
 * Represents a single configurable system configuration record.
 */
export interface SystemSettingItem {
    key: string;
    group: string;
    label: string;
    value: string | null;
    maskedValue?: string | null;
    is_secret: boolean;
    has_value?: boolean;
    options?: string[];
    updated_at?: string | null;
}

/**
 * Envelope for a list of system settings.
 */
export interface SystemSettingsListData {
    items: SystemSettingItem[];
}

/**
 * Data structure for batch updating system settings.
 */
export interface SystemSettingsUpdatePayload {
    items: Array<{
        key: string;
        value: string;
  }>;
}

/**
 * Health check and performance data for an external integration.
 */
export interface IntegrationTestData {
    provider: string;
    status: string;
    latencyMs: number;
}

/**
 * API service for system-wide configuration, environment variables, and external integration health.
 */
export const systemSettingsApi = {
  /**
   * Fetches a list of configuration items, optionally filtered by group.
   * @param group - The specific configuration cluster to retrieve.
   * @returns Collection of setting items.
   */
  list: async (group?: string) => {
    const response = await axiosClient.get<ApiEnvelope<SystemSettingsListData>>("/api/v1/admin/system-settings", {
      params: group ? { group } : undefined,
    });

    return response.data;
  },
  /**
   * Updates multiple setting values in a single batch operation.
   * @param payload - Collection of key-value pairs to update.
   * @returns Number of settings updated.
   */
  update: async (payload: SystemSettingsUpdatePayload) => {
    const response = await axiosClient.patch<ApiEnvelope<{ updatedCount: number }>>("/api/v1/admin/system-settings", payload);

    return response.data;
  },
  /**
   * Verifies the connectivity and authenticity of an external service provider.
   * @param provider - Identifer of the service (e.g., cloudinary, smtp).
   * @returns Health status and performance data.
   */
  testIntegration: async (provider: string) => {
    const response = await axiosClient.post<ApiEnvelope<IntegrationTestData>>(`/api/v1/admin/integrations/${provider}/test`);

    return response.data;
  },
};
