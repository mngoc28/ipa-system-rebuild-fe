import { Calendar as CalendarIcon, MapPin, Users, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { UiEvent } from "./ScheduleHub";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { eventsApi } from "@/api/eventsApi";

interface ScheduleWeekViewProps {
  events: UiEvent[];
  isLoading: boolean;
  isError: boolean;
  errorMessage: string;
  onRefetch: () => void;
}

export default function ScheduleWeekView({
  events,
  isLoading,
  isError,
  errorMessage,
  onRefetch,
}: ScheduleWeekViewProps) {
  const queryClient = useQueryClient();

  const joinMutation = useMutation({
    mutationFn: ({ id, joined }: { id: string; joined: boolean }) => eventsApi.join(id, joined),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["events"] }),
  });

  const rescheduleMutation = useMutation({
    mutationFn: ({ id, startAt, endAt }: { id: string; startAt: string; endAt: string }) =>
      eventsApi.requestReschedule(id, {
        proposedStartAt: startAt,
        proposedEndAt: endAt,
        reason: "Điều phối lại lịch tác nghiệp",
      }),
  });

  const handleEventAction = async (action: "detail" | "copy" | "reschedule", event: UiEvent) => {
    if (action === "detail") {
      toast.info(`Chi tiết: ${event.title} | ${event.time} | ${event.location}`);
      return;
    }

    if (action === "copy") {
      const content = `${event.title} - ${event.time} - ${event.location}`;
      try {
        await navigator.clipboard.writeText(content);
        toast.success("Đã sao chép thông tin sự kiện.");
      } catch {
        toast.info(content);
      }
      return;
    }

    rescheduleMutation.mutate(
      {
        id: event.id,
        startAt: new Date(new Date(event.startAt).getTime() + 30 * 60 * 1000).toISOString(),
        endAt: new Date(new Date(event.endAt || event.startAt).getTime() + 30 * 60 * 1000).toISOString(),
      },
      {
        onSuccess: () => toast.success(`Đã gửi đề xuất đổi lịch cho: ${event.title}`),
        onError: () => toast.error("Không thể gửi đề xuất đổi lịch."),
      },
    );
  };

  const toggleJoinEvent = (event: UiEvent) => {
    const nextJoined = !event.isJoined;
    joinMutation.mutate(
      { id: event.id, joined: nextJoined },
      {
        onSuccess: () => {
          toast[nextJoined ? "success" : "info"](`${nextJoined ? "Đã tham gia" : "Đã hủy tham gia"}: ${event.title}`);
        },
        onError: () => toast.error("Không thể cập nhật trạng thái tham gia."),
      },
    );
  };

  return (
    <div className="space-y-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm duration-300 animate-in slide-in-from-bottom-2">
      <div className="flex items-center justify-between border-b border-slate-50 pb-6">
        <h2 className="flex items-center gap-3 font-title text-lg font-black uppercase tracking-tight text-slate-900">
          <CalendarIcon size={20} className="text-primary" />
          Lịch trình sắp diễn ra
        </h2>
      </div>

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

        {!isLoading && !isError && events.map((event) => (
          <div key={event.id} className="group flex gap-8">
            <div className="w-20 space-y-1 pt-2 text-right">
              <p className="text-xs font-black text-slate-900">{event.time.split(" - ")[0]}</p>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{event.time.split(" - ")[1]}</p>
            </div>

            <div className="relative flex-1">
              <div className={cn("absolute left-[-11px] top-[18px] z-10 h-2.5 w-2.5 rounded-sm ring-4 ring-white transition-all shadow-sm", event.type === "MEETING" ? "bg-blue-500" : "bg-primary")} />

              <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/40 p-5 transition-all group-hover:border-primary/20 group-hover:bg-white group-hover:shadow-xl group-hover:shadow-slate-200/40">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className={cn("rounded px-2 py-0.5 text-[8.5px] font-black uppercase tracking-widest border", event.type === "MEETING" ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-primary/5 text-primary border-primary/10")}>
                      {event.type}
                    </span>
                  </div>
                  <h4 className="text-base font-black uppercase tracking-tight text-slate-900">{event.title}</h4>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-tight text-slate-500">
                        <MapPin size={14} className="text-slate-300" />
                        {event.location}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-tight text-slate-500">
                        <Users size={14} className="text-slate-300" />
                        Người chủ trì: <span className="text-slate-900">{event.organizerName}</span>
                      </div>
                    </div>
                  </div>

                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="rounded-lg border border-slate-200 bg-white p-2.5 text-slate-400 shadow-sm transition-all hover:bg-slate-50 hover:text-primary active:scale-95" title="Mở thêm tuỳ chọn" aria-label="Mở thêm tuỳ chọn">
                        <MoreHorizontal size={18} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEventAction("detail", event)}>Xem chi tiết</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEventAction("copy", event)}>Sao chép thông tin</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleEventAction("reschedule", event)}>Đề xuất đổi lịch</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <button
                    onClick={() => toggleJoinEvent(event)}
                    className={cn(
                      "rounded-lg px-5 py-2.5 text-[10px] font-black uppercase tracking-widest shadow-md transition-all active:scale-95",
                      event.isJoined ? "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "bg-slate-900 text-white hover:bg-slate-800",
                    )}
                  >
                    {event.isJoined ? "ĐÃ THAM GIA" : "THAM GIA"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {!isLoading && !isError && events.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-5 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">
            Không có lịch phù hợp bộ lọc hiện tại.
          </div>
        )}
      </div>
    </div>
  );
}
