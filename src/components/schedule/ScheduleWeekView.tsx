import { 
  MapPin, 
  MoreHorizontal, 
  Info, 
  Edit2, 
  CalendarPlus, 
  Trash2, 
  Clock, 
  Check 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { UiEvent } from "./ScheduleHub";
import { AdminUser } from "@/api/adminUsersApi";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

const getInitials = (name?: string) => {
  if (!name) return "?";
  // Filter out special characters like hyphens, keep letters, numbers and spaces
  const sanitized = name.replace(/[^a-zA-Z0-9\sàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/gi, " ");
  const parts = sanitized.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  // Return first letter and last letter
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

interface ScheduleWeekViewProps {
  events: UiEvent[];
  isLoading: boolean;
  isError: boolean;
  errorMessage: string;
  onRefetch: () => void;
  onAction: (mode: "detail" | "edit" | "reschedule" | "delete", event: UiEvent) => void;
  onJoin: (event: UiEvent) => void;
  members: AdminUser[];
  isManagement?: boolean;
}

export default function ScheduleWeekView({
  events,
  isLoading,
  isError,
  errorMessage,
  onRefetch,
  onAction,
  onJoin,
  members,
  isManagement = false
}: ScheduleWeekViewProps) {
  const toggleJoinEvent = (event: UiEvent) => {
    onJoin(event);
  };

  const handleEventAction = async (action: "detail" | "edit" | "reschedule" | "delete" | "copy", event: UiEvent) => {
    if (action === "detail") {
      onAction("detail", event);
      return;
    }

    if (action === "reschedule") {
      onAction("reschedule", event);
      return;
    }

    if (action === "edit") {
      onAction("edit", event);
      return;
    }

    if (action === "copy") {
      const content = `${event.title} - ${event.time} - ${event.location}`;
      try {
        await navigator.clipboard.writeText(content);
        toast.success("Đã sao chép liên kết sự kiện!");
      } catch {
        toast.info(content);
      }
      return;
    }
    
    if (action === "delete") {
      onAction("delete", event);
      return;
    }
  };

  return (
    <div className="space-y-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm duration-300 animate-in slide-in-from-bottom-2">
      <div className="relative space-y-8 before:absolute before:inset-y-2 before:left-[105px] before:w-px before:bg-slate-100">
        {isLoading && (
          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-6 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">
            Đang tải lịch công tác...
          </div>
        )}

        {isError && !isLoading && (
          <div className="rounded-xl border border-rose-100 bg-rose-50 p-5 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-rose-600">Không thể tải lịch công tác</p>
            <p className="mt-2 text-sm text-rose-500">{errorMessage}</p>
            <button onClick={onRefetch} className="mt-4 rounded-lg bg-rose-600 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-rose-500">
              Thử lại
            </button>
          </div>
        )}

        {!isLoading && !isError && events.map((event) => {
          const eventDate = new Date(event.startAt);
          const dayName = format(eventDate, "EEEE", { locale: vi });
          const dateStr = format(eventDate, "dd/MM");
          
          return (
            <div key={event.id} className="group flex gap-8">
              <div className="w-24 space-y-1 pt-2 text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary">{dayName}</p>
                <p className="text-sm font-black text-brand-text-dark">{dateStr}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {event.time.split(" - ")[0]}
                </p>
              </div>

            <div className="relative flex-1">
              <div className={cn("absolute left-[-11px] top-[18px] z-10 h-2.5 w-2.5 rounded-sm ring-4 ring-white transition-all shadow-sm", event.type === "MEETING" ? "bg-blue-500" : "bg-primary")} />

              <div className="flex flex-col rounded-xl border border-slate-100 bg-slate-50/40 p-5 transition-all group-hover:border-primary/20 group-hover:bg-white group-hover:shadow-xl group-hover:shadow-slate-200/40">
                <div className="flex items-start justify-between">
                  <span className={cn("rounded px-2 py-0.5 text-[8.5px] font-black uppercase tracking-widest border", event.type === "MEETING" ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-primary/5 text-primary border-primary/10")}>
                    {event.type}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="rounded-lg border border-slate-200 bg-white p-2 text-slate-400 shadow-sm transition-all hover:bg-slate-50 hover:text-primary active:scale-95">
                        <MoreHorizontal size={16} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem onClick={() => handleEventAction("detail", event)} className="h-10 cursor-pointer font-bold text-slate-700">
                        <Info className="mr-2 size-4" /> Xem chi tiết
                      </DropdownMenuItem>
                      {isManagement && (
                        <DropdownMenuItem onClick={() => onAction("edit", event)} className="h-10 cursor-pointer font-bold text-slate-700">
                          <Edit2 className="mr-2 size-4" /> Chỉnh sửa
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => handleEventAction("reschedule", event)} className="h-10 cursor-pointer font-bold text-slate-700">
                        <CalendarPlus className="mr-2 size-4" /> Đề xuất đổi lịch
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {isManagement && (
                        <DropdownMenuItem onClick={() => onAction("delete", event)} className="h-10 cursor-pointer font-bold text-rose-600 focus:text-rose-600">
                          <Trash2 className="mr-2 size-4" /> Xóa lịch
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="mb-4 space-y-1">
                  <h3 className="line-clamp-2 min-h-10 font-title text-base font-black uppercase tracking-tight text-brand-text-dark transition-colors group-hover:text-primary">
                    {event.title}
                  </h3>
                  <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                    <MapPin className="size-3 text-slate-400" /> {event.location}
                  </p>
                </div>

                <div className="mb-6 flex items-center justify-between border-t border-slate-50 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {event.participantUserIds?.slice(0, 4).map((pid, i) => {
                        const userId = String(pid);
                        const userFound = members.find(m => String(m.id) === userId);
                        const initials = getInitials(userFound?.fullName);
                        
                        if (i === 3 && event.participantUserIds!.length > 4) {
                          return (
                            <div key="more" className="flex size-6 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-[8px] font-black">
                              +{event.participantUserIds!.length - 3}
                            </div>
                          );
                        }

                        return (
                          <div key={userId} className="group/avatar relative flex size-6 items-center justify-center rounded-full border-2 border-white bg-slate-50 text-[8px] font-black text-slate-600 transition-colors hover:bg-white hover:text-primary" title={userFound?.fullName || userId}>
                            {userFound?.avatar ? (
                              <img src={userFound.avatar} alt="" className="size-full rounded-full object-cover" />
                            ) : (
                              initials
                            )}
                          </div>
                        );
                      })}
                      {(!event.participantUserIds || event.participantUserIds.length === 0) && (
                        <span className="text-[9px] font-bold italic text-slate-300">Chưa có người tham gia</span>
                      )}
                    </div>
                    
                    {/* Show names if participants count is small (1-2) */}
                    {event.participantUserIds && event.participantUserIds.length > 0 && event.participantUserIds.length <= 2 && (
                      <div className="flex flex-col">
                        {event.participantUserIds.map(pid => {
                          const userFound = members.find(m => String(m.id) === String(pid));
                          return (
                            <span key={String(pid)} className="max-w-[80px] truncate text-[8px] font-bold uppercase leading-tight text-slate-500">
                              {userFound?.fullName || "Thành viên"}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  
                  {event.isJoined && (
                    <div className="flex items-center gap-1 text-[9px] font-black uppercase text-emerald-600">
                      <Check className="size-3" /> Đã tham gia
                    </div>
                  )}
                </div>

                <div className="mt-auto flex items-center justify-between gap-3">
                  <div className="flex flex-col">
                    <p className="flex items-center gap-1.5 text-[10px] font-black uppercase text-brand-text-dark">
                      <Clock className="size-3.5 text-primary" /> {event.time}
                    </p>
                    <p className="pl-5 text-[9px] font-bold text-slate-400">
                       {new Date(event.startAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                    </p>
                  </div>

                  <button
                    onClick={() => toggleJoinEvent(event)}
                    className={cn(
                      "rounded-lg px-5 py-2.5 text-[10px] font-black uppercase tracking-widest shadow-md transition-all active:scale-95",
                      event.participantStatus === "JOINED" 
                        ? "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100" 
                        : event.participantStatus === "DECLINED"
                        ? "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                        : "bg-primary text-white hover:bg-primary/90",
                    )}
                  >
                    {event.participantStatus === "JOINED" 
                      ? "ĐÃ XÁC NHẬN" 
                      : event.participantStatus === "DECLINED" 
                      ? "ĐÃ TỪ CHỐI" 
                      : "XÁC NHẬN THAM GIA"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}

        {!isLoading && !isError && events.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-5 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">
            Không có lịch phù hợp bộ lọc hiện tại.
          </div>
        )}
      </div>
    </div>
  );
}
