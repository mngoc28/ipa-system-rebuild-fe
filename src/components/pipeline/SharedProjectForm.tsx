import * as React from "react";
import { useForm, Controller, FieldErrors } from "react-hook-form";
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
  country_id: z.preprocess((val) => String(val), z.string().min(1, "Quốc gia là bắt buộc")),
  sector_id: z.preprocess((val) => String(val), z.string().min(1, "Lĩnh vực là bắt buộc")),
  stage_id: z.string().min(1, "Giai đoạn là bắt buộc"),
  delegation_id: z.preprocess((val) => (val ? String(val) : null), z.string().nullable().optional()),
  estimated_value: z.preprocess((val) => (val === "" || val === null || isNaN(Number(val)) ? null : Number(val)), z.number().nullable().optional()),
  success_probability: z.preprocess((val) => (val === "" || val === null || isNaN(Number(val)) ? null : Number(val)), z.number().min(0, "Tối thiểu 0%").max(100, "Tối đa 100%").nullable().optional()),
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
  const [countries, setCountries] = React.useState<Array<{ id: string | number; code: string; name_vi: string }>>([]);
  const [sectors, setSectors] = React.useState<Array<{ id: string | number; code: string; name_vi: string }>>([]);
  const [delegations, setDelegations] = React.useState<Array<{ value: string | number; label: string }>>([]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      project_name: initialData?.project_name || "",
      project_code: initialData?.project_code || "",
      country_id: initialData?.country_id ? String(initialData.country_id) : "",
      sector_id: initialData?.sector_id ? String(initialData.sector_id) : "",
      stage_id: initialData?.stage_id || "",
      delegation_id: initialData?.delegation_id || null,
      estimated_value: initialData?.estimated_value ?? null,
      success_probability: initialData?.success_probability ?? null,
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
          (delegationRes.data.items || []).map((d: { id: string | number; code: string; name: string }) => ({
            value: d.id,
            label: `${d.code} - ${d.name}`,
          }))
        );
      } catch {
        console.error("Failed to fetch form data");
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
          owner_user_id: String(currentUser?.data?.id || "unknown"),
        });
        toast.success("Tạo dự án mới thành công");
      }
      onSuccess();
    } catch {
      toast.error("Đã xảy ra lỗi, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  const onError = (errors: FieldErrors<ProjectFormValues>) => {
    console.error("Form Validation Errors:", errors);
    const errorFields = Object.keys(errors).map(key => {
      const fieldLabels: Record<string, string> = {
        project_name: "Tên dự án",
        country_id: "Quốc gia",
        sector_id: "Lĩnh vực",
        stage_id: "Giai đoạn",
        success_probability: "Xác suất",
      };
      return fieldLabels[key] || key;
    });
    toast.error(`Vui lòng kiểm tra: ${errorFields.join(", ")}`);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-4 py-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="project_name">Tên dự án *</Label>
          <Input id="project_name" {...register("project_name")} placeholder="Nhập tên dự án..." />
          {errors.project_name && <p className="text-xs text-rose-500">{errors.project_name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="project_code">Mã dự án</Label>
          <Input id="project_code" {...register("project_code")} placeholder="Mã tự sinh nếu để trống" />
          {errors.project_code && <p className="text-xs text-rose-500">{errors.project_code.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>Quốc gia *</Label>
          <Controller
            control={control}
            name="country_id"
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger className={errors.country_id ? "border-rose-500" : ""}>
                  <SelectValue placeholder="Chọn quốc gia" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name_vi}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.country_id && <p className="text-xs text-rose-500">{errors.country_id.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>Lĩnh vực *</Label>
          <Controller
            control={control}
            name="sector_id"
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger className={errors.sector_id ? "border-rose-500" : ""}>
                  <SelectValue placeholder="Chọn lĩnh vực" />
                </SelectTrigger>
                <SelectContent>
                  {sectors.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name_vi}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.sector_id && <p className="text-xs text-rose-500">{errors.sector_id.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>Giai đoạn *</Label>
          <Controller
            control={control}
            name="stage_id"
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger className={errors.stage_id ? "border-rose-500" : ""}>
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
          {errors.stage_id && <p className="text-xs text-rose-500">{errors.stage_id.message}</p>}
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
          {errors.delegation_id && <p className="text-xs text-rose-500">{errors.delegation_id.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="estimated_value">Giá trị ước tính (VND)</Label>
          <Input
            id="estimated_value"
            {...register("estimated_value")}
            placeholder="Ví dụ: 1000000"
          />
          {errors.estimated_value && <p className="text-xs text-rose-500">{errors.estimated_value.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="success_probability">Xác suất thành công (%)</Label>
          <Input
            id="success_probability"
            {...register("success_probability")}
            placeholder="0-100"
          />
          {errors.success_probability && <p className="text-xs text-rose-500">{errors.success_probability.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="expected_close_date">Ngày dự kiến kết thúc</Label>
          <Input id="expected_close_date" type="date" {...register("expected_close_date")} />
          {errors.expected_close_date && <p className="text-xs text-rose-500">{errors.expected_close_date.message}</p>}
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
          {errors.status && <p className="text-xs text-rose-500">{errors.status.message}</p>}
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
          {initialData ? "Cập nhật" : "Tạo mới"}
        </Button>
      </div>
    </form>
  );
};
