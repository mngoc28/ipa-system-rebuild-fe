import axiosClient from "@/api/axiosClient";
import { ApiEnvelope } from "@/types/api";

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

export interface SystemSettingsListData {
  items: SystemSettingItem[];
}

export interface SystemSettingsUpdatePayload {
  items: Array<{
    key: string;
    value: string;
  }>;
}

export interface IntegrationTestData {
  provider: string;
  status: string;
  latencyMs: number;
}

export const systemSettingsApi = {
  list: async (group?: string) => {
    const response = await axiosClient.get<ApiEnvelope<SystemSettingsListData>>("/api/v1/admin/system-settings", {
      params: group ? { group } : undefined,
    });

    return response.data;
  },
  update: async (payload: SystemSettingsUpdatePayload) => {
    const response = await axiosClient.patch<ApiEnvelope<{ updatedCount: number }>>("/api/v1/admin/system-settings", payload);

    return response.data;
  },
  testIntegration: async (provider: string) => {
    const response = await axiosClient.post<ApiEnvelope<IntegrationTestData>>(`/api/v1/admin/integrations/${provider}/test`);

    return response.data;
  },
};