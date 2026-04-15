import * as React from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { BarChart3, Download, FileText, Globe, RefreshCw, ShieldCheck, Sparkles, Target, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { reportsApi } from "@/api/reportsApi";

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const dateTimeFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export default function CityReportsPage() {
  const [showTemplateEditor, setShowTemplateEditor] = React.useState(false);
  const [showForecastDetail, setShowForecastDetail] = React.useState(false);
  const [selectedCode, setSelectedCode] = React.useState("");

  const summaryQuery = useQuery({
    queryKey: ["report-summary", "city"],
    queryFn: reportsApi.summary,
  });

  const definitionsQuery = useQuery({
    queryKey: ["report-definitions", "city"],
    queryFn: reportsApi.listDefinitions,
  });

  const createRunMutation = useMutation({
    mutationFn: (reportCode: string) => reportsApi.createRun({ report_code: reportCode, params: { scope: "city" } }),
    onSuccess: async (data) => {
      toast.success(`Đã tạo run ${data.data.run_id}.`);
      await Promise.all([summaryQuery.refetch(), definitionsQuery.refetch()]);
    },
    onError: () => toast.error("Không thể tạo báo cáo chiến lược."),
  });

  const summary = summaryQuery.data?.data;
  const definitions = definitionsQuery.data?.data?.items ?? [];
  const realDefinitions = React.useMemo(() => definitions.filter((definition) => !isPlaceholderDefinition(definition.report_code, definition.report_name)), [definitions]);
  const recentRuns = React.useMemo(() => (summary?.recentRuns ?? []).filter((run) => !isPlaceholderDefinition(run.reportCode, run.reportName)), [summary?.recentRuns]);
  const selectedDefinition = realDefinitions.find((definition) => definition.report_code === selectedCode) ?? realDefinitions[0] ?? null;

  React.useEffect(() => {
    if (!selectedCode && realDefinitions.length > 0) {
      setSelectedCode(realDefinitions[0].report_code);
    }
  }, [realDefinitions, selectedCode]);

  const isLoading = summaryQuery.isLoading || definitionsQuery.isLoading;
  const isError = summaryQuery.isError || definitionsQuery.isError;

  const handleExportReport = () => {
    if (!selectedCode) {
      toast.error("Chưa có mẫu báo cáo khả dụng.");
      return;
    }

    createRunMutation.mutate(selectedCode);
  };

  if (isLoading) {
    return <CityReportsSkeleton />;
  }

  if (isError || !summary) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center shadow-sm">
        <div className="max-w-md space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
            <Sparkles size={22} />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-black uppercase tracking-tight text-slate-950">Không tải được City Reports</h1>
            <p className="text-sm font-medium text-slate-500">Kiểm tra lại backend report API rồi thử tải lại dữ liệu.</p>
          </div>
          <button
            onClick={() => {
              void summaryQuery.refetch();
              void definitionsQuery.refetch();
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white transition hover:bg-slate-800"
          >
            <RefreshCw size={14} />
            Tải lại
          </button>
        </div>
      </div>
    );
  }

  const reportList = recentRuns;

  return (
    <div className="space-y-6 duration-500 animate-in fade-in">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Báo cáo chiến lược thành phố</p>
          <h1 className="font-title text-2xl font-black tracking-tight text-slate-900 uppercase">Báo cáo Chiến lược Thành phố</h1>
          <p className="text-sm font-medium text-slate-500">Các báo cáo định kỳ về tình hình xúc tiến đầu tư và kinh tế đối ngoại của Đà Nẵng.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowTemplateEditor((prev) => !prev)}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-wider text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-95"
          >
            CHỈNH SỬA MẪU
          </button>
          <button
            onClick={handleExportReport}
            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-[10px] font-black uppercase tracking-wider text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-95"
          >
            XUẤT BÁO CÁO TỔNG HỢP
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-[11px] font-semibold text-slate-600 shadow-sm">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-4">
          <select
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
            value={selectedCode}
            onChange={(event) => setSelectedCode(event.target.value)}
          >
            {realDefinitions.map((definition) => (
              <option key={definition.report_code} value={definition.report_code}>
                {definition.report_name}
              </option>
            ))}
          </select>
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">Số mẫu báo cáo khả dụng: {realDefinitions.length}</p>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Run thành công: {summary.stats.successfulRuns}</p>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Metric đang theo dõi: {summary.stats.metrics}</p>
        </div>
      </div>

      {showTemplateEditor && (
        <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">Mẫu đang dùng</p>
              <h2 className="text-base font-black uppercase tracking-tight text-slate-950">{selectedDefinition?.report_name ?? "Chưa chọn mẫu"}</h2>
              <p className="text-[11px] font-medium text-slate-500">Mã mẫu: {selectedDefinition?.report_code ?? "N/A"}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              Scope: city
            </div>
          </div>
          <pre className="mt-4 overflow-auto rounded-2xl bg-slate-950 p-4 text-[11px] text-slate-100">{JSON.stringify(selectedDefinition?.query_config ?? {}, null, 2)}</pre>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
        <StatItem title="Số dự án mới" value={formatCompactNumber(summary.kpis.newProjects)} sub="QUÝ I/2026" icon={<Globe size={18} />} color="blue" />
        <StatItem title="Tổng vốn FDI" value={formatCurrency(summary.kpis.fdiTotal)} sub="THEO KPI THÀNH PHỐ" icon={<TrendingUp size={18} />} color="emerald" />
        <StatItem title="Vốn đăng ký nội" value={formatCurrency(summary.kpis.domesticCapital)} sub="THÁNG 04/2026" icon={<Target size={18} />} color="purple" />
        <StatItem title="Tỉ lệ hài lòng" value={`${summary.kpis.pciIndex.toFixed(1)}/5`} sub="CHỈ SỐ PCI" icon={<ShieldCheck size={18} />} color="amber" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="flex items-center gap-3 font-title text-lg font-black text-slate-900 uppercase tracking-tight">
              <BarChart3 size={20} className="text-primary" /> Tập tin báo cáo chiến lược
            </h2>
            <button onClick={handleExportReport} className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">
              Tạo run báo cáo
            </button>
          </div>

          <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-primary">
            Báo cáo chiến lược đang lấy dữ liệu từ summary và các run thực tế.
          </div>

          <div className="space-y-3">
            {reportList.length === 0 ? (
              <EmptyState label="Chưa có run báo cáo nào." />
            ) : (
              reportList.map((run) => (
                <div
                  key={run.runId}
                  className="group flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 p-4 shadow-sm transition-all hover:border-primary/20 hover:bg-white hover:shadow-md"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition-all group-hover:border-primary/20 group-hover:text-primary shadow-sm">
                      <FileText size={18} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="truncate text-sm font-bold text-slate-900 transition-colors group-hover:text-primary">{formatDisplayLabel(run.outputFileName ?? run.reportName, "Báo cáo chiến lược")}</h4>
                      <p className="mt-0.5 text-[9px] font-black uppercase tracking-widest text-slate-400">
                        {run.reportCode} &bull; {formatRunStatus(run.status)}
                      </p>
                      <p className="mt-0.5 text-[10px] font-medium text-slate-500">
                        {formatDateTime(run.finishedAt ?? run.startedAt)}
                        {run.outputFileSizeBytes !== null ? ` · ${formatFileSize(run.outputFileSizeBytes)}` : ""}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => toast.success(`Đang tải báo cáo: ${run.outputFileName ?? run.reportName}`)}
                    className="rounded-lg p-2.5 text-slate-300 transition-all hover:bg-primary/5 hover:text-primary active:scale-90"
                  >
                    <Download size={18} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="relative flex flex-col justify-between overflow-hidden rounded-xl bg-slate-950 p-6 text-white shadow-xl shadow-slate-950/20 shadow-inner">
          <div className="relative z-10 space-y-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/5 bg-white/10 text-amber-300 shadow-inner">
              <TrendingUp size={20} />
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/45">{summary.forecast.title}</p>
              <h3 className="font-title text-xl font-black uppercase tracking-tight leading-tight">{summary.forecast.headline}</h3>
              <p className="text-sm font-medium leading-relaxed text-slate-400">{summary.forecast.detail}</p>
            </div>
          </div>
          <div className="relative z-10 pt-8 mt-4 border-t border-white/5">
            <button
              onClick={() => setShowForecastDetail((prev) => !prev)}
              className="w-full rounded-lg bg-primary py-3.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg transition-all hover:bg-primary/90 active:scale-[0.98]"
            >
              {showForecastDetail ? "ẨN CHI TIẾT DỰ BÁO" : "XEM CHI TIẾT DỰ BÁO"}
            </button>
            {showForecastDetail && <p className="mt-3 text-[10px] font-bold uppercase tracking-widest text-white/70">{summary.forecast.detail}</p>}
          </div>
          <div className="absolute top-[-20%] right-[-10%] h-48 w-48 rounded-full bg-primary/10 blur-[60px]" />
          <div className="absolute bottom-[-10%] left-[-10%] h-48 w-48 rounded-full bg-primary/20 blur-[80px]" />
        </div>
      </div>
    </div>
  );
}

function StatItem({ title, value, sub, icon, color }: { title: string; value: string; sub: string; icon: React.ReactNode; color: "blue" | "emerald" | "purple" | "amber" }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
  };

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-slate-300">
      <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg border shadow-sm", colors[color])}>{icon}</div>
      <div className="space-y-1">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{title}</p>
        <p className="text-2xl font-black text-slate-950 tracking-tight leading-none">{value}</p>
        <p className="text-[9px] font-black text-slate-500 uppercase tracking-tight">{sub}</p>
      </div>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-5 text-sm font-medium text-slate-500">{label}</div>;
}

function CityReportsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between gap-6">
        <div className="h-14 w-2/3 rounded-2xl bg-slate-200" />
        <div className="h-10 w-56 rounded-2xl bg-slate-200" />
      </div>
      <div className="h-16 rounded-2xl bg-slate-100" />
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <div className="h-32 rounded-2xl bg-slate-100" />
        <div className="h-32 rounded-2xl bg-slate-100" />
        <div className="h-32 rounded-2xl bg-slate-100" />
        <div className="h-32 rounded-2xl bg-slate-100" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="h-[420px] rounded-2xl bg-slate-100 lg:col-span-2" />
        <div className="h-[420px] rounded-2xl bg-slate-100" />
      </div>
    </div>
  );
}

function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(value);
}

function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

function formatDateTime(value: string | null): string {
  if (!value) {
    return "N/A";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "N/A";
  }

  return dateTimeFormatter.format(parsed);
}

function formatFileSize(value: number): string {
  if (!Number.isFinite(value) || value <= 0) {
    return "N/A";
  }

  const units = ["B", "KB", "MB", "GB"];
  let size = value;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(size >= 10 ? 0 : 1)} ${units[unitIndex]}`;
}

function formatRunStatus(status: number): string {
  if (status === 1) {
    return "Hoàn thành";
  }

  if (status === 2) {
    return "Đang chạy";
  }

  if (status === 3) {
    return "Thất bại";
  }

  return "Chờ xử lý";
}

function formatDisplayLabel(value: string, fallback: string): string {
  const normalized = value.trim();
  if (!normalized) {
    return fallback;
  }

  const lowered = normalized.toLowerCase();
  if (
    lowered.includes("seed") ||
    lowered.startsWith("ipa_") ||
    lowered.startsWith("report_name_") ||
    lowered.startsWith("title_") ||
    lowered.startsWith("file_name_")
  ) {
    return fallback;
  }

  return normalized;
}

function isPlaceholderDefinition(code: string, name: string): boolean {
  const loweredCode = code.toLowerCase();
  const loweredName = name.toLowerCase();

  return (
    loweredCode.startsWith("ipa_") ||
    loweredCode.includes("seed") ||
    loweredName.includes("seed") ||
    loweredName.startsWith("report_name_") ||
    loweredName.startsWith("title_")
  );
}
