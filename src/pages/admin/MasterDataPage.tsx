import { toast } from "sonner";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Settings2, Map, Flag, Briefcase, Tags, Plus, Search, Edit3, Trash2, ChevronRight, Database } from "lucide-react";
import { cn } from "@/lib/utils";
import { MasterDataItem, masterDataApi } from "@/api/masterDataApi";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type DomainKey = "countries" | "delegation-types" | "priorities" | "event-types";

const categories: Array<{ id: DomainKey; name: string; icon: typeof Flag; color: string }> = [
  { id: "countries", name: "Danh bạ Quốc gia", icon: Flag, color: "text-rose-500" },
  { id: "delegation-types", name: "Loại hình đoàn", icon: Briefcase, color: "text-blue-500" },
  { id: "priorities", name: "Mức độ ưu tiên", icon: Tags, color: "text-amber-500" },
  { id: "event-types", name: "Loại sự kiện", icon: Map, color: "text-emerald-500" },
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
  const [formState, setFormState] = useState({
    code: "",
    name_vi: "",
    name_en: "",
    sort_order: "0",
    is_active: true,
  });
  const pageSize = 5;

  const listQuery = useQuery({
    queryKey: ["master-data", activeTab],
    queryFn: () => masterDataApi.list(activeTab),
  });

  const createMutation = useMutation({
    mutationFn: (payload: { code: string; name_vi: string; name_en?: string; sort_order?: number; is_active?: boolean }) =>
      masterDataApi.create(activeTab, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["master-data", activeTab] });
      toast.success("Đã thêm bản ghi mới.");
    },
    onError: () => toast.error("Không thể thêm bản ghi."),
  });

  const patchMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<MasterDataItem> }) => masterDataApi.patch(activeTab, id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["master-data", activeTab] });
      toast.success("Đã cập nhật bản ghi.");
    },
    onError: () => toast.error("Không thể cập nhật bản ghi."),
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
    setFormState({
      code: "",
      name_vi: "",
      name_en: "",
      sort_order: "0",
      is_active: true,
    });
  };

  const handleCreateSubmit = async () => {
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
      const message = (error as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
      toast.error(message || "Không thể thêm bản ghi.");
    }
  };

  const handleEditSubmit = async () => {
    if (!selectedItem) {
      return;
    }

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
      const message = (error as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
      toast.error(message || "Không thể cập nhật bản ghi.");
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
          <h1 className="flex items-center gap-3 font-title text-2xl font-black tracking-tight text-slate-900 uppercase">
            <Database size={24} className="text-primary" />
            Danh mục hệ thống
          </h1>
          <p className="mt-1 text-xs font-medium text-slate-500 uppercase tracking-tight">Cấu hình dữ liệu nền cho toàn hệ thống.</p>
        </div>

        <div className="space-y-1 rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm">
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

        <div className="space-y-4 rounded-xl bg-slate-950 p-6 text-white border border-slate-900 shadow-xl">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary shadow-lg border border-primary/20">
            <Settings2 size={20} />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-black uppercase tracking-tight text-white">Yêu cầu bổ sung dữ liệu?</p>
            <p className="text-[10px] font-medium leading-relaxed text-slate-500 uppercase tracking-widest">Liên hệ IT để cấu hình thêm các trường dữ liệu tùy chỉnh.</p>
          </div>
          <button
            onClick={() => {
              setRequestSent(true);
              toast.success("Đã gửi yêu cầu bổ sung dữ liệu cho IT.");
            }}
            className="w-full py-2.5 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors"
          >
            {requestSent ? "ĐÃ GỬI YÊU CẦU" : "GỬI YÊU CẦU IT"}
          </button>
        </div>
      </aside>

      <main className="flex flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/30 p-5 md:flex-row">
          <div className="relative w-full md:w-[320px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              placeholder="Tìm kiếm bản ghi..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-xs font-medium outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/5 shadow-sm"
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
              <tr className="border-b border-slate-100 bg-slate-50/20">
                <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Tên thuộc tính</th>
                <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Định danh (Key)</th>
                <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Trạng thái</th>
                <th className="px-6 py-3 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {pagedRecords.map((item) => (
                <tr key={item.id} className="group transition-all hover:bg-slate-50/50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="text-xs font-bold text-slate-900 group-hover:text-primary transition-colors">{item.name_vi}</span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <code className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-[10px] font-black text-slate-500 uppercase">{item.code}</code>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-600">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      {item.is_active === false ? "Không hoạt động" : "Hoạt động"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-10 md:opacity-0 transition-opacity group-hover:opacity-100">
                      <button onClick={() => handleEditRecord(item)} className="rounded-lg p-2 text-slate-400 transition-all hover:bg-primary/5 hover:text-primary border border-transparent hover:border-primary/10">
                        <Edit3 size={14} />
                      </button>
                      <button onClick={() => handleDeleteRecord(item)} className="rounded-lg p-2 text-slate-400 transition-all hover:bg-rose-50 hover:text-rose-600 border border-transparent hover:border-rose-100">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Tổng cộng <span className="text-slate-900">{filteredRecords.length}</span> bản ghi hệ thống
          </p>
          <div className="flex gap-1">
            <button onClick={() => setPage((prev) => Math.max(1, prev - 1))} className="rounded-md border border-slate-200 bg-white px-3 py-1 text-[10px] font-black uppercase text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50" disabled={normalizedPage === 1}>Trang trước</button>
            <button className="rounded-md bg-primary px-3 py-1 text-[10px] font-black uppercase text-white">{normalizedPage}</button>
            <button onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))} className="rounded-md border border-slate-200 bg-white px-3 py-1 text-[10px] font-black uppercase text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50" disabled={normalizedPage === totalPages}>Trang kế</button>
          </div>
        </div>
      </main>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Thêm bản ghi mới</DialogTitle>
            <DialogDescription>Nhập đầy đủ dữ liệu cho bản ghi meta data trước khi lưu.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2 md:grid-cols-2">
            <label className="space-y-2 text-xs font-bold uppercase tracking-widest text-slate-500">
              <span>Key</span>
              <input
                value={formState.code}
                onChange={(e) => setFormState((prev) => ({ ...prev, code: e.target.value }))}
                placeholder="COUNTRIES_5"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/5"
              />
            </label>
            <label className="space-y-2 text-xs font-bold uppercase tracking-widest text-slate-500">
              <span>Trạng thái</span>
              <select
                value={formState.is_active ? "active" : "inactive"}
                onChange={(e) => setFormState((prev) => ({ ...prev, is_active: e.target.value === "active" }))}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/5"
              >
                <option value="active">Hoạt động</option>
                <option value="inactive">Không hoạt động</option>
              </select>
            </label>
            <label className="space-y-2 text-xs font-bold uppercase tracking-widest text-slate-500">
              <span>Tên tiếng Việt</span>
              <input
                value={formState.name_vi}
                onChange={(e) => setFormState((prev) => ({ ...prev, name_vi: e.target.value }))}
                placeholder="Tên bản ghi"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/5"
              />
            </label>
            <label className="space-y-2 text-xs font-bold uppercase tracking-widest text-slate-500">
              <span>Tên tiếng Anh</span>
              <input
                value={formState.name_en}
                onChange={(e) => setFormState((prev) => ({ ...prev, name_en: e.target.value }))}
                placeholder="Record name"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/5"
              />
            </label>
            <label className="space-y-2 text-xs font-bold uppercase tracking-widest text-slate-500 md:col-span-2">
              <span>Thứ tự hiển thị</span>
              <input
                type="number"
                min="0"
                value={formState.sort_order}
                onChange={(e) => setFormState((prev) => ({ ...prev, sort_order: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/5"
              />
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
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa bản ghi</DialogTitle>
            <DialogDescription>Cập nhật trực tiếp dữ liệu meta data cho bản ghi đang chọn.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2 md:grid-cols-2">
            <label className="space-y-2 text-xs font-bold uppercase tracking-widest text-slate-500">
              <span>Key</span>
              <input
                value={formState.code}
                onChange={(e) => setFormState((prev) => ({ ...prev, code: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/5"
              />
            </label>
            <label className="space-y-2 text-xs font-bold uppercase tracking-widest text-slate-500">
              <span>Trạng thái</span>
              <select
                value={formState.is_active ? "active" : "inactive"}
                onChange={(e) => setFormState((prev) => ({ ...prev, is_active: e.target.value === "active" }))}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/5"
              >
                <option value="active">Hoạt động</option>
                <option value="inactive">Không hoạt động</option>
              </select>
            </label>
            <label className="space-y-2 text-xs font-bold uppercase tracking-widest text-slate-500">
              <span>Tên tiếng Việt</span>
              <input
                value={formState.name_vi}
                onChange={(e) => setFormState((prev) => ({ ...prev, name_vi: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/5"
              />
            </label>
            <label className="space-y-2 text-xs font-bold uppercase tracking-widest text-slate-500">
              <span>Tên tiếng Anh</span>
              <input
                value={formState.name_en}
                onChange={(e) => setFormState((prev) => ({ ...prev, name_en: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/5"
              />
            </label>
            <label className="space-y-2 text-xs font-bold uppercase tracking-widest text-slate-500 md:col-span-2">
              <span>Thứ tự hiển thị</span>
              <input
                type="number"
                min="0"
                value={formState.sort_order}
                onChange={(e) => setFormState((prev) => ({ ...prev, sort_order: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/5"
              />
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
