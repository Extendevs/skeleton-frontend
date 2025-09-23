import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDebouncedValue } from '../../shared/hooks/useDebouncedValue';
import {
    IListStore,
    IListConfig,
    IListActions,
    ISearchParams,
    Filter,
    Sort,
    IPagination,
    IResponseListSuccess,
    IPaginationMeta
} from '../interfaces/list.types';

// Action types
enum ActionType {
    SET_ENTITIES = 'SET_ENTITIES',
    SET_META = 'SET_META',
    SET_LOADING = 'SET_LOADING',
    SET_SAVING = 'SET_SAVING',
    SET_DELETING = 'SET_DELETING',
    SET_ERROR = 'SET_ERROR',
    SET_NOT_FOUND = 'SET_NOT_FOUND',
    ADD_ENTITY = 'ADD_ENTITY',
    UPDATE_ENTITY = 'UPDATE_ENTITY',
    REMOVE_ENTITY = 'REMOVE_ENTITY',
    SELECT_ENTITY = 'SELECT_ENTITY',
    DESELECT_ENTITY = 'DESELECT_ENTITY',
    SELECT_ALL = 'SELECT_ALL',
    DESELECT_ALL = 'DESELECT_ALL',
    SET_PAGINATION = 'SET_PAGINATION',
    RESET = 'RESET'
}

type Action<T> =
    | { type: ActionType.SET_ENTITIES; payload: T[] }
    | { type: ActionType.SET_META; payload: IPaginationMeta | null }
    | { type: ActionType.SET_LOADING; payload: boolean }
    | { type: ActionType.SET_SAVING; payload: boolean }
    | { type: ActionType.SET_DELETING; payload: boolean }
    | { type: ActionType.SET_ERROR; payload: Error | null }
    | { type: ActionType.SET_NOT_FOUND; payload: boolean }
    | { type: ActionType.ADD_ENTITY; payload: T }
    | { type: ActionType.UPDATE_ENTITY; payload: { id: string | number; updates: Partial<T> } }
    | { type: ActionType.REMOVE_ENTITY; payload: string | number }
    | { type: ActionType.SELECT_ENTITY; payload: string | number }
    | { type: ActionType.DESELECT_ENTITY; payload: string | number }
    | { type: ActionType.SELECT_ALL; payload: (string | number)[] }
    | { type: ActionType.DESELECT_ALL }
    | { type: ActionType.SET_PAGINATION; payload: Partial<IPagination> }
    | { type: ActionType.RESET };

/**
 * Professional list state reducer
 */
function listReducer<T extends { id: string | number }>(
    state: IListStore<T>,
    action: Action<T>
): IListStore<T> {
    switch (action.type) {
        case ActionType.SET_ENTITIES:
            return {
                ...state,
                entities: action.payload,
                notFound: action.payload.length === 0
            };

        case ActionType.SET_META:
            if (!action.payload) {
                return { ...state, meta: null };
            }
            return {
                ...state,
                meta: action.payload,
                pagination: {
                    page: action.payload.current_page,
                    limit: action.payload.per_page,
                    total: action.payload.total,
                    pages: action.payload.last_page,
                    per_page: action.payload.per_page,
                    from: action.payload.from,
                    to: action.payload.to
                }
            };

        case ActionType.SET_LOADING:
            return { ...state, loading: action.payload };

        case ActionType.SET_SAVING:
            return { ...state, saving: action.payload };

        case ActionType.SET_DELETING:
            return { ...state, deleting: action.payload };

        case ActionType.SET_ERROR:
            return { ...state, error: action.payload };

        case ActionType.SET_NOT_FOUND:
            return { ...state, notFound: action.payload };

        case ActionType.ADD_ENTITY:
            return {
                ...state,
                entities: [action.payload, ...state.entities],
                pagination: {
                    ...state.pagination,
                    total: state.pagination.total + 1
                }
            };

        case ActionType.UPDATE_ENTITY:
            return {
                ...state,
                entities: state.entities.map(entity =>
                    entity.id === action.payload.id
                        ? { ...entity, ...action.payload.updates }
                        : entity
                )
            };

        case ActionType.REMOVE_ENTITY:
            return {
                ...state,
                entities: state.entities.filter(entity => entity.id !== action.payload),
                selectedIds: new Set(Array.from(state.selectedIds).filter(id => id !== action.payload)),
                pagination: {
                    ...state.pagination,
                    total: Math.max(0, state.pagination.total - 1)
                }
            };

        case ActionType.SELECT_ENTITY:
            const newSelected = new Set(state.selectedIds);
            newSelected.add(action.payload);
            return { ...state, selectedIds: newSelected };

        case ActionType.DESELECT_ENTITY:
            const filtered = new Set(state.selectedIds);
            filtered.delete(action.payload);
            return { ...state, selectedIds: filtered };

        case ActionType.SELECT_ALL:
            return { ...state, selectedIds: new Set(action.payload) };

        case ActionType.DESELECT_ALL:
            return { ...state, selectedIds: new Set() };

        case ActionType.SET_PAGINATION:
            return {
                ...state,
                pagination: { ...state.pagination, ...action.payload }
            };

        case ActionType.RESET:
            return {
                entities: [],
                selectedIds: new Set(),
                meta: null,
                pagination: {
                    page: 1,
                    limit: 20,
                    total: 0,
                    pages: 0,
                    per_page: 20,
                    from: null,
                    to: null
                },
                loading: false,
                saving: false,
                deleting: false,
                notFound: false,
                error: null
            };

        default:
            return state;
    }
}

/**
 * Professional List Management Hook
 * Inspired by Angular BaseListService but properly adapted to React
 */
export function useListManager<T extends { id: string | number }>(
    fetchFn: (params: any) => Promise<IResponseListSuccess<T>>,
    config: IListConfig<T> = {}
) {
    const {
        resourceKey,
        autoInit = true,
        preserveQueryParams = false,
        debounceMs = 400,
        defaultPageSize = 20,
        defaultSort,
        overrideParams = {},
        transformResponse,
        onError,
        onSuccess
    } = config;

    const [searchParams, setSearchParams] = useSearchParams();
    const paramsBeforeSearch = useRef<string>('');

    // Initialize state
    const initialState: IListStore<T> = {
        entities: [],
        selectedIds: new Set(),
        meta: null,
        pagination: {
            page: preserveQueryParams && searchParams.get('page')
                ? parseInt(searchParams.get('page')!, 10)
                : 1,
            limit: preserveQueryParams && searchParams.get('limit')
                ? parseInt(searchParams.get('limit')!, 10)
                : defaultPageSize,
            total: 0,
            pages: 0,
            per_page: defaultPageSize,
            from: null,
            to: null
        },
        loading: false,
        saving: false,
        deleting: false,
        notFound: false,
        error: null
    };

    const [store, dispatch] = useReducer(listReducer<T>, initialState);

    // Search params state
    const [paramsSearch, setParamsSearch] = useReducer(
        (state: ISearchParams, updates: Partial<ISearchParams>) => ({ ...state, ...updates }),
        {
            search: preserveQueryParams && searchParams.get('search')
                ? { value: searchParams.get('search'), case_sensitive: false }
                : null,
            filters: [],
            sort: defaultSort ? [defaultSort] : [],
            scopes: [],
            includes: [],
            aggregates: []
        }
    );

    // Debounced search
    const debouncedSearch = useDebouncedValue(paramsSearch.search?.value || '', debounceMs);

    /**
     * Build params for API call
     */
    const buildParams = useCallback(() => {
        const params: any = {
            page: store.pagination.page,
            limit: store.pagination.limit,
            ...overrideParams
        };

        // Process search params
        const processedSearch = { ...paramsSearch };

        // Use debounced search
        if (debouncedSearch) {
            processedSearch.search = {
                value: debouncedSearch.trim(),
                case_sensitive: false
            };
        } else {
            processedSearch.search = null;
        }

        // Clean empty arrays
        if (processedSearch.filters?.length === 0) delete processedSearch.filters;
        if (processedSearch.sort?.length === 0) delete processedSearch.sort;
        if (processedSearch.scopes?.length === 0) delete processedSearch.scopes;
        if (processedSearch.includes?.length === 0) delete processedSearch.includes;
        if (processedSearch.aggregates?.length === 0) delete processedSearch.aggregates;
        if (!processedSearch.search?.value) delete processedSearch.search;

        return { ...params, ...processedSearch };
    }, [store.pagination, paramsSearch, debouncedSearch, overrideParams]);

    /**
     * Sync state with URL
     */
    const syncWithUrl = useCallback(() => {
        if (!preserveQueryParams) return;

        const params = new URLSearchParams();

        if (store.pagination.page > 1) {
            params.set('page', store.pagination.page.toString());
        }
        if (store.pagination.limit !== defaultPageSize) {
            params.set('limit', store.pagination.limit.toString());
        }
        if (paramsSearch.search?.value) {
            params.set('search', paramsSearch.search.value);
        }
        if (paramsSearch.sort && paramsSearch.sort.length > 0) {
            params.set('sort', `${paramsSearch.sort[0].field},${paramsSearch.sort[0].direction}`);
        }

        const paramsString = params.toString();
        if (paramsString !== paramsBeforeSearch.current) {
            paramsBeforeSearch.current = paramsString;
            setSearchParams(params, { replace: true });
        }
    }, [store.pagination, paramsSearch, preserveQueryParams, defaultPageSize, setSearchParams]);

    /**
     * Fetch list data
     */
    const fetch = useCallback(async (customParams?: ISearchParams): Promise<void> => {
        const params = customParams ? { ...buildParams(), ...customParams } : buildParams();

        dispatch({ type: ActionType.SET_LOADING, payload: true });
        dispatch({ type: ActionType.SET_NOT_FOUND, payload: false });

        try {
            const response = await fetchFn(params);

            const data = transformResponse ? transformResponse(response.data) : response.data;

            dispatch({ type: ActionType.SET_ENTITIES, payload: data });
            dispatch({ type: ActionType.SET_META, payload: response.meta || null });

            syncWithUrl();
            onSuccess?.(data);
        } catch (error) {
            const err = error instanceof Error ? error : new Error('Failed to fetch data');
            dispatch({ type: ActionType.SET_ERROR, payload: err });
            dispatch({ type: ActionType.SET_ENTITIES, payload: [] });
            onError?.(err);
            throw err;
        } finally {
            dispatch({ type: ActionType.SET_LOADING, payload: false });
        }
    }, [fetchFn, buildParams, transformResponse, syncWithUrl, onSuccess, onError]);

    /**
     * List actions implementation
     */
    const actions: IListActions<T> = {
        fetch,

        refresh: () => fetch(),

        reset: () => {
            dispatch({ type: ActionType.RESET });
            setParamsSearch({
                search: null,
                filters: [],
                sort: defaultSort ? [defaultSort] : [],
                scopes: [],
                includes: [],
                aggregates: []
            });
        },

        search: (value: string | null) => {
            setParamsSearch({ search: value ? { value, case_sensitive: false } : null });
            dispatch({ type: ActionType.SET_PAGINATION, payload: { page: 1 } });
        },

        setFilters: (filters: Record<string, any>) => {
            const filterArray: Filter[] = [];
            Object.entries(filters).forEach(([field, value]) => {
                if (value !== null && value !== undefined) {
                    filterArray.push({
                        field,
                        operator: '=',
                        value
                    });
                }
            });
            setParamsSearch({ filters: filterArray });
            dispatch({ type: ActionType.SET_PAGINATION, payload: { page: 1 } });
        },

        addFilter: (filter: Filter) => {
            const existing = paramsSearch.filters || [];
            const index = existing.findIndex(f => f.field === filter.field);

            if (index >= 0) {
                existing[index] = filter;
            } else {
                existing.push(filter);
            }

            setParamsSearch({ filters: [...existing] });
            dispatch({ type: ActionType.SET_PAGINATION, payload: { page: 1 } });
        },

        removeFilter: (field: string) => {
            const filters = (paramsSearch.filters || []).filter(f => f.field !== field);
            setParamsSearch({ filters });
            dispatch({ type: ActionType.SET_PAGINATION, payload: { page: 1 } });
        },

        clearFilters: () => {
            setParamsSearch({ filters: [] });
            dispatch({ type: ActionType.SET_PAGINATION, payload: { page: 1 } });
        },

        setSort: (field: string, direction: 'asc' | 'desc') => {
            setParamsSearch({ sort: [{ field, direction }] });
        },

        clearSort: () => {
            setParamsSearch({ sort: [] });
        },

        setPage: (page: number) => {
            dispatch({ type: ActionType.SET_PAGINATION, payload: { page } });
        },

        setPageSize: (limit: number) => {
            dispatch({ type: ActionType.SET_PAGINATION, payload: { limit, page: 1 } });
        },

        goToFirst: () => {
            dispatch({ type: ActionType.SET_PAGINATION, payload: { page: 1 } });
        },

        goToLast: () => {
            dispatch({ type: ActionType.SET_PAGINATION, payload: { page: store.pagination.pages } });
        },

        goToNext: () => {
            if (store.pagination.page < store.pagination.pages) {
                dispatch({ type: ActionType.SET_PAGINATION, payload: { page: store.pagination.page + 1 } });
            }
        },

        goToPrev: () => {
            if (store.pagination.page > 1) {
                dispatch({ type: ActionType.SET_PAGINATION, payload: { page: store.pagination.page - 1 } });
            }
        },

        select: (item: T) => {
            dispatch({ type: ActionType.SELECT_ENTITY, payload: item.id });
        },

        deselect: (item: T) => {
            dispatch({ type: ActionType.DESELECT_ENTITY, payload: item.id });
        },

        toggleSelection: (item: T) => {
            if (store.selectedIds.has(item.id)) {
                dispatch({ type: ActionType.DESELECT_ENTITY, payload: item.id });
            } else {
                dispatch({ type: ActionType.SELECT_ENTITY, payload: item.id });
            }
        },

        selectAll: () => {
            dispatch({ type: ActionType.SELECT_ALL, payload: store.entities.map(e => e.id) });
        },

        deselectAll: () => {
            dispatch({ type: ActionType.DESELECT_ALL });
        },

        updateStore: (updates) => {
            if (updates.entities) dispatch({ type: ActionType.SET_ENTITIES, payload: updates.entities });
            if (updates.meta) dispatch({ type: ActionType.SET_META, payload: updates.meta });
            if (updates.loading !== undefined) dispatch({ type: ActionType.SET_LOADING, payload: updates.loading });
            if (updates.saving !== undefined) dispatch({ type: ActionType.SET_SAVING, payload: updates.saving });
            if (updates.deleting !== undefined) dispatch({ type: ActionType.SET_DELETING, payload: updates.deleting });
            if (updates.error !== undefined) dispatch({ type: ActionType.SET_ERROR, payload: updates.error });
            if (updates.notFound !== undefined) dispatch({ type: ActionType.SET_NOT_FOUND, payload: updates.notFound });
        }
    };

    // Store helpers
    const storeHelpers = {
        addEntity: (entity: T) => dispatch({ type: ActionType.ADD_ENTITY, payload: entity }),
        updateEntity: (id: string | number, updates: Partial<T>) =>
            dispatch({ type: ActionType.UPDATE_ENTITY, payload: { id, updates } }),
        removeEntity: (id: string | number) => dispatch({ type: ActionType.REMOVE_ENTITY, payload: id })
    };

    // Auto fetch on dependency changes
    useEffect(() => {
        if (!autoInit) return;

        const timer = setTimeout(() => {
            fetch();
        }, 100);

        return () => clearTimeout(timer);
    }, [
        store.pagination.page,
        store.pagination.limit,
        debouncedSearch,
        JSON.stringify(paramsSearch.filters),
        JSON.stringify(paramsSearch.sort)
    ]);

    // Computed values
    const computed = useMemo(() => ({
        hasNextPage: store.pagination.page < store.pagination.pages,
        hasPrevPage: store.pagination.page > 1,
        isFirstPage: store.pagination.page === 1,
        isLastPage: store.pagination.page >= store.pagination.pages,
        hasSelection: store.selectedIds.size > 0,
        selectedCount: store.selectedIds.size,
        isEmpty: store.entities.length === 0 && !store.loading,
        selectedEntities: store.entities.filter(e => store.selectedIds.has(e.id))
    }), [store]);

    return {
        // State
        store,
        paramsSearch,

        // Actions
        actions,

        // Store helpers
        ...storeHelpers,

        // Computed
        computed
    };
}

export type ListManager<T extends { id: string | number }> = ReturnType<typeof useListManager<T>>;
