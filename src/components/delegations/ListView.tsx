import { useState } from "react";
import { DelegationItem } from "@/dataHelper/ui-system.data";
import { useNavigate } from "react-router-dom";
import { ChevronRight, ArrowUpDown, Eye, Edit2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { parse } from "date-fns";
import { toast } from "sonner";
import { CountryFlag } from "@/components/ui/CountryFlag";

/**
 * Props for the ListView component.
 */
interface ListViewProps {
    delegations: DelegationItem[];
    onDelete?: (id: string | number) => Promise<void> | void;
    role?: string;
}

/**
 * Theme and localized labels for delegation statuses.
 */
const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  draft: { bg: "bg-brand-dark/[0.04]", text: "text-brand-text-dark/60", label: "Nháp" },
  pendingApproval: { bg: "bg-amber-100", text: "text-amber-700", label: "Chờ phê duyệt" },
  needsRevision: { bg: "bg-orange-100", text: "text-orange-700", label: "Cần bổ sung" },
  approved: { bg: "bg-blue-100", text: "text-blue-700", label: "Đã phê duyệt" },
  inProgress: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Đang thực hiện" },
  completed: { bg: "bg-teal-100", text: "text-teal-800", label: "Hoàn thành" },
  cancelled: { bg: "bg-rose-100", text: "text-rose-700", label: "Đã hủy" },
};

/**
 * A tabular view for displaying delegations with sorting, pagination, 
 * and row-level actions (view, edit, delete).
 */
export default function ListView({ delegations, onDelete, role }: ListViewProps) {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: keyof DelegationItem | null; direction: "asc" | "desc" }>({ key: null, direction: "asc" });
  const itemsPerPage = 8;

  const sortedDelegations = [...delegations].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const directionFactor = sortConfig.direction === "asc" ? 1 : -1;

    if (sortConfig.key === "startDate" || sortConfig.key === "endDate") {
      const aTime = parse(String(a[sortConfig.key]), "dd/MM/yyyy", new Date()).getTime();
      const bTime = parse(String(b[sortConfig.key]), "dd/MM/yyyy", new Date()).getTime();
      return (aTime - bTime) * directionFactor;
    }

    const aValue = String(a[sortConfig.key] ?? "");
    const bValue = String(b[sortConfig.key] ?? "");

    if (aValue < bValue) return -1 * directionFactor;
    if (aValue > bValue) return 1 * directionFactor;
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(sortedDelegations.length / itemsPerPage));
  const normalizedPage = Math.min(currentPage, totalPages);
  const paginatedItems = sortedDelegations.slice((normalizedPage - 1) * itemsPerPage, normalizedPage * itemsPerPage);

  const handleSort = (key: keyof DelegationItem) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
    setCurrentPage(1);
  };

  const handleView = (e: React.MouseEvent<HTMLButtonElement>, id: string | number) => {
    e.stopPropagation();
    navigate(`/delegations/${id}`);
  };

  const handleEdit = (e: React.MouseEvent<HTMLButtonElement>, item: DelegationItem) => {
    e.stopPropagation();
    navigate(`/delegations/${item.id}/edit`);
    toast.info(`Đang mở trình chỉnh sửa: ${item.name}`);
  };

  const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>, item: DelegationItem) => {
    e.stopPropagation();
    if (!onDelete) {
      toast.error("Hiện không thể xóa mục này.");
      return;
    }

    try {
      await onDelete(item.id);
    } catch {
      toast.error("Không thể xóa hồ sơ đoàn công tác.");
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-brand-dark/10 bg-white shadow-sm duration-500 animate-in fade-in zoom-in-95">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-brand-dark/10 bg-brand-dark/[0.02]">
              <th 
                className="px-6 py-3.5 text-[10px] font-black uppercase tracking-widest text-brand-text-dark/40"
                onClick={() => handleSort("code")}
              >
                <div className="flex cursor-pointer items-center gap-1 transition-colors hover:text-brand-text-dark">
                  Mã <ArrowUpDown size={10} className={cn(sortConfig.key === "code" && "text-primary")} />
                </div>
              </th>
              <th 
                className="px-6 py-3.5 text-[10px] font-black uppercase tracking-widest text-brand-text-dark/40"
                onClick={() => handleSort("name")}
              >
                <div className="flex cursor-pointer items-center gap-1 transition-colors hover:text-brand-text-dark">
                  Sự kiện / Đoàn công tác <ArrowUpDown size={10} className={cn(sortConfig.key === "name" && "text-primary")} />
                </div>
              </th>
              <th className="px-6 py-3.5 text-[10px] font-black uppercase tracking-widest text-brand-text-dark/40">Quốc gia</th>
              <th 
                className="px-6 py-3.5 text-[10px] font-black uppercase tracking-widest text-brand-text-dark/40"
                onClick={() => handleSort("startDate")}
              >
                <div className="flex cursor-pointer items-center gap-1 transition-colors hover:text-brand-text-dark">
                  Thời gian <ArrowUpDown size={10} className={cn(sortConfig.key === "startDate" && "text-primary")} />
                </div>
              </th>
              <th className="px-6 py-3.5 text-[10px] font-black uppercase tracking-widest text-brand-text-dark/40">Trạng thái</th>
              <th className="px-6 py-3.5 text-[10px] font-black uppercase tracking-widest text-brand-text-dark/40">Cán bộ</th>
              <th className="px-6 py-3.5 text-right text-[10px] font-black uppercase tracking-widest text-brand-text-dark/40">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-dark/5">
            {paginatedItems.map((item) => (
              <tr key={item.id} className="group cursor-pointer transition-all hover:bg-brand-dark/[0.02]" onClick={() => navigate(`/delegations/${item.id}`)}>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className="rounded-md border border-brand-dark/10 bg-brand-dark/[0.04] px-2 py-0.5 font-mono text-[10px] font-bold text-brand-text-dark/60 transition-colors group-hover:bg-white">{item.code}</span>
                </td>
                <td className="px-6 py-4">
                  <p className="line-clamp-1 text-xs font-black uppercase leading-tight tracking-tight text-brand-text-dark transition-colors group-hover:text-primary">{item.name}</p>
                  <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-brand-text-dark/40">{item.partnerOrg}</p>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex items-center gap-2">
                    <CountryFlag countryName={item.country} />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-brand-text-dark/60">{item.country}</span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="text-[11px] font-bold text-brand-text-dark/60">
                    {item.startDate}
                    <span className="mx-1 text-brand-text-dark/20">-</span>
                    {item.endDate}
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className={cn("rounded px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border", statusColors[item.status]?.bg, statusColors[item.status]?.text, "border-current/10")}>
                    {statusColors[item.status]?.label}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex -space-x-1.5">
                    <div className="size-7 overflow-hidden rounded-full border-2 border-white bg-brand-dark/10">
                      <img
                        src={item.staff.avatar}
                        alt={item.staff.name}
                        className="size-full object-cover"
                        onError={(event) => {
                          event.currentTarget.src = `https://i.pravatar.cc/150?u=${encodeURIComponent(item.staff.name || String(item.id))}`;
                        }}
                      />
                    </div>
                    <div className="flex size-7 items-center justify-center rounded-full border-2 border-white bg-brand-dark/[0.04] text-[9px] font-black text-brand-text-dark/40">+2</div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right">
                  <div className="flex scale-95 items-center justify-end gap-1 opacity-0 transition-all group-hover:scale-100 group-hover:opacity-100">
                    <button onClick={(e) => handleView(e, item.id)} className="rounded-lg p-2 text-brand-text-dark/40 transition-all hover:bg-brand-dark/[0.04] hover:text-brand-text-dark" title="Xem chi tiết">
                      <Eye size={14} />
                    </button>
                    {role !== "manager" && !(role === "staff" && item.status === "pendingApproval") && (
                      <button onClick={(e) => handleEdit(e, item)} className="rounded-lg p-2 text-brand-text-dark/40 transition-all hover:bg-brand-dark/[0.04] hover:text-brand-text-dark" title="Chỉnh sửa đoàn công tác">
                        <Edit2 size={14} />
                      </button>
                    )}
                    <button onClick={(e) => handleDelete(e, item)} className="rounded-lg p-2 text-brand-text-dark/40 transition-all hover:bg-rose-50 hover:text-rose-600" title="Xóa hồ sơ">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between border-t border-brand-dark/10 bg-brand-dark/[0.02] px-6 py-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-brand-text-dark/40">
          HIỂN THỊ{" "}
          <span className="text-brand-text-dark">
            {sortedDelegations.length === 0 ? "0 - 0" : `${(normalizedPage - 1) * itemsPerPage + 1} - ${Math.min(normalizedPage * itemsPerPage, sortedDelegations.length)}`}
          </span>{" "}
          TRÊN <span className="text-brand-text-dark">{sortedDelegations.length}</span> KẾT QUẢ
        </p>

        <div className="flex items-center gap-1">
          <button disabled={normalizedPage === 1} onClick={() => setCurrentPage((prev) => prev - 1)} title="Trang trước" aria-label="Trang trước" className="p-2 text-brand-text-dark/40 transition-colors hover:text-primary disabled:opacity-30">
            <ChevronRight size={16} className="rotate-180" />
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={cn("h-7 w-7 rounded-md text-[10px] font-black transition-all", normalizedPage === i + 1 ? "bg-primary text-white shadow-sm shadow-primary/20" : "text-brand-text-dark/40 hover:bg-brand-dark/[0.04]")}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button disabled={normalizedPage === totalPages} onClick={() => setCurrentPage((prev) => prev + 1)} title="Trang sau" aria-label="Trang sau" className="p-2 text-brand-text-dark/40 transition-colors hover:text-primary disabled:opacity-30">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
