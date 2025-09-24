import { createEntityStore } from '@/core/store/EntityStore';
import { ICategory } from '../schema';

/**
 * Category Store - Uses generic createEntityStore
 */
export const useCategoryStore = createEntityStore<ICategory>('categories');