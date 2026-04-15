import axiosClient from "@/api/axiosClient";
import { ApiEnvelope, PaginatedData } from "@/types/api";

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

export const pipelineApi = {
  summary: async () => {
    const response = await axiosClient.get<ApiEnvelope<PipelineSummary>>("/api/v1/pipeline/summary");
    return response.data;
  },
  listProjects: async (query?: { stage_id?: string; delegation_id?: string; page?: number; per_page?: number }) => {
    const response = await axiosClient.get<ApiEnvelope<PaginatedData<PipelineProject>>>("/api/v1/pipeline/projects", {
      params: query,
    });
    return response.data;
  },
  showProject: async (id: string) => {
    const response = await axiosClient.get<ApiEnvelope<PipelineProject>>(`/api/v1/pipeline/projects/${id}`);
    return response.data;
  },
  createProject: async (payload: Partial<PipelineProject>) => {
    const response = await axiosClient.post<ApiEnvelope<PipelineProject>>("/api/v1/pipeline/projects", payload);
    return response.data;
  },
  updateProject: async (id: string, payload: Partial<PipelineProject>) => {
    const response = await axiosClient.patch<ApiEnvelope<PipelineProject>>(`/api/v1/pipeline/projects/${id}`, payload);
    return response.data;
  },
  deleteProject: async (id: string) => {
    const response = await axiosClient.delete<ApiEnvelope<void>>(`/api/v1/pipeline/projects/${id}`);
    return response.data;
  },
  patchStage: async (id: string, new_stage_id: string, reason?: string) => {
    const response = await axiosClient.patch<ApiEnvelope<{ stage_id: string; changed_at: string }>>(`/api/v1/pipeline/projects/${id}/stage`, {
      new_stage_id,
      reason,
    });
    return response.data;
  },
};
