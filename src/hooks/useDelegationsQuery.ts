import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { delegationsApi } from "@/api/delegationsApi";
import { DelegationsQuery, CreateDelegationPayload } from "@/dataHelper/delegations.dataHelper";
import { toast } from "sonner";

type ApiErrorLike = {
  response?: {
    data?: {
      error?: {
        message?: string;
      };
    };
  };
};

export const useDelegationsQuery = (query?: DelegationsQuery) => {
  const queryClient = useQueryClient();

  const delegationsQuery = useQuery({
    queryKey: ["delegations", query],
    queryFn: () => delegationsApi.list(query),
  });

  const createMutation = useMutation({
    mutationFn: delegationsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["delegations"] });
    },
    onError: (error: ApiErrorLike) => {
      toast.error(error.response?.data?.error?.message || "Lỗi khi tạo hồ sơ đoàn.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: Partial<CreateDelegationPayload> }) =>
      delegationsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["delegations"] });
      queryClient.invalidateQueries({ queryKey: ["delegation", variables.id.toString()] });
    },
    onError: (error: ApiErrorLike) => {
      toast.error(error.response?.data?.error?.message || "Lỗi khi cập nhật hồ sơ đoàn.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: delegationsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["delegations"] });
    },
    onError: (error: ApiErrorLike) => {
      toast.error(error.response?.data?.error?.message || "Lỗi khi xóa hồ sơ đoàn.");
    },
  });

  return {
    delegationsQuery,
    createMutation,
    updateMutation,
    deleteMutation,
  };
};

export const useDelegationDetailQuery = (id: string | number | undefined) => {
  return useQuery({
    queryKey: ["delegation", id?.toString()],
    queryFn: () => delegationsApi.getById(id!),
    enabled: !!id,
  });
};

export const useDelegationCommentsQuery = (id: string | undefined) => {
  return useQuery({
    queryKey: ["delegation-comments", id?.toString()],
    queryFn: () => delegationsApi.listComments(id!),
    enabled: !!id,
    refetchInterval: 5000, // Poll every 5 seconds
  });
};

export const useAddDelegationCommentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) => delegationsApi.addComment(id, content),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["delegation-comments", variables.id.toString()] });
    },
    onError: (error: ApiErrorLike) => {
      toast.error(error.response?.data?.error?.message || "Tải bình luận thất bại.");
    },
  });
};
export const useUpdateDelegationCommentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, commentId, content }: { id: string; commentId: number; content: string }) => 
      delegationsApi.updateComment(id, commentId, content),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["delegation-comments", variables.id.toString()] });
      toast.success("Đã cập nhật bình luận.");
    },
    onError: (error: ApiErrorLike) => {
      toast.error(error.response?.data?.error?.message || "Cập nhật bình luận thất bại.");
    },
  });
};

export const useDeleteDelegationCommentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, commentId }: { id: string; commentId: number }) => 
      delegationsApi.deleteComment(id, commentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["delegation-comments", variables.id.toString()] });
      toast.success("Đã xóa bình luận.");
    },
    onError: (error: ApiErrorLike) => {
      toast.error(error.response?.data?.error?.message || "Xóa bình luận thất bại.");
    },
  });
};
