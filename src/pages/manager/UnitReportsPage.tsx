import * as React from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Download, FileText, Filter, PieChart, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { reportsApi } from "@/api/reportsApi";
import { SelectField } from "@/components/ui/SelectField";

export default function UnitReportsPage() {
  const [showChartPanel, setShowChartPanel] = React.useState(false);
  const [showReportFilter, setShowReportFilter] = React.useState(false);
  const [selectedCode, setSelectedCode] = React.useState("");
  const [activeRunId, setActiveRunId] = React.useState<string | null>(null);
  const [runHistory, setRunHistory] = React.useState<Array<{ run_id: string; report_code: string; status: string }>>([]);

  const definitionsQuery = useQuery({
    queryKey: ["report-definitions", "unit"],
    queryFn: reportsApi.listDefinitions,
  });

  const createRunMutation = useMutation({
    mutationFn: (reportCode: string) => reportsApi.createRun({ report_code: reportCode, params: { scope: "unit" } }),
    onSuccess: (data) => {
      const runId = data.run_id;
      setActiveRunId(runId);
      setRunHistory((prev) => [{ run_id: runId, report_code: selectedCode, status: data.status }, ...prev]);
      toast.success("Đã khởi tạo tiến trình tạo báo cáo.");
    },
    onError: () => toast.error("Không thể khởi tạo báo cáo."),
  });

  const runStatusQuery = useQuery({
    queryKey: ["report-run", activeRunId],
    queryFn: () => reportsApi.showRun(activeRunId || ""),
    enabled: Boolean(activeRunId),
    refetchInterval: (query) => {
      const status = String(query.state.data?.status || "").toLowerCase();
      return status === "queued" || status === "running" ? 1500 : false;
    },
  });

  const definitions = definitionsQuery.data?.items || [];

  React.useEffect(() => {
    if (!selectedCode && definitions.length > 0) {
      setSelectedCode(definitions[0].report_code);
    }
  }, [definitions, selectedCode]);

  React.useEffect(() => {
    const latest = runStatusQuery.data;
    if (!latest?.run_id) return;
    setRunHistory((prev) => prev.map((r) => (r.run_id === latest.run_id ? { ...r, status: latest.status } : r)));
  }, [runStatusQuery.data]);

  return (
    <div className="space-y-6 duration-500 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-title text-2xl font-black uppercase tracking-tight text-brand-text-dark">Báo cáo Đơn vị</h1>
          <p className="mt-1 text-sm font-medium text-slate-500">Tổng hợp báo cáo tuần, tháng và KPI của phòng ban.</p>
        </div>
        <button
          aria-label="Tạo báo cáo đơn vị"
          onClick={() => {
            if (!selectedCode) {
              toast.error("Chưa có mẫu báo cáo khả dụng.");
              return;
            }
            createRunMutation.mutate(selectedCode);
          }}
          className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-[11px] font-black uppercase tracking-wider text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-95"
        >
          <Download size={16} /> TẠO BÁO CÁO
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mẫu báo cáo</p>
          <p className="mt-1 text-xl font-black text-brand-text-dark">{definitions.length}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tiến trình gần nhất</p>
          <p className="mt-1 text-xl font-black text-brand-text-dark">{runStatusQuery.data?.status || "-"}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mã chạy</p>
          <p className="mt-1 truncate text-sm font-black text-brand-text-dark">{runStatusQuery.data?.run_id || "-"}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {/* Monthly KPI card */}
        <div className="relative col-span-1 space-y-6 overflow-hidden rounded-xl bg-brand-dark p-6 text-white shadow-xl shadow-brand-dark/20 lg:col-span-2">
          <TrendingUp size={64} className="absolute right-4 top-4 text-white opacity-5" />
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Kết quả KPI tháng 04/2026</p>
            <h3 className="font-title text-2xl font-black uppercase tracking-tight">Hiệu suất Đạt 92.5%</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-5 md:grid-cols-4">
            {[
              { label: "Đoàn công tác", value: "15/12" },
              { label: "Tỉ lệ duyệt", value: "98%" },
              { label: "Đầu việc xử lý", value: "142" },
              { label: "Hài lòng đối tác", value: "4.8/5" },
            ].map((stat, i) => (
              <div key={i}>
                <p className="text-xl font-black">{stat.value}</p>
                <p className="font-sans text-[9px] font-black uppercase tracking-wider text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center space-y-4 rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <div className="flex size-12 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-600">
            <PieChart size={24} />
          </div>
          <div className="space-y-1">
            <h4 className="text-[10px] font-black uppercase leading-none tracking-widest text-brand-text-dark">Phân tích mảng việc</h4>
            <p className="text-[10px] font-medium text-slate-400">Tự động hóa báo cáo tháng</p>
          </div>
          <button aria-label="Xem biểu đồ KPI" onClick={() => setShowChartPanel((prev) => !prev)} className="rounded-lg border border-slate-200 px-4 py-2 text-[10px] font-black uppercase tracking-wider transition-all hover:border-primary/50 hover:text-primary active:scale-95">Xem biểu đồ</button>
        </div>
      </div>

      {showChartPanel && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-600 shadow-sm">
          Biểu đồ KPI: Đoàn công tác đạt 125%, tỉ lệ duyệt hồ sơ 98%, mức hài lòng tăng theo tuần.
        </div>
      )}

      <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:p-10">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="flex items-center gap-3 font-title text-lg font-black uppercase tracking-tight text-brand-text-dark">
            <FileText size={20} className="text-primary" /> Lịch sử Báo cáo
          </h2>
          <button aria-label="Mở bộ lọc báo cáo" title="Mở bộ lọc báo cáo" onClick={() => setShowReportFilter((prev) => !prev)} className="rounded-lg border border-slate-100 bg-slate-50 p-2 text-slate-400 transition-all hover:text-primary">
            <Filter size={18} />
          </button>
        </div>

        {showReportFilter && (
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            <SelectField
              value={selectedCode}
              onValueChange={setSelectedCode}
              placeholder="Chọn mẫu báo cáo"
              options={definitions.map((def) => ({ label: def.report_code, value: def.report_code }))}
              triggerClassName="h-9 text-xs font-semibold"
            />
            <p className="text-[10px] font-black uppercase tracking-widest text-primary">Đang lọc theo mẫu báo cáo đã chọn.</p>
          </div>
        )}

        <div className="space-y-3">
          {(runHistory.length ? runHistory : []).map((report, i) => (
            <div
              key={i}
              className="group flex flex-col justify-between gap-4 rounded-lg border border-slate-100 bg-slate-50/30 p-4 transition-all hover:border-primary/20 hover:bg-white hover:shadow-md md:flex-row md:items-center"
            >
              <div className="flex items-center gap-4">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-slate-100 bg-white text-slate-400 shadow-sm transition-all group-hover:border-primary/20 group-hover:text-primary">
                  <FileText size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-brand-text-dark transition-colors group-hover:text-primary">Run {report.run_id}</h4>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary/70">{report.report_code}</span>
                    <span className="text-[10px] font-medium text-slate-400">&bull; {report.status}</span>
                  </div>
                </div>
              </div>
              <button
                aria-label={`Tải báo cáo run ${report.run_id}`}
                onClick={() => {
                  if (report.status.toLowerCase() !== "done") {
                    toast.error("Báo cáo chưa hoàn tất.");
                    return;
                  }
                  toast.success(`Sẵn sàng tải báo cáo run ${report.run_id}`);
                }}
                className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-wider shadow-sm transition-all active:scale-95 group-hover:border-primary group-hover:bg-primary group-hover:text-white"
              >
                Tải xuống <Download size={14} />
              </button>
            </div>
          ))}
          {runHistory.length === 0 && <p className="text-sm font-semibold text-slate-500">Chưa có lịch sử chạy báo cáo. Hãy tạo báo cáo mới.</p>}
        </div>
      </div>
    </div>
  );
}
