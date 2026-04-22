import axiosClient from "@/api/axiosClient";
import { ApiEnvelope, PaginatedData } from "@/types/api";
import { useAuthStore } from "@/store/useAuthStore";

/**
 * Represents a business or cooperation project tracked in the investment pipeline.
 */
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

/**
 * Aggregated trends and metrics for the city's investment pipeline.
 */
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

/**
 * API service for project pipeline management, summaries, and stage transitions.
 */
export const pipelineApi = {
  /**
   * Fetches high-level metrics and breakdowns for the investment pipeline.
   * @returns Comprehensive pipeline summary object.
   */
  summary: async () => {
    const response = await axiosClient.get<ApiEnvelope<PipelineSummary>>(`${getPrefix()}/summary`);
    return response.data;
  },

  /**
   * Retrieves a filtered list of pipeline projects.
   * @param query - Stage filters, delegation mapping, and pagination.
   * @returns Paginated list of project records.
   */
  listProjects: async (query?: { stage_id?: string; delegation_id?: string; page?: number; per_page?: number }) => {
    const response = await axiosClient.get<ApiEnvelope<PaginatedData<PipelineProject>>>(`${getPrefix()}/projects`, {
      params: query,
    });
    return response.data;
  },

  /**
   * Fetches full metadata for a specific project.
   * @param id - The project ID.
   * @returns Detailed project object.
   */
  showProject: async (id: string) => {
    const response = await axiosClient.get<ApiEnvelope<PipelineProject>>(`${getPrefix()}/projects/${id}`);
    return response.data;
  },

  /**
   * Registers a new project in the pipeline.
   * @param payload - Basic project details and classification.
   * @returns The newly created project record.
   */
  createProject: async (payload: Partial<PipelineProject>) => {
    const response = await axiosClient.post<ApiEnvelope<PipelineProject>>(`${getPrefix()}/projects`, payload);
    return response.data;
  },

  /**
   * Updates partial information for an existing project.
   * @param id - Target project ID.
   * @param payload - Subset of fields to update.
   * @returns Updated project record.
   */
  updateProject: async (id: string, payload: Partial<PipelineProject>) => {
    const response = await axiosClient.patch<ApiEnvelope<PipelineProject>>(`${getPrefix()}/projects/${id}`, payload);
    return response.data;
  },

  /**
   * Moves a project from its current stage to a new one.
   * @param id - Target project ID.
   * @param new_stage_id - The ID of the target stage.
   * @param reason - Optional justification for the stage move.
   * @returns Confirmation of the new stage and update timestamp.
   */
  patchStage: async (id: string, new_stage_id: string, reason?: string) => {
    const response = await axiosClient.patch<ApiEnvelope<{ stage_id: string; changed_at: string }>>(`${getPrefix()}/projects/${id}/stage`, {
      new_stage_id,
      reason,
    });
    return response.data;
  },

  /**
   * Permanently removes a project record from the pipeline.
   * @param id - ID of the project to delete.
   * @returns Success confirmation.
   */
  deleteProject: async (id: string) => {
    const response = await axiosClient.delete<ApiEnvelope<void>>(`${getPrefix()}/projects/${id}`);
    return response.data;
  },
};
