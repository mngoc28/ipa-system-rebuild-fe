import { useInfiniteQuery } from "@tanstack/react-query";
import { auditLogsApi, type AuditLogListQuery } from "@/api/auditLogsApi";

/**
 * Hook to retrieve an infinite paginated stream of system audit logs.
 * Supports infinite scrolling by tracking the next page parameter.
 * @param query - Search term, event type, and other filters (page is managed internally).
 */
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
