import * as React from "react";
import { Target, TrendingUp, Download, FileText, Filter, BarChart3, ShieldCheck, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
export default function CityReportsPage() {
  return (
    <div className="space-y-6 duration-500 animate-in fade-in">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div>
          <h1 className="font-title text-2xl font-black tracking-tight text-slate-900 uppercase">Báo cáo Chiến lược Thành phố</h1>
          <p className="mt-1 text-sm font-medium text-slate-500">Các báo cáo định kỳ về tình hình xúc tiến đầu tư và kinh tế đối ngoại của Đà Nẵng.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => toast.info("Đang mở chỉnh sửa mẫu báo cáo.")} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-wider text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-95">
            CHỈNH SỬA MẪU
          </button>
          <button onClick={() => toast.success("Đang xuất báo cáo chiến lược tổng hợp.")} className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-[10px] font-black uppercase tracking-wider text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-95">
            XUẤT BÁO CÁO TỔNG HỢP
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
        <StatItem title="Số dự án mới" value="12" sub="QUÝ I/2026" icon={<Globe size={18} />} color="blue" />
        <StatItem title="Tổng vốn FDI" value="$450M" sub="+15% VS 2025" icon={<TrendingUp size={18} />} color="emerald" />
        <StatItem title="Vốn đăng ký nội" value="2.4K TỶ" sub="THÁNG 04/2026" icon={<Target size={18} />} color="purple" />
        <StatItem title="Tỉ lệ hài lòng" value="4.9/5" sub="CHỈ SỐ PCI" icon={<ShieldCheck size={18} />} color="amber" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="flex items-center gap-3 font-title text-lg font-black text-slate-900 uppercase tracking-tight">
              <BarChart3 size={20} className="text-primary" /> Tập tin báo cáo chiến lược
            </h2>
            <button onClick={() => toast.info("Đã mở bộ lọc nâng cao.")} className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">Bộ lọc nâng cao</button>
          </div>
          
          <div className="space-y-3">
            {[
              { title: "Báo cáo Kinh tế - Xúc tiến đầu tư Quý I/2026", size: "4.2MB", date: "Vừa xong" },
              { title: "Phân tích dòng vốn FDI từ thị trường Nhật Bản", size: "1.8MB", date: "Hôm qua" },
              { title: "Báo cáo hạ tầng CNTT & Bán dẫn Đà Nẵng", size: "12.5MB", date: "3 ngày trước" },
              { title: "Niên giám thống kê Xúc tiến đầu tư 2025 (Full)", size: "24.0MB", date: "25/03/2026" },
            ].map((report, i) => (
              <div
                key={i}
                className="group flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 p-4 shadow-sm transition-all hover:border-primary/20 hover:bg-white hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition-all group-hover:text-primary group-hover:border-primary/20 shadow-sm">
                    <FileText size={18} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 truncate transition-colors group-hover:text-primary">{report.title}</h4>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-0.5">
                      {report.size} &bull; {report.date}
                    </p>
                  </div>
                </div>
                <button onClick={() => toast.success(`Đang tải báo cáo: ${report.title}`)} className="p-2.5 text-slate-300 transition-all hover:text-primary hover:bg-primary/5 rounded-lg active:scale-90">
                  <Download size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex flex-col justify-between overflow-hidden rounded-xl bg-slate-950 p-6 text-white shadow-xl shadow-slate-950/20 shadow-inner">
          <div className="relative z-10 space-y-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-amber-300 border border-white/5 shadow-inner">
              <TrendingUp size={20} />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-title text-xl font-black uppercase tracking-tight leading-tight">Dự báo Tăng trưởng 2026</h3>
              <p className="text-sm font-medium leading-relaxed text-slate-400">IPA dự báo Đà Nẵng sẽ đón thêm <span className="text-white font-bold">$1.5 tỷ FDI</span> trong năm 2026 nhờ làn sóng đầu tư bán dẫn toàn cầu.</p>
            </div>
          </div>
          <div className="relative z-10 pt-8 mt-4 border-t border-white/5">
            <button onClick={() => toast.info("Đang mở chi tiết dự báo tăng trưởng 2026.")} className="w-full rounded-lg bg-primary py-3.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg transition-all hover:bg-primary/90 active:scale-[0.98]">
              XEM CHI TIẾT DỰ BÁO
            </button>
          </div>
          {/* Graphic decoration */}
          <div className="absolute top-[-20%] right-[-10%] h-48 w-48 rounded-full bg-primary/10 blur-[60px]" />
          <div className="absolute bottom-[-10%] left-[-10%] h-48 w-48 rounded-full bg-primary/20 blur-[80px]" />
        </div>
      </div>
    </div>
  );
}

function StatItem({ title, value, sub, icon, color }: any) {
  const colors: any = { 
    blue: "bg-blue-50 text-blue-600 border-blue-100", 
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100", 
    purple: "bg-purple-50 text-purple-600 border-purple-100", 
    amber: "bg-amber-50 text-amber-600 border-amber-100" 
  };
  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-slate-300">
      <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg shadow-sm border", colors[color])}>
        {icon}
      </div>
      <div className="space-y-1">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{title}</p>
        <p className="text-2xl font-black text-slate-950 tracking-tight leading-none">{value}</p>
        <p className="text-[9px] font-black text-slate-500 uppercase tracking-tight">{sub}</p>
      </div>
    </div>
  );
}
