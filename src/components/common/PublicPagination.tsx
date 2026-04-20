import * as React from "react";
import { ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { PublicPaginationProps } from "../type";

const PublicPagination = ({
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  onPageSizeChange,
  totalItems,
  maxVisiblePages = 5,
  className,
}: PublicPaginationProps) => {
  const { t } = useTranslation();

  const handlePageClick = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  const handlePerPageChange = (e: ChangeEvent<HTMLSelectElement>) => {
    onPageSizeChange?.(Number(e.target.value));
  };

  const getVisiblePages = (): (number | "ellipsis")[] => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

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
      <div className="flex items-center gap-3">
        {onPageSizeChange && pageSize && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700">{t("pagination.show")}</span>
            <div className="relative">
              <select
                className="appearance-none rounded-lg border border-slate-300 bg-white py-2 pl-3 pr-8 text-sm font-medium text-slate-700 shadow-sm outline-none"
                value={pageSize}
                onChange={handlePerPageChange}
              >
                {[10, 20, 30, 50].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            </div>
          </div>
        )}
        {totalItems !== undefined && (
          <span className="text-sm text-slate-600">
            {totalItems} {t("pagination.total")}
          </span>
        )}
      </div>

      <nav className="flex items-center gap-1">
        <button
          onClick={() => handlePageClick(currentPage - 1)}
          disabled={isPreviousDisabled}
          className={cn(
            "flex h-10 min-w-[100px] items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium transition-all",
            isPreviousDisabled
              ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
              : "border-slate-300 bg-white text-slate-700 hover:border-blue-400 hover:bg-blue-50"
          )}
        >
          <ChevronLeft className="size-4" />
          <span>{t("pagination.previous")}</span>
        </button>

        <div className="flex items-center gap-1">
          {getVisiblePages().map((page, idx) => {
            if (page === "ellipsis") {
              return (
                <span key={`ellipsis-${idx}`} className="flex size-10 items-center justify-center text-slate-400">
                  ···
                </span>
              );
            }
            const isActive = page === currentPage;
            return (
              <button
                key={page as number}
                onClick={() => handlePageClick(page as number)}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg text-sm font-semibold transition-all",
                  isActive
                    ? "bg-blue-600 text-white shadow-md"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-blue-50"
                )}
              >
                {page}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => handlePageClick(currentPage + 1)}
          disabled={isNextDisabled}
          className={cn(
            "flex h-10 min-w-[100px] items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium transition-all",
            isNextDisabled
              ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
              : "border-slate-300 bg-white text-slate-700 hover:border-blue-400 hover:bg-blue-50"
          )}
        >
          <span>{t("pagination.next")}</span>
          <ChevronRight className="size-4" />
        </button>
      </nav>
    </div>
  );
};

export default PublicPagination;
