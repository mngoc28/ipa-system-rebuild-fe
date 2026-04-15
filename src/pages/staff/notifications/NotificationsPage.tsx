import * as React from "react";
import { Bell, CheckCircle2, MessageSquare, Calendar, Trash2, MoreVertical, ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "@/api/notificationsApi";

interface DisplayNotification {
  id: string;
  type: "assignment" | "approval" | "meeting" | "system";
  title: string;
  description: string;
  time: string;
  read: boolean;
}

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = React.useState<"all" | "unread" | "assignment" | "system">("all");
  const [visibleCount, setVisibleCount] = React.useState(4);

  const notificationsQuery = useQuery({
    queryKey: ["notifications", activeTab],
    queryFn: () =>
      notificationsApi.list({
        ...(activeTab === "unread" ? { unreadOnly: true } : {}),
        page: 1,
        pageSize: 100,
      }),
  });

  const markReadMutation = useMutation({
    mutationFn: notificationsApi.read,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const readAllMutation = useMutation({
    mutationFn: notificationsApi.readAll,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const deleteReadMutation = useMutation({
    mutationFn: notificationsApi.deleteRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const isInitialLoading = notificationsQuery.isLoading;
  const isError = notificationsQuery.isError;
  const isFetching = notificationsQuery.isFetching;

  const notifications: DisplayNotification[] = React.useMemo(() => {
    const items = notificationsQuery.data?.data?.items || [];
    return items.map((item) => {
      const type = (item.type === "assignment" || item.type === "approval" || item.type === "meeting" ? item.type : "system") as DisplayNotification["type"];
      const rawTime = item.createdAt || item.readAt || "";
      const time = rawTime ? new Date(rawTime).toLocaleString("vi-VN") : "Vừa xong";
      return {
        id: item.id,
        type,
        title: item.title || "Thông báo hệ thống",
        description: item.description || item.message || "Không có nội dung chi tiết.",
        time,
        read: !!item.readAt,
      };
    });
  }, [notificationsQuery.data]);

  const unreadCount = notificationsQuery.data?.data?.unreadCount ?? 0;

  const visibleNotifications = notifications
    .filter((item) => {
      if (activeTab === "all") return true;
      if (activeTab === "unread") return !item.read;
      return item.type === activeTab;
    })
    .slice(0, visibleCount);

  const handleReadAll = async () => {
    try {
      await readAllMutation.mutateAsync();
      toast.success("Đã đánh dấu đọc tất cả thông báo!");
    } catch {
      toast.error("Không thể cập nhật tất cả thông báo.");
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await markReadMutation.mutateAsync(id);
      toast.success("Đã đánh dấu đã đọc.");
    } catch {
      toast.error("Không thể đánh dấu đã đọc.");
    }
  };

  const handleDeleteRead = async () => {
    try {
      await deleteReadMutation.mutateAsync();
      toast.success("Đã xóa thông báo đã đọc.");
    } catch {
      toast.info("Không có thông báo đã đọc để xóa.");
    }
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
            disabled={readAllMutation.isPending || unreadCount === 0}
            className="flex items-center gap-2 rounded border border-slate-200 bg-white px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-600 shadow-sm transition-all hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {readAllMutation.isPending ? <div className="h-3 w-3 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" /> : <Check size={14} />}
            Đánh dấu đọc tất cả
          </button>
          <button 
            onClick={handleDeleteRead} 
            disabled={deleteReadMutation.isPending}
            className="rounded border border-slate-200 bg-white p-2.5 text-slate-400 transition-all hover:bg-slate-900 hover:text-white hover:border-slate-900 disabled:opacity-50"
          >
            {deleteReadMutation.isPending ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" /> : <Trash2 size={16} />}
          </button>
        </div>
      </div>

      <div className="flex gap-4 border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              setVisibleCount(4);
            }}
            className={cn(
              "relative px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-all",
              activeTab === tab.key ? "border-b-2 border-slate-900 text-slate-900" : "text-slate-400 hover:text-slate-600",
            )}
          >
            {tab.label}
            {tab.key === "unread" && unreadCount > 0 && <span className="ml-2 inline-flex h-4 w-4 items-center justify-center rounded bg-rose-600 px-1 text-[8px] font-black text-white">{unreadCount}</span>}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {isInitialLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex animate-pulse gap-5 rounded-xl border border-slate-100 p-5">
                <div className="h-10 w-10 rounded bg-slate-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/4 rounded bg-slate-100" />
                  <div className="h-3 w-3/4 rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-8 text-center space-y-4">
            <p className="text-xs font-semibold text-rose-600">Đã có lỗi xảy ra khi tải thông báo.</p>
            <button 
              onClick={() => notificationsQuery.refetch()}
              className="rounded bg-rose-600 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white hover:bg-rose-700 transition-colors"
            >
              Thử lại
            </button>
          </div>
        ) : visibleNotifications.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-12 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <Bell size={20} />
            </div>
            <p className="text-xs font-semibold text-slate-500">Chưa có thông báo phù hợp với bộ lọc hiện tại.</p>
          </div>
        ) : (
          visibleNotifications.map((notification) => (
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
                  <h4 className={cn("truncate text-[13px] font-black uppercase tracking-tight", notification.read ? "text-slate-600" : "text-slate-900")}>{notification.title}</h4>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{notification.time}</span>
                </div>
                <p className="max-w-xl text-xs font-semibold leading-relaxed text-slate-500">{notification.description}</p>

                <div className="flex items-center gap-4 pt-3">
                  <button onClick={() => handleOpenDetail(notification.title)} className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-primary hover:text-primary/80 transition-colors">
                    Xem chi tiết
                    <ChevronRight size={10} />
                  </button>
                  {!notification.read && (
                    <button 
                      onClick={() => handleMarkRead(notification.id)} 
                      disabled={markReadMutation.isPending}
                      className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
                    >
                      {markReadMutation.isPending && markReadMutation.variables === notification.id ? "Đang cập nhật..." : "Đánh dấu đã đọc"}
                    </button>
                  )}
                </div>
              </div>

              <button className="p-1 text-slate-300 opacity-0 transition-all hover:text-slate-600 group-hover:opacity-100">
                <MoreVertical size={16} />
              </button>
            </div>
          ))
        )}
      </div>

      {notifications.length > visibleCount && !isInitialLoading && (
        <div className="py-8 text-center">
          <button 
            onClick={() => setVisibleCount((prev) => prev + 4)} 
            disabled={isFetching}
            className="rounded border border-slate-200 bg-white px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 transition-all hover:bg-slate-950 hover:text-white hover:border-slate-950"
          >
            {isFetching ? "Đang tải thêm..." : "Xem các thông báo cũ hơn"}
          </button>
        </div>
      )}
    </div>
  );
}
