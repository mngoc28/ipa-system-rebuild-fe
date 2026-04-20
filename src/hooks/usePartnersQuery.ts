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

/**
 * Parameters for filtering and paginating the partners list.
 */
export interface PartnersQueryOptions {
    status?: number;
    page?: number;
    pageSize?: number;
    search?: string;
    sectorId?: number;
    countryId?: number;
}

/**
 * Hook to retrieve a filtered and paginated list of partners.
 * Transforms raw API items into UI-ready items.
 * @param options - Filtering and pagination criteria.
 */
export const usePartnersListQuery = (options: PartnersQueryOptions = {}) => {
  const partnersQuery = useQuery({
    queryKey: ["partners", options],
    queryFn: () => partnersApi.list(options),
  });

  const partners = React.useMemo(() => mapPartnerItemsToUi(partnersQuery.data?.data?.items ?? []), [partnersQuery.data]);
  const meta = partnersQuery.data?.meta;

  return { partnersQuery, partners, meta };
};

/**
 * Hook to retrieve full detailed information for a specific partner.
 * @param id - The partner unique ID.
 */
export const usePartnerDetailQuery = (id?: string) => {
  return useQuery({
    queryKey: ["partner", id],
    queryFn: () => partnersApi.get(id!),
    enabled: !!id,
  });
};

/**
 * Hook to retrieve available dropdown options (countries, sectors) for partner forms.
 */
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

/**
 * Hook to onboard a new partner organization.
 */
export const useCreatePartnerMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PartnerCreatePayload) => partnersApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partners"] });
      queryClient.invalidateQueries({ queryKey: ["partner-options"] });
      toast.success("New partner added successfully.");
    },
    onError: () => toast.error("Failed to add partner."),
  });
};

/**
 * Hook to update an existing partner's profile information.
 */
export const useUpdatePartnerMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: PartnerPatchPayload }) => partnersApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partners"] });
      queryClient.invalidateQueries({ queryKey: ["partner"] });
      toast.success("Partner information updated.");
    },
    onError: () => toast.error("Failed to update partner."),
  });
};

/**
 * Hook to remove a partner from the system.
 */
export const useDeletePartnerMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => partnersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partners"] });
      toast.success("Partner deleted.");
    },
    onError: () => toast.error("Failed to delete partner."),
  });
};

/**
 * Hook to quickly add a placeholder contact for a partner and generate a draft email.
 */
export const useAddPartnerContactMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (partnerId: string) =>
      partnersApi.addContact(partnerId, {
        fullName: "Partner Point of Contact",
        email: "partner@example.com",
        isPrimary: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partners"] });
      toast.success("Draft email for partner generated.");
    },
    onError: () => toast.error("Failed to create quick contact."),
  });
};

/**
 * Hook to synchronize local partner data with the external CRM system.
 * Simulates scoring updates for the first few partners.
 */
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
      toast.success("CRM synchronized and partner scores updated.");
    },
    onError: () => toast.error("CRM synchronization failed."),
  });
};

/**
 * Hook to advance a partner's relationship status to the next level.
 */
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
      toast.success("Partner status promoted.");
    },
    onError: (error) => {
      if (error instanceof Error && error.message === "MAX_STATUS_REACHED") {
        toast.info("Partner is already at the highest status.");
        return;
      }

      toast.error("Failed to promote status.");
    },
  });
};
