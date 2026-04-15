export type TaskPriority = "Low" | "Medium" | "High" | "Urgent";
export type TaskStatus = "Todo" | "In-progress" | "Done" | "Canceled";

export interface TaskApiItem {
  id: string;
  title: string;
  description?: string;
  delegationId?: number | null;
  eventId?: number | null;
  minutesId?: number | null;
  status: number;
  priority: number;
  dueAt?: string | null;
  isOverdue: boolean;
  createdBy: number;
  creatorName: string;
  createdAt: string;
}

export interface TaskCreatePayload {
  title: string;
  description?: string;
  delegation_id?: number;
  event_id?: number;
  minutes_id?: number;
  status?: number;
  priority?: number;
  due_at?: string;
}

export interface TaskPatchPayload {
  title?: string;
  description?: string;
  status?: number;
  priority?: number;
  due_at?: string;
}

export interface TaskUiItem {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueAt: string;
  isOverdue: boolean;
  creator: string;
}

export const mapTaskStatus = (status: number): TaskStatus => {
  if (status === 1) return "In-progress";
  if (status === 2) return "Done";
  if (status === 3) return "Canceled";
  return "Todo";
};

export const mapTaskPriority = (priority: number): TaskPriority => {
  if (priority === 0) return "Low";
  if (priority === 2) return "High";
  if (priority === 3) return "Urgent";
  return "Medium";
};

export const mapTaskToUi = (item: TaskApiItem): TaskUiItem => {
  return {
    id: item.id,
    title: item.title,
    description: item.description || "",
    status: mapTaskStatus(item.status),
    priority: mapTaskPriority(item.priority),
    dueAt: item.dueAt || "N/A",
    isOverdue: item.isOverdue,
    creator: item.creatorName || "Hệ thống",
  };
};

export const mapTaskItemsToUi = (items: TaskApiItem[]): TaskUiItem[] => items.map(mapTaskToUi);
