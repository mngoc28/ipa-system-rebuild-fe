import { toast } from "sonner";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Settings2, Map, Flag, Briefcase, Tags, Plus, Search, Edit3, Trash2, ChevronRight, Database, MapPin, Layers } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { cn } from "@/lib/utils";
import { MasterDataItem, masterDataApi } from "@/api/masterDataApi";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/SelectField";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ACTIVE_STATUS_OPTIONS = [
  { label: "Hoạt động", value: "active" },
  { label: "Không hoạt động", value: "inactive" },
];

type MasterDataFormState = {
  code: string;
  name_vi: string;
  name_en: string;
  sort_order: string;
  is_active: boolean;
};

type MasterDataFormErrors = Partial<Record<keyof MasterDataFormState, string>>;

interface ParsedApiError {
  message: string;
  fieldErrors: MasterDataFormErrors;
}

const defaultFormState: MasterDataFormState = {
  code: "",
  name_vi: "",
  name_en: "",
  sort_order: "0",
  is_active: true,
};

const parseApiError = (error: unknown): ParsedApiError => {
  const fallbackMessage = "Không thể xử lý yêu cầu. Vui lòng kiểm tra dữ liệu và thử lại.";
  const payload = (error as {
    response?: {
      data?: {
        error?: {
          message?: string;
          details?: Array<{ field?: string; message?: string }>;
          errors?: Record<string, string[] | string>;
        };
      };
    };
  })?.response?.data?.error;

  const fieldErrors: MasterDataFormErrors = {};

  payload?.details?.forEach((detail) => {
    const field = detail.field as keyof MasterDataFormState | undefined;
    if (!field || !(field in defaultFormState)) {
      return;
    }

    if (!fieldErrors[field] && detail.message) {
      fieldErrors[field] = detail.message;
    }
  });

  const payloadErrors = payload?.errors;
  if (payloadErrors && typeof payloadErrors === "object") {
    Object.entries(payloadErrors).forEach(([field, value]) => {
      if (!(field in defaultFormState)) {
        return;
      }

      if (fieldErrors[field as keyof MasterDataFormState]) {
        return;
      }

      if (Array.isArray(value) && value.length > 0) {
        fieldErrors[field as keyof MasterDataFormState] = value[0];
        return;
      }

      if (typeof value === "string" && value.trim()) {
        fieldErrors[field as keyof MasterDataFormState] = value;
      }
    });
  }

  return {
    message: payload?.message || fallbackMessage,
    fieldErrors,
  };
};

type DomainKey = "countries" | "delegation-types" | "priorities" | "event-types" | "sectors" | "locations";

const categories: Array<{ id: DomainKey; name: string; icon: typeof Flag; color: string }> = [
  { id: "countries", name: "Danh bạ Quốc gia", icon: Flag, color: "text-rose-500" },
  { id: "delegation-types", name: "Loại hình đoàn", icon: Briefcase, color: "text-blue-500" },
  { id: "priorities", name: "Mức độ ưu tiên", icon: Tags, color: "text-amber-500" },
  { id: "event-types", name: "Loại sự kiện", icon: Map, color: "text-emerald-500" },
  { id: "sectors", name: "Lĩnh vực kinh doanh", icon: Layers, color: "text-indigo-500" },
  { id: "locations", name: "Địa điểm công tác", icon: MapPin, color: "text-orange-500" },
];

export default function MasterDataPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<DomainKey>("countries");
  const [searchTerm, setSearchTerm] = useState("");
  const [requestSent, setRequestSent] = useState(false);
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MasterDataItem | null>(null);
  const [selectedDeleteItem, setSelectedDeleteItem] = useState<MasterDataItem | null>(null);
  const [formState, setFormState] = useState<MasterDataFormState>(defaultFormState);
  const [formErrors, setFormErrors] = useState<MasterDataFormErrors>({});
  const pageSize = 5;

  const listQuery = useQuery({
    queryKey: ["master-data", activeTab],
    queryFn: () => masterDataApi.list(activeTab),
  });

  const createMutation = useMutation({
    mutationFn: (payload: { code: string; name_vi: string; name_en?: string; sort_order?: number; is_active?: boolean }) => masterDataApi.create(activeTab, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["master-data", activeTab] });
      toast.success("Đã thêm bản ghi mới.");
    },
  });

  const patchMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<MasterDataItem> }) => masterDataApi.patch(activeTab, id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["master-data", activeTab] });
      toast.success("Đã cập nhật bản ghi.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => masterDataApi.delete(activeTab, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["master-data", activeTab] });
      toast.success("Đã xóa bản ghi.");
      setDeleteOpen(false);
      setSelectedDeleteItem(null);
    },
    onError: () => toast.error("Không thể xóa bản ghi."),
  });

  const currentRecords = listQuery.data?.data?.items || [];

  const filteredRecords = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    return currentRecords.filter((item) => (keyword ? item.name_vi.toLowerCase().includes(keyword) || item.code.toLowerCase().includes(keyword) : true));
  }, [currentRecords, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const normalizedPage = Math.min(page, totalPages);
  const pagedRecords = filteredRecords.slice((normalizedPage - 1) * pageSize, normalizedPage * pageSize);

  const handleAddRecord = () => {
    setSelectedItem(null);
    setFormErrors({});
    setFormState({
      code: "",
      name_vi: "",
      name_en: "",
      sort_order: String(currentRecords.length),
      is_active: true,
    });
    setCreateOpen(true);
  };

  const handleEditRecord = (item: MasterDataItem) => {
    setSelectedItem(item);
    setFormErrors({});
    setFormState({
      code: item.code,
      name_vi: item.name_vi,
      name_en: item.name_en || "",
      sort_order: String(item.sort_order ?? 0),
      is_active: item.is_active !== false,
    });
    setEditOpen(true);
  };

  const handleDeleteRecord = (item: MasterDataItem) => {
    setSelectedDeleteItem(item);
    setDeleteOpen(true);
  };

  const resetForm = () => {
    setFormState(defaultFormState);
    setFormErrors({});
  };

  const updateFormField = <K extends keyof MasterDataFormState>(field: K, value: MasterDataFormState[K]) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => {
      if (!prev[field]) {
        return prev;
      }

      return { ...prev, [field]: undefined };
    });
  };

  const handleCreateSubmit = async () => {
    setFormErrors({});

    try {
      await createMutation.mutateAsync({
        code: formState.code.trim(),
        name_vi: formState.name_vi.trim(),
        name_en: formState.name_en.trim() || undefined,
        sort_order: Number(formState.sort_order || 0),
        is_active: formState.is_active,
      });
      setCreateOpen(false);
      resetForm();
      setPage(1);
    } catch (error) {
      const parsed = parseApiError(error);
      setFormErrors(parsed.fieldErrors);
      toast.error(parsed.message, { id: "master-data-submit-error" });
    }
  };

  const handleEditSubmit = async () => {
    if (!selectedItem) {
      return;
    }

    setFormErrors({});

    try {
      await patchMutation.mutateAsync({
        id: selectedItem.id,
        payload: {
          code: formState.code.trim(),
          name_vi: formState.name_vi.trim(),
          name_en: formState.name_en.trim(),
          sort_order: Number(formState.sort_order || 0),
          is_active: formState.is_active,
        },
      });
      setEditOpen(false);
      setSelectedItem(null);
      resetForm();
    } catch (error) {
      const parsed = parseApiError(error);
      setFormErrors(parsed.fieldErrors);
      toast.error(parsed.message, { id: "master-data-submit-error" });
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedDeleteItem) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(selectedDeleteItem.id);
    } catch (error) {
      const message = (error as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
      toast.error(message || "Không thể xóa bản ghi.");
    }
  };

  return (
    <div className="flex flex-col gap-6 duration-500 animate-in fade-in lg:flex-row">
      <aside className="w-full shrink-0 space-y-6 lg:w-[320px]">
        <div>
          <h1 className="flex items-center gap-3 font-title text-2xl font-black uppercase tracking-tight text-brand-text-dark">
            <Database size={24} className="text-primary" />
            Danh mục hệ thống
          </h1>
          <p className="mt-1 text-xs font-medium uppercase tracking-tight text-brand-text-dark/40">Cấu hình dữ liệu nền cho toàn hệ thống.</p>
        </div>

        <div className="space-y-1 rounded-xl border border-brand-dark/10 bg-white p-1.5 shadow-sm">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveTab(cat.id);
                setPage(1);
              }}
              className={cn("group flex w-full items-center justify-between rounded-lg p-3.5 transition-all outline-none", activeTab === cat.id ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-600 hover:bg-slate-50")}
            >
              <div className="flex items-center gap-3">
                <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg border transition-colors", activeTab === cat.id ? "bg-white/10 border-white/20" : "bg-slate-50 border-slate-100 group-hover:bg-white")}>
                  <cat.icon size={16} className={activeTab === cat.id ? "text-white" : cat.color} />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold leading-tight">{cat.name}</p>
                  <p className={cn("mt-0.5 text-[9px] font-black uppercase tracking-widest", activeTab === cat.id ? "text-white/60" : "text-slate-400")}>{activeTab === cat.id ? currentRecords.length : "--"} BẢN GHI</p>
                </div>
              </div>
              <ChevronRight size={12} className={activeTab === cat.id ? "text-white/40" : "text-slate-300"} />
            </button>
          ))}
        </div>

        <div className="space-y-4 rounded-xl border border-brand-dark-900 bg-brand-dark p-6 text-white shadow-xl">
          <div className="flex size-10 items-center justify-center rounded-lg border border-primary/20 bg-primary shadow-lg">
            <Settings2 size={20} />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-black uppercase tracking-tight text-white">Yêu cầu bổ sung dữ liệu?</p>
            <p className="text-[10px] font-medium uppercase leading-relaxed tracking-widest text-slate-400">Liên hệ IT để cấu hình thêm các trường dữ liệu tùy chỉnh.</p>
          </div>
          <button
            onClick={() => {
              setRequestSent(true);
              toast.success("Đã gửi yêu cầu bổ sung dữ liệu cho IT.");
            }}
            className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 text-[10px] font-black uppercase tracking-widest transition-colors hover:bg-white/10"
          >
            {requestSent ? "ĐÃ GỬI YÊU CẦU" : "GỬI YÊU CẦU IT"}
          </button>
        </div>
      </aside>

      <main className="flex flex-1 flex-col overflow-hidden rounded-xl border border-brand-dark/10 bg-white shadow-sm">
        <div className="flex flex-col items-center justify-between gap-4 border-b border-brand-dark/5 bg-brand-dark/[0.01] p-5 md:flex-row">
          <div className="relative w-full md:w-[320px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              id="master-data-search"
              name="search"
              placeholder="Tìm kiếm bản ghi..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-xs font-medium shadow-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/5"
            />
          </div>
          <button onClick={handleAddRecord} className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-95">
            <Plus size={16} />
            THÊM MỚI BẢN GHI
          </button>
        </div>

        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-brand-dark/5 bg-brand-dark/[0.01]">
                <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-brand-text-dark/40">Tên thuộc tính</th>
                <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-brand-text-dark/40">Định danh (Key)</th>
                <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-brand-text-dark/40">Trạng thái</th>
                <th className="px-6 py-3 text-right text-[10px] font-black uppercase tracking-widest text-brand-text-dark/40">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-dark/5">
              {listQuery.isLoading ? (
                <tr>
                  <td colSpan={4} className="py-20 text-center">
                    <LoadingSpinner label="Đang tải dữ liệu danh mục..." size={32} />
                  </td>
                </tr>
              ) : pagedRecords.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-20 text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-text-dark/20">Không có dữ liệu phù hợp</p>
                  </td>
                </tr>
              ) : (
                pagedRecords.map((item) => (
                  <tr key={item.id} className="group transition-all hover:bg-brand-dark/[0.02]">
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="text-xs font-bold text-brand-text-dark transition-colors group-hover:text-primary">{item.name_vi}</span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <code className="rounded border border-brand-dark/10 bg-brand-dark/[0.02] px-2 py-0.5 font-mono text-[10px] font-black uppercase text-brand-text-dark/40">{item.code}</code>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-600">
                        <div className="size-1.5 rounded-full bg-emerald-500" />
                        {item.is_active === false ? "Không hoạt động" : "Hoạt động"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-10 transition-opacity group-hover:opacity-100 md:opacity-0">
                        <button aria-label={`Chỉnh sửa ${item.name_vi}`} title={`Chỉnh sửa ${item.name_vi}`} onClick={() => handleEditRecord(item)} className="rounded-lg border border-transparent p-2 text-brand-text-dark/40 transition-all hover:border-primary/10 hover:bg-primary/5 hover:text-primary">
                          <Edit3 size={14} />
                        </button>
                        <button aria-label={`Xóa ${item.name_vi}`} title={`Xóa ${item.name_vi}`} onClick={() => handleDeleteRecord(item)} className="rounded-lg border border-transparent p-2 text-brand-text-dark/40 transition-all hover:border-rose-100 hover:bg-rose-50 hover:text-rose-600">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-brand-dark/5 bg-brand-dark/[0.01] px-6 py-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-brand-text-dark/40">
            Tổng cộng <span className="text-brand-text-dark">{filteredRecords.length}</span> bản ghi hệ thống
          </p>
          <div className="flex gap-1">
            <button onClick={() => setPage((prev) => Math.max(1, prev - 1))} className="rounded-md border border-brand-dark/10 bg-white px-3 py-1 text-[10px] font-black uppercase text-brand-text-dark/60 transition-colors hover:bg-brand-dark/[0.02] disabled:opacity-50" disabled={normalizedPage === 1}>Trang trước</button>
            <button className="rounded-md bg-primary px-3 py-1 text-[10px] font-black uppercase text-white shadow-sm shadow-primary/20">{normalizedPage}</button>
            <button onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))} className="rounded-md border border-brand-dark/10 bg-white px-3 py-1 text-[10px] font-black uppercase text-brand-text-dark/60 transition-colors hover:bg-brand-dark/[0.02] disabled:opacity-50" disabled={normalizedPage === totalPages}>Trang kế</button>
          </div>
        </div>
      </main>

      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) {
            resetForm();
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Thêm bản ghi mới</DialogTitle>
            <DialogDescription>Nhập đầy đủ dữ liệu cho bản ghi meta data trước khi lưu.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2 md:grid-cols-2">
            <label className="space-y-2 text-xs font-bold uppercase tracking-widest text-brand-text-dark/40">
              <span>Key</span>
              <input
                id="master-data-create-code"
                name="code"
                value={formState.code}
                onChange={(e) => updateFormField("code", e.target.value)}
                placeholder="COUNTRIES_5"
                className={cn("w-full rounded-lg border bg-white px-3 py-2 text-sm font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/5", formErrors.code ? "border-rose-300" : "border-brand-dark/10")}
              />
              {formErrors.code && <p className="text-[11px] normal-case tracking-normal text-rose-600">{formErrors.code}</p>}
            </label>
            <label htmlFor="master-data-create-status" className="space-y-2 text-xs font-bold uppercase tracking-widest text-brand-text-dark/40">
              <span>Trạng thái</span>
              <SelectField
                id="master-data-create-status"
                value={formState.is_active ? "active" : "inactive"}
                onValueChange={(v) => updateFormField("is_active", v === "active")}
                options={ACTIVE_STATUS_OPTIONS}
              />
            </label>
            <label className="space-y-2 text-xs font-bold uppercase tracking-widest text-slate-500">
              <span>Tên tiếng Việt</span>
              <input
                id="master-data-create-name-vi"
                name="name_vi"
                value={formState.name_vi}
                onChange={(e) => updateFormField("name_vi", e.target.value)}
                placeholder="Tên bản ghi"
                className={cn("w-full rounded-lg border bg-white px-3 py-2 text-sm font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/5", formErrors.name_vi ? "border-rose-300" : "border-slate-200")}
              />
              {formErrors.name_vi && <p className="text-[11px] normal-case tracking-normal text-rose-600">{formErrors.name_vi}</p>}
            </label>
            <label htmlFor="master-data-create-name-en" className="space-y-2 text-xs font-bold uppercase tracking-widest text-slate-500">
              <span>Tên tiếng Anh</span>
              <input
                id="master-data-create-name-en"
                name="name_en"
                value={formState.name_en}
                onChange={(e) => updateFormField("name_en", e.target.value)}
                placeholder="Record name"
                className={cn("w-full rounded-lg border bg-white px-3 py-2 text-sm font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/5", formErrors.name_en ? "border-rose-300" : "border-slate-200")}
              />
              {formErrors.name_en && <p className="text-[11px] normal-case tracking-normal text-rose-600">{formErrors.name_en}</p>}
            </label>
            <label className="space-y-2 text-xs font-bold uppercase tracking-widest text-slate-500 md:col-span-2">
              <span>Thứ tự hiển thị</span>
              <input
                id="master-data-create-sort-order"
                name="sort_order"
                type="number"
                min="0"
                value={formState.sort_order}
                onChange={(e) => updateFormField("sort_order", e.target.value)}
                className={cn("w-full rounded-lg border bg-white px-3 py-2 text-sm font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/5", formErrors.sort_order ? "border-rose-300" : "border-slate-200")}
              />
              {formErrors.sort_order && <p className="text-[11px] normal-case tracking-normal text-rose-600">{formErrors.sort_order}</p>}
            </label>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Hủy
            </Button>
            <Button onClick={() => void handleCreateSubmit()} disabled={createMutation.isPending}>
              {createMutation.isPending ? "Đang lưu..." : "Tạo bản ghi"}
            </Button>
          </DialogFooter>
          {createMutation.isPending && (
            <p className="text-[11px] font-semibold text-amber-700">Đang gửi dữ liệu lên hệ thống, vui lòng chờ trong giây lát...</p>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) {
            setSelectedItem(null);
            resetForm();
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa bản ghi</DialogTitle>
            <DialogDescription>Cập nhật trực tiếp dữ liệu meta data cho bản ghi đang chọn.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2 md:grid-cols-2">
            <label className="space-y-2 text-xs font-bold uppercase tracking-widest text-brand-text-dark/40">
              <span>Key</span>
              <input
                id="master-data-edit-code"
                name="code"
                value={formState.code}
                onChange={(e) => updateFormField("code", e.target.value)}
                className={cn("w-full rounded-lg border bg-white px-3 py-2 text-sm font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/5", formErrors.code ? "border-rose-300" : "border-brand-dark/10")}
              />
              {formErrors.code && <p className="text-[11px] normal-case tracking-normal text-rose-600">{formErrors.code}</p>}
            </label>
            <label htmlFor="master-data-edit-status" className="space-y-2 text-xs font-bold uppercase tracking-widest text-brand-text-dark/40">
              <span>Trạng thái</span>
              <SelectField
                id="master-data-edit-status"
                value={formState.is_active ? "active" : "inactive"}
                onValueChange={(v) => updateFormField("is_active", v === "active")}
                options={ACTIVE_STATUS_OPTIONS}
              />
            </label>
            <label className="space-y-2 text-xs font-bold uppercase tracking-widest text-slate-500">
              <span>Tên tiếng Việt</span>
              <input
                id="master-data-edit-name-vi"
                name="name_vi"
                value={formState.name_vi}
                onChange={(e) => updateFormField("name_vi", e.target.value)}
                className={cn("w-full rounded-lg border bg-white px-3 py-2 text-sm font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/5", formErrors.name_vi ? "border-rose-300" : "border-slate-200")}
              />
              {formErrors.name_vi && <p className="text-[11px] normal-case tracking-normal text-rose-600">{formErrors.name_vi}</p>}
            </label>
            <label htmlFor="master-data-edit-name-en" className="space-y-2 text-xs font-bold uppercase tracking-widest text-slate-500">
              <span>Tên tiếng Anh</span>
              <input
                id="master-data-edit-name-en"
                name="name_en"
                value={formState.name_en}
                onChange={(e) => updateFormField("name_en", e.target.value)}
                className={cn("w-full rounded-lg border bg-white px-3 py-2 text-sm font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/5", formErrors.name_en ? "border-rose-300" : "border-slate-200")}
              />
              {formErrors.name_en && <p className="text-[11px] normal-case tracking-normal text-rose-600">{formErrors.name_en}</p>}
            </label>
            <label className="space-y-2 text-xs font-bold uppercase tracking-widest text-slate-500 md:col-span-2">
              <span>Thứ tự hiển thị</span>
              <input
                id="master-data-edit-sort-order"
                name="sort_order"
                type="number"
                min="0"
                value={formState.sort_order}
                onChange={(e) => updateFormField("sort_order", e.target.value)}
                className={cn("w-full rounded-lg border bg-white px-3 py-2 text-sm font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/5", formErrors.sort_order ? "border-rose-300" : "border-slate-200")}
              />
              {formErrors.sort_order && <p className="text-[11px] normal-case tracking-normal text-rose-600">{formErrors.sort_order}</p>}
            </label>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Hủy
            </Button>
            <Button onClick={() => void handleEditSubmit()} disabled={patchMutation.isPending}>
              {patchMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa bản ghi</DialogTitle>
            <DialogDescription>
              Hành động này sẽ xóa vĩnh viễn bản ghi{selectedDeleteItem ? ` "${selectedDeleteItem.name_vi}"` : ""} khỏi danh mục hiện tại.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={() => void handleDeleteSubmit()} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? "Đang xóa..." : "Xóa bản ghi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
