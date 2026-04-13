import { useSortable } from "@dnd-kit/sortable";
import { useNavigate } from "react-router-dom";
import { CSS } from "@dnd-kit/utilities";
import { DelegationItem } from "@/dataHelper/ui-system.data";
import { cn } from "@/lib/utils";
import { Calendar, User, ClipboardList, MapPin } from "lucide-react";

interface KanbanCardProps {
  item: DelegationItem;
  isOverlay?: boolean;
}

const getFlagEmoji = (country: string) => {
  const flags: Record<string, string> = {
    "Hàn Quốc": "🇰🇷",
    Singapore: "🇸🇬",
    "Nhật Bản": "🇯🇵",
    Đức: "🇩🇪",
    Úc: "🇦🇺",
    "Thái Lan": "🇹🇭",
    "Hoa Kỳ": "🇺🇸",
    Pháp: "🇫🇷",
    "Đài Loan": "🇹🇼",
    Israel: "🇮🇱",
    "Vương quốc Anh": "🇬🇧",
    "Ấn Độ": "🇮🇳",
  };
  return flags[country] || "🌐";
};

export default function KanbanCard({ item, isOverlay }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

  const navigate = useNavigate();
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const overdue = item.actionItems.overdue > 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => navigate(`/delegations/${item.id}`)}
      className={cn(
        "group relative cursor-grab overflow-hidden rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm transition-all hover:border-primary/30 hover:shadow-md active:cursor-grabbing",
        isDragging && "opacity-30",
        isOverlay && "rotate-1 scale-[1.02] cursor-grabbing border-primary shadow-xl ring-4 ring-primary/5",
      )}
    >
      {/* Priority Indicator */}
      <div className={cn("absolute right-0 top-0 h-full w-0.5", item.priority === "high" ? "bg-rose-500" : item.priority === "medium" ? "bg-amber-400" : "bg-slate-100")} />

      <div className="flex flex-col gap-3">
        {/* Top Info */}
        <div className="flex items-start justify-between">
          <span className="rounded border border-slate-100 bg-slate-50 px-1.5 py-0.5 font-mono text-[9px] font-bold text-slate-500">#{item.code}</span>
          <div className="flex items-center gap-1.5 text-[10px] font-black tracking-widest text-slate-400 uppercase">
            <span>{getFlagEmoji(item.country)}</span>
            <span className="max-w-[80px] truncate">{item.country}</span>
          </div>
        </div>

        {/* Title */}
        <h4 className="line-clamp-2 text-xs font-black leading-tight text-slate-900 transition-colors group-hover:text-primary uppercase tracking-tight">{item.name}</h4>

        {/* Metadata */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <Calendar size={10} className="text-slate-300" />
            <span>{item.startDate}</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            <MapPin size={10} className="text-slate-300" />
            <span className="truncate">{item.partnerOrg}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-1 flex items-center justify-between border-t border-slate-50 pt-2.5">
          <div className="flex items-center gap-1.5">
            <div className="h-6 w-6 overflow-hidden rounded-full border border-white shadow-sm">
              <img src={item.staff.avatar} alt={item.staff.name} className="h-full w-full object-cover" />
            </div>
            <span className="text-[10px] font-black text-slate-900 uppercase tracking-wider">{item.staff.name.split(" ").pop()}</span>
          </div>

          <div className="flex items-center gap-2">
            <div className={cn("flex items-center gap-1 rounded bg-slate-50 border border-slate-100 px-1.5 py-0.5 text-[9px] font-black shadow-sm", overdue ? "text-rose-600 border-rose-100 bg-rose-50" : "text-slate-400")}>
              <ClipboardList size={10} />
              <span>{item.actionItems.total}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
