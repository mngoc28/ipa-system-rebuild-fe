import { useSortable } from "@dnd-kit/sortable";
import { useNavigate } from "react-router-dom";
import { CSS } from "@dnd-kit/utilities";
import { DelegationItem } from "@/dataHelper/ui-system.data";
import { cn } from "@/lib/utils";
import { CountryFlag } from "@/components/ui/CountryFlag";
import { Calendar, ClipboardList, MapPin, Eye, Edit2, Trash2, MoreVertical } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Props for the KanbanCard component.
 */
interface KanbanCardProps {
    item: DelegationItem;
    isOverlay?: boolean;
    onDelete?: (id: string | number) => void;
    color?: string;
}


/**
 * A draggable card representing a delegation within a Kanban column.
 * Displays summary metadata, priority status, staff avatar, and action menus.
 * 
 * @param props - Component props following KanbanCardProps interface.
 */
export default function KanbanCard({ item, isOverlay, onDelete, color }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

  const navigate = useNavigate();
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const overdue = item.actionItems.overdue > 0;

  const handleAction = (e: React.MouseEvent, action: "view" | "edit" | "delete") => {
    e.stopPropagation();
    e.preventDefault();

    if (action === "view") {
      navigate(`/delegations/${item.id}`);
    } else if (action === "edit") {
      navigate(`/delegations/${item.id}/edit`);
    } else if (action === "delete") {
      if (onDelete) {
        onDelete(item.id);
      } else {
        toast.info("Request to delete delegation: " + item.name);
      }
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => navigate(`/delegations/${item.id}`)}
      className={cn(
        "group relative cursor-grab overflow-hidden rounded-xl border border-brand-dark/10 bg-white p-3.5 shadow-sm transition-all hover:border-primary/30 hover:shadow-md active:cursor-grabbing",
        isDragging && "opacity-30",
        isOverlay && "rotate-1 scale-[1.02] cursor-grabbing border-primary shadow-xl ring-4 ring-primary/5",
      )}
    >
      {/* Priority/Status Indicator */}
      <div 
        className="absolute right-0 top-0 h-full w-1 rounded-r-lg" 
        style={{ backgroundColor: color || (item.priority === "high" ? "#f43f5e" : item.priority === "medium" ? "#fbbf24" : "var(--primary)") }} 
      />

      <div className="flex flex-col gap-3">
        {/* Top Info */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1.5">
            <span className="w-fit rounded border border-brand-dark/10 bg-brand-dark/[0.02] px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-tighter text-brand-text-dark/40">#{item.code}</span>
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-brand-text-dark/40">
              <CountryFlag countryName={item.country} />
              <span className="max-w-[100px] truncate">{item.country}</span>
            </div>
          </div>

          <div className="relative z-20">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button 
                  onClick={(e) => e.stopPropagation()} 
                  className="flex size-7 items-center justify-center rounded-lg border border-transparent text-brand-text-dark/40 transition-all hover:border-brand-dark/10 hover:bg-brand-dark/[0.04] hover:text-brand-text-dark active:scale-90"
                >
                  <MoreVertical size={14} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuItem onClick={(e) => handleAction(e, "view")}>
                  <Eye size={14} className="mr-2" /> View details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => handleAction(e, "edit")}>
                  <Edit2 size={14} className="mr-2" /> Edit delegation
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={(e) => handleAction(e, "delete")}
                  className="text-rose-600 focus:bg-rose-50 focus:text-rose-600"
                >
                  <Trash2 size={14} className="mr-2" /> Delete record
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Title */}
        <h4 className="line-clamp-2 text-xs font-black uppercase leading-tight tracking-tight text-brand-text-dark transition-colors group-hover:text-primary">{item.name}</h4>

        {/* Metadata */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-brand-text-dark/40">
            <Calendar size={10} className="text-brand-text-dark/20" />
            <span>{item.startDate}</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-brand-text-dark/40">
            <MapPin size={10} className="text-brand-text-dark/20" />
            <span className="truncate">{item.partnerOrg}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-1 flex items-center justify-between border-t border-brand-dark/5 pt-2.5">
          <div className="flex items-center gap-1.5">
            <div className="size-6 overflow-hidden rounded-full border border-white shadow-sm">
              <img src={item.staff.avatar} alt={item.staff.name} className="size-full object-cover" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-brand-text-dark">{item.staff.name.split(" ").pop()}</span>
          </div>

          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <div 
                    className={cn("flex items-center gap-1 rounded bg-brand-dark/[0.02] border border-brand-dark/10 px-1.5 py-0.5 text-[9px] font-black shadow-sm transition-all cursor-help", overdue ? "text-rose-600 border-rose-100 bg-rose-50" : "text-brand-text-dark/40")}
                  >
                    <ClipboardList size={10} />
                    <span>{item.actionItems.total}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-[10px] font-bold uppercase tracking-widest">
                  {item.actionItems.total} Checklist items
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </div>
  );
}
