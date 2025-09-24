/**
 * Categories Module - React Hooks Architecture
 * Uses hooks and composition, not classes
 */

// Store - Just one line declaration
export { useCategoryStore } from './store/categoryStore';

// Hooks - Compose base hooks with category-specific config
export { useCategoryList } from './hooks/useCategoryList';
export { useCategoryCreate, useCategoryEdit } from './hooks/useCategoryCrud';

// Resource API
export { CategoryResource } from './services/CategoryResource';

// Pages - Use hooks
export { CategoriesListPage } from './CategoriesListPage';
export { CategoryCreatePage } from './CategoryCreatePage';

// Components
export { CategoryList } from './CategoryList';
export { CategoryForm } from './CategoryForm';
export { CategoryFormModal } from './CategoryFormModal';

// Types
export { categoryFormSchema } from './schema';
export type { Category, CategoryFormValues } from './schema';