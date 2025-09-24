import { useBaseCrud } from '../../../core/hooks/useBaseCrud';
import { useCategoryStore } from '../store/categoryStore';
import { CategoryResource } from '../services/CategoryResource';
import { Category } from '../schema';
import { CrudMode } from '../../../core/enums/CrudMode';

/**
 * Category CRUD Hooks - Minimal wrappers
 */

const categoryResource = {
    save: CategoryResource.create,
    update: (id: string, data: any) => CategoryResource.update(id, data),
    delete: CategoryResource.remove
};

const defaultCategoryData: Partial<Category> = {
    name: '',
    status: 'active' as const,
    displayOrder: 0,
    description: '',
    color: ''
};

export function useCategoryCreate() {
    return useBaseCrud<Category>({
        store: useCategoryStore,
        resource: categoryResource,
        mode: CrudMode.CREATE,
        initialData: defaultCategoryData
    });
}

export function useCategoryEdit(entityId: string, initialCategory?: Category | null) {
    return useBaseCrud<Category>({
        store: useCategoryStore,
        resource: categoryResource,
        mode: CrudMode.EDIT,
        entityId,
        initialData: initialCategory || defaultCategoryData
    });
}