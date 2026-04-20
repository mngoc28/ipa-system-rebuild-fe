import axiosClient from "@/api/axiosClient";
import { ApiEnvelope } from "@/types/api";
import { useAuthStore } from "@/store/useAuthStore";

/**
 * Represents a pre-defined report configuration or template.
 */
export interface ReportDefinition {
    id: string;
    report_code: string;
    report_name: string;
    scope_type?: string;
    owner_role_id?: string | null;
    query_config?: Record<string, unknown> | null;
}

export interface ReportRun {
  run_id: string;
  report_code: string;
  status: string;
  started_at?: string;
  finished_at?: string | null;
  output_file_id?: string | null;
  error_message?: string | null;
}

export interface ReportSummaryItem {
  runId: string;
  reportCode: string;
  reportName: string;
  status: number;
  startedAt: string | null;
  finishedAt: string | null;
  outputFileId: string | null;
  outputFileName: string | null;
  outputFileSizeBytes: number | null;
}

/**
 * Aggregated dashboard statistics and recent report activity.
 */
export interface ReportSummary {
    stats: {
        definitions: number;
        runs: number;
        successfulRuns: number;
        metrics: number;
  };
    kpis: {
        newProjects: number;
        fdiTotal: number;
        domesticCapital: number;
        pciIndex: number;
  };
    recentRuns: ReportSummaryItem[];
    forecast: {
        title: string;
        headline: string;
        detail: string;
  };
}

/**
 * Gets the base URL prefix based on the current user's role.
 */
const getPrefix = () => {
  const role = useAuthStore.getState().user?.role || "staff";
  const mappedRole = role.toLowerCase() === "admin" ? "director" : role.toLowerCase();
  return `/api/v1/${mappedRole}/reports`;
};

/**
 * API service for system reports, data aggregation, and investment KPI tracking.
 */
export const reportsApi = {
  /**
   * Fetches high-level metrics, KPIs, and recent report activity.
   * @returns Detailed report summary object.
   */
  summary: async () => {
    const response = await axiosClient.get<ApiEnvelope<ReportSummary>>(`${getPrefix()}/summary`);
    return response.data;
  },

  /**
   * Lists all available report definitions and templates.
   * @returns List of report definitions.
   */
  listDefinitions: async () => {
    const response = await axiosClient.get<ApiEnvelope<{ items: ReportDefinition[] }>>(`${getPrefix()}/definitions`);
    return response.data;
  },

  /**
   * Triggers the generation of a new report.
   * @param payload - Report code and execution parameters.
   * @returns The generated run ID and initial status.
   */
  createRun: async (payload: { report_code: string; params: Record<string, unknown> }) => {
    const response = await axiosClient.post<ApiEnvelope<{ run_id: string; status: string }>>(`${getPrefix()}/runs`, payload);
    return response.data;
  },

  /**
   * Fetches full status and output details for a specific report run.
   * @param runId - Unique ID of the report generation attempt.
   * @returns Details of the report run.
   */
  showRun: async (runId: string) => {
    const response = await axiosClient.get<ApiEnvelope<ReportRun>>(`${getPrefix()}/runs/${runId}`);
    return response.data;
  },
};
