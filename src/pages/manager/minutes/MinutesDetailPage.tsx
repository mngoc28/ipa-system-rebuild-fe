import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Download, Printer, Share2, Edit3, CheckCircle2, MessageSquare, History, Paperclip, Plus, ArrowRight, MoreVertical, Maximize2, FileText } from "lucide-react";
import { minutesDocs } from "@/dataHelper/ui-system.data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function MinutesDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeRightTab, setActiveRightTab] = useState<"tasks" | "comments" | "history">("tasks");
  const [comment, setComment] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [tasks, setTasks] = useState([
    { title: "Chuẩn bị tài liệu Gift & Welcome", status: "done" },
    { title: "Đặt xe di chuyển ngày 15/04", status: "pending" },
    { title: "Gửi email xác nhận danh mục họp", status: "pending" },
  ] as Array<{ title: string; status: "done" | "pending" }>);
  const [attachments, setAttachments] = useState(["Phieu_Khao_Sat.pdf", "Anh_Khao_Sat_KCNC.zip"]);

  const doc = minutesDocs.find((d) => d.id === Number(id)) || minutesDocs[0];

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
    toast.success("Đã tạo phiên bản mới từ tài liệu hiện tại.");
  };

  const handleToggleApproval = () => {
    toast.success("Đã cập nhật trạng thái phê duyệt biên bản.");
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
      toast.error("Vui lòng nhập nội dung phản hồi.");
      return;
    }
    toast.success("Đã gửi phản hồi.");
    setComment("");
  };

  const handleAttachmentUpload = () => {
    const fileName = `Tai_lieu_bo_sung_${attachments.length + 1}.pdf`;
    setAttachments([fileName, ...attachments]);
    toast.success("Đã thêm tệp đính kèm.");
  };

  const handleAttachmentDownload = (name: string) => {
    toast.success(`Đang tải tệp: ${name}`);
  };

  return (
    <div className="flex h-[calc(100vh-140px)] flex-col gap-6 duration-500 animate-in fade-in">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="rounded-xl p-2 text-slate-400 transition-all hover:bg-slate-50">
            <ChevronLeft size={20} />
          </button>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[10px] font-black uppercase text-emerald-600">Bản chính thức</span>
              <span className="text-[10px] font-bold text-slate-400">
                Phiên bản {doc.version} • Cập nhật {doc.updatedAt}
              </span>
            </div>
            <h1 className="max-w-[400px] truncate font-title text-lg font-black text-slate-900">{doc.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center rounded-xl border border-slate-100 bg-slate-50 p-1 lg:flex">
            <button onClick={handlePrint} className="p-2 text-slate-400 transition-all hover:text-primary">
              <Printer size={18} />
            </button>
            <button onClick={handleDownload} className="p-2 text-slate-400 transition-all hover:text-primary">
              <Download size={18} />
            </button>
          </div>
          <button onClick={handleShare} className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 transition-all hover:bg-slate-50">
            <Share2 size={16} />
            Chia sẻ
          </button>
          <button onClick={handleEdit} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90">
            <Edit3 size={16} />
            {isEditing ? "Đang chỉnh sửa" : "Chỉnh sửa"}
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded-xl p-2 text-slate-400 hover:bg-slate-50">
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
        <div className={cn("flex min-h-0 flex-1 flex-col overflow-hidden rounded-[40px] border border-slate-100 bg-white shadow-xl shadow-slate-200/40", isEditing && "ring-2 ring-primary/20") }>
          <div className="flex shrink-0 items-center justify-between border-b border-slate-50 p-6">
            <div className="flex items-center gap-3">
              <FileText size={20} className="text-primary" />
              <h2 className="text-sm font-bold tracking-tight text-slate-900">Nội dung biên bản</h2>
            </div>
            <button onClick={handleFullscreen} className="p-2 text-slate-300 transition-colors hover:text-primary">
              <Maximize2 size={16} />
            </button>
          </div>

          <div className="scrollbar-hide flex-1 space-y-8 overflow-y-auto p-12">
            <div className="mx-auto max-w-[800px] space-y-8 font-medium leading-relaxed text-slate-700">
              {/* Mock Content Structure */}
              <div className="space-y-4">
                <h2 className="text-center text-xl font-black uppercase text-slate-900">Biên bản cuộc họp</h2>
                <p className="border-b pb-2 text-sm font-bold italic">Dự án: {doc.delegation}</p>
              </div>

              <section className="space-y-3">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">I. Thành phần tham dự</h3>
                <ul className="list-disc space-y-1 pl-5 text-xs">
                  <li>Ông Nguyễn Minh Châu - Trưởng phòng Xúc tiến (Chủ trì)</li>
                  <li>Bà Trần Thu Hà - Chuyên viên</li>
                  <li>Đại diện Đoàn Hàn Quốc (KOTRA)</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">II. Nội dung làm việc</h3>
                <p className="text-sm">Tại buổi họp khởi động, hai bên đã thảo luận và thống nhất các nội dung sau:</p>
                <ol className="list-decimal space-y-3 pl-5 text-sm">
                  <li>Thống nhất lịch trình làm việc 5 ngày tại Đà Nẵng, bao gồm 2 phiên site-visit tại KCN Hòa Cầm và Khu công nghệ cao.</li>
                  <li>IPA Đà Nẵng cam kết cung cấp các thông tin chi tiết về chính sách ưu đãi thuế và hỗ trợ nhân lực cho đối tác Hàn Quốc.</li>
                  <li>Đối tác KOTRA sẽ cung cấp danh sách chi tiết các doanh nghiệp đăng ký tham gia buổi Matchmaking chéo vào thứ 6 tuần tới.</li>
                </ol>
                <p className="rounded-2xl border-l-4 border-primary bg-slate-50 p-4 text-sm italic">
                  "Biên bản này có giá trị làm cơ sở để triển khai các bước hậu cần tiếp theo. Dự kiến phiên họp tiếp theo sẽ diễn ra vào ngày 15/04."
                </p>
              </section>

              <div className="flex justify-between pt-12">
                <div className="space-y-1 text-center">
                  <p className="text-[10px] font-black uppercase text-slate-400">Đại diện IPA</p>
                  <div className="h-20" />
                  <p className="text-xs font-bold text-slate-900">Nguyễn Minh Châu</p>
                </div>
                <div className="space-y-1 text-center">
                  <p className="text-[10px] font-black uppercase text-slate-400">Thư ký biên bản</p>
                  <div className="h-20" />
                  <p className="text-xs font-bold text-slate-900">Trần Thu Hà</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Context Sidebar */}
        <aside className="flex min-h-0 w-full shrink-0 flex-col gap-6 lg:w-[400px]">
          {/* Navigation Tabs */}
          <div className="flex gap-1 rounded-[24px] bg-slate-900 p-1.5 shadow-lg">
            {[
              { id: "tasks", icon: CheckCircle2, label: "Đầu việc" },
              { id: "comments", icon: MessageSquare, label: "Thảo luận" },
              { id: "history", icon: History, label: "Lịch sử" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveRightTab(tab.id as any)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-2xl py-2.5 text-[10px] font-black uppercase tracking-wider transition-all",
                  activeRightTab === tab.id ? "bg-primary text-white" : "text-slate-400 hover:bg-white/5 hover:text-white",
                )}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tabbed Content Area */}
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[40px] border border-slate-100 bg-white shadow-xl shadow-slate-200/40">
            <div className="flex shrink-0 items-center justify-between border-b border-slate-50 p-6">
              <h3 className="text-sm font-black text-slate-900">{activeRightTab === "tasks" ? "Đầu việc phát sinh" : activeRightTab === "comments" ? "Phản hồi & Thảo luận" : "Phiên bản tài liệu"}</h3>
              {activeRightTab === "tasks" && (
                <button onClick={handleAddTask} className="rounded-lg bg-primary p-1.5 text-white">
                  <Plus size={16} />
                </button>
              )}
            </div>

            <div className="scrollbar-hide flex-1 space-y-4 overflow-y-auto p-6">
              {activeRightTab === "tasks" && (
                <div className="space-y-3">
                  {tasks.map((task, i) => (
                    <div key={i} className="group flex items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 transition-all hover:border-primary/20 hover:bg-white">
                      <div
                        className={cn("mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all", task.status === "done" ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300")}
                      >
                        {task.status === "done" && <CheckCircle2 size={10} />}
                      </div>
                      <div className="flex-1">
                        <p className={cn("text-xs font-bold leading-snug", task.status === "done" ? "text-slate-400 line-through" : "text-slate-900")}>{task.title}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-[9px] font-black uppercase text-slate-400">Hạn: 12/04</span>
                          <ArrowRight size={10} className="text-slate-300" />
                          <span className="text-[9px] font-bold text-primary">CHÂU NM</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeRightTab === "comments" && (
                <div className="space-y-6">
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-black text-white">CH</div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">Nguyễn Minh Châu</span>
                        <span className="text-[9px] font-medium text-slate-400">10:15 - Hôm nay</span>
                      </div>
                      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-xs leading-normal text-slate-600">
                        Thư ký kiểm tra lại phần III mục 2, cần làm rõ hơn trách nhiệm của bên KOTRA về việc gửi danh bạ.
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-black text-white">HA</div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">Trần Thu Hà</span>
                        <span className="text-[9px] font-medium text-slate-400">10:45 - Hôm nay</span>
                      </div>
                      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-xs leading-normal text-slate-600">Đã cập nhật và lưu phiên bản v3 ạ. Sếp xem lại nhé!</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Input Footer for Comments */}
            {activeRightTab === "comments" && (
              <div className="border-t border-slate-100 bg-slate-50 p-4">
                <div className="group relative">
                  <input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Viết phản hồi..." className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-4 pr-12 text-xs outline-none transition-all focus:border-primary" />
                  <button onClick={handleSendComment} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-primary p-2 text-white shadow-md">
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Attachments quick view */}
          <div className="space-y-4 rounded-[32px] border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/40">
            <h3 className="flex items-center justify-between text-sm font-black text-slate-900">
              <span>Tệp đính kèm</span>
              <span className="text-[10px] font-bold text-slate-400">{attachments.length} files</span>
            </h3>
            <div className="space-y-2">
              {attachments.map((file, index) => (
                <div key={file} className="group flex items-center justify-between rounded-xl p-2 transition-all hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    {index % 2 === 0 ? <FileText size={16} className="text-red-500" /> : <History size={16} className="text-blue-500" />}
                    <span className="max-w-[200px] truncate text-[11px] font-bold text-slate-700">{file}</span>
                  </div>
                  <button onClick={() => handleAttachmentDownload(file)} className="options-btn p-1 opacity-0 group-hover:opacity-100">
                    <Download size={14} />
                  </button>
                </div>
              ))}
            </div>
            <button onClick={handleAttachmentUpload} className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 py-2.5 text-[10px] font-black text-slate-400 transition-all hover:border-primary/40 hover:text-primary">
              <Paperclip size={14} /> TẢI LÊN TÀI LIỆU
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
