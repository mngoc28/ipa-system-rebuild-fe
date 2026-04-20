import axiosClient from "@/api/axiosClient";
import { useAdminOperationalStats } from "@/hooks/useAdminData";
import { cn } from "@/lib/utils";
import { Cpu, Server, ShieldAlert, Users } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

export default function AdminDashboardPage() {
  const [isClearingCache, setIsClearingCache] = React.useState(false);
  const { data: stats, isLoading } = useAdminOperationalStats();

  const handleClearCache = async () => {
    setIsClearingCache(true);

    try {
      const response = await axiosClient.post("/api/v1/admin/maintenance/cache-clear");
      const commandCount = Array.isArray(response.data?.data?.commands) ? response.data.data.commands.length : 0;
      toast.success(`Đã chạy ${commandCount} tác vụ dọn cache và cấu hình.`);
    } catch {
      toast.error("Không thể xóa cache hệ thống.");
    } finally {
      setIsClearingCache(false);
    }
  };

  const handleBackup = () => {
    toast.info("Sao lưu database chưa được triển khai trong backend. Tác vụ này tạm thời bị chặn để tránh báo cáo giả.");
  };

  const dashboardStats = [
    { 
      title: "Tài khoản (Tổng)", 
      value: stats?.total_users ? String(stats.total_users) : "0", 
      icon: Users, 
      color: "text-blue-500", 
      bg: "bg-blue-50" 
    },
    { 
      title: "Tải Server (CPU)", 
      value: stats?.cpu_load !== undefined ? `${stats.cpu_load}%` : "5%", 
      icon: Cpu, 
      color: "text-amber-500", 
      bg: "bg-amber-50" 
    },
    { 
      title: "Kết nối Database", 
      value: stats?.db_status ? "Ổn định" : "Lỗi kết nối", 
      icon: Server, 
      color: stats?.db_status ? "text-emerald-500" : "text-rose-500", 
      bg: stats?.db_status ? "bg-emerald-50" : "bg-rose-50" 
    },
    { 
      title: "Cảnh báo Bảo mật", 
      value: stats?.security_alerts_count !== undefined ? String(stats.security_alerts_count) : "0", 
      icon: ShieldAlert, 
      color: stats?.security_alerts_count && stats.security_alerts_count > 0 ? "text-rose-500" : "text-slate-400", 
      bg: "bg-slate-50" 
    },
  ];

  return (
    <div className="space-y-6 duration-500 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div>
          <h1 className="font-title text-2xl font-black uppercase tracking-tight text-slate-900">SYSADMIN DASHBOARD</h1>
          <p className="mt-1 text-sm font-medium text-slate-500">Giám sát tổng thể hoạt động hệ thống và máy chủ.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => void handleClearCache()} disabled={isClearingCache} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60">
            {isClearingCache ? "ĐANG XÓA CACHE..." : "XÓA CACHE RAM"}
          </button>
          <button onClick={handleBackup} className="rounded-lg bg-slate-200 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 shadow-sm transition-all hover:bg-slate-200 active:scale-95" aria-disabled="true">
            BACKUP DATABASE
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        {dashboardStats.map((stat, i) => (
          <div key={i} className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-slate-300">
            <div className={cn("mb-4 flex h-10 w-10 items-center justify-center rounded-lg border transition-colors", stat.bg)}>
              <stat.icon className={stat.color} size={20} />
            </div>
            
            <div className="mt-auto">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.title}</p>
              {isLoading ? (
                <div className="mt-2 h-8 w-16 animate-pulse rounded bg-slate-100" />
              ) : (
                <p className="mt-1 text-2xl font-black tracking-tight text-slate-900 transition-colors group-hover:text-primary">
                  {stat.value}
                </p>
              )}
            </div>
            
            {/* Background decoration */}
            <div className="absolute right-[-10%] top-[-20%] opacity-5 transition-opacity group-hover:opacity-10">
              <stat.icon size={80} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
