import * as React from "react";
import { Server, Users, ShieldAlert, Cpu } from "lucide-react";
import { toast } from "sonner";

export default function AdminDashboardPage() {
  const handleAction = (action: string) => {
    toast.success(`Đã chạy tác vụ: ${action}`);
  };

  return (
    <div className="space-y-6 duration-500 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div>
          <h1 className="font-title text-2xl font-black tracking-tight text-slate-900 uppercase">SYSADMIN DASHBOARD</h1>
          <p className="mt-1 text-sm font-medium text-slate-500">Giám sát tổng thể hoạt động hệ thống và máy chủ.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => handleAction("Khởi động lại Cache")} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-95">
            XÓA CACHE RAM
          </button>
          <button onClick={() => handleAction("Backup Dữ Liệu Khẩn Cấp")} className="rounded-lg bg-emerald-600 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white shadow-md shadow-emerald-500/20 transition-all hover:bg-emerald-700 active:scale-95">
            BACKUP DATABASE
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        {[
          { title: "Tài khoản Active", value: "24", icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
          { title: "Tải Server (CPU)", value: "12%", icon: Cpu, color: "text-amber-500", bg: "bg-amber-50" },
          { title: "Kết nối Database", value: "Ổn định", icon: Server, color: "text-emerald-500", bg: "bg-emerald-50" },
          { title: "Cảnh báo Bảo mật", value: "0", icon: ShieldAlert, color: "text-rose-500", bg: "bg-rose-50" },
        ].map((stat, i) => (
          <div key={i} className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 border border-slate-100">
              <stat.icon className={stat.color} size={20} />
            </div>
            <div className="mt-auto">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.title}</p>
              <p className="mt-1 text-2xl font-black tracking-tight text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
