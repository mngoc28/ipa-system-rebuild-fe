import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  PlainTextarea 
} from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, AlertCircle, CheckCircle2, Info } from "lucide-react";
import { Announcement } from "@/api/adminApi";

const announcementSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  type: z.enum(["info", "warning", "success"]),
  is_active: z.boolean().default(true),
  starts_at: z.string().nullable().optional(),
  ends_at: z.string().nullable().optional(),
}).refine((data) => {
  if (data.starts_at && data.ends_at) {
    return new Date(data.ends_at) > new Date(data.starts_at);
  }
  return true;
}, {
  message: "End date must be after start date",
  path: ["ends_at"],
});

type AnnouncementFormValues = z.infer<typeof announcementSchema>;

/**
 * Props for the AnnouncementForm component.
 */
interface AnnouncementFormProps {
    initialData?: Announcement | null;
    onSubmit: (values: AnnouncementFormValues) => Promise<void>;
    onCancel: () => void;
    loading?: boolean;
}

/**
 * A comprehensive form for creating and editing announcements.
 * Includes fields for title, content, type (informational, success, warning), 
 * visibility dates, and active status.
 */
export function AnnouncementForm({ initialData, onSubmit, onCancel, loading }: AnnouncementFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: initialData?.title || "",
      content: initialData?.content || "",
      type: initialData?.type || "info",
      is_active: initialData?.is_active ?? true,
      starts_at: initialData?.starts_at ? new Date(initialData.starts_at).toISOString().split('T')[0] : "",
      ends_at: initialData?.ends_at ? new Date(initialData.ends_at).toISOString().split('T')[0] : "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-2">
      <div className="space-y-2">
        <Label htmlFor="title" className="text-[11px] font-black uppercase tracking-wider text-slate-500">Announcement Title *</Label>
        <Input 
          id="title" 
          {...register("title")} 
          placeholder="E.g., Scheduled System Maintenance..." 
          className="border-slate-200 bg-slate-50/50 transition-all focus:bg-white"
        />
        {errors.title && <p className="text-[10px] font-bold uppercase tracking-tighter text-rose-500">{errors.title.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-[11px] font-black uppercase tracking-wider text-slate-500">Announcement Type</Label>
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger className="border-slate-200 bg-slate-50/50">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">
                    <div className="flex items-center gap-2"><Info size={14} className="text-blue-500" /> Information</div>
                  </SelectItem>
                  <SelectItem value="warning">
                    <div className="flex items-center gap-2"><AlertCircle size={14} className="text-orange-500" /> Warning</div>
                  </SelectItem>
                  <SelectItem value="success">
                    <div className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> Success</div>
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="flex items-end pb-3">
          <Controller
            control={control}
            name="is_active"
            render={({ field }) => (
              <div className="flex items-center space-x-2">
                <Checkbox 
                   id="is_active" 
                  checked={field.value} 
                  onCheckedChange={field.onChange}
                />
                <Label htmlFor="is_active" className="cursor-pointer text-[11px] font-black uppercase tracking-wider text-slate-900">Activate immediately</Label>
              </div>
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="starts_at" className="text-[11px] font-black uppercase tracking-wider text-slate-500">Start Date (Leave blank for immediate)</Label>
          <Input id="starts_at" type="date" {...register("starts_at")} className="border-slate-200 bg-slate-50/50" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ends_at" className="text-[11px] font-black uppercase tracking-wider text-slate-500">End Date (Leave blank for no expiry)</Label>
          <Input id="ends_at" type="date" {...register("ends_at")} className="border-slate-200 bg-slate-50/50" />
          {errors.ends_at && <p className="text-[10px] font-bold uppercase tracking-tighter text-rose-500">{errors.ends_at.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="content" className="text-[11px] font-black uppercase tracking-wider text-slate-500">Detailed Content *</Label>
        <PlainTextarea 
          id="content" 
          {...register("content")} 
          placeholder="Enter full announcement details..." 
          className="min-h-[120px] border-slate-200 bg-slate-50/50 transition-all focus:bg-white"
        />
        {errors.content && <p className="text-[10px] font-bold uppercase tracking-tighter text-rose-500">{errors.content.message}</p>}
      </div>

      <div className="mt-4 flex justify-end gap-3 border-t border-slate-100 pt-6">
        <Button variant="outline" type="button" onClick={onCancel} className="h-10 border-slate-200 px-6 text-[10px] font-black uppercase tracking-widest">
          Cancel
        </Button>
        <Button disabled={loading} type="submit" className="h-10 px-8 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20">
          {loading ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              PROCESSING
            </>
          ) : (
            initialData ? "UPDATE ANNOUNCEMENT" : "CONFIRM CREATE"
          )}
        </Button>
      </div>
    </form>
  );
}
