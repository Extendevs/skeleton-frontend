import { createCrudApi } from '@/core/api/resourceApi';
import { ICategory, CategoryFormValues } from '../schema';

/**
 * Category Resource - API methods simple
 */
export const CategoryResource = createCrudApi<ICategory, CategoryFormValues>({
    basePath: '/category'
});
