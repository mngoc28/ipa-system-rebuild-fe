import { useMemo } from "react";
import { UiEvent } from "./ScheduleHub";
import { AdminUser } from "@/api/adminUsersApi";
import { MapPin, Users, Clock, Calendar, Info, CheckCircle2, XCircle, Trash2, Edit3, ArrowLeftRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ScheduleDetailViewProps {
  event: UiEvent;
  members: AdminUser[];
  onJoin: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onReschedule: () => void;
  isJoining?: boolean;
  isManagement?: boolean;
}

const getInitials = (name?: string) => {
  if (!name) return "?";
  const sanitized = name.replace(/[^a-zA-Z0-9\sàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/gi, " ");
  const parts = sanitized.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export default function ScheduleDetailView({ 
  event, 
  members, 
  onJoin, 
  onEdit, 
  onDelete, 
  onReschedule,
  isJoining,
  isManagement = false
}: ScheduleDetailViewProps) {
  
  // Resolve participants from event data
  // We need the raw event data or we assume event.participantUserIds exists on the extended UI event
  // Let's assume we pass a slightly richer object or find participants in the members list
  
  const participants = useMemo(() => {
    // This depends on how participants are stored. 
    // Usually we'd need the raw event object. 
    // Let's assume the event object passed here has the necessary IDs.
    // For now, we'll use a placeholder logic or expect the full event.
    return members.filter(m => event.participantUserIds?.includes(m.id));
  }, [event, members]);

  const joinStates = event.joinStates || {};

  return (
    <div className="space-y-8 py-4 duration-300 animate-in fade-in zoom-in-95">
      {/* Header Info */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className={cn(
            "rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest border",
            event.type === "MEETING" ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-primary/5 text-primary border-primary/10"
          )}>
            {event.type}
          </span>
          <span className={cn(
            "flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest",
            event.status === "DONE" ? "text-emerald-500" : "text-blue-500"
          )}>
            <div className={cn("size-1.5 rounded-full", event.status === "DONE" ? "bg-emerald-500" : "bg-blue-500")} />
            {event.status}
          </span>
        </div>
        <h2 className="font-title text-2xl font-black uppercase leading-tight tracking-tight text-slate-900">
          {event.title}
        </h2>
      </div>

      {/* Quick Details Grid */}
      <div className="grid grid-cols-1 gap-6 rounded-2xl border border-slate-100 bg-slate-50/30 p-6 md:grid-cols-2">
        <div className="space-y-1">
          <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <Calendar size={14} /> Thời gian
          </p>
          <p className="text-sm font-bold text-slate-800">
            {new Date(event.startAt).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
          </p>
          <p className="flex items-center gap-1 text-xs font-semibold text-slate-500">
            <Clock size={12} /> {event.time}
          </p>
        </div>

        <div className="space-y-1">
          <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <MapPin size={14} /> Địa điểm
          </p>
          <p className="text-sm font-bold text-slate-800">{event.location}</p>
        </div>

        <div className="space-y-1">
          <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <Users size={14} /> Người chủ trì
          </p>
          <p className="text-sm font-bold text-slate-800">{event.organizerName}</p>
        </div>

        <div className="space-y-1">
          <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <Info size={14} /> Ghi chú
          </p>
          <p className="text-xs font-medium italic text-slate-600">
            {event.description || "Không có ghi chú thêm."}
          </p>
        </div>
      </div>

      {/* Participants List */}
      <div className="space-y-4">
        <h3 className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-slate-900">
          Danh sách tham dự
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] text-slate-500">{participants.length} người</span>
        </h3>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {participants.map((p) => {
            const status = joinStates[p.id] || "PENDING";
            return (
              <div key={p.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-3 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-[10px] font-bold text-slate-500">
                    {p.avatar ? (
                      <img src={p.avatar} alt="" className="size-full object-cover" />
                    ) : (
                      getInitials(p.fullName)
                    )}
                  </div>
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-tight text-slate-800">{p.fullName}</p>
                    <p className="max-w-[150px] truncate text-[9px] font-medium text-slate-400">{p.email}</p>
                  </div>
                </div>
                
                <div title={status}>
                  {status === "JOINED" ? (
                    <CheckCircle2 className="text-emerald-500" size={16} />
                  ) : status === "DECLINED" ? (
                    <XCircle className="text-rose-500" size={16} />
                  ) : (
                    <Clock className="text-amber-500" size={16} />
                  )}
                </div>
              </div>
            );
          })}
          {participants.length === 0 && (
            <p className="col-span-full py-4 text-center text-[10px] font-black uppercase italic text-slate-400">
              Chưa có thành phần tham dự được phân công.
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-8">
        <div className="flex gap-2">
          {isManagement && (
            <Button variant="outline" size="sm" onClick={onDelete} className="h-10 gap-2 border-rose-100 text-rose-600 hover:bg-rose-50 hover:text-rose-700">
              <Trash2 size={14} /> XÓA LỊCH
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={onReschedule} className="h-10 gap-2">
            <ArrowLeftRight size={14} /> ĐỔI LỊCH
          </Button>
        </div>

        <div className="flex gap-2">
          {isManagement && (
            <Button variant="outline" size="sm" onClick={onEdit} className="h-10 gap-2 px-6">
              <Edit3 size={14} /> CHỈNH SỬA
            </Button>
          )}
          <Button 
            onClick={onJoin} 
            disabled={isJoining}
            className={cn(
              "h-10 px-8 text-[10px] font-black uppercase tracking-widest",
              event.participantStatus === "JOINED" 
                ? "bg-emerald-600 hover:bg-emerald-700" 
                : event.participantStatus === "DECLINED"
                ? "bg-rose-600 hover:bg-rose-700"
                : "bg-primary hover:bg-primary/90"
            )}
          >
            {isJoining ? "ĐANG XỬ LÝ..." : (
              event.participantStatus === "JOINED" 
                ? "ĐÃ XÁC NHẬN" 
                : event.participantStatus === "DECLINED" 
                ? "ĐÃ TỪ CHỐI" 
                : "XÁC NHẬN THAM GIA"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
