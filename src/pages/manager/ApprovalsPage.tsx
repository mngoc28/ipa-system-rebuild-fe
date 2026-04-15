import * as React from "react";
import { ClipboardList, MoreVertical, CheckCircle2, XCircle, Calendar, Clock, FileText, AlertCircle } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { approvalsApi, mapApprovalStatus } from "@/api/approvalsApi";

interface ApprovalUi {
  id: string;
  title: string;
  requester: string;
  type: string;
  deadline: string;
  priority: "High" | "Medium" | "Low";
  date: string;
  status: "pending" | "approved" | "rejected";
}

const priorityByType = (type?: string): "High" | "Medium" | "Low" => {
  const normalized = (type || "").toUpperCase();
  if (normalized.includes("DELEGATION")) return "High";
  if (normalized.includes("MINUTES") || normalized.includes("SCHEDULE")) return "Medium";
  return "Low";
};

export default function ApprovalsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = React.useState<"pending" | "approved" | "rejected">("pending");
  const [rejectNotes, setRejectNotes] = React.useState<Record<string, string>>({});

  const approvalsQuery = useQuery({
    queryKey: ["approvals"],
    queryFn: () => approvalsApi.list({ page: 1, pageSize: 100 }),
  });

  const decisionMutation = useMutation({
    mutationFn: ({ id, decision, decisionNote }: { id: string; decision: "APPROVE" | "REJECT"; decisionNote?: string }) => approvalsApi.decision(id, { decision, decisionNote }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["approvals"] });
    },
  });

  const approvals: ApprovalUi[] = React.useMemo(() => {
    const items = approvalsQuery.data?.data?.items ?? [];
    return items.map((item) => {
      const status = mapApprovalStatus(item.status);
      return {
        id: item.id,
        title: item.title || `Yêu cầu ${item.type || "approval"}`,
        requester: item.requesterId || "N/A",
        type: item.type || "APPROVAL",
        deadline: item.dueAt ? new Date(item.dueAt).toLocaleDateString("vi-VN") : "Trong ngày",
        priority: priorityByType(item.type),
        date: item.createdAt ? new Date(item.createdAt).toLocaleDateString("vi-VN") : "--",
        status,
      };
    });
  }, [approvalsQuery.data]);

  const isLoading = approvalsQuery.isLoading;
  const isError = approvalsQuery.isError;

  const handleApprove = (id: string) => {
    decisionMutation.mutate(
      { id, decision: "APPROVE" },
      {
        onSuccess: () => toast.success(`Đã phê duyệt yêu cầu #${id} thành công!`),
        onError: () => toast.error("Không thể phê duyệt yêu cầu."),
      },
    );
  };

  const handleReject = (id: string) => {
    const decisionNote = rejectNotes[id]?.trim() || "Từ chối trong danh sách chờ phê duyệt";

    decisionMutation.mutate(
      { id, decision: "REJECT", decisionNote },
      {
        onSuccess: () => toast.error("Đã từ chối phê duyệt"),
        onError: () => toast.error("Không thể từ chối phê duyệt."),
      },
    );
  };

  const handleRowOptions = (title: string) => {
    toast.info(`Tùy chọn xử lý cho: ${title}`);
  };

  const visibleApprovals = approvals.filter((item) => item.status === activeTab);

  return (
    <div className="space-y-8 duration-500 animate-in fade-in">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div>
          <h1 className="font-title text-2xl font-black tracking-tight text-slate-900 uppercase leading-none">Hàng đợi Phê duyệt</h1>
          <p className="mt-1 text-sm font-medium text-slate-500">Phê duyệt lịch trình, kế hoạch và các yêu cầu từ cán bộ chuyên viên.</p>
        </div>
        <div className="flex rounded-xl bg-slate-100 p-1 shrink-0">
          <button onClick={() => setActiveTab("pending")} className={cn("rounded-lg px-5 py-2 text-xs font-bold transition-all", activeTab === "pending" ? "border border-slate-200/50 bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700")}>Đang chờ ({approvals.filter((item) => item.status === "pending").length})</button>
          <button onClick={() => setActiveTab("approved")} className={cn("rounded-lg px-5 py-2 text-xs font-bold transition-all", activeTab === "approved" ? "border border-slate-200/50 bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700")}>Đã duyệt ({approvals.filter((item) => item.status === "approved").length})</button>
          <button onClick={() => setActiveTab("rejected")} className={cn("rounded-lg px-5 py-2 text-xs font-bold transition-all", activeTab === "rejected" ? "border border-slate-200/50 bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700")}>Từ chối ({approvals.filter((item) => item.status === "rejected").length})</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {isLoading ? (
          <div className="col-span-full rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm font-semibold text-slate-500">Đang tải yêu cầu phê duyệt...</div>
        ) : isError ? (
          <div className="col-span-full rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm font-semibold text-rose-600">Không thể tải danh sách phê duyệt.</div>
        ) : visibleApprovals.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center space-y-3 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/30 p-6 text-center opacity-70">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-400 border border-slate-200/50">
              <Calendar size={24} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Hết yêu cầu ở trạng thái hiện tại</p>
          </div>
        ) : visibleApprovals.map((item) => (
          <div key={item.id} className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-primary/20 hover:shadow-md">
            <div className="absolute left-0 top-0 h-full w-1 bg-slate-50 transition-colors group-hover:bg-primary" />

            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg shadow-sm border border-slate-100", item.priority === "High" ? "bg-rose-50 text-rose-500 border-rose-100" : "bg-slate-50 text-slate-400")}>
                  {item.type.toUpperCase().includes("MINUTES") ? <FileText size={20} /> : <ClipboardList size={20} />}
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
              <span className="text-[10px] font-bold uppercase tracking-tight text-slate-400">Ngày gửi: {item.date}</span>
              <div className="flex items-center gap-2">
                {activeTab === "pending" && (
                  <>
                    <button onClick={() => handleReject(item.id)} className="rounded-lg p-2 text-slate-400 transition-all hover:bg-rose-50 hover:text-rose-500 border border-transparent hover:border-rose-100">
                      <XCircle size={18} />
                    </button>
                    <button
                      disabled={decisionMutation.isPending}
                      onClick={() => handleApprove(item.id)}
                      className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-[10px] font-black uppercase tracking-wider text-white shadow-md shadow-primary/20 transition-all hover:bg-primary/90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <CheckCircle2 size={14} /> Phê duyệt
                    </button>
                  </>
                )}
              </div>
            </div>

            {activeTab === "pending" && (
              <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
                <p className="text-[9px] font-black uppercase tracking-wider text-slate-500">Ghi chú từ chối</p>
                <textarea
                  value={rejectNotes[item.id] ?? ""}
                  onChange={(event) => setRejectNotes((current) => ({ ...current, [item.id]: event.target.value }))}
                  rows={2}
                  placeholder="Nhập lý do nếu cần từ chối"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium outline-none transition-all focus:border-primary/30 focus:bg-white focus:ring-4 focus:ring-primary/5"
                />
              </div>
            )}

            {item.priority === "High" && (
              <div className="absolute right-10 top-3 flex items-center gap-1 rounded-full bg-rose-500 px-2 py-0.5 text-[8px] font-black text-white shadow-sm uppercase tracking-widest">
                <AlertCircle size={8} /> KHẨN
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
