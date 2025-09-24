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

export interface ICategory {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
  color?: string;
  displayOrder: number;
}

