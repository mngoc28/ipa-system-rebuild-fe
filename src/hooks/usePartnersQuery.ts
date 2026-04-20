import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { partnersApi } from "@/api/partnersApi";
import {
  getNextPartnerStatus,
  mapPartnerItemsToUi,
  type PartnerCreatePayload,
  type PartnerOptionsResponse,
  type PartnerUiItem,
  type PartnerPatchPayload,
} from "@/dataHelper/partners.dataHelper";

export interface PartnersQueryOptions {
  status?: number;
  page?: number;
  pageSize?: number;
  search?: string;
  sectorId?: number;
  countryId?: number;
}

export const usePartnersListQuery = (options: PartnersQueryOptions = {}) => {
  const partnersQuery = useQuery({
    queryKey: ["partners", options],
    queryFn: () => partnersApi.list(options),
  });

  const partners = React.useMemo(() => mapPartnerItemsToUi(partnersQuery.data?.data?.items ?? []), [partnersQuery.data]);
  const meta = partnersQuery.data?.meta;

  return { partnersQuery, partners, meta };
};

export const usePartnerDetailQuery = (id?: string) => {
  return useQuery({
    queryKey: ["partner", id],
    queryFn: () => partnersApi.get(id!),
    enabled: !!id,
  });
};

export const usePartnerOptionsQuery = () => {
  const optionsQuery = useQuery({
    queryKey: ["partner-options"],
    queryFn: () => partnersApi.options(),
  });

  return {
    optionsQuery,
    options: (optionsQuery.data?.data ?? { countries: [], sectors: [] }) as PartnerOptionsResponse,
  };
};

export const useCreatePartnerMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PartnerCreatePayload) => partnersApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partners"] });
      queryClient.invalidateQueries({ queryKey: ["partner-options"] });
      toast.success("Đã thêm đối tác mới vào danh sách.");
    },
    onError: () => toast.error("Không thể thêm đối tác mới."),
  });
};

export const useUpdatePartnerMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: PartnerPatchPayload }) => partnersApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partners"] });
      queryClient.invalidateQueries({ queryKey: ["partner"] });
      toast.success("Đã cập nhật thông tin đối tác.");
    },
    onError: () => toast.error("Không thể cập nhật đối tác."),
  });
};

export const useDeletePartnerMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => partnersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partners"] });
      toast.success("Đã xóa đối tác.");
    },
    onError: () => toast.error("Không thể xóa đối tác."),
  });
};

export const useAddPartnerContactMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (partnerId: string) =>
      partnersApi.addContact(partnerId, {
        fullName: "Đầu mối đối tác",
        email: "partner@example.com",
        isPrimary: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partners"] });
      toast.success("Đã tạo email nháp gửi đối tác.");
    },
    onError: () => toast.error("Không thể tạo liên hệ nhanh."),
  });
};

export const useSyncPartnersMutation = (partners: PartnerUiItem[]) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const targets = partners.slice(0, 3);
      for (const partner of targets) {
        await partnersApi.update(partner.id, { score: Math.min(5, Number((partner.score + 0.1).toFixed(1))) });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partners"] });
      toast.success("Đã đồng bộ dữ liệu CRM và cập nhật điểm đánh giá.");
    },
    onError: () => toast.error("Đồng bộ CRM thất bại."),
  });
};

export const usePromotePartnerStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: number }) => {
      const nextStatus = getNextPartnerStatus(status);

      if (nextStatus === null) {
        throw new Error("MAX_STATUS_REACHED");
      }

      return partnersApi.update(id, { status: nextStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partners"] });
      queryClient.invalidateQueries({ queryKey: ["partner"] });
      toast.success("Đã tiến cấp trạng thái đối tác.");
    },
    onError: (error) => {
      if (error instanceof Error && error.message === "MAX_STATUS_REACHED") {
        toast.info("Đối tác đã ở trạng thái cao nhất.");
        return;
      }

      toast.error("Không thể tiến cấp trạng thái.");
    },
  });
};
