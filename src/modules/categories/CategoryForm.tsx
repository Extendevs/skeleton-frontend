import { useMemo, useEffect } from 'react';
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
import { IFormProps } from '../../types/Entity';

interface CategoryFormProps extends IFormProps<ICategory> {
  category?: Partial<ICategory>;
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
    reset,
    watch,
    formState: { errors }
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues
  });

  // Reset form when category changes (for edit mode)
  useEffect(() => {
    reset(defaultValues);
  }, [reset, defaultValues]);

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
    <div className="max-w-2xl mx-auto">
      <form className="space-y-6" onSubmit={onFormSubmit}>
        {/* Header Section */}
        {/* <div className="border-b border-gray-200 pb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {mode === CrudMode.EDIT ? 'Edit Category' : 'Create New Category'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {mode === CrudMode.EDIT 
              ? 'Update the category information below.' 
              : 'Fill in the details to create a new category.'}
          </p>
        </div> */}

        {/* Basic Information Section */}
        <div className="space-y-5">
          <div className="space-y-1">
            <Label htmlFor="name" required={true}>
              Nombre de Categoría 
            </Label>
            <Input 
              id="name" 
              placeholder="Ingresa el nombre de la categoría"
              className="mt-1"
              {...register('name')} 
              disabled={crud.store.isSaving} 
            />
            <FormInputError error={errors.name} />
          </div>

          <div className="space-y-1">
            <Label htmlFor="description">
              Descripción
            </Label>
            <Textarea
              id="description"
              placeholder="Describe esta categoría (opcional)"
              rows={3}
              className="mt-1 resize-none"
              {...register('description')}
              disabled={crud.store.isSaving}
            />
            <FormInputError error={errors.description} />
          </div>
        </div>

        {/* Configuration Section */}
        <div className="border-t border-gray-200 pt-6">
          <h4 className="text-base font-medium text-gray-900 mb-4">Configuración</h4>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="space-y-1">
              <Label htmlFor="status" required={true}>
                Estado 
              </Label>
              <Select
                value={watch('status')}
                onValueChange={(value) => {
                  // @ts-ignore - control has setValue method
                  control.setValue('status', value as 'active' | 'inactive');
                }}
                disabled={crud.store.isSaving}
              >
                <SelectTrigger id="status" className="mt-1">
                  <SelectValue placeholder="Selecciona el estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      Activo
                    </div>
                  </SelectItem>
                  <SelectItem value="inactive">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                      Inactivo
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormInputError error={errors.status} />
            </div>

            <div className="space-y-1">
              <Label htmlFor="color" required={true}>
                Color
              </Label>
              <div className="space-y-2 mt-1">
                <Input
                  id="color"
                  type="color"
                  className="h-10 w-full cursor-pointer"
                  {...register('color')}
                  disabled={crud.store.isSaving}
                />
                <Input
                  placeholder="#000000"
                  className="font-mono text-xs"
                  value={watch('color')}
                  onChange={(e) => control.setValue('color', e.target.value)}
                  disabled={crud.store.isSaving}
                />
              </div>
              <FormInputError error={errors.color} />
            </div>

            <div className="space-y-1">
              <Label htmlFor="displayOrder" required={true}>
                Orden de Visualización
              </Label>
              <Input
                id="displayOrder"
                type="number"
                placeholder="0"
                min="0"
                step="1"
                className="mt-1"
                {...register('displayOrder', { valueAsNumber: true })}
                disabled={crud.store.isSaving}
              />
              <p className="text-xs text-gray-500">Los números menores aparecen primero</p>
              <FormInputError error={errors.displayOrder} />
            </div>
          </div>
        </div>

        {/* Actions Section */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-center justify-end">
            <div className="flex items-center gap-3">
              {onCancel && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onCancel} 
                  disabled={crud.store.isSaving}
                  className="min-w-[80px]"
                >
                  Cancelar
                </Button>
              )}
              <Button 
                type="submit" 
                disabled={crud.store.isSaving}
                className="min-w-[100px]"
              >
                {crud.store.isSaving
                  ? mode === CrudMode.EDIT
                    ? 'Actualizando...'
                    : 'Creando...'
                  : mode === CrudMode.EDIT
                  ? 'Actualizar Categoría'
                  : 'Crear Categoría'}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};