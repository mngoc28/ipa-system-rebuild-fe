/** Typical priority levels for a task. */
export type TaskPriority = "Low" | "Medium" | "High" | "Urgent";
/** Valid lifecycle statuses for a task. */
export type TaskStatus = "Todo" | "In-progress" | "Done" | "Canceled";

/**
 * Interface representing a task object received from the API.
 */
export interface TaskApiItem {
  /** Task unique identifier */
  id: string;
  /** Primary title of the task */
  title: string;
  /** Detailed instructions or background */
  description?: string;
  /** ID of the associated delegation, if any */
  delegationId?: number | null;
  /** ID of the associated event, if any */
  eventId?: number | null;
  /** ID of the associated meeting minutes, if any */
  minutesId?: number | null;
  /** Numeric status code */
  status: number;
  /** Numeric priority code */
  priority: number;
  /** Deadline timestamp */
  dueAt?: string | null;
  /** Flag indicating if the deadline has passed */
  isOverdue: boolean;
  /** ID of the user who created the task */
  createdBy: number;
  /** Display name of the task creator */
  creatorName: string;
  /** ISO timestamp of creation */
  createdAt: string;
  /** List of users assigned to the task */
  assignees?: { id: number; name: string; avatar?: string }[];
  /** Total number of comments posted */
  commentsCount?: number;
  /** Total number of files attached */
  attachmentsCount?: number;
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
  assignee_ids?: number[];
  notify_assignees?: boolean;
}

export interface TaskPatchPayload {
  title?: string;
  description?: string;
  status?: number;
  priority?: number;
  due_at?: string;
  assignee_ids?: number[];
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
  assignees: { id: number; name: string; avatar?: string }[];
  commentsCount: number;
  attachmentsCount: number;
  delegationId?: number | null;
  eventId?: number | null;
}

/**
 * Maps numeric API status codes to internal UI status labels.
 * @param status - Numeric code from API.
 * @returns Human-readable status string.
 */
export const mapTaskStatus = (status: number): TaskStatus => {
  if (status === 1) return "In-progress";
  if (status === 2) return "Done";
  if (status === 3) return "Canceled";
  return "Todo";
};

/**
 * Maps numeric API priority codes to internal UI priority labels.
 * @param priority - Numeric code from API.
 * @returns Human-readable priority string.
 */
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
    assignees: item.assignees || [],
    commentsCount: item.commentsCount || 0,
    attachmentsCount: item.attachmentsCount || 0,
    delegationId: item.delegationId,
    eventId: item.eventId,
  };
};

export const mapTaskItemsToUi = (items: TaskApiItem[]): TaskUiItem[] => items.map(mapTaskToUi);
