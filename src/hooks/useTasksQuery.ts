import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { tasksApi } from "@/api/tasksApi";
import {
  mapTaskItemsToUi,
  type TaskCreatePayload,
  type TaskPatchPayload,
} from "@/dataHelper/tasks.dataHelper";
import * as React from "react";

/**
 * Parameters for filtering and paginating current tasks.
 */
export interface TasksQueryOptions {
    status?: number;
    priority?: number;
    search?: string;
    page?: number;
    pageSize?: number;
}

/**
 * Hook to retrieve a filtered and paginated list of actionable tasks.
 * Maps backend task schemas to UI-specific data structures.
 * @param options - Filtering and pagination criteria.
 */
export const useTasksListQuery = (options: TasksQueryOptions = {}) => {
  const tasksQuery = useQuery({
    queryKey: ["tasks", options],
    queryFn: () => tasksApi.list(options),
  });

  const tasks = React.useMemo(() => mapTaskItemsToUi(tasksQuery.data?.data?.items ?? []), [tasksQuery.data]);
  const meta = tasksQuery.data?.meta;

  return { tasksQuery, tasks, meta };
};

/**
 * Hook to create a new task.
 */
export const useCreateTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TaskCreatePayload) => tasksApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("New task created successfully.");
    },
    onError: () => toast.error("Failed to create task."),
  });
};

/**
 * Hook to update an existing task's properties.
 */
export const useUpdateTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: TaskPatchPayload }) => tasksApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task updated successfully.");
    },
    onError: () => toast.error("Failed to update task."),
  });
};

/**
 * Hook to permanently remove a task.
 */
export const useDeleteTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tasksApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task deleted successfully.");
    },
    onError: () => toast.error("Failed to delete task."),
  });
};

// --- Comments ---
/**
 * Hook to retrieve the comment thread for a specific task.
 * @param taskId - Target task ID.
 * @param isOpen - Flag to enable/disable active polling.
 */
export const useTaskCommentsQuery = (taskId: string, isOpen: boolean = false) => {
  return useQuery({
    queryKey: ["task-comments", taskId],
    queryFn: () => tasksApi.listComments(taskId),
    enabled: !!taskId && isOpen,
    refetchInterval: isOpen ? 5000 : false,
    staleTime: 2000,
  });
};

/**
 * Hook to add a new comment to a task.
 */
export const useAddCommentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, content }: { taskId: string; content: string }) =>
      tasksApi.addComment(taskId, content),
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ["task-comments", taskId] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Comment posted successfully.");
    },
  });
};

// --- Attachments ---
/**
 * Hook to retrieve files associated with a task.
 */
export const useTaskAttachmentsQuery = (taskId: string) => {
  return useQuery({
    queryKey: ["task-attachments", taskId],
    queryFn: () => tasksApi.listAttachments(taskId),
    enabled: !!taskId,
  });
};

/**
 * Hook to upload a new file attachment to a task.
 */
export const useUploadAttachmentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, file }: { taskId: string; file: File }) =>
      tasksApi.uploadAttachment(taskId, file),
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ["task-attachments", taskId] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Attachment uploaded successfully.");
    },
  });
};

/**
 * Hook to remove an attachment from a task.
 */
export const useDeleteAttachmentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, attachmentId }: { taskId: string; attachmentId: string }) =>
      tasksApi.deleteAttachment(taskId, attachmentId),
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ["task-attachments", taskId] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Attachment removed successfully.");
    },
  });
};
