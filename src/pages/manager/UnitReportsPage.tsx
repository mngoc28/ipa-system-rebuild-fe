import * as React from "react";
import { PieChart, TrendingUp, Calendar, Download, FileText, ChevronRight, Filter, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
export default function UnitReportsPage() {
  const [showChartPanel, setShowChartPanel] = React.useState(false);
  const [showReportFilter, setShowReportFilter] = React.useState(false);
  const [lastExportAt, setLastExportAt] = React.useState<string | null>(null);

  return (
    <div className="space-y-6 duration-500 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-title text-2xl font-black tracking-tight text-slate-900 uppercase">Báo cáo Đơn vị</h1>
          <p className="mt-1 text-sm font-medium text-slate-500">Tổng hợp báo cáo tuần, tháng và KPI của phòng ban.</p>
        </div>
        <button
          onClick={() => {
            const now = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
            setLastExportAt(now);
            toast.success("Đã tạo gói xuất báo cáo đơn vị.");
          }}
          className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-[11px] font-black uppercase tracking-wider text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-95"
        >
          <Download size={16} /> XUẤT TẤT CẢ
        </button>
      </div>

      {lastExportAt && <p className="text-[10px] font-black uppercase tracking-widest text-primary">Lần xuất gần nhất: {lastExportAt}</p>}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {/* Monthly KPI card */}
        <div className="relative col-span-1 space-y-6 overflow-hidden rounded-xl bg-slate-950 p-6 text-white shadow-xl shadow-slate-950/20 lg:col-span-2">
          <TrendingUp size={64} className="absolute right-4 top-4 text-white opacity-5" />
          <div className="space-y-1">
            <p className="font-black uppercase tracking-widest text-slate-500 text-[10px]">Kết quả KPI tháng 04/2026</p>
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
                <p className="text-[9px] font-black uppercase text-slate-500 tracking-wider font-sans">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center space-y-4 rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
            <PieChart size={24} />
          </div>
          <div className="space-y-1">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900 leading-none">Phân tích mảng việc</h4>
            <p className="text-[10px] font-medium text-slate-400">Tự động hóa báo cáo tháng</p>
          </div>
          <button onClick={() => setShowChartPanel((prev) => !prev)} className="rounded-lg border border-slate-200 px-4 py-2 text-[10px] font-black uppercase tracking-wider transition-all hover:border-primary/50 hover:text-primary active:scale-95">Xem biểu đồ</button>
        </div>
      </div>

      {showChartPanel && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-600 shadow-sm">
          Biểu đồ KPI: Đoàn công tác đạt 125%, tỉ lệ duyệt hồ sơ 98%, mức hài lòng tăng theo tuần.
        </div>
      )}

      <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:p-10">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="flex items-center gap-3 font-title text-lg font-black text-slate-900 uppercase tracking-tight">
            <FileText size={20} className="text-primary" /> Lịch sử Báo cáo
          </h2>
          <button onClick={() => setShowReportFilter((prev) => !prev)} className="rounded-lg bg-slate-50 p-2 text-slate-400 transition-all hover:text-primary border border-slate-100">
            <Filter size={18} />
          </button>
        </div>

        {showReportFilter && <p className="text-[10px] font-black uppercase tracking-widest text-primary">Đang lọc báo cáo theo chu kỳ Tuần và Tháng.</p>}

        <div className="space-y-3">
          {[
            { title: "Báo cáo Tuần 14 - Tháng 04/2026", type: "Tuần", date: "07/04/2026", author: "Trần Thu Hà" },
            { title: "Báo cáo Tuần 13 - Tháng 03/2026", type: "Tuần", date: "31/03/2026", author: "Nguyễn Minh Châu" },
            { title: "Báo cáo Tổng kết Tháng 03/2026", type: "Tháng", date: "01/04/2026", author: "IPA System" },
            { title: "Báo cáo Quý I/2026 - Tầm nhìn chiến lược 2030", type: "Quý", date: "25/03/2026", author: "Nguyễn Minh Châu" },
          ].map((report, i) => (
            <div
              key={i}
              className="group flex flex-col justify-between gap-4 rounded-lg border border-slate-100 bg-slate-50/30 p-4 transition-all hover:border-primary/20 hover:bg-white hover:shadow-md md:flex-row md:items-center"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-400 shadow-sm border border-slate-100 transition-all group-hover:text-primary group-hover:border-primary/20">
                  <FileText size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 transition-colors group-hover:text-primary">{report.title}</h4>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary/70">{report.type}</span>
                    <span className="text-[10px] font-medium text-slate-400">&bull; {report.date}</span>
                    <span className="text-[10px] font-medium text-slate-400">&bull; {report.author}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => toast.success(`Đang tải báo cáo: ${report.title}`)} className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-wider shadow-sm transition-all group-hover:bg-primary group-hover:text-white group-hover:border-primary active:scale-95">
                Tải xuống <Download size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
