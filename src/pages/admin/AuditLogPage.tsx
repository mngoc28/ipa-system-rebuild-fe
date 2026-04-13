import * as React from "react";
import { toast } from "sonner";
import { History, Search, Filter, User, Activity, Clock, ArrowRight, ShieldAlert, Download, Terminal, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";
const mockLogs = [
  { id: 1, user: "Nguyễn Văn Quản Trị", action: "Đăng nhập hệ thống", detail: "Thực hiện đăng nhập thành công từ IP 192.168.1.5", time: "10:15 - 10/04/2026", type: "info" },
  { id: 2, user: "Trần Thu Hà", action: "Cập nhật đoàn", detail: 'Chuyển trạng thái Đoàn Inbound Hàn Quốc sang "Đang khảo sát"', time: "09:42 - 10/04/2026", type: "success" },
  { id: 3, user: "Nguyễn Minh Châu", action: "Phê duyệt lịch", detail: "Phê duyệt lịch công tác tuần 15 cho Phòng Xúc tiến 1", time: "08:15 - 10/04/2026", type: "success" },
  { id: 4, user: "Lê Văn Giám Đốc", action: "Xem báo cáo", detail: "Truy xuất báo cáo tổng kết quý 1 city_report_q1.pdf", time: "Yesterday - 16:30", type: "info" },
  { id: 6, user: "Admin", action: "Xóa dữ liệu", detail: "Xóa 15 bản ghi tạm trong thư mục Downloads", time: "Yesterday - 08:00", type: "system" }
];

export default function AuditLogPage() {
  const [logs, setLogs] = React.useState(mockLogs);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [showOnlySystem, setShowOnlySystem] = React.useState(false);

  const visibleLogs = logs.filter((log) => {
    const keyword = searchTerm.trim().toLowerCase();
    const byKeyword = keyword ? log.action.toLowerCase().includes(keyword) || log.detail.toLowerCase().includes(keyword) || log.user.toLowerCase().includes(keyword) : true;
    const byType = showOnlySystem ? log.type === "system" : true;
    return byKeyword && byType;
  });

  const handleExport = () => {
    const headers = ["ID", "User", "Action", "Detail", "Time", "Type"];
    const rows = visibleLogs.map((log) => [log.id, log.user, log.action, log.detail, log.time, log.type]);
    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `audit-log-${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Đã xuất ${visibleLogs.length} bản ghi nhật ký.`);
  };

  return (
    <div className="space-y-6 duration-500 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-950 text-primary border border-slate-800 shadow-xl shadow-slate-950/20 shadow-inner">
            <History size={24} />
          </div>
          <div>
            <h1 className="font-title text-2xl font-black tracking-tight text-slate-900 uppercase">Audit Log</h1>
            <p className="mt-1 text-sm font-medium text-slate-500">Theo dõi và truy vết hoạt động vận hành trên toàn bộ hệ thống IPA.</p>
          </div>
        </div>
        <button onClick={handleExport} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-95">
          <Download size={14} /> XUẤT NHẬT KÝ (EXCEL)
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Timeline style logs */}
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                placeholder="Tìm kiếm hành động, người dùng hoặc sự kiện..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent py-2 pl-11 pr-4 text-xs font-medium outline-none placeholder:text-slate-400" 
              />
            </div>
            <button onClick={() => setShowOnlySystem((prev) => !prev)} className={cn("p-2 transition-colors", showOnlySystem ? "text-primary" : "text-slate-400 hover:text-primary") }>
              <Filter size={18} />
            </button>
          </div>

          <div className="relative space-y-3">
            {/* Timeline line */}
            <div className="absolute bottom-0 left-[23px] top-0 hidden w-px bg-slate-100 md:block" />
            
            {visibleLogs.map((log) => (
              <div key={log.id} className="group relative overflow-hidden rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:border-primary/20 hover:shadow-md md:ml-12">
                {/* Log node indicator */}
                <div
                  className={cn(
                    "absolute left-[-47px] top-1/2 z-10 hidden h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg border-2 border-white shadow-sm md:flex",
                    log.type === "success" ? "bg-emerald-500" : log.type === "warning" ? "bg-amber-500" : log.type === "info" ? "bg-blue-500" : "bg-slate-950",
                  )}
                >
                  <Activity size={12} className="text-white" />
                </div>
                
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-slate-400">
                        <Clock size={10} className="text-slate-300" /> {log.time}
                      </span>
                      <span className="h-0.5 w-3 rounded-full bg-slate-100" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-primary bg-primary/5 px-2 py-0.5 rounded border border-primary/10">{log.action}</span>
                    </div>
                    <h3 className="text-xs font-bold text-slate-900 transition-colors group-hover:text-primary leading-tight">{log.detail}</h3>
                  </div>
                  
                  <div className="flex shrink-0 items-center gap-2.5 rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-1.5">
                    <div className="flex h-5 w-5 items-center justify-center rounded bg-white border border-slate-200 shadow-sm">
                      <User size={10} className="text-slate-500" />
                    </div>
                    <span className="text-[10px] font-black text-slate-700 uppercase tracking-tight">{log.user}</span>
                  </div>
                </div>
                {/* Accent border */}
                <div
                  className={cn(
                    "absolute left-0 top-0 h-full w-1",
                    log.type === "success" ? "bg-emerald-500" : log.type === "warning" ? "bg-amber-500" : log.type === "info" ? "bg-blue-500" : "bg-slate-950",
                  )}
                />
              </div>
            ))}
          </div>
          
          <button
            onClick={() => {
              const nextId = logs.length + 1;
              setLogs([
                ...logs,
                { id: nextId, user: "System", action: "Đồng bộ nền", detail: `Đã đồng bộ batch #${nextId}`, time: "Vừa xong", type: "system" },
              ]);
            }}
            className="flex w-full items-center justify-center gap-2 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 transition-all hover:text-primary active:scale-95"
          >
            TẢI THÊM NHẬT KÝ HỆ THỐNG <ArrowRight size={14} />
          </button>
        </div>

        {/* Right Column: Summaries & Stats */}
        <div className="space-y-6">
          <div className="relative space-y-6 overflow-hidden rounded-xl bg-slate-950 p-6 text-white shadow-xl shadow-slate-950/30 border border-slate-900 shadow-inner">
            <div className="relative z-10 space-y-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary shadow-lg border border-primary/20">
                <ShieldAlert size={20} />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black uppercase tracking-tight">Giám sát Bảo mật AI</h3>
                <p className="text-[10px] font-medium leading-relaxed text-slate-500 uppercase tracking-widest">
                  Hệ thống đang chủ động giám sát <span className="text-white font-bold">24/7</span> các hành vi bất thường.
                </p>
              </div>
              
              <div className="space-y-3 rounded-lg border border-white/5 bg-white/5 p-4 backdrop-blur-sm shadow-inner">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Người dùng online</span>
                  <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-400 uppercase">
                    <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> 12 Cán bộ
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Lưu lượng nhật ký</span>
                  <span className="text-[10px] font-black text-white uppercase tracking-tight">1.2 GB / 50 GB</span>
                </div>
              </div>
            </div>
            {/* Background Glow */}
            <div className="absolute top-[-20%] right-[-10%] h-48 w-48 rounded-full bg-primary/10 blur-[60px]" />
          </div>

          <div className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-900 border-b border-slate-50 pb-2">Trạng thái Hạ tầng</h3>
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-100 bg-slate-50 text-slate-400">
                  <Terminal size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="mb-1.5 flex justify-between">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-tight">Database Engine</span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Đang chạy</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-50 border border-slate-100">
                    <div className="h-full w-full rounded-full bg-emerald-500" />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-100 bg-slate-50 text-slate-400">
                  <Cpu size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="mb-1.5 flex justify-between">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-tight">Compute Load</span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-amber-500">24%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-50 border border-slate-100">
                    <div className="h-full w-[24%] rounded-full bg-amber-500 transition-all duration-1000" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
