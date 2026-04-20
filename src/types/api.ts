/**
 * Standard API response wrapper (envelope) for successful requests.
 * @template T - The type of the data payload.
 */
export interface ApiEnvelope<T> {
  /** Indicates if the request was successful */
  success: boolean;
  /** The actual response data */
  data: T;
  /** Pagination and sorting metadata */
  meta?: {
    /** Current page number */
    page: number;
    /** Number of items per page */
    per_page: number;
    /** Total number of items across all pages */
    total: number;
    /** Total number of pages */
    total_pages: number;
    /** Field used for sorting */
    sort_field: string;
    /** Direction of sorting (asc/desc) */
    sort_direction: string;
    /** Alternative page size name used by some endpoints */
    pageSize?: number;
    /** Alternative total pages name used by some endpoints */
    totalPages?: number;
    /** Alternative sort field name used by some endpoints */
    sortBy?: string;
    /** Alternative sort direction name used by some endpoints */
    sortDir?: string;
  };
  /** Optional status or information message */
  message?: string;
  /** Unique ID for tracking the request context */
  requestId?: string;
  /** Server timestamp of the response */
  timestamp?: string;
}

/**
 * Standard API response wrapper for failed requests.
 */
export interface ApiErrorEnvelope {
  /** Success is always false for error responses */
  success: false;
  /** Error details container */
  error: {
    /** Machine-readable error code */
    code: string;
    /** Human-readable error description */
    message: string;
    /** Optional field-level validation errors or further details */
    details?: Array<{ field?: string; message?: string }>;
  };
  /** Unique ID for tracking the request context */
  requestId?: string;
  /** Server timestamp of the error response */
  timestamp?: string;
}

/**
 * Generic interface for paginated data responses.
 * @template T - The type of items in the list.
 */
export interface PaginatedData<T> {
  /** Array of items on the current page */
  items: T[];
}
