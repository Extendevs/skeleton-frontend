   import { useQuery } from '@tanstack/react-query';
import { useState, useCallback, useMemo } from 'react';
import { apiClient } from '../api/apiClient';

// Tipos para los catálogos
export enum CatalogType {
    USER_REGISTER_STATUS = 'user_register_status'
}

export interface CatalogItem {
    id: string;
    name: string;
    slug?: string;
    description?: string;
    value?: string | number;
    color?: string;
    icon?: string;
    order?: number;
    is_active?: boolean;
    full_name?: string;
    [key: string]: unknown;
}

export interface CatalogParams {
    _sort?: string;
    _limit?: number;
    _search?: string;
    _filters?: Record<string, unknown>;
    [key: string]: unknown;
}

export type CatalogRequest = {
    [key in CatalogType]?: CatalogParams;
}

export type CatalogResponse = {
    [key in CatalogType]?: CatalogItem[];
}

// Configuración de cache por tipo de catálogo
const CATALOG_CACHE_CONFIG = {

};

/**
 * Hook para obtener catálogos de forma dinámica y eficiente
 * 
 * @example
 * ```tsx
 * // Obtener múltiples catálogos
 * const { catalogs, isLoading, refetch } = useCatalogs({
 *   [CatalogType.CYCLING_CLASS_LEVELS]: { _sort: 'name' },
 *   [CatalogType.INSTRUCTORS]: { _sort: '-name', _filters: { is_active: true } }
 * });
 * 
 * // Usar los catálogos
 * const levels = catalogs[CatalogType.CYCLING_CLASS_LEVELS] || [];
 * const instructors = catalogs[CatalogType.INSTRUCTORS] || [];
 * ```
 */
export function useCatalogs(catalogRequest: CatalogRequest) {
    // Una sola query que obtiene todos los catálogos de una vez
    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['catalogs', catalogRequest],
        queryFn: async () => {
            const response = await apiClient.post('/selects', catalogRequest);
            return response.data?.data || response.data || {};
        },
        staleTime: 15 * 60 * 1000, // 15 minutos
        gcTime: 30 * 60 * 1000, // 30 minutos en cache
        refetchOnWindowFocus: false,
        retry: 2,
        enabled: Object.keys(catalogRequest).length > 0,
    });

    // Procesar los catálogos recibidos
    const catalogs = useMemo(() => {
        const catalogData: Partial<CatalogResponse> = {};

        // Inicializar todos los catálogos solicitados como arrays vacíos
        Object.keys(catalogRequest).forEach(catalogType => {
            catalogData[catalogType as CatalogType] = [];
        });

        // Llenar con los datos recibidos
        if (data) {
            Object.entries(data).forEach(([catalogType, catalogItems]) => {
                if (Array.isArray(catalogItems)) {
                    catalogData[catalogType as CatalogType] = catalogItems;
                }
            });
        }

        return catalogData;
    }, [data, catalogRequest]);

    // Función para refrescar un catálogo específico (refetch completo)
    const refetchCatalog = useCallback(async () => {
        // Como es una sola llamada, refrescamos todo
        await refetch();
    }, [refetch]);

    // Función para obtener un catálogo específico
    const getCatalog = useCallback((catalogType: CatalogType): CatalogItem[] => {
        return catalogs[catalogType] || [];
    }, [catalogs]);

    // Función para buscar un item específico en un catálogo
    const findCatalogItem = useCallback((
        catalogType: CatalogType,
        predicate: (item: CatalogItem) => boolean
    ): CatalogItem | undefined => {
        const catalog = getCatalog(catalogType);
        return catalog.find(predicate);
    }, [getCatalog]);

    // Función para obtener un item por ID
    const getCatalogItemById = useCallback((
        catalogType: CatalogType,
        id: string
    ): CatalogItem | undefined => {
        return findCatalogItem(catalogType, item => item.id === id);
    }, [findCatalogItem]);

    // Función para obtener un item por slug
    const getCatalogItemBySlug = useCallback((
        catalogType: CatalogType,
        slug: string
    ): CatalogItem | undefined => {
        return findCatalogItem(catalogType, item => item.slug === slug);
    }, [findCatalogItem]);

    return {
        // Datos
        catalogs,

        // Estados
        isLoading,
        isError,
        error,

        // Acciones
        refetch,
        refetchCatalog,

        // Utilidades
        getCatalog,
        findCatalogItem,
        getCatalogItemById,
        getCatalogItemBySlug,

        // Información adicional
        catalogTypes: Object.keys(catalogRequest) as CatalogType[],
        isEmpty: Object.values(catalogs).every(catalog => !catalog || (Array.isArray(catalog) && catalog.length === 0)),
    };
}

/**
 * Hook simplificado para obtener un solo catálogo
 * 
 * @example
 * ```tsx
 * const { data: levels, isLoading } = useCatalog(CatalogType.CYCLING_CLASS_LEVELS, {
 *   _sort: 'name'
 * });
 * ```
 */
export function useCatalog(
    catalogType: CatalogType,
    params?: CatalogParams
) {
    return useQuery({
        queryKey: ['catalog', catalogType, params],
        queryFn: async () => {
            const catalogRequest = { [catalogType]: params || {} };
            const response = await apiClient.post('/selects', catalogRequest);
            const data = response.data?.data || response.data || {};
            return data[catalogType] || [];
        },
        staleTime: CATALOG_CACHE_CONFIG[catalogType]?.staleTime || 15 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 2,
    });
}

/**
 * Hook para obtener catálogos con invalidación manual
 * Útil cuando necesitas control total sobre cuándo se actualizan
 */
export function useCatalogsManual() {
    const [catalogs, setCatalogs] = useState<Partial<CatalogResponse>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Error[]>([]);

    const fetchCatalogs = useCallback(async (catalogRequest: CatalogRequest) => {
        setIsLoading(true);
        setErrors([]);

        try {
            const response = await apiClient.post('/selects', catalogRequest);
            const data = response.data?.data || response.data || {};

            const newCatalogs: Partial<CatalogResponse> = {};

            // Inicializar todos los catálogos solicitados
            Object.keys(catalogRequest).forEach(catalogType => {
                newCatalogs[catalogType as CatalogType] = [];
            });

            // Llenar con los datos recibidos
            Object.entries(data).forEach(([catalogType, catalogItems]) => {
                if (Array.isArray(catalogItems)) {
                    newCatalogs[catalogType as CatalogType] = catalogItems;
                }
            });

            setCatalogs(prev => ({ ...prev, ...newCatalogs }));
            return newCatalogs;
        } catch (error) {
            setErrors([error as Error]);
            return {};
        } finally {
            setIsLoading(false);
        }
    }, []);

    const clearCatalogs = useCallback(() => {
        setCatalogs({});
        setErrors([]);
    }, []);

    return {
        catalogs,
        isLoading,
        errors,
        fetchCatalogs,
        clearCatalogs,
    };
}
