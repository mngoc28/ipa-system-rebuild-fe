import * as React from "react";
import { Plus, Search, Filter, Globe, Mail, Building2, MoreVertical, Star, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
export default function PartnerListPage() {
  const [showActiveOnly, setShowActiveOnly] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedPartnerId, setSelectedPartnerId] = React.useState<number | null>(null);
  const [pinnedPartnerIds, setPinnedPartnerIds] = React.useState<number[]>([]);
  const [emailedPartnerIds, setEmailedPartnerIds] = React.useState<number[]>([]);
  const [partners, setPartners] = React.useState([
    { id: 1, name: "Samsung Electronics", category: "Công nghệ cao", country: "Hàn Quốc", representative: "Lee Jae-yong", score: 4.9, status: "Active", projects: 5 },
    { id: 2, name: "Sumitomo Mitsui", category: "Tài chính / NH", country: "Nhật Bản", representative: "Akio Toyoda", score: 4.7, status: "Lead", projects: 2 },
    { id: 3, name: "Intel Vietnam", category: "Bán dẫn", country: "Hoa Kỳ", representative: "Brian Krzanich", score: 4.8, status: "Active", projects: 8 },
    { id: 4, name: "Tập đoàn BRG", category: "Bất động sản", country: "Việt Nam", representative: "Nguyễn Thị Nga", score: 4.5, status: "Partner", projects: 12 },
  ]);

  const handleSync = () => {
    setPartners((prev) => prev.map((item) => ({ ...item, score: Math.min(5, Number((item.score + 0.1).toFixed(1))) })));
    toast.success("Đã đồng bộ dữ liệu CRM và cập nhật điểm đánh giá.");
  };

  const handleAddPartner = () => {
    const newPartner = {
      id: Date.now(),
      name: `Đối tác mới #${partners.length + 1}`,
      category: "Công nghệ",
      country: "Hàn Quốc",
      representative: "Đang cập nhật",
      score: 4.6,
      status: "Lead",
      projects: 0,
    };
    setPartners([newPartner, ...partners]);
    toast.success("Đã thêm đối tác mới vào danh sách.");
  };

  const handlePromoteStatus = (id: number) => {
    setPartners(
      partners.map((partner) => {
        if (partner.id !== id) return partner;
        if (partner.status === "Lead") return { ...partner, status: "Partner" };
        if (partner.status === "Partner") return { ...partner, status: "Active" };
        return partner;
      }),
    );
    toast.success("Đã cập nhật trạng thái đối tác.");
  };

  const handlePinPartner = (id: number) => {
    if (pinnedPartnerIds.includes(id)) {
      setPinnedPartnerIds(pinnedPartnerIds.filter((partnerId) => partnerId !== id));
      toast.info("Đã bỏ ghim đối tác.");
      return;
    }
    setPinnedPartnerIds([...pinnedPartnerIds, id]);
    toast.success("Đã ghim đối tác.");
  };

  const handleQuickMail = (id: number) => {
    if (!emailedPartnerIds.includes(id)) {
      setEmailedPartnerIds([...emailedPartnerIds, id]);
    }
    toast.success("Đã tạo email nháp gửi đối tác.");
  };

  const visiblePartners = partners.filter((partner) => {
    const byStatus = showActiveOnly ? partner.status === "Active" : true;
    const keyword = searchTerm.trim().toLowerCase();
    const bySearch = keyword
      ? partner.name.toLowerCase().includes(keyword) || partner.category.toLowerCase().includes(keyword) || partner.country.toLowerCase().includes(keyword) || partner.representative.toLowerCase().includes(keyword)
      : true;
    return byStatus && bySearch;
  });
  const selectedPartner = partners.find((partner) => partner.id === selectedPartnerId) ?? null;
  return (
    <div className="space-y-6 duration-500 animate-in fade-in">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div>
          <h1 className="font-title text-2xl font-black tracking-tight text-slate-900 uppercase">CRM Đối tác & Nhà đầu tư</h1>
          <p className="mt-1 text-sm font-semibold text-slate-500">Quản lý quan hệ đối tác, theo dõi lịch sử làm việc và tiềm năng đầu tư.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSync}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-[11px] font-black uppercase tracking-widest text-slate-600 shadow-sm transition-all hover:bg-slate-50"
          >
            Đồng bộ dữ liệu
          </button>
          <button
            onClick={handleAddPartner}
            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-[11px] font-black uppercase tracking-widest text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/95"
          >
            <Plus size={16} /> Thêm đối tác mới
          </button>
        </div>
      </div>

      {/* Highlights */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="group relative space-y-4 overflow-hidden rounded-xl bg-slate-950 p-6 text-white shadow-xl shadow-slate-950/10">
          <Globe size={60} className="absolute -bottom-4 -right-4 text-white opacity-10 transition-all duration-700 group-hover:scale-110" />
          <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 leading-none">Tỉ lệ nhà đầu tư theo quốc gia</h3>
          <p className="text-3xl font-black tracking-tighter leading-none mt-4">Hàn Quốc (15%)</p>
          <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mt-2 leading-none">Xếp hạng cao nhất năm 2026</p>
        </div>
        <div className="space-y-4 rounded-xl bg-white border border-slate-200 p-6 shadow-sm">
          <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 leading-none">Đối tác chiến lược mới</h3>
          <p className="text-3xl font-black tracking-tighter text-slate-900 leading-none mt-4">24</p>
          <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mt-2 leading-none">+12% so với tháng trước</p>
        </div>
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 leading-none">Chỉ số hài lòng (CSAT)</h3>
          <div className="flex items-center gap-4 mt-4">
            <p className="text-3xl font-black tracking-tighter text-slate-900 leading-none">4.8</p>
            <div className="flex text-amber-500">
              <Star fill="currentColor" size={14} /> 
              <Star fill="currentColor" size={14} /> 
              <Star fill="currentColor" size={14} /> 
              <Star fill="currentColor" size={14} /> 
              <Star fill="currentColor" size={14} />
            </div>
          </div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2 leading-none">Dựa trên 120 đánh giá đoàn công tác</p>
        </div>
      </div>

      {/* Grid of Partners */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="group relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              placeholder="Tìm tên công ty, lĩnh vực..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-[11px] font-bold outline-none transition-all focus:bg-white focus:border-primary/30 focus:ring-4 focus:ring-primary/5"
            />
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setShowActiveOnly((prev) => !prev)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 transition-all hover:text-primary">
              <Filter size={16} /> Bộ lọc
            </button>
          </div>
        </div>

        {showActiveOnly && <p className="mb-4 text-[10px] font-black uppercase tracking-widest text-primary">Đang hiển thị đối tác trạng thái Active.</p>}

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {visiblePartners.map((partner) => (
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
                      {partner.category} &bull; {partner.country}
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
                    <DropdownMenuItem onClick={() => handlePromoteStatus(partner.id)}>Nâng trạng thái</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handlePinPartner(partner.id)}>{pinnedPartnerIds.includes(partner.id) ? "Bỏ ghim đối tác" : "Ghim đối tác"}</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="mb-6 grid grid-cols-3 gap-2">
                <div className="rounded-lg border border-slate-100 bg-white p-3 text-center shadow-sm">
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Dự án</p> 
                  <p className="text-xs font-black text-slate-900">{partner.projects}</p>
                </div>
                <div className="rounded-lg border border-slate-100 bg-white p-3 text-center shadow-sm">
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Liên hệ</p> 
                  <p className="truncate text-[9px] font-black uppercase text-slate-700 tracking-tight">{partner.representative}</p>
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
                  <span className="text-[10px] font-black text-slate-900">{partner.score} / 5</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleQuickMail(partner.id)}
                    className={cn(
                      "rounded-lg border border-slate-200 bg-white p-2 shadow-sm transition-all active:scale-90",
                      emailedPartnerIds.includes(partner.id) ? "text-emerald-600 border-emerald-200 bg-emerald-50 hover:bg-emerald-100" : "text-slate-400 hover:bg-slate-950 hover:text-white",
                    )}
                  >
                    <Mail size={14} />
                  </button>
                  <button onClick={() => setSelectedPartnerId(partner.id)} className="flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-[9px] font-black uppercase tracking-widest text-white shadow-lg shadow-slate-950/20 transition-all hover:bg-slate-800 active:scale-95 leading-none">
                    HỒ SƠ GỐC <ExternalLink size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={selectedPartner !== null} onOpenChange={(open) => !open && setSelectedPartnerId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedPartner?.name}</DialogTitle>
            <DialogDescription>Hồ sơ đối tác - thông tin cơ bản và trạng thái hợp tác hiện tại.</DialogDescription>
          </DialogHeader>
          {selectedPartner && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Quốc gia</p>
                <p className="mt-1 font-semibold text-slate-800">{selectedPartner.country}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Lĩnh vực</p>
                <p className="mt-1 font-semibold text-slate-800">{selectedPartner.category}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Liên hệ</p>
                <p className="mt-1 font-semibold text-slate-800">{selectedPartner.representative}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Trạng thái</p>
                <p className="mt-1 font-semibold text-slate-800">{selectedPartner.status}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
