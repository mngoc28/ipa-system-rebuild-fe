import { useState, useMemo } from "react";
import { Plus, Search, Filter, LayoutGrid, List, Calendar as CalendarIcon, ChevronDown, Download, FileSpreadsheet, FileText } from "lucide-react";
import { delegations, DelegationItem } from "@/dataHelper/ui-system.data";
import { cn } from "@/lib/utils";
import KanbanBoard from "@/components/delegations/KanbanBoard";
import ListView from "@/components/delegations/ListView";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function DelegationListPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"inbound" | "outbound">("inbound");
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [calendarQuickFilter, setCalendarQuickFilter] = useState<"all" | "thisWeek" | "thisMonth">("all");

  const parseDate = (value: string) => {
    const [day, month, year] = value.split("/").map(Number);
    return new Date(year, month - 1, day);
  };

  const intersectsRange = (start: Date, end: Date, rangeStart: Date, rangeEnd: Date) => start <= rangeEnd && end >= rangeStart;

  const filteredDelegations = useMemo(() => {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    return delegations.filter(
      (item) => {
        const byTab = item.type === activeTab;
        const bySearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.code.toLowerCase().includes(searchTerm.toLowerCase()) || item.country.toLowerCase().includes(searchTerm.toLowerCase());

        if (calendarQuickFilter === "all") {
          return byTab && bySearch;
        }

        const start = parseDate(item.startDate);
        const end = parseDate(item.endDate);
        const byTime =
          calendarQuickFilter === "thisWeek"
            ? intersectsRange(start, end, weekStart, weekEnd)
            : intersectsRange(start, end, currentMonthStart, currentMonthEnd);

        return byTab && bySearch && byTime;
      },
    );
  }, [activeTab, searchTerm, calendarQuickFilter]);

  const handleExport = () => {
    toast.success("Đã bắt đầu xuất dữ liệu đoàn công tác.");
  };

  const handleCalendarFilter = () => {
    const nextFilter = calendarQuickFilter === "all" ? "thisWeek" : calendarQuickFilter === "thisWeek" ? "thisMonth" : "all";
    setCalendarQuickFilter(nextFilter);
    toast.info(nextFilter === "thisWeek" ? "Đang lọc đoàn trong tuần này." : nextFilter === "thisMonth" ? "Đang lọc đoàn trong tháng này." : "Đã bỏ lọc thời gian.");
  };

  const handleApplyFilters = () => {
    toast.success("Đã áp dụng bộ lọc nâng cao.");
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setCalendarQuickFilter("all");
    toast.info("Đã xóa bộ lọc.");
  };

  return (
    <div className="space-y-6 duration-500 animate-in fade-in">
      {/* Header section */}
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
            onClick={() => navigate("/delegations/create")}
            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-[11px] font-black uppercase tracking-wider text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/95"
          >
            <Plus size={16} />
            Tạo đoàn mới
          </button>
        </div>
      </div>

      {/* Tabs & View Switcher */}
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

      {/* Filters Area */}
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="group relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-primary" size={16} />
          <input
            type="text"
            placeholder="Tìm kiếm đoàn công tác theo tên, mã hoặc quốc gia..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-xs font-medium outline-none transition-all focus:border-primary/50 focus:ring-4 focus:ring-primary/5 shadow-sm"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={cn(
              "flex items-center gap-2 whitespace-nowrap rounded-lg border px-5 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all",
              isFilterOpen ? "border-slate-950 bg-slate-950 text-white shadow-lg shadow-slate-950/20" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
            )}
          >
            <Filter size={14} />
            LỌC NÂNG CAO
          </button>
          <div className="hidden rounded-lg border border-slate-200 bg-white p-1 lg:flex shadow-sm">
            <button onClick={handleCalendarFilter} className="p-2 text-slate-400 transition-all hover:text-primary">
              <CalendarIcon size={16} />
            </button>
          </div>
        </div>
      </div>

      {calendarQuickFilter !== "all" && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-primary">
          Đang áp dụng bộ lọc thời gian: {calendarQuickFilter === "thisWeek" ? "Tuần này" : "Tháng này"}
        </div>
      )}

      {/* Advanced Filter Panel (Collapsible) */}
      {isFilterOpen && (
        <div className="grid grid-cols-1 gap-6 rounded-xl border border-slate-200 bg-slate-50/50 p-6 shadow-xl shadow-slate-200/20 duration-300 animate-in slide-in-from-top-4 md:grid-cols-4">
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Quốc gia đối tác</label>
            <select className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-[11px] font-bold outline-none focus:border-primary transition-all">
              <option>Tất cả quốc gia</option>
              <option>Hàn Quốc</option>
              <option>Singapore</option>
              <option>Nhật Bản</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Lĩnh vực trọng điểm</label>
            <select className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-[11px] font-bold outline-none focus:border-primary transition-all">
              <option>Tất cả lĩnh vực</option>
              <option>Công nghệ cao</option>
              <option>Logistics</option>
              <option>Năng lượng</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Đơn vị chủ trì</label>
            <select className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-[11px] font-bold outline-none focus:border-primary transition-all">
              <option>Tất cả đơn vị</option>
              <option>IPA Đà Nẵng</option>
              <option>Sở TTTT</option>
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button onClick={handleApplyFilters} className="flex-1 rounded-lg bg-primary py-2.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-primary/20 hover:bg-primary/95 transition-all">ÁP DỤNG BỘ LỌC</button>
            <button onClick={handleResetFilters} className="rounded-lg bg-white border border-slate-200 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all">XOÁ</button>
          </div>
        </div>
      )}

      {/* Main Content View */}
      <div className="min-h-[600px]">{viewMode === "kanban" ? <KanbanBoard delegations={filteredDelegations} /> : <ListView delegations={filteredDelegations} />}</div>
    </div>
  );
}
