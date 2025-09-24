import { useEffect, useCallback, useState } from 'react';
import { IEntityStore, IEntity } from '../store/EntityStore';
import { ISearchParams } from '../interfaces/list.types';

export interface UseBaseListConfig<T extends IEntity> {
    store: () => IEntityStore<T>;
    resource: {
        list: (params: any) => Promise<any>;
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
    const buildParams = useCallback(() => {
        const { page, limit } = store.pagination;

        const params: any = {
            page,
            limit,
            ...(config.overrideParams || {})
        };

        if (paramsSearch.search?.value) {
            params.search = {
                value: paramsSearch.search.value.trim(),
                case_sensitive: false
            };
        }

        if (paramsSearch.filters?.length) {
            params.filters = paramsSearch.filters;
        }

        if (paramsSearch.sort?.length) {
            params.sort = paramsSearch.sort;
        }

        return params;
    }, [store.pagination, paramsSearch, config.overrideParams]);

    // Get list
    const getList = useCallback(async () => {
        store.putLoading(true);
        store.putNotFound(false);

        try {
            const params = buildParams();
            const response = await config.resource.list(params);

            store.setAllEntities(response.data);

            if (response.meta) {
                store.putPagination({
                    page: response.meta.current_page,
                    limit: response.meta.per_page,
                    total: response.meta.total,
                    pages: response.meta.last_page,
                    per_page: response.meta.per_page,
                    from: response.meta.from,
                    to: response.meta.to
                });
                store.putMeta(response.meta);
            }

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
        return getList();
    }, [store, getList]);

    // Reset
    const onReset = useCallback(() => {
        setParamsSearch({
            search: null,
            filters: [],
            sort: []
        });
        store.putPagination({ page: 1 });
        return getList();
    }, [store, getList]);

    // Page change
    const onPageChanged = useCallback((page: number, limit?: number) => {
        store.putPagination({
            page,
            ...(limit ? { limit } : {})
        });
        return getList();
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
