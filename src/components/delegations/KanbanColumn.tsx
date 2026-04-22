import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { DelegationItem } from "@/dataHelper/ui-system.data";
import KanbanCard from "./KanbanCard";
import { Download, List, MoreHorizontal, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Props for the KanbanColumn component.
 */
interface KanbanColumnProps {
  /** Unique identifier for the column, corresponding to a status. */
  id: string;
  /** Display title for the column. */
  label: string;
  /** Theme color used for background and accents in this column. */
  color: string;
  /** List of delegation items currently assigned to this column. */
  items: DelegationItem[];
  /** Callback passed down to KanbanCard for deletion requests. */
  onDelete?: (id: string | number) => void;
  /** Callback to switch back to list view. */
  onViewList?: () => void;
}

/**
 * A container representing a specific status in the Kanban board.
 * Supports dropping items and managing horizontal layout for cards. 
 * Includes actions for exporting the column's data to CSV.
 * 
 * @param props - Component props following KanbanColumnProps interface.
 */
export default function KanbanColumn({ id, label, color, items, onDelete, onViewList }: KanbanColumnProps) {
  const navigate = useNavigate();

  const { setNodeRef } = useDroppable({
    id: id,
  });

  const handleExportColumn = () => {
    const headers = ["Mã đoàn", "Tên đoàn", "Quốc gia", "Trạng thái"];
    const rows = items.map((item) => [item.code, item.name, item.country, item.status]);
    const csv = [headers, ...rows]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `kanban_${id}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);

    toast.success(`Đã xuất danh sách ${label}.`);
  };

  return (
    <div className="flex h-[calc(100vh-280px)] min-h-[500px] w-[300px] flex-col">
      {/* Column Header */}
      <div className="mb-2 flex items-center justify-between rounded-t-2xl p-3" style={{ backgroundColor: `${color}15`, borderTop: `4px solid ${color}` }}>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-brand-text-dark">{label}</span>
          <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-white px-1.5 text-[10px] font-black shadow-sm" style={{ color: color }}>
            {items.length}
          </span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button title={`${label} column options`} aria-label={`${label} column options`} className="text-brand-text-dark/40 transition-colors hover:text-brand-text-dark/60">
              <MoreHorizontal size={18} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleExportColumn}>
              <Download size={14} className="mr-2" /> Xuất CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/delegations/create")}>
              <Plus size={14} className="mr-2" /> Tạo đoàn công tác mới
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => {
                if (onViewList) {
                  onViewList();
                } else {
                  navigate("/delegations");
                }
              }}
            >
              <List size={14} className="mr-2" /> Xem tất cả đoàn công tác
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Droppable Area */}
      <div ref={setNodeRef} className="scrollbar-thin flex-1 space-y-3 overflow-y-auto rounded-b-2xl p-1 pb-4 transition-colors">
        <SortableContext id={id} items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          {items.map((item) => (
            <KanbanCard key={item.id} item={item} onDelete={onDelete} color={color} />
          ))}

          {items.length === 0 && <div className="flex h-32 items-center justify-center rounded-2xl border-2 border-dashed border-brand-dark/10 bg-brand-dark/[0.02] text-xs font-medium text-brand-text-dark/20">Kéo thả vào đây</div>}
        </SortableContext>
      </div>
    </div>
  );
}
