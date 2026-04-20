import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/api/dashboardApi";

/**
 * Defines the user perspective for dashboard data aggregation.
 */
export type DashboardScope = "staff" | "manager" | "director" | "admin";

/**
 * Hook to retrieve high-level KPI summaries for the specified user role.
 * @param scope - The role view (staff, manager, or director).
 */
export const useDashboardSummaryQuery = (scope: DashboardScope) => {
  return useQuery({
    queryKey: ["dashboard-summary", scope],
    queryFn: () => dashboardApi.summary(scope),
  });
};

/**
 * Hook to fetch a snapshot of recent or upcoming tasks for the dashboard view.
 * @param scope - The target role scope.
 */
export const useDashboardTasksQuery = (scope: DashboardScope) => {
  return useQuery({
    queryKey: ["dashboard-tasks", scope],
    queryFn: () => dashboardApi.tasks({ page: 1, pageSize: 5 }),
  });
};