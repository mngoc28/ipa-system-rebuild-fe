import * as React from "react";
import { Bell, CheckCircle2, MessageSquare, Calendar, Trash2, MoreVertical, ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationsApi, type NotificationItem } from "@/api/notificationsApi";
import { useSearchParams } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface DisplayNotification {
  id: string;
  type: "assignment" | "approval" | "meeting" | "system";
  title: string;
  description: string;
  time: string;
  read: boolean;
  refTable?: string;
  refId?: string | number;
  severity?: number;
}

const notificationTypeLabels: Record<DisplayNotification["type"], string> = {
  assignment: "Nhiệm vụ",
  approval: "Phê duyệt",
  meeting: "Lịch họp",
  system: "Hệ thống",
};

import { useNavigate } from "react-router-dom";

export default function NotificationsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab");
  const [activeTab, setActiveTab] = React.useState<"all" | "unread" | "assignment" | "system">(
    initialTab === "unread" || initialTab === "assignment" || initialTab === "system" ? initialTab : "all",
  );
  const [visibleCount, setVisibleCount] = React.useState(4);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [selectedNotification, setSelectedNotification] = React.useState<DisplayNotification | null>(null);

  const notificationsQuery = useQuery({
    queryKey: ["notifications", activeTab],
    queryFn: () =>
      notificationsApi.list({
        ...(activeTab === "unread" ? { unreadOnly: true } : {}),
        page: 1,
        pageSize: 100,
      }),
  });

  const syncNotificationCache = React.useCallback(
    (updater: (item: DisplayNotification) => DisplayNotification | null) => {
      queryClient.setQueriesData({ queryKey: ["notifications"] }, (oldData: { items: NotificationItem[]; unreadCount: number } | undefined) => {
        if (!oldData || !Array.isArray(oldData.items)) {
          return oldData;
        }

        const items = oldData.items;

        const nextItems = items.flatMap((item: NotificationItem) => {
          const type = item.type === "assignment" || item.type === "approval" || item.type === "meeting" ? item.type : "system";
          const rawTime = item.createdAt || item.readAt || "";
          const baseNotification: DisplayNotification = {
            id: item.id,
            type,
            title: item.title || "Thông báo hệ thống",
            description: item.description || item.message || "Không có nội dung chi tiết.",
            time: rawTime ? new Date(rawTime).toLocaleString("vi-VN") : "Vừa xong",
            read: !!item.readAt,
          };

          const nextNotification = updater(baseNotification);
          if (!nextNotification) {
            return [];
          }

          return [
            {
              ...item,
              title: nextNotification.title,
              description: nextNotification.description,
              readAt: nextNotification.read ? item.readAt || new Date().toISOString() : null,
            },
          ];
        });

        const nextUnreadCount = nextItems.reduce((count: number, item: NotificationItem) => count + (item.readAt ? 0 : 1), 0);

        return {
          ...oldData,
          items: nextItems,
          unreadCount: nextUnreadCount,
        };
      });
    },
    [queryClient],
  );

  const markReadMutation = useMutation({
    mutationFn: notificationsApi.read,
    onSuccess: (response, id) => {
      syncNotificationCache((item) =>
        item.id === id
          ? {
              ...item,
              read: true,
            }
          : item,
      );

      const readAt = response.readAt;
      if (readAt) {
        queryClient.setQueriesData({ queryKey: ["notifications"] }, (oldData: { items: NotificationItem[]; unreadCount: number } | undefined) => {
          if (!oldData || !Array.isArray(oldData.items)) {
            return oldData;
          }

          const items = oldData.items;

          const nextItems = items.map((item: NotificationItem) => (item.id === id ? { ...item, readAt } : item));
          return {
            ...oldData,
            items: nextItems,
            unreadCount: nextItems.reduce((count: number, item: NotificationItem) => count + (item.readAt ? 0 : 1), 0),
          };
        });
      }

      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const readAllMutation = useMutation({
    mutationFn: notificationsApi.readAll,
    onSuccess: () => {
      queryClient.setQueriesData({ queryKey: ["notifications"] }, (oldData: { items: NotificationItem[]; unreadCount: number } | undefined) => {
        if (!oldData || !Array.isArray(oldData.items)) {
          return oldData;
        }

        const items = oldData.items;

        const readAt = new Date().toISOString();
        return {
          ...oldData,
          items: items.map((item: NotificationItem) => ({ ...item, readAt })),
          unreadCount: 0,
        };
      });

      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const deleteReadMutation = useMutation({
    mutationFn: notificationsApi.deleteRead,
    onSuccess: () => {
      queryClient.setQueriesData({ queryKey: ["notifications"] }, (oldData: { items: NotificationItem[]; unreadCount: number } | undefined) => {
        if (!oldData || !Array.isArray(oldData.items)) {
          return oldData;
        }

        const items = oldData.items;

        const nextItems = items.filter((item: NotificationItem) => !item.readAt);
        return {
          ...oldData,
          items: nextItems,
          unreadCount: nextItems.length,
        };
      });

      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const isInitialLoading = notificationsQuery.isLoading;
  const isError = notificationsQuery.isError;
  const isFetching = notificationsQuery.isFetching;

  const notifications: DisplayNotification[] = React.useMemo(() => {
    const items = notificationsQuery.data?.items || [];
    return items.map((item: NotificationItem) => {
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
        refTable: item.refTable,
        refId: item.refId,
        severity: item.severity,
      };
    });
  }, [notificationsQuery.data]);

  const unreadCount = notificationsQuery.data?.unreadCount ?? 0;

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
      setSelectedNotification((current) => (current?.id === id ? { ...current, read: true } : current));
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

  const handleOpenDetail = (notification: DisplayNotification) => {
    setSelectedNotification(notification);
    
    if (!notification.read) {
      void handleMarkRead(notification.id);
    }

    if (notification.refTable === 'ipa_delegation' && notification.refId) {
      navigate(`/delegations/${notification.refId}`);
    } else if (notification.refTable === 'ipa_task' && notification.refId) {
      navigate(`/tasks?taskId=${notification.refId}`);
    } else {
      setDetailOpen(true);
    }
  };

  const tabs = [
    { key: "all", label: "Tất cả" },
    { key: "unread", label: "Chưa đọc" },
    { key: "assignment", label: "Nhiệm vụ" },
    { key: "system", label: "Hệ thống" },
  ] as const;

  React.useEffect(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("tab", activeTab);
      return next;
    });
  }, [activeTab, setSearchParams]);

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-20 duration-500 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div>
          <h1 className="font-title text-2xl font-black uppercase tracking-tight text-brand-text-dark">Trung tâm Thông báo</h1>
          <p className="mt-1 text-sm font-semibold text-brand-text-dark/60">Cập nhật những thay đổi mới nhất về nhiệm vụ, lịch trình và hệ thống.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReadAll}
            disabled={readAllMutation.isPending || unreadCount === 0}
            className="flex items-center gap-2 rounded border border-brand-dark/10 bg-white px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-brand-text-dark/70 shadow-sm transition-all hover:bg-brand-dark/[0.03] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {readAllMutation.isPending ? <div className="size-3 animate-spin rounded-full border-2 border-brand-dark/10 border-t-brand-dark/60" /> : <Check size={14} />}
            Đánh dấu đọc tất cả
          </button>
          <button 
            onClick={handleDeleteRead} 
            disabled={deleteReadMutation.isPending}
            title="Xóa toàn bộ mục đã đọc"
            aria-label="Xóa toàn bộ mục đã đọc"
            className="rounded border border-brand-dark/10 bg-white p-2.5 text-brand-text-dark/40 transition-all hover:border-brand-dark-900 hover:bg-brand-dark-900 hover:text-white disabled:opacity-50"
          >
            {deleteReadMutation.isPending ? <div className="size-4 animate-spin rounded-full border-2 border-brand-dark/10 border-t-brand-dark/60" /> : <Trash2 size={16} />}
          </button>
        </div>
      </div>

      <div className="flex gap-4 border-b border-brand-dark/10">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              setVisibleCount(4);
            }}
            className={cn(
              "relative px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-all",
              activeTab === tab.key ? "border-b-2 border-brand-dark-900 text-brand-text-dark" : "text-brand-text-dark/40 hover:text-brand-text-dark/80",
            )}
          >
            {tab.label}
            {tab.key === "unread" && unreadCount > 0 && <span className="ml-2 inline-flex size-4 items-center justify-center rounded bg-destructive px-1 text-[8px] font-black text-white">{unreadCount}</span>}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {isInitialLoading ? (
          <div className="flex h-64 items-center justify-center">
            <LoadingSpinner label="Đang tải thông báo..." />
          </div>
        ) : isError ? (
          <div className="space-y-4 rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <p className="text-xs font-semibold text-destructive">Đã có lỗi xảy ra khi tải thông báo.</p>
            <button 
              onClick={() => notificationsQuery.refetch()}
              className="rounded bg-rose-600 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white transition-colors hover:bg-rose-700"
            >
              Thử lại
            </button>
          </div>
        ) : visibleNotifications.length === 0 ? (
          <div className="space-y-3 rounded-xl border border-dashed border-brand-dark/10 bg-brand-dark/[0.02] p-12 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-brand-dark/5 text-brand-text-dark/40">
              <Bell size={20} />
            </div>
            <p className="text-xs font-semibold text-brand-text-dark/60">Chưa có thông báo phù hợp với bộ lọc hiện tại.</p>
          </div>
        ) : (
          visibleNotifications.map((notification) => (
            <div
              key={notification.id}
              className={cn(
                "group relative flex items-start gap-5 overflow-hidden rounded-xl border p-5 transition-all",
                notification.read
              ? "border-brand-dark/5 bg-brand-dark/[0.01] opacity-70 hover:bg-white hover:border-brand-dark/10"
              : "border-primary/20 bg-white shadow-md shadow-brand-dark/5 hover:border-primary/40",
              )}
            >
              {!notification.read && <div className="absolute left-0 top-0 h-full w-1 bg-primary" />}

              <div
                 className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded border transition-all",
                  notification.severity === 1
              ? "bg-emerald-50 text-emerald-500 border-emerald-100"
              : notification.type === "assignment"
                ? "bg-blue-50 text-blue-500 border-blue-100"
                : notification.type === "approval"
                  ? "bg-emerald-50 text-emerald-500 border-emerald-100"
                  : notification.type === "meeting"
                    ? "bg-amber-50 text-amber-500 border-amber-100"
                    : "bg-slate-50 text-slate-400 border-slate-100",
                )}
              >
                {notification.severity === 1 ? (
                  <CheckCircle2 size={18} />
                ) : notification.type === "assignment" ? (
                  <MessageSquare size={18} />
                ) : notification.type === "approval" ? (
                  <CheckCircle2 size={18} /> // Keeping CheckCircle2 here too, but severity 2 would be AlertCircle if we wanted
                ) : notification.type === "meeting" ? (
                  <Calendar size={18} />
                ) : (
                  <Bell size={18} />
                )}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className={cn("truncate text-[13px] font-black uppercase tracking-tight", notification.read ? "text-brand-text-dark/70" : "text-brand-text-dark")}>{notification.title}</h4>
                  <span className="text-[9px] font-black uppercase tracking-widest text-brand-text-dark/40">{notification.time}</span>
                </div>
                <p className="max-w-xl text-xs font-semibold leading-relaxed text-brand-text-dark/60">{notification.description}</p>

                <div className="flex items-center gap-4 pt-3">
                  <button onClick={() => handleOpenDetail(notification)} className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-primary transition-colors hover:text-primary/80">
                    Xem chi tiết
                    <ChevronRight size={10} />
                  </button>
                  {!notification.read && (
                    <button 
                      onClick={() => handleMarkRead(notification.id)} 
                      disabled={markReadMutation.isPending}
                      className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-text-dark/40 transition-colors hover:text-brand-text-dark/80 disabled:opacity-50"
                    >
                      {markReadMutation.isPending && markReadMutation.variables === notification.id ? <LoadingSpinner size={10} /> : "Đánh dấu đã đọc"}
                    </button>
                  )}
                </div>
              </div>

              <button type="button" aria-label={`Xem thêm tuỳ chọn cho ${notification.title}`} title={`Xem thêm tuỳ chọn cho ${notification.title}`} className="p-1 text-brand-text-dark/20 opacity-0 transition-all hover:text-brand-text-dark/80 group-hover:opacity-100">
                <MoreVertical size={16} />
              </button>
            </div>
          ))
        )}
      </div>

      <Dialog open={detailOpen} onOpenChange={(open) => {
        setDetailOpen(open);
        if (!open) {
          setSelectedNotification(null);
        }
      }}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-title text-xl font-black uppercase tracking-tight text-brand-text-dark">
              {selectedNotification?.title ?? "Chi tiết thông báo"}
            </DialogTitle>
            <DialogDescription className="text-xs font-semibold text-brand-text-dark/60">
              Xem toàn bộ nội dung thông báo và trạng thái xử lý hiện tại.
            </DialogDescription>
          </DialogHeader>

          {selectedNotification ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-text-dark/40">
                <span className="rounded-full bg-brand-dark/5 px-2.5 py-1 text-brand-text-dark/70">{notificationTypeLabels[selectedNotification.type]}</span>
                <span className={cn("rounded-full px-2.5 py-1", selectedNotification.read ? "bg-emerald-50 text-emerald-600" : "bg-destructive/5 text-destructive")}>
                  {selectedNotification.read ? "Đã đọc" : "Chưa đọc"}
                </span>
                <span className="rounded-full bg-brand-dark/[0.02] px-2.5 py-1 text-brand-text-dark/60">{selectedNotification.time}</span>
              </div>

              <div className="rounded-xl border border-brand-dark/5 bg-brand-dark/[0.02] p-4">
                <p className="whitespace-pre-line text-xs font-semibold leading-relaxed text-brand-text-dark/80">
                  {selectedNotification.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {!selectedNotification.read && (
                  <button
                    type="button"
                    onClick={() => handleMarkRead(selectedNotification.id)}
                    disabled={markReadMutation.isPending && markReadMutation.variables === selectedNotification.id}
                    className="rounded border border-brand-dark/10 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-brand-text-dark/70 transition-colors hover:bg-brand-dark/[0.03] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {markReadMutation.isPending && markReadMutation.variables === selectedNotification.id ? <LoadingSpinner size={12} /> : "Đánh dấu đã đọc"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setDetailOpen(false)}
                  className="rounded bg-brand-dark-900 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white transition-colors hover:bg-slate-700"
                >
                  Đóng
                </button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {notifications.length > visibleCount && !isInitialLoading && (
        <div className="py-8 text-center">
          <button 
            onClick={() => setVisibleCount((prev) => prev + 4)} 
            disabled={isFetching}
            className="rounded border border-brand-dark/10 bg-white px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-brand-text-dark/40 transition-all hover:border-brand-dark hover:bg-brand-dark hover:text-white"
          >
            {isFetching ? <LoadingSpinner size={12} label="Đang tải thêm..." /> : "Xem các thông báo cũ hơn"}
          </button>
        </div>
      )}
    </div>
  );
}
