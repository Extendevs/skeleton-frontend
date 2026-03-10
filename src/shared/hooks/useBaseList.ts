import type { ReportParams } from '@/shared/api/resourceApi'
import { useInitOnce } from '@/shared/hooks/useInitOnce'
import { toast } from '@/shared/hooks/useToast'
import type { IEntity } from '@/shared/interfaces/Entity'
import type { IPaginationMeta, ISearchParams } from '@/shared/interfaces/list.types'
import type { IEntityStore } from '@/shared/store/EntityStore'
import { useCallback, useRef, useState } from 'react'

interface ApiResponse<T> {
    data: T[]
    meta?: IPaginationMeta
    total?: number
}

interface ResourceApi<T> {
    list: (_params: Record<string, unknown>) => Promise<ApiResponse<T>>
    search: (_params: Record<string, unknown>) => Promise<ApiResponse<T>>
    remove?: (_id: string) => Promise<unknown>
    restore?: (_id: string) => Promise<unknown>
    report?: (_params: ReportParams) => Promise<Blob>
}

export interface OverrideParams {
    filters?: Array<{ field: string; operator: string; value: unknown }>
    sort?: Array<{ field: string; direction: string }>
    includes?: Array<{ relation: string }>
    [key: string]: unknown
}

export interface UseBaseListConfig<T extends IEntity> {
    store: () => IEntityStore<T>
    resource: ResourceApi<T>
    autoInit?: boolean
    overrideParams?: OverrideParams
    initialSearch?: ISearchParams
    view?: string
}

/**
 * Base List Hook — composition-based CRUD list logic.
 * Store actions are accessed via refs to keep callbacks stable
 * and avoid cascading re-creations on every store state change.
 */
export function useBaseList<T extends IEntity>(config: UseBaseListConfig<T>) {
    const store = config.store()

    // Ref keeps the latest store snapshot so callbacks don't need
    // `store` in their dependency arrays (which changes every render).
    const storeRef = useRef(store)
    storeRef.current = store

    const [paramsSearch, setParamsSearch] = useState<ISearchParams>(
        config.initialSearch || {
            search: null,
            filters: [],
            sort: [],
            includes: [],
            aggregates: [],
            user_id: null,
        }
    )
    const paramsSearchRef = useRef(paramsSearch)
    paramsSearchRef.current = paramsSearch

    const buildParams = useCallback((overrides?: { page?: number; limit?: number }, searchOverrides?: Partial<ISearchParams>) => {
        const currentStore = storeRef.current
        const currentSearch = searchOverrides
            ? { ...paramsSearchRef.current, ...searchOverrides }
            : paramsSearchRef.current

        // page/limit: overrides > currentSearch (initialSearch) > store.pagination
        const pagination = {
            ...currentStore.pagination,
            ...(currentSearch.page !== undefined && { page: currentSearch.page }),
            ...(currentSearch.limit !== undefined && { limit: currentSearch.limit }),
            ...overrides,
        }
        const { page, limit } = pagination

        const params: Record<string, unknown> = {
            page,
            limit,
            view: config.view
        }

        if (config.overrideParams) {
            const { filters: overrideFilters, sort: overrideSort, includes: overrideIncludes, ...otherOverrides } = config.overrideParams

            Object.assign(params, otherOverrides)

            if (overrideFilters?.length || currentSearch.filters?.length) {
                params.filters = [
                    ...(currentSearch.filters || []),
                    ...(overrideFilters || [])
                ]
            }

            if (overrideSort?.length) {
                params.sort = overrideSort
            } else if (currentSearch.sort?.length) {
                params.sort = currentSearch.sort
            }

            if (overrideIncludes?.length || currentSearch.includes?.length) {
                const allIncludes = [
                    ...(currentSearch.includes || []),
                    ...(overrideIncludes || [])
                ]
                const uniqueIncludes = allIncludes.filter((include, index, self) =>
                    index === self.findIndex(i => i.relation === include.relation)
                )
                params.includes = uniqueIncludes
            }
        } else {
            if (currentSearch.filters?.length) {
                params.filters = currentSearch.filters
            }
            if (currentSearch.sort?.length) {
                params.sort = currentSearch.sort
            }
            if (currentSearch.includes?.length) {
                params.includes = currentSearch.includes
            }
        }

        if (currentSearch.search?.value) {
            params.search = {
                value: currentSearch.search.value.trim(),
                case_sensitive: false
            }
        }

        if (currentSearch.aggregates?.length) {
            params.aggregates = currentSearch.aggregates
        }

        if (currentSearch.user_id) {
            params.user_id = currentSearch.user_id
        }

        if (currentSearch.scopes?.length) {
            params.scopes = currentSearch.scopes
        }

        if (currentSearch.active !== undefined) {
            params.active = currentSearch.active
        }

        return params
    }, [config.overrideParams, config.view])

    const getList = useCallback(async (paramOverrides?: { page?: number; limit?: number }, searchOverrides?: Partial<ISearchParams>) => {
        const s = storeRef.current
        s.putLoading(true)
        s.putNotFound(false)

        try {
            const params = buildParams(paramOverrides, searchOverrides)
            const response = await config.resource.search(params)

            s.setAllEntities(response.data)

            let paginationUpdate

            if (response.meta && typeof response.meta === 'object') {
                const meta = response.meta
                paginationUpdate = {
                    page: meta.current_page || (params.page as number) || 1,
                    limit: meta.per_page || (params.limit as number) || 20,
                    total: meta.total || (response.total as number) || response.data.length,
                    pages: meta.last_page || Math.ceil((meta.total || (response.total as number) || response.data.length) / (meta.per_page || (params.limit as number) || 20)),
                    per_page: meta.per_page || (params.limit as number) || 20,
                    from: meta.from || (((params.page as number) || 1) - 1) * ((params.limit as number) || 20) + 1,
                    to: meta.to || Math.min(((params.page as number) || 1) * ((params.limit as number) || 20), meta.total || (response.total as number) || response.data.length)
                }
                s.putMeta(response.meta)
            } else {
                const currentPage = (params.page as number) || 1
                const pageSize = (params.limit as number) || 20
                const totalItems = (response.total as number) || response.data.length

                let totalPages
                if (totalItems && totalItems > 0) {
                    totalPages = Math.ceil(totalItems / pageSize)
                } else if (response.data.length === pageSize) {
                    totalPages = currentPage + 1
                } else {
                    totalPages = currentPage
                }

                paginationUpdate = {
                    page: currentPage,
                    limit: pageSize,
                    total: totalItems || response.data.length,
                    pages: totalPages,
                    per_page: pageSize,
                    from: response.data.length > 0 ? (currentPage - 1) * pageSize + 1 : null,
                    to: response.data.length > 0 ? (currentPage - 1) * pageSize + response.data.length : null
                }
            }

            s.putPagination(paginationUpdate)
            s.putNotFound(response.data.length === 0)

            return response
        } catch (error) {
            s.removeAllEntities()
            s.putMeta(null)
            toast.error('Error al obtener la lista')
            throw error
        } finally {
            s.putLoading(false)
        }
    }, [buildParams, config.resource])

    const onSearch = useCallback((search?: Partial<ISearchParams>) => {
        if (search) {
            setParamsSearch(prev => ({ ...prev, ...search }))
        }
        storeRef.current.putPagination({ page: 1 })
        return getList({ page: 1 }, search)
    }, [getList])

    const onReset = useCallback(() => {
        const resetSearch: ISearchParams = {
            search: null,
            filters: [],
            sort: paramsSearchRef.current.sort,
            includes: paramsSearchRef.current.includes,
            aggregates: [],
            user_id: null,
        }
        setParamsSearch(resetSearch)
        storeRef.current.putPagination({ page: 1 })
        return getList({ page: 1 }, resetSearch)
    }, [getList])

    const onPageChanged = useCallback((page: number, limit?: number) => {
        const paginationUpdate = {
            page,
            ...(limit ? { limit } : {})
        }
        storeRef.current.putPagination(paginationUpdate)
        return getList(paginationUpdate)
    }, [getList])

    const onRemove = useCallback(async (entity: T) => {
        if (!config.resource.remove) return

        const s = storeRef.current
        s.putDeleting(true)
        try {
            await config.resource.remove(entity.id.toString())
            s.removeEntity(entity.id)
            toast.success('Registro eliminado exitosamente')
        } catch (error) {
            toast.error('Error al eliminar el registro')
            throw error
        } finally {
            s.putDeleting(false)
        }
    }, [config.resource])

    const onRestore = useCallback(async (entity: T) => {
        if (!config.resource.restore) return

        const s = storeRef.current
        s.putSaving(true)
        try {
            await config.resource.restore(entity.id.toString())
            toast.success('Registro restaurado exitosamente')
            await getList()
        } catch (error) {
            toast.error('Error al restaurar el registro')
            throw error
        } finally {
            s.putSaving(false)
        }
    }, [config.resource, getList])

    const onReport = useCallback(async (
        model: string,
        type: 'xlsx' | 'csv' | 'pdf' = 'xlsx',
        title: string = 'reporte',
        reportType?: string
    ) => {
        if (!config.resource.report) {
            toast.error('La descarga de reportes no está disponible')
            return
        }

        const s = storeRef.current
        s.putLoading(true)

        try {
            const params = buildParams()
            const reportParams: ReportParams = {
                _model: model,
                _type: type,
                _title: title,
                _report_type: reportType,
                limit: params.limit as number,
                page: params.page as number,
                ...params,
            }

            const blob = await config.resource.report(reportParams)

            if (blob.size <= 0) {
                toast.info('No hay datos para exportar')
                return
            }

            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `${title}.${type}`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)

            toast.success('Reporte descargado correctamente')
        } catch (error) {
            toast.error('Error al descargar el reporte, inténtalo más tarde')
            throw error
        } finally {
            s.putLoading(false)
        }
    }, [buildParams, config.resource])

    useInitOnce(() => {
        if (config.autoInit !== false) {
            getList()
        }
    }, 'baseList')

    return {
        store,
        paramsSearch,
        setParamsSearch,

        getList,
        onSearch,
        onReset,
        onPageChanged,
        onRemove,
        onRestore,
        onReport,
    }
}
