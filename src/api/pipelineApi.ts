import axiosClient from "@/api/axiosClient";
import { ApiEnvelope, PaginatedData } from "@/types/api";
import { useAuthStore } from "@/store/useAuthStore";

export interface PipelineProject {
  id: string;
  project_code: string;
  project_name: string;
  partner_id?: string | null;
  delegation_id?: string | null;
  country_id: string;
  sector_id: string;
  stage_id: string;
  estimated_value?: number | null;
  success_probability?: number | null;
  expected_close_date?: string | null;
  owner_user_id: string;
  status: "active" | "hidden";
  changed_at?: string;
}

export interface PipelineSummaryStageItem {
  stageId: string;
  stageCode: string;
  stageName: string;
  stageOrder: number;
  projectCount: number;
  totalValue: number;
}

export interface PipelineSummaryCountryItem {
  countryName: string;
  projectCount: number;
  totalValue: number;
}

export interface PipelineSummarySectorItem {
  sectorName: string;
  projectCount: number;
  totalValue: number;
}

export interface PipelineSummary {
  stats: {
    projects: number;
    activeProjects: number;
    closedWonProjects: number;
    averageProbability: number;
  };
  value: {
    total: number;
    active: number;
  };
  stageBreakdown: PipelineSummaryStageItem[];
  countryBreakdown: PipelineSummaryCountryItem[];
  sectorBreakdown: PipelineSummarySectorItem[];
  recentProjects: PipelineProject[];
}

/**
 * Gets the base URL prefix based on the current user's role.
 */
const getPrefix = () => {
  const role = useAuthStore.getState().user?.role || "staff";
  const mappedRole = role.toLowerCase() === "admin" ? "director" : role.toLowerCase();
  return `/api/v1/${mappedRole}/pipeline`;
};

export const pipelineApi = {
  summary: async () => {
    const response = await axiosClient.get<ApiEnvelope<PipelineSummary>>(`${getPrefix()}/summary`);
    return response.data;
  },
  listProjects: async (query?: { stage_id?: string; delegation_id?: string; page?: number; per_page?: number }) => {
    const response = await axiosClient.get<ApiEnvelope<PaginatedData<PipelineProject>>>(`${getPrefix()}/projects`, {
      params: query,
    });
    return response.data;
  },
  showProject: async (id: string) => {
    const response = await axiosClient.get<ApiEnvelope<PipelineProject>>(`${getPrefix()}/projects/${id}`);
    return response.data;
  },
  createProject: async (payload: Partial<PipelineProject>) => {
    const response = await axiosClient.post<ApiEnvelope<PipelineProject>>(`${getPrefix()}/projects`, payload);
    return response.data;
  },
  updateProject: async (id: string, payload: Partial<PipelineProject>) => {
    const response = await axiosClient.patch<ApiEnvelope<PipelineProject>>(`${getPrefix()}/projects/${id}`, payload);
    return response.data;
  },
  deleteProject: async (id: string) => {
    const response = await axiosClient.delete<ApiEnvelope<void>>(`${getPrefix()}/projects/${id}`);
    return response.data;
  },
  patchStage: async (id: string, new_stage_id: string, reason?: string) => {
    const response = await axiosClient.patch<ApiEnvelope<{ stage_id: string; changed_at: string }>>(`${getPrefix()}/projects/${id}/stage`, {
      new_stage_id,
      reason,
    });
    return response.data;
  },
};
