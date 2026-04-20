import { useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery } from "@tanstack/react-query";
import { adminUsersApi } from "@/api/adminUsersApi";
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
  locationId: z.string().min(1, "Vui lòng nhập địa điểm"),
  organizerUserId: z.string().min(1, "Vui lòng chọn người chủ trì"),
  participantUserIds: z.array(z.string()).default([]),
  description: z.string().optional(),
});

type ScheduleFormValues = z.infer<typeof scheduleSchema>;

interface ScheduleFormProps {
  onSubmit: (values: ScheduleFormValues & { startAt: string; endAt: string; status: string }) => void;
  onCancel: () => void;
  isLoading?: boolean;
  defaultDate?: string;
  defaultOrganizerId?: string;
}

export default function ScheduleForm({ onSubmit, onCancel, isLoading, defaultDate, defaultOrganizerId }: ScheduleFormProps) {
  const { data: usersData } = useQuery({
    queryKey: ["admin-users-list"],
    queryFn: () => adminUsersApi.list({ pageSize: 100, status: "active" }),
  });

  const userOptions = (usersData?.data?.items || []).map((u) => ({
    value: u.id,
    label: `${u.fullName} (${u.email})`,
  }));

  const { data: eventTypesData } = useQuery({
    queryKey: ["master-data", "event-types"],
    queryFn: () => masterDataApi.list("event-types"),
  });

  const eventTypeItems = useMemo(() => {
    const items = eventTypesData?.data?.items || [];
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
    formState: { errors },
  } = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      eventType: "MEETING",
      date: defaultDate || new Date().toISOString().split("T")[0],
      startTime: "09:00",
      endTime: "10:30",
      organizerUserId: defaultOrganizerId || "",
      participantUserIds: defaultOrganizerId ? [defaultOrganizerId] : [],
      locationId: "IPA_DA_NANG",
    },
  });

  const handleFormSubmit = (data: ScheduleFormValues) => {
    // Combine date and time
    const startAt = new Date(`${data.date}T${data.startTime}:00`).toISOString();
    const endAt = new Date(`${data.date}T${data.endTime}:00`).toISOString();

    onSubmit({
      ...data,
      startAt,
      endAt,
      status: "PLANNED",
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex h-full flex-col duration-300 animate-in fade-in zoom-in-95">
      <div className="max-h-[70vh] flex-1 space-y-6 overflow-y-auto py-4 pr-2">

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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn loại hình" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypeItems.map((item) => (
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
            <div className="relative">
              <Input id="location" {...register("locationId")} className="pl-9" placeholder="Phòng họp IPA, Địa chỉ..." />
              <MapPin className="absolute left-3 top-2.5 text-slate-400" size={16} />
            </div>
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
               </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="organizer" className="text-[10px] font-black uppercase tracking-wider text-slate-500">Người chủ trì *</Label>
            <Controller
              control={control}
              name="organizerUserId"
              render={({ field }) => (
                <SearchableSelect
                  value={field.value}
                  onValueChange={field.onChange}
                  options={userOptions}
                  placeholder="Chọn người chủ trì..."
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
                    const user = userOptions.find(u => u.value === pid);
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

    <div className="flex justify-end gap-3 border-t border-slate-100 bg-white pt-6">
      <Button type="button" variant="outline" onClick={onCancel} className="px-8 text-[10px] font-black uppercase tracking-widest">
        Hủy bỏ
      </Button>
      <Button type="submit" disabled={isLoading} className="border-none bg-slate-900 px-10 text-[10px] font-black uppercase tracking-widest hover:bg-slate-800">
        {isLoading ? "Đang xử lý..." : "Lưu lịch trình"}
      </Button>
    </div>
  </form>
  );
}
