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
    header: ReactNode;
    accessorKey: keyof T | string;
    cell?: (item: T) => ReactNode;
    className?: string;
    hideOnMobile?: boolean;
}

/**
 * Props for the DataTable component.
 * @template T - The type of data object represented by each row.
 */
interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    isLoading?: boolean;
    isError?: boolean;
    noDataMessage?: string;
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
    <div className="overflow-x-auto rounded border border-brand-dark/10">
      {isLoading ? (
        <div className="flex h-40 w-full items-center justify-center">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      ) : isError ? (
        <div className="flex h-40 w-full items-center justify-center">
          <p className="text-red-500">{t("common.error_loading")}</p>
        </div>
      ) : (
        <Table>
          <TableHeader className="bg-brand-dark/[0.04]">
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
                <TableCell colSpan={columns.length} className="px-6 py-10 text-center text-brand-text-dark/40">
                  {noDataMessage || t("common.no_data")}
                </TableCell>
              </TableRow>
            ) : (
              data.map((item, rowIndex) => (
                <TableRow
                  key={rowIndex}
                  className="cursor-pointer border-b border-brand-dark/5 hover:bg-brand-dark/[0.02]"
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
