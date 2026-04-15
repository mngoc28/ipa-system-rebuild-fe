import { useState, useMemo } from "react";
import { Plus, Search, Filter, LayoutGrid, List, ChevronDown, Download, Trash2, Edit } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useDelegationsQuery } from "@/hooks/useDelegationsQuery";
import { mapDelegationStatus, mapDelegationPriority } from "@/dataHelper/delegations.dataHelper";
import { format } from "date-fns";
import KanbanBoard from "@/components/delegations/KanbanBoard";
import ListView from "@/components/delegations/ListView";

interface SharedDelegationListProps {
  role: "admin" | "director" | "manager" | "staff";
}

export default function SharedDelegationList({ role }: SharedDelegationListProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"inbound" | "outbound">("inbound");
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { delegationsQuery, deleteMutation } = useDelegationsQuery({
    direction: activeTab === "inbound" ? 1 : 2,
    search: searchTerm,
  });

  const delegations = delegationsQuery.data?.data?.items || [];
  const errorMessage = delegationsQuery.error instanceof Error ? delegationsQuery.error.message : "Không thể tải danh sách đoàn công tác.";

  // Map to UI-friendly format
  const uiDelegations = useMemo(() => {
    return delegations.map((item) => ({
      id: item.id,
      code: item.code,
      name: item.name,
      country: "N/A", // This would normally come from country_id join
      partnerOrg: item.objective || "N/A",
      hostUnit: "IPA",
      type: item.direction === 1 ? "inbound" : "outbound",
      priority: mapDelegationPriority(item.priority).toLowerCase(),
      startDate: format(new Date(item.start_date), "dd/MM/yyyy"),
      endDate: format(new Date(item.end_date), "dd/MM/yyyy"),
      status: mapDelegationStatus(item.status),
      participants: item.participant_count,
      description: item.description,
      staff: { name: "N/A" },
      actionItems: { total: 0, overdue: 0 },
    }));
  }, [delegations]);

  const handleExport = () => {
    toast.success("Đã bắt đầu xuất dữ liệu đoàn công tác.");
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa hồ sơ đoàn này?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6 duration-500 animate-in fade-in">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <nav className="mb-2 flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 text-xs font-medium text-slate-500">
              <li>
                <button onClick={() => navigate("/dashboard")} className="transition-colors hover:text-primary">
                  Hệ thống
                </button>
              </li>
              <li className="flex items-center space-x-2">
                <ChevronDown size={12} className="-rotate-90" />
                <span className="text-slate-900">Quản lý Đoàn</span>
              </li>
            </ol>
          </nav>
          <h1 className="font-title text-2xl font-black text-slate-900">Quản lý Đoàn Công tác</h1>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={handleExport} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[11px] font-black uppercase tracking-wider text-slate-700 shadow-sm transition-all hover:bg-slate-50">
            <Download size={14} />
            Xuất dữ liệu
          </button>
          <button
            onClick={() => navigate(`/${role}/delegations/create`)}
            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-[11px] font-black uppercase tracking-wider text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/95"
          >
            <Plus size={16} />
            Tạo đoàn mới
          </button>
        </div>
      </div>

      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 sm:flex-row sm:items-center">
        <div className="flex gap-8">
          <button onClick={() => setActiveTab("inbound")} className={cn("relative pb-4 text-sm font-bold transition-all", activeTab === "inbound" ? "text-primary" : "text-slate-500 hover:text-slate-700")}>
            Đoàn đến (Inbound)
            {activeTab === "inbound" && <div className="absolute bottom-0 left-0 right-0 h-1 rounded-t-full bg-primary" />}
          </button>
          <button onClick={() => setActiveTab("outbound")} className={cn("relative pb-4 text-sm font-bold transition-all", activeTab === "outbound" ? "text-primary" : "text-slate-500 hover:text-slate-700")}>
            Đoàn đi (Outbound)
            {activeTab === "outbound" && <div className="absolute bottom-0 left-0 right-0 h-1 rounded-t-full bg-primary" />}
          </button>
        </div>

        <div className="mb-3 flex items-center gap-1 rounded-lg bg-slate-100 p-1 sm:mb-0">
          <button
            onClick={() => setViewMode("kanban")}
            className={cn("flex items-center gap-2 rounded-md px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition-all", viewMode === "kanban" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700")}
          >
            <LayoutGrid size={12} />
            Kanban
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={cn("flex items-center gap-2 rounded-md px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition-all", viewMode === "list" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700")}
          >
            <List size={12} />
            Danh sách
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <div className="group relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-primary" size={16} />
          <input
            type="text"
            placeholder="Tìm kiếm đoàn công tác theo tên, mã..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-xs font-medium outline-none transition-all focus:border-primary/50 focus:ring-4 focus:ring-primary/5 shadow-sm"
          />
        </div>
      </div>

      <div className="min-h-[600px]">
        {delegationsQuery.isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : delegationsQuery.isError ? (
          <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-xl border border-rose-100 bg-rose-50 p-8 text-center">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-rose-600">Không tải được dữ liệu</p>
            <p className="max-w-md text-sm font-medium text-rose-700">{errorMessage}</p>
            <button
              onClick={() => delegationsQuery.refetch()}
              className="rounded-lg bg-rose-600 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-rose-700"
            >
              Thử lại
            </button>
          </div>
        ) : delegations.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Chưa có đoàn công tác nào</p>
            <p className="max-w-md text-sm text-slate-500">Tạo mới một hồ sơ đoàn công tác hoặc thay đổi bộ lọc để xem dữ liệu.</p>
          </div>
        ) : (
          viewMode === "kanban" ? <KanbanBoard delegations={uiDelegations as any} /> : <ListView delegations={uiDelegations as any} />
        )}
      </div>
    </div>
  );
}
