import { ReactNode } from "react";

/**
 * Interface for an individual breadcrumb navigation link.
 */
export interface BreadcrumbItem {
    label: string;
    href?: string;
    active?: boolean;
}

/**
 * Props for the Breadcrumb component.
 */
export interface BreadcrumbProps {
    items: BreadcrumbItem[];
    className?: string;
}

/**
 * Props for a contact information card or summary.
 */
export interface ContactCardProps {
    name: string;
    role?: string;
    email?: string;
    phone?: string;
    avatar?: string;
    className?: string;
}

/**
 * Standardized pagination props for lists and tables.
 */
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

/**
 * Props for a placeholder page displayed when no content is available.
 */
export interface EmptyPageProps {
    title?: string;
    description?: string;
    icon?: ReactNode;
    action?: ReactNode;
    loading?: boolean;
}

/**
 * Simple configuration for loading spinners.
 */
export interface LoadingProps {
    color?: string;
    size?: "small" | "medium" | "large";
}

/**
 * Generic options for string translation or template mapping.
 */
export type TranslationOptions = Record<string, unknown>;

/**
 * An option for searchable select components, supporting multi-language.
 */
export interface SearchableSelectOption {
    value: string | number;
    label?: string;
    name?: string;
    name_en?: string;
}

/**
 * Props for a standardized searchable dropdown/select component.
 */
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

/**
 * Basic props for a controlled input field.
 */
export interface PropsInput {
    value?: string | number | readonly string[] | null;
    onChange?: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    [key: string]: unknown;
}

/**
 * Universal status identifiers used across the application workflow.
 */
export type StatusType = "pending" | "approved" | "rejected" | "processing" | "completed" | "cancelled";
