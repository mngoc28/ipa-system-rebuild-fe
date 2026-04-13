import * as React from "react";
import { Users, UserPlus, Mail, Phone, MapPin, MoreHorizontal, Shield, MessageSquare, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
const teamMembers = [
  { id: 1, name: "Trần Thu Hà", role: "Chuyên viên chính", email: "ha.tt@danang.gov.vn", status: "In Office", tasks: 12, performance: 95 },
  { id: 2, name: "Nguyễn Văn A", role: "Chuyên viên", email: "a.nv@danang.gov.vn", status: "On Field", tasks: 8, performance: 88 },
  { id: 3, name: "Lê Thị B", role: "Chuyên viên", email: "b.lt@danang.gov.vn", status: "In Office", tasks: 5, performance: 72 },
  { id: "4", name: "Phạm Minh Đức", role: "Chuyên viên", email: "duc.pm@danang.gov.vn", status: "On Leave", tasks: 0, performance: 0 }
];

export default function TeamsPage() {
  return (
    <div className="space-y-6 duration-500 animate-in fade-in">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div>
          <h1 className="font-title text-2xl font-black tracking-tight text-slate-900 uppercase">Đội nhóm & Nhân sự</h1>
          <p className="mt-1 text-sm font-medium text-slate-500">Quản lý hiệu suất và lịch trình làm việc của phòng ban.</p>
        </div>
        <button onClick={() => toast.success("Đã mở form thêm thành viên.")} className="flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-[11px] font-black uppercase tracking-wider text-white shadow-lg shadow-slate-900/10 transition-all hover:bg-slate-800 active:scale-95">
          <UserPlus size={16} /> THÊM THÀNH VIÊN
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
        {teamMembers.map((member) => (
          <div key={member.id} className="group rounded-xl border border-slate-200 bg-white p-5 text-center shadow-sm transition-all hover:border-primary/20 hover:shadow-md">
            <div className="relative mb-4 inline-block">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-slate-100 shadow-md">
                <img src={`https://i.pravatar.cc/150?u=${member.id}`} alt={member.name} className="h-full w-full object-cover" />
              </div>
              <div
                className={cn("absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white shadow-sm", 
                  member.status === "In Office" ? "bg-emerald-500" : 
                  member.status === "On Field" ? "bg-amber-500" : "bg-slate-300")}
              />
            </div>
            
            <div className="mb-4 space-y-0.5">
              <h3 className="text-sm font-bold text-slate-900">{member.name}</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-primary">{member.role}</p>
            </div>

            <div className="mb-5 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-black uppercase text-slate-400">
                <span>Hiệu suất</span>
                <span className="text-slate-900">{member.performance}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={cn("h-full rounded-full transition-all duration-1000", 
                    member.performance > 90 ? "bg-emerald-500" : 
                    member.performance > 75 ? "bg-blue-500" : "bg-amber-500")}
                  style={{ width: `${member.performance}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2 border-t border-slate-50">
              <button onClick={() => toast.info(`Đang mở email cho ${member.name}`)} className="rounded-lg bg-slate-50 p-2 text-slate-400 transition-all hover:bg-primary/10 hover:text-primary">
                <Mail size={16} />
              </button>
              <button onClick={() => toast.info(`Đang mở chat nội bộ với ${member.name}`)} className="rounded-lg bg-slate-50 p-2 text-slate-400 transition-all hover:bg-primary/10 hover:text-primary">
                <MessageSquare size={16} />
              </button>
              <button onClick={() => toast.info(`Đang mở phân quyền cho ${member.name}`)} className="rounded-lg bg-slate-50 p-2 text-slate-400 transition-all hover:bg-primary/10 hover:text-primary">
                <Shield size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Team Activity */}
      <div className="relative overflow-hidden rounded-xl bg-slate-950 p-6 text-white lg:p-10 shadow-xl shadow-slate-950/20">
        <div className="relative z-10 flex flex-col items-center justify-between gap-10 lg:flex-row">
          <div className="max-w-lg space-y-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-amber-400 border border-white/5 shadow-inner">
              <Zap size={20} />
            </div>
            <div className="space-y-1">
              <h3 className="font-title text-2xl font-black uppercase tracking-tight">Trạng thái hạ tầng công việc</h3>
              <p className="text-sm leading-relaxed text-slate-400">Hiện có 45 đầu việc đang triển khai trong tuần. Hiệu suất trung bình toàn bộ phận đạt <span className="text-white font-bold">88%</span>.</p>
            </div>
            <div className="flex gap-3">
              <div className="rounded-lg border border-white/10 bg-white/5 px-5 py-2.5">
                <p className="text-xl font-black">12</p>
                <p className="text-[9px] font-black uppercase text-slate-500">Đang khảo sát</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 px-5 py-2.5">
                <p className="text-xl font-black">08</p>
                <p className="text-[9px] font-black uppercase text-slate-500">Hoàn thành</p>
              </div>
            </div>
          </div>
          
          <div className="w-full space-y-5 rounded-lg border border-white/10 bg-white/5 p-6 backdrop-blur-md lg:w-80">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-white/5 pb-2">Nhật ký hoạt động</h4>
            <div className="space-y-4">
              {[
                { user: "Trần Thu Hà", action: "Hoàn thành báo cáo đoàn HQ", time: "20p trước" },
                { user: "Nguyễn Văn A", action: "Check-in Khu công nghệ cao", time: "50p trước" },
                { user: "Lê Thị B", action: "Cập nhật tài liệu dự án", time: "2h trước" },
              ].map((act, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{act.user}</p>
                    <p className="text-[10px] text-slate-400 truncate">{act.action}</p>
                  </div>
                  <span className="ml-auto shrink-0 text-[8px] font-black uppercase text-slate-500">{act.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
