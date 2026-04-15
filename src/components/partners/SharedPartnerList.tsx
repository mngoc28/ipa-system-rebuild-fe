import * as React from "react";
import { Plus, Search, Filter, Globe, Mail, Building2, MoreVertical, Star, ExternalLink, Trash2, Edit } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getPartnerStatusValue, mapPartnerStatus, type PartnerUiItem } from "@/dataHelper/partners.dataHelper";
import {
  useAddPartnerContactMutation,
  useCreatePartnerMutation,
  usePartnerDetailQuery,
  usePartnerOptionsQuery,
  usePromotePartnerStatusMutation,
  useUpdatePartnerMutation,
  useDeletePartnerMutation,
  usePartnersListQuery,
  useSyncPartnersMutation,
} from "@/hooks/usePartnersQuery";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type PartnerFormState = {
  partnerCode: string;
  name: string;
  countryId: string;
  sectorId: string;
  status: string;
  score: string;
  website: string;
  notes: string;
};

const emptyPartnerForm = (): PartnerFormState => ({
  partnerCode: "",
  name: "",
  countryId: "",
  sectorId: "",
  status: "0",
  score: "",
  website: "",
  notes: "",
});

export default function SharedPartnerList() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = React.useState<number | undefined>(undefined);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [selectedPartnerId, setSelectedPartnerId] = React.useState<string | null>(null);
  
  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = React.useState(false);
  const [formPartner, setFormPartner] = React.useState<PartnerFormState>(emptyPartnerForm());

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { partnersQuery, partners, meta } = usePartnersListQuery({
    status: statusFilter,
    page: page,
    search: debouncedSearch,
  });

  const createMutation = useCreatePartnerMutation();
  const updateMutation = useUpdatePartnerMutation();
  const deleteMutation = useDeletePartnerMutation();
  const contactMutation = useAddPartnerContactMutation();
  const promoteMutation = usePromotePartnerStatusMutation();
  const syncMutation = useSyncPartnersMutation(partners);
  const { optionsQuery, options } = usePartnerOptionsQuery();
  const partnerDetailQuery = usePartnerDetailQuery(selectedPartnerId ?? undefined);

  const handleSync = () => syncMutation.mutate();
  const partnerErrorMessage = partnersQuery.error instanceof Error ? partnersQuery.error.message : "Không thể tải danh sách đối tác.";

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      partner_code: formPartner.partnerCode.trim(),
      partner_name: formPartner.name.trim(),
      country_id: Number(formPartner.countryId),
      sector_id: Number(formPartner.sectorId),
      status: Number(formPartner.status),
      website: formPartner.website.trim(),
      notes: formPartner.notes.trim(),
    }, {
      onSuccess: () => {
        setIsCreateModalOpen(false);
        setFormPartner(emptyPartnerForm());
      }
    });
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartnerId) return;
    updateMutation.mutate({
      id: selectedPartnerId,
      payload: {
        partner_code: formPartner.partnerCode.trim(),
        partner_name: formPartner.name.trim(),
        country_id: Number(formPartner.countryId),
        sector_id: Number(formPartner.sectorId),
        status: Number(formPartner.status),
        score: formPartner.score ? Number(formPartner.score) : undefined,
        website: formPartner.website.trim(),
        notes: formPartner.notes.trim(),
      }
    }, {
      onSuccess: () => {
        setIsEditModalOpen(false);
        setFormPartner(emptyPartnerForm());
      }
    });
  };

  const handleDeleteConfirm = () => {
    if (!selectedPartnerId) return;
    deleteMutation.mutate(selectedPartnerId, {
      onSuccess: () => setIsDeleteModalOpen(false)
    });
  };

  const handlePromoteStatus = (partner: PartnerUiItem) => {
    promoteMutation.mutate({
      id: partner.id,
      status: getPartnerStatusValue(partner.status),
    });
  };

  const selectedPartner = partners.find((p) => p.id === selectedPartnerId) ?? null;
  const selectedPartnerDetail = partnerDetailQuery.data?.data;

  React.useEffect(() => {
    if (isEditModalOpen && selectedPartnerDetail) {
      setFormPartner({
        partnerCode: selectedPartnerDetail.partnerCode,
        name: selectedPartnerDetail.partnerName,
        countryId: String(selectedPartnerDetail.countryId),
        sectorId: String(selectedPartnerDetail.sectorId),
        status: String(selectedPartnerDetail.status),
        score: String(selectedPartnerDetail.score ?? ""),
        website: selectedPartnerDetail.website ?? "",
        notes: selectedPartnerDetail.notes ?? "",
      });
    }
  }, [isEditModalOpen, selectedPartnerDetail]);

  return (
    <div className="space-y-6 duration-500 animate-in fade-in">
      {/* Header Section */}
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div>
          <h1 className="font-title text-2xl font-black tracking-tight text-slate-900 uppercase">Đối tác & Nhà đầu tư</h1>
          <p className="mt-1 text-sm font-semibold text-slate-500">Quản lý quan hệ đối tác và tiềm năng đầu tư hệ thống.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSync}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-[11px] font-black uppercase tracking-widest text-slate-600 shadow-sm transition-all hover:bg-slate-50"
          >
            Đồng bộ CRM
          </button>
          <button
            onClick={() => {
                setFormPartner(emptyPartnerForm());
                setIsCreateModalOpen(true);
            }}
            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-[11px] font-black uppercase tracking-widest text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/95"
          >
            <Plus size={16} /> Thêm đối tác
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="group relative space-y-4 overflow-hidden rounded-xl bg-slate-950 p-6 text-white shadow-xl shadow-slate-950/10">
          <Globe size={60} className="absolute -bottom-4 -right-4 text-white opacity-10 transition-all duration-700 group-hover:scale-110" />
          <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 leading-none">Đối tác toàn cầu</h3>
          <p className="text-3xl font-black tracking-tighter leading-none mt-4">{meta?.total ?? 0}</p>
          <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mt-2 leading-none">Dữ liệu từ hệ thống IPA</p>
        </div>
        <div className="space-y-4 rounded-xl bg-white border border-slate-200 p-6 shadow-sm">
          <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 leading-none">Thị trường trọng điểm</h3>
          <p className="text-3xl font-black tracking-tighter text-slate-900 leading-none mt-4">Việt Nam</p>
          <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mt-2 leading-none">Tỉ lệ quan tâm cao nhất</p>
        </div>
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 leading-none">Trung bình đánh giá</h3>
          <div className="flex items-center gap-4 mt-4">
            <p className="text-3xl font-black tracking-tighter text-slate-900 leading-none">4.5</p>
            <div className="flex text-amber-500">
              {[1, 2, 3, 4, 5].map((i) => <Star key={i} fill="currentColor" size={14} />)}
            </div>
          </div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2 leading-none">Dựa trên 150+ phản hồi</p>
        </div>
      </div>

      {/* Filter Section */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="group relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              placeholder="Tìm tên đối tác, mã đối tác..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-[11px] font-bold outline-none transition-all focus:bg-white focus:border-primary/30 focus:ring-4 focus:ring-primary/5"
            />
          </div>
          <div className="flex items-center gap-4">
               <select 
                    value={statusFilter ?? ""} 
                    onChange={(e) => setStatusFilter(e.target.value ? Number(e.target.value) : undefined)}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-600 outline-none"
               >
                   <option value="">Tất cả trạng thái</option>
                   <option value="0">Lead</option>
                   <option value="1">Partner</option>
                   <option value="2">Active</option>
               </select>
          </div>
        </div>

        {/* Partners Grid */}
        {partnersQuery.isLoading ? (
            <div className="flex h-40 items-center justify-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">Đang tải dữ liệu...</div>
        ) : partnersQuery.isError ? (
          <div className="flex min-h-40 flex-col items-center justify-center gap-4 rounded-xl border border-rose-100 bg-rose-50 p-8 text-center">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-rose-600">Không tải được dữ liệu</p>
            <p className="max-w-md text-sm font-medium text-rose-700">{partnerErrorMessage}</p>
            <button
              onClick={() => partnersQuery.refetch()}
              className="rounded-lg bg-rose-600 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-rose-700"
            >
              Thử lại
            </button>
          </div>
        ) : partners.length === 0 ? (
          <div className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Chưa có đối tác nào</p>
            <p className="max-w-md text-sm text-slate-500">Tạo mới đối tác hoặc đồng bộ CRM để hiển thị dữ liệu trong danh sách này.</p>
          </div>
        ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {partners.map((partner) => (
                <div
                key={partner.id}
                className="group relative overflow-hidden rounded-xl border border-slate-100 bg-slate-50/30 p-5 transition-all hover:border-primary/30 hover:bg-white hover:shadow-xl hover:shadow-slate-200/40 active:scale-[0.99]"
                >
                <div className="mb-5 flex items-start justify-between">
                    <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg bg-white border border-slate-200 text-primary shadow-sm transition-all group-hover:bg-slate-950 group-hover:text-white group-hover:border-slate-950">
                        <Building2 size={24} />
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-slate-900 transition-colors group-hover:text-primary uppercase tracking-tight">{partner.name}</h4>
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-0.5 block">
                        {partner.partnerCode} • {partner.category} • {partner.country}
                        </span>
                    </div>
                    </div>
                    <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="rounded-lg p-2 text-slate-300 transition-all hover:bg-slate-50 hover:text-slate-600">
                        <MoreVertical size={16} />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handlePromoteStatus(partner)}>Tiến cấp trạng thái</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                            setSelectedPartnerId(partner.id);
                            setFormPartner({
                              ...emptyPartnerForm(),
                              name: partner.name,
                              status: String(getPartnerStatusValue(partner.status)),
                              score: String(partner.score),
                            });
                            setIsEditModalOpen(true);
                        }}>Chỉnh sửa</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                            onClick={() => {
                                setSelectedPartnerId(partner.id);
                                setIsDeleteModalOpen(true);
                            }}
                            className="text-red-500"
                        >
                            Xóa đối tác
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="mb-6 grid grid-cols-2 gap-2">
                    <div className="rounded-lg border border-slate-100 bg-white p-3 text-center shadow-sm">
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Đầu mối</p>
                    <p className="truncate text-xs font-black text-slate-900">{partner.representative}</p>
                    </div>
                    <div className="rounded-lg border border-slate-100 bg-white p-3 text-center shadow-sm flex flex-col justify-center items-center">
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Vị thế</p>
                    <span className={cn("inline-block rounded px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest", partner.status === "Active" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-primary/5 text-primary border border-primary/10")}>
                        {partner.status}
                    </span>
                    </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                    <div className="flex items-center gap-1.5">
                    <Star size={12} fill="#F59E0B" className="text-amber-500" />
                    <span className="text-[10px] font-black text-slate-900">{partner.score.toFixed(1)} / 5</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => contactMutation.mutate(partner.id)}
                            className="rounded-lg border border-slate-200 bg-white p-2 text-slate-400 shadow-sm transition-all hover:bg-slate-950 hover:text-white active:scale-90"
                        >
                            <Mail size={14} />
                        </button>
                        <button 
                          onClick={() => navigate(`/partners/${partner.id}`)}
                            className="flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-[9px] font-black uppercase tracking-widest text-white shadow-lg shadow-slate-950/20 transition-all hover:bg-slate-800 active:scale-95 leading-none"
                        >
                            CHI TIẾT <ExternalLink size={12} />
                        </button>
                    </div>
                </div>
                </div>
            ))}
            </div>
        )}

        {/* Pagination placeholder */}
        {meta && meta.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
                 <button 
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="rounded-md border border-slate-200 px-3 py-1 text-[10px] font-bold uppercase transition-all hover:bg-slate-50 disabled:opacity-30"
                 >
                     Trước
                 </button>
                 <span className="text-[10px] font-black uppercase text-slate-400">Trang {page} / {meta.totalPages}</span>
                 <button 
                    disabled={page === meta.totalPages}
                    onClick={() => setPage(p => p + 1)}
                    className="rounded-md border border-slate-200 px-3 py-1 text-[10px] font-bold uppercase transition-all hover:bg-slate-50 disabled:opacity-30"
                 >
                     Sau
                 </button>
            </div>
        )}
      </div>

      {/* CRUD Modals */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Thêm đối tác mới</DialogTitle>
                  <DialogDescription>Nhập thông tin cơ bản để khởi tạo hồ sơ đối tác.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateSubmit} className="space-y-4 py-4">
               <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                 <div className="space-y-2">
                   <Label>Mã đối tác</Label>
                   <Input
                    required
                    value={formPartner.partnerCode}
                    placeholder="VD: SAMSUNG_VN"
                    onChange={(e) => setFormPartner({ ...formPartner, partnerCode: e.target.value })}
                   />
                 </div>
                 <div className="space-y-2">
                   <Label>Tên đối tác</Label>
                   <Input
                    required
                    value={formPartner.name}
                    placeholder="VD: Samsung Vina"
                    onChange={(e) => setFormPartner({ ...formPartner, name: e.target.value })}
                   />
                 </div>
                 <div className="space-y-2">
                   <Label>Quốc gia</Label>
                   <select
                    required
                    value={formPartner.countryId}
                    onChange={(e) => setFormPartner({ ...formPartner, countryId: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                   >
                    <option value="">Chọn quốc gia</option>
                    {options.countries.map((country) => (
                      <option key={country.id} value={country.id}>{country.label}</option>
                    ))}
                   </select>
                 </div>
                 <div className="space-y-2">
                   <Label>Lĩnh vực</Label>
                   <select
                    required
                    value={formPartner.sectorId}
                    onChange={(e) => setFormPartner({ ...formPartner, sectorId: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                   >
                    <option value="">Chọn lĩnh vực</option>
                    {options.sectors.map((sector) => (
                      <option key={sector.id} value={sector.id}>{sector.label}</option>
                    ))}
                   </select>
                 </div>
                 <div className="space-y-2">
                   <Label>Trạng thái</Label>
                   <select
                    value={formPartner.status}
                    onChange={(e) => setFormPartner({ ...formPartner, status: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                   >
                    <option value="0">Lead</option>
                    <option value="1">Partner</option>
                    <option value="2">Active</option>
                   </select>
                 </div>
                 <div className="space-y-2">
                   <Label>Website</Label>
                   <Input
                    value={formPartner.website}
                    placeholder="https://example.com"
                    onChange={(e) => setFormPartner({ ...formPartner, website: e.target.value })}
                   />
                 </div>
               </div>
               <div className="space-y-2">
                 <Label>Ghi chú</Label>
                 <textarea
                  value={formPartner.notes}
                  onChange={(e) => setFormPartner({ ...formPartner, notes: e.target.value })}
                  className="min-h-28 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                  placeholder="Thông tin ghi chú, điều kiện hợp tác, ưu tiên liên hệ..."
                 />
               </div>
                   <DialogFooter>
                 <button type="submit" disabled={createMutation.isPending || optionsQuery.isLoading} className="rounded-lg bg-primary px-6 py-2 text-xs font-black uppercase text-white hover:bg-primary/90 disabled:opacity-50">Tạo hồ sơ</button>
                   </DialogFooter>
              </form>
          </DialogContent>
      </Dialog>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Chỉnh sửa đối tác</DialogTitle>
                  <DialogDescription>Cập nhật thông tin định danh của đối tác.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUpdateSubmit} className="space-y-4 py-4">
               <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                 <div className="space-y-2">
                   <Label>Mã đối tác</Label>
                   <Input
                    value={formPartner.partnerCode}
                    onChange={(e) => setFormPartner({ ...formPartner, partnerCode: e.target.value })}
                   />
                 </div>
                 <div className="space-y-2">
                   <Label>Tên đối tác</Label>
                   <Input
                    value={formPartner.name}
                    onChange={(e) => setFormPartner({ ...formPartner, name: e.target.value })}
                   />
                 </div>
                 <div className="space-y-2">
                   <Label>Quốc gia</Label>
                   <select
                    value={formPartner.countryId}
                    onChange={(e) => setFormPartner({ ...formPartner, countryId: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                   >
                    <option value="">Chọn quốc gia</option>
                    {options.countries.map((country) => (
                      <option key={country.id} value={country.id}>{country.label}</option>
                    ))}
                   </select>
                 </div>
                 <div className="space-y-2">
                   <Label>Lĩnh vực</Label>
                   <select
                    value={formPartner.sectorId}
                    onChange={(e) => setFormPartner({ ...formPartner, sectorId: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                   >
                    <option value="">Chọn lĩnh vực</option>
                    {options.sectors.map((sector) => (
                      <option key={sector.id} value={sector.id}>{sector.label}</option>
                    ))}
                   </select>
                 </div>
                 <div className="space-y-2">
                   <Label>Trạng thái</Label>
                   <select
                    value={formPartner.status}
                    onChange={(e) => setFormPartner({ ...formPartner, status: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                   >
                    <option value="0">Lead</option>
                    <option value="1">Partner</option>
                    <option value="2">Active</option>
                   </select>
                 </div>
                 <div className="space-y-2">
                   <Label>Điểm đánh giá</Label>
                   <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={formPartner.score}
                    onChange={(e) => setFormPartner({ ...formPartner, score: e.target.value })}
                   />
                 </div>
                 <div className="space-y-2">
                   <Label>Website</Label>
                   <Input
                    value={formPartner.website}
                    onChange={(e) => setFormPartner({ ...formPartner, website: e.target.value })}
                   />
                 </div>
               </div>
               <div className="space-y-2">
                 <Label>Ghi chú</Label>
                 <textarea
                  value={formPartner.notes}
                  onChange={(e) => setFormPartner({ ...formPartner, notes: e.target.value })}
                  className="min-h-28 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                 />
               </div>
                   <DialogFooter>
                 <button type="submit" disabled={updateMutation.isPending || optionsQuery.isLoading} className="rounded-lg bg-primary px-6 py-2 text-xs font-black uppercase text-white hover:bg-primary/90 disabled:opacity-50">Cập nhật</button>
                   </DialogFooter>
              </form>
          </DialogContent>
      </Dialog>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle className="text-red-600">Xác nhận xóa</DialogTitle>
                  <DialogDescription>Bạn có chắc chắn muốn xóa đối tác này? Hành động này sẽ thực hiện soft-delete.</DialogDescription>
              </DialogHeader>
              <div className="bg-red-50 p-4 rounded-lg border border-red-100 mb-4">
                  <p className="text-xs font-bold text-red-800">Cảnh báo: Hồ sơ sẽ không còn xuất hiện trong danh sách chính thức.</p>
              </div>
              <DialogFooter>
                   <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-400">Hủy</button>
                   <button onClick={handleDeleteConfirm} disabled={deleteMutation.isPending} className="rounded-lg bg-red-600 px-6 py-2 text-xs font-black uppercase text-white hover:bg-red-700 disabled:opacity-50">Xóa vĩnh viễn</button>
              </DialogFooter>
          </DialogContent>
      </Dialog>

      <Dialog open={isDetailModalOpen} onOpenChange={(open) => {
        setIsDetailModalOpen(open);
        if (!open) {
          setSelectedPartnerId(null);
        }
      }}>
        <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết đối tác</DialogTitle>
            <DialogDescription>Xem hồ sơ, liên hệ và các thông tin vận hành liên quan.</DialogDescription>
          </DialogHeader>

          {partnerDetailQuery.isLoading ? (
            <div className="flex h-40 items-center justify-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">Đang tải chi tiết...</div>
          ) : partnerDetailQuery.isError ? (
            <div className="rounded-xl border border-rose-100 bg-rose-50 p-6 text-sm text-rose-700">
              Không thể tải chi tiết đối tác.
            </div>
          ) : selectedPartnerDetail ? (
            <div className="space-y-6 py-2">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tên đối tác</p>
                  <p className="mt-2 text-sm font-black text-slate-900">{selectedPartnerDetail.partnerName}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mã đối tác</p>
                  <p className="mt-2 text-sm font-black text-slate-900">{selectedPartnerDetail.partnerCode}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Quốc gia</p>
                  <p className="mt-2 text-sm font-bold text-slate-900">{selectedPartnerDetail.countryName || "N/A"}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Lĩnh vực</p>
                  <p className="mt-2 text-sm font-bold text-slate-900">{selectedPartnerDetail.sectorName || "N/A"}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Trạng thái</p>
                  <p className="mt-2 text-sm font-black uppercase text-slate-900">{mapPartnerStatus(selectedPartnerDetail.status)}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Điểm đánh giá</p>
                  <p className="mt-2 text-sm font-black text-slate-900">{Number(selectedPartnerDetail.score ?? 0).toFixed(1)} / 5</p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Website</p>
                <p className="mt-2 break-all text-sm text-slate-900">{selectedPartnerDetail.website || "Chưa cập nhật"}</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ghi chú</p>
                <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{selectedPartnerDetail.notes || "Chưa có ghi chú."}</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Liên hệ</p>
                <div className="mt-3 space-y-3">
                  {(selectedPartnerDetail.contacts ?? []).length === 0 ? (
                    <p className="text-sm text-slate-500">Chưa có đầu mối liên hệ.</p>
                  ) : (
                    selectedPartnerDetail.contacts!.map((contact) => (
                      <div key={contact.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-black text-slate-900">{contact.fullName}</p>
                            <p className="text-xs text-slate-500">{contact.title || "Chưa có chức danh"}</p>
                          </div>
                          {contact.isPrimary && (
                            <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-600">Chính</span>
                          )}
                        </div>
                        <div className="mt-3 grid gap-2 text-xs text-slate-600 md:grid-cols-2">
                          <p>Email: {contact.email || "N/A"}</p>
                          <p>Điện thoại: {contact.phone || "N/A"}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tương tác gần đây</p>
                <div className="mt-3 space-y-3">
                  {(selectedPartnerDetail.recentInteractions ?? []).length === 0 ? (
                    <p className="text-sm text-slate-500">Chưa có lịch sử tương tác.</p>
                  ) : (
                    selectedPartnerDetail.recentInteractions!.map((interaction) => (
                      <div key={interaction.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-black text-slate-900">Loại {interaction.interactionType}</p>
                          <p className="text-xs text-slate-400">{interaction.interactionAt || "N/A"}</p>
                        </div>
                        <p className="mt-2 text-sm text-slate-600">{interaction.summary || "Không có mô tả."}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
