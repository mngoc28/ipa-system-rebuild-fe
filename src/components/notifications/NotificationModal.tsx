import React, { useState } from "react";
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  Clock, 
  AlertCircle, 
  ClipboardList,
  ChevronRight,
  Info,
  CheckCircle2
} from "lucide-react";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { notificationsApi, NotificationItem } from "@/api/notificationsApi";
import { useNotificationStore } from "@/store/useNotificationStore";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function NotificationModal() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { unreadCount, setUnreadCount } = useNotificationStore();
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await notificationsApi.list({ pageSize: 15 });
      if (response.success && response.data) {
        setNotifications(response.data.items);
        setUnreadCount(response.data.unreadCount);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReadAll = async () => {
    try {
      await notificationsApi.readAll();
      setNotifications(prev => prev.map(n => ({ ...n, readAt: new Date().toISOString() })));
      setUnreadCount(0);
      toast.success("Đã đánh dấu tất cả là đã đọc");
    } catch {
      toast.error("Không thể đánh dấu tất cả đã đọc");
    }
  };

  const handleDeleteRead = async () => {
    try {
      await notificationsApi.deleteRead();
      setNotifications(prev => prev.filter(n => !n.readAt));
      toast.success("Đã xóa các thông báo đã đọc");
    } catch {
      toast.error("Không thể xóa thông báo");
    }
  };

  const handleRead = async (notification: NotificationItem) => {
    if (!notification.readAt) {
      try {
        await notificationsApi.read(notification.id);
        setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, readAt: new Date().toISOString() } : n));
        setUnreadCount(Math.max(0, unreadCount - 1));
      } catch (error) {
        console.error("Failed to mark as read:", error);
      }
    }

    // Close modal
    setIsOpen(false);

    // Redirect logic
    if (notification.refTable === 'ipa_delegation' && notification.refId) {
      const lowerTitle = notification.title?.toLowerCase() || "";
      const lowerMessage = (notification.message || notification.description || "").toLowerCase();
      
      const isComment = lowerTitle.includes("bình luận") || lowerMessage.includes("bình luận");
      const isChecklist = lowerTitle.includes("checklist") || lowerMessage.includes("checklist");
      
      let tab = 'overview';
      if (isComment) tab = 'discussion';
      else if (isChecklist) tab = 'checklist';
      
      navigate(`/delegations/${notification.refId}?tab=${tab}`);
    } else if (notification.refTable === 'ipa_task' && notification.refId) {
      navigate(`/tasks?taskId=${notification.refId}`);
    }
  };

  const getIcon = (notification: NotificationItem) => {
    if (notification.severity === 1) {
      return <CheckCircle2 className="text-emerald-500" size={16} />;
    }
    
    switch (notification.type) {
      case 'assignment': return <ClipboardList className="text-blue-500" size={16} />;
      case 'approval': return <AlertCircle className="text-amber-500" size={16} />;
      case 'meeting': return <Clock className="text-emerald-500" size={16} />;
      default: return <Info className="text-slate-400" size={16} />;
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (open) fetchNotifications();
    }}>
      <PopoverTrigger asChild>
        <button 
          className="group relative rounded-lg border border-transparent p-2.5 text-slate-400 transition-all hover:border-slate-100 hover:bg-slate-50 hover:text-primary"
          aria-label={`${unreadCount} thông báo chưa đọc`}
        >
          <Bell size={18} className="transition-transform group-hover:rotate-12" />
          {unreadCount > 0 && (
            <span className="absolute right-2 top-2 flex size-3.5 items-center justify-center rounded-full border-2 border-white bg-rose-600 text-[8px] font-black text-white">
              {unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[380px] overflow-hidden rounded-xl border-slate-200 p-0 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-4 py-3">
          <h3 className="text-xs font-black uppercase tracking-widest text-brand-text-dark">Thông báo</h3>
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="size-8 rounded-lg text-slate-400 hover:bg-primary/5 hover:text-primary" 
              title="Đọc tất cả"
              onClick={handleReadAll}
            >
              <CheckCheck size={16} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="size-8 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600" 
              title="Xóa đã đọc"
              onClick={handleDeleteRead}
            >
              <Trash2 size={16} />
            </Button>
          </div>
        </div>

        <div className="max-h-[400px] overflow-y-auto py-2">
          {isLoading ? (
            <div className="flex h-32 flex-col items-center justify-center">
              <LoadingSpinner label="Đang tải..." />
            </div>
          ) : notifications.length > 0 ? (
            <div className="divide-y divide-slate-50">
              {notifications.map((notification) => (
                <div 
                  key={notification.id}
                  onClick={() => handleRead(notification)}
                  className={cn(
                    "group relative flex cursor-pointer gap-3 px-4 py-3 transition-colors hover:bg-slate-50",
                    !notification.readAt && "bg-primary/[0.02]"
                  )}
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-100/50 transition-colors group-hover:bg-white">
                    {getIcon(notification)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={cn(
                      "truncate text-xs font-bold text-brand-text-dark",
                      !notification.readAt && "text-primary"
                    )}>
                      {notification.title}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-[10px] leading-relaxed text-slate-500">
                      {notification.message || notification.description}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-[9px] font-medium text-slate-400">
                      <Clock size={10} />
                      {notification.createdAt ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: vi }) : "Vừa xong"}
                    </p>
                  </div>
                  {!notification.readAt && (
                    <div className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-40 flex-col items-center justify-center gap-3 text-slate-400">
              <div className="rounded-full bg-slate-50 p-3">
                <Bell size={24} className="opacity-20" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Không có thông báo mới</p>
            </div>
          )}
        </div>

        <div className="border-t border-slate-100 bg-slate-50/30 p-2">
          <Link 
            to="/notifications" 
            onClick={() => setIsOpen(false)}
            className="flex w-full items-center justify-center gap-2 rounded-lg py-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-600"
          >
            Xem tất cả
            <ChevronRight size={12} />
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
