import { useMemo } from "react";
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
  setSelectedDay: (day: number) => void;
}

export default function ScheduleMonthView({ events, currentMonth, selectedDay, setSelectedDay }: ScheduleMonthViewProps) {
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
                    className={cn(
                        "group relative truncate rounded border px-2 py-1 text-[9px] font-bold uppercase transition-all hover:scale-[1.02] active:scale-95 animate-in fade-in zoom-in-95 duration-300",
                        event.type === "MEETING" 
                            ? "bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100" 
                            : event.type === "GALA" || event.type === "CEREMONY"
                            ? "bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100"
                            : "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100"
                    )}
                    title={`${event.title} (${event.time})`}
                  >
                    <div className="flex items-center gap-1">
                       <span className="text-[7.5px] font-black tracking-tighter opacity-60">{event.time.split(" - ")[0]}</span>
                       <span className="truncate">{event.title}</span>
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
