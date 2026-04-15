import axiosClient from "@/api/axiosClient";
import { ApiEnvelope, PaginatedData } from "@/types/api";

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

export interface DashboardTaskItem {
  id: string | number;
  title: string;
  delegation?: string;
  user?: string;
  deadline?: string;
  time?: string;
  priority?: string;
  overdue?: boolean;
}

export const dashboardApi = {
  summary: async (scope: "staff" | "manager" | "director" | "admin") => {
    const response = await axiosClient.get<ApiEnvelope<DashboardSummary>>("/api/v1/dashboard/summary", {
      params: { scope },
    });
    return response.data;
  },
  tasks: async (query?: { status?: string; priority?: string; page?: number; pageSize?: number }) => {
    const response = await axiosClient.get<ApiEnvelope<PaginatedData<DashboardTaskItem>>>("/api/v1/dashboard/tasks", {
      params: query,
    });
    return response.data;
  },
};
