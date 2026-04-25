import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, Download, Printer, Share2, Edit3, CheckCircle2, MessageSquare, History, Paperclip, Plus, ArrowRight, MoreVertical, Maximize2, FileText, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { mapMinutesStatus, minutesApi, type MinutesVersion, type MinutesComment, type MinutesApproval } from "@/api/minutesApi";
import { minutesAttachments, minutesTasks } from "@/dataHelper/minutesDetail.dataHelper";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useDraftUnsavedGuard } from "@/hooks/useDraftUnsavedGuard";
import { Input } from "@/components/ui/input";

const COMMENT_DRAFT_KEY = "ipa_minutes_comment_draft";

export default function MinutesDetailPage() {
  const queryClient = useQueryClient();
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeRightTab, setActiveRightTab] = useState<"tasks" | "comments" | "history">("tasks");
  const [comment, setComment] = useState("");
  const [formErrors, setFormErrors] = useState<Set<string>>(new Set());
  const [isEditing, setIsEditing] = useState(false);
  const [tasks, setTasks] = useState(minutesTasks);
  const [attachments, setAttachments] = useState(minutesAttachments);

  const { clearDraft } = useDraftUnsavedGuard({
    enabled: true,
    storageKey: `${COMMENT_DRAFT_KEY}_${id}`,
    value: { comment },
    initialValue: { comment: "" },
    onRestore: (data) => setComment(data.comment),
  });

  const detailQuery = useQuery({
    queryKey: ["minutes", "detail", id],
    queryFn: () => minutesApi.getById(String(id)),
    enabled: Boolean(id),
  });

  const detailData = detailQuery.data;
  const minutesItem = detailData?.minutes;
  const versions = detailData?.versions ?? [];
  const comments = detailData?.comments ?? [];
  const currentVersion = versions[versions.length - 1];
  const approvals = detailData?.approvals ?? [];
  const versionHistory = [...versions].sort((left, right) => right.versionNo - left.versionNo);

  const addCommentMutation = useMutation({
    mutationFn: (commentText: string) => minutesApi.createComment(String(id), { commentText }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["minutes", "detail", id] });
      toast.success("Đã gửi phản hồi.");
      setComment("");
    },
    onError: () => {
      toast.error("Không thể gửi phản hồi.");
    },
  });

  const createVersionMutation = useMutation({
    mutationFn: () =>
      minutesApi.createVersion(String(id), {
        contentText: `Version generated at ${new Date().toISOString()}`,
        changeSummary: "Duplicate from current version",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["minutes", "detail", id] });
      toast.success("Đã tạo phiên bản mới từ tài liệu hiện tại.");
    },
    onError: () => {
      toast.error("Không thể tạo phiên bản mới.");
    },
  });

  const approveMutation = useMutation({
    mutationFn: () => minutesApi.approve(String(id), { decision: "APPROVE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["minutes", "detail", id] });
      toast.success("Đã cập nhật trạng thái phê duyệt biên bản.");
    },
    onError: () => {
      toast.error("Không thể cập nhật trạng thái phê duyệt.");
    },
  });

  if (detailQuery.isLoading) {
    return (
      <div className="rounded-3xl border border-brand-dark/10 bg-white p-12 text-sm font-semibold text-brand-text-dark/40">
        <LoadingSpinner label="Đang tải chi tiết biên bản..." />
      </div>
    );
  }

  if (detailQuery.isError || !detailData) {
    return <div className="rounded-3xl border border-destructive/20 bg-destructive/5 p-6 text-sm font-semibold text-destructive">Không thể tải chi tiết biên bản.</div>;
  }

  const doc = {
    title: minutesItem?.title || "Biên bản chưa có dữ liệu",
    delegation: minutesItem?.delegationId || "N/A",
    version: currentVersion?.versionNo ?? minutesItem?.currentVersionNo ?? 1,
    updatedAt: currentVersion?.editedAt ? new Date(currentVersion.editedAt).toLocaleString("vi-VN") : "--",
    status: mapMinutesStatus(minutesItem?.status),
  };


  const handlePrint = () => {
    toast.info(`Đang mở chế độ in: ${doc.title}`);
  };

  const handleDownload = () => {
    toast.success(`Đang tải biên bản: ${doc.title}`);
  };

  const handleShare = () => {
    toast.success(`Đã chia sẻ biên bản: ${doc.title}`);
  };

  const handleEdit = () => {
    setIsEditing((prev) => !prev);
    toast.info(!isEditing ? "Đã bật chế độ chỉnh sửa biên bản." : "Đã tắt chế độ chỉnh sửa biên bản.");
  };

  const handleDuplicateVersion = () => {
    createVersionMutation.mutate();
  };

  const handleToggleApproval = () => {
    if (doc.status === "Signed") {
      toast.info("Biên bản đã finalized.");
      return;
    }
    approveMutation.mutate();
  };

  const handleFullscreen = () => {
    toast.info("Đã chuyển sang chế độ xem toàn màn hình.");
  };

  const handleAddTask = () => {
    setTasks([{ title: `Đầu việc mới #${tasks.length + 1}`, status: "pending" }, ...tasks]);
    toast.success("Đã thêm đầu việc mới.");
  };

  const handleSendComment = () => {
    if (!comment.trim()) {
      setFormErrors(new Set(["comment"]));
      toast.error("Vui lòng nhập nội dung phản hồi.");
      return;
    }
    setFormErrors(new Set());
    addCommentMutation.mutate(comment.trim(), {
      onSuccess: () => clearDraft(),
    });
  };

  const handleAttachmentUpload = () => {
    const fileName = `Tai_lieu_bo_sung_${attachments.length + 1}.pdf`;
    setAttachments([fileName, ...attachments]);
    toast.success("Đã thêm tệp đính kèm.");
  };

  const handleAttachmentDownload = (name: string) => {
    toast.success(`Đang tải tệp: ${name}`);
  };

  const isCreatingVersion = createVersionMutation.isPending;
  const isApproving = approveMutation.isPending;
  const isFinalized = doc.status === "Signed";

  return (
    <div className="flex h-[calc(100vh-140px)] flex-col gap-6 duration-500 animate-in fade-in">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 rounded-3xl border border-brand-dark/5 bg-white p-4 shadow-sm md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} title="Quay lại" aria-label="Quay lại" className="rounded-xl p-2 text-brand-text-dark/40 transition-all hover:bg-brand-dark/[0.02]">
            <ChevronLeft size={20} />
          </button>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-black uppercase", doc.status === "Signed" ? "border border-emerald-100 bg-emerald-50 text-emerald-600" : "border border-amber-100 bg-amber-50 text-amber-600")}>{doc.status === "Signed" ? "Bản chính thức" : "Bản nháp"}</span>
              <span className="text-[10px] font-bold text-brand-text-dark/40">
                Phiên bản {doc.version} • Cập nhật {doc.updatedAt}
              </span>
            </div>
            <h1 className="max-w-[400px] truncate font-title text-lg font-black text-brand-text-dark">{doc.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center rounded-xl border border-brand-dark/5 bg-brand-dark/[0.02] p-1 lg:flex">
            <button onClick={handlePrint} title="In biên bản" aria-label="In biên bản" className="p-2 text-brand-text-dark/40 transition-all hover:text-primary">
              <Printer size={18} />
            </button>
            <button onClick={handleDownload} title="Tải biên bản" aria-label="Tải biên bản" className="p-2 text-brand-text-dark/40 transition-all hover:text-primary">
              <Download size={18} />
            </button>
          </div>
          <button
            onClick={handleDuplicateVersion}
            disabled={isCreatingVersion || isFinalized}
            className="flex items-center gap-2 rounded-xl border border-brand-dark/10 px-4 py-2 text-xs font-bold text-brand-text-dark/80 transition-all hover:bg-brand-dark/[0.02] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isCreatingVersion ? <Loader2 size={16} className="animate-spin" /> : <History size={16} />}
            Tạo phiên bản
          </button>
          <button
            onClick={handleToggleApproval}
            disabled={isApproving || isFinalized}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isApproving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
            {isFinalized ? "Đã phê duyệt" : "Phê duyệt"}
          </button>
          <button onClick={handleShare} className="flex items-center gap-2 rounded-xl border border-brand-dark/10 px-4 py-2 text-xs font-bold text-brand-text-dark/80 transition-all hover:bg-brand-dark/[0.02]">
            <Share2 size={16} />
            Chia sẻ
          </button>
          <button onClick={handleEdit} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90">
            <Edit3 size={16} />
            {isEditing ? "Đang chỉnh sửa" : "Chỉnh sửa"}
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded-xl p-2 text-brand-text-dark/40 hover:bg-brand-dark/[0.02]" title="Mở thêm tuỳ chọn" aria-label="Mở thêm tuỳ chọn">
                <MoreVertical size={20} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDuplicateVersion}>Nhân bản phiên bản</DropdownMenuItem>
              <DropdownMenuItem onClick={handleToggleApproval}>Đổi trạng thái phê duyệt</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleShare}>Chia sẻ nhanh</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Content (Split Screen) */}
      <div className="flex min-h-0 flex-1 flex-col gap-6 lg:flex-row">
        {/* Left: Document View */}
        <div className={cn("flex min-h-0 flex-1 flex-col overflow-hidden rounded-[40px] border border-brand-dark/5 bg-white shadow-xl shadow-brand-dark/[0.03]", isEditing && "ring-2 ring-primary/20") }>
          <div className="flex shrink-0 items-center justify-between border-b border-brand-dark/5 p-6">
            <div className="flex items-center gap-3">
              <FileText size={20} className="text-primary" />
              <h2 className="text-sm font-bold tracking-tight text-brand-text-dark">Nội dung biên bản</h2>
            </div>
            <button onClick={handleFullscreen} title="Mở toàn màn hình" aria-label="Mở toàn màn hình" className="p-2 text-brand-text-dark/20 transition-colors hover:text-primary">
              <Maximize2 size={16} />
            </button>
          </div>

          <div className="scrollbar-hide flex-1 space-y-8 overflow-y-auto p-12">
            <div className="mx-auto max-w-[800px] space-y-8 font-medium leading-relaxed text-brand-text-dark/80">
              {/* Mock Content Structure */}
              <div className="space-y-4">
                <h2 className="text-center text-xl font-black uppercase text-brand-text-dark">Biên bản cuộc họp</h2>
                <p className="border-b pb-2 text-sm font-bold italic">Dự án: {doc.delegation}</p>
              </div>

              <section className="space-y-3">
                <h3 className="text-sm font-black uppercase tracking-wider text-brand-text-dark">I. Thành phần tham dự</h3>
                <ul className="list-disc space-y-1 pl-5 text-xs">
                  <li>Ông Nguyễn Minh Châu - Trưởng phòng Xúc tiến (Chủ trì)</li>
                  <li>Bà Trần Thu Hà - Chuyên viên</li>
                  <li>Đại diện Đoàn Hàn Quốc (KOTRA)</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-black uppercase tracking-wider text-brand-text-dark">II. Nội dung làm việc</h3>
                <p className="text-sm">Tại buổi họp khởi động, hai bên đã thảo luận và thống nhất các nội dung sau:</p>
                <ol className="list-decimal space-y-3 pl-5 text-sm">
                  <li>Thống nhất lịch trình làm việc 5 ngày tại Đà Nẵng, bao gồm 2 phiên site-visit tại KCN Hòa Cầm và Khu công nghệ cao.</li>
                  <li>IPA Đà Nẵng cam kết cung cấp các thông tin chi tiết về chính sách ưu đãi thuế và hỗ trợ nhân lực cho đối tác Hàn Quốc.</li>
                  <li>Đối tác KOTRA sẽ cung cấp danh sách chi tiết các doanh nghiệp đăng ký tham gia buổi Matchmaking chéo vào thứ 6 tuần tới.</li>
                </ol>
                <p className="rounded-2xl border-l-4 border-primary bg-brand-dark/[0.02] p-4 text-sm italic">
                  "Biên bản này có giá trị làm cơ sở để triển khai các bước hậu cần tiếp theo. Dự kiến phiên họp tiếp theo sẽ diễn ra vào ngày 15/04."
                </p>
              </section>

              <div className="flex justify-between pt-12">
                <div className="space-y-1 text-center">
                  <p className="text-[10px] font-black uppercase text-brand-text-dark/40">Đại diện IPA</p>
                  <div className="h-20" />
                  <p className="text-xs font-bold text-brand-text-dark">Nguyễn Minh Châu</p>
                </div>
                <div className="space-y-1 text-center">
                  <p className="text-[10px] font-black uppercase text-brand-text-dark/40">Thư ký biên bản</p>
                  <div className="h-20" />
                  <p className="text-xs font-bold text-brand-text-dark">Trần Thu Hà</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Context Sidebar */}
        <aside className="flex min-h-0 w-full shrink-0 flex-col gap-6 lg:w-[400px]">
          {/* Navigation Tabs */}
          <div className="flex gap-1 rounded-[24px] bg-brand-dark-900 p-1.5 shadow-lg">
            {[
              { id: "tasks", icon: CheckCircle2, label: "Đầu việc" },
              { id: "comments", icon: MessageSquare, label: "Thảo luận" },
              { id: "history", icon: History, label: "Lịch sử" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveRightTab(tab.id as "tasks" | "comments" | "history")}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-2xl py-2.5 text-[10px] font-black uppercase tracking-wider transition-all",
                  activeRightTab === tab.id ? "bg-primary text-white" : "text-brand-text-dark/40 hover:bg-white/5 hover:text-white",
                )}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tabbed Content Area */}
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[40px] border border-brand-dark/5 bg-white shadow-xl shadow-brand-dark/[0.03]">
            <div className="flex shrink-0 items-center justify-between border-b border-brand-dark/5 p-6">
              <h3 className="text-sm font-black text-brand-text-dark">{activeRightTab === "tasks" ? "Đầu việc phát sinh" : activeRightTab === "comments" ? "Phản hồi & Thảo luận" : "Phiên bản tài liệu"}</h3>
              {activeRightTab === "tasks" && (
                <button onClick={handleAddTask} title="Thêm đầu việc" aria-label="Thêm đầu việc" className="rounded-lg bg-primary p-1.5 text-white">
                  <Plus size={16} />
                </button>
              )}
            </div>

            <div className="scrollbar-hide flex-1 space-y-4 overflow-y-auto p-6">
              {activeRightTab === "tasks" && (
                <div className="space-y-3">
                  {tasks.map((task, i) => (
                    <div key={i} className="group flex items-start gap-4 rounded-2xl border border-brand-dark/5 bg-brand-dark/[0.02] p-4 transition-all hover:border-primary/20 hover:bg-white">
                      <div
                        className={cn("mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all", task.status === "done" ? "border-emerald-500 bg-emerald-500 text-white" : "border-brand-dark/20")}
                      >
                        {task.status === "done" && <CheckCircle2 size={10} />}
                      </div>
                      <div className="flex-1">
                        <p className={cn("text-xs font-bold leading-snug", task.status === "done" ? "text-brand-text-dark/40 line-through" : "text-brand-text-dark")}>{task.title}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-[9px] font-black uppercase text-brand-text-dark/40">Hạn: 12/04</span>
                          <ArrowRight size={10} className="text-brand-text-dark/20" />
                          <span className="text-[9px] font-bold text-primary">CHÂU NM</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeRightTab === "comments" && (
                <div className="space-y-6">
                  {comments.length === 0 ? <p className="text-xs font-semibold text-brand-text-dark/40">Chưa có phản hồi nào.</p> : null}
                  {comments.map((item: MinutesComment) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-black text-white">CM</div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-brand-text-dark">Người dùng</span>
                          <span className="text-[9px] font-medium text-brand-text-dark/40">{item.createdAt ? new Date(item.createdAt).toLocaleString("vi-VN") : "Vừa xong"}</span>
                        </div>
                        <div className="rounded-2xl border border-brand-dark/5 bg-brand-dark/[0.02] p-3 text-xs leading-normal text-brand-text-dark/60">{item.commentText}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeRightTab === "history" && (
                <div className="space-y-5">
                  {versionHistory.length === 0 ? <p className="text-xs font-semibold text-brand-text-dark/40">Chưa có phiên bản nào.</p> : null}
                  {versionHistory.map((version: MinutesVersion) => (
                    <div key={version.id} className="rounded-2xl border border-brand-dark/5 bg-brand-dark/[0.02] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-brand-text-dark/40">Phiên bản {version.versionNo}</p>
                          <p className="text-xs font-bold text-brand-text-dark">{version.changeSummary || "Không có mô tả thay đổi."}</p>
                        </div>
                        <span className="text-[9px] font-bold uppercase text-brand-text-dark/40">{version.editedAt ? new Date(version.editedAt).toLocaleString("vi-VN") : "--"}</span>
                      </div>
                      <div className="mt-3 rounded-xl bg-white p-3 text-[11px] leading-normal text-brand-text-dark/60">
                        {version.contentText || "Nội dung phiên bản dưới dạng JSON hoặc trống."}
                      </div>
                    </div>
                  ))}

                  <div className="space-y-3 border-t border-brand-dark/5 pt-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-text-dark/40">Phê duyệt</h4>
                    {approvals.length === 0 ? <p className="text-xs font-semibold text-brand-text-dark/40">Chưa có lần phê duyệt nào.</p> : null}
                    {approvals.map((approval: MinutesApproval) => (
                      <div key={approval.id} className="flex items-start justify-between gap-3 rounded-2xl border border-brand-dark/5 bg-white p-4">
                        <div className="space-y-1">
                          <p className={cn("text-xs font-black uppercase tracking-widest", approval.decision === "APPROVE" ? "text-emerald-600" : "text-destructive")}>{approval.decision === "APPROVE" ? "Phê duyệt" : "Từ chối"}</p>
                          <p className="text-[11px] font-semibold text-brand-text-dark/60">{approval.decisionNote || "Không có ghi chú."}</p>
                        </div>
                        <span className="text-[9px] font-bold uppercase text-brand-text-dark/40">{approval.decidedAt ? new Date(approval.decidedAt).toLocaleString("vi-VN") : "--"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Input Footer for Comments */}
            {activeRightTab === "comments" && (
              <div className="border-t border-brand-dark/5 bg-brand-dark/[0.02] p-4">
                <div className="group relative">
                  <Input 
                    value={comment} 
                    onChange={(e) => {
                      setComment(e.target.value);
                      if (e.target.value.trim()) {
                        setFormErrors(prev => {
                          const next = new Set(prev);
                          next.delete("comment");
                          return next;
                        });
                      }
                    }} 
                    hasError={formErrors.has("comment")}
                    placeholder="Viết phản hồi..." 
                    className="w-full rounded-2xl border-brand-dark/10 bg-white py-3 pl-4 pr-12 text-xs" 
                  />
                  <button 
                    onClick={handleSendComment} 
                    title="Gửi phản hồi" 
                    aria-label="Gửi phản hồi" 
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-primary p-2 text-white shadow-md transition-all hover:scale-105 active:scale-95"
                  >
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Attachments quick view */}
          <div className="space-y-4 rounded-[32px] border border-brand-dark/5 bg-white p-6 shadow-xl shadow-brand-dark/[0.03]">
            <h3 className="flex items-center justify-between text-sm font-black text-brand-text-dark">
              <span>Tệp đính kèm</span>
              <span className="text-[10px] font-bold text-brand-text-dark/40">{attachments.length} files</span>
            </h3>
            <div className="space-y-2">
              {attachments.map((file, index) => (
                <div key={file} className="group flex items-center justify-between rounded-xl p-2 transition-all hover:bg-brand-dark/[0.02]">
                  <div className="flex items-center gap-3">
                    {index % 2 === 0 ? <FileText size={16} className="text-red-500" /> : <History size={16} className="text-blue-500" />}
                    <span className="max-w-[200px] truncate text-[11px] font-bold text-brand-text-dark/80">{file}</span>
                  </div>
                  <button onClick={() => handleAttachmentDownload(file)} title={`Tải xuống ${file}`} aria-label={`Tải xuống ${file}`} className="options-btn p-1 opacity-0 group-hover:opacity-100">
                    <Download size={14} />
                  </button>
                </div>
              ))}
            </div>
            <button onClick={handleAttachmentUpload} className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-brand-dark/10 py-2.5 text-[10px] font-black text-brand-text-dark/40 transition-all hover:border-primary/40 hover:text-primary">
              <Paperclip size={14} /> TẢI LÊN TÀI LIỆU
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
