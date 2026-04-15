import { useInfiniteQuery } from "@tanstack/react-query";
import { auditLogsApi, type AuditLogListQuery } from "@/api/auditLogsApi";

export const useAuditLogsQuery = (query: Omit<AuditLogListQuery, "page">) => {
  return useInfiniteQuery({
    queryKey: ["audit-logs", query],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      auditLogsApi.list({
        ...query,
        page: Number(pageParam),
        pageSize: query.pageSize || 5,
      }),
    getNextPageParam: (lastPage) => {
      const meta = lastPage.meta;

      if (!meta) {
        return undefined;
      }

      const totalPages = meta.totalPages ?? 1;

      return meta.page < totalPages ? meta.page + 1 : undefined;
    },
  });
};