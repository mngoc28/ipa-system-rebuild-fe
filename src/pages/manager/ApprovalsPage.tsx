import * as React from "react";
import { ClipboardList, MoreVertical, CheckCircle2, XCircle, Calendar, Clock, FileText, AlertCircle } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { approvalsApi, mapApprovalStatus } from "@/api/approvalsApi";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

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
  const [loadingTimedOut, setLoadingTimedOut] = React.useState(false);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [selectedApprovalId, setSelectedApprovalId] = React.useState<string | null>(null);

  const tabToApiStatus = React.useMemo(() => ({
    pending: "PENDING",
    approved: "APPROVED",
    rejected: "REJECTED",
  }), []);

  const approvalsQuery = useQuery({
    queryKey: ["approvals", activeTab],
    queryFn: () => approvalsApi.list({ status: tabToApiStatus[activeTab], page: 1, pageSize: 100 }),
    placeholderData: (previousData) => previousData,
  });

  const approvalDetailQuery = useQuery({
    queryKey: ["approvals", "detail", selectedApprovalId],
    queryFn: () => approvalsApi.getById(selectedApprovalId!),
    enabled: detailOpen && !!selectedApprovalId,
    placeholderData: (previousData) => previousData,
  });

  const approvalsCountQuery = useQuery({
    queryKey: ["approvals", "counts"],
    queryFn: () => approvalsApi.list({ page: 1, pageSize: 100 }),
    placeholderData: (previousData) => previousData,
  });

  const decisionMutation = useMutation({
    mutationFn: ({ id, decision, decisionNote }: { id: string; decision: "APPROVE" | "REJECT"; decisionNote?: string }) => approvalsApi.decision(id, { decision, decisionNote }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["approvals"] });
      if (selectedApprovalId === variables.id) {
        void queryClient.invalidateQueries({ queryKey: ["approvals", "detail", variables.id] });
      }
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

  const approvalCounts = React.useMemo(() => {
    const allItems = approvalsCountQuery.data?.data?.items ?? [];
    return {
      pending: allItems.filter((item) => mapApprovalStatus(item.status) === "pending").length,
      approved: allItems.filter((item) => mapApprovalStatus(item.status) === "approved").length,
      rejected: allItems.filter((item) => mapApprovalStatus(item.status) === "rejected").length,
    };
  }, [approvalsCountQuery.data]);

  React.useEffect(() => {
    if (!approvalsQuery.isLoading) {
      setLoadingTimedOut(false);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setLoadingTimedOut(true);
    }, 12000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [approvalsQuery.isLoading]);

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

  const handleRowOptions = (id: string) => {
    const approval = approvals.find((item) => item.id === id);
    if (!approval) {
      toast.info(`Không tìm thấy chi tiết cho yêu cầu này.`);
      return;
    }

    setSelectedApprovalId(approval.id);
    setDetailOpen(true);
  };

  const selectedApproval = approvals.find((item) => item.id === selectedApprovalId) ?? null;
  const selectedApprovalDetail = approvalDetailQuery.data?.data;

  const visibleApprovals = approvals.filter((item) => item.status === activeTab);

  return (
    <div className="space-y-8 duration-500 animate-in fade-in">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div>
          <h1 className="font-title text-2xl font-black uppercase leading-none tracking-tight text-brand-text-dark">Hàng đợi Phê duyệt</h1>
          <p className="mt-1 text-sm font-medium text-slate-500">Phê duyệt lịch trình, kế hoạch và các yêu cầu từ cán bộ chuyên viên.</p>
        </div>
        <div className="flex shrink-0 rounded-xl bg-slate-100 p-1">
          <button onClick={() => setActiveTab("pending")} className={cn("rounded-lg px-5 py-2 text-xs font-bold transition-all", activeTab === "pending" ? "border border-slate-200/50 bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700")}>Đang chờ ({approvalCounts.pending})</button>
          <button onClick={() => setActiveTab("approved")} className={cn("rounded-lg px-5 py-2 text-xs font-bold transition-all", activeTab === "approved" ? "border border-slate-200/50 bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700")}>Đã duyệt ({approvalCounts.approved})</button>
          <button onClick={() => setActiveTab("rejected")} className={cn("rounded-lg px-5 py-2 text-xs font-bold transition-all", activeTab === "rejected" ? "border border-slate-200/50 bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700")}>Từ chối ({approvalCounts.rejected})</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {isLoading && !loadingTimedOut ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <LoadingSpinner label="Đang tải yêu cầu phê duyệt..." />
          </div>
        ) : isLoading && loadingTimedOut ? (
          <div className="col-span-full flex min-h-40 flex-col items-center justify-center gap-4 rounded-xl border border-amber-100 bg-amber-50 p-8 text-center">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">Đã quá thời gian tải danh sách phê duyệt</p>
            <p className="max-w-md text-sm font-medium text-amber-800">Hệ thống chưa phản hồi trong thời gian kỳ vọng. Vui lòng thử tải lại dữ liệu.</p>
            <button
              onClick={() => {
                setLoadingTimedOut(false);
                void approvalsQuery.refetch();
                void approvalsCountQuery.refetch();
              }}
              className="rounded-lg bg-amber-600 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-amber-700"
            >
              Thử lại
            </button>
          </div>
        ) : isError ? (
          <div className="col-span-full rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm font-semibold text-rose-600">Không thể tải danh sách phê duyệt.</div>
        ) : visibleApprovals.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center space-y-3 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/30 p-6 text-center opacity-70">
            <div className="flex size-12 items-center justify-center rounded-lg border border-slate-200/50 bg-slate-100 text-slate-400">
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
                  <h3 className="text-sm font-bold leading-snug text-brand-text-dark transition-colors group-hover:text-primary">{item.title}</h3>
                </div>
              </div>
              <button type="button" aria-label={`Xem chi tiết yêu cầu ${item.title}`} title={`Xem chi tiết yêu cầu ${item.title}`} onClick={() => handleRowOptions(item.id)} className="p-1.5 text-slate-300 transition-all hover:text-slate-600">
                <MoreVertical size={16} />
              </button>
            </div>

            <div className="mb-5 grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-[9px] font-black uppercase tracking-wider text-slate-500">Người yêu cầu</p>
                <div className="flex items-center gap-2">
                  <div className="size-5 rounded-full border border-white bg-slate-200 shadow-sm" />
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
                    <button onClick={() => handleReject(item.id)} className="rounded-lg border border-transparent p-2 text-slate-400 transition-all hover:border-rose-100 hover:bg-rose-50 hover:text-rose-500">
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
              <div className="absolute right-10 top-3 flex items-center gap-1 rounded-full bg-rose-500 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-white shadow-sm">
                <AlertCircle size={8} /> KHẨN
              </div>
            )}
          </div>
        ))}
      </div>

      <Dialog
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) {
            setSelectedApprovalId(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-tight text-brand-text-dark">
              {selectedApprovalDetail?.request.title || selectedApproval?.title || "Chi tiết phê duyệt"}
            </DialogTitle>
            <DialogDescription className="text-xs font-semibold text-slate-500">
              Mở toàn bộ thông tin yêu cầu để manager quyết định nhanh hơn.
            </DialogDescription>
          </DialogHeader>

          {approvalDetailQuery.isError ? (
            <div className="rounded-xl border border-rose-100 bg-rose-50 p-4 text-sm font-medium text-rose-700">
              Không tải được chi tiết yêu cầu. Vui lòng thử lại.
            </div>
          ) : approvalDetailQuery.isLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner label="Đang tải chi tiết..." />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Người yêu cầu</p>
                  <p className="mt-1 text-sm font-bold text-brand-text-dark">{selectedApprovalDetail?.request.requesterId || selectedApproval?.requester || "N/A"}</p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Trạng thái</p>
                  <p className="mt-1 text-sm font-bold text-brand-text-dark">{selectedApprovalDetail?.request.status || selectedApproval?.status || "pending"}</p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Hạn xử lý</p>
                  <p className="mt-1 text-sm font-bold text-brand-text-dark">{selectedApproval?.deadline || "Trong ngày"}</p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loại yêu cầu</p>
                  <p className="mt-1 text-sm font-bold text-brand-text-dark">{selectedApproval?.type || selectedApprovalDetail?.request.type || "APPROVAL"}</p>
                </div>
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                <div className="space-y-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black uppercase tracking-tight text-brand-text-dark">Các bước xử lý</h3>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{selectedApprovalDetail?.steps.length ?? 0} bước</span>
                  </div>
                  {selectedApprovalDetail?.steps?.length ? (
                    <div className="space-y-3">
                      {selectedApprovalDetail.steps.map((step, index) => (
                        <div key={step.id || index} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-xs font-bold text-brand-text-dark">Bước {step.stepOrder ?? index + 1}</p>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{step.status || "pending"}</span>
                          </div>
                          <p className="mt-1 text-[11px] font-medium text-slate-500">Người duyệt: {step.approverId || "Chưa gán"}</p>
                          <p className="mt-1 text-[11px] font-medium text-slate-500">Ghi chú: {step.decisionNote || "Không có"}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm font-medium text-slate-500">Chưa có dữ liệu bước xử lý.</p>
                  )}
                </div>

                <div className="space-y-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black uppercase tracking-tight text-brand-text-dark">Lịch sử quyết định</h3>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{selectedApprovalDetail?.history.length ?? 0} mục</span>
                  </div>
                  {selectedApprovalDetail?.history?.length ? (
                    <div className="space-y-3">
                      {selectedApprovalDetail.history.map((record, index) => (
                        <div key={`${record.decidedAt || index}-${index}`} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-xs font-bold text-brand-text-dark">{record.decision || "decision"}</p>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{record.decidedAt ? new Date(record.decidedAt).toLocaleString("vi-VN") : "Chưa có thời gian"}</span>
                          </div>
                          <p className="mt-1 text-[11px] font-medium text-slate-500">Trạng thái: {record.oldStatus || "?"} → {record.newStatus || "?"}</p>
                          <p className="mt-1 text-[11px] font-medium text-slate-500">Ghi chú: {record.decisionNote || "Không có"}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm font-medium text-slate-500">Chưa có lịch sử quyết định.</p>
                  )}
                </div>
              </div>

              {activeTab === "pending" && (
                <div className="space-y-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black uppercase tracking-tight text-brand-text-dark">Xử lý ngay</h3>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Hành động nhanh</span>
                  </div>
                  <textarea
                    value={selectedApprovalId ? rejectNotes[selectedApprovalId] ?? "" : ""}
                    onChange={(event) => {
                      if (!selectedApprovalId) {
                        return;
                      }
                      setRejectNotes((current) => ({ ...current, [selectedApprovalId]: event.target.value }));
                    }}
                    rows={3}
                    placeholder="Nhập lý do nếu cần từ chối"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium outline-none transition-all focus:border-primary/30 focus:ring-4 focus:ring-primary/5"
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => selectedApprovalId && handleReject(selectedApprovalId)}
                      disabled={!selectedApprovalId || decisionMutation.isPending}
                    >
                      Từ chối
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => selectedApprovalId && handleApprove(selectedApprovalId)}
                      disabled={!selectedApprovalId || decisionMutation.isPending}
                    >
                      Phê duyệt
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
