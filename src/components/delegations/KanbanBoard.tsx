import { useEffect, useState } from "react";
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, DragStartEvent, DragOverEvent, DragEndEvent, defaultDropAnimationSideEffects } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { DelegationItem, StatusTone } from "@/dataHelper/ui-system.data";
import KanbanColumn from "./KanbanColumn.tsx";
import KanbanCard from "./KanbanCard.tsx";
import { toast } from "sonner";

interface KanbanBoardProps {
  delegations: DelegationItem[];
}

const COLUMNS: { id: StatusTone; label: string; color: string }[] = [
  { id: "draft", label: "Bản nháp", color: "#6B7280" },
  { id: "pendingApproval", label: "Chờ phê duyệt", color: "#F59E0B" },
  { id: "needsRevision", label: "Cần chỉnh sửa", color: "#F97316" },
  { id: "approved", label: "Đã phê duyệt", color: "#1A56DB" },
  { id: "inProgress", label: "Đang thực hiện", color: "#0E9F6E" },
  { id: "completed", label: "Hoàn thành", color: "#065F46" },
  { id: "cancelled", label: "Đã hủy", color: "#DC2626" },
];

// Business rules for state transitions
const VALID_TRANSITIONS: Record<StatusTone, StatusTone[]> = {
  draft: ["pendingApproval", "cancelled", "pending"],
  pending: ["approved", "needsRevision", "cancelled"],
  pendingApproval: ["approved", "needsRevision", "cancelled"],
  needsRevision: ["pendingApproval", "cancelled", "pending"],
  revision: ["pendingApproval", "cancelled", "pending"],
  approved: ["inProgress", "cancelled"],
  inProgress: ["completed", "cancelled"],
  completed: [],
  cancelled: ["draft"],
  todo: [],
  done: [],
  urgent: [],
  high: [],
  medium: [],
  low: [],
};

export default function KanbanBoard({ delegations: initialDelegations }: KanbanBoardProps) {
  const [items, setItems] = useState(initialDelegations);
  const [activeItem, setActiveItem] = useState<DelegationItem | null>(null);

  useEffect(() => {
    setItems(initialDelegations);
  }, [initialDelegations]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const item = items.find((i) => i.id === active.id);
    if (item) setActiveItem(item);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const dragged = items.find((i) => i.id === activeId);
    if (!dragged) return;

    const isOverAColumn = COLUMNS.some((c) => c.id === overId);
    const overItem = items.find((i) => i.id === overId);
    const targetStatus = isOverAColumn ? (overId as StatusTone) : overItem?.status;

    if (!targetStatus) return;

    if (targetStatus !== dragged.status) {
      setItems((prev) => prev.map((item) => (item.id === dragged.id ? { ...item, status: targetStatus } : item)));
      return;
    }

    if (!overItem) return;

    const oldIndex = items.findIndex((i) => i.id === activeId);
    const newIndex = items.findIndex((i) => i.id === overId);

    if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
      setItems((prev) => arrayMove(prev, oldIndex, newIndex));
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeItem = items.find((i) => i.id === active.id);
    if (!activeItem) return;

    // Determine target status
    let targetStatus: StatusTone | undefined;

    // If dropped over a column header
    if (COLUMNS.some((c) => c.id === over.id)) {
      targetStatus = over.id as StatusTone;
    } else {
      // If dropped over another item
      const overItem = items.find((i) => i.id === over.id);
      if (overItem) targetStatus = overItem.status;
    }

    if (targetStatus && targetStatus !== activeItem.status) {
      // Validate transition
      if (VALID_TRANSITIONS[activeItem.status].includes(targetStatus)) {
        setItems((prev) => prev.map((item) => (item.id === activeItem.id ? { ...item, status: targetStatus! } : item)));
        toast.success(`Đã cập nhật trạng thái đoàn sang ${COLUMNS.find((c) => c.id === targetStatus)?.label}`);
      } else {
        toast.error(`Không thể chuyển trực tiếp từ ${COLUMNS.find((c) => c.id === activeItem.status)?.label} sang ${COLUMNS.find((c) => c.id === targetStatus)?.label}`);
      }
    }

    setActiveItem(null);
  };

  return (
    <div className="scrollbar-hide overflow-x-auto pb-8">
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
        <div className="flex min-w-max gap-4">
          {COLUMNS.map((column) => (
            <KanbanColumn key={column.id} id={column.id} label={column.label} color={column.color} items={items.filter((i) => i.status === column.id)} />
          ))}
        </div>

        <DragOverlay
          dropAnimation={{
            duration: 250,
            easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
            sideEffects: defaultDropAnimationSideEffects({
              styles: {
                active: {
                  opacity: "0.5",
                },
              },
            }),
          }}
        >
          {activeItem ? <KanbanCard item={activeItem} isOverlay /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
