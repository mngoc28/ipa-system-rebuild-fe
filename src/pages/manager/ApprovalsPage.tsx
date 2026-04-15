import * as React from "react";
import { ClipboardList, Search, Filter, MoreVertical, CheckCircle2, XCircle, Calendar, Clock, User, FileText, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
const mockApprovals = [
  { id: "1", title: "Phê duyệt đoàn Inbound Hàn Quốc", requester: "Trần Thu Hà", type: "Đoàn công tác", deadline: "Trong ngày", priority: "High", date: "10/04/2026", status: "pending" },
  { id: "2", title: "Duyệt lịch trình khảo sát KCN thung lũng Silicon", requester: "Nguyễn Văn A", type: "Lịch trình", deadline: "2 ngày tới", priority: "Medium", date: "11/04/2026", status: "pending" },
  { id: "3", title: "Yêu cầu hỗ trợ xe đưa đón đoàn Singapore", requester: "Lê Thị B", type: "Hậu cần", deadline: "3 ngày tới", priority: "Low", date: "12/04/2026", status: "pending" },
  { id: "4", title: "Phê duyệt biên bản ghi nhớ dự án ICT 2026", requester: "Phạm Minh Đức", type: "Biên bản", deadline: "Tuần sau", priority: "Medium", date: "15/04/2026", status: "pending" }
];

export default function ApprovalsPage() {
  const [approvals, setApprovals] = React.useState(mockApprovals);
  const [activeTab, setActiveTab] = React.useState<"pending" | "approved">("pending");

  const handleApprove = (id: string) => {
    setApprovals((prev) => prev.map((item) => (item.id === id ? { ...item, status: "approved" } : item)));
    toast.success(`Đã phê duyệt yêu cầu #${id} thành công!`);
  };

  const handleReject = (id: string) => {
    setApprovals((prev) => prev.filter((item) => item.id !== id));
    toast.error("Đã từ chối phê duyệt");
  };

  const handleRowOptions = (title: string) => {
    toast.info(`Tùy chọn xử lý cho: ${title}`);
  };

  const visibleApprovals = approvals.filter((item) => item.status === activeTab);

  return (
    <div className="space-y-8 duration-500 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div>
          <h1 className="font-title text-2xl font-black tracking-tight text-slate-900 uppercase leading-none">Hàng đợi Phê duyệt</h1>
          <p className="mt-1 text-sm font-medium text-slate-500">Phê duyệt lịch trình, kế hoạch và các yêu cầu từ cán bộ chuyên viên.</p>
        </div>
        <div className="flex rounded-xl bg-slate-100 p-1 shrink-0">
          <button onClick={() => setActiveTab("pending")} className={cn("rounded-lg px-5 py-2 text-xs font-bold transition-all", activeTab === "pending" ? "border border-slate-200/50 bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700")}>Đang chờ ({approvals.filter((item) => item.status === "pending").length})</button>
          <button onClick={() => setActiveTab("approved")} className={cn("rounded-lg px-5 py-2 text-xs font-bold transition-all", activeTab === "approved" ? "border border-slate-200/50 bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700")}>Đã duyệt ({approvals.filter((item) => item.status === "approved").length})</button>
        </div>
      </div>

      {/* Grid of Approvals */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {visibleApprovals.map((item) => (
          <div key={item.id} className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-primary/20 hover:shadow-md">
            {/* Background Decoration */}
            <div className="absolute left-0 top-0 h-full w-1 bg-slate-50 transition-colors group-hover:bg-primary" />
            
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg shadow-sm border border-slate-100", item.priority === "High" ? "bg-rose-50 text-rose-500 border-rose-100" : "bg-slate-50 text-slate-400")}>
                  {item.type === "Biên bản" ? <FileText size={20} /> : <ClipboardList size={20} />}
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.type}</p>
                  <h3 className="text-sm font-bold leading-snug text-slate-900 transition-colors group-hover:text-primary">{item.title}</h3>
                </div>
              </div>
              <button onClick={() => handleRowOptions(item.title)} className="p-1.5 text-slate-300 transition-all hover:text-slate-600">
                <MoreVertical size={16} />
              </button>
            </div>

            <div className="mb-5 grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-[9px] font-black uppercase tracking-wider text-slate-500">Người yêu cầu</p>
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full bg-slate-200 border border-white shadow-sm" />
                  <span className="text-xs font-bold text-slate-700">{item.requester}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-black uppercase tracking-wider text-slate-500">Hạn xử lý</p>
                <div className="flex items-center gap-2 text-xs font-bold text-rose-600">
                  <Clock size={12} className="shrink-0" />
                  {item.deadline}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="text-[10px] font-bold uppercase tracking-tight text-slate-400">Gửi lúc: 08:30 sáng</span>
              <div className="flex items-center gap-2">
                <button onClick={() => handleReject(item.id)} className="rounded-lg p-2 text-slate-400 transition-all hover:bg-rose-50 hover:text-rose-500 border border-transparent hover:border-rose-100">
                  <XCircle size={18} />
                </button>
                {activeTab === "pending" && (
                  <button
                    onClick={() => handleApprove(item.id)}
                    className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-[10px] font-black uppercase tracking-wider text-white shadow-md shadow-primary/20 transition-all hover:bg-primary/90 active:scale-95"
                  >
                    <CheckCircle2 size={14} /> Phê duyệt
                  </button>
                )}
              </div>
            </div>

            {/* Priority Indicator */}
            {item.priority === "High" && (
              <div className="absolute right-10 top-3 flex items-center gap-1 rounded-full bg-rose-500 px-2 py-0.5 text-[8px] font-black text-white shadow-sm uppercase tracking-widest">
                <AlertCircle size={8} /> KHẨN
              </div>
            )}
          </div>
        ))}

        {/* Empty state card simulation */}
        {visibleApprovals.length === 0 && <div className="flex flex-col items-center justify-center space-y-3 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/30 p-6 text-center opacity-70">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-400 border border-slate-200/50">
            <Calendar size={24} />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Hết yêu cầu phê duyệt mới</p>
        </div>}
      </div>
    </div>
  );
}
