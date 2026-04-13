import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Edit2, CheckCircle2, Mail, Phone, LayoutDashboard, Calendar, FileText, CheckSquare, FileStack, TrendingUp, History, MoreVertical } from "lucide-react";
import { delegations } from "@/dataHelper/ui-system.data";
import { cn } from "@/lib/utils";
import ItineraryTimeline from "@/components/schedule/ItineraryTimeline";
import { toast } from "sonner";

const statusMap: Record<string, { label: string; color: string }> = {
  draft: { label: "Bản nháp", color: "bg-slate-100 text-slate-600" },
  pendingApproval: { label: "Chờ phê duyệt", color: "bg-amber-100 text-amber-700" },
  needsRevision: { label: "Cần sửa", color: "bg-orange-100 text-orange-700" },
  approved: { label: "Đã duyệt", color: "bg-blue-100 text-blue-700" },
  inProgress: { label: "Đang triển khai", color: "bg-emerald-100 text-emerald-700" },
  completed: { label: "Hoàn thành", color: "bg-teal-100 text-teal-800" },
  cancelled: { label: "Đã hủy", color: "bg-rose-100 text-rose-700" },
};

export default function DelegationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("summary");
  const [isEditing, setIsEditing] = useState(false);
  const [approved, setApproved] = useState(false);
  const [tasks, setTasks] = useState([
    { id: 1, title: "Xác nhận lịch đón đoàn tại sân bay", done: true },
    { id: 2, title: "Chốt lịch họp với Ban quản lý Khu CNC", done: false },
    { id: 3, title: "Hoàn tất bộ tài liệu giới thiệu đối tác", done: false },
  ]);
  const [documents, setDocuments] = useState([
    { id: 1, name: "Ke_hoach_tiep_doan.pdf", size: "1.2MB" },
    { id: 2, name: "Du_thao_bien_ban_hop_tac.docx", size: "540KB" },
  ]);
  const [minutesItems, setMinutesItems] = useState([
    { id: 1, title: "Biên bản họp chuẩn bị", status: "Đã tạo" },
    { id: 2, title: "Biên bản làm việc ngày 15/05", status: "Chờ ký" },
  ]);
  const [reportUpdatedAt, setReportUpdatedAt] = useState<string | null>(null);
  const [showFullTimeline, setShowFullTimeline] = useState(false);

  const delegation = delegations.find((d) => d.id === Number(id)) || delegations[0];

  const TABS = [
    { id: "summary", label: "Thông tin chung", icon: LayoutDashboard },
    { id: "itinerary", label: "Lịch trình", icon: Calendar },
    { id: "minutes", label: "Biên bản", icon: FileText },
    { id: "actions", label: "Đầu việc", icon: CheckSquare },
    { id: "documents", label: "Tài liệu", icon: FileStack },
    { id: "outcome", label: "Kết quả", icon: TrendingUp },
  ];

  const completedTaskCount = tasks.filter((t) => t.done).length;
  const progressPercent = Math.round((completedTaskCount / Math.max(tasks.length, 1)) * 100);

  const handleApprove = () => {
    setApproved(true);
    toast.success("Đã phê duyệt đoàn.");
  };

  const handleToggleTask = (taskId: number) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t)));
  };

  const handleCreateMinutes = () => {
    setMinutesItems((prev) => [{ id: Date.now(), title: `Biên bản mới #${prev.length + 1}`, status: "Bản nháp" }, ...prev]);
  };

  const handleUploadDocument = () => {
    setDocuments((prev) => [{ id: Date.now(), name: `Tai_lieu_bo_sung_${prev.length + 1}.pdf`, size: "900KB" }, ...prev]);
  };

  return (
    <div className="space-y-6 pb-20 duration-500 animate-in fade-in">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 -mx-4 border-b border-slate-200 bg-white/95 px-4 pb-4 pt-4 backdrop-blur-md lg:-mx-8 lg:px-8 shadow-sm">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="rounded-lg border border-slate-200 p-2 text-slate-400 transition-all hover:bg-slate-50 hover:text-primary active:scale-95">
              <ChevronLeft size={18} />
            </button>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-[9px] font-black text-slate-500 uppercase tracking-widest">{delegation.code}</span>
                <span className={cn("rounded px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest border", statusMap[delegation.status]?.color, "border-current/10")}>{statusMap[delegation.status]?.label}</span>
              </div>
              <h1 className="font-title text-xl font-black text-slate-900 uppercase tracking-tight">{delegation.name}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsEditing((prev) => !prev);
                toast.success(!isEditing ? "Đã bật chế độ chỉnh sửa." : "Đã tắt chế độ chỉnh sửa.");
              }}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-4 py-2 text-[10px] font-black uppercase tracking-widest shadow-sm transition-all active:scale-95",
                isEditing ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-950 hover:text-white",
              )}
            >
              <Edit2 size={12} />
              {isEditing ? "ĐANG CHỈNH SỬA" : "SỬA HÀNH CHÍNH"}
            </button>
            <button
              onClick={handleApprove}
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white shadow-lg transition-all active:scale-95",
                approved ? "bg-emerald-600 shadow-emerald-600/20 hover:bg-emerald-500" : "bg-primary shadow-primary/20 hover:bg-primary/95",
              )}
            >
              <CheckCircle2 size={12} />
              {approved ? "ĐÃ PHÊ DUYỆT" : "PHÊ DUYỆT ĐOÀN"}
            </button>
            <button
              onClick={() => {
                setActiveTab("summary");
                toast.info("Đã quay về tab thông tin chung.");
              }}
              className="rounded-lg border border-slate-200 bg-white p-2 text-slate-400 transition-all hover:text-slate-600 active:scale-95"
            >
              <MoreVertical size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Tabs Navigation */}
          <div className="scrollbar-hide flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all outline-none",
                  activeTab === tab.id ? "bg-slate-950 text-white shadow-lg shadow-slate-950/20" : "text-slate-500 hover:bg-slate-50",
                )}
              >
                <tab.icon size={12} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Area Content */}
          <div className="min-h-[400px] rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            {activeTab === "summary" && (
              <div className="space-y-6 duration-300 animate-in fade-in">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-3">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Lĩnh vực đầu tư trọng điểm</label>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded border border-primary/20 bg-primary/5 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-primary">CÔNG NGHỆ CAO</span>
                      <span className="rounded border border-primary/20 bg-primary/5 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-primary">LOGISTICS</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Đối tác chính</label>
                    <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{delegation.partnerOrg}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{delegation.country}</p>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Thời gian thực hiện</label>
                    <p className="text-sm font-black text-slate-900 uppercase tracking-tight">
                      {delegation.startDate} - {delegation.endDate}
                    </p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">TỔNG THỜI LƯỢNG: 05 NGÀY</p>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Đơn vị chủ trì</label>
                    <p className="text-sm font-black text-slate-900 uppercase tracking-tight leading-snug">{delegation.hostUnit}</p>
                  </div>
                </div>

                <div className="space-y-3 border-t border-slate-100 pt-6">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Mục đích chuyến thăm & làm việc</label>
                  <p className="text-xs font-semibold leading-relaxed text-slate-600 uppercase tracking-tight">
                    Khảo sát thực địa các phân khu sản xuất tại Khu công nghệ cao Đà Nẵng, làm việc với Ban quản lý về các chính sách ưu đãi đầu tư và thảo luận ký kết biên bản ghi nhớ hợp tác chiến lược trong lĩnh vực
                    sản xuất chip bán dẫn quốc tế.
                  </p>
                </div>
              </div>
            )}
            {activeTab === "itinerary" && (
              <div className="duration-300 animate-in fade-in">
                <ItineraryTimeline />
              </div>
            )}
            {activeTab === "minutes" && (
              <div className="space-y-4 duration-300 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Danh sách biên bản</h3>
                  <button onClick={handleCreateMinutes} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-700 hover:bg-slate-50">
                    Tạo biên bản
                  </button>
                </div>
                <div className="space-y-2">
                  {minutesItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50/60 p-3">
                      <div>
                        <p className="text-xs font-bold text-slate-900">{item.title}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.status}</p>
                      </div>
                      <button onClick={() => toast.success(`Đã mở ${item.title}`)} className="text-[10px] font-black uppercase tracking-widest text-primary">
                        Mở chi tiết
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "actions" && (
              <div className="space-y-4 duration-300 animate-in fade-in">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Danh sách đầu việc</h3>
                <div className="space-y-2">
                  {tasks.map((task) => (
                    <button key={task.id} onClick={() => handleToggleTask(task.id)} className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white p-3 text-left hover:bg-slate-50">
                      <span className={cn("text-xs font-bold", task.done ? "text-emerald-700 line-through" : "text-slate-900")}>{task.title}</span>
                      <span className={cn("text-[9px] font-black uppercase tracking-widest", task.done ? "text-emerald-600" : "text-amber-600")}>{task.done ? "Hoàn thành" : "Đang xử lý"}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "documents" && (
              <div className="space-y-4 duration-300 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Tài liệu liên quan</h3>
                  <button onClick={handleUploadDocument} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-700 hover:bg-slate-50">
                    Tải lên
                  </button>
                </div>
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50/60 p-3">
                      <div>
                        <p className="text-xs font-bold text-slate-900">{doc.name}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{doc.size}</p>
                      </div>
                      <button onClick={() => toast.success(`Đã tải ${doc.name}`)} className="text-[10px] font-black uppercase tracking-widest text-primary">
                        Tải xuống
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "outcome" && (
              <div className="space-y-4 duration-300 animate-in fade-in">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Kết quả triển khai</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tiến độ đầu việc</p>
                    <p className="mt-1 text-lg font-black text-slate-900">{progressPercent}%</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Số biên bản</p>
                    <p className="mt-1 text-lg font-black text-slate-900">{minutesItems.length}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setReportUpdatedAt(new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }));
                    toast.success("Đã cập nhật báo cáo kết quả.");
                  }}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white"
                >
                  Cập nhật báo cáo
                </button>
                {reportUpdatedAt && <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Lần cập nhật gần nhất: {reportUpdatedAt}</p>}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Sidebar */}
        <div className="space-y-4">
          {/* Activity Timeline */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 p-4">
              <h3 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-900">
                <History size={14} className="text-primary" />
                Dòng thời gian
              </h3>
              <button
                onClick={() => {
                  setShowFullTimeline((prev) => !prev);
                  toast.info(!showFullTimeline ? "Đã mở toàn bộ dòng thời gian." : "Đã thu gọn dòng thời gian.");
                }}
                className="text-[9px] font-black uppercase tracking-widest text-primary hover:underline"
              >
                {showFullTimeline ? "THU GỌN" : "XEM TẤT CẢ"}
              </button>
            </div>
            <div className="p-5">
              <ul className="relative space-y-6 before:absolute before:bottom-2 before:left-[9px] before:top-2 before:w-px before:bg-slate-100">
                <li className="relative pl-6">
                  <div className="absolute left-0 top-1.5 z-10 flex h-4.5 w-4.5 items-center justify-center rounded-sm border-2 border-white bg-emerald-500 shadow-sm" />
                  <div className="space-y-0.5">
                    <p className="text-[11px] font-black uppercase tracking-tight text-slate-900">Manager phê duyệt</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">14:20 - HÔM NAY</p>
                  </div>
                </li>
                <li className="relative pl-6">
                  <div className="absolute left-0 top-1.5 z-10 flex h-4.5 w-4.5 items-center justify-center rounded-sm border-2 border-white bg-primary shadow-sm" />
                  <div className="space-y-0.5">
                    <p className="text-[11px] font-black uppercase tracking-tight text-slate-900">Staff gửi phê duyệt</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">09:15 - HÔM NAY</p>
                  </div>
                </li>
                <li className="relative pl-6">
                  <div className="absolute left-0 top-1.5 z-10 flex h-4.5 w-4.5 items-center justify-center rounded-sm border-2 border-white bg-slate-400 shadow-sm" />
                  <div className="space-y-0.5">
                    <p className="text-[11px] font-black uppercase tracking-tight text-slate-900">Tạo mới bản nháp</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">16:45 - HÔM QUA</p>
                  </div>
                </li>
                {showFullTimeline && (
                  <>
                    <li className="relative pl-6">
                      <div className="absolute left-0 top-1.5 z-10 flex h-4.5 w-4.5 items-center justify-center rounded-sm border-2 border-white bg-amber-500 shadow-sm" />
                      <div className="space-y-0.5">
                        <p className="text-[11px] font-black uppercase tracking-tight text-slate-900">Đính kèm tài liệu hồ sơ</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">15:10 - HÔM QUA</p>
                      </div>
                    </li>
                    <li className="relative pl-6">
                      <div className="absolute left-0 top-1.5 z-10 flex h-4.5 w-4.5 items-center justify-center rounded-sm border-2 border-white bg-blue-500 shadow-sm" />
                      <div className="space-y-0.5">
                        <p className="text-[11px] font-black uppercase tracking-tight text-slate-900">Khởi tạo lịch trình chi tiết</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">14:35 - HÔM QUA</p>
                      </div>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>

          {/* Staff Assigned */}
          <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-900">Nhân sự phụ trách</h3>
            <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/50 p-3">
              <div className="h-10 w-10 overflow-hidden rounded border border-slate-200 shadow-sm">
                <img src={delegation.staff.avatar} alt="Staff" className="h-full w-full object-cover grayscale opacity-80 transition-all hover:grayscale-0 hover:opacity-100" />
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-tight text-slate-900">{delegation.staff.name}</p>
                <p className="mt-0.5 text-[9px] font-black uppercase tracking-widest text-primary">CHUYÊN VIÊN PHỤ TRÁCH</p>
              </div>
            </div>
            <div className="space-y-2 border-t border-slate-100 pt-4">
              <div className="flex items-center gap-3 text-[10px] font-bold text-slate-600 uppercase tracking-tight">
                <Mail size={12} className="text-slate-400" />
                <span>chau.nm@danang.gov.vn</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-bold text-slate-600 uppercase tracking-tight">
                <Phone size={12} className="text-slate-400" />
                <span>0945 xxxx 88</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
