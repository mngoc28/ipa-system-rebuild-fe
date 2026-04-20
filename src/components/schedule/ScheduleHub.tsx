import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Zap, Filter, Search, ChevronDown, Video, Map, BookOpen, Award, Clock, CheckCircle2, CalendarRange } from "lucide-react";
import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { eventsApi } from "@/api/eventsApi";
import { adminUsersApi } from "@/api/adminUsersApi";
import { useAuthStore } from "@/store/useAuthStore";
import ScheduleWeekView from "./ScheduleWeekView";
import ScheduleMonthView from "./ScheduleMonthView";
import ScheduleForm from "./ScheduleForm";
import type { EventItem } from "@/api/eventsApi";
import type { AdminUser } from "@/api/adminUsersApi";

interface ScheduleHubProps {
  role?: string;
}

type ScheduleEventSource = EventItem;
type ScheduleEventListResponse = {
  data?: { items?: ScheduleEventSource[] };
  items?: ScheduleEventSource[];
  meta?: { total_pages?: number; totalPages?: number; total?: number };
};

export interface UiEvent {
  id: string;
  time: string;
  title: string;
  location: string;
  type: string;
  startAt: string;
  endAt?: string;
  isJoined: boolean;
  status: string;
  organizerUserId: string;
  organizerName?: string;
}

const toTimeRange = (startAt: string, endAt: string) => {
  const start = new Date(startAt);
  const end = new Date(endAt);
  const startLabel = start.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  const endLabel = end.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  return `${startLabel} - ${endLabel}`;
};

export default function ScheduleHub({ role }: ScheduleHubProps) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const monthOptions = [
    { label: "Tháng 03, 2026", month: 2, year: 2026 },
    { label: "Tháng 04, 2026", month: 3, year: 2026 },
    { label: "Tháng 05, 2026", month: 4, year: 2026 },
  ];

  const [monthIndex, setMonthIndex] = useState(1);
  const [viewMode, setViewMode] = useState<"week" | "month">("week");
  const [selectedDay, setSelectedDay] = useState<number | null>(new Date().getDate());
  const [showOnlyJoined, setShowOnlyJoined] = useState(false);
  const [outlookConnected, setOutlookConnected] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  
  // New States: Pagination & Filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [eventTypeFilter, setEventTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Management States
  const isManagement = role?.toLowerCase() === "manager" || role?.toLowerCase() === "director" || role?.toLowerCase() === "admin";
  const [managementView, setManagementView] = useState<"PERSONAL" | "TEAM">(isManagement ? "TEAM" : "PERSONAL");
  const [selectedStaffId, setSelectedStaffId] = useState<string>("ALL");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Filter logic: if staff, show own events. If higher roles, show all or filtered.
  const effectiveOrganizerId = managementView === "PERSONAL" ? user?.id : (selectedStaffId === "ALL" ? undefined : selectedStaffId);
  const effectiveUnitId = (managementView === "TEAM" && selectedStaffId === "ALL") ? user?.unit : undefined;

  const eventsQuery = useQuery({
    queryKey: ["events", effectiveOrganizerId, effectiveUnitId, eventTypeFilter, statusFilter, debouncedSearch, currentPage],
    queryFn: () =>
      eventsApi.list({
        organizerId: effectiveOrganizerId,
        unitId: effectiveUnitId,
        eventType: eventTypeFilter === "ALL" ? undefined : eventTypeFilter,
        status: statusFilter === "ALL" ? undefined : statusFilter,
        search: debouncedSearch || undefined,
        page: currentPage,
        pageSize: itemsPerPage,
      }),
    placeholderData: keepPreviousData,
  });

  // Task: Fetch Unit Members for Filtering
  const membersQuery = useQuery({
    queryKey: ["unit-members", user?.unit],
    queryFn: () => adminUsersApi.list({ unitId: user?.unit, pageSize: 100 }),
    enabled: isManagement,
  });

  const members = useMemo(() => membersQuery.data?.data?.items || [], [membersQuery.data]);

  const createEventMutation = useMutation({
    mutationFn: eventsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Đã tạo lịch công tác mới.");
      setIsCreateOpen(false);
    },
    onError: () => toast.error("Không thể tạo lịch công tác."),
  });

  const currentMonth = monthOptions[monthIndex];

  const pagination = useMemo(() => {
    const meta = (eventsQuery.data as ScheduleEventListResponse | undefined)?.meta;
    if (!meta) return null;
    return {
      ...meta,
      total_pages: meta.total_pages || meta.totalPages || 1,
      total: meta.total || 0
    };
  }, [eventsQuery.data]);

  const filteredEvents = useMemo(() => {
    const queryData = eventsQuery.data as ScheduleEventListResponse | undefined;
    const items = queryData?.data?.items || queryData?.items || [];
    let events = items;

    // Note: Backend now handles eventType, status, and search filters.
    // We keep this memo to transform backend items into UI items if needed,
    // and for any client-side specific filters like 'showOnlyJoined'.
    
    if (showOnlyJoined && user?.id) {
      events = events.filter((e: ScheduleEventSource) => 
        e.organizerUserId === String(user.id) || 
        (e.participantUserIds && e.participantUserIds.includes(String(user.id)))
      );
    }

    return events.map((e: ScheduleEventSource) => ({
      id: e.id,
      time: toTimeRange(e.startAt, e.endAt),
      title: e.title,
      location: e.locationId || "Văn phòng quản lý",
      type: e.eventType,
      startAt: e.startAt,
      endAt: e.endAt,
      isJoined: e.joinStates ? e.joinStates[String(user?.id)] === "JOINED" : false,
      status: e.status,
      organizerUserId: e.organizerUserId,
      organizerName: members.find((m: AdminUser) => m.id === String(e.organizerUserId))?.fullName || "Thành viên IPA"
    }));
  }, [eventsQuery.data, showOnlyJoined, user?.id, members]);

  const handleCreateSchedule = (values: Parameters<typeof eventsApi.create>[0]) => {
    createEventMutation.mutate({
      ...values,
      organizerUserId: String(values.organizerUserId || user?.id || ""), // Fallback to current user if not selected
    });
  };

  return (
    <div className="space-y-6 pb-20 duration-500 animate-in fade-in">
      {/* Header section with Role-based Context */}
      <div className="flex flex-col gap-6 border-b border-slate-100 pb-8 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <h1 className="font-title text-3xl font-black uppercase tracking-tight text-slate-900">
              {managementView === "TEAM" ? (role === "Director" || role === "Admin" ? "Quản trị Lịch IPA" : "Quản trị Lịch Đơn vị") : "Lịch làm việc của tôi"}
            </h1>
            {isManagement && (
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-primary">
                {role}
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-3">
            <p className="text-sm font-semibold text-slate-500">
              {managementView === "TEAM" 
                ? `Đang xem lịch công tác của ${selectedStaffId === "ALL" ? "toàn bộ đơn vị" : "nhân viên cụ thể"}`
                : "Quản lý và theo dõi lộ trình tác nghiệp cá nhân"}
            </p>
            {viewMode === "month" && (
              <div className="ml-4 flex items-center gap-2 rounded-full border border-slate-200/50 bg-slate-100 px-3 py-1 shadow-sm duration-300 animate-in slide-in-from-left-2">
                <button onClick={() => setMonthIndex(p => (p - 1 + 3) % 3)} className="text-slate-500 transition-colors hover:text-primary">
                  <ChevronLeft size={16} />
                </button>
                <span className="min-w-[120px] text-center text-[10px] font-black uppercase tracking-widest text-slate-900">{currentMonth.label}</span>
                <button onClick={() => setMonthIndex(p => (p + 1) % 3)} className="text-slate-500 transition-colors hover:text-primary">
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Role-based Controls */}
          {isManagement && (
            <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1 shadow-sm">
              <button
                onClick={() => {
                  setManagementView("PERSONAL");
                  setSelectedStaffId("ALL");
                  setCurrentPage(1);
                }}
                className={cn(
                  "rounded-lg px-4 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all",
                  managementView === "PERSONAL" ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200" : "text-slate-400 hover:text-slate-600"
                )}
              >
                CÁ NHÂN
              </button>
              <button
                onClick={() => {
                  setManagementView("TEAM");
                  setCurrentPage(1);
                }}
                className={cn(
                  "rounded-lg px-4 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all",
                  managementView === "TEAM" ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200" : "text-slate-400 hover:text-slate-600"
                )}
              >
                ĐỘI NHÓM
              </button>
            </div>
          )}

          {managementView === "TEAM" && (
            <div className="relative">
              <select
                value={selectedStaffId}
                onChange={(e) => {
                  setSelectedStaffId(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-10 w-48 appearance-none rounded-xl border border-slate-200 bg-white pl-4 pr-10 text-[10px] font-black uppercase tracking-widest text-slate-900 shadow-sm outline-none transition-all hover:border-primary/30 focus:border-primary focus:ring-2 focus:ring-primary/10"
              >
                <option value="ALL">TẤT CẢ NHÂN VIÊN</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.fullName.toUpperCase()}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            </div>
          )}
          {/* Unified Filter Bar */}
          <div className="flex w-full flex-col items-stretch gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm transition-all hover:shadow-md md:w-auto md:flex-row md:items-center">
            {/* Search */}
            <div className="group relative flex items-center border-b border-slate-100 pb-2 md:border-b-0 md:border-r md:pb-0 md:pr-2">
              <Search size={16} className="absolute left-3 text-slate-400 transition-colors group-focus-within:text-primary" />
              <input
                type="text"
                placeholder="Tìm sự kiện..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 w-full rounded-xl bg-transparent pl-10 pr-4 text-xs font-bold outline-none placeholder:font-medium placeholder:text-slate-400 md:w-48"
              />
            </div>

            {/* Event Type */}
            <div className="group flex flex-col border-b border-slate-100 px-4 py-2 md:border-b-0 md:border-r md:py-0">
              <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Hình thức</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1.5 text-left text-[10px] font-black text-slate-700 outline-none transition-colors hover:text-primary">
                    {eventTypeFilter === "ALL" && "Tất cả"}
                    {eventTypeFilter === "MEETING" && "Cuộc họp"}
                    {eventTypeFilter === "VISIT" && "Tham quan"}
                    {eventTypeFilter === "WORKSHOP" && "Hội thảo"}
                    {eventTypeFilter === "CEREMONY" && "Lễ nghi"}
                    <ChevronDown size={12} className="text-slate-400 transition-transform group-hover:text-primary group-data-[state=open]:rotate-180" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48 rounded-xl p-1 shadow-2xl">
                  <DropdownMenuItem onClick={() => setEventTypeFilter("ALL")} className="flex items-center gap-2 rounded-lg py-2 text-xs font-bold">
                    <CalendarRange size={14} className="text-slate-400" /> Tất cả loại hình
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-50" />
                  <DropdownMenuItem onClick={() => setEventTypeFilter("MEETING")} className="flex items-center gap-2 rounded-lg py-2 text-xs font-bold">
                    <Video size={14} className="text-blue-500" /> Cuộc họp
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setEventTypeFilter("VISIT")} className="flex items-center gap-2 rounded-lg py-2 text-xs font-bold">
                    <Map size={14} className="text-emerald-500" /> Tham quan / Công tác
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setEventTypeFilter("WORKSHOP")} className="flex items-center gap-2 rounded-lg py-2 text-xs font-bold">
                    <BookOpen size={14} className="text-orange-500" /> Hội thảo / Tập huấn
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setEventTypeFilter("CEREMONY")} className="flex items-center gap-2 rounded-lg py-2 text-xs font-bold">
                    <Award size={14} className="text-purple-500" /> Lễ nghi / Sự kiện
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Status */}
            <div className="group flex flex-col border-b border-slate-100 px-4 py-2 md:border-b-0 md:border-r md:py-0">
              <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Trạng thái</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1.5 text-left text-[10px] font-black text-slate-700 outline-none transition-colors hover:text-primary">
                    {statusFilter === "ALL" && "Tất cả"}
                    {statusFilter === "PLANNED" && "Đã lên lịch"}
                    {statusFilter === "CONFIRMED" && "Đã xác nhận"}
                    {statusFilter === "DONE" && "Hoàn thành"}
                    <ChevronDown size={12} className="text-slate-400 transition-transform group-hover:text-primary group-data-[state=open]:rotate-180" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48 rounded-xl p-1 shadow-2xl">
                  <DropdownMenuItem onClick={() => setStatusFilter("ALL")} className="flex items-center gap-2 rounded-lg py-2 text-xs font-bold text-slate-600">
                    <div className="size-1.5 rounded-full bg-slate-400" /> Tất cả trạng thái
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-50" />
                  <DropdownMenuItem onClick={() => setStatusFilter("PLANNED")} className="flex items-center gap-2 rounded-lg py-2 text-xs font-bold text-slate-700">
                    <Clock size={14} className="text-blue-400" /> Đã lên kế hoạch
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("CONFIRMED")} className="flex items-center gap-2 rounded-lg py-2 text-xs font-bold text-slate-700">
                    <CheckCircle2 size={14} className="text-emerald-500" /> Đã xác nhận
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("DONE")} className="flex items-center gap-2 rounded-lg py-2 text-xs font-bold text-slate-700">
                    <div className="flex size-3.5 items-center justify-center rounded-full bg-slate-900 text-[8px] text-white">✓</div> Hoàn thành
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* My Schedule Toggle */}
            <button
              onClick={() => setShowOnlyJoined(!showOnlyJoined)}
              title="Lọc lịch cá nhân"
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl transition-all active:scale-90",
                showOnlyJoined ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
              )}
            >
              <Filter size={18} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex rounded-xl bg-slate-100 p-1 shadow-inner">
              <button 
                onClick={() => setViewMode("week")} 
                className={cn("rounded-lg px-5 py-2 text-[10px] font-black uppercase transition-all", 
                viewMode === "week" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700")}
              >
                Tuần
              </button>
              <button 
                onClick={() => setViewMode("month")} 
                className={cn("rounded-lg px-5 py-2 text-[10px] font-black uppercase transition-all", 
                viewMode === "month" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700")}
              >
                Tháng
              </button>
            </div>

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                  <button className="flex items-center gap-2 rounded-xl bg-slate-950 px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-slate-900/10 transition-all hover:bg-slate-800 active:scale-95" title="Tạo lịch mới" aria-label="Tạo lịch mới">
                  <Plus size={14} />
                  TẠO LỊCH
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle className="font-title text-xl font-black uppercase tracking-tight text-slate-900">Kế hoạch công tác mới</DialogTitle>
                  <DialogDescription className="border-b border-slate-100 pb-4 text-xs font-semibold text-slate-500">Thiết lập thời gian, địa điểm và thành phần tham gia cho sự kiện mới.</DialogDescription>
                </DialogHeader>
                <ScheduleForm 
                  onSubmit={handleCreateSchedule} 
                  onCancel={() => setIsCreateOpen(false)} 
                  isLoading={createEventMutation.isPending}
                  defaultOrganizerId={effectiveOrganizerId || user?.id}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Left Sidebar */}
        <div className="space-y-6 lg:col-span-1">
          {viewMode === "week" ? (
            <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm duration-300 animate-in fade-in">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">{currentMonth.label}</h3>
                <div className="flex gap-2">
                  <button onClick={() => setMonthIndex(p => (p - 1 + 3) % 3)} title="Tháng trước" aria-label="Tháng trước" className="rounded-lg border border-slate-100 p-1.5 text-slate-400 transition-all hover:bg-slate-50 active:scale-90">
                    <ChevronLeft size={16} />
                  </button>
                  <button onClick={() => setMonthIndex(p => (p + 1) % 3)} title="Tháng sau" aria-label="Tháng sau" className="rounded-lg border border-slate-100 p-1.5 text-slate-400 transition-all hover:bg-slate-50 active:scale-90">
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center">
                {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                  <span key={`${d}-${i}`} className="py-1 text-[10px] font-black uppercase text-slate-300">
                    {d}
                  </span>
                ))}
                {Array.from({ length: 35 }).map((_, i) => {
                  const day = i - (new Date(currentMonth.year, currentMonth.month, 1).getDay() - 1);
                  const isValid = day > 0 && day <= new Date(currentMonth.year, currentMonth.month + 1, 0).getDate();
                  const isToday = isValid && day === new Date().getDate() && currentMonth.month === new Date().getMonth();

                  return (
                    <button
                      key={i}
                      onClick={() => isValid && setSelectedDay(day)}
                      disabled={!isValid}
                      className={cn(
                        "relative flex h-8 w-8 items-center justify-center rounded-lg text-[10px] font-bold transition-all",
                        !isValid && "cursor-default opacity-0",
                        isValid && selectedDay === day ? "bg-primary text-white shadow-md shadow-primary/20" : "text-slate-600 hover:bg-slate-50 active:scale-90",
                        isToday && selectedDay !== day && "border border-primary/30 text-primary"
                      )}
                    >
                      {isValid ? day : ""}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm duration-300 animate-in slide-in-from-left-4">
               <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Danh sách ngày</p>
                  <h3 className="mt-1 font-title text-sm font-black uppercase text-slate-900">
                    Ngày {selectedDay} tháng {currentMonth.month + 1}
                  </h3>
               </div>
               
               <div className="space-y-3">
                  {filteredEvents.filter((e) => new Date(e.startAt).getDate() === selectedDay).length > 0 ? (
                    filteredEvents.filter((e) => new Date(e.startAt).getDate() === selectedDay).map((event) => (
                      <div key={event.id} className="group relative border-l-2 border-primary/20 py-1 pl-3 transition-all hover:border-primary">
                        <p className="text-[8px] font-black uppercase text-primary/60">{event.time.split(" - ")[0]}</p>
                        <p className="text-[10px] font-bold uppercase leading-tight text-slate-800 transition-colors group-hover:text-primary">{event.title}</p>
                      </div>
                    ))
                  ) : (
                    <div className="py-10 text-center">
                      <p className="text-[9px] font-black uppercase italic text-slate-300">Không có lịch</p>
                    </div>
                  )}
               </div>
            </div>
          )}

          <div className="group relative space-y-6 overflow-hidden rounded-xl bg-slate-950 p-6 text-white shadow-xl shadow-slate-950/20">
            <Zap size={64} className="absolute -bottom-4 -right-4 text-white opacity-5 transition-all duration-700 group-hover:rotate-12" />
            <div className="space-y-1">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">Tính năng mới</p>
              <h4 className="font-title text-sm font-black uppercase leading-tight tracking-tight text-slate-100">Đồng bộ lịch Outlook</h4>
            </div>
            <button
              onClick={() => {
                setOutlookConnected((prev) => !prev);
                toast.success(!outlookConnected ? "Đã kết nối Outlook." : "Đã ngắt kết nối Outlook.");
              }}
              className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 text-[9px] font-black uppercase tracking-widest text-white transition-all hover:bg-white hover:text-slate-900 active:scale-95"
            >
              {outlookConnected ? "ĐÃ KẾT NỐI" : "KHÁM PHÁ NGAY"}
            </button>
          </div>
        </div>

        {/* Main View Area */}
        <div className="space-y-6 lg:col-span-3">
          <div className="min-h-[600px]">
            {viewMode === "week" ? (
              <ScheduleWeekView 
                events={filteredEvents} 
                isLoading={eventsQuery.isLoading} 
                isError={eventsQuery.isError} 
                errorMessage={errorMessage}
                onRefetch={() => eventsQuery.refetch()}
              />
            ) : (
              <ScheduleMonthView 
                events={filteredEvents}
                currentMonth={currentMonth}
                selectedDay={selectedDay}
                setSelectedDay={setSelectedDay}
              />
            )}
          </div>

          {/* Enhanced Pagination Control */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-6">
              <div className="flex flex-col gap-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Kết quả</p>
                <p className="text-xs font-black text-slate-900">
                  {pagination?.total || 0} <span className="text-[9px] font-bold uppercase text-slate-400">Sự kiện</span>
                </p>
              </div>

              <div className="flex flex-col gap-1 border-l border-slate-100 pl-6">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Hiển thị</p>
                <select 
                  value={itemsPerPage}
                  onChange={(e) => {
                    const newSize = Number(e.target.value);
                    setItemsPerPage(newSize);
                    setCurrentPage(1);
                  }}
                  className="cursor-pointer bg-transparent text-xs font-black text-primary outline-none"
                >
                  <option value={10}>10 dòng</option>
                  <option value={20}>20 dòng</option>
                  <option value={50}>50 dòng</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="mr-2 flex items-center gap-1.5">
                <p className="text-[10px] font-black uppercase text-slate-400">Trang</p>
                <div className="flex h-8 w-12 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-xs font-black text-slate-900">
                  {currentPage}
                </div>
                <p className="text-[10px] font-black uppercase text-slate-400">/ {pagination?.total_pages || 1}</p>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  title="Trang trước"
                  aria-label="Trang trước"
                  className="flex size-10 items-center justify-center rounded-xl border border-slate-100 text-slate-400 transition-all hover:bg-slate-50 hover:text-primary active:scale-90 disabled:opacity-20"
                >
                  <ChevronLeft size={18} />
                </button>
                
                <div className="flex gap-1.5">
                  {Array.from({ length: Math.min(5, pagination?.total_pages || 1) }).map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={cn(
                          "h-10 w-10 rounded-xl text-xs font-black transition-all active:scale-90",
                          currentPage === pageNum 
                            ? "bg-slate-950 text-white shadow-xl shadow-slate-900/20" 
                            : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                        )}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button 
                  onClick={() => setCurrentPage(p => Math.min(pagination?.total_pages || 1, p + 1))}
                  disabled={currentPage === (pagination?.total_pages || 1)}
                  title="Trang sau"
                  aria-label="Trang sau"
                  className="flex size-10 items-center justify-center rounded-xl border border-slate-100 text-slate-400 transition-all hover:bg-slate-50 hover:text-primary active:scale-90 disabled:opacity-20"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const errorMessage = "Không thể tải lịch công tác.";
