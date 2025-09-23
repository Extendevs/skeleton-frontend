/**
 * Professional List Management Types
 * Based on Angular BaseListService architecture
 */

// Core search params structure (from Angular)
export interface ISearchParams {
    id?: string;
    scopes?: Scope[];
    filters?: Filter[];
    search?: Search | null;
    sort?: Sort[];
    aggregates?: Aggregate[];
    includes?: Include[];
    user_id?: string | null;
}

export interface Scope {
    name: string;
    parameters?: string[];
}

export interface Filter {
    field: string;
    operator: FilterOperator;
    value: any;
    type?: string;
}

export type FilterOperator =
    | '='
    | '!='
    | '>'
    | '>='
    | '<'
    | '<='
    | 'like'
    | 'not_like'
    | 'in'
    | 'not_in'
    | 'between'
    | 'is_null'
    | 'is_not_null';

export interface Search {
    value: string | null;
    case_sensitive?: boolean;
}

export interface Sort {
    field: string;
    direction?: 'asc' | 'desc';
}

export interface Aggregate {
    relation: string;
    type?: string;
    filters?: Filter[];
}

export interface Include {
    relation: string;
    filters?: Filter[];
}

// Response types
export interface IResponseListSuccess<T> {
    data: T[];
    meta?: IPaginationMeta;
    links?: any;
    message?: string;
}

export interface IPaginationMeta {
    current_page: number;
    from: number | null;
    last_page: number;
    per_page: number;
    to: number | null;
    total: number;
    path?: string;
    first_page_url?: string;
    last_page_url?: string;
    next_page_url?: string | null;
    prev_page_url?: string | null;
}

// Pagination state
export interface IPagination {
    page: number;
    limit: number;
    total: number;
    pages: number;
    per_page: number;
    to?: number | null;
    from?: number | null;
}

// Store interface for state management
export interface IListStore<T> {
    entities: T[];
    selectedIds: Set<string | number>;
    meta: IPaginationMeta | null;
    pagination: IPagination;
    loading: boolean;
    saving: boolean;
    deleting: boolean;
    notFound: boolean;
    error: Error | null;
}

// Configuration for list management
export interface IListConfig<T> {
    resourceKey?: string;
    autoInit?: boolean;
    preserveQueryParams?: boolean;
    debounceMs?: number;
    defaultPageSize?: number;
    defaultSort?: Sort;
    overrideParams?: Record<string, any>;
    transformResponse?: (data: T[]) => T[];
    onError?: (error: Error) => void;
    onSuccess?: (data: T[]) => void;
}

// Actions available in list management
export interface IListActions<T> {
    // Data operations
    fetch: (params?: ISearchParams) => Promise<void>;
    refresh: () => Promise<void>;
    reset: () => void;

    // Search & Filter
    search: (value: string | null) => void;
    setFilters: (filters: Record<string, any>) => void;
    addFilter: (filter: Filter) => void;
    removeFilter: (field: string) => void;
    clearFilters: () => void;

    // Sorting
    setSort: (field: string, direction: 'asc' | 'desc') => void;
    clearSort: () => void;

    // Pagination
    setPage: (page: number) => void;
    setPageSize: (limit: number) => void;
    goToFirst: () => void;
    goToLast: () => void;
    goToNext: () => void;
    goToPrev: () => void;

    // Selection
    select: (item: T) => void;
    deselect: (item: T) => void;
    toggleSelection: (item: T) => void;
    selectAll: () => void;
    deselectAll: () => void;

    // Store updates
    updateStore: (updates: Partial<IListStore<T>>) => void;
}
