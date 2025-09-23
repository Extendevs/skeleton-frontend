export interface PaginatedResponse<T> {
  data: T[];
  total: number;
}

export interface PaginationState {
  page: number;
  pageSize: number;
}

export interface QueryFilters {
  search?: string;
  [key: string]: unknown;
}
