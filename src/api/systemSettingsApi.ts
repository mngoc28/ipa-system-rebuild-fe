import axiosClient from "@/api/axiosClient";
import { ApiEnvelope } from "@/types/api";

/**
 * Represents a single configurable system configuration record.
 */
export interface SystemSettingItem {
  /** Unique key identifying the setting */
  key: string;
  /** Categorization for logical grouping (e.g., SMTP, CLOUDINARY, STORAGE) */
  group: string;
  /** readable title describing the setting */
  label: string;
  /** The current configuration value */
  value: string | null;
  /** Redacted or masked value for sensitive data (e.g., *******) */
  maskedValue?: string | null;
  /** If true, the value contains sensitive information and should be masked */
  is_secret: boolean;
  /** Computed indicator that a value has been set */
  has_value?: boolean;
  /** Potential list of predefined values for select-based configuration */
  options?: string[];
  /** Last modification timestamp */
  updated_at?: string | null;
}

/**
 * Envelope for a list of system settings.
 */
export interface SystemSettingsListData {
  /** The collection of setting records */
  items: SystemSettingItem[];
}

/**
 * Data structure for batch updating system settings.
 */
export interface SystemSettingsUpdatePayload {
  /** List of key-value pairs to set */
  items: Array<{
    /** The configuration key */
    key: string;
    /** The new value to persist */
    value: string;
  }>;
}

/**
 * Health check and performance data for an external integration.
 */
export interface IntegrationTestData {
  /** The name of the integrated provider */
  provider: string;
  /** Response status or result message */
  status: string;
  /** Execution time in milliseconds */
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