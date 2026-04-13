import * as React from "react";
import { TrendingUp, BarChart3, Filter, Download, Target, Zap, ChevronRight, ArrowUpRight, PieChart as PieChartIcon, CircleDot } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
export default function PipelinePage() {
  const funnelStages = [
    { title: "Tiếp cận & Kết nối", count: 124, value: "$2.4B", color: "bg-blue-600" },
    { title: "Khảo sát thực địa", count: 48, value: "$1.1B", color: "bg-indigo-600" },
    { title: "Giai đoạn Đàm phán", count: 15, value: "$450M", color: "bg-violet-600" },
    { title: "Chuẩn bị Cấp phép", count: 6, value: "$180M", color: "bg-emerald-600" },
  ];

  return (
    <div className="space-y-6 duration-700 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div>
          <h1 className="font-title text-2xl font-black tracking-tight text-slate-900 uppercase">Pipeline Xúc tiến Đầu tư</h1>
          <p className="mt-1 text-sm font-medium text-slate-500">Theo dõi phễu dòng vốn đầu tư vào Đà Nẵng theo các giai đoạn chiến lược.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => toast.info("Đã mở bộ lọc dữ liệu pipeline.")} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-wider text-slate-700 transition-all hover:bg-slate-50 active:scale-95 shadow-sm">
            <Filter size={14} /> LỌC DỮ LIỆU
          </button>
          <button onClick={() => toast.success("Đang xuất báo cáo pipeline.")} className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-[10px] font-black uppercase tracking-wider text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-95">
            <Download size={14} /> XUẤT BÁO CÁO
          </button>
        </div>
      </div>

      {/* Funnel Visualization */}
      <div className="relative overflow-hidden rounded-xl bg-slate-950 p-6 shadow-xl shadow-slate-950/20 lg:p-10 border border-slate-900">
        <div className="relative z-10 grid grid-cols-1 gap-3 lg:grid-cols-4">
          {funnelStages.map((stage, i) => (
            <div key={i} className="flex flex-col items-center">
              <div
                className={cn(
                  "group relative mb-4 flex h-20 w-full cursor-default items-center justify-center rounded-lg border border-white/5",
                  stage.color,
                  "opacity-95 transition-all hover:opacity-100 hover:shadow-lg hover:shadow-black/20",
                )}
              >
                <div className="text-center">
                  <p className="text-2xl font-black text-white leading-none tracking-tight">{stage.count}</p>
                  <p className="mt-1 text-[9px] font-black uppercase tracking-widest text-white/50">{stage.title}</p>
                </div>
                {/* Connection arrow */}
                {i < funnelStages.length - 1 && (
                  <div className="absolute -right-3 top-1/2 z-20 hidden -translate-y-1/2 rounded-full border border-white/10 bg-slate-950 p-0.5 lg:block">
                    <ChevronRight size={12} className="text-white/40" />
                  </div>
                )}
              </div>
              <div className="text-center">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-0.5">Giá trị ước tính</p>
                <p className="text-lg font-black text-white tracking-tight leading-none">{stage.value}</p>
              </div>
            </div>
          ))}
        </div>
        {/* Abstract background graphics */}
        <div className="pointer-events-none absolute left-[-10%] top-[-30%] h-[400px] w-[400px] rounded-full bg-primary/10 blur-[100px]" />
      </div>

      {/* Detailed Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Top Projects */}
        <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="flex items-center gap-3 font-title text-lg font-black text-slate-900 uppercase tracking-tight">
              <Target size={20} className="text-primary" /> Dự án Pipeline Trọng điểm
            </h2>
            <button onClick={() => toast.info("Đang mở dashboard phân tích pipeline.")} className="p-2 text-slate-400 transition-all hover:text-primary rounded-lg border border-slate-100 shadow-sm">
              <BarChart3 size={18} />
            </button>
          </div>
          
          <div className="space-y-3">
            {[
              { name: "Khu phức hợp IT Park Giai đoạn 2", country: "Singapore", value: "$850M", prob: "85%", stage: "Đàm phán" },
              { name: "Trung tâm Fintech Đà Nẵng", country: "Hoa Kỳ", value: "$450M", prob: "60%", stage: "Khảo sát" },
              { name: "Nhà máy bán dẫn DaNang Semi", country: "Nhật Bản", value: "$220M", prob: "95%", stage: "Cấp phép" },
            ].map((project, i) => (
              <div
                key={i}
                className="group flex flex-col justify-between gap-4 rounded-lg border border-slate-100 bg-slate-50/30 p-4 transition-all hover:border-primary/20 hover:bg-white hover:shadow-md md:flex-row md:items-center"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-100 bg-white text-slate-400 shadow-sm transition-all group-hover:text-primary group-hover:border-primary/20">
                    <CircleDot size={18} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 truncate transition-colors group-hover:text-primary">{project.name}</h4>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{project.country}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-8 gap-y-3 md:flex-nowrap">
                  <div className="text-right">
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-tight">Giá trị</p>
                    <p className="text-sm font-black text-slate-900">{project.value}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-tight">Giai đoạn</p>
                    <span className="mt-1 inline-block rounded border border-blue-200 bg-blue-50 px-2 py-0.5 text-[9px] font-black text-blue-700 uppercase">{project.stage}</span>
                  </div>
                  <div className="hidden text-right sm:block min-w-[100px]">
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-tight mb-1">Xác suất thành công</p>
                    <div className="flex items-center gap-2 justify-end">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100 border border-slate-200">
                        <div className="h-full rounded-full bg-emerald-500 transition-all duration-1000" style={{ width: project.prob }} />
                      </div>
                      <span className="text-[10px] font-black text-emerald-600">{project.prob}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar: Strategic Stats */}
        <div className="space-y-6">
          <div className="flex flex-col justify-between rounded-xl bg-primary p-6 text-white shadow-xl shadow-primary/20 border border-primary/10">
            <div className="space-y-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-amber-300 border border-white/5 shadow-inner">
                <TrendingUp size={20} />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-lg font-black uppercase tracking-tight">Tăng trưởng 2026</h3>
                <p className="text-[10px] font-medium text-white/50 leading-relaxed uppercase tracking-widest">
                  Dòng vốn Pipeline tăng <span className="text-amber-300 font-black">+15%</span> so với 2025.
                </p>
              </div>
              
              <div className="space-y-2 rounded-lg border border-white/5 bg-white/5 p-4 backdrop-blur-sm">
                {[
                  { label: "Singapore", value: "+$850M", color: "text-emerald-400" },
                  { label: "Hàn Quốc", value: "+$500M", color: "text-blue-300" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-white/60 uppercase tracking-tight">{item.label}</span>
                    <span className={cn("font-black", item.color)}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <button onClick={() => toast.info("Đang mở phân tích sâu pipeline.")} className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-slate-950 py-3 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-slate-900 active:scale-[0.98]">
              Phân tích sâu <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-900 border-b border-slate-50 pb-2">Phân bổ lĩnh vực</h3>
            <div className="space-y-4">
              {[
                { label: "Công nghệ cao", value: "45%", color: "bg-blue-600" },
                { label: "Logistics", value: "25%", color: "bg-amber-600" },
                { label: "Fintech", value: "20%", color: "bg-violet-600" },
                { label: "Du lịch", value: "10%", color: "bg-emerald-600" },
              ].map((item, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-slate-500 uppercase tracking-tight">{item.label}</span>
                    <span className="text-slate-900">{item.value}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-50 border border-slate-100">
                    <div className={cn("h-full rounded-full transition-all duration-1000", item.color)} style={{ width: item.value }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
