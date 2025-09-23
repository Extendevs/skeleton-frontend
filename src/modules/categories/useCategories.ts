import { useCrudResource } from '../../core/hooks/useCrudResource';
import { createCrudApi } from '../../core/api/resourceApi';
import { Category, CategoryFormValues } from './schema';

export interface ListCategoriesParams {
  search?: string;
  page?: number;
  pageSize?: number;
  sort?: string;
  status?: string;
  color?: string;
  [key: string]: any;
}

const categoriesApi = createCrudApi<Category, CategoryFormValues, ListCategoriesParams>({
  basePath: '/category'
});

/**
 * Categories resource hook with advanced list management
 */
export const useCategories = (params?: ListCategoriesParams) => {
  // Auto-detect mode: simple params for backward compatibility, advanced otherwise
  const useSimpleMode = params && ('search' in params || 'page' in params);

  return useCrudResource<Category, CategoryFormValues, ListCategoriesParams>({
    resourceKey: 'categories',
    params: useSimpleMode ? params : undefined,
    listFn: categoriesApi.list,
    createFn: categoriesApi.create,
    updateFn: categoriesApi.update,
    deleteFn: categoriesApi.remove,
    messages: {
      createSuccess: useSimpleMode ? 'Category created' : 'Category created successfully',
      createError: useSimpleMode ? 'Create failed' : 'Failed to create category',
      updateSuccess: useSimpleMode ? 'Category updated' : 'Category updated successfully',
      updateError: useSimpleMode ? 'Update failed' : 'Failed to update category',
      deleteSuccess: useSimpleMode ? 'Category deleted' : 'Category deleted successfully',
      deleteError: useSimpleMode ? 'Delete failed' : 'Failed to delete category'
    },
    useAdvancedList: !useSimpleMode,
    preserveQueryParams: !useSimpleMode,
    debounceMs: 400,
    initialPageSize: 20,
    autoFetch: true
  });
};

export type CategoriesResource = ReturnType<typeof useCategories>;
