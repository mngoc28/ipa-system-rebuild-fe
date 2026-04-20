import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { tasksApi } from "@/api/tasksApi";
import {
  mapTaskItemsToUi,
  type TaskCreatePayload,
  type TaskPatchPayload,
} from "@/dataHelper/tasks.dataHelper";
import * as React from "react";

export interface TasksQueryOptions {
  status?: number;
  priority?: number;
  search?: string;
  page?: number;
  pageSize?: number;
}

export const useTasksListQuery = (options: TasksQueryOptions = {}) => {
  const tasksQuery = useQuery({
    queryKey: ["tasks", options],
    queryFn: () => tasksApi.list(options),
  });

  const tasks = React.useMemo(() => mapTaskItemsToUi(tasksQuery.data?.data?.items ?? []), [tasksQuery.data]);
  const meta = tasksQuery.data?.meta;

  return { tasksQuery, tasks, meta };
};

export const useCreateTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TaskCreatePayload) => tasksApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Đã tạo công việc mới.");
    },
    onError: () => toast.error("Không thể tạo công việc."),
  });
};

export const useUpdateTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: TaskPatchPayload }) => tasksApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Đã cập nhật công việc.");
    },
    onError: () => toast.error("Cập nhật thất bại."),
  });
};

export const useDeleteTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tasksApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Đã xóa công việc.");
    },
    onError: () => toast.error("Xóa thất bại."),
  });
};

// --- Comments ---
export const useTaskCommentsQuery = (taskId: string, isOpen: boolean = false) => {
  return useQuery({
    queryKey: ["task-comments", taskId],
    queryFn: () => tasksApi.listComments(taskId),
    enabled: !!taskId && isOpen,
    refetchInterval: isOpen ? 5000 : false,
    staleTime: 2000,
  });
};

export const useAddCommentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, content }: { taskId: string; content: string }) =>
      tasksApi.addComment(taskId, content),
    onSuccess: (_, { taskId }) => {
      // taskId is string here; cache key also uses string — they match
      queryClient.invalidateQueries({ queryKey: ["task-comments", taskId] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Đã gửi bình luận.");
    },
  });
};

// --- Attachments ---
export const useTaskAttachmentsQuery = (taskId: string) => {
  return useQuery({
    queryKey: ["task-attachments", taskId],
    queryFn: () => tasksApi.listAttachments(taskId),
    enabled: !!taskId,
  });
};

export const useUploadAttachmentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, file }: { taskId: string; file: File }) =>
      tasksApi.uploadAttachment(taskId, file),
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ["task-attachments", taskId] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Đã tải lên tệp đính kèm.");
    },
  });
};

export const useDeleteAttachmentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, attachmentId }: { taskId: string; attachmentId: string }) =>
      tasksApi.deleteAttachment(taskId, attachmentId),
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ["task-attachments", taskId] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Đã xóa tệp đính kèm.");
    },
  });
};
