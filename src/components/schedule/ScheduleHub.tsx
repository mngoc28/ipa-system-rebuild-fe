import { useEffect, useMemo, useState, ComponentProps } from "react";
import { ChevronLeft, ChevronRight, Plus, Zap, Filter, Search, ChevronDown, Video, Map, BookOpen, Award, Clock, CheckCircle2, CalendarRange } from "lucide-react";
import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { eventsApi } from "@/api/eventsApi";
import { useAdminUsersListQuery } from "@/hooks/useAdminUsersQuery";
import { useLocationsQuery } from "@/hooks/useMasterDataHooks";
import { MasterDataItem } from "@/api/masterDataApi";
import { useInitQuery } from "@/hooks/useInitQuery";
import { useAuthStore } from "@/store/useAuthStore";
import ScheduleWeekView from "./ScheduleWeekView";
import ScheduleMonthView from "./ScheduleMonthView";
import ScheduleForm from "./ScheduleForm";
import ScheduleDetailView from "./ScheduleDetailView";
import ScheduleRescheduleForm from "./ScheduleRescheduleForm";
import type { EventItem } from "@/api/eventsApi";
import type { AdminUser } from "@/api/adminUsersApi";
import type { ApiEnvelope, PaginatedData } from "@/types/api";
import { 
  startOfWeek, 
  endOfWeek, 
  addWeeks, 
  subWeeks, 
  addMonths,
  subMonths,
  format, 
  startOfMonth, 
  endOfMonth, 
} from "date-fns";
import { vi } from "date-fns/locale";

interface ScheduleHubProps {
  role?: string;
}

type ScheduleEventSource = EventItem;
type ScheduleEventListResponse = ApiEnvelope<PaginatedData<ScheduleEventSource>>;

export interface UiEvent extends EventItem {
  time: string;
  location: string;
  type: string;
  isJoined: boolean;
  participantStatus?: "PENDING" | "JOINED" | "DECLINED";
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

  const [viewMode, setViewMode] = useState<"week" | "month">("week");
  const [selectedDay, setSelectedDay] = useState<number | null>(new Date().getDate());
  const [showOnlyJoined, setShowOnlyJoined] = useState(false);
  const [outlookConnected, setOutlookConnected] = useState(false);
  // Modal & Selected Item States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<UiEvent | null>(null);
  const [dialogMode, setDialogMode] = useState<"detail" | "edit" | "reschedule" | "delete" | null>(null);
  const [isManagementOpen, setIsManagementOpen] = useState(false); 
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Pagination & Filtering (Restored)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [eventTypeFilter, setEventTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Management States (Restored)
  const isManagement = role?.toLowerCase() === "manager" || role?.toLowerCase() === "director" || role?.toLowerCase() === "admin";
  const [managementView, setManagementView] = useState<"PERSONAL" | "TEAM">(isManagement ? "TEAM" : "PERSONAL");
  const [selectedStaffId, setSelectedStaffId] = useState<string>("ALL");

  // Date Range Management
  const [referenceDate, setReferenceDate] = useState(new Date());
  const currentWeekStart = useMemo(() => startOfWeek(referenceDate, { weekStartsOn: 1 }), [referenceDate]);
  const currentWeekEnd = useMemo(() => endOfWeek(referenceDate, { weekStartsOn: 1 }), [referenceDate]);
  const currentMonthStart = useMemo(() => startOfMonth(referenceDate), [referenceDate]);
  const currentMonthEnd = useMemo(() => endOfMonth(referenceDate), [referenceDate]);
  const currentMonthLabel = useMemo(() => format(referenceDate, "'Tháng' MM, yyyy", { locale: vi }), [referenceDate]);


  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Filter logic: if staff, show own events (organizer or participant). If higher roles, show all or filtered.
  const isStaff = role?.toLowerCase() === "staff";
  const effectiveOrganizerId = isStaff ? undefined : (managementView === "PERSONAL" ? user?.id : (selectedStaffId === "ALL" ? undefined : selectedStaffId));
  const effectiveUnitId = (managementView === "TEAM" && selectedStaffId === "ALL" && !isStaff) ? user?.unit : undefined;

  const { isSuccess: isInitReady } = useInitQuery();

  const eventsQuery = useQuery({
    queryKey: ["events", effectiveOrganizerId, effectiveUnitId, eventTypeFilter, statusFilter, debouncedSearch, currentPage, viewMode, referenceDate],
    queryFn: () =>
      eventsApi.list({
        organizerId: effectiveOrganizerId,
        unitId: effectiveUnitId,
        eventType: eventTypeFilter === "ALL" ? undefined : eventTypeFilter,
        status: statusFilter === "ALL" ? undefined : statusFilter,
        search: debouncedSearch || undefined,
        page: viewMode === "week" ? undefined : currentPage,
        pageSize: viewMode === "week" ? 100 : itemsPerPage,
        from: viewMode === "week" ? currentWeekStart.toISOString() : currentMonthStart.toISOString(),
        to: viewMode === "week" ? currentWeekEnd.toISOString() : currentMonthEnd.toISOString(),
      }),
    placeholderData: keepPreviousData,
  });

  // Task: Fetch Unit Members for Filtering
  const membersQuery = useAdminUsersListQuery({ unitId: user?.unit, pageSize: 100 }, isInitReady);
  const members = useMemo(() => (membersQuery.data as unknown as { items: AdminUser[] })?.items || [], [membersQuery.data]);
  
  // Global active users for name resolution
  const allUsersQuery = useAdminUsersListQuery({ status: "active", pageSize: 100 }, isInitReady);
  const allUsers = useMemo(() => (allUsersQuery.data as unknown as { items: AdminUser[] })?.items || [], [allUsersQuery.data]);

  const locationsQuery = useLocationsQuery(isInitReady);
  const locationsData = locationsQuery.data || [];

  const locationOptions = useMemo(() => {
    const options = locationsData.map((item: MasterDataItem) => ({
      value: String(item.id),
      label: item.name_vi || item.name_en || item.code || "Unknown",
    }));

    if (!options.some((item: { value: string }) => item.value === "IPA_DA_NANG")) {
      options.unshift({ value: "IPA_DA_NANG", label: "Trung tâm Hành chính Đà Nẵng" });
    }

    return options;
  }, [locationsData]);

  const locationLabelMap = useMemo(() => {
    return locationOptions.reduce((acc: Record<string, string>, option: { value: string; label: string }) => {
      acc[option.value] = option.label;
      return acc;
    }, {});
  }, [locationOptions]);

  const normalizeLocationId = (locationId?: string | null) => {
    if (!locationId) return "";
    return locationId === "IPA_DA_NANG" ? "4" : locationId;
  };

  const createEventMutation = useMutation({
    mutationFn: eventsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Đã tạo lịch công tác mới.");
      setIsCreateOpen(false);
    },
    onError: () => toast.error("Không thể tạo lịch công tác."),
  });

  const updateEventMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof eventsApi.patch>[1] }) => eventsApi.patch(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Đã cập nhật thông tin lịch.");
      setDialogMode(null);
      setIsManagementOpen(false);
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: eventsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Đã xóa lịch công tác.");
      setIsDeleteOpen(false);
      setIsManagementOpen(false);
    },
  });

  const rescheduleMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof eventsApi.requestReschedule>[1] }) => eventsApi.requestReschedule(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Đã gửi yêu cầu đổi lịch.");
      setDialogMode(null);
    },
  });

  const joinMutation = useMutation({
    mutationFn: ({ id, joined }: { id: string; joined: boolean }) => eventsApi.join(id, joined),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["events"] }),
  });

  const currentMonth = {
    month: currentMonthStart.getMonth(),
    year: currentMonthStart.getFullYear(),
    label: currentMonthLabel,
  };

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
    const items = queryData?.items || [];
    let events = items;

    if (showOnlyJoined && user?.id) {
      events = events.filter((e: ScheduleEventSource) => 
        e.organizerUserId === String(user.id) || 
        (e.participantUserIds && e.participantUserIds.includes(String(user.id)))
      );
    }

    return events.map((e: ScheduleEventSource) => {
      const pStatus = e.joinStates ? e.joinStates[String(user?.id)] : "PENDING";
      return ({
        ...e, // Spread raw properties for detailed view
        id: e.id,
        time: toTimeRange(e.startAt, e.endAt),
        title: e.title,
        location: locationLabelMap[normalizeLocationId(e.locationId)] || locationLabelMap[e.locationId || ""] || e.locationId || "Văn phòng quản lý",
        type: e.eventType,
        startAt: e.startAt,
        endAt: e.endAt,
        isJoined: pStatus === "JOINED",
        participantStatus: pStatus as "PENDING" | "JOINED" | "DECLINED",
        status: e.status,
        organizerUserId: e.organizerUserId,
        organizerName: members.find((m: AdminUser) => m.id === String(e.organizerUserId))?.fullName || "Thành viên IPA"
      });
    });
  }, [eventsQuery.data, showOnlyJoined, user?.id, members, locationLabelMap]);

  const selectedEventFormValues = useMemo(() => {
    if (!selectedEvent) return undefined;

    return {
      ...selectedEvent,
      date: new Date(selectedEvent.startAt).toISOString().split("T")[0],
      startTime: new Date(selectedEvent.startAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      endTime: new Date(selectedEvent.endAt || selectedEvent.startAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      locationId: normalizeLocationId(selectedEvent.locationId),
      description: selectedEvent.description || "",
      status: selectedEvent.status,
    };
  }, [selectedEvent]);

  const handleCreateSchedule = (values: Parameters<Exclude<ComponentProps<typeof ScheduleForm>["onSubmit"], undefined>>[0]) => {
    createEventMutation.mutate({
      title: values.title,
      description: values.description,
      eventType: values.eventType,
      status: values.status,
      startAt: values.startAt,
      endAt: values.endAt,
      locationId: values.locationId ?? undefined,
      organizerUserId: String(values.organizerUserId || user?.id || ""),
      participantUserIds: (values.participantUserIds || []).map(String),
    });
  };

  const handleUpdateSchedule = (values: Parameters<Exclude<ComponentProps<typeof ScheduleForm>["onSubmit"], undefined>>[0]) => {
    if (!selectedEvent) return;
    updateEventMutation.mutate({
      id: selectedEvent.id,
      payload: {
        title: values.title,
        description: values.description,
        eventType: values.eventType,
        status: values.status,
        startAt: values.startAt,
        endAt: values.endAt,
        locationId: values.locationId ?? undefined,
        organizerUserId: String(values.organizerUserId || ""),
        participantUserIds: (values.participantUserIds || []).map(String),
      }
    });
  };

  const handleRescheduleSubmit = (payload: Parameters<typeof eventsApi.requestReschedule>[1]) => {
    if (!selectedEvent) return;
    rescheduleMutation.mutate({
      id: selectedEvent.id,
      payload
    });
  };

  const handleAction = (mode: "detail" | "edit" | "reschedule" | "delete", event: UiEvent) => {
    setSelectedEvent(event);
    if (mode === "delete") {
      setIsDeleteOpen(true);
    } else {
      setDialogMode(mode);
      setIsManagementOpen(true);
    }
  };

  return (
    <div className="space-y-6 pb-20 duration-500 animate-in fade-in">
      {/* Header section with Role-based Context */}
      <div className="flex flex-col gap-6 border-b border-slate-100 pb-8 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black tracking-tight text-brand-text-dark">
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
                  managementView === "PERSONAL" ? "bg-white text-brand-text-dark shadow-sm ring-1 ring-slate-200" : "text-slate-400 hover:text-slate-600"
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
                  managementView === "TEAM" ? "bg-white text-brand-text-dark shadow-sm ring-1 ring-slate-200" : "text-slate-400 hover:text-slate-600"
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
                className="h-10 w-48 appearance-none rounded-xl border border-slate-200 bg-white pl-4 pr-10 text-[10px] font-black uppercase tracking-widest text-brand-text-dark shadow-sm outline-none transition-all hover:border-primary/30 focus:border-primary focus:ring-2 focus:ring-primary/10"
              >
                <option value="ALL">TẤT CẢ NHÂN VIÊN</option>
                {members.map((m: AdminUser) => (
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
                  <button className="flex items-center gap-1.5 text-left text-xs font-bold text-slate-600 outline-none transition-colors hover:text-primary">
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
                  <button className="flex items-center gap-1.5 text-left text-xs font-bold text-slate-600 outline-none transition-colors hover:text-primary">
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
                    <div className="flex size-3.5 items-center justify-center rounded-full bg-brand-dark-900 text-[8px] text-white">✓</div> Hoàn thành
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
            {isManagement && (
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                    <button className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-primary/10 transition-all hover:bg-primary/90 active:scale-95" title="Tạo lịch mới" aria-label="Tạo lịch mới">
                    <Plus size={14} />
                    TẠO LỊCH
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl px-6">
                  <DialogHeader>
                    <DialogTitle className="font-title text-xl font-black uppercase tracking-tight text-brand-text-dark">Kế hoạch công tác mới</DialogTitle>
                    <DialogDescription className="border-b border-slate-100 pb-4 text-xs font-semibold text-slate-500">Thiết lập thời gian, địa điểm và thành phần tham gia cho sự kiện mới.</DialogDescription>
                  </DialogHeader>
                  <ScheduleForm 
                    onSubmit={handleCreateSchedule} 
                    onCancel={() => setIsCreateOpen(false)} 
                    isLoading={createEventMutation.isPending}
                    defaultOrganizerId={effectiveOrganizerId || user?.id}
                    mode="create"
                    locationOptions={locationOptions}
                    locationLoading={locationsQuery.isLoading}
                    role={role}
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Left Sidebar */}
        <div className="space-y-6 lg:col-span-1">
          {viewMode === "week" ? (
            <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm duration-300 animate-in fade-in">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-widest text-brand-text-dark">{currentMonth.label}</h3>
                <div className="flex gap-2">
                  <button onClick={() => setReferenceDate((prev) => subMonths(prev, 1))} title="Tháng trước" aria-label="Tháng trước" className="rounded-lg border border-slate-100 p-1.5 text-slate-400 transition-all hover:bg-slate-50 active:scale-90">
                    <ChevronLeft size={16} />
                  </button>
                  <button onClick={() => setReferenceDate((prev) => addMonths(prev, 1))} title="Tháng sau" aria-label="Tháng sau" className="rounded-lg border border-slate-100 p-1.5 text-slate-400 transition-all hover:bg-slate-50 active:scale-90">
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
                  const day = i - (currentMonthStart.getDay() - 1);
                  const isValid = day > 0 && day <= currentMonthEnd.getDate();
                  const isToday = isValid && day === new Date().getDate() && currentMonthStart.getMonth() === new Date().getMonth();

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
                  <h3 className="mt-1 font-title text-sm font-black uppercase text-brand-text-dark">
                    Ngày {selectedDay} tháng {currentMonth.month + 1}
                  </h3>
               </div>
               
               <div className="space-y-3">
                  {filteredEvents.filter((e: UiEvent) => new Date(e.startAt).getDate() === selectedDay).length > 0 ? (
                    filteredEvents.filter((e: UiEvent) => new Date(e.startAt).getDate() === selectedDay).map((event: UiEvent) => (
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

          <div className="group relative space-y-6 overflow-hidden rounded-xl bg-brand-dark p-6 text-white shadow-xl shadow-brand-dark/20">
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
              className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 text-[9px] font-black uppercase tracking-widest text-white transition-all hover:bg-white hover:text-brand-text-dark active:scale-95"
            >
              {outlookConnected ? "ĐÃ KẾT NỐI" : "KHÁM PHÁ NGAY"}
            </button>
          </div>
        </div>

        {/* Main View Area */}
        <div className="space-y-6 lg:col-span-3">
          {/* Consistent View Toolbar */}
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2 rounded-full border border-slate-200/50 bg-slate-100 px-3 py-1.5 shadow-sm">
                  <button onClick={() => setReferenceDate((prev) => subMonths(prev, 1))} className="text-slate-500 transition-all hover:scale-110 hover:text-primary active:scale-90">
                    <ChevronLeft size={18} />
                  </button>
                  <span className="min-w-[140px] text-center text-xs font-black uppercase tracking-widest text-brand-text-dark">{currentMonth.label}</span>
                  <button onClick={() => setReferenceDate((prev) => addMonths(prev, 1))} className="text-slate-500 transition-all hover:scale-110 hover:text-primary active:scale-90">
                    <ChevronRight size={18} />
                  </button>
               </div>
               <div className="h-4 w-px bg-slate-200" />
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {viewMode === "week" ? "Chế độ xem tuần" : "Chế độ xem tháng"}
               </p>
            </div>

            <div className="flex rounded-xl bg-slate-100 p-1 shadow-inner">
              <button 
                onClick={() => setViewMode("week")} 
                className={cn("rounded-lg px-6 py-2 text-xs font-bold transition-all", 
                viewMode === "week" ? "bg-white text-primary shadow-sm ring-1 ring-slate-200" : "text-slate-500 hover:text-slate-700")}
              >
                Tuần
              </button>
              <button 
                onClick={() => setViewMode("month")} 
                className={cn("rounded-lg px-6 py-2 text-xs font-bold transition-all", 
                viewMode === "month" ? "bg-white text-primary shadow-sm ring-1 ring-slate-200" : "text-slate-500 hover:text-slate-700")}
              >
                Tháng
              </button>
            </div>
          </div>

          <div className="min-h-[600px]">
            {viewMode === "week" ? (
              <ScheduleWeekView 
                events={filteredEvents} 
                isLoading={eventsQuery.isLoading} 
                isError={eventsQuery.isError} 
                members={allUsers.length > 0 ? allUsers : members}
                onRefetch={() => eventsQuery.refetch()}
                onAction={handleAction}
                onJoin={(event) => joinMutation.mutate({ id: event.id, joined: !event.isJoined })}
                isManagement={isManagement}
              />
            ) : (
              <ScheduleMonthView 
                events={filteredEvents}
                isLoading={eventsQuery.isLoading}
                currentMonth={currentMonth}
                selectedDay={selectedDay}
                setSelectedDay={setSelectedDay}
                onEventClick={(event) => handleAction("detail", event)}
              />
            )}
          </div>

          {/* Unified Management Dialog */}
          <Dialog open={isManagementOpen} onOpenChange={setIsManagementOpen}>
            <DialogContent className="max-w-3xl px-6">
              <DialogHeader>
                <DialogTitle className="font-title text-xl font-black uppercase tracking-tight text-brand-text-dark">
                  {dialogMode === "detail" && "Chi tiết lịch công tác"}
                  {dialogMode === "edit" && "Chỉnh sửa lịch công tác"}
                  {dialogMode === "reschedule" && "Đề xuất thay đổi lịch"}
                </DialogTitle>
                <DialogDescription className="border-b border-slate-100 pb-4 text-xs font-semibold text-slate-500">
                  {dialogMode === "detail" && "Theo dõi thông tin và thành phần tham dự sự kiện."}
                  {dialogMode === "edit" && "Cập nhật các thông tin cơ bản cho sự kiện hiện tại."}
                  {dialogMode === "reschedule" && "Gửi yêu cầu thay đổi thời gian diễn ra cho người chủ trì."}
                </DialogDescription>
              </DialogHeader>

              {dialogMode === "detail" && selectedEvent && (
                <ScheduleDetailView 
                  event={selectedEvent} 
                  members={allUsers.length > 0 ? allUsers : members} 
                  onJoin={() => joinMutation.mutate({ id: selectedEvent.id, joined: !selectedEvent.isJoined })}
                  onEdit={() => setDialogMode("edit")}
                  onDelete={() => setIsDeleteOpen(true)}
                  onReschedule={() => setDialogMode("reschedule")}
                  isJoining={joinMutation.isPending}
                  isManagement={isManagement}
                />
              )}

              {dialogMode === "edit" && selectedEvent && (
                <ScheduleForm 
                  onSubmit={handleUpdateSchedule}
                  onCancel={() => setIsManagementOpen(false)}
                  isLoading={updateEventMutation.isPending}
                  initialValues={selectedEventFormValues as unknown as Parameters<typeof ScheduleForm>[0]["initialValues"]}
                  mode="edit"
                  locationOptions={locationOptions}
                  locationLoading={locationsQuery.isLoading}
                />
              )}

              {dialogMode === "reschedule" && selectedEvent && (
                <ScheduleRescheduleForm 
                  event={selectedEvent}
                  onCancel={() => setIsManagementOpen(false)}
                  onSubmit={handleRescheduleSubmit}
                  isLoading={rescheduleMutation.isPending}
                />
              )}
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation */}
          <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-left font-title text-lg font-black uppercase text-brand-text-dark">Xác nhận xóa lịch?</DialogTitle>
                <DialogDescription className="text-left text-sm font-medium text-slate-500">
                  Hành động này không thể hoàn tác. Lịch công tác sẽ bị xóa vĩnh viễn khỏi hệ thống và thông báo sẽ được gửi tới tất cả thành viên tham gia.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex-row justify-end gap-2 pt-4">
                <DialogClose asChild>
                  <Button variant="outline" className="border-slate-200 text-[10px] font-black uppercase tracking-widest">
                    Hủy bỏ
                  </Button>
                </DialogClose>
                <Button 
                  onClick={() => selectedEvent && deleteEventMutation.mutate(selectedEvent.id)}
                  className="bg-rose-600 px-6 text-[10px] font-black uppercase tracking-widest text-white hover:bg-rose-700"
                >
                  XÁC NHẬN XÓA
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Enhanced Pagination Control */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-6">
              <div className="flex flex-col gap-1">
                <h1 className="font-title text-2xl font-black uppercase tracking-tight text-brand-text-dark">
                  Lịch công tác
                </h1>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  {viewMode === "week" 
                    ? `Tuần: ${format(currentWeekStart, "dd/MM")} - ${format(currentWeekEnd, "dd/MM")}`
                    : `${currentMonth.label}`
                  }
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
              {viewMode === "week" ? (
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setReferenceDate(prev => subWeeks(prev, 1))}
                    className="h-10 gap-2 border-slate-200 px-4 text-[10px] font-black uppercase tracking-widest text-slate-600 transition-all hover:bg-slate-50 active:scale-95"
                  >
                    <ChevronLeft size={16} /> Tuần trước
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setReferenceDate(new Date())}
                    className="h-10 border-slate-200 px-4 text-[10px] font-black uppercase tracking-widest text-slate-600 transition-all hover:bg-slate-50 active:scale-95"
                  >
                    Hôm nay
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setReferenceDate(prev => addWeeks(prev, 1))}
                    className="h-10 gap-2 border-slate-200 px-4 text-[10px] font-black uppercase tracking-widest text-slate-600 transition-all hover:bg-slate-50 active:scale-95"
                  >
                    Tuần sau <ChevronRight size={16} />
                  </Button>
                </div>
              ) : (
                <>
                  <div className="mr-2 flex items-center gap-1.5">
                    <p className="text-[10px] font-black uppercase text-slate-400">Trang</p>
                    <div className="flex h-8 w-12 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-xs font-black text-brand-text-dark">
                      {currentPage}
                    </div>
                    <p className="text-[10px] font-black uppercase text-slate-400">/ {pagination?.total_pages || 1}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setCurrentPage((p: number) => Math.max(1, p - 1))}
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
                                ? "bg-brand-dark text-white shadow-xl shadow-brand-dark-900/20" 
                                : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                            )}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button 
                      onClick={() => setCurrentPage((p: number) => Math.min(pagination?.total_pages || 1, p + 1))}
                      disabled={currentPage === (pagination?.total_pages || 1)}
                      title="Trang sau"
                      aria-label="Trang sau"
                      className="flex size-10 items-center justify-center rounded-xl border border-slate-100 text-slate-400 transition-all hover:bg-slate-50 hover:text-primary active:scale-90 disabled:opacity-20"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
