import { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery } from "@tanstack/react-query";
import { adminUsersApi, AdminUser } from "@/api/adminUsersApi";
import { MasterDataItem } from "@/api/masterDataApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlainTextarea as Textarea } from "@/components/ui/textarea";
import SearchableSelect from "@/components/ui/searchable-select";
import { Calendar as CalendarIcon, Clock, MapPin, Users as UsersIcon, AlignLeft, Plus } from "lucide-react";
import { masterDataApi } from "@/api/masterDataApi";

const scheduleSchema = z.object({
  title: z.string().min(1, "Vui lòng nhập tiêu đề lịch công tác"),
  eventType: z.string().min(1, "Vui lòng chọn loại hình công tác"),
  date: z.string().min(1, "Vui lòng chọn ngày"),
  startTime: z.string().min(1, "Giờ bắt đầu"),
  endTime: z.string().min(1, "Giờ kết thúc"),
  locationId: z.string().optional().or(z.null()),
  organizerUserId: z.string().min(1, "Vui lòng chọn người chủ trì"),
  participantUserIds: z.array(z.string()).default([]),
  status: z.string().min(1, "Vui lòng chọn trạng thái"),
  description: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.startTime && data.endTime) {
    const start = new Date(`1970-01-01T${data.startTime}:00`);
    const end = new Date(`1970-01-01T${data.endTime}:00`);
    if (end <= start) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Giờ kết thúc phải sau giờ bắt đầu",
        path: ["endTime"],
      });
    }
  }
});

type ScheduleFormValues = z.infer<typeof scheduleSchema>;
type ScheduleFormMode = "create" | "edit";

type SelectOption = {
  value: string;
  label: string;
};

interface ScheduleFormProps {
  onSubmit: (values: ScheduleFormValues & { startAt: string; endAt: string; status: string }) => void;
  onCancel: () => void;
  isLoading?: boolean;
  defaultDate?: string;
  defaultOrganizerId?: string;
  initialValues?: Partial<ScheduleFormValues>; // New prop for editing
  mode?: ScheduleFormMode;
  locationOptions?: SelectOption[];
  locationLoading?: boolean;
  role?: string;
}

export default function ScheduleForm({
  onSubmit,
  onCancel,
  isLoading,
  defaultDate,
  defaultOrganizerId,
  initialValues,
  mode = "create",
  locationOptions = [],
  locationLoading = false,
  role,
}: ScheduleFormProps) {
  const isStaff = role?.toLowerCase() === "staff";
  const organizerLabel = isStaff ? "Người thực hiện" : "Người chủ trì";
  const organizerPlaceholder = isStaff ? "Chọn người thực hiện..." : "Chọn người chủ trì...";

  const { data: usersData } = useQuery({
    queryKey: ["admin-users-list"],
    queryFn: () => adminUsersApi.list({ pageSize: 100, status: "active" }),
  });

  const userOptions = (usersData?.items || []).map((u: AdminUser) => ({
    value: u.id,
    label: `${u.fullName} (${u.email})`,
  }));

  const { data: eventTypesData } = useQuery({
    queryKey: ["master-data", "event-types"],
    queryFn: () => masterDataApi.list("event-types"),
  });

  const normalizedLocationOptions = useMemo(() => {
    const items = [...locationOptions];
    if (!items.some((option) => option.value === "IPA_DA_NANG")) {
      items.unshift({ value: "IPA_DA_NANG", label: "Trung tâm Hành chính Đà Nẵng" });
    }
    return items;
  }, [locationOptions]);

  const eventTypeItems = useMemo(() => {
    const items = eventTypesData?.items || [];
    if (items.length > 0) return items;
    // Fallback to original values if API fails/loading
    return [
      { code: "MEETING", name_vi: "Cuộc họp (Meeting)" },
      { code: "VISIT", name_vi: "Tham quan / Công tác (Visit)" },
      { code: "WORKSHOP", name_vi: "Hội thảo / Tập huấn (Workshop)" },
      { code: "CEREMONY", name_vi: "Lễ nghi / Sự kiện (Ceremony)" },
    ];
  }, [eventTypesData]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      eventType: initialValues?.eventType || "MEETING",
      date: initialValues?.date || defaultDate || new Date().toISOString().split("T")[0],
      startTime: initialValues?.startTime || "09:00",
      endTime: initialValues?.endTime || "10:30",
      organizerUserId: initialValues?.organizerUserId ? String(initialValues.organizerUserId) : (defaultOrganizerId ? String(defaultOrganizerId) : ""),
      participantUserIds: (initialValues?.participantUserIds || (defaultOrganizerId ? [defaultOrganizerId] : [])).map(String),
      locationId: initialValues?.locationId ? String(initialValues.locationId) : "",
      status: initialValues?.status || "PLANNED",
      title: initialValues?.title || "",
      description: initialValues?.description || "",
    },
  });

  useEffect(() => {
    reset({
      eventType: initialValues?.eventType || "MEETING",
      date: initialValues?.date || defaultDate || new Date().toISOString().split("T")[0],
      startTime: initialValues?.startTime || "09:00",
      endTime: initialValues?.endTime || "10:30",
      organizerUserId: initialValues?.organizerUserId ? String(initialValues.organizerUserId) : (defaultOrganizerId ? String(defaultOrganizerId) : ""),
      participantUserIds: (initialValues?.participantUserIds || (defaultOrganizerId ? [defaultOrganizerId] : [])).map(String),
      locationId: initialValues?.locationId ? String(initialValues.locationId) : "",
      status: initialValues?.status || "PLANNED",
      title: initialValues?.title || "",
      description: initialValues?.description || "",
    });
  }, [reset, initialValues, defaultDate, defaultOrganizerId]);

  const handleFormSubmit = (data: ScheduleFormValues) => {
    // Combine date and time
    const startAt = new Date(`${data.date}T${data.startTime}:00`).toISOString();
    const endAt = new Date(`${data.date}T${data.endTime}:00`).toISOString();

    onSubmit({
      ...data,
      startAt,
      endAt,
      status: data.status,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex h-full flex-col duration-300 animate-in fade-in zoom-in-95">
      <div className="max-h-[70vh] flex-1 space-y-6 overflow-y-auto p-4 pr-2">

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Main Info */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-[10px] font-black uppercase tracking-wider text-slate-500">Tiêu đề lịch công tác *</Label>
            <div className="relative">
              <Input id="title" {...register("title")} className="pl-9" placeholder="Nhập tên sự kiện..." />
              <AlignLeft className="absolute left-3 top-2.5 text-slate-400" size={16} />
            </div>
            {errors.title && <p className="text-[10px] font-bold uppercase text-rose-500">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Loại hình công tác</Label>
            <Controller
              control={control}
              name="eventType"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn loại hình" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypeItems.map((item: MasterDataItem | { code: string; name_vi: string }) => (
                      <SelectItem key={item.code} value={item.code}>
                        {item.name_vi}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="text-[10px] font-black uppercase tracking-wider text-slate-500">Địa điểm *</Label>
            <Controller
              control={control}
              name="locationId"
              render={({ field }) => (
                <SearchableSelect
                  value={field.value || ""}
                  onValueChange={field.onChange}
                  options={normalizedLocationOptions}
                  loading={locationLoading}
                  placeholder="Chọn địa điểm..."
                  searchPlaceholder="Tìm địa điểm..."
                  emptyMessage="Không có địa điểm phù hợp"
                  icon={<MapPin size={16} />}
                />
              )}
            />
            {errors.locationId && <p className="text-[10px] font-bold uppercase text-rose-500">{errors.locationId.message}</p>}
          </div>
        </div>

        {/* Time & Participants */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-[10px] font-black uppercase tracking-wider text-slate-500">Ngày diễn ra *</Label>
              <div className="relative">
                <Input id="date" type="date" {...register("date")} className="pl-9" />
                <CalendarIcon className="absolute left-3 top-2.5 text-slate-400" size={16} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                  <Label htmlFor="startTime" className="text-[10px] font-black uppercase tracking-wider text-slate-500">Bắt đầu *</Label>
                  <div className="relative">
                    <Input id="startTime" type="time" {...register("startTime")} className="pl-9" />
                    <Clock className="absolute left-3 top-2.5 text-slate-400" size={16} />
                  </div>
               </div>
               <div className="space-y-2">
                  <Label htmlFor="endTime" className="text-[10px] font-black uppercase tracking-wider text-slate-500">Kết thúc *</Label>
                   <div className="relative">
                    <Input id="endTime" type="time" {...register("endTime")} className="pl-9" />
                    <Clock className="absolute left-3 top-2.5 text-slate-400" size={16} />
                  </div>
                  {errors.endTime && <p className="text-[10px] font-bold uppercase text-rose-500">{errors.endTime.message}</p>}
               </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Trạng thái</Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PLANNED">Đã lên lịch</SelectItem>
                      <SelectItem value="CONFIRMED">Đã xác nhận</SelectItem>
                      <SelectItem value="DONE">Hoàn thành</SelectItem>
                      <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="organizer" className="text-[10px] font-black uppercase tracking-wider text-slate-500">{organizerLabel} *</Label>
            <Controller
              control={control}
              name="organizerUserId"
              render={({ field }) => (
                <SearchableSelect
                  value={field.value || ""}
                  onValueChange={field.onChange}
                  options={userOptions}
                  placeholder={organizerPlaceholder}
                   searchPlaceholder={`Tìm ${organizerLabel.toLowerCase()}...`}
                  emptyMessage="Không có người dùng phù hợp"
                  disabled={isStaff && mode === "create"}
                />
              )}
            />
            {errors.organizerUserId && <p className="text-[10px] font-bold uppercase text-rose-500">{errors.organizerUserId.message}</p>}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Thành phần tham dự</Label>
        <Controller
          control={control}
          name="participantUserIds"
          render={({ field }) => (
            <SearchableSelect
              value=""
               onValueChange={(val) => {
                const sVal = String(val);
                if (!field.value.includes(sVal)) {
                  field.onChange([...field.value, sVal]);
                }
              }}
              options={userOptions}
              placeholder="Thêm người tham gia..."
              searchPlaceholder="Tìm người tham gia..."
              emptyMessage="Không có người dùng phù hợp"
            />
          )}
        />
        <div className="mt-3 flex flex-wrap gap-2">
            <Controller
              control={control}
              name="participantUserIds"
              render={({ field }) => (
                <>
                  {field.value.map((id: string) => {
                    const pid = String(id);
                    const user = userOptions.find((u: { value: string; label: string }) => u.value === pid);
                    return user ? (
                        <span key={pid} className="group inline-flex items-center gap-2 rounded bg-slate-100 py-1.5 pl-2.5 pr-1.5 text-[9px] font-bold uppercase text-slate-700 shadow-sm transition-colors hover:bg-slate-200">
                            <UsersIcon size={12} className="text-slate-400" />
                            {user.label.split(" (")[0]}
                             <button 
                                type="button" 
                                onClick={() => field.onChange(field.value.filter((i: string) => String(i) !== pid))}
                                className="ml-1 rounded-full p-0.5 transition-colors hover:bg-rose-100 hover:text-rose-600"
                              >
                                <Plus className="rotate-45" size={14} />
                              </button>
                        </span>
                    ) : null;
                  })}
                </>
              )}
            />
         </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-[10px] font-black uppercase tracking-wider text-slate-500">Ghi chú sự kiện</Label>
        <Textarea id="description" {...register("description")} placeholder="Nhập mô tả chi tiết hoặc ghi chú..." className="min-h-[100px]" />
      </div>
    </div>

    <div className="flex justify-end gap-3 border-t border-slate-100 bg-white px-4 pt-6">
      <Button type="button" variant="outline" onClick={onCancel} className="px-8 text-[10px] font-black uppercase tracking-widest">
        Hủy bỏ
      </Button>
      <Button type="submit" disabled={isLoading} className="border-none bg-brand-dark-900 px-10 text-[10px] font-black uppercase tracking-widest hover:bg-slate-800">
        {isLoading ? "Đang xử lý..." : "Lưu lịch trình"}
      </Button>
    </div>
  </form>
  );
}
