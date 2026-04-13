import * as React from "react";
import { toast } from "sonner";
import { Users, UserPlus, Search, Filter, MoreVertical, ShieldCheck, Mail, Building, UserCheck, UserX, Edit2, Trash2, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
const mockUsers = [
  { id: "1", name: "Nguyễn Văn Quản Trị", email: "admin@danang.gov.vn", role: "Admin", unit: "Trung tâm Xúc tiến Đầu tư", status: "active", avatar: "https://i.pravatar.cc/150?u=1" },
  { id: "2", name: "Trần Thu Hà", email: "vth@danang.gov.vn", role: "Staff", unit: "Phòng Xúc tiến 1", status: "active", avatar: "https://i.pravatar.cc/150?u=2" },
  { id: "3", name: "Nguyễn Minh Châu", email: "nmc@danang.gov.vn", role: "Manager", unit: "Phòng Xúc tiến 1", status: "active", avatar: "https://i.pravatar.cc/150?u=3" },
  { id: "4", name: "Lê Văn Giám Đốc", email: "lvg@danang.gov.vn", role: "Director", unit: "Ban Giám đốc", status: "active", avatar: "https://i.pravatar.cc/150?u=4" },
  { id: "5", name: "Phạm Minh Đức", email: "pmd@danang.gov.vn", role: "Staff", unit: "Phòng Pháp chế", status: "inactive" }
];

export default function UserManagementPage() {
  return (
    <div className="space-y-6 duration-500 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-inner">
            <Users size={24} />
          </div>
          <div>
            <h1 className="font-title text-2xl font-black tracking-tight text-slate-900 uppercase">Quản lý Người dùng</h1>
            <p className="mt-1 text-sm font-medium text-slate-500">Phân quyền, quản lý tài khoản cán bộ và đơn vị công tác toàn hệ thống.</p>
          </div>
        </div>
        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); toast.success("Thao tác đang được xử lý!"); }} className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-[10px] font-black uppercase tracking-wider text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-95">
          <UserPlus size={16} /> THÊM NGƯỜI DÙNG
        </button>
      </div>

      {/* Stats Quick Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <QuickStat title="Tổng nhân sự" value="42" icon={<UserCheck size={18} />} color="blue" />
        <QuickStat title="Đang hoạt động" value="38" icon={<ShieldCheck size={18} />} color="emerald" />
        <QuickStat title="Chưa kích hoạt" value="4" icon={<Lock size={18} />} color="amber" />
        <QuickStat title="Phòng ban" value="6" icon={<Building size={18} />} color="slate" />
      </div>

      {/* Table Section */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/50 p-4 md:flex-row">
          <div className="relative w-full md:w-[350px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              placeholder="Tìm tên, email hoặc đơn vị..." 
              className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-xs font-medium outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/5 shadow-sm" 
            />
          </div>
          <div className="flex items-center gap-2">
            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); toast.success("Thao tác đang được xử lý!"); }} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-600 transition-all hover:bg-slate-50 shadow-sm">
              <Filter size={14} /> LỌC DỮ LIỆU
            </button>
            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); toast.success("Thao tác đang được xử lý!"); }} className="rounded-lg border border-slate-200 bg-white p-2 text-slate-400 transition-all hover:bg-slate-50 hover:text-slate-600 shadow-sm">
              <MoreVertical size={16} />
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/30">
                <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Thành viên</th>
                <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Đơn vị / Phòng ban</th>
                <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Vai trò</th>
                <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Trạng thái</th>
                <th className="px-6 py-3 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {mockUsers.map((user) => (
                <tr key={user.id} className="group transition-all hover:bg-slate-50/50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img src={user.avatar} className="h-9 w-9 shrink-0 rounded-lg border border-slate-200 object-cover shadow-sm" alt="" />
                        <div className={cn("absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white", user.status === "active" ? "bg-emerald-500" : "bg-slate-300")} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 group-hover:text-primary transition-colors">{user.name}</p>
                        <p className="mt-0.5 flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-tight">
                          <Mail size={10} className="text-slate-300" /> {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
                      <Building size={12} className="text-slate-300" /> {user.unit}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className={cn(
                      "inline-block rounded border px-2 py-0.5 text-[9px] font-black uppercase tracking-wider", 
                      user.role === "Admin" ? "bg-primary/5 text-primary border-primary/10" : "bg-slate-50 text-slate-500 border-slate-200"
                    )}>
                      {user.role}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-widest", 
                      user.status === "active" ? "text-emerald-600" : "text-slate-400"
                    )}>
                      {user.status === "active" ? "Hoạt động" : "Bị khóa"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-10 md:opacity-0 transition-opacity group-hover:opacity-100">
                      <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); toast.success("Thao tác đang được xử lý!"); }} className="rounded-lg p-2 text-slate-400 transition-all hover:bg-primary/5 hover:text-primary active:scale-90 border border-transparent hover:border-primary/10">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); toast.success("Thao tác đang được xử lý!"); }} className="rounded-lg p-2 text-slate-400 transition-all hover:bg-amber-50 hover:text-amber-600 active:scale-90 border border-transparent hover:border-amber-100">
                        <Lock size={14} />
                      </button>
                      <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); toast.success("Thao tác đang được xử lý!"); }} className="rounded-lg p-2 text-slate-400 transition-all hover:bg-rose-50 hover:text-rose-600 active:scale-90 border border-transparent hover:border-rose-100">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Hiển thị 5 trên 42 thành viên</p>
          <div className="flex gap-1">
            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); toast.success("Thao tác đang được xử lý!"); }} className="rounded-md border border-slate-200 bg-white px-3 py-1 text-[10px] font-black uppercase text-slate-400 disabled:opacity-50" disabled>
              Trước
            </button>
            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); toast.success("Thao tác đang được xử lý!"); }} className="rounded-md bg-primary px-3 py-1 text-[10px] font-black uppercase text-white shadow-sm shadow-primary/20">1</button>
            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); toast.success("Thao tác đang được xử lý!"); }} className="rounded-md border border-slate-200 bg-white px-3 py-1 text-[10px] font-black uppercase text-slate-600 hover:bg-slate-50 transition-colors">Tiếp</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickStat({ title, value, icon, color }: any) {
  const colors: any = { 
    blue: "bg-blue-50 text-blue-600 border-blue-100 shadow-blue-100/20", 
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-100/20", 
    amber: "bg-amber-50 text-amber-600 border-amber-100 shadow-amber-100/20", 
    slate: "bg-slate-50 text-slate-600 border-slate-200 shadow-slate-100/20" 
  };
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-slate-300">
      <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border", colors[color])}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 truncate">{title}</p>
        <p className="text-xl font-black text-slate-950 tracking-tight leading-none">{value}</p>
      </div>
    </div>
  );
}

