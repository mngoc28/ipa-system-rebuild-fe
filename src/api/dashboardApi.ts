import axiosClient from "@/api/axiosClient";
import { ApiEnvelope, PaginatedData } from "@/types/api";

/**
 * Aggregated view of important metrics and items for the dashboard homepage.
 */
export interface DashboardSummary {
    stats: {
    delegations: number;
    tasks: number;
    events: number;
  };
    city?: DashboardCitySummary;
    alerts: unknown[];
    overdueTasks: unknown[];
}

export interface DashboardCityStageBreakdownItem {
  stageId: string;
  stageCode: string;
  stageName: string;
  stageOrder: number;
  projectCount: number;
  totalValue: number;
}

export interface DashboardCityProjectItem {
  id: string;
  projectCode: string;
  projectName: string;
  partnerName: string | null;
  delegationName: string | null;
  stageCode: string;
  stageName: string;
  estimatedValue: number | null;
  successProbability: number | null;
  expectedCloseDate: string | null;
  updatedAt: string | null;
}

export interface DashboardCityEventItem {
  id: string;
  title: string;
  startAt: string | null;
  endAt: string | null;
  status: number;
  delegationName: string | null;
  locationName: string | null;
}

export interface DashboardCityPartnerItem {
  id: string;
  partnerName: string;
  score: number | null;
  projectCount: number;
}

/**
 * Comprehensive breakdown of city-wide partner and project data.
 */
export interface DashboardCitySummary {
    partners: number;
    pipelineProjects: number;
    activeDelegations: number;
    upcomingEvents: number;
    totalPipelineValue: number;
    activePipelineValue: number;
    stageBreakdown: DashboardCityStageBreakdownItem[];
    recentProjects: DashboardCityProjectItem[];
    upcomingEventsList: DashboardCityEventItem[];
    topPartners: DashboardCityPartnerItem[];
}

/**
 * Represents a task item displayed in dashboard widgets.
 */
export interface DashboardTaskItem {
    id: string | number;
    title: string;
    delegation?: string;
    user?: string;
    dueAt?: string;
    deadline?: string;
    time?: string;
    priority?: string | number;
    status?: string | number;
    isOverdue?: boolean;
    overdue?: boolean;
}

/**
 * API service for retrieving dashboard highlights and aggregated trends.
 */
export const dashboardApi = {
  /**
   * Fetches the summary metrics based on the user's role scope.
   * @param scope - The organizational level to fetch stats for.
   * @returns Aggregated statistics, alerts, and overdue tasks.
   */
  summary: async (scope: "staff" | "manager" | "director" | "admin") => {
    // Map 'admin' scope to 'director' prefix as per current backend routing structure
    const rolePrefix = scope === 'admin' ? 'director' : scope;
    const response = await axiosClient.get<ApiEnvelope<DashboardSummary>>(`/api/v1/${rolePrefix}/dashboard/summary`, {
      params: { scope },
    });
    return response.data;
  },

  /**
   * Retrieves a list of tasks assigned to or visible by the current user.
   * @param query - Sorting and pagination parameters.
   * @returns Paginated list of task items.
   */
  tasks: async (query?: { status?: string; priority?: string; page?: number; pageSize?: number }) => {
    const response = await axiosClient.get<ApiEnvelope<PaginatedData<DashboardTaskItem>>>("/api/v1/staff/dashboard/tasks", {
      params: query,
    });
    return response.data;
  },
};
