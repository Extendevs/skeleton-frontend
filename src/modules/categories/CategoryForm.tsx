import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { CrudMode } from '../../core/enums/CrudMode';
import { Category, categoryFormSchema, CategoryFormValues } from './schema';

interface CategoryFormProps {
  mode: CrudMode;
  category?: Partial<Category>;
  isSubmitting?: boolean;
  onSubmit: (values: CategoryFormValues) => Promise<void> | void;
  onCancel?: () => void;
}

export const CategoryForm = ({
  mode,
  category,
  isSubmitting = false,
  onSubmit,
  onCancel
}: CategoryFormProps) => {
  const defaultValues = useMemo<CategoryFormValues>(() => ({
    name: category?.name ?? '',
    description: category?.description ?? '',
    status: category?.status ?? 'active',
    color: category?.color ?? '',
    displayOrder: category?.displayOrder ?? 0
  }), [category]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors }
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues
  });

  const onFormSubmit = handleSubmit(async (values) => {
    await onSubmit(values);
  });

  return (
    <form className="space-y-4" onSubmit={onFormSubmit}>
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...register('name')} disabled={isSubmitting} />
        {errors.name && <p className="text-xs text-rose-600">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          rows={3}
          {...register('description')}
          disabled={isSubmitting}
        />
        {errors.description && <p className="text-xs text-rose-600">{errors.description.message}</p>}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            defaultValue={defaultValues.status}
            onValueChange={(value) => control.setValue('status', value as 'active' | 'inactive')}
            disabled={isSubmitting}
          >
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          {errors.status && <p className="text-xs text-rose-600">{errors.status.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="color">Color</Label>
          <Input
            id="color"
            placeholder="#000000"
            {...register('color')}
            disabled={isSubmitting}
          />
          {errors.color && <p className="text-xs text-rose-600">{errors.color.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="displayOrder">Display Order</Label>
          <Input
            id="displayOrder"
            type="number"
            {...register('displayOrder', { valueAsNumber: true })}
            disabled={isSubmitting}
          />
          {errors.displayOrder && (
            <p className="text-xs text-rose-600">{errors.displayOrder.message}</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? mode === CrudMode.EDIT
              ? 'Updating...'
              : 'Creating...'
            : mode === CrudMode.EDIT
            ? 'Update'
            : 'Create'}
        </Button>
      </div>
    </form>
  );
};