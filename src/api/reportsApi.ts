import axiosClient from "@/api/axiosClient";
import { ApiEnvelope } from "@/types/api";
import { useAuthStore } from "@/store/useAuthStore";

/**
 * Represents a pre-defined report configuration or template.
 */
export interface ReportDefinition {
  /** Unique definition ID */
  id: string;
  /** Unique machine-readable code for the report type */
  report_code: string;
  /** Human-readable title of the report */
  report_name: string;
  /** Access scope (e.g., GLOBAL, UNIT) */
  scope_type?: string;
  /** Role allowed to generate this report */
  owner_role_id?: string | null;
  /** JSON configuration for data extraction and filtering */
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
  /** High-level counters for report usage and health */
  stats: {
    /** Total number of available report definitions */
    definitions: number;
    /** Total number of reports generated */
    runs: number;
    /** Count of reports successfully completed */
    successfulRuns: number;
    /** internal system metrics count */
    metrics: number;
  };
  /** Core key performance indicators for city investment */
  kpis: {
    /** New projects registered in the current period */
    newProjects: number;
    /** Total Foreign Direct Investment value */
    fdiTotal: number;
    /** Total Domestic Capital Investment value */
    domesticCapital: number;
    /** Current PCI index rating */
    pciIndex: number;
  };
  /** list of the most recent report generation attempts */
  recentRuns: ReportSummaryItem[];
  /** Short-term economic or investment forecast highlight */
  forecast: {
    /** Category or title of the forecast */
    title: string;
    /** Main prediction highlight */
    headline: string;
    /** nuanced textual explanation */
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
