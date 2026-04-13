import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { DelegationItem } from "@/dataHelper/ui-system.data";
import KanbanCard from "./KanbanCard";
import { cn } from "@/lib/utils";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

interface KanbanColumnProps {
  id: string;
  label: string;
  color: string;
  items: DelegationItem[];
}

export default function KanbanColumn({ id, label, color, items }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id: id,
  });

  return (
    <div className="flex h-full min-h-[500px] w-[300px] flex-col">
      {/* Column Header */}
      <div className="mb-2 flex items-center justify-between rounded-t-2xl p-3" style={{ backgroundColor: `${color}15`, borderTop: `4px solid ${color}` }}>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-900">{label}</span>
          <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-white px-1.5 text-[10px] font-black shadow-sm" style={{ color: color }}>
            {items.length}
          </span>
        </div>
        <button onClick={() => toast.info(`Tùy chọn cột: ${label}`)} className="text-slate-400 transition-colors hover:text-slate-600">
          <MoreHorizontal size={18} />
        </button>
      </div>

      {/* Droppable Area */}
      <div ref={setNodeRef} className="flex-1 space-y-3 rounded-b-2xl p-1 transition-colors">
        <SortableContext id={id} items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          {items.map((item) => (
            <KanbanCard key={item.id} item={item} />
          ))}

          {items.length === 0 && <div className="flex h-32 items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-300">Kéo thả vào đây</div>}
        </SortableContext>
      </div>
    </div>
  );
}
