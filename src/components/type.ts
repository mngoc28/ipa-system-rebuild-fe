import { ReactNode } from "react";

/**
 * Interface for an individual breadcrumb navigation link.
 */
export interface BreadcrumbItem {
  /** Text to display in the breadcrumb. */
  label: string;
  /** Navigation destination URL. */
  href?: string;
  /** Whether this is the current active page. */
  active?: boolean;
}

/**
 * Props for the Breadcrumb component.
 */
export interface BreadcrumbProps {
  /** Array of breadcrumb segments. */
  items: BreadcrumbItem[];
  /** Optional CSS classes for the container. */
  className?: string;
}

/**
 * Props for a contact information card or summary.
 */
export interface ContactCardProps {
  /** Full name of the contact. */
  name: string;
  /** Job title or role. */
  role?: string;
  /** Email address. */
  email?: string;
  /** Phone number. */
  phone?: string;
  /** URL to the avatar image. */
  avatar?: string;
  /** Custom styling classes. */
  className?: string;
}

/**
 * Standardized pagination props for lists and tables.
 */
export interface PublicPaginationProps {
  /** Current active page (1-indexed). */
  currentPage: number;
  /** Total number of available pages. */
  totalPages: number;
  /** Callback triggered when a user selects a new page. */
  onPageChange: (page: number) => void;
  /** Number of items displayed per page. */
  pageSize?: number;
  /** Callback triggered when items per page is modified. */
  onPageSizeChange?: (size: number) => void;
  /** Total number of items across all pages. */
  totalItems?: number;
  /** Maximum number of numeric page links to show. */
  maxVisiblePages?: number;
  /** Custom styling classes. */
  className?: string;
}

/**
 * Props for a placeholder page displayed when no content is available.
 */
export interface EmptyPageProps {
  /** Header text. */
  title?: string;
  /** Subtext or instructions. */
  description?: string;
  /** React component or icon image. */
  icon?: ReactNode;
  /** Optional button or link element. */
  action?: ReactNode;
  /** Whether to show a spinner instead of the empty state. */
  loading?: boolean;
}

/**
 * Simple configuration for loading spinners.
 */
export interface LoadingProps {
  /** Hex or CSS color string. */
  color?: string;
  /** Predefined size variants. */
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
  /** Underlying technical value. */
  value: string | number;
  /** Primary display text. */
  label?: string;
  /** Vietnamese name (fallback or specific use). */
  name?: string;
  /** English name (fallback or specific use). */
  name_en?: string;
}

/**
 * Props for a standardized searchable dropdown/select component.
 */
export interface SearchableSelectProps {
  /** Current selected value. */
  value: string | number;
  /** Callback for value selection. */
  onValueChange: (value: string | number) => void;
  /** List of selectable options. */
  options: SearchableSelectOption[];
  /** Placeholder for the closed state. */
  placeholder?: string;
  /** Placeholder for the search input. */
  searchPlaceholder?: string;
  /** Message shown when no search results match. */
  emptyMessage?: string;
  /** Style for the container. */
  className?: string;
  /** Prevents interaction. */
  disabled?: boolean;
  /** Shows a loading indicator inside the select. */
  loading?: boolean;
  /** Optional icon to lead the selector. */
  icon?: ReactNode;
  /** Whether to enable filtering via search input. */
  showSearch?: boolean;
  /** Styles for the clickable trigger area. */
  triggerClassName?: string;
  /** Styles for the dropdown overlay. */
  contentClassName?: string;
}

/**
 * Basic props for a controlled input field.
 */
export interface PropsInput {
  /** Input value. */
  value?: string | number | readonly string[] | null;
  /** Change event handler. */
  onChange?: (value: string) => void;
  /** Decorative placeholder. */
  placeholder?: string;
  /** Read-only state. */
  disabled?: boolean;
  /** Custom classes. */
  className?: string;
  /** Additional catch-all attributes. */
  [key: string]: unknown;
}

/**
 * Universal status identifiers used across the application workflow.
 */
export type StatusType = "pending" | "approved" | "rejected" | "processing" | "completed" | "cancelled";
