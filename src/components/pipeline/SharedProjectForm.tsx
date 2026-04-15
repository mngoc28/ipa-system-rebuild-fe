import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SearchableSelect from "@/components/ui/searchable-select";
import { pipelineApi, PipelineProject } from "@/api/pipelineApi";
import { masterDataApi } from "@/api/masterDataApi";
import { delegationsApi } from "@/api/delegationsApi";
import { useCurrentUserQuery } from "@/hooks/useAuthQuery";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const projectSchema = z.object({
  project_name: z.string().min(1, "Tên dự án là bắt buộc"),
  project_code: z.string().optional(),
  country_id: z.string().min(1, "Quốc gia là bắt buộc"),
  sector_id: z.string().min(1, "Lĩnh vực là bắt buộc"),
  stage_id: z.string().min(1, "Giai đoạn là bắt buộc"),
  delegation_id: z.string().nullable().optional(),
  estimated_value: z.number().nullable().optional(),
  success_probability: z.number().min(0).max(100).nullable().optional(),
  expected_close_date: z.string().nullable().optional(),
  status: z.enum(["active", "hidden"]),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

interface SharedProjectFormProps {
  initialData?: PipelineProject | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const SharedProjectForm: React.FC<SharedProjectFormProps> = ({
  initialData,
  onSuccess,
  onCancel,
}) => {
  const { data: currentUser } = useCurrentUserQuery();
  const [loading, setLoading] = React.useState(false);
  const [countries, setCountries] = React.useState<any[]>([]);
  const [sectors, setSectors] = React.useState<any[]>([]);
  const [delegations, setDelegations] = React.useState<any[]>([]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      project_name: initialData?.project_name || "",
      project_code: initialData?.project_code || "",
      country_id: initialData?.country_id || "VN",
      sector_id: initialData?.sector_id || "energy",
      stage_id: initialData?.stage_id || "lead",
      delegation_id: initialData?.delegation_id || null,
      estimated_value: initialData?.estimated_value || 0,
      success_probability: initialData?.success_probability || 50,
      expected_close_date: initialData?.expected_close_date || "",
      status: initialData?.status || "active",
    },
  });

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [countryRes, sectorRes, delegationRes] = await Promise.all([
          masterDataApi.list("countries"),
          masterDataApi.list("sectors"),
          delegationsApi.list({ per_page: 100 }),
        ]);
        setCountries(countryRes.data.items);
        setSectors(sectorRes.data.items);
        setDelegations(
          delegationRes.data.data.map((d) => ({
            value: d.id,
            label: `${d.delegation_code} - ${d.delegation_name}`,
          }))
        );
      } catch (error) {
        console.error("Failed to fetch form data", error);
      }
    };
    fetchData();
  }, []);

  const onSubmit = async (values: ProjectFormValues) => {
    setLoading(true);
    try {
      if (initialData) {
        await pipelineApi.updateProject(initialData.id, values);
        toast.success("Cập nhật dự án thành công");
      } else {
        await pipelineApi.createProject({
          ...values,
          owner_user_id: currentUser?.data?.id || "unknown",
        });
        toast.success("Tạo dự án mới thành công");
      }
      onSuccess();
    } catch (error) {
      toast.error("Đã xảy ra lỗi, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="project_name">Tên dự án *</Label>
          <Input id="project_name" {...register("project_name")} placeholder="Nhập tên dự án..." />
          {errors.project_name && <p className="text-xs text-rose-500">{errors.project_name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="project_code">Mã dự án</Label>
          <Input id="project_code" {...register("project_code")} placeholder="Mã tự sinh nếu để trống" />
        </div>

        <div className="space-y-2">
          <Label>Quốc gia *</Label>
          <Controller
            control={control}
            name="country_id"
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn quốc gia" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((c) => (
                    <SelectItem key={c.id} value={c.code}>
                      {c.name_vi}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label>Lĩnh vực *</Label>
          <Controller
            control={control}
            name="sector_id"
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn lĩnh vực" />
                </SelectTrigger>
                <SelectContent>
                  {sectors.map((s) => (
                    <SelectItem key={s.id} value={s.code}>
                      {s.name_vi}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label>Giai đoạn *</Label>
          <Controller
            control={control}
            name="stage_id"
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn giai đoạn" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lead">Tiềm năng</SelectItem>
                  <SelectItem value="contacted">Đã liên hệ</SelectItem>
                  <SelectItem value="proposal">Đang đề xuất</SelectItem>
                  <SelectItem value="negotiation">Đang đàm phán</SelectItem>
                  <SelectItem value="closed-won">Thành công</SelectItem>
                  <SelectItem value="closed-lost">Thất bại</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label>Đoàn công tác liên kết</Label>
          <Controller
            control={control}
            name="delegation_id"
            render={({ field }) => (
              <SearchableSelect
                value={field.value || ""}
                onValueChange={(val) => field.onChange(val || null)}
                options={delegations}
                placeholder="Tìm đoàn công tác..."
                searchPlaceholder="Gõ mã hoặc tên đoàn..."
                emptyMessage="Không thấy đoàn công tác nào"
              />
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="estimated_value">Giá trị ước tính (VND)</Label>
          <Input
            id="estimated_value"
            type="number"
            {...register("estimated_value", { valueAsNumber: true })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="success_probability">Xác suất thành công (%)</Label>
          <Input
            id="success_probability"
            type="number"
            {...register("success_probability", { valueAsNumber: true })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="expected_close_date">Ngày dự kiến kết thúc</Label>
          <Input id="expected_close_date" type="date" {...register("expected_close_date")} />
        </div>

        <div className="space-y-2">
          <Label>Trạng thái hiển thị</Label>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Hiển thị (Active)</SelectItem>
                  <SelectItem value="hidden">Lưu trữ (Hidden)</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? "Cập nhật" : "Tạo mới"}
        </Button>
      </div>
    </form>
  );
};
