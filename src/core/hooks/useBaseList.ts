import { useEffect, useCallback, useState } from 'react';
import { IEntityStore, IEntity } from '../store/EntityStore';
import { ISearchParams } from '../interfaces/list.types';

export interface UseBaseListConfig<T extends IEntity> {
    store: () => IEntityStore<T>;
    resource: {
        list: (params: any) => Promise<any>;
        search: (params: any) => Promise<any>;
        remove?: (id: string) => Promise<any>;
        restore?: (id: string) => Promise<any>;
    };
    autoInit?: boolean;
    overrideParams?: Record<string, any>;
    initialSearch?: ISearchParams;
}

/**
 * Base List Hook - Inherit functionality via composition
 * All list logic in one place
 */
export function useBaseList<T extends IEntity>(config: UseBaseListConfig<T>) {
    // Use the store hook to subscribe to changes
    const store = config.store();
    const [paramsSearch, setParamsSearch] = useState<ISearchParams>(
        config.initialSearch || {
            search: null,
            filters: [],
            sort: []
        }
    );

    // Build params for API
    const buildParams = useCallback((overrides?: { page?: number; limit?: number }, searchOverrides?: Partial<ISearchParams>) => {
        const pagination = overrides ? { ...store.pagination, ...overrides } : store.pagination;
        const { page, limit } = pagination;

        // Use search overrides if provided, otherwise use current paramsSearch
        const currentSearch = searchOverrides ? { ...paramsSearch, ...searchOverrides } : paramsSearch;

        const params: any = {
            page,
            limit,
            ...(config.overrideParams || {})
        };

        if (currentSearch.search?.value) {
            params.search = {
                value: currentSearch.search.value.trim(),
                case_sensitive: false
            };
        }

        if (currentSearch.filters?.length) {
            params.filters = currentSearch.filters;
        }

        if (currentSearch.sort?.length) {
            params.sort = currentSearch.sort;
        }

        return params;
    }, [store.pagination, paramsSearch, config.overrideParams]);

    // Get list
    const getList = useCallback(async (paramOverrides?: { page?: number; limit?: number }, searchOverrides?: Partial<ISearchParams>) => {
        store.putLoading(true);
        store.putNotFound(false);

        try {
            const params = buildParams(paramOverrides, searchOverrides);
            const response = await config.resource.search(params);

            store.setAllEntities(response.data);

            // Handle pagination based on response structure
            let paginationUpdate;

            if (response.meta && typeof response.meta === 'object') {
                // Use meta information if available
                const meta = response.meta;
                paginationUpdate = {
                    page: meta.current_page || params.page || 1,
                    limit: meta.per_page || params.limit || 20,
                    total: meta.total || response.total || response.data.length,
                    pages: meta.last_page || Math.ceil((meta.total || response.total || response.data.length) / (meta.per_page || params.limit || 20)),
                    per_page: meta.per_page || params.limit || 20,
                    from: meta.from || ((params.page || 1) - 1) * (params.limit || 20) + 1,
                    to: meta.to || Math.min((params.page || 1) * (params.limit || 20), meta.total || response.total || response.data.length)
                };
                store.putMeta(response.meta);
            } else {
                // Calculate pagination based on request params and response data
                const currentPage = params.page || 1;
                const pageSize = params.limit || 20;
                const totalItems = response.total || response.data.length;

                // For APIs that don't provide meta, we need to make assumptions
                // If we get exactly pageSize items, there might be more pages
                // If we get less than pageSize, this is likely the last page
                let totalPages;
                if (totalItems && totalItems > 0) {
                    // Use explicit total if provided
                    totalPages = Math.ceil(totalItems / pageSize);
                } else if (response.data.length === pageSize) {
                    // We got a full page, assume there might be more
                    // This is a rough estimate - we can't know for sure without total
                    totalPages = currentPage + 1;
                } else {
                    // We got less than a full page, this is likely the last page
                    totalPages = currentPage;
                }

                paginationUpdate = {
                    page: currentPage,
                    limit: pageSize,
                    total: totalItems || response.data.length,
                    pages: totalPages,
                    per_page: pageSize,
                    from: response.data.length > 0 ? (currentPage - 1) * pageSize + 1 : null,
                    to: response.data.length > 0 ? (currentPage - 1) * pageSize + response.data.length : null
                };
            }

            store.putPagination(paginationUpdate);
            store.putNotFound(response.data.length === 0);

            return response;
        } catch (error) {
            store.removeAllEntities();
            store.putMeta(null);
            throw error;
        } finally {
            store.putLoading(false);
        }
    }, [buildParams, config.resource, store]);

    // Search
    const onSearch = useCallback((search?: Partial<ISearchParams>) => {
        if (search) {
            setParamsSearch(prev => ({ ...prev, ...search }));
        }
        store.putPagination({ page: 1 });
        return getList({ page: 1 }, search);
    }, [store, getList]);

    // Reset
    const onReset = useCallback(() => {
        const resetSearch = {
            search: null,
            filters: [],
            sort: []
        };
        setParamsSearch(resetSearch);
        store.putPagination({ page: 1 });
        return getList({ page: 1 }, resetSearch);
    }, [store, getList]);

    // Page change
    const onPageChanged = useCallback((page: number, limit?: number) => {
        const paginationUpdate = {
            page,
            ...(limit ? { limit } : {})
        };

        // Update store first
        store.putPagination(paginationUpdate);

        // Call getList with the exact parameters we want to use
        return getList(paginationUpdate);
    }, [store, getList]);

    // Remove
    const onRemove = useCallback(async (entity: any) => {
        if (!config.resource.remove) return;

        store.putDeleting(true);
        try {
            await config.resource.remove(entity.id);
            store.removeEntity(entity.id);
        } finally {
            store.putDeleting(false);
        }
    }, [config.resource, store]);

    // Restore
    const onRestore = useCallback(async (entity: any) => {
        if (!config.resource.restore) return;

        try {
            await config.resource.restore(entity.id);
            store.updateEntity({
                id: entity.id,
                deleted_at: null
            } as any);
        } catch (error) {
            throw error;
        }
    }, [config.resource, store]);

    // Auto init
    useEffect(() => {
        if (config.autoInit !== false) {
            getList();
        }
    }, []);

    return {
        // State
        store,
        paramsSearch,
        setParamsSearch,

        // Actions
        getList,
        onSearch,
        onReset,
        onPageChanged,
        onRemove,
        onRestore
    };
}
