import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { delegationsApi } from "@/api/delegationsApi";
import { DelegationsQuery, CreateDelegationPayload } from "@/dataHelper/delegations.dataHelper";
import { toast } from "sonner";

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
      toast.success("Tạo hồ sơ đoàn công tác thành công!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || "Lỗi khi tạo hồ sơ đoàn.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: Partial<CreateDelegationPayload> }) =>
      delegationsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["delegations"] });
      toast.success("Cập nhật hồ sơ đoàn thành công!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || "Lỗi khi cập nhật hồ sơ đoàn.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: delegationsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["delegations"] });
      toast.success("Xóa hồ sơ đoàn thành công!");
    },
    onError: (error: any) => {
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
    queryKey: ["delegation", id],
    queryFn: () => delegationsApi.getById(id!),
    enabled: !!id,
  });
};
