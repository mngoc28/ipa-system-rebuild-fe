import { useState } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Clock, MapPin, Users, Zap, Filter, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function SchedulePage() {
  const monthOptions = ["Tháng 03, 2026", "Tháng 04, 2026", "Tháng 05, 2026"];
  const [monthIndex, setMonthIndex] = useState(1);
  const [viewMode, setViewMode] = useState<"week" | "month">("week");
  const [joinedEventIds, setJoinedEventIds] = useState<number[]>([]);
  const currentMonth = monthOptions[monthIndex];

  const handlePrevMonth = () => {
    setMonthIndex((prev) => (prev - 1 + monthOptions.length) % monthOptions.length);
  };

  const handleNextMonth = () => {
    setMonthIndex((prev) => (prev + 1) % monthOptions.length);
  };

  const upcomingEvents = [
    { id: 1, time: "08:30 - 10:00", title: "Đón đoàn Samsung tại T2", location: "Sân bay Đà Nẵng", type: "Event" },
    { id: 2, time: "14:00 - 16:30", title: "Họp trù bị đoàn Nhật Bản", location: "Phòng họp 1 - IPA", type: "Meeting" },
    { id: 3, time: "19:00 - 21:00", title: "Tiệc tối xã giao đối tác ICT", location: "Sheraton Grand Resort", type: "Gala" },
  ];

  const handleEventAction = async (action: "detail" | "copy" | "reschedule", event: (typeof upcomingEvents)[number]) => {
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

    toast.success(`Đã gửi đề xuất đổi lịch cho: ${event.title}`);
  };

  const toggleJoinEvent = (event: (typeof upcomingEvents)[number]) => {
    const hasJoined = joinedEventIds.includes(event.id);
    if (hasJoined) {
      setJoinedEventIds(joinedEventIds.filter((id) => id !== event.id));
      toast.info(`Đã hủy tham gia: ${event.title}`);
      return;
    }
    setJoinedEventIds([...joinedEventIds, event.id]);
    toast.success(`Đã tham gia: ${event.title}`);
  };

  return (
    <div className="space-y-6 pb-20 duration-500 animate-in fade-in">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div>
          <h1 className="font-title text-2xl font-black tracking-tight text-slate-900 uppercase">Lịch làm việc của tôi</h1>
          <p className="mt-1 text-sm font-semibold text-slate-500">Quản lý các mốc thời gian, sự kiện và cuộc họp cá nhân hằng tuần.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex rounded-lg bg-slate-100 p-1 shadow-sm">
            <button onClick={() => setViewMode("week")} className={cn("rounded-md px-5 py-2 text-[10px] font-black uppercase transition-all", viewMode === "week" ? "border border-slate-200/50 bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700")}>Lịch tuần</button>
            <button onClick={() => setViewMode("month")} className={cn("rounded-md px-5 py-2 text-[10px] font-black uppercase transition-all", viewMode === "month" ? "border border-slate-200/50 bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700")}>Lịch tháng</button>
          </div>
          <button onClick={() => toast.info("Mở form tạo lịch công tác mới")} className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-[10px] font-black uppercase tracking-wider text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/95 active:scale-95">
            <Plus size={14} />
            THÊM LỊCH MỚI
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Calendar Navigation Sidebar */}
        <div className="space-y-6 lg:col-span-1">
          <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">{currentMonth}</h3>
              <div className="flex gap-2">
                <button onClick={handlePrevMonth} className="rounded-lg border border-slate-100 p-1.5 text-slate-400 transition-all hover:bg-slate-50 active:scale-90">
                  <ChevronLeft size={16} />
                </button>
                <button onClick={handleNextMonth} className="rounded-lg border border-slate-100 p-1.5 text-slate-400 transition-all hover:bg-slate-50 active:scale-90">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Simple Calendar Grid mockup */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
                <span key={d} className="py-1 text-[10px] font-black uppercase text-slate-300">
                  {d}
                </span>
              ))}
              {Array.from({ length: 35 }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => toast.info(`Đã chọn ngày ${i + 1 > 30 ? i - 29 : i + 1}`)}
                  className={cn("relative flex h-8 w-8 items-center justify-center rounded-lg text-[10px] font-bold transition-all", i + 1 === 10 ? "bg-primary text-white shadow-md shadow-primary/20" : "text-slate-600 hover:bg-slate-50 active:scale-90")}
                >
                  {i + 1 > 30 ? i - 29 : i + 1}
                  {(i + 1 === 12 || i + 1 === 15) && <div className="absolute bottom-1.5 h-1 w-1 rounded-full bg-amber-400" />}
                </button>
              ))}
            </div>
          </div>

          <div className="group relative space-y-6 overflow-hidden rounded-xl bg-slate-950 p-6 text-white shadow-xl shadow-slate-950/20">
            <Zap size={64} className="absolute -bottom-4 -right-4 text-white opacity-5 transition-all duration-700 group-hover:rotate-12" />
            <div className="space-y-1">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">Tính năng mới</p>
              <h4 className="font-title text-sm font-black text-slate-100 leading-tight tracking-tight uppercase">Đồng bộ lịch Outlook</h4>
            </div>
            <button onClick={() => toast.info("Đang thiết lập tích hợp lịch Outlook")} className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 text-[9px] font-black uppercase tracking-widest text-white transition-all hover:bg-white hover:text-slate-900 active:scale-95">
              KHÁM PHÁ NGAY
            </button>
          </div>
        </div>

        {/* Weekly Schedule View */}
        <div className="space-y-6 lg:col-span-3">
          <div className="space-y-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-50 pb-6">
              <h2 className="flex items-center gap-3 font-title text-lg font-black text-slate-900 uppercase tracking-tight">
                <CalendarIcon size={20} className="text-primary" />
                Lịch trình sắp diễn ra
              </h2>
              <div className="flex gap-2">
                <button onClick={() => toast.info("Bộ lọc lịch sẽ có ở bản tiếp theo")} className="rounded-lg border border-slate-200 bg-white p-2 text-slate-400 transition-all hover:text-primary active:scale-95">
                  <Filter size={16} />
                </button>
              </div>
            </div>

            <div className="relative space-y-8 before:absolute before:bottom-2 before:left-[105px] before:top-2 before:w-px before:bg-slate-100">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="group flex gap-8">
                  <div className="w-20 space-y-1 pt-2 text-right">
                    <p className="text-xs font-black text-slate-900">{event.time.split(" - ")[0]}</p>
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{event.time.split(" - ")[1]}</p>
                  </div>

                  <div className="relative flex-1">
                    <div
                      className={cn(
                        "absolute left-[-45px] top-[18px] z-10 h-2.5 w-2.5 rounded-sm ring-4 ring-white transition-all shadow-sm",
                        event.type === "Meeting" ? "bg-blue-500" : event.type === "Gala" ? "bg-amber-500" : "bg-primary",
                      )}
                    />

                    <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/40 p-5 transition-all group-hover:border-primary/20 group-hover:bg-white group-hover:shadow-xl group-hover:shadow-slate-200/40">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "rounded px-2 py-0.5 text-[8.5px] font-black uppercase tracking-widest border",
                              event.type === "Meeting" ? "bg-blue-50 text-blue-600 border-blue-100" : event.type === "Gala" ? "bg-purple-50 text-purple-600 border-purple-100" : "bg-primary/5 text-primary border-primary/10",
                            )}
                          >
                            {event.type}
                          </span>
                        </div>
                        <h4 className="text-base font-black text-slate-900 uppercase tracking-tight">{event.title}</h4>
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-tight text-slate-500">
                            <MapPin size={14} className="text-slate-300" />
                            {event.location}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-tight text-slate-500">
                            <Users size={14} className="text-slate-300" />
                            04 Thành viên
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="rounded-lg border border-slate-200 bg-white p-2.5 text-slate-400 shadow-sm transition-all hover:bg-slate-50 hover:text-primary active:scale-95">
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
                            joinedEventIds.includes(event.id)
                              ? "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                              : "bg-slate-900 text-white hover:bg-slate-800",
                          )}
                        >
                          {joinedEventIds.includes(event.id) ? "ĐÃ THAM GIA" : "THAM GIA"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Empty slots indicator */}
          <div className="py-10 text-center opacity-30">
            <div className="mb-4 flex items-center justify-center gap-8">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-400" />
              <p className="text-[9px] font-black uppercase tracking-[0.4em]">HẾT LỊCH TRONG NGÀY</p>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}