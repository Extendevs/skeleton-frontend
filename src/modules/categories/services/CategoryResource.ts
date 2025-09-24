import { createCrudApi } from '../../../core/api/resourceApi';
import { Category, CategoryFormValues } from '../schema';

/**
 * Category Resource - API methods simple
 */
export const CategoryResource = createCrudApi<Category, CategoryFormValues>({
    basePath: '/category'
});
