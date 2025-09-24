import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../../shared/ui/button';
import { Input } from '../../shared/ui/input';
import { Textarea } from '../../shared/ui/textarea';
import { Label } from '../../shared/ui/label';
import { FormInputError } from '../../shared/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../shared/ui/select';
import { CrudMode } from '../../core/enums/CrudMode';
import { ICategory, categoryFormSchema, CategoryFormValues } from './schema';
import { useBaseCrud } from '../../core/hooks/useBaseCrud';
import { useCategoryStore } from './store/categoryStore';
import { CategoryResource } from './services/CategoryResource';

interface CategoryFormProps {
  mode: CrudMode;
  category?: Partial<ICategory>;
  onSuccess?: (category: ICategory) => void;
  onCancel?: () => void;
}

export const CategoryForm = ({
  mode,
  category,
  onSuccess,
  onCancel
}: CategoryFormProps) => {
  const defaultValues = useMemo<CategoryFormValues>(() => ({
    name: category?.name ?? '',
    description: category?.description ?? '',
    status: category?.status ?? 'active',
    color: category?.color ?? '',
    displayOrder: category?.displayOrder ?? 0
  }), [category]);

  // Use useBaseCrud for all CRUD logic
  const crud = useBaseCrud<ICategory>({
    store: useCategoryStore,
    resource: {
      save: CategoryResource.create,
      update: CategoryResource.update,
      delete: CategoryResource.remove
    },
    mode,
    entityId: category?.id,
    initialData: category
  });

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
    try {
      const result = await crud.submit(values);
      onSuccess?.(result);
    } catch (error) {
      // Error handling can be done here or passed up
      throw error;
    }
  });

  return (
    <form className="space-y-4" onSubmit={onFormSubmit}>
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...register('name')} disabled={crud.store.isSaving} />
        <FormInputError error={errors.name} disabled={crud.store.isSaving} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          rows={3}
          {...register('description')}
          disabled={crud.store.isSaving}
        />
        <FormInputError error={errors.description} disabled={crud.store.isSaving} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            defaultValue={defaultValues.status}
            onValueChange={(value) => {
              // @ts-ignore - control has setValue method
              control.setValue('status', value as 'active' | 'inactive');
            }}
            disabled={crud.store.isSaving}
          >
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <FormInputError error={errors.status} disabled={crud.store.isSaving} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="color">Color</Label>
          <Input
            id="color"
            placeholder="#000000"
            {...register('color')}
            disabled={crud.store.isSaving}
          />
          <FormInputError error={errors.color} disabled={crud.store.isSaving} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="displayOrder">Display Order</Label>
          <Input
            id="displayOrder"
            type="number"
            {...register('displayOrder', { valueAsNumber: true })}
            disabled={crud.store.isSaving}
          />
          <FormInputError error={errors.displayOrder} disabled={crud.store.isSaving} />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        {onCancel && (
        <Button type="button" variant="outline" onClick={onCancel} disabled={crud.store.isSaving}>
          Cancel
        </Button>
        )}
        <Button type="submit" disabled={crud.store.isSaving}>
          {crud.store.isSaving
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