import { z } from 'zod';

export const categoryFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  status: z.enum(['active', 'inactive']).default('active'),
  color: z
    .preprocess((value) => {
      if (typeof value !== 'string') {
        return value;
      }
      const trimmed = value.trim();
      return trimmed.length === 0 ? undefined : trimmed;
    }, z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/i, 'Provide a valid hex color').optional()),
  displayOrder: z
    .preprocess((value) => (value === '' || value === null ? undefined : Number(value)), z.number().int().nonnegative())
    .default(0)
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export interface Category {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
  color?: string;
  displayOrder: number;
  // API fields
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  user_created_id?: string;
  user_updated_id?: string;
  user_deleted_id?: string | null;
  user_restored_id?: string | null;
  position?: number | null;
  is_searchable?: boolean;
  is_active?: boolean;
  parent_id?: string | null;
  click_action?: string | null;
  company_id?: string;
  country_id?: string;
  title?: string | null;
}

// Mapper functions
export const mapApiToCategory = (apiData: any): Category => ({
  id: apiData.id,
  name: apiData.name,
  description: apiData.description || apiData.title || '',
  status: apiData.is_active ? 'active' : 'inactive',
  color: apiData.color || '',
  displayOrder: apiData.position || apiData.displayOrder || 0,
  // Keep API fields
  created_at: apiData.created_at,
  updated_at: apiData.updated_at,
  deleted_at: apiData.deleted_at,
  user_created_id: apiData.user_created_id,
  user_updated_id: apiData.user_updated_id,
  user_deleted_id: apiData.user_deleted_id,
  user_restored_id: apiData.user_restored_id,
  position: apiData.position,
  is_searchable: apiData.is_searchable,
  is_active: apiData.is_active,
  parent_id: apiData.parent_id,
  click_action: apiData.click_action,
  company_id: apiData.company_id,
  country_id: apiData.country_id,
  title: apiData.title
});

export const mapCategoryToApi = (category: CategoryFormValues, existingData?: Category): any => ({
  name: category.name,
  description: category.description || '',
  is_active: category.status === 'active',
  color: category.color || null,
  position: category.displayOrder || 0,
  // Preserve existing API fields if updating
  ...(existingData && {
    company_id: existingData.company_id,
    country_id: existingData.country_id,
    parent_id: existingData.parent_id,
    is_searchable: existingData.is_searchable,
    click_action: existingData.click_action
  })
});

export interface CategoryListResponse {
  data: Category[];
  total: number;
}
