import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/api/dashboardApi";

export type DashboardScope = "staff" | "manager" | "director" | "admin";

export const useDashboardSummaryQuery = (scope: DashboardScope) => {
  return useQuery({
    queryKey: ["dashboard-summary", scope],
    queryFn: () => dashboardApi.summary(scope),
  });
};

export const useDashboardTasksQuery = (scope: DashboardScope) => {
  return useQuery({
    queryKey: ["dashboard-tasks", scope],
    queryFn: () => dashboardApi.tasks({ page: 1, pageSize: 5 }),
  });
};