/**
 * Standard API response wrapper (envelope) for successful requests.
 * @template T - The type of the data payload.
 */
export interface ApiEnvelope<T> {
    success: boolean;
    data: T;
    meta?: {
        page: number;
        per_page: number;
        total: number;
        total_pages: number;
        sort_field: string;
        sort_direction: string;
        pageSize?: number;
        totalPages?: number;
        sortBy?: string;
        sortDir?: string;
  };
    message?: string;
    requestId?: string;
    timestamp?: string;
}

/**
 * Standard API response wrapper for failed requests.
 */
export interface ApiErrorEnvelope {
    success: false;
    error: {
        code: string;
        message: string;
        details?: Array<{ field?: string; message?: string }>;
  };
    requestId?: string;
    timestamp?: string;
}

/**
 * Generic interface for paginated data responses.
 * @template T - The type of items in the list.
 */
export interface PaginatedData<T> {
    items: T[];
}
