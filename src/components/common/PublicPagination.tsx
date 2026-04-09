import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { PublicPaginationProps } from "../type";

// PublicPagination Component
const PublicPagination = ({
  currentPage,
  totalPages,
  onPageChange,
  perPage,
  onPerPageChange,
  totalItems,
  maxVisiblePages = 5,
  perPageOptions = [10, 20, 30, 50],
  className,
}: PublicPaginationProps) => {
  const { t } = useTranslation();

  const handlePageClick = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  // Handle change in items per page
  const handlePerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onPerPageChange?.(Number(e.target.value));
  };

  // Determine visible page numbers with ellipsis
  const getVisiblePages = (): (number | "ellipsis")[] => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Generate page numbers with ellipsis
    const pages: (number | "ellipsis")[] = [];
    const half = Math.floor(maxVisiblePages / 2);
    let start = Math.max(2, currentPage - half);
    let end = Math.min(totalPages - 1, currentPage + half);

    if (currentPage <= half + 1) {
      start = 2;
      end = maxVisiblePages - 1;
    } else if (currentPage + half >= totalPages) {
      start = totalPages - maxVisiblePages + 2;
      end = totalPages - 1;
    }

    pages.push(1);
    if (start > 2) pages.push("ellipsis");
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages - 1) pages.push("ellipsis");
    if (totalPages > 1) pages.push(totalPages);

    return pages;
  };

  const isPreviousDisabled = currentPage === 1;
  const isNextDisabled = currentPage === totalPages;

  return (
    <div className={cn("flex flex-col items-center justify-between gap-4 sm:flex-row", className)}>
      {/* Items per page and total count */}
      <div className="flex items-center gap-3">
        {onPerPageChange && perPage && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700">
              {t("pagination.show", { defaultValue: "Show" })}
            </span>
            <select
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 hover:border-slate-400"
              value={perPage}
              onChange={handlePerPageChange}
              aria-label={t("pagination.items_per_page", { defaultValue: "Items per page" })}
            >
              {perPageOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <span className="text-sm font-medium text-slate-700">
              {t("pagination.per_page", { defaultValue: "per page" })}
            </span>
          </div>
        )}
        {totalItems !== undefined && (
          <span className="text-sm text-slate-600">
            {t("pagination.total", { count: totalItems, defaultValue: `${totalItems} total` })}
          </span>
        )}
      </div>

      {/* Page navigation */}
      <nav aria-label="Pagination navigation" className="flex items-center gap-1">
        {/* Previous button */}
        <button
          onClick={() => handlePageClick(currentPage - 1)}
          disabled={isPreviousDisabled}
          aria-label="Previous page"
          className={cn(
            "flex h-10 min-w-[100px] items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium transition-all",
            isPreviousDisabled
              ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
              : "border-slate-300 bg-white text-slate-700 shadow-sm hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700"
          )}
        >
          <ChevronLeft className="h-4 w-4" />
          <span>{t("pagination.previous", { defaultValue: "Previous" })}</span>
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {getVisiblePages().map((page, idx) => {
            if (page === "ellipsis") {
              return (
                <span key={`ellipsis-${idx}`} className="flex h-10 w-10 items-center justify-center text-slate-400">
                  ···
                </span>
              );
            }
            const pageNumber = page as number;
            const isActive = pageNumber === currentPage;
            return (
              <button
                key={pageNumber}
                onClick={() => handlePageClick(pageNumber)}
                aria-label={`Page ${pageNumber}`}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg text-sm font-semibold transition-all",
                  isActive
                    ? "bg-blue-600 text-white shadow-md hover:bg-blue-700"
                    : "bg-white text-slate-700 shadow-sm hover:bg-blue-50 hover:text-blue-700 border border-slate-200 hover:border-blue-300"
                )}
              >
                {pageNumber}
              </button>
            );
          })}
        </div>

        {/* Next button */}
        <button
          onClick={() => handlePageClick(currentPage + 1)}
          disabled={isNextDisabled}
          aria-label="Next page"
          className={cn(
            "flex h-10 min-w-[100px] items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium transition-all",
            isNextDisabled
              ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
              : "border-slate-300 bg-white text-slate-700 shadow-sm hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700"
          )}
        >
          <span>{t("pagination.next", { defaultValue: "Next" })}</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </nav>
    </div>
  );
};

export default PublicPagination;
