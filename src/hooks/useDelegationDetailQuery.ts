import { useQuery } from "@tanstack/react-query";
import { delegationsApi } from "@/api/delegationsApi";

export const useDelegationDetailQuery = (id?: string) => {
  return useQuery({
    queryKey: ["delegation-detail", id],
    queryFn: () => delegationsApi.getById(String(id)),
    enabled: Boolean(id),
  });
};