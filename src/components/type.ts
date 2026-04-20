import { ReactNode } from "react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export interface ContactCardProps {
  name: string;
  role?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  className?: string;
}

export interface PublicPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  totalItems?: number;
  maxVisiblePages?: number;
  className?: string;
}

export interface EmptyPageProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  loading?: boolean;
}

export interface LoadingProps {
  color?: string;
  size?: "small" | "medium" | "large";
}

export type TranslationOptions = Record<string, unknown>;

export interface SearchableSelectOption {
  value: string | number;
  label?: string;
  name?: string;
  name_en?: string;
}

export interface SearchableSelectProps {
  value: string | number;
  onValueChange: (value: string | number) => void;
  options: SearchableSelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  showSearch?: boolean;
  triggerClassName?: string;
  contentClassName?: string;
}

export interface PropsInput {
  value?: string | number | readonly string[] | null;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  [key: string]: unknown;
}

export type StatusType = "pending" | "approved" | "rejected" | "processing" | "completed" | "cancelled";
