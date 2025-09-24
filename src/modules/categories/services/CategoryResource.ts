import { createCrudApi } from '../../../core/api/resourceApi';
import { apiClient } from '../../../core/api/apiClient';
import { Category, CategoryFormValues, mapApiToCategory, mapCategoryToApi } from '../schema';

/**
 * Category Resource - API methods with proper mapping
 */
const baseResource = createCrudApi<Category, CategoryFormValues>({
    basePath: '/category',
    mapListResponse: (response) => ({
        ...response,
        data: response.data.map(mapApiToCategory)
    }),
    mapCreateInput: (formData) => mapCategoryToApi(formData)
    // Remove mapUpdateInput to handle manually
});

// Custom update method that can access existing data
export const CategoryResource = {
    ...baseResource,
    update: async (id: string, formData: CategoryFormValues, existingCategory?: Category) => {
        const apiPayload = mapCategoryToApi(formData, existingCategory);

        // Direct API call with custom payload
        const { data } = await apiClient.put<Category>(`/category/${id}`, apiPayload);
        const result = mapApiToCategory(data);
        return result;
    }
};
