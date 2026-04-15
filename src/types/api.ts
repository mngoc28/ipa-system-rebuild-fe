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

export interface PaginatedData<T> {
  items: T[];
}
