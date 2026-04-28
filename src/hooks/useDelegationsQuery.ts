import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { delegationsApi } from "@/api/delegationsApi";
import { DelegationsQuery, CreateDelegationPayload } from "@/dataHelper/delegations.dataHelper";
import { toast } from "sonner";

/**
 * Structural helper for handling standard API error responses in mutations.
 */
type ApiErrorLike = {
  response?: {
    data?: {
      error?: {
        message?: string;
      };
    };
  };
};

/**
 * Composite hook providing a query for delegations and mutations for CRUD operations.
 * @param query - Optional filtering and sorting parameters for the delegation list.
 */
export const useDelegationsQuery = (query?: DelegationsQuery, enabled = true) => {
  const queryClient = useQueryClient();

  const delegationsQuery = useQuery({
    queryKey: ["delegations", query],
    queryFn: () => delegationsApi.list(query),
    enabled,
  });

  const createMutation = useMutation({
    mutationFn: delegationsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["delegations"] });
    },
    onError: (error: ApiErrorLike) => {
      toast.error(error.response?.data?.error?.message || "Lỗi khi tạo hồ sơ đoàn công tác.");
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
      toast.error(error.response?.data?.error?.message || "Lỗi khi cập nhật hồ sơ đoàn công tác.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: delegationsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["delegations"] });
    },
    onError: (error: ApiErrorLike) => {
      toast.error(error.response?.data?.error?.message || "Lỗi khi xóa hồ sơ đoàn công tác.");
    },
  });

  return {
    delegationsQuery,
    createMutation,
    updateMutation,
    deleteMutation,
  };
};

/**
 * Hook to retrieve detailed data for a specific delegation.
 * @param id - The delegation identifier.
 */
export const useDelegationDetailQuery = (id: string | number | undefined) => {
  return useQuery({
    queryKey: ["delegation", id?.toString()],
    queryFn: () => delegationsApi.getById(id!),
    enabled: !!id,
  });
};

/**
 * Hook to retrieve the discussion thread (comments) for a delegation.
 * Automatically polls for updates every 5 seconds.
 * @param id - Parent delegation ID.
 */
export const useDelegationCommentsQuery = (id: string | undefined) => {
  return useQuery({
    queryKey: ["delegation-comments", id?.toString()],
    queryFn: () => delegationsApi.listComments(id!),
    enabled: !!id,
    refetchInterval: 5000, // Poll every 5 seconds
  });
};

/**
 * Hook to add a new collaboration comment to a delegation.
 */
export const useAddDelegationCommentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) => delegationsApi.addComment(id, content),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["delegation-comments", variables.id.toString()] });
    },
    onError: (error: ApiErrorLike) => {
      toast.error(error.response?.data?.error?.message || "Không thể gửi bình luận.");
    },
  });
};
/**
 * Hook to modify the content of an existing delegation comment.
 */
export const useUpdateDelegationCommentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, commentId, content }: { id: string; commentId: number; content: string }) => 
      delegationsApi.updateComment(id, commentId, content),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["delegation-comments", variables.id.toString()] });
      toast.success("Đã cập nhật bình luận thành công.");
    },
    onError: (error: ApiErrorLike) => {
      toast.error(error.response?.data?.error?.message || "Cập nhật bình luận thất bại.");
    },
  });
};

/**
 * Hook to permanently remove a comment from a delegation discussion.
 */
export const useDeleteDelegationCommentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, commentId }: { id: string; commentId: number }) => 
      delegationsApi.deleteComment(id, commentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["delegation-comments", variables.id.toString()] });
      toast.success("Đã xóa bình luận thành công.");
    },
    onError: (error: ApiErrorLike) => {
      toast.error(error.response?.data?.error?.message || "Xóa bình luận thất bại.");
    },
  });
};
