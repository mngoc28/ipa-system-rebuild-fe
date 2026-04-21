import { useEffect, useState } from "react";
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, DragStartEvent, DragOverEvent, DragEndEvent, defaultDropAnimationSideEffects } from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { DelegationItem, StatusTone } from "@/dataHelper/ui-system.data";
import KanbanColumn from "./KanbanColumn.tsx";
import KanbanCard from "./KanbanCard.tsx";
import { toast } from "sonner";
import { ConfirmModal } from "@/components/common/ConfirmModal";

/**
 * Props for the KanbanBoard component.
 */
interface KanbanBoardProps {
    delegations: DelegationItem[];
    onUpdateStatus?: (id: string | number, status: string) => void;
    onDelete?: (id: string | number) => void;
    onViewList?: () => void;
}

/**
 * Configuration for the Kanban columns, mapping status identifiers to 
 * localized labels and theme colors.
 */
const COLUMNS: { id: StatusTone; label: string; color: string }[] = [
  { id: "draft", label: "Nháp", color: "#6B7280" },
  { id: "pendingApproval", label: "Chờ phê duyệt", color: "#F59E0B" },
  { id: "needsRevision", label: "Cần bổ sung", color: "#F97316" },
  { id: "approved", label: "Đã phê duyệt", color: "#1A56DB" },
  { id: "inProgress", label: "Đang thực hiện", color: "#0E9F6E" },
  { id: "completed", label: "Hoàn thành", color: "#065F46" },
  { id: "cancelled", label: "Đã hủy", color: "#DC2626" },
];

/**
 * Business rules defining allowed status transitions for delegations.
 * Prevents invalid workflow movements (e.g., from Completed back to Pending).
 */
const VALID_TRANSITIONS: Record<string, string[]> = {
  draft: ["pendingApproval", "cancelled"],
  pendingApproval: ["approved", "needsRevision", "cancelled"],
  needsRevision: ["pendingApproval", "cancelled"],
  approved: ["inProgress", "cancelled"],
  inProgress: ["completed", "cancelled"],
  completed: [],
  cancelled: ["draft"],
};

/**
 * A sophisticated drag-and-drop Kanban board for managing delegation lifecycles.
 * Implements strict workflow validation and provides visual feedback during transitions.
 * 
 * @param props - Component props following KanbanBoardProps interface.
 */
export default function KanbanBoard({ delegations: initialDelegations, onUpdateStatus, onDelete, onViewList }: KanbanBoardProps) {
  const [items, setItems] = useState(initialDelegations);
  const [activeItem, setActiveItem] = useState<DelegationItem | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    item: DelegationItem | null;
    targetStatus: StatusTone | null;
  }>({
    isOpen: false,
    item: null,
    targetStatus: null,
  });

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
    const { over } = event;
    if (!over || !activeItem) {
      setActiveItem(null);
      return;
    }

    const originalItem = activeItem; // Use the one recorded at drag start

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

    if (targetStatus && targetStatus !== originalItem.status) {
      // Validate transition
      if (VALID_TRANSITIONS[originalItem.status] && VALID_TRANSITIONS[originalItem.status].includes(targetStatus)) {
        setTimeout(() => {
          setConfirmModal({
            isOpen: true,
            item: originalItem,
            targetStatus: targetStatus,
          });
        }, 250); // Delay matches the dropAnimation duration
      } else {
        toast.error(`Không thể di chuyển trực tiếp từ ${COLUMNS.find((c) => c.id === originalItem.status)?.label} sang ${COLUMNS.find((c) => c.id === targetStatus)?.label}`);
        // Reset items to initial because drag over might have changed it
        setItems(initialDelegations);
      }
    } else {
      // If dropped in the same column, ensure UI respects the reorder visually
      // In this case arrayMove from dragOver was enough to visually keep it there,
      // but API persistence for ordering is not implemented yet.
    }

    setActiveItem(null);
  };

  const handleConfirmStatus = () => {
    if (confirmModal.item && confirmModal.targetStatus) {
      if (onUpdateStatus) {
        onUpdateStatus(confirmModal.item.id, confirmModal.targetStatus);
      } else {
        setItems((prev) => prev.map((item) => (item.id === confirmModal.item!.id ? { ...item, status: confirmModal.targetStatus! } : item)));
        toast.success(`Đã cập nhật trạng thái đoàn công tác thành ${COLUMNS.find((c) => c.id === confirmModal.targetStatus)?.label}`);
      }
    }
    setConfirmModal({ isOpen: false, item: null, targetStatus: null });
  };

  const handleCancelStatus = () => {
    // Revert the visual update if cancelled
    setItems(initialDelegations);
    setConfirmModal({ isOpen: false, item: null, targetStatus: null });
  };

  return (
    <div className="scrollbar-hide overflow-x-auto pb-8">
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
        <div className="flex min-w-max gap-4">
          {COLUMNS.map((column) => {
            const columnItems = items.filter((item) => item.status === column.id);
            return (
              <KanbanColumn 
                key={column.id} 
                id={column.id} 
                label={column.label} 
                color={column.color} 
                items={columnItems} 
                onDelete={onDelete}
                onViewList={onViewList}
              />
            );
          })}
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
          {activeItem ? <KanbanCard item={activeItem} isOverlay onDelete={onDelete} /> : null}
        </DragOverlay>
      </DndContext>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={handleCancelStatus}
        onConfirm={handleConfirmStatus}
        title="Xác nhận chuyển trạng thái"
        description={<p>Bạn có chắc chắn muốn chuyển <strong className="text-slate-900">{confirmModal.item?.name}</strong> sang trạng thái <strong className="text-primary">{COLUMNS.find(c => c.id === confirmModal.targetStatus)?.label}</strong> không?</p>}
        confirmText="Xác nhận"
        variant="primary"
      />
    </div>
  );
}
