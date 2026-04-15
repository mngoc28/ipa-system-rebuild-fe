import * as React from "react";
import { Bell, CheckCircle2, Clock, AlertCircle, MessageSquare, User, Calendar, Trash2, MoreVertical, ChevronRight, Filter, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
const mockNotifications = [
  { id: 1, type: "assignment", title: "Nhiệm vụ mới được giao", description: "Trưởng phòng đã giao cho bạn chuẩn bị tài liệu cho đoàn Samsung.", time: "10 phút trước", read: false },
  { id: 2, type: "approval", title: "Lịch trình đã được duyệt", description: "Đề xuất khảo sát KCN cao đã được Lãnh đạo IPA phê duyệt.", time: "2 giờ trước", read: true },
  { id: 3, type: "meeting", title: "Nhắc nhở cuộc họp", description: "Cuộc họp trù bị đoàn Nhật Bản sẽ diễn ra trong 30 phút tới.", time: "30 phút trước", read: false },
  { id: 4, type: "system", title: "Bảo trì hệ thống", description: "Hệ thống sẽ tạm ngưng hoạt động từ 23:00 tối nay để nâng cấp.", time: "5 giờ trước", read: true },
];
export default function NotificationsPage() {
  const [notifications, setNotifications] = React.useState(mockNotifications);
  const [activeTab, setActiveTab] = React.useState<"all" | "unread" | "assignment" | "system">("all");
  const [visibleCount, setVisibleCount] = React.useState(4);

  const unreadCount = notifications.filter((item) => !item.read).length;

  const visibleNotifications = notifications
    .filter((item) => {
      if (activeTab === "all") return true;
      if (activeTab === "unread") return !item.read;
      return item.type === activeTab;
    })
    .slice(0, visibleCount);

  const handleReadAll = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
    toast.success("Đã đánh dấu đọc tất cả thông báo!");
  };

  const handleMarkRead = (id: number) => {
    setNotifications((prev) => prev.map((item) => (item.id === id ? { ...item, read: true } : item)));
    toast.success("Đã đánh dấu đã đọc.");
  };

  const handleDeleteRead = () => {
    setNotifications((prev) => prev.filter((item) => !item.read));
    toast.success("Đã xóa thông báo đã đọc.");
  };

  const handleOpenDetail = (title: string) => {
    toast.info(`Chi tiết thông báo: ${title}`);
  };

  const tabs = [
    { key: "all", label: "Tất cả" },
    { key: "unread", label: "Chưa đọc" },
    { key: "assignment", label: "Nhiệm vụ" },
    { key: "system", label: "Hệ thống" },
  ] as const;

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-20 duration-500 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div>
          <h1 className="font-title text-2xl font-black tracking-tight text-slate-900 uppercase">Trung tâm Thông báo</h1>
          <p className="mt-1 text-sm font-semibold text-slate-500">Cập nhật những thay đổi mới nhất về nhiệm vụ, lịch trình và hệ thống.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReadAll}
            className="flex items-center gap-2 rounded border border-slate-200 bg-white px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-600 shadow-sm transition-all hover:bg-slate-50"
          >
            <Check size={14} />
            Đánh dấu đọc tất cả
          </button>
          <button onClick={handleDeleteRead} className="rounded border border-slate-200 bg-white p-2.5 text-slate-400 transition-all hover:bg-slate-900 hover:text-white hover:border-slate-900">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Tabs / Filter */}
      <div className="flex gap-4 border-b border-slate-200">
        {tabs.map((tab) => (
          <button 
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "relative px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-all", 
              activeTab === tab.key ? "border-b-2 border-slate-900 text-slate-900" : "text-slate-400 hover:text-slate-600"
            )}
          >
            {tab.label}
            {tab.key === "unread" && unreadCount > 0 && <span className="ml-2 inline-flex h-4 w-4 items-center justify-center rounded bg-rose-600 px-1 text-[8px] font-black text-white">{unreadCount}</span>}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div className="space-y-3">
        {visibleNotifications.map((notification) => (
          <div
            key={notification.id}
            className={cn(
              "group relative flex items-start gap-5 overflow-hidden rounded-xl border p-5 transition-all",
              notification.read 
                ? "border-slate-100 bg-slate-50/30 opacity-80 hover:bg-white hover:border-slate-200" 
                : "border-primary/20 bg-white shadow-md shadow-slate-200/20 hover:border-primary/40",
            )}
          >
            {!notification.read && <div className="absolute left-0 top-0 h-full w-1 bg-primary" />}
            
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded border transition-all",
                notification.type === "assignment"
                  ? "bg-blue-50 text-blue-500 border-blue-100"
                  : notification.type === "approval"
                    ? "bg-emerald-50 text-emerald-500 border-emerald-100"
                    : notification.type === "meeting"
                      ? "bg-amber-50 text-amber-500 border-amber-100"
                      : "bg-slate-50 text-slate-400 border-slate-100",
              )}
            >
              {notification.type === "assignment" ? (
                <MessageSquare size={18} />
              ) : notification.type === "approval" ? (
                <CheckCircle2 size={18} />
              ) : notification.type === "meeting" ? (
                <Calendar size={18} />
              ) : (
                <Bell size={18} />
              )}
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <h4 className={cn("truncate text-[13px] font-black uppercase tracking-tight", notification.read ? "text-slate-600" : "text-slate-900")}>
                  {notification.title}
                </h4>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  {notification.time}
                </span>
              </div>
              <p className="max-w-xl text-xs font-semibold leading-relaxed text-slate-500">
                {notification.description}
              </p>
              
              <div className="flex items-center gap-4 pt-3">
                <button onClick={() => handleOpenDetail(notification.title)} className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-primary hover:text-primary/80 transition-colors">
                  Xem chi tiết
                  <ChevronRight size={10} />
                </button>
                {!notification.read && (
                  <button onClick={() => handleMarkRead(notification.id)} className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-600 transition-colors">
                    Đánh dấu đã đọc
                  </button>
                )}
              </div>
            </div>

            <button className="p-1 text-slate-300 opacity-0 transition-all hover:text-slate-600 group-hover:opacity-100">
              <MoreVertical size={16} />
            </button>
          </div>
        ))}
      </div>

      <div className="py-8 text-center">
        <button onClick={() => setVisibleCount((prev) => prev + 4)} className="rounded border border-slate-200 bg-white px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 transition-all hover:bg-slate-950 hover:text-white hover:border-slate-950">
          Xem các thông báo cũ hơn
        </button>
      </div>
    </div>
  );
}
