
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

export interface IEntity {
  id: string
  name?: string
  include?: string
  created_at?: Date | string
  updated_at?: Date | string
  deleted_at?: Date | string | null
}
