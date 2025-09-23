import { useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Category, CategoryFormValues, categoryFormSchema } from './schema';
import type { CategoriesResource } from './useCategories';
import { useCrudSubmit } from '../../core/hooks/useCrudSubmit';
import { Button } from '../../shared/ui/button';
import { Input } from '../../shared/ui/input';
import { Textarea } from '../../shared/ui/textarea';
import { Label } from '../../shared/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../shared/ui/select';

type CategoryFormMode = 'create' | 'edit';

interface CategoryFormProps {
  mode: CategoryFormMode;
  category?: Category | null;
  resource: CategoriesResource;
  onSuccess?: (category: Category) => void;
  onError?: (error: unknown) => void;
  onCancel?: () => void;
}

export const CategoryForm = ({
  mode,
  category,
  resource,
  onSuccess,
  onError,
  onCancel
}: CategoryFormProps) => {
  const categories = resource;

  const baseDefaults: CategoryFormValues = useMemo(
    () => ({
      name: '',
      description: '',
      status: 'active',
      color: '',
      displayOrder: 0
    }),
    []
  );

  const defaultValues = useMemo(() => {
    if (!category) {
      return baseDefaults;
    }
    return {
      ...baseDefaults,
      name: category.name,
      description: category.description ?? '',
      status: category.status,
      color: category.color ?? '',
      displayOrder: category.displayOrder
    } satisfies CategoryFormValues;
  }, [baseDefaults, category]);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors }
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const { handleSubmit: submitCrud } = useCrudSubmit<Category, CategoryFormValues>({
    mode,
    resource: {
      create: categories.actions.create,
      update: categories.actions.update
    },
    entityId: category?.id,
    onSuccess: (result) => {
      if (mode === 'create') {
        reset({ ...baseDefaults });
      }
      onSuccess?.(result);
    },
    onError
  });

  const handleSave = handleSubmit(async (values) => {
    await submitCrud(values);
  });

  return (
    <form className="space-y-4" onSubmit={handleSave}>
      <div className="space-y-2">
        <Label htmlFor="name">
          Name
        </Label>
        <Input
          id="name"
          type="text"
          placeholder="Category name"
          {...register('name')}
        />
        {errors.name && <p className="text-xs text-rose-600">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">
          Description
        </Label>
        <Textarea
          id="description"
          rows={3}
          placeholder="Optional description"
          {...register('description')}
        />
        {errors.description && <p className="text-xs text-rose-600">{errors.description.message}</p>}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="status">
            Status
          </Label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.status && <p className="text-xs text-rose-600">{errors.status.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="color">
            Color
          </Label>
          <Input
            id="color"
            type="text"
            placeholder="#000000"
            {...register('color')}
          />
          {errors.color && <p className="text-xs text-rose-600">{errors.color.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="displayOrder">
            Display Order
          </Label>
          <Input
            id="displayOrder"
            type="number"
            placeholder="0"
            {...register('displayOrder')}
          />
          {errors.displayOrder && <p className="text-xs text-rose-600">{errors.displayOrder.message}</p>}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        {onCancel && (
          <Button
            disabled={categories.state.isSaving}
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={categories.state.isSaving}
        >
          {categories.state.isSaving ? 'Saving...' : mode === 'edit' ? 'Actualizar' : 'Crear'}
        </Button>
      </div>
    </form>
  );
};
