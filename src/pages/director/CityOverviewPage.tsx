import * as React from "react";
import { Building2, MapPin, TrendingUp, Users, PieChart as PieChartIcon, ArrowUpRight, Globe, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
export default function CityOverviewPage() {
  return (
    <div className="space-y-6 duration-500 animate-in fade-in">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div>
          <h1 className="font-title text-2xl font-black tracking-tight text-slate-900 uppercase">Tổng quan Đầu tư Thành phố</h1>
          <p className="mt-1 text-sm font-medium text-slate-500">Bản đồ số và dữ liệu vĩ mô về hạ tầng đầu tư của Đà Nẵng.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => toast.info("Đang bật lớp hiển thị bản đồ nhiệt.")} className="rounded-lg border border-slate-200 bg-white px-5 py-2 text-[10px] font-black uppercase tracking-wider text-slate-800 shadow-sm transition-all hover:bg-slate-50 active:scale-95">Bản đồ nhiệt</button>
          <button onClick={() => toast.info("Đang chuyển sang chế độ dữ liệu số.")} className="rounded-lg bg-slate-900 px-5 py-2 text-[10px] font-black uppercase tracking-wider text-white shadow-lg transition-all hover:bg-slate-800 active:scale-95">Dữ liệu số</button>
        </div>
      </div>

      {/* Map Interactive Placeholder */}
      <div className="group relative h-[420px] overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-xl shadow-slate-200/50">
        <img
          src="https://images.unsplash.com/photo-1596701062351-8c0880026391?q=80&w=2070&auto=format&fit=crop"
          alt="Danang Map"
          className="duration-[2000ms] h-full w-full object-cover opacity-90 transition-all group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
        
        {/* Map markers */}
        <div className="absolute left-[55%] top-[35%] -translate-x-1/2">
          <div className="relative">
            <div className="absolute h-5 w-5 animate-ping rounded-full bg-primary/40" />
            <div className="relative z-10 h-5 w-5 rounded-full border-2 border-white bg-primary shadow-lg shadow-primary/40" />
            <div className="absolute left-1/2 top-7 -translate-x-1/2 whitespace-nowrap rounded-lg border border-slate-200 bg-white/95 px-3 py-2 shadow-2xl backdrop-blur-sm">
              <p className="text-[10px] font-black uppercase tracking-tight text-slate-950">Khu Công nghệ Cao</p>
              <div className="mt-1 flex items-center gap-1.5 text-[9px] font-bold text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                15 DỰ ÁN MỚI
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
          <div className="space-y-1">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/50">Hệ thống giám sát vĩ mô</p>
            <h3 className="font-title text-3xl font-black uppercase tracking-tighter text-white">ĐÀ NẴNG SMART CITY</h3>
          </div>
          <div className="flex gap-3">
            <div className="min-w-[110px] rounded-lg border border-white/10 bg-white/5 p-3 text-center text-white backdrop-blur-md shadow-inner">
              <p className="text-xl font-black tracking-tight leading-none">1.2M+</p>
              <p className="mt-1 text-[8px] font-black uppercase tracking-widest text-white/40">Dân số</p>
            </div>
            <div className="min-w-[110px] rounded-lg border border-white/10 bg-white/5 p-3 text-center text-white backdrop-blur-md shadow-inner">
              <p className="text-xl font-black tracking-tight leading-none">7.2%</p>
              <p className="mt-1 text-[8px] font-black uppercase tracking-widest text-white/40">GRDP 2026</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-primary/20">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100/50 shadow-sm">
              <Globe size={18} />
            </div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Vốn FDI Đăng ký</h4>
          </div>
          <div>
            <p className="text-3xl font-black tracking-tight text-slate-950 uppercase leading-none">
              $420M
            </p>
            <span className="mt-1 inline-block text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+12% vs 2025</span>
          </div>
          <div className="space-y-3 pt-2">
            {[
              { label: "Nhật Bản", width: "w-3/4", color: "bg-blue-600" },
              { label: "Hàn Quốc", width: "w-1/2", color: "bg-primary" },
            ].map((item, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-tight text-slate-500">
                  <span>{item.label}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-50 border border-slate-100">
                  <div className={cn("h-full rounded-full transition-all", item.color, item.width)} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-primary/20">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600 border border-amber-100/50 shadow-sm">
              <Building2 size={18} />
            </div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Hạ tầng sẵn sàng</h4>
          </div>
          <div>
            <p className="text-3xl font-black tracking-tight text-slate-950 uppercase leading-none">
              820 HA
            </p>
            <p className="mt-2 text-[11px] font-bold text-slate-400 uppercase tracking-tight leading-relaxed">
              Quỹ đất công nghiệp sạch lớn nhất miền Trung.
            </p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
            <p className="text-[10px] font-medium leading-relaxed text-slate-600">
              Sẵn sàng bàn giao quỹ đất 20ha cho nhà đầu tư bán dẫn trong Q3/2026.
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-xl bg-primary p-6 text-white shadow-xl shadow-primary/20 border border-primary/10">
          <div className="space-y-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-amber-300 border border-white/5 shadow-inner">
              <Zap size={20} />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-lg font-black uppercase tracking-tight">BÁO CÁO PCI 2026</h3>
              <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Năng lực cạnh tranh cấp tỉnh</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-6 text-center shadow-inner backdrop-blur-sm">
              <p className="text-4xl font-black uppercase tracking-tighter">HẠNG 2</p>
              <p className="mt-1 text-[9px] font-black uppercase tracking-[0.2em] text-white/30 truncate">Toàn quốc / 63 tỉnh thành</p>
            </div>
          </div>
          <button onClick={() => toast.info("Đang mở phân tích chi tiết PCI 2026.")} className="mt-6 w-full rounded-lg bg-slate-950 py-3 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-slate-900 active:scale-[0.98]">XEM PHÂN TÍCH</button>
        </div>
      </div>
    </div>
  );
}
