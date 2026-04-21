import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlainTextarea as Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarIcon, Clock, MessageSquare, ArrowRight } from "lucide-react";
import { UiEvent } from "./ScheduleHub";

const rescheduleSchema = z.object({
  date: z.string().min(1, "Vui lòng chọn ngày"),
  startTime: z.string().min(1, "Giờ bắt đầu"),
  endTime: z.string().min(1, "Giờ kết thúc"),
  reason: z.string().min(10, "Vui lòng nhập lý do tối thiểu 10 ký tự"),
});

type RescheduleFormValues = z.infer<typeof rescheduleSchema>;

interface RescheduleFormProps {
  event: UiEvent;
  onSubmit: (payload: { proposedStartAt: string; proposedEndAt: string; reason: string }) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ScheduleRescheduleForm({ event, onSubmit, onCancel, isLoading }: RescheduleFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RescheduleFormValues>({
    resolver: zodResolver(rescheduleSchema),
    defaultValues: {
      date: new Date(event.startAt).toISOString().split("T")[0],
      startTime: new Date(event.startAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }).replace(":", ":"),
      endTime: new Date(event.endAt || event.startAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }).replace(":", ":"),
      reason: "",
    },
  });

  const handleFormSubmit = (data: RescheduleFormValues) => {
    const proposedStartAt = new Date(`${data.date}T${data.startTime}:00`).toISOString();
    const proposedEndAt = new Date(`${data.date}T${data.endTime}:00`).toISOString();
    
    onSubmit({
      proposedStartAt,
      proposedEndAt,
      reason: data.reason,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 py-4 duration-300 animate-in fade-in zoom-in-95">
      <div className="space-y-2 rounded-xl border border-amber-100 bg-amber-50/50 p-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-amber-600">Đang đề xuất thay đổi cho:</p>
        <p className="text-sm font-black text-slate-800">{event.title}</p>
        <p className="flex items-center gap-1 text-[10px] font-bold uppercase text-slate-500">
          <CalendarIcon size={12} /> {event.time}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-2">
          <Label htmlFor="date" className="text-[10px] font-black uppercase tracking-wider text-slate-500">Ngày đề xuất mới *</Label>
          <div className="relative">
            <Input id="date" type="date" {...register("date")} className="pl-9" />
            <CalendarIcon className="absolute left-3 top-2.5 text-slate-400" size={16} />
          </div>
          {errors.date && <p className="text-[10px] font-bold uppercase text-rose-500">{errors.date.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
           <div className="space-y-2">
              <Label htmlFor="startTime" className="text-[10px] font-black uppercase tracking-wider text-slate-500">Giờ bắt đầu mới *</Label>
              <div className="relative">
                <Input id="startTime" type="time" {...register("startTime")} className="pl-9" />
                <Clock className="absolute left-3 top-2.5 text-slate-400" size={16} />
              </div>
           </div>
           <div className="space-y-2">
              <Label htmlFor="endTime" className="text-[10px] font-black uppercase tracking-wider text-slate-500">Giờ kết thúc mới *</Label>
              <div className="relative">
                <Input id="endTime" type="time" {...register("endTime")} className="pl-9" />
                <Clock className="absolute left-3 top-2.5 text-slate-400" size={16} />
              </div>
           </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reason" className="text-[10px] font-black uppercase tracking-wider text-slate-500">Lý do thay đổi *</Label>
          <div className="relative">
            <Textarea id="reason" {...register("reason")} placeholder="Nhập lý do chi tiết để người chủ trì xem xét..." className="min-h-[100px] pl-9" />
            <MessageSquare className="absolute left-3 top-3 text-slate-400" size={16} />
          </div>
          {errors.reason && <p className="text-[10px] font-bold uppercase text-rose-500">{errors.reason.message}</p>}
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t border-slate-100 pt-6">
        <Button type="button" variant="outline" onClick={onCancel} className="px-8 text-[10px] font-black uppercase tracking-widest">
          Hủy bỏ
        </Button>
        <Button type="submit" disabled={isLoading} className="gap-2 border-none bg-brand-dark-900 px-10 text-[10px] font-black uppercase tracking-widest hover:bg-slate-800">
          {isLoading ? "Đang gửi..." : "GỬI ĐỀ XUẤT"}
          <ArrowRight size={14} />
        </Button>
      </div>
    </form>
  );
}
