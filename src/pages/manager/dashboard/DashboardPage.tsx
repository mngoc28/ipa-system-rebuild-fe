import * as React from "react";
import { TrendingUp, Users, Calendar, Clock, CheckCircle2, ChevronRight, ArrowUpRight, Zap, Briefcase, MapPin, ShieldCheck, Building2, PieChart, ClipboardList, Search, Bell, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { dashboardTasks, weekSessions } from "@/dataHelper/ui-system.data";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";
export default function DashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const role = user?.role || "Staff";
  const isAdmin = role === "Admin";
  const isDirector = role === "Director";
  const isManager = role === "Manager";
  const quickActionPath = isAdmin ? "/admin/audit-log" : isDirector ? "/reports/city" : isManager ? "/reports/unit" : "/tasks";

  return (
    <div className="space-y-8 duration-700 animate-in fade-in">
      {/* Welcome Section */}
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div className="space-y-1">
          <h1 className="font-title text-3xl font-black leading-tight text-slate-900 uppercase tracking-tight">
            {isDirector ? "Báo cáo chiến lược," : isManager ? "Quản lý đơn vị," : isAdmin ? "Quản trị hệ thống," : "Tin vắn nghiệp vụ,"}{" "}
            <span className="text-primary">{user?.fullName || "Cán bộ IPA"}</span> 👋
          </h1>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide opacity-70">
            {isAdmin ? "HỆ THỐNG ĐANG VẬN HÀNH ỔN ĐỊNH" : `IPA ĐÀ NẴNG • THỨ 6, 10/04/2026`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="group relative hidden w-72 lg:block">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-all group-focus-within:text-primary" size={16} />
            <input
              placeholder="Tìm nhanh đoàn, tài liệu, đối tác..."
              className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-[11px] font-bold shadow-sm outline-none transition-all focus:border-primary/50 focus:ring-4 focus:ring-primary/5"
            />
          </div>
          <button onClick={() => navigate(quickActionPath)} className="flex items-center gap-2 rounded-lg bg-slate-950 px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-slate-950/20 transition-all hover:bg-slate-800 active:scale-95">
            <Zap size={14} className="text-amber-400" />
            {isAdmin ? "XEM LOG HỆ THỐNG" : "BÁO CÁO NHANH"}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {isAdmin ? (
          <>
            <StatCard title="Tổng người dùng" value="124" note="+2 tuần này" icon={<Users size={20} />} color="blue" />
            <StatCard title="System Uptime" value="99.9%" note="Ổn định" icon={<ShieldCheck size={20} />} color="emerald" />
            <StatCard title="Traffic định kỳ" value="1.2k" note="+15%" icon={<TrendingUp size={20} />} color="purple" />
            <StatCard title="Log Storage" value="12GB" note="/50GB total" icon={<Clock size={20} />} color="amber" />
          </>
        ) : isDirector ? (
          <>
            <StatCard title="Tổng vốn đầu tư" value="$1.2B" note="+24% YoY" icon={<TrendingUp size={20} />} color="emerald" />
            <StatCard title="Dự án Pipeline" value="48" note="12 dự án lớn" icon={<Briefcase size={20} />} color="blue" />
            <StatCard title="Chỉ số PCI" value="70.5" note="Top 3 cả nước" icon={<PieChart size={20} />} color="purple" />
            <StatCard title="Đoàn cấp cao" value="15" note="Tháng này" icon={<Users size={20} />} color="amber" />
          </>
        ) : isManager ? (
          <>
            <StatCard title="Đoàn chờ duyệt" value="05" note="Cần xử lý ngay" icon={<ClipboardList size={20} />} color="rose" />
            <StatCard title="Việc phòng ban" value="32" note="85% hoàn thành" icon={<CheckCircle2 size={20} />} color="blue" />
            <StatCard title="Lịch họp tuần" value="12" note="+3 tuần trước" icon={<Calendar size={20} />} color="amber" />
            <StatCard title="Báo cáo đơn vị" value="04" note="Đã gửi đi" icon={<PieChart size={20} />} color="emerald" />
          </>
        ) : (
          <>
            <StatCard title="Đoàn phụ trách" value="04" note="2 đoàn đang tới" icon={<Users size={20} />} color="blue" />
            <StatCard title="Việc cần làm" value="08" note="3 việc gấp" icon={<CheckCircle2 size={20} />} color="rose" />
            <StatCard title="Lịch cá nhân" value="05" note="Trong hôm nay" icon={<Calendar size={20} />} color="amber" />
            <StatCard title="Tài liệu mới" value="12" note="Vừa cập nhật" icon={<Zap size={20} />} color="emerald" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-7 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-50 pb-5">
              <h2 className="flex items-center gap-3 font-title text-base font-black text-slate-900 uppercase tracking-tight">
                {isAdmin ? <ShieldCheck size={20} className="text-primary" /> : <CheckCircle2 size={20} className="text-primary" />}
                {isAdmin ? "Nhật ký vận hành hệ thống" : "Đầu việc trọng tâm & Khẩn cấp"}
              </h2>
              <button onClick={() => navigate(isAdmin ? "/admin/audit-log" : "/tasks")} className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">
                XEM TẤT CẢ
              </button>
            </div>
            <div className="space-y-4">
              {(isAdmin ? adminLogs : dashboardTasks).map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "group flex items-start gap-4 rounded-xl border p-4 transition-all hover:border-primary/30 hover:bg-slate-50/50 hover:shadow-lg hover:shadow-slate-100/50",
                    (item as any).priority === "urgent" ? "border-rose-100 bg-rose-50/30" : "border-slate-100 bg-white",
                  )}
                >
                  <div
                    className={cn(
                      "mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded border shadow-sm",
                      (item as any).priority === "urgent" ? "border-rose-300 text-rose-500 bg-white" : "border-slate-300 text-slate-400 bg-white",
                    )}
                  >
                    <Clock size={12} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-black text-slate-900 transition-colors group-hover:text-primary uppercase tracking-tight leading-tight">{item.title}</h4>
                      {(item as any).priority && (
                        <span className={cn("rounded px-2 py-0.5 text-[8px] font-black uppercase tracking-widest border shadow-sm", (item as any).priority === "urgent" ? "bg-rose-500 text-white border-rose-600" : "bg-slate-50 text-slate-400 border-slate-200")}>
                          {(item as any).priority}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{(item as any).delegation || (item as any).user}</p>
                    <div className="mt-3 flex items-center gap-4">
                      <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                        <Calendar size={12} className="text-slate-300" /> {(item as any).deadline || (item as any).time}
                      </span>
                      {(item as any).overdue && <span className="text-[9px] font-black tracking-[0.2em] text-rose-600">!! QUÁ HẠN XỬ LÝ</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {isAdmin ? (
              <>
                <HighlightCard title="Audit Console" detail="Tracking sessions & security events" action="OPEN CONSOLE" color="dark" icon={<ShieldCheck size={32} />} onClick={() => navigate("/admin/audit-log")} />
                <HighlightCard title="System Config" detail="Environment & global parameters" action="CONFIGURE" color="primary" icon={<Settings size={32} />} onClick={() => navigate("/admin/system")} />
              </>
            ) : isDirector ? (
              <>
                <HighlightCard title="Bản đồ đầu tư" detail="Trực quan hóa các dự án trọng điểm" action="MỞ BẢN ĐỒ" color="dark" icon={<Building2 size={32} />} onClick={() => navigate("/city-overview")} />
                <HighlightCard title="Chỉ số tăng trưởng" detail="Phân tích dữ liệu kinh tế vĩ mô" action="XEM BÁO CÁO" color="primary" icon={<PieChart size={32} />} onClick={() => navigate("/reports/city")} />
              </>
            ) : (
              <>
                <HighlightCard title="Đoàn HQ Bán Dẫn" detail="85% hoàn thành tiến độ hành chính" action="QUẢN LÝ ĐOÀN" color="dark" progress={75} icon={<Zap size={32} />} onClick={() => navigate("/delegations")} />
                <HighlightCard title="APAC ICT Summit" detail="Đà Nẵng IT Park - 2 ngày tới" action="XEM LỊCH TRÌNH" color="primary" icon={<Briefcase size={32} />} onClick={() => navigate("/schedule")} />
              </>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-7 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-50 pb-5">
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-900">{isAdmin ? "USERS ONLINE" : "SỰ KIỆN TRONG NGÀY"}</h2>
              <Calendar size={16} className="text-primary" />
            </div>
            <div className="relative space-y-6 before:absolute before:bottom-2 before:left-3.5 before:top-2 before:w-px before:bg-slate-100">
              {(isAdmin ? onlineUsers : weekSessions.slice(0, 3)).map((item: any) => (
                <div key={item.id} className="group relative pl-10">
                  <div className="absolute left-[8.5px] top-1.5 z-10 h-2 w-2 rounded-sm bg-slate-200 transition-all group-hover:bg-primary shadow-[0_0_0_4px_white] ring-1 ring-slate-100" />
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-widest text-primary">{item.time || item.role}</p>
                    <h4 className="truncate text-xs font-black uppercase tracking-tight text-slate-900 leading-tight">{item.title || item.name}</h4>
                    <p className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                      <MapPin size={12} className="text-slate-300" /> {item.location || item.ip}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate(isAdmin ? "/admin/users" : "/schedule")}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 transition-all hover:bg-slate-950 hover:text-white shadow-sm active:scale-95"
            >
              {isAdmin ? "QUẢN LÝ PHÂN QUYỀN" : "XEM TOÀN BỘ LỊCH TUẦN"}
            </button>
          </div>

          <div onClick={() => navigate("/notifications")} className="group relative overflow-hidden rounded-xl bg-slate-950 p-7 text-white shadow-2xl shadow-slate-950/20 active:scale-[0.98] transition-all cursor-pointer">
            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between">
                <div className="rounded-lg bg-white/10 p-2 text-amber-400 shadow-inner">
                  <Bell size={20} />
                </div>
                <ArrowUpRight size={18} className="text-white/20 transition-colors group-hover:text-white" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-black uppercase tracking-[0.2em]">THÔNG BÁO MỚI</h3>
                <p className="text-[11px] font-medium leading-relaxed text-white/60">Báo cáo Xúc tiến Đầu tư Quý I đã được lãnh đạo phê duyệt và ký số.</p>
              </div>
            </div>
            <div className="absolute bottom-[-40px] right-[-40px] h-48 w-48 rounded-full bg-primary/10 blur-3xl transition-all group-hover:bg-primary/20" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, note, icon, color }: any) {
  const colors: any = {
    blue: "text-blue-600 bg-white border-blue-100",
    emerald: "text-emerald-600 bg-white border-emerald-100",
    rose: "text-rose-600 bg-white border-rose-100",
    amber: "text-amber-600 bg-white border-amber-100",
    purple: "text-purple-600 bg-white border-purple-100",
  };
  return (
    <div className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-primary/30 hover:shadow-xl hover:shadow-slate-200/40 active:scale-[0.98]">
      <div className="absolute right-[-10px] top-[-10px] h-20 w-20 rounded-full bg-slate-50 opacity-40 transition-all group-hover:bg-primary/10 group-hover:scale-110" />
      <div className="relative z-10 space-y-5">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg border shadow-sm transition-all group-hover:scale-110", colors[color])}> {icon} </div>
        <div>
          <p className="mb-0.5 text-[10px] font-black uppercase tracking-widest text-slate-400">{title}</p>
          <p className="text-3xl font-black tracking-tighter text-slate-950">{value}</p>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
          <ArrowUpRight size={14} className="animate-pulse" /> {note}
        </div>
      </div>
    </div>
  );
}

function HighlightCard({ title, detail, action, color, icon, progress, onClick }: any) {
  const handleCardClick = () => {
    onClick?.();
    toast.info(`Đang mở ${title}`);
  };

  return (
    <div className={cn("relative space-y-6 overflow-hidden rounded-xl p-8 text-white shadow-2xl transition-all active:scale-[0.98] cursor-pointer", color === "dark" ? "bg-slate-900 shadow-slate-900/10" : "bg-primary shadow-primary/10")}>
      <div className="absolute right-6 top-6 text-white opacity-5 transform scale-150">{icon}</div>
      <div className="space-y-1">
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30">HỆ THỐNG IPA</p>
        <h3 className="font-title text-xl font-black uppercase tracking-tight">{title}</h3>
      </div>
      {progress !== undefined ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
            <span className="text-white/40">HIỆU SUẤT XỬ LÝ</span>
            <span className="text-amber-400">{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10 p-0.5">
            <div className="h-full rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]" style={{ width: `${progress}%` }} />
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-white/5 bg-white/5 p-4 backdrop-blur-sm">
          <p className="text-xs font-semibold leading-relaxed text-white/80 uppercase tracking-tight">{detail}</p>
        </div>
      )}
      <button
        onClick={handleCardClick}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-lg py-3 text-[10px] font-black uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95",
          color === "dark" ? "bg-white text-slate-950 hover:bg-slate-100" : "bg-slate-950 text-white hover:bg-slate-900",
        )}
      >
        {action} <ChevronRight size={16} />
      </button>
    </div>
  );
}

const adminLogs = [
  { id: 1, title: "Đăng nhập từ IP mới", user: "Admin", time: "10:45", priority: "urgent" },
  { id: 2, title: "Cấu hình Keycloak cập nhật", user: "System", time: "09:20", priority: "normal" },
  { id: 3, title: "Backup DB định kỳ", user: "Service", time: "00:00", priority: "normal" },
];
const onlineUsers = [
  { id: 1, name: "Trần Thu Hà", role: "Staff", ip: "10.0.1.45" },
  { id: 2, name: "Nguyễn Minh Châu", role: "Manager", ip: "10.0.1.12" },
  { id: 3, name: "Hồ Kỳ Minh", role: "Director", ip: "10.0.2.1" },
];
