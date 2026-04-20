import { useState } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SessionItem, weekSessions } from "@/dataHelper/ui-system.data";
import { cn } from "@/lib/utils";
import { MapPin, GripVertical, MoreVertical, Users, Coffee, Car, Briefcase, Camera, type LucideIcon } from "lucide-react";

interface ItineraryTimelineProps {
  sessions?: SessionItem[];
}

const typeStyles: Record<string, { color: string; icon: LucideIcon; label: string }> = {
  meeting: { color: "border-blue-500 bg-blue-50 text-blue-700", icon: Briefcase, label: "Họp công tác" },
  siteVisit: { color: "border-emerald-500 bg-emerald-50 text-emerald-700", icon: Camera, label: "Khảo sát" },
  gala: { color: "border-orange-500 bg-orange-50 text-orange-700", icon: Coffee, label: "Tiệc/Nghỉ" },
  travel: { color: "border-slate-500 bg-slate-50 text-slate-700", icon: Car, label: "Di chuyển" },
};

function SortableSessionCard({ session }: { session: SessionItem }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: session.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
  };

  const config = typeStyles[session.type] || typeStyles.meeting;

  return (
    <div ref={setNodeRef} style={style} className={cn("group relative pb-8 pl-8 last:pb-0", isDragging && "opacity-50")}>
      {/* Timeline Line */}
      <div className="absolute bottom-0 left-[11px] top-6 w-0.5 bg-slate-100 group-last:hidden" />

      {/* Timeline Dot */}
      <div
        className={cn(
          "absolute left-0 top-1 z-10 flex h-6 w-6 items-center justify-center rounded-full border-4 border-white shadow-sm",
          config.color.split(" ")[1], // Gets the bg color class
        )}
      >
        <config.icon size={10} className="text-white" />
      </div>

      {/* Card */}
      <div
        className={cn(
          "flex items-start gap-4 rounded-2xl border-l-4 bg-white p-5 shadow-sm transition-all hover:shadow-md",
          config.color.split(" ")[0], // Gets the border color class
        )}
      >
        <div {...attributes} {...listeners} className="mt-1 cursor-grab text-slate-300 hover:text-slate-500 active:cursor-grabbing">
          <GripVertical size={20} />
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-black text-slate-900">{session.time}</span>
              <span className={cn("rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-tight", config.color)}>{config.label}</span>
            </div>
            <button className="text-slate-300 transition-colors hover:text-slate-600">
              <MoreVertical size={16} />
            </button>
          </div>

          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-900">{session.title}</h4>
            {session.description && <p className="line-clamp-1 text-xs font-medium text-slate-500">{session.description}</p>}
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-1">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
              <MapPin size={14} className="text-slate-400" />
              {session.location}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
              <Users size={14} className="text-slate-400" />
              12 người
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ItineraryTimeline({ sessions: initialSessions }: ItineraryTimelineProps) {
  const [items, setItems] = useState(initialSessions || weekSessions);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItems((prev) => {
        const oldIndex = prev.findIndex((i) => i.id === active.id);
        const newIndex = prev.findIndex((i) => i.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  // Group items by date for visual sectioning
  const grouped = items.reduce(
    (acc, item) => {
      if (!acc[item.date]) acc[item.date] = [];
      acc[item.date].push(item);
      return acc;
    },
    {} as Record<string, SessionItem[]>,
  );

  return (
    <div className="space-y-10">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        {Object.entries(grouped).map(([date, daySessions]) => (
          <div key={date} className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-slate-900 px-4 py-1.5 text-xs font-black text-white shadow-lg">
                {daySessions[0].day}, {date}/2026
              </div>
              <div className="h-px flex-1 bg-slate-100" />
            </div>

            <SortableContext items={daySessions.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-0">
                {daySessions.map((session) => (
                  <SortableSessionCard key={session.id} session={session} />
                ))}
              </div>
            </SortableContext>
          </div>
        ))}
      </DndContext>
    </div>
  );
}
