
export interface PaginatedResponse<T> {
  data: T[];
  total?: number;
  meta?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    from: number | null;
    to: number | null;
    first_page_url?: string;
    last_page_url?: string;
    next_page_url?: string | null;
    prev_page_url?: string | null;
    path?: string;
  };
  links?: {
    first?: string;
    last?: string;
    prev?: string | null;
    next?: string | null;
  };
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
