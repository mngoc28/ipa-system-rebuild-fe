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
  const meta = tasksQuery.data?.data?.meta;

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
