import axiosClient from "@/api/axiosClient";
import { ApiEnvelope } from "@/types/api";

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

export const reportsApi = {
  summary: async () => {
    const response = await axiosClient.get<ApiEnvelope<ReportSummary>>('/api/v1/reports/summary');
    return response.data;
  },
  listDefinitions: async () => {
    const response = await axiosClient.get<ApiEnvelope<{ items: ReportDefinition[] }>>("/api/v1/reports/definitions");
    return response.data;
  },
  createRun: async (payload: { report_code: string; params: Record<string, unknown> }) => {
    const response = await axiosClient.post<ApiEnvelope<{ run_id: string; status: string }>>("/api/v1/reports/runs", payload);
    return response.data;
  },
  showRun: async (runId: string) => {
    const response = await axiosClient.get<ApiEnvelope<ReportRun>>(`/api/v1/reports/runs/${runId}`);
    return response.data;
  },
};
