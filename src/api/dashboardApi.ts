import axiosClient from "@/api/axiosClient";
import { ApiEnvelope, PaginatedData } from "@/types/api";

/**
 * Aggregated view of important metrics and items for the dashboard homepage.
 */
export interface DashboardSummary {
  /** Core counters for delegations, tasks, and events */
  stats: {
    delegations: number;
    tasks: number;
    events: number;
  };
  /** City-wide statistics and breakdowns (optional) */
  city?: DashboardCitySummary;
  /** List of active system or delegation-related alerts */
  alerts: unknown[];
  /** List of tasks that have passed their deadline */
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
  /** Total number of unique partners */
  partners: number;
  /** Total count of projects in the pipeline */
  pipelineProjects: number;
  /** Count of delegations with 'active' status */
  activeDelegations: number;
  /** Count of events occurring in the near future */
  upcomingEvents: number;
  /** Cumulative estimated value of all projects in pipeline */
  totalPipelineValue: number;
  /** Value of projects currently in 'active' pipeline stages */
  activePipelineValue: number;
  /** Project distribution across different workflow stages */
  stageBreakdown: DashboardCityStageBreakdownItem[];
  /** List of the most recently modified project records */
  recentProjects: DashboardCityProjectItem[];
  /** List of upcoming scheduled sessions and events */
  upcomingEventsList: DashboardCityEventItem[];
  /** Top performing partner organizations by project volume/score */
  topPartners: DashboardCityPartnerItem[];
}

/**
 * Represents a task item displayed in dashboard widgets.
 */
export interface DashboardTaskItem {
  /** Unique ID of the task */
  id: string | number;
  /** Task subject or summary */
  title: string;
  /** Name/Title of the associated delegation */
  delegation?: string;
  /** Name of the assigned user */
  user?: string;
  /** Deadline timestamp */
  dueAt?: string;
  /** alternative deadline name */
  deadline?: string;
  /** Formatted time string */
  time?: string;
  /** Priority level (label or numeric) */
  priority?: string | number;
  /** Current lifecycle status (label or numeric) */
  status?: string | number;
  /** Whether the task is currently overdue */
  isOverdue?: boolean;
  /** alternative overdue flag */
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
