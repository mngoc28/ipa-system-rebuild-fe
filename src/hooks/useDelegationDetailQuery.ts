import { useQuery } from "@tanstack/react-query";
import { delegationsApi } from "@/api/delegationsApi";

/**
 * Hook to retrieve full metadata and project list for a specific delegation.
 * @param id - The unique delegation ID.
 */
export const useDelegationDetailQuery = (id?: string) => {
  return useQuery({
    queryKey: ["delegation-detail", id],
    queryFn: () => delegationsApi.getById(String(id)),
    enabled: Boolean(id),
  });
};
