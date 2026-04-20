import * as React from "react";
import { ReactNode } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

/**
 * Definition for a single column in the DataTable.
 * @template T - The type of data object represented by each row.
 */
export interface Column<T> {
  /** The rendered header content for this column. */
  header: ReactNode;
  /** The key in the data object to access, or a string for custom rendering. */
  accessorKey: keyof T | string;
  /** Optional custom rendering function for cells in this column. */
  cell?: (item: T) => ReactNode;
  /** Optional CSS classes for both header and data cells. */
  className?: string;
  /** Whether to hide this column on mobile screens. */
  hideOnMobile?: boolean;
}

/**
 * Props for the DataTable component.
 * @template T - The type of data object represented by each row.
 */
interface DataTableProps<T> {
  /** The array of data objects to display. */
  data: T[];
  /** Configuration for the table columns. */
  columns: Column<T>[];
  /** Whether the table is currently fetching data. */
  isLoading?: boolean;
  /** Whether a data fetching error occurred. */
  isError?: boolean;
  /** Custom message to display when the data array is empty. */
  noDataMessage?: string;
  /** Optional callback triggered when a row is clicked. */
  onRowClick?: (item: T) => void;
}

/**
 * A flexible, generic table component for displaying structured data.
 * Features include loading states, error handling, mobile responsiveness,
 * and custom cell rendering.
 * 
 * @template T - The type of data object represented by each row.
 * @param props - Component props following DataTableProps interface.
 */
const DataTable = <T extends object>({
  data,
  columns,
  isLoading = false,
  isError = false,
  noDataMessage,
  onRowClick,
}: DataTableProps<T>) => {
  const { t } = useTranslation();

  const renderCell = (item: T, column: Column<T>) => {
    if (column.cell) {
      return column.cell(item);
    }

    const value = item[column.accessorKey as keyof T];
    return value as ReactNode;
  };

  return (
    <div className="overflow-x-auto rounded border border-blue-100">
      {isLoading ? (
        <div className="flex h-40 w-full items-center justify-center">
          <Loader2 className="size-8 animate-spin text-slate-500" />
        </div>
      ) : isError ? (
        <div className="flex h-40 w-full items-center justify-center">
          <p className="text-red-500">{t("common.error_loading")}</p>
        </div>
      ) : (
        <Table>
          <TableHeader className="bg-slate-100">
            <TableRow className="whitespace-nowrap">
              {columns.map((column, index) => (
                <TableHead
                  key={index}
                  className={`${column.className} ${column.hideOnMobile ? "hidden md:table-cell" : ""}`}
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="px-6 py-10 text-center text-slate-500">
                  {noDataMessage || t("common.no_data")}
                </TableCell>
              </TableRow>
            ) : (
              data.map((item, rowIndex) => (
                <TableRow
                  key={rowIndex}
                  className="cursor-pointer border-b border-blue-100 hover:bg-slate-50"
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((column, colIndex) => (
                    <TableCell
                      key={colIndex}
                      className={`${column.className} ${column.hideOnMobile ? "hidden md:table-cell" : ""}`}
                    >
                      {renderCell(item, column)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default DataTable;
