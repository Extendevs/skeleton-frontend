import { useBaseList } from '../../../core/hooks/useBaseList';
import { useCategoryStore } from '../store/categoryStore';
import { CategoryResource } from '../services/CategoryResource';
import { ICategory } from '../schema';

/**
 * Category List Hook - Composes useBaseList with category-specific config
 * Minimal code, everything inherited via composition
 */
export function useCategoryList() {
    return useBaseList<ICategory>({
        store: useCategoryStore,
        resource: CategoryResource,
        autoInit: true, // Let useBaseList handle the initial load
        // Override search params if needed
        initialSearch: {
            sort: [
                { field: 'created_at', direction: 'desc' }
            ]
        }
    });
}
