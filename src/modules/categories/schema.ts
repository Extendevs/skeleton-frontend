import { z } from 'zod';
import { IEntity } from '../../types/Entity';

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

export interface Category extends IEntity {
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

