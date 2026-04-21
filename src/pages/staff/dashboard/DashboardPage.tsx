import * as React from "react";
import { TrendingUp, Users, Calendar, Clock, CheckCircle2, ChevronRight, ArrowUpRight, Zap, Briefcase, MapPin, ShieldCheck, Building2, PieChart, ClipboardList, Search, Bell, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { weekSessions } from "@/dataHelper/ui-system.data";
import { onlineUsers } from "@/dataHelper/dashboard.dataHelper";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";
import { useDashboardSummaryQuery, useDashboardTasksQuery } from "@/hooks/useDashboardQuery";

interface TimelineItem {
  id: string | number;
  time?: string;
  role?: string;
  title?: string;
  name?: string;
  location?: string;
  ip?: string;
}

interface StatCardProps {
  title: string;
  value: string;
  note: string;
  icon: React.ReactNode;
  color: "blue" | "emerald" | "rose" | "amber" | "purple";
}

interface HighlightCardProps {
  title: string;
  detail: string;
  action: string;
  color: "dark" | "primary";
  icon: React.ReactNode;
  progress?: number;
  onClick?: () => void;
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const role = user?.role || "Staff";
  const isAdmin = role === "Admin";
  const isDirector = role === "Director";
  const isManager = role === "Manager";
  const quickActionPath = isAdmin ? "/admin/audit-log" : isDirector ? "/reports/city" : isManager ? "/reports/unit" : "/tasks";
  const scope = isAdmin ? "admin" : isDirector ? "director" : isManager ? "manager" : "staff";

  const summaryQuery = useDashboardSummaryQuery(scope);
  const tasksQuery = useDashboardTasksQuery(scope);

  const summary = summaryQuery.data?.data;
  const taskFeed = tasksQuery.data?.data?.items || [];
  const timelineItems: TimelineItem[] = isAdmin ? onlineUsers : weekSessions.slice(0, 3);

  return (
    <div className="space-y-8 duration-700 animate-in fade-in">
      {/* Welcome Section */}
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div className="space-y-1">
          <h1 className="font-title text-3xl font-black uppercase leading-tight tracking-tight text-brand-text-dark">
            {isDirector ? "Báo cáo chiến lược," : isManager ? "Quản lý đơn vị," : isAdmin ? "Quản trị hệ thống," : "Tin vắn nghiệp vụ,"}{" "}
            <span className="text-primary">{user?.fullName || "Cán bộ IPA"}</span> 👋
          </h1>
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-text-dark/40">
            {isAdmin ? "HỆ THỐNG ĐANG VẬN HÀNH ỔN ĐỊNH" : `IPA ĐÀ NẴNG • THỨ 6, 10/04/2026`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="group relative hidden w-72 lg:block">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-text-dark/40 transition-all group-focus-within:text-primary" size={16} />
            <input
              placeholder="Tìm nhanh đoàn, tài liệu, đối tác..."
              className="w-full rounded-lg border border-brand-dark/10 bg-white py-2.5 pl-11 pr-4 text-[11px] font-bold shadow-sm outline-none transition-all focus:border-primary/50 focus:ring-4 focus:ring-primary/5"
            />
          </div>
          <button onClick={() => navigate(quickActionPath)} className="flex items-center gap-2 rounded-lg bg-brand-dark px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-brand-dark/20 transition-all hover:opacity-90 active:scale-95">
            <Zap size={14} className="text-amber-400" />
            {isAdmin ? "XEM LOG HỆ THỐNG" : "BÁO CÁO NHANH"}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {isAdmin ? (
          <>
            <StatCard title="Tổng người dùng" value={String(summary?.stats.delegations ?? 0)} note="Số lượng tài khoản" icon={<Users size={20} />} color="blue" />
            <StatCard title="Thời gian vận hành" value={String(summary?.stats.tasks ?? 0)} note="Hệ thống ổn định" icon={<ShieldCheck size={20} />} color="emerald" />
            <StatCard title="Traffic định kỳ" value={String(summary?.stats.events ?? 0)} note="Lượt truy cập" icon={<TrendingUp size={20} />} color="purple" />
            <StatCard title="Lưu trữ nhật ký" value={String(summary?.overdueTasks.length ?? 0)} note="Bản ghi hệ thống" icon={<Clock size={20} />} color="amber" />
          </>
        ) : isDirector ? (
          <>
            <StatCard title="Tổng vốn đầu tư" value={String(summary?.stats.delegations ?? 0)} note="Đoàn công tác" icon={<TrendingUp size={20} />} color="emerald" />
            <StatCard title="Dự án Pipeline" value={String(summary?.stats.tasks ?? 0)} note="Đầu việc" icon={<Briefcase size={20} />} color="blue" />
            <StatCard title="Chỉ số PCI" value={String(summary?.stats.events ?? 0)} note="Sự kiện" icon={<PieChart size={20} />} color="purple" />
            <StatCard title="Đoàn cấp cao" value={String(summary?.overdueTasks.length ?? 0)} note="Quá hạn" icon={<Users size={20} />} color="amber" />
          </>
        ) : isManager ? (
          <>
            <StatCard title="Đoàn chờ duyệt" value={String(summary?.stats.delegations ?? 0)} note="Đoàn công tác" icon={<ClipboardList size={20} />} color="rose" />
            <StatCard title="Việc phòng ban" value={String(summary?.stats.tasks ?? 0)} note="Đầu việc" icon={<CheckCircle2 size={20} />} color="blue" />
            <StatCard title="Lịch họp tuần" value={String(summary?.stats.events ?? 0)} note="Sự kiện" icon={<Calendar size={20} />} color="amber" />
            <StatCard title="Báo cáo đơn vị" value={String(summary?.overdueTasks.length ?? 0)} note="Quá hạn" icon={<PieChart size={20} />} color="emerald" />
          </>
        ) : (
          <>
            <StatCard title="Đoàn phụ trách" value={String(summary?.stats.delegations ?? 0)} note="Đoàn công tác" icon={<Users size={20} />} color="blue" />
            <StatCard title="Việc cần làm" value={String(summary?.stats.tasks ?? 0)} note="Đầu việc" icon={<CheckCircle2 size={20} />} color="rose" />
            <StatCard title="Lịch cá nhân" value={String(summary?.stats.events ?? 0)} note="Sự kiện" icon={<Calendar size={20} />} color="amber" />
            <StatCard title="Tài liệu mới" value={String(summary?.overdueTasks.length ?? 0)} note="Quá hạn" icon={<Zap size={20} />} color="emerald" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <div className="space-y-6 rounded-xl border border-brand-dark/10 bg-white p-7 shadow-sm">
            <div className="flex items-center justify-between border-b border-brand-dark/5 pb-5">
              <h2 className="flex items-center gap-3 font-title text-base font-black uppercase tracking-tight text-brand-text-dark">
                {isAdmin ? <ShieldCheck size={20} className="text-primary" /> : <CheckCircle2 size={20} className="text-primary" />}
                {isAdmin ? "Nhật ký vận hành hệ thống" : "Đầu việc trọng tâm & Khẩn cấp"}
              </h2>
              <button onClick={() => navigate(isAdmin ? "/admin/audit-log" : "/tasks")} className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">
                XEM TẤT CẢ
              </button>
            </div>
            <div className="space-y-4">
              {taskFeed.length === 0 && (
                <div className="rounded-xl border border-dashed border-brand-dark/10 bg-brand-dark/[0.02] p-6 text-xs font-semibold text-brand-text-dark/40">
                  Chưa có đầu việc từ API.
                </div>
              )}
              {taskFeed.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "group flex items-start gap-4 rounded-xl border p-4 transition-all hover:border-primary/30 hover:bg-brand-dark/[0.02] hover:shadow-lg hover:shadow-brand-dark/[0.03]",
                    item.priority === "urgent" ? "border-destructive/20 bg-destructive/5" : "border-brand-dark/5 bg-white",
                  )}
                >
                  <div
                    className={cn(
                      "mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded border shadow-sm",
                      item.priority === "urgent" ? "border-destructive/40 text-destructive bg-white" : "border-brand-dark/10 text-brand-text-dark/40 bg-white",
                    )}
                  >
                    <Clock size={12} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-black uppercase leading-tight tracking-tight text-brand-text-dark transition-colors group-hover:text-primary">{item.title}</h4>
                      {item.priority && (
                        <span className={cn("rounded px-2 py-0.5 text-[8px] font-black uppercase tracking-widest border shadow-sm", item.priority === "urgent" ? "bg-destructive text-white border-destructive/20" : "bg-brand-dark/5 text-brand-text-dark/40 border-brand-dark/10")}>
                          {item.priority}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-text-dark/40">{item.delegation || item.user || "CHUNG"}</p>
                    <div className="mt-3 flex items-center gap-4">
                      <span className="flex items-center gap-1.5 text-[10px] font-bold text-brand-text-dark/40">
                        <Calendar size={12} className="text-brand-text-dark/20" /> {item.deadline || item.time || "N/A"}
                      </span>
                      {item.overdue && <span className="text-[9px] font-black tracking-[0.2em] text-destructive">!! QUÁ HẠN XỬ LÝ</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {isAdmin ? (
              <>
                <HighlightCard title="Nhật ký hệ thống" detail="Theo dõi phiên đăng nhập & sự kiện bảo mật" action="MỞ NHẬT KÝ" color="dark" icon={<ShieldCheck size={32} />} onClick={() => navigate("/admin/audit-log")} />
                <HighlightCard title="Cấu hình hệ thống" detail="Cài đặt môi trường & tham số hệ thống" action="CẤU HÌNH" color="primary" icon={<Settings size={32} />} onClick={() => navigate("/admin/system")} />
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
          <div className="space-y-6 rounded-xl border border-brand-dark/10 bg-white p-7 shadow-sm">
            <div className="flex items-center justify-between border-b border-brand-dark/5 pb-5">
              <h2 className="text-xs font-black uppercase tracking-widest text-brand-text-dark">{isAdmin ? "NGƯỜI DÙNG TRỰC TUYẾN" : "SỰ KIỆN TRONG NGÀY"}</h2>
              <Calendar size={16} className="text-primary" />
            </div>
            <div className="relative space-y-6 before:absolute before:inset-y-2 before:left-3.5 before:w-px before:bg-brand-dark/5">
              {timelineItems.map((item) => (
                <div key={item.id} className="group relative pl-10">
                  <div className="absolute left-[8.5px] top-1.5 z-10 size-2 rounded-sm bg-brand-dark/10 shadow-[0_0_0_4px_white] ring-1 ring-brand-dark/5 transition-all group-hover:bg-primary" />
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-widest text-primary">{item.time || item.role}</p>
                    <h4 className="truncate text-xs font-black uppercase leading-tight tracking-tight text-brand-text-dark">{item.title || item.name}</h4>
                    <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-tighter text-brand-text-dark/40">
                      <MapPin size={12} className="text-brand-text-dark/20" /> {item.location || item.ip}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate(isAdmin ? "/admin/users" : "/schedule")}
              className="w-full rounded-lg border border-brand-dark/10 bg-brand-dark/[0.02] py-3 text-[10px] font-black uppercase tracking-widest text-brand-text-dark/60 shadow-sm transition-all hover:bg-brand-dark hover:text-white active:scale-95"
            >
              {isAdmin ? "QUẢN LÝ PHÂN QUYỀN" : "XEM TOÀN BỘ LỊCH TUẦN"}
            </button>
          </div>

          <div onClick={() => navigate("/notifications")} className="group relative cursor-pointer overflow-hidden rounded-xl bg-brand-dark p-7 text-white shadow-2xl shadow-brand-dark/20 transition-all active:scale-[0.98]">
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
            <div className="absolute bottom-[-40px] right-[-40px] size-48 rounded-full bg-primary/10 blur-3xl transition-all group-hover:bg-primary/20" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, note, icon, color }: StatCardProps) {
  const colors: Record<StatCardProps["color"], string> = {
    blue: "text-blue-600 bg-white border-blue-100",
    emerald: "text-emerald-600 bg-white border-emerald-100",
    rose: "text-rose-600 bg-white border-rose-100",
    amber: "text-amber-600 bg-white border-amber-100",
    purple: "text-purple-600 bg-white border-purple-100",
  };
  return (
    <div className="group relative overflow-hidden rounded-xl border border-brand-dark/10 bg-white p-6 shadow-sm transition-all hover:border-primary/30 hover:shadow-xl hover:shadow-brand-dark/[0.05] active:scale-[0.98]">
      <div className="absolute right-[-10px] top-[-10px] size-20 rounded-full bg-brand-dark/[0.02] opacity-40 transition-all group-hover:scale-110 group-hover:bg-primary/10" />
      <div className="relative z-10 space-y-5">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg border shadow-sm transition-all group-hover:scale-110", colors[color])}> {icon} </div>
        <div>
          <p className="mb-0.5 text-[10px] font-black uppercase tracking-widest text-brand-text-dark/40">{title}</p>
          <p className="text-3xl font-black tracking-tighter text-brand-dark">{value}</p>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-600">
          <ArrowUpRight size={14} className="animate-pulse" /> {note}
        </div>
      </div>
    </div>
  );
}

function HighlightCard({ title, detail, action, color, icon, progress, onClick }: HighlightCardProps) {
  const handleCardClick = () => {
    onClick?.();
    toast.info(`Đang mở ${title}`);
  };

  return (
    <div className={cn("relative space-y-6 overflow-hidden rounded-xl p-8 text-white shadow-2xl transition-all active:scale-[0.98] cursor-pointer", color === "dark" ? "bg-brand-dark-900 shadow-brand-dark-900/10" : "bg-primary shadow-primary/10")}>
      <div className="absolute right-6 top-6 scale-150 text-white opacity-5">{icon}</div>
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
          <p className="text-xs font-semibold uppercase leading-relaxed tracking-tight text-white/80">{detail}</p>
        </div>
      )}
      <button
        onClick={handleCardClick}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-lg py-3 text-[10px] font-black uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95",
          color === "dark" ? "bg-white text-brand-dark hover:bg-brand-dark/5" : "bg-brand-dark text-white hover:bg-brand-dark-900",
        )}
      >
        {action} <ChevronRight size={16} />
      </button>
    </div>
  );
}

