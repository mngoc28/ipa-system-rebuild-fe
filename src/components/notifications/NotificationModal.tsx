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
import { NotificationItem } from "@/api/notificationsApi";
import { useNotificationStore } from "@/store/useNotificationStore";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Link, useNavigate } from "react-router-dom";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { 
  useNotificationsQuery, 
  useMarkNotificationReadMutation, 
  useMarkAllNotificationsReadMutation, 
  useDeleteReadNotificationsMutation 
} from "@/hooks/useNotificationsQuery";

export default function NotificationModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { unreadCount } = useNotificationStore();
  const navigate = useNavigate();

  // Queries and Mutations
  const { data, isLoading, isFetching } = useNotificationsQuery({ pageSize: 15 });
  const readMutation = useMarkNotificationReadMutation();
  const readAllMutation = useMarkAllNotificationsReadMutation();
  const deleteReadMutation = useDeleteReadNotificationsMutation();

  const notifications = data?.items || [];

  const handleRead = async (notification: NotificationItem) => {
    if (!notification.readAt) {
      readMutation.mutate(notification.id);
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
    <Popover open={isOpen} onOpenChange={setIsOpen}>
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
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-black uppercase tracking-widest text-brand-text-dark">Thông báo</h3>
            {isFetching && <LoadingSpinner size={12} />}
          </div>
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="size-8 rounded-lg text-slate-400 hover:bg-primary/5 hover:text-primary" 
              title="Đọc tất cả"
              onClick={() => readAllMutation.mutate()}
              disabled={readAllMutation.isPending}
            >
              <CheckCheck size={16} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="size-8 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600" 
              title="Xóa đã đọc"
              onClick={() => deleteReadMutation.mutate()}
              disabled={deleteReadMutation.isPending}
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
