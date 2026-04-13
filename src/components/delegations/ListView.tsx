import { useState } from "react";
import { DelegationItem } from "@/dataHelper/ui-system.data";
import { useNavigate } from "react-router-dom";
import { ChevronRight, MoreVertical, ArrowUpDown, Eye, Edit2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ListViewProps {
  delegations: DelegationItem[];
}

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  draft: { bg: "bg-slate-100", text: "text-slate-600", label: "Bản nháp" },
  pendingApproval: { bg: "bg-amber-100", text: "text-amber-700", label: "Chờ duyệt" },
  needsRevision: { bg: "bg-orange-100", text: "text-orange-700", label: "Cần sửa" },
  approved: { bg: "bg-blue-100", text: "text-blue-700", label: "Đã duyệt" },
  inProgress: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Đang triển khai" },
  completed: { bg: "bg-teal-100", text: "text-teal-800", label: "Hoàn thành" },
  cancelled: { bg: "bg-rose-100", text: "text-rose-700", label: "Đã hủy" },
};

export default function ListView({ delegations }: ListViewProps) {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const totalPages = Math.ceil(delegations.length / itemsPerPage);
  const paginatedItems = delegations.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleView = (e: React.MouseEvent<HTMLButtonElement>, id: number) => {
    e.stopPropagation();
    navigate(`/delegations/${id}`);
  };

  const handleEdit = (e: React.MouseEvent<HTMLButtonElement>, item: DelegationItem) => {
    e.stopPropagation();
    toast.info(`Đang mở chỉnh sửa: ${item.name}`);
  };

  const handleDelete = (e: React.MouseEvent<HTMLButtonElement>, item: DelegationItem) => {
    e.stopPropagation();
    toast.error(`Đã đưa vào hàng chờ xóa: ${item.name}`);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm duration-500 animate-in fade-in zoom-in-95">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/50">
              <th className="px-6 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <div className="flex cursor-pointer items-center gap-1 transition-colors hover:text-slate-900">
                  Mã Đoàn <ArrowUpDown size={10} />
                </div>
              </th>
              <th className="px-6 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-400">Sự kiện / Đoàn công tác</th>
              <th className="px-6 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-400">Quốc gia</th>
              <th className="px-6 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-400">Thời gian</th>
              <th className="px-6 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-400">Trạng thái</th>
              <th className="px-6 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-400">Nhân sự</th>
              <th className="px-6 py-3.5 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedItems.map((item) => (
              <tr key={item.id} className="group cursor-pointer transition-all hover:bg-slate-50/50" onClick={() => navigate(`/delegations/${item.id}`)}>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className="rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-600 transition-colors group-hover:bg-white">{item.code}</span>
                </td>
                <td className="px-6 py-4">
                  <p className="line-clamp-1 text-xs font-black text-slate-900 transition-colors group-hover:text-primary uppercase tracking-tight">{item.name}</p>
                  <p className="mt-0.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.partnerOrg}</p>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{item.country === "Hàn Quốc" ? "🇰🇷" : item.country === "Singapore" ? "🇸🇬" : item.country === "Nhật Bản" ? "🇯🇵" : "🌐"}</span>
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">{item.country}</span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="text-[11px] font-bold text-slate-600">
                    {item.startDate}
                    <span className="mx-1 text-slate-300">-</span>
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
                    <div className="h-7 w-7 overflow-hidden rounded-full border-2 border-white bg-slate-200">
                      <img src={item.staff.avatar} alt={item.staff.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-[9px] font-black text-slate-400">+2</div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right">
                  <div className="flex scale-95 items-center justify-end gap-1 opacity-0 transition-all group-hover:scale-100 group-hover:opacity-100">
                    <button onClick={(e) => handleView(e, item.id)} className="rounded-lg p-2 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-900" title="Xem chi tiết">
                      <Eye size={14} />
                    </button>
                    <button onClick={(e) => handleEdit(e, item)} className="rounded-lg p-2 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-900" title="Chỉnh sửa">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={(e) => handleDelete(e, item)} className="rounded-lg p-2 text-slate-400 transition-all hover:bg-rose-50 hover:text-rose-600" title="Xóa">
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
      <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          HIỂN THỊ{" "}
          <span className="text-slate-900">
            {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, delegations.length)}
          </span>{" "}
          TRÊN <span className="text-slate-900">{delegations.length}</span> KẾT QUẢ
        </p>

        <div className="flex items-center gap-1">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage((prev) => prev - 1)} className="p-2 text-slate-400 transition-colors hover:text-primary disabled:opacity-30">
            <ChevronRight size={16} className="rotate-180" />
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={cn("h-7 w-7 rounded-md text-[10px] font-black transition-all", currentPage === i + 1 ? "bg-primary text-white shadow-sm shadow-primary/20" : "text-slate-400 hover:bg-slate-100")}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((prev) => prev + 1)} className="p-2 text-slate-400 transition-colors hover:text-primary disabled:opacity-30">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
