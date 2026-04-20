import { useState, useMemo } from "react";
import { Plus, Search, Filter, LayoutGrid, List, ChevronDown, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/dateUtils";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useDelegationsQuery } from "@/hooks/useDelegationsQuery";
import { mapDelegationStatus, mapDelegationPriority } from "@/dataHelper/delegations.dataHelper";
import type { DelegationItem } from "@/dataHelper/ui-system.data";

import KanbanBoard from "@/components/delegations/KanbanBoard";
import ListView from "@/components/delegations/ListView";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { masterDataApi } from "@/api/masterDataApi";
import { adminUsersApi } from "@/api/adminUsersApi";
import { useQuery } from "@tanstack/react-query";
import { SelectField } from "@/components/ui/SelectField";
import { RotateCcw, X } from "lucide-react";

interface SharedDelegationListProps {
  role: "admin" | "director" | "manager" | "staff";
}

type DelegationChecklistItem = { status: number };
type SelectOptionItem = { id: string | number; name_vi?: string; fullName?: string };

export default function SharedDelegationList({ role }: SharedDelegationListProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"inbound" | "outbound">("inbound");
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [staffFilter, setStaffFilter] = useState<string>("all");

  const { delegationsQuery, deleteMutation, updateMutation } = useDelegationsQuery({
    direction: activeTab === "inbound" ? 1 : 2,
    search: searchTerm,
    status: statusFilter !== "all" ? Number(statusFilter) : undefined,
    priority: priorityFilter !== "all" ? Number(priorityFilter) : undefined,
    country_id: countryFilter !== "all" ? Number(countryFilter) : undefined,
    owner_user_id: staffFilter !== "all" ? Number(staffFilter) : undefined,
  });

  const countriesQuery = useQuery({
    queryKey: ["master-data", "countries"],
    queryFn: () => masterDataApi.list("countries"),
    staleTime: 1000 * 60 * 30, // 30 mins
  });

  const usersQuery = useQuery({
    queryKey: ["admin", "users", { pageSize: 100 }],
    queryFn: () => adminUsersApi.list({ pageSize: 100 }),
    staleTime: 1000 * 60 * 10, // 10 mins
  });

  const countries = useMemo(() => countriesQuery.data?.data?.items || [], [countriesQuery.data]);
  const staffMembers = useMemo(() => usersQuery.data?.data?.items || [], [usersQuery.data]);

  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: number | string | null }>({
    isOpen: false,
    id: null,
  });

  const delegations = useMemo(() => delegationsQuery.data?.data?.items || [], [delegationsQuery.data]);
  const errorMessage = delegationsQuery.error instanceof Error ? delegationsQuery.error.message : "Không thể tải danh sách đoàn công tác.";
  void role;

  // Map to UI-friendly format
  const uiDelegations = useMemo<DelegationItem[]>(() => {
    return delegations.map((item) => {
      const checklistItems = (item.checklist ?? []) as DelegationChecklistItem[];
      const totalTasks = checklistItems.length;
      const overdueTasks = checklistItems.filter((t) => t.status === 0).length;
      
      return {
        id: item.id,
        code: item.code,
        name: item.name,
        country: item.country?.name_vi || "N/A",
        partnerOrg: item.objective || "N/A",
        hostUnit: "IPA",
        type: item.direction === 1 ? "inbound" : "outbound",
        priority: mapDelegationPriority(item.priority) as DelegationItem["priority"],
        startDate: formatDate(item.start_date),
        endDate: formatDate(item.end_date),
        status: mapDelegationStatus(item.status),
        participants: item.participant_count,
        description: item.description,
        staff: { 
          name: item.owner?.full_name || "N/A",
          avatar: item.owner?.avatar_url || `https://i.pravatar.cc/150?u=${item.owner_user_id}`
        },
        actionItems: { total: totalTasks, overdue: overdueTasks },
      };
    });
  }, [delegations]);

  const handleExport = () => {
    const headers = ["Mã Đoàn", "Tên Đoàn", "Quốc Gia", "Đối tác", "Ngày bắt đầu", "Ngày kết thúc", "Trạng thái", "Người phụ trách"];
    const rows = uiDelegations.map((item) => [
      item.code,
      item.name,
      item.country,
      item.partnerOrg,
      item.startDate,
      item.endDate,
      item.status,
      item.staff.name,
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Danh_sach_doan_${activeTab === "inbound" ? "den" : "di"}_${formatDate(new Date(), "YYYYMMDD")}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);

    toast.success("Đã xuất dữ liệu đoàn công tác (CSV).");
  };

  const handleDelete = (id: number | string) => {
    setDeleteConfirm({ isOpen: true, id });
  };

  const executeDelete = async () => {
    if (deleteConfirm.id) {
      try {
        await deleteMutation.mutateAsync(Number(deleteConfirm.id));
        setDeleteConfirm({ isOpen: false, id: null });
        toast.success("Đã xóa hồ sơ đoàn công tác.");
      } catch {
        toast.error("Không thể xóa hồ sơ đoàn. Vui lòng thử lại.");
      }
    }
  };

  const handleUpdateStatus = (id: number | string, status: string) => {
    // Reverse status mapping if needed, but here we expect the component to handle status as string
    // Assuming we update based on current state. In a real app, status might be an ID.
    const statusMap: Record<string, number> = {
      draft: 0,
      pendingApproval: 1,
      needsRevision: 2,
      approved: 3,
      inProgress: 4,
      completed: 5,
      cancelled: 6
    };

    if (statusMap[status]) {
      updateMutation.mutate({ id, data: { status: statusMap[status] } });
    }
  };

  const handleResetFilters = () => {
    setStatusFilter("all");
    setPriorityFilter("all");
    setCountryFilter("all");
    setStaffFilter("all");
    setSearchTerm("");
  };

  const hasActiveFilters = statusFilter !== "all" || priorityFilter !== "all" || countryFilter !== "all" || staffFilter !== "all" || searchTerm !== "";

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
            onClick={() => navigate(`/delegations/create`)}
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
            {activeTab === "inbound" && <div className="absolute inset-x-0 bottom-0 h-1 rounded-t-full bg-primary" />}
          </button>
          <button onClick={() => setActiveTab("outbound")} className={cn("relative pb-4 text-sm font-bold transition-all", activeTab === "outbound" ? "text-primary" : "text-slate-500 hover:text-slate-700")}>
            Đoàn đi (Outbound)
            {activeTab === "outbound" && <div className="absolute inset-x-0 bottom-0 h-1 rounded-t-full bg-primary" />}
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

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="group relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-primary" size={16} />
            <input
              type="text"
              placeholder="Tìm kiếm đoàn công tác theo tên, mã..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-xs font-medium shadow-sm outline-none transition-all focus:border-primary/50 focus:ring-4 focus:ring-primary/5"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={cn(
              "flex items-center gap-2 rounded-lg border px-4 py-2.5 text-[11px] font-black uppercase tracking-wider transition-all",
              isFilterOpen || hasActiveFilters 
                ? "border-primary/20 bg-primary/5 text-primary" 
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-sm"
            )}
          >
            <Filter size={14} />
            Bộ lọc
            {hasActiveFilters && (
              <span className="ml-1 flex size-4 items-center justify-center rounded-full bg-primary text-[8px] text-white">
                {Number(statusFilter !== "all") + Number(priorityFilter !== "all") + Number(countryFilter !== "all") + Number(staffFilter !== "all") + Number(searchTerm !== "")}
              </span>
            )}
          </button>
          
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[11px] font-black uppercase tracking-wider text-rose-600 transition-all hover:bg-rose-50"
            >
              <RotateCcw size={14} />
              Làm mới
            </button>
          )}
        </div>

        {/* Advanced Filters */}
        {isFilterOpen && (
          <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-100 bg-slate-50/50 p-4 animate-in slide-in-from-top-2 md:grid-cols-4">
            <div className="space-y-1.5">
              <label htmlFor="filter-status" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Trạng thái</label>
              <SelectField
                id="filter-status"
                value={statusFilter}
                onValueChange={setStatusFilter}
                options={[
                  { label: "Tất cả trạng thái", value: "all" },
                  { label: "Bản nháp", value: "0" },
                  { label: "Chờ phê duyệt", value: "1" },
                  { label: "Cần chỉnh sửa", value: "2" },
                  { label: "Đã phê duyệt", value: "3" },
                  { label: "Đang thực hiện", value: "4" },
                  { label: "Hoàn thành", value: "5" },
                  { label: "Đã hủy", value: "6" },
                ]}
                placeholder="Trạng thái"
                triggerClassName="bg-white py-2 px-3 text-xs font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="filter-priority" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mức độ ưu tiên</label>
              <SelectField
                id="filter-priority"
                value={priorityFilter}
                onValueChange={setPriorityFilter}
                options={[
                  { label: "Tất cả mức độ", value: "all" },
                  { label: "Thấp", value: "1" },
                  { label: "Trung bình", value: "2" },
                  { label: "Cao", value: "3" },
                ]}
                placeholder="Ưu tiên"
                triggerClassName="bg-white py-2 px-3 text-xs font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="filter-country" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Quốc gia</label>
              <SelectField
                id="filter-country"
                value={countryFilter}
                onValueChange={setCountryFilter}
                options={[
                  { label: "Tất cả quốc gia", value: "all" },
                  ...countries.map((c: SelectOptionItem & { name_vi: string }) => ({ label: c.name_vi, value: String(c.id) })),
                ]}
                placeholder="Quốc gia"
                triggerClassName="bg-white py-2 px-3 text-xs font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="filter-staff" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Người phụ trách</label>
              <SelectField
                id="filter-staff"
                value={staffFilter}
                onValueChange={setStaffFilter}
                options={[
                  { label: "Tất cả nhân sự", value: "all" },
                  ...staffMembers.map((u: SelectOptionItem & { fullName: string }) => ({ label: u.fullName, value: String(u.id) })),
                ]}
                placeholder="Nhân sự"
                triggerClassName="bg-white py-2 px-3 text-xs font-bold"
              />
            </div>
          </div>
        )}
      </div>

      <div className="min-h-[600px]">
        {delegationsQuery.isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
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
          viewMode === "kanban" ? (
            <KanbanBoard 
              delegations={uiDelegations} 
              onUpdateStatus={handleUpdateStatus} 
              onDelete={handleDelete}
              onViewList={() => setViewMode("list")}
            />
          ) : (
            <ListView 
              delegations={uiDelegations} 
              onDelete={handleDelete}
            />
          )
        )}
      </div>

      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
        onConfirm={executeDelete}
        title="Xóa hồ sơ đoàn?"
        description="Bạn có chắc chắn muốn xóa hồ sơ đoàn này? Mọi dữ liệu liên quan đến thành viên và lịch trình cũng sẽ bị xóa vĩnh viễn và không thể khôi phục."
        confirmText="Xác nhận xóa"
        variant="danger"
      />
    </div>
  );
}
