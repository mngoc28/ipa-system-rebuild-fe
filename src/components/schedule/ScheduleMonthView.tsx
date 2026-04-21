import { useMemo } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { UiEvent } from "./ScheduleHub";

interface ScheduleMonthViewProps {
  events: UiEvent[];
  currentMonth: {
    month: number;
    year: number;
    label: string;
  };
  selectedDay: number | null;
  setSelectedDay: (day: number | null) => void;
  onEventClick?: (event: UiEvent) => void;
}

export default function ScheduleMonthView({ 
  events, 
  currentMonth, 
  selectedDay, 
  setSelectedDay,
  onEventClick
}: ScheduleMonthViewProps) {
  const daysInMonth = new Date(currentMonth.year, currentMonth.month + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.year, currentMonth.month, 1).getDay();

  const calendarDays = useMemo(() => {
    const days = [];
    // Previous month filler
    for (let i = 0; i < firstDayOfMonth; i++) {
        days.push({ day: null, isCurrentMonth: false });
    }
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
        days.push({ day: i, isCurrentMonth: true });
    }
    // Next month filler
    while (days.length % 7 !== 0) {
        days.push({ day: null, isCurrentMonth: false });
    }
    return days;
  }, [daysInMonth, firstDayOfMonth]);

  const getDayEvents = (day: number | null) => {
    if (!day) return [];
    return events.filter(e => {
        const eventDate = new Date(e.startAt);
        return eventDate.getDate() === day && 
               eventDate.getMonth() === currentMonth.month && 
               eventDate.getFullYear() === currentMonth.year;
    });
  };

  const orderedWeekdays = ["Chủ Nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm duration-300 animate-in zoom-in-95">
      <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
        {orderedWeekdays.map((day, idx) => (
          <div key={day} className={cn("py-3 text-center text-[10px] font-black uppercase tracking-widest", (idx === 0 || idx === 6) ? "text-primary/60" : "text-slate-400")}>
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {calendarDays.map((cell, idx) => {
          const dayEvents = getDayEvents(cell.day);
          const isToday = cell.day === new Date().getDate() && currentMonth.month === new Date().getMonth();
          const isSelected = cell.day === selectedDay;
          const isWeekend = idx % 7 === 0 || idx % 7 === 6;
          
          return (
            <div 
              key={idx} 
              onClick={() => cell.day && setSelectedDay(cell.day)}
              className={cn(
                "min-h-[120px] border-r border-b border-slate-100 p-2 transition-all cursor-pointer relative",
                !cell.isCurrentMonth && "bg-slate-50/30 opacity-40 hover:opacity-100",
                isWeekend && cell.isCurrentMonth && "bg-slate-50/40",
                isSelected && "bg-primary/5",
                idx % 7 === 6 && "border-r-0"
              )}
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                   <span className={cn(
                    "flex h-6 w-6 items-center justify-center text-[11px] font-black transition-all",
                    isSelected ? "rounded-lg bg-primary text-white shadow-md shadow-primary/20 scale-110" : "text-slate-500",
                    isToday && !isSelected && "rounded-lg border-2 border-primary text-primary",
                    !cell.isCurrentMonth && "text-slate-300 shadow-none bg-transparent"
                  )}>
                    {cell.day}
                  </span>
                  {isToday && !isSelected && <span className="text-[8px] font-black uppercase text-primary">Nay</span>}
                </div>
                {dayEvents.length > 0 && (
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-300">
                    {dayEvents.length} SK
                  </span>
                )}
              </div>

              <div className="space-y-1.5">
                {dayEvents.slice(0, 3).map((event) => (
                  <div 
                    key={event.id} 
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick?.(event);
                    }}
                    className={cn(
                      "group/event relative flex cursor-pointer flex-col gap-0.5 rounded-md border border-slate-100 bg-white p-2 transition-all hover:border-primary/30 hover:shadow-lg active:scale-95",
                      event.type === "MEETING" ? "border-l-4 border-l-blue-500" : "border-l-4 border-l-primary"
                    )}
                  >
                    <div className="flex items-center justify-between gap-1 overflow-hidden">
                      <span className="truncate text-[10px] font-black uppercase tracking-tight text-slate-800">
                        {event.title}
                      </span>
                      <div className={cn("size-1.5 shrink-0 rounded-full", event.status === "DONE" ? "bg-emerald-500" : "bg-blue-500")} />
                    </div>
                    <div className="flex items-center gap-1 text-[8px] font-bold uppercase text-slate-400">
                      <Clock size={8} /> {event.time}
                    </div>
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="pl-1 text-[8px] font-black uppercase tracking-tighter text-slate-400">
                    + {dayEvents.length - 3} sự kiện khác
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
